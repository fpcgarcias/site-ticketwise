const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  console.log('🚀 Iniciando migração do banco de dados...');
  
  // Verificar se DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no .env');
    process.exit(1);
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ Conectado ao Neon Database');

    // Verificar se as tabelas já existem
    const checkTables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('companies', 'users', 'stripe_customers', 'stripe_subscriptions', 'stripe_orders')
    `);

    if (checkTables.rows.length >= 5) {
      console.log('✅ Migração já executada - tabelas existem');
      return;
    }

    console.log('📦 Executando migração SQL...');
    
    // Ler arquivo de migração
    const migrationPath = path.join(__dirname, '..', 'neon-migration.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    // Executar migração
    await client.query(migrationSQL);
    
    console.log('✅ Migração executada com sucesso!');
    console.log('📊 Tabelas criadas:');
    console.log('   - companies');
    console.log('   - users');
    console.log('   - stripe_customers');
    console.log('   - stripe_subscriptions');
    console.log('   - stripe_orders');
    console.log('   - Views e índices configurados');

  } catch (error) {
    console.error('❌ Erro na migração:', error.message);
    
    // Se for erro de tabela já existir, não é crítico
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Algumas tabelas já existem - continuando...');
    } else {
      process.exit(1);
    }
  } finally {
    await client.end();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  require('dotenv').config();
  runMigration().catch(console.error);
}

module.exports = { runMigration };