-- Migração 003: Corrigir referências no código
-- Data: 2024-12-29

-- NADA PARA FAZER NO BANCO!
-- A tabela users já tem password_hash (não password)
-- A tabela stripe_orders já tem checkout_session_id (não stripe_session_id)

-- Remover constraint NOT NULL da coluna email em stripe_customers se existir
ALTER TABLE stripe_customers ALTER COLUMN email DROP NOT NULL;

-- Esta migração é só para marcar como executada
SELECT 'Migração 003 executada - apenas correções de código necessárias' as status;