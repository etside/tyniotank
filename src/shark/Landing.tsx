import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Radio, Gavel, ShieldCheck, FileSignature, ArrowRight, Zap, Users, TrendingUp, Clock } from "lucide-react";
import { useShark } from "./store";

const NodeLogo = ({ className = "w-10 h-10" }: { className?: string }) => (
  <svg viewBox="0 0 26 26" fill="none" className={className} aria-hidden="true">
    <circle cx="13" cy="5" r="3.4" fill="#3B4EFA" />
    <circle cx="5.5" cy="19" r="3.4" fill="#3B4EFA" />
    <circle cx="20.5" cy="19" r="3.4" fill="#0EA5E9" />
    <path d="M13 8.5L6 16M13 8.5l7 7.5M8.5 19h9" stroke="#3B4EFA" strokeWidth="1.7" strokeLinecap="round" />
  </svg>
);

const features = [
  { icon: Radio, title: "Live Pitches", desc: "Founders present to a room of verified investors. Real video, real Q&A, real time." },
  { icon: Gavel, title: "Atomic Bidding", desc: "One bid, locked in. Algorithm-scored by capital, equity, value-add, and speed — not just amount." },
  { icon: ShieldCheck, title: "Escrow Protection", desc: "Deposits held, not captured. Funds release only on deal close. Auto-refund if you win nothing." },
  { icon: FileSignature, title: "NDA-Gated Deals", desc: "Confidential briefs behind KYC verification and e-signed NDAs. Investor-grade access control." },
];

const stats = [
  { value: "21", label: "Active deals", icon: TrendingUp },
  { value: "< 1s", label: "Bid latency", icon: Zap },
  { value: "12", label: "Categories", icon: Users },
  { value: "4-step", label: "KYC onboarding", icon: Clock },
];

export default function Landing() {
  const navigate = useNavigate();
  const setRole = useShark((s) => s.setRole);
  const session = useShark((s) => s.session);
  const [hoveredRole, setHoveredRole] = useState<"investor" | "founder" | null>(null);

  const chooseRole = (role: "investor" | "founder") => {
    setRole(role);
    navigate(role === "investor" ? "/shark/deposit" : "/shark/startup");
  };

  return (
    <div className="min-h-screen bg-[#111] text-white font-sans overflow-x-hidden">
      {/* ── minimal top bar ── */}
      <header className="fixed top-0 z-50 w-full border-b border-white/[0.06] bg-[#111]/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2 font-extrabold tracking-tight">
            <NodeLogo className="w-6 h-6" />
            <span>Tynio<span className="text-[#3B4EFA]">Tank</span></span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-white/60 md:flex">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how" className="hover:text-white transition-colors">How it works</a>
            <a href="/shark/legal" className="hover:text-white transition-colors">Legal</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/shark")} className="rounded-full bg-white/[0.06] px-4 py-1.5 text-sm font-semibold text-white/80 hover:bg-white/10 transition-colors">Sign in</button>
          </div>
        </div>
      </header>

      {/* ── hero ── */}
      <section className="relative flex min-h-screen items-center justify-center px-6 pt-14">
        {/* background glow */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#3B4EFA]/[0.07] blur-[120px]" />
          <div className="absolute right-1/4 bottom-1/4 h-[300px] w-[300px] rounded-full bg-[#0EA5E9]/[0.05] blur-[100px]" />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-4 py-1.5 text-xs font-semibold text-white/60">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00C853]" />
              Live pitches happening now
            </div>

            <h1 className="text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Where capital meets
              <br />
              <span className="bg-gradient-to-r from-[#3B4EFA] to-[#0EA5E9] bg-clip-text text-transparent">conviction</span>
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/50">
              Startups pitch live. Investors bid in real-time. Escrow protects both sides.
              One platform for the entire deal lifecycle — from first pitch to signed term sheet.
            </p>
          </motion.div>

          {/* ── role-based CTAs ── */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <button onClick={() => chooseRole("investor")}
              onMouseEnter={() => setHoveredRole("investor")} onMouseLeave={() => setHoveredRole(null)}
              className={`group relative flex items-center gap-3 rounded-2xl px-8 py-4 text-lg font-bold transition-all duration-300 ${
                hoveredRole === "investor" ? "bg-[#3B4EFA] shadow-[0_0_40px_rgba(59,78,250,0.3)] scale-[1.02]" : "bg-[#3B4EFA]/90"
              }`}>
              <ShieldCheck className="h-5 w-5" />
              I'm an Investor
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button onClick={() => chooseRole("founder")}
              onMouseEnter={() => setHoveredRole("founder")} onMouseLeave={() => setHoveredRole(null)}
              className={`group flex items-center gap-3 rounded-2xl border px-8 py-4 text-lg font-bold transition-all duration-300 ${
                hoveredRole === "founder" ? "border-[#00C853] bg-[#00C853]/10 shadow-[0_0_40px_rgba(0,200,83,0.15)] scale-[1.02]" : "border-white/20 bg-white/[0.04]"
              }`}>
              <Zap className="h-5 w-5" />
              I'm a Founder
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
            className="mt-4 text-xs text-white/30">
            {session.role === "investor" ? "Returning investor?" : session.role === "founder" ? "Returning founder?" : "Already have an account?"}
            <button onClick={() => navigate("/shark")} className="ml-1 text-[#0EA5E9] hover:underline">Go to dashboard →</button>
          </motion.p>
        </div>
      </section>

      {/* ── stats bar ── */}
      <section className="border-y border-white/[0.06] bg-white/[0.02]">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-6 px-6 py-10 md:grid-cols-4">
          {stats.map(({ value, label, icon: Icon }, i) => (
            <motion.div key={label} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.06]"><Icon className="h-4 w-4 text-[#0EA5E9]" /></div>
              <div>
                <p className="text-xl font-black tabular-nums">{value}</p>
                <p className="text-xs text-white/40">{label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── features ── */}
      <section id="features" className="px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
            className="text-center text-xs font-bold uppercase tracking-[0.2em] text-[#3B4EFA]">The platform</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-3 text-center text-3xl font-extrabold tracking-tight sm:text-4xl">Built for deal velocity</motion.h2>

          <div className="mt-14 grid gap-5 sm:grid-cols-2">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div key={title} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="group rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur transition-all hover:border-[#3B4EFA]/30 hover:bg-white/[0.05]">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#3B4EFA]/10">
                  <Icon className="h-5 w-5 text-[#3B4EFA]" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── how it works ── */}
      <section id="how" className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-24">
        <div className="mx-auto max-w-4xl">
          <motion.h2 initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-center text-3xl font-extrabold tracking-tight">Three steps to a deal</motion.h2>

          <div className="mt-14 space-y-8">
            {[
              { n: "01", title: "Deposit & verify", desc: "Choose your category, fund your escrow wallet, complete KYC. Funds are held — never captured — until a deal closes.", cta: "Start deposit", route: "/shark/deposit" },
              { n: "02", title: "Join a live pitch", desc: "Watch founders present in real-time. Ask questions in the moderated Q&A. Review the pitch deck alongside the video stream.", cta: "Browse pitches", route: "/shark" },
              { n: "03", title: "Bid with conviction", desc: "One bid, locked in. Declare your capital, equity ask, and value-add. The algorithm scores every bid — highest score wins, not highest amount.", cta: "See deal flow", route: "/shark/deals" },
            ].map(({ n, title, desc, cta, route }, i) => (
              <motion.div key={n} initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }}
                className="flex gap-6">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#3B4EFA]/10 font-mono text-lg font-black text-[#3B4EFA]">{n}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/50">{desc}</p>
                  <button onClick={() => navigate(route)} className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-[#0EA5E9] hover:underline">
                    {cta} <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight">Ready to move capital?</h2>
          <p className="mt-3 text-white/50">Join verified investors and ambitious founders on the platform built for deal velocity.</p>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => chooseRole("investor")} className="flex items-center gap-2 rounded-full bg-[#3B4EFA] px-8 py-3.5 font-bold transition-transform hover:scale-[1.02]">
              <ShieldCheck className="h-4 w-4" /> Start as Investor
            </button>
            <button onClick={() => chooseRole("founder")} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/[0.04] px-8 py-3.5 font-bold transition-transform hover:scale-[1.02]">
              <Zap className="h-4 w-4" /> Start as Founder
            </button>
          </div>
        </div>
      </section>

      {/* ── footer ── */}
      <footer className="border-t border-white/[0.06] bg-white/[0.02] px-6 py-10">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <NodeLogo className="w-5 h-5" />
            <span className="text-sm font-bold">Tynio<span className="text-[#3B4EFA]">Tank</span></span>
          </div>
          <nav className="flex flex-wrap justify-center gap-6 text-xs text-white/40">
            <a href="/shark/legal" className="hover:text-white transition-colors">Terms</a>
            <a href="/shark/legal" className="hover:text-white transition-colors">Privacy</a>
            <a href="/shark/legal" className="hover:text-white transition-colors">Risk Disclosure</a>
            <a href="/shark/legal" className="hover:text-white transition-colors">KYC Policy</a>
            <a href="/shark/deals" className="hover:text-white transition-colors">Deal Flow</a>
          </nav>
          <p className="text-xs text-white/20">&copy; {new Date().getFullYear()} Tynio Tank. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
