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
  PiggyBank,
  Target,
  Settings,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

const navGroups = [
  {
    title: "Overview",
    items: [{ label: "Ringkasan", href: "/", icon: Gauge }],
  },
  {
    title: "Money Management",
    items: [
      { label: "Transaksi", href: "/transactions", icon: ClipboardList },
      { label: "Akun & Wallet", href: "/accounts", icon: Banknote },
      { label: "Anggaran", href: "/budgets", icon: PiggyBank },
      { label: "Tujuan Tabungan", href: "/savings-goals", icon: Target },
    ],
  },
  {
    title: "Reports",
    items: [{ label: "Laporan", href: "/reports", icon: FileText }],
  },
  {
    title: "Assets & Net Worth",
    items: [
      { label: "Portofolio", href: "/assets/portfolio", icon: BarChart3 },
      { label: "Instrumen", href: "/assets/instruments", icon: Landmark },
      { label: "Impor Data", href: "/imports", icon: Import },
    ],
  },
  {
    title: "Admin",
    adminOnly: true,
    items: [
      { label: "Admin Dashboard", href: "/admin", icon: ShieldCheck },
      { label: "Pengguna", href: "/admin/users", icon: Users },
      { label: "Log Audit", href: "/admin/audit-log", icon: History },
    ],
  },
  {
    title: "Settings",
    items: [{ label: "Pengaturan", href: "/settings", icon: Settings }],
  },
];

export function DashboardLayout() {
  const { user, logout } = useAuth();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 overflow-y-auto border-r border-zinc-800 bg-zinc-950 px-5 py-6 lg:block">
        <SidebarContent />
      </aside>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            aria-label="Tutup navigasi"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMobileNavOpen(false)}
            type="button"
          />
          <aside
            aria-label="Navigasi utama"
            className="relative z-10 flex h-full w-[min(20rem,85vw)] flex-col overflow-y-auto border-r border-zinc-800 bg-zinc-950 px-5 py-6 shadow-2xl"
            id="mobile-navigation"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <Brand />
              <button
                aria-label="Tutup navigasi"
                className="rounded-lg border border-zinc-800 p-2 text-zinc-300"
                onClick={() => setMobileNavOpen(false)}
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav onNavigate={() => setMobileNavOpen(false)} />
          </aside>
        </div>
      ) : null}

      <main className="lg:pl-72">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                aria-controls="mobile-navigation"
                aria-expanded={mobileNavOpen}
                aria-label="Buka navigasi"
                className="rounded-lg border border-zinc-800 p-2 text-zinc-300 lg:hidden"
                onClick={() => setMobileNavOpen(true)}
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
                  {user?.full_name ?? "Pengguna"}
                </p>
                <p className="text-xs uppercase text-zinc-500">
                  {roleLabel(user?.role)}
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

function SidebarContent() {
  return (
    <>
      <Brand />
      <SidebarNav />
    </>
  );
}

function Brand() {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
        MoneyMate
      </p>
      <h1 className="mt-2 text-xl font-semibold text-white">
        Personal Finance
      </h1>
    </div>
  );
}

function roleLabel(role?: string) {
  const labels: Record<string, string> = {
    admin: "Admin",
    user: "User",
  };
  return labels[role ?? "user"] ?? "User";
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { user } = useAuth();
  const groups = navGroups.filter((group) => !group.adminOnly || user?.role === "admin");
  return (
    <nav className="mt-8 space-y-6">
      {groups.map((group) => (
        <section aria-labelledby={`nav-${group.title}`} key={group.title}>
          <p
            className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-zinc-600"
            id={`nav-${group.title}`}
          >
            {group.title}
          </p>
          <div className="mt-2 space-y-1">
            {group.items.map((item) => {
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
                  onClick={onNavigate}
                  to={item.href}
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );
}
