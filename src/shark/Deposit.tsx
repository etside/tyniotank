import { useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, Lock, ShieldAlert, ShieldCheck } from "lucide-react";
import { useShark, fmt$, type Category } from "./store";

const CATS: Category[] = ["AI SaaS", "FinTech", "HealthTech", "ClimateTech"];
const STEPS = ["Category & deposit", "Escrow hold", "Access granted"];

export default function Deposit() {
  const session = useShark((s) => s.session);
  const deposit = useShark((s) => s.deposit);
  const [step, setStep] = useState(0);
  const [cat, setCat] = useState<Category>("AI SaaS");
  const [amt, setAmt] = useState(500);

  /* verification is granted manually via the KYC Center + admin review */
  if (session.kyc !== "verified") {
    return (
      <div className="mx-auto max-w-2xl space-y-5">
        <div><h1 className="text-2xl font-extrabold tracking-tight">Deposit & escrow</h1><p className="mt-1 text-sm text-white/50">Funds are held in escrow, not captured. Refundable if you win nothing.</p></div>
        <div className="rounded-2xl border border-[#FFB300]/30 bg-[#FFB300]/[0.06] p-8 text-center">
          <ShieldAlert className="mx-auto h-10 w-10 text-[#FFB300]" />
          <p className="mt-3 text-lg font-black">KYC verification required</p>
          <p className="mx-auto mt-1 max-w-md text-sm text-white/60">
            Deposits unlock only for verified investors. Submit your identity and proof of funds at the KYC Center — the platform owner marks you verified after manual review.
          </p>
          <Link to="/shark/verify" className="mt-5 inline-block rounded-full bg-[#FFB300] px-6 py-2.5 text-sm font-black text-black transition-transform hover:scale-[1.02]">
            Go to KYC Center →
          </Link>
        </div>
      </div>
    );
  }

  const next = () => {
    if (step === 0 && amt < 500) return toast.error("Minimum deposit is $500.");
    if (step === 1) { deposit(cat, amt); toast.success(`${fmt$(amt)} held in escrow for ${cat}`); }
    setStep((s) => Math.min(2, s + 1));
  };

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">Deposit & escrow <ShieldCheck className="h-5 w-5 text-[#00C853]" /></h1>
        <p className="mt-1 text-sm text-white/50">Verified investor · funds are held in escrow, not captured. Refundable if you win nothing.</p>
      </div>

      <ol className="flex items-center gap-2">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center gap-2">
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${i < step ? "bg-[#00C853] text-black" : i === step ? "bg-[#3B4EFA]" : "bg-white/10 text-white/40"}`}>{i < step ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
            <span className={`hidden text-xs font-semibold sm:block ${i === step ? "text-white" : "text-white/40"}`}>{s}</span>
            {i < 2 && <span className="h-px flex-1 bg-white/10" />}
          </li>
        ))}
      </ol>

      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
        {step === 0 && (
          <div className="space-y-4">
            <label className="block text-sm font-semibold">Category
              <div className="mt-2 grid grid-cols-2 gap-2">
                {CATS.map((c) => (
                  <button key={c} onClick={() => setCat(c)} className={`rounded-xl border px-4 py-3 text-sm font-bold transition ${cat === c ? "border-[#3B4EFA] bg-[#3B4EFA]/15" : "border-white/10 bg-white/5 text-white/60 hover:border-white/25"}`}>
                    {c}{session.categories.includes(c) && <span className="block text-[10px] font-semibold text-[#00C853]">already deposited</span>}
                  </button>
                ))}
              </div>
            </label>
            <label className="block text-sm font-semibold">Deposit amount (min $500)
              <div className="mt-1 flex flex-wrap gap-2">{[500, 1000, 2500, 10000].map((v) => <button key={v} onClick={() => setAmt(v)} className={`rounded-full px-4 py-1.5 text-sm font-bold ${amt === v ? "bg-[#3B4EFA]" : "bg-white/10"}`}>{fmt$(v)}</button>)}</div>
              <input type="number" min={500} value={amt} onChange={(e) => setAmt(Number(e.target.value))} className="mt-3 w-full rounded-lg bg-white/5 px-3 py-2 text-sm font-bold tabular-nums outline-none ring-[#3B4EFA] focus:ring-1" /></label>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 rounded-xl bg-[#3B4EFA]/10 p-4 ring-1 ring-[#3B4EFA]/40"><Lock className="h-5 w-5 text-[#8FA0FF]" /><div><p className="font-bold">{fmt$(amt)} → escrow (custodial) · {cat}</p><p className="text-xs text-white/60">Held via Stripe Connect, not captured. Forfeited only on term-sheet default; auto-refunded if no winning bid.</p></div></div>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-3 text-center">
            <ShieldCheck className="mx-auto h-10 w-10 text-[#00C853]" /><p className="font-black text-[#00C853]">Access granted</p>
            <p className="text-sm text-white/60">You can now join {cat} pitch rooms and fire bids. Categories on file: {session.categories.join(", ")}.</p>
            <Link to="/shark" className="inline-block rounded-full bg-[#3B4EFA] px-6 py-2.5 text-sm font-black">Back to lobby →</Link>
          </div>
        )}
        {step < 2 && <button onClick={next} className="mt-6 w-full rounded-full bg-[#3B4EFA] py-3 text-sm font-black transition-transform hover:scale-[1.01]">{step === 1 ? `Hold ${fmt$(amt)} in escrow` : "Continue"}</button>}
      </div>
    </div>
  );
}
