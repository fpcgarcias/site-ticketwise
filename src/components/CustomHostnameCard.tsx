import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  CheckCircle,
  Copy,
  Globe,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useCustomHostname } from '../hooks/useCustomHostname';

function copyText(text: string) {
  void navigator.clipboard.writeText(text);
}

function normalizeFqdn(input: string) {
  return input.trim().toLowerCase().replace(/\.$/, '');
}

function isValidHostname(hostname: string): boolean {
  if (!hostname || hostname.length > 253) return false;
  const labels = hostname.split('.');
  if (labels.length < 2) return false;
  const labelRe = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/;
  return labels.every((label) => label.length > 0 && label.length <= 63 && labelRe.test(label));
}

const CustomHostnameCard: React.FC = () => {
  const {
    primary,
    cnameTarget,
    docsUrl,
    loading,
    error,
    create,
    refresh,
    switchToTxt,
    remove,
  } = useCustomHostname();

  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const fullyActive = primary?.status === 'active' && primary?.ssl_status === 'active';
  const timedOut = primary?.ssl_status === 'validation_timed_out';
  const awaiting = primary && !fullyActive;

  const showSwitchToTxt = useMemo(() => {
    if (!primary || primary.ssl_method !== 'http') return false;
    if (timedOut) return true;
    if (!awaiting) return false;
    const created = new Date(primary.created_at).getTime();
    return Date.now() - created > 10 * 60 * 1000;
  }, [primary, awaiting, timedOut]);

  const handleCreate = async () => {
    const host = normalizeFqdn(input);
    setLocalError(null);
    if (!isValidHostname(host)) {
      setLocalError('Informe um hostname válido (ex.: suporte.suaempresa.com.br)');
      return;
    }
    setBusy(true);
    try {
      await create(host);
      setInput('');
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao criar hostname');
    } finally {
      setBusy(false);
    }
  };

  const handleRefresh = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      await refresh();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao atualizar');
    } finally {
      setBusy(false);
    }
  };

  const handleSwitchTxt = async () => {
    setBusy(true);
    setLocalError(null);
    try {
      await switchToTxt();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao trocar validação');
    } finally {
      setBusy(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remover o hostname personalizado? O certificado na Cloudflare será excluído.')) {
      return;
    }
    setBusy(true);
    setLocalError(null);
    try {
      await remove();
    } catch (e) {
      setLocalError(e instanceof Error ? e.message : 'Erro ao remover');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-600">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        Carregando configuração de domínio…
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-start gap-3 mb-4">
          <Globe className="h-8 w-8 text-purple-600 shrink-0" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Domínio personalizado</h3>
            <p className="text-sm text-gray-600 mt-1">
              Use um subdomínio do seu site (ex.:{' '}
              <code className="text-xs bg-gray-100 px-1 rounded">suporte.suaempresa.com.br</code>)
              apontando para o Ticket Wise. Após criar, adicione os registros DNS indicados abaixo.
            </p>
          </div>
        </div>

        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{localError || error}</span>
          </div>
        )}

        {!primary && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Hostname completo (FQDN)</label>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="suporte.suaempresa.com.br"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500"
                disabled={busy}
              />
            </div>
            <button
              type="button"
              onClick={() => void handleCreate()}
              disabled={busy}
              className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Criar hostname
            </button>
          </div>
        )}

        {primary && fullyActive && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Hostname ativo</span>
            </div>
            <p className="text-gray-800">
              Seu endereço: <strong className="font-mono">{primary.hostname}</strong>
            </p>
            {primary.activated_at && (
              <p className="text-sm text-gray-500">
                Ativado em:{' '}
                {new Date(primary.activated_at).toLocaleString('pt-BR', {
                  dateStyle: 'short',
                  timeStyle: 'short',
                })}
              </p>
            )}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                onClick={() => void handleRemove()}
                disabled={busy}
                className="inline-flex items-center px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remover / trocar hostname
              </button>
            </div>
          </div>
        )}

        {primary && awaiting && (
          <div className="space-y-6">
            {timedOut && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-900 text-sm">
                A validação do certificado expirou (timeout). Confira o DNS abaixo ou use validação por TXT.
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-gray-600">
                Status: <strong>{primary.status}</strong> · Certificado:{' '}
                <strong>{primary.ssl_status}</strong>
              </span>
              <button
                type="button"
                onClick={() => void handleRefresh()}
                disabled={busy}
                className="inline-flex items-center text-sm px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                <RefreshCw className={`h-4 w-4 mr-1 ${busy ? 'animate-spin' : ''}`} />
                Revalidar agora
              </button>
            </div>

            {primary.ssl_method === 'http' && (
              <div className="p-4 bg-blue-50 border border-blue-100 rounded-md text-sm text-blue-900">
                <p className="font-medium mb-1">CNAME (roteamento)</p>
                <p>
                  Crie um registro <strong>CNAME</strong> de{' '}
                  <code className="bg-white px-1 rounded">{primary.hostname}</code> para{' '}
                  <code className="bg-white px-1 rounded">{cnameTarget}</code>
                  . A validação HTTP do certificado costuma completar automaticamente após o DNS propagar.
                </p>
              </div>
            )}

            {primary.ownership_verification?.name && (
              <div>
                <p className="text-sm font-medium text-gray-800 mb-2">TXT — comprovação de propriedade</p>
                <div className="grid gap-2 text-sm font-mono bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="flex justify-between gap-2 items-start">
                    <span className="break-all">{primary.ownership_verification.name}</span>
                    <button
                      type="button"
                      className="shrink-0 text-purple-600"
                      onClick={() => copyText(primary.ownership_verification!.name!)}
                      title="Copiar nome"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="flex justify-between gap-2 items-start">
                    <span className="break-all">{primary.ownership_verification.value}</span>
                    <button
                      type="button"
                      className="shrink-0 text-purple-600"
                      onClick={() => copyText(primary.ownership_verification!.value || '')}
                      title="Copiar valor"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {Array.isArray(primary.validation_records) &&
              primary.validation_records.some((r) => r.txt_name && r.txt_value) && (
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-2">TXT — validação do certificado</p>
                  <div className="space-y-3">
                    {primary.validation_records
                      .filter((r) => r.txt_name && r.txt_value)
                      .map((r, i) => (
                        <div
                          key={`${String(r.txt_name)}-${i}`}
                          className="grid gap-2 text-sm font-mono bg-gray-50 p-3 rounded-md border border-gray-200"
                        >
                          <div className="flex justify-between gap-2">
                            <span className="break-all">{r.txt_name}</span>
                            <button type="button" onClick={() => copyText(r.txt_name!)}>
                              <Copy className="h-4 w-4 text-purple-600" />
                            </button>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span className="break-all">{r.txt_value}</span>
                            <button type="button" onClick={() => copyText(r.txt_value!)}>
                              <Copy className="h-4 w-4 text-purple-600" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

            <div className="flex flex-wrap gap-3">
              {timedOut && (
                <button
                  type="button"
                  onClick={() => void handleSwitchTxt()}
                  disabled={busy}
                  className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700"
                >
                  Tentar validação por TXT
                </button>
              )}
              {showSwitchToTxt && primary.ssl_method === 'http' && !timedOut && (
                <button
                  type="button"
                  onClick={() => void handleSwitchTxt()}
                  disabled={busy}
                  className="inline-flex items-center px-4 py-2 border border-purple-300 text-purple-800 rounded-md hover:bg-purple-50"
                >
                  Travou? Trocar para validação TXT
                </button>
              )}
            </div>

            {docsUrl && (
              <a
                href={docsUrl}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-purple-600 hover:underline"
              >
                Documentação Cloudflare (validação TXT)
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomHostnameCard;
