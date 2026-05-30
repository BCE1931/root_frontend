import React, { useState, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ThemeContext } from "./ThemeContext";
import {
  ChevronLeft, ChevronRight, Check, ArrowLeft,
  Wallet, RefreshCw, Plus, X, Trash2, TrendingUp, TrendingDown, BarChart2,
} from "lucide-react";
import { toast } from "react-toastify";

const API_BASE = "https://root-backend-2.onrender.com/api";
const MONTH_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAY_SHORT  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

async function moneyReq(path, method = "GET", body) {
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
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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
function formatRupee(n) { return `₹${n.toLocaleString("en-IN")}`; }
function weekLabel(ws) {
  const d = parseDate(ws);
  const end = new Date(d); end.setDate(end.getDate() + 6);
  return `${MONTH_LONG[d.getMonth()].slice(0,3)} ${d.getDate()} – ${end.getDate()}`;
}

// ── Add Item Form ─────────────────────────────────────────────────────────────
function AddItemForm({ onAdd, onClose, isDark, weekStart, isCustom }) {
  const [itemName, setItemName]     = useState("");
  const [category, setCategory]     = useState("Groceries");
  const [estimated, setEstimated]   = useState("");
  const [actual, setActual]         = useState("");
  const [bought, setBought]         = useState(false);
  const [loading, setLoading]       = useState(false);

  const border = isDark ? "#334155" : "#e2e8f0";
  const bg     = isDark ? "#1e293b" : "#f8fafc";
  const text   = isDark ? "#e2e8f0" : "#1e293b";
  const input  = isDark ? "#0f172a" : "#ffffff";
  const inStyle = { width: "100%", background: input, border: `1px solid ${border}`, borderRadius: 8, padding: "8px 10px", color: text, fontSize: 14, outline: "none", boxSizing: "border-box" };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!itemName.trim()) return;
    setLoading(true);
    try {
      if (isCustom) {
        const item = await moneyReq("/money/custom", "POST", {
          weekStart,
          itemName: itemName.trim(),
          category: category.trim() || "Other",
          estimatedCost: parseInt(estimated) || 0,
          actualCost: parseInt(actual) || 0,
          bought,
        });
        onAdd(item);
      } else {
        const item = await moneyReq("/money/items", "POST", {
          itemName: itemName.trim(),
          category: category.trim() || "Groceries",
          estimatedCost: parseInt(estimated) || 0,
        });
        onAdd(item);
      }
      toast.success("Added!");
      onClose();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: bg, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
        <span style={{ fontWeight: 600, color: text, fontSize: 14 }}>
          {isCustom ? "Add One-Time Expense (this week)" : "Add Recurring Weekly Item"}
        </span>
        <button type="button" onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={16} /></button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
        <input style={inStyle} placeholder="Item name *" value={itemName} onChange={e => setItemName(e.target.value)} required />
        <input style={inStyle} placeholder="Category (e.g. Groceries)" value={category} onChange={e => setCategory(e.target.value)} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: isCustom ? "1fr 1fr 1fr" : "1fr 1fr", gap: 8, marginBottom: 12 }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: text, fontSize: 13 }}>₹</span>
          <input style={{ ...inStyle, paddingLeft: 22 }} type="number" min={0} placeholder="Est. cost" value={estimated} onChange={e => setEstimated(e.target.value)} />
        </div>
        {isCustom && (
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: text, fontSize: 13 }}>₹</span>
            <input style={{ ...inStyle, paddingLeft: 22 }} type="number" min={0} placeholder="Actual cost" value={actual} onChange={e => setActual(e.target.value)} />
          </div>
        )}
        {isCustom && (
          <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: text, fontSize: 13 }}>
            <input type="checkbox" checked={bought} onChange={e => setBought(e.target.checked)} />
            Already bought
          </label>
        )}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="submit" disabled={loading}
          style={{ background: isCustom ? "#f59e0b" : "#3b82f6", color: "#fff", border: "none", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 600, fontSize: 14 }}>
          {loading ? "Adding…" : isCustom ? "Add Expense" : "Add to Weekly List"}
        </button>
        <button type="button" onClick={onClose}
          style={{ background: "none", border: `1px solid ${border}`, borderRadius: 8, padding: "8px 14px", cursor: "pointer", color: text, fontSize: 14 }}>
          Cancel
        </button>
      </div>
    </form>
  );
}

// ── Monthly Summary Modal ─────────────────────────────────────────────────────
function MonthModal({ onClose, isDark }) {
  const [ym, setYm] = useState(yearMonth(toDateStr(new Date())));
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);

  const border  = isDark ? "#334155" : "#e2e8f0";
  const bg      = isDark ? "#1e293b" : "#ffffff";
  const text    = isDark ? "#e2e8f0" : "#1e293b";
  const muted   = isDark ? "#94a3b8" : "#64748b";
  const card    = isDark ? "#0f172a" : "#f8fafc";
  const overlay = isDark ? "rgba(0,0,0,0.75)" : "rgba(0,0,0,0.4)";

  useEffect(() => {
    setLoading(true);
    moneyReq(`/money/month?yearMonth=${ym}`)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [ym]);

  const [y, mo] = ym.split("-").map(Number);
  const minYm = "2026-06"; const maxYm = "2026-08";

  const prevMonth = () => {
    const d = new Date(y, mo - 2, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next >= minYm) setYm(next);
  };
  const nextMonth = () => {
    const d = new Date(y, mo, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (next <= maxYm) setYm(next);
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: overlay, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: 16, padding: 24, width: "100%", maxWidth: 460, maxHeight: "90vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart2 size={18} color="#8b5cf6" />
            <span style={{ fontWeight: 700, color: text, fontSize: 16 }}>Monthly Summary</span>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: text }}><X size={18} /></button>
        </div>

        {/* Month nav */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <button onClick={prevMonth} disabled={ym <= minYm}
            style={{ background: "none", border: "none", cursor: "pointer", color: ym <= minYm ? muted : text, padding: 4 }}>
            <ChevronLeft size={18} />
          </button>
          <span style={{ fontWeight: 700, color: text }}>{MONTH_LONG[mo - 1]} {y}</span>
          <button onClick={nextMonth} disabled={ym >= maxYm}
            style={{ background: "none", border: "none", cursor: "pointer", color: ym >= maxYm ? muted : text, padding: 4 }}>
            <ChevronRight size={18} />
          </button>
        </div>

        {loading && <div style={{ textAlign: "center", color: muted, padding: 24 }}>Loading…</div>}
        {!loading && data && (
          <>
            {/* Month total card */}
            <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 12, padding: 16, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, marginBottom: 4 }}>TOTAL BUDGET</div>
                <div style={{ fontWeight: 700, fontSize: 22, color: text }}>{formatRupee(data.monthBudget)}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: muted, fontWeight: 600, marginBottom: 4 }}>TOTAL SPENT</div>
                <div style={{ fontWeight: 700, fontSize: 22, color: data.monthActual > data.monthBudget ? "#ef4444" : "#10b981" }}>
                  {formatRupee(data.monthActual)}
                </div>
              </div>
              <div style={{ gridColumn: "1/-1" }}>
                <div style={{ fontSize: 12, color: muted }}>
                  {data.monthActual <= data.monthBudget
                    ? `Saved ${formatRupee(data.monthBudget - data.monthActual)} this month`
                    : `Over budget by ${formatRupee(data.monthActual - data.monthBudget)}`}
                </div>
              </div>
            </div>

            {/* Per-week rows */}
            {data.weeks.map(w => (
              <div key={w.weekStart} style={{ display: "flex", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: text, fontSize: 13 }}>{weekLabel(w.weekStart)}</div>
                  <div style={{ fontSize: 12, color: muted }}>{w.boughtCount} items bought</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: w.actualSpent > w.budgeted ? "#ef4444" : text }}>
                    {formatRupee(w.actualSpent)}
                  </div>
                  <div style={{ fontSize: 11, color: muted }}>of {formatRupee(w.budgeted)}</div>
                </div>
                {w.actualSpent > 0 && (
                  <div style={{ marginLeft: 8 }}>
                    {w.actualSpent <= w.budgeted
                      ? <TrendingDown size={14} color="#10b981" />
                      : <TrendingUp size={14} color="#ef4444" />}
                  </div>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

// ── Main MoneyPage ────────────────────────────────────────────────────────────
export default function MoneyPage() {
  const { isDark } = useContext(ThemeContext);
  const navigate   = useNavigate();

  const todayMon  = toDateStr(getMondayOfWeek(new Date()));
  const [weekStart, setWeekStart] = useState(todayMon);
  const [weekData, setWeekData]   = useState(null);
  const [loading, setLoading]     = useState(false);
  const [showMonthly, setShowMonthly]   = useState(false);
  const [showAddCustom, setShowAddCustom] = useState(false);
  const [showAddTemplate, setShowAddTemplate] = useState(false);
  const [costDrafts, setCostDrafts] = useState({}); // logId/itemId → draft string
  const [saving, setSaving]         = useState({}); // itemId → bool

  const bg     = isDark ? "#0f172a" : "#f1f5f9";
  const card   = isDark ? "#1e293b" : "#ffffff";
  const border = isDark ? "#334155" : "#e2e8f0";
  const text   = isDark ? "#e2e8f0" : "#1e293b";
  const muted  = isDark ? "#94a3b8" : "#64748b";

  const fetchWeek = useCallback((ws) => {
    setLoading(true);
    moneyReq(`/money/week?weekStart=${ws}`)
      .then(d => { setWeekData(d); setCostDrafts({}); })
      .catch(() => toast.error("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchWeek(weekStart); }, [weekStart, fetchWeek]);

  const prevWeek = () => {
    const d = parseDate(weekStart); d.setDate(d.getDate() - 7);
    setWeekStart(toDateStr(d));
  };
  const nextWeek = () => {
    const d = parseDate(weekStart); d.setDate(d.getDate() + 7);
    setWeekStart(toDateStr(d));
  };

  // Save buy state (checkbox toggle + actual cost)
  const saveBuy = async (item, newBought, newActual) => {
    const key = item.id || item.logId;
    setSaving(prev => ({ ...prev, [key]: true }));
    try {
      const result = await moneyReq("/money/buy", "POST", {
        weekStart,
        itemId: item.id,
        itemName: item.itemName,
        category: item.category,
        estimatedCost: item.estimatedCost,
        actualCost: newActual !== undefined ? newActual : item.actualCost,
        bought: newBought !== undefined ? newBought : item.bought,
      });
      setWeekData(prev => {
        const items = prev.items.map(i =>
          i.id === item.id ? { ...i, bought: result.bought, actualCost: result.actualCost, logId: result.logId, boughtDate: result.boughtDate } : i
        );
        const totalActual = items.filter(i => i.bought).reduce((s, i) => s + i.actualCost, 0);
        const boughtCount = items.filter(i => i.bought).length;
        return { ...prev, items, totalActual, boughtCount };
      });
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(prev => { const n = { ...prev }; delete n[key]; return n; });
    }
  };

  const handleToggle = (item) => {
    const newBought = !item.bought;
    const draft = costDrafts[item.id || item.logId];
    const actualCost = draft !== undefined ? (parseInt(draft) || 0) : item.actualCost;
    saveBuy(item, newBought, actualCost);
  };

  const handleSaveCost = (item) => {
    const key = item.id || item.logId;
    const draft = costDrafts[key];
    if (draft === undefined) return;
    const actualCost = parseInt(draft) || 0;
    saveBuy(item, item.bought, actualCost);
    setCostDrafts(prev => { const n = { ...prev }; delete n[key]; return n; });
  };

  const handleDeleteItem = async (item) => {
    if (!window.confirm(`Delete "${item.itemName}"?`)) return;
    try {
      if (!item.isTemplate && item.logId) {
        await moneyReq(`/money/log/${item.logId}`, "DELETE");
      } else if (item.isTemplate && item.id) {
        await moneyReq(`/money/items/${item.id}`, "DELETE");
      }
      setWeekData(prev => {
        const items = prev.items.filter(i => (i.id || i.logId) !== (item.id || item.logId));
        const totalBudgeted = items.reduce((s, i) => s + i.estimatedCost, 0);
        const totalActual = items.filter(i => i.bought).reduce((s, i) => s + i.actualCost, 0);
        return { ...prev, items, totalBudgeted, totalActual, totalItems: items.length, boughtCount: items.filter(i => i.bought).length };
      });
      toast.success("Deleted");
    } catch { toast.error("Failed to delete"); }
  };

  const handleAddCustom = (item) => {
    setWeekData(prev => {
      if (!prev) return prev;
      const newItem = { id: null, logId: item.logId, itemName: item.itemName, category: item.category, estimatedCost: item.estimatedCost, actualCost: item.actualCost, bought: item.bought, boughtDate: item.boughtDate, isTemplate: false };
      const items = [...prev.items, newItem];
      return { ...prev, items, totalBudgeted: prev.totalBudgeted + newItem.estimatedCost, totalItems: prev.totalItems + 1,
        totalActual: newItem.bought ? prev.totalActual + newItem.actualCost : prev.totalActual,
        boughtCount: newItem.bought ? prev.boughtCount + 1 : prev.boughtCount };
    });
  };

  const handleAddTemplate = (item) => {
    setWeekData(prev => {
      if (!prev) return prev;
      const newItem = { id: item.id, logId: null, itemName: item.itemName, category: item.category, estimatedCost: item.estimatedCost, actualCost: 0, bought: false, isTemplate: true };
      const items = [...prev.items, newItem];
      return { ...prev, items, totalBudgeted: prev.totalBudgeted + newItem.estimatedCost, totalItems: prev.totalItems + 1 };
    });
  };

  // Group by category
  const categories = {};
  (weekData?.items || []).forEach(item => {
    const cat = item.category || "Other";
    if (!categories[cat]) categories[cat] = [];
    categories[cat].push(item);
  });

  const spent   = weekData?.totalActual || 0;
  const budget  = weekData?.totalBudgeted || 0;
  const saved   = budget - spent;
  const boughtN = weekData?.boughtCount || 0;
  const totalN  = weekData?.totalItems || 0;
  const pct     = totalN > 0 ? Math.round((boughtN / totalN) * 100) : 0;

  return (
    <div style={{ minHeight: "100vh", background: bg, color: text }}>
      {/* Header */}
      <div style={{ background: card, borderBottom: `1px solid ${border}`, padding: "12px 20px", display: "flex", alignItems: "center", gap: 12 }}>
        <button onClick={() => navigate("/")} style={{ background: "none", border: "none", cursor: "pointer", color: text, display: "flex", alignItems: "center", gap: 6, padding: "6px 10px", borderRadius: 8 }}>
          <ArrowLeft size={18} /> Back
        </button>
        <Wallet size={20} color="#10b981" />
        <span style={{ fontWeight: 700, fontSize: 18 }}>Money Tracker</span>
        <div style={{ flex: 1 }} />
        <button onClick={() => setShowMonthly(true)}
          style={{ background: "none", border: `1px solid ${border}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", color: text, display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}>
          <BarChart2 size={15} /> Monthly
        </button>
        <button onClick={() => fetchWeek(weekStart)}
          style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 6 }}>
          <RefreshCw size={16} />
        </button>
      </div>

      <div style={{ maxWidth: 680, margin: "0 auto", padding: "16px 12px" }}>

        {/* Week Navigator */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: "12px 16px", marginBottom: 14, display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={prevWeek} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 4 }}><ChevronLeft size={20} /></button>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontWeight: 700, fontSize: 16, color: text }}>
              Week of {weekLabel(weekStart)}
            </div>
            <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
              {boughtN} / {totalN} items bought
            </div>
          </div>
          <button onClick={nextWeek} style={{ background: "none", border: "none", cursor: "pointer", color: muted, padding: 4 }}><ChevronRight size={20} /></button>
        </div>

        {/* Budget Summary Card */}
        <div style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, padding: 16, marginBottom: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: muted, marginBottom: 4 }}>BUDGET</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: text }}>{formatRupee(budget)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: muted, marginBottom: 4 }}>SPENT</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: spent > budget ? "#ef4444" : "#10b981" }}>{formatRupee(spent)}</div>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: muted, marginBottom: 4 }}>{saved >= 0 ? "SAVED" : "OVER"}</div>
              <div style={{ fontWeight: 700, fontSize: 20, color: saved >= 0 ? "#10b981" : "#ef4444" }}>{formatRupee(Math.abs(saved))}</div>
            </div>
          </div>
          {/* Progress bar */}
          <div style={{ background: isDark ? "#0f172a" : "#f1f5f9", borderRadius: 99, height: 8, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#10b981" : "#3b82f6", borderRadius: 99, transition: "width 0.4s" }} />
          </div>
          <div style={{ fontSize: 12, color: muted, marginTop: 6, textAlign: "right" }}>{pct}% bought</div>
        </div>

        {loading && <div style={{ textAlign: "center", padding: 32, color: muted }}>Loading…</div>}

        {/* Add Forms */}
        {showAddCustom && (
          <AddItemForm weekStart={weekStart} isCustom onAdd={handleAddCustom} onClose={() => setShowAddCustom(false)} isDark={isDark} />
        )}
        {showAddTemplate && (
          <AddItemForm weekStart={weekStart} isCustom={false} onAdd={handleAddTemplate} onClose={() => setShowAddTemplate(false)} isDark={isDark} />
        )}

        {/* Shopping List by Category */}
        {!loading && Object.keys(categories).map(cat => (
          <div key={cat} style={{ background: card, border: `1px solid ${border}`, borderRadius: 14, marginBottom: 12, overflow: "hidden" }}>
            <div style={{ padding: "10px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontWeight: 700, fontSize: 13, color: muted }}>{cat}</span>
              <span style={{ fontSize: 12, color: muted }}>
                ({categories[cat].filter(i => i.bought).length}/{categories[cat].length} done ·{" "}
                {formatRupee(categories[cat].filter(i => i.bought).reduce((s, i) => s + i.actualCost, 0))} spent)
              </span>
            </div>

            {categories[cat].map(item => {
              const key = item.id || item.logId;
              const draft = costDrafts[key];
              const displayCost = draft !== undefined ? draft : (item.actualCost || "");
              const isSaving = saving[key];
              const isCustomItem = !item.isTemplate;

              return (
                <div key={key} style={{ padding: "12px 16px", borderBottom: `1px solid ${border}`, display: "flex", alignItems: "center", gap: 12 }}>
                  {/* Checkbox */}
                  <button onClick={() => handleToggle(item)} disabled={isSaving}
                    style={{
                      width: 24, height: 24, borderRadius: 6, flexShrink: 0,
                      border: `2px solid ${item.bought ? "#10b981" : border}`,
                      background: item.bought ? "#10b981" : "none",
                      cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                    {item.bought && <Check size={14} color="#fff" />}
                  </button>

                  {/* Item info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: item.bought ? muted : text, textDecoration: item.bought ? "line-through" : "none" }}>
                      {item.itemName}
                    </div>
                    <div style={{ fontSize: 12, color: muted, marginTop: 2 }}>
                      Est. {formatRupee(item.estimatedCost)}
                      {item.boughtDate && ` · Bought ${item.boughtDate}`}
                    </div>
                  </div>

                  {/* Actual cost input */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ position: "relative", width: 90 }}>
                      <span style={{ position: "absolute", left: 8, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: muted, pointerEvents: "none" }}>₹</span>
                      <input
                        type="number" min={0}
                        placeholder="Actual"
                        value={displayCost}
                        onChange={e => setCostDrafts(prev => ({ ...prev, [key]: e.target.value }))}
                        onKeyDown={e => e.key === "Enter" && handleSaveCost(item)}
                        style={{
                          width: "100%", background: isDark ? "#0f172a" : "#f8fafc",
                          border: `1px solid ${draft !== undefined ? "#3b82f6" : border}`,
                          borderRadius: 8, padding: "5px 6px 5px 22px", color: text,
                          fontSize: 13, outline: "none", boxSizing: "border-box",
                        }}
                      />
                    </div>
                    {draft !== undefined && (
                      <button onClick={() => handleSaveCost(item)}
                        style={{ background: "#3b82f6", color: "#fff", border: "none", borderRadius: 6, padding: "5px 10px", cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
                        Save
                      </button>
                    )}
                  </div>

                  {/* Delete — only for custom or non-seeded template items */}
                  {(isCustomItem || (item.isTemplate && item.id && !item.id.startsWith("m0n3"))) && (
                    <button onClick={() => handleDeleteItem(item)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: isDark ? "#475569" : "#cbd5e1", padding: 4, flexShrink: 0 }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ))}

        {/* Add Buttons */}
        {!loading && !showAddCustom && !showAddTemplate && (
          <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
            <button onClick={() => { setShowAddCustom(true); setShowAddTemplate(false); }}
              style={{ flex: 1, background: "none", border: `2px dashed ${border}`, borderRadius: 12, padding: "10px 0", cursor: "pointer", color: muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={14} /> One-time expense
            </button>
            <button onClick={() => { setShowAddTemplate(true); setShowAddCustom(false); }}
              style={{ flex: 1, background: "none", border: `2px dashed ${border}`, borderRadius: 12, padding: "10px 0", cursor: "pointer", color: muted, fontSize: 13, display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Plus size={14} /> Add to weekly list
            </button>
          </div>
        )}
      </div>

      {showMonthly && <MonthModal onClose={() => setShowMonthly(false)} isDark={isDark} />}
    </div>
  );
}
