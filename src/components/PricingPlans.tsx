import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

type PlanFeature = {
  included: boolean;
  text: string;
};

type Plan = {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    annual: number;
  };
  limits: {
    attendants: number;
    tickets: number;
  };
  features: PlanFeature[];
  highlight?: boolean;
  buttonText: string;
};

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Básico',
    description: 'Ideal para pequenas empresas iniciando com gestão de chamados.',
    price: {
      monthly: 119,
      annual: 101, // 15% discount
    },
    limits: {
      attendants: 1,
      tickets: 250,
    },
    features: [
      { included: true, text: '1 atendente' },
      { included: true, text: '250 tickets/mês' },
      { included: true, text: 'Cadastro e gerenciamento de tickets' },
      { included: true, text: 'Notificações por e-mail' },
      { included: true, text: 'Dashboard completo' },
      { included: true, text: 'Departamentos personalizáveis' },
      { included: true, text: 'Monitoramento de SLA' },
      { included: true, text: 'Automação de processos' },
      { included: false, text: 'Integração com IA' },
    ],
    buttonText: 'Escolher Plano',
  },
  {
    id: 'pro',
    name: 'Profissional',
    description: 'Perfeito para empresas em crescimento com necessidades avançadas.',
    price: {
      monthly: 199,
      annual: 169, // 15% discount
    },
    limits: {
      attendants: 3,
      tickets: 500,
    },
    features: [
      { included: true, text: '3 atendentes' },
      { included: true, text: '500 tickets/mês' },
      { included: true, text: 'Cadastro e gerenciamento de tickets' },
      { included: true, text: 'Notificações por e-mail' },
      { included: true, text: 'Dashboard completo' },
      { included: true, text: 'Departamentos personalizáveis' },
      { included: true, text: 'Monitoramento de SLA' },
      { included: true, text: 'Automação de processos' },
      { included: false, text: 'Integração com IA' },
    ],
    highlight: true,
    buttonText: 'Escolher Plano',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Solução completa para grandes organizações com demandas complexas.',
    price: {
      monthly: 299,
      annual: 254, // 15% discount
    },
    limits: {
      attendants: 10,
      tickets: 2000,
    },
    features: [
      { included: true, text: '10 atendentes' },
      { included: true, text: '2.000 tickets/mês' },
      { included: true, text: 'Cadastro e gerenciamento de tickets' },
      { included: true, text: 'Notificações por e-mail' },
      { included: true, text: 'Dashboard avançado com BI' },
      { included: true, text: 'Departamentos personalizáveis' },
      { included: true, text: 'Monitoramento de SLA' },
      { included: true, text: 'Automação de processos' },
      { included: true, text: 'Integração com IA' },
    ],
    buttonText: 'Escolher Plano',
  },
];

const ticketPackages = [
  { name: 'Mini', quantity: 100, price: 25, pricePerTicket: 0.25 },
  { name: 'Basic', quantity: 250, price: 39, pricePerTicket: 0.156 },
  { name: 'Médio', quantity: 500, price: 59, pricePerTicket: 0.118 },
  { name: 'Plus', quantity: 1000, price: 99, pricePerTicket: 0.099 },
  { name: 'Pro', quantity: 2000, price: 179, pricePerTicket: 0.089 },
  { name: 'Ultra', quantity: 5000, price: 399, pricePerTicket: 0.079 },
];

const PricingPlans: React.FC = () => {
  const [annual, setAnnual] = useState(true);

  return (
    <section className="py-16 md:py-24 bg-white" id="pricing">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
            Preços
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Planos para cada necessidade
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Escolha o plano ideal para sua empresa e comece a transformar seu atendimento ao cliente hoje.
          </p>

          <div className="flex items-center justify-center space-x-4 mt-8">
            <button
              className={`px-4 py-2 rounded-lg ${
                !annual ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setAnnual(false)}
            >
              Mensal
            </button>
            <button
              className={`px-4 py-2 rounded-lg ${
                annual ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => setAnnual(true)}
            >
              Anual <span className="text-xs opacity-75">(15% de desconto)</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative rounded-xl overflow-hidden border ${
                plan.highlight
                  ? 'border-purple-600 shadow-xl'
                  : 'border-gray-200 shadow-sm hover:shadow-md'
              } transition-shadow`}
            >
              {plan.highlight && (
                <div className="absolute top-0 left-0 right-0 bg-purple-600 text-white text-center py-1 text-sm font-medium">
                  Mais Popular
                </div>
              )}
              <div className={`p-6 ${plan.highlight ? 'pt-10' : ''}`}>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <p className="text-5xl font-bold text-gray-900">
                    R${annual ? plan.price.annual : plan.price.monthly}
                    <span className="text-lg font-normal text-gray-600">/mês</span>
                  </p>
                  {annual && (
                    <p className="text-sm text-green-600 mt-1">
                      Economize R${((plan.price.monthly - plan.price.annual) * 12).toFixed(0)} por ano
                    </p>
                  )}
                </div>

                <Link
                  to={`/register?plan=${plan.id}${annual ? '_annual' : '_monthly'}`}
                  className={`block w-full py-3 px-4 rounded-lg text-center font-medium ${
                    plan.highlight
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                  } transition-colors mb-6`}
                >
                  {plan.buttonText}
                </Link>

                <div className="border-t border-gray-200 pt-6">
                  <p className="font-medium text-gray-900 mb-4">O plano inclui:</p>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <span
                          className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center mt-0.5 mr-2 ${
                            feature.included ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {feature.included ? <Check size={12} /> : ''}
                        </span>
                        <span
                          className={
                            feature.included ? 'text-gray-700' : 'text-gray-400 line-through'
                          }
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-gray-200 mt-6 pt-6">
                  <p className="text-sm text-gray-600 mb-4">
                    Excedentes:
                    <br />
                    • Atendente adicional: R$39/mês
                  </p>
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">Pacotes de tickets adicionais:</p>
                    <table className="w-full text-left">
                      <thead>
                        <tr className="text-xs">
                          <th className="pb-2">Pacote</th>
                          <th className="pb-2">Qtd.</th>
                          <th className="pb-2">Preço</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {ticketPackages.map((pkg) => (
                          <tr key={pkg.name}>
                            <td className="py-1">{pkg.name}</td>
                            <td className="py-1">{pkg.quantity}</td>
                            <td className="py-1">R${pkg.price}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Precisa de um plano personalizado para sua empresa?
          </p>
          <Link
            to="/contact"
            className="text-purple-600 font-medium hover:text-purple-700 underline"
          >
            Entre em contato com nossa equipe de vendas
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PricingPlans;