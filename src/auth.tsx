import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* =====================================================================
   Autenticação, usuários, planos e trilha de segurança.
   Senhas: SHA-256 + salt (Web Crypto). Bloqueio anti força-bruta.
   ===================================================================== */

export type Papel = "admin" | "operador";
export type PlanoConta = "trial" | "standard" | "business" | "completo";

export const TRIAL_DIAS = 7;
export const DEMO_EMAIL = "demo@radarlgpd.app";
export const DEMO_SENHA = "demo1234";
/* conta root: administradora master, plano completo, sem marcação de demonstração */
export const ROOT_EMAIL = "root@radargrc.app";
export const ROOT_SENHA = "Root#Radar2026";

export interface Usuario {
  id: string;
  orgId: string;
  nome: string;
  empresa: string;
  email: string;
  cargo?: string;
  salt: string;
  hash: string;
  criadoEm: string;
  papel: Papel;
  plano: PlanoConta;
  trialAte?: string;
  planoAtivoEm?: string;
  bloqueado?: boolean;
  demo?: boolean;
}

export interface EventoSeguranca {
  id: string;
  ts: string;
  tipo: string;
  email: string;
  detalhe: string;
}

const USERS_KEY = "radargrc:users";
const SESSION_KEY = "radargrc:session";
const LOCK_KEY = "radargrc:lock";
const SEC_KEY = "radargrc:security";
const MAX_TENTATIVAS = 5;
const BLOQUEIO_SEG = 60;

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---------- hash ---------- */
export async function hashSenha(senha: string, salt: string): Promise<string> {
  const texto = `${salt}::radargrc::${senha}`;
  try {
    if (typeof crypto !== "undefined" && crypto.subtle) {
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texto));
      return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
    }
  } catch {
    /* contexto não seguro — fallback */
  }
  let h1 = 0x811c9dc5 >>> 0;
  for (let i = 0; i < texto.length; i++) h1 = Math.imul(h1 ^ texto.charCodeAt(i), 0x01000193) >>> 0;
  return h1.toString(16).padStart(8, "0");
}

/* ---------- validação de e-mail corporativo ---------- */
const DOMINIOS_LIVRES = new Set(["gmail.com","googlemail.com","outlook.com","hotmail.com","live.com","msn.com","yahoo.com","yahoo.com.br","icloud.com","me.com","aol.com","proton.me","protonmail.com","uol.com.br","bol.com.br","terra.com.br","globo.com","zipmail.com.br","yopmail.com","mailinator.com","tempmail.com"]);

const DOMINIOS_PERMITIDOS = new Set(["radargrc.app", "radar-lgpd.com.br"]);

export function validarEmailCorporativo(email: string): { ok: boolean; dominio?: string; msg: string } {
  const e = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return { ok: false, msg: "Informe um e-mail válido." };
  const dominio = e.split("@")[1];
  
  // Permitir domínios específicos do sistema
  if (DOMINIOS_PERMITIDOS.has(dominio)) {
    return { ok: true, dominio, msg: "" };
  }
  
  if (DOMINIOS_LIVRES.has(dominio))
    return { ok: false, msg: `O domínio "${dominio}" é pessoal/gratuito. Use seu e-mail corporativo (ex.: voce@suaempresa.com.br).` };
  return { ok: true, dominio, msg: "" };
}

export function validarSenhaForte(senha: string): string | null {
  if (senha.length < 10) return "A senha deve ter pelo menos 10 caracteres.";
  if (!/[a-z]/.test(senha) || !/[A-Z]/.test(senha)) return "Use letras maiúsculas e minúsculas.";
  if (!/\d/.test(senha)) return "Inclua pelo menos um número.";
  return null;
}

/* ---------- persistência ---------- */
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
function lerSessao(): { userId: string } | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY) ?? localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
function gravarSessao(s: { userId: string }, lembrar: boolean) {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
  (lembrar ? localStorage : sessionStorage).setItem(SESSION_KEY, JSON.stringify(s));
}
function limparSessao() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}
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

/* ---------- trilha de segurança ---------- */
export function registrarSeguranca(tipo: string, email: string, detalhe: string) {
  try {
    const lista = JSON.parse(localStorage.getItem(SEC_KEY) ?? "[]") as EventoSeguranca[];
    lista.unshift({ id: uid(), ts: new Date().toISOString(), tipo, email, detalhe });
    localStorage.setItem(SEC_KEY, JSON.stringify(lista.slice(0, 120)));
  } catch {
    /* armazenamento indisponível */
  }
}
export function listarSeguranca(): EventoSeguranca[] {
  try {
    return JSON.parse(localStorage.getItem(SEC_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function usuariosDaOrg(orgId: string): Usuario[] {
  return lerUsers().filter((u) => u.orgId === orgId);
}

/* ---------- contexto ---------- */
interface AuthCtx {
  usuario: Usuario | null;
  pronto: boolean;
  entrar: (email: string, senha: string, lembrar: boolean) => Promise<string | null>;
  cadastrar: (d: { nome: string; empresa: string; email: string; senha: string; cargo?: string }) => Promise<string | null>;
  sair: () => void;
  atualizarPerfil: (nome: string, empresa: string) => void;
  trocarSenha: (atual: string, nova: string) => Promise<string | null>;
  ativarPlano: (plano: Exclude<PlanoConta, "trial">) => void;
  adminCriarUsuario: (orgId: string, d: { nome: string; email: string; cargo?: string; papel: Papel }) => { ok: boolean; msg?: string; senhaTemporaria?: string };
  adminToggleBloqueio: (orgId: string, id: string) => void;
  adminExcluirUsuario: (orgId: string, id: string, selfId: string) => void;
  adminRedefinirSenha: (orgId: string, id: string) => { ok: boolean; senhaTemporaria?: string };
}

const Ctx = createContext<AuthCtx | null>(null);

function senhaTemporaria() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let s = "";
  for (let i = 0; i < 10; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s + "A1!";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pronto, setPronto] = useState(false);

  /* seed da conta demo (acesso total permanente) + restauração de sessão.
     A conta é SEMPRE garantida com acesso completo (admin + plano Completo),
     mesmo que já exista no navegador com dados de uma versão anterior. */
  useEffect(() => {
    (async () => {
      const lista = lerUsers();
      
      /* conta DEMO: criar apenas se não existir */
      const idxDemo = lista.findIndex((u) => u.email === DEMO_EMAIL);
      if (idxDemo === -1) {
        const salt = uid();
        const hash = await hashSenha(DEMO_SENHA, salt);
        lista.push({
          id: "demo-radar", orgId: "org-demo", nome: "Administrador Root", empresa: "Radar GRC",
          email: DEMO_EMAIL, cargo: "Administrador do sistema", salt, hash,
          criadoEm: new Date().toISOString(), papel: "admin" as Papel, plano: "completo" as PlanoConta, demo: true,
        });
      } else {
        /* atualiza apenas os campos necessários, preservando salt e hash */
        lista[idxDemo] = { 
          ...lista[idxDemo], 
          papel: "admin" as Papel, 
          plano: "completo" as PlanoConta, 
          demo: true,
          bloqueado: false 
        };
      }

      /* conta ROOT: criar apenas se não existir */
      const idxRoot = lista.findIndex((u) => u.email === ROOT_EMAIL);
      if (idxRoot === -1) {
        const saltRoot = uid();
        const hashRoot = await hashSenha(ROOT_SENHA, saltRoot);
        lista.push({
          id: "root-radar", orgId: "org-root", nome: "Administrador Master", empresa: "Radar GRC",
          email: ROOT_EMAIL, cargo: "Diretoria / C-level", salt: saltRoot, hash: hashRoot,
          criadoEm: new Date().toISOString(), papel: "admin" as Papel, plano: "completo" as PlanoConta,
        });
      } else {
        /* atualiza apenas os campos necessários, preservando salt e hash */
        lista[idxRoot] = { 
          ...lista[idxRoot], 
          papel: "admin" as Papel, 
          plano: "completo" as PlanoConta,
          bloqueado: false 
        };
      }

      gravarUsers(lista);
      /* limpa qualquer bloqueio anti força-bruta pendente das contas demo e root */
      const locks = lerLocks();
      if (locks[DEMO_EMAIL] || locks[ROOT_EMAIL]) {
        delete locks[DEMO_EMAIL];
        delete locks[ROOT_EMAIL];
        gravarLocks(locks);
      }
      const s = lerSessao();
      if (s) {
        const u = lerUsers().find((x) => x.id === s.userId);
        if (u && !u.bloqueado) setUsuario(u);
      }
      setPronto(true);
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    const mail = email.trim().toLowerCase();
    const v = validarEmailCorporativo(mail);
    if (!v.ok) return v.msg;
    const locks = lerLocks();
    const lock = locks[mail];
    if (lock && lock.ate > Date.now())
      return `Acesso bloqueado temporariamente (proteção anti força-bruta). Aguarde ${Math.ceil((lock.ate - Date.now()) / 1000)}s.`;
    await new Promise((r) => setTimeout(r, 500));
    const u = lerUsers().find((x) => x.email === mail);
    if (!u) return "Nenhuma conta encontrada com este e-mail. Crie seu acesso primeiro.";
    if (u.bloqueado) return "Esta conta foi bloqueada pelo administrador da organização.";
    const h = await hashSenha(senha, u.salt);
    if (h !== u.hash) {
      const n = (lock?.n ?? 0) + 1;
      const novo = n >= MAX_TENTATIVAS ? { n: 0, ate: Date.now() + BLOQUEIO_SEG * 1000 } : { n, ate: 0 };
      gravarLocks({ ...locks, [mail]: novo });
      registrarSeguranca("falha_login", mail, n >= MAX_TENTATIVAS ? "Conta bloqueada por 60s após 5 tentativas" : `Tentativa de login inválida (${n}/${MAX_TENTATIVAS})`);
      return n >= MAX_TENTATIVAS
        ? `Acesso bloqueado temporariamente (proteção anti força-bruta). Aguarde ${BLOQUEIO_SEG}s.`
        : `Senha incorreta. ${MAX_TENTATIVAS - n} tentativa(s) restante(s) antes do bloqueio.`;
    }
    gravarLocks({ ...locks, [mail]: { n: 0, ate: 0 } });
    gravarSessao({ userId: u.id }, lembrar);
    registrarSeguranca("login", mail, "Login efetuado com sucesso.");
    setUsuario(u);
    return null;
  }, []);

  const cadastrar = useCallback(async ({ nome, empresa, email, senha, cargo }: { nome: string; empresa: string; email: string; senha: string; cargo?: string }) => {
    await new Promise((r) => setTimeout(r, 600));
    const lista = lerUsers();
    const mail = email.trim().toLowerCase();
    const v = validarEmailCorporativo(mail);
    if (!v.ok) return v.msg;
    if (lista.some((x) => x.email === mail)) return "Já existe uma conta cadastrada com este e-mail. Faça login.";
    const fraca = validarSenhaForte(senha);
    if (fraca) return fraca;
    const salt = uid();
    const novo: Usuario = {
      id: uid(), orgId: `org-${uid()}`, nome: nome.trim(), empresa: empresa.trim(), email: mail, cargo,
      salt, hash: await hashSenha(senha, salt), criadoEm: new Date().toISOString(),
      papel: "admin", // quem adquire o sistema é o administrador
      plano: "trial",
      trialAte: new Date(Date.now() + TRIAL_DIAS * 86400000).toISOString(),
    };
    gravarUsers([...lista, novo]);
    gravarSessao({ userId: novo.id }, true);
    registrarSeguranca("cadastro", mail, `Conta criada — trial de ${TRIAL_DIAS} dias iniciado.`);
    setUsuario(novo);
    return null;
  }, []);

  const sair = useCallback(() => {
    if (usuario) registrarSeguranca("logout", usuario.email, "Sessão encerrada.");
    limparSessao();
    setUsuario(null);
  }, [usuario]);

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
      const h = await hashSenha(atual, usuario.salt);
      if (h !== usuario.hash) return "A senha atual não confere.";
      const fraca = validarSenhaForte(nova);
      if (fraca) return fraca;
      const salt = uid();
      const hash = await hashSenha(nova, salt);
      const novo = { ...usuario, salt, hash };
      gravarUsers(lerUsers().map((x) => (x.id === usuario.id ? novo : x)));
      registrarSeguranca("senha_troca", usuario.email, "Senha alterada pelo próprio usuário.");
      setUsuario(novo);
      return null;
    },
    [usuario]
  );

  const ativarPlano = useCallback(
    (plano: Exclude<PlanoConta, "trial">) => {
      setUsuario((u) => {
        if (!u) return u;
        const novo = { ...u, plano, planoAtivoEm: new Date().toISOString(), trialAte: undefined };
        gravarUsers(lerUsers().map((x) => (x.id === u.id ? novo : x)));
        registrarSeguranca("assinatura", u.email, `Plano ${plano.toUpperCase()} ativado.`);
        return novo;
      });
    },
    []
  );

  /* ---------- administração de usuários ---------- */
  const adminCriarUsuario = useCallback((orgId: string, d: { nome: string; email: string; cargo?: string; papel: Papel }) => {
    const mail = d.email.trim().toLowerCase();
    const v = validarEmailCorporativo(mail);
    if (!v.ok) return { ok: false, msg: v.msg };
    const lista = lerUsers();
    if (lista.some((x) => x.email === mail)) return { ok: false, msg: "Já existe um usuário com este e-mail." };
    const senha = senhaTemporaria();
    const salt = uid();
    (async () => {
      const hash = await hashSenha(senha, salt);
      const novo: Usuario = {
        id: uid(), orgId, nome: d.nome.trim(), empresa: lista.find((x) => x.orgId === orgId)?.empresa ?? "", email: mail,
        cargo: d.cargo, salt, hash, criadoEm: new Date().toISOString(), papel: d.papel, plano: "completo",
      };
      gravarUsers([...lista, novo]);
      registrarSeguranca("admin_acao", mail, `Usuário criado (${d.papel}) com senha temporária.`);
    })();
    return { ok: true, senhaTemporaria: senha };
  }, []);

  const adminToggleBloqueio = useCallback((orgId: string, id: string) => {
    const lista = lerUsers().map((x) => (x.orgId === orgId && x.id === id ? { ...x, bloqueado: !x.bloqueado } : x));
    gravarUsers(lista);
    const u = lista.find((x) => x.id === id);
    if (u) registrarSeguranca("admin_acao", u.email, u.bloqueado ? "Conta bloqueada pelo administrador." : "Conta desbloqueada.");
  }, []);

  const adminExcluirUsuario = useCallback((orgId: string, id: string, selfId: string) => {
    if (id === selfId) return;
    const alvo = lerUsers().find((x) => x.id === id);
    gravarUsers(lerUsers().filter((x) => !(x.orgId === orgId && x.id === id)));
    if (alvo) registrarSeguranca("admin_acao", alvo.email, "Conta excluída pelo administrador.");
  }, []);

  const adminRedefinirSenha = useCallback((orgId: string, id: string) => {
    const senha = senhaTemporaria();
    const salt = uid();
    (async () => {
      const hash = await hashSenha(senha, salt);
      const lista = lerUsers().map((x) => (x.orgId === orgId && x.id === id ? { ...x, salt, hash, bloqueado: false } : x));
      gravarUsers(lista);
    })();
    const u = lerUsers().find((x) => x.id === id);
    if (u) registrarSeguranca("admin_acao", u.email, "Senha redefinida com senha temporária.");
    return { ok: true, senhaTemporaria: senha };
  }, []);

  const v = useMemo(
    () => ({ usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha, ativarPlano, adminCriarUsuario, adminToggleBloqueio, adminExcluirUsuario, adminRedefinirSenha }),
    [usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha, ativarPlano, adminCriarUsuario, adminToggleBloqueio, adminExcluirUsuario, adminRedefinirSenha]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
}
