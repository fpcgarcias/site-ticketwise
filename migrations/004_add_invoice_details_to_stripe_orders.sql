-- Migração 004: Adicionar campos de detalhe de invoice para exibição no dashboard
-- Data: 2026-04-15

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS stripe_invoice_id VARCHAR(255);

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS stripe_status VARCHAR(50);

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMP WITH TIME ZONE;

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS period_start BIGINT;

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS period_end BIGINT;

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS attempt_count INTEGER;

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT;

ALTER TABLE stripe_orders
  ADD COLUMN IF NOT EXISTS invoice_pdf TEXT;

CREATE INDEX IF NOT EXISTS idx_stripe_orders_invoice_id
  ON stripe_orders(stripe_invoice_id);
