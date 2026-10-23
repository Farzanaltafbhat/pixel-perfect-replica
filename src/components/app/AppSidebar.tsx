import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, FilePlus2, Files, Boxes, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { to: "/proposals/new", label: "Create Proposal", icon: FilePlus2, match: (p: string) => p === "/proposals/new" },
  { to: "/proposals", label: "All Proposals", icon: Files, match: (p: string) => p.startsWith("/proposals") && p !== "/proposals/new" },
  { to: "/catalogue", label: "Technology Catalogue", icon: Boxes, match: (p: string) => p.startsWith("/catalogue") },
  { to: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-sidebar text-sidebar-foreground md:flex">
      <div className="flex items-center gap-3 border-b border-sidebar-border px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary font-display text-sm font-bold text-primary-foreground">BB</div>
        <div>
          <div className="font-display text-sm font-bold leading-tight">BriskBold IT</div>
          <div className="text-xs text-navy-muted">AI Proposal Generator</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-4">
        {items.map((i) => {
          const active = i.match(path);
          return (
            <Link key={i.to} to={i.to} className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
              active ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground" : "text-navy-muted hover:bg-sidebar-accent/60 hover:text-sidebar-foreground",
            )}>
              <i.icon className={cn("h-4 w-4", active && "text-primary")} />
              {i.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-sidebar-border px-5 py-4 text-xs text-navy-muted">
        <div className="font-medium text-sidebar-foreground">Aisha Rahman</div>
        Pre-Sales Lead
      </div>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="flex gap-1 overflow-x-auto border-b bg-sidebar px-3 py-2 md:hidden">
      {items.map((i) => (
        <Link key={i.to} to={i.to} className="whitespace-nowrap rounded px-3 py-1.5 text-xs text-navy-muted" activeProps={{ className: "bg-sidebar-accent text-sidebar-foreground" }} activeOptions={{ exact: true }}>
          {i.label}
        </Link>
      ))}
    </nav>
  );
}
