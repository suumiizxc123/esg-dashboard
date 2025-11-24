import { indicators } from "@/data/indicators";
import { Domain, IndicatorConfig, IndicatorOverride, Level } from "@/types";

export interface MaterialityPoint {
  code: string;
  label: string;
  category: Domain;
  x: number;
  y: number;
  impact: number;
  weight: number;
  score: number;
  isHigh: boolean;
}

export interface HeatmapCell {
  category: Domain;
  average: number;
  band: "high" | "medium" | "low";
}

export const scoreBand = (score: number): HeatmapCell["band"] => {
  if (score < 1.8) return "high";
  if (score < 2.8) return "medium";
  return "low";
};

export function mergeIndicatorConfig(
  overrides: Record<string, IndicatorOverride>,
): IndicatorConfig[] {
  return indicators.map((indicator) => {
    const override = overrides[indicator.code];
    return {
      ...indicator,
      weight: override?.weight ?? indicator.weight,
      impact: override?.impact ?? indicator.impact,
    };
  });
}

export function emptyScores(): Record<string, number> {
  return indicators.reduce<Record<string, number>>((acc, indicator) => {
    acc[indicator.code] = 0;
    return acc;
  }, {});
}

function clampScore(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.min(4, Math.max(0, value));
}

export function materialityPoints(
  scores: Record<string, number>,
  config: IndicatorConfig[],
): MaterialityPoint[] {
  return config.map((indicator) => {
    const score = clampScore(scores[indicator.code] ?? 0);
    const x = Number((5 - score * indicator.weight).toFixed(2));
    const impact = Math.max(0, Math.min(1, indicator.impact ?? 0));
    const y = Number((impact * 5).toFixed(2));
    const isHigh = x >= 3.5 && y >= 3.5;

    return {
      code: indicator.code,
      label: indicator.label,
      category: indicator.category,
      x,
      y,
      impact: indicator.impact,
      weight: indicator.weight,
      score,
      isHigh,
    };
  });
}

export function heatmap(scores: Record<string, number>, config: IndicatorConfig[]) {
  const categoryScores: Record<Domain, number[]> = {
    Environment: [],
    Social: [],
    Governance: [],
    Education: [],
  };

  config.forEach((indicator) => {
    const score = clampScore(scores[indicator.code] ?? 0);
    categoryScores[indicator.category].push(score);
  });

  return (Object.keys(categoryScores) as Domain[]).map((category) => {
    const values = categoryScores[category];
    const average =
      values.length === 0
        ? 0
        : Number(
            (values.reduce((sum, current) => sum + current, 0) / values.length).toFixed(2),
          );
    return {
      category,
      average,
      band: scoreBand(average),
    } as HeatmapCell;
  });
}

export function overallScore(scores: Record<string, number>) {
  const values = Object.values(scores);
  if (!values.length) return 0;
  return Number(
    (values.reduce((sum, current) => sum + clampScore(current), 0) / values.length).toFixed(2),
  );
}

export function weakestIndicators(
  scores: Record<string, number>,
  config: IndicatorConfig[],
  limit = 3,
) {
  const ranked = config
    .map((indicator) => ({
      indicator,
      score: clampScore(scores[indicator.code] ?? 0),
    }))
    .sort((a, b) => {
      if (a.score === b.score) {
        return b.indicator.impact - a.indicator.impact;
      }
      return a.score - b.score;
    });

  return ranked.slice(0, limit);
}

export function summaryCopy(level: Level) {
  return level === "initial"
    ? "Initial (1-3 жил) — мэдээлэл цуглуулах, суурь тогтолцоо бүрдүүлэхэд төвлөрнө."
    : "Development (4+ жил) — тогтолцоогоо бататгаж, баталгаажуулалт, нарийвчилсан KPI-д төвлөрнө.";
}
