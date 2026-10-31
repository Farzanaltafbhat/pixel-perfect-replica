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

  const choose = (...values: unknown[]) =>
    values.find(
      (v) =>
        v !== undefined &&
        v !== null &&
        v !== "" &&
        !(Array.isArray(v) && v.length === 0)
    );

  return {
    proposed: choose(s.overview, a.proposed_solution),
    architecture: choose(
      a.recommended_architecture,
      s.components
    ),
    technologies: a.recommended_technologies,
    tools: a.tools_and_platforms,
    integrations: a.integrations,
    departments: a.department_allocation,
    roles: a.team_roles,
    scope: a.project_scope,
    deliverables: a.deliverables,
    timeline: a.implementation_timeline,
    commercial: a.commercial_estimate,
    risks: a.risks_and_dependencies,
    assumptions: a.assumptions,
    considerations: s.security,
    outcomes: a.expected_outcomes,
    next: a.next_steps,
  };
}

export function buildLiveSections(
  p: Pick<
    LiveProposal,
    "client" | "title" | "docType" | "requirements" | "id" | "response"
  >
): ProposalSection[] {
  const a = p.response.analysis;
  const s = solutionFields(p.response);

  const section = (
    id: string,
    title: string,
    value: unknown
  ): ProposalSection => ({
    id,
    title,
    content: proposalText(value),
  });

  const architecture = {
    overview: a.proposed_solution,
    architecture_layers: s.architecture,
    components: record(a.proposed_solution).components,
    workflow: record(a.proposed_solution).workflow,
    security: record(a.proposed_solution).security,
    scalability: record(a.proposed_solution).scalability,
  };

  const scope = record(s.scope);

  const timeline = record(s.timeline);
  const commercial = record(s.commercial);

  const risksAndAssumptions = {
    risks_and_dependencies: s.risks,
    assumptions: s.assumptions,
  };

  return [
    section(
      "cover",
      "Cover Page",
      `${p.title}\nPrepared for: ${p.client}\nPrepared by: BriskBold IT\nDocument type: ${p.docType}\nReference: ${p.id}\nStatus: Draft — requires review`
    ),

    section(
      "exec",
      "Executive Summary",
      a.executive_summary
    ),

    section(
      "understanding",
      "Understanding of Requirements",
      {
        original_client_requirements:
          p.requirements || "Original requirements unavailable.",
        business_problem: a.business_problem,
        functional_requirements: a.functional_requirements,
        technical_requirements: a.technical_requirements,
        missing_information: a.missing_information,
      }
    ),

    section(
      "solution",
      "Proposed Solution",
      s.proposed
    ),

    section(
      "architecture",
      "Technical Architecture",
      architecture
    ),

    section(
      "stack",
      "Technology Stack",
      {
        recommended_technologies: s.technologies,
        tools_and_platforms: s.tools,
        integrations: s.integrations,
      }
    ),

    section(
      "departments",
      "Department Allocation and Team Roles",
      {
        departments: s.departments,
        team_roles: s.roles,
      }
    ),

    section(
      "scope",
      "Project Scope and Deliverables",
      {
        in_scope: scope.in_scope,
        out_of_scope: scope.out_of_scope,
        scope_notes: scope.scope_notes,
        deliverables: s.deliverables,
      }
    ),

    section(
      "timeline",
      "Implementation Timeline",
      {
        status: timeline.status,
        total_duration: timeline.total_duration,
        phases: timeline.phases,
        schedule_assumptions: timeline.schedule_assumptions,
        notice:
          "Preliminary estimates only. The schedule must be validated and approved before becoming a commitment.",
      }
    ),

    section(
      "commercial",
      "Commercial Estimate",
      {
        status: commercial.status,
        currency: commercial.currency,
        estimated_range: commercial.estimated_range,
        cost_components: commercial.cost_components,
        exclusions: commercial.exclusions,
        pricing_assumptions: commercial.pricing_assumptions,
        note:
          commercial.note ||
          "Pricing is subject to commercial review and approval.",
      }
    ),

    section(
      "risks",
      "Risks, Dependencies and Assumptions",
      risksAndAssumptions
    ),

    section(
      "outcomes",
      "Expected Outcomes and KPIs",
      s.outcomes
    ),

    section(
      "next",
      "Clarification Questions and Next Steps",
      {
        clarification_questions: a.clarification_questions,
        next_steps: s.next,
        analysis_limitations:
          record(a.analysis_metadata).limitations,
      }
    ),
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