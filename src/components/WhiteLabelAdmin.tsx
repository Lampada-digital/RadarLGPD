import { useState, useEffect } from 'react';
import { useStore } from '../store';
import { useAuth } from '../auth';
import { Ic } from './ui';

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

export default function WhiteLabelAdmin() {
  const { toast } = useStore();
  const { usuario } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig>(DEFAULT_BRANDING);
  const [previewLogo, setPreviewLogo] = useState<string>('');

  useEffect(() => {
    const saved = localStorage.getItem('branding_config');
    if (saved) {
      const config = JSON.parse(saved);
      setBranding(config);
      if (config.logoUrl) {
        setPreviewLogo(config.logoUrl);
      }
    }
  }, []);

  const handleSave = () => {
    localStorage.setItem('branding_config', JSON.stringify(branding));
    toast('Configurações white label salvas com sucesso!');
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setBranding({ ...branding, logoUrl: base64 });
        setPreviewLogo(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    setBranding(DEFAULT_BRANDING);
    setPreviewLogo('');
    localStorage.removeItem('branding_config');
    toast('Configurações resetadas para o padrão');
  };

  return (
    <div className="min-h-screen bg-paper p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Ic name="palette" size={24} className="text-moss" />
            <h1 className="font-display text-3xl font-bold text-ink">White Label</h1>
          </div>
          <p className="text-ink-soft">
            Personalize a identidade visual da plataforma conforme seu nível de white label
          </p>
        </div>

        {/* Level Badge */}
        <div className="mb-6 p-4 rounded-lg border-2 border-moss bg-moss/5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-moss">Nível Atual</p>
              <p className="text-2xl font-bold text-ink capitalize">{branding.whiteLabelLevel}</p>
            </div>
            <select
              value={branding.whiteLabelLevel}
              onChange={(e) => setBranding({ ...branding, whiteLabelLevel: e.target.value as any })}
              className="px-4 py-2 border border-sand rounded-lg bg-cream text-ink font-semibold"
            >
              <option value="basico">Básico</option>
              <option value="profissional">Profissional</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div className="mt-3 text-sm text-ink-soft">
            {branding.whiteLabelLevel === 'basico' && (
              <p>• Marca "Powered by Radar GRC" visível no rodapé</p>
            )}
            {branding.whiteLabelLevel === 'profissional' && (
              <p>• Marca Radar GRC oculta na interface principal</p>
            )}
            {branding.whiteLabelLevel === 'enterprise' && (
              <p>• White label completo - sem nenhuma referência ao Radar GRC</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configurações */}
          <div className="bg-cream rounded-lg border border-sand p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Configurações de Marca</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Nome da Plataforma
                </label>
                <input
                  type="text"
                  value={branding.nomePlataforma}
                  onChange={(e) => setBranding({ ...branding, nomePlataforma: e.target.value })}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                  placeholder="Ex: Compliance Pro"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  value={branding.nomeEmpresa}
                  onChange={(e) => setBranding({ ...branding, nomeEmpresa: e.target.value })}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                  placeholder="Ex: Sua Empresa Ltda"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Logo da Empresa
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                />
                {previewLogo && (
                  <div className="mt-2 p-3 bg-paper rounded-lg border border-sand">
                    <img src={previewLogo} alt="Logo Preview" className="max-h-20 mx-auto" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Cor Primária
                  </label>
                  <input
                    type="color"
                    value={branding.corPrimaria}
                    onChange={(e) => setBranding({ ...branding, corPrimaria: e.target.value })}
                    className="w-full h-10 border border-sand rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Cor Secundária
                  </label>
                  <input
                    type="color"
                    value={branding.corSecundaria}
                    onChange={(e) => setBranding({ ...branding, corSecundaria: e.target.value })}
                    className="w-full h-10 border border-sand rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Cor de Fundo
                  </label>
                  <input
                    type="color"
                    value={branding.corFundo}
                    onChange={(e) => setBranding({ ...branding, corFundo: e.target.value })}
                    className="w-full h-10 border border-sand rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink mb-2">
                    Cor do Texto
                  </label>
                  <input
                    type="color"
                    value={branding.corTexto}
                    onChange={(e) => setBranding({ ...branding, corTexto: e.target.value })}
                    className="w-full h-10 border border-sand rounded-lg cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  E-mail de Suporte
                </label>
                <input
                  type="email"
                  value={branding.suporteEmail}
                  onChange={(e) => setBranding({ ...branding, suporteEmail: e.target.value })}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                  placeholder="suporte@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Telefone de Suporte
                </label>
                <input
                  type="tel"
                  value={branding.suporteTelefone}
                  onChange={(e) => setBranding({ ...branding, suporteTelefone: e.target.value })}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                  placeholder="+55 11 99999-9999"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  URL do Site
                </label>
                <input
                  type="url"
                  value={branding.siteUrl}
                  onChange={(e) => setBranding({ ...branding, siteUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                  placeholder="https://empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-2">
                  Texto do Rodapé
                </label>
                <textarea
                  value={branding.rodape}
                  onChange={(e) => setBranding({ ...branding, rodape: e.target.value })}
                  className="w-full px-4 py-2 border border-sand rounded-lg bg-paper text-ink"
                  rows={3}
                  placeholder="© 2026 Sua Empresa. Todos os direitos reservados."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-moss text-cream px-6 py-3 rounded-lg font-bold hover:bg-moss/90 transition"
              >
                Salvar Configurações
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 border border-sand rounded-lg font-bold text-ink hover:bg-paper transition"
              >
                Resetar
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-cream rounded-lg border border-sand p-6">
            <h2 className="text-xl font-bold text-ink mb-4">Preview</h2>
            
            <div 
              className="rounded-lg border border-sand p-6"
              style={{ backgroundColor: branding.corFundo }}
            >
              {/* Header Preview */}
              <div 
                className="rounded-t-lg p-4 mb-4"
                style={{ backgroundColor: branding.corPrimaria }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {previewLogo ? (
                      <img src={previewLogo} alt="Logo" className="h-10" />
                    ) : (
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-cream font-bold"
                        style={{ backgroundColor: branding.corSecundaria }}
                      >
                        {branding.nomePlataforma.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 
                        className="font-bold text-lg"
                        style={{ color: branding.corTexto === '#182620' ? '#ffffff' : branding.corTexto }}
                      >
                        {branding.nomePlataforma}
                      </h3>
                      <p className="text-xs opacity-80" style={{ color: branding.corTexto === '#182620' ? '#ffffff' : branding.corTexto }}>
                        {branding.nomeEmpresa}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <div className="space-y-3">
                <div className="bg-paper rounded-lg p-4">
                  <h4 className="font-bold mb-2" style={{ color: branding.corTexto }}>
                    Dashboard
                  </h4>
                  <p className="text-sm" style={{ color: branding.corTexto }}>
                    Exemplo de conteúdo com suas cores personalizadas
                  </p>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 rounded-lg font-semibold text-cream"
                    style={{ backgroundColor: branding.corPrimaria }}
                  >
                    Botão Primário
                  </button>
                  <button 
                    className="px-4 py-2 rounded-lg font-semibold"
                    style={{ 
                      backgroundColor: branding.corSecundaria,
                      color: branding.corTexto
                    }}
                  >
                    Botão Secundário
                  </button>
                </div>
              </div>

              {/* Footer Preview */}
              <div className="mt-4 pt-4 border-t border-sand">
                <p className="text-xs text-center" style={{ color: branding.corTexto }}>
                  {branding.rodape}
                </p>
                {branding.whiteLabelLevel === 'basico' && (
                  <p className="text-xs text-center mt-2 opacity-60" style={{ color: branding.corTexto }}>
                    Powered by Radar GRC
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 p-4 bg-paper rounded-lg border border-sand">
              <h4 className="font-bold text-ink mb-2">Informações de Contato</h4>
              <div className="space-y-2 text-sm text-ink-soft">
                <p>📧 {branding.suporteEmail}</p>
                <p>📞 {branding.suporteTelefone}</p>
                <p>🌐 {branding.siteUrl}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
