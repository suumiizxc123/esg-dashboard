"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthPanel from "@/components/AuthPanel";
import SurveyForm from "@/components/SurveyForm";
import MaterialityChart from "@/components/MaterialityChart";
import HeatmapCard from "@/components/HeatmapCard";
import Recommendations from "@/components/Recommendations";
import AdminPanel from "@/components/AdminPanel";
import AIInsights from "@/components/AIInsights";
import { indicators } from "@/data/indicators";
import {
  emptyScores,
  heatmap,
  materialityPoints,
  overallScore,
  summaryCopy,
} from "@/lib/materiality";
import { buildRecommendations } from "@/lib/recommendations";
import { Assessment, IndicatorConfig, Level, PublicUser } from "@/types";

type AdminAssessmentRow = {
  id: string;
  schoolName: string;
  level: Level;
  overall: number;
  createdAt: string;
};

function HomeContent() {
  const [indicatorConfig, setIndicatorConfig] = useState<IndicatorConfig[]>(indicators);
  const [scores, setScores] = useState<Record<string, number>>(emptyScores());
  const [level, setLevel] = useState<Level>("initial");
  const [schoolName, setSchoolName] = useState("");
  const [user, setUser] = useState<PublicUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [savingAssessment, setSavingAssessment] = useState(false);
  const [savingConfig, setSavingConfig] = useState(false);
  const [status, setStatus] = useState("");
  const [adminAssessments, setAdminAssessments] = useState<AdminAssessmentRow[]>([]);
  const [userAssessments, setUserAssessments] = useState<Assessment[]>([]);
  const [showAi, setShowAi] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialStageParam = searchParams.get("stage") as "landing" | "survey" | "results" | null;
  const [stage, setStage] = useState<"landing" | "survey" | "results">("landing");

  const materiality = useMemo(
    () => materialityPoints(scores, indicatorConfig),
    [scores, indicatorConfig],
  );
  const heatmapData = useMemo(() => heatmap(scores, indicatorConfig), [scores, indicatorConfig]);
  const recommendations = useMemo(
    () => buildRecommendations(level, scores, indicatorConfig, 5),
    [level, scores, indicatorConfig],
  );
  const overall = useMemo(() => overallScore(scores), [scores]);
  const weakestForAi = useMemo(
    () => recommendations.slice(0, 3).map((item) => ({ code: item.code, label: item.label, score: item.score })),
    [recommendations],
  );

  const fetchAssessments = useCallback(
    async (authToken?: string, role?: PublicUser["role"]) => {
      const activeToken = authToken || token;
      const effectiveRole = role || user?.role;
      if (!activeToken) return;
      try {
        const res = await fetch(
          effectiveRole === "admin" ? "/api/assessments?all=true" : "/api/assessments",
          {
            headers: { Authorization: `Bearer ${activeToken}` },
          },
        );
        if (!res.ok) return;
        const data = await res.json();
        const list: Assessment[] = data.assessments || [];

        if (effectiveRole === "admin") {
          setAdminAssessments(
            list.map((entry) => ({
              id: entry.id,
              schoolName: entry.schoolName,
              level: entry.level,
              overall: overallScore(entry.scores),
              createdAt: entry.createdAt,
            })),
          );
        } else {
          const latest = list[0];
          setUserAssessments(list);
          if (latest) {
            setScores(latest.scores);
            setLevel(latest.level);
            setSchoolName((prev) => prev || latest.schoolName || "");
          }
        }
      } catch (error) {
        console.error(error);
      }
    },
    [token, user?.role],
  );

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch("/api/config");
        const data = await res.json();
        if (data.indicators) {
          setIndicatorConfig(data.indicators);
        }
      } catch (error) {
        console.error(error);
      }
    };

    const loadSession = async () => {
      const stored = localStorage.getItem("token");
      if (!stored) return;
      setToken(stored);
      try {
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${stored}` },
        });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser(data.user);
          if (data.user.organization) {
            setSchoolName((prev) => prev || data.user.organization || "");
          }
          await fetchAssessments(stored, data.user.role);
        } else {
          localStorage.removeItem("token");
          setToken(null);
        }
      } catch (error) {
        console.error(error);
        localStorage.removeItem("token");
        setToken(null);
      }
    };

    fetchConfig();
    loadSession();
  }, [fetchAssessments]);

  useEffect(() => {
    if (!initialStageParam) return;
    if (initialStageParam === "landing") {
      if (stage !== "landing") setStage("landing");
      return;
    }
    if (!user) {
      setStatus("Нэвтэрч байж оношлогоо, үр дүн болон админ хэсгийг үзнэ.");
      return;
    }
    if (initialStageParam !== stage) {
      setStage(initialStageParam);
    }
  }, [initialStageParam, stage, user]);

  useEffect(() => {
    if (!user && stage !== "landing") {
      setStage("landing");
      router.replace("?stage=landing");
      setStatus("Нэвтэрч байж оношлогоо, үр дүн болон админ хэсгийг үзнэ.");
    }
  }, [user, stage, router]);

  const requireLogin = (target: "survey" | "results" | "admin" = "survey") => {
    if (user) return true;
    const message =
      target === "admin"
        ? "Админ хэсгийг үзэхийн тулд эхлээд нэвтэрнэ."
        : "Нэвтэрч байж оношлогоо болон үр дүнг үзнэ.";
    setStatus(message);
    setStage("landing");
    router.replace("?stage=landing");
    return false;
  };

  const handleAuth = async ({ token: newToken, user: newUser }: { token: string; user: PublicUser }) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setUser(newUser);
    if (newUser.organization) {
      setSchoolName((prev) => prev || newUser.organization || "");
    }
    await fetchAssessments(newToken, newUser.role);
  };

  const handleLevelChange = (nextLevel: Level) => {
    setLevel(nextLevel);
    setScores(emptyScores());
  };

  const goLanding = () => {
    setStage("landing");
    router.replace("?stage=landing");
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  };

  const startSurvey = (resetScores = false) => {
    if (!requireLogin("survey")) return;
    if (resetScores) {
      setScores(emptyScores());
    }
    setStage("survey");
    router.replace("?stage=survey");
    setTimeout(() => {
      document.getElementById("survey-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const goResults = () => {
    if (!requireLogin("results")) return;
    setStage("results");
    router.replace("?stage=results");
    setTimeout(() => {
      document.getElementById("results-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const goAdminSection = () => {
    if (!requireLogin("admin")) return;
    setStage("results");
    router.replace("?stage=results");
    setTimeout(() => {
      document.getElementById("admin-section")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setAdminAssessments([]);
    setShowAi(false);
    setStage("landing");
    router.replace("?stage=landing");
    setScores(emptyScores());
    setStatus("Гарав.");
  };

  const handleScoreChange = (code: string, value: number) => {
    setScores((prev) => ({ ...prev, [code]: value }));
  };

  const handleSaveAssessment = async () => {
    if (!token) {
      setStatus("Эхлээд нэвтэрч хадгална уу.");
      return;
    }

    setSavingAssessment(true);
    setStatus("");
    try {
      const res = await fetch("/api/assessments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ scores, level, schoolName }),
      });
      const data = await res.json();
      if (!res.ok) {
        setStatus(data.error || "Хадгалах үед алдаа гарлаа.");
        return;
      }
      setStatus("Үнэлгээ хадгалагдлаа.");
      await fetchAssessments(token, user?.role);
    } catch (error) {
      console.error(error);
      setStatus("Алдаа гарлаа. Дахин оролдоно уу.");
    } finally {
      setSavingAssessment(false);
    }
  };

  const handleConfigUpdate = async (
    updates: Array<{ code: string; weight: number; impact: number }>,
  ) => {
    if (!token) {
      setStatus("Admin эрхээр нэвтэрч байж тохиргоо хадгална.");
      return;
    }
    setSavingConfig(true);
    try {
      const res = await fetch("/api/config", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ updates }),
      });
      const data = await res.json();
      if (data.indicators) {
        setIndicatorConfig(data.indicators);
        setStatus("Жин болон коэффициент шинэчлэгдлээ.");
      }
    } catch (error) {
      console.error(error);
      setStatus("Тохиргоо хадгалахад алдаа гарлаа.");
    } finally {
      setSavingConfig(false);
    }
  };

  const heroHighlight = materiality.filter((p) => p.isHigh);

  return (
    <div className="shell">
      <div className="container">
        <div className="header-bar">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span className="logo-mark">БОНЗ оношлогооны систем</span>
            <span className="pill ghost">v2.0 · 20 үзүүлэлт</span>
            <span className="pill">Scatter · Heatmap · 120+ зөвлөмж</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <button className="button ghost" onClick={goLanding}>
            Нүүр
          </button>
            <button className="button ghost" onClick={() => startSurvey()}>
              Оношлогоо
            </button>
            <button className="button ghost" onClick={goResults}>
              Үр дүн
            </button>
            <button className="button ghost" onClick={goAdminSection}>
              Админ
            </button>
            <span className="pill ghost">Demo admin: admin@bonz.local</span>
          </div>
        </div>

        {stage === "landing" && status && !user && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="pill">Статус</div>
            <p style={{ marginTop: 6, color: "var(--muted)" }}>{status}</p>
          </div>
        )}

        {stage === "landing" && (
          <section className="hero">
            <div className="hero-grid">
              <div style={{ display: "grid", gap: 10 }}>
                <div className="pill">Double Materiality · Risk heatmap · Smart recs</div>
                <h1 style={{ fontSize: 40, fontWeight: 700, lineHeight: 1.1 }}>
                  БОНЗ оношлогооны систем
              </h1>
              <p style={{ color: "var(--muted)", fontSize: 16, lineHeight: 1.6 }}>
                Түвшнээ сонгоод 20 үзүүлэлтийг 0–4 оноогоор үнэл. Систем X = 5 – (оноо×жин), Y = нөлөөллийг 0–5
                шкалд хувиргаж тооцоолж scatter plot, эрсдэлийн heatmap, дараагийн алхмын зөвлөмжийг гаргана.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button className="button cta" onClick={() => startSurvey()}>
                  Оношлогоо эхлүүлэх
                </button>
                <span className="tag">High-High → улаан</span>
                <span className="tag">Нийт оноо: шууд тооцоолол</span>
              </div>
            </div>
            <div className="card">
              <div className="pill">Live snapshot</div>
              <h3 style={{ marginTop: 10 }}>Таны явц</h3>
              <div className="stat-grid">
                <div className="stat-card">
                  <p className="label">Нийт БОНЗ оноо</p>
                  <h2>{overall.toFixed(2)} / 4.0</h2>
                  <p style={{ color: "var(--muted)" }}>
                    Хамгийн сул: {recommendations[0]?.code} · {recommendations[0]?.label}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="label">Материаллаг (High-High)</p>
                  <h2>{heroHighlight.length || 0}</h2>
                  <p style={{ color: "var(--muted)" }}>
                    {heroHighlight.length > 0
                      ? heroHighlight.map((item) => item.code).join(", ")
                      : "Одоогоор улаан бүсгүй"}
                  </p>
                </div>
                <div className="stat-card">
                  <p className="label">Түвшин</p>
                  <h2>{level === "initial" ? "Initial" : "Development"}</h2>
                  <p style={{ color: "var(--muted)" }}>{summaryCopy(level)}</p>
                </div>
              </div>
              {heroHighlight.length > 0 && (
                <div style={{ marginTop: 8 }}>
                  <p style={{ color: "var(--muted)", marginBottom: 6 }}>Улаан бүсийн үзүүлэлтүүд:</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {heroHighlight.map((item) => (
                      <span key={item.code} className="tag" style={{ borderColor: "#f07171", color: "#f07171" }}>
                        {item.code} · {item.label}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              </div>
            </div>
          </section>
        )}

        {stage === "landing" && !user && (
          <div className="grid-2" style={{ marginTop: 12 }}>
            <AuthPanel user={user} onAuth={handleAuth} onLogout={handleLogout} />
            <div className="card">
              <div className="pill">Нэвтрэлт шаардлагатай</div>
              <h3 style={{ marginTop: 10 }}>Оношлогоо, үр дүн, админ хэсгийг харахын тулд эхлээд нэвтэрнэ</h3>
              <p style={{ color: "var(--muted)", marginTop: 6 }}>
                Нэвтэрсний дараа оношлогоог эхлүүлэх товчоор шууд асуулгын хэсэг рүү орно. Demo админ имэйл:
                admin@bonz.local
              </p>
            </div>
          </div>
        )}

        <div className="stat-grid" style={{ display: stage === "landing" ? "grid" : "none" }}>
          <div className="stat-card">
            <p className="label">Түвшин сонголт</p>
            <h2>Initial / Development</h2>
            <p style={{ color: "var(--muted)" }}>Сонгосон түвшинд тохирсон асуултуудыг идэвхжүүлнэ.</p>
          </div>
          <div className="stat-card">
            <p className="label">20 үзүүлэлт</p>
            <h2>Environment · Social · Governance · Education</h2>
            <p style={{ color: "var(--muted)" }}>Бүх талбарыг 0–4 оноогоор үнэлж хадгална.</p>
          </div>
          <div className="stat-card">
            <p className="label">120+ зөвлөмж</p>
            <h2>Автомат action list</h2>
            <p style={{ color: "var(--muted)" }}>Сул үзүүлэлт + түвшинд суурилсан алхмууд.</p>
          </div>
        </div>

        <div className="flow-grid" style={{ marginBottom: 10, display: stage === "landing" ? "grid" : "none" }}>
          <div className="flow-card">
            <div className="pill">Алхам 1</div>
            <h4>Түвшин сонго</h4>
            <p>{summaryCopy(level)}</p>
          </div>
          <div className="flow-card">
            <div className="pill">Алхам 2</div>
            <h4>20 үзүүлэлтэд 0–4 оноо</h4>
            <p>Түвшний асуултууд идэвхжиж, “Next level targets” саарал хэвээр.</p>
          </div>
          <div className="flow-card">
            <div className="pill">Алхам 3</div>
            <h4>Scatter + Heatmap + Зөвлөмж</h4>
            <p>Нэг товчоор материаллаг цэгүүд, эрсдэлийн бүс, хэрэгжүүлэх алхам гарна.</p>
          </div>
        </div>

        {stage === "survey" && (
          <div className="grid-2" style={{ marginTop: 12 }}>
            <AuthPanel user={user} onAuth={handleAuth} onLogout={handleLogout} />
            <div className="card">
              <div className="pill">Тайлбар</div>
              <h3 style={{ marginTop: 10 }}>Өгөгдөл хадгалалт ба тохиргоо</h3>
              <p style={{ color: "var(--muted)", marginTop: 6 }}>
                Локал JSON-д хадгалж байгаа тул demo/туршилтанд тохиромжтой. Admin панелиар материаллаг байдлын жин,
                нөлөөллийн коэффициентоо шууд өөрчлөх боломжтой.
              </p>
              <div className="separator" />
              <p style={{ color: "var(--muted)" }}>
                Scatter plot-ийн X тэнхлэг нь эрсдэлийг (урвуу оноо), Y тэнхлэг нь нөлөөллийг илэрхийлнэ. High-High
                бүсийн улаан цэгүүдийг эхэлж шийднэ.
              </p>
            </div>
          </div>
        )}

        {stage === "survey" && status && (
          <div className="card" style={{ marginTop: 12 }}>
            <div className="pill">Статус</div>
            <p style={{ marginTop: 6, color: "var(--muted)" }}>{status}</p>
          </div>
        )}

        {stage === "survey" && (
          <div id="survey-section">
            <SurveyForm
              level={level}
              onLevelChange={handleLevelChange}
              schoolName={schoolName}
              onSchoolNameChange={setSchoolName}
              scores={scores}
              indicators={indicatorConfig}
              onScoreChange={handleScoreChange}
              onSave={handleSaveAssessment}
              saving={savingAssessment}
            />
            <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
              <button className="button secondary" onClick={() => startSurvey(true)}>
                Оноог цэвэрлэх
              </button>
              <button className="button" onClick={goResults}>
                Үр дүн үзэх
              </button>
            </div>
          </div>
        )}

        {stage === "results" && (
          <div id="results-section">
            <div className="grid-2" style={{ marginTop: 16 }}>
              <div className="card">
                <div className="pill">Нийт БОНЗ оноо</div>
                <h2 style={{ marginTop: 8, fontSize: 34 }}>{overall.toFixed(2)} / 4.0</h2>
                <p style={{ color: "var(--muted)", marginTop: 4 }}>
                  Хамгийн сул үзүүлэлт: {recommendations[0]?.code} · {recommendations[0]?.label} (оноо{" "}
                  {recommendations[0]?.score?.toFixed(1) ?? "0"})
                </p>
                {heroHighlight.length > 0 && (
                  <div style={{ marginTop: 10 }}>
                    <p style={{ color: "var(--muted)" }}>High-High материаллаг (улаан):</p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 6 }}>
                      {heroHighlight.map((item) => (
                        <span key={item.code} className="tag" style={{ borderColor: "#f07171", color: "#f07171" }}>
                          {item.code} · {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="card">
                <div className="pill">Одоогийн түвшин</div>
                <h3 style={{ marginTop: 10 }}>{level === "initial" ? "Initial" : "Development"} түвшин</h3>
                <p style={{ color: "var(--muted)" }}>
                  {level === "initial"
                    ? "Суурь мэдээлэл, хэмжилтийг бүрэн болгож, ил тод байлгах дээр төвлөр."
                    : "Нарийвчилсан KPI, баталгаажуулалт, ногоон санхүүжилт татах алхамд төвлөр."}
                </p>
                <div className="separator" />
                <p style={{ color: "var(--muted)" }}>
                  Хадгалсан оноонууд бүртгэлд үлдэнэ. Admin панелиар жин/коэффициентоо шинэчилж болно.
                </p>
              </div>
            </div>

            {user && user.role === "school" && (
              <div className="card" style={{ marginTop: 12 }}>
                <div className="pill">Таны хадгалсан оноонууд</div>
                {userAssessments.length === 0 ? (
                  <p style={{ color: "var(--muted)", marginTop: 8 }}>Одоогоор хадгалсан үнэлгээ алга.</p>
                ) : (
                  <div style={{ overflowX: "auto", marginTop: 8 }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ textAlign: "left", color: "var(--muted)", fontSize: 13 }}>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Сургууль</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Түвшин</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Нийт оноо</th>
                          <th style={{ padding: "8px 6px", borderBottom: "1px solid var(--border)" }}>Огноо</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userAssessments.map((row) => (
                          <tr key={row.id} style={{ borderBottom: "1px solid var(--border)" }}>
                            <td style={{ padding: "10px 6px" }}>{row.schoolName}</td>
                            <td style={{ padding: "10px 6px", color: "var(--muted)" }}>{row.level}</td>
                            <td style={{ padding: "10px 6px" }}>{overallScore(row.scores).toFixed(2)}</td>
                            <td style={{ padding: "10px 6px", color: "var(--muted)" }}>
                              {new Date(row.createdAt).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <div className="viz-grid" style={{ marginTop: 16 }}>
              <MaterialityChart points={materiality} />
              <HeatmapCard cells={heatmapData} />
            </div>

            <div className="card" style={{ marginTop: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <div>
                  <div className="pill">AI зөвлөмж</div>
                  <h3 style={{ marginTop: 8 }}>AI картыг хүссэн үедээ нээж/нуух</h3>
                  <p style={{ color: "var(--muted)", fontSize: 14 }}>
                    Монголоор богино action plan авах бол доорх товчоор AI картыг нээнэ. Нээлттэй үед OpenAI дуудлага хийнэ.
                  </p>
                </div>
                <button className="button ghost" onClick={() => setShowAi((prev) => !prev)}>
                  {showAi ? "AI картыг нуух" : "AI картыг нээх"}
                </button>
              </div>
            </div>

            {showAi && (
              <AIInsights
                level={level}
                overall={overall}
                weakest={weakestForAi}
                highMaterialCodes={heroHighlight.map((item) => item.code)}
                recommendations={recommendations.map((item) => ({
                  code: item.code,
                  label: item.label,
                  actions: item.actions,
                  score: item.score,
                  impact: item.impact,
                }))}
              />
            )}

            <Recommendations items={recommendations} />

            {user?.role === "admin" && (
              <div id="admin-section" style={{ marginTop: 16 }}>
                <AdminPanel
                  indicators={indicatorConfig}
                  onUpdate={handleConfigUpdate}
                  saving={savingConfig}
                  assessments={adminAssessments}
                  onRefreshAssessments={() => fetchAssessments(token || undefined, user.role)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div />}>
      <HomeContent />
    </Suspense>
  );
}
