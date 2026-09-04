import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { analisar } from "../ai";
import type { AnaliseIA } from "../ai";
import { CATEGORIAS_DADOS, ZONA_META } from "../types";
import { PRECO_MENSAL, TRIAL_DIAS } from "../auth";
import { Ic, Reveal, useCountUp } from "./ui";

/* ============ dados do site ============ */

const NORMAS = [
  "LGPD · Lei 13.709", "GDPR · UE 2016/679", "ISO/IEC 27001", "ISO/IEC 27002", "ISO/IEC 27017",
  "ISO/IEC 27701", "ISO 31000", "ISO 37001", "ISO 37301", "SOC 2 Type II", "PCI-DSS v4.0", "EU AI Act", "ePrivacy",
];

const DETECCOES = [
  { t: "Folha de pagamento", d: "Art. 7º, II · risco 6 · 680 titulares", cor: "var(--color-moss)" },
  { t: "Telemedicina interna", d: "Art. 11, II, “f” · risco 15 · RIPD emitido", cor: "var(--color-rust)" },
  { t: "CRM e prospecção", d: "Art. 7º, IX · risco 9 · 12.400 leads", cor: "var(--color-amber)" },
  { t: "ROPA — EU Payroll", d: "Art. 30 GDPR · base 6(1)(b) · SCCs vigentes", cor: "#8fb8f0" },
  { t: "ISO 27001 · A.8.13", d: "Backup verificado · evidência anexada", cor: "var(--color-lime)" },
];

const PILARES = [
  {
    id: "lgpd", ic: "scale", cor: "var(--color-moss)", tag: "Brasil",
    nome: "LGPD — Lei Geral de Proteção de Dados",
    desc: "Do registro de operações à fila de titulares, tudo que a ANPD espera encontrar numa fiscalização.",
    bullets: ["Registro de tratamento (art. 37) com base legal e retenção", "Matriz de risco 5×5 e RIPD (art. 38)", "Fila de titulares com prazo de 15 dias (art. 19)", "As 18 bases legais com uso real mapeado"],
  },
  {
    id: "gdpr", ic: "globe", cor: "#8fb8f0", tag: "União Europeia",
    nome: "GDPR — Regulamento Geral (UE)",
    desc: "ROPA do Art. 30, bases do Art. 6/9, DPIA e transferências internacionais num só lugar.",
    bullets: ["ROPA (Art. 30) com finalidades e destinatários", "Bases de licitude Art. 6 e condições Art. 9", "DPIA guiada pelos critérios WP248", "Transferências (Cap. V) com SCCs e TIA"],
  },
  {
    id: "iso", ic: "brain", cor: "var(--color-lime)", tag: "Certificações",
    nome: "11 frameworks & normas ISO",
    desc: "Programas de implementação completos, do SGSI ao antissuborno, com evidência por controle.",
    bullets: ["ISO 27001/27002/27017/27701 · 31000/37001/37301", "SOC 2 Type II (Trust Services Criteria)", "PCI-DSS v4.0 (12 requisitos)", "Pacote documental em PDF pronto p/ auditor"],
  },
  {
    id: "ia", ic: "spark", cor: "var(--color-amber)", tag: "Inteligência Artificial",
    nome: "IA de conformidade nativa",
    desc: "Descreva a operação em português e a IA classifica dados, base legal, risco e salvaguardas.",
    bullets: ["Classificação de operações em segundos", "Recomendação de base legal fundamentada", "Planos de implementação gerados por gaps", "Roda 100% no navegador — nada sai dali"],
  },
  {
    id: "cookies", ic: "filter", cor: "#c9a0e8", tag: "Sites dos clientes",
    nome: "Gestão de Cookies com API",
    desc: "Banner pronto para o site do cliente + API que alimenta o mapeamento automaticamente.",
    bullets: ["Banner com paridade (aceitar = recusar)", "API serverless recebe consentimentos", "IA classifica e mapeia sozinha", "Inventário e política em PDF"],
  },
];

const DEPOIMENTOS = [
  { n: "Renata K.", c: "DPO · Fintech (240 func.)", t: "Migramos 3 planilhas caóticas para o Radar em uma tarde. Na auditoria da ISO 27701, o pacote de políticas em PDF foi elogiado pelo auditor.", off: "lg:mt-0" },
  { n: "Caio M.", c: "Head de Compliance · E-commerce", t: "O prazo de 15 dias das solicitações de titulares era meu maior risco. Hoje a fila anda sozinha e eu só olho o que está a 5 dias de vencer.", off: "lg:mt-10" },
  { n: "Lívia S.", c: "CISO · Saúde digital", t: "A IA classificou 200 operações de tratamento em minutos. O que levaria semanas de consultoria saiu com base legal e risco já sugeridos.", off: "lg:mt-4" },
];

const FAQ = [
  { q: "Preciso de conhecimento jurídico para usar?", a: "Não. O sistema guia cada etapa com a base legal sugerida pela IA e explica o porquê. Você revisa e aprova — o conhecimento jurídico fica embutido nos modelos." },
  { q: "Meus dados ficam seguros?", a: "Sim. As credenciais usam hash SHA-256 com salt, há bloqueio anti força-bruta, expiração de sessão e trilha de auditoria. Os dados do mapeamento ficam isolados por organização." },
  { q: "Funciona para GDPR e LGPD ao mesmo tempo?", a: "Sim. São áreas dedicadas com prazos e bases próprias (15 dias na LGPD, 30 no GDPR), e o relatório consolidado cobre as duas jurisdições." },
  { q: "Posso cancelar quando quiser?", a: "Pode. O plano é mensal sem fidelidade. Seus dados podem ser exportados em JSON, CSV e PDF antes de cancelar." },
  { q: "Como funciona o trial de 7 dias?", a: `Você cria a conta com e-mail corporativo e usa tudo sem cartão por ${TRIAL_DIAS} dias. Ao final, basta ativar a assinatura para continuar — nada é perdido.` },
];

/* ============ componentes ============ */

function Nav({ onAcessar }: { onAcessar: () => void }) {
  const [rolou, setRolou] = useState(false);
  useEffect(() => {
    const h = () => setRolou(window.scrollY > 24);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);
  const links = [
    { h: "#plataforma", l: "Plataforma" },
    { h: "#demonstracao", l: "Demonstração" },
    { h: "#precos", l: "Preços" },
    { h: "#seguranca", l: "Segurança" },
    { h: "#faq", l: "FAQ" },
  ];
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
          {links.map((x) => (
            <a key={x.h} href={x.h} className="text-[13px] font-semibold text-cream/70 transition hover:text-lime">{x.l}</a>
          ))}
        </nav>
        <div className="flex items-center gap-2.5">
          <button onClick={onAcessar} className="hidden rounded-md border border-cream/25 px-4 py-2 text-[13px] font-bold text-cream transition hover:border-lime/60 hover:text-lime sm:block">Entrar</button>
          <button onClick={onAcessar} className="inline-flex items-center gap-2 rounded-md bg-lime px-4 py-2 text-[13px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
            Testar {TRIAL_DIAS} dias grátis <Ic name="arrow" size={13} />
          </button>
        </div>
      </div>
    </header>
  );
}

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
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-3.5 py-1.5 text-[10.5px] font-bold tracking-[0.16em] text-lime uppercase">
            <span className="pulse-dot size-1.5 rounded-full bg-lime" /> LGPD · GDPR · 11 frameworks ISO · IA nativa
          </p>
          <h1 className="font-display text-[42px] leading-[1.03] font-extrabold tracking-tight sm:text-[58px]">
            Todo dado pessoal da sua empresa, <span className="text-lime">no radar.</span>
          </h1>
          <p className="mt-5 max-w-xl text-[15.5px] leading-relaxed text-cream/70">
            Mapeamento de dados, bases legais, matriz de risco, programas ISO e direitos dos titulares —
            com uma IA que classifica operações em segundos e gera os documentos que o auditor pede.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3.5">
            <button onClick={onAcessar} className="group inline-flex items-center gap-2 rounded-md bg-lime px-6 py-3.5 text-[14.5px] font-extrabold text-pine shadow-[0_16px_36px_-14px_rgba(201,233,79,0.5)] transition hover:bg-lime-soft active:scale-[0.98]">
              Começar {TRIAL_DIAS} dias grátis <Ic name="arrow" size={15} className="transition-transform group-hover:translate-x-1" />
            </button>
            <a href="#demonstracao" className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-6 py-3.5 text-[14px] font-bold text-cream transition hover:border-lime/60 hover:text-lime">
              <Ic name="spark" size={15} sw={2.2} /> Ver a IA em ação
            </a>
          </div>
          <p className="mt-4 text-[12px] text-cream/45">Sem cartão de crédito · e-mail corporativo · cancele quando quiser</p>
        </div>

        {/* radar */}
        <div className="relative mx-auto w-full max-w-[420px]">
          <div className="relative aspect-square">
            <div className="absolute inset-0 rounded-full border border-lime/15" />
            <div className="absolute inset-[12%] rounded-full border border-lime/20" />
            <div className="absolute inset-[24%] rounded-full border border-lime/25" />
            <div className="absolute inset-[36%] rounded-full border border-lime/30" />
            <div className="radar-sweep absolute inset-[6%] rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.30), transparent 70deg)" }} />
            {[
              { top: "22%", left: "64%", cor: "var(--color-rust)" },
              { top: "48%", left: "30%", cor: "var(--color-amber)" },
              { top: "66%", left: "58%", cor: "var(--color-moss)" },
              { top: "36%", left: "44%", cor: "var(--color-lime)" },
            ].map((b, i) => (
              <span key={i} className="pulse-dot absolute size-2.5 rounded-full" style={{ top: b.top, left: b.left, background: b.cor }} />
            ))}
            <div className="absolute inset-0 grid place-items-center">
              <span className="grid size-14 place-items-center rounded-full border border-lime/40 bg-pine-deep">
                <Ic name="radar" size={26} className="text-lime" sw={1.8} />
              </span>
            </div>
          </div>
          {/* card de detecção */}
          <div key={det.t} className="anim-pop absolute -bottom-4 left-1/2 w-[86%] -translate-x-1/2 rounded-lg border border-pine-line bg-pine-deep/95 p-3.5 shadow-2xl backdrop-blur">
            <div className="flex items-center gap-3">
              <span className="pulse-dot size-2 shrink-0 rounded-full" style={{ background: det.cor }} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-bold text-cream">{det.t}</p>
                <p className="truncate text-[10.5px] text-cream/50">{det.d}</p>
              </div>
              <span className="rounded-sm bg-lime/15 px-2 py-0.5 text-[9px] font-extrabold tracking-widest text-lime uppercase">IA</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

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
            <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-rust uppercase">O custo de não mapear</p>
            <h2 className="font-display text-[34px] leading-tight font-extrabold tracking-tight text-ink sm:text-[42px]">
              A multa chega <span className="text-rust">antes</span> do mapa de dados.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
              Sem um registro de operações, qualquer incidente vira um problema jurídico. As sanções não são
              hipotéticas — e elas escalam com o faturamento.
            </p>
            <div className="mt-7 grid grid-cols-2 gap-6">
              <Stat v={50} suf="M" l="Multa máxima LGPD por infração (R$)" cor="text-rust" />
              <Stat v={4} suf="%" l="Do faturamento global (GDPR)" cor="text-rust" />
              <Stat v={2} suf="%" l="Do faturamento por infração (LGPD)" cor="text-amber" />
              <Stat v={72} suf="h" l="Prazo p/ notificar violação (GDPR)" cor="text-ink" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="space-y-3.5">
              {[
                { t: "“Acho que temos os dados dos clientes em umas 3 planilhas”", d: "Sem inventário, não há como responder à ANPD nem aos titulares — e o prazo de 15 dias não espera." },
                { t: "“O jurídico pediu a base legal de cada operação”", d: "Levantar consentimento, contrato e legítimo interesse operação por operação leva semanas de consultoria." },
                { t: "“Vamos ser auditados na ISO 27001 mês que vem”", d: "Sem evidência por controle e políticas formalizadas, a não conformidade é quase certa." },
              ].map((x, i) => (
                <div key={i} className="group flex gap-4 rounded-lg border border-sand bg-cream p-4.5 transition hover:-translate-y-0.5 hover:border-rust/40 hover:shadow-[0_14px_30px_-18px_rgba(189,79,38,0.4)]">
                  <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-md bg-rust-soft text-rust transition group-hover:bg-rust group-hover:text-cream">
                    <Ic name="alert" size={16} sw={2.2} />
                  </span>
                  <div>
                    <p className="text-[13.5px] font-bold text-ink">{x.t}</p>
                    <p className="mt-1 text-[12px] leading-snug text-ink-soft">{x.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Plataforma() {
  const [ativo, setAtivo] = useState("lgpd");
  const p = PILARES.find((x) => x.id === ativo)!;
  return (
    <section id="plataforma" className="relative overflow-hidden bg-cream py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Uma plataforma, todas as frentes</p>
          <h2 className="font-display mx-auto max-w-2xl text-center text-[34px] leading-tight font-extrabold tracking-tight text-ink sm:text-[42px]">
            Pare de colecionar planilhas. <span className="text-moss">Tenha um sistema.</span>
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* abas verticais */}
          <div className="flex flex-row gap-2 overflow-x-auto lg:flex-col">
            {PILARES.map((x) => (
              <button
                key={x.id}
                onClick={() => setAtivo(x.id)}
                className={`flex shrink-0 items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-all duration-200 lg:w-full ${
                  ativo === x.id ? "border-pine bg-pine shadow-md" : "border-sand bg-paper hover:border-moss/40 hover:bg-cream"
                }`}
              >
                <span className={`grid size-8 shrink-0 place-items-center rounded-md ${ativo === x.id ? "bg-pine-deep" : "bg-paper-deep"}`} style={{ color: x.cor }}>
                  <Ic name={x.ic} size={16} sw={2} />
                </span>
                <span>
                  <span className={`block text-[13px] font-bold ${ativo === x.id ? "text-cream" : "text-ink"}`}>{x.nome.split("—")[0]}</span>
                  <span className={`text-[10.5px] font-semibold uppercase tracking-wide ${ativo === x.id ? "text-lime" : "text-ink-faint"}`}>{x.tag}</span>
                </span>
              </button>
            ))}
          </div>

          {/* painel */}
          <div key={p.id} className="anim-rise relative overflow-hidden rounded-xl border border-sand bg-paper p-7 lg:p-9">
            <span className="absolute top-0 left-0 h-1.5 w-full" style={{ background: p.cor }} />
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-bold tracking-[0.14em] uppercase" style={{ color: p.cor }}>{p.tag}</p>
                <h3 className="font-display mt-1 text-[24px] font-extrabold text-ink">{p.nome}</h3>
              </div>
              <span className="grid size-12 shrink-0 place-items-center rounded-lg" style={{ background: `${p.cor}1f`, color: p.cor }}>
                <Ic name={p.ic} size={24} sw={1.8} />
              </span>
            </div>
            <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-ink-soft">{p.desc}</p>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {p.bullets.map((b) => (
                <li key={b} className="flex items-start gap-2.5 rounded-md border border-sand bg-cream px-3.5 py-3 text-[13px] leading-snug font-semibold text-ink">
                  <Ic name="check" size={14} sw={3} className="mt-0.5 shrink-0 text-moss" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function DemoIa() {
  const exemplos = [
    "Processar a folha de pagamento mensal dos funcionários",
    "Enviar newsletter de marketing para clientes cadastrados",
    "Coletar dados de saúde para plano de assistência médica",
    "Gravar imagens de CFTV nas instalações da empresa",
  ];
  const [texto, setTexto] = useState(exemplos[0]);
  const [analisando, setAnalisando] = useState(false);
  const [r, setR] = useState<AnaliseIA | null>(null);
  const timer = useRef<number | null>(null);

  const rodar = (t: string) => {
    setTexto(t);
    setAnalisando(true);
    setR(null);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      setR(analisar(t));
      setAnalisando(false);
    }, 850);
  };

  useEffect(() => {
    rodar(exemplos[0]);
    return () => { if (timer.current) window.clearTimeout(timer.current); };
  }, []);

  const zona = r ? ZONA_META[r.zona] : null;

  return (
    <section id="demonstracao" className="rail-texture bg-pine py-20 text-cream">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-lime uppercase">Experimente agora — sem cadastro</p>
          <h2 className="font-display mx-auto max-w-2xl text-center text-[34px] leading-tight font-extrabold tracking-tight sm:text-[42px]">
            Descreva uma operação. <span className="text-lime">A IA faz o resto.</span>
          </h2>
        </Reveal>

        <Reveal delay={120}>
          <div className="mx-auto mt-10 max-w-[860px] overflow-hidden rounded-xl border border-pine-line bg-pine-deep shadow-2xl">
            <div className="flex items-center gap-2 border-b border-pine-line bg-pine px-4 py-3">
              <span className="flex gap-1.5"><span className="size-2.5 rounded-full bg-rust/80" /><span className="size-2.5 rounded-full bg-amber/80" /><span className="size-2.5 rounded-full bg-moss/80" /></span>
              <span className="ml-2 text-[11.5px] font-bold tracking-wide text-cream/50">Radar GRC — Assistente de IA</span>
            </div>
            <div className="p-6">
              <div className="relative">
                <textarea
                  value={texto}
                  onChange={(e) => rodar(e.target.value)}
                  rows={2}
                  className="w-full resize-none rounded-lg border border-pine-line bg-pine p-4 pr-24 text-[14px] leading-relaxed text-cream outline-none placeholder:text-cream/30 focus:border-lime/60"
                  placeholder="Ex.: Processar a folha de pagamento…"
                />
                <span className="absolute right-3 bottom-3 inline-flex items-center gap-1.5 rounded-md bg-lime px-3 py-1.5 text-[11.5px] font-extrabold text-pine">
                  <Ic name="spark" size={13} sw={2.4} /> IA
                </span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {exemplos.map((e) => (
                  <button key={e} onClick={() => rodar(e)} className={`rounded-full border px-3.5 py-1.5 text-[11.5px] font-semibold transition ${texto === e ? "border-lime bg-lime/15 text-lime" : "border-pine-line text-cream/55 hover:border-lime/50 hover:text-lime"}`}>
                    {e.split(" ").slice(0, 4).join(" ")}…
                  </button>
                ))}
              </div>

              <div className="relative mt-5 min-h-[230px]">
                {analisando && (
                  <div className="absolute inset-0 grid place-items-center">
                    <div className="text-center">
                      <span className="mx-auto block size-9 animate-spin rounded-full border-2 border-lime/25 border-t-lime" />
                      <p className="caret mt-3 text-[13px] font-bold text-lime">Analisando operação</p>
                    </div>
                  </div>
                )}
                {!analisando && r && zona && (
                  <div className="anim-rise grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg border border-pine-line bg-pine p-4">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-cream/45 uppercase">Dados identificados</p>
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {r.dados.map((d) => (
                          <span key={d} className={`rounded-md px-2 py-1 text-[11px] font-bold ${r.dadosSensiveis.includes(d) ? "bg-rust/20 text-[#f0b39a]" : "bg-pine-deep text-lime"}`}>
                            {CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d}
                          </span>
                        ))}
                      </div>
                      {r.dadosSensiveis.length > 0 && <p className="mt-2.5 flex items-center gap-1.5 text-[10.5px] font-bold text-[#f0b39a]"><Ic name="alert" size={11} sw={2.4} /> {r.dadosSensiveis.length} dado(s) sensível(is) — Art. 11</p>}
                    </div>
                    <div className="rounded-lg border border-pine-line bg-pine p-4">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-cream/45 uppercase">Base legal sugerida</p>
                      <p className="mt-2 text-[13px] font-extrabold text-lime">{r.bases[0]?.inciso} — {r.bases[0]?.titulo}</p>
                      <p className="mt-1.5 text-[11px] leading-snug text-cream/50">{r.bases[0]?.rationale}</p>
                    </div>
                    <div className="rounded-lg border border-pine-line bg-pine p-4">
                      <p className="text-[10px] font-bold tracking-[0.14em] text-cream/45 uppercase">Risco & medidas</p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="rounded-md px-2.5 py-1 text-[11.5px] font-extrabold" style={{ background: zona.bg, color: zona.fg }}>{zona.label} · {r.score}/25</span>
                        <span className="text-[11px] font-bold text-cream/45">{r.confianca}% conf.</span>
                      </div>
                      <p className="mt-2.5 text-[11px] leading-snug text-cream/50">{r.medidas.slice(0, 3).join(" · ")}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Precos({ onAcessar }: { onAcessar: () => void }) {
  const incluso = [
    "LGPD + GDPR completos", "11 frameworks & certificações ISO", "IA de conformidade ilimitada",
    "Documentos e políticas em PDF", "Usuários e organizações ilimitados", "Gestão de Cookies com API",
    "Trilha de auditoria e segurança", "Exportações JSON / CSV / PDF",
  ];
  return (
    <section id="precos" className="bg-paper py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Preço único, sem surpresa</p>
          <h2 className="font-display mx-auto max-w-2xl text-center text-[34px] leading-tight font-extrabold tracking-tight text-ink sm:text-[42px]">
            Menos que <span className="text-moss">uma hora</span> de consultoria.
          </h2>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-[880px] overflow-hidden rounded-2xl border border-pine-line shadow-[0_30px_70px_-30px_rgba(12,31,24,0.5)] lg:grid-cols-[1.1fr_0.9fr]">
          {/* card preço */}
          <div className="rail-texture relative bg-pine p-8 text-cream lg:p-10">
            <span className="rounded-full bg-lime px-3 py-1 text-[10px] font-extrabold tracking-[0.14em] text-pine uppercase">Plano Completo</span>
            <p className="mt-6 flex items-end gap-2">
              <span className="font-display text-[64px] leading-none font-extrabold text-lime">{PRECO_MENSAL}</span>
              <span className="pb-2 text-[14px] font-semibold text-cream/60">/mês</span>
            </p>
            <p className="mt-2 text-[13px] text-cream/65">Primeiros <strong className="text-lime">{TRIAL_DIAS} dias grátis</strong> · sem cartão · cancele quando quiser</p>
            <button onClick={onAcessar} className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lime py-3.5 text-[15px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
              Começar agora <Ic name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            <p className="mt-3 text-center text-[11px] text-cream/40">Ativação imediata após o trial</p>
          </div>
          {/* o que inclui */}
          <div className="bg-cream p-8 lg:p-10">
            <p className="font-display text-[16px] font-extrabold text-ink">Tudo incluído</p>
            <ul className="mt-5 space-y-2.5">
              {incluso.map((x) => (
                <li key={x} className="flex items-center gap-2.5 text-[13px] font-semibold text-ink-soft">
                  <span className="grid size-5 shrink-0 place-items-center rounded-full bg-moss/15 text-moss"><Ic name="check" size={11} sw={3} /></span>
                  {x}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-sand pt-4 text-[11.5px] leading-snug text-ink-faint">
              Precisa de white-label, SSO ou implantação dedicada? <a href="#contato" className="font-bold text-moss hover:underline">Fale conosco</a> — fazemos sob consulta.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Seguranca() {
  const itens = [
    { ic: "shield", t: "Senhas SHA-256 + salt", d: "Nunca em texto puro, via Web Crypto." },
    { ic: "lock", t: "Anti força-bruta", d: "Bloqueio progressivo de tentativas." },
    { ic: "eye", t: "Camada anticópia", d: "Bloqueia inspeção e clonagem do sistema." },
    { ic: "doc", t: "Trilha de auditoria", d: "Cada ação registrada e exportável." },
  ];
  return (
    <section id="seguranca" className="bg-cream py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <Reveal>
            <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Segurança de ponta a ponta</p>
            <h2 className="font-display text-[34px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">
              Um GRC que <span className="text-moss">pratica</span> o que vende.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink-soft">
              O Radar GRC aplica as mesmas salvaguardas que ajuda você a implementar: criptografia, controle de
              acesso por organização, expiração de sessão e proteção contra cópia do próprio sistema.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {itens.map((x) => (
                <div key={x.t} className="group flex gap-3 rounded-lg border border-sand bg-paper p-4 transition hover:border-moss/50 hover:shadow-[0_12px_26px_-16px_rgba(19,46,38,0.4)]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-pine text-lime transition group-hover:scale-110"><Ic name={x.ic} size={17} sw={2} /></span>
                  <div><p className="text-[13px] font-bold text-ink">{x.t}</p><p className="text-[11.5px] text-ink-soft">{x.d}</p></div>
                </div>
              ))}
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div className="rail-texture relative overflow-hidden rounded-xl border border-pine-line bg-pine p-8 text-cream">
              <div className="scan-line pointer-events-none absolute left-0 h-px w-full bg-lime/30" />
              <p className="text-[10.5px] font-bold tracking-[0.16em] text-lime uppercase">Central de segurança · ao vivo</p>
              <div className="mt-5 space-y-3">
                {[
                  { t: "Proteção anticópia", v: "Ativa", cor: "var(--color-lime)" },
                  { t: "Tentativas bloqueadas", v: "0", cor: "var(--color-cream)" },
                  { t: "DevTools", v: "Fechado", cor: "var(--color-cream)" },
                  { t: "Marca d'água de sessão", v: "Ativa", cor: "var(--color-lime)" },
                ].map((x) => (
                  <div key={x.t} className="flex items-center justify-between rounded-md border border-pine-line bg-pine-deep/70 px-4 py-3">
                    <span className="text-[12.5px] font-semibold text-cream/70">{x.t}</span>
                    <span className="font-display text-[13px] font-extrabold" style={{ color: x.cor }}>{x.v}</span>
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

function Depoimentos() {
  return (
    <section className="bg-paper py-20">
      <div className="mx-auto max-w-[1160px] px-5">
        <Reveal>
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.16em] text-moss uppercase">Quem já saiu do risco</p>
          <h2 className="font-display mx-auto max-w-xl text-center text-[34px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">
            Conformidade que <span className="text-moss">se paga</span> no primeiro mês.
          </h2>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {DEPOIMENTOS.map((d, i) => (
            <Reveal key={d.n} delay={i * 100} className={d.off}>
              <figure className="relative rounded-xl border border-sand bg-cream p-6 transition hover:-translate-y-1 hover:border-moss/50 hover:shadow-[0_18px_40px_-20px_rgba(19,46,38,0.45)]">
                <Ic name="spark" size={22} sw={2} className="text-lime" />
                <blockquote className="mt-3 text-[14px] leading-relaxed text-ink">“{d.t}”</blockquote>
                <figcaption className="mt-5 flex items-center gap-3 border-t border-sand pt-4">
                  <span className="grid size-10 place-items-center rounded-full bg-pine font-display text-[14px] font-extrabold text-lime">{d.n[0]}</span>
                  <span><span className="block text-[13px] font-bold text-ink">{d.n}</span><span className="text-[11.5px] text-ink-faint">{d.c}</span></span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const [aberto, setAberto] = useState(0);
  return (
    <section id="faq" className="bg-cream py-20">
      <div className="mx-auto max-w-[760px] px-5">
        <Reveal>
          <h2 className="font-display text-center text-[34px] leading-tight font-extrabold tracking-tight text-ink sm:text-[40px]">Perguntas frequentes</h2>
        </Reveal>
        <div className="mt-10 space-y-3">
          {FAQ.map((f, i) => (
            <Reveal key={i} delay={i * 60}>
              <div className={`overflow-hidden rounded-lg border transition-colors ${aberto === i ? "border-moss bg-paper" : "border-sand bg-paper/60"}`}>
                <button onClick={() => setAberto(aberto === i ? -1 : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
                  <span className="text-[14.5px] font-bold text-ink">{f.q}</span>
                  <span className={`grid size-7 shrink-0 place-items-center rounded-full transition-transform duration-300 ${aberto === i ? "rotate-45 bg-moss text-cream" : "bg-paper-deep text-ink-soft"}`}>
                    <Ic name="plus" size={13} sw={2.6} />
                  </span>
                </button>
                <div className={`grid transition-all duration-300 ${aberto === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                  <div className="overflow-hidden"><p className="px-5 pb-4 text-[13.5px] leading-relaxed text-ink-soft">{f.a}</p></div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contato() {
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({ nome: "", email: "", empresa: "", msg: "" });
  const enviar = (e: FormEvent) => {
    e.preventDefault();
    try {
      const leads = JSON.parse(localStorage.getItem("radargrc:leads") ?? "[]");
      leads.push({ ...form, ts: Date.now() });
      localStorage.setItem("radargrc:leads", JSON.stringify(leads));
    } catch { /* ignora */ }
    setEnviado(true);
  };
  const inp = "w-full rounded-md border border-sand bg-cream px-3.5 py-2.5 text-[13.5px] text-ink outline-none transition placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25";
  return (
    <section id="contato" className="rail-texture bg-pine py-20 text-cream">
      <div className="mx-auto grid max-w-[1000px] items-center gap-12 px-5 lg:grid-cols-2">
        <Reveal>
          <p className="mb-2 text-[11px] font-bold tracking-[0.16em] text-lime uppercase">Fale com um especialista</p>
          <h2 className="font-display text-[34px] leading-tight font-extrabold tracking-tight sm:text-[42px]">
            Quer ver com os <span className="text-lime">seus dados</span>?
          </h2>
          <p className="mt-4 text-[14.5px] leading-relaxed text-cream/70">
            Agende uma demonstração guiada ou tire dúvidas sobre implantação, white-label e integração.
            Respondemos em até 1 dia útil.
          </p>
          <div className="mt-6 space-y-2.5 text-[13px] font-semibold text-cream/60">
            <p className="flex items-center gap-2.5"><Ic name="mail" size={15} className="text-lime" /> comercial@radargrc.app</p>
            <p className="flex items-center gap-2.5"><Ic name="clock" size={15} className="text-lime" /> Seg–Sex · 9h às 18h (BRT)</p>
          </div>
        </Reveal>
        <Reveal delay={120}>
          {enviado ? (
            <div className="anim-pop rounded-xl border border-lime/40 bg-pine-deep p-8 text-center">
              <span className="mx-auto grid size-14 place-items-center rounded-full bg-lime text-pine"><Ic name="check" size={26} sw={3} /></span>
              <p className="font-display mt-4 text-[20px] font-extrabold">Recebemos sua mensagem!</p>
              <p className="mt-2 text-[13px] text-cream/60">Um especialista entrará em contato pelo e-mail <strong className="text-lime">{form.email}</strong>.</p>
            </div>
          ) : (
            <form onSubmit={enviar} className="rounded-xl border border-pine-line bg-pine-deep p-6">
              <div className="grid gap-3.5 sm:grid-cols-2">
                <input required className={inp} placeholder="Seu nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
                <input required type="email" className={inp} placeholder="E-mail corporativo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <input className={`${inp} mt-3.5`} placeholder="Empresa" value={form.empresa} onChange={(e) => setForm({ ...form, empresa: e.target.value })} />
              <textarea required rows={4} className={`${inp} mt-3.5 resize-none`} placeholder="Como podemos ajudar?" value={form.msg} onChange={(e) => setForm({ ...form, msg: e.target.value })} />
              <button type="submit" className="group mt-4 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lime py-3 text-[14px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
                Enviar mensagem <Ic name="send" size={15} className="transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          )}
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
              <span className="font-display text-[17px] font-extrabold">Radar<span className="text-lime">GRC</span></span>
            </div>
            <p className="mt-3 text-[12px] leading-relaxed text-cream/50">Privacidade e conformidade com IA — LGPD, GDPR e 11 frameworks num único sistema.</p>
          </div>
          <div className="flex gap-14">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-lime uppercase">Produto</p>
              <div className="mt-3 space-y-2 text-[13px] font-semibold text-cream/60">
                <a href="#plataforma" className="block transition hover:text-lime">Plataforma</a>
                <a href="#demonstracao" className="block transition hover:text-lime">Demonstração</a>
                <a href="#precos" className="block transition hover:text-lime">Preços</a>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] text-lime uppercase">Empresa</p>
              <div className="mt-3 space-y-2 text-[13px] font-semibold text-cream/60">
                <a href="#seguranca" className="block transition hover:text-lime">Segurança</a>
                <a href="#faq" className="block transition hover:text-lime">FAQ</a>
                <a href="#contato" className="block transition hover:text-lime">Contato</a>
              </div>
            </div>
          </div>
          <button onClick={onAcessar} className="rounded-md border border-lime/40 px-5 py-2.5 text-[13px] font-bold text-lime transition hover:bg-lime hover:text-pine">Acessar o sistema</button>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-pine-line pt-6 text-[11.5px] text-cream/40 md:flex-row">
          <p>© 2026 Radar GRC · Todos os direitos reservados</p>
          <p>Feito no Brasil 🇧🇷 · LGPD-first</p>
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
      <Depoimentos />
      <Faq />
      <Contato />
      <Rodape onAcessar={onAcessar} />
    </div>
  );
}
