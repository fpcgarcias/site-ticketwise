const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigration(specificMigration = null) {
  console.log('🚀 Iniciando sistema de migração do banco de dados...');
  
  // Verificar se DATABASE_URL existe
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no .env');
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL);

  try {
    console.log('✅ Conectado ao Neon Database');

    // Criar tabela de controle de migrações se não existir
    await sql`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        migration_name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      )
    `;

    // Se uma migração específica foi solicitada
    if (specificMigration) {
      await runSpecificMigration(sql, specificMigration);
      return;
    }

    // Executar migração principal primeiro se necessário
    await runMainMigration(sql);

    // Executar migrações numeradas em ordem
    await runNumberedMigrations(sql);

  } catch (error) {
    console.error('❌ Erro no sistema de migração:', error.message);
    process.exit(1);
  }
}

async function runMainMigration(sql) {
  const migrationName = 'neon-migration.sql';
  
  // Verificar se a migração principal já foi executada
  const executed = await sql`
    SELECT * FROM schema_migrations WHERE migration_name = ${migrationName}
  `;

  if (executed.length > 0) {
    console.log('✅ Migração principal já executada');
    return;
  }

  console.log('📦 Executando migração principal...');
  
  const migrationPath = path.join(__dirname, '..', migrationName);
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Arquivo de migração principal não encontrado: ${migrationPath}`);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    await sql.unsafe(migrationSQL);
    
    // Registrar migração como executada
    await sql`
      INSERT INTO schema_migrations (migration_name) VALUES (${migrationName})
    `;
    
    console.log('✅ Migração principal executada com sucesso!');
    console.log('📊 Tabelas criadas: companies, users, stripe_customers, stripe_subscriptions, stripe_orders');
    
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('ℹ️  Tabelas já existem - registrando migração...');
      await sql`
        INSERT INTO schema_migrations (migration_name) VALUES (${migrationName})
        ON CONFLICT (migration_name) DO NOTHING
      `;
    } else {
      throw error;
    }
  }
}

async function runNumberedMigrations(sql) {
  const migrationsDir = path.join(__dirname, '..', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.log('ℹ️  Pasta migrations não encontrada - criando...');
    fs.mkdirSync(migrationsDir, { recursive: true });
    return;
  }

  // Listar arquivos de migração numerados
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.match(/^\d+_.*\.sql$/))
    .sort((a, b) => {
      const numA = parseInt(a.split('_')[0]);
      const numB = parseInt(b.split('_')[0]);
      return numA - numB;
    });

  if (migrationFiles.length === 0) {
    console.log('ℹ️  Nenhuma migração numerada encontrada');
    return;
  }

  console.log(`📦 Encontradas ${migrationFiles.length} migrações numeradas`);

  for (const file of migrationFiles) {
    const executed = await sql`
      SELECT * FROM schema_migrations WHERE migration_name = ${file}
    `;

    if (executed.length > 0) {
      console.log(`⏭️  Migração ${file} já executada - pulando`);
      continue;
    }

    console.log(`🔄 Executando migração: ${file}`);
    
    const migrationPath = path.join(migrationsDir, file);
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    try {
      await sql.unsafe(migrationSQL);
      
      // Registrar migração como executada
      await sql`
        INSERT INTO schema_migrations (migration_name) VALUES (${file})
      `;
      
      console.log(`✅ Migração ${file} executada com sucesso!`);
      
    } catch (error) {
      console.error(`❌ Erro na migração ${file}:`, error.message);
      throw error;
    }
  }
}

async function runSpecificMigration(sql, migrationFile) {
  console.log(`📦 Executando migração específica: ${migrationFile}`);
  
  let migrationPath;
  
  // Verificar se é uma migração numerada
  if (migrationFile.match(/^\d+_.*\.sql$/)) {
    migrationPath = path.join(__dirname, '..', 'migrations', migrationFile);
  } else {
    migrationPath = path.join(__dirname, '..', migrationFile);
  }
  
  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Arquivo de migração não encontrado: ${migrationPath}`);
    process.exit(1);
  }
  
  const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

  try {
    await sql.unsafe(migrationSQL);
    
    // Registrar migração como executada
    await sql`
      INSERT INTO schema_migrations (migration_name) VALUES (${migrationFile})
      ON CONFLICT (migration_name) DO NOTHING
    `;
    
    console.log(`✅ Migração ${migrationFile} executada com sucesso!`);
    
  } catch (error) {
    console.error(`❌ Erro na migração ${migrationFile}:`, error.message);
    throw error;
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  require('dotenv').config();
  
  // Pegar o arquivo de migração específica dos argumentos da linha de comando
  const specificMigration = process.argv[2] || null;
  
  runMigration(specificMigration).catch(console.error);
}

module.exports = { runMigration };