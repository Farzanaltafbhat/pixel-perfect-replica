/** Public frontend configuration. Never put API keys or other secrets here. */
const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
/** Vite replaces VITE_API_BASE_URL at build time; blank values use the default. */
export function resolveApiBaseUrl(override?: string): string {
  return (override?.trim() || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env["VITE_API_BASE_URL"]);