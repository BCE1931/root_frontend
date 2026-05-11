// Local store — persists to localStorage, works with no backend
// Factory-based: supports multiple topic trees under separate localStorage keys

import aiDefaultNodes   from "../defaultData.json";
import gateDefaultNodes from "../gateData.json";

const AI_DATA_KEY    = "ai_tree_nodes";
const AI_VERSION_KEY = "ai_tree_version";
const AI_CURRENT_VER = 4;

const GATE_DATA_KEY    = "gate_tree_nodes";
const GATE_VERSION_KEY = "gate_tree_version";
const GATE_CURRENT_VER = 3;

// ── Factory ────────────────────────────────────────────────────────────────
function createLocalStore(DATA_KEY, VERSION_KEY, defaultNodes, CURRENT_VER) {
  function load() {
    try {
      const raw = localStorage.getItem(DATA_KEY);
      if (raw) {
        const data = JSON.parse(raw);

        if (defaultNodes.length > 0 && data.length < defaultNodes.length) {
          seed();
          return defaultNodes;
        }

        const storedVer = parseInt(localStorage.getItem(VERSION_KEY) || "0", 10);
        if (storedVer < CURRENT_VER) {
          const defaultIds = new Set(defaultNodes.map((n) => n.id));
          data.forEach((n) => {
            if (defaultIds.has(n.id)) n.protected = true;
            if (n.completed  === undefined) n.completed  = false;
            if (n.tag        === undefined) n.tag        = "";
            if (n.studyTime  === undefined) n.studyTime  = 0;
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
    flat.forEach((n) => (map[n.id] = { ...n, children: [] }));
    const roots = [];
    const sorted = [...flat].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    sorted.forEach((n) => {
      if (!n.parentId) {
        roots.push(map[n.id]);
      } else if (map[n.parentId]) {
        map[n.parentId].children.push(map[n.id]);
      }
    });
    return roots;
  }

  return {
    async fetchNodes() {
      return buildTree(load());
    },

    async createNode({ id, text, description, parentId }) {
      const flat = load();
      const siblings = flat.filter((n) => n.parentId === (parentId || null));
      const node = {
        id,
        text,
        description,
        parentId:  parentId || null,
        sortOrder: siblings.length,
        completed: false,
        protected: false,
        tag:       "",
        studyTime: 0,
      };
      flat.push(node);
      save(flat);
      return { ...node, children: [] };
    },

    async updateNode(id, { text, description }) {
      const flat = load();
      const idx = flat.findIndex((n) => n.id === id);
      if (idx !== -1) {
        flat[idx] = { ...flat[idx], text, description };
        save(flat);
        return flat[idx];
      }
      throw new Error(`Node ${id} not found`);
    },

    async deleteNode(id) {
      const flat = load();
      const toDelete = new Set();
      const queue = [id];
      while (queue.length) {
        const cur = queue.shift();
        toDelete.add(cur);
        flat.filter((n) => n.parentId === cur).forEach((n) => queue.push(n.id));
      }
      save(flat.filter((n) => !toDelete.has(n.id)));
    },

    async toggleComplete(id) {
      const flat = load();
      const idx = flat.findIndex((n) => n.id === id);
      if (idx !== -1) {
        flat[idx] = { ...flat[idx], completed: !flat[idx].completed };
        save(flat);
        return flat[idx];
      }
      throw new Error(`Node ${id} not found`);
    },

    async updateTag(id, tag) {
      const flat = load();
      const idx = flat.findIndex((n) => n.id === id);
      if (idx !== -1) {
        flat[idx] = { ...flat[idx], tag };
        save(flat);
        return flat[idx];
      }
      throw new Error(`Node ${id} not found`);
    },

    async updateStudyTime(id, addSeconds) {
      const flat = load();
      const idx = flat.findIndex((n) => n.id === id);
      if (idx !== -1) {
        flat[idx] = { ...flat[idx], studyTime: (flat[idx].studyTime || 0) + addSeconds };
        save(flat);
        return flat[idx];
      }
      throw new Error(`Node ${id} not found`);
    },

    resetToDefaults() { seed(); },
    exportJSON()      { return JSON.stringify(load(), null, 2); },
    importJSON(jsonStr) {
      const parsed = JSON.parse(jsonStr);
      if (!Array.isArray(parsed)) throw new Error("Expected a JSON array of nodes");
      save(parsed);
    },
    isSeeded() { return !!localStorage.getItem(DATA_KEY); },
  };
}

// ── Named instances ────────────────────────────────────────────────────────
export const aiLocalStore = createLocalStore(
  AI_DATA_KEY, AI_VERSION_KEY, aiDefaultNodes, AI_CURRENT_VER
);

export const gateLocalStore = createLocalStore(
  GATE_DATA_KEY, GATE_VERSION_KEY, gateDefaultNodes, GATE_CURRENT_VER
);

export function getGateLocalStore() { return gateLocalStore; }

// ── Custom topics ──────────────────────────────────────────────────────────
const CUSTOM_TOPICS_KEY = "custom_topics";

export function getCustomTopics() {
  try { return JSON.parse(localStorage.getItem(CUSTOM_TOPICS_KEY) || "[]"); }
  catch { return []; }
}

export function saveCustomTopic(topic) {
  const list = getCustomTopics();
  list.push(topic);
  localStorage.setItem(CUSTOM_TOPICS_KEY, JSON.stringify(list));
}

const customStores = {};
export function getCustomLocalStore(topicId) {
  if (!customStores[topicId]) {
    customStores[topicId] = createLocalStore(
      `custom_${topicId}_nodes`,
      `custom_${topicId}_version`,
      [],
      1
    );
  }
  return customStores[topicId];
}

// ── Backward-compatible default exports (AI store) ─────────────────────────
export const fetchNodes      = ()         => aiLocalStore.fetchNodes();
export const createNode      = (node)     => aiLocalStore.createNode(node);
export const updateNode      = (id, data) => aiLocalStore.updateNode(id, data);
export const deleteNode      = (id)       => aiLocalStore.deleteNode(id);
export const toggleComplete  = (id)       => aiLocalStore.toggleComplete(id);
export const resetToDefaults = ()         => aiLocalStore.resetToDefaults();
export const exportJSON      = ()         => aiLocalStore.exportJSON();
export const importJSON      = (s)        => aiLocalStore.importJSON(s);
export const isSeeded        = ()         => aiLocalStore.isSeeded();
