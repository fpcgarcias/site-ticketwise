export const products = {
  // Planos de Assinatura
  basic_monthly: {
    name: 'Ticket Wise - Básico',
    description: 'Plano Básico Mensal',
    priceId: 'price_1RTspEBmq8hkk550t8WBJgWt',
    mode: 'subscription' as const,
    billing: 'monthly' as const,
    amount: 11900, // R$ 119,00
  },
  basic_annual: {
    name: 'Ticket Wise - Básico Anual',
    description: 'Plano Básico Anual',
    priceId: 'price_1RUrS7Bmq8hkk550ZO9ReSqk',
    mode: 'subscription' as const,
    billing: 'annual' as const,
    amount: 121200, // R$ 1.212,00
  },
  pro_monthly: {
    name: 'Ticket Wise - Professional',
    description: 'Plano Professional Mensal',
    priceId: 'price_1RTsprBmq8hkk550X7043mWK',
    mode: 'subscription' as const,
    billing: 'monthly' as const,
    amount: 19900, // R$ 199,00
  },
  pro_annual: {
    name: 'Ticket Wise - Professional Anual',
    description: 'Plano Professional Anual',
    priceId: 'price_1RUrViBmq8hkk550RE9GZ6i8', 
    mode: 'subscription' as const,
    billing: 'annual' as const,
    amount: 202800, // R$ 2.028,00
  },
  enterprise_monthly: {
    name: 'Ticket Wise - Enterprise',
    description: 'Plano Enterprise Mensal',
    priceId: 'price_1RTss8Bmq8hkk550JuRFlPwV',
    mode: 'subscription' as const,
    billing: 'monthly' as const,
    amount: 29900, // R$ 299,00
  },
  enterprise_annual: {
    name: 'Ticket Wise - Enterprise Anual',
    description: 'Plano Enterprise Anual',
    priceId: 'price_1RUrmJBmq8hkk5508ZqQWrwb', // Substitua pelo ID real
    mode: 'subscription' as const,
    billing: 'annual' as const,
    amount: 304800, // R$ 3.048,00
  },
  
  // Pacotes de Tickets (Cross-sell products)
  ticket_mini: {
    name: 'Pacote Mini - 100 Tickets',
    description: 'Pacote adicional de 100 tickets',
    priceId: 'price_1RUs38Bmq8hkk550YbYUwfvO',
    mode: 'payment' as const,
    amount: 2900,
  },
  ticket_basic: {
    name: 'Pacote Basic - 250 Tickets',
    description: 'Pacote adicional de 250 tickets',
    priceId: 'price_1RUs3jBmq8hkk550hQ70bcKv',
    mode: 'payment' as const,
    amount: 3900,
  },
  ticket_medium: {
    name: 'Pacote Médio - 500 Tickets',
    description: 'Pacote adicional de 500 tickets',
    priceId: 'price_1RUs48Bmq8hkk5500NI5HVcN',
    mode: 'payment' as const,
    amount: 5900,
  },
  ticket_plus: {
    name: 'Pacote Plus - 1000 Tickets',
    description: 'Pacote adicional de 1000 tickets',
    priceId: 'price_1RUs4nBmq8hkk550sDHzUa3l',
    mode: 'payment' as const,
    amount: 9900,
  },
  ticket_pro: {
    name: 'Pacote Pro - 2000 Tickets',
    description: 'Pacote adicional de 2000 tickets',
    priceId: 'price_1RUs62Bmq8hkk550VcgKWsrA',
    mode: 'payment' as const,
    amount: 17900,
  },
  ticket_ultra: {
    name: 'Pacote Ultra - 5000 Tickets',
    description: 'Pacote adicional de 5000 tickets',
    priceId: 'price_1RUs6hBmq8hkk550ZTBDHBbW',
    mode: 'payment' as const,
    amount: 39900,
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