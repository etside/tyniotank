import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import {
  BadgeCheck, Building2, Check, Clock, FileText, Lock, ShieldCheck,
  TriangleAlert, Upload, User, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useShark, fmt$ } from "./store";
import { useAccess, type KycDoc } from "./access";
import {
  ACCEPTED_DOC_TYPES, COUNTRIES, COMPANY_STAGES, INVESTOR_STAGES, INDUSTRIES,
  INVESTOR_TYPES, MAX_DOC_BYTES, MAX_DOC_MB, TICKET_BANDS, countryByCode,
} from "./kyc";

/* ── helpers ── */

const INP = "bg-white/5 border-white/10 text-white placeholder:text-white/30";

async function fileToDoc(label: string, f: File): Promise<KycDoc> {
  const base: KycDoc = { id: crypto.randomUUID(), label, name: f.name, type: f.type || "file", size: f.size };
  if (!ACCEPTED_DOC_TYPES.includes(f.type)) throw new Error(`${f.name}: only PDF, PNG, JPG or WEBP accepted`);
  if (f.size > MAX_DOC_BYTES) {
    toast.warning(`${f.name} exceeds ${MAX_DOC_MB}MB — metadata attached, file not stored`);
    return base;
  }
  return { ...base, dataUrl: await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = () => rej(new Error("read failed"));
    r.readAsDataURL(f);
  }) };
}

function DocUpload({ label, hint, doc, onChange, accept = "application/pdf,image/*" }: {
  label: string; hint?: string; doc?: KycDoc; onChange: (d?: KycDoc) => void; accept?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-semibold">{label}{hint && <span className="ml-1 text-xs font-normal text-white/40">· {hint}</span>}</p>
          {doc ? (
            <p className="mt-1 flex items-center gap-1.5 text-xs text-[#00C853]"><FileText className="h-3 w-3" />{doc.name} · {(doc.size / 1024).toFixed(0)} KB{!doc.dataUrl && " · large, stored by reference"}</p>
          ) : (
            <p className="mt-1 text-xs text-white/40">PDF / PNG / JPG · max {MAX_DOC_MB}MB</p>
          )}
        </div>
        {doc ? (
          <Button variant="ghost" size="icon" className="text-white/50 hover:text-[#D50000]" onClick={() => onChange(undefined)} aria-label={`Remove ${label}`}>
            <X className="h-4 w-4" />
          </Button>
        ) : (
          <label className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-[#3B4EFA] px-3 py-1.5 text-xs font-bold hover:bg-[#2f3fd6]">
            <Upload className="h-3.5 w-3.5" /> Upload
            <input type="file" accept={accept} className="hidden" onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try { onChange(await fileToDoc(label, f)); } catch (err) { toast.error((err as Error).message); }
              e.target.value = "";
            }} />
          </label>
        )}
      </div>
    </div>
  );
}

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-white/50">{label}</Label>
      {children}
      {hint && <p className="text-xs text-white/35">{hint}</p>}
    </div>
  );
}

function Chips({ options, value, onChange, single = false }: {
  options: string[]; value: string[]; onChange: (v: string[]) => void; single?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(single ? [o] : on ? value.filter((v) => v !== o) : [...value, o])}
            className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${on ? "border-[#3B4EFA] bg-[#3B4EFA]/20 text-white" : "border-white/15 bg-white/5 text-white/50 hover:border-white/30"}`}
          >
            {o}
          </button>
        );
      })}
    </div>
  );
}

/* ── form state ── */

type Role = "investor" | "founder";

interface Common {
  name: string; email: string; phone: string; country: string; terms: boolean; accurate: boolean;
}
interface InvestorForm extends Common {
  type: string; ticket: string; industries: string[]; stages: string[];
  idType: string; idNumber: string; accredited: boolean;
}
interface FounderForm extends Common {
  position: string;
  company: string; website: string; industry: string; stage: string; founded: string; teamSize: string; oneLiner: string;
  regNumber: string; taxId: string; ask: number; equity: number; useOfFunds: string;
}

const emptyInvestor: InvestorForm = {
  name: "", email: "", phone: "", country: "BD", terms: false, accurate: false,
  type: INVESTOR_TYPES[0], ticket: TICKET_BANDS[2], industries: [], stages: [],
  idType: "", idNumber: "", accredited: false,
};
const emptyFounder: FounderForm = {
  name: "", email: "", phone: "", country: "BD", terms: false, accurate: false,
  position: "",
  company: "", website: "", industry: INDUSTRIES[0], stage: "Seed", founded: "", teamSize: "", oneLiner: "",
  regNumber: "", taxId: "", ask: 500000, equity: 10, useOfFunds: "",
};

const STEPS: Record<Role, string[]> = {
  investor: ["Identity", "Investor profile", "KYC & source of funds", "Declarations"],
  founder: ["Founder", "Business", "Business e-KYC", "The ask", "Declarations"],
};

export default function Onboarding() {
  const [params] = useSearchParams();
  const session = useShark((s) => s.session);
  const setKyc = useShark((s) => s.setKyc);
  const setName = useShark((s) => s.setName);
  const verifications = useAccess((s) => s.verifications);
  const submitVerification = useAccess((s) => s.submitVerification);

  const [role, setRole] = useState<Role>(params.get("role") === "founder" || session.role === "founder" ? "founder" : "investor");
  const [step, setStep] = useState(0);
  const [inv, setInv] = useState<InvestorForm>(emptyInvestor);
  const [fnd, setFnd] = useState<FounderForm>(emptyFounder);

  const myApps = useMemo(
    () => verifications.filter((v) => v.role === role && v.name === session.name && v.submittedAt).sort((a, b) => b.submittedAt - a.submittedAt),
    [verifications, role, session.name]
  );
  const latest = myApps[0];

  const country = countryByCode(role === "investor" ? inv.country : fnd.country);
  const [investorDocs, setInvestorDocs] = useState<{ idDoc?: KycDoc; fundsDoc?: KycDoc }>({});
  const [founderDocs, setFounderDocs] = useState<Record<string, KycDoc>>({});

  const setF = <K extends keyof InvestorForm>(k: K, v: InvestorForm[K]) => setInv((s) => ({ ...s, [k]: v }));
  const setD = <K extends keyof FounderForm>(k: K, v: FounderForm[K]) => setFnd((s) => ({ ...s, [k]: v }));

  /* ── validation per step ── */
  const validate = () => {
    if (role === "investor") {
      if (step === 0 && (!inv.name.trim() || !inv.email.includes("@") || !inv.phone.trim())) return "Complete identity fields (name, valid email, phone).";
      if (step === 1 && inv.industries.length === 0) return "Pick at least one industry of interest.";
      if (step === 2 && (!inv.idNumber.trim() || !investorDocs.idDoc || !investorDocs.fundsDoc)) return "Government ID, ID number and proof of funds are required.";
      if (step === 3 && (!inv.accurate || !inv.terms)) return "Both declarations are required.";
      return null;
    }
    if (step === 0 && (!fnd.name.trim() || !fnd.email.includes("@"))) return "Founder name and a valid email are required.";
    if (step === 1 && (!fnd.company.trim() || !fnd.oneLiner.trim())) return "Company name and a one-line pitch are required.";
    if (step === 2) {
      if (!fnd.regNumber.trim() || !fnd.taxId.trim()) return `${country.regLabel} and ${country.taxLabel} are required.`;
      if (country.bizDocs.some((d) => !founderDocs[d.key])) return "Upload every required business document for your country.";
      if (!founderDocs.rep_id) return "Upload the legal representative's government ID.";
      return null;
    }
    if (step === 3 && (fnd.ask < 1000 || fnd.equity < 1 || fnd.equity > 50)) return "Ask must be ≥ $1,000 and equity 1–50%.";
    if (step === 4 && (!fnd.accurate || !fnd.terms)) return "Both declarations are required.";
    return null;
  };

  const submit = () => {
    const err = validate();
    if (err) return toast.error(err);
    const ref = `TT-${Date.now().toString(36).toUpperCase()}`;
    if (role === "investor") {
      submitVerification({
        role, ref, name: inv.name.trim(), entity: inv.type,
        detail: `${inv.type} · ticket ${inv.ticket} · ${inv.stages.join(", ") || "any stage"}`,
        email: inv.email, phone: inv.phone, country: country.name,
        industry: inv.industries[0], interests: inv.industries, stages: inv.stages, ticket: inv.ticket,
        idType: inv.idType || country.idTypes[0], idNumber: inv.idNumber,
        docs: [investorDocs.idDoc, investorDocs.fundsDoc].filter(Boolean) as KycDoc[],
      });
    } else {
      submitVerification({
        role, ref, name: fnd.company.trim(), entity: `${fnd.company.trim()} — ${country.name}`,
        detail: `Raising ${fmt$(fnd.ask)} for ${fnd.equity}% · ${fnd.oneLiner}`,
        email: fnd.email, phone: fnd.phone, country: country.name,
        industry: fnd.industry, stage: fnd.stage, ask: fnd.ask, equity: fnd.equity,
        regNumber: fnd.regNumber, taxId: fnd.taxId,
        docs: [...country.bizDocs.map((d) => founderDocs[d.key]), founderDocs.rep_id, founderDocs.deck].filter(Boolean) as KycDoc[],
      });
    }
    setName(role === "investor" ? inv.name.trim() : fnd.company.trim());
    setKyc("pending");
    toast.success(`Application ${ref} submitted — manual compliance review underway.`);
    setStep(0);
  };

  /* ── existing application status view ── */
  const statusView = latest && latest.submittedAt && (session.kyc !== "none" || latest.status !== "pending") ? latest : latest && session.kyc === "pending" ? latest : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">KYC Center</h1>
          <p className="mt-1 text-sm text-white/50">
            Verified members unlock bidding, escrow and live pitch rooms. Country-specific business e-KYC applies to founders.
          </p>
        </div>
        <span className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${
          session.kyc === "verified" ? "border-[#00C853]/40 bg-[#00C853]/10 text-[#00C853]"
          : session.kyc === "pending" ? "border-[#FFB300]/40 bg-[#FFB300]/10 text-[#FFB300]"
          : "border-white/15 bg-white/5 text-white/50"}`}>
          {session.kyc === "verified" ? <BadgeCheck className="h-3.5 w-3.5" /> : session.kyc === "pending" ? <Clock className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
          KYC · {session.kyc}
        </span>
      </div>

      {/* status of a submitted application */}
      {statusView ? (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold">{statusView.name}</p>
              <p className="text-xs text-white/40">{statusView.role === "founder" ? "Founder application" : "Investor application"} · ref {statusView.ref ?? statusView.id}</p>
            </div>
            {statusView.status === "verified" ? (
              <span className="flex items-center gap-1.5 rounded-full bg-[#00C853]/15 px-3 py-1.5 text-xs font-bold text-[#00C853]"><BadgeCheck className="h-4 w-4" /> Verified</span>
            ) : statusView.status === "rejected" ? (
              <span className="rounded-full bg-[#D50000]/15 px-3 py-1.5 text-xs font-bold text-[#D50000]">Rejected</span>
            ) : (
              <span className="rounded-full bg-[#FFB300]/15 px-3 py-1.5 text-xs font-bold text-[#FFB300]">Under review</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {["Submitted", "Compliance review", "Decision"].map((s, i) => (
              <span key={s} className="flex flex-1 items-center gap-2">
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-black ${statusView.status !== "pending" || i === 0 ? "bg-[#00C853] text-black" : "bg-[#FFB300] text-black"}`}>{i === 0 || statusView.status !== "pending" ? <Check className="h-3.5 w-3.5" /> : i + 1}</span>
                <span className="hidden text-xs font-semibold sm:block">{s}</span>
                {i < 2 && <span className="h-px flex-1 bg-white/10" />}
              </span>
            ))}
          </div>
          {statusView.docs.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">Documents on file</p>
              {statusView.docs.map((d) => (
                <p key={d.id} className="flex items-center gap-2 rounded-lg bg-black/20 px-3 py-2 text-xs"><FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />{d.label} — {d.name}</p>
              ))}
            </div>
          )}
          {statusView.status !== "verified" && (
            <p className="text-xs text-white/40">
              Compliance is verified manually by the platform owner in the <Link to="/shark/admin" className="text-[#0EA5E9] underline">admin panel</Link>. You'll be marked verified or unverified there.
            </p>
          )}
          {statusView.status === "rejected" && <Button className="bg-[#3B4EFA] hover:bg-[#2f3fd6]" onClick={() => setStep(0)}>Update & resubmit</Button>}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          {/* role toggle */}
          <div className="grid grid-cols-2 gap-3">
            {(["investor", "founder"] as Role[]).map((r) => (
              <button key={r} onClick={() => { setRole(r); setStep(0); }}
                className={`rounded-xl border p-4 text-left transition ${role === r ? "border-[#3B4EFA] bg-[#3B4EFA]/15" : "border-white/10 bg-black/20 hover:border-white/25"}`}>
                {r === "investor" ? <User className="h-5 w-5 text-[#0EA5E9]" /> : <Building2 className="h-5 w-5 text-[#00C853]" />}
                <p className="mt-2 font-bold">{r === "investor" ? "Investor" : "Founder / Business"}</p>
                <p className="mt-0.5 text-xs text-white/40">{r === "investor" ? "Identity + source of funds verification" : "Country-wise business e-KYC"}</p>
              </button>
            ))}
          </div>

          {/* stepper */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-white/50">
              <span>Step {step + 1} of {STEPS[role].length} · {STEPS[role][step]}</span>
              <span>{Math.round(((step + 1) / STEPS[role].length) * 100)}%</span>
            </div>
            <Progress value={((step + 1) / STEPS[role].length) * 100} className="h-1.5 bg-white/10" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={`${role}-${step}`} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }} transition={{ duration: 0.18 }} className="space-y-5">
              {role === "investor" ? (
                <>
                  {step === 0 && (
                    <>
                      <Field label="Full legal name"><Input className={INP} value={inv.name} onChange={(e) => setF("name", e.target.value)} placeholder="e.g. Arif Rahman" /></Field>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Email"><Input className={INP} type="email" value={inv.email} onChange={(e) => setF("email", e.target.value)} placeholder="you@fund.com" /></Field>
                        <Field label="Phone"><Input className={INP} value={inv.phone} onChange={(e) => setF("phone", e.target.value)} placeholder="+880 …" /></Field>
                      </div>
                      <Field label="Country of residence">
                        <Select value={inv.country} onValueChange={(v) => { setF("country", v); setF("idType", ""); }}>
                          <SelectTrigger className={`w-full ${INP}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <Field label="Investor type"><Chips options={INVESTOR_TYPES} value={[inv.type]} onChange={(v) => setF("type", v[0])} single /></Field>
                      <Field label="Typical ticket"><Chips options={TICKET_BANDS} value={[inv.ticket]} onChange={(v) => setF("ticket", v[0])} single /></Field>
                      <Field label="Industries of interest" hint="Used to match you with deals and verified founders"><Chips options={INDUSTRIES} value={inv.industries} onChange={(v) => setF("industries", v)} /></Field>
                      <Field label="Stages you back"><Chips options={INVESTOR_STAGES} value={inv.stages} onChange={(v) => setF("stages", v)} /></Field>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Identity document type">
                          <Select value={inv.idType} onValueChange={(v) => setF("idType", v)}>
                            <SelectTrigger className={`w-full ${INP}`}><SelectValue placeholder="Select ID type" /></SelectTrigger>
                            <SelectContent>{country.idTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Document number"><Input className={INP} value={inv.idNumber} onChange={(e) => setF("idNumber", e.target.value)} /></Field>
                      </div>
                      <DocUpload label="Government-issued photo ID" doc={investorDocs.idDoc} onChange={(d) => setInvestorDocs((s) => ({ ...s, idDoc: d }))} />
                      <DocUpload label="Proof of funds" hint="bank statement / net-worth letter" doc={investorDocs.fundsDoc} onChange={(d) => setInvestorDocs((s) => ({ ...s, fundsDoc: d }))} />
                      {inv.country === "US" && (
                        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                          <Checkbox checked={inv.accredited} onCheckedChange={(v) => setF("accredited", !!v)} className="mt-0.5" />
                          <span>I certify I qualify as an <b>accredited investor</b> under SEC Rule 501(a) (US residents).</span>
                        </label>
                      )}
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                        <Checkbox checked={inv.accurate} onCheckedChange={(v) => setF("accurate", !!v)} className="mt-0.5" />
                        <span>All information and documents provided are <b>true and accurate</b>. I understand false statements void my membership.</span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                        <Checkbox checked={inv.terms} onCheckedChange={(v) => setF("terms", !!v)} className="mt-0.5" />
                        <span>I agree to the <Link to="/shark/legal" className="text-[#0EA5E9] underline">terms, AML policy and escrow rules</Link>.</span>
                      </label>
                      <p className="flex items-center gap-2 text-xs text-white/40"><Lock className="h-3.5 w-3.5" /> Documents are encrypted at rest and visible only to compliance staff.</p>
                    </>
                  )}
                </>
              ) : (
                <>
                  {step === 0 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full legal name"><Input className={INP} value={fnd.name} onChange={(e) => setD("name", e.target.value)} placeholder="e.g. Sadia Islam" /></Field>
                        <Field label="Position at company"><Input className={INP} value={fnd.position} onChange={(e) => setD("position", e.target.value)} placeholder="Founder & CEO" /></Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Email"><Input className={INP} type="email" value={fnd.email} onChange={(e) => setD("email", e.target.value)} placeholder="founder@company.com" /></Field>
                        <Field label="Phone"><Input className={INP} value={fnd.phone} onChange={(e) => setD("phone", e.target.value)} placeholder="+880 …" /></Field>
                      </div>
                      <Field label="Country of incorporation">
                        <Select value={fnd.country} onValueChange={(v) => setD("country", v)}>
                          <SelectTrigger className={`w-full ${INP}`}><SelectValue /></SelectTrigger>
                          <SelectContent>{COUNTRIES.map((c) => <SelectItem key={c.code} value={c.code}>{c.name}</SelectItem>)}</SelectContent>
                        </Select>
                      </Field>
                    </>
                  )}
                  {step === 1 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Company / brand name"><Input className={INP} value={fnd.company} onChange={(e) => setD("company", e.target.value)} placeholder="e.g. TynioTank Robotics" /></Field>
                        <Field label="Website"><Input className={INP} value={fnd.website} onChange={(e) => setD("website", e.target.value)} placeholder="https://…" /></Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Industry">
                          <Select value={fnd.industry} onValueChange={(v) => setD("industry", v)}>
                            <SelectTrigger className={`w-full ${INP}`}><SelectValue /></SelectTrigger>
                            <SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                        <Field label="Stage">
                          <Select value={fnd.stage} onValueChange={(v) => setD("stage", v)}>
                            <SelectTrigger className={`w-full ${INP}`}><SelectValue /></SelectTrigger>
                            <SelectContent>{COMPANY_STAGES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent>
                          </Select>
                        </Field>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Founded year"><Input className={INP} value={fnd.founded} onChange={(e) => setD("founded", e.target.value)} placeholder="2024" /></Field>
                        <Field label="Team size"><Input className={INP} value={fnd.teamSize} onChange={(e) => setD("teamSize", e.target.value)} placeholder="e.g. 12" /></Field>
                      </div>
                      <Field label="One-line pitch"><Input className={INP} value={fnd.oneLiner} onChange={(e) => setD("oneLiner", e.target.value)} placeholder="What do you do, in one sentence?" /></Field>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <p className="flex items-center gap-2 rounded-xl border border-[#0EA5E9]/30 bg-[#0EA5E9]/10 p-3 text-xs text-[#7dd3fc]">
                        <ShieldCheck className="h-4 w-4 shrink-0" /> Requirements below are specific to <b>{country.name}</b> ({country.code}). Change the country in step 1 if this doesn't match.
                      </p>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label={country.regLabel}><Input className={INP} value={fnd.regNumber} onChange={(e) => setD("regNumber", e.target.value)} /></Field>
                        <Field label={country.taxLabel}><Input className={INP} value={fnd.taxId} onChange={(e) => setD("taxId", e.target.value)} /></Field>
                      </div>
                      {country.bizDocs.map((d) => (
                        <DocUpload key={d.key} label={d.label} doc={founderDocs[d.key]} onChange={(doc) => setFounderDocs((s) => ({ ...s, [d.key]: doc }))} />
                      ))}
                      <DocUpload label="Legal representative's government ID" doc={founderDocs.rep_id} onChange={(doc) => setFounderDocs((s) => ({ ...s, rep_id: doc }))} />
                      <DocUpload label="Pitch deck (optional)" accept=".pdf,.ppt,.pptx" doc={founderDocs.deck} onChange={(doc) => setFounderDocs((s) => ({ ...s, deck: doc }))} />
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Raising amount (USD)" hint="Minimum $1,000"><Input className={INP} type="number" value={fnd.ask} onChange={(e) => setD("ask", Number(e.target.value))} /></Field>
                        <Field label="Equity offered %" hint="1–50%"><Input className={INP} type="number" value={fnd.equity} onChange={(e) => setD("equity", Number(e.target.value))} /></Field>
                      </div>
                      <Field label="Use of funds"><Textarea className={INP} value={fnd.useOfFunds} onChange={(e) => setD("useOfFunds", e.target.value)} placeholder="Product, GTM, hires…" rows={3} /></Field>
                      <p className="text-sm text-white/50">Post-money valuation at this ask: <b className="text-white">{fmt$(fnd.ask * (100 / Math.max(1, fnd.equity)))}</b></p>
                    </>
                  )}
                  {step === 4 && (
                    <>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                        <Checkbox checked={fnd.accurate} onCheckedChange={(v) => setD("accurate", !!v)} className="mt-0.5" />
                        <span>The business documents uploaded are <b>authentic and current</b>; I am authorised to file this application for {fnd.company || "the company"}.</span>
                      </label>
                      <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-white/10 bg-black/20 p-3 text-sm">
                        <Checkbox checked={fnd.terms} onCheckedChange={(v) => setD("terms", !!v)} className="mt-0.5" />
                        <span>I agree to the <Link to="/shark/legal" className="text-[#0EA5E9] underline">issuer agreement and platform rules</Link>.</span>
                      </label>
                    </>
                  )}
                </>
              )}
            </motion.div>
          </AnimatePresence>

          {/* nav */}
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <Button variant="ghost" className="text-white/50" disabled={step === 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
            {step < STEPS[role].length - 1 ? (
              <Button className="bg-[#3B4EFA] hover:bg-[#2f3fd6]" onClick={() => {
                const err = validate();
                if (err) return toast.error(err);
                setStep((s) => s + 1);
              }}>Continue</Button>
            ) : (
              <Button className="bg-[#00C853] font-bold text-black hover:bg-[#00b34a]" onClick={submit}>
                <ShieldCheck className="h-4 w-4" /> Submit for verification
              </Button>
            )}
          </div>
        </motion.div>
      )}

      {latest?.status === "pending" && statusView && (
        <p className="flex items-center gap-2 text-xs text-white/40"><TriangleAlert className="h-3.5 w-3.5 text-[#FFB300]" /> While pending, deposit and bidding are locked until an admin marks you verified.</p>
      )}
    </div>
  );
}
