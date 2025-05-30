import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const SuccessPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gray-50">
      <div className="container px-4 py-16 text-center">
        <div className="max-w-lg mx-auto">
          <div className="flex justify-center mb-6">
            <div className="bg-green-100 p-6 rounded-full">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pagamento Confirmado!</h1>
          <p className="text-lg text-gray-600 mb-8">
            Obrigado por escolher o TicketWise. Seu pagamento foi processado com sucesso e sua assinatura está ativa.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="inline-flex items-center justify-center bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
            >
              Ir para o Dashboard
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center border border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-purple-50 transition-colors"
            >
              Precisa de Ajuda?
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;