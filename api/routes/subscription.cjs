const express = require('express');
const router = express.Router();

// Verificar se a chave do Stripe está configurada
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY é obrigatória');
}

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Middleware para verificar autenticação (simulado)
const authenticateUser = (req, res, next) => {
  // TODO: Implementar verificação real de autenticação
  // Por enquanto, vamos simular um usuário autenticado
  req.user = {
    id: 'user_123',
    email: 'user@example.com',
    stripeCustomerId: 'cus_example123'
  };
  next();
};

// Obter detalhes da assinatura do usuário
router.get('/subscription', authenticateUser, async (req, res) => {
  try {
    const { stripeCustomerId } = req.user;
    
    if (!stripeCustomerId) {
      return res.json({
        subscription: null,
        product: null
      });
    }

    // Buscar assinaturas do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.json({
        subscription: null,
        product: null
      });
    }

    const subscription = subscriptions.data[0];
    const priceId = subscription.items.data[0].price.id;
    
    // Buscar detalhes do produto
    const price = await stripe.prices.retrieve(priceId, {
      expand: ['product']
    });

    const subscriptionData = {
      id: subscription.id,
      subscription_status: subscription.status,
      current_period_start: subscription.current_period_start,
      current_period_end: subscription.current_period_end,
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at,
      payment_method_brand: null,
      payment_method_last4: null
    };

    // Buscar método de pagamento se disponível
    if (subscription.default_payment_method) {
      try {
        const paymentMethod = await stripe.paymentMethods.retrieve(subscription.default_payment_method);
        subscriptionData.payment_method_brand = paymentMethod.card?.brand;
        subscriptionData.payment_method_last4 = paymentMethod.card?.last4;
      } catch (error) {
        console.log('Erro ao buscar método de pagamento:', error.message);
      }
    }

    const productData = {
      id: price.product.id,
      name: price.product.name,
      description: price.product.description,
      price: {
        monthly: price.unit_amount,
        currency: price.currency
      }
    };

    res.json({
      subscription: subscriptionData,
      product: productData
    });

  } catch (error) {
    console.error('Erro ao buscar assinatura:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

// Cancelar assinatura
router.post('/subscription/cancel', authenticateUser, async (req, res) => {
  try {
    const { stripeCustomerId } = req.user;
    
    if (!stripeCustomerId) {
      return res.status(400).json({ 
        error: 'Cliente não encontrado' 
      });
    }

    // Buscar assinatura ativa do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma assinatura ativa encontrada' 
      });
    }

    const subscription = subscriptions.data[0];
    
    // Cancelar no final do período
    const canceledSubscription = await stripe.subscriptions.update(subscription.id, {
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
router.post('/subscription/reactivate', authenticateUser, async (req, res) => {
  try {
    const { stripeCustomerId } = req.user;
    
    if (!stripeCustomerId) {
      return res.status(400).json({ 
        error: 'Cliente não encontrado' 
      });
    }

    // Buscar assinatura do cliente
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhuma assinatura encontrada' 
      });
    }

    const subscription = subscriptions.data[0];
    
    if (!subscription.cancel_at_period_end) {
      return res.status(400).json({ 
        error: 'Assinatura não está marcada para cancelamento' 
      });
    }

    // Remover o cancelamento
    const reactivatedSubscription = await stripe.subscriptions.update(subscription.id, {
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

// Listar faturas do cliente
router.get('/invoices', authenticateUser, async (req, res) => {
  try {
    const { stripeCustomerId } = req.user;
    const { limit = 10 } = req.query;
    
    if (!stripeCustomerId) {
      return res.json({ invoices: [] });
    }

    const invoices = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: parseInt(limit)
    });

    const invoicesData = invoices.data.map(invoice => ({
      id: invoice.id,
      number: invoice.number,
      amount_paid: invoice.amount_paid,
      amount_due: invoice.amount_due,
      currency: invoice.currency,
      status: invoice.status,
      created: invoice.created,
      due_date: invoice.due_date,
      hosted_invoice_url: invoice.hosted_invoice_url,
      invoice_pdf: invoice.invoice_pdf
    }));

    res.json({ invoices: invoicesData });

  } catch (error) {
    console.error('Erro ao buscar faturas:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      message: error.message 
    });
  }
});

module.exports = router;