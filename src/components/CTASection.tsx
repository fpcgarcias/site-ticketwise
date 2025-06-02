import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const CTASection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-purple-600">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Transforme seu atendimento ao cliente hoje mesmo
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de empresas que já estão utilizando o Ticket Wise para proporcionar um atendimento excepcional e aumentar a satisfação dos clientes.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
            >
              Começar Agora <ArrowRight size={16} className="ml-2" />
            </Link>
            <Link
              to="/contact"
              className="border border-white text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
            >
              Fale com um Consultor
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;