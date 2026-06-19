'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export interface SessionUser { userId: number; email: string; name: string; phone?: string | null; isAdmin?: boolean; }
interface AuthContextType { user: SessionUser | null; loading: boolean; login: (t: string, u: SessionUser) => void; logout: () => void; refresh: () => Promise<void>; }

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    try {
      const res = await fetch('/api/auth/me');
      setUser(res.ok ? (await res.json()).user : null);
    } catch { setUser(null); } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);
  function login(_: string, u: SessionUser) { setUser(u); }
  function logout() { fetch('/api/auth/logout', { method: 'POST' }); setUser(null); }

  return <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
