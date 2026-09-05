import { useStore } from "../store";
import {
  CATEGORIAS_DADOS, TODAS_BASES, fmtData, zonaRisco, ZONA_META,
  BASES_ART6, BASES_ART9, DADOS_GDPR, FRAMEWORKS, progressoFramework,
} from "../domain";
import { baixarArquivo } from "../pdf";
import { Cabecalho, Ic, Reveal } from "./ui";

const labelDado = (id: string) => CATEGORIAS_DADOS.find((c) => c.id === id)?.label ?? id;
const labelDadoGdpr = (id: string) => DADOS_GDPR.find((c) => c.id === id)?.label ?? id;

export default function Reports() {
  const { atividades, gdprAtividades, iso, solicitacoes, score, registrar, toast, reset } = useStore();

  const exportarJSON = () => {
    const payload = {
      geradoEm: new Date().toISOString(),
      indiceMaturidadeLGPD: score,
      lgpd: { atividades, solicitacoes },
      gdpr: { atividades: gdprAtividades },
      iso,
    };
    baixarArquivo(`radargrc-completo-${Date.now()}.json`, JSON.stringify(payload, null, 2), "application/json;charset=utf-8");
    registrar("sistema", "Relatório completo exportado em JSON.");
    toast("Relatório completo exportado (LGPD + GDPR + ISO).");
  };

  const csv = (linhas: string[][]) => "\uFEFF" + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");

  const exportarCsvLgpd = () => {
    const cab = ["Atividade", "Área", "Responsável", "Finalidade", "Base legal", "Titulares", "Categorias", "Retenção", "Risco", "Criado em"];
    const lin = atividades.map((a) => [
      a.nome, a.area, a.responsavel, a.finalidade,
      TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso ?? a.baseLegalId,
      a.sujeitos.join("; "), a.dados.map(labelDado).join("; "), a.retencao,
      String(a.probabilidade * a.impacto), fmtData(a.criadoEm),
    ]);
    baixarArquivo(`ropa-lgpd-${Date.now()}.csv`, csv([cab, ...lin]), "text/csv;charset=utf-8");
    registrar("sistema", "RoPA LGPD exportado em CSV.");
    toast("RoPA LGPD exportado em CSV.");
  };

  const exportarCsvGdpr = () => {
    const cab = ["Operação", "Departamento", "Finalidades", "Base Art. 6", "Titulares", "Categorias", "Retenção", "Risco", "Criado em"];
    const lin = gdprAtividades.map((a) => [
      a.nome, a.departamento, a.finalidades,
      BASES_ART6.find((b) => b.id === a.baseArt6)?.ref ?? a.baseArt6,
      a.titulares.join("; "), a.dados.map(labelDadoGdpr).join("; "), a.retencao,
      a.risco === 3 ? "Alto" : a.risco === 2 ? "Médio" : "Baixo", fmtData(a.criadoEm),
    ]);
    baixarArquivo(`ropa-gdpr-art30-${Date.now()}.csv`, csv([cab, ...lin]), "text/csv;charset=utf-8");
    registrar("sistema", "ROPA GDPR exportado em CSV.");
    toast("ROPA GDPR exportado em CSV.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Prestação de contas · Art. 37 LGPD · Art. 30 GDPR"
        titulo="Relatórios & exportações"
        desc="Documentos formais dos registros de tratamento e do estado dos frameworks — prontos para auditoria, ANPD, autoridade europeia ou conselho."
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
            { t: "CSV — RoPA LGPD", d: "Registro do art. 37 tabular (abre no Excel).", acao: exportarCsvLgpd },
            { t: "CSV — ROPA GDPR", d: "Registro do Art. 30 com bases e risco.", acao: exportarCsvGdpr },
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

      <Reveal>
        <div className="overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-pine px-6 py-4 text-cream print:bg-cream print:text-ink">
            <p className="text-[10px] font-bold tracking-[0.18em] text-lime uppercase print:text-moss">Seção 1 · Registro LGPD — Art. 37</p>
            <div className="mt-1 flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-[20px] font-extrabold">Mapeamento de dados pessoais (Brasil)</h2>
              <p className="text-[11.5px] text-cream/70 print:text-ink-soft">Maturidade {score}/100 · {atividades.length} atividades</p>
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
                        <p className="text-[10.5px] text-ink-faint">{a.area} · {a.dados.map(labelDado).join(" · ")}</p>
                      </td>
                      <td className="px-3 py-3"><p className="font-bold text-moss">{TODAS_BASES.find((b) => b.id === a.baseLegalId)?.inciso}</p></td>
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

      <Reveal delay={80}>
        <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-[#1f4e8f] px-6 py-4 text-cream print:bg-cream print:text-ink">
            <p className="text-[10px] font-bold tracking-[0.18em] text-[#bcd6f5] uppercase print:text-[#1f4e8f]">Seção 2 · ROPA GDPR — Art. 30</p>
            <h2 className="font-display mt-1 text-[20px] font-extrabold">Records of Processing Activities (UE)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                  <th className="px-4 py-2.5">Operação</th><th className="px-3 py-2.5">Base Art. 6</th><th className="px-3 py-2.5">Art. 9</th><th className="px-3 py-2.5">Risco</th>
                </tr>
              </thead>
              <tbody>
                {gdprAtividades.map((a) => (
                  <tr key={a.id} className="border-b border-sand/70 align-top last:border-0 hover:bg-paper">
                    <td className="px-4 py-3"><p className="font-display text-[13px] font-bold text-ink">{a.nome}</p><p className="text-[10.5px] text-ink-faint">{a.departamento}</p></td>
                    <td className="px-3 py-3 font-bold text-[#1f4e8f]">{BASES_ART6.find((b) => b.id === a.baseArt6)?.ref ?? "—"}</td>
                    <td className="px-3 py-3 text-[11.5px] text-rust">{a.baseArt9 ? BASES_ART9.find((b) => b.id === a.baseArt9)?.ref ?? a.baseArt9 : "—"}</td>
                    <td className="px-3 py-3"><span className="rounded-md px-2 py-1 text-[11px] font-bold" style={{ background: a.risco === 3 ? "#ecc6b4" : a.risco === 2 ? "#f0e5bd" : "#dfe9cf", color: a.risco === 3 ? "#8c3013" : a.risco === 2 ? "#7a5f14" : "#3c5a2a" }}>{a.risco === 3 ? "Alto" : a.risco === 2 ? "Médio" : "Baixo"}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-4 overflow-hidden rounded-xl border border-sand bg-cream print:rounded-none print:border-0">
          <div className="border-b border-sand bg-paper px-6 py-4">
            <p className="text-[10px] font-bold tracking-[0.18em] text-moss uppercase">Seção 3 · Frameworks & certificações</p>
            <h2 className="font-display mt-1 text-[20px] font-extrabold text-ink">Estado da implementação</h2>
          </div>
          <table className="w-full text-left text-[12px]">
            <thead>
              <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                <th className="px-4 py-2.5">Framework</th><th className="px-3 py-2.5">Progresso</th><th className="px-3 py-2.5">Conformes</th>
              </tr>
            </thead>
            <tbody>
              {FRAMEWORKS.map((fw) => {
                const p = progressoFramework(fw, iso);
                return (
                  <tr key={fw.id} className="border-b border-sand/70 last:border-0 hover:bg-paper">
                    <td className="px-4 py-3"><p className="font-display text-[13px] font-bold text-ink">{fw.codigo}</p><p className="text-[10.5px] text-ink-faint">{fw.titulo}</p></td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-28 overflow-hidden rounded-full bg-paper-deep"><div className="h-full rounded-full" style={{ width: `${Math.max(p.pct, 2)}%`, background: fw.cor }} /></div>
                        <span className="font-display text-[12px] font-extrabold" style={{ color: fw.cor }}>{p.pct}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[11.5px] text-ink-soft">{p.porEstado.impl + p.porEstado.verif}/{fw.controles.length}</td>
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
