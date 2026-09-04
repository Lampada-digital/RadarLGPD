import { CATEGORIAS_DADOS, TODAS_BASES, zonaRisco, riscoScore } from "./types";
import type { ZonaRisco } from "./types";

/* =====================================================================
   Motor de IA do Radar LGPD — classificação heurística local (pt-BR).
   Nenhum dado sai do navegador: tudo roda em heurísticas determinísticas.
   ===================================================================== */

export interface BaseSugerida {
  id: string;
  inciso: string;
  titulo: string;
  rationale: string;
  principal: boolean;
}

export interface AnaliseIA {
  titulo: string;
  finalidade: string;
  contexto: string;
  dados: string[];
  dadosSensiveis: string[];
  sujeitos: string[];
  bases: BaseSugerida[];
  baseRecomendada: string;
  retencao: string;
  retencaoJustificativa: string;
  medidas: string[];
  probabilidade: number;
  impacto: number;
  score: number;
  zona: ZonaRisco;
  transferenciaInternacional: boolean;
  alertas: string[];
  confianca: number;
}

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ---------- dicionário de dados pessoais ---------- */
const DADOS_RX: { id: string; rx: RegExp }[] = [
  { id: "nome", rx: /\b(nome completo|nome|razao social)\b/ },
  { id: "cpf", rx: /\bcpf\b/ },
  { id: "rg", rx: /\b(rg|documento de identidade|identidade)\b/ },
  { id: "nascimento", rx: /\b(data de nascimento|nascimento|idade)\b/ },
  { id: "email", rx: /\b(e-?mail|correio eletronico)\b/ },
  { id: "telefone", rx: /\b(telefone|celular|whats|fone)\b/ },
  { id: "endereco", rx: /\b(endereco|cep|logradouro|residencia)\b/ },
  { id: "foto", rx: /\b(foto|fotografia|imagem|selfie|retrato)\b/ },
  { id: "camera", rx: /\b(cftv|camera|filmagem|vigilancia|gravacao de video)\b/ },
  { id: "curriculo", rx: /\b(curriculo|experiencia profissional|formacao|linkedin)\b/ },
  { id: "financeiro", rx: /\b(salario|salarios|remuneracao|renda|financeiro|holerite|contracheque|pagamento)\b/ },
  { id: "bancario", rx: /\b(bancari|banco|conta corrente|pix|cartao)\b/ },
  { id: "consumo", rx: /\b(historico de consumo|compras|pedidos|consumo|preferencias)\b/ },
  { id: "localizacao", rx: /\b(localizacao|gps|geolocalizacao|endereco ip de localizacao)\b/ },
  { id: "ip", rx: /\b(endereco ip|\bip\b|dispositivo)\b/ },
  { id: "cookies", rx: /\b(cookies?|analytics|navegacao|rastreamento|pixel)\b/ },
  { id: "assinatura", rx: /\b(assinatura)\b/ },
  { id: "placa", rx: /\b(placa|veiculo)\b/ },
  { id: "saude", rx: /\b(saude|medico|exame|atestado|aso|doenca|diagnostico|vacina|gestante|cid)\b/ },
  { id: "biometria", rx: /\b(biometri|digital\b|reconhecimento facial|face id|impressao digital)\b/ },
  { id: "religiao", rx: /\b(religi|crenca|culto)\b/ },
  { id: "racial", rx: /\b(racial|etnia|etnico|origem racial)\b/ },
  { id: "politico", rx: /\b(politic|sindica|filiacao|partido)\b/ },
  { id: "menor", rx: /\b(crianca|criancas|adolescente|menor de idade|menores)\b/ },
];

/* ---------- contextos de tratamento ---------- */
interface Contexto {
  id: string;
  rx: RegExp;
  titulo: string;
  finalidade: string;
  sujeitos: string[];
  basePrincipal: string;
  rationale: string;
  baseAlternativa?: string;
  rationaleAlt?: string;
  retencao: string;
  retencaoJustificativa: string;
  medidas: string[];
  prob: number;
  imp: number;
  alertas: string[];
}

const CONTEXTOS: Contexto[] = [
  {
    id: "recrutamento", rx: /recrut|selecao|candidat|curriculo|vaga|entrevista|contratacao de pessoal|admiss/,
    titulo: "Recrutamento e seleção",
    finalidade: "Triagem de currículos, condução de entrevistas e avaliação de candidatos para vagas abertas.",
    sujeitos: ["Candidatos"],
    basePrincipal: "contrato",
    rationale: "Procedimentos preliminares relacionados a contrato do qual o candidato pretende ser parte — não exige consentimento formal para a triagem inicial.",
    baseAlternativa: "consentimento",
    rationaleAlt: "Para manter currículos em banco de talentos além do processo vigente, obtenha consentimento renovável.",
    retencao: "12 meses após o encerramento do processo",
    retencaoJustificativa: "Banco de talentos; eliminar antes, se o candidato solicitar.",
    medidas: ["Controle de acesso por perfil (RBAC)", "Acordo de confidencialidade (NDA)", "Política de retenção e descarte"],
    prob: 3, imp: 2, alertas: ["Currículos podem conter dados sensíveis (foto, filiação sindical, saúde) — instrua o descarte dessas informações."],
  },
  {
    id: "folha", rx: /folha|pagamento de salario|holerite|encargos|beneficios|inss|fgts|esocial|remuneracao/,
    titulo: "Folha de pagamento e encargos",
    finalidade: "Processamento de folha, benefícios e cumprimento das obrigações trabalhistas e previdenciárias.",
    sujeitos: ["Colaboradores"],
    basePrincipal: "obrigacao-legal",
    rationale: "CLT, eSocial e obrigações previdenciárias impõem o tratamento independentemente de consentimento.",
    baseAlternativa: "contrato",
    rationaleAlt: "Parcelas contratuais extras (bônus, comissões) amparam-se na execução do contrato de trabalho.",
    retencao: "Enquanto durar o vínculo + 30 anos",
    retencaoJustificativa: "Prazos prescricionais trabalhistas (FGTS) e previdenciários.",
    medidas: ["Criptografia em repouso", "Controle de acesso por perfil (RBAC)", "Registro de auditoria (logs)", "Política de retenção e descarte"],
    prob: 2, imp: 4, alertas: ["Dados bancários exigem acesso restrito ao Financeiro/RH com logs de acesso."],
  },
  {
    id: "saude-ocupacional", rx: /ocupacional|aso|exame medico|atestado|medicina do trabalho|saude do trabalhador|pcms/,
    titulo: "Saúde ocupacional (ASO)",
    finalidade: "Gestão dos exames ocupacionais (admissional, periódico, demissional) conforme NR-7.",
    sujeitos: ["Colaboradores"],
    basePrincipal: "saude-sensivel",
    rationale: "Tutela da saúde em procedimento realizado por profissionais de saúde — base específica para dados sensíveis (art. 11, II, f).",
    baseAlternativa: "obrigacao-legal-sensivel",
    rationaleAlt: "A NR-7 impõe os exames como obrigação legal do empregador.",
    retencao: "20 anos após o desligamento",
    retencaoJustificativa: "Prazo para prescrição de ações sobre doenças ocupacionais.",
    medidas: ["Criptografia em repouso", "Controle de acesso por perfil (RBAC)", "Acordo de confidencialidade (NDA)", "Avaliação de impacto (RIPD/DPIA)"],
    prob: 2, imp: 5, alertas: ["Dado sensível (art. 11): exigir RIPD e acesso exclusivamente médico.", "Proibir o acesso do gestor direto ao CID ou diagnóstico."],
  },
  {
    id: "marketing", rx: /marketing|newsletter|promoca|campanha|remarketing|e-mail marketing|leads|publicidade|malote|sms/,
    titulo: "Marketing e comunicações",
    finalidade: "Envio de newsletters, promoções segmentadas e campanhas de remarketing para leads e clientes.",
    sujeitos: ["Clientes", "Usuários do site"],
    basePrincipal: "consentimento",
    rationale: "Comunicações promocionais exigem manifestação livre e inequívoca, com opt-out facilitado em todos os canais.",
    baseAlternativa: "legitimo-interesse",
    rationaleAlt: "Soft opt-in para clientes existentes (produtos similares) pode apoiar-se em legítimo interesse, documentado em teste de ponderação (LIA).",
    retencao: "Até a revogação do consentimento",
    retencaoJustificativa: "Manter apenas prova do consentimento e do opt-out.",
    medidas: ["Criptografia em trânsito (TLS)", "Política de retenção e descarte", "Gestão de consentimentos com trilha de auditoria"],
    prob: 3, imp: 3, alertas: ["Plataformas de anúncio (Meta/Google) podem implicar transferência internacional — verificar cláusulas contratuais."],
  },
  {
    id: "vendas", rx: /venda|pedido|compra|faturamento|nota fiscal|e-?commerce|loja|checkout|entrega|cobranca|orcamento/,
    titulo: "Vendas e faturamento",
    finalidade: "Emissão de pedidos, notas fiscais, cobrança e entrega de produtos ou serviços contratados.",
    sujeitos: ["Clientes"],
    basePrincipal: "contrato",
    rationale: "Execução de contrato de compra e venda do qual o titular é parte.",
    baseAlternativa: "obrigacao-legal",
    rationaleAlt: "Emissão de NF-e e guarda fiscal decorrem de obrigação legal.",
    retencao: "5 anos",
    retencaoJustificativa: "Prazos prescricionais tributário e civil.",
    medidas: ["Criptografia em trânsito (TLS)", "Controle de acesso por perfil (RBAC)", "Registro de auditoria (logs)"],
    prob: 2, imp: 3, alertas: ["Compartilhamento com operadores logísticos exige contrato de tratamento (art. 39)."],
  },
  {
    id: "cftv", rx: /cftv|camera|vigilancia|monitoramento|controle de acesso|portaria|seguranca patrimonial/,
    titulo: "Segurança e monitoramento (CFTV)",
    finalidade: "Monitoramento das dependências para segurança patrimonial e proteção de pessoas.",
    sujeitos: ["Colaboradores", "Visitantes", "Fornecedores"],
    basePrincipal: "legitimo-interesse",
    rationale: "Segurança patrimonial é interesse legítimo do controlador; ponderação documentada (LIA) e sinalização visível.",
    baseAlternativa: "protecao-vida",
    rationaleAlt: "Em áreas de risco à integridade física, a proteção da vida reforça a licitude.",
    retencao: "30 dias (gravações)",
    retencaoJustificativa: "Descarte automático, exceto trechos vinculados a incidentes.",
    medidas: ["Segurança física das instalações", "Controle de acesso por perfil (RBAC)", "Avaliação de impacto (RIPD/DPIA)", "Registro de auditoria (logs)"],
    prob: 3, imp: 4, alertas: ["Instalar placas de aviso em todas as entradas (transparência, art. 9º).", "Reconhecimento facial em CFTV é dado biométrico sensível — evite ou realize RIPD."],
  },
  {
    id: "atendimento", rx: /atendimento|suporte|sac|chamado|ouvidoria|reclamacao|help ?desk/,
    titulo: "Atendimento ao cliente",
    finalidade: "Registro e tratativa de chamados, reclamações e solicitações de suporte.",
    sujeitos: ["Clientes"],
    basePrincipal: "legitimo-interesse",
    rationale: "Atender solicitações do cliente é interesse legítimo e expectativa razoável do titular.",
    baseAlternativa: "contrato",
    rationaleAlt: "Suporte pós-venda integra a execução do contrato de fornecimento.",
    retencao: "2 anos após o encerramento do chamado",
    retencaoJustificativa: "Defesa em reclamações consumeristas (CDC).",
    medidas: ["Criptografia em trânsito (TLS)", "Registro de auditoria (logs)"],
    prob: 2, imp: 2, alertas: ["Ferramentas de ticket em nuvem fora do Brasil exigem cláusulas de transferência internacional."],
  },
  {
    id: "cadastro", rx: /cadastro|conta|login|registro de usuario|onboarding|perfil do usuario/,
    titulo: "Cadastro e contas de usuário",
    finalidade: "Criação e gestão de contas, autenticação e manutenção do perfil do usuário na plataforma.",
    sujeitos: ["Usuários do site", "Clientes"],
    basePrincipal: "contrato",
    rationale: "Execução dos termos de uso aceitos pelo titular ao criar a conta.",
    baseAlternativa: "consentimento",
    rationaleAlt: "Dados opcionais do perfil (foto, preferências) devem ser coletados mediante consentimento granular.",
    retencao: "Enquanto a conta estiver ativa + 6 meses",
    retencaoJustificativa: "Período para reativação e cumprimento de ordens judiciais.",
    medidas: ["Autenticação multifator (MFA)", "Criptografia em repouso", "Criptografia em trânsito (TLS)", "Registro de auditoria (logs)"],
    prob: 3, imp: 3, alertas: ["Aplicar minimização: colete apenas o necessário para a finalidade da conta."],
  },
  {
    id: "digital", rx: /cookie|analytics|site|app|navegacao|rastreamento|telemetria/,
    titulo: "Dados digitais e analytics",
    finalidade: "Medição de audiência, performance do site/app e personalização por meio de cookies e identificadores.",
    sujeitos: ["Usuários do site"],
    basePrincipal: "consentimento",
    rationale: "Cookies não essenciais exigem consentimento prévio via banner com recusa tão fácil quanto a aceitação.",
    baseAlternativa: "legitimo-interesse",
    rationaleAlt: "Cookies estritamente funcionais dispensam consentimento (segurança da sessão).",
    retencao: "13 meses (analytics)",
    retencaoJustificativa: "Alinhado às boas práticas de medição anonimizada.",
    medidas: ["Anonimização / Pseudonimização", "Criptografia em trânsito (TLS)", "Política de retenção e descarte"],
    prob: 3, imp: 2, alertas: ["Implementar banner de cookies com registro de prova do consentimento."],
  },
  {
    id: "fornecedores", rx: /fornecedor|prestador|contrato com terceiros|compras corporativas|homologacao/,
    titulo: "Gestão de fornecedores",
    finalidade: "Homologação, contratação e pagamentos de fornecedores pessoa física e representantes.",
    sujeitos: ["Fornecedores"],
    basePrincipal: "contrato",
    rationale: "Execução de contrato de fornecimento/prestação de serviços.",
    baseAlternativa: "obrigacao-legal",
    rationaleAlt: "Retenções fiscais e obrigações acessórias decorrem de lei.",
    retencao: "5 anos após o término do contrato",
    retencaoJustificativa: "Prescrição de obrigações civis e fiscais.",
    medidas: ["Controle de acesso por perfil (RBAC)", "Acordo de confidencialidade (NDA)", "Criptografia em trânsito (TLS)"],
    prob: 2, imp: 2, alertas: ["Exigir cláusula de proteção de dados de todos os operadores contratados."],
  },
];

/* ---------- análise principal ---------- */
export function analisar(textoBruto: string): AnaliseIA {
  const t = norm(textoBruto);
  const matches = CONTEXTOS.filter((c) => c.rx.test(t)).sort((a, b) => t.search(a.rx) - t.search(b.rx));
  const ctx: Contexto =
    matches[0] ?? {
      id: "generico",
      rx: /./,
      titulo: "Tratamento de dados pessoais",
      finalidade: textoBruto.trim().length > 8 ? textoBruto.trim().replace(/\.$/, "") + "." : "Tratamento de dados pessoais a detalhar.",
      sujeitos: ["Clientes"],
      basePrincipal: "legitimo-interesse",
      rationale: "Sem contexto específico identificado — documente um teste de ponderação (LIA) ou colete consentimento.",
      retencao: "Definir prazo específico",
      retencaoJustificativa: "A LGPD veda retenção indefinida: fixe prazo ou critério verificável.",
      medidas: ["Controle de acesso por perfil (RBAC)", "Criptografia em trânsito (TLS)", "Política de retenção e descarte"],
      prob: 3, imp: 3, alertas: ["Descrição pouco específica — detalhe finalidade, categorias de titulares e dados para refinar a análise."],
    };

  /* dados detectados */
  const dados = new Set<string>();
  for (const d of DADOS_RX) if (d.rx.test(t)) dados.add(d.id);
  if (dados.size === 0) {
    dados.add("nome");
    dados.add("email");
    if (/cliente|usuario|lead/.test(t)) dados.add("telefone");
    if (/colaborador|funcionario|empregado/.test(t)) dados.add("cpf");
  }

  /* sujeitos detectados */
  const sujeitos = new Set<string>(ctx.sujeitos);
  if (/colaborador|funcionario|empregado|equipe/.test(t)) sujeitos.add("Colaboradores");
  if (/candidat/.test(t)) sujeitos.add("Candidatos");
  if (/cliente|consumidor|comprador/.test(t)) sujeitos.add("Clientes");
  if (/fornecedor|prestador|terceirizad/.test(t)) sujeitos.add("Fornecedores");
  if (/visitante|portaria/.test(t)) sujeitos.add("Visitantes");
  if (/crianca|adolescente|menor/.test(t)) sujeitos.add("Menores de idade");

  /* risco */
  let prob = ctx.prob;
  let imp = ctx.imp;
  const dadosSensiveis = [...dados].filter((id) => CATEGORIAS_DADOS.find((c) => c.id === id)?.sensivel);
  if (dadosSensiveis.length > 0) imp = Math.min(5, imp + 1);
  if (sujeitos.has("Menores de idade")) {
    imp = Math.min(5, imp + 1);
  }
  const compartilhando = /compartilh|terceirizad|fornecedor|parceir|operador/.test(t) && ctx.id !== "fornecedores";
  if (compartilhando) prob = Math.min(5, prob + 1);
  const transferenciaInternacional = /internacional|exterior|fora do brasil|nuvem (americana|global)|aws|azure|google cloud|servidor (nos eua|fora)/.test(t);
  if (transferenciaInternacional) prob = Math.min(5, prob + 1);
  if (/grande escala|milhoes|massivo/.test(t)) prob = Math.min(5, prob + 1);

  const score = riscoScore(prob, imp);
  const zona = zonaRisco(score);

  const bases: BaseSugerida[] = [];
  const bp = TODAS_BASES.find((b) => b.id === ctx.basePrincipal)!;
  bases.push({ id: bp.id, inciso: bp.inciso, titulo: bp.titulo, rationale: ctx.rationale, principal: true });
  if (ctx.baseAlternativa) {
    const ba = TODAS_BASES.find((b) => b.id === ctx.baseAlternativa)!;
    bases.push({ id: ba.id, inciso: ba.inciso, titulo: ba.titulo, rationale: ctx.rationaleAlt ?? "", principal: false });
  }

  const alertas = [...ctx.alertas];
  if (dadosSensiveis.length > 0)
    alertas.push(
      `Dados sensíveis identificados (${dadosSensiveis.length}) — tratamento condicionado ao art. 11; documente a base específica.`
    );
  if (sujeitos.has("Menores de idade"))
    alertas.push("Dados de crianças exigem consentimento de ao menos um dos pais e avaliação do melhor interesse (art. 14).");
  if (transferenciaInternacional)
    alertas.push("Transferência internacional detectada — exigível cláusula-padrão, selo da ANPD ou país com grau adequado (art. 33).");
  if (compartilhando) alertas.push("Compartilhamento com terceiros — formalize contrato com obrigações de tratamento (art. 39).");
  if (zona === "alto" || zona === "critico") alertas.push("Risco elevado: recomenda-se RIPD/DPIA (art. 38) e consulta ao Encarregado antes de iniciar.");

  const medidas = [...ctx.medidas];
  if (dadosSensiveis.length > 0 && !medidas.includes("Criptografia em repouso")) medidas.push("Criptografia em repouso");
  if ((zona === "alto" || zona === "critico") && !medidas.includes("Avaliação de impacto (RIPD/DPIA)")) medidas.push("Avaliação de impacto (RIPD/DPIA)");

  const confianca = Math.min(0.97, 0.6 + matches.length * 0.06 + dados.size * 0.015);

  return {
    titulo: ctx.titulo,
    finalidade: ctx.finalidade,
    contexto: ctx.id,
    dados: [...dados],
    dadosSensiveis,
    sujeitos: [...sujeitos],
    bases,
    baseRecomendada: bp.id,
    retencao: ctx.retencao,
    retencaoJustificativa: ctx.retencaoJustificativa,
    medidas,
    probabilidade: prob,
    impacto: imp,
    score,
    zona,
    transferenciaInternacional,
    alertas: [...new Set(alertas)],
    confianca: Math.round(confianca * 100) / 100,
  };
}

/* ---------- etapas exibidas durante a "análise" ---------- */
export const ETAPAS_ANALISE = [
  "Lendo a descrição do tratamento…",
  "Identificando dados pessoais e sensíveis…",
  "Correlacionando com os arts. 7º e 11 da Lei 13.709/2018…",
  "Avaliando retenção, compartilhamento e transferência…",
  "Calculando risco (probabilidade × impacto)…",
];

export const SUGESTOES_PROMPT = [
  "Recrutamento e seleção de candidatos: recebemos currículos com foto, telefone e e-mail; alguns mencionam filiação sindical.",
  "Monitoramento por câmeras de segurança nas portarias, com reconhecimento facial e leitura de placa de veículos de visitantes.",
  "Campanha de marketing com compra de lista de leads, cookies de rastreamento e disparo de e-mail por plataforma hospedada nos EUA.",
];

export const labelDado = (id: string) => CATEGORIAS_DADOS.find((c) => c.id === id)?.label ?? id;
export const dadoSensivel = (id: string) => !!CATEGORIAS_DADOS.find((c) => c.id === id)?.sensivel;
