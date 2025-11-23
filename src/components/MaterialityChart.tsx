"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { MaterialityPoint } from "@/lib/materiality";

const colors: Record<string, string> = {
  Environment: "#7ed4b5",
  Social: "#f4c361",
  Governance: "#8bb1ff",
};

const colorForCategory = (category: string) => colors[category] || colors["Social"];

type Props = {
  points: MaterialityPoint[];
};

export default function MaterialityChart({ points }: Props) {
  const data = points.map((point) => ({
    ...point,
    name: `${point.code} · ${point.label}`,
    fill: point.isHigh ? "#f07171" : colorForCategory(point.category),
    size: point.isHigh ? 100 : 70,
  }));

  return (
    <div className="card viz-card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <div className="pill">Double Materiality (X=эрсдэл, Y=нөлөөлөл)</div>
          <h3 style={{ marginTop: 10 }}>Scatter plot</h3>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Баруун дээд буланд (X≥3.5, Y≥0.7) байгаа улаан цэгүүд — хамгийн материаллаг асуудлууд.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {(["Environment", "Social", "Governance"] as const).map((key) => {
            const value = colors[key];
            return (
              <span key={key} className="tag" style={{ borderColor: value, color: value }}>
                <span
                  style={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    background: value,
                    display: "inline-block",
                  }}
                />
                {key}
              </span>
            );
          })}
        </div>
      </div>
      <div style={{ flex: 1, minHeight: 320 }}>
        <ResponsiveContainer width="100%" height="100%" minWidth={320} minHeight={320}>
          <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 46 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.08)" />
            <XAxis
              type="number"
              dataKey="x"
              name="Санхүүгийн эрсдэл"
            domain={[0, 5]}
            tick={{ fill: "var(--muted)" }}
            label={{ value: "Эрсдэл өндөр  →", position: "insideBottomRight", fill: "var(--muted)" }}
          />
          <YAxis
            type="number"
            dataKey="y"
            name="Нөлөөлөл"
            domain={[0, 1]}
            tick={{ fill: "var(--muted)" }}
            label={{ value: "Гадаад орчинд үзүүлэх нөлөө", angle: -90, position: "insideLeft", fill: "var(--muted)" }}
          />
          {/* Removed red highlight area */}
          <Tooltip
            contentStyle={{ background: "#0f2f3c", border: "1px solid var(--border)", borderRadius: 12 }}
            labelStyle={{ color: "#fff" }}
            formatter={(value, key, payload) => {
              const dataPoint = payload?.payload as MaterialityPoint | undefined;
              if (key === "x") return [`${value}`, "Эрсдэл (урвуу)"];
              if (key === "y") return [`${value}`, "Нөлөөлөл"];
              return [value, dataPoint ? dataPoint.label : String(key)];
            }}
            labelFormatter={(_, payload) => {
              const dataPoint = payload?.[0]?.payload as MaterialityPoint | undefined;
              return dataPoint ? `${dataPoint.code} · ${dataPoint.label}` : "";
            }}
            />
            <Scatter data={data} shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
