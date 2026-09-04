import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ============ Usuários, planos, sessão e segurança (persistência local) ============ */

export type Plano = "demo" | "pro";
export type Papel = "admin" | "operador";

export type Usuario = {
  id: string;
  nome: string;
  empresa: string;
  email: string;
  cargo?: string;
  porte?: string;
  jurisdicao?: string;
  telefone?: string;
  salt: string;
  hash: string;
  criadoEm: string;
  ultimoAcesso?: string;
  plano: Plano;
  papel: Papel;
  bloqueado?: boolean;
  trialAte?: string;
  demo?: boolean;
};

type Sessao = { userId: string; lembrar: boolean };

export const DEMO_EMAIL = "demo@radarlgpd.app";
export const DEMO_SENHA = "demo1234";
export const ADMIN_EMAIL = "admin@radargrc.app";
export const ADMIN_SENHA = "Admin@2024!";

const USERS_KEY = "radargrc:users";
const SESSION_KEY = "radargrc:session";
const LOCK_KEY = "radargrc:lock";
const SECLOG_KEY = "radargrc:seclog";
const MAX_TENTATIVAS = 5;
const BLOQUEIOS_ESCALONADOS = [60, 300, 1800]; // segundos, progressivo

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

/* ---------- política de e-mail corporativo ---------- */
const DOMINIOS_GRATUITOS = [
  "gmail.com","googlemail.com","outlook.com","hotmail.com","live.com","msn.com","yahoo.com","yahoo.com.br",
  "ymail.com","icloud.com","me.com","mac.com","aol.com","proton.me","protonmail.com","gmx.com","gmx.de",
  "mail.com","zoho.com","yandex.com","bol.com.br","uol.com.br","terra.com.br","ig.com.br","r7.com",
  "zipmail.com.br","click21.com.br","oi.com.br","superig.com.br","live.co.uk","outlook.co.uk","hotmail.co.uk",
  "yopmail.com","tempmail.com","temp-mail.org","guerrillamail.com","mailinator.com","10minutemail.com",
  "trashmail.com","sharklasers.com","getnada.com","dispostable.com","fakeinbox.com","mintemail.com",
];

export function validarEmailCorporativo(email: string): { ok: boolean; dominio?: string; msg?: string } {
  const e = email.trim().toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return { ok: false, msg: "Informe um e-mail válido." };
  const dominio = e.split("@")[1];
  if (DOMINIOS_GRATUITOS.includes(dominio))
    return { ok: false, msg: "E-mails pessoais/gratuitos não são aceitos. Use seu e-mail corporativo (ex.: nome@suaempresa.com.br)." };
  return { ok: true, dominio };
}

/* ---------- política de senha forte ---------- */
const SENHAS_COMUNS = [
  "password123","senha12345","1234567890","qwerty12345","admin12345","welcome123","12345678910",
  "abcdefgh123","iloveyou123","1111111111","123456789a","1q2w3e4r5t","qwertyuiop123","senha@12345","mudar12345",
];

export function validarSenhaForte(s: string): string | null {
  if (s.length < 10) return "A senha precisa de pelo menos 10 caracteres.";
  if (!/[A-Z]/.test(s) || !/[a-z]/.test(s)) return "Inclua letras maiúsculas e minúsculas.";
  if (!/\d/.test(s)) return "Inclua ao menos um número.";
  if (SENHAS_COMUNS.includes(s.toLowerCase())) return "Esta senha é muito comum — escolha outra combinação.";
  return null;
}

/* ---------- hash de senha: SHA-256 + salt (fallback FNV em contexto não-seguro) ---------- */
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

/* ---------- persistência ---------- */
function normalizar(u: Partial<Usuario> & { id: string; email: string }): Usuario {
  return {
    nome: "", empresa: "", salt: "", hash: "", criadoEm: new Date().toISOString(), plano: "demo", papel: "operador",
    ...u,
  } as Usuario;
}

export function listarUsuarios(): Usuario[] {
  try {
    return (JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]") as Partial<Usuario>[]).map((u) => normalizar(u as Usuario));
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

/* ---------- bloqueio progressivo anti força-bruta ---------- */
function lerLocks(): Record<string, { n: number; nivel: number; ate: number }> {
  try {
    return JSON.parse(localStorage.getItem(LOCK_KEY) ?? "{}");
  } catch {
    return {};
  }
}
function gravarLocks(l: Record<string, { n: number; nivel: number; ate: number }>) {
  localStorage.setItem(LOCK_KEY, JSON.stringify(l));
}
export function bloqueioRestante(email: string): number {
  const l = lerLocks()[email.trim().toLowerCase()];
  if (!l) return 0;
  const resta = Math.ceil((l.ate - Date.now()) / 1000);
  return resta > 0 ? resta : 0;
}
export function listarBloqueiosAtivos(): number {
  return Object.values(lerLocks()).filter((l) => l.ate > Date.now()).length;
}

/* ---------- log de eventos de segurança ---------- */
export type EventoSeguranca = {
  id: string;
  ts: string;
  tipo: "login_ok" | "login_falha" | "bloqueio" | "cadastro" | "senha_troca" | "sessao_expirada" | "admin_acao" | "trial_ativado";
  email: string;
  detalhe: string;
};

export function registrarSeguranca(tipo: EventoSeguranca["tipo"], email: string, detalhe: string) {
  try {
    const log = JSON.parse(localStorage.getItem(SECLOG_KEY) ?? "[]") as EventoSeguranca[];
    log.unshift({ id: uid(), ts: new Date().toISOString(), tipo, email, detalhe });
    localStorage.setItem(SECLOG_KEY, JSON.stringify(log.slice(0, 250)));
  } catch {
    /* armazenamento indisponível */
  }
}
export function listarSeguranca(): EventoSeguranca[] {
  try {
    return JSON.parse(localStorage.getItem(SECLOG_KEY) ?? "[]");
  } catch {
    return [];
  }
}
export function limparSeguranca() {
  localStorage.removeItem(SECLOG_KEY);
}

/* ---------- limites de sessão por inatividade ---------- */
export const limiteSessao = (papel: Papel) => (papel === "admin" ? 30 * 60_000 : 2 * 3_600_000);

/* ---------- validação de trial ---------- */
function validarTrial(u: Usuario): Usuario {
  if (u.papel !== "admin" && u.plano === "pro" && u.trialAte && new Date(u.trialAte).getTime() < Date.now()) {
    const degradado = { ...u, plano: "demo" as Plano, trialAte: undefined };
    gravarUsers(listarUsuarios().map((x) => (x.id === u.id ? degradado : x)));
    return degradado;
  }
  return u;
}

/* ============ Contexto ============ */

type AuthCtx = {
  usuario: Usuario | null;
  pronto: boolean;
  entrar: (email: string, senha: string, lembrar: boolean) => Promise<string | null>;
  cadastrar: (d: { nome: string; empresa: string; email: string; senha: string; cargo: string; porte: string; jurisdicao: string; telefone: string }) => Promise<string | null>;
  sair: () => void;
  atualizarPerfil: (nome: string, empresa: string) => void;
  trocarSenha: (atual: string, nova: string) => Promise<string | null>;
  ativarTrial: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pronto, setPronto] = useState(false);

  /* seed das contas demo + admin e restauração de sessão */
  useEffect(() => {
    (async () => {
      const lista = listarUsuarios();
      const novos: Usuario[] = [];
      if (!lista.some((u) => u.email === DEMO_EMAIL)) {
        const salt = uid();
        novos.push(normalizar({
          id: "demo-radar", nome: "Conta Demonstração", empresa: "Radar GRC", email: DEMO_EMAIL,
          cargo: "Encarregado(a) de dados (DPO)", porte: "11–50 colaboradores", jurisdicao: "Ambas (LGPD + GDPR)",
          salt, hash: await hashSenha(DEMO_SENHA, salt), plano: "demo", papel: "operador", demo: true,
        }));
      }
      if (!lista.some((u) => u.email === ADMIN_EMAIL)) {
        const salt = uid();
        novos.push(normalizar({
          id: "admin-radar", nome: "Administrador Master", empresa: "Radar GRC", email: ADMIN_EMAIL,
          cargo: "Diretoria / C-level", porte: "11–50 colaboradores", jurisdicao: "Ambas (LGPD + GDPR)",
          salt, hash: await hashSenha(ADMIN_SENHA, salt), plano: "pro", papel: "admin",
        }));
      }
      if (novos.length) gravarUsers([...lista, ...novos]);
      const todas = novos.length ? listarUsuarios() : lista;
      const s = lerSessao();
      if (s) {
        let u = todas.find((x) => x.id === s.userId);
        if (u && !u.bloqueado) {
          u = validarTrial(u);
          setUsuario(u);
        }
      }
      setPronto(true);
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    const mail = email.trim().toLowerCase();
    const vEmail = validarEmailCorporativo(mail);
    if (!vEmail.ok) return vEmail.msg ?? "E-mail inválido.";
    const bloqueado = bloqueioRestante(mail);
    if (bloqueado > 0) return `Acesso bloqueado temporariamente (proteção anti força-bruta). Aguarde ${bloqueado}s.`;
    await new Promise((r) => setTimeout(r, 600));
    const u = listarUsuarios().find((x) => x.email === mail);
    if (!u) {
      registrarSeguranca("login_falha", mail, "Tentativa de login com e-mail não cadastrado.");
      return "Nenhuma conta encontrada com este e-mail. Crie seu acesso primeiro.";
    }
    if (u.bloqueado) {
      registrarSeguranca("login_falha", mail, "Tentativa de login em conta bloqueada por administrador.");
      return "Esta conta está bloqueada pelo administrador. Entre em contato com o suporte.";
    }
    const h = await hashSenha(senha, u.salt);
    if (h !== u.hash) {
      const locks = lerLocks();
      const reg = locks[mail] ?? { n: 0, nivel: 0, ate: 0 };
      reg.n += 1;
      registrarSeguranca("login_falha", mail, `Senha incorreta (tentativa ${reg.n} de ${MAX_TENTATIVAS}).`);
      if (reg.n >= MAX_TENTATIVAS) {
        reg.nivel = Math.min(reg.nivel + 1, BLOQUEIOS_ESCALONADOS.length) ;
        const segs = BLOQUEIOS_ESCALONADOS[reg.nivel - 1];
        reg.ate = Date.now() + segs * 1000;
        reg.n = 0;
        gravarLocks({ ...locks, [mail]: reg });
        registrarSeguranca("bloqueio", mail, `Conta bloqueada por ${segs}s após ${MAX_TENTATIVAS} tentativas (nível ${reg.nivel}).`);
        return `${MAX_TENTATIVAS} tentativas incorretas — bloqueio de ${segs >= 60 ? `${segs / 60} min` : `${segs}s`} aplicado (nível ${reg.nivel}).`;
      }
      gravarLocks({ ...locks, [mail]: reg });
      const restantes = MAX_TENTATIVAS - reg.n;
      return `Senha incorreta. ${restantes} tentativa${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""} antes do bloqueio.`;
    }
    gravarLocks({ ...lerLocks(), [mail]: { n: 0, nivel: 0, ate: 0 } });
    const atualizado = validarTrial({ ...u, ultimoAcesso: new Date().toISOString() });
    gravarUsers(listarUsuarios().map((x) => (x.id === u.id ? atualizado : x)));
    gravarSessao({ userId: u.id, lembrar });
    registrarSeguranca("login_ok", mail, `Login efetuado${lembrar ? " (manter conectado)" : ""}.`);
    setUsuario(atualizado);
    return null;
  }, []);

  const cadastrar = useCallback(async (d: { nome: string; empresa: string; email: string; senha: string; cargo: string; porte: string; jurisdicao: string; telefone: string }) => {
    await new Promise((r) => setTimeout(r, 700));
    const lista = listarUsuarios();
    const mail = d.email.trim().toLowerCase();
    const vEmail = validarEmailCorporativo(mail);
    if (!vEmail.ok) return vEmail.msg ?? "E-mail inválido.";
    if (lista.some((x) => x.email === mail)) return "Já existe uma conta cadastrada com este e-mail. Faça login.";
    const salt = uid();
    const novo = normalizar({
      id: uid(),
      nome: d.nome.trim(),
      empresa: d.empresa.trim(),
      email: mail,
      cargo: d.cargo,
      porte: d.porte,
      jurisdicao: d.jurisdicao,
      telefone: d.telefone.trim(),
      salt,
      hash: await hashSenha(d.senha, salt),
      plano: "demo" as Plano,
      papel: "operador" as Papel,
      ultimoAcesso: new Date().toISOString(),
    });
    gravarUsers([...lista, novo]);
    gravarSessao({ userId: novo.id, lembrar: true });
    registrarSeguranca("cadastro", mail, `Conta criada (plano Demo) · ${d.cargo} · jurisdição: ${d.jurisdicao}.`);
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
      gravarUsers(listarUsuarios().map((x) => (x.id === u.id ? novo : x)));
      return novo;
    });
  }, []);

  const trocarSenha = useCallback(
    async (atual: string, nova: string) => {
      if (!usuario) return "Sessão expirada. Entre novamente.";
      await new Promise((r) => setTimeout(r, 500));
      const h = await hashSenha(atual, usuario.salt);
      if (h !== usuario.hash) return "A senha atual não confere.";
      const fraca = validarSenhaForte(nova);
      if (fraca) return fraca;
      const salt = uid();
      const hash = await hashSenha(nova, salt);
      const novo = { ...usuario, salt, hash };
      gravarUsers(listarUsuarios().map((x) => (x.id === usuario.id ? novo : x)));
      registrarSeguranca("senha_troca", usuario.email, "Senha alterada pelo usuário.");
      setUsuario(novo);
      return null;
    },
    [usuario]
  );

  const ativarTrial = useCallback(() => {
    setUsuario((u) => {
      if (!u || u.plano === "pro") return u;
      const novo = { ...u, plano: "pro" as Plano, trialAte: new Date(Date.now() + 14 * 86400000).toISOString() };
      gravarUsers(listarUsuarios().map((x) => (x.id === u.id ? novo : x)));
      registrarSeguranca("trial_ativado", u.email, "Trial do Plano Pro ativado por 14 dias.");
      return novo;
    });
  }, []);

  const v = useMemo(
    () => ({ usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha, ativarTrial }),
    [usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha, ativarTrial]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
}

/* ============ Funções administrativas (painel) ============ */

export function adminSetPlano(userId: string, plano: Plano, diasTrial?: number) {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId);
  if (!u) return;
  const novo = { ...u, plano, trialAte: diasTrial ? new Date(Date.now() + diasTrial * 86400000).toISOString() : undefined };
  gravarUsers(lista.map((x) => (x.id === userId ? novo : x)));
  registrarSeguranca("admin_acao", u.email, `Plano alterado para ${plano.toUpperCase()} por administrador.`);
}

export function adminToggleBloqueio(userId: string): boolean {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId);
  if (!u) return false;
  const novo = { ...u, bloqueado: !u.bloqueado };
  gravarUsers(lista.map((x) => (x.id === userId ? novo : x)));
  registrarSeguranca("admin_acao", u.email, novo.bloqueado ? "Conta BLOQUEADA por administrador." : "Conta desbloqueada por administrador.");
  return !!novo.bloqueado;
}

export function adminSetPapel(userId: string, papel: Papel) {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId);
  if (!u) return;
  gravarUsers(lista.map((x) => (x.id === userId ? { ...x, papel } : x)));
  registrarSeguranca("admin_acao", u.email, `Papel alterado para ${papel} por administrador.`);
}

export async function adminResetarSenha(userId: string): Promise<string | null> {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId);
  if (!u) return null;
  const aleatoria = `Radar@${Math.random().toString(36).slice(2, 6)}${Math.floor(100 + Math.random() * 900)}`;
  const salt = uid();
  const hash = await hashSenha(aleatoria, salt);
  gravarUsers(lista.map((x) => (x.id === userId ? { ...x, salt, hash } : x)));
  registrarSeguranca("admin_acao", u.email, "Senha redefinida por administrador (senha temporária emitida).");
  return aleatoria;
}

export function adminRemover(userId: string): string | null {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId);
  if (!u) return "Usuário não encontrado.";
  if (u.papel === "admin" && lista.filter((x) => x.papel === "admin").length <= 1) return "Não é possível excluir o único administrador.";
  gravarUsers(lista.filter((x) => x.id !== userId));
  localStorage.removeItem(`radargrc:${userId}`);
  registrarSeguranca("admin_acao", u.email, "Conta e dados excluídos por administrador.");
  return null;
}
