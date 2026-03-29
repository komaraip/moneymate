export default function AuthLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[1.15fr_0.85fr]">
      <section className="grid-sheen relative hidden overflow-hidden border-r border-border/70 bg-[#133529] text-white lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.14),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(255,210,122,0.18),transparent_22%)]" />
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.28em] text-white/60">MoneyMate</p>
            <h1 className="max-w-xl text-5xl font-semibold leading-tight">
              Finance workflows that stay traceable from upload to approval.
            </h1>
            <p className="max-w-lg text-base text-white/72">
              Review parser output, track holdings, and keep every number linked back to its
              original document.
            </p>
          </div>
          <div className="grid gap-4">
            <div className="rounded-3xl border border-white/15 bg-white/8 p-6 backdrop-blur-sm">
              <p className="text-sm text-white/72">Built for trust</p>
              <p className="mt-2 text-2xl font-semibold">Raw + normalized records stay linked.</p>
            </div>
            <div className="rounded-3xl border border-white/15 bg-black/15 p-6 backdrop-blur-sm">
              <p className="text-sm text-white/72">Parser-first workflow</p>
              <p className="mt-2 text-base text-white/90">
                Upload a statement, review uncertain rows, then approve it into your ledger.
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="flex items-center justify-center p-6 md:p-10">{children}</section>
    </main>
  );
}

