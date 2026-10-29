import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { briefsQuery, forecastsQuery, trendsQuery } from "@/services/api";
import { BriefCard, PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Overview — H&M Design & Demand Intelligence" },
      { name: "description", content: "Headline signals, top design briefs and trend momentum at a glance." },
      { property: "og:title", content: "Overview — H&M Design & Demand Intelligence" },
      { property: "og:description", content: "Headline signals, top design briefs and trend momentum at a glance." },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData(trendsQuery),
      queryClient.ensureQueryData(briefsQuery),
      queryClient.ensureQueryData(forecastsQuery),
    ]),
  component: Overview,
});

function Overview() {
  const { data: trends } = useSuspenseQuery(trendsQuery);
  const { data: briefs } = useSuspenseQuery(briefsQuery);
  const { data: forecasts } = useSuspenseQuery(forecastsQuery);

  const rising = trends.filter((t) => t.status === "rising").length;
  const units = forecasts.reduce((a, f) => a + f.recommendedUnits, 0);
  const avg = Math.round(briefs.reduce((a, b) => a + b.confidence, 0) / briefs.length);
  const top = [...briefs].sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  const chart = [...trends].sort((a, b) => b.momentum - a.momentum).map((t) => ({ name: t.name, m: t.momentum }));

  const stats = [
    ["Rising trends", rising],
    ["Active briefs", briefs.length],
    ["Recommended units", units.toLocaleString()],
    ["Avg. confidence", `${avg}%`],
  ];

  return (
    <>
      <PageHeader
        eyebrow="Season overview"
        title="What to design next, and how much."
        intro="Signals from search, social, runway and our own sales, distilled into briefs and production volumes."
      />
      <section className="grid grid-cols-2 border-y md:grid-cols-4">
        {stats.map(([l, v], i) => (
          <div key={l as string} className={`p-6 ${i > 0 ? "md:border-l" : ""} ${i % 2 ? "border-l" : ""}`}>
            <p className="eyebrow">{l}</p>
            <p className="mt-3 font-display text-4xl">{v}</p>
          </div>
        ))}
      </section>

      <section className="mt-14">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="text-2xl">Top briefs</h2>
          <Link to="/briefs" className="text-sm underline-offset-4 hover:underline">All briefs →</Link>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {top.map((b) => <BriefCard key={b.id} brief={b} />)}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-6 text-2xl">Rising vs fading</h2>
        <div className="card-edit h-80 p-6">
          <ResponsiveContainer>
            <BarChart data={chart} layout="vertical" margin={{ left: 40 }}>
              <XAxis type="number" domain={[-100, 100]} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
              <Tooltip cursor={{ fill: "var(--muted)" }} />
              <Bar dataKey="m" name="Momentum">
                {chart.map((c) => <Cell key={c.name} fill={c.m >= 0 ? "var(--accent)" : "var(--muted-foreground)"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </>
  );
}
