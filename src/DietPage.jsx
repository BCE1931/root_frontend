import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { chatWithAi } from "./aiService";
import {
  ChevronLeft, ChevronRight, Check, Bot, ArrowLeft,
  Utensils, Activity, RefreshCw, Calendar, Info,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = "https://root-backend-2.onrender.com/api";
const DIET_START = "2026-06-01";
const DIET_END   = "2026-08-31";
const STEP_GOAL  = 8000;

const MEAL_META = {
  "Morning Drink": { icon: "🌅", time: "6:00 AM",  color: "#f59e0b" },
  "Breakfast":     { icon: "🍳", time: "8:00 AM",  color: "#10b981" },
  "Mid-Morning":   { icon: "🥜", time: "11:00 AM", color: "#f97316" },
  "Lunch":         { icon: "🍽️", time: "1:00 PM",  color: "#3b82f6" },
  "Evening Snack": { icon: "🍵", time: "4:00 PM",  color: "#8b5cf6" },
  "Dinner":        { icon: "🌙", time: "7:30 PM",  color: "#6366f1" },
  "Night":         { icon: "🌃", time: "9:00 PM",  color: "#64748b" },
  "Hydration":     { icon: "💧", time: "All day",  color: "#06b6d4" },
};

const MEAL_ORDER = ["Morning Drink","Breakfast","Mid-Morning","Lunch","Evening Snack","Dinner","Night","Hydration"];

async function dietReq(path, method = "GET", body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

function toDateStr(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(str) {
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function getMondayOfWeek(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

function formatLongDate(str) {
  return parseDate(str).toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatShortDate(str) {
  return parseDate(str).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getDayAbbr(str) {
  return parseDate(str).toLocaleDateString("en-US", { weekday: "short" });
}

function diffDays(a, b) {
  return Math.round((parseDate(b) - parseDate(a)) / 86400000);
}

function simpleMarkdown(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style='background:rgba(99,102,241,0.18);padding:1px 5px;border-radius:3px;font-size:12px;'>$1</code>")
    .replace(/^## (.+)$/gm, "<div style='font-weight:700;font-size:14px;margin:12px 0 5px;'>$1</div>")
    .replace(/^### (.+)$/gm, "<div style='font-weight:600;font-size:13px;margin:8px 0 4px;'>$1</div>")
    .replace(/^- (.+)$/gm, "<div style='padding-left:14px;margin:3px 0;'>• $1</div>")
    .replace(/\n\n/g, "<br/><br/>")
    .replace(/\n/g, "<br/>");
}

export default function DietPage() {
  const { isDark } = useContext(ThemeContext);
  const navigate   = useNavigate();

  const getInitialDate = () => {
    const today = toDateStr(new Date());
    if (today < DIET_START) return DIET_START;
    if (today > DIET_END)   return DIET_END;
    return today;
  };

  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [dayData,      setDayData]      = useState(null);
  const [weekData,     setWeekData]     = useState([]);
  const [loading,      setLoading]      = useState(false);
  const [weekLoading,  setWeekLoading]  = useState(false);
  const [stepsInput,   setStepsInput]   = useState("0");
  const [savingSteps,  setSavingSteps]  = useState(false);
  const [aiLoading,    setAiLoading]    = useState(false);
  const [aiText,       setAiText]       = useState("");
  const [showAi,       setShowAi]       = useState(false);

  const weekStart = toDateStr(getMondayOfWeek(parseDate(selectedDate)));

  const loadDay = useCallback(async (date) => {
    setLoading(true);
    try {
      const data = await dietReq(`/diet/day?date=${date}`);
      setDayData(data);
      setStepsInput(String(data.steps || 0));
    } catch {
      toast.error("Failed to load diet data. Backend may be starting up — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadWeek = useCallback(async (startDate) => {
    setWeekLoading(true);
    try {
      const data = await dietReq(`/diet/week?startDate=${startDate}`);
      setWeekData(data);
    } catch { /* silent */ }
    finally { setWeekLoading(false); }
  }, []);

  useEffect(() => { loadDay(selectedDate); },  [selectedDate, loadDay]);
  useEffect(() => { loadWeek(weekStart); },    [weekStart,    loadWeek]);

  const handleToggle = async (itemId) => {
    // Optimistic update
    setDayData(prev => {
      if (!prev) return prev;
      const items = prev.items.map(i =>
        i.id === itemId ? { ...i, completed: !i.completed } : i
      );
      return { ...prev, items, completedItems: items.filter(i => i.completed).length };
    });
    try {
      await dietReq("/diet/toggle", "POST", { date: selectedDate, itemId });
      loadWeek(weekStart);
    } catch {
      toast.error("Failed to save. Refreshing...");
      loadDay(selectedDate);
    }
  };

  const handleSaveSteps = async () => {
    const steps = parseInt(stepsInput, 10);
    if (isNaN(steps) || steps < 0 || steps > 99999) {
      toast.error("Please enter a valid step count (0 – 99,999)");
      return;
    }
    setSavingSteps(true);
    try {
      await dietReq("/diet/steps", "POST", { date: selectedDate, steps });
      setDayData(prev => prev ? { ...prev, steps } : prev);
      toast.success("Walk steps saved!");
      loadWeek(weekStart);
    } catch {
      toast.error("Failed to save walk steps");
    } finally {
      setSavingSteps(false);
    }
  };

  const handleGetAiSuggestions = async () => {
    setAiLoading(true);
    setShowAi(true);
    setAiText("");
    try {
      const wData = await dietReq(`/diet/week?startDate=${weekStart}`);
      const summaryLines = wData.map(day => {
        const pct = day.totalCount > 0
          ? Math.round((day.completedCount / day.totalCount) * 100)
          : 0;
        const missed = (day.missedItems || []).slice(0, 6).join(", ") || "none";
        return `- ${getDayAbbr(day.date)} (${day.date}): ${day.completedCount}/${day.totalCount} meals (${pct}%), ${day.steps} steps. Missed: ${missed}`;
      }).join("\n");

      const prompt = `You are a friendly health and nutrition coach for a software developer student in India who is tracking their daily diet.

Their 3-month diet plan (June–August 2026) includes:
🌅 Morning Drink (6 AM): Warm lemon water, Green tea
🍳 Breakfast (8 AM): Oats/Poha/Upma, 2 Boiled eggs/Paneer, 1 Fruit
🥜 Mid-Morning (11 AM): Almonds & walnuts, Seasonal fruit/cucumber
🍽️ Lunch (1 PM): Chapati/Rice, Dal/Rajma/Chana, Mixed vegetables, Green salad, Curd
🍵 Evening Snack (4 PM): Green tea/Coconut water, Sprouts/Fruit
🌙 Dinner (7:30 PM): Chapati/Rice, Grilled chicken/Paneer/Dal, Steamed vegetables, Salad
🌃 Night (9 PM): Warm milk/Haldi milk
💧 Hydration: 8 glasses of water
🎯 Walk Goal: ${STEP_GOAL.toLocaleString()} steps/day

Past 7 days tracking:
${summaryLines}

Provide a concise, motivating health analysis:

## 📊 Week at a Glance
Brief 1-2 sentence summary of adherence.

## ⚠️ Nutritional Gaps
What's being skipped most and why it matters for a busy student/developer.

## 💡 Top 3 Tips to Improve
Practical, realistic suggestions for this specific diet plan.

## 🚶 Walk Progress
Comment on step count consistency. Compare to the ${STEP_GOAL.toLocaleString()} daily goal.

## 🎯 Today's #1 Priority
One specific meal item or habit to focus on today.

Be warm, under 300 words, use encouraging language. No fluff.`;

      const result = await chatWithAi([{ role: "user", content: prompt }]);
      setAiText(result.text);
    } catch (e) {
      toast.error("AI suggestions failed. Check your AI provider settings in the app.");
      setAiText("");
      setShowAi(false);
    } finally {
      setAiLoading(false);
    }
  };

  const goToDate = (date) => {
    if (date < DIET_START || date > DIET_END) return;
    setSelectedDate(date);
    setAiText("");
    setShowAi(false);
  };

  const prevDay = () => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() - 1);
    goToDate(toDateStr(d));
  };

  const nextDay = () => {
    const d = parseDate(selectedDate);
    d.setDate(d.getDate() + 1);
    goToDate(toDateStr(d));
  };

  const groupedItems = (dayData?.items || []).reduce((acc, item) => {
    if (!acc[item.mealTime]) acc[item.mealTime] = [];
    acc[item.mealTime].push(item);
    return acc;
  }, {});

  // Theme tokens
  const bg       = isDark ? "#0f172a" : "#f8fafc";
  const cardBg   = isDark ? "#1e293b" : "#ffffff";
  const border   = isDark ? "#334155" : "#e2e8f0";
  const text     = isDark ? "#e2e8f0" : "#1e293b";
  const muted    = isDark ? "#94a3b8" : "#64748b";
  const inputBg  = isDark ? "#0f172a" : "#f8fafc";

  const totalItems     = dayData?.totalItems    || 0;
  const completedItems = dayData?.completedItems || 0;
  const completionPct  = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const currentSteps   = dayData?.steps || 0;
  const stepsPct       = Math.min(100, Math.round((currentSteps / STEP_GOAL) * 100));
  const stepsColor     = stepsPct >= 100 ? "#10b981" : stepsPct >= 62 ? "#f59e0b" : "#ef4444";
  const completionColor = completionPct >= 80 ? "#10b981" : completionPct >= 50 ? "#f59e0b" : "#ef4444";

  const todayStr      = toDateStr(new Date());
  const notStarted    = todayStr < DIET_START;
  const daysUntilStart = notStarted ? diffDays(todayStr, DIET_START) : 0;

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "system-ui, sans-serif" }}>

      {/* ── Header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 20px",
        borderBottom: `1px solid ${border}`,
        background: cardBg,
        position: "sticky", top: 0, zIndex: 10,
      }}>
        <button
          onClick={() => navigate("/")}
          style={{ background: "none", border: "none", color: muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "5px 8px", borderRadius: 6, fontSize: 13 }}
        >
          <ArrowLeft size={15} /> Back
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 7, flex: 1 }}>
          <Utensils size={18} style={{ color: "#10b981" }} />
          <span style={{ fontWeight: 700, fontSize: 17 }}>Diet Tracker</span>
          <span style={{ fontSize: 12, color: muted, marginLeft: 4 }}>Jun 1 – Aug 31, 2026</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <button
            onClick={prevDay}
            disabled={selectedDate <= DIET_START}
            title="Previous day"
            style={{ background: "none", border: `1px solid ${border}`, color: text, cursor: selectedDate <= DIET_START ? "not-allowed" : "pointer", borderRadius: 6, padding: "4px 8px", opacity: selectedDate <= DIET_START ? 0.35 : 1, display: "flex" }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontWeight: 600, fontSize: 13, minWidth: 72, textAlign: "center" }}>{formatShortDate(selectedDate)}</span>
          <button
            onClick={nextDay}
            disabled={selectedDate >= DIET_END}
            title="Next day"
            style={{ background: "none", border: `1px solid ${border}`, color: text, cursor: selectedDate >= DIET_END ? "not-allowed" : "pointer", borderRadius: 6, padding: "4px 8px", opacity: selectedDate >= DIET_END ? 0.35 : 1, display: "flex" }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1160, margin: "0 auto", padding: "20px 16px" }}>

        {/* ── Countdown banner ── */}
        {notStarted && (
          <div style={{
            background: isDark ? "rgba(59,130,246,0.12)" : "#eff6ff",
            border: `1px solid #3b82f6`, borderRadius: 10,
            padding: "12px 16px", marginBottom: 18,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <Calendar size={16} style={{ color: "#3b82f6", flexShrink: 0 }} />
            <span style={{ fontSize: 14, color: "#3b82f6" }}>
              Your diet plan starts in <strong>{daysUntilStart} day{daysUntilStart !== 1 ? "s" : ""}</strong> on June 1, 2026.
              You can preview the full plan below and start tracking from Day 1!
            </span>
          </div>
        )}

        {/* ── Day title + overall progress ── */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 21, fontWeight: 700, marginBottom: 6 }}>{formatLongDate(selectedDate)}</div>
          {dayData && (
            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: muted }}>{completedItems}/{totalItems} meals done</span>
              <div style={{ flex: 1, minWidth: 120, maxWidth: 280, height: 8, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${completionPct}%`, background: completionColor, borderRadius: 4, transition: "width 0.35s ease" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: completionColor }}>{completionPct}%</span>
            </div>
          )}
        </div>

        {/* ── Week strip ── */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "12px 14px", marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: "0.07em", marginBottom: 8 }}>WEEKLY OVERVIEW</div>
          <div style={{ display: "flex", gap: 6 }}>
            {weekLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} style={{ flex: 1, height: 60, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 8, opacity: 0.5 }} />
                ))
              : weekData.map(day => {
                  const pct      = day.totalCount > 0 ? (day.completedCount / day.totalCount) * 100 : 0;
                  const dotColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : (isDark ? "#334155" : "#d1d5db");
                  const isActive = day.date === selectedDate;
                  const inRange  = day.date >= DIET_START && day.date <= DIET_END;
                  return (
                    <button
                      key={day.date}
                      onClick={() => inRange && goToDate(day.date)}
                      style={{
                        flex: 1, minWidth: 38, display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                        background: isActive ? (isDark ? "rgba(59,130,246,0.15)" : "#eff6ff") : "none",
                        border: `1px solid ${isActive ? "#3b82f6" : "transparent"}`,
                        borderRadius: 8, padding: "8px 3px", cursor: inRange ? "pointer" : "default",
                        opacity: inRange ? 1 : 0.3,
                      }}
                    >
                      <div style={{ fontSize: 11, color: isActive ? "#3b82f6" : muted, fontWeight: isActive ? 700 : 400 }}>{getDayAbbr(day.date)}</div>
                      <div style={{ width: 30, height: 30, borderRadius: "50%", background: dotColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {pct > 0 && <span style={{ fontSize: 10, color: "#fff", fontWeight: 700 }}>{Math.round(pct)}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: muted }}>{day.steps > 0 ? `${(day.steps / 1000).toFixed(1)}k` : "—"}</div>
                    </button>
                  );
                })}
          </div>
        </div>

        {/* ── Main columns ── */}
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* LEFT: Meal items */}
          <div style={{ flex: "1 1 400px", minWidth: 0 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "60px 0", color: muted }}>
                <div style={{ width: 28, height: 28, border: `3px solid ${border}`, borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.9s linear infinite", margin: "0 auto 12px" }} />
                Loading diet plan...
              </div>
            ) : (
              MEAL_ORDER.map(mealTime => {
                const items = groupedItems[mealTime];
                if (!items || items.length === 0) return null;
                const meta        = MEAL_META[mealTime] || { icon: "🍴", time: "", color: "#64748b" };
                const doneCount   = items.filter(i => i.completed).length;
                const allDone     = doneCount === items.length;
                return (
                  <div key={mealTime} style={{
                    background: cardBg, border: `1px solid ${allDone ? meta.color + "55" : border}`,
                    borderRadius: 12, padding: "13px 15px", marginBottom: 12,
                    transition: "border-color 0.25s",
                  }}>
                    {/* Meal header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                      <span style={{ fontSize: 18 }}>{meta.icon}</span>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{mealTime}</span>
                      <span style={{ fontSize: 12, color: muted }}>{meta.time}</span>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: allDone ? "#10b981" : meta.color }}>
                        {doneCount}/{items.length}
                      </span>
                    </div>

                    {/* Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleToggle(item.id)}
                          style={{
                            display: "flex", alignItems: "center", gap: 10,
                            background: item.completed
                              ? (isDark ? `${meta.color}18` : `${meta.color}12`)
                              : "none",
                            border: `1px solid ${item.completed ? meta.color + "88" : border}`,
                            borderRadius: 8, padding: "8px 11px",
                            cursor: "pointer", textAlign: "left", width: "100%",
                            transition: "all 0.18s",
                          }}
                        >
                          <div style={{
                            width: 20, height: 20, borderRadius: 4, flexShrink: 0,
                            background: item.completed ? meta.color : "none",
                            border: `2px solid ${item.completed ? meta.color : muted}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.18s",
                          }}>
                            {item.completed && <Check size={11} color="#fff" strokeWidth={3} />}
                          </div>
                          <span style={{
                            flex: 1, fontSize: 14,
                            color: item.completed ? text : muted,
                            textDecoration: item.completed ? "line-through" : "none",
                            textDecorationColor: muted,
                          }}>
                            {item.itemName}
                          </span>
                          {item.calories > 0 && (
                            <span style={{ fontSize: 11, color: muted, flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
                              {item.calories} kcal
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* RIGHT: Walk + AI */}
          <div style={{ flex: "0 0 300px", minWidth: 270 }}>

            {/* Walk Steps card */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "16px", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 14 }}>
                <Activity size={16} style={{ color: "#3b82f6" }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Walk Steps</span>
                <span style={{ fontSize: 11, color: muted, marginLeft: "auto" }}>Goal: {STEP_GOAL.toLocaleString()}</span>
              </div>

              {/* Big step count + bar */}
              <div style={{ marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 6 }}>
                  <span style={{ fontSize: 28, fontWeight: 800, color: stepsColor, fontVariantNumeric: "tabular-nums" }}>
                    {currentSteps.toLocaleString()}
                  </span>
                  <span style={{ fontSize: 13, color: muted }}>steps</span>
                </div>
                <div style={{ height: 10, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${stepsPct}%`, background: stepsColor, borderRadius: 5, transition: "width 0.4s ease" }} />
                </div>
                <div style={{ fontSize: 12, color: stepsColor, marginTop: 5, fontWeight: 600 }}>
                  {stepsPct >= 100 ? "🎉 Daily goal reached!" : `${stepsPct}% of ${STEP_GOAL.toLocaleString()} goal`}
                </div>
              </div>

              {/* Input + save */}
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="number"
                  min="0"
                  max="99999"
                  value={stepsInput}
                  onChange={e => setStepsInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSaveSteps()}
                  placeholder="Enter today's steps..."
                  style={{
                    flex: 1, padding: "8px 10px", borderRadius: 8,
                    border: `1px solid ${border}`, background: inputBg, color: text,
                    fontSize: 14, outline: "none",
                  }}
                />
                <button
                  onClick={handleSaveSteps}
                  disabled={savingSteps}
                  style={{
                    padding: "8px 14px", borderRadius: 8, cursor: savingSteps ? "wait" : "pointer",
                    background: "#3b82f6", color: "#fff", border: "none",
                    fontWeight: 600, fontSize: 13, opacity: savingSteps ? 0.65 : 1,
                  }}
                >
                  {savingSteps ? "..." : "Save"}
                </button>
              </div>
            </div>

            {/* AI Health Coach card */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 12, padding: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <Bot size={16} style={{ color: "#8b5cf6" }} />
                <span style={{ fontWeight: 700, fontSize: 15 }}>AI Health Coach</span>
              </div>

              <div style={{ fontSize: 12, color: muted, marginBottom: 12, display: "flex", alignItems: "flex-start", gap: 5 }}>
                <Info size={12} style={{ flexShrink: 0, marginTop: 1 }} />
                Analyzes your week's diet data and gives personalized suggestions using your configured AI provider.
              </div>

              <button
                onClick={handleGetAiSuggestions}
                disabled={aiLoading}
                style={{
                  width: "100%", padding: "10px 16px", borderRadius: 8,
                  cursor: aiLoading ? "wait" : "pointer",
                  background: aiLoading
                    ? (isDark ? "#334155" : "#e2e8f0")
                    : "linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)",
                  color: aiLoading ? muted : "#fff",
                  border: "none", fontWeight: 600, fontSize: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  marginBottom: showAi ? 12 : 0,
                  transition: "all 0.2s",
                }}
              >
                {aiLoading
                  ? <><RefreshCw size={14} style={{ animation: "spin 1s linear infinite" }} /> Analyzing your week...</>
                  : <><Bot size={14} /> Get AI Suggestions</>
                }
              </button>

              {showAi && (
                <div style={{
                  background: isDark ? "#0f172a" : "#f8fafc",
                  border: `1px solid ${border}`, borderRadius: 10,
                  padding: "12px 14px", fontSize: 13, lineHeight: 1.75, color: text,
                  maxHeight: 440, overflowY: "auto",
                }}>
                  {aiLoading
                    ? <div style={{ color: muted, textAlign: "center", padding: "20px 0" }}>Getting personalized suggestions...</div>
                    : aiText
                      ? <div dangerouslySetInnerHTML={{ __html: simpleMarkdown(aiText) }} />
                      : <div style={{ color: muted }}>Click the button above to get suggestions.</div>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
