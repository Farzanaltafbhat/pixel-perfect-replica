import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ProposalStatus } from "@/data/sample";

export function PageHeader({ title, description, actions, eyebrow }: { title: string; description?: string; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="flex flex-col gap-4 border-b bg-card px-6 py-6 md:flex-row md:items-end md:justify-between md:px-10">
      <div>
        {eyebrow && <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-primary">{eyebrow}</div>}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </header>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-6 px-6 py-8 md:px-10", className)}>{children}</div>;
}

export function StatCard({ label, value, hint, icon }: { label: string; value: string | number; hint?: string; icon?: ReactNode }) {
  return (
    <div className="rounded-lg border bg-card p-5">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        {label}
        {icon && <span className="text-primary">{icon}</span>}
      </div>
      <div className="mt-2 font-display text-3xl font-bold">{value}</div>
      {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
    </div>
  );
}

const statusStyles: Record<ProposalStatus, string> = {
  Draft: "bg-secondary text-secondary-foreground",
  Analyzing: "bg-info-soft text-info",
  "In Review": "bg-warning-soft text-warning",
  Approved: "bg-success-soft text-success",
  Rejected: "bg-destructive/10 text-destructive",
};

export function StatusBadge({ status }: { status: ProposalStatus }) {
  return <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status])}>{status}</span>;
}

export function Tag({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "teal" | "warning" | "success" | "danger" }) {
  const tones = {
    default: "bg-secondary text-secondary-foreground",
    teal: "bg-teal-soft text-accent-foreground",
    warning: "bg-warning-soft text-warning",
    success: "bg-success-soft text-success",
    danger: "bg-destructive/10 text-destructive",
  };
  return <span className={cn("inline-flex items-center rounded px-2 py-0.5 text-xs font-medium", tones[tone])}>{children}</span>;
}

export function Section({ title, description, children, action }: { title: string; description?: string; children: ReactNode; action?: ReactNode }) {
  return (
    <section className="rounded-lg border bg-card">
      <div className="flex items-start justify-between gap-4 border-b px-5 py-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          {description && <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>}
        </div>
        {action}
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

export function DataTable<T>({ columns, rows, rowKey }: { columns: { header: string; cell: (r: T) => ReactNode; className?: string }[]; rows: T[]; rowKey: (r: T) => string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
            {columns.map((c) => <th key={c.header} className={cn("px-4 py-3 font-medium", c.className)}>{c.header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={rowKey(r)} className="border-b last:border-0 hover:bg-muted/50">
              {columns.map((c) => <td key={c.header} className={cn("px-4 py-3 align-top", c.className)}>{c.cell(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function SampleNotice({ children }: { children?: ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-info/20 bg-info-soft px-4 py-3 text-sm text-info">
      <Info className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children ?? "Sample data shown for demonstration. Live AI analysis will appear once the backend is connected."}</span>
    </div>
  );
}

const steps = [
  { key: "analysis", label: "Analysis", to: "/proposals/$id/analysis" },
  { key: "solution", label: "Solution", to: "/proposals/$id/solution" },
  { key: "editor", label: "Editor", to: "/proposals/$id/editor" },
  { key: "export", label: "Export", to: "/proposals/$id/export" },
] as const;

export function ProposalStepper({ id, current }: { id: string; current: (typeof steps)[number]["key"] }) {
  const idx = steps.findIndex((s) => s.key === current);
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-card px-6 py-3 md:px-10">
      {steps.map((s, i) => (
        <div key={s.key} className="flex items-center gap-2">
          <Link to={s.to} params={{ id }} className={cn(
            "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm",
            i === idx ? "bg-teal-soft font-medium text-accent-foreground" : "text-muted-foreground hover:text-foreground",
          )}>
            <span className={cn("flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-semibold",
              i <= idx ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{i + 1}</span>
            {s.label}
          </Link>
          {i < steps.length - 1 && <span className="h-px w-6 bg-border" />}
        </div>
      ))}
    </div>
  );
}
