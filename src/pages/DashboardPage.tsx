import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { useSubscription } from '../hooks/useSubscription';
import { useInvoices } from '../hooks/useInvoices';
import PaymentMethodModal from '../components/PaymentMethodModal';
import PlanChangeModal from '../components/PlanChangeModal';
import { 
  CreditCard, 
  Calendar, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Download,
  Settings,
  Package,
  Clock,
  DollarSign,
  FileText,
  Trash2,
  RefreshCw
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const { subscription, product, loading, error } = useSubscription();
  const { invoices, loading: invoicesLoading, error: invoicesError } = useInvoices();
  const [activeTab, setActiveTab] = useState<'overview' | 'subscription' | 'billing' | 'settings'>('overview');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);

  const formatDate = (timestamp: number | null) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp * 1000).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount / 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'canceled':
        return 'text-red-600 bg-red-100';
      case 'past_due':
        return 'text-yellow-600 bg-yellow-100';
      case 'trialing':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Ativo';
      case 'canceled':
        return 'Cancelado';
      case 'past_due':
        return 'Pagamento em Atraso';
      case 'trialing':
        return 'Período de Teste';
      case 'incomplete':
        return 'Incompleto';
      default:
        return status;
    }
  };

  const handleCancelSubscription = async () => {
    try {
      const data = await api.cancelSubscription();
      alert(data?.message || 'Assinatura cancelada com sucesso');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao cancelar assinatura:', error);
      const message = error instanceof Error ? error.message : 'Erro ao cancelar assinatura';
      alert(message);
    }
    setShowCancelModal(false);
  };

  const handleReactivateSubscription = async () => {
    try {
      const data = await api.reactivateSubscription();
      alert(data?.message || 'Assinatura reativada com sucesso');
      window.location.reload();
    } catch (error) {
      console.error('Erro ao reativar assinatura:', error);
      const message = error instanceof Error ? error.message : 'Erro ao reativar assinatura';
      alert(message);
    }
  };

   const handlePaymentMethodSuccess = () => {
     alert('Método de pagamento atualizado com sucesso!');
     // Recarregar dados da assinatura
     window.location.reload();
   };

   const handlePlanChangeSuccess = () => {
     alert('Plano alterado com sucesso!');
     // Recarregar dados da assinatura
     window.location.reload();
   };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h2>
          <p className="text-gray-600">{error.message}</p>
          <div className="mt-6">
            <Link
              to="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700"
            >
              Ver Planos Disponíveis
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Se não há assinatura, mostrar tela de contratação
  if (!loading && !subscription) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <Package className="h-24 w-24 text-gray-400 mx-auto mb-8" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Bem-vindo ao Ticket Wise!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Você ainda não possui uma assinatura ativa. Escolha um plano para começar a usar nossa plataforma.
            </p>
            
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Por que escolher o Ticket Wise?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Gestão Completa</h3>
                  <p className="text-gray-600">Gerencie todos os seus tickets em um só lugar</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Suporte 24/7</h3>
                  <p className="text-gray-600">Atendimento disponível a qualquer hora</p>
                </div>
                <div className="text-center">
                  <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="h-8 w-8 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Preços Justos</h3>
                  <p className="text-gray-600">Planos acessíveis para todos os tamanhos</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Link
                to="/pricing?action=subscribe"
                className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
              >
                <Package className="h-5 w-5 mr-2" />
                Contratar Plano
              </Link>
              <div>
                <Link
                  to="/features"
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  Conheça nossas funcionalidades →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Painel de Controle</h1>
          <p className="text-gray-600 mt-2">Gerencie sua assinatura e configurações</p>
        </div>

        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Visão Geral', icon: Package },
              { id: 'subscription', label: 'Assinatura', icon: CreditCard },
              { id: 'billing', label: 'Faturamento', icon: FileText },
              { id: 'settings', label: 'Configurações', icon: Settings }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === id
                    ? 'border-purple-500 text-purple-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Status da Assinatura */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Status da Assinatura</p>
                  <div className="flex items-center mt-2">
                    {subscription?.status === 'active' ? (
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 mr-2" />
                    )}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription?.status || '')}`}>
                      {getStatusText(subscription?.status || 'Sem assinatura')}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Plano Atual */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Plano Atual</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {product?.name || 'Nenhum plano'}
                  </p>
                  {product && (
                    <p className="text-sm text-gray-500 mt-1">
                      {formatCurrency(product.price)}/{product.interval || 'mês'}
                    </p>
                  )}
                </div>
                <Package className="h-8 w-8 text-purple-600" />
              </div>
            </div>

            {/* Próximo Pagamento */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Próximo Pagamento</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatDate(subscription?.current_period_end)}
                  </p>
                  {subscription?.cancel_at_period_end && (
                    <p className="text-sm text-red-500 mt-1">Cancelamento agendado</p>
                  )}
                </div>
                <Calendar className="h-8 w-8 text-purple-600" />
              </div>
            </div>
          </div>
        )}

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Detalhes da Assinatura</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Plano</label>
                    <p className="mt-1 text-sm text-gray-900">{product?.name || 'Nenhum plano ativo'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`mt-1 inline-flex px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscription?.status || '')}`}>
                      {getStatusText(subscription?.status || 'Sem assinatura')}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Período Atual</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {formatDate(subscription?.current_period_start)} - {formatDate(subscription?.current_period_end)}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Método de Pagamento</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {subscription?.payment_method_brand && subscription?.payment_method_last4
                        ? `${subscription.payment_method_brand.toUpperCase()} •••• ${subscription.payment_method_last4}`
                        : 'Não configurado'
                      }
                    </p>
                  </div>
                </div>

                {subscription?.status === 'active' && (
                  <div className="pt-4 border-t border-gray-200">
                    <div className="flex flex-wrap gap-4">
                      <button 
                        onClick={() => setShowPlanModal(true)}
                        className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Alterar Plano
                      </button>
                      <button 
                        onClick={() => setShowPaymentModal(true)}
                        className="flex items-center px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 hover:bg-blue-50"
                      >
                        <CreditCard className="h-4 w-4 mr-2" />
                        Alterar Cartão
                      </button>
                      {subscription?.cancel_at_period_end ? (
                        <button 
                          onClick={handleReactivateSubscription}
                          className="flex items-center px-4 py-2 border border-green-300 rounded-md text-sm font-medium text-green-700 hover:bg-green-50"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Reativar Assinatura
                        </button>
                      ) : (
                        <button 
                          onClick={() => setShowCancelModal(true)}
                          className="flex items-center px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Cancelar Assinatura
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Histórico de Faturamento</h3>
              </div>
              <div className="px-6 py-4">
                {invoicesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Carregando faturas...</p>
                  </div>
                ) : invoicesError ? (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                    <p className="text-red-600">Erro ao carregar faturas</p>
                    <p className="text-sm text-gray-400 mt-2">{invoicesError}</p>
                  </div>
                ) : invoices.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">Nenhuma fatura encontrada</p>
                    <p className="text-sm text-gray-400 mt-2">
                      Suas faturas aparecerão aqui quando disponíveis
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Data
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            ID da Transação
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ações
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {invoices.map((invoice) => (
                          <tr key={invoice.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(invoice.created_at).toLocaleDateString('pt-BR')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">
                              {invoice.payment_intent_id || invoice.checkout_session_id || invoice.id}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                invoice.status === 'paid' || invoice.status === 'complete' 
                                  ? 'bg-green-100 text-green-800'
                                  : invoice.status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {invoice.status === 'paid' || invoice.status === 'complete' ? 'Pago' :
                                 invoice.status === 'pending' ? 'Pendente' : 'Falhou'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(invoice.amount_total)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <button className="text-purple-600 hover:text-purple-900 flex items-center">
                                <Download className="h-4 w-4 mr-1" />
                                Baixar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Configurações da Conta</h3>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nome</label>
                  <input
                    type="text"
                    value={user?.name || ''}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500"
                    readOnly
                  />
                </div>
                <div className="pt-4">
                  <button className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700">
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Modal */}
      {showPaymentModal && (
        <PaymentMethodModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentMethodSuccess}
        />
      )}

      {/* Plan Change Modal */}
      {showPlanModal && (
        <PlanChangeModal
          isOpen={showPlanModal}
          onClose={() => setShowPlanModal(false)}
          onSuccess={handlePlanChangeSuccess}
          currentPlanId={subscription?.stripe_price_id}
        />
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3 text-center">
              <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">Cancelar Assinatura</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500">
                  Tem certeza que deseja cancelar sua assinatura? Você continuará tendo acesso até o final do período atual.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
                >
                  Manter Assinatura
                </button>
                <button
                  onClick={handleCancelSubscription}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Confirmar Cancelamento
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;