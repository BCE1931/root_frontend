import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import { chatWithAi } from "./aiService";
import {
  ChevronLeft, ChevronRight, Check, Bot, ArrowLeft,
  Dumbbell, RefreshCw, Calendar, Plus, X, Trash2, FileText,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = "https://root-backend-2.onrender.com/api";

const DAY_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const DAY_LONG   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// 1=Mon…7=Sun  (Java DayOfWeek)
const REST_DAYS = new Set([3, 7]); // Wed, Sun

const MUSCLE_COLORS = {
  "Chest":      "#ef4444",
  "Shoulders":  "#f97316",
  "Triceps":    "#eab308",
  "Back":       "#3b82f6",
  "Biceps":     "#8b5cf6",
  "Quads":      "#06b6d4",
  "Hamstrings": "#10b981",
  "Calves":     "#14b8a6",
  "Full Body":  "#ec4899",
  "Core":       "#f59e0b",
  "Cardio":     "#22c55e",
  "Flexibility":"#a78bfa",
};
function muscleColor(group) { return MUSCLE_COLORS[group] || "#64748b"; }

async function gymReq(path, method = "GET", body) {
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
    gymReq(`/gym/month?yearMonth=${ym}`)
      .then(rows => {
        const map = {};
        rows.forEach(r => { map[r.date] = r; });
        setMonthData(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ym]);

  const [y, mo] = ym.split("-").map(Number);
  const firstDay = new Date(y, mo - 1, 1);
  const daysInMonth = new Date(y, mo, 0).getDate();
  // Monday-first grid
  let startDow = firstDay.getDay();
  if (startDow === 0) startDow = 7;
  const blanks = startDow - 1;

  const minYm = "2026-06";
  const maxYm = "2026-08";

  const prevMonth = () => {
    const [py, pm] = ym.split("-").map(Number);
    const d = new Date(py, pm - 2, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next >= minYm) setYm(next);
  };
  const nextMonth = () => {
    const [py, pm] = ym.split("-").map(Number);
    const d = new Date(py, pm, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next <= maxYm) setYm(next);
  };

  function dotColor(row) {
    if (!row || row.totalExercises === 0) return null;
    const pct = row.completedExercises / row.totalExercises;
    if (pct >= 0.8) return "#10b981";
    if (pct >= 0.5) return "#f59e0b";
    return "#ef4444";
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: overlay, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 20, width: 320, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={prevMonth} disabled={ym <= minYm}
            style={{ background: "none", border: "none", cursor: "pointer", color: ym <= minYm ? muted : text, padding: 4 }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 700, color: text }}>
            {MONTH_LONG[mo - 1]} {y}
          </span>
          <button onClick={nextMonth} disabled={ym >= maxYm}
            style={{ background: "none", border: "none", cursor: "pointer", color: ym >= maxYm ? muted : text, padding: 4 }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", color: muted, padding: 20 }}>Loading…</div>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, marginBottom: 8 }}>
              {["M","T","W","T","F","S","S"].map((d, i) => (
                <div key={i} style={{ textAlign: "center", fontSize: 11, fontWeight: 600, color: muted, padding: "2px 0" }}>{d}</div>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
              {Array(blanks).fill(null).map((_, i) => <div key={`b${i}`} />)}
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                const dateStr = `${ym}-${String(day).padStart(2, "0")}`;
                const row = monthData[dateStr];
                const dot = dotColor(row);
                const isSelected = dateStr === selectedDate;
                const isToday = dateStr === toDateStr(new Date());
                return (
                  <button key={day} onClick={() => { onSelect(dateStr); onClose(); }}
                    style={{
                      aspectRatio: "1", borderRadius: 8, border: isSelected ? "2px solid #3b82f6" : isToday ? `2px solid ${isDark ? "#475569" : "#cbd5e1"}` : "none",
                      background: isSelected ? "#3b82f6" : "none",
                      color: isSelected ? "#fff" : text,
                      cursor: "pointer", fontSize: 13, fontWeight: isToday ? 700 : 400,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 1, padding: 0,
                    }}>
                    <span>{day}</span>
                    {dot && <span style={{ width: 5, height: 5, borderRadius: "50%", background: dot, display: "block" }} />}
                  </button>
                );
              })}
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 12, justifyContent: "center" }}>
              {[["#10b981","≥80%"],["#f59e0b","50-79%"],["#ef4444","<50%"]].map(([c, l]) => (
                <div key={l} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: muted }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: c, display: "inline-block" }} />
                  {l}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Add Exercise Form ─────────────────────────────────────────────────────────
function AddExerciseForm({ dayOfWeek, onAdd, onClose, isDark }) {
  const [muscleGroup, setMuscleGroup] = useState("");
  const [exerciseName, setExerciseName] = useState("");
  const [targetSets, setTargetSets] = useState(3);
  const [targetReps, setTargetReps] = useState("8-12");
  const [loading, setLoading] = useState(false);

  const border = isDark ? "#334155" : "#e2e8f0";
  const bg     = isDark ? "#1e293b" : "#f8fafc";
  const text   = isDark ? "#e2e8f0" : "#1e293b";
  const input  = isDark ? "#0f172a" : "#ffffff";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!muscleGroup.trim() || !exerciseName.trim()) return;
    setLoading(true);
    try {
      const item = await gymReq("/gym/exercises", "POST", {
        dayOfWeek, muscleGroup: muscleGroup.trim(), exerciseName: exerciseName.trim(),
        targetSets, targetReps: targetReps.trim(),
      });
      onAdd(item);
      toast.success("Exercise added!");
      onClose();
    } catch {
      toast.error("Failed to add exercise");
    } finally {
      setLoading(false);
    }
  };

  const inStyle = { width: "100%", background: input, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 10px", color: text, fontSize: 14, outline: "none", boxSizing: "border-box" };

  return (
    <form onSubmit={handleSubmit} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontWeight: 600, color: text, fontSize: 14 }}>Add Exercise</span>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={16} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <input style={inStyle} placeholder="Muscle group (e.g. Chest)" value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} required />
        <input style={inStyle} placeholder="Exercise name" value={exerciseName} onChange={e => setExerciseName(e.target.value)} required />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <input style={inStyle} type="number" min={1} max={10} placeholder="Sets" value={targetSets} onChange={e => setTargetSets(Number(e.target.value))} />
        <input style={inStyle} placeholder="Reps (e.g. 8-12)" value={targetReps} onChange={e => setTargetReps(e.target.value)} />
      </div>
      <button type="submit" disabled={loading}
        style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
        {loading ? "Adding…" : "Add Exercise"}
      </button>
    </form>
  );
}

// ── Main GymPage ──────────────────────────────────────────────────────────────
export default function GymPage() {
  const { isDark } = useContext(ThemeContext);
  const navigate   = useNavigate();

  const todayStr = toDateStr(new Date());
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [weekStart, setWeekStart]       = useState(() => toDateStr(getMondayOfWeek(new Date())));
  const [dayData, setDayData]           = useState(null);
  const [loading, setLoading]           = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showAddForm, setShowAddForm]   = useState(false);
  const [aiLoading, setAiLoading]       = useState(false);
  const [aiText, setAiText]             = useState("");
  const [noteEditing, setNoteEditing]   = useState({}); // exerciseId → draft text

  // Theme tokens
  const bg       = isDark ? "#0f172a" : "#f1f5f9";
  const card     = isDark ? "#1e293b" : "#ffffff";
  const border   = isDark ? "#334155" : "#e2e8f0";
  const text      = isDark ? "#e2e8f0" : "#1e293b";
  const muted    = isDark ? "#94a3b8" : "#64748b";
  const accent   = "#3b82f6";

  const fetchDay = useCallback((date) => {
    setLoading(true);
    gymReq(`/gym/day?date=${date}`)
      .then(data => setDayData(data))
      .catch(() => toast.error("Failed to load gym data"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchDay(selectedDate); }, [selectedDate, fetchDay]);

  // Week strip dates (7 days from weekStart)
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = parseDate(weekStart);
    d.setDate(d.getDate() + i);
    return toDateStr(d);
  });

  const prevWeek = () => {
    const d = parseDate(weekStart);
    d.setDate(d.getDate() - 7);
    setWeekStart(toDateStr(d));
  };
  const nextWeek = () => {
    const d = parseDate(weekStart);
    d.setDate(d.getDate() + 7);
    setWeekStart(toDateStr(d));
  };

  const selectDate = (date) => {
    setSelectedDate(date);
    const mon = getMondayOfWeek(parseDate(date));
    setWeekStart(toDateStr(mon));
    setAiText("");
    setNoteEditing({});
  };

  // Toggle exercise completion
  const handleToggle = async (exerciseId) => {
    if (!dayData) return;
    const prev = dayData.exercises.map(e => e.id === exerciseId ? { ...e, completed: !e.completed } : e);
    const prevData = dayData;
    setDayData({ ...dayData, exercises: prev, completedExercises: prev.filter(e => e.completed).length });
    try {
      await gymReq("/gym/toggle", "POST", { date: selectedDate, exerciseId });
    } catch {
      setDayData(prevData);
      toast.error("Failed to save");
    }
  };

  // Save note
  const handleSaveNote = async (exerciseId) => {
    const note = noteEditing[exerciseId] ?? "";
    try {
      await gymReq("/gym/note", "POST", { date: selectedDate, exerciseId, note });
      setDayData(prev => ({
        ...prev,
        exercises: prev.exercises.map(e => e.id === exerciseId ? { ...e, note } : e),
      }));
      setNoteEditing(prev => { const n = { ...prev }; delete n[exerciseId]; return n; });
      toast.success("Note saved!");
    } catch {
      toast.error("Failed to save note");
    }
  };

  const handleDelete = async (exerciseId) => {
    if (!window.confirm("Delete this exercise?")) return;
    try {
      await gymReq(`/gym/exercises/${exerciseId}`, "DELETE");
      setDayData(prev => ({
        ...prev,
        exercises: prev.exercises.filter(e => e.id !== exerciseId),
        totalExercises: prev.totalExercises - 1,
        completedExercises: prev.completedExercises - (prev.exercises.find(e => e.id === exerciseId)?.completed ? 1 : 0),
      }));
      toast.success("Exercise deleted");
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleAddExercise = (item) => {
    if (!dayData) return;
    setDayData(prev => ({
      ...prev,
      exercises: [...prev.exercises, { ...item, completed: false, note: "" }],
      totalExercises: prev.totalExercises + 1,
    }));
  };

  // AI coach
  const handleAiCoach = async () => {
    setAiLoading(true);
    setAiText("");
    try {
      const weekRows = await gymReq(`/gym/week?startDate=${weekStart}`);
      const selDate  = parseDate(selectedDate);
      const dow      = selDate.getDay(); // 0=Sun…6=Sat
      const dayName  = DAY_LONG[dow];
      const exercises = dayData?.exercises || [];
      const completed = exercises.filter(e => e.completed).length;
      const total     = exercises.length;
      const missed    = exercises.filter(e => !e.completed).map(e => e.exerciseName).join(", ");
      const notes     = exercises.filter(e => e.note).map(e => `${e.exerciseName}: ${e.note}`).join("; ");

      const weekSummary = weekRows.map(d => {
        const dn = DAY_LONG[parseDate(d.date).getDay()];
        return `${dn}: ${d.completedExercises}/${d.totalExercises}`;
      }).join(", ");

      const prompt = `You are a professional fitness coach. Here is the user's gym progress:

Today (${dayName}, ${selectedDate}): Completed ${completed} of ${total} exercises.
${missed ? `Missed: ${missed}.` : "All exercises done!"}
${notes ? `Logged weights/reps: ${notes}.` : ""}

This week's completion: ${weekSummary}

Provide:
1. A short motivational comment on today's session
2. Tips for any missed exercises or form notes
3. Recovery suggestions if it's a rest day or workout was incomplete
4. 2-3 nutrition tips for muscle gain and recovery (protein, creatine, sleep)
Keep it concise and actionable.`;

      const result = await chatWithAi([{ role: "user", content: prompt }]);
      setAiText(result.text);
    } catch (err) {
      toast.error(err.message || "AI coach failed");
    } finally {
      setAiLoading(false);
    }
  };

  // Group exercises by muscle group
  const byMuscle = {};
  (dayData?.exercises || []).forEach(ex => {
    if (!byMuscle[ex.muscleGroup]) byMuscle[ex.muscleGroup] = [];
    byMuscle[ex.muscleGroup].push(ex);
  });

  const isRestDay = dayData && REST_DAYS.has(dayData.dayOfWeek);
  const progress  = dayData && dayData.totalExercises > 0
    ? Math.round((dayData.completedExercises / dayData.totalExercises) * 100)
    : 0;

  const selDow = parseDate(selectedDate).getDay();
  const selDayName = DAY_LONG[selDow];

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text }}>
      {/* Header */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: text, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <Dumbbell size={20} color="#3b82f6" />
        <span style={{ fontWeight: 700, fontSize: 18 }}>Gym Tracker</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowCalendar(true)}
          style={{ background: "none", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: text, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <Calendar size={15} /> Calendar
        </button>
        <button onClick={() => fetchDay(selectedDate)}
          style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 6 }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "16px 12px" }}>

        {/* Week Strip */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "12px 10px", marginBottom: 16, display: "flex", alignItems: "center", gap: 6 }}>
          <button onClick={prevWeek} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 4 }}><ChevronLeft size={18} /></button>
          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 3 }}>
            {weekDates.map(date => {
              const d = parseDate(date);
              const dow = d.getDay();
              const isSelected = date === selectedDate;
              const isToday    = date === todayStr;
              const dowJava    = dow === 0 ? 7 : dow;
              const isRest     = REST_DAYS.has(dowJava);
              return (
                <button key={date} onClick={() => selectDate(date)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
                    padding: "6px 2px", borderRadius: 10, border: isSelected ? `2px solid ${accent}` : isToday ? `2px solid ${isDark ? "#475569" : "#cbd5e1"}` : "none",
                    background: isSelected ? accent : "none",
                    cursor: "pointer", transition: "all 0.15s",
                  }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: isSelected ? "#fff" : muted }}>{DAY_SHORT[dow]}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: isSelected ? "#fff" : text }}>{d.getDate()}</span>
                  {isRest
                    ? <span style={{ fontSize: 9, color: isSelected ? "#bfdbfe" : muted }}>REST</span>
                    : <span style={{ width: 5, height: 5, borderRadius: "50%", background: isSelected ? "rgba(255,255,255,0.5)" : "#3b82f6" }} />
                  }
                </button>
              );
            })}
          </div>
          <button onClick={nextWeek} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 4 }}><ChevronRight size={18} /></button>
        </div>

        {/* Day Header */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "14px 16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{selDayName}, {MONTH_LONG[parseDate(selectedDate).getMonth()].slice(0,3)} {parseDate(selectedDate).getDate()}</div>
            {isRestDay
              ? <div style={{ fontSize: 13, color: "#10b981", marginTop: 2 }}>Rest Day — Recover & Stretch</div>
              : dayData && <div style={{ fontSize: 13, color: muted, marginTop: 2 }}>{dayData.completedExercises} / {dayData.totalExercises} exercises done</div>
            }
          </div>
          {!isRestDay && dayData && dayData.totalExercises > 0 && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
              <div style={{ width: 50, height: 50, borderRadius: "50%", border: `3px solid ${border}`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="50" height="50" style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
                  <circle cx="25" cy="25" r="22" fill="none" stroke={border} strokeWidth="3" />
                  <circle cx="25" cy="25" r="22" fill="none" stroke={progress >= 100 ? "#10b981" : accent} strokeWidth="3"
                    strokeDasharray={`${2 * Math.PI * 22}`}
                    strokeDashoffset={`${2 * Math.PI * 22 * (1 - progress / 100)}`}
                    strokeLinecap="round" />
                </svg>
                <span style={{ fontSize: 12, fontWeight: 700, color: text, zIndex: 1 }}>{progress}%</span>
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div style={{ textAlign: "center", padding: 40, color: muted }}>Loading…</div>
        )}

        {/* REST Day */}
        {!loading && isRestDay && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 32, textAlign: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>😴</div>
            <div style={{ fontWeight: 700, fontSize: 18, color: "#10b981", marginBottom: 8 }}>Rest Day</div>
            <div style={{ fontSize: 14, color: muted, lineHeight: 1.6 }}>
              Your muscles grow during recovery.<br />
              Light stretching, walking, and good sleep are your goals today.
            </div>
          </div>
        )}

        {/* No exercises */}
        {!loading && !isRestDay && dayData && dayData.totalExercises === 0 && !showAddForm && (
          <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 32, textAlign: "center", marginBottom: 16 }}>
            <Dumbbell size={40} color={muted} style={{ marginBottom: 12 }} />
            <div style={{ fontWeight: 600, color: muted, marginBottom: 8 }}>No exercises for {selDayName}</div>
            <button onClick={() => setShowAddForm(true)}
              style={{ background: accent, color: "#fff", border: "none", borderRadius: 8, padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>
              + Add Exercise
            </button>
          </div>
        )}

        {/* Add Exercise Form */}
        {showAddForm && dayData && (
          <AddExerciseForm
            dayOfWeek={dayData.dayOfWeek}
            onAdd={handleAddExercise}
            onClose={() => setShowAddForm(false)}
            isDark={isDark}
          />
        )}

        {/* Exercise Groups */}
        {!loading && !isRestDay && Object.keys(byMuscle).map(muscle => (
          <div key={muscle} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>
            {/* Muscle group header */}
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: "50%", background: muscleColor(muscle) }} />
              <span style={{ fontWeight: 700, fontSize: 13, color: muscleColor(muscle) }}>{muscle}</span>
              <span style={{ fontSize: 12, color: muted }}>
                {byMuscle[muscle].filter(e => e.completed).length}/{byMuscle[muscle].length} done
              </span>
            </div>

            {byMuscle[muscle].map(ex => {
              const noteStr = noteEditing[ex.id] !== undefined ? noteEditing[ex.id] : ex.note;
              const editingNote = noteEditing[ex.id] !== undefined;
              const isCustom = !ex.id.startsWith("g1m7");
              return (
                <div key={ex.id} style={{ padding: "12px 16px", borderBottom: `1px solid ${border}` }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                    {/* Checkbox */}
                    <button onClick={() => handleToggle(ex.id)}
                      style={{
                        width: 24, height: 24, borderRadius: 6, border: `2px solid ${ex.completed ? muscleColor(muscle) : border}`,
                        background: ex.completed ? muscleColor(muscle) : "none",
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1,
                      }}>
                      {ex.completed && <Check size={14} color="#fff" />}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                        <span style={{ fontWeight: 600, fontSize: 14, color: ex.completed ? muted : text, textDecoration: ex.completed ? "line-through" : "none" }}>
                          {ex.exerciseName}
                        </span>
                        <span style={{ fontSize: 12, color: muted, background: isDark ? "#0f172a" : "#f1f5f9", padding: "2px 8px", borderRadius: 20 }}>
                          {ex.targetSets} × {ex.targetReps}
                        </span>
                      </div>

                      {/* Note section */}
                      <div style={{ marginTop: 8 }}>
                        {editingNote ? (
                          <div style={{ display: "flex", gap: 6 }}>
                            <input
                              value={noteStr}
                              onChange={e => setNoteEditing(prev => ({ ...prev, [ex.id]: e.target.value }))}
                              placeholder="e.g. 60kg × 8, 8, 7"
                              style={{ flex: 1, background: isDark ? "#0f172a" : "#f8fafc", border: `1px solid ${border}`, borderRadius: 6, padding: "4px 8px", color: text, fontSize: 12, outline: "none" }}
                              onKeyDown={e => e.key === "Enter" && handleSaveNote(ex.id)}
                            />
                            <button onClick={() => handleSaveNote(ex.id)}
                              style={{ background: "#10b981", color: "#fff", border: "none", borderRadius: 6, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}>
                              Save
                            </button>
                            <button onClick={() => setNoteEditing(prev => { const n = { ...prev }; delete n[ex.id]; return n; })}
                              style={{ background: "none", border: "none", cursor: "pointer", color: muted }}>
                              <X size={14} />
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setNoteEditing(prev => ({ ...prev, [ex.id]: ex.note || "" }))}
                            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, color: ex.note ? muted : isDark ? "#475569" : "#cbd5e1", fontSize: 12, padding: 0 }}>
                            <FileText size={12} />
                            {ex.note ? ex.note : "Add weight / reps note…"}
                          </button>
                        )}
                      </div>
                    </div>

                    {isCustom && (
                      <button onClick={() => handleDelete(ex.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "#475569" : "#cbd5e1", padding: 4, flexShrink: 0 }}
                        title="Delete custom exercise">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Add Exercise Button */}
        {!loading && !isRestDay && dayData && dayData.totalExercises > 0 && !showAddForm && (
          <button onClick={() => setShowAddForm(true)}
            style={{ width: "100%", background: "none", border: `2px dashed ${border}`, borderRadius: 12, padding: "10px 0", cursor: "pointer", color: muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 16 }}>
            <Plus size={14} /> Add Exercise
          </button>
        )}

        {/* AI Coach */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Bot size={18} color="#8b5cf6" />
            <span style={{ fontWeight: 700, fontSize: 15 }}>AI Fitness Coach</span>
          </div>
          <button onClick={handleAiCoach} disabled={aiLoading}
            style={{ background: aiLoading ? muted : "#8b5cf6", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", cursor: aiLoading ? "not-allowed" : "pointer", fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 8, marginBottom: aiText ? 14 : 0 }}>
            {aiLoading ? <><RefreshCw size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</> : <><Bot size={15} /> Get Coach Feedback</>}
          </button>
          {aiText && (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: text, borderTop: `1px solid ${border}`, paddingTop: 14, whiteSpace: "pre-wrap" }}>
              {aiText}
            </div>
          )}
        </div>
      </div>

      {showCalendar && (
        <CalendarModal
          selectedDate={selectedDate}
          onSelect={selectDate}
          onClose={() => setShowCalendar(false)}
          isDark={isDark}
        />
      )}

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
