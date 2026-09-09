/* =====================================================================
   Camada de proteção anticópia — site de vendas, login e sistema.
   Desincentiva e registra tentativas de cópia/inspeção/clonagem.
   (Nenhum esquema client-side impede 100% a leitura do código; a proteção
   efetiva é manter o repositório privado e publicar só o build.)
   ===================================================================== */

import { useSyncExternalStore } from "react";

export interface EstadoProtecao {
  ativo: boolean;
  devtools: boolean;
  bloqueios: number;
  iframeDetectado: boolean;
}

let estado: EstadoProtecao = { ativo: false, devtools: false, bloqueios: 0, iframeDetectado: false };
const ouvintes = new Set<() => void>();
let iniciado = false;
const contexto: { email?: string; onEvento?: (d: string) => void } = {};

function publicar(patch: Partial<EstadoProtecao>) {
  estado = { ...estado, ...patch };
  ouvintes.forEach((f) => f());
}

export function useProtecao(): EstadoProtecao {
  return useSyncExternalStore(
    (f) => {
      ouvintes.add(f);
      return () => ouvintes.delete(f);
    },
    () => estado
  );
}

/** Ativa a proteção global (pode ser chamada várias vezes — só instala uma vez). */
export function iniciarProtecao(email?: string, onEvento?: (d: string) => void) {
  contexto.email = email;
  contexto.onEvento = onEvento;

  if (iniciado) {
    publicar({});
    return;
  }
  iniciado = true;

  const quem = () => contexto.email ?? "visitante (site público)";
  const relatar = (detalhe: string) => {
    publicar({ ultimaTentativa: new Date().toLocaleTimeString("pt-BR") } as Partial<EstadoProtecao>);
    contexto.onEvento?.(detalhe);
  };

  /* anti-iframe (frame-busting) */
  let iframeDetectado = false;
  if (window.self !== window.top) {
    iframeDetectado = true;
    relatar("Tentativa de embutir o sistema em outro site (iframe) bloqueada.");
    try {
      window.top!.location = window.self.location.href;
    } catch {
      /* origem distinta — CSP frame-ancestors já nega */
    }
  }
  publicar({ ativo: true, iframeDetectado });

  /* aviso de propriedade no console */
  try {
    console.log("%c⛔ Radar GRC — sistema proprietário", "font-size:15px;font-weight:800;color:#132e26;background:#c9e94f;padding:4px 12px;border-radius:6px");
    console.log("%cInterface protegida contra cópia. Tentativas de inspeção e extração são registradas na trilha de auditoria.", "color:#bd4f26;font-weight:600");
  } catch {
    /* console indisponível */
  }

  const ehCampo = (el: EventTarget | null): boolean => {
    const h = el as HTMLElement | null;
    const tag = h?.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || !!h?.isContentEditable;
  };

  /* bloqueio de atalhos de inspeção e cópia */
  window.addEventListener(
    "keydown",
    (e) => {
      const k = e.key.toLowerCase();
      const devtools = e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i", "j", "c", "k"].includes(k));
      const sistema = e.ctrlKey && !e.shiftKey && ["u", "s", "p"].includes(k) && !ehCampo(e.target);
      const copiar = e.ctrlKey && !e.shiftKey && ["c", "x", "a"].includes(k) && !ehCampo(e.target);
      if (devtools || sistema || copiar) {
        e.preventDefault();
        e.stopPropagation();
        publicar({ bloqueios: estado.bloqueios + 1 });
        relatar(`Atalho bloqueado — ${quem()}: ${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key} (${devtools ? "inspeção" : sistema ? "cópia de página" : "copiar/recortar"}).`);
      }
    },
    true
  );

  /* bloqueio de menu de contexto */
  window.addEventListener(
    "contextmenu",
    (e) => {
      if (!ehCampo(e.target)) {
        e.preventDefault();
        publicar({ bloqueios: estado.bloqueios + 1 });
      }
    },
    true
  );

  /* bloqueio de arrasto */
  window.addEventListener("dragstart", (e) => {
    if (!ehCampo(e.target)) e.preventDefault();
  });

  /* detecção de DevTools por geometria */
  let devtoolsAnterior = false;
  setInterval(() => {
    const aberto = window.outerWidth - window.innerWidth > 170 || window.outerHeight - window.innerHeight > 170;
    if (aberto !== devtoolsAnterior) {
      devtoolsAnterior = aberto;
      publicar({ devtools: aberto });
      if (aberto) relatar(`Ambiente de inspeção (DevTools) detectado — ${quem()} — monitoramento elevado.`);
    }
  }, 1200);
}
