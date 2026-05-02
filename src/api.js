const BASE = "http://localhost:8080/api";

export async function fetchNodes() {
  const res = await fetch(`${BASE}/nodes`);
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

export async function createNode({ id, text, description, parentId }) {
  const res = await fetch(`${BASE}/nodes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, text, description, parentId }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

export async function updateNode(id, { text, description }) {
  const res = await fetch(`${BASE}/nodes/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, description }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
  return res.json();
}

export async function deleteNode(id) {
  const res = await fetch(`${BASE}/nodes/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error(`Server error ${res.status}`);
}
