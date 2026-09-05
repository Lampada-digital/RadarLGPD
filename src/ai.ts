/* =====================================================================
   Motor de IA — classificação heurística local (nenhum dado sai do navegador).
   ===================================================================== */

import { FRAMEWORKS } from "./domain";
import type { ControleEstado } from "./domain";

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

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
