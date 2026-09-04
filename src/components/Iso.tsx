import { useMemo, useRef, useState } from "react";
import { useStore } from "../store";
import { ESTADOS_META, FRAMEWORKS, progressoFramework } from "../frameworks";
import type { Anexo, ControleEstado, ControleIso, EstadoIso, Framework } from "../frameworks";
import { fmtTamanho } from "../frameworks";
import { nivelMaturidade, sugerirPlanoIso } from "../aiExtra";
import type { PlanoIso } from "../aiExtra";
import { gerarPacotePdf, PDF_ADEQUADO_MIN } from "../isoDocs";
import { baixarBlob } from "../pdf";
import { useAuth } from "../auth";
import { Cabecalho, Campo, Ic, inputCls, Modal, Reveal, Ring } from "./ui";

const ORDEM_ESTADOS: EstadoIso[] = ["nao", "andamento", "impl", "verif"];
const MAX_DOC_BYTES = 350 * 1024; // documentos ficam em base64 no armazenamento local

/* comprime imagens antes de guardar (canvas → JPEG) para caber no storage */
function comprimirImagem(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 1100;
        const escala = Math.min(1, max / Math.max(img.width, img.height));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * escala));
        canvas.height = Math.max(1, Math.round(img.height * escala));
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponível"));
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = () => reject(new Error("Imagem inválida"));
      img.src = String(reader.result);
    };
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

function lerDoc(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Falha ao ler o arquivo"));
    reader.readAsDataURL(file);
  });
}

/* ================= modal de anexos (evidências: documentos e imagens) ================= */

function AnexoModal({
  aberto, onFechar, controle, anexos, onChange,
}: {
  aberto: boolean;
  onFechar: () => void;
  controle: ControleIso | null;
  anexos: Anexo[];
  onChange: (a: Anexo[]) => void;
}) {
  const { toast, registrar } = useStore();
  const [lightbox, setLightbox] = useState<Anexo | null>(null);
  const [carregando, setCarregando] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  if (!controle) return null;

  const adicionar = async (files: FileList | null) => {
    if (!files?.length) return;
    setCarregando(true);
    const novos: Anexo[] = [];
    for (const file of Array.from(files)) {
      const ext = (file.name.split(".").pop() ?? "").toLowerCase();
      try {
        if (file.type.startsWith("image/")) {
          const dataUrl = await comprimirImagem(file);
          novos.push({ id: `an-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, nome: file.name, tipo: "img", ext, tamanho: file.size, dataUrl, ts: new Date().toISOString() });
        } else if (file.size <= MAX_DOC_BYTES) {
          const dataUrl = await lerDoc(file);
          novos.push({ id: `an-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, nome: file.name, tipo: "doc", ext, tamanho: file.size, dataUrl, ts: new Date().toISOString() });
        } else {
          toast(`"${file.name}" é grande demais para o armazenamento local (máx. ${Math.round(MAX_DOC_BYTES / 1024)} KB). Comprima ou registre o link na nota.`, "warn");
        }
      } catch {
        toast(`Não foi possível processar "${file.name}".`, "warn");
      }
    }
    if (novos.length) {
      onChange([...anexos, ...novos]);
      registrar("iso", `Controle ${controle.ref} — ${novos.length} evidência(s) anexada(s) (${novos.map((n) => n.nome).join(", ")}).`);
      toast(`${novos.length} evidência(s) anexada(s) ao controle ${controle.ref}.`);
    }
    setCarregando(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const remover = (id: string) => {
    onChange(anexos.filter((a) => a.id !== id));
    registrar("iso", `Controle ${controle.ref} — evidência removida.`);
  };

  const baixarAnexo = (a: Anexo) => {
    if (!a.dataUrl) {
      toast("Este anexo não tem conteúdo armazenado.", "warn");
      return;
    }
    const link = document.createElement("a");
    link.href = a.dataUrl;
    link.download = a.nome;
    document.body.appendChild(link);
    link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
    setTimeout(() => document.body.removeChild(link), 800);
  };

  return (
    <>
      <Modal aberto={aberto} onFechar={onFechar} titulo={<span>Evidências · <span className="text-moss">{controle.ref}</span> {controle.titulo}</span>} largura="max-w-2xl">
        <div className="space-y-4">
          {/* área de upload */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); void adicionar(e.dataTransfer.files); }}
            className="group flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-sand bg-paper px-4 py-7 text-center transition hover:border-moss hover:bg-moss/6"
          >
            <span className={`grid size-11 place-items-center rounded-full bg-paper-deep text-moss transition group-hover:bg-pine group-hover:text-lime ${carregando ? "animate-pulse" : ""}`}>
              {carregando ? <span className="size-4 animate-spin rounded-full border-2 border-moss/30 border-t-moss" /> : <Ic name="download" size={20} className="rotate-180" />}
            </span>
            <p className="text-[13px] font-bold text-ink">Arraste documentos ou imagens das evidências</p>
            <p className="text-[11px] text-ink-faint">PDF, Word, Excel, CSV, Markdown, TXT (até 350 KB) · imagens são comprimidas automaticamente</p>
            <button
              onClick={() => inputRef.current?.click()}
              disabled={carregando}
              className="mt-1 inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98] disabled:opacity-60"
            >
              <Ic name="plus" size={13} sw={2.6} /> Selecionar arquivos
            </button>
            <input
              ref={inputRef}
              type="file"
              multiple
              accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.csv,.md,.txt"
              className="hidden"
              onChange={(e) => void adicionar(e.target.files)}
            />
          </div>

          {/* lista de anexos */}
          {anexos.length === 0 ? (
            <p className="rounded-md border border-dashed border-sand px-3 py-5 text-center text-[12px] text-ink-faint">
              Nenhuma evidência anexada ainda — fotos, prints, contratos, atas e relatórios fortalecem a auditoria.
            </p>
          ) : (
            <ul className="grid gap-2 sm:grid-cols-2">
              {anexos.map((a) => (
                <li key={a.id} className="anim-pop group flex items-center gap-3 rounded-md border border-sand bg-cream p-2.5 transition hover:border-moss/50">
                  {a.tipo === "img" && a.dataUrl ? (
                    <button onClick={() => setLightbox(a)} className="size-12 shrink-0 overflow-hidden rounded-md border border-sand transition hover:opacity-85" aria-label="Ampliar imagem">
                      <img src={a.dataUrl} alt={a.nome} className="size-12 object-cover" />
                    </button>
                  ) : (
                    <span className="grid size-12 shrink-0 place-items-center rounded-md bg-paper-deep text-moss">
                      <Ic name="doc" size={20} />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[12px] font-bold text-ink" title={a.nome}>{a.nome}</p>
                    <p className="text-[10px] text-ink-faint">
                      {a.ext.toUpperCase() || "ARQ"} · {fmtTamanho(a.tamanho)} · {new Date(a.ts).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {a.dataUrl && (
                      <button onClick={() => baixarAnexo(a)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:text-moss" title="Baixar" aria-label="Baixar anexo">
                        <Ic name="download" size={12} />
                      </button>
                    )}
                    <button onClick={() => remover(a.id)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:bg-rust/10 hover:text-rust" title="Remover" aria-label="Remover anexo">
                      <Ic name="trash" size={12} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="flex items-center gap-1.5 text-[10.5px] text-ink-faint">
            <Ic name="shield" size={11} sw={2.2} className="text-moss" />
            Evidências ficam atreladas ao controle e viajam no pacote PDF de auditoria (metadados).
          </p>
        </div>
      </Modal>

      {/* lightbox */}
      {lightbox?.dataUrl && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-pine-deep/85 p-6 backdrop-blur-sm" onClick={() => setLightbox(null)}>
          <div className="anim-pop relative max-h-full max-w-3xl">
            <img src={lightbox.dataUrl} alt={lightbox.nome} className="max-h-[80vh] rounded-lg border border-cream/20 object-contain shadow-2xl" />
            <p className="mt-2 text-center text-[11.5px] font-semibold text-cream/70">{lightbox.nome} · clique fora para fechar</p>
          </div>
        </div>
      )}
    </>
  );
}

function baixarArquivo(nome: string, conteudo: string) {
  const blob = new Blob([conteudo], { type: "text/markdown;charset=utf-8" });
  baixarBlob(nome, blob);
}

function Hub({ abrir, lista, kicker, titulo, desc }: { abrir: (id: string) => void; lista: Framework[]; kicker: string; titulo: string; desc: string }) {
  const { iso } = useStore();
  return (
    <div>
      <Cabecalho kicker={kicker} titulo={titulo} desc={desc} />
      <div className="grid gap-3.5 sm:grid-cols-2">
        {lista.map((fw, i) => {
          const p = progressoFramework(fw, iso);
          const nivel = nivelMaturidade(p.pct);
          return (
            <Reveal key={fw.id} delay={Math.min(i * 60, 360)}>
              <button
                onClick={() => abrir(fw.id)}
                className="group block w-full overflow-hidden rounded-lg border border-sand bg-cream text-left transition-all duration-200 hover:-translate-y-1 hover:border-ink/25 hover:shadow-[0_18px_36px_-18px_rgba(19,46,38,0.45)]"
              >
                <span className="block h-1.5 w-full transition-all duration-300 group-hover:h-2.5" style={{ background: fw.cor }} />
                <span className="block p-4.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className="rounded-sm px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-cream" style={{ background: fw.cor }}>{fw.codigo}</span>
                    <span className="font-display text-[20px] leading-none font-extrabold" style={{ color: fw.cor }}>{p.pct}%</span>
                  </span>
                  <span className="font-display mt-2.5 block text-[15px] leading-snug font-bold text-ink">{fw.titulo}</span>
                  <span className="mt-1 block text-[11.5px] leading-snug text-ink-soft">{fw.objetivo}</span>
                  <span className="mt-3.5 block h-2 overflow-hidden rounded-full bg-paper-deep">
                    <span className="bar-grow block h-full rounded-full" style={{ width: `${Math.max(p.pct, 2)}%`, background: fw.cor, animationDelay: `${i * 80 + 150}ms` }} />
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-1.5 text-[10.5px] font-bold">
                    <span className="rounded-full bg-moss/12 px-2 py-0.5 text-moss">{p.porEstado.impl + p.porEstado.verif} conformes</span>
                    <span className="rounded-full bg-amber-soft px-2 py-0.5 text-ink">{p.porEstado.andamento} em andamento</span>
                    <span className="rounded-full bg-paper-deep px-2 py-0.5 text-ink-soft">{p.porEstado.nao} não iniciados</span>
                    <span className="ml-auto inline-flex items-center gap-1 text-ink-faint transition-colors group-hover:text-ink">
                      Abrir programa <Ic name="arrow" size={11} className="transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                  <span className="mt-2 block text-[10px] font-extrabold tracking-[0.1em] uppercase" style={{ color: nivel.cor }}>{nivel.label}</span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </div>
    </div>
  );
}

function Detalhe({ fw, voltar, unico }: { fw: Framework; voltar: () => void; unico?: boolean }) {
  const { iso, setIso, registrar, toast } = useStore();
  const { usuario } = useAuth();
  const [plano, setPlano] = useState<PlanoIso | null>(null);
  const [gerando, setGerando] = useState(false);
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [anexoId, setAnexoId] = useState<string | null>(null);
  const controleAnexo = anexoId ? fw.controles.find((c) => c.id === anexoId) ?? null : null;
  const p = progressoFramework(fw, iso);
  const nivel = nivelMaturidade(p.pct);
  const mapa = iso[fw.id] ?? {};
  const oficial = p.pct >= PDF_ADEQUADO_MIN;

  const gerarPdf = () => {
    setGerandoPdf(true);
    setTimeout(() => {
      try {
        gerarPacotePdf({
          fw,
          mapa,
          pct: p.pct,
          empresa: usuario?.empresa || usuario?.nome || "Minha Organização",
          responsavel: usuario?.nome ?? "Responsável pelo programa",
        });
        registrar("iso", `Pacote documental ${fw.codigo} gerado em PDF (${oficial ? "CONTROLADO" : "RASCUNHO"}).`);
        toast(
          oficial
            ? `Download iniciado: políticas-${fw.id}-v1.pdf (CONTROLADO). Confira sua pasta de downloads.`
            : `Download iniciado em modo RASCUNHO. Alcance ${PDF_ADEQUADO_MIN}% para a versão CONTROLADO.`,
          oficial ? "ok" : "warn"
        );
      } catch (err) {
        console.error("Falha ao gerar o pacote PDF:", err);
        toast("Não foi possível gerar o PDF. Tente novamente — se persistir, recarregue a página.", "warn");
      } finally {
        setGerandoPdf(false);
      }
    }, 450);
  };

  const grupos = useMemo(() => {
    const m = new Map<string, Framework["controles"]>();
    fw.controles.forEach((c) => m.set(c.dominio, [...(m.get(c.dominio) ?? []), c]));
    return [...m.entries()];
  }, [fw]);

  const gerar = () => {
    setGerando(true);
    setPlano(null);
    setTimeout(() => {
      setPlano(sugerirPlanoIso(fw.id, iso));
      setGerando(false);
      registrar("iso", `Plano de implementação gerado por IA para ${fw.codigo}.`);
      toast(`Plano gerado para ${fw.codigo}: ${sugerirPlanoIso(fw.id, iso).gap.nao + sugerirPlanoIso(fw.id, iso).gap.andamento} controles pendentes.`, "ia");
    }, 900);
  };

  const baixarPlano = () => {
    if (!plano) return;
    const md = `# Plano de implementação — ${fw.codigo}\n\n**${fw.titulo}**\n${fw.objetivo}\n\nGerado pela IA do Radar GRC em ${new Date().toLocaleDateString("pt-BR")}.\n\n## Diagnóstico\n\n- Controles avaliados: ${plano.gap.total}\n- Conformes (implementados/verificados): ${plano.gap.conformes}\n- Em andamento: ${plano.gap.andamento}\n- Não iniciados: ${plano.gap.nao}\n\n## Roadmap\n\n${plano.fases.map((f) => `### ${f.fase}\n_Prazo: ${f.prazo}_\n\n${f.acoes.map((a) => `- ${a}`).join("\n")}`).join("\n\n")}\n`;
    baixarArquivo(`plano-${fw.id}-${Date.now()}.md`, md);
    toast("Plano exportado em Markdown.");
  };

  const mudarEstado = (controlId: string, estado: EstadoIso) => {
    const c = fw.controles.find((x) => x.id === controlId)!;
    setIso(fw.id, controlId, { estado });
    registrar("iso", `${fw.codigo} · ${c.ref} ${c.titulo} → ${ESTADOS_META[estado].label}.`);
  };

  return (
    <div>
      {!unico && (
        <button onClick={voltar} className="group mb-4 inline-flex items-center gap-1.5 text-[12.5px] font-bold text-moss transition hover:text-pine">
          <Ic name="arrow" size={13} className="rotate-180 transition-transform group-hover:-translate-x-0.5" /> Todos os frameworks
        </button>
      )}

      <Reveal>
        <div className="mb-5 overflow-hidden rounded-xl border border-sand bg-cream">
          <span className="block h-2" style={{ background: fw.cor }} />
          <div className="flex flex-wrap items-center justify-between gap-5 p-5 sm:p-6">
            <div className="max-w-xl">
              <span className="rounded-sm px-2 py-0.5 text-[10.5px] font-extrabold tracking-wide text-cream" style={{ background: fw.cor }}>{fw.codigo}</span>
              <h1 className="font-display mt-2 text-[24px] leading-tight font-extrabold tracking-tight text-ink sm:text-[28px]">{fw.titulo}</h1>
              <p className="mt-1 text-[13px] text-ink-soft">{fw.objetivo}</p>
              <div className="mt-3 flex flex-wrap gap-1.5 text-[10.5px] font-bold">
                <span className="rounded-full bg-moss/12 px-2 py-0.5 text-moss">{p.porEstado.impl + p.porEstado.verif} conformes</span>
                <span className="rounded-full bg-amber-soft px-2 py-0.5 text-ink">{p.porEstado.andamento} em andamento</span>
                <span className="rounded-full bg-paper-deep px-2 py-0.5 text-ink-soft">{p.porEstado.nao} não iniciados</span>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <div className="relative">
                <Ring value={p.pct} size={116} stroke={9} cor={fw.cor} />
                <div className="absolute inset-0 grid place-items-center">
                  <p className="font-display text-[26px] font-extrabold text-ink">{p.pct}%</p>
                </div>
              </div>
              <div className="max-w-[170px]">
                <p className="text-[10px] font-bold tracking-[0.14em] text-ink-faint uppercase">Maturidade</p>
                <p className="font-display mt-1 text-[14px] leading-tight font-bold" style={{ color: nivel.cor }}>{nivel.label}</p>
                <p className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[9.5px] font-extrabold tracking-wide uppercase ${oficial ? "bg-moss/12 text-moss" : "bg-amber-soft text-ink"}`}>
                  <Ic name="doc" size={10} sw={2.4} />
                  {oficial ? "Documentos oficiais liberados" : `PDF oficial a partir de ${PDF_ADEQUADO_MIN}%`}
                </p>
              </div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 border-t border-sand bg-paper px-5 py-3.5">
            <button onClick={gerar} disabled={gerando} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98] disabled:opacity-70">
              {gerando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-lime/30 border-t-lime" /> : <Ic name="wand" size={14} sw={2.2} />}
              {gerando ? "Analisando gaps…" : "Gerar plano de implementação com IA"}
            </button>
            {plano && (
              <button onClick={baixarPlano} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-4 py-2 text-[12.5px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
                <Ic name="download" size={14} /> Baixar plano (.md)
              </button>
            )}
            <button
              onClick={gerarPdf}
              disabled={gerandoPdf}
              title={oficial ? "Pacote CONTROLADO com políticas, sumário e anexo de evidências" : "Gera em modo RASCUNHO até atingir 60% de conformidade"}
              className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-[12.5px] font-bold transition active:scale-[0.98] disabled:opacity-70 ${oficial ? "bg-moss text-cream hover:bg-pine" : "border border-amber/60 bg-amber-soft text-ink hover:bg-amber-soft/70"}`}
            >
              {gerandoPdf ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-current/30 border-t-current" /> : <Ic name="printer" size={14} />}
              {gerandoPdf ? "Montando PDF…" : oficial ? "Gerar políticas (PDF oficial)" : "Gerar políticas (rascunho)"}
            </button>
            <span className="ml-auto text-[11px] text-ink-faint">Os estados alimentam o dashboard e os relatórios em tempo real.</span>
          </div>
        </div>
      </Reveal>

      {unico && (
        <Reveal delay={70}>
          <div className="mb-5 grid gap-3.5 lg:grid-cols-[1fr_320px]">
            {/* trilha de certificação */}
            <div className="rounded-lg border border-sand bg-cream p-5">
              <p className="text-[10px] font-extrabold tracking-[0.16em] text-ink-faint uppercase">Trilha de certificação</p>
              <div className="mt-3.5 flex items-start">
                {[
                  { t: "Diagnóstico", d: "Gap analysis e escopo" },
                  { t: "Implementação", d: "Controles e políticas" },
                  { t: "Evidências", d: "Registros e notas" },
                  { t: "Auditoria interna", d: "Verificação (9.2)" },
                  { t: "Certificação", d: "Auditoria externa" },
                ].map((s2, i2) => {
                  const feito = i2 < (p.pct >= 100 ? 5 : p.pct >= 75 ? 4 : p.pct >= 45 ? 3 : p.pct >= 15 ? 2 : 1);
                  const atual = i2 === (p.pct >= 100 ? 4 : p.pct >= 75 ? 3 : p.pct >= 45 ? 2 : p.pct >= 15 ? 1 : 0);
                  return (
                    <div key={s2.t} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        <span className={`h-0.5 flex-1 ${i2 === 0 ? "opacity-0" : feito || atual ? "" : "opacity-30"}`} style={{ background: feito || atual ? fw.cor : "var(--color-sand)" }} />
                        <span
                          className={`grid size-7 shrink-0 place-items-center rounded-full border-2 text-[11px] font-extrabold transition-all ${atual ? "scale-110 shadow-md" : ""}`}
                          style={{
                            borderColor: feito || atual ? fw.cor : "var(--color-sand)",
                            background: feito ? fw.cor : "var(--color-cream)",
                            color: feito ? "#faf8ee" : atual ? fw.cor : "var(--color-ink-faint)",
                          }}
                        >
                          {feito ? "✓" : i2 + 1}
                        </span>
                        <span className={`h-0.5 flex-1 ${i2 === 4 ? "opacity-0" : feito ? "" : "opacity-30"}`} style={{ background: feito ? fw.cor : "var(--color-sand)" }} />
                      </div>
                      <p className={`mt-1.5 text-center text-[10.5px] leading-tight font-bold ${atual ? "text-ink" : "text-ink-faint"}`}>{s2.t}</p>
                      <p className="hidden text-center text-[9px] text-ink-faint sm:block">{s2.d}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* pacote documental */}
            <div className="rail-texture flex flex-col rounded-lg border border-pine-line bg-pine p-5 text-cream">
              <p className="flex items-center gap-2 text-[10px] font-extrabold tracking-[0.16em] text-lime uppercase">
                <Ic name="doc" size={12} sw={2.4} /> Pacote para auditoria
              </p>
              <p className="font-display mt-2 text-[15.5px] leading-snug font-extrabold">Documento completo para apresentar ao auditor</p>
              <ul className="mt-2.5 space-y-1">
                {["Capa controlada com classificação", "Sumário e 2 políticas redigidas", "Anexo A — situação de cada controle", "Bloco de aprovação e assinaturas"].map((it) => (
                  <li key={it} className="flex items-start gap-2 text-[11px] leading-snug text-cream/70">
                    <Ic name="check" size={11} className="mt-0.5 shrink-0 text-lime" sw={3} /> {it}
                  </li>
                ))}
              </ul>
              <button
                onClick={gerarPdf}
                disabled={gerandoPdf}
                className="group mt-4 inline-flex items-center justify-center gap-2 rounded-md bg-lime px-4 py-2.5 text-[13px] font-extrabold text-pine transition hover:bg-lime-soft active:scale-[0.98] disabled:opacity-70"
              >
                {gerandoPdf ? <span className="inline-block size-4 animate-spin rounded-full border-2 border-pine/30 border-t-pine" /> : <Ic name="download" size={15} sw={2.4} />}
                {gerandoPdf ? "Gerando e baixando…" : "Baixar PDF (.pdf)"}
              </button>
              <p className="mt-2 text-center text-[9.5px] text-cream/45">
                {oficial ? "Versão CONTROLADO — pronta para o auditor" : `RASCUNHO com marca d'água até ${PDF_ADEQUADO_MIN}% de conformidade`}
              </p>
            </div>
          </div>
        </Reveal>
      )}

      {plano && (
        <Reveal>
          <div className="anim-pop rail-texture mb-5 rounded-xl border border-pine-line bg-pine p-5 text-cream">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-[10.5px] font-bold tracking-[0.16em] text-lime uppercase">
                  <Ic name="spark" size={13} sw={2.4} /> Plano gerado por IA · baseado nos seus gaps
                </p>
                <h2 className="font-display mt-1 text-[18px] font-extrabold">Roadmap {fw.codigo}</h2>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[10.5px] font-bold">
                <span className="rounded-full bg-pine-deep px-2.5 py-1 text-cream/80">{plano.gap.total} controles</span>
                <span className="rounded-full bg-rust/20 px-2.5 py-1 text-[#f0b39a]">{plano.gap.nao} não iniciados</span>
                <span className="rounded-full bg-amber/20 px-2.5 py-1 text-amber-soft">{plano.gap.andamento} em andamento</span>
                <span className="rounded-full bg-lime/15 px-2.5 py-1 text-lime">{plano.gap.conformes} conformes</span>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {plano.fases.map((f, i) => (
                <div key={f.fase} className="rounded-lg border border-pine-line bg-pine-deep/70 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-display text-[13.5px] font-bold text-cream">{f.fase}</p>
                    <span className="shrink-0 rounded-sm bg-lime px-1.5 py-0.5 text-[9.5px] font-extrabold tracking-wide text-pine uppercase">{f.prazo}</span>
                  </div>
                  <ul className="mt-2.5 space-y-1.5">
                    {f.acoes.map((a) => (
                      <li key={a} className="flex gap-2 text-[12px] leading-snug text-cream/75">
                        <span className="mt-1.5 size-1 shrink-0 rounded-full bg-lime/70" />
                        {a}
                      </li>
                    ))}
                  </ul>
                  {i < plano.fases.length - 1 && <p className="mt-2.5 hidden text-[9.5px] font-bold tracking-widest text-cream/30 md:block">DEPOIS ↓</p>}
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      )}

      <div className="space-y-5">
        {grupos.map(([dominio, controles]) => (
          <Reveal key={dominio}>
            <section>
              <h2 className="font-display mb-2.5 flex items-center gap-2 text-[14px] font-bold text-ink">
                <span className="inline-block h-3.5 w-1 rounded-full" style={{ background: fw.cor }} />
                {dominio}
                <span className="text-[11px] font-semibold text-ink-faint">· {controles.length} controle(s)</span>
              </h2>
              <div className="overflow-hidden rounded-lg border border-sand bg-cream">
                {controles.map((c) => {
                  const st = mapa[c.id];
                  const estado: EstadoIso = st?.estado ?? "nao";
                  return (
                    <div key={c.id} className="grid grid-cols-1 gap-2.5 border-b border-sand/70 px-4 py-3 transition-colors last:border-b-0 hover:bg-paper md:grid-cols-[1fr_280px] md:items-center md:gap-4">
                      <div className="flex items-start gap-3">
                        <span className="mt-0.5 shrink-0 rounded-sm px-1.5 py-0.5 text-[10px] font-extrabold text-cream" style={{ background: fw.cor }}>{c.ref}</span>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-ink">{c.titulo}</p>
                          <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{c.desc}</p>
                          {st?.nota && <p className="mt-1 rounded-sm bg-lime-soft/60 px-2 py-0.5 text-[10.5px] font-semibold text-pine">Nota: {st.nota}</p>}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 md:justify-end">
                        <button
                          onClick={() => setAnexoId(c.id)}
                          title="Anexar evidências (documentos e imagens)"
                          className={`relative inline-flex items-center gap-1.5 rounded-md border px-2 py-1.5 text-[10px] font-extrabold tracking-wide uppercase transition active:scale-95 ${
                            st?.anexos?.length
                              ? "border-moss bg-moss/10 text-moss"
                              : "border-sand bg-cream text-ink-faint hover:border-moss hover:text-moss"
                          }`}
                        >
                          <Ic name="doc" size={12} sw={2.2} />
                          Evidências
                          {(st?.anexos?.length ?? 0) > 0 && (
                            <span className="grid min-w-4 place-items-center rounded-full bg-moss px-1 text-[9px] font-extrabold text-cream">{st!.anexos!.length}</span>
                          )}
                        </button>
                        <input
                          defaultValue={st?.nota ?? ""}
                          key={st?.nota ?? ""}
                          onBlur={(e) => {
                            if (e.target.value !== (st?.nota ?? "")) {
                              setIso(fw.id, c.id, { nota: e.target.value || undefined });
                              registrar("iso", `${fw.codigo} · ${c.ref}: nota atualizada.`);
                            }
                          }}
                          placeholder="Evidência / nota…"
                          className="w-32 flex-1 rounded-md border border-sand bg-cream px-2 py-1.5 text-[11px] text-ink outline-none transition placeholder:text-ink-faint focus:border-moss md:w-36"
                        />
                        <div className="flex overflow-hidden rounded-md border border-sand">
                          {ORDEM_ESTADOS.map((e) => {
                            const ativo = estado === e;
                            const meta = ESTADOS_META[e];
                            return (
                              <button
                                key={e}
                                onClick={() => mudarEstado(c.id, e)}
                                title={meta.label}
                                className={`px-2 py-1.5 text-[9.5px] font-extrabold tracking-wide uppercase transition-all duration-150 ${ativo ? "" : "bg-cream text-ink-faint hover:bg-paper"}`}
                                style={ativo ? { background: meta.bg, color: meta.fg } : undefined}
                              >
                                {meta.label.split(" ")[0]}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </Reveal>
        ))}
      </div>

      <AnexoModal
        aberto={!!controleAnexo}
        onFechar={() => setAnexoId(null)}
        controle={controleAnexo}
        anexos={(controleAnexo && mapa[controleAnexo.id]?.anexos) || []}
        onChange={(a) => {
          if (controleAnexo) setIso(fw.id, controleAnexo.id, { anexos: a.length ? a : undefined });
        }}
      />
    </div>
  );
}

const TEXTO_HUB: Record<string, { kicker: string; titulo: string; desc: string }> = {
  iso: {
    kicker: "Governança · ISO",
    titulo: "Programas de implementação ISO",
    desc: "Acompanhe a implementação controle a controle — do SGSI (27001) ao compliance (37301) — e gere planos de ação com IA a partir dos gaps reais de cada norma.",
  },
  cert: {
    kicker: "Certificações · SOC 2 & PCI-DSS",
    titulo: "Certificações SOC 2 e PCI-DSS",
    desc: "Prepare-se para o exame SOC 2 Type II e a conformidade PCI-DSS v4.0 com controles mapeados, evidências e geração de documentos para auditoria.",
  },
};

export default function Iso({ ids, grupo }: { ids?: string[]; grupo?: string }) {
  const [sel, setSel] = useState<string | null>(null);
  const lista = ids ? FRAMEWORKS.filter((f) => ids.includes(f.id)) : FRAMEWORKS;
  /* grupo de um único framework abre direto o detalhe */
  if (ids?.length === 1) {
    const fw = FRAMEWORKS.find((f) => f.id === ids[0]);
    return fw ? <Detalhe fw={fw} voltar={() => undefined} unico /> : null;
  }
  const txt = TEXTO_HUB[grupo ?? "iso"];
  const fw = lista.find((f) => f.id === sel);
  return fw ? <Detalhe fw={fw} voltar={() => setSel(null)} /> : <Hub abrir={setSel} lista={lista} kicker={txt.kicker} titulo={txt.titulo} desc={txt.desc} />;
}
