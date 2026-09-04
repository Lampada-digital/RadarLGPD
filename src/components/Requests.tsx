import { useMemo, useState } from "react";
import { useStore } from "../store";
import { CANAIS, diasDesde, fmtData, prazoDe, TIPOS_SOLICITACAO, uid } from "../types";
import type { Solicitacao, StatusSolicitacao } from "../types";
import { TIPOS_DSAR_GDPR } from "../gdpr";
import { Cabecalho, Campo, Ic, inputCls, Modal, Reveal } from "./ui";

const STATUS_META: Record<StatusSolicitacao, { label: string; cls: string }> = {
  aberta: { label: "Aberta", cls: "bg-paper-deep text-ink-soft" },
  em_andamento: { label: "Em andamento", cls: "bg-amber-soft text-ink" },
  concluida: { label: "Concluída", cls: "bg-moss/12 text-moss" },
};

export default function Requests() {
  const { solicitacoes, addSolicitacao, setStatusSolicitacao, toast } = useStore();
  const [filtro, setFiltro] = useState<"todos" | "LGPD" | "GDPR">("todos");
  const [form, setForm] = useState(false);
  const [respondendo, setRespondendo] = useState<string | null>(null);
  const [resposta, setResposta] = useState("");
  const [nTitular, setNTitular] = useState("");
  const [nTipo, setNTipo] = useState(TIPOS_SOLICITACAO[0]);
  const [nCanal, setNCanal] = useState(CANAIS[0]);
  const [nData, setNData] = useState(new Date().toISOString().slice(0, 10));
  const [nRegime, setNRegime] = useState<"LGPD" | "GDPR">("LGPD");

  const tipos = nRegime === "GDPR" ? TIPOS_DSAR_GDPR : TIPOS_SOLICITACAO;

  const lista = useMemo(
    () => solicitacoes.filter((s) => filtro === "todos" || (s.regime ?? "LGPD") === filtro),
    [solicitacoes, filtro]
  );

  const stats = useMemo(() => {
    const abertas = solicitacoes.filter((s) => s.status !== "concluida");
    return {
      abertas: abertas.length,
      vencidas: abertas.filter((s) => diasDesde(s.data) > prazoDe(s)).length,
      noPrazo: abertas.filter((s) => diasDesde(s.data) <= prazoDe(s)).length,
    };
  }, [solicitacoes]);

  const registrar = () => {
    if (!nTitular.trim()) {
      toast("Informe o nome do titular.", "warn");
      return;
    }
    addSolicitacao({ id: uid(), titular: nTitular.trim(), tipo: nTipo, canal: nCanal, data: nData, status: "aberta", regime: nRegime });
    toast(`Solicitação ${nRegime} registrada — prazo de ${prazoDe({ regime: nRegime })} dias corridos.`);
    setForm(false);
    setNTitular("");
    setNTipo(nRegime === "GDPR" ? TIPOS_DSAR_GDPR[0] : TIPOS_SOLICITACAO[0]);
  };

  const concluir = (id: string) => {
    if (resposta.trim().length < 10) {
      toast("Descreva a resposta enviada ao titular (mín. 10 caracteres).", "warn");
      return;
    }
    setStatusSolicitacao(id, "concluida", resposta.trim());
    setRespondendo(null);
    setResposta("");
    toast("Solicitação concluída com resposta registrada.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Direitos dos titulares · Arts. 18–19 LGPD · Arts. 15–22 GDPR"
        titulo="Fila de solicitações"
        desc="Todo pedido do titular entra aqui com o prazo legal correndo: 15 dias (LGPD, art. 19) ou 1 mês (GDPR, art. 12). Responda e registre a tratativa para fins de accountability."
        acao={
          <button onClick={() => setForm(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Nova solicitação
          </button>
        }
      />

      {/* métricas + filtro */}
      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-2">
            {(["todos", "LGPD", "GDPR"] as const).map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`rounded-md border px-3.5 py-2 text-[12px] font-bold transition ${filtro === f ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}>
                {f === "todos" ? "Todos" : f}
              </button>
            ))}
          </div>
          <div className="ml-auto flex flex-wrap items-center gap-2 text-[11.5px] font-bold">
            <span className="rounded-full bg-paper-deep px-2.5 py-1 text-ink-soft">{stats.abertas} em aberto</span>
            <span className={`rounded-full px-2.5 py-1 ${stats.vencidas ? "bg-rust text-cream" : "bg-moss/12 text-moss"}`}>{stats.vencidas} vencida(s)</span>
            <span className="rounded-full bg-amber-soft px-2.5 py-1 text-ink">{stats.noPrazo} no prazo</span>
          </div>
        </div>
      </Reveal>

      <div className="space-y-2.5">
        {lista.length === 0 && (
          <div className="rounded-lg border border-dashed border-sand bg-paper/60 px-6 py-14 text-center">
            <Ic name="user" size={30} className="mx-auto text-sand" />
            <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhuma solicitação neste filtro</p>
            <p className="mt-1 text-[12.5px] text-ink-soft">Registre um pedido de titular para iniciar a contagem do prazo legal.</p>
          </div>
        )}
        {lista.map((s, i) => {
          const d = diasDesde(s.data);
          const prazo = prazoDe(s);
          const restante = prazo - d;
          const pct = Math.min(100, Math.round((d / prazo) * 100));
          const gdprRegime = s.regime === "GDPR";
          const vencida = s.status !== "concluida" && restante < 0;
          return (
            <Reveal key={s.id} delay={Math.min(i * 50, 250)}>
              <div className={`rounded-lg border bg-cream p-4 transition hover:shadow-[0_10px_24px_-16px_rgba(19,46,38,0.4)] ${vencida ? "border-rust/60" : "border-sand"}`}>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-md bg-paper-deep text-moss"><Ic name="user" size={17} /></span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-[13.5px] font-bold text-ink">
                      {s.tipo}
                      <span className={`rounded-sm px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide uppercase ${gdprRegime ? "bg-[#1f4e8f]/10 text-[#1f4e8f]" : "bg-moss/12 text-moss"}`}>{s.regime ?? "LGPD"}</span>
                    </p>
                    <p className="text-[11.5px] text-ink-soft">{s.titular} · {s.canal} · recebida em {fmtData(s.data)}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10.5px] font-extrabold uppercase ${STATUS_META[s.status].cls}`}>{STATUS_META[s.status].label}</span>
                  {s.status !== "concluida" && (
                    <div className="w-36">
                      <div className="mb-1 flex justify-between text-[10px] font-bold">
                        <span className={vencida ? "text-rust" : restante <= 5 ? "text-amber" : "text-ink-faint"}>
                          {vencida ? `Vencida há ${Math.abs(restante)}d` : `${restante}d restantes`}
                        </span>
                        <span className="text-ink-faint">de {prazo}d</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-paper-deep">
                        <div className={`h-full rounded-full transition-all duration-700 ${vencida ? "bg-rust" : pct > 70 ? "bg-amber" : "bg-moss"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  )}
                  {s.status === "aberta" && (
                    <button onClick={() => setStatusSolicitacao(s.id, "em_andamento")} className="rounded-md border border-sand px-3 py-1.5 text-[11.5px] font-bold text-ink-soft transition hover:border-amber hover:bg-amber-soft/60 hover:text-ink">
                      Iniciar tratativa
                    </button>
                  )}
                  {s.status === "em_andamento" && (
                    <button onClick={() => { setRespondendo(s.id); setResposta(""); }} className="rounded-md bg-moss px-3 py-1.5 text-[11.5px] font-bold text-cream transition hover:bg-pine">
                      Concluir com resposta
                    </button>
                  )}
                </div>
                {respondendo === s.id && (
                  <div className="anim-pop mt-3 rounded-md border border-sand bg-paper p-3">
                    <Campo label="Resposta enviada ao titular" hint="fica registrada como evidência">
                      <textarea className={`${inputCls} min-h-[64px] resize-y`} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Ex.: Dados exportados em JSON e link seguro enviado ao titular; cópias apagadas dos sistemas legados…" />
                    </Campo>
                    <div className="mt-2 flex justify-end gap-2">
                      <button onClick={() => setRespondendo(null)} className="rounded-md border border-sand px-3 py-1.5 text-[12px] font-semibold text-ink-soft">Cancelar</button>
                      <button onClick={() => concluir(s.id)} className="inline-flex items-center gap-1.5 rounded-md bg-pine px-3.5 py-1.5 text-[12px] font-bold text-lime transition hover:bg-pine-deep">
                        <Ic name="check" size={12} sw={2.8} /> Confirmar conclusão
                      </button>
                    </div>
                  </div>
                )}
                {s.status === "concluida" && s.resposta && (
                  <p className="mt-3 rounded-md bg-moss/8 px-3 py-2 text-[11.5px] leading-snug text-ink-soft">
                    <strong className="text-moss">Resposta registrada:</strong> {s.resposta}
                  </p>
                )}
              </div>
            </Reveal>
          );
        })}
      </div>

      <Modal aberto={form} onFechar={() => setForm(false)} titulo="Registrar solicitação de titular" largura="max-w-lg">
        <div className="space-y-3.5">
          <div className="grid grid-cols-2 gap-2.5">
            <Campo label="Regime legal">
              <div className="grid grid-cols-2 gap-1.5">
                {(["LGPD", "GDPR"] as const).map((r) => (
                  <button key={r} type="button" onClick={() => { setNRegime(r); setNTipo(r === "GDPR" ? TIPOS_DSAR_GDPR[0] : TIPOS_SOLICITACAO[0]); }} className={`rounded-md border px-2 py-2 text-[12.5px] font-bold transition ${nRegime === r ? (r === "GDPR" ? "border-[#1f4e8f] bg-[#1f4e8f]/10 text-[#1f4e8f]" : "border-moss bg-moss/10 text-moss") : "border-sand text-ink-soft hover:border-ink/40"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </Campo>
            <Campo label="Data do recebimento">
              <input type="date" className={inputCls} value={nData} onChange={(e) => setNData(e.target.value)} />
            </Campo>
          </div>
          <Campo label="Titular"><input className={inputCls} value={nTitular} onChange={(e) => setNTitular(e.target.value)} placeholder="Nome do titular" /></Campo>
          <Campo label="Tipo de pedido">
            <select className={inputCls} value={nTipo} onChange={(e) => setNTipo(e.target.value)}>
              {tipos.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Campo>
          <Campo label="Canal de recebimento">
            <select className={inputCls} value={nCanal} onChange={(e) => setNCanal(e.target.value)}>
              {CANAIS.map((t) => <option key={t}>{t}</option>)}
            </select>
          </Campo>
          <div className="flex items-center justify-between gap-3 border-t border-sand pt-4">
            <p className="text-[11px] text-ink-faint">Prazo legal: <strong className="text-ink-soft">{prazoDe({ regime: nRegime })} dias</strong> ({nRegime === "GDPR" ? "Art. 12(3) GDPR" : "Art. 19, §2º, LGPD"})</p>
            <button onClick={registrar} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
              <Ic name="check" size={14} sw={2.6} /> Registrar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
