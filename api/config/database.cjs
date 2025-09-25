const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '../../.env' });

// Configurar conexão com Neon
const sql = neon(process.env.DATABASE_URL);

module.exports = { sql };
