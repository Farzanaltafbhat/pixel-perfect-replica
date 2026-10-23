import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { UploadCloud, FileText, X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PageHeader, PageBody, Section } from "@/components/app/ui";
import { api, isBackendConnected } from "@/lib/api";

export const Route = createFileRoute("/proposals/new")({
  head: () => ({
    meta: [
      { title: "Create Proposal · BriskBold" },
      { name: "description", content: "Upload an RFI, RFP or RFQ and analyze client requirements." },
      { property: "og:title", content: "Create Proposal · BriskBold" },
      { property: "og:description", content: "Upload an RFI, RFP or RFQ and analyze client requirements." },
    ],
  }),
  component: CreateProposal,
});

const ACCEPTED = [".pdf", ".docx", ".txt"];
const MAX_MB = 20;

function CreateProposal() {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);
  const [client, setClient] = useState("");
  const [title, setTitle] = useState("");
  const [docType, setDocType] = useState("auto");
  const [text, setText] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const ok: File[] = [];
    for (const f of Array.from(list)) {
      const ext = f.name.slice(f.name.lastIndexOf(".")).toLowerCase();
      if (!ACCEPTED.includes(ext)) { toast.error(`${f.name}: only PDF, DOCX or TXT files are supported`); continue; }
      if (f.size > MAX_MB * 1024 * 1024) { toast.error(`${f.name}: exceeds ${MAX_MB} MB`); continue; }
      ok.push(f);
    }
    setFiles((prev) => [...prev, ...ok]);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!client.trim()) errs.client = "Client name is required";
    if (!title.trim()) errs.title = "Project title is required";
    if (!text.trim() && files.length === 0) errs.input = "Paste requirements or upload at least one document";
    else if (text.trim() && text.trim().length < 50 && files.length === 0) errs.input = "Requirements should be at least 50 characters";
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (!isBackendConnected()) {
      toast.info("AI analysis isn't connected yet", { description: "Opening the sample analysis so you can preview the workflow." });
      navigate({ to: "/proposals/$id/analysis", params: { id: "BB-2026-041" } });
      return;
    }
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("client", client); fd.append("title", title); fd.append("doc_type", docType); fd.append("requirements", text);
      files.forEach((f) => fd.append("files", f));
      const { proposalId } = await api.analyzeRequirements(fd);
      navigate({ to: "/proposals/$id/analysis", params: { id: proposalId } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <>
      <PageHeader eyebrow="New proposal" title="Create Proposal" description="Provide client details and requirements. The analysis engine will extract requirements and recommend a solution." />
      <PageBody>
        <form onSubmit={submit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Section title="Client & project">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Client name" error={errors.client}><Input value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Meridian Health Group" maxLength={120} /></Field>
                <Field label="Project title" error={errors.title}><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Patient Portal Modernisation" maxLength={160} /></Field>
                <Field label="Document type">
                  <Select value={docType} onValueChange={setDocType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic detection</SelectItem>
                      <SelectItem value="RFI">RFI — Request for Information</SelectItem>
                      <SelectItem value="RFP">RFP — Request for Proposal</SelectItem>
                      <SelectItem value="RFQ">RFQ — Request for Quotation</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>
            <Section title="Requirements" description="Paste the requirements text, upload documents, or both.">
              <div className="space-y-4">
                <Textarea value={text} onChange={(e) => setText(e.target.value)} rows={10} maxLength={50000} placeholder="Paste the RFP scope, requirements or email brief here…" />
                <div
                  onClick={() => fileRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/40 px-6 py-10 text-center hover:border-primary"
                >
                  <UploadCloud className="h-8 w-8 text-primary" />
                  <div className="mt-2 text-sm font-medium">Drop files here or click to browse</div>
                  <div className="text-xs text-muted-foreground">PDF, DOCX or TXT · up to {MAX_MB} MB each</div>
                  <input ref={fileRef} type="file" multiple accept={ACCEPTED.join(",")} className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
                </div>
                {files.length > 0 && (
                  <ul className="divide-y rounded-md border">
                    {files.map((f, i) => (
                      <li key={i} className="flex items-center justify-between px-3 py-2 text-sm">
                        <span className="flex items-center gap-2"><FileText className="h-4 w-4 text-muted-foreground" />{f.name}<span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span></span>
                        <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} aria-label="Remove file"><X className="h-4 w-4 text-muted-foreground" /></button>
                      </li>
                    ))}
                  </ul>
                )}
                {errors.input && <p className="text-sm text-destructive">{errors.input}</p>}
              </div>
            </Section>
          </div>
          <aside className="space-y-4">
            <Section title="What happens next">
              <ol className="space-y-3 text-sm text-muted-foreground">
                <li><span className="font-medium text-foreground">1. Analysis</span> — requirements, gaps and clarification questions.</li>
                <li><span className="font-medium text-foreground">2. Solution</span> — architecture, technologies and team.</li>
                <li><span className="font-medium text-foreground">3. Proposal</span> — editable draft by section.</li>
                <li><span className="font-medium text-foreground">4. Export</span> — Word and PDF documents.</li>
              </ol>
            </Section>
            {!isBackendConnected() && (
              <p className="rounded-md bg-warning-soft px-4 py-3 text-xs text-warning">AI backend not connected. Submitting will open the sample analysis instead of analyzing your input.</p>
            )}
            <Button type="submit" size="lg" className="w-full" disabled={busy}><Sparkles className="h-4 w-4" />{busy ? "Analyzing…" : "Analyze Requirements"}</Button>
          </aside>
        </form>
      </PageBody>
    </>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {children}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
