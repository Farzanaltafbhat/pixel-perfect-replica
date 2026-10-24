import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText, PenLine, Clock, CheckCircle2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader, PageBody, StatCard, Section, SampleNotice } from "@/components/app/ui";
import { ProposalTable } from "@/components/app/ProposalTable";
import { proposals } from "@/data/sample";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Dashboard · BriskBold AI Proposal Generator" },
      { name: "description", content: "Overview of proposals, drafts and items awaiting review at BriskBold IT." },
      { property: "og:title", content: "Dashboard · BriskBold AI Proposal Generator" },
      { property: "og:description", content: "Overview of proposals, drafts and items awaiting review at BriskBold IT." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const drafts = proposals.filter((p) => p.status === "Draft").length;
  const review = proposals.filter((p) => p.status === "In Review").length;
  const approved = proposals.filter((p) => p.status === "Approved").length;
  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title="Good morning, Aisha"
        description="Track proposal activity across BriskBold IT pre-sales."
        actions={<Button asChild size="lg"><Link to="/proposals/new"><Plus className="h-4 w-4" />Create New Proposal</Link></Button>}
      />
      <PageBody>
        <SampleNotice>Figures below are sample data for demonstration purposes.</SampleNotice>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total proposals" value={proposals.length} hint="This quarter" icon={<FileText className="h-4 w-4" />} />
          <StatCard label="Drafts" value={drafts} hint="Being prepared" icon={<PenLine className="h-4 w-4" />} />
          <StatCard label="Awaiting review" value={review} hint="Pending approval" icon={<Clock className="h-4 w-4" />} />
          <StatCard label="Approved" value={approved} hint="Ready to send" icon={<CheckCircle2 className="h-4 w-4" />} />
        </div>
        <Section title="Recently generated proposals" action={<Link to="/proposals" className="text-sm font-medium text-primary">View all</Link>}>
          <div className="-m-5"><ProposalTable rows={proposals.slice(0, 5)} /></div>
        </Section>
      </PageBody>
    </>
  );
}

