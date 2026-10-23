/**
 * Backend integration boundary.
 * All calls to the future FastAPI backend (which owns Gemini, n8n, DOCX/PDF
 * generation and storage) go through this module. API keys never live here —
 * the backend holds them.
 */
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string | undefined;

export const isBackendConnected = () => Boolean(API_BASE_URL);

export class BackendNotConnectedError extends Error {
  constructor() {
    super("The proposal backend is not connected yet.");
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_BASE_URL) throw new BackendNotConnectedError();
  const res = await fetch(`${API_BASE_URL}${path}`, init);
  if (!res.ok) throw new Error(`Request failed (${res.status})`);
  return res.json() as Promise<T>;
}

export const api = {
  analyzeRequirements: (form: FormData) =>
    request<{ proposalId: string }>("/proposals/analyze", { method: "POST", body: form }),
  regenerateSection: (proposalId: string, sectionId: string) =>
    request<{ content: string }>(`/proposals/${proposalId}/sections/${sectionId}/regenerate`, { method: "POST" }),
  exportDocument: async (proposalId: string, format: "docx" | "pdf") => {
    if (!API_BASE_URL) throw new BackendNotConnectedError();
    const res = await fetch(`${API_BASE_URL}/proposals/${proposalId}/export?format=${format}`);
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    return res.blob();
  },
};
