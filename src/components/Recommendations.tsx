"use client";

type RecommendationItem = {
  code: string;
  label: string;
  title: string;
  actions: string[];
  score: number;
  impact: number;
};

type Props = {
  items: RecommendationItem[];
};

export default function Recommendations({ items }: Props) {
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div className="pill">Автомат зөвлөмж</div>
          <h3 style={{ marginTop: 10 }}>Таны хамгийн сул үзүүлэлтүүд</h3>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Оноо бага, нөлөөллийн коэффициент өндөр үзүүлэлтүүдэд төвлөрсөн зөвлөмж.
          </p>
        </div>
      </div>
      <div className="stack" style={{ marginTop: 16 }}>
        {items.map((item) => (
          <div
            key={item.code}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 14,
              padding: 14,
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, flexWrap: "wrap" }}>
              <div>
                <div className="pill">
                  {item.code} · {item.label}
                </div>
                <h4 style={{ marginTop: 6 }}>{item.title}</h4>
                <p style={{ color: "var(--muted)", fontSize: 13 }}>
                  Оноо: {item.score.toFixed(1)} · Нөлөөлөл: {item.impact.toFixed(2)}
                </p>
              </div>
            </div>
            <ul style={{ marginTop: 8, paddingLeft: 16, color: "var(--muted)" }}>
              {item.actions.map((action) => (
                <li key={action} style={{ marginBottom: 6 }}>
                  {action}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
