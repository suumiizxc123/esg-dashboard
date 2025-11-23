"use client";

import { useState } from "react";
import { Level } from "@/types";

type Props = {
  level: Level;
  overall: number;
  weakest: Array<{ code: string; label: string; score: number }>;
  highMaterialCodes: string[];
  recommendations: Array<{ code: string; label: string; actions: string[]; score?: number; impact?: number }>;
};

export default function AIInsights({ level, overall, weakest, highMaterialCodes, recommendations }: Props) {
  const [note, setNote] = useState("");
  const [text, setText] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    setLoading(true);
    setStatus("");
    setText("");
    try {
      const res = await fetch("/api/ai/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level,
          overall,
          weakest,
          highMaterial: highMaterialCodes,
          recommendations: recommendations.slice(0, 5),
          note,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "AI зөвлөмж авахад алдаа гарлаа.");
        return;
      }
      setText(data.text);
    } catch (error) {
      console.error(error);
      setStatus("AI зөвлөмж авахад алдаа гарлаа.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
        <div>
          <div className="pill">AI зөвлөмж (Монгол)</div>
          <h3 style={{ marginTop: 8 }}>AI Монголоор богино action plan гаргах</h3>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Таны оноо, сул үзүүлэлт, материаллаг асуудлуудыг ашиглаж 3 тэргүүлэх чиглэл, 3 ойрын алхмыг санал болгоно.
          </p>
        </div>
        <button className="button ghost" onClick={generate} disabled={loading}>
          {loading ? "Генерацлаж байна..." : "AI зөвлөмж авах"}
        </button>
      </div>

      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          <label className="label">Танд чухал нэмэлт мэдээлэл (сонголттой)</label>
          <textarea
            className="textarea"
            placeholder="Жишээ: Бид энэ жил ISO 50001-д бэлтгэж байна, санхүүжилтийн хязгаар 200 сая₮..."
            rows={3}
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <p style={{ color: "var(--muted)", fontSize: 12, marginTop: 6 }}>
            OPENAI_API_KEY-г .env.local файлд тохируулсан байх ёстой.
          </p>
        </div>
        <div>
          <div className="pill ghost">Input preview</div>
          <p style={{ color: "var(--muted)", fontSize: 13, marginTop: 6 }}>
            Түвшин: {level} · Нийт оноо: {overall.toFixed(2)}
            <br />
            Сул үзүүлэлт:{" "}
            {weakest.map((w) => `${w.code} (${w.score.toFixed(1)})`).join(", ") || "—"}
            <br />
            Материаллаг улаан: {highMaterialCodes.join(", ") || "—"}
            <br />
            Дотоод зөвлөмжөөс: {recommendations.slice(0, 2).map((r) => r.code).join(", ") || "—"}
          </p>
        </div>
      </div>

      <div className="separator" />

      <div style={{ minHeight: 120, background: "rgba(255,255,255,0.02)", borderRadius: 12, padding: 14 }}>
        {text ? (
          <pre style={{ whiteSpace: "pre-wrap", color: "#fff", fontFamily: "var(--font-mono)", fontSize: 14 }}>
            {text}
          </pre>
        ) : (
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            AI-гийн санал энд Монголоор гарна. Доорх товчийг дарж шинэчилнэ.
          </p>
        )}
      </div>
      {status && (
        <p style={{ color: "var(--danger)", marginTop: 8, fontSize: 13 }}>
          {status}
        </p>
      )}
    </div>
  );
}
