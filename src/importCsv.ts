/* =====================================================================
   Importação de planilhas — alimenta o mapeamento de dados automaticamente.
   Aceita CSV/TSV exportado do Excel/Google Sheets (detecta separador,
   BOM e aspas). Sem dependências externas.
   ===================================================================== */

import { AREAS, CATEGORIAS_DADOS, MEDIDAS, SUJEITOS, TODAS_BASES, uid } from "./types";
import type { Atividade } from "./types";
import { BASES_ART6, DADOS_GDPR, TITULARES_GDPR } from "./gdpr";
import type { GdprAtividade } from "./gdpr";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

/* ---------------- parser CSV robusto ---------------- */

export function parseCsv(texto: string): string[][] {
  let t = texto;
  if (t.charCodeAt(0) === 0xfeff) t = t.slice(1);
  const primeiraLinha = t.split("\n")[0] ?? "";
  const sep = (primeiraLinha.match(/;/g)?.length ?? 0) >= (primeiraLinha.match(/,/g)?.length ?? 0)
    ? (primeiraLinha.includes(";") ? ";" : primeiraLinha.includes("\t") ? "\t" : ",")
    : ",";
  const linhas: string[][] = [];
  let linha: string[] = [];
  let campo = "";
  let emAspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (emAspas) {
      if (ch === '"') {
        if (t[i + 1] === '"') { campo += '"'; i++; }
        else emAspas = false;
      } else campo += ch;
    } else if (ch === '"') emAspas = true;
    else if (ch === sep) { linha.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      linha.push(campo);
      campo = "";
      if (linha.some((c) => c.trim() !== "")) linhas.push(linha);
      linha = [];
    } else campo += ch;
  }
  linha.push(campo);
  if (linha.some((c) => c.trim() !== "")) linhas.push(linha);
  return linhas;
}

function mapaColunas(cabecalho: string[]): (nome: string) => number {
  const idx = new Map<string, number>();
  cabecalho.forEach((h, i) => idx.set(norm(h), i));
  return (nome) => {
    const alvo = norm(nome);
    for (const [k, v] of idx) {
      if (k === alvo || k.includes(alvo) || alvo.includes(k)) return v;
    }
    return -1;
  };
}

function le(linha: string[], i: number): string {
  return i >= 0 && i < linha.length ? (linha[i] ?? "").trim() : "";
}

function lista(v: string): string[] {
  return v.split(/[;|/]+/).map((s) => s.trim()).filter(Boolean);
}

/* ---------------- LGPD ---------------- */

export const MODELO_LGPD = [
  "Atividade;Área;Responsável;Finalidade;Base legal;Titulares;Categorias de dados;Retenção;Justificativa;Compartilhamento;Transferência internacional;Probabilidade (1-5);Impacto (1-5);Medidas",
  "Folha de pagamento;RH;Helena Duarte;Processar a folha mensal e obrigações trabalhistas;Art. 7º, II;Empregados;nome; cpf; dados bancários; saúde;5 anos;Prescrição trabalhista;Contabilidade; eSocial;Não;3;3;Criptografia em repouso; Controle de acesso (RBAC)",
  "CFTV da portaria;Operações;Carlos Mendes;Vigilância patrimonial das instalações;Art. 7º, II;Visitantes;imagem;30 dias;Segurança patrimonial;Empresa de segurança;Não;2;2;Registro de auditoria (logs)",
].join("\n");

export function importarLgpd(linhas: string[][]): { itens: Atividade[]; erros: string[] } {
  const itens: Atividade[] = [];
  const erros: string[] = [];
  if (linhas.length < 2) return { itens, erros: ["A planilha precisa de um cabeçalho e ao menos uma linha de dados."] };
  const col = mapaColunas(linhas[0]);

  linhas.slice(1).forEach((ln, n) => {
    const num = n + 2;
    const nome = le(ln, col("Atividade"));
    const finalidade = le(ln, col("Finalidade"));
    if (!nome || !finalidade) {
      erros.push(`Linha ${num}: nome e finalidade são obrigatórios — linha ignorada.`);
      return;
    }
    const baseEntrada = norm(le(ln, col("Base legal")));
    const base = TODAS_BASES.find(
      (b) => baseEntrada && (norm(b.inciso).includes(baseEntrada) || baseEntrada.includes(norm(b.inciso).replace(/\s/g, "")) || norm(b.titulo).includes(baseEntrada))
    );
    const sujeitos = SUJEITOS.filter((s) => lista(le(ln, col("Titulares"))).some((x) => norm(x).includes(norm(s).split(" ")[0])));
    const dados = CATEGORIAS_DADOS.filter((c) =>
      lista(le(ln, col("Categorias de dados"))).some((x) => norm(x).includes(norm(c.label).split(" ")[0]) || norm(c.label).includes(norm(x)))
    ).map((c) => c.id);
    const medidas = MEDIDAS.filter((m) => lista(le(ln, col("Medidas"))).some((x) => norm(m).includes(norm(x).slice(0, 8)) || norm(x).includes(norm(m).split(" ")[0])));
    const prob = Math.min(5, Math.max(1, parseInt(le(ln, col("Probabilidade")))) || 3);
    const imp = Math.min(5, Math.max(1, parseInt(le(ln, col("Impacto")))) || 3);
    itens.push({
      id: uid(),
      nome,
      area: AREAS.includes(le(ln, col("Área"))) ? le(ln, col("Área")) : AREAS[0],
      responsavel: le(ln, col("Responsável")) || "—",
      finalidade,
      baseLegalId: base?.id ?? "consentimento",
      sujeitos: sujeitos.length ? sujeitos : ["Clientes"],
      dados: dados.length ? dados : ["nome"],
      retencao: le(ln, col("Retenção")) || "A definir",
      retencaoJustificativa: le(ln, col("Justificativa")),
      compartilhamento: lista(le(ln, col("Compartilhamento"))),
      transferenciaInternacional: /^(sim|yes|verdadeiro|true|1)$/i.test(le(ln, col("Transferência"))),
      medidas,
      probabilidade: prob,
      impacto: imp,
      origem: "manual",
      criadoEm: new Date().toISOString().slice(0, 10),
    });
  });
  return { itens, erros };
}

/* ---------------- GDPR ---------------- */

export const MODELO_GDPR = [
  "Operação;Departamento;Finalidades;Base Art. 6;Condição Art. 9;Titulares;Categorias de dados;Retenção;Destinatários;Transferência fora do EEE;Mecanismo;Risco (1-3);Medidas",
  "EU payroll;HR;Processar salários e obrigações legais;Art. 6(1)(b);Art. 9(2)(b);Empregados;nome; contato; financeiro; saúde;6 anos;Autoridade fiscal;Não;;2;Criptografia em repouso; RBAC",
  "Newsletter marketing;Marketing;Campanhas e remarketing para leads;Art. 6(1)(a);;Clientes; Visitantes;nome; contato; identificadores online;Até retirada do consentimento;Mailchimp;Sim;SCCs;2;Consent management platform",
].join("\n");

export function importarGdpr(linhas: string[][]): { itens: GdprAtividade[]; erros: string[] } {
  const itens: GdprAtividade[] = [];
  const erros: string[] = [];
  if (linhas.length < 2) return { itens, erros: ["A planilha precisa de um cabeçalho e ao menos uma linha de dados."] };
  const col = mapaColunas(linhas[0]);

  linhas.slice(1).forEach((ln, n) => {
    const num = n + 2;
    const nome = le(ln, col("Operação")) || le(ln, col("Atividade"));
    const finalidades = le(ln, col("Finalidades")) || le(ln, col("Finalidade"));
    if (!nome || !finalidades) {
      erros.push(`Linha ${num}: operação e finalidades são obrigatórias — linha ignorada.`);
      return;
    }
    const b6Entrada = norm(le(ln, col("Base Art. 6"))) || norm(le(ln, col("Base")));
    const b6 = BASES_ART6.find((b) => b6Entrada && (norm(b.ref).replace(/[()]/g, "").includes(b6Entrada.replace(/[()]/g, "").slice(0, 8)) || norm(b.titulo).includes(b6Entrada)));
    const dados = DADOS_GDPR.filter((d) =>
      lista(le(ln, col("Categorias de dados"))).some((x) => norm(x).includes(norm(d.label).split(" ")[0]) || norm(d.label).includes(norm(x)))
    ).map((d) => d.id);
    const titulares = TITULARES_GDPR.filter((s) => lista(le(ln, col("Titulares"))).some((x) => norm(x).includes(norm(s).split(" ")[0])));
    const risco = Math.min(3, Math.max(1, parseInt(le(ln, col("Risco")))) || 2) as 1 | 2 | 3;
    itens.push({
      id: uid(),
      nome,
      departamento: le(ln, col("Departamento")) || "Operações",
      finalidades,
      baseArt6: b6?.id ?? "gdpr-legitimo",
      baseArt9: le(ln, col("Condição Art. 9")) || undefined,
      titulares: titulares.length ? titulares : ["Titulares UE"],
      dados: dados.length ? dados : ["g-nome"],
      retencao: le(ln, col("Retenção")) || "A definir",
      destinatarios: lista(le(ln, col("Destinatários"))),
      transferencia: /^(sim|yes|verdadeiro|true|1)$/i.test(le(ln, col("Transferência"))),
      mecanismoTransferencia: le(ln, col("Mecanismo")) || undefined,
      medidas: lista(le(ln, col("Medidas"))),
      risco,
      origem: "manual",
      criadoEm: new Date().toISOString().slice(0, 10),
    });
  });
  return { itens, erros };
}

export function baixarModelo(nome: string, conteudo: string) {
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.style.display = "none";
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 800);
}
