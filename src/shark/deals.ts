/* Tynio Tank deal flow — listings derived from live GitHub repos (gh analysis 2026-09-10).
   Ask/equity values are founder-configurable placeholders. Teaser is public-minimal;
   the brief unlocks only for KYC-verified investors who e-sign the deal NDA. */

export type DealCategory = "AI SaaS" | "Conversational AI" | "AI Infra" | "Consumer" | "Commerce" | "Industrial" | "FinTech" | "HealthTech" | "Dev Tools" | "LegalTech" | "EdTech" | "SaaS";

export interface Deal {
  id: string;
  name: string;
  tagline: string;
  category: DealCategory;
  stage: string;
  ask: number; // USD
  equity: number; // %
  repo: string;
  highlights: [string, string];
  brief: {
    problem: string;
    product: string;
    traction: string;
    market: string;
    model: string;
    whyNow: string;
    risks: string;
  };
  featured?: boolean;
  custom?: boolean; // admin-created deals
}

export const DEALS: Deal[] = [
  {
    id: "daddyai", name: "DaddyAI", repo: "etside/daddyai", featured: true,
    tagline: "Voice-first AI sales training console — train agents by talking to them.",
    category: "AI SaaS", stage: "Production", ask: 500000, equity: 8,
    highlights: ["Voice → trained agent in minutes: record, transcribe, extract, deploy", "Omnichannel day one: WhatsApp, Instagram, Facebook, web — plus ERP inventory sync"],
    brief: {
      problem: "SMBs can't afford sales trainers, yet their WhatsApp/IG revenue depends on agent quality.",
      product: "Production-ready console where agents are trained by natural voice conversation. White-label + REST API + MCP integration.",
      traction: "Full platform shipped: voice training, omnichannel connectors, ERP sync, white-label program live.",
      market: "~200K active FB/WhatsApp commerce pages in Bangladesh alone; white-label agency reseller wedge.",
      model: "SaaS tiers per agent + white-label reseller licensing + API metering.",
      whyNow: "Voice input + LLM extraction crossed the usability threshold; competitors train by typing.",
      risks: "Channel-platform policy shifts; Bengali/English ASR quality variance; single-region GTM.",
    },
  },
  {
    id: "salesdaddy", name: "SalesDaddy", repo: "etside/salesdaddy · sales-ai-ally", featured: true,
    tagline: "Bilingual AI customer service for Bangladeshi businesses — every channel, inventory-aware.",
    category: "Conversational AI", stage: "Production", ask: 750000, equity: 10,
    highlights: ["Bengali + English NLP pipeline: intent, sentiment, entity — native, not translated", "Multi-tenant isolation with live order + inventory awareness across WhatsApp/Messenger/IG/web"],
    brief: {
      problem: "Bangladeshi businesses run customer service on untrained staff replying to 4 channels.",
      product: "Multi-tenant SaaS with isolated AI workspace (chat + voice) — natively Bengali+English, real-time catalog sync, order management inside conversations.",
      traction: "Both codebases production-ready with full tenant/channel/NLP stack committed.",
      market: "Bottom-of-pyramid commerce automation; Bangladesh SMB service automation is greenfield.",
      model: "Per-tenant SaaS subscription + channel/message volume tiers + self-host enterprise licensing.",
      whyNow: "bKash/Nagad rails + Messenger commerce dominance + mature bilingual LLMs arrived together.",
      risks: "Bengali NLU edge-case quality; Meta platform dependency; telecom/market education costs.",
    },
  },
  {
    id: "smartmessenger", name: "Smart Messenger AI", repo: "etside/smart-messenger-ai", featured: true,
    tagline: "Messenger commerce agent with live catalog grounding — text and voice replies.",
    category: "Conversational AI", stage: "Live pilot", ask: 300000, equity: 12,
    highlights: ["pgvector product search + live stock fetch in the reply loop — grounded, not hallucinated", "Voice-reply pipeline: LLM gateway returns audio URL, delivered as Messenger voice attachments"],
    brief: {
      problem: "FB-commerce sellers lose sales answering stock/price questions; rule-based bots break on every catalog change.",
      product: "Supabase Edge Function platform: tenant discovery, vector search over synced catalog, live inventory fetch, grounded text + voice replies via Graph API.",
      traction: "Architecture fully specified and implemented — webhook → tenant → vector search → live stock → grounded reply loop end-to-end.",
      market: "Every Messenger-first shop is a tenant; install flow is a page connect + shop URL.",
      model: "Usage-based (replies) + premium voice tier.",
      whyNow: "Voice replies are now a first-class Messenger format; vector DBs made catalog grounding cheap.",
      risks: "Meta Graph API rate/policy limits; LLM gateway cost per voice minute; single-platform concentration.",
    },
  },
  {
    id: "mcpserver", name: "Tynio MCP Grid", repo: "etside/mcp-server", featured: true,
    tagline: "The agent-tool protocol layer for commerce — exposes shop operations to every LLM.",
    category: "AI Infra", stage: "MVP shipped", ask: 200000, equity: 6,
    highlights: ["Model Context Protocol server exposing catalog, order and inventory tools to ChatGPT/Claude", "Ships as the connective tissue of a live agency stack (Laravel API + React frontend + CI/CD)"],
    brief: {
      problem: "Every LLM agent integration is bespoke glue code. Businesses need operations addressable by any agent runtime.",
      product: "Node/TypeScript MCP server modeling commerce operations as first-class agent tools, deployed against production EngineersTech stack.",
      traction: "Live in production as part of a revenue-generating agency platform — dogfooded daily.",
      market: "MCP is becoming the de-facto agent-tool standard; commerce is the highest-volume first vertical.",
      model: "Open-core: hosted MCP gateway subscription + enterprise self-host.",
      whyNow: "MCP adoption is compounding monthly; first movers on vertical servers own the integration surface.",
      risks: "Protocol churn; big-platform competition bundling equivalent tooling.",
    },
  },
  {
    id: "banglashop", name: "Bangla Magazine", repo: "etside/bangla-shop-news",
    tagline: "News feed that sells — Inshorts-style reading with an embedded marketplace.",
    category: "Consumer", stage: "MVP shipped", ask: 400000, equity: 15,
    highlights: ["Content + commerce in one scroll: every article is a checkout surface", "Full vendor admin + bKash/Nagad/card rails built in"],
    brief: {
      problem: "Bangladeshi news apps monetize only ads, while social sellers pay for reach. Nobody has fused the two.",
      product: "Bilingual (EN/BN) instant-news app with integrated e-commerce: shoppable context under stories, vendor portal, multi-rail payments.",
      traction: "Complete mobile app + vendor admin implemented including payment integrations.",
      market: "News-app DAU is the cheapest acquisition channel; commerce attach-rate is the monetization unlock.",
      model: "Commission on marketplace GMV + promoted placements + vendor SaaS.",
      whyNow: "Mobile-first payments penetration crossed 50M+ accounts; content-commerce attach is proven.",
      risks: "Content moderation load; vendor quality control; two-sided cold start.",
    },
  },
  {
    id: "bigwing", name: "BigWing Materials", repo: "etside/big-wing-steel · bigwingbd",
    tagline: "Digitizing Bangladesh's construction-materials supply chain, starting with steel.",
    category: "Industrial", stage: "Pilot customer", ask: 250000, equity: 20,
    highlights: ["Live industrial catalog platform for a real supplier (structural steel, piling, scaffolding)", "Quote-to-order digitization for mega-project procurement"],
    brief: {
      problem: "Mega-project procurement still runs on phone calls and paper quotes for structural materials.",
      product: "Industrial-grade B2B commerce platform for heavy materials — structured catalog, quote workflows, project-scale order tracking.",
      traction: "Production platform live for anchor supplier with full catalog coverage.",
      market: "Bangladesh construction input market is multi-billion USD annually; digitization is near zero.",
      model: "Supplier subscriptions + transaction fees on quotes converted to orders.",
      whyNow: "Infrastructure megaproject pipeline keeps demand structural; suppliers actively seeking digital channels.",
      risks: "Low digital literacy among incumbent suppliers; credit/payment terms complexity in B2B.",
    },
  },
  {
    id: "dakaheralds", name: "Dhaka Heralds", repo: "etside/news-app",
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
    id: "veronica", name: "Veronica", repo: "etside/veronica",
    tagline: "Luxury pret, direct from Dhaka ateliers — a D2C storefront built to convert.",
    category: "Commerce", stage: "Early revenue", ask: 100000, equity: 15,
    highlights: ["Premium fashion storefront with editorial-grade product presentation", "Cross-border-ready D2C stack on modern tooling"],
    brief: {
      problem: "South Asian luxury pret has no dedicated D2C channel — discovery happens in Instagram DMs.",
      product: "High-polish D2C storefront for designer pret wear with lookbook-grade UX, ready for international checkout.",
      traction: "Storefront is live and public; brand pipeline is the growth lever.",
      market: "Global South-Asian diaspora luxury spend; regional premium fashion is under-served online.",
      model: "Direct margin on sales + designer commission listings.",
      whyNow: "Diaspora demand is proven on marketplaces; owned-channel economics are strictly better.",
      risks: "Inventory depth; designer exclusivity retention; logistics for delicate apparel.",
    },
  },
  // ── New listings from expanded repo analysis ──
  {
    id: "stablecoin", name: "Stablecoin", repo: "etside/stablecoin",
    tagline: "Production stablecoin website with dynamic CMS — Next.js + TypeScript + Tailwind.",
    category: "FinTech", stage: "Production", ask: 600000, equity: 8,
    highlights: ["Dynamic CMS for crypto/stablecoin content management", "Full-stack Next.js production deployment with TypeScript"],
    brief: {
      problem: "Stablecoin projects lack professional, CMS-driven web presence for regulatory-compliant content.",
      product: "Production stablecoin website with dynamic CMS, built on Next.js/TypeScript/Tailwind stack.",
      traction: "Production website deployed and live with full CMS capabilities.",
      market: "Growing stablecoin market needs professional web infrastructure for compliance and trust.",
      model: "SaaS CMS licensing for crypto projects + white-label templates.",
      whyNow: "Stablecoin regulation is tightening; projects need professional, updatable web presence.",
      risks: "Regulatory uncertainty; crypto market volatility; competition from established CMS platforms.",
    },
  },
  {
    id: "medsuite", name: "MedSuiteET", repo: "etside/med-suiteet",
    tagline: "Healthcare management platform for Ethiopian medical facilities.",
    category: "HealthTech", stage: "MVP shipped", ask: 350000, equity: 12,
    highlights: ["Full healthcare facility management system", "Patient records, scheduling, and billing integration"],
    brief: {
      problem: "Ethiopian medical facilities lack integrated digital management systems.",
      product: "Healthcare management platform covering patient records, appointments, billing, and facility operations.",
      traction: "MVP shipped with core healthcare management features.",
      market: "Ethiopia's healthcare digitization is nascent with growing government investment.",
      model: "Per-facility SaaS subscription + implementation services.",
      whyNow: "Government healthcare digitization mandates creating demand for local solutions.",
      risks: "Regulatory compliance requirements; infrastructure limitations; adoption resistance.",
    },
  },
  {
    id: "aiconnect", name: "AI Connect Hub", repo: "etside/ai-connect-hub",
    tagline: "AI-powered connectivity and automation hub for business workflows.",
    category: "AI SaaS", stage: "MVP shipped", ask: 200000, equity: 10,
    highlights: ["Centralized AI workflow automation across business tools", "Integration hub connecting disparate SaaS platforms"],
    brief: {
      problem: "Businesses use disconnected SaaS tools; AI automation requires custom integrations for each.",
      product: "Centralized hub connecting business tools with AI-powered automation and workflow orchestration.",
      traction: "MVP with core integrations and automation workflows shipped.",
      market: "Business automation market growing rapidly; integration platforms are high-value.",
      model: "Per-connection SaaS pricing + premium automation tiers.",
      whyNow: "AI capabilities now enable intelligent automation beyond simple API connections.",
      risks: "Integration maintenance burden; API changes from connected platforms; enterprise sales cycle.",
    },
  },
  {
    id: "smartchat", name: "Smart Chat Trainer", repo: "etside/smart-chat-trainer",
    tagline: "AI chat training platform — build and test conversational agents interactively.",
    category: "AI SaaS", stage: "MVP shipped", ask: 180000, equity: 10,
    highlights: ["Interactive training environment for conversational AI agents", "Test and iterate chat flows before deployment"],
    brief: {
      problem: "Training conversational AI requires iterative testing; most tools lack interactive training environments.",
      product: "Interactive platform for building, training, and testing conversational AI agents with real-time feedback.",
      traction: "MVP shipped with core training and testing capabilities.",
      market: "Conversational AI market expanding; training tools are critical infrastructure.",
      model: "SaaS subscription per training project + enterprise team plans.",
      whyNow: "Conversational AI adoption accelerating; training tooling demand growing proportionally.",
      risks: "Competition from major platform training tools; rapid AI model evolution.",
    },
  },
  {
    id: "privacyhound", name: "PrivacyHound", repo: "etside/PrivacyHound-EN",
    tagline: "Privacy compliance and monitoring tool — GDPR/CCPA automated scanning.",
    category: "SaaS", stage: "MVP shipped", ask: 250000, equity: 10,
    highlights: ["Automated privacy compliance scanning and monitoring", "GDPR/CCPA compliance reporting and remediation guidance"],
    brief: {
      problem: "Privacy compliance (GDPR/CCPA) requires continuous monitoring; manual audits are expensive and incomplete.",
      product: "Automated privacy compliance scanner that monitors websites/apps and generates compliance reports with remediation steps.",
      traction: "MVP with core scanning and reporting features shipped.",
      market: "Privacy regulation expanding globally; compliance tooling market growing rapidly.",
      model: "Per-domain SaaS subscription + compliance consulting add-ons.",
      whyNow: "Privacy regulations proliferating worldwide; enforcement increasing; businesses need automated solutions.",
      risks: "Regulatory complexity; liability exposure; competition from established compliance vendors.",
    },
  },
  {
    id: "et-safety", name: "eT Safety Admin", repo: "etside/eT-Saftey-Admin",
    tagline: "Safety administration platform for enterprise compliance and incident management.",
    category: "SaaS", stage: "MVP shipped", ask: 200000, equity: 10,
    highlights: ["Enterprise safety compliance management system", "Incident tracking, reporting, and remediation workflows"],
    brief: {
      problem: "Enterprise safety compliance requires systematic incident tracking and reporting; manual processes are error-prone.",
      product: "Safety administration platform with incident management, compliance tracking, and automated reporting.",
      traction: "MVP with core safety management features deployed.",
      market: "Enterprise safety compliance is mandatory; digital tools replacing paper-based systems.",
      model: "Per-employee SaaS subscription + compliance reporting add-ons.",
      whyNow: "Regulatory pressure increasing; enterprises digitizing safety management processes.",
      risks: "Industry-specific compliance requirements; integration with existing HR/safety systems.",
    },
  },
  {
    id: "globalhub", name: "Global Business Hub", repo: "etside/global-business-hub",
    tagline: "International business directory and networking platform.",
    category: "SaaS", stage: "MVP shipped", ask: 300000, equity: 12,
    highlights: ["Global business directory with verified company profiles", "Networking and connection features for international trade"],
    brief: {
      problem: "International business discovery relies on fragmented directories; verification and trust are inconsistent.",
      product: "Global business directory with verified profiles, networking features, and trade facilitation tools.",
      traction: "MVP with directory and networking features shipped.",
      market: "International B2B discovery market; trade facilitation platforms growing.",
      model: "Freemium listings + premium verification and featured placement.",
      whyNow: "Global trade digitization accelerating; verified business profiles becoming essential.",
      risks: "Data verification at scale; competition from established directories; network effects required.",
    },
  },
  {
    id: "trustform", name: "Trust Formation", repo: "etside/trust-formation",
    tagline: "Digital trust and legal formation platform for businesses.",
    category: "LegalTech", stage: "MVP shipped", ask: 150000, equity: 10,
    highlights: ["Automated business formation and trust documentation", "Digital-first legal entity creation workflows"],
    brief: {
      problem: "Business formation and trust creation involves complex legal paperwork; digital alternatives are fragmented.",
      product: "Platform for digital business formation and trust creation with guided workflows and document generation.",
      traction: "MVP with core formation workflows shipped.",
      market: "Business formation services market; legal tech adoption growing.",
      model: "Per-formation fees + ongoing compliance subscription.",
      whyNow: "Digital-first legal services gaining acceptance; remote business formation demand increasing.",
      risks: "Jurisdiction-specific legal requirements; liability concerns; regulatory approval needed.",
    },
  },
  {
    id: "vibecoder", name: "Vibe Coder", repo: "etside/vibe-coder",
    tagline: "AI-assisted coding environment with vibe-based development workflow.",
    category: "Dev Tools", stage: "MVP shipped", ask: 120000, equity: 8,
    highlights: ["AI-assisted code generation and editing", "Vibe-based development workflow for rapid prototyping"],
    brief: {
      problem: "Developers need rapid prototyping tools; traditional IDEs lack AI-native development workflows.",
      product: "AI-assisted coding environment designed for vibe-based rapid development and prototyping.",
      traction: "MVP with core AI coding assistance features shipped.",
      market: "AI-assisted development tools market growing rapidly; developer productivity tools in high demand.",
      model: "Freemium with premium AI features + team plans.",
      whyNow: "AI coding assistance becoming mainstream; developers seeking AI-native development experiences.",
      risks: "Competition from GitHub Copilot, Cursor; rapid AI model evolution; developer adoption challenges.",
    },
  },
  {
    id: "launchpad", name: "Business Launchpad", repo: "etside/business-launchpad-main",
    tagline: "Startup launch toolkit — from idea validation to first customer.",
    category: "EdTech", stage: "MVP shipped", ask: 100000, equity: 10,
    highlights: ["Guided startup launch workflow from idea to first customer", "Templates, tools, and mentorship for early-stage founders"],
    brief: {
      problem: "First-time founders lack structured guidance; startup advice is scattered and overwhelming.",
      product: "Guided platform for startup launch with step-by-step workflows, templates, and mentorship connections.",
      traction: "MVP with core launch workflows and templates shipped.",
      market: "Startup education and tools market; founder support platforms growing.",
      model: "Subscription for premium templates and mentorship access.",
      whyNow: "Startup formation democratized; structured guidance tools in demand.",
      risks: "Content quality; mentorship scalability; competition from accelerators and courses.",
    },
  },
  {
    id: "claudedock", name: "Claude Dock Linux", repo: "etside/claude-dock-linux",
    tagline: "Containerized Claude AI environment for Linux development workflows.",
    category: "Dev Tools", stage: "MVP shipped", ask: 80000, equity: 6,
    highlights: ["Pre-configured Claude AI development environment in Docker", "Linux-native AI development workflow with persistent sessions"],
    brief: {
      problem: "Setting up AI development environments is complex; Linux developers need containerized, reproducible setups.",
      product: "Docker container with pre-configured Claude AI environment for Linux development workflows.",
      traction: "MVP container published and usable.",
      market: "AI development tooling; containerized development environments growing.",
      model: "Open-source with premium support and enterprise features.",
      whyNow: "AI development becoming mainstream; containerized environments standard practice.",
      risks: "Docker/desktop container competition; Claude API changes; niche Linux developer audience.",
    },
  },
  {
    id: "clarityhub", name: "Layout Clarity Hub", repo: "etside/layout-clarity-hub-main",
    tagline: "UI/UX layout design system and component library.",
    category: "Dev Tools", stage: "MVP shipped", ask: 90000, equity: 8,
    highlights: ["Pre-built layout components and design patterns", "Consistent UI/UX across web applications"],
    brief: {
      problem: "Teams rebuild layout components repeatedly; design consistency suffers without shared systems.",
      product: "Layout design system with pre-built components, patterns, and guidelines for consistent UI/UX.",
      traction: "MVP component library shipped.",
      market: "Design system and component library market; UI consistency tools in demand.",
      model: "Open-core with premium components and enterprise support.",
      whyNow: "Design systems becoming standard; teams seeking pre-built, consistent component libraries.",
      risks: "Competition from established design systems (Tailwind UI, shadcn); maintenance burden.",
    },
  },
  {
    id: "aiagent", name: "AI Agent Framework", repo: "etside/ai-agent",
    tagline: "Python framework for building autonomous AI agents with tool use.",
    category: "AI Infra", stage: "MVP shipped", ask: 300000, equity: 10,
    highlights: ["Framework for building autonomous AI agents with tool integration", "Python-native agent development with extensible tool system"],
    brief: {
      problem: "Building autonomous AI agents requires complex orchestration; existing frameworks are language-specific or limited.",
      product: "Python framework for building AI agents with tool use, memory, and autonomous decision-making.",
      traction: "MVP framework with core agent capabilities shipped.",
      market: "AI agent development frameworks market; autonomous agent adoption accelerating.",
      model: "Open-core with hosted agent runtime and enterprise features.",
      whyNow: "AI agents becoming practical; developer demand for agent frameworks growing rapidly.",
      risks: "Rapid framework evolution; competition from LangChain, AutoGPT; model capability dependencies.",
    },
  },
  {
    id: "sa-modern", name: "SA Next.js Modern", repo: "etside/sa-nextjs-modern",
    tagline: "Modern Next.js starter for SaaS applications with best practices.",
    category: "Dev Tools", stage: "MVP shipped", ask: 60000, equity: 5,
    highlights: ["Production-ready Next.js SaaS starter template", "Best practices for auth, payments, and deployment"],
    brief: {
      problem: "Starting a SaaS project requires extensive boilerplate setup; best practices are scattered.",
      product: "Modern Next.js starter template with auth, payments, database, and deployment best practices baked in.",
      traction: "MVP starter template shipped.",
      market: "SaaS starter templates market; developer productivity tools in demand.",
      model: "Open-source with premium templates and consulting.",
      whyNow: "SaaS formation accelerating; developers seeking production-ready starters.",
      risks: "Template maintenance; Next.js version changes; competition from Vercel templates.",
    },
  },
];

export const ALL_CATEGORIES: DealCategory[] = ["AI SaaS", "Conversational AI", "AI Infra", "Consumer", "Commerce", "Industrial", "FinTech", "HealthTech", "Dev Tools", "LegalTech", "EdTech", "SaaS"];
