import { useEffect, useRef, useState } from "react";
import { AuthProvider, useAuth } from "./auth";
import { StoreProvider, useStore } from "./store";
import { diasDesde, PRAZO_LGPD_DIAS } from "./types";
import { Ic, ToastHost } from "./components/ui";
import AuthScreen from "./components/AuthScreen";
import AccountModal from "./components/AccountModal";
import Dashboard from "./components/Dashboard";
import Assistant from "./components/Assistant";
import Activities from "./components/Activities";
import RiskMatrix from "./components/RiskMatrix";
import Requests from "./components/Requests";
import Reference from "./components/Reference";
import Reports from "./components/Reports";

export type Page = "dashboard" | "assistente" | "atividades" | "risco" | "solicitacoes" | "bases" | "relatorios";

const NAV: { id: Page; label: string; icone: string }[] = [
  { id: "dashboard", label: "Visão geral", icone: "grid" },
  { id: "assistente", label: "Assistente IA", icone: "spark" },
  { id: "atividades", label: "Atividades", icone: "layers" },
  { id: "risco", label: "Matriz de risco", icone: "matrix" },
  { id: "solicitacoes", label: "Solicitações", icone: "user" },
  { id: "bases", label: "Bases legais", icone: "scale" },
  { id: "relatorios", label: "Relatórios", icone: "doc" },
];

const TITULOS: Record<Page, string> = {
  dashboard: "Visão geral",
  assistente: "Assistente IA",
  atividades: "Atividades de tratamento",
  risco: "Matriz de risco",
  solicitacoes: "Solicitações de titulares",
  bases: "Bases legais",
  relatorios: "Relatórios RoPA",
};

function iniciais(nome: string) {
  return nome
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function Shell() {
  const { usuario, sair } = useAuth();
  const { score, solicitacoes } = useStore();
  const [pagina, setPagina] = useState<Page>("dashboard");
  const [menuAberto, setMenuAberto] = useState(false);
  const [buscaTopo, setBuscaTopo] = useState("");
  const [buscaAtividades, setBuscaAtividades] = useState("");
  const [nonce, setNonce] = useState(0);
  const [menuUsuario, setMenuUsuario] = useState(false);
  const [contaAberta, setContaAberta] = useState(false);
  const refMenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (refMenu.current && !refMenu.current.contains(e.target as Node)) setMenuUsuario(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  if (!usuario) return null;

  const abertas = solicitacoes.filter((s) => s.status !== "concluida");
  const urgentes = abertas.filter((s) => PRAZO_LGPD_DIAS - diasDesde(s.data) <= 5);
  const irPara = (p: Page) => { setPagina(p); setMenuAberto(false); };

  const buscar = () => {
    setBuscaAtividades(buscaTopo);
    setNonce((n) => n + 1);
    setPagina("atividades");
    setBuscaTopo("");
  };

  const corScore = score >= 80 ? "text-moss" : score >= 60 ? "text-amber" : "text-rust";
  const ini = iniciais(usuario.nome);

  const CartaoUsuario = () => (
    <div className="mx-3 mb-4 rounded-lg border border-pine-line bg-pine-deep/80 p-3.5">
      <div className="flex items-center gap-2.5">
        <span className="font-display grid size-8 shrink-0 place-items-center rounded-full bg-lime text-[11px] font-extrabold text-pine">{ini}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[12.5px] font-bold text-cream">{usuario.nome}</p>
          <p className="truncate text-[10.5px] text-cream/45">{usuario.empresa || usuario.email}</p>
        </div>
        <button onClick={sair} className="rounded-md p-1.5 text-cream/50 transition hover:bg-rust/20 hover:text-rust" title="Sair da conta" aria-label="Sair da conta">
          <Ic name="logout" size={15} />
        </button>
      </div>
      <button
        onClick={() => setContaAberta(true)}
        className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-md border border-pine-line py-1.5 text-[10px] font-bold tracking-[0.12em] text-cream/60 uppercase transition hover:border-lime/50 hover:text-lime"
      >
        <Ic name="user" size={11} /> Minha conta
      </button>
      <p className="mt-2.5 flex items-center gap-1.5 border-t border-pine-line pt-2.5 text-[10px] text-cream/45">
        <span className="pulse-dot size-1.5 rounded-full bg-lime" /> Sessão segura · dados neste navegador
      </p>
    </div>
  );

  const SidebarInner = (
    <>
      <button onClick={() => irPara("dashboard")} className="flex items-center gap-3 px-5 pt-5 pb-6 text-left">
        <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine-deep">
          <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
          <Ic name="radar" size={21} className="relative text-lime" sw={1.9} />
        </span>
        <span>
          <span className="font-display block text-[17px] leading-none font-extrabold tracking-tight text-cream">Radar<span className="text-lime">LGPD</span></span>
          <span className="mt-1 block text-[9.5px] font-bold tracking-[0.18em] text-cream/40 uppercase">Mapeamento com IA</span>
        </span>
      </button>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3">
        <p className="px-2.5 pt-1 pb-2 text-[9.5px] font-bold tracking-[0.2em] text-cream/35 uppercase">Operação</p>
        {NAV.slice(0, 2).map((n) => (
          <NavItem key={n.id} n={n} ativa={pagina === n.id} onClick={() => irPara(n.id)} badge={n.id === "assistente" ? <span className="rounded-sm bg-lime px-1.5 py-0.5 text-[8.5px] font-extrabold tracking-wider text-pine uppercase">IA</span> : undefined} />
        ))}
        <p className="px-2.5 pt-4 pb-2 text-[9.5px] font-bold tracking-[0.2em] text-cream/35 uppercase">Registro</p>
        {NAV.slice(2, 5).map((n) => (
          <NavItem key={n.id} n={n} ativa={pagina === n.id} onClick={() => irPara(n.id)} badge={n.id === "solicitacoes" && abertas.length > 0 ? <span className={`grid min-w-5 place-items-center rounded-full px-1 py-0.5 text-[9.5px] font-extrabold ${urgentes.length ? "bg-amber text-pine" : "bg-pine-line text-cream/80"}`}>{abertas.length}</span> : undefined} />
        ))}
        <p className="px-2.5 pt-4 pb-2 text-[9.5px] font-bold tracking-[0.2em] text-cream/35 uppercase">Referência</p>
        {NAV.slice(5).map((n) => (
          <NavItem key={n.id} n={n} ativa={pagina === n.id} onClick={() => irPara(n.id)} />
        ))}
      </nav>

      <CartaoUsuario />
    </>
  );

  return (
    <div className="flex h-full">
      {/* sidebar desktop */}
      <aside className="rail-texture sticky top-0 hidden h-screen w-[240px] shrink-0 flex-col border-r border-pine-line bg-pine lg:flex print:hidden">
        {SidebarInner}
      </aside>

      {/* sidebar mobile */}
      {menuAberto && (
        <div className="fixed inset-0 z-40 lg:hidden print:hidden" role="dialog">
          <div className="absolute inset-0 bg-pine-deep/60" onClick={() => setMenuAberto(false)} />
          <aside className="rail-texture anim-pop absolute top-0 left-0 flex h-full w-[264px] flex-col border-r border-pine-line bg-pine shadow-2xl">
            <button onClick={() => setMenuAberto(false)} className="absolute top-4 right-3 rounded-md p-1.5 text-cream/60 hover:text-cream" aria-label="Fechar menu">
              <Ic name="x" size={16} />
            </button>
            {SidebarInner}
          </aside>
        </div>
      )}

      {/* área principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-sand bg-paper/85 backdrop-blur-md print:hidden">
          <div className="flex items-center gap-3 px-4 py-3 sm:px-6">
            <button onClick={() => setMenuAberto(true)} className="rounded-md border border-sand bg-cream p-2 text-ink-soft lg:hidden" aria-label="Abrir menu">
              <Ic name="menu" size={16} />
            </button>
            <h2 className="font-display hidden text-[15px] font-bold text-ink sm:block">{TITULOS[pagina]}</h2>

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

            <button onClick={() => irPara("solicitacoes")} className="relative rounded-md border border-sand bg-cream p-2 text-ink-soft transition hover:border-moss hover:text-moss" aria-label="Solicitações pendentes" title={`${abertas.length} solicitação(ões) em aberto`}>
              <Ic name="bell" size={16} />
              {abertas.length > 0 && (
                <span className={`absolute -top-1.5 -right-1.5 grid min-w-4.5 place-items-center rounded-full px-1 py-px text-[9px] font-extrabold text-pine ${urgentes.length ? "bg-amber" : "bg-lime"}`}>{abertas.length}</span>
              )}
            </button>

            <button onClick={() => irPara("dashboard")} className={`hidden items-center gap-2 rounded-md border border-sand bg-cream px-3 py-1.5 transition hover:border-moss sm:flex ${corScore}`} title="Índice de maturidade LGPD">
              <span className="relative block size-5">
                <svg viewBox="0 0 20 20" className="size-5 -rotate-90">
                  <circle cx="10" cy="10" r="8" fill="none" stroke="rgba(24,38,32,0.12)" strokeWidth="2.5" />
                  <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${(score / 100) * 50.3} 50.3`} style={{ transition: "stroke-dasharray 0.8s ease" }} />
                </svg>
              </span>
              <span className="font-display text-[13px] font-extrabold">{score}</span>
            </button>

            {/* menu do usuário */}
            <div className="relative" ref={refMenu}>
              <button
                onClick={() => setMenuUsuario((v) => !v)}
                className="flex items-center gap-2 rounded-md border border-sand bg-cream py-1.5 pr-2 pl-1.5 transition hover:border-moss"
                aria-label="Menu do usuário"
              >
                <span className="font-display grid size-7 place-items-center rounded-md bg-pine text-[10.5px] font-extrabold text-lime">{ini}</span>
                <span className="hidden max-w-[110px] truncate text-[12.5px] font-bold text-ink md:block">{usuario.nome.split(/\s+/)[0]}</span>
                <Ic name="chevronDown" size={13} className={`text-ink-faint transition-transform duration-200 ${menuUsuario ? "rotate-180" : ""}`} />
              </button>
              {menuUsuario && (
                <div className="anim-pop absolute top-full right-0 z-50 mt-2 w-64 overflow-hidden rounded-lg border border-sand bg-cream shadow-[0_18px_44px_-12px_rgba(12,31,24,0.35)]">
                  <div className="border-b border-sand bg-paper px-4 py-3">
                    <p className="font-display text-[13.5px] font-bold text-ink">{usuario.nome}</p>
                    <p className="truncate text-[11px] text-ink-faint">{usuario.email}</p>
                    {usuario.empresa && <p className="mt-0.5 text-[10.5px] font-bold text-moss">{usuario.empresa}</p>}
                  </div>
                  <div className="p-1.5">
                    <button onClick={() => { setContaAberta(true); setMenuUsuario(false); }} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] font-semibold text-ink-soft transition hover:bg-paper hover:text-ink">
                      <Ic name="user" size={14} /> Minha conta
                    </button>
                    <button onClick={sair} className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[12.5px] font-semibold text-rust transition hover:bg-rust/10">
                      <Ic name="logout" size={14} /> Sair da conta
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <main key={pagina} className="min-h-0 flex-1 overflow-y-auto print:overflow-visible">
          <div className={`mx-auto w-full max-w-[1120px] px-4 py-6 sm:px-6 ${pagina === "assistente" ? "flex h-full flex-col" : ""}`}>
            {pagina === "dashboard" && <Dashboard irPara={irPara} />}
            {pagina === "assistente" && <div className="flex min-h-0 flex-1 flex-col"><Assistant irPara={irPara} /></div>}
            {pagina === "atividades" && <Activities key={nonce} buscaInicial={buscaAtividades} />}
            {pagina === "risco" && <RiskMatrix />}
            {pagina === "solicitacoes" && <Requests />}
            {pagina === "bases" && <Reference />}
            {pagina === "relatorios" && <Reports />}
          </div>
        </main>
      </div>

      <AccountModal aberto={contaAberta} onFechar={() => setContaAberta(false)} />
      <ToastHost />
    </div>
  );
}

function NavItem({ n, ativa, onClick, badge }: { n: { id: Page; label: string; icone: string }; ativa: boolean; onClick: () => void; badge?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`group flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-semibold transition-all duration-150 ${
        ativa ? "bg-lime text-pine shadow-sm" : "text-cream/65 hover:bg-pine-line/60 hover:text-cream"
      }`}
    >
      <Ic name={n.icone} size={16} sw={ativa ? 2.1 : 1.8} className={ativa ? "" : "transition-transform group-hover:scale-110"} />
      <span className="flex-1 text-left">{n.label}</span>
      {badge}
    </button>
  );
}

function Splash() {
  return (
    <div className="rail-texture grid h-screen place-items-center bg-pine">
      <div className="anim-pop text-center">
        <span className="relative mx-auto grid size-16 place-items-center overflow-hidden rounded-xl border border-lime/40 bg-pine-deep">
          <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
          <Ic name="radar" size={30} className="relative text-lime" />
        </span>
        <p className="font-display mt-4 text-[18px] font-extrabold text-cream">Radar<span className="text-lime">LGPD</span></p>
        <p className="mt-1 text-[10.5px] font-bold tracking-[0.18em] text-cream/40 uppercase">Carregando ambiente seguro…</p>
      </div>
    </div>
  );
}

function Root() {
  const { usuario, pronto } = useAuth();
  if (!pronto) return <Splash />;
  if (!usuario) return <AuthScreen />;
  return (
    <StoreProvider key={usuario.id} storageKey={`radarlgpd:dados:${usuario.id}`}>
      <Shell />
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
