import React, { useEffect, useState } from 'react';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

const SuccessPage: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Processando sua assinatura...');
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user } = useAuth();

  useEffect(() => {
    const processPayment = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('Session ID não encontrado na URL');
        return;
      }

      try {
        console.log('🔄 Processando pagamento para session:', sessionId);
        
        // Pegar dados de registro do localStorage ANTES de processar
        const registrationData = localStorage.getItem('registrationData');
        let userData = null;
        if (registrationData) {
          userData = JSON.parse(registrationData);
          console.log('📋 Dados de registro encontrados:', userData);
        }
        
        // Processar sessão do Stripe (funciona para usuários logados E novos usuários)
        const result = await api.processStripeSession({
          session_id: sessionId,
          registration_data: userData
        });
        
        if (result.success) {
          setStatus('success');
          setMessage('Assinatura ativada com sucesso!');
          setSubscriptionData(result.session);
          
          // Limpar dados de registro se existirem
          localStorage.removeItem('registrationData');
          
          console.log('✅ Pagamento processado:', result);
        } else {
          throw new Error(result.error || 'Erro ao processar pagamento');
        }
        
      } catch (error) {
        console.error('❌ Erro ao processar pagamento:', error);
        setStatus('error');
        setMessage('Erro ao processar sua assinatura. Nossa equipe foi notificada.');
      }
    };

    processPayment();
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            {status === 'loading' && (
              <>
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Loader2 size={32} className="text-blue-600 animate-spin" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Processando seu cadastro...
                </h1>
                <p className="text-gray-600 mb-8">
                  Aguarde enquanto configuramos sua conta no sistema.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Parabéns! Cadastro realizado com sucesso!
                </h1>
                <p className="text-gray-600 mb-8">
                  {message}
                </p>
                {companyId && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-green-800">
                      <strong>ID da Empresa:</strong> {companyId}
                    </p>
                    <p className="text-sm text-green-700 mt-2">
                      Sua empresa foi cadastrada com sucesso em nosso sistema. 
                      Em breve você receberá as informações de acesso por email.
                    </p>
                  </div>
                )}
                
                <div className="space-y-4">
                  <div className="rounded-lg border border-purple-200 bg-purple-50 p-4 text-left">
                    <p className="text-sm font-medium text-purple-900">Domínio personalizado</p>
                    <p className="text-sm text-purple-800 mt-1">
                      Configure o endereço do seu suporte (ex.: suporte.suaempresa.com.br) no painel do site.
                    </p>
                    <Link
                      to="/dashboard?tab=domain"
                      className="mt-3 inline-flex items-center text-sm font-medium text-purple-700 hover:text-purple-900"
                    >
                      Abrir configuração de domínio →
                    </Link>
                  </div>
                  <h2 className="text-lg font-semibold text-gray-900">Próximos Passos:</h2>
                  <div className="text-left space-y-2">
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-medium text-purple-600">1</span>
                      </div>
                      <p className="text-gray-600">Verifique seu email para confirmar o pagamento</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-medium text-purple-600">2</span>
                      </div>
                      <p className="text-gray-600">Aguarde o acesso ao sistema Ticket Wise (até 24h)</p>
                    </div>
                    <div className="flex items-start">
                      <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                        <span className="text-xs font-medium text-purple-600">3</span>
                      </div>
                      <p className="text-gray-600">Configure sua equipe e departamentos</p>
                    </div>
                  </div>
                </div>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">
                  Oops! Algo deu errado
                </h1>
                <p className="text-gray-600 mb-8">
                  {message}
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-red-800">
                    Não se preocupe! Seu pagamento foi processado com sucesso. 
                    Nossa equipe foi notificada e entrará em contato em até 24h para resolver a situação.
                  </p>
                </div>
              </>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <a
                href="https://app.ticketwise.com.br"
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-md hover:bg-purple-700 transition-colors"
              >
                Acessar Sistema
              </a>
              <Link
                to="/"
                className="px-6 py-3 border border-purple-600 text-purple-600 font-medium rounded-md hover:bg-purple-50 transition-colors"
              >
                Voltar ao Início
              </Link>
              <Link
                to="/contact"
                className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors"
              >
                Entre em Contato
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;