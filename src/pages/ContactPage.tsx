import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../lib/api';

const ContactPage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    reason: 'general'
  });
  
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setErrorMessage('');

    try {
      await api.sendContact(formData);

      setStatus('success');
      
      // Resetar formulário após sucesso
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          company: '',
          message: '',
          reason: 'general'
        });
        setStatus('idle');
      }, 3000);

    } catch (error: any) {
      console.error('Erro ao enviar formulário:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Erro interno do servidor. Tente novamente mais tarde.');
    }
  };

  const resetForm = () => {
    setStatus('idle');
    setErrorMessage('');
  };

  return (
    <React.Fragment>
      <Helmet>
        <title>Contato - Ticket Wise | Fale Conosco</title>
        <meta name="description" content="Entre em contato com o Ticket Wise. Tire suas dúvidas, solicite uma demonstração ou fale com nosso suporte. Estamos aqui para ajudar sua empresa!" />
        <link rel="canonical" href={`${baseUrl}/contact`} />
        
        <meta property="og:title" content="Contato - Ticket Wise | Fale Conosco" />
        <meta property="og:description" content="Entre em contato com o Ticket Wise. Tire suas dúvidas, solicite uma demonstração ou fale com nosso suporte. Estamos aqui para ajudar sua empresa!" />
        <meta property="og:url" content={`${baseUrl}/contact`} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content={`${baseUrl}/og-image.jpg`} />
        
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Contato - Ticket Wise | Fale Conosco" />
        <meta name="twitter:description" content="Entre em contato com o Ticket Wise. Tire suas dúvidas, solicite uma demonstração ou fale com nosso suporte. Estamos aqui para ajudar sua empresa!" />
        <meta name="twitter:image" content={`${baseUrl}/og-image.jpg`} />

        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ContactPage",
            "name": "Contato - Ticket Wise",
            "description": "Entre em contato com o Ticket Wise para suporte, demonstrações e informações sobre nosso sistema de gestão de chamados.",
            "url": `${baseUrl}/contact`,
            "mainEntity": {
              "@type": "Organization",
              "name": "Ticket Wise",
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+55-11-99999-9999",
                "contactType": "customer service",
                "availableLanguage": "Portuguese"
              },
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Rua Exemplo, 123",
                "addressLocality": "São Paulo",
                "addressRegion": "SP",
                "postalCode": "01234-567",
                "addressCountry": "BR"
              }
            }
          })}
        </script>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50 pt-20">
        <section className="py-16 md:py-24 bg-purple-50">
          <div className="container mx-auto px-4 md:px-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="text-center max-w-4xl mx-auto"
            >
              <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
                Contato
              </span>
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Entre em contato conosco
              </h1>
              <p className="text-xl text-gray-600 mb-8">
                Estamos prontos para ajudar. Tire suas dúvidas, solicite uma demonstração ou fale com nossa equipe de vendas.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-white">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Info */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Informações de Contato</h2>
                <p className="text-lg text-gray-600 mb-8">
                  Nossa equipe está disponível para ajudar você a encontrar a solução ideal para sua empresa.
                </p>

                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full mr-4">
                      <MapPin className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Endereço</h3>
                      <p className="text-gray-600">
                        Avenida das Américas, 17500, Bloco 1/202<br />
                        Rio de Janeiro, RJ 22790-704<br />
                        Brasil
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full mr-4">
                      <Phone className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Telefone</h3>
                      <p className="text-gray-600">
                        +55 (21) 2042-2588<br />
                        Segunda a Sexta, 9h às 18h
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="flex-shrink-0 p-3 bg-purple-100 rounded-full mr-4">
                      <Mail className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Email</h3>
                      <p className="text-gray-600">
                        contato@ticketwise.com.br<br />
                        suporte@ticketwise.com.br
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Nos siga nas redes sociais</h3>
                  <div className="flex space-x-4">
                    <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition-colors">
                      <span className="sr-only">Facebook</span>
                      Facebook
                    </a>
                    <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition-colors">
                      <span className="sr-only">Twitter</span>
                      Twitter
                    </a>
                    <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition-colors">
                      <span className="sr-only">LinkedIn</span>
                      LinkedIn
                    </a>
                    <a href="#" className="p-2 bg-gray-100 rounded-full hover:bg-purple-100 transition-colors">
                      <span className="sr-only">Instagram</span>
                      Instagram
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                className="bg-white rounded-xl shadow-md p-8"
              >
                {status === 'success' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle2 size={32} className="text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h2>
                    <p className="text-gray-600 mb-4">
                      Obrigado por entrar em contato conosco.
                    </p>
                    <p className="text-gray-600 mb-8">
                      Nossa equipe responderá em até <strong>24 horas úteis</strong>.
                    </p>
                    <button
                      onClick={resetForm}
                      className="bg-purple-600 text-white font-medium py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Enviar outra mensagem
                    </button>
                  </div>
                ) : status === 'error' ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                      <AlertCircle size={32} className="text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Erro ao Enviar</h2>
                    <p className="text-gray-600 mb-4">
                      {errorMessage}
                    </p>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-6">
                      <p className="text-sm text-orange-800">
                        <strong>Contato direto:</strong><br />
                        📧 contato@ticketwise.com.br<br />
                        📞 (21) 2042-2588
                      </p>
                    </div>
                    <button
                      onClick={resetForm}
                      className="bg-purple-600 text-white font-medium py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                    >
                      Tentar novamente
                    </button>
                  </div>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Nome completo *
                        </label>
                        <input
                          type="text"
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          disabled={status === 'sending'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email *
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            disabled={status === 'sending'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                            Telefone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            disabled={status === 'sending'}
                            placeholder="(11) 99999-9999"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                          Empresa
                        </label>
                        <input
                          type="text"
                          id="company"
                          name="company"
                          value={formData.company}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          placeholder="Nome da sua empresa"
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div>
                        <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                          Motivo do contato *
                        </label>
                        <select
                          id="reason"
                          name="reason"
                          value={formData.reason}
                          onChange={handleChange}
                          disabled={status === 'sending'}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        >
                          <option value="general">Informações gerais</option>
                          <option value="sales">Falar com vendas</option>
                          <option value="support">Suporte técnico</option>
                          <option value="demo">Solicitar demonstração</option>
                          <option value="partnership">Parcerias</option>
                        </select>
                      </div>

                      <div>
                        <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                          Mensagem *
                        </label>
                        <textarea
                          id="message"
                          name="message"
                          rows={4}
                          value={formData.message}
                          onChange={handleChange}
                          required
                          disabled={status === 'sending'}
                          maxLength={2000}
                          placeholder="Descreva como podemos ajudá-lo..."
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {formData.message.length}/2000 caracteres
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={status === 'sending'}
                        className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center disabled:bg-purple-400 disabled:cursor-not-allowed"
                      >
                        {status === 'sending' ? (
                          <>
                            <Loader2 size={16} className="mr-2 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            Enviar Mensagem <Send size={16} className="ml-2" />
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </motion.div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gray-50">
          <div className="container mx-auto px-4 md:px-6">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Perguntas Frequentes
              </h2>
              <p className="text-xl text-gray-600">
                Respostas para as dúvidas mais comuns
              </p>
            </div>

            <div className="max-w-4xl mx-auto space-y-6">
              {[
                {
                  question: "Quanto tempo leva para implementar o Ticket Wise?",
                  answer: "A implementação do Ticket Wise é rápida e simples. Você pode começar a usar o sistema em questão de minutos. Para configurações mais personalizadas, nossa equipe de suporte está disponível para ajudá-lo."
                },
                {
                  question: "O Ticket Wise oferece integração com outros sistemas?",
                  answer: "Sim, o Ticket Wise oferece integração com diversas ferramentas populares como Slack, Microsoft Teams, Google Workspace, Trello, GitHub, Jira, Zapier e muito mais. Se você precisar de uma integração específica, entre em contato conosco."
                },
                {
                  question: "Vocês oferecem treinamento para novos usuários?",
                  answer: "Sim, oferecemos treinamento completo para todos os novos clientes. Além disso, disponibilizamos uma base de conhecimento detalhada, tutoriais em vídeo e webinars regulares para ajudar sua equipe a aproveitar ao máximo o Ticket Wise."
                },
                {
                  question: "O Ticket Wise é adequado para pequenas empresas?",
                  answer: "Absolutamente! O Ticket Wise foi projetado para ser escalável, atendendo desde pequenas empresas até grandes corporações. Nosso plano Básico é perfeito para pequenas equipes que estão começando a estruturar seu atendimento ao cliente."
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
        </section>
      </div>
    </React.Fragment>
    );
};

export default ContactPage;