import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SEED_ATIVIDADES, SEED_CHECKLIST, SEED_SOLICITACOES, PRAZO_LGPD_DIAS, diasDesde, zonaRisco } from "./types";
import type { Atividade, ItemChecklist, Solicitacao } from "./types";

export interface Toast {
  id: number;
  texto: string;
  tom: "ok" | "ia" | "warn";
}

interface Store {
  atividades: Atividade[];
  solicitacoes: Solicitacao[];
  checklist: ItemChecklist[];
  toasts: Toast[];
  score: number;
  scoreFatores: { label: string; pct: number; peso: number }[];
  addAtividade: (a: Atividade) => void;
  updateAtividade: (a: Atividade) => void;
  removeAtividade: (id: string) => void;
  addSolicitacao: (s: Solicitacao) => void;
  setStatusSolicitacao: (id: string, status: Solicitacao["status"], resposta?: string) => void;
  toggleCheck: (id: string) => void;
  toast: (texto: string, tom?: Toast["tom"]) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);
const KEY_PADRAO = "radar-lgpd-v1";

function load<T>(campo: keyof typeof SEED, fallback: T, key: string): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed[campo] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

const SEED = { atividades: SEED_ATIVIDADES, solicitacoes: SEED_SOLICITACOES, checklist: SEED_CHECKLIST };

export function StoreProvider({ children, storageKey = KEY_PADRAO }: { children: ReactNode; storageKey?: string }) {
  const [atividades, setAtividades] = useState<Atividade[]>(() => load("atividades", SEED.atividades, storageKey));
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() => load("solicitacoes", SEED.solicitacoes, storageKey));
  const [checklist, setChecklist] = useState<ItemChecklist[]>(() => load("checklist", SEED.checklist, storageKey));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ atividades, solicitacoes, checklist }));
    } catch {
      /* armazenamento indisponível */
    }
  }, [atividades, solicitacoes, checklist]);

  const toast = (texto: string, tom: Toast["tom"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, texto, tom }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };

  const { score, scoreFatores } = useMemo(() => {
    const total = atividades.length || 1;
    const fBase = atividades.filter((a) => a.baseLegalId).length / total;
    const fRetencao = atividades.filter((a) => a.retencao && a.retencao !== "Definir prazo específico").length / total;
    const alto = atividades.filter((a) => zonaRisco(a.probabilidade * a.impacto) === "alto" || zonaRisco(a.probabilidade * a.impacto) === "critico");
    const fMedidas = alto.length ? alto.filter((a) => a.medidas.length >= 3).length / alto.length : 1;
    const fCheck = checklist.length ? checklist.filter((c) => c.feito).length / checklist.length : 1;
    const abertas = solicitacoes.filter((s) => s.status !== "concluida");
    const fSolic = abertas.length ? abertas.filter((s) => diasDesde(s.data) <= PRAZO_LGPD_DIAS).length / abertas.length : 1;

    const fatores = [
      { label: "Base legal definida", pct: fBase, peso: 25 },
      { label: "Retenção estabelecida", pct: fRetencao, peso: 15 },
      { label: "Salvaguardas em alto risco", pct: fMedidas, peso: 20 },
      { label: "Programa de conformidade", pct: fCheck, peso: 20 },
      { label: "Solicitações no prazo", pct: fSolic, peso: 20 },
    ];
    const s = Math.round(fatores.reduce((acc, f) => acc + f.pct * f.peso, 0));
    return { score: s, scoreFatores: fatores };
  }, [atividades, checklist, solicitacoes]);

  const value: Store = {
    atividades,
    solicitacoes,
    checklist,
    toasts,
    score,
    scoreFatores,
    addAtividade: (a) => setAtividades((v) => [a, ...v]),
    updateAtividade: (a) => setAtividades((v) => v.map((x) => (x.id === a.id ? a : x))),
    removeAtividade: (id) => setAtividades((v) => v.filter((x) => x.id !== id)),
    addSolicitacao: (s) => setSolicitacoes((v) => [s, ...v]),
    setStatusSolicitacao: (id, status, resposta) =>
      setSolicitacoes((v) => v.map((s) => (s.id === id ? { ...s, status, resposta: resposta ?? s.resposta } : s))),
    toggleCheck: (id) => setChecklist((v) => v.map((c) => (c.id === id ? { ...c, feito: !c.feito } : c))),
    toast,
    reset: () => {
      setAtividades(SEED.atividades);
      setSolicitacoes(SEED.solicitacoes);
      setChecklist(SEED.checklist);
      toast("Base restaurada com os dados de demonstração.", "ok");
    },
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error("useStore fora do StoreProvider");
  return s;
}
