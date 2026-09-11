import { useEffect } from 'react';

export function useScreenProtection() {
  useEffect(() => {
    // Bloquear impressão (Ctrl+P, Cmd+P)
    const handlePrint = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        e.stopPropagation();
        alert('Impressão não permitida neste sistema.');
        return false;
      }
    };

    // Bloquear Print Screen
    const handlePrintScreen = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen') {
        e.preventDefault();
        alert('Captura de tela não permitida neste sistema.');
        return false;
      }
    };

    // Bloquear clique direito
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Bloquear seleção de texto
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Bloquear arrastar imagens
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    // Detectar DevTools (apenas mostrar aviso, não bloquear)
    const detectDevTools = () => {
      const devtools = /./;
      let isOpen = false;
      
      // Método 1: Verificar tamanho da janela
      const threshold = 160;
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;
      
      if (widthThreshold || heightThreshold) {
        if (!isOpen) {
          isOpen = true;
          // Apenas mostrar aviso no console, não bloquear
          console.warn('⚠️ DevTools detectado - Este sistema possui proteções de segurança');
        }
      } else {
        isOpen = false;
      }

      // Método 2: Console.log detection (apenas aviso)
      devtools.toString = () => {
        if (!isOpen) {
          isOpen = true;
          console.warn('⚠️ DevTools detectado - Este sistema possui proteções de segurança');
        }
        return '';
      };

      console.log('%c', devtools);
    };

    // Atalhos de DevTools - apenas detectar, não bloquear
    const handleDevToolsShortcut = (e: KeyboardEvent) => {
      // Apenas detectar, não bloquear
      if (e.key === 'F12' || 
          ((e.ctrlKey || e.metaKey) && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
          ((e.ctrlKey || e.metaKey) && e.key === 'u')) {
        console.warn('⚠️ Atalho de DevTools detectado - Este sistema possui proteções de segurança');
      }
    };

    // Removido - detecção de gravação pode causar problemas

    // Aplicar todas as proteções
    document.addEventListener('keydown', handlePrint);
    document.addEventListener('keydown', handlePrintScreen);
    document.addEventListener('keydown', handleDevToolsShortcut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Detectar DevTools continuamente
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Cleanup
    return () => {
      document.removeEventListener('keydown', handlePrint);
      document.removeEventListener('keydown', handlePrintScreen);
      document.removeEventListener('keydown', handleDevToolsShortcut);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('dragstart', handleDragStart);
      clearInterval(devToolsInterval);
    };
  }, []);
}
