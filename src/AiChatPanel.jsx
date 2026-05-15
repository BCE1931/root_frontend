import React, { useState, useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Bot, X, Plus, Send, Trash2, History,
  MessageSquare, AlertCircle, Loader2, ChevronLeft,
} from "lucide-react";
import { chatWithAi, getAiProvider, getChatModelPuter, getChatModelOpenRouter } from "./aiService";
import { getMode, getBackendUrl } from "./storage/index.js";

// ── LocalStorage helpers ──────────────────────────────────────────────────────
const KEY_CONVS  = "chat_conversations";
const KEY_ACTIVE = "chat_active_id";

function getLocalConvs()       { try { return JSON.parse(localStorage.getItem(KEY_CONVS)  || "[]"); } catch { return []; } }
function saveLocalConvs(list)  { localStorage.setItem(KEY_CONVS, JSON.stringify(list)); }
export function msgKey(id)     { return `chat_msgs_${id}`; }
function getLocalMsgs(id)      { try { return JSON.parse(localStorage.getItem(msgKey(id)) || "[]"); } catch { return []; } }
function saveLocalMsgs(id, m)  { localStorage.setItem(msgKey(id), JSON.stringify(m)); }
export { getLocalConvs, getLocalMsgs };

// ── Backend fire-and-forget helpers ───────────────────────────────────────────
async function backendPost(path, body) {
  if (getMode() !== "backend") return;
  try {
    await fetch(`${getBackendUrl()}${path}`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {}
}
async function backendPatch(path, body) {
  if (getMode() !== "backend") return;
  try {
    await fetch(`${getBackendUrl()}${path}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {}
}
async function backendDelete(path) {
  if (getMode() !== "backend") return;
  try { await fetch(`${getBackendUrl()}${path}`, { method: "DELETE" }); } catch {}
}

// ── Markdown renderer ─────────────────────────────────────────────────────────
function ChatText({ text }) {
  const lines = (text || "").split("\n");
  const elems = [];
  let listBuf = [];
  const flushList = () => {
    if (!listBuf.length) return;
    elems.push(<ul key={elems.length}>{listBuf.map((t, i) => <li key={i}>{renderInline(t)}</li>)}</ul>);
    listBuf = [];
  };
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^#{1,3} /.test(l)) {
      flushList();
      const lvl = l.match(/^(#+)/)[1].length;
      const txt = l.replace(/^#+\s*/, "");
      const Tag = lvl <= 2 ? "h3" : "h4";
      elems.push(<Tag key={elems.length} className="chat-md-h">{txt}</Tag>);
    } else if (/^[-*] /.test(l)) {
      listBuf.push(l.slice(2));
    } else if (l.trim() === "") {
      flushList();
      if (elems.length && elems[elems.length - 1]?.type !== "br")
        elems.push(<br key={elems.length} />);
    } else {
      flushList();
      elems.push(<p key={elems.length} className="chat-md-p">{renderInline(l)}</p>);
    }
  }
  flushList();
  return <div className="chat-text">{elems}</div>;
}

function renderInline(text) {
  const parts = [];
  const pattern = /(\*\*(.+?)\*\*|`([^`]+)`|\*([^*]+)\*)/g;
  let last = 0, m;
  pattern.lastIndex = 0;
  while ((m = pattern.exec(text)) !== null) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    if (m[2])      parts.push(<strong key={m.index}>{m[2]}</strong>);
    else if (m[3]) parts.push(<code key={m.index} className="chat-inline-code">{m[3]}</code>);
    else if (m[4]) parts.push(<em key={m.index}>{m[4]}</em>);
    last = m.index + m[0].length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  if (h < 24) return `${h}h ago`;
  return `${d}d ago`;
}

function activeModelLabel() {
  const p = getAiProvider();
  if (p === "gemini")     return "Gemini 2.0 Flash";
  if (p === "openrouter") return getChatModelOpenRouter();
  return getChatModelPuter();
}

// ── Main component ────────────────────────────────────────────────────────────
export default function AiChatPanel({ open: propOpen, onOpenChange }) {
  const [localOpen, setLocalOpen] = useState(false);
  const open    = propOpen    !== undefined ? propOpen    : localOpen;
  const setOpen = onOpenChange !== undefined ? onOpenChange : setLocalOpen;

  const [conversations, setConversations] = useState([]);
  const [activeId,      setActiveId]      = useState(null);
  const [messages,      setMessages]      = useState([]);
  const [input,         setInput]         = useState("");
  const [sending,       setSending]       = useState(false);
  const [error,         setError]         = useState(null);
  const [showHistory,   setShowHistory]   = useState(false);
  const [showConfirm,   setShowConfirm]   = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [loadingMsgs,   setLoadingMsgs]   = useState(false);

  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  // ── Load conversations when panel opens ───────────────────────────────────
  useEffect(() => {
    if (!open) return;
    loadConversations();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  async function loadConversations() {
    if (getMode() === "backend") {
      try {
        const res = await fetch(`${getBackendUrl()}/chats`);
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          saveLocalConvs(data);
          const saved = localStorage.getItem(KEY_ACTIVE);
          const target = data.find(c => c.id === saved) ? saved : (data[0]?.id ?? null);
          if (target) await switchConvById(target);
          return;
        }
      } catch {}
    }
    const convs = getLocalConvs();
    setConversations(convs);
    const saved = localStorage.getItem(KEY_ACTIVE);
    if (saved) { setActiveId(saved); setMessages(getLocalMsgs(saved)); }
  }

  // ── Switch conversation ───────────────────────────────────────────────────
  const switchConvById = useCallback(async (id) => {
    setActiveId(id);
    localStorage.setItem(KEY_ACTIVE, id);
    setShowHistory(false);
    setError(null);

    if (getMode() === "backend") {
      setLoadingMsgs(true);
      try {
        const res = await fetch(`${getBackendUrl()}/chats/${id}/messages`);
        if (res.ok) {
          const data = await res.json();
          const msgs = data.map(m => ({
            id: m.id, role: m.role, content: m.content,
            model: m.model || "", createdAt: m.createdAt,
          }));
          setMessages(msgs);
          saveLocalMsgs(id, msgs);
          return;
        }
      } catch {} finally {
        setLoadingMsgs(false);
      }
    }
    setMessages(getLocalMsgs(id));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Scroll to bottom ──────────────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // ── Focus input on open ───────────────────────────────────────────────────
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 120);
  }, [open]);

  // ── Create conversation ───────────────────────────────────────────────────
  const createConversation = useCallback(() => {
    const id   = uuidv4();
    const now  = new Date().toISOString();
    const conv = { id, title: "New Conversation", messageCount: 0, createdAt: now, updatedAt: now };
    const updated = [conv, ...getLocalConvs()];
    saveLocalConvs(updated);
    setConversations(updated);
    setActiveId(id);
    localStorage.setItem(KEY_ACTIVE, id);
    setMessages([]);
    setShowConfirm(false);
    setShowHistory(false);
    setError(null);
    backendPost("/chats", { id, title: "New Conversation" });
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleNewClick = () => {
    if (messages.length > 0) { setShowConfirm(true); return; }
    createConversation();
  };

  // ── Delete conversation ───────────────────────────────────────────────────
  const confirmDelete = useCallback((id) => {
    const updated = getLocalConvs().filter(c => c.id !== id);
    saveLocalConvs(updated);
    localStorage.removeItem(msgKey(id));
    setConversations(updated);
    setPendingDelete(null);
    backendDelete(`/chats/${id}`);
    if (activeId === id) {
      if (updated.length > 0) switchConvById(updated[0].id);
      else { setActiveId(null); setMessages([]); localStorage.removeItem(KEY_ACTIVE); }
    }
  }, [activeId, switchConvById]);

  // ── Rename from first message ─────────────────────────────────────────────
  const renameConv = useCallback((id, firstMsg) => {
    const title = firstMsg.slice(0, 60) + (firstMsg.length > 60 ? "…" : "");
    const updated = getLocalConvs().map(c => c.id === id ? { ...c, title } : c);
    saveLocalConvs(updated);
    setConversations(updated);
    backendPatch(`/chats/${id}`, { title });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending) return;

    let convId = activeId;
    if (!convId) {
      convId = uuidv4();
      const now  = new Date().toISOString();
      const conv = { id: convId, title: "New Conversation", messageCount: 0, createdAt: now, updatedAt: now };
      const updated = [conv, ...getLocalConvs()];
      saveLocalConvs(updated);
      setConversations(updated);
      setActiveId(convId);
      localStorage.setItem(KEY_ACTIVE, convId);
      backendPost("/chats", { id: convId, title: "New Conversation" });
    }

    const userMsg = { id: uuidv4(), role: "user", content: text, createdAt: new Date().toISOString() };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    saveLocalMsgs(convId, nextMsgs);
    backendPost(`/chats/${convId}/messages`, { ...userMsg, model: "" });
    if (messages.length === 0) renameConv(convId, text);

    setInput("");
    resetInputHeight();
    setSending(true);
    setError(null);

    try {
      const history = nextMsgs.map(m => ({ role: m.role, content: m.content }));
      const { text: aiText, model } = await chatWithAi(history);
      const aiMsg = { id: uuidv4(), role: "assistant", content: aiText, model, createdAt: new Date().toISOString() };
      const finalMsgs = [...nextMsgs, aiMsg];
      setMessages(finalMsgs);
      saveLocalMsgs(convId, finalMsgs);
      backendPost(`/chats/${convId}/messages`, { ...aiMsg });
      setConversations(prev =>
        prev.map(c => c.id === convId
          ? { ...c, messageCount: (c.messageCount || 0) + 2, updatedAt: new Date().toISOString() }
          : c
        )
      );
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSending(false);
    }
  }, [input, sending, activeId, messages, renameConv]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const ta = e.target;
    ta.style.height = "auto";
    ta.style.height = Math.min(ta.scrollHeight, 180) + "px";
  };

  const resetInputHeight = () => {
    if (inputRef.current) inputRef.current.style.height = "auto";
  };

  const activeConv = conversations.find(c => c.id === activeId);

  const userName = (() => {
    try {
      const p = JSON.parse(localStorage.getItem("user_profile") || "{}");
      const n = (p.firstName || p.name || "").trim();
      return n.split(" ")[0] || "";
    } catch { return ""; }
  })();

  const SUGGESTIONS = [
    "Explain this topic",
    "Give me examples",
    "Quiz me",
    "Key takeaways",
    "Real-world use cases",
  ];

  const handleSuggestion = (text) => {
    setInput(text);
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.style.height = "auto";
        inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 180) + "px";
      }
    }, 0);
  };

  return (
    <>
      {/* ── FAB ── */}
      <button
        className={`aichat-fab${open ? " aichat-fab-active" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="AI Chat"
        aria-label="Open AI Chat"
      >
        {open ? <X size={20} /> : <Bot size={20} />}
      </button>

      {/* ── Panel ── */}
      <div className={`aichat-panel${open ? " aichat-panel-open" : ""}`}>

        {/* Header — minimal, icon + actions only */}
        <div className="aichat-header">
          <div className="aichat-header-brand">
            <div className="aichat-header-avatar"><Bot size={14} /></div>
          </div>
          <div className="aichat-header-actions">
            <button
              className={`aichat-hdr-btn${showHistory ? " aichat-hdr-btn-active" : ""}`}
              onClick={() => setShowHistory(v => !v)}
              title="Conversation history"
            >
              <History size={15} />
            </button>
            <button className="aichat-hdr-btn" onClick={handleNewClick} title="New conversation">
              <Plus size={15} />
            </button>
            <button className="aichat-hdr-btn" onClick={() => setOpen(false)} title="Close">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* History drawer — slides over messages */}
        <div className={`aichat-history${showHistory ? " aichat-history-open" : ""}`}>
          <div className="aichat-history-hdr">
            <button className="aichat-hdr-btn" onClick={() => setShowHistory(false)}>
              <ChevronLeft size={15} />
            </button>
            <span className="aichat-history-title">Conversations</span>
            <button className="aichat-hdr-btn" onClick={createConversation} title="New conversation">
              <Plus size={15} />
            </button>
          </div>
          <div className="aichat-history-list">
            {conversations.length === 0 && (
              <div className="aichat-history-empty">No conversations yet.<br />Start chatting to create one!</div>
            )}
            {conversations.map(c => (
              <div key={c.id} className={`aichat-history-item${c.id === activeId ? " active" : ""}`}>
                <button className="aichat-history-item-btn" onClick={() => switchConvById(c.id)}>
                  <MessageSquare size={13} className="aichat-history-item-icon" />
                  <div className="aichat-history-item-info">
                    <span className="aichat-history-item-title">{c.title}</span>
                    <span className="aichat-history-item-meta">
                      {c.messageCount > 0 ? `${c.messageCount} messages · ` : ""}
                      {timeAgo(c.updatedAt || c.createdAt)}
                    </span>
                  </div>
                </button>
                <button
                  className="aichat-conv-del"
                  onClick={e => { e.stopPropagation(); setPendingDelete(c.id); }}
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="aichat-messages">
          {messages.length === 0 && !sending && !loadingMsgs ? (
            <div className="aichat-empty">
              <div className="aichat-empty-avatar"><Bot size={26} /></div>
              <h3 className="aichat-empty-greeting">Hi{userName ? `, ${userName}` : ""}! 👋</h3>
              <p className="aichat-empty-text">I'm your AI learning assistant.<br/>What would you like to explore?</p>
              <p className="aichat-empty-sub">Model: {activeModelLabel()}</p>
              <div className="aichat-chips">
                {SUGGESTIONS.map(s => (
                  <button key={s} className="aichat-chip" onClick={() => handleSuggestion(s)}>{s}</button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* spacer pushes messages to bottom when content is short */}
              <div className="aichat-msgs-spacer" />

              {loadingMsgs && (
                <div className="aichat-loading-msgs">
                  <Loader2 size={20} className="aichat-spin" style={{ color: "#8b5cf6" }} />
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className={`aichat-msg aichat-msg-${msg.role}`}>
                  {msg.role === "assistant" && (
                    <div className="aichat-msg-avatar"><Bot size={13} /></div>
                  )}
                  <div className="aichat-msg-bubble">
                    {msg.role === "assistant"
                      ? <ChatText text={msg.content} />
                      : <p className="chat-md-p">{msg.content}</p>
                    }
                    {msg.role === "assistant" && msg.model && (
                      <div className="aichat-msg-model">{msg.model}</div>
                    )}
                  </div>
                </div>
              ))}

              {sending && (
                <div className="aichat-msg aichat-msg-assistant">
                  <div className="aichat-msg-avatar"><Bot size={13} /></div>
                  <div className="aichat-msg-bubble aichat-typing">
                    <span /><span /><span />
                  </div>
                </div>
              )}

              {error && (
                <div className="aichat-error"><AlertCircle size={14} /> {error}</div>
              )}
              <div ref={bottomRef} />
            </>
          )}
        </div>

        {/* Input — Claude-style auto-grow box */}
        <div className="aichat-input-bar">
          <div className={`aichat-input-wrap${sending ? " disabled" : ""}`}>
            <textarea
              ref={inputRef}
              className="aichat-input"
              placeholder="Ask anything…"
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKey}
              rows={1}
              disabled={sending}
            />
            <div className="aichat-input-row">
              <span className="aichat-input-hint">Enter to send · Shift+Enter for newline</span>
              <button
                className="aichat-send-btn"
                onClick={handleSend}
                disabled={!input.trim() || sending}
                title="Send"
              >
                {sending ? <Loader2 size={15} className="aichat-spin" /> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm: new conversation */}
      {showConfirm && (
        <div className="aichat-confirm-overlay" onClick={() => setShowConfirm(false)}>
          <div className="aichat-confirm-box" onClick={e => e.stopPropagation()}>
            <p>Start a new conversation? The current one stays in history.</p>
            <div className="aichat-confirm-btns">
              <button className="aichat-confirm-yes" onClick={createConversation}>Yes, start new</button>
              <button className="aichat-confirm-no"  onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm: delete */}
      {pendingDelete && (
        <div className="aichat-confirm-overlay" onClick={() => setPendingDelete(null)}>
          <div className="aichat-confirm-box" onClick={e => e.stopPropagation()}>
            <p>Delete this conversation? This cannot be undone.</p>
            <div className="aichat-confirm-btns">
              <button className="aichat-confirm-yes aichat-confirm-danger" onClick={() => confirmDelete(pendingDelete)}>Delete</button>
              <button className="aichat-confirm-no" onClick={() => setPendingDelete(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
