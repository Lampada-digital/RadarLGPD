import { useState } from "react";
import { useStore } from "../store";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   Auditoria em TI — gestão de auditorias internas e externas,
   achados, planos de ação e acompanhamento.
   ===================================================================== */

interface Auditoria {
  id: string;
  nome: string;
  tipo: "interna" | "externa" | "certificacao";
  norma: string;
  auditor: string;
  dataInicio: string;
  dataFim: string;
  status: "planejada" | "em_andamento" | "concluida" | "com_achados";
  achados: Achado[];
}

interface Achado {
  id: string;
  descricao: string;
  severidade: "nao_conformidade_maior" | "nao_conformidade_menor" | "oportunidade_melhoria";
  acao: string;
  responsavel: string;
  prazo: string;
  status: "aberto" | "em_correcao" | "verificado";
}

const SEED_AUDITORIAS: Auditoria[] = [
  {
    id: "aud1", nome: "Auditoria interna ISO 27001", tipo: "interna", norma: "ISO 27001:2022", auditor: "Equipe interna",
    dataInicio: "2026-01-10", dataFim: "2026-01-15", status: "com_achados",
    achados: [
      { id: "a1", descricao: "Falta de evidência de revisão de acessos no último trimestre.", severidade: "nao_conformidade_menor", acao: "Implementar revisão trimestral documentada.", responsavel: "TI", prazo: "2026-02-15", status: "em_correcao" },
      { id: "a2", descricao: "Política de senhas não menciona MFA para acessos críticos.", severidade: "oportunidade_melhoria", acao: "Revisar política para incluir MFA.", responsavel: "Segurança", prazo: "2026-02-28", status: "aberto" },
    ],
  },
  {
    id: "aud2", nome: "Auditoria externa SOC 2 Type II", tipo: "certificacao", norma: "SOC 2 Type II", auditor: "Firma externa XYZ",
    dataInicio: "2026-02-01", dataFim: "2026-02-28", status: "planejada", achados: [],
  },
  {
    id: "aud3", nome: "Auditoria interna LGPD", tipo: "interna", norma: "LGPD", auditor: "DPO interno",
    dataInicio: "2025-12-01", dataFim: "2025-12-10", status: "concluida", achados: [],
  },
];

const COR_SEV = {
  nao_conformidade_maior: "bg-rust text-cream",
  nao_conformidade_menor: "bg-amber text-ink",
  oportunidade_melhoria: "bg-moss/12 text-moss",
};

const COR_STATUS = {
  planejada: "bg-paper-deep text-ink-faint",
  em_andamento: "bg-amber-soft text-ink",
  concluida: "bg-moss/12 text-moss",
  com_achados: "bg-rust-soft text-rust",
};

export default function AuditoriaTI() {
  const { toast, registrar } = useStore();
  const [auditorias, setAuditorias] = useState<Auditoria[]>(SEED_AUDITORIAS);
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const stats = {
    total: auditorias.length,
    planejadas: auditorias.filter((a) => a.status === "planejada").length,
    em_andamento: auditorias.filter((a) => a.status === "em_andamento" || a.status === "com_achados").length,
    concluidas: auditorias.filter((a) => a.status === "concluida").length,
  };

  const aud = auditorias.find((a) => a.id === selecionada);

  const atualizarAchado = (auditoriaId: string, achadoId: string, patch: Partial<Achado>) => {
    setAuditorias((l) => l.map((a) => {
      if (a.id !== auditoriaId) return a;
      const achados = a.achados.map((ac) => ac.id === achadoId ? { ...ac, ...patch } : ac);
      return { ...a, achados };
    }));
    registrar("auditoria", `Achado atualizado na auditoria ${auditoriaId}.`);
    toast("Achado atualizado.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Conformidade · auditorias e achados"
        titulo="Auditoria em TI"
        desc="Gestão de auditorias internas e externas, acompanhamento de achados e planos de ação para conformidade com normas e regulamentações."
      />

      <Reveal>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Auditorias", v: stats.total, cor: "text-ink" },
            { l: "Planejadas", v: stats.planejadas, cor: "text-ink-faint" },
            { l: "Em andamento", v: stats.em_andamento, cor: "text-amber" },
            { l: "Concluídas", v: stats.concluidas, cor: "text-moss" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-sand bg-cream p-4">
              <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <p className={`font-display mt-2 text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <div className="rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[14px] font-bold text-ink">Auditorias</h2>
            </div>
            <ul className="divide-y divide-sand/60">
              {auditorias.map((a) => (
                <li key={a.id}>
                  <button
                    onClick={() => setSelecionada(a.id)}
                    className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-paper ${selecionada === a.id ? "bg-moss/8" : ""}`}
                  >
                    <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${COR_STATUS[a.status]}`}>{a.status.replace("_", " ")}</span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[12.5px] font-bold text-ink">{a.nome}</p>
                      <p className="text-[10.5px] text-ink-faint">{a.norma} · {a.auditor}</p>
                    </div>
                    <Ic name="arrow" size={14} className={`shrink-0 text-ink-faint transition group-hover:translate-x-0.5 ${selecionada === a.id ? "text-moss" : ""}`} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={80}>
          {aud ? (
            <div className="rounded-lg border border-sand bg-cream p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-display text-[18px] font-bold text-ink">{aud.nome}</p>
                  <p className="mt-0.5 text-[12px] text-ink-soft">{aud.norma} · {aud.auditor}</p>
                  <p className="mt-1 text-[10.5px] text-ink-faint">{aud.dataInicio} → {aud.dataFim}</p>
                </div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase ${COR_STATUS[aud.status]}`}>{aud.status.replace("_", " ")}</span>
              </div>
              {aud.achados.length > 0 ? (
                <div className="mt-5">
                  <h3 className="font-display mb-3 text-[14px] font-bold text-ink">Achados ({aud.achados.length})</h3>
                  <div className="space-y-2.5">
                    {aud.achados.map((ac) => (
                      <div key={ac.id} className="rounded-md border border-sand bg-paper p-3.5">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${COR_SEV[ac.severidade]}`}>{ac.severidade.replace(/_/g, " ")}</span>
                          <select
                            value={ac.status}
                            onChange={(e) => atualizarAchado(aud.id, ac.id, { status: e.target.value as Achado["status"] })}
                            className="rounded-md border border-sand bg-cream px-2 py-1 text-[10px] font-bold text-ink-soft outline-none focus:border-moss"
                          >
                            <option value="aberto">Aberto</option>
                            <option value="em_correcao">Em correção</option>
                            <option value="verificado">Verificado</option>
                          </select>
                        </div>
                        <p className="mt-2 text-[12px] font-semibold text-ink">{ac.descricao}</p>
                        <p className="mt-1 text-[11px] text-ink-soft">Ação: {ac.acao}</p>
                        <p className="mt-0.5 text-[10px] text-ink-faint">Responsável: {ac.responsavel} · Prazo: {ac.prazo}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-5 rounded-md border border-dashed border-sand bg-paper/60 px-4 py-8 text-center">
                  <Ic name="check" size={26} className="mx-auto text-moss" />
                  <p className="font-display mt-2 text-[14px] font-bold text-ink">Sem achados</p>
                  <p className="mt-1 text-[11.5px] text-ink-soft">Esta auditoria não registrou achados.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-sand bg-paper/60 px-6 py-14 text-center">
              <div>
                <Ic name="doc" size={30} className="mx-auto text-sand" />
                <p className="font-display mt-3 text-[16px] font-bold text-ink">Selecione uma auditoria</p>
                <p className="mt-1 text-[12.5px] text-ink-soft">Veja os detalhes e achados de cada auditoria.</p>
              </div>
            </div>
          )}
        </Reveal>
      </div>
    </div>
  );
}
