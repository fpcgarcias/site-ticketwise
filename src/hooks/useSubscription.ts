import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import { getProductByPriceId } from '../lib/stripe';

type Subscription = {
  subscription_id: string | null;
  subscription_status: string;
  price_id: string | null;
  current_period_start: number | null;
  current_period_end: number | null;
  cancel_at_period_end: boolean;
  payment_method_brand: string | null;
  payment_method_last4: string | null;
};

export function useSubscription() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('/api/subscription');
        
        if (!response.ok) {
          throw new Error('Erro ao buscar dados da assinatura');
        }
        
        const data = await response.json();
        setSubscription(data.subscription);
        setProduct(data.product);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  const product = subscription?.price_id ? getProductByPriceId(subscription.price_id) : null;

  return {
    subscription,
    product,
    loading,
    error,
  };
}