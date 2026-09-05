import { useMemo, useState } from "react";
import { useAuth, usuariosDaOrg, listarSeguranca } from "../auth";
import type { Papel } from "../auth";
import { useStore } from "../store";
import { fmtData } from "../domain";
import { Cabecalho, Campo, Ic, inputCls, Modal, Reveal } from "./ui";

export default function AdminPanel() {
  const { usuario, adminCriarUsuario, adminToggleBloqueio, adminExcluirUsuario, adminRedefinirSenha } = useAuth();
  const { toast, limites } = useStore();
  const [, force] = useState(0);
  const refresh = () => force((n) => n + 1);

  const usuarios = useMemo(() => (usuario ? usuariosDaOrg(usuario.orgId) : []), [usuario]);
  const eventos = useMemo(() => listarSeguranca().slice(0, 30), [usuario, usuario?.bloqueado]);

  const [novoAberto, setNovoAberto] = useState(false);
  const [nNome, setNNome] = useState("");
  const [nEmail, setNEmail] = useState("");
  const [nCargo, setNCargo] = useState("");
  const [nPapel, setNPapel] = useState<Papel>("operador");
  const [nErro, setNErro] = useState<string | null>(null);
  const [senhaGerada, setSenhaGerada] = useState<string | null>(null);
  const [excluindo, setExcluindo] = useState<typeof usuarios[number] | null>(null);

  const podeAdd = limites.podeCriar && usuarios.length < limites.maxUsuarios;

  const criar = () => {
    if (!usuario) return;
    setNErro(null);
    if (nNome.trim().length < 3) {
      setNErro("Informe o nome completo do usuário.");
      return;
    }
    const r = adminCriarUsuario(usuario.orgId, { nome: nNome, email: nEmail, cargo: nCargo || undefined, papel: nPapel });
    if (!r.ok) {
      setNErro(r.msg ?? "Não foi possível criar o usuário.");
      return;
    }
    setSenhaGerada(r.senhaTemporaria ?? null);
    toast(`Usuário ${nNome} criado (${nPapel}).`);
    setNNome("");
    setNEmail("");
    setNCargo("");
    refresh();
  };

  const abreNovo = () => {
    if (!podeAdd) {
      toast(limites.podeCriar ? `Seu plano permite até ${limites.maxUsuarios} usuários. Faça upgrade para adicionar mais.` : "Adicionar usuários é liberado nos planos pagos.", "warn");
      return;
    }
    setNovoAberto(true);
    setNErro(null);
    setSenhaGerada(null);
  };

  const metricas = useMemo(
    () => ({
      total: usuarios.length,
      ativos: usuarios.filter((u) => !u.bloqueado).length,
      bloqueados: usuarios.filter((u) => u.bloqueado).length,
      admins: usuarios.filter((u) => u.papel === "admin").length,
    }),
    [usuarios]
  );

  return (
    <div>
      <Cabecalho
        kicker="Administração · gestão da organização"
        titulo="Painel administrativo"
        desc="Gerencie os usuários da sua organização: crie acessos com senha temporária, bloqueie, redefina senhas e exclua contas. Todas as ações ficam na trilha de auditoria."
        acao={
          <button onClick={abreNovo} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.98]">
            <Ic name="plus" size={14} sw={2.6} /> Novo usuário
          </button>
        }
      />

      <Reveal>
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-lg border border-sand bg-cream px-5 py-3.5">
          <p className="text-[12px] text-ink-soft">
            <strong className="text-ink">Usuários:</strong> {metricas.total} de {Number.isFinite(limites.maxUsuarios) ? limites.maxUsuarios : "∞"} no plano · {metricas.ativos} ativos · {metricas.bloqueados} bloqueados · {metricas.admins} admin(s)
          </p>
          {!limites.podeCriar && (
            <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-amber-soft px-3 py-1 text-[10.5px] font-extrabold text-ink uppercase"><Ic name="lock" size={11} sw={2.4} /> Trial: somente 1 usuário</span>
          )}
        </div>
      </Reveal>

      <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
        {/* lista de usuários */}
        <Reveal>
          <div className="overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3"><h2 className="font-display text-[15px] font-bold text-ink">Usuários da organização</h2></div>
            <ul>
              {usuarios.map((u) => (
                <li key={u.id} className="group flex items-center gap-3 border-b border-sand/60 px-4 py-3 transition last:border-b-0 hover:bg-paper">
                  <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[11px] font-extrabold ${u.papel === "admin" ? "bg-pine text-lime" : "bg-paper-deep text-ink-soft"}`}>
                    {u.nome.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-[13px] font-bold text-ink">
                      {u.nome}
                      {u.demo && <span className="rounded-sm bg-lime-soft px-1.5 py-px text-[8.5px] font-extrabold text-pine uppercase">Demo</span>}
                      {u.bloqueado && <span className="rounded-sm bg-rust-soft px-1.5 py-px text-[8.5px] font-extrabold text-rust uppercase">Bloqueado</span>}
                    </p>
                    <p className="truncate text-[11px] text-ink-faint">{u.email}{u.cargo ? ` · ${u.cargo}` : ""} · desde {fmtData(u.criadoEm)}</p>
                  </div>
                  {!u.demo && (
                    <div className="flex shrink-0 gap-1 opacity-0 transition group-hover:opacity-100">
                      <button onClick={() => { const r = adminRedefinirSenha(u.orgId, u.id); if (r.senhaTemporaria) { toast(`Nova senha temporária de ${u.nome}: ${r.senhaTemporaria}`); } refresh(); }} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-moss hover:text-moss" title="Redefinir senha"><Ic name="key" size={14} /></button>
                      <button onClick={() => { adminToggleBloqueio(u.orgId, u.id); toast(u.bloqueado ? `${u.nome} desbloqueado.` : `${u.nome} bloqueado.`, u.bloqueado ? "ok" : "warn"); refresh(); }} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-amber hover:text-ink" title={u.bloqueado ? "Desbloquear" : "Bloquear"}><Ic name="lock" size={14} /></button>
                      <button onClick={() => setExcluindo(u)} className="rounded-md border border-sand p-1.5 text-ink-soft transition hover:border-rust hover:text-rust" title="Excluir"><Ic name="trash" size={14} /></button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </Reveal>

        {/* trilha de segurança */}
        <Reveal delay={80}>
          <div className="overflow-hidden rounded-lg border border-sand bg-cream">
            <div className="border-b border-sand bg-paper px-4 py-3"><h2 className="font-display text-[15px] font-bold text-ink">Trilha de segurança</h2></div>
            <ul className="max-h-[420px] overflow-y-auto">
              {eventos.length === 0 && <p className="px-5 py-10 text-center text-[12.5px] text-ink-faint">Nenhum evento registrado ainda.</p>}
              {eventos.map((e) => (
                <li key={e.id} className="border-b border-sand/60 px-4 py-2.5 last:border-b-0">
                  <p className="flex items-center gap-2 text-[11.5px] font-bold text-ink">
                    <span className="rounded-sm bg-paper-deep px-1.5 py-px text-[8.5px] font-extrabold tracking-wide text-ink-soft uppercase">{e.tipo}</span>
                    {e.email}
                  </p>
                  <p className="mt-0.5 text-[10.5px] text-ink-faint">{e.detalhe} · {new Date(e.ts).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </div>

      {/* modal novo usuário */}
      <Modal aberto={novoAberto} onFechar={() => { setNovoAberto(false); setSenhaGerada(null); }} titulo="Novo usuário" largura="max-w-lg">
        {senhaGerada ? (
          <div className="anim-pop space-y-4">
            <div className="rounded-lg border border-moss/40 bg-moss/8 p-4">
              <p className="flex items-center gap-2 text-[13px] font-extrabold text-moss"><Ic name="check" size={16} sw={2.6} /> Usuário criado com sucesso!</p>
              <p className="mt-2 text-[12px] text-ink-soft">Compartilhe esta <strong>senha temporária</strong> com o usuário — ela deve ser trocada no primeiro acesso:</p>
              <p className="mt-2 rounded-md bg-cream px-3 py-2.5 font-mono text-[16px] font-extrabold tracking-wider text-pine">{senhaGerada}</p>
            </div>
            <button onClick={() => { setNovoAberto(false); setSenhaGerada(null); }} className="w-full rounded-md bg-pine py-2.5 text-[13px] font-bold text-lime transition hover:bg-pine-deep">Entendi</button>
          </div>
        ) : (
          <div className="space-y-3.5">
            {nErro && <p className="anim-pop rounded-md border border-rust/50 bg-rust-soft/50 px-3 py-2.5 text-[12px] font-semibold text-rust">{nErro}</p>}
            <Campo label="Nome completo"><input className={inputCls} value={nNome} onChange={(e) => setNNome(e.target.value)} placeholder="Nome do colaborador" /></Campo>
            <Campo label="E-mail corporativo"><input className={inputCls} value={nEmail} onChange={(e) => setNEmail(e.target.value)} placeholder="colaborador@suaempresa.com.br" /></Campo>
            <Campo label="Cargo (opcional)"><input className={inputCls} value={nCargo} onChange={(e) => setNCargo(e.target.value)} placeholder="Ex.: Analista de compliance" /></Campo>
            <Campo label="Papel">
              <div className="grid grid-cols-2 gap-1.5">
                {(["operador", "admin"] as const).map((p) => (
                  <button key={p} type="button" onClick={() => setNPapel(p)} className={`rounded-md border px-2 py-2 text-[12.5px] font-bold capitalize transition ${nPapel === p ? "border-pine bg-pine text-lime" : "border-sand text-ink-soft hover:border-ink/40"}`}>
                    {p === "admin" ? "Administrador" : "Operador"}
                  </button>
                ))}
              </div>
            </Campo>
            <div className="flex items-center justify-end gap-2 border-t border-sand pt-4">
              <button onClick={() => setNovoAberto(false)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={criar} className="inline-flex items-center gap-2 rounded-md bg-pine px-5 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="plus" size={14} sw={2.6} /> Criar usuário
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* modal excluir */}
      <Modal aberto={!!excluindo} onFechar={() => setExcluindo(null)} titulo="Excluir usuário" largura="max-w-md">
        {excluindo && (
          <div className="space-y-4">
            <p className="text-[13px] leading-relaxed text-ink-soft">
              Tem certeza que deseja excluir <strong className="text-ink">{excluindo.nome}</strong> ({excluindo.email})? Esta ação não pode ser desfeita.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button onClick={() => setExcluindo(null)} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={() => { if (usuario) adminExcluirUsuario(usuario.orgId, excluindo.id, usuario.id); toast(`${excluindo.nome} excluído.`, "warn"); setExcluindo(null); refresh(); }} className="inline-flex items-center gap-2 rounded-md bg-rust px-5 py-2 text-[13px] font-bold text-cream transition hover:opacity-90">
                <Ic name="trash" size={14} /> Excluir definitivamente
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
