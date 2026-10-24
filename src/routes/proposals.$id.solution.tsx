import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageBody, Section, DataTable, Tag, SampleNotice, ProposalStepper } from "@/components/app/ui";
import { isLiveId } from "@/lib/api";
import { useLiveProposal, solutionFields, proposalText } from "@/lib/proposal-state";
import { LiveProposalNotice, ProposalUnavailable } from "@/components/app/LiveProposalNotice";
import { proposals, solution } from "@/data/sample";

export const Route = createFileRoute("/proposals/$id/solution")({
  head: () => ({
    meta: [
      { title: "Solution Recommendations · BriskBold" },
      { name: "description", content: "Recommended architecture, technologies, departments and team for the proposal." },
      { property: "og:title", content: "Solution Recommendations · BriskBold" },
      { property: "og:description", content: "Recommended architecture, technologies, departments and team for the proposal." },
    ],
  }),
  component: Solution,
});

const lvl = { High: "teal", Medium: "default", Low: "default" } as const;

function Solution() {
  const { id } = Route.useParams();
  if (isLiveId(id)) return <LiveSolution id={id} />;
  const p = proposals.find((x) => x.id === id);
  if (!p) return <ProposalUnavailable />;
  return (
    <>
      <PageHeader eyebrow={`${p.client} · ${p.docType}`} title="Solution Recommendations" description={p.title}
        actions={<Button asChild><Link to="/proposals/$id/editor" params={{ id }}>Build Proposal<ArrowRight className="h-4 w-4" /></Link></Button>} />
      <ProposalStepper id={id} current="solution" />
      <PageBody>
        <SampleNotice />
        <Section title="Proposed Solution"><p className="text-sm leading-relaxed">{solution.proposed}</p></Section>
        <Section title="Recommended Architecture">
          <div className="space-y-2">
            {solution.architecture.map((a, i) => (
              <div key={a.layer} className="flex items-center gap-4 rounded-md border bg-muted/40 px-4 py-3">
                <span className="font-mono text-xs text-muted-foreground">L{i + 1}</span>
                <span className="w-32 shrink-0 text-sm font-semibold">{a.layer}</span>
                <span className="text-sm text-muted-foreground">{a.detail}</span>
              </div>
            ))}
          </div>
        </Section>
        <Section title="Recommended Technologies" description="Each technology includes its purpose and selection rationale">
          <div className="-m-5">
            <DataTable rows={solution.technologies} rowKey={(r) => r.name} columns={[
              { header: "Technology", cell: (r) => <div><div className="font-medium">{r.name}</div><Tag tone="teal">{r.category}</Tag></div> },
              { header: "Purpose", cell: (r) => r.purpose },
              { header: "Why selected", cell: (r) => <span className="text-muted-foreground">{r.why}</span> },
            ]} />
          </div>
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Tools and Platforms"><div className="flex flex-wrap gap-2">{solution.tools.map((t) => <Tag key={t}>{t}</Tag>)}</div></Section>
          <Section title="Required Departments">
            <ul className="divide-y">{solution.departments.map((d) => (
              <li key={d.name} className="flex items-center justify-between py-2 text-sm first:pt-0 last:pb-0">{d.name}<Tag tone={lvl[d.involvement as keyof typeof lvl]}>{d.involvement}</Tag></li>
            ))}</ul>
          </Section>
        </div>
        <Section title="Team Roles and Responsibilities">
          <div className="-m-5">
            <DataTable rows={solution.roles} rowKey={(r) => r.role} columns={[
              { header: "Role", cell: (r) => <span className="font-medium">{r.role}</span> },
              { header: "FTE", cell: (r) => <span className="font-mono text-xs">{r.fte}</span> },
              { header: "Responsibilities", cell: (r) => <span className="text-muted-foreground">{r.responsibility}</span> },
            ]} />
          </div>
        </Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Project Scope">
            <div className="grid gap-4 sm:grid-cols-2 text-sm">
              <div><div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">In scope</div>{solution.scope.inScope.map((s) => <div key={s} className="flex gap-2 py-1"><Check className="h-4 w-4 text-success" />{s}</div>)}</div>
              <div><div className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Out of scope</div>{solution.scope.outOfScope.map((s) => <div key={s} className="flex gap-2 py-1"><Minus className="h-4 w-4 text-muted-foreground" />{s}</div>)}</div>
            </div>
          </Section>
          <Section title="Deliverables">
            <ol className="space-y-2 text-sm">{solution.deliverables.map((d, i) => <li key={d} className="flex gap-3"><span className="font-mono text-xs text-muted-foreground">D{i + 1}</span>{d}</li>)}</ol>
          </Section>
        </div>
        <Section title="Risks and Dependencies">
          <div className="-m-5">
            <DataTable rows={solution.risks} rowKey={(r) => r.risk} columns={[
              { header: "Risk", cell: (r) => r.risk },
              { header: "Impact", cell: (r) => <Tag tone={r.impact === "High" ? "danger" : r.impact === "Medium" ? "warning" : "default"}>{r.impact}</Tag> },
              { header: "Mitigation", cell: (r) => <span className="text-muted-foreground">{r.mitigation}</span> },
            ]} />
          </div>
        </Section>
      </PageBody>
    </>
  );
}

function LiveSolution({ id }: { id: string }) {
  const p = useLiveProposal(id);
  if (!p) return <ProposalUnavailable loading={p === undefined} />;
  const s = solutionFields(p.response);
  const fields: [string, unknown][] = [
    ["Proposed Solution", s.proposed], ["Recommended Architecture", s.architecture],
    ["Recommended Technologies", s.technologies], ["Tools and Platforms", s.tools],
    ["Integrations", s.integrations], ["Required Departments", s.departments],
    ["Team Roles and Responsibilities", s.roles], ["Project Scope", s.scope],
    ["Deliverables", s.deliverables], ["Risks and Dependencies", s.risks],
    ["Implementation Considerations", s.considerations],
  ];
  return <><PageHeader eyebrow={`${p.client} · ${p.docType}`} title="Solution Recommendations" description={p.title}
    actions={<Button asChild><Link to="/proposals/$id/editor" params={{ id }}>Build Proposal<ArrowRight className="h-4 w-4" /></Link></Button>} />
    <ProposalStepper id={id} current="solution" /><PageBody><LiveProposalNotice />
      {fields.map(([title, value]) => <Section key={title} title={title}><p className="whitespace-pre-line text-sm leading-relaxed">{proposalText(value)}</p></Section>)}
    </PageBody></>;
}
