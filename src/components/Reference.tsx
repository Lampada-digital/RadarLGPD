import { useMemo, useState } from "react";
import { useStore } from "../store";
import { BASES_ART11, BASES_ART7 } from "../types";
import type { BaseLegal } from "../types";
import { Cabecalho, Ic, inputCls, Reveal } from "./ui";

function CartaoBase({ b, usos, max, i }: { b: BaseLegal; usos: number; max: number; i: number }) {
  const ativo = usos > 0;
  return (
    <Reveal delay={Math.min(i * 40, 280)}>
      <div className={`group relative h-full overflow-hidden rounded-lg border p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_-16px_rgba(19,46,38,0.4)] ${ativo ? "border-moss/40 bg-cream" : "border-sand bg-paper/70"}`}>
        <div className="flex items-start justify-between gap-3">
          <span className={`rounded-md px-2 py-1 text-[10.5px] font-extrabold tracking-wide uppercase ${b.artigo === "art11" ? "bg-rust/10 text-rust" : "bg-moss/12 text-moss"}`}>{b.inciso}</span>
          <span className={`font-display text-[20px] leading-none font-extrabold ${ativo ? "text-moss" : "text-sand"}`}>
            {usos}<span className="ml-0.5 text-[10px] font-bold text-ink-faint">uso(s)</span>
          </span>
        </div>
        <h3 className="font-display mt-2.5 text-[15.5px] leading-snug font-bold text-ink">{b.titulo}</h3>
        <p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{b.descricao}</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-paper-deep">
          <div className="bar-grow h-full rounded-full" style={{ width: max ? `${(usos / max) * 100}%` : "0%", background: b.artigo === "art11" ? "var(--color-rust)" : "var(--color-moss)", animationDelay: `${i * 60 + 150}ms` }} />
        </div>
        {b.artigo === "art11" && (
          <p className="mt-2.5 inline-flex items-center gap-1 text-[10.5px] font-bold text-rust"><Ic name="alert" size={11} sw={2.4} /> Aplicável apenas a dados sensíveis</p>
        )}
      </div>
    </Reveal>
  );
}

export default function Reference() {
  const { atividades } = useStore();
  const [q, setQ] = useState("");
  const [filtro, setFiltro] = useState<"todas" | "art7" | "art11">("todas");

  const usos = useMemo(() => {
    const m = new Map<string, number>();
    atividades.forEach((a) => m.set(a.baseLegalId, (m.get(a.baseLegalId) ?? 0) + 1));
    return m;
  }, [atividades]);

  const max = Math.max(1, ...[...usos.values()]);
  const todas = [...BASES_ART7, ...BASES_ART11];
  const filtradas = todas.filter((b) => (filtro === "todas" || b.artigo === filtro) && (q.trim() === "" || (b.titulo + b.descricao + b.inciso).toLowerCase().includes(q.trim().toLowerCase())));
  const emUso = todas.filter((b) => (usos.get(b.id) ?? 0) > 0).length;
  const semUso = todas.filter((b) => !(usos.get(b.id) ?? 0));

  return (
    <div>
      <Cabecalho
        kicker="Fundamentação legal · Lei 13.709/2018"
        titulo="Bases legais do tratamento"
        desc={`As 18 hipóteses de licitude — 10 para dados pessoais (art. 7º) e 8 para sensíveis (art. 11). ${emUso} bases em uso no seu mapa; ${semUso.length} ainda não utilizadas.`}
      />

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <div className="relative min-w-[220px] flex-1">
          <Ic name="search" size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar base legal…" className={`${inputCls} pl-9`} />
        </div>
        <div className="flex gap-1.5">
          {([["todas", "Todas (18)"], ["art7", "Art. 7º (10)"], ["art11", "Art. 11 (8)"]] as const).map(([v, l]) => (
            <button key={v} onClick={() => setFiltro(v)} className={`rounded-full border px-3.5 py-1.5 text-[12px] font-bold transition ${filtro === v ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
        {filtradas.map((b, i) => (
          <CartaoBase key={b.id} b={b} usos={usos.get(b.id) ?? 0} max={max} i={i} />
        ))}
      </div>

      <Reveal>
        <div className="mt-6 rounded-lg border border-pine-line bg-pine p-5 text-cream rail-texture">
          <div className="flex flex-wrap items-start gap-4">
            <span className="grid size-10 shrink-0 place-items-center rounded-md bg-lime text-pine"><Ic name="scale" size={20} /></span>
            <div className="min-w-0 flex-1">
              <h3 className="font-display text-[16px] font-bold">Como escolher a base correta?</h3>
              <ul className="mt-2 grid gap-1.5 text-[12.5px] leading-relaxed text-cream/75 sm:grid-cols-2">
                <li className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-lime" />Consentimento é exceção, não regra — prefira bases objetivas quando houver previsão legal ou contrato.</li>
                <li className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-lime" />Legítimo interesse exige teste de ponderação (LIA) documentado antes do tratamento.</li>
                <li className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-lime" />Dado sensível nunca se apoia no art. 7º — verifique sempre o art. 11.</li>
                <li className="flex gap-2"><span className="mt-[7px] size-1 shrink-0 rounded-full bg-lime" />Uma base por finalidade: finalidades distintas pedem bases distintas.</li>
              </ul>
            </div>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
