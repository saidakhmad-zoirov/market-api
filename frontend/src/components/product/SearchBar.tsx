import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { SearchIcon } from "../ui/Icons";

/** Qidiruv: /products?search=... sahifasiga yo'naltiradi. */
export function SearchBar({ size = "md", autoFocus = false, onDone }: { size?: "md" | "lg"; autoFocus?: boolean; onDone?: () => void }) {
  const [q, setQ] = useState("");
  const navigate = useNavigate();

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    navigate(term ? `/products?search=${encodeURIComponent(term)}` : "/products");
    onDone?.();
  };

  const big = size === "lg";
  return (
    <form onSubmit={submit} role="search" className={`group relative flex items-center ${big ? "h-16" : "h-11"} w-full`}>
      <SearchIcon className={`pointer-events-none absolute z-10 ${big ? "left-6" : "left-4"} text-muted transition group-focus-within:text-accent-2`} />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        placeholder="Mahsulot qidiring…"
        aria-label="Mahsulot qidirish"
        className={`h-full w-full rounded-full border border-line bg-panel/80 text-ink backdrop-blur placeholder:text-faint focus:border-accent-2 focus:outline-none ${
          big ? "pl-14 pr-36 text-lg" : "pl-11 pr-4 text-sm"
        }`}
      />
      {big && (
        <button type="submit" className="absolute right-2 h-12 rounded-full bg-accent px-6 font-medium text-on-accent transition hover:glow-accent">
          Qidirish
        </button>
      )}
    </form>
  );
}
