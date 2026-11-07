// @ts-check
// Cada nino juega con su propio perfil. Sin esto, tres alumnos en la misma
// tablet comparten cromos y el progreso no significa nada.

import { wipeFor, readText, writeText } from './storage.js';

const KEY = 'movers-profiles-v1';

const readRaw = () => readText(KEY);
/** @param {string} value */
const writeRaw = (value) => writeText(KEY, value);

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

/** @param {string} name */
const slug = (name) => name.trim().toLowerCase()
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
  .slice(0, 24) || 'player';

/** @param {string} name */
const sameName = (name) => {
  const clean = name.trim().toLowerCase();
  return (/** @type {{ id: string, name: string }} */ p) => p.name.trim().toLowerCase() === clean;
};

/** @returns {{ id: string, name: string }[]} */
export const list = () => read().list;

/** El perfil con ese nombre (sin distinguir mayusculas), si ya existe. @param {string} name */
export const findByName = (name) => list().find(sameName(name)) ?? null;

export const currentId = () => read().current;

export const current = () => list().find((p) => p.id === read().current) ?? null;

/** El que juega, solo si sigue existiendo. */
export const validCurrentId = () => current()?.id ?? null;

/**
 * Crea un perfil. Con `select: false` (al importar una copia) no cambia quien
 * esta jugando.
 * @param {string} name
 * @param {{ select?: boolean }} [options]
 */
export function add(name, { select: choose = true } = {}) {
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
  if (choose) data.current = id;
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
  // Si se borra al que estaba jugando, no juega nadie (la app pregunta quien
  // juega): otro nino no puede heredar la sesion sin darse cuenta.
  if (data.current === id) data.current = null;
  write(data);
  // Su album se borra tambien: si no, un nino nuevo con el mismo nombre
  // heredaria los cromos del que se borro.
  wipeFor(id);
  return data.list;
}
