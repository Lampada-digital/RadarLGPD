/* ================= Domínio GDPR — Regulamento (UE) 2016/679 ================= */

export interface BaseGdpr {
  id: string;
  ref: string;
  artigo: "art6" | "art9";
  titulo: string;
  descricao: string;
}

export const BASES_ART6: BaseGdpr[] = [
  { id: "gdpr-consent", ref: "Art. 6(1)(a)", artigo: "art6", titulo: "Consentimento", descricao: "O titular deu consentimento para o tratamento dos seus dados para uma ou mais finalidades específicas." },
  { id: "gdpr-contrato", ref: "Art. 6(1)(b)", artigo: "art6", titulo: "Execução de contrato", descricao: "Tratamento necessário para a execução de contrato do qual o titular é parte, ou para diligências pré-contratuais." },
  { id: "gdpr-legal", ref: "Art. 6(1)(c)", artigo: "art6", titulo: "Obrigação legal", descricao: "Tratamento necessário para o cumprimento de obrigação legal a que o responsável esteja sujeito." },
  { id: "gdpr-vital", ref: "Art. 6(1)(d)", artigo: "art6", titulo: "Interesses vitais", descricao: "Proteção de interesses vitais do titular ou de outra pessoa singular." },
  { id: "gdpr-publico", ref: "Art. 6(1)(e)", artigo: "art6", titulo: "Interesse público", descricao: "Exercício de funções de interesse público ou da autoridade pública de que está investido o responsável." },
  { id: "gdpr-legitimo", ref: "Art. 6(1)(f)", artigo: "art6", titulo: "Interesses legítimos", descricao: "Interesses legítimos prosseguidos pelo responsável ou por terceiros, exceto quando prevaleçam os direitos do titular (exige balancing test / LIA)." },
];

export const BASES_ART9: BaseGdpr[] = [
  { id: "gdpr9-consent", ref: "Art. 9(2)(a)", artigo: "art9", titulo: "Consentimento explícito", descricao: "Consentimento explícito para finalidades específicas; o titular pode retirá-lo a qualquer momento." },
  { id: "gdpr9-trabalho", ref: "Art. 9(2)(b)", artigo: "art9", titulo: "Direito do trabalho e segurança social", descricao: "Obrigações no domínio do direito do trabalho, da segurança social e da proteção social." },
  { id: "gdpr9-vital", ref: "Art. 9(2)(c)", artigo: "art9", titulo: "Interesses vitais", descricao: "Quando o titular estiver física ou juridicamente incapaz de dar consentimento." },
  { id: "gdpr9-associacao", ref: "Art. 9(2)(d)", artigo: "art9", titulo: "Atividades legítimas de associações", descricao: "Tratamento por fundação, associação ou organismo sem fins lucrativos com objetivo político, filosófico, religioso ou sindical." },
  { id: "gdpr9-publico", ref: "Art. 9(2)(e)", artigo: "art9", titulo: "Dados manifestamente públicos", descricao: "Dados tornados manifestamente públicos pelo próprio titular." },
  { id: "gdpr9-judicial", ref: "Art. 9(2)(f)", artigo: "art9", titulo: "Declaração ou defesa de direitos", descricao: "Exercício de direitos em processo judicial ou sempre que os tribunais atuem na sua qualidade jurisdicional." },
  { id: "gdpr9-publico2", ref: "Art. 9(2)(g)", artigo: "art9", titulo: "Interesse público importante", descricao: "Motivos de interesse público importante, com base no direito da União ou dos Estados-Membros." },
  { id: "gdpr9-saude", ref: "Art. 9(2)(h)", artigo: "art9", titulo: "Fins de medicina e saúde", descricao: "Medicina preventiva ou do trabalho, avaliação da capacidade de trabalho, diagnóstico e prestação de cuidados de saúde." },
  { id: "gdpr9-arquivo", ref: "Art. 9(2)(i)", artigo: "art9", titulo: "Arquivo, investigação e estatística", descricao: "Interesse público no domínio do arquivo, da investigação científica ou histórica, ou fins estatísticos." },
  { id: "gdpr10-criminal", ref: "Art. 10", artigo: "art9", titulo: "Condenações e infrações penais", descricao: "Dados relativos a condenações penais e infrações — tratamento apenas sob o controle de autoridade pública ou autorizado por lei." },
];

export const TODAS_BASES_GDPR = [...BASES_ART6, ...BASES_ART9];

export interface DadoGdpr {
  id: string;
  label: string;
  especial?: boolean;
}

export const DADOS_GDPR: DadoGdpr[] = [
  { id: "g-nome", label: "Nome e dados de identificação" },
  { id: "g-contato", label: "Dados de contato (e-mail, telefone)" },
  { id: "g-financeiro", label: "Dados financeiros e de pagamento" },
  { id: "g-trabalho", label: "Dados de emprego / RH" },
  { id: "g-local", label: "Dados de localização" },
  { id: "g-online", label: "Identificadores online (IP, cookies)" },
  { id: "g-imagem", label: "Imagens (foto, vídeo, CCTV)" },
  { id: "g-saude", label: "Dados de saúde", especial: true },
  { id: "g-biometria", label: "Dados biométricos", especial: true },
  { id: "g-genetico", label: "Dados genéticos", especial: true },
  { id: "g-racial", label: "Origem racial ou étnica", especial: true },
  { id: "g-politico", label: "Opiniões políticas", especial: true },
  { id: "g-religiao", label: "Crenças religiosas ou filosóficas", especial: true },
  { id: "g-sindicato", label: "Filiação sindical", especial: true },
  { id: "g-sexual", label: "Orientação sexual", especial: true },
  { id: "g-criminal", label: "Condenações penais (Art. 10)", especial: true },
];

export const TITULARES_GDPR = ["Titulares UE", "Empregados", "Clientes", "Fornecedores", "Visitantes do site", "Menores"];

export const MECANISMOS_TRANSFERENCIA = [
  "Decisão de adequação (Art. 45)",
  "Cláusulas contratuais-tipo — SCCs (Art. 46(2)(c))",
  "Regras vinculativas de empresa — BCRs (Art. 47)",
  "Código de conduta aprovado (Art. 40)",
  "Mecanismo de certificação aprovado (Art. 42)",
  "Derrogações do Art. 49 (consentimento explícito, contrato…)",
];

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
  risco: 1 | 2 | 3; // baixo / médio / alto
  origem: "manual" | "ia";
  criadoEm: string;
  observacoes?: string;
}

export interface Transferencia {
  id: string;
  destino: string;
  destinatario: string;
  mecanismo: string;
  status: "vigente" | "em_revisao" | "pendente";
}

export interface CriterioDpia {
  id: string;
  label: string;
  ref: string;
}

export const CRITERIOS_DPIA: CriterioDpia[] = [
  { id: "d1", label: "Avaliação ou pontuação sistemática (perfil, scoring)", ref: "Art. 35(3)(a)" },
  { id: "d2", label: "Decisões automatizadas com efeito jurídico ou significativo", ref: "Art. 22" },
  { id: "d3", label: "Monitorização sistemática de área acessível ao público", ref: "Art. 35(3)(c)" },
  { id: "d4", label: "Categorias especiais (Art. 9) ou dados penais (Art. 10)", ref: "WP248" },
  { id: "d5", label: "Dados tratados em grande escala (large scale)", ref: "WP248" },
  { id: "d6", label: "Correspondência ou combinação de conjuntos de dados", ref: "WP248" },
  { id: "d7", label: "Titulares vulneráveis (crianças, empregados, pacientes)", ref: "WP248" },
  { id: "d8", label: "Uso inovador ou novas soluções tecnológicas (IA, IoT)", ref: "WP248" },
  { id: "d9", label: "Impede o exercício de um direito ou uso de serviço/contrato", ref: "WP248" },
];

export const TIPOS_DSAR_GDPR = [
  "Acesso (Art. 15)",
  "Retificação (Art. 16)",
  "Apagamento — direito ao esquecimento (Art. 17)",
  "Limitação do tratamento (Art. 18)",
  "Portabilidade (Art. 20)",
  "Oposição (Art. 21)",
  "Decisões automatizadas (Art. 22)",
];

/* ================= Seeds de demonstração ================= */

const atras = (d: number) => new Date(Date.now() - d * 86400000).toISOString().slice(0, 10);

export const SEED_GDPR_ATIVIDADES: GdprAtividade[] = [
  {
    id: "gdp1", nome: "EU Payroll & HR administration", departamento: "HR",
    finalidades: "Processamento de salários, benefícios e obrigações legais dos empregados da UE.",
    baseArt6: "gdpr-contrato", baseArt9: "gdpr9-trabalho",
    titulares: ["Empregados"], dados: ["g-nome", "g-contato", "g-financeiro", "g-trabalho", "g-saude"],
    retencao: "6 anos após desligamento", destinatarios: ["Autoridade fiscal local", "Seguradora"],
    transferencia: false, medidas: ["Pseudonimização", "Controle de acesso (RBAC)", "Criptografia em repouso"],
    risco: 2, origem: "manual", criadoEm: atras(35),
  },
  {
    id: "gdp2", nome: "Digital marketing & newsletter (ePrivacy)", departamento: "Marketing",
    finalidades: "Envio de campanhas segmentadas e remarketing para leads e clientes na UE.",
    baseArt6: "gdpr-consent",
    titulares: ["Clientes", "Visitantes do site"], dados: ["g-nome", "g-contato", "g-online"],
    retencao: "Até retirada do consentimento", destinatarios: ["Mailchimp (processor)", "Google Ads"],
    transferencia: true, mecanismoTransferencia: "Cláusulas contratuais-tipo — SCCs (Art. 46(2)(c))",
    medidas: ["Consent management platform", "Opt-out em 1 clique", "Criptografia em trânsito (TLS)"],
    risco: 2, origem: "ia", criadoEm: atras(22),
  },
  {
    id: "gdp3", nome: "CCTV nas instalações (Lisboa)", departamento: "Facilities",
    finalidades: "Vigilância de segurança das instalações e proteção de bens e pessoas.",
    baseArt6: "gdpr-legitimo",
    titulares: ["Empregados", "Visitantes do site", "Titulares UE"], dados: ["g-imagem"],
    retencao: "30 dias", destinatarios: ["Empresa de segurança (processor)"],
    transferencia: false, medidas: ["Sinalização visível", "LIA documentada", "Restrição de acesso às gravações"],
    risco: 2, origem: "ia", criadoEm: atras(14),
  },
  {
    id: "gdp4", nome: "Occupational health screening", departamento: "HR",
    finalidades: "Aptidão médica ao trabalho e gestão de ausências por doença.",
    baseArt6: "gdpr-legal", baseArt9: "gdpr9-saude",
    titulares: ["Empregados"], dados: ["g-nome", "g-trabalho", "g-saude"],
    retencao: "Duração do vínculo + 10 anos", destinatarios: ["Clínica de medicina do trabalho"],
    transferencia: false, medidas: ["Criptografia em repouso", "Acesso restrito ao médico do trabalho", "DPIA concluída"],
    risco: 3, origem: "manual", criadoEm: atras(9),
  },
];

export const SEED_TRANSFERENCIAS: Transferencia[] = [
  { id: "t1", destino: "Estados Unidos", destinatario: "Mailchimp — CRM de marketing", mecanismo: "Cláusulas contratuais-tipo — SCCs (Art. 46(2)(c))", status: "vigente" },
  { id: "t2", destino: "Índia", destinatario: "Suporte técnico 24/7 (fornecedor)", mecanismo: "Cláusulas contratuais-tipo — SCCs (Art. 46(2)(c))", status: "em_revisao" },
];

export const SEED_DPIA: Record<string, boolean> = { d4: true, d7: true };
