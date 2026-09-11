# Gráficos do Status Report

## Visão Geral

O Status Report agora inclui três tipos de gráficos interativos para facilitar a visualização da posição de cada projeto:

1. **Gráfico de Pizza (Pie Chart)** - Distribuição por Status
2. **Gráfico de Barras (Bar Chart)** - Progresso dos Projetos
3. **Gráfico de Gantt** - Cronograma dos Projetos

## 1. Gráfico de Pizza - Distribuição por Status

### Descrição
Mostra a distribuição percentual dos projetos por status (Planejado, Em Andamento, Concluído, Atrasado).

### Características
- **Tipo**: Gráfico de pizza circular
- **Interatividade**: Hover mostra tooltip com valor e percentual
- **Legenda**: Exibida abaixo do gráfico com cores correspondentes
- **Cores**:
  - Planejado: Cinza (#78867c)
  - Em Andamento: Âmbar (#d99a26)
  - Concluído: Verde (#2e6b54)
  - Atrasado: Vermelho (#bd4f26)

### Uso
```tsx
<PieChart
  title="Distribuição por Status"
  data={[
    { label: "Planejado", value: stats.planejado, color: "#78867c" },
    { label: "Em Andamento", value: stats.em_andamento, color: "#d99a26" },
    { label: "Concluído", value: stats.concluidos, color: "#2e6b54" },
    { label: "Atrasado", value: stats.atrasados, color: "#bd4f26" },
  ]}
  size={250}
/>
```

### Benefícios
- Visualização rápida da proporção de projetos em cada status
- Identificação imediata de problemas (muitos projetos atrasados)
- Fácil comparação visual entre categorias

## 2. Gráfico de Barras - Progresso dos Projetos

### Descrição
Mostra o progresso percentual de cada projeto em barras horizontais.

### Características
- **Tipo**: Gráfico de barras verticais
- **Interatividade**: Hover mostra tooltip com valor exato
- **Cores dinâmicas**: Cor da barra muda conforme status do projeto
- **Eixo Y**: Escala de 0 a 100%
- **Eixo X**: Nomes dos projetos (truncados se muito longos)

### Cores por Status
- **Concluído**: Verde (#2e6b54)
- **Em Andamento**: Âmbar (#d99a26)
- **Atrasado**: Vermelho (#bd4f26)
- **Planejado/Pausado**: Cinza (#78867c)

### Uso
```tsx
<BarChart
  title="Progresso dos Projetos (%)"
  data={filtrados.map((p) => ({
    label: p.nome.length > 15 ? p.nome.substring(0, 15) + "..." : p.nome,
    value: p.progresso,
    maxValue: 100,
    color: p.status === "concluido" ? "#2e6b54" : 
           p.status === "em_andamento" ? "#d99a26" : 
           p.status === "atrasado" ? "#bd4f26" : "#78867c",
  }))}
  height={250}
/>
```

### Benefícios
- Comparação visual do progresso entre projetos
- Identificação rápida de projetos que precisam de atenção
- Visualização clara do percentual de conclusão

## 3. Gráfico de Gantt - Cronograma dos Projetos

### Descrição
Mostra o cronograma de todos os projetos em uma linha do tempo, mostrando datas de início e fim.

### Características
- **Tipo**: Gráfico de Gantt simplificado
- **Interatividade**: Hover mostra tooltip com datas
- **Cores por status**: Cada projeto tem cor baseada no seu status
- **Eixo X**: Meses (formato MMM YYYY)
- **Eixo Y**: Nomes dos projetos
- **Legenda**: Cores por status na parte inferior

### Cores por Status
- **Concluído**: Verde (#2e6b54)
- **Em Andamento**: Âmbar (#d99a26)
- **Atrasado**: Vermelho (#bd4f26)
- **Planejado/Pausado**: Cinza (#78867c)

### Uso
```tsx
<GanttChart
  title="Cronograma dos Projetos"
  data={filtrados.map((p) => ({
    label: p.nome,
    start: p.dataInicio,
    end: p.dataFim,
    status: p.status,
  }))}
  height={Math.max(200, filtrados.length * 40 + 50)}
/>
```

### Benefícios
- Visualização clara do cronograma de todos os projetos
- Identificação de sobreposições de projetos
- Visualização de prazos e deadlines
- Identificação rápida de projetos atrasados

## Implementação Técnica

### Arquivos Criados

1. **src/components/charts/BarChart.tsx**
   - Componente de gráfico de barras
   - Suporte a tooltips interativos
   - Cores dinâmicas
   - Responsivo

2. **src/components/charts/PieChart.tsx**
   - Componente de gráfico de pizza
   - Suporte a tooltips interativos
   - Legenda com cores
   - Responsivo

3. **src/components/charts/GanttChart.tsx**
   - Componente de gráfico de Gantt
   - Suporte a tooltips interativos
   - Escala de tempo automática
   - Cores por status

### Arquivo Modificado

- **src/components/StatusReport.tsx**
  - Importação dos componentes de gráficos
  - Adição da seção de gráficos
  - Integração com dados existentes

## Características dos Gráficos

### Interatividade
- **Hover**: Todos os gráficos mostram tooltips ao passar o mouse
- **Responsivo**: Gráficos se adaptam ao tamanho da tela
- **Cores intuitivas**: Cores consistentes com o status dos projetos

### Performance
- **SVG puro**: Sem dependências externas
- **Leve**: Componentes otimizados para performance
- **Escalável**: Suporta muitos projetos sem perda de performance

### Acessibilidade
- **Labels claros**: Todos os elementos têm labels descritivos
- **Contraste**: Cores com bom contraste para acessibilidade
- **Tooltips**: Informações adicionais ao passar o mouse

## Benefícios para o Usuário

### Visualização Clara
- Gráficos facilitam a compreensão rápida do status dos projetos
- Identificação visual de problemas e oportunidades

### Tomada de Decisão
- Dados visuais ajudam na tomada de decisão rápida
- Identificação de projetos que precisam de atenção

### Comunicação
- Gráficos facilitam a comunicação com stakeholders
- Relatórios visuais mais impactantes

### Monitoramento
- Monitoramento contínuo do progresso
- Identificação de tendências e padrões

## Exemplos de Uso

### Exemplo 1: Identificar Projetos Atrasados
O gráfico de Gantt mostra claramente projetos com barras vermelhas, indicando projetos atrasados que precisam de atenção imediata.

### Exemplo 2: Analisar Distribuição de Status
O gráfico de pizza mostra a distribuição percentual de projetos por status, permitindo identificar rapidamente se há muitos projetos atrasados ou se a maioria está em andamento.

### Exemplo 3: Comparar Progresso
O gráfico de barras permite comparar o progresso de todos os projetos de forma visual, identificando quais projetos estão mais avançados e quais precisam de mais atenção.

## Exportação

Os gráficos são incluídos automaticamente no PDF exportado pelo botão "Download PDF" no Status Report.

## Próximos Passos

### Melhorias Futuras
- Adicionar filtros interativos nos gráficos
- Suporte a exportação de gráficos individuais
- Adicionar mais tipos de gráficos (linha, área, etc.)
- Suporte a dados históricos para gráficos de tendência

### Customização
- Permitir customização de cores
- Permitir customização de tamanho dos gráficos
- Permitir adicionar/remover gráficos

## Conclusão

Os gráficos adicionados ao Status Report proporcionam uma visualização clara e intuitiva da posição de cada projeto, facilitando a tomada de decisão e a comunicação com stakeholders. Os gráficos são interativos, responsivos e integrados ao sistema de exportação de relatórios.
