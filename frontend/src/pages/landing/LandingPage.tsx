import { motion, useScroll, useTransform } from "framer-motion";
import { Landmark, ArrowRight, BarChart3, PiggyBank, ShieldCheck, Wallet, LineChart, Lock, ChevronRight, ClipboardList, Target } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useRef } from "react";

export function LandingPage() {
  const { user } = useAuth();
  const targetRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
    offset: ["start end", "end start"]
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 font-sans text-slate-900 selection:bg-emerald-300/40 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed left-0 right-0 top-0 z-50 flex items-center justify-between border-b border-white/40 bg-white/40 px-6 py-4 backdrop-blur-xl md:px-12 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 p-1.5 text-white shadow-sm">
            <Landmark className="h-6 w-6" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">MoneyMate</span>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <Link
              to="/dashboard"
              className="rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:bg-emerald-600 hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-0.5"
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-bold text-slate-600 transition-colors hover:text-slate-900">
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-slate-900 px-6 py-2.5 text-sm font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] transition-all hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-0.5"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative flex min-h-screen flex-col items-center justify-center pt-20 px-6 md:px-12">
        {/* Soft Vibrant Glows for Light Theme */}
        <div className="pointer-events-none absolute left-[10%] top-[20%] -z-10 h-[600px] w-[600px] rounded-full bg-emerald-300/40 blur-[100px]" />
        <div className="pointer-events-none absolute right-[10%] top-[30%] -z-10 h-[500px] w-[500px] rounded-full bg-cyan-300/40 blur-[100px]" />
        <div className="pointer-events-none absolute left-1/2 bottom-0 -z-10 h-[700px] w-[700px] -translate-x-1/2 translate-y-1/3 rounded-full bg-teal-300/30 blur-[120px]" />

        <div className="z-10 flex max-w-5xl flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-white/60 px-4 py-1.5 text-sm font-bold text-emerald-700 backdrop-blur-md shadow-sm"
          >
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            The Future of Personal Finance
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="text-6xl font-extrabold tracking-tight text-slate-900 md:text-8xl leading-[1.1]"
          >
            Track Wealth. <br />
            <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-600 bg-clip-text text-transparent drop-shadow-sm">
              Achieve Freedom.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-8 max-w-2xl text-lg text-slate-700 md:text-xl font-medium leading-relaxed"
          >
            One powerful dashboard to track every transaction, monitor your budget, and watch your portfolio grow. Stop guessing, start building wealth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="mt-12 flex flex-col sm:flex-row gap-4"
          >
            <Link
              to={user ? "/dashboard" : "/register"}
              className="group flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-4 text-base font-bold text-white shadow-[0_4px_14px_0_rgba(16,185,129,0.39)] transition-all hover:bg-emerald-600 hover:shadow-[0_6px_20px_rgba(16,185,129,0.23)] hover:-translate-y-1"
            >
              Start Free Trial
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <a
              href="#features"
              className="group flex items-center justify-center gap-2 rounded-full border border-slate-300/50 bg-white/50 px-8 py-4 text-base font-bold text-slate-700 backdrop-blur-md transition-all hover:bg-white/80 hover:text-slate-900 hover:-translate-y-1 shadow-sm"
            >
              Explore Features
            </a>
          </motion.div>
        </div>

        {/* Interactive Floating Widgets (Draggable) */}
        <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden hidden xl:block pointer-events-none">
          <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            animate={{ y: [0, -30, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute left-[12%] top-[30%] rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl backdrop-blur-xl pointer-events-auto cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 shadow-sm">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Total Net Worth</p>
                <p className="text-xl font-extrabold text-slate-900">$142,500.00</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            drag
            dragConstraints={{ left: -100, right: 100, top: -100, bottom: 100 }}
            animate={{ y: [0, 40, 0] }}
            transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute right-[12%] top-[45%] rounded-2xl border border-white/60 bg-white/70 p-5 shadow-xl backdrop-blur-xl pointer-events-auto cursor-grab active:cursor-grabbing"
          >
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-200 text-cyan-700 shadow-sm">
                <LineChart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-500">Monthly Returns</p>
                <p className="text-xl font-extrabold text-emerald-600">+12.4%</p>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Statistics Banner */}
      <div className="border-y border-white/40 bg-white/40 py-12 backdrop-blur-md shadow-sm">
        <div className="mx-auto max-w-7xl px-6 md:px-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <p className="text-4xl font-black text-slate-900">10K+</p>
              <p className="mt-2 text-sm font-bold text-slate-600">Active Users</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <p className="text-4xl font-black text-emerald-600">$500M</p>
              <p className="mt-2 text-sm font-bold text-slate-600">Wealth Tracked</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <p className="text-4xl font-black text-slate-900">99.9%</p>
              <p className="mt-2 text-sm font-bold text-slate-600">Uptime</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }}>
              <p className="text-4xl font-black text-cyan-600">24/7</p>
              <p className="mt-2 text-sm font-bold text-slate-600">Secure Sync</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* How it Works Section */}
      <section className="py-32 px-6 md:px-12 relative overflow-hidden bg-white/30" ref={targetRef}>
        <div className="pointer-events-none absolute right-0 top-1/2 -z-10 h-[500px] w-[500px] -translate-y-1/2 rounded-full bg-emerald-200/40 blur-[100px]" />
        
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 md:text-5xl">How MoneyMate Works</h2>
            <p className="mt-6 text-xl font-medium text-slate-600 max-w-2xl mx-auto">Three simple steps to take total control of your financial destiny.</p>
          </div>

          <div className="grid gap-12 md:grid-cols-3">
            {[
              { title: "1. Connect", desc: "Easily input your bank accounts, cash, and investment portfolios into one secure vault.", icon: Wallet, color: "text-emerald-600", bg: "bg-emerald-100", shadow: "shadow-emerald-200" },
              { title: "2. Track", desc: "Monitor your expenses and income with precision. Set budgets that actually work for you.", icon: BarChart3, color: "text-teal-600", bg: "bg-teal-100", shadow: "shadow-teal-200" },
              { title: "3. Grow", desc: "Watch your net worth expand over time with beautiful, interactive data visualizations.", icon: LineChart, color: "text-cyan-600", bg: "bg-cyan-100", shadow: "shadow-cyan-200" }
            ].map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7, delay: idx * 0.2 }}
                className="relative flex flex-col items-center text-center"
              >
                <div className={`mb-8 flex h-24 w-24 items-center justify-center rounded-3xl ${step.bg} ${step.color} shadow-lg ${step.shadow} ring-1 ring-black/5`}>
                  <step.icon className="h-10 w-10" />
                </div>
                <h3 className="mb-4 text-2xl font-extrabold text-slate-900">{step.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{step.desc}</p>
                {idx < 2 && (
                  <ChevronRight className="absolute -right-6 top-10 hidden h-8 w-8 text-slate-300 md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 md:px-12 bg-white/60 backdrop-blur-lg">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-extrabold text-slate-900 md:text-5xl">Everything You Need</h2>
            <p className="mt-6 text-xl font-medium text-slate-600 max-w-2xl mx-auto">Stop using spreadsheets. MoneyMate provides professional tools built for personal wealth.</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[
              { title: "Smart Transactions", desc: "Categorize and analyze every penny you spend with our advanced ledger system.", icon: ClipboardList, glow: "hover:shadow-emerald-200", iconBg: "bg-emerald-100 text-emerald-600" },
              { title: "Budget Planning", desc: "Set strict limits on your spending and receive real-time updates on your remaining allowance.", icon: PiggyBank, glow: "hover:shadow-teal-200", iconBg: "bg-teal-100 text-teal-600" },
              { title: "Bank-grade Security", desc: "Your financial data is encrypted and stored securely. We never sell your data to third parties.", icon: ShieldCheck, glow: "hover:shadow-cyan-200", iconBg: "bg-cyan-100 text-cyan-600" },
              { title: "Portfolio Tracking", desc: "Add stocks, crypto, and real estate. Track their live performance all in one place.", icon: BarChart3, glow: "hover:shadow-emerald-200", iconBg: "bg-emerald-100 text-emerald-600" },
              { title: "Savings Goals", desc: "Planning a vacation or buying a house? Set targets and watch your progress bar fill up.", icon: Target, glow: "hover:shadow-teal-200", iconBg: "bg-teal-100 text-teal-600" },
              { title: "Privacy First", desc: "MoneyMate uses strict CSP headers, rate-limiting, and advanced CSRF protection to keep you safe.", icon: Lock, glow: "hover:shadow-cyan-200", iconBg: "bg-cyan-100 text-cyan-600" }
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -8, scale: 1.02 }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4 }}
                className={`group rounded-3xl border border-white bg-white/80 p-8 shadow-md transition-all hover:shadow-xl ${feature.glow}`}
              >
                <div className={`mb-6 inline-flex rounded-2xl ${feature.iconBg} p-4 ring-1 ring-black/5`}>
                  <feature.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-xl font-extrabold text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 font-medium leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-32 px-6 md:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-500 opacity-10" />
        <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-300/30 blur-[100px]" />
        
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative mx-auto max-w-4xl text-center z-10 rounded-3xl border border-white/50 bg-white/60 p-12 md:p-20 backdrop-blur-xl shadow-2xl"
        >
          <h2 className="text-4xl font-black text-slate-900 md:text-6xl tracking-tight">Ready to transform your finances?</h2>
          <p className="mt-6 text-xl font-bold text-slate-600">Join thousands of users who are already mastering their wealth with MoneyMate.</p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto rounded-full bg-slate-900 px-10 py-5 text-lg font-bold text-white shadow-[0_4px_14px_0_rgba(0,0,0,0.39)] transition-all hover:bg-slate-800 hover:shadow-[0_6px_20px_rgba(0,0,0,0.23)] hover:-translate-y-1"
            >
              Create Free Account
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 bg-white/30 backdrop-blur-md py-12 text-center text-slate-500">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Landmark className="h-5 w-5 text-emerald-500" />
          <span className="font-extrabold text-slate-700">MoneyMate</span>
        </div>
        <p className="font-medium">© {new Date().getFullYear()} MoneyMate Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
