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

    // Buscar todos os produtos do Stripe
    const products = await stripe.products.list({
      active: true,
      expand: ['data.default_price'],
      limit: 100,
    });

    // Processar e organizar os produtos
    const formattedProducts = products.data.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      metadata: product.metadata,
      default_price: product.default_price ? {
        id: (product.default_price as Stripe.Price).id,
        unit_amount: (product.default_price as Stripe.Price).unit_amount,
        currency: (product.default_price as Stripe.Price).currency,
        recurring: (product.default_price as Stripe.Price).recurring,
      } : null,
    }));

    return corsResponse({ products: formattedProducts });
  } catch (error: any) {
    console.error(`Products fetch error: ${error.message}`);
    return corsResponse({ error: error.message }, 500);
  }
}); 