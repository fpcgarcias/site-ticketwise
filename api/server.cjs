const path = require('path');
const express = require('express');
const cors = require('cors');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));
// Stripe webhook precisa de body raw para validar assinatura
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Middleware de logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Conexão com banco de dados (Neon Serverless)
const sql = neon(process.env.DATABASE_URL);
(async () => {
  try {
    await sql`SELECT 1`;
    console.log('✅ Conectado ao Neon Database');
  } catch (err) {
    console.error('❌ Erro ao conectar ao banco:', err);
  }
})();

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
const subscriptionRoutes = require('./routes/subscription.cjs');
const companyRoutes = require('./routes/company.cjs');
const contactRoutes = require('./routes/contact.cjs');
const customHostnameRoutes = require('./routes/custom-hostname.cjs');
const { startCustomHostnamePoller } = require('./services/custom-hostname-poller.cjs');

// Rotas de autenticação (públicas)
app.use('/api/auth', authRoutes);

// Rotas de contato (públicas)
app.use('/api/contact', contactRoutes);

// Rotas protegidas
app.use('/api/stripe', stripeRoutes);
app.use('/api/subscription', subscriptionRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/custom-hostname', customHostnameRoutes);

// Log das rotas registradas
console.log('🔐 Subscription endpoints: http://localhost:3001/api/subscription/*');

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
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth/*`);
  console.log(`📧 Contact endpoints: http://localhost:${PORT}/api/contact/*`);
  console.log(`💳 Stripe endpoints: http://localhost:${PORT}/api/stripe/*`);
  console.log(`🏢 Company endpoints: http://localhost:${PORT}/api/company/*`);
  console.log(`🌐 Custom hostname: http://localhost:${PORT}/api/custom-hostname/*`);
  startCustomHostnamePoller();
});
