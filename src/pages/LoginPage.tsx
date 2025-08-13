import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';

const LoginPage: React.FC = () => {
  useEffect(() => {
    window.location.href = 'https://app.ticketwise.com.br';
  }, []);

  const baseUrl = 'https://www.ticketwise.com.br';

  return (
    <>
      <Helmet>
        <title>Login - Ticket Wise</title>
        <meta name="description" content="Faça login para acessar sua conta Ticket Wise." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${baseUrl}/login`} />
      </Helmet>
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-700">Redirecionando para o aplicativo...</p>
      </div>
    </>
  );
};

export default LoginPage;