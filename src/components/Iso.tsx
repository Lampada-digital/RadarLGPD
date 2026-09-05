import { useMemo, useState } from "react";
import { useStore } from "../store";
import { useAuth } from "../auth";
import { ESTADOS_META, FRAMEWORKS, progressoFramework } from "../domain";
import type { EstadoIso, Framework } from "../domain";
import { nivelMaturidade, sugerirPlanoIso } from "../ai";
import type { PlanoIso } from "../ai";
import { Cabecalho, Campo, Ic, inputCls, Reveal, Ring, Bloqueado } from "./ui";

const ORDEM_ESTADOS: EstadoIso[] = ["nao", "andamento", "impl", "verif"];

function baixarArquivo(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  URL.revokeObjectURL(url);
}

function gerarPoliticas(fw: Framework): string {
  const linhas = [
    `# Pacote Documental — ${fw.codigo}`,
    `## ${fw.titulo}`,
    "",
    `**Objetivo:** ${fw.objetivo}`,
    "",
    `Documento gerado pelo Radar GRC em ${new Date().toLocaleDateString("pt-BR")}.`,
    "Este pacote reúne as políticas e o estado dos controles para auditoria e certificação.",
    "",
    "---",
    "",
    "## Política do Sistema de Gestão",
    "",
    `A organização estabelece, implementa, mantém e melhora continuamente seu sistema de gestão alinhado à ${fw.codigo}, conforme os controles abaixo.`,
    "",
    "## Estado dos Controles",
    "",
    "| Ref. | Controle | Descrição | Estado |",
    "|------|----------|-----------|--------|",
    ...fw.controles.map((c) => `| ${c.ref} | ${c.titulo} | ${c.desc} | — |`),
    "",
    "---",
    "",
    "## Aprovação",
    "",
    "| Papel | Nome | Assinatura | Data |",
    "|-------|------|-----------|------|",
    "| Alta direção | | | |",
    "| Responsável pelo programa | | | |",
  ];
  return linhas.join("\n");
}

function Hub({ abrir }: { abrir: (id: string) => void }) {
  return (
    <div>
      <Cabecalho
        kicker="Governança · ISO & certificações"
        titulo="Programas de implementação"
        desc="Acompanhe a implementação controle a controle — do SGSI (27001) à privacidade (27701), SOC 2 e PCI-DSS — e gere planos de ação com IA a partir dos gaps reais de cada norma."
      />
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
        {FRAMEWORKS.map((fw, i) => {
          const { iso } = useStore();
          const p = progressoFramework(fw, iso);
          const nivel = nivelMaturidade(p.pct);
          return (
            <Reveal key={fw.id} delay={i * 60}>
              <button onClick={() => abrir(fw.id)} className="group block w-full overflow-hidden rounded-lg border border-sand bg-cream text-left transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_16px_32px_-18px_rgba(19,46,38,0.4)]">
                <span className="block h-1.5 w-full transition-all duration-300 group-hover:h-2.5" style={{ background: fw.cor }} />
                <span className="block p-4">
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-display text-[11px] font-extrabold tracking-[0.1em] uppercase" style={{ color: fw.cor }}>{fw.codigo}</span>
                    <span className="font-display text-[19px] leading-none font-extrabold" style={{ color: fw.cor }}>{p.pct}%</span>
                  </span>
                  <span className="mt-1.5 block text-[14px] leading-snug font-bold text-ink">{fw.titulo}</span>
                  <span className="mt-1 block text-[11px] leading-snug text-ink-soft">{fw.objetivo}</span>
                  <span className="mt-3 block h-1.5 overflow-hidden rounded-full bg-paper-deep">
                    <span className="bar-grow block h-full rounded-full" style={{ width: `${Math.max(p.pct, 2)}%`, background: fw.cor, animationDelay: `${i * 80 + 150}ms` }} />
                  </span>
                  <span className="mt-2 inline-flex items-center gap-1.5 text-[10.5px] font-bold" style={{ color: nivel.cor }}>
                    <span className="size-1.5 rounded-full" style={{ background: nivel.cor }} /> {nivel.label}
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function Detalhe({ fw, voltar }: { fw: Framework; voltar: () => void }) {
  const { iso, setIso, toast, registrar, limites } = useStore();
  const { usuario } = useAuth();
  const [plano, setPlano] = useState<PlanoIso | null>(null);
  const [gerando, setGerando] = useState(false);

  const p = progressoFramework(fw, iso);
  const nivel = nivelMaturidade(p.pct);
  const mapa = iso[fw.id] ?? {};
  const dominioUnico = useMemo(() => [...new Set(fw.controles.map((c) => c.ref.split(".")[0]))], [fw]);

  const gerarPlano = () => {
    if (!limites.ia) {
      toast("O gerador de planos com IA faz parte dos planos Business/Completo.", "warn");
      return;
    }
    setGerando(true);
    setTimeout(() => {
      setPlano(sugerirPlanoIso(fw.id, iso));
      registrar("iso", `Plano de implementação ${fw.codigo} gerado pela IA.`);
      toast(`Plano de implementação ${fw.codigo} gerado com ${sugerirPlanoIso(fw.id, iso).gap.pendentes} pendência(s).`, "ia");
      setGerando(false);
    }, 700);
  };

  const baixarPlano = () => {
    if (!plano) return;
    const md = [
      `# Plano de Implementação — ${fw.codigo}`,
      "",
      `**Gap:** ${plano.gap.conformes}/${plano.gap.total} conformes · ${plano.gap.pendentes} pendências`,
      "",
      ...plano.fases.flatMap((f) => [`## ${f.fase} (${f.prazo})`, "", ...f.acoes.map((a) => `- ${a}`), ""]),
    ].join("\n");
    baixarArquivo(`plano-${fw.id}.md`, md);
    toast("Plano de implementação baixado (.md).");
  };

  const baixarPacote = () => {
    baixarArquivo(`politicas-${fw.id}.md`, gerarPoliticas(fw));
    registrar("iso", `Pacote documental ${fw.codigo} baixado.`);
    toast(`Pacote de políticas ${fw.codigo} baixado — pronto para auditoria.`);
  };

  if (!limites.iso) {
    return (
      <Bloqueado
        titulo="Frameworks ISO & certificações"
        recursos={["ISO 27001, 27002, 27701 com controles reais", "SOC 2 Type II e PCI-DSS v4.0", "Planos de implementação com IA", "Pacote de políticas para auditoria"]}
        onUpgrade={() => window.dispatchEvent(new CustomEvent("radar:abrir-planos"))}
      />
    );
  }

  return (
    <div>
      <button onClick={voltar} className="group mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-moss transition hover:text-pine">
        <Ic name="arrow" size={13} className="rotate-180 transition-transform group-hover:-translate-x-0.5" /> Todos os frameworks
      </button>

      <div className="mb-5 grid gap-4 lg:grid-cols-[300px_1fr]">
        <div className="rounded-xl border border-sand bg-cream p-5">
          <p className="font-display text-[12px] font-extrabold tracking-[0.1em] uppercase" style={{ color: fw.cor }}>{fw.codigo}</p>
          <h1 className="font-display mt-1 text-[20px] leading-tight font-extrabold tracking-tight text-ink">{fw.titulo}</h1>
          <p className="mt-1.5 text-[12px] leading-snug text-ink-soft">{fw.objetivo}</p>
          <div className="mt-4 flex items-center gap-5">
            <div className="relative">
              <Ring value={p.pct} size={116} stroke={9} cor={fw.cor} />
              <div className="absolute inset-0 grid place-items-center">
                <p className="font-display text-[26px] font-extrabold text-ink">{p.pct}%</p>
              </div>
            </div>
            <div className="max-w-[170px]">
              <p className="text-[10px] font-bold tracking-[0.14em] text-ink-faint uppercase">Maturidade</p>
              <p className="font-display mt-1 text-[14px] leading-tight font-bold" style={{ color: nivel.cor }}>{nivel.label}</p>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {ORDEM_ESTADOS.map((e) => (
              <div key={e} className="flex items-center gap-2 rounded-md px-2.5 py-1.5">
                <span className="size-2.5 rounded-sm" style={{ background: ESTADOS_META[e].fg === "#faf8ee" ? "#132e26" : ESTADOS_META[e].fg }} />
                <span className="text-[10.5px] font-semibold text-ink-soft">{ESTADOS_META[e].label} · {p.porEstado[e]}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-2">
            <button onClick={gerarPlano} disabled={gerando} className="inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98] disabled:opacity-70">
              {gerando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-lime/30 border-t-lime" /> : <Ic name="spark" size={14} sw={2.2} />}
              {gerando ? "Gerando com IA…" : "Gerar plano com IA"}
            </button>
            <button onClick={baixarPacote} className="inline-flex items-center justify-center gap-2 rounded-md border border-sand px-4 py-2.5 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
              <Ic name="download" size={14} /> Baixar pacote de políticas
            </button>
          </div>
        </div>

        <div>
          {plano && (
            <div className="anim-pop mb-4 rounded-xl border border-lime/50 bg-lime-soft/30 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-display flex items-center gap-2 text-[15px] font-extrabold text-ink"><Ic name="spark" size={15} sw={2.2} className="text-moss" /> Plano de implementação (IA)</p>
                <button onClick={baixarPlano} className="inline-flex items-center gap-1.5 rounded-md bg-pine px-3 py-1.5 text-[11.5px] font-bold text-lime transition hover:bg-pine-deep">
                  <Ic name="download" size={12} /> Baixar .md
                </button>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {plano.fases.map((f) => (
                  <div key={f.fase} className="rounded-lg border border-sand bg-cream p-3.5">
                    <p className="text-[11px] font-extrabold tracking-wide text-moss uppercase">{f.fase}</p>
                    <p className="text-[10px] font-semibold text-ink-faint">{f.prazo}</p>
                    <ul className="mt-2 space-y-1.5">
                      {f.acoes.map((a) => (
                        <li key={a} className="flex items-start gap-2 text-[11.5px] leading-snug text-ink-soft">
                          <span className="mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-full bg-moss/12 text-moss"><Ic name="check" size={8} sw={3.4} /></span>
                          {a}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            {fw.controles.map((c) => {
              const st = mapa[c.id];
              const estado: EstadoIso = st?.estado ?? "nao";
              return (
                <Reveal key={c.id}>
                  <div className="rounded-lg border border-sand bg-cream p-4 transition hover:border-ink/20">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-display shrink-0 rounded-md px-2 py-1 text-[11px] font-extrabold" style={{ background: `${fw.cor}1a`, color: fw.cor }}>{c.ref}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-[13.5px] leading-snug font-bold text-ink">{c.titulo}</p>
                        <p className="text-[11px] text-ink-faint">{c.desc}</p>
                      </div>
                      <div className="flex gap-1">
                        {ORDEM_ESTADOS.map((e) => (
                          <button
                            key={e}
                            onClick={() => {
                              setIso(fw.id, c.id, { estado: e });
                              toast(`Controle ${c.ref} → ${ESTADOS_META[e].label}. Maturidade recalculada.`, e === "verif" ? "ok" : "warn");
                            }}
                            title={ESTADOS_META[e].label}
                            className={`rounded-md border px-2 py-1 text-[10px] font-extrabold uppercase transition active:scale-95 ${estado === e ? "border-ink shadow-sm" : "border-sand hover:border-ink/40"}`}
                            style={{ background: estado === e ? ESTADOS_META[e].bg : undefined, color: estado === e ? ESTADOS_META[e].fg : "var(--color-ink-faint)" }}
                          >
                            {e === "nao" ? "—" : e === "andamento" ? "And." : e === "impl" ? "Impl." : "Verif."}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap items-center gap-2">
                      <input
                        defaultValue={st?.nota ?? ""}
                        key={st?.nota ?? ""}
                        placeholder="Nota / evidência…"
                        onBlur={(e) => {
                          if ((st?.nota ?? "") !== e.target.value) {
                            setIso(fw.id, c.id, { nota: e.target.value });
                            toast("Evidência registrada no controle.");
                          }
                        }}
                        className="flex-1 rounded-md border border-sand bg-paper px-2.5 py-1.5 text-[11.5px] text-ink outline-none placeholder:text-ink-faint focus:border-moss"
                      />
                      <span className="text-[10px] font-semibold text-ink-faint">{dominioUnico.length} domínios · atualizado {st?.ts ?? "—"}</span>
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Iso({ onUpgrade }: { onUpgrade?: () => void }) {
  const { limites } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  const fw = FRAMEWORKS.find((f) => f.id === sel);

  if (!limites.iso) {
    return (
      <Bloqueado
        titulo="Frameworks ISO & certificações"
        recursos={["ISO 27001, 27002, 27701 com controles reais", "SOC 2 Type II e PCI-DSS v4.0", "Planos de implementação com IA", "Pacote de políticas para auditoria"]}
        onUpgrade={onUpgrade ?? (() => {})}
      />
    );
  }

  return fw ? <Detalhe fw={fw} voltar={() => setSel(null)} /> : <Hub abrir={setSel} />;
}
