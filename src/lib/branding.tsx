import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface BrandingConfig {
  nomePlataforma: string;
  nomeEmpresa: string;
  logoUrl: string;
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  suporteEmail: string;
  suporteTelefone: string;
  siteUrl: string;
  rodape: string;
  whiteLabelLevel: 'basico' | 'profissional' | 'enterprise';
}

const DEFAULT_BRANDING: BrandingConfig = {
  nomePlataforma: 'Radar GRC',
  nomeEmpresa: 'Radar Co.',
  logoUrl: '',
  corPrimaria: '#132e26',
  corSecundaria: '#c9e94f',
  corFundo: '#f2efe4',
  corTexto: '#182620',
  suporteEmail: 'suporte@radargrc.com',
  suporteTelefone: '+55 11 99999-9999',
  siteUrl: 'https://radargrc.com',
  rodape: '© 2026 Radar Co. Todos os direitos reservados.',
  whiteLabelLevel: 'basico',
};

interface BrandingContextType {
  branding: BrandingConfig;
  updateBranding: (config: Partial<BrandingConfig>) => void;
  resetBranding: () => void;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export function BrandingProvider({ children }: { children: ReactNode }) {
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);

  useEffect(() => {
    const saved = localStorage.getItem('branding_config');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        setBranding({ ...DEFAULT_BRANDING, ...config });
      } catch (e) {
        console.error('Erro ao carregar branding:', e);
      }
    }
  }, []);

  useEffect(() => {
    // Aplicar cores dinamicamente no CSS global
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', branding.corPrimaria);
    root.style.setProperty('--brand-secondary', branding.corSecundaria);
    root.style.setProperty('--brand-background', branding.corFundo);
    root.style.setProperty('--brand-text', branding.corTexto);
    
    // Atualizar título da página
    document.title = branding.nomePlataforma;
    
    // Atualizar favicon se houver logo
    if (branding.logoUrl) {
      const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
      if (link) {
        link.href = branding.logoUrl;
      }
    }
    
    // Forçar re-render de todos os componentes
    window.dispatchEvent(new CustomEvent('branding-updated'));
  }, [branding]);

  const updateBranding = (config: Partial<BrandingConfig>) => {
    const newBranding = { ...branding, ...config };
    setBranding(newBranding);
    localStorage.setItem('branding_config', JSON.stringify(newBranding));
  };

  const resetBranding = () => {
    setBranding(DEFAULT_BRANDING);
    localStorage.removeItem('branding_config');
  };

  return (
    <BrandingContext.Provider value={{ branding, updateBranding, resetBranding }}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const context = useContext(BrandingContext);
  if (context === undefined) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
}
