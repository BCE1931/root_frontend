import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Check, X, CheckCircle2, Circle, Play, Pause, Clock, Send } from "lucide-react";
import { Sparkles, RefreshCw, ChevronLeft, ChevronRight, Cpu, Hash } from "lucide-react";
import { ThemeContext } from "./ThemeContext";
import { askAiAboutTopic, getAiProvider } from "./aiService";
import * as storage from "./storage/index.js";
import "./NodeDetail.css";

function uuid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ── Inline URL detector ────────────────────────────────────────────────────
function InlineContent({ text }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (/^https?:\/\//.test(part)) {
          const clean = part.replace(/[.,;:!?)]+$/, "");
          const isYT    = /youtube\.com|youtu\.be/.test(clean);
          const isArxiv = /arxiv\.org/.test(clean);
          const isHF    = /huggingface\.co/.test(clean);
          const isGH    = /github\.com/.test(clean);
          const domain  = clean.replace(/https?:\/\//, "").split("/")[0];
          let cls = "link-ext";
          let label = domain;
          if (isYT)    { cls = "link-yt";    label = "▶ YouTube"; }
          if (isArxiv) { cls = "link-arxiv"; label = "📄 arXiv Paper"; }
          if (isHF)    { cls = "link-hf";    label = "🤗 " + domain; }
          if (isGH)    { cls = "link-gh";    label = "⭐ GitHub"; }
          return (
            <a key={i} href={clean} target="_blank" rel="noopener noreferrer"
               className={`desc-link ${cls}`}>
              {label}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

// ── Section-header heuristic ───────────────────────────────────────────────
function isSectionHeader(line) {
  if (line.length < 3 || line.length > 90) return false;
  if (!line.endsWith(":")) return false;
  const withoutParens = line.replace(/\([^)]*\)/g, "").replace(/:$/, "").trim();
  const letters = withoutParens.replace(/[^a-zA-Z]/g, "");
  if (letters.length < 2) return false;
  const upper = withoutParens.replace(/[^A-Z]/g, "").length;
  return upper / letters.length > 0.60;
}

// ── Code-line heuristic ────────────────────────────────────────────────────
function isCodeLine(raw) {
  if (!/^ {2}/.test(raw)) return false;
  const t = raw.trim();
  if (!t) return false;
  return /[=\(\)\[\]\{\}#]|import |from |print\(|def |class |return |for |while |if |elif |else |torch\.|np\.|pd\.|model\.|optimizer\.|nn\.|plt\.|sns\.|km\.|pca\./.test(t);
}

// ── Description renderer ───────────────────────────────────────────────────
function DescriptionRenderer({ description }) {
  if (!description) return null;

  const lines = description.split("\n");
  const blocks = [];
  let codeBuf   = [];
  let bulletBuf = [];

  const flushCode = () => {
    if (codeBuf.length) {
      blocks.push({ type: "code", content: codeBuf.join("\n") });
      codeBuf = [];
    }
  };
  const flushBullets = () => {
    if (bulletBuf.length) {
      blocks.push({ type: "bullets", items: [...bulletBuf] });
      bulletBuf = [];
    }
  };

  for (const raw of lines) {
    const trimmed = raw.trim();

    // Code line
    if (isCodeLine(raw)) {
      flushBullets();
      codeBuf.push(raw);
      continue;
    }
    flushCode();

    // Empty
    if (!trimmed) {
      flushBullets();
      blocks.push({ type: "spacer" });
      continue;
    }

    // Divider ━━━ label ━━━
    if (/^[━═─]{3,}/.test(trimmed)) {
      flushBullets();
      const label = trimmed.replace(/[━═─\s]/g, "").trim();
      blocks.push({ type: "divider", content: label });
      continue;
    }

    // Section header (ALL CAPS + colon)
    if (isSectionHeader(trimmed)) {
      flushBullets();
      blocks.push({ type: "section", content: trimmed.replace(/:$/, "") });
      continue;
    }

    // Reference line (emoji-prefixed)
    if (/^[🎥📚📄🛠️📖🏆🎓💻🔗✅🌐⚡🧪🤗⭐🏋️]/.test(trimmed)) {
      flushBullets();
      blocks.push({ type: "ref", content: trimmed });
      continue;
    }

    // Bullet
    if (/^[•\-→✓✗★·]\s/.test(trimmed)) {
      flushCode();
      const marker = trimmed[0];
      const content = trimmed.slice(2).trim();
      const isCheck = marker === "✓";
      const isCross = marker === "✗";
      bulletBuf.push({ content, isCheck, isCross });
      continue;
    }

    // Plain text paragraph
    flushBullets();
    blocks.push({ type: "text", content: trimmed });
  }

  flushCode();
  flushBullets();

  return (
    <div className="desc-body">
      {blocks.map((block, i) => {
        switch (block.type) {
          case "spacer":
            return <div key={i} className="desc-spacer" />;

          case "divider":
            return (
              <div key={i} className="desc-divider">
                {block.content && (
                  <span className="desc-divider-label">{block.content}</span>
                )}
              </div>
            );

          case "section":
            return (
              <h4 key={i} className="desc-section-heading">
                {block.content}
              </h4>
            );

          case "code":
            return (
              <pre key={i} className="desc-code">
                <code>{block.content}</code>
              </pre>
            );

          case "bullets":
            return (
              <ul key={i} className="desc-bullets">
                {block.items.map((item, j) => (
                  <li
                    key={j}
                    className={
                      item.isCheck
                        ? "bullet-check"
                        : item.isCross
                        ? "bullet-cross"
                        : ""
                    }
                  >
                    <InlineContent text={item.content} />
                  </li>
                ))}
              </ul>
            );

          case "ref":
            return (
              <div key={i} className="desc-ref-line">
                <InlineContent text={block.content} />
              </div>
            );

          case "text":
          default:
            return (
              <p key={i} className="desc-para">
                <InlineContent text={block.content} />
              </p>
            );
        }
      })}
    </div>
  );
}

// ── AI Response Renderer ───────────────────────────────────────────────────
function AiResponseRenderer({ text }) {
  if (!text) return null;
  const sections = [];
  let current = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (line.startsWith('## ')) {
      if (current) sections.push(current);
      current = { heading: line.slice(3).trim(), lines: [] };
    } else if (current) {
      current.lines.push(line);
    } else {
      if (!current) current = { heading: null, lines: [] };
      current.lines.push(line);
    }
  }
  if (current) sections.push(current);

  return (
    <div className="ai-response-body">
      {sections.map((sec, si) => (
        <div key={si} className="ai-section">
          {sec.heading && <h4 className="ai-section-heading">{sec.heading}</h4>}
          {sec.lines.filter(l => l).map((line, li) => {
            const isBullet = /^[-•*]\s/.test(line);
            const bold = (t) => t.split(/\*\*([^*]+)\*\*/g).map((p, i) =>
              i % 2 === 1 ? <strong key={i}>{p}</strong> : p
            );
            if (isBullet) return (
              <div key={li} className="ai-bullet">
                <span className="ai-bullet-dot">•</span>
                <span>{bold(line.slice(2).trim())}</span>
              </div>
            );
            return <p key={li} className="ai-para">{bold(line)}</p>;
          })}
        </div>
      ))}
    </div>
  );
}

// ── Main NodeDetail component ──────────────────────────────────────────────
export default function NodeDetail({
  treeData,
  findNodeById,
  findParentPath,
  onUpdateDescription,
  onToggleComplete,
  onUpdateStudyTime,
}) {
  const { isDark } = useContext(ThemeContext);
  const { nodeId } = useParams();
  const node = findNodeById(treeData, nodeId);
  const parentPath = findParentPath(treeData, nodeId);

  const [isEditingDesc, setIsEditingDesc]       = useState(false);
  const [editedDescription, setEditedDescription] = useState(node?.description || "");
  const [timerRunning, setTimerRunning]           = useState(false);
  const [sessionSecs, setSessionSecs]             = useState(0);
  const intervalRef                               = useRef(null);

  const [aiResponses, setAiResponses]   = useState([]);
  const [aiLoading,   setAiLoading]     = useState(false);
  const [aiError,     setAiError]       = useState("");
  const [viewIdx,     setViewIdx]       = useState(0);
  const [aiQuestion,  setAiQuestion]    = useState("");
  const aiInputRef                      = useRef(null);

  useEffect(() => {
    if (node) document.title = node.text;
  }, [node]);

  useEffect(() => {
    if (nodeId) storage.getAiResponses(nodeId).then(data => {
      setAiResponses(data);
      setViewIdx(0);
    }).catch(() => {});
  }, [nodeId]);

  // Save session seconds on unmount or pause
  const flushSession = useRef(null);
  flushSession.current = () => {
    if (sessionSecs > 0 && onUpdateStudyTime) {
      onUpdateStudyTime(nodeId, sessionSecs);
      setSessionSecs(0);
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      flushSession.current();
    };
  }, [nodeId]);

  const handleTimerToggle = () => {
    if (timerRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      flushSession.current();
      setTimerRunning(false);
    } else {
      setTimerRunning(true);
      intervalRef.current = setInterval(() => setSessionSecs(s => s + 1), 1000);
    }
  };

  const fmtTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  if (!node) {
    return (
      <div className={`detail-page ${isDark ? "dark" : ""}`}>
        <div className="node-detail-container">
          <button className="btn-back" onClick={() => window.history.back()}>
            <ArrowLeft size={16} /> Back
          </button>
          <div className="not-found">
            <h2>Node Not Found</h2>
            <p>The node you&apos;re looking for doesn&apos;t exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveDescription = () => {
    if (editedDescription.trim()) {
      onUpdateDescription(nodeId, editedDescription);
    } else {
      setEditedDescription(node.description);
    }
    setIsEditingDesc(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription(node.description);
    setIsEditingDesc(false);
  };

  const handleAskAi = async (question = "") => {
    if (!node || aiLoading) return;
    setAiLoading(true);
    setAiError("");
    try {
      const result = await askAiAboutTopic(node, question);
      const saved  = await storage.saveAiResponse({ id: uuid(), nodeId: node.id, nodeName: node.text, ...result });
      setAiResponses(prev => [saved || { id: uuid(), nodeId: node.id, nodeName: node.text, ...result, createdAt: new Date().toISOString() }, ...prev]);
      setViewIdx(0);
      setAiQuestion("");
    } catch (err) {
      setAiError(err.message || "AI generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleAiInputKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (aiQuestion.trim()) handleAskAi(aiQuestion.trim());
    }
  };

  return (
    <div className={`detail-page ${isDark ? "dark" : ""}`}>
      <div className="node-detail-container">

        {/* Back button */}
        <button className="btn-back" onClick={() => window.history.back()}>
          <ArrowLeft size={16} /> Back
        </button>

        {/* Breadcrumb */}
        {parentPath.length > 0 && (
          <div className="breadcrumb">
            {parentPath.map((parent) => (
              <span key={parent.id} className="breadcrumb-item">
                <button
                  className="breadcrumb-link"
                  onClick={() => window.open(`/node/${parent.id}`, "_blank")}
                >
                  {parent.text}
                </button>
                <span className="breadcrumb-separator">/</span>
              </span>
            ))}
            <span className="breadcrumb-current">{node.text}</span>
          </div>
        )}

        {/* Main card */}
        <div className="node-detail-content">

          {/* Title */}
          <div className="detail-title-row">
            <h1 className="detail-title">{node.text}</h1>
            <div className="detail-title-actions">
              {node.children?.length > 0 && (
                <span className="detail-child-badge">
                  {node.children.length} subtopic{node.children.length !== 1 ? "s" : ""}
                </span>
              )}
              {onToggleComplete && (
                <button
                  className={`detail-complete-btn${node.completed ? " detail-complete-done" : ""}`}
                  onClick={() => onToggleComplete(nodeId)}
                  title={node.completed ? "Mark as incomplete" : "Mark as complete"}
                >
                  {node.completed
                    ? <><CheckCircle2 size={16} /> Completed</>
                    : <><Circle size={16} /> Mark complete</>}
                </button>
              )}
            </div>
          </div>

          {/* Description section */}
          <div className="detail-section">
            <div className="section-header">
              <h3>Content</h3>
              {!isEditingDesc && (
                <button
                  className="btn-edit-desc"
                  onClick={() => {
                    setEditedDescription(node.description);
                    setIsEditingDesc(true);
                  }}
                  title="Edit"
                >
                  <Edit2 size={15} />
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="edit-desc-container">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  autoFocus
                  placeholder="Enter content…"
                />
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSaveDescription}>
                    <Check size={15} /> Save
                  </button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>
                    <X size={15} /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <DescriptionRenderer description={node.description} />
            )}
          </div>

          {/* Study Timer section */}
          {onUpdateStudyTime && (
            <div className="detail-section timer-section">
              <div className="section-header">
                <h3><Clock size={15} /> Study Timer</h3>
              </div>
              <div className="timer-row">
                <div className="timer-total">
                  <span className="timer-total-label">Total studied:</span>
                  <span className="timer-total-val">{fmtTime(node.studyTime || 0)}</span>
                </div>
                <div className="timer-session">
                  {timerRunning && <span className="timer-live">{fmtTime(sessionSecs)}</span>}
                  <button
                    className={`timer-btn${timerRunning ? " timer-btn-pause" : ""}`}
                    onClick={handleTimerToggle}
                  >
                    {timerRunning ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Start</>}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Ask AI section */}
          <div className="detail-section ai-section-wrapper">
            <div className="section-header">
              <h3>
                <Sparkles size={15} /> Ask AI
                {aiResponses.length > 0 && (
                  <span className="ai-count-badge">{aiResponses.length} saved</span>
                )}
              </h3>
              {aiResponses.length > 1 && (
                <div className="ai-nav-controls">
                  <button
                    className="ai-nav-btn"
                    onClick={() => setViewIdx(i => Math.min(i + 1, aiResponses.length - 1))}
                    disabled={viewIdx >= aiResponses.length - 1}
                    title="Older response"
                  ><ChevronLeft size={12} /> Older</button>
                  <span className="ai-nav-label">{viewIdx + 1} / {aiResponses.length}</span>
                  <button
                    className="ai-nav-btn"
                    onClick={() => setViewIdx(i => Math.max(i - 1, 0))}
                    disabled={viewIdx <= 0}
                    title="Newer response"
                  >Newer <ChevronRight size={12} /></button>
                </div>
              )}
            </div>

            {/* ── AI Input bar ───────────────────────────────────────────── */}
            <div className="ai-input-bar">
              <input
                ref={aiInputRef}
                className="ai-input"
                type="text"
                placeholder={`Ask anything about "${node.text}"… (Enter to send)`}
                value={aiQuestion}
                onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={handleAiInputKey}
                disabled={aiLoading}
              />
              <button
                className={`ai-send-btn${aiLoading ? " loading" : ""}`}
                onClick={() => aiQuestion.trim()
                  ? handleAskAi(aiQuestion.trim())
                  : handleAskAi("")}
                disabled={aiLoading}
                title={aiQuestion.trim() ? "Send question" : "Ask default explanation"}
              >
                {aiLoading
                  ? <RefreshCw size={15} className="spin" />
                  : aiQuestion.trim()
                    ? <Send size={15} />
                    : <Sparkles size={15} />
                }
              </button>
            </div>

            {aiError && <div className="ai-error">{aiError}</div>}

            {aiLoading && (
              <div className="ai-loading">
                <div className="ai-loading-dots"><span/><span/><span/></div>
                <p>{aiQuestion ? `Answering: "${aiQuestion}"…` : "Generating explanation with examples…"}</p>
              </div>
            )}

            {/* Navigable response */}
            {!aiLoading && aiResponses.length > 0 && (() => {
              const safeIdx = Math.min(viewIdx, aiResponses.length - 1);
              const r = aiResponses[safeIdx];
              return (
                <div className={`ai-response-card${safeIdx > 0 ? " ai-response-old" : ""}`}>
                  <div className="ai-response-meta">
                    {safeIdx === 0 && <span className="ai-meta-badge ai-meta-latest">Latest</span>}
                    <span className="ai-meta-badge ai-meta-num">#{aiResponses.length - safeIdx}</span>
                    <span className="ai-meta-badge"><Cpu size={11} /> {r.model || "AI"}</span>
                    {(r.inputTokens || 0) > 0 && (
                      <span className="ai-meta-badge">
                        <Hash size={11} /> {r.inputTokens} in · {r.outputTokens} out
                      </span>
                    )}
                    <span className="ai-meta-badge ai-meta-date">
                      {r.createdAt ? new Date(r.createdAt).toLocaleString() : "just now"}
                    </span>
                  </div>
                  <AiResponseRenderer text={r.response} />
                </div>
              );
            })()}

            {!aiLoading && aiResponses.length === 0 && !aiError && (
              <p className="ai-empty">
                Type a question above or press <Sparkles size={12} style={{display:"inline",verticalAlign:"middle"}}/> to get a full explanation
                powered by {getAiProvider() === "gemini" ? "Google Gemini" : "Mistral AI (free via Puter)"}.
              </p>
            )}
          </div>

          {/* Children section */}
          {node.children?.length > 0 && (
            <div className="detail-section subtopics-section">
              <h3>Subtopics ({node.children.length})</h3>
              <div className="children-grid">
                {node.children.map((child) => (
                  <button
                    key={child.id}
                    className="child-card"
                    onClick={() => window.open(`/node/${child.id}`, "_blank")}
                  >
                    <span className="child-card-name">{child.text}</span>
                    {child.children?.length > 0 && (
                      <span className="child-card-count">
                        {child.children.length} subtopic{child.children.length !== 1 ? "s" : ""}
                      </span>
                    )}
                    <span className="child-card-arrow">→</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {(!node.children || node.children.length === 0) && (
            <div className="detail-section">
              <p className="no-children">No subtopics — this is a leaf node.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
