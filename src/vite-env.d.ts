/// <reference types="vite/client" />

// Interfaces para dados do Stripe
interface StripeCustomerData {
  name?: string;
  email?: string;
  cnpj?: string;
  razaoSocial?: string;
  employee_count?: string;
  domain?: string;
  additional_agents?: number;
  ticket_package?: string;
  additionalProducts?: string[];
  couponCode?: string;
}

interface StripeProduct {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, string>;
  default_price: {
    id: string;
    unit_amount: number | null;
    currency: string;
    recurring: {
      interval: string;
      interval_count: number;
    } | null;
  } | null;
}

interface StripePrice {
  id: string;
  product_id: string;
  unit_amount: number | null;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
  metadata: Record<string, string>;
  nickname: string | null;
  product: {
    id: string;
    name: string;
    description: string | null;
    metadata: Record<string, string>;
  } | null;
}
