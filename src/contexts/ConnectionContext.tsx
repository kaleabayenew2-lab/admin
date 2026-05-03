import React, { createContext, useContext, useEffect, useState } from 'react';

type ConnectionContextValue = {
  online: boolean;
  checking: boolean;
};

const ConnectionContext = createContext<ConnectionContextValue>({ online: true, checking: false });

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [online, setOnline] = useState<boolean>(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [checking, setChecking] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;

    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const check = async () => {
      if (!navigator.onLine) {
        if (mounted) setOnline(false);
        return;
      }
      if (mounted) setChecking(true);
      try {
        const base = import.meta.env.VITE_API_BASE || 'https://backend-6tzt.onrender.com';
        const withCred = (import.meta.env.VITE_API_WITH_CREDENTIALS || 'false').toLowerCase() === 'true';
        const res = await fetch(`${base.replace(/\/$/, '')}/health`, { method: 'GET', credentials: withCred ? 'include' : 'same-origin', cache: 'no-store' });
        if (res && res.ok) {
          if (mounted) setOnline(true);
          return;
        }
      } catch (err) {
        try {
          const base = import.meta.env.VITE_API_BASE || 'https://backend-6tzt.onrender.com';
          // try a lightweight fetch as a fallback (no-cors mode)
          await fetch(base, { method: 'HEAD', cache: 'no-store', mode: 'no-cors' });
          if (mounted) setOnline(true);
        } catch (e) {
          if (mounted) setOnline(false);
        }
      } finally {
        if (mounted) setChecking(false);
      }
    };

    check();
    const iv = setInterval(check, 15000);

    return () => {
      mounted = false;
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(iv);
    };
  }, []);

  return <ConnectionContext.Provider value={{ online, checking }}>{children}</ConnectionContext.Provider>;
};

export const useConnection = () => useContext(ConnectionContext);

export default ConnectionContext;
