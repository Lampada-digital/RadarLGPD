import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

/* ============ Usuários, organizações, sessão e segurança (persistência local) ============
   Modelo de negócio: licença mensal fixa, sem planos/limites.
   Todo cliente que se cadastra torna-se ADMINISTRADOR da própria organização e pode
   criar, bloquear e excluir usuários (operadores) do seu time.                      */

export type Papel = "admin" | "operador";
export type PlanoConta = "trial" | "completo";

/* Modelo comercial: plano único "Completo" (R$ 149,00/mês) + free trial de 7 dias. */
export const PRECO_MENSAL = "R$ 149,00";
export const TRIAL_DIAS = 7;

export type Usuario = {
  id: string;
  orgId: string;
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
  criadoPor?: string;
  ultimoAcesso?: string;
  papel: Papel;
  plano: PlanoConta;
  trialAte?: string;      // fim do free trial de 7 dias (ISO)
  planoAtivoEm?: string;  // data de ativação da assinatura Completa
  bloqueado?: boolean;
  demo?: boolean;
};

type Sessao = { userId: string; lembrar: boolean };

export const DEMO_EMAIL = "demo@radarlgpd.app";
export const DEMO_SENHA = "demo1234";

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
    nome: "", empresa: "", salt: "", hash: "",
    criadoEm: new Date().toISOString(),
    orgId: `org-${u.id}`,          // migração: usuários antigos ganham a própria org
    papel: "operador",
    plano: "completo",             // contas antigas (pré-modelo de assinatura) não são travadas
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
  tipo: "login_ok" | "login_falha" | "bloqueio" | "cadastro" | "senha_troca" | "sessao_expirada" | "admin_acao";
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

/* ---------- senha temporária legível ---------- */
export function gerarSenhaTemporaria(): string {
  const maius = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  const minus = "abcdefghijkmnpqrstuvwxyz";
  const nums = "23456789";
  const todos = maius + minus + nums;
  const pick = (arr: string, n: number) => Array.from({ length: n }, () => arr[Math.floor(Math.random() * arr.length)]).join("");
  return `Radar@${pick(maius, 2)}${pick(minus, 4)}${pick(nums, 2)}`;
}

/* ============ Contexto de autenticação ============ */

type AuthCtx = {
  usuario: Usuario | null;
  pronto: boolean;
  entrar: (email: string, senha: string, lembrar: boolean) => Promise<string | null>;
  cadastrar: (d: { nome: string; empresa: string; email: string; senha: string; cargo: string; porte: string; jurisdicao: string; telefone: string }) => Promise<string | null>;
  sair: () => void;
  atualizarPerfil: (nome: string, empresa: string) => void;
  trocarSenha: (atual: string, nova: string) => Promise<string | null>;
  ativarPlano: () => void;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [pronto, setPronto] = useState(false);

  /* seed da conta demo (admin da org de demonstração) + restauração de sessão */
  useEffect(() => {
    (async () => {
      let lista = listarUsuarios();
      let demo = lista.find((u) => u.email === DEMO_EMAIL);

      if (!demo) {
        /* cria a conta demo */
        const salt = uid();
        demo = normalizar({
          id: "demo-radar", orgId: "org-demo", nome: "Conta Demonstração", empresa: "Radar GRC", email: DEMO_EMAIL,
          cargo: "Encarregado(a) de dados (DPO)", porte: "11–50 colaboradores", jurisdicao: "Ambas (LGPD + GDPR)",
          salt, hash: await hashSenha(DEMO_SENHA, salt), papel: "admin", plano: "completo", demo: true,
        });
        lista = [...lista, demo];
      } else {
        /* resincroniza a conta demo (compatibilidade entre versões do hash) e garante admin + desbloqueada */
        const salt = demo.salt || uid();
        const hash = await hashSenha(DEMO_SENHA, salt);
        if (hash !== demo.hash || demo.papel !== "admin" || demo.plano !== "completo" || demo.bloqueado || !demo.orgId) {
          demo = { ...demo, salt, hash, papel: "admin", plano: "completo", bloqueado: false, orgId: demo.orgId || "org-demo", demo: true };
          lista = lista.map((x) => (x.id === demo!.id ? demo! : x));
        }
      }
      gravarUsers(lista);

      /* limpa qualquer bloqueio anti força-bruta da conta demo */
      const locks = lerLocks();
      if (locks[DEMO_EMAIL]) {
        delete locks[DEMO_EMAIL];
        gravarLocks(locks);
      }

      const todas = lista;
      const s = lerSessao();
      if (s) {
        const u = todas.find((x) => x.id === s.userId);
        if (u && !u.bloqueado) setUsuario(u);
      }
      setPronto(true);
    })();
  }, []);

  const entrar = useCallback(async (email: string, senha: string, lembrar: boolean) => {
    const mail = email.trim().toLowerCase();
    const vEmail = validarEmailCorporativo(mail);
    if (!vEmail.ok) return vEmail.msg ?? "E-mail inválido.";
    const bloqueado = bloqueioRestante(mail);
    if (bloqueado > 0) return `Conta temporariamente bloqueada após ${MAX_TENTATIVAS} tentativas. Aguarde ${bloqueado}s.`;
    await new Promise((r) => setTimeout(r, 550));

    const u = listarUsuarios().find((x) => x.email === mail);
    if (!u) {
      registrarSeguranca("login_falha", mail, "Tentativa de login com e-mail não cadastrado.");
      return "Nenhuma conta encontrada com este e-mail corporativo.";
    }
    if (u.bloqueado) {
      registrarSeguranca("bloqueio", mail, "Tentativa de login em conta bloqueada pelo administrador.");
      return "Esta conta está bloqueada pelo administrador da organização.";
    }
    const h = await hashSenha(senha, u.salt);
    if (h !== u.hash) {
      const locks = lerLocks();
      const reg = locks[mail] ?? { n: 0, nivel: 0, ate: 0 };
      reg.n += 1;
      if (reg.n >= MAX_TENTATIVAS) {
        reg.ate = Date.now() + BLOQUEIOS_ESCALONADOS[Math.min(reg.nivel, BLOQUEIOS_ESCALONADOS.length - 1)] * 1000;
        reg.nivel += 1;
        reg.n = 0;
        gravarLocks({ ...locks, [mail]: reg });
        registrarSeguranca("bloqueio", mail, `Bloqueio progressivo aplicado (${BLOQUEIOS_ESCALONADOS[Math.min(reg.nivel - 1, 2)]}s).`);
        return `${MAX_TENTATIVAS} tentativas incorretas — acesso bloqueado temporariamente (política de segurança).`;
      }
      gravarLocks({ ...locks, [mail]: reg });
      registrarSeguranca("login_falha", mail, `Senha incorreta (${reg.n}/${MAX_TENTATIVAS}).`);
      const restantes = MAX_TENTATIVAS - reg.n;
      return `Senha incorreta. ${restantes} tentativa${restantes > 1 ? "s" : ""} restante${restantes > 1 ? "s" : ""} antes do bloqueio.`;
    }
    gravarLocks({ ...lerLocks(), [mail]: { n: 0, nivel: 0, ate: 0 } });
    const atualizado = { ...u, ultimoAcesso: new Date().toISOString() };
    gravarUsers(listarUsuarios().map((x) => (x.id === u.id ? atualizado : x)));
    gravarSessao({ userId: u.id, lembrar });
    registrarSeguranca("login_ok", mail, "Login efetuado com sucesso.");
    setUsuario(atualizado);
    return null;
  }, []);

  const cadastrar = useCallback(async (d: { nome: string; empresa: string; email: string; senha: string; cargo: string; porte: string; jurisdicao: string; telefone: string }) => {
    await new Promise((r) => setTimeout(r, 650));
    const lista = listarUsuarios();
    const mail = d.email.trim().toLowerCase();
    const vEmail = validarEmailCorporativo(mail);
    if (!vEmail.ok) return vEmail.msg ?? "E-mail inválido.";
    if (lista.some((x) => x.email === mail)) return "Já existe uma conta cadastrada com este e-mail. Faça login.";
    const salt = uid();
    const id = uid();
    const novo: Usuario = normalizar({
      id,
      orgId: `org-${id}`, // cada cliente funda a própria organização
      nome: d.nome.trim(),
      empresa: d.empresa.trim(),
      email: mail,
      cargo: d.cargo,
      porte: d.porte,
      jurisdicao: d.jurisdicao,
      telefone: d.telefone.trim(),
      salt,
      hash: await hashSenha(d.senha, salt),
      papel: "admin", // quem adquire o sistema é o administrador
      plano: "trial", // free trial de 7 dias com tudo liberado
      trialAte: new Date(Date.now() + TRIAL_DIAS * 86400000).toISOString(),
    });
    gravarUsers([...lista, novo]);
    gravarSessao({ userId: novo.id, lembrar: true });
    registrarSeguranca("cadastro", mail, `Conta administrativa criada · organização "${d.empresa.trim()}" · ${d.cargo}.`);
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
      await new Promise((r) => setTimeout(r, 450));
      const h = await hashSenha(atual, usuario.salt);
      if (h !== usuario.hash) return "A senha atual não confere.";
      const salt = uid();
      const hash = await hashSenha(nova, salt);
      const novo = { ...usuario, salt, hash };
      gravarUsers(listarUsuarios().map((x) => (x.id === usuario.id ? novo : x)));
      registrarSeguranca("senha_troca", usuario.email, "Senha alterada pelo próprio usuário.");
      setUsuario(novo);
      return null;
    },
    [usuario]
  );

  /* ativação da assinatura Completa (R$ 149,00/mês) — encerra o trial e libera tudo */
  const ativarPlano = useCallback(() => {
    if (!usuario) return;
    const novo = { ...usuario, plano: "completo" as PlanoConta, planoAtivoEm: new Date().toISOString(), trialAte: undefined };
    gravarUsers(listarUsuarios().map((x) => (x.id === usuario.id ? novo : x)));
    setUsuario(novo);
    registrarSeguranca("admin_acao", usuario.email, `Assinatura Completa ativada (${PRECO_MENSAL}/mês).`);
  }, [usuario]);

  const v = useMemo(
    () => ({ usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha, ativarPlano }),
    [usuario, pronto, entrar, cadastrar, sair, atualizarPerfil, trocarSenha, ativarPlano]
  );

  return <Ctx.Provider value={v}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
}

/* ============ Funções administrativas (painel do administrador da organização) ============ */

export function usuariosDaOrg(orgId: string): Usuario[] {
  return listarUsuarios().filter((u) => u.orgId === orgId);
}

export function adminCriarUsuario(orgId: string, d: { nome: string; email: string; cargo: string; papel: Papel }): { ok: boolean; msg?: string; senhaTemporaria?: string } {
  const mail = d.email.trim().toLowerCase();
  const vEmail = validarEmailCorporativo(mail);
  if (!vEmail.ok) return { ok: false, msg: vEmail.msg };
  const lista = listarUsuarios();
  if (lista.some((x) => x.email === mail)) return { ok: false, msg: "Já existe um usuário com este e-mail." };
  const salt = uid();
  const senhaTemporaria = gerarSenhaTemporaria();
  const id = uid();
  const novo: Usuario = normalizar({
    id,
    orgId,
    nome: d.nome.trim(),
    empresa: lista.find((x) => x.orgId === orgId)?.empresa ?? "",
    email: mail,
    cargo: d.cargo,
    salt,
    hash: undefined as unknown as string,
    papel: d.papel,
  });
  // hash síncrono não é possível; usa fallback determinístico para a senha temporária
  (novo as Usuario).hash = hashFallback(`${salt}::radargrc::${senhaTemporaria}`) + hashFallback(`${senhaTemporaria}`.split("").reverse().join(""));
  gravarUsers([...lista, novo]);
  registrarSeguranca("admin_acao", mail, `Usuário "${d.nome.trim()}" criado (${d.papel}) pelo administrador.`);
  return { ok: true, senhaTemporaria };
}

export function adminToggleBloqueio(orgId: string, userId: string): boolean {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId && x.orgId === orgId);
  if (!u) return false;
  const novo = { ...u, bloqueado: !u.bloqueado };
  gravarUsers(lista.map((x) => (x.id === userId ? novo : x)));
  registrarSeguranca("admin_acao", u.email, novo.bloqueado ? "Conta bloqueada pelo administrador." : "Conta desbloqueada pelo administrador.");
  return novo.bloqueado;
}

export function adminExcluirUsuario(orgId: string, userId: string, solicitanteId: string): { ok: boolean; msg?: string } {
  if (userId === solicitanteId) return { ok: false, msg: "Você não pode excluir a própria conta." };
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId && x.orgId === orgId);
  if (!u) return { ok: false, msg: "Usuário não encontrado." };
  gravarUsers(lista.filter((x) => x.id !== userId));
  registrarSeguranca("admin_acao", u.email, `Conta excluída pelo administrador.`);
  return { ok: true };
}

export function adminRedefinirSenha(orgId: string, userId: string): { ok: boolean; msg?: string; senhaTemporaria?: string } {
  const lista = listarUsuarios();
  const u = lista.find((x) => x.id === userId && x.orgId === orgId);
  if (!u) return { ok: false, msg: "Usuário não encontrado." };
  const salt = uid();
  const senhaTemporaria = gerarSenhaTemporaria();
  const hash = hashFallback(`${salt}::radargrc::${senhaTemporaria}`) + hashFallback(`${senhaTemporaria}`.split("").reverse().join(""));
  const novo = { ...u, salt, hash, bloqueado: false };
  gravarUsers(lista.map((x) => (x.id === userId ? novo : x)));
  registrarSeguranca("admin_acao", u.email, "Senha redefinida pelo administrador (senha temporária emitida).");
  return { ok: true, senhaTemporaria };
}
