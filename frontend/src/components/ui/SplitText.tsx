import type { ElementType } from "react";

interface Props {
  text: string;
  as?: ElementType;
  className?: string;
  delay?: number; // ms
}

/** Sarlavha harflari birma-bir ko'tarilib chiqadi. Ekran o'quvchilar uchun to'liq matn aria-label'da. */
export function SplitText({ text, as: Tag = "span", className = "", delay = 0 }: Props) {
  let index = 0;
  return (
    <Tag className={className} aria-label={text}>
      {text.split(" ").map((word, w) => (
        <span key={w} aria-hidden="true" className="inline-block whitespace-nowrap">
          {Array.from(word).map((ch) => {
            const i = index++;
            return (
              <span key={i} className="split-char" style={{ ["--i" as string]: i, ["--d" as string]: `${delay}ms` }}>
                {ch}
              </span>
            );
          })}
          {w < text.split(" ").length - 1 && <span className="inline-block">&nbsp;</span>}
        </span>
      ))}
    </Tag>
  );
}
