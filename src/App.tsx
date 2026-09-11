import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./auth";
import { TRIAL_DIAS } from "./auth";
import { StoreProvider, useStore } from "./store";
import { BASES_ART7, BASES_ART11, TODAS_BASES } from "./domain";
import { iniciarProtecao } from "./protection";
import { Ic, ToastHost, Cabecalho, Reveal } from "./components/ui";
import { BrandedHeader, BrandedSidebar, BrandedLogo } from "./components/BrandedComponents";
import AuthScreen from "./components/AuthScreen";
import Landing from "./components/Landing";
import Dashboard from "./components/Dashboard";
import Assistant from "./components/Assistant";
import Activities from "./components/Activities";
import RiskMatrix from "./components/RiskMatrix";
import Requests from "./components/Requests";
import Gdpr from "./components/Gdpr";
import GdprAvancado from "./components/GdprAvancado";
import Iso from "./components/Iso";
import Plans, { TrialGate, diasRestantesTrial } from "./components/Plans";
import AdminPanel from "./components/AdminPanel";
import Reports from "./components/Reports";
import Security from "./components/Security";
import Cookies from "./components/Cookies";
import AccountModal from "./components/AccountModal";
import GapAnalysis from "./components/GapAnalysis";
import { ScreenProtection } from "./components/ScreenProtection";
import Siem from "./components/Siem";
import PentestLab from "./components/PentestLab";
import PrivacyByDesign from "./components/PrivacyByDesign";
import AuditoriaTI from "./components/AuditoriaTI";
import Comite from "./components/Comite";
import StatusReport from "./components/StatusReport";
import WhiteLabelAdmin from "./components/WhiteLabelAdmin";

type Page =
  | "dashboard" | "assistente"
  | "lgpd-registro" | "lgpd-risco" | "lgpd-titulares" | "lgpd-bases"
  | "gdpr-ropa" | "gdpr-avancado"
  | "iso" | "ai-gov" | "cookies"
  | "gap-analysis" | "siem" | "pentest-lab" | "privacy-by-design" | "auditoria-ti" | "comite" | "status-report"
  | "relatorios" | "seguranca" | "planos" | "admin";

const NAV: { secao: string; admin?: boolean; itens: { id: Page; label: string; icone: string; badge?: "ia" }[] }[] = [
  { secao: "Operação", itens: [
    { id: "dashboard", label: "Visão geral", icone: "grid" },
    { id: "assistente", label: "Assistente IA", icone: "spark", badge: "ia" },
  ]},
  { secao: "LGPD · Brasil", itens: [
    { id: "lgpd-registro", label: "Registro art. 37", icone: "layers" },
    { id: "lgpd-risco", label: "Matriz de risco", icone: "matrix" },
    { id: "lgpd-titulares", label: "Titulares", icone: "user" },
    { id: "lgpd-bases", label: "Bases legais", icone: "scale" },
  ]},
  { secao: "GDPR · União Europeia", itens: [
    { id: "gdpr-ropa", label: "ROPA (Art. 30)", icone: "doc" },
    { id: "gdpr-avancado", label: "DPIA & bases", icone: "globe" },
  ]},
  { secao: "Governança", itens: [
    { id: "iso", label: "Frameworks ISO", icone: "brain" },
    { id: "ai-gov", label: "Governança de IA", icone: "spark" },
    { id: "cookies", label: "Gestão de Cookies", icone: "filter" },
    { id: "gap-analysis", label: "Gap Analysis", icone: "matrix" },
    { id: "privacy-by-design", label: "Privacy by Design", icone: "shield" },
    { id: "comite", label: "Comitê LGPD/GDPR", icone: "user" },
  ]},
  { secao: "Segurança Ofensiva", itens: [
    { id: "siem", label: "SIEM", icone: "eye" },
    { id: "pentest-lab", label: "Laboratório Pentest", icone: "shield" },
    { id: "auditoria-ti", label: "Auditoria em TI", icone: "doc" },
  ]},
  { secao: "Gestão", itens: [
    { id: "status-report", label: "Status Report", icone: "doc" },
  ]},
  { secao: "Entrega", itens: [
    { id: "relatorios", label: "Relatórios", icone: "printer" },
    { id: "seguranca", label: "Segurança", icone: "shield" },
    { id: "planos", label: "Assinatura", icone: "star" },
  ]},
  { secao: "Administração", admin: true, itens: [
    { id: "admin", label: "Painel admin", icone: "shield" },
  ]},
];

const TITULOS: Record<Page, string> = {
  dashboard: "Visão geral",
  assistente: "Assistente IA",
  "lgpd-registro": "Registro de atividades (art. 37)",
  "lgpd-risco": "Matriz de risco 5×5",
  "lgpd-titulares": "Solicitações de titulares",
  "lgpd-bases": "Bases legais LGPD",
  "gdpr-ropa": "ROPA — Art. 30 GDPR",
  "gdpr-avancado": "GDPR — DPIA, bases e transferências",
  iso: "Programas ISO & certificações",
  "ai-gov": "Governança de IA (ISO 42001 / AI Act)",
  cookies: "Gestão de Cookies & consentimento",
  "gap-analysis": "Gap Analysis",
  siem: "SIEM — Monitoramento de segurança",
  "pentest-lab": "Laboratório de Pentest",
  "privacy-by-design": "Privacy by Design",
  "auditoria-ti": "Auditoria em TI",
  comite: "Comitê LGPD & GDPR",
  "status-report": "Status Report de Projetos",
  relatorios: "Relatórios & exportações",
  seguranca: "Central de segurança",
  planos: "Assinatura & plano",
  admin: "Painel administrativo",
};

function Splash() {
  return (
    <div className="grid h-full place-items-center bg-pine">
      <div className="text-center">
        <span className="relative mx-auto grid size-16 place-items-center overflow-hidden rounded-xl border border-lime/40 bg-pine-deep">
          <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.4), transparent 75deg)" }} />
          <Ic name="radar" size={30} className="relative text-lime" sw={1.9} />
        </span>
        <p className="font-display mt-4 text-[15px] font-bold tracking-[0.22em] text-cream uppercase">Radar<span className="text-lime">GRC</span></p>
      </div>
    </div>
  );
}

function BasesLegais() {
  const { atividades } = useStore();
  const conta = (id: string) => atividades.filter((a) => a.baseLegalId === id).length;
  const Secao = ({ titulo, bases, cor }: { titulo: string; bases: typeof BASES_ART7; cor: string }) => (
    <Reveal>
      <p className="mb-2 text-[11px] font-bold tracking-[0.16em] uppercase" style={{ color: cor }}>{titulo}</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {bases.map((b, i) => {
          const n = conta(b.id);
          return (
            <Reveal key={b.id} delay={i * 40}>
              <div className="h-full rounded-lg border border-sand bg-cream p-4 transition hover:-translate-y-0.5 hover:border-moss/50 hover:shadow-[0_12px_28px_-16px_rgba(19,46,38,0.45)]">
                <div className="flex items-start justify-between gap-2">
                  <span className="rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold" style={{ background: `${cor}1a`, color: cor }}>{b.inciso}</span>
                  {n > 0 && <span className="font-display text-[15px] font-extrabold" style={{ color: cor }}>{n}×</span>}
                </div>
                <p className="font-display mt-2 text-[14px] font-bold text-ink">{b.titulo}</p>
                <p className="mt-1 text-[11.5px] leading-relaxed text-ink-soft">{b.descricao}</p>
              </div>
            </Reveal>
          );
        })}
      </div>
    </Reveal>
  );
  return (
    <div>
      <Cabecalho kicker="LGPD · licitude do tratamento" titulo="Bases legais — Art. 7º e 11" desc="As 10 hipóteses do Art. 7º e as 7 do Art. 11 (dados sensíveis). Os contadores refletem o uso real no seu registro." />
      <div className="space-y-6">
        <Secao titulo="Art. 7º — dados pessoais" bases={BASES_ART7} cor="var(--color-moss)" />
        <Secao titulo="Art. 11 — dados sensíveis" bases={BASES_ART11} cor="var(--color-rust)" />
      </div>
    </div>
  );
}

function Shell() {
  const { usuario, sair } = useAuth();
  const { score, solicitacoes, registrar } = useStore();
  const [pagina, setPagina] = useState<Page>("dashboard");
  const [menuAberto, setMenuAberto] = useState(false);
  const [menuUser, setMenuUser] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const userRef = useRef(usuario);

  useEffect(() => {
    const prev = userRef.current;
    userRef.current = usuario;
    if (usuario && prev !== usuario) registrar("auth", `Login efetuado: ${usuario.email}`);
    if (!usuario && prev) registrar("auth", `Logout: ${prev.email}`);
  }, [usuario, registrar]);

  const ehAdmin = usuario?.papel === "admin";
  const trialDias = diasRestantesTrial(usuario?.trialAte);
  const irPara = (p: string) => { setPagina(p as Page); setMenuAberto(false); };
  const iniciais = (usuario?.nome ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const planoChip = usuario?.demo
    ? { txt: "DEMO", cls: "bg-paper-deep text-ink-soft border-sand" }
    : usuario?.plano === "completo" ? { txt: "COMPLETO", cls: "bg-moss/12 text-moss border-moss/40" }
    : usuario?.plano === "business" ? { txt: "BUSINESS", cls: "bg-moss/12 text-moss border-moss/40" }
    : usuario?.plano === "standard" ? { txt: "STANDARD", cls: "bg-paper-deep text-ink-soft border-sand" }
    : trialDias > 0 ? { txt: `TRIAL ${trialDias}D`, cls: "bg-amber-soft text-ink border-amber/60" }
    : { txt: "ASSINAR", cls: "bg-rust-soft text-rust border-rust/50" };

  const abertas = solicitacoes.filter((s) => s.status !== "concluida");

  const NavList = () => (
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      {NAV.filter((s) => !s.admin || ehAdmin).map((sec) => (
        <div key={sec.secao}>
          <p className={`px-2.5 pt-4 pb-1.5 text-[9.5px] font-bold tracking-[0.2em] uppercase ${sec.admin ? "text-lime/60" : "text-cream/35"}`}>{sec.secao}</p>
          <div className="space-y-0.5">
            {sec.itens.map((n) => (
              <button key={n.id} onClick={() => irPara(n.id)} className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-all duration-150 ${pagina === n.id ? "bg-lime text-pine shadow-sm" : "text-cream/65 hover:bg-pine-line/60 hover:text-cream"}`}>
                <Ic name={n.icone} size={16} sw={pagina === n.id ? 2.1 : 1.8} className={pagina === n.id ? "" : "transition-transform group-hover:scale-110"} />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge === "ia" && <span className="rounded-sm bg-lime px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wider text-pine uppercase">IA</span>}
              </button>
            ))}
          </div>
        </div>
      ))}
    </nav>
  );

  const SidebarInner = (
    <>
      <button onClick={() => irPara("dashboard")} className="group flex items-center gap-3 px-5 pt-5 pb-4 text-left">
        <BrandedLogo className="flex-1" />
      </button>
      <NavList />
      <div className="mx-3 mb-4 flex items-center justify-between rounded-md border px-3 py-2" style={{ borderColor: 'var(--brand-secondary)', backgroundColor: 'rgba(0,0,0,0.2)' }}>
        <span className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.14em] uppercase" style={{ color: 'var(--brand-secondary)' }}>
          <span className="pulse-dot size-1.5 rounded-full" style={{ backgroundColor: 'var(--brand-secondary)' }} /> online
        </span>
        <span className="text-[9px] font-bold" style={{ color: 'rgba(255,255,255,0.35)' }}>5 frameworks · IA</span>
      </div>
    </>
  );

  return (
    <div className="protegido flex h-full">
      <ScreenProtection />
      <BrandedSidebar className="rail-texture sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-pine-line lg:flex">
        {SidebarInner}
      </BrandedSidebar>

      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog">
          <div className="absolute inset-0 bg-pine-deep/60" onClick={() => setMenuAberto(false)} />
          <BrandedSidebar className="rail-texture anim-rise absolute top-0 left-0 flex h-full w-[264px] flex-col border-r border-pine-line shadow-2xl">
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-3 rounded-md p-1.5 text-cream/60 hover:text-cream" aria-label="Fechar menu"><Ic name="x" size={16} /></button>
            {SidebarInner}
          </BrandedSidebar>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <BrandedHeader className="sticky top-0 z-30 border-b backdrop-blur-md">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setMenuAberto(true)} className="rounded-md border p-2 lg:hidden" style={{ borderColor: 'var(--brand-secondary)', backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }} aria-label="Abrir menu"><Ic name="menu" size={16} /></button>
            <h2 className="font-display hidden text-[15px] font-bold md:block" style={{ color: 'white' }}>{TITULOS[pagina]}</h2>

            <button onClick={() => irPara("planos")} className="ml-auto hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10.5px] font-extrabold tracking-[0.12em] transition hover:opacity-85 sm:inline-flex" style={{ borderColor: 'var(--brand-secondary)', backgroundColor: 'var(--brand-secondary)', color: 'var(--brand-text)' }} title="Ver plano e assinatura">
              <Ic name="star" size={11} sw={2.4} /> {planoChip.txt}
            </button>

            <button onClick={() => irPara("lgpd-titulares")} className="relative rounded-md border p-2 transition" style={{ borderColor: 'var(--brand-secondary)', backgroundColor: 'var(--brand-background)', color: 'var(--brand-text)' }} aria-label="Solicitações pendentes" title={`${abertas.length} solicitação(ões) em aberto`}>
              <Ic name="bell" size={16} />
              {abertas.length > 0 && <span className="absolute -top-1.5 -right-1.5 grid min-w-4.5 place-items-center rounded-full px-1 py-px text-[9px] font-extrabold" style={{ backgroundColor: 'var(--brand-secondary)', color: 'var(--brand-text)' }}>{abertas.length}</span>}
            </button>

            <div className="relative">
              <button onClick={() => setMenuUser((v) => !v)} className="flex items-center gap-2 rounded-md border px-2 py-1.5 transition" style={{ borderColor: menuUser ? 'var(--brand-primary)' : 'var(--brand-secondary)', backgroundColor: menuUser ? 'var(--brand-primary)' : 'var(--brand-background)', color: menuUser ? 'white' : 'var(--brand-text)' }} aria-label="Menu do usuário">
                <span className="grid size-7 place-items-center rounded-full text-[11px] font-extrabold" style={{ backgroundColor: 'var(--brand-primary)', color: 'white' }}>{iniciais}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[120px] truncate text-[12px] leading-tight font-bold" style={{ color: 'var(--brand-text)' }}>{usuario?.nome}</span>
                  <span className="block max-w-[120px] truncate text-[10px]" style={{ color: 'var(--brand-text)', opacity: 0.6 }}>{usuario?.empresa || usuario?.email}</span>
                </span>
              </button>
              {menuUser && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuUser(false)} />
                  <div className="anim-pop absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border shadow-[0_18px_40px_-16px_rgba(12,31,24,0.4)]" style={{ borderColor: 'var(--brand-secondary)', backgroundColor: 'var(--brand-background)' }}>
                    <div className="border-b px-3.5 py-3" style={{ borderColor: 'var(--brand-secondary)', backgroundColor: 'var(--brand-background)' }}>
                      <p className="truncate text-[12.5px] font-bold" style={{ color: 'var(--brand-text)' }}>{usuario?.nome}</p>
                      <p className="truncate text-[11px]" style={{ color: 'var(--brand-text)', opacity: 0.6 }}>{usuario?.email}</p>
                    </div>
                    <button onClick={() => { setContaAberta(true); setMenuUser(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-semibold transition" style={{ color: 'var(--brand-text)' }}><Ic name="user" size={15} /> Minha conta</button>
                    <button onClick={() => { irPara("planos"); setMenuUser(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-semibold transition" style={{ color: 'var(--brand-text)' }}><Ic name="star" size={15} /> Assinatura</button>
                    {ehAdmin && <button onClick={() => { irPara("admin"); setMenuUser(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-semibold transition" style={{ color: 'var(--brand-text)' }}><Ic name="shield" size={15} /> Painel admin</button>}
                    <button onClick={() => { registrar("auth", `Logout solicitado: ${usuario?.email}`); sair(); }} className="flex w-full items-center gap-2.5 border-t px-3.5 py-2.5 text-[12.5px] font-bold transition" style={{ borderColor: 'var(--brand-secondary)', color: '#bd4f26' }}><Ic name="x" size={15} /> Sair da conta</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </BrandedHeader>

        <main key={pagina} className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1160px] px-4 py-6 sm:px-6">
            {pagina === "dashboard" && <Dashboard irPara={irPara} />}
            {pagina === "assistente" && <Assistant onUpgrade={() => irPara("planos")} />}
            {pagina === "lgpd-registro" && <Activities onUpgrade={() => irPara("planos")} />}
            {pagina === "lgpd-risco" && <RiskMatrix />}
            {pagina === "lgpd-titulares" && <Requests onUpgrade={() => irPara("planos")} />}
            {pagina === "lgpd-bases" && <BasesLegais />}
            {pagina === "gdpr-ropa" && <Gdpr onUpgrade={() => irPara("planos")} />}
            {pagina === "gdpr-avancado" && <GdprAvancado />}
            {pagina === "iso" && <Iso onUpgrade={() => irPara("planos")} />}
            {pagina === "ai-gov" && <Iso onUpgrade={() => irPara("planos")} inicial="ai-gov" />}
            {pagina === "cookies" && <Cookies />}
            {pagina === "gap-analysis" && <GapAnalysis />}
            {pagina === "siem" && <Siem />}
            {pagina === "pentest-lab" && <PentestLab />}
            {pagina === "privacy-by-design" && <PrivacyByDesign />}
            {pagina === "auditoria-ti" && <AuditoriaTI />}
            {pagina === "comite" && <Comite />}
            {pagina === "status-report" && <StatusReport />}
            {pagina === "relatorios" && <Reports />}
            {pagina === "seguranca" && <Security />}
            {pagina === "planos" && <Plans />}
            {pagina === "admin" && ehAdmin && <AdminPanel />}
          </div>
        </main>
      </div>

      <AccountModal aberto={contaAberta} onFechar={() => setContaAberta(false)} />
      <ToastHost />
    </div>
  );
}

function Root() {
  const { usuario, pronto, sair } = useAuth();
  const [tela, setTela] = useState<"landing" | "auth">("landing");

  /* conta bloqueada por administrador derruba a sessão ativa */
  useEffect(() => {
    if (usuario?.bloqueado) sair();
  }, [usuario, sair]);

  /* ao sair da conta, volta para o site de vendas */
  useEffect(() => {
    if (!usuario) setTela("landing");
  }, [usuario]);

  /* proteção anticópia global (ativa em todas as telas) */
  useEffect(() => {
    iniciarProtecao(usuario?.email);
  }, [usuario?.email]);

  if (!pronto) return <Splash />;
  if (!usuario) return tela === "landing" ? <Landing onAcessar={() => setTela("auth")} /> : <AuthScreen onVoltar={() => setTela("landing")} />;

  /* trava comercial: trial expirado e sem assinatura → tela de ativação */
  const trialExpirado = !usuario.demo && usuario.plano === "trial" && !!usuario.trialAte && new Date(usuario.trialAte).getTime() < Date.now();

  return (
    <StoreProvider key={usuario.id} storageKey={`radargrc:${usuario.id}`}>
      {trialExpirado ? <TrialGate /> : <Shell />}
    </StoreProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
