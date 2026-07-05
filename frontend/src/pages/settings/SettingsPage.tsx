import { useAuth } from "../../hooks/useAuth";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useTheme } from "../../hooks/useTheme";

const themeOptions = [
  { label: "Sistem", value: "system" },
  { label: "Terang", value: "light" },
  { label: "Gelap", value: "dark" },
] as const;

export function SettingsPage() {
  const { user } = useAuth();
  const { mode, resolvedTheme, setMode } = useTheme();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola preferensi dasar akun MoneyMate lokal."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm text-muted">Profil</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-muted">Nama</dt>
              <dd className="mt-1 font-medium text-main">{user?.full_name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 font-medium text-main">{user?.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-muted">Role</dt>
              <dd className="mt-1 font-medium text-main">{user?.role ?? "-"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <p className="text-sm text-muted">Tema</p>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Pilihan tema">
            {themeOptions.map((option) => (
              <button
                className={`rounded-lg border px-3 py-2 text-sm transition ${
                  mode === option.value
                    ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                    : "border-subtle text-muted hover:border-emerald-500 hover:text-emerald-200"
                }`}
                key={option.value}
                onClick={() => setMode(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="mt-3 text-sm text-muted">
            Tema aktif: {resolvedTheme === "dark" ? "gelap" : "terang"}.
          </p>
        </Card>

        <Card>
          <p className="text-sm text-muted">Preferensi Demo</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-muted">
            <p>
              Data harga dan portofolio masih berasal dari input manual/mock,
              bukan real-time.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
