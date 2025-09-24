-- =====================================================
-- MIGRAÇÃO COMPLETA DO SUPABASE PARA NEON
-- Site Ticket Wise - Database Migration Script
-- =====================================================

-- Criar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. TABELA COMPANIES
-- =====================================================
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    phone VARCHAR(20),
    domain VARCHAR(255) UNIQUE,
    plan_contracted VARCHAR(50),
    employee_count INTEGER,
    additional_agents INTEGER DEFAULT 0,
    ticket_package VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para companies
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_plan_contracted ON companies(plan_contracted);

-- Comentários explicativos
COMMENT ON COLUMN companies.plan_contracted IS 'Plano contratado pela empresa (starter, professional, enterprise)';
COMMENT ON COLUMN companies.employee_count IS 'Número de funcionários da empresa';
COMMENT ON COLUMN companies.additional_agents IS 'Agentes adicionais contratados além do plano base';
COMMENT ON COLUMN companies.ticket_package IS 'Pacote de tickets contratado';
COMMENT ON COLUMN companies.domain IS 'Domínio personalizado da empresa';

-- =====================================================
-- 2. TABELA USERS
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID REFERENCES companies(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para users
CREATE INDEX IF NOT EXISTS idx_users_company_id ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- =====================================================
-- 3. ENUMS PARA STRIPE
-- =====================================================
CREATE TYPE stripe_subscription_status AS ENUM (
    'active',
    'canceled',
    'incomplete',
    'incomplete_expired',
    'past_due',
    'trialing',
    'unpaid'
);

CREATE TYPE stripe_order_status AS ENUM (
    'pending',
    'processing',
    'completed',
    'canceled',
    'refunded'
);

-- =====================================================
-- 4. TABELA STRIPE_CUSTOMERS
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para stripe_customers
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);

-- =====================================================
-- 5. TABELA STRIPE_SUBSCRIPTIONS
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
    stripe_customer_id VARCHAR(255) NOT NULL,
    status stripe_subscription_status NOT NULL,
    price_id VARCHAR(255),
    current_period_start BIGINT,
    current_period_end BIGINT,
    cancel_at_period_end BOOLEAN DEFAULT false,
    payment_method_brand VARCHAR(50),
    payment_method_last4 VARCHAR(4),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para stripe_subscriptions
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_customer_id ON stripe_subscriptions(stripe_customer_id);

-- =====================================================
-- 6. TABELA STRIPE_ORDERS
-- =====================================================
CREATE TABLE IF NOT EXISTS stripe_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    checkout_session_id VARCHAR(255) UNIQUE NOT NULL,
    payment_intent_id VARCHAR(255),
    stripe_customer_id VARCHAR(255) NOT NULL,
    status stripe_order_status DEFAULT 'pending',
    amount_total BIGINT,
    amount_subtotal BIGINT,
    currency VARCHAR(3) DEFAULT 'brl',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para stripe_orders
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user_id ON stripe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_checkout_session ON stripe_orders(checkout_session_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_payment_intent ON stripe_orders(payment_intent_id);

-- =====================================================
-- 7. VIEWS PARA STRIPE
-- =====================================================

-- View para subscriptions do usuário
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
SELECT 
    s.id,
    s.user_id,
    s.stripe_subscription_id AS subscription_id,
    s.status AS subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4,
    s.created_at,
    s.updated_at
FROM stripe_subscriptions s;

-- View para orders do usuário
CREATE OR REPLACE VIEW stripe_user_orders AS
SELECT 
    o.id,
    o.user_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.stripe_customer_id,
    o.status,
    o.amount_total,
    o.amount_subtotal,
    o.currency,
    o.created_at,
    o.updated_at
FROM stripe_orders o;

-- =====================================================
-- 8. FUNÇÕES DE TRIGGER PARA UPDATED_AT
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers para updated_at
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at BEFORE UPDATE ON stripe_customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_subscriptions_updated_at BEFORE UPDATE ON stripe_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_orders_updated_at BEFORE UPDATE ON stripe_orders
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 9. DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================
-- Inserir empresa de exemplo
-- INSERT INTO companies (name, email, cnpj, phone, domain, plan_contracted, employee_count)
-- VALUES ('Empresa Exemplo', 'contato@exemplo.com', '12.345.678/0001-90', '(11) 99999-9999', 'exemplo.com', 'professional', 50);

-- =====================================================
-- FIM DA MIGRAÇÃO
-- =====================================================