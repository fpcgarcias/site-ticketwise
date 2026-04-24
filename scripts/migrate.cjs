const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function tableExists(sql, tableName) {
  const rows = await sql`
    SELECT to_regclass(${`public.${tableName}`}) AS table_name
  `;
  return Boolean(rows[0]?.table_name);
}

async function ensureCustomHostnamesTable(sql) {
  await sql`
    CREATE EXTENSION IF NOT EXISTS pgcrypto
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS public.company_custom_hostnames (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
      hostname VARCHAR(255) NOT NULL,
      cloudflare_hostname_id VARCHAR(64),
      status VARCHAR(32) NOT NULL DEFAULT 'pending',
      ssl_status VARCHAR(32) NOT NULL DEFAULT 'pending_validation',
      ssl_method VARCHAR(16) NOT NULL DEFAULT 'http',
      ownership_verification JSONB,
      validation_records JSONB,
      verification_errors JSONB,
      is_primary BOOLEAN NOT NULL DEFAULT TRUE,
      last_checked_at TIMESTAMPTZ,
      activated_at TIMESTAMPTZ,
      email_notified_active_at TIMESTAMPTZ,
      email_notified_timeout_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      deleted_at TIMESTAMPTZ
    )
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_company_custom_hostnames_hostname_active
      ON public.company_custom_hostnames (LOWER(hostname))
      WHERE deleted_at IS NULL
  `;

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS uq_company_primary_custom_hostname
      ON public.company_custom_hostnames (company_id)
      WHERE is_primary = TRUE AND deleted_at IS NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_company_custom_hostnames_company_id
      ON public.company_custom_hostnames (company_id)
      WHERE deleted_at IS NULL
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_company_custom_hostnames_cf_id
      ON public.company_custom_hostnames (cloudflare_hostname_id)
      WHERE deleted_at IS NULL
  `;
}

async function isMigrationHealthy(sql, migrationName) {
  if (migrationName === '005_create_custom_hostnames.sql') {
    return tableExists(sql, 'company_custom_hostnames');
  }
  return true;
}

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
      const healthy = await isMigrationHealthy(sql, file);
      if (healthy) {
        console.log(`⏭️  Migração ${file} já executada - pulando`);
        continue;
      }

      console.log(`⚠️  Migração ${file} marcada como executada, mas objeto esperado não existe. Reexecutando...`);
      await sql`
        DELETE FROM schema_migrations WHERE migration_name = ${file}
      `;
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

      const healthyAfterRun = await isMigrationHealthy(sql, file);
      if (!healthyAfterRun) {
        if (file === '005_create_custom_hostnames.sql') {
          console.log('⚠️  Fallback automático: criando public.company_custom_hostnames diretamente...');
          await ensureCustomHostnamesTable(sql);
        }
      }

      const healthyAfterFallback = await isMigrationHealthy(sql, file);
      if (!healthyAfterFallback) {
        throw new Error(`Migração ${file} executada, porém objeto esperado não foi encontrado`);
      }
      
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

    const healthyAfterRun = await isMigrationHealthy(sql, migrationFile);
    if (!healthyAfterRun) {
      if (migrationFile === '005_create_custom_hostnames.sql') {
        console.log('⚠️  Fallback automático: criando public.company_custom_hostnames diretamente...');
        await ensureCustomHostnamesTable(sql);
      }
    }

    const healthyAfterFallback = await isMigrationHealthy(sql, migrationFile);
    if (!healthyAfterFallback) {
      throw new Error(`Migração ${migrationFile} executada, porém objeto esperado não foi encontrado`);
    }
    
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