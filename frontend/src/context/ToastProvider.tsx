import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";

import { ToastContext, type ToastKind } from "./contexts";

interface Toast {
  id: number;
  message: string;
  kind: ToastKind;
}

const ICONS: Record<ToastKind, string> = { success: "✓", error: "!", info: "i" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const notify = useCallback((message: string, kind: ToastKind = "success") => {
    const id = nextId.current++;
    setToasts((list) => [...list.slice(-2), { id, message, kind }]);
    window.setTimeout(() => setToasts((list) => list.filter((t) => t.id !== id)), 3800);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6">
        {toasts.map((t) => (
          <div
            key={t.id}
            role={t.kind === "error" ? "alert" : "status"}
            className="toast-in pointer-events-auto flex max-w-sm items-center gap-3 rounded-2xl border border-line bg-panel/95 px-4 py-3 text-sm shadow-soft backdrop-blur"
          >
            <span
              className={`grid size-6 shrink-0 place-items-center rounded-full font-mono text-xs font-bold ${
                t.kind === "success" ? "bg-accent text-on-accent" : t.kind === "error" ? "bg-danger text-white" : "bg-accent-2 text-white"
              }`}
            >
              {ICONS[t.kind]}
            </span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
