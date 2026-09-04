import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useStore } from "../store";

/* ================= Ícones (SVG inline, traço 1.8) ================= */

const PATHS: Record<string, ReactNode> = {
  radar: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 12 18.5 5.8" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" stroke="none" />
    </>
  ),
  grid: (
    <>
      <rect x="3.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="3.5" width="7" height="7" rx="1" />
      <rect x="3.5" y="13.5" width="7" height="7" rx="1" />
      <rect x="13.5" y="13.5" width="7" height="7" rx="1" />
    </>
  ),
  spark: (
    <>
      <path d="M12 3.5c.6 3.9 2.6 5.9 6.5 6.5-3.9.6-5.9 2.6-6.5 6.5-.6-3.9-2.6-5.9-6.5-6.5 3.9-.6 5.9-2.6 6.5-6.5Z" />
      <path d="M18.8 15.5c.3 1.8 1.2 2.7 3 3-1.8.3-2.7 1.2-3 3-.3-1.8-1.2-2.7-3-3 1.8-.3 2.7-1.2 3-3Z" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3 9 5-9 5-9-5 9-5Z" />
      <path d="m3.5 12.5 8.5 4.7 8.5-4.7" />
      <path d="m3.5 16.5 8.5 4.7 8.5-4.7" />
    </>
  ),
  matrix: (
    <>
      <path d="M4 20V4" />
      <path d="M4 20h16" />
      <circle cx="10" cy="14" r="1.4" />
      <circle cx="15" cy="9" r="1.4" />
      <circle cx="18" cy="6" r="1.4" />
    </>
  ),
  scale: (
    <>
      <path d="M12 4v16M8 20h8" />
      <path d="M5 7h14" />
      <path d="m6.5 7-2.8 6a3 3 0 0 0 5.6 0L6.5 7Z" />
      <path d="m17.5 7-2.8 6a3 3 0 0 0 5.6 0l-2.8-6Z" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h8l4 4v14H6V3Z" />
      <path d="M14 3v4h4" />
      <path d="M9 12h6M9 15.5h6" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="m6 6 12 12M18 6 6 18" />,
  check: <path d="m4.5 12.5 5 5L19.5 7" />,
  alert: (
    <>
      <path d="M12 3.5 22 20H2L12 3.5Z" />
      <path d="M12 10v4.5" />
      <circle cx="12" cy="17.3" r="0.7" fill="currentColor" stroke="none" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),
  download: (
    <>
      <path d="M12 4v11" />
      <path d="m7 10.5 5 5 5-5" />
      <path d="M4.5 20h15" />
    </>
  ),
  printer: (
    <>
      <path d="M7 8V3.5h10V8" />
      <rect x="4" y="8" width="16" height="8" rx="1.5" />
      <path d="M7 13.5h10v7H7v-7Z" />
    </>
  ),
  trash: (
    <>
      <path d="M4.5 6.5h15" />
      <path d="M9 6V4h6v2" />
      <path d="M6.5 6.5 7.5 21h9l1-14.5" />
      <path d="M10 10.5v6M14 10.5v6" />
    </>
  ),
  pencil: (
    <>
      <path d="m4 20 1-4L16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1Z" />
      <path d="m14.5 6.5 3 3" />
    </>
  ),
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.2l3.4 2" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="3.8" />
      <path d="M4.5 20.5c1.2-3.6 4-5.4 7.5-5.4s6.3 1.8 7.5 5.4" />
    </>
  ),
  send: <path d="m4 11 16-7-5.5 16-2.5-6.5L4 11Z" />,
  wand: (
    <>
      <path d="m5 19 9.5-9.5" />
      <path d="M15.5 3.8c.3 1.7 1.2 2.6 2.9 2.9-1.7.3-2.6 1.2-2.9 2.9-.3-1.7-1.2-2.6-2.9-2.9 1.7-.3 2.6-1.2 2.9-2.9Z" />
      <path d="m5.5 4.5 1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Z" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.6 2.4 3.9 5.1 3.9 8.5S14.6 18.1 12 20.5C9.4 18.1 8.1 15.4 8.1 12S9.4 5.9 12 3.5Z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3 20 6v6c0 4.8-3.2 7.9-8 9.5C7.2 19.9 4 16.8 4 12V6l8-3Z" />
      <path d="m8.7 12 2.3 2.3 4.3-4.6" />
    </>
  ),
  bell: (
    <>
      <path d="M6 9.5a6 6 0 0 1 12 0c0 4 1.5 5.5 1.5 5.5h-15S6 13.5 6 9.5Z" />
      <path d="M10 18.5a2.2 2.2 0 0 0 4 0" />
    </>
  ),
  filter: <path d="M4 5.5h16l-6.2 7.4v5.6L10.2 20v-7L4 5.5Z" />,
  brain: (
    <>
      <path d="M9.5 4A2.7 2.7 0 0 0 6.8 6.8 3.2 3.2 0 0 0 4 10c0 .9.3 1.7.9 2.3A3.2 3.2 0 0 0 6 18c.3 1.2 1.4 2 2.6 2 .8 0 1.5-.3 2-.8V6.6a2.7 2.7 0 0 0-1.1-2.6Z" />
      <path d="M14.5 4a2.7 2.7 0 0 1 2.7 2.8A3.2 3.2 0 0 1 20 10c0 .9-.3 1.7-.9 2.3A3.2 3.2 0 0 1 18 18c-.3 1.2-1.4 2-2.6 2-.8 0-1.5-.3-2-.8V6.6A2.7 2.7 0 0 1 14.5 4Z" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  refresh: (
    <>
      <path d="M20 12a8 8 0 1 1-2.3-5.6" />
      <path d="M20 3.5V7h-3.5" />
    </>
  ),
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  eyeOff: (
    <>
      <path d="M4.5 4.5 19.5 19.5" />
      <path d="M9.9 5.9A9.6 9.6 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17.6 17.6 0 0 1-3.2 3.9M6.1 8A16.8 16.8 0 0 0 2.5 12S6 18.5 12 18.5c1.1 0 2.1-.2 3-.6" />
      <path d="M9.9 9.9a2.8 2.8 0 0 0 4 4" />
    </>
  ),
  chevronDown: <path d="m6 9 6 6 6-6" />,
  logout: (
    <>
      <path d="M9.5 4H5.5A1.5 1.5 0 0 0 4 5.5v13A1.5 1.5 0 0 0 5.5 20h4" />
      <path d="m15 8 4 4-4 4" />
      <path d="M19 12H9.5" />
    </>
  ),
  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 7.5 8.5 6 8.5-6" />
    </>
  ),
};

export function Ic({ name, size = 18, className = "", sw = 1.8 }: { name: keyof typeof PATHS | string; size?: number; className?: string; sw?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={sw}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {PATHS[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  );
}

/* ================= Scroll reveal ================= */

export function Reveal({ children, delay = 0, className = "" }: { children: ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            el.classList.add("reveal-in");
            io.disconnect();
          }
        });
      },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} className={`reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ================= Contador animado ================= */

export function useCountUp(target: number, dur = 900) {
  const [v, setV] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const from = prev.current;
    prev.current = target;
    const t0 = performance.now();
    let raf: number;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - k, 3);
      setV(Math.round(from + (target - from) * e));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, dur]);
  return v;
}

/* ================= Anel de progresso ================= */

export function Ring({ value, size = 148, stroke = 11, cor = "var(--color-moss)" }: { value: number; size?: number; stroke?: number; cor?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const [off, setOff] = useState(c);
  useEffect(() => {
    const t = setTimeout(() => setOff(c - (c * Math.min(100, value)) / 100), 60);
    return () => clearTimeout(t);
  }, [value, c]);
  return (
    <svg width={size} height={size} className="block">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(24,38,32,0.1)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={cor}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={off}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22,1,0.36,1)" }}
      />
    </svg>
  );
}

/* ================= Modal ================= */

export function Modal({ aberto, onFechar, titulo, children, largura = "max-w-2xl" }: { aberto: boolean; onFechar: () => void; titulo: ReactNode; children: ReactNode; largura?: string }) {
  useEffect(() => {
    if (!aberto) return;
    const h = (e: KeyboardEvent) => e.key === "Escape" && onFechar();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [aberto, onFechar]);
  if (!aberto) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-pine-deep/55 p-4 pt-10 backdrop-blur-[2px]" onMouseDown={onFechar}>
      <div className={`anim-pop w-full ${largura} rounded-lg border border-sand bg-cream shadow-[0_24px_60px_-12px_rgba(12,31,24,0.45)]`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-sand/70 px-5 py-3.5">
          <h3 className="font-display text-lg font-bold text-ink">{titulo}</h3>
          <button onClick={onFechar} className="rounded-md p-1.5 text-ink-soft transition hover:bg-paper-deep hover:text-ink" aria-label="Fechar">
            <Ic name="x" size={16} />
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}

/* ================= Chips selecionáveis ================= */

export function ChipToggle({ ativo, onClick, children, sensivel = false }: { ativo: boolean; onClick: () => void; children: ReactNode; sensivel?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-left text-[12.5px] leading-tight transition-all duration-150 ${
        ativo
          ? sensivel
            ? "border-rust bg-rust text-cream shadow-sm"
            : "border-pine bg-pine text-lime shadow-sm"
          : sensivel
            ? "border-rust/40 bg-rust-soft/30 text-rust hover:border-rust/70 hover:bg-rust-soft/60"
            : "border-sand bg-cream text-ink-soft hover:border-moss hover:text-ink"
      }`}
    >
      <span className={`grid size-3.5 shrink-0 place-items-center rounded-sm border ${ativo ? "border-transparent bg-lime text-pine" : sensivel ? "border-rust/50" : "border-sand"}`}>
        {ativo && <Ic name="check" size={9} sw={3} />}
      </span>
      {children}
    </button>
  );
}

/* ================= Rótulos de formulário ================= */

export function Campo({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-baseline justify-between text-[11px] font-bold tracking-[0.08em] text-ink-soft uppercase">
        {label}
        {hint && <em className="font-normal normal-case tracking-normal text-ink-faint not-italic">{hint}</em>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-md border border-sand bg-cream px-3 py-2 text-[13.5px] text-ink placeholder:text-ink-faint outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/25";

/* ================= Toasts ================= */

export function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="pointer-events-none fixed right-5 bottom-5 z-[60] flex w-80 flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast-in pointer-events-auto flex items-start gap-2.5 rounded-lg border px-3.5 py-3 shadow-lg ${
            t.tom === "ia" ? "border-pine-line bg-pine text-lime" : t.tom === "warn" ? "border-amber/50 bg-amber-soft text-ink" : "border-moss/40 bg-cream text-ink"
          }`}
        >
          <span className={`mt-0.5 ${t.tom === "ia" ? "text-lime" : t.tom === "warn" ? "text-amber" : "text-moss"}`}>
            <Ic name={t.tom === "ia" ? "spark" : t.tom === "warn" ? "alert" : "check"} size={15} sw={2.2} />
          </span>
          <p className="text-[12.5px] leading-snug font-medium">{t.texto}</p>
        </div>
      ))}
    </div>
  );
}

/* ================= Cabeçalho de página ================= */

export function Cabecalho({ kicker, titulo, desc, acao }: { kicker: string; titulo: string; desc?: string; acao?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="mb-1 flex items-center gap-2 text-[11px] font-bold tracking-[0.16em] text-moss uppercase">
          <span className="inline-block h-px w-6 bg-moss" />
          {kicker}
        </p>
        <h1 className="font-display text-[26px] leading-tight font-extrabold tracking-tight text-ink sm:text-[32px]">{titulo}</h1>
        {desc && <p className="mt-1.5 max-w-2xl text-[13.5px] leading-relaxed text-ink-soft">{desc}</p>}
      </div>
      {acao}
    </div>
  );
}

/* ================= Força de senha ================= */

export function calcularForca(s: string): { score: number; label: string; cor: string } {
  let p = 0;
  if (s.length >= 8) p++;
  if (/[a-z]/.test(s) && /[A-Z]/.test(s)) p++;
  if (/\d/.test(s)) p++;
  if (/[^A-Za-z0-9]/.test(s)) p++;
  const labels = ["Muito fraca", "Fraca", "Razoável", "Forte", "Excelente"];
  const cores = ["var(--color-rust)", "var(--color-rust)", "var(--color-amber)", "var(--color-moss)", "var(--color-moss)"];
  return { score: p, label: labels[p], cor: cores[p] };
}

export function MedidorSenha({ senha }: { senha: string }) {
  const f = calcularForca(senha);
  return (
    <div className="mt-1.5">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 flex-1 rounded-full bg-paper-deep transition-colors duration-300"
            style={senha && i < f.score ? { background: f.cor } : undefined}
          />
        ))}
      </div>
      {senha && (
        <p className="mt-1 text-[10.5px] font-bold tracking-wide uppercase" style={{ color: f.cor }}>
          {f.label} · mínimo de 8 caracteres
        </p>
      )}
    </div>
  );
}
