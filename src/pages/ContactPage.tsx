import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone, Send } from 'lucide-react';

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
    reason: 'general'
  });
  
  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would normally handle the API call to submit the form
    // For now, we'll just simulate success
    setFormSubmitted(true);
  };

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
              {!formSubmitted ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Envie uma mensagem</h2>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nome completo
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo do contato
                      </label>
                      <select
                        id="reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
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
                        Mensagem
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        rows={4}
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-purple-600 text-white font-medium py-3 px-4 rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center"
                    >
                      Enviar Mensagem <Send size={16} className="ml-2" />
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Send size={24} className="text-green-600" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Mensagem Enviada!</h2>
                  <p className="text-gray-600 mb-8">
                    Obrigado por entrar em contato conosco. Nossa equipe responderá em até 24 horas úteis.
                  </p>
                  <button
                    onClick={() => setFormSubmitted(false)}
                    className="bg-purple-600 text-white font-medium py-2 px-6 rounded-md hover:bg-purple-700 transition-colors"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
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
  );
};

export default ContactPage;