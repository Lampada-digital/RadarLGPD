import { useMemo, useState } from "react";
import { useStore } from "../store";
import { CANAIS, PRAZO_LGPD_DIAS, TIPOS_SOLICITACAO, diasDesde, fmtData, uid } from "../types";
import type { Solicitacao, StatusSolicitacao } from "../types";
import { Cabecalho, Campo, Ic, inputCls, Modal, Reveal } from "./ui";

const STATUS_META: Record<StatusSolicitacao, { label: string; cor: string; bg: string }> = {
  aberta: { label: "Aberta", cor: "#8a4a17", bg: "#f2d4bd" },
  em_andamento: { label: "Em andamento", cor: "#7a5f14", bg: "#f0e5bd" },
  concluida: { label: "Concluída", cor: "#3c5a2a", bg: "#dfe9cf" },
};

export default function Requests() {
  const { solicitacoes, addSolicitacao, setStatusSolicitacao, toast } = useStore();
  const [nova, setNova] = useState(false);
  const [fStatus, setFStatus] = useState<"" | StatusSolicitacao>("");
  const [respondendo, setRespondendo] = useState<string | null>(null);
  const [resposta, setResposta] = useState("");
  const [form, setForm] = useState({ titular: "", tipo: TIPOS_SOLICITACAO[0], canal: CANAIS[0] });

  const ordenadas = useMemo(() => {
    const peso: Record<StatusSolicitacao, number> = { aberta: 0, em_andamento: 1, concluida: 2 };
    return [...solicitacoes].sort((a, b) => peso[a.status] - peso[b.status] || b.data.localeCompare(a.data));
  }, [solicitacoes]);

  const metricas = useMemo(() => {
    const abertas = solicitacoes.filter((s) => s.status !== "concluida");
    const vencidas = abertas.filter((s) => diasDesde(s.data) > PRAZO_LGPD_DIAS);
    const noPrazo = abertas.filter((s) => diasDesde(s.data) <= PRAZO_LGPD_DIAS && PRAZO_LGPD_DIAS - diasDesde(s.data) <= 5).length;
    return { abertas: abertas.length, vencidas: vencidas.length, criticas: noPrazo };
  }, [solicitacoes]);

  const criar = () => {
    if (!form.titular.trim()) { toast("Informe o nome do titular.", "warn"); return; }
    addSolicitacao({ id: uid(), titular: form.titular.trim(), tipo: form.tipo, canal: form.canal, data: new Date().toISOString().slice(0, 10), status: "aberta" });
    toast("Solicitação registrada — prazo de 15 dias iniciado (art. 19, §2º).");
    setNova(false);
    setForm({ titular: "", tipo: TIPOS_SOLICITACAO[0], canal: CANAIS[0] });
  };

  const concluir = (id: string) => {
    if (!resposta.trim()) { toast("Descreva a resposta enviada ao titular.", "warn"); return; }
    setStatusSolicitacao(id, "concluida", resposta.trim());
    setRespondendo(null);
    setResposta("");
    toast("Solicitação concluída com registro de resposta.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Direitos dos titulares · Arts. 18 e 19"
        titulo="Solicitações de titulares"
        desc="Fila única de atendimento aos direitos — acesso, correção, eliminação, portabilidade, revogação — com controle do prazo legal de 15 dias."
        acao={
          <button onClick={() => setNova(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Nova solicitação
          </button>
        }
      />

      {/* métricas de prazo */}
      <Reveal>
        <div className="mb-4 grid grid-cols-3 gap-3">
          {[
            { label: "Em aberto", v: metricas.abertas, cor: "text-ink" },
            { label: "Prazo ≤ 5 dias", v: metricas.criticas, cor: metricas.criticas ? "text-amber" : "text-ink" },
            { label: "Prazo estourado", v: metricas.vencidas, cor: metricas.vencidas ? "text-rust" : "text-moss" },
          ].map((m) => (
            <div key={m.label} className="rounded-lg border border-sand bg-cream px-4 py-3">
              <p className="text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase">{m.label}</p>
              <p className={`font-display mt-1 text-[26px] leading-none font-extrabold ${m.cor}`}>{m.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* filtros */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {([["", "Todas"], ["aberta", "Abertas"], ["em_andamento", "Em andamento"], ["concluida", "Concluídas"]] as const).map(([v, l]) => (
          <button key={v} onClick={() => setFStatus(v)} className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition ${fStatus === v ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}>
            {l}
          </button>
        ))}
      </div>

      {/* fila */}
      <div className="space-y-2.5">
        {ordenadas.filter((s) => !fStatus || s.status === fStatus).map((s, i) => {
          const d = diasDesde(s.data);
          const restante = PRAZO_LGPD_DIAS - d;
          const meta = STATUS_META[s.status];
          const pct = Math.min(100, (d / PRAZO_LGPD_DIAS) * 100);
          const barraCor = s.status === "concluida" ? "var(--color-moss)" : restante < 0 ? "var(--color-rust)" : restante <= 5 ? "var(--color-amber)" : "var(--color-moss)";
          return (
            <Reveal key={s.id} delay={Math.min(i * 60, 240)}>
              <div className="rounded-lg border border-sand bg-cream px-4 py-3.5 transition hover:border-moss/45">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-paper-deep text-ink-soft"><Ic name="user" size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-display text-[14.5px] font-bold text-ink">{s.tipo}</p>
                      <span className="rounded-full px-2 py-0.5 text-[10.5px] font-bold" style={{ background: meta.bg, color: meta.cor }}>{meta.label}</span>
                    </div>
                    <p className="mt-0.5 text-[11.5px] text-ink-faint">{s.titular} · {s.canal} · recebida em {fmtData(s.data)}</p>
                  </div>

                  {s.status !== "concluida" && (
                    <div className="w-40">
                      <div className="mb-1 flex justify-between text-[10.5px] font-bold">
                        <span className="text-ink-soft">{restante >= 0 ? `${restante}d restantes` : `${-restante}d de atraso`}</span>
                        <span className="text-ink-faint">art. 19</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
                        <div className="bar-grow h-full rounded-full" style={{ width: `${pct}%`, background: barraCor }} />
                      </div>
                    </div>
                  )}

                  <div className="flex gap-1.5">
                    {s.status === "aberta" && (
                      <button onClick={() => { setStatusSolicitacao(s.id, "em_andamento"); toast("Solicitação em andamento — equipe notificada."); }} className="rounded-md border border-sand px-3 py-1.5 text-[12px] font-bold text-ink-soft transition hover:border-moss hover:bg-moss/10 hover:text-moss">
                        Iniciar tratativa
                      </button>
                    )}
                    {s.status !== "concluida" && (
                      <button onClick={() => { setRespondendo(s.id); setResposta(""); }} className="inline-flex items-center gap-1.5 rounded-md bg-pine px-3 py-1.5 text-[12px] font-bold text-lime transition hover:bg-pine-deep">
                        <Ic name="check" size={12} sw={2.6} /> Concluir
                      </button>
                    )}
                  </div>
                </div>

                {respondendo === s.id && (
                  <div className="anim-rise mt-3 rounded-md border border-sand bg-paper p-3">
                    <Campo label="Resposta enviada ao titular" hint="registre o que foi providenciado">
                      <textarea className={`${inputCls} min-h-[64px]`} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Ex.: dados exportados em PDF e enviados ao e-mail cadastrado; confirmação de leitura recebida…" />
                    </Campo>
                    <div className="mt-2 flex justify-end gap-2">
                      <button onClick={() => setRespondendo(null)} className="rounded-md border border-sand px-3 py-1.5 text-[12px] font-semibold text-ink-soft">Cancelar</button>
                      <button onClick={() => concluir(s.id)} className="rounded-md bg-moss px-3.5 py-1.5 text-[12px] font-bold text-cream transition hover:opacity-90">Confirmar conclusão</button>
                    </div>
                  </div>
                )}

                {s.status === "concluida" && s.resposta && (
                  <p className="mt-2.5 rounded-md bg-moss/8 px-3 py-2 text-[12px] leading-snug text-ink-soft">
                    <strong className="text-moss">Resposta registrada:</strong> {s.resposta}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      <Modal aberto={nova} onFechar={() => setNova(false)} titulo="Nova solicitação de titular" largura="max-w-lg">
        <div className="space-y-3.5">
          <Campo label="Titular"><input className={inputCls} value={form.titular} onChange={(e) => setForm({ ...form, titular: e.target.value })} placeholder="Nome completo do titular" autoFocus /></Campo>
          <Campo label="Direito solicitado">
            <select className={inputCls} value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })}>{TIPOS_SOLICITACAO.map((t) => <option key={t}>{t}</option>)}</select>
          </Campo>
          <Campo label="Canal de recebimento">
            <select className={inputCls} value={form.canal} onChange={(e) => setForm({ ...form, canal: e.target.value })}>{CANAIS.map((c) => <option key={c}>{c}</option>)}</select>
          </Campo>
          <p className="flex items-start gap-2 rounded-md border border-amber/40 bg-amber-soft/50 px-3 py-2.5 text-[11.5px] leading-snug text-ink-soft">
            <Ic name="clock" size={13} className="mt-0.5 shrink-0 text-amber" sw={2.2} />
            O prazo de 15 dias começa hoje (art. 19, §2º). A resposta deve ser gratuita e em formato simplificado ou completo, conforme o pedido.
          </p>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setNova(false)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft">Cancelar</button>
            <button onClick={criar} className="rounded-md bg-pine px-4 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep">Registrar solicitação</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
