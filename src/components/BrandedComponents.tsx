import React from 'react';
import { useBranding } from '../lib/branding';

export function BrandedHeader({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { branding } = useBranding();
  
  return (
    <header 
      className={`${className}`}
      style={{ 
        backgroundColor: branding.corPrimaria,
        color: 'white'
      }}
      data-branding="header"
    >
      {children}
    </header>
  );
}

export function BrandedSidebar({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { branding } = useBranding();
  
  return (
    <aside 
      className={`${className}`}
      style={{ 
        backgroundColor: branding.corPrimaria,
        color: 'white'
      }}
      data-branding="sidebar"
    >
      {children}
    </aside>
  );
}

export function BrandedButton({ 
  children, 
  variant = 'primary',
  className = '',
  ...props 
}: { 
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { branding } = useBranding();
  
  const styles = variant === 'primary' 
    ? { backgroundColor: branding.corPrimaria, color: 'white' }
    : { backgroundColor: branding.corSecundaria, color: branding.corTexto };
  
  return (
    <button 
      className={`px-4 py-2 rounded-md font-semibold transition-opacity hover:opacity-90 ${className}`}
      style={styles}
      data-branding={`button-${variant}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function BrandedCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { branding } = useBranding();
  
  return (
    <div 
      className={`bg-white rounded-lg shadow-md ${className}`}
      style={{ borderColor: branding.corPrimaria }}
    >
      {children}
    </div>
  );
}

export function BrandedLogo({ className = '' }: { className?: string }) {
  const { branding } = useBranding();
  
  if (branding.logoUrl) {
    return (
      <div className={`logo-container ${className}`}>
        <img src={branding.logoUrl} alt={branding.nomeEmpresa} />
      </div>
    );
  }
  
  return (
    <div 
      className={`flex items-center gap-3 ${className}`}
      data-branding="logo"
    >
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xl"
        style={{ backgroundColor: branding.corSecundaria }}
      >
        {branding.nomePlataforma.charAt(0)}
      </div>
      <div>
        <h1 
          className="font-bold text-lg"
          style={{ color: 'white' }}
        >
          {branding.nomePlataforma}
        </h1>
        <p className="text-xs opacity-80" style={{ color: 'white' }}>
          {branding.nomeEmpresa}
        </p>
      </div>
    </div>
  );
}

export function BrandedFooter({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const { branding } = useBranding();
  
  return (
    <footer 
      className={`${className}`}
      style={{ 
        backgroundColor: branding.corPrimaria,
        color: 'white'
      }}
      data-branding="footer"
    >
      {children}
    </footer>
  );
}

export function BrandedLink({ 
  children, 
  href,
  className = '',
  ...props 
}: { 
  children: React.ReactNode;
  href: string;
  className?: string;
} & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  const { branding } = useBranding();
  
  return (
    <a 
      href={href}
      className={`transition-opacity hover:opacity-80 ${className}`}
      style={{ color: branding.corPrimaria }}
      {...props}
    >
      {children}
    </a>
  );
}

export function BrandedBadge({ 
  children, 
  variant = 'primary',
  className = '' 
}: { 
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  className?: string;
}) {
  const { branding } = useBranding();
  
  const styles = variant === 'primary'
    ? { backgroundColor: branding.corPrimaria, color: 'white' }
    : { backgroundColor: branding.corSecundaria, color: branding.corTexto };
  
  return (
    <span 
      className={`px-2 py-1 rounded-full text-xs font-semibold ${className}`}
      style={styles}
    >
      {children}
    </span>
  );
}

export function BrandedProgressBar({ 
  value, 
  className = '' 
}: { 
  value: number;
  className?: string;
}) {
  const { branding } = useBranding();
  
  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="h-2 rounded-full transition-all duration-300"
        style={{ 
          width: `${value}%`,
          backgroundColor: branding.corPrimaria
        }}
      />
    </div>
  );
}

export function BrandedInput({ 
  className = '',
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  const { branding } = useBranding();
  
  return (
    <input 
      className={`border rounded-md px-3 py-2 focus:outline-none focus:ring-2 ${className}`}
      style={{ 
        borderColor: '#e5e7eb',
        '--tw-ring-color': branding.corPrimaria 
      } as React.CSSProperties}
      {...props}
    />
  );
}

export function BrandedCheckbox({ 
  className = '',
  ...props 
}: React.InputHTMLAttributes<HTMLInputElement> & { className?: string }) {
  const { branding } = useBranding();
  
  return (
    <input 
      type="checkbox"
      className={`rounded border-gray-300 ${className}`}
      style={{ 
        '--tw-ring-color': branding.corPrimaria,
        '--tw-border-color': '#e5e7eb'
      } as React.CSSProperties}
      {...props}
    />
  );
}

export function BrandedTable({ 
  children, 
  className = '' 
}: { 
  children: React.ReactNode;
  className?: string;
}) {
  const { branding } = useBranding();
  
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full">
        <thead style={{ backgroundColor: branding.corPrimaria }}>
          {React.Children.map(children, (child) => {
            if (React.isValidElement(child) && child.type === 'thead') {
              return React.cloneElement(child, {
                style: { backgroundColor: branding.corPrimaria }
              });
            }
            return child;
          })}
        </thead>
        <tbody className="bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
}
