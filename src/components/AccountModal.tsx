import { useState } from "react";
import { useAuth } from "../auth";
import { useStore } from "../store";
import { fmtData } from "../types";
import { Campo, Ic, inputCls, MedidorSenha, Modal } from "./ui";

export default function AccountModal({ aberto, onFechar }: { aberto: boolean; onFechar: () => void }) {
  const { usuario, atualizarPerfil, trocarSenha } = useAuth();
  const { toast } = useStore();
  const [aba, setAba] = useState<"perfil" | "seguranca">("perfil");
  const [nome, setNome] = useState(usuario?.nome ?? "");
  const [empresa, setEmpresa] = useState(usuario?.empresa ?? "");
  const [atual, setAtual] = useState("");
  const [nova, setNova] = useState("");
  const [confirma, setConfirma] = useState("");
  const [ver, setVer] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  if (!usuario) return null;

  const salvarPerfil = () => {
    if (nome.trim().length < 3) {
      setErro("Informe seu nome completo.");
      return;
    }
    setErro(null);
    atualizarPerfil(nome.trim(), empresa.trim());
    toast("Perfil atualizado com sucesso.");
    onFechar();
  };

  const salvarSenha = async () => {
    setErro(null);
    if (!atual) {
      setErro("Digite a senha atual.");
      return;
    }
    if (nova.length < 8) {
      setErro("A nova senha precisa de pelo menos 8 caracteres.");
      return;
    }
    if (nova !== confirma) {
      setErro("A confirmação não coincide com a nova senha.");
      return;
    }
    setCarregando(true);
    const r = await trocarSenha(atual, nova);
    setCarregando(false);
    if (r) {
      setErro(r);
      return;
    }
    setAtual("");
    setNova("");
    setConfirma("");
    toast("Senha alterada. Use a nova senha no próximo acesso.");
    onFechar();
  };

  return (
    <Modal aberto={aberto} onFechar={onFechar} titulo="Minha conta" largura="max-w-md">
      <div className="space-y-4">
        {/* abas */}
        <div className="relative grid grid-cols-2 rounded-lg border border-sand bg-paper-deep p-1">
          <span
            className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-pine shadow-sm transition-transform duration-300 ease-out"
            style={{ transform: aba === "seguranca" ? "translateX(calc(100% + 0.25rem))" : "translateX(0)" }}
          />
          <button type="button" onClick={() => { setAba("perfil"); setErro(null); }} className={`relative z-10 rounded-md py-1.5 text-[12.5px] font-bold transition-colors ${aba === "perfil" ? "text-lime" : "text-ink-soft"}`}>
            Perfil
          </button>
          <button type="button" onClick={() => { setAba("seguranca"); setErro(null); }} className={`relative z-10 rounded-md py-1.5 text-[12.5px] font-bold transition-colors ${aba === "seguranca" ? "text-lime" : "text-ink-soft"}`}>
            Segurança
          </button>
        </div>

        {erro && (
          <div className="anim-pop flex items-start gap-2 rounded-md border border-rust/50 bg-rust-soft/50 px-3 py-2.5 text-[12px] font-semibold text-rust">
            <Ic name="alert" size={14} className="mt-0.5 shrink-0" sw={2.2} />
            {erro}
          </div>
        )}

        {aba === "perfil" ? (
          <div className="anim-rise space-y-3.5">
            <Campo label="E-mail de acesso" hint="não editável">
              <div className="flex items-center gap-2.5 rounded-md border border-sand bg-paper px-3 py-2">
                <Ic name="mail" size={14} className="text-ink-faint" />
                <span className="truncate text-[13px] font-semibold text-ink-soft">{usuario.email}</span>
                {usuario.demo && <span className="ml-auto rounded-sm bg-lime-soft px-1.5 py-0.5 text-[9px] font-extrabold tracking-wide text-pine uppercase">Demo</span>}
              </div>
            </Campo>
            <Campo label="Nome completo">
              <input className={inputCls} value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome" />
            </Campo>
            <Campo label="Organização">
              <input className={inputCls} value={empresa} onChange={(e) => setEmpresa(e.target.value)} placeholder="Empresa (opcional)" />
            </Campo>
            <div className="flex items-center justify-between gap-3 border-t border-sand pt-4">
              <p className="text-[11px] text-ink-faint">Conta criada em {fmtData(usuario.criadoEm)}</p>
              <button onClick={salvarPerfil} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98]">
                <Ic name="check" size={13} sw={2.6} /> Salvar perfil
              </button>
            </div>
          </div>
        ) : (
          <div className="anim-rise space-y-3.5">
            <Campo label="Senha atual">
              <input className={inputCls} type={ver ? "text" : "password"} value={atual} onChange={(e) => setAtual(e.target.value)} placeholder="Digite a senha atual" />
            </Campo>
            <div>
              <Campo label="Nova senha">
                <div className="relative">
                  <input className={`${inputCls} pr-10`} type={ver ? "text" : "password"} value={nova} onChange={(e) => setNova(e.target.value)} placeholder="Mínimo 8 caracteres" />
                  <button type="button" onClick={() => setVer(!ver)} className="absolute top-1/2 right-2.5 -translate-y-1/2 rounded p-1 text-ink-faint transition hover:text-moss" aria-label="Mostrar/ocultar senha">
                    <Ic name={ver ? "eyeOff" : "eye"} size={15} />
                  </button>
                </div>
              </Campo>
              <MedidorSenha senha={nova} />
            </div>
            <Campo label="Confirmar nova senha">
              <input className={inputCls} type={ver ? "text" : "password"} value={confirma} onChange={(e) => setConfirma(e.target.value)} placeholder="Repita a nova senha" />
            </Campo>
            <div className="flex items-center justify-end gap-2.5 border-t border-sand pt-4">
              <button onClick={onFechar} className="rounded-md border border-sand px-4 py-2 text-[13px] font-semibold text-ink-soft transition hover:bg-paper">Cancelar</button>
              <button onClick={salvarSenha} disabled={carregando} className="inline-flex items-center gap-2 rounded-md bg-pine px-4 py-2 text-[13px] font-bold text-lime transition hover:bg-pine-deep active:scale-[0.98] disabled:opacity-70">
                {carregando ? <span className="inline-block size-3.5 animate-spin rounded-full border-2 border-lime/30 border-t-lime" /> : <Ic name="shield" size={13} sw={2.2} />}
                Alterar senha
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
