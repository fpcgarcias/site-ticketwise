const { spawn } = require('child_process');
const path = require('path');

// Carregar variáveis de ambiente
require('dotenv').config();

async function runMigration() {
  console.log('🔄 Executando migração do banco de dados...');
  
  return new Promise((resolve, reject) => {
    const migrationScript = spawn('node', [path.join(__dirname, 'migrate.cjs')], {
      stdio: 'inherit',
      cwd: process.cwd()
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

async function startServers() {
  console.log('🚀 Iniciando servidores...');
  
  // Iniciar servidor da API
  const apiServer = spawn('node', ['api/server.cjs'], {
    stdio: 'inherit',
    shell: true
  });

  // Aguardar um pouco antes de iniciar o Vite
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Iniciar servidor Vite
  const viteServer = spawn('npm', ['run', 'dev:vite'], {
    stdio: 'inherit',
    shell: true
  });

  // Handlers para encerramento gracioso
  const cleanup = () => {
    console.log('\n🛑 Encerrando servidores...');
    apiServer.kill('SIGTERM');
    viteServer.kill('SIGTERM');
    process.exit(0);
  };

  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  // Aguardar os processos
  apiServer.on('close', (code) => {
    console.log(`API server encerrado com código ${code}`);
  });

  viteServer.on('close', (code) => {
    console.log(`Vite server encerrado com código ${code}`);
  });
}

async function main() {
  try {
    console.log('🎯 Site Ticket Wise - Setup de Desenvolvimento');
    console.log('===============================================');
    
    // Executar migração
    await runMigration();
    
    console.log('');
    console.log('🌐 Iniciando servidores de desenvolvimento...');
    console.log('📍 Frontend: http://localhost:5174');
    console.log('🔌 API: http://localhost:3001');
    console.log('');
    
    // Iniciar servidores
    await startServers();
    
  } catch (error) {
    console.error('❌ Erro no setup:', error);
    process.exit(1);
  }
}

main();