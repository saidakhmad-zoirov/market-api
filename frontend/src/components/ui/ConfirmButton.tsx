import { useEffect, useState, type ReactNode } from "react";

import { Button } from "./Button";

interface Props {
  label: string;
  question: string;
  onConfirm: () => void | Promise<void>;
  loading?: boolean;
  icon?: ReactNode;
}

/**
 * Xavfli amal uchun ikki bosqichli tugma: avval bosiladi, keyin sahifaning o'zida "Ha / Yo'q" so'raladi.
 * Brauzerning window.confirm() oynasi ishlatilmaydi — u ba'zi muhitlarda (iframe, ilova ichida) bloklanadi.
 */
export function ConfirmButton({ label, question, onConfirm, loading, icon }: Props) {
  const [asking, setAsking] = useState(false);

  // 6 soniyada javob bo'lmasa — so'rov yopiladi
  useEffect(() => {
    if (!asking) return;
    const id = window.setTimeout(() => setAsking(false), 6000);
    return () => window.clearTimeout(id);
  }, [asking]);

  if (!asking)
    return (
      <Button variant="danger" size="sm" onClick={() => setAsking(true)} loading={loading} icon={icon}>
        {label}
      </Button>
    );

  return (
    <div role="group" aria-label={question} className="page-in flex flex-wrap items-center gap-2 rounded-full border border-danger/40 py-1 pl-4 pr-1">
      <span className="text-sm text-danger">{question}</span>
      <button
        type="button"
        autoFocus
        className="h-8 rounded-full bg-danger px-4 text-sm font-medium text-white transition hover:opacity-90"
        onClick={async () => {
          setAsking(false);
          await onConfirm();
        }}
      >
        Ha
      </button>
      <button type="button" className="h-8 rounded-full px-3 text-sm text-muted transition hover:text-ink" onClick={() => setAsking(false)}>
        Yo'q
      </button>
    </div>
  );
}
