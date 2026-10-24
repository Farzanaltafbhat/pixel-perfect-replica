import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { api, validateAnalysis, validateDocument } from "@/lib/api";
import { buildLiveSections, createLiveProposal, readProposal, saveProposal, solutionFields, updateProposalSection } from "@/lib/proposal-state";

const response = { client_name: "Real Client", project_title: "Real Project", analysis: { executive_summary: "Client summary", business_problem: "Client problem", proposed_solution: { overview: "Portal", components: [{ name: "API" }], implementation_phases: ["Discovery"] }, recommended_technologies: [{ name: "React", purpose: "Portal UI" }], functional_requirements: [], technical_requirements: [], integrations: [], missing_information: [], clarification_questions: ["Confirm budget"], risks_and_dependencies: [] } };
const input = { client_name: "Real Client", project_title: "Real Project", document_type: "RFQ", requirements: "Build a service request portal for support staff." };
beforeEach(() => sessionStorage.clear());
afterEach(() => { vi.unstubAllGlobals(); vi.useRealTimers(); });

describe("Live proposal workflow", () => {
  it("retains actual metadata, requirements and analysis", () => {
    const p = createLiveProposal(input, response, "live-metadata"); saveProposal(p);
    expect(readProposal(p.id)).toMatchObject({ client: "Real Client", title: "Real Project", docType: "RFQ", requirements: input.requirements, response, status: "Draft" });
    expect(p.sections[0].content).toContain("Real Client");
    expect(p.sections.map(s => s.content).join(" ")).not.toContain("Meridian");
  });
  it("preserves edits across keyed reads used by navigation and export", () => {
    const p = createLiveProposal(input, response, "live-edit"); saveProposal(p);
    updateProposalSection(p.id, "exec", "LATEST EDIT");
    expect(readProposal(p.id)?.sections.find(s => s.id === "exec")?.content).toBe("LATEST EDIT");
    expect(readProposal(p.id)?.initialSections.find(s => s.id === "exec")?.content).toBe("Client summary");
  });
  it("isolates separate proposals", () => {
    const a = createLiveProposal(input, response, "live-a"); const b = createLiveProposal({ ...input, client_name: "Second Client" }, response, "live-b"); saveProposal(a); saveProposal(b);
    updateProposalSection(a.id, "exec", "A only");
    expect(readProposal(b.id)?.client).toBe("Second Client");
    expect(readProposal(b.id)?.sections.find(s => s.id === "exec")?.content).toBe("Client summary");
  });
  it("does not fall back to samples for missing or corrupt live records", () => {
    expect(readProposal("live-missing")).toBeNull();
    sessionStorage.setItem("bb-proposal:live-corrupt", "invalid json");
    expect(readProposal("live-corrupt")).toBeNull();
  });
  it("maps nested architecture and phases and leaves budgets unprovided", () => {
    const fields = solutionFields(response);
    expect(fields.architecture).toEqual([{ name: "API" }]); expect(fields.timeline).toEqual(["Discovery"]);
    const sections = buildLiveSections(createLiveProposal(input, response, "live-map"));
    expect(sections.find(s => s.id === "commercial")?.content).toBe("Not provided — requires clarification.");
    expect(sections.find(s => s.id === "timeline")?.content).toContain("unconfirmed");
  });
  it("rejects invalid backend analysis", () => {
    expect(() => validateAnalysis({ analysis: "bad" })).toThrow();
    expect(() => validateAnalysis({ client_name: "Client", project_title: "Project", analysis: {} })).toThrow();
    expect(validateAnalysis(response)).toEqual(response);
  });
  it("reports backend and network failures instead of samples", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 503 }));
    await expect(api.analyzeRequirements(input)).rejects.toThrow("503");
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    await expect(api.analyzeRequirements(input)).rejects.toThrow("Could not reach");
  });
  it("times out with an actionable error", async () => {
    vi.useFakeTimers();
    vi.stubGlobal("fetch", vi.fn((_url, options) => new Promise((_resolve, reject) => options.signal.addEventListener("abort", () => reject(new Error("aborted"))))));
    const pending = expect(api.analyzeRequirements(input)).rejects.toThrow("timed out");
    await vi.advanceTimersByTimeAsync(90000); await pending;
  });
  it("rejects invalid JSON responses", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => { throw new Error("invalid"); } }));
    await expect(api.analyzeRequirements(input)).rejects.toThrow("invalid data");
  });
  it("detects absent and present document endpoints", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ paths: {} }) }));
    expect(await api.exportCapabilities()).toEqual({ docx: false, pdf: false });
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: true, json: async () => ({ paths: { "/api/export/docx": { post: {} }, "/api/export/pdf": { post: {} } } }) }));
    expect(await api.exportCapabilities()).toEqual({ docx: true, pdf: true });
  });
  it("rejects HTML and JSON masquerading as downloaded documents", async () => {
    const blob = { arrayBuffer: async () => new TextEncoder().encode("<html>Error</html>").buffer } as Blob;
    await expect(validateDocument(blob, "pdf")).rejects.toThrow("valid document");
    await expect(validateDocument(blob, "docx")).rejects.toThrow("valid document");
  });
  it.each(["pdf", "docx"] as const)("exports latest edited sections through the %s endpoint", async format => {
    const blob = { arrayBuffer: async () => format === "pdf" ? new TextEncoder().encode("%PDF-1.4").buffer : new Uint8Array([80,75,3,4]).buffer } as Blob;
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, blob: async () => blob }); vi.stubGlobal("fetch", fetchMock);
    const payload = { id: "live-export", client_name: input.client_name, project_title: input.project_title, document_type: "RFQ", status: "Draft", sections: [{ id: "exec", title: "Executive Summary", content: "LATEST EDIT" }] };
    expect(await api.exportDocument(payload, format)).toBe(blob);
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual(payload);
    expect(fetchMock.mock.calls[0][0]).toContain(`/api/export/${format}`);
  });
});
