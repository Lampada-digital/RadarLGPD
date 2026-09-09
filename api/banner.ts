/* =====================================================================
   Radar GRC — API do Banner de Cookies  (Vercel Serverless Function)
   ---------------------------------------------------------------------
   POST /api/banner   → o banner do site cliente envia consentimento + cookies
   GET  /api/banner?org=<chave>  → o painel Radar GRC busca o feed processado

   A API é AUTÔNOMA: classifica os cookies com o mesmo motor de IA do
   painel e devolve o mapeamento pronto (categorias, riscos, conformidade).
   Em produção, troque o armazenamento em memória por Vercel KV / banco.
   ===================================================================== */

type Categoria = "necessario" | "funcional" | "analitico" | "publicidade";

interface CookieClassificado {
  nome: string;
  categoria: Categoria;
  provedor: string;
  duracao: string;
  dias: number;
  terceiro: boolean;
  confianca: "alta" | "media";
}

interface Evento {
  id: string;
  ts: number;
  tipo: string;
  categorias: string[] | null;
  site: string;
}

interface OrgData {
  eventos: Evento[];
  cookies: Record<string, CookieClassificado>;
  ultimaAtualizacao: number;
}

/* armazenamento em memória da instância (demo) — persistir em Vercel KV em produção */
const DB = new Map<string, OrgData>();

/* mesmo motor de classificação da interface (mantido em sincronia) */
const REGRAS: { rx: RegExp; cat: Categoria; dias: number; duracao: string; terceiro: boolean; provedor: string }[] = [
  { rx: /^(_ga|_gid|_gat|_ga_|gcl_|__utm)/i, cat: "analitico", dias: 730, duracao: "24 meses", terceiro: true, provedor: "Google Analytics" },
  { rx: /^(_fbp|_fbc|fr$|datr|c_user|xs$|sb$)/i, cat: "publicidade", dias: 90, duracao: "3 meses", terceiro: true, provedor: "Meta (Facebook)" },
  { rx: /^(IDE|DSID|test_cookie|_gcl_au|NID|APISID|1P_JAR|ANID|CONSENT|SOCS)/i, cat: "publicidade", dias: 396, duracao: "13 meses", terceiro: true, provedor: "Google Ads / DoubleClick" },
  { rx: /^(_clck|_clsk|msclkid|MR|MUID)/i, cat: "analitico", dias: 365, duracao: "12 meses", terceiro: true, provedor: "Microsoft Clarity / Bing" },
  { rx: /^(_pin_unauth|_pinterest|_uetsid|_uetvid)/i, cat: "publicidade", dias: 390, duracao: "13 meses", terceiro: true, provedor: "Pinterest / Bing Ads" },
  { rx: /^(_tt_enable_cookie|_ttp|ttclid)/i, cat: "publicidade", dias: 390, duracao: "13 meses", terceiro: true, provedor: "TikTok Pixel" },
  { rx: /^(_hj|hotjar)/i, cat: "analitico", dias: 365, duracao: "12 meses", terceiro: true, provedor: "Hotjar" },
  { rx: /^(_cf_bm|__cf_bm|cf_clearance)/i, cat: "necessario", dias: 1, duracao: "30 minutos", terceiro: true, provedor: "Cloudflare" },
  { rx: /(SESSION|JSESSIONID|PHPSESSID|ASP\.NET_SessionId|laravel_session|connect\.sid)/i, cat: "necessario", dias: 0, duracao: "Sessão", terceiro: false, provedor: "Servidor de aplicação" },
  { rx: /(csrf|token|consent|cookieyes|lgpd|privacy)/i, cat: "necessario", dias: 365, duracao: "12 meses", terceiro: false, provedor: "Próprio site" },
  { rx: /(idioma|lang|theme|tema|pref|region|moeda)/i, cat: "funcional", dias: 365, duracao: "12 meses", terceiro: false, provedor: "Próprio site" },
  { rx: /(carrinho|cart|wishlist|checkout)/i, cat: "funcional", dias: 30, duracao: "30 dias", terceiro: false, provedor: "Próprio site" },
];

function classificar(nome: string): CookieClassificado {
  const regra = REGRAS.find((r) => r.rx.test(nome));
  const cat: Categoria = regra
    ? regra.cat
    : /(ad|track|pixel|market)/i.test(nome)
      ? "publicidade"
      : /(stat|analyt|visit)/i.test(nome)
        ? "analitico"
        : "funcional";
  return {
    nome,
    categoria: regra ? regra.cat : cat,
    provedor: regra?.provedor ?? "A revisar",
    duracao: regra?.duracao ?? "A revisar",
    dias: regra?.dias ?? 90,
    terceiro: regra?.terceiro ?? /(ad|track|pixel)/i.test(nome),
    confianca: regra ? "alta" : "media",
  };
}

function resumo(d: OrgData) {
  const cookies = Object.values(d.cookies);
  const porCategoria = { necessario: 0, funcional: 0, analitico: 0, publicidade: 0 };
  cookies.forEach((c) => porCategoria[c.categoria]++);
  const terceiros = cookies.filter((c) => c.terceiro).length;
  const acimaLimite = cookies.filter((c) => c.dias > 390 && c.categoria !== "necessario").length;
  const total = d.eventos.length;
  const aceites = d.eventos.filter((e) => e.tipo === "aceite_total" || e.tipo === "personalizado").length;
  return {
    totalEventos: total,
    totalCookies: cookies.length,
    porCategoria,
    terceiros,
    acimaLimite,
    taxaAceite: total ? Math.round((aceites / total) * 100) : 0,
    conformidade: acimaLimite > 0 ? "ajustes necessários" : terceiros > 4 ? "revisar terceiros" : "conforme",
  };
}

/* eslint-disable @typescript-eslint/no-explicit-any */
export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, X-Org-Key");
  if (req.method === "OPTIONS") return res.status(204).end();

  /* -------- GET: painel busca o feed processado -------- */
  if (req.method === "GET") {
    const org = String(req.query?.org ?? "").trim();
    if (!org) return res.status(400).json({ ok: false, erro: "Parâmetro 'org' obrigatório." });
    const d = DB.get(org) ?? { eventos: [], cookies: {}, ultimaAtualizacao: Date.now() };
    return res.status(200).json({ ok: true, org, eventos: d.eventos.slice(-200), cookies: Object.values(d.cookies), resumo: resumo(d) });
  }

  /* -------- POST: banner do site cliente envia dados -------- */
  if (req.method === "POST") {
    const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : req.body ?? {};
    const org = String(req.headers?.["x-org-key"] ?? body.org ?? "").trim();
    if (!org) return res.status(401).json({ ok: false, erro: "Chave da organização ausente (X-Org-Key)." });

    const d = DB.get(org) ?? { eventos: [], cookies: {}, ultimaAtualizacao: Date.now() };

    /* registra o evento de consentimento */
    if (body.evento?.id) {
      if (!d.eventos.some((e) => e.id === body.evento.id)) {
        d.eventos.push({ id: body.evento.id, ts: body.evento.ts ?? Date.now(), tipo: body.evento.tipo, categorias: body.evento.categorias ?? null, site: body.site ?? "" });
        d.eventos = d.eventos.slice(-500);
      }
    }

    /* classifica cada cookie recebido (IA) e atualiza o inventário */
    const novos: CookieClassificado[] = [];
    (body.cookies ?? []).forEach((nome: string) => {
      const limpo = String(nome).trim();
      if (!limpo) return;
      if (!d.cookies[limpo]) {
        const c = classificar(limpo);
        d.cookies[limpo] = c;
        novos.push(c);
      }
    });

    d.ultimaAtualizacao = Date.now();
    DB.set(org, d);

    return res.status(200).json({ ok: true, org, novosClassificados: novos, resumo: resumo(d) });
  }

  return res.status(405).json({ ok: false, erro: "Método não suportado." });
}
