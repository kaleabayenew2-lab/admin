import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

type CsrfContextType = { token: string | null; loading: boolean };

const CsrfContext = createContext<CsrfContextType>({ token: null, loading: true });

export const CsrfProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchToken = async () => {
      try {
        // Try API endpoint first
        const res = await fetch((import.meta.env.VITE_API_BASE || '') + '/api/csrf-token', { method: 'GET', credentials: 'include' });
        if (res && res.ok) {
          const json = await res.json();
          if (mounted && json && json.csrfToken) {
            setToken(json.csrfToken);
            api.defaults.headers.common['X-CSRF-Token'] = json.csrfToken;
            setLoading(false);
            return;
          }
        }

        // fallback: check meta tag
        const meta = document.querySelector('meta[name="csrf-token"]') as HTMLMetaElement | null;
        if (meta && meta.content) {
          if (mounted) {
            setToken(meta.content);
            api.defaults.headers.common['X-CSRF-Token'] = meta.content;
          }
        }
      } catch (e) {
        // ignore; leave token null
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchToken();
    return () => { mounted = false; };
  }, []);

  return <CsrfContext.Provider value={{ token, loading }}>{children}</CsrfContext.Provider>;
};

export function useCsrf() {
  return useContext(CsrfContext);
}

export default CsrfContext;
