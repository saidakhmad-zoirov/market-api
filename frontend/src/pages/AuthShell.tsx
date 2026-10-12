import type { ReactNode } from "react";

import { AmbientCanvas } from "../components/canvas/AmbientCanvas";
import { SplitText } from "../components/ui/SplitText";

export function AuthShell({ label, title, children, footer }: { label: string; title: string; children: ReactNode; footer: ReactNode }) {
  return (
    <div className="shell grid min-h-[70vh] place-items-center">
      <div className="panel relative w-full max-w-md overflow-hidden p-8 shadow-soft sm:p-10">
        <AmbientCanvas variant="rings" points={3} className="opacity-60" />
        <div className="relative space-y-8">
          <div className="space-y-3">
            <p className="label text-accent-2">{label}</p>
            <h1 className="text-4xl font-medium">
              <SplitText text={title} />
            </h1>
          </div>
          {children}
          <p className="text-center text-sm text-muted">{footer}</p>
        </div>
      </div>
    </div>
  );
}
