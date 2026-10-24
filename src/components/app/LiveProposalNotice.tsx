import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageBody } from "@/components/app/ui";

export function ProposalUnavailable({ loading = false }: { loading?: boolean }) {
  return <PageBody>{loading ? <p>Loading proposal…</p> : <><p role="alert" className="text-sm text-destructive">This proposal is unavailable in this browser session. Create a new proposal to continue.</p><Button asChild><Link to="/proposals/new">Create Proposal</Link></Button></>}</PageBody>;
}

export function LiveProposalNotice() {
  return <p className="text-xs text-muted-foreground">Live AI draft · Recommendations require review. Kept in this tab’s session, not permanently saved; closing the tab or clearing browser data may remove it.</p>;
}