import React, { useContext, useState, useRef, useEffect } from "react";
import {
  Moon, Sun, RotateCcw, Download, ChevronDown,
  LogOut, Settings, ArrowRight, ArrowDown, Database, Laptop,
} from "lucide-react";
import { ThemeContext } from "./ThemeContext";
import { toast } from "react-toastify";
import { getMode } from "./storage/index.js";

export default function Header({ onReset, onExport, layout, onLayoutChange, onOpenSettings, storageMode }) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleReset = () => {
    if (window.confirm("Reset all data? This cannot be undone.")) {
      onReset();
      toast.warning("All data reset!");
    }
  };

  const handleExport = () => {
    onExport();
    toast.success("Tree data copied to clipboard!");
  };

  return (
    <header className="glass-header">
      <div className="header-inner">
        {/* LEFT — App Name */}
        <div className="header-left">
          <div className="app-logo-icon">T</div>
          <span className="app-name">TreeFlow</span>
        </div>

        {/* CENTER — Layout Toggle */}
        {onLayoutChange && (
          <div className="header-center">
            <div className="layout-pill">
              <button
                className={`pill-btn${layout === "horizontal" ? " active" : ""}`}
                onClick={() => onLayoutChange("horizontal")}
              >
                <ArrowRight size={13} />
                Horizontal
              </button>
              <button
                className={`pill-btn${layout === "vertical" ? " active" : ""}`}
                onClick={() => onLayoutChange("vertical")}
              >
                <ArrowDown size={13} />
                Vertical
              </button>
            </div>
          </div>
        )}

        {/* RIGHT — Actions + Profile */}
        <div className="header-right">
          {onExport && (
            <button
              className="hdr-icon-btn"
              onClick={handleExport}
              title="Export JSON"
            >
              <Download size={17} />
            </button>
          )}
          {onReset && (
            <button className="hdr-icon-btn" onClick={handleReset} title="Reset Tree">
              <RotateCcw size={17} />
            </button>
          )}
          {onOpenSettings && (
            <button
              className="hdr-icon-btn storage-mode-btn"
              onClick={onOpenSettings}
              title={storageMode === "local" ? "Frontend Storage (click to change)" : "Backend Storage (click to change)"}
            >
              {storageMode === "local" ? <Laptop size={17} /> : <Database size={17} />}
              <span className="storage-label">{storageMode === "local" ? "Local" : "API"}</span>
            </button>
          )}
          <button className="hdr-icon-btn theme-toggle-btn" onClick={toggleTheme} title="Toggle Theme">
            {isDark ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <div className="profile-menu" ref={profileRef}>
            <button
              className="profile-trigger"
              onClick={() => setProfileOpen((v) => !v)}
            >
              <div className="user-avatar">S</div>
              <ChevronDown
                size={12}
                style={{
                  transform: profileOpen ? "rotate(180deg)" : "none",
                  transition: "transform 0.2s ease",
                }}
              />
            </button>

            {profileOpen && (
              <div className="profile-panel">
                <div className="profile-header-section">
                  <div className="user-avatar-lg">S</div>
                  <div className="profile-text">
                    <div className="profile-name">Sasan</div>
                    <div className="profile-email">
                      sasankreddy2211@gmail.com
                    </div>
                  </div>
                </div>
                <div className="panel-divider" />
                <button className="panel-item">
                  <Settings size={14} />
                  Settings
                </button>
                <button className="panel-item panel-item-danger">
                  <LogOut size={14} />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
