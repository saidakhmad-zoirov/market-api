import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;
const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export const SearchIcon = (p: P) => (
  <svg {...common} {...p}><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
);
export const BagIcon = (p: P) => (
  <svg {...common} {...p}><path d="M5 8h14l-1.2 12H6.2L5 8z" /><path d="M9 8V6a3 3 0 0 1 6 0v2" /></svg>
);
export const UserIcon = (p: P) => (
  <svg {...common} {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></svg>
);
export const ArrowIcon = (p: P) => (
  <svg {...common} {...p}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const MenuIcon = (p: P) => (
  <svg {...common} {...p}><path d="M4 7h16M4 12h16M4 17h10" /></svg>
);
export const CloseIcon = (p: P) => (
  <svg {...common} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>
);
export const SunIcon = (p: P) => (
  <svg {...common} {...p}><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const MoonIcon = (p: P) => (
  <svg {...common} {...p}><path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" /></svg>
);
export const TrashIcon = (p: P) => (
  <svg {...common} {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></svg>
);
export const PlusIcon = (p: P) => (
  <svg {...common} {...p}><path d="M12 5v14M5 12h14" /></svg>
);
export const MinusIcon = (p: P) => (
  <svg {...common} {...p}><path d="M5 12h14" /></svg>
);
export const CheckIcon = (p: P) => (
  <svg {...common} {...p}><path d="m5 12 4.5 4.5L19 7" /></svg>
);
