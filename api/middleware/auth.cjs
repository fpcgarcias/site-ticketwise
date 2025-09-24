const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { neon } = require('@neondatabase/serverless');

// Configurar conexão com Neon
const sql = neon(process.env.DATABASE_URL);

// Configurações JWT
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d';

// Gerar tokens JWT
const generateTokens = (userId, email) => {
  const payload = { userId, email };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'site-ticketwise'
  });
  
  const refreshToken = jwt.sign(payload, JWT_SECRET, { 
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: 'site-ticketwise'
  });
  
  return { accessToken, refreshToken };
};

// Hash da senha
const hashPassword = async (password) => {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
};

// Verificar senha
const verifyPassword = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};

// Middleware de autenticação
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Token de acesso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário no banco
    const userResult = await sql`
      SELECT id, email, name, role, company_id, created_at 
      FROM users 
      WHERE id = ${decoded.userId} AND deleted_at IS NULL
    `;
    
    if (userResult.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado ou inativo'
      });
    }

    // Adicionar dados do usuário à requisição
    req.user = userResult[0];
    next();

  } catch (error) {
    console.error('Erro na autenticação:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expirado'
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Erro interno de autenticação'
    });
  }
};

// Middleware de autorização por role
const authorizeRole = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
};

// Middleware opcional de autenticação (não falha se não houver token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userResult = await sql`
        SELECT id, email, name, role, company_id 
        FROM users 
        WHERE id = ${decoded.userId} AND deleted_at IS NULL
      `;
      
      if (userResult.length > 0) {
        req.user = userResult[0];
      }
    }

    next();
  } catch (error) {
    // Ignorar erros de token em auth opcional
    next();
  }
};

// Função para registrar usuário
const registerUser = async (userData) => {
  const { name, email, password, role = 'user', company_id } = userData;
  
  try {
    // Verificar se email já existe
    const existingUser = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existingUser.length > 0) {
      throw new Error('Email já cadastrado');
    }

    // Hash da senha
    const hashedPassword = await hashPassword(password);

    // Inserir usuário
    const result = await sql`
      INSERT INTO users (name, email, password_hash, role, company_id, created_at)
      VALUES (${name}, ${email}, ${hashedPassword}, ${role}, ${company_id}, NOW())
      RETURNING id, name, email, role, company_id, created_at
    `;

    const user = result[0];
    const tokens = generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        created_at: user.created_at
      },
      ...tokens
    };

  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    throw error;
  }
};

// Função para login
const loginUser = async (email, password) => {
  try {
    // Buscar usuário
    const result = await sql`
      SELECT id, name, email, password_hash, role, company_id, created_at 
      FROM users 
      WHERE email = ${email} AND deleted_at IS NULL
    `;
    
    if (result.length === 0) {
      throw new Error('Credenciais inválidas');
    }

    const user = result[0];

    // Verificar senha
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('Credenciais inválidas');
    }

    // Gerar tokens
    const tokens = generateTokens(user.id, user.email);

    // Atualizar último login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company_id: user.company_id,
        created_at: user.created_at
      },
      ...tokens
    };

  } catch (error) {
    console.error('Erro no login:', error);
    throw error;
  }
};

// Função para refresh token
const refreshAccessToken = async (refreshToken) => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET);
    
    // Verificar se usuário ainda existe
    const result = await sql`
      SELECT id, email FROM users WHERE id = ${decoded.userId} AND deleted_at IS NULL
    `;
    
    if (result.length === 0) {
      throw new Error('Usuário não encontrado');
    }

    const user = result[0];
    const tokens = generateTokens(user.id, user.email);

    return tokens;

  } catch (error) {
    console.error('Erro ao renovar token:', error);
    throw error;
  }
};

// Função para logout (invalidar token - opcional, pode ser implementado com blacklist)
const logoutUser = async (userId) => {
  try {
    // Atualizar último logout
    await sql`UPDATE users SET last_logout = NOW() WHERE id = ${userId}`;
    
    // Aqui você pode implementar uma blacklist de tokens se necessário
    // Por simplicidade, apenas atualizamos o timestamp de logout
    
    return { success: true };
  } catch (error) {
    console.error('Erro no logout:', error);
    throw error;
  }
};

module.exports = {
  authenticateToken,
  authorizeRole,
  optionalAuth,
  generateTokens,
  hashPassword,
  verifyPassword,
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
  JWT_SECRET,
  JWT_EXPIRES_IN
};