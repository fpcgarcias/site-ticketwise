/*
  # Add Company Registration Fields
  
  Adiciona campos necessários para o registro de empresas vindas do checkout:
  - plan_contracted: Plano contratado (basic_monthly, pro_annual, etc.)
  - employee_count: Número de funcionários (1-10, 11-50, etc.)
  - additional_agents: Número de atendentes adicionais contratados
  - ticket_package: Pacote de tickets contratado
  - domain: Domínio da empresa (separado do email)
*/

-- Adicionar novas colunas na tabela companies
ALTER TABLE companies 
ADD COLUMN IF NOT EXISTS plan_contracted text,
ADD COLUMN IF NOT EXISTS employee_count text,
ADD COLUMN IF NOT EXISTS additional_agents integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS ticket_package text,
ADD COLUMN IF NOT EXISTS domain text;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_companies_cnpj ON companies(cnpj);
CREATE INDEX IF NOT EXISTS idx_companies_domain ON companies(domain);
CREATE INDEX IF NOT EXISTS idx_companies_plan ON companies(plan_contracted);

-- Comentários para documentação
COMMENT ON COLUMN companies.plan_contracted IS 'Plano contratado no Stripe (ex: basic_monthly, pro_annual)';
COMMENT ON COLUMN companies.employee_count IS 'Faixa de funcionários (ex: 1-10, 11-50, 51-200)';
COMMENT ON COLUMN companies.additional_agents IS 'Número de atendentes adicionais contratados';
COMMENT ON COLUMN companies.ticket_package IS 'Pacote de tickets contratado';
COMMENT ON COLUMN companies.domain IS 'Domínio da empresa (ex: empresa.com)'; 