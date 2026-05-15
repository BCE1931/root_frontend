// Backend store — talks to Spring Boot REST API at /api/*
let BASE = "http://localhost:8080/api";

export function setBaseUrl(url) {
  BASE = url.replace(/\/$/, "");
}

export function getBaseUrl() {
  return BASE;
}

async function req(path, method = "GET", body) {
  const opts = { method, headers: {} };
  if (body !== undefined) {
    opts.headers["Content-Type"] = "application/json";
    opts.body = JSON.stringify(body);
  }
  const res = await fetch(BASE + path, opts);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  if (res.status === 204) return null;
  return res.json();
}

export async function fetchNodes(topic = "ai") {
  return req(`/nodes?topic=${encodeURIComponent(topic)}`);
}

export async function getNodeById(id) {
  return req(`/nodes/${encodeURIComponent(id)}`);
}

export async function createNode({ id, text, description, parentId, topic = "ai" }) {
  return req("/nodes", "POST", { id, text, description, parentId, topic });
}

export async function updateNode(id, { text, description }) {
  return req(`/nodes/${id}`, "PUT", { text, description });
}

export async function deleteNode(id) {
  return req(`/nodes/${id}`, "DELETE");
}

export async function toggleComplete(id) {
  return req(`/nodes/${id}/complete`, "PATCH");
}

export async function updateTag(id, tag) {
  return req(`/nodes/${id}/tag`, "PATCH", { tag });
}

export async function updateStudyTime(id, addSeconds) {
  return req(`/nodes/${id}/study-time`, "PATCH", { addSeconds });
}

/** Bulk-insert a flat array of nodes for a topic (used for first-time sync from localStorage). */
export async function bulkInsert(nodes, topic) {
  return req(`/nodes/bulk?topic=${encodeURIComponent(topic)}`, "POST", nodes);
}

// ── Exam results ───────────────────────────────────────────────────────────
export async function saveExamResult(result) {
  return req("/exams", "POST", result);
}

export async function getExamResults(nodeId) {
  const qs = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : "";
  return req(`/exams${qs}`);
}

// ── Node visits ────────────────────────────────────────────────────────────
export async function saveNodeVisit(nodeId, nodeName) {
  return req("/visits", "POST", { nodeId, nodeName });
}

export async function getVisitHistory(limit = 100) {
  return req(`/visits?limit=${limit}`);
}

// ── AI Responses ───────────────────────────────────────────────────────────
export async function saveAiResponse(r)         { return req("/ai-responses", "POST", r); }
export async function getAiResponses(nodeId)    {
  const qs = nodeId ? `?nodeId=${encodeURIComponent(nodeId)}` : "";
  return req(`/ai-responses${qs}`);
}
export async function getAiResponseNodeIds()    { return req("/ai-responses/node-ids"); }
export async function getAiStats()              { return req("/ai-responses/stats"); }
