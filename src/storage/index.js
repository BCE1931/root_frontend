// Unified storage entry-point.
// Supports built-in topics ("ai", "gate") plus unlimited custom topics.

import {
  aiLocalStore, getGateLocalStore, getCustomLocalStore,
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
  return localStorage.getItem(MODE_KEY) || "local";
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

// ── Active store resolver ──────────────────────────────────────────────────
function store() {
  const topic = getTopic();

  if (topic === "gate") return getGateLocalStore();

  if (topic !== "ai") return getCustomLocalStore(topic);

  if (getMode() === "backend") {
    backend.setBaseUrl(getBackendUrl());
    return backend;
  }
  return aiLocalStore;
}

// ── Public API ─────────────────────────────────────────────────────────────
export const fetchNodes      = ()              => store().fetchNodes();
export const createNode      = (node)          => store().createNode(node);
export const updateNode      = (id, data)      => store().updateNode(id, data);
export const deleteNode      = (id)            => store().deleteNode(id);
export const toggleComplete  = (id)            => store().toggleComplete(id);
export const updateTag       = (id, tag)       => store().updateTag(id, tag);
export const updateStudyTime = (id, secs)      => store().updateStudyTime(id, secs);

// re-export local-only helpers (used by settings panel) — always AI store
export { resetToDefaults, exportJSON, importJSON } from "./localStore.js";
