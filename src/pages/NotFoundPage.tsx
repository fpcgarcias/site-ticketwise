import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Compass, ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  
  return (
    <>
      <Helmet>
        <title>Página não encontrada - Ticket Wise | Erro 404</title>
        <meta name="description" content="Página não encontrada. Retorne à página inicial ou entre em contato conosco." />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href={`${baseUrl}/404`} />
      </Helmet>

      <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="container px-4 py-16 text-center">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 p-6 rounded-full">
                <Compass className="h-16 w-16 text-purple-600" />
              </div>
            </div>
            <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Página não encontrada</h2>
            <p className="text-lg text-gray-600 mb-8">
              Ops! Parece que você se perdeu. A página que você está procurando não existe ou foi movida.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/" 
                className="inline-flex items-center justify-center bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
              >
                <ArrowLeft size={16} className="mr-2" />
                Voltar para a Home
              </Link>
              <Link 
                to="/contact" 
                className="inline-flex items-center justify-center border border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-purple-50 transition-colors"
              >
                Contatar Suporte
              </Link>
            </div>
          </div>
        </div>
      </div>
  </>
);
};

export default NotFoundPage;