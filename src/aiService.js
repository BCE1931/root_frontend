const AI_PROVIDER_KEY         = "aiProvider";
const GEMINI_KEY_KEY       = "geminiApiKey";
const OPENROUTER_KEY_KEY   = "openRouterApiKey";
const OPENROUTER_MODEL_KEY = "openRouterModel";

export function getAiProvider()         { return localStorage.getItem(AI_PROVIDER_KEY)      || "puter"; }
export function setAiProvider(p)        { localStorage.setItem(AI_PROVIDER_KEY, p); }
export function getGeminiKey()          { return localStorage.getItem(GEMINI_KEY_KEY)        || ""; }
export function setGeminiKey(k)         { localStorage.setItem(GEMINI_KEY_KEY, k); }
export function getOpenRouterKey()      { return localStorage.getItem(OPENROUTER_KEY_KEY)    || ""; }
export function setOpenRouterKey(k)     { localStorage.setItem(OPENROUTER_KEY_KEY, k); }
export function getOpenRouterModel()    { return localStorage.getItem(OPENROUTER_MODEL_KEY)  || "meta-llama/llama-3.3-70b-instruct:free"; }
export function setOpenRouterModel(m)   { localStorage.setItem(OPENROUTER_MODEL_KEY, m); }

function buildPrompt(node, customQuestion) {
  const desc    = (node.description || "").trim().slice(0, 600);
  const context = desc ? `\n\nContext about this topic:\n${desc}` : "";

  if (customQuestion && customQuestion.trim()) {
    return (
`You are an expert teacher. The user is studying the topic "${node.text}".${context}

User's question: ${customQuestion.trim()}

Answer clearly and in detail. Use examples where helpful. Structure with ## headings if the answer has multiple parts.`
    );
  }

  return (
`You are an expert teacher. Explain the topic "${node.text}" clearly and in detail.${context}

Structure your response with these exact sections:

## Explanation
Write a clear, thorough explanation in 3-4 paragraphs covering what it is, how it works, and why it matters.

## Real-World Examples
Give 2-3 specific, practical real-world examples. Each example should be concrete and relatable.

## Key Takeaways
- List 4-5 bullet points with the most important things to remember about this topic`
  );
}

async function askViaPuter(node, customQuestion) {
  const puter = window.puter;
  if (!puter?.ai?.chat) throw new Error("Puter AI not available. Please refresh the page.");
  const prompt = buildPrompt(node, customQuestion);
  const resp   = await puter.ai.chat(prompt, { model: "mistral-large-latest" });
  const text   = typeof resp === "string" ? resp
    : resp?.message?.content ?? resp?.choices?.[0]?.message?.content ?? resp?.content ?? "";
  if (!text.trim()) throw new Error("Empty response from AI. Please try again.");
  const usage = resp?.usage || {};
  return {
    response:     text.trim(),
    inputTokens:  usage.prompt_tokens     || 0,
    outputTokens: usage.completion_tokens || 0,
    model:        "mistral-large-latest",
    prompt,
  };
}

async function askViaOpenRouter(node, customQuestion) {
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error("No OpenRouter API key set. Go to Settings → AI Provider to add your key.");
  const model  = getOpenRouterModel();
  const prompt = buildPrompt(node, customQuestion);
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer":  window.location.origin,
      "X-Title":       "TreeFlow",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `OpenRouter error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("Empty response from OpenRouter. Please try again.");
  const usage = data?.usage || {};
  return {
    response:     text.trim(),
    inputTokens:  usage.prompt_tokens     || 0,
    outputTokens: usage.completion_tokens || 0,
    model,
    prompt,
  };
}

async function askViaGemini(node, customQuestion) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("No Gemini API key set. Go to Settings → AI Provider to add your key.");
  const prompt = buildPrompt(node, customQuestion);
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg  = body?.error?.message || `Gemini error ${res.status}`;
    const retryInfo = body?.error?.details?.find(d => d["@type"]?.includes("RetryInfo"));
    throw new Error(retryInfo?.retryDelay ? `${msg} (retry after ${retryInfo.retryDelay})` : msg);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Empty response from Gemini. Please try again.");
  const usage = data?.usageMetadata || {};
  return {
    response:     text.trim(),
    inputTokens:  usage.promptTokenCount     || 0,
    outputTokens: usage.candidatesTokenCount || 0,
    model:        "gemini-2.0-flash-lite",
    prompt,
  };
}

export async function askAiAboutTopic(node, customQuestion = "") {
  const provider = getAiProvider();
  if (provider === "gemini")     return askViaGemini(node, customQuestion);
  if (provider === "openrouter") return askViaOpenRouter(node, customQuestion);
  return askViaPuter(node, customQuestion);
}

// ── Chat (multi-turn conversation) ──────────────────────────────────────────
// Best free models: Puter → gpt-4o, OpenRouter → deepseek/deepseek-chat:free

const CHAT_MODEL_PUTER_KEY = "chatModelPuter";
const CHAT_MODEL_OR_KEY    = "chatModelOpenRouter";

export function getChatModelPuter()       { return localStorage.getItem(CHAT_MODEL_PUTER_KEY) || "gpt-4o"; }
export function setChatModelPuter(m)      { localStorage.setItem(CHAT_MODEL_PUTER_KEY, m); }
export function getChatModelOpenRouter()  { return localStorage.getItem(CHAT_MODEL_OR_KEY)    || "deepseek/deepseek-chat-v3-0324:free"; }
export function setChatModelOpenRouter(m) { localStorage.setItem(CHAT_MODEL_OR_KEY, m); }

const CHAT_SYSTEM = "You are an expert learning assistant for TreeFlow, a topic-tree learning app. Help the user understand concepts, answer questions, give examples, and guide their study. Be concise, friendly, and use markdown where it helps (bullet lists, **bold**, `code`).";

async function chatViaPuter(messages) {
  const puter = window.puter;
  if (!puter?.ai?.chat) throw new Error("Puter AI not available. Please refresh the page.");
  const model = getChatModelPuter();
  const fullMessages = [{ role: "system", content: CHAT_SYSTEM }, ...messages];
  const resp  = await puter.ai.chat(fullMessages, { model });
  const text  = typeof resp === "string" ? resp
    : resp?.message?.content ?? resp?.choices?.[0]?.message?.content ?? resp?.content ?? "";
  if (!text.trim()) throw new Error("Empty response from AI.");
  return { text: text.trim(), model };
}

async function chatViaOpenRouter(messages) {
  const apiKey = getOpenRouterKey();
  if (!apiKey) throw new Error("No OpenRouter API key set. Go to Settings → AI Provider.");
  const model = getChatModelOpenRouter();
  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method:  "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${apiKey}`,
      "HTTP-Referer":  window.location.origin,
      "X-Title":       "TreeFlow",
    },
    body: JSON.stringify({ model, messages: [{ role: "system", content: CHAT_SYSTEM }, ...messages] }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `OpenRouter error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content ?? "";
  if (!text.trim()) throw new Error("Empty response from OpenRouter.");
  return { text: text.trim(), model };
}

async function chatViaGemini(messages) {
  const apiKey = getGeminiKey();
  if (!apiKey) throw new Error("No Gemini API key set. Go to Settings → AI Provider.");
  // Gemini requires alternating user/model turns — map "assistant" → "model"
  const contents = messages.map(m => ({
    role:  m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({
      system_instruction: { parts: [{ text: CHAT_SYSTEM }] },
      contents,
    }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error?.message || `Gemini error ${res.status}`);
  }
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text.trim()) throw new Error("Empty response from Gemini.");
  return { text: text.trim(), model: "gemini-2.0-flash-lite" };
}

// messages = [{role:"user"|"assistant", content:"..."}]
export async function chatWithAi(messages) {
  const provider = getAiProvider();
  if (provider === "gemini")     return chatViaGemini(messages);
  if (provider === "openrouter") return chatViaOpenRouter(messages);
  return chatViaPuter(messages);
}
