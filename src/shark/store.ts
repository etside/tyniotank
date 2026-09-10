import { create } from "zustand";

/* ───────────────────────── types ───────────────────────── */

export type Category = "AI SaaS" | "FinTech" | "HealthTech" | "ClimateTech";
export type PitchStatus = "scheduled" | "live" | "completed";
export type BidStatus = "leading" | "outbid" | "won" | "lost";

export interface Pitch {
  id: string;
  startup: string;
  tagline: string;
  logoLetter: string;
  category: Category;
  ask: number; // USD
  equity: number; // %
  status: PitchStatus;
  endsInSec: number; // remaining when live
  ruleWeights: { capital: number; equity: number; valueAdd: number; speed: number };
  locked: boolean; // sliders locked once live
}

export interface Bid {
  id: string;
  pitchId: string;
  investor: string;
  amount: number;
  equity: number;
  valueAdd: string;
  score: number;
  submittedAt: number;
  mine?: boolean;
}

export interface Session {
  role: "investor" | "founder";
  name: string;
  kyc: "none" | "pending" | "verified";
  deposit: number; // escrow balance
  holds: number;
  categories: Category[]; // deposited-for categories
}

/* ───────────────────────── seed data ───────────────────────── */

const seedPitches: Pitch[] = [
  { id: "p1", startup: "NeuralDesk", tagline: "Agentic helpdesk that resolves tickets before humans see them", logoLetter: "N", category: "AI SaaS", ask: 500000, equity: 8, status: "live", endsInSec: 42 * 60, ruleWeights: { capital: 40, equity: 25, valueAdd: 20, speed: 15 }, locked: true },
  { id: "p2", startup: "LedgerLoop", tagline: "Real-time reconciliation API for embedded finance", logoLetter: "L", category: "FinTech", ask: 750000, equity: 10, status: "live", endsInSec: 18 * 60, ruleWeights: { capital: 45, equity: 25, valueAdd: 15, speed: 15 }, locked: true },
  { id: "p3", startup: "PulseWear Health", tagline: "Clinical-grade vitals from a $49 patch", logoLetter: "P", category: "HealthTech", ask: 300000, equity: 12, status: "scheduled", endsInSec: 0, ruleWeights: { capital: 35, equity: 30, valueAdd: 20, speed: 15 }, locked: false },
  { id: "p4", startup: "GridPulse", tagline: "Virtual power plant orchestration for C&I sites", logoLetter: "G", category: "ClimateTech", ask: 1200000, equity: 6, status: "scheduled", endsInSec: 0, ruleWeights: { capital: 40, equity: 20, valueAdd: 25, speed: 15 }, locked: false },
  { id: "p5", startup: "ForgeOps", tagline: "CI/CD for on-prem GPU fleets", logoLetter: "F", category: "AI SaaS", ask: 400000, equity: 9, status: "completed", endsInSec: 0, ruleWeights: { capital: 40, equity: 25, valueAdd: 20, speed: 15 }, locked: true },
];

const rivalNames = ["Shark Capital", "Blue Harbor", "Vertex Ventures", "Northwind", "Cedar Fund", "Atlas Partners"];

/* ───────────────────────── scoring (algorithm, not amount) ───────────────────────── */

export function bidScore(b: Pick<Bid, "amount" | "equity" | "valueAdd">, w: Pitch["ruleWeights"], ask: number) {
  const capital = Math.min(1, b.amount / (ask * 1.5)) * w.capital;
  const equity = (1 - Math.min(1, b.equity / 25)) * w.equity;
  const va = b.valueAdd.trim().length === 0 ? 0 : Math.min(1, b.valueAdd.trim().length / 60) * w.valueAdd;
  const speed = Math.max(0, 1 - (Date.now() - b.submittedAt) / 900000) * w.speed;
  return Math.round(capital + equity + va + speed);
}

/* ───────────────────────── store ───────────────────────── */

interface SharkState {
  session: Session;
  pitches: Pitch[];
  bids: Bid[];
  connected: boolean;
  resultModal: { pitchId: string; winner: Bid } | null;
  setRole: (r: Session["role"]) => void;
  setKyc: (k: Session["kyc"]) => void;
  deposit: (cat: Category, amt: number) => void;
  submitBid: (pitchId: string, amount: number, equity: number, valueAdd: string) => { ok: boolean; reason?: string };
  tick: () => void;
  setConnected: (c: boolean) => void;
  recover: () => void; // on reconnect: refetch snapshot
  configureWeights: (pitchId: string, w: Pitch["ruleWeights"]) => void;
  goLive: (pitchId: string) => void;
  acceptTermSheet: () => void;
}

export const useShark = create<SharkState>((set, get) => ({
  session: { role: "investor", name: "You", kyc: "verified", deposit: 2500, holds: 500, categories: ["AI SaaS", "FinTech"] },
  pitches: seedPitches,
  bids: [
    { id: "b1", pitchId: "p1", investor: "Shark Capital", amount: 520000, equity: 9, valueAdd: "Enterprise distribution across 400 accounts", score: 0, submittedAt: Date.now() - 400000 },
    { id: "b2", pitchId: "p1", investor: "Blue Harbor", amount: 500000, equity: 8, valueAdd: "Hands-on GTM mentorship", score: 0, submittedAt: Date.now() - 300000 },
    { id: "b3", pitchId: "p2", investor: "Vertex Ventures", amount: 800000, equity: 11, valueAdd: "Banking license advisory", score: 0, submittedAt: Date.now() - 200000 },
  ],
  connected: true,
  resultModal: null,

  setRole: (role) => set((s) => ({ session: { ...s.session, role } })),
  setKyc: (kyc) => set((s) => ({ session: { ...s.session, kyc } })),
  deposit: (cat, amt) =>
    set((s) => ({
      session: {
        ...s.session,
        deposit: s.session.deposit + amt,
        categories: s.session.categories.includes(cat) ? s.session.categories : [...s.session.categories, cat],
      },
    })),

  // Atomic bid: validation + ranking + append in one synchronous update (Redis-Lua analogue)
  submitBid: (pitchId, amount, equity, valueAdd) => {
    const s = get();
    const pitch = s.pitches.find((p) => p.id === pitchId);
    if (!pitch || pitch.status !== "live") return { ok: false, reason: "Bidding window closed." };
    if (s.session.kyc !== "verified") return { ok: false, reason: "Complete KYC to bid." };
    if (!s.session.categories.includes(pitch.category)) return { ok: false, reason: `No deposit for ${pitch.category}.` };
    if (amount < 1000 || equity <= 0 || equity > 50) return { ok: false, reason: "Invalid bid parameters." };
    if (s.bids.some((b) => b.mine && b.pitchId === pitchId)) return { ok: false, reason: "Bids are locked once submitted — one per investor." };
    const bid: Bid = { id: `b${Date.now()}`, pitchId, investor: s.session.name, amount, equity, valueAdd, score: 0, submittedAt: Date.now(), mine: true };
    set({ bids: [...s.bids, bid] });
    return { ok: true };
  },

  tick: () => {
    const s = get();
    let closed: { pitchId: string; winner: Bid } | null = null;
    const pitches = s.pitches.map((p) => {
      if (p.status !== "live") return p;
      const endsInSec = p.endsInSec - 1;
      if (endsInSec <= 0) {
        const pb = s.bids.filter((b) => b.pitchId === p.id);
        if (pb.length && !closed) {
          const ranked = pb.map((b) => ({ ...b, score: bidScore(b, p.ruleWeights, p.ask) })).sort((a, b) => b.score - a.score);
          closed = { pitchId: p.id, winner: ranked[0] };
        }
        return { ...p, status: "completed" as PitchStatus, endsInSec: 0 };
      }
      return { ...p, endsInSec };
    });
    // rival activity: occasionally inject a bid into a live pitch
    let bids = s.bids;
    if (Math.random() < 0.04) {
      const live = pitches.filter((p) => p.status === "live");
      if (live.length) {
        const p = live[Math.floor(Math.random() * live.length)];
        bids = [...bids, { id: `r${Date.now()}`, pitchId: p.id, investor: rivalNames[Math.floor(Math.random() * rivalNames.length)], amount: Math.round(p.ask * (0.9 + Math.random() * 0.4) / 1000) * 1000, equity: Math.round(6 + Math.random() * 8), valueAdd: ["Channel partnerships", "Compliance expertise", "Hiring network", "Regulatory relationships"][Math.floor(Math.random() * 4)], score: 0, submittedAt: Date.now() }];
      }
    }
    set({ pitches, bids, ...(closed ? { resultModal: closed } : {}) });
  },

  setConnected: (connected) => set({ connected }),
  recover: () => {
    // state recovery: recompute scores from snapshot so UI never shows stale ranks
    const s = get();
    set({ bids: s.bids.map((b) => ({ ...b, score: bidScore(b, s.pitches.find((p) => p.id === b.pitchId)!.ruleWeights, s.pitches.find((p) => p.id === b.pitchId)!.ask) })) });
  },

  configureWeights: (pitchId, w) =>
    set((s) => ({ pitches: s.pitches.map((p) => (p.id === pitchId && !p.locked ? { ...p, ruleWeights: w } : p)) })),
  goLive: (pitchId) =>
    set((s) => ({ pitches: s.pitches.map((p) => (p.id === pitchId ? { ...p, status: "live", endsInSec: 60 * 60, locked: true } : p)) })),
  acceptTermSheet: () => set({ resultModal: null }),
}));

export const fmt$ = (n: number) => "$" + n.toLocaleString();
export const fmtTime = (sec: number) => `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
