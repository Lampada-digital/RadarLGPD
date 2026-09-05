/* =====================================================================
   Importação de planilhas (CSV/TSV) — alimenta o mapeamento automaticamente.
   ===================================================================== */

import { uid } from "./domain";
import type { Atividade, GdprAtividade } from "./domain";

export function parseCsv(texto: string): string[][] {
  const t = texto.replace(/^\uFEFF/, "");
  const sep = t.includes(";") && (t.match(/;/g)?.length ?? 0) > (t.match(/,/g)?.length ?? 0) ? ";" : t.includes("\t") ? "\t" : ",";
  const linhas: string[][] = [];
  let atual: string[] = [];
  let campo = "";
  let emAspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (emAspas) {
      if (ch === '"') {
        if (t[i + 1] === '"') {
          campo += '"';
          i++;
        } else emAspas = false;
      } else campo += ch;
    } else if (ch === '"') emAspas = true;
    else if (ch === sep) {
      atual.push(campo);
      campo = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      atual.push(campo);
      campo = "";
      if (atual.some((c) => c.trim() !== "")) linhas.push(atual);
      atual = [];
    } else campo += ch;
  }
  atual.push(campo);
  if (atual.some((c) => c.trim() !== "")) linhas.push(atual);
  return linhas;
}

function normCab(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
}

/* ------------------- LGPD (art. 37) ------------------- */
export const MODELO_LGPD = `Nome;Área;Responsável;Finalidade;Base legal;Titulares;Categorias de dados;Retenção;Probabilidade (1-5);Impacto (1-5)
Folha de pagamento;RH;Helena Duarte;Processar salários e obrigações trabalhistas;obrigacao-legal;Empregados;nome;contato;financeiro;5 anos;2;3
CRM e prospecção;Vendas;Carlos Mendes;Gerenciar leads e pipeline comercial;legitimo;Clientes;nome;contato;online;24 meses;3;3`;

export function importarLgpd(linhas: string[][]): { itens: Atividade[]; erros: string[] } {
  const itens: Atividade[] = [];
  const erros: string[] = [];
  if (linhas.length < 2) return { itens, erros: ["A planilha precisa de um cabeçalho e ao menos uma linha de dados."] };
  const cab = linhas[0].map(normCab);
  const col = (nome: string) => cab.findIndex((c) => c.includes(nome));
  const iNome = col("nome");
  const iArea = col("area");
  const iResp = col("responsavel");
  const iFin = col("finalidade");
  const iBase = col("base");
  const iTit = col("titular");
  const iRet = col("retencao");
  const iProb = col("probabilidade");
  const iImp = col("impacto");
  if (iNome === -1) return { itens, erros: ["Coluna 'Nome' não encontrada no cabeçalho."] };

  linhas.slice(1).forEach((ln, idx) => {
    const nome = (ln[iNome] ?? "").trim();
    if (!nome) {
      erros.push(`Linha ${idx + 2}: sem nome — ignorada.`);
      return;
    }
    const dados = (ln[iNome + 1] ?? "").split(/[;|]/).map((s) => s.trim()).filter(Boolean);
    itens.push({
      id: uid(),
      nome,
      area: (ln[iArea] ?? "Operações").trim() || "Operações",
      responsavel: iResp >= 0 ? (ln[iResp] ?? "").trim() : "",
      finalidade: iFin >= 0 ? (ln[iFin] ?? "").trim() : nome,
      baseLegalId: iBase >= 0 && (ln[iBase] ?? "").trim() ? (ln[iBase] ?? "").trim() : "legitimo",
      sujeitos: iTit >= 0 ? (ln[iTit] ?? "").split(/[;|]/).map((s) => s.trim()).filter(Boolean) : ["Clientes"],
      dados: dados.length ? dados : ["nome"],
      retencao: iRet >= 0 ? (ln[iRet] ?? "").trim() : "",
      retencaoJustificativa: "",
      compartilhamento: [],
      transferenciaInternacional: false,
      medidas: [],
      probabilidade: clamp15(iProb >= 0 ? ln[iProb] : "3"),
      impacto: clamp15(iImp >= 0 ? ln[iImp] : "3"),
      origem: "manual",
      criadoEm: new Date().toISOString().slice(0, 10),
    });
  });
  return { itens, erros };
}

function clamp15(v: string | undefined): number {
  const n = parseInt((v ?? "").trim(), 10);
  return Number.isFinite(n) ? Math.min(5, Math.max(1, n)) : 3;
}

/* ------------------- GDPR (ROPA art. 30) ------------------- */
export const MODELO_GDPR = `Nome;Departamento;Finalidades;Base Art. 6;Titulares;Retenção;Risco (1-3)
EU Payroll;HR;Processamento de salários;gdpr-contrato;Empregados;6 anos;2
Newsletter;Marketing;Campanhas segmentadas;gdpr-consent;Clientes;Até retirada;2`;

export function importarGdpr(linhas: string[][]): { itens: GdprAtividade[]; erros: string[] } {
  const itens: GdprAtividade[] = [];
  const erros: string[] = [];
  if (linhas.length < 2) return { itens, erros: ["A planilha precisa de um cabeçalho e ao menos uma linha."] };
  const cab = linhas[0].map(normCab);
  const col = (n: string) => cab.findIndex((c) => c.includes(n));
  const iNome = col("nome");
  const iDep = col("departamento");
  const iFin = col("finalidade");
  const iBase = col("base");
  const iTit = col("titular");
  const iRet = col("retencao");
  const iRisco = col("risco");
  if (iNome === -1) return { itens, erros: ["Coluna 'Nome' não encontrada."] };

  linhas.slice(1).forEach((ln, idx) => {
    const nome = (ln[iNome] ?? "").trim();
    if (!nome) {
      erros.push(`Linha ${idx + 2}: sem nome — ignorada.`);
      return;
    }
    const risco = clamp13(iRisco >= 0 ? ln[iRisco] : "2");
    itens.push({
      id: uid(),
      nome,
      departamento: iDep >= 0 ? (ln[iDep] ?? "").trim() || "Operações" : "Operações",
      finalidades: iFin >= 0 ? (ln[iFin] ?? "").trim() : nome,
      baseArt6: iBase >= 0 && (ln[iBase] ?? "").trim() ? (ln[iBase] ?? "").trim() : "gdpr-legitimo",
      titulares: iTit >= 0 ? (ln[iTit] ?? "").split(/[;|]/).map((s) => s.trim()).filter(Boolean) : ["Titulares UE"],
      dados: ["g-nome"],
      retencao: iRet >= 0 ? (ln[iRet] ?? "").trim() : "",
      destinatarios: [],
      transferencia: false,
      medidas: [],
      risco,
      origem: "manual",
      criadoEm: new Date().toISOString().slice(0, 10),
    });
  });
  return { itens, erros };
}

function clamp13(v: string | undefined): 1 | 2 | 3 {
  const n = parseInt((v ?? "").trim(), 10);
  return (Number.isFinite(n) ? Math.min(3, Math.max(1, n)) : 2) as 1 | 2 | 3;
}

export function baixarModelo(nome: string, conteudo: string) {
  const blob = new Blob(["\uFEFF" + conteudo], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
