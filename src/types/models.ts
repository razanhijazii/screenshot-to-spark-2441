export type TrendCategory = "colour" | "silhouette" | "detail" | "fabric";
export type TrendStatus = "rising" | "peaking" | "fading";

export type Trend = {
  id: string;
  name: string;
  category: TrendCategory;
  momentum: number;
  status: TrendStatus;
  evidence: string[];
  weeklyScores: number[];
};

export type GarmentType = "dress" | "top" | "jeans" | "skirt";
export type BriefStyle = "casual" | "classy" | "creative";

export type Conversion = { from: string; to: string; steps: string[] };

export type DesignBrief = {
  id: string;
  title: string;
  garmentType: GarmentType;
  style: BriefStyle;
  baseDescription: string;
  signatureDetail: string;
  whyNow: string[];
  linkedTrendIds: string[];
  brandDnaFit: number;
  targetCustomer: string;
  priceRange: string;
  isMultiway: boolean;
  conversions?: Conversion[];
  isSustainable: boolean;
  sustainabilityNotes?: string[];
  confidence: number;
};

export type StockRisk = "low" | "medium" | "high";

export type Forecast = {
  briefId: string;
  weeklyDemand: { week: string; units: number }[];
  recommendedUnits: number;
  sizeSplit: { size: string; percent: number }[];
  launchWindow: string;
  stockRisk: StockRisk;
  riskReason: string;
};
