const express = require('express');
const { sql } = require('../config/database.cjs');
require('dotenv').config({ path: '../../.env' });
const router = express.Router();

console.log('🔧 Carregando rotas de subscription...');

// Verificar se a chave do Stripe está configurada
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY é obrigatória');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const { authenticateToken } = require('../middleware/auth.cjs');

// Usar o middleware de autenticação real
const authenticateUser = authenticateToken;

// Obter detalhes da assinatura do usuário
router.get('/', authenticateUser, async (req, res) => {
  console.log('📡 Rota /subscription chamada!');
  try {
    const userId = req.user.id;
    console.log('🔍 Buscando assinatura para user_id:', userId);
    console.log('🔍 Tipo do user_id:', typeof userId);
    
    // Buscar assinatura do usuário
    const subscriptionResult = await sql`
      SELECT 
        ss.*,
        c.name as company_name,
        c.plan_contracted
      FROM stripe_subscriptions ss
      LEFT JOIN users u ON u.id = ss.user_id
      LEFT JOIN companies c ON c.email = u.email
      WHERE ss.user_id = ${req.user.id}
      AND ss.status = 'active'
      ORDER BY ss.created_at DESC
      LIMIT 1
    `;
    
    if (subscriptionResult.length === 0) {
      console.log('❌ Nenhuma assinatura ativa encontrada');
      res.json({
        subscription: null,
        product: null
      });
      return;
    }
    
    const subscription = subscriptionResult[0];
    console.log('✅ Assinatura encontrada:', subscription.stripe_subscription_id);
    
    // Buscar detalhes do produto no Stripe
    let product = null;
    try {
      const stripeSubscription = await stripe.subscriptions.retrieve(subscription.stripe_subscription_id);
      const stripePrice = await stripe.prices.retrieve(subscription.price_id, {
        expand: ['product']
      });
      
      product = {
        id: stripePrice.product.id,
        name: stripePrice.product.name,
        description: stripePrice.product.description,
        price: stripePrice.unit_amount,
        currency: stripePrice.currency,
        interval: stripePrice.recurring?.interval
      };
      
    } catch (stripeError) {
      console.error('Erro ao buscar produto do Stripe:', stripeError);
    }
    
    console.log('📦 Dados da assinatura:', {
      subscription_id: subscription.stripe_subscription_id,
      status: subscription.status,
      price_id: subscription.price_id
    });
    console.log('📦 Dados do produto:', product);
    
    const responseData = {
      subscription: {
        id: subscription.stripe_subscription_id,
        status: subscription.status,
        price_id: subscription.price_id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        payment_method_brand: subscription.payment_method_brand,
        payment_method_last4: subscription.payment_method_last4,
        company_name: subscription.company_name,
        plan_contracted: subscription.plan_contracted
      },
      product: product
    };
    
    console.log('📤 Enviando resposta:', JSON.stringify(responseData, null, 2));
    res.json(responseData);

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Obter histórico de pagamentos/faturas do usuário
router.get('/invoices', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const invoices = await sql`
      WITH customer_ids AS (
        SELECT stripe_customer_id
        FROM stripe_customers
        WHERE user_id = ${userId}
      )
      SELECT
        id,
        checkout_session_id,
        payment_intent_id,
        status,
        amount_total,
        amount_subtotal,
        currency,
        created_at,
        updated_at
      FROM stripe_orders
      WHERE user_id = ${userId}
      OR stripe_customer_id IN (SELECT stripe_customer_id FROM customer_ids)
      ORDER BY created_at DESC
      LIMIT 100
    `;

    res.json({
      invoices,
      has_more: invoices.length === 100
    });
  } catch (error) {
    console.error('Erro ao buscar histórico de pagamentos:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Listar planos de assinatura disponíveis
router.get('/plans', authenticateUser, async (_req, res) => {
  try {
    const prices = await stripe.prices.list({
      active: true,
      type: 'recurring',
      expand: ['data.product']
    });

    const plans = prices.data.map((price) => {
      const product = price.product;
      const rawFeatures = product?.metadata?.features || '';
      const features = rawFeatures
        .split('|')
        .map((feature) => feature.trim())
        .filter(Boolean);

      return {
        id: price.id,
        name: product?.name || 'Plano',
        price: price.unit_amount || 0,
        interval: price.recurring?.interval || 'month',
        features
      };
    });

    res.json({ plans });
  } catch (error) {
    console.error('Erro ao buscar planos:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Criar sessão do Stripe Customer Portal (gerenciar cartão/faturamento)
router.post('/billing-portal-session', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { return_url } = req.body || {};

    const customerResult = await sql`
      SELECT stripe_customer_id
      FROM stripe_customers
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;

    if (customerResult.length === 0) {
      return res.status(400).json({
        error: 'Cliente Stripe não encontrado para este usuário'
      });
    }

    const stripeCustomerId = customerResult[0].stripe_customer_id;
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: return_url || `${process.env.FRONTEND_URL || 'http://localhost:5174'}/dashboard`
    });

    res.json({
      success: true,
      url: session.url
    });
  } catch (error) {
    console.error('Erro ao criar sessão do Billing Portal:', error);
    res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
});

// Cancelar assinatura
router.post('/cancel', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar assinatura ativa do usuário no banco Neon
    const subscriptionResult = await sql`
      SELECT 
        s.stripe_subscription_id,
        s.status,
        s.current_period_end
      FROM stripe_subscriptions s
      JOIN stripe_customers c ON s.stripe_customer_id = c.stripe_customer_id
      WHERE s.user_id = ${userId} AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    if (subscriptionResult.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma assinatura ativa encontrada' 
      });
    }

    const subscription = subscriptionResult[0];
    
    // Cancelar no final do período via Stripe
    const canceledSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: true
    });

    res.json({
      success: true,
      message: 'Assinatura cancelada com sucesso. Você continuará tendo acesso até o final do período atual.',
      subscription: {
        id: canceledSubscription.id,
        cancel_at_period_end: canceledSubscription.cancel_at_period_end,
        current_period_end: canceledSubscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Erro ao cancelar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Reativar assinatura cancelada
router.post('/reactivate', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Buscar assinatura do usuário no banco Neon
    const subscriptionResult = await sql`
      SELECT 
        s.stripe_subscription_id,
        s.status,
        s.cancel_at_period_end,
        s.current_period_end
      FROM stripe_subscriptions s
      JOIN stripe_customers c ON s.stripe_customer_id = c.stripe_customer_id
      WHERE s.user_id = ${userId}
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    if (subscriptionResult.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma assinatura encontrada' 
      });
    }

    const subscription = subscriptionResult[0];
    
    if (!subscription.cancel_at_period_end) {
      return res.status(400).json({ 
        error: 'Assinatura não está marcada para cancelamento' 
      });
    }

    // Remover o cancelamento via Stripe
    const reactivatedSubscription = await stripe.subscriptions.update(subscription.stripe_subscription_id, {
      cancel_at_period_end: false
    });

    res.json({
      success: true,
      message: 'Assinatura reativada com sucesso.',
      subscription: {
        id: reactivatedSubscription.id,
        cancel_at_period_end: reactivatedSubscription.cancel_at_period_end,
        current_period_end: reactivatedSubscription.current_period_end
      }
    });

  } catch (error) {
    console.error('Erro ao reativar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});



// Atualizar método de pagamento
router.post('/update-payment-method', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { payment_method_id } = req.body;
    
    if (!payment_method_id) {
      return res.status(400).json({ 
        error: 'ID do método de pagamento é obrigatório' 
      });
    }

    // Buscar dados do cliente e assinatura no banco Neon
    const subscriptionResult = await sql`
      SELECT 
        s.stripe_subscription_id,
        s.status,
        c.stripe_customer_id
      FROM stripe_subscriptions s
      JOIN stripe_customers c ON s.stripe_customer_id = c.stripe_customer_id
      WHERE s.user_id = ${userId} AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    if (subscriptionResult.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma assinatura ativa encontrada' 
      });
    }

    const { stripe_subscription_id, stripe_customer_id } = subscriptionResult[0];

    // Anexar método de pagamento ao cliente (pode já estar anexado ao mesmo cliente)
    try {
      await stripe.paymentMethods.attach(payment_method_id, {
        customer: stripe_customer_id
      });
    } catch (attachError) {
      if (attachError?.code !== 'resource_already_exists') {
        throw attachError;
      }
    }

    // Definir como método padrão do cliente para novas cobranças
    await stripe.customers.update(stripe_customer_id, {
      invoice_settings: {
        default_payment_method: payment_method_id
      }
    });
    
    // Atualizar método de pagamento padrão da assinatura
    await stripe.subscriptions.update(stripe_subscription_id, {
      default_payment_method: payment_method_id
    });

    // Buscar detalhes do novo método de pagamento
    const paymentMethod = await stripe.paymentMethods.retrieve(payment_method_id);

    await sql`
      UPDATE stripe_subscriptions
      SET
        payment_method_brand = ${paymentMethod.card?.brand || null},
        payment_method_last4 = ${paymentMethod.card?.last4 || null},
        updated_at = NOW()
      WHERE stripe_subscription_id = ${stripe_subscription_id}
    `;

    res.json({
      success: true,
      message: 'Método de pagamento atualizado com sucesso',
      payment_method: {
        brand: paymentMethod.card?.brand,
        last4: paymentMethod.card?.last4,
        exp_month: paymentMethod.card?.exp_month,
        exp_year: paymentMethod.card?.exp_year
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar método de pagamento:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Alterar plano de assinatura
router.post('/change-plan', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const { new_price_id, newPriceId } = req.body;
    const targetPriceId = new_price_id || newPriceId;
    
    if (!targetPriceId) {
      return res.status(400).json({ 
        error: 'ID do novo preço é obrigatório' 
      });
    }

    // Buscar assinatura ativa do usuário no banco Neon
    const subscriptionResult = await sql`
      SELECT 
        s.stripe_subscription_id,
        s.status,
        c.stripe_customer_id
      FROM stripe_subscriptions s
      JOIN stripe_customers c ON s.stripe_customer_id = c.stripe_customer_id
      WHERE s.user_id = ${userId} AND s.status = 'active'
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    if (subscriptionResult.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma assinatura ativa encontrada' 
      });
    }

    const { stripe_subscription_id } = subscriptionResult[0];
    
    // Buscar detalhes da assinatura atual do Stripe para obter o item ID
    const currentSubscription = await stripe.subscriptions.retrieve(stripe_subscription_id);
    const subscriptionItem = currentSubscription.items.data[0];
    
    // Atualizar o plano da assinatura
    const updatedSubscription = await stripe.subscriptions.update(stripe_subscription_id, {
      items: [{
        id: subscriptionItem.id,
        price: targetPriceId,
      }],
      proration_behavior: 'create_prorations'
    });

    // Buscar detalhes do novo produto/preço
    const price = await stripe.prices.retrieve(targetPriceId, {
      expand: ['product']
    });

    res.json({
      success: true,
      message: 'Plano alterado com sucesso',
      subscription: {
        id: updatedSubscription.id,
        status: updatedSubscription.status,
        current_period_end: updatedSubscription.current_period_end
      },
      new_plan: {
        name: price.product.name,
        price: price.unit_amount,
        currency: price.currency
      }
    });

  } catch (error) {
    console.error('Erro ao alterar plano:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Criar Setup Intent para capturar novo método de pagamento
router.post('/setup-intent', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;

    const customerResult = await sql`
      SELECT stripe_customer_id
      FROM stripe_customers
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    if (customerResult.length === 0) {
      return res.status(400).json({ 
        error: 'Cliente não encontrado' 
      });
    }

    const stripeCustomerId = customerResult[0].stripe_customer_id;

    const setupIntent = await stripe.setupIntents.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      usage: 'off_session'
    });

    res.json({
      client_secret: setupIntent.client_secret
    });

  } catch (error) {
    console.error('Erro ao criar Setup Intent:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

module.exports = router;
