/* Country-aware e-KYC profiles for founders (business registration) and
   investors (identity). Each country drives the dynamic document checklist. */

export interface CountryProfile {
  code: string;
  name: string;
  currency: string;
  idTypes: string[]; // personal identity documents
  regLabel: string; // business registration number label
  taxLabel: string; // tax identifier label
  bizDocs: { key: string; label: string; hint?: string }[]; // required business uploads
}

export const COUNTRIES: CountryProfile[] = [
  {
    code: "BD",
    name: "Bangladesh",
    currency: "BDT",
    idTypes: ["National ID (NID)", "Passport", "Driving Licence"],
    regLabel: "RJSC / Trade Licence number",
    taxLabel: "TIN (Taxpayer ID)",
    bizDocs: [
      { key: "incorporation", label: "Certificate of Incorporation (RJSC)" },
      { key: "trade_licence", label: "Trade Licence copy" },
      { key: "tax_cert", label: "TIN certificate" },
      { key: "bank_letter", label: "Bank account maintenance letter" },
    ],
  },
  {
    code: "US",
    name: "United States",
    currency: "USD",
    idTypes: ["Passport", "Driver's License", "State ID"],
    regLabel: "EIN / State registration number",
    taxLabel: "EIN (Tax ID)",
    bizDocs: [
      { key: "incorporation", label: "Articles of Incorporation / Organization" },
      { key: "good_standing", label: "Certificate of Good Standing" },
      { key: "w9", label: "Signed W-9 / IRS letter" },
      { key: "operating_agmt", label: "Operating agreement (LLC) or Bylaws (Corp)" },
    ],
  },
  {
    code: "GB",
    name: "United Kingdom",
    currency: "GBP",
    idTypes: ["Passport", "Driving Licence", "BRP"],
    regLabel: "Companies House number",
    taxLabel: "UTR / VAT number",
    bizDocs: [
      { key: "incorporation", label: "Certificate of Incorporation" },
      { key: "cs01", label: "Confirmation Statement (CS01)" },
      { key: "vat_cert", label: "VAT registration certificate" },
      { key: "bank_letter", label: "Business bank statement (≤3 months)" },
    ],
  },
  {
    code: "AE",
    name: "United Arab Emirates",
    currency: "AED",
    idTypes: ["Emirates ID", "Passport"],
    regLabel: "Trade Licence number (DED / Free Zone)",
    taxLabel: "TRN / Corporate Tax number",
    bizDocs: [
      { key: "trade_licence", label: "Valid Trade Licence" },
      { key: "moa", label: "MOA / Shareholder agreement" },
      { key: "establishment_card", label: "Establishment Card" },
    ],
  },
  {
    code: "IN",
    name: "India",
    currency: "INR",
    idTypes: ["Aadhaar", "PAN", "Passport"],
    regLabel: "CIN / GSTIN",
    taxLabel: "PAN / GSTIN",
    bizDocs: [
      { key: "coi", label: "Certificate of Incorporation" },
      { key: "gst", label: "GST registration certificate" },
      { key: "pan", label: "Company PAN card" },
    ],
  },
  {
    code: "SG",
    name: "Singapore",
    currency: "SGD",
    idTypes: ["NRIC", "FIN", "Passport"],
    regLabel: "UEN (ACRA number)",
    taxLabel: "UEN / GST number",
    bizDocs: [
      { key: "bizfile", label: "ACRA BizFile extract (≤3 months)" },
      { key: "constitution", label: "Company Constitution" },
      { key: "board_res", label: "Board resolution naming signatory" },
    ],
  },
  {
    code: "CA",
    name: "Canada",
    currency: "CAD",
    idTypes: ["Passport", "Driver's License", "Provincial ID"],
    regLabel: "Business Number (BN9)",
    taxLabel: "BN / GST-HST number",
    bizDocs: [
      { key: "incorporation", label: "Certificate of Incorporation" },
      { key: "corp_profile", label: "Corporation profile report" },
      { key: "minute_book", label: "Minute book / Bylaws" },
    ],
  },
  {
    code: "AU",
    name: "Australia",
    currency: "AUD",
    idTypes: ["Passport", "Driver's Licence", "Medicare Card"],
    regLabel: "ACN",
    taxLabel: "ABN / TFN",
    bizDocs: [
      { key: "asic_extract", label: "ASIC company extract" },
      { key: "abn_cert", label: "ABN registration certificate" },
      { key: "constitution", label: "Company constitution" },
    ],
  },
  {
    code: "MY",
    name: "Malaysia",
    currency: "MYR",
    idTypes: ["MyKad", "Passport"],
    regLabel: "SSM registration number",
    taxLabel: "Tax ID / SST number",
    bizDocs: [
      { key: "ssm_cert", label: "SSM Certificate of Incorporation" },
      { key: "form_24_49", label: "Section 17 / Form 24 & 49" },
      { key: "bank_letter", label: "Company bank statement" },
    ],
  },
  {
    code: "SA",
    name: "Saudi Arabia",
    currency: "SAR",
    idTypes: ["National ID", "Iqama", "Passport"],
    regLabel: "CR number (Ministry of Commerce)",
    taxLabel: "VAT / ZATCA number",
    bizDocs: [
      { key: "cr_cert", label: "Commercial Registration certificate" },
      { key: "moa", label: "Articles of Association" },
      { key: "gosi", label: "GOSI / ZATCA registration" },
    ],
  },
  {
    code: "DE",
    name: "Germany",
    currency: "EUR",
    idTypes: ["Personalausweis", "Passport", "Residence Permit"],
    regLabel: "Handelsregister (HRB) number",
    taxLabel: "Steuernummer / VAT ID",
    bizDocs: [
      { key: "handelsregister", label: "Handelsregister extract" },
      { key: "gewerbeanmeldung", label: "Gewerbeanmeldung / Gesellschaftsvertrag" },
      { key: "vat_cert", label: "VAT ID confirmation (USt-IdNr)" },
    ],
  },
  {
    code: "OTHER",
    name: "Other / International",
    currency: "USD",
    idTypes: ["Passport", "National ID", "Driving Licence"],
    regLabel: "Company registration number",
    taxLabel: "Tax identification number",
    bizDocs: [
      { key: "incorporation", label: "Certificate of Incorporation" },
      { key: "tax_cert", label: "Tax registration certificate" },
      { key: "proof_address", label: "Proof of registered address" },
    ],
  },
];

export const countryByCode = (code?: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

export const INDUSTRIES = [
  "AI & Machine Learning",
  "FinTech",
  "HealthTech",
  "Climate & Energy",
  "EdTech",
  "E-commerce & Retail",
  "Logistics & Mobility",
  "AgriTech",
  "Cybersecurity",
  "SaaS",
  "PropTech & Real Estate",
  "Media & Gaming",
];

export const INVESTOR_TYPES = ["Individual / Angel", "Family Office", "Institutional / VC Fund", "Syndicate / Club", "Corporate / Strategic"];

export const TICKET_BANDS = ["Under $10K", "$10K–$50K", "$50K–$250K", "$250K–$1M", "$1M+"];

export const COMPANY_STAGES = ["Idea", "Pre-seed", "Seed", "Series A", "Growth"];

export const INVESTOR_STAGES = ["Idea", "Pre-seed", "Seed", "Series A", "Growth", "Pre-IPO"];

/* Max inline doc size — keeps localStorage safe; larger files store metadata only */
export const MAX_DOC_MB = 1.5;
export const MAX_DOC_BYTES = MAX_DOC_MB * 1024 * 1024;
export const ACCEPTED_DOC_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
