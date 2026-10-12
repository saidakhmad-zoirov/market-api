import { useEffect, useRef, useState } from "react";

import { prefersReducedMotion, useInView } from "../../hooks/useInView";

/** Raqam ekranga kirganda 0 dan haqiqiy qiymatgacha sanaladi. Boshlangach, scroll qilinsa ham oxirigacha yetadi. */
export function CountUp({ value, duration = 1400, className = "" }: { value: number; duration?: number; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, "0px");
  const [started, setStarted] = useState(false);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (inView) setStarted(true);
  }, [inView]);

  useEffect(() => {
    if (!started) return;
    if (prefersReducedMotion()) {
      setN(value);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      setN(Math.round(value * (1 - Math.pow(1 - p, 4))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [started, value, duration]);

  return (
    <span ref={ref} className={`tabular-nums ${className}`}>
      {n.toLocaleString("en-US")}
    </span>
  );
}
