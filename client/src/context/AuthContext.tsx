import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAccessToken } from '../services/api';
import { AuthTokens, AuthUser, UserRole } from '../types';
import { connectSocket, disconnectSocket } from '../services/socket';

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  refresh: () => Promise<void>;
  logout: () => void;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'aegisx_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      setLoading(false);
      return;
    }

    try {
      const parsed = JSON.parse(raw) as { user: AuthUser; tokens: AuthTokens };
      setUser(parsed.user);
      setTokens(parsed.tokens);
      setAccessToken(parsed.tokens.accessToken);
      connectSocket(parsed.tokens.accessToken);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }

    setLoading(false);
  }, []);

  const persistAuth = (nextUser: AuthUser, nextTokens: AuthTokens) => {
    setUser(nextUser);
    setTokens(nextTokens);
    setAccessToken(nextTokens.accessToken);
    connectSocket(nextTokens.accessToken);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ user: nextUser, tokens: nextTokens }));
  };

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    persistAuth(response.data.data.user as AuthUser, response.data.data.tokens as AuthTokens);
  };

  const register = async (email: string, username: string, password: string) => {
    const response = await api.post('/auth/register', { email, username, password });
    persistAuth(response.data.data.user as AuthUser, response.data.data.tokens as AuthTokens);
  };

  const refresh = async () => {
    if (!tokens?.refreshToken) return;
    const response = await api.post('/auth/refresh', { refreshToken: tokens.refreshToken });
    persistAuth(response.data.data.user as AuthUser, response.data.data.tokens as AuthTokens);
  };

  const logout = () => {
    setUser(null);
    setTokens(null);
    setAccessToken(null);
    disconnectSocket();
    localStorage.removeItem(STORAGE_KEY);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    tokens,
    loading,
    login,
    register,
    refresh,
    logout,
    hasRole: (roles: UserRole[]) => (user ? roles.includes(user.role) : false),
  }), [loading, tokens, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used inside AuthProvider');
  }
  return context;
}

export { AuthContext };
