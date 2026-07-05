import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiError } from "../../helpers/api-client";
import { useAuth } from "../../hooks/useAuth";

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Login gagal");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-app px-5 text-main">
      <form
        className="w-full max-w-md rounded-xl border border-subtle bg-surface/80 p-6"
        onSubmit={(event) => void onSubmit(event)}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-accent">
          MoneyMate
        </p>
        <h1 className="mt-3 text-2xl font-semibold text-main">Masuk Dashboard</h1>

        <label className="mt-6 block text-sm text-muted">
          Email
          <input
            className="mt-2 w-full rounded-lg border border-subtle bg-app px-3 py-2 text-main outline-none focus:border-emerald-400"
            onChange={(event) => setEmail(event.target.value)}
            type="email"
            value={email}
          />
        </label>
        <label className="mt-4 block text-sm text-muted">
          Password
          <input
            className="mt-2 w-full rounded-lg border border-subtle bg-app px-3 py-2 text-main outline-none focus:border-emerald-400"
            onChange={(event) => setPassword(event.target.value)}
            type="password"
            value={password}
          />
        </label>

        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}

        <button
          className="mt-6 w-full rounded-lg bg-emerald-400 px-4 py-2 font-medium text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>
      </form>
    </main>
  );
}
