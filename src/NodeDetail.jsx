import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { ArrowLeft, Edit2, Check, X } from "lucide-react";
import { ThemeContext } from "./ThemeContext";
import "./NodeDetail.css";

export default function NodeDetail({
  treeData,
  findNodeById,
  findParentPath,
  onUpdateDescription,
}) {
  const { isDark } = useContext(ThemeContext);
  const { nodeId } = useParams();
  const node = findNodeById(treeData, nodeId);
  const parentPath = findParentPath(treeData, nodeId);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editedDescription, setEditedDescription] = useState(
    node?.description || "",
  );

  // Set browser tab title to current node name
  useEffect(() => {
    if (node) {
      document.title = node.text;
    }
  }, [node]);

  if (!node) {
    return (
      <div
        className={`${
          isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
        } min-h-[calc(100vh-80px)] transition-colors duration-200`}
      >
        <div className="node-detail-container">
          <button className="btn-back" onClick={() => window.history.back()}>
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="not-found">
            <h2>Node Not Found</h2>
            <p>The node you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSaveDescription = () => {
    if (editedDescription.trim() !== "") {
      onUpdateDescription(nodeId, editedDescription);
    } else {
      setEditedDescription(node.description);
    }
    setIsEditingDesc(false);
  };

  const handleCancelEdit = () => {
    setEditedDescription(node.description);
    setIsEditingDesc(false);
  };

  return (
    <div
      className={`${
        isDark ? "bg-slate-900 text-white" : "bg-white text-slate-900"
      } min-h-[calc(100vh-80px)] transition-colors duration-200`}
    >
      <div className="node-detail-container">
        <button className="btn-back" onClick={() => window.history.back()}>
          <ArrowLeft size={16} />
          Back
        </button>

        {/* Breadcrumb Navigation */}
        {parentPath.length > 0 && (
          <div className="breadcrumb">
            {parentPath.map((parent) => (
              <span key={parent.id} className="breadcrumb-item">
                <button
                  className="breadcrumb-link"
                  onClick={() => window.open(`/node/${parent.id}`, "_blank")}
                >
                  {parent.text}
                </button>
                <span className="breadcrumb-separator">/</span>
              </span>
            ))}
            <span className="breadcrumb-current">{node.text}</span>
          </div>
        )}

        <div className="node-detail-content">
          <h1>{node.text}</h1>

          <div className="detail-section">
            <div className="section-header">
              <h3>Description</h3>
              {!isEditingDesc && (
                <button
                  className="btn-edit-desc"
                  onClick={() => setIsEditingDesc(true)}
                  title="Edit Description"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>

            {isEditingDesc ? (
              <div className="edit-desc-container">
                <textarea
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  autoFocus
                  placeholder="Enter node description..."
                />
                <div className="edit-actions">
                  <button className="btn-save" onClick={handleSaveDescription}>
                    <Check size={16} />
                    Save
                  </button>
                  <button className="btn-cancel" onClick={handleCancelEdit}>
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p>{node.description}</p>
            )}
          </div>

          {node.children && node.children.length > 0 && (
            <div className="detail-section">
              <h3>Children ({node.children.length})</h3>
              <ul className="children-list">
                {node.children.map((child) => (
                  <li key={child.id} className="child-item">
                    <span className="child-name">
                      {child.text}
                      {child.children && child.children.length > 0 && (
                        <span className="child-count">
                          [{child.children.length}]
                        </span>
                      )}
                    </span>
                    <button
                      className="btn-view-child"
                      onClick={() => window.open(`/node/${child.id}`, "_blank")}
                    >
                      View Details
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(!node.children || node.children.length === 0) && (
            <div className="detail-section">
              <p className="no-children">This node has no children.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
