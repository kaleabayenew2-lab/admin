import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastItem = { id: string; type: ToastType; title?: string; message: string };

type ToastContextType = {
  toasts: ToastItem[];
  push: (t: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  // aria-live region ref for screen readers
  const liveRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (ev: Event) => {
      try {
        const detail = (ev as CustomEvent).detail as { type?: ToastType; title?: string; message?: string };
        if (!detail || !detail.message) return;
        push({ type: detail.type || 'info', title: detail.title, message: detail.message });
        // update aria-live text for assistive tech
        if (liveRef.current) {
          liveRef.current.textContent = `${detail.type || 'info'}: ${detail.title || ''} ${detail.message}`.trim();
        }
      } catch (e) {}
    };
    window.addEventListener('admin:toast', handler as EventListener);
    return () => window.removeEventListener('admin:toast', handler as EventListener);
  }, []);

  const push = (t: Omit<ToastItem, 'id'>) => {
    const id = 't_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
    const item: ToastItem = { id, ...t };
    setToasts((s) => [item, ...s]);
    // auto remove
    setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), 5000);
  };

  const remove = (id: string) => setToasts((s) => s.filter((x) => x.id !== id));

  const value = useMemo(() => ({ toasts, push, remove }), [toasts]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Hidden aria-live region for screen readers */}
      <div ref={liveRef} className="sr-only" aria-live="polite" aria-atomic="true" />
      <div className="fixed right-4 bottom-4 z-50 flex flex-col-reverse gap-3" aria-hidden="false">
        {toasts.map((t) => (
          <div key={t.id} role="status" aria-live="polite" className={`max-w-xs w-full p-3 rounded shadow-lg border ${t.type === 'success' ? 'bg-green-50 border-green-200 dark:bg-green-900 dark:border-green-700' : t.type === 'error' ? 'bg-red-50 border-red-200 dark:bg-red-900 dark:border-red-700' : t.type === 'warning' ? 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900 dark:border-yellow-700' : 'bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700'}`}>
            <div className="flex items-start gap-2">
              <div className="flex-1">
                {t.title && <div className="font-semibold text-sm mb-1">{t.title}</div>}
                <div className="text-sm text-gray-700">{t.message}</div>
              </div>
              <button aria-label="dismiss" onClick={() => remove(t.id)} className="text-sm text-gray-500">×</button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}

// helper to emit a toast via window event without importing context
export function emitToast(detail: { type?: ToastType; title?: string; message: string }) {
  try {
    window.dispatchEvent(new CustomEvent('admin:toast', { detail }));
  } catch (e) {}
}

export default ToastContext;
