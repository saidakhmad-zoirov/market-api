import { Link } from "react-router-dom";

export function Logo() {
  return (
    <Link to="/" className="group flex items-center gap-2.5" aria-label="Market — bosh sahifa">
      <span className="grid size-9 place-items-center rounded-xl bg-ink text-bg transition duration-500 group-hover:rotate-[-8deg] group-hover:bg-accent group-hover:text-on-accent">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 18V6l7 7 7-7v12" />
        </svg>
      </span>
      <span className="font-display text-xl font-bold tracking-wide">
        market<span className="text-accent-ink">.</span>
      </span>
    </Link>
  );
}
