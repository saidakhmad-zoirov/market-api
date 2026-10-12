import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { getErrorMessage } from "../services/errors";
import { AuthShell } from "./AuthShell";

export default function Login() {
  const { login } = useAuth();
  const { notify } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? "/";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const me = await login(username.trim(), password);
      notify(`Xush kelibsiz, ${me.first_name || me.username}!`);
      navigate(from, { replace: true });
    } catch (err) {
      const msg = getErrorMessage(err);
      // simplejwt: "No active account found with the given credentials"
      setError(msg.startsWith("No active account") ? "Login yoki parol noto'g'ri." : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      label="Hisobga kirish"
      title="Qaytganingizdan xursandmiz"
      footer={
        <>
          Hisobingiz yo'qmi?{" "}
          <Link to="/register" state={location.state} className="font-medium text-ink underline-offset-4 hover:underline">
            Ro'yxatdan o'ting
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <Field label="Username" name="username" autoComplete="username" required value={username} onChange={(e) => setUsername(e.target.value)} />
        <Field label="Parol" name="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        {error && (
          <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!username || !password}>
          Kirish
        </Button>
      </form>
    </AuthShell>
  );
}
