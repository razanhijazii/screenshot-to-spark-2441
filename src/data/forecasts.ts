import type { Forecast, StockRisk } from "@/types/models";

function curve(peak: number, peakWeek: number, spread: number, seed: number) {
  return Array.from({ length: 16 }, (_, i) => {
    const base = peak * Math.exp(-((i - peakWeek) ** 2) / (2 * spread ** 2));
    const noise = ((seed * (i + 3) * 7) % 11) - 5;
    return { week: `W${i + 1}`, units: Math.max(0, Math.round(base + noise * peak * 0.01)) };
  });
}

const split = (xs: number, s: number, m: number, l: number, xl: number) => [
  { size: "XS", percent: xs },
  { size: "S", percent: s },
  { size: "M", percent: m },
  { size: "L", percent: l },
  { size: "XL", percent: xl },
];

const rows: [string, number, number, number, [number, number, number, number, number], string, StockRisk, string][] = [
  ["b-01", 3200, 7, 3, [10, 28, 32, 20, 10], "Mar W2 – Apr W4", "medium", "Peaking lace trend could cool before reorders land."],
  ["b-02", 4100, 8, 4, [8, 24, 34, 22, 12], "Apr W1 – Jun W2", "low", "Two rising signals and strong colour sell-through."],
  ["b-03", 2600, 9, 3, [12, 30, 30, 18, 10], "Apr W3 – Jun W1", "medium", "Zip hardware lead time is 6 weeks; novelty fit."],
  ["b-04", 3800, 6, 4, [9, 26, 33, 21, 11], "Feb W4 – Apr W3", "low", "Proven poplin block, broad audience."],
  ["b-05", 2200, 5, 3, [11, 27, 31, 20, 11], "Feb W2 – Mar W4", "medium", "Neutral trend is peaking; keep reorder flexible."],
  ["b-06", 3500, 9, 3, [13, 31, 30, 17, 9], "May W1 – Jul W2", "low", "One-size wrap reduces size-curve risk."],
  ["b-07", 4800, 7, 5, [7, 22, 34, 24, 13], "Mar W1 – Jun W4", "low", "Core straight fit with unique detail; stable demand."],
  ["b-08", 1900, 6, 3, [12, 29, 31, 18, 10], "Mar W3 – May W1", "medium", "Moderate confidence; knit MOQ is high."],
  ["b-09", 1600, 5, 2, [10, 26, 32, 21, 11], "Nov W2 – Dec W4", "high", "Sheer layering peaking and narrow occasion window."],
  ["b-10", 2100, 8, 3, [12, 30, 31, 18, 9], "Apr W2 – Jun W1", "medium", "Complex construction; higher unit cost."],
  ["b-11", 5600, 6, 5, [14, 32, 29, 16, 9], "Feb W1 – May W4", "low", "High-volume staple with low unit cost."],
  ["b-12", 1800, 9, 3, [11, 29, 31, 19, 10], "May W2 – Jul W1", "high", "Novel mechanism; lowest DNA fit — test with small drop."],
];

export const forecasts: Forecast[] = rows.map(([briefId, peak, pw, sp, ss, launchWindow, stockRisk, riskReason], i) => {
  const weeklyDemand = curve(peak / 6, pw, sp, i + 2);
  return {
    briefId,
    weeklyDemand,
    recommendedUnits: Math.round((weeklyDemand.reduce((a, w) => a + w.units, 0) * 0.92) / 50) * 50,
    sizeSplit: split(...ss),
    launchWindow,
    stockRisk,
    riskReason,
  };
});
