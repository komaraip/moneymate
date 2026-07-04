import { useAuth } from "../../auth/useAuth";
import { Card } from "../../mvp/components/Card";
import { PageHeader } from "../../mvp/components/PageHeader";

export function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pengaturan"
        description="Kelola preferensi dasar akun MoneyMate lokal."
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <p className="text-sm text-zinc-400">Profil</p>
          <dl className="mt-4 space-y-3 text-sm">
            <div>
              <dt className="text-zinc-500">Nama</dt>
              <dd className="mt-1 font-medium text-white">{user?.full_name ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="mt-1 font-medium text-white">{user?.email ?? "-"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Role</dt>
              <dd className="mt-1 font-medium text-white">{user?.role ?? "-"}</dd>
            </div>
          </dl>
        </Card>

        <Card>
          <p className="text-sm text-zinc-400">Preferensi Demo</p>
          <div className="mt-4 space-y-3 text-sm leading-6 text-zinc-300">
            <p>
              Data harga dan portofolio masih berasal dari input manual/mock,
              bukan real-time.
            </p>
            <p>
              Pengaturan tema light/dark/system akan memakai halaman ini pada
              fase theme system.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
