const express = require('express');
const Stripe = require('stripe');

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
    const { price_id, success_url, cancel_url, customer_email, customer_data, mode } = req.body;

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
        coupon_code: customer_data.couponCode || ''
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
      await syncCustomerFromStripe(event.data.object.customer);
      break;
    default:
      console.log(`Evento não tratado: ${event.type}`);
  }
}

// Sincronizar cliente do Stripe
async function syncCustomerFromStripe(customerId) {
  try {
    const customer = await stripe.customers.retrieve(customerId);
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all'
    });

    // Inserir/atualizar cliente
    await sql`
      INSERT INTO stripe_customers (id, email, name, created_at, updated_at)
      VALUES (${customer.id}, ${customer.email}, ${customer.name}, ${new Date(customer.created * 1000)}, ${new Date()})
      ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        name = EXCLUDED.name,
        updated_at = EXCLUDED.updated_at
    `;

    // Sincronizar assinaturas
    for (const subscription of subscriptions.data) {
      await sql`
        INSERT INTO stripe_subscriptions (
          id, customer_id, status, current_period_start, 
          current_period_end, created_at, updated_at
        )
        VALUES (${subscription.id}, ${subscription.customer}, ${subscription.status}, ${new Date(subscription.current_period_start * 1000)}, ${new Date(subscription.current_period_end * 1000)}, ${new Date(subscription.created * 1000)}, ${new Date()})
        ON CONFLICT (id) DO UPDATE SET
          status = EXCLUDED.status,
          current_period_start = EXCLUDED.current_period_start,
          current_period_end = EXCLUDED.current_period_end,
          updated_at = EXCLUDED.updated_at
      `;
    }

    console.log(`Cliente ${customerId} sincronizado com sucesso`);
  } catch (error) {
    console.error('Erro ao sincronizar cliente:', error);
    throw error;
  }
}

// Processar checkout completado
async function handleCheckoutCompleted(session) {
  console.log('Checkout completado:', session.id);
  
  if (session.customer) {
    await syncCustomerFromStripe(session.customer);
  }
}

module.exports = router;