-- Migração 002: Criar tabelas do Stripe
-- Data: 2024-12-29

-- Tabela de clientes do Stripe
CREATE TABLE IF NOT EXISTS stripe_customers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de assinaturas do Stripe
CREATE TABLE IF NOT EXISTS stripe_subscriptions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stripe_customer_id VARCHAR(255) NOT NULL REFERENCES stripe_customers(stripe_customer_id) ON DELETE CASCADE,
    stripe_subscription_id VARCHAR(255) NOT NULL UNIQUE,
    status VARCHAR(50) NOT NULL,
    price_id VARCHAR(255),
    current_period_start INTEGER,
    current_period_end INTEGER,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    payment_method_brand VARCHAR(50),
    payment_method_last4 VARCHAR(4),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Tabela de pedidos/faturas do Stripe
CREATE TABLE IF NOT EXISTS stripe_orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    checkout_session_id VARCHAR(255),
    payment_intent_id VARCHAR(255),
    status VARCHAR(50) NOT NULL,
    amount_total INTEGER NOT NULL,
    amount_subtotal INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'BRL',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_user_id ON stripe_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_subscriptions_stripe_id ON stripe_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_user_id ON stripe_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_orders_created_at ON stripe_orders(created_at);

-- Comentários nas tabelas
COMMENT ON TABLE stripe_customers IS 'Clientes do Stripe vinculados aos usuários do sistema';
COMMENT ON TABLE stripe_subscriptions IS 'Assinaturas do Stripe dos usuários';
COMMENT ON TABLE stripe_orders IS 'Pedidos e faturas do Stripe';
