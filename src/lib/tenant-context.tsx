import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Tenant, UsuarioTenant, TenantContext, obterTenantPorDominio, salvarTenant } from './tenant';

const TenantContextProvider = createContext<TenantContext | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenantState] = useState<Tenant | null>(null);
  const [usuario, setUsuarioState] = useState<UsuarioTenant | null>(null);

  // Detectar tenant pelo domínio na inicialização
  useEffect(() => {
    const dominio = window.location.hostname;
    const tenantDetectado = obterTenantPorDominio(dominio);
    if (tenantDetectado) {
      setTenantState(tenantDetectado);
      
      // Carregar usuário da sessão
      const usuarioSalvo = localStorage.getItem(`usuario_${tenantDetectado.id}`);
      if (usuarioSalvo) {
        setUsuarioState(JSON.parse(usuarioSalvo));
      }
    }
  }, []);

  const setTenant = (newTenant: Tenant) => {
    setTenantState(newTenant);
    salvarTenant(newTenant);
  };

  const setUsuario = (newUsuario: UsuarioTenant) => {
    setUsuarioState(newUsuario);
    if (tenant) {
      localStorage.setItem(`usuario_${tenant.id}`, JSON.stringify(newUsuario));
    }
  };

  const logout = () => {
    if (tenant) {
      localStorage.removeItem(`usuario_${tenant.id}`);
    }
    setUsuarioState(null);
  };

  return (
    <TenantContextProvider.Provider value={{ tenant, usuario, setTenant, setUsuario, logout }}>
      {children}
    </TenantContextProvider.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContextProvider);
  if (context === undefined) {
    throw new Error('useTenant deve ser usado dentro de TenantProvider');
  }
  return context;
}
