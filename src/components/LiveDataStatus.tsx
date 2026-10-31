import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_URL, syncFromLiveApi, type LiveStatus } from "@/services/api";
import { cn } from "@/lib/utils";

const label: Record<LiveStatus, string> = {
  connecting: "Waking up the server, this can take up to a minute on first visit",
  live: "Live data from the engine API",
  snapshot: "Showing the bundled engine snapshot",
};

/** Refreshes the data from the live API once per visit and shows where the
 *  numbers on screen come from. */
export function LiveDataStatus() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LiveStatus>("connecting");

  useEffect(() => {
    let cancelled = false;
    syncFromLiveApi(queryClient).then((s) => {
      if (!cancelled) setStatus(s);
    });
    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  return (
    <a
      href={`${API_URL}/docs`}
      target="_blank"
      rel="noreferrer"
      title="Open the API documentation"
      className="flex items-start gap-2 text-[0.7rem] leading-snug text-muted-foreground hover:text-foreground"
    >
      <span
        className={cn(
          "mt-1 inline-block h-1.5 w-1.5 shrink-0 rounded-full",
          status === "live" && "bg-success",
          status === "snapshot" && "bg-muted-foreground",
          status === "connecting" && "animate-pulse bg-warning",
        )}
      />
      <span>{label[status]}</span>
    </a>
  );
}
