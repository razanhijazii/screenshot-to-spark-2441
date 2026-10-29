import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { briefsQuery, trendsQuery } from "@/services/api";
import { Chip, PageHeader, Sparkline, StatusTag } from "@/components/ui-bits";
import type { TrendCategory, TrendStatus } from "@/types/models";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/trends")({
  head: () => ({
    meta: [
      { title: "Trend Signals — H&M Design & Demand Intelligence" },
      { name: "description", content: "Colour, silhouette, detail and fabric trends with momentum and evidence." },
      { property: "og:title", content: "Trend Signals — H&M Design & Demand Intelligence" },
      { property: "og:description", content: "Colour, silhouette, detail and fabric trends with momentum and evidence." },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(trendsQuery), queryClient.ensureQueryData(briefsQuery)]),
  component: Trends,
});

const cats: (TrendCategory | "all")[] = ["all", "colour", "silhouette", "detail", "fabric"];
const stats: (TrendStatus | "all")[] = ["all", "rising", "peaking", "fading"];

function Trends() {
  const { data: trends } = useSuspenseQuery(trendsQuery);
  const { data: briefs } = useSuspenseQuery(briefsQuery);
  const [cat, setCat] = useState<(typeof cats)[number]>("all");
  const [st, setSt] = useState<(typeof stats)[number]>("all");
  const [open, setOpen] = useState<string | null>(null);

  const list = trends.filter((t) => (cat === "all" || t.category === cat) && (st === "all" || t.status === st));

  return (
    <>
      <PageHeader eyebrow="Trend signals" title="What's moving, and why." />
      <div className="mb-8 flex flex-wrap gap-6">
        <div className="flex flex-wrap gap-2">{cats.map((c) => <Chip key={c} active={cat === c} onClick={() => setCat(c)}>{c}</Chip>)}</div>
        <div className="flex flex-wrap gap-2">{stats.map((s) => <Chip key={s} active={st === s} onClick={() => setSt(s)}>{s}</Chip>)}</div>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((t) => {
          const linked = briefs.filter((b) => b.linkedTrendIds.includes(t.id));
          const isOpen = open === t.id;
          return (
            <article key={t.id} className={cn("card-edit flex flex-col p-6", isOpen && "border-foreground")}>
              <button className="text-left" onClick={() => setOpen(isOpen ? null : t.id)}>
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{t.category}</span>
                  <StatusTag status={t.status} />
                </div>
                <h3 className="mt-3 text-xl">{t.name}</h3>
                <div className="mt-4 flex items-end justify-between gap-4">
                  <span className={cn("font-display text-3xl tabular-nums", t.momentum < 0 && "text-muted-foreground")}>
                    {t.momentum > 0 ? "+" : ""}{t.momentum}
                  </span>
                  <div className="w-2/3"><Sparkline data={t.weeklyScores} /></div>
                </div>
                <p className="eyebrow mt-4">{isOpen ? "Hide evidence −" : "Show evidence +"}</p>
              </button>
              {isOpen && (
                <div className="mt-4 border-t pt-4 text-sm">
                  <ul className="space-y-2">{t.evidence.map((e) => <li key={e} className="text-muted-foreground">— {e}</li>)}</ul>
                  <p className="eyebrow mt-5 mb-2">Used in {linked.length} brief{linked.length === 1 ? "" : "s"}</p>
                  <div className="flex flex-col gap-1">
                    {linked.map((b) => (
                      <Link key={b.id} to="/briefs/$id" params={{ id: b.id }} className="text-accent hover:underline">{b.title}</Link>
                    ))}
                    {linked.length === 0 && <span className="text-muted-foreground">No briefs — signal to avoid.</span>}
                  </div>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </>
  );
}
