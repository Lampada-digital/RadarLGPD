import { useMemo } from "react";
import { useStore } from "../store";
import { CATEGORIAS_DADOS, fmtData, TODAS_BASES, zonaRisco, ZONA_META } from "../types";
import { BASES_ART6, DADOS_GDPR, TODAS_BASES_GDPR } from "../gdpr";
import { FRAMEWORKS, progressoFramework } from "../frameworks";
import { nivelMaturidade } from "../aiExtra";
import { baixarBlob } from "../pdf";
import { Cabecalho, Ic, Reveal } from "./ui";

function baixar(nome: string, conteudo: string, tipo: string) {
  const blob = new Blob([conteudo], { type: tipo });
  baixarBlob(nome, blob);
}

const RISCO_GDPR = { 1: "Baixo", 2: "Médio", 3: "Alto" } as const;

export default function Reports() {
  const { atividades, solicitacoes, gdprAtividades, iso, score, reset, registrar, toast } = useStore();

  const resumoLgpd = useMemo(() => {
    const dados = new Set(atividades.flatMap((a) => a.dados));
    const sensiveis = [...dados].filter((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.sensivel);
    const alto = atividades.filter((a) => ["alto", "critico"].includes(zonaRisco(a.probabilidade * a.impacto)));
    const bases = new Map<string, number>();
    atividades.forEach((a) => bases.set(a.baseLegalId, (bases.get(a.baseLegalId) ?? 0) + 1));
    const principal = [...bases.entries()].sort((a, b) => b[1] - a[1])[0];
    return { dados: dados.size, sensiveis: sensiveis.length, alto: alto.length, principal };
  }, [atividades]);

  const isoRows = useMemo(
    () => FRAMEWORKS.map((fw) => ({ fw, p: progressoFramework(fw, iso) })),
    [iso]
  );

  const exportarJSON = () => {
    baixar(`radargrc-completo-${Date.now()}.json`, JSON.stringify({ geradoEm: new Date().toISOString(), indiceMaturidadeLGPD: score, lgpd: { atividades, solicitacoes }, gdpr: { atividades: gdprAtividades }, iso }, null, 2), "application/json");
    registrar("sistema", "Relatório completo exportado em JSON.");
    toast("Relatório completo exportado (LGPD + GDPR + ISO).");
  };

  const exportarCsvLgpd = () => {
    const cab = ["Atividade", "Area", "Responsavel", "Finalidade", "Base legal", "Titulares", "Categorias", "Retencao", "Compartilhamento", "Transferencia", "Probabilidade", "Impacto", "Risco", "Criado em"];
    const lin = atividades.map((a) =>
      [a.nome, a.area, a.responsavel, a.finalidade, TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso ?? "", a.sujeitos.join("; "),
        a.dados.map((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d).join("; "), a.retencao, a.compartilhamento.join("; "),
        a.transferenciaInternacional ? "Sim" : "Nao", a.probabilidade, a.impacto, a.probabilidade * a.impacto, fmtData(a.criadoEm)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    baixar(`ropa-lgpd-${Date.now()}.csv`, "\uFEFF" + [cab.join(","), ...lin].join("\n"), "text/csv;charset=utf-8");
    registrar("sistema", "RoPA LGPD exportado em CSV.");
    toast("RoPA LGPD exportado em CSV.");
  };

  const exportarCsvGdpr = () => {
    const cab = ["Operacao", "Departamento", "Finalidades", "Base Art.6", "Condicao Art.9", "Titulares", "Categorias", "Retencao", "Destinatarios", "Transferencia fora EEE", "Mecanismo", "Risco", "Criado em"];
    const lin = gdprAtividades.map((a) =>
      [a.nome, a.departamento, a.finalidades, TODAS_BASES_GDPR.find((b) => b.id === a.baseArt6)?.ref ?? "", a.baseArt9 ? TODAS_BASES_GDPR.find((b) => b.id === a.baseArt9)?.ref ?? "" : "",
        a.titulares.join("; "), a.dados.map((d) => DADOS_GDPR.find((x) => x.id === d)?.label ?? d).join("; "), a.retencao, a.destinatarios.join("; "),
        a.transferencia ? "Sim" : "Nao", a.mecanismoTransferencia ?? "", RISCO_GDPR[a.risco], fmtData(a.criadoEm)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")
    );
    baixar(`ropa-gdpr-art30-${Date.now()}.csv`, "\uFEFF" + [cab.join(","), ...lin].join("\n"), "text/csv;charset=utf-8");
    registrar("sistema", "ROPA GDPR (Art. 30) exportado em CSV.");
    toast("ROPA GDPR exportado em CSV.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Prestação de contas · Art. 37 LGPD · Art. 30 GDPR · Cl. 10 ISO"
        titulo="Relatórios e exportações"
        desc="Documentos formais dos dois registros de tratamento e do estado dos 7 programas ISO — prontos para auditoria, ANPD, autoridade europeia ou conselho."
        acao={
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98] print:hidden">
            <Ic name="printer" size={14} /> Imprimir / PDF
          </button>
        }
      />

      <Reveal>
        <div className="mb-5 grid gap-3 print:hidden sm:grid-cols-3">
          {[
            { t: "JSON completo", d: "LGPD + GDPR + ISO em um único arquivo estruturado.", acao: exportarJSON },
            { t: "CSV — RoPA LGPD", d: "Registro do art. 37 tabular (BOM UTF-8, abre no Excel).", acao: exportarCsvLgpd },
            { t: "CSV — ROPA GDPR", d: "Registro do Art. 30 com bases, mecanismos e risco.", acao: exportarCsvGdpr },
          ].map((e) => (
            <button key={e.t} onClick={e.acao} className="group rounded-lg border border-sand bg-cream p-4 text-left transition hover:-translate-y-0.5 hover:border-moss/50 hover:shadow-[0_12px_28px_-16px_rgba(19,46,38,0.4)]">
              <div className="flex items-center justify-between">
                <span className="grid size-8 place-items-center rounded-md bg-paper-deep text-moss transition group-hover:bg-pine group-hover:text-lime"><Ic name="download" size={15} /></span>
                <Ic name="arrow" size={14} className="text-sand transition group-hover:translate-x-1 group-hover:text-moss" />
              </div>
              <p className="font-display mt-2.5 text-[14.5px] font-bold text-ink">{e.t}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{e.d}</p>
            </button>
          ))}
        </div>
      </Reveal>

      {/* LGPD */}
      <Reveal>
        <div className="overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-pine px-6 py-4 text-cream print:bg-cream print:text-ink">
            <p className="text-[10px] font-bold tracking-[0.18em] text-lime uppercase print:text-moss">Seção 1 · Registro LGPD — Art. 37</p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[20px] font-extrabold">Mapeamento de dados pessoais (Brasil)</h2>
              <p className="text-[11.5px] text-cream/70 print:text-ink-soft">Maturidade {score}/100 · {resumoLgpd.dados} categorias · {resumoLgpd.alto} alto risco · base predominante {TODAS_BASES.find((b) => b.id === resumoLgpd.principal?.[0])?.inciso ?? "—"}</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                  <th className="px-4 py-2.5">Atividade</th><th className="px-3 py-2.5">Base legal</th><th className="px-3 py-2.5">Retenção</th><th className="px-3 py-2.5">Risco</th>
                </tr>
              </thead>
              <tbody>
                {atividades.map((a) => {
                  const z = zonaRisco(a.probabilidade * a.impacto);
                  return (
                    <tr key={a.id} className="border-b border-sand/70 align-top last:border-0 hover:bg-paper">
                      <td className="px-4 py-3">
                        <p className="font-display text-[13px] font-bold text-ink">{a.nome}</p>
                        <p className="text-[10.5px] text-ink-faint">{a.area} · {a.dados.map((d) => CATEGORIAS_DADOS.find((c) => c.id === d)?.label ?? d).join(" · ")}</p>
                      </td>
                      <td className="px-3 py-3"><p className="font-bold text-moss">{TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso}</p><p className="text-[10.5px] text-ink-soft">{TODAS_BASES.find((b) => b.id === a.baseLegalId)?.titulo}</p></td>
                      <td className="px-3 py-3 text-[11.5px] text-ink-soft">{a.retencao || "—"}</td>
                      <td className="px-3 py-3"><span className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: ZONA_META[z].bg, color: ZONA_META[z].fg }}><span className="size-1.5 rounded-full" style={{ background: ZONA_META[z].dot }} />{ZONA_META[z].label} · {a.probabilidade * a.impacto}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* GDPR */}
      <Reveal delay={80}>
        <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-[#1f4e8f] px-6 py-4 text-cream print:bg-cream print:text-ink">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#bcd6f5] uppercase print:text-[#1f4e8f]">Seção 2 · ROPA GDPR — Art. 30</p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[20px] font-extrabold">Records of Processing Activities (UE)</h2>
              <p className="text-[11.5px] text-cream/70 print:text-ink-soft">{gdprAtividades.length} operações · {gdprAtividades.filter((a) => a.transferencia).length} com transferência fora do EEE</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                  <th className="px-4 py-2.5">Operação</th><th className="px-3 py-2.5">Bases</th><th className="px-3 py-2.5">Transferência</th><th className="px-3 py-2.5">Risco</th>
                </tr>
              </thead>
              <tbody>
                {gdprAtividades.map((a) => (
                  <tr key={a.id} className="border-b border-sand/70 align-top last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <p className="font-display text-[13px] font-bold text-ink">{a.nome}</p>
                      <p className="text-[10.5px] text-ink-faint">{a.departamento} · {a.dados.map((d) => DADOS_GDPR.find((x) => x.id === d)?.label ?? d).join(" · ")}</p>
                    </td>
                    <td className="px-3 py-3"><p className="font-bold text-[#1f4e8f]">{BASES_ART6.find((b) => b.id === a.baseArt6)?.ref}</p>{a.baseArt9 && <p className="text-[10.5px] text-rust">{TODAS_BASES_GDPR.find((b) => b.id === a.baseArt9)?.ref}</p>}</td>
                    <td className="px-3 py-3 text-[11.5px] text-ink-soft">{a.transferencia ? (a.mecanismoTransferencia ?? "Mecanismo pendente") : "—"}</td>
                    <td className="px-3 py-3"><span className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: a.risco === 3 ? "#ecc6b4" : a.risco === 2 ? "#f0e5bd" : "#dfe9cf", color: a.risco === 3 ? "#8c3013" : a.risco === 2 ? "#7a5f14" : "#3c5a2a" }}>{RISCO_GDPR[a.risco]}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* ISO */}
      <Reveal delay={120}>
        <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-paper px-6 py-4">
            <p className="text-[10px] font-bold tracking-[0.18em] text-moss uppercase">Seção 3 · Programas de implementação ISO</p>
            <h2 className="font-display mt-1 text-[20px] font-extrabold text-ink">Estado dos 7 frameworks</h2>
          </div>
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                <th className="px-4 py-2.5">Framework</th><th className="px-3 py-2.5">Progresso</th><th className="px-3 py-2.5">Conformes</th><th className="px-3 py-2.5">Maturidade</th>
              </tr>
            </thead>
            <tbody>
              {isoRows.map(({ fw, p }) => {
                const nivel = nivelMaturidade(p.pct);
                return (
                  <tr key={fw.id} className="border-b border-sand/70 last:border-0 hover:bg-paper">
                    <td className="px-4 py-3">
                      <p className="font-display text-[13px] font-bold text-ink">{fw.codigo}</p>
                      <p className="text-[10.5px] text-ink-faint">{fw.titulo}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-paper-deep">
                          <div className="h-full rounded-full" style={{ width: `${Math.max(p.pct, 2)}%`, background: fw.cor }} />
                        </div>
                        <span className="font-display text-[12px] font-extrabold" style={{ color: fw.cor }}>{p.pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-ink-soft">{p.porEstado.impl + p.porEstado.verif}/{fw.controles.length}</td>
                    <td className="px-3 py-3"><span className="rounded-md px-2 py-1 text-[10.5px] font-bold" style={{ background: "var(--color-paper-deep)", color: nivel.cor }}>{nivel.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-sand bg-paper px-5 py-3.5">
            <p className="text-[11px] text-ink-faint">Documento gerado pelo Radar GRC · {solicitacoes.length} solicitações no histórico · {new Date().toLocaleDateString("pt-BR")}</p>
            <button onClick={() => { reset(); toast("Dados de demonstração restaurados.", "warn"); }} className="inline-flex items-center gap-1.5 rounded-md border border-sand px-3 py-1.5 text-[11.5px] font-bold text-ink-soft transition hover:border-rust hover:text-rust print:hidden">
              <Ic name="refresh" size={12} /> Restaurar demonstração
            </button>
          </div>
        </div>
      </Reveal>
    </div>
  );
}
