import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getProfile, getDisplayName, getInitial, getAvatarColor } from "./ProfileEditModal";
import {
  ArrowLeft, BookOpen, GraduationCap, RotateCcw, Eye, BarChart2,
  Clock, Check, X, ChevronDown, ChevronUp, Award, ExternalLink,
  MessageSquare, Bot, ChevronRight,
} from "lucide-react";
import { Sparkles, Cpu, Hash, TrendingUp } from "lucide-react";
import * as storage from "./storage/index.js";
import { getMode, getBackendUrl } from "./storage/index.js";
import { getLocalConvs, getLocalMsgs, msgKey } from "./AiChatPanel";
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
    return ["visits", "exams", "ai", "chat"].includes(tab) ? tab : "all";
  });
  const [exams, setExams] = useState([]);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [aiStats, setAiStats] = useState(null);
  const [aiHistory, setAiHistory] = useState([]);
  const [chatConvs, setChatConvs] = useState([]);
  const [expandedConv, setExpandedConv] = useState(null);
  const [convMsgs, setConvMsgs] = useState({});

  const [statsExam, setStatsExam]       = useState(null);
  const [questionsExam, setQuestionsExam] = useState(null);
  const [reattemptExam, setReattemptExam] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [e, v, ai, aiHist] = await Promise.all([
      storage.getNodeExamHistory(null).catch(() => []),
      storage.getVisitHistory(200).catch(() => []),
      storage.getAiStats().catch(() => null),
      storage.getAiResponses(null).catch(() => []),
    ]);
    setExams(e);
    setVisits(v);
    setAiStats(ai);
    setAiHistory(aiHist);

    // Load chat conversations
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

  // Build unified timeline
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
  const avgScore = totalExams
    ? Math.round(exams.reduce((s, e) => s + e.percentage, 0) / totalExams)
    : 0;

  const aiDailyData = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toDateString();
      const count = aiHistory.filter(a => new Date(a.createdAt).toDateString() === key).length;
      days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }), count });
    }
    return days;
  }, [aiHistory]);
  const aiChartMax = Math.max(...aiDailyData.map(d => d.count), 1);

  return (
    <div className="ph-page">
      {/* Header */}
      <div className="ph-topbar">
        <button className="ph-back-btn" onClick={() => navigate("/")}>
          <ArrowLeft size={18} /> Back
        </button>
        <span className="ph-topbar-title">Profile & History</span>
      </div>

      <div className="ph-content">
        {/* User card */}
        <div className="ph-user-card">
          <div className="ph-user-avatar" style={{ background: avatarColor }}>{initial}</div>
          <div className="ph-user-info">
            <div className="ph-user-name">{displayName}</div>
            <div className="ph-user-email">{profile.email || "sasankreddy2211@gmail.com"}</div>
            {profile.phone && <div className="ph-user-email">{profile.phone}</div>}
            {profile.bio   && <div className="ph-user-bio">{profile.bio}</div>}
          </div>
          <div className="ph-user-stats">
            <div className="ph-ustat">
              <span className="ph-ustat-val">{totalExams}</span>
              <span className="ph-ustat-lbl">Exams</span>
            </div>
            <div className="ph-ustat">
              <span className="ph-ustat-val">{avgScore}%</span>
              <span className="ph-ustat-lbl">Avg Score</span>
            </div>
            <div className="ph-ustat">
              <span className="ph-ustat-val">{visits.length}</span>
              <span className="ph-ustat-lbl">Nodes Visited</span>
            </div>
          </div>
        </div>

        {/* AI Usage card */}
        {aiStats && (
          <div className="ph-ai-stats-card">
            <div className="ph-ai-stats-title"><Sparkles size={14} /> AI Usage</div>
            <div className="ph-ai-stats-row">
              <div className="ph-ai-stat">
                <span className="ph-ai-val">{aiStats.totalCalls || 0}</span>
                <span className="ph-ai-lbl">Total Asks</span>
              </div>
              <div className="ph-ai-stat">
                <span className="ph-ai-val">{(aiStats.totalInputTokens || 0).toLocaleString()}</span>
                <span className="ph-ai-lbl">Input Tokens</span>
              </div>
              <div className="ph-ai-stat">
                <span className="ph-ai-val">{(aiStats.totalOutputTokens || 0).toLocaleString()}</span>
                <span className="ph-ai-lbl">Output Tokens</span>
              </div>
              <div className="ph-ai-stat">
                <span className="ph-ai-val">{((aiStats.totalInputTokens || 0) + (aiStats.totalOutputTokens || 0)).toLocaleString()}</span>
                <span className="ph-ai-lbl">Total Tokens</span>
              </div>
            </div>
            {aiStats.topNodes?.length > 0 && (
              <div className="ph-ai-top">
                <span className="ph-ai-top-label"><TrendingUp size={11} /> Most explored:</span>
                {aiStats.topNodes.slice(0, 5).map((n, i) => (
                  <button
                    key={i}
                    className="ph-ai-top-node ph-ai-top-link"
                    onClick={() => window.open(`/node/${n.nodeId || n.node_id}`, "_blank")}
                    title="Open node"
                  >
                    {n.nodeName || n.node_name}
                    <span className="ph-ai-top-cnt">({n.cnt || n.count || 0}×)</span>
                    <ExternalLink size={10} />
                  </button>
                ))}
              </div>
            )}
            {aiHistory.length > 0 && (
              <div className="ph-ai-chart">
                <div className="ph-ai-chart-title"><BarChart2 size={12} /> AI Requests — Last 7 Days</div>
                <div className="ph-ai-bars">
                  {aiDailyData.map((d, i) => (
                    <div key={i} className="ph-ai-bar-col">
                      {d.count > 0 && <div className="ph-ai-bar-count">{d.count}</div>}
                      <div className="ph-ai-bar-wrap">
                        <div
                          className="ph-ai-bar"
                          style={{ height: `${Math.max(d.count > 0 ? 6 : 2, Math.round((d.count / aiChartMax) * 60))}px` }}
                        />
                      </div>
                      <div className="ph-ai-bar-day">{d.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Filter tabs */}
        <div className="ph-filter-row">
          {[["all","All"],["visits","Node Visits"],["exams","Exams"],["ai","AI Asks"],["chat","Chat History"]].map(([val, label]) => (
            <button
              key={val}
              className={`ph-filter-btn${filter === val ? " active" : ""}`}
              onClick={() => setFilter(val)}
            >{label}</button>
          ))}
        </div>

        {/* Chat History view */}
        {filter === "chat" ? (
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
              {timeline.map((item, i) => (
                item.type === "visit"
                  ? <VisitItem key={`v-${i}`} data={item.data} />
                  : item.type === "ai"
                    ? <AiItem key={`a-${i}`} data={item.data} />
                    : <ExamItem
                        key={`e-${i}`}
                        data={item.data}
                        onStats={() => setStatsExam(item.data)}
                        onQuestions={() => setQuestionsExam(item.data)}
                        onReattempt={() => setReattemptExam(item.data)}
                      />
              ))}
            </div>
          )
        )}
      </div>

      {statsExam    && <StatsModal     exam={statsExam}     onClose={() => setStatsExam(null)} />}
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
