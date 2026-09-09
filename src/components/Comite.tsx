import { useState } from "react";
import { useStore } from "../store";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   Comitê LGPD & GDPR — governança de privacidade, reuniões,
   decisões e acompanhamento de ações.
   ===================================================================== */

interface Reuniao {
  id: string;
  data: string;
  pauta: string[];
  decisoes: string[];
  participantes: string[];
  status: "agendada" | "realizada" | "cancelada";
}

interface Acao {
  id: string;
  descricao: string;
  responsavel: string;
  prazo: string;
  status: "pendente" | "em_andamento" | "concluida";
  reuniaoId: string;
}

const SEED_REUNIOES: Reuniao[] = [
  {
    id: "r1", data: "2026-01-20", pauta: ["Revisão do mapeamento de dados", "Análise de incidentes do mês", "Aprovação de novas políticas"],
    decisoes: ["Aprovar política de retenção de dados", "Investigar incidente de acesso não autorizado"], participantes: ["DPO", "TI", "Jurídico", "RH"], status: "realizada",
  },
  {
    id: "r2", data: "2026-02-15", pauta: ["Acompanhamento de ações", "Revisão de contratos com operadores", "Planejamento de treinamento"],
    decisoes: [], participantes: ["DPO", "TI", "Jurídico"], status: "agendada",
  },
  {
    id: "r3", data: "2025-12-18", pauta: ["Balanço do ano", "Planejamento para 2026", "Aprovação de orçamento"],
    decisoes: ["Aprovar orçamento de R$ 150k para privacidade em 2026", "Contratar consultoria externa para auditoria ISO 27701"], participantes: ["DPO", "TI", "Jurídico", "Financeiro", "Diretoria"], status: "realizada",
  },
];

const SEED_ACOES: Acao[] = [
  { id: "a1", descricao: "Revisar e atualizar política de retenção de dados", responsavel: "DPO", prazo: "2026-02-28", status: "em_andamento", reuniaoId: "r1" },
  { id: "a2", descricao: "Investigar incidente de acesso não autorizado ao sistema de RH", responsavel: "TI", prazo: "2026-02-15", status: "pendente", reuniaoId: "r1" },
  { id: "a3", descricao: "Revisar contratos com 5 operadores críticos", responsavel: "Jurídico", prazo: "2026-03-15", status: "pendente", reuniaoId: "r2" },
  { id: "a4", descricao: "Organizar treinamento de conscientização para todos os colaboradores", responsavel: "DPO", prazo: "2026-03-30", status: "pendente", reuniaoId: "r2" },
];

export default function Comite() {
  const { toast, registrar } = useStore();
  const [reunioes, setReunioes] = useState<Reuniao[]>(SEED_REUNIOES);
  const [acoes, setAcoes] = useState<Acao[]>(SEED_ACOES);
  const [aba, setAba] = useState<"reunioes" | "acoes">("reunioes");
  const [selecionada, setSelecionada] = useState<string | null>(null);

  const stats = {
    reunioes: reunioes.length,
    realizadas: reunioes.filter((r) => r.status === "realizada").length,
    acoes: acoes.length,
    pendentes: acoes.filter((a) => a.status === "pendente" || a.status === "em_andamento").length,
  };

  const atualizarAcao = (acaoId: string, patch: Partial<Acao>) => {
    setAcoes((l) => l.map((a) => a.id === acaoId ? { ...a, ...patch } : a));
    registrar("comite", `Ação ${acaoId} atualizada.`);
    toast("Ação atualizada.");
  };

  const reuniao = reunioes.find((r) => r.id === selecionada);

  return (
    <div>
      <Cabecalho
        kicker="Governança · comitê de privacidade"
        titulo="Comitê LGPD & GDPR"
        desc="Gestão do comitê de privacidade: reuniões, decisões, acompanhamento de ações e governança de privacidade."
      />

      <Reveal>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Reuniões", v: stats.reunioes, cor: "text-ink" },
            { l: "Realizadas", v: stats.realizadas, cor: "text-moss" },
            { l: "Ações", v: stats.acoes, cor: "text-ink" },
            { l: "Pendentes", v: stats.pendentes, cor: "text-amber" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-sand bg-cream p-4">
              <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <p className={`font-display mt-2 text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="mb-4 flex gap-2">
          {(["reunioes", "acoes"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`rounded-md border px-4 py-2 text-[12px] font-bold transition ${aba === a ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}
            >
              {a === "reunioes" ? "Reuniões" : "Ações"}
            </button>
          ))}
        </div>
      </Reveal>

      {aba === "reunioes" && (
        <div className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <Reveal>
            <div className="rounded-lg border border-sand bg-cream">
              <div className="border-b border-sand bg-paper px-4 py-3">
                <h2 className="font-display text-[14px] font-bold text-ink">Reuniões do comitê</h2>
              </div>
              <ul className="divide-y divide-sand/60">
                {reunioes.map((r) => (
                  <li key={r.id}>
                    <button
                      onClick={() => setSelecionada(r.id)}
                      className={`group flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-paper ${selecionada === r.id ? "bg-moss/8" : ""}`}
                    >
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${r.status === "realizada" ? "bg-moss/12 text-moss" : r.status === "agendada" ? "bg-amber-soft text-ink" : "bg-paper-deep text-ink-faint"}`}>{r.status}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[12px] font-bold text-ink">{r.data}</p>
                        <p className="truncate text-[10.5px] text-ink-faint">{r.pauta[0]}</p>
                      </div>
                      <Ic name="arrow" size={14} className={`shrink-0 text-ink-faint transition group-hover:translate-x-0.5 ${selecionada === r.id ? "text-moss" : ""}`} />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>

          <Reveal delay={80}>
            {reuniao ? (
              <div className="rounded-lg border border-sand bg-cream p-5">
                <p className="font-display text-[18px] font-bold text-ink">Reunião de {reuniao.data}</p>
                <p className="mt-0.5 text-[11px] text-ink-faint">Participantes: {reuniao.participantes.join(", ")}</p>
                <div className="mt-4">
                  <h3 className="font-display mb-2 text-[13px] font-bold text-ink">Pauta</h3>
                  <ul className="space-y-1.5">
                    {reuniao.pauta.map((p, i) => (
                      <li key={i} className="flex items-start gap-2 text-[12px] text-ink-soft">
                        <span className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-paper-deep text-[9px] font-bold text-ink-soft">{i + 1}</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
                {reuniao.decisoes.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-display mb-2 text-[13px] font-bold text-ink">Decisões</h3>
                    <ul className="space-y-1.5">
                      {reuniao.decisoes.map((d, i) => (
                        <li key={i} className="flex items-start gap-2 text-[12px] text-ink-soft">
                          <Ic name="check" size={13} sw={2.6} className="mt-0.5 shrink-0 text-moss" />
                          {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="mt-4">
                  <h3 className="font-display mb-2 text-[13px] font-bold text-ink">Ações geradas</h3>
                  <ul className="space-y-1.5">
                    {acoes.filter((a) => a.reuniaoId === reuniao.id).map((a) => (
                      <li key={a.id} className="flex items-start gap-2 text-[12px] text-ink-soft">
                        <span className={`mt-0.5 rounded-full px-1.5 py-0.5 text-[8px] font-extrabold uppercase ${a.status === "concluida" ? "bg-moss/12 text-moss" : a.status === "em_andamento" ? "bg-amber-soft text-ink" : "bg-paper-deep text-ink-faint"}`}>{a.status.replace("_", " ")}</span>
                        <span>{a.descricao} ({a.responsavel}, prazo: {a.prazo})</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex h-full items-center justify-center rounded-lg border border-dashed border-sand bg-paper/60 px-6 py-14 text-center">
                <div>
                  <Ic name="user" size={30} className="mx-auto text-sand" />
                  <p className="font-display mt-3 text-[16px] font-bold text-ink">Selecione uma reunião</p>
                  <p className="mt-1 text-[12.5px] text-ink-soft">Veja a pauta, decisões e ações de cada reunião.</p>
                </div>
              </div>
            )}
          </Reveal>
        </div>
      )}

      {aba === "acoes" && (
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[14px] font-bold text-ink">Ações do comitê</h2>
            </div>
            {acoes.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Ic name="check" size={30} className="mx-auto text-moss" />
                <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhuma ação pendente</p>
              </div>
            ) : (
              <ul className="divide-y divide-sand/60">
                {acoes.map((a) => (
                  <li key={a.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-paper">
                    <select
                      value={a.status}
                      onChange={(e) => atualizarAcao(a.id, { status: e.target.value as Acao["status"] })}
                      className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase outline-none ${a.status === "concluida" ? "bg-moss/12 text-moss" : a.status === "em_andamento" ? "bg-amber-soft text-ink" : "bg-paper-deep text-ink-faint"}`}
                    >
                      <option value="pendente">Pendente</option>
                      <option value="em_andamento">Em andamento</option>
                      <option value="concluida">Concluída</option>
                    </select>
                    <div className="min-w-0 flex-1">
                      <p className="text-[12.5px] font-semibold text-ink">{a.descricao}</p>
                      <p className="text-[10.5px] text-ink-faint">{a.responsavel} · Prazo: {a.prazo}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      )}
    </div>
  );
}
