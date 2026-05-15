import React, { useState, useContext, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Search, Layers, BarChart2,
  ArrowRight, ArrowDown, ZoomIn, ZoomOut, Moon, Sun,
  Download, Laptop, Database, BookOpen, Brain, ChevronDown,
  Plus, Check, Settings, Bot, Code2, Server, Globe, GitBranch, Cpu,
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";

function getTopicIcon(id) {
  const map = { ai: Brain, gate: BookOpen, fd: Code2, bd: Server, web: Globe, db: Database, devops: GitBranch, genai: Cpu };
  return map[id] || Brain;
}

export default function MobileSidebar({
  isOpen,
  onToggle,
  onSearch,
  onProgress,
  onFlashcard,
  zoom,
  onZoom,
  layout,
  onLayoutChange,
  onExport,
  storageMode,
  onOpenSettings,
  topic,
  allTopics,
  onTopicChange,
  onAddTopic,
  onOpenChat,
}) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [topicOpen,    setTopicOpen]    = useState(false);
  const [newTopicMode, setNewTopicMode] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const topicRef = useRef(null);

  const activeTopic = (allTopics || []).find(t => t.id === topic) || { label: topic };
  const TopicIcon   = getTopicIcon(topic);

  useEffect(() => {
    const handler = (e) => {
      if (topicRef.current && !topicRef.current.contains(e.target)) {
        setTopicOpen(false); setNewTopicMode(false); setNewTopicName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddTopic = () => {
    const name = newTopicName.trim();
    if (!name) return;
    onAddTopic(name);
    setNewTopicMode(false); setNewTopicName(""); setTopicOpen(false);
  };

  const close = () => { if (isOpen) onToggle(); };

  return (
    <>
      <div className={`mobile-sidebar${isOpen ? " mobile-sidebar-open" : ""}`}>

        {/* Toggle */}
        <button className="sidebar-toggle-btn" onClick={onToggle} title={isOpen ? "Collapse" : "Expand"}>
          {isOpen ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
        </button>

        <div className="sidebar-inner">

          {/* ── AI Chat (featured) ── */}
          <button
            className="sidebar-chat-btn"
            onClick={() => { close(); onOpenChat?.(); }}
            title="AI Chat"
          >
            <Bot size={18} />
            {isOpen && <span className="sidebar-label">AI Chat</span>}
          </button>

          <div className="sidebar-sep" />

          {/* ── Topic ── */}
          <div className="sidebar-topic-wrap" ref={topicRef}>
            <button
              className="sidebar-item sidebar-item-topic"
              onClick={() => setTopicOpen(v => !v)}
              title="Switch topic"
            >
              <TopicIcon size={17} />
              {isOpen && (
                <>
                  <span className="sidebar-label">{(activeTopic.label || "").replace(/^HCL — /, "")}</span>
                  <ChevronDown size={10} style={{ marginLeft: "auto", flexShrink: 0, transform: topicOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </>
              )}
            </button>

            {topicOpen && (
              <div className="sidebar-topic-dropdown">
                {(allTopics || []).map(t => {
                  const Icon = getTopicIcon(t.id);
                  return (
                    <button
                      key={t.id}
                      className={`sidebar-topic-opt${t.id === topic ? " active" : ""}`}
                      onClick={() => { onTopicChange(t.id); setTopicOpen(false); close(); }}
                    >
                      <Icon size={13} />
                      {(t.label || "").replace(/^HCL — /, "")}
                      {t.id === topic && <span style={{ marginLeft: "auto" }}>✓</span>}
                    </button>
                  );
                })}
                <div className="topic-divider" />
                {newTopicMode ? (
                  <div className="new-topic-input-row">
                    <input
                      autoFocus
                      className="new-topic-input"
                      placeholder="Topic name…"
                      value={newTopicName}
                      onChange={e => setNewTopicName(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") handleAddTopic();
                        if (e.key === "Escape") { setNewTopicMode(false); setNewTopicName(""); }
                      }}
                    />
                    <button className="new-topic-save" onClick={handleAddTopic}><Check size={14} /></button>
                  </div>
                ) : (
                  <button className="topic-option topic-add-btn" onClick={() => setNewTopicMode(true)}>
                    <Plus size={13} /> New Topic
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="sidebar-sep" />

          {/* ── Actions ── */}
          <button className="sidebar-item" onClick={() => { close(); onSearch(); }} title="Search (Ctrl+K)">
            <Search size={17} />
            {isOpen && <span className="sidebar-label">Search</span>}
          </button>
          <button className="sidebar-item" onClick={() => { close(); onFlashcard(); }} title="Flashcards">
            <Layers size={17} />
            {isOpen && <span className="sidebar-label">Flashcards</span>}
          </button>
          <button className="sidebar-item" onClick={() => { close(); onProgress(); }} title="Progress">
            <BarChart2 size={17} />
            {isOpen && <span className="sidebar-label">Progress</span>}
          </button>

          <div className="sidebar-sep" />

          {/* ── Layout ── */}
          <button
            className={`sidebar-item${layout === "horizontal" ? " sidebar-item-active" : ""}`}
            onClick={() => onLayoutChange("horizontal")}
            title="Horizontal"
          >
            <ArrowRight size={17} />
            {isOpen && <span className="sidebar-label">Horizontal</span>}
          </button>
          <button
            className={`sidebar-item${layout === "vertical" ? " sidebar-item-active" : ""}`}
            onClick={() => onLayoutChange("vertical")}
            title="Vertical"
          >
            <ArrowDown size={17} />
            {isOpen && <span className="sidebar-label">Vertical</span>}
          </button>

          <div className="sidebar-sep" />

          {/* ── Zoom ── */}
          <div className="sidebar-zoom-group">
            <button className="sidebar-item sidebar-zoom-btn" onClick={() => onZoom(-0.1)} disabled={zoom <= 0.4} title="Zoom out">
              <ZoomOut size={17} />
            </button>
            {isOpen && <span className="sidebar-zoom-pct">{Math.round(zoom * 100)}%</span>}
            <button className="sidebar-item sidebar-zoom-btn" onClick={() => onZoom(+0.1)} disabled={zoom >= 2.0} title="Zoom in">
              <ZoomIn size={17} />
            </button>
          </div>

          <div className="sidebar-sep" />

          {/* ── Utility ── */}
          <button className="sidebar-item" onClick={onExport} title="Export JSON">
            <Download size={17} />
            {isOpen && <span className="sidebar-label">Export</span>}
          </button>
          {onOpenSettings && (
            <button className="sidebar-item" onClick={() => { close(); onOpenSettings(); }} title="Storage settings">
              {storageMode === "local" ? <Laptop size={17} /> : <Database size={17} />}
              {isOpen && <span className="sidebar-label">{storageMode === "local" ? "Local" : "API"}</span>}
            </button>
          )}
          <button className="sidebar-item" onClick={toggleTheme} title="Toggle theme">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
            {isOpen && <span className="sidebar-label">{isDark ? "Light Mode" : "Dark Mode"}</span>}
          </button>

        </div>
      </div>
    </>
  );
}
