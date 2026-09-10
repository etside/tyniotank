import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { PieChart, Plus, X } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useShark, fmt$, fmtTime, bidScore, type Poll } from "./store";
import { livePublish } from "./realtime";
import { toast } from "sonner";

const WKEYS = [["capital", "Capital"], ["equity", "Equity"], ["valueAdd", "Value-Add"], ["speed", "Speed of Funding"]] as const;

export default function Startup() {
  const pitches = useShark((s) => s.pitches);
  const bids = useShark((s) => s.bids);
  const configureWeights = useShark((s) => s.configureWeights);
  const goLive = useShark((s) => s.goLive);
  const resultModal = useShark((s) => s.resultModal);
  const acceptTermSheet = useShark((s) => s.acceptTermSheet);
  const polls = useShark((s) => s.polls);
  const createPoll = useShark((s) => s.createPoll);
  const closePoll = useShark((s) => s.closePoll);
  const session = useShark((s) => s.session);

  const [pollDraft, setPollDraft] = useState<{ pitchId: string; question: string; options: string[] } | null>(null);

  const mine = pitches.filter((p) => ["p1", "p3"].includes(p.id)); // founder's own pitches in demo

  const publishPoll = () => {
    if (!pollDraft) return;
    const question = pollDraft.question.trim();
    const options = pollDraft.options.map((o) => o.trim()).filter(Boolean);
    if (!question || options.length < 2) return toast.error("A question and at least 2 options are required.");
    const poll: Poll = { id: crypto.randomUUID(), pitchId: pollDraft.pitchId, question, options, votes: [], open: true, createdBy: session.name, createdAt: Date.now() };
    createPoll(poll);
    livePublish({ kind: "poll", poll });
    toast.success("Poll published to the live room");
    setPollDraft(null);
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Pitch Control Center</h1>
        <p className="mt-1 text-sm text-white/50">Configure rule weights before going live. Sliders lock when the bidding window opens.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {mine.map((p) => {
          const live = p.status === "live";
          const ranked = bids.filter((b) => b.pitchId === p.id).map((b) => ({ ...b, score: bidScore(b, p.ruleWeights, p.ask) })).sort((a, b) => b.score - a.score);
          const total = WKEYS.reduce((s, [k]) => s + p.ruleWeights[k], 0);
          return (
            <div key={p.id} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9] font-black">{p.logoLetter}</span>
                <div><p className="font-bold">{p.startup}</p><p className="text-xs text-white/50">{p.category} · {fmt$(p.ask)} for {p.equity}%</p></div>
                <span className={`ml-auto rounded-full px-2.5 py-1 text-[11px] font-bold ${live ? "bg-[#D50000]/15 text-[#FF5252]" : p.status === "scheduled" ? "bg-white/10 text-white/70" : "bg-[#00C853]/15 text-[#00C853]"}`}>{p.status.toUpperCase()}{live && ` · ${fmtTime(p.endsInSec)}`}</span>
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-white/40">Rule engine · weights {total}%</p>
              <div className="mt-2 space-y-3">
                {WKEYS.map(([k, label]) => (
                  <div key={k}>
                    <div className="flex justify-between text-xs"><span className="text-white/60">{label}</span><span className="font-bold tabular-nums">{p.ruleWeights[k]}%</span></div>
                    <Slider value={[p.ruleWeights[k]]} max={60} disabled={p.locked}
                      onValueChange={([v]) => configureWeights(p.id, { ...p.ruleWeights, [k]: v })}
                      className="mt-1" />
                  </div>
                ))}
              </div>
              {p.locked && <p className="mt-2 text-[11px] text-[#FF5252]">Locked — weights cannot change during the bidding window.</p>}
              {p.status === "scheduled" && (
                <button onClick={() => goLive(p.id)} disabled={total !== 100}
                  className="mt-4 w-full rounded-full bg-[#3B4EFA] py-2.5 text-sm font-bold disabled:opacity-40">
                  {total === 100 ? "Go Live — open bidding" : `Weights must total 100% (now ${total}%)`}
                </button>
              )}

              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-white/40">Live bid tracker</p>
              <div className="mt-2 space-y-1.5">
                <AnimatePresence>
                  {ranked.slice(0, 5).map((b, i) => (
                    <motion.div key={b.id} layout initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                      <span className="w-4 text-xs font-black text-white/40">{i + 1}</span>
                      <span className="flex-1 truncate">{b.investor}</span>
                      <span className="text-xs text-white/50">{fmt$(b.amount)} · {b.equity}%</span>
                      <span className="font-black tabular-nums text-[#0EA5E9]">{b.score}</span>
                    </motion.div>
                  ))}
                </AnimatePresence>
                {!ranked.length && <p className="text-sm text-white/40">No bids yet.</p>}
              </div>
              <p className="mt-5 text-xs font-bold uppercase tracking-widest text-white/40">Live polls</p>
              <div className="mt-2 space-y-2">
                {polls.filter((pl) => pl.pitchId === p.id).map((pl) => (
                  <div key={pl.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                    <PieChart className={`h-3.5 w-3.5 shrink-0 ${pl.open ? "text-[#00C853]" : "text-white/30"}`} />
                    <span className="flex-1 truncate">{pl.question}</span>
                    <span className="text-xs text-white/40">{pl.votes.length} votes</span>
                    {pl.open && <button onClick={() => { closePoll(pl.id); livePublish({ kind: "poll-close", pollId: pl.id }); }} className="text-[10px] font-bold uppercase text-white/40 hover:text-[#D50000]">close</button>}
                  </div>
                ))}
                <button onClick={() => setPollDraft({ pitchId: p.id, question: "", options: ["", ""] })}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-white/20 py-2 text-xs font-bold text-white/50 hover:border-[#3B4EFA] hover:text-white">
                  <Plus className="h-3.5 w-3.5" /> Create live poll
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* poll creation modal */}
      <Dialog open={!!pollDraft} onOpenChange={(o) => !o && setPollDraft(null)}>
        <DialogContent className="border-white/10 bg-[#161619] text-white">
          <DialogHeader><DialogTitle>Create live poll</DialogTitle>
            <DialogDescription className="text-white/60">Investors vote in real time inside the pitch room. Results are visible to everyone and the admin console.</DialogDescription></DialogHeader>
          {pollDraft && (
            <div className="space-y-3">
              <Input className="border-white/10 bg-white/5" placeholder="e.g. Would you lead this round?" value={pollDraft.question} onChange={(e) => setPollDraft({ ...pollDraft, question: e.target.value })} />
              {pollDraft.options.map((o, i) => (
                <div key={i} className="flex gap-2">
                  <Input className="border-white/10 bg-white/5" placeholder={`Option ${i + 1}`} value={o} onChange={(e) => setPollDraft({ ...pollDraft, options: pollDraft.options.map((x, j) => (j === i ? e.target.value : x)) })} />
                  {pollDraft.options.length > 2 && (
                    <button onClick={() => setPollDraft({ ...pollDraft, options: pollDraft.options.filter((_, j) => j !== i) })} className="rounded-lg px-2 text-white/40 hover:text-[#D50000]" aria-label="Remove option"><X className="h-4 w-4" /></button>
                  )}
                </div>
              ))}
              {pollDraft.options.length < 4 && (
                <button onClick={() => setPollDraft({ ...pollDraft, options: [...pollDraft.options, ""] })} className="text-xs font-bold text-[#0EA5E9]">+ add option</button>
              )}
              <button onClick={publishPoll} className="w-full rounded-full bg-[#3B4EFA] py-3 text-sm font-black">Publish poll</button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* instant result modal */}
      <Dialog open={!!resultModal} onOpenChange={() => acceptTermSheet()}>
        <DialogContent className="border-[#00C853]/30 bg-[#161619] text-white">
          <DialogHeader><DialogTitle className="text-[#00C853]">🏆 Instant Result — winning bid</DialogTitle>
            <DialogDescription className="text-white/60">Published at close of bidding. This is a Binding Letter of Intent (LOI), not a transfer of funds.</DialogDescription></DialogHeader>
          {resultModal && (
            <div className="rounded-xl bg-white/5 p-4">
              <p className="text-lg font-black">{resultModal.winner.investor}</p>
              <p className="text-sm text-white/70">{fmt$(resultModal.winner.amount)} for {resultModal.winner.equity}% · score {resultModal.winner.score}</p>
              {resultModal.winner.valueAdd && <p className="mt-1 text-sm text-white/60">Value-add: {resultModal.winner.valueAdd}</p>}
              <p className="mt-3 text-xs text-white/40">Actual funding requires legal due diligence, definitive agreements, and escrow release (30–60 days). Tynio Tank facilitates the connection and is not a party to the final investment agreement.</p>
            </div>
          )}
          <button onClick={acceptTermSheet} className="w-full rounded-full bg-[#00C853] py-3 text-sm font-black text-black">Accept Term Sheet</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
