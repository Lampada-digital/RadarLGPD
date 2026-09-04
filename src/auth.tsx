import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ============ Usuários, sessão e política de bloqueio (persistência local) ============ */

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
const LOCK_KEY = "radarlgpd:lock";
const MAX_TENTATIVAS = 5;
const BLOQUEIO_SEG = 60;

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ============ Validação de e-mail corporativo ============ */

const DOMINIOS_PESSOAIS = new Set(
  [
    "gmail.com", "googlemail.com", "outlook.com", "outlook.com.br", "hotmail.com", "hotmail.com.br",
    "live.com", "live.com.br", "msn.com", "windowslive.com", "yahoo.com", "yahoo.com.br", "ymail.com",
    "rocketmail.com", "bol.com.br", "uol.com.br", "ig.com.br", "terra.com.br", "zipmail.com.br",
    "aol.com", "icloud.com", "me.com", "mac.com", "proton.me", "protonmail.com", "protonmail.ch",
    "zoho.com", "zoho.com.br", "gmx.com", "gmx.de", "mail.com", "email.com", "yandex.com", "yandex.ru",
    "mail.ru", "bk.ru", "inbox.ru", "list.ru", "wp.pl", "o2.pl", "tuta.io", "tutanota.com", "tutamail.com",
    "fastmail.com", "hey.com", "disroot.org", "riseup.net", "mailfence.com", "startmail.com",
    "yahoo.co.uk", "hotmail.co.uk", "outlook.fr", "hotmail.fr", "yahoo.fr", "outlook.de", "hotmail.de",
    "yahoo.de", "outlook.it", "hotmail.it", "yahoo.it", "yahoo.co.jp", "hotmail.com.ar", "yahoo.com.ar",
    "hotmail.com.mx", "yahoo.com.mx", "outlook.es", "hotmail.es", "yahoo.es",
    /* descartáveis */
    "mailinator.com", "guerrillamail.com", "tempmail.com", "temp-mail.org", "10minutemail.com",
    "trashmail.com", "yopmail.com", "sharklasers.com", "getnada.com", "mohmal.com",
  ].map((d) => d.toLowerCase())
);

export function validarEmailCorporativo(email: string): { ok: boolean; msg: string; dominio?: string } {
  const mail = email.trim().toLowerCase();
  const m = mail.match(/^[a-z0-9._%+-]+@([a-z0-9-]+(?:\.[a-z0-9-]+)+)$/i);
  if (!m) return { ok: false, msg: "Informe um e-mail válido (ex.: nome@suaempresa.com.br)." };
  const dominio = m[1].toLowerCase();
  if (DOMINIOS_PESSOAIS.has(dominio)) {
    return { ok: false, msg: "E-mail pessoal/gratuito não é aceito. Use seu e-mail corporativo (ex.: nome@suaempresa.com.br)." };
  }
  return { ok: true, msg: "", dominio };
}

/* Hash de senha: SHA-256 (Web Crypto) com salt; fallback FNV em contexto não-seguro */
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
  const texto = `${salt}::radargrc::${senha}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
  } catch {
    /* contexto inseguro — fallback */
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

/* política de bloqueio por força bruta */
function lerLocks(): Record<string, { n: number; ate: number }> {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function gravarLocks(l: Record<string, { n: number; ate: number }>) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(l));
}
export function bloqueioRestante(email: string): number {
  const l = lerLocks()[email.trim().toLowerCase()];
  if (!l) return 0;
  const resta = Math.ceil((l.ate - Date.now()) / 1000);
  return resta > 0 ? resta : 0;
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
            empresa: "Radar GRC",
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
    const mail = email.trim().toLowerCase();
    const vEmail = validarEmailCorporativo(mail);
    if (!vEmail.ok) return vEmail.msg;
    const bloqueado = bloqueioRestante(mail);
    if (bloqueado > 0) return `Conta bloqueada temporariamente após ${MAX_TENTATIVAS} tentativas. Aguarde ${bloqueado}s e tente novamente.`;
    await new Promise((r) => setTimeout(r, 600));
    const u = lerUsers().find((x) => x.email === mail);
    if (!u) return "Nenhuma conta encontrada com este e-mail. Crie seu acesso primeiro.";
    const h = await hashSenha(senha, u.salt);
    if (h !== u.hash) {
      const locks = lerLocks();
      const reg = locks[mail] ?? { n: 0, ate: 0 };
      reg.n += 1;
      if (reg.n >= MAX_TENTATIVAS) {
        reg.ate = Date.now() + BLOQUEIO_SEG * 1000;
        reg.n = 0;
        gravarLocks({ ...locks, [mail]: reg });
        return `${MAX_TENTATIVAS} tentativas incorretas — acesso bloqueado por ${BLOQUEIO_SEG}s (política de segurança).`;
      }
      gravarLocks({ ...locks, [mail]: reg });
      const restantes = MAX_TENTATIVAS - reg.n;
      return `Senha incorreta. ${restantes} tentativa${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""} antes do bloqueio.`;
    }
    gravarLocks({ ...lerLocks(), [mail]: { n: 0, ate: 0 } });
    gravarSessao({ userId: u.id, lembrar });
    setUsuario(u);
    return null;
  }, []);

  const cadastrar = useCallback(async ({ nome, empresa, email, senha }: { nome: string; empresa: string; email: string; senha: string }) => {
    await new Promise((r) => setTimeout(r, 700));
    const lista = lerUsers();
    const mail = email.trim().toLowerCase();
    const vEmail = validarEmailCorporativo(mail);
    if (!vEmail.ok) return vEmail.msg;
    if (lista.some((x) => x.email === mail)) return "Já existe uma conta cadastrada com este e-mail. Faça login.";
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
    gravarUsers([...lista, novo]);
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
