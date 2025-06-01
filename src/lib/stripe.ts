import { loadStripe } from '@stripe/stripe-js';
import { products } from '../stripe-config';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

// Interfaces para tipos de dados do Stripe
export interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  default_price: {
    id: string;
    unit_amount: number | null;
    currency: string;
    recurring: {
      interval: string;
      interval_count: number;
    } | null;
  } | null;
}

export interface StripePrice {
  id: string;
  product_id: string;
  unit_amount: number | null;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
  metadata: Record<string, string>;
  nickname: string | null;
  product: {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, string>;
  } | null;
}

// Função original mantida para compatibilidade
export async function createCheckoutSession(priceId: string, mode: 'payment' | 'subscription') {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify({
      price_id: priceId,
      success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/pricing`,
      mode,
    }),
  });

  const { sessionId, url, error } = await response.json();

  if (error) {
    throw new Error(error);
  }

  if (url) {
    window.location.href = url;
    return;
  }

  const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

  if (stripeError) {
    throw new Error(stripeError.message);
  }
}

// Função expandida para checkout com dados adicionais do cliente
export async function createCheckoutSessionWithCustomerData(
  priceId: string, 
  mode: 'payment' | 'subscription',
  customerData?: {
    name?: string;
    email?: string;
    cnpj?: string;
    razaoSocial?: string;
    additionalProducts?: string[];
    couponCode?: string;
  },
  isRegistration = false
) {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  // Sempre incluir headers básicos (inclusive Authorization)
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
  };

  const body: any = {
    price_id: priceId,
    success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${window.location.origin}/pricing`,
    mode,
    customer_data: customerData,
    is_registration: isRegistration,
  };

  console.log('🚀 Enviando dados para checkout:', body);
  console.log('🎟️ Cupom no body:', body.customer_data?.couponCode);

  const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('Erro na response:', errorText);
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
  }

  const responseData = await response.json();
  console.log('Response data:', responseData);

  const { sessionId, url, error } = responseData;

  if (error) {
    throw new Error(error);
  }

  if (url) {
    window.location.href = url;
    return;
  }

  if (sessionId) {
    const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
    if (stripeError) {
      throw new Error(stripeError.message);
    }
  } else {
    throw new Error('Nenhum sessionId ou URL retornado do servidor');
  }
}

// Buscar produtos do Stripe dinamicamente
export async function fetchStripeProducts(): Promise<StripeProduct[]> {
  try {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-products`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error('Erro ao buscar produtos do Stripe:', error);
    // Fallback para produtos locais em caso de erro
    return [];
  }
}

// Buscar preços do Stripe dinamicamente
export async function fetchStripePrices(productId?: string): Promise<StripePrice[]> {
  try {
    const url = productId 
      ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-prices?product_id=${productId}`
      : `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-prices`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.prices || [];
  } catch (error) {
    console.error('Erro ao buscar preços do Stripe:', error);
    return [];
  }
}

// Função original mantida para compatibilidade
export function getProductByPriceId(priceId: string) {
  return Object.values(products).find((product) => product.priceId === priceId);
}

// Função para formatar valores em Real
export function formatPrice(amount: number | null, currency = 'BRL'): string {
  if (amount === null) return 'Preço não disponível';
  
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

// Função para obter produtos organizados por categoria
export async function getOrganizedProducts() {
  try {
    const dynamicProducts = await fetchStripeProducts();
    const dynamicPrices = await fetchStripePrices();
    
    if (dynamicProducts.length > 0) {
      // Organizar produtos dinâmicos por categoria
      const subscriptions = dynamicProducts.filter(product => 
        product.default_price?.recurring !== null
      );
      const oneTimeProducts = dynamicProducts.filter(product => 
        product.default_price?.recurring === null
      );
      
      return {
        subscriptions,
        oneTimeProducts,
        prices: dynamicPrices,
      };
    }
  } catch (error) {
    console.error('Erro ao organizar produtos:', error);
  }
  
  // Fallback para produtos locais
  return {
    subscriptions: Object.entries(products).filter(([_, product]) => product.mode === 'subscription'),
    oneTimeProducts: Object.entries(products).filter(([_, product]) => product.mode === 'payment'),
    prices: [],
  };
}

// Função temporária para checkout direto (para teste/desenvolvimento)
export async function createCheckoutSessionDirect(
  priceId: string, 
  mode: 'payment' | 'subscription',
  customerData?: {
    name?: string;
    email?: string;
    cnpj?: string;
    razaoSocial?: string;
  }
) {
  const stripe = await stripePromise;

  if (!stripe) {
    throw new Error('Failed to load Stripe');
  }

  // Para desenvolvimento, vamos criar a sessão diretamente no frontend
  // ATENÇÃO: Em produção, isso deve ser feito no backend por segurança
  
  try {
    // Por enquanto, vamos simular a criação da sessão
    // Em produção real, você precisará de um endpoint backend
    
    // Redirecionamento temporário para página de sucesso para teste
    console.log('Dados para checkout:', {
      priceId,
      mode,
      customerData
    });
    
    // Para teste, vamos redirecionar para uma página de confirmação
    alert(`Checkout configurado com sucesso!\n\nPlano: ${priceId}\nModo: ${mode}\nEmail: ${customerData?.email}`);
    
    // Em um cenário real, aqui você faria:
    // window.location.href = '/success?session_id=test';
    
    return { success: true };
  } catch (error) {
    console.error('Erro no checkout direto:', error);
    throw error;
  }
}