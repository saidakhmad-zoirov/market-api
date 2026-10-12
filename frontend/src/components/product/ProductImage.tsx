import { useState } from "react";

import { initials } from "../../utils/format";

/**
 * Mahsulot rasmi. Backend'da rasm bo'lmasa — soxta foto o'rniga
 * mahsulot nomidan yasalgan aniq "monogram" ko'rsatiladi.
 */
export function ProductImage({ src, name, category, className = "" }: { src: string | null; name: string; category?: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={name}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={`h-full w-full object-cover transition duration-700 group-hover:scale-[1.06] ${className}`}
      />
    );
  }

  // nomdan barqaror rang tanlash
  // tabiiy oraliq: yashil → moviy-yashil
  const hue = 130 + (Array.from(name).reduce((h, c) => (h * 31 + c.charCodeAt(0)) % 997, 7) % 90);
  return (
    <div
      className={`relative grid h-full w-full place-items-center overflow-hidden ${className}`}
      style={{
        containerType: "inline-size",
        background: `radial-gradient(120% 90% at 20% 10%, hsla(${hue},55%,55%,0.22), transparent 60%), radial-gradient(90% 80% at 90% 100%, var(--accent-2-soft), transparent 60%), var(--panel-2)`,
      }}
      role="img"
      aria-label={`${name} — rasm yuklanmagan`}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(var(--line)_1px,transparent_1px),linear-gradient(90deg,var(--line)_1px,transparent_1px)] [background-size:28px_28px]" />
      <span
        className="relative font-display font-medium tracking-wide text-ink/80 transition duration-700 group-hover:scale-110"
        style={{ fontSize: "clamp(14px, 26cqw, 84px)" }}
      >
        {initials(name)}
      </span>
      {category && <span className="label absolute bottom-4 left-4">{category}</span>}
    </div>
  );
}
