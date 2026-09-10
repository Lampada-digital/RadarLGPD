import { useState } from 'react';
import { PLANOS, PlanoComercial } from '../lib/tenant';

interface LandingPageProps {
  onComecar: () => void;
}

export default function LandingPage({ onComecar }: LandingPageProps) {
  const [planoSelecionado, setPlanoSelecionado] = useState<string>('professional');

  const planos = Object.values(PLANOS);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pine via-pine-deep to-pine">
      {/* Header */}
      <header className="border-b border-pine-line">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative grid size-10 place-items-center overflow-hidden rounded-lg border border-lime/40 bg-pine-deep">
              <div className="radar-sweep absolute inset-0" style={{ background: "conic-gradient(from 0deg, rgba(201,233,79,0.35), transparent 75deg)" }} />
              <svg className="relative text-lime" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <div>
              <h1 className="font-display text-[17px] font-extrabold tracking-tight text-cream">Radar<span className="text-lime">GRC</span></h1>
              <p className="text-[9.5px] font-bold tracking-[0.18em] text-cream/40 uppercase">Governança, Risco e Compliance</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-sm text-cream/70">
            <a href="#recursos" className="hover:text-lime transition">Recursos</a>
            <a href="#planos" className="hover:text-lime transition">Planos</a>
            <a href="#recursos" className="hover:text-lime transition">Módulos</a>
            <button onClick={onComecar} className="bg-lime text-pine px-4 py-2 rounded-md font-bold hover:bg-lime-soft transition">
              Começar Agora
            </button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-lime/30 bg-pine-deep/60 px-4 py-2 mb-6">
            <span className="pulse-dot size-2 rounded-full bg-lime" />
            <span className="text-[11px] font-bold tracking-[0.16em] text-lime uppercase">Plataforma SaaS Multi-Tenant</span>
          </div>
          
          <h2 className="font-display text-[48px] md:text-[64px] leading-[1.05] font-extrabold tracking-tight text-cream mb-6">
            Transforme sua conformidade em <span className="text-lime">vantagem competitiva</span>
          </h2>
          
          <p className="text-[18px] leading-relaxed text-cream/70 mb-8 max-w-3xl mx-auto">
            Plataforma completa de Governança, Risco, Compliance e Privacidade. 
            Multi-tenant, White Label, escalável e preparada para crescer com sua empresa.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={onComecar} className="bg-lime text-pine px-8 py-4 rounded-md font-bold text-lg hover:bg-lime-soft transition shadow-[0_16px_36px_-14px_rgba(201,233,79,0.5)]">
              Começar Teste Grátis
            </button>
            <a href="#planos" className="border border-cream/25 text-cream px-8 py-4 rounded-md font-bold text-lg hover:border-lime/60 hover:text-lime transition">
              Ver Planos
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-left">
            <div>
              <p className="font-display text-[32px] font-extrabold text-lime">100%</p>
              <p className="text-[12px] text-cream/60">Conformidade LGPD</p>
            </div>
            <div>
              <p className="font-display text-[32px] font-extrabold text-lime">11+</p>
              <p className="text-[12px] text-cream/60">Frameworks ISO</p>
            </div>
            <div>
              <p className="font-display text-[32px] font-extrabold text-lime">Multi</p>
              <p className="text-[12px] text-cream/60">Tenant Isolado</p>
            </div>
            <div>
              <p className="font-display text-[32px] font-extrabold text-lime">24/7</p>
              <p className="text-[12px] text-cream/60">Suporte Dedicado</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recursos Section */}
      <section id="recursos" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="font-display text-[36px] font-extrabold text-cream mb-4">
            Tudo que você precisa em <span className="text-lime">uma plataforma</span>
          </h3>
          <p className="text-[16px] text-cream/70 max-w-2xl mx-auto">
            Módulos completos para gestão de conformidade, riscos e governança corporativa
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: 'shield', title: 'LGPD & GDPR', desc: 'Mapeamento completo de dados, matrizes de risco, políticas e relatórios' },
            { icon: 'brain', title: 'ISO 27001 & 27701', desc: 'Implementação completa de SGSI e PIMS com evidências' },
            { icon: 'matrix', title: 'Gestão de Riscos', desc: 'Identificação, análise e tratamento de riscos corporativos' },
            { icon: 'doc', title: 'Documentos', desc: 'Gestão centralizada de políticas, procedimentos e evidências' },
            { icon: 'spark', title: 'IA Integrada', desc: 'Classificação automática e sugestões inteligentes' },
            { icon: 'lock', title: 'White Label', desc: 'Personalização completa da marca e identidade visual' },
          ].map((recurso, i) => (
            <div key={i} className="rounded-lg border border-pine-line bg-pine-deep/50 p-6 hover:border-lime/50 transition">
              <div className="grid size-12 place-items-center rounded-md bg-lime/10 text-lime mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {recurso.icon === 'shield' && <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></>}
                  {recurso.icon === 'brain' && <><circle cx="12" cy="12" r="10"/><path d="M12 2a10 10 0 0 1 0 20M12 2a10 10 0 0 0 0 20M2 12h20"/></>}
                  {recurso.icon === 'matrix' && <><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></>}
                  {recurso.icon === 'doc' && <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></>}
                  {recurso.icon === 'spark' && <><path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6L5.6 18.4"/></>}
                  {recurso.icon === 'lock' && <><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></>}
                </svg>
              </div>
              <h4 className="font-display text-[18px] font-bold text-cream mb-2">{recurso.title}</h4>
              <p className="text-[13px] text-cream/70">{recurso.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Planos Section */}
      <section id="planos" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="font-display text-[36px] font-extrabold text-cream mb-4">
            Planos que <span className="text-lime">crescem com você</span>
          </h3>
          <p className="text-[16px] text-cream/70 max-w-2xl mx-auto">
            Escolha o plano ideal para sua empresa. Upgrade ou downgrade a qualquer momento.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {planos.map((plano) => (
            <div
              key={plano.id}
              className={`rounded-xl border-2 p-8 transition ${
                planoSelecionado === plano.id
                  ? 'border-lime bg-pine-deep shadow-[0_20px_50px_-20px_rgba(201,233,79,0.3)]'
                  : 'border-pine-line bg-pine-deep/50 hover:border-lime/50'
              }`}
              onClick={() => setPlanoSelecionado(plano.id)}
            >
              {plano.id === 'professional' && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-lime text-pine px-4 py-1 rounded-full text-[10px] font-extrabold tracking-wider uppercase">
                  Mais Popular
                </div>
              )}
              
              <h4 className="font-display text-[24px] font-extrabold text-cream mb-2">{plano.nome}</h4>
              <p className="text-[13px] text-cream/70 mb-6">{plano.descricao}</p>
              
              <div className="mb-6">
                <span className="font-display text-[48px] font-extrabold text-lime">R$ {plano.preco}</span>
                <span className="text-cream/60">/mês</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plano.recursos.map((recurso, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-cream/80">
                    <svg className="shrink-0 mt-0.5 text-lime" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {recurso}
                  </li>
                ))}
              </ul>

              <button
                onClick={onComecar}
                className={`w-full py-3 rounded-md font-bold transition ${
                  planoSelecionado === plano.id
                    ? 'bg-lime text-pine hover:bg-lime-soft'
                    : 'border border-cream/25 text-cream hover:border-lime/60 hover:text-lime'
                }`}
              >
                {plano.id === 'starter' ? 'Começar Teste Grátis' : 'Escolher Plano'}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Módulos Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="font-display text-[36px] font-extrabold text-cream mb-4">
            Módulos <span className="text-lime">modulares</span>
          </h3>
          <p className="text-[16px] text-cream/70 max-w-2xl mx-auto">
            Contrate apenas o que precisa. Adicione novos módulos quando quiser.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {[
            'LGPD & GDPR',
            'ISO 27001',
            'ISO 27701',
            'ISO 37301',
            'ISO 37001',
            'Gestão de Riscos',
            'Compliance',
            'Auditoria',
            'Documentos',
            'Planos de Ação',
            'Indicadores',
            'White Label',
          ].map((modulo, i) => (
            <div key={i} className="rounded-lg border border-pine-line bg-pine-deep/50 p-4 text-center hover:border-lime/50 transition">
              <p className="font-bold text-cream text-[14px]">{modulo}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center rounded-2xl border border-lime/30 bg-pine-deep/50 p-12">
          <h3 className="font-display text-[36px] font-extrabold text-cream mb-4">
            Pronto para transformar sua conformidade?
          </h3>
          <p className="text-[16px] text-cream/70 mb-8">
            Comece hoje mesmo com 7 dias grátis. Sem cartão de crédito.
          </p>
          <button onClick={onComecar} className="bg-lime text-pine px-8 py-4 rounded-md font-bold text-lg hover:bg-lime-soft transition shadow-[0_16px_36px_-14px_rgba(201,233,79,0.5)]">
            Começar Agora
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-pine-line mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-cream/50 text-[12px]">
          <p>© 2026 Radar GRC. Todos os direitos reservados.</p>
          <p className="mt-2">Plataforma SaaS Multi-Tenant de Governança, Risco e Compliance</p>
        </div>
      </footer>
    </div>
  );
}
