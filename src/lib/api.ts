/**
 * Backend integration boundary.
 * All calls to the FastAPI backend (which owns Gemini, n8n, DOCX/PDF
 * generation and storage) go through this module. API keys never live here —
 * the backend holds them.
 */
export const API_BASE_URL = (import.meta.env["VITE_API_BASE_URL"] as string | undefined)?.replace(/\/+$/, "") || undefined;

export const isBackendConnected = () => Boolean(API_BASE_URL);

export class BackendNotConnectedError extends Error {
  constructor() {
    super("The proposal backend is not configured. Set VITE_API_BASE_URL to your FastAPI server's public URL.");
  }
}

export class ApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new BackendNotConnectedError();
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, init);
  } catch {
    throw new ApiError(
      `Could not reach the backend at ${API_BASE_URL}. Check the server is running, publicly reachable (not localhost), and allows this site via CORS.`,
    );
  }
  if (!res.ok) {
    let detail = "";
    try {
      const body = (await res.json()) as { detail?: unknown };
      detail = typeof body.detail === "string" ? body.detail : body.detail ? JSON.stringify(body.detail) : "";
    } catch { /* non-JSON body */ }
    throw new ApiError(`Backend returned ${res.status}${detail ? `: ${detail}` : ""}`, res.status);
  }
  return res.json() as Promise<T>;
}

export type AnalyzeRequest = { client_name: string; project_title: string; requirements: string };

export type AnalysisResult = {
  executive_summary: string;
  business_problem: string;
  functional_requirements: unknown[];
  technical_requirements: unknown[];
  recommended_technologies: unknown[];
  integrations: unknown[];
  missing_information: unknown[];
  clarification_questions: unknown[];
  proposed_solution: string;
  risks_and_dependencies: unknown[];
};

export type AnalyzeResponse = { client_name: string; project_title: string; analysis: AnalysisResult };

export const api = {
  health: () => request<unknown>("/health"),
  analyzeRequirements: (body: AnalyzeRequest) =>
    request<AnalyzeResponse>("/api/analyze-requirements", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }),
  regenerateSection: (proposalId: string, sectionId: string) =>
    request<{ content: string }>(`/proposals/${proposalId}/sections/${sectionId}/regenerate`, { method: "POST" }),
  exportDocument: async (proposalId: string, format: "docx" | "pdf") => {
    if (!API_BASE_URL) throw new BackendNotConnectedError();
    const res = await fetch(`${API_BASE_URL}/proposals/${proposalId}/export?format=${format}`);
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    return res.blob();
  },
};

/** Live analysis results are kept in sessionStorage, keyed by a generated id. */
const KEY = (id: string) => `bb-analysis:${id}`;
export const saveLiveAnalysis = (id: string, r: AnalyzeResponse) => sessionStorage.setItem(KEY(id), JSON.stringify(r));
export const loadLiveAnalysis = (id: string): AnalyzeResponse | null => {
  const raw = sessionStorage.getItem(KEY(id));
  return raw ? (JSON.parse(raw) as AnalyzeResponse) : null;
};
export const isLiveId = (id: string) => id.startsWith("live-");

/** Render any list item from the API (string or object) as readable text. */
export function itemText(v: unknown): string {
  if (v == null) return "";
  if (typeof v === "string" || typeof v === "number") return String(v);
  if (typeof v === "object") return Object.values(v as Record<string, unknown>).map(itemText).filter(Boolean).join(" — ");
  return String(v);
}
