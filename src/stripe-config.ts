export const products = {
  basic: {
    name: 'Ticket Wise - Básico',
    description: 'Ticket Wise - Plano Básico Mensal',
    priceId: 'price_1RTspEBmq8hkk550t8WBJgWt',
    mode: 'subscription' as const,
  },
  pro: {
    name: 'Ticket Wise - Professional',
    description: 'Ticket Wise - Plano Professional Mensal',
    priceId: 'price_1RTsprBmq8hkk550X7043mWK',
    mode: 'subscription' as const,
  },
  enterprise: {
    name: 'Ticket Wise - Enterprise',
    description: 'Ticket Wise - Plano Enterprise Mensal',
    priceId: 'price_1RTss8Bmq8hkk550JuRFlPwV',
    mode: 'subscription' as const,
  },
} as const;

export type ProductId = keyof typeof products;