import React from 'react';
import Hero from '../components/Hero';
import FeatureSection from '../components/FeatureSection';
import HowItWorks from '../components/HowItWorks';
import Testimonials from '../components/Testimonials';
import PricingPlans from '../components/PricingPlans';
import CTASection from '../components/CTASection';

const HomePage: React.FC = () => {
  return (
    <div>
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