// Service layer: the ONLY place components get data from.
//
// Every query resolves instantly from the bundled snapshot of the engine's
// output (src/data), so pages render immediately, including on the server.
// In the browser, syncFromLiveApi() then fetches the same data from the live
// Python backend and swaps it into the cache. The free server can take up to a
// minute to wake up, so that call has a long timeout and falls back quietly.
import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { trends } from "@/data/trends";
import { briefs } from "@/data/briefs";
import { forecasts } from "@/data/forecasts";
import type { DesignBrief, Forecast, Trend } from "@/types/models";

export const API_URL = (
  (import.meta.env.VITE_API_URL as string | undefined) ?? "https://hm-design-intelligence.onrender.com"
).replace(/\/$/, "");

const LIVE_TIMEOUT_MS = 60_000;

export const getTrends = async (): Promise<Trend[]> => trends;
export const getBriefs = async (): Promise<DesignBrief[]> => briefs;
export const getBriefById = async (id: string): Promise<DesignBrief | null> =>
  briefs.find((b) => b.id === id) ?? null;
export const getForecasts = async (): Promise<Forecast[]> => forecasts;

// Data never goes stale on its own: it is only replaced by syncFromLiveApi().
const forever = { staleTime: Infinity } as const;
export const trendsQuery = queryOptions({ queryKey: ["trends"], queryFn: getTrends, ...forever });
export const briefsQuery = queryOptions({ queryKey: ["briefs"], queryFn: getBriefs, ...forever });
export const forecastsQuery = queryOptions({ queryKey: ["forecasts"], queryFn: getForecasts, ...forever });
export const briefQuery = (id: string) =>
  queryOptions({ queryKey: ["brief", id], queryFn: () => getBriefById(id), ...forever });

async function getLive<T>(path: string, signal: AbortSignal): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { signal, headers: { Accept: "application/json" } });
  if (!res.ok) throw new Error(`${path}: HTTP ${res.status}`);
  return (await res.json()) as T;
}

export type LiveStatus = "connecting" | "live" | "snapshot";

/** Fetch trends, briefs and forecasts from the live API and put them in the cache.
 *  Resolves "live" on success, "snapshot" if the API could not be reached. */
export async function syncFromLiveApi(queryClient: QueryClient): Promise<LiveStatus> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LIVE_TIMEOUT_MS);
  try {
    const [t, b, f] = await Promise.all([
      getLive<Trend[]>("/trends", controller.signal),
      getLive<DesignBrief[]>("/briefs", controller.signal),
      getLive<Forecast[]>("/forecasts", controller.signal),
    ]);
    if (!Array.isArray(t) || !Array.isArray(b) || !Array.isArray(f) || !b.length) {
      throw new Error("Unexpected API response");
    }
    queryClient.setQueryData(trendsQuery.queryKey, t);
    queryClient.setQueryData(briefsQuery.queryKey, b);
    queryClient.setQueryData(forecastsQuery.queryKey, f);
    for (const brief of b) queryClient.setQueryData(briefQuery(brief.id).queryKey, brief);
    return "live";
  } catch {
    return "snapshot";
  } finally {
    clearTimeout(timer);
  }
}
