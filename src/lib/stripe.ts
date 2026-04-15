import { loadStripe } from '@stripe/stripe-js/pure';
import { products } from '../stripe-config';
import { api } from './api';

// Desabilita sinais avançados de fraude apenas em desenvolvimento para evitar chamadas ao m.stripe.com
if (import.meta.env.DEV) {
  // setLoadParameters é exposto na variante "pure" como propriedade da função loadStripe
  // @ts-ignore - a tipagem pode não expor essa propriedade dependendo da versão
  loadStripe.setLoadParameters?.({ advancedFraudSignals: false });
}

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export async function getStripe() {
  return stripePromise;
}

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

  const response = await api.createCheckoutSession({
    price_id: priceId,
    success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${window.location.origin}/pricing`,
    mode,
  });

  const { sessionId, url, error } = response;

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

  // Headers não são mais necessários pois a API cuida da autenticação

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

  const responseData = await api.createCheckoutSession(body);
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
    const data = await api.getStripeProducts();
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
    const data = await api.getStripePrices(productId);
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
