// Cada nino juega con su propio perfil. Sin esto, tres alumnos en la misma
// tablet comparten cromos y el progreso no significa nada.

const KEY = 'movers-profiles-v1';
const memory = new Map();
let usesLocalStorage = true;

try {
  window.localStorage.setItem('__movers_p__', '1');
  window.localStorage.removeItem('__movers_p__');
} catch {
  usesLocalStorage = false;
}

function readRaw() {
  try {
    return usesLocalStorage ? window.localStorage.getItem(KEY) : memory.get(KEY);
  } catch {
    return memory.get(KEY);
  }
}

function writeRaw(value) {
  try {
    if (usesLocalStorage) window.localStorage.setItem(KEY, value);
    else memory.set(KEY, value);
  } catch {
    memory.set(KEY, value);
  }
}

function read() {
  try {
    const parsed = JSON.parse(readRaw() ?? '');
    return {
      list: Array.isArray(parsed.list) ? parsed.list : [],
      current: parsed.current ?? null,
    };
  } catch {
    return { list: [], current: null };
  }
}

function write(data) {
  writeRaw(JSON.stringify(data));
  return data;
}

const slug = (name) => name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 24) || 'player';

export const list = () => read().list;

export const currentId = () => read().current;

export const current = () => list().find((p) => p.id === read().current) ?? null;

export function add(name) {
  const data = read();
  const clean = name.trim().slice(0, 18);
  if (!clean) return null;
  let id = slug(clean);
  let n = 2;
  while (data.list.some((p) => p.id === id)) {
    id = `${slug(clean)}-${n}`;
    n += 1;
  }
  const profile = { id, name: clean };
  data.list.push(profile);
  data.current = id;
  write(data);
  return profile;
}

export function select(id) {
  const data = read();
  if (!data.list.some((p) => p.id === id)) return null;
  data.current = id;
  write(data);
  return id;
}

export function remove(id) {
  const data = read();
  data.list = data.list.filter((p) => p.id !== id);
  if (data.current === id) data.current = data.list[0]?.id ?? null;
  write(data);
  try {
    if (usesLocalStorage) window.localStorage.removeItem(`movers-album-v1:${id}`);
  } catch { /* ignore */ }
  return data.list;
}
