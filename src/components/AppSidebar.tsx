import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutGrid, TrendingUp, PenTool, Recycle, BarChart3, Menu, X } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { LiveDataStatus } from "@/components/LiveDataStatus";

const items = [
  { to: "/", label: "Overview", icon: LayoutGrid },
  { to: "/trends", label: "Trend Signals", icon: TrendingUp },
  { to: "/briefs", label: "Design Briefs", icon: PenTool },
  { to: "/multiway", label: "Multiway & Sustainable", icon: Recycle },
  { to: "/demand", label: "Demand & Stock", icon: BarChart3 },
] as const;

export function AppSidebar() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const active = (to: string) => (to === "/" ? path === "/" : path.startsWith(to));

  return (
    <>
      <div className="sticky top-0 z-30 flex items-center justify-between border-b bg-background px-5 py-4 md:hidden">
        <Wordmark />
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? <X size={20} /> : <Menu size={20} />}</button>
      </div>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 flex-col border-r bg-sidebar p-6 md:sticky md:top-0 md:flex md:h-screen",
          open ? "flex" : "hidden",
        )}
      >
        <Wordmark />
        <nav className="mt-12 flex flex-col gap-1">
          {items.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-sm px-3 py-2.5 text-sm transition-colors",
                active(to) ? "bg-sidebar-accent font-medium" : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto space-y-3 pt-10">
          <LiveDataStatus />
          <p className="text-[0.7rem] leading-snug text-muted-foreground">
            Independent concept project, not affiliated with H&amp;M. Synthetic demo data.
          </p>
          <a
            href="https://github.com/razanhijazii/hm-design-intelligence"
            target="_blank"
            rel="noreferrer"
            className="eyebrow block hover:text-foreground"
          >
            How it works · GitHub →
          </a>
        </div>
      </aside>
    </>
  );
}

function Wordmark() {
  return (
    <Link to="/" className="block">
      <span className="font-display text-2xl tracking-tight">H&amp;M</span>
      <span className="eyebrow block mt-1">Design &amp; Demand Intelligence</span>
    </Link>
  );
}
