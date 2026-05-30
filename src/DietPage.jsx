import React, { useState, useEffect, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { chatWithAi } from "./aiService";
import {
  ChevronLeft, ChevronRight, Check, Bot, ArrowLeft,
  Utensils, Activity, RefreshCw, Calendar, Info, Plus, X, Trash2,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE    = "https://root-backend-2.onrender.com/api";
const DIET_START  = "2026-06-01";
const DIET_END    = "2026-08-31";
const STEP_GOAL   = 8000;
// Tuesday=2, Thursday=4, Saturday=6
const BIRYANI_DAYS = new Set([2, 4, 6]);

const DAY_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const MONTH_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const MEAL_META = {
  "Morning":        { icon: "🌅", time: "7:00 AM",   color: "#f59e0b", place: "PG Room" },
  "Office Breaks":  { icon: "☕", time: "9 AM–6 PM", color: "#06b6d4", place: "Office"  },
  "Lunch":          { icon: "🍽️", time: "1:00 PM",   color: "#3b82f6", place: "PG Mess" },
  "Evening":        { icon: "🍳", time: "6:15 PM",   color: "#f97316", place: "PG Room" },
  "Dinner":         { icon: "🌙", time: "8:30 PM",   color: "#8b5cf6", place: "PG Mess" },
  "Bedtime":        { icon: "🌃", time: "Optional",  color: "#64748b", place: "PG Room" },
};
const MEAL_ORDER = ["Morning","Office Breaks","Lunch","Evening","Dinner","Bedtime"];

async function dietReq(path, method = "GET", body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(API_BASE + path, opts);
  if (!res.ok) throw new Error(`Server ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

// ── Date helpers ─────────────────────────────────────────────────────────────
function toDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
function parseDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function getMondayOfWeek(date) {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() + (dow === 0 ? -6 : 1 - dow));
  return d;
}
function formatLong(s) {
  const d = parseDate(s);
  return `${DAY_SHORT[d.getDay()]}, ${MONTH_LONG[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
}
function formatShort(s) {
  const d = parseDate(s);
  return `${MONTH_LONG[d.getMonth()].slice(0,3)} ${d.getDate()}`;
}
function yearMonth(s) { return s.slice(0, 7); }

// ── Calendar sub-component ────────────────────────────────────────────────────
function CalendarModal({ selectedDate, onSelect, onClose, isDark }) {
  const [ym, setYm] = useState(yearMonth(selectedDate));
  const [monthData, setMonthData] = useState({});
  const [loading, setLoading] = useState(false);

  const border  = isDark ? "#334155" : "#e2e8f0";
  const bg      = isDark ? "#1e293b" : "#ffffff";
  const text    = isDark ? "#e2e8f0" : "#1e293b";
  const muted   = isDark ? "#94a3b8" : "#64748b";
  const overlay = isDark ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.4)";

  useEffect(() => {
    setLoading(true);
    dietReq(`/diet/month?yearMonth=${ym}`)
      .then(rows => {
        const map = {};
        (rows || []).forEach(r => { map[r.date] = r; });
        setMonthData(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ym]);

  const [year, month] = ym.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const daysInMonth = new Date(year, month, 0).getDate();
  // Monday-first offset
  const startOffset = (firstDay.getDay() + 6) % 7;

  const prevYm = () => {
    const d = new Date(year, month - 2, 1);
    const ny = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (ny >= "2026-06") setYm(ny);
  };
  const nextYm = () => {
    const d = new Date(year, month, 1);
    const ny = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (ny <= "2026-08") setYm(ny);
  };

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${ym}-${String(d).padStart(2, "0")}`;
    cells.push(ds);
  }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: overlay, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 14, padding: "20px", width: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        {/* Month navigation */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: 14 }}>
          <button onClick={prevYm} disabled={ym <= "2026-06"} style={{ background: "none", border: "none", cursor: ym <= "2026-06" ? "not-allowed" : "pointer", color: text, opacity: ym <= "2026-06" ? 0.3 : 1, padding: 4, display: "flex" }}>
            <ChevronLeft size={18} />
          </button>
          <div style={{ flex: 1, textAlign: "center", fontWeight: 700, fontSize: 15, color: text }}>
            {MONTH_LONG[month - 1]} {year}
          </div>
          <button onClick={nextYm} disabled={ym >= "2026-08"} style={{ background: "none", border: "none", cursor: ym >= "2026-08" ? "not-allowed" : "pointer", color: text, opacity: ym >= "2026-08" ? 0.3 : 1, padding: 4, display: "flex" }}>
            <ChevronRight size={18} />
          </button>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 4, marginLeft: 4, display: "flex" }}>
            <X size={16} />
          </button>
        </div>

        {/* Day-of-week headers (Mon first) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 2, marginBottom: 6 }}>
          {["Mo","Tu","We","Th","Fr","Sa","Su"].map(d => (
            <div key={d} style={{ textAlign: "center", fontSize: 11, color: muted, fontWeight: 600, padding: "2px 0" }}>{d}</div>
          ))}
        </div>

        {/* Date cells */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3 }}>
          {cells.map((ds, i) => {
            if (!ds) return <div key={`e${i}`} />;
            const info = monthData[ds];
            const pct  = info && info.totalCount > 0 ? Math.round((info.completedCount / info.totalCount) * 100) : 0;
            const inRange  = ds >= DIET_START && ds <= DIET_END;
            const isSelected = ds === selectedDate;
            const dotColor = !inRange ? "transparent"
              : pct >= 80 ? "#10b981"
              : pct >= 50 ? "#f59e0b"
              : pct > 0  ? "#ef4444"
              : isDark ? "#334155" : "#e2e8f0";

            return (
              <button
                key={ds}
                onClick={() => { if (inRange) { onSelect(ds); onClose(); } }}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center",
                  padding: "5px 2px", borderRadius: 6, border: "none",
                  background: isSelected ? "#3b82f6" : "none",
                  cursor: inRange ? "pointer" : "default",
                  opacity: inRange ? 1 : 0.25,
                }}
              >
                <span style={{ fontSize: 12, color: isSelected ? "#fff" : text, fontWeight: isSelected ? 700 : 400 }}>
                  {parseDate(ds).getDate()}
                </span>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.6)" : dotColor, marginTop: 2 }} />
              </button>
            );
          })}
        </div>

        {loading && (
          <div style={{ textAlign: "center", fontSize: 12, color: muted, marginTop: 10 }}>Loading...</div>
        )}

        {/* Legend */}
        <div style={{ display: "flex", gap: 12, marginTop: 14, justifyContent: "center" }}>
          {[["#10b981","≥80%"],["#f59e0b","50–79%"],["#ef4444","<50%"]].map(([c,l]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: c }} />
              <span style={{ fontSize: 10, color: muted }}>{l}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Add Item form ─────────────────────────────────────────────────────────────
function AddItemForm({ mealTime, onAdd, onCancel, isDark }) {
  const [name, setName]     = useState("");
  const [cals, setCals]     = useState("");
  const [saving, setSaving] = useState(false);
  const border = isDark ? "#334155" : "#e2e8f0";
  const bg     = isDark ? "#0f172a" : "#f8fafc";
  const text   = isDark ? "#e2e8f0" : "#1e293b";

  const handleSave = async () => {
    if (!name.trim()) { toast.error("Please enter an item name"); return; }
    setSaving(true);
    try {
      const item = await dietReq("/diet/items", "POST", {
        mealTime,
        itemName: name.trim(),
        calories: cals ? parseInt(cals, 10) : 0,
      });
      onAdd(item);
      toast.success("Item added!");
    } catch {
      toast.error("Failed to add item");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ marginTop: 8, padding: "10px 12px", background: bg, border: `1px dashed ${border}`, borderRadius: 8, display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
      <input
        autoFocus
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") onCancel(); }}
        placeholder="Item name…"
        style={{ flex: "1 1 140px", padding: "6px 9px", border: `1px solid ${border}`, borderRadius: 6, background: isDark ? "#1e293b" : "#fff", color: text, fontSize: 13, outline: "none" }}
      />
      <input
        type="number"
        value={cals}
        onChange={e => setCals(e.target.value)}
        placeholder="kcal (optional)"
        style={{ width: 110, padding: "6px 9px", border: `1px solid ${border}`, borderRadius: 6, background: isDark ? "#1e293b" : "#fff", color: text, fontSize: 13, outline: "none" }}
      />
      <button onClick={handleSave} disabled={saving} style={{ padding: "6px 14px", borderRadius: 6, background: "#10b981", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: saving ? "wait" : "pointer" }}>
        {saving ? "…" : "Add"}
      </button>
      <button onClick={onCancel} style={{ padding: "6px 10px", borderRadius: 6, background: "none", border: `1px solid ${border}`, color: text, fontSize: 13, cursor: "pointer" }}>
        Cancel
      </button>
    </div>
  );
}

// ── Main DietPage ─────────────────────────────────────────────────────────────
export default function DietPage() {
  const { isDark } = useContext(ThemeContext);
  const navigate   = useNavigate();

  const getInitialDate = () => {
    const today = toDateStr(new Date());
    if (today < DIET_START) return DIET_START;
    if (today > DIET_END)   return DIET_END;
    return today;
  };

  const [selectedDate,  setSelectedDate]  = useState(getInitialDate);
  const [dayData,       setDayData]       = useState(null);
  const [weekData,      setWeekData]      = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [weekLoading,   setWeekLoading]   = useState(false);
  const [stepsInput,    setStepsInput]    = useState("0");
  const [savingSteps,   setSavingSteps]   = useState(false);
  const [aiLoading,     setAiLoading]     = useState(false);
  const [aiText,        setAiText]        = useState("");
  const [showAi,        setShowAi]        = useState(false);
  const [showCalendar,  setShowCalendar]  = useState(false);
  const [addingIn,      setAddingIn]      = useState(null); // meal_time string or null

  const weekStart = toDateStr(getMondayOfWeek(parseDate(selectedDate)));

  const loadDay = useCallback(async (date) => {
    setLoading(true);
    try {
      const data = await dietReq(`/diet/day?date=${date}`);
      setDayData(data);
      setStepsInput(String(data.steps || 0));
    } catch {
      toast.error("Failed to load — backend may still be starting up. Try again in a moment.");
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
    setDayData(prev => {
      if (!prev) return prev;
      const items = prev.items.map(i => i.id === itemId ? { ...i, completed: !i.completed } : i);
      return { ...prev, items, completedItems: items.filter(i => i.completed).length };
    });
    try {
      await dietReq("/diet/toggle", "POST", { date: selectedDate, itemId });
      loadWeek(weekStart);
    } catch {
      toast.error("Save failed — refreshing");
      loadDay(selectedDate);
    }
  };

  const handleDeleteItem = async (itemId, itemName) => {
    if (!window.confirm(`Remove "${itemName}" from the plan?`)) return;
    try {
      await dietReq(`/diet/items/${itemId}`, "DELETE");
      setDayData(prev => {
        if (!prev) return prev;
        const items = prev.items.filter(i => i.id !== itemId);
        return { ...prev, items, totalItems: items.length, completedItems: items.filter(i => i.completed).length };
      });
      toast.success("Item removed");
    } catch {
      toast.error("Failed to remove item");
    }
  };

  const handleItemAdded = (newItem) => {
    newItem.completed = false;
    setDayData(prev => {
      if (!prev) return prev;
      const items = [...prev.items, newItem];
      return { ...prev, items, totalItems: items.length };
    });
    setAddingIn(null);
  };

  const handleSaveSteps = async () => {
    const steps = parseInt(stepsInput, 10);
    if (isNaN(steps) || steps < 0 || steps > 99999) {
      toast.error("Enter a valid step count (0–99,999)");
      return;
    }
    setSavingSteps(true);
    try {
      await dietReq("/diet/steps", "POST", { date: selectedDate, steps });
      setDayData(prev => prev ? { ...prev, steps } : prev);
      toast.success("Steps saved!");
      loadWeek(weekStart);
    } catch {
      toast.error("Failed to save steps");
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
      const lines = wData.map(day => {
        const pct = day.totalCount > 0 ? Math.round((day.completedCount / day.totalCount) * 100) : 0;
        const missed = (day.missedItems || []).slice(0, 5).join(", ") || "none";
        return `- ${DAY_SHORT[parseDate(day.date).getDay()]} (${day.date}): ${day.completedCount}/${day.totalCount} meals (${pct}%), ${day.steps} steps. Missed: ${missed}`;
      }).join("\n");

      const prompt = `You are a fitness and nutrition coach for a PG-living software developer in India who is on a 3-month bulking plan (Jun–Aug 2026).

Daily meal plan:
🌅 7:00 AM (PG Room): 3 eggs, oats, 1 banana
☕ Office (9–6 PM): Milk during 3 breaks
🍽️ 1:00 PM (PG Mess): Large rice+dal, sabzi, curd, soya chunks, 1 tsp ghee
🍳 6:15 PM (PG Room): 3 eggs, 2 bananas, 2 tbsp peanut butter, peanuts
🌙 8:30 PM (PG Mess): Roti/rice, dal, 2 eggs/chicken (weekly), sabzi
🍛 Tue/Thu/Sat Dinner: Biryani at mess (replace standard dinner)
🌃 Bedtime (optional): 1 banana, 1 tbsp peanut butter
🎯 Walk: ${STEP_GOAL.toLocaleString()} steps/day target

Past 7 days:
${lines}

Give a short, punchy analysis:

## 📊 Week Summary
1-2 sentences on overall adherence.

## ⚠️ What You're Missing
Which meals are skipped most — and the impact on the bulking goal (muscle gain, protein deficit).

## 💡 3 Quick Fixes
Practical tips specific to PG/office life.

## 🚶 Walking
Comment on step count vs the ${STEP_GOAL.toLocaleString()} goal.

## 🎯 Focus Today
One specific thing to nail today.

Keep it under 250 words. Be direct and motivating.`;

      const result = await chatWithAi([{ role: "user", content: prompt }]);
      setAiText(result.text);
    } catch {
      toast.error("AI failed. Check your AI provider in settings.");
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
    setAddingIn(null);
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

  const selectedDow    = parseDate(selectedDate).getDay();
  const isBiryaniDay   = BIRYANI_DAYS.has(selectedDow);
  const todayStr       = toDateStr(new Date());
  const notStarted     = todayStr < DIET_START;
  const daysUntilStart = notStarted ? Math.round((parseDate(DIET_START) - parseDate(todayStr)) / 86400000) : 0;

  const groupedItems = (dayData?.items || []).reduce((acc, item) => {
    if (!acc[item.mealTime]) acc[item.mealTime] = [];
    acc[item.mealTime].push(item);
    return acc;
  }, {});

  // Derived stats
  const totalItems     = dayData?.totalItems    || 0;
  const completedItems = dayData?.completedItems || 0;
  const completionPct  = totalItems ? Math.round((completedItems / totalItems) * 100) : 0;
  const currentSteps   = dayData?.steps || 0;
  const stepsPct       = Math.min(100, Math.round((currentSteps / STEP_GOAL) * 100));
  const stepsColor     = stepsPct >= 100 ? "#10b981" : stepsPct >= 60 ? "#f59e0b" : "#ef4444";
  const completionColor = completionPct >= 80 ? "#10b981" : completionPct >= 50 ? "#f59e0b" : "#ef4444";

  // Theme tokens
  const bg      = isDark ? "#0f172a" : "#f8fafc";
  const cardBg  = isDark ? "#1e293b" : "#ffffff";
  const border  = isDark ? "#334155" : "#e2e8f0";
  const text    = isDark ? "#e2e8f0" : "#1e293b";
  const muted   = isDark ? "#94a3b8" : "#64748b";
  const inputBg = isDark ? "#0f172a" : "#f8fafc";

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text, fontFamily: "system-ui, sans-serif" }}>

      {/* ── Sticky header ── */}
      <div style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "12px 18px",
        borderBottom: `1px solid ${border}`,
        background: cardBg,
        position: "sticky", top: 0, zIndex: 20,
        flexWrap: "wrap", rowGap: 6,
      }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", color: muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, padding: "4px 6px", borderRadius: 6, fontSize: 13 }}>
          <ArrowLeft size={15} /> Back
        </button>

        <Utensils size={17} style={{ color: "#10b981" }} />
        <span style={{ fontWeight: 700, fontSize: 16 }}>Diet Tracker</span>
        <span style={{ fontSize: 11, color: muted }}>Jun 1 – Aug 31, 2026</span>

        <div style={{ flex: 1 }} />

        {/* Date nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <button onClick={prevDay} disabled={selectedDate <= DIET_START}
            style={{ background: "none", border: `1px solid ${border}`, color: text, cursor: selectedDate <= DIET_START ? "not-allowed" : "pointer", borderRadius: 6, padding: "4px 7px", opacity: selectedDate <= DIET_START ? 0.3 : 1, display: "flex" }}>
            <ChevronLeft size={14} />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, minWidth: 68, textAlign: "center" }}>{formatShort(selectedDate)}</span>
          <button onClick={nextDay} disabled={selectedDate >= DIET_END}
            style={{ background: "none", border: `1px solid ${border}`, color: text, cursor: selectedDate >= DIET_END ? "not-allowed" : "pointer", borderRadius: 6, padding: "4px 7px", opacity: selectedDate >= DIET_END ? 0.3 : 1, display: "flex" }}>
            <ChevronRight size={14} />
          </button>
          <button onClick={() => setShowCalendar(true)} title="Open calendar"
            style={{ background: "none", border: `1px solid ${border}`, color: text, cursor: "pointer", borderRadius: 6, padding: "4px 8px", marginLeft: 4, display: "flex" }}>
            <Calendar size={14} />
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "18px 14px" }}>

        {/* ── Countdown banner ── */}
        {notStarted && (
          <div style={{ background: isDark ? "rgba(59,130,246,0.1)" : "#eff6ff", border: `1px solid #3b82f6`, borderRadius: 10, padding: "11px 15px", marginBottom: 16, display: "flex", alignItems: "center", gap: 9 }}>
            <Calendar size={15} style={{ color: "#3b82f6", flexShrink: 0 }} />
            <span style={{ fontSize: 13, color: "#3b82f6" }}>
              Diet starts in <strong>{daysUntilStart} day{daysUntilStart !== 1 ? "s" : ""}</strong> (June 1, 2026). Preview your plan below!
            </span>
          </div>
        )}

        {/* ── Biryani day banner ── */}
        {isBiryaniDay && (
          <div style={{ background: isDark ? "rgba(139,92,246,0.12)" : "#faf5ff", border: `1px solid #8b5cf6`, borderRadius: 10, padding: "10px 15px", marginBottom: 16, display: "flex", alignItems: "center", gap: 9 }}>
            <span style={{ fontSize: 18 }}>🍛</span>
            <span style={{ fontSize: 13, color: "#8b5cf6", fontWeight: 600 }}>
              Biryani Day! — PG Mess serves biryani today ({DAY_SHORT[selectedDow]}). Check Biryani under Dinner.
            </span>
          </div>
        )}

        {/* ── Day title + progress ── */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 5 }}>{formatLong(selectedDate)}</div>
          {dayData && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 13, color: muted }}>{completedItems}/{totalItems} meals</span>
              <div style={{ flex: 1, minWidth: 100, maxWidth: 260, height: 8, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 4, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${completionPct}%`, background: completionColor, borderRadius: 4, transition: "width 0.3s" }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: completionColor }}>{completionPct}%</span>
            </div>
          )}
        </div>

        {/* ── Week strip ── */}
        <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 11, padding: "11px 13px", marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: muted, fontWeight: 600, letterSpacing: "0.07em", marginBottom: 8 }}>WEEKLY OVERVIEW</div>
          <div style={{ display: "flex", gap: 4, minWidth: 0 }}>
            {weekLoading
              ? Array.from({ length: 7 }).map((_, i) => <div key={i} style={{ flex: 1, height: 58, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 7, opacity: 0.4 }} />)
              : weekData.map(day => {
                  const pct      = day.totalCount > 0 ? (day.completedCount / day.totalCount) * 100 : 0;
                  const dotColor = pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : pct > 0 ? "#ef4444" : (isDark ? "#334155" : "#d1d5db");
                  const isActive = day.date === selectedDate;
                  const inRange  = day.date >= DIET_START && day.date <= DIET_END;
                  const dow      = parseDate(day.date).getDay();
                  return (
                    <button key={day.date} onClick={() => inRange && goToDate(day.date)} style={{
                      flex: 1, minWidth: 36, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      background: isActive ? (isDark ? "rgba(59,130,246,0.18)" : "#eff6ff") : "none",
                      border: `1px solid ${isActive ? "#3b82f6" : "transparent"}`,
                      borderRadius: 7, padding: "7px 3px", cursor: inRange ? "pointer" : "default",
                      opacity: inRange ? 1 : 0.28,
                    }}>
                      <div style={{ fontSize: 11, fontWeight: isActive ? 700 : 400, color: isActive ? "#3b82f6" : muted }}>{DAY_SHORT[dow]}</div>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: dotColor, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {pct > 0 && <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>{Math.round(pct)}</span>}
                      </div>
                      <div style={{ fontSize: 10, color: muted }}>{day.steps > 0 ? `${(day.steps / 1000).toFixed(1)}k` : "—"}</div>
                    </button>
                  );
                })
            }
          </div>
        </div>

        {/* ── Main columns ── */}
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>

          {/* ── LEFT: Meal sections ── */}
          <div style={{ flex: "1 1 380px", minWidth: 0 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: "50px 0", color: muted }}>
                <div style={{ width: 26, height: 26, border: `3px solid ${border}`, borderTopColor: "#3b82f6", borderRadius: "50%", animation: "spin 0.85s linear infinite", margin: "0 auto 10px" }} />
                Loading diet plan…
              </div>
            ) : (
              MEAL_ORDER.map(mealTime => {
                const items   = groupedItems[mealTime];
                if (!items || items.length === 0) return null;
                const meta      = MEAL_META[mealTime] || { icon: "🍴", time: "", color: "#64748b", place: "" };
                const doneCount = items.filter(i => i.completed).length;
                const allDone   = doneCount === items.length;
                const isAddingHere = addingIn === mealTime;

                return (
                  <div key={mealTime} style={{
                    background: cardBg, border: `1px solid ${allDone ? meta.color + "66" : border}`,
                    borderRadius: 11, padding: "12px 14px", marginBottom: 11,
                    transition: "border-color 0.2s",
                  }}>
                    {/* Meal header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 9 }}>
                      <span style={{ fontSize: 17 }}>{meta.icon}</span>
                      <div>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{mealTime}</span>
                        <span style={{ fontSize: 11, color: muted, marginLeft: 6 }}>{meta.time}</span>
                        <span style={{ fontSize: 11, color: muted, marginLeft: 4 }}>· {meta.place}</span>
                      </div>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: allDone ? "#10b981" : meta.color }}>{doneCount}/{items.length}</span>
                    </div>

                    {/* Items */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                      {items.map(item => {
                        const isBiryaniItem = item.itemName.includes("Biryani");
                        const highlightBiryani = isBiryaniItem && isBiryaniDay;
                        return (
                          <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                            <button
                              onClick={() => handleToggle(item.id)}
                              style={{
                                flex: 1, display: "flex", alignItems: "center", gap: 9,
                                background: item.completed
                                  ? (isDark ? `${meta.color}18` : `${meta.color}10`)
                                  : highlightBiryani
                                  ? (isDark ? "rgba(139,92,246,0.1)" : "#faf5ff")
                                  : "none",
                                border: `1px solid ${item.completed ? meta.color + "88" : highlightBiryani ? "#8b5cf6" : border}`,
                                borderRadius: 7, padding: "7px 10px", cursor: "pointer",
                                textAlign: "left", transition: "all 0.15s",
                              }}
                            >
                              <div style={{
                                width: 19, height: 19, borderRadius: 4, flexShrink: 0,
                                background: item.completed ? meta.color : "none",
                                border: `2px solid ${item.completed ? meta.color : muted}`,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "all 0.15s",
                              }}>
                                {item.completed && <Check size={11} color="#fff" strokeWidth={3} />}
                              </div>
                              <span style={{
                                flex: 1, fontSize: 13,
                                color: item.completed ? text : muted,
                                textDecoration: item.completed ? "line-through" : "none",
                                textDecorationColor: muted,
                              }}>
                                {highlightBiryani && <span style={{ marginRight: 4 }}>🍛</span>}
                                {item.itemName}
                              </span>
                              {item.calories > 0 && (
                                <span style={{ fontSize: 11, color: muted, flexShrink: 0 }}>{item.calories} kcal</span>
                              )}
                            </button>
                            {/* Delete button — only for non-seeded items */}
                            {!item.id.startsWith("d1e7") && (
                              <button onClick={() => handleDeleteItem(item.id, item.itemName)} title="Remove item"
                                style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: "4px", display: "flex", borderRadius: 4, flexShrink: 0 }}>
                                <Trash2 size={13} />
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Add item */}
                    {isAddingHere ? (
                      <AddItemForm mealTime={mealTime} onAdd={handleItemAdded} onCancel={() => setAddingIn(null)} isDark={isDark} />
                    ) : (
                      <button onClick={() => setAddingIn(mealTime)} style={{
                        marginTop: 8, display: "flex", alignItems: "center", gap: 5,
                        background: "none", border: `1px dashed ${border}`, borderRadius: 7,
                        padding: "6px 10px", cursor: "pointer", color: muted, fontSize: 12, width: "100%",
                      }}>
                        <Plus size={12} /> Add item
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── RIGHT: Walk + AI ── */}
          <div style={{ flex: "0 0 290px", minWidth: 260 }}>

            {/* Walk Steps */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 11, padding: "15px", marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 12 }}>
                <Activity size={15} style={{ color: "#3b82f6" }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>Walk Steps</span>
                <span style={{ fontSize: 11, color: muted, marginLeft: "auto" }}>Goal: {STEP_GOAL.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 6 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: stepsColor }}>{currentSteps.toLocaleString()}</span>
                <span style={{ fontSize: 13, color: muted }}>steps</span>
              </div>
              <div style={{ height: 9, background: isDark ? "#334155" : "#e2e8f0", borderRadius: 5, overflow: "hidden", marginBottom: 5 }}>
                <div style={{ height: "100%", width: `${stepsPct}%`, background: stepsColor, borderRadius: 5, transition: "width 0.4s ease" }} />
              </div>
              <div style={{ fontSize: 12, color: stepsColor, marginBottom: 12, fontWeight: 600 }}>
                {stepsPct >= 100 ? "🎉 Goal reached!" : `${stepsPct}% of ${STEP_GOAL.toLocaleString()} goal`}
              </div>
              <div style={{ display: "flex", gap: 7 }}>
                <input
                  type="number" min="0" max="99999" value={stepsInput}
                  onChange={e => setStepsInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSaveSteps()}
                  placeholder="Enter steps…"
                  style={{ flex: 1, padding: "7px 9px", borderRadius: 7, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 13, outline: "none" }}
                />
                <button onClick={handleSaveSteps} disabled={savingSteps}
                  style={{ padding: "7px 13px", borderRadius: 7, cursor: savingSteps ? "wait" : "pointer", background: "#3b82f6", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, opacity: savingSteps ? 0.6 : 1 }}>
                  {savingSteps ? "…" : "Save"}
                </button>
              </div>
            </div>

            {/* AI Health Coach */}
            <div style={{ background: cardBg, border: `1px solid ${border}`, borderRadius: 11, padding: "15px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 10 }}>
                <Bot size={15} style={{ color: "#8b5cf6" }} />
                <span style={{ fontWeight: 700, fontSize: 14 }}>AI Health Coach</span>
              </div>
              <div style={{ fontSize: 12, color: muted, marginBottom: 11, lineHeight: 1.5 }}>
                <Info size={11} style={{ verticalAlign: "middle", marginRight: 4 }} />
                Analyzes your week's data and gives bulking-specific suggestions using your AI provider.
              </div>
              <button onClick={handleGetAiSuggestions} disabled={aiLoading} style={{
                width: "100%", padding: "9px 14px", borderRadius: 7, cursor: aiLoading ? "wait" : "pointer",
                background: aiLoading ? (isDark ? "#334155" : "#e2e8f0") : "linear-gradient(135deg,#8b5cf6,#6366f1)",
                color: aiLoading ? muted : "#fff", border: "none", fontWeight: 600, fontSize: 13,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                marginBottom: showAi ? 11 : 0, transition: "all 0.2s",
              }}>
                {aiLoading
                  ? <><RefreshCw size={13} style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</>
                  : <><Bot size={13} /> Get AI Suggestions</>
                }
              </button>
              {showAi && (
                <div style={{
                  background: inputBg, border: `1px solid ${border}`, borderRadius: 9,
                  padding: "11px 13px", fontSize: 13, lineHeight: 1.75, color: text,
                  maxHeight: 420, overflowY: "auto",
                }}>
                  {aiLoading
                    ? <div style={{ color: muted, textAlign: "center", padding: "18px 0" }}>Getting suggestions…</div>
                    : aiText
                      ? <div dangerouslySetInnerHTML={{ __html: mdToHtml(aiText) }} />
                      : <div style={{ color: muted }}>Click above to get suggestions.</div>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Calendar modal ── */}
      {showCalendar && (
        <CalendarModal
          selectedDate={selectedDate}
          onSelect={goToDate}
          onClose={() => setShowCalendar(false)}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function mdToHtml(text) {
  return text
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, "<code style='background:rgba(99,102,241,0.18);padding:1px 5px;border-radius:3px;font-size:12px'>$1</code>")
    .replace(/^## (.+)$/gm, "<div style='font-weight:700;font-size:14px;margin:10px 0 4px'>$1</div>")
    .replace(/^### (.+)$/gm, "<div style='font-weight:600;font-size:13px;margin:7px 0 3px'>$1</div>")
    .replace(/^- (.+)$/gm, "<div style='padding-left:12px;margin:2px 0'>• $1</div>")
    .replace(/\n\n/g, "<br/><br/>").replace(/\n/g, "<br/>");
}
