import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { Routes, Route } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ChevronLeft, ChevronRight, ArrowRight, ArrowDown } from "lucide-react";
import TreeNode from "./TreeNode";
import NodeDetail from "./NodeDetail";
import Header from "./Header";
import ConfirmModal from "./ConfirmModal";
import StorageSettings from "./StorageSettings";
import { ThemeContext } from "./ThemeContext";
import * as api from "./storage/index.js";
import { getMode } from "./storage/index.js";
import "./App.css";

export default function App() {
  const { isDark } = useContext(ThemeContext);
  const treeWrapperRef = useRef(null);
  const scrollUpdateFrameRef = useRef(null);

  const [treeData, setTreeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [layout, setLayout] = useState("horizontal");
  const [showSettings, setShowSettings] = useState(false);
  const [storageMode, setStorageMode] = useState(getMode);
  const [scrollState, setScrollState] = useState({
    canScrollLeft: false,
    canScrollRight: false,
  });
  const [deleteConfirm, setDeleteConfirm] = useState({
    show: false,
    nodeId: null,
    nodeText: "",
  });

  // ── Load data (from whichever store is active) ────────────────────────────
  const loadData = useCallback(() => {
    setIsLoading(true);
    api
      .fetchNodes()
      .then(setTreeData)
      .catch(() => toast.error("Could not load data. Check storage mode in settings."))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Scroll-button logic (unchanged) ──────────────────────────────────────
  const updateScrollState = useCallback(() => {
    const el = treeWrapperRef.current;
    if (!el) return;

    const edgeTolerance = 2;
    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    const overflowAmount = Math.max(0, maxScrollLeft);
    const scrollLeft = el.scrollLeft;

    const nextScrollState = {
      canScrollLeft: scrollLeft > edgeTolerance,
      canScrollRight: overflowAmount - scrollLeft > edgeTolerance,
    };

    setScrollState((previousScrollState) => {
      if (
        previousScrollState.canScrollLeft === nextScrollState.canScrollLeft &&
        previousScrollState.canScrollRight === nextScrollState.canScrollRight
      ) {
        return previousScrollState;
      }

      return nextScrollState;
    });
  }, []);

  const scheduleScrollStateUpdate = useCallback(() => {
    if (scrollUpdateFrameRef.current !== null) return;

    scrollUpdateFrameRef.current = window.requestAnimationFrame(() => {
      scrollUpdateFrameRef.current = null;
      updateScrollState();
    });
  }, [updateScrollState]);

  useEffect(() => {
    updateScrollState();
  }, [treeData, layout, updateScrollState]);

  useEffect(() => {
    const el = treeWrapperRef.current;
    if (!el) return;
    updateScrollState();
    const resizeObserver = new ResizeObserver(scheduleScrollStateUpdate);
    resizeObserver.observe(el);

    const mutationObserver = new MutationObserver(scheduleScrollStateUpdate);
    mutationObserver.observe(el, { childList: true, subtree: true });

    const handleScroll = () => scheduleScrollStateUpdate();
    window.addEventListener("resize", scheduleScrollStateUpdate);
    el.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver.disconnect();
      window.removeEventListener("resize", scheduleScrollStateUpdate);
      el.removeEventListener("scroll", handleScroll);
      if (scrollUpdateFrameRef.current !== null) {
        window.cancelAnimationFrame(scrollUpdateFrameRef.current);
        scrollUpdateFrameRef.current = null;
      }
    };
  }, [
    isLoading,
    treeData.length,
    updateScrollState,
    scheduleScrollStateUpdate,
  ]);

  const handleGraphScroll = (direction) => {
    const el = treeWrapperRef.current;
    if (!el) return;
    const amount = Math.max(el.clientWidth * 0.75, 280);
    el.scrollBy({
      left: direction === "right" ? amount : -amount,
      behavior: "smooth",
    });
  };

  // ── Header actions ────────────────────────────────────────────────────────

  const handleReset = () => loadData().then(() => toast.info("Tree reloaded!"));

  const handleExport = () => {
    navigator.clipboard.writeText(JSON.stringify(treeData, null, 2));
    toast.success("Tree JSON copied to clipboard!");
  };

  // ── Add node ──────────────────────────────────────────────────────────────

  const addRecursively = (nodes, parentId, newNode) =>
    nodes.map((n) => {
      if (n.id === parentId)
        return { ...n, children: [...n.children, newNode] };
      if (n.children.length > 0)
        return {
          ...n,
          children: addRecursively(n.children, parentId, newNode),
        };
      return n;
    });

  const handleAddChild = async (parentId) => {
    const newNode = {
      id: uuidv4(),
      text: "New Node",
      description: "Default description for this new node. Edit to change.",
      parentId,
      children: [],
    };
    try {
      await api.createNode(newNode);
      setTreeData((prev) => addRecursively(prev, parentId, newNode));
      toast.success("Node added successfully!");
    } catch {
      toast.error("Failed to add node");
    }
  };

  const handleAddRoot = async () => {
    const newNode = {
      id: uuidv4(),
      text: "Root Node",
      description: "This is a root node.",
      parentId: null,
      children: [],
    };
    try {
      await api.createNode(newNode);
      setTreeData((prev) => [...prev, newNode]);
      toast.success("Root node created!");
    } catch {
      toast.error("Failed to create root node");
    }
  };

  // ── Delete node (with confirmation) ──────────────────────────────────────

  const handleDeleteRequest = (nodeId, nodeText) => {
    setDeleteConfirm({ show: true, nodeId, nodeText });
  };

  const handleConfirmDelete = async () => {
    const { nodeId } = deleteConfirm;
    setDeleteConfirm({ show: false, nodeId: null, nodeText: "" });
    try {
      await api.deleteNode(nodeId);
      const deleteRec = (nodes) =>
        nodes
          .filter((n) => n.id !== nodeId)
          .map((n) => ({ ...n, children: deleteRec(n.children) }));
      setTreeData((prev) => deleteRec(prev));
      toast.error("Node deleted!");
    } catch {
      toast.error("Failed to delete node");
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirm({ show: false, nodeId: null, nodeText: "" });
  };

  // ── Edit node text ────────────────────────────────────────────────────────

  const handleEditNode = async (nodeId, newText) => {
    const node = findNodeById(treeData, nodeId);
    if (!node) return;
    try {
      await api.updateNode(nodeId, {
        text: newText,
        description: node.description,
      });
      const editRec = (nodes) =>
        nodes.map((n) => {
          if (n.id === nodeId) return { ...n, text: newText };
          if (n.children.length > 0)
            return { ...n, children: editRec(n.children) };
          return n;
        });
      setTreeData((prev) => editRec(prev));
    } catch {
      toast.error("Failed to update node");
    }
  };

  const handleViewNode = (nodeId) => window.open(`/node/${nodeId}`, "_blank");

  // ── Update description (from NodeDetail page) ─────────────────────────────

  const handleUpdateDescription = async (nodeId, newDescription) => {
    const node = findNodeById(treeData, nodeId);
    if (!node) return;
    try {
      await api.updateNode(nodeId, {
        text: node.text,
        description: newDescription,
      });
      const updateRec = (nodes) =>
        nodes.map((n) => {
          if (n.id === nodeId) return { ...n, description: newDescription };
          if (n.children.length > 0)
            return { ...n, children: updateRec(n.children) };
          return n;
        });
      setTreeData((prev) => updateRec(prev));
      toast.success("Description updated!");
    } catch {
      toast.error("Failed to update description");
    }
  };

  // ── Tree helpers ──────────────────────────────────────────────────────────

  const findNodeById = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;
      if (node.children.length > 0) {
        const found = findNodeById(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const findParentPath = (nodes, id, path = []) => {
    for (const node of nodes) {
      if (node.id === id) return path;
      if (node.children.length > 0) {
        const found = findParentPath(node.children, id, [...path, node]);
        if (found) return found;
      }
    }
    return [];
  };

  // ── Routes ────────────────────────────────────────────────────────────────

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            <Header
              onReset={handleReset}
              onExport={handleExport}
              layout={layout}
              onLayoutChange={setLayout}
              onOpenSettings={() => setShowSettings(true)}
              storageMode={storageMode}
            />
            {showSettings && (
              <StorageSettings
                onClose={() => setShowSettings(false)}
                onModeChange={(m) => { setStorageMode(m); loadData(); }}
              />
            )}
            <div className="page-content">
              {/* Layout toggle — hidden on desktop, shown on mobile */}
              <div className="mobile-layout-bar">
                <div className="layout-pill">
                  <button
                    className={`pill-btn${layout === "horizontal" ? " active" : ""}`}
                    onClick={() => setLayout("horizontal")}
                  >
                    <ArrowRight size={13} /> Horizontal
                  </button>
                  <button
                    className={`pill-btn${layout === "vertical" ? " active" : ""}`}
                    onClick={() => setLayout("vertical")}
                  >
                    <ArrowDown size={13} /> Vertical
                  </button>
                </div>
              </div>
              <div className="app-container">
                {isLoading ? (
                  <div className="tree-loading">
                    <div className="loading-spinner" />
                    <p>Loading…</p>
                  </div>
                ) : treeData.length === 0 ? (
                  <div className="tree-empty">
                    <p>No nodes in the database yet.</p>
                    <button className="btn-add-root" onClick={handleAddRoot}>
                      + Add Root Node
                    </button>
                  </div>
                ) : (
                  <div className="tree-viewport">
                    {scrollState.canScrollLeft && (
                      <button
                        className="tree-scroll-btn tree-scroll-btn-left"
                        onClick={() => handleGraphScroll("left")}
                        title="Move left"
                        aria-label="Move graph left"
                      >
                        <ChevronLeft size={24} />
                      </button>
                    )}
                    <div
                      ref={treeWrapperRef}
                      className={`tree-wrapper ${layout}`}
                    >
                      {treeData.map((node) => (
                        <TreeNode
                          key={node.id}
                          node={node}
                          onAdd={handleAddChild}
                          onDelete={handleDeleteRequest}
                          onEdit={handleEditNode}
                          onView={handleViewNode}
                          isRoot={true}
                          layout={layout}
                        />
                      ))}
                    </div>
                    {scrollState.canScrollRight && (
                      <button
                        className="tree-scroll-btn tree-scroll-btn-right"
                        onClick={() => handleGraphScroll("right")}
                        title="Move right"
                        aria-label="Move graph right"
                      >
                        <ChevronRight size={24} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
            {deleteConfirm.show && (
              <ConfirmModal
                nodeText={deleteConfirm.nodeText}
                onConfirm={handleConfirmDelete}
                onCancel={handleCancelDelete}
              />
            )}
            <ToastContainer
              theme={isDark ? "dark" : "light"}
              position="bottom-right"
            />
          </>
        }
      />
      <Route
        path="/node/:nodeId"
        element={
          <>
            <Header onReset={handleReset} onExport={handleExport} />
            {isLoading ? (
              <div className="page-content">
                <div className="tree-loading">
                  <div className="loading-spinner" />
                  <p>Loading from database…</p>
                </div>
              </div>
            ) : (
              <NodeDetail
                treeData={treeData}
                findNodeById={findNodeById}
                findParentPath={findParentPath}
                onUpdateDescription={handleUpdateDescription}
              />
            )}
          </>
        }
      />
    </Routes>
  );
}

// i want to learn ai modsl . cnceots , how the work
// i have good understnaing in coding in java not in pythoon
// i need to learn pyrhon not from scratch because i know how collectins , loops , conditions , staemetns , functions , if needed classes..
// so now i needd to learn  python and concepts which are frequentky used in ai , and modesl and subclasses in ai ,
// can you giv em ewhole flchary for ai
// what are the paths , and what the subclasses or subcnceots in ai like ml , dl , nlp (some other)
// can u amke daily plan in node strutres and ad topics and add related info and add if any yt links and research papers
// in neat stryutture fromat . so i can learn daily .
// name a root and add a data in it and add a children tpics if any to learn and add data to it and can you provide links and refences to tit
// i have 3 to 4 onths of time , so make a plan like that and add nodes and add matter into it
