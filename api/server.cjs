const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Conexão com banco de dados
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Testar conexão
pool.connect()
  .then(() => console.log('✅ Conectado ao Neon Database'))
  .catch(err => console.error('❌ Erro ao conectar ao banco:', err));

// Rotas públicas
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'Site Ticket Wise API',
    version: '1.0.0'
  });
});

// Importar e usar rotas
const authRoutes = require('./routes/auth.cjs');
const stripeRoutes = require('./routes/stripe.cjs');
const companyRoutes = require('./routes/company.cjs');
const contactRoutes = require('./routes/contact.cjs');

// Rotas de autenticação (públicas)
app.use('/api/auth', authRoutes);

// Rotas de contato (públicas)
app.use('/api/contact', contactRoutes);

// Rotas protegidas
app.use('/api/stripe', stripeRoutes);
app.use('/api/company', companyRoutes);

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  
  // Erro de validação do Joi ou similar
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: 'Dados inválidos',
      details: error.message
    });
  }
  
  // Erro de banco de dados
  if (error.code && error.code.startsWith('23')) {
    return res.status(400).json({
      success: false,
      error: 'Erro de integridade dos dados'
    });
  }

  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// 404 Handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `Endpoint não encontrado: ${req.method} ${req.originalUrl}`
  });
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Recebido SIGTERM, encerrando servidor...');
  pool.end(() => {
    console.log('📦 Pool de conexões encerrado');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  pool.end(() => {
    console.log('📦 Pool de conexões encerrado');
    process.exit(0);
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`📧 Contact endpoints: http://localhost:${PORT}/api/contact/*`);
  console.log(`💳 Stripe endpoints: http://localhost:${PORT}/api/stripe/*`);
  console.log(`🏢 Company endpoints: http://localhost:${PORT}/api/company/*`);
});