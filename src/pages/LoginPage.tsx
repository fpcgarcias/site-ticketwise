import React, { useEffect } from 'react';

const LoginPage: React.FC = () => {
  useEffect(() => {
    // Redireciona automaticamente para o sistema TicketWise
    window.location.href = 'https://app.ticketwise.com.br';
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Redirecionando...
          </h2>
          <p className="text-gray-600">
            Você está sendo redirecionado para o sistema TicketWise.
          </p>
          <p className="text-sm text-gray-500 mt-4">
            Se não for redirecionado automaticamente,{' '}
            <a 
              href="https://app.ticketwise.com.br" 
              className="text-purple-600 hover:text-purple-700 font-medium"
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