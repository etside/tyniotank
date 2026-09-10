import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { LogIn, LogOut, ShieldCheck, Check, X, Save, EyeOff, Eye, Plus, Trash2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEALS, ALL_CATEGORIES, type DealCategory, type Deal } from "./deals";
import { useAccess, effectiveDeal, type CustomDeal } from "./access";
import { fmt$ } from "./store";

const EMPTY_BRIEF = { problem: "", product: "", traction: "", market: "", model: "", whyNow: "", risks: "" };

function Login({ onOk }: { onOk: () => void }) {
  const login = useAccess((s) => s.login);
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const try_ = () => {
    if (login(email, pass)) { toast.success("Admin session started."); onOk(); }
    else toast.error("Invalid credentials.");
  };
  return (
    <div className="mx-auto max-w-sm rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="mb-4 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#3B4EFA]" /><h2 className="font-bold">Platform Admin</h2></div>
      <div className="space-y-3">
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="owner@tjms.com" className="border-white/10 bg-white/5 text-white" />
        <Input type="password" value={pass} onChange={(e) => setPass(e.target.value)} onKeyDown={(e) => e.key === "Enter" && try_()} placeholder="Password" className="border-white/10 bg-white/5 text-white" />
        <button onClick={try_} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#3B4EFA] py-2.5 text-sm font-bold"><LogIn className="h-4 w-4" /> Sign in</button>
      </div>
    </div>
  );
}

export default function TankAdmin() {
  const adminSession = useAccess((s) => s.adminSession);
  const logout = useAccess((s) => s.logout);
  const overrides = useAccess((s) => s.overrides);
  const customDeals = useAccess((s) => s.customDeals);
  const setOverride = useAccess((s) => s.setOverride);
  const addCustomDeal = useAccess((s) => s.addCustomDeal);
  const removeCustomDeal = useAccess((s) => s.removeCustomDeal);
  const verifications = useAccess((s) => s.verifications);
  const decideVerification = useAccess((s) => s.decideVerification);

  const [editing, setEditing] = useState<Deal | null>(null);
  const [editForm, setEditForm] = useState({ name: "", ask: "", equity: "", tagline: "", stage: "", category: "" as string });
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ id: "", name: "", tagline: "", category: "AI SaaS" as string, stage: "Idea", ask: "", equity: "", repo: "", h1: "", h2: "", ...EMPTY_BRIEF });

  if (!adminSession) return <Login onOk={() => {}} />;

  const allDeals: Deal[] = [...DEALS, ...customDeals];
  const pending = verifications.filter((v) => v.status === "pending");
  const decided = verifications.filter((v) => v.status !== "pending");

  const openEdit = (deal: Deal) => {
    const d = effectiveDeal(deal, overrides);
    setEditing(deal);
    setEditForm({ name: d.name, ask: String(d.ask), equity: String(d.equity), tagline: d.tagline, stage: d.stage, category: d.category });
  };

  const saveEdit = () => {
    if (!editing) return;
    const a = Number(editForm.ask), e = Number(editForm.equity);
    if (!a || a < 1000) return toast.error("Ask must be ≥ $1,000.");
    if (!e || e < 1 || e > 50) return toast.error("Equity must be 1–50%.");
    setOverride(editing.id, { name: editForm.name, ask: a, equity: e, tagline: editForm.tagline, stage: editForm.stage, category: editForm.category });
    toast.success(`${editForm.name} updated — live on Deal Flow.`);
    setEditing(null);
  };

  const doCreate = () => {
    const { id, name, tagline, ask, equity, h1, h2 } = createForm;
    if (!id.trim() || !name.trim()) return toast.error("ID and name required.");
    if (allDeals.some((d) => d.id === id.trim())) return toast.error("ID already exists.");
    const a = Number(ask), e = Number(equity);
    if (!a || a < 1000) return toast.error("Ask must be ≥ $1,000.");
    if (!e || e < 1 || e > 50) return toast.error("Equity must be 1–50%.");
    addCustomDeal({
      id: id.trim().toLowerCase().replace(/[^a-z0-9-]/g, "-"),
      name: name.trim(), tagline, category: createForm.category, stage: createForm.stage,
      ask: a, equity: e, repo: createForm.repo || "private",
      highlights: [h1 || "TBD", h2 || "TBD"],
      brief: { problem: createForm.problem, product: createForm.product, traction: createForm.traction, market: createForm.market, model: createForm.model, whyNow: createForm.whyNow, risks: createForm.risks },
    });
    toast.success(`${name} created — visible on Deal Flow.`);
    setCreating(false);
    setCreateForm({ id: "", name: "", tagline: "", category: "AI SaaS", stage: "Idea", ask: "", equity: "", repo: "", h1: "", h2: "", ...EMPTY_BRIEF });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1><p className="mt-1 text-sm text-white/50">{allDeals.length} deals · {customDeals.length} custom · {pending.length} verifications pending</p></div>
        <div className="flex items-center gap-2">
          <button onClick={() => setCreating(true)} className="flex items-center gap-1.5 rounded-full bg-[#00C853] px-4 py-2 text-sm font-bold text-black"><Plus className="h-4 w-4" /> New Deal</button>
          <button onClick={logout} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
        </div>
      </div>

      {/* ── verification queue ── */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <p className="border-b border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40">Verification queue · {pending.length} pending</p>
        {pending.map((v) => (
          <div key={v.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-3">
            <span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${v.role === "investor" ? "bg-[#3B4EFA]/20 text-[#8FA0FF]" : "bg-[#0EA5E9]/20 text-[#7DD3FC]"}`}>{v.role.toUpperCase()}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold">{v.name} <span className="font-normal text-white/50">· {v.entity}</span></p>
              <p className="truncate text-xs text-white/50">{v.detail}</p>
            </div>
            <button onClick={() => { decideVerification(v.id, "verified"); toast.success(`${v.name} verified.`); }} className="flex items-center gap-1 rounded-full bg-[#00C853] px-3.5 py-1.5 text-xs font-black text-black"><Check className="h-3.5 w-3.5" /> Verify</button>
            <button onClick={() => { decideVerification(v.id, "rejected"); toast.error(`${v.name} rejected.`); }} className="flex items-center gap-1 rounded-full bg-[#D50000] px-3.5 py-1.5 text-xs font-black"><X className="h-3.5 w-3.5" /> Reject</button>
          </div>
        ))}
        {!pending.length && <p className="px-5 py-6 text-center text-sm text-white/40">Queue clear.</p>}
        {decided.length > 0 && (
          <details className="px-5 py-3">
            <summary className="cursor-pointer text-xs font-semibold text-white/40">History ({decided.length})</summary>
            <div className="mt-2 space-y-1 text-xs text-white/50">
              {decided.map((v) => {
                const cls = v.status === "verified" ? "text-[#00C853]" : "text-[#FF5252]";
                return <p key={v.id}>{v.name} — <span className={cls}>{v.status}</span></p>;
              })}
            </div>
          </details>
        )}
      </section>

      {/* ── all listings ── */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <p className="border-b border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40">All deals · {allDeals.length} total · {DEALS.length} repo-based · {customDeals.length} custom</p>
        {allDeals.map((raw) => {
          const d = effectiveDeal(raw, overrides);
          const hidden = !!overrides[raw.id]?.hidden;
          const isCustom = "custom" in raw && raw.custom;
          return (
            <div key={raw.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-3">
              <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-black ${isCustom ? "bg-[#0EA5E9]" : "bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9]"}`}>{d.name[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">
                  {d.name}
                  {hidden && <span className="ml-1.5 rounded bg-[#D50000]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#FF5252]">HIDDEN</span>}
                  {isCustom && <span className="ml-1.5 rounded bg-[#0EA5E9]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#0EA5E9]">CUSTOM</span>}
                  {d.featured && <span className="ml-1.5 rounded bg-[#FFB300]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#FFB300]">FEATURED</span>}
                </p>
                <p className="truncate text-xs text-white/50">{d.category} · {d.stage} · {raw.repo}</p>
              </div>
              <span className="text-sm font-black tabular-nums text-[#0EA5E9]">{fmt$(d.ask)} <span className="text-xs font-normal text-white/40">/ {d.equity}%</span></span>
              <Link to={`/shark/deal/${raw.id}`} className="rounded-full bg-white/10 p-2" title="View public page"><ExternalLink className="h-3.5 w-3.5" /></Link>
              <button onClick={() => setOverride(raw.id, { hidden: !hidden })} className="rounded-full bg-white/10 p-2" title={hidden ? "Show" : "Hide"}>
                {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => openEdit(raw)} className="rounded-full bg-[#3B4EFA] px-3.5 py-1.5 text-xs font-bold">Edit</button>
              {isCustom && (
                <button onClick={() => { removeCustomDeal(raw.id); toast.success("Custom deal removed."); }} className="rounded-full bg-[#D50000]/20 p-2 text-[#FF5252]" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
              )}
            </div>
          );
        })}
      </section>

      {/* ── edit modal ── */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="border-white/10 bg-[#161619] text-white">
          <DialogHeader><DialogTitle>Edit listing — {editing?.name}</DialogTitle>
            <DialogDescription className="text-white/60">Changes publish instantly to the public Deal Flow and individual deal page.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <label className="block text-sm"><span className="text-white/50">Deal name</span><Input value={editForm.name} onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm"><span className="text-white/50">Ask (USD)</span><Input type="number" value={editForm.ask} onChange={(e) => setEditForm((f) => ({ ...f, ask: e.target.value }))} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
              <label className="text-sm"><span className="text-white/50">Equity (%)</span><Input type="number" value={editForm.equity} onChange={(e) => setEditForm((f) => ({ ...f, equity: e.target.value }))} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            </div>
            <label className="block text-sm"><span className="text-white/50">Category</span>
              <select value={editForm.category} onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#1b1b1f] px-3 py-2 text-sm text-white outline-none">{ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="block text-sm"><span className="text-white/50">Stage</span><Input value={editForm.stage} onChange={(e) => setEditForm((f) => ({ ...f, stage: e.target.value }))} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            <label className="block text-sm"><span className="text-white/50">Tagline</span><Input value={editForm.tagline} onChange={(e) => setEditForm((f) => ({ ...f, tagline: e.target.value }))} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
          </div>
          <button onClick={saveEdit} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00C853] py-2.5 text-sm font-black text-black"><Save className="h-4 w-4" /> Save & publish</button>
        </DialogContent>
      </Dialog>

      {/* ── create deal modal ── */}
      <Dialog open={creating} onOpenChange={setCreating}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto border-white/10 bg-[#161619] text-white">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5 text-[#00C853]" /> Create new deal</DialogTitle>
            <DialogDescription className="text-white/60">Create a business deal page visible on the Deal Flow. All fields can be edited later.</DialogDescription></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm"><span className="text-white/50">Deal ID (url-safe)</span><Input value={createForm.id} onChange={(e) => setCreateForm((f) => ({ ...f, id: e.target.value }))} placeholder="my-startup" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
              <label className="text-sm"><span className="text-white/50">Deal name</span><Input value={createForm.name} onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))} placeholder="My Startup" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            </div>
            <label className="block text-sm"><span className="text-white/50">Tagline</span><Input value={createForm.tagline} onChange={(e) => setCreateForm((f) => ({ ...f, tagline: e.target.value }))} placeholder="One-line pitch" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm"><span className="text-white/50">Category</span>
                <select value={createForm.category} onChange={(e) => setCreateForm((f) => ({ ...f, category: e.target.value }))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#1b1b1f] px-3 py-2 text-sm text-white outline-none">{ALL_CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></label>
              <label className="text-sm"><span className="text-white/50">Stage</span><Input value={createForm.stage} onChange={(e) => setCreateForm((f) => ({ ...f, stage: e.target.value }))} placeholder="Idea / MVP / Production" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm"><span className="text-white/50">Ask (USD)</span><Input type="number" value={createForm.ask} onChange={(e) => setCreateForm((f) => ({ ...f, ask: e.target.value }))} placeholder="250000" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
              <label className="text-sm"><span className="text-white/50">Equity (%)</span><Input type="number" value={createForm.equity} onChange={(e) => setCreateForm((f) => ({ ...f, equity: e.target.value }))} placeholder="10" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            </div>
            <label className="block text-sm"><span className="text-white/50">Repo / origin</span><Input value={createForm.repo} onChange={(e) => setCreateForm((f) => ({ ...f, repo: e.target.value }))} placeholder="etside/my-repo" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm"><span className="text-white/50">Highlight 1</span><Input value={createForm.h1} onChange={(e) => setCreateForm((f) => ({ ...f, h1: e.target.value }))} placeholder="Key attraction hook" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
              <label className="text-sm"><span className="text-white/50">Highlight 2</span><Input value={createForm.h2} onChange={(e) => setCreateForm((f) => ({ ...f, h2: e.target.value }))} placeholder="Second hook" className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            </div>
            {(Object.keys(EMPTY_BRIEF) as Array<keyof typeof EMPTY_BRIEF>).map((k) => (
              <label key={k} className="block text-sm"><span className="text-white/50 capitalize">{k === "whyNow" ? "Why Now" : k}</span>
                <textarea value={createForm[k]} onChange={(e) => setCreateForm((f) => ({ ...f, [k]: e.target.value }))} rows={2} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none" /></label>
            ))}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setCreating(false)} className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold">Cancel</button>
            <button onClick={doCreate} className="rounded-full bg-[#00C853] px-5 py-2 text-sm font-black text-black">Create deal</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
