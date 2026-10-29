// Service layer: the ONLY place that touches mock data.
// Swap these implementations for fetch() calls to the Python backend later.
import { queryOptions } from "@tanstack/react-query";
import { trends } from "@/data/trends";
import { briefs } from "@/data/briefs";
import { forecasts } from "@/data/forecasts";
import type { DesignBrief, Forecast, Trend } from "@/types/models";

const delay = <T,>(v: T) => new Promise<T>((r) => setTimeout(() => r(v), 50));

export const getTrends = (): Promise<Trend[]> => delay(trends);
export const getBriefs = (): Promise<DesignBrief[]> => delay(briefs);
export const getBriefById = (id: string): Promise<DesignBrief | null> =>
  delay(briefs.find((b) => b.id === id) ?? null);
export const getForecasts = (): Promise<Forecast[]> => delay(forecasts);

export const trendsQuery = queryOptions({ queryKey: ["trends"], queryFn: getTrends });
export const briefsQuery = queryOptions({ queryKey: ["briefs"], queryFn: getBriefs });
export const forecastsQuery = queryOptions({ queryKey: ["forecasts"], queryFn: getForecasts });
export const briefQuery = (id: string) =>
  queryOptions({ queryKey: ["brief", id], queryFn: () => getBriefById(id) });
