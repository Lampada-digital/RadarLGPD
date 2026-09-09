import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../auth";
import { useStore } from "../store";
import { uid } from "../domain";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   Gestão de Cookies — inventário, banner instalável e diagnóstico com IA.
   ===================================================================== */

type Categoria = "necessario" | "funcional" | "analitico" | "publicidade";

const CATEGORIAS: { id: Categoria; label: string; curta: string; cor: string }[] = [
  { id: "necessario", label: "Estritamente necessários", curta: "Necessários", cor: "#2e6b54" },
  { id: "funcional", label: "Funcionais / preferências", curta: "Funcionais", cor: "#2f7f74" },
  { id: "analitico", label: "Analíticos", curta: "Analíticos", cor: "#c98a1f" },
  { id: "publicidade", label: "Publicidade / marketing", curta: "Publicidade", cor: "#bd4f26" },
];

interface CookieItem {
  id: string;
  nome: string;
  provedor: string;
  categoria: Categoria;
  duracao: string;
  dias: number;
  origem: "proprio" | "terceiro";
  antesConsent: boolean;
}

interface BannerConfig {
  siteNome: string;
  siteUrl: string;
  dpoEmail: string;
  cor: string;
}

interface Evento {
  id: string;
  ts: number;
  tipo: "aceite_total" | "recusa_total" | "personalizado" | "alteracao";
  categorias: Categoria[] | null;
}

const CHAVE_EVENTOS = "radargrc:cookie-eventos";

const SEED_COOKIES: CookieItem[] = [
  { id: "c1", nome: "session_id", provedor: "minhaloja.com.br", categoria: "necessario", duracao: "Sessão", dias: 0, origem: "proprio", antesConsent: true },
  { id: "c2", nome: "_ga", provedor: "Google Analytics", categoria: "analitico", duracao: "24 meses", dias: 730, origem: "terceiro", antesConsent: false },
  { id: "c3", nome: "_fbp", provedor: "Meta Pixel", categoria: "publicidade", duracao: "3 meses", dias: 90, origem: "terceiro", antesConsent: false },
  { id: "c4", nome: "lang", provedor: "minhaloja.com.br", categoria: "funcional", duracao: "12 meses", dias: 365, origem: "proprio", antesConsent: false },
];

function gerarScript(cfg: BannerConfig): string {
  return `/* Radar GRC — Banner de Cookies (ePrivacy/GDPR) */
(function(){
  if(window.RadarCookies) return;
  var CFG={site:"${cfg.siteNome}",dpo:"${cfg.dpoEmail}",cor:"${cfg.cor}"};
  var K="radar_cookie_consent";
  function ler(){try{return JSON.parse(localStorage.getItem(K))}catch(e){return null}}
  function gravar(v){try{localStorage.setItem(K,JSON.stringify(v));var ev=JSON.parse(localStorage.getItem("${CHAVE_EVENTOS}")||"[]");ev.unshift(v);localStorage.setItem("${CHAVE_EVENTOS}",JSON.stringify(ev.slice(0,200)))}catch(e){}}
  function montar(){
    if(document.getElementById("rc-banner"))return;
    var d=document.createElement("div");d.id="rc-banner";
    d.style.cssText="position:fixed;left:0;right:0;bottom:0;z-index:99999;background:#13251e;color:#f2efe4;padding:18px 24px;display:flex;flex-wrap:wrap;gap:14px;align-items:center;justify-content:space-between;font:13px system-ui,sans-serif;box-shadow:0 -8px 30px rgba(0,0,0,.3)";
    d.innerHTML='<div style="max-width:640px"><strong style="color:#c9e94f">Privacidade e Cookies</strong><br>Usamos cookies para melhorar sua experiência. Você pode aceitar todos, recusar ou personalizar. Saiba mais na Política de Cookies.</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<button onclick="window.RadarCookies.aceitar()" style="background:#c9e94f;color:#13251e;border:0;border-radius:6px;padding:9px 16px;font-weight:700;cursor:pointer">Aceitar todos</button>'
      +'<button onclick="window.RadarCookies.recusar()" style="background:transparent;color:#f2efe4;border:1px solid #f2efe4;border-radius:6px;padding:9px 16px;cursor:pointer">Recusar</button>'
      +'<button onclick="window.RadarCookies.personalizar()" style="background:transparent;color:#f2efe4;border:1px solid #f2efe4;border-radius:6px;padding:9px 16px;cursor:pointer">Personalizar</button>'
      +'</div>';
    document.body.appendChild(d);
  }
  function fechar(){var el=document.getElementById("rc-banner");if(el)el.remove()}
  window.RadarCookies={
    aceitar:function(){gravar({id:Math.random().toString(36).slice(2),ts:Date.now(),tipo:"aceite_total",categorias:["necessario","funcional","analitico","publicidade"]});fechar()},
    recusar:function(){gravar({id:Math.random().toString(36).slice(2),ts:Date.now(),tipo:"recusa_total",categorias:["necessario"]});fechar()},
    personalizar:function(){gravar({id:Math.random().toString(36).slice(2),ts:Date.now(),tipo:"personalizado",categorias:["necessario","funcional"]});fechar()},
    reset:function(){localStorage.removeItem(K);montar()}
  };
  if(!ler()) setTimeout(montar,800);
})();`;
}

function classificarComIa(nome: string): { categoria: Categoria; origem: "proprio" | "terceiro"; dias: number } {
  const n = nome.toLowerCase();
  let categoria: Categoria = "funcional";
  let origem: "proprio" | "terceiro" = "proprio";
  let dias = 365;
  if (/_ga|_gid|analytics|_utm/.test(n)) { categoria = "analitico"; origem = "terceiro"; dias = 730; }
  else if (/_fbp|_fbc|fr=|pixel|_pin|ads|gclid|gcl_/.test(n)) { categoria = "publicidade"; origem = "terceiro"; dias = 90; }
  else if (/sess|csrf|token|cart|login/.test(n)) { categoria = "necessario"; dias = 0; }
  else if (/lang|theme|pref|consent/.test(n)) { categoria = "funcional"; dias = 365; }
  if (/hotjar|zendesk|intercom|hubspot|rdstation/.test(n)) origem = "terceiro";
  return { categoria, origem, dias };
}

function fmtHora(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Cookies() {
  const { usuario } = useAuth();
  const { toast, registrar } = useStore();
  const chaveBase = `radargrc:cookies:${usuario?.id ?? "anon"}`;

  const [cookies, setCookies] = useState<CookieItem[]>(() => {
    try {
      const raw = localStorage.getItem(chaveBase);
      if (raw) return JSON.parse(raw);
    } catch { /* usa seed */ }
    return SEED_COOKIES;
  });
  const [config, setConfig] = useState<BannerConfig>({ siteNome: "minhaloja.com.br", siteUrl: "https://minhaloja.com.br", dpoEmail: "dpo@minhaloja.com.br", cor: "#2e6b54" });
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [novoNome, setNovoNome] = useState("");
  const [analisando, setAnalisando] = useState(false);
  const [diag, setDiag] = useState<{ score: number; nivel: string; cor: string; problemas: { texto: string; sev: string; ref: string }[]; recs: string[] } | null>(null);

  useEffect(() => {
    try { localStorage.setItem(chaveBase, JSON.stringify(cookies)); } catch { /* sem storage */ }
  }, [chaveBase, cookies]);

  /* ingestão em tempo real dos eventos do banner (mesma origem) */
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHAVE_EVENTOS && e.newValue) {
        try {
          const evts = JSON.parse(e.newValue) as Evento[];
          setEventos(evts.slice(0, 18));
          if (evts.length) toast("Consentimento recebido do site em tempo real.", "ia");
        } catch { /* ignora */ }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [toast]);

  const stats = useMemo(() => {
    const total = eventos.length;
    const ace = eventos.filter((e) => e.tipo === "aceite_total").length;
    const rec = eventos.filter((e) => e.tipo === "recusa_total").length;
    const per = eventos.filter((e) => e.tipo === "personalizado" || e.tipo === "alteracao").length;
    return { total, ace, rec, per, taxa: total ? Math.round(((ace + per) / total) * 100) : 0 };
  }, [eventos]);

  const classificar = () => {
    const nomes = novoNome.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    if (!nomes.length) {
      toast("Digite ao menos um nome de cookie para classificar.", "warn");
      return;
    }
    const itens: CookieItem[] = nomes.map((nome) => {
      const r = classificarComIa(nome);
      return { id: uid(), nome, provedor: r.origem === "terceiro" ? "Terceiro" : config.siteNome, categoria: r.categoria, duracao: r.dias === 0 ? "Sessão" : `${r.dias} dias`, dias: r.dias, origem: r.origem, antesConsent: r.categoria === "necessario" };
    });
    setCookies((l) => [...itens, ...l]);
    registrar("sistema", `${itens.length} cookie(s) classificados pela IA.`);
    toast(`IA classificou ${itens.length} cookie(s) e adicionou ao inventário.`, "ia");
    setNovoNome("");
  };

  const analisar = () => {
    setAnalisando(true);
    setDiag(null);
    setTimeout(() => {
      const problemas: { texto: string; sev: string; ref: string }[] = [];
      const recs: string[] = [];
      const pre = cookies.filter((c) => c.antesConsent && c.categoria !== "necessario");
      if (pre.length) problemas.push({ texto: `${pre.length} cookie(s) não essenciais estão sendo disparados antes do consentimento.`, sev: "alta", ref: "ePrivacy Art. 5(3)" });
      const longos = cookies.filter((c) => c.dias > 390 && c.categoria !== "necessario");
      if (longos.length) problemas.push({ texto: `${longos.length} cookie(s) com duração acima de 13 meses — revise a retenção.`, sev: "media", ref: "CNIL / EDPB" });
      const terceiros = cookies.filter((c) => c.origem === "terceiro");
      if (terceiros.length) { problemas.push({ texto: `${terceiros.length} cookie(s) de terceiros — exija DPAs e cláusulas de transferência.`, sev: "media", ref: "GDPR Art. 28/46" }); recs.push("Mapear cada terceiro e firmar Data Processing Agreement."); }
      if (!cookies.some((c) => c.categoria === "publicidade")) recs.push("Sem cookies de publicidade — risco baixo de fiscalização ePrivacy.");
      if (pre.length) recs.push("Implementar bloqueio prévio (default deny) para não essenciais.");
      recs.push("Manter prova de consentimento registrada e exportável.");
      recs.push("Revisar o inventário a cada 6 meses ou a cada novo fornecedor.");
      const score = Math.max(20, 100 - pre.length * 25 - longos.length * 10 - (terceiros.length > 2 ? 10 : 0));
      setDiag({
        score,
        nivel: score >= 80 ? "Conforme" : score >= 55 ? "Ajustes necessários" : "Risco elevado",
        cor: score >= 80 ? "var(--color-moss)" : score >= 55 ? "var(--color-amber)" : "var(--color-rust)",
        problemas,
        recs,
      });
      setAnalisando(false);
      registrar("sistema", `Diagnóstico de cookies executado pela IA (${cookies.length} cookies).`);
    }, 800);
  };

  const script = useMemo(() => gerarScript(config), [config]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(script);
      toast("Script do banner copiado — cole antes de </body> no site do cliente.");
    } catch {
      toast("Copie manualmente o código exibido.", "warn");
    }
  };

  const baixar = () => {
    const blob = new Blob([script], { type: "text/javascript;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "banner-cookies.js";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
    registrar("sistema", `Banner de cookies gerado para ${config.siteNome}.`);
    toast("banner-cookies.js baixado — hospede e referencie no site do cliente.");
  };

  const inp = "w-full rounded-md border border-sand bg-cream px-3 py-2 text-[12.5px] text-ink outline-none transition placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25";

  return (
    <div>
      <Cabecalho
        kicker="Governança digital · ePrivacy + GDPR + LGPD"
        titulo="Gestão de Cookies & Consentimento"
        desc="Gere o banner do site do cliente, receba os consentimentos em tempo real e deixe a IA diagnosticar a conformidade e classificar o inventário."
      />

      <div className="grid gap-3.5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <h2 className="font-display mb-1 text-[15px] font-bold text-ink">Gerador de banner</h2>
            <p className="text-[11px] text-ink-soft">Configure e o script é gerado na hora — pronto para instalar no site do cliente.</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <input className={inp} placeholder="Domínio (ex.: minhaloja.com.br)" value={config.siteNome} onChange={(e) => setConfig({ ...config, siteNome: e.target.value })} />
              <input className={inp} placeholder="URL completa" value={config.siteUrl} onChange={(e) => setConfig({ ...config, siteUrl: e.target.value })} />
              <input className={inp} placeholder="E-mail do DPO" value={config.dpoEmail} onChange={(e) => setConfig({ ...config, dpoEmail: e.target.value })} />
              <div className="flex items-center gap-2">
                {["#2e6b54", "#1f4e8f", "#7a4f8f", "#bd4f26"].map((c) => (
                  <button key={c} onClick={() => setConfig({ ...config, cor: c })} className={`size-8 rounded-md border-2 transition hover:scale-110 ${config.cor === c ? "border-ink shadow-md" : "border-transparent"}`} style={{ background: c }} aria-label={`Cor ${c}`} />
                ))}
              </div>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <button onClick={baixar} className="inline-flex items-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[12.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
                <Ic name="download" size={14} sw={2.4} /> Baixar banner-cookies.js
              </button>
              <button onClick={copiar} className="inline-flex items-center gap-2 rounded-md border border-sand px-4 py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
                <Ic name="doc" size={14} /> Copiar código
              </button>
            </div>
            <pre className="mt-3 max-h-[150px] overflow-auto rounded-md border border-pine-line bg-pine-deep p-3 text-[10px] leading-relaxed text-lime/80">
              <code>{script}</code>
            </pre>
          </div>
        </Reveal>

        <Reveal delay={90} className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <h2 className="font-display mb-3 text-[15px] font-bold text-ink">Consentimentos em tempo real</h2>
            <div className="grid grid-cols-3 gap-2">
              {[{ l: "Aceitaram", v: stats.ace, cor: "text-moss" }, { l: "Recusaram", v: stats.rec, cor: "text-rust" }, { l: "Personaliz.", v: stats.per, cor: "text-amber" }].map((s) => (
                <div key={s.l} className="rounded-md border border-sand bg-paper px-2.5 py-2 text-center">
                  <p className={`font-display text-[22px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
                  <p className="mt-1 text-[9.5px] font-bold tracking-wide text-ink-faint uppercase">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10.5px] font-bold text-ink-soft">
                <span>Taxa de aceite</span><span className="font-display text-moss">{stats.taxa}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-deep"><div className="bar-grow h-full rounded-full bg-moss" style={{ width: `${stats.taxa}%` }} /></div>
            </div>
            <p className="mt-4 mb-1.5 text-[10px] font-extrabold tracking-[0.16em] text-ink-faint uppercase">Feed de eventos</p>
            <ul className="max-h-[220px] flex-1 space-y-1.5 overflow-y-auto pr-1">
              {eventos.length === 0 && <p className="rounded-md border border-dashed border-sand px-3 py-5 text-center text-[11px] text-ink-faint">Instale o banner no site do cliente — os consentimentos aparecem aqui ao vivo.</p>}
              {eventos.map((e) => (
                <li key={e.id} className="anim-pop flex items-center justify-between gap-2 rounded-md border border-sand bg-paper px-2.5 py-2">
                  <span className="rounded-full bg-moss/12 px-2 py-0.5 text-[9.5px] font-extrabold text-moss uppercase">{e.tipo.replace("_", " ")}</span>
                  <span className="text-[10px] font-semibold text-ink-faint tabular-nums">{fmtHora(e.ts)}</span>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      <Reveal delay={60}>
        <div className="mt-3.5 grid gap-3.5 lg:grid-cols-5">
          <div className="overflow-hidden rounded-lg border border-sand bg-cream lg:col-span-3">
            <div className="flex items-center justify-between border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[15px] font-bold text-ink">Inventário de cookies · {cookies.length}</h2>
              <span className="text-[10.5px] font-bold text-ink-faint">{cookies.filter((c) => c.origem === "terceiro").length} de terceiros</span>
            </div>
            <ul className="max-h-[300px] overflow-y-auto">
              {cookies.map((c) => {
                const cat = CATEGORIAS.find((x) => x.id === c.categoria)!;
                return (
                  <li key={c.id} className="group flex items-center gap-3 border-b border-sand/60 px-4 py-2.5 transition last:border-b-0 hover:bg-paper">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: cat.cor }} />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-[12.5px] font-bold text-ink">
                        <code className="font-sans">{c.nome}</code>
                        {c.antesConsent && c.categoria !== "necessario" && <span className="rounded-sm bg-rust-soft px-1.5 py-px text-[8.5px] font-extrabold text-rust uppercase">pré-consent!</span>}
                        {c.dias > 390 && c.categoria !== "necessario" && <span className="rounded-sm bg-amber-soft px-1.5 py-px text-[8.5px] font-extrabold text-ink uppercase">&gt;13 meses</span>}
                      </p>
                      <p className="text-[10.5px] text-ink-faint">{c.provedor} · {c.duracao} · {c.origem === "proprio" ? "próprio" : "terceiro"}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase" style={{ background: `${cat.cor}1f`, color: cat.cor }}>{cat.curta}</span>
                    <button onClick={() => setCookies((l) => l.filter((x) => x.id !== c.id))} className="shrink-0 rounded-md p-1 text-ink-faint opacity-0 transition group-hover:opacity-100 hover:text-rust" aria-label="Remover">
                      <Ic name="trash" size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="rail-texture flex flex-col rounded-lg border border-pine-line bg-pine p-5 text-cream lg:col-span-2">
            <h2 className="font-display flex items-center gap-2 text-[15px] font-bold text-cream"><Ic name="spark" size={16} sw={2.2} className="text-lime" /> Classificar com IA</h2>
            <p className="mt-1 text-[11.5px] leading-snug text-cream/60">Cole os cookies vistos no DevTools do site (um por linha). A IA identifica categoria, origem e duração.</p>
            <textarea
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder={"_ga\n_fbp\nsession_id"}
              className="mt-3 min-h-[110px] flex-1 resize-y rounded-md border border-pine-line bg-pine-deep p-3 font-mono text-[11.5px] leading-relaxed text-lime/90 outline-none placeholder:text-cream/25 focus:border-lime/60"
            />
            <button onClick={classificar} className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[12.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
              <Ic name="wand" size={14} sw={2.2} /> Classificar e adicionar
            </button>
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-3.5 rounded-lg border border-sand bg-cream p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[16px] font-bold text-ink">Diagnóstico com IA</h2>
              <p className="text-[11.5px] text-ink-soft">Análise de conformidade ePrivacy/GDPR sobre o inventário.</p>
            </div>
            <button onClick={analisar} disabled={analisando} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98] disabled:opacity-70">
              {analisando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-lime/30 border-t-lime" /> : <Ic name="spark" size={14} sw={2.2} />}
              {analisando ? "Analisando…" : "Executar diagnóstico"}
            </button>
          </div>
          {diag && (
            <div className="anim-pop mt-4 grid gap-4 lg:grid-cols-[200px_1fr]">
              <div className="flex flex-col items-center rounded-lg border border-sand bg-paper p-4">
                <p className="font-display text-[44px] leading-none font-extrabold" style={{ color: diag.cor }}>{diag.score}</p>
                <p className="font-display mt-1 text-[13px] font-bold" style={{ color: diag.cor }}>{diag.nivel}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10.5px] font-extrabold tracking-[0.14em] text-rust uppercase">Problemas detectados</p>
                  {diag.problemas.length === 0 && <p className="rounded-md border border-moss/40 bg-moss/8 px-3 py-2.5 text-[12px] font-semibold text-moss">Nenhum problema relevante encontrado.</p>}
                  <ul className="space-y-2">
                    {diag.problemas.map((p) => (
                      <li key={p.texto} className="rounded-md border border-sand bg-paper px-3 py-2.5">
                        <p className="text-[12px] leading-snug font-semibold text-ink">{p.texto}</p>
                        <p className="mt-0.5 text-[10px] font-bold text-moss">{p.ref}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[10.5px] font-extrabold tracking-[0.14em] text-moss uppercase">Plano de ação</p>
                  <ol className="space-y-1.5">
                    {diag.recs.map((r, i) => (
                      <li key={r} className="flex items-start gap-2.5 rounded-md bg-paper px-3 py-2 text-[12px] leading-snug text-ink-soft">
                        <span className="font-display mt-px shrink-0 text-[12px] font-extrabold text-moss">{String(i + 1).padStart(2, "0")}</span>
                        {r}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>
      </Reveal>
    </div>
  );
}
