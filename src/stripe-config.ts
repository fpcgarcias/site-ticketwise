export const products = {
  // Planos de Assinatura
  basic_monthly: {
    name: 'Ticket Wise - Básico',
    description: 'Plano Básico Mensal',
    priceId: 'price_1S3KBfJrnNh1FDmnnPMtWGVv',
    mode: 'subscription' as const,
    billing: 'monthly' as const,
    amount: 11900, // R$ 119,00
  },
  basic_annual: {
    name: 'Ticket Wise - Básico Anual',
    description: 'Plano Básico Anual',
    priceId: 'price_1S3KE7JrnNh1FDmnLtAd7SD8',
    mode: 'subscription' as const,
    billing: 'annual' as const,
    amount: 121200, // R$ 1.212,00
  },
  pro_monthly: {
    name: 'Ticket Wise - Professional',
    description: 'Plano Professional Mensal',
    priceId: 'price_1S3KCVJrnNh1FDmn8bvDvan7',
    mode: 'subscription' as const,
    billing: 'monthly' as const,
    amount: 19900, // R$ 199,00
  },
  pro_annual: {
    name: 'Ticket Wise - Professional Anual',
    description: 'Plano Professional Anual',
    priceId: 'price_1S3JqtJrnNh1FDmnAlSaVtR1', // Atendente Extra Anual como placeholder
    mode: 'subscription' as const,
    billing: 'annual' as const,
    amount: 202800, // R$ 2.028,00
  },
  enterprise_monthly: {
    name: 'Ticket Wise - Enterprise',
    description: 'Plano Enterprise Mensal',
    priceId: 'price_1S3KDPJrnNh1FDmnZl2MA8c8',
    mode: 'subscription' as const,
    billing: 'monthly' as const,
    amount: 29900, // R$ 299,00
  },
  enterprise_annual: {
    name: 'Ticket Wise - Enterprise Anual',
    description: 'Plano Enterprise Anual',
    priceId: 'price_1S3dS9JrnNh1FDmnFgdKcIvw', // Enterprise DESC como placeholder
    mode: 'subscription' as const,
    billing: 'annual' as const,
    amount: 304800, // R$ 3.048,00
  },
  
  // Pacotes de Tickets (Cross-sell products)
  ticket_mini: {
    name: 'Pacote Mini - 100 Tickets',
    description: 'Pacote adicional de 100 tickets',
    priceId: 'price_1S3JvrJrnNh1FDmn20FvR33B',
    mode: 'payment' as const,
    amount: 2500, // R$ 25,00 (atualizado conforme nova conta)
  },
  ticket_basic: {
    name: 'Pacote Basic - 250 Tickets',
    description: 'Pacote adicional de 250 tickets',
    priceId: 'price_1S3JwFJrnNh1FDmn2IQxSbY2',
    mode: 'payment' as const,
    amount: 3900, // R$ 39,00
  },
  ticket_medium: {
    name: 'Pacote Médio - 500 Tickets',
    description: 'Pacote adicional de 500 tickets',
    priceId: 'price_1S3JwXJrnNh1FDmnnECe0gvX',
    mode: 'payment' as const,
    amount: 5900, // R$ 59,00
  },
  ticket_plus: {
    name: 'Pacote Plus - 1000 Tickets',
    description: 'Pacote adicional de 1000 tickets',
    priceId: 'price_1S3KAVJrnNh1FDmnqe4LtCE8',
    mode: 'payment' as const,
    amount: 9900, // R$ 99,00
  },
  ticket_pro: {
    name: 'Pacote Pro - 2000 Tickets',
    description: 'Pacote adicional de 2000 tickets',
    priceId: 'price_1S3KAnJrnNh1FDmnUwBtgTDI',
    mode: 'payment' as const,
    amount: 17900, // R$ 179,00
  },
  ticket_ultra: {
    name: 'Pacote Ultra - 5000 Tickets',
    description: 'Pacote adicional de 5000 tickets',
    priceId: 'price_1S3KB9JrnNh1FDmnVlblCzuq',
    mode: 'payment' as const,
    amount: 39900, // R$ 399,00
  },
} as const;

export type ProductId = keyof typeof products;

// Função para obter produtos por categoria
export function getSubscriptionProducts() {
  return Object.entries(products).filter(([_, product]) => product.mode === 'subscription');
}

export function getTicketPackages() {
  return Object.entries(products).filter(([_, product]) => product.mode === 'payment');
}

export function getProductsByBilling(billing: 'monthly' | 'annual') {
  return Object.entries(products).filter(([_, product]) => 
    product.mode === 'subscription' && 'billing' in product && product.billing === billing
  );
}