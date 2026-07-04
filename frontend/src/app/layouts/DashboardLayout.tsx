import {
  Banknote,
  BarChart3,
  ClipboardList,
  FileText,
  Gauge,
  History,
  Import,
  Landmark,
  LogOut,
  Menu,
} from "lucide-react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";

const navItems = [
  { label: "Overview", href: "/", icon: Gauge },
  { label: "Portfolio", href: "/portfolio", icon: BarChart3 },
  { label: "Orders", href: "/orders", icon: ClipboardList },
  { label: "Cash", href: "/cash", icon: Banknote },
  { label: "Instruments", href: "/instruments", icon: Landmark },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Import Data", href: "/import-data", icon: Import },
  { label: "Audit Log", href: "/audit-log", icon: History },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-800 bg-zinc-950 px-5 py-6 lg:block">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            MoneyMate
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">
            Admin Dashboard
          </h1>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
                  }`
                }
                end={item.href === "/"}
                key={item.href}
                to={item.href}
              >
                <Icon aria-hidden="true" className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                aria-label="Buka navigasi"
                className="rounded-lg border border-zinc-800 p-2 text-zinc-300 lg:hidden"
                type="button"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <p className="text-sm text-zinc-400">Data bukan real-time</p>
                <h2 className="text-xl font-semibold text-white">
                  Dashboard Keuangan
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium text-white">
                  {user?.full_name ?? "Owner"}
                </p>
                <p className="text-xs uppercase text-zinc-500">
                  {user?.role ?? "owner"}
                </p>
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-800 px-3 py-2 text-sm text-zinc-300 hover:border-emerald-500 hover:text-emerald-200"
                onClick={() => void logout()}
                type="button"
              >
                <LogOut className="h-4 w-4" />
                Keluar
              </button>
            </div>
          </div>
        </header>

        <section className="px-5 py-6 lg:px-8">
          <Outlet />
        </section>

        <footer className="px-5 pb-6 text-xs leading-5 text-zinc-500 lg:px-8">
          MoneyMate membantu mencatat dan menganalisis data keuangan pribadi.
          Informasi di aplikasi ini bukan nasihat keuangan atau rekomendasi
          investasi.
        </footer>
      </main>
    </div>
  );
}
