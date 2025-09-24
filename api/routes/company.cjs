const express = require('express');
const { neon } = require('@neondatabase/serverless');
const { authenticateToken } = require('../middleware/auth.cjs');

const router = express.Router();
const sql = neon(process.env.DATABASE_URL);

// Rota para registrar empresa
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, website, description } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        error: 'Nome e email são obrigatórios'
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

    // Inserir nova empresa
    const result = await sql`
      INSERT INTO companies (name, email, phone, website, description, created_at)
      VALUES (${name}, ${email}, ${phone || null}, ${website || null}, ${description || null}, NOW())
      RETURNING id, name, email, phone, website, description, created_at
    `;

    res.status(201).json({
      success: true,
      data: result[0],
      message: 'Empresa registrada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao registrar empresa:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para listar empresas (protegida)
router.get('/list', authenticateToken, async (req, res) => {
  try {
    const companies = await sql`
      SELECT id, name, email, phone, website, description, created_at
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
      SELECT id, name, email, phone, website, description, created_at
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