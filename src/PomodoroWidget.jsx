import React, { useState, useEffect, useRef } from "react";
import { Timer, X, Play, Pause, RotateCcw, Coffee } from "lucide-react";

const MODES = { focus: 25 * 60, break: 5 * 60 };

function notify(title, body) {
  if (Notification.permission === "granted") new Notification(title, { body });
}

export default function PomodoroWidget() {
  const [open,     setOpen]     = useState(false);
  const [mode,     setMode]     = useState("focus");
  const [secs,     setSecs]     = useState(MODES.focus);
  const [running,  setRunning]  = useState(false);
  const [sessions, setSessions] = useState(() => {
    try { return parseInt(localStorage.getItem("pomo_sessions") || "0"); } catch { return 0; }
  });
  const ivRef = useRef(null);

  useEffect(() => {
    if (!running) { clearInterval(ivRef.current); return; }
    ivRef.current = setInterval(() => {
      setSecs(s => {
        if (s > 1) return s - 1;
        clearInterval(ivRef.current);
        setRunning(false);
        if (mode === "focus") {
          setSessions(p => { const n = p + 1; localStorage.setItem("pomo_sessions", n); return n; });
          setMode("break"); setSecs(MODES.break);
          notify("🍅 Focus complete!", "Take a 5-minute break. Well done!");
        } else {
          setMode("focus"); setSecs(MODES.focus);
          notify("☕ Break over!", "Time to focus again!");
        }
        return 0;
      });
    }, 1000);
    return () => clearInterval(ivRef.current);
  }, [running, mode]);

  const toggle = () => {
    if (!running && Notification.permission === "default") Notification.requestPermission();
    setRunning(v => !v);
  };
  const reset      = () => { setRunning(false); setSecs(MODES[mode]); };
  const switchMode = (m) => { setRunning(false); setMode(m); setSecs(MODES[m]); };

  const mins  = String(Math.floor(secs / 60)).padStart(2, "0");
  const sec   = String(secs % 60).padStart(2, "0");
  const total = MODES[mode];
  const pct   = ((total - secs) / total) * 100;
  const r     = 44;
  const circ  = 2 * Math.PI * r;

  return (
    <>
      <button
        className={`pomo-fab${running ? " pomo-fab-running" : ""}${open ? " pomo-fab-open" : ""}`}
        onClick={() => setOpen(v => !v)}
        title="Pomodoro Timer"
        aria-label="Pomodoro Timer"
      >
        <Timer size={18} />
        {running && <span className="pomo-fab-badge">{mins}:{sec}</span>}
      </button>

      {open && (
        <div className="pomo-panel">
          <div className="pomo-hdr">
            <div className="pomo-hdr-left">
              <Timer size={13} />
              <span>Pomodoro</span>
              {sessions > 0 && <span className="pomo-sessions-badge">🍅 {sessions} session{sessions !== 1 ? "s" : ""}</span>}
            </div>
            <button className="pomo-hdr-close" onClick={() => setOpen(false)}><X size={13} /></button>
          </div>

          <div className="pomo-mode-tabs">
            <button className={`pomo-tab${mode === "focus" ? " active" : ""}`} onClick={() => switchMode("focus")}>Focus · 25m</button>
            <button className={`pomo-tab${mode === "break" ? " active" : ""}`} onClick={() => switchMode("break")}><Coffee size={11} /> Break · 5m</button>
          </div>

          <div className="pomo-ring-wrap">
            <svg viewBox="0 0 100 100" className="pomo-svg">
              <circle cx="50" cy="50" r={r} className="pomo-ring-track" />
              <circle
                cx="50" cy="50" r={r}
                className={`pomo-ring-fill${mode === "break" ? " pomo-break-fill" : ""}`}
                strokeDasharray={circ}
                strokeDashoffset={circ * (1 - pct / 100)}
                transform="rotate(-90 50 50)"
              />
            </svg>
            <div className="pomo-center">
              <span className="pomo-time-display">{mins}:{sec}</span>
              <span className="pomo-mode-lbl">{mode === "focus" ? "Focus" : "Break"}</span>
            </div>
          </div>

          <div className="pomo-controls">
            <button className="pomo-ctrl-btn pomo-reset-btn" onClick={reset} title="Reset">
              <RotateCcw size={14} />
            </button>
            <button className={`pomo-ctrl-btn pomo-play-btn${running ? " running" : ""}`} onClick={toggle}>
              {running ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button className="pomo-ctrl-btn pomo-switch-btn" onClick={() => switchMode(mode === "focus" ? "break" : "focus")} title="Switch mode">
              <Coffee size={14} />
            </button>
          </div>

          <p className="pomo-tip">
            {running
              ? mode === "focus" ? "Stay focused! You got this 💪" : "Rest your eyes, stretch a bit 🧘"
              : "Press play to start your session"}
          </p>
        </div>
      )}
    </>
  );
}
