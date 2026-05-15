import React, { useState } from "react";
import {
  X, Bot, Key, Eye, EyeOff, AlertTriangle, CheckCircle,
  Zap, MessageSquare, Cpu,
} from "lucide-react";
import {
  getAiProvider, setAiProvider,
  getGeminiKey, setGeminiKey,
  getOpenRouterKey, setOpenRouterKey,
  getOpenRouterModel, setOpenRouterModel,
  getChatModelPuter, setChatModelPuter,
  getChatModelOpenRouter, setChatModelOpenRouter,
} from "./aiService.js";

function KeyInput({ value, onChange, placeholder, show, onToggleShow }) {
  return (
    <div style={{ position: "relative", flex: 1 }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        style={{ paddingRight: 36, width: "100%", boxSizing: "border-box" }}
      />
      <button
        onClick={onToggleShow}
        style={{
          position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
          background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", padding: 0,
        }}
        title={show ? "Hide" : "Show"}
      >
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

export default function AiModelsModal({ onClose }) {
  const [toast,        setToast]          = useState(null);
  const [provider,     setProviderState]  = useState(getAiProvider);
  const [geminiKey,    setGeminiKeyState] = useState(getGeminiKey);
  const [showGKey,     setShowGKey]       = useState(false);
  const [orKey,        setOrKeyState]     = useState(getOpenRouterKey);
  const [showOrKey,    setShowOrKey]      = useState(false);
  const [orModel,      setOrModelState]   = useState(getOpenRouterModel);
  const [chatPuter,    setChatPuterState] = useState(getChatModelPuter);
  const [chatOr,       setChatOrState]    = useState(getChatModelOpenRouter);

  function flash(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  }

  function switchProvider(p) {
    setAiProvider(p);
    setProviderState(p);
    const labels = { puter: "Puter / GPT-4o (Free)", gemini: "Google Gemini", openrouter: "OpenRouter" };
    flash(`Provider switched to ${labels[p]}.`);
  }

  function save(setter, persister, value, msg) {
    persister(value.trim());
    setter(value.trim());
    flash(msg);
  }

  const providers = [
    {
      id:    "puter",
      icon:  <Bot size={18} />,
      name:  "Puter / GPT-4o",
      sub:   "Free · No API key needed · gpt-4o for chat",
    },
    {
      id:    "gemini",
      icon:  <Cpu size={18} />,
      name:  "Google Gemini",
      sub:   "API key required · gemini-2.0-flash-lite",
    },
    {
      id:    "openrouter",
      icon:  <Key size={18} />,
      name:  "OpenRouter",
      sub:   "API key required · 300+ models · free tiers",
    },
  ];

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-modal aim-modal" onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="settings-header">
          <h2 style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Bot size={18} style={{ color: "#8b5cf6" }} /> AI Models
          </h2>
          <button className="settings-close" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Toast */}
        {toast && (
          <div className={`settings-toast ${toast.type === "err" ? "toast-err" : "toast-ok"}`}>
            {toast.type === "err" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
            {toast.msg}
          </div>
        )}

        {/* ── AI Provider ── */}
        <section className="settings-section">
          <h3><Zap size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />AI Provider</h3>
          <p className="settings-hint">Powers the "Ask AI" button on node pages and the floating AI Chat panel.</p>

          <div className="aim-provider-list">
            {providers.map(p => (
              <button
                key={p.id}
                className={`aim-provider-btn${provider === p.id ? " active" : ""}`}
                onClick={() => switchProvider(p.id)}
              >
                <span className="aim-provider-icon">{p.icon}</span>
                <span className="aim-provider-text">
                  <strong>{p.name}</strong>
                  <small>{p.sub}</small>
                </span>
                {provider === p.id && <span className="aim-check">✓</span>}
              </button>
            ))}
          </div>

          {/* Gemini key */}
          {provider === "gemini" && (
            <div className="aim-key-block">
              <label className="aim-label">Gemini API Key</label>
              <div className="url-row">
                <KeyInput
                  value={geminiKey}
                  onChange={e => setGeminiKeyState(e.target.value)}
                  placeholder="Paste your Gemini API key…"
                  show={showGKey}
                  onToggleShow={() => setShowGKey(v => !v)}
                />
                <button className="btn-primary" onClick={() => save(setGeminiKeyState, setGeminiKey, geminiKey, "Gemini key saved.")}>Save</button>
              </div>
              {!geminiKey && (
                <p className="aim-warn"><AlertTriangle size={12} /> No key — Ask AI will fail.</p>
              )}
            </div>
          )}

          {/* OpenRouter key + Ask AI model */}
          {provider === "openrouter" && (
            <div className="aim-key-block">
              <label className="aim-label">OpenRouter API Key</label>
              <div className="url-row">
                <KeyInput
                  value={orKey}
                  onChange={e => setOrKeyState(e.target.value)}
                  placeholder="Paste your OpenRouter API key…"
                  show={showOrKey}
                  onToggleShow={() => setShowOrKey(v => !v)}
                />
                <button className="btn-primary" onClick={() => save(setOrKeyState, setOpenRouterKey, orKey, "OpenRouter key saved.")}>Save</button>
              </div>
              {!orKey && (
                <p className="aim-warn"><AlertTriangle size={12} /> No key — Ask AI will fail.</p>
              )}
              <label className="aim-label" style={{ marginTop: 10 }}>Ask AI Model <span className="aim-label-hint">(node pages)</span></label>
              <div className="url-row">
                <input
                  type="text"
                  value={orModel}
                  onChange={e => setOrModelState(e.target.value)}
                  placeholder="e.g. meta-llama/llama-3.3-70b-instruct:free"
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={() => save(setOrModelState, setOpenRouterModel, orModel, "Ask AI model saved.")}>Save</button>
              </div>
              <p className="settings-hint" style={{ marginTop: 6 }}>
                Get a free key at <strong>openrouter.ai</strong>.
              </p>
            </div>
          )}
        </section>

        {/* ── Chat Models ── */}
        <section className="settings-section">
          <h3><MessageSquare size={13} style={{ display: "inline", verticalAlign: "middle", marginRight: 5 }} />Chat Panel Models</h3>
          <p className="settings-hint">The floating <strong>AI Chat</strong> button (bottom-right) uses these models for multi-turn conversation.</p>

          <div className="aim-model-row">
            <div className="aim-model-block">
              <label className="aim-label">
                Puter model
                <span className="aim-label-badge aim-badge-free">free</span>
              </label>
              <p className="aim-model-hint">Best: <code>gpt-4o</code> · also: <code>claude-claude-opus-4-5</code></p>
              <div className="url-row">
                <input
                  type="text"
                  value={chatPuter}
                  onChange={e => setChatPuterState(e.target.value)}
                  placeholder="gpt-4o"
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={() => save(setChatPuterState, setChatModelPuter, chatPuter, "Puter chat model saved.")}>Save</button>
              </div>
            </div>

            <div className="aim-model-block">
              <label className="aim-label">
                OpenRouter model
                <span className="aim-label-badge aim-badge-free">free</span>
              </label>
              <p className="aim-model-hint">Best: <code>deepseek/deepseek-chat:free</code> (128k context)</p>
              <div className="url-row">
                <input
                  type="text"
                  value={chatOr}
                  onChange={e => setChatOrState(e.target.value)}
                  placeholder="deepseek/deepseek-chat:free"
                  style={{ flex: 1 }}
                />
                <button className="btn-primary" onClick={() => save(setChatOrState, setChatModelOpenRouter, chatOr, "OpenRouter chat model saved.")}>Save</button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Model reference ── */}
        <section className="settings-section aim-ref-section">
          <h3>Good Free Models</h3>
          <div className="aim-ref-grid">
            <div className="aim-ref-card">
              <span className="aim-ref-name">gpt-4o</span>
              <span className="aim-ref-via">via Puter</span>
              <span className="aim-ref-note">Best conversational quality, free</span>
            </div>
            <div className="aim-ref-card">
              <span className="aim-ref-name">deepseek/deepseek-chat:free</span>
              <span className="aim-ref-via">via OpenRouter</span>
              <span className="aim-ref-note">DeepSeek V3 · 128k context · excellent reasoning</span>
            </div>
            <div className="aim-ref-card">
              <span className="aim-ref-name">google/gemini-2.0-flash-exp:free</span>
              <span className="aim-ref-via">via OpenRouter</span>
              <span className="aim-ref-note">Fast, multimodal, good for code</span>
            </div>
            <div className="aim-ref-card">
              <span className="aim-ref-name">meta-llama/llama-3.3-70b-instruct:free</span>
              <span className="aim-ref-via">via OpenRouter</span>
              <span className="aim-ref-note">Open-source, solid general use</span>
            </div>
            <div className="aim-ref-card">
              <span className="aim-ref-name">mistral-large-latest</span>
              <span className="aim-ref-via">via Puter</span>
              <span className="aim-ref-note">Current Ask AI default, reliable</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
