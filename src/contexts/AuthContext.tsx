import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import type { ReactNode } from 'react';
import type { Usuario } from '../types';
import { authService } from '../services';
import { TOKEN_KEY } from '../services/api';

interface AuthContextValue {
  usuario: Usuario | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (correo: string, contrasena: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem('juyasia_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (correo: string, contrasena: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const data = await authService.login(correo, contrasena);
      const user = data.usuario;
      if (data.token) localStorage.setItem(TOKEN_KEY, data.token);
      setUsuario(user);
      localStorage.setItem('juyasia_user', JSON.stringify(user));
      return true;
    } catch {
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUsuario(null);
    localStorage.removeItem('juyasia_user');
  }, []);

  const value = useMemo(
    () => ({
      usuario,
      isLoggedIn: !!usuario,
      isLoading,
      login,
      logout,
    }),
    [usuario, isLoading, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
