/* ================= Frameworks ISO — programas de implementação ================= */

export type EstadoIso = "nao" | "andamento" | "impl" | "verif";

export interface ControleIso {
  id: string;
  ref: string;
  titulo: string;
  desc: string;
  dominio: string;
}

export interface Framework {
  id: string;
  codigo: string;
  titulo: string;
  objetivo: string;
  cor: string;
  controles: ControleIso[];
}

export const ESTADOS_META: Record<EstadoIso, { label: string; fg: string; bg: string }> = {
  nao: { label: "Não iniciado", fg: "#78867c", bg: "#eae6d5" },
  andamento: { label: "Em andamento", fg: "#7a5f14", bg: "#f3ddad" },
  impl: { label: "Implementado", fg: "#3c5a2a", bg: "#dfe9cf" },
  verif: { label: "Verificado", fg: "#faf8ee", bg: "#132e26" },
};

export interface ControleEstado {
  estado: EstadoIso;
  nota?: string;
  ts?: string;
}

export const progressoFramework = (fw: Framework, iso: Record<string, Record<string, ControleEstado>>) => {
  const mapa = iso[fw.id] ?? {};
  let soma = 0;
  const porEstado: Record<EstadoIso, number> = { nao: 0, andamento: 0, impl: 0, verif: 0 };
  fw.controles.forEach((c) => {
    const e = mapa[c.id]?.estado ?? "nao";
    porEstado[e]++;
    soma += e === "impl" || e === "verif" ? 1 : e === "andamento" ? 0.4 : 0;
  });
  return { pct: Math.round((soma / fw.controles.length) * 100), porEstado };
};

const c = (id: string, ref: string, titulo: string, desc: string, dominio: string): ControleIso => ({ id, ref, titulo, desc, dominio });

export const FRAMEWORKS: Framework[] = [
  {
    id: "iso27001", codigo: "ISO/IEC 27001:2022", titulo: "Sistema de Gestão de Segurança da Informação (SGSI)",
    objetivo: "Estabelecer, operar e melhorar continuamente um SGSI certificável.", cor: "#2e6b54",
    controles: [
      c("27001-41", "4.1", "Contexto da organização", "Determinar questões externas/internas relevantes ao SGSI.", "Contexto"),
      c("27001-42", "4.2", "Partes interessadas", "Identificar requisitos das partes interessadas pertinentes.", "Contexto"),
      c("27001-43", "4.3", "Escopo do SGSI", "Definir limites e aplicabilidade do SGSI documentados.", "Contexto"),
      c("27001-51", "5.1", "Liderança e comprometimento", "Alta direção demonstra liderança quanto ao SGSI.", "Liderança"),
      c("27001-52", "5.2", "Política de segurança da informação", "Política aprovada, comunicada e disponível.", "Liderança"),
      c("27001-53", "5.3", "Papéis e responsabilidades", "Responsabilidades de SI atribuídas e comunicadas.", "Liderança"),
      c("27001-612", "6.1.2", "Avaliação de riscos", "Critérios de risco definidos; avaliação executada e registrada.", "Planejamento"),
      c("27001-613", "6.1.3", "Tratamento de riscos e SoA", "Plano de tratamento e Declaração de Aplicabilidade (SoA).", "Planejamento"),
      c("27001-62", "6.2", "Objetivos de SI", "Objetivos mensuráveis, monitorados e comunicados.", "Planejamento"),
      c("27001-72", "7.2/7.3", "Competência e conscientização", "Programa de treinamento e conscientização em SI.", "Apoio"),
      c("27001-81", "8.1", "Planejamento e controle operacional", "Processos operacionais planejados e controlados.", "Operação"),
      c("27001-92", "9.2", "Auditoria interna", "Programa de auditoria interna do SGSI.", "Avaliação"),
      c("27001-93", "9.3", "Análise crítica pela direção", "Revisão periódica da eficácia do SGSI.", "Avaliação"),
      c("27001-101", "10.1", "Melhoria contínua", "Não conformidades tratadas; ações corretivas eficazes.", "Melhoria"),
      c("27001-a59", "A.5.9", "Inventário de informações e ativos", "Inventário de ativos com proprietários definidos.", "Anexo A — Organizacionais"),
      c("27001-a515", "A.5.15", "Controle de acesso", "Regras de acesso baseadas em papéis e necessidade.", "Anexo A — Organizacionais"),
      c("27001-a524", "A.5.24", "Gestão de incidentes", "Processo de incidente com papéis e notificação.", "Anexo A — Organizacionais"),
      c("27001-a813", "A.8.13", "Backup de informações", "Backups com testes de restauração periódicos.", "Anexo A — Tecnológicos"),
    ],
  },
  {
    id: "iso27002", codigo: "ISO/IEC 27002:2022", titulo: "Controles de segurança da informação",
    objetivo: "Implementar o catálogo de controles do Anexo A nas 4 dimensões.", cor: "#2f7f74",
    controles: [
      c("27002-51", "A.5.1", "Políticas de segurança da informação", "Conjunto de políticas aprovadas e revisadas.", "Organizacionais"),
      c("27002-59", "A.5.9", "Inventário de ativos", "Ativos identificados, classificados e com dono.", "Organizacionais"),
      c("27002-515", "A.5.15", "Controle de acesso", "Gestão de identidades e privilégios mínimos.", "Organizacionais"),
      c("27002-519", "A.5.19", "Segurança com fornecedores", "Requisitos de SI em contratos e avaliações.", "Organizacionais"),
      c("27002-523", "A.5.23", "Segurança em serviços de nuvem", "Gestão do uso seguro de cloud services.", "Organizacionais"),
      c("27002-63", "A.6.3", "Conscientização", "Treinamentos e campanhas de conscientização.", "Pessoas"),
      c("27002-66", "A.6.6", "Acordos de confidencialidade", "NDAs com empregados e terceiros.", "Pessoas"),
      c("27002-74", "A.7.4", "Segurança física", "Perímetros, monitoramento e controle de entrada.", "Físicos"),
      c("27002-82", "A.8.2", "Direitos de acesso privilegiado", "PAM: concessão, revisão e revogação de privilégios.", "Tecnológicos"),
      c("27002-85", "A.8.5", "Autenticação segura", "MFA e gestão de credenciais.", "Tecnológicos"),
      c("27002-89", "A.8.9", "Gestão de configuração", "Baselines e hardening de sistemas.", "Tecnológicos"),
      c("27002-813", "A.8.13", "Backup", "Cópias com proteção e teste de restauração.", "Tecnológicos"),
      c("27002-816", "A.8.16", "Monitoramento", "Monitoramento contínuo de anomalias.", "Tecnológicos"),
      c("27002-825", "A.8.25", "Ciclo de vida de desenvolvimento seguro", "SDLC com requisitos de segurança.", "Tecnológicos"),
      c("27002-828", "A.8.28", "Codificação segura", "Padrões e revisão de código seguro.", "Tecnológicos"),
    ],
  },
  {
    id: "iso27017", codigo: "ISO/IEC 27017:2015", titulo: "Segurança para serviços em nuvem",
    objetivo: "Controles adicionais de SI para provedores e clientes de nuvem.", cor: "#3a6ea5",
    controles: [
      c("27017-1", "Cl. 5-6", "Escopo e papéis na nuvem", "Definir se atua como cliente, provedor ou ambos.", "Governança cloud"),
      c("27017-2", "Cl. 6.1", "Responsabilidades compartilhadas", "Matriz de responsabilidades cliente × provedor.", "Governança cloud"),
      c("27017-3", "Cl. 8.1", "Procedimentos operacionais em nuvem", "Procedimentos documentados para operações cloud.", "Operação cloud"),
      c("27017-4", "Cl. 8.2", "Gestão de mudanças de serviço", "Monitorar mudanças do provedor com impacto em segurança.", "Operação cloud"),
      c("27017-5", "Cl. 9.5", "Segregação de ambientes virtuais", "Isolamento entre ambientes virtuais de clientes.", "Infraestrutura"),
      c("27017-6", "Cl. 10.1", "Seleção de serviços cloud", "Critérios de segurança na contratação de serviços.", "Aquisição"),
      c("27017-7", "Cl. 10.2", "Acordo de serviço", "SLAs com requisitos de segurança e auditoria.", "Aquisição"),
      c("27017-8", "Cl. 12.3", "Administração remota segura", "Canais criptografados para administração.", "Infraestrutura"),
      c("27017-9", "Cl. 12.4", "Segregação de rede do cliente", "Segmentação de rede e VPC por cliente.", "Infraestrutura"),
      c("27017-10", "Cl. 14.2", "Descarte de recursos em nuvem", "Remoção segura de dados ao descontinuar recursos.", "Ciclo de vida"),
      c("27017-11", "Cl. 15.1", "Monitoramento do ambiente virtual", "Monitoramento de atividades em ambientes virtuais.", "Operação cloud"),
    ],
  },
  {
    id: "iso27701", codigo: "ISO/IEC 27701:2019", titulo: "Sistema de Gestão de Privacidade (PIMS)",
    objetivo: "Extensão da 27001 para gestão da informação de privacidade (PII).", cor: "#7a4f8f",
    controles: [
      c("27701-1", "5.2", "Escopo do PIMS", "Extensão do SGSI cobrindo PII e papéis (controlador/operador).", "Governança"),
      c("27701-2", "5.4", "Política de privacidade", "Política alinhada a LGPD/GDPR aprovada.", "Governança"),
      c("27701-3", "5.5", "Papéis de privacidade", "DPO/encarregado com autoridade e independência.", "Governança"),
      c("27701-4", "7.2", "Mapeamento de fluxos de PII", "Fluxos de PII documentados (coleta → descarte).", "Operação"),
      c("27701-5", "7.2.5", "Avaliação de impacto (DPIA)", "Programa de DPIA com critérios de acionamento.", "Operação"),
      c("27701-6", "7.4", "Gestão de consentimento", "Registro e retirada de consentimento auditáveis.", "Operação"),
      c("27701-7", "7.5", "Direitos dos titulares", "Processos para exercer direitos (acesso, apagamento…).", "Operação"),
      c("27701-8", "8.5", "Contratos com operadores", "Cláusulas de proteção de PII com suboperadores.", "Terceiros"),
      c("27701-9", "8.8", "Transferência internacional de PII", "Mecanismos adequados documentados.", "Terceiros"),
      c("27701-10", "9.4", "Notificação de violações", "Prazos e autoridade competente definidos.", "Incidentes"),
      c("27701-11", "6.11", "Privacy by design/default", "Privacidade incorporada em novos projetos.", "Governança"),
    ],
  },
  {
    id: "iso31000", codigo: "ISO 31000:2018", titulo: "Gestão de riscos — Diretrizes",
    objetivo: "Estruturar princípios, estrutura e processo de gestão de riscos.", cor: "#c98a1f",
    controles: [
      c("31000-1", "Cl. 4", "Princípios de gestão de riscos", "Valor protegido e criado; integrada e inclusiva.", "Princípios"),
      c("31000-2", "5.2", "Liderança e comprometimento", "Mandato explícito da alta direção.", "Estrutura"),
      c("31000-3", "5.3", "Integração", "Risco integrado a governança e decisões.", "Estrutura"),
      c("31000-4", "5.4", "Desenho da estrutura", "Responsabilidades, recursos e processos definidos.", "Estrutura"),
      c("31000-5", "5.5", "Implementação", "Plano de implementação do processo de risco.", "Estrutura"),
      c("31000-6", "6.3", "Comunicação e consulta", "Engajamento de partes interessadas.", "Processo"),
      c("31000-7", "6.4", "Escopo, contexto e critérios", "Contexto externo/interno e critérios de risco.", "Processo"),
      c("31000-8", "6.4.3", "Identificação de riscos", "Registro de riscos com causas e consequências.", "Processo"),
      c("31000-9", "6.4.4", "Análise de riscos", "Probabilidade × impacto; cenários e controles.", "Processo"),
      c("31000-10", "6.4.5", "Avaliação de riscos", "Comparação com critérios e priorização.", "Processo"),
      c("31000-11", "6.5", "Tratamento de riscos", "Planos com responsáveis, prazos e residual.", "Processo"),
      c("31000-12", "6.6", "Monitoramento e análise crítica", "Indicadores de risco revisados periodicamente.", "Processo"),
      c("31000-13", "6.7", "Registro e relato", "Relatórios de risco para a governança.", "Processo"),
    ],
  },
  {
    id: "iso37001", codigo: "ISO 37001:2016", titulo: "Gestão antissuborno",
    objetivo: "Prevenir, detectar e tratar suborno com sistema verificável.", cor: "#bd4f26",
    controles: [
      c("37001-1", "5.1", "Liderança antissuborno", "Comprometimento da alta direção e tolerância zero.", "Governança"),
      c("37001-2", "5.2", "Política antissuborno", "Política aprovada, comunicada e disponível.", "Governança"),
      c("37001-3", "5.3", "Função de conformidade antissuborno", "Função com autoridade e independência.", "Governança"),
      c("37001-4", "4.5", "Avaliação de riscos de suborno", "Riscos mapeados por transação, país e parceiro.", "Riscos"),
      c("37001-5", "8.2", "Due diligence", "Due diligence de sócios, fornecedores e agentes.", "Controles"),
      c("37001-6", "8.3", "Controles financeiros", "Aprovações, segregação de funções e limites.", "Controles"),
      c("37001-7", "8.4", "Controles não financeiros", "Compras, doações, patrocínios e brindes.", "Controles"),
      c("37001-8", "8.5", "Brindes, hospitalidade e doações", "Política com limites e registro.", "Controles"),
      c("37001-9", "7.3", "Conscientização e treinamento", "Treinamento antissuborno periódico.", "Pessoas"),
      c("37001-10", "8.9", "Canal de denúncias", "Canal anônimo com proteção contra retaliação.", "Pessoas"),
      c("37001-11", "8.10", "Investigações", "Procedimento de investigação de suspeitas.", "Monitoramento"),
      c("37001-12", "9.2", "Auditoria interna antissuborno", "Auditorias periódicas do sistema.", "Monitoramento"),
    ],
  },
  {
    id: "iso37301", codigo: "ISO 37301:2021", titulo: "Sistema de gestão de compliance",
    objetivo: "Cultura de integridade com compliance eficaz e auditável.", cor: "#132e26",
    controles: [
      c("37301-1", "4.1/4.2", "Contexto e obrigações de compliance", "Requisitos legais e normativos identificados.", "Contexto"),
      c("37301-2", "5.1", "Liderança e comprometimento", "Governança demonstra cultura de integridade.", "Liderança"),
      c("37301-3", "5.2", "Política de compliance", "Política com objetivos e escopo definidos.", "Liderança"),
      c("37301-4", "5.3", "Função de compliance", "Função independente com acesso à governança.", "Liderança"),
      c("37301-5", "6.1", "Avaliação de riscos de compliance", "Riscos priorizados por probabilidade e impacto.", "Planejamento"),
      c("37301-6", "6.2", "Objetivos e planejamento", "Objetivos mensuráveis com planos de ação.", "Planejamento"),
      c("37301-7", "7.2/7.3", "Competência e conscientização", "Treinamentos obrigatórios de conduta.", "Apoio"),
      c("37301-8", "7.4", "Comunicação", "Comunicação interna/externa de compliance.", "Apoio"),
      c("37301-9", "8.1", "Controles operacionais", "Controles proporcionais aos riscos (due diligence, aprovações).", "Operação"),
      c("37301-10", "8.3", "Canal de denúncias", "Canal seguro, anônimo e sem retaliação.", "Operação"),
      c("37301-11", "9.1/9.2", "Monitoramento e auditoria", "KPIs de compliance e auditoria interna.", "Avaliação"),
      c("37301-12", "10.1/10.2", "Melhoria e não conformidades", "Ações corretivas e lições aprendidas.", "Melhoria"),
    ],
  },
  {
    id: "soc2", codigo: "SOC 2 Type II", titulo: "Trust Services Criteria (AICPA)",
    objetivo: "Demonstrar controles de segurança, disponibilidade, integridade, confidencialidade e privacidade em relatório de auditoria.", cor: "#0e7490",
    controles: [
      c("soc2-cc11", "CC1.1", "Integridade e valores éticos", "Compromisso da organização com integridade e valores éticos.", "Ambiente de controle"),
      c("soc2-cc12", "CC1.2", "Independência do conselho", "Conselho/comitê independente supervisiona a governança.", "Ambiente de controle"),
      c("soc2-cc13", "CC1.3", "Estrutura e responsabilidades", "Estrutura organizacional, autoridade e responsabilidades definidas.", "Ambiente de controle"),
      c("soc2-cc14", "CC1.4", "Compromisso com competência", "Atração, desenvolvimento e retenção de pessoas competentes.", "Ambiente de controle"),
      c("soc2-cc21", "CC2.1", "Comunicação de informações", "Informações de qualidade comunicadas interna e externamente.", "Informação e comunicação"),
      c("soc2-cc31", "CC3.1", "Processo de avaliação de riscos", "Riscos ao alcance dos objetivos identificados e avaliados.", "Avaliação de riscos"),
      c("soc2-cc32", "CC3.2", "Risco de fraude", "Risco de fraude considerado na avaliação de riscos.", "Avaliação de riscos"),
      c("soc2-cc41", "CC4.1", "Atividades de monitoramento", "Avaliações contínuas e separadas dos controles.", "Monitoramento"),
      c("soc2-cc51", "CC5.1", "Seleção de atividades de controle", "Controles selecionados para mitigar riscos a nível aceitável.", "Atividades de controle"),
      c("soc2-cc61", "CC6.1", "Segurança de acesso lógico", "Acesso lógico protegido contra acesso não autorizado.", "Acesso lógico"),
      c("soc2-cc66", "CC6.6", "Criptografia e proteção de perímetro", "Medidas contra ameaças externas e criptografia de dados.", "Acesso lógico"),
      c("soc2-cc72", "CC7.2", "Resposta a incidentes", "Monitoramento e resposta a anomalias e incidentes.", "Operações"),
      c("soc2-cc81", "CC8.1", "Gestão de mudanças", "Mudanças autorizadas, testadas e aprovadas antes da produção.", "Operações"),
      c("soc2-a11", "A1.1", "Disponibilidade — resiliência", "Recuperação e capacidade para atender metas de disponibilidade.", "Critérios adicionais"),
      c("soc2-pi11", "PI1.1", "Integridade de processamento", "Processamento completo, válido, preciso e autorizado.", "Critérios adicionais"),
      c("soc2-c11", "C1.1", "Confidencialidade", "Informação confidencial protegida durante todo o ciclo.", "Critérios adicionais"),
      c("soc2-p11", "P1.1", "Privacidade", "Aviso de privacidade e consentimento para dados pessoais.", "Critérios adicionais"),
    ],
  },
  {
    id: "pcidss", codigo: "PCI-DSS v4.0", titulo: "Segurança de Dados do Cartão de Pagamento",
    objetivo: "Proteger dados do titular do cartão (CHD) e atingir a conformidade para processamento de pagamentos.", cor: "#9d2933",
    controles: [
      c("pci-1", "Req 1", "Controles de segurança de rede", "Instalar e manter firewalls e controles de segurança de rede.", "Requisitos PCI-DSS"),
      c("pci-2", "Req 2", "Configurações seguras", "Aplicar configurações seguras a todos os componentes.", "Requisitos PCI-DSS"),
      c("pci-3", "Req 3", "Proteger dados de conta armazenados", "Proteger o CHD armazenado (mascarar PAN, criptografar).", "Requisitos PCI-DSS"),
      c("pci-4", "Req 4", "Criptografia em trânsito", "Criptografar transmissão de CHD em redes abertas.", "Requisitos PCI-DSS"),
      c("pci-5", "Req 5", "Proteção contra malware", "Proteger sistemas e redes contra software malicioso.", "Requisitos PCI-DSS"),
      c("pci-6", "Req 6", "Sistemas e software seguros", "Desenvolver e manter sistemas e aplicações seguras.", "Requisitos PCI-DSS"),
      c("pci-7", "Req 7", "Acesso por necessidade de conhecer", "Restringir acesso aos dados por necessidade de negócio.", "Requisitos PCI-DSS"),
      c("pci-8", "Req 8", "Identificação e autenticação", "Identificar usuários e autenticar acesso (MFA).", "Requisitos PCI-DSS"),
      c("pci-9", "Req 9", "Acesso físico restrito", "Restringir acesso físico aos dados do titular.", "Requisitos PCI-DSS"),
      c("pci-10", "Req 10", "Logs e monitoramento", "Registrar e monitorar todo acesso a sistemas e CHD.", "Requisitos PCI-DSS"),
      c("pci-11", "Req 11", "Testes de segurança", "Testar regularmente a segurança de sistemas e redes.", "Requisitos PCI-DSS"),
      c("pci-12", "Req 12", "Políticas e programa de SI", "Apoiar a segurança com políticas e programa organizacional.", "Requisitos PCI-DSS"),
    ],
  },
  {
    id: "ai-gov", codigo: "Governança de IA", titulo: "Sistema de Gestão de IA (ISO/IEC 42001 + EU AI Act)",
    objetivo: "Operar um SGIA com gestão de riscos, transparência e supervisão humana para sistemas de IA confiáveis.", cor: "#7e22ce",
    controles: [
      c("ai-41", "4.1/4.2", "Contexto e partes interessadas (IA)", "Questões e requisitos das partes interessadas em IA mapeados.", "SGIA (ISO 42001)"),
      c("ai-52", "5.2", "Política de IA", "Política de IA aprovada, comunicada e disponível.", "SGIA (ISO 42001)"),
      c("ai-53", "5.3", "Papéis e responsabilidades de IA", "Funções de governança de IA com autoridade definidas.", "SGIA (ISO 42001)"),
      c("ai-61", "6.1", "Avaliação de riscos e oportunidades de IA", "Riscos de IA avaliados com critérios documentados.", "SGIA (ISO 42001)"),
      c("ai-71", "7.1/7.2", "Competência e conscientização em IA", "Treinamento em uso responsável de IA.", "SGIA (ISO 42001)"),
      c("ai-82", "8.2", "Avaliação de riscos de sistemas de IA", "Riscos específicos de cada sistema de IA avaliados.", "Operação"),
      c("ai-84", "8.4", "Avaliação de impacto de IA", "Impactos em pessoas e sociedade avaliados antes do uso.", "Operação"),
      c("ai-85", "8.5", "Ciclo de vida de sistemas de IA", "Controles aplicados em projeto, treino, teste e produção.", "Operação"),
      c("ai-a8", "A.8", "Dados para sistemas de IA", "Governança de dados de treino (qualidade, viés, consentimento).", "Anexos ISO 42001"),
      c("ai-a10", "A.10", "Uso de sistemas de IA", "Uso de IA de terceiros e por usuários governado.", "Anexos ISO 42001"),
      c("eu-1", "Art. 6", "Classificação de risco (EU AI Act)", "Sistemas classificados (proibido/alto/limitado/mínimo).", "EU AI Act"),
      c("eu-2", "Art. 9-15", "Gestão de risco e dados (alto risco)", "Gestão de risco, dados e documentação técnica para alto risco.", "EU AI Act"),
      c("eu-3", "Art. 14", "Supervisão humana", "Mecanismos de supervisão humana eficazes implementados.", "EU AI Act"),
      c("eu-4", "Art. 50", "Transparência", "Obrigações de transparência para IA que interage com pessoas.", "EU AI Act"),
    ],
  },
  {
    id: "cookies", codigo: "Gestão de Cookies", titulo: "Consentimento e Cookies de Site (ePrivacy + GDPR)",
    objetivo: "Operar um programa de consentimento e cookies conforme ePrivacy/GDPR e guias das autoridades (CNIL, ANPD, EDPB).", cor: "#d97706",
    controles: [
      c("ck-1", "INV", "Inventário de cookies", "Todos os cookies e trackers mapeados (nome, tipo, fornecedor, duração, categoria).", "Inventário"),
      c("ck-2", "CLS", "Classificação por categoria", "Cookies classificados (estritamente necessários, funcionais, analíticos, publicidade).", "Inventário"),
      c("ck-3", "CMP", "Plataforma de gestão de consentimento", "CMP implementada para captura e registro de consentimento.", "Consentimento"),
      c("ck-4", "BNR", "Banner de consentimento", "Banner com recusar tão fácil quanto aceitar (paridade).", "Consentimento"),
      c("ck-5", "GRN", "Granularidade por categoria", "Consentimento granular, separado por categoria de finalidade.", "Consentimento"),
      c("ck-6", "BLK", "Bloqueio prévio", "Cookies não essenciais bloqueados antes do consentimento.", "Consentimento"),
      c("ck-7", "PRF", "Prova de consentimento", "Logs de consentimento (quem, quando, o quê) armazenados.", "Conformidade"),
      c("ck-8", "WDL", "Retirada de consentimento", "Retirada de consentimento tão fácil quanto a concessão.", "Consentimento"),
      c("ck-9", "TRD", "Terceiros e transferências", "Cookies de terceiros e transferências internacionais avaliados.", "Conformidade"),
      c("ck-10", "POL", "Política de cookies", "Política de cookies transparente e acessível publicada.", "Transparência"),
      c("ck-11", "RET", "Retenção e revisão", "Prazos de retenção definidos e inventário revisado periodicamente.", "Operação"),
      c("ck-12", "AUD", "Auditoria de conformidade", "Auditoria periódica de cookies e conformidade ePrivacy/GDPR.", "Operação"),
    ],
  },
];

/* Estado inicial de demonstração (dados de exemplo) */
export const SEED_ISO: Record<string, Record<string, ControleEstado>> = {
  iso27001: {
    "27001-41": { estado: "impl", nota: "Análise SWOT documentada", ts: "2025-11-02" },
    "27001-42": { estado: "impl", ts: "2025-11-02" },
    "27001-51": { estado: "verif", nota: "Comitê de SI mensal", ts: "2025-11-10" },
    "27001-52": { estado: "impl", nota: "Política v3 aprovada", ts: "2025-10-20" },
    "27001-612": { estado: "andamento", nota: "Metodologia 5x5 em curso", ts: "2025-12-01" },
    "27001-613": { estado: "andamento", ts: "2025-12-01" },
    "27001-a813": { estado: "impl", ts: "2025-09-15" },
  },
  iso27701: {
    "27701-1": { estado: "impl", ts: "2025-10-05" },
    "27701-2": { estado: "impl", ts: "2025-10-05" },
    "27701-3": { estado: "verif", nota: "DPO nomeada e publicada", ts: "2025-10-12" },
    "27701-4": { estado: "andamento", ts: "2025-12-02" },
    "27701-7": { estado: "andamento", nota: "Fluxo de DSAR em homologação", ts: "2025-12-02" },
  },
  iso31000: {
    "31000-2": { estado: "impl", ts: "2025-09-28" },
    "31000-8": { estado: "andamento", nota: "Workshop de riscos agendado", ts: "2025-12-05" },
  },
  iso37301: {
    "37301-1": { estado: "andamento", ts: "2025-11-20" },
    "37301-4": { estado: "impl", ts: "2025-11-18" },
  },
  soc2: {
    "soc2-cc11": { estado: "impl", ts: "2025-10-01" },
    "soc2-cc13": { estado: "impl", ts: "2025-10-01" },
    "soc2-cc61": { estado: "impl", nota: "MFA + RBAC em produção", ts: "2025-10-15" },
    "soc2-cc66": { estado: "verif", ts: "2025-11-01" },
    "soc2-cc81": { estado: "andamento", ts: "2025-12-01" },
    "soc2-a11": { estado: "impl", nota: "RTO/RPO definidos", ts: "2025-11-20" },
    "soc2-p11": { estado: "andamento", ts: "2025-12-05" },
  },
  pcidss: {
    "pci-1": { estado: "impl", ts: "2025-09-10" },
    "pci-3": { estado: "impl", nota: "PAN mascarado, vault tokenizado", ts: "2025-09-25" },
    "pci-4": { estado: "impl", ts: "2025-09-25" },
    "pci-8": { estado: "verif", ts: "2025-10-30" },
    "pci-10": { estado: "andamento", nota: "SIEM em implantação", ts: "2025-12-02" },
    "pci-12": { estado: "impl", ts: "2025-10-05" },
  },
  "ai-gov": {
    "ai-52": { estado: "impl", ts: "2025-11-05" },
    "ai-61": { estado: "andamento", ts: "2025-12-03" },
    "eu-1": { estado: "impl", nota: "Matriz de classificação de risco", ts: "2025-11-15" },
    "eu-3": { estado: "andamento", ts: "2025-12-04" },
  },
  cookies: {
    "ck-1": { estado: "verif", nota: "62 cookies inventariados", ts: "2025-10-12" },
    "ck-2": { estado: "verif", ts: "2025-10-12" },
    "ck-3": { estado: "impl", nota: "CMP OneTrust ativa", ts: "2025-10-20" },
    "ck-4": { estado: "impl", ts: "2025-10-20" },
    "ck-5": { estado: "impl", ts: "2025-10-22" },
    "ck-6": { estado: "impl", ts: "2025-10-25" },
    "ck-7": { estado: "impl", ts: "2025-10-25" },
    "ck-8": { estado: "impl", ts: "2025-11-01" },
    "ck-10": { estado: "verif", ts: "2025-11-10" },
    "ck-11": { estado: "impl", ts: "2025-11-10" },
    "ck-12": { estado: "andamento", ts: "2025-12-06" },
  },
};
