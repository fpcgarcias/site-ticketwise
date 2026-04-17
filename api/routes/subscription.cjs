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

const SYNCABLE_SUBSCRIPTION_STATUSES = new Set(['active', 'trialing', 'past_due', 'unpaid', 'incomplete']);
const VISIBLE_SUBSCRIPTION_STATUSES = ['active', 'trialing', 'past_due', 'unpaid', 'incomplete'];
const PUBLIC_SUBSCRIPTION_PRICE_IDS = new Set([
  'price_1S3KBfJrnNh1FDmnnPMtWGVv',
  'price_1S3KE7JrnNh1FDmnLtAd7SD8',
  'price_1S3KCVJrnNh1FDmn8bvDvan7',
  'price_1S3JqtJrnNh1FDmnAlSaVtR1',
  'price_1S3KDPJrnNh1FDmnZl2MA8c8',
  'price_1S3dS9JrnNh1FDmnFgdKcIvw'
]);

function normalizeEmail(email) {
  return (email || '').trim().toLowerCase();
}

function mapStripeInvoiceStatusToOrderStatus(stripeStatus) {
  switch ((stripeStatus || '').toLowerCase()) {
    case 'paid':
      return 'completed';
    case 'processing':
      return 'processing';
    case 'refunded':
      return 'refunded';
    case 'void':
    case 'uncollectible':
    case 'deleted':
      return 'canceled';
    case 'open':
    case 'draft':
    case 'pending':
    default:
      return 'pending';
  }
}

function pickMostRelevantSubscription(subscriptions) {
  return (subscriptions || [])
    .filter((subscription) => SYNCABLE_SUBSCRIPTION_STATUSES.has(subscription.status))
    .sort((a, b) => (b.created || 0) - (a.created || 0))[0] || null;
}

function pickLatestSubscription(subscriptions) {
  return (subscriptions || [])
    .sort((a, b) => (b.created || 0) - (a.created || 0))[0] || null;
}

async function findStripeCustomersByEmail(userEmail) {
  const normalizedEmail = normalizeEmail(userEmail);
  if (!normalizedEmail) return [];

  const candidateEmails = Array.from(new Set([
    userEmail,
    normalizedEmail,
    normalizedEmail.toUpperCase()
  ].filter(Boolean)));

  const customers = [];

  for (const candidateEmail of candidateEmails) {
    const result = await stripe.customers.list({
      email: candidateEmail,
      limit: 10
    });
    customers.push(...result.data);
  }

  const uniqueCustomers = Array.from(
    new Map(customers.map((customer) => [customer.id, customer])).values()
  );

  return uniqueCustomers;
}

async function findStripeCustomersByCandidateEmails(candidateEmails) {
  const normalizedCandidates = Array.from(
    new Set((candidateEmails || []).map(normalizeEmail).filter(Boolean))
  );

  const matchedCustomers = [];
  const seenCustomerIds = new Set();

  for (const email of normalizedCandidates) {
    const customers = await findStripeCustomersByEmail(email);
    for (const customer of customers) {
      if (seenCustomerIds.has(customer.id)) continue;
      seenCustomerIds.add(customer.id);
      matchedCustomers.push({
        customer,
        matchedEmail: email
      });
    }
  }

  return matchedCustomers;
}

async function listAllCustomerSubscriptions(customerId) {
  const subscriptions = [];
  let startingAfter = null;

  do {
    const page = await stripe.subscriptions.list({
      customer: customerId,
      status: 'all',
      limit: 100,
      starting_after: startingAfter || undefined,
      expand: ['data.default_payment_method']
    });

    subscriptions.push(...page.data);
    startingAfter = page.has_more && page.data.length > 0
      ? page.data[page.data.length - 1].id
      : null;
  } while (startingAfter);

  return subscriptions;
}

async function listAllCustomerInvoices(customerId) {
  const invoices = [];
  let startingAfter = null;

  do {
    const page = await stripe.invoices.list({
      customer: customerId,
      limit: 100,
      starting_after: startingAfter || undefined
    });

    invoices.push(...page.data);
    startingAfter = page.has_more && page.data.length > 0
      ? page.data[page.data.length - 1].id
      : null;
  } while (startingAfter);

  return invoices;
}

async function extractPaymentMethodDetails(subscription) {
  if (!subscription.default_payment_method) {
    return { paymentMethodBrand: null, paymentMethodLast4: null };
  }

  let paymentMethod = subscription.default_payment_method;

  if (typeof paymentMethod === 'string') {
    paymentMethod = await stripe.paymentMethods.retrieve(paymentMethod);
  }

  return {
    paymentMethodBrand: paymentMethod?.card?.brand || null,
    paymentMethodLast4: paymentMethod?.card?.last4 || null
  };
}

let warnedMissingInvoiceColumns = false;

async function upsertInvoiceWithCompatibility({ invoice, stripeCustomerId, userId, logContext }) {
  const normalizedOrderStatus = mapStripeInvoiceStatusToOrderStatus(invoice.status);
  const paidAt = invoice.status_transitions?.paid_at
    ? new Date(invoice.status_transitions.paid_at * 1000)
    : null;
  const dueDate = invoice.due_date
    ? new Date(invoice.due_date * 1000)
    : null;

  try {
    await sql`
      INSERT INTO stripe_orders (
        checkout_session_id,
        payment_intent_id,
        stripe_invoice_id,
        stripe_customer_id,
        user_id,
        status,
        stripe_status,
        amount_total,
        amount_subtotal,
        currency,
        paid_at,
        due_date,
        period_start,
        period_end,
        attempt_count,
        hosted_invoice_url,
        invoice_pdf,
        created_at,
        updated_at
      )
      VALUES (
        ${invoice.id},
        ${typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.id},
        ${invoice.id},
        ${stripeCustomerId},
        ${userId},
        ${normalizedOrderStatus},
        ${invoice.status || null},
        ${invoice.total ?? invoice.amount_paid ?? invoice.amount_due ?? 0},
        ${invoice.subtotal ?? invoice.total ?? 0},
        ${invoice.currency || 'brl'},
        ${paidAt},
        ${dueDate},
        ${invoice.period_start || null},
        ${invoice.period_end || null},
        ${invoice.attempt_count ?? 0},
        ${invoice.hosted_invoice_url || null},
        ${invoice.invoice_pdf || null},
        ${new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000)},
        NOW()
      )
      ON CONFLICT (checkout_session_id) DO UPDATE SET
        payment_intent_id = EXCLUDED.payment_intent_id,
        stripe_invoice_id = EXCLUDED.stripe_invoice_id,
        stripe_customer_id = EXCLUDED.stripe_customer_id,
        user_id = EXCLUDED.user_id,
        status = EXCLUDED.status,
        stripe_status = EXCLUDED.stripe_status,
        amount_total = EXCLUDED.amount_total,
        amount_subtotal = EXCLUDED.amount_subtotal,
        currency = EXCLUDED.currency,
        paid_at = EXCLUDED.paid_at,
        due_date = EXCLUDED.due_date,
        period_start = EXCLUDED.period_start,
        period_end = EXCLUDED.period_end,
        attempt_count = EXCLUDED.attempt_count,
        hosted_invoice_url = EXCLUDED.hosted_invoice_url,
        invoice_pdf = EXCLUDED.invoice_pdf,
        updated_at = NOW()
    `;
    return;
  } catch (error) {
    // Compatibilidade para bases sem as colunas novas da migration 004
    if (error?.code !== '42703') {
      throw error;
    }
    if (!warnedMissingInvoiceColumns) {
      warnedMissingInvoiceColumns = true;
      console.warn(`⚠️ ${logContext} Colunas detalhadas de invoice ausentes em stripe_orders; usando modo compatível.`);
    }
  }

  await sql`
    INSERT INTO stripe_orders (
      checkout_session_id,
      payment_intent_id,
      stripe_customer_id,
      user_id,
      status,
      amount_total,
      amount_subtotal,
      currency,
      created_at,
      updated_at
    )
    VALUES (
      ${invoice.id},
      ${typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.id},
      ${stripeCustomerId},
      ${userId},
      ${normalizedOrderStatus},
      ${invoice.total ?? invoice.amount_paid ?? invoice.amount_due ?? 0},
      ${invoice.subtotal ?? invoice.total ?? 0},
      ${invoice.currency || 'brl'},
      ${new Date((invoice.created || Math.floor(Date.now() / 1000)) * 1000)},
      NOW()
    )
    ON CONFLICT (checkout_session_id) DO UPDATE SET
      payment_intent_id = EXCLUDED.payment_intent_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      user_id = EXCLUDED.user_id,
      status = EXCLUDED.status,
      amount_total = EXCLUDED.amount_total,
      amount_subtotal = EXCLUDED.amount_subtotal,
      currency = EXCLUDED.currency,
      updated_at = NOW()
  `;
}

async function syncStripeDataForUser({
  userId,
  userEmail,
  explicitEmail = null,
  explicitStripeCustomerId = null,
  syncInvoices = false,
  logContext = '[SYNC]'
}) {
  const companyResult = await sql`
    SELECT c.email
    FROM users u
    LEFT JOIN companies c ON c.id = u.company_id
    WHERE u.id = ${userId}
    LIMIT 1
  `;

  const companyEmail = companyResult[0]?.email || null;
  const candidateEmails = explicitEmail
    ? [explicitEmail]
    : [companyEmail, userEmail];
  const normalizedCandidates = Array.from(
    new Set(candidateEmails.map(normalizeEmail).filter(Boolean))
  );

  console.log(`🔄 ${logContext} Candidate emails:`, normalizedCandidates);
  if (explicitStripeCustomerId) {
    console.log(`🔄 ${logContext} Explicit Stripe customer ID recebido:`, explicitStripeCustomerId);
  }

  if (normalizedCandidates.length === 0) {
    return {
      success: false,
      httpStatus: 400,
      error: 'Usuário sem e-mail válido para sincronização',
      details: {}
    };
  }

  const customerCandidates = [];

  if (explicitStripeCustomerId) {
    let explicitCustomer = null;
    try {
      explicitCustomer = await stripe.customers.retrieve(explicitStripeCustomerId);
    } catch {
      return {
        success: false,
        httpStatus: 404,
        error: 'Customer Stripe informado não foi encontrado',
        details: {}
      };
    }

    if (!explicitCustomer || explicitCustomer.deleted) {
      return {
        success: false,
        httpStatus: 404,
        error: 'Customer Stripe informado não foi encontrado',
        details: {}
      };
    }
    customerCandidates.push({
      customer: explicitCustomer,
      matchedEmail: normalizeEmail(explicitCustomer.email || explicitEmail || userEmail)
    });
  } else {
    customerCandidates.push(...await findStripeCustomersByCandidateEmails(normalizedCandidates));
  }

  if (customerCandidates.length === 0) {
    return {
      success: false,
      httpStatus: 404,
      error: 'Nenhum cliente no Stripe encontrado para este e-mail',
      details: {
        candidate_emails: normalizedCandidates
      }
    };
  }

  let selectedCandidate = null;
  let selectedSubscription = null;
  let selectedScore = -1;
  let selectedCreatedAt = -1;
  const checkedCustomers = [];

  for (const candidate of customerCandidates) {
    const allSubscriptions = await listAllCustomerSubscriptions(candidate.customer.id);
    const preferredSubscription =
      pickMostRelevantSubscription(allSubscriptions) || pickLatestSubscription(allSubscriptions);

    checkedCustomers.push({
      customer_id: candidate.customer.id,
      email: candidate.customer.email || null,
      subscriptions_found: allSubscriptions.length,
      chosen_status: preferredSubscription?.status || null
    });

    if (!preferredSubscription) continue;

    const isSyncableStatus = SYNCABLE_SUBSCRIPTION_STATUSES.has(preferredSubscription.status);
    const score = isSyncableStatus ? 2 : 1;
    const createdAt = preferredSubscription.created || 0;

    if (score > selectedScore || (score === selectedScore && createdAt > selectedCreatedAt)) {
      selectedCandidate = candidate;
      selectedSubscription = preferredSubscription;
      selectedScore = score;
      selectedCreatedAt = createdAt;
    }
  }

  if (!selectedCandidate || !selectedSubscription) {
    console.log(`❌ ${logContext} Nenhuma assinatura encontrada para os customers candidatos:`, checkedCustomers);
    return {
      success: false,
      httpStatus: 404,
      error: 'Cliente encontrado, mas sem assinaturas para sincronizar',
      details: {
        candidate_emails: normalizedCandidates,
        checked_customers: checkedCustomers
      }
    };
  }

  const stripeCustomer = selectedCandidate.customer;
  let stripeSubscription = selectedSubscription;
  try {
    stripeSubscription = await stripe.subscriptions.retrieve(selectedSubscription.id, {
      expand: ['default_payment_method']
    });
  } catch (retrieveError) {
    console.error(`⚠️ ${logContext} Falha ao recuperar subscription completa, usando payload da listagem:`, retrieveError?.message || retrieveError);
  }

  const matchedEmail = selectedCandidate.matchedEmail;
  const customerEmail = stripeCustomer.email || matchedEmail || normalizedCandidates[0];
  console.log(`✅ ${logContext} Customer selecionado:`, {
    customer_id: stripeCustomer.id,
    customer_email: stripeCustomer.email,
    matched_email: matchedEmail,
    subscription_id: stripeSubscription.id,
    subscription_status: stripeSubscription.status,
    current_period_start: stripeSubscription.current_period_start || stripeSubscription.items?.data?.[0]?.current_period_start || null,
    current_period_end: stripeSubscription.current_period_end || stripeSubscription.items?.data?.[0]?.current_period_end || null
  });

  await sql`
    INSERT INTO stripe_customers (stripe_customer_id, email, name, user_id, created_at, updated_at)
    VALUES (${stripeCustomer.id}, ${customerEmail}, ${stripeCustomer.name || ''}, ${userId}, NOW(), NOW())
    ON CONFLICT (stripe_customer_id) DO UPDATE SET
      email = EXCLUDED.email,
      name = EXCLUDED.name,
      user_id = EXCLUDED.user_id,
      updated_at = NOW()
  `;

  const { paymentMethodBrand, paymentMethodLast4 } = await extractPaymentMethodDetails(stripeSubscription);
  const subscriptionItem = stripeSubscription.items?.data?.[0] || null;
  const synchronizedPriceId = subscriptionItem?.price?.id || null;
  const synchronizedPeriodStart =
    stripeSubscription.current_period_start || subscriptionItem?.current_period_start || null;
  const synchronizedPeriodEnd =
    stripeSubscription.current_period_end || subscriptionItem?.current_period_end || null;

  let synchronizedPlanName = null;
  if (synchronizedPriceId) {
    try {
      const stripePrice = await stripe.prices.retrieve(synchronizedPriceId, {
        expand: ['product']
      });
      synchronizedPlanName = stripePrice?.product?.name || null;
    } catch (priceError) {
      console.error('Erro ao buscar nome do plano no Stripe:', priceError?.message || priceError);
    }
  }

  await sql`
    INSERT INTO stripe_subscriptions (
      user_id,
      stripe_subscription_id,
      stripe_customer_id,
      status,
      price_id,
      current_period_start,
      current_period_end,
      cancel_at_period_end,
      payment_method_brand,
      payment_method_last4,
      created_at,
      updated_at
    )
    VALUES (
      ${userId},
      ${stripeSubscription.id},
      ${stripeCustomer.id},
      ${stripeSubscription.status},
      ${synchronizedPriceId},
      ${synchronizedPeriodStart},
      ${synchronizedPeriodEnd},
      ${stripeSubscription.cancel_at_period_end || false},
      ${paymentMethodBrand},
      ${paymentMethodLast4},
      ${new Date((stripeSubscription.created || Math.floor(Date.now() / 1000)) * 1000)},
      NOW()
    )
    ON CONFLICT (stripe_subscription_id) DO UPDATE SET
      user_id = EXCLUDED.user_id,
      stripe_customer_id = EXCLUDED.stripe_customer_id,
      status = EXCLUDED.status,
      price_id = EXCLUDED.price_id,
      current_period_start = EXCLUDED.current_period_start,
      current_period_end = EXCLUDED.current_period_end,
      cancel_at_period_end = EXCLUDED.cancel_at_period_end,
      payment_method_brand = EXCLUDED.payment_method_brand,
      payment_method_last4 = EXCLUDED.payment_method_last4,
      updated_at = NOW()
  `;

  if (synchronizedPlanName) {
    await sql`
      UPDATE companies c
      SET
        plan_contracted = ${synchronizedPlanName},
        updated_at = NOW()
      FROM users u
      WHERE u.id = ${userId}
      AND c.id = u.company_id
    `;
  }

  let invoicesSynced = 0;
  if (syncInvoices) {
    const stripeInvoices = await listAllCustomerInvoices(stripeCustomer.id);
    for (const invoice of stripeInvoices) {
      await upsertInvoiceWithCompatibility({
        invoice,
        stripeCustomerId: stripeCustomer.id,
        userId,
        logContext
      });
      invoicesSynced += 1;
    }
    console.log(`✅ ${logContext} Faturas sincronizadas:`, invoicesSynced);
  }

  return {
    success: true,
    stripeCustomer,
    stripeSubscription,
    matchedEmail,
    normalizedCandidates,
    synchronizedPriceId,
    synchronizedPlanName,
    invoicesSynced
  };
}

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

    // Sincronização automática no login/carregamento do dashboard
    try {
      await syncStripeDataForUser({
        userId,
        userEmail: req.user.email,
        syncInvoices: false,
        logContext: '[AUTO-SYNC SUBSCRIPTION]'
      });
    } catch (autoSyncError) {
      console.error('⚠️ Falha na sincronização automática de assinatura:', autoSyncError?.message || autoSyncError);
    }
    
    // Buscar assinatura do usuário
    const subscriptionResult = await sql`
      SELECT 
        ss.*,
        c.name as company_name,
        c.plan_contracted
      FROM stripe_subscriptions ss
      LEFT JOIN users u ON u.id = ss.user_id
      LEFT JOIN companies c ON c.id = u.company_id
      WHERE ss.user_id = ${req.user.id}
      AND ss.status IN (${VISIBLE_SUBSCRIPTION_STATUSES[0]}, ${VISIBLE_SUBSCRIPTION_STATUSES[1]}, ${VISIBLE_SUBSCRIPTION_STATUSES[2]}, ${VISIBLE_SUBSCRIPTION_STATUSES[3]}, ${VISIBLE_SUBSCRIPTION_STATUSES[4]})
      ORDER BY ss.created_at DESC
      LIMIT 1
    `;
    
    if (subscriptionResult.length === 0) {
      console.log('❌ Nenhuma assinatura encontrada');
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

// Sincronizar assinatura existente no Stripe com base no e-mail do usuário
router.post('/sync', authenticateUser, async (req, res) => {
  try {
    const syncResult = await syncStripeDataForUser({
      userId: req.user.id,
      userEmail: req.user.email,
      explicitEmail: req.body?.email,
      explicitStripeCustomerId: req.body?.stripe_customer_id,
      syncInvoices: true,
      logContext: '[SYNC]'
    });

    if (!syncResult.success) {
      return res.status(syncResult.httpStatus || 400).json({
        error: syncResult.error,
        details: syncResult.details
      });
    }

    res.json({
      success: true,
      message: 'Plano sincronizado com sucesso',
      subscription: {
        id: syncResult.stripeSubscription.id,
        status: syncResult.stripeSubscription.status,
        price_id: syncResult.synchronizedPriceId,
        plan_name: syncResult.synchronizedPlanName,
        stripe_customer_id: syncResult.stripeCustomer.id,
        customer_email: syncResult.stripeCustomer.email || syncResult.matchedEmail,
        matched_email: syncResult.matchedEmail,
        candidate_emails: syncResult.normalizedCandidates
      },
      invoices_synced: syncResult.invoicesSynced
    });
  } catch (error) {
    console.error('Erro ao sincronizar assinatura existente:', error);
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

    // Sincronização automática de faturamento ao abrir dashboard/login
    try {
      await syncStripeDataForUser({
        userId,
        userEmail: req.user.email,
        syncInvoices: true,
        logContext: '[AUTO-SYNC INVOICES]'
      });
    } catch (autoSyncError) {
      console.error('⚠️ Falha na sincronização automática de faturamento:', autoSyncError?.message || autoSyncError);
    }

    let invoices = [];
    try {
      invoices = await sql`
        WITH customer_ids AS (
          SELECT stripe_customer_id
          FROM stripe_customers
          WHERE user_id = ${userId}
        )
        SELECT
          id,
          checkout_session_id,
          payment_intent_id,
          stripe_invoice_id,
          status,
          stripe_status,
          amount_total,
          amount_subtotal,
          currency,
          paid_at,
          due_date,
          period_start,
          period_end,
          attempt_count,
          hosted_invoice_url,
          invoice_pdf,
          created_at,
          updated_at
        FROM stripe_orders
        WHERE user_id = ${userId}
        OR stripe_customer_id IN (SELECT stripe_customer_id FROM customer_ids)
        ORDER BY COALESCE(paid_at, created_at) DESC
        LIMIT 100
      `;
    } catch (error) {
      if (error?.code !== '42703') throw error;
      if (!warnedMissingInvoiceColumns) {
        warnedMissingInvoiceColumns = true;
        console.warn('⚠️ [INVOICES] Colunas detalhadas ausentes em stripe_orders; carregando modo compatível.');
      }
      invoices = await sql`
        WITH customer_ids AS (
          SELECT stripe_customer_id
          FROM stripe_customers
          WHERE user_id = ${userId}
        )
        SELECT
          id,
          checkout_session_id,
          payment_intent_id,
          NULL::VARCHAR AS stripe_invoice_id,
          status,
          NULL::VARCHAR AS stripe_status,
          amount_total,
          amount_subtotal,
          currency,
          NULL::TIMESTAMPTZ AS paid_at,
          NULL::TIMESTAMPTZ AS due_date,
          NULL::BIGINT AS period_start,
          NULL::BIGINT AS period_end,
          NULL::INTEGER AS attempt_count,
          NULL::TEXT AS hosted_invoice_url,
          NULL::TEXT AS invoice_pdf,
          created_at,
          updated_at
        FROM stripe_orders
        WHERE user_id = ${userId}
        OR stripe_customer_id IN (SELECT stripe_customer_id FROM customer_ids)
        ORDER BY created_at DESC
        LIMIT 100
      `;
    }

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

// Obter detalhes de uma fatura específica
router.get('/invoices/:invoiceId', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id;
    const invoiceId = (req.params.invoiceId || '').trim();

    if (!invoiceId) {
      return res.status(400).json({
        error: 'ID da fatura é obrigatório'
      });
    }

    let orderResult = [];
    try {
      orderResult = await sql`
        WITH customer_ids AS (
          SELECT stripe_customer_id
          FROM stripe_customers
          WHERE user_id = ${userId}
        )
        SELECT
          id,
          checkout_session_id,
          payment_intent_id,
          stripe_invoice_id,
          stripe_customer_id,
          status,
          stripe_status,
          amount_total,
          amount_subtotal,
          currency,
          paid_at,
          due_date,
          period_start,
          period_end,
          attempt_count,
          hosted_invoice_url,
          invoice_pdf,
          created_at,
          updated_at
        FROM stripe_orders
        WHERE (
          checkout_session_id = ${invoiceId}
          OR payment_intent_id = ${invoiceId}
          OR stripe_invoice_id = ${invoiceId}
        )
        AND (
          user_id = ${userId}
          OR stripe_customer_id IN (SELECT stripe_customer_id FROM customer_ids)
        )
        ORDER BY created_at DESC
        LIMIT 1
      `;
    } catch (error) {
      if (error?.code !== '42703') throw error;
      if (!warnedMissingInvoiceColumns) {
        warnedMissingInvoiceColumns = true;
        console.warn('⚠️ [INVOICE DETAILS] Colunas detalhadas ausentes em stripe_orders; carregando modo compatível.');
      }
      orderResult = await sql`
        WITH customer_ids AS (
          SELECT stripe_customer_id
          FROM stripe_customers
          WHERE user_id = ${userId}
        )
        SELECT
          id,
          checkout_session_id,
          payment_intent_id,
          NULL::VARCHAR AS stripe_invoice_id,
          stripe_customer_id,
          status,
          NULL::VARCHAR AS stripe_status,
          amount_total,
          amount_subtotal,
          currency,
          NULL::TIMESTAMPTZ AS paid_at,
          NULL::TIMESTAMPTZ AS due_date,
          NULL::BIGINT AS period_start,
          NULL::BIGINT AS period_end,
          NULL::INTEGER AS attempt_count,
          NULL::TEXT AS hosted_invoice_url,
          NULL::TEXT AS invoice_pdf,
          created_at,
          updated_at
        FROM stripe_orders
        WHERE (
          checkout_session_id = ${invoiceId}
          OR payment_intent_id = ${invoiceId}
        )
        AND (
          user_id = ${userId}
          OR stripe_customer_id IN (SELECT stripe_customer_id FROM customer_ids)
        )
        ORDER BY created_at DESC
        LIMIT 1
      `;
    }

    if (orderResult.length === 0) {
      return res.status(404).json({
        error: 'Fatura não encontrada para este usuário'
      });
    }

    const order = orderResult[0];
    let stripeInvoiceId = null;

    if (order.stripe_invoice_id?.startsWith('in_')) {
      stripeInvoiceId = order.stripe_invoice_id;
    } else if (order.checkout_session_id?.startsWith('in_')) {
      stripeInvoiceId = order.checkout_session_id;
    } else if (order.payment_intent_id?.startsWith('in_')) {
      stripeInvoiceId = order.payment_intent_id;
    } else if (invoiceId.startsWith('in_')) {
      stripeInvoiceId = invoiceId;
    }

    if (!stripeInvoiceId) {
      return res.json({
        source: 'local',
        order,
        invoice: null,
        warning: 'Detalhes completos indisponíveis para este registro.'
      });
    }

    try {
      const stripeInvoice = await stripe.invoices.retrieve(stripeInvoiceId, {
        expand: ['payment_intent', 'lines.data.price.product']
      });

      const lines = (stripeInvoice.lines?.data || []).map((line) => ({
        id: line.id,
        description: line.description || 'Item',
        amount: line.amount || 0,
        currency: line.currency || stripeInvoice.currency,
        quantity: line.quantity || 1,
        period_start: line.period?.start || null,
        period_end: line.period?.end || null,
        price_id: line.price?.id || null,
        product_name: line.price?.product?.name || null
      }));

      return res.json({
        source: 'stripe',
        order,
        invoice: {
          id: stripeInvoice.id,
          number: stripeInvoice.number,
          status: stripeInvoice.status,
          billing_reason: stripeInvoice.billing_reason,
          created: stripeInvoice.created,
          due_date: stripeInvoice.due_date,
          period_start: stripeInvoice.period_start,
          period_end: stripeInvoice.period_end,
          paid_at: stripeInvoice.status_transitions?.paid_at || null,
          finalized_at: stripeInvoice.status_transitions?.finalized_at || null,
          hosted_invoice_url: stripeInvoice.hosted_invoice_url,
          invoice_pdf: stripeInvoice.invoice_pdf,
          currency: stripeInvoice.currency,
          subtotal: stripeInvoice.subtotal,
          total: stripeInvoice.total,
          amount_paid: stripeInvoice.amount_paid,
          amount_due: stripeInvoice.amount_due,
          attempt_count: stripeInvoice.attempt_count,
          next_payment_attempt: stripeInvoice.next_payment_attempt,
          payment_intent_id: typeof stripeInvoice.payment_intent === 'string'
            ? stripeInvoice.payment_intent
            : stripeInvoice.payment_intent?.id || null,
          lines
        }
      });
    } catch (stripeError) {
      console.error('Erro ao recuperar detalhes da fatura no Stripe:', stripeError?.message || stripeError);
      return res.json({
        source: 'local',
        order,
        invoice: null,
        warning: 'Não foi possível carregar detalhes completos da fatura no Stripe agora.'
      });
    }
  } catch (error) {
    console.error('Erro ao buscar detalhes da fatura:', error);
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
      if (!PUBLIC_SUBSCRIPTION_PRICE_IDS.has(price.id)) {
        return null;
      }

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
    }).filter(Boolean);

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
