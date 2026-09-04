/* =====================================================================
   Camada de proteção do sistema (dissuasão de cópia, inspeção e clonagem)

   Nota técnica honesta: em aplicações que rodam no navegador, nenhum
   esquema impede 100% a visualização do código — o JS sempre é executado
   pelo cliente. Esta camada DESINCENTIVA e REGISTRA tentativas:
   bloqueia atalhos de inspeção/cópia, menu de contexto, seleção de texto,
   "ver código-fonte", salvar/imprimir página, embutimento em iframe,
   detecta DevTools, aplica marca d'água com o e-mail da sessão e envia
   tudo para a trilha de auditoria. A proteção real do código-fonte é
   manter o repositório PRIVADO e publicar apenas o build.
   ===================================================================== */

import { useSyncExternalStore } from "react";

export interface EstadoProtecao {
  ativo: boolean;
  devtools: boolean;
  bloqueios: number;
  iframeDetectado: boolean;
  ultimaTentativa: string | null;
}

let estado: EstadoProtecao = { ativo: false, devtools: false, bloqueios: 0, iframeDetectado: false, ultimaTentativa: null };
const ouvintes = new Set<() => void>();
let iniciado = false;

function publicar(patch: Partial<EstadoProtecao>) {
  estado = { ...estado, ...patch };
  ouvintes.forEach((f) => f());
}

const subscribe = (f: () => void) => {
  ouvintes.add(f);
  return () => {
    ouvintes.delete(f);
  };
};

/** Estado reativo da proteção (usado pelo painel e pelo indicador do topo). */
export function useProtecao(): EstadoProtecao {
  return useSyncExternalStore(subscribe, () => estado);
}

/** Inicia a proteção uma única vez por sessão de aplicativo. */
export function iniciarProtecao(email: string | undefined, onEvento?: (detalhe: string) => void) {
  if (iniciado) return;
  iniciado = true;

  const relatar = (detalhe: string) => {
    publicar({ ultimaTentativa: new Date().toLocaleTimeString("pt-BR") });
    onEvento?.(detalhe);
  };

  /* ---------- 1. anti-iframe (frame-busting) ---------- */
  let iframeDetectado = false;
  if (window.self !== window.top) {
    iframeDetectado = true;
    relatar("Tentativa de embutir o sistema em outro site (iframe) bloqueada.");
    try {
      window.top!.location = window.self.location.href;
    } catch {
      /* origem distinta — o CSP frame-ancestors 'none' já nega no servidor */
    }
  }
  publicar({ ativo: true, iframeDetectado });

  /* ---------- 2. aviso de propriedade no console ---------- */
  try {
    console.log(
      "%c⛔ Radar GRC — sistema proprietário",
      "font-size:15px;font-weight:800;color:#132e26;background:#c9e94f;padding:4px 12px;border-radius:6px"
    );
    console.log(
      "%cInterface e código protegidos contra cópia. Toda tentativa de inspeção, extração ou engenharia reversa é registrada na trilha de auditoria desta sessão.",
      "color:#bd4f26;font-weight:600"
    );
  } catch {
    /* console indisponível */
  }

  const ehCampo = (el: EventTarget | null): boolean => {
    const h = el as HTMLElement | null;
    const tag = h?.tagName?.toLowerCase();
    return tag === "input" || tag === "textarea" || tag === "select" || !!h?.isContentEditable;
  };

  /* ---------- 3. bloqueio de atalhos de inspeção e cópia ---------- */
  const onKey = (e: KeyboardEvent) => {
    const k = e.key.toLowerCase();
    const devtools = e.key === "F12" || (e.ctrlKey && e.shiftKey && ["i", "j", "c", "k"].includes(k));
    const sistema = e.ctrlKey && !e.shiftKey && ["u", "s", "p"].includes(k) && !ehCampo(e.target);
    const copiarTudo = e.ctrlKey && k === "a" && !ehCampo(e.target);
    if (devtools || sistema || copiarTudo) {
      e.preventDefault();
      e.stopPropagation();
      publicar({ bloqueios: estado.bloqueios + 1 });
      const combo = `${e.ctrlKey ? "Ctrl+" : ""}${e.shiftKey ? "Shift+" : ""}${e.key}`;
      relatar(`Atalho bloqueado na sessão de ${email ?? "usuário"}: ${combo} (${devtools ? "ferramentas de inspeção" : sistema ? "cópia de página" : "seleção total"}).`);
    }
  };

  /* ---------- 4. bloqueio de menu de contexto (botão direito) ---------- */
  const onCtx = (e: MouseEvent) => {
    if (!ehCampo(e.target)) {
      e.preventDefault();
      publicar({ bloqueios: estado.bloqueios + 1 });
    }
  };

  /* ---------- 5. detecção de DevTools por geometria da janela ---------- */
  let devtoolsAnterior = false;
  const checarDevtools = () => {
    const aberto = window.outerWidth - window.innerWidth > 170 || window.outerHeight - window.innerHeight > 170;
    if (aberto !== devtoolsAnterior) {
      devtoolsAnterior = aberto;
      publicar({ devtools: aberto });
      if (aberto) relatar(`Ambiente de inspeção (DevTools) detectado na sessão de ${email ?? "usuário"} — monitoramento elevado ativo.`);
    }
  };

  window.addEventListener("keydown", onKey, true);
  window.addEventListener("contextmenu", onCtx, true);
  window.addEventListener("dragstart", (e) => {
    if (!ehCampo(e.target)) e.preventDefault();
  });
  const timer = window.setInterval(checarDevtools, 1200);
  checarDevtools();

  /* o módulo vive pelo tempo da SPA — mantém o timer referenciado */
  void timer;
}
