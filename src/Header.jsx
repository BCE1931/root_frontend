import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Moon, Sun, Download, ChevronDown,
  LogOut, Settings, ArrowRight, ArrowDown, Database, Laptop,
  BookOpen, Brain, Search, BarChart2, Layers, ZoomIn, ZoomOut,
  Plus, Check, History, Pencil, Phone, Mail, Flame, Target,
  Keyboard, X, Award, GraduationCap, Code2, Server, Globe,
  GitBranch, Cpu, Bot,
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ProfileEditModal, {
  getProfile, getDisplayName, getInitial, getAvatarColor,
} from "./ProfileEditModal";

const GOAL_KEY = "user_daily_goal";
const GOAL_OPTIONS = [3, 5, 10, 15, 20];

function getGoal() {
  return parseInt(localStorage.getItem(GOAL_KEY) || "5", 10);
}

const SHORTCUTS = [
  { keys: "Ctrl + K",     desc: "Open Search" },
  { keys: "Ctrl + →",     desc: "Scroll tree right" },
  { keys: "Ctrl + ←",     desc: "Scroll tree left" },
  { keys: "Esc",          desc: "Close any modal" },
  { keys: "Double-click", desc: "Edit node text" },
];

function KeyboardShortcutsModal({ onClose }) {
  return (
    <div className="pem-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pem-modal pem-modal-sm">
        <div className="pem-header">
          <span className="pem-title"><Keyboard size={15} /> Keyboard Shortcuts</span>
          <button className="pem-close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="shortcuts-list">
          {SHORTCUTS.map(s => (
            <div key={s.keys} className="shortcut-row">
              <kbd className="shortcut-key">{s.keys}</kbd>
              <span className="shortcut-desc">{s.desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Header({
  onExport, layout, onLayoutChange, onOpenSettings, storageMode,
  topic, onTopicChange, allTopics,
  onSearch, onProgress, onFlashcard,
  zoom, onZoom,
  onAddTopic,
  isMobileLandscape,
  nodeStats,
}) {
  if (isMobileLandscape) return null;

  const { isDark, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();

  const [profileOpen,    setProfileOpen]    = useState(false);
  const [topicDropOpen,  setTopicDropOpen]  = useState(false);
  const [newTopicMode,   setNewTopicMode]   = useState(false);
  const [newTopicName,   setNewTopicName]   = useState("");
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showShortcuts,  setShowShortcuts]  = useState(false);
  const [profile,        setProfile]        = useState(getProfile);
  const [dailyGoal,      setDailyGoal]      = useState(getGoal);
  const [showGoalPicker, setShowGoalPicker] = useState(false);

  const profileRef   = useRef(null);
  const topicDropRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current   && !profileRef.current.contains(e.target))   setProfileOpen(false);
      if (topicDropRef.current && !topicDropRef.current.contains(e.target)) {
        setTopicDropOpen(false); setNewTopicMode(false); setNewTopicName("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const streak = (() => {
    try { return JSON.parse(localStorage.getItem("streak_data") || "{}").count || 0; } catch { return 0; }
  })();
  const examCount = (() => {
    try { return JSON.parse(localStorage.getItem("exam_results") || "[]").length; } catch { return 0; }
  })();

  const activeTopic = (allTopics || []).find(t => t.id === topic) || { id: topic, label: topic };

  const HCL_IDS = new Set(["fd", "bd", "web", "db", "devops", "genai"]);
  const mainTopics = (allTopics || []).filter(t => !HCL_IDS.has(t.id));
  const hclTopics  = (allTopics || []).filter(t => HCL_IDS.has(t.id));

  function getTopicIcon(id) {
    const map = {
      ai:     Brain,
      gate:   BookOpen,
      fd:     Code2,
      bd:     Server,
      web:    Globe,
      db:     Database,
      devops: GitBranch,
      genai:  Cpu,
    };
    return map[id] || Brain;
  }

  const TopicIcon    = getTopicIcon(topic);
  const triggerLabel = (activeTopic.label || "").replace(/^HCL — /, "");

  const handleAddTopic = () => {
    const name = newTopicName.trim();
    if (!name) return;
    onAddTopic(name);
    setNewTopicMode(false); setNewTopicName(""); setTopicDropOpen(false);
  };

  const handleGoalChange = (v) => {
    setDailyGoal(v);
    localStorage.setItem(GOAL_KEY, String(v));
    setShowGoalPicker(false);
    toast.success(`Daily goal set to ${v} nodes/day`);
  };

  const displayName  = getDisplayName(profile);
  const initial      = getInitial(profile);
  const avatarColor  = getAvatarColor(profile);

  return (
    <>
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
                  <span className="topic-label">{triggerLabel}</span>
                  <ChevronDown size={11} style={{ transform: topicDropOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                {topicDropOpen && (
                  <div className="topic-dropdown">
                    {/* Standalone topics: AI, GATE, and any custom topics */}
                    {mainTopics.map(t => {
                      const Icon = getTopicIcon(t.id);
                      return (
                        <button
                          key={t.id}
                          className={`topic-option${t.id === topic ? " active" : ""}`}
                          onClick={() => { onTopicChange(t.id); setTopicDropOpen(false); }}
                        >
                          <Icon size={13} />
                          <span className="topic-option-label">{t.label}</span>
                          {t.id === topic && <span className="topic-check">✓</span>}
                        </button>
                      );
                    })}

                    {/* HCL Java CDC group */}
                    {hclTopics.length > 0 && (
                      <>
                        <div className="topic-group-header">HCL Java CDC</div>
                        {hclTopics.map(t => {
                          const Icon = getTopicIcon(t.id);
                          const short = t.label.replace(/^HCL — /, "");
                          return (
                            <button
                              key={t.id}
                              className={`topic-option topic-sub${t.id === topic ? " active" : ""}`}
                              onClick={() => { onTopicChange(t.id); setTopicDropOpen(false); }}
                            >
                              <Icon size={12} />
                              <span className="topic-option-label">{short}</span>
                              {t.id === topic && <span className="topic-check">✓</span>}
                            </button>
                          );
                        })}
                      </>
                    )}

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
            {!isMobileLandscape && onZoom && (
              <div className="zoom-controls">
                <button className="hdr-icon-btn" onClick={() => onZoom(-0.1)} title="Zoom out" disabled={zoom <= 0.4}><ZoomOut size={16} /></button>
                <span className="zoom-label">{Math.round(zoom * 100)}%</span>
                <button className="hdr-icon-btn" onClick={() => onZoom(+0.1)} title="Zoom in"  disabled={zoom >= 2.0}><ZoomIn  size={16} /></button>
              </div>
            )}
            {!isMobileLandscape && onSearch    && <button className="hdr-icon-btn" onClick={onSearch}    title="Search (Ctrl+K)"><Search   size={17} /></button>}
            {!isMobileLandscape && onFlashcard && <button className="hdr-icon-btn" onClick={onFlashcard} title="Flashcard Revision"><Layers  size={17} /></button>}
            {!isMobileLandscape && onProgress  && <button className="hdr-icon-btn" onClick={onProgress}  title="Progress Dashboard"><BarChart2 size={17} /></button>}
            {!isMobileLandscape && onExport && (
              <button className="hdr-icon-btn" onClick={onExport} title="Export JSON"><Download size={17} /></button>
            )}
            {!isMobileLandscape && onOpenSettings && (
              <button className="hdr-icon-btn storage-mode-btn" onClick={onOpenSettings}
                title={storageMode === "local" ? "Frontend Storage" : "Backend Storage"}>
                {storageMode === "local" ? <Laptop size={17} /> : <Database size={17} />}
                <span className="storage-label">{storageMode === "local" ? "Local" : "API"}</span>
              </button>
            )}
            <button className="hdr-icon-btn theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
              {isDark ? <Sun size={17} /> : <Moon size={17} />}
            </button>

            {/* Profile dropdown */}
            <div className="profile-menu" ref={profileRef}>
              <button className="profile-trigger" onClick={() => setProfileOpen(v => !v)}>
                <div className="user-avatar" style={{ background: avatarColor }}>{initial}</div>
                <ChevronDown size={12} style={{ transform: profileOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
              </button>

              {profileOpen && (
                <div className="profile-panel">

                  {/* ── Identity ── */}
                  <div className="profile-header-section">
                    <div className="user-avatar-lg" style={{ background: avatarColor }}>{initial}</div>
                    <div className="profile-text" style={{ flex: 1, minWidth: 0 }}>
                      <div className="profile-name">{displayName}</div>
                      <div className="profile-email" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <Mail size={10} /> {profile.email || "sasankreddy2211@gmail.com"}
                      </div>
                      {profile.phone && (
                        <div className="profile-email" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Phone size={10} /> {profile.phone}
                        </div>
                      )}
                      {profile.bio && (
                        <div className="profile-bio">{profile.bio}</div>
                      )}
                    </div>
                    <button className="panel-edit-btn" onClick={() => { setProfileOpen(false); setShowEditProfile(true); }} title="Edit profile">
                      <Pencil size={13} />
                    </button>
                  </div>

                  <div className="panel-divider" />

                  {/* ── Stats ── */}
                  <div className="panel-stats-row">
                    <div className="panel-stat">
                      <Flame size={13} style={{ color: "#f59e0b" }} />
                      <span className="panel-stat-val">{streak}</span>
                      <span className="panel-stat-lbl">streak</span>
                    </div>
                    <div className="panel-stat-divider" />
                    <div className="panel-stat">
                      <Check size={13} style={{ color: "#10b981" }} />
                      <span className="panel-stat-val">{nodeStats?.completed ?? 0}</span>
                      <span className="panel-stat-lbl">/ {nodeStats?.total ?? 0}</span>
                    </div>
                    <div className="panel-stat-divider" />
                    <div className="panel-stat">
                      <GraduationCap size={13} style={{ color: "#8b5cf6" }} />
                      <span className="panel-stat-val">{examCount}</span>
                      <span className="panel-stat-lbl">exams</span>
                    </div>
                  </div>

                  <div className="panel-divider" />

                  {/* ── Daily Goal ── */}
                  <div className="panel-goal-section">
                    <div className="panel-goal-row">
                      <Target size={13} style={{ color: "#3b82f6" }} />
                      <span className="panel-goal-label">Daily Goal</span>
                      <span className="panel-goal-val">{dailyGoal} nodes/day</span>
                      <button className="panel-goal-change" onClick={() => setShowGoalPicker(v => !v)}>
                        {showGoalPicker ? <X size={11} /> : <Pencil size={11} />}
                      </button>
                    </div>
                    {showGoalPicker && (
                      <div className="panel-goal-picker">
                        {GOAL_OPTIONS.map(n => (
                          <button
                            key={n}
                            className={`panel-goal-pill${dailyGoal === n ? " active" : ""}`}
                            onClick={() => handleGoalChange(n)}
                          >{n}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="panel-divider" />

                  {/* ── Actions ── */}
                  <button className="panel-item" onClick={() => { setProfileOpen(false); navigate("/profile"); }}>
                    <History size={14} /> History
                  </button>
                  <button className="panel-item" onClick={() => { setProfileOpen(false); navigate("/profile?tab=exams"); }}>
                    <GraduationCap size={14} /> Exams
                  </button>
                  <button className="panel-item" onClick={() => { setProfileOpen(false); navigate("/ai-models"); }}>
                    <Bot size={14} /> AI Models
                  </button>
                  <button className="panel-item" onClick={() => { setProfileOpen(false); setShowShortcuts(true); }}>
                    <Keyboard size={14} /> Keyboard Shortcuts
                  </button>
                  <button className="panel-item" onClick={() => { setProfileOpen(false); onOpenSettings?.(); }}>
                    <Settings size={14} /> Storage Settings
                  </button>
                  <button className="panel-item" onClick={() => { setProfileOpen(false); toggleTheme(); }}>
                    {isDark ? <Sun size={14} /> : <Moon size={14} />}
                    {isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
                  </button>

                  <div className="panel-divider" />

                  <button className="panel-item panel-item-danger"><LogOut size={14} /> Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {showEditProfile && (
        <ProfileEditModal
          onClose={() => setShowEditProfile(false)}
          onSave={data => setProfile(data)}
        />
      )}
      {showShortcuts && <KeyboardShortcutsModal onClose={() => setShowShortcuts(false)} />}
    </>
  );
}
