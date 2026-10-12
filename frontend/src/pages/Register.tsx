import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage, getFieldErrors } from "../services/errors";
import type { RegisterPayload } from "../types";
import { AuthShell } from "./AuthShell";

export default function Register() {
  const { register } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [form, setForm] = useState<RegisterPayload>({ username: "", email: "", first_name: "", last_name: "", password: "", password2: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [general, setGeneral] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (key: keyof RegisterPayload) => (e: ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGeneral(null);
    if (form.password !== form.password2) {
      setErrors({ password2: "Parollar mos emas." });
      return;
    }
    setLoading(true);
    try {
      const user = await register({ ...form, username: form.username.trim(), email: form.email.trim() });
      notify(`Hisob yaratildi. Xush kelibsiz, ${user.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const fields = getFieldErrors(err);
      setErrors(fields);
      if (!Object.keys(fields).length) setGeneral(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      label="Yangi hisob"
      title="Ro'yxatdan o'tish"
      footer={
        <>
          Hisobingiz bormi?{" "}
          <Link to="/login" state={location.state} className="font-medium text-ink underline-offset-4 hover:underline">
            Kirish
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Ism" name="first_name" autoComplete="given-name" value={form.first_name} error={errors.first_name} onChange={set("first_name")} />
          <Field label="Familiya" name="last_name" autoComplete="family-name" value={form.last_name} error={errors.last_name} onChange={set("last_name")} />
        </div>
        <Field label="Username" name="username" autoComplete="username" required value={form.username} error={errors.username} onChange={set("username")} />
        <Field label="Email" name="email" type="email" autoComplete="email" required value={form.email} error={errors.email} onChange={set("email")} />
        <Field label="Parol" name="password" type="password" autoComplete="new-password" required value={form.password} error={errors.password} onChange={set("password")} />
        <Field label="Parolni takrorlang" name="password2" type="password" autoComplete="new-password" required value={form.password2} error={errors.password2} onChange={set("password2")} />
        <p className="text-xs text-faint">Kamida 8 belgi, faqat raqamlardan iborat bo'lmasin.</p>
        {general && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {general}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          Hisob yaratish
        </Button>
      </form>
    </AuthShell>
  );
}
