import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { briefsQuery } from "@/services/api";
import { BriefCard, Chip, PageHeader } from "@/components/ui-bits";

export const Route = createFileRoute("/briefs/")({
  head: () => ({
    meta: [
      { title: "Design Briefs — H&M Design & Demand Intelligence" },
      { name: "description", content: "Data-backed design briefs: a sleek base, one signature detail, and the reasons why now." },
      { property: "og:title", content: "Design Briefs — H&M Design & Demand Intelligence" },
      { property: "og:description", content: "Data-backed design briefs: a sleek base, one signature detail, and the reasons why now." },
    ],
  }),
  loader: ({ context: { queryClient } }) => queryClient.ensureQueryData(briefsQuery),
  component: Briefs,
});

const types = ["all", "dress", "top", "jeans", "skirt"] as const;
const styles = ["all", "casual", "classy", "creative"] as const;

function Briefs() {
  const { data: briefs } = useSuspenseQuery(briefsQuery);
  const [type, setType] = useState<(typeof types)[number]>("all");
  const [style, setStyle] = useState<(typeof styles)[number]>("all");
  const [multi, setMulti] = useState(false);
  const [sust, setSust] = useState(false);
  const [minConf, setMinConf] = useState(0);

  const list = briefs.filter(
    (b) =>
      (type === "all" || b.garmentType === type) &&
      (style === "all" || b.style === style) &&
      (!multi || b.isMultiway) &&
      (!sust || b.isSustainable) &&
      b.confidence >= minConf,
  );

  return (
    <>
      <PageHeader eyebrow="Design briefs" title="Sleek bases. One detail that matters." />
      <div className="mb-10 space-y-4 border-b pb-8">
        <div className="flex flex-wrap gap-2">{types.map((t) => <Chip key={t} active={type === t} onClick={() => setType(t)}>{t}</Chip>)}</div>
        <div className="flex flex-wrap gap-2">{styles.map((s) => <Chip key={s} active={style === s} onClick={() => setStyle(s)}>{s}</Chip>)}</div>
        <div className="flex flex-wrap items-center gap-2">
          <Chip active={multi} onClick={() => setMulti(!multi)}>Multiway</Chip>
          <Chip active={sust} onClick={() => setSust(!sust)}>Sustainable</Chip>
          <label className="ml-4 flex items-center gap-3 text-xs">
            <span className="eyebrow">Min. confidence {minConf}</span>
            <input type="range" min={0} max={90} step={5} value={minConf} onChange={(e) => setMinConf(+e.target.value)} className="accent-accent" />
          </label>
        </div>
      </div>
      <p className="eyebrow mb-4">{list.length} briefs</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">{list.map((b) => <BriefCard key={b.id} brief={b} />)}</div>
    </>
  );
}
