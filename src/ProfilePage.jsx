import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile, getDisplayName, getInitial, getAvatarColor } from "./ProfileEditModal";
import {
  ArrowLeft, BookOpen, GraduationCap, RotateCcw, Eye, BarChart2,
  Clock, Check, X, ChevronDown, ChevronUp, Award, ExternalLink,
  MessageSquare, Bot, ChevronRight, Flame, Bell, Search, Layers,
  Zap, Brain, Timer, Download, Star, BookMarked, Layout, Moon,
  Cpu, Sparkles as SparklesIcon, FileText, Play, AlertCircle,
} from "lucide-react";
import { Sparkles, Hash, TrendingUp } from "lucide-react";
import * as storage from "./storage/index.js";
import { getMode, getBackendUrl } from "./storage/index.js";
import { getLocalConvs, getLocalMsgs } from "./AiChatPanel";
import ExamFlow from "./ExamFlow";

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

function formatTime(s) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}m ${sec}s` : `${sec}s`;
}

function ScoreColor(pct) {
  return pct >= 80 ? "#10b981" : pct >= 50 ? "#f59e0b" : "#ef4444";
}

// ── Activity heatmap ───────────────────────────────────────────────────────
function ActivityHeatmap({ visits }) {
  const counts = useMemo(() => {
    const c = {};
    visits.forEach(v => {
      const key = new Date(v.visitedAt).toDateString();
      c[key] = (c[key] || 0) + 1;
    });
    return c;
  }, [visits]);

  const weeks = useMemo(() => {
    const days = [];
    for (let i = 90; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push({ date: d, count: counts[d.toDateString()] || 0 });
    }
    const w = [];
    for (let i = 0; i < days.length; i += 7) w.push(days.slice(i, i + 7));
    return w;
  }, [counts]);

  const level = (n) => n === 0 ? 0 : n <= 2 ? 1 : n <= 5 ? 2 : 3;

  const totalDays = Object.keys(counts).length;
  const totalActs = Object.values(counts).reduce((a, b) => a + b, 0);

  return (
    <div className="ph-heatmap-wrap">
      <div className="ph-heatmap-title">
        <BarChart2 size={13} /> Activity — Last 90 Days
        <span className="ph-heatmap-sub">{totalActs} visits across {totalDays} days</span>
      </div>
      <div className="ph-heatmap-grid">
        {weeks.map((week, wi) => (
          <div key={wi} className="ph-heatmap-col">
            {week.map((day, di) => (
              <div
                key={di}
                className={`ph-heatmap-cell ph-heatmap-l${level(day.count)}`}
                title={`${day.date.toLocaleDateString()}: ${day.count} visit${day.count !== 1 ? "s" : ""}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="ph-heatmap-legend">
        <span>Less</span>
        {[0,1,2,3].map(l => <div key={l} className={`ph-heatmap-cell ph-heatmap-l${l}`} />)}
        <span>More</span>
      </div>
    </div>
  );
}

// ── Streak badge ───────────────────────────────────────────────────────────
function StreakBadge() {
  const data = (() => {
    try { return JSON.parse(localStorage.getItem("streak_data") || "{}"); } catch { return {}; }
  })();
  const count = data.count || 0;
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const active = data.lastDate === today || data.lastDate === yesterday;
  if (!count) return null;
  return (
    <div className={`ph-streak-badge${active ? " active" : ""}`} title="Current learning streak">
      <Flame size={13} />
      <span>{count} day{count !== 1 ? "s" : ""}</span>
    </div>
  );
}

// ── Spaced repetition — due for review ────────────────────────────────────
function DueForReview({ visits }) {
  const dueNodes = useMemo(() => {
    const latest = {};
    visits.forEach(v => {
      if (!latest[v.nodeId] || new Date(v.visitedAt) > new Date(latest[v.nodeId].visitedAt)) {
        latest[v.nodeId] = v;
      }
    });
    const sevenDaysAgo = Date.now() - 7 * 86400000;
    return Object.values(latest)
      .filter(v => new Date(v.visitedAt).getTime() < sevenDaysAgo)
      .sort((a, b) => new Date(a.visitedAt) - new Date(b.visitedAt))
      .slice(0, 8);
  }, [visits]);

  if (!dueNodes.length) return null;

  return (
    <div className="ph-due-section">
      <div className="ph-due-title"><Bell size={13} /> Due for Review <span className="ph-due-count">{dueNodes.length}</span></div>
      <div className="ph-due-list">
        {dueNodes.map(v => (
          <button key={v.nodeId} className="ph-due-item" onClick={() => window.open(`/node/${v.nodeId}`, "_blank")}>
            <AlertCircle size={11} className="ph-due-icon" />
            <span className="ph-due-name">{v.nodeName}</span>
            <span className="ph-due-ago">{timeAgo(v.visitedAt)}</span>
            <ExternalLink size={10} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ── Features page ──────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: <Layers size={18} />,
    title: "Visual Learning Tree",
    desc: "Organize topics in a hierarchical tree. Add root nodes, child nodes, and build your full curriculum visually.",
    color: "#6366f1",
    shortcut: null,
  },
  {
    icon: <Search size={18} />,
    title: "Node Search",
    desc: "Instantly search and jump to any node in your tree by name.",
    color: "#0ea5e9",
    shortcut: "Ctrl + K",
  },
  {
    icon: <SparklesIcon size={18} />,
    title: "AI Explain (per node)",
    desc: "Ask AI any question directly inside a node page. Responses are saved and navigable.",
    color: "#8b5cf6",
    shortcut: null,
  },
  {
    icon: <Bot size={18} />,
    title: "AI Chat Panel",
    desc: "Multi-turn AI conversations using GPT-4o (free via Puter), Google Gemini, or OpenRouter (DeepSeek, Llama).",
    color: "#6366f1",
    shortcut: null,
  },
  {
    icon: <Play size={18} />,
    title: "Exam Mode",
    desc: "Take AI-generated MCQ quizzes on any node. Choose difficulty and number of questions. Results saved in history.",
    color: "#f59e0b",
    shortcut: null,
  },
  {
    icon: <FileText size={18} />,
    title: "Flashcard Mode",
    desc: "Review all nodes in a flashcard format to reinforce memory.",
    color: "#10b981",
    shortcut: null,
  },
  {
    icon: <Clock size={18} />,
    title: "Study Timer",
    desc: "Track how long you study each node. Timer auto-saves on pause/exit.",
    color: "#f97316",
    shortcut: null,
  },
  {
    icon: <Timer size={18} />,
    title: "Pomodoro Timer",
    desc: "25-minute focus sessions with 5-minute breaks. Browser notifications when sessions complete. Tracks session count.",
    color: "#ef4444",
    shortcut: null,
  },
  {
    icon: <BarChart2 size={18} />,
    title: "Progress Dashboard",
    desc: "Visual progress overview showing completion rates, study time, and node breakdown.",
    color: "#06b6d4",
    shortcut: null,
  },
  {
    icon: <Flame size={18} />,
    title: "Learning Streaks",
    desc: "Daily learning streaks tracked whenever you mark a node complete. Keep your streak alive!",
    color: "#f97316",
    shortcut: null,
  },
  {
    icon: <BarChart2 size={18} />,
    title: "Activity Heatmap",
    desc: "90-day GitHub-style heatmap of your node visit activity visible in your Profile.",
    color: "#10b981",
    shortcut: null,
  },
  {
    icon: <Bell size={18} />,
    title: "Spaced Repetition",
    desc: "Profile shows nodes you haven't visited in 7+ days so you know exactly what to review next.",
    color: "#f59e0b",
    shortcut: null,
  },
  {
    icon: <Brain size={18} />,
    title: "Difficulty Tags",
    desc: "Mark any node as Easy, Medium, or Hard to prioritize your study sessions.",
    color: "#8b5cf6",
    shortcut: null,
  },
  {
    icon: <Star size={18} />,
    title: "Pin AI Answers",
    desc: "Pin any AI chat reply as a note — saved to localStorage so you can reference it later.",
    color: "#eab308",
    shortcut: null,
  },
  {
    icon: <BookMarked size={18} />,
    title: "Node History",
    desc: "Every node visit is logged. See your full visit timeline in your Profile.",
    color: "#6366f1",
    shortcut: null,
  },
  {
    icon: <Layout size={18} />,
    title: "Horizontal / Vertical Tree",
    desc: "Switch between horizontal and vertical tree layouts to suit your preference.",
    color: "#0ea5e9",
    shortcut: null,
  },
  {
    icon: <Moon size={18} />,
    title: "Dark / Light Mode",
    desc: "Toggle between dark and light themes from the header.",
    color: "#64748b",
    shortcut: null,
  },
  {
    icon: <Cpu size={18} />,
    title: "Multiple AI Providers",
    desc: "Choose between Puter (GPT-4o, free), Google Gemini (API key), and OpenRouter (DeepSeek, Llama). Configure in AI Models page.",
    color: "#8b5cf6",
    shortcut: null,
  },
  {
    icon: <Zap size={18} />,
    title: "Multiple Topics",
    desc: "Create multiple learning trees (e.g., AI, Java, Python). Switch between them instantly.",
    color: "#f59e0b",
    shortcut: null,
  },
  {
    icon: <Download size={18} />,
    title: "Export Tree",
    desc: "Copy your entire tree as JSON to clipboard for backup or sharing.",
    color: "#10b981",
    shortcut: null,
  },
];

function FeaturesPage() {
  return (
    <div className="ph-features-page">
      <div className="ph-features-hero">
        <h2 className="ph-features-title">Everything in TreeFlow</h2>
        <p className="ph-features-sub">Your personal AI-powered learning tracker — built to help you learn faster and remember longer.</p>
      </div>
      <div className="ph-features-grid">
        {FEATURES.map((f, i) => (
          <div key={i} className="ph-feature-card">
            <div className="ph-feature-icon" style={{ background: `${f.color}18`, color: f.color }}>{f.icon}</div>
            <div className="ph-feature-body">
              <div className="ph-feature-name">
                {f.title}
                {f.shortcut && <span className="ph-feature-kbd">{f.shortcut}</span>}
              </div>
              <div className="ph-feature-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Stats modal ────────────────────────────────────────────────────────────
function StatsModal({ exam, onClose }) {
  const pct = exam.percentage;
  const color = ScoreColor(pct);
  return (
    <div className="ph-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ph-modal">
        <div className="ph-modal-hdr">
          <span className="ph-modal-title">Exam Stats</span>
          <button className="ph-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ph-modal-body">
          <p className="ph-modal-topic">{exam.nodeName}</p>
          <div className="ph-score-circle" style={{ "--score-color": color }}>
            <span className="ph-score-num">{exam.score}</span>
            <span className="ph-score-denom">/ {exam.numQuestions}</span>
          </div>
          <div className="ph-score-pct" style={{ color }}>{pct}%</div>
          <div className="ph-score-label">
            {pct >= 80 ? "Excellent!" : pct >= 60 ? "Good job!" : pct >= 40 ? "Keep practicing" : "Needs more study"}
          </div>
          <div className="ph-stats-row">
            <div className="ph-stat"><span className="ph-stat-val" style={{ color: "#10b981" }}>{exam.score}</span><span className="ph-stat-lbl">Correct</span></div>
            <div className="ph-stat"><span className="ph-stat-val" style={{ color: "#ef4444" }}>{exam.numQuestions - exam.score}</span><span className="ph-stat-lbl">Wrong</span></div>
            <div className="ph-stat"><span className="ph-stat-val">{formatTime(exam.timeTakenSecs)}</span><span className="ph-stat-lbl">Time</span></div>
            <div className="ph-stat"><span className={`ph-stat-val exam-diff-badge exam-diff-${exam.difficulty}`}>{exam.difficulty}</span><span className="ph-stat-lbl">Difficulty</span></div>
          </div>
          <p className="ph-stat-date">{new Date(exam.createdAt).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

// ── Questions modal ────────────────────────────────────────────────────────
function QuestionsModal({ exam, onClose }) {
  const questions = (() => {
    try { return JSON.parse(exam.questionsJson || "[]"); } catch { return []; }
  })();
  const [open, setOpen] = useState({});

  if (!questions.length) return (
    <div className="ph-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ph-modal">
        <div className="ph-modal-hdr">
          <span className="ph-modal-title">Questions</span>
          <button className="ph-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <p style={{ padding: "24px", textAlign: "center", color: "var(--text-secondary)" }}>No questions stored for this exam.</p>
      </div>
    </div>
  );

  return (
    <div className="ph-modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="ph-modal ph-modal-wide">
        <div className="ph-modal-hdr">
          <span className="ph-modal-title">Questions — {exam.nodeName}</span>
          <button className="ph-modal-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="ph-modal-body ph-qlist">
          {questions.map((q, i) => (
            <div key={i} className="ph-q-item">
              <button className="ph-q-toggle" onClick={() => setOpen(p => ({ ...p, [i]: !p[i] }))}>
                <span className="ph-q-num">Q{i + 1}</span>
                <span className="ph-q-text">{q.question}</span>
                <span className="ph-q-correct-badge">✓ {q.correct}</span>
                {open[i] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
              {open[i] && (
                <div className="ph-q-body">
                  {q.options.map((opt, oi) => {
                    const letter = ["A","B","C","D"][oi];
                    return (
                      <div key={letter} className={`ph-q-opt${letter === q.correct ? " ph-q-opt-correct" : ""}`}>
                        <span className="ph-q-opt-letter">{letter}</span>
                        <span>{opt.slice(3)}</span>
                        {letter === q.correct && <Check size={13} style={{ marginLeft: "auto", color: "#10b981" }} />}
                      </div>
                    );
                  })}
                  {q.explanation && <p className="ph-q-expl">{q.explanation}</p>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main ProfilePage ───────────────────────────────────────────────────────
export default function ProfilePage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const profile     = getProfile();
  const displayName = getDisplayName(profile);
  const initial     = getInitial(profile);
  const avatarColor = getAvatarColor(profile);

  const [filter, setFilter] = useState(() => {
    const tab = searchParams.get("tab");
    return ["visits","exams","ai","chat","features"].includes(tab) ? tab : "all";
  });
  const [exams,      setExams]      = useState([]);
  const [visits,     setVisits]     = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [aiStats,    setAiStats]    = useState(null);
  const [aiHistory,  setAiHistory]  = useState([]);
  const [chatConvs,  setChatConvs]  = useState([]);
  const [expandedConv, setExpandedConv] = useState(null);
  const [convMsgs,   setConvMsgs]   = useState({});

  const [statsExam,     setStatsExam]     = useState(null);
  const [questionsExam, setQuestionsExam] = useState(null);
  const [reattemptExam, setReattemptExam] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [e, v, ai, aiHist] = await Promise.all([
      storage.getNodeExamHistory(null).catch(() => []),
      storage.getVisitHistory(500).catch(() => []),
      storage.getAiStats().catch(() => null),
      storage.getAiResponses(null).catch(() => []),
    ]);
    setExams(e); setVisits(v); setAiStats(ai); setAiHistory(aiHist);

    if (getMode() === "backend") {
      try {
        const res = await fetch(`${getBackendUrl()}/chats`);
        if (res.ok) { setChatConvs(await res.json()); setLoading(false); return; }
      } catch {}
    }
    setChatConvs(getLocalConvs());
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const loadConvMessages = useCallback(async (id) => {
    if (convMsgs[id]) { setExpandedConv(prev => prev === id ? null : id); return; }
    if (getMode() === "backend") {
      try {
        const res = await fetch(`${getBackendUrl()}/chats/${id}/messages`);
        if (res.ok) {
          const data = await res.json();
          setConvMsgs(prev => ({ ...prev, [id]: data }));
          setExpandedConv(id);
          return;
        }
      } catch {}
    }
    const msgs = getLocalMsgs(id);
    setConvMsgs(prev => ({ ...prev, [id]: msgs }));
    setExpandedConv(prev => prev === id ? null : id);
  }, [convMsgs]);

  const timeline = (() => {
    const items = [];
    if (filter !== "exams" && filter !== "ai")
      visits.forEach(v => items.push({ type: "visit", date: v.visitedAt, data: v }));
    if (filter !== "visits" && filter !== "ai")
      exams.forEach(e => items.push({ type: "exam", date: e.createdAt, data: e }));
    if (filter !== "exams" && filter !== "visits")
      aiHistory.forEach(a => items.push({ type: "ai", date: a.createdAt, data: a }));
    return items.sort((a, b) => new Date(b.date) - new Date(a.date));
  })();

  const totalExams = exams.length;
  const avgScore   = totalExams ? Math.round(exams.reduce((s, e) => s + e.percentage, 0) / totalExams) : 0;

  const aiDailyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const count = aiHistory.filter(a => new Date(a.createdAt).toDateString() === key).length;
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), count });
    }
    return days;
  }, [aiHistory]);
  const aiChartMax = Math.max(...aiDailyData.map(d => d.count), 1);

  const TABS = [
    ["all",      "All"],
    ["visits",   "Node Visits"],
    ["exams",    "Exams"],
    ["ai",       "AI Asks"],
    ["chat",     "Chat History"],
    ["features", "Features"],
  ];

  return (
    <div className="ph-page">
      <div className="ph-topbar">
        <button className="ph-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Back
        </button>
        <span className="ph-topbar-title">Profile & History</span>
      </div>

      <div className="ph-layout">

        {/* ── LEFT SIDEBAR ── */}
        <div className="ph-sidebar">

          {/* User card */}
          <div className="ph-user-card">
            <div className="ph-user-avatar" style={{ background: avatarColor }}>{initial}</div>
            <div className="ph-user-info">
              <div className="ph-user-name-row">
                <div className="ph-user-name">{displayName}</div>
                <StreakBadge />
              </div>
              <div className="ph-user-email">{profile.email || "sasankreddy2211@gmail.com"}</div>
              {profile.bio && <div className="ph-user-bio">{profile.bio}</div>}
            </div>
            <div className="ph-user-stats">
              <div className="ph-ustat"><span className="ph-ustat-val">{totalExams}</span><span className="ph-ustat-lbl">Exams</span></div>
              <div className="ph-ustat"><span className="ph-ustat-val">{avgScore}%</span><span className="ph-ustat-lbl">Avg</span></div>
              <div className="ph-ustat"><span className="ph-ustat-val">{visits.length}</span><span className="ph-ustat-lbl">Visits</span></div>
            </div>
          </div>

          {/* Activity heatmap */}
          {!loading && visits.length > 0 && <ActivityHeatmap visits={visits} />}

          {/* Due for review */}
          {!loading && visits.length > 0 && <DueForReview visits={visits} />}

          {/* AI Usage */}
          {aiStats && (
            <div className="ph-ai-stats-card">
              <div className="ph-ai-stats-title"><Sparkles size={13} /> AI Usage</div>
              <div className="ph-ai-stats-row">
                <div className="ph-ai-stat"><span className="ph-ai-val">{aiStats.totalCalls || 0}</span><span className="ph-ai-lbl">Asks</span></div>
                <div className="ph-ai-stat"><span className="ph-ai-val">{((aiStats.totalInputTokens || 0) + (aiStats.totalOutputTokens || 0)).toLocaleString()}</span><span className="ph-ai-lbl">Tokens</span></div>
              </div>
              {aiStats.topNodes?.length > 0 && (
                <div className="ph-ai-top">
                  <span className="ph-ai-top-label"><TrendingUp size={11} /> Most explored:</span>
                  {aiStats.topNodes.slice(0, 4).map((n, i) => (
                    <button key={i} className="ph-ai-top-node ph-ai-top-link" onClick={() => window.open(`/node/${n.nodeId || n.node_id}`, "_blank")}>
                      {n.nodeName || n.node_name}
                      <span className="ph-ai-top-cnt">({n.cnt || n.count || 0}×)</span>
                      <ExternalLink size={9} />
                    </button>
                  ))}
                </div>
              )}
              {aiHistory.length > 0 && (
                <div className="ph-ai-chart">
                  <div className="ph-ai-chart-title"><BarChart2 size={12} /> Last 7 Days</div>
                  <div className="ph-ai-bars">
                    {aiDailyData.map((d, i) => (
                      <div key={i} className="ph-ai-bar-col">
                        {d.count > 0 && <div className="ph-ai-bar-count">{d.count}</div>}
                        <div className="ph-ai-bar-wrap">
                          <div className="ph-ai-bar" style={{ height: `${Math.max(d.count > 0 ? 6 : 2, Math.round((d.count / aiChartMax) * 60))}px` }} />
                        </div>
                        <div className="ph-ai-bar-day">{d.label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT MAIN ── */}
        <div className="ph-main">

          {/* Filter tabs */}
          <div className="ph-filter-row">
            {TABS.map(([val, label]) => (
              <button key={val} className={`ph-filter-btn${filter === val ? " active" : ""}`} onClick={() => setFilter(val)}>{label}</button>
            ))}
          </div>

          {/* Features tab */}
          {filter === "features" ? <FeaturesPage /> :

          /* Chat History tab */
          filter === "chat" ? (
            loading ? (
              <div className="ph-loading"><div className="loading-spinner" /><p>Loading…</p></div>
            ) : chatConvs.length === 0 ? (
              <div className="ph-empty">No chat conversations yet. Open the AI Chat panel to start!</div>
            ) : (
              <div className="ph-chat-list">
                {chatConvs.map(c => (
                  <div key={c.id} className="ph-chat-conv">
                    <button className="ph-chat-conv-hdr" onClick={() => loadConvMessages(c.id)}>
                      <div className="ph-chat-conv-icon"><MessageSquare size={15} /></div>
                      <div className="ph-chat-conv-info">
                        <span className="ph-chat-conv-title">{c.title}</span>
                        <span className="ph-chat-conv-meta">
                          {c.messageCount > 0 ? `${c.messageCount} messages · ` : ""}
                          {c.updatedAt ? new Date(c.updatedAt).toLocaleString() : new Date(c.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <ChevronRight size={14} className={`ph-chat-conv-chevron${expandedConv === c.id ? " rotated" : ""}`} />
                    </button>
                    {expandedConv === c.id && (
                      <div className="ph-chat-messages">
                        {(convMsgs[c.id] || []).length === 0 ? (
                          <div className="ph-chat-empty">No messages in this conversation.</div>
                        ) : (
                          (convMsgs[c.id] || []).map((m, i) => (
                            <div key={m.id || i} className={`ph-chat-msg ph-chat-msg-${m.role}`}>
                              <div className="ph-chat-msg-role">
                                {m.role === "assistant" ? <Bot size={12} /> : <span>You</span>}
                              </div>
                              <div className="ph-chat-msg-content">{m.content}</div>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          ) : (
            /* Timeline */
            loading ? (
              <div className="ph-loading"><div className="loading-spinner" /><p>Loading history…</p></div>
            ) : timeline.length === 0 ? (
              <div className="ph-empty">No history yet. Start exploring nodes and taking exams!</div>
            ) : (
              <div className="ph-timeline">
                {timeline.map((item, i) =>
                  item.type === "visit"
                    ? <VisitItem key={`v-${i}`} data={item.data} />
                    : item.type === "ai"
                      ? <AiItem key={`a-${i}`} data={item.data} />
                      : <ExamItem key={`e-${i}`} data={item.data}
                          onStats={() => setStatsExam(item.data)}
                          onQuestions={() => setQuestionsExam(item.data)}
                          onReattempt={() => setReattemptExam(item.data)}
                        />
                )}
              </div>
            )
          )}
        </div>
      </div>

      {statsExam     && <StatsModal     exam={statsExam}     onClose={() => setStatsExam(null)} />}
      {questionsExam && <QuestionsModal exam={questionsExam} onClose={() => setQuestionsExam(null)} />}
      {reattemptExam && (() => {
        const qs = (() => { try { return JSON.parse(reattemptExam.questionsJson || "[]"); } catch { return []; } })();
        const fakeNode = { id: reattemptExam.nodeId, text: reattemptExam.nodeName, children: [], description: "" };
        return (
          <ExamFlow
            node={fakeNode}
            onClose={() => setReattemptExam(null)}
            autoStart={{ difficulty: reattemptExam.difficulty, numQ: reattemptExam.numQuestions, questions: qs }}
          />
        );
      })()}
    </div>
  );
}

function VisitItem({ data }) {
  return (
    <div className="ph-item ph-item-visit">
      <div className="ph-item-icon"><BookOpen size={15} /></div>
      <div className="ph-item-body">
        <button className="ph-item-node-link" onClick={() => window.open(`/node/${data.nodeId}`, "_blank")}>
          {data.nodeName} <ExternalLink size={11} />
        </button>
        <span className="ph-item-meta">Visited node</span>
      </div>
      <span className="ph-item-time">{timeAgo(data.visitedAt)}</span>
    </div>
  );
}

function AiItem({ data }) {
  return (
    <div className="ph-item ph-item-ai">
      <div className="ph-item-icon" style={{ color: "#8b5cf6" }}><Sparkles size={15} /></div>
      <div className="ph-item-body">
        <button className="ph-item-node-link" onClick={() => window.open(`/node/${data.nodeId}`, "_blank")}>
          {data.nodeName} <ExternalLink size={11} />
        </button>
        <div className="ph-item-meta-row">
          <span className="ph-item-meta"><Cpu size={11} /> {data.model || "mistral"}</span>
          {data.inputTokens > 0 && (
            <span className="ph-item-meta"><Hash size={11} /> {data.inputTokens} in · {data.outputTokens} out</span>
          )}
        </div>
      </div>
      <span className="ph-item-time">{timeAgo(data.createdAt)}</span>
    </div>
  );
}

function ExamItem({ data, onStats, onQuestions, onReattempt }) {
  const pct = data.percentage;
  const color = ScoreColor(pct);
  const hasQs = !!data.questionsJson;
  const passLabel = pct >= 80 ? "Excellent" : pct >= 60 ? "Good" : pct >= 40 ? "Fair" : "Poor";
  return (
    <div className="ph-item ph-item-exam">
      <div className="ph-item-icon" style={{ color: "#8b5cf6" }}><GraduationCap size={15} /></div>
      <div className="ph-item-body">
        <div className="ph-item-title-row">
          <button className="ph-item-node-link" onClick={() => window.open(`/node/${data.nodeId}`, "_blank")}>
            {data.nodeName} <ExternalLink size={11} />
          </button>
          <span className={`exam-diff-badge exam-diff-${data.difficulty}`}>{data.difficulty}</span>
        </div>
        <div className="ph-item-meta-row">
          <span className="ph-item-score" style={{ color }}>
            <Award size={12} /> {data.score}/{data.numQuestions} ({pct}%) — {passLabel}
          </span>
          <span className="ph-item-meta"><Clock size={11} /> {formatTime(data.timeTakenSecs)}</span>
        </div>
        <div className="ph-item-actions">
          <button className="ph-action-btn" onClick={onStats}><BarChart2 size={12} /> View Stats</button>
          <button className="ph-action-btn" onClick={onQuestions}><Eye size={12} /> See Questions</button>
          <button className="ph-action-btn ph-action-reattempt" onClick={onReattempt}><RotateCcw size={12} /> Reattempt</button>
        </div>
      </div>
      <span className="ph-item-time">{timeAgo(data.createdAt)}</span>
    </div>
  );
}
