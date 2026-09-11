import { useState } from "react";
import { useAuth } from "../auth";
import { Ic } from "./ui";

interface RecuperarSenhaProps {
  onFechar: () => void;
  onVoltar: () => void;
}

export default function RecuperarSenha({ onFechar, onVoltar }: RecuperarSenhaProps) {
  const { recuperarSenha, redefinirSenha } = useAuth();
  const [etapa, setEtapa] = useState<"email" | "codigo" | "nova_senha">("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [codigoEnviado, setCodigoEnviado] = useState("");

  const enviarCodigo = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    try {
      const resultado = await recuperarSenha(email);
      if (resultado.sucesso) {
        setCodigoEnviado(resultado.codigo || "");
        setEtapa("codigo");
      } else {
        setErro(resultado.erro || "Erro ao enviar código");
      }
    } catch (error) {
      setErro("Erro ao processar solicitação");
    } finally {
      setCarregando(false);
    }
  };

  const verificarCodigo = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (codigo !== codigoEnviado) {
      setErro("Código incorreto");
      return;
    }

    setEtapa("nova_senha");
  };

  const redefinir = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    if (novaSenha.length < 10) {
      setErro("A senha deve ter pelo menos 10 caracteres");
      return;
    }

    if (novaSenha !== confirmaSenha) {
      setErro("As senhas não coincidem");
      return;
    }

    setCarregando(true);

    try {
      const resultado = await redefinirSenha(email, codigo, novaSenha);
      if (resultado.sucesso) {
        onFechar();
      } else {
        setErro(resultado.erro || "Erro ao redefinir senha");
      }
    } catch (error) {
      setErro("Erro ao processar solicitação");
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="anim-rise space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-[18px] font-bold text-ink">
          {etapa === "email" && "Recuperar senha"}
          {etapa === "codigo" && "Verificar código"}
          {etapa === "nova_senha" && "Nova senha"}
        </h3>
        <button type="button" onClick={onFechar} className="rounded p-1 text-ink-faint transition hover:text-moss">
          <Ic name="x" size={18} />
        </button>
      </div>

      {erro && (
        <div className="anim-pop flex items-start gap-2 rounded-md border border-rust/50 bg-rust-soft/50 px-3 py-2.5 text-[12px] font-semibold text-rust">
          <Ic name="alert" size={14} className="mt-0.5 shrink-0" sw={2.2} /> {erro}
        </div>
      )}

      {etapa === "email" && (
        <form onSubmit={enviarCodigo} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10.5px] font-bold tracking-[0.1em] text-ink-soft uppercase">
              E-mail corporativo
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="voce@suaempresa.com.br"
              className="w-full rounded-md border border-sand bg-cream py-2.5 px-3 text-[13.5px] text-ink transition outline-none placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25"
              required
            />
          </div>
          <p className="text-[11px] text-ink-soft">
            Enviaremos um código de 6 dígitos para seu e-mail corporativo.
          </p>
          <button
            type="submit"
            disabled={carregando}
            className="group flex w-full items-center justify-center gap-2 rounded-md bg-pine py-2.5 text-[13.5px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.99] disabled:opacity-70"
          >
            {carregando ? (
              <>
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
                Enviando código...
              </>
            ) : (
              <>
                Enviar código
                <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      )}

      {etapa === "codigo" && (
        <form onSubmit={verificarCodigo} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10.5px] font-bold tracking-[0.1em] text-ink-soft uppercase">
              Código de verificação
            </label>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              placeholder="000000"
              maxLength={6}
              className="w-full rounded-md border border-sand bg-cream py-2.5 px-3 text-center text-[20px] font-bold tracking-widest text-ink transition outline-none placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25"
              required
            />
          </div>
          <p className="text-[11px] text-ink-soft">
            Código enviado para: <strong>{email}</strong>
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setEtapa("email")}
              className="flex-1 rounded-md border border-sand bg-cream py-2.5 text-[13px] font-bold text-ink-soft transition hover:bg-paper"
            >
              Voltar
            </button>
            <button
              type="submit"
              className="flex-1 group flex items-center justify-center gap-2 rounded-md bg-pine py-2.5 text-[13px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.99]"
            >
              Verificar código
              <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" />
            </button>
          </div>
        </form>
      )}

      {etapa === "nova_senha" && (
        <form onSubmit={redefinir} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-[10.5px] font-bold tracking-[0.1em] text-ink-soft uppercase">
              Nova senha
            </label>
            <input
              type="password"
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Mín. 10 caracteres"
              className="w-full rounded-md border border-sand bg-cream py-2.5 px-3 text-[13.5px] text-ink transition outline-none placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25"
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[10.5px] font-bold tracking-[0.1em] text-ink-soft uppercase">
              Confirmar nova senha
            </label>
            <input
              type="password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
              placeholder="Repita a nova senha"
              className="w-full rounded-md border border-sand bg-cream py-2.5 px-3 text-[13.5px] text-ink transition outline-none placeholder:text-ink-faint focus:border-moss focus:ring-2 focus:ring-moss/25"
              required
            />
          </div>
          <p className="text-[11px] text-ink-soft">
            A senha deve ter pelo menos 10 caracteres, incluindo maiúsculas, minúsculas e números.
          </p>
          <button
            type="submit"
            disabled={carregando}
            className="group flex w-full items-center justify-center gap-2 rounded-md bg-pine py-2.5 text-[13.5px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.99] disabled:opacity-70"
          >
            {carregando ? (
              <>
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />
                Redefinindo senha...
              </>
            ) : (
              <>
                Redefinir senha
                <Ic name="check" size={14} className="transition-transform group-hover:translate-x-0.5" />
              </>
            )}
          </button>
        </form>
      )}

      <div className="border-t border-sand pt-4">
        <button
          type="button"
          onClick={onVoltar}
          className="text-[12px] font-bold text-moss transition hover:text-pine"
        >
          ← Voltar ao login
        </button>
      </div>
    </div>
  );
}
