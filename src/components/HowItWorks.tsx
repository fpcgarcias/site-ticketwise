import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

type Step = {
  number: number;
  title: string;
  description: string;
};

const steps: Step[] = [
  {
    number: 1,
    title: "Cadastre-se na plataforma",
    description: "Crie sua conta gratuitamente em poucos minutos e configure seu perfil de empresa."
  },
  {
    number: 2,
    title: "Configure seus departamentos",
    description: "Crie departamentos personalizados de acordo com sua estrutura organizacional."
  },
  {
    number: 3,
    title: "Convide sua equipe",
    description: "Adicione os membros da sua equipe e defina suas permissões e funções."
  },
  {
    number: 4,
    title: "Personalize seu fluxo de trabalho",
    description: "Configure SLAs, automações e integrações para otimizar seu atendimento."
  }
];

const HowItWorks: React.FC = () => {
  return (
    <section className="py-16 md:py-24 bg-purple-50">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
            Como Funciona
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Comece a usar o Ticket Wise em 4 passos simples
          </h2>
          <p className="text-xl text-gray-600">
            Implementação rápida e fácil para que você possa focar no que realmente importa: atender seus clientes.
          </p>
        </div>

        <div className="relative">
          {/* Progress Line */}
          <div className="hidden md:block absolute left-1/2 top-12 bottom-12 w-1 bg-purple-200 transform -translate-x-1/2 z-0" />

          <div className="space-y-12 md:space-y-0 relative z-10">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="md:flex items-center"
              >
                <div className={`md:w-1/2 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:pl-12 md:order-last'}`}>
                  <div className="bg-white p-6 rounded-xl shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                  </div>
                </div>

                <div className="flex justify-center items-center my-4 md:my-0">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-purple-600 text-white font-bold shadow-lg">
                    {step.number}
                  </div>
                </div>

                <div className={`hidden md:block md:w-1/2 ${index % 2 === 0 ? 'md:order-last' : 'md:pr-12'}`} />
              </motion.div>
            ))}
          </div>
        </div>

        <div className="text-center mt-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-xl text-gray-700 mb-6">
              Pronto para transformar seu atendimento ao cliente?
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <a
                href="/register"
                className="bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors inline-flex items-center justify-center"
              >
                Começar Agora <ArrowRight size={16} className="ml-2" />
              </a>
              <a
                href="/contact"
                className="border border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-purple-50 transition-colors"
              >
                Agendar uma Demo
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;