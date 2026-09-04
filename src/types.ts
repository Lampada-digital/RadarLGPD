/* ================= Domínio LGPD ================= */

export interface BaseLegal {
  id: string;
  inciso: string;
  artigo: "art7" | "art11";
  titulo: string;
  descricao: string;
}

export const BASES_ART7: BaseLegal[] = [
  { id: "consentimento", inciso: "Art. 7º, I", artigo: "art7", titulo: "Consentimento do titular", descricao: "Manifestação livre, informada e inequívoca pela qual o titular concorda com o tratamento para finalidade determinada." },
  { id: "obrigacao-legal", inciso: "Art. 7º, II", artigo: "art7", titulo: "Obrigação legal ou regulatória", descricao: "Cumprimento de obrigação legal ou regulatória pelo controlador (ex.: eSocial, obrigações trabalhistas e fiscais)." },
  { id: "politicas-publicas", inciso: "Art. 7º, III", artigo: "art7", titulo: "Políticas públicas", descricao: "Execução de políticas públicas previstas em leis e regulamentos ou respaldadas em contratos e convênios." },
  { id: "pesquisa", inciso: "Art. 7º, IV", artigo: "art7", titulo: "Estudos por órgão de pesquisa", descricao: "Realização de estudos, garantida, sempre que possível, a anonimização dos dados pessoais." },
  { id: "contrato", inciso: "Art. 7º, V", artigo: "art7", titulo: "Execução de contrato", descricao: "Execução de contrato ou de procedimentos preliminares relacionados a contrato do qual o titular seja parte." },
  { id: "processo-judicial", inciso: "Art. 7º, VI", artigo: "art7", titulo: "Exercício regular de direitos", descricao: "Exercício regular de direitos em processo judicial, administrativo ou arbitral." },
  { id: "protecao-vida", inciso: "Art. 7º, VII", artigo: "art7", titulo: "Proteção da vida", descricao: "Proteção da vida ou da incolumidade física do titular ou de terceiro." },
  { id: "saude", inciso: "Art. 7º, VIII", artigo: "art7", titulo: "Tutela da saúde", descricao: "Procedimento realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária." },
  { id: "legitimo-interesse", inciso: "Art. 7º, IX", artigo: "art7", titulo: "Legítimo interesse", descricao: "Interesses legítimos do controlador ou de terceiro, exceto quando prevalecerem direitos e liberdades fundamentais do titular." },
  { id: "credito", inciso: "Art. 7º, X", artigo: "art7", titulo: "Proteção ao crédito", descricao: "Tratamento para proteção do crédito, inclusive quanto ao disposto na legislação pertinente." },
];

export const BASES_ART11: BaseLegal[] = [
  { id: "consentimento-sensivel", inciso: "Art. 11, I, a", artigo: "art11", titulo: "Consentimento específico e destacado", descricao: "Consentimento específico e em destaque para finalidades específicas, quando o tratamento envolver dados sensíveis." },
  { id: "obrigacao-legal-sensivel", inciso: "Art. 11, II, a", artigo: "art11", titulo: "Obrigação legal (sensíveis)", descricao: "Cumprimento de obrigação legal ou regulatória pelo controlador envolvendo dados sensíveis." },
  { id: "politicas-publicas-sensivel", inciso: "Art. 11, II, b", artigo: "art11", titulo: "Políticas públicas (sensíveis)", descricao: "Execução de políticas públicas previstas em leis, com publicidade do tratamento." },
  { id: "pesquisa-sensivel", inciso: "Art. 11, II, c", artigo: "art11", titulo: "Pesquisa (sensíveis)", descricao: "Estudos por órgão de pesquisa, garantida, sempre que possível, a anonimização." },
  { id: "direitos-sensivel", inciso: "Art. 11, II, d", artigo: "art11", titulo: "Exercício de direitos (sensíveis)", descricao: "Exercício regular de direitos, inclusive em contrato e em processo judicial, administrativo ou arbitral." },
  { id: "protecao-vida-sensivel", inciso: "Art. 11, II, e", artigo: "art11", titulo: "Proteção da vida (sensíveis)", descricao: "Proteção da vida ou da incolumidade física do titular ou de terceiro." },
  { id: "saude-sensivel", inciso: "Art. 11, II, f", artigo: "art11", titulo: "Tutela da saúde (sensíveis)", descricao: "Procedimento realizado por profissionais de saúde, serviços de saúde ou autoridade sanitária." },
  { id: "prevencao-fraude", inciso: "Art. 11, II, g", artigo: "art11", titulo: "Prevenção à fraude", descricao: "Garantia da prevenção à fraude e à segurança do titular nos processos de identificação e autenticação." },
];

export const TODAS_BASES = [...BASES_ART7, ...BASES_ART11];

export interface CategoriaDado {
  id: string;
  label: string;
  sensivel?: boolean;
}

export const CATEGORIAS_DADOS: CategoriaDado[] = [
  { id: "nome", label: "Nome completo" },
  { id: "cpf", label: "CPF" },
  { id: "rg", label: "RG / Documento de identidade" },
  { id: "nascimento", label: "Data de nascimento" },
  { id: "email", label: "E-mail" },
  { id: "telefone", label: "Telefone" },
  { id: "endereco", label: "Endereço / CEP" },
  { id: "foto", label: "Fotografia / Imagem" },
  { id: "camera", label: "Gravação de CFTV" },
  { id: "curriculo", label: "Currículo / Experiência" },
  { id: "financeiro", label: "Dados financeiros / Salariais" },
  { id: "bancario", label: "Dados bancários" },
  { id: "consumo", label: "Histórico de consumo" },
  { id: "localizacao", label: "Geolocalização" },
  { id: "ip", label: "Endereço IP / Dispositivo" },
  { id: "cookies", label: "Cookies / Identificadores" },
  { id: "assinatura", label: "Assinatura" },
  { id: "placa", label: "Placa de veículo" },
  { id: "saude", label: "Dados de saúde", sensivel: true },
  { id: "biometria", label: "Biometria / Reconhecimento facial", sensivel: true },
  { id: "religiao", label: "Convicção religiosa", sensivel: true },
  { id: "racial", label: "Origem racial ou étnica", sensivel: true },
  { id: "politico", label: "Opinião política / sindical", sensivel: true },
  { id: "menor", label: "Dados de crianças e adolescentes", sensivel: true },
];

export const SUJEITOS = ["Clientes", "Colaboradores", "Candidatos", "Fornecedores", "Visitantes", "Menores de idade", "Usuários do site"];

export const AREAS = ["RH", "Comercial", "Marketing", "Financeiro", "TI", "Jurídico", "Operações", "Atendimento"];

export const MEDIDAS = [
  "Criptografia em repouso",
  "Criptografia em trânsito (TLS)",
  "Controle de acesso por perfil (RBAC)",
  "Autenticação multifator (MFA)",
  "Registro de auditoria (logs)",
  "Anonimização / Pseudonimização",
  "Acordo de confidencialidade (NDA)",
  "Política de retenção e descarte",
  "Backup com teste de restauração",
  "Avaliação de impacto (RIPD/DPIA)",
  "Segurança física das instalações",
  "Treinamento periódico da equipe",
];

/* ================= Registros ================= */

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
  retencaoJustificativa: string;
  compartilhamento: string[];
  transferenciaInternacional: boolean;
  medidas: string[];
  probabilidade: number; // 1-5
  impacto: number; // 1-5
  origem: "manual" | "ia";
  criadoEm: string;
  observacoes?: string;
}

export type StatusSolicitacao = "aberta" | "em_andamento" | "concluida";

export interface Solicitacao {
  id: string;
  titular: string;
  canal: string;
  tipo: string;
  data: string; // ISO
  status: StatusSolicitacao;
  resposta?: string;
}

export interface ItemChecklist {
  id: string;
  label: string;
  artigo: string;
  feito: boolean;
}

/* ================= Constantes auxiliares ================= */

export const TIPOS_SOLICITACAO = [
  "Acesso aos dados",
  "Correção de dados incompletos ou inexatos",
  "Eliminação de dados",
  "Anonimização / bloqueio",
  "Portabilidade",
  "Revogação do consentimento",
  "Informação sobre compartilhamento",
];

export const CANAIS = ["Portal do titular", "E-mail (encarregado)", "Telefone / SAC", "Presencial"];

export const PRAZO_LGPD_DIAS = 15; // Art. 19, §2º

export const riscoScore = (p: number, i: number) => p * i;

export type ZonaRisco = "baixo" | "moderado" | "alto" | "critico";

export function zonaRisco(score: number): ZonaRisco {
  if (score <= 4) return "baixo";
  if (score <= 9) return "moderado";
  if (score <= 16) return "alto";
  return "critico";
}

export const ZONA_META: Record<ZonaRisco, { label: string; bg: string; fg: string; dot: string }> = {
  baixo: { label: "Baixo", bg: "#dfe9cf", fg: "#3c5a2a", dot: "#6f9a45" },
  moderado: { label: "Moderado", bg: "#f0e5bd", fg: "#7a5f14", dot: "#d9a726" },
  alto: { label: "Alto", bg: "#f2d4bd", fg: "#8a4a17", dot: "#d97c2b" },
  critico: { label: "Crítico", bg: "#ecc6b4", fg: "#8c3013", dot: "#bd4f26" },
};

export const fmtData = (iso: string) =>
  new Date(iso + (iso.length === 10 ? "T12:00:00" : "")).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });

export const diasDesde = (iso: string) => Math.floor((Date.now() - new Date(iso + "T12:00:00").getTime()) / 86400000);

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36));

/* ================= Dados iniciais ================= */

const hoje = () => new Date().toISOString().slice(0, 10);
const atras = (d: number) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

export const SEED_ATIVIDADES: Atividade[] = [
  {
    id: uid(), nome: "Folha de pagamento e encargos", area: "RH", responsavel: "Helena Duarte",
    finalidade: "Processamento de folha, benefícios e obrigações trabalhistas dos colaboradores.",
    baseLegalId: "obrigacao-legal", sujeitos: ["Colaboradores"], dados: ["nome", "cpf", "rg", "nascimento", "endereco", "bancario", "financeiro"],
    retencao: "Enquanto durar o vínculo + 30 anos", retencaoJustificativa: "Prazos prescricionais trabalhistas e previdenciários.",
    compartilhamento: ["eSocial / Receita Federal", "Operadora de benefícios"], transferenciaInternacional: false,
    medidas: ["Controle de acesso por perfil (RBAC)", "Criptografia em repouso", "Registro de auditoria (logs)", "Política de retenção e descarte"],
    probabilidade: 2, impacto: 4, origem: "manual", criadoEm: atras(40),
  },
  {
    id: uid(), nome: "Recrutamento e seleção", area: "RH", responsavel: "Paulo Andrade",
    finalidade: "Triagem de currículos, entrevistas e avaliação de candidatos às vagas abertas.",
    baseLegalId: "contrato", sujeitos: ["Candidatos"], dados: ["nome", "email", "telefone", "curriculo", "foto"],
    retencao: "12 meses após o encerramento do processo", retencaoJustificativa: "Banco de talentos com consentimento renovável.",
    compartilhamento: ["Plataforma ATS (Gupy)"], transferenciaInternacional: false,
    medidas: ["Controle de acesso por perfil (RBAC)", "Acordo de confidencialidade (NDA)", "Política de retenção e descarte"],
    probabilidade: 3, impacto: 2, origem: "ia", criadoEm: atras(32),
  },
  {
    id: uid(), nome: "Campanhas de marketing digital", area: "Marketing", responsavel: "Beatriz Campos",
    finalidade: "Envio de newsletter, promoções segmentadas e remarketing para leads e clientes.",
    baseLegalId: "consentimento", sujeitos: ["Clientes", "Usuários do site"], dados: ["nome", "email", "consumo", "cookies", "ip"],
    retencao: "Até a revogação do consentimento", retencaoJustificativa: "Opt-out disponível em todos os canais.",
    compartilhamento: ["RD Station", "Meta Ads"], transferenciaInternacional: true,
    medidas: ["Criptografia em trânsito (TLS)", "Política de retenção e descarte", "Treinamento periódico da equipe"],
    probabilidade: 3, impacto: 3, origem: "ia", criadoEm: atras(25),
  },
  {
    id: uid(), nome: "Vendas e faturamento", area: "Comercial", responsavel: "Ricardo Sales",
    finalidade: "Emissão de pedidos, notas fiscais e cobrança de clientes pessoa física e jurídica.",
    baseLegalId: "contrato", sujeitos: ["Clientes"], dados: ["nome", "cpf", "email", "telefone", "endereco", "consumo", "financeiro"],
    retencao: "5 anos", retencaoJustificativa: "Prazo prescricional tributário e civil.",
    compartilhamento: ["SEFAZ", "Operador logístico", "Contabilidade externa"], transferenciaInternacional: false,
    medidas: ["Criptografia em trânsito (TLS)", "Controle de acesso por perfil (RBAC)", "Registro de auditoria (logs)"],
    probabilidade: 2, impacto: 3, origem: "manual", criadoEm: atras(21),
  },
  {
    id: uid(), nome: "CFTV e controle de acesso", area: "Operações", responsavel: "Marta Silveira",
    finalidade: "Monitoramento das dependências para segurança patrimonial e de pessoas.",
    baseLegalId: "legitimo-interesse", sujeitos: ["Colaboradores", "Visitantes", "Fornecedores"], dados: ["camera", "foto", "placa", "biometria"],
    retencao: "30 dias (gravações)", retencaoJustificativa: "Descarte automático, salvo incidente registrado.",
    compartilhamento: ["Empresa de segurança terceirizada"], transferenciaInternacional: false,
    medidas: ["Segurança física das instalações", "Controle de acesso por perfil (RBAC)", "Avaliação de impacto (RIPD/DPIA)", "Registro de auditoria (logs)"],
    probabilidade: 3, impacto: 4, origem: "ia", criadoEm: atras(18), observacoes: "Placas de sinalização instaladas em todas as portarias.",
  },
  {
    id: uid(), nome: "Exames ocupacionais (ASO)", area: "RH", responsavel: "Dra. Lígia Fontes",
    finalidade: "Gestão de saúde ocupacional: admissionais, periódicos e demissionais.",
    baseLegalId: "saude-sensivel", sujeitos: ["Colaboradores"], dados: ["nome", "cpf", "saude"],
    retencao: "20 anos após o desligamento", retencaoJustificativa: "NR-7 e prazos de prescrição para doenças ocupacionais.",
    compartilhamento: ["Clínica de medicina do trabalho"], transferenciaInternacional: false,
    medidas: ["Criptografia em repouso", "Controle de acesso por perfil (RBAC)", "Acordo de confidencialidade (NDA)", "Avaliação de impacto (RIPD/DPIA)"],
    probabilidade: 2, impacto: 5, origem: "manual", criadoEm: atras(12),
  },
  {
    id: uid(), nome: "Atendimento ao cliente (SAC)", area: "Atendimento", responsavel: "Otávio Braga",
    finalidade: "Registro e tratativa de chamados, reclamações e solicitações de suporte.",
    baseLegalId: "legitimo-interesse", sujeitos: ["Clientes"], dados: ["nome", "email", "telefone", "consumo", "ip"],
    retencao: "2 anos após o encerramento do chamado", retencaoJustificativa: "Histórico para defesa em reclamações de consumo (CDC).",
    compartilhamento: ["Zendesk (operador)"], transferenciaInternacional: true,
    medidas: ["Criptografia em trânsito (TLS)", "Registro de auditoria (logs)"],
    probabilidade: 2, impacto: 2, origem: "manual", criadoEm: atras(6),
  },
];

export const SEED_SOLICITACOES: Solicitacao[] = [
  { id: uid(), titular: "Mariana Lopes", canal: "Portal do titular", tipo: "Acesso aos dados", data: atras(3), status: "em_andamento" },
  { id: uid(), titular: "Carlos Nunes", canal: "E-mail (encarregado)", tipo: "Eliminação de dados", data: atras(12), status: "aberta" },
  { id: uid(), titular: "Ana Beatriz Rocha", canal: "Telefone / SAC", tipo: "Correção de dados incompletos ou inexatos", data: atras(16), status: "concluida", resposta: "Endereço e telefone atualizados em todas as bases; confirmação enviada ao titular." },
];

export const SEED_CHECKLIST: ItemChecklist[] = [
  { id: "c1", label: "Encarregado (DPO) nomeado e divulgado", artigo: "Art. 41", feito: true },
  { id: "c2", label: "Política de Privacidade publicada e acessível", artigo: "Art. 9º", feito: true },
  { id: "c3", label: "Registro das operações de tratamento (RoPA)", artigo: "Art. 37", feito: true },
  { id: "c4", label: "Inventário de dados pessoais concluído", artigo: "Art. 37", feito: true },
  { id: "c5", label: "Contratos com operadores revisados (cláusulas LGPD)", artigo: "Art. 39", feito: true },
  { id: "c6", label: "RIPD/DPIA para atividades de alto risco", artigo: "Art. 38", feito: false },
  { id: "c7", label: "Plano de resposta a incidentes e notificação à ANPD", artigo: "Art. 48", feito: false },
  { id: "c8", label: "Gestão de consentimentos com trilha de auditoria", artigo: "Art. 8º", feito: true },
  { id: "c9", label: "Treinamento anual das equipes", artigo: "Art. 46", feito: false },
  { id: "c10", label: "Privacy by design em novos projetos", artigo: "Art. 46, §2º", feito: false },
];
