"use client";

import { useEffect, useState } from "react";
import { IndicatorConfig, Level } from "@/types";

type AssessmentRow = {
  id: string;
  schoolName: string;
  level: Level;
  overall: number;
  createdAt: string;
};

type Props = {
  indicators: IndicatorConfig[];
  onUpdate: (updates: Array<{ code: string; weight: number; impact: number }>) => Promise<void>;
  saving: boolean;
  assessments: AssessmentRow[];
  onRefreshAssessments?: () => void;
};

export default function AdminPanel({
  indicators,
  onUpdate,
  saving,
  assessments,
  onRefreshAssessments,
}: Props) {
  const [draft, setDraft] = useState<Record<string, { weight: number; impact: number }>>({});
  const [status, setStatus] = useState("");

  useEffect(() => {
    const initial = indicators.reduce<Record<string, { weight: number; impact: number }>>(
      (acc, indicator) => {
        acc[indicator.code] = { weight: indicator.weight, impact: indicator.impact };
        return acc;
      },
      {},
    );
    // Reset editor values whenever admin config changes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDraft(initial);
  }, [indicators]);

  const handleChange = (code: string, key: "weight" | "impact", value: number) => {
    setDraft((prev) => ({
      ...prev,
      [code]: {
        ...prev[code],
        [key]: value,
      },
    }));
  };

  const handleSave = async () => {
    setStatus("");
    const updates = Object.entries(draft).map(([code, values]) => ({
      code,
      weight: Number(values.weight),
      impact: Number(values.impact),
    }));
    await onUpdate(updates);
    setStatus("Шинэ жин/коэффициент хадгалагдлаа.");
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div className="pill">Admin panel</div>
          <h3 style={{ marginTop: 10 }}>Материаллаг байдлын жин, нөлөөлөл</h3>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            X = 5 – (өөрийн оноо) × жин, Y = нөлөөллийн коэффициент. Эндээс жин, коэффициентоо шинэчилнэ.
          </p>
        </div>
        {onRefreshAssessments && (
          <button className="button ghost" onClick={onRefreshAssessments}>
            Түүх шинэчлэх
          </button>
        )}
      </div>

      <div className="grid-2" style={{ marginTop: 12 }}>
        {indicators.map((indicator) => (
          <div
            key={indicator.code}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 12,
              padding: 12,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
              <div>
                <div className="pill">
                  {indicator.code} · {indicator.label}
                </div>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>{indicator.category}</p>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <div>
                  <label className="label">Жин (X)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.05"
                    value={draft[indicator.code]?.weight ?? indicator.weight}
                    onChange={(e) => handleChange(indicator.code, "weight", Number(e.target.value))}
                    style={{ width: 90 }}
                  />
                </div>
                <div>
                  <label className="label">Нөлөөлөл (Y)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={draft[indicator.code]?.impact ?? indicator.impact}
                    onChange={(e) => handleChange(indicator.code, "impact", Number(e.target.value))}
                    style={{ width: 90 }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
        <button className="button" onClick={handleSave} disabled={saving}>
          {saving ? "Хадгалж байна..." : "Шинэчлэл хадгалах"}
        </button>
        {status && <span style={{ color: "var(--muted)", fontSize: 13 }}>{status}</span>}
      </div>

      <div className="separator" />

      <h4>Сүүлд хадгалсан үнэлгээнүүд</h4>
      <div style={{ marginTop: 10, overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 600 }}>
          <thead>
            <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13 }}>
              <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Сургууль</th>
              <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Түвшин</th>
              <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Нийт оноо</th>
              <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Огноо</th>
            </tr>
          </thead>
          <tbody>
            {assessments.map((row) => (
              <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                <td style={{ padding: "10px 6px" }}>{row.schoolName}</td>
                <td style={{ padding: "10px 6px", color: "var(--muted)" }}>{row.level}</td>
                <td style={{ padding: "10px 6px" }}>{row.overall.toFixed(2)}</td>
                <td style={{ padding: "10px 6px", color: "var(--muted)" }}>
                  {new Date(row.createdAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {assessments.length === 0 && (
              <tr>
                <td style={{ padding: "10px 6px", color: "var(--muted)" }} colSpan={4}>
                  Одоогоор хадгалсан үнэлгээ алга.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
