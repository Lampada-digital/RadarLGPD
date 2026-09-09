import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { useAuth } from "./auth";
import {
  SEED_ATIVIDADES, SEED_GDPR, SEED_ISO, SEED_SOLICITACOES, SEED_CHECKLIST, uid,
} from "./domain";
import type { Atividade, ControleEstado, GdprAtividade, Solicitacao } from "./domain";

/* =====================================================================
   Store global — dados por usuário, limites de plano, auditoria e toasts.
   ===================================================================== */

export type ToastTom = "ok" | "warn" | "ia";
export interface Toast {
  id: number;
  texto: string;
  tom: ToastTom;
}

export interface EventoAuditoria {
  id: string;
  ts: string;
  tipo: string;
  detalhe: string;
}

export interface ItemChecklist {
  id: string;
  label: string;
  artigo: string;
  feito: boolean;
}

/* ---------- limites por plano ---------- */
export interface Limites {
  plano: string;
  trial: boolean;
  podeCriar: boolean; // trial: registros somente leitura
  ia: boolean;
  importar: boolean;
  iso: boolean;
  cert: boolean;
  relatorios: boolean;
  maxUsuarios: number;
}

export function limitesDe(plano: string | undefined, demo: boolean | undefined): Limites {
  const p = demo ? "completo" : plano ?? "trial";
  const trial = p === "trial";
  const biz = p === "business" || p === "completo";
  return {
    plano: p,
    trial,
    podeCriar: !trial,
    ia: biz,
    importar: biz,
    iso: biz,
    cert: biz,
    relatorios: biz,
    maxUsuarios: trial ? 1 : p === "standard" ? 3 : p === "business" ? 10 : Number.POSITIVE_INFINITY,
  };
}

/* ---------- carregamento ---------- */
function load<T>(key: string, campo: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const obj = JSON.parse(raw);
      if (obj[campo] !== undefined) return obj[campo] as T;
    }
  } catch {
    /* ignora */
  }
  return fallback;
}

interface StoreCtx {
  storageKey: string;
  limites: Limites;
  /* LGPD */
  atividades: Atividade[];
  addAtividade: (a: Atividade) => void;
  updateAtividade: (a: Atividade) => void;
  removeAtividade: (id: string) => void;
  solicitacoes: Solicitacao[];
  addSolicitacao: (s: Solicitacao) => void;
  setStatusSolicitacao: (id: string, status: Solicitacao["status"], resposta?: string) => void;
  checklist: ItemChecklist[];
  toggleCheck: (id: string) => void;
  score: number;
  /* GDPR */
  gdprAtividades: GdprAtividade[];
  addGdprAtividade: (a: GdprAtividade) => void;
  updateGdprAtividade: (a: GdprAtividade) => void;
  removeGdprAtividade: (id: string) => void;
  /* ISO */
  iso: Record<string, Record<string, ControleEstado>>;
  setIso: (frameworkId: string, controlId: string, patch: Partial<ControleEstado>) => void;
  /* auditoria */
  auditoria: EventoAuditoria[];
  registrar: (tipo: string, detalhe: string) => void;
  /* toasts */
  toasts: Toast[];
  toast: (texto: string, tom?: ToastTom) => void;
  reset: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);
let seqToast = 1;

export function StoreProvider({ children, storageKey }: { children: ReactNode; storageKey: string }) {
  const { usuario } = useAuth();
  const limites = useMemo(() => limitesDe(usuario?.plano, usuario?.demo), [usuario?.plano, usuario?.demo]);

  const [atividades, setAtividades] = useState<Atividade[]>(() => load(storageKey, "atividades", SEED_ATIVIDADES));
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() => load(storageKey, "solicitacoes", SEED_SOLICITACOES));
  const [checklist, setChecklist] = useState<ItemChecklist[]>(() => load(storageKey, "checklist", SEED_CHECKLIST));
  const [gdprAtividades, setGdprAtividades] = useState<GdprAtividade[]>(() => load(storageKey, "gdprAtividades", SEED_GDPR));
  const [iso, setIsoState] = useState<Record<string, Record<string, ControleEstado>>>(() => load(storageKey, "iso", SEED_ISO));
  const [auditoria, setAuditoria] = useState<EventoAuditoria[]>(() => load(storageKey, "auditoria", []));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ atividades, solicitacoes, checklist, gdprAtividades, iso, auditoria }));
    } catch {
      /* armazenamento indisponível */
    }
  }, [storageKey, atividades, solicitacoes, checklist, gdprAtividades, iso, auditoria]);

  const registrar = (tipo: string, detalhe: string) =>
    setAuditoria((l) => [{ id: uid(), ts: new Date().toISOString(), tipo, detalhe }, ...l].slice(0, 120));

  const toast = (texto: string, tom: ToastTom = "ok") => {
    const id = seqToast++;
    setToasts((l) => [...l, { id, texto, tom }]);
    setTimeout(() => setToasts((l) => l.filter((t) => t.id !== id)), 4200);
  };

  /* score de maturidade (checklist) */
  const score = useMemo(() => {
    const feitas = checklist.filter((c) => c.feito).length;
    return Math.round((feitas / checklist.length) * 100);
  }, [checklist]);

  const v: StoreCtx = {
    storageKey,
    limites,
    atividades,
    addAtividade: (a) => setAtividades((l) => [a, ...l]),
    updateAtividade: (a) => setAtividades((l) => l.map((x) => (x.id === a.id ? a : x))),
    removeAtividade: (id) => setAtividades((l) => l.filter((x) => x.id !== id)),
    solicitacoes,
    addSolicitacao: (s) => setSolicitacoes((l) => [s, ...l]),
    setStatusSolicitacao: (id, status, resposta) => setSolicitacoes((l) => l.map((x) => (x.id === id ? { ...x, status, resposta: resposta ?? x.resposta } : x))),
    checklist,
    toggleCheck: (id) => setChecklist((l) => l.map((x) => (x.id === id ? { ...x, feito: !x.feito } : x))),
    score,
    gdprAtividades,
    addGdprAtividade: (a) => setGdprAtividades((l) => [a, ...l]),
    updateGdprAtividade: (a) => setGdprAtividades((l) => l.map((x) => (x.id === a.id ? a : x))),
    removeGdprAtividade: (id) => setGdprAtividades((l) => l.filter((x) => x.id !== id)),
    iso,
    setIso: (frameworkId, controlId, patch) =>
      setIsoState((s) => ({
        ...s,
        [frameworkId]: {
          ...s[frameworkId],
          [controlId]: { ...(s[frameworkId]?.[controlId] ?? { estado: "nao" }), ...patch, ts: new Date().toISOString().slice(0, 10) },
        },
      })),
    auditoria,
    registrar,
    toasts,
    toast,
    reset: () => {
      setAtividades(SEED_ATIVIDADES);
      setSolicitacoes(SEED_SOLICITACOES);
      setChecklist(SEED_CHECKLIST);
      setGdprAtividades(SEED_GDPR);
      setIsoState(SEED_ISO);
      registrar("sistema", "Dados de demonstração restaurados.");
    },
  };

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fora do StoreProvider");
  return c;
}
