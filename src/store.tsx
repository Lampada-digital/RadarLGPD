import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { SEED_ATIVIDADES, SEED_CHECKLIST, SEED_SOLICITACOES, PRAZO_LGPD_DIAS, diasDesde, zonaRisco } from "./types";
import type { Atividade, ItemChecklist, Solicitacao } from "./types";
import { SEED_GDPR_ATIVIDADES, SEED_TRANSFERENCIAS, SEED_DPIA } from "./gdpr";
import type { GdprAtividade, Transferencia } from "./gdpr";
import { SEED_ISO } from "./frameworks";
import type { ControleEstado, EstadoIso } from "./frameworks";

export interface Toast {
  id: number;
  texto: string;
  tom: "ok" | "ia" | "warn";
}

export interface EventoAuditoria {
  id: string;
  ts: string;
  tipo: "auth" | "lgpd" | "gdpr" | "iso" | "seguranca" | "sistema";
  detalhe: string;
}

interface Store {
  /* LGPD */
  atividades: Atividade[];
  solicitacoes: Solicitacao[];
  checklist: ItemChecklist[];
  addAtividade: (a: Atividade) => void;
  updateAtividade: (a: Atividade) => void;
  removeAtividade: (id: string) => void;
  addSolicitacao: (s: Solicitacao) => void;
  setStatusSolicitacao: (id: string, status: Solicitacao["status"], resposta?: string) => void;
  toggleCheck: (id: string) => void;
  /* GDPR */
  gdprAtividades: GdprAtividade[];
  addGdprAtividade: (a: GdprAtividade) => void;
  updateGdprAtividade: (a: GdprAtividade) => void;
  removeGdprAtividade: (id: string) => void;
  transferencias: Transferencia[];
  addTransferencia: (t: Transferencia) => void;
  removeTransferencia: (id: string) => void;
  dpiaChecks: Record<string, boolean>;
  toggleDpia: (id: string) => void;
  /* ISO */
  iso: Record<string, Record<string, ControleEstado>>;
  setIso: (frameworkId: string, controlId: string, patch: Partial<ControleEstado>) => void;
  /* meta */
  toasts: Toast[];
  auditoria: EventoAuditoria[];
  registrar: (tipo: EventoAuditoria["tipo"], detalhe: string) => void;
  score: number;
  scoreFatores: { label: string; pct: number; peso: number }[];
  toast: (texto: string, tom?: Toast["tom"]) => void;
  reset: () => void;
}

const Ctx = createContext<Store | null>(null);

function load<T>(storageKey: string, campo: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return (parsed[campo] as T) ?? fallback;
  } catch {
    return fallback;
  }
}

let seqAud = 0;
const novoEvento = (tipo: EventoAuditoria["tipo"], detalhe: string): EventoAuditoria => ({
  id: `ev-${Date.now()}-${seqAud++}`,
  ts: new Date().toISOString(),
  tipo,
  detalhe,
});

export function StoreProvider({ children, storageKey = "radar-lgpd-v1" }: { children: ReactNode; storageKey?: string }) {
  const [atividades, setAtividades] = useState<Atividade[]>(() => load(storageKey, "atividades", SEED_ATIVIDADES));
  const [solicitacoes, setSolicitacoes] = useState<Solicitacao[]>(() => load(storageKey, "solicitacoes", SEED_SOLICITACOES));
  const [checklist, setChecklist] = useState<ItemChecklist[]>(() => load(storageKey, "checklist", SEED_CHECKLIST));
  const [gdprAtividades, setGdprAtividades] = useState<GdprAtividade[]>(() => load(storageKey, "gdprAtividades", SEED_GDPR_ATIVIDADES));
  const [transferencias, setTransferencias] = useState<Transferencia[]>(() => load(storageKey, "transferencias", SEED_TRANSFERENCIAS));
  const [dpiaChecks, setDpiaChecks] = useState<Record<string, boolean>>(() => load(storageKey, "dpiaChecks", SEED_DPIA));
  const [iso, setIsoState] = useState<Record<string, Record<string, ControleEstado>>>(() => load(storageKey, "iso", SEED_ISO));
  const [auditoria, setAuditoria] = useState<EventoAuditoria[]>(() => load(storageKey, "auditoria", []));
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({ atividades, solicitacoes, checklist, gdprAtividades, transferencias, dpiaChecks, iso, auditoria }));
    } catch {
      /* armazenamento indisponível */
    }
  }, [storageKey, atividades, solicitacoes, checklist, gdprAtividades, transferencias, dpiaChecks, iso, auditoria]);

  const registrar = (tipo: EventoAuditoria["tipo"], detalhe: string) =>
    setAuditoria((a) => [novoEvento(tipo, detalhe), ...a].slice(0, 200));

  const toast = (texto: string, tom: Toast["tom"] = "ok") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, texto, tom }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3800);
  };

  /* ---------- LGPD ---------- */
  const addAtividade = (a: Atividade) => {
    setAtividades((l) => [a, ...l]);
    registrar("lgpd", `Atividade "${a.nome}" adicionada ao registro (art. 37).`);
  };
  const updateAtividade = (a: Atividade) => {
    setAtividades((l) => l.map((x) => (x.id === a.id ? a : x)));
    registrar("lgpd", `Atividade "${a.nome}" atualizada.`);
  };
  const removeAtividade = (id: string) => {
    const a = atividades.find((x) => x.id === id);
    setAtividades((l) => l.filter((x) => x.id !== id));
    registrar("lgpd", `Atividade "${a?.nome ?? id}" excluída do registro.`);
  };
  const addSolicitacao = (s: Solicitacao) => {
    setSolicitacoes((l) => [s, ...l]);
    registrar("lgpd", `Solicitação ${s.regime ?? "LGPD"} de "${s.titular}" registrada (${s.tipo}).`);
  };
  const setStatusSolicitacao = (id: string, status: Solicitacao["status"], resposta?: string) => {
    setSolicitacoes((l) => l.map((x) => (x.id === id ? { ...x, status, resposta: resposta ?? x.resposta } : x)));
    registrar("lgpd", `Solicitação ${id.slice(0, 8)} movida para "${status}".`);
  };
  const toggleCheck = (id: string) => setChecklist((l) => l.map((c) => (c.id === id ? { ...c, feito: !c.feito } : c)));

  /* ---------- GDPR ---------- */
  const addGdprAtividade = (a: GdprAtividade) => {
    setGdprAtividades((l) => [a, ...l]);
    registrar("gdpr", `Operação "${a.nome}" adicionada ao ROPA (Art. 30).`);
  };
  const updateGdprAtividade = (a: GdprAtividade) => {
    setGdprAtividades((l) => l.map((x) => (x.id === a.id ? a : x)));
    registrar("gdpr", `Operação "${a.nome}" atualizada no ROPA.`);
  };
  const removeGdprAtividade = (id: string) => {
    const a = gdprAtividades.find((x) => x.id === id);
    setGdprAtividades((l) => l.filter((x) => x.id !== id));
    registrar("gdpr", `Operação "${a?.nome ?? id}" removida do ROPA.`);
  };
  const addTransferencia = (t: Transferencia) => {
    setTransferencias((l) => [...l, t]);
    registrar("gdpr", `Transferência internacional para ${t.destino} registrada (${t.mecanismo}).`);
  };
  const removeTransferencia = (id: string) => {
    const t = transferencias.find((x) => x.id === id);
    setTransferencias((l) => l.filter((x) => x.id !== id));
    registrar("gdpr", `Transferência para ${t?.destino ?? id} removida.`);
  };
  const toggleDpia = (id: string) => setDpiaChecks((d) => ({ ...d, [id]: !d[id] }));

  /* ---------- ISO ---------- */
  const setIso = (frameworkId: string, controlId: string, patch: Partial<ControleEstado>) => {
    setIsoState((s) => ({
      ...s,
      [frameworkId]: { ...s[frameworkId], [controlId]: { ...(s[frameworkId]?.[controlId] ?? { estado: "nao" as EstadoIso }), ...patch, ts: new Date().toISOString().slice(0, 10) } },
    }));
  };

  /* ---------- maturidade LGPD ---------- */
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

  const reset = () => {
    setAtividades(SEED_ATIVIDADES);
    setSolicitacoes(SEED_SOLICITACOES);
    setChecklist(SEED_CHECKLIST);
    setGdprAtividades(SEED_GDPR_ATIVIDADES);
    setTransferencias(SEED_TRANSFERENCIAS);
    setDpiaChecks(SEED_DPIA);
    setIsoState(SEED_ISO);
    registrar("sistema", "Dados de demonstração restaurados.");
  };

  const value: Store = {
    atividades,
    solicitacoes,
    checklist,
    addAtividade,
    updateAtividade,
    removeAtividade,
    addSolicitacao,
    setStatusSolicitacao,
    toggleCheck,
    gdprAtividades,
    addGdprAtividade,
    updateGdprAtividade,
    removeGdprAtividade,
    transferencias,
    addTransferencia,
    removeTransferencia,
    dpiaChecks,
    toggleDpia,
    iso,
    setIso,
    toasts,
    auditoria,
    registrar,
    score,
    scoreFatores,
    toast,
    reset,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useStore fora do StoreProvider");
  return c;
}
