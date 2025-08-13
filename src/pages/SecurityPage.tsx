import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Shield, Lock, Monitor, Key, HardDrive, Users, AlertTriangle, CheckCircle2, Server, Eye, CheckCircle } from 'lucide-react';

const SecurityPage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  
  return (
    <>
      <Helmet>
        <title>Segurança de Dados - Ticket Wise | Proteção e Medidas de Segurança</title>
        <meta name="description" content="Medidas de segurança da Ticket Wise: criptografia, backup, monitoramento, controle de acesso e política de segurança para proteção de dados." />
        <link rel="canonical" href={`${baseUrl}/security`} />
        
        <meta property="og:title" content="Segurança de Dados - Ticket Wise | Proteção e Medidas de Segurança" />
        <meta property="og:description" content="Medidas de segurança da Ticket Wise: criptografia, backup, monitoramento, controle de acesso e política de segurança para proteção de dados." />
        <meta property="og:url" content={`${baseUrl}/security`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Segurança de Dados - Ticket Wise | Proteção e Medidas de Segurança" />
        <meta name="twitter:description" content="Medidas de segurança da Ticket Wise: criptografia, backup, monitoramento, controle de acesso e política de segurança para proteção de dados." />
        <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Segurança de Dados - Ticket Wise",
            "description": "Medidas e políticas de segurança implementadas para proteção de dados e sistemas na Ticket Wise.",
            "url": `${baseUrl}/security`,
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
                {"@type": "ListItem", "position": 2, "name": "Segurança", "item": `${baseUrl}/security`}
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="pt-20">
        {/* Header Section */}
        <section className="py-16 md:py-24 bg-green-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <div className="bg-green-100 p-4 rounded-full">
                  <Shield className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Segurança e Proteção de Dados
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Conheça as medidas de segurança que implementamos para proteger suas informações na Ticket Wise
              </p>
              <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
                <div className="flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
                  <span className="font-semibold text-gray-900">Segurança atualizada em:</span>
                </div>
                <p className="text-gray-600">15 de dezembro de 2024</p>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-800 font-medium">
                      🔒 Criptografia SSL/TLS 256-bit
                    </p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      ☁️ Infraestrutura em nuvem segura
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="max-w-4xl mx-auto prose prose-lg">

              {/* 1. Compromisso com Segurança */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Shield className="h-8 w-8 text-green-600 mr-3" />
                  1. Nosso Compromisso com a Segurança
                </h2>
                <div className="bg-green-50 p-6 rounded-lg">
                  <p className="text-gray-700 mb-4">
                    A segurança dos dados de nossos clientes é nossa prioridade máxima na Ticket Wise. 
                    Implementamos as melhores práticas e tecnologias de ponta para garantir que suas informações 
                    estejam sempre protegidas.
                  </p>
                  <p className="text-gray-700">
                    Nossa abordagem de segurança é multicamadas, envolvendo proteções técnicas, organizacionais 
                    e processuais que são constantemente atualizadas para enfrentar as ameaças em evolução.
                  </p>
                </div>
              </div>

              {/* 2. Medidas Técnicas de Segurança */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Server className="h-8 w-8 text-green-600 mr-3" />
                  2. Medidas Técnicas de Segurança
                </h2>

                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Lock className="h-5 w-5 text-green-600 mr-2" />
                      Criptografia
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• SSL/TLS 1.3 para transmissão de dados</li>
                      <li>• Criptografia AES-256 para dados em repouso</li>
                      <li>• Chaves de criptografia gerenciadas com HSM</li>
                      <li>• Rotação automática de chaves</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Server className="h-5 w-5 text-green-600 mr-2" />
                      Infraestrutura
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Servidores em data centers certificados</li>
                      <li>• Firewall de aplicação web (WAF)</li>
                      <li>• Proteção contra DDoS</li>
                      <li>• Monitoramento 24/7 da infraestrutura</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <Eye className="h-5 w-5 text-green-600 mr-2" />
                      Monitoramento
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• SIEM para detecção de ameaças</li>
                      <li>• Logs de auditoria completos</li>
                      <li>• Alertas em tempo real</li>
                      <li>• Análise comportamental de usuários</li>
                    </ul>
                  </div>

                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      Controle de Acesso
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Senhas seguras obrigatórias</li>
                      <li>• Controle de acesso baseado em funções</li>
                      <li>• Sessões com tempo de expiração</li>
                      <li>• Princípio do menor privilégio</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. Backup e Recuperação */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Backup e Recuperação de Dados</h2>
                <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Estratégia de Backup</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Frequência</h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Backup contínuo de dados críticos</li>
                        <li>• Backup completo diário</li>
                        <li>• Backup incremental a cada 4 horas</li>
                        <li>• Snapshot de sistema em tempo real</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-blue-800 mb-2">Armazenamento</h4>
                      <ul className="space-y-1 text-blue-700">
                        <li>• Múltiplas cópias em locais diferentes</li>
                        <li>• Replicação geográfica automática</li>
                        <li>• Teste de integridade dos backups</li>
                        <li>• Recuperação testada mensalmente</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                    <p className="text-blue-800 font-medium">
                      💡 <strong>RTO (Recovery Time Objective):</strong> Menos de 4 horas<br />
                      💾 <strong>RPO (Recovery Point Objective):</strong> Menos de 1 hora
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Segurança de Senhas */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Política de Segurança de Senhas</h2>
                <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3">Requisitos para Senhas de Usuários</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">✅ Obrigatório</h4>
                      <ul className="space-y-1 text-yellow-700">
                        <li>• Mínimo de 8 caracteres</li>
                        <li>• Máximo de 128 caracteres</li>
                        <li>• Pelo menos 1 letra maiúscula</li>
                        <li>• Pelo menos 1 letra minúscula</li>
                        <li>• Pelo menos 1 número</li>
                        <li>• Pelo menos 1 caractere especial</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold text-yellow-800 mb-2">🔒 Proteções</h4>
                      <ul className="space-y-1 text-yellow-700">
                        <li>• Hash com algoritmo bcrypt</li>
                        <li>• Salt único para cada senha</li>
                        <li>• Verificação contra senhas vazadas</li>
                        <li>• Bloqueio após tentativas inválidas</li>
                        <li>• Histórico de senhas anteriores</li>
                        <li>• Expiração configurável</li>
                      </ul>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                    <p className="text-yellow-800">
                      <strong>💡 Dica:</strong> Recomendamos o uso de gerenciadores de senhas para 
                      criar e armazenar senhas seguras e únicas.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. Segurança da Equipe */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <Users className="h-8 w-8 text-green-600 mr-3" />
                  5. Segurança Organizacional
                </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Treinamento da Equipe</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Treinamento obrigatório em segurança</li>
                      <li>Simulações de phishing regulares</li>
                      <li>Conscientização sobre engenharia social</li>
                      <li>Atualizações sobre novas ameaças</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">Controles Internos</h3>
                    <ul className="list-disc pl-6 space-y-2 text-gray-700">
                      <li>Verificação de antecedentes de funcionários</li>
                      <li>Acordos de confidencialidade (NDA)</li>
                      <li>Separação de responsabilidades</li>
                      <li>Revisão de acesso trimestral</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 6. Resposta a Incidentes */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                  <AlertTriangle className="h-8 w-8 text-red-600 mr-3" />
                  6. Resposta a Incidentes de Segurança
                </h2>
                <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-900 mb-3">Processo de Resposta</h3>
                  <div className="grid md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold">1</span>
                      </div>
                      <h4 className="font-semibold text-red-800">Detecção</h4>
                      <p className="text-red-700 text-sm">Identificação automática ou manual</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold">2</span>
                      </div>
                      <h4 className="font-semibold text-red-800">Contenção</h4>
                      <p className="text-red-700 text-sm">Isolamento da ameaça</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold">3</span>
                      </div>
                      <h4 className="font-semibold text-red-800">Investigação</h4>
                      <p className="text-red-700 text-sm">Análise e avaliação</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <span className="text-red-600 font-bold">4</span>
                      </div>
                      <h4 className="font-semibold text-red-800">Recuperação</h4>
                      <p className="text-red-700 text-sm">Restauração e melhoria</p>
                    </div>
                  </div>
                  <div className="bg-red-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-red-900 mb-2">Compromissos de Tempo</h4>
                    <ul className="space-y-1 text-red-800">
                      <li>• <strong>Detecção:</strong> Dentro de 15 minutos</li>
                      <li>• <strong>Primeira resposta:</strong> Dentro de 1 hora</li>
                      <li>• <strong>Notificação aos clientes:</strong> Dentro de 24 horas (se aplicável)</li>
                      <li>• <strong>Relatório pós-incidente:</strong> Dentro de 72 horas</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 7. Auditorias e Testes */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Auditorias e Testes de Segurança</h2>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Testes de Penetração</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Testes trimestrais por terceiros</li>
                      <li>• Varredura de vulnerabilidades</li>
                      <li>• Teste de aplicações web</li>
                      <li>• Avaliação de infraestrutura</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Auditorias Internas</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Revisão mensal de acessos</li>
                      <li>• Auditoria de logs de segurança</li>
                      <li>• Verificação de conformidade</li>
                      <li>• Análise de código-fonte</li>
                    </ul>
                  </div>
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Auditorias Externas</h3>
                    <ul className="space-y-2 text-gray-700">
                      <li>• Avaliação independente de segurança</li>
                      <li>• Auditoria de conformidade com LGPD</li>
                      <li>• Revisão de políticas e procedimentos</li>
                      <li>• Testes de recuperação de desastres</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 8. Transparência e Comunicação */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Transparência e Comunicação</h2>
                <div className="bg-blue-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-blue-900 mb-3">Nosso Compromisso</h3>
                  <p className="text-blue-800 mb-4">
                    Acreditamos na transparência total sobre nossas práticas de segurança. 
                    Mantemos nossos clientes informados sobre:
                  </p>
                  <ul className="grid md:grid-cols-2 gap-4 text-blue-700">
                    <li>• Atualizações de segurança importantes</li>
                    <li>• Mudanças em políticas de segurança</li>
                    <li>• Incidentes que possam afetar dados</li>
                    <li>• Melhorias na infraestrutura</li>
                    <li>• Resultados de auditorias relevantes</li>
                    <li>• Status de certificações</li>
                  </ul>
                </div>
              </div>

              {/* 9. Contato para Questões de Segurança */}
              <div className="mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-6">9. Contato e Reportar Vulnerabilidades</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-green-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-green-900 mb-3">Equipe de Segurança</h3>
                    <ul className="space-y-2 text-green-700">
                      <li><strong>Email:</strong> security@ticketwise.com.br</li>
                      <li><strong>Telefone:</strong> (21) 2042-2588</li>
                      <li><strong>Horário:</strong> 24/7 para emergências</li>
                    </ul>
                    <p className="text-green-700 text-sm mt-3">
                      Para questões urgentes de segurança, entre em contato imediatamente.
                    </p>
                  </div>
                  <div className="bg-orange-50 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold text-orange-900 mb-3">Relatório de Vulnerabilidades</h3>
                    <p className="text-orange-700 mb-3">
                      Encorajamos a divulgação responsável de possíveis vulnerabilidades de segurança.
                    </p>
                    <ul className="space-y-2 text-orange-700">
                      <li><strong>Email:</strong> security@ticketwise.com.br</li>
                      <li><strong>Política:</strong> Divulgação responsável</li>
                      <li><strong>Resposta:</strong> Dentro de 48 horas</li>
                    </ul>
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
              Sua Segurança é Nossa Responsabilidade
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Implementamos as melhores práticas de segurança para proteger seus dados e garantir a continuidade do seu negócio
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/contact"
                className="bg-green-600 text-white font-medium py-3 px-6 rounded-md hover:bg-green-700 transition-colors"
              >
                Falar com nossa Equipe de Segurança
              </Link>
              <Link
                to="/privacy"
                className="border border-green-600 text-green-600 font-medium py-3 px-6 rounded-md hover:bg-green-50 transition-colors"
              >
                Ver Política de Privacidade
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </>
  );
};

export default SecurityPage;