import { useState } from "react";
import { toast } from "sonner";
import { LogIn, LogOut, ShieldCheck, Check, X, Save, EyeOff, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEALS } from "./deals";
import { useAccess, effectiveDeal } from "./access";
import { fmt$ } from "./store";

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

export default function Admin() {
  const adminSession = useAccess((s) => s.adminSession);
  const logout = useAccess((s) => s.logout);
  const overrides = useAccess((s) => s.overrides);
  const setOverride = useAccess((s) => s.setOverride);
  const verifications = useAccess((s) => s.verifications);
  const decideVerification = useAccess((s) => s.decideVerification);
  const [editing, setEditing] = useState<string | null>(null);
  const [ask, setAsk] = useState(""); const [equity, setEquity] = useState("");
  const [tagline, setTagline] = useState(""); const [stage, setStage] = useState("");

  if (!adminSession) return <Login onOk={() => {}} />;

  const openEdit = (id: string) => {
    const d = effectiveDeal(DEALS.find((x) => x.id === id)!, overrides);
    setEditing(id); setAsk(String(d.ask)); setEquity(String(d.equity)); setTagline(d.tagline); setStage(d.stage);
  };
  const saveEdit = () => {
    if (!editing) return;
    const a = Number(ask), e = Number(equity);
    if (!a || a < 1000) return toast.error("Ask must be ≥ $1,000.");
    if (!e || e < 1 || e > 50) return toast.error("Equity must be 1–50%.");
    setOverride(editing, { ask: a, equity: e, tagline, stage, hidden: overrides[editing]?.hidden });
    toast.success("Listing updated — live on Deal Flow.");
    setEditing(null);
  };

  const pending = verifications.filter((v) => v.status === "pending");
  const decided = verifications.filter((v) => v.status !== "pending");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Admin Panel</h1><p className="mt-1 text-sm text-white/50">Listing management and verification queue.</p></div>
        <button onClick={logout} className="flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-2 text-sm font-bold"><LogOut className="h-3.5 w-3.5" /> Sign out</button>
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
            <button onClick={() => { decideVerification(v.id, "verified"); toast.success(`${v.name} verified.`); }}
              className="flex items-center gap-1 rounded-full bg-[#00C853] px-3.5 py-1.5 text-xs font-black text-black"><Check className="h-3.5 w-3.5" /> Verify</button>
            <button onClick={() => { decideVerification(v.id, "rejected"); toast.error(`${v.name} rejected.`); }}
              className="flex items-center gap-1 rounded-full bg-[#D50000] px-3.5 py-1.5 text-xs font-black"><X className="h-3.5 w-3.5" /> Reject</button>
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

      {/* ── listings ── */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.04]">
        <p className="border-b border-white/10 px-5 py-3 text-xs font-bold uppercase tracking-widest text-white/40">Deal listings · {DEALS.length} total</p>
        {DEALS.map((raw) => {
          const d = effectiveDeal(raw, overrides);
          const hidden = !!overrides[raw.id]?.hidden;
          return (
            <div key={raw.id} className="flex flex-wrap items-center gap-3 border-b border-white/5 px-5 py-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9] text-xs font-black">{d.name[0]}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold">{d.name} {hidden && <span className="ml-1 rounded bg-[#D50000]/20 px-1.5 py-0.5 text-[9px] font-bold text-[#FF5252]">HIDDEN</span>}</p>
                <p className="truncate text-xs text-white/50">{d.category} · {d.stage}</p>
              </div>
              <span className="text-sm font-black tabular-nums text-[#0EA5E9]">{fmt$(d.ask)} <span className="text-xs font-normal text-white/40">/ {d.equity}%</span></span>
              <button onClick={() => setOverride(raw.id, { hidden: !hidden })} className="rounded-full bg-white/10 p-2" title={hidden ? "Show" : "Hide"}>
                {hidden ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              </button>
              <button onClick={() => openEdit(raw.id)} className="rounded-full bg-[#3B4EFA] px-3.5 py-1.5 text-xs font-bold">Edit</button>
            </div>
          );
        })}
      </section>

      {/* edit modal */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="border-white/10 bg-[#161619] text-white">
          <DialogHeader><DialogTitle>Edit listing — {DEALS.find((d) => d.id === editing)?.name}</DialogTitle>
            <DialogDescription className="text-white/60">Changes publish instantly to the public Deal Flow.</DialogDescription></DialogHeader>
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm"><span className="text-white/50">Ask (USD)</span>
              <Input type="number" value={ask} onChange={(e) => setAsk(e.target.value)} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
            <label className="text-sm"><span className="text-white/50">Equity (%)</span>
              <Input type="number" value={equity} onChange={(e) => setEquity(e.target.value)} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
          </div>
          <label className="block text-sm"><span className="text-white/50">Stage</span>
            <Input value={stage} onChange={(e) => setStage(e.target.value)} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
          <label className="block text-sm"><span className="text-white/50">Tagline</span>
            <Input value={tagline} onChange={(e) => setTagline(e.target.value)} className="mt-1 border-white/10 bg-white/5 text-white" /></label>
          <button onClick={saveEdit} className="flex w-full items-center justify-center gap-2 rounded-full bg-[#00C853] py-2.5 text-sm font-black text-black"><Save className="h-4 w-4" /> Save & publish</button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
