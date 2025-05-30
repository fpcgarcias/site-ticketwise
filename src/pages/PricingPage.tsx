import React from 'react';
import PricingPlans from '../components/PricingPlans';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

const comparisons = [
  {
    category: "Gestão de Tickets",
    features: [
      "Cadastro e categorização de tickets",
      "Atribuição a atendentes",
      "Gerenciamento de status",
      "Priorização de tickets",
      "Histórico de atendimento"
    ]
  },
  {
    category: "Atendimento ao Cliente",
    features: [
      "Portal de auto-atendimento",
      "Base de conhecimento",
      "Notificações por e-mail",
      "Anexos de arquivos",
      "Avaliação de atendimento"
    ]
  },
  {
    category: "Gestão e Relatórios",
    features: [
      "Dashboard de performance",
      "Relatórios personalizáveis",
      "Monitoramento de SLA",
      "Métricas de produtividade",
      "Exportação de dados"
    ]
  },
  {
    category: "Automação e Inteligência",
    features: [
      "Respostas automáticas",
      "Regras de distribuição",
      "Sugestões com IA",
      "Escalonamento automático",
      "Alertas inteligentes"
    ]
  }
];

const PricingPage: React.FC = () => {
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
              Preços
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Planos que crescem com seu negócio
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Escolha o plano ideal para suas necessidades atuais e mude facilmente conforme sua empresa cresce.
            </p>
          </motion.div>
        </div>
      </section>

      <PricingPlans />

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              O que está incluído em cada plano
            </h2>
            <p className="text-xl text-gray-600">
              Compare os recursos disponíveis em cada plano para escolher o que melhor atende às suas necessidades.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="py-4 px-6 bg-gray-50 text-left font-semibold text-gray-700">Recursos</th>
                  <th className="py-4 px-6 bg-gray-50 text-center font-semibold text-gray-700">Básico</th>
                  <th className="py-4 px-6 bg-purple-50 text-center font-semibold text-purple-700">Profissional</th>
                  <th className="py-4 px-6 bg-gray-50 text-center font-semibold text-gray-700">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map((group, groupIndex) => (
                  <React.Fragment key={groupIndex}>
                    <tr>
                      <td colSpan={4} className="py-4 px-6 bg-gray-100 font-semibold text-gray-900">
                        {group.category}
                      </td>
                    </tr>
                    {group.features.map((feature, featureIndex) => (
                      <tr key={featureIndex} className="border-b border-gray-100">
                        <td className="py-4 px-6 text-gray-700">{feature}</td>
                        <td className="py-4 px-6 text-center">
                          <Check size={20} className={`mx-auto ${groupIndex < 2 || (groupIndex === 2 && featureIndex < 2) ? 'text-green-500' : 'text-gray-300'}`} />
                        </td>
                        <td className="py-4 px-6 text-center bg-purple-50">
                          <Check size={20} className={`mx-auto ${groupIndex < 3 || (groupIndex === 3 && featureIndex < 3) ? 'text-green-500' : 'text-gray-300'}`} />
                        </td>
                        <td className="py-4 px-6 text-center">
                          <Check size={20} className="mx-auto text-green-500" />
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-gray-600">
                Tire suas dúvidas sobre nossos planos e preços
              </p>
            </div>

            <div className="space-y-6">
              {[
                {
                  question: "Como funciona o período gratuito?",
                  answer: "Oferecemos 14 dias de teste gratuito em todos os planos, sem necessidade de cartão de crédito. Durante esse período, você terá acesso a todos os recursos do plano escolhido para avaliar se atende às necessidades da sua empresa."
                },
                {
                  question: "Posso mudar de plano depois?",
                  answer: "Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. Ao fazer upgrade, a mudança é imediata. Ao fazer downgrade, a alteração será aplicada no próximo ciclo de faturamento."
                },
                {
                  question: "Existe alguma taxa de configuração?",
                  answer: "Não, não cobramos taxas de configuração. Nosso processo de onboarding é gratuito e você pode começar a usar a plataforma imediatamente após o cadastro."
                },
                {
                  question: "Como funciona o faturamento?",
                  answer: "O faturamento é feito mensalmente ou anualmente, dependendo do plano escolhido. Aceitamos cartões de crédito, boleto bancário e transferência bancária para empresas no plano Enterprise."
                },
                {
                  question: "Oferecem descontos para ONGs ou instituições educacionais?",
                  answer: "Sim, oferecemos descontos especiais para organizações sem fins lucrativos e instituições educacionais. Entre em contato com nossa equipe de vendas para mais informações."
                }
              ].map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                  className="bg-white p-6 rounded-lg shadow-sm"
                >
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;