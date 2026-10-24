import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { PageHeader, PageBody, Section, DataTable, Tag, SampleNotice } from "@/components/app/ui";
import { catalogue } from "@/data/sample";

export const Route = createFileRoute("/catalogue")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Technology Catalogue · BriskBold" },
      { name: "description", content: "Technologies, platforms and owning departments available to BriskBold IT proposals." },
      { property: "og:title", content: "Technology Catalogue · BriskBold" },
      { property: "og:description", content: "Technologies, platforms and owning departments available to BriskBold IT proposals." },
    ],
  }),
  component: Catalogue,
});

function Catalogue() {
  const [q, setQ] = useState("");
  const rows = catalogue.filter((c) => `${c.name} ${c.category} ${c.department}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Technology Catalogue" description="Approved technologies the recommendation engine can draw from." />
      <PageBody>
        <SampleNotice>Sample catalogue entries. Manage the live catalogue once storage is connected.</SampleNotice>
        <Section title={`${rows.length} technologies`} action={<Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search" className="h-8 w-48" />}>
          <div className="-m-5">
            <DataTable rows={rows} rowKey={(r) => r.name} columns={[
              { header: "Technology", cell: (r) => <span className="font-medium">{r.name}</span> },
              { header: "Category", cell: (r) => <Tag tone="teal">{r.category}</Tag> },
              { header: "Department", cell: (r) => <span className="text-muted-foreground">{r.department}</span>, className: "hidden md:table-cell" },
              { header: "Maturity", cell: (r) => <Tag tone={r.maturity === "Core" ? "success" : r.maturity === "Emerging" ? "warning" : "default"}>{r.maturity}</Tag> },
              { header: "Projects", cell: (r) => <span className="font-mono text-xs">{r.projects}</span> },
            ]} />
          </div>
        </Section>
      </PageBody>
    </>
  );
}
