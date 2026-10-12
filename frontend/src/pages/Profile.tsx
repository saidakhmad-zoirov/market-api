import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import { Button, LinkButton } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { SplitText } from "../components/ui/SplitText";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { authService } from "../services/auth";
import { ADMIN_URL } from "../services/api";
import { getErrorMessage, getFieldErrors } from "../services/errors";
import { formatDate } from "../utils/format";

export default function Profile() {
  const { user, setUser, logout } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: user?.first_name ?? "",
    last_name: user?.last_name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    address: user?.address ?? "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [pw, setPw] = useState({ old_password: "", new_password: "" });
  const [pwErrors, setPwErrors] = useState<Record<string, string>>({});
  const [pwSaving, setPwSaving] = useState(false);
  const [leaving, setLeaving] = useState(false);

  if (!user) return null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);
    try {
      setUser(await authService.updateMe(form));
      notify("Profil saqlandi");
    } catch (err) {
      setErrors(getFieldErrors(err));
      notify(getErrorMessage(err), "error");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwErrors({});
    setPwSaving(true);
    try {
      await authService.changePassword(pw.old_password, pw.new_password);
      setPw({ old_password: "", new_password: "" });
      notify("Parol yangilandi");
    } catch (err) {
      setPwErrors(getFieldErrors(err));
    } finally {
      setPwSaving(false);
    }
  };

  const signOut = async () => {
    setLeaving(true);
    await logout();
    notify("Hisobdan chiqdingiz", "info");
    navigate("/", { replace: true });
  };

  return (
    <div className="shell max-w-5xl">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div className="flex items-center gap-5">
          <span className="grid size-20 place-items-center rounded-3xl bg-accent-2/15 font-display text-3xl font-medium uppercase text-accent-2">
            {user.username.slice(0, 2)}
          </span>
          <div>
            <h1 className="text-4xl font-medium sm:text-5xl">
              <SplitText text={user.first_name || user.username} />
            </h1>
            <p className="text-muted">
              @{user.username} · {formatDate(user.date_joined)} dan beri
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <LinkButton to="/orders" variant="outline">
            Buyurtmalarim
          </LinkButton>
          {user.is_staff && (
            <a href={ADMIN_URL} target="_blank" rel="noreferrer" className="inline-flex h-11 items-center rounded-full border border-accent-2/40 px-6 text-sm text-accent-2 transition hover:bg-accent-2/10">
              Admin panel ↗
            </a>
          )}
          <Button variant="danger" onClick={signOut} loading={leaving}>
            Chiqish
          </Button>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        <form onSubmit={save} className="panel space-y-5 p-6 sm:p-8" noValidate>
          <h2 className="text-2xl font-medium">Shaxsiy ma'lumotlar</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Ism" name="first_name" value={form.first_name} error={errors.first_name} onChange={(e) => setForm({ ...form, first_name: e.target.value })} />
            <Field label="Familiya" name="last_name" value={form.last_name} error={errors.last_name} onChange={(e) => setForm({ ...form, last_name: e.target.value })} />
          </div>
          <Field label="Email" name="email" type="email" value={form.email} error={errors.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <Field label="Telefon" name="phone" type="tel" value={form.phone} error={errors.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <Field label="Yetkazish manzili" name="address" value={form.address} error={errors.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          <p className="text-xs text-faint">Telefon va manzil buyurtma formasini avtomatik to'ldiradi.</p>
          <Button type="submit" loading={saving}>
            Saqlash
          </Button>
        </form>

        <form onSubmit={changePassword} className="panel h-fit space-y-5 p-6 sm:p-8" noValidate>
          <h2 className="text-2xl font-medium">Parolni o'zgartirish</h2>
          <Field label="Joriy parol" name="old_password" type="password" autoComplete="current-password" value={pw.old_password} error={pwErrors.old_password} onChange={(e) => setPw({ ...pw, old_password: e.target.value })} />
          <Field label="Yangi parol" name="new_password" type="password" autoComplete="new-password" value={pw.new_password} error={pwErrors.new_password} onChange={(e) => setPw({ ...pw, new_password: e.target.value })} />
          <Button type="submit" variant="outline" loading={pwSaving} disabled={!pw.old_password || !pw.new_password}>
            Yangilash
          </Button>
        </form>
      </div>
    </div>
  );
}
