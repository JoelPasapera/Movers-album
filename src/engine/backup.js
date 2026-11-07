// @ts-check
// Copias de seguridad: guardar los albumes en un archivo y recuperarlos.
//
// Todo vive en el navegador de la tablet. Si se borran los datos del
// navegador, se cambia de tablet o Safari limpia una web que no se abre en una
// semana, los albumes se pierden. Con un archivo de copia no.
//
// Importar nunca pierde progreso: si en la tablet ya hay un album con el
// mismo nombre, se JUNTAN (cromos de los dos, el mejor escudo de cada parte,
// la mejor cuenta de cada palabra...). Importar dos veces el mismo archivo da
// lo mismo que importarlo una.

import * as storage from '../core/storage.js';
import * as profiles from '../core/profiles.js';
import * as state from '../core/state.js';
import { localDate } from '../core/time.js';
import { isHeardKey } from './letters.js';
import { cleanPaperTest, PAPER_TESTS_KEPT } from './paperTests.js';
import { cleanMistake, MISTAKES_KEPT, WINS_TO_FIX } from './mistakes.js';

export const FORMAT = 1;
export const APP = 'movers-album';
/** Mas grande que esto no es una copia nuestra (una clase entera ocupa ~200 KB). */
export const MAX_BYTES = 5 * 1024 * 1024;
const MAX_ALBUMS = 200;
const HISTORY = 20;
const MOCKS = 10;

/**
 * @typedef {{ vocabulary: number, pronunciation: number, interaction: number }} Bands
 * @typedef {{ r: number, w: number, s: number, d: number | null, ok: boolean, u: number | null }} WordEntry
 * @typedef {{ r: number, w: number }} HeardEntry
 * @typedef {{
 *   stickers: Record<string, string[]>, shields: Record<string, number>, lastPlayed: string | null,
 *   streak: number, speaking: { self: any[], teacher: any[] }, vocab: Record<string, WordEntry>, mocks: any[],
 *   letters: Record<string, HeardEntry>, paperTests: import('./paperTests.js').PaperTest[],
 *   mistakes: import('./mistakes.js').Mistake[], mistakesFixed: number,
 * }} Album
 * @typedef {{ name: string, data: Album }} AlbumCopy
 * @typedef {{ app: string, format: number, kind: 'class' | 'child', exported: string, albums: AlbumCopy[] }} Backup
 */

// ------------------------------------------------------------- limpiar

const isObj = (/** @type {unknown} */ v) => typeof v === 'object' && v !== null && !Array.isArray(v);
const int = (/** @type {unknown} */ v, lo = 0, hi = 1e6) => (Number.isFinite(v) ? Math.min(hi, Math.max(lo, Math.round(/** @type {number} */ (v)))) : lo);
const day = (/** @type {unknown} */ v) => (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null);
const text = (/** @type {unknown} */ v, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '');
// Una clave que se llame como algo de Object.prototype (toString, valueOf,
// __proto__...) haria que `obj[clave] ?? []` devolviera una funcion heredada.
const key = (/** @type {string} */ k) => k.length <= 60 && !(k in Object.prototype) && k !== 'prototype';
/** @template T @param {Record<string, T>} obj @param {string} k @returns {T | undefined} */
const own = (obj, k) => (Object.hasOwn(obj, k) ? obj[k] : undefined);

const PLAN_KEYS = ['words', 'part', 'extra'];

/**
 * El plan del dia, si es valido (si no, se vuelve a decidir al abrir el album).
 * @param {unknown} v
 */
function plan(v) {
  if (!isObj(v)) return undefined;
  const p = /** @type {any} */ (v);
  if (!day(p.date) || !Array.isArray(p.steps) || p.steps.length !== 3) return undefined;
  const steps = p.steps.filter(isObj).map((/** @type {any} */ x) => ({
    key: text(x.key, 10), gameId: text(x.gameId, 40), route: text(x.route, 120),
    title: text(x.title, 120), reason: text(x.reason, 160), icon: text(x.icon, 8),
  }));
  if (steps.length !== 3 || steps.some((x) => !PLAN_KEYS.includes(x.key) || !x.route.startsWith('/'))) return undefined;
  const done = [...new Set((Array.isArray(p.done) ? p.done : []).filter((/** @type {unknown} */ k) => PLAN_KEYS.includes(String(k))))];
  return { date: p.date, steps, done };
}

/** @param {unknown} v @returns {Bands | null} */
function bands(v) {
  if (!isObj(v)) return null;
  const b = /** @type {any} */ (v);
  const out = { vocabulary: b.vocabulary, pronunciation: b.pronunciation, interaction: b.interaction };
  return Object.values(out).every((n) => Number.isInteger(n) && n >= 0 && n <= 5) ? out : null;
}

/**
 * Deja solo lo que la app sabe leer, con el tipo que espera. Un archivo raro
 * (de otra version, tocado a mano o roto) no puede meter basura en el album.
 * @param {unknown} raw
 * @returns {Album}
 */
export function cleanAlbum(raw) {
  const r = /** @type {any} */ (isObj(raw) ? raw : {});
  /** @type {Album} */
  const album = { ...state.defaults(), vocab: {}, mocks: [], letters: {}, paperTests: [], mistakes: [], mistakesFixed: 0 };
  if (isObj(r.stickers)) {
    for (const [topic, ids] of Object.entries(r.stickers)) {
      if (!key(topic) || !Array.isArray(ids)) continue;
      album.stickers[topic] = [...new Set(ids.filter((id) => typeof id === 'string' && id.length <= 60))];
    }
  }
  if (isObj(r.shields)) {
    for (const [game, n] of Object.entries(r.shields)) if (key(game) && Number.isFinite(n)) album.shields[game] = int(n, 0, 5);
  }
  album.lastPlayed = day(r.lastPlayed);
  album.streak = int(r.streak, 0, 10000);
  if (isObj(r.speaking)) {
    album.speaking.self = (Array.isArray(r.speaking.self) ? r.speaking.self : [])
      .map((e) => (isObj(e) && bands(e.bands) ? { when: day(e.when) ?? '', source: text(e.source, 20), bands: bands(e.bands) } : null))
      .filter(Boolean).slice(-HISTORY);
    album.speaking.teacher = (Array.isArray(r.speaking.teacher) ? r.speaking.teacher : [])
      .map((e) => (isObj(e) && bands(e.bands) ? { when: day(e.when) ?? '', bands: bands(e.bands), note: text(e.note) } : null))
      .filter(Boolean).slice(-HISTORY);
  }
  if (isObj(r.vocab)) {
    for (const [word, e] of Object.entries(r.vocab)) {
      if (!key(word) || !isObj(e)) continue;
      const x = /** @type {any} */ (e);
      album.vocab[word] = {
        r: int(x.r), w: int(x.w), s: int(x.s, 0, 10),
        d: Number.isFinite(x.d) ? int(x.d, 0, 1e7) : null, ok: x.ok === true,
        // El dia en que subio el escalon del repaso (engine/vocabulary.js).
        u: Number.isFinite(x.u) ? int(x.u, 0, 1e7) : null,
      };
    }
  }
  if (Array.isArray(r.mocks)) {
    album.mocks = r.mocks.filter(isObj).map((m) => ({
      when: day(m.when) ?? '',
      shields: int(m.shields, 0, 15),
      outOf: int(m.outOf, 0, 15),
      papers: (Array.isArray(m.papers) ? m.papers : []).filter(isObj).slice(0, 3).map((p) => ({
        id: text(p.id, 20), label: text(p.label, 40), score: int(p.score, 0, 100), total: int(p.total, 0, 100),
        shields: int(p.shields, 0, 5), ranOut: p.ranOut === true,
      })),
    })).slice(-MOCKS);
  }
  // Lo que se confunde al oido (engine/letters.js): solo letras y numeros de pareja.
  if (isObj(r.letters)) {
    for (const [k, e] of Object.entries(r.letters)) {
      if (!isHeardKey(k) || !isObj(e)) continue;
      const x = /** @type {any} */ (e);
      album.letters[k] = { r: int(x.r), w: int(x.w) };
    }
  }
  // Los examenes en papel que apunto el profesor (engine/paperTests.js).
  if (Array.isArray(r.paperTests)) {
    album.paperTests = /** @type {import('./paperTests.js').PaperTest[]} */ (r.paperTests.map(cleanPaperTest).filter(Boolean))
      .sort(byWhen).slice(-PAPER_TESTS_KEPT);
  }
  // El cuaderno de errores (engine/mistakes.js): solo errores que se entienden.
  if (Array.isArray(r.mistakes)) {
    album.mistakes = /** @type {import('./mistakes.js').Mistake[]} */ (r.mistakes.map(cleanMistake).filter(Boolean))
      .filter((m) => m.wins.length < WINS_TO_FIX).slice(-MISTAKES_KEPT);
  }
  album.mistakesFixed = int(r.mistakesFixed, 0, 1e6);
  const today = plan(r.plan);
  if (today) /** @type {any} */ (album).plan = today;
  return tidy(album);
}

/**
 * Junta los dos cuadernos de errores. De cada pregunta manda el intento mas
 * reciente; si los dos son del mismo dia, los fallos mayores y los aciertos de
 * los dos. Lo que con eso queda arreglado sale del cuaderno.
 * @param {import('./mistakes.js').Mistake[]} a @param {import('./mistakes.js').Mistake[]} b
 */
function mergeMistakes(a, b) {
  /** @type {Map<string, import('./mistakes.js').Mistake>} */
  const byKey = new Map(a.map((m) => [m.key, m]));
  for (const theirs of b) {
    const mine = byKey.get(theirs.key);
    if (!mine || theirs.last > mine.last) {
      byKey.set(theirs.key, theirs);
    } else if (theirs.last === mine.last) {
      byKey.set(theirs.key, {
        ...mine,
        first: mine.first < theirs.first ? mine.first : theirs.first,
        misses: Math.max(mine.misses, theirs.misses),
        wins: [...new Set([...mine.wins, ...theirs.wins])].sort(),
        // Dos respuestas distintas el mismo dia: se queda una fija, para que
        // juntar A con B de lo mismo que B con A.
        given: [mine.given, theirs.given].sort()[1],
      });
    }
  }
  return [...byKey.values()].filter((m) => m.wins.length < WINS_TO_FIX)
    .sort((x, y) => x.last.localeCompare(y.last) || x.key.localeCompare(y.key)).slice(-MISTAKES_KEPT);
}

// ------------------------------------------------------------- juntar

/**
 * Junta dos albumes del mismo nino sin perder nada. Es conmutativa en lo que
 * importa y se puede repetir: juntar A con A da A.
 * @param {Album} a @param {Album} b
 * @returns {Album}
 */
export function mergeAlbums(a, b) {
  const out = cleanAlbum(a);
  const other = cleanAlbum(b);
  for (const [topic, ids] of Object.entries(other.stickers)) {
    out.stickers[topic] = [...new Set([...(own(out.stickers, topic) ?? []), ...ids])];
  }
  for (const [game, n] of Object.entries(other.shields)) out.shields[game] = Math.max(own(out.shields, game) ?? 0, n);
  // La racha que vale es la del ultimo dia jugado.
  const lastA = out.lastPlayed ?? '';
  const lastB = other.lastPlayed ?? '';
  if (lastB > lastA) { out.lastPlayed = other.lastPlayed; out.streak = other.streak; } else if (lastB === lastA) out.streak = Math.max(out.streak, other.streak);
  for (const kind of /** @type {const} */ (['self', 'teacher'])) {
    out.speaking[kind] = union(out.speaking[kind], other.speaking[kind]).slice(-HISTORY);
  }
  for (const [word, e] of Object.entries(other.vocab)) {
    const mine = own(out.vocab, word);
    if (!mine) { out.vocab[word] = { ...e }; continue; }
    // Aciertos y fallos: el mayor de los dos (sumarlos contaria dos veces lo
    // mismo si se importa dos veces). El ultimo intento manda en lo demas.
    const rank = (/** @type {WordEntry} */ x) => [x.d ?? -1, x.ok ? 1 : 0, x.s];
    const [da, oa, sa] = rank(mine);
    const [db, ob, sb] = rank(e);
    const latest = db > da || (db === da && (ob > oa || (ob === oa && sb > sa))) ? e : mine;
    // El escalon ya subido hoy en cualquiera de los dos no vuelve a subir hoy.
    const climbed = Math.max(mine.u ?? -1, e.u ?? -1);
    out.vocab[word] = {
      r: Math.max(mine.r, e.r), w: Math.max(mine.w, e.w), s: latest.s, d: latest.d, ok: latest.ok, u: climbed < 0 ? null : climbed,
    };
  }
  out.mocks = union(out.mocks, other.mocks).slice(-MOCKS);
  out.paperTests = union(out.paperTests, other.paperTests).slice(-PAPER_TESTS_KEPT);
  // Las cuentas del oido: la mayor de cada una (sumar contaria dos veces lo mismo).
  for (const [k, e] of Object.entries(other.letters)) {
    const mine = own(out.letters, k);
    out.letters[k] = mine ? { r: Math.max(mine.r, e.r), w: Math.max(mine.w, e.w) } : { ...e };
  }
  out.mistakes = mergeMistakes(out.mistakes, other.mistakes);
  out.mistakesFixed = Math.max(out.mistakesFixed, other.mistakesFixed);
  // El plan del dia: el mas reciente; si son del mismo dia, lo tachado en los dos.
  const pa = /** @type {any} */ (out).plan;
  const pb = /** @type {any} */ (other).plan;
  if (pb && (!pa || pb.date > pa.date)) /** @type {any} */ (out).plan = pb;
  else if (pa && pb && pa.date === pb.date) pa.done = PLAN_KEYS.filter((k) => pa.done.includes(k) || pb.done.includes(k));
  return tidy(out);
}

/**
 * Junta dos listas de entradas (notas de Speaking, simulacros) sin repetir lo
 * que esta en las dos, pero sin perder lo que de verdad se hizo dos veces: de
 * cada entrada igual se queda el mayor numero de veces que aparece en un lado.
 * @template T @param {T[]} a @param {T[]} b @returns {T[]}
 */
function union(a, b) {
  /** @param {T[]} list */
  const count = (list) => {
    const m = new Map();
    for (const e of list) { const k = JSON.stringify(e); m.set(k, (m.get(k) ?? 0) + 1); }
    return m;
  };
  const ca = count(a);
  const cb = count(b);
  const out = [...a];
  for (const [k, n] of cb) {
    const extra = n - (ca.get(k) ?? 0);
    for (let i = 0; i < extra; i += 1) out.push(JSON.parse(k));
  }
  return out.sort(byWhen);
}

/** Por fecha; dentro del mismo dia se respeta el orden (la ultima nota del dia manda). */
const byWhen = (/** @type {any} */ x, /** @type {any} */ y) => String(x.when).localeCompare(String(y.when));

/**
 * Claves y listas en orden fijo, para que juntar A con B de exactamente lo
 * mismo que juntar B con A.
 * @param {Album} album @returns {Album}
 */
function tidy(album) {
  /** @template T @param {Record<string, T>} obj @returns {Record<string, T>} */
  const sorted = (obj) => Object.fromEntries(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
  return {
    ...album,
    stickers: sorted(Object.fromEntries(Object.entries(album.stickers).map(([k, ids]) => [k, [...ids].sort()]))),
    shields: sorted(album.shields),
    vocab: sorted(album.vocab),
    letters: sorted(album.letters),
    mistakes: [...album.mistakes].sort((x, y) => x.key.localeCompare(y.key)),
  };
}

// ------------------------------------------------------------- exportar

/** @param {string} id @returns {Album} */
const albumOf = (id) => cleanAlbum(state.activeProfile() === id ? state.get() : storage.loadFrom(id, state.defaults()));

/**
 * La copia de un alumno o de la clase entera.
 * @param {string[]} [ids] por defecto, todos
 * @returns {Backup}
 */
export function makeBackup(ids) {
  const all = profiles.list();
  const chosen = ids ? all.filter((p) => ids.includes(p.id)) : all;
  return {
    app: APP,
    format: FORMAT,
    kind: chosen.length === 1 && ids ? 'child' : 'class',
    exported: new Date().toISOString(),
    albums: chosen.map((p) => ({ name: p.name, data: albumOf(p.id) })),
  };
}

/** Nombre del archivo: movers-class-2026-10-16.json o movers-ana-2026-10-16.json. @param {Backup} backup */
export function fileName(backup) {
  const who = backup.kind === 'child'
    ? backup.albums[0].name.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'child'
    : 'class';
  return `movers-${who}-${localDate()}.json`;
}

// ------------------------------------------------------------- importar

/**
 * Lee el texto de un archivo de copia. Lanza un Error con un mensaje para el
 * profesor (en ingles, como el resto de la interfaz) si no vale.
 * @param {string} raw
 * @returns {Backup}
 */
export function parseBackup(raw) {
  if (typeof raw !== 'string' || !raw.trim()) throw new Error('The file is empty.');
  if (raw.length > MAX_BYTES) throw new Error('This file is too big to be a backup of the album.');
  /** @type {any} */
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    throw new Error('This file is not a backup of the album (it is not a JSON file).');
  }
  if (!isObj(data) || data.app !== APP) throw new Error('This file is not a backup of My Movers album.');
  if (!Number.isInteger(data.format) || data.format > FORMAT) {
    throw new Error('This backup comes from a newer version of the album. Update the album first, then try again.');
  }
  if (!Array.isArray(data.albums) || !data.albums.length) throw new Error('This backup has no albums in it.');
  if (data.albums.length > MAX_ALBUMS) throw new Error('This backup has too many albums.');
  const albums = data.albums
    .filter((a) => isObj(a) && typeof a.name === 'string' && a.name.trim())
    .map((a) => ({ name: a.name.trim().slice(0, 18), data: cleanAlbum(a.data) }));
  if (!albums.length) throw new Error('The albums in this backup have no names.');
  return { app: APP, format: FORMAT, kind: data.kind === 'child' ? 'child' : 'class', exported: text(data.exported, 40), albums };
}

/**
 * Mete una copia en esta tablet. Los nombres nuevos se crean; los que ya
 * estaban se juntan. No cambia quien esta jugando. `failed` son los que no
 * cupieron (aparato lleno): no se dan por restaurados.
 * @param {Backup} backup
 * @returns {{ added: string[], merged: string[], failed: string[] }}
 */
export function restoreBackup(backup) {
  /** @type {string[]} */
  const added = [];
  /** @type {string[]} */
  const merged = [];
  /** @type {string[]} */
  const failed = [];
  const active = state.activeProfile();
  // Dos albumes con el mismo nombre dentro del archivo se juntan primero.
  /** @type {Map<string, AlbumCopy>} */
  const byName = new Map();
  for (const copy of backup.albums) {
    const k = copy.name.toLowerCase();
    const prev = byName.get(k);
    byName.set(k, prev ? { name: prev.name, data: mergeAlbums(prev.data, copy.data) } : copy);
  }
  try {
    for (const copy of byName.values()) {
      const existing = profiles.findByName(copy.name);
      if (existing) {
        const ok = storage.saveTo(existing.id, mergeAlbums(albumOf(existing.id), copy.data));
        (ok ? merged : failed).push(existing.name);
      } else {
        const profile = profiles.add(copy.name, { select: false });
        if (!profile) continue;
        const ok = storage.saveTo(profile.id, cleanAlbum(copy.data));
        (ok ? added : failed).push(profile.name);
      }
    }
  } finally {
    // Si se junto el album de quien esta jugando, se vuelve a cargar (tambien
    // si algo fallo a medias: si no, su album viejo taparia el juntado).
    if (active) state.useProfile(active);
  }
  return { added, merged, failed };
}
