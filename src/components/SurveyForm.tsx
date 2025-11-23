"use client";

import { IndicatorConfig, Level } from "@/types";
import { shortScoreLegend } from "@/lib/recommendations";

type Props = {
  level: Level;
  onLevelChange: (level: Level) => void;
  schoolName: string;
  onSchoolNameChange: (value: string) => void;
  scores: Record<string, number>;
  indicators: IndicatorConfig[];
  onScoreChange: (code: string, value: number) => void;
  onSave: () => void;
  saving: boolean;
};

export default function SurveyForm({
  level,
  onLevelChange,
  schoolName,
  onSchoolNameChange,
  scores,
  indicators,
  onScoreChange,
  onSave,
  saving,
}: Props) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="pill">Алхам 1 — Түвшин сонго</div>
          <h3 style={{ marginTop: 10 }}>Өөрийн үнэлгээ (0-4)</h3>
          <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
            Түвшин сонгосноор асуулт автоматаар солигдоно. Оноог хадгалснаар
            дүн, график, зөвлөмжүүд шинэчлэгдэнэ.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button
            className={`button ${level === "initial" ? "" : "ghost"}`}
            onClick={() => onLevelChange("initial")}
          >
            Initial (1–3 жил)
          </button>
          <button
            className={`button ${level === "development" ? "" : "ghost"}`}
            onClick={() => onLevelChange("development")}
          >
            Development (4+ жил)
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 16 }}>
        <div>
          <label className="label">Сургуулийн нэр</label>
          <input
            className="input"
            placeholder="МУИС / MNU, ... "
            value={schoolName}
            onChange={(e) => onSchoolNameChange(e.target.value)}
          />
        </div>
        <div className="stack">
          <label className="label">Онооны тайлбар</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {shortScoreLegend.map((item) => (
              <span key={item.value} className="tag">
                <strong style={{ color: "var(--text)" }}>{item.value}</strong>
                {item.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div style={{ margin: "18px 0" }} className="separator" />

      <div className="grid-2">
        {indicators.map((indicator) => (
          <div
            key={indicator.code}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(255,255,255,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <div>
                <div className="pill">
                  {indicator.code} · {indicator.category}
                </div>
                <h4 style={{ marginTop: 8 }}>{indicator.label}</h4>
                <p style={{ color: "var(--muted)", fontSize: 14 }}>
                  {level === "initial"
                    ? indicator.initialQuestion
                    : indicator.developmentQuestion}
                </p>
              </div>
              <div
                style={{
                  minWidth: 52,
                  height: 52,
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  display: "grid",
                  placeItems: "center",
                  background: "rgba(255,255,255,0.04)",
                  fontWeight: 700,
                  fontSize: 18,
                }}
              >
                {scores[indicator.code] ?? 0}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={4}
              step={1}
              value={scores[indicator.code] ?? 0}
              onChange={(e) => onScoreChange(indicator.code, Number(e.target.value))}
              style={{ width: "100%", marginTop: 12 }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: "var(--muted)" }}>0</span>
              <span style={{ color: "var(--muted)" }}>1</span>
              <span style={{ color: "var(--muted)" }}>2</span>
              <span style={{ color: "var(--muted)" }}>3</span>
              <span style={{ color: "var(--muted)" }}>4</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 20, display: "flex", gap: 10 }}>
        <button className="button" onClick={onSave} disabled={saving}>
          {saving ? "Хадгалж байна..." : "Оноо хадгалах"}
        </button>
        <span style={{ color: "var(--muted)", fontSize: 13 }}>
          Нэг товчоор scatter plot, heatmap, зөвлөмж шинэчлэгдэнэ.
        </span>
      </div>
    </div>
  );
}
