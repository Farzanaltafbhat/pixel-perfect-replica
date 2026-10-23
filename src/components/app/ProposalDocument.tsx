import type { ProposalSection } from "@/data/sample";

export function ProposalDocument({ sections }: { sections: ProposalSection[] }) {
  return (
    <article className="mx-auto max-w-3xl space-y-8 rounded-lg border bg-card p-10 shadow-sm">
      {sections.map((s) =>
        s.id === "cover" ? (
          <div key={s.id} className="border-b pb-8">
            <div className="mb-6 text-xs font-semibold uppercase tracking-widest text-primary">BriskBold IT · Proposal</div>
            {s.content.split("\n").map((l, i) => (
              <p key={i} className={i === 0 ? "font-display text-3xl font-bold" : "mt-1 text-sm text-muted-foreground"}>{l}</p>
            ))}
          </div>
        ) : (
          <ProposalSectionView key={s.id} section={s} />
        ),
      )}
    </article>
  );
}

export function ProposalSectionView({ section }: { section: ProposalSection }) {
  return (
    <section>
      <h2 className="mb-2 text-lg font-bold">{section.title}</h2>
      <div className="whitespace-pre-line text-sm leading-relaxed text-foreground/90">{section.content}</div>
    </section>
  );
}
