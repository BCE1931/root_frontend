import React, { useMemo } from "react";
import { X, CheckCircle2, Flame, Calendar, Target } from "lucide-react";

function countNodes(nodes) {
  let total = 0, done = 0;
  const walk = (ns) => {
    for (const n of ns) {
      total++;
      if (n.completed) done++;
      if (n.children?.length) walk(n.children);
    }
  };
  walk(nodes);
  return { total, done };
}

function getStreak() {
  try {
    const d = JSON.parse(localStorage.getItem("streak_data") || "{}");
    return { count: d.count || 0, lastDate: d.lastDate || null };
  } catch { return { count: 0, lastDate: null }; }
}

export default function ProgressDashboard({ treeData, topic, onClose }) {
  const { total, done } = useMemo(() => countNodes(treeData), [treeData]);
  const pct    = total ? Math.round((done / total) * 100) : 0;
  const streak = getStreak();

  const daysLeft = useMemo(() => {
    const gate = new Date("2027-02-01");
    return Math.max(0, Math.ceil((gate - new Date()) / 86400000));
  }, []);

  const rootStats = useMemo(() =>
    treeData.map(root => {
      const { total: t, done: d } = countNodes([root]);
      return { id: root.id, text: root.text, total: t, done: d, pct: t ? Math.round((d / t) * 100) : 0 };
    }), [treeData]);

  const totalStudyMins = useMemo(() => {
    let secs = 0;
    const walk = (ns) => { for (const n of ns) { secs += n.studyTime || 0; if (n.children?.length) walk(n.children); } };
    walk(treeData);
    return Math.round(secs / 60);
  }, [treeData]);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="pd-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2 className="modal-title">Progress Dashboard</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>

        {/* Stat cards */}
        <div className="pd-stats">
          <div className="pd-card pd-card-green">
            <CheckCircle2 size={20} />
            <div className="pd-val">{pct}%</div>
            <div className="pd-lbl">Complete</div>
            <div className="pd-bar-bg"><div className="pd-bar-fill" style={{ width: `${pct}%`, background: "var(--success)" }} /></div>
          </div>
          <div className="pd-card pd-card-blue">
            <Target size={20} />
            <div className="pd-val">{done}<span className="pd-sub">/{total}</span></div>
            <div className="pd-lbl">Nodes Done</div>
          </div>
          <div className="pd-card pd-card-orange">
            <Flame size={20} />
            <div className="pd-val">{streak.count}</div>
            <div className="pd-lbl">Day Streak</div>
          </div>
          <div className="pd-card pd-card-purple">
            <Calendar size={20} />
            <div className="pd-val">{topic === "gate" ? daysLeft : totalStudyMins}</div>
            <div className="pd-lbl">{topic === "gate" ? "Days to GATE" : "Min Studied"}</div>
          </div>
        </div>

        {/* Breakdown */}
        <h3 className="pd-breakdown-title">Section Breakdown</h3>
        <div className="pd-breakdown">
          {rootStats.map(s => (
            <div key={s.id} className="pd-row">
              <div className="pd-row-name" title={s.text}>{s.text}</div>
              <div className="pd-row-bar">
                <div className="pd-row-fill" style={{ width: `${s.pct}%` }} />
              </div>
              <div className="pd-row-nums">{s.done}/{s.total}</div>
              <div className="pd-row-pct">{s.pct}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
