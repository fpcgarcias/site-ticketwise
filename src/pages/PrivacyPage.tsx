import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, AlertTriangle, Eye, Database, UserCheck } from 'lucide-react';

const PrivacyPage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  
  return (
    <>
      <Helmet>
        <title>Política de Privacidade - Ticket Wise | Proteção de Dados (LGPD)</title>
        <meta name="description" content="Política de Privacidade da Ticket Wise conforme LGPD: coleta, uso, compartilhamento, direitos dos titulares e medidas de segurança." />
        <link rel="canonical" href={`${baseUrl}/privacy`} />
        
        <meta property="og:title" content="Política de Privacidade - Ticket Wise | Proteção de Dados (LGPD)" />
        <meta property="og:description" content="Política de Privacidade da Ticket Wise conforme LGPD: coleta, uso, compartilhamento, direitos dos titulares e medidas de segurança." />
        <meta property="og:url" content={`${baseUrl}/privacy`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Política de Privacidade - Ticket Wise | Proteção de Dados (LGPD)" />
        <meta name="twitter:description" content="Política de Privacidade da Ticket Wise conforme LGPD: coleta, uso, compartilhamento, direitos dos titulares e medidas de segurança." />
        <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Política de Privacidade - Ticket Wise",
            "description": "Política de Privacidade conforme a LGPD, incluindo informações sobre coleta, uso, compartilhamento, proteção e direitos dos titulares.",
            "url": `${baseUrl}/privacy`,
            "dateModified": "2024-12-15",
            "datePublished": "2024-12-15",
            "publisher": {
              "@type": "Organization",
              "name": "Ticket Wise",
              "url": baseUrl
            },
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl},
                {"@type": "ListItem", "position": 2, "name": "Privacidade", "item": `${baseUrl}/privacy`}
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="pt-20">
        {/* Header Section */}
        <section className="py-16 md:py-24 bg-blue-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="bg-blue-100 p-4 rounded-full">
                  <Shield className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Política de Privacidade
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Como coletamos, usamos e protegemos seus informações pessoais na Ticket Wise
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <AlertTriangle className="h-6 w-6 text-blue-600 mr-2" />
                  <span className="font-semibold text-gray-900">Última atualização:</span>
                </div>
                <p className="text-gray-600">15 de dezembro de 2024</p>
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800 font-medium">
                    ✓ Conforme a Lei Geral de Proteção de Dados (LGPD) - Lei nº 13.709/2018
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto prose prose-lg">

              {/* 1. Introdução */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Eye className="h-8 w-8 text-blue-600 mr-3" />
                  1. Introdução
                </h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    A Ticket Wise está comprometida com a proteção da privacidade e dos dados pessoais de nossos usuários. 
                    Esta Política de Privacidade explica como coletamos, usamos, compartilhamos e protegemos suas informações.
                  </p>
                  <p className="text-gray-700">
                    Esta política está em conformidade com a Lei Geral de Proteção de Dados (LGPD) e demais regulamentações 
                    aplicáveis no Brasil.
                  </p>
                </div>
              </div>

              {/* 2. Definições LGPD */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Definições</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Para os fins desta Política de Privacidade, aplicam-se as definições da LGPD:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Dados Pessoais:</strong> Informação relacionada a pessoa natural identificada ou identificável</li>
                    <li><strong>Titular:</strong> Pessoa natural a quem se referem os dados pessoais</li>
                    <li><strong>Controlador:</strong> Ticket Wise, responsável pelas decisões sobre o tratamento dos dados</li>
                    <li><strong>Operador:</strong> Quem realiza o tratamento em nome do controlador</li>
                    <li><strong>Tratamento:</strong> Operação com dados pessoais (coleta, armazenamento, uso, etc.)</li>
                  </ul>
                </div>
              </div>

              {/* 3. Informações que Coletamos */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Database className="h-8 w-8 text-blue-600 mr-3" />
                  3. Informações que Coletamos
                </h2>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.1 Dados Fornecidos Diretamente</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li><strong>Cadastro:</strong> Nome, email, telefone, empresa, CNPJ</li>
                  <li><strong>Perfil:</strong> Informações de conta e preferências</li>
                  <li><strong>Suporte:</strong> Comunicações e tickets de atendimento</li>
                  <li><strong>Pagamento:</strong> Informações de faturamento (processadas por terceiros seguros)</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.2 Dados Coletados Automaticamente</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li><strong>Técnicos:</strong> Endereço IP, navegador, sistema operacional</li>
                  <li><strong>Uso:</strong> Páginas visitadas, tempo de sessão, cliques</li>
                  <li><strong>Cookies:</strong> Preferências e identificação de sessão</li>
                  <li><strong>Log:</strong> Registros de atividade e segurança</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">3.3 Dados de Terceiros</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Integrações autorizadas (CRM, email, etc.)</li>
                  <li>Provedores de pagamento</li>
                  <li>Serviços de análise (Google Analytics, etc.)</li>
                </ul>
              </div>

              {/* 4. Base Legal e Finalidades */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Base Legal e Finalidades do Tratamento</h2>
                
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 mb-6">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left">Finalidade</th>
                        <th className="border border-gray-300 p-3 text-left">Base Legal (LGPD)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">Prestação dos serviços</td>
                        <td className="border border-gray-300 p-3">Execução de contrato (Art. 7º, V)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Atendimento ao cliente</td>
                        <td className="border border-gray-300 p-3">Legítimo interesse (Art. 7º, IX)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Marketing e comunicação</td>
                        <td className="border border-gray-300 p-3">Consentimento (Art. 7º, I)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Segurança e prevenção</td>
                        <td className="border border-gray-300 p-3">Legítimo interesse (Art. 7º, IX)</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Obrigações legais</td>
                        <td className="border border-gray-300 p-3">Cumprimento legal (Art. 7º, II)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 5. Como Usamos suas Informações */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">5. Como Usamos suas Informações</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-800 mb-3">✓ Usos Permitidos</h3>
                    <ul className="space-y-2 text-green-700">
                      <li>Fornecer e melhorar nossos serviços</li>
                      <li>Processar pagamentos e faturamento</li>
                      <li>Enviar comunicações essenciais</li>
                      <li>Oferecer suporte técnico</li>
                      <li>Garantir segurança da plataforma</li>
                      <li>Cumprir obrigações legais</li>
                    </ul>
                  </div>
                  <div className="bg-red-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-red-800 mb-3">✗ Nunca Fazemos</h3>
                    <ul className="space-y-2 text-red-700">
                      <li>Vender seus dados pessoais</li>
                      <li>Compartilhar sem autorização</li>
                      <li>Usar para fins não declarados</li>
                      <li>Enviar spam não autorizado</li>
                      <li>Acessar dados sem necessidade</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 6. Compartilhamento de Dados */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Compartilhamento de Dados</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.1 Quando Compartilhamos</h3>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-6">
                  <li><strong>Prestadores de Serviço:</strong> Processamento de pagamentos, hospedagem, análise</li>
                  <li><strong>Obrigação Legal:</strong> Quando exigido por lei ou ordem judicial</li>
                  <li><strong>Proteção de Direitos:</strong> Para proteger nossa propriedade e usuários</li>
                  <li><strong>Consentimento:</strong> Quando você autoriza expressamente</li>
                </ul>

                <h3 className="text-xl font-semibold text-gray-900 mb-3">6.2 Proteções no Compartilhamento</h3>
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <ul className="space-y-2 text-gray-700">
                    <li>• Contratos de proteção de dados com terceiros</li>
                    <li>• Compartilhamento apenas do mínimo necessário</li>
                    <li>• Verificação de conformidade dos parceiros</li>
                    <li>• Monitoramento do uso dos dados compartilhados</li>
                  </ul>
                </div>
              </div>

              {/* 7. Segurança dos Dados */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Lock className="h-8 w-8 text-blue-600 mr-3" />
                  7. Segurança dos Dados
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medidas Técnicas</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Criptografia SSL/TLS</li>
                      <li>• Backup seguro e redundante</li>
                      <li>• Monitoramento 24/7</li>
                      <li>• Controle de acesso</li>
                      <li>• Firewall e proteção DDoS</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Medidas Organizacionais</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Treinamento da equipe</li>
                      <li>• Políticas de segurança</li>
                      <li>• Auditoria regular</li>
                      <li>• Controle de acesso físico</li>
                      <li>• Resposta a incidentes</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 8. Retenção de Dados */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Retenção de Dados</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Períodos de Retenção</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Dados de conta ativa:</strong> Durante a vigência do contrato</li>
                    <li><strong>Dados de conta inativa:</strong> Até 12 meses após inatividade</li>
                    <li><strong>Dados financeiros:</strong> 5 anos (obrigação legal)</li>
                    <li><strong>Logs de segurança:</strong> 6 meses</li>
                    <li><strong>Dados de marketing:</strong> Até revogação do consentimento</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    <strong>Exclusão:</strong> Dados são excluídos permanentemente após os períodos estabelecidos, 
                    exceto quando há obrigação legal de retenção.
                  </p>
                </div>
              </div>

              {/* 9. Seus Direitos (LGPD) */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <UserCheck className="h-8 w-8 text-blue-600 mr-3" />
                  9. Seus Direitos sob a LGPD
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-900">Acesso</h4>
                      <p className="text-blue-800 text-sm">Solicitar informações sobre seus dados</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-green-900">Correção</h4>
                      <p className="text-green-800 text-sm">Corrigir dados incompletos ou incorretos</p>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-yellow-900">Eliminação</h4>
                      <p className="text-yellow-800 text-sm">Solicitar exclusão de dados desnecessários</p>
                    </div>
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-purple-900">Portabilidade</h4>
                      <p className="text-purple-800 text-sm">Transferir dados para outro fornecedor</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-red-900">Oposição</h4>
                      <p className="text-red-800 text-sm">Opor-se ao tratamento desnecessário</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-gray-900">Revogação</h4>
                      <p className="text-gray-800 text-sm">Retirar consentimento a qualquer momento</p>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-indigo-900">Informação</h4>
                      <p className="text-indigo-800 text-sm">Obter dados sobre compartilhamento</p>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-lg">
                      <h4 className="font-semibold text-pink-900">Revisão</h4>
                      <p className="text-pink-800 text-sm">Solicitar revisão de decisões automatizadas</p>
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 bg-blue-100 p-6 rounded-lg">
                  <h4 className="font-semibold text-blue-900 mb-2">Como Exercer seus Direitos</h4>
                  <p className="text-blue-800 mb-2">
                    Entre em contato conosco através dos canais oficiais:
                  </p>
                  <ul className="text-blue-800 space-y-1">
                    <li>• Email: privacy@ticketwise.com.br</li>
                    <li>• Telefone: (21) 2042-2588</li>
                    <li>• Formulário de contato em nossa plataforma</li>
                  </ul>
                  <p className="text-blue-800 text-sm mt-2">
                    <strong>Prazo de resposta:</strong> Até 15 dias úteis, conforme LGPD
                  </p>
                </div>
              </div>

              {/* 10. Cookies e Tecnologias */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">10. Cookies e Tecnologias Similares</h2>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">10.1 Tipos de Cookies</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 mb-6">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="border border-gray-300 p-3 text-left">Tipo</th>
                        <th className="border border-gray-300 p-3 text-left">Finalidade</th>
                        <th className="border border-gray-300 p-3 text-left">Duração</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border border-gray-300 p-3">Essenciais</td>
                        <td className="border border-gray-300 p-3">Funcionamento do site</td>
                        <td className="border border-gray-300 p-3">Sessão</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Funcionais</td>
                        <td className="border border-gray-300 p-3">Preferências do usuário</td>
                        <td className="border border-gray-300 p-3">30 dias</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Analíticos</td>
                        <td className="border border-gray-300 p-3">Análise de uso</td>
                        <td className="border border-gray-300 p-3">2 anos</td>
                      </tr>
                      <tr>
                        <td className="border border-gray-300 p-3">Marketing</td>
                        <td className="border border-gray-300 p-3">Publicidade direcionada</td>
                        <td className="border border-gray-300 p-3">1 ano</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                <p className="text-gray-700">
                  <strong>Gerenciamento:</strong> Você pode controlar cookies através das configurações do seu navegador 
                  ou da nossa central de preferências de cookies.
                </p>
              </div>

              {/* 11. Transferência Internacional */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">11. Transferência Internacional de Dados</h2>
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Alguns de nossos fornecedores podem estar localizados fora do Brasil. Quando isso ocorre:
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Verificamos adequação do nível de proteção</li>
                    <li>• Implementamos cláusulas contratuais padrão</li>
                    <li>• Mantemos controle sobre o tratamento dos dados</li>
                    <li>• Informamos previamente sobre as transferências</li>
                  </ul>
                </div>
              </div>

              {/* 12. Menores de Idade */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">12. Proteção de Menores</h2>
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    <strong>Importante:</strong> Nossos serviços são destinados exclusivamente a empresas e pessoas maiores de 18 anos.
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Não coletamos dados de menores deliberadamente</li>
                    <li>• Se identificarmos dados de menores, os excluiremos imediatamente</li>
                    <li>• Pais/responsáveis podem nos contatar para questões relacionadas</li>
                  </ul>
                </div>
              </div>

              {/* 13. Alterações na Política */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">13. Alterações nesta Política</h2>
                <p className="text-gray-700 mb-4">
                  Podemos atualizar esta Política de Privacidade periodicamente. Quando isso acontecer:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700">
                  <li>Publicaremos a nova versão em nosso site</li>
                  <li>Notificaremos por email sobre alterações significativas</li>
                  <li>Manteremos versões anteriores disponíveis para consulta</li>
                  <li>Indicaremos claramente a data da última atualização</li>
                </ul>
              </div>

              {/* 14. Encarregado de Dados (DPO) */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">14. Encarregado de Proteção de Dados</h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Conforme exigido pela LGPD, designamos um Encarregado de Proteção de Dados (DPO):
                  </p>
                  <ul className="space-y-2 text-gray-700">
                    <li><strong>Nome:</strong> [Nome do DPO]</li>
                    <li><strong>Email:</strong> dpo@ticketwise.com.br</li>
                    <li><strong>Telefone:</strong> (21) 2042-2588</li>
                  </ul>
                  <p className="text-gray-700 mt-4">
                    O DPO é responsável por receber comunicações dos titulares e da ANPD, além de orientar 
                    sobre conformidade com a LGPD.
                  </p>
                </div>
              </div>

              {/* 15. Contato */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">15. Contato</h2>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    Para questões sobre esta Política de Privacidade ou seus dados pessoais:
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Geral</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>Email: contato@ticketwise.com.br</li>
                        <li>Telefone: (21) 2042-2588</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Privacidade</h4>
                      <ul className="space-y-1 text-gray-700">
                        <li>Email: privacy@ticketwise.com.br</li>
                        <li>DPO: dpo@ticketwise.com.br</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 mb-2">Endereço</h4>
                    <p className="text-gray-700">
                      Avenida das Américas, 17500 - Bloco 1/202<br />
                      Rio de Janeiro, RJ 22790-704<br />
                      Brasil
                    </p>
                  </div>
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
              Sua Privacidade é Nossa Prioridade
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Temos o compromisso de proteger seus dados e respeitar seus direitos
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="bg-blue-600 text-white font-medium py-3 px-6 rounded-md hover:bg-blue-700 transition-colors"
              >
                Falar com DPO
              </Link>
              <Link
                to="/terms"
                className="border border-blue-600 text-blue-600 font-medium py-3 px-6 rounded-md hover:bg-blue-50 transition-colors"
              >
                Ver Termos de Serviço
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </>
  );
};

export default PrivacyPage;