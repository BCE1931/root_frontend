// Unified storage entry-point.
// Local mode  → localStorage (per-topic)
// Backend mode → Spring Boot + MySQL (all topics)

import {
  aiLocalStore, gateLocalStore, getCustomLocalStore,
  getCustomTopics, saveCustomTopic,
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
  { id: "ai",   label: "AI Learning Roadmap" },
  { id: "gate", label: "GATE 2027 CS/IT"     },
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
  if (topicId === "ai")   return aiLocalStore;
  if (topicId === "gate") return gateLocalStore;
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

// re-export local-only helpers (used by settings panel) — always AI store
export { resetToDefaults, exportJSON, importJSON } from "./localStore.js";
