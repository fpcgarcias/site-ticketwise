import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

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
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
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

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'GET') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    const url = new URL(req.url);
    const productId = url.searchParams.get('product_id');

    let prices;

    if (productId) {
      // Buscar preços para um produto específico
      prices = await stripe.prices.list({
        product: productId,
        active: true,
        expand: ['data.product'],
      });
    } else {
      // Buscar todos os preços
      prices = await stripe.prices.list({
        active: true,
        expand: ['data.product'],
        limit: 100,
      });
    }

    // Processar e organizar os preços
    const formattedPrices = prices.data.map(price => ({
      id: price.id,
      product_id: price.product,
      unit_amount: price.unit_amount,
      currency: price.currency,
      recurring: price.recurring,
      metadata: price.metadata,
      nickname: price.nickname,
      product: price.product && typeof price.product === 'object' ? {
        id: price.product.id,
        name: price.product.name,
        description: price.product.description,
        metadata: price.product.metadata,
      } : null,
    }));

    return corsResponse({ prices: formattedPrices });
  } catch (error: any) {
    console.error(`Prices fetch error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
}); 