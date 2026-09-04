import { useMemo, useState } from "react";
import {
  adminCriarUsuario, adminExcluirUsuario, adminRedefinirSenha, adminToggleBloqueio,
  limparSeguranca, listarBloqueiosAtivos, listarSeguranca, usuariosDaOrg, useAuth,
} from "../auth";
import type { Papel, Usuario } from "../auth";
import { fmtData } from "../types";
import { Cabecalho, Campo, Ic, inputCls, Modal, Reveal } from "./ui";

const COR_EVENTO: Record<string, string> = {
  login_ok: "bg-moss/12 text-moss",
  login_falha: "bg-amber-soft text-ink",
  bloqueio: "bg-rust-soft text-rust",
  cadastro: "bg-pine text-lime",
  senha_troca: "bg-paper-deep text-ink-soft",
  sessao_expirada: "bg-amber-soft text-ink",
  admin_acao: "bg-rust-soft text-rust",
};

const ROTULO_EVENTO: Record<string, string> = {
  login_ok: "Login",
  login_falha: "Falha de login",
  bloqueio: "Bloqueio",
  cadastro: "Cadastro",
  senha_troca: "Troca de senha",
  sessao_expirada: "Sessão expirada",
  admin_acao: "Ação admin",
};

function PapelBadge({ papel }: { papel: Papel }) {
  const admin = papel === "admin";
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold tracking-wide uppercase ${admin ? "bg-pine text-lime" : "bg-paper-deep text-ink-soft"}`}>
      {admin ? "Admin" : "Operador"}
    </span>
  );
}

function iniciais(nome: string) {
  return nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
}

function usoStorage(userId: string): string {
  try {
    const raw = localStorage.getItem(`radargrc:${userId}`);
    if (!raw) return "0 KB";
    const kb = new Blob([raw]).size / 1024;
    return kb < 1024 ? `${kb.toFixed(1)} KB` : `${(kb / 1024).toFixed(2)} MB`;
  } catch {
    return "—";
  }
}

export default function AdminPanel() {
  const { usuario } = useAuth();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  /* novo usuário */
  const [novoAberto, setNovoAberto] = useState(false);
  const [nNome, setNNome] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nCargo, setNCargo] = useState("Analista de compliance");
  const [nPapel, setNPapel] = useState<Papel>("operador");
  const [nErro, setNErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);

  /* confirmação de exclusão */
  const [excluindo, setExcluindo] = useState<Usuario | null>(null);
  /* senha temporária exibida */
  const [senhaVisivel, setSenhaVisivel] = useState<{ nome: string; senha: string } | null>(null);
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const eventos = useMemo(() => listarSeguranca(), [usuario, senhaGerada, senhaVisivel, excluindo]);
  const usuarios = useMemo(() => (usuario ? usuariosDaOrg(usuario.orgId) : []), [usuario, senhaGerada, senhaVisivel, excluindo]);

  const stats = useMemo(() => {
    const agora = Date.now();
    return {
      total: usuarios.length,
      ativos: usuarios.filter((u) => !u.bloqueado).length,
      bloqueados: usuarios.filter((u) => u.bloqueado).length + listarBloqueiosAtivos(),
      admins: usuarios.filter((u) => u.papel === "admin").length,
      operadores: usuarios.filter((u) => u.papel === "operador").length,
      eventos24h: eventos.filter((e) => agora - new Date(e.ts).getTime() < 86400000).length,
    };
  }, [usuarios, eventos]);

  const criar = () => {
    if (!usuario) return;
    setNErro(null);
    if (nNome.trim().length < 3) {
      setNErro("Informe o nome completo do usuário.");
      return;
    }
    const r = adminCriarUsuario(usuario.orgId, { nome: nNome, email: nEmail, cargo: nCargo, papel: nPapel });
    if (!r.ok) {
      setNErro(r.msg ?? "Não foi possível criar o usuário.");
      return;
    }
    setSenhaGerada(r.senhaTemporaria ?? null);
    setSenhaVisivel({ nome: nNome.trim(), senha: r.senhaTemporaria ?? "" });
    setMostrarSenha(true);
    setNNome("");
    setNEmail("");
    setNPapel("operador");
    refresh();
  };

  const redefinir = (u: Usuario) => {
    if (!usuario) return;
    const r = adminRedefinirSenha(usuario.orgId, u.id);
    if (r.ok && r.senhaTemporaria) {
      setSenhaVisivel({ nome: u.nome, senha: r.senhaTemporaria });
      setMostrarSenha(true);
      refresh();
    }
  };

  return (
    <div>
      <Cabecalho
        kicker="Administração · gestão da organização"
        titulo="Painel administrativo"
        desc="Gerencie os usuários da sua organização: crie acessos com senha temporária, bloqueie, redefina senhas e exclua contas. Todas as ações ficam na trilha de auditoria."
        acao={
          <button onClick={() => { setNovoAberto(true); setNErro(null); setSenhaGerada(null); }} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Novo usuário
          </button>
        }
      />

      {/* métricas */}
      <div className="mb-5 grid grid-cols-2 gap-3.5 sm:grid-cols-3 lg:grid-cols-6">
        {[
          { l: "Usuários", v: stats.total, cor: "text-ink" },
          { l: "Ativos", v: stats.ativos, cor: "text-moss" },
          { l: "Bloqueados", v: stats.bloqueados, cor: "text-rust" },
          { l: "Admins", v: stats.admins, cor: "text-ink" },
          { l: "Operadores", v: stats.operadores, cor: "text-ink" },
          { l: "Eventos 24h", v: stats.eventos24h, cor: "text-amber" },
        ].map((s) => (
          <div key={s.l} className="rounded-lg border border-sand bg-cream p-4 transition hover:-translate-y-0.5 hover:border-moss/40">
            <p className="text-[10px] font-bold tracking-[0.12em] text-ink-faint uppercase">{s.l}</p>
            <p className={`font-display mt-1.5 text-[28px] leading-none font-extrabold ${s.cor}`}>{s.v}</p>
          </div>
        ))}
      </div>

      {/* tabela de usuários */}
      <Reveal>
        <div className="overflow-hidden rounded-lg border border-sand bg-cream">
          <div className="border-b border-sand bg-paper px-5 py-3.5">
            <h2 className="font-display text-[15px] font-bold text-ink">Usuários da organização</h2>
            <p className="text-[11.5px] text-ink-soft">{usuario?.empresa} · acesso restrito a usuários com e-mail corporativo</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-[12.5px]">
              <thead>
                <tr className="border-b border-sand bg-paper text-[10px] font-bold tracking-[0.1em] text-ink-faint uppercase">
                  <th className="px-5 py-2.5">Usuário</th>
                  <th className="px-3 py-2.5">Papel</th>
                  <th className="px-3 py-2.5">Status</th>
                  <th className="px-3 py-2.5">Uso</th>
                  <th className="px-3 py-2.5">Criado em</th>
                  <th className="px-3 py-2.5 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => {
                  const ehEu = u.id === usuario?.id;
                  return (
                    <tr key={u.id} className={`border-b border-sand/70 align-middle transition last:border-0 hover:bg-paper ${u.bloqueado ? "opacity-70" : ""}`}>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[12px] font-extrabold ${u.bloqueado ? "bg-paper-deep text-ink-faint" : "bg-pine text-lime"}`}>
                            {iniciais(u.nome)}
                          </span>
                          <div className="min-w-0">
                            <p className="flex items-center gap-1.5 font-bold text-ink">
                              {u.nome}
                              {ehEu && <span className="rounded-sm bg-lime px-1 py-px text-[8.5px] font-extrabold text-pine uppercase">você</span>}
                              {u.demo && <span className="rounded-sm bg-paper-deep px-1 py-px text-[8.5px] font-extrabold text-ink-soft uppercase">demo</span>}
                            </p>
                            <p className="truncate text-[11px] text-ink-faint">{u.email}</p>
                            {u.cargo && <p className="truncate text-[10.5px] text-ink-faint">{u.cargo}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3"><PapelBadge papel={u.papel} /></td>
                      <td className="px-3 py-3">
                        {u.bloqueado ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-rust-soft px-2 py-0.5 text-[10px] font-extrabold text-rust uppercase"><Ic name="alert" size={9} sw={2.6} /> Bloqueado</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full bg-moss/12 px-2 py-0.5 text-[10px] font-extrabold text-moss uppercase"><Ic name="check" size={9} sw={3} /> Ativo</span>
                        )}
                      </td>
                      <td className="px-3 py-3 text-[11px] text-ink-soft">{usoStorage(u.id)}</td>
                      <td className="px-3 py-3 text-[11px] text-ink-soft">{fmtData(u.criadoEm)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => redefinir(u)} title="Redefinir senha (gera senha temporária)" className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-amber hover:bg-amber-soft/50 hover:text-ink">
                            <Ic name="refresh" size={13} />
                          </button>
                          {!ehEu && (
                            <>
                              <button
                                onClick={() => { adminToggleBloqueio(usuario!.orgId, u.id); refresh(); }}
                                title={u.bloqueado ? "Desbloquear usuário" : "Bloquear usuário"}
                                className={`rounded-md border p-1.5 transition ${u.bloqueado ? "border-moss/50 text-moss hover:bg-moss/10" : "border-sand text-ink-soft hover:border-amber hover:bg-amber-soft/50 hover:text-ink"}`}
                              >
                                <Ic name={u.bloqueado ? "check" : "alert"} size={13} />
                              </button>
                              <button onClick={() => setExcluindo(u)} title="Excluir usuário" className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:bg-rust/10 hover:text-rust">
                                <Ic name="trash" size={13} />
                              </button>
                            </>
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

      {/* trilha de segurança */}
      <Reveal delay={80}>
        <div className="mt-5 overflow-hidden rounded-lg border border-sand bg-cream">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-sand bg-paper px-5 py-3.5">
            <div>
              <h2 className="font-display text-[15px] font-bold text-ink">Trilha de auditoria de segurança</h2>
              <p className="text-[11.5px] text-ink-soft">Logins, bloqueios, trocas de senha e ações administrativas</p>
            </div>
            <button onClick={() => { limparSeguranca(); refresh(); }} className="inline-flex items-center gap-1.5 rounded-md border border-sand px-3 py-1.5 text-[11.5px] font-bold text-ink-soft transition hover:border-rust hover:text-rust">
              <Ic name="trash" size={12} /> Limpar log
            </button>
          </div>
          {eventos.length === 0 ? (
            <p className="px-5 py-10 text-center text-[12.5px] text-ink-faint">Nenhum evento registrado ainda.</p>
          ) : (
            <ul className="max-h-[340px] overflow-y-auto">
              {eventos.slice(0, 40).map((e) => (
                <li key={e.id} className="flex items-center gap-3 border-b border-sand/60 px-5 py-2.5 last:border-0 hover:bg-paper">
                  <span className="w-[120px] shrink-0 text-[10.5px] font-semibold text-ink-faint">{fmtData(e.ts)}</span>
                  <span className={`w-[110px] shrink-0 rounded-full px-2 py-0.5 text-center text-[9.5px] font-extrabold uppercase ${COR_EVENTO[e.tipo] ?? "bg-paper-deep text-ink-soft"}`}>
                    {ROTULO_EVENTO[e.tipo] ?? e.tipo}
                  </span>
                  <span className="w-[180px] shrink-0 truncate text-[11.5px] font-semibold text-ink">{e.email}</span>
                  <span className="min-w-0 flex-1 truncate text-[11.5px] text-ink-soft">{e.detalhe}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </Reveal>

      {/* modal: novo usuário */}
      <Modal aberto={novoAberto} onFechar={() => setNovoAberto(false)} titulo="Criar usuário" largura="max-w-md">
        <div className="space-y-3.5">
          {nErro && (
            <div className="anim-pop flex items-start gap-2 rounded-md border border-rust/50 bg-rust-soft/50 px-3 py-2.5 text-[12px] font-semibold text-rust">
              <Ic name="alert" size={14} className="mt-0.5 shrink-0" sw={2.2} /> {nErro}
            </div>
          )}
          {senhaGerada && (
            <div className="anim-pop rounded-md border border-moss/40 bg-moss/10 px-3.5 py-3">
              <p className="text-[12px] font-bold text-moss">Usuário criado com sucesso!</p>
              <p className="mt-1 text-[11.5px] text-ink-soft">Compartilhe a senha temporária abaixo. O usuário deverá trocá-la no primeiro acesso (Minha conta).</p>
              <p className="font-display mt-2 rounded-md bg-pine px-3 py-2 text-center text-[16px] font-extrabold tracking-widest text-lime">{senhaGerada}</p>
            </div>
          )}
          <Campo label="Nome completo">
            <input className={inputCls} value={nNome} onChange={(e) => setNNome(e.target.value)} placeholder="Ex.: João Pereira" />
          </Campo>
          <Campo label="E-mail corporativo">
            <input className={inputCls} value={nEmail} onChange={(e) => setNEmail(e.target.value)} placeholder="joao@suaempresa.com.br" type="email" />
          </Campo>
          <Campo label="Cargo / função">
            <input className={inputCls} value={nCargo} onChange={(e) => setNCargo(e.target.value)} placeholder="Ex.: Analista de compliance" />
          </Campo>
          <Campo label="Papel de acesso">
            <div className="grid grid-cols-2 gap-2">
              {(["operador", "admin"] as Papel[]).map((p) => (
                <button key={p} type="button" onClick={() => setNPapel(p)} className={`rounded-md border px-3 py-2 text-[12.5px] font-bold transition ${nPapel === p ? "border-pine bg-pine text-lime" : "border-sand text-ink-soft hover:border-moss"}`}>
                  {p === "admin" ? "Admin" : "Operador"}
                </button>
              ))}
            </div>
          </Campo>
          <div className="flex items-center justify-end gap-2.5 border-t border-sand pt-4">
            <button onClick={() => setNovoAberto(false)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Fechar</button>
            <button onClick={criar} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
              <Ic name="plus" size={14} sw={2.6} /> Criar usuário
            </button>
          </div>
        </div>
      </Modal>

      {/* modal: senha temporária (redefinição) */}
      <Modal aberto={!!senhaVisivel && !novoAberto} onFechar={() => setSenhaVisivel(null)} titulo="Senha temporária" largura="max-w-sm">
        {senhaVisivel && (
          <div className="space-y-3">
            <p className="text-[12.5px] text-ink-soft">Nova senha temporária para <strong className="text-ink">{senhaVisivel.nome}</strong>:</p>
            <p className="font-display rounded-md bg-pine px-3 py-3 text-center text-[18px] font-extrabold tracking-widest text-lime">{senhaVisivel.senha}</p>
            <p className="text-[11px] leading-snug text-ink-faint">O usuário deve trocá-la no primeiro acesso. Se a conta estava bloqueada, ela foi desbloqueada.</p>
            <div className="flex justify-end">
              <button onClick={() => setSenhaVisivel(null)} className="rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep">Entendi</button>
            </div>
          </div>
        )}
      </Modal>

      {/* modal: confirmação de exclusão */}
      <Modal aberto={!!excluindo} onFechar={() => setExcluindo(null)} titulo="Excluir usuário" largura="max-w-sm">
        {excluindo && usuario && (
          <div className="space-y-3">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Excluir permanentemente <strong className="text-ink">{excluindo.nome}</strong> ({excluindo.email})? Os dados de mapeamento desta conta serão removidos e o acesso revogado.
            </p>
            <div className="flex justify-end gap-2.5">
              <button onClick={() => setExcluindo(null)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button
                onClick={() => { adminExcluirUsuario(usuario.orgId, excluindo.id, usuario.id); setExcluindo(null); refresh(); }}
                className="inline-flex items-center gap-2 rounded-md bg-rust px-5 py-2 text-[13px] font-bold text-cream transition hover:opacity-90"
              >
                <Ic name="trash" size={13} /> Excluir
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
