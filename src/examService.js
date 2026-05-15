// ── Question cache (24 h TTL) ──────────────────────────────────────────────
const CACHE_KEY = "exam_q_cache";
const CACHE_TTL = 24 * 60 * 60 * 1000;

function cacheId(nodeId, difficulty, numQ, selectedIds) {
  return `${nodeId}|${difficulty}|${numQ}|${[...selectedIds].sort().join(",")}`;
}
function readCache()   { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || "{}"); } catch { return {}; } }
function writeCache(c) { try { localStorage.setItem(CACHE_KEY, JSON.stringify(c)); } catch {} }

export function getCachedQuestions(nodeId, difficulty, numQ, selectedIds) {
  const c = readCache();
  const e = c[cacheId(nodeId, difficulty, numQ, selectedIds)];
  return (e && Date.now() - e.ts < CACHE_TTL) ? e.questions : null;
}

function saveToCache(nodeId, difficulty, numQ, selectedIds, questions) {
  const c   = readCache();
  const key = cacheId(nodeId, difficulty, numQ, selectedIds);
  c[key]    = { questions, ts: Date.now() };
  const keys = Object.keys(c);
  if (keys.length > 30)
    keys.sort((a, b) => c[a].ts - c[b].ts).slice(0, keys.length - 30).forEach(k => delete c[k]);
  writeCache(c);
}

// ── Content builder ────────────────────────────────────────────────────────
function buildContent(node, selectedIds) {
  const parts = [];
  function collect(n, label) {
    if (!selectedIds.includes(n.id)) return;
    const desc = (n.description || "").trim();
    parts.push(`${label}: ${n.text}${desc ? "\n" + desc : ""}`);
  }
  collect(node, "Main Topic");
  for (const child of node.children || []) collect(child, "Subtopic");
  return parts.join("\n\n");
}

// ── Parse text response into question array ────────────────────────────────
function parseQuestions(raw) {
  const cleaned = raw.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  const s = cleaned.indexOf("[");
  const e = cleaned.lastIndexOf("]");
  if (s === -1 || e === -1) throw new Error("Unexpected response format from AI. Please try again.");
  const questions = JSON.parse(cleaned.slice(s, e + 1));
  if (!Array.isArray(questions) || questions.length === 0)
    throw new Error("No questions generated. Please try again.");
  return questions;
}

// ── Extract text from Puter AI response ───────────────────────────────────
function puterText(resp) {
  if (typeof resp === "string") return resp;
  return resp?.message?.content ?? resp?.content ?? resp?.text ?? "";
}

// ── Main export ────────────────────────────────────────────────────────────
export async function generateExamQuestions({
  node, difficulty, numQuestions, selectedIds,
  useCache = true,
}) {
  if (useCache) {
    const cached = getCachedQuestions(node.id, difficulty, numQuestions, selectedIds);
    if (cached) return cached;
  }

  const content = buildContent(node, selectedIds);
  if (!content.trim()) throw new Error("No content found for selected topics.");

  const puter = window.puter;
  if (!puter?.ai?.chat)
    throw new Error("Puter AI is not available. Please refresh the page and try again.");

  const levelDesc = {
    easy:   "basic recall and fundamental concept recognition",
    medium: "understanding, application, and concept relationships",
    hard:   "analysis, synthesis, edge-cases, and deep problem-solving",
  }[difficulty];

  const prompt =
`You are an expert exam question generator.

Create exactly ${numQuestions} multiple-choice questions about:
${content}

Difficulty: ${difficulty.toUpperCase()} — ${levelDesc}

Rules:
- Exactly 4 options per question labeled "A. " "B. " "C. " "D. "
- Exactly one correct answer
- "correct" field is ONLY the single letter: A, B, C, or D
- Questions must be directly based on the content above
- Vary question types (definition, application, comparison, edge-case)
- Return ONLY raw JSON — no markdown, no code fences, no extra text

[{"question":"...?","options":["A. ...","B. ...","C. ...","D. ..."],"correct":"B","explanation":"..."}]`;

  try {
    const resp = await puter.ai.chat(prompt, { model: "mistral-large-latest" });
    const raw  = puterText(resp);
    if (!raw) throw new Error("Empty response from AI. Please try again.");

    const result = parseQuestions(raw).slice(0, numQuestions);
    saveToCache(node.id, difficulty, numQuestions, selectedIds, result);
    return result;
  } catch (err) {
    if (err.message?.includes("No questions") || err.message?.includes("Unexpected response"))
      throw err;
    throw new Error(`AI generation failed: ${err.message || "Unknown error. Please try again."}`);
  }
}
