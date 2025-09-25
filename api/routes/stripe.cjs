const express = require('express');
const Stripe = require('stripe');
const { neon } = require('@neondatabase/serverless');

// Configurar conexão com Neon
const sql = neon(process.env.DATABASE_URL);

const router = express.Router();

// Verificar se a chave do Stripe está configurada
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('❌ STRIPE_SECRET_KEY não configurada');
  throw new Error('STRIPE_SECRET_KEY é obrigatória');
}

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

// GET /api/stripe/products - Lista produtos do Stripe
router.get('/products', async (req, res) => {
  try {
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price']
    });

    res.json({
      success: true,
      products: products.data
    });
  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// GET /api/stripe/prices - Lista preços do Stripe
router.get('/prices', async (req, res) => {
  try {
    const { product_id } = req.query;
    
    const params = {
      active: true
    };
    
    if (product_id) {
      params.product = product_id;
    }

    const prices = await stripe.prices.list(params);

    res.json({
      success: true,
      prices: prices.data
    });
  } catch (error) {
    console.error('Erro ao buscar preços:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/stripe/checkout - Criar sessão de checkout
router.post('/checkout', async (req, res) => {
  try {
    const { price_id, success_url, cancel_url, customer_email, customer_data, mode, user_id } = req.body;

    if (!price_id) {
      return res.status(400).json({
        success: false,
        error: 'price_id é obrigatório'
      });
    }

    console.log('🎟️ Dados recebidos no checkout:', { customer_data, couponCode: customer_data?.couponCode });

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: [{
        price: price_id,
        quantity: 1,
      }],
      mode: mode || 'subscription',
      success_url: success_url || `${process.env.FRONTEND_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancel_url || `${process.env.FRONTEND_URL}/pricing`,
      locale: 'pt-BR', // Configurar Stripe em português brasileiro
    };

    // Aplicar cupom se fornecido
    if (customer_data?.couponCode) {
      try {
        // Verificar se o cupom existe
        const coupon = await stripe.coupons.retrieve(customer_data.couponCode);
        console.log('✅ Cupom encontrado:', coupon.id, coupon.name);
        
        sessionParams.discounts = [{
          coupon: customer_data.couponCode
        }];
      } catch (couponError) {
        console.error('❌ Erro ao aplicar cupom:', couponError.message);
        // Não falhar o checkout por causa do cupom, apenas logar o erro
      }
    }

    // Configurar email do cliente
    if (customer_email) {
      sessionParams.customer_email = customer_email;
    } else if (customer_data?.email) {
      sessionParams.customer_email = customer_data.email;
    }

    // Adicionar metadados do cliente se fornecidos
    if (customer_data) {
      sessionParams.metadata = {
        customer_name: customer_data.name || '',
        cnpj: customer_data.cnpj || '',
        razao_social: customer_data.razaoSocial || '',
        employee_count: customer_data.employee_count || '',
        coupon_code: customer_data.couponCode || '',
        user_id: user_id || '' // Incluir user_id se fornecido
      };
    }

    const session = await stripe.checkout.sessions.create(sessionParams);

    res.json({
      success: true,
      session_id: session.id,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar checkout:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/stripe/create-test-coupons - Criar cupons de teste
router.post('/create-test-coupons', async (req, res) => {
  try {
    const coupons = [];

    // Cupom de 20% de desconto
    const coupon20 = await stripe.coupons.create({
      percent_off: 20,
      duration: 'once',
      name: 'Desconto 20%',
      id: 'DESCONTO20'
    });
    coupons.push(coupon20);

    // Cupom de R$ 50 de desconto
    const coupon50 = await stripe.coupons.create({
      amount_off: 5000, // R$ 50 em centavos
      currency: 'brl',
      duration: 'once',
      name: 'R$ 50 OFF',
      id: 'DESCONTO50'
    });
    coupons.push(coupon50);

    // Cupom de primeiro mês grátis
    const couponFree = await stripe.coupons.create({
      percent_off: 100,
      duration: 'once',
      name: 'Primeiro Mês Grátis',
      id: 'PRIMEIROMES'
    });
    coupons.push(couponFree);

    res.json({
      success: true,
      message: 'Cupons de teste criados com sucesso',
      coupons: coupons
    });
  } catch (error) {
    console.error('Erro ao criar cupons:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// POST /api/stripe/webhook - Webhook do Stripe
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleStripeEvent(event);
    res.json({ received: true });
  } catch (error) {
    console.error('Erro ao processar webhook:', error);
    res.status(500).json({ error: error.message });
  }
});

// Função para processar eventos do Stripe
async function handleStripeEvent(event) {
  console.log('Processando evento Stripe:', event.type);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionEvent(event.data.object);
      break;
    case 'invoice.payment_succeeded':
    case 'invoice.payment_failed':
      await handleInvoiceEvent(event.data.object);
      break;
    case 'customer.updated':
      await handleCustomerUpdated(event.data.object);
      break;
    case 'payment_method.attached':
      await handlePaymentMethodAttached(event.data.object);
      break;
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }
}

// Sincronizar cliente do Stripe
async function syncCustomerFromStripe(customerData, customerEmail = null) {
  try {
    // Se customerData é string, buscar no Stripe. Se é objeto, usar direto.
    let customer;
    if (typeof customerData === 'string') {
      customer = await stripe.customers.retrieve(customerData, {
        expand: ['default_source', 'invoice_settings.default_payment_method']
      });
    } else {
      customer = customerData; // Já é o objeto completo
    }
    
    const email = customerEmail || customer.email;
    
    // Buscar user_id baseado no email
    let userId = null;
    if (email) {
      const userResult = await sql`
        SELECT id FROM users WHERE email = ${email}
      `;
      if (userResult.length > 0) {
        userId = userResult[0].id;
      }
    }
    
    // Inserir/atualizar cliente
      await sql`
        INSERT INTO stripe_customers (stripe_customer_id, email, name, user_id, created_at, updated_at)
        VALUES (${customer.id}, ${email}, ${customer.name || ''}, ${userId}, NOW(), NOW())
        ON CONFLICT (stripe_customer_id) DO UPDATE SET
          email = EXCLUDED.email,
          name = EXCLUDED.name,
          user_id = EXCLUDED.user_id,
          updated_at = NOW()
      `;

    console.log(`Cliente ${customer.id} sincronizado com sucesso, User ID: ${userId}`);
    return { customerId: customer.id, userId };
  } catch (error) {
    console.error('Erro ao sincronizar cliente:', error);
    throw error;
  }
}

// Processar eventos de assinatura
async function handleSubscriptionEvent(subscription) {
  try {
    // Buscar informações do método de pagamento
    let paymentMethodBrand = null;
    let paymentMethodLast4 = null;
    
    if (subscription.default_payment_method) {
      const paymentMethod = await stripe.paymentMethods.retrieve(subscription.default_payment_method);
      paymentMethodBrand = paymentMethod.card?.brand || null;
      paymentMethodLast4 = paymentMethod.card?.last4 || null;
    }

    // Sincronizar cliente primeiro
    await syncCustomerFromStripe(subscription.customer);

    // Buscar user_id pelo stripe_customer_id
    const customerResult = await sql`
      SELECT user_id FROM stripe_customers WHERE stripe_customer_id = ${subscription.customer}
    `;
    
    if (customerResult.length === 0) {
      console.error('❌ Cliente não encontrado:', subscription.customer);
      return;
    }
    
    const userId = customerResult[0].user_id;
    console.log('✅ Vinculando assinatura ao usuário:', userId);

    // Inserir/atualizar assinatura com todos os dados necessários
    await sql`
      INSERT INTO stripe_subscriptions (
        user_id, stripe_subscription_id, stripe_customer_id, status, price_id,
        current_period_start, current_period_end, cancel_at_period_end,
        payment_method_brand, payment_method_last4, created_at, updated_at
      )
      VALUES (
        ${userId}, ${subscription.id}, ${subscription.customer}, ${subscription.status}, 
        ${subscription.items.data[0]?.price?.id || null},
        ${subscription.current_period_start}, ${subscription.current_period_end},
        ${subscription.cancel_at_period_end || false},
        ${paymentMethodBrand}, ${paymentMethodLast4},
        ${new Date(subscription.created * 1000)}, ${new Date()}
      )
      ON CONFLICT (stripe_subscription_id) DO UPDATE SET
        status = EXCLUDED.status,
        price_id = EXCLUDED.price_id,
        current_period_start = EXCLUDED.current_period_start,
        current_period_end = EXCLUDED.current_period_end,
        cancel_at_period_end = EXCLUDED.cancel_at_period_end,
        payment_method_brand = EXCLUDED.payment_method_brand,
        payment_method_last4 = EXCLUDED.payment_method_last4,
        updated_at = EXCLUDED.updated_at
    `;

    console.log(`Assinatura ${subscription.id} sincronizada com sucesso`);
  } catch (error) {
    console.error('Erro ao processar evento de assinatura:', error);
    throw error;
  }
}

// Processar eventos de fatura/pagamento
async function handleInvoiceEvent(invoice) {
  try {
    // Sincronizar cliente primeiro
    await syncCustomerFromStripe(invoice.customer);

    // Inserir/atualizar ordem de pagamento
    await sql`
      INSERT INTO stripe_orders (
        payment_intent_id, stripe_customer_id, status, 
        amount_total, amount_subtotal, currency, created_at, updated_at
      )
      VALUES (
        ${invoice.payment_intent || invoice.id}, ${invoice.customer}, 
        ${invoice.status}, ${invoice.amount_paid}, ${invoice.subtotal}, 
        ${invoice.currency}, ${new Date(invoice.created * 1000)}, ${new Date()}
      )
      ON CONFLICT (payment_intent_id) DO UPDATE SET
        status = EXCLUDED.status,
        amount_total = EXCLUDED.amount_total,
        updated_at = EXCLUDED.updated_at
    `;

    console.log(`Fatura ${invoice.id} processada com sucesso`);
  } catch (error) {
    console.error('Erro ao processar evento de fatura:', error);
    throw error;
  }
}

// Processar atualização de cliente
async function handleCustomerUpdated(customer) {
  try {
    await syncCustomerFromStripe(customer.id);
    console.log(`Cliente ${customer.id} atualizado com sucesso`);
  } catch (error) {
    console.error('Erro ao processar atualização de cliente:', error);
    throw error;
  }
}

// Processar método de pagamento anexado
async function handlePaymentMethodAttached(paymentMethod) {
  try {
    // Atualizar assinaturas do cliente com novo método de pagamento
    const subscriptions = await stripe.subscriptions.list({
      customer: paymentMethod.customer,
      status: 'active'
    });

    for (const subscription of subscriptions.data) {
      await handleSubscriptionEvent(subscription);
    }

    console.log(`Método de pagamento ${paymentMethod.id} processado com sucesso`);
  } catch (error) {
    console.error('Erro ao processar método de pagamento:', error);
    throw error;
  }
}

// Processar checkout completado
async function handleCheckoutCompleted(session) {
  console.log('Checkout completed for session:', session.id);
  
  try {
    // Extrair metadados da sessão
    const metadata = session.metadata || {};
    const customerEmail = session.customer_details?.email;
    
    console.log('Session metadata:', metadata);
    console.log('Customer email:', customerEmail);
    
    // Sincronizar cliente do Stripe
    if (session.customer) {
      await syncCustomerFromStripe(session.customer, customerEmail);
    }
    
    // Se há metadados de empresa OU dados de registro, processar registro automático
    if ((metadata.customer_name || metadata.razao_social || session.registration_data) && customerEmail) {
      await processCompanyRegistration({
        session_id: session.id,
        customer_email: customerEmail,
        metadata: metadata,
        session: session // Passar sessão completa para acessar registration_data
      });
    }
    
    // Processar assinatura se existir
    if (session.subscription) {
      console.log('📋 Processando assinatura:', session.subscription.id);
      await handleSubscriptionEvent(session.subscription);
    }
    
    // Salvar dados do pedido
    await saveStripeOrder(session);
    
  } catch (error) {
    console.error('Erro ao processar checkout completed:', error);
  }
}

// Processar registro automático da empresa
async function processCompanyRegistration({ session_id, customer_email, metadata, session }) {
  try {
    console.log('Processando registro automático da empresa para:', customer_email);
    
    // Verificar se usuário existe (primeiro por user_id dos metadados, depois por email)
    let userResult;
    if (metadata.user_id) {
      userResult = await sql`
        SELECT id, company_id FROM users WHERE id = ${parseInt(metadata.user_id)}
      `;
    }
    
    if (!userResult || userResult.length === 0) {
      userResult = await sql`
        SELECT id, company_id FROM users WHERE email = ${customer_email}
      `;
    }
    
    let userId;
    let companyId = null;
    
    if (userResult.length === 0) {
      console.log('Usuário não encontrado, criando novo usuário para:', customer_email);
      
      // Usar senha do formulário ou temporária como fallback
      const bcrypt = require('bcrypt');
      let password = 'TempPass123!'; // Senha temporária como fallback
      
      // Tentar pegar senha dos dados de registro
      console.log('🔍 DEBUG - session.registration_data:', session.registration_data);
      // registration_data não existe no escopo desta função
      
      if (session.registration_data && session.registration_data.password) {
        password = session.registration_data.password;
        console.log('✅ Usando senha do session.registration_data:', password);
      // Não há registration_data global aqui
      } else {
        console.log('⚠️ Usando senha temporária - dados de registro não encontrados');
      }
      
      console.log('🔍 DEBUG SENHA - Senha antes do hash:', password);
      
      // Garantir que bcrypt seja importado corretamente
      if (!bcrypt || !bcrypt.hash) {
        console.error('❌ bcrypt não está disponível!');
        throw new Error('bcrypt não encontrado');
      }
      
      const hashedPassword = await bcrypt.hash(password.toString(), 10);
      console.log('🔍 DEBUG SENHA - Hash gerado:', hashedPassword);
      
      // Testar o hash imediatamente
      const testHash = await bcrypt.compare(password.toString(), hashedPassword);
      console.log('🔍 DEBUG SENHA - Hash funciona?', testHash);
      
      const newUserResult = await sql`
        INSERT INTO users (name, email, username, password_hash, is_active, role, created_at, updated_at)
        VALUES (${metadata.customer_name || metadata.razao_social}, ${customer_email}, ${customer_email}, ${hashedPassword}, true, 'user', NOW(), NOW())
        RETURNING id
      `;
      
      userId = newUserResult[0].id;
      console.log('✅ Novo usuário criado com ID:', userId, '- Senha definida');
    } else {
      const user = userResult[0];
      userId = user.id;
      companyId = user.company_id;
    }
    
    // Se usuário já tem empresa, não criar nova
    if (companyId) {
      console.log('Usuário já possui empresa associada:', companyId);
      return;
    }
    
    // Verificar se empresa já existe
    const existingCompany = await sql`
      SELECT id FROM companies WHERE email = ${customer_email} OR cnpj = ${metadata.cnpj || ''}
    `;
    
    if (existingCompany.length > 0) {
      console.log('Empresa já existe para este email/CNPJ');
      return;
    }
    
    // Criar empresa
    const companyResult = await sql`
      INSERT INTO companies (
        name, email, cnpj, phone, employee_count, 
        plan_contracted, razao_social, created_at
      )
      VALUES (
        ${metadata.customer_name || metadata.razao_social}, ${customer_email}, ${metadata.cnpj || null}, 
        ${metadata.phone || null}, ${parseInt(metadata.employee_count) || 1},
        'premium', ${metadata.razao_social}, NOW()
      )
      RETURNING id, name, email
    `;
    
    const company = companyResult[0];
    
    // Associar usuário à empresa
    await sql`
      UPDATE users 
      SET company_id = ${company.id}, updated_at = NOW()
      WHERE id = ${userId}
    `;
    
    console.log('Empresa criada e associada ao usuário:', {
      companyId: company.id,
      userId: userId,
      email: customer_email
    });
    
  } catch (error) {
    console.error('Erro ao processar registro da empresa:', error);
  }
}

// Salvar dados do pedido Stripe
async function saveStripeOrder(session) {
  try {
    // Buscar user_id pelo email
    const customerEmail = session.customer_details?.email;
    let userId = null;
    
    if (customerEmail) {
      const userResult = await sql`
        SELECT id FROM users WHERE email = ${customerEmail}
      `;
      if (userResult.length > 0) {
        userId = userResult[0].id;
      }
    }
    
    console.log('🔍 Debugando campos antes do INSERT:', {
      checkout_session_id: session.id,
      checkout_session_id_length: session.id?.length,
      stripe_customer_id: session.customer,
      stripe_customer_id_length: typeof session.customer === 'string' ? session.customer.length : 'not string',
      user_id: userId,
      amount_total: session.amount_total,
      currency: session.currency
    });

    await sql`
      INSERT INTO stripe_orders (
        checkout_session_id, stripe_customer_id, user_id, amount_total, 
        currency, status, created_at
      )
      VALUES (
        ${session.id}, ${typeof session.customer === 'string' ? session.customer : session.customer?.id}, ${userId}, 
        ${session.amount_total}, ${session.currency}, 'completed', 
        NOW()
      )
      ON CONFLICT (checkout_session_id) DO UPDATE SET
        status = EXCLUDED.status,
        updated_at = NOW()
    `;
    
    console.log('Pedido Stripe salvo:', session.id);
    
  } catch (error) {
    console.error('Erro ao salvar pedido Stripe:', error);
  }
}

// POST /api/stripe/process-session - Processar sessão do checkout
router.post('/process-session', async (req, res) => {
  try {
    const { session_id, registration_data } = req.body;
    
    if (!session_id) {
      return res.status(400).json({
        success: false,
        error: 'session_id é obrigatório'
      });
    }
    
    console.log('🔄 Processando sessão:', session_id);
    
    // Buscar sessão no Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['subscription', 'customer', 'line_items']
    });
    
    console.log('📋 Sessão encontrada:', {
      id: session.id,
      customer_email: session.customer_details?.email,
      subscription_id: session.subscription?.id,
      customer_id: session.customer
    });
    
        if (session.status === 'complete') {
          // Adicionar dados de registro aos metadados da sessão para processamento
          if (registration_data) {
            session.registration_data = registration_data;
            console.log('📋 Dados de registro anexados à sessão:', registration_data);
          }
          
          // Processar como se fosse webhook
          await handleCheckoutCompleted(session);
          
          res.json({
            success: true,
            message: 'Sessão processada com sucesso',
            session: {
              id: session.id,
              customer_email: session.customer_details?.email,
              subscription_id: session.subscription?.id,
              amount_total: session.amount_total
            }
          });
        } else {
      res.status(400).json({
        success: false,
        error: `Pagamento não foi concluído. Status: ${session.status}`
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao processar sessão:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;