import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileDown, FileText } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PageHeader, ProposalStepper, Section, StatusBadge, Tag } from "@/components/app/ui";
import { ProposalDocument } from "@/components/app/ProposalDocument";
import { proposalSections, proposals } from "@/data/sample";
import { api, isBackendConnected } from "@/lib/api";

export const Route = createFileRoute("/proposals/$id/export")({
  head: () => ({
    meta: [
      { title: "Export Proposal · BriskBold" },
      { name: "description", content: "Preview the proposal and download it as Word or PDF." },
      { property: "og:title", content: "Export Proposal · BriskBold" },
      { property: "og:description", content: "Preview the proposal and download it as Word or PDF." },
    ],
  }),
  component: ExportPage,
});

function ExportPage() {
  const { id } = Route.useParams();
  const p = proposals.find((x) => x.id === id) ?? proposals[0];
  const [busy, setBusy] = useState<null | "docx" | "pdf">(null);
  const connected = isBackendConnected();

  const download = async (format: "docx" | "pdf") => {
    setBusy(format);
    try {
      const blob = await api.exportDocument(id, format);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${p.id}.${format}`; a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(null); }
  };

  const meta = [
    ["Reference", p.id], ["Client", p.client], ["Document type", p.docType], ["Owner", p.owner],
    ["Version", p.version], ["Estimated value", p.value], ["Created", p.created], ["Last updated", p.updated],
  ];

  return (
    <>
      <PageHeader eyebrow={p.client} title="Export Proposal" description={p.title} />
      <ProposalStepper id={id} current="export" />
      <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1fr_320px]">
        <div className="rounded-lg bg-muted p-4 md:p-8"><ProposalDocument sections={proposalSections} /></div>
        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Section title="Download">
            <div className="space-y-2">
              <Button className="w-full" disabled={!connected || busy !== null} onClick={() => download("docx")}><FileText className="h-4 w-4" />{busy === "docx" ? "Generating…" : "Download Word"}</Button>
              <Button variant="outline" className="w-full" disabled={!connected || busy !== null} onClick={() => download("pdf")}><FileDown className="h-4 w-4" />{busy === "pdf" ? "Generating…" : "Download PDF"}</Button>
              {!connected && <p className="pt-1 text-xs text-muted-foreground">Downloads are unavailable until the document generation service is connected.</p>}
            </div>
          </Section>
          <Section title="Approval status">
            <div className="flex items-center justify-between text-sm"><span className="text-muted-foreground">Current status</span><StatusBadge status={p.status} /></div>
            <ul className="mt-4 space-y-2 text-sm">
              <li className="flex justify-between"><span>Pre-sales lead</span><Tag tone="success">Approved</Tag></li>
              <li className="flex justify-between"><span>Solution architect</span><Tag tone="success">Approved</Tag></li>
              <li className="flex justify-between"><span>Commercial director</span><Tag tone="warning">Pending</Tag></li>
            </ul>
          </Section>
          <Section title="Metadata">
            <dl className="space-y-2 text-sm">
              {meta.map(([k, v]) => <div key={k} className="flex justify-between gap-4"><dt className="text-muted-foreground">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
            </dl>
          </Section>
        </aside>
      </div>
    </>
  );
}
