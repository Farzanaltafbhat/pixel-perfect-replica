import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowRight, Eye, RefreshCw, Pencil } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { PageHeader, ProposalStepper, SampleNotice } from "@/components/app/ui";
import { ProposalDocument } from "@/components/app/ProposalDocument";
import { proposalSections, proposals } from "@/data/sample";
import { api, isBackendConnected } from "@/lib/api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/proposals/$id/editor")({
  head: () => ({
    meta: [
      { title: "Proposal Editor · BriskBold" },
      { name: "description", content: "Edit proposal sections, regenerate content and preview the document." },
      { property: "og:title", content: "Proposal Editor · BriskBold" },
      { property: "og:description", content: "Edit proposal sections, regenerate content and preview the document." },
    ],
  }),
  component: Editor,
});

function Editor() {
  const { id } = Route.useParams();
  const p = proposals.find((x) => x.id === id) ?? proposals[0];
  const [sections, setSections] = useState(proposalSections);
  const [active, setActive] = useState(sections[0].id);
  const [preview, setPreview] = useState(false);
  const [regen, setRegen] = useState(false);
  const current = sections.find((s) => s.id === active)!;
  const original = proposalSections.find((s) => s.id === active)!;

  const update = (content: string) => setSections((ss) => ss.map((s) => (s.id === active ? { ...s, content } : s)));

  const regenerate = async () => {
    if (!isBackendConnected()) {
      toast.info("Regeneration needs the AI backend", { description: "Sample mode: the section has been reset to its original sample text." });
      update(original.content);
      return;
    }
    setRegen(true);
    try { update((await api.regenerateSection(id, active)).content); toast.success("Section regenerated"); }
    catch (e) { toast.error((e as Error).message); }
    finally { setRegen(false); }
  };

  return (
    <>
      <PageHeader eyebrow={`${p.client} · ${p.version}`} title="Proposal Editor" description={p.title}
        actions={<>
          <Button variant="outline" onClick={() => setPreview(true)}><Eye className="h-4 w-4" />Preview</Button>
          <Button asChild><Link to="/proposals/$id/export" params={{ id }}>Continue to Export<ArrowRight className="h-4 w-4" /></Link></Button>
        </>} />
      <ProposalStepper id={id} current="editor" />
      <div className="grid gap-6 px-6 py-8 md:px-10 lg:grid-cols-[240px_1fr]">
        <nav className="rounded-lg border bg-card p-2 lg:sticky lg:top-6 lg:self-start">
          <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Sections</div>
          {sections.map((s, i) => {
            const edited = s.content !== proposalSections[i].content;
            return (
              <button key={s.id} onClick={() => setActive(s.id)} className={cn(
                "flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm",
                s.id === active ? "bg-teal-soft font-medium text-accent-foreground" : "text-muted-foreground hover:bg-secondary",
              )}>
                <span><span className="mr-2 font-mono text-xs">{String(i + 1).padStart(2, "0")}</span>{s.title}</span>
                {edited && <Pencil className="h-3 w-3 text-primary" />}
              </button>
            );
          })}
        </nav>
        <div className="space-y-4">
          <SampleNotice>Sample proposal content. Edits are kept in this session only until storage is connected.</SampleNotice>
          <div className="rounded-lg border bg-card">
            <div className="flex items-center justify-between border-b px-5 py-4">
              <h2 className="text-lg font-semibold">{current.title}</h2>
              <Button variant="outline" size="sm" onClick={regenerate} disabled={regen}><RefreshCw className={cn("h-4 w-4", regen && "animate-spin")} />Regenerate section</Button>
            </div>
            <div className="p-5">
              <Textarea value={current.content} onChange={(e) => update(e.target.value)} rows={16} className="font-sans leading-relaxed" />
              <div className="mt-2 text-right text-xs text-muted-foreground">{current.content.split(/\s+/).filter(Boolean).length} words</div>
            </div>
          </div>
        </div>
      </div>
      <Dialog open={preview} onOpenChange={setPreview}>
        <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto bg-muted">
          <DialogHeader><DialogTitle>Proposal preview</DialogTitle></DialogHeader>
          <ProposalDocument sections={sections} />
        </DialogContent>
      </Dialog>
    </>
  );
}
