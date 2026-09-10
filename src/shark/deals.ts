/* Tynio Tank deal flow — listings derived from live GitHub repos (gh analysis 2026-09-10).
   Ask/equity values are founder-configurable placeholders. Teaser is public-minimal;
   the brief unlocks only for KYC-verified investors who e-sign the deal NDA. */

export interface Deal {
  id: string;
  name: string;
  tagline: string;
  category: "AI SaaS" | "Conversational AI" | "AI Infra" | "Consumer" | "Commerce" | "Industrial";
  stage: string;
  ask: number; // USD
  equity: number; // %
  repo: string; // private origin, shown to NDA signers only
  highlights: [string, string]; // teaser bullets — the attraction hook
  brief: {
    problem: string;
    product: string;
    traction: string;
    market: string;
    model: string;
    whyNow: string;
    risks: string;
  };
}

export const DEALS: Deal[] = [
  {
    id: "daddyai", name: "DaddyAI", repo: "etside/daddyai (private)",
    tagline: "Voice-first AI sales training console — train agents by talking to them.",
    category: "AI SaaS", stage: "Production", ask: 500000, equity: 8,
    highlights: ["Voice → trained agent in minutes: record, transcribe, extract, deploy", "Omnichannel day one: WhatsApp, Instagram, Facebook, web — plus ERP inventory sync"],
    brief: {
      problem: "SMBs can't afford sales trainers, yet their WhatsApp/IG revenue depends on agent quality. Existing chatbot builders require prompt-engineering skills sellers don't have.",
      product: "A production-ready console where agents are trained by natural voice conversation. Structured extraction turns recordings into skills; a skill-builder generates customer-facing Q&A from training data. White-label + REST API for resellers; MCP integration exposes trained agents to ChatGPT/Claude.",
      traction: "Full platform shipped: voice training, omnichannel connectors, real-time ERP inventory sync, white-label program and MCP hooks are live in the private production repo.",
      market: "SMB conversational commerce. Bangladesh alone: ~200K active FB/WhatsApp commerce pages; white-label creates an agency reseller wedge.",
      model: "SaaS tiers per agent + white-label reseller licensing + API metering.",
      whyNow: "Voice input + LLM extraction crossed the usability threshold; competitors train by typing. Reseller demand for white-label is unmet.",
      risks: "Channel-platform policy shifts; Bengali/English ASR quality variance; single-region GTM focus until seed.",
    },
  },
  {
    id: "salesdaddy", name: "SalesDaddy", repo: "etside/salesdaddy · sales-ai-ally (private)",
    tagline: "Bilingual AI customer service for Bangladeshi businesses — every channel, inventory-aware.",
    category: "Conversational AI", stage: "Production", ask: 750000, equity: 10,
    highlights: ["Bengali + English NLP pipeline: intent, sentiment, entity — native, not translated", "Multi-tenant isolation with live order + inventory awareness across WhatsApp/Messenger/IG/web"],
    brief: {
      problem: "Bangladeshi businesses run customer service on untrained staff replying to 4 channels. Global AI support tools are English-only and channel-fragile for this market.",
      product: "Multi-tenant SaaS where each tenant gets an isolated AI workspace (chat + voice) that natively understands Bengali and English, syncs product catalog in real time, and manages orders inside the conversation. Zero-server or self-hosted deploy.",
      traction: "Both codebases (main + ally) are production repos with the full tenant/channel/NLP stack committed — platform is deploy-ready, GTM is next.",
      market: "Bottom-of-pyramid commerce automation: Bangladesh SMB service automation is effectively greenfield; regional expansion (Indonesia, Pakistan) is the same problem set.",
      model: "Per-tenant SaaS subscription + channel/message volume tiers + self-host enterprise licensing.",
      whyNow: "bKash/Nagad rails + Messenger commerce dominance + mature bilingual LLMs arrived together in the last 18 months.",
      risks: "Bengali NLU edge-case quality; Meta platform dependency; telecom/market education costs.",
    },
  },
  {
    id: "smartmessenger", name: "Smart Messenger AI", repo: "etside/smart-messenger-ai (private)",
    tagline: "Messenger commerce agent with live catalog grounding — text and voice replies.",
    category: "Conversational AI", stage: "Live pilot", ask: 300000, equity: 12,
    highlights: ["pgvector product search + live stock fetch in the reply loop — grounded, not hallucinated", "Voice-reply pipeline: LLM gateway returns audio URL, delivered as Messenger voice attachments"],
    brief: {
      problem: "FB-commerce sellers lose sales answering the same stock/price questions; rule-based bots break on every catalog change.",
      product: "Supabase Edge Function platform: tenant discovery via page_id, vector search over the synced catalog, live inventory fetch, grounded text + voice replies via Graph API, pgmq for async processing under Meta's timeout window.",
      traction: "Architecture is fully specified and implemented in the private repo — webhook → tenant → vector search → live stock → grounded reply loop is end-to-end.",
      market: "Every Messenger-first shop is a tenant; install flow is a page connect + shop URL.",
      model: "Usage-based (replies) + premium voice tier.",
      whyNow: "Voice replies are now a first-class Messenger format; vector DBs made catalog grounding cheap.",
      risks: "Meta Graph API rate/policy limits; LLM gateway cost per voice minute; single-platform concentration.",
    },
  },
  {
    id: "mcpserver", name: "Tynio MCP Grid", repo: "etside/mcp-server (private)",
    tagline: "The agent-tool protocol layer for commerce — exposes shop operations to every LLM.",
    category: "AI Infra", stage: "MVP shipped", ask: 200000, equity: 6,
    highlights: ["Model Context Protocol server exposing catalog, order and inventory tools to ChatGPT/Claude", "Ships as the connective tissue of a live agency stack (Laravel API + React frontend + CI/CD)"],
    brief: {
      problem: "Every LLM agent integration is bespoke glue code. Businesses need their commerce operations addressable by any agent runtime without rebuilding integrations.",
      product: "A Node/TypeScript MCP server that models commerce operations (catalog, stock, orders) as first-class agent tools, deployed against the production EngineersTech stack.",
      traction: "Live in production as part of a revenue-generating agency platform — dogfooded daily, not a paper spec.",
      market: "MCP is becoming the de-facto agent-tool standard; commerce is the highest-volume first vertical.",
      model: "Open-core: hosted MCP gateway subscription + enterprise self-host.",
      whyNow: "MCP adoption is compounding monthly; first movers on vertical servers own the integration surface.",
      risks: "Protocol churn; big-platform competition bundling equivalent tooling.",
    },
  },
  {
    id: "banglashop", name: "Bangla Magazine", repo: "etside/bangla-shop-news (private)",
    tagline: "News feed that sells — Inshorts-style reading with an embedded marketplace.",
    category: "Consumer", stage: "MVP shipped", ask: 400000, equity: 15,
    highlights: ["Content + commerce in one scroll: every article is a checkout surface", "Full vendor admin + bKash/Nagad/card rails built in"],
    brief: {
      problem: "Bangladeshi news apps monetize only ads, while social sellers pay for reach. Nobody has fused the two surfaces.",
      product: "Bilingual (EN/BN) instant-news app with integrated e-commerce: shoppable context under stories, vendor onboarding portal, multi-rail payments (bKash, Nagad, card).",
      traction: "Complete mobile app + vendor admin implemented in the private repo, including payment integrations.",
      market: "News-app DAU is the cheapest acquisition channel in the market; commerce attach-rate is the monetization unlock.",
      model: "Commission on marketplace GMV + promoted placements + vendor SaaS.",
      whyNow: "Mobile-first payments penetration crossed 50M+ accounts; content-commerce attach is proven in adjacent markets.",
      risks: "Content moderation load; vendor quality control; two-sided cold start.",
    },
  },
  {
    id: "bigwing", name: "BigWing Materials", repo: "etside/big-wing-steel (private)",
    tagline: "Digitizing Bangladesh's construction-materials supply chain, starting with steel.",
    category: "Industrial", stage: "Pilot customer", ask: 250000, equity: 20,
    highlights: ["Live industrial catalog platform for a real supplier (structural steel, piling, scaffolding)", "Quote-to-order digitization for mega-project procurement"],
    brief: {
      problem: "Mega-project procurement still runs on phone calls and paper quotes for structural materials; price discovery is opaque and slow.",
      product: "Industrial-grade B2B commerce platform for heavy materials — structured catalog, quote workflows, project-scale order tracking — seeded by an operating supplier (Big Wing Bangladesh).",
      traction: "Production platform live for the anchor supplier with full catalog coverage.",
      market: "Bangladesh construction input market is multi-billion USD annually; digitization is near zero.",
      model: "Supplier subscriptions + transaction fees on quotes converted to orders.",
      whyNow: "Infrastructure megaproject pipeline (bridges, metros, power) keeps demand structural; suppliers are actively seeking digital channels.",
      risks: "Low digital literacy among incumbent suppliers; credit/payment terms complexity in B2B.",
    },
  },
  {
    id: "dakaheralds", name: "Dhaka Heralds", repo: "etside/news-app (public)",
    tagline: "Breaking news from Bangladesh, rebuilt for the scroll generation.",
    category: "Consumer", stage: "MVP shipped", ask: 150000, equity: 10,
    highlights: ["Card-stack news UX with sub-second publish flow", "Commerce-ready surface — ad inventory beyond banner fatigue"],
    brief: {
      problem: "Bangladeshi news consumption moved to feeds, but publisher monetization is still banner-era.",
      product: "Modern TypeScript news app with inshorts-style card presentation and native integration surfaces for commerce and rich ad formats.",
      traction: "Frontend MVP shipped and public; content pipeline is the build-out.",
      market: "Bangladesh has one of the fastest-growing smartphone news audiences in Asia.",
      model: "Programmatic + native ads, later commerce attach (Bangla Magazine synergy).",
      whyNow: "Regional publishers are uninvested while consumption has fully migrated to mobile feeds.",
      risks: "Publisher licensing; CAC for news retention; thin early monetization.",
    },
  },
  {
    id: "veronica", name: "Veronica", repo: "etside/veronica (public)",
    tagline: "Luxury pret, direct from Dhaka ateliers — a D2C storefront built to convert.",
    category: "Commerce", stage: "Early revenue", ask: 100000, equity: 15,
    highlights: ["Premium fashion storefront with editorial-grade product presentation", "Cross-border-ready D2C stack on modern tooling"],
    brief: {
      problem: "South Asian luxury pret has no dedicated D2C channel — discovery happens in Instagram DMs and payments happen in cash.",
      product: "A high-polish D2C storefront for designer pret wear with lookbook-grade UX, ready for international checkout.",
      traction: "Storefront is live and public; brand pipeline is the growth lever.",
      market: "Global South-Asian diaspora luxury spend; regional premium fashion is under-served online.",
      model: "Direct margin on sales + designer commission listings.",
      whyNow: "Diaspora demand is proven on marketplaces; owned-channel economics are strictly better.",
      risks: "Inventory depth; designer exclusivity retention; logistics for delicate apparel.",
    },
  },
];
