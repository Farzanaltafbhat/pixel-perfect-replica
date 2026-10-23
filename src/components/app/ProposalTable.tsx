import { Link } from "@tanstack/react-router";
import { DataTable, StatusBadge, Tag } from "@/components/app/ui";
import type { Proposal } from "@/data/sample";

export function ProposalTable({ rows }: { rows: Proposal[] }) {
  return (
    <DataTable<Proposal>
      rows={rows}
      rowKey={(r) => r.id}
      columns={[
        { header: "Proposal", cell: (r) => (
          <Link to="/proposals/$id/editor" params={{ id: r.id }} className="block">
            <div className="font-medium text-foreground hover:text-primary">{r.title}</div>
            <div className="text-xs text-muted-foreground">{r.client} · <span className="font-mono">{r.id}</span></div>
          </Link>
        ) },
        { header: "Type", cell: (r) => <Tag tone="teal">{r.docType}</Tag> },
        { header: "Status", cell: (r) => <StatusBadge status={r.status} /> },
        { header: "Owner", cell: (r) => r.owner, className: "hidden md:table-cell" },
        { header: "Value", cell: (r) => <span className="font-mono text-xs">{r.value}</span>, className: "hidden lg:table-cell" },
        { header: "Updated", cell: (r) => <span className="text-muted-foreground">{r.updated}</span>, className: "hidden sm:table-cell" },
      ]}
    />
  );
}
