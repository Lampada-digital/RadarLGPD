import { useMemo, useState } from "react";
import { useStore } from "../store";
import { BASES_ART6, BASES_ART9, MECANISMOS_TRANSFERENCIA } from "../domain";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   GDPR avançado — bases legais (Art. 6/9/10), DPIA (WP248) e
   transferências internacionais (Capítulo V).
   ===================================================================== */

const CRITERIOS_DPIA = [
  { id: "d1", label: "Avaliação ou pontuação sistemática (perfil, scoring)", ref: "Art. 35(3)(a)" },
  { id: "d2", label: "Decisões automatizadas com efeito jurídico ou significativo", ref: "Art. 22" },
  { id: "d3", label: "Monitorização sistemática de área acessível ao público", ref: "Art. 35(3)(c)" },
  { id: "d4", label: "Categorias especiais (Art. 9) ou dados penais (Art. 10)", ref: "WP248" },
  { id: "d5", label: "Dados tratados em grande escala (large scale)", ref: "WP248" },
  { id: "d6", label: "Correspondência ou combinação de conjuntos de dados", ref: "WP248" },
  { id: "d7", label: "Titulares vulneráveis (crianças, empregados, pacientes)", ref: "WP248" },
  { id: "d8", label: "Uso inovador ou novas soluções tecnológicas (IA, IoT)", ref: "WP248" },
  { id: "d9", label: "Impede o exercício de um direito ou uso de serviço/contrato", ref: "WP248" },
];

const SEED_TRANSFERENCIAS = [
  { id: "t1", destino: "Estados Unidos", destinatario: "Mailchimp — CRM", mecanismo: MECANISMOS_TRANSFERENCIA[1], status: "vigente" as const },
  { id: "t2", destino: "Índia", destinatario: "Suporte técnico 24/7", mecanismo: MECANISMOS_TRANSFERENCIA[1], status: "em_revisao" as const },
];

export default function GdprAvancado() {
  const { gdprAtividades } = useStore();
  const [aba, setAba] = useState<"bases" | "dpia" | "transf">("bases");
  const [dpia, setDpia] = useState<Record<string, boolean>>({});
  const [transfs] = useState(SEED_TRANSFERENCIAS);

  const conta = (id: string) => gdprAtividades.filter((a) => a.baseArt6 === id || a.baseArt9 === id).length;

  const marcados = useMemo(() => Object.values(dpia).filter(Boolean).length, [dpia]);
  const obrigatoria = marcados >= 2;

  const STATUS: Record<string, { label: string; cls: string }> = {
    vigente: { label: "Vigente", cls: "bg-moss/12 text-moss" },
    em_revisao: { label: "Em revisão", cls: "bg-amber-soft text-ink" },
    pendente: { label: "Pendente", cls: "bg-rust-soft text-rust" },
  };

  return (
    <div>
      <Cabecalho
        kicker="GDPR · Regulamento (UE) 2016/679"
        titulo="GDPR avançado — bases, DPIA e transferências"
        desc="As bases de licitude do Art. 6 e condições do Art. 9/10, a avaliação de impacto (DPIA) pelos critérios do EDPB e as transferências internacionais do Capítulo V."
      />

      <div className="mb-5 flex flex-wrap gap-2">
        {([
          { id: "bases", l: "Bases legais (Art. 6/9)" },
          { id: "dpia", l: "DPIA — Art. 35 (WP248)" },
          { id: "transf", l: "Transferências (Cap. V)" },
        ] as const).map((t) => (
          <button
            key={t.id}
            onClick={() => setAba(t.id)}
            className={`rounded-md border px-4 py-2 text-[12.5px] font-bold transition ${aba === t.id ? "border-[#1f4e8f] bg-[#1f4e8f] text-cream shadow-sm" : "border-sand bg-cream text-ink-soft hover:border-[#1f4e8f]/50"}`}
          >
            {t.l}
          </button>
        ))}
      </div>

      {aba === "bases" && (
        <div className="space-y-6">
          <Reveal>
            <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-[#1f4e8f] uppercase">Art. 6 — bases de licitude</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BASES_ART6.map((b, i) => {
                const n = conta(b.id);
                return (
                  <Reveal key={b.id} delay={i * 40}>
                    <div className="group h-full rounded-lg border border-sand bg-cream p-4 transition hover:-translate-y-0.5 hover:border-[#1f4e8f]/50 hover:shadow-[0_12px_28px_-16px_rgba(31,78,143,0.45)]">
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-sm bg-[#1f4e8f]/10 px-1.5 py-0.5 text-[10px] font-extrabold text-[#1f4e8f]">{b.ref}</span>
                        {n > 0 && <span className="font-display text-[15px] font-extrabold text-[#1f4e8f]">{n}×</span>}
                      </div>
                      <p className="font-display mt-2 text-[14px] font-bold text-ink">{b.titulo}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">Base de licitude para o tratamento de dados pessoais.</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="mb-2 text-[11px] font-bold tracking-[0.14em] text-rust uppercase">Art. 9 / Art. 10 — categorias especiais</p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {BASES_ART9.map((b, i) => {
                const n = conta(b.id);
                return (
                  <Reveal key={b.id} delay={i * 40}>
                    <div className="h-full rounded-lg border border-rust/25 bg-cream p-4 transition hover:-translate-y-0.5 hover:border-rust/60">
                      <div className="flex items-start justify-between gap-2">
                        <span className="rounded-sm bg-rust/10 px-1.5 py-0.5 text-[10px] font-extrabold text-rust">{b.ref}</span>
                        {n > 0 && <span className="font-display text-[15px] font-extrabold text-rust">{n}×</span>}
                      </div>
                      <p className="font-display mt-2 text-[14px] font-bold text-ink">{b.titulo}</p>
                      <p className="mt-1 text-[11px] leading-relaxed text-ink-soft">Condição para tratar categorias especiais de dados.</p>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </Reveal>
        </div>
      )}

      {aba === "dpia" && (
        <Reveal>
          <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-lg border border-sand bg-cream p-5">
              <h2 className="font-display text-[15px] font-bold text-ink">Critérios de obrigatoriedade (EDPB WP248)</h2>
              <p className="mt-0.5 text-[11.5px] text-ink-soft">Marque os critérios que se aplicam ao tratamento — 2 ou mais indicam DPIA obrigatória.</p>
              <ul className="mt-4 space-y-1.5">
                {CRITERIOS_DPIA.map((cr) => {
                  const on = !!dpia[cr.id];
                  return (
                    <li key={cr.id}>
                      <button onClick={() => setDpia((d) => ({ ...d, [cr.id]: !on }))} className={`flex w-full items-start gap-2.5 rounded-md border px-3 py-2.5 text-left transition ${on ? "border-[#1f4e8f]/50 bg-[#1f4e8f]/6" : "border-sand bg-paper hover:border-[#1f4e8f]/40"}`}>
                        <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-sm border transition ${on ? "border-[#1f4e8f] bg-[#1f4e8f] text-cream" : "border-sand bg-cream"}`}>
                          {on && <Ic name="check" size={10} sw={3} />}
                        </span>
                        <span>
                          <span className={`block text-[12.5px] leading-snug font-semibold ${on ? "text-ink" : "text-ink-soft"}`}>{cr.label}</span>
                          <span className="text-[10px] font-bold tracking-wide text-[#1f4e8f]/70 uppercase">{cr.ref}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="flex flex-col rounded-lg border border-sand bg-cream p-5">
              <p className="text-[10.5px] font-bold tracking-[0.16em] text-ink-faint uppercase">Resultado</p>
              <p className="font-display mt-2 text-[40px] leading-none font-extrabold" style={{ color: obrigatoria ? "var(--color-rust)" : "var(--color-moss)" }}>{marcados}/9</p>
              <p className="font-display mt-1 text-[15px] font-bold" style={{ color: obrigatoria ? "var(--color-rust)" : "var(--color-moss)" }}>{obrigatoria ? "DPIA obrigatória (Art. 35)" : "DPIA não obrigatória"}</p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-ink-soft">
                {obrigatoria
                  ? "2+ critérios atendidos — o EDPB entende que há alto risco. Conduza a DPIA antes de iniciar o tratamento e consulte a autoridade (Art. 36) se o risco residual persistir."
                  : "Menos de 2 critérios — documente a decisão para fins de accountability (Art. 5(2)) e reavalie se o tratamento mudar."}
              </p>
              <div className="mt-auto rounded-md border border-dashed border-sand bg-paper p-3 text-[10.5px] leading-snug text-ink-faint">
                A DPIA deve descrever o tratamento, avaliar necessidade/proporcionalidade, os riscos e as medidas de mitigação.
              </div>
            </div>
          </div>
        </Reveal>
      )}

      {aba === "transf" && (
        <Reveal>
          <div className="grid gap-3 lg:grid-cols-2">
            {transfs.map((t) => (
              <div key={t.id} className="group rounded-lg border border-sand bg-cream p-4 transition hover:-translate-y-0.5 hover:border-[#1f4e8f]/50">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-display flex items-center gap-2 text-[14px] font-bold text-ink"><Ic name="globe" size={15} className="text-[#1f4e8f]" /> {t.destino}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase ${STATUS[t.status].cls}`}>{STATUS[t.status].label}</span>
                </div>
                <p className="mt-1 text-[12px] text-ink-soft">{t.destinatario}</p>
                <p className="mt-2 text-[11px] font-semibold text-[#1f4e8f]">{t.mecanismo}</p>
                <p className="mt-2 text-[10.5px] leading-snug text-ink-faint">Mecanismo do Capítulo V (Art. 45–49) para transferência lícita de dados para fora do EEE.</p>
              </div>
            ))}
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-sand bg-paper/60 p-6 text-center">
              <Ic name="globe" size={26} className="text-sand" />
              <p className="font-display mt-2 text-[14px] font-bold text-ink">Adicione transferências do seu ROPA</p>
              <p className="mt-1 max-w-xs text-[11px] leading-snug text-ink-soft">Operações com <strong>transferência=true</strong> no ROPA (Art. 30) devem ter um mecanismo do Capítulo V documentado.</p>
            </div>
          </div>
        </Reveal>
      )}
    </div>
  );
}
