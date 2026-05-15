import React, { useState, useRef, useEffect } from "react";
import {
  Plus, Trash2, ChevronDown, ChevronUp, ChevronRight, ChevronLeft,
  Edit2, Check, X, Eye, CheckCircle2, Circle, Tag, GraduationCap, Sparkles,
} from "lucide-react";

const TAG_OPTIONS = [
  { value: "",               label: "No tag",         color: "transparent" },
  { value: "in-progress",    label: "In Progress",    color: "#f59e0b" },
  { value: "needs-revision", label: "Needs Revision", color: "#ef4444" },
];

function isTodayNode(text) {
  const d = new Date();
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const pattern = `${months[d.getMonth()]} ${d.getDate()}`;
  return text.includes(pattern);
}

export default function TreeNode({
  node, onAdd, onDelete, onEdit, onView, onToggleComplete, onUpdateTag, onExam, onVisit, aiNodeIds,
  isRoot, layout,
}) {
  const [showAll,   setShowAll]   = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText,  setEditText]  = useState(node.text);
  const [tagOpen,   setTagOpen]   = useState(false);
  const tagRef = useRef(null);

  const hasChildren   = node.children?.length > 0;
  const childCount    = node.children?.length ?? 0;
  const visibleChildren = showAll ? node.children : node.children.slice(0, 3);
  const hiddenCount   = childCount - 3;
  const isToday       = isTodayNode(node.text);
  const hasAi = aiNodeIds?.has(node.id) || aiNodeIds?.includes?.(node.id);

  const tagColor = node.completed
    ? "#10b981"
    : TAG_OPTIONS.find(t => t.value === node.tag)?.color ?? "transparent";

  useEffect(() => {
    const handler = (e) => {
      if (tagRef.current && !tagRef.current.contains(e.target)) setTagOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSave = () => {
    if (editText.trim()) onEdit(node.id, editText);
    else setEditText(node.text);
    setIsEditing(false);
  };

  const handleCancel = () => { setEditText(node.text); setIsEditing(false); };

  return (
    <div className={`tree-node ${layout}`}>
      <div className={`node-content${node.completed ? " node-completed" : ""}${isToday ? " node-today" : ""}`}>

        {/* Tag color dot */}
        {(node.tag || node.completed) && tagColor !== "transparent" && (
          <span className="node-tag-dot" style={{ background: tagColor }} title={
            node.completed ? "Completed" : TAG_OPTIONS.find(t => t.value === node.tag)?.label
          } />
        )}

        {/* Today badge */}
        {isToday && <span className="node-today-badge">Today</span>}

        {isEditing ? (
          <div className="edit-container">
            <input
              type="text"
              value={editText}
              onChange={e => setEditText(e.target.value)}
              autoFocus
              onKeyDown={e => {
                if (e.key === "Enter")  handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <div className="node-actions">
              <button className="btn-add"    onClick={handleSave}   title="Save"><Check size={14} /></button>
              <button className="btn-delete" onClick={handleCancel} title="Cancel"><X size={14} /></button>
            </div>
          </div>
        ) : (
          <>
            <span className="node-text" onDoubleClick={() => setIsEditing(true)}>
              {node.text}
            </span>

            <div className="node-actions">
              {/* Completion — only for user-created nodes */}
              {!isRoot && !node.protected && (
                <button
                  className={`btn-complete${node.completed ? " btn-complete-done" : ""}`}
                  onClick={() => onToggleComplete(node.id)}
                  title={node.completed ? "Mark incomplete" : "Mark complete"}
                >
                  {node.completed ? <CheckCircle2 size={14} /> : <Circle size={14} />}
                </button>
              )}

              {/* Tag picker */}
              {onUpdateTag && (
                <div className="tag-picker-wrap" ref={tagRef}>
                  <button
                    className="btn-tag"
                    onClick={() => setTagOpen(v => !v)}
                    title="Set tag"
                    style={node.tag ? { color: tagColor } : {}}
                  >
                    <Tag size={14} />
                  </button>
                  {tagOpen && (
                    <div className="tag-dropdown">
                      {TAG_OPTIONS.map(opt => (
                        <button
                          key={opt.value}
                          className={`tag-opt${node.tag === opt.value ? " tag-opt-active" : ""}`}
                          onClick={() => { onUpdateTag(node.id, opt.value); setTagOpen(false); }}
                        >
                          <span className="tag-opt-dot" style={{ background: opt.color === "transparent" ? "#94a3b8" : opt.color }} />
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <button className="btn-edit" onClick={() => setIsEditing(true)} title="Edit"><Edit2 size={14} /></button>
              <button className="btn-view" onClick={() => onView(node.id)}    title="View"><Eye   size={14} /></button>
              <button className="btn-exam" onClick={() => onExam && onExam(node)} title="Start Exam"><GraduationCap size={14} /></button>
              {hasAi && (
                <span className="node-ai-badge" title="AI explanation available" onClick={() => onView(node.id)}>
                  <Sparkles size={10} />
                </span>
              )}
              <button className="btn-add"  onClick={() => onAdd(node.id)}     title="Add Child"><Plus size={14} /></button>

              {!isRoot && !node.protected && (
                <button className="btn-delete" onClick={() => onDelete(node.id, node.text)} title="Delete">
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {hasChildren && (
        <>
          {/* Collapse toggle */}
          <button className="btn-collapse" onClick={() => {
            const expanding = collapsed;
            setCollapsed(v => !v);
            if (expanding && onVisit) onVisit(node.id, node.text);
          }} title={collapsed ? "Expand" : "Collapse"}>
            {collapsed
              ? (layout === "horizontal" ? <ChevronRight size={12} /> : <ChevronDown size={12} />)
              : (layout === "horizontal" ? <ChevronDown  size={12} /> : <ChevronRight size={12} />)}
            {collapsed ? `Show ${childCount}` : "Collapse"}
          </button>

          {!collapsed && (
            <div className={`children-container ${layout}`}>
              {visibleChildren.map(child => (
                <TreeNode
                  key={child.id}
                  node={child}
                  onAdd={onAdd}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  onView={onView}
                  onToggleComplete={onToggleComplete}
                  onUpdateTag={onUpdateTag}
                  onExam={onExam}
                  onVisit={onVisit}
                  aiNodeIds={aiNodeIds}
                  isRoot={false}
                  layout={layout}
                />
              ))}

              {hiddenCount > 0 && !showAll && (
                <button className="btn-read-more" onClick={() => setShowAll(true)}>
                  {layout === "horizontal" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  {hiddenCount} more
                </button>
              )}
              {showAll && childCount > 3 && (
                <button className="btn-read-more" onClick={() => setShowAll(false)}>
                  {layout === "horizontal" ? <ChevronUp size={14} /> : <ChevronLeft size={14} />}
                  Show less
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
