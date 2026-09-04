import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { analisar, dadoSensivel, ETAPAS_ANALISE, labelDado, SUGESTOES_PROMPT } from "../ai";
import type { AnaliseIA } from "../ai";
import { TODAS_BASES, uid, ZONA_META, AREAS } from "../types";
import type { Page } from "../App";
import { Cabecalho, Ic } from "./ui";

interface Msg {
  id: string;
  autor: "usuario" | "ia";
  texto?: string;
  analise?: AnaliseIA;
}

function CartaoAnalise({ a, onAplicar, aplicado, onVer }: { a: AnaliseIA; onAplicar: () => void; aplicado: boolean; onVer: () => void }) {
  const z = ZONA_META[a.zona];
  return (
    <div className="anim-rise mt-1 overflow-hidden rounded-lg border border-pine-line bg-pine text-cream">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-pine-line px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="grid size-6 place-items-center rounded-md bg-lime text-pine"><Ic name="spark" size={13} sw={2.4} /></span>
          <p className="font-display text-[14.5px] font-bold text-lime">{a.titulo}</p>
        </div>
        <span className="rounded-full border border-cream/20 px-2.5 py-0.5 text-[10.5px] font-bold tracking-wide text-cream/80 uppercase">Confiança {Math.round(a.confianca * 100)}%</span>
      </div>

      <div className="grid gap-4 px-4 py-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <p className="mb-1 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Finalidade sugerida</p>
          <p className="text-[13px] leading-relaxed text-cream/90">{a.finalidade}</p>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Dados pessoais detectados · {a.dados.length}</p>
          <div className="flex flex-wrap gap-1.5">
            {a.dados.map((d) => (
              <span key={d} className={`rounded-md px-2 py-1 text-[11.5px] font-semibold ${dadoSensivel(d) ? "bg-rust text-cream" : "bg-pine-deep text-cream/85 ring-1 ring-cream/12"}`}>
                {labelDado(d)}{dadoSensivel(d) && " ⚠"}
              </span>
            ))}
          </div>
          <p className="mb-1.5 mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Titulares</p>
          <p className="text-[12.5px] text-cream/85">{a.sujeitos.join(" · ")}</p>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Base legal recomendada</p>
          {a.bases.map((b) => (
            <div key={b.id} className={`mb-2 rounded-md border p-2.5 ${b.principal ? "border-lime/50 bg-pine-deep" : "border-cream/12"}`}>
              <p className="flex items-center gap-2 text-[12.5px] font-bold text-cream">
                {b.titulo}
                {b.principal && <span className="rounded-sm bg-lime px-1.5 py-px text-[9px] font-extrabold tracking-wide text-pine uppercase">Principal</span>}
              </p>
              <p className="mt-0.5 text-[10.5px] font-semibold text-lime/90">{b.inciso}</p>
              <p className="mt-1 text-[11.5px] leading-snug text-cream/70">{b.rationale}</p>
            </div>
          ))}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Retenção sugerida</p>
          <p className="text-[13px] font-bold text-cream">{a.retencao}</p>
          <p className="text-[11.5px] text-cream/65">{a.retencaoJustificativa}</p>
          {a.transferenciaInternacional && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-amber/20 px-2 py-1 text-[11px] font-bold text-amber">
              <Ic name="globe" size={12} sw={2.2} /> Transferência internacional
            </p>
          )}
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Salvaguardas recomendadas</p>
          <ul className="space-y-1">
            {a.medidas.slice(0, 5).map((m) => (
              <li key={m} className="flex items-center gap-1.5 text-[11.5px] text-cream/85"><Ic name="shield" size={11} className="shrink-0 text-lime" sw={2.2} /> {m}</li>
            ))}
          </ul>
        </div>

        <div className="sm:col-span-2">
          <p className="mb-1.5 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Risco calculado</p>
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md px-3 py-2 text-[13px] font-bold text-pine" style={{ background: z.dot, color: "#faf8ee" }}>
              {z.label} · {a.score}/25
            </span>
            <span className="text-[12px] text-cream/75">Probabilidade {a.probabilidade}/5 × Impacto {a.impacto}/5</span>
          </div>
        </div>

        {a.alertas.length > 0 && (
          <div className="rounded-md border border-amber/35 bg-pine-deep p-3 sm:col-span-2">
            <p className="mb-1.5 flex items-center gap-1.5 text-[10.5px] font-bold tracking-[0.12em] text-amber uppercase"><Ic name="alert" size={12} sw={2.2} /> Pontos de atenção</p>
            <ul className="space-y-1">
              {a.alertas.map((al) => (
                <li key={al} className="flex gap-2 text-[11.5px] leading-snug text-cream/85"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-amber" />{al}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-pine-line bg-pine-deep/60 px-4 py-3">
        <button
          onClick={onAplicar}
          disabled={aplicado}
          className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-[12.5px] font-bold transition active:scale-[0.98] ${aplicado ? "cursor-default bg-moss text-cream" : "bg-lime text-pine hover:bg-lime-soft"}`}
        >
          <Ic name={aplicado ? "check" : "plus"} size={13} sw={2.6} />
          {aplicado ? "Adicionada ao mapeamento" : "Aplicar no mapeamento"}
        </button>
        {aplicado && (
          <button onClick={onVer} className="inline-flex items-center gap-1.5 rounded-md border border-cream/25 px-3.5 py-2 text-[12.5px] font-bold text-cream transition hover:border-lime hover:text-lime">
            Ver no registro <Ic name="arrow" size={12} />
          </button>
        )}
        <p className="text-[10.5px] text-cream/50">Cria a atividade de tratamento pré-preenchida no Registro (art. 37).</p>
      </div>
    </div>
  );
}

export default function Assistant({ irPara }: { irPara: (p: Page) => void }) {
  const { addAtividade, toast } = useStore();
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [entrada, setEntrada] = useState("");
  const [pensando, setPensando] = useState(false);
  const [etapa, setEtapa] = useState("");
  const [aplicadas, setAplicadas] = useState<Set<string>>(new Set());
  const fim = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => { fim.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [msgs, pensando, etapa]);

  const enviar = (texto: string) => {
    const t = texto.trim();
    if (!t || pensando) return;
    setEntrada("");
    setMsgs((m) => [...m, { id: uid(), autor: "usuario", texto: t }]);
    setPensando(true);

    ETAPAS_ANALISE.forEach((e, i) => {
      timers.current.push(window.setTimeout(() => setEtapa(e), 350 + i * 620));
    });

    timers.current.push(
      window.setTimeout(() => {
        const analise = analisar(t);
        setMsgs((m) => [...m, { id: uid(), autor: "ia", analise }]);
        setPensando(false);
        setEtapa("");
        toast("Análise concluída pela IA local.", "ia");
      }, 350 + ETAPAS_ANALISE.length * 620 + 350)
    );
  };

  const aplicar = (msgId: string, a: AnaliseIA) => {
    if (aplicadas.has(msgId)) return;
    const area =
      a.contexto === "recrutamento" || a.contexto === "folha" || a.contexto === "saude-ocupacional" ? "RH"
      : a.contexto === "marketing" || a.contexto === "digital" ? "Marketing"
      : a.contexto === "vendas" ? "Comercial"
      : a.contexto === "cftv" ? "Operações"
      : a.contexto === "atendimento" ? "Atendimento"
      : a.contexto === "fornecedores" ? "Operações"
      : AREAS[0];
    addAtividade({
      id: uid(),
      nome: a.titulo,
      area,
      responsavel: "A definir",
      finalidade: a.finalidade,
      baseLegalId: a.baseRecomendada,
      sujeitos: a.sujeitos,
      dados: a.dados,
      retencao: a.retencao,
      retencaoJustificativa: a.retencaoJustificativa,
      compartilhamento: [],
      transferenciaInternacional: a.transferenciaInternacional,
      medidas: a.medidas,
      probabilidade: a.probabilidade,
      impacto: a.impacto,
      origem: "ia",
      criadoEm: new Date().toISOString().slice(0, 10),
      observacoes: "Registro criado a partir de análise da IA — revise responsável e compartilhamentos.",
    });
    setAplicadas((s) => new Set(s).add(msgId));
    toast("Atividade adicionada ao Registro de Operações.", "ok");
  };

  return (
    <div className="flex h-full min-h-0 flex-col">
      <Cabecalho
        kicker="Assistente IA · classificação local"
        titulo="Descreva a operação. A IA mapeia."
        desc="A IA identifica dados pessoais e sensíveis, recomenda a base legal (arts. 7º e 11), retenção, salvaguardas e risco — sem enviar nada para servidores externos."
      />

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-pine-line bg-pine rail-texture">
        {/* fio da conversa */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5 sm:px-6">
          {msgs.length === 0 && (
            <div className="anim-rise mx-auto mt-6 max-w-xl text-center">
              <div className="relative mx-auto mb-5 grid size-20 place-items-center rounded-full border border-lime/30 bg-pine-deep">
                <span className="radar-sweep absolute inset-1 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.3), transparent 80deg)" }} />
                <Ic name="spark" size={28} className="text-lime" sw={1.6} />
              </div>
              <h2 className="font-display text-[22px] font-extrabold text-cream">O que vamos mapear hoje?</h2>
              <p className="mx-auto mt-1.5 max-w-md text-[13px] leading-relaxed text-cream/60">
                Descreva uma operação de tratamento em linguagem natural — a análise segue a estrutura do Relatório de Impacto e do art. 37.
              </p>
              <div className="mt-6 space-y-2 text-left">
                {SUGESTOES_PROMPT.map((s, i) => (
                  <button key={i} onClick={() => enviar(s)} className="group flex w-full items-start gap-2.5 rounded-md border border-pine-line bg-pine-deep/70 px-3.5 py-2.5 text-left transition hover:border-lime/50 hover:bg-pine-deep">
                    <Ic name="wand" size={14} className="mt-0.5 shrink-0 text-lime" sw={2} />
                    <span className="text-[12.5px] leading-snug text-cream/80 transition group-hover:text-cream">{s}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {msgs.map((m) =>
            m.autor === "usuario" ? (
              <div key={m.id} className="anim-slide-left flex justify-end">
                <div className="max-w-[85%] rounded-lg rounded-br-sm bg-lime px-4 py-2.5 text-[13px] leading-relaxed font-medium text-pine shadow-sm">{m.texto}</div>
              </div>
            ) : (
              m.analise && <CartaoAnalise key={m.id} a={m.analise} aplicado={aplicadas.has(m.id)} onAplicar={() => aplicar(m.id, m.analise!)} onVer={() => irPara("atividades")} />
            )
          )}

          {pensando && (
            <div className="flex items-center gap-3 rounded-lg border border-pine-line bg-pine-deep/80 px-4 py-3">
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <span key={i} className="size-1.5 animate-bounce rounded-full bg-lime" style={{ animationDelay: `${i * 140}ms` }} />
                ))}
              </span>
              <p className="caret text-[12.5px] font-semibold text-cream/85">{etapa || "Iniciando análise…"}</p>
            </div>
          )}
          <div ref={fim} />
        </div>

        {/* entrada */}
        <div className="border-t border-pine-line bg-pine-deep/80 p-3.5">
          <form
            onSubmit={(e) => { e.preventDefault(); enviar(entrada); }}
            className="flex items-center gap-2 rounded-lg border border-pine-line bg-pine px-3 py-2 transition focus-within:border-lime/60"
          >
            <Ic name="spark" size={16} className="shrink-0 text-lime" />
            <input
              value={entrada}
              onChange={(e) => setEntrada(e.target.value)}
              placeholder="Ex.: cadastro de clientes na loja virtual com CPF, endereço de entrega e cookies de analytics…"
              className="min-w-0 flex-1 bg-transparent text-[13.5px] text-cream placeholder:text-cream/35 outline-none"
              disabled={pensando}
            />
            <button type="submit" disabled={pensando || !entrada.trim()} className="grid size-8 shrink-0 place-items-center rounded-md bg-lime text-pine transition enabled:hover:bg-lime-soft enabled:active:scale-95 disabled:opacity-35" aria-label="Enviar">
              <Ic name="send" size={15} sw={2.1} />
            </button>
          </form>
          <p className="mt-2 flex items-center gap-1.5 px-1 text-[10.5px] text-cream/40">
            <Ic name="shield" size={11} sw={2.2} /> Heurísticas 100% locais · nenhum dado pessoal é transmitido · revise sempre com o Encarregado (DPO).
          </p>
        </div>
      </div>
    </div>
  );
}
