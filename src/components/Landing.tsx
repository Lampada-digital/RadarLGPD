import { useEffect, useMemo, useState } from "react";
import type { FormEvent, ReactNode } from "react";
import { TODAS_BASES } from "../domain";
import { analisarLGPD } from "../ai";
import { Ic, Reveal, useCountUp } from "./ui";

const NORMAS = ["LGPD · Lei 13.709/18", "GDPR · UE 2016/679", "ISO/IEC 27001", "ISO/IEC 27701", "ISO/IEC 27002", "SOC 2 Type II", "PCI-DSS v4.0"];

/* ---------------- navegação ---------------- */
function Nav({ onAcessar }: { onAcessar: () => void }) {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const f = () => setRolou(window.scrollY > 24);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${rolou ? "border-b border-pine-line bg-pine/95 shadow-lg backdrop-blur-md" : "bg-transparent"}`}>
      <div className="mx-auto flex max-w-[1160px] items-center justify-between px-5 py-3.5">
        <a href="#topo" className="flex items-center gap-2.5">
          <span className="relative grid size-9 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine-deep">
            <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
            <Ic name="radar" size={19} className="relative text-lime" sw={1.9} />
          </span>
          <span className="font-display text-[17px] font-extrabold tracking-tight text-cream">Radar<span className="text-lime">GRC</span></span>
        </a>
        <nav className="hidden items-center gap-7 lg:flex">
          {[["#plataforma", "Plataforma"], ["#demonstracao", "Demonstração"], ["#precos", "Planos"], ["#seguranca", "Segurança"], ["#faq", "FAQ"]].map(([h, l]) => (
            <a key={h} href={h} className="text-[13px] font-semibold text-cream/70 transition hover:text-lime">{l}</a>
          ))}
        </nav>
        <button onClick={onAcessar} className="inline-flex items-center gap-2 rounded-md bg-lime px-4 py-2 text-[13px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.97]">
          Acessar sistema <Ic name="arrow" size={14} sw={2.4} />
        </button>
      </div>
    </header>
  );
}

/* ---------------- abertura: o radar em ação ---------------- */
const DETECCOES = [
  { t: "Folha de pagamento", d: "dados sensíveis · Art. 11", z: "alto" },
  { t: "CFTV na portaria", d: "imagem · legítimo interesse", z: "médio" },
  { t: "CRM de vendas", d: "12.400 titulares mapeados", z: "baixo" },
  { t: "Telemedicina", d: "saúde · RIPD obrigatório", z: "alto" },
  { t: "Newsletter marketing", d: "consentimento · opt-in", z: "baixo" },
];
const COR_ZONA: Record<string, string> = { alto: "text-rust", médio: "text-amber", baixo: "text-lime" };

function RadarHero({ onAcessar }: { onAcessar: () => void }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2400);
    return () => clearInterval(id);
  }, []);
  const det = DETECCOES[tick % DETECCOES.length];
  return (
    <section id="topo" className="rail-texture relative overflow-hidden bg-pine pb-20 pt-32 text-cream">
      <div className="pointer-events-none absolute -top-40 -right-40 size-[560px] rounded-full border border-lime/10" />
      <div className="pointer-events-none absolute -top-24 -right-24 size-[380px] rounded-full border border-lime/15" />
      <div className="mx-auto grid max-w-[1160px] items-center gap-12 px-5 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.18em] text-lime uppercase">
            <span className="pulse-dot inline-block size-1.5 rounded-full bg-lime" /> LGPD · GDPR · ISO · com IA
          </p>
          <h1 className="font-display text-[40px] leading-[1.04] font-extrabold tracking-tight sm:text-[54px]">
            Todo dado pessoal da sua empresa, <span className="text-lime">no radar.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-cream/70">
            Mapeamento de dados, registro de operações, matriz de risco e programas ISO em um só painel — com uma IA que classifica cada tratamento e aponta a base legal certa.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={onAcessar} className="group inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3 text-[14px] font-extrabold text-pine shadow-[0_16px_36px_-14px_rgba(201,233,79,0.55)] transition hover:bg-lime-soft active:scale-[0.98]">
              Testar 7 dias grátis <Ic name="arrow" size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#demonstracao" className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-6 py-3 text-[14px] font-bold text-cream transition hover:border-lime/60 hover:text-lime">
              <Ic name="spark" size={15} sw={2.2} /> Ver a IA em ação
            </a>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-[12px] font-semibold text-cream/50">
            <span className="inline-flex items-center gap-1.5"><Ic name="check" size={13} sw={2.6} className="text-lime" /> Sem cartão de crédito</span>
            <span className="inline-flex items-center gap-1.5"><Ic name="check" size={13} sw={2.6} className="text-lime" /> Dados 100% no navegador</span>
            <span className="inline-flex items-center gap-1.5"><Ic name="check" size={13} sw={2.6} className="text-lime" /> E-mail corporativo</span>
          </div>
        </div>

        {/* o radar */}
        <div className="relative mx-auto w-full max-w-[440px]">
          <div className="relative aspect-square rounded-full border border-lime/25 bg-pine-deep/60 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)]">
            <div className="absolute inset-[12%] rounded-full border border-lime/15" />
            <div className="absolute inset-[26%] rounded-full border border-lime/12" />
            <div className="absolute inset-[40%] rounded-full border border-lime/10" />
            <div className="radar-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.3), transparent 70deg)" }} />
            {/* blips */}
            {[
              { top: "22%", left: "60%", cor: "bg-rust" },
              { top: "38%", left: "28%", cor: "bg-amber" },
              { top: "58%", left: "70%", cor: "bg-lime" },
              { top: "70%", left: "38%", cor: "bg-lime" },
              { top: "30%", left: "74%", cor: "bg-amber" },
            ].map((b, i) => (
              <span key={i} className={`pulse-dot absolute size-2.5 rounded-full ${b.cor}`} style={{ top: b.top, left: b.left, animationDelay: `${i * 0.5}s` }} />
            ))}
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-3 place-items-center rounded-full bg-lime" />
            </div>
          </div>
          {/* card de detecção ao vivo */}
          <div key={tick} className="anim-slide-left absolute -bottom-5 left-1/2 flex w-[86%] -translate-x-1/2 items-center justify-between gap-3 rounded-lg border border-pine-line bg-pine px-4 py-3 shadow-xl">
            <div className="min-w-0">
              <p className="truncate text-[13px] font-bold text-cream">{det.t}</p>
              <p className="truncate text-[11px] text-cream/55">{det.d}</p>
            </div>
            <span className={`font-display shrink-0 text-[12px] font-extrabold uppercase ${COR_ZONA[det.z]}`}>{det.z}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- letreiro de normas ---------------- */
function Marquee() {
  return (
    <div className="marquee overflow-hidden border-y border-pine-line bg-pine-deep py-3.5">
      <div className="marquee-track flex w-max items-center gap-10 whitespace-nowrap">
        {[...NORMAS, ...NORMAS].map((n, i) => (
          <span key={i} className="flex items-center gap-10 text-[12px] font-bold tracking-[0.12em] text-cream/40 uppercase">
            {n} <span className="text-lime/50">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

/* ---------------- o custo de não mapear ---------------- */
function Stat({ v, suf, l, cor = "text-ink" }: { v: number; suf?: string; l: string; cor?: string }) {
  const n = useCountUp(v, 1100);
  return (
    <div className="border-l-2 border-sand pl-4 transition-colors hover:border-moss">
      <p className={`font-display text-[34px] leading-none font-extrabold ${cor}`}>{n}{suf}</p>
      <p className="mt-1.5 text-[12px] font-semibold text-ink-soft">{l}</p>
    </div>
  );
}

function Problema() {
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
          <Reveal>
            <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-rust uppercase">O risco é real e mensurável</p>
            <h2 className="font-display text-[32px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">
              Quem não mapeia, <span className="text-rust">não sabe o que expõe.</span>
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
              A multa é só a parte visível. Sem um registro das operações de tratamento, você não responde à ANPD, não atende o titular no prazo e não prova conformidade em auditoria.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                ["Multas de até 2% do faturamento", "teto de R$ 50 milhões por infração na LGPD"],
                ["72 horas para notificar incidentes", "prazo do GDPR junto à autoridade europeia"],
                ["15 dias para responder titulares", "art. 19 da LGPD, sob pena de sanção"],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-sm bg-rust/10 text-rust"><Ic name="alert" size={12} sw={2.4} /></span>
                  <p className="text-[13.5px] leading-snug text-ink-soft"><strong className="text-ink">{t}</strong> — {d}.</p>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            <div className="grid grid-cols-2 gap-x-8 gap-y-9 rounded-xl border border-sand bg-cream p-8 shadow-[0_24px_60px_-30px_rgba(19,46,38,0.35)] sm:grid-cols-2">
              <Stat v={50} suf=" mi" l="teto de multa LGPD (R$)" cor="text-rust" />
              <Stat v={4} suf="%" l="do faturamento global (GDPR)" cor="text-amber" />
              <Stat v={72} suf="h" l="para notificar um incidente" />
              <Stat v={15} suf="d" l="para responder ao titular" cor="text-moss" />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- plataforma ---------------- */
const PILARES = [
  { id: "lgpd", ic: "layers", cor: "#2e6b54", t: "LGPD · Brasil", d: "Registro das operações (art. 37), bases legais dos arts. 7º e 11, matriz de risco 5×5 e fila de titulares com prazo de 15 dias.", pts: ["Registro art. 37", "Matriz de risco", "Titulares"] },
  { id: "gdpr", ic: "globe", cor: "#1f4e8f", t: "GDPR · União Europeia", d: "ROPA do Art. 30 com bases do Art. 6 e condições do Art. 9, transferência internacional e prazo de 30 dias.", pts: ["ROPA Art. 30", "Art. 6 e 9", "Transferências"] },
  { id: "iso", ic: "brain", cor: "#7a4f8f", t: "ISO & Certificações", d: "Programas de implementação da ISO 27001, 27701 e 27002, SOC 2 Type II e PCI-DSS, controle a controle.", pts: ["27001 · 27701 · 27002", "SOC 2", "PCI-DSS"] },
  { id: "ia", ic: "spark", cor: "#c98a1f", t: "IA de classificação", d: "Descreva a operação e a IA identifica os dados, recomenda a base legal, define retenção e calcula o risco.", pts: ["Base legal", "Retenção", "Risco"] },
];

function Plataforma() {
  const [ativo, setAtivo] = useState("lgpd");
  const p = PILARES.find((x) => x.id === ativo)!;
  return (
    <section id="plataforma" className="relative overflow-hidden bg-cream py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Uma plataforma, todas as frentes</p>
          <h2 className="font-display mx-auto max-w-2xl text-center text-[32px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">
            Do inventário de dados ao <span style={{ color: p.cor }}>documento de auditoria.</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          {/* seletor vertical */}
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
            {PILARES.map((pl) => (
              <button
                key={pl.id}
                onClick={() => setAtivo(pl.id)}
                className={`group flex items-center gap-4 rounded-lg border px-5 py-4 text-left transition-all duration-200 ${ativo === pl.id ? "border-ink bg-pine shadow-lg" : "border-sand bg-cream hover:border-moss/40 hover:-translate-y-0.5"}`}
              >
                <span className="grid size-11 shrink-0 place-items-center rounded-md transition" style={{ background: `${pl.cor}1a`, color: pl.cor }}>
                  <Ic name={pl.ic} size={22} sw={1.9} />
                </span>
                <span>
                  <span className={`font-display block text-[15px] font-bold ${ativo === pl.id ? "text-cream" : "text-ink"}`}>{pl.t}</span>
                  <span className={`block text-[11.5px] ${ativo === pl.id ? "text-cream/60" : "text-ink-soft"}`}>{pl.pts.join(" · ")}</span>
                </span>
                <Ic name="arrow" size={16} className={`ml-auto shrink-0 transition-all ${ativo === pl.id ? "text-lime" : "text-sand group-hover:translate-x-1 group-hover:text-moss"}`} />
              </button>
            ))}
          </div>
          {/* painel de detalhe */}
          <div key={ativo} className="anim-pop flex flex-col justify-between rounded-xl border border-pine-line bg-pine p-8 text-cream shadow-[0_30px_70px_-30px_rgba(19,46,38,0.6)]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid size-12 place-items-center rounded-lg border border-lime/30 bg-pine-deep" style={{ color: p.cor }}>
                  <Ic name={p.ic} size={24} sw={1.9} />
                </span>
                <h3 className="font-display text-[24px] font-extrabold">{p.t}</h3>
              </div>
              <p className="mt-5 text-[15px] leading-relaxed text-cream/75">{p.d}</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {p.pts.map((pt) => (
                <span key={pt} className="inline-flex items-center gap-1.5 rounded-full border border-cream/20 bg-pine-deep/70 px-3.5 py-1.5 text-[12px] font-bold text-cream/80">
                  <Ic name="check" size={12} sw={2.8} className="text-lime" /> {pt}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- demonstração interativa da IA ---------------- */
const EXEMPLOS = [
  "Processar a folha de pagamento dos funcionários com dados de saúde e salário",
  "Enviar newsletter de marketing para clientes com e-mail e nome",
  "Gravar imagens de CFTV na portaria do prédio",
];

function DemoIa() {
  const [txt, setTxt] = useState(EXEMPLOS[0]);
  const r = useMemo(() => (txt.trim() ? analisarLGPD(txt) : null), [txt]);
  const base = r ? TODAS_BASES.find((b) => b.id === r.baseRecomendada) : null;
  return (
    <section id="demonstracao" className="rail-texture bg-pine py-20 text-cream">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-lime uppercase">Experimente agora — sem cadastro</p>
          <h2 className="font-display mx-auto max-w-2xl text-center text-[32px] leading-tight font-extrabold tracking-tight sm:text-[40px]">
            A IA classifica a operação <span className="text-lime">enquanto você descreve.</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          {/* terminal */}
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-pine-line bg-pine-deep shadow-2xl">
              <div className="flex items-center gap-2 border-b border-pine-line bg-pine px-4 py-3">
                <span className="size-2.5 rounded-full bg-rust/80" /><span className="size-2.5 rounded-full bg-amber/80" /><span className="size-2.5 rounded-full bg-moss/80" />
                <span className="ml-2 text-[11px] font-bold tracking-wide text-cream/50">radar-grc · assistente</span>
              </div>
              <div className="p-5">
                <p className="mb-3 text-[11px] font-bold tracking-[0.14em] text-lime uppercase">Descreva uma operação de tratamento</p>
                <textarea
                  value={txt}
                  onChange={(e) => setTxt(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-lg border border-pine-line bg-pine p-4 text-[13.5px] leading-relaxed text-cream outline-none transition placeholder:text-cream/30 focus:border-lime/60"
                  placeholder="Ex.: armazenar currículos de candidatos com nome, e-mail e telefone…"
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  {EXEMPLOS.map((e) => (
                    <button key={e} onClick={() => setTxt(e)} className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition ${txt === e ? "border-lime bg-lime/15 text-lime" : "border-cream/20 text-cream/60 hover:border-lime/50 hover:text-lime"}`}>
                      {e.length > 34 ? e.slice(0, 34) + "…" : e}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
          {/* resultado */}
          <Reveal delay={100}>
            <div className="rounded-xl border border-pine-line bg-pine-deep/70 p-6">
              {r ? (
                <div key={txt} className="anim-rise space-y-4">
                  <div>
                    <p className="mb-2 text-[10.5px] font-bold tracking-[0.16em] text-cream/45 uppercase">Dados identificados · {r.dados.length}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {r.dados.map((d) => (
                        <span key={d} className="rounded-md bg-lime/15 px-2.5 py-1 text-[11.5px] font-bold text-lime capitalize">{d}</span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-[10.5px] font-bold tracking-[0.16em] text-cream/45 uppercase">Base legal recomendada</p>
                    <p className="text-[14px] font-bold text-cream">{base ? `${base.inciso} — ${base.titulo}` : "—"}</p>
                    <p className="mt-1 text-[11.5px] leading-snug text-cream/55">{r.bases[0]?.rationale}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg border border-pine-line bg-pine p-3">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-cream/45 uppercase">Retenção</p>
                      <p className="mt-1 text-[12.5px] font-bold text-cream">{r.retencao}</p>
                    </div>
                    <div className="rounded-lg border border-pine-line bg-pine p-3">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-cream/45 uppercase">Risco</p>
                      <p className={`mt-1 text-[12.5px] font-extrabold ${r.score >= 12 ? "text-rust" : r.score >= 6 ? "text-amber" : "text-lime"}`}>{r.score}/25</p>
                    </div>
                  </div>
                  {r.alertas.length > 0 && (
                    <div className="rounded-lg border border-amber/40 bg-amber/10 p-3">
                      <p className="flex items-center gap-1.5 text-[11.5px] font-bold text-amber"><Ic name="alert" size={13} sw={2.4} /> Atenção</p>
                      <p className="mt-1 text-[11.5px] leading-snug text-cream/70">{r.alertas[0]}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="py-10 text-center text-[13px] text-cream/50">Descreva uma operação para ver a análise…</p>
              )}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- planos ---------------- */
const PLANOS = [
  { n: "Standard", p: "R$ 79,00", d: "Privacidade essencial para começar.", f: ["LGPD ilimitado (art. 37)", "GDPR ilimitado (ROPA art. 30)", "Matriz de risco em tempo real", "Fila de titulares", "Até 3 usuários"], cor: "#2f7f74", destaque: false },
  { n: "Business", p: "R$ 149,00", d: "Frameworks, IA e documentos de auditoria.", f: ["Tudo do Standard", "ISO 27001 · 27701 · 27002", "SOC 2 + PCI-DSS", "Assistente de IA ilimitado", "Políticas em PDF", "Até 10 usuários"], cor: "#2e6b54", destaque: true },
  { n: "Completo", p: "R$ 249,00", d: "Tudo, sem nenhum limite.", f: ["Tudo do Business", "Governança avançada", "Usuários ilimitados", "Suporte prioritário", "Onboarding assistido"], cor: "#c98a1f", destaque: false },
];

function Precos({ onAcessar }: { onAcessar: () => void }) {
  return (
    <section id="precos" className="bg-paper py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Preço fixo mensal, sem surpresa</p>
          <h2 className="font-display mx-auto max-w-2xl text-center text-[32px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">
            Comece grátis por 7 dias. <span className="text-moss">Evolua quando fizer sentido.</span>
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {PLANOS.map((pl, i) => (
            <Reveal key={pl.n} delay={i * 90}>
              <div className={`relative flex h-full flex-col rounded-xl border p-7 transition-all duration-200 hover:-translate-y-1.5 ${pl.destaque ? "border-lime bg-pine text-cream shadow-[0_36px_80px_-30px_rgba(19,46,38,0.65)]" : "border-sand bg-cream text-ink hover:border-moss/50 hover:shadow-[0_24px_50px_-28px_rgba(19,46,38,0.4)]"}`}>
                {pl.destaque && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-lime px-4 py-1 text-[10px] font-extrabold tracking-[0.14em] text-pine uppercase shadow">Mais vendido</span>
                )}
                <p className="text-[11px] font-extrabold tracking-[0.16em] uppercase" style={{ color: pl.destaque ? "#c9e94f" : pl.cor }}>{pl.n}</p>
                <p className="font-display mt-3 text-[40px] leading-none font-extrabold">{pl.p}<span className={`ml-1 text-[14px] font-bold ${pl.destaque ? "text-cream/55" : "text-ink-faint"}`}>/mês</span></p>
                <p className={`mt-2 text-[12.5px] ${pl.destaque ? "text-cream/65" : "text-ink-soft"}`}>{pl.d}</p>
                <ul className="mt-6 flex-1 space-y-2.5">
                  {pl.f.map((f) => (
                    <li key={f} className={`flex gap-2.5 text-[13px] ${pl.destaque ? "text-cream/85" : "text-ink-soft"}`}>
                      <Ic name="check" size={15} sw={2.6} className={`mt-0.5 shrink-0 ${pl.destaque ? "text-lime" : "text-moss"}`} /> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={onAcessar} className={`mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md py-2.5 text-[13.5px] font-extrabold transition active:scale-[0.98] ${pl.destaque ? "bg-lime text-pine hover:bg-lime-soft" : "border border-ink/15 bg-paper text-ink hover:border-moss hover:text-moss"}`}>
                  {pl.destaque ? "Assinar Business" : `Começar ${pl.n}`}
                </button>
              </div>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-center text-[12px] text-ink-faint">Trial de 7 dias em modo visualização · ativação dentro do sistema · cancele quando quiser</p>
      </div>
    </section>
  );
}

/* ---------------- segurança ---------------- */
function Seguranca() {
  const itens = [
    { ic: "lock", t: "Somente e-mail corporativo", d: "Bloqueio de provedores gratuitos no acesso." },
    { ic: "key", t: "Senha forte + bloqueio", d: "Hash SHA-256 com salt e trava anti força-bruta." },
    { ic: "shield", t: "Trilha de auditoria", d: "Cada ação registrada e exportável." },
    { ic: "eye", t: "Proteção anticópia", d: "Bloqueio de inspeção e clonagem da interface." },
  ];
  return (
    <section id="seguranca" className="bg-cream py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Segurança de ponta a ponta</p>
            <h2 className="font-display text-[32px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">
              Feito para quem <span className="text-moss">cobra conformidade.</span>
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
              Um sistema de governança precisa ser, ele mesmo, um exemplo de segurança. Acesso restrito a e-mail corporativo, credenciais com hash forte, trilha de auditoria completa e uma camada anticópia que desincentiva a clonagem da interface.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-4">
              {itens.map((it) => (
                <div key={it.t} className="group rounded-lg border border-sand bg-paper p-4 transition hover:-translate-y-0.5 hover:border-moss/50">
                  <span className="grid size-9 place-items-center rounded-md bg-moss/10 text-moss transition group-hover:bg-pine group-hover:text-lime"><Ic name={it.ic} size={18} sw={2} /></span>
                  <p className="mt-2.5 text-[13px] font-bold text-ink">{it.t}</p>
                  <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{it.d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rail-texture rounded-xl border border-pine-line bg-pine p-8 text-cream shadow-[0_30px_70px_-30px_rgba(19,46,38,0.6)]">
              <p className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.18em] text-lime uppercase"><Ic name="shield" size={14} sw={2.4} /> Sessão protegida</p>
              <div className="mt-5 space-y-3">
                {[
                  ["Autenticação", "hash SHA-256 + salt", true],
                  ["Acesso corporativo", "domínios gratuitos bloqueados", true],
                  ["Anti força-bruta", "bloqueio progressivo ativo", true],
                  ["Auditoria", "registro contínuo de eventos", true],
                ].map(([t, d]) => (
                  <div key={t as string} className="flex items-center justify-between rounded-lg border border-pine-line bg-pine-deep/70 px-4 py-3">
                    <div>
                      <p className="text-[13px] font-bold text-cream">{t as string}</p>
                      <p className="text-[11px] text-cream/50">{d as string}</p>
                    </div>
                    <span className="grid size-6 place-items-center rounded-full bg-lime/20 text-lime"><Ic name="check" size={13} sw={2.8} /></span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FAQ ---------------- */
const FAQ = [
  { q: "Como funciona o trial de 7 dias?", a: "Ao se cadastrar com e-mail corporativo você entra em modo visualização por 7 dias: pode explorar os registros de exemplo, a matriz e os programas ISO. Para criar e editar, escolha um plano dentro do próprio sistema." },
  { q: "Preciso de cartão de crédito para testar?", a: "Não. O trial é gratuito e sem cartão. A assinatura só é ativada quando você escolhe um plano dentro do sistema." },
  { q: "Meus dados saem do navegador?", a: "Não. Nesta edição, todo o processamento — inclusive a IA — roda localmente no seu navegador. Nada é enviado a servidores externos." },
  { q: "Posso trocar de plano depois?", a: "Sim. Você pode evoluir do Standard para o Business ou Completo a qualquer momento, com liberação imediata das funcionalidades." },
  { q: "Serve para empresas que atuam na Europa?", a: "Sim. Além da LGPD, o sistema cobre o GDPR: ROPA do Art. 30, bases do Art. 6 e 9, transferências internacionais e o prazo de 30 dias." },
];

function Faq() {
  const [aberto, setAberto] = useState(0);
  return (
    <section id="faq" className="bg-cream pb-20">
      <div className="mx-auto max-w-[760px] px-5">
        <Reveal>
          <h2 className="font-display text-center text-[32px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">Perguntas frequentes</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <div className={`overflow-hidden rounded-lg border transition-colors ${aberto === i ? "border-moss bg-cream" : "border-sand bg-paper"}`}>
                <button onClick={() => setAberto(aberto === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-[14.5px] font-bold text-ink">{f.q}</span>
                  <Ic name="plus" size={17} sw={2.4} className={`shrink-0 text-moss transition-transform duration-300 ${aberto === i ? "rotate-45" : ""}`} />
                </button>
                {aberto === i && <p className="anim-rise px-5 pb-4 text-[13.5px] leading-relaxed text-ink-soft">{f.a}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ---------------- CTA final + rodapé ---------------- */
function Cta({ onAcessar }: { onAcessar: () => void }) {
  return (
    <section className="rail-texture relative overflow-hidden bg-pine py-20 text-cream">
      <div className="pointer-events-none absolute -bottom-32 -left-24 size-[440px] rounded-full border border-lime/10" />
      <div className="mx-auto max-w-[860px] px-5 text-center">
        <Reveal>
          <h2 className="font-display text-[34px] leading-tight font-extrabold tracking-tight sm:text-[46px]">
            A ANPD não avisa <span className="text-lime">quando vai fiscalizar.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-cream/70">
            Esteja com o mapeamento pronto antes da primeira notificação. Comece hoje, em modo visualização, sem cartão.
          </p>
          <button onClick={onAcessar} className="group mt-8 inline-flex items-center gap-2.5 rounded-md bg-lime px-8 py-3.5 text-[15px] font-extrabold text-pine shadow-[0_20px_44px_-16px_rgba(201,233,79,0.55)] transition hover:bg-lime-soft active:scale-[0.98]">
            Começar meu mapeamento <Ic name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
          </button>
          <p className="mt-4 text-[11.5px] text-cream/45">7 dias grátis · e-mail corporativo · cancele quando quiser</p>
        </Reveal>
      </div>
    </section>
  );
}

function Rodape({ onAcessar }: { onAcessar: () => void }) {
  return (
    <footer className="bg-pine-deep py-12 text-cream">
      <div className="mx-auto max-w-[1160px] px-5">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row">
          <div className="max-w-xs">
            <div className="flex items-center gap-2.5">
              <span className="relative grid size-9 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine">
                <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
                <Ic name="radar" size={19} className="relative text-lime" sw={1.9} />
              </span>
              <span className="font-display text-[17px] font-extrabold tracking-tight">Radar<span className="text-lime">GRC</span></span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-cream/50">Privacidade e conformidade sob o mesmo radar. LGPD, GDPR e programas ISO com IA — tudo no seu navegador.</p>
          </div>
          <div className="flex gap-14">
            <div>
              <p className="mb-3 text-[10.5px] font-extrabold tracking-[0.16em] text-cream/40 uppercase">Produto</p>
              {[["#plataforma", "Plataforma"], ["#demonstracao", "Demonstração"], ["#precos", "Planos"]].map(([h, l]) => (
                <a key={h} href={h} className="block py-1 text-[12.5px] text-cream/65 transition hover:text-lime">{l}</a>
              ))}
            </div>
            <div>
              <p className="mb-3 text-[10.5px] font-extrabold tracking-[0.16em] text-cream/40 uppercase">Acesso</p>
              <button onClick={onAcessar} className="block py-1 text-[12.5px] text-cream/65 transition hover:text-lime">Entrar</button>
              <button onClick={onAcessar} className="block py-1 text-[12.5px] text-cream/65 transition hover:text-lime">Criar conta</button>
              <a href="#faq" className="block py-1 text-[12.5px] text-cream/65 transition hover:text-lime">FAQ</a>
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-cream/10 pt-6 text-[11px] text-cream/40">
          <p>© 2026 Radar GRC — sistema proprietário. Conteúdo protegido.</p>
          <p className="flex items-center gap-1.5"><Ic name="shield" size={12} sw={2.2} className="text-lime/70" /> Feito no Brasil 🇧🇷</p>
        </div>
      </div>
    </footer>
  );
}

export default function Landing({ onAcessar }: { onAcessar: () => void }) {
  return (
    <div className="protegido min-h-screen bg-paper">
      <Nav onAcessar={onAcessar} />
      <RadarHero onAcessar={onAcessar} />
      <Marquee />
      <Problema />
      <Plataforma />
      <DemoIa />
      <Precos onAcessar={onAcessar} />
      <Seguranca />
      <Faq />
      <Cta onAcessar={onAcessar} />
      <Rodape onAcessar={onAcessar} />
    </div>
  );
}
