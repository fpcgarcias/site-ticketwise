import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import bcrypt from 'npm:bcrypt@6.0.0';
import { Client } from 'https://deno.land/x/postgres@v0.17.0/mod.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');

// Configurações de segurança (compatível com o outro sistema)
const SALT_ROUNDS = 12; // Alto nível de segurança
const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 128;

// Configuração de conexão com Neon
const neonConfig = {
  hostname: 'ep-aged-wildflower-a5jxeizx.us-east-2.aws.neon.tech',
  port: 5432,
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_eI8LfDKd4HRq',
  tls: {
    enforce: false
  } // equivalente a rejectUnauthorized: false
};

async function connectToNeon() {
  // Cria o cliente passando a configuração apropriada ao deno-postgres
  const client = new Client({
    hostname: neonConfig.hostname,
    port: neonConfig.port,
    user: neonConfig.user,
    password: neonConfig.password,
    database: neonConfig.database,
    tls: neonConfig.tls
  });
  await client.connect();
  return client;
}

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'TicketWise Registration',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

interface CompanyData {
  name: string;
  email: string;
  cnpj: string;
  phone?: string;
  domain?: string;
  plan_contracted: string;
  employee_count: string;
  additional_agents?: number;
  ticket_package?: string;
}

interface UserData {
  name: string;
  email: string;
  username: string;
  password: string;
  role: string;
  company_id: number;
}

async function saveCompanyToNeon(companyData: CompanyData): Promise<number> {
  console.log('🏢 [EMPRESA] Iniciando saveCompanyToNeon');
  console.log('🏢 [EMPRESA] Dados recebidos:', {
    name: companyData.name,
    email: companyData.email,
    cnpj: companyData.cnpj,
    phone: companyData.phone,
    domain: companyData.domain,
    plan_contracted: companyData.plan_contracted,
    employee_count: companyData.employee_count,
    additional_agents: companyData.additional_agents,
    ticket_package: companyData.ticket_package
  });

  const client = await connectToNeon();
  
  try {
    console.log('🔍 [EMPRESA] Buscando empresa existente por CNPJ:', companyData.cnpj);
    
    // Usamos queryObject para retornar um array de objetos
    const searchResult = await client.queryObject('SELECT id FROM companies WHERE cnpj = $1', [
      companyData.cnpj
    ]);

    console.log('✅ [EMPRESA] Busca concluída. Empresa existente?', searchResult.rows.length > 0);

    let companyId: number;

    if (searchResult.rows.length > 0) {
      // Atualizar empresa existente
      companyId = searchResult.rows[0].id;
      console.log('🔄 [EMPRESA] Atualizando empresa existente ID:', companyId);
      
      await client.queryObject(`UPDATE companies SET 
         name = $1, email = $2, domain = $3, phone = $4, updated_at = $5
         WHERE id = $6`, [
        companyData.name,
        companyData.email,
        companyData.domain,
        companyData.phone,
        new Date().toISOString(),
        companyId
      ]);
      
      console.log(`✅ [EMPRESA] Empresa atualizada: ID ${companyId}`);
    } else {
      // Criar nova empresa
      console.log('➕ [EMPRESA] Criando nova empresa');
      
      const insertResult = await client.queryObject(`INSERT INTO companies 
         (name, email, cnpj, phone, domain, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`, [
        companyData.name,
        companyData.email,
        companyData.cnpj,
        companyData.phone,
        companyData.domain,
        true,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      
      companyId = insertResult.rows[0].id;
      console.log(`✅ [EMPRESA] Nova empresa criada: ID ${companyId}`);
    }

    return companyId;
    
  } catch (error: any) {
    console.error('💥 [EMPRESA] Erro geral na função saveCompanyToNeon:', error);
    throw error;
  } finally {
    await client.end();
  }
}

async function saveUserToNeon(userData: UserData): Promise<number> {
  console.log('👤 [USUÁRIO] Iniciando saveUserToNeon');
  console.log('👤 [USUÁRIO] Dados recebidos:', {
    name: userData.name,
    email: userData.email,
    username: userData.username,
    role: userData.role,
    company_id: userData.company_id
  });

  // Hash da senha com 12 rounds (mesmo do outro sistema)
  const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
  console.log('🔐 [USUÁRIO] Senha hasheada com sucesso');
  
  const client = await connectToNeon();
  
  try {
    console.log('🔍 [USUÁRIO] Buscando usuário existente por email:', userData.email);
    
    const searchResult = await client.queryObject('SELECT id FROM users WHERE email = $1', [
      userData.email
    ]);

    console.log('✅ [USUÁRIO] Busca concluída. Usuário existente?', searchResult.rows.length > 0);

    let userId: number;

    if (searchResult.rows.length > 0) {
      // Atualizar usuário existente
      userId = searchResult.rows[0].id;
      console.log('🔄 [USUÁRIO] Atualizando usuário existente ID:', userId);
      
      await client.queryObject(`UPDATE users SET 
         name = $1, username = $2, password = $3, role = $4, company_id = $5, updated_at = $6
         WHERE id = $7`, [
        userData.name,
        userData.username,
        hashedPassword,
        userData.role,
        userData.company_id,
        new Date().toISOString(),
        userId
      ]);
      
      console.log(`✅ [USUÁRIO] Usuário atualizado: ID ${userId}`);
    } else {
      // Criar novo usuário
      console.log('➕ [USUÁRIO] Criando novo usuário');
      
      const insertResult = await client.queryObject(`INSERT INTO users 
         (name, email, username, password, role, company_id, active, ad_user, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`, [
        userData.name,
        userData.email,
        userData.username,
        hashedPassword,
        userData.role,
        userData.company_id,
        true,
        false,
        new Date().toISOString(),
        new Date().toISOString()
      ]);
      
      userId = insertResult.rows[0].id;
      console.log(`✅ [USUÁRIO] Novo usuário criado: ID ${userId}`);
    }

    return userId;
    
  } catch (error: any) {
    console.error('💥 [USUÁRIO] Erro geral na função saveUserToNeon:', error);
    throw error;
  } finally {
    await client.end();
  }
}

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { session_id, registration_data } = await req.json();

    if (!session_id) {
      return corsResponse({ error: 'session_id is required' }, 400);
    }

    if (!registration_data) {
      return corsResponse({ error: 'registration_data is required' }, 400);
    }

    // Buscar dados da sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer', 'line_items']
    });

    if (!session.customer || typeof session.customer === 'string') {
      return corsResponse({ error: 'Customer data not found' }, 400);
    }

    const customer = session.customer as Stripe.Customer;
    const metadata = customer.metadata;

    // Extrair dados da empresa (combinando Stripe + registration_data)
    const companyData: CompanyData = {
      name: registration_data.companyName || metadata.razaoSocial || customer.name || '',
      email: registration_data.email || customer.email || '',
      cnpj: registration_data.cnpj || metadata.cnpj || '',
      phone: metadata.phone || null,
      domain: metadata.domain || '', // Pode ser gerado pelo backend baseado no email
      plan_contracted: session.line_items?.data[0]?.price?.id || '',
      employee_count: registration_data.employees || metadata.employee_count || '',
      additional_agents: parseInt(metadata.additional_agents || '0'),
      ticket_package: metadata.ticket_package || ''
    };

    // Extrair dados do usuário (usando dados do registration_data)
    const fullName = `${registration_data.firstName} ${registration_data.lastName}`;
    const userData: UserData = {
      name: fullName,
      email: registration_data.email,
      username: registration_data.email,
      password: registration_data.password, // Senha vem do registration_data, não do Stripe
      role: 'company_admin',
      company_id: 0 // Será preenchido após salvar a empresa
    };

    // Validações básicas
    if (!companyData.cnpj || !companyData.email || !userData.password) {
      return corsResponse({ 
        error: 'Dados obrigatórios não encontrados',
        missing: {
          cnpj: !companyData.cnpj,
          email: !companyData.email,
          password: !userData.password
        }
      }, 400);
    }

    // Validações de senha (seguindo padrões do outro sistema)
    if (userData.password.length < MIN_PASSWORD_LENGTH) {
      return corsResponse({ 
        error: `Senha deve ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres` 
      }, 400);
    }

    if (userData.password.length > MAX_PASSWORD_LENGTH) {
      return corsResponse({ 
        error: `Senha deve ter no máximo ${MAX_PASSWORD_LENGTH} caracteres` 
      }, 400);
    }

    // Salvar empresa primeiro
    const companyId = await saveCompanyToNeon(companyData);
    
    // Atualizar company_id no userData e salvar usuário
    userData.company_id = companyId;
    const userId = await saveUserToNeon(userData);

    return corsResponse({
      success: true,
      company_id: companyId,
      user_id: userId,
      message: 'Dados salvos com sucesso no sistema'
    });

  } catch (error: any) {
    console.error('Erro ao salvar dados:', error);
    return corsResponse({ 
      error: 'Erro interno do servidor',
      details: error.message 
    }, 500);
  }
}); 