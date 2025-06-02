import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, BarChart3, Calendar, ClipboardList, Clock, MessageSquare, Settings, Users } from 'lucide-react';

type Feature = {
  icon: React.ReactNode;
  title: string;
  description: string;
};

const features: Feature[] = [
  {
    icon: <ClipboardList className="h-10 w-10 text-purple-600" />,
    title: "Cadastro e Gerenciamento de Tickets",
    description: "Crie, categorize e acompanhe tickets com diferentes status e prioridades. Mantenha um registro organizado de todos os atendimentos."
  },
  {
    icon: <Users className="h-10 w-10 text-purple-600" />,
    title: "Departamentos Personalizáveis",
    description: "Configure departamentos específicos com equipes dedicadas para cada tipo de atendimento, otimizando o fluxo de trabalho."
  },
  {
    icon: <Clock className="h-10 w-10 text-purple-600" />,
    title: "Monitoramento de SLA",
    description: "Defina e acompanhe níveis de serviço (SLA) para garantir tempos de resposta adequados e manter a qualidade do atendimento."
  },
  {
    icon: <AlertCircle className="h-10 w-10 text-purple-600" />,
    title: "Notificações em Tempo Real",
    description: "Receba alertas sobre atualizações de tickets, novos comentários e prazos de SLA através de e-mail ou notificações no navegador."
  },
  {
    icon: <BarChart3 className="h-10 w-10 text-purple-600" />,
    title: "Dashboard com Estatísticas",
    description: "Visualize métricas importantes de performance, volume de tickets e eficiência das equipes através de gráficos intuitivos."
  },
  {
    icon: <MessageSquare className="h-10 w-10 text-purple-600" />,
    title: "Comunicação Integrada",
    description: "Mantenha todas as conversas com clientes centralizadas no sistema, facilitando o acesso ao histórico de atendimento."
  },
  {
    icon: <Calendar className="h-10 w-10 text-purple-600" />,
    title: "Automação de Processos",
    description: "Configure regras de automação para atribuição de tickets, escalonamento e alertas, reduzindo tarefas manuais."
  },
  {
    icon: <Settings className="h-10 w-10 text-purple-600" />,
    title: "Integração com IA",
    description: "Utilize inteligência artificial para analisar tickets, sugerir respostas e priorizar atendimentos automaticamente."
  }
];

const FeatureSection: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  };

  return (
    <section className="py-16 md:py-24 bg-white" id="features">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
            Funcionalidades
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Tudo o que você precisa para um suporte excepcional
          </h2>
          <p className="text-xl text-gray-600">
            Conheça as principais ferramentas do Ticket Wise que transformarão seu atendimento ao cliente.
          </p>
        </div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature, index) => (
            <motion.div 
              key={index} 
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              variants={itemVariants}
            >
              <div className="flex flex-col items-start">
                <div className="mb-4 p-2 bg-purple-50 rounded-lg">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeatureSection;