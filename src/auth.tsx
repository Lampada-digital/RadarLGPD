import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ============ Modelo de usuário e sessão (persistência local) ============ */

export type Usuario = {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  salt: string;
  hash: string;
  criadoEm: string;
  demo?: boolean;
};

type Sessao = { userId: string; lembrar: boolean };

export const DEMO_EMAIL = "demo@radarlgpd.app";
export const DEMO_SENHA = "demo1234";

const USERS_KEY = "radarlgpd:users";
const SESSION_KEY = "radarlgpd:session";

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* Hash de senha: SHA-256 (Web Crypto) com salt; fallback FNV para contexto não-seguro */
function hashFallback(str: string): string {
  let h1 = 0x811c9dc5 >>> 0;
  let h2 = 0x9e3779b9 >>> 0;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ c, 0x01000193) >>> 0;
    h2 = Math.imul(h2 ^ ((c << 8) | (c >>> 3) | i), 0x85ebca6b) >>> 0;
  }
  return h1.toString(16).padStart(8, "0") + h2.toString(16).padStart(8, "0");
}

export async function hashSenha(senha: string, salt: string): Promise<string> {
  const texto = `${salt}::radarlgpd::${senha}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* contexto inseguro — usa fallback abaixo */
  }
  return hashFallback(texto) + hashFallback(texto.split("").reverse().join(""));
}

function lerUsers(): Usuario[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as Usuario[];
  } catch {
    return [];
  }
}
function gravarUsers(u: Usuario[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(u));
}
function lerSessao(): Sessao | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as Sessao) : null;
  } catch {
    return null;
  }
}
function gravarSessao(s: Sessao) {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (s.lembrar ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s));
}
function limparSessao() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/* ============ Contexto ============ */

type AuthCtx = {
  usuario: Usuario | null;
  pronto: boolean;
  entrar: (email: string, senha: string, lembrar: boolean) => Promise<string | null>;
  cadastrar: (d: { nome: string; empresa: string; email: string; senha: string }) => Promise<string | null>;
  sair: () => void;
  atualizarPerfil: (nome: string, empresa: string) => void;
  trocarSenha: (atual: string, nova: string) => Promise<string | null>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pronto, setPronto] = useState(false);

  /* seed da conta demo + restauração de sessão */
  useEffect(() => {
    (async () => {
      let lista = lerUsers();
      if (!lista.some((u) => u.email === DEMO_EMAIL)) {
        const salt = uid();
        lista = [
          ...lista,
          {
            id: "demo-radar",
            nome: "Conta Demonstração",
            empresa: "Radar LGPD",
            email: DEMO_EMAIL,
            salt,
            hash: await hashSenha(DEMO_SENHA, salt),
            criadoEm: new Date().toISOString(),
            demo: true,
          },
        ];
        gravarUsers(lista);
      }
      const s = lerSessao();
      if (s) {
        const u = lista.find((x) => x.id === s.userId);
        if (u) setUsuario(u);
      }
      setPronto(true);
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    await new Promise((r) => setTimeout(r, 600));
    const u = lerUsers().find((x) => x.email === email.trim().toLowerCase());
    if (!u) return "Nenhuma conta encontrada com este e-mail.";
    const h = await hashSenha(senha, u.salt);
    if (h !== u.hash) return "Senha incorreta. Confira e tente novamente.";
    gravarSessao({ userId: u.id, lembrar });
    setUsuario(u);
    return null;
  }, []);

  const cadastrar = useCallback(async ({ nome, empresa, email, senha }: { nome: string; empresa: string; email: string; senha: string }) => {
    await new Promise((r) => setTimeout(r, 700));
    const lista = lerUsers();
    const mail = email.trim().toLowerCase();
    if (lista.some((x) => x.email === mail)) return "Já existe uma conta cadastrada com este e-mail.";
    const salt = uid();
    const novo: Usuario = {
      id: uid(),
      nome: nome.trim(),
      empresa: empresa.trim(),
      email: mail,
      salt,
      hash: await hashSenha(senha, salt),
      criadoEm: new Date().toISOString(),
    };
    const atualizada = [...lista, novo];
    gravarUsers(atualizada);
    gravarSessao({ userId: novo.id, lembrar: true });
    setUsuario(novo);
    return null;
  }, []);

  const sair = useCallback(() => {
    limparSessao();
    setUsuario(null);
  }, []);

  const atualizarPerfil = useCallback((nome: string, empresa: string) => {
    setUsuario((u) => {
      if (!u) return u;
      const novo = { ...u, nome, empresa };
      gravarUsers(lerUsers().map((x) => (x.id === u.id ? novo : x)));
      return novo;
    });
  }, []);

  const trocarSenha = useCallback(
    async (atual: string, nova: string) => {
      if (!usuario) return "Sessão expirada. Entre novamente.";
      await new Promise((r) => setTimeout(r, 500));
      const h = await hashSenha(atual, usuario.salt);
      if (h !== usuario.hash) return "A senha atual não confere.";
      const salt = uid();
      const hash = await hashSenha(nova, salt);
      const novo = { ...usuario, salt, hash };
      gravarUsers(lerUsers().map((x) => (x.id === usuario.id ? novo : x)));
      setUsuario(novo);
      return null;
    },
    [usuario]
  );

  const v = useMemo(
    () => ({ usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha }),
    [usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
}
