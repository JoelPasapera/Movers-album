// @ts-check
// Donde se guarda el album de cada nino: localStorage del navegador, una
// entrada por perfil (movers-album-v1:<id>). Si el navegador no deja usar
// localStorage (modo privado antiguo, politicas del colegio), se guarda en
// memoria: la app funciona, pero al cerrar la pestana se pierde.

import { emit } from './events.js';

const BASE = 'movers-album-v1';
let KEY = BASE;

/** @param {string | null | undefined} id */
const keyFor = (id) => (id ? `${BASE}:${id}` : BASE);

/** @param {string | null | undefined} id */
export function setNamespace(id) {
  KEY = keyFor(id);
  return KEY;
}

// Sin localStorage, aqui vive todo. Con localStorage, aqui quedan solo las
// escrituras que fallaron (aparato lleno), y se leen antes que lo guardado:
// si no, al volver a cargar un perfil se perderia lo que el nino acaba de
// hacer y una copia de seguridad ya no lo llevaria.
const memory = new Map();
let usesLocalStorage = true;

try {
  const probe = '__movers_probe__';
  window.localStorage.setItem(probe, '1');
  window.localStorage.removeItem(probe);
} catch {
  usesLocalStorage = false;
}

/** ¿Lo guardado sobrevive a cerrar la pestana? */
export const persistent = () => usesLocalStorage;

/**
 * Lee una entrada de texto (tambien la usan perfiles y ajustes).
 * @param {string} key @returns {string | null}
 */
export function readText(key) {
  if (memory.has(key)) return memory.get(key);
  if (!usesLocalStorage) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Guarda una entrada de texto.
 * @param {string} key @param {string} raw
 * @returns {boolean} false si no se pudo guardar de verdad (aparato lleno)
 */
export function writeText(key, raw) {
  if (!usesLocalStorage) {
    memory.set(key, raw);
    return true;
  }
  try {
    window.localStorage.setItem(key, raw);
    memory.delete(key);
    return true;
  } catch {
    // Aparato lleno: se sigue en memoria y se avisa, para que el profesor
    // haga una copia antes de cerrar.
    memory.set(key, raw);
    emit('storage:failed', key);
    return false;
  }
}

const readKey = readText;
const writeKey = writeText;

/**
 * @template T
 * @param {string} key @param {T} fallback
 * @returns {T}
 */
function loadKey(key, fallback) {
  try {
    const raw = readKey(key);
    if (!raw) return structuredClone(fallback);
    return { ...structuredClone(fallback), ...JSON.parse(raw) };
  } catch {
    return structuredClone(fallback);
  }
}

/** @template T @param {T} fallback @returns {T} */
export const load = (fallback) => loadKey(KEY, fallback);

/** @param {unknown} data */
export const save = (data) => writeKey(KEY, JSON.stringify(data));

export function wipe() {
  try {
    if (usesLocalStorage) window.localStorage.removeItem(KEY);
  } catch { /* ignore */ }
  memory.delete(KEY);
}

/**
 * El album de otro perfil, sin cambiar de perfil (copias de seguridad).
 * @template T
 * @param {string} id @param {T} fallback
 * @returns {T}
 */
export const loadFrom = (id, fallback) => loadKey(keyFor(id), fallback);

/** @param {string} id @param {unknown} data */
export const saveTo = (id, data) => writeKey(keyFor(id), JSON.stringify(data));

/** @param {string} id */
export function wipeFor(id) {
  try {
    if (usesLocalStorage) window.localStorage.removeItem(keyFor(id));
  } catch { /* ignore */ }
  memory.delete(keyFor(id));
}
