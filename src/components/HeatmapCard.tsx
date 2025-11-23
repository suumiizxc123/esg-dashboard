"use client";

import { HeatmapCell } from "@/lib/materiality";

const bandColors: Record<HeatmapCell["band"], string> = {
  high: "#f07171",
  medium: "#f4c361",
  low: "#58c4a7",
};

type Props = {
  cells: HeatmapCell[];
};

export default function HeatmapCard({ cells }: Props) {
  return (
    <div className="card viz-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="pill">Risk heatmap (4×5)</div>
          <h3 style={{ marginTop: 10 }}>Дундаж оноогоор эрсдэлийн түвшин</h3>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            0.0–1.7 → Улаан, 1.8–2.7 → Шар, 2.8–4.0 → Ногоон
          </p>
        </div>
      </div>
      <div className="grid-4" style={{ marginTop: 16, minWidth: 0 }}>
        {cells.map((cell) => (
          <div
            key={cell.category}
            style={{
              border: `1px solid ${bandColors[cell.band]}`,
              borderRadius: 12,
              padding: 14,
              background: "rgba(255,255,255,0.03)",
              minHeight: 110,
            }}
          >
            <div className="pill" style={{ borderColor: bandColors[cell.band], color: bandColors[cell.band] }}>
              {cell.category}
            </div>
            <h2 style={{ marginTop: 12, color: "#fff" }}>{cell.average.toFixed(2)}</h2>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              {cell.band === "high"
                ? "Эрсдэл өндөр — яаралтай сайжруул"
                : cell.band === "medium"
                  ? "Дунд эрсдэл — тасралтгүй сайжруул"
                  : "Эрсдэл бага — баталгаажуул"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
