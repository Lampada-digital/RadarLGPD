import { useEffect, useRef, useState } from "react";
import { useStore } from "../store";
import { analisar } from "../ai";
import type { AnaliseIA } from "../ai";
import { analisarGdpr, sugerirPlanoIso } from "../aiExtra";
import type { AnaliseGdpr, PlanoIso } from "../aiExtra";
import { FRAMEWORKS, progressoFramework } from "../frameworks";
import { DADOS_GDPR, TODAS_BASES_GDPR } from "../gdpr";
import { CATEGORIAS_DADOS, TODAS_BASES, uid } from "../types";
import type { Page } from "../App";
import { Ic } from "./ui";

type Modo = "lgpd" | "gdpr" | "iso";

interface Msg {
  id: number;
  de: "user" | "ia";
  texto: string;
  full?: string;
  lgpd?: AnaliseIA;
  gdpr?: AnaliseGdpr;
  plano?: PlanoIso;
  fwCodigo?: string;
}

let seq = 100;

const BEMVINDO: Record<Modo, string> = {
  lgpd: "Descreva uma operação (ex.: “processamos currículos no recrutamento”) e eu classifico: dados pessoais e sensíveis, base legal dos arts. 7º/11, retenção, salvaguardas e risco — tudo local, sem enviar nada a servidores.",
  gdpr: "Describe a processing activity (PT ou EN — e.g. “we run payroll for EU employees”) e eu classifico no padrão RGPD: categorias de dados, bases Art. 6/9, transferências do Capítulo V e necessidade de DPIA.",
  iso: "Selecione um framework abaixo e eu gero um plano de implementação em 4 fases a partir dos gaps reais do seu programa. O estado de cada controle alimenta o plano em tempo real.",
};

const EXEMPLOS: Record<Modo, string[]> = {
  lgpd: ["Fazemos a folha de pagamento dos colaboradores", "Disparamos e-mail marketing para leads", "CFTV monitora a portaria da fábrica"],
  gdpr: ["We process EU payroll and social security data", "CCTV surveillance of the office lobby", "Remarketing campaigns with cookies for EU visitors"],
  iso: ["Gerar plano de implementação"],
};

function Chip({ txt, tom = "neutro" }: { txt: string; tom?: "neutro" | "sensivel" | "lime" }) {
  const cls = tom === "sensivel" ? "border-rust/50 bg-rust-soft/50 text-rust" : tom === "lime" ? "border-lime/50 bg-lime/10 text-lime" : "border-cream/15 bg-pine-deep/60 text-cream/80";
  return <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-semibold ${cls}`}>{txt}</span>;
}

function CardLgpd({ a, aplicado, onAplicar }: { a: AnaliseIA; aplicado: boolean; onAplicar: () => void }) {
  const z = { label: a.zona, cor: a.zona === "baixo" ? "#6f9a45" : a.zona === "moderado" ? "#d9a726" : "#bd4f26" };
  return (
    <div className="anim-pop mt-2 rounded-lg border border-pine-line bg-pine-deep/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-[14px] font-bold text-cream">{a.titulo}</p>
        <span className="ml-auto rounded-sm bg-lime/15 px-2 py-0.5 text-[10px] font-extrabold text-lime">{a.confianca}% confiança</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Dados identificados</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {a.dados.map((d) => <Chip key={d} txt={CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d} tom={a.dadosSensiveis.includes(d) ? "sensivel" : "neutro"} />)}
          </div>
          <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Base legal recomendada</p>
          {a.bases.map((b) => (
            <p key={b.id} className={`mt-1 rounded-md border px-2.5 py-1.5 text-[11.5px] leading-snug ${b.principal ? "border-lime/50 bg-lime/10 text-cream" : "border-cream/12 text-cream/70"}`}>
              <strong>{b.inciso}</strong> — {b.titulo}
              <span className="block text-[10.5px] text-cream/55">{b.rationale}</span>
            </p>
          ))}
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Retenção sugerida</p>
          <p className="mt-1 text-[12px] text-cream/85">{a.retencao} <span className="text-cream/50">· {a.retencaoJustificativa}</span></p>
          <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Salvaguardas</p>
          <ul className="mt-1 space-y-1">
            {a.medidas.slice(0, 4).map((m) => (
              <li key={m} className="flex gap-1.5 text-[11.5px] text-cream/80"><Ic name="check" size={11} className="mt-0.5 shrink-0 text-lime" sw={3} />{m}</li>
            ))}
          </ul>
          <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Risco estimado</p>
          <p className="mt-1 text-[12px] font-bold text-cream">
            <span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: z.cor }} />
            {a.score}/25 — P{a.probabilidade} × I{a.impacto}
            {a.transferenciaInternacional && <span className="ml-2 text-[10.5px] font-semibold text-cream/60">· transferência internacional</span>}
          </p>
        </div>
      </div>
      {a.alertas.length > 0 && (
        <div className="mt-3 space-y-1 rounded-md border border-amber/40 bg-amber/10 px-3 py-2.5">
          {a.alertas.map((al) => (
            <p key={al} className="flex gap-1.5 text-[11.5px] leading-snug text-amber"><Ic name="alert" size={12} className="mt-0.5 shrink-0" sw={2.4} />{al}</p>
          ))}
        </div>
      )}
      <button onClick={onAplicar} disabled={aplicado} className={`mt-3.5 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[12.5px] font-bold transition active:scale-[0.99] ${aplicado ? "cursor-default bg-moss text-cream" : "bg-lime text-pine hover:bg-lime-soft"}`}>
        <Ic name={aplicado ? "check" : "plus"} size={14} sw={2.6} /> {aplicado ? "Adicionada ao mapeamento" : "Aplicar no mapeamento (art. 37)"}
      </button>
    </div>
  );
}

function CardGdpr({ a, aplicado, onAplicar }: { a: AnaliseGdpr; aplicado: boolean; onAplicar: () => void }) {
  const b6 = TODAS_BASES_GDPR.find((b) => b.id === a.baseArt6);
  const b9 = a.baseArt9 ? TODAS_BASES_GDPR.find((b) => b.id === a.baseArt9) : undefined;
  const riscoTxt = a.risco === 3 ? "Alto" : a.risco === 2 ? "Médio" : "Baixo";
  const riscoCor = a.risco === 3 ? "#e07b4f" : a.risco === 2 ? "#d9a726" : "#6f9a45";
  return (
    <div className="anim-pop mt-2 rounded-lg border border-pine-line bg-pine-deep/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-[14px] font-bold text-cream">{a.titulo}</p>
        <span className="rounded-sm bg-[#8fb8f0]/15 px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-[#8fb8f0] uppercase">RGPD</span>
        <span className="ml-auto rounded-sm bg-lime/15 px-2 py-0.5 text-[10px] font-extrabold text-lime">{a.confianca}% confiança</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Categorias de dados</p>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {a.dados.map((d) => <Chip key={d} txt={DADOS_GDPR.find((x) => x.id === d)?.label ?? d} tom={a.especiais.includes(d) ? "sensivel" : "neutro"} />)}
          </div>
          <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Base de licitude</p>
          <p className="mt-1 rounded-md border border-lime/50 bg-lime/10 px-2.5 py-1.5 text-[11.5px] leading-snug text-cream">
            <strong>{b6?.ref}</strong> — {b6?.titulo}
            <span className="block text-[10.5px] text-cream/55">{a.rationaleArt6}</span>
          </p>
          {b9 && (
            <p className="mt-1.5 rounded-md border border-rust/50 bg-rust/15 px-2.5 py-1.5 text-[11.5px] leading-snug text-cream">
              <strong>{b9.ref}</strong> — {b9.titulo}
              <span className="block text-[10.5px] text-cream/55">{a.rationaleArt9}</span>
            </p>
          )}
        </div>
        <div>
          <p className="text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Retenção / destinatários</p>
          <p className="mt-1 text-[12px] text-cream/85">{a.retencao}</p>
          {a.destinatarios.length > 0 && <p className="mt-0.5 text-[11px] text-cream/60">{a.destinatarios.join(", ")}</p>}
          <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Transferência internacional</p>
          <p className="mt-1 text-[12px] text-cream/85">{a.transferencia ? `Sim — ${a.mecanismoSugerido ?? "definir mecanismo (Cap. V)"}` : "Não identificada"}</p>
          <p className="mt-3 text-[10px] font-bold tracking-[0.14em] text-lime/80 uppercase">Medidas (TOMs)</p>
          <ul className="mt-1 space-y-1">
            {a.medidas.slice(0, 4).map((m) => (
              <li key={m} className="flex gap-1.5 text-[11.5px] text-cream/80"><Ic name="check" size={11} className="mt-0.5 shrink-0 text-lime" sw={3} />{m}</li>
            ))}
          </ul>
        </div>
      </div>
      {a.alertas.length > 0 && (
        <div className="mt-3 space-y-1 rounded-md border border-amber/40 bg-amber/10 px-3 py-2.5">
          {a.alertas.map((al) => (
            <p key={al} className="flex gap-1.5 text-[11.5px] leading-snug text-amber"><Ic name="alert" size={12} className="mt-0.5 shrink-0" sw={2.4} />{al}</p>
          ))}
        </div>
      )}
      <div className="mt-3 flex items-center gap-3">
        <span className="text-[11.5px] font-bold text-cream/80"><span className="mr-1.5 inline-block size-2 rounded-full" style={{ background: riscoCor }} />Risco {riscoTxt} para direitos e liberdades</span>
      </div>
      <button onClick={onAplicar} disabled={aplicado} className={`mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[12.5px] font-bold transition active:scale-[0.99] ${aplicado ? "cursor-default bg-moss text-cream" : "bg-lime text-pine hover:bg-lime-soft"}`}>
        <Ic name={aplicado ? "check" : "plus"} size={14} sw={2.6} /> {aplicado ? "Adicionada ao ROPA" : "Aplicar no ROPA (Art. 30)"}
      </button>
    </div>
  );
}

function CardPlano({ p, fwCodigo, onAbrir }: { p: PlanoIso; fwCodigo: string; onAbrir: () => void }) {
  return (
    <div className="anim-pop mt-2 rounded-lg border border-pine-line bg-pine-deep/70 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <p className="font-display text-[14px] font-bold text-cream">Roadmap {fwCodigo}</p>
        <span className="ml-auto flex gap-1.5 text-[10px] font-bold">
          <span className="rounded-sm bg-rust/20 px-2 py-0.5 text-[#f0b39a]">{p.gap.nao} não iniciados</span>
          <span className="rounded-sm bg-amber/20 px-2 py-0.5 text-amber-soft">{p.gap.andamento} em andamento</span>
          <span className="rounded-sm bg-lime/15 px-2 py-0.5 text-lime">{p.gap.conformes} conformes</span>
        </span>
      </div>
      <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {p.fases.map((f) => (
          <div key={f.fase} className="rounded-md border border-cream/10 bg-pine/60 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-[12.5px] font-bold text-cream">{f.fase}</p>
              <span className="shrink-0 rounded-sm bg-lime/15 px-1.5 py-0.5 text-[9px] font-extrabold text-lime uppercase">{f.prazo}</span>
            </div>
            <ul className="mt-2 space-y-1">
              {f.acoes.slice(0, 4).map((a) => (
                <li key={a} className="flex gap-1.5 text-[11px] leading-snug text-cream/75"><span className="mt-1.5 size-1 shrink-0 rounded-full bg-lime/70" />{a}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <button onClick={onAbrir} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[12.5px] font-bold text-pine transition hover:bg-lime-soft active:scale-[0.99]">
        Abrir programa de controles <Ic name="arrow" size={13} />
      </button>
    </div>
  );
}

export default function Assistant({ irPara }: { irPara: (p: Page) => void }) {
  const { addAtividade, addGdprAtividade, iso, toast } = useStore();
  const [modo, setModo] = useState<Modo>("lgpd");
  const [msgs, setMsgs] = useState<Record<Modo, Msg[]>>({
    lgpd: [{ id: 1, de: "ia", texto: BEMVINDO.lgpd }],
    gdpr: [{ id: 2, de: "ia", texto: BEMVINDO.gdpr }],
    iso: [{ id: 3, de: "ia", texto: BEMVINDO.iso }],
  });
  const [input, setInput] = useState("");
  const [pensando, setPensando] = useState(false);
  const [digitando, setDigitando] = useState<number | null>(null);
  const [aplicadas, setAplicadas] = useState<Set<number>>(new Set());
  const [fwSel, setFwSel] = useState("iso27001");
  const fimRef = useRef<HTMLDivElement>(null);

  const lista = msgs[modo];

  useEffect(() => {
    fimRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [lista.length, pensando, digitando, modo]);

  /* efeito de digitação */
  const msgsRef = useRef(msgs);
  msgsRef.current = msgs;

  useEffect(() => {
    if (digitando == null) return;
    let alvo: Msg | undefined;
    for (const k of Object.keys(msgsRef.current) as Modo[]) {
      alvo = msgsRef.current[k].find((x) => x.id === digitando) ?? alvo;
    }
    if (!alvo?.full) return;
    const full = alvo.full;
    let i = 0;
    const iv = setInterval(() => {
      i = Math.min(full.length, i + 5);
      const corte = full.slice(0, i);
      setMsgs((m) => ({
        ...m,
        [modo]: m[modo].map((x) => (x.id === digitando ? { ...x, texto: corte } : x)),
      }));
      if (i >= full.length) {
        clearInterval(iv);
        setDigitando(null);
      }
    }, 16);
    return () => clearInterval(iv);
  }, [digitando, modo]);

  const push = (m: Modo, msg: Msg) => setMsgs((x) => ({ ...x, [m]: [...x[m], msg] }));

  const responder = (t: string) => {
    const idU = ++seq;
    push(modo, { id: idU, de: "user", texto: t });
    setInput("");
    setPensando(true);
    setTimeout(() => {
      setPensando(false);
      if (modo === "iso") {
        const fw = FRAMEWORKS.find((f) => f.id === fwSel)!;
        const p = sugerirPlanoIso(fwSel, iso);
        const idR = ++seq;
        push(modo, { id: idR, de: "ia", texto: "", full: `Levantei os gaps da ${fw.codigo} contra o estado atual do programa: ${p.gap.nao + p.gap.andamento} controles pendentes de ${p.gap.total}. Estruturei um roadmap em 4 fases priorizando governança e controles de alto impacto.`, plano: p, fwCodigo: fw.codigo });
        setDigitando(idR);
        return;
      }
      if (modo === "lgpd") {
        const a = analisar(t);
        const idR = ++seq;
        push(modo, { id: idR, de: "ia", texto: "", full: `Analisei “${a.titulo}”: identifiquei ${a.dados.length} categorias de dados${a.dadosSensiveis.length ? `, sendo ${a.dadosSensiveis.length} sensível(is) (art. 5º, II)` : ""}. A base recomendada é ${a.bases.find((b) => b.principal)?.inciso}.`, lgpd: a });
        setDigitando(idR);
      } else {
        const a = analisarGdpr(t);
        const idR = ++seq;
        push(modo, { id: idR, de: "ia", texto: "", full: `Classifiquei no padrão RGPD: ${a.dados.length} categorias${a.especiais.length ? ` com ${a.especiais.length} do Art. 9` : ""}, base ${TODAS_BASES_GDPR.find((b) => b.id === a.baseArt6)?.ref}${a.transferencia ? " e transferência fora do EEE detectada" : ""}.`, gdpr: a });
        setDigitando(idR);
      }
    }, 900);
  };

  const aplicarLgpd = (id: number, a: AnaliseIA) => {
    addAtividade({
      id: uid(), nome: a.titulo, area: a.sujeitos.includes("Colaboradores") || a.sujeitos.includes("Candidatos") ? "RH" : "Comercial",
      responsavel: "Via Assistente IA", finalidade: a.finalidade, baseLegalId: a.baseRecomendada,
      sujeitos: a.sujeitos.length ? a.sujeitos : ["Clientes"], dados: a.dados, retencao: a.retencao,
      retencaoJustificativa: a.retencaoJustificativa, compartilhamento: [], transferenciaInternacional: a.transferenciaInternacional,
      medidas: a.medidas, probabilidade: a.probabilidade, impacto: a.impacto, origem: "ia",
      criadoEm: new Date().toISOString().slice(0, 10),
    });
    setAplicadas((s) => new Set(s).add(id));
    toast("Registro criado no mapeamento (art. 37) com os dados da IA.", "ia");
  };

  const aplicarGdpr = (id: number, a: AnaliseGdpr) => {
    addGdprAtividade({
      id: uid(), nome: a.titulo, departamento: /payroll|hr|empregado|funcionario/.test(a.finalidades.toLowerCase()) ? "HR" : "Operações",
      finalidades: a.finalidades, baseArt6: a.baseArt6, baseArt9: a.baseArt9,
      titulares: a.titulares.length ? a.titulares : ["Titulares UE"], dados: a.dados, retencao: a.retencao,
      destinatarios: a.destinatarios, transferencia: a.transferencia, mecanismoTransferencia: a.mecanismoSugerido,
      medidas: a.medidas, risco: a.risco, origem: "ia", criadoEm: new Date().toISOString().slice(0, 10),
    });
    setAplicadas((s) => new Set(s).add(id));
    toast("Operação registrada no ROPA (Art. 30) com os dados da IA.", "ia");
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="mb-1 flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-moss uppercase">
            <span className="inline-block h-px w-6 bg-moss" /> Motor de classificação · 100% local
          </p>
          <h1 className="font-display text-[26px] leading-tight font-extrabold tracking-tight text-ink sm:text-[30px]">Assistente IA de mapeamento</h1>
        </div>
        <div className="relative grid grid-cols-3 rounded-lg border border-sand bg-paper-deep p-1">
          <span className="absolute inset-y-1 left-1 w-[calc(33.33%-0.28rem)] rounded-md bg-pine shadow-sm transition-transform duration-300 ease-out" style={{ transform: modo === "gdpr" ? "translateX(calc(100% + 0.25rem))" : modo === "iso" ? "translateX(calc(200% + 0.5rem))" : "translateX(0)" }} />
          {(["lgpd", "gdpr", "iso"] as const).map((m) => (
            <button key={m} onClick={() => setModo(m)} className={`relative z-10 rounded-md px-4 py-1.5 text-[12px] font-bold tracking-wide uppercase transition-colors ${modo === m ? "text-lime" : "text-ink-soft hover:text-ink"}`}>
              {m === "lgpd" ? "LGPD" : m === "gdpr" ? "GDPR" : "ISO"}
            </button>
          ))}
        </div>
      </div>

      {/* chat */}
      <div className="rail-texture flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-pine-line bg-pine">
        <div className="min-h-0 flex-1 space-y-3.5 overflow-y-auto px-4 py-4 sm:px-5">
          {lista.map((m) => (
            <div key={m.id} className={`flex ${m.de === "user" ? "justify-end" : "justify-start"}`}>
              {m.de === "ia" && (
                <span className="mr-2.5 mt-1 grid size-7 shrink-0 place-items-center rounded-md border border-lime/40 bg-pine-deep text-lime">
                  <Ic name="radar" size={15} />
                </span>
              )}
              <div className={`max-w-[85%] rounded-lg px-3.5 py-2.5 text-[13px] leading-relaxed sm:max-w-[75%] ${m.de === "user" ? "rounded-br-sm bg-lime font-medium text-pine" : "rounded-bl-sm border border-cream/12 bg-pine-deep/80 text-cream/90"}`}>
                <p className={digitando === m.id ? "caret" : ""}>{m.texto}</p>
                {m.lgpd && digitando !== m.id && <CardLgpd a={m.lgpd} aplicado={aplicadas.has(m.id)} onAplicar={() => aplicarLgpd(m.id, m.lgpd!)} />}
                {m.gdpr && digitando !== m.id && <CardGdpr a={m.gdpr} aplicado={aplicadas.has(m.id)} onAplicar={() => aplicarGdpr(m.id, m.gdpr!)} />}
                {m.plano && digitando !== m.id && <CardPlano p={m.plano} fwCodigo={m.fwCodigo ?? ""} onAbrir={() => irPara("iso")} />}
              </div>
            </div>
          ))}
          {pensando && (
            <div className="flex items-center gap-2.5">
              <span className="grid size-7 place-items-center rounded-md border border-lime/40 bg-pine-deep text-lime"><Ic name="radar" size={15} /></span>
              <span className="flex items-center gap-1.5 rounded-lg border border-cream/12 bg-pine-deep/80 px-3.5 py-2.5 text-[12px] text-cream/60">
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-lime" />
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-lime" style={{ animationDelay: "0.2s" }} />
                <span className="inline-block size-1.5 animate-pulse rounded-full bg-lime" style={{ animationDelay: "0.4s" }} />
                <span className="ml-1.5">analisando{modo === "iso" ? " os gaps do programa…" : " a operação…"}</span>
              </span>
            </div>
          )}
          <div ref={fimRef} />
        </div>

        {/* entrada */}
        <div className="border-t border-pine-line bg-pine-deep/60 px-4 py-3.5">
          {modo === "iso" && (
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold tracking-wide text-cream/50 uppercase">Framework:</span>
              <select value={fwSel} onChange={(e) => setFwSel(e.target.value)} className="rounded-md border border-pine-line bg-pine px-2.5 py-1.5 text-[12px] font-semibold text-cream outline-none">
                {FRAMEWORKS.map((f) => {
                  const p = progressoFramework(f, iso);
                  return <option key={f.id} value={f.id}>{f.codigo} — {p.pct}% implementado</option>;
                })}
              </select>
            </div>
          )}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && responder(input.trim())}
              placeholder={modo === "lgpd" ? "Descreva a operação de tratamento…" : modo === "gdpr" ? "Describe the processing activity…" : "Ex.: “montar o programa do zero” (o plano usa seus gaps reais)"}
              className="min-w-0 flex-1 rounded-md border border-pine-line bg-pine px-3.5 py-2.5 text-[13px] text-cream outline-none transition placeholder:text-cream/35 focus:border-lime/60"
            />
            <button onClick={() => responder(input.trim())} disabled={pensando || digitando != null || !input.trim()} className="grid size-10 shrink-0 place-items-center rounded-md bg-lime text-pine transition hover:bg-lime-soft active:scale-95 disabled:opacity-40" aria-label="Enviar">
              <Ic name="send" size={16} sw={2} />
            </button>
          </div>
          <div className="mt-2.5 flex flex-wrap gap-1.5">
            {EXEMPLOS[modo].map((e) => (
              <button key={e} onClick={() => responder(e)} disabled={pensando || digitando != null} className="rounded-full border border-cream/15 px-3 py-1 text-[11px] text-cream/60 transition hover:border-lime/50 hover:text-lime disabled:opacity-40">
                {e}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
