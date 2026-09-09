import { useState } from "react";
import { useStore } from "../store";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   Privacy by Design — checklist e avaliação de privacidade incorporada
   no ciclo de vida de produtos e sistemas.
   ===================================================================== */

interface Projeto {
  id: string;
  nome: string;
  descricao: string;
  fase: "concepcao" | "desenvolvimento" | "implantacao" | "operacao";
  principios: Record<string, boolean>;
  dataCriacao: string;
}

const PRINCIPIOS = [
  { id: "p1", label: "Proativo, não reativo; preventivo, não corretivo", desc: "Antecipe e previna eventos de privacidade invasivos antes que aconteçam." },
  { id: "p2", label: "Privacidade como configuração padrão", desc: "Garanta que as configurações padrão protejam a privacidade automaticamente." },
  { id: "p3", label: "Privacidade incorporada no design", desc: "Integre a privacidade na arquitetura e nas operações do sistema." },
  { id: "p4", label: "Funcionalidade total — soma positiva, não soma zero", desc: "Evite falsos trade-offs entre privacidade e funcionalidade." },
  { id: "p5", label: "Segurança de ponta a ponta — ciclo de vida completo", desc: "Garanta segurança desde a coleta até a destruição dos dados." },
  { id: "p6", label: "Visibilidade e transparência", desc: "Mantenha práticas de privacidade visíveis e verificáveis." },
  { id: "p7", label: "Respeito pela privacidade do usuário", desc: "Mantenha os interesses do usuário no centro das decisões." },
];

const SEED_PROJETOS: Projeto[] = [
  { id: "prj1", nome: "Novo portal do cliente", descricao: "Redesign do portal com novas funcionalidades de autoatendimento.", fase: "desenvolvimento", principios: { p1: true, p2: true, p3: true, p4: true, p5: false, p6: false, p7: false }, dataCriacao: "2026-01-10" },
  { id: "prj2", nome: "App mobile de vendas", descricao: "Aplicativo mobile para equipe de vendas com acesso a dados de clientes.", fase: "concepcao", principios: { p1: false, p2: false, p3: false, p4: false, p5: false, p6: false, p7: false }, dataCriacao: "2026-01-15" },
  { id: "prj3", nome: "Sistema de BI e analytics", descricao: "Plataforma de business intelligence com dados agregados de clientes.", fase: "implantacao", principios: { p1: true, p2: true, p3: true, p4: true, p5: true, p6: true, p7: false }, dataCriacao: "2025-12-20" },
];

const FASES = [
  { id: "concepcao", label: "Concepção", cor: "#1f4e8f" },
  { id: "desenvolvimento", label: "Desenvolvimento", cor: "#c98a1f" },
  { id: "implantacao", label: "Implantação", cor: "#2e6b54" },
  { id: "operacao", label: "Operação", cor: "#7a4f8f" },
];

export default function PrivacyByDesign() {
  const { toast, registrar } = useStore();
  const [projetos, setProjetos] = useState<Projeto[]>(SEED_PROJETOS);
  const [novo, setNovo] = useState(false);
  const [form, setForm] = useState({ nome: "", descricao: "", fase: "concepcao" as Projeto["fase"] });

  const stats = {
    total: projetos.length,
    concepcao: projetos.filter((p) => p.fase === "concepcao").length,
    desenvolvimento: projetos.filter((p) => p.fase === "desenvolvimento").length,
    operacao: projetos.filter((p) => p.fase === "operacao" || p.fase === "implantacao").length,
  };

  const criar = () => {
    if (!form.nome.trim()) {
      toast("Informe o nome do projeto.", "warn");
      return;
    }
    const projeto: Projeto = {
      id: `prj-${Date.now()}`,
      nome: form.nome,
      descricao: form.descricao,
      fase: form.fase,
      principios: Object.fromEntries(PRINCIPIOS.map((p) => [p.id, false])),
      dataCriacao: new Date().toISOString().slice(0, 10),
    };
    setProjetos((l) => [projeto, ...l]);
    registrar("privacy", `Projeto "${form.nome}" criado com Privacy by Design.`);
    toast("Projeto criado. Avalie os princípios de privacidade.");
    setNovo(false);
    setForm({ nome: "", descricao: "", fase: "concepcao" });
  };

  const togglePrincipio = (projetoId: string, principioId: string) => {
    setProjetos((l) => l.map((p) => {
      if (p.id !== projetoId) return p;
      const principios = { ...p.principios, [principioId]: !p.principios[principioId] };
      const total = PRINCIPIOS.length;
      const atendidos = Object.values(principios).filter(Boolean).length;
      if (atendidos === total && !p.principios[principioId]) {
        registrar("privacy", `Projeto "${p.nome}" atende a todos os princípios de Privacy by Design.`);
        toast("Projeto atende a todos os princípios de Privacy by Design!", "ok");
      }
      return { ...p, principios };
    }));
  };

  return (
    <div>
      <Cabecalho
        kicker="Privacidade · incorporada desde a concepção"
        titulo="Privacy by Design"
        desc="Avalie e garanta que os 7 princípios fundamentais de privacidade estejam incorporados no ciclo de vida de produtos e sistemas."
        acao={
          <button onClick={() => setNovo(true)} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Novo projeto
          </button>
        }
      />

      <Reveal>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Projetos", v: stats.total, cor: "text-ink" },
            { l: "Em concepção", v: stats.concepcao, cor: "text-[#1f4e8f]" },
            { l: "Em desenvolvimento", v: stats.desenvolvimento, cor: "text-amber" },
            { l: "Em operação", v: stats.operacao, cor: "text-moss" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-sand bg-cream p-4">
              <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <p className={`font-display mt-2 text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="rounded-lg border border-pine-line bg-pine p-5 text-cream">
          <h2 className="font-display mb-4 text-[16px] font-extrabold">Os 7 princípios fundamentais</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {PRINCIPIOS.map((p, i) => (
              <div key={p.id} className="rounded-md border border-pine-line bg-pine-deep/70 p-4">
                <div className="flex items-start gap-3">
                  <span className="font-display grid size-8 shrink-0 place-items-center rounded-full border-2 border-lime text-lime">{i + 1}</span>
                  <div>
                    <p className="text-[13px] font-bold text-cream">{p.label}</p>
                    <p className="mt-1 text-[11px] leading-snug text-cream/60">{p.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-4 space-y-3">
          {projetos.map((p) => {
            const atendidos = Object.values(p.principios).filter(Boolean).length;
            const pct = Math.round((atendidos / PRINCIPIOS.length) * 100);
            const fase = FASES.find((f) => f.id === p.fase)!;
            return (
              <div key={p.id} className="rounded-lg border border-sand bg-cream p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-display text-[16px] font-bold text-ink">{p.nome}</p>
                    <p className="mt-0.5 text-[12px] text-ink-soft">{p.descricao}</p>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      <span className="rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase" style={{ background: `${fase.cor}1a`, color: fase.cor }}>{fase.label}</span>
                      <span className="text-[10.5px] text-ink-faint">Criado em {p.dataCriacao}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[24px] font-extrabold" style={{ color: pct === 100 ? "var(--color-moss)" : pct >= 50 ? "var(--color-amber)" : "var(--color-rust)" }}>{pct}%</p>
                    <p className="text-[10px] text-ink-faint">{atendidos}/{PRINCIPIOS.length} princípios</p>
                  </div>
                </div>
                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {PRINCIPIOS.map((pr) => (
                    <button
                      key={pr.id}
                      onClick={() => togglePrincipio(p.id, pr.id)}
                      className={`flex items-start gap-2.5 rounded-md border p-2.5 text-left transition ${p.principios[pr.id] ? "border-moss bg-moss/8" : "border-sand bg-paper hover:border-moss/50"}`}
                    >
                      <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-sm border transition ${p.principios[pr.id] ? "border-moss bg-moss text-cream" : "border-sand bg-cream"}`}>
                        {p.principios[pr.id] && <Ic name="check" size={10} sw={3} />}
                      </span>
                      <span className="text-[11px] leading-snug text-ink-soft">{pr.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Reveal>

      {novo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-pine-deep/60 p-4" onClick={() => setNovo(false)}>
          <div className="anim-pop w-full max-w-lg rounded-lg border border-sand bg-cream p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-display mb-4 text-[18px] font-bold text-ink">Novo projeto</h3>
            <div className="space-y-3">
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Nome do projeto</span>
                <input className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} placeholder="Ex.: Novo portal do cliente" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Descrição</span>
                <textarea className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} placeholder="Descreva o projeto e seus objetivos…" />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">Fase atual</span>
                <select className="w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13px] text-ink outline-none focus:border-moss" value={form.fase} onChange={(e) => setForm({ ...form, fase: e.target.value as Projeto["fase"] })}>
                  {FASES.map((f) => <option key={f.id} value={f.id}>{f.label}</option>)}
                </select>
              </label>
            </div>
            <div className="mt-5 flex justify-end gap-2">
              <button onClick={() => setNovo(false)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={criar} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={14} sw={2.6} /> Criar projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
