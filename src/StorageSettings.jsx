import React, { useState } from "react";
import { X, Database, Laptop, RefreshCw, Download, Upload, AlertTriangle, CheckCircle } from "lucide-react";
import {
  getMode, setMode, getBackendUrl, setBackendUrl,
  resetToDefaults, exportJSON, importJSON,
} from "./storage/index.js";

export default function StorageSettings({ onClose, onModeChange }) {
  const [mode, setModeState]       = useState(getMode);
  const [url, setUrl]              = useState(getBackendUrl);
  const [toast, setToast]          = useState(null);
  const [confirmReset, setConfirmReset] = useState(false);

  function flash(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  }

  function handleModeSwitch(newMode) {
    setMode(newMode);
    setModeState(newMode);
    onModeChange(newMode);
    flash(`Switched to ${newMode === "local" ? "Frontend (Browser)" : "Backend (API)"} storage.`);
  }

  function handleUrlSave() {
    setBackendUrl(url.trim());
    flash("Backend URL saved.");
  }

  function handleReset() {
    resetToDefaults();
    setConfirmReset(false);
    onModeChange(mode);
    flash("Data reset to defaults.");
  }

  function handleExport() {
    const json = exportJSON();
    const blob = new Blob([json], { type: "application/json" });
    const a    = document.createElement("a");
    a.href     = URL.createObjectURL(blob);
    a.download = "ai-roadmap-export.json";
    a.click();
    flash("Exported!");
  }

  function handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importJSON(ev.target.result);
        onModeChange(mode);
        flash("Imported successfully!");
      } catch (err) {
        flash("Import failed: " + err.message, "err");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="settings-header">
          <h2>Storage Settings</h2>
          <button className="settings-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`settings-toast ${toast.type === "err" ? "toast-err" : "toast-ok"}`}>
            {toast.type === "err" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            {toast.msg}
          </div>
        )}

        {/* Mode toggle */}
        <section className="settings-section">
          <h3>Storage Mode</h3>
          <p className="settings-hint">
            Choose where your tree data is stored. You can switch any time.
          </p>
          <div className="mode-toggle">
            <button
              className={`mode-btn ${mode === "local" ? "active" : ""}`}
              onClick={() => handleModeSwitch("local")}
            >
              <Laptop size={18} />
              <span>
                <strong>Frontend</strong>
                <small>Browser localStorage — no backend needed</small>
              </span>
            </button>
            <button
              className={`mode-btn ${mode === "backend" ? "active" : ""}`}
              onClick={() => handleModeSwitch("backend")}
            >
              <Database size={18} />
              <span>
                <strong>Backend</strong>
                <small>Spring Boot + MySQL API</small>
              </span>
            </button>
          </div>
        </section>

        {/* Backend URL (only when backend mode) */}
        {mode === "backend" && (
          <section className="settings-section">
            <h3>Backend API URL</h3>
            <div className="url-row">
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="http://localhost:8080/api"
              />
              <button className="btn-primary" onClick={handleUrlSave}>Save</button>
            </div>
          </section>
        )}

        {/* Local data management (only in local mode) */}
        {mode === "local" && (
          <section className="settings-section">
            <h3>Local Data</h3>
            <div className="settings-actions">
              <button className="btn-action" onClick={handleExport}>
                <Download size={15} /> Export JSON
              </button>
              <label className="btn-action btn-upload">
                <Upload size={15} /> Import JSON
                <input type="file" accept=".json" onChange={handleImport} hidden />
              </label>
              <button
                className="btn-action btn-danger"
                onClick={() => setConfirmReset(true)}
              >
                <RefreshCw size={15} /> Reset to Defaults
              </button>
            </div>
            {confirmReset && (
              <div className="confirm-reset">
                <AlertTriangle size={16} />
                <p>This will erase all local changes and reload the default AI roadmap. Continue?</p>
                <div className="confirm-btns">
                  <button className="btn-danger-solid" onClick={handleReset}>Yes, reset</button>
                  <button className="btn-cancel-sm" onClick={() => setConfirmReset(false)}>Cancel</button>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Info */}
        <section className="settings-section settings-info">
          <p>
            <strong>Currently:</strong>{" "}
            {mode === "local"
              ? "Data is saved in your browser. Works offline. Data stays on this device."
              : "Data is read from and written to your Spring Boot backend."}
          </p>
        </section>
      </div>
    </div>
  );
}
