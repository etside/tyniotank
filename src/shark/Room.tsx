import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Gavel, MessageSquare, PieChart, Play, Send, ShieldCheck, Sparkles, TrendingUp, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useShark, fmt$, type ChatMsg } from "./store";
import { livePublish } from "./realtime";
import { useAccess, effectiveDeal } from "./access";
import { DEALS } from "./deals";

const SLIDES: Record<string, { label: string; metric: string; value: string }[]> = {
  p1: [
    { label: "Problem", metric: "analysts still reconcile by hand", value: "6.5 hrs/week" },
    { label: "Product", metric: "AI reconciliation across 40+ ledgers", value: "99.2% match rate" },
    { label: "Traction", metric: "ARR growth since launch", value: "+28% MoM" },
    { label: "Market", metric: "SMB finance automation TAM", value: "$19.4B" },
  ],
};
const FALLBACK_SLIDES = [
  { label: "Problem", metric: "status quo is slow and manual", value: "3× cost" },
  { label: "Product", metric: "shipping weekly, iterating live", value: "v3 live" },
  { label: "Traction", metric: "paying users since launch", value: "+40% MoM" },
  { label: "Why now", metric: "category inflection", value: "2026" },
];

export default function Room() {
  const { id = "p1" } = useParams();
  const pitch = useShark((s) => s.pitches.find((p) => p.id === id));
  const session = useShark((s) => s.session);
  const bids = useShark((s) => s.bids);
  const chat = useShark((s) => s.chat[id] ?? []);
  const polls = useShark((s) => s.polls.filter((p) => p.pitchId === id));
  const submitBid = useShark((s) => s.submitBid);
  const addChat = useShark((s) => s.addChat);
  const votePoll = useShark((s) => s.votePoll);

  const overrides = useAccess((s) => s.overrides);
  const deal = useMemo(() => {
    const raw = DEALS.find((d) => d.id === id);
    return raw ? effectiveDeal(raw, overrides) : null;
  }, [id, overrides]);

  const [amount, setAmount] = useState(50000);
  const [equity, setEquity] = useState(10);
  const [valueAdd, setValueAdd] = useState("");
  const [draft, setDraft] = useState("");

  if (!pitch) return <p className="text-white/50">Pitch not found.</p>;
  const slides = SLIDES[id] ?? FALLBACK_SLIDES;
  const pitchBids = bids.filter((b) => b.pitchId === id).sort((a, b) => b.amount - a.amount);

  const canBid = session.kyc === "verified" && session.categories.includes(pitch.category);
  const minAsk = Math.round(pitch.ask * 0.05);

  const fire = () => {
    const r = submitBid(id, amount, equity, valueAdd.trim());
    if (!r.ok) return toast.error(r.reason);
    if (r.bid) livePublish({ kind: "bid", bid: r.bid });
    toast.success(`Bid submitted — ${fmt$(amount)} for ${equity}%`);
    setValueAdd("");
  };

  const send = () => {
    const msg = draft.trim();
    if (!msg) return;
    const m: ChatMsg = { id: crypto.randomUUID(), pitchId: id, who: session.name, msg, at: Date.now(), mine: true };
    addChat(m);
    livePublish({ kind: "chat", msg: m });
    setDraft("");
  };

  const myPollVote = (pollId: string) => useShark.getState().polls.find((p) => p.id === pollId)?.votes.some((v) => v.voter === session.name);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
            {pitch.startup}
            <span className="flex items-center gap-1.5 rounded-full bg-[#D50000]/15 px-2.5 py-1 text-[10px] font-black uppercase text-[#ff5c5c]"><span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#D50000]" /> live</span>
          </h1>
          <p className="text-sm text-white/50">{pitch.category} · asking {fmt$(pitch.ask)} for {pitch.equity}%</p>
        </div>
        {deal && <Badge variant="outline" className="border-[#3B4EFA]/40 bg-[#3B4EFA]/10 text-[#8b9bff]">listed deal</Badge>}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        {/* stage + tabs */}
        <div className="space-y-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#1a1c33] via-[#141420] to-black">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#3B4EFA]/20 ring-1 ring-[#3B4EFA]/50"><Play className="h-7 w-7 fill-white text-white" /></span>
              <p className="text-sm font-bold">{pitch.startup} pitching live</p>
              <p className="text-xs text-white/40">HD · low-latency · recorded for compliance</p>
            </div>
            <div className="absolute left-3 top-3 flex items-center gap-2 rounded-full bg-black/50 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-white/70"><Users className="h-3 w-3 text-[#0EA5E9]" /> {12 + pitchBids.length * 2} in room</div>
          </div>

          <Tabs defaultValue="deck">
            <TabsList className="border border-white/10 bg-white/[0.04]">
              <TabsTrigger value="deck" className="data-[state=active]:bg-[#3B4EFA]/20"><Sparkles className="mr-1.5 h-3.5 w-3.5" />Pitch deck</TabsTrigger>
              <TabsTrigger value="qa" className="data-[state=active]:bg-[#3B4EFA]/20"><MessageSquare className="mr-1.5 h-3.5 w-3.5" />Q&A {chat.length > 0 && <span className="ml-1 text-[10px] text-white/40">{chat.length}</span>}</TabsTrigger>
              <TabsTrigger value="polls" className="data-[state=active]:bg-[#3B4EFA]/20"><PieChart className="mr-1.5 h-3.5 w-3.5" />Polls {polls.length > 0 && <span className="ml-1 text-[10px] text-white/40">{polls.length}</span>}</TabsTrigger>
            </TabsList>

            <TabsContent value="deck" className="mt-3">
              <div className="grid gap-3 sm:grid-cols-2">
                {slides.map((s, i) => (
                  <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#0EA5E9]">{s.label}</p>
                    <p className="mt-1 text-lg font-extrabold">{s.value}</p>
                    <p className="text-xs text-white/40">{s.metric}</p>
                  </motion.div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="qa" className="mt-3">
              <div className="flex h-72 flex-col rounded-xl border border-white/10 bg-white/[0.04]">
                <div className="flex-1 space-y-2.5 overflow-y-auto p-3">
                  {chat.length === 0 && <p className="p-4 text-center text-sm text-white/40">No questions yet — open the floor.</p>}
                  <AnimatePresence initial={false}>
                    {chat.map((m) => (
                      <motion.div key={m.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${m.mine ? "ml-auto bg-[#3B4EFA]/20" : "bg-black/30"}`}>
                        <p className={`text-[10px] font-black uppercase tracking-wider ${m.who === "Moderator" ? "text-[#FFB300]" : m.mine ? "text-[#8b9bff]" : "text-[#0EA5E9]"}`}>{m.who}</p>
                        <p className="text-white/85">{m.msg}</p>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
                <div className="flex gap-2 border-t border-white/10 p-2">
                  <Input className="border-white/10 bg-white/5" placeholder="Ask the founder…" value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
                  <Button size="icon" className="bg-[#3B4EFA] hover:bg-[#2f3fd6]" onClick={send} aria-label="Send"><Send className="h-4 w-4" /></Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="polls" className="mt-3 space-y-3">
              {polls.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">No polls for this pitch yet — founders create them from Pitch Control.</p>}
              {polls.map((p) => {
                const voted = myPollVote(p.id);
                const total = Math.max(1, p.votes.length);
                return (
                  <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
                    <p className="font-bold">{p.question}</p>
                    <p className="text-xs text-white/40">{p.open ? (voted ? `You voted · ${p.votes.length} total votes` : `${p.votes.length} votes so far`) : `Closed · ${p.votes.length} votes`}</p>
                    {p.open && !voted ? (
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {p.options.map((o) => (
                          <Button key={o} variant="outline" className="border-white/15 hover:border-[#3B4EFA] hover:bg-[#3B4EFA]/15" onClick={() => { votePoll(p.id, o, session.name); livePublish({ kind: "vote", pollId: p.id, option: o, voter: session.name }); toast(`Voted: ${o}`); }}>{o}</Button>
                        ))}
                      </div>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {p.options.map((o) => {
                          const n = p.votes.filter((v) => v.option === o).length;
                          return (
                            <div key={o}>
                              <div className="flex justify-between text-xs"><span className="text-white/70">{o}</span><span className="font-bold">{Math.round((n / total) * 100)}%</span></div>
                              <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/10">
                                <motion.div className="h-full bg-[#3B4EFA]" initial={{ width: 0 }} animate={{ width: `${(n / total) * 100}%` }} transition={{ duration: 0.5 }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </TabsContent>
          </Tabs>
        </div>

        {/* bid panel */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-white/60"><Gavel className="h-4 w-4 text-[#FFB300]" /> Submit bid</h3>
            <p className="mt-1 text-xs text-white/40">Escrow {fmt$(session.deposit)} · holds {fmt$(session.holds)}{!session.categories.includes(pitch.category) && ` · no ${pitch.category} deposit`}</p>
            {session.kyc !== "verified" ? (
              <div className="mt-3 rounded-xl border border-[#FFB300]/30 bg-[#FFB300]/10 p-3 text-xs text-[#FFB300]">
                KYC verification required. <Link to="/shark/verify" className="font-bold underline">Get verified →</Link>
              </div>
            ) : !session.categories.includes(pitch.category) ? (
              <div className="mt-3 rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 p-3 text-xs text-[#7dd3fc]">
                Deposit into <b>{pitch.category}</b> to unlock this room. <Link to="/shark/deposit" className="font-bold underline">Deposit →</Link>
              </div>
            ) : (
              <div className="mt-3 space-y-3">
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Amount (min {fmt$(minAsk)})</span>
                  <Input type="number" className="mt-1 border-white/10 bg-white/5" value={amount} min={minAsk} onChange={(e) => setAmount(Number(e.target.value))} />
                </label>
                <label className="block">
                  <span className="text-[10px] font-black uppercase tracking-widest text-white/40">Equity % (1–50)</span>
                  <Input type="number" className="mt-1 border-white/10 bg-white/5" value={equity} min={1} max={50} onChange={(e) => setEquity(Number(e.target.value))} />
                </label>
                <Textarea rows={2} className="border-white/10 bg-white/5" placeholder="What do you bring beyond capital?" value={valueAdd} onChange={(e) => setValueAdd(e.target.value)} />
                <Button className="w-full bg-[#00C853] font-black text-black hover:bg-[#00b34a]" onClick={fire} disabled={amount < minAsk || equity < 1 || equity > 50 || amount > session.deposit - session.holds}>
                  <TrendingUp className="h-4 w-4" /> Fire bid · {fmt$(amount)} for {equity}%
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-4">
            <h3 className="text-sm font-black uppercase tracking-widest text-white/60">Live bid feed</h3>
            <div className="mt-2 space-y-2">
              {pitchBids.length === 0 && <p className="py-3 text-center text-xs text-white/40">No bids yet — be the first.</p>}
              <AnimatePresence initial={false}>
                {pitchBids.map((b) => (
                  <motion.div key={b.id} layout initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className={`flex items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${b.mine ? "border border-[#3B4EFA]/40 bg-[#3B4EFA]/10" : "bg-black/30"}`}>
                    <span className="flex items-center gap-1.5 font-semibold">{b.investor}{b.investor !== session.name && <BadgeCheck className="h-3.5 w-3.5 text-[#00C853]" />}</span>
                    <span className="text-xs font-bold">{fmt$(b.amount)} · {b.equity}%</span>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/40">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#00C853]" />
            Bids sit in escrow until the founder accepts a term sheet. Atomic settlement, no backroom deals.
          </div>
        </div>
      </div>
    </div>
  );
}
