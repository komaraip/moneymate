const navItems = [
  "Overview",
  "Portfolio",
  "Orders",
  "Cash",
  "Instruments",
  "Asset Allocation",
  "Reports",
  "Import Data",
  "Insights",
  "Audit Log",
  "Settings",
];

const foundationItems = [
  {
    label: "Frontend",
    value: "React + Vite",
    detail: "Dashboard shell aktif",
  },
  {
    label: "Backend",
    value: "GET /healthz",
    detail: "API minimal siap dicek",
  },
  {
    label: "Database",
    value: "PostgreSQL",
    detail: "Service tersedia via Docker Compose",
  },
];

export function App() {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-zinc-800 bg-zinc-950/95 px-5 py-6 lg:block">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">
            MoneyMate
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">
            Admin Dashboard
          </h1>
        </div>

        <nav className="mt-8 space-y-1">
          {navItems.map((item, index) => (
            <button
              key={item}
              className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                index === 0
                  ? "bg-zinc-800 text-white"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
              }`}
              type="button"
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>

      <main className="lg:pl-72">
        <header className="border-b border-zinc-800 bg-zinc-950/80 px-5 py-4 backdrop-blur lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-zinc-400">Phase 1 scaffold</p>
              <h2 className="text-2xl font-semibold text-white">
                Local development foundation
              </h2>
            </div>
            <a
              className="inline-flex items-center justify-center rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-100 hover:border-emerald-400 hover:text-emerald-200"
              href={`${apiBaseUrl}/healthz`}
              rel="noreferrer"
              target="_blank"
            >
              Check backend health
            </a>
          </div>
        </header>

        <section className="px-5 py-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {foundationItems.map((item) => (
              <article
                className="rounded-xl border border-zinc-800 bg-zinc-900/70 p-5 shadow-sm"
                key={item.label}
              >
                <p className="text-sm text-zinc-400">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  {item.value}
                </p>
                <p className="mt-3 text-sm text-zinc-400">{item.detail}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-6">
            <p className="text-sm font-medium text-emerald-200">
              Scaffold only
            </p>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-300">
              Halaman ini belum memuat data finansial, auth, CRUD, import,
              laporan, atau audit log. Fase ini hanya menyiapkan struktur lokal
              agar fase backend dan frontend berikutnya bisa dibangun rapi.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
