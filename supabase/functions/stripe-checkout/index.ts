import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'TicketWise Integration',
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

  // For 204 No Content, don't include Content-Type or body
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

// Função para verificar se já existe um cliente com o email no Stripe
async function findExistingCustomerByEmail(email: string): Promise<string | null> {
  try {
    console.log(`🔍 [DUPLICADO CHECK] Buscando cliente existente para email: ${email}`);
    
    const customers = await stripe.customers.list({
      email: email,
      limit: 10, // Aumentar para detectar mais duplicados
    });

    console.log(`📊 [DUPLICADO CHECK] Encontrados ${customers.data.length} clientes para ${email}`);

    if (customers.data.length > 0) {
      const customer = customers.data[0];
      console.log(`✅ [DUPLICADO CHECK] Cliente existente encontrado: ${customer.id} (criado em: ${new Date(customer.created * 1000).toISOString()})`);
      
      // Se encontrar múltiplos clientes, logar todos
      if (customers.data.length > 1) {
        console.warn(`⚠️ [DUPLICADO CHECK] MÚLTIPLOS CLIENTES ENCONTRADOS (${customers.data.length}) para ${email}:`);
        customers.data.forEach((cust, index) => {
          console.warn(`   Cliente ${index + 1}: ${cust.id} (criado: ${new Date(cust.created * 1000).toISOString()})`);
        });
        console.warn(`🔄 [DUPLICADO CHECK] Usando o primeiro cliente: ${customer.id}`);
      }
      
      return customer.id;
    }

    console.log(`❌ [DUPLICADO CHECK] Nenhum cliente existente encontrado para: ${email}`);
    return null;
  } catch (error) {
    console.error(`💥 [DUPLICADO CHECK] ERRO ao buscar cliente existente para ${email}:`, error);
    // Em caso de erro na busca, retornar null para permitir a criação
    // Isso evita falhas completas devido a problemas temporários na API
    return null;
  }
}

// Função para criar ou obter cliente do Stripe
async function getOrCreateStripeCustomer(email: string, customerData?: any, isRegistration = false): Promise<string> {
  console.log(`🎯 [CLIENTE] Iniciando getOrCreateStripeCustomer para email: ${email}`);
  
  // PRIMEIRA VERIFICAÇÃO: Verificar se já existe um cliente com este email
  const existingCustomerId = await findExistingCustomerByEmail(email);
  
  if (existingCustomerId) {
    console.log(`🔄 [CLIENTE] REUTILIZANDO cliente existente ${existingCustomerId} para email ${email}`);
    return existingCustomerId;
  }

  // SEGUNDA VERIFICAÇÃO: Se não existe, criar novo cliente
  console.log(`🆕 [CLIENTE] Criando NOVO cliente para email: ${email}`);
  
  const customerCreateData: any = {
    email: email,
    metadata: {},
  };

  // Adicionar metadata específico para registro
  if (isRegistration) {
    customerCreateData.metadata.registration = 'true';
    customerCreateData.metadata.source = 'registration_flow';
  } else {
    customerCreateData.metadata.source = 'authenticated_flow';
  }

  // Adicionar dados extras se fornecidos
  if (customerData?.name) {
    customerCreateData.name = customerData.name;
  }
  if (customerData?.cnpj) {
    customerCreateData.metadata.cnpj = customerData.cnpj;
  }
  if (customerData?.razaoSocial) {
    customerCreateData.metadata.razaoSocial = customerData.razaoSocial;
  }
  if (customerData?.employee_count) {
    customerCreateData.metadata.employee_count = customerData.employee_count;
  }
  if (customerData?.domain) {
    customerCreateData.metadata.domain = customerData.domain;
  }

  // Adicionar timestamp para auditoria
  customerCreateData.metadata.created_timestamp = new Date().toISOString();

  console.log(`📝 [CLIENTE] Dados para criação:`, {
    email: customerCreateData.email,
    name: customerCreateData.name,
    metadata_keys: Object.keys(customerCreateData.metadata)
  });

  try {
    // TERCEIRA VERIFICAÇÃO: Antes de criar, verificar uma última vez (race condition)
    console.log(`🔒 [CLIENTE] Verificação final antes da criação para ${email}`);
    const finalCheck = await findExistingCustomerByEmail(email);
    if (finalCheck) {
      console.log(`🏃‍♂️ [CLIENTE] RACE CONDITION detectada! Cliente ${finalCheck} já foi criado por outro processo`);
      return finalCheck;
    }

    const newCustomer = await stripe.customers.create(customerCreateData);
    console.log(`✅ [CLIENTE] SUCESSO - Novo cliente criado: ${newCustomer.id} para email ${email}`);
    return newCustomer.id;
  } catch (error: any) {
    console.error(`💥 [CLIENTE] ERRO ao criar cliente para email ${email}:`, {
      message: error.message,
      type: error.type,
      code: error.code
    });
    
    // QUARTA VERIFICAÇÃO: Se falhar na criação, tentar buscar novamente 
    console.log(`🔄 [CLIENTE] Tentando buscar novamente após erro de criação...`);
    const retryExistingCustomerId = await findExistingCustomerByEmail(email);
    if (retryExistingCustomerId) {
      console.log(`🎯 [CLIENTE] Cliente encontrado após erro: ${retryExistingCustomerId} (provavelmente criado por outro processo)`);
      return retryExistingCustomerId;
    }
    
    // Se ainda não encontrar, re-throw o erro original
    console.error(`💀 [CLIENTE] FALHA TOTAL - Não foi possível criar nem encontrar cliente para ${email}`);
    throw error;
  }
}

Deno.serve(async (req) => {
  console.log('🔴 FUNÇÃO STRIPE-CHECKOUT INICIADA!');
  
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const { price_id, success_url, cancel_url, mode, customer_data, is_registration } = await req.json();

    console.log('🔴 DADOS RECEBIDOS:', {
      price_id,
      mode,
      is_registration,
      customer_email: customer_data?.email,
      customer_coupon: customer_data?.couponCode,
      has_customer_data: !!customer_data
    });

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      return corsResponse({ error }, 400);
    }

    let customerId;
    let userEmail;
    let couponId = null;

    // Verificar e validar cupom se fornecido
    if (customer_data?.couponCode) {
      try {
        console.log(`🎟️ Validating coupon code: ${customer_data.couponCode}`);
        
        let coupon = null;
        let foundViaPromotionCode = false;
        
        // Primeiro, tentar buscar como promotion code
        try {
          const promotionCodes = await stripe.promotionCodes.list({
            code: customer_data.couponCode,
            active: true,
            limit: 1
          });
          
          if (promotionCodes.data.length > 0) {
            const promotionCode = promotionCodes.data[0];
            coupon = promotionCode.coupon;
            foundViaPromotionCode = true;
            console.log(`📱 Found promotion code: ${promotionCode.id} -> coupon: ${coupon.id}`);
          }
        } catch (promoError) {
          console.log(`ℹ️ Not found as promotion code, trying as direct coupon ID...`);
        }
        
        // Se não encontrou como promotion code, tentar como ID direto do cupom
        if (!coupon) {
          try {
            coupon = await stripe.coupons.retrieve(customer_data.couponCode);
            console.log(`🎫 Found direct coupon: ${coupon.id}`);
          } catch (directError) {
            console.log(`❌ Not found as direct coupon either`);
          }
        }
        
        if (coupon) {
          console.log(`📋 Coupon details:`, {
            id: coupon.id,
            valid: coupon.valid,
            percent_off: coupon.percent_off,
            amount_off: coupon.amount_off,
            currency: coupon.currency,
            duration: coupon.duration,
            found_via: foundViaPromotionCode ? 'promotion_code' : 'direct_coupon'
          });
          
          if (coupon.valid) {
            couponId = coupon.id;
            const discountText = coupon.percent_off 
              ? `${coupon.percent_off}% de desconto` 
              : `R$ ${(coupon.amount_off! / 100).toFixed(2)} de desconto`;
            console.log(`✅ Valid coupon found: ${couponId} - ${discountText}`);
          } else {
            console.warn(`❌ Invalid coupon: ${customer_data.couponCode} - reason: not valid`);
          }
        } else {
          console.warn(`❌ Coupon not found: ${customer_data.couponCode}`);
        }
      } catch (error: any) {
        console.warn(`❌ Coupon validation failed for ${customer_data.couponCode}:`, {
          code: error.code,
          message: error.message,
          type: error.type
        });
        // Não retornar erro aqui - continuar sem cupom se inválido
      }
    }

    // Se é um registro, não precisamos de autenticação
    if (is_registration && customer_data?.email) {
      userEmail = customer_data.email;
      
      // Usar função que verifica se cliente já existe antes de criar
      customerId = await getOrCreateStripeCustomer(userEmail, customer_data, true);
    } else {
      // Fluxo original para usuários autenticados ou não-registro
      const authHeader = req.headers.get('Authorization');
      
      // Para registro, o header pode existir mas não é obrigatório
      if (!is_registration && !authHeader) {
        return corsResponse({ error: 'Authorization header required for non-registration' }, 401);
      }

      // Se tem header de auth, tentar autenticar
      if (authHeader) {
        const token = authHeader.replace('Bearer ', '');
        const {
          data: { user },
          error: getUserError,
        } = await supabase.auth.getUser(token);

        if (!getUserError && user) {
          // Usuário autenticado - usar fluxo normal
          userEmail = user.email;

          const { data: customer, error: getCustomerError } = await supabase
            .from('stripe_customers')
            .select('customer_id')
            .eq('user_id', user.id)
            .is('deleted_at', null)
            .maybeSingle();

          if (getCustomerError) {
            console.error('Failed to fetch customer information from the database', getCustomerError);
            return corsResponse({ error: 'Failed to fetch customer information' }, 500);
          }

          if (!customer || !customer.customer_id) {
            // Verificar se já existe no Stripe e criar se necessário
            customerId = await getOrCreateStripeCustomer(user.email!, customer_data, false);

            // Salvar no banco apenas se for um cliente novo
            const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
              user_id: user.id,
              customer_id: customerId,
            });

            if (createCustomerError) {
              console.error('Failed to save customer information in the database', createCustomerError);
              // Se falhar ao salvar no banco mas o cliente já existe no Stripe, não deletar
              // Apenas logar o erro e continuar
              console.warn(`Customer ${customerId} exists in Stripe but failed to save mapping in database`);
            }
          } else {
            customerId = customer.customer_id;
          }
        } else {
          // Token inválido mas é registro - usar função que verifica duplicados
          if (is_registration && customer_data?.email) {
            userEmail = customer_data.email;
            customerId = await getOrCreateStripeCustomer(userEmail, customer_data, true);
          } else {
            return corsResponse({ error: 'Failed to authenticate user' }, 401);
          }
        }
      } else {
        // Sem header de auth - só permitido para registro
        if (is_registration && customer_data?.email) {
          userEmail = customer_data.email;
          customerId = await getOrCreateStripeCustomer(userEmail, customer_data, true);
        } else {
          return corsResponse({ error: 'Authorization required for non-registration flow' }, 401);
        }
      }
    }

    // Criar Checkout Session
    const sessionConfig: any = {
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url,
      cancel_url,
    };

    // Adicionar cupom se válido
    if (couponId) {
      console.log(`🏷️ Applying coupon ${couponId} to checkout session`);
      
      // Aplicar cupom usando apenas discounts (API nova do Stripe)
      sessionConfig.discounts = [{ coupon: couponId }];
      
      console.log(`✅ Coupon ${couponId} applied to ${mode} checkout`);
    } else {
      console.log(`ℹ️ No coupon to apply`);
    }
    
    // Adicionar 30 dias de trial para assinaturas (sem cupom no subscription_data)
    if (mode === 'subscription') {
      sessionConfig.subscription_data = {
        trial_period_days: 30,
      };
    }

    // Se temos customerId, usar customer. Senão usar customer_email
    if (customerId) {
      sessionConfig.customer = customerId;
    } else if (customer_data?.email) {
      sessionConfig.customer_email = customer_data.email;
    }

    // Para registro, adicionar opções específicas
    if (is_registration) {
      sessionConfig.billing_address_collection = 'required';
    }

    const session = await stripe.checkout.sessions.create(sessionConfig);

    console.log(`🚀 Created checkout session ${session.id} for customer ${customerId}`);
    console.log(`📊 Session config used:`, {
      mode: sessionConfig.mode,
      has_discounts: !!sessionConfig.discounts,
      discounts: sessionConfig.discounts,
      subscription_data: sessionConfig.subscription_data,
      customer_id: customerId,
      price_id: price_id
    });

    return corsResponse({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error(`Checkout error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}