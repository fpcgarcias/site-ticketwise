#!/usr/bin/env node
// Script utilitário único: vincula o usuário tatisa.nagata@sellbie.com.br à empresa Sellbie
// (corrige linha deixada pelo bug antigo de processCompanyRegistration).
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { neon } = require('@neondatabase/serverless');

const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL não definido');
  process.exit(1);
}
const sql = neon(url);

const TARGET_EMAIL = process.argv[2] || 'tatisa.nagata@sellbie.com.br';
const TARGET_CNPJ = process.argv[3] || '38973007000162';

(async () => {
  const companies = await sql`
    SELECT id, name, email, cnpj, created_at FROM companies
    WHERE email = ${TARGET_EMAIL} OR cnpj = ${TARGET_CNPJ}
    ORDER BY created_at ASC
  `;
  console.log('Empresas encontradas:', companies);

  const users = await sql`
    SELECT id, email, company_id FROM users WHERE email = ${TARGET_EMAIL}
  `;
  console.log('Usuários encontrados:', users);

  if (!companies.length || !users.length) {
    console.log('Nada a corrigir.');
    return;
  }

  const cid = companies[0].id;
  for (const u of users) {
    if (u.company_id !== cid) {
      await sql`UPDATE users SET company_id = ${cid}, updated_at = NOW() WHERE id = ${u.id}`;
      console.log(`✅ Vinculado user ${u.id} -> company ${cid}`);
    } else {
      console.log(`✔︎ user ${u.id} já estava correto`);
    }
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
