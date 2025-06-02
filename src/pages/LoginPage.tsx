import React, { useEffect } from 'react';

// Redireciona automaticamente para o sistema Ticket Wise
const LoginPage: React.FC = () => {
  useEffect(() => {
    window.location.href = 'https://app.ticketwise.com.br';
  }, []);

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white p-8 rounded-lg shadow-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Redirecionando...</h1>
          <p className="text-gray-600 mb-6">
            Você está sendo redirecionado para o sistema Ticket Wise.
          </p>
          <p className="text-sm text-gray-500">
            Se não for redirecionado automaticamente, 
            <a 
              href="https://app.ticketwise.com.br"
              className="text-purple-600 hover:text-purple-700 ml-1"
            >
              clique aqui
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;