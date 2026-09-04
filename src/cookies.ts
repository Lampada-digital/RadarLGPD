/* =====================================================================
   Domínio de Cookies & Consentimento (ePrivacy + GDPR + LGPD)
   - Gerador de banner standalone (JS puro, instalável em qualquer site)
   - Ingestão de eventos de consentimento vindos do site (localStorage + postMessage)
   - IA: classificação de cookies, diagnóstico de conformidade e política pronta
   ===================================================================== */

import { Pdf, A4W, baixarPdf, gerarBytesPdf } from "./pdf";
import type { Cor } from "./pdf";

/* ---------------- tipos ---------------- */

export type CategoriaCookie = "necessario" | "funcional" | "analitico" | "publicidade";

export const CATEGORIAS_COOKIE: { id: CategoriaCookie; label: string; curta: string; desc: string; cor: string }[] = [
  { id: "necessario", label: "Estritamente necessários", curta: "Necessários", desc: "Essenciais para o site funcionar (sessão, segurança, carrinho). Não exigem consentimento.", cor: "#2e6b54" },
  { id: "funcional", label: "Funcionais / Preferências", curta: "Funcionais", desc: "Lembram escolhas do usuário (idioma, região, tema).", cor: "#3a6ea5" },
  { id: "analitico", label: "Analíticos / Estatística", curta: "Analíticos", desc: "Medem audiência e comportamento de forma agregada (GA4, Clarity…).", cor: "#c98a1f" },
  { id: "publicidade", label: "Publicidade / Marketing", curta: "Publicidade", desc: "Rastreamento para anúncios personalizados (Meta Pixel, Google Ads…).", cor: "#bd4f26" },
];

export interface CookieItem {
  id: string;
  nome: string;
  provedor: string;
  categoria: CategoriaCookie;
  duracao: string;
  dias: number;
  origem: "proprio" | "terceiro";
  antesConsent: boolean;
  descricao: string;
}

export interface CookieEvento {
  id: string;
  ts: number;
  tipo: "aceite_total" | "recusa_total" | "personalizado" | "alteracao";
  categorias: CategoriaCookie[] | null;
  origem: "simulador" | "site";
}

export interface BannerConfig {
  siteNome: string;
  siteUrl: string;
  dpoEmail: string;
  cor: string;
  posicao: "inferior" | "superior";
  atrasoMs: number;
  categorias: CategoriaCookie[];
}

/* chaves compartilhadas entre banner ↔ painel (mesmo navegador) */
export const CHAVE_EVENTOS = "radargrc:banner:events";
export const CHAVE_CONSENT = "radargrc:banner:consent";

export const SEED_BANNER: BannerConfig = {
  siteNome: "minhaloja.com.br",
  siteUrl: "https://minhaloja.com.br",
  dpoEmail: "dpo@minhaloja.com.br",
  cor: "#2e6b54",
  posicao: "inferior",
  atrasoMs: 800,
  categorias: ["necessario", "funcional", "analitico", "publicidade"],
};

const atras = (min: number) => Date.now() - min * 60000;

export const SEED_COOKIES: CookieItem[] = [
  { id: "ck1", nome: "PHPSESSID", provedor: "minhaloja.com.br", categoria: "necessario", duracao: "Sessão", dias: 0, origem: "proprio", antesConsent: true, descricao: "Identificador de sessão do servidor." },
  { id: "ck2", nome: "rc_consent_v1", provedor: "minhaloja.com.br", categoria: "necessario", duracao: "12 meses", dias: 365, origem: "proprio", antesConsent: true, descricao: "Armazena as escolhas de consentimento do visitante." },
  { id: "ck3", nome: "_ga", provedor: "Google Analytics", categoria: "analitico", duracao: "24 meses", dias: 730, origem: "terceiro", antesConsent: false, descricao: "Distinção de usuários únicos (GA4)." },
  { id: "ck4", nome: "_ga_XYZ123", provedor: "Google Analytics", categoria: "analitico", duracao: "24 meses", dias: 730, origem: "terceiro", antesConsent: false, descricao: "Estado da sessão do GA4." },
  { id: "ck5", nome: "_fbp", provedor: "Meta (Facebook)", categoria: "publicidade", duracao: "3 meses", dias: 90, origem: "terceiro", antesConsent: false, descricao: "Rastreamento do Meta Pixel para campanhas." },
  { id: "ck6", nome: "IDE", provedor: "Google DoubleClick", categoria: "publicidade", duracao: "13 meses", dias: 396, origem: "terceiro", antesConsent: false, descricao: "Medição e direcionamento de anúncios." },
  { id: "ck7", nome: "idioma_pref", provedor: "minhaloja.com.br", categoria: "funcional", duracao: "12 meses", dias: 365, origem: "proprio", antesConsent: false, descricao: "Idioma escolhido pelo visitante." },
  { id: "ck8", nome: "carrinho_abandonado", provedor: "minhaloja.com.br", categoria: "funcional", duracao: "30 dias", dias: 30, origem: "proprio", antesConsent: false, descricao: "Itens mantidos no carrinho entre visitas." },
];

export const SEED_EVENTOS: CookieEvento[] = [
  { id: "e1", ts: atras(52), tipo: "aceite_total", categorias: null, origem: "site" },
  { id: "e2", ts: atras(47), tipo: "personalizado", categorias: ["necessario", "analitico"], origem: "site" },
  { id: "e3", ts: atras(41), tipo: "recusa_total", categorias: null, origem: "site" },
  { id: "e4", ts: atras(33), tipo: "aceite_total", categorias: null, origem: "simulador" },
  { id: "e5", ts: atras(26), tipo: "personalizado", categorias: ["necessario", "funcional", "analitico"], origem: "site" },
  { id: "e6", ts: atras(19), tipo: "recusa_total", categorias: null, origem: "site" },
  { id: "e7", ts: atras(11), tipo: "aceite_total", categorias: null, origem: "site" },
  { id: "e8", ts: atras(4), tipo: "alteracao", categorias: ["necessario", "funcional"], origem: "simulador" },
];

/* ---------------- IA: classificação de cookies ---------------- */

const RX_CLASSIF: { rx: RegExp; cat: CategoriaCookie; dias: number; duracao: string; terceiro: boolean; provedor: string }[] = [
  { rx: /^(_ga|_gid|_gat|_ga_|gcl_|__utma|__utmb|__utmz)/i, cat: "analitico", dias: 730, duracao: "24 meses", terceiro: true, provedor: "Google Analytics" },
  { rx: /^(_fbp|_fbc|fr$|datr|c_user|xs$|sb$)/i, cat: "publicidade", dias: 90, duracao: "3 meses", terceiro: true, provedor: "Meta (Facebook)" },
  { rx: /^(IDE|DSID|test_cookie|_gcl_au|NID|APISID|SAPISID|1P_JAR|ANID|CONSENT|SOCS)/i, cat: "publicidade", dias: 396, duracao: "13 meses", terceiro: true, provedor: "Google Ads / DoubleClick" },
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

export function classificarCookies(nomes: string[]): CookieItem[] {
  return nomes
    .map((n) => n.trim().split(/[=;\s]/)[0])
    .filter(Boolean)
    .map((nome, i) => {
      const hit = RX_CLASSIF.find((r) => r.rx.test(nome));
      const cat = hit?.cat ?? (/(ad|track|pixel|market)/i.test(nome) ? "publicidade" : /(stat|analyt|visit)/i.test(nome) ? "analitico" : "funcional");
      return {
        id: `ia-${Date.now()}-${i}`,
        nome,
        provedor: hit?.provedor ?? "A revisar",
        categoria: cat,
        duracao: hit?.duracao ?? "A revisar",
        dias: hit?.dias ?? 90,
        origem: hit?.terceiro ? ("terceiro" as const) : ("proprio" as const),
        antesConsent: cat === "necessario",
        descricao: `Classificado automaticamente pela IA (confiança ${hit ? "alta" : "média"}).`,
      };
    });
}

/* ---------------- IA: diagnóstico de conformidade ---------------- */

export interface DiagnosticoCookies {
  score: number;
  nivel: string;
  cor: string;
  total: number;
  taxas: { aceite: number; recusa: number; personalizado: number };
  porCategoria: { cat: CategoriaCookie; aceite: number; total: number }[];
  problemas: { sev: "alta" | "media" | "baixa"; texto: string; ref: string }[];
  recomendacoes: string[];
}

export function analisarCookies(inv: CookieItem[], eventos: CookieEvento[]): DiagnosticoCookies {
  const dec = eventos.filter((e) => e.tipo === "aceite_total");
  const rec = eventos.filter((e) => e.tipo === "recusa_total");
  const per = eventos.filter((e) => e.tipo === "personalizado" || e.tipo === "alteracao");
  const total = Math.max(1, eventos.length);
  const taxas = {
    aceite: Math.round((dec.length / total) * 100),
    recusa: Math.round((rec.length / total) * 100),
    personalizado: Math.round((per.length / total) * 100),
  };

  const porCategoria = CATEGORIAS_COOKIE.map((c) => {
    const relevantes = eventos.filter((e) => e.tipo !== "recusa_total");
    const aceite = relevantes.filter((e) => e.tipo === "aceite_total" || (e.categorias ?? []).includes(c.id)).length;
    return { cat: c.id, aceite, total: relevantes.length };
  });

  const problemas: DiagnosticoCookies["problemas"] = [];
  const longos = inv.filter((c) => c.categoria !== "necessario" && c.dias > 390);
  if (longos.length)
    problemas.push({ sev: "alta", texto: `${longos.length} cookie(s) com duração acima de 13 meses (${longos.map((c) => c.nome).slice(0, 3).join(", ")}). Chrome e Firefox já limitam a 400 dias; a CNIL recomenda no máximo 13 meses.`, ref: "CNIL · Art. 5(1)(e) GDPR" });
  const preConsent = inv.filter((c) => c.antesConsent && c.categoria !== "necessario");
  if (preConsent.length)
    problemas.push({ sev: "alta", texto: `${preConsent.length} cookie(s) não essenciais disparados antes do consentimento (${preConsent.map((c) => c.nome).join(", ")}). Implemente bloqueio prévio na CMP.`, ref: "ePrivacy Art. 5(3) · EDPB 05/2020" });
  const terceiros = inv.filter((c) => c.origem === "terceiro");
  if (terceiros.length > 4)
    problemas.push({ sev: "media", texto: `${terceiros.length} cookies de terceiros ativos. Exija DPAs (Art. 28) e realize TIA dos fornecedores fora do EEE.`, ref: "GDPR Art. 28 · Cap. V" });
  const mkt = inv.filter((c) => c.categoria === "publicidade").length;
  if (mkt > 0 && taxas.recusa > 40)
    problemas.push({ sev: "media", texto: `Taxa de recusa alta (${taxas.recusa}%) com ${mkt} cookie(s) de publicidade: o banner pode estar gerando fadiga de consentimento. Revise categorias e finalidade.`, ref: "EDPB · minimização" });
  if (inv.length === 0) problemas.push({ sev: "baixa", texto: "Inventário vazio — execute a varredura/classificação com IA para mapear os cookies do site.", ref: "Art. 30 GDPR · Art. 37 LGPD" });
  if (problemas.length === 0)
    problemas.push({ sev: "baixa", texto: "Nenhum problema crítico detectado. Mantenha a revalidação de consentimento a cada 6–13 meses.", ref: "Boas práticas CNIL/EDPB" });

  const penalidade = problemas.reduce((acc, p) => acc + (p.sev === "alta" ? 26 : p.sev === "media" ? 14 : 4), 0);
  const score = Math.max(8, 100 - penalidade - Math.round(taxas.recusa / 4));
  const nivel = score >= 85 ? "Conforme" : score >= 65 ? "Ajustes pontuais" : score >= 45 ? "Atenção necessária" : "Não conforme";
  const cor = score >= 85 ? "var(--color-moss)" : score >= 65 ? "#c98a1f" : "var(--color-rust)";

  const recomendacoes = [
    taxas.personalizado > 25
      ? "Alta taxa de personalização: mantenha a granularidade por categoria e o botão 'salvar escolhas' sempre visível."
      : "Exiba os 3 botões (aceitar, recusar, personalizar) com o mesmo destaque — paridade exigida pela CNIL.",
    "Registre evidência de cada consentimento (timestamp, versão do banner e escolhas) para demonstrar accountability.",
    "Revalide consentimentos antigos a cada 6–13 meses; a retirada deve ser tão fácil quanto a concessão.",
    longos.length ? `Reduza a duração de ${longos.map((c) => c.nome).slice(0, 2).join(" e ")} para até 13 meses.` : "Documente a finalidade e a duração de cada cookie na política publicada.",
    terceiros.length ? "Anexe a lista de terceiros e links para as políticas de privacidade de cada fornecedor." : "Adicione ao inventário qualquer novo tracker antes de publicá-lo.",
  ];

  return { score, nivel, cor, total: eventos.length, taxas, porCategoria, problemas, recomendacoes };
}

/* ---------------- Gerador do banner (script standalone) ---------------- */

export function gerarSnippet(cfg: BannerConfig): string {
  const cats = cfg.categorias
    .map((id) => {
      const c = CATEGORIAS_COOKIE.find((x) => x.id === id)!;
      return `{id:"${id}",label:"${c.label}",desc:"${c.desc}",fixo:${id === "necessario"}}`;
    })
    .join(",");

  // Observação: o código gerado usa apenas concatenação (sem crase/`${}`) para rodar em qualquer navegador.
  return `/* Radar GRC — Banner de Cookies v1 · gerado automaticamente. Instale antes de </body>. */
(function () {
  function status(t) { try { var s = document.getElementById("rc-status"); if (s) s.textContent = t; } catch (e) {} }
  try {
  if (window.RadarCookies) return;
  var CFG = { site: "${cfg.siteNome}", cor: "${cfg.cor}", pos: "${cfg.posicao}", atraso: ${cfg.atrasoMs}, cats: [${cats}] };
  var K_CONSENT = "${CHAVE_CONSENT}", K_EVENTS = "${CHAVE_EVENTOS}";
  function ler(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function gravar(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function evento(tipo, cats) {
    var ev = { id: "ev-" + Date.now() + "-" + Math.floor(Math.random() * 1e5), ts: Date.now(), tipo: tipo, categorias: cats || null, origem: "site" };
    var l = ler(K_EVENTS) || []; l.push(ev); gravar(K_EVENTS, l.slice(-300));
    try { window.parent.postMessage({ radar: "cookie-event", evento: ev }, "*"); } catch (e) {}
    return ev;
  }
  function css() {
    return ".rc-wrap{position:fixed;left:0;right:0;z-index:99999;font-family:system-ui,-apple-system,'Segoe UI',sans-serif;${cfg.posicao === "superior" ? "top:0" : "bottom:0"}}" +
      ".rc-box{max-width:760px;margin:14px auto;background:#13251e;color:#f2efe4;border-radius:12px;box-shadow:0 18px 44px rgba(0,0,0,.35);padding:18px 20px;border:1px solid rgba(201,233,79,.25)}" +
      ".rc-tit{font-size:15px;font-weight:800;margin:0 0 6px}" +
      ".rc-txt{font-size:12.5px;line-height:1.55;color:#cfd8cf;margin:0 0 14px}" +
      ".rc-btns{display:flex;gap:8px;flex-wrap:wrap}" +
      ".rc-b{border:0;border-radius:8px;padding:9px 14px;font-size:12.5px;font-weight:700;cursor:pointer;transition:transform .12s ease}" +
      ".rc-b:hover{transform:translateY(-1px)}" +
      ".rc-b1{background:${cfg.cor};color:#fff}" +
      ".rc-b2{background:transparent;color:#f2efe4;border:1px solid rgba(242,239,228,.35)}" +
      ".rc-b3{background:rgba(201,233,79,.15);color:#c9e94f;border:1px solid rgba(201,233,79,.4)}" +
      ".rc-cats{margin:10px 0 14px;display:none;gap:8px;flex-direction:column}" +
      ".rc-cats.rc-open{display:flex}" +
      ".rc-cat{display:flex;gap:10px;align-items:flex-start;background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:8px;padding:9px 11px}" +
      ".rc-cat b{display:block;font-size:12.5px}" +
      ".rc-cat span{display:block;font-size:11px;color:#aab8aa;line-height:1.45}" +
      ".rc-cat input{margin-top:3px;accent-color:${cfg.cor}}" +
      ".rc-link{color:#c9e94f;text-decoration:none;font-weight:700}";
  }
  function montar() {
    var w = document.createElement("div"); w.className = "rc-wrap"; w.id = "rc-banner";
    var st = document.createElement("style"); st.textContent = css(); document.head.appendChild(st);
    var catsHtml = "";
    CFG.cats.forEach(function (c) {
      var fixo = c.fixo ? " checked disabled" : "";
      var badge = c.fixo ? " · sempre ativo" : "";
      catsHtml += '<label class="rc-cat"><input type="checkbox" data-cat="' + c.id + '"' + fixo + '><div><b>' + c.label + badge + "</b><span>" + c.desc + "</span></div></label>";
    });
    w.innerHTML = '<div class="rc-box">' +
      '<p class="rc-tit">Cookies em ' + CFG.site + '</p>' +
      '<p class="rc-txt">Usamos cookies para operar o site, medir audiência e personalizar conteúdo. Você decide quais categorias aceita — <a class="rc-link" href="#politica-cookies">Política de Cookies</a>.</p>' +
      '<div class="rc-cats" id="rc-cats">' + catsHtml + '</div>' +
      '<div class="rc-btns">' +
      '<button class="rc-b rc-b1" id="rc-all">Aceitar todos</button>' +
      '<button class="rc-b rc-b2" id="rc-none">Recusar não essenciais</button>' +
      '<button class="rc-b rc-b3" id="rc-cfg">Personalizar</button>' +
      '</div></div>';
    document.body.appendChild(w);
    var painel = document.getElementById("rc-cats");
    function escolhas() {
      var out = ["necessario"];
      document.querySelectorAll("#rc-cats input").forEach(function (i) { if (i.checked && i.dataset.cat !== "necessario") out.push(i.dataset.cat); });
      return out;
    }
    function fechar() { var el = document.getElementById("rc-banner"); if (el) el.remove(); launcher(); }
    function salvar(tipo, cats) {
      gravar(K_CONSENT, { v: 1, ts: Date.now(), site: CFG.site, tipo: tipo, categorias: cats });
      evento(tipo, tipo === "personalizado" || tipo === "alteracao" ? cats : null);
      fechar();
    }
    document.getElementById("rc-all").onclick = function () { salvar("aceite_total", CFG.cats.map(function (c) { return c.id; })); };
    document.getElementById("rc-none").onclick = function () { salvar("recusa_total", ["necessario"]); };
    document.getElementById("rc-cfg").onclick = function () {
      if (painel.classList.contains("rc-open")) salvar("personalizado", escolhas());
      else painel.classList.add("rc-open");
    };
  }
  function mostrar() { if (!document.getElementById("rc-banner")) montar(); }
  function launcher() {
    if (document.getElementById("rc-launcher")) return;
    var b = document.createElement("button"); b.id = "rc-launcher"; b.type = "button";
    b.innerHTML = "\\ud83c\\udf6a Prefer\\u00eancias de cookies";
    b.style.cssText = "position:fixed;left:14px;bottom:14px;z-index:99998;border:0;border-radius:999px;background:#13251e;color:#f2efe4;font:700 11.5px system-ui,-apple-system,sans-serif;padding:9px 14px;cursor:pointer;box-shadow:0 8px 20px rgba(0,0,0,.32);border:1px solid rgba(201,233,79,.35);transition:background .15s ease";
    b.onmouseover = function () { b.style.background = "#1d3a2f"; };
    b.onmouseout = function () { b.style.background = "#13251e"; };
    b.onclick = mostrar;
    document.body.appendChild(b);
  }
  var consent = ler(K_CONSENT);
  if (!consent) setTimeout(mostrar, Math.max(0, CFG.atraso));
  else setTimeout(launcher, 400);
  window.RadarCookies = {
    getConsent: function () { return ler(K_CONSENT); },
    openPreferences: mostrar,
    reset: function () { try { localStorage.removeItem(K_CONSENT); } catch (e) {} mostrar(); }
  };
  status(consent ? "\\u2713 motor do banner ativo \\u00b7 consentimento registrado" : "\\u2713 motor do banner ativo \\u00b7 aguardando consentimento");
  } catch (err) { status("\\u2717 banner n\\u00e3o executou: " + (err && err.message ? err.message : "erro desconhecido")); }
})();
`;
}

/* HTML do site simulado para o preview ao vivo */
export function htmlSiteSimulado(cfg: BannerConfig): string {
  const snippet = gerarSnippet(cfg);
  return (
    "<!DOCTYPE html><html lang='pt-BR'><head><meta charset='utf-8'><meta name='viewport' content='width=device-width,initial-scale=1'><title>" +
    cfg.siteNome +
    "</title><style>" +
    "*{box-sizing:border-box;margin:0}body{font-family:system-ui,-apple-system,'Segoe UI',sans-serif;background:#f4f1e8;color:#1d2b24}" +
    ".hd{background:#13251e;color:#f2efe4;display:flex;align-items:center;justify-content:space-between;padding:12px 18px}" +
    ".hd b{font-size:15px}.hd span{font-size:11px;opacity:.65}" +
    ".hero{padding:26px 18px 18px}.hero h1{font-size:21px;line-height:1.15}.hero p{font-size:12px;color:#5c6b61;margin-top:6px}" +
    ".grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:0 18px 26px}" +
    ".card{background:#fff;border:1px solid #ddd6bf;border-radius:10px;overflow:hidden}" +
    ".img{height:64px;background:linear-gradient(135deg,#2e6b54,#c98a1f)}" +
    ".card div{padding:8px 10px}.card b{font-size:11.5px}.card span{display:block;font-size:10.5px;color:#5c6b61;margin-top:2px}" +
    ".rod{padding:10px 18px 16px;font-size:10px;color:#8a968c}" +
    "</style></head><body>" +
    "<div class='hd'><b>" + cfg.siteNome + "</b><span>loja online · checkout · blog</span></div>" +
    "<div class='hero'><h1>Novidades da semana chegaram</h1><p>Frete grátis acima de R$ 199 · trocas em 30 dias</p></div>" +
    "<div class='grid'>" +
    "<div class='card'><div class='img'></div><div><b>Tênis Trail Pro</b><span>R$ 349,90</span></div></div>" +
    "<div class='card'><div class='img'></div><div><b>Mochila 24L</b><span>R$ 189,00</span></div></div>" +
    "<div class='card'><div class='img'></div><div><b>Garrafa Térmica</b><span>R$ 89,90</span></div></div>" +
    "</div>" +
    "<div class='rod'>© 2026 " + cfg.siteNome + " — site de demonstração do Radar GRC · <a href='javascript:void(0)' onclick='window.RadarCookies&&window.RadarCookies.openPreferences()' style='color:#2e6b54;font-weight:700;text-decoration:underline'>Preferências de cookies</a></div>" +
    "<div id='rc-status' style='position:fixed;top:8px;right:8px;z-index:99997;font:600 9.5px system-ui,sans-serif;background:#13251e;color:#c9e94f;border:1px solid rgba(201,233,79,.35);border-radius:999px;padding:4px 10px'>iniciando motor…</div>" +
    "<script>" + snippet + "</scr" + "ipt>" +
    "</body></html>"
  );
}

/* ---------------- Política de Cookies (PDF e MD) gerada pela IA ---------------- */

const PINE: Cor = [19, 46, 38];
const LIME: Cor = [201, 233, 79];
const INK: Cor = [24, 38, 32];
const SOFT: Cor = [76, 91, 82];
const SAND: Cor = [221, 214, 191];

export function gerarPdfPoliticaCookies(cfg: BannerConfig, inv: CookieItem[], diag: DiagnosticoCookies) {
  const pdf = new Pdf();
  const M = 56;
  const CW = A4W - M * 2;
  let y = 0;

  const header = (titulo: string) => {
    pdf.retangulo(0, 0, A4W, 34, PINE);
    pdf.retangulo(0, 34, A4W, 1.6, LIME);
    pdf.texto(M, 12, 9, titulo, { cor: LIME, bold: true });
    pdf.texto(A4W - M, 12, 8, new Date().toLocaleDateString("pt-BR"), { cor: [180, 205, 192], align: "right" });
    pdf.texto(M, 23, 7.5, cfg.siteNome + " · gerada pela IA do Radar GRC", { cor: [180, 205, 192] });
    y = 56;
  };
  const secao = (n: string, t: string) => {
    if (y > 760) { pdf.novaPagina(); header("Política de Cookies — " + cfg.siteNome); }
    y += 4;
    pdf.retangulo(M, y, 3, 12, LIME);
    pdf.texto(M + 9, y + 1, 11, n + "  " + t, { bold: true, cor: INK });
    y += 20;
  };
  const corpo = (t: string) => {
    if (y > 770) { pdf.novaPagina(); header("Política de Cookies — " + cfg.siteNome); }
    y = pdf.paragrafo(M, y, 9.5, t, CW, { cor: SOFT });
    y += 3;
  };

  header("Política de Cookies — " + cfg.siteNome);
  pdf.texto(M, y, 21, "Política de Cookies", { bold: true, cor: INK });
  y += 20;
  pdf.texto(M, y, 12, cfg.siteNome + " · " + cfg.siteUrl, { cor: SOFT });
  y += 26;
  pdf.linha(M, y, A4W - M, y, SAND);
  y += 14;

  secao("1.", "O que são cookies");
  corpo("Cookies são pequenos arquivos de texto armazenados no dispositivo do visitante quando um site é acessado. Eles permitem que o site funcione corretamente, lembre preferências, meça audiência e, em alguns casos, personalize anúncios. Esta política descreve as categorias utilizadas por " + cfg.siteNome + ", em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), o Regulamento Geral de Proteção de Dados da UE (GDPR) e a Diretiva ePrivacy.");

  secao("2.", "Como usamos — categorias");
  for (const c of CATEGORIAS_COOKIE.filter((c) => cfg.categorias.includes(c.id))) {
    const n = inv.filter((i) => i.categoria === c.id).length;
    pdf.texto(M, y, 9.5, "•  " + c.label + " (" + n + " cookie" + (n === 1 ? "" : "s") + ")", { bold: true, cor: INK });
    y = pdf.paragrafo(M + 14, y + 12, 9, c.desc + (c.id === "necessario" ? " Base legal: legítimo interesse/obrigação (não exigem consentimento)." : " Base legal: consentimento do titular (art. 7º, I, LGPD · Art. 6(1)(a) GDPR)."), CW - 14, { cor: SOFT });
    y += 3;
  }

  secao("3.", "Inventário de cookies");
  pdf.retangulo(M, y, CW, 15, PINE);
  pdf.texto(M + 5, y + 4, 7.5, "COOKIE", { cor: LIME, bold: true });
  pdf.texto(M + 110, y + 4, 7.5, "PROVEDOR", { cor: LIME, bold: true });
  pdf.texto(M + 230, y + 4, 7.5, "CATEGORIA", { cor: LIME, bold: true });
  pdf.texto(M + 330, y + 4, 7.5, "DURAÇÃO", { cor: LIME, bold: true });
  pdf.texto(A4W - M - 60, y + 4, 7.5, "ORIGEM", { cor: LIME, bold: true });
  y += 15;
  for (const c of inv) {
    if (y > 770) { pdf.novaPagina(); header("Política de Cookies — " + cfg.siteNome); y = 60; }
    const cat = CATEGORIAS_COOKIE.find((x) => x.id === c.categoria)!;
    pdf.texto(M + 5, y + 3, 8, c.nome.slice(0, 22), { cor: INK });
    pdf.texto(M + 110, y + 3, 8, c.provedor.slice(0, 24), { cor: SOFT });
    pdf.texto(M + 230, y + 3, 8, cat.curta, { cor: SOFT });
    pdf.texto(M + 330, y + 3, 8, c.duracao, { cor: SOFT });
    pdf.texto(A4W - M - 60, y + 3, 8, c.origem === "proprio" ? "Próprio" : "Terceiro", { cor: SOFT });
    pdf.linha(M, y + 13, A4W - M, y + 13, SAND, 0.4);
    y += 14;
  }
  y += 8;

  secao("4.", "Gestão do consentimento");
  corpo("Ao acessar o site, o visitante é apresentado ao banner de consentimento e pode aceitar todas as categorias, recusar as não essenciais ou personalizar suas escolhas. As escolhas ficam registradas com data/hora e versão do banner, constituindo evidência de conformidade. É possível alterar ou retirar o consentimento a qualquer momento pelo link 'Preferências de cookies' no rodapé, com a mesma facilidade da concessão (art. 8º, §5º, LGPD · Art. 7(3) GDPR).");

  secao("5.", "Seus direitos");
  corpo("Nos termos da LGPD e do GDPR, o titular pode solicitar acesso, correção, portabilidade e eliminação dos dados coletados por cookies, além de revogar o consentimento. As solicitações devem ser encaminhadas ao Encarregado de Dados pelo e-mail " + cfg.dpoEmail + " e serão respondidas nos prazos legais (15 dias — LGPD; 30 dias — GDPR).");

  secao("6.", "Retenção e transferências");
  corpo("Cada cookie possui duração própria, descrita no inventário acima, limitada ao necessário para sua finalidade. Cookies de fornecedores localizados fora do Brasil/EEE são protegidos por mecanismos adequados de transferência (cláusulas-padrão contratuais), conforme Capítulo V do GDPR e arts. 33–36 da LGPD.");

  secao("7.", "Diagnóstico da IA (uso interno)");
  corpo("Conformidade estimada: " + diag.score + "/100 (" + diag.nivel + "). Taxas de consentimento: aceite total " + diag.taxas.aceite + "% · recusa " + diag.taxas.recusa + "% · personalizado " + diag.taxas.personalizado + "%, sobre " + diag.total + " eventos registrados. Recomenda-se revalidação do consentimento a cada 6–13 meses e revisão deste documento sempre que novos cookies forem publicados.");

  if (y > 730) { pdf.novaPagina(); header("Política de Cookies — " + cfg.siteNome); y = 60; }
  y += 14;
  pdf.linha(M, y + 40, M + 200, y + 40, INK, 0.8);
  pdf.linha(A4W - M - 200, y + 40, A4W - M, y + 40, INK, 0.8);
  pdf.texto(M, y + 46, 8.5, "Encarregado de Dados — " + cfg.dpoEmail, { cor: SOFT });
  pdf.texto(A4W - M - 200, y + 46, 8.5, "Aprovação — " + cfg.siteNome, { cor: SOFT });

  baixarPdf("politica-de-cookies-" + cfg.siteNome.replace(/[^a-z0-9]/gi, "-") + ".pdf", gerarBytesPdf(pdf));
}

export function gerarMdPoliticaCookies(cfg: BannerConfig, inv: CookieItem[]): string {
  const linhas: string[] = [];
  linhas.push("# Política de Cookies — " + cfg.siteNome);
  linhas.push("");
  linhas.push("*Gerada pela IA do Radar GRC em " + new Date().toLocaleDateString("pt-BR") + " · " + cfg.siteUrl + "*");
  linhas.push("");
  linhas.push("## 1. O que são cookies");
  linhas.push("Cookies são pequenos arquivos de texto armazenados no dispositivo do visitante. Esta política descreve as categorias usadas por " + cfg.siteNome + " (LGPD, GDPR e ePrivacy).");
  linhas.push("");
  linhas.push("## 2. Categorias utilizadas");
  for (const c of CATEGORIAS_COOKIE.filter((c) => cfg.categorias.includes(c.id))) {
    linhas.push("- **" + c.label + "** — " + c.desc + (c.id === "necessario" ? " (não exigem consentimento)" : " (base: consentimento)"));
  }
  linhas.push("");
  linhas.push("## 3. Inventário");
  linhas.push("| Cookie | Provedor | Categoria | Duração | Origem |");
  linhas.push("|---|---|---|---|---|");
  for (const c of inv) {
    linhas.push("| " + c.nome + " | " + c.provedor + " | " + (CATEGORIAS_COOKIE.find((x) => x.id === c.categoria)?.curta ?? c.categoria) + " | " + c.duracao + " | " + (c.origem === "proprio" ? "Próprio" : "Terceiro") + " |");
  }
  linhas.push("");
  linhas.push("## 4. Gestão do consentimento");
  linhas.push("O banner permite aceitar, recusar ou personalizar categorias, com registro de evidência (data/hora e versão). Alterações pelo link 'Preferências de cookies' no rodapé.");
  linhas.push("");
  linhas.push("## 5. Direitos e contato");
  linhas.push("Acesso, correção, portabilidade, eliminação e revogação pelo e-mail " + cfg.dpoEmail + " (prazos: 15 dias LGPD · 30 dias GDPR).");
  return linhas.join("\n");
}
