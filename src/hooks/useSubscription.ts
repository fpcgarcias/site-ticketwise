import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getProductByPriceId } from '../lib/stripe';

type Subscription = {
  id: string | null;
  status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
  company_name?: string;
  plan_contracted?: string;
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const data = await api.request('/subscription');
        console.log('🔍 Dados recebidos do backend:', data);
        
        setSubscription(data.subscription);
        setProduct(data.product);
      } catch (err) {
        setError(err as Error);
        console.error('❌ Erro ao buscar subscription:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return {
    subscription,
    product,
    loading,
    error,
  };
}