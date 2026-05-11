import React, { useState, useMemo } from "react";
import { X, ChevronLeft, ChevronRight, Shuffle, Eye, RotateCcw } from "lucide-react";

function collectLeaves(nodes, path = []) {
  const out = [];
  for (const n of nodes) {
    const p = [...path, n.text];
    if (!n.children?.length) out.push({ ...n, _path: p });
    else out.push(...collectLeaves(n.children, p));
  }
  return out;
}

function shuffled(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function FlashcardMode({ treeData, onClose }) {
  const base         = useMemo(() => collectLeaves(treeData), [treeData]);
  const [cards, setCards]   = useState(base);
  const [idx, setIdx]       = useState(0);
  const [revealed, setReveal] = useState(false);

  const card = cards[idx];

  const next     = () => { setIdx(i => Math.min(i + 1, cards.length - 1)); setReveal(false); };
  const prev     = () => { setIdx(i => Math.max(i - 1, 0)); setReveal(false); };
  const doShuffle = () => { setCards(shuffled(base)); setIdx(0); setReveal(false); };
  const reset    = () => { setCards(base); setIdx(0); setReveal(false); };

  if (!card) return (
    <div className="overlay" onClick={onClose}>
      <div className="fc-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-hdr">
          <h2 className="modal-title">Flashcard Revision</h2>
          <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="fc-empty">No leaf nodes found in this topic.</div>
      </div>
    </div>
  );

  const progressPct = Math.round(((idx + 1) / cards.length) * 100);

  return (
    <div className="overlay" onClick={onClose}>
      <div className="fc-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-hdr">
          <h2 className="modal-title">Flashcard Revision</h2>
          <div className="fc-hdr-btns">
            <button className="fc-ctrl-btn" onClick={doShuffle} title="Shuffle"><Shuffle size={14} /> Shuffle</button>
            <button className="fc-ctrl-btn" onClick={reset} title="Reset order"><RotateCcw size={14} /> Reset</button>
            <button className="modal-close-btn" onClick={onClose}><X size={18} /></button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="fc-prog-bar-bg">
          <div className="fc-prog-bar-fill" style={{ width: `${progressPct}%` }} />
        </div>
        <div className="fc-counter">{idx + 1} / {cards.length}</div>

        {/* Breadcrumb path */}
        {card._path.length > 1 && (
          <div className="fc-path">
            {card._path.slice(0, -1).join(" › ")}
          </div>
        )}

        {/* Card */}
        <div className={`fc-card${revealed ? " fc-card-revealed" : ""}`}>
          <h3 className="fc-card-title">{card.text}</h3>

          {revealed ? (
            <div className="fc-card-body">
              {card.description
                ? card.description.split("\n").slice(0, 25).map((line, i) => (
                    <div key={i} className={line.trim() === "" ? "fc-spacer" : "fc-line"}>{line}</div>
                  ))
                : <em>No content for this node.</em>}
            </div>
          ) : (
            <button className="fc-reveal-btn" onClick={() => setReveal(true)}>
              <Eye size={20} />
              Tap to reveal content
            </button>
          )}
        </div>

        {/* Navigation */}
        <div className="fc-nav">
          <button className="fc-nav-btn" onClick={prev} disabled={idx === 0}>
            <ChevronLeft size={18} /> Prev
          </button>
          <button className="fc-nav-btn" onClick={next} disabled={idx === cards.length - 1}>
            Next <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
