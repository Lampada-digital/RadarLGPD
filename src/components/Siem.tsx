import { useState } from "react";
import { useStore } from "../store";
import { Cabecalho, Ic, Reveal } from "./ui";

/* =====================================================================
   SIEM — Security Information and Event Management
   Simulação educacional de monitoramento de segurança em tempo real.
   ===================================================================== */

interface EventoSeguranca {
  id: string;
  ts: number;
  origem: string;
  destino: string;
  tipo: "login" | "acesso" | "alerta" | "bloqueio" | "anomalia";
  severidade: "info" | "baixa" | "media" | "alta" | "critica";
  descricao: string;
  ip: string;
}

const SEED_EVENTOS: EventoSeguranca[] = [
  { id: "e1", ts: Date.now() - 120000, origem: "192.168.1.100", destino: "servidor-rh", tipo: "login", severidade: "info", descricao: "Login bem-sucedido via SSO", ip: "192.168.1.100" },
  { id: "e2", ts: Date.now() - 95000, origem: "10.0.0.45", destino: "banco-dados", tipo: "acesso", severidade: "baixa", descricao: "Consulta SQL executada", ip: "10.0.0.45" },
  { id: "e3", ts: Date.now() - 72000, origem: "203.0.113.50", destino: "firewall", tipo: "bloqueio", severidade: "media", descricao: "Tentativa de acesso bloqueada por firewall", ip: "203.0.113.50" },
  { id: "e4", ts: Date.now() - 48000, origem: "192.168.1.200", destino: "servidor-arquivos", tipo: "alerta", severidade: "alta", descricao: "Acesso fora do horário comercial", ip: "192.168.1.200" },
  { id: "e5", ts: Date.now() - 25000, origem: "198.51.100.23", destino: "web-server", tipo: "anomalia", severidade: "critica", descricao: "Padrão de SQL injection detectado", ip: "198.51.100.23" },
  { id: "e6", ts: Date.now() - 8000, origem: "192.168.1.50", destino: "servidor-email", tipo: "login", severidade: "info", descricao: "Login bem-sucedido", ip: "192.168.1.50" },
];

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
};

function fmtHora(ts: number) {
  return new Date(ts).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export default function Siem() {
  const { toast, registrar } = useStore();
  const [eventos] = useState<EventoSeguranca[]>(SEED_EVENTOS);
  const [filtro, setFiltro] = useState<string>("todos");
  const [autoRefresh, setAutoRefresh] = useState(true);

  const filtrados = eventos.filter((e) => filtro === "todos" || e.severidade === filtro);

  const stats = {
    total: eventos.length,
    criticas: eventos.filter((e) => e.severidade === "critica").length,
    altas: eventos.filter((e) => e.severidade === "alta").length,
    bloqueios: eventos.filter((e) => e.tipo === "bloqueio").length,
  };

  return (
    <div>
      <Cabecalho
        kicker="Segurança · monitoramento em tempo real"
        titulo="SIEM — Security Information and Event Management"
        desc="Monitoramento centralizado de eventos de segurança, detecção de anomalias e resposta a incidentes em tempo real."
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
        <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { l: "Eventos (24h)", v: stats.total, cor: "text-ink" },
            { l: "Críticos", v: stats.criticas, cor: "text-rust" },
            { l: "Altos", v: stats.altas, cor: "text-amber" },
            { l: "Bloqueios", v: stats.bloqueios, cor: "text-[#1f4e8f]" },
          ].map((s) => (
            <div key={s.l} className="rounded-lg border border-sand bg-cream p-4">
              <p className="text-[10.5px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <p className={`font-display mt-2 text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={60}>
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
            <h2 className="font-display text-[14px] font-bold text-ink">Feed de eventos de segurança</h2>
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
                      <p className="text-[10px] text-ink-faint">{e.origem} → {e.destino}</p>
                    </div>
                    <code className="shrink-0 rounded-sm bg-paper-deep px-2 py-0.5 text-[9.5px] font-bold text-ink-soft">{e.ip}</code>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </Reveal>

      <Reveal delay={140}>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {[
            { ic: "alert", t: "Regras de correlação", d: "Detecte padrões de ataque combinando múltiplos eventos." },
            { ic: "shield", t: "Resposta automatizada", d: "Bloqueie IPs maliciosos automaticamente via integração com firewall." },
            { ic: "doc", t: "Relatórios de conformidade", d: "Gere relatórios para auditorias ISO 27001 e SOC 2." },
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
