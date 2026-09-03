'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { fetchMe, login as apiLogin, register as apiRegister } from '@/lib/api/auth';
import { getAccessToken, setTokens, clearTokens } from '@/lib/auth/tokens';
import { extractErrorMessage } from '@/lib/api/client';
import { User } from '@/types';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = getAccessToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        clearTokens();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const data = await apiLogin(email, password);
    setTokens(data.accessToken, data.refreshToken);
    const me = await fetchMe();
    setUser(me);
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const data = await apiRegister(name, email, password);
    setTokens(data.accessToken, data.refreshToken);
    const me = await fetchMe();
    setUser(me);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, loading, login, register, logout, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

export { extractErrorMessage };