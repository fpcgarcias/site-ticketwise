import React, { useEffect, useRef, useState } from 'react';
import { CreditCard, X, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';
import { getStripe } from '../lib/stripe';
import type { Stripe, StripeCardElement } from '@stripe/stripe-js';

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PaymentMethodModal: React.FC<PaymentMethodModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cardholderName, setCardholderName] = useState('');
  const [setupIntentClientSecret, setSetupIntentClientSecret] = useState<string | null>(null);

  const cardContainerRef = useRef<HTMLDivElement | null>(null);
  const stripeRef = useRef<Stripe | null>(null);
  const cardElementRef = useRef<StripeCardElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    let isMounted = true;
    setInitializing(true);
    setError(null);

    const setupCardElement = async () => {
      try {
        const stripe = await getStripe();
        if (!stripe) {
          throw new Error('Não foi possível carregar o Stripe');
        }

        const setupIntent = await api.createSetupIntent();
        if (!setupIntent.client_secret) {
          throw new Error('Não foi possível preparar a atualização do cartão');
        }

        if (!isMounted) {
          return;
        }

        const elements = stripe.elements({ clientSecret: setupIntent.client_secret });
        const cardElement = elements.create('card', {
          hidePostalCode: true,
          style: {
            base: {
              fontSize: '16px',
              color: '#111827',
              '::placeholder': {
                color: '#9CA3AF'
              }
            }
          }
        });

        if (!cardContainerRef.current) {
          return;
        }

        cardElement.mount(cardContainerRef.current);
        stripeRef.current = stripe;
        cardElementRef.current = cardElement;
        setSetupIntentClientSecret(setupIntent.client_secret);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao preparar formulário de cartão';
        setError(message);
      } finally {
        if (isMounted) {
          setInitializing(false);
        }
      }
    };

    setupCardElement();

    return () => {
      isMounted = false;
      cardElementRef.current?.destroy();
      cardElementRef.current = null;
      stripeRef.current = null;
      setSetupIntentClientSecret(null);
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const stripe = stripeRef.current;
      const cardElement = cardElementRef.current;
      const clientSecret = setupIntentClientSecret;

      if (!stripe || !cardElement || !clientSecret) {
        throw new Error('O formulário de pagamento ainda não está pronto');
      }

      const { setupIntent, error: setupError } = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardholderName || undefined
          }
        }
      });

      if (setupError) {
        throw new Error(setupError.message || 'Não foi possível validar o cartão');
      }

      const paymentMethodId =
        typeof setupIntent?.payment_method === 'string'
          ? setupIntent.payment_method
          : setupIntent?.payment_method?.id;

      if (!paymentMethodId) {
        throw new Error('Não foi possível identificar o novo método de pagamento');
      }

      await api.updatePaymentMethod(paymentMethodId);
      onSuccess();
      onClose();
      setCardholderName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <CreditCard className="h-5 w-5 mr-2" />
            Atualizar Cartão de Crédito
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome no Cartão</label>
            <input
              type="text"
              value={cardholderName}
              onChange={(e) => setCardholderName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="João Silva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dados do Cartão</label>
            <div className="w-full px-3 py-3 border border-gray-300 rounded-md">
              {initializing ? (
                <span className="text-sm text-gray-500">Carregando formulário seguro...</span>
              ) : (
                <div ref={cardContainerRef} />
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
              disabled={loading || initializing}
            >
              {loading ? 'Atualizando...' : 'Atualizar Cartão'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentMethodModal;
