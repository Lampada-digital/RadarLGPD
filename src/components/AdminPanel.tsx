import { useMemo, useState } from "react";
import {
  adminRemover, adminResetarSenha, adminSetPapel, adminSetPlano, adminToggleBloqueio,
  limparSeguranca, listarBloqueiosAtivos, listarSeguranca, listarUsuarios, useAuth,
} from "../auth";
import type { Usuario } from "../auth";
import { fmtData } from "../types";
import { Cabecalho, Ic, inputCls, Reveal } from "./ui";

const COR_EVENTO: Record<string, string> = {
  login_ok: "bg-moss/12 text-moss",
  login_falha: "bg-amber-soft text-ink",
  bloqueio: "bg-rust-soft text-rust",
  cadastro: "bg-pine text-lime",
  senha_troca: "bg-paper-deep text-ink-soft",
  sessao_expirada: "bg-amber-soft text-ink",
  admin_acao: "bg-rust-soft text-rust",
  trial_ativado: "bg-lime-soft text-pine",
};

function PlanoBadge({ u }: { u: Usuario }) {
  const trial = u.plano === "pro" && u.trialAte;
  const cls = u.papel === "admin" ? "bg-pine text-lime" : u.plano === "pro" ? "bg-moss text-cream" : "bg-amber-soft text-ink";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${cls}`}>
      {u.papel === "admin" ? "Admin" : trial ? "Pro · Trial" : u.plano === "pro" ? "Pro" : "Demo"}
    </span>
  );
}

export default function AdminPanel() {
  const { usuario } = useAuth();
  const [tick, setTick] = useState(0);
  const [busca, setBusca] = useState("");
  const [confirmando, setConfirmando] = useState<string | null>(null);
  const [senhaTemp, setSenhaTemp] = useState<{ nome: string; senha: string } | null>(null);
  const [confirmaLimpar, setConfirmaLimpar] = useState(false);

  const usuarios = useMemo(() => listarUsuarios().sort((a, b) => b.criadoEm.localeCompare(a.criadoEm)), [tick]);
  const eventos = useMemo(() => listarSeguranca(), [tick]);
  const refresh = () => setTick((t) => t + 1);

  const filtrados = usuarios.filter((u) => {
    const q = busca.trim().toLowerCase();
    return !q || u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q) || u.empresa.toLowerCase().includes(q);
  });

  const stats = useMemo(() => {
    const agora = Date.now();
    return {
      total: usuarios.length,
      pro: usuarios.filter((u) => u.plano === "pro" || u.papel === "admin").length,
      bloqueados: usuarios.filter((u) => u.bloqueado).length + listarBloqueiosAtivos(),
      eventos24h: eventos.filter((e) => agora - new Date(e.ts).getTime() < 86400000).length,
      falhas24h: eventos.filter((e) => e.tipo === "login_falha" && agora - new Date(e.ts).getTime() < 86400000).length,
    };
  }, [usuarios, eventos]);

  const armazenamento = useMemo(() => {
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith("radargrc")) bytes += (localStorage.getItem(k) ?? "").length + k.length;
    }
    return (bytes / 1024).toFixed(1);
  }, [tick]);

  if (usuario?.papel !== "admin") {
    return (
      <div className="rounded-lg border border-rust/40 bg-rust-soft/30 px-6 py-10 text-center">
        <Ic name="lock" size={28} className="mx-auto text-rust" />
        <p className="font-display mt-3 text-[17px] font-bold text-ink">Acesso restrito</p>
        <p className="mt-1 text-[12.5px] text-ink-soft">Esta área é exclusiva para contas administrativas.</p>
      </div>
    );
  }

  return (
    <div>
      <Cabecalho
        kicker="Administração · gestão da plataforma"
        titulo="Painel administrativo"
        desc="Gerencie usuários, planos e permissões, audite eventos de segurança e acompanhe o uso do armazenamento. Todas as ações ficam registradas na trilha."
        acao={
          <span className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime">
            <Ic name="shield" size={15} sw={2.2} /> Sessão administrativa
          </span>
        }
      />

      {senhaTemp && (
        <div className="anim-pop mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-moss/50 bg-moss/10 px-4 py-3">
          <Ic name="key" size={16} className="text-moss" />
          <p className="text-[12.5px] text-ink-soft">
            Senha temporária de <strong className="text-ink">{senhaTemp.nome}</strong>:{" "}
            <code className="rounded-sm bg-cream px-2 py-0.5 font-extrabold text-moss">{senhaTemp.senha}</code>{" "}
            — compartilhe com segurança; o usuário deverá trocá-la no primeiro acesso.
          </p>
          <button onClick={() => setSenhaTemp(null)} className="ml-auto rounded-md border border-sand px-2.5 py-1 text-[11px] font-bold text-ink-soft hover:bg-cream">Ocultar</button>
        </div>
      )}

      {/* estatísticas */}
      <div className="grid grid-cols-2 gap-3.5 lg:grid-cols-5">
        {[
          { l: "Usuários", v: String(stats.total), icone: "user", cor: "text-ink" },
          { l: "Planos Pro", v: String(stats.pro), icone: "spark", cor: "text-moss" },
          { l: "Contas bloqueadas", v: String(stats.bloqueados), icone: "lock", cor: "text-rust" },
          { l: "Eventos (24h)", v: String(stats.eventos24h), icone: "bell", cor: "text-ink" },
          { l: "Falhas de login (24h)", v: String(stats.falhas24h), icone: "alert", cor: "text-amber" },
        ].map((s, i) => (
          <Reveal key={s.l} delay={i * 50}>
            <div className="rounded-lg border border-sand bg-cream p-4 transition hover:-translate-y-0.5 hover:border-moss/50">
              <p className="text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
              <div className="mt-2 flex items-center justify-between">
                <p className={`font-display text-[30px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
                <Ic name={s.icone} size={18} className="text-sand" />
              </div>
            </div>
          </Reveal>
        ))}
      </div>

      {/* usuários */}
      <Reveal>
        <div className="mt-4 overflow-hidden rounded-lg border border-sand bg-cream">
          <div className="flex flex-wrap items-center gap-2.5 border-b border-sand bg-paper px-4 py-3">
            <h2 className="font-display text-[15px] font-bold text-ink">Usuários da plataforma</h2>
            <div className="relative ml-auto w-full max-w-[240px]">
              <Ic name="search" size={13} className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-ink-faint" />
              <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar usuário…" className={`${inputCls} py-1.5 pl-8 text-[12px]`} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                  <th className="px-4 py-2.5">Usuário</th>
                  <th className="px-3 py-2.5">Plano / Papel</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Último acesso</th>
                  <th className="px-3 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((u) => {
                  const souEu = u.id === usuario.id;
                  return (
                    <tr key={u.id} className="border-b border-sand/70 align-middle last:border-0 hover:bg-paper">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-pine text-[10.5px] font-extrabold text-lime">
                            {u.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-[12.5px] font-bold text-ink">{u.nome}{souEu && <span className="ml-1.5 text-[10px] font-bold text-moss">(você)</span>}</p>
                            <p className="truncate text-[10.5px] text-ink-faint">{u.email} · {u.empresa || "—"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <PlanoBadge u={u} />
                          <select
                            value={u.plano}
                            disabled={u.papel === "admin"}
                            onChange={(e) => { adminSetPlano(u.id, e.target.value as "demo" | "pro"); refresh(); }}
                            className="rounded-md border border-sand bg-cream px-1.5 py-0.5 text-[10.5px] font-bold text-ink-soft outline-none disabled:opacity-50"
                          >
                            <option value="demo">Demo</option>
                            <option value="pro">Pro</option>
                          </select>
                          <button
                            onClick={() => { adminSetPapel(u.id, u.papel === "admin" ? "operador" : "admin"); refresh(); }}
                            disabled={souEu}
                            title={souEu ? "Você não pode alterar o próprio papel" : u.papel === "admin" ? "Rebaixar para operador" : "Promover a administrador"}
                            className="rounded-md border border-sand px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide text-ink-soft uppercase transition hover:border-moss hover:text-moss disabled:opacity-40"
                          >
                            {u.papel === "admin" ? "Admin ✓" : "Operador"}
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3">
                        {u.bloqueado ? (
                          <span className="rounded-full bg-rust px-2 py-0.5 text-[10px] font-extrabold text-cream uppercase">Bloqueada</span>
                        ) : (
                          <span className="rounded-full bg-moss/12 px-2 py-0.5 text-[10px] font-extrabold text-moss uppercase">Ativa</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[11px] text-ink-soft">
                        {u.ultimoAcesso ? new Date(u.ultimoAcesso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }) : fmtData(u.criadoEm)}
                        <p className="text-[9.5px] text-ink-faint">conta: {fmtData(u.criadoEm)}</p>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={async () => { const s = await adminResetarSenha(u.id); if (s) { setSenhaTemp({ nome: u.nome, senha: s }); refresh(); } }}
                            className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:text-moss"
                            title="Redefinir senha (gera senha temporária)"
                          ><Ic name="key" size={13} /></button>
                          <button
                            onClick={() => { adminToggleBloqueio(u.id); refresh(); }}
                            disabled={souEu}
                            className={`rounded-md border p-1.5 transition disabled:opacity-40 ${u.bloqueado ? "border-moss/50 text-moss hover:bg-moss/10" : "border-sand text-ink-soft hover:border-amber hover:text-amber"}`}
                            title={u.bloqueado ? "Desbloquear conta" : "Bloquear conta"}
                          ><Ic name="lock" size={13} /></button>
                          {confirmando === u.id ? (
                            <button onClick={() => { const err = adminRemover(u.id); setConfirmando(null); if (!err) refresh(); }} className="rounded-md bg-rust px-2 py-1 text-[10.5px] font-extrabold text-cream">Confirmar exclusão</button>
                          ) : (
                            <button
                              onClick={() => setConfirmando(u.id)}
                              disabled={souEu}
                              className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:text-rust disabled:opacity-40"
                              title="Excluir conta e dados"
                            ><Ic name="trash" size={13} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </Reveal>

      {/* segurança + armazenamento */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_290px]">
        <Reveal delay={60}>
          <div className="overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-paper px-4 py-3">
              <div>
                <h2 className="font-display text-[15px] font-bold text-ink">Eventos de segurança</h2>
                <p className="text-[11px] text-ink-soft">Logins, bloqueios, cadastros, sessões expiradas e ações administrativas</p>
              </div>
              {confirmaLimpar ? (
                <span className="flex items-center gap-2">
                  <button onClick={() => { limparSeguranca(); setConfirmaLimpar(false); refresh(); }} className="rounded-md bg-rust px-2.5 py-1.5 text-[11px] font-extrabold text-cream">Confirmar limpeza</button>
                  <button onClick={() => setConfirmaLimpar(false)} className="rounded-md border border-sand px-2 py-1.5 text-[11px] font-semibold text-ink-soft">Não</button>
                </span>
              ) : (
                <button onClick={() => setConfirmaLimpar(true)} className="rounded-md border border-sand px-3 py-1.5 text-[11px] font-bold text-ink-soft transition hover:border-rust hover:text-rust">Limpar log</button>
              )}
            </div>
            <ul className="max-h-[380px] overflow-y-auto">
              {eventos.slice(0, 50).map((e) => (
                <li key={e.id} className="flex items-center gap-3 border-b border-sand/60 px-4 py-2.5 last:border-b-0 hover:bg-paper">
                  <span className="w-[118px] shrink-0 text-[10px] font-semibold whitespace-nowrap text-ink-faint">
                    {new Date(e.ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className={`w-[104px] shrink-0 rounded-full px-2 py-0.5 text-center text-[9px] font-extrabold tracking-wide uppercase ${COR_EVENTO[e.tipo] ?? "bg-paper-deep text-ink-soft"}`}>{e.tipo.replace("_", " ")}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-ink">{e.detalhe}</span>
                  <span className="hidden max-w-[180px] truncate text-[10.5px] text-ink-faint sm:block">{e.email}</span>
                </li>
              ))}
              {eventos.length === 0 && <p className="px-5 py-8 text-center text-[12px] text-ink-faint">Nenhum evento registrado ainda.</p>}
            </ul>
          </div>
        </Reveal>

        <div className="space-y-4">
          <Reveal delay={120}>
            <div className="rounded-lg border border-sand bg-cream p-5">
              <h2 className="font-display mb-3 text-[15px] font-bold text-ink">Armazenamento local</h2>
              <p className="font-display text-[34px] leading-none font-extrabold text-ink">{armazenamento}<span className="ml-1 text-[14px] text-ink-faint">KB</span></p>
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">Uso total das chaves <code className="rounded-sm bg-paper-deep px-1 text-ink">radargrc:*</code> neste navegador — contas, sessões, dados por usuário e logs.</p>
            </div>
          </Reveal>
          <Reveal delay={160}>
            <div className="rail-texture rounded-lg border border-pine-line bg-pine p-5 text-cream">
              <h2 className="font-display mb-2 flex items-center gap-2 text-[14px] font-extrabold"><Ic name="alert" size={14} className="text-lime" sw={2.2} /> Política de segurança ativa</h2>
              <ul className="space-y-1.5 text-[11.5px] leading-snug text-cream/70">
                <li>• Senhas SHA-256 + salt (nunca em texto puro)</li>
                <li>• Bloqueio progressivo: 1min → 5min → 30min</li>
                <li>• Sessão expira por inatividade (30min admin · 2h operador)</li>
                <li>• Somente e-mail corporativo no acesso</li>
                <li>• Toda ação administrativa é auditada</li>
              </ul>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  );
}
