const express = require('express');
const { neon } = require('@neondatabase/serverless');
require('dotenv').config({ path: '../../.env' });
const { 
  registerUser, 
  loginUser, 
  refreshAccessToken, 
  logoutUser,
  authenticateToken 
} = require('../middleware/auth.cjs');

// Configurar conexão com Neon
const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// POST /api/auth/register - Registrar novo usuário
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role, company_id } = req.body;

    // Validações básicas
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: name, email, password'
      });
    }

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Formato de email inválido'
      });
    }

    // Validar senha
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Senha deve ter pelo menos 6 caracteres'
      });
    }

    // Confirmar senha
    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senhas não coincidem'
      });
    }

    // Validar role
    const allowedRoles = ['user', 'admin', 'company_admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: 'Role inválido'
      });
    }

    const result = await registerUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'user',
      company_id
    });

    console.log(`Novo usuário registrado: ${result.user.email}`);

    res.status(201).json({
      success: true,
      message: 'Usuário registrado com sucesso',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no registro:', error);
    
    if (error.message === 'Email já cadastrado') {
      return res.status(409).json({
        success: false,
        error: 'Este email já está cadastrado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/login - Login do usuário
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validações básicas
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email e senha são obrigatórios'
      });
    }

    const result = await loginUser(email.toLowerCase().trim(), password);

    console.log(`Login realizado: ${result.user.email}`);

    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken
      }
    });

  } catch (error) {
    console.error('Erro no login:', error);
    
    if (error.message === 'Credenciais inválidas') {
      return res.status(401).json({
        success: false,
        error: 'Email ou senha incorretos'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/refresh - Renovar access token
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        error: 'Refresh token é obrigatório'
      });
    }

    const tokens = await refreshAccessToken(refreshToken);

    res.json({
      success: true,
      message: 'Token renovado com sucesso',
      data: tokens
    });

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Refresh token inválido ou expirado'
      });
    }

    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/logout - Logout do usuário
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    await logoutUser(req.user.id);

    console.log(`Logout realizado: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Logout realizado com sucesso'
    });

  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// GET /api/auth/me - Obter dados do usuário atual
router.get('/me', authenticateToken, async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        user: req.user
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/change-password - Alterar senha
router.post('/change-password', authenticateToken, async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmNewPassword } = req.body;

    // Validações
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual e nova senha são obrigatórias'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Nova senha deve ter pelo menos 6 caracteres'
      });
    }

    if (confirmNewPassword && newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        error: 'Confirmação de senha não confere'
      });
    }

    const { neon } = require('@neondatabase/serverless');
    const { verifyPassword, hashPassword } = require('../middleware/auth');
    
    const sql = neon(process.env.DATABASE_URL);

    // Buscar senha atual
    const userQuery = 'SELECT password_hash FROM users WHERE id = $1';
    const result = await sql`SELECT password_hash FROM users WHERE id = ${req.user.id}`;
    
    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Verificar senha atual
    const isValidPassword = await verifyPassword(currentPassword, result[0].password_hash);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const newPasswordHash = await hashPassword(newPassword);

    // Atualizar senha
    await sql`UPDATE users SET password_hash = ${newPasswordHash}, updated_at = NOW() WHERE id = ${req.user.id}`;

    console.log(`Senha alterada para usuário: ${req.user.email}`);

    res.json({
      success: true,
      message: 'Senha alterada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// POST /api/auth/forgot-password - Solicitar reset de senha (placeholder)
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    // TODO: Implementar envio de email para reset de senha
    // Por enquanto, apenas log
    console.log(`Solicitação de reset de senha para: ${email}`);

    res.json({
      success: true,
      message: 'Se o email estiver cadastrado, você receberá instruções para redefinir sua senha'
    });

  } catch (error) {
    console.error('Erro ao solicitar reset de senha:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para verificar se usuário existe (para checkout)
router.post('/check-user', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email é obrigatório'
      });
    }

    // Verificar se usuário existe
    const existingUser = await sql`
      SELECT id, email, name, company_id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.json({
        success: true,
        userExists: true,
        user: {
          id: existingUser[0].id,
          email: existingUser[0].email,
          name: existingUser[0].name,
          company_id: existingUser[0].company_id
        }
      });
    }

    return res.json({
      success: true,
      userExists: false
    });

  } catch (error) {
    console.error('Erro ao verificar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

// Rota para registro pré-checkout (usuário + empresa)
router.post('/pre-checkout-register', async (req, res) => {
  try {
    const { userData, companyData } = req.body;

    if (!userData || !companyData) {
      return res.status(400).json({
        success: false,
        error: 'Dados do usuário e empresa são obrigatórios'
      });
    }

    const { name, email, password } = userData;
    const { companyName, cnpj, phone } = companyData;

    if (!name || !email || !password || !companyName) {
      return res.status(400).json({
        success: false,
        error: 'Nome, email, senha e nome da empresa são obrigatórios'
      });
    }

    // Verificar se usuário já existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Usuário já cadastrado. Faça login para continuar.',
        shouldLogin: true
      });
    }

    // Verificar se empresa já existe
    const existingCompany = await sql`
      SELECT id FROM companies WHERE email = ${email} OR cnpj = ${cnpj}
    `;

    if (existingCompany.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'Empresa já cadastrada com este email ou CNPJ'
      });
    }

    // Hash da senha
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir empresa
    const companyResult = await sql`
      INSERT INTO companies (name, email, cnpj, phone, created_at)
      VALUES (${companyName}, ${email}, ${cnpj || null}, ${phone || null}, NOW())
      RETURNING id, name, email, cnpj, phone, created_at
    `;

    const company = companyResult[0];

    // Inserir usuário
    const userResult = await sql`
      INSERT INTO users (name, email, username, password_hash, role, company_id, is_active, created_at, updated_at)
      VALUES (${name}, ${email}, ${email}, ${hashedPassword}, 'admin', ${company.id}, true, NOW(), NOW())
      RETURNING id, name, email, username, role, company_id, is_active, created_at
    `;

    const user = userResult[0];

    res.json({
      success: true,
      message: 'Usuário e empresa registrados com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id
      },
      company: {
        id: company.id,
        name: company.name,
        email: company.email,
        cnpj: company.cnpj
      }
    });

  } catch (error) {
    console.error('Erro ao registrar usuário pré-checkout:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
});

module.exports = router;