const express = require('express');
const cors = require('cors');
const path = require('path');

// Carregar variáveis de ambiente do arquivo .env na raiz do projeto
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.API_PORT || 3001;

// Middlewares básicos
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5174',
  credentials: true
}));

app.use(express.json());

// Importar rotas
const stripeRoutes = require('./routes/stripe.cjs');
const subscriptionRoutes = require('./routes/subscription.cjs');

// Usar as rotas
app.use('/api/stripe', stripeRoutes);
app.use('/api', subscriptionRoutes);

// Rota de teste
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'API funcionando',
    timestamp: new Date().toISOString()
  });
});

// Rota simples de teste
app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'Teste da API'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro na API:', error);
  res.status(500).json({
    success: false,
    error: 'Erro interno do servidor'
  });
});

// Handler 404
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint não encontrado'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor da API rodando na porta ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;