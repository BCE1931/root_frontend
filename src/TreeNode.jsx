import React, { useState } from "react";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  Edit2,
  Check,
  X,
  Eye,
  CheckCircle2,
  Circle,
} from "lucide-react";

export default function TreeNode({
  node,
  onAdd,
  onDelete,
  onEdit,
  onView,
  onToggleComplete,
  isRoot,
  layout,
}) {
  const [showAll, setShowAll] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(node.text);

  const hasChildren  = node.children && node.children.length > 0;
  const childrenCount = node.children ? node.children.length : 0;
  const visibleChildren = showAll ? node.children : node.children.slice(0, 3);
  const hiddenCount  = childrenCount - 3;

  const handleSave = () => {
    if (editText.trim() !== "") {
      onEdit(node.id, editText);
    } else {
      setEditText(node.text);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(node.text);
    setIsEditing(false);
  };

  return (
    <div className={`tree-node ${layout}`}>
      <div className={`node-content${node.completed ? " node-completed" : ""}`}>
        {isEditing ? (
          <div className="edit-container">
            <input
              type="text"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") handleCancel();
              }}
            />
            <div className="node-actions">
              <button className="btn-add" onClick={handleSave} title="Save">
                <Check size={14} />
              </button>
              <button className="btn-delete" onClick={handleCancel} title="Cancel">
                <X size={14} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <span className="node-text" onDoubleClick={() => setIsEditing(true)}>
              {node.text}
            </span>

            <div className="node-actions">
              {/* Completion toggle — available on every node */}
              <button
                className={`btn-complete${node.completed ? " btn-complete-done" : ""}`}
                onClick={() => onToggleComplete(node.id)}
                title={node.completed ? "Mark as incomplete" : "Mark as complete"}
              >
                {node.completed
                  ? <CheckCircle2 size={14} />
                  : <Circle size={14} />}
              </button>

              <button
                className="btn-edit"
                onClick={() => setIsEditing(true)}
                title="Edit Node"
              >
                <Edit2 size={14} />
              </button>

              <button
                className="btn-view"
                onClick={() => onView(node.id)}
                title="View Node Details"
              >
                <Eye size={14} />
              </button>

              <button
                className="btn-add"
                onClick={() => onAdd(node.id)}
                title="Add Child"
              >
                <Plus size={14} />
              </button>

              {/* Delete only shown for non-protected, non-root nodes */}
              {!isRoot && !node.protected && (
                <button
                  className="btn-delete"
                  onClick={() => onDelete(node.id, node.text)}
                  title="Delete Node"
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {hasChildren && (
        <div className={`children-container ${layout}`}>
          {visibleChildren.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              onAdd={onAdd}
              onDelete={onDelete}
              onEdit={onEdit}
              onView={onView}
              onToggleComplete={onToggleComplete}
              isRoot={false}
              layout={layout}
            />
          ))}

          {hiddenCount > 0 && !showAll && (
            <button className="btn-read-more" onClick={() => setShowAll(true)}>
              {layout === "horizontal" ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              Read {hiddenCount} more
            </button>
          )}
          {showAll && childrenCount > 3 && (
            <button className="btn-read-more" onClick={() => setShowAll(false)}>
              {layout === "horizontal" ? <ChevronUp size={14} /> : <ChevronLeft size={14} />}
              Show less
            </button>
          )}
        </div>
      )}
    </div>
  );
}
