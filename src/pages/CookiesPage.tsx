import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Cookie, Shield, CheckCircle2, Info, ExternalLink, Settings } from 'lucide-react';

const CookiesPage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  
  return (
    <>
      <Helmet>
        <title>Política de Cookies - Ticket Wise | Uso de Cookies e Armazenamento Local</title>
        <meta name="description" content="Política de cookies da Ticket Wise: informações sobre o uso de cookies essenciais, armazenamento local e nossa política transparente sobre cookies." />
        <link rel="canonical" href={`${baseUrl}/cookies`} />
        
        <meta property="og:title" content="Política de Cookies - Ticket Wise | Uso de Cookies e Armazenamento Local" />
        <meta property="og:description" content="Política de cookies da Ticket Wise: informações sobre o uso de cookies essenciais, armazenamento local e nossa política transparente sobre cookies." />
        <meta property="og:url" content={`${baseUrl}/cookies`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Política de Cookies - Ticket Wise | Uso de Cookies e Armazenamento Local" />
        <meta name="twitter:description" content="Política de cookies da Ticket Wise: informações sobre o uso de cookies essenciais, armazenamento local e nossa política transparente sobre cookies." />
        <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Política de Cookies - Ticket Wise",
            "description": "Política detalhada sobre o uso de cookies e armazenamento local no site institucional da Ticket Wise.",
            "url": `${baseUrl}/cookies`,
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
                {"@type": "ListItem", "position": 2, "name": "Cookies", "item": `${baseUrl}/cookies`}
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="pt-20">
        {/* Header Section */}
        <section className="py-16 md:py-24 bg-orange-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex justify-center mb-6">
                <Cookie className="h-12 w-12 text-orange-600" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Política de Cookies
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Como utilizamos cookies e tecnologias similares no site da Ticket Wise
            </p>
            <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
              <div className="flex items-center justify-center mb-4">
                <Info className="h-6 w-6 text-orange-600 mr-2" />
                <span className="font-semibold text-gray-900">Última atualização:</span>
              </div>
              <p className="text-gray-600">15 de dezembro de 2024</p>
              <div className="mt-4 p-3 bg-orange-50 rounded-lg">
                <p className="text-sm text-orange-800 font-medium">
                  📋 Site institucional - Cookies mínimos essenciais
                </p>
              </div>
            </div>
          </div>
      </section>

      {/* Cookie Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">

            {/* 1. O que são Cookies */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Cookie className="h-8 w-8 text-orange-600 mr-3" />
                1. O que são Cookies
              </h2>
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Cookies são pequenos arquivos de texto armazenados no seu navegador quando você visita um site. 
                  Eles ajudam o site a lembrar suas preferências e melhorar sua experiência de navegação.
                </p>
                <p className="text-gray-700">
                  Este site institucional da Ticket Wise utiliza apenas cookies essenciais para funcionamento básico 
                  e armazenamento temporário de dados durante o processo de cadastro.
                </p>
              </div>
            </div>

            {/* 2. Cookies Utilizados */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">2. Cookies e Tecnologias Utilizadas</h2>
              
              <div className="grid md:grid-cols-1 gap-6 mb-6">
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                    <Shield className="h-5 w-5 text-green-600 mr-2" />
                    Armazenamento Local (LocalStorage/SessionStorage)
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-300 mb-4">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border border-gray-300 p-3 text-left">Nome</th>
                          <th className="border border-gray-300 p-3 text-left">Finalidade</th>
                          <th className="border border-gray-300 p-3 text-left">Duração</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-300 p-3"><code>registrationData</code></td>
                          <td className="border border-gray-300 p-3">Armazena dados do formulário de cadastro temporariamente</td>
                          <td className="border border-gray-300 p-3">Até conclusão do processo</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-gray-600 text-sm">
                    <strong>Essencial:</strong> Necessário para o funcionamento do processo de cadastro
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Importante</h3>
                <p className="text-blue-800 mb-2">
                  Este site institucional <strong>NÃO utiliza</strong>:
                </p>
                <ul className="space-y-1 text-blue-700">
                  <li>• Cookies de rastreamento ou analytics</li>
                  <li>• Cookies de marketing ou publicidade</li>
                  <li>• Cookies de redes sociais</li>
                  <li>• Cookies de terceiros para coleta de dados</li>
                </ul>
                <p className="text-blue-800 mt-3">
                  <strong>Autenticação:</strong> O sistema de login está no domínio separado 
                  <code className="bg-blue-100 px-1 rounded">app.ticketwise.com.br</code> 
                  e possui sua própria política de cookies.
                </p>
              </div>
            </div>

            {/* 3. Finalidades */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">3. Para que Utilizamos</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-green-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-green-800 mb-3">✅ Utilizamos Para</h3>
                  <ul className="space-y-2 text-green-700">
                    <li>• Manter dados do formulário durante o cadastro</li>
                    <li>• Preservar progresso em formulários multi-etapas</li>
                    <li>• Funcionalidade básica do site</li>
                    <li>• Processar pagamentos via Stripe (sessão temporária)</li>
                  </ul>
                </div>
                <div className="bg-red-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-800 mb-3">❌ NÃO Utilizamos Para</h3>
                  <ul className="space-y-2 text-red-700">
                    <li>• Rastrear sua navegação</li>
                    <li>• Coletar dados para marketing</li>
                    <li>• Criar perfis de usuário</li>
                    <li>• Compartilhar com terceiros</li>
                    <li>• Publicidade direcionada</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 4. Domínios e Sistemas */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">4. Diferentes Domínios da Ticket Wise</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-orange-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-orange-900 mb-3">
                    🌐 Site Institucional
                  </h3>
                  <p className="text-orange-700 mb-2">
                    <strong>Este site</strong> (ticketwise.com.br)
                  </p>
                  <ul className="space-y-1 text-orange-700">
                    <li>• Informações sobre o produto</li>
                    <li>• Processo de cadastro/pagamento</li>
                    <li>• Cookies mínimos essenciais</li>
                    <li>• Sem rastreamento</li>
                  </ul>
                </div>
                <div className="bg-purple-50 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold text-purple-900 mb-3">
                    🔐 Sistema Principal
                  </h3>
                  <p className="text-purple-700 mb-2">
                    <strong>app.ticketwise.com.br</strong>
                  </p>
                  <ul className="space-y-1 text-purple-700">
                    <li>• Login e autenticação</li>
                    <li>• Gestão de chamados</li>
                    <li>• Cookies de sessão de usuário</li>
                    <li>• Política própria de cookies</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 5. Como Gerenciar */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6 flex items-center">
                <Settings className="h-8 w-8 text-orange-600 mr-3" />
                5. Como Gerenciar Cookies
              </h2>
              <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-900 mb-3">Controle do Navegador</h3>
                <p className="text-yellow-800 mb-4">
                  Você pode controlar cookies através das configurações do seu navegador:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Navegadores Principais</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• <strong>Chrome:</strong> Configurações &gt; Privacidade &gt; Cookies</li>
                      <li>• <strong>Firefox:</strong> Preferências &gt; Privacidade &gt; Cookies</li>
                      <li>• <strong>Safari:</strong> Preferências &gt; Privacidade &gt; Cookies</li>
                      <li>• <strong>Edge:</strong> Configurações &gt; Privacidade &gt; Cookies</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-800 mb-2">Opções Disponíveis</h4>
                    <ul className="space-y-1 text-yellow-700">
                      <li>• Bloquear todos os cookies</li>
                      <li>• Permitir apenas cookies essenciais</li>
                      <li>• Excluir cookies existentes</li>
                      <li>• Configurar por site específico</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-yellow-100 rounded-lg">
                  <p className="text-yellow-800">
                    <strong>⚠️ Atenção:</strong> Bloquear cookies essenciais pode impedir o funcionamento 
                    correto do processo de cadastro e pagamento.
                  </p>
                </div>
              </div>
            </div>

            {/* 6. Dados Temporários */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">6. Armazenamento Temporário</h2>
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Como Funciona</h3>
                <p className="text-blue-800 mb-4">
                  Durante o processo de cadastro, armazenamos temporariamente:
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">📝 Dados Armazenados</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Informações do formulário de cadastro</li>
                      <li>• Dados da empresa (nome, CNPJ, etc.)</li>
                      <li>• Plano selecionado</li>
                      <li>• Progresso no processo de cadastro</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">🗑️ Exclusão Automática</h4>
                    <ul className="space-y-1 text-blue-700">
                      <li>• Após conclusão do cadastro</li>
                      <li>• Em caso de erro no processo</li>
                      <li>• Quando você fecha o navegador</li>
                      <li>• Após 24 horas automaticamente</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            {/* 7. Atualizações */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">7. Alterações nesta Política</h2>
              <p className="text-gray-700 mb-4">
                Podemos atualizar esta política de cookies periodicamente para refletir mudanças em 
                nossas práticas ou por outros motivos operacionais, legais ou regulamentares.
              </p>
              <p className="text-gray-700">
                Recomendamos que você revise esta página ocasionalmente para se manter informado 
                sobre como utilizamos cookies.
              </p>
            </div>

            {/* 8. Contato */}
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-6">8. Dúvidas sobre Cookies</h2>
              <div className="bg-orange-50 p-6 rounded-lg">
                <p className="text-gray-700 mb-4">
                  Se você tiver dúvidas sobre nossa política de cookies:
                </p>
                <ul className="space-y-2 text-gray-700">
                  <li><strong>Email:</strong> contato@ticketwise.com.br</li>
                  <li><strong>Telefone:</strong> (21) 2042-2588</li>
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
              Transparência em Primeiro Lugar
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Utilizamos apenas cookies essenciais para garantir o funcionamento básico do site
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                to="/privacy"
                className="bg-orange-600 text-white font-medium py-3 px-6 rounded-md hover:bg-orange-700 transition-colors"
              >
                Ver Política de Privacidade
              </Link>
              <Link
                to="/contact"
                className="border border-orange-600 text-orange-600 font-medium py-3 px-6 rounded-md hover:bg-orange-50 transition-colors"
              >
                Entrar em Contato
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  </>
  );
};

export default CookiesPage;