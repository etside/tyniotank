import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, ShieldCheck, Lock, FileSignature } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { DEALS, type Deal } from "./deals";
import { useAccess, effectiveDeal } from "./access";
import { useShark, fmt$ } from "./store";

export default function DealDetail() {
  const { id } = useParams();
  const overrides = useAccess((s) => s.overrides);
  const customDeals = useAccess((s) => s.customDeals);
  const ndas = useAccess((s) => s.ndas);
  const signNda = useAccess((s) => s.signNda);
  const kyc = useShark((s) => s.session.kyc);
  const [ndaOpen, setNdaOpen] = useState(false);
  const [invName, setInvName] = useState("");

  const allDeals: Deal[] = [...DEALS, ...customDeals];
  const raw = allDeals.find((d) => d.id === id);
  if (!raw) return (
    <div className="space-y-4 py-20 text-center">
      <p className="text-xl font-bold">Deal not found</p>
      <Link to="/shark/deals" className="text-[#0EA5E9] hover:underline">← Back to Deal Flow</Link>
    </div>
  );

  const deal = effectiveDeal(raw, overrides);
  const hasNda = ndas.some((n) => n.dealId === deal.id);

  const doSign = () => {
    if (kyc !== "verified") return toast.error("KYC verification required before signing an NDA.");
    if (invName.trim().length < 3) return toast.error("Enter your full legal name to e-sign.");
    signNda(deal.id, invName.trim());
    toast.success("NDA executed — investor brief unlocked.");
    setNdaOpen(false);
    setInvName("");
  };

  const labels: Record<string, string> = { problem: "Problem", product: "Product", traction: "Traction", market: "Market", model: "Business Model", whyNow: "Why Now", risks: "Risks" };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/shark/deals" className="inline-flex items-center gap-1.5 text-sm text-white/60 hover:text-white"><ArrowLeft className="h-3.5 w-3.5" /> Deal Flow</Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#3B4EFA] to-[#0EA5E9] text-2xl font-black">{deal.name[0]}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight">{deal.name}</h1>
              {deal.featured && <span className="rounded-full bg-[#FFB300]/15 px-2 py-0.5 text-[10px] font-bold text-[#FFB300]">FEATURED</span>}
              {deal.custom && <span className="rounded-full bg-[#0EA5E9]/15 px-2 py-0.5 text-[10px] font-bold text-[#0EA5E9]">CUSTOM</span>}
            </div>
            <p className="mt-1 text-sm text-white/60">{deal.tagline}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">{deal.category}</span>
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold">{deal.stage}</span>
              <span className="rounded-full bg-[#3B4EFA]/15 px-2.5 py-1 text-xs font-bold text-[#8FA0FF]">{fmt$(deal.ask)} for {deal.equity}%</span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {deal.highlights.map((h, i) => (
            <div key={i} className="flex gap-2 rounded-xl bg-white/5 p-3 text-sm">
              <span className="text-[#00C853]">▸</span>
              <span className="text-white/80">{h}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* NDA-gated brief */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Investor Brief</h2>
          {hasNda ? (
            <span className="flex items-center gap-1.5 text-xs text-[#00C853]"><ShieldCheck className="h-3.5 w-3.5" /> NDA signed · brief unlocked</span>
          ) : (
            <button onClick={() => setNdaOpen(true)} className="flex items-center gap-1.5 rounded-full bg-[#3B4EFA] px-4 py-2 text-xs font-bold"><FileSignature className="h-3.5 w-3.5" /> Sign NDA to view</button>
          )}
        </div>

        {hasNda ? (
          <div className="mt-4 space-y-3">
            <p className="flex items-center gap-2 text-xs text-white/40"><ExternalLink className="h-3 w-3" /> {deal.repo}</p>
            {(Object.keys(deal.brief) as Array<keyof typeof deal.brief>).map((k) => (
              <div key={k} className="rounded-xl bg-white/5 p-4">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#0EA5E9]">{labels[k]}</p>
                <p className="mt-1 text-sm text-white/80">{deal.brief[k]}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 flex flex-col items-center gap-3 py-8">
            <Lock className="h-8 w-8 text-white/20" />
            <p className="text-sm text-white/40">Confidential. Requires KYC-verified investor status and a signed NDA.</p>
          </div>
        )}
      </div>

      {/* NDA modal */}
      <Dialog open={ndaOpen} onOpenChange={setNdaOpen}>
        <DialogContent className="border-white/10 bg-[#161619] text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileSignature className="h-5 w-5 text-[#0EA5E9]" /> Mutual NDA — {deal.name}</DialogTitle>
            <DialogDescription className="text-white/60">
              By e-signing you agree: (1) information in the brief is confidential and used solely for investment evaluation; (2) no onward disclosure; (3) this is a binding electronic signature (ESIGN Act); (4) the platform records this execution with a timestamp. Misuse forfeits platform access.
            </DialogDescription>
          </DialogHeader>
          <label className="block text-sm">
            <span className="text-white/50">Full legal name (signature)</span>
            <Input value={invName} onChange={(e) => setInvName(e.target.value)} placeholder="e.g. Jane Rahman" className="mt-1 border-white/10 bg-white/5 text-white" />
          </label>
          <DialogFooter className="gap-2 sm:gap-0">
            <button onClick={() => setNdaOpen(false)} className="rounded-full bg-white/10 px-5 py-2 text-sm font-bold">Cancel</button>
            {kyc !== "verified" && <span className="rounded-full bg-[#FFB300]/15 px-4 py-2 text-xs font-bold text-[#FFB300]">KYC required first</span>}
            <button onClick={doSign} disabled={kyc !== "verified"} className="rounded-full bg-[#00C853] px-5 py-2 text-sm font-black text-black disabled:opacity-40">E-sign & unlock</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
