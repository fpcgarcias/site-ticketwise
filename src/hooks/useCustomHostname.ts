import { useCallback, useEffect, useState } from 'react';
import { api, type CustomHostnameRow } from '../lib/api';

export interface CustomHostnameConfig {
  primary: CustomHostnameRow | null;
  cname_target: string;
  docs_url: string;
}

function needsPolling(row: CustomHostnameRow | null): boolean {
  if (!row) return false;
  return !(row.status === 'active' && row.ssl_status === 'active');
}

export function useCustomHostname() {
  const [config, setConfig] = useState<CustomHostnameConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setError(null);
      const res = await api.getCustomHostnameConfig();
      setConfig({
        primary: res.data.primary,
        cname_target: res.data.cname_target || 'app.ticketwise.com.br',
        docs_url: res.data.docs_url,
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erro ao carregar domínio personalizado');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const row = config?.primary ?? null;
    if (!needsPolling(row)) return undefined;
    const id = setInterval(() => {
      void load({ silent: true });
    }, 15_000);
    return () => clearInterval(id);
  }, [config?.primary, load]);

  const create = useCallback(async (hostname: string) => {
    await api.createCustomHostname(hostname);
    const full = await api.getCustomHostnameConfig();
    setConfig({
      primary: full.data.primary,
      cname_target: full.data.cname_target || 'app.ticketwise.com.br',
      docs_url: full.data.docs_url,
    });
  }, []);

  const refresh = useCallback(async () => {
    const row = config?.primary;
    if (!row?.id) return;
    const res = await api.refreshCustomHostname(row.id);
    setConfig((prev) => ({
      primary: res.data.primary,
      cname_target: res.data.cname_target,
      docs_url: prev?.docs_url || '',
    }));
  }, [config?.primary]);

  const switchToTxt = useCallback(async () => {
    const row = config?.primary;
    if (!row?.id) return;
    const res = await api.switchCustomHostnameToTxt(row.id);
    setConfig((prev) => ({
      primary: res.data.primary,
      cname_target: res.data.cname_target,
      docs_url: prev?.docs_url || '',
    }));
  }, [config?.primary]);

  const remove = useCallback(async () => {
    const row = config?.primary;
    if (!row?.id) return;
    await api.deleteCustomHostname(row.id);
    await load({ silent: true });
  }, [config?.primary, load]);

  return {
    primary: config?.primary ?? null,
    cnameTarget: config?.cname_target ?? 'app.ticketwise.com.br',
    docsUrl: config?.docs_url ?? '',
    loading,
    error,
    reload: () => load({ silent: true }),
    create,
    refresh,
    switchToTxt,
    remove,
  };
}
