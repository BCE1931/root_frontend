import React, { useState, useEffect, useRef } from "react";
import { Search, X, ChevronRight } from "lucide-react";

function flattenTree(nodes, path = []) {
  const out = [];
  for (const n of nodes) {
    const p = [...path, n.text];
    out.push({ ...n, _path: p });
    if (n.children?.length) out.push(...flattenTree(n.children, p));
  }
  return out;
}

export default function SearchPalette({ treeData, onClose, onNavigate }) {
  const [query, setQuery]   = useState("");
  const [results, setResults] = useState([]);
  const [sel, setSel]       = useState(0);
  const inputRef            = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    if (!query.trim()) { setResults([]); return; }
    const flat = flattenTree(treeData);
    const q    = query.toLowerCase();
    const hits = flat.filter(n =>
      n.text.toLowerCase().includes(q) ||
      n.description?.toLowerCase().includes(q)
    ).slice(0, 18);
    setResults(hits);
    setSel(0);
  }, [query, treeData]);

  const go = (id) => { onNavigate(id); onClose(); };

  const onKey = (e) => {
    if (e.key === "ArrowDown")  { setSel(s => Math.min(s + 1, results.length - 1)); e.preventDefault(); }
    if (e.key === "ArrowUp")    { setSel(s => Math.max(s - 1, 0)); e.preventDefault(); }
    if (e.key === "Enter" && results[sel]) go(results[sel].id);
    if (e.key === "Escape")     onClose();
  };

  return (
    <div className="sp-overlay" onClick={onClose}>
      <div className="sp-modal" onClick={e => e.stopPropagation()}>
        <div className="sp-input-row">
          <Search size={15} className="sp-icon" />
          <input
            ref={inputRef}
            className="sp-input"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKey}
            placeholder="Search nodes and content…"
          />
          <kbd className="sp-kbd">Esc</kbd>
          <button className="sp-x" onClick={onClose}><X size={15} /></button>
        </div>

        {results.length > 0 && (
          <div className="sp-results">
            {results.map((r, i) => (
              <button
                key={r.id}
                className={`sp-item${i === sel ? " sp-item-sel" : ""}`}
                onClick={() => go(r.id)}
                onMouseEnter={() => setSel(i)}
              >
                {r._path.length > 1 && (
                  <div className="sp-path">
                    {r._path.slice(0, -1).map((p, j) => (
                      <span key={j}>{p}<ChevronRight size={9} /></span>
                    ))}
                  </div>
                )}
                <div className="sp-title">{r.text}</div>
                {r.description && (
                  <div className="sp-snippet">
                    {r.description.replace(/\n/g, " ").slice(0, 90)}…
                  </div>
                )}
              </button>
            ))}
          </div>
        )}

        {query.trim() && results.length === 0 && (
          <div className="sp-empty">No results for "{query}"</div>
        )}
        {!query.trim() && (
          <div className="sp-hint">
            <Search size={28} className="sp-hint-icon" />
            <p>Search across all nodes and descriptions</p>
            <small>Use ↑ ↓ to navigate, Enter to open</small>
          </div>
        )}
      </div>
    </div>
  );
}
