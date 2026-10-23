// SAMPLE DATA ONLY — used until the FastAPI backend is connected.
// Replace usages with calls from src/lib/api.ts.

export type ProposalStatus = "Draft" | "Analyzing" | "In Review" | "Approved" | "Rejected";
export type DocType = "RFI" | "RFP" | "RFQ";

export interface Proposal {
  id: string;
  client: string;
  title: string;
  docType: DocType;
  status: ProposalStatus;
  owner: string;
  value: string;
  updated: string;
  created: string;
  version: string;
}

export const proposals: Proposal[] = [
  { id: "BB-2026-041", client: "Meridian Health Group", title: "Patient Engagement Portal Modernisation", docType: "RFP", status: "In Review", owner: "Aisha Rahman", value: "$486,000", updated: "2026-10-21", created: "2026-10-14", version: "v1.3" },
  { id: "BB-2026-040", client: "Northwind Logistics", title: "Fleet Telemetry & Route Optimisation Platform", docType: "RFP", status: "Draft", owner: "Daniel Okafor", value: "$712,500", updated: "2026-10-20", created: "2026-10-18", version: "v0.4" },
  { id: "BB-2026-039", client: "Crestline Bank", title: "KYC Document Automation", docType: "RFQ", status: "Approved", owner: "Priya Nair", value: "$238,000", updated: "2026-10-17", created: "2026-10-02", version: "v2.0" },
  { id: "BB-2026-038", client: "Aurora Retail Co.", title: "Unified Commerce Data Platform", docType: "RFI", status: "Draft", owner: "Marcus Lee", value: "TBD", updated: "2026-10-16", created: "2026-10-15", version: "v0.2" },
  { id: "BB-2026-037", client: "Helix Energy", title: "Asset Maintenance Mobile App", docType: "RFP", status: "In Review", owner: "Aisha Rahman", value: "$354,900", updated: "2026-10-12", created: "2026-09-30", version: "v1.1" },
  { id: "BB-2026-036", client: "City of Westbrook", title: "Citizen Services Chatbot", docType: "RFQ", status: "Rejected", owner: "Daniel Okafor", value: "$129,000", updated: "2026-10-08", created: "2026-09-22", version: "v1.0" },
  { id: "BB-2026-035", client: "Summit Insurance", title: "Claims Triage with Document AI", docType: "RFP", status: "Approved", owner: "Priya Nair", value: "$598,000", updated: "2026-10-03", created: "2026-09-11", version: "v2.2" },
];

export const analysis = {
  executiveSummary:
    "Meridian Health Group seeks to replace its legacy patient portal with a secure, mobile-first engagement platform supporting appointment booking, telehealth, secure messaging and access to medical records across 14 clinics.",
  businessProblem:
    "The current portal has low adoption (18% of active patients), high call-centre volume for routine tasks, no mobile experience and limited integration with the Epic EHR, resulting in avoidable operating costs and poor patient satisfaction scores.",
  extracted: [
    { id: "R-01", text: "Patients can book, reschedule and cancel appointments online", source: "Section 3.1", priority: "Must" },
    { id: "R-02", text: "Secure two-way messaging between patients and care teams", source: "Section 3.2", priority: "Must" },
    { id: "R-03", text: "Video consultations embedded in the portal", source: "Section 3.4", priority: "Should" },
    { id: "R-04", text: "Access to lab results and visit summaries", source: "Section 3.5", priority: "Must" },
    { id: "R-05", text: "Multilingual interface (English, Spanish)", source: "Section 4.2", priority: "Should" },
  ],
  functional: [
    { area: "Scheduling", detail: "Real-time slot availability by clinic, provider and visit type" },
    { area: "Messaging", detail: "Threaded conversations with attachments and SLA tracking" },
    { area: "Records", detail: "View, download and share health records (FHIR R4)" },
    { area: "Billing", detail: "View statements and pay outstanding balances" },
  ],
  technical: [
    { area: "Security", detail: "HIPAA compliance, SSO via Azure AD B2C, MFA" },
    { area: "Hosting", detail: "Cloud-hosted in US region with 99.9% uptime SLA" },
    { area: "Performance", detail: "Page load under 2s for 95th percentile" },
    { area: "Accessibility", detail: "WCAG 2.1 AA conformance" },
  ],
  integrations: [
    { system: "Epic EHR", method: "FHIR R4 APIs", status: "Confirmed" },
    { system: "Stripe", method: "REST API", status: "Confirmed" },
    { system: "Twilio", method: "SMS / Video SDK", status: "Assumed" },
    { system: "Salesforce Health Cloud", method: "REST API", status: "Unclear" },
  ],
  missing: [
    "Expected number of concurrent users at peak",
    "Data retention and archival policy",
    "Ownership of Epic integration licensing",
    "Preferred go-live date and phasing constraints",
  ],
  questions: [
    "Is the Salesforce Health Cloud integration in scope for phase one?",
    "Should telehealth use an existing vendor or a new platform?",
    "Who will provide content translation for the Spanish interface?",
    "Are there existing design guidelines or brand assets for the portal?",
  ],
};

export const solution = {
  proposed:
    "A cloud-native patient engagement platform composed of a React web portal and React Native mobile apps, backed by a modular FastAPI service layer that integrates with Epic via FHIR R4 and orchestrates notifications and workflows through n8n.",
  architecture: [
    { layer: "Presentation", detail: "React web portal, React Native iOS/Android apps" },
    { layer: "API Gateway", detail: "Azure API Management with OAuth 2.0 / OIDC" },
    { layer: "Services", detail: "FastAPI microservices: scheduling, messaging, records, billing" },
    { layer: "Integration", detail: "FHIR adapter for Epic, n8n workflow engine, Twilio, Stripe" },
    { layer: "Data", detail: "PostgreSQL (encrypted at rest), Redis cache, Blob storage" },
  ],
  technologies: [
    { name: "React + TypeScript", category: "Frontend", purpose: "Patient web portal", why: "Mature ecosystem, strong accessibility tooling, in-house expertise" },
    { name: "React Native", category: "Mobile", purpose: "iOS and Android apps", why: "Shared code with web reduces delivery cost by ~30%" },
    { name: "FastAPI", category: "Backend", purpose: "Service layer", why: "High performance, typed contracts, fast delivery" },
    { name: "PostgreSQL", category: "Database", purpose: "Transactional data", why: "HIPAA-ready managed offerings, robust and familiar" },
    { name: "n8n", category: "Automation", purpose: "Notification and workflow orchestration", why: "Self-hostable, keeps PHI within client boundary" },
    { name: "Azure AD B2C", category: "Identity", purpose: "Patient SSO and MFA", why: "Matches client's existing Microsoft estate" },
  ],
  tools: ["Azure DevOps", "GitHub Actions", "Figma", "Jira", "SonarQube", "Datadog"],
  departments: [
    { name: "Solution Architecture", involvement: "High" },
    { name: "Web & Mobile Engineering", involvement: "High" },
    { name: "Integration Services", involvement: "High" },
    { name: "UX & Design", involvement: "Medium" },
    { name: "QA & Compliance", involvement: "Medium" },
    { name: "DevOps & Cloud", involvement: "Medium" },
  ],
  roles: [
    { role: "Engagement Manager", fte: "0.5", responsibility: "Client relationship, governance, reporting" },
    { role: "Solution Architect", fte: "1.0", responsibility: "Architecture, integration design, technical risk" },
    { role: "Senior Full-Stack Engineer", fte: "3.0", responsibility: "Web portal and services" },
    { role: "Mobile Engineer", fte: "2.0", responsibility: "iOS and Android apps" },
    { role: "Integration Engineer", fte: "1.0", responsibility: "Epic FHIR, Twilio, Stripe" },
    { role: "QA Lead", fte: "1.0", responsibility: "Test strategy, HIPAA validation" },
  ],
  scope: {
    inScope: ["Web portal", "iOS & Android apps", "Epic integration", "Payments", "Messaging", "Telehealth"],
    outOfScope: ["EHR configuration changes", "Content translation", "Salesforce integration (phase 2)"],
  },
  deliverables: ["Solution design document", "Clickable prototype", "Production web portal", "Published mobile apps", "Integration test reports", "Runbooks & handover"],
  risks: [
    { risk: "Epic API access delays", impact: "High", mitigation: "Early sandbox request; mock FHIR server" },
    { risk: "Scope creep from clinic stakeholders", impact: "Medium", mitigation: "Formal change control board" },
    { risk: "App store review timelines", impact: "Low", mitigation: "Submit beta builds early" },
  ],
};

export interface ProposalSection { id: string; title: string; content: string }

export const proposalSections: ProposalSection[] = [
  { id: "cover", title: "Cover Page", content: "Patient Engagement Portal Modernisation\nPrepared for Meridian Health Group\nPrepared by BriskBold IT\nOctober 2026 · Reference BB-2026-041" },
  { id: "exec", title: "Executive Summary", content: analysis.executiveSummary + "\n\nBriskBold IT proposes a phased, 7-month programme delivering a secure web portal and native mobile apps, integrated with Epic, to lift digital adoption and reduce call-centre volume by an estimated 35%." },
  { id: "understanding", title: "Understanding of Requirements", content: analysis.businessProblem },
  { id: "solution", title: "Proposed Solution", content: solution.proposed },
  { id: "architecture", title: "Technical Architecture", content: solution.architecture.map((a) => `${a.layer}: ${a.detail}`).join("\n") },
  { id: "stack", title: "Technology Stack", content: solution.technologies.map((t) => `${t.name} — ${t.purpose}`).join("\n") },
  { id: "departments", title: "Department Allocation", content: solution.departments.map((d) => `${d.name} (${d.involvement})`).join("\n") },
  { id: "scope", title: "Project Scope", content: "In scope: " + solution.scope.inScope.join(", ") + ".\nOut of scope: " + solution.scope.outOfScope.join(", ") + "." },
  { id: "timeline", title: "Implementation Timeline", content: "Phase 1 — Discovery & Design (Weeks 1–6)\nPhase 2 — Core Build (Weeks 7–20)\nPhase 3 — Integration & Testing (Weeks 21–26)\nPhase 4 — Launch & Hypercare (Weeks 27–30)" },
  { id: "commercial", title: "Commercial Estimate", content: "Total fixed-price estimate: $486,000 (excluding taxes).\nPayment milestones: 20% on kick-off, 30% on design sign-off, 30% on UAT, 20% on go-live." },
  { id: "risks", title: "Risks and Assumptions", content: solution.risks.map((r) => `${r.risk} — ${r.mitigation}`).join("\n") },
  { id: "outcomes", title: "Expected Outcomes", content: "Digital adoption above 50% within 12 months\n35% reduction in routine call-centre volume\nPatient satisfaction (NPS) increase of 15 points" },
  { id: "next", title: "Next Steps", content: "1. Clarification workshop with Meridian stakeholders\n2. Confirm Epic sandbox access\n3. Contract and statement of work signature" },
];

export const catalogue = [
  { name: "React + TypeScript", category: "Frontend", department: "Web & Mobile Engineering", maturity: "Core", projects: 42 },
  { name: "Next.js", category: "Frontend", department: "Web & Mobile Engineering", maturity: "Core", projects: 18 },
  { name: "React Native", category: "Mobile", department: "Web & Mobile Engineering", maturity: "Core", projects: 15 },
  { name: "Flutter", category: "Mobile", department: "Web & Mobile Engineering", maturity: "Emerging", projects: 4 },
  { name: "FastAPI", category: "Backend", department: "Platform Engineering", maturity: "Core", projects: 27 },
  { name: ".NET 8", category: "Backend", department: "Platform Engineering", maturity: "Core", projects: 21 },
  { name: "PostgreSQL", category: "Database", department: "Data & Analytics", maturity: "Core", projects: 38 },
  { name: "Snowflake", category: "Data", department: "Data & Analytics", maturity: "Established", projects: 9 },
  { name: "Google Gemini", category: "AI / LLM", department: "AI & Automation", maturity: "Emerging", projects: 6 },
  { name: "n8n", category: "Automation", department: "AI & Automation", maturity: "Established", projects: 11 },
  { name: "Azure", category: "Cloud", department: "DevOps & Cloud", maturity: "Core", projects: 30 },
  { name: "AWS", category: "Cloud", department: "DevOps & Cloud", maturity: "Core", projects: 26 },
];
