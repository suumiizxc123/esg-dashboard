"use client";

import { useState } from "react";
import { PublicUser } from "@/types";

type Mode = "login" | "register";

type Props = {
  user: PublicUser | null;
  onAuth: (payload: { token: string; user: PublicUser }) => void;
  onLogout: () => void;
};

export default function AuthPanel({ user, onAuth, onLogout }: Props) {
  const [mode, setMode] = useState<Mode>("login");
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    organization: "",
    levelPreference: "development",
  });

  const update = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const submit = async () => {
    setStatus("");
    setLoading(true);
    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Алдаа гарлаа. Дахин оролдоно уу.");
        return;
      }

      localStorage.setItem("token", data.token);
      onAuth({ token: data.token, user: data.user });
      setStatus(
        mode === "login"
          ? "Амжилттай нэвтэрлээ."
          : "Бүртгэл амжилттай. Та нэвтэрлээ.",
      );
    } catch (error) {
      console.error(error);
      setStatus("Сүлжээний алдаа. Дахин оролдоно уу.");
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    return (
      <div className="card">
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div className="pill">Нэвтэрсэн</div>
            <h3 style={{ marginTop: 10 }}>{user.name}</h3>
            <p style={{ color: "var(--muted)", fontSize: 14 }}>
              {user.email} · {user.role === "admin" ? "Admin" : "School user"}
            </p>
            {user.organization && (
              <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 6 }}>
                {user.organization}
              </p>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <button className="button ghost" onClick={onLogout}>
              Гарах
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div className="pill">Нэвтрэх / Бүртгүүлэх</div>
          <h3 style={{ marginTop: 10 }}>
            ESG оношлогоонд нэвтэрч үнэлгээг хадгал
          </h3>
          <p style={{ color: "var(--muted)", fontSize: 14 }}>
            Admin demo: admin@bonz.local / admin123
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            className={`button ${mode === "login" ? "" : "ghost"}`}
            onClick={() => setMode("login")}
          >
            Нэвтрэх
          </button>
          <button
            className={`button ${mode === "register" ? "" : "ghost"}`}
            onClick={() => setMode("register")}
          >
            Бүртгүүлэх
          </button>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 14 }}>
        {mode === "register" && (
          <div>
            <label className="label">Нэр</label>
            <input
              className="input"
              placeholder="Нэр"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="label">Имэйл</label>
          <input
            className="input"
            placeholder="school@domain.mn"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        {mode === "register" && (
          <div>
            <label className="label">Сургууль / байгууллага</label>
            <input
              className="input"
              placeholder="Их сургууль"
              value={form.organization}
              onChange={(e) => update("organization", e.target.value)}
            />
          </div>
        )}
        <div>
          <label className="label">Нууц үг</label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </div>
        {mode === "register" && (
          <div>
            <label className="label">Түвшний сонголт (урьдчилсан)</label>
            <select
              className="select"
              value={form.levelPreference}
              onChange={(e) => update("levelPreference", e.target.value)}
            >
              <option value="initial">Initial (1-3 жил)</option>
              <option value="development">Development (4+ жил)</option>
            </select>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
        <button className="button" onClick={submit} disabled={loading}>
          {loading ? "Уншиж байна..." : mode === "login" ? "Нэвтрэх" : "Бүртгүүлэх"}
        </button>
        {status && (
          <span style={{ color: "var(--muted)", fontSize: 13 }}>
            {status}
          </span>
        )}
      </div>
    </div>
  );
}
