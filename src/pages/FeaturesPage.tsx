import React from 'react';
import { motion } from 'framer-motion';
import FeatureSection from '../components/FeatureSection';
import CTASection from '../components/CTASection';

const FeaturesPage: React.FC = () => {
  return (
    <div className="pt-20">
      <section className="py-16 md:py-24 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
              Funcionalidades
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Recursos poderosos para transformar seu atendimento
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Descubra todas as ferramentas do Ticket Wise que tornarão seu suporte técnico mais eficiente e seus clientes mais satisfeitos.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <img 
              src="/dashboard-screenshot.png" 
              alt="Dashboard do Ticket Wise"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
        </div>
      </section>

      <FeatureSection />



      <CTASection />
    </div>
  );
};

export default FeaturesPage;