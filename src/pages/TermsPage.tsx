import React from 'react';
import { Link } from 'react-router-dom';
import { Scale, Shield, FileText, AlertCircle } from 'lucide-react';

const TermsPage: React.FC = () => {
  return (
    <div className="pt-20">
      {/* Header Section */}
      <section className="py-16 md:py-24 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="bg-purple-100 p-4 rounded-full">
                <Scale className="h-12 w-12 text-purple-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Termos de Serviço
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Conheça os termos e condições de uso da plataforma Ticket Wise
            </p>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <AlertCircle className="h-6 w-6 text-purple-600 mr-2" />
                <span className="font-semibold text-gray-900">Última atualização:</span>
              </div>
              <p className="text-gray-600">15 de dezembro de 2024</p>
            </div>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            
            {/* 1. Definições */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <FileText className="h-8 w-8 text-purple-600 mr-3" />
                1. Definições
              </h2>
              <div className="bg-gray-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Para os fins destes Termos de Serviço, as seguintes definições se aplicam:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Ticket Wise:</strong> Plataforma de gestão de chamados e atendimento ao cliente</li>
                  <li><strong>Usuário:</strong> Pessoa física ou jurídica que utiliza os serviços da plataforma</li>
                  <li><strong>Conta:</strong> Cadastro do usuário na plataforma Ticket Wise</li>
                  <li><strong>Serviços:</strong> Todos os recursos e funcionalidades oferecidos pela plataforma</li>
                  <li><strong>Dados:</strong> Informações inseridas, processadas ou armazenadas na plataforma</li>
                </ul>
              </div>
            </div>

            {/* 2. Aceitação dos Termos */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Aceitação dos Termos</h2>
              <p className="text-gray-700 mb-4">
                Ao acessar e utilizar a plataforma Ticket Wise, você concorda expressamente com estes Termos de Serviço. 
                Se você não concorda com qualquer parte destes termos, não deve utilizar nossos serviços.
              </p>
              <p className="text-gray-700">
                Estes termos constituem um acordo legal vinculativo entre você e a Ticket Wise. 
                Recomendamos que leia atentamente todos os termos antes de utilizar nossa plataforma.
              </p>
            </div>

            {/* 3. Descrição dos Serviços */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Descrição dos Serviços</h2>
              <p className="text-gray-700 mb-4">
                A Ticket Wise oferece uma plataforma de gestão de chamados que permite:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Criação e gerenciamento de tickets de suporte</li>
                <li>Atendimento multicanal (email, chat, telefone)</li>
                <li>Automação de processos de atendimento</li>
                <li>Relatórios e análises de performance</li>
                <li>Integrações com sistemas terceiros</li>
                <li>Base de conhecimento e FAQ</li>
              </ul>
              <p className="text-gray-700">
                Nos reservamos o direito de modificar, suspender ou descontinuar qualquer aspecto dos serviços 
                a qualquer momento, com ou sem aviso prévio.
              </p>
            </div>

            {/* 4. Cadastro e Conta do Usuário */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Cadastro e Conta do Usuário</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.1 Requisitos de Cadastro</h3>
              <p className="text-gray-700 mb-4">
                Para utilizar os serviços, você deve criar uma conta fornecendo informações precisas, 
                atuais e completas. Você é responsável por manter a confidencialidade de suas credenciais de acesso.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4.2 Responsabilidades do Usuário</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Manter suas informações de conta atualizadas</li>
                <li>Proteger suas credenciais de acesso</li>
                <li>Notificar imediatamente sobre uso não autorizado de sua conta</li>
                <li>Ser responsável por todas as atividades em sua conta</li>
              </ul>
            </div>

            {/* 5. Planos e Pagamentos */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Planos e Pagamentos</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.1 Planos de Serviço</h3>
              <p className="text-gray-700 mb-4">
                Oferecemos diferentes planos de serviço com recursos e limitações específicas. 
                Os detalhes de cada plano estão disponíveis em nossa página de preços.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">5.2 Faturamento</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Os pagamentos são processados mensalmente ou anualmente</li>
                <li>Todas as taxas são não reembolsáveis, exceto quando especificado</li>
                <li>Preços estão sujeitos a alterações com aviso prévio de 30 dias</li>
                <li>Falha no pagamento pode resultar na suspensão dos serviços</li>
              </ul>
            </div>

            {/* 6. Uso Aceitável */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Uso Aceitável</h2>
              <p className="text-gray-700 mb-4">
                Você concorda em usar nossos serviços apenas para fins legais e de acordo com estes termos. 
                É proibido:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Violar qualquer lei ou regulamento aplicável</li>
                <li>Interferir ou interromper os serviços ou servidores</li>
                <li>Tentar acessar contas de outros usuários</li>
                <li>Enviar spam, malware ou conteúdo malicioso</li>
                <li>Usar a plataforma para atividades fraudulentas</li>
                <li>Fazer engenharia reversa do software</li>
              </ul>
            </div>

            {/* 7. Propriedade Intelectual */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Propriedade Intelectual</h2>
              <p className="text-gray-700 mb-4">
                A plataforma Ticket Wise, incluindo seu código, design, texto, gráficos e outros materiais, 
                são propriedade da Ticket Wise e protegidos por leis de propriedade intelectual.
              </p>
              <p className="text-gray-700">
                Você mantém a propriedade de seus dados e conteúdo. Ao usar nossos serviços, você nos concede 
                uma licença limitada para processar seus dados conforme necessário para fornecer os serviços.
              </p>
            </div>

            {/* 8. Privacidade e Proteção de Dados */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Privacidade e Proteção de Dados</h2>
              <p className="text-gray-700 mb-4">
                Levamos a proteção de dados muito a sério. Nossa Política de Privacidade detalha como 
                coletamos, usamos e protegemos suas informações pessoais.
              </p>
              <p className="text-gray-700">
                Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger 
                seus dados contra acesso não autorizado, alteração, divulgação ou destruição.
              </p>
            </div>

            {/* 9. Limitação de Responsabilidade */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Limitação de Responsabilidade</h2>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  <strong>IMPORTANTE:</strong> Em nenhuma circunstância a Ticket Wise será responsável por:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Danos indiretos, incidentais ou consequenciais</li>
                  <li>Perda de lucros, dados ou oportunidades de negócio</li>
                  <li>Interrupções de serviço além de nosso controle</li>
                  <li>Ações de terceiros ou integrações externas</li>
                </ul>
              </div>
            </div>

            {/* 10. Rescisão */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Rescisão</h2>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Rescisão pelo Usuário</h3>
              <p className="text-gray-700 mb-4">
                Você pode cancelar sua conta a qualquer momento através das configurações da conta ou 
                entrando em contato com nosso suporte.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3">10.2 Rescisão pela Ticket Wise</h3>
              <p className="text-gray-700 mb-4">
                Podemos suspender ou encerrar sua conta em caso de violação destes termos, 
                falta de pagamento ou outras circunstâncias apropriadas.
              </p>
            </div>

            {/* 11. Alterações nos Termos */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">11. Alterações nos Termos</h2>
              <p className="text-gray-700 mb-4">
                Reservamo-nos o direito de modificar estes termos a qualquer momento. 
                Alterações significativas serão comunicadas com pelo menos 30 dias de antecedência.
              </p>
              <p className="text-gray-700">
                O uso continuado dos serviços após as alterações constitui aceitação dos novos termos.
              </p>
            </div>

            {/* 12. Lei Aplicável */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">12. Lei Aplicável e Jurisdição</h2>
              <p className="text-gray-700 mb-4">
                Estes termos são regidos pelas leis da República Federativa do Brasil. 
                Qualquer disputa será resolvida no foro da comarca de Rio de Janeiro, RJ.
              </p>
            </div>

            {/* 13. Contato */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">13. Contato</h2>
              <div className="bg-purple-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Para questões sobre estes Termos de Serviço, entre em contato conosco:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Email:</strong> legal@ticketwise.com.br</li>
                  <li><strong>Telefone:</strong> (21) 2042-2588</li>
                  <li><strong>Endereço:</strong> Avenida das Américas, 17500 - Bloco 1/202, Rio de Janeiro, RJ 22790-704</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Tem dúvidas sobre nossos termos?
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Nossa equipe jurídica está disponível para esclarecer qualquer questão
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
              >
                Entrar em Contato
              </Link>
              <Link
                to="/privacy"
                className="border border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-purple-50 transition-colors"
              >
                Ver Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsPage; 