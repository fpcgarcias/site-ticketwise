-- =====================================================
-- MIGRAÇÃO: Adicionar coluna deleted_at
-- Data: 2025-01-25
-- Descrição: Adiciona a coluna deleted_at às tabelas users e stripe_customers
-- =====================================================

-- Adicionar coluna deleted_at à tabela users
ALTER TABLE users 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Adicionar coluna deleted_at à tabela stripe_customers
ALTER TABLE stripe_customers 
ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Comentários explicativos
COMMENT ON COLUMN users.deleted_at IS 'Timestamp de quando o usuário foi marcado como deletado (soft delete)';
COMMENT ON COLUMN stripe_customers.deleted_at IS 'Timestamp de quando o cliente Stripe foi marcado como deletado (soft delete)';