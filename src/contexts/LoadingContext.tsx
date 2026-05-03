import React, { createContext, useCallback, useContext, useMemo, useEffect, useState } from 'react';
import Loading from '../components/Loading';

type LoadingContextType = {
  show: () => void;
  hide: () => void;
  isLoading: boolean;
};

const LoadingContext = createContext<LoadingContextType | null>(null);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [manual, setManual] = useState(false);
  const [requestCount, setRequestCount] = useState(0);

  const show = useCallback(() => setManual(true), []);
  const hide = useCallback(() => setManual(false), []);

  useEffect(() => {
    let mounted = true;
    const onReq = () => { if (!mounted) return; setRequestCount(c => c + 1); };
    const onRes = () => { if (!mounted) return; setRequestCount(c => Math.max(0, c - 1)); };

    window.addEventListener('admin:api-request', onReq as EventListener);
    window.addEventListener('admin:api-response', onRes as EventListener);

    return () => {
      mounted = false;
      window.removeEventListener('admin:api-request', onReq as EventListener);
      window.removeEventListener('admin:api-response', onRes as EventListener);
    };
  }, []);

  const isLoading = manual || requestCount > 0;

  const value = useMemo(() => ({ show, hide, isLoading }), [show, hide, isLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
      <Loading visible={isLoading} />
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
}
