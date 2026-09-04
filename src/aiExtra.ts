/* =====================================================================
   IA estendida — classificação GDPR, planejamento ISO e script de segurança.
   Heurísticas 100% locais: nenhum dado sai do navegador.
   ===================================================================== */

import { BASES_ART6, DADOS_GDPR } from "./gdpr";
import type { EstadoIso } from "./frameworks";
import { FRAMEWORKS } from "./frameworks";
import type { ControleEstado } from "./frameworks";

const norm = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/* ------------------- Classificador GDPR ------------------- */

export interface AnaliseGdpr {
  titulo: string;
  finalidades: string;
  dados: string[];
  especiais: string[];
  titulares: string[];
  baseArt6: string;
  rationaleArt6: string;
  baseArt9?: string;
  rationaleArt9?: string;
  retencao: string;
  destinatarios: string[];
  transferencia: boolean;
  mecanismoSugerido?: string;
  risco: 1 | 2 | 3;
  medidas: string[];
  alertas: string[];
  confianca: number;
}

const DADOS_GDPR_RX: { id: string; rx: RegExp }[] = [
  { id: "g-nome", rx: /\b(nome|razao social|identificacao)\b/ },
  { id: "g-contato", rx: /\b(e-?mail|telefone|contato|celular)\b/ },
  { id: "g-financeiro", rx: /\b(pagamento|cartao|financeiro|banco|iban|salario|fatura)\b/ },
  { id: "g-trabalho", rx: /\b(rh|empregado|funcionario|folha|recrutamento|curriculo|hr)\b/ },
  { id: "g-local", rx: /\b(localizacao|gps|geolocalizacao)\b/ },
  { id: "g-online", rx: /\b(ip|cookie|analytics|navegacao|rastreamento|device|dispositivo)\b/ },
  { id: "g-imagem", rx: /\b(foto|imagem|video|cctv|camera|filmagem|selfie)\b/ },
  { id: "g-saude", rx: /\b(saude|medico|exame|doenca|diagnostico|vacina|health|hospital|clinica)\b/ },
  { id: "g-biometria", rx: /\b(biometri|reconhecimento facial|impressao digital|face id)\b/ },
  { id: "g-genetico", rx: /\b(genetico|dna)\b/ },
  { id: "g-racial", rx: /\b(racial|etnia|etnico)\b/ },
  { id: "g-politico", rx: /\b(politic|partido)\b/ },
  { id: "g-religiao", rx: /\b(religi|crenca|culto)\b/ },
  { id: "g-sindicato", rx: /\b(sindica|filiacao)\b/ },
  { id: "g-sexual", rx: /\b(orientacao sexual|sexualidade)\b/ },
  { id: "g-criminal", rx: /\b(criminal|antecedente|condenacao|infraç|penal)\b/ },
];

export function analisarGdpr(texto: string): AnaliseGdpr {
  const t = norm(texto);
  const achados = DADOS_GDPR_RX.filter((d) => d.rx.test(t)).map((d) => d.id);
  const dados = achados.length ? achados : ["g-nome", "g-contato"];
  const especiais = dados.filter((d) => DADOS_GDPR.find((x) => x.id === d)?.especial);

  /* base art. 6 */
  let baseArt6 = "gdpr-legitimo";
  let rationaleArt6 = "Interesses legítimos aplicáveis mediante LIA (balancing test) documentado.";
  if (/\b(contrato|venda|compra|pedido|entrega|prestacao de servico|assinatura de|checkout)\b/.test(t)) {
    baseArt6 = "gdpr-contrato";
    rationaleArt6 = "Tratamento necessário à execução de contrato com o titular (Art. 6(1)(b)).";
  } else if (/\b(obriga|fiscal|tribut|legal|regulatorio|compliance|autoridade)\b/.test(t)) {
    baseArt6 = "gdpr-legal";
    rationaleArt6 = "Cumprimento de obrigação legal do responsável (Art. 6(1)(c)).";
  } else if (/\b(marketing|newsletter|promoca|publicidade|campanha|prospeccao|e-mail marketing)\b/.test(t)) {
    baseArt6 = "gdpr-consent";
    rationaleArt6 = "Marketing direto exige consentimento válido nos termos do RGPD e ePrivacy.";
  } else if (/\b(cftv|vigilancia|seguranca patrimonial|monitora|fraude|prevencao de)\b/.test(t)) {
    baseArt6 = "gdpr-legitimo";
    rationaleArt6 = "Interesse legítimo em segurança patrimonial; documentar LIA e sinalização.";
  } else if (/\b(governo|setor publico|funcao publica|administracao publica)\b/.test(t)) {
    baseArt6 = "gdpr-publico";
    rationaleArt6 = "Exercício de função de interesse público (Art. 6(1)(e)).";
  } else if (/\b(emergencia|vida|saude publica|vital)\b/.test(t)) {
    baseArt6 = "gdpr-vital";
    rationaleArt6 = "Proteção de interesses vitais do titular (Art. 6(1)(d)).";
  }

  /* condição art. 9 quando há categorias especiais */
  let baseArt9: string | undefined;
  let rationaleArt9: string | undefined;
  if (especiais.length) {
    if (especiais.includes("g-saude")) {
      baseArt9 = "gdpr9-saude";
      rationaleArt9 = "Medicina do trabalho/preventiva com segredo profissional (Art. 9(2)(h)).";
    } else if (especiais.includes("g-biometria")) {
      baseArt9 = "gdpr9-consent";
      rationaleArt9 = "Biometria para identificação única exige consentimento explícito (Art. 9(2)(a)).";
    } else if (especiais.includes("g-criminal")) {
      baseArt9 = "gdpr10-criminal";
      rationaleArt9 = "Dados penais somente sob controle de autoridade ou autorização legal (Art. 10).";
    } else {
      baseArt9 = "gdpr9-consent";
      rationaleArt9 = "Consentimento explícito e específico para categorias especiais (Art. 9(2)(a)).";
    }
  }

  /* transferência internacional */
  const fora = /\b(eua|usa|estados unidos|aws|google|meta|azure|microsoft 365|india|china|cloud|hubspot|salesforce|zendesk|mailchimp)\b/.test(t);
  const mecanismoSugerido = fora ? "Cláusulas contratuais-tipo — SCCs (Art. 46(2)(c))" : undefined;

  /* risco e medidas */
  const altoRisco = especiais.length > 0 || /\b(grande escala|large scale|massiv|milhoes)\b/.test(t);
  const risco: 1 | 2 | 3 = altoRisco ? 3 : /\b(financeiro|pagamento|cartao|biometri|saude|crianca|menor)\b/.test(t) ? 2 : 1;
  const medidas = [
    "Criptografia em trânsito (TLS 1.2+)",
    "Minimização e pseudonimização (Art. 25)",
    "Registro no Art. 30 (ROPA)",
  ];
  if (fora) medidas.push("SCCs + Transfer Impact Assessment (TIA)");
  if (especiais.length) medidas.push("Restrição de acesso a dados do Art. 9");
  if (baseArt6 === "gdpr-consent") medidas.push("Consent management com trilha de prova");
  if (baseArt6 === "gdpr-legitimo") medidas.push("Legitimate Interest Assessment (LIA)");
  if (risco === 3) medidas.push("DPIA obrigatória (Art. 35)");

  const alertas: string[] = [];
  if (especiais.length) alertas.push(`Categorias especiais detectadas (${especiais.length}) — o Art. 9 proíbe o tratamento sem condição específica.`);
  if (fora) alertas.push("Transferência para fora do EEE — aplicar Capítulo V (SCCs + TIA pós-Schrems II).");
  if (baseArt6 === "gdpr-consent") alertas.push("Consentimento deve ser livre, específico, informado e revogável (Art. 7).");
  if (/\b(crianca|menor|child)\b/.test(t)) alertas.push("Dados de menores: Art. 8 exige verificação de idade e consentimento parental (abaixo de 16/13 anos).");

  const confianca = Math.min(97, 58 + achados.length * 6 + (especiais.length ? 8 : 0) + (fora ? 5 : 0));

  const titulo = texto.trim().split(/[.\n]/)[0].slice(0, 70) || "Nova operação de tratamento";

  return {
    titulo: titulo.charAt(0).toUpperCase() + titulo.slice(1),
    finalidades: texto.trim(),
    dados,
    especiais,
    titulares: ["Titulares UE", ...(especiais.length || /empregado|funcionario|rh/.test(t) ? ["Empregados"] : [])],
    baseArt6,
    rationaleArt6,
    baseArt9,
    rationaleArt9,
    retencao: altoRisco ? "Definir prazo específico + revisão anual" : baseArt6 === "gdpr-consent" ? "Até retirada do consentimento" : "Conforme obrigação legal aplicável",
    destinatarios: fora ? ["Fornecedor extra-EEE (processor)"] : [],
    transferencia: fora,
    mecanismoSugerido,
    risco,
    medidas,
    alertas,
    confianca,
  };
}

/* ------------------- Planejador ISO ------------------- */

export interface PlanoIso {
  frameworkId: string;
  gap: { total: number; nao: number; andamento: number; conformes: number };
  fases: { fase: string; prazo: string; acoes: string[] }[];
}

export function sugerirPlanoIso(frameworkId: string, iso: Record<string, Record<string, ControleEstado>>): PlanoIso {
  const fw = FRAMEWORKS.find((f) => f.id === frameworkId)!;
  const mapa = iso[frameworkId] ?? {};
  const pendentes = fw.controles.filter((c) => {
    const e = mapa[c.id]?.estado ?? "nao";
    return e === "nao" || e === "andamento";
  });
  const nao = pendentes.filter((c) => (mapa[c.id]?.estado ?? "nao") === "nao");
  const andamento = pendentes.filter((c) => mapa[c.id]?.estado === "andamento");
  const conformes = fw.controles.length - pendentes.length;

  const gov = pendentes.filter((c) => /governanca|lideranca|contexto|principios|estrutura|planejamento/i.test(c.dominio));
  const oper = pendentes.filter((c) => !/governanca|lideranca|contexto|principios|estrutura|planejamento/i.test(c.dominio));
  const acao = (c: (typeof fw.controles)[number], verbo: string) => `${verbo} ${c.ref} — ${c.titulo}`;

  const fases: PlanoIso["fases"] = [
    {
      fase: "Fase 1 · Diagnóstico e governança",
      prazo: "Semanas 1–3",
      acoes: [
        "Executar gap analysis formal contra a norma e registrar evidências",
        "Obter patrocínio da alta direção com mandato e orçamento definidos",
        ...gov.slice(0, 4).map((c) => acao(c, "Estabelecer")),
      ].slice(0, 6),
    },
    {
      fase: "Fase 2 · Documentação e desenho",
      prazo: "Semanas 4–7",
      acoes: [
        "Revisar e aprovar políticas com donos definidos",
        "Definir indicadores (KPIs) e matriz de responsabilidades (RACI)",
        ...andamento.slice(0, 3).map((c) => acao(c, "Concluir")),
        ...oper.filter((c) => (mapa[c.id]?.estado ?? "nao") === "nao").slice(0, 3).map((c) => acao(c, "Projetar controle")),
      ].slice(0, 6),
    },
    {
      fase: "Fase 3 · Implementação e conscientização",
      prazo: "Semanas 8–14",
      acoes: [
        "Implantar controles priorizados por risco residual",
        "Treinamento de conscientização para 100% do público-alvo",
        ...oper.filter((c) => (mapa[c.id]?.estado ?? "nao") === "nao").slice(3, 8).map((c) => acao(c, "Implementar")),
      ].slice(0, 6),
    },
    {
      fase: "Fase 4 · Verificação e melhoria contínua",
      prazo: "Semanas 15–20",
      acoes: [
        "Auditoria interna com plano de ação para não conformidades",
        "Análise crítica pela direção e evidências para certificação",
        "Agendar ciclo de monitoramento contínuo (trimestral)",
      ],
    },
  ];

  return {
    frameworkId,
    gap: { total: fw.controles.length, nao: nao.length, andamento: andamento.length, conformes },
    fases,
  };
}

export const nivelMaturidade = (pct: number): { label: string; cor: string } => {
  if (pct >= 85) return { label: "Pronto para certificação", cor: "var(--color-moss)" };
  if (pct >= 60) return { label: "Implementação consolidada", cor: "#2f7f74" };
  if (pct >= 30) return { label: "Programa em curso", cor: "var(--color-amber)" };
  return { label: "Fase inicial", cor: "var(--color-rust)" };
};

/* ------------------- Script de segurança (hardening) ------------------- */

export const SCRIPT_HARDENING = `#!/usr/bin/env bash
# ============================================================
# Radar GRC — script de hardening do servidor de produção
# Gere este arquivo na Central de Segurança e execute como root.
# Compatível com Ubuntu 22.04+/Debian 12+. Revise antes de aplicar.
# ============================================================
set -euo pipefail
echo "[radar] Iniciando hardening..."

# 1) Atualizações e pacotes mínimos
apt update && apt -y upgrade && apt -y install ufw fail2ban certbot python3-certbot-nginx unattended-upgrades

# 2) Firewall (default deny inbound)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp   # SSH — restrinja ao seu IP: ufw delete allow 22/tcp && ufw allow from SEU_IP to any port 22 proto tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 3) SSH endurecido
sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/'       /etc/ssh/sshd_config
sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
sed -i 's/^#\\?MaxAuthTries.*/MaxAuthTries 3/'              /etc/ssh/sshd_config
systemctl restart sshd

# 4) Fail2ban contra força bruta
printf '[sshd]\\nenabled = true\\nmaxretry = 3\\nbantime = 3600\\n' > /etc/fail2ban/jail.d/radar.conf
systemctl enable --now fail2ban

# 5) Headers de segurança (nginx) — CSP, HSTS, anti-clickjacking
cat > /etc/nginx/snippets/security-headers.conf <<'EOF'
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header Content-Security-Policy "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; script-src 'self'" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
EOF

# 6) TLS via Let's Encrypt (ajuste o domínio)
# certbot --nginx -d seu-dominio.com.br

# 7) Atualizações automáticas de segurança
dpkg-reconfigure -plow unattended-upgrades || true

echo "[radar] Hardening concluído. Próximos passos:"
echo "  1. Incluir 'include snippets/security-headers.conf;' no server block"
echo "  2. Rodar certbot com seu domínio"
echo "  3. Validar com https://observatory.mozilla.org"
`;
