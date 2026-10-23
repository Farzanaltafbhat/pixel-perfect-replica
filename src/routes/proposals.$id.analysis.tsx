import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HelpCircle, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageBody, Section, DataTable, Tag, SampleNotice, ProposalStepper } from "@/components/app/ui";
import { analysis, proposals } from "@/data/sample";

export const Route = createFileRoute("/proposals/$id/analysis")({
  head: () => ({
    meta: [
      { title: "Requirements Analysis · BriskBold" },
      { name: "description", content: "Structured analysis of client requirements, gaps and clarification questions." },
      { property: "og:title", content: "Requirements Analysis · BriskBold" },
      { property: "og:description", content: "Structured analysis of client requirements, gaps and clarification questions." },
    ],
  }),
  component: Analysis,
});

const prioTone = { Must: "danger", Should: "warning", Could: "default" } as const;
const intTone = { Confirmed: "success", Assumed: "warning", Unclear: "danger" } as const;

function Analysis() {
  const { id } = Route.useParams();
  const p = proposals.find((x) => x.id === id) ?? proposals[0];
  return (
    <>
      <PageHeader eyebrow={`${p.client} · ${p.docType}`} title="Requirements Analysis" description={p.title}
        actions={<Button asChild><Link to="/proposals/$id/solution" params={{ id }}>Continue to Solution<ArrowRight className="h-4 w-4" /></Link></Button>} />
      <ProposalStepper id={id} current="analysis" />
      <PageBody>
        <SampleNotice />
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Executive Summary"><p className="text-sm leading-relaxed">{analysis.executiveSummary}</p></Section>
          <Section title="Business Problem"><p className="text-sm leading-relaxed">{analysis.businessProblem}</p></Section>
        </div>
        <Section title="Extracted Requirements" description={`${analysis.extracted.length} requirements identified in source documents`}>
          <div className="-m-5">
            <DataTable rows={analysis.extracted} rowKey={(r) => r.id} columns={[
              { header: "ID", cell: (r) => <span className="font-mono text-xs">{r.id}</span> },
              { header: "Requirement", cell: (r) => r.text },
              { header: "Source", cell: (r) => <span className="text-muted-foreground">{r.source}</span>, className: "hidden sm:table-cell" },
              { header: "Priority", cell: (r) => <Tag tone={prioTone[r.priority as keyof typeof prioTone]}>{r.priority}</Tag> },
            ]} />
          </div>
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Functional Requirements"><KV items={analysis.functional} /></Section>
          <Section title="Technical Requirements"><KV items={analysis.technical} /></Section>
        </div>
        <Section title="Integrations">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {analysis.integrations.map((i) => (
              <div key={i.system} className="rounded-md border p-4">
                <div className="font-medium">{i.system}</div>
                <div className="mt-1 text-xs text-muted-foreground">{i.method}</div>
                <div className="mt-3"><Tag tone={intTone[i.status as keyof typeof intTone]}>{i.status}</Tag></div>
              </div>
            ))}
          </div>
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Missing Information">
            <ul className="space-y-2 text-sm">{analysis.missing.map((m) => <li key={m} className="flex gap-2"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />{m}</li>)}</ul>
          </Section>
          <Section title="Clarification Questions">
            <ol className="space-y-2 text-sm">{analysis.questions.map((q) => <li key={q} className="flex gap-2"><HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{q}</li>)}</ol>
          </Section>
        </div>
      </PageBody>
    </>
  );
}

function KV({ items }: { items: { area: string; detail: string }[] }) {
  return (
    <dl className="divide-y">
      {items.map((i) => (
        <div key={i.area} className="grid grid-cols-3 gap-4 py-2.5 text-sm first:pt-0 last:pb-0">
          <dt className="font-medium">{i.area}</dt><dd className="col-span-2 text-muted-foreground">{i.detail}</dd>
        </div>
      ))}
    </dl>
  );
}
