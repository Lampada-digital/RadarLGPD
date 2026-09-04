/* =====================================================================
   Pacote documental ISO — políticas prontas + montagem do PDF.
   O status do programa define a classificação do documento:
   maturidade >= 60% → CONTROLADO · abaixo disso → RASCUNHO.
   ===================================================================== */

import { A4H, A4W, Pdf, baixarPdf, gerarBytesPdf } from "./pdf";
import type { Cor } from "./pdf";
import type { ControleEstado, Framework } from "./frameworks";
import { ESTADOS_META } from "./frameworks";

export const PDF_ADEQUADO_MIN = 60;

export interface PoliticaIso {
  codigo: string;
  titulo: string;
  objetivo: string;
  escopo: string;
  referencias: string[];
  diretrizes: string[];
  responsabilidades: { papel: string; texto: string }[];
}

export const POLITICAS: Record<string, PoliticaIso[]> = {
  iso27001: [
    {
      codigo: "POL-SI-001",
      titulo: "Política de Segurança da Informação",
      objetivo: "Estabelecer as diretrizes do Sistema de Gestão de Segurança da Informação (SGSI), protegendo a confidencialidade, a integridade e a disponibilidade das informações da organização e demonstrando conformidade com a ISO/IEC 27001.",
      escopo: "Aplica-se a todos os colaboradores, estagiários, terceiros, fornecedores e sistemas de informação da organização, em todas as unidades e ambientes (físicos e em nuvem).",
      referencias: ["ISO/IEC 27001:2022 - Cláusulas 4 a 10", "ISO/IEC 27002:2022 - Controles de segurança", "LGPD - Lei nº 13.709/2018, Art. 46", "GDPR - Regulamento (UE) 2016/679, Art. 32"],
      diretrizes: [
        "A alta direção deve demonstrar liderança e comprometimento com o SGSI, garantindo recursos, integração aos processos de negócio e comunicação da importância da segurança da informação.",
        "Toda informação deve ser classificada quanto à confidencialidade, integridade e disponidade, recebendo controles proporcionais ao seu valor e criticidade.",
        "A avaliação de riscos de segurança da informação deve ser executada ao menos anualmente ou quando ocorrerem mudanças significativas, registrando causas, consequências e controles.",
        "O Plano de Tratamento de Riscos e a Declaração de Aplicabilidade (SoA) devem ser mantidos atualizados e aprovados pela alta direção.",
        "Objetivos de segurança da informação mensuráveis devem ser definidos, monitorados por indicadores e analisados criticamente.",
        "Auditorias internas devem ser conduzidas em intervalo planejado, com plano de ação para as não conformidades identificadas.",
        "Incidentes de segurança devem ser reportados imediatamente ao canal definido, tratados conforme procedimento específico e usados como entrada para a melhoria contínua.",
      ],
      responsabilidades: [
        { papel: "Alta direção", texto: "Aprovar a política, prover recursos e conduzir a análise crítica do SGSI." },
        { papel: "Função de Segurança da Informação", texto: "Operar o SGSI, coordenar a gestão de riscos, auditorias e o programa de conscientização." },
        { papel: "Gestores de área", texto: "Garantir a aplicação dos controles em seus processos e reportar incidentes." },
        { papel: "Todos os colaboradores", texto: "Cumprir esta política, zelar pelas informações sob sua guarda e participar dos treinamentos." },
      ],
    },
    {
      codigo: "POL-SI-002",
      titulo: "Política de Controle de Acesso",
      objetivo: "Definir as regras de concessão, revisão e revogação de acessos aos sistemas e informações, assegurando o princípio do menor privilégio e a rastreabilidade das ações.",
      escopo: "Todos os acessos a sistemas corporativos, ambientes em nuvem, redes, dados e áreas físicas restritas.",
      referencias: ["ISO/IEC 27002:2022 - A.5.15, A.5.16, A.8.2, A.8.5", "ISO/IEC 27001:2022 - Anexo A", "LGPD - Art. 46 (medidas de segurança)"],
      diretrizes: [
        "Todo acesso deve ser concedido com base em papéis (RBAC) e na necessidade de conhecer, mediante solicitação formal aprovada pelo gestor da informação.",
        "A autenticação multifator (MFA) é obrigatória para acesso remoto, contas privilegiadas e sistemas críticos.",
        "Acessos devem ser revisados trimestralmente pelos gestores, com revogação imediata em desligamentos e mudanças de função.",
        "Credenciais são pessoais e intransferíveis; o compartilhamento de senhas constitui violação disciplinar.",
        "Registros de auditoria (logs) de acesso devem ser retidos e protegidos contra alteração, suportando investigações de incidentes.",
      ],
      responsabilidades: [
        { papel: "Gestores", texto: "Solicitar, aprovar e revisar os acessos de suas equipes." },
        { papel: "TI", texto: "Provisionar, monitorar e revogar acessos, mantendo logs íntegros." },
        { papel: "Colaboradores", texto: "Proteger suas credenciais e reportar acessos indevidos." },
      ],
    },
  ],
  iso27002: [
    {
      codigo: "POL-SI-003",
      titulo: "Política de Controles Tecnológicos",
      objetivo: "Estabelecer os requisitos de segurança para endpoints, redes, backups, monitoramento e desenvolvimento de software, conforme o catálogo de controles tecnológicos da ISO/IEC 27002.",
      escopo: "Infraestrutura tecnológica própria e em nuvem, estações de trabalho, dispositivos móveis e sistemas desenvolvidos interna ou externamente.",
      referencias: ["ISO/IEC 27002:2022 - Tema 8 (Tecnológicos)", "ISO/IEC 27001:2022 - Anexo A"],
      diretrizes: [
        "Configurações de segurança (baselines) devem ser definidas e aplicadas a todos os sistemas, com verificação automatizada de conformidade.",
        "Cópias de segurança devem seguir a periodicidade definida por criticidade, com criptografia e teste de restauração ao menos semestral.",
        "O monitoramento contínuo deve cobrir anomalias, acessos privilegiados e indicadores de comprometimento, com alertas tratados em SLA.",
        "O ciclo de desenvolvimento seguro (SDLC) deve incluir requisitos de segurança, revisão de código e testes antes da publicação em produção.",
        "Dispositivos móveis devem possuir criptografia de disco, bloqueio por senha e capacidade de apagamento remoto.",
        "Vulnerabilidades devem ser identificadas por varreduras periódicas e tratadas conforme a criticidade e os prazos definidos.",
      ],
      responsabilidades: [
        { papel: "TI / Engenharia", texto: "Implementar e operar os controles tecnológicos." },
        { papel: "Segurança da Informação", texto: "Definir baselines, conduzir varreduras e auditar a eficácia." },
      ],
    },
    {
      codigo: "POL-SI-004",
      titulo: "Política de Gestão de Ativos e Fornecedores",
      objetivo: "Assegurar inventário atualizado dos ativos de informação e a gestão dos riscos de segurança introduzidos por fornecedores e serviços terceirizados.",
      escopo: "Ativos de informação (dados, software, hardware, serviços) e todos os relacionamentos com fornecedores que acessam informações da organização.",
      referencias: ["ISO/IEC 27002:2022 - A.5.9, A.5.19, A.5.20, A.5.21, A.5.23", "LGPD - Art. 39 (operadores)"],
      diretrizes: [
        "Todo ativo de informação deve possuir proprietário definido, classificação e registro em inventário central.",
        "Contratos com fornecedores devem incluir requisitos de segurança da informação, obrigações de notificação de incidentes e direito de auditoria.",
        "Fornecedores críticos devem passar por avaliação de risco de segurança antes da contratação e reavaliação periódica.",
        "O uso de serviços em nuvem deve observar a política específica de segurança em nuvem e a segregação de ambientes.",
        "A devolução de ativos em desligamentos e o descarte seguro de mídias são obrigatórios.",
      ],
      responsabilidades: [
        { papel: "Proprietários de ativos", texto: "Classificar e revisar o inventário sob sua responsabilidade." },
        { papel: "Suprimentos / Jurídico", texto: "Incluir cláusulas de segurança nos contratos e acompanhar SLAs." },
      ],
    },
  ],
  iso27017: [
    {
      codigo: "POL-NV-001",
      titulo: "Política de Segurança em Serviços de Nuvem",
      objetivo: "Definir os requisitos de segurança para contratação, operação e descontinuação de serviços em nuvem, cobrindo os controles da ISO/IEC 27017 aplicáveis a provedores e clientes.",
      escopo: "Todos os serviços de nuvem (IaaS, PaaS, SaaS) utilizados ou fornecidos pela organização.",
      referencias: ["ISO/IEC 27017:2015 - Cláusulas 5 a 15", "ISO/IEC 27002:2022 - A.5.23", "GDPR - Art. 28 (operadores)"],
      diretrizes: [
        "A organização deve documentar seu papel (cliente e/ou provedor) e a matriz de responsabilidades compartilhadas para cada serviço.",
        "A contratação deve avaliar certificações do provedor (ISO 27001, SOC 2), localização de dados e requisitos regulatórios.",
        "Ambientes virtuais devem ser segregados por cliente/projeto, com redes isoladas e controle de tráfego entre zonas.",
        "Mudanças do provedor com impacto em segurança devem ser monitoradas e reavaliadas quanto ao risco.",
        "A administração remota deve ocorrer exclusivamente por canais criptografados, com MFA e registro de sessões.",
        "A descontinuação de recursos deve incluir a remoção segura e verificável de dados e mídias.",
      ],
      responsabilidades: [
        { papel: "TI / Arquitetura", texto: "Projetar e operar os ambientes em nuvem conforme esta política." },
        { papel: "Segurança da Informação", texto: "Avaliar provedores e revisar a matriz de responsabilidades." },
      ],
    },
    {
      codigo: "POL-NV-002",
      titulo: "Diretriz de Responsabilidade Compartilhada e SLA",
      objetivo: "Padronizar a análise do modelo de responsabilidade compartilhada e os requisitos mínimos de acordo de nível de serviço para ambientes em nuvem.",
      escopo: "Avaliações prévias à contratação e revisões anuais dos serviços de nuvem em uso.",
      referencias: ["ISO/IEC 27017:2015 - Cl. 6 e 10", "ISO/IEC 27002:2022 - A.5.19, A.5.20"],
      diretrizes: [
        "Cada serviço deve possuir matriz RACI de segurança (provedor x cliente) documentada e aprovada.",
        "SLAs devem prever disponibilidade, tempos de resposta a incidentes e penalidades, com revisão anual.",
        "A organização deve manter cópias dos relatórios de auditoria independente do provedor.",
        "Planos de saída (exit plan) devem ser definidos para serviços críticos.",
      ],
      responsabilidades: [
        { papel: "Gestor do contrato", texto: "Manter SLA e relatórios do provedor atualizados." },
        { papel: "Segurança da Informação", texto: "Validar a matriz de responsabilidades e o exit plan." },
      ],
    },
  ],
  iso27701: [
    {
      codigo: "POL-PV-001",
      titulo: "Política de Privacidade e Proteção de Dados Pessoais",
      objetivo: "Estabelecer os princípios e regras para o tratamento de dados pessoais sob o PIMS, em conformidade com a LGPD, o GDPR e a ISO/IEC 27701.",
      escopo: "Todas as operações de tratamento de dados pessoais e PII realizadas pela organização, em qualquer meio.",
      referencias: ["ISO/IEC 27701:2019 - Cláusulas 5 a 8", "LGPD - Lei nº 13.709/2018", "GDPR - Regulamento (UE) 2016/679"],
      diretrizes: [
        "Todo tratamento deve possuir base legal documentada, finalidade legítima e específica, e limitação ao mínimo necessário de dados.",
        "O inventário de dados (RoPA/registro do Art. 37 e Art. 30) deve ser mantido atualizado para cada operação de tratamento.",
        "Avaliações de impacto (RIPD/DPIA) são obrigatórias antes de tratamentos de alto risco, conforme critérios definidos.",
        "Privacy by design e by default devem ser demonstrados em novos produtos, projetos e alterações relevantes.",
        "A coleta deve ser precedida de transparência: avisos de privacidade claros com finalidades, bases, prazos e direitos.",
        "Transferências internacionais devem observar os mecanismos adequados (art. 33 LGPD; Capítulo V GDPR) e documentação comprobatória.",
      ],
      responsabilidades: [
        { papel: "Encarregado (DPO)", texto: "Supervisionar o programa, atender titulares e autoridades e reportar à alta direção." },
        { papel: "Gestores de processo", texto: "Manter o inventário e as bases legais de suas operações atualizados." },
        { papel: "Jurídico", texto: "Apoiar a análise de bases legais, contratos e demandas regulatórias." },
      ],
    },
    {
      codigo: "POL-PV-002",
      titulo: "Política de Direitos dos Titulares e Resposta a Incidentes",
      objetivo: "Padronizar o atendimento aos direitos dos titulares e a resposta a incidentes com dados pessoais, incluindo notificação às autoridades nos prazos legais.",
      escopo: "Todas as solicitações de titulares e incidentes envolvendo dados pessoais, independentemente do canal de origem.",
      referencias: ["LGPD - Arts. 18, 19, 46 a 48", "GDPR - Arts. 12 a 22 e 33/34", "ISO/IEC 27701:2019 - 7.5, 8.10"],
      diretrizes: [
        "Solicitações de titulares devem ser respondidas em até 15 dias (LGPD) ou 1 mês (GDPR), com registro da tratativa e da resposta.",
        "A identidade do requerente deve ser verificada antes do fornecimento de qualquer dado.",
        "Incidentes com dados pessoais devem ser comunicados ao DPO imediatamente após a detecção.",
        "A notificação à ANPD e aos titulares (LGPD) ou à autoridade europeia e aos titulares em até 72h (GDPR) deve seguir o fluxo de decisão documentado.",
        "Cada incidente deve gerar análise de causa raiz e plano de ação para evitar recorrência.",
      ],
      responsabilidades: [
        { papel: "DPO", texto: "Conduzir o fluxo de resposta, notificações e comunicação com autoridades." },
        { papel: "Atendimento", texto: "Registrar e encaminhar solicitações dentro dos prazos." },
        { papel: "TI / Segurança", texto: "Conter e investigar incidentes, preservando evidências." },
      ],
    },
  ],
  iso31000: [
    {
      codigo: "POL-RS-001",
      titulo: "Política de Gestão de Riscos",
      objetivo: "Formalizar os princípios, a estrutura e o processo de gestão de riscos da organização, integrando o risco à tomada de decisão em todos os níveis.",
      escopo: "Riscos estratégicos, operacionais, financeiros, de compliance, de segurança da informação e de privacidade.",
      referencias: ["ISO 31000:2018 - Cláusulas 4 a 6", "ISO/IEC 27001:2022 - 6.1.2/6.1.3", "COSO ERM (referência complementar)"],
      diretrizes: [
        "A gestão de riscos deve ser integrada à governança, ao planejamento e aos processos decisórios, e não um exercício isolado.",
        "Critérios de risco (probabilidade, impacto e apetite) devem ser definidos e aprovados pela alta direção, com revisão anual.",
        "A identificação de riscos deve considerar causas, eventos e consequências, com participação das áreas impactadas.",
        "Riscos devem ser avaliados quanto à probabilidade e impacto considerando controles existentes, gerando o risco residual.",
        "Todo risco acima do apetite deve possuir plano de tratamento com responsável, prazo e custo.",
        "Indicadores de risco (KRIs) devem ser monitorados e reportados periodicamente à alta direção.",
      ],
      responsabilidades: [
        { papel: "Alta direção", texto: "Definir o apetite a risco e assegurar recursos para os tratamentos." },
        { papel: "Função de riscos", texto: "Facilitar o processo, consolidar o registro e reportar indicadores." },
        { papel: "Gestores", texto: "Identificar e tratar os riscos de seus processos." },
      ],
    },
    {
      codigo: "PR-RS-001",
      titulo: "Procedimento de Avaliação de Riscos (Matriz 5x5)",
      objetivo: "Detalhar a metodologia de avaliação quantitativa de riscos por meio da matriz 5x5 (probabilidade x impacto), incluindo zonas de risco e regras de escalonamento.",
      escopo: "Todas as avaliações de risco conduzidas no âmbito da Política de Gestão de Riscos.",
      referencias: ["ISO 31000:2018 - 6.4", "ISO/IEC 27005 (técnica de avaliação)"],
      diretrizes: [
        "A escala 1-5 de probabilidade deve considerar histórico, frequência de exposição e eficácia dos controles.",
        "A escala 1-5 de impacto deve avaliar dimensões financeira, reputacional, legal/regulatória e operacional.",
        "Risco = Probabilidade x Impacto (1 a 25); zonas: baixo (1-4), moderado (5-9), alto (10-16), crítico (17-25).",
        "Riscos altos e críticos exigem tratamento obrigatório e RIPD/DPIA quando envolverem dados pessoais.",
        "Avaliações devem ser revisadas quando houver mudança de contexto ou ao menos anualmente.",
      ],
      responsabilidades: [
        { papel: "Facilitador de riscos", texto: "Conduzir workshops de avaliação garantindo consistência metodológica." },
        { papel: "Comitê de riscos", texto: "Validar as avaliações e priorizar o portfólio de tratamentos." },
      ],
    },
  ],
  iso37001: [
    {
      codigo: "POL-AB-001",
      titulo: "Política Antissuborno",
      objetivo: "Declarar o compromisso de tolerância zero com o suborno em todas as suas formas, estabelecendo os controles do sistema de gestão antissuborno conforme a ISO 37001.",
      escopo: "Todas as atividades da organização, incluindo funcionários, dirigentes, terceiros, agentes, parceiros de negócio e subsidiárias.",
      referencias: ["ISO 37001:2016 - Cláusulas 4 a 10", "Lei Anticorrupção - Lei nº 12.846/2013", "UK Bribery Act / FCPA (quando aplicável)"],
      diretrizes: [
        "É proibido oferecer, prometer, dar, solicitar ou aceitar suborno, direta ou indiretamente, no setor público ou privado.",
        "Facilitation payments (pagamentos de facilitação) não são permitidos em nenhuma circunstância.",
        "Due diligence antissuborno é obrigatória para sócios, fornecedores críticos, agentes e intermediários, proporcional ao risco.",
        "Nenhum colaborador sofrerá retaliação por recusar suborno ou reportar suspeitas de boa-fé.",
        "Suspeitas devem ser reportadas ao canal de denúncias ou à função de compliance, com investigação documentada.",
        "Violações sujeitam o infrator a medidas disciplinares, sem prejuízo das sanções legais.",
      ],
      responsabilidades: [
        { papel: "Alta direção", texto: "Demonstrar liderança, aprovar a política e assegurar independência da função de compliance." },
        { papel: "Função de compliance", texto: "Operar o sistema, conduzir due diligences, treinamentos e investigações." },
        { papel: "Todos", texto: "Agir com integridade e reportar suspeitas pelos canais definidos." },
      ],
    },
    {
      codigo: "POL-AB-002",
      titulo: "Política de Brindes, Hospitalidade e Doações",
      objetivo: "Estabelecer limites, regras de aprovação e registro para brindes, hospitalidade, doações e patrocínios, prevenindo o uso indevido dessas práticas para obtenção de vantagens.",
      escopo: "Brindes, refeições, viagens, eventos, doações, patrocínios e contribuições envolvendo agentes públicos ou privados.",
      referencias: ["ISO 37001:2016 - 8.4 e 8.5", "Lei nº 12.846/2013"],
      diretrizes: [
        "Brindes institucionais de valor módico (até R$ 150,00) são permitidos, desde que logotipados e sem expectativa de contrapartida.",
        "Hospitalidade (refeições e eventos) deve ser razoável, documentada e aprovada pelo gestor quando acima do valor módico.",
        "Doações e patrocínios exigem due diligence do beneficiário e aprovação da função de compliance.",
        "É vedada qualquer oferta a agente público sem análise prévia da função de compliance.",
        "Todos os registros devem ser mantidos em sistema próprio, com trilha de auditoria.",
      ],
      responsabilidades: [
        { papel: "Função de compliance", texto: "Aprovar casos acima dos limites e manter o registro central." },
        { papel: "Gestores", texto: "Aprovar despesas dentro dos limites e zelar pelo registro." },
      ],
    },
  ],
  iso37301: [
    {
      codigo: "POL-CP-001",
      titulo: "Política de Compliance e Integridade",
      objetivo: "Instituir o sistema de gestão de compliance, estabelecendo a cultura de integridade, as obrigações de conformidade e os mecanismos de prevenção, detecção e resposta.",
      escopo: "Todas as áreas, processos e níveis hierárquicos da organização, incluindo terceiros que atuem em seu nome.",
      referencias: ["ISO 37301:2021 - Cláusulas 4 a 10", "Lei Anticorrupção - Lei nº 12.846/2013", "LGPD e demais obrigações regulatórias aplicáveis"],
      diretrizes: [
        "As obrigações de compliance (leis, regulamentos, normas e compromissos voluntários) devem ser identificadas, mantidas e comunicadas.",
        "A avaliação de riscos de compliance deve priorizar riscos por probabilidade e impacto, orientando os controles e treinamentos.",
        "A função de compliance deve possuir independência, autoridade e acesso direto à alta direção.",
        "Treinamentos de conduta e integridade são obrigatórios para todos, com trilha de participação e avaliação.",
        "Não conformidades devem ser tratadas com ações corretivas, análise de causa e lições aprendidas.",
        "O descumprimento deliberado desta política constitui falta grave.",
      ],
      responsabilidades: [
        { papel: "Alta direção / Órgão de governança", texto: "Patrocinar o programa, aprovar políticas e analisar indicadores." },
        { papel: "Função de compliance", texto: "Operar o sistema: riscos, controles, treinamentos, canal e investigações." },
        { papel: "Gestores", texto: "Assegurar a conformidade em suas áreas e apoiar as apurações." },
      ],
    },
    {
      codigo: "POL-CP-002",
      titulo: "Política do Canal de Denúncias",
      objetivo: "Garantir um canal seguro, confidencial e acessível para reportar violações reais ou suspeitas, com proteção efetiva ao denunciante.",
      escopo: "Denúncias de empregados, terceiros, fornecedores, clientes e qualquer parte interessada.",
      referencias: ["ISO 37301:2021 - 8.3", "ISO 37001:2016 - 8.9", "Lei nº 13.608/2018 (proteção ao denunciante)"],
      diretrizes: [
        "O canal deve aceitar denúncias anônimas e identificadas, 24 horas por dia, com recibo de protocolo.",
        "É vedada qualquer forma de retaliação ao denunciante de boa-fé, sob pena de sanção disciplinar.",
        "As denúncias devem ser triadas e investigadas por função independente, com prazos definidos.",
        "A confidencialidade da identidade do denunciante deve ser preservada em todo o processo.",
        "Os resultados e estatísticas do canal devem ser reportados periodicamente à alta direção.",
      ],
      responsabilidades: [
        { papel: "Função de compliance", texto: "Operar o canal, conduzir a triagem e coordenar investigações." },
        { papel: "Alta direção", texto: "Assegurar independência do processo e a política de não retaliação." },
      ],
    },
  ],
};

/* ================= montagem do PDF ================= */

const PINE: Cor = [19, 46, 38];
const PINE_DEEP: Cor = [12, 31, 24];
const LIME: Cor = [201, 233, 79];
const CREAM: Cor = [250, 248, 238];
const INK: Cor = [24, 38, 32];
const SOFT: Cor = [76, 91, 82];
const FAINT: Cor = [120, 134, 124];
const SAND: Cor = [221, 214, 191];

interface OpcoesPacote {
  fw: Framework;
  mapa: Record<string, ControleEstado>;
  pct: number;
  empresa: string;
  responsavel: string;
}

export function gerarPacotePdf({ fw, mapa, pct, empresa, responsavel }: OpcoesPacote): void {
  const pdf = new Pdf();
  const M = 56;
  const CW = A4W - M * 2;
  const oficial = pct >= PDF_ADEQUADO_MIN;
  const politicas = POLITICAS[fw.id] ?? [];
  const data = new Date().toLocaleDateString("pt-BR");
  const ano = new Date().getFullYear();
  let y = 0;
  let pagina = 0;
  let numeroPagina = 1;

  const marca = (texto: string) => {
    pdf.texto(A4W / 2, 380, 58, texto, { cor: [236, 232, 219], bold: true, align: "center" });
  };

  const rodape = () => {
    pdf.linha(M, 812, A4W - M, 812, SAND, 0.7);
    pdf.texto(M, 818, 7.5, `${oficial ? "CONTROLADO" : "RASCUNHO"} · ${empresa} · Gerado pelo Radar GRC em ${data}`, { cor: FAINT });
    pdf.texto(A4W - M, 818, 7.5, `Página ${numeroPagina} · ${fw.codigo} v1.0`, { cor: FAINT, align: "right" });
  };

  const topo = () => {
    pdf.retangulo(0, 0, A4W, 30, PINE);
    pdf.retangulo(0, 30, A4W, 1.6, LIME);
    pdf.texto(M, 10, 8, `${fw.codigo} · Pacote Documental`, { cor: LIME, bold: true });
    pdf.texto(A4W - M, 10, 8, oficial ? "CONTROLADO · v1.0" : "RASCUNHO · v1.0", { cor: CREAM, align: "right", bold: true });
    pdf.texto(M, 19.5, 7, `${empresa} — ${data}`, { cor: [180, 205, 192] });
  };

  const novaPagina = () => {
    if (pagina > 0) rodape();
    pdf.novaPagina();
    pagina++;
    numeroPagina++;
    if (!oficial) marca("RASCUNHO");
    topo();
    y = 52;
  };

  const garante = (h: number) => {
    if (y + h > 790) novaPagina();
  };

  const secao = (num: string, titulo: string) => {
    garante(26);
    y += 6;
    pdf.retangulo(M, y, 3, 12, LIME);
    pdf.texto(M + 9, y + 1, 11, `${num}  ${titulo}`, { bold: true, cor: INK });
    y += 20;
  };

  const corpo = (texto: string) => {
    garante(20);
    y = pdf.paragrafo(M, y, 9.5, texto, CW, { cor: SOFT });
    y += 3;
  };

  const bullets = (itens: string[], numerado = false) => {
    for (let i = 0; i < itens.length; i++) {
      garante(18);
      const label = numerado ? `${String(i + 1).padStart(2, "0")}` : "—";
      pdf.texto(M, y, 9, label, { cor: PINE, bold: true });
      y = pdf.paragrafo(M + 22, y, 9, itens[i], CW - 22, { cor: SOFT });
      y += 2;
    }
    y += 2;
  };

  /* ---------- capa ---------- */
  pdf.retangulo(0, 0, A4W, A4H, PINE);
  pdf.circulo(470, 120, 90, [35, 71, 59], 1.4);
  pdf.circulo(470, 120, 62, [35, 71, 59], 1.2);
  pdf.circulo(470, 120, 34, [201, 233, 79], 1.2);
  pdf.linha(470, 120, 535, 55, LIME, 1);
  pdf.linha(0, 640, A4W, 640, [35, 71, 59], 1);
  pdf.retangulo(0, 640, A4W, 4, LIME);
  pdf.retangulo(0, 644, A4W, A4H - 644, PINE_DEEP);

  pdf.texto(M, 90, 9, "SISTEMA DE GESTÃO · DOCUMENTAÇÃO CONTROLADA", { cor: LIME, bold: true });
  pdf.texto(M, 130, 30, "Pacote de Políticas", { cor: CREAM, bold: true });
  y = pdf.paragrafo(M, 175, 15, fw.titulo, CW, { cor: LIME, bold: true });
  y = pdf.paragrafo(M, y + 10, 11, fw.objetivo, CW - 120, { cor: [180, 205, 192] });

  const meta: [string, string][] = [
    ["Norma de referência", fw.codigo],
    ["Organização", empresa],
    ["Elaborado por", responsavel],
    ["Data de emissão", data],
    ["Versão", "1.0"],
    ["Maturidade do programa", `${pct}% — ${oficial ? "documentação oficial aprovada" : "rascunho (concluir implementação)"}`],
    ["Classificação", oficial ? "CONTROLADO" : "RASCUNHO — USO INTERNO"],
  ];
  let my = 400;
  for (const [k, v] of meta) {
    pdf.texto(M, my, 8, k.toUpperCase(), { cor: [140, 170, 152], bold: true });
    y = pdf.paragrafo(M + 170, my - 1, 10.5, v, CW - 170, { cor: CREAM, bold: true });
    my += 26;
  }

  pdf.texto(M, 668, 9, "DISTRIBUIÇÃO CONTROLADA — A reprodução ou distribuição deste pacote fora dos canais aprovados é vedada.", { cor: [140, 170, 152] });
  pdf.texto(M, 690, 8, "Este documento foi gerado automaticamente pelo Radar GRC a partir do estado real do programa de implementação, incluindo evidências de controles no Anexo A.", { cor: [110, 140, 122] });
  rodape();

  /* ---------- sumário ---------- */
  novaPagina();
  pdf.texto(M, y, 18, "Sumário", { bold: true, cor: INK });
  y += 30;
  pdf.linha(M, y - 8, A4W - M, y - 8, SAND, 0.7);
  const itensSumario = [
    ["—", "Sumário"],
    ...politicas.map((p, i) => [p.codigo, p.titulo]),
    ["ANEXO A", "Situação dos controles — evidências do programa"],
    ["ANEXO B", "Controle de alterações e aprovação"],
  ];
  for (const [cod, tit] of itensSumario) {
    garante(20);
    pdf.texto(M, y, 9, cod, { bold: true, cor: PINE });
    pdf.texto(M + 70, y, 9.5, tit, { cor: SOFT });
    y += 18;
  }
  y += 8;
  corpo(`O pacote contém ${politicas.length} documentos de política alinhados à ${fw.codigo}, com o Anexo A refletindo o estado atual dos ${fw.controles.length} controles avaliados no Radar GRC (${pct}% de conformidade na data de emissão).`);

  /* ---------- políticas ---------- */
  for (const pol of politicas) {
    novaPagina();
    /* cabeçalho do documento */
    pdf.retangulo(M, y, CW, 46, PINE);
    pdf.retangulo(M, y, 4, 46, LIME);
    pdf.texto(M + 12, y + 8, 8.5, pol.codigo, { cor: LIME, bold: true });
    y = pdf.paragrafo(M + 12, y + 19, 13, pol.titulo, CW - 24, { cor: CREAM, bold: true });
    y = Math.max(y, 52 + 46);
    pdf.texto(M, y + 8, 8, `Versão 1.0 · Emissão ${data} · Classificação: ${oficial ? "CONTROLADO" : "RASCUNHO"}`, { cor: FAINT, bold: true });
    y += 22;

    secao("1", "Objetivo");
    corpo(pol.objetivo);
    secao("2", "Escopo");
    corpo(pol.escopo);
    secao("3", "Referências normativas");
    bullets(pol.referencias);
    secao("4", "Diretrizes");
    bullets(pol.diretrizes, true);
    secao("5", "Responsabilidades");
    for (const r of pol.responsabilidades) {
      garante(24);
      pdf.texto(M, y, 9.5, r.papel, { bold: true, cor: PINE });
      y = pdf.paragrafo(M, y + 13, 9, r.texto, CW, { cor: SOFT });
      y += 4;
    }
    secao("6", "Vigência e revisão");
    corpo(`Esta política entra em vigor na data de sua aprovação e deve ser revisada ao menos anualmente ou quando ocorrerem mudanças significativas no contexto da organização, nos requisitos aplicáveis ou na avaliação de riscos.`);
  }

  /* ---------- Anexo A: controles ---------- */
  novaPagina();
  pdf.texto(M, y, 18, "Anexo A", { bold: true, cor: INK });
  y += 16;
  pdf.texto(M, y, 11.5, "Situação dos controles — evidências do programa", { bold: true, cor: PINE });
  y += 20;
  corpo(`Estado dos ${fw.controles.length} controles da ${fw.codigo} registrados no Radar GRC na data de emissão. Situações: Não iniciado · Em andamento · Implementado · Verificado.`);
  y += 6;

  const colRef = 62, colDom = 108, colSit = 86, colTit = CW - colRef - colDom - colSit;
  const cabTabela = () => {
    pdf.retangulo(M, y, CW, 17, PINE);
    pdf.texto(M + 5, y + 4.5, 7.5, "REF.", { cor: LIME, bold: true });
    pdf.texto(M + colRef + 5, y + 4.5, 7.5, "CONTROLE", { cor: LIME, bold: true });
    pdf.texto(M + colRef + colTit + 5, y + 4.5, 7.5, "DOMÍNIO", { cor: LIME, bold: true });
    pdf.texto(M + colRef + colTit + colDom + 5, y + 4.5, 7.5, "SITUAÇÃO", { cor: LIME, bold: true });
    y += 17;
  };
  cabTabela();
  const corte = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + "…" : s);
  for (const c of fw.controles) {
    if (y + 16 > 790) {
      novaPagina();
      cabTabela();
    }
    const st = mapa[c.id];
    const estado = st?.estado ?? "nao";
    const metaE = ESTADOS_META[estado];
    const par = fw.controles.indexOf(c) % 2 === 1;
    if (par) pdf.retangulo(M, y, CW, 16, [243, 240, 229]);
    pdf.texto(M + 5, y + 4, 7.5, c.ref, { cor: INK, bold: true });
    pdf.texto(M + colRef + 5, y + 4, 7.5, corte(c.titulo, Math.floor(colTit / 3.9)), { cor: SOFT });
    pdf.texto(M + colRef + colTit + 5, y + 4, 7.5, corte(c.dominio, 16), { cor: SOFT });
    pdf.retangulo(M + colRef + colTit + colDom + 5, y + 2.5, colSit - 12, 11, [236, 232, 219]);
    pdf.texto(M + colRef + colTit + colDom + 10, y + 4, 7, metaE.label.toUpperCase(), { cor: INK, bold: true });
    y += 16;
  }
  pdf.linha(M, y, A4W - M, y, SAND, 0.7);
  y += 10;
  corpo(`Notas de evidência registradas no sistema (quando houver) integram a trilha de auditoria eletrônica e permanecem disponíveis no módulo de Governança ISO do Radar GRC.`);

  /* ---------- Anexo B: alterações e aprovação ---------- */
  novaPagina();
  pdf.texto(M, y, 18, "Anexo B", { bold: true, cor: INK });
  y += 16;
  pdf.texto(M, y, 11.5, "Controle de alterações e aprovação", { bold: true, cor: PINE });
  y += 22;
  pdf.retangulo(M, y, CW, 16, PINE);
  pdf.texto(M + 5, y + 4, 7.5, "VERSÃO", { cor: LIME, bold: true });
  pdf.texto(M + 60, y + 4, 7.5, "DATA", { cor: LIME, bold: true });
  pdf.texto(M + 130, y + 4, 7.5, "DESCRIÇÃO DA ALTERAÇÃO", { cor: LIME, bold: true });
  pdf.texto(A4W - M - 110, y + 4, 7.5, "AUTOR", { cor: LIME, bold: true });
  y += 16;
  pdf.texto(M + 5, y + 4, 8, "1.0", { cor: INK });
  pdf.texto(M + 60, y + 4, 8, data, { cor: SOFT });
  pdf.texto(M + 130, y + 4, 8, "Emissão inicial", { cor: SOFT });
  pdf.texto(A4W - M - 110, y + 4, 8, corte(responsavel, 24), { cor: SOFT });
  y += 20;
  pdf.linha(M, y, A4W - M, y, SAND, 0.7);
  y += 26;

  if (oficial) {
    pdf.texto(M, y, 11.5, "Aprovações", { bold: true, cor: PINE });
    y += 24;
    const boxW = (CW - 20) / 2;
    for (const papel of ["Elaborado por", "Aprovado por"]) {
      const bx = papel === "Elaborado por" ? M : M + boxW + 20;
      pdf.linha(bx, y + 52, bx + boxW, y + 52, INK, 0.8);
      pdf.texto(bx, y + 58, 8.5, papel === "Elaborado por" ? `${papel}: ${responsavel}` : `${papel}: ______________________`, { cor: SOFT });
      pdf.texto(bx, y + 70, 8.5, `Cargo: ______________________`, { cor: SOFT });
      pdf.texto(bx, y + 82, 8.5, `Data: ____ / ____ / ${ano}`, { cor: SOFT });
    }
    y += 100;
    corpo("Documento aprovado para distribuição controlada. A versão vigente encontra-se publicada no repositório oficial do sistema de gestão.");
  } else {
    pdf.retangulo(M, y, CW, 60, [243, 221, 173]);
    y = pdf.paragrafo(
      M + 12,
      y + 10,
      9.5,
      `Documento em RASCUNHO: o programa está com ${pct}% de conformidade (mínimo de ${PDF_ADEQUADO_MIN}% para emissão oficial). Conclua a implementação dos controles pendentes no módulo Governança ISO e gere novamente o pacote para obter a versão CONTROLADO com blocos de aprovação.`,
      CW - 24,
      { cor: INK }
    );
  }

  rodape();
  baixarPdf(`politicas-${fw.id}-v1.pdf`, gerarBytesPdf(pdf));
}
