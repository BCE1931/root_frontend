import React, { useState, useContext, useRef, useEffect } from "react";
import {
  ChevronLeft, ChevronRight, Search, Layers, BarChart2,
  ArrowRight, ArrowDown, ZoomIn, ZoomOut, Moon, Sun,
  Download, Laptop, Database, BookOpen, Brain, ChevronDown,
  Plus, Check,
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";

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
}) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [topicOpen, setTopicOpen]       = useState(false);
  const [newTopicMode, setNewTopicMode] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const topicRef = useRef(null);

  const activeTopic = (allTopics || []).find((t) => t.id === topic) || { label: topic };
  const TopicIcon   = topic === "gate" ? BookOpen : Brain;

  useEffect(() => {
    const handler = (e) => {
      if (topicRef.current && !topicRef.current.contains(e.target)) {
        setTopicOpen(false);
        setNewTopicMode(false);
        setNewTopicName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleAddTopic = () => {
    const name = newTopicName.trim();
    if (!name) return;
    onAddTopic(name);
    setNewTopicMode(false);
    setNewTopicName("");
    setTopicOpen(false);
  };

  return (
    <div className={`mobile-sidebar${isOpen ? "" : " mobile-sidebar-collapsed"}`}>
      <button className="sidebar-toggle-btn" onClick={onToggle} title={isOpen ? "Collapse" : "Expand"}>
        {isOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="sidebar-inner">
        {/* Topic selector */}
        <div className="sidebar-topic-wrap" ref={topicRef}>
          <button
            className="sidebar-item sidebar-item-topic"
            onClick={() => setTopicOpen((v) => !v)}
            title="Switch topic"
          >
            <TopicIcon size={18} />
            {isOpen && (
              <>
                <span className="sidebar-label">{activeTopic.label}</span>
                <ChevronDown
                  size={11}
                  style={{
                    marginLeft: "auto",
                    flexShrink: 0,
                    transform: topicOpen ? "rotate(180deg)" : "none",
                    transition: "transform 0.2s",
                  }}
                />
              </>
            )}
          </button>

          {topicOpen && (
            <div className={`sidebar-topic-dropdown${isOpen ? "" : " sidebar-topic-dropdown-right"}`}>
              {(allTopics || []).map((t) => {
                const Icon = t.id === "gate" ? BookOpen : Brain;
                return (
                  <button
                    key={t.id}
                    className={`sidebar-topic-opt${t.id === topic ? " active" : ""}`}
                    onClick={() => { onTopicChange(t.id); setTopicOpen(false); }}
                  >
                    <Icon size={13} />
                    {t.label}
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
                    onChange={(e) => setNewTopicName(e.target.value)}
                    onKeyDown={(e) => {
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

        {/* Main actions */}
        <button className="sidebar-item" onClick={onSearch} title="Search (Ctrl+K)">
          <Search size={18} />
          {isOpen && <span className="sidebar-label">Search</span>}
        </button>
        <button className="sidebar-item" onClick={onFlashcard} title="Flashcards">
          <Layers size={18} />
          {isOpen && <span className="sidebar-label">Flashcards</span>}
        </button>
        <button className="sidebar-item" onClick={onProgress} title="Progress">
          <BarChart2 size={18} />
          {isOpen && <span className="sidebar-label">Progress</span>}
        </button>

        <div className="sidebar-sep" />

        {/* Layout toggle */}
        <button
          className={`sidebar-item${layout === "horizontal" ? " sidebar-item-active" : ""}`}
          onClick={() => onLayoutChange("horizontal")}
          title="Horizontal layout"
        >
          <ArrowRight size={18} />
          {isOpen && <span className="sidebar-label">Horizontal</span>}
        </button>
        <button
          className={`sidebar-item${layout === "vertical" ? " sidebar-item-active" : ""}`}
          onClick={() => onLayoutChange("vertical")}
          title="Vertical layout"
        >
          <ArrowDown size={18} />
          {isOpen && <span className="sidebar-label">Vertical</span>}
        </button>

        <div className="sidebar-sep" />

        {/* Zoom */}
        <div className="sidebar-zoom-group">
          <button
            className="sidebar-item sidebar-zoom-btn"
            onClick={() => onZoom(-0.1)}
            disabled={zoom <= 0.4}
            title="Zoom out"
          >
            <ZoomOut size={18} />
          </button>
          {isOpen && <span className="sidebar-zoom-pct">{Math.round(zoom * 100)}%</span>}
          <button
            className="sidebar-item sidebar-zoom-btn"
            onClick={() => onZoom(+0.1)}
            disabled={zoom >= 2.0}
            title="Zoom in"
          >
            <ZoomIn size={18} />
          </button>
        </div>

        <div className="sidebar-sep" />

        {/* Theme, Export, Storage */}
        <button className="sidebar-item" onClick={toggleTheme} title="Toggle theme">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {isOpen && <span className="sidebar-label">Theme</span>}
        </button>
        <button className="sidebar-item" onClick={onExport} title="Export JSON">
          <Download size={18} />
          {isOpen && <span className="sidebar-label">Export</span>}
        </button>
        {onOpenSettings && (
          <button className="sidebar-item" onClick={onOpenSettings} title="Storage settings">
            {storageMode === "local" ? <Laptop size={18} /> : <Database size={18} />}
            {isOpen && <span className="sidebar-label">{storageMode === "local" ? "Local" : "API"}</span>}
          </button>
        )}
      </div>
    </div>
  );
}
