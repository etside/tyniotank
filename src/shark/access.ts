import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Deal } from "./deals";

/* ───────── NDA + admin + listing overrides (persisted; frontend-MVP backend) ─────────
   NOTE: client-side credentials are demo-only. Production needs a real auth backend. */

export interface NdaRecord {
  dealId: string;
  signedAt: number;
  investorName: string;
}
export interface ListingOverride {
  ask?: number;
  equity?: number;
  tagline?: string;
  stage?: string;
  hidden?: boolean;
}
export interface VerificationRequest {
  id: string;
  role: "investor" | "founder";
  name: string;
  entity: string;
  detail: string;
  status: "pending" | "verified" | "rejected";
  submittedAt: number;
}

interface AccessState {
  adminSession: boolean;
  ndas: NdaRecord[];
  overrides: Record<string, ListingOverride>;
  verifications: VerificationRequest[];
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  signNda: (dealId: string, investorName: string) => void;
  setOverride: (dealId: string, o: ListingOverride) => void;
  submitVerification: (r: Omit<VerificationRequest, "id" | "status" | "submittedAt">) => void;
  decideVerification: (id: string, decision: "verified" | "rejected") => void;
}

const OWNER_EMAIL = "owner@tjms.com";
const OWNER_PASS = "Kptjms991"; // demo-only; rotate in a real backend

export const useAccess = create<AccessState>()(
  persist(
    (set, get) => ({
      adminSession: false,
      ndas: [],
      overrides: {},
      verifications: [
        { id: "v1", role: "investor", name: "Shark Capital", entity: "Shark Capital Partners LLC", detail: "Family office, $40M AUM, SEC Reg D familiar", status: "pending", submittedAt: Date.now() - 86400000 },
        { id: "v2", role: "founder", name: "NeuralDesk Ltd", entity: "NeuralDesk", detail: "Submitted DaddyAI pitch — audited MRR attached", status: "pending", submittedAt: Date.now() - 43200000 },
        { id: "v3", role: "investor", name: "Blue Harbor", entity: "Blue Harbor Fund I", detail: "Category deposits: AI SaaS, FinTech", status: "verified", submittedAt: Date.now() - 172800000 },
      ],
      login: (email, pass) => {
        const ok = email.trim().toLowerCase() === OWNER_EMAIL && pass === OWNER_PASS;
        if (ok) set({ adminSession: true });
        return ok;
      },
      logout: () => set({ adminSession: false }),
      signNda: (dealId, investorName) =>
        set((s) => ({ ndas: [...s.ndas.filter((n) => n.dealId !== dealId), { dealId, signedAt: Date.now(), investorName }] })),
      setOverride: (dealId, o) => set((s) => ({ overrides: { ...s.overrides, [dealId]: { ...s.overrides[dealId], ...o } } })),
      submitVerification: (r) =>
        set((s) => ({ verifications: [{ ...r, id: `v${Date.now()}`, status: "pending", submittedAt: Date.now() }, ...s.verifications] })),
      decideVerification: (id, decision) =>
        set((s) => ({ verifications: s.verifications.map((v) => (v.id === id ? { ...v, status: decision } : v)) })),
    }),
    { name: "tynio-access" }
  )
);

/* effective listing = repo deal merged with admin override */
export function effectiveDeal(d: Deal, overrides: Record<string, ListingOverride>): Deal & { hidden?: boolean } {
  const o = overrides[d.id];
  if (!o) return d;
  return { ...d, ask: o.ask ?? d.ask, equity: o.equity ?? d.equity, tagline: o.tagline ?? d.tagline, stage: o.stage ?? d.stage, hidden: o.hidden };
}
