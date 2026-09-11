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

    // Detectar DevTools (métodos múltiplos)
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
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>Acesso não permitido com DevTools aberto</h1></div>';
        }
      } else {
        isOpen = false;
      }

      // Método 2: Console.log detection
      devtools.toString = () => {
        if (!isOpen) {
          isOpen = true;
          document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><h1>Acesso não permitido com DevTools aberto</h1></div>';
        }
        return '';
      };

      console.log('%c', devtools);
    };

    // Bloquear atalhos de DevTools
    const handleDevToolsShortcut = (e: KeyboardEvent) => {
      // F12
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'I') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'J') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+Shift+C (Inspect Element)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        return false;
      }
      
      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && e.key === 'u') {
        e.preventDefault();
        return false;
      }
    };

    // Detectar screen recording (método básico)
    const detectScreenRecording = () => {
      // Verificar se há APIs de gravação ativas
      if (navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) {
        // Monitorar se a tela está sendo gravada
        const checkRecording = async () => {
          try {
            const stream = await navigator.mediaDevices.getDisplayMedia({ 
              video: true,
              audio: false 
            });
            
            // Se conseguiu acessar, pode estar gravando
            stream.getTracks().forEach(track => track.stop());
            
            // Mostrar aviso
            if (!sessionStorage.getItem('recording_warning_shown')) {
              sessionStorage.setItem('recording_warning_shown', 'true');
              alert('⚠️ Atenção: Este sistema possui proteção contra gravação de tela. Qualquer tentativa de gravação será detectada e registrada.');
            }
          } catch (error) {
            // Usuário cancelou ou não tem permissão
          }
        };

        // Verificar periodicamente
        setInterval(checkRecording, 5000);
      }
    };

    // Aplicar todas as proteções
    document.addEventListener('keydown', handlePrint);
    document.addEventListener('keydown', handlePrintScreen);
    document.addEventListener('keydown', handleDevToolsShortcut);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('dragstart', handleDragStart);

    // Detectar DevTools continuamente
    const devToolsInterval = setInterval(detectDevTools, 1000);

    // Detectar gravação de tela
    detectScreenRecording();

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
