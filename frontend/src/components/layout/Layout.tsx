import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { StarField } from "../canvas/StarField";
import { Footer } from "./Footer";
import { Navbar } from "./Navbar";

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);

  return (
    <div className="relative flex min-h-dvh flex-col">
      <StarField />
      <div className="pointer-events-none fixed -left-40 -top-40 -z-10 size-[520px] rounded-full bg-accent-2/10 blur-[120px]" />
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:rounded-full focus:bg-accent focus:px-4 focus:py-2 focus:text-on-accent">
        Asosiy kontentga o'tish
      </a>
      <Navbar />
      <main id="main" key={pathname} className="page-in flex-1 pt-28">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
