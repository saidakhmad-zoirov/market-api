import { Link } from "react-router-dom";

import { API_URL } from "../../services/api";
import { AmbientCanvas } from "../canvas/AmbientCanvas";
import { Logo } from "./Logo";

export function Footer() {
  const docs = new URL("docs/", API_URL).toString();
  return (
    <footer className="relative mt-32 overflow-hidden border-t border-line">
      <AmbientCanvas variant="flow" className="opacity-70" />
      <div className="shell relative grid gap-10 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-4">
          <Logo />
          <p className="max-w-sm text-sm text-muted">
            Django REST Framework va React asosidagi marketplace. Barcha mahsulotlar, savatcha va buyurtmalar real API orqali ishlaydi.
          </p>
        </div>
        <div className="space-y-3">
          <p className="label">Do'kon</p>
          <ul className="space-y-2 text-sm">
            <li><Link className="text-muted transition hover:text-ink" to="/products">Katalog</Link></li>
            <li><Link className="text-muted transition hover:text-ink" to="/cart">Savatcha</Link></li>
            <li><Link className="text-muted transition hover:text-ink" to="/orders">Buyurtmalar</Link></li>
          </ul>
        </div>
        <div className="space-y-3">
          <p className="label">Dasturchilar</p>
          <ul className="space-y-2 text-sm">
            <li><a className="text-muted transition hover:text-ink" href={docs} target="_blank" rel="noreferrer">API hujjatlari (Swagger)</a></li>
            <li><Link className="text-muted transition hover:text-ink" to="/profile">Profil</Link></li>
          </ul>
        </div>
      </div>
      <div className="shell relative flex flex-col gap-2 border-t border-line py-6 text-xs text-faint sm:flex-row sm:justify-between">
        <span>© {new Date().getFullYear()} Market API — portfolio loyiha</span>
        <span className="font-mono">React · TypeScript · Django REST · PostgreSQL</span>
      </div>
    </footer>
  );
}
