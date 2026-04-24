-- Migração 005: Custom hostnames (Cloudflare SSL for SaaS) por empresa
-- Schema 1-N preparado; apenas um registro primário ativo por company_id.

CREATE TABLE IF NOT EXISTS company_custom_hostnames (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    hostname VARCHAR(255) NOT NULL,
    cloudflare_hostname_id VARCHAR(64),
    status VARCHAR(32) NOT NULL DEFAULT 'pending',
    ssl_status VARCHAR(32) NOT NULL DEFAULT 'pending_validation',
    ssl_method VARCHAR(16) NOT NULL DEFAULT 'http',
    ownership_verification JSONB,
    validation_records JSONB,
    verification_errors JSONB,
    is_primary BOOLEAN NOT NULL DEFAULT TRUE,
    last_checked_at TIMESTAMPTZ,
    activated_at TIMESTAMPTZ,
    email_notified_active_at TIMESTAMPTZ,
    email_notified_timeout_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_company_custom_hostnames_hostname_active
    ON company_custom_hostnames (LOWER(hostname))
    WHERE deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_company_primary_custom_hostname
    ON company_custom_hostnames (company_id)
    WHERE is_primary = TRUE AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_company_custom_hostnames_company_id
    ON company_custom_hostnames (company_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_company_custom_hostnames_cf_id
    ON company_custom_hostnames (cloudflare_hostname_id)
    WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_company_custom_hostnames_poll
    ON company_custom_hostnames (created_at, status, ssl_status)
    WHERE deleted_at IS NULL;

COMMENT ON TABLE company_custom_hostnames IS 'Hostnames personalizados (Cloudflare Custom Hostnames) vinculados à empresa';

-- Trigger updated_at (função já criada em neon-migration.sql)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column'
    ) THEN
        DROP TRIGGER IF EXISTS update_company_custom_hostnames_updated_at ON company_custom_hostnames;
        CREATE TRIGGER update_company_custom_hostnames_updated_at
            BEFORE UPDATE ON company_custom_hostnames
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;
