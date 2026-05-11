import React, { useState, useEffect, useRef, useContext } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Check, X, CheckCircle2, Circle, Play, Pause, Clock } from "lucide-react";
import { ThemeContext } from "./ThemeContext";
import "./NodeDetail.css";

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

  useEffect(() => {
    if (node) document.title = node.text;
  }, [node]);

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
