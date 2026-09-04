const BASE = 'movers-album-v1';
let KEY = BASE;

export function setNamespace(id) {
  KEY = id ? `${BASE}:${id}` : BASE;
  return KEY;
}
const memory = new Map();
let usesLocalStorage = true;

try {
  const probe = '__movers_probe__';
  window.localStorage.setItem(probe, '1');
  window.localStorage.removeItem(probe);
} catch {
  usesLocalStorage = false;
}

export function load(fallback) {
  try {
    const raw = usesLocalStorage ? window.localStorage.getItem(KEY) : memory.get(KEY);
    if (!raw) return structuredClone(fallback);
    return { ...structuredClone(fallback), ...JSON.parse(raw) };
  } catch {
    return structuredClone(fallback);
  }
}

export function save(data) {
  const raw = JSON.stringify(data);
  try {
    if (usesLocalStorage) window.localStorage.setItem(KEY, raw);
    else memory.set(KEY, raw);
    return true;
  } catch {
    memory.set(KEY, raw);
    return false;
  }
}

export function wipe() {
  try {
    if (usesLocalStorage) window.localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  memory.delete(KEY);
}
