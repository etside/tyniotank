import { useMemo, useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { BadgeCheck, Building2, Clock, Eye, FileText, Search, ShieldCheck, User, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useAccess, type KycDoc, type VerificationRequest } from "./access";
import { INDUSTRIES } from "./kyc";

const STATUS_STYLE: Record<VerificationRequest["status"], string> = {
  verified: "border-[#00C853]/40 bg-[#00C853]/10 text-[#00C853]",
  pending: "border-[#FFB300]/40 bg-[#FFB300]/10 text-[#FFB300]",
  rejected: "border-[#D50000]/40 bg-[#D50000]/10 text-[#D50000]",
};

function DocViewer({ docs, open, onOpenChange }: { docs: KycDoc[]; open: boolean; onOpenChange: (o: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] max-w-xl overflow-y-auto border-white/10 bg-[#161616]">
        <DialogHeader><DialogTitle className="text-base">KYC documents ({docs.length})</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {docs.length === 0 && <p className="text-sm text-white/40">No documents attached (legacy application).</p>}
          {docs.map((d) => (
            <div key={d.id} className="space-y-2 rounded-xl border border-white/10 bg-black/20 p-3">
              <p className="text-sm font-semibold">{d.label}</p>
              <p className="flex items-center gap-2 text-xs text-white/40"><FileText className="h-3.5 w-3.5 text-[#0EA5E9]" />{d.name} · {(d.size / 1024).toFixed(0)} KB · {d.type}</p>
              {d.dataUrl && d.type.startsWith("image/") && <img src={d.dataUrl} alt={d.label} className="max-h-64 rounded-lg border border-white/10 object-contain" />}
              {d.dataUrl && d.type === "application/pdf" && (
                <a href={d.dataUrl} target="_blank" rel="noreferrer" className="inline-block text-xs font-bold text-[#0EA5E9] underline">Open PDF in new tab ↗</a>
              )}
              {!d.dataUrl && <p className="text-xs text-[#FFB300]">Large file — stored by reference only (not uploaded).</p>}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MemberRow({ v, onToggle }: { v: VerificationRequest; onToggle: (id: string) => void }) {
  const decide = useAccess((s) => s.decideVerification);
  const [docsOpen, setDocsOpen] = useState(false);
  const Icon = v.role === "founder" ? Building2 : User;
  return (
    <motion.div layout initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-3">
      <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${v.role === "founder" ? "bg-[#00C853]/15 text-[#00C853]" : "bg-[#0EA5E9]/15 text-[#0EA5E9]"}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-40 flex-1">
        <p className="flex items-center gap-1.5 text-sm font-bold">
          {v.name}
          {v.status === "verified" && <BadgeCheck className="h-4 w-4 text-[#00C853]" />}
        </p>
        <p className="truncate text-xs text-white/40">{v.entity}{v.country ? ` · ${v.country}` : ""}{v.idNumber ? ` · ID ${v.idNumber}` : ""}</p>
      </div>
      <div className="flex max-w-md flex-wrap gap-1">
        {v.industry && <Badge variant="outline" className="border-[#3B4EFA]/40 bg-[#3B4EFA]/10 text-[10px] text-[#8b9bff]">{v.industry}</Badge>}
        {(v.interests ?? []).map((i) => (
          <Badge key={i} variant="outline" className="border-white/15 text-[10px] text-white/50">{i}</Badge>
        ))}
        {v.ticket && <Badge variant="outline" className="border-white/15 text-[10px] text-white/50">{v.ticket}</Badge>}
        {v.stage && v.role === "founder" && <Badge variant="outline" className="border-white/15 text-[10px] text-white/50">{v.stage}</Badge>}
      </div>
      <button onClick={() => setDocsOpen(true)} className="flex items-center gap-1.5 rounded-lg border border-white/15 px-2.5 py-1.5 text-xs font-semibold text-white/70 hover:border-[#0EA5E9] hover:text-[#0EA5E9]">
        <Eye className="h-3.5 w-3.5" /> {v.docs.length} docs
      </button>
      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${STATUS_STYLE[v.status]}`}>{v.status}</span>
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/40">verified</span>
        <Switch checked={v.status === "verified"} onCheckedChange={() => onToggle(v.id)} aria-label={`Toggle verification for ${v.name}`} />
      </div>
      {v.status !== "rejected" && (
        <Button variant="ghost" size="icon" className="text-white/40 hover:text-[#D50000]" onClick={() => { decide(v.id, "rejected"); toast(`${v.name} rejected`); }} aria-label={`Reject ${v.name}`}>
          <X className="h-4 w-4" />
        </Button>
      )}
      <DocViewer docs={v.docs} open={docsOpen} onOpenChange={setDocsOpen} />
    </motion.div>
  );
}

export function VerificationQueue() {
  const verifications = useAccess((s) => s.verifications);
  const decide = useAccess((s) => s.decideVerification);
  const [docsFor, setDocsFor] = useState<VerificationRequest | null>(null);
  const pending = verifications.filter((v) => v.status === "pending");

  return (
    <div className="space-y-3">
      <p className="text-sm text-white/50">
        {pending.length === 0 ? "Queue clear — every application has a decision." : `${pending.length} application${pending.length > 1 ? "s" : ""} awaiting manual compliance review.`}
      </p>
      {pending.map((v) => (
        <div key={v.id} className="rounded-xl border border-[#FFB300]/25 bg-[#FFB300]/[0.04] p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="flex items-center gap-2 font-bold"><Clock className="h-4 w-4 text-[#FFB300]" />{v.name} <span className="text-xs font-normal text-white/40">· {v.role}</span></p>
              <p className="mt-0.5 text-xs text-white/50">{v.entity}{v.country ? ` · ${v.country}` : ""}{v.email ? ` · ${v.email}` : ""}{v.phone ? ` · ${v.phone}` : ""}</p>
            </div>
            <span className="font-mono text-[10px] text-white/30">{v.ref ?? v.id}</span>
          </div>
          <p className="mt-2 text-sm text-white/70">{v.detail}</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {v.industry && <Badge variant="outline" className="border-[#3B4EFA]/40 bg-[#3B4EFA]/10 text-[10px] text-[#8b9bff]">{v.industry}</Badge>}
            {(v.interests ?? []).map((i) => <Badge key={i} variant="outline" className="border-white/15 text-[10px] text-white/50">{i}</Badge>)}
            {v.regNumber && <Badge variant="outline" className="border-white/15 text-[10px] text-white/50">Reg: {v.regNumber}</Badge>}
            {v.taxId && <Badge variant="outline" className="border-white/15 text-[10px] text-white/50">Tax: {v.taxId}</Badge>}
            {typeof v.ask === "number" && v.role === "founder" && <Badge variant="outline" className="border-[#00C853]/40 text-[10px] text-[#00C853]">Raising ${v.ask.toLocaleString()} for {v.equity}%</Badge>}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" className="bg-[#00C853] font-bold text-black hover:bg-[#00b34a]" onClick={() => { decide(v.id, "verified"); toast.success(`${v.name} verified — now listed`); }}>
              <ShieldCheck className="h-3.5 w-3.5" /> Verify & list
            </Button>
            <Button size="sm" variant="destructive" onClick={() => { decide(v.id, "rejected"); toast(`${v.name} rejected`); }}>Reject</Button>
            <Button size="sm" variant="outline" className="border-white/15" onClick={() => setDocsFor(v)}>
              <Eye className="h-3.5 w-3.5" /> Review documents ({v.docs.length})
            </Button>
          </div>
        </div>
      ))}
      {verifications.filter((v) => v.status !== "pending").length > 0 && (
        <details className="rounded-xl border border-white/10 bg-black/20 p-3">
          <summary className="cursor-pointer text-xs font-bold uppercase tracking-widest text-white/40">Decision history ({verifications.filter((v) => v.status !== "pending").length})</summary>
          <div className="mt-2 space-y-2">
            {verifications.filter((v) => v.status !== "pending").map((v) => (
              <div key={v.id} className="flex items-center justify-between gap-2 text-sm">
                <span>{v.name} <span className="text-xs text-white/30">· {new Date(v.submittedAt).toLocaleDateString()}</span></span>
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-black uppercase ${STATUS_STYLE[v.status]}`}>{v.status}</span>
              </div>
            ))}
          </div>
        </details>
      )}
      <DocViewer docs={docsFor?.docs ?? []} open={!!docsFor} onOpenChange={(o) => !o && setDocsFor(null)} />
    </div>
  );
}

export function MembersDirectory() {
  const verifications = useAccess((s) => s.verifications);
  const toggle = useAccess((s) => s.toggleVerification);
  const [q, setQ] = useState("");
  const [roleF, setRoleF] = useState("all");
  const [industryF, setIndustryF] = useState("all");
  const [statusF, setStatusF] = useState("all");
  const [interestF, setInterestF] = useState("");

  const allInterests = useMemo(
    () => Array.from(new Set(verifications.flatMap((v) => v.interests ?? []))).sort(),
    [verifications]
  );

  const rows = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return verifications
      .filter((v) => (roleF === "all" ? true : v.role === roleF))
      .filter((v) => (industryF === "all" ? true : v.industry === industryF || (v.interests ?? []).includes(industryF)))
      .filter((v) => (statusF === "all" ? true : v.status === statusF))
      .filter((v) => (interestF ? (v.interests ?? []).includes(interestF) : true))
      .filter((v) => (!needle ? true : [v.name, v.entity, v.country, v.industry].join(" ").toLowerCase().includes(needle)))
      .sort((a, b) => (a.status === "verified" ? -1 : 1) - (b.status === "verified" ? -1 : 1) || b.submittedAt - a.submittedAt);
  }, [verifications, q, roleF, industryF, statusF, interestF]);

  const counts = {
    verified: verifications.filter((v) => v.status === "verified").length,
    pending: verifications.filter((v) => v.status === "pending").length,
    rejected: verifications.filter((v) => v.status === "rejected").length,
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2">
        {([["verified", counts.verified, "text-[#00C853]"], ["pending", counts.pending, "text-[#FFB300]"], ["rejected", counts.rejected, "text-[#D50000]"]] as const).map(([k, n, cls]) => (
          <div key={k} className="rounded-xl border border-white/10 bg-white/[0.04] p-3 text-center">
            <p className={`text-xl font-black ${cls}`}>{n}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/40">{k}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
          <Input className="border-white/10 bg-white/5 pl-9" placeholder="Search name, entity, country…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <Select value={roleF} onValueChange={setRoleF}>
          <SelectTrigger className="border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All roles</SelectItem>
            <SelectItem value="investor">Investors</SelectItem>
            <SelectItem value="founder">Founders</SelectItem>
          </SelectContent>
        </Select>
        <Select value={industryF} onValueChange={setIndustryF}>
          <SelectTrigger className="border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All industries</SelectItem>
            {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger className="border-white/10 bg-white/5"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="verified">Verified</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {allInterests.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-black uppercase tracking-widest text-white/30">interest-wise</span>
          {allInterests.map((i) => (
            <button key={i} onClick={() => setInterestF(interestF === i ? "" : i)}
              className={`rounded-full border px-2.5 py-1 text-[10px] font-bold transition ${interestF === i ? "border-[#3B4EFA] bg-[#3B4EFA]/20 text-white" : "border-white/15 text-white/50 hover:border-white/30"}`}>
              {i}
            </button>
          ))}
          {interestF && <button onClick={() => setInterestF("")} className="text-[10px] text-white/40 underline">clear</button>}
        </div>
      )}

      <div className="space-y-2">
        {rows.length === 0 && <p className="rounded-xl border border-dashed border-white/15 p-6 text-center text-sm text-white/40">No members match these filters.</p>}
        {rows.map((v) => <MemberRow key={v.id} v={v} onToggle={toggle} />)}
      </div>
    </div>
  );
}
