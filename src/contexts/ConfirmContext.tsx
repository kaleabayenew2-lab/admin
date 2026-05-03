import React, { createContext, useContext, useMemo, useRef, useState, useEffect } from 'react';
import ReactDOM from 'react-dom';

type ConfirmOptions = {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  danger?: boolean;
};

type ConfirmContextType = {
  confirm: (opts: ConfirmOptions) => Promise<boolean>;
};

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [resolver, setResolver] = useState<((v: boolean) => void) | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const confirm = (o: ConfirmOptions) => {
    return new Promise<boolean>((res) => {
      setOpts({ confirmText: 'Yes', cancelText: 'Cancel', ...o });
      setResolver(() => res);
      setOpen(true);
    });
  };

  const handle = (val: boolean) => {
    try { resolver && resolver(val); } catch (e) {}
    setOpen(false);
    setOpts(null);
    setResolver(null);
  };

  useEffect(() => {
    if (open) {
      // focus confirm button for keyboard users
      setTimeout(() => confirmBtnRef.current?.focus(), 0);
    }
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      handle(false);
      return;
    }
    if (e.key === 'Tab' && containerRef.current) {
      // basic focus trap between cancel and confirm
      const first = cancelBtnRef.current;
      const last = confirmBtnRef.current;
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  const value = useMemo(() => ({ confirm }), []);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      {open && opts && ReactDOM.createPortal(
        <div style={{ zIndex: 999999 }} className="fixed inset-0 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => handle(false)} />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            aria-describedby="confirm-desc"
            ref={containerRef}
            onKeyDown={onKeyDown}
            className="bg-white dark:bg-gray-800 rounded shadow-lg w-full max-w-md p-6"
          >
            {opts.title && <div id="confirm-title" className="text-lg font-semibold mb-2">{opts.title}</div>}
            <div id="confirm-desc" className="text-sm text-gray-700 mb-4">{opts.message}</div>
            <div className="flex justify-end gap-2">
              <button ref={cancelBtnRef} className="px-4 py-2 rounded border" onClick={() => handle(false)}>{opts.cancelText}</button>
              <button ref={confirmBtnRef} className={`px-4 py-2 rounded text-white ${opts.danger ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'}`} onClick={() => handle(true)}>{opts.confirmText}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </ConfirmContext.Provider>
  );
};

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx.confirm;
}

export default ConfirmContext;
