const { spawn } = require('child_process');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

require('dotenv').config({ path: path.join(projectRoot, '.env') });

async function runMigration() {
  console.log('🔄 Executando migração do banco de dados...');

  return new Promise((resolve, reject) => {
    const migrationScript = spawn('node', [path.join(__dirname, 'migrate.cjs')], {
      stdio: 'inherit',
      cwd: projectRoot,
    });

    migrationScript.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Migração concluída com sucesso!');
        resolve();
      } else {
        console.error('❌ Erro na migração');
        reject(new Error(`Migração falhou com código ${code}`));
      }
    });

    migrationScript.on('error', (error) => {
      console.error('❌ Erro ao executar migração:', error);
      reject(error);
    });
  });
}

/**
 * Produção: migração → API (3001) + vite preview (5174).
 * O proxy em vite.config.ts encaminha /api para localhost:3001.
 */
async function startServers() {
  console.log('🚀 Iniciando API e preview...');

  const apiServer = spawn('node', [path.join(projectRoot, 'api', 'server.cjs')], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  });

  await new Promise((resolve) => setTimeout(resolve, 2000));

  const preview = spawn('npm', ['run', 'preview'], {
    stdio: 'inherit',
    shell: true,
    cwd: projectRoot,
  });

  const cleanup = () => {
    console.log('\n🛑 Encerrando...');
    apiServer.kill('SIGTERM');
    preview.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  apiServer.on('close', (code) => {
    console.log(`API encerrada (código ${code})`);
  });
  preview.on('close', (code) => {
    console.log(`Preview encerrado (código ${code})`);
  });
}

async function main() {
  try {
    console.log('🎯 Site Ticket Wise — produção (start)');
    console.log('========================================');
    await runMigration();
    console.log('');
    await startServers();
  } catch (error) {
    console.error('❌ Erro no start de produção:', error);
    process.exit(1);
  }
}

main();
