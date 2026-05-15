// Unified storage entry-point.
// Local mode  → localStorage (per-topic)
// Backend mode → Spring Boot + MySQL (all topics)

import {
  aiLocalStore, gateLocalStore,
  fdLocalStore, bdLocalStore, webLocalStore,
  dbLocalStore, devopsLocalStore, genaiLocalStore,
  getCustomLocalStore, getCustomTopics, saveCustomTopic,
} from "./localStore.js";
import * as backend from "./backendStore.js";

export const MODE_KEY  = "storageMode";
export const URL_KEY   = "backendUrl";
export const TOPIC_KEY = "activeTopic";

// ── Topic helpers ──────────────────────────────────────────────────────────
export function getTopic() {
  return localStorage.getItem(TOPIC_KEY) || "ai";
}
export function setTopic(topic) {
  localStorage.setItem(TOPIC_KEY, topic);
}

export const BUILTIN_TOPICS = [
  { id: "ai",     label: "AI Learning Roadmap"         },
  { id: "gate",   label: "GATE 2027 CS/IT"             },
  { id: "fd",     label: "HCL — Frontend Development"  },
  { id: "bd",     label: "HCL — Backend Development"   },
  { id: "web",    label: "HCL — Web Apps & Services"   },
  { id: "db",     label: "HCL — Database Management"   },
  { id: "devops", label: "HCL — Code Quality & DevOps" },
  { id: "genai",  label: "HCL — Generative AI"         },
];

export function getTopics() {
  return [...BUILTIN_TOPICS, ...getCustomTopics()];
}

export function addCustomTopic(label) {
  const id    = `custom_${Date.now()}`;
  const topic = { id, label };
  saveCustomTopic(topic);
  return topic;
}

// Keep TOPICS as alias for backward compatibility
export const TOPICS = BUILTIN_TOPICS;

// ── Storage mode helpers ───────────────────────────────────────────────────
export function getMode() {
  // Default to "backend" — switch to "local" via settings if backend unavailable
  return localStorage.getItem(MODE_KEY) || "backend";
}
export function setMode(mode) {
  localStorage.setItem(MODE_KEY, mode);
}
export function getBackendUrl() {
  return localStorage.getItem(URL_KEY) || "http://localhost:8080/api";
}
export function setBackendUrl(url) {
  localStorage.setItem(URL_KEY, url);
  backend.setBaseUrl(url);
}

// ── Local store resolver ────────────────────────────────────────────────────
function getLocalStoreForTopic(topicId) {
  if (topicId === "ai")     return aiLocalStore;
  if (topicId === "gate")   return gateLocalStore;
  if (topicId === "fd")     return fdLocalStore;
  if (topicId === "bd")     return bdLocalStore;
  if (topicId === "web")    return webLocalStore;
  if (topicId === "db")     return dbLocalStore;
  if (topicId === "devops") return devopsLocalStore;
  if (topicId === "genai")  return genaiLocalStore;
  return getCustomLocalStore(topicId);
}

// ── Backend topic store (wraps backend + handles first-time sync) ──────────
function createBackendTopicStore(topic) {
  const localStore = getLocalStoreForTopic(topic);

  return {
    async fetchNodes() {
      backend.setBaseUrl(getBackendUrl());
      const result = await backend.fetchNodes(topic);

      // Auto-sync: if backend has no data for this topic, push from localStorage
      if (result.length === 0) {
        const flat = localStore.getRawFlat();
        if (flat.length > 0) {
          await backend.bulkInsert(flat, topic);
          return backend.fetchNodes(topic);
        }
      }
      return result;
    },

    createNode(node) {
      backend.setBaseUrl(getBackendUrl());
      return backend.createNode({ ...node, topic });
    },
    updateNode(id, data) {
      backend.setBaseUrl(getBackendUrl());
      return backend.updateNode(id, data);
    },
    deleteNode(id) {
      backend.setBaseUrl(getBackendUrl());
      return backend.deleteNode(id);
    },
    toggleComplete(id) {
      backend.setBaseUrl(getBackendUrl());
      return backend.toggleComplete(id);
    },
    updateTag(id, tag) {
      backend.setBaseUrl(getBackendUrl());
      return backend.updateTag(id, tag);
    },
    updateStudyTime(id, secs) {
      backend.setBaseUrl(getBackendUrl());
      return backend.updateStudyTime(id, secs);
    },
  };
}

// ── Active store resolver ──────────────────────────────────────────────────
function store() {
  const topic = getTopic();

  if (getMode() === "backend") {
    return createBackendTopicStore(topic);
  }

  // Local mode
  return getLocalStoreForTopic(topic);
}

// ── Public API ─────────────────────────────────────────────────────────────
export const fetchNodes      = ()         => store().fetchNodes();
export const createNode      = (node)     => store().createNode(node);
export const updateNode      = (id, data) => store().updateNode(id, data);
export const deleteNode      = (id)       => store().deleteNode(id);
export const toggleComplete  = (id)       => store().toggleComplete(id);
export const updateTag       = (id, tag)  => store().updateTag(id, tag);
export const updateStudyTime = (id, secs) => store().updateStudyTime(id, secs);

// ── Exam results ───────────────────────────────────────────────────────────
const EXAM_LS_KEY = "exam_results";

export async function saveExamResult(result) {
  if (getMode() === "backend") {
    try {
      backend.setBaseUrl(getBackendUrl());
      return await backend.saveExamResult(result);
    } catch { /* fall through to localStorage backup */ }
  }
  const all = JSON.parse(localStorage.getItem(EXAM_LS_KEY) || "[]");
  all.unshift(result);
  localStorage.setItem(EXAM_LS_KEY, JSON.stringify(all.slice(0, 200)));
  return result;
}

export async function getNodeExamHistory(nodeId) {
  if (getMode() === "backend") {
    try {
      backend.setBaseUrl(getBackendUrl());
      return await backend.getExamResults(nodeId);
    } catch { /* fall through */ }
  }
  const all = JSON.parse(localStorage.getItem(EXAM_LS_KEY) || "[]");
  return nodeId ? all.filter(r => r.nodeId === nodeId) : all;
}

// ── Node visits ────────────────────────────────────────────────────────────
const VISIT_LS_KEY  = "node_visits";
const visitDebounce = {};

export async function saveNodeVisit(nodeId, nodeName) {
  const now = Date.now();
  if (visitDebounce[nodeId] && now - visitDebounce[nodeId] < 60_000) return;
  visitDebounce[nodeId] = now;

  if (getMode() === "backend") {
    try {
      backend.setBaseUrl(getBackendUrl());
      return await backend.saveNodeVisit(nodeId, nodeName);
    } catch { /* fall through */ }
  }
  const all = JSON.parse(localStorage.getItem(VISIT_LS_KEY) || "[]");
  all.unshift({ id: `${Date.now()}`, nodeId, nodeName, visitedAt: new Date().toISOString() });
  localStorage.setItem(VISIT_LS_KEY, JSON.stringify(all.slice(0, 500)));
}

export async function getVisitHistory(limit = 100) {
  if (getMode() === "backend") {
    try {
      backend.setBaseUrl(getBackendUrl());
      return await backend.getVisitHistory(limit);
    } catch { /* fall through */ }
  }
  return JSON.parse(localStorage.getItem(VISIT_LS_KEY) || "[]").slice(0, limit);
}

// re-export local-only helpers (used by settings panel) — always AI store
export { resetToDefaults, exportJSON, importJSON } from "./localStore.js";

// ── AI Responses ───────────────────────────────────────────────────────────
const AI_RESP_LS_KEY    = "ai_responses_local";
const AI_NODE_IDS_KEY   = "ai_node_ids";

function pushAiNodeId(nodeId) {
  try {
    const ids = JSON.parse(localStorage.getItem(AI_NODE_IDS_KEY) || "[]");
    if (!ids.includes(nodeId)) { ids.push(nodeId); localStorage.setItem(AI_NODE_IDS_KEY, JSON.stringify(ids)); }
  } catch {}
}

export async function saveAiResponse(r) {
  pushAiNodeId(r.nodeId);
  if (getMode() === "backend") {
    backend.setBaseUrl(getBackendUrl());
    return await backend.saveAiResponse(r);   // let errors propagate — caller shows them
  }
  const all = JSON.parse(localStorage.getItem(AI_RESP_LS_KEY) || "[]");
  const rec = { ...r, createdAt: new Date().toISOString() };
  all.unshift(rec);
  localStorage.setItem(AI_RESP_LS_KEY, JSON.stringify(all.slice(0, 200)));
  return rec;
}

export async function getAiResponses(nodeId) {
  if (getMode() === "backend") {
    try { backend.setBaseUrl(getBackendUrl()); return await backend.getAiResponses(nodeId); } catch { /* fall through */ }
  }
  const all = JSON.parse(localStorage.getItem(AI_RESP_LS_KEY) || "[]");
  return nodeId ? all.filter(r => r.nodeId === nodeId) : all;
}

/** Find which topic a node belongs to — used when navigating cross-topic */
export async function findNodeTopic(nodeId) {
  if (getMode() === "backend") {
    try {
      backend.setBaseUrl(getBackendUrl());
      const n = await backend.getNodeById(nodeId);
      return n?.topic || null;
    } catch { return null; }
  }
  // Local mode: search every store
  const all = [...BUILTIN_TOPICS, ...getCustomTopics()];
  for (const t of all) {
    const s = getLocalStoreForTopic(t.id);
    const flat = s.getRawFlat ? s.getRawFlat() : [];
    if (flat.find(n => n.id === nodeId)) return t.id;
  }
  return null;
}

export async function getAiNodeIds() {
  if (getMode() === "backend") {
    try { backend.setBaseUrl(getBackendUrl()); return await backend.getAiResponseNodeIds(); } catch { /* fall through */ }
  }
  return JSON.parse(localStorage.getItem(AI_NODE_IDS_KEY) || "[]");
}

export async function getAiStats() {
  if (getMode() === "backend") {
    try { backend.setBaseUrl(getBackendUrl()); return await backend.getAiStats(); } catch { /* fall through */ }
  }
  const all = JSON.parse(localStorage.getItem(AI_RESP_LS_KEY) || "[]");
  const nodeMap = {};
  all.forEach(r => { nodeMap[r.nodeId] = { nodeId: r.nodeId, nodeName: r.nodeName, cnt: (nodeMap[r.nodeId]?.cnt || 0) + 1 }; });
  return {
    totalCalls:        all.length,
    totalInputTokens:  all.reduce((s, r) => s + (r.inputTokens  || 0), 0),
    totalOutputTokens: all.reduce((s, r) => s + (r.outputTokens || 0), 0),
    topNodes:          Object.values(nodeMap).sort((a, b) => b.cnt - a.cnt).slice(0, 5),
  };
}
