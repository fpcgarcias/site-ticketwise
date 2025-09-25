import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CheckCircle, CreditCard, Calendar, User } from 'lucide-react';

const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  
  const planId = searchParams.get('plan');
  const isAnnual = planId?.includes('_annual');
  const basePlanId = planId?.replace('_annual', '').replace('_monthly', '');

  // Planos disponíveis (dados reais do Stripe)
  const plans = {
    basic: {
      name: 'Básico',
      monthly: 119,
      annual: 101,
      productId: 'prod_SzInCLsRZbGZbk',
      priceIdMonthly: 'price_1S3KBfJrnNh1FDmnnPMtWGVv',
      priceIdAnnual: 'price_1S3KE7JrnNh1FDmnLtAd7SD8'
    },
    pro: {
      name: 'Professional',
      monthly: 199,
      annual: 169,
      productId: 'prod_SzIoCGhsjjYaPU',
      priceIdMonthly: 'price_1S3KCVJrnNh1FDmn8bvDvan7',
      priceIdAnnual: 'price_1S3KE7JrnNh1FDmnLtAd7SD8'
    },
    enterprise: { 
      name: 'Enterprise', 
      monthly: 299, 
      annual: 254,
      productId: 'prod_SzIpJgbybcopWu',
      priceIdMonthly: 'price_1S3KDPJrnNh1FDmnZl2MA8c8',
      priceIdAnnual: 'price_1S3KE7JrnNh1FDmnLtAd7SD8'
    }
  };

  const plan = plans[basePlanId as keyof typeof plans];

  // Debug
  console.log('CheckoutPage - planId:', planId);
  console.log('CheckoutPage - basePlanId:', basePlanId);
  console.log('CheckoutPage - isAnnual:', isAnnual);
  console.log('CheckoutPage - plan:', plan);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const priceId = isAnnual ? plan.priceIdAnnual : plan.priceIdMonthly;
      
      console.log('Iniciando checkout para:', {
        user: user.email,
        plan: basePlanId,
        annual: isAnnual,
        price: isAnnual ? plan.annual : plan.monthly,
        priceId: priceId,
        productId: plan.productId
      });
      
      // Redirecionar para Stripe Checkout
      const response = await fetch('http://localhost:3001/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          price_id: priceId,
          success_url: `${window.location.origin}/success`,
          cancel_url: `${window.location.origin}/pricing?action=subscribe`,
          customer_email: user?.email,
          customer_data: {
            email: user?.email,
            name: user?.name,
            couponCode: couponCode || undefined
          }
        })
      });

      const data = await response.json();
      
      if (data.success && data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Erro ao criar sessão de checkout');
      }
      
    } catch (error) {
      console.error('Erro no checkout:', error);
      alert('Erro ao processar pagamento: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plano não encontrado</h1>
          <button
            onClick={() => navigate('/pricing')}
            className="text-purple-600 hover:text-purple-700"
          >
            Voltar aos planos
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 pt-24 pb-16">
      <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-6">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-2">Finalizar Contratação</h1>
              <p className="text-purple-100">Você está logado como {user?.name || user?.email}</p>
            </div>
          </div>

          {/* Plano selecionado */}
          <div className="px-6 py-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Plano {plan.name}</h2>
              <p className="text-gray-600 mb-4">
                {isAnnual ? 'Cobrança anual' : 'Cobrança mensal'}
              </p>
              <div className="bg-purple-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="text-4xl font-bold text-purple-600 mb-1">
                  R$ {isAnnual ? plan.annual : plan.monthly}
                </div>
                <div className="text-sm text-purple-500 font-medium">
                  {isAnnual ? 'por ano' : 'por mês'}
                </div>
              </div>
            </div>

            {/* Benefícios */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 text-center">Incluído no plano:</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Acesso completo à plataforma</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Suporte prioritário</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                  <span className="text-gray-700">Atualizações automáticas</span>
                </div>
                {isAnnual && (
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-3 flex-shrink-0" />
                    <span className="text-gray-700 font-medium">Desconto de 2 meses grátis</span>
                  </div>
                )}
              </div>
            </div>

            {/* Campo de cupom */}
            <div className="mb-6">
              <label htmlFor="coupon" className="block text-sm font-medium text-gray-700 mb-2">
                Cupom de desconto (opcional)
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="coupon"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  placeholder="Digite seu cupom aqui"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
              </div>
              {couponCode && (
                <p className="mt-2 text-sm text-purple-600">
                  ✨ Cupom "{couponCode}" será aplicado no checkout
                </p>
              )}
            </div>

            {/* Botão de checkout */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:from-purple-700 hover:to-purple-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processando...
                </span>
              ) : (
                'Contratar Agora'
              )}
            </button>

            {/* Informações de segurança */}
            <div className="mt-6 text-center">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                <span>Pagamento seguro processado pelo Stripe</span>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Seus dados estão protegidos com criptografia SSL
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
