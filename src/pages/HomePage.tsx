import React from 'react';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import PricingPlans from '../components/PricingPlans';
import CTASection from '../components/CTASection';
import { Helmet } from 'react-helmet-async';

const HomePage: React.FC = () => {
  const baseUrl = 'https://www.ticketwise.com.br';
  const title = 'Ticket Wise | Plataforma de Suporte e Gestão de Tickets';
  const description = 'Simplifique seu suporte ao cliente com a Ticket Wise. Centralize tickets, automatize fluxos e acompanhe métricas em tempo real.';
  const url = `${baseUrl}/`;
  const image = `${baseUrl}/og-image.jpg`;

  const orgJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Ticket Wise',
    url: baseUrl,
    logo: `${baseUrl}/logo.svg`,
    sameAs: [
      'https://www.linkedin.com/company/ticketwise',
      'https://twitter.com/ticketwise'
    ],
    contactPoint: [{
      '@type': 'ContactPoint',
      email: 'contato@ticketwise.com.br',
      telephone: '+55-21-2042-2588',
      contactType: 'customer service',
      areaServed: 'BR',
      availableLanguage: ['Portuguese', 'English']
    }]
  };

  const softwareJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Ticket Wise',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: [
      {
        '@type': 'Offer',
        name: 'Básico Mensal',
        price: '119.00',
        priceCurrency: 'BRL',
        url: `${baseUrl}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Professional Mensal',
        price: '199.00',
        priceCurrency: 'BRL',
        url: `${baseUrl}/pricing`,
      },
      {
        '@type': 'Offer',
        name: 'Enterprise Mensal',
        price: '299.00',
        priceCurrency: 'BRL',
        url: `${baseUrl}/pricing`,
      }
    ]
  };

  return (
    <div>
      <Helmet>
        <title>{title}</title>
        <meta name="description" content={description} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:url" content={url} />
        <meta property="og:image" content={image} />
        <meta property="og:type" content="website" />
        <meta name="twitter:title" content={title} />
        <meta name="twitter:description" content={description} />
        <meta name="twitter:image" content={image} />
        <script type="application/ld+json">{JSON.stringify(orgJsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(softwareJsonLd)}</script>
      </Helmet>

      <Hero />
      <FeatureSection />
      <HowItWorks />
      <Testimonials />
      <PricingPlans />
      <CTASection />
    </div>
  );
};

export default HomePage;