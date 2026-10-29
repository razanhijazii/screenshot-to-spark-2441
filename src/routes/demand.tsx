import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { briefsQuery, forecastsQuery } from "@/services/api";
import { PageHeader, RiskBadge } from "@/components/ui-bits";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/demand")({
  head: () => ({
    meta: [
      { title: "Demand & Stock — H&M Design & Demand Intelligence" },
      { name: "description", content: "Recommended production units, launch windows, size splits and stock risk per brief." },
      { property: "og:title", content: "Demand & Stock — H&M Design & Demand Intelligence" },
      { property: "og:description", content: "Recommended production units, launch windows, size splits and stock risk per brief." },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(briefsQuery), queryClient.ensureQueryData(forecastsQuery)]),
  component: Demand,
});

function Demand() {
  const { data: briefs } = useSuspenseQuery(briefsQuery);
  const { data: forecasts } = useSuspenseQuery(forecastsQuery);
  const [sel, setSel] = useState(forecasts[0]?.briefId);
  const f = forecasts.find((x) => x.briefId === sel);
  const title = (id: string) => briefs.find((b) => b.id === id)?.title ?? id;

  return (
    <>
      <PageHeader eyebrow="Demand & stock" title="How much to make." />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <div className="card-edit overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="eyebrow p-4 font-normal">Brief</th>
                <th className="eyebrow p-4 text-right font-normal">Units</th>
                <th className="eyebrow p-4 font-normal">Launch</th>
                <th className="eyebrow p-4 font-normal">Risk</th>
              </tr>
            </thead>
            <tbody>
              {forecasts.map((r) => (
                <tr
                  key={r.briefId}
                  onClick={() => setSel(r.briefId)}
                  className={cn("cursor-pointer border-b last:border-0 hover:bg-muted", sel === r.briefId && "bg-accent-soft")}
                >
                  <td className="p-4">{title(r.briefId)}</td>
                  <td className="p-4 text-right tabular-nums">{r.recommendedUnits.toLocaleString()}</td>
                  <td className="whitespace-nowrap p-4 text-muted-foreground">{r.launchWindow}</td>
                  <td className="p-4"><RiskBadge risk={r.stockRisk} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {f && (
          <div className="space-y-6">
            <div>
              <p className="eyebrow">Selected</p>
              <h2 className="mt-1 text-2xl">{title(f.briefId)}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{f.riskReason}</p>
            </div>
            <div className="card-edit h-64 p-4">
              <p className="eyebrow mb-2">16-week demand</p>
              <ResponsiveContainer height="88%">
                <LineChart data={f.weeklyDemand}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="units" stroke="var(--accent)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="card-edit h-56 p-4">
              <p className="eyebrow mb-2">Size split (%)</p>
              <ResponsiveContainer height="85%">
                <BarChart data={f.sizeSplit}>
                  <XAxis dataKey="size" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={30} />
                  <Tooltip cursor={{ fill: "var(--muted)" }} />
                  <Bar dataKey="percent" fill="var(--foreground)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
