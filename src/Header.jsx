import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Moon, Sun, Download, ChevronDown,
  LogOut, Settings, ArrowRight, ArrowDown, Database, Laptop,
  BookOpen, Brain, Search, BarChart2, Layers, ZoomIn, ZoomOut,
  Plus, Check,
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";
import { toast } from "react-toastify";

export default function Header({
  onExport, layout, onLayoutChange, onOpenSettings, storageMode,
  topic, onTopicChange, allTopics,
  onSearch, onProgress, onFlashcard,
  zoom, onZoom,
  onAddTopic,
}) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [profileOpen,  setProfileOpen]  = useState(false);
  const [topicDropOpen, setTopicDropOpen] = useState(false);
  const [newTopicMode,  setNewTopicMode]  = useState(false);
  const [newTopicName,  setNewTopicName]  = useState("");
  const profileRef  = useRef(null);
  const topicDropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current   && !profileRef.current.contains(e.target))   setProfileOpen(false);
      if (topicDropRef.current && !topicDropRef.current.contains(e.target)) { setTopicDropOpen(false); setNewTopicMode(false); setNewTopicName(""); }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleExport = () => { onExport(); };

  const activeTopic = (allTopics || []).find(t => t.id === topic) || { id: topic, label: topic };
  const TopicIcon   = topic === "gate" ? BookOpen : Brain;

  const handleAddTopic = () => {
    const name = newTopicName.trim();
    if (!name) return;
    onAddTopic(name);
    setNewTopicMode(false);
    setNewTopicName("");
    setTopicDropOpen(false);
  };

  return (
    <header className="glass-header">
      <div className="header-inner">

        {/* LEFT — Logo + Topic */}
        <div className="header-left">
          <div className="app-logo-icon">T</div>
          <span className="app-name">TreeFlow</span>

          {onTopicChange && (
            <div className="topic-selector" ref={topicDropRef}>
              <button className="topic-trigger" onClick={() => setTopicDropOpen(v => !v)}>
                <TopicIcon size={13} />
                <span className="topic-label">{activeTopic.label}</span>
                <ChevronDown size={11} style={{ transform: topicDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {topicDropOpen && (
                <div className="topic-dropdown">
                  {(allTopics || []).map(t => {
                    const Icon = t.id === "gate" ? BookOpen : Brain;
                    return (
                      <button
                        key={t.id}
                        className={`topic-option${t.id === topic ? " active" : ""}`}
                        onClick={() => { onTopicChange(t.id); setTopicDropOpen(false); }}
                      >
                        <Icon size={13} />
                        {t.label}
                        {t.id === topic && <span className="topic-check">✓</span>}
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
                        onKeyDown={e => { if (e.key === "Enter") handleAddTopic(); if (e.key === "Escape") { setNewTopicMode(false); setNewTopicName(""); } }}
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
          )}
        </div>

        {/* CENTER — Layout Toggle */}
        {onLayoutChange && (
          <div className="header-center">
            <div className="layout-pill">
              <button className={`pill-btn${layout === "horizontal" ? " active" : ""}`} onClick={() => onLayoutChange("horizontal")}>
                <ArrowRight size={13} /> Horizontal
              </button>
              <button className={`pill-btn${layout === "vertical" ? " active" : ""}`} onClick={() => onLayoutChange("vertical")}>
                <ArrowDown size={13} /> Vertical
              </button>
            </div>
          </div>
        )}

        {/* RIGHT — Actions */}
        <div className="header-right">

          {/* Zoom controls */}
          {onZoom && (
            <div className="zoom-controls">
              <button className="hdr-icon-btn" onClick={() => onZoom(-0.1)} title="Zoom out" disabled={zoom <= 0.4}><ZoomOut size={16} /></button>
              <span className="zoom-label">{Math.round(zoom * 100)}%</span>
              <button className="hdr-icon-btn" onClick={() => onZoom(+0.1)} title="Zoom in"  disabled={zoom >= 2.0}><ZoomIn  size={16} /></button>
            </div>
          )}

          {/* Feature buttons */}
          {onSearch    && <button className="hdr-icon-btn" onClick={onSearch}    title="Search (Ctrl+K)"><Search   size={17} /></button>}
          {onFlashcard && <button className="hdr-icon-btn" onClick={onFlashcard} title="Flashcard Revision"><Layers  size={17} /></button>}
          {onProgress  && <button className="hdr-icon-btn" onClick={onProgress}  title="Progress Dashboard"><BarChart2 size={17} /></button>}

          {onExport && (
            <button className="hdr-icon-btn" onClick={handleExport} title="Export JSON">
              <Download size={17} />
            </button>
          )}

          {onOpenSettings && (
            <button className="hdr-icon-btn storage-mode-btn" onClick={onOpenSettings}
              title={storageMode === "local" ? "Frontend Storage" : "Backend Storage"}>
              {storageMode === "local" ? <Laptop size={17} /> : <Database size={17} />}
              <span className="storage-label">{storageMode === "local" ? "Local" : "API"}</span>
            </button>
          )}

          <button className="hdr-icon-btn theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="profile-menu" ref={profileRef}>
            <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)}>
              <div className="user-avatar">S</div>
              <ChevronDown size={12} style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            </button>
            {profileOpen && (
              <div className="profile-panel">
                <div className="profile-header-section">
                  <div className="user-avatar-lg">S</div>
                  <div className="profile-text">
                    <div className="profile-name">Sasan</div>
                    <div className="profile-email">sasankreddy2211@gmail.com</div>
                  </div>
                </div>
                <div className="panel-divider" />
                <button className="panel-item"><Settings size={14} /> Settings</button>
                <button className="panel-item panel-item-danger"><LogOut size={14} /> Sign Out</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
