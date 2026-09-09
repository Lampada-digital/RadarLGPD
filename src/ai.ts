/* =====================================================================
   Motor de IA — classificação heurística local (nenhum dado sai do navegador).
   ===================================================================== */

import { FRAMEWORKS } from "./domain";
import type { ControleEstado, Framework, ControleIso } from "./domain";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* =====================================================================
   IA Autônoma — explica cada controle ISO e sugere como coletar evidências
   ===================================================================== */

export interface ExplicacaoControle {
  controle: ControleIso;
  framework: Framework;
  explicacao: string;
  comoColetarEvidencias: string[];
  exemplosEvidencias: string[];
}

export function explicarControle(framework: Framework, controle: ControleIso): ExplicacaoControle {
  const explicacoes: Record<string, { explicacao: string; comoColetar: string[]; exemplos: string[] }> = {
    "27001-41": {
      explicacao: "Define o contexto interno e externo da organização para o SGSI, incluindo partes interessadas e seus requisitos.",
      comoColetar: ["Documente análise SWOT ou PESTEL", "Liste partes interessadas e requisitos", "Defina escopo do SGSI"],
      exemplos: ["Documento de contexto organizacional", "Lista de partes interessadas", "Declaração de escopo"],
    },
    "27001-52": {
      explicacao: "Política de segurança da informação aprovada pela alta direção, comunicada e disponível.",
      comoColetar: ["Aprovação formal da diretoria", "Comunicação a todos os colaboradores", "Disponibilização em intranet"],
      exemplos: ["Política assinada", "E-mails de comunicação", "Print da intranet"],
    },
    "27001-612": {
      explicacao: "Metodologia de avaliação de riscos com critérios de probabilidade e impacto definidos.",
      comoColetar: ["Documente metodologia de avaliação", "Defina matriz de risco", "Registre critérios de aceitação"],
      exemplos: ["Metodologia de avaliação de riscos", "Matriz de risco 5x5", "Critérios de aceitação de risco"],
    },
    "27001-a813": {
      explicacao: "Backups de informações com teste periódico de restauração para garantir recuperabilidade.",
      comoColetar: ["Configure rotina de backup", "Documente frequência e retenção", "Execute testes de restauração"],
      exemplos: ["Print do sistema de backup", "Relatório de testes de restauração", "Política de backup"],
    },
    "27701-4": {
      explicacao: "Mapeamento completo dos fluxos de dados pessoais (PII) desde a coleta até a eliminação.",
      comoColetar: ["Inventarie todos os tratamentos", "Documente finalidades e bases legais", "Mapeie fluxos de dados"],
      exemplos: ["Registro de operações (RoPA)", "Fluxogramas de dados", "Mapa de dados pessoais"],
    },
    "27701-5": {
      explicacao: "Programa de avaliação de impacto de privacidade (DPIA) para tratamentos de alto risco.",
      comoColetar: ["Defina critérios para DPIA", "Execute DPIAs para tratamentos críticos", "Documente análises"],
      exemplos: ["Política de DPIA", "Relatórios de DPIA executados", "Critérios de acionamento"],
    },
    "soc2-cc61": {
      explicacao: "Controle de acesso lógico com autenticação forte (MFA) e gestão de privilégios baseada em função.",
      comoColetar: ["Implemente MFA para acessos críticos", "Documente política de RBAC", "Revise acessos periodicamente"],
      exemplos: ["Print de configuração MFA", "Política de controle de acesso", "Relatório de revisão de acessos"],
    },
    "pci-3": {
      explicacao: "Proteção de dados de titular de cartão (PAN) armazenados com criptografia forte.",
      comoColetar: ["Implemente criptografia AES-256", "Mascare PAN em telas e logs", "Documente política de proteção"],
      exemplos: ["Print de configuração de criptografia", "Política de proteção de dados de cartão", "Relatório de varredura de PAN"],
    },
  };

  const dados = explicacoes[controle.id] ?? {
    explicacao: `Controle ${controle.ref} da norma ${framework.codigo}: ${controle.desc}`,
    comoColetar: ["Documente a implementação do controle", "Execute o controle conforme definido", "Registre evidências de execução"],
    exemplos: [`Documento de ${controle.titulo}`, "Prints de configuração", "Relatórios de execução"],
  };

  return {
    controle,
    framework,
    explicacao: dados.explicacao,
    comoColetarEvidencias: dados.comoColetar,
    exemplosEvidencias: dados.exemplos,
  };
}

/* =====================================================================
   IA de Mapeamento — classificação heurística de operações de tratamento
   ===================================================================== */

export interface AnaliseLGPD {
  dados: string[];
  sujeitos: string[];
  baseRecomendada: string;
  bases: { id: string; rationale: string }[];
  retencao: string;
  retencaoJustificativa: string;
  medidas: string[];
  probabilidade: number;
  impacto: number;
  score: number;
  alertas: string[];
  transferenciaInternacional: boolean;
}

const DADOS_RX: { id: string; rx: RegExp }[] = [
  { id: "nome", rx: /\b(nome|identificacao|cpf|rg)\b/ },
  { id: "contato", rx: /\b(email|e-mail|telefone|contato|celular)\b/ },
  { id: "financeiro", rx: /\b(pagamento|cartao|financeiro|banco|salario|fatura|pix)\b/ },
  { id: "emprego", rx: /\b(rh|empregado|funcionario|folha|recrutamento|curriculo|cargo)\b/ },
  { id: "localizacao", rx: /\b(localizacao|gps|endereco)\b/ },
  { id: "online", rx: /\b(ip|cookie|analytics|navegacao|dispositivo)\b/ },
  { id: "saude", rx: /\b(saude|medico|exame|doenca|diagnostico|atestado|vacina)\b/ },
  { id: "biometria", rx: /\b(biometri|reconhecimento facial|digital)\b/ },
  { id: "religiao", rx: /\b(religi|crenca|culto)\b/ },
  { id: "politico", rx: /\b(politic|partido)\b/ },
  { id: "racial", rx: /\b(racial|etnia|etnico)\b/ },
  { id: "menor", rx: /\b(crianca|menor|adolescente|infantil)\b/ },
];

export function analisarLGPD(texto: string): AnaliseLGPD {
  const t = norm(texto);
  const achados = DADOS_RX.filter((d) => d.rx.test(t)).map((d) => d.id);
  const dados = achados.length ? achados : ["nome", "contato"];
  const sensiveis = dados.filter((d) => ["saude", "biometria", "religiao", "politico", "racial", "menor"].includes(d));

  let baseRecomendada = "legitimo";
  if (sensiveis.length) baseRecomendada = "saude".includes(dados.join()) ? "saude" : "consentimento-sensivel";
  else if (/\b(contrato|venda|compra|pedido|entrega|prestacao)\b/.test(t)) baseRecomendada = "contrato";
  else if (/\b(obriga|fiscal|tribut|legal|regulatorio|compliance)\b/.test(t)) baseRecomendada = "obrigacao-legal";
  else if (/\b(marketing|newsletter|promoca|publicidade|prospeccao)\b/.test(t)) baseRecomendada = "legitimo";
  else if (/\b(consent|aceite|opt-in)\b/.test(t)) baseRecomendada = "consentimento";

  const bases = [
    { id: baseRecomendada, rationale: rationaleDe(baseRecomendada) },
    ...(baseRecomendada !== "consentimento" && !sensiveis.length ? [{ id: "consentimento", rationale: "Alternativa: manifestação livre e informada do titular." }] : []),
  ];

  const sujeitos: string[] = [];
  if (/\b(empregado|funcionario|rh|folha|colaborador)\b/.test(t)) sujeitos.push("Empregados");
  if (/\b(cliente|consumidor|lead|comprador)\b/.test(t)) sujeitos.push("Clientes");
  if (/\b(fornecedor|parceiro|prestador)\b/.test(t)) sujeitos.push("Fornecedores");
  if (/\b(paciente|consulta|atendimento)\b/.test(t)) sujeitos.push("Pacientes");
  if (sensiveis.includes("menor")) sujeitos.push("Menores");
  if (!sujeitos.length) sujeitos.push("Clientes");

  const transferenciaInternacional = /\b(eua|usa|estados unidos|aws|google|azure|cloud|europa|ue)\b/.test(t);
  const impacto = sensiveis.length ? 5 : transferenciaInternacional ? 4 : 3;
  const probabilidade = /\b(grande escala|milhoes|muitos|todos)\b/.test(t) ? 4 : 3;
  const score = probabilidade * impacto;

  const medidas = ["Controle de acesso (RBAC)", "Logs de auditoria"];
  if (dados.includes("financeiro") || sensiveis.length) medidas.push("Criptografia em repouso");
  if (transferenciaInternacional) medidas.push("Criptografia em trânsito (TLS)");
  if (sensiveis.length) medidas.push("Pseudonimização");

  const alertas: string[] = [];
  if (sensiveis.length) alertas.push("Dados sensíveis detectados — exige base do art. 11 e segurança reforçada.");
  if (transferenciaInternacional) alertas.push("Possível transferência internacional — verificar art. 33.");
  if (score >= 12) alertas.push("Risco alto/crítico — recomenda-se RIPD (art. 38).");

  return {
    dados, sujeitos, baseRecomendada, bases,
    retencao: sensiveis.length ? "Definir prazo específico + revisão anual" : "Conforme finalidade e base legal",
    retencaoJustificativa: sensiveis.length ? "minimização (art. 6º, III)" : "finalidade (art. 6º, I)",
    medidas, probabilidade, impacto, score, alertas, transferenciaInternacional,
  };
}

function rationaleDe(id: string): string {
  const map: Record<string, string> = {
    "obrigacao-legal": "Tratamento necessário para cumprir obrigação legal ou regulatória (art. 7º, II).",
    contrato: "Necessário à execução de contrato do qual o titular é parte (art. 7º, V).",
    legitimo: "Interesse legítimo do controlador, ponderado com os direitos do titular (art. 7º, IX).",
    consentimento: "Baseada na manifestação livre e informada do titular (art. 7º, I).",
    saude: "Tutela da saúde em procedimento por profissionais de saúde (art. 7º, VIII).",
    "consentimento-sensivel": "Dado sensível exige consentimento específico e em destaque (art. 11, I).",
  };
  return map[id] ?? "Base adequada à finalidade declarada.";
}

/* ------------------- planner ISO ------------------- */

export interface PlanoIso {
  gap: { total: number; conformes: number; pendentes: number };
  fases: { fase: string; prazo: string; acoes: string[] }[];
}

export function sugerirPlanoIso(frameworkId: string, iso: Record<string, Record<string, ControleEstado>>): PlanoIso {
  const fw = FRAMEWORKS.find((f) => f.id === frameworkId)!;
  const mapa = iso[frameworkId] ?? {};
  const pendentes = fw.controles.filter((ctl) => {
    const e = mapa[ctl.id]?.estado ?? "nao";
    return e === "nao" || e === "andamento";
  });
  const conformes = fw.controles.length - pendentes.length;

  return {
    gap: { total: fw.controles.length, conformes, pendentes: pendentes.length },
    fases: [
      {
        fase: "Fase 1 · Diagnóstico e governança",
        prazo: "Semanas 1–3",
        acoes: [
          "Executar gap analysis formal contra a norma",
          "Obter patrocínio da alta direção",
          ...pendentes.slice(0, 2).map((ctl) => `Estabelecer ${ctl.ref} — ${ctl.titulo}`),
        ],
      },
      {
        fase: "Fase 2 · Documentação e desenho",
        prazo: "Semanas 4–7",
        acoes: [
          "Revisar e aprovar políticas com donos definidos",
          ...pendentes.slice(2, 4).map((ctl) => `Projetar controle ${ctl.ref} — ${ctl.titulo}`),
        ],
      },
      {
        fase: "Fase 3 · Implementação",
        prazo: "Semanas 8–14",
        acoes: [
          "Implantar controles priorizados por risco residual",
          "Treinamento de conscientização (100% do público-alvo)",
        ],
      },
      {
        fase: "Fase 4 · Verificação",
        prazo: "Semanas 15–20",
        acoes: [
          "Auditoria interna com plano de ação",
          "Análise crítica pela direção",
          "Agendar ciclo de monitoramento trimestral",
        ],
      },
    ],
  };
}

export const nivelMaturidade = (pct: number) => {
  if (pct >= 85) return { label: "Pronto para certificação", cor: "var(--color-moss)" };
  if (pct >= 60) return { label: "Implementação consolidada", cor: "#2f7f74" };
  if (pct >= 30) return { label: "Programa em curso", cor: "var(--color-amber)" };
  return { label: "Fase inicial", cor: "var(--color-rust)" };
};
