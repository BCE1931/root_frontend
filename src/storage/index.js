// Unified storage entry-point.
// Read MODE_KEY from localStorage to decide which store to use.
// Both stores expose the same interface:
//   fetchNodes(), createNode(), updateNode(), deleteNode()

import * as local   from "./localStore.js";
import * as backend from "./backendStore.js";

export const MODE_KEY    = "storageMode";      // "local" | "backend"
export const URL_KEY     = "backendUrl";

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

function store() {
  if (getMode() === "backend") {
    backend.setBaseUrl(getBackendUrl());
    return backend;
  }
  return local;
}

export const fetchNodes  = ()            => store().fetchNodes();
export const createNode  = (node)        => store().createNode(node);
export const updateNode  = (id, data)    => store().updateNode(id, data);
export const deleteNode  = (id)          => store().deleteNode(id);

// re-export local-only helpers (used by settings panel)
export { resetToDefaults, exportJSON, importJSON } from "./localStore.js";
