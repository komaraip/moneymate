import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ApiError } from "../../helpers/api-client";
import { useAuth } from "../../hooks/useAuth";
import { AuthSplitLayout } from "../../components/layout/AuthSplitLayout";

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
    <AuthSplitLayout>
      <div>
        <h2 className="text-3xl font-bold text-white">Masuk Dashboard</h2>
        <p className="mt-2 text-zinc-400">Gunakan akun Anda untuk melanjutkan.</p>
      </div>

      <form
        className="mt-8 space-y-5"
        onSubmit={(event) => void onSubmit(event)}
      >
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Email
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            type="email"
            value={email}
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-zinc-300">
            Password
          </label>
          <input
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 outline-none transition-colors focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            type="password"
            value={password}
            required
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <button
          className="mt-2 w-full rounded-xl bg-gradient-to-r from-emerald-400 to-teal-400 px-4 py-3 font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 transition-all hover:scale-[1.02] hover:shadow-emerald-500/30 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          disabled={isSubmitting}
          type="submit"
        >
          {isSubmitting ? "Memproses..." : "Masuk"}
        </button>

        <p className="mt-8 text-center text-sm text-zinc-400">
          Belum punya akun? <Link to="/register" className="font-medium text-emerald-400 hover:text-emerald-300 hover:underline">Daftar sekarang</Link>
        </p>
      </form>
    </AuthSplitLayout>
  );
}
