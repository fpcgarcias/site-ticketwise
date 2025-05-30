import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

const Hero: React.FC = () => {
  return (
    <div className="relative pt-20 lg:pt-24 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-white z-0" />
      <div className="absolute top-0 right-0 w-2/3 h-2/3 bg-purple-100 rounded-bl-[100px] opacity-30 transform rotate-12 translate-x-1/4 -translate-y-1/4 z-0" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center py-16 md:py-24">
          {/* Hero Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="inline-block px-3 py-1 mb-6 text-sm font-medium rounded-full bg-purple-100 text-purple-700">
              Gestão de Chamados Simplificada
            </span>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Atendimento ao cliente <span className="text-purple-600">mais eficiente</span> e organizado
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-xl">
              O TicketWise otimiza o suporte técnico, centraliza comunicações e permite que você acompanhe tudo em um só lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Link 
                to="/register" 
                className="bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors text-center"
              >
                Começar Agora
              </Link>
              <Link 
                to="/features" 
                className="border border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-purple-50 transition-colors text-center"
              >
                Conheça as Funcionalidades
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <CheckCircle className="text-green-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600">Suporte técnico especializado</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="text-green-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600">Implantação assistida</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="text-green-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600">Treinamento incluído</p>
              </div>
              <div className="flex items-start">
                <CheckCircle className="text-green-500 h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-gray-600">Suporte em horário comercial</p>
              </div>
            </div>
          </motion.div>

          {/* Hero Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="flex justify-center lg:justify-end"
          >
            <div className="relative max-w-lg w-full">
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-600 to-purple-400 rounded-xl transform rotate-3 scale-105 opacity-20 shadow-lg" />
              <img 
                src="https://images.pexels.com/photos/3184405/pexels-photo-3184405.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                alt="Equipe usando o TicketWise" 
                className="relative z-10 rounded-xl shadow-2xl w-full"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Hero;