/* =====================================================================
   Motor PDF 1.4 minimalista — zero dependências.
   Gera PDFs com texto selecionável (Helvetica + WinAnsi, acentos OK),
   retângulos coloridos, linhas, círculos, quebra de linha e múltiplas
   páginas. Suficiente para o pacote documental do Radar GRC.
   ===================================================================== */

export const A4W = 595.28;
export const A4H = 841.89;

export type Cor = [number, number, number];

const rgb = (c: Cor) => `${(c[0] / 255).toFixed(3)} ${(c[1] / 255).toFixed(3)} ${(c[2] / 255).toFixed(3)}`;

/* Normaliza o texto para WinAnsi (Latin-1) e escapa parênteses/backslash */
function esc(s: string): string {
  let out = "";
  for (const raw of s) {
    let ch = raw;
    if (ch === "“" || ch === "”" || ch === "„") ch = '"';
    else if (ch === "’" || ch === "‘" || ch === "‚") ch = "'";
    else if (ch === "–" || ch === "—" || ch === "•") ch = "-";
    else if (ch === "…" || ch === "×") ch = "...";
    const code = ch.charCodeAt(0);
    if (code > 255) {
      out += "?";
      continue;
    }
    if (ch === "(" || ch === ")" || ch === "\\") out += "\\";
    out += ch;
  }
  return out;
}

/* Estimativa de largura (Helvetica ~0.52em por caractere em média) */
const FATOR = 0.52;
export const larguraEst = (s: string, size: number) => s.length * size * FATOR;

export function quebrarLinhas(texto: string, size: number, maxW: number): string[] {
  const maxChars = Math.max(10, Math.floor(maxW / (size * FATOR)));
  const palavras = texto.split(/\s+/);
  const linhas: string[] = [];
  let atual = "";
  for (const p of palavras) {
    if ((atual + " " + p).trim().length <= maxChars) {
      atual = (atual + " " + p).trim();
    } else {
      if (atual) linhas.push(atual);
      if (p.length > maxChars) {
        let resto = p;
        while (resto.length > maxChars) {
          linhas.push(resto.slice(0, maxChars - 1) + "-");
          resto = resto.slice(maxChars - 1);
        }
        atual = resto;
      } else {
        atual = p;
      }
    }
  }
  if (atual) linhas.push(atual);
  return linhas.length ? linhas : [""];
}

export class Pdf {
  private completas: string[][] = [];
  private cur: string[] = [];

  constructor() {
    this.cur = [];
  }

  novaPagina() {
    this.completas.push(this.cur);
    this.cur = [];
  }

  /* ---------- primitivas ---------- */

  retangulo(x: number, yTop: number, w: number, h: number, cor: Cor) {
    const y = A4H - yTop - h;
    this.cur.push(`${rgb(cor)} rg ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
  }

  linha(x1: number, y1Top: number, x2: number, y2Top: number, cor: Cor, espessura = 0.7) {
    const a = A4H - y1Top;
    const b = A4H - y2Top;
    this.cur.push(`${espessura.toFixed(2)} w ${rgb(cor)} RG ${x1.toFixed(2)} ${a.toFixed(2)} m ${x2.toFixed(2)} ${b.toFixed(2)} l S`);
  }

  circulo(cx: number, cyTop: number, r: number, cor: Cor, espessura = 1) {
    const cy = A4H - cyTop;
    const k = 0.5523 * r;
    const p = (x: number, y: number) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    this.cur.push(
      `${espessura.toFixed(2)} w ${rgb(cor)} RG ${p(cx + r, cy)} m ` +
        `${p(cx + r, cy + k)} ${p(cx + k, cy + r)} ${p(cx, cy + r)} c ` +
        `${p(cx - k, cy + r)} ${p(cx - r, cy + k)} ${p(cx - r, cy)} c ` +
        `${p(cx - r, cy - k)} ${p(cx - k, cy - r)} ${p(cx, cy - r)} c ` +
        `${p(cx + k, cy - r)} ${p(cx + r, cy - k)} ${p(cx + r, cy)} c S`
    );
  }

  /* Texto em uma linha (sem quebra). yTop = topo da caixa de texto. */
  texto(x: number, yTop: number, size: number, str: string, opts: { cor?: Cor; bold?: boolean; italico?: boolean; align?: "left" | "right" | "center"; maxW?: number } = {}): number {
    const fonte = opts.bold ? "/F2" : opts.italico ? "/F3" : "/F1";
    const cor = rgb(opts.cor ?? [24, 38, 32]);
    let xx = x;
    const w = larguraEst(str, size);
    if (opts.align === "right" && opts.maxW != null) xx = x + opts.maxW - w;
    else if (opts.align === "right") xx = x - w;
    else if (opts.align === "center") xx = x - w / 2;
    const baseline = A4H - yTop - size * 0.76;
    this.cur.push(`BT ${fonte} ${size.toFixed(1)} Tf ${cor} rg ${xx.toFixed(2)} ${baseline.toFixed(2)} Td (${esc(str)}) Tj ET`);
    return yTop + size * 1.25;
  }

  /* Parágrafo com quebra automática. Retorna o novo yTop. */
  paragrafo(x: number, yTop: number, size: number, str: string, maxW: number, opts: { cor?: Cor; bold?: boolean; italico?: boolean; entrelinha?: number } = {}): number {
    const linhas = quebrarLinhas(str, size, maxW);
    const lh = size * (opts.entrelinha ?? 1.42);
    let y = yTop;
    for (const l of linhas) y = this.texto(x, y, size, l, opts);
    return yTop + linhas.length * lh;
  }
}

/* ---------- serialização ---------- */

export function gerarBytesPdf(doc: Pdf): Uint8Array {
  const paginas = [...(doc as unknown as { completas: string[][] }).completas, (doc as unknown as { cur: string[] }).cur].filter((p) => p.length > 0 || true);
  const n = Math.max(1, paginas.length);

  const objetos: string[] = [];
  // 1: catálogo · 2: páginas · 3-5: fontes · 6..6+n-1: páginas · 6+n..: streams
  objetos[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
  const kids = Array.from({ length: n }, (_, i) => `${6 + i} 0 R`).join(" ");
  objetos[2] = `<< /Type /Pages /Kids [${kids}] /Count ${n} >>`;
  objetos[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>`;
  objetos[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>`;
  objetos[5] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Oblique /Encoding /WinAnsiEncoding >>`;
  for (let i = 0; i < n; i++) {
    objetos[6 + i] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${A4W} ${A4H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R /F3 5 0 R >> >> /Contents ${6 + n + i} 0 R >>`;
  }
  for (let i = 0; i < n; i++) {
    const corpo = paginas[i].join("\n");
    objetos[6 + n + i] = `<< /Length ${corpo.length} >>\nstream\n${corpo}\nendstream`;
  }

  let saida = "%PDF-1.4\n";
  const offsets: number[] = [0];
  for (let i = 1; i < objetos.length; i++) {
    offsets[i] = saida.length;
    saida += `${i} 0 obj\n${objetos[i]}\nendobj\n`;
  }
  const xrefPos = saida.length;
  saida += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
  for (let i = 1; i < objetos.length; i++) {
    saida += `${offsets[i].toString().padStart(10, "0")} 00000 n \n`;
  }
  saida += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

  const bytes = new Uint8Array(saida.length);
  for (let i = 0; i < saida.length; i++) bytes[i] = saida.charCodeAt(i) & 0xff;
  return bytes;
}

export function baixarPdf(nome: string, bytes: Uint8Array) {
  const buf = new ArrayBuffer(bytes.length);
  new Uint8Array(buf).set(bytes);
  const blob = new Blob([buf], { type: "application/pdf" });
  baixarBlob(nome, blob);
}

/* Download robusto: âncora no DOM + evento real + fallback em nova aba */
export function baixarBlob(nome: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.rel = "noopener";
  a.style.display = "none";
  document.body.appendChild(a);
  a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 5000);
}
