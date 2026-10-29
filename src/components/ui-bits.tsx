import { Link } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer } from "recharts";
import type { DesignBrief, StockRisk, TrendStatus } from "@/types/models";
import { cn } from "@/lib/utils";

export function PageHeader({ eyebrow, title, intro }: { eyebrow: string; title: string; intro?: string }) {
  return (
    <header className="mb-10 border-b pb-8">
      <p className="eyebrow mb-3">{eyebrow}</p>
      <h1 className="text-4xl md:text-5xl">{title}</h1>
      {intro && <p className="mt-4 max-w-2xl text-muted-foreground">{intro}</p>}
    </header>
  );
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1.5 flex justify-between text-xs">
        <span className="eyebrow">{label}</span>
        <span className="font-medium tabular-nums">{value}</span>
      </div>
      <div className="h-1 w-full bg-muted">
        <div className="h-1 bg-accent" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function Sparkline({ data }: { data: number[] }) {
  const d = data.map((v, i) => ({ i, v }));
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer>
        <LineChart data={d}>
          <Line type="monotone" dataKey="v" stroke="var(--accent)" strokeWidth={1.5} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

const statusCls: Record<TrendStatus, string> = {
  rising: "bg-accent-soft text-accent",
  peaking: "bg-muted text-foreground",
  fading: "bg-muted text-muted-foreground line-through decoration-1",
};
export function StatusTag({ status }: { status: TrendStatus }) {
  return <span className={cn("rounded-sm px-2 py-0.5 text-[0.68rem] uppercase tracking-wider", statusCls[status])}>{status}</span>;
}

const riskCls: Record<StockRisk, string> = {
  low: "border-success text-success",
  medium: "border-warning text-warning",
  high: "border-destructive text-destructive",
};
export function RiskBadge({ risk }: { risk: StockRisk }) {
  return <span className={cn("rounded-sm border px-2 py-0.5 text-[0.68rem] uppercase tracking-wider", riskCls[risk])}>{risk} risk</span>;
}

export function Chip({ children, active, onClick }: { children: React.ReactNode; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full border px-3 py-1 text-xs capitalize transition-colors",
        active ? "border-foreground bg-foreground text-background" : "hover:border-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function BriefCard({ brief }: { brief: DesignBrief }) {
  return (
    <Link to="/briefs/$id" params={{ id: brief.id }} className="card-edit group flex flex-col p-6">
      <div className="mb-4 flex items-center gap-2">
        <span className="eyebrow">{brief.garmentType} · {brief.style}</span>
        {brief.isMultiway && <span className="eyebrow text-accent">· Multiway</span>}
        {brief.isSustainable && <span className="eyebrow text-success">· Sustainable</span>}
      </div>
      <h3 className="text-xl leading-snug group-hover:text-accent">{brief.title}</h3>
      <p className="mt-3 text-sm text-muted-foreground">{brief.signatureDetail}</p>
      <div className="mt-auto grid grid-cols-2 gap-4 pt-6">
        <ScoreBar label="Confidence" value={brief.confidence} />
        <ScoreBar label="Brand DNA" value={brief.brandDnaFit} />
      </div>
    </Link>
  );
}
