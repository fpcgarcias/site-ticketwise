import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  author: string;
  date: string;
  readTime: string;
  category: string;
  image: string;
};

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: '7 Estratégias para Melhorar o Atendimento ao Cliente em 2024',
    excerpt: 'Descubra as principais tendências e práticas para elevar o nível do seu suporte técnico e fidelizar clientes.',
    author: 'Ricardo Almeida',
    date: '15 de Maio, 2024',
    readTime: '8 min de leitura',
    category: 'Atendimento',
    image: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '2',
    title: 'Como a Inteligência Artificial está Revolucionando o Suporte Técnico',
    excerpt: 'A IA está transformando a forma como as empresas lidam com tickets de suporte. Veja como implementar essas tecnologias.',
    author: 'Amanda Santos',
    date: '03 de Maio, 2024',
    readTime: '6 min de leitura',
    category: 'Tecnologia',
    image: 'https://images.pexels.com/photos/8386440/pexels-photo-8386440.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '3',
    title: 'Métricas Essenciais para Monitorar a Eficiência do Seu Help Desk',
    excerpt: 'Aprenda quais KPIs são fundamentais para avaliar e melhorar continuamente o desempenho da sua equipe de suporte.',
    author: 'Fernando Costa',
    date: '28 de Abril, 2024',
    readTime: '10 min de leitura',
    category: 'Gestão',
    image: 'https://images.pexels.com/photos/7439141/pexels-photo-7439141.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '4',
    title: 'Como Implementar SLAs Efetivos para Diferentes Níveis de Suporte',
    excerpt: 'Guia completo para definir e gerenciar acordos de nível de serviço que realmente funcionam para sua empresa.',
    author: 'Mariana Oliveira',
    date: '15 de Abril, 2024',
    readTime: '9 min de leitura',
    category: 'Processos',
    image: 'https://images.pexels.com/photos/3183153/pexels-photo-3183153.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '5',
    title: 'O Impacto da Automação na Satisfação do Cliente',
    excerpt: 'Entenda como a automação inteligente de processos pode aumentar a satisfação do cliente sem perder o toque humano.',
    author: 'Paulo Mendes',
    date: '02 de Abril, 2024',
    readTime: '7 min de leitura',
    category: 'Automação',
    image: 'https://images.pexels.com/photos/8867482/pexels-photo-8867482.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  },
  {
    id: '6',
    title: 'Treinando Sua Equipe para Excelência no Atendimento Remoto',
    excerpt: 'Dicas práticas para capacitar sua equipe a oferecer um suporte excepcional mesmo à distância.',
    author: 'Carla Rodrigues',
    date: '20 de Março, 2024',
    readTime: '8 min de leitura',
    category: 'Equipe',
    image: 'https://images.pexels.com/photos/7479721/pexels-photo-7479721.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
  }
];

const categories = ['Todos', 'Atendimento', 'Tecnologia', 'Gestão', 'Processos', 'Automação', 'Equipe'];

const BlogPage: React.FC = () => {
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
              Blog
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Insights e Novidades
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Dicas, tendências e melhores práticas para otimizar o atendimento ao cliente e o suporte técnico.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4 md:px-6">
          {/* Featured Post */}
          <div className="mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
            >
              <div>
                <img 
                  src="https://images.pexels.com/photos/8867232/pexels-photo-8867232.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
                  alt="Como Criar uma Estratégia de Suporte Omnichannel Eficiente" 
                  className="rounded-xl shadow-lg w-full h-auto object-cover"
                />
              </div>
              <div>
                <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
                  Destaque
                </span>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Como Criar uma Estratégia de Suporte Omnichannel Eficiente
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  Unificar seus canais de atendimento é essencial para oferecer uma experiência consistente ao cliente. Neste artigo, apresentamos um guia passo a passo para implementar uma estratégia omnichannel eficaz.
                </p>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="flex items-center">
                    <User size={16} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">Maria Silva</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar size={16} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">25 de Maio, 2024</span>
                  </div>
                  <div className="flex items-center">
                    <Clock size={16} className="text-gray-400 mr-1" />
                    <span className="text-sm text-gray-600">12 min de leitura</span>
                  </div>
                </div>
                <a 
                  href="#" 
                  className="inline-block bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
                >
                  Ler Artigo Completo
                </a>
              </div>
            </motion.div>
          </div>

          {/* Categories */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-4 py-2 rounded-md ${
                    index === 0 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition-colors`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <Link to={`/blog/${post.id}`}>
                  <img 
                    src={post.image} 
                    alt={post.title} 
                    className="w-full h-48 object-cover"
                  />
                </Link>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-700 mb-3">
                    {post.category}
                  </span>
                  <Link to={`/blog/${post.id}`}>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-purple-600 transition-colors">
                      {post.title}
                    </h3>
                  </Link>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600">{post.author}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Clock size={14} className="mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-12">
            <button className="bg-white border border-purple-600 text-purple-600 font-medium py-3 px-6 rounded-md hover:bg-purple-50 transition-colors">
              Carregar Mais Artigos
            </button>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Inscreva-se na Nossa Newsletter
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Receba os melhores conteúdos sobre atendimento ao cliente e gestão de suporte técnico diretamente na sua caixa de entrada.
            </p>
            <form className="flex flex-col md:flex-row gap-4 justify-center">
              <input
                type="email"
                placeholder="Seu endereço de e-mail"
                className="px-4 py-3 rounded-md border border-gray-300 focus:ring-purple-500 focus:border-purple-500 flex-grow max-w-md"
                required
              />
              <button
                type="submit"
                className="bg-purple-600 text-white font-medium py-3 px-6 rounded-md hover:bg-purple-700 transition-colors"
              >
                Inscrever-se
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default BlogPage;