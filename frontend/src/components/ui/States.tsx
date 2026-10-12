import type { ReactNode } from "react";

import { Button } from "./Button";
import { Spinner } from "./Spinner";

export function LoadingState({ label = "Yuklanmoqda…" }: { label?: string }) {
  return (
    <div role="status" className="flex flex-col items-center justify-center gap-4 py-24 text-muted">
      <div className="relative grid size-16 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-accent-2/20" />
        <Spinner size={28} className="text-accent-ink" />
      </div>
      <span className="label">{label}</span>
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div role="alert" className="panel mx-auto flex max-w-lg flex-col items-center gap-4 px-6 py-12 text-center">
      <div className="grid size-14 place-items-center rounded-2xl bg-danger/10 font-display text-2xl text-danger">!</div>
      <h3 className="text-xl font-semibold">Ma'lumot yuklanmadi</h3>
      <p className="text-sm text-muted">{message}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Qayta urinish
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ title, text, action }: { title: string; text?: string; action?: ReactNode }) {
  return (
    <div className="panel relative mx-auto flex max-w-lg flex-col items-center gap-4 overflow-hidden px-6 py-14 text-center">
      <div className="pointer-events-none absolute -top-24 left-1/2 size-56 -translate-x-1/2 rounded-full bg-accent-2/20 blur-3xl" />
      <div className="relative grid size-16 place-items-center rounded-2xl border border-line bg-panel-2">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="text-accent-2">
          <path d="M3 7l9-4 9 4-9 4-9-4zM3 7v10l9 4 9-4V7M12 11v10" strokeLinejoin="round" />
        </svg>
      </div>
      <h3 className="relative text-xl font-semibold">{title}</h3>
      {text && <p className="relative text-sm text-muted">{text}</p>}
      {action && <div className="relative">{action}</div>}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="panel overflow-hidden">
          <div className="shimmer aspect-[4/3.4]" />
          <div className="space-y-3 p-5">
            <div className="shimmer h-3 w-1/3 rounded-full" />
            <div className="shimmer h-5 w-3/4 rounded-full" />
            <div className="shimmer h-4 w-1/4 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}
