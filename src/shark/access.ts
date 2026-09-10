import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Deal } from "./deals";
import { useShark } from "./store";

/* ───────── NDA + admin + listing overrides (persisted; frontend-MVP backend) ─────────
   NOTE: client-side credentials are demo-only. Production needs a real auth backend. */

export interface NdaRecord {
  dealId: string;
  signedAt: number;
  investorName: string;
}
export interface ListingOverride {
  name?: string;
  ask?: number;
  equity?: number;
  tagline?: string;
  stage?: string;
  category?: string;
  highlights?: [string, string];
  hidden?: boolean;
  featured?: boolean;
}
export interface CustomDeal {
  id: string;
  name: string;
  tagline: string;
  category: string;
  stage: string;
  ask: number;
  equity: number;
  repo: string;
  highlights: [string, string];
  brief: { problem: string; product: string; traction: string; market: string; model: string; whyNow: string; risks: string };
  custom: true;
  createdAt: number;
}
export interface KycDoc {
  id: string;
  label: string;
  name: string;
  type: string;
  size: number;
  dataUrl?: string; // small docs stored inline; large ones metadata-only
}

export interface VerificationRequest {
  id: string;
  role: "investor" | "founder";
  name: string;
  entity: string;
  detail: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: number;
  /* onboarding KYC fields (absent on legacy seed rows) */
  ref?: string;
  email?: string;
  phone?: string;
  country?: string;
  industry?: string;
  stage?: string;
  stages?: string[];
  interests?: string[];
  ticket?: string;
  idType?: string;
  idNumber?: string;
  regNumber?: string;
  taxId?: string;
  ask?: number;
  equity?: number;
  docs: KycDoc[];
}

interface AccessState {
  adminSession: boolean;
  ndas: NdaRecord[];
  overrides: Record<string, ListingOverride>;
  customDeals: CustomDeal[];
  verifications: VerificationRequest[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  signNda: (dealId: string, investorName: string) => void;
  setOverride: (dealId: string, o: ListingOverride) => void;
  addCustomDeal: (deal: Omit<CustomDeal, "custom" | "createdAt">) => void;
  removeCustomDeal: (id: string) => void;
  submitVerification: (r: Omit<VerificationRequest, "id" | "status" | "submittedAt">) => VerificationRequest;
  decideVerification: (id: string, decision: "verified" | "rejected") => void;
  toggleVerification: (id: string) => void;
}

const OWNER_EMAIL = "owner@tjms.com";
const OWNER_PASS = "Kptjms991";

export const useAccess = create<AccessState>()(
  persist(
    (set) => ({
      adminSession: false,
      ndas: [],
      overrides: {},
      customDeals: [],
      verifications: [
        { id: "v1", role: "investor", name: "Shark Capital", entity: "Shark Capital Partners LLC", detail: "Family office, $40M AUM, SEC Reg D familiar", status: "pending", submittedAt: Date.now() - 86400000, docs: [], country: "United States", industry: "SaaS", interests: ["SaaS", "FinTech"], ticket: "$250K–$1M" },
        { id: "v2", role: "founder", name: "NeuralDesk Ltd", entity: "NeuralDesk", detail: "Submitted DaddyAI pitch — audited MRR attached", status: "pending", submittedAt: Date.now() - 43200000, docs: [], country: "Bangladesh", industry: "AI & Machine Learning" },
        { id: "v3", role: "investor", name: "Blue Harbor", entity: "Blue Harbor Fund I", detail: "Category deposits: AI SaaS, FinTech", status: "verified", submittedAt: Date.now() - 172800000, docs: [], country: "Singapore", industry: "FinTech", interests: ["FinTech", "Climate & Energy"], ticket: "$1M+" },
      ],
      login: (email, pass) => {
        const ok = email.trim().toLowerCase() === OWNER_EMAIL && pass === OWNER_PASS;
        if (ok) set({ adminSession: true });
        return ok;
      },
      logout: () => set({ adminSession: false }),
      signNda: (dealId, investorName) =>
        set((s) => ({ ndas: [...s.ndas.filter((n) => n.dealId !== dealId), { dealId, signedAt: Date.now(), investorName }] })),
      setOverride: (dealId, o) =>
        set((s) => ({ overrides: { ...s.overrides, [dealId]: { ...s.overrides[dealId], ...o } } })),
      addCustomDeal: (deal) =>
        set((s) => ({ customDeals: [...s.customDeals, { ...deal, custom: true, createdAt: Date.now() }] })),
      removeCustomDeal: (id) =>
        set((s) => ({ customDeals: s.customDeals.filter((d) => d.id !== id) })),
      submitVerification: (r) => {
        const rec: VerificationRequest = { ...r, id: `v${Date.now()}`, status: "pending", submittedAt: Date.now() };
        set((s) => ({ verifications: [rec, ...s.verifications] }));
        return rec;
      },
      decideVerification: (id, decision) =>
        set((s) => {
          const target = s.verifications.find((v) => v.id === id);
          if (target && target.name === useShark.getState().session.name)
            useShark.getState().setKyc(decision === "verified" ? "verified" : "none");
          return { verifications: s.verifications.map((v) => (v.id === id ? { ...v, status: decision } : v)) };
        }),
      toggleVerification: (id) =>
        set((s) => ({
          verifications: s.verifications.map((v) => {
            if (v.id !== id) return v;
            const next = v.status === "verified" ? "pending" : "verified";
            if (v.name === useShark.getState().session.name) useShark.getState().setKyc(next);
            return { ...v, status: next };
          }),
        })),
    }),
    {
      name: "tynio-access",
      version: 2,
      migrate: (persisted: unknown, version: number) => {
        const p = (persisted ?? {}) as Partial<AccessState>;
        // v1 rows predate onboarding fields; backfill docs so admin rendering is safe
        if (version < 2 && Array.isArray(p.verifications))
          p.verifications = p.verifications.map((v) => ({ docs: [], ...v }));
        return { ...p, verifications: p.verifications ?? [] } as AccessState;
      },
    }
  )
);

/* on load: adopt the newest user-submitted application (seeds have no ref) as this session's identity + KYC state */
export function reconcileSession() {
  const vs = useAccess.getState().verifications.filter((v) => !!v.ref);
  if (vs.length === 0) return;
  const latest = [...vs].sort((a, b) => b.submittedAt - a.submittedAt)[0];
  const s = useShark.getState();
  s.setRole(latest.role);
  s.setName(latest.name);
  s.setKyc(latest.status === "verified" ? "verified" : latest.status === "pending" ? "pending" : "none");
}

/* effective listing = repo deal merged with admin override */
export function effectiveDeal(d: Deal | CustomDeal, overrides: Record<string, ListingOverride>): Deal & { hidden?: boolean } {
  const o = overrides[d.id];
  if (!o) return { ...d, featured: (d as Deal).featured } as Deal & { hidden?: boolean };
  const base = d as Deal;
  return {
    ...d,
    name: o.name ?? base.name,
    ask: o.ask ?? base.ask,
    equity: o.equity ?? base.equity,
    tagline: o.tagline ?? base.tagline,
    stage: o.stage ?? base.stage,
    category: (o.category as Deal["category"]) ?? base.category,
    highlights: o.highlights ?? base.highlights,
    hidden: o.hidden,
    featured: o.featured ?? base.featured,
  };
}
