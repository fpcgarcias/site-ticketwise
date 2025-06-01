import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react';

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [companyId, setCompanyId] = useState<number | null>(null);
  
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const saveRegistrationData = async () => {
      if (!sessionId) {
        setStatus('error');
        setMessage('Session ID não encontrado na URL');
        return;
      }

      // Recuperar dados do formulário salvos no sessionStorage
      const registrationDataStr = sessionStorage.getItem('registrationData');
      
      if (!registrationDataStr) {
        setStatus('error');
        setMessage('Dados do registro não encontrados. Por favor, tente novamente.');
        return;
      }

      try {
        const registrationData = JSON.parse(registrationDataStr);
        
        // Chamar função serverless para salvar no Neon
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/save-company-registration`,
          {
            method: 'POST',
            headers: { 
              'Content-Type': 'application/json',
              'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
              'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({
              session_id: sessionId,
              registration_data: registrationData
            })
          }
        );

        const result = await response.json();

        if (!response.ok || !result.success) {
          setStatus('error');
          setMessage(result.error || 'Erro ao salvar dados no backend');
          return;
        }

        setStatus('success');
        setMessage(result.message || 'Dados salvos com sucesso no sistema');
        setCompanyId(result.company_id);
        sessionStorage.removeItem('registrationData');
      } catch (error) {
        console.error('❌ Erro ao salvar dados:', error);
        setStatus('error');
        setMessage('Erro de conexão ao salvar dados');
      }
    };

    saveRegistrationData();
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
                      <p className="text-gray-600">Aguarde o acesso ao sistema TicketWise (até 24h)</p>
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