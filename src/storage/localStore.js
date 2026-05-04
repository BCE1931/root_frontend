// Local store — persists to localStorage, works with no backend
import defaultNodes from "../defaultData.json";

const DATA_KEY    = "ai_tree_nodes";
const VERSION_KEY = "ai_tree_version";
const CURRENT_VER = 4; // bumped: adds protected + completed fields

// ── Flat array helpers ─────────────────────────────────────────────────────
function load() {
  try {
    const raw = localStorage.getItem(DATA_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      const storedVer = parseInt(localStorage.getItem(VERSION_KEY) || "0", 10);
      if (storedVer < CURRENT_VER) {
        // Migration: stamp protected+completed on existing default nodes
        const defaultIds = new Set(defaultNodes.map(n => n.id));
        data.forEach(n => {
          if (defaultIds.has(n.id)) n.protected = true;
          if (n.completed === undefined) n.completed = false;
        });
        save(data);
        localStorage.setItem(VERSION_KEY, String(CURRENT_VER));
      }
      return data;
    }
  } catch { /* corrupted — fall through to seed */ }
  seed();
  return JSON.parse(localStorage.getItem(DATA_KEY));
}

function save(flat) {
  localStorage.setItem(DATA_KEY, JSON.stringify(flat));
}

function seed() {
  localStorage.setItem(DATA_KEY, JSON.stringify(defaultNodes));
  localStorage.setItem(VERSION_KEY, String(CURRENT_VER));
}

function buildTree(flat) {
  const map = {};
  flat.forEach(n => (map[n.id] = { ...n, children: [] }));
  const roots = [];
  const sorted = [...flat].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  sorted.forEach(n => {
    if (!n.parentId) {
      roots.push(map[n.id]);
    } else if (map[n.parentId]) {
      map[n.parentId].children.push(map[n.id]);
    }
  });
  return roots;
}

// ── Public API — same interface as backendStore ────────────────────────────
export async function fetchNodes() {
  return buildTree(load());
}

export async function createNode({ id, text, description, parentId }) {
  const flat = load();
  const siblings = flat.filter(n => n.parentId === (parentId || null));
  const node = {
    id,
    text,
    description,
    parentId: parentId || null,
    sortOrder: siblings.length,
    completed: false,
    protected: false,
  };
  flat.push(node);
  save(flat);
  return { ...node, children: [] };
}

export async function updateNode(id, { text, description }) {
  const flat = load();
  const idx = flat.findIndex(n => n.id === id);
  if (idx !== -1) {
    flat[idx] = { ...flat[idx], text, description };
    save(flat);
    return flat[idx];
  }
  throw new Error(`Node ${id} not found`);
}

export async function deleteNode(id) {
  const flat = load();
  const toDelete = new Set();
  const queue = [id];
  while (queue.length) {
    const cur = queue.shift();
    toDelete.add(cur);
    flat.filter(n => n.parentId === cur).forEach(n => queue.push(n.id));
  }
  save(flat.filter(n => !toDelete.has(n.id)));
}

export async function toggleComplete(id) {
  const flat = load();
  const idx  = flat.findIndex(n => n.id === id);
  if (idx !== -1) {
    flat[idx] = { ...flat[idx], completed: !flat[idx].completed };
    save(flat);
    return flat[idx];
  }
  throw new Error(`Node ${id} not found`);
}

// ── Management helpers ─────────────────────────────────────────────────────
export function resetToDefaults() {
  seed();
}

export function exportJSON() {
  return JSON.stringify(load(), null, 2);
}

export function importJSON(jsonStr) {
  const parsed = JSON.parse(jsonStr);
  if (!Array.isArray(parsed)) throw new Error("Expected a JSON array of nodes");
  save(parsed);
}

export function isSeeded() {
  return !!localStorage.getItem(DATA_KEY);
}
