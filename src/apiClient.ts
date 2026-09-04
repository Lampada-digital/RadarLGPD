/* Cliente da API do banner de cookies (Radar GRC). */

export interface ResumoApi {
  totalEventos: number;
  totalCookies: number;
  porCategoria: { necessario: number; funcional: number; analitico: number; publicidade: number };
  terceiros: number;
  acimaLimite: number;
  taxaAceite: number;
  conformidade: string;
}

export interface CookieApi {
  nome: string;
  categoria: "necessario" | "funcional" | "analitico" | "publicidade";
  provedor: string;
  duracao: string;
  dias: number;
  terceiro: boolean;
  confianca: "alta" | "media";
}

export interface FeedApi {
  ok: boolean;
  org: string;
  eventos: { id: string; ts: number; tipo: string; categorias: string[] | null; site: string }[];
  cookies: CookieApi[];
  resumo: ResumoApi;
}

/** Testa a conectividade com a API do banner. */
export async function testarApi(apiUrl: string, orgKey: string): Promise<{ ok: boolean; msg: string; latencia?: number }> {
  const t0 = performance.now();
  try {
    const r = await fetch(`${apiUrl}?org=${encodeURIComponent(orgKey)}`, { method: "GET" });
    const ms = Math.round(performance.now() - t0);
    if (r.status === 404) return { ok: false, msg: "Endpoint não encontrado (404). Publique em um host com funções serverless (ex.: Vercel)." };
    const j = (await r.json()) as { ok: boolean };
    return j.ok
      ? { ok: true, msg: `Conectado · resposta em ${ms}ms`, latencia: ms }
      : { ok: false, msg: "Endpoint respondeu, mas com erro de contrato." };
  } catch {
    return { ok: false, msg: "Sem resposta. A API requer um host com funções serverless (Vercel). No GitHub Pages use a sincronização local." };
  }
}

/** Busca o feed processado pela IA na API. */
export async function buscarFeed(apiUrl: string, orgKey: string): Promise<FeedApi | null> {
  try {
    const r = await fetch(`${apiUrl}?org=${encodeURIComponent(orgKey)}`, { method: "GET" });
    if (!r.ok) return null;
    return (await r.json()) as FeedApi;
  } catch {
    return null;
  }
}
