import { useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useShark, fmt$, fmtTime, bidScore } from "./store";

const DECK = [
  { t: "Problem", b: "Support teams drown in repetitive tier-1 tickets; agents burn hours on copy-paste replies." },
  { t: "Solution", b: "An MCP-native agent layer that resolves 60% of tickets end-to-end with audit trails." },
  { t: "Traction", b: "$48K MRR, 34 paying logos, 140% NRR, 6-week payback on CAC." },
  { t: "Ask", b: "$500K for 8% — funds GTM hire + SOC2 + enterprise integrations." },
];

export default function Room() {
  const { id } = useParams();
  const pitch = useShark((s) => s.pitches.find((p) => p.id === id));
  const bids = useShark((s) => s.bids);
  const submitBid = useShark((s) => s.submitBid);
  const [amount, setAmount] = useState("");
  const [equity, setEquity] = useState("");
  const [valueAdd, setValueAdd] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [chat, setChat] = useState<{ who: string; msg: string }[]>([
    { who: "Moderator", msg: "Q&A open. Keep questions on-topic; bids are final once submitted." },
    { who: "Blue Harbor", msg: "What's your gross retention on the enterprise tier?" },
  ]);
  const [draft, setDraft] = useState("");

  const ranked = useMemo(() => {
    if (!pitch) return [];
    return bids.filter((b) => b.pitchId === pitch.id)
      .map((b) => ({ ...b, score: bidScore(b, pitch.ruleWeights, pitch.ask) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [bids, pitch]);

  if (!pitch) return <Link to="/shark" className="text-[#0EA5E9]">← Back to lobby</Link>;
  const myBid = bids.find((b) => b.mine && b.pitchId === pitch.id);

  const fire = () => {
    const r = submitBid(pitch.id, Number(amount), Number(equity), valueAdd);
    setConfirm(false);
    if (r.ok) toast.success("Bid submitted — locked. You'll be notified at close.");
    else toast.error(r.reason);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr_1fr]">
      {/* ── Left: video + Q&A ── */}
      <section className="space-y-4">
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#151B4D] to-[#3B4EFA]">
          <div className="flex aspect-video items-center justify-center">
            <div className="text-center">
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-2xl font-black backdrop-blur">{pitch.logoLetter}</span>
              <p className="mt-3 font-bold">{pitch.startup} — founder live</p>
            </div>
          </div>
          <span className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-[#D50000] px-2.5 py-1 text-[11px] font-bold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" /> WebRTC · sub-second
          </span>
          <span className="absolute right-3 top-3 rounded-full bg-black/40 px-2 py-1 text-[11px] font-mono">{fmtTime(pitch.endsInSec)}</span>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
          <p className="border-b border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white/40">Founder Q&A · moderated</p>
          <div className="max-h-48 space-y-2 overflow-y-auto p-4 text-sm">
            {chat.map((c, i) => (
              <p key={i}><span className={`font-bold ${c.who === "Moderator" ? "text-[#00C853]" : "text-[#0EA5E9]"}`}>{c.who}: </span><span className="text-white/80">{c.msg}</span></p>
            ))}
          </div>
          <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={(e) => { e.preventDefault(); if (!draft.trim()) return; setChat((c) => [...c, { who: "You", msg: draft.trim() }]); setDraft(""); }}>
            <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Ask the founder…" className="flex-1 rounded-full bg-white/5 px-4 py-2 text-sm outline-none ring-[#3B4EFA] placeholder:text-white/30 focus:ring-1" />
            <button className="rounded-full bg-[#3B4EFA] px-4 text-sm font-bold">Send</button>
          </form>
        </div>
      </section>

      {/* ── Center: deck + metrics ── */}
      <section className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {[["Ask", fmt$(pitch.ask)], ["Equity", `${pitch.equity}%`], ["Valuation", fmt$(Math.round(pitch.ask / (pitch.equity / 100)))], ["Time left", fmtTime(pitch.endsInSec)]].map(([k, v]) => (
            <div key={k} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <p className="text-[10px] uppercase tracking-widest text-white/40">{k}</p>
              <p className="mt-1 text-xl font-black tabular-nums">{v}</p>
            </div>
          ))}
        </div>
        <div className="max-h-[420px] space-y-3 overflow-y-auto rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Pitch deck</p>
          {DECK.map((d, i) => (
            <div key={d.t} className="rounded-xl bg-gradient-to-br from-white/[0.06] to-transparent p-4 ring-1 ring-white/10">
              <p className="text-[10px] font-bold text-[#0EA5E9]">SLIDE {i + 1}</p>
              <p className="font-bold">{d.t}</p>
              <p className="mt-1 text-sm text-white/70">{d.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Right: bidding panel ── */}
      <section className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
          <p className="text-xs font-bold uppercase tracking-widest text-white/40">Place bid</p>
          {myBid ? (
            <div className="mt-3 rounded-xl bg-[#00C853]/10 p-4 text-sm">
              <p className="font-bold text-[#00C853]">Bid locked ✓</p>
              <p className="mt-1 text-white/70">{fmt$(myBid.amount)} for {myBid.equity}% — {myBid.valueAdd || "no value-add"}</p>
              <p className="mt-2 text-xs text-white/40">Bids cannot be edited once submitted.</p>
            </div>
          ) : (
            <form className="mt-3 space-y-3" onSubmit={(e) => { e.preventDefault(); if (!Number(amount) || !Number(equity)) return toast.error("Enter amount and equity."); setConfirm(true); }}>
              <div className="grid grid-cols-2 gap-3">
                <label className="block"><span className="text-xs text-white/50">Amount (USD)</span>
                  <input type="number" min={1000} value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="500000" className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm font-bold tabular-nums outline-none ring-[#3B4EFA] focus:ring-1" /></label>
                <label className="block"><span className="text-xs text-white/50">Equity (%)</span>
                  <input type="number" min={1} max={50} value={equity} onChange={(e) => setEquity(e.target.value)} placeholder="8" className="mt-1 w-full rounded-lg bg-white/5 px-3 py-2 text-sm font-bold tabular-nums outline-none ring-[#3B4EFA] focus:ring-1" /></label>
              </div>
              <label className="block"><span className="text-xs text-white/50">What I bring beyond capital</span>
                <select value={valueAdd} onChange={(e) => setValueAdd(e.target.value)} className="mt-1 w-full rounded-lg bg-[#1b1b1f] px-3 py-2 text-sm outline-none ring-[#3B4EFA] focus:ring-1">
                  <option value="">— none —</option>
                  <option>Mentorship (GTM)</option><option>Distribution / channel</option><option>Compliance & licensing</option><option>Hiring network</option><option>Follow-on capital</option>
                </select></label>
              <button className="w-full rounded-full bg-[#00C853] py-3 text-sm font-black text-black transition-transform hover:scale-[1.02]">Submit Bid</button>
            </form>
          )}
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04]">
          <p className="border-b border-white/10 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-white/40">Live bids · algorithm score</p>
          <AnimatePresence>
            {ranked.map((b, i) => (
              <motion.div key={b.id} layout initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }}
                className={`flex items-center gap-3 border-b border-white/5 px-4 py-3 text-sm ${b.mine ? "bg-[#3B4EFA]/10" : ""}`}>
                <span className="w-4 text-xs font-black text-white/40">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{b.investor}{b.mine && <span className="ml-1.5 rounded bg-[#3B4EFA] px-1.5 py-0.5 text-[9px] font-bold">YOU</span>}</p>
                  <p className="text-xs text-white/50">{fmt$(b.amount)} · {b.equity}% · {b.valueAdd || "—"}</p>
                </div>
                <span className="rounded-lg bg-white/10 px-2 py-1 text-sm font-black tabular-nums text-[#0EA5E9]">{b.score}</span>
              </motion.div>
            ))}
          </AnimatePresence>
          {!ranked.length && <p className="px-4 py-6 text-center text-sm text-white/40">No bids yet.</p>}
        </div>
      </section>

      {/* ── confirmation modal ── */}
      <Dialog open={confirm} onOpenChange={setConfirm}>
        <DialogContent className="border-white/10 bg-[#161619] text-white">
          <DialogHeader><DialogTitle>Confirm bid — this is final</DialogTitle>
            <DialogDescription className="text-white/60">Bids are locked once submitted and cannot be edited. A winning bid that fails to execute the term sheet forfeits the deposit.</DialogDescription></DialogHeader>
          <div className="rounded-xl bg-white/5 p-4 text-sm">
            <p><span className="text-white/50">{pitch.startup}:</span> <b>{fmt$(Number(amount))}</b> for <b>{equity}%</b></p>
            {valueAdd && <p className="mt-1 text-white/70">Value-add: {valueAdd}</p>}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setConfirm(false)} className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold">Cancel</button>
            <button onClick={fire} className="rounded-full bg-[#00C853] px-5 py-2 text-sm font-black text-black">Lock it in</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
