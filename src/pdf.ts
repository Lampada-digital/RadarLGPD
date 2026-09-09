/* =====================================================================
   Motor de PDF próprio — gera PDF 1.4 com texto real (selecionável),
   tabelas, quebras de página e rodapé. Zero dependências externas.
   Usa Helvetica (Latin-1) — suporta acentuação portuguesa.
   ===================================================================== */

type Cor = [number, number, number];

interface Op {
  kind: "texto" | "linha" | "ret";
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  texto?: string;
  tam?: number;
  cor?: Cor;
  negrito?: boolean;
  x2?: number;
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

/* converte para Latin-1 (WinAnsi) — cobre acentos portugueses */
function latin1(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0)!;
    out += code <= 0xff ? String.fromCharCode(code) : "?";
  }
  return out;
}

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const MARGEM = 50;

export class DocPdf {
  private ops: Op[][] = [[]];
  private y = PAGE_H - MARGEM;
  private tituloDoc: string;

  constructor(tituloDoc: string) {
    this.tituloDoc = tituloDoc;
  }

  private pag() {
    return this.ops[this.ops.length - 1];
  }

  private ensure(altura: number) {
    if (this.y - altura < MARGEM) {
      this.ops.push([]);
      this.y = PAGE_H - MARGEM;
    }
  }

  gap(h = 8) {
    this.y -= h;
  }

  titulo(texto: string, tam = 20, cor: Cor = [19, 46, 38]) {
    this.ensure(tam + 12);
    this.pag().push({ kind: "texto", x: MARGEM, y: this.y, texto, tam, cor, negrito: true });
    this.y -= tam + 10;
  }

  texto(texto: string, tam = 10, cor: Cor = [40, 50, 45], negrito = false) {
    const larguraMax = PAGE_W - MARGEM * 2;
    const porLinha = Math.max(10, Math.floor(larguraMax / (tam * 0.5)));
    const palavras = texto.split(" ");
    let atual = "";
    const linhas: string[] = [];
    for (const p of palavras) {
      if ((atual + " " + p).trim().length > porLinha) {
        if (atual) linhas.push(atual.trim());
        atual = p;
      } else {
        atual = (atual + " " + p).trim();
      }
    }
    if (atual) linhas.push(atual.trim());
    for (const ln of linhas) {
      this.ensure(tam + 5);
      this.pag().push({ kind: "texto", x: MARGEM, y: this.y, texto: ln, tam, cor, negrito });
      this.y -= tam + 4;
    }
  }

  item(texto: string, tam = 10) {
    this.ensure(tam + 5);
    this.pag().push({ kind: "texto", x: MARGEM, y: this.y, texto: "•", tam, cor: [46, 107, 84], negrito: true });
    const larguraMax = PAGE_W - MARGEM * 2 - 14;
    const porLinha = Math.max(10, Math.floor(larguraMax / (tam * 0.5)));
    const palavras = texto.split(" ");
    let atual = "";
    const linhas: string[] = [];
    for (const p of palavras) {
      if ((atual + " " + p).trim().length > porLinha) {
        if (atual) linhas.push(atual.trim());
        atual = p;
      } else atual = (atual + " " + p).trim();
    }
    if (atual) linhas.push(atual.trim());
    linhas.forEach((ln, i) => {
      if (i > 0) this.ensure(tam + 5);
      this.pag().push({ kind: "texto", x: MARGEM + 14, y: this.y, texto: ln, tam, cor: [40, 50, 45] });
      this.y -= tam + 4;
    });
  }

  linhaH(cor: Cor = [201, 233, 79]) {
    this.ensure(6);
    this.pag().push({ kind: "linha", x: MARGEM, y: this.y, x2: PAGE_W - MARGEM, cor });
    this.y -= 10;
  }

  tabela(cabecalhos: string[], linhas: string[][], larguras?: number[]) {
    const total = PAGE_W - MARGEM * 2;
    const cols = cabecalhos.length;
    const w = larguras ?? cabecalhos.map(() => total / cols);
    const alturaLinha = 16;
    const desenhar = (cells: string[], topo: number, fundo: boolean) => {
      let x = MARGEM;
      cells.forEach((cell, i) => {
        const texto = cell.length > Math.floor(w[i] / 4.6) ? cell.slice(0, Math.floor(w[i] / 4.6) - 1) + "…" : cell;
        if (fundo) this.pag().push({ kind: "ret", x, y: topo - 12, w: w[i], h: alturaLinha, cor: [234, 230, 213] });
        this.pag().push({ kind: "texto", x: x + 4, y: topo, texto, tam: 8, cor: fundo ? [19, 46, 38] : [40, 50, 45], negrito: fundo });
        x += w[i];
      });
    };
    this.ensure(alturaLinha * 2);
    desenhar(cabecalhos, this.y, true);
    this.y -= alturaLinha;
    for (const ln of linhas) {
      this.ensure(alturaLinha);
      desenhar(ln, this.y, false);
      this.y -= alturaLinha;
    }
    this.y -= 6;
  }

  render(): Uint8Array {
    const fontes = ["Helvetica", "Helvetica-Bold"];
    const objetos: string[] = [];
    const nPaginas = this.ops.length;
    /* numeração: 1=catalog 2=pages 3/4=fontes; páginas: 5..(5+n-1); conteúdos: depois */
    const pageObjStart = 5;
    const contentStart = pageObjStart + nPaginas;

    objetos[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
    const pageRefs = Array.from({ length: nPaginas }, (_, i) => `${pageObjStart + i} 0 R`).join(" ");
    objetos[2] = `<< /Type /Pages /Kids [${pageRefs}] /Count ${nPaginas} >>`;
    objetos[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /${fontes[0]} /Encoding /WinAnsiEncoding >>`;
    objetos[4] = `<< /Type /Font /Subtype /Type1 /BaseFont /${fontes[1]} /Encoding /WinAnsiEncoding >>`;

    this.ops.forEach((opsPag, pi) => {
      let stream = "";
      for (const op of opsPag) {
        if (op.kind === "texto") {
          const [r, g, b] = op.cor!;
          stream += `BT /F${op.negrito ? 2 : 1} ${op.tam} Tf ${r / 255} ${g / 255} ${b / 255} rg ${op.x} ${op.y} Td (${esc(latin1(op.texto!))}) Tj ET\n`;
        } else if (op.kind === "linha") {
          const [r, g, b] = op.cor!;
          stream += `${r / 255} ${g / 255} ${b / 255} RG 1 w ${op.x} ${op.y} m ${op.x2} ${op.y} l S\n`;
        } else if (op.kind === "ret") {
          const [r, g, b] = op.cor!;
          stream += `${r / 255} ${g / 255} ${b / 255} rg ${op.x} ${op.y} ${op.w} ${op.h} re f\n`;
        }
      }
      /* rodapé */
      stream += `BT /F1 7 Tf 0.5 0.5 0.5 rg ${MARGEM} 28 Td (${esc(latin1(this.tituloDoc))} — Radar GRC) Tj ET\n`;
      stream += `BT /F1 7 Tf 0.5 0.5 0.5 rg ${PAGE_W - MARGEM - 60} 28 Td (Página ${pi + 1} de ${nPaginas}) Tj ET\n`;

      const contentObj = contentStart + pi;
      objetos[pageObjStart + pi] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentObj} 0 R >>`;
      objetos[contentObj] = `<< /Length ${stream.length} >>\nstream\n${stream}endstream`;
    });

    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [0];
    for (let i = 1; i < objetos.length; i++) {
      if (!objetos[i]) continue;
      offsets[i] = pdf.length;
      pdf += `${i} 0 obj\n${objetos[i]}\nendobj\n`;
    }
    const xrefPos = pdf.length;
    const maxObj = objetos.length - 1;
    pdf += `xref\n0 ${maxObj + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i <= maxObj; i++) {
      pdf += `${String(offsets[i] ?? 0).padStart(10, "0")} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${maxObj + 1} /Root 1 0 R >>\nstartxref\n${xrefPos}\n%%EOF`;

    const out = new Uint8Array(pdf.length);
    for (let i = 0; i < pdf.length; i++) out[i] = pdf.charCodeAt(i) & 0xff;
    return out;
  }

  baixar(nome: string) {
    const bytes = this.render();
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 3000);
  }
}

export function baixarArquivo(nome: string, conteudo: string, tipo = "text/plain;charset=utf-8") {
  const blob = new Blob([conteudo], { type: tipo });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
