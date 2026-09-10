import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BadgeCheck, Gavel, ShieldAlert } from "lucide-react";
import { useShark, fmt$, fmtTime, type Category, type Pitch } from "./store";

const CATS: Category[] = ["AI SaaS", "FinTech", "HealthTech", "ClimateTech"];

function PitchCard({ p }: { p: Pitch }) {
  const cats = useShark((s) => s.session.categories);
  const bidCount = useShark((s) => s.bids.filter((b) => b.pitchId === p.id).length);
  const canJoin = p.status === "live" && cats.includes(p.category);
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur transition-colors hover:border-[#3B4EFA]/50">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9] text-lg font-black">{p.logoLetter}</span>
        <div className="min-w-0">
          <p className="truncate font-bold">{p.startup}</p>
          <p className="line-clamp-1 text-sm text-white/60">{p.tagline}</p>
        </div>
        {p.status === "live" && (
          <span className="ml-auto flex items-center gap-1.5">
            {bidCount > 0 && <span className="flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[10px] font-bold text-white/70"><Gavel className="h-3 w-3 text-[#FFB300]" /> {bidCount}</span>}
            <span className="flex items-center gap-1.5 rounded-full bg-[#D50000]/15 px-2.5 py-1 text-[11px] font-bold text-[#FF5252]">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#D50000]" /> LIVE
            </span>
          </span>
        )}
        {p.status === "scheduled" && <span className="ml-auto rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-white/70">SCHEDULED</span>}
        {p.status === "completed" && <span className="ml-auto rounded-full bg-[#00C853]/15 px-2.5 py-1 text-[11px] font-semibold text-[#00C853]">COMPLETED</span>}
      </div>
      <div className="mt-4 grid grid-cols-4 gap-2 text-center">
        {[["Industry", p.category], ["Ask", fmt$(p.ask)], ["Equity", `${p.equity}%`], ["Time", p.status === "live" ? fmtTime(p.endsInSec) : "—"]].map(([k, v]) => (
          <div key={k as string} className="rounded-lg bg-white/5 py-2">
            <p className="text-[10px] uppercase tracking-wide text-white/40">{k}</p>
            <p className="text-sm font-bold">{v}</p>
          </div>
        ))}
      </div>
      {p.status === "live" ? (
        canJoin ? (
          <Link to={`/shark/room/${p.id}`} className="mt-4 block rounded-full bg-[#3B4EFA] py-2.5 text-center text-sm font-bold transition-transform hover:scale-[1.02]">Join Room</Link>
        ) : (
          <div className="mt-4">
            <button disabled className="w-full cursor-not-allowed rounded-full bg-white/10 py-2.5 text-sm font-bold text-white/40">Join Room — deposit required</button>
            <Link to="/shark/deposit" className="mt-1 block text-center text-xs text-[#0EA5E9] hover:underline">Deposit for {p.category} →</Link>
          </div>
        )
      ) : <button disabled className="mt-4 w-full cursor-not-allowed rounded-full bg-white/10 py-2.5 text-sm font-bold text-white/40">{p.status === "scheduled" ? "Opens soon" : "Bidding closed"}</button>}
    </motion.div>
  );
}

export default function Lobby() {
  const pitches = useShark((s) => s.pitches);
  const kyc = useShark((s) => s.session.kyc);
  const [active, setActive] = useState<Category | "All">("All");
  const shown = pitches.filter((p) => active === "All" || p.category === active);
  return (
    <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-white/40">Categories</p>
        <div className="flex flex-row gap-2 lg:flex-col">
          {(["All", ...CATS] as const).map((c) => (
            <button key={c} onClick={() => setActive(c)}
              className={`rounded-xl px-4 py-2.5 text-left text-sm font-semibold transition-colors ${active === c ? "bg-[#3B4EFA]" : "bg-white/5 text-white/70 hover:bg-white/10"}`}>
              {c}
            </button>
          ))}
        </div>
      </aside>
      <div>
        {kyc !== "verified" && (
          <Link to="/shark/verify" className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FFB300]/30 bg-[#FFB300]/[0.06] p-4 transition-colors hover:border-[#FFB300]/60">
            <span className="flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 shrink-0 text-[#FFB300]" />
              <span className="text-sm">
                <b>{kyc === "pending" ? "Verification under review" : "Complete investor verification"}</b>
                <span className="block text-xs text-white/50">KYC is required before deposits, bidding and room access.</span>
              </span>
            </span>
            <span className="rounded-full bg-[#FFB300] px-4 py-1.5 text-xs font-black text-black">Get verified →</span>
          </Link>
        )}
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">Investor Lobby {kyc === "verified" && <BadgeCheck className="h-5 w-5 text-[#00C853]" />}</h1>
        <p className="mt-1 text-sm text-white/50">Live pitch sessions across your deposited categories.</p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => <PitchCard key={p.id} p={p} />)}
        </div>
      </div>
    </div>
  );
}
