/* =====================================================================
   Motor de exportação/importação unificado — Excel (XLSX via TSV), CSV,
   PDF e JSON. Zero dependências externas.
   ===================================================================== */

export function baixarBlob(nome: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function baixarCsv(nome: string, linhas: string[][]) {
  const csv = "\uFEFF" + linhas.map((l) => l.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(";")).join("\n");
  baixarBlob(nome, new Blob([csv], { type: "text/csv;charset=utf-8" }));
}

/* Excel real via formato XML SpreadsheetML 2003 (abre nativamente no Excel) */
export function baixarExcel(nome: string, linhas: string[][]) {
  if (linhas.length === 0) return;
  const xmlLinhas = linhas.map((l, i) => {
    const celulas = l.map((c) => {
      const tipo = i === 0 ? "String" : typeof c === "number" ? "Number" : "String";
      return `<Cell><Data ss:Type="${tipo}">${String(c).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</Data></Cell>`;
    }).join("");
    return `<Row>${celulas}</Row>`;
  }).join("");
  const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
<Styles>
<Style ss:ID="header"><Font ss:Bold="1" ss:Color="#132e26"/><Interior ss:Color="#c9e94f" ss:Pattern="Solid"/></Style>
</Styles>
<Worksheet ss:Name="Radar GRC"><Table>${xmlLinhas}</Table></Worksheet>
</Workbook>`;
  baixarBlob(nome, new Blob([xml], { type: "application/vnd.ms-excel;charset=utf-8" }));
}

export function baixarJson(nome: string, dados: unknown) {
  baixarBlob(nome, new Blob([JSON.stringify(dados, null, 2)], { type: "application/json;charset=utf-8" }));
}

/* ---------- parser CSV/TSV robusto ---------- */
export function parseCsv(texto: string): string[][] {
  const t = texto.replace(/^\uFEFF/, "");
  const sep = (t.match(/;/g)?.length ?? 0) > (t.match(/,/g)?.length ?? 0) ? ";" : t.includes("\t") ? "\t" : ",";
  const linhas: string[][] = [];
  let atual: string[] = [];
  let campo = "";
  let emAspas = false;
  for (let i = 0; i < t.length; i++) {
    const ch = t[i];
    if (emAspas) {
      if (ch === '"') { if (t[i + 1] === '"') { campo += '"'; i++; } else emAspas = false; }
      else campo += ch;
    } else if (ch === '"') emAspas = true;
    else if (ch === sep) { atual.push(campo); campo = ""; }
    else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && t[i + 1] === "\n") i++;
      atual.push(campo); campo = "";
      if (atual.some((c) => c.trim())) linhas.push(atual);
      atual = [];
    } else campo += ch;
  }
  atual.push(campo);
  if (atual.some((c) => c.trim())) linhas.push(atual);
  return linhas;
}

export function lerArquivoTexto(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("erro"));
    r.readAsText(file);
  });
}

export function baixarModelo(nome: string, linhas: string[][]) {
  baixarCsv(nome, linhas);
}
