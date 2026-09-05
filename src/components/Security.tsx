import { useStore } from "../store";
import { useAuth } from "../auth";
import { useProtecao } from "../protection";
import { baixarArquivo } from "../pdf";
import { Cabecalho, Ic, Reveal } from "./ui";

const SCRIPT_HARDENING = `#!/usr/bin/env bash
# Radar GRC — Hardening do servidor de produção
set -euo pipefail

# 1) Atualizações
apt update && apt -y upgrade
apt -y install ufw fail2ban certbot unattended-upgrades

# 2) Firewall (default deny inbound)
ufw default deny incoming
ufw default allow outgoing
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# 3) SSH endurecido
sed -i 's/^#\\?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config
sed -i 's/^#\\?PasswordAuthentication.*/PasswordAuthentication no/' /etc/ssh/sshd_config
systemctl restart sshd

# 4) Fail2ban
printf '[sshd]\\nenabled = true\\nmaxretry = 3\\nbantime = 3600\\n' > /etc/fail2ban/jail.d/radar.conf
systemctl enable --now fail2ban

# 5) Headers de segurança (nginx)
cat > /etc/nginx/snippets/security-headers.conf <<'EOF'
add_header Strict-Transport-Security "max-age=63072000; includeSubDomains" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
EOF

echo "Hardening concluído."
`;

const POSTURA = [
  { t: "Senhas com hash SHA-256 + salt", d: "Web Crypto API; nunca em texto puro." },
  { t: "Bloqueio anti força-bruta", d: "Tentativas incorretas travam o acesso temporariamente." },
  { t: "E-mail corporativo obrigatório", d: "Domínios pessoais/gratuitos são recusados no acesso." },
  { t: "Sessão isolada por usuário", d: "Cada conta possui armazenamento próprio." },
  { t: "Trilha de auditoria", d: "Login, edições, exclusões e exportações registrados." },
  { t: "Camada anticópia", d: "Inspeção, cópia e embutimento bloqueados e auditados." },
  { t: "Minimização de dados", d: "Art. 6º, III LGPD e Art. 5(1)(c) GDPR." },
  { t: "Hardening de produção", d: "Script de segurança baixável (firewall, SSH, TLS)." },
];

const COR_TIPO: Record<string, string> = {
  auth: "bg-pine text-lime",
  lgpd: "bg-moss/12 text-moss",
  gdpr: "bg-[#1f4e8f]/10 text-[#1f4e8f]",
  iso: "bg-amber-soft text-ink",
  seguranca: "bg-rust-soft text-rust",
  sistema: "bg-paper-deep text-ink-soft",
};

export default function Security() {
  const { auditoria, registrar, toast } = useStore();
  const { usuario } = useAuth();
  const protecao = useProtecao();

  const exportarTrilha = () => {
    const cab = "Timestamp;Tipo;Detalhe";
    const lin = auditoria.map((e) => [new Date(e.ts).toLocaleString("pt-BR"), e.tipo, e.detalhe].join(";"));
    baixarArquivo(`trilha-auditoria-${Date.now()}.csv`, "\uFEFF" + [cab, ...lin].join("\n"), "text/csv;charset=utf-8");
    registrar("seguranca", "Trilha de auditoria exportada.");
    toast("Trilha de auditoria exportada.");
  };

  const exportarScript = () => {
    baixarArquivo("hardening-radargrc.sh", SCRIPT_HARDENING, "text/x-shellscript");
    registrar("seguranca", "Script de hardening baixado.");
    toast("Script de hardening baixado — revise antes de executar como root.");
  };

  return (
    <div>
      <Cabecalho
        kicker="Defesa em profundidade · Art. 46 LGPD / Art. 32 GDPR"
        titulo="Central de segurança"
        desc="Postura de segurança do sistema, trilha de auditoria de todas as operações e script de hardening para produção."
      />

      <Reveal>
        <div className="mb-3.5 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-lg border border-pine-line bg-pine px-5 py-4 text-cream">
          <div className="flex items-center gap-3">
            <span className={`relative grid size-10 place-items-center rounded-md border ${protecao.devtools ? "border-rust bg-rust/20 text-[#f0b39a]" : "border-lime/40 bg-pine-deep text-lime"}`}>
              <Ic name={protecao.devtools ? "eye" : "shield"} size={19} sw={2} />
              {!protecao.devtools && <span className="pulse-dot absolute -top-1 -right-1 size-2 rounded-full bg-lime" />}
            </span>
            <div>
              <p className="font-display text-[15px] leading-tight font-extrabold">
                {protecao.devtools ? "Inspeção detectada — monitoramento elevado" : "Proteção anticópia ativa"}
              </p>
              <p className="text-[11px] text-cream/55">Sessão de {usuario?.email ?? "usuário"} protegida contra cópia e clonagem.</p>
            </div>
          </div>
          <div className="ml-auto flex flex-wrap gap-2.5">
            {[
              { l: "Tentativas bloqueadas", v: String(protecao.bloqueios) },
              { l: "DevTools", v: protecao.devtools ? "Aberto" : "Fechado" },
              { l: "Embutimento iframe", v: protecao.iframeDetectado ? "Bloqueado" : "Íntegro" },
            ].map((s) => (
              <div key={s.l} className="rounded-md border border-pine-line bg-pine-deep/70 px-3 py-2 text-center">
                <p className="font-display text-[15px] leading-none font-extrabold text-lime">{s.v}</p>
                <p className="mt-1 text-[9px] font-bold tracking-[0.1em] text-cream/45 uppercase">{s.l}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <div className="grid gap-3.5 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="rail-texture h-full rounded-lg border border-pine-line bg-pine p-5 text-cream">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-[16px] font-extrabold">Postura de segurança do sistema</h2>
                <p className="text-[11.5px] text-cream/55">Controles ativos nesta instalação</p>
              </div>
              <span className="grid size-9 place-items-center rounded-md border border-lime/40 bg-pine-deep text-lime"><Ic name="shield" size={18} /></span>
            </div>
            <ul className="grid gap-2 sm:grid-cols-2">
              {POSTURA.map((p) => (
                <li key={p.t} className="rounded-md border border-pine-line bg-pine-deep/70 p-3.5 transition hover:border-lime/40">
                  <p className="flex items-center gap-2 text-[12.5px] font-bold text-cream">
                    <span className="grid size-4.5 shrink-0 place-items-center rounded-full bg-lime text-pine"><Ic name="check" size={9} sw={3.4} /></span>
                    {p.t}
                  </p>
                  <p className="mt-1.5 pl-6.5 text-[11px] leading-snug text-cream/60">{p.d}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        <Reveal delay={90} className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-lg border border-sand bg-cream p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-display text-[15px] font-bold text-ink">Script de hardening</h2>
              <span className="rounded-sm bg-paper-deep px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-ink-soft uppercase">.sh</span>
            </div>
            <p className="text-[11.5px] leading-relaxed text-ink-soft">
              Firewall default-deny, SSH sem root/senha, fail2ban, headers de segurança e TLS via Let's Encrypt.
            </p>
            <pre className="mt-3 flex-1 overflow-hidden rounded-md border border-pine-line bg-pine-deep p-3.5 text-[10px] leading-relaxed text-lime/90">
              <code>{SCRIPT_HARDENING.split("\n").slice(0, 14).join("\n") + "\n…"}</code>
            </pre>
            <button onClick={exportarScript} className="mt-3 inline-flex items-center justify-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[12.5px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
              <Ic name="download" size={14} /> Baixar hardening-radargrc.sh
            </button>
          </div>
        </Reveal>
      </div>

      <Reveal delay={140}>
        <div className="mt-3.5 overflow-hidden rounded-lg border border-sand bg-cream">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-paper px-5 py-3.5">
            <div>
              <h2 className="font-display text-[15px] font-bold text-ink">Trilha de auditoria</h2>
              <p className="text-[11.5px] text-ink-soft">{auditoria.length} evento(s) · accountability (Art. 37 LGPD · Art. 5(2) GDPR)</p>
            </div>
            <button onClick={exportarTrilha} className="inline-flex items-center gap-2 rounded-md border border-sand bg-cream px-3.5 py-2 text-[12px] font-bold text-ink-soft transition hover:border-moss hover:text-moss">
              <Ic name="download" size={13} /> Exportar CSV
            </button>
          </div>
          {auditoria.length === 0 ? (
            <p className="px-6 py-10 text-center text-[12.5px] text-ink-faint">Nenhum evento ainda — as operações do sistema serão registradas aqui.</p>
          ) : (
            <ul className="max-h-[420px] overflow-y-auto">
              {auditoria.slice(0, 40).map((e) => (
                <li key={e.id} className="flex items-center gap-3 border-b border-sand/60 px-5 py-2.5 transition-colors last:border-b-0 hover:bg-paper">
                  <span className="w-[128px] shrink-0 text-[10.5px] font-semibold whitespace-nowrap text-ink-faint">
                    {new Date(e.ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={`w-[86px] shrink-0 rounded-full px-2 py-0.5 text-center text-[9.5px] font-extrabold tracking-wide uppercase ${COR_TIPO[e.tipo] ?? "bg-paper-deep text-ink-soft"}`}>{e.tipo}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-ink">{e.detalhe}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>
    </div>
  );
}
