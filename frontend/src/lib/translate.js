// MyMemory free translation API wrapper + client-side caches.
// Anonymous tier: ~5000 words/day/IP. CORS-enabled. No key required.

const MAX_CHUNK = 450; // MyMemory recommends < 500 chars per request

const MEMORY = {}; // in-memory per session
const LS_PREFIX = "znnk_tr_";
const SS_PREFIX = "znnk_pd_";

const lsGet = (k) => {
  try { return JSON.parse(localStorage.getItem(k) || "null"); } catch { return null; }
};
const lsSet = (k, v) => {
  try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ }
};
const ssGet = (k) => {
  try { return JSON.parse(sessionStorage.getItem(k) || "null"); } catch { return null; }
};
const ssSet = (k, v) => {
  try { sessionStorage.setItem(k, JSON.stringify(v)); } catch { /* quota */ }
};

async function callMyMemory(text, from, to) {
  if (!text || !text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}&de=znnkstudio.gm@gmail.com`;
  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error("MyMemory HTTP " + r.status);
    const j = await r.json();
    const out = j?.responseData?.translatedText;
    if (out && typeof out === "string" && !/MYMEMORY WARNING/i.test(out)) return out;
    return text;
  } catch {
    return text;
  }
}

function splitForChunking(text) {
  if (text.length <= MAX_CHUNK) return [text];
  const parts = [];
  const sentences = text.split(/(?<=[\.\!\?])\s+/);
  let buf = "";
  for (const s of sentences) {
    if ((buf + " " + s).length > MAX_CHUNK) {
      if (buf) parts.push(buf);
      buf = s;
    } else {
      buf = buf ? buf + " " + s : s;
    }
  }
  if (buf) parts.push(buf);
  return parts;
}

// Translate a single string (with chunking for long texts)
export async function translateText(text, from, to) {
  if (!text || from === to) return text;
  const key = `${from}|${to}|${text}`;
  if (MEMORY[key] !== undefined) return MEMORY[key];
  const chunks = splitForChunking(text);
  const out = [];
  for (const c of chunks) {
    // eslint-disable-next-line no-await-in-loop
    const r = await callMyMemory(c, from, to);
    out.push(r);
  }
  const joined = out.join(" ");
  MEMORY[key] = joined;
  return joined;
}

// Batch-translate a dictionary of key -> sourceString to target language.
// Cached in localStorage under znnk_tr_<lang>.
export async function translateUiDict(dict, from, to, onProgress) {
  if (from === to) return dict;
  const cacheKey = LS_PREFIX + to;
  const cached = lsGet(cacheKey) || {};
  const result = { ...cached };
  const entries = Object.entries(dict);
  const missing = entries.filter(([k, v]) => !cached[k] && v);
  if (missing.length === 0) return result;

  const CONCURRENCY = 4;
  let done = 0;
  const total = missing.length;

  async function worker(queue) {
    while (queue.length) {
      const [k, v] = queue.shift();
      // eslint-disable-next-line no-await-in-loop
      const tr = await translateText(v, from, to);
      result[k] = tr;
      done += 1;
      if (onProgress) onProgress(done, total);
    }
  }

  const queue = [...missing];
  const workers = Array.from({ length: Math.min(CONCURRENCY, queue.length) }, () => worker(queue));
  await Promise.all(workers);
  lsSet(cacheKey, result);
  return result;
}

// Translate HTML preserving tag structure — walk text nodes.
export async function translateHtml(html, from, to) {
  if (!html || from === to) return html;
  const key = `${from}|${to}|${html}`;
  if (MEMORY[key]) return MEMORY[key];
  const cacheId = `${SS_PREFIX}${btoa(unescape(encodeURIComponent(html.slice(0, 60))))}_${from}_${to}`;
  const cached = ssGet(cacheId);
  if (cached) return cached;

  const parser = new DOMParser();
  const doc = parser.parseFromString(`<div id="__root">${html}</div>`, "text/html");
  const root = doc.getElementById("__root");
  if (!root) return html;

  const textNodes = [];
  const walk = (node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === 3) {
        const txt = child.nodeValue;
        if (txt && txt.trim()) textNodes.push(child);
      } else if (child.nodeType === 1) {
        if (["SCRIPT", "STYLE"].includes(child.tagName)) continue;
        walk(child);
      }
    }
  };
  walk(root);

  const CONCURRENCY = 3;
  let idx = 0;
  async function worker() {
    while (idx < textNodes.length) {
      const i = idx++;
      const node = textNodes[i];
      const original = node.nodeValue;
      // eslint-disable-next-line no-await-in-loop
      const tr = await translateText(original.trim(), from, to);
      node.nodeValue = original.replace(original.trim(), tr);
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  const out = root.innerHTML;
  MEMORY[key] = out;
  ssSet(cacheId, out);
  return out;
}

// Translate a plain string (title) with caching
export async function translatePlain(text, from, to) {
  if (!text || from === to) return text;
  const cacheId = `${SS_PREFIX}t_${btoa(unescape(encodeURIComponent(text))).slice(0, 60)}_${from}_${to}`;
  const cached = ssGet(cacheId);
  if (cached) return cached;
  const tr = await translateText(text, from, to);
  ssSet(cacheId, tr);
  return tr;
}
