import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decryptString, encryptString } from '../utils/secureStorage';

type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; message?: string }>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

const INACTIVITY_MS = 3 * 60 * 1000; // 3 minutes

const DEMO_EMAIL = 'kaleabayenew2@gmail.com';
const DEMO_PASSWORD = 'Kale@1513';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  // load token from storage
  useEffect(() => {
    (async () => {
      try {
        const raw = localStorage.getItem('authTokenEnc');
        if (raw) {
          const t = await decryptString(raw);
          if (t) setToken(t);
        }
      } catch (e) {}
    })();
  }, []);

  // inactivity logout
  useEffect(() => {
    let timeout: number | null = null;
    const reset = () => {
      if (timeout) {
        clearTimeout(timeout as number);
      }
      timeout = window.setTimeout(() => {
        // auto logout after inactivity
        logout();
      }, INACTIVITY_MS);
    };

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'click'];
    events.forEach((ev) => window.addEventListener(ev, reset));
    reset();
    return () => {
      if (timeout) clearTimeout(timeout as number);
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (email: string, password: string) => {
    // basic validation
    if (!email || !password) return { ok: false, message: 'Email and password are required' };
    const emailRe = /\S+@\S+\.\S+/;
    if (!emailRe.test(email)) return { ok: false, message: 'Invalid email address' };
    if (password.length < 6) return { ok: false, message: 'Password must be at least 6 characters' };

    // Demo auth: check against hardcoded credentials
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
      const t = 'demo-token-' + Date.now();
      try {
        const enc = await encryptString(t);
        localStorage.setItem('authTokenEnc', enc);
      } catch (e) {
        // fallback to plain storage (shouldn't happen)
        localStorage.setItem('authToken', t);
      }
      setToken(t);
      try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'success', message: 'Signed in successfully' } })); } catch (e) {}
      return { ok: true };
    }

    // otherwise fail (in future call backend)
    return { ok: false, message: 'Invalid credentials' };
  };

  const logout = () => {
    try {
      localStorage.removeItem('authTokenEnc');
      localStorage.removeItem('authToken');
    } catch (e) {}
    setToken(null);
    try { window.dispatchEvent(new CustomEvent('admin:toast', { detail: { type: 'info', message: 'Signed out' } })); } catch (e) {}
    navigate('/login');
  };

  const value = useMemo(() => ({ isAuthenticated: !!token, token, login, logout }), [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

export default AuthContext;
