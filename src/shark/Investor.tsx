import { useMemo } from "react";
import { Link } from "react-router-dom";
import { BadgeCheck, ShieldAlert, ShieldCheck } from "lucide-react";
import { useShark, fmt$, bidScore } from "./store";

export default function Investor() {
  const session = useShark((s) => s.session);
  const pitches = useShark((s) => s.pitches);
  const bids = useShark((s) => s.bids);

  const rows = useMemo(() => bids.filter((b) => b.mine).map((b) => {
    const p = pitches.find((x) => x.id === b.pitchId)!;
    const ranked = bids.filter((x) => x.pitchId === p.id).map((x) => ({ ...x, score: bidScore(x, p.ruleWeights, p.ask) })).sort((a, c) => c.score - a.score);
    const top = ranked[0];
    const status = p.status === "completed" ? (top.mine ? "won" : "lost") : top.mine ? "leading" : "outbid";
    return { b, p, status };
  }), [bids, pitches]);

  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Investor Dashboard</h1><p className="mt-1 text-sm text-white/50">Escrow, active bids, and won-deal pipeline.</p></div>

      {session.kyc !== "verified" && (
        <Link to="/shark/verify" className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#FFB300]/30 bg-[#FFB300]/[0.06] p-4 transition-colors hover:border-[#FFB300]/60">
          <span className="flex items-center gap-3 text-sm">
            <ShieldAlert className="h-5 w-5 shrink-0 text-[#FFB300]" />
            <span><b>{session.kyc === "pending" ? "Verification under review" : "Identity not verified"}</b><span className="block text-xs text-white/50">Verification unlocks deposits and bidding.</span></span>
          </span>
          <span className="rounded-full bg-[#FFB300] px-4 py-1.5 text-xs font-black text-black">KYC Center →</span>
        </Link>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        {[["Escrow balance", fmt$(session.deposit), "text-[#00C853]"], ["Pending holds", fmt$(session.holds), "text-[#FFB300]"], ["Refundable", fmt$(session.deposit - session.holds), "text-[#0EA5E9]"]].map(([k, v, c]) => (
          <div key={k as string} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
            <p className="text-[10px] uppercase tracking-widest text-white/40">{k}</p>
            <p className={`mt-1 text-2xl font-black tabular-nums ${c}`}>{v}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <p className="flex items-center gap-2 border-b border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40">
          Active bids
          {session.kyc === "verified" && <span className="ml-auto flex items-center gap-1 normal-case tracking-normal text-[#00C853]"><BadgeCheck className="h-3.5 w-3.5" /> verified investor</span>}
          {session.kyc === "pending" && <span className="ml-auto flex items-center gap-1 normal-case tracking-normal text-[#FFB300]"><ShieldCheck className="h-3.5 w-3.5" /> verification pending</span>}
        </p>
        {rows.length ? rows.map(({ b, p, status }) => (
          <div key={b.id} className="flex items-center gap-3 border-b border-white/5 px-5 py-3 text-sm">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9] text-xs font-black">{p.logoLetter}</span>
            <div className="min-w-0 flex-1"><p className="truncate font-semibold">{p.startup}</p><p className="text-xs text-white/50">{fmt$(b.amount)} · {b.equity}%</p></div>
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${status === "leading" ? "bg-[#00C853]/15 text-[#00C853]" : status === "outbid" ? "bg-[#FFB300]/15 text-[#FFB300]" : status === "won" ? "bg-[#3B4EFA]/20 text-[#8FA0FF]" : "bg-white/10 text-white/50"}`}>{status.toUpperCase()}</span>
          </div>
        )) : <p className="px-5 py-8 text-center text-sm text-white/40">No bids yet. <Link to="/shark" className="text-[#0EA5E9] hover:underline">Join a room →</Link></p>}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <p className="border-b border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40">Won deals · pipeline</p>
        <div className="grid gap-3 p-5 sm:grid-cols-3">
          {[["Term sheet", "done"], ["Due diligence", "active"], ["Funding release", "todo"]].map(([k, st]) => (
            <div key={k} className={`rounded-xl p-4 ring-1 ${st === "done" ? "bg-[#00C853]/10 ring-[#00C853]/30" : st === "active" ? "bg-[#3B4EFA]/10 ring-[#3B4EFA]/40" : "bg-white/5 ring-white/10"}`}>
              <p className="text-xs font-bold uppercase tracking-wide text-white/50">{k}</p>
              <p className="mt-1 text-sm font-bold">{st === "done" ? "Signed" : st === "active" ? "In progress" : "Pending"}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
