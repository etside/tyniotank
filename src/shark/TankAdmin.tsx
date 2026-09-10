import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Building2, Eye, EyeOff, LayoutDashboard, ListChecks, PieChart, Plus, ShieldCheck, Trash2, Users, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useShark, fmt$ } from "./store";
import { useAccess, effectiveDeal, type ListingOverride } from "./access";
import { DEALS } from "./deals";
import { INDUSTRIES } from "./kyc";
import { MembersDirectory, VerificationQueue } from "./AdminMembers";

/* ── Login gate ── */
function Login() {
  const login = useAccess((s) => s.login);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const tryLogin = () => {
    if (!login(email.trim(), pass)) toast.error("Access denied — owner credentials required.");
  };
  return (
    <div className="mx-auto mt-10 max-w-sm space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <h1 className="flex items-center gap-2 text-xl font-extrabold"><ShieldCheck className="h-5 w-5 text-[#00C853]" /> Tank Owner Console</h1>
      <p className="text-sm text-white/50">Compliance, listings and live-control. Demo credentials: <code className="text-[#0EA5E9]">owner@tjms.com</code> / <code className="text-[#0EA5E9]">shark</code>.</p>
      <Input placeholder="owner@tjms.com" value={email} onChange={(e) => setEmail(e.target.value)} className="border-white/10 bg-white/5" />
      <Input type="password" placeholder="password" value={pass} onChange={(e) => setPass(e.target.value)} className="border-white/10 bg-white/5" onKeyDown={(e) => e.key === "Enter" && tryLogin()} />
      <Button className="w-full bg-[#3B4EFA] hover:bg-[#2f3fd6]" onClick={tryLogin}>Enter console</Button>
    </div>
  );
}

/* ── Deals management ── */
function DealsAdmin() {
  const overrides = useAccess((s) => s.overrides);
  const customDeals = useAccess((s) => s.customDeals);
  const setOverride = useAccess((s) => s.setOverride);
  const addCustomDeal = useAccess((s) => s.addCustomDeal);
  const removeCustomDeal = useAccess((s) => s.removeCustomDeal);

  const all = useMemo(() => [...DEALS, ...customDeals], [customDeals]);
  const [editing, setEditing] = useState<{ id: string; name: string; ask: number; equity: number; category: string; stage: string; tagline: string } | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", tagline: "", category: INDUSTRIES[0], stage: "Seed", ask: 500000, equity: 10, brief: "" });

  const saveEdit = () => {
    if (!editing) return;
    if (editing.ask < 1000 || editing.equity < 1 || editing.equity > 50) return toast.error("Ask ≥ $1,000 and equity 1–50%.");
    setOverride(editing.id, { name: editing.name.trim(), ask: editing.ask, equity: editing.equity, category: editing.category, stage: editing.stage, tagline: editing.tagline.trim() });
    toast.success("Deal updated");
    setEditing(null);
  };

  const create = () => {
    if (!draft.name.trim() || draft.ask < 1000 || draft.equity < 1 || draft.equity > 50) return toast.error("Name required · Ask ≥ $1,000 · Equity 1–50%.");
    const id = draft.name.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    addCustomDeal({
      id, name: draft.name.trim(), tagline: draft.tagline.trim() || draft.name.trim(),
      category: draft.category, stage: draft.stage, ask: draft.ask, equity: draft.equity,
      repo: "—", highlights: ["Verified founder", "KYC filed"],
      brief: { problem: "TBD", product: draft.brief || "TBD", traction: "TBD", market: "TBD", model: "TBD", whyNow: "TBD", risks: "TBD" },
    });
    toast.success("Custom deal created");
    setCreating(false);
    setDraft({ name: "", tagline: "", category: INDUSTRIES[0], stage: "Seed", ask: 500000, equity: 10, brief: "" });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-white/50">{all.length} listings · {customDeals.length} custom</p>
        <Button size="sm" className="bg-[#3B4EFA] hover:bg-[#2f3fd6]" onClick={() => setCreating(true)}><Plus className="h-3.5 w-3.5" /> New deal</Button>
      </div>
      {all.map((raw) => {
        const d = effectiveDeal(raw, overrides);
        const hidden = !!d.hidden;
        return (
          <div key={raw.id} className={`flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3 ${hidden ? "opacity-50" : ""}`}>
            <span className={`flex h-9 w-9 items-center justify-center rounded-lg bg-white/5 font-black ${d.custom ? "text-[#00C853]" : "text-[#0EA5E9]"}`}>{d.name.charAt(0)}</span>
            <div className="min-w-36 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold">{d.name}{d.custom && <Badge variant="outline" className="border-[#00C853]/40 text-[9px] text-[#00C853]">custom</Badge>}{d.featured && <Badge variant="outline" className="border-[#FFB300]/40 text-[9px] text-[#FFB300]">featured</Badge>}</p>
              <p className="truncate text-xs text-white/40">{d.category} · {d.stage} · {fmt$(d.ask)} for {d.equity}%</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-white/40"><EyeOff className={`h-3 w-3 ${hidden ? "text-[#D50000]" : "text-white/30"}`} />hidden</div>
            <Switch checked={!hidden} onCheckedChange={() => setOverride(raw.id, { hidden: !hidden })} aria-label={`Toggle listing ${d.name}`} />
            <Button size="sm" variant="outline" className="border-white/15" onClick={() => setEditing({ id: raw.id, name: d.name, ask: d.ask, equity: d.equity, category: d.category, stage: d.stage, tagline: d.tagline })}><Wrench className="h-3.5 w-3.5" /> Edit</Button>
            {"custom" in raw && raw.custom && (
              <Button size="sm" variant="ghost" className="text-white/40 hover:text-[#D50000]" onClick={() => { removeCustomDeal(raw.id); toast("Custom deal removed"); }}><Trash2 className="h-3.5 w-3.5" /></Button>
            )}
          </div>
        );
      })}

      {/* edit modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="border-white/10 bg-[#161616]">
          <DialogHeader><DialogTitle className="text-base">Edit deal</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/50">Name</Label><Input className="border-white/10 bg-white/5" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-white/50">Ask (USD)</Label><Input type="number" className="border-white/10 bg-white/5" value={editing.ask} onChange={(e) => setEditing({ ...editing, ask: Number(e.target.value) })} /></div>
                <div className="space-y-1.5"><Label className="text-xs text-white/50">Equity %</Label><Input type="number" className="border-white/10 bg-white/5" value={editing.equity} onChange={(e) => setEditing({ ...editing, equity: Number(e.target.value) })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><Label className="text-xs text-white/50">Category</Label><Select value={editing.category} onValueChange={(v) => setEditing({ ...editing, category: v })}><SelectTrigger className="border-white/10 bg-white/5"><SelectValue /></SelectTrigger><SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-1.5"><Label className="text-xs text-white/50">Stage</Label><Input className="border-white/10 bg-white/5" value={editing.stage} onChange={(e) => setEditing({ ...editing, stage: e.target.value })} /></div>
              </div>
              <div className="space-y-1.5"><Label className="text-xs text-white/50">Tagline</Label><Textarea rows={2} className="border-white/10 bg-white/5" value={editing.tagline} onChange={(e) => setEditing({ ...editing, tagline: e.target.value })} /></div>
              <Button className="w-full bg-[#00C853] font-bold text-black hover:bg-[#00b34a]" onClick={saveEdit}>Save changes</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* create modal */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="border-white/10 bg-[#161616]">
          <DialogHeader><DialogTitle className="text-base">Create custom deal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5"><Label className="text-xs text-white/50">Deal name</Label><Input className="border-white/10 bg-white/5" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} /></div>
            <div className="space-y-1.5"><Label className="text-xs text-white/50">Tagline</Label><Input className="border-white/10 bg-white/5" value={draft.tagline} onChange={(e) => setDraft({ ...draft, tagline: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/50">Ask (USD)</Label><Input type="number" className="border-white/10 bg-white/5" value={draft.ask} onChange={(e) => setDraft({ ...draft, ask: Number(e.target.value) })} /></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/50">Equity %</Label><Input type="number" className="border-white/10 bg-white/5" value={draft.equity} onChange={(e) => setDraft({ ...draft, equity: Number(e.target.value) })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label className="text-xs text-white/50">Category</Label><Select value={draft.category} onValueChange={(v) => setDraft({ ...draft, category: v })}><SelectTrigger className="border-white/10 bg-white/5"><SelectValue /></SelectTrigger><SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-1.5"><Label className="text-xs text-white/50">Stage</Label><Select value={draft.stage} onValueChange={(v) => setDraft({ ...draft, stage: v })}><SelectTrigger className="border-white/10 bg-white/5"><SelectValue /></SelectTrigger><SelectContent>{["Idea", "Pre-seed", "Seed", "Series A", "Growth"].map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="space-y-1.5"><Label className="text-xs text-white/50">Product summary</Label><Textarea rows={3} className="border-white/10 bg-white/5" value={draft.brief} onChange={(e) => setDraft({ ...draft, brief: e.target.value })} /></div>
            <Button className="w-full bg-[#00C853] font-bold text-black hover:bg-[#00b34a]" onClick={create}>Create deal</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ── Polls overview ── */
function PollsAdmin() {
  const polls = useShark((s) => s.polls);
  const pitches = useShark((s) => s.pitches);
  const closePoll = useShark((s) => s.closePoll);
  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">Live polls investors vote on inside pitch rooms. Closing a poll freezes results.</p>
      {polls.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">No polls yet — founders create them from Pitch Control.</p>}
      {polls.map((p) => {
        const total = Math.max(1, p.votes.length);
        return (
          <motion.div key={p.id} layout className="rounded-xl border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between gap-2">
              <p className="font-bold">{p.question}</p>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${p.open ? "bg-[#00C853]/15 text-[#00C853]" : "bg-white/10 text-white/40"}`}>{p.open ? "open" : "closed"}</span>
            </div>
            <p className="text-xs text-white/40">{pitches.find((x) => x.id === p.pitchId)?.startup ?? p.pitchId} · {p.votes.length} votes · by {p.createdBy}</p>
            <div className="mt-3 space-y-1.5">
              {p.options.map((o) => {
                const n = p.votes.filter((v) => v.option === o).length;
                return (
                  <div key={o}>
                    <div className="flex justify-between text-xs"><span className="text-white/70">{o}</span><span className="font-bold">{Math.round((n / total) * 100)}%</span></div>
                    <div className="mt-0.5 h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div className={`h-full ${n === Math.max(...p.options.map((opt) => p.votes.filter((v) => v.option === opt).length)) && n > 0 ? "bg-[#00C853]" : "bg-[#3B4EFA]"}`} initial={{ width: 0 }} animate={{ width: `${(n / total) * 100}%` }} transition={{ duration: 0.5 }} />
                    </div>
                  </div>
                );
              })}
            </div>
            {p.open && <Button size="sm" variant="outline" className="mt-3 border-white/15" onClick={() => { closePoll(p.id); toast("Poll closed"); }}>Close poll</Button>}
          </motion.div>
        );
      })}
    </div>
  );
}

/* ── Shell ── */
export default function TankAdmin() {
  const adminSession = useAccess((s) => s.adminSession);
  const pendingCount = useAccess((s) => s.verifications.filter((v) => v.status === "pending").length);

  if (!adminSession) return <Login />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight"><LayoutDashboard className="h-6 w-6 text-[#3B4EFA]" /> Tank Admin</h1>
        <p className="mt-1 text-sm text-white/50">Manual verification, member directory, live polls and deal listings.</p>
      </div>
      <Tabs defaultValue="queue" className="space-y-4">
        <TabsList className="flex-wrap border border-white/10 bg-white/[0.04]">
          <TabsTrigger value="queue" className="gap-1.5 data-[state=active]:bg-[#3B4EFA]/20"><ListChecks className="h-3.5 w-3.5" /> Queue {pendingCount > 0 && <span className="rounded-full bg-[#FFB300] px-1.5 text-[10px] font-black text-black">{pendingCount}</span>}</TabsTrigger>
          <TabsTrigger value="members" className="gap-1.5 data-[state=active]:bg-[#3B4EFA]/20"><Users className="h-3.5 w-3.5" /> Members</TabsTrigger>
          <TabsTrigger value="deals" className="gap-1.5 data-[state=active]:bg-[#3B4EFA]/20"><Building2 className="h-3.5 w-3.5" /> Deals</TabsTrigger>
          <TabsTrigger value="polls" className="gap-1.5 data-[state=active]:bg-[#3B4EFA]/20"><PieChart className="h-3.5 w-3.5" /> Polls</TabsTrigger>
        </TabsList>
        <TabsContent value="queue"><VerificationQueue /></TabsContent>
        <TabsContent value="members"><MembersDirectory /></TabsContent>
        <TabsContent value="deals"><DealsAdmin /></TabsContent>
        <TabsContent value="polls"><PollsAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}
