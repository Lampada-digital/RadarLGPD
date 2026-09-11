# Botão de Download PDF no Status Report

## Mudança Implementada

Adicionado botão de download em PDF no Status Report para exportar todos os projetos e suas informações.

## Localização

O botão foi adicionado no cabeçalho do Status Report, ao lado do botão "Novo Projeto".

## Funcionalidade

Ao clicar no botão "Download PDF", o sistema gera um documento PDF contendo:

### Conteúdo do PDF

1. **Cabeçalho**
   - Título: "Status Report - Projetos GRC"
   - Data de geração
   - Total de projetos

2. **Resumo**
   - Projetos em andamento
   - Projetos concluídos
   - Projetos atrasados

3. **Lista de Projetos**
   Para cada projeto, inclui:
   - Nome do projeto
   - Responsável
   - Período (data início → data fim)
   - Status (planejado, em andamento, concluído, atrasado, pausado)
   - Progresso (%)
   - Descrição (se houver)
   - Marco Atual (se houver)
   - Lista de Riscos (se houver)
   - Lista de Próximos Passos (se houver)

### Nome do Arquivo

O arquivo é gerado com o nome: `status-report-YYYY-MM-DD.pdf`

Onde `YYYY-MM-DD` é a data atual no formato ISO.

## Implementação Técnica

### Arquivo Modificado

- `src/components/StatusReport.tsx`

### Função Adicionada

```typescript
const baixarPdf = () => {
  const doc = new DocPdf("Status Report - Projetos GRC");
  
  // Cabeçalho
  doc.titulo("Status Report - Projetos GRC", 24);
  doc.texto(`Data: ${new Date().toLocaleDateString("pt-BR")}`, 10);
  doc.texto(`Total de Projetos: ${projetos.length}`, 10);
  doc.linhaH();
  
  // Estatísticas
  doc.titulo("Resumo", 16);
  doc.texto(`Em Andamento: ${stats.em_andamento}`, 10);
  doc.texto(`Concluídos: ${stats.concluidos}`, 10);
  doc.texto(`Atrasados: ${stats.atrasados}`, 10);
  doc.linhaH();
  
  // Lista de projetos
  doc.titulo("Projetos", 16);
  
  filtrados.forEach((p) => {
    doc.titulo(p.nome, 14);
    doc.texto(`Responsável: ${p.responsavel}`, 10);
    doc.texto(`Período: ${p.dataInicio} → ${p.dataFim}`, 10);
    doc.texto(`Status: ${p.status.replace("_", " ")}`, 10);
    doc.texto(`Progresso: ${p.progresso}%`, 10);
    
    if (p.descricao) {
      doc.texto(`Descrição: ${p.descricao}`, 10);
    }
    
    if (p.marco) {
      doc.texto(`Marco Atual: ${p.marco}`, 10);
    }
    
    if (p.riscos.length > 0) {
      doc.texto("Riscos:", 10, [40, 50, 45], true);
      p.riscos.forEach((r) => {
        doc.texto(`• ${r}`, 10);
      });
    }
    
    if (p.proximosPassos.length > 0) {
      doc.texto("Próximos Passos:", 10, [40, 50, 45], true);
      p.proximosPassos.forEach((p, i) => {
        doc.texto(`${i + 1}. ${p}`, 10);
      });
    }
    
    doc.linhaH();
  });
  
  doc.baixar(`status-report-${new Date().toISOString().split("T")[0]}.pdf`);
  registrar("status-report", "Status report exportado em PDF.");
  toast("Status report exportado em PDF.");
};
```

### Botão Adicionado

```tsx
<button onClick={baixarPdf} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-3 py-2.5 text-[13px] font-bold text-ink-soft shadow-sm transition hover:border-moss hover:text-moss active:scale-[0.98]">
  <Ic name="download" size={14} /> Download PDF
</button>
```

## Como Usar

1. Acesse o Status Report
2. Clique no botão "Download PDF" no cabeçalho
3. O PDF será gerado automaticamente com todos os projetos visíveis (filtrados)
4. O arquivo será baixado automaticamente para o seu computador

## Observações

- O PDF inclui apenas os projetos que estão visíveis após aplicar filtros
- O PDF usa a classe `DocPdf` já existente no sistema
- O arquivo é nomeado automaticamente com a data atual
- O PDF é gerado localmente, sem necessidade de servidor

## Build

Build realizado com sucesso:
- 73 módulos transformados
- CSS: 82.54 kB (gzip: 13.55 kB)
- JS: 564.18 kB (gzip: 146.79 kB)
- Tempo de build: 4.33s
