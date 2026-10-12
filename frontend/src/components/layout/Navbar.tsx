import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth";
import { useCart } from "../../hooks/useCart";
import { SearchBar } from "../product/SearchBar";
import { BagIcon, CloseIcon, MenuIcon, SearchIcon } from "../ui/Icons";
import { Logo } from "./Logo";

const links = [
  { to: "/", label: "Bosh sahifa", end: true },
  { to: "/products", label: "Katalog", end: false },
  { to: "/orders", label: "Buyurtmalar", end: false },
];

function NavItem({ to, label, end, onClick }: { to: string; label: string; end: boolean; onClick?: () => void }) {
  return (
    <NavLink
      to={to}
      end={end}
      onClick={onClick}
      className={({ isActive }) =>
        `roll-host rounded-full px-4 py-2 text-sm transition ${isActive ? "bg-ink text-bg" : "text-muted hover:text-ink"}`
      }
    >
      <span className="roll">
        <span>{label}</span>
        <span aria-hidden="true">{label}</span>
      </span>
    </NavLink>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const { count } = useCart();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setMenu(false);
    setSearch(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const iconBtn = "relative grid size-10 place-items-center rounded-full text-ink transition hover:bg-panel-2";

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div
        className={`mx-auto flex h-16 max-w-7xl items-center gap-3 rounded-full border px-3 pl-5 transition duration-500 ${
          scrolled ? "border-line bg-panel/80 shadow-soft backdrop-blur-xl" : "border-transparent bg-transparent"
        }`}
      >
        <Logo />

        <nav className="ml-6 hidden items-center gap-1 md:flex" aria-label="Asosiy menyu">
          {links.map((l) => (
            <NavItem key={l.to} {...l} />
          ))}
        </nav>

        <div className="ml-auto hidden w-64 lg:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex items-center gap-1 lg:ml-2">
          <button className={`${iconBtn} lg:hidden`} aria-label="Qidiruv" onClick={() => setSearch((s) => !s)}>
            <SearchIcon />
          </button>
          <Link to="/cart" className={iconBtn} aria-label={`Savatcha: ${count} ta mahsulot`}>
            <BagIcon />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1 font-mono text-[11px] font-bold text-on-accent">
                {count > 99 ? "99+" : count}
              </span>
            )}
          </Link>
          {user ? (
            <Link
              to="/profile"
              className="ml-1 hidden h-10 items-center gap-2 rounded-full border border-line pl-1 pr-4 text-sm transition hover:border-line-strong sm:flex"
            >
              <span className="grid size-8 place-items-center rounded-full bg-accent-2/20 font-mono text-xs font-semibold uppercase text-accent-2">
                {user.username.slice(0, 2)}
              </span>
              {user.username}
            </Link>
          ) : (
            <Link to="/login" className="ml-1 hidden h-10 items-center rounded-full bg-ink px-5 text-sm font-medium text-bg transition hover:opacity-90 sm:flex">
              Kirish
            </Link>
          )}
          <button className={`${iconBtn} md:hidden`} aria-label="Menyu" aria-expanded={menu} onClick={() => setMenu((m) => !m)}>
            {menu ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </div>

      {search && (
        <div className="page-in mx-auto mt-2 max-w-7xl lg:hidden">
          <SearchBar autoFocus />
        </div>
      )}

      {menu && (
        <div className="page-in panel mx-auto mt-2 max-w-7xl p-3 shadow-soft md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobil menyu">
            {links.map((l) => (
              <NavItem key={l.to} {...l} />
            ))}
            <NavItem to={user ? "/profile" : "/login"} label={user ? "Profil" : "Kirish"} end={false} />
            {!user && <NavItem to="/register" label="Ro'yxatdan o'tish" end={false} />}
          </nav>
        </div>
      )}
    </header>
  );
}

