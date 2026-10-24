import { useEffect, useState } from "react";
import { itemText, type AnalyzeRequest, type AnalyzeResponse } from "@/lib/api";
import type { ProposalSection, ProposalStatus } from "@/data/sample";

export type LiveProposal = {
  id: string;
  client: string;
  title: string;
  docType: string;
  requirements: string;
  response: AnalyzeResponse;
  sections: ProposalSection[];
  initialSections: ProposalSection[];
  status: ProposalStatus;
  created: string;
  updated: string;
  version: string;
};

const records = new Map<string, LiveProposal>();
const subscribers = new Set<() => void>();
const key = (id: string) => `bb-proposal:${id}`;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

/** Preserve nested AI answers with labels rather than assuming strings. */
export function proposalText(value: unknown): string {
  if (value == null || value === "") return "Not provided — requires clarification.";
  if (Array.isArray(value)) return value.length ? value.map(proposalText).join("\n") : "Not provided — requires clarification.";
  if (typeof value === "object") {
    const entries = Object.entries(record(value));
    return entries.length ? entries.map(([label, content]) => `${label.replace(/_/g, " ")}: ${proposalText(content)}`).join("\n") : "Not provided — requires clarification.";
  }
  return itemText(value);
}

/** Only map information returned by this proposal's analysis. */
export function solutionFields(response: AnalyzeResponse) {
  const a = record(response.analysis);
  const s = record(a.proposed_solution);
  const choose = (...values: unknown[]) => values.find(v => v != null && v !== "");
  return {
    proposed: a.proposed_solution,
    architecture: choose(a.recommended_architecture, a.technical_architecture, a.architecture, s.architecture, s.components),
    technologies: a.recommended_technologies,
    tools: a.tools_and_platforms,
    integrations: a.integrations,
    departments: choose(a.department_allocation, a.required_departments, s.departments),
    roles: choose(a.team_roles, a.roles_and_responsibilities, s.team_roles),
    scope: choose(a.project_scope, a.scope, s.scope),
    deliverables: choose(a.deliverables, s.deliverables),
    timeline: choose(a.implementation_timeline, a.implementation_phases, s.implementation_phases),
    commercial: choose(a.commercial_estimates, a.commercial_estimate, a.budget_estimate),
    risks: a.risks_and_dependencies,
    assumptions: a.assumptions,
    considerations: a.implementation_considerations,
    outcomes: a.expected_outcomes,
    next: choose(a.next_steps, a.clarification_questions),
  };
}

export function buildLiveSections(p: Pick<LiveProposal, "client" | "title" | "docType" | "requirements" | "id" | "response">): ProposalSection[] {
  const a = p.response.analysis;
  const s = solutionFields(p.response);
  const section = (id: string, title: string, value: unknown): ProposalSection => ({ id, title, content: proposalText(value) });
  return [
    section("cover", "Cover Page", `${p.title}\nPrepared for ${p.client}\nPrepared by BriskBold IT\n${p.docType} · Reference ${p.id}\nDraft — not approved`),
    section("exec", "Executive Summary", a.executive_summary),
    section("understanding", "Understanding of Requirements", `Original requirements:\n${p.requirements || "Not available for this earlier analysis."}\n\nBusiness problem:\n${proposalText(a.business_problem)}\n\nFunctional requirements:\n${proposalText(a.functional_requirements)}\n\nTechnical requirements:\n${proposalText(a.technical_requirements)}`),
    section("solution", "Proposed Solution", s.proposed),
    section("architecture", "Technical Architecture", s.architecture),
    section("stack", "Technology Stack", s.technologies),
    section("departments", "Department Allocation", s.departments),
    section("scope", "Project Scope", s.scope),
    section("timeline", "Implementation Timeline", s.timeline == null ? undefined : `Proposed only — dates and duration are unconfirmed.\n${proposalText(s.timeline)}`),
    section("commercial", "Commercial Estimate", s.commercial == null ? undefined : `AI-proposed estimate — unconfirmed, not a quotation.\n${proposalText(s.commercial)}`),
    section("risks", "Risks and Assumptions", `${proposalText(s.risks)}\n\nAssumptions:\n${proposalText(s.assumptions)}`),
    section("outcomes", "Expected Outcomes", s.outcomes),
    section("next", "Next Steps", s.next),
  ];
}

export function createLiveProposal(input: AnalyzeRequest, response: AnalyzeResponse, id = `live-${crypto.randomUUID()}`): LiveProposal {
  const now = new Date().toISOString();
  const base = { id, client: input.client_name, title: input.project_title, docType: input.document_type === "auto" || !input.document_type ? "Automatic — not classified" : input.document_type, requirements: input.requirements, response };
  const sections = buildLiveSections(base);
  return { ...base, sections, initialSections: sections.map(s => ({ ...s })), status: "Draft", created: now, updated: now, version: "v1.0" };
}

export function saveProposal(p: LiveProposal): void {
  records.set(p.id, p);
  try { sessionStorage.setItem(key(p.id), JSON.stringify(p)); }
  catch { /* In-memory state remains usable if browser storage is unavailable. */ }
  subscribers.forEach(notify => notify());
}

export function readProposal(id: string): LiveProposal | null {
  const cached = records.get(id);
  if (cached) return cached;
  try {
    const raw = sessionStorage.getItem(key(id));
    if (raw) {
      const p = JSON.parse(raw) as LiveProposal;
      if (p.id !== id || typeof p.client !== "string" || typeof p.title !== "string" || !p.response?.analysis || !Array.isArray(p.sections) || !p.sections.every(s => typeof s.id === "string" && typeof s.title === "string" && typeof s.content === "string")) return null;
      records.set(id, p);
      return p;
    }
    // Upgrade analyses created before the shared proposal workflow was added.
    const legacy = sessionStorage.getItem(`bb-analysis:${id}`);
    if (!legacy) return null;
    const response = JSON.parse(legacy) as AnalyzeResponse;
    if (!response.analysis || typeof response.client_name !== "string" || typeof response.project_title !== "string") return null;
    const p = createLiveProposal({ client_name: response.client_name, project_title: response.project_title, requirements: "" }, response, id);
    p.docType = "Not provided";
    p.sections = buildLiveSections(p);
    p.initialSections = p.sections.map(s => ({ ...s }));
    records.set(id, p);
    sessionStorage.setItem(key(id), JSON.stringify(p));
    return p;
  } catch { return null; }
}

export function updateProposalSection(id: string, sectionId: string, content: string): LiveProposal | null {
  const p = readProposal(id);
  if (!p) return null;
  const updated = { ...p, updated: new Date().toISOString(), sections: p.sections.map(s => s.id === sectionId ? { ...s, content } : s) };
  saveProposal(updated);
  return updated;
}

/** Browser storage reads only after hydration; each route uses the same keyed record. */
export function useLiveProposal(id: string) {
  const [state, setState] = useState<{ id: string; proposal: LiveProposal | null } | null>(null);
  useEffect(() => {
    const refresh = () => setState({ id, proposal: readProposal(id) });
    refresh();
    subscribers.add(refresh);
    return () => { subscribers.delete(refresh); };
  }, [id]);
  return state?.id === id ? state.proposal : undefined;
}