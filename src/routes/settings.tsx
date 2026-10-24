import { createFileRoute } from "@tanstack/react-router";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader, PageBody, Section, Tag } from "@/components/app/ui";
import { API_BASE_URL } from "@/lib/api";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Settings · BriskBold" },
      { name: "description", content: "Company profile, integrations and proposal defaults." },
      { property: "og:title", content: "Settings · BriskBold" },
      { property: "og:description", content: "Company profile, integrations and proposal defaults." },
    ],
  }),
  component: SettingsPage,
});

const integrations = [
  { name: "Proposal backend (FastAPI)", desc: "Analysis, generation and export API", connected: Boolean(API_BASE_URL) },
  { name: "Google Gemini", desc: "LLM processing — configured on the backend", connected: false },
  { name: "n8n", desc: "Workflow orchestration and notifications", connected: false },
  { name: "Document generation", desc: "DOCX generation and PDF conversion", connected: false },
  { name: "Database", desc: "Persistent proposal storage", connected: false },
];

function SettingsPage() {
  return (
    <>
      <PageHeader title="Settings" description="Workspace configuration for BriskBold IT." />
      <PageBody className="max-w-4xl">
        <Section title="Company profile">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5"><Label>Company name</Label><Input defaultValue="BriskBold IT" /></div>
            <div className="space-y-1.5"><Label>Default currency</Label><Input defaultValue="USD" /></div>
          </div>
        </Section>
        <Section title="Integrations" description="API keys are stored on the backend and never in this application.">
          <ul className="divide-y">
            {integrations.map((i) => (
              <li key={i.name} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div><div className="text-sm font-medium">{i.name}</div><div className="text-xs text-muted-foreground">{i.desc}</div></div>
                <Tag tone={i.connected ? "success" : "default"}>{i.connected ? "Connected" : "Not connected"}</Tag>
              </li>
            ))}
          </ul>
        </Section>
        <Section title="Proposal defaults">
          <div className="space-y-4">
            <div className="flex items-center justify-between"><Label>Include commercial estimate</Label><Switch defaultChecked /></div>
            <div className="flex items-center justify-between"><Label>Require approval before export</Label><Switch defaultChecked /></div>
          </div>
        </Section>
      </PageBody>
    </>
  );
}
