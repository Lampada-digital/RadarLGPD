import { useEffect, useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import { DEMO_EMAIL, DEMO_SENHA, TRIAL_DIAS, useAuth } from "../auth";
import { PRECO_MENSAL } from "../auth";
import { analisar } from "../ai";
import { CATEGORIAS_DADOS } from "../types";
import { Ic, Reveal, useCountUp } from "./ui";

/* ================= dados de conteúdo ================= */

const BLIPS = [
  { top: "16%", left: "58%", cor: "#c9e94f", label: "LGPD · Art. 37", det: "folha de pagamento · risco 6" },
  { top: "30%", left: "24%", cor: "#8fb8f0", label: "GDPR · Art. 30", det: "EU payroll · SCCs vigentes" },
  { top: "52%", left: "72%", cor: "#e8b64c", label: "ISO 27001 · A.8.13", det: "backup verificado" },
  { top: "66%", left: "34%", cor: "#f0906a", label: "PCI-DSS · Req 3", det: "PAN tokenizado" },
  { top: "38%", left: "48%", cor: "#c9e94f", label: "SOC 2 · CC6.1", det: "MFA em produção" },
  { top: "74%", left: "58%", cor: "#8fb8f0", label: "Cookies · ePrivacy", det: "3 novos consentimentos" },
];

const DETECCOES = [
  { tag: "LGPD", norma: "Art. 9º, II", titulo: "CFTV sem sinalização no galpão", risco: "Risco 9 · alto", cor: "#f0906a" },
  { tag: "GDPR", norma: "Art. 35", titulo: "Scoring de crédito em grande escala", risco: "DPIA obrigatória", cor: "#8fb8f0" },
  { tag: "ISO 27001", norma: "A.5.24", titulo: "Incidente sem playbook de resposta", risco: "Não conformidade", cor: "#e8b64c" },
  { tag: "Titulares", norma: "Art. 19", norma2: "· 15 dias", titulo: "Pedido de portabilidade há 11 dias", risco: "Prazo em 4 dias", cor: "#c9e94f" },
];

const MARQUEE = [
  "ART. 37 LGPD — ROPA", "ART. 30 GDPR", "ISO/IEC 27001", "ISO/IEC 27002", "ISO/IEC 27017", "ISO/IEC 27701",
  "ISO 31000", "ISO 37001", "ISO 37301", "SOC 2 TYPE II", "PCI-DSS V4.0", "EU AI ACT", "EPRIVACY — COOKIES", "DPIA · RIPD",
];

const MODULOS = [
  {
    n: "01", ic: "layers", cor: "#2e6b54", titulo: "LGPD · Brasil",
    desc: "Registro de operações do art. 37, matriz de risco 5×5, as 18 bases legais dos arts. 7º e 11 e fila de titulares com o prazo de 15 dias correndo sozinho.",
    tags: ["Art. 37", "Matriz 5×5", "RIPD", "Titulares"],
  },
  {
    n: "02", ic: "globe", cor: "#1f4e8f", titulo: "GDPR · União Europeia",
    desc: "ROPA do Art. 30, bases do Art. 6 e condições do Art. 9, DPIA pelos 9 critérios do EDPB e transferências internacionais com SCCs e TIA.",
    tags: ["Art. 30", "Art. 6/9", "DPIA", "Capítulo V"],
  },
  {
    n: "03", ic: "brain", cor: "#c98a1f", titulo: "11 frameworks & certificações",
    desc: "Implementação controle a controle das ISO 27001, 27002, 27017, 27701, 31000, 37001, 37301 + SOC 2 Type II e PCI-DSS v4.0, com trilha de certificação.",
    tags: ["7 normas ISO", "SOC 2", "PCI-DSS", "Evidências"],
  },
  {
    n: "04", ic: "filter", cor: "#bd4f26", titulo: "Cookies & API de consentimento",
    desc: "Gere o banner do site do cliente, receba cada consentimento em tempo real via API e deixe a IA classificar o inventário e redigir a política.",
    tags: ["Banner próprio", "API", "CMP", "Política em PDF"],
  },
  {
    n: "05", ic: "printer", cor: "#7a4f8f", titulo: "Documentos prontos para o auditor",
    desc: "Pacotes de políticas em PDF com capa controlada, sumário, anexo de evidências e bloco de aprovação — versionados como CONTROLADO a partir de 60% de conformidade.",
    tags: ["PDF real", "CONTROLADO", "White-label"],
  },
];

const PASSOS = [
  { n: "1", t: "Cadastre a organização", d: `E-mail corporativo, ${TRIAL_DIAS} dias grátis, sem cartão. Você já entra como admin e convida a equipe.` },
  { n: "2", t: "Descreva — a IA mapeia", d: "Digite a operação em uma frase. A IA devolve dados, base legal, retenção, salvaguardas e risco." },
  { n: "3", t: "Baixe e mostre ao auditor", d: "Gere políticas, RoPA e relatórios em PDF/CSV prontos para ANPD, autoridade europeia ou certificação." },
];

const FAQS = [
  { q: "O teste de 7 dias pede cartão de crédito?", a: "Não. O cadastro libera acesso completo imediatamente e só ao final do período o sistema pede a ativação da assinatura. Todos os seus dados ficam preservados durante a pausa." },
  { q: "Minha empresa não tem DPO. Consigo usar?", a: "Sim — o sistema foi desenhado para guiar quem está começando: a IA sugere a base legal, as medidas e os prazos. Quando sua maturidade cresce, os mesmos registros viram evidência de auditoria." },
  { q: "Os documentos servem para auditoria e certificação?", a: "Sim. Cada framework gera um pacote com capa controlada, políticas redigidas, anexo com a situação real dos controles e bloco de assinaturas. A partir de 60% de conformidade o documento sai versionado como CONTROLADO." },
  { q: "Cobre GDPR mesmo sem escritório na Europa?", a: "Cobre. Se você trata dados de titulares na UE (clientes, leads, visitantes do site), o GDPR se aplica — e o módulo inclui ROPA, DPIA e transferências internacionais." },
  { q: "Onde ficam os meus dados?", a: "Na edição atual, cada organização tem armazenamento isolado no navegador (ideal para avaliação e uso interno). A edição em nuvem com backend e SSO está no roadmap do plano Enterprise sob consulta." },
  { q: "Posso cancelar quando quiser?", a: "Sim. A assinatura é mensal, sem fidelidade e sem multa. Cancelando, você mantém o acesso até o fim do ciclo pago e pode exportar tudo antes." },
];

const PRECO_ITENS = [
  "LGPD + GDPR completos, sem limite de registros",
  "11 frameworks: 7 ISO + SOC 2 + PCI-DSS + IA + Cookies",
  "Assistente de IA ilimitado, rodando no seu navegador",
  "Políticas e relatórios em PDF sem limite de geração",
  "Usuários e administradores ilimitados",
  "API do banner de cookies para sites de clientes",
  "Trilha de auditoria e Central de Segurança",
  "Atualizações contínuas e suporte incluídos",
];

/* ================= subcomponentes ================= */

function Contador({ alvo, sufixo = "", visto }: { alvo: number; sufixo?: string; visto: boolean }) {
  const v = useCountUp(visto ? alvo : 0, 1100);
  return (
    <span className="font-display text-[38px] leading-none font-extrabold tracking-tight text-cream tabular-nums sm:text-[46px]">
      {v}
      {sufixo && <span className="text-[20px] font-bold text-lime">{sufixo}</span>}
    </span>
  );
}

function RadarHero() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => (t + 1) % DETECCOES.length), 3400);
    return () => clearInterval(id);
  }, []);
  const det = DETECCOES[tick];

  return (
    <div className="relative mx-auto w-full max-w-[440px]">
      {/* anéis do radar */}
      <div className="relative aspect-square">
        <div className="absolute inset-0 rounded-full border border-lime/15" />
        <div className="absolute inset-[12%] rounded-full border border-lime/20" />
        <div className="absolute inset-[26%] rounded-full border border-lime/25" />
        <div className="absolute inset-[40%] rounded-full border border-lime/30" />
        <div className="radar-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.30), rgba(201,233,79,0.05) 55deg, transparent 80deg)" }} />
        <div className="absolute inset-0 overflow-hidden rounded-full opacity-[0.05]">
          <div className="scanline h-1/4 w-full bg-lime" />
        </div>
        {/* blips */}
        {BLIPS.map((b, i) => (
          <div key={b.label} className="group absolute -translate-x-1/2 -translate-y-1/2" style={{ top: b.top, left: b.left }}>
            <span className="blip relative block size-2.5 rounded-full" style={{ background: b.cor, color: b.cor, animationDelay: `${i * 0.4}s` }} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-2 w-max -translate-x-1/2 rounded-md border border-pine-line bg-pine-deep px-2.5 py-1.5 text-[10px] leading-tight opacity-0 shadow-lg transition-opacity duration-200 group-hover:opacity-100">
              <span className="block font-extrabold" style={{ color: b.cor }}>{b.label}</span>
              <span className="block text-cream/60">{b.det}</span>
            </span>
          </div>
        ))}
        {/* núcleo */}
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <p className="font-display text-[13px] font-extrabold tracking-[0.24em] text-lime uppercase">Radar GRC</p>
            <p className="mt-1 text-[10px] font-bold tracking-widest text-cream/40 uppercase">varredura contínua</p>
          </div>
        </div>
      </div>

      {/* card de detecção cíclico */}
      <div key={tick} className="anim-pop absolute -bottom-5 left-1/2 w-[92%] -translate-x-1/2 rounded-lg border border-pine-line bg-pine-deep/95 p-3.5 shadow-[0_20px_44px_-16px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:-left-6 sm:w-[300px] sm:translate-x-0">
        <div className="flex items-center justify-between gap-2">
          <span className="rounded-sm px-1.5 py-0.5 text-[9px] font-extrabold tracking-widest text-pine uppercase" style={{ background: det.cor }}>{det.tag}</span>
          <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-cream/40 uppercase">
            <span className="pulse-dot size-1.5 rounded-full bg-lime" /> IA detectou
          </span>
        </div>
        <p className="mt-2 text-[13px] leading-snug font-bold text-cream">{det.titulo}</p>
        <p className="mt-1 flex items-center justify-between text-[10.5px]">
          <span className="font-semibold text-cream/50">{det.norma}{det.norma2 ?? ""}</span>
          <span className="font-extrabold" style={{ color: det.cor }}>{det.risco}</span>
        </p>
      </div>

      {/* chip flutuante */}
      <div className="floaty absolute -top-3 -right-2 hidden items-center gap-2 rounded-full border border-lime/30 bg-pine-deep px-3.5 py-2 shadow-lg sm:flex">
        <Ic name="clock" size={13} className="text-lime" sw={2.4} />
        <span className="text-[10.5px] font-extrabold tracking-wide text-cream uppercase">DSAR · 15d LGPD · 30d GDPR</span>
      </div>
    </div>
  );
}

/* demonstração interativa da IA */
function DemoIa() {
  const [texto, setTexto] = useState("");
  const [pensando, setPensando] = useState(false);
  const [r, setR] = useState<ReturnType<typeof analisar> | null>(null);

  const rodar = (t?: string) => {
    const alvo = (t ?? texto).trim();
    if (!alvo) return;
    if (t) setTexto(t);
    setPensando(true);
    setR(null);
    setTimeout(() => {
      setR(analisar(alvo));
      setPensando(false);
    }, 750);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    rodar();
  };

  const exemplos = [
    "Processamos a folha de pagamento dos funcionários e compartilhamos com o contador",
    "O marketing envia newsletter com Hotjar e Google Analytics no site",
    "Clínica guarda exames e laudos médicos dos pacientes na nuvem",
  ];

  const base = r
    ? r.bases.find((b) => b.principal) ?? r.bases.find((b) => b.id === r.baseRecomendada) ?? r.bases[0]
    : null;

  return (
    <div className="overflow-hidden rounded-xl border border-pine-line bg-pine-deep shadow-[0_28px_60px_-24px_rgba(12,31,24,0.6)]">
      <div className="flex items-center justify-between border-b border-pine-line px-4 py-3">
        <p className="flex items-center gap-2 text-[10.5px] font-extrabold tracking-[0.16em] text-lime uppercase">
          <Ic name="spark" size={13} sw={2.4} /> Assistente IA · teste agora
        </p>
        <span className="text-[9.5px] font-bold tracking-widest text-cream/35 uppercase">100% no navegador</span>
      </div>
      <form onSubmit={onSubmit} className="p-4">
        <div className="relative">
          <textarea
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Descreva uma operação com dados pessoais… ex.: gravamos as ligações do call center e guardamos por 2 anos"
            className="min-h-[76px] w-full resize-none rounded-md border border-pine-line bg-pine p-3 pr-12 text-[13px] leading-relaxed text-cream outline-none placeholder:text-cream/30 focus:border-lime/60 focus:ring-2 focus:ring-lime/20"
          />
          <button type="submit" disabled={pensando || !texto.trim()} className="absolute right-2.5 bottom-2.5 grid size-9 place-items-center rounded-md bg-lime text-pine transition hover:bg-lime-soft active:scale-90 disabled:opacity-40" aria-label="Classificar">
            {pensando ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> : <Ic name="send" size={16} sw={2} />}
          </button>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {exemplos.map((ex) => (
            <button key={ex} type="button" onClick={() => rodar(ex)} className="rounded-full border border-pine-line px-2.5 py-1 text-[10.5px] font-semibold text-cream/55 transition hover:border-lime/50 hover:text-lime">
              {ex.split(" ").slice(0, 4).join(" ")}…
            </button>
          ))}
        </div>
      </form>

      {pensando && (
        <div className="anim-pop border-t border-pine-line px-4 py-6 text-center">
          <p className="caret inline text-[12.5px] font-semibold text-lime">analisando finalidade, dados e risco</p>
        </div>
      )}

      {r && !pensando && (
        <div className="anim-rise border-t border-pine-line p-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-sm bg-lime px-2 py-0.5 text-[9.5px] font-extrabold tracking-widest text-pine uppercase">IA · {r.confianca}% confiança</span>
            <span className="rounded-sm px-2 py-0.5 text-[9.5px] font-extrabold tracking-widest uppercase" style={{ background: r.score >= 12 ? "#ecc6b4" : r.score >= 6 ? "#f0e5bd" : "#dfe9cf", color: r.score >= 12 ? "#8c3013" : r.score >= 6 ? "#7a5f14" : "#3c5a2a" }}>
              Risco {r.score}/25
            </span>
            {r.transferenciaInternacional && <span className="rounded-sm bg-[#1f4e8f]/20 px-2 py-0.5 text-[9.5px] font-extrabold tracking-widest text-[#8fb8f0] uppercase">Transferência intl.</span>}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <p className="mb-1.5 text-[9.5px] font-extrabold tracking-[0.14em] text-cream/40 uppercase">Dados identificados ({r.dados.length})</p>
              <div className="flex flex-wrap gap-1">
                {r.dados.map((d) => (
                  <span key={d} className="rounded-md border border-pine-line bg-pine px-2 py-0.5 text-[10.5px] font-bold text-lime-soft">{CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d}</span>
                ))}
              </div>
              <p className="mt-3 mb-1.5 text-[9.5px] font-extrabold tracking-[0.14em] text-cream/40 uppercase">Base legal sugerida</p>
              <p className="text-[12px] font-bold text-lime">{base?.inciso} — {base?.titulo}</p>
              <p className="text-[10.5px] leading-snug text-cream/50">{base?.rationale}</p>
            </div>
            <div>
              <p className="mb-1.5 text-[9.5px] font-extrabold tracking-[0.14em] text-cream/40 uppercase">Medidas recomendadas</p>
              <ul className="space-y-1">
                {r.medidas.slice(0, 4).map((m) => (
                  <li key={m} className="flex items-start gap-1.5 text-[11px] leading-snug text-cream/70">
                    <Ic name="check" size={11} sw={3} className="mt-0.5 shrink-0 text-lime" /> {m}
                  </li>
                ))}
              </ul>
              {r.alertas.length > 0 && (
                <p className="mt-2.5 flex items-start gap-1.5 rounded-md bg-amber/12 px-2.5 py-2 text-[10.5px] leading-snug font-semibold text-amber">
                  <Ic name="alert" size={12} sw={2.4} className="mt-px shrink-0" /> {r.alertas[0]}
                </p>
              )}
            </div>
          </div>
          <p className="mt-3.5 border-t border-pine-line pt-3 text-[10.5px] text-cream/40">
            Dentro do sistema, um clique transforma essa análise num registro completo do art. 37 — com retenção {r.retencao.toLowerCase()}.
          </p>
        </div>
      )}
    </div>
  );
}

function Faq() {
  const [aberta, setAberta] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-[760px]">
      {FAQS.map((f, i) => {
        const on = aberta === i;
        return (
          <div key={f.q} className={`border-b border-sand transition-colors ${on ? "bg-cream" : "hover:bg-cream/60"}`}>
            <button onClick={() => setAberta(on ? null : i)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left">
              <span className={`font-display text-[15.5px] font-bold transition-colors ${on ? "text-pine" : "text-ink"}`}>{f.q}</span>
              <span className={`grid size-7 shrink-0 place-items-center rounded-full border transition-all duration-300 ${on ? "rotate-45 border-pine bg-pine text-lime" : "border-sand text-ink-soft"}`}>
                <Ic name="plus" size={13} sw={2.6} />
              </span>
            </button>
            <div className="grid transition-[grid-template-rows] duration-300 ease-out" style={{ gridTemplateRows: on ? "1fr" : "0fr" }}>
              <div className="overflow-hidden">
                <p className="px-5 pb-5 text-[13.5px] leading-relaxed text-ink-soft">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ================= página ================= */

export default function Landing({ onAcessar }: { onAcessar: () => void }) {
  const { entrar } = useAuth();
  const [demoCarregando, setDemoCarregando] = useState(false);
  const [statsVisto, setStatsVisto] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setStatsVisto(true)), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const demo = async () => {
    setDemoCarregando(true);
    await entrar(DEMO_EMAIL, DEMO_SENHA, false);
    setDemoCarregando(false);
  };

  const irPara = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  const navLinks = useMemo(
    () => [
      { id: "produto", label: "Produto" },
      { id: "ia", label: "IA" },
      { id: "preco", label: "Preço" },
      { id: "faq", label: "FAQ" },
    ],
    []
  );

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* ---------- nav ---------- */}
      <header className="sticky top-0 z-40 border-b border-sand/70 bg-paper/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1160px] items-center gap-5 px-4 py-3 sm:px-6">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-2.5">
            <span className="relative grid size-9 place-items-center overflow-hidden rounded-lg border border-pine-line bg-pine">
              <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
              <Ic name="radar" size={18} className="relative text-lime" sw={1.9} />
            </span>
            <span className="font-display text-[16px] font-extrabold tracking-tight">Radar<span className="text-moss">GRC</span></span>
          </button>
          <nav className="ml-auto hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <button key={l.id} onClick={() => irPara(l.id)} className="group text-[13px] font-bold text-ink-soft transition hover:text-ink">
                {l.label}
                <span className="block h-0.5 max-w-0 bg-lime transition-all duration-300 group-hover:max-w-full" />
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-6">
            <button onClick={onAcessar} className="hidden rounded-md border border-sand bg-cream px-3.5 py-2 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss sm:block">
              Entrar
            </button>
            <button onClick={onAcessar} className="rounded-md bg-pine px-4 py-2 text-[12.5px] font-extrabold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.97]">
              Testar {TRIAL_DIAS} dias grátis
            </button>
          </div>
        </div>
      </header>

      {/* ---------- hero ---------- */}
      <section className="rail-texture relative overflow-hidden bg-pine text-cream">
        <div className="pointer-events-none absolute -top-40 -right-32 size-[560px] rounded-full border border-lime/10" />
        <div className="pointer-events-none absolute -top-24 -right-16 size-[380px] rounded-full border border-lime/15" />
        <div className="relative mx-auto grid max-w-[1160px] items-center gap-12 px-4 pt-14 pb-24 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-3.5 py-1.5 text-[10.5px] font-extrabold tracking-[0.2em] text-lime uppercase">
              <span className="pulse-dot inline-block size-1.5 rounded-full bg-lime" />
              Plataforma GRC · LGPD + GDPR + ISO
            </p>
            <h1 className="font-display mt-6 text-[44px] leading-[0.98] font-extrabold tracking-tight sm:text-[62px]">
              Todo dado pessoal<br />da sua empresa,<br />
              <span className="relative inline-block text-lime">
                no radar.
                <svg viewBox="0 0 220 12" className="absolute -bottom-2 left-0 w-full" fill="none" aria-hidden="true">
                  <path d="M3 9c40-6 140-8 214-3" stroke="#c9e94f" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-[520px] text-[15.5px] leading-relaxed text-cream/70">
              Mapeie operações, fundamente bases legais, gere políticas em PDF e responda titulares no prazo —
              com uma <strong className="text-cream">IA que faz o trabalho pesado</strong> e não envia seus dados para lugar nenhum.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3.5">
              <button onClick={onAcessar} className="group inline-flex items-center gap-2.5 rounded-md bg-lime px-6 py-3.5 text-[14.5px] font-extrabold text-pine shadow-[0_16px_36px_-14px_rgba(201,233,79,0.55)] transition hover:bg-lime-soft active:scale-[0.98]">
                Começar {TRIAL_DIAS} dias grátis
                <Ic name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={demo} disabled={demoCarregando} className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-6 py-3.5 text-[14px] font-bold text-cream transition hover:border-lime/60 hover:text-lime active:scale-[0.98] disabled:opacity-60">
                {demoCarregando ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" /> : <Ic name="radar" size={16} />}
                Ver o sistema por dentro
              </button>
            </div>
            <p className="mt-4 text-[11.5px] font-semibold text-cream/45">
              Sem cartão de crédito · depois {PRECO_MENSAL}/mês · cancele quando quiser
            </p>
          </div>

          <Reveal delay={150}>
            <RadarHero />
          </Reveal>
        </div>

        {/* marquee regulatório */}
        <div className="marquee relative border-t border-lime/15 bg-pine-deep/70 py-3">
          <div className="marquee-track flex w-max items-center gap-8">
            {[...MARQUEE, ...MARQUEE].map((m, i) => (
              <span key={i} className="flex items-center gap-8 whitespace-nowrap text-[11px] font-extrabold tracking-[0.22em] text-cream/40">
                {m} <Ic name="spark" size={10} sw={2.6} className="text-lime/50" />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- stats ---------- */}
      <section ref={statsRef} className="rail-texture relative border-b border-pine-line bg-pine py-12 text-cream">
        <div className="mx-auto grid max-w-[1160px] grid-cols-2 gap-8 px-4 sm:px-6 lg:grid-cols-4">
          {[
            { alvo: 11, suf: "", l: "frameworks e certificações", d: "das 7 ISO ao SOC 2 e PCI-DSS" },
            { alvo: 2, suf: "min", l: "para mapear uma operação", d: "descreva em uma frase; a IA estrutura" },
            { alvo: 15, suf: "d", l: "prazo do titular sob controle", d: "fila com contagem automática (LGPD)" },
            { alvo: 100, suf: "%", l: "da IA roda no navegador", d: "nenhum dado pessoal sai do seu ambiente" },
          ].map((s, i) => (
            <Reveal key={s.l} delay={i * 70}>
              <div className="border-l-2 border-lime/40 pl-4">
                <Contador alvo={s.alvo} sufixo={s.suf} visto={statsVisto} />
                <p className="mt-1.5 text-[13px] leading-tight font-bold text-cream">{s.l}</p>
                <p className="mt-0.5 text-[11px] text-cream/50">{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- módulos ---------- */}
      <section id="produto" className="mx-auto max-w-[1160px] px-4 py-20 sm:px-6">
        <Reveal>
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-moss uppercase">
                <span className="inline-block h-px w-7 bg-moss" /> O que vem dentro
              </p>
              <h2 className="font-display max-w-[560px] text-[34px] leading-[1.02] font-extrabold tracking-tight sm:text-[42px]">
                Um sistema, <span className="text-moss">cinco frentes</span> de conformidade.
              </h2>
            </div>
            <p className="max-w-[340px] text-[13.5px] leading-relaxed text-ink-soft">
              Pare de costurar planilha + consultoria + advogado. O Radar GRC nasce do registro e termina no documento do auditor.
            </p>
          </div>
        </Reveal>

        <div className="divide-y divide-sand border-y border-sand">
          {MODULOS.map((m, i) => (
            <Reveal key={m.n} delay={Math.min(i * 60, 240)}>
              <div className="group relative grid gap-4 overflow-hidden px-5 py-7 transition-colors duration-300 hover:bg-cream sm:grid-cols-[86px_1fr] lg:grid-cols-[86px_1.15fr_1fr]">
                <span className="pointer-events-none absolute inset-y-0 left-0 w-1 origin-top scale-y-0 transition-transform duration-300 group-hover:scale-y-100" style={{ background: m.cor }} />
                <div className="flex items-start gap-4 sm:block">
                  <span className="font-display text-[30px] leading-none font-extrabold text-sand transition-colors duration-300 group-hover:text-ink/25">{m.n}</span>
                  <span className="grid size-11 place-items-center rounded-lg border border-sand bg-cream transition-transform duration-300 group-hover:-translate-y-1 group-hover:shadow-md" style={{ color: m.cor }}>
                    <Ic name={m.ic} size={21} sw={2} />
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-[21px] font-extrabold tracking-tight text-ink transition-transform duration-300 group-hover:translate-x-1">{m.titulo}</h3>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.tags.map((t) => (
                      <span key={t} className="rounded-md border border-sand bg-paper px-2 py-0.5 text-[10.5px] font-extrabold tracking-wide uppercase" style={{ color: m.cor }}>{t}</span>
                    ))}
                  </div>
                </div>
                <p className="max-w-[460px] self-center text-[13.5px] leading-relaxed text-ink-soft">{m.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- IA ---------- */}
      <section id="ia" className="rail-texture relative overflow-hidden bg-pine py-20 text-cream">
        <div className="pointer-events-none absolute -bottom-40 -left-32 size-[480px] rounded-full border border-lime/10" />
        <div className="relative mx-auto grid max-w-[1160px] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-lime uppercase">
              <span className="inline-block h-px w-7 bg-lime" /> Inteligência embarcada
            </p>
            <h2 className="font-display text-[34px] leading-[1.02] font-extrabold tracking-tight sm:text-[42px]">
              Escreva como fala.<br />A IA entrega o <span className="text-lime">registro do art. 37.</span>
            </h2>
            <p className="mt-5 max-w-[460px] text-[14.5px] leading-relaxed text-cream/70">
              O assistente entende português (e inglês, para o GDPR), identifica as categorias de dados,
              escolhe a base legal com fundamentação, define retenção, sugere salvaguardas e calcula o risco 5×5.
            </p>
            <ul className="mt-7 space-y-3.5">
              {[
                { ic: "scale", t: "Base legal fundamentada", d: "art. 7º/11 LGPD e Art. 6/9 GDPR, com o porquê da escolha." },
                { ic: "matrix", t: "Risco calculado na hora", d: "probabilidade × impacto, com alerta de RIPD/DPIA obrigatória." },
                { ic: "lock", t: "Privacidade por arquitetura", d: "classificação heurística 100% local — nenhum dado vai à nuvem." },
              ].map((b) => (
                <li key={b.t} className="flex items-start gap-3.5">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md border border-lime/30 bg-pine-deep text-lime"><Ic name={b.ic} size={16} sw={2} /></span>
                  <span>
                    <span className="block text-[14px] font-bold text-cream">{b.t}</span>
                    <span className="block text-[12px] leading-snug text-cream/55">{b.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <Reveal delay={120}>
            <DemoIa />
          </Reveal>
        </div>
      </section>

      {/* ---------- como funciona ---------- */}
      <section className="mx-auto max-w-[1160px] px-4 py-20 sm:px-6">
        <Reveal>
          <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-moss uppercase">
            <span className="inline-block h-px w-7 bg-moss" /> Do zero ao auditor em 3 passos
          </p>
          <h2 className="font-display mb-12 max-w-[620px] text-[34px] leading-[1.02] font-extrabold tracking-tight sm:text-[42px]">
            Conformidade que <span className="text-moss">anda sozinha.</span>
          </h2>
        </Reveal>
        <div className="relative grid gap-10 sm:grid-cols-3">
          <span className="absolute top-[26px] right-[16%] left-[16%] hidden border-t-2 border-dashed border-sand sm:block" aria-hidden="true" />
          {PASSOS.map((p, i) => (
            <Reveal key={p.n} delay={i * 110}>
              <div className="relative">
                <span className="relative z-10 grid size-[52px] place-items-center rounded-full border-2 border-pine bg-paper font-display text-[22px] font-extrabold text-pine shadow-sm transition-transform duration-300 hover:scale-110">
                  {p.n}
                </span>
                <h3 className="font-display mt-4 text-[19px] font-extrabold tracking-tight text-ink">{p.t}</h3>
                <p className="mt-2 max-w-[320px] text-[13.5px] leading-relaxed text-ink-soft">{p.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------- preço ---------- */}
      <section id="preco" className="relative overflow-hidden border-y border-pine-line bg-paper-deep/60 py-20">
        <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
          <Reveal>
            <div className="overflow-hidden rounded-xl border border-pine-line bg-cream shadow-[0_36px_70px_-30px_rgba(12,31,24,0.5)] lg:grid lg:grid-cols-[1fr_1.15fr]">
              <div className="rail-texture relative bg-pine p-8 text-cream sm:p-10">
                <div className="pointer-events-none absolute -top-16 -right-16 size-56 rounded-full border border-lime/15" />
                <p className="inline-flex items-center gap-2 rounded-full border border-amber/50 bg-pine-deep/70 px-3 py-1 text-[10px] font-extrabold tracking-[0.18em] text-amber uppercase">
                  <Ic name="clock" size={11} sw={2.4} /> {TRIAL_DIAS} dias grátis · sem cartão
                </p>
                <h2 className="font-display mt-5 text-[26px] leading-tight font-extrabold tracking-tight sm:text-[30px]">
                  Plano <span className="text-lime">Completo</span>
                </h2>
                <p className="mt-6 flex items-end gap-2.5">
                  <span className="font-display text-[68px] leading-none font-extrabold tracking-tight text-lime">R$ 149<span className="text-[30px]">,00</span></span>
                  <span className="pb-2.5 text-[14px] font-bold text-cream/60">/mês</span>
                </p>
                <p className="mt-4 max-w-[340px] text-[13px] leading-relaxed text-cream/65">
                  Preço único. Sem cobrança por usuário, por registro ou por documento. Sem surpresa no fim do mês.
                </p>
                <button onClick={onAcessar} className="group mt-8 inline-flex w-full items-center justify-center gap-2.5 rounded-md bg-lime px-6 py-4 text-[15px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98] sm:w-auto">
                  Começar agora — é grátis por {TRIAL_DIAS} dias
                  <Ic name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                <p className="mt-3.5 text-[11px] font-semibold text-cream/40">Acesso total imediato · cancele quando quiser</p>
              </div>
              <div className="p-8 sm:p-10">
                <p className="font-display text-[17px] font-extrabold text-ink">Tudo incluso, sem asterisco:</p>
                <ul className="mt-5 grid gap-x-6 gap-y-3 sm:grid-cols-2">
                  {PRECO_ITENS.map((it, i) => (
                    <Reveal key={it} delay={i * 40}>
                      <li className="flex items-start gap-2.5 text-[13px] leading-snug font-semibold text-ink-soft">
                        <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-moss/12 text-moss"><Ic name="check" size={11} sw={3.2} /></span>
                        {it}
                      </li>
                    </Reveal>
                  ))}
                </ul>
                <div className="mt-7 flex flex-wrap items-center gap-3 rounded-lg border border-dashed border-sand bg-paper px-4 py-3.5">
                  <Ic name="spark" size={16} className="text-moss" sw={2.2} />
                  <p className="text-[12px] leading-snug font-semibold text-ink-soft">
                    White-label, SSO e consultoria DPO? <a href="mailto:comercial@radargrc.app" className="font-extrabold text-moss underline decoration-moss/40 underline-offset-2 transition hover:text-pine">Fale com o comercial</a> — proposta sob consulta.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- segurança ---------- */}
      <section className="rail-texture bg-pine py-16 text-cream">
        <div className="mx-auto max-w-[1160px] px-4 sm:px-6">
          <Reveal>
            <div className="flex flex-wrap items-center justify-between gap-6">
              <div>
                <p className="mb-2 flex items-center gap-2 text-[11px] font-extrabold tracking-[0.18em] text-lime uppercase">
                  <span className="inline-block h-px w-7 bg-lime" /> Segurança de ponta a ponta
                </p>
                <h2 className="font-display max-w-[480px] text-[30px] leading-[1.04] font-extrabold tracking-tight sm:text-[36px]">
                  Um sistema de privacidade que <span className="text-lime">respeita a sua.</span>
                </h2>
              </div>
              <button onClick={() => irPara("faq")} className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-5 py-3 text-[13px] font-bold text-cream transition hover:border-lime/60 hover:text-lime">
                <Ic name="shield" size={15} /> Como protegemos o sistema
              </button>
            </div>
          </Reveal>
          <div className="mt-10 grid gap-x-8 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { ic: "lock", t: "Acesso corporativo", d: "Somente e-mail de domínio corporativo; senhas SHA-256 + salt." },
              { ic: "bell", t: "Anti força-bruta", d: "Bloqueio progressivo e expiração de sessão por inatividade." },
              { ic: "doc", t: "Auditoria total", d: "Trilha de eventos exportável — accountability pronta (Art. 37)." },
              { ic: "eye", t: "Camada anticópia", d: "Marca d'água por sessão, anti-iframe e monitoramento de inspeção." },
            ].map((s, i) => (
              <Reveal key={s.t} delay={i * 60}>
                <div className="group flex items-start gap-3.5 border-t border-pine-line pt-5">
                  <span className="grid size-10 shrink-0 place-items-center rounded-md border border-lime/25 bg-pine-deep text-lime transition-transform duration-300 group-hover:-translate-y-1">
                    <Ic name={s.ic} size={17} sw={2} />
                  </span>
                  <span>
                    <span className="block text-[14px] font-bold text-cream">{s.t}</span>
                    <span className="mt-1 block text-[11.5px] leading-snug text-cream/55">{s.d}</span>
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="faq" className="mx-auto max-w-[1160px] px-4 py-20 sm:px-6">
        <Reveal>
          <div className="mb-10 text-center">
            <p className="mb-2 text-[11px] font-extrabold tracking-[0.18em] text-moss uppercase">Perguntas frequentes</p>
            <h2 className="font-display text-[32px] font-extrabold tracking-tight sm:text-[40px]">Antes de você perguntar…</h2>
          </div>
        </Reveal>
        <Reveal delay={100}>
          <div className="overflow-hidden rounded-xl border border-sand bg-paper/50">
            <Faq />
          </div>
        </Reveal>
      </section>

      {/* ---------- CTA final ---------- */}
      <section className="rail-texture relative overflow-hidden bg-pine py-20 text-cream">
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[620px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/10" />
        <div className="pointer-events-none absolute top-1/2 left-1/2 size-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-lime/15" />
        <div className="relative mx-auto max-w-[760px] px-4 text-center sm:px-6">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-3.5 py-1.5 text-[10.5px] font-extrabold tracking-[0.2em] text-lime uppercase">
              <span className="pulse-dot inline-block size-1.5 rounded-full bg-lime" /> Leva 2 minutos para começar
            </p>
            <h2 className="font-display text-[38px] leading-[1.02] font-extrabold tracking-tight sm:text-[52px]">
              A ANPD não avisa<br />quando vai fiscalizar.
            </h2>
            <p className="mx-auto mt-5 max-w-[480px] text-[14.5px] leading-relaxed text-cream/65">
              Comece hoje com {TRIAL_DIAS} dias grátis. Se não servir para a sua operação, você não paga nada —
              e exporta todos os seus registros.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
              <button onClick={onAcessar} className="group inline-flex items-center gap-2.5 rounded-md bg-lime px-7 py-4 text-[15px] font-extrabold text-pine shadow-[0_18px_40px_-16px_rgba(201,233,79,0.6)] transition hover:bg-lime-soft active:scale-[0.98]">
                Criar minha conta grátis
                <Ic name="arrow" size={16} className="transition-transform group-hover:translate-x-1" />
              </button>
              <button onClick={demo} disabled={demoCarregando} className="inline-flex items-center gap-2 rounded-md border border-cream/25 px-7 py-4 text-[14px] font-bold text-cream transition hover:border-lime/60 hover:text-lime disabled:opacity-60">
                {demoCarregando ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-cream/30 border-t-cream" /> : <Ic name="radar" size={16} />}
                Explorar a demo
              </button>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------- footer ---------- */}
      <footer className="border-t border-pine-line bg-pine-deep py-10 text-cream">
        <div className="mx-auto flex max-w-[1160px] flex-wrap items-center justify-between gap-6 px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md border border-lime/30 bg-pine text-lime"><Ic name="radar" size={16} /></span>
            <div>
              <p className="font-display text-[14px] font-extrabold">Radar<span className="text-lime">GRC</span></p>
              <p className="text-[10px] tracking-widest text-cream/40 uppercase">LGPD · GDPR · ISO · IA</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-7 gap-y-2 text-[12px] font-semibold text-cream/55">
            <button onClick={() => irPara("produto")} className="transition hover:text-lime">Produto</button>
            <button onClick={() => irPara("ia")} className="transition hover:text-lime">IA</button>
            <button onClick={() => irPara("preco")} className="transition hover:text-lime">Preço</button>
            <button onClick={() => irPara("faq")} className="transition hover:text-lime">FAQ</button>
            <a href="mailto:contato@radargrc.app" className="transition hover:text-lime">contato@radargrc.app</a>
          </div>
          <p className="w-full text-[10.5px] leading-relaxed text-cream/35 sm:w-auto sm:max-w-[300px] sm:text-right">
            © 2026 Radar GRC. Plataforma de mapeamento e conformidade.
            Este site não constitui aconselhamento jurídico.
          </p>
        </div>
      </footer>
    </div>
  );
}
