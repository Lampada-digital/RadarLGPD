/* =====================================================================
   Geração de políticas e documentos de auditoria (PDF) por framework.
   Versão CONTROLADO com 60%+ de conformidade; RASCUNHO antes disso.
   ===================================================================== */

import { FRAMEWORKS, progressoFramework } from "./domain";
import type { ControleEstado, Framework } from "./domain";
import { DocPdf } from "./pdf";

export const PDF_ADEQUADO_MIN = 60;

export interface Politica {
  codigo: string;
  titulo: string;
  objetivo: string;
  diretrizes: string[];
}

export const POLITICAS: Record<string, Politica[]> = {
  iso27001: [
    { codigo: "POL-SI-001", titulo: "Política de Segurança da Informação", objetivo: "Estabelecer diretrizes para proteger a confidencialidade, integridade e disponibilidade das informações da organização.", diretrizes: ["Classificar e inventariar ativos de informação", "Aplicar controle de acesso baseado em função (RBAC)", "Exigir autenticação multifator em sistemas críticos", "Realizar backups com teste periódico de restauração", "Tratar incidentes conforme plano de resposta"] },
    { codigo: "POL-SI-002", titulo: "Política de Gestão de Riscos e SoA", objetivo: "Definir metodologia de avaliação e tratamento de riscos de segurança, com Declaração de Aplicabilidade.", diretrizes: ["Avaliar riscos com matriz 5x5 (probabilidade x impacto)", "Documentar plano de tratamento com responsáveis e prazos", "Manter SoA atualizada com justificativas de inclusão/exclusão", "Revisar riscos a cada mudança relevante"] },
  ],
  iso27701: [
    { codigo: "POL-PRIV-001", titulo: "Política de Privacidade e Proteção de PII", objetivo: "Estabelecer o Sistema de Gestão de Privacidade alinhado a LGPD e GDPR para o tratamento de dados pessoais.", diretrizes: ["Mapear fluxos de PII de ponta a ponta", "Fundamentar cada tratamento em base legal", "Realizar DPIA para tratamentos de alto risco", "Garantir exercício de direitos dos titulares", "Controlar transferências internacionais"] },
    { codigo: "POL-PRIV-002", titulo: "Política de Direitos dos Titulares", objetivo: "Definir prazos e procedimentos para atendimento a solicitações de titulares (acesso, retificação, apagamento).", diretrizes: ["Atender solicitações em até 15 dias (LGPD) / 30 dias (GDPR)", "Registrar e rastrear todas as solicitações", "Validar identidade do solicitante antes de responder", "Manter evidência do atendimento"] },
  ],
  iso27002: [
    { codigo: "POL-CTL-001", titulo: "Política de Controles de Segurança", objetivo: "Implementar o catálogo de controles do Anexo A da ISO/IEC 27002 nas dimensões organizacional, pessoas, física e tecnológica.", diretrizes: ["Manter inventário de ativos com proprietários definidos", "Aplicar princípio do menor privilégio", "Exigir MFA e gestão segura de credenciais", "Testar restauração de backups periodicamente"] },
    { codigo: "POL-CTL-002", titulo: "Política de Controle de Acesso", objetivo: "Garantir acesso autorizado e proporcional aos sistemas e informações.", diretrizes: ["Provisionar acesso por função aprovada", "Revisar acessos periodicamente", "Revogar acesso em desligamentos imediatamente"] },
  ],
  iso22301: [
    { codigo: "POL-BCM-001", titulo: "Política de Continuidade de Negócios", objetivo: "Estabelecer o Sistema de Gestão de Continuidade de Negócios para manter operações essenciais durante disrupções.", diretrizes: ["Realizar BIA para identificar atividades críticas e RTO/RPO", "Elaborar planos de continuidade e recuperação", "Realizar exercícios e testes periódicos", "Manter contatos de emergência atualizados"] },
    { codigo: "POL-BCM-002", titulo: "Política de Resposta a Incidentes Disruptivos", objetivo: "Definir acionamento e comunicação durante eventos que ameacem a continuidade.", diretrizes: ["Acionar plano conforme critérios de severidade", "Comunicar partes interessadas em tempo definido", "Registrar lições aprendidas pós-incidente"] },
  ],
  iso31000: [
    { codigo: "POL-RISCO-001", titulo: "Política de Gestão de Riscos Corporativos", objetivo: "Estruturar o processo de identificação, análise, avaliação e tratamento de riscos em toda a organização.", diretrizes: ["Integrar gestão de riscos à tomada de decisão", "Manter matriz de riscos com apetite definido", "Monitorar riscos e indicadores continuamente"] },
    { codigo: "POL-RISCO-002", titulo: "Política de Apetite e Tolerância a Riscos", objetivo: "Definir níveis aceitáveis de risco e critérios de escalonamento.", diretrizes: ["Definir apetite por categoria de risco", "Escalonar riscos acima da tolerância"] },
  ],
  iso37301: [
    { codigo: "POL-COMP-001", titulo: "Política de Compliance e Integridade", objetivo: "Estabelecer o Sistema de Gestão de Compliance para prevenir, detectar e responder a não conformidades.", diretrizes: ["Mapear obrigações de compliance aplicáveis", "Manter canal de denúncias independente", "Realizar due diligence de terceiros", "Treinar colaboradores periodicamente"] },
    { codigo: "POL-COMP-002", titulo: "Política Anticorrupção e Antissuborno", objetivo: "Prevenir práticas de corrupção e suborno em todas as relações da organização.", diretrizes: ["Proibir pagamentos de facilitação", "Controlar brindes, hospitalidades e doações", "Reportar suspeitas sem retaliação"] },
  ],
  iso37001: [
    { codigo: "POL-AS-001", titulo: "Política Antissuborno", objetivo: "Estabelecer controles para prevenir, detectar e tratar suborno (ISO 37001).", diretrizes: ["Realizar due diligence antissuborno de parceiros", "Exigir cláusulas antissuborno em contratos", "Manter função de compliance independente"] },
    { codigo: "POL-AS-002", titulo: "Política de Brindes e Hospitalidades", objetivo: "Definir limites aceitáveis para brindes, refeições e hospitalidades.", diretrizes: ["Registrar brindes acima do limite", "Proibir ofertas a agentes públicos sem aprovação"] },
  ],
  soc2: [
    { codigo: "POL-SOC-001", titulo: "Política de Controles SOC 2 (Trust Services Criteria)", objetivo: "Estabelecer controles de segurança, disponibilidade, integridade, confidencialidade e privacidade para o exame SOC 2 Type II.", diretrizes: ["Manter controle de acesso lógico com MFA e RBAC", "Monitorar e responder a incidentes", "Definir RTO/RPO e testar resiliência", "Documentar evidências para o período de observação"] },
    { codigo: "POL-SOC-002", titulo: "Política de Gestão de Mudanças", objetivo: "Garantir que mudanças em sistemas sejam autorizadas, testadas e aprovadas.", diretrizes: ["Separar ambientes de desenvolvimento e produção", "Exigir aprovação antes de deploy", "Registrar mudanças e reversões"] },
  ],
  pcidss: [
    { codigo: "POL-PCI-001", titulo: "Política de Proteção de Dados de Cartão (PCI-DSS)", objetivo: "Proteger dados de titular de cartão no ambiente CDE conforme PCI-DSS v4.0.", diretrizes: ["Manter firewall e segmentação de rede do CDE", "Criptografar PAN em repouso e nunca exibi-lo completo", "Exigir identificação única e MFA", "Manter política de segurança atualizada"] },
    { codigo: "POL-PCI-002", titulo: "Política de Acesso ao CDE", objetivo: "Restringir acesso ao ambiente de dados de cartão ao mínimo necessário.", diretrizes: ["Conceder acesso por necessidade de conhecer", "Revisar acessos trimestralmente"] },
  ],
  "ai-gov": [
    { codigo: "POL-IA-001", titulo: "Política de Governança e Uso Responsável de IA", objetivo: "Estabelecer o Sistema de Gestão de IA (ISO/IEC 42001) para desenvolvimento e uso responsável de sistemas de IA.", diretrizes: ["Classificar riscos dos sistemas de IA", "Realizar avaliação de impacto de IA", "Garantir supervisão humana em decisões críticas", "Documentar transparência e explicabilidade"] },
    { codigo: "POL-IA-002", titulo: "Política de Conformidade ao EU AI Act", objetivo: "Assegurar conformidade com o Regulamento Europeu de IA para sistemas ofertados na UE.", diretrizes: ["Classificar sistemas por nível de risco do AI Act", "Proibir práticas de risco inaceitável", "Manter supervisão humana e transparência"] },
  ],
  cookies: [
    { codigo: "POL-CK-001", titulo: "Política de Cookies e Consentimento", objetivo: "Estabelecer regras para uso de cookies e tecnologias de rastreamento conforme ePrivacy e GDPR.", diretrizes: ["Bloquear cookies não essenciais até consentimento", "Oferecer paridade entre aceitar e recusar", "Manter inventário de cookies atualizado"] },
    { codigo: "POL-CK-002", titulo: "Política de Gestão de Consentimento (CMP)", objetivo: "Definir requisitos para a plataforma de gestão de consentimento e registro de provas.", diretrizes: ["Registrar evidência de consentimento", "Permitir retirada tão fácil quanto a concessão"] },
  ],
};

const NORMAS_REF: Record<string, string> = {
  iso27001: "ISO/IEC 27001:2022",
  iso27701: "ISO/IEC 27701:2019",
  iso27002: "ISO/IEC 27002:2022",
  iso22301: "ISO 22301:2019",
  iso31000: "ISO 31000:2018",
  iso37301: "ISO 37301:2021",
  iso37001: "ISO 37001:2016",
  soc2: "AICPA SOC 2 Type II / TSC",
  pcidss: "PCI-DSS v4.0",
  "ai-gov": "ISO/IEC 42001 / EU AI Act",
  cookies: "ePrivacy 2002/58/CE / GDPR",
};

export function gerarPacotePdf(opts: {
  fw: Framework;
  mapa: Record<string, ControleEstado>;
  pct: number;
  empresa: string;
  responsavel: string;
}) {
  const { fw, mapa, pct, empresa, responsavel } = opts;
  const oficial = pct >= PDF_ADEQUADO_MIN;
  const doc = new DocPdf(`Pacote documental — ${fw.codigo}`);

  /* capa */
  doc.gap(120);
  doc.titulo(fw.codigo, 30);
  doc.gap(6);
  doc.titulo(fw.titulo, 16, [46, 107, 84]);
  doc.linhaH();
  doc.gap(20);
  doc.texto(`Pacote de políticas e evidências para ${oficial ? "auditoria e certificação" : "revisão interna (rascunho)"}.`, 12, [40, 50, 45]);
  doc.gap(30);
  doc.texto(`Organização: ${empresa}`, 11);
  doc.texto(`Responsável: ${responsavel}`, 11);
  doc.texto(`Norma de referência: ${NORMAS_REF[fw.id] ?? fw.codigo}`, 11);
  doc.texto(`Conformidade atual: ${pct}% — ${oficial ? "CONTROLADO" : "RASCUNHO (abaixo de 60%)"}`, 11, oficial ? [46, 107, 84] : [189, 79, 38]);
  doc.texto(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 11);
  if (!oficial) {
    doc.gap(16);
    doc.texto("MARCA D'ÁGUA — DOCUMENTO EM RASCUNHO. Alcance 60% de conformidade para emitir a versão CONTROLADO.", 10, [189, 79, 38], true);
  }
  doc.gap(200);
  doc.texto("Radar GRC — Privacidade e Compliance com IA", 9, [120, 134, 124]);

  /* políticas */
  const politicas = POLITICAS[fw.id] ?? [];
  for (const pol of politicas) {
    doc.gap(30);
    doc.titulo(`${pol.codigo} — ${pol.titulo}`, 14);
    doc.linhaH();
    doc.gap(8);
    doc.texto("1. OBJETIVO", 11, [19, 46, 38], true);
    doc.texto(pol.objetivo, 10);
    doc.gap(8);
    doc.texto("2. DIRETRIZES", 11, [19, 46, 38], true);
    pol.diretrizes.forEach((d) => doc.item(d));
    doc.gap(8);
    doc.texto(`3. REFERÊNCIA NORMATIVA: ${NORMAS_REF[fw.id] ?? fw.codigo}`, 9, [120, 134, 124]);
    doc.texto("Vigência: a partir da aprovação pela alta direção. Revisão anual ou quando houver mudança relevante.", 9, [120, 134, 124]);
  }

  /* anexo — situação dos controles */
  doc.gap(20);
  doc.titulo("Anexo A — Situação dos Controles", 14);
  doc.linhaH();
  doc.gap(8);
  const linhas = fw.controles.map((ctl) => {
    const st = mapa[ctl.id];
    const estado = st?.estado ?? "nao";
    const label = estado === "verif" ? "Verificado" : estado === "impl" ? "Implementado" : estado === "andamento" ? "Em andamento" : "Não iniciado";
    return [ctl.ref, ctl.titulo, label, st?.nota ?? "—"];
  });
  doc.tabela(["Ref", "Controle", "Estado", "Evidência/Observação"], linhas, [45, 220, 85, 145]);

  /* aprovação */
  doc.gap(20);
  doc.titulo("Aprovação", 13);
  doc.linhaH();
  doc.gap(10);
  doc.texto("Elaborado por: ______________________________  Data: ____/____/________", 10);
  doc.gap(16);
  doc.texto(`Aprovado por: ${responsavel}  Data: ____/____/________`, 10);

  doc.baixar(`politicas-${fw.id}-${oficial ? "CONTROLADO" : "rascunho"}-v1.pdf`);
  return oficial;
}

export function planoImplementacao(fw: Framework, iso: Record<string, Record<string, ControleEstado>>) {
  const p = progressoFramework(fw, iso);
  const pendentes = fw.controles.filter((ctl) => {
    const e = iso[fw.id]?.[ctl.id]?.estado ?? "nao";
    return e === "nao" || e === "andamento";
  });
  const linhas = [
    `# Plano de Implementação — ${fw.codigo}`,
    ``,
    `Conformidade atual: **${p.pct}%** (${p.porEstado.impl + p.porEstado.verif}/${fw.controles.length} controles conformes)`,
    ``,
    `## Controles pendentes (${pendentes.length})`,
    ...pendentes.map((ctl) => `- [ ] **${ctl.ref}** — ${ctl.titulo}: ${ctl.desc}`),
    ``,
    `## Fases sugeridas`,
    `1. **Diagnóstico** — consolidar gap analysis e evidências existentes`,
    `2. **Documentação** — aprovar políticas e procedimentos`,
    `3. **Implementação** — executar controles priorizados por risco`,
    `4. **Verificação** — auditoria interna e análise crítica pela direção`,
  ];
  return linhas.join("\n");
}

export function frameworksDisponiveis() {
  return FRAMEWORKS;
}
