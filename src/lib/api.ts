/**
 * Backend integration boundary.
 * All calls to the FastAPI backend (which owns Gemini, n8n, DOCX/PDF
 * generation and storage) go through this module. API keys never live here —
 * the backend holds them.
 */
import { API_BASE_URL } from "@/lib/config";

// Preserve the existing import boundary for pages using this public setting.
export { API_BASE_URL } from "@/lib/config";

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

const TIMEOUT_MS = 90000;

async function fetchResponse(path: string, init?: RequestInit): Promise<Response> {
  if (!API_BASE_URL) throw new BackendNotConnectedError();
  try { new URL(API_BASE_URL); } catch { throw new ApiError("The backend URL is invalid. Check the frontend API configuration."); }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, { ...init, signal: controller.signal });
    if (!res.ok) throw new ApiError(`The backend could not complete the request (${res.status}). Please retry.`, res.status);
    return res;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (controller.signal.aborted) throw new ApiError("The request timed out. Please retry.");
    throw new ApiError("Could not reach the backend. Check the connection and ensure the server allows this site through CORS.");
  } finally { clearTimeout(timer); }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetchResponse(path, init);
  try { return await res.json() as T; }
  catch { throw new ApiError("The backend returned invalid data. Please retry."); }
}

export type AnalyzeRequest = { client_name: string; project_title: string; requirements: string; document_type?: string };

export type AnalysisResult = {
  [key: string]: unknown;
  executive_summary: unknown;
  business_problem: unknown;
  functional_requirements: unknown;
  technical_requirements: unknown;
  recommended_technologies: unknown;
  integrations: unknown;
  missing_information: unknown;
  clarification_questions: unknown;
  proposed_solution: unknown;
  risks_and_dependencies: unknown;
};

export type AnalyzeResponse = { client_name: string; project_title: string; analysis: AnalysisResult };

export function validateAnalysis(value: unknown): AnalyzeResponse {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new ApiError("The backend returned an invalid analysis. Please retry.");
  const r = value as Record<string, unknown>;
  if (typeof r.client_name !== "string" || typeof r.project_title !== "string" || !r.analysis || typeof r.analysis !== "object" || Array.isArray(r.analysis) || !Object.keys(r.analysis).length) throw new ApiError("The backend returned an incomplete analysis. Please retry.");
  return r as AnalyzeResponse;
}

export type ExportPayload = { id: string; client_name: string; project_title: string; document_type: string; status: string; sections: { id: string; title: string; content: string }[] };
export type ExportCapabilities = { docx: boolean; pdf: boolean };

export async function validateDocument(blob: Blob, format: "docx" | "pdf"): Promise<Blob> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const valid = format === "pdf" ? new TextDecoder().decode(bytes.slice(0, 5)) === "%PDF-" : bytes[0] === 80 && bytes[1] === 75 && bytes[2] === 3 && bytes[3] === 4;
  if (!valid) throw new ApiError("The server did not return a valid document. Please retry.");
  return blob;
}

export const api = {
  health: () => request<unknown>("/health"),
  analyzeRequirements: async (body: AnalyzeRequest) => validateAnalysis(await request<unknown>("/api/analyze-requirements", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
  })),
  exportCapabilities: async (): Promise<ExportCapabilities> => {
    const schema = await request<{ paths?: Record<string, { post?: unknown }> }>("/openapi.json");
    return { docx: Boolean(schema.paths?.["/api/export/docx"]?.post), pdf: Boolean(schema.paths?.["/api/export/pdf"]?.post) };
  },
  exportDocument: async (proposal: ExportPayload, format: "docx" | "pdf") => {
    if (!proposal.sections.length || proposal.sections.some(s => !s.content.trim())) throw new ApiError("Complete the empty proposal sections before exporting.");
    const res = await fetchResponse(`/api/export/${format}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(proposal) });
    return validateDocument(await res.blob(), format);
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

/** Analysis fields can be arrays, a single structured object, or plain text. */
export function analysisItems(value: unknown): unknown[] {
  if (value == null || value === "") return [];
  return Array.isArray(value) ? value : [value];
}
