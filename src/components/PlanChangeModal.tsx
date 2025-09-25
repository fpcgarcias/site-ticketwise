import React, { useState, useEffect } from 'react';
import { X, Check, Loader2 } from 'lucide-react';

interface Plan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
}

interface PlanChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlanId?: string;
}

const PlanChangeModal: React.FC<PlanChangeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPlanId
}) => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlanId, setSelectedPlanId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loadingPlans, setLoadingPlans] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchPlans();
    }
  }, [isOpen]);

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true);
      const response = await fetch('/api/subscription/plans', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data.plans || []);
      } else {
        setError('Erro ao carregar planos disponíveis');
      }
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      setError('Erro ao carregar planos disponíveis');
    } finally {
      setLoadingPlans(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedPlanId) {
      setError('Por favor, selecione um plano');
      return;
    }

    if (selectedPlanId === currentPlanId) {
      setError('Este já é o seu plano atual');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          newPriceId: selectedPlanId,
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao alterar plano');
      }
    } catch (error) {
      console.error('Erro ao alterar plano:', error);
      setError('Erro ao alterar plano. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price / 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Alterar Plano</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {loadingPlans ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
              <span className="ml-2 text-gray-600">Carregando planos...</span>
            </div>
          ) : (
            <div className="space-y-4 mb-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                    selectedPlanId === plan.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${
                    plan.id === currentPlanId
                      ? 'opacity-50 cursor-not-allowed'
                      : ''
                  }`}
                  onClick={() => {
                    if (plan.id !== currentPlanId) {
                      setSelectedPlanId(plan.id);
                      setError('');
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium text-gray-900">
                          {plan.name}
                          {plan.id === currentPlanId && (
                            <span className="ml-2 text-sm text-green-600 font-normal">
                              (Plano Atual)
                            </span>
                          )}
                        </h4>
                        {selectedPlanId === plan.id && plan.id !== currentPlanId && (
                          <Check className="h-5 w-5 text-purple-600 ml-2" />
                        )}
                      </div>
                      <p className="text-2xl font-bold text-gray-900 mt-1">
                        {formatPrice(plan.price)}
                        <span className="text-sm font-normal text-gray-600">/{plan.interval}</span>
                      </p>
                      {plan.features && plan.features.length > 0 && (
                        <ul className="mt-2 text-sm text-gray-600">
                          {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center">
                              <Check className="h-4 w-4 text-green-500 mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end space-x-4">
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
              disabled={loading || !selectedPlanId || selectedPlanId === currentPlanId || loadingPlans}
              className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {loading ? 'Alterando...' : 'Alterar Plano'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PlanChangeModal;