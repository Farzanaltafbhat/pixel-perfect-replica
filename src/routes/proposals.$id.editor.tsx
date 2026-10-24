import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, RefreshCw, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, ProposalStepper, SampleNotice } from "@/components/app/ui";
import { ProposalDocument } from "@/components/app/ProposalDocument";
import { LiveProposalNotice, ProposalUnavailable } from "@/components/app/LiveProposalNotice";
import { proposalSections, proposals, type ProposalSection } from "@/data/sample";
import { isLiveId } from "@/lib/api";
import { useLiveProposal, updateProposalSection } from "@/lib/proposal-state";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/proposals/$id/editor")({
  head: () => ({ meta: [
    { title: "Proposal Editor · BriskBold" },
    { name: "description", content: "Edit the current BriskBold proposal and preview its latest sections." },
    { property: "og:title", content: "Proposal Editor · BriskBold" },
    { property: "og:description", content: "Edit the current BriskBold proposal and preview its latest sections." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  return isLiveId(id) ? <LiveEditor key={id} id={id} /> : <DemoEditor key={id} id={id} />;
}

function LiveEditor({ id }: { id: string }) {
  const p = useLiveProposal(id);
  if (!p) return <ProposalUnavailable loading={p === undefined} />;
  return <EditorContent id={id} client={p.client} title={p.title} docType={p.docType} sections={p.sections} originals={p.initialSections ?? p.sections} live onUpdate={(sectionId, content) => updateProposalSection(id, sectionId, content)} />;
}

function DemoEditor({ id }: { id: string }) {
  const p = proposals.find(x => x.id === id);
  const [sections, setSections] = useState(proposalSections.map(s => ({ ...s })));
  if (!p) return <ProposalUnavailable />;
  return <EditorContent id={id} client={p.client} title={p.title} docType={p.docType} sections={sections} originals={proposalSections} live={false} onUpdate={(sectionId, content) => setSections(prev => prev.map(s => s.id === sectionId ? { ...s, content } : s))} />;
}

function EditorContent({ id, client, title, docType, sections, originals, live, onUpdate }: { id: string; client: string; title: string; docType: string; sections: ProposalSection[]; originals: ProposalSection[]; live: boolean; onUpdate: (sectionId: string, content: string) => void }) {
  const [active, setActive] = useState("cover");
  const [preview, setPreview] = useState(false);
  const current = sections.find(s => s.id === active) ?? sections[0];
  if (!current) return <ProposalUnavailable />;
  return <>
    <PageHeader eyebrow={`${client} · ${docType}`} title="Proposal Editor" description={title} actions={<>
      <Button variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" />Preview</Button>
      <Button asChild><Link to="/proposals/$id/export" params={{ id }}>Continue to Export<ArrowRight className="h-4 w-4" /></Link></Button>
    </>} />
    <ProposalStepper id={id} current="editor" />
    <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[240px_1fr]">
      <nav className="rounded-lg border bg-card p-2 lg:sticky lg:top-6 lg:self-start">
        <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</div>
        {sections.map((s, i) => <Button key={s.id} variant="ghost" onClick={() => setActive(s.id)} className={cn("h-auto w-full justify-between whitespace-normal px-3 py-2 text-left text-sm", s.id === current.id ? "bg-teal-soft font-medium text-accent-foreground" : "text-muted-foreground hover:bg-secondary")}>
          <span><span className="mr-2 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>{s.title}</span>
          {s.content !== originals.find(o => o.id === s.id)?.content && <Pencil className="h-3 w-3 shrink-0 text-primary" />}
        </Button>)}
      </nav>
      <div className="space-y-4">
        {live ? <LiveProposalNotice /> : <SampleNotice>Demonstration proposal. These edits last only while this editor is open.</SampleNotice>}
        <div className="rounded-lg border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4">
            <h2 className="text-lg font-semibold">{current.title}</h2>
            <Button variant="outline" size="sm" disabled title="The backend has no section regeneration endpoint"><RefreshCw className="h-4 w-4" />Regeneration unavailable</Button>
          </div>
          <div className="p-5"><Textarea aria-label={current.title} value={current.content} onChange={e => onUpdate(current.id, e.target.value)} rows={16} className="font-sans leading-relaxed" />
            {!current.content.trim() && <p className="mt-2 text-xs text-destructive">This section is empty. Add content before exporting.</p>}
            <div className="mt-2 text-right text-xs text-muted-foreground">{current.content.split(/\s+/).filter(Boolean).length} words</div>
          </div>
        </div>
      </div>
    </div>
    <Dialog open={preview} onOpenChange={setPreview}><DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-muted"><DialogHeader><DialogTitle>Proposal preview</DialogTitle></DialogHeader><ProposalDocument sections={sections} /></DialogContent></Dialog>
  </>;
}
