import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';

interface Invoice {
  id: string;
  checkout_session_id: string | null;
  payment_intent_id: string | null;
  stripe_invoice_id?: string | null;
  status: string;
  stripe_status?: string | null;
  amount_total: number;
  amount_subtotal: number;
  currency: string;
  paid_at?: string | null;
  due_date?: string | null;
  period_start?: number | null;
  period_end?: number | null;
  attempt_count?: number | null;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  created_at: string;
  updated_at: string;
}

interface UseInvoicesReturn {
  invoices: Invoice[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export const useInvoices = (): UseInvoicesReturn => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchInvoices = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const data = await api.getInvoices();
      setInvoices(data.invoices || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [user]);

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices,
  };
};
