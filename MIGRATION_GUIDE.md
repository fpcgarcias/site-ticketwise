# 🚀 Guia de Migração: Supabase → Neon

## 📋 Visão Geral

Este guia detalha a migração completa do **Site Ticket Wise** do Supabase para o Neon, incluindo banco de dados, autenticação e Edge Functions.

## 🎯 O que será migrado

### ✅ **Banco de Dados** (Totalmente Compatível)
- **Tabelas**: `companies`, `users`, `stripe_customers`, `stripe_subscriptions`, `stripe_orders`
- **Views**: `stripe_user_subscriptions`, `stripe_user_orders`
- **Enums**: `stripe_subscription_status`, `stripe_order_status`
- **Índices**: Todos os índices de performance
- **Triggers**: Função `updated_at` automática

### 🔄 **Edge Functions → API Backend**
1. `create-test-coupons` - Criar cupons de teste no Stripe
2. `save-company-registration` - Salvar dados após checkout
3. `send-contact-form` - Enviar e-mails via Brevo
4. `stripe-checkout` - Criar sessões de checkout
5. `stripe-webhook` - Processar webhooks do Stripe
6. `stripe-products` - Listar produtos do Stripe
7. `stripe-prices` - Listar preços do Stripe

### 🔐 **Autenticação**
- Implementar sistema JWT próprio
- Substituir consultas diretas do Supabase

---

## 🛠️ Passo a Passo da Migração

### **1. Configurar Neon Database**

#### 1.1 Criar Projeto no Neon
```bash
# Acesse: https://console.neon.tech/
# Crie um novo projeto: "Site Ticket Wise"
```

#### 1.2 Executar Migração SQL
```bash
# Execute o arquivo neon-migration.sql no console do Neon
# Ou via psql:
psql "postgresql://[user]:[password]@[host]/[database]?sslmode=require" -f neon-migration.sql
```

### **2. Criar API Backend (Node.js/Express)**

#### 2.1 Estrutura do Projeto
```
backend/
├── src/
│   ├── controllers/
│   │   ├── auth.js
│   │   ├── stripe.js
│   │   └── contact.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── stripe.js
│   │   └── contact.js
│   ├── config/
│   │   └── database.js
│   └── app.js
├── package.json
└── .env
```

#### 2.2 Dependências Principais
```json
{
  "dependencies": {
    "express": "^4.18.0",
    "pg": "^8.11.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0",
    "stripe": "^14.0.0",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "dotenv": "^16.0.0"
  }
}
```

### **3. Implementar Autenticação JWT**

#### 3.1 Middleware de Autenticação
```javascript
// middleware/auth.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};
```

### **4. Migrar Edge Functions**

#### 4.1 Endpoints da Nova API
```
POST /api/auth/login
POST /api/auth/register
POST /api/stripe/checkout
POST /api/stripe/webhook
GET  /api/stripe/products
GET  /api/stripe/prices
POST /api/contact/send
POST /api/company/register
```

### **5. Atualizar Frontend**

#### 5.1 Substituir Cliente Supabase
```javascript
// lib/api.js (novo)
const API_BASE_URL = process.env.VITE_API_URL;

export const api = {
  async post(endpoint, data) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(data)
    });
    return response.json();
  },
  
  async get(endpoint) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.json();
  }
};
```

#### 5.2 Atualizar Hooks
```javascript
// hooks/useSubscription.ts (atualizado)
import { useEffect, useState } from 'react';
import { api } from '../lib/api';

export function useSubscription() {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getSubscription() {
      try {
        const data = await api.get('/api/stripe/subscription');
        setSubscription(data);
      } catch (error) {
        console.error('Erro ao buscar subscription:', error);
      } finally {
        setLoading(false);
      }
    }

    getSubscription();
  }, []);

  return { subscription, loading };
}
```

### **6. Variáveis de Ambiente**

#### 6.1 Backend (.env)
```env
# Database
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require

# JWT
JWT_SECRET=your-super-secret-jwt-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Brevo
BREVO_API_KEY=your-brevo-api-key

# Server
PORT=3001
NODE_ENV=production
```

#### 6.2 Frontend (.env)
```env
# API
VITE_API_URL=http://localhost:3001

# Stripe Public
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

---

## 🔍 **Checklist de Migração**

### ✅ **Banco de Dados**
- [ ] Criar projeto no Neon
- [ ] Executar script `neon-migration.sql`
- [ ] Testar conexão e consultas
- [ ] Verificar índices e performance

### ✅ **API Backend**
- [ ] Configurar projeto Node.js/Express
- [ ] Implementar autenticação JWT
- [ ] Migrar todas as 7 Edge Functions
- [ ] Configurar webhooks do Stripe
- [ ] Testar todos os endpoints

### ✅ **Frontend**
- [ ] Remover dependência `@supabase/supabase-js`
- [ ] Criar cliente API próprio
- [ ] Atualizar todos os hooks e páginas
- [ ] Implementar sistema de login/logout
- [ ] Testar todas as funcionalidades

### ✅ **Deploy e Configuração**
- [ ] Deploy da API (Railway, Render, etc.)
- [ ] Configurar variáveis de ambiente
- [ ] Atualizar webhooks do Stripe
- [ ] Testar em produção

---

## 🚨 **Pontos de Atenção**

1. **Backup**: Faça backup completo dos dados do Supabase antes da migração
2. **Webhooks**: Atualize URLs dos webhooks no Stripe
3. **CORS**: Configure CORS adequadamente na API
4. **SSL**: Use conexões SSL para o Neon em produção
5. **Rate Limiting**: Implemente rate limiting na API
6. **Logs**: Configure logs adequados para monitoramento

---

## 🎉 **Vantagens da Migração**

- ✅ **Performance**: Neon oferece melhor performance
- ✅ **Escalabilidade**: Escala automaticamente
- ✅ **Sem Hibernação**: Banco sempre ativo
- ✅ **Backups**: Backups automáticos
- ✅ **Controle Total**: Controle completo sobre autenticação e API
- ✅ **Custos**: Potencial redução de custos

---

## 📞 **Próximos Passos**

1. **Executar migração SQL no Neon**
2. **Criar API backend**
3. **Testar funcionalidades**
4. **Deploy em produção**

---

*Migração preparada para o Site Ticket Wise - Janeiro 2025*