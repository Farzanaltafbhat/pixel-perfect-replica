import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FileDown, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, ProposalStepper, Section, StatusBadge, SampleNotice } from "@/components/app/ui";
import { ProposalDocument } from "@/components/app/ProposalDocument";
import { LiveProposalNotice, ProposalUnavailable } from "@/components/app/LiveProposalNotice";
import { proposalSections, proposals } from "@/data/sample";
import { api, isLiveId, type ExportCapabilities } from "@/lib/api";
import { useLiveProposal, type LiveProposal } from "@/lib/proposal-state";

export const Route = createFileRoute("/proposals/$id/export")({
  head: () => ({ meta: [
    { title: "Export Proposal · BriskBold" },
    { name: "description", content: "Preview the latest BriskBold proposal and export Word or PDF documents." },
    { property: "og:title", content: "Export Proposal · BriskBold" },
    { property: "og:description", content: "Preview the latest BriskBold proposal and export Word or PDF documents." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: ExportPage,
});

function ExportPage() {
  const { id } = Route.useParams();
  return isLiveId(id) ? <LiveExport key={id} id={id} /> : <DemoExport id={id} />;
}

function DemoExport({ id }: { id: string }) {
  const p = proposals.find(x => x.id === id);
  if (!p) return <ProposalUnavailable />;
  return <><PageHeader eyebrow={p.client} title="Export Proposal" description={p.title} /><ProposalStepper id={id} current="export" /><div className="space-y-4 px-6 py-8 md:px-10"><SampleNotice>Demonstration content only. Live document downloads require a live proposal.</SampleNotice><ProposalDocument sections={proposalSections} /></div></>;
}

function LiveExport({ id }: { id: string }) {
  const p = useLiveProposal(id);
  if (!p) return <ProposalUnavailable loading={p === undefined} />;
  return <ExportContent p={p} />;
}

function ExportContent({ p }: { p: LiveProposal }) {
  const [busy, setBusy] = useState<"docx" | "pdf" | null>(null);
  const [capabilities, setCapabilities] = useState<ExportCapabilities | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let cancelled = false;
    setCapabilities(null);
    setError(null);
    api.exportCapabilities().then(c => { if (!cancelled) setCapabilities(c); }).catch(e => { if (!cancelled) setError(e instanceof Error ? e.message : "Could not check document generation."); });
    return () => { cancelled = true; };
  }, [attempt]);
  const empty = p.sections.some(s => !s.content.trim());
  const download = async (format: "docx" | "pdf") => {
    setBusy(format); setError(null); setDownloaded(null);
    try {
      const blob = await api.exportDocument({ id: p.id, client_name: p.client, project_title: p.title, document_type: p.docType, status: p.status, sections: p.sections }, format);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const name = `${p.client}-${p.title}`.replace(/[^a-zA-Z0-9_-]+/g, "-").slice(0, 100) || "BriskBold-proposal";
      link.href = url; link.download = `${name}.${format}`; document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
      setDownloaded(`${format === "docx" ? "Word" : "PDF"} document generated and download started.`);
    } catch (e) { setError(e instanceof Error ? e.message : "Document generation failed. Please retry."); }
    finally { setBusy(null); }
  };
  const metadata = [["Reference", p.id], ["Client", p.client], ["Project", p.title], ["Document type", p.docType], ["Owner", "Not assigned"], ["Version", p.version], ["Created", p.created], ["Last updated", p.updated]];
  return <><PageHeader eyebrow={`${p.client} · ${p.docType}`} title="Export Proposal" description={p.title} /><ProposalStepper id={p.id} current="export" />
    <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4"><LiveProposalNotice /><div className="rounded-lg bg-muted p-4 md:p-8"><ProposalDocument sections={p.sections} /></div></div>
      <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
        <Section title="Download"><div className="space-y-2">
          <Button className="w-full" disabled={!capabilities?.docx || busy !== null || empty} onClick={() => download("docx")}><FileText className="h-4 w-4" />{busy === "docx" ? "Generating…" : "Download Word"}</Button>
          <Button variant="outline" className="w-full" disabled={!capabilities?.pdf || busy !== null || empty} onClick={() => download("pdf")}><FileDown className="h-4 w-4" />{busy === "pdf" ? "Generating…" : "Download PDF"}</Button>
          {capabilities === null && !error && <p className="text-xs text-muted-foreground">Checking document generation…</p>}
          {capabilities && (!capabilities.docx || !capabilities.pdf) && <p className="text-xs text-warning">{!capabilities.docx ? "Word" : ""}{!capabilities.docx && !capabilities.pdf ? " and " : ""}{!capabilities.pdf ? "PDF" : ""} generation is unavailable: the backend export endpoints must be installed.</p>}
          {empty && <p className="text-xs text-destructive">Complete empty sections in the editor before exporting.</p>}
          {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
          {(error || capabilities && (!capabilities.docx || !capabilities.pdf)) && <Button variant="outline" size="sm" onClick={() => setAttempt(a => a + 1)}>Retry connection</Button>}
          {downloaded && <p role="status" className="text-xs text-success">{downloaded}</p>}
        </div></Section>
        <Section title="Approval status"><div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Current status</span><StatusBadge status={p.status} /></div><p className="mt-3 text-xs text-muted-foreground">No approvals recorded. This proposal is a draft.</p></Section>
        <Section title="Metadata"><dl className="space-y-2 text-sm">{metadata.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="break-words text-right font-medium">{v}</dd></div>)}</dl></Section>
      </aside>
    </div></>;
}
