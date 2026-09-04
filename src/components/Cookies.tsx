import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import {
  CATEGORIAS_COOKIE, CHAVE_CONSENT, CHAVE_EVENTOS,
  analisarCookies, classificarCookies, gerarMdPoliticaCookies, gerarPdfPoliticaCookies, gerarSnippet, htmlSiteSimulado,
} from "../cookies";
import type { CategoriaCookie, CookieEvento, CookieItem, DiagnosticoCookies } from "../cookies";
import { buscarFeed, testarApi } from "../apiClient";
import type { FeedApi } from "../apiClient";
import { baixarBlob } from "../pdf";
import { Cabecalho, Campo, ChipToggle, Ic, inputCls, Modal, Reveal, Ring } from "./ui";
import Iso from "./Iso";

const TIPO_META: Record<string, { label: string; cls: string }> = {
  aceite_total: { label: "Aceitou todos", cls: "bg-moss/12 text-moss" },
  recusa_total: { label: "Recusou essenciais+", cls: "bg-rust-soft text-rust" },
  personalizado: { label: "Personalizou", cls: "bg-amber-soft text-ink" },
  alteracao: { label: "Alterou escolhas", cls: "bg-paper-deep text-ink-soft" },
};

const CORES_BANNER = ["#2e6b54", "#132e26", "#1f4e8f", "#7a4f8f", "#bd4f26"];

function fmtHora(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Cookies() {
  const { bannerConfig, setBannerConfig, cookieEventos, addCookieEventos, limparCookieEventos, inventarioCookies, addCookie, addCookies, removeCookie, toast, registrar } = useStore();
  const [iframeKey, setIframeKey] = useState(0);
  const [copiado, setCopiado] = useState(false);
  const [paste, setPaste] = useState("");
  const [classificando, setClassificando] = useState(false);
  const [diag, setDiag] = useState<DiagnosticoCookies | null>(null);
  const [analisando, setAnalisando] = useState(false);
  const [isoAberto, setIsoAberto] = useState(false);
  const [novo, setNovo] = useState({ nome: "", provedor: "", duracao: "", categoria: "funcional" as CategoriaCookie, origem: "proprio" as "proprio" | "terceiro" });
  const vistosRef = useRef<Set<string>>(new Set(cookieEventos.map((e) => e.id)));

  /* ---- API do banner ---- */
  const [apiConn, setApiConn] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testando, setTestando] = useState(false);
  const [feed, setFeed] = useState<FeedApi | null>(null);
  const [sincronizando, setSincronizando] = useState(false);

  const testarConexao = async () => {
    setTestando(true);
    setApiConn(null);
    const r = await testarApi(bannerConfig.apiUrl, bannerConfig.orgKey);
    setApiConn(r);
    setTestando(false);
    if (r.ok) {
      const f = await buscarFeed(bannerConfig.apiUrl, bannerConfig.orgKey);
      if (f?.ok) setFeed(f);
    }
  };

  /* a IA puxa o feed da API e faz o mapeamento completo automaticamente */
  const sincronizarComIa = async () => {
    setSincronizando(true);
    const f = await buscarFeed(bannerConfig.apiUrl, bannerConfig.orgKey);
    if (!f || !f.ok) {
      toast("Não foi possível ler o feed da API. Teste a conexão e confira endpoint + chave.", "warn");
      setSincronizando(false);
      return;
    }
    setFeed(f);
    const itens = classificarCookies(f.cookies.map((c) => c.nome));
    addCookies(itens);
    const evts: CookieEvento[] = f.eventos.map((e) => ({
      id: e.id,
      ts: e.ts,
      tipo: e.tipo as CookieEvento["tipo"],
      categorias: (e.categorias ?? null) as CategoriaCookie[] | null,
      origem: "site" as const,
    }));
    const novos = addCookieEventos(evts);
    const d = analisarCookies(inventarioCookies, cookieEventos);
    setDiag(d);
    registrar("sistema", `Mapeamento automático via API (${bannerConfig.orgKey}): ${itens.length} cookies classificados, ${novos} eventos novos importados.`);
    toast(`IA concluiu o mapeamento: ${itens.length} cookies no inventário e ${novos} eventos sincronizados.`, "ia");
    setSincronizando(false);
  };

  /* ---- ingestão em tempo real: postMessage (iframe) + storage + polling ---- */
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { radar?: string; evento?: { id: string; ts: number; tipo: never; categorias: CategoriaCookie[] | null; origem: "site" } } | null;
      if (d?.radar === "cookie-event" && d.evento) {
        if (!vistosRef.current.has(d.evento.id)) {
          vistosRef.current.add(d.evento.id);
          const n = addCookieEventos([d.evento]);
          if (n) toast(`Consentimento recebido do site: ${TIPO_META[d.evento.tipo]?.label ?? d.evento.tipo}.`, "ia");
        }
      }
    };
    const onStorage = (e: StorageEvent) => {
      if (e.key === CHAVE_EVENTOS && e.newValue) {
        try {
          const evts = JSON.parse(e.newValue) as { id: string; ts: number; tipo: never; categorias: CategoriaCookie[] | null; origem: "site" }[];
          const novosEvts = evts.filter((x) => !vistosRef.current.has(x.id));
          novosEvts.forEach((x) => vistosRef.current.add(x.id));
          if (novosEvts.length) {
            addCookieEventos(novosEvts);
            toast(`${novosEvts.length} consentimento(s) sincronizado(s) do site.`, "ia");
          }
        } catch {
          /* evento malformado */
        }
      }
    };
    const poll = setInterval(() => {
      try {
        const raw = localStorage.getItem(CHAVE_EVENTOS);
        if (!raw) return;
        const evts = JSON.parse(raw) as { id: string; ts: number; tipo: never; categorias: CategoriaCookie[] | null; origem: "site" }[];
        const novosEvts = evts.filter((x) => !vistosRef.current.has(x.id));
        if (novosEvts.length) {
          novosEvts.forEach((x) => vistosRef.current.add(x.id));
          addCookieEventos(novosEvts);
        }
      } catch {
        /* sem eventos */
      }
    }, 2000);
    window.addEventListener("message", onMsg);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("storage", onStorage);
      clearInterval(poll);
    };
  }, [addCookieEventos, toast]);

  const snippet = useMemo(() => gerarSnippet(bannerConfig), [bannerConfig]);
  const srcDoc = useMemo(() => htmlSiteSimulado(bannerConfig), [bannerConfig]);

  const stats = useMemo(() => {
    const total = cookieEventos.length;
    const ace = cookieEventos.filter((e) => e.tipo === "aceite_total").length;
    const rec = cookieEventos.filter((e) => e.tipo === "recusa_total").length;
    const per = cookieEventos.filter((e) => e.tipo === "personalizado" || e.tipo === "alteracao").length;
    const taxaAceite = total ? Math.round(((ace + per) / total) * 100) : 0;
    return { total, ace, rec, per, taxaAceite };
  }, [cookieEventos]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
      toast("Script do banner copiado para a área de transferência.");
    } catch {
      toast("Não foi possível copiar automaticamente — selecione o código manualmente.", "warn");
    }
  };

  const baixarBanner = () => {
    baixarBlob(`banner-cookies-${bannerConfig.siteNome.replace(/[^a-z0-9]/gi, "-")}.js`, new Blob([snippet], { type: "text/javascript;charset=utf-8" }));
    registrar("sistema", `Banner de cookies gerado para ${bannerConfig.siteNome}.`);
    toast("banner-cookies.js baixado — hospede e referencie no seu site.");
  };

  const resetConsent = () => {
    localStorage.removeItem(CHAVE_CONSENT);
    setIframeKey((k) => k + 1);
    toast("Consentimento do visitante simulado apagado — o banner reaparece.");
  };

  const classificar = () => {
    const nomes = paste.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
    if (!nomes.length) {
      toast("Cole ao menos um nome de cookie para classificar.", "warn");
      return;
    }
    setClassificando(true);
    setTimeout(() => {
      const itens = classificarCookies(nomes);
      addCookies(itens);
      const porCat = CATEGORIAS_COOKIE.map((c) => `${itens.filter((i) => i.categoria === c.id).length} ${c.curta.toLowerCase()}`).filter((s) => !s.startsWith("0 "));
      toast(`IA classificou ${itens.length} cookie(s): ${porCat.join(" · ")}.`, "ia");
      registrar("sistema", `${itens.length} cookies classificados pela IA no inventário.`);
      setPaste("");
      setClassificando(false);
    }, 700);
  };

  const addManual = () => {
    if (!novo.nome.trim()) {
      toast("Informe o nome do cookie.", "warn");
      return;
    }
    addCookie({
      id: `m-${Date.now()}`,
      nome: novo.nome.trim(),
      provedor: novo.provedor.trim() || bannerConfig.siteNome,
      categoria: novo.categoria,
      duracao: novo.duracao.trim() || "A definir",
      dias: /sess/i.test(novo.duracao) ? 0 : parseInt(novo.duracao) || 90,
      origem: novo.origem,
      antesConsent: novo.categoria === "necessario",
      descricao: "Adicionado manualmente ao inventário.",
    });
    toast(`Cookie "${novo.nome}" adicionado ao inventário.`);
    setNovo({ nome: "", provedor: "", duracao: "", categoria: "funcional", origem: "proprio" });
  };

  const analisar = () => {
    setAnalisando(true);
    setDiag(null);
    setTimeout(() => {
      setDiag(analisarCookies(inventarioCookies, cookieEventos));
      setAnalisando(false);
      registrar("sistema", `Diagnóstico de cookies executado pela IA (${cookieEventos.length} eventos, ${inventarioCookies.length} cookies).`);
    }, 900);
  };

  const baixarPdfPolitica = () => {
    const d = diag ?? analisarCookies(inventarioCookies, cookieEventos);
    gerarPdfPoliticaCookies(bannerConfig, inventarioCookies, d);
    registrar("sistema", `Política de cookies de ${bannerConfig.siteNome} gerada em PDF.`);
    toast("Política de Cookies em PDF baixada — pronta para publicar.");
  };

  const baixarMdPolitica = () => {
    baixarBlob("politica-de-cookies.md", new Blob([gerarMdPoliticaCookies(bannerConfig, inventarioCookies)], { type: "text/markdown;charset=utf-8" }));
    toast("Política de Cookies em Markdown baixada.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Governança digital · ePrivacy + GDPR + LGPD"
        titulo="Gestão de Cookies & Consentimento"
        desc="Gere o banner do seu site, receba os consentimentos em tempo real neste painel e deixe a IA diagnosticar a conformidade, classificar o inventário e redigir a política."
        acao={
          <button onClick={() => setIsoAberto(true)} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-4 py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
            <Ic name="check" size={14} sw={2.4} /> Checklist de implementação
          </button>
        }
      />

      {/* ===== linha 1: site ao vivo + consentimentos ===== */}
      <div className="grid gap-3.5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="flex h-full flex-col overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="flex items-center justify-between border-b border-sand bg-paper px-4 py-2.5">
              <p className="flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.14em] text-ink-soft uppercase">
                <Ic name="globe" size={13} className="text-moss" /> Site sob gestão · preview ao vivo
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-moss/12 px-2.5 py-1 text-[10px] font-extrabold text-moss">
                <span className="pulse-dot size-1.5 rounded-full bg-moss" /> recebendo eventos
              </span>
            </div>
            {/* mockup de navegador */}
            <div className="border-b border-sand bg-pine px-3 py-2">
              <div className="flex items-center gap-2">
                <span className="flex gap-1.5">
                  <span className="size-2.5 rounded-full bg-rust/80" />
                  <span className="size-2.5 rounded-full bg-amber/80" />
                  <span className="size-2.5 rounded-full bg-moss/80" />
                </span>
                <span className="flex flex-1 items-center gap-2 rounded-md bg-pine-deep/80 px-3 py-1.5 text-[11px] text-cream/70">
                  <Ic name="lock" size={11} sw={2.4} className="text-lime" />
                  {bannerConfig.siteUrl}
                </span>
                <button onClick={() => setIframeKey((k) => k + 1)} className="rounded-md p-1.5 text-cream/60 transition hover:bg-pine-line hover:text-lime" title="Recarregar visitante" aria-label="Recarregar">
                  <Ic name="refresh" size={13} />
                </button>
                <button onClick={resetConsent} className="inline-flex items-center gap-1.5 rounded-md border border-lime/35 bg-lime/10 px-2.5 py-1 text-[10.5px] font-extrabold text-lime transition hover:bg-lime/20 active:scale-95" title="Apaga o consentimento salvo — o banner reaparece para o visitante">
                  <Ic name="user" size={12} sw={2.2} /> Simular novo visitante
                </button>
              </div>
            </div>
            <iframe key={iframeKey} title="Site simulado com banner de cookies" srcDoc={srcDoc} className="h-[380px] w-full bg-[#f4f1e8]" />
            <p className="border-t border-sand bg-paper px-4 py-2.5 text-[10.5px] leading-snug text-ink-faint">
              Interaja com o banner acima — cada escolha é enviada <strong className="text-ink-soft">direto para o painel ao lado</strong>. No seu site real, o mesmo script envia via <code className="rounded-sm bg-paper-deep px-1">postMessage</code>/<code className="rounded-sm bg-paper-deep px-1">localStorage</code> (mesma origem) ou para seu endpoint de API.
            </p>
          </div>
        </Reveal>

        <Reveal delay={90} className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Consentimentos em tempo real</h2>
              <button onClick={() => { limparCookieEventos(); vistosRef.current.clear(); }} className="text-[10.5px] font-bold text-ink-faint transition hover:text-rust">limpar</button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                { l: "Aceitaram", v: stats.ace, cor: "text-moss" },
                { l: "Recusaram", v: stats.rec, cor: "text-rust" },
                { l: "Personaliz.", v: stats.per, cor: "text-amber" },
              ].map((s) => (
                <div key={s.l} className="rounded-md border border-sand bg-paper px-2.5 py-2 text-center">
                  <p className={`font-display text-[22px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
                  <p className="mt-1 text-[9.5px] font-bold tracking-wide text-ink-faint uppercase">{s.l}</p>
                </div>
              ))}
            </div>
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-[10.5px] font-bold text-ink-soft">
                <span>Taxa de aceite (total + parcial)</span>
                <span className="font-display text-moss">{stats.taxaAceite}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-paper-deep">
                <div className="bar-grow h-full rounded-full bg-moss transition-all duration-700" style={{ width: `${stats.taxaAceite}%` }} />
              </div>
            </div>
            <p className="mt-4 mb-1.5 text-[10px] font-extrabold tracking-[0.16em] text-ink-faint uppercase">Feed de eventos · {stats.total} no total</p>
            <ul className="max-h-[280px] flex-1 space-y-1.5 overflow-y-auto pr-1">
              {cookieEventos.slice(0, 18).map((e) => (
                <li key={e.id} className="anim-pop flex items-center justify-between gap-2 rounded-md border border-sand bg-paper px-2.5 py-2">
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-ink">
                      <span className={`rounded-full px-1.5 py-px text-[9px] font-extrabold uppercase ${TIPO_META[e.tipo]?.cls}`}>{TIPO_META[e.tipo]?.label ?? e.tipo}</span>
                      <span className="text-[9.5px] font-semibold text-ink-faint">{e.origem === "simulador" ? "preview" : "site"}</span>
                    </p>
                    {e.categorias && (
                      <p className="mt-0.5 truncate text-[10px] text-ink-faint">
                        {e.categorias.map((c) => CATEGORIAS_COOKIE.find((x) => x.id === c)?.curta).join(" · ")}
                      </p>
                    )}
                  </div>
                  <span className="shrink-0 text-[10px] font-semibold text-ink-faint tabular-nums">{fmtHora(e.ts)}</span>
                </li>
              ))}
              {cookieEventos.length === 0 && <p className="rounded-md border border-dashed border-sand px-3 py-6 text-center text-[11.5px] text-ink-faint">Nenhum evento ainda — interaja com o banner no preview.</p>}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* ===== linha 2: gerador de banner ===== */}
      <Reveal delay={60}>
        <div className="mt-3.5 grid gap-3.5 lg:grid-cols-2">
          <div className="rounded-lg border border-sand bg-cream p-5">
            <h2 className="font-display mb-1 text-[15px] font-bold text-ink">Gerador de banner</h2>
            <p className="mb-4 text-[11.5px] text-ink-soft">Configure e o script é regenerado na hora — o preview acima já usa esta configuração.</p>
            <div className="grid gap-3 sm:grid-cols-2">
              <Campo label="Domínio do site"><input className={inputCls} value={bannerConfig.siteNome} onChange={(e) => setBannerConfig({ siteNome: e.target.value })} placeholder="minhaloja.com.br" /></Campo>
              <Campo label="URL completa"><input className={inputCls} value={bannerConfig.siteUrl} onChange={(e) => setBannerConfig({ siteUrl: e.target.value })} placeholder="https://…" /></Campo>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Campo label="E-mail do DPO (política)"><input className={inputCls} value={bannerConfig.dpoEmail} onChange={(e) => setBannerConfig({ dpoEmail: e.target.value })} placeholder="dpo@empresa.com" /></Campo>
              <Campo label="Posição do banner">
                <select className={inputCls} value={bannerConfig.posicao} onChange={(e) => setBannerConfig({ posicao: e.target.value as "inferior" | "superior" })}>
                  <option value="inferior">Rodapé (recomendado)</option>
                  <option value="superior">Topo</option>
                </select>
              </Campo>
            </div>
            <div className="mt-3 rounded-md border border-pine-line/60 bg-pine/5 p-3">
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-extrabold tracking-[0.14em] text-pine uppercase">
                <Ic name="globe" size={11} sw={2.4} /> API do banner (envio automático para o Radar GRC)
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Campo label="Endpoint da API" hint="função serverless">
                  <input className={inputCls} value={bannerConfig.apiUrl} onChange={(e) => setBannerConfig({ apiUrl: e.target.value })} placeholder="/api/banner" />
                </Campo>
                <Campo label="Chave da organização" hint="identifica o cliente">
                  <input className={inputCls} value={bannerConfig.orgKey} onChange={(e) => setBannerConfig({ orgKey: e.target.value })} placeholder="rgc_cliente_xxxx" />
                </Campo>
              </div>
            </div>
            <div className="mt-3">
              <Campo label="Cor de destaque">
                <div className="flex items-center gap-2">
                  {CORES_BANNER.map((c) => (
                    <button key={c} onClick={() => setBannerConfig({ cor: c })} className={`size-8 rounded-md border-2 transition hover:scale-110 ${bannerConfig.cor === c ? "border-ink shadow-md" : "border-transparent"}`} style={{ background: c }} aria-label={`Cor ${c}`} />
                  ))}
                  <span className="ml-1 text-[11px] font-semibold text-ink-faint">{bannerConfig.cor}</span>
                </div>
              </Campo>
            </div>
            <div className="mt-3">
              <Campo label="Categorias exibidas" hint="necessários sempre ativos">
                <div className="flex flex-wrap gap-1.5">
                  {CATEGORIAS_COOKIE.map((c) => (
                    <ChipToggle
                      key={c.id}
                      ativo={bannerConfig.categorias.includes(c.id)}
                      onClick={() => {
                        if (c.id === "necessario") return;
                        const tem = bannerConfig.categorias.includes(c.id);
                        setBannerConfig({ categorias: tem ? bannerConfig.categorias.filter((x) => x !== c.id) : [...bannerConfig.categorias, c.id] });
                      }}
                    >
                      {c.curta}
                    </ChipToggle>
                  ))}
                </div>
              </Campo>
            </div>
            <div className="mt-3">
              <Campo label={`Aparecer após · ${(bannerConfig.atrasoMs / 1000).toFixed(1)}s`}>
                <input type="range" min={0} max={5000} step={100} value={bannerConfig.atrasoMs} onChange={(e) => setBannerConfig({ atrasoMs: +e.target.value })} className="w-full" />
              </Campo>
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-pine-line bg-pine-deep p-5 text-cream">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-cream">Instalação no site</h2>
              <span className="rounded-sm bg-lime px-2 py-0.5 text-[9.5px] font-extrabold tracking-widest text-pine uppercase">JS puro · 0 dependências</span>
            </div>
            <div className="space-y-2.5 text-[11.5px] leading-snug text-cream/70">
              <p><strong className="text-lime">1.</strong> Baixe o script e hospede no seu site (ou cole inline antes de <code className="rounded-sm bg-pine px-1 text-lime">&lt;/body&gt;</code>):</p>
            </div>
            <pre className="mt-2 overflow-x-auto rounded-md border border-pine-line bg-pine p-3 text-[10.5px] leading-relaxed text-lime/90">
              <code>{`<script src="/banner-cookies.js" defer></script>`}</code>
            </pre>
            <div className="mt-2.5 space-y-2.5 text-[11.5px] leading-snug text-cream/70">
              <p><strong className="text-lime">2.</strong> O banner exibe aceitar / recusar / personalizar com paridade (exigência CNIL) e bloqueia cookies não essenciais até o consentimento.</p>
              <p><strong className="text-lime">3.</strong> Cada escolha é enviada para este painel e registrada como evidência (timestamp + categorias + versão).</p>
            </div>
            <div className="mt-auto flex flex-wrap gap-2 pt-4">
              <button onClick={baixarBanner} className="inline-flex items-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[12.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
                <Ic name="download" size={14} sw={2.4} /> Baixar banner-cookies.js
              </button>
              <button onClick={copiar} className={`inline-flex items-center gap-2 rounded-md border px-4 py-2.5 text-[12.5px] font-bold transition active:scale-[0.98] ${copiado ? "border-lime bg-lime/15 text-lime" : "border-cream/25 text-cream hover:border-lime/60 hover:text-lime"}`}>
                <Ic name={copiado ? "check" : "doc"} size={14} sw={2.2} /> {copiado ? "Copiado!" : "Copiar código"}
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ===== linha 3: inventário + classificação IA ===== */}
      <Reveal delay={80}>
        <div className="mt-3.5 grid gap-3.5 lg:grid-cols-5">
          <div className="overflow-hidden rounded-lg border border-sand bg-cream lg:col-span-3">
            <div className="flex items-center justify-between border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[15px] font-bold text-ink">Inventário de cookies · {inventarioCookies.length}</h2>
              <span className="text-[10.5px] font-bold text-ink-faint">{inventarioCookies.filter((c) => c.origem === "terceiro").length} de terceiros</span>
            </div>
            <ul className="max-h-[330px] overflow-y-auto">
              {inventarioCookies.map((c) => {
                const cat = CATEGORIAS_COOKIE.find((x) => x.id === c.categoria)!;
                return (
                  <li key={c.id} className="group flex items-center gap-3 border-b border-sand/60 px-4 py-2.5 transition last:border-b-0 hover:bg-paper">
                    <span className="size-2 shrink-0 rounded-full" style={{ background: cat.cor }} />
                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-1.5 text-[12.5px] font-bold text-ink">
                        <code className="font-sans">{c.nome}</code>
                        {c.antesConsent && c.categoria !== "necessario" && <span className="rounded-sm bg-rust-soft px-1.5 py-px text-[8.5px] font-extrabold tracking-wide text-rust uppercase">pré-consent!</span>}
                        {c.dias > 390 && c.categoria !== "necessario" && <span className="rounded-sm bg-amber-soft px-1.5 py-px text-[8.5px] font-extrabold tracking-wide text-ink uppercase">&gt;13 meses</span>}
                      </p>
                      <p className="text-[10.5px] text-ink-faint">{c.provedor} · {c.duracao} · {c.origem === "proprio" ? "próprio" : "terceiro"}</p>
                    </div>
                    <span className="shrink-0 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold uppercase" style={{ background: `${cat.cor}1f`, color: cat.cor }}>{cat.curta}</span>
                    <button onClick={() => { removeCookie(c.id); toast(`Cookie "${c.nome}" removido do inventário.`, "warn"); }} className="shrink-0 rounded-md p-1 text-ink-faint opacity-0 transition group-hover:opacity-100 hover:text-rust" aria-label="Remover">
                      <Ic name="trash" size={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
            <div className="grid grid-cols-2 gap-2 border-t border-sand bg-paper p-3 sm:grid-cols-[1fr_1fr_auto_auto_auto]">
              <input className={inputCls} placeholder="Nome (ex.: _gcl_aw)" value={novo.nome} onChange={(e) => setNovo({ ...novo, nome: e.target.value })} />
              <input className={inputCls} placeholder="Provedor" value={novo.provedor} onChange={(e) => setNovo({ ...novo, provedor: e.target.value })} />
              <input className={inputCls} placeholder="Duração" value={novo.duracao} onChange={(e) => setNovo({ ...novo, duracao: e.target.value })} />
              <select className={inputCls} value={novo.categoria} onChange={(e) => setNovo({ ...novo, categoria: e.target.value as CategoriaCookie })}>
                {CATEGORIAS_COOKIE.map((c) => <option key={c.id} value={c.id}>{c.curta}</option>)}
              </select>
              <button onClick={addManual} className="inline-flex items-center justify-center gap-1.5 rounded-md bg-pine px-3 py-2 text-[12px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="plus" size={12} sw={2.6} /> Adicionar
              </button>
            </div>
          </div>

          <div className="rail-texture flex flex-col rounded-lg border border-pine-line bg-pine p-5 text-cream lg:col-span-2">
            <h2 className="font-display flex items-center gap-2 text-[15px] font-bold text-cream">
              <Ic name="spark" size={16} sw={2.2} className="text-lime" /> Classificar com IA
            </h2>
            <p className="mt-1 text-[11.5px] leading-snug text-cream/60">
              Cole os cookies vistos no DevTools do seu site (um por linha, ou <code className="rounded-sm bg-pine-deep px-1 text-lime">nome=valor</code>). A IA identifica categoria, provedor, duração e origem.
            </p>
            <textarea
              value={paste}
              onChange={(e) => setPaste(e.target.value)}
              placeholder={"_ga=GA1.2.123456\n_fbp=fb.1.169\nPHPSESSID=abc123\nhotjar_id=998877"}
              className="mt-3 min-h-[120px] flex-1 resize-y rounded-md border border-pine-line bg-pine-deep p-3 font-mono text-[11.5px] leading-relaxed text-lime/90 outline-none placeholder:text-cream/25 focus:border-lime/60"
            />
            <button onClick={classificar} disabled={classificando} className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[12.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98] disabled:opacity-70">
              {classificando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> : <Ic name="wand" size={14} sw={2.2} />}
              {classificando ? "Classificando…" : "Classificar e adicionar ao inventário"}
            </button>
          </div>
        </div>
      </Reveal>

      {/* ===== linha 4: IA de gestão ===== */}
      <Reveal delay={100}>
        <div className="mt-3.5 rounded-lg border border-sand bg-cream p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-[16px] font-bold text-ink">Gestão com IA</h2>
              <p className="text-[11.5px] text-ink-soft">Diagnóstico de conformidade (ePrivacy/GDPR/LGPD) sobre o inventário e os consentimentos coletados.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button onClick={analisar} disabled={analisando} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98] disabled:opacity-70">
                {analisando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-lime/30 border-t-lime" /> : <Ic name="spark" size={14} sw={2.2} />}
                {analisando ? "Analisando eventos…" : "Executar diagnóstico com IA"}
              </button>
              <button onClick={baixarPdfPolitica} className="inline-flex items-center gap-2 rounded-md border border-sand px-4 py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
                <Ic name="printer" size={14} /> Política (PDF)
              </button>
              <button onClick={baixarMdPolitica} className="inline-flex items-center gap-2 rounded-md border border-sand px-4 py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
                <Ic name="doc" size={14} /> Política (.md)
              </button>
            </div>
          </div>

          {diag && (
            <div className="anim-pop mt-4 grid gap-4 lg:grid-cols-[220px_1fr]">
              <div className="flex flex-col items-center rounded-lg border border-sand bg-paper p-4">
                <div className="relative">
                  <Ring value={diag.score} size={120} stroke={9} cor={diag.cor} />
                  <div className="absolute inset-0 grid place-items-center">
                    <p className="font-display text-[28px] font-extrabold text-ink">{diag.score}</p>
                  </div>
                </div>
                <p className="font-display mt-2 text-[14px] font-bold" style={{ color: diag.cor }}>{diag.nivel}</p>
                <p className="mt-1 text-center text-[10.5px] leading-snug text-ink-faint">{diag.total} eventos · {inventarioCookies.length} cookies analisados</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <p className="mb-2 text-[10.5px] font-extrabold tracking-[0.14em] text-rust uppercase">Problemas detectados</p>
                  <ul className="space-y-2">
                    {diag.problemas.map((p) => (
                      <li key={p.texto} className="rounded-md border border-sand bg-paper px-3 py-2.5">
                        <p className="flex items-start gap-2 text-[12px] leading-snug font-semibold text-ink">
                          <span className={`mt-0.5 shrink-0 rounded-sm px-1.5 py-px text-[8.5px] font-extrabold tracking-wide uppercase ${p.sev === "alta" ? "bg-rust text-cream" : p.sev === "media" ? "bg-amber-soft text-ink" : "bg-paper-deep text-ink-soft"}`}>{p.sev}</span>
                          {p.texto}
                        </p>
                        <p className="mt-1 pl-7 text-[10px] font-bold text-moss">{p.ref}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="mb-2 text-[10.5px] font-extrabold tracking-[0.14em] text-moss uppercase">Plano de ação da IA</p>
                  <ol className="space-y-1.5">
                    {diag.recomendacoes.map((r, i) => (
                      <li key={r} className="flex items-start gap-2.5 rounded-md bg-paper px-3 py-2 text-[12px] leading-snug text-ink-soft">
                        <span className="font-display mt-px shrink-0 text-[12px] font-extrabold text-moss">{String(i + 1).padStart(2, "0")}</span>
                        {r}
                      </li>
                    ))}
                  </ol>
                  <p className="mt-2 text-[10.5px] text-ink-faint">Aceite {diag.taxas.aceite}% · recusa {diag.taxas.recusa}% · personalizado {diag.taxas.personalizado}%</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Reveal>

      {/* ===== API & Integração ===== */}
      <Reveal delay={120}>
        <div className="mt-3.5 overflow-hidden rounded-lg border border-pine-line bg-pine text-cream">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-pine-line px-5 py-4">
            <div>
              <h2 className="font-display flex items-center gap-2 text-[16px] font-bold">
                <Ic name="globe" size={17} sw={2.2} className="text-lime" /> API do banner — mapeamento automático
              </h2>
              <p className="mt-0.5 text-[11.5px] text-cream/60">
                O banner do cliente envia consentimento + cookies para <code className="rounded-sm bg-pine-deep px-1.5 py-px text-lime">{bannerConfig.apiUrl || "/api/banner"}</code> · chave <code className="rounded-sm bg-pine-deep px-1.5 py-px text-lime">{bannerConfig.orgKey || "—"}</code>. A IA classifica e mapeia sozinha.
              </p>
            </div>
            <div className="flex items-center gap-2">
              {apiConn && (
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase ${apiConn.ok ? "bg-lime/15 text-lime" : "bg-rust/20 text-[#f0b39a]"}`}>
                  <span className={`size-1.5 rounded-full ${apiConn.ok ? "bg-lime pulse-dot" : "bg-[#f0b39a]"}`} />
                  {apiConn.ok ? "online" : "offline"}
                </span>
              )}
              <button onClick={testarConexao} disabled={testando} className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-3.5 py-2 text-[12px] font-bold text-cream transition hover:border-lime/60 hover:text-lime active:scale-[0.98] disabled:opacity-70">
                {testando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-cream/30 border-t-cream" /> : <Ic name="refresh" size={13} />}
                Testar conexão
              </button>
            </div>
          </div>

          {apiConn && !apiConn.ok && (
            <p className="border-b border-pine-line bg-pine-deep/60 px-5 py-2.5 text-[11px] text-[#f0b39a]">{apiConn.msg}</p>
          )}

          {/* pipeline vivo: site → api → ia → mapeamento */}
          <div className="grid gap-0 px-5 py-5 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {[
              { ic: "globe", t: "Site do cliente", d: "banner instalado" },
              { ic: "send", t: "API /api/banner", d: "POST eventos + cookies" },
              { ic: "spark", t: "Motor de IA", d: "classifica & avalia" },
              { ic: "layers", t: "Mapeamento GRC", d: "inventário + diagnóstico" },
            ].map((n, i) => (
              <div key={n.t} className="contents">
                <div className="flex items-center gap-3 rounded-lg border border-pine-line bg-pine-deep/70 px-3.5 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-lime/15 text-lime"><Ic name={n.ic} size={17} sw={2.1} /></span>
                  <span>
                    <span className="block text-[12.5px] leading-tight font-bold">{n.t}</span>
                    <span className="block text-[10px] text-cream/50">{n.d}</span>
                  </span>
                </div>
                {i < 3 && (
                  <div className="relative hidden h-0.5 w-full min-w-[28px] overflow-hidden rounded-full bg-pine-line md:block">
                    <span className="api-dot" style={{ animationDelay: `${i * 0.55}s` }} />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* métricas do feed + sincronização */}
          <div className="grid gap-4 border-t border-pine-line px-5 py-5 lg:grid-cols-[1fr_300px]">
            <div>
              <p className="mb-2 text-[10px] font-extrabold tracking-[0.16em] text-cream/50 uppercase">Feed recebido pela API{feed ? ` · ${feed.resumo.totalEventos} eventos · ${feed.resumo.totalCookies} cookies` : ""}</p>
              {feed ? (
                <>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {[
                      { l: "Eventos", v: String(feed.resumo.totalEventos) },
                      { l: "Cookies mapeados", v: String(feed.resumo.totalCookies) },
                      { l: "Taxa de aceite", v: `${feed.resumo.taxaAceite}%` },
                      { l: "Status", v: feed.resumo.conformidade },
                    ].map((s) => (
                      <div key={s.l} className="rounded-md border border-pine-line bg-pine-deep/70 px-3 py-2.5">
                        <p className="font-display text-[19px] leading-none font-extrabold text-lime">{s.v}</p>
                        <p className="mt-1 text-[9px] font-bold tracking-[0.1em] text-cream/45 uppercase">{s.l}</p>
                      </div>
                    ))}
                  </div>
                  <ul className="mt-3 max-h-[150px] space-y-1 overflow-y-auto pr-1">
                    {feed.eventos.slice(-8).reverse().map((e) => (
                      <li key={e.id} className="flex items-center justify-between gap-2 rounded-md bg-pine-deep/50 px-2.5 py-1.5 text-[11px]">
                        <span className="font-bold text-lime">{e.tipo.replace("_", " ")}</span>
                        <span className="text-cream/50">{e.site} · {new Date(e.ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}</span>
                      </li>
                    ))}
                    {feed.eventos.length === 0 && <li className="rounded-md bg-pine-deep/50 px-2.5 py-3 text-center text-[11px] text-cream/45">Aguardando o primeiro envio do site…</li>}
                  </ul>
                </>
              ) : (
                <p className="rounded-md border border-dashed border-pine-line px-4 py-6 text-center text-[11.5px] text-cream/45">
                  Teste a conexão para carregar o feed processado pela IA.
                </p>
              )}
            </div>
            <div className="flex flex-col justify-between rounded-lg border border-lime/30 bg-pine-deep/80 p-4">
              <div>
                <p className="text-[10px] font-extrabold tracking-[0.16em] text-lime uppercase">Automação</p>
                <p className="mt-1.5 text-[11.5px] leading-snug text-cream/70">
                  Ao sincronizar, a IA classifica todos os cookies recebidos, alimenta o inventário, importa os eventos e roda o diagnóstico de conformidade — sem ação manual.
                </p>
              </div>
              <button onClick={sincronizarComIa} disabled={sincronizando} className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[12.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98] disabled:opacity-70">
                {sincronizando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> : <Ic name="wand" size={14} sw={2.2} />}
                {sincronizando ? "Mapeando com IA…" : "Sincronizar & Mapear com IA"}
              </button>
            </div>
          </div>
        </div>
      </Reveal>

      <Modal aberto={isoAberto} onFechar={() => setIsoAberto(false)} titulo="Checklist de implementação — Cookies (ePrivacy/GDPR)" largura="max-w-4xl">
        <Iso ids={["cookies"]} />
      </Modal>
    </div>
  );
}
