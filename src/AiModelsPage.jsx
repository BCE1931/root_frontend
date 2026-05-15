import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Bot, Cpu, Key, Check, Eye, EyeOff,
  AlertTriangle, CheckCircle, MessageSquare, Zap,
  Sparkles, Shield, Globe, Clock,
} from "lucide-react";
import {
  getAiProvider, setAiProvider,
  getGeminiKey, setGeminiKey,
  getOpenRouterKey, setOpenRouterKey,
  getOpenRouterModel, setOpenRouterModel,
  getChatModelPuter, setChatModelPuter,
  getChatModelOpenRouter, setChatModelOpenRouter,
} from "./aiService.js";

// ── Provider definitions ────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id:          "puter",
    Icon:        Bot,
    color:       "#6366f1",
    name:        "Puter · GPT-4o",
    tagline:     "100% free, zero setup",
    badge:       "FREE",
    badgeColor:  "#10b981",
    description: "Puter gives you free access to OpenAI's GPT-4o through their cloud layer. No API key, no credit card — just open the app and ask.",
    bestFor:     ["AI Chat panel (multi-turn)", "Ask AI on node pages", "General learning Q&A", "Quick explanations"],
    context:     "128k tokens",
    cost:        "Always free",
    configNote:  "No configuration needed. Just select this provider and start asking.",
    needsKey:    false,
    chatModels:  [
      { id: "gpt-4o",              label: "GPT-4o",       note: "Best quality, recommended" },
      { id: "gpt-4o-mini",         label: "GPT-4o Mini",  note: "Faster, lighter" },
      { id: "claude-claude-opus-4-5", label: "Claude Opus 4.5", note: "Alternative, great reasoning" },
      { id: "mistral-large-latest", label: "Mistral Large", note: "Current Ask AI default" },
    ],
  },
  {
    id:          "gemini",
    Icon:        Cpu,
    color:       "#0ea5e9",
    name:        "Google Gemini",
    tagline:     "1M token context window",
    badge:       "API KEY",
    badgeColor:  "#f59e0b",
    description: "Google's Gemini 2.0 Flash Lite — fast, efficient, and excellent for structured explanations. Free tier from Google AI Studio is very generous.",
    bestFor:     ["Structured explanations with headings", "Code understanding", "Very long documents (1M ctx)", "Ask AI on node pages"],
    context:     "1 million tokens",
    cost:        "Free tier — get key at aistudio.google.com",
    configNote:  "Get a free API key at Google AI Studio. Paste it below.",
    needsKey:    true,
    keyLabel:    "Gemini API Key",
    keyPlaceholder: "AIza…",
  },
  {
    id:          "openrouter",
    Icon:        Key,
    color:       "#8b5cf6",
    name:        "OpenRouter",
    tagline:     "300+ models, many free",
    badge:       "API KEY",
    badgeColor:  "#f59e0b",
    description: "OpenRouter is a unified API for hundreds of models — DeepSeek V3, Llama 3.3, Gemini Flash, and more. Many have free tiers with no rate limits.",
    bestFor:     ["Best free chat (DeepSeek V3)", "Custom model selection", "Experimenting with models", "Long-context conversations"],
    context:     "Depends on model (up to 128k+)",
    cost:        "Free models available — get key at openrouter.ai",
    configNote:  "Get a free API key at openrouter.ai. The default model (DeepSeek V3) is free.",
    needsKey:    true,
    keyLabel:    "OpenRouter API Key",
    keyPlaceholder: "sk-or-v1-…",
    hasModel:    true,
    modelLabel:  "Ask AI Model (node pages)",
    modelPlaceholder: "meta-llama/llama-3.3-70b-instruct:free",
    chatModels:  [
      { id: "deepseek/deepseek-chat-v3-0324:free",     label: "DeepSeek V3",         note: "Best free — 128k context, excellent reasoning" },
      { id: "deepseek/deepseek-r1:free",               label: "DeepSeek R1",         note: "Reasoning model, chain-of-thought" },
      { id: "google/gemini-2.0-flash-exp:free",        label: "Gemini 2.0 Flash",    note: "Fast, multimodal, strong code skills" },
      { id: "meta-llama/llama-3.3-70b-instruct:free",  label: "Llama 3.3 70B",       note: "Open-source, solid all-rounder" },
    ],
  },
];

// ── Free model reference data ───────────────────────────────────────────────
const FREE_MODELS = [
  { name: "gpt-4o",                                 via: "Puter",      ctx: "128k", best: "Best overall free chat, general Q&A",      tag: "⭐ Top pick" },
  { name: "deepseek/deepseek-chat-v3-0324:free",    via: "OpenRouter", ctx: "128k", best: "Best free long-context reasoning, coding",  tag: "⭐ Top pick" },
  { name: "deepseek/deepseek-r1:free",              via: "OpenRouter", ctx: "64k",  best: "Chain-of-thought reasoning, math, logic",    tag: "Reasoning" },
  { name: "google/gemini-2.0-flash-exp:free",       via: "OpenRouter", ctx: "1M",   best: "Ultra-long context, code, multimodal",      tag: "1M context" },
  { name: "meta-llama/llama-3.3-70b-instruct:free", via: "OpenRouter", ctx: "128k", best: "Reliable open-source, good for teaching",   tag: "" },
  { name: "microsoft/phi-4-reasoning:free",         via: "OpenRouter", ctx: "16k",  best: "Logic, math, step-by-step reasoning",       tag: "" },
  { name: "mistral-large-latest",                   via: "Puter",      ctx: "128k", best: "Current Ask AI default, solid quality",     tag: "" },
  { name: "gemini-2.0-flash-lite",                  via: "Gemini API", ctx: "1M",   best: "Structured explanations, fast responses",   tag: "" },
];

// ── Helpers ─────────────────────────────────────────────────────────────────
function KeyInput({ value, onChange, placeholder, show, onToggleShow }) {
  return (
    <div className="amp-key-wrap">
      <input
        type={show ? "text" : "password"}
        className="amp-input"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
      />
      <button className="amp-eye-btn" onClick={onToggleShow} type="button">
        {show ? <EyeOff size={15} /> : <Eye size={15} />}
      </button>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div className={`amp-toast ${toast.type === "err" ? "amp-toast-err" : "amp-toast-ok"}`}>
      {toast.type === "err" ? <AlertTriangle size={14} /> : <CheckCircle size={14} />}
      {toast.msg}
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function AiModelsPage() {
  const navigate = useNavigate();

  const [provider,    setProviderState]   = useState(getAiProvider);
  const [geminiKey,   setGeminiKeyState]  = useState(getGeminiKey);
  const [showGKey,    setShowGKey]        = useState(false);
  const [orKey,       setOrKeyState]      = useState(getOpenRouterKey);
  const [showOrKey,   setShowOrKey]       = useState(false);
  const [orModel,     setOrModelState]    = useState(getOpenRouterModel);
  const [chatPuter,   setChatPuterState]  = useState(getChatModelPuter);
  const [chatOr,      setChatOrState]     = useState(getChatModelOpenRouter);
  const [toast,       setToast]           = useState(null);

  function flash(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  }

  function switchProvider(p) {
    setAiProvider(p);
    setProviderState(p);
    const labels = { puter: "Puter / GPT-4o", gemini: "Google Gemini", openrouter: "OpenRouter" };
    flash(`Provider switched to ${labels[p]}`);
  }

  function save(persister, value, msg) { persister(value.trim()); flash(msg); }

  const active = PROVIDERS.find(p => p.id === provider);

  return (
    <div className="amp-page">

      {/* Top bar */}
      <div className="amp-topbar">
        <button className="amp-back" onClick={() => navigate(-1)}>
          <ArrowLeft size={16} /> Back
        </button>
        <div className="amp-topbar-title">
          <Bot size={18} style={{ color: "#8b5cf6" }} />
          AI Models & Configuration
        </div>
        <Toast toast={toast} />
      </div>

      <div className="amp-body">

        {/* ── Provider cards ── */}
        <section className="amp-section">
          <h2 className="amp-section-title"><Zap size={15} /> Choose AI Provider</h2>
          <p className="amp-section-sub">Powers both the "Ask AI" button on node pages and the floating AI Chat panel.</p>

          <div className="amp-provider-grid">
            {PROVIDERS.map(p => {
              const isActive = provider === p.id;
              return (
                <button
                  key={p.id}
                  className={`amp-provider-card${isActive ? " amp-provider-card-active" : ""}`}
                  style={{ "--pcolor": p.color }}
                  onClick={() => switchProvider(p.id)}
                >
                  <div className="amp-card-header">
                    <div className="amp-card-icon" style={{ background: `${p.color}18`, color: p.color }}>
                      <p.Icon size={22} />
                    </div>
                    <span className="amp-badge" style={{ background: `${p.badgeColor}18`, color: p.badgeColor }}>
                      {p.badge}
                    </span>
                  </div>
                  <div className="amp-card-name">{p.name}</div>
                  <div className="amp-card-tagline">{p.tagline}</div>
                  {isActive && (
                    <div className="amp-card-check">
                      <Check size={13} /> Active
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Active provider details ── */}
        <section className="amp-section amp-detail-section" style={{ "--pcolor": active.color }}>
          <div className="amp-detail-header">
            <div className="amp-detail-icon" style={{ background: `${active.color}14`, color: active.color }}>
              <active.Icon size={24} />
            </div>
            <div>
              <h2 className="amp-detail-name">{active.name}</h2>
              <p className="amp-detail-desc">{active.description}</p>
            </div>
          </div>

          <div className="amp-detail-grid">
            <div className="amp-detail-card">
              <Globe size={14} style={{ color: active.color }} />
              <div>
                <div className="amp-dc-label">Context Window</div>
                <div className="amp-dc-val">{active.context}</div>
              </div>
            </div>
            <div className="amp-detail-card">
              <Shield size={14} style={{ color: active.color }} />
              <div>
                <div className="amp-dc-label">Pricing</div>
                <div className="amp-dc-val">{active.cost}</div>
              </div>
            </div>
          </div>

          <div className="amp-best-for">
            <div className="amp-best-label"><Sparkles size={13} /> Best for</div>
            <div className="amp-best-list">
              {active.bestFor.map(b => (
                <span key={b} className="amp-best-item"><Check size={11} /> {b}</span>
              ))}
            </div>
          </div>

          {/* Config */}
          <div className="amp-config-block">
            <p className="amp-config-note">{active.configNote}</p>

            {active.id === "gemini" && (
              <div className="amp-field-group">
                <label className="amp-field-label">{active.keyLabel}</label>
                <div className="amp-field-row">
                  <KeyInput
                    value={geminiKey}
                    onChange={e => setGeminiKeyState(e.target.value)}
                    placeholder={active.keyPlaceholder}
                    show={showGKey}
                    onToggleShow={() => setShowGKey(v => !v)}
                  />
                  <button className="amp-save-btn" onClick={() => { setGeminiKey(geminiKey.trim()); flash("Gemini key saved"); }}>
                    <Check size={15} /> Save
                  </button>
                </div>
                {!geminiKey && (
                  <p className="amp-warn"><AlertTriangle size={12} /> No key set — Ask AI will fail until you add a valid key.</p>
                )}
              </div>
            )}

            {active.id === "openrouter" && (
              <>
                <div className="amp-field-group">
                  <label className="amp-field-label">{active.keyLabel}</label>
                  <div className="amp-field-row">
                    <KeyInput
                      value={orKey}
                      onChange={e => setOrKeyState(e.target.value)}
                      placeholder={active.keyPlaceholder}
                      show={showOrKey}
                      onToggleShow={() => setShowOrKey(v => !v)}
                    />
                    <button className="amp-save-btn" onClick={() => { setOpenRouterKey(orKey.trim()); flash("OpenRouter key saved"); }}>
                      <Check size={15} /> Save
                    </button>
                  </div>
                  {!orKey && (
                    <p className="amp-warn"><AlertTriangle size={12} /> No key set — Ask AI will fail until you add a valid key.</p>
                  )}
                </div>
                <div className="amp-field-group">
                  <label className="amp-field-label">{active.modelLabel} <span className="amp-field-hint">for Ask AI on node pages</span></label>
                  <div className="amp-field-row">
                    <input className="amp-input" type="text" value={orModel} onChange={e => setOrModelState(e.target.value)} placeholder={active.modelPlaceholder} />
                    <button className="amp-save-btn" onClick={() => { setOpenRouterModel(orModel.trim()); flash("Model saved"); }}>
                      <Check size={15} /> Save
                    </button>
                  </div>
                </div>
              </>
            )}

            {active.id === "puter" && (
              <div className="amp-puter-note">
                <Check size={14} style={{ color: "#10b981" }} />
                Ready to use — no configuration required.
              </div>
            )}
          </div>
        </section>

        {/* ── Chat panel models ── */}
        <section className="amp-section">
          <h2 className="amp-section-title"><MessageSquare size={15} /> AI Chat Panel Models</h2>
          <p className="amp-section-sub">
            The floating <strong>AI Chat</strong> button uses these for multi-turn conversations.
            These are separate from the Ask AI feature on node pages.
          </p>

          <div className="amp-chat-models-grid">
            {/* Puter chat model */}
            <div className="amp-chat-model-card">
              <div className="amp-cm-header">
                <Bot size={16} style={{ color: "#6366f1" }} />
                <span className="amp-cm-title">Puter Chat Model</span>
                <span className="amp-badge" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>FREE</span>
              </div>
              <div className="amp-cm-quickpick">
                {PROVIDERS[0].chatModels.map(m => (
                  <button
                    key={m.id}
                    className={`amp-cm-pill${chatPuter === m.id ? " active" : ""}`}
                    onClick={() => { setChatModelPuter(m.id); setChatPuterState(m.id); flash(`Puter chat → ${m.label}`); }}
                    title={m.note}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="amp-field-row" style={{ marginTop: 10 }}>
                <input className="amp-input" type="text" value={chatPuter} onChange={e => setChatPuterState(e.target.value)} placeholder="e.g. gpt-4o" />
                <button className="amp-save-btn" onClick={() => { setChatModelPuter(chatPuter.trim()); flash("Puter chat model saved"); }}>
                  <Check size={15} /> Save
                </button>
              </div>
            </div>

            {/* OpenRouter chat model */}
            <div className="amp-chat-model-card">
              <div className="amp-cm-header">
                <Key size={16} style={{ color: "#8b5cf6" }} />
                <span className="amp-cm-title">OpenRouter Chat Model</span>
                <span className="amp-badge" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>FREE</span>
              </div>
              <div className="amp-cm-quickpick">
                {PROVIDERS[2].chatModels.map(m => (
                  <button
                    key={m.id}
                    className={`amp-cm-pill${chatOr === m.id ? " active" : ""}`}
                    onClick={() => { setChatModelOpenRouter(m.id); setChatOrState(m.id); flash(`OpenRouter chat → ${m.label}`); }}
                    title={m.note}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <div className="amp-field-row" style={{ marginTop: 10 }}>
                <input className="amp-input" type="text" value={chatOr} onChange={e => setChatOrState(e.target.value)} placeholder="deepseek/deepseek-chat:free" />
                <button className="amp-save-btn" onClick={() => { setChatModelOpenRouter(chatOr.trim()); flash("OpenRouter chat model saved"); }}>
                  <Check size={15} /> Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ── Free model reference ── */}
        <section className="amp-section">
          <h2 className="amp-section-title"><Sparkles size={15} /> Free Model Reference</h2>
          <p className="amp-section-sub">Copy any model ID above to use it.</p>
          <div className="amp-ref-table">
            <div className="amp-ref-thead">
              <span>Model</span>
              <span>Via</span>
              <span>Context</span>
              <span>Best for</span>
            </div>
            {FREE_MODELS.map(m => (
              <div key={m.name} className="amp-ref-row">
                <div className="amp-ref-name">
                  <code>{m.name}</code>
                  {m.tag && <span className="amp-ref-tag">{m.tag}</span>}
                </div>
                <span className="amp-ref-via">{m.via}</span>
                <span className="amp-ref-ctx">{m.ctx}</span>
                <span className="amp-ref-best">{m.best}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}
