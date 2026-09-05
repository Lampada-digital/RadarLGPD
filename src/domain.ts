/* =====================================================================
   Domínio consolidado — LGPD, GDPR e frameworks ISO/certificações.
   ===================================================================== */

/* ------------------- LGPD ------------------- */

export interface BaseLegal {
  id: string;
  inciso: string;
  titulo: string;
  artigo: "art7" | "art11";
  descricao: string;
}

export const BASES_ART7: BaseLegal[] = [
  { id: "consentimento", inciso: "Art. 7º, I", titulo: "Consentimento do titular", artigo: "art7", descricao: "Manifestação livre, informada e inequívoca pela qual o titular concorda com o tratamento." },
  { id: "obrigacao-legal", inciso: "Art. 7º, II", titulo: "Obrigação legal ou regulatória", artigo: "art7", descricao: "Cumprimento de obrigação legal ou regulatória pelo controlador." },
  { id: "politicas-publicas", inciso: "Art. 7º, III", titulo: "Políticas públicas", artigo: "art7", descricao: "Execução de políticas públicas previstas em leis e regulamentos." },
  { id: "estudos", inciso: "Art. 7º, IV", titulo: "Estudos por órgão de pesquisa", artigo: "art7", descricao: "Realização de estudos por órgão de pesquisa, com anonimização quando possível." },
  { id: "contrato", inciso: "Art. 7º, V", titulo: "Execução de contrato", artigo: "art7", descricao: "Execução de contrato ou de procedimentos preliminares relacionados a contrato do qual o titular seja parte." },
  { id: "judicial", inciso: "Art. 7º, VI", titulo: "Exercício regular de direitos", artigo: "art7", descricao: "Exercício regular de direitos em processo judicial, administrativo ou arbitral." },
  { id: "vida", inciso: "Art. 7º, VII", titulo: "Proteção da vida", artigo: "art7", descricao: "Proteção da vida ou da incolumidade física do titular ou de terceiro." },
  { id: "saude", inciso: "Art. 7º, VIII", titulo: "Tutela da saúde", artigo: "art7", descricao: "Tutela da saúde, exclusivamente, em procedimento realizado por profissionais de saúde." },
  { id: "legitimo", inciso: "Art. 7º, IX", titulo: "Legítimo interesse", artigo: "art7", descricao: "Interesses legítimos do controlador ou de terceiro, exceto quando prevalecerem direitos do titular." },
  { id: "credito", inciso: "Art. 7º, X", titulo: "Proteção do crédito", artigo: "art7", descricao: "Proteção do crédito, inclusive quanto ao disposto na legislação pertinente." },
];

export const BASES_ART11: BaseLegal[] = [
  { id: "consentimento-sensivel", inciso: "Art. 11, I", titulo: "Consentimento específico (sensível)", artigo: "art11", descricao: "Consentimento específico e em destaque para finalidades específicas." },
  { id: "obrigacao-legal-sensivel", inciso: "Art. 11, II, a", titulo: "Obrigação legal (sensível)", artigo: "art11", descricao: "Cumprimento de obrigação legal ou regulatória pelo controlador." },
  { id: "politicas-publicas-sensivel", inciso: "Art. 11, II, b", titulo: "Políticas públicas (sensível)", artigo: "art11", descricao: "Execução de políticas públicas previstas em leis." },
  { id: "estudos-sensivel", inciso: "Art. 11, II, c", titulo: "Estudos (sensível)", artigo: "art11", descricao: "Estudos por órgão de pesquisa, com anonimização." },
  { id: "contrato-sensivel", inciso: "Art. 11, II, d", titulo: "Contrato (sensível)", artigo: "art11", descricao: "Exercício regular de direitos, inclusive em contrato." },
  { id: "vida-sensivel", inciso: "Art. 11, II, e", titulo: "Proteção da vida (sensível)", artigo: "art11", descricao: "Proteção da vida ou da incolumidade física." },
  { id: "saude-sensivel", inciso: "Art. 11, II, f", titulo: "Tutela da saúde (sensível)", artigo: "art11", descricao: "Tutela da saúde em procedimento por profissionais de saúde." },
];

export const TODAS_BASES = [...BASES_ART7, ...BASES_ART11];

export const SUJEITOS = ["Clientes", "Empregados", "Fornecedores", "Menores", "Pacientes", "Visitantes"];
export const AREAS = ["RH", "Marketing", "Vendas", "Financeiro", "TI", "Jurídico", "Operações", "Atendimento"];
export const MEDIDAS = ["Criptografia em repouso", "Criptografia em trânsito (TLS)", "Pseudonimização", "Anonimização", "Controle de acesso (RBAC)", "Autenticação multifator", "Logs de auditoria", "Backup seguro"];

export interface CategoriaDado {
  id: string;
  label: string;
  sensivel?: boolean;
}

export const CATEGORIAS_DADOS: CategoriaDado[] = [
  { id: "nome", label: "Nome e identificação" },
  { id: "contato", label: "Contato (e-mail, telefone)" },
  { id: "financeiro", label: "Dados financeiros" },
  { id: "emprego", label: "Dados de emprego" },
  { id: "localizacao", label: "Localização" },
  { id: "online", label: "Identificadores online" },
  { id: "saude", label: "Dados de saúde", sensivel: true },
  { id: "biometria", label: "Biometria", sensivel: true },
  { id: "religiao", label: "Convicção religiosa", sensivel: true },
  { id: "politico", label: "Opinião política", sensivel: true },
  { id: "racial", label: "Origem racial ou étnica", sensivel: true },
  { id: "menor", label: "Dados de criança/adolescente", sensivel: true },
];

export const ZONA_META = {
  baixo: { label: "Baixo", fg: "#3c5a2a", bg: "#dfe9cf", dot: "#6f9a45" },
  moderado: { label: "Moderado", fg: "#7a5f14", bg: "#f0e5bd", dot: "#d9a726" },
  alto: { label: "Alto", fg: "#8c3013", bg: "#ecc6b4", dot: "#bd4f26" },
  critico: { label: "Crítico", fg: "#faf8ee", bg: "#132e26", dot: "#bd4f26" },
} as const;

export type Zona = keyof typeof ZONA_META;

export function zonaRisco(score: number): Zona {
  if (score >= 20) return "critico";
  if (score >= 12) return "alto";
  if (score >= 6) return "moderado";
  return "baixo";
}

/* ------------------- tipos de registro ------------------- */

export interface Atividade {
  id: string;
  nome: string;
  area: string;
  responsavel: string;
  finalidade: string;
  baseLegalId: string;
  sujeitos: string[];
  dados: string[];
  retencao: string;
  retencaoJustificativa?: string;
  compartilhamento: string[];
  transferenciaInternacional: boolean;
  medidas: string[];
  probabilidade: number; // 1-5
  impacto: number; // 1-5
  origem: "manual" | "ia";
  criadoEm: string;
  observacoes?: string;
}

export interface Solicitacao {
  id: string;
  titular: string;
  tipo: string;
  canal: string;
  data: string;
  status: "aberta" | "em_andamento" | "concluida";
  resposta?: string;
  regime?: "LGPD" | "GDPR";
}

export interface GdprAtividade {
  id: string;
  nome: string;
  departamento: string;
  finalidades: string;
  baseArt6: string;
  baseArt9?: string;
  titulares: string[];
  dados: string[];
  retencao: string;
  destinatarios: string[];
  transferencia: boolean;
  mecanismoTransferencia?: string;
  medidas: string[];
  risco: 1 | 2 | 3;
  origem: "manual" | "ia";
  criadoEm: string;
}

export const TIPOS_SOLICITACAO = ["Acesso (art. 18, II)", "Correção (art. 18, III)", "Eliminação (art. 18, VI)", "Portabilidade (art. 18, V)", "Revogação de consentimento", "Oposição (art. 18, §2º)"];
export const CANAIS = ["E-mail do DPO", "Formulário do site", "Telefone", "Presencial"];

export const PRAZO_LGPD_DIAS = 15;
export const PRAZO_GDPR_DIAS = 30;
export const prazoDe = (s: { regime?: "LGPD" | "GDPR" }) => (s.regime === "GDPR" ? PRAZO_GDPR_DIAS : PRAZO_LGPD_DIAS);

/* ------------------- GDPR ------------------- */

export interface BaseGdpr {
  id: string;
  ref: string;
  titulo: string;
  artigo: "art6" | "art9";
}

export const BASES_ART6: BaseGdpr[] = [
  { id: "gdpr-consent", ref: "Art. 6(1)(a)", titulo: "Consentimento", artigo: "art6" },
  { id: "gdpr-contrato", ref: "Art. 6(1)(b)", titulo: "Execução de contrato", artigo: "art6" },
  { id: "gdpr-legal", ref: "Art. 6(1)(c)", titulo: "Obrigação legal", artigo: "art6" },
  { id: "gdpr-vital", ref: "Art. 6(1)(d)", titulo: "Interesses vitais", artigo: "art6" },
  { id: "gdpr-publico", ref: "Art. 6(1)(e)", titulo: "Interesse público", artigo: "art6" },
  { id: "gdpr-legitimo", ref: "Art. 6(1)(f)", titulo: "Interesses legítimos", artigo: "art6" },
];

export const BASES_ART9: BaseGdpr[] = [
  { id: "gdpr9-consent", ref: "Art. 9(2)(a)", titulo: "Consentimento explícito", artigo: "art9" },
  { id: "gdpr9-trabalho", ref: "Art. 9(2)(b)", titulo: "Direito do trabalho", artigo: "art9" },
  { id: "gdpr9-saude", ref: "Art. 9(2)(h)", titulo: "Medicina e saúde", artigo: "art9" },
  { id: "gdpr10-criminal", ref: "Art. 10", titulo: "Condenações penais", artigo: "art9" },
];

export const DADOS_GDPR: CategoriaDado[] = [
  { id: "g-nome", label: "Identificação" },
  { id: "g-contato", label: "Contato" },
  { id: "g-financeiro", label: "Financeiro" },
  { id: "g-trabalho", label: "Emprego/RH" },
  { id: "g-online", label: "Identificadores online" },
  { id: "g-imagem", label: "Imagens/CCTV" },
  { id: "g-saude", label: "Saúde", sensivel: true },
  { id: "g-biometria", label: "Biometria", sensivel: true },
  { id: "g-genetico", label: "Genético", sensivel: true },
];

export const TITULARES_GDPR = ["Titulares UE", "Empregados", "Clientes", "Visitantes do site", "Menores"];
export const MECANISMOS_TRANSFERENCIA = ["Decisão de adequação (Art. 45)", "Cláusulas contratuais-tipo (Art. 46)", "Regras corporativas (Art. 47)", "Derrogações (Art. 49)"];
export const TIPOS_DSAR_GDPR = ["Acesso (Art. 15)", "Retificação (Art. 16)", "Apagamento (Art. 17)", "Portabilidade (Art. 20)", "Oposição (Art. 21)"];

/* ------------------- frameworks ISO ------------------- */

export type EstadoIso = "nao" | "andamento" | "impl" | "verif";

export interface ControleIso {
  id: string;
  ref: string;
  titulo: string;
  desc: string;
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

export interface Anexo {
  id: string;
  nome: string;
  tipo: "img" | "doc";
  ext: string;
  tamanho: number;
  dataUrl?: string;
  ts: string;
}

export interface ControleEstado {
  estado: EstadoIso;
  nota?: string;
  ts?: string;
  anexos?: Anexo[];
}

export function fmtTamanho(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const c = (id: string, ref: string, titulo: string, desc: string): ControleIso => ({ id, ref, titulo, desc });

export const FRAMEWORKS: Framework[] = [
  {
    id: "iso27001", codigo: "ISO/IEC 27001:2022", titulo: "SGSI — Segurança da Informação", cor: "#2e6b54",
    objetivo: "Sistema de Gestão de Segurança da Informação certificável.",
    controles: [
      c("27001-41", "4.1", "Contexto da organização", "Questões externas/internas relevantes."),
      c("27001-52", "5.2", "Política de segurança da informação", "Política aprovada e comunicada."),
      c("27001-612", "6.1.2", "Avaliação de riscos", "Critérios de risco e avaliação."),
      c("27001-613", "6.1.3", "Tratamento de riscos e SoA", "Plano de tratamento e SoA."),
      c("27001-92", "9.2", "Auditoria interna", "Programa de auditoria interna."),
      c("27001-a813", "A.8.13", "Backup de informações", "Backups com teste de restauração."),
    ],
  },
  {
    id: "iso27701", codigo: "ISO/IEC 27701:2019", titulo: "PIMS — Gestão de Privacidade", cor: "#7a4f8f",
    objetivo: "Extensão da 27001 para gestão da informação de privacidade (PII).",
    controles: [
      c("27701-2", "5.4", "Política de privacidade", "Política alinhada a LGPD/GDPR."),
      c("27701-4", "7.2", "Mapeamento de fluxos de PII", "Fluxos de PII documentados."),
      c("27701-5", "7.2.5", "DPIA", "Programa de avaliação de impacto."),
      c("27701-7", "7.5", "Direitos dos titulares", "Processos para exercer direitos."),
      c("27701-9", "8.8", "Transferência internacional", "Mecanismos adequados."),
    ],
  },
  {
    id: "iso27002", codigo: "ISO/IEC 27002:2022", titulo: "Controles de Segurança", cor: "#2f7f74",
    objetivo: "Catálogo de controles do Anexo A nas 4 dimensões.",
    controles: [
      c("27002-59", "A.5.9", "Inventário de ativos", "Ativos identificados e classificados."),
      c("27002-515", "A.5.15", "Controle de acesso", "Gestão de identidades e privilégios."),
      c("27002-85", "A.8.5", "Autenticação segura", "MFA e gestão de credenciais."),
      c("27002-813", "A.8.13", "Backup", "Cópias com teste de restauração."),
    ],
  },
  {
    id: "soc2", codigo: "SOC 2 Type II", titulo: "Trust Services Criteria", cor: "#1f4e8f",
    objetivo: "Preparação para o exame SOC 2 Type II.",
    controles: [
      c("soc2-cc11", "CC1.1", "Compromisso com integridade", "Valores éticos e conduta."),
      c("soc2-cc61", "CC6.1", "Controle de acesso lógico", "Autenticação forte e RBAC."),
      c("soc2-cc72", "CC7.2", "Resposta a incidentes", "Monitoramento e resposta."),
      c("soc2-a11", "A1.1", "Disponibilidade", "RTO/RPO e resiliência."),
    ],
  },
  {
    id: "pcidss", codigo: "PCI-DSS v4.0", titulo: "Dados do Cartão", cor: "#bd4f26",
    objetivo: "Conformidade com os requisitos PCI-DSS v4.0.",
    controles: [
      c("pci-1", "Req 1", "Firewall / controles de rede", "Proteção do CDE."),
      c("pci-3", "Req 3", "Proteção de dados armazenados", "Criptografia de PAN."),
      c("pci-8", "Req 8", "Controle de acesso", "Identificação única e MFA."),
      c("pci-12", "Req 12", "Política de segurança", "Política e governança."),
    ],
  },
  {
    id: "iso22301", codigo: "ISO 22301:2019", titulo: "Continuidade de Negócios (BCM)", cor: "#0e7490",
    objetivo: "Sistema de Gestão de Continuidade de Negócios: BIA, planos e exercícios.",
    controles: [
      c("22301-52", "5.2", "Política de continuidade", "Política aprovada e comunicada."),
      c("22301-82", "8.2", "BIA — Análise de impacto", "Atividades críticas, RTO/RPO e impactos."),
      c("22301-84", "8.4", "Estratégias de continuidade", "Soluções dentro dos objetivos de recuperação."),
      c("22301-85", "8.5", "Planos de continuidade", "Resposta, alerta e recuperação."),
      c("22301-86", "8.6", "Exercícios e testes", "Validação periódica dos planos."),
    ],
  },
  {
    id: "iso31000", codigo: "ISO 31000:2018", titulo: "Gestão de Riscos", cor: "#c98a1f",
    objetivo: "Princípios, estrutura e processo de gestão de riscos corporativos.",
    controles: [
      c("31000-52", "5.2", "Liderança e comprometimento", "Mandato da alta direção."),
      c("31000-643", "6.4.3", "Identificação de riscos", "Registro com causas e consequências."),
      c("31000-644", "6.4.4", "Análise de riscos", "Probabilidade x impacto."),
      c("31000-65", "6.5", "Tratamento de riscos", "Planos com responsáveis e residual."),
    ],
  },
  {
    id: "iso37301", codigo: "ISO 37301:2021", titulo: "Gestão de Compliance", cor: "#132e26",
    objetivo: "Cultura de integridade com compliance eficaz e auditável.",
    controles: [
      c("37301-52", "5.2", "Política de compliance", "Objetivos e escopo definidos."),
      c("37301-61", "6.1", "Riscos de compliance", "Riscos priorizados."),
      c("37301-83", "8.3", "Canal de denúncias", "Canal seguro e sem retaliação."),
      c("37301-92", "9.2", "Auditoria interna", "Auditorias periódicas."),
    ],
  },
  {
    id: "iso37001", codigo: "ISO 37001:2016", titulo: "Gestão Antissuborno", cor: "#bd4f26",
    objetivo: "Prevenir, detectar e tratar suborno com sistema verificável.",
    controles: [
      c("37001-52", "5.2", "Política antissuborno", "Tolerância zero comunicada."),
      c("37001-45", "4.5", "Avaliação de riscos de suborno", "Riscos por transação e parceiro."),
      c("37001-82", "8.2", "Due diligence", "Sócios, fornecedores e agentes."),
      c("37001-84", "8.4", "Brindes e hospitalidades", "Limites e registro."),
    ],
  },
  {
    id: "ai-gov", codigo: "Governança de IA", titulo: "ISO/IEC 42001 + AI Act", cor: "#7a4f8f",
    objetivo: "Sistema de Gestão de IA responsável e conforme o EU AI Act.",
    controles: [
      c("ai-42", "4.2", "Política de IA", "Diretrizes aprovadas pela direção."),
      c("ai-61", "6.1", "Riscos de IA", "Avaliação de riscos e impactos."),
      c("ai-82", "8.2", "Avaliação de impacto de IA", "DPIA de IA para alto risco."),
      c("ai-84", "8.4", "Supervisão humana", "Intervenção em decisões críticas."),
      c("ai-50", "AI Act 50", "Transparência", "Sinalização de conteúdo sintético."),
    ],
  },
  {
    id: "cookies", codigo: "Gestão de Cookies", titulo: "ePrivacy + GDPR", cor: "#2f7f74",
    objetivo: "Consentimento e inventário de cookies conforme ePrivacy/GDPR.",
    controles: [
      c("ck-inv", "Art. 5(3)", "Inventário de cookies", "Cookies mapeados e classificados."),
      c("ck-bloq", "ePrivacy", "Bloqueio prévio", "Não essenciais bloqueados até consentimento."),
      c("ck-par", "GDPR Art. 7", "Paridade aceitar/recusar", "Mesma facilidade nas duas opções."),
      c("ck-reg", "GDPR Art. 7(1)", "Prova de consentimento", "Evidência registrada."),
      c("ck-ret", "ePrivacy", "Retirada facilitada", "Retirar tão fácil quanto conceder."),
    ],
  },
];

export function progressoFramework(fw: Framework, iso: Record<string, Record<string, ControleEstado>>) {
  const mapa = iso[fw.id] ?? {};
  let soma = 0;
  const porEstado: Record<EstadoIso, number> = { nao: 0, andamento: 0, impl: 0, verif: 0 };
  fw.controles.forEach((ctl) => {
    const e = mapa[ctl.id]?.estado ?? "nao";
    porEstado[e]++;
    soma += e === "impl" || e === "verif" ? 1 : e === "andamento" ? 0.4 : 0;
  });
  return { pct: Math.round((soma / fw.controles.length) * 100), porEstado };
}

/* ------------------- utilidades ------------------- */

export function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function fmtData(iso: string) {
  if (!iso) return "—";
  const d = new Date(iso.length <= 10 ? iso + "T12:00:00" : iso);
  return d.toLocaleDateString("pt-BR");
}

export function diasDesde(data: string) {
  const inicio = new Date(data + "T00:00:00").getTime();
  return Math.max(0, Math.floor((Date.now() - inicio) / 86400000));
}

/* ------------------- seeds de demonstração ------------------- */

const atras = (d: number) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

export const SEED_ATIVIDADES: Atividade[] = [
  { id: "at1", nome: "Folha de pagamento", area: "RH", responsavel: "Helena Duarte", finalidade: "Processar salários, benefícios e cumprir obrigações trabalhistas e previdenciárias.", baseLegalId: "obrigacao-legal", sujeitos: ["Empregados"], dados: ["nome", "contato", "financeiro", "emprego"], retencao: "5 anos após desligamento", retencaoJustificativa: "prescrição trabalhista", compartilhamento: ["Contabilidade", "INSS"], transferenciaInternacional: false, medidas: ["Criptografia em repouso", "Controle de acesso (RBAC)"], probabilidade: 2, impacto: 3, origem: "ia", criadoEm: atras(40) },
  { id: "at2", nome: "CRM e prospecção", area: "Vendas", responsavel: "Carlos Mendes", finalidade: "Gerenciar leads, pipeline comercial e enviar comunicações de marketing.", baseLegalId: "legitimo", sujeitos: ["Clientes"], dados: ["nome", "contato", "online"], retencao: "24 meses de inatividade", compartilhamento: ["RD Station"], transferenciaInternacional: true, medidas: ["Criptografia em trânsito (TLS)", "Logs de auditoria"], probabilidade: 3, impacto: 3, origem: "ia", criadoEm: atras(25) },
  { id: "at3", nome: "Telemedicina interna", area: "Operações", responsavel: "Dra. Paula Reis", finalidade: "Atendimento médico ocupacional e gestão de atestados de saúde.", baseLegalId: "saude", sujeitos: ["Empregados", "Pacientes"], dados: ["nome", "saude"], retencao: "20 anos", retencaoJustificativa: "prontuário médico", compartilhamento: [], transferenciaInternacional: false, medidas: ["Criptografia em repouso", "Autenticação multifator", "Controle de acesso (RBAC)"], probabilidade: 3, impacto: 5, origem: "manual", criadoEm: atras(12) },
];

export const SEED_SOLICITACOES: Solicitacao[] = [
  { id: "so1", titular: "Ana Beatriz L.", tipo: "Acesso (art. 18, II)", canal: "E-mail do DPO", data: atras(3), status: "em_andamento", regime: "LGPD" },
  { id: "so2", titular: "John Smith (UE)", tipo: "Apagamento (Art. 17)", canal: "Formulário do site", data: atras(10), status: "aberta", regime: "GDPR" },
  { id: "so3", titular: "Pedro A.", tipo: "Portabilidade (art. 18, V)", canal: "E-mail do DPO", data: atras(18), status: "concluida", resposta: "Dados exportados em JSON e enviados por link seguro.", regime: "LGPD" },
];

export const SEED_GDPR: GdprAtividade[] = [
  { id: "g1", nome: "EU Payroll", departamento: "HR", finalidades: "Processamento de salários e obrigações legais de empregados da UE.", baseArt6: "gdpr-contrato", baseArt9: "gdpr9-trabalho", titulares: ["Empregados"], dados: ["g-nome", "g-financeiro", "g-trabalho"], retencao: "6 anos", destinatarios: ["Autoridade fiscal"], transferencia: false, medidas: ["Criptografia em repouso"], risco: 2, origem: "manual", criadoEm: atras(30) },
  { id: "g2", nome: "Newsletter & marketing", departamento: "Marketing", finalidades: "Campanhas segmentadas e remarketing para leads e clientes na UE.", baseArt6: "gdpr-consent", titulares: ["Clientes", "Visitantes do site"], dados: ["g-nome", "g-contato", "g-online"], retencao: "Até retirada do consentimento", destinatarios: ["Mailchimp"], transferencia: true, mecanismoTransferencia: "Cláusulas contratuais-tipo (Art. 46)", medidas: ["Criptografia em trânsito (TLS)"], risco: 2, origem: "ia", criadoEm: atras(15) },
];

export const SEED_ISO: Record<string, Record<string, ControleEstado>> = {
  iso27001: {
    "27001-41": { estado: "impl", ts: atras(60) },
    "27001-52": { estado: "impl", nota: "Política v3 aprovada", ts: atras(50) },
    "27001-612": { estado: "andamento", nota: "Metodologia 5x5", ts: atras(10) },
    "27001-a813": { estado: "verif", ts: atras(20) },
  },
  iso27701: {
    "27701-2": { estado: "impl", ts: atras(45) },
    "27701-4": { estado: "andamento", ts: atras(5) },
  },
  soc2: {
    "soc2-cc11": { estado: "impl", ts: atras(30) },
    "soc2-cc61": { estado: "impl", nota: "MFA + RBAC", ts: atras(20) },
    "soc2-a11": { estado: "impl", ts: atras(15) },
  },
};

export const SEED_CHECKLIST = [
  { id: "ck1", label: "Nomeação do Encarregado (DPO)", artigo: "Art. 41", feito: true },
  { id: "ck2", label: "Registro de operações (RoPA)", artigo: "Art. 37", feito: true },
  { id: "ck3", label: "Programa de conscientização", artigo: "Art. 46", feito: true },
  { id: "ck4", label: "Plano de resposta a incidentes", artigo: "Art. 48", feito: false },
  { id: "ck5", label: "RIPD para alto risco", artigo: "Art. 38", feito: false },
  { id: "ck6", label: "Revisão de contratos com operadores", artigo: "Art. 39", feito: false },
];
