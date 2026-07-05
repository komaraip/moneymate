import type { ReactNode } from "react";
import { BarChart3, Landmark, ShieldCheck } from "lucide-react";

type AuthSplitLayoutProps = {
  children: ReactNode;
};

export function AuthSplitLayout({ children }: AuthSplitLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-zinc-950 font-sans text-zinc-50 selection:bg-emerald-500/30">
      {/* Left Panel - Branding & Visuals */}
      <div className="relative hidden w-full flex-col justify-between overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-emerald-500 lg:flex lg:w-1/2 xl:w-[55%]">
        {/* Animated Mesh Gradient Elements */}
        <div className="pointer-events-none absolute -left-1/4 top-0 h-[500px] w-[500px] rounded-full bg-indigo-500/40 mix-blend-multiply blur-3xl filter animate-pulse" />
        <div className="pointer-events-none absolute -right-1/4 bottom-0 h-[600px] w-[600px] rounded-full bg-emerald-400/40 mix-blend-multiply blur-3xl filter animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="pointer-events-none absolute left-1/4 top-1/3 h-[400px] w-[400px] rounded-full bg-purple-500/40 mix-blend-multiply blur-3xl filter animate-pulse" style={{ animationDelay: '4s' }} />

        {/* Content Top */}
        <div className="relative z-10 p-12">
          <div className="flex items-center gap-2 text-white">
            <Landmark className="h-8 w-8" />
            <span className="text-2xl font-bold tracking-tight">MoneyMate</span>
          </div>
        </div>

        {/* Content Middle - Value Prop */}
        <div className="relative z-10 p-12">
          <h1 className="text-5xl font-extrabold leading-[1.1] text-white">
            Kelola masa depan <br />
            <span className="text-emerald-200">finansial Anda.</span>
          </h1>
          <p className="mt-6 max-w-md text-lg leading-relaxed text-indigo-100">
            Satu dasbor tangguh untuk melacak seluruh kekayaan, anggaran, dan investasi Anda. Capai kebebasan finansial dengan keputusan berbasis data.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20 text-sm font-medium text-white shadow-xl">
              <BarChart3 className="h-4 w-4 text-emerald-300" />
              Analisis Akurat
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md border border-white/20 text-sm font-medium text-white shadow-xl">
              <ShieldCheck className="h-4 w-4 text-purple-300" />
              Privasi Terjamin
            </div>
          </div>
        </div>

        {/* Content Bottom */}
        <div className="relative z-10 p-12">
          <p className="text-sm font-medium text-indigo-200">
            © {new Date().getFullYear()} MoneyMate Inc. Hak cipta dilindungi.
          </p>
        </div>
      </div>

      {/* Right Panel - Form Area */}
      <div className="flex w-full flex-col justify-center px-6 py-12 lg:w-1/2 xl:w-[45%] sm:px-12 md:px-24">
        {/* Mobile Header (Hidden on Desktop) */}
        <div className="mb-10 flex items-center gap-2 lg:hidden">
          <Landmark className="h-8 w-8 text-emerald-400" />
          <span className="text-2xl font-bold tracking-tight text-white">MoneyMate</span>
        </div>
        
        <div className="mx-auto w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
