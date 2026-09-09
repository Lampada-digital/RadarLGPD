import { useEffect, useState } from "react";
import { useStore } from "../store";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   SIEM — Security Information and Event Management
   Sistema completo de monitoramento de segurança em tempo real com
   geração dinâmica de eventos, correlação e resposta a incidentes.
   ===================================================================== */

interface EventoSeguranca {
  id: string;
  ts: number;
  origem: string;
  destino: string;
  tipo: "login" | "acesso" | "alerta" | "bloqueio" | "anomalia" | "malware" | "ddos" | "phishing";
  severidade: "info" | "baixa" | "media" | "alta" | "critica";
  descricao: string;
  ip: string;
  protocolo?: string;
  porta?: number;
  usuario?: string;
  acao?: string;
}

interface RegraCorrelacao {
  id: string;
  nome: string;
  descricao: string;
  condicao: string;
  acao: string;
  ativa: boolean;
}

interface Incidente {
  id: string;
  titulo: string;
  severidade: "baixa" | "media" | "alta" | "critica";
  status: "aberto" | "em_investigacao" | "resolvido" | "fechado";
  eventos: string[];
  descricao: string;
  acao: string;
  responsavel: string;
  dataAbertura: string;
}

const REGRAS_CORRELACAO: RegraCorrelacao[] = [
  { id: "r1", nome: "Múltiplas tentativas de login falhas", descricao: "Detecta brute force", condicao: "login_falha > 5 em 60s", acao: "Bloquear IP por 15min", ativa: true },
  { id: "r2", nome: "Acesso fora do horário comercial", descricao: "Detecta atividade suspeita", condicao: "acesso entre 22h-6h", acao: "Alertar SOC", ativa: true },
  { id: "r3", nome: "SQL injection detectado", descricao: "Detecta ataques web", condicao: "payload SQL em request", acao: "Bloquear e alertar", ativa: true },
  { id: "r4", nome: "Tráfego DDoS", descricao: "Detecta negação de serviço", condicao: "requests > 1000/s", acao: "Ativar mitigação", ativa: true },
  { id: "r5", nome: "Malware detectado", descricao: "Detecta código malicioso", condicao: "assinatura conhecida", acao: "Isolar endpoint", ativa: true },
];

const SEED_INCIDENTES: Incidente[] = [
  { id: "inc1", titulo: "Ataque DDoS em web-server", severidade: "critica", status: "em_investigacao", eventos: ["e7"], descricao: "Ataque DDoS detectado com pico de 5000 req/s", acao: "Ativar mitigação DDoS", responsavel: "SOC", dataAbertura: "2026-01-20 14:30" },
  { id: "inc2", titulo: "Malware Trojan em endpoint", severidade: "alta", status: "aberto", eventos: ["e8"], descricao: "Malware Trojan detectado em endpoint Windows", acao: "Isolar endpoint e remover malware", responsavel: "Equipe de Segurança", dataAbertura: "2026-01-20 14:25" },
  { id: "inc3", titulo: "Tentativa de SQL injection", severidade: "alta", status: "resolvido", eventos: ["e5"], descricao: "Múltiplas tentativas de SQL injection bloqueadas", acao: "Bloquear IP atacante", responsavel: "WAF", dataAbertura: "2026-01-20 14:15" },
];

function gerarEventoAleatorio(): EventoSeguranca {
  const tipos: EventoSeguranca["tipo"][] = ["login", "acesso", "alerta", "bloqueio", "anomalia", "malware", "ddos", "phishing"];
  const severidades: EventoSeguranca["severidade"][] = ["info", "baixa", "media", "alta", "critica"];
  const tipo = tipos[Math.floor(Math.random() * tipos.length)];
  const severidade = severidades[Math.floor(Math.random() * severidades.length)];
  
  const descricoes: Record<string, string[]> = {
    login: ["Login bem-sucedido via SSO", "Login com MFA", "Login fora do horário"],
    acesso: ["Consulta SQL executada", "Acesso a arquivo sensível", "Conexão SSH estabelecida"],
    alerta: ["Acesso fora do horário comercial", "Tentativa de acesso privilegiado", "Comportamento anômalo detectado"],
    bloqueio: ["Tentativa de acesso bloqueada", "IP bloqueado por firewall", "Porta bloqueada"],
    anomalia: ["Padrão de SQL injection detectado", "Comportamento suspeito de usuário", "Tráfego anômalo detectado"],
    malware: ["Malware Trojan detectado", "Ransomware bloqueado", "Vírus em email"],
    ddos: ["Ataque DDoS detectado", "Pico de tráfego anômalo", "SYN flood detectado"],
    phishing: ["Email de phishing bloqueado", "Link malicioso detectado", "Tentativa de spear phishing"],
  };
  
  const descricao = descricoes[tipo][Math.floor(Math.random() * descricoes[tipo].length)];
  const ip = `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  const destinos = ["servidor-rh", "banco-dados", "web-server", "servidor-arquivos", "servidor-email", "endpoint-win10"];
  const destino = destinos[Math.floor(Math.random() * destinos.length)];
  const protocolos = ["HTTPS", "HTTP", "SSH", "MySQL", "SMTP", "SMB"];
  const protocolo = protocolos[Math.floor(Math.random() * protocolos.length)];
  const portas = [443, 80, 22, 3306, 25, 445];
  const porta = portas[Math.floor(Math.random() * portas.length)];
  const usuarios = ["joao.silva", "maria.santos", "pedro.costa", "ana.oliveira", "app_service"];
  const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];
  
  return {
    id: `e${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ts: Date.now(),
    origem: ip,
    destino,
    tipo,
    severidade,
    descricao,
    ip,
    protocolo,
    porta,
    usuario,
  };
}

const COR_SEV = {
  info: "bg-paper-deep text-ink-faint",
  baixa: "bg-moss/12 text-moss",
  media: "bg-amber-soft text-ink",
  alta: "bg-rust-soft text-rust",
  critica: "bg-rust text-cream",
};

const COR_TIPO = {
  login: "text-moss",
  acesso: "text-ink-soft",
  alerta: "text-amber",
  bloqueio: "text-[#1f4e8f]",
  anomalia: "text-rust",
  malware: "text-rust",
  ddos: "text-rust",
  phishing: "text-amber",
};

const COR_INCIDENTE = {
  aberto: "bg-rust-soft text-rust",
  em_investigacao: "bg-amber-soft text-ink",
  resolvido: "bg-moss/12 text-moss",
  fechado: "bg-paper-deep text-ink-faint",
};

function fmtHora(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Siem() {
  const { toast, registrar } = useStore();
  const [eventos, setEventos] = useState<EventoSeguranca[]>([]);
  const [incidentes, setIncidentes] = useState<Incidente[]>(SEED_INCIDENTES);
  const [filtro, setFiltro] = useState<string>("todos");
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [aba, setAba] = useState<"eventos" | "incidentes" | "regras">("eventos");

  // Geração dinâmica de eventos
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      const novoEvento = gerarEventoAleatorio();
      setEventos((prev) => [novoEvento, ...prev].slice(0, 100));
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Inicializar com eventos seed
  useEffect(() => {
    setEventos([
      { id: "e1", ts: Date.now() - 120000, origem: "192.168.1.100", destino: "servidor-rh", tipo: "login", severidade: "info", descricao: "Login bem-sucedido via SSO", ip: "192.168.1.100", protocolo: "HTTPS", porta: 443, usuario: "joao.silva" },
      { id: "e2", ts: Date.now() - 95000, origem: "10.0.0.45", destino: "banco-dados", tipo: "acesso", severidade: "baixa", descricao: "Consulta SQL executada", ip: "10.0.0.45", protocolo: "MySQL", porta: 3306, usuario: "app_service" },
      { id: "e3", ts: Date.now() - 72000, origem: "203.0.113.50", destino: "firewall", tipo: "bloqueio", severidade: "media", descricao: "Tentativa de acesso bloqueada por firewall", ip: "203.0.113.50", protocolo: "TCP", porta: 22 },
      { id: "e4", ts: Date.now() - 48000, origem: "192.168.1.200", destino: "servidor-arquivos", tipo: "alerta", severidade: "alta", descricao: "Acesso fora do horário comercial", ip: "192.168.1.200", protocolo: "SMB", porta: 445, usuario: "maria.santos" },
      { id: "e5", ts: Date.now() - 25000, origem: "198.51.100.23", destino: "web-server", tipo: "anomalia", severidade: "critica", descricao: "Padrão de SQL injection detectado", ip: "198.51.100.23", protocolo: "HTTP", porta: 80 },
    ]);
  }, []);

  const filtrados = eventos.filter((e) => filtro === "todos" || e.severidade === filtro);

  const stats = {
    total: eventos.length,
    criticas: eventos.filter((e) => e.severidade === "critica").length,
    altas: eventos.filter((e) => e.severidade === "alta").length,
    bloqueios: eventos.filter((e) => e.tipo === "bloqueio").length,
    incidentesAbertos: incidentes.filter((i) => i.status === "aberto" || i.status === "em_investigacao").length,
  };

  const atualizarIncidente = (id: string, patch: Partial<Incidente>) => {
    setIncidentes((l) => l.map((i) => i.id === id ? { ...i, ...patch } : i));
    registrar("siem", `Incidente ${id} atualizado.`);
    toast("Incidente atualizado.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Segurança · monitoramento em tempo real"
        titulo="SIEM — Security Information and Event Management"
        desc="Monitoramento centralizado de eventos de segurança, detecção de anomalias, correlação de eventos e resposta a incidentes em tempo real."
        acao={
          <button
            onClick={() => { setAutoRefresh(!autoRefresh); toast(autoRefresh ? "Auto-refresh pausado." : "Auto-refresh ativado."); }}
            className={`inline-flex items-center gap-2 rounded-md px-4 py-2 text-[12px] font-bold transition ${autoRefresh ? "bg-moss text-cream" : "border border-sand bg-cream text-ink-soft"}`}
          >
            <span className={`size-2 rounded-full ${autoRefresh ? "pulse-dot bg-lime" : "bg-ink-faint"}`} />
            {autoRefresh ? "Ao vivo" : "Pausado"}
          </button>
        }
      />

      <Reveal>
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
          {[
            { l: "Eventos (24h)", v: stats.total, cor: "text-ink" },
            { l: "Críticos", v: stats.criticas, cor: "text-rust" },
            { l: "Altos", v: stats.altas, cor: "text-amber" },
            { l: "Bloqueios", v: stats.bloqueios, cor: "text-[#1f4e8f]" },
            { l: "Incidentes Abertos", v: stats.incidentesAbertos, cor: "text-rust" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-sand bg-cream p-4">
              <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <p className={`font-display mt-2 text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={60}>
        <div className="mb-4 flex gap-2">
          {(["eventos", "incidentes", "regras"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAba(a)}
              className={`rounded-md border px-4 py-2 text-[12px] font-bold transition ${aba === a ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}
            >
              {a === "eventos" ? "Eventos" : a === "incidentes" ? "Incidentes" : "Regras de Correlação"}
            </button>
          ))}
        </div>
      </Reveal>

      {aba === "eventos" && (
        <>
          <Reveal delay={80}>
            <div className="mb-4 flex flex-wrap gap-2">
              {(["todos", "critica", "alta", "media", "baixa", "info"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltro(f)}
                  className={`rounded-md border px-3 py-1.5 text-[11px] font-bold uppercase transition ${filtro === f ? "border-pine bg-pine text-lime" : "border-sand bg-cream text-ink-soft hover:border-moss"}`}
                >
                  {f === "todos" ? "Todos" : f}
                </button>
              ))}
            </div>
          </Reveal>

          <Reveal delay={100}>
            <div className="overflow-hidden rounded-lg border border-sand bg-cream">
              <div className="border-b border-sand bg-paper px-4 py-3">
                <h2 className="font-display text-[14px] font-bold text-ink">Feed de eventos de segurança em tempo real</h2>
              </div>
              <div className="max-h-[500px] overflow-y-auto">
                {filtrados.length === 0 ? (
                  <div className="px-6 py-14 text-center">
                    <Ic name="shield" size={30} className="mx-auto text-sand" />
                    <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhum evento neste filtro</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-sand/60">
                    {filtrados.map((e) => (
                      <li key={e.id} className="group flex items-center gap-3 px-4 py-3 transition hover:bg-paper">
                        <span className="w-[80px] shrink-0 text-[10px] font-semibold text-ink-faint tabular-nums">{fmtHora(e.ts)}</span>
                        <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${COR_SEV[e.severidade]}`}>{e.severidade}</span>
                        <span className={`font-display shrink-0 text-[11px] font-bold uppercase ${COR_TIPO[e.tipo]}`}>{e.tipo}</span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-semibold text-ink">{e.descricao}</p>
                          <p className="text-[10px] text-ink-faint">{e.origem} → {e.destino} {e.usuario && `· ${e.usuario}`}</p>
                        </div>
                        <code className="shrink-0 rounded-sm bg-paper-deep px-2 py-0.5 text-[9.5px] font-bold text-ink-soft">{e.ip}</code>
                        {e.protocolo && <code className="shrink-0 rounded-sm bg-paper-deep px-2 py-0.5 text-[9.5px] font-bold text-ink-soft">{e.protocolo}:{e.porta}</code>}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Reveal>
        </>
      )}

      {aba === "incidentes" && (
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[14px] font-bold text-ink">Incidentes de segurança</h2>
            </div>
            {incidentes.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <Ic name="check" size={30} className="mx-auto text-moss" />
                <p className="font-display mt-3 text-[16px] font-bold text-ink">Nenhum incidente registrado</p>
              </div>
            ) : (
              <ul className="divide-y divide-sand/60">
                {incidentes.map((inc) => (
                  <li key={inc.id} className="group px-4 py-4 transition hover:bg-paper">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${COR_SEV[inc.severidade]}`}>{inc.severidade}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[9px] font-extrabold uppercase ${COR_INCIDENTE[inc.status]}`}>{inc.status.replace("_", " ")}</span>
                        </div>
                        <p className="mt-2 text-[13px] font-bold text-ink">{inc.titulo}</p>
                        <p className="mt-1 text-[11.5px] text-ink-soft">{inc.descricao}</p>
                        <p className="mt-1 text-[10.5px] text-ink-faint">Ação: {inc.acao} · Responsável: {inc.responsavel} · Aberto: {inc.dataAbertura}</p>
                      </div>
                      <select
                        value={inc.status}
                        onChange={(e) => atualizarIncidente(inc.id, { status: e.target.value as Incidente["status"] })}
                        className="rounded-md border border-sand bg-cream px-2 py-1 text-[10px] font-bold text-ink-soft outline-none focus:border-moss"
                      >
                        <option value="aberto">Aberto</option>
                        <option value="em_investigacao">Em investigação</option>
                        <option value="resolvido">Resolvido</option>
                        <option value="fechado">Fechado</option>
                      </select>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Reveal>
      )}

      {aba === "regras" && (
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3">
              <h2 className="font-display text-[14px] font-bold text-ink">Regras de correlação de eventos</h2>
            </div>
            <ul className="divide-y divide-sand/60">
              {REGRAS_CORRELACAO.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-4 py-3 transition hover:bg-paper">
                  <span className={`grid size-8 shrink-0 place-items-center rounded-md ${r.ativa ? "bg-moss/10 text-moss" : "bg-paper-deep text-ink-faint"}`}>
                    <Ic name={r.ativa ? "check" : "x"} size={16} sw={2.4} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-[12.5px] font-bold text-ink">{r.nome}</p>
                    <p className="text-[10.5px] text-ink-faint">{r.descricao} · {r.condicao}</p>
                    <p className="mt-0.5 text-[10px] text-moss font-semibold">Ação: {r.acao}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      )}

      <Reveal delay={140}>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { ic: "alert", t: "Regras de correlação", d: "Detecte padrões de ataque combinando múltiplos eventos automaticamente." },
            { ic: "shield", t: "Resposta automatizada", d: "Bloqueie IPs maliciosos e isole endpoints automaticamente." },
            { ic: "doc", t: "Relatórios de conformidade", d: "Gere relatórios para auditorias ISO 27001, SOC 2 e PCI-DSS." },
          ].map((c) => (
            <div key={c.t} className="rounded-lg border border-sand bg-cream p-4">
              <span className="grid size-9 place-items-center rounded-md bg-moss/10 text-moss"><Ic name={c.ic} size={18} sw={2} /></span>
              <p className="mt-2.5 text-[13px] font-bold text-ink">{c.t}</p>
              <p className="mt-0.5 text-[11.5px] leading-snug text-ink-soft">{c.d}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </div>
  );
}
