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
  getPollinationsModel, setPollinationsModel,
} from "./aiService.js";

// ── Provider definitions ────────────────────────────────────────────────────
const PROVIDERS = [
  {
    id:          "pollinations",
    Icon:        Zap,
    color:       "#10b981",
    name:        "Pollinations AI",
    tagline:     "Zero signup · Zero API key · Always free",
    badge:       "NO SIGNUP",
    badgeColor:  "#10b981",
    description: "Pollinations gives you instant access to GPT-4o, Llama 3.3 70B, Mistral, and DeepSeek R1 — completely free, no account needed. Best choice for diet & gym AI coaching.",
    bestFor:     ["Diet & gym AI coaching", "No signup needed", "Instant setup", "Health & fitness advice (Llama)"],
    context:     "128k tokens",
    cost:        "Always free — no account or card",
    configNote:  "No configuration required. Just pick your preferred model below and start using.",
    needsKey:    false,
    chatModels:  [
      { id: "openai",            label: "GPT-4o mini",        note: "Fast, reliable — default"     },
      { id: "openai-large",      label: "GPT-4o",             note: "Best quality — recommended for fitness" },
      { id: "llama",             label: "Llama 3.3 70B",      note: "Best for health & fitness advice" },
      { id: "mistral",           label: "Mistral Nemo",       note: "Good general purpose"         },
      { id: "deepseek-reasoner", label: "DeepSeek R1",        note: "Chain-of-thought reasoning"   },
    ],
  },
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
  { name: "llama (Llama 3.3 70B)",    via: "Pollinations", ctx: "128k", best: "Best for diet & gym fitness advice — no signup",     tag: "🏋️ Fitness AI" },
  { name: "openai-large (GPT-4o)",    via: "Pollinations", ctx: "128k", best: "Best overall quality — no signup required",         tag: "⭐ Top pick" },
  { name: "openai (GPT-4o mini)",     via: "Pollinations", ctx: "128k", best: "Fast, free, no signup — great for daily tracking",  tag: "No signup" },
  { name: "deepseek-reasoner (R1)",   via: "Pollinations", ctx: "64k",  best: "Reasoning model, detailed health analysis",         tag: "No signup" },
  { name: "gpt-4o",                                 via: "Puter",      ctx: "128k", best: "Free via Puter (needs Google login)",         tag: "" },
  { name: "deepseek/deepseek-chat-v3-0324:free",    via: "OpenRouter", ctx: "128k", best: "Best free long-context reasoning, coding",    tag: "" },
  { name: "deepseek/deepseek-r1:free",              via: "OpenRouter", ctx: "64k",  best: "Chain-of-thought reasoning, math, logic",     tag: "Reasoning" },
  { name: "google/gemini-2.0-flash-exp:free",       via: "OpenRouter", ctx: "1M",   best: "Ultra-long context, code, multimodal",        tag: "1M context" },
  { name: "meta-llama/llama-3.3-70b-instruct:free", via: "OpenRouter", ctx: "128k", best: "Reliable open-source, good for teaching",     tag: "" },
  { name: "gemini-2.0-flash-lite",                  via: "Gemini API", ctx: "1M",   best: "Structured explanations, fast responses",     tag: "" },
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

  const [provider,       setProviderState]      = useState(getAiProvider);
  const [geminiKey,      setGeminiKeyState]     = useState(getGeminiKey);
  const [showGKey,       setShowGKey]           = useState(false);
  const [orKey,          setOrKeyState]         = useState(getOpenRouterKey);
  const [showOrKey,      setShowOrKey]          = useState(false);
  const [orModel,        setOrModelState]       = useState(getOpenRouterModel);
  const [chatPuter,      setChatPuterState]     = useState(getChatModelPuter);
  const [chatOr,         setChatOrState]        = useState(getChatModelOpenRouter);
  const [pollModel,      setPollModelState]     = useState(getPollinationsModel);
  const [toast,          setToast]              = useState(null);

  function flash(msg, type = "ok") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2600);
  }

  function switchProvider(p) {
    setAiProvider(p);
    setProviderState(p);
    const labels = { pollinations: "Pollinations AI", puter: "Puter / GPT-4o", gemini: "Google Gemini", openrouter: "OpenRouter" };
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

      <div className="amp-layout">

        {/* ── LEFT PANEL ── */}
        <div className="amp-left">

          {/* Provider picker */}
          <section className="amp-section">
            <h2 className="amp-section-title"><Zap size={15} /> Choose AI Provider</h2>
            <p className="amp-section-sub">Powers "Ask AI" on node pages and the AI Chat panel.</p>
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
                    <div className="amp-card-icon" style={{ background: `${p.color}18`, color: p.color }}>
                      <p.Icon size={20} />
                    </div>
                    <div className="amp-card-text">
                      <div className="amp-card-name">{p.name}</div>
                      <div className="amp-card-tagline">{p.tagline}</div>
                    </div>
                    <div className="amp-card-right">
                      <span className="amp-badge" style={{ background: `${p.badgeColor}18`, color: p.badgeColor }}>
                        {p.badge}
                      </span>
                      {isActive && <div className="amp-card-check"><Check size={11} /> Active</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Free model reference */}
          <section className="amp-section">
            <h2 className="amp-section-title"><Sparkles size={15} /> Free Model Reference</h2>
            <p className="amp-section-sub">All models available to use right now.</p>
            <div className="amp-ref-list">
              {FREE_MODELS.map(m => (
                <div key={m.name} className="amp-ref-item">
                  <div className="amp-ref-item-top">
                    <code className="amp-ref-code">{m.name}</code>
                    <div className="amp-ref-badges">
                      <span className="amp-ref-via-badge">{m.via}</span>
                      <span className="amp-ref-ctx-badge">{m.ctx}</span>
                      {m.tag && <span className="amp-ref-tag">{m.tag}</span>}
                    </div>
                  </div>
                  <div className="amp-ref-desc">{m.best}</div>
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="amp-right">

          {/* Active provider details + config */}
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

            <div className="amp-config-block">
              <p className="amp-config-note">{active.configNote}</p>
              {active.id === "gemini" && (
                <div className="amp-field-group">
                  <label className="amp-field-label">{active.keyLabel}</label>
                  <div className="amp-field-row">
                    <KeyInput value={geminiKey} onChange={e => setGeminiKeyState(e.target.value)} placeholder={active.keyPlaceholder} show={showGKey} onToggleShow={() => setShowGKey(v => !v)} />
                    <button className="amp-save-btn" onClick={() => { setGeminiKey(geminiKey.trim()); flash("Gemini key saved"); }}><Check size={15} /> Save</button>
                  </div>
                  {!geminiKey && <p className="amp-warn"><AlertTriangle size={12} /> No key set — Ask AI will fail.</p>}
                </div>
              )}
              {active.id === "openrouter" && (
                <>
                  <div className="amp-field-group">
                    <label className="amp-field-label">{active.keyLabel}</label>
                    <div className="amp-field-row">
                      <KeyInput value={orKey} onChange={e => setOrKeyState(e.target.value)} placeholder={active.keyPlaceholder} show={showOrKey} onToggleShow={() => setShowOrKey(v => !v)} />
                      <button className="amp-save-btn" onClick={() => { setOpenRouterKey(orKey.trim()); flash("OpenRouter key saved"); }}><Check size={15} /> Save</button>
                    </div>
                    {!orKey && <p className="amp-warn"><AlertTriangle size={12} /> No key set — Ask AI will fail.</p>}
                  </div>
                  <div className="amp-field-group">
                    <label className="amp-field-label">{active.modelLabel} <span className="amp-field-hint">for Ask AI on node pages</span></label>
                    <div className="amp-field-row">
                      <input className="amp-input" type="text" value={orModel} onChange={e => setOrModelState(e.target.value)} placeholder={active.modelPlaceholder} />
                      <button className="amp-save-btn" onClick={() => { setOpenRouterModel(orModel.trim()); flash("Model saved"); }}><Check size={15} /> Save</button>
                    </div>
                  </div>
                </>
              )}
              {active.id === "pollinations" && (
                <>
                  <div className="amp-puter-note"><Check size={14} style={{ color: "#10b981" }} /> Ready — no key needed. Pick a model below.</div>
                  <div className="amp-field-group" style={{ marginTop: 12 }}>
                    <label className="amp-field-label">Model <span className="amp-field-hint">used for Diet AI, Gym AI, and Chat</span></label>
                    <div className="amp-cm-quickpick" style={{ marginBottom: 8 }}>
                      {PROVIDERS[0].chatModels.map(m => (
                        <button key={m.id} className={`amp-cm-pill${pollModel === m.id ? " active" : ""}`}
                          onClick={() => { setPollinationsModel(m.id); setPollModelState(m.id); flash(`Model → ${m.label}`); }}
                          title={m.note}>{m.label}</button>
                      ))}
                    </div>
                    <div className="amp-field-row">
                      <input className="amp-input" type="text" value={pollModel} onChange={e => setPollModelState(e.target.value)} placeholder="openai" />
                      <button className="amp-save-btn" onClick={() => { setPollinationsModel(pollModel.trim()); flash("Model saved"); }}><Check size={15} /> Save</button>
                    </div>
                    <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 6 }}>💡 Use <strong>llama</strong> or <strong>openai-large</strong> for best diet & gym AI suggestions.</p>
                  </div>
                </>
              )}
              {active.id === "puter" && (
                <div className="amp-puter-note"><Check size={14} style={{ color: "#10b981" }} /> Ready to use — no configuration required.</div>
              )}
            </div>
          </section>

          {/* Chat panel models */}
          <section className="amp-section">
            <h2 className="amp-section-title"><MessageSquare size={15} /> AI Chat Panel Models</h2>
            <p className="amp-section-sub">The floating chat button uses these for multi-turn conversations — separate from Ask AI on node pages.</p>
            <div className="amp-chat-models-grid">
              <div className="amp-chat-model-card">
                <div className="amp-cm-header">
                  <Bot size={16} style={{ color: "#6366f1" }} />
                  <span className="amp-cm-title">Puter Chat Model</span>
                  <span className="amp-badge" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>FREE</span>
                </div>
                <div className="amp-cm-quickpick">
                  {PROVIDERS.find(p => p.id === "puter").chatModels.map(m => (
                    <button key={m.id} className={`amp-cm-pill${chatPuter === m.id ? " active" : ""}`} onClick={() => { setChatModelPuter(m.id); setChatPuterState(m.id); flash(`Puter chat → ${m.label}`); }} title={m.note}>{m.label}</button>
                  ))}
                </div>
                <div className="amp-field-row" style={{ marginTop: 10 }}>
                  <input className="amp-input" type="text" value={chatPuter} onChange={e => setChatPuterState(e.target.value)} placeholder="e.g. gpt-4o" />
                  <button className="amp-save-btn" onClick={() => { setChatModelPuter(chatPuter.trim()); flash("Saved"); }}><Check size={15} /> Save</button>
                </div>
              </div>
              <div className="amp-chat-model-card">
                <div className="amp-cm-header">
                  <Key size={16} style={{ color: "#8b5cf6" }} />
                  <span className="amp-cm-title">OpenRouter Chat Model</span>
                  <span className="amp-badge" style={{ background: "rgba(16,185,129,0.12)", color: "#10b981" }}>FREE</span>
                </div>
                <div className="amp-cm-quickpick">
                  {PROVIDERS.find(p => p.id === "openrouter").chatModels.map(m => (
                    <button key={m.id} className={`amp-cm-pill${chatOr === m.id ? " active" : ""}`} onClick={() => { setChatModelOpenRouter(m.id); setChatOrState(m.id); flash(`OpenRouter → ${m.label}`); }} title={m.note}>{m.label}</button>
                  ))}
                </div>
                <div className="amp-field-row" style={{ marginTop: 10 }}>
                  <input className="amp-input" type="text" value={chatOr} onChange={e => setChatOrState(e.target.value)} placeholder="deepseek/deepseek-chat:free" />
                  <button className="amp-save-btn" onClick={() => { setChatModelOpenRouter(chatOr.trim()); flash("Saved"); }}><Check size={15} /> Save</button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
