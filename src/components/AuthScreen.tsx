import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { DEMO_EMAIL, DEMO_SENHA, useAuth, validarEmailCorporativo } from "../auth";
import { Ic, MedidorSenha } from "./ui";

/* Indicador ao vivo: domínio corporativo vs. e-mail pessoal */
function IndicadorDominio({ email }: { email: string }) {
  const v = email.includes("@") ? validarEmailCorporativo(email) : null;
  if (!v) return null;
  return v.ok ? (
    <p className="anim-pop mt-1 flex items-center gap-1.5 text-[11px] font-bold text-moss">
      <Ic name="check" size={11} sw={3} /> Domínio corporativo verificado{v.dominio ? ` (${v.dominio})` : ""}
    </p>
  ) : (
    <p className="anim-pop mt-1 flex items-center gap-1.5 text-[11px] font-bold text-rust">
      <Ic name="x" size={11} sw={3} /> Somente e-mail corporativo — pessoal/gratuito não é aceito
    </p>
  );
}

const EVENTOS = [
  { t: "Folha de pagamento", d: "Art. 7º, II · risco 6 · 680 titulares" },
  { t: "Telemedicina interna", d: "Art. 11, II, “f” · risco 15 · RIPD emitido" },
  { t: "CRM e prospecção", d: "Art. 7º, IX · risco 9 · 12.400 leads" },
  { t: "Portaria e CFTV", d: "Art. 7º, II · risco 4 · retenção 30 dias" },
  { t: "Recrutamento e seleção", d: "Art. 7º, I · risco 6 · 214 currículos" },
  { t: "Acesso aos sistemas (logs)", d: "Art. 7º, VI · risco 8 · retenção 90 dias" },
  { t: "Venda on-line", d: "Art. 7º, V · risco 10 · antifraude ativo" },
];

function FeedAoVivo() {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 2600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="rounded-lg border border-cream/12 bg-pine-deep/70 p-4">
      <p className="mb-3 flex items-center gap-2 text-[10px] font-bold tracking-[0.2em] text-lime uppercase">
        <span className="pulse-dot size-1.5 rounded-full bg-lime" /> Registro de operações · ao vivo
      </p>
      <ul className="space-y-2">
        {Array.from({ length: 4 }, (_, k) => EVENTOS[(tick + k) % EVENTOS.length]).map((e, k) => (
          <li
            key={`${tick}-${k}`}
            className={`flex items-center justify-between gap-3 rounded-md border border-pine-line/70 bg-pine px-3 py-2 transition-opacity ${k === 0 ? "anim-slide-left" : ""} ${k > 1 ? "opacity-50" : ""}`}
          >
            <span>
              <span className="block text-[12.5px] font-bold text-cream">{e.t}</span>
              <span className="block text-[10.5px] text-cream/45">{e.d}</span>
            </span>
            <Ic name="check" size={13} className="shrink-0 text-lime" sw={2.4} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ---------------- inputs ---------------- */

function CampoAuth({ label, children, erro }: { label: string; children: React.ReactNode; erro?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10.5px] font-bold tracking-[0.1em] text-ink-soft uppercase">{label}</span>
      {children}
      {erro && <p className="anim-pop mt-1 text-[11px] font-semibold text-rust">{erro}</p>}
    </label>
  );
}

function InputAuth({ valor, onChange, placeholder, type = "text", erro, icone, sufixo }: { valor: string; onChange: (v: string) => void; placeholder: string; type?: string; erro?: boolean; icone: string; sufixo?: React.ReactNode }) {
  return (
    <div className="relative">
      <Ic name={icone} size={15} className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-faint" />
      <input
        type={type}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full rounded-md border bg-cream py-2.5 pr-10 pl-9 text-[13.5px] text-ink transition outline-none placeholder:text-ink-faint ${
          erro ? "border-rust ring-2 ring-rust/20" : "border-sand focus:border-moss focus:ring-2 focus:ring-moss/25"
        } ${sufixo ? "pr-11" : ""}`}
      />
      {sufixo && <span className="absolute top-1/2 right-2 -translate-y-1/2">{sufixo}</span>}
    </div>
  );
}

function OlhoSenha({ ver, onToggle }: { ver: boolean; onToggle: () => void }) {
  return (
    <button type="button" onClick={onToggle} className="rounded p-1 text-ink-faint transition hover:text-moss" aria-label={ver ? "Ocultar senha" : "Mostrar senha"}>
      <Ic name={ver ? "eyeOff" : "eye"} size={16} />
    </button>
  );
}

function ErroGeral({ msg }: { msg: string }) {
  return (
    <div className="anim-pop flex items-start gap-2 rounded-md border border-rust/50 bg-rust-soft/50 px-3 py-2.5 text-[12px] font-semibold text-rust">
      <Ic name="alert" size={14} className="mt-0.5 shrink-0" sw={2.2} />
      {msg}
    </div>
  );
}

function Spinner() {
  return <span className="inline-block size-4 animate-spin rounded-full border-2 border-lime/30 border-t-lime" />;
}

/* ---------------- formulário de login ---------------- */

function FormLogin() {
  const { entrar } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [ver, setVer] = useState(false);
  const [lembrar, setLembrar] = useState(true);
  const [erros, setErros] = useState<{ email?: string; senha?: string }>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof erros = {};
    const vEmail = validarEmailCorporativo(email);
    if (!vEmail.ok) errs.email = vEmail.msg;
    if (!senha) errs.senha = "Informe sua senha.";
    setErros(errs);
    if (Object.keys(errs).length) return;
    setCarregando(true);
    setErroGeral(null);
    const r = await entrar(email, senha, lembrar);
    setCarregando(false);
    if (r) setErroGeral(r);
  };

  return (
    <form onSubmit={enviar} className="anim-rise space-y-4">
      {erroGeral && <ErroGeral msg={erroGeral} />}
      {info && (
        <div className="anim-pop flex items-start gap-2 rounded-md border border-moss/40 bg-moss/10 px-3 py-2.5 text-[12px] leading-snug text-ink-soft">
          <Ic name="shield" size={14} className="mt-0.5 shrink-0 text-moss" sw={2} />
          {info}
        </div>
      )}
      <CampoAuth label="E-mail corporativo" erro={erros.email}>
        <InputAuth valor={email} onChange={setEmail} placeholder="voce@suaempresa.com.br" type="email" icone="mail" erro={!!erros.email} />
        <IndicadorDominio email={email} />
      </CampoAuth>
      <CampoAuth label="Senha" erro={erros.senha}>
        <InputAuth valor={senha} onChange={setSenha} placeholder="••••••••" type={ver ? "text" : "password"} icone="shield" erro={!!erros.senha} sufixo={<OlhoSenha ver={ver} onToggle={() => setVer(!ver)} />} />
      </CampoAuth>
      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={() => setLembrar(!lembrar)} className="flex cursor-pointer items-center gap-2 text-[12px] font-semibold text-ink-soft">
          <span className={`grid size-4.5 place-items-center rounded-sm border transition ${lembrar ? "border-pine bg-pine text-lime" : "border-sand bg-cream"}`}>
            {lembrar && <Ic name="check" size={10} sw={3} />}
          </span>
          Manter conectado
        </button>
        <button
          type="button"
          onClick={() => setInfo("Nesta edição local, redefina a senha em “Minha conta” após entrar. A edição em nuvem envia um link de redefinição por e-mail.")}
          className="text-[12px] font-bold text-moss transition hover:text-pine"
        >
          Esqueci a senha
        </button>
      </div>
      <button
        type="submit"
        disabled={carregando}
        className="group flex w-full items-center justify-center gap-2 rounded-md bg-pine py-2.5 text-[13.5px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.99] disabled:opacity-70"
      >
        {carregando ? (<><Spinner /> Autenticando…</>) : (<>Entrar no painel <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" /></>)}
      </button>
    </form>
  );
}

/* ---------------- formulário de cadastro ---------------- */

function FormCadastro() {
  const { cadastrar } = useAuth();
  const [nome, setNome] = useState("");
  const [empresa, setEmpresa] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [ver, setVer] = useState(false);
  const [aceite, setAceite] = useState(false);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  const enviar = async (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (nome.trim().length < 3) errs.nome = "Informe seu nome completo.";
    const vEmail = validarEmailCorporativo(email);
    if (!vEmail.ok) errs.email = vEmail.msg;
    if (senha.length < 8) errs.senha = "A senha precisa de pelo menos 8 caracteres.";
    if (confirma !== senha || !confirma) errs.confirma = "A confirmação não coincide com a senha.";
    if (!aceite) errs.aceite = "É necessário aceitar para continuar.";
    setErros(errs);
    if (Object.keys(errs).length) return;
    setCarregando(true);
    setErroGeral(null);
    const r = await cadastrar({ nome, empresa, email, senha });
    setCarregando(false);
    if (r) setErroGeral(r);
  };

  return (
    <form onSubmit={enviar} className="anim-rise space-y-3.5">
      {erroGeral && <ErroGeral msg={erroGeral} />}
      <CampoAuth label="Nome completo" erro={erros.nome}>
        <InputAuth valor={nome} onChange={setNome} placeholder="Maria da Silva" icone="user" erro={!!erros.nome} />
      </CampoAuth>
      <div className="grid gap-3.5 sm:grid-cols-2">
        <CampoAuth label="Organização" erro={erros.empresa}>
          <InputAuth valor={empresa} onChange={setEmpresa} placeholder="Empresa Ltda. (opcional)" icone="grid" />
        </CampoAuth>
        <CampoAuth label="E-mail corporativo" erro={erros.email}>
          <InputAuth valor={email} onChange={setEmail} placeholder="voce@suaempresa.com.br" type="email" icone="mail" erro={!!erros.email} />
          <IndicadorDominio email={email} />
        </CampoAuth>
      </div>
      <div>
        <CampoAuth label="Senha" erro={erros.senha}>
          <InputAuth valor={senha} onChange={setSenha} placeholder="Mínimo 8 caracteres" type={ver ? "text" : "password"} icone="shield" erro={!!erros.senha} sufixo={<OlhoSenha ver={ver} onToggle={() => setVer(!ver)} />} />
        </CampoAuth>
        <MedidorSenha senha={senha} />
      </div>
      <CampoAuth label="Confirmar senha" erro={erros.confirma}>
        <InputAuth valor={confirma} onChange={setConfirma} placeholder="Repita a senha" type={ver ? "text" : "password"} icone="shield" erro={!!erros.confirma} />
      </CampoAuth>
      <div>
        <button type="button" onClick={() => setAceite(!aceite)} className="flex cursor-pointer items-start gap-2.5 text-left">
          <span className={`mt-0.5 grid size-4.5 shrink-0 place-items-center rounded-sm border transition ${aceite ? "border-pine bg-pine text-lime" : erros.aceite ? "border-rust bg-rust-soft/40" : "border-sand bg-cream"}`}>
            {aceite && <Ic name="check" size={10} sw={3} />}
          </span>
          <span className="text-[11.5px] leading-snug text-ink-soft">
            Declaro que li e aceito a <strong className="text-ink">Política de Privacidade</strong> e autorizo o tratamento dos meus dados para gestão de acesso, nos termos da <strong className="text-ink">LGPD (Lei nº 13.709/2018)</strong>.
          </span>
        </button>
        {erros.aceite && <p className="anim-pop mt-1 pl-7 text-[11px] font-semibold text-rust">{erros.aceite}</p>}
      </div>
      <button
        type="submit"
        disabled={carregando}
        className="group flex w-full items-center justify-center gap-2 rounded-md bg-pine py-2.5 text-[13.5px] font-bold text-lime shadow-sm transition hover:bg-pine-deep active:scale-[0.99] disabled:opacity-70"
      >
        {carregando ? (<><Spinner /> Criando conta…</>) : (<>Criar conta e entrar <Ic name="arrow" size={14} className="transition-transform group-hover:translate-x-0.5" /></>)}
      </button>
    </form>
  );
}

/* ---------------- tela ---------------- */

export default function AuthScreen() {
  const { entrar } = useAuth();
  const [modo, setModo] = useState<"login" | "cadastro">("login");
  const [demoCarregando, setDemoCarregando] = useState(false);

  const demo = async () => {
    setDemoCarregando(true);
    await entrar(DEMO_EMAIL, DEMO_SENHA, false);
    setDemoCarregando(false);
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.08fr_1fr]">
      {/* painel institucional */}
      <div className="rail-texture relative hidden flex-col justify-between overflow-hidden bg-pine p-10 lg:flex">
        <div className="pointer-events-none absolute -top-32 -right-32 size-[440px] rounded-full border border-lime/10" />
        <div className="pointer-events-none absolute -top-18 -right-18 size-[300px] rounded-full border border-lime/15" />
        <div className="pointer-events-none absolute -top-7 -right-7 size-[190px] rounded-full border border-lime/25">
          <div className="radar-sweep absolute inset-0 rounded-full" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.28), transparent 70deg)" }} />
        </div>

        <div className="relative flex items-center gap-3">
          <span className="relative grid size-10 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine-deep">
            <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
            <Ic name="radar" size={21} className="relative text-lime" sw={1.9} />
          </span>
          <span>
            <span className="font-display block text-[17px] leading-none font-extrabold tracking-tight text-cream">Radar<span className="text-lime">LGPD</span></span>
            <span className="mt-1 block text-[9.5px] font-bold tracking-[0.18em] text-cream/40 uppercase">Mapeamento com IA</span>
          </span>
        </div>

        <div className="relative max-w-lg">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-3 py-1 text-[10px] font-bold tracking-[0.18em] text-lime uppercase">
            <span className="pulse-dot inline-block size-1.5 rounded-full bg-lime" /> Lei nº 13.709/2018 · conformidade contínua
          </p>
          <h1 className="font-display text-[46px] leading-[1.02] font-extrabold tracking-tight text-cream">
            Todo dado pessoal, <span className="text-lime">no radar.</span>
            <span className="mt-2 block text-[24px] font-bold text-cream/70">Antes que vire autuação.</span>
          </h1>
          <p className="mt-4 max-w-md text-[13.5px] leading-relaxed text-cream/65">
            Classifique atividades de tratamento com IA, fundamente bases legais dos arts. 7º e 11 e mantenha o RoPA do art. 37 sempre pronto para auditoria da ANPD.
          </p>
          <div className="mt-7">
            <FeedAoVivo />
          </div>
        </div>

        <div className="relative">
          <div className="grid grid-cols-3 gap-3">
            {[
              { n: "18", s: "", l: "hipóteses de licitude (arts. 7º e 11)" },
              { n: "15", s: "dias", l: "prazo de resposta ao titular (art. 19)" },
              { n: "50", s: "mi", l: "teto de multa em R$ (art. 52, § 1º)" },
            ].map((x) => (
              <div key={x.l} className="rounded-lg border border-cream/12 bg-pine-deep/60 px-3.5 py-3 transition-colors hover:border-lime/30">
                <p className="font-display text-[24px] leading-none font-extrabold text-lime">
                  {x.n}
                  {x.s && <span className="ml-0.5 text-[12px] text-lime/70">{x.s}</span>}
                </p>
                <p className="mt-1.5 text-[10px] leading-snug text-cream/55">{x.l}</p>
              </div>
            ))}
          </div>
          <p className="mt-5 border-l-2 border-lime pl-3 text-[11.5px] leading-snug text-cream/50 italic">
            “O controlador deverá manter registro das operações de tratamento de dados pessoais que realizar.” — <span className="text-cream/70 not-italic">Art. 37</span>
          </p>
        </div>
      </div>

      {/* painel de acesso */}
      <div className="flex flex-col justify-center overflow-y-auto bg-paper px-5 py-10 sm:px-12">
        <div className="mx-auto w-full max-w-[430px]">
          {/* marca (mobile) */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="relative grid size-10 place-items-center overflow-hidden rounded-lg border border-pine-line bg-pine">
              <span className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
              <Ic name="radar" size={21} className="relative text-lime" sw={1.9} />
            </span>
            <span>
              <span className="font-display block text-[17px] leading-none font-extrabold tracking-tight text-ink">Radar<span className="text-moss">LGPD</span></span>
              <span className="mt-1 block text-[9.5px] font-bold tracking-[0.18em] text-ink-faint uppercase">Mapeamento com IA</span>
            </span>
          </div>

          <p className="mb-1 flex items-center gap-2 text-[10.5px] font-bold tracking-[0.16em] text-moss uppercase">
            <span className="inline-block h-px w-6 bg-moss" />
            {modo === "login" ? "Acesso restrito · controle do art. 46" : "Novo por aqui?"}
          </p>
          <h2 className="font-display text-[28px] leading-tight font-extrabold tracking-tight text-ink">
            {modo === "login" ? "Entre no seu radar" : "Crie sua conta"}
          </h2>
          <p className="mt-1.5 text-[13px] text-ink-soft">
            {modo === "login" ? "Acesse o mapeamento de dados da sua organização." : "Comece a mapear suas atividades de tratamento em minutos."}
          </p>

          {/* alternância */}
          <div className="relative mt-6 mb-6 grid grid-cols-2 rounded-lg border border-sand bg-paper-deep p-1">
            <span
              className="absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-md bg-pine shadow-sm transition-transform duration-300 ease-out"
              style={{ transform: modo === "cadastro" ? "translateX(calc(100% + 0.25rem))" : "translateX(0)" }}
            />
            <button type="button" onClick={() => setModo("login")} className={`relative z-10 rounded-md py-2 text-[13px] font-bold transition-colors ${modo === "login" ? "text-lime" : "text-ink-soft hover:text-ink"}`}>
              Entrar
            </button>
            <button type="button" onClick={() => setModo("cadastro")} className={`relative z-10 rounded-md py-2 text-[13px] font-bold transition-colors ${modo === "cadastro" ? "text-lime" : "text-ink-soft hover:text-ink"}`}>
              Criar conta
            </button>
          </div>

          {modo === "login" ? <FormLogin /> : <FormCadastro />}

          {/* conta demo */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-moss/50 bg-moss/8 px-4 py-3">
            <div>
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-ink">
                <Ic name="spark" size={12} className="text-moss" sw={2.4} /> Avaliando o produto?
              </p>
              <p className="mt-0.5 text-[11px] text-ink-soft">
                {DEMO_EMAIL} · <span className="font-mono">{DEMO_SENHA}</span>
              </p>
            </div>
            <button
              onClick={demo}
              disabled={demoCarregando}
              className="inline-flex items-center gap-2 rounded-md border border-moss px-3.5 py-2 text-[12px] font-bold text-moss transition hover:bg-moss hover:text-cream active:scale-[0.98] disabled:opacity-70"
            >
              {demoCarregando ? <Spinner /> : <Ic name="arrow" size={13} />} Explorar demo
            </button>
          </div>

          <p className="mt-6 text-center text-[10.5px] leading-relaxed text-ink-faint">
            Ambiente de demonstração — contas e registros ficam neste navegador; senhas são armazenadas como hash (SHA-256 + salt), nunca em texto puro.
          </p>
        </div>
      </div>
    </div>
  );
}
