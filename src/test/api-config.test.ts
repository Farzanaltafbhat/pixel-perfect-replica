import { afterEach, describe, expect, it, vi } from "vitest";
import { API_BASE_URL, resolveApiBaseUrl } from "@/lib/config";
import { api } from "@/lib/api";

afterEach(() => vi.unstubAllGlobals());

describe("Public API configuration", () => {
  it("defaults to the supplied development backend", () => {
    expect(resolveApiBaseUrl()).toBe("https://d866-2405-201-550a-a005-8c6d-cb55-b86e-705b.ngrok-free.app");
  });

  it("allows a frontend environment override and removes trailing slashes", () => {
    expect(resolveApiBaseUrl(" https://backend.example.test/// ")).toBe("https://backend.example.test");
  });

  it("uses the development default for an empty override", () => {
    expect(resolveApiBaseUrl("  ")).toBe(resolveApiBaseUrl());
  });

  it("keeps the existing analysis POST endpoint and payload", async () => {
    const result = { client_name: "Test client", project_title: "Test project", analysis: {} };
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, json: async () => result });
    vi.stubGlobal("fetch", fetchMock);
    const body = { client_name: "Test client", project_title: "Test project", requirements: "Build a secure customer portal with reporting and account management." };

    expect(await api.analyzeRequirements(body)).toEqual(result);
    expect(fetchMock).toHaveBeenCalledWith(`${API_BASE_URL}/api/analyze-requirements`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  });
});