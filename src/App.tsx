import { useEffect, useRef, useState } from "react";
import { AuthProvider, limiteSessao, registrarSeguranca, useAuth } from "./auth";
import type { Usuario } from "./auth";
import { StoreProvider, useStore } from "./store";
import { diasDesde, prazoDe } from "./types";
import { Ic, ToastHost } from "./components/ui";
import AuthScreen from "./components/AuthScreen";
import AccountModal from "./components/AccountModal";
import Dashboard from "./components/Dashboard";
import Assistant from "./components/Assistant";
import Activities from "./components/Activities";
import RiskMatrix from "./components/RiskMatrix";
import Requests from "./components/Requests";
import Reference from "./components/Reference";
import Gdpr from "./components/Gdpr";
import Iso from "./components/Iso";
import Cookies from "./components/Cookies";
import Security from "./components/Security";
import Reports from "./components/Reports";
import AdminPanel from "./components/AdminPanel";
import Landing from "./components/Landing";
import Plans, { TrialGate, diasRestantesTrial } from "./components/Plans";
import { iniciarProtecao, useProtecao } from "./protection";

export type Page =
  | "dashboard" | "assistente"
  | "lgpd-registro" | "lgpd-risco" | "lgpd-titulares" | "lgpd-bases"
  | "gdpr-ropa" | "gdpr-bases" | "gdpr-dpia"
  | "iso" | "soc2" | "pcidss" | "ai-gov" | "cookies"
  | "relatorios" | "seguranca" | "planos" | "admin";

const ISO_IDS = ["iso27001", "iso27002", "iso27017", "iso27701", "iso31000", "iso37001", "iso37301"];
const CERT_IDS = ["soc2", "pcidss"];

const NAV: { secao: string; admin?: boolean; itens: { id: Page; label: string; icone: string; badge?: "ia" | "abertas" }[] }[] = [
  {
    secao: "Operação",
    itens: [
      { id: "dashboard", label: "Visão geral", icone: "grid" },
      { id: "assistente", label: "Assistente IA", icone: "spark", badge: "ia" },
    ],
  },
  {
    secao: "LGPD · Brasil",
    itens: [
      { id: "lgpd-registro", label: "Registro art. 37", icone: "layers" },
      { id: "lgpd-risco", label: "Matriz de risco", icone: "matrix" },
      { id: "lgpd-titulares", label: "Titulares", icone: "user", badge: "abertas" },
      { id: "lgpd-bases", label: "Bases legais", icone: "scale" },
    ],
  },
  {
    secao: "GDPR · União Europeia",
    itens: [
      { id: "gdpr-ropa", label: "ROPA (Art. 30)", icone: "doc" },
      { id: "gdpr-bases", label: "Bases Art. 6/9", icone: "globe" },
      { id: "gdpr-dpia", label: "DPIA e transferências", icone: "alert" },
    ],
  },
  {
    secao: "Governança ISO",
    itens: [{ id: "iso", label: "Frameworks ISO", icone: "brain" }],
  },
  {
    secao: "Certificações",
    itens: [
      { id: "soc2", label: "SOC 2 Type II", icone: "shield" },
      { id: "pcidss", label: "PCI-DSS v4.0", icone: "lock" },
    ],
  },
  {
    secao: "Governança Digital",
    itens: [
      { id: "ai-gov", label: "Governança de IA", icone: "spark" },
      { id: "cookies", label: "Gestão de Cookies", icone: "filter" },
    ],
  },
  {
    secao: "Entrega",
    itens: [
      { id: "relatorios", label: "Relatórios", icone: "printer" },
      { id: "seguranca", label: "Segurança", icone: "shield" },
      { id: "planos", label: "Assinatura", icone: "star" },
    ],
  },
  {
    secao: "Administração",
    admin: true,
    itens: [{ id: "admin", label: "Painel admin", icone: "lock" }],
  },
];

const TITULOS: Record<Page, string> = {
  dashboard: "Visão geral",
  assistente: "Assistente IA",
  "lgpd-registro": "Registro de atividades (art. 37)",
  "lgpd-risco": "Matriz de risco 5×5",
  "lgpd-titulares": "Solicitações de titulares",
  "lgpd-bases": "Bases legais LGPD",
  "gdpr-ropa": "ROPA — Art. 30 GDPR",
  "gdpr-bases": "Bases legais GDPR",
  "gdpr-dpia": "DPIA e transferências",
  iso: "Programas ISO",
  soc2: "Certificação SOC 2 Type II",
  pcidss: "Conformidade PCI-DSS v4.0",
  "ai-gov": "Governança de IA",
  cookies: "Gestão de Cookies",
  relatorios: "Relatórios",
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

/* marca d'água da sessão: identifica qualquer captura de tela compartilhada */
function MarcaDagua({ email }: { email: string }) {
  const texto = `${email} · radar grc · ${new Date().toLocaleDateString("pt-BR")}`;
  return (
    <div className="pointer-events-none fixed inset-0 z-[44] overflow-hidden select-none print:hidden" aria-hidden="true">
      <div className="absolute -inset-[25%] flex rotate-[-22deg] flex-wrap content-start items-start gap-x-14 gap-y-24 opacity-[0.04]">
        {Array.from({ length: 40 }).map((_, i) => (
          <span key={i} className="font-display text-[15px] font-extrabold tracking-[0.18em] whitespace-nowrap text-ink uppercase">
            {texto}
          </span>
        ))}
      </div>
    </div>
  );
}

function Shell() {
  const { usuario, sair } = useAuth();
  const { score, solicitacoes, registrar } = useStore();
  const [pagina, setPagina] = useState<Page>("dashboard");
  const [menuAberto, setMenuAberto] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const [menuUser, setMenuUser] = useState(false);
  const [buscaTopo, setBuscaTopo] = useState("");
  const [buscaAtividades, setBuscaAtividades] = useState("");
  const [nonce, setNonce] = useState(0);
  const userRef = useRef<Usuario | null>(null);

  /* auditoria de sessão */
  useEffect(() => {
    const prev = userRef.current;
    userRef.current = usuario;
    if (usuario && prev !== usuario) registrar("auth", `Login efetuado: ${usuario.email}`);
    if (!usuario && prev) registrar("auth", `Logout: ${prev.email}`);
  }, [usuario, registrar]);

  /* camada de proteção anticópia (ativa por sessão logada) */
  const protecao = useProtecao();
  useEffect(() => {
    if (usuario) iniciarProtecao(usuario.email, (detalhe) => registrar("seguranca", detalhe));
  }, [usuario, registrar]);

  /* expiração de sessão por inatividade */
  useEffect(() => {
    if (!usuario) return;
    const KEY = "radargrc:act";
    const limite = limiteSessao(usuario.papel);
    let last = Date.now();
    sessionStorage.setItem(KEY, String(last));
    const tocar = () => {
      const n = Date.now();
      if (n - last > 15_000) {
        last = n;
        sessionStorage.setItem(KEY, String(n));
      }
    };
    window.addEventListener("pointerdown", tocar);
    window.addEventListener("keydown", tocar);
    const iv = setInterval(() => {
      const act = Number(sessionStorage.getItem(KEY) || Date.now());
      if (Date.now() - act > limite) {
        registrarSeguranca("sessao_expirada", usuario.email, `Sessão encerrada após ${Math.round(limite / 60000)} min de inatividade.`);
        sessionStorage.setItem("radargrc:expired", "1");
        sair();
      }
    }, 20_000);
    return () => {
      clearInterval(iv);
      window.removeEventListener("pointerdown", tocar);
      window.removeEventListener("keydown", tocar);
    };
  }, [usuario, sair]);

  const abertas = solicitacoes.filter((s) => s.status !== "concluida");
  const urgentes = abertas.filter((s) => prazoDe(s) - diasDesde(s.data) <= 5);
  const irPara = (p: Page) => { setPagina(p); setMenuAberto(false); };
  const ehAdmin = usuario?.papel === "admin";

  const buscar = () => {
    setBuscaAtividades(buscaTopo);
    setNonce((n) => n + 1);
    setPagina("lgpd-registro");
    setBuscaTopo("");
  };

  const corScore = score >= 80 ? "text-moss" : score >= 60 ? "text-amber" : "text-rust";
  const iniciais = (usuario?.nome ?? "?").split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const papelBadge = ehAdmin
    ? { txt: "ADMIN", cls: "bg-pine text-lime border-pine-line" }
    : { txt: "OPERADOR", cls: "bg-paper-deep text-ink-soft border-sand" };

  const trialDias = diasRestantesTrial(usuario?.trialAte);
  const planoChip = usuario?.demo
    ? { txt: "DEMO", cls: "bg-paper-deep text-ink-soft border-sand" }
    : usuario?.plano === "completo"
      ? { txt: "COMPLETO", cls: "bg-moss/12 text-moss border-moss/40" }
      : trialDias > 0
        ? { txt: `TRIAL ${trialDias}D`, cls: "bg-amber-soft text-ink border-amber/60" }
        : { txt: "ASSINAR", cls: "bg-rust-soft text-rust border-rust/50" };

  const NavList = () => (
    <nav className="min-h-0 flex-1 overflow-y-auto px-3 pb-4">
      {NAV.filter((s) => !s.admin || ehAdmin).map((sec) => (
        <div key={sec.secao}>
          <p className={`px-2.5 pt-4 pb-1.5 text-[9.5px] font-bold tracking-[0.2em] uppercase ${sec.admin ? "text-lime/60" : "text-cream/35"}`}>{sec.secao}</p>
          <div className="space-y-0.5">
            {sec.itens.map((n) => (
              <button
                key={n.id}
                onClick={() => irPara(n.id)}
                className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-all duration-150 ${pagina === n.id ? "bg-lime text-pine shadow-sm" : "text-cream/65 hover:bg-pine-line/60 hover:text-cream"}`}
              >
                <Ic name={n.icone} size={16} sw={pagina === n.id ? 2.1 : 1.8} className={pagina === n.id ? "" : "transition-transform group-hover:scale-110"} />
                <span className="flex-1 text-left">{n.label}</span>
                {n.badge === "ia" && <span className="rounded-sm bg-lime px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wider text-pine uppercase">IA</span>}
                {n.badge === "abertas" && abertas.length > 0 && (
                  <span className={`grid min-w-5 place-items-center rounded-full px-1 py-0.5 text-[9.5px] font-extrabold ${urgentes.length ? "bg-amber text-pine" : "bg-pine-line text-cream/80"}`}>{abertas.length}</span>
                )}
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
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine-deep">
          <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
          <Ic name="radar" size={21} className="relative text-lime" sw={1.9} />
        </span>
        <span>
          <span className="font-display block text-[17px] leading-none font-extrabold tracking-tight text-cream">Radar<span className="text-lime">GRC</span></span>
          <span className="mt-1 block text-[9.5px] font-bold tracking-[0.18em] text-cream/40 uppercase">LGPD · GDPR · ISO</span>
        </span>
      </button>
      <NavList />
      {ehAdmin && (
        <div className="mx-3 mb-3 rounded-lg border border-lime/30 bg-pine-deep/80 p-3.5">
          <p className="text-[9.5px] font-extrabold tracking-[0.16em] text-lime uppercase">Sua organização</p>
          <p className="mt-1 truncate text-[12px] font-bold text-cream">{usuario?.empresa || "—"}</p>
          <button onClick={() => irPara("admin")} className="mt-2.5 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-lime px-3 py-1.5 text-[11.5px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98]">
            <Ic name="user" size={12} sw={2.4} /> Gerenciar usuários
          </button>
        </div>
      )}
      <div className="mx-3 mb-4 flex items-center justify-between rounded-md border border-pine-line bg-pine-deep/60 px-3 py-2">
        <span className="flex items-center gap-1.5 text-[9px] font-extrabold tracking-[0.14em] text-lime/80 uppercase">
          <span className="pulse-dot size-1.5 rounded-full bg-lime" /> v2.2 · online
        </span>
        <span className="text-[9px] font-bold text-cream/35">11 frameworks · PDF</span>
      </div>
    </>
  );

  return (
    <div className="protegido flex h-full">
      <MarcaDagua email={usuario?.email ?? "sessão"} />
      {/* sidebar desktop */}
      <aside className="rail-texture sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-pine-line bg-pine lg:flex print:hidden">
        {SidebarInner}
      </aside>

      {/* sidebar mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden print:hidden" role="dialog">
          <div className="absolute inset-0 bg-pine-deep/60" onClick={() => setMenuAberto(false)} />
          <aside className="rail-texture anim-rise absolute top-0 left-0 flex h-full w-[264px] flex-col border-r border-pine-line bg-pine shadow-2xl">
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-3 rounded-md p-1.5 text-cream/60 hover:text-cream" aria-label="Fechar menu">
              <Ic name="x" size={16} />
            </button>
            {SidebarInner}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {/* topo */}
        <header className="sticky top-0 z-30 border-b border-sand bg-paper/85 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setMenuAberto(true)} className="rounded-md border border-sand bg-cream p-2 text-ink-soft lg:hidden" aria-label="Abrir menu">
              <Ic name="menu" size={16} />
            </button>
            <h2 className="font-display hidden text-[15px] font-bold text-ink md:block">{TITULOS[pagina]}</h2>

            <div className="relative ml-auto w-full max-w-xs">
              <Ic name="search" size={14} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
              <input
                value={buscaTopo}
                onChange={(e) => setBuscaTopo(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && buscar()}
                placeholder="Buscar no registro… (Enter)"
                className="w-full rounded-md border border-sand bg-cream py-2 pr-3 pl-8.5 text-[12.5px] text-ink transition outline-none placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25"
              />
            </div>

            {/* chip da assinatura */}
            <button onClick={() => irPara("planos")} className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10.5px] font-extrabold tracking-[0.12em] transition hover:opacity-85 sm:inline-flex ${planoChip.cls}`} title="Ver plano e assinatura">
              <Ic name="star" size={11} sw={2.4} />
              {planoChip.txt}
            </button>

            {/* badge do papel */}
            <span className={`hidden items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[10.5px] font-extrabold tracking-[0.12em] sm:inline-flex ${papelBadge.cls}`} title={ehAdmin ? "Administrador da organização" : "Operador"}>
              <Ic name={ehAdmin ? "shield" : "user"} size={11} sw={2.4} />
              {papelBadge.txt}
            </span>

            <button onClick={() => irPara("lgpd-titulares")} className="relative rounded-md border border-sand bg-cream p-2 text-ink-soft transition hover:border-moss hover:text-moss" aria-label="Solicitações pendentes" title={`${abertas.length} solicitação(ões) em aberto`}>
              <Ic name="bell" size={16} />
              {abertas.length > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 grid min-w-4.5 place-items-center rounded-full px-1 py-px text-[9px] font-extrabold text-pine ${urgentes.length ? "bg-amber" : "bg-lime"}`}>{abertas.length}</span>
              )}
            </button>

            <button onClick={() => irPara("dashboard")} className={`hidden items-center gap-2 rounded-md border border-sand bg-cream px-3 py-1.5 transition hover:border-moss md:flex ${corScore}`} title="Índice de maturidade LGPD">
              <span className="relative block size-5">
                <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(24,38,32,0.12)" strokeWidth="2.5" />
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(score / 100) * 50.3} 50.3`} style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
              </span>
              <span className="font-display text-[13px] font-extrabold">{score}</span>
            </button>

            {/* estado da proteção anticópia */}
            {protecao.devtools ? (
              <span
                className="anim-pop hidden items-center gap-1.5 rounded-md border border-rust/50 bg-rust-soft px-2.5 py-1.5 text-[10px] font-extrabold tracking-[0.1em] text-rust md:inline-flex"
                title="Ferramentas de inspeção detectadas — a sessão está sob monitoramento elevado e as tentativas são auditadas."
              >
                <Ic name="eye" size={11} sw={2.4} /> MONITORANDO
              </span>
            ) : (
              <span
                className="hidden items-center gap-1.5 rounded-md border border-sand bg-cream px-2.5 py-1.5 text-[10px] font-extrabold tracking-[0.1em] text-moss md:inline-flex"
                title={`Proteção anticópia ativa · ${protecao.bloqueios} tentativa(s) bloqueada(s) nesta sessão`}
              >
                <Ic name="lock" size={11} sw={2.4} /> PROTEGIDO
              </span>
            )}

            {/* menu do usuário */}
            <div className="relative">
              <button
                onClick={() => setMenuUser((v) => !v)}
                className={`flex items-center gap-2 rounded-md border px-2 py-1.5 transition ${menuUser ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}
                aria-label="Menu do usuário"
              >
                <span className="grid size-7 place-items-center rounded-full bg-pine text-[11px] font-extrabold text-lime">{iniciais}</span>
                <span className="hidden text-left sm:block">
                  <span className="block max-w-[120px] truncate text-[12px] leading-tight font-bold text-ink">{usuario?.nome}</span>
                  <span className="block max-w-[120px] truncate text-[10px] text-ink-faint">{usuario?.empresa || usuario?.email}</span>
                </span>
              </button>
              {menuUser && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuUser(false)} />
                  <div className="anim-pop absolute right-0 z-50 mt-2 w-60 overflow-hidden rounded-lg border border-sand bg-cream shadow-[0_18px_40px_-16px_rgba(12,31,24,0.4)]">
                    <div className="border-b border-sand bg-paper px-3.5 py-3">
                      <p className="truncate text-[12.5px] font-bold text-ink">{usuario?.nome}</p>
                      <p className="truncate text-[11px] text-ink-faint">{usuario?.email}</p>
                      <div className="mt-2 flex items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${papelBadge.cls}`}>{papelBadge.txt}</span>
                        <span className="text-[10px] text-ink-faint">{usuario?.cargo}</span>
                      </div>
                    </div>
                    <button onClick={() => { setContaAberta(true); setMenuUser(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-soft transition hover:bg-paper hover:text-ink">
                      <Ic name="user" size={15} /> Minha conta
                    </button>
                    {ehAdmin && (
                      <button onClick={() => { irPara("admin"); setMenuUser(false); }} className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-[12.5px] font-semibold text-ink-soft transition hover:bg-paper hover:text-ink">
                        <Ic name="lock" size={15} /> Painel administrativo
                      </button>
                    )}
                    <button
                      onClick={() => { registrar("auth", `Logout solicitado: ${usuario?.email}`); sair(); }}
                      className="flex w-full items-center gap-2.5 border-t border-sand px-3.5 py-2.5 text-[12.5px] font-bold text-rust transition hover:bg-rust-soft/40"
                    >
                      <Ic name="x" size={15} /> Sair da conta
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main key={pagina} className="min-h-0 flex-1 overflow-y-auto print:overflow-visible">
          <div className={`mx-auto w-full max-w-[1160px] px-4 py-6 sm:px-6 ${pagina === "assistente" ? "flex h-full flex-col" : ""}`}>
            {pagina === "dashboard" && <Dashboard irPara={irPara} />}
            {pagina === "assistente" && <div className="flex min-h-0 flex-1 flex-col"><Assistant irPara={irPara} /></div>}
            {pagina === "lgpd-registro" && <Activities key={nonce} buscaInicial={buscaAtividades} />}
            {pagina === "lgpd-risco" && <RiskMatrix />}
            {pagina === "lgpd-titulares" && <Requests />}
            {pagina === "lgpd-bases" && <Reference />}
            {pagina === "gdpr-ropa" && <Gdpr view="ropa" />}
            {pagina === "gdpr-bases" && <Gdpr view="bases" />}
            {pagina === "gdpr-dpia" && <Gdpr view="dpia" />}
            {pagina === "iso" && <Iso ids={ISO_IDS} grupo="iso" />}
            {pagina === "soc2" && <Iso ids={["soc2"]} />}
            {pagina === "pcidss" && <Iso ids={["pcidss"]} />}
            {pagina === "ai-gov" && <Iso ids={["ai-gov"]} />}
            {pagina === "cookies" && <Cookies />}
            {pagina === "relatorios" && <Reports />}
            {pagina === "seguranca" && <Security />}
            {pagina === "planos" && <Plans />}
            {pagina === "admin" && ehAdmin && <AdminPanel />}
          </div>
        </main>
      </div>

      <ToastHost />
      <AccountModal aberto={contaAberta} onFechar={() => setContaAberta(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}

function Root() {
  const { usuario, pronto, sair } = useAuth();
  const [tela, setTela] = useState<"landing" | "auth">("landing");

  /* conta bloqueada por administrador derruba a sessão ativa */
  useEffect(() => {
    if (usuario?.bloqueado) sair();
  }, [usuario, sair]);

  /* ao sair da conta, volta para a landing de vendas */
  useEffect(() => {
    if (!usuario) setTela("landing");
  }, [usuario]);

  if (!pronto) return <Splash />;
  if (!usuario) return tela === "landing" ? <Landing onAcessar={() => setTela("auth")} /> : <AuthScreen onVoltar={() => setTela("landing")} />;
  /* trava comercial: free trial de 7 dias expirado e sem assinatura → tela de ativação */
  const trialExpirado =
    !usuario.demo && usuario.plano === "trial" && !!usuario.trialAte && new Date(usuario.trialAte).getTime() < Date.now();
  return (
    <StoreProvider key={usuario.id} storageKey={`radargrc:${usuario.id}`}>
      {trialExpirado ? <TrialGate /> : <Shell />}
    </StoreProvider>
  );
}
