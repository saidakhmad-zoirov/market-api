import { useEffect, useState } from "react";

import { prefersReducedMotion } from "../../hooks/useInView";

const GLYPHS = "ABCDEFGHJKLMNPQRSTUVWXYZ0123456789/<>*#";

/** Kichik yorliqlar "dekodlanib" paydo bo'ladi. */
export function DecodeText({ text, className = "" }: { text: string; className?: string }) {
  const [shown, setShown] = useState(text);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setShown(text);
      return;
    }
    let frame = 0;
    const total = text.length * 2 + 8;
    const id = window.setInterval(() => {
      frame++;
      const settled = Math.floor(frame / 2);
      setShown(
        Array.from(text)
          .map((ch, i) => (i < settled || ch === " " ? ch : GLYPHS[Math.floor(Math.random() * GLYPHS.length)]))
          .join(""),
      );
      if (frame >= total) {
        window.clearInterval(id);
        setShown(text);
      }
    }, 32);
    return () => window.clearInterval(id);
  }, [text]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{shown}</span>
    </span>
  );
}
