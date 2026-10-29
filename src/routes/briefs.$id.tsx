import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { briefQuery, forecastsQuery, trendsQuery } from "@/services/api";
import { RiskBadge, ScoreBar } from "@/components/ui-bits";

export const Route = createFileRoute("/briefs/$id")({
  loader: async ({ context: { queryClient }, params }) => {
    const brief = await queryClient.ensureQueryData(briefQuery(params.id));
    if (!brief) throw notFound();
    await Promise.all([queryClient.ensureQueryData(trendsQuery), queryClient.ensureQueryData(forecastsQuery)]);
    return { title: brief.title, detail: brief.signatureDetail };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Design Brief` },
          { name: "description", content: loaderData.detail },
          { property: "og:title", content: `${loaderData.title} — Design Brief` },
          { property: "og:description", content: loaderData.detail },
        ]
      : [{ title: "Brief unavailable" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="py-20 text-center">
      <h1 className="text-3xl">Brief not found</h1>
      <Link to="/briefs" className="mt-4 inline-block underline">Back to briefs</Link>
    </div>
  ),
  component: BriefDetail,
});

function BriefDetail() {
  const { id } = Route.useParams();
  const { data: brief } = useSuspenseQuery(briefQuery(id));
  const { data: trends } = useSuspenseQuery(trendsQuery);
  const { data: forecasts } = useSuspenseQuery(forecastsQuery);
  if (!brief) return null;
  const f = forecasts.find((x) => x.briefId === brief.id);
  const linked = trends.filter((t) => brief.linkedTrendIds.includes(t.id));

  return (
    <article>
      <Link to="/briefs" className="eyebrow hover:text-foreground">← All briefs</Link>
      <header className="mt-6 border-b pb-8">
        <p className="eyebrow">{brief.garmentType} · {brief.style} · {brief.priceRange}</p>
        <h1 className="mt-3 max-w-3xl text-4xl leading-tight md:text-5xl">{brief.title}</h1>
        <div className="mt-5 flex flex-wrap gap-2">
          {linked.map((t) => (
            <Link key={t.id} to="/trends" className="rounded-full border px-3 py-1 text-xs hover:border-foreground">{t.name}</Link>
          ))}
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_320px]">
        <div className="space-y-10">
          <section>
            <p className="eyebrow mb-2">The base</p>
            <p className="text-lg leading-relaxed">{brief.baseDescription}</p>
          </section>
          <section className="border-l-2 border-accent bg-accent-soft p-6">
            <p className="eyebrow mb-2 text-accent">Signature detail</p>
            <p className="font-display text-2xl leading-snug">{brief.signatureDetail}</p>
          </section>
          <section>
            <h2 className="mb-4 text-2xl">Why now</h2>
            <ol className="divide-y border-y">
              {brief.whyNow.map((w, i) => (
                <li key={w} className="flex gap-4 py-3 text-sm"><span className="font-display text-accent">{String(i + 1).padStart(2, "0")}</span>{w}</li>
              ))}
            </ol>
          </section>
          {f && (
            <section>
              <div className="mb-4 flex items-end justify-between">
                <h2 className="text-2xl">Demand forecast</h2>
                <Link to="/demand" className="text-sm hover:underline">Demand & Stock →</Link>
              </div>
              <div className="card-edit h-56 p-4">
                <ResponsiveContainer>
                  <AreaChart data={f.weeklyDemand}>
                    <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <Tooltip />
                    <Area dataKey="units" stroke="var(--accent)" fill="var(--accent-soft)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </section>
          )}
        </div>

        <aside className="space-y-6">
          <div className="card-edit space-y-5 p-6">
            <ScoreBar label="Brand DNA fit" value={brief.brandDnaFit} />
            <ScoreBar label="Confidence" value={brief.confidence} />
          </div>
          <div className="card-edit space-y-4 p-6 text-sm">
            <div><p className="eyebrow mb-1">Target customer</p>{brief.targetCustomer}</div>
            <div><p className="eyebrow mb-1">Price range</p>{brief.priceRange}</div>
            {f && (
              <>
                <div><p className="eyebrow mb-1">Recommended units</p><span className="font-display text-2xl">{f.recommendedUnits.toLocaleString()}</span></div>
                <div><p className="eyebrow mb-1">Launch window</p>{f.launchWindow}</div>
                <div><RiskBadge risk={f.stockRisk} /><p className="mt-2 text-muted-foreground">{f.riskReason}</p></div>
              </>
            )}
          </div>
          {(brief.isMultiway || brief.isSustainable) && (
            <Link to="/multiway" className="card-edit block p-6 text-sm">
              {brief.isMultiway && <p>Multiway · {brief.conversions?.length} ways to wear</p>}
              {brief.isSustainable && <p className="text-success">Sustainable piece</p>}
              <p className="eyebrow mt-2">See details →</p>
            </Link>
          )}
        </aside>
      </div>
    </article>
  );
}
