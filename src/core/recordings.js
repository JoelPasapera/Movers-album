// @ts-check
// La voz del profesor: grabaciones de las frases que dice la app. Si una frase
// tiene grabacion, core/audio.js la pone en vez de la voz del navegador, en
// cualquier juego que la diga (y en el Listening del examen para imprimir).
//
// Se guardan en ESTE aparato, en IndexedDB (localStorage no sirve para audio:
// es pequeno y solo guarda texto). No salen de aqui salvo que el profesor las
// guarde en un archivo para abrirlo en otra tablet (exportPack / importPack).
// Son del aparato, no de un nino: no van en las copias de los albumes.
//
// Sin IndexedDB (un navegador muy viejo, algunos modos privados, el navegador
// de prueba de las comprobaciones) se guardan en memoria mientras dure la
// pagina, y la app sigue con la voz del navegador como siempre.

import { emit } from './events.js';
import { localDate } from './time.js';

const DB_NAME = 'movers-voice';
const STORE = 'lines';

/** Lo que puede ocupar un archivo de grabaciones (unas mil frases cortas). */
export const PACK_MAX_BYTES = 80 * 1024 * 1024;
/** Una frase grabada no pasa de esto (un minuto largo). */
const LINE_MAX_BYTES = 2 * 1024 * 1024;
const APP = 'movers-album';
const KIND = 'voice';
const FORMAT = 1;

/**
 * @typedef {{ key: string, text: string, type: string, size: number, when: string }} LineInfo
 * @typedef {LineInfo & { blob: Blob }} LineRecord
 */

/** Lo que hay grabado (sin el audio), para saber al momento si una frase tiene voz. @type {Map<string, LineInfo>} */
const index = new Map();
/** Sin IndexedDB, el audio vive aqui. @type {Map<string, LineRecord>} */
const memory = new Map();

/**
 * La clave de una frase: la misma frase escrita con otras comillas, otros
 * espacios o en mayusculas es la misma frase dicha.
 * @param {string} text
 */
export const keyOf = (text) => String(text).normalize('NFC')
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"')
  .replace(/\s+/g, ' ').trim().toLowerCase();

/** @returns {IDBFactory | null} */
const idb = () => {
  try {
    return typeof indexedDB === 'undefined' ? null : indexedDB;
  } catch {
    return null;
  }
};

/** @type {Promise<IDBDatabase | null> | null} */
let opening = null;

/** @returns {Promise<IDBDatabase | null>} */
function database() {
  if (opening) return opening;
  const factory = idb();
  if (!factory) return Promise.resolve(null);
  opening = new Promise((resolve) => {
    try {
      const request = factory.open(DB_NAME, 1);
      request.onupgradeneeded = () => { request.result.createObjectStore(STORE, { keyPath: 'key' }); };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
      request.onblocked = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
  return opening;
}

/**
 * Una operacion sobre el almacen. Sin base de datos, null.
 * @template T @param {'readonly' | 'readwrite'} mode @param {(store: IDBObjectStore) => IDBRequest<T>} act
 * @returns {Promise<T | null>}
 */
async function run(mode, act) {
  const db = await database();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    try {
      const request = act(db.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    } catch (error) {
      reject(error);
    }
  });
}

/** @param {LineRecord} r @returns {LineInfo} */
const infoOf = (r) => ({ key: r.key, text: r.text, type: r.type, size: r.size, when: r.when });

/** Lee lo grabado al arrancar (sin el audio). */
export async function load() {
  try {
    const all = /** @type {LineRecord[] | null} */ (await run('readonly', (s) => s.getAll()));
    index.clear();
    for (const r of all ?? [...memory.values()]) index.set(r.key, infoOf(r));
  } catch {
    // Si falla, se sigue sin grabaciones: la voz del navegador.
  }
  emit('recordings:changed', index.size);
  return index.size;
}

/** @param {string} text */
export const has = (text) => index.has(keyOf(text));
export const count = () => index.size;
/** @returns {LineInfo[]} */
export const list = () => [...index.values()];

/**
 * El audio de una frase, o null.
 * @param {string} text @returns {Promise<Blob | null>}
 */
export async function blobFor(text) {
  const key = keyOf(text);
  if (!index.has(key)) return null;
  const db = await database();
  if (!db) return memory.get(key)?.blob ?? null;
  const r = /** @type {LineRecord | undefined} */ (await run('readonly', (s) => s.get(key)));
  return r?.blob ?? null;
}

/**
 * Guarda (o cambia) la grabacion de una frase.
 * @param {string} text @param {Blob} blob @param {string} [when] fecha
 */
export async function save(text, blob, when = localDate()) {
  const key = keyOf(text);
  if (!key || !blob || !blob.size || blob.size > LINE_MAX_BYTES) throw new Error('This recording cannot be saved.');
  /** @type {LineRecord} */
  const record = { key, text: String(text), type: blob.type || 'audio/webm', size: blob.size, when, blob };
  const db = await database();
  if (db) await run('readwrite', (s) => s.put(record));
  else memory.set(key, record);
  index.set(key, infoOf(record));
  emit('recordings:changed', index.size);
}

/** Borra la grabacion de una frase (vuelve la voz del navegador). @param {string} text */
export async function remove(text) {
  const key = keyOf(text);
  const db = await database();
  if (db) await run('readwrite', (s) => s.delete(key));
  memory.delete(key);
  index.delete(key);
  emit('recordings:changed', index.size);
}

// ------------------------------------------------------------- archivo para otras tablets

/** @param {Blob} blob */
async function toBase64(blob) {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = '';
  for (let i = 0; i < bytes.length; i += 0x8000) binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(binary);
}

/** @param {string} data @param {string} type */
function fromBase64(data, type) {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type });
}

/** Todas las grabaciones en un objeto para guardarlo como archivo. */
export async function exportPack() {
  const lines = [];
  for (const info of list()) {
    const blob = await blobFor(info.text);
    if (blob) lines.push({ text: info.text, type: info.type, when: info.when, data: await toBase64(blob) });
  }
  return { app: APP, kind: KIND, format: FORMAT, exported: new Date().toISOString(), lines };
}

/**
 * Lee un archivo de grabaciones (texto JSON) y comprueba que lo es. Lanza un
 * error con un mensaje para el profesor si no.
 * @param {string} raw
 */
export function parsePack(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('This file is empty.');
  if (raw.length > PACK_MAX_BYTES) throw new Error('This file is too big to be a recordings file.');
  /** @type {any} */
  let data;
  try { data = JSON.parse(raw); } catch { throw new Error('This file is not a recordings file.'); }
  if (!data || data.app !== APP || data.kind !== KIND) throw new Error('This file is not a recordings file of My Movers album.');
  if (data.format !== FORMAT) throw new Error('This recordings file is from another version of the app.');
  if (!Array.isArray(data.lines)) throw new Error('This recordings file has no recordings.');
  const lines = data.lines.filter((/** @type {any} */ l) => l && typeof l.text === 'string' && l.text.length <= 400
    && typeof l.type === 'string' && /^audio\/[\w.+-]+/.test(l.type)
    && typeof l.data === 'string' && l.data.length <= LINE_MAX_BYTES * 1.4 && /^[A-Za-z0-9+/]*={0,2}$/.test(l.data));
  if (!lines.length) throw new Error('This recordings file has no recordings.');
  return lines.map((/** @type {any} */ l) => ({
    text: l.text, type: l.type, when: typeof l.when === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(l.when) ? l.when : undefined, data: l.data,
  }));
}

/**
 * Pone en este aparato las grabaciones de un archivo. Las frases que ya
 * tenian grabacion se cambian por la del archivo.
 * @param {string} raw
 * @returns {Promise<{ added: number, replaced: number }>}
 */
export async function importPack(raw) {
  const lines = parsePack(raw);
  let added = 0;
  let replaced = 0;
  for (const line of lines) {
    const had = has(line.text);
    await save(line.text, fromBase64(line.data, line.type), line.when);
    if (had) replaced += 1; else added += 1;
  }
  return { added, replaced };
}

/** Para las comprobaciones: empieza de cero (solo en memoria). */
export function resetForTests() {
  index.clear();
  memory.clear();
}
