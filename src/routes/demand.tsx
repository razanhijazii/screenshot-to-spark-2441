import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { briefsQuery, forecastsQuery } from "@/services/api";
import { fmtWeek, PageHeader, RiskBadge } from "@/components/ui-bits";
import { cn } from "@/lib/utils";
import type { Forecast } from "@/types/models";

export const Route = createFileRoute("/demand")({
  head: () => ({
    meta: [
      { title: "Demand & Stock — H&M Design & Demand Intelligence" },
      { name: "description", content: "How many to make: a newsvendor model on simulated demand, with launch windows, size splits and stock risk per brief." },
      { property: "og:title", content: "Demand & Stock — H&M Design & Demand Intelligence" },
      { property: "og:description", content: "How many to make: a newsvendor model on simulated demand, with launch windows, size splits and stock risk per brief." },
    ],
  }),
  loader: ({ context: { queryClient } }) =>
    Promise.all([queryClient.ensureQueryData(briefsQuery), queryClient.ensureQueryData(forecastsQuery)]),
  component: Demand,
});

const pct = (x: number) => `${Math.round(x * 100)}%`;
const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"], v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};
const launchDate = (f: Forecast) => (f.weeklyDemand[0] ? `w/c ${fmtWeek(f.weeklyDemand[0].week)}` : f.launchWindow);

function Demand() {
  const { data: briefs } = useSuspenseQuery(briefsQuery);
  const { data: forecasts } = useSuspenseQuery(forecastsQuery);
  const [sel, setSel] = useState(forecasts[0]?.briefId);
  const f = forecasts.find((x) => x.briefId === sel);
  const title = (id: string) => briefs.find((b) => b.id === id)?.title ?? id;

  return (
    <>
      <PageHeader
        eyebrow="Demand & stock"
        title="How much to make."
        intro="Each quantity comes from a newsvendor model: thousands of simulated selling seasons, and an order that balances the margin lost on a missed sale against the loss on an unsold unit after markdown."
      />
      <div className="grid gap-8 xl:grid-cols-[1.2fr_1fr]">
        <div className="card-edit self-start overflow-x-auto">
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
                  <td className="whitespace-nowrap p-4 text-muted-foreground">{launchDate(r)}</td>
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
              <p className="mt-2 text-sm text-muted-foreground">{f.launchWindow}</p>
            </div>

            {f.demandRange && f.newsvendor && <OrderPanel f={f} />}

            <div className="card-edit p-5 text-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="eyebrow">Stock risk</p>
                <RiskBadge risk={f.stockRisk} />
              </div>
              <p className="leading-relaxed text-muted-foreground">{f.riskReason}</p>
            </div>

            <div className="card-edit h-64 p-4">
              <p className="eyebrow mb-2">16-week demand forecast (units per week)</p>
              <ResponsiveContainer height="88%">
                <LineChart data={f.weeklyDemand}>
                  <CartesianGrid stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="week" tickFormatter={fmtWeek} tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" minTickGap={16} />
                  <YAxis tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" width={40} />
                  <Tooltip labelFormatter={(w) => `Week of ${fmtWeek(String(w))}`} />
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

function OrderPanel({ f }: { f: Forecast }) {
  const r = f.demandRange!;
  const n = f.newsvendor!;
  // Scale the bar a little wider than the 80% range so the markers breathe.
  const lo = Math.min(r.p10, f.recommendedUnits) * 0.9;
  const hi = Math.max(r.p90, f.recommendedUnits) * 1.05;
  const at = (v: number) => `${((v - lo) / (hi - lo)) * 100}%`;

  const stats: [string, string][] = [
    ["Orders to", `${ordinal(Math.round(n.criticalRatio * 100))} percentile`],
    ["Chance of selling out", pct(n.stockoutProbability)],
    ["Expected sell-through", pct(n.expectedSellThrough)],
    ["Expected leftover", `${n.expectedLeftoverUnits.toLocaleString()} units`],
  ];

  return (
    <div className="card-edit space-y-6 p-5">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Recommended order</p>
          <p className="mt-1 font-display text-4xl tabular-nums">{f.recommendedUnits.toLocaleString()}</p>
        </div>
        <p className="max-w-[12rem] text-right text-xs text-muted-foreground">
          from {n.simulations.toLocaleString()} simulated selling seasons
        </p>
      </div>

      <div>
        <p className="eyebrow mb-8">Simulated season demand</p>
        <div className="relative h-2 rounded-full bg-muted">
          <div className="absolute inset-y-0 rounded-full bg-accent-soft" style={{ left: at(r.p10), right: `calc(100% - ${at(r.p90)})` }} />
          <div className="absolute -top-1 h-4 w-px bg-muted-foreground" style={{ left: at(r.p50) }} />
          <div className="absolute -top-2 h-6 w-0.5 bg-accent" style={{ left: at(f.recommendedUnits) }} />
          <span className="absolute -top-7 -translate-x-1/2 whitespace-nowrap text-[0.68rem] font-medium uppercase tracking-wider text-accent" style={{ left: at(f.recommendedUnits) }}>
            Order
          </span>
        </div>
        <div className="relative mt-3 h-8 text-[0.68rem] tabular-nums text-muted-foreground">
          {(
            [
              ["Low (p10)", r.p10],
              ["Median", r.p50],
              ["High (p90)", r.p90],
            ] as const
          ).map(([l, v]) => (
            <span key={l} className="absolute -translate-x-1/2 text-center leading-tight" style={{ left: at(v) }}>
              {v.toLocaleString()}
              <br />
              {l}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-sm border bg-border">
        {stats.map(([l, v]) => (
          <div key={l} className="bg-card p-3">
            <p className="eyebrow">{l}</p>
            <p className="mt-1 text-sm font-medium tabular-nums">{v}</p>
          </div>
        ))}
      </div>

      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Margin lost per missed sale</span>
          <span className="tabular-nums text-foreground">${n.underageCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Loss per unsold unit after markdown ({n.markdownBasis} piece)</span>
          <span className="tabular-nums text-foreground">${n.overageCost.toFixed(2)}</span>
        </div>
        <p className="pt-2 leading-relaxed">
          The order balances these two costs across all simulated seasons. Evergreen pieces can carry over to the next
          season, so they are ordered higher in their range; pieces riding a trend that may fade are ordered more cautiously.
        </p>
      </div>
    </div>
  );
}
