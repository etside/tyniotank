import { useState } from "react";
import { toast } from "sonner";
import { Check, Upload, ScanFace, ShieldAlert, Lock } from "lucide-react";
import { useShark, fmt$, type Category } from "./store";

const CATS: Category[] = ["AI SaaS", "FinTech", "HealthTech", "ClimateTech"];
const STEPS = ["Category & deposit", "KYC / AML", "Escrow hold", "Access granted"];

export default function Deposit() {
  const session = useShark((s) => s.session);
  const setKyc = useShark((s) => s.setKyc);
  const deposit = useShark((s) => s.deposit);
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<Category>("AI SaaS");
  const [amt, setAmt] = useState(500);

  const next = () => {
    if (step === 0 && amt < 500) return toast.error("Minimum deposit is $500.");
    if (step === 1) { setKyc("pending"); setTimeout(() => { setKyc("verified"); toast.success("KYC approved — sanctions & PEP clear."); }, 1200); }
    if (step === 2) deposit(cat, amt);
    setStep((s) => Math.min(3, s + 1));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Deposit & KYC</h1><p className="mt-1 text-sm text-white/50">Funds are held in escrow, not captured. Refundable if you win nothing.</p></div>

      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${i < step ? "bg-[#00C853] text-black" : i === step ? "bg-[#3B4EFA]" : "bg-white/10 text-white/40"}`}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
            <span className={`hidden text-xs font-semibold sm:block ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
            {i < 3 && <span className="h-px flex-1 bg-white/10" />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Category <select value={cat} onChange={(e) => setCat(e.target.value as Category)} className="mt-1 w-full rounded-lg bg-[#1b1b1f] px-3 py-2 outline-none ring-[#3B4EFA] focus:ring-1">{CATS.map((c) => <option key={c}>{c}</option>)}</select></label>
            <label className="block text-sm font-semibold">Deposit amount (min $500)
              <div className="mt-1 flex gap-2">{[500, 1000, 2500].map((v) => <button key={v} onClick={() => setAmt(v)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${amt === v ? "bg-[#3B4EFA]" : "bg-white/10"}`}>{fmt$(v)}</button>)}</div>
              <input type="number" min={500} value={amt} onChange={(e) => setAmt(Number(e.target.value))} className="mt-3 w-full rounded-lg bg-white/5 px-3 py-2 text-sm font-bold tabular-nums outline-none ring-[#3B4EFA] focus:ring-1" /></label>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4"><Upload className="h-5 w-5 text-[#0EA5E9]" /><div><p className="text-sm font-bold">ID document (OCR)</p><p className="text-xs text-white/50">Passport or national ID — provider: Persona</p></div><span className="ml-auto text-xs text-[#00C853]">uploaded ✓</span></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4"><ScanFace className="h-5 w-5 text-[#0EA5E9]" /><div><p className="text-sm font-bold">Facial liveness</p><p className="text-xs text-white/50">3-second selfie check</p></div><span className="ml-auto text-xs text-[#00C853]">passed ✓</span></div>
            <div className="flex items-center gap-3 rounded-xl bg-white/5 p-4"><ShieldAlert className="h-5 w-5 text-[#0EA5E9]" /><div><p className="text-sm font-bold">Sanctions / PEP screening</p><p className="text-xs text-white/50">Risk-based depth by deposit amount</p></div><span className="ml-auto text-xs text-[#00C853]">clear ✓</span></div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-[#3B4EFA]/10 p-4 ring-1 ring-[#3B4EFA]/40"><Lock className="h-5 w-5 text-[#8FA0FF]" /><div><p className="font-bold">{fmt$(amt)} → escrow (custodial)</p><p className="text-xs text-white/60">Held via Stripe Connect, not captured. Forfeited only on term-sheet default; auto-refunded if no winning bid.</p></div></div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-3 text-center">
            <p className="text-3xl">🎉</p><p className="font-black text-[#00C853]">Access granted</p>
            <p className="text-sm text-white/60">You can now join {cat} pitch rooms. Categories: {session.categories.join(", ")}.</p>
          </div>
        )}
        {step < 3 && <button onClick={next} className="mt-6 w-full rounded-full bg-[#3B4EFA] py-3 text-sm font-black transition-transform hover:scale-[1.01]">{step === 2 ? `Hold ${fmt$(amt)} in escrow` : "Continue"}</button>}
      </div>
    </div>
  );
}
