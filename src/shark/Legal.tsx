import { useState } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const DOCS: { id: string; title: string; body: [string, string][] }[] = [
  { id: "tos", title: "Terms of Service (A · General / B · Investor / C · Startup)", body: [
    ["Part A — General", "Access is granted revocably; you are responsible for account security and acceptable use. Platform IP (marks, code, scoring UI) is licensed, not transferred. Misuse, scraping, or circumvention of deposit gates terminates access."],
    ["Part B — Investor", "Eligibility requires completed KYC/AML and a category deposit held in escrow. Bids are irrevocable once submitted. A winning investor that fails to execute the term sheet within the specified window forfeits the deposit, split between the platform and the startup. Deposits are auto-refunded when no bid wins or upon withdrawal before the registered pitch."],
    ["Part C — Startup", "Pitch submissions must be accurate and non-confidential to third parties. Rule-engine weights must be configured before the bidding window opens and are immutable during it. Term-sheet acceptance triggers data-room obligations; the startup grants the winning investor reasonable diligence access."]] },
  { id: "privacy", title: "Privacy Policy", body: [
    ["Data collected", "KYC data (ID documents, facial scans), financial data (deposit history, bid history), and usage data (pitch-room interactions)."],
    ["Purpose", "Identity verification, deposit processing, bidding-rule enforcement, and AML/CFT compliance."],
    ["Sharing", "KYC providers, escrow partners, and regulators upon lawful request."],
    ["Your rights", "Access, correction, and deletion — subject to legal retention requirements."]] },
  { id: "risk", title: "Risk Disclosure", body: [
    ["High risk", "Investing in private-company securities is long-term and high-risk. Shares are illiquid; total loss of capital is possible."],
    ["No recommendation", "The platform makes no investment recommendations, does not verify startup statements, and does not background-check investors. Seek independent legal and financial advice."]] },
  { id: "kyc", title: "KYC / AML Policy", body: [
    ["Programs", "Customer Identification Program (CIP), Customer Due Diligence (CDD), and Enhanced Due Diligence (EDD) for high-risk users. KYC depth scales with risk level and deposit amount."],
    ["Screening", "All users screened against sanctions and PEP lists before deposit acceptance."],
    ["Records", "KYC and transaction records retained for the legally required period (typically 5 years)."]] },
  { id: "escrow", title: "Escrow & Deposit Agreement", body: [
    ["Held, not captured", "A minimum refundable deposit is held in a custodial escrow account (Stripe Connect / Dwolla) and released only upon deal close."],
    ["Forfeiture", "Winning investor defaults within the execution window → deposit forfeited (split platform/startup)."],
    ["Refund", "No winning bid, or withdrawal before the registered pitch → automatic refund."]] },
  { id: "loi", title: "Instant Result / Term Sheet Disclaimer", body: [
    ["Legal framing", "The Instant Result published at bid close is a Binding Letter of Intent (LOI) or Non-Binding Term Sheet — not a transfer of funds."],
    ["Next steps", "Actual funding requires legal due diligence, definitive agreements, and escrow release (30–60 days)."],
    ["Platform role", "Tynio Tank facilitates the connection and is not a party to the final investment agreement."]] },
  { id: "dispute", title: "Dispute Resolution", body: [
    ["Arbitration", "All disputes are resolved by binding arbitration before a neutral arbitrator. No judge, jury, or class actions."],
    ["Governing law", "Delaware, USA."]] },
  { id: "cookies", title: "Cookie Policy", body: [
    ["Purpose", "Analytics, session management, and real-time bid tracking."],
    ["Consent", "GDPR/CCPA-compliant consent banner for EU and California users; non-essential cookies require opt-in."]] },
];

export default function Legal() {
  const [type] = useState("legal");
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Legal & Compliance</h1><p className="mt-1 text-sm text-white/50">Templates for review by a FinTech attorney (SEC Regulation D / AML) before launch. ({type})</p></div>
      <Accordion type="single" collapsible className="rounded-2xl border border-white/10 bg-white/[0.04] px-5">
        {DOCS.map((d) => (
          <AccordionItem key={d.id} value={d.id} className="border-white/10">
            <AccordionTrigger className="text-left font-bold hover:text-[#0EA5E9]">{d.title}</AccordionTrigger>
            <AccordionContent className="space-y-3 text-sm text-white/70">
              {d.body.map(([h, t]) => <p key={h}><b className="text-white">{h}: </b>{t}</p>)}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
