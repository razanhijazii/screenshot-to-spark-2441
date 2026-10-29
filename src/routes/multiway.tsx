import { createFileRoute, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, Leaf, Shirt } from "lucide-react";
import { briefsQuery } from "@/services/api";
import { Chip, PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/multiway")({
  head: () => ({
    meta: [
      { title: "Multiway & Sustainable — H&M Design & Demand Intelligence" },
      { name: "description", content: "Convertible pieces with step-by-step transformations, and sustainable design notes." },
      { property: "og:title", content: "Multiway & Sustainable — H&M Design & Demand Intelligence" },
      { property: "og:description", content: "Convertible pieces with step-by-step transformations, and sustainable design notes." },
    ],
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(briefsQuery),
  component: Multiway,
});

function Multiway() {
  const { data: briefs } = useSuspenseQuery(briefsQuery);
  const [tab, setTab] = useState<"multiway" | "sustainable">("multiway");
  const list = briefs.filter((b) => (tab === "multiway" ? b.isMultiway : b.isSustainable));

  return (
    <>
      <PageHeader eyebrow="Multiway & sustainable" title="One piece, many lives." />
      <div className="mb-10 flex gap-2">
        <Chip active={tab === "multiway"} onClick={() => setTab("multiway")}>Multiway ({briefs.filter((b) => b.isMultiway).length})</Chip>
        <Chip active={tab === "sustainable"} onClick={() => setTab("sustainable")}>Sustainable ({briefs.filter((b) => b.isSustainable).length})</Chip>
      </div>
      <div className="space-y-8">
        {list.map((b) => (
          <article key={b.id} className="card-edit p-6 md:p-8">
            <Link to="/briefs/$id" params={{ id: b.id }} className="hover:text-accent">
              <p className="eyebrow">{b.garmentType} · {b.priceRange}</p>
              <h2 className="mt-2 text-2xl">{b.title}</h2>
            </Link>
            {tab === "multiway" ? (
              <div className="mt-6 space-y-6">
                {b.conversions?.map((c) => (
                  <div key={c.to} className="border-t pt-5">
                    <div className="mb-4 flex items-center gap-3 text-sm font-medium">
                      <Shirt size={16} strokeWidth={1.25} /> {c.from}
                      <ArrowRight size={14} className="text-accent" />
                      <span className="text-accent">{c.to}</span>
                    </div>
                    <ol className="flex flex-col gap-3 md:flex-row md:items-stretch">
                      {c.steps.map((s, i) => (
                        <li key={s} className="flex flex-1 items-start gap-3 md:items-center">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-accent text-xs text-accent">{i + 1}</span>
                          <span className="text-sm">{s}</span>
                          {i < c.steps.length - 1 && <ArrowRight size={14} className="ml-auto hidden shrink-0 text-muted-foreground md:block" />}
                        </li>
                      ))}
                    </ol>
                  </div>
                ))}
              </div>
            ) : (
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {b.sustainabilityNotes?.map((n) => (
                  <li key={n} className="flex gap-3 text-sm"><Leaf size={16} strokeWidth={1.25} className="mt-0.5 shrink-0 text-success" />{n}</li>
                ))}
              </ul>
            )}
          </article>
        ))}
      </div>
    </>
  );
}
