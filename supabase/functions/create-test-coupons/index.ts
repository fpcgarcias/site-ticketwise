import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'TicketWise Coupon Creator',
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

Deno.serve(async (req) => {
  try {
    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    console.log('Creating test coupons...');

    // Criar cupons de teste
    const testCoupons = [
      {
        id: 'WELCOME10',
        percent_off: 10,
        duration: 'once',
        name: 'Desconto de Boas-vindas 10%'
      },
      {
        id: 'SAVE20',
        percent_off: 20,
        duration: 'once',
        name: 'Economia de 20%'
      },
      {
        id: 'FIRST50',
        amount_off: 5000, // R$ 50.00 em centavos
        currency: 'brl',
        duration: 'once',
        name: 'R$ 50 de desconto'
      },
      {
        id: 'LOYAL25',
        percent_off: 25,
        duration: 'repeating',
        duration_in_months: 3,
        name: 'Desconto de Lealdade 25% por 3 meses'
      }
    ];

    const createdCoupons = [];

    for (const couponData of testCoupons) {
      try {
        // Verificar se cupom já existe
        try {
          await stripe.coupons.retrieve(couponData.id);
          console.log(`Coupon ${couponData.id} already exists, skipping...`);
          createdCoupons.push({ ...couponData, status: 'already_exists' });
          continue;
        } catch (error: any) {
          if (error.code !== 'resource_missing') {
            throw error;
          }
        }

        // Criar cupom
        const coupon = await stripe.coupons.create(couponData);
        console.log(`Created coupon: ${coupon.id}`);
        createdCoupons.push({ 
          id: coupon.id, 
          name: coupon.name,
          percent_off: coupon.percent_off,
          amount_off: coupon.amount_off,
          currency: coupon.currency,
          duration: coupon.duration,
          status: 'created' 
        });
      } catch (error: any) {
        console.error(`Failed to create coupon ${couponData.id}:`, error.message);
        createdCoupons.push({ 
          ...couponData, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    return corsResponse({
      success: true,
      message: 'Test coupons creation completed',
      coupons: createdCoupons
    });

  } catch (error: any) {
    console.error('Error creating test coupons:', error);
    return corsResponse({ 
      error: 'Failed to create test coupons',
      details: error.message 
    }, 500);
  }
}); 