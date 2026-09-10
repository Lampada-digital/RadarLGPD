export interface BrandingConfig {
  tenantId: string;
  nomePlataforma: string;
  nomeEmpresa: string;
  logoUrl?: string;
  faviconUrl?: string;
  corPrimaria: string;
  corSecundaria: string;
  corFundo: string;
  corTexto: string;
  suporteEmail: string;
  suporteTelefone?: string;
  siteUrl?: string;
  rodape: string;
  whiteLabelLevel: 'basico' | 'profissional' | 'enterprise';
}

export const DEFAULT_BRANDING: BrandingConfig = {
  tenantId: 'default',
  nomePlataforma: 'Radar GRC',
  nomeEmpresa: 'Radar Co.',
  corPrimaria: '#132e26',
  corSecundaria: '#c9e94f',
  corFundo: '#f2efe4',
  corTexto: '#182620',
  suporteEmail: 'suporte@radargrc.com',
  rodape: '© 2026 Radar Co. Todos os direitos reservados.',
  whiteLabelLevel: 'basico',
};
