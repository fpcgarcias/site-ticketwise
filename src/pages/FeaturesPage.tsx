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
              Descubra todas as ferramentas do TicketWise que tornarão seu suporte técnico mais eficiente e seus clientes mais satisfeitos.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <img 
              src="https://images.pexels.com/photos/3182812/pexels-photo-3182812.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
              alt="Dashboard do TicketWise" 
              className="rounded-xl shadow-xl w-full"
            />
          </motion.div>
        </div>
      </section>

      <FeatureSection />

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Integração com outras ferramentas
            </h2>
            <p className="text-xl text-gray-600">
              O TicketWise se conecta com as ferramentas que você já utiliza, centralizando todas as informações.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            {['Slack', 'Microsoft Teams', 'Google Workspace', 'Trello', 'GitHub', 'Jira', 'Zapier', 'Outlook'].map((tool, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                className="flex items-center justify-center p-6 bg-gray-50 rounded-lg hover:shadow-md transition-shadow"
              >
                <span className="text-lg font-medium text-gray-700">{tool}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </div>
  );
};

export default FeaturesPage;