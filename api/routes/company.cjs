const express = require('express');
const { neon } = require('@neondatabase/serverless');
const { authenticateToken } = require('../middleware/auth.cjs');
require('dotenv').config({ path: '../../.env' });

const router = express.Router();
const sql = neon(process.env.DATABASE_URL);

// Rota para registrar empresa após pagamento Stripe
router.post('/register', async (req, res) => {
  try {
    const { session_id, registration_data } = req.body;

    if (!session_id || !registration_data) {
      return res.status(400).json({
        success: false,
        error: 'session_id e registration_data são obrigatórios'
      });
    }

    const { name, email, password, phone } = registration_data;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email e senha são obrigatórios'
      });
    }

    // Verificar sessão do Stripe
    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session || session.payment_status !== 'paid') {
      return res.status(400).json({
        success: false,
        error: 'Pagamento não confirmado'
      });
    }

    // Verificar se empresa já existe
    const existingCompany = await sql`
      SELECT id FROM companies WHERE email = ${email}
    `;

    if (existingCompany.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Empresa já cadastrada com este email'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Usuário já cadastrado com este email'
      });
    }

    // Hash da senha
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir empresa
    const companyResult = await sql`
      INSERT INTO companies (name, email, phone, created_at)
      VALUES (${name}, ${email}, ${phone || null}, NOW())
      RETURNING id, name, email, phone, created_at
    `;

    const company = companyResult[0];

    // Inserir usuário
    const userResult = await sql`
      INSERT INTO users (name, email, username, password_hash, role, company_id, is_active, created_at, updated_at)
      VALUES (${name}, ${email}, ${email}, ${hashedPassword}, 'admin', ${company.id}, true, NOW(), NOW())
      RETURNING id, name, email, username, role, company_id, is_active, created_at
    `;

    const user = userResult[0];

    // Salvar dados do Stripe
    await sql`
      INSERT INTO stripe_customers (customer_id, email, name, created_at)
      VALUES (${session.customer}, ${email}, ${name}, NOW())
    `;

    await sql`
      INSERT INTO stripe_orders (session_id, customer_id, amount_total, currency, payment_status, created_at)
      VALUES (${session_id}, ${session.customer}, ${session.amount_total}, ${session.currency}, ${session.payment_status}, NOW())
    `;

    if (session.subscription) {
      await sql`
        INSERT INTO stripe_subscriptions (subscription_id, customer_id, status, current_period_start, current_period_end, created_at)
        VALUES (${session.subscription}, ${session.customer}, 'active', to_timestamp(${session.subscription_data?.current_period_start || Math.floor(Date.now() / 1000)}), to_timestamp(${session.subscription_data?.current_period_end || Math.floor(Date.now() / 1000) + 2592000}), NOW())
      `;
    }

    res.status(201).json({
      success: true,
      company_id: company.id,
      user_id: user.id,
      message: 'Empresa e usuário registrados com sucesso',
      data: {
        company,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          company_id: user.company_id
        }
      }
    });

  } catch (error) {
    console.error('Erro ao registrar empresa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor: ' + error.message
    });
  }
});

// Rota para listar empresas (protegida)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const companies = await sql`
      SELECT id, name, email, phone, created_at
      FROM companies
      ORDER BY created_at DESC
    `;

    res.json({
      success: true,
      data: companies
    });

  } catch (error) {
    console.error('Erro ao listar empresas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para obter empresa por ID (protegida)
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const company = await sql`
      SELECT id, name, email, phone, created_at
      FROM companies
      WHERE id = ${id}
    `;

    if (company.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Empresa não encontrada'
      });
    }

    res.json({
      success: true,
      data: company[0]
    });

  } catch (error) {
    console.error('Erro ao buscar empresa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;