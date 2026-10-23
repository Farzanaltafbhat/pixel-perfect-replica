/** Public frontend configuration. Never put API keys or other secrets here. */
const DEFAULT_API_BASE_URL = "https://d866-2405-201-550a-a005-8c6d-cb55-b86e-705b.ngrok-free.app";

/** Vite replaces VITE_API_BASE_URL at build time; blank values use the default. */
export function resolveApiBaseUrl(override?: string): string {
  return (override?.trim() || DEFAULT_API_BASE_URL).replace(/\/+$/, "");
}

export const API_BASE_URL = resolveApiBaseUrl(import.meta.env["VITE_API_BASE_URL"]);