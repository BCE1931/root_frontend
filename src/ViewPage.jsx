import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ViewPage() {
  const { nodeId } = useParams();
  const [nodeData, setNodeData] = useState(null);

  useEffect(() => {
    // Retrieve the tree data we saved in localStorage
    const savedData = localStorage.getItem("appTreeData");
    if (savedData) {
      const tree = JSON.parse(savedData);

      // Recursive function to find the specific node by ID
      const findNode = (nodes) => {
        for (let node of nodes) {
          if (node.id === nodeId) return node;
          if (node.children && node.children.length > 0) {
            const found = findNode(node.children);
            if (found) return found;
          }
        }
        return null;
      };

      setNodeData(findNode(tree));
    }
  }, [nodeId]);

  if (!nodeData) {
    return (
      <div className="p-10 text-xl font-semibold text-slate-800">
        Node not found or loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      <div className="max-w-3xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-900 mb-4">
          {nodeData.text}
        </h1>
        <div className="bg-slate-100 p-6 rounded-xl text-slate-700">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
            Description / Matter
          </h2>
          <p className="whitespace-pre-wrap">{nodeData.description}</p>
        </div>
        <p className="text-sm text-slate-400 mt-8">Node ID: {nodeData.id}</p>
      </div>
    </div>
  );
}
