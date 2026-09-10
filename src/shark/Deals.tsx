import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { ShieldCheck, Lock, FileSignature, Eye } from "lucide-react";
import { DEALS, type Deal } from "./deals";
import { useAccess, effectiveDeal } from "./access";
import { useShark } from "./store";
import { fmt$ } from "./store";

function TeaserCard({ d, onOpen, locked }: { d: Deal; onOpen: () => void; locked: boolean }) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.04] p-5 transition-colors hover:border-[#3B4EFA]/50">
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9] text-lg font-black">{d.name[0]}</span>
        <div className="min-w-0">
          <p className="truncate font-bold">{d.name}</p>
          <p className="text-xs text-white/50">{d.category} · {d.stage}</p>
        </div>
        <span className="ml-auto text-right">
          <span className="block text-sm font-black tabular-nums text-[#0EA5E9]">{fmt$(d.ask)}</span>
          <span className="block text-[11px] text-white/40">for {d.equity}%</span>
        </span>
      </div>
      <p className="mt-3 line-clamp-2 text-sm text-white/70">{d.tagline}</p>
      <ul className="mt-3 space-y-1.5 text-xs text-white/60">
        {d.highlights.map((h) => <li key={h} className="flex gap-1.5"><span className="text-[#00C853]">▸</span>{h}</li>)}
      </ul>
      <button onClick={onOpen}
        className={`mt-4 flex items-center justify-center gap-1.5 rounded-full py-2.5 text-sm font-bold transition-transform hover:scale-[1.02] ${locked ? "bg-white/10" : "bg-[#3B4EFA]"}`}>
        {locked ? <><Lock className="h-3.5 w-3.5" /> Sign NDA to view brief</> : <><Eye className="h-3.5 w-3.5" /> View investor brief</>}
      </button>
    </motion.div>
  );
}

export default function Deals() {
  const ndas = useAccess((s) => s.ndas);
  const signNda = useAccess((s) => s.signNda);
  const overrides = useAccess((s) => s.overrides);
  const [ndaFor, setNdaFor] = useState<Deal | null>(null);
  const [briefFor, setBriefFor] = useState<Deal | null>(null);
  const [invName, setInvName] = useState("");
  const kyc = useShark((st) => st.session.kyc);

  const deals = useMemo(() => DEALS.map((d) => effectiveDeal(d, overrides)).filter((d) => !d.hidden), [overrides]);

  const openDeal = (d: Deal) => {
    if (ndas.some((n) => n.dealId === d.id)) setBriefFor(d);
    else setNdaFor(d);
  };

  const doSign = () => {
    if (kyc !== "verified") return toast.error("Investor verification (KYC) required before signing an NDA.");
    if (!ndaFor || invName.trim().length < 3) return toast.error("Enter your full legal name to e-sign.");
    signNda(ndaFor.id, invName.trim());
    toast.success("NDA executed — investor brief unlocked.");
    const d = ndaFor; setNdaFor(null); setInvName("");
    setBriefFor(d);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Deal Flow</h1>
          <p className="mt-1 text-sm text-white/50">Startups raising now. Teasers are public-minimal; full briefs unlock behind a signed NDA.</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-[#00C853]/10 px-3 py-1.5 text-xs font-semibold text-[#00C853]">
          <ShieldCheck className="h-3.5 w-3.5" /> NDA-gated · verified investors only
        </span>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {deals.map((d) => <TeaserCard key={d.id} d={d} locked={!ndas.some((n) => n.dealId === d.id)} onOpen={() => openDeal(d)} />)}
      </div>

      {/* NDA execution modal */}
      <Dialog open={!!ndaFor} onOpenChange={(o) => !o && setNdaFor(null)}>
        <DialogContent className="border-white/10 bg-[#161619] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-[#0EA5E9]" /> Mutual NDA — {ndaFor?.name}</DialogTitle>
            <DialogDescription className="text-white/60">
              You are requesting access to confidential investor material. By e-signing you agree: (1) information shared in the brief is confidential and used solely for investment evaluation; (2) no onward disclosure to third parties; (3) this is a binding electronic signature (ESIGN Act); (4) the platform records this execution with a timestamp. Misuse forfeits platform access.
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm">
            <span className="text-white/50">Full legal name (signature)</span>
            <Input value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="e.g. Jane Rahman" className="mt-1 border-white/10 bg-white/5 text-white" />
          </label>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setNdaFor(null)} className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold">Cancel</button>
            {kyc !== "verified" ? <span className="rounded-full bg-[#FFB300]/15 px-4 py-2 text-xs font-bold text-[#FFB300]">KYC verification required — complete Deposit & KYC first</span> : null}
            <button onClick={doSign} disabled={kyc !== "verified"} className="rounded-full bg-[#00C853] px-5 py-2 text-sm font-black text-black disabled:opacity-40">E-sign & unlock</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Investor brief modal (post-NDA) */}
      <Dialog open={!!briefFor} onOpenChange={(o) => !o && setBriefFor(null)}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto border-white/10 bg-[#161619] text-white">
          {briefFor && (
            <>
              <DialogHeader>
                <DialogTitle>{briefFor.name} — investor brief</DialogTitle>
                <DialogDescription className="flex items-center gap-2 text-white/50">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#00C853]" /> NDA executed · {briefFor.repo} · {fmt$(briefFor.ask)} for {briefFor.equity}%
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3 text-sm">
                {(["problem", "product", "traction", "market", "model", "whyNow", "risks"] as const).map((k) => (
                  <div key={k} className="rounded-xl bg-white/5 p-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-[#0EA5E9]">{{ problem: "Problem", product: "Product", traction: "Traction", market: "Market", model: "Business model", whyNow: "Why now", risks: "Risks" }[k]}</p>
                    <p className="mt-1 text-white/80">{briefFor.brief[k]}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
