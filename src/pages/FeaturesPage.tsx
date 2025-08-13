import React from 'react';
import { motion } from 'framer-motion';
import FeatureSection from '../components/FeatureSection';
import CTASection from '../components/CTASection';
import { Helmet } from 'react-helmet-async';

const FeaturesPage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  const title = 'Funcionalidades | Ticket Wise';
  const description = 'Conheça os recursos do Ticket Wise: gestão de tickets, automações, relatórios e muito mais para escalar seu suporte.';
  const url = `${baseUrl}/features`;
  const image = `${baseUrl}/og-image.jpg`;

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: baseUrl
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Funcionalidades',
        item: url
      }
    ]
  };

  return (
    <div className="pt-20">
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <script type="application/ld+json">{JSON.stringify(breadcrumbJsonLd)}</script>
      </Helmet>

      <section className="py-16 md:py-24 bg-purple-50">
        <div className="container mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center max-w-4xl mx-auto"
          >
            <span className="inline-block px-3 py-1 text-sm font-medium rounded-full bg-purple-100 text-purple-700 mb-4">
              Funcionalidades
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
              Recursos poderosos para transformar seu atendimento
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Descubra todas as ferramentas do Ticket Wise que tornarão seu suporte técnico mais eficiente e seus clientes mais satisfeitos.
            </p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="max-w-5xl mx-auto"
          >
            <img 
              src="/dashboard-screenshot.png" 
              alt="Dashboard do Ticket Wise"
              className="w-full h-auto rounded-lg shadow-lg"
            />
          </motion.div>
        </div>
      </section>

      <FeatureSection />

      <CTASection />
    </div>
  );
};

export default FeaturesPage;