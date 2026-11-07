// @ts-check
// El progreso de cada nino es lo unico que la app no puede regenerar. Esta
// comprobacion vigila que no se pierda:
//   1. una copia de la clase se recupera entera, y recuperarla dos veces da
//      lo mismo que una;
//   2. recuperar sobre una tablet que ya tiene ese alumno JUNTA el progreso,
//      nunca lo pisa;
//   3. un archivo roto, ajeno o de una version futura se rechaza con un
//      mensaje claro, y uno tocado a mano no mete basura;
//   4. los botones de copia del panel del profesor funcionan de verdad;
//   5. las fechas van en la hora del aparato (en Lima, jugar por la noche no
//      rompe la racha).

import * as state from '../src/core/state.js';
import * as profiles from '../src/core/profiles.js';
import { recordShields } from '../src/engine/progress.js';
import { mark } from '../src/engine/vocabulary.js';
import { heardAll } from '../src/engine/letters.js';
import { recordPaperTest, paperTests } from '../src/engine/paperTests.js';
import { recordTeacherMark, recordSelfCheck } from '../src/engine/speakingScale.js';
import { createRun, currentGameId, record, advance } from '../src/engine/mock.js';
import { saveMock } from '../src/engine/report.js';
import {
  makeBackup, parseBackup, restoreBackup, cleanAlbum, mergeAlbums, fileName, MAX_BYTES,
} from '../src/engine/backup.js';
import { localDate, dayBefore, localDayNumber } from '../src/core/time.js';
import { createBrowser, settle } from './lib/browser.js';

export const name = 'El progreso de los ninos no se pierde (copias y fechas)';

const same = (/** @type {unknown} */ a, /** @type {unknown} */ b) => JSON.stringify(a) === JSON.stringify(b);
/** Igual en contenido, sin mirar el orden de las listas del mismo dia. @param {any} a */
const canon = (a) => JSON.stringify({ ...a,
  speaking: { self: a.speaking.self.map(JSON.stringify).sort(), teacher: a.speaking.teacher.map(JSON.stringify).sort() },
  mocks: a.mocks.map(JSON.stringify).sort() });

/** Borra todos los perfiles de la prueba (y solo esos). */
function clearProfiles(/** @type {string} */ prefix) {
  for (const p of profiles.list()) if (p.name.startsWith(prefix)) profiles.remove(p.id);
}

/** @param {string} name @param {(id: string) => void} fill */
function makeProfile(name, fill) {
  const p = /** @type {{ id: string, name: string }} */ (profiles.add(name, { select: false }));
  state.useProfile(p.id);
  state.reset();
  fill(p.id);
  return p;
}

export async function run() {
  /** @type {string[]} */
  const problems = [];
  const before = state.activeProfile();
  const P = 'zz';
  clearProfiles(P);

  // ---------------------------------------------------------- 1. ida y vuelta
  const ana = makeProfile(`${P}Ana`, () => {
    recordShields('spellit', 5);
    recordShields('respond', 2);
    mark('cat', true); mark('cat', true); mark('dog', false);
    heardAll(['J', 'I', 'L', 'L', '14'], [false, true, true, true, false]);
    recordPaperTest({ when: '2026-10-20', name: 'Sample test 1', listening: 22, reading: 30, speaking: 4 });
    recordPaperTest({ when: '2026-10-27', name: '', listening: 24, reading: null, speaking: null });
    recordTeacherMark({ vocabulary: 4, pronunciation: 3, interaction: 5 }, 'good');
    recordSelfCheck({ vocabulary: 3, pronunciation: 3, interaction: 3 });
    state.update((s) => { s.stickers.animals = ['cat', 'dog']; s.streak = 4; s.lastPlayed = '2026-10-10'; });
    const run = createRun();
    for (let i = 0; i < 100; i += 1) { record(run, currentGameId(run), 3, 5); if (advance(run) === 'end') break; }
    saveMock(run);
  });
  const ben = makeProfile(`${P}Ben`, () => { recordShields('colour', 4); mark('bus', true); });
  const empty = makeProfile(`${P}Cleo`, () => {});
  const keep = (/** @type {string} */ id) => { state.useProfile(id); return cleanAlbum(state.get()); };
  const original = { [ana.name]: keep(ana.id), [ben.name]: keep(ben.id), [empty.name]: keep(empty.id) };
  state.useProfile(ben.id);

  const ids = [ana.id, ben.id, empty.id];
  const backup = makeBackup(ids);
  const text = JSON.stringify(backup);
  if (backup.albums.length !== 3 || backup.kind !== 'class') problems.push('la copia de la clase no lleva los tres albumes');
  if (!/^movers-class-\d{4}-\d{2}-\d{2}\.json$/.test(fileName(backup))) problems.push(`el archivo de la clase se llama "${fileName(backup)}"`);
  const single = makeBackup([ana.id]);
  if (single.kind !== 'child' || fileName(single) !== `movers-zzana-${localDate()}.json`) problems.push(`la copia de un alumno se llama "${fileName(single)}"`);
  if (!same(backup.albums.find((a) => a.name === ben.name)?.data, original[ben.name])) {
    problems.push('la copia del alumno que esta jugando no lleva lo ultimo que ha hecho');
  }

  clearProfiles(P);
  if (profiles.list().some((p) => p.name.startsWith(P))) problems.push('borrar un alumno no lo borra');
  const back = restoreBackup(parseBackup(text));
  if (back.added.length !== 3 || back.merged.length) problems.push(`al recuperar en una tablet vacia: ${JSON.stringify(back)}`);
  for (const p of profiles.list().filter((x) => x.name.startsWith(P))) {
    state.useProfile(p.id);
    if (!same(cleanAlbum(state.get()), original[p.name])) problems.push(`el album de ${p.name} no vuelve igual que se guardo`);
  }
  const again = restoreBackup(parseBackup(text));
  if (again.added.length || again.merged.length !== 3) problems.push('recuperar dos veces crea albumes repetidos');
  for (const p of profiles.list().filter((x) => x.name.startsWith(P))) {
    state.useProfile(p.id);
    if (!same(cleanAlbum(state.get()), original[p.name])) problems.push(`recuperar dos veces cambia el album de ${p.name}`);
  }
  if (profiles.list().filter((p) => p.name.startsWith(P)).length !== 3) problems.push('recuperar dos veces no deja exactamente tres albumes');

  // Un alumno borrado y vuelto a crear no hereda el album del borrado.
  clearProfiles(P);
  const fresh = /** @type {{ id: string, name: string }} */ (profiles.add(`${P}Ana`, { select: false }));
  state.useProfile(fresh.id);
  if (Object.keys(cleanAlbum(state.get()).shields).length) problems.push('un alumno nuevo hereda los escudos de otro borrado con el mismo nombre');

  // ---------------------------------------------------------- 2. juntar
  state.useProfile(fresh.id);
  state.update((s) => {
    s.stickers = { animals: ['cat'] };
    s.shields = { spellit: 5 };
    s.vocab = { cat: { r: 3, w: 0, s: 3, d: 100, ok: true, u: 100 }, cow: { r: 1, w: 2, s: 0, d: 90, ok: false } };
    /** @type {any} */ (s).letters = { J: { r: 1, w: 3 }, 14: { r: 2, w: 0 } };
    s.streak = 2; s.lastPlayed = '2026-10-12';
  });
  const incoming = cleanAlbum({
    stickers: { animals: ['dog'], body: ['arm'] },
    shields: { spellit: 3, respond: 4 },
    vocab: { cat: { r: 1, w: 1, s: 0, d: 101, ok: false, u: 99 }, cow: { r: 2, w: 0, s: 2, d: 95, ok: true, u: 95 } },
    letters: { J: { r: 2, w: 1 }, E: { r: 0, w: 2 } },
    streak: 6, lastPlayed: '2026-10-14',
  });
  const joined = restoreBackup({ app: 'movers-album', format: 1, kind: 'child', exported: '', albums: [{ name: `${P}ana`, data: incoming }] });
  if (joined.merged.length !== 1 || joined.added.length) problems.push('un alumno con el mismo nombre (aunque cambie la mayuscula) no se junta');
  state.useProfile(fresh.id);
  const now = cleanAlbum(state.get());
  if (!same(now.stickers.animals?.slice().sort(), ['cat', 'dog']) || !same(now.stickers.body, ['arm'])) problems.push('al juntar se pierden cromos');
  if (now.shields.spellit !== 5 || now.shields.respond !== 4) problems.push('al juntar no se queda el mejor escudo de cada parte');
  if (now.vocab.cat.r !== 3 || now.vocab.cat.d !== 101 || now.vocab.cat.ok !== false) problems.push('al juntar, una palabra pierde aciertos o el ultimo intento');
  if (now.vocab.cow.r !== 2 || now.vocab.cow.w !== 2 || now.vocab.cow.ok !== true) problems.push('al juntar, las cuentas de una palabra no son las mayores');
  // El dia en que subio el repaso: el mas reciente de los dos (si no, la misma
  // palabra podria subir dos escalones el mismo dia al juntar dos tablets).
  if (now.vocab.cat.u !== 100 || now.vocab.cow.u !== 95) problems.push(`al juntar se pierde el dia en que subio el repaso: ${JSON.stringify(now.vocab)}`);
  if (now.streak !== 6 || now.lastPlayed !== '2026-10-14') problems.push('al juntar no manda la racha del ultimo dia jugado');
  if (!same(now.letters, { 14: { r: 2, w: 0 }, E: { r: 0, w: 2 }, J: { r: 2, w: 3 } })) problems.push(`al juntar se pierden las letras que confunde: ${JSON.stringify(now.letters)}`);
  // Los examenes en papel: los de los dos lados, sin repetir lo que esta en los dos.
  const paperA = { when: '2026-10-20', name: 'Sample 1', listening: 20, reading: 30, speaking: 3 };
  const paperB = { when: '2026-10-27', name: 'Sample 2', listening: 23, reading: null, speaking: null };
  const papersJoined = mergeAlbums(cleanAlbum({ paperTests: [paperA] }), cleanAlbum({ paperTests: [paperA, paperB] })).paperTests;
  if (!same(papersJoined, [paperA, paperB])) problems.push(`al juntar se pierden o se repiten examenes en papel: ${JSON.stringify(papersJoined)}`);
  // El cuaderno de errores: de los dos lados, el intento mas reciente de cada
  // pregunta manda, y lo que ya esta arreglado no vuelve.
  const slip = { game: 'spellit', kind: 'write', prompt: 'This is a baby cat.', answer: 'a kitten', first: '2026-10-01', misses: 1, wins: [] };
  const pick = { game: 'respond', kind: 'choose', prompt: 'Mum: Where is your bag?', answer: 'In my room.', options: ['In my room.', 'Yes, it is.', 'I like it.'], first: '2026-10-02', misses: 1, wins: [] };
  const mineBook = cleanAlbum({ mistakes: [{ ...slip, last: '2026-10-05', wins: ['2026-10-05'] }], mistakesFixed: 3 });
  const theirBook = cleanAlbum({ mistakes: [{ ...slip, last: '2026-10-07', misses: 2, given: 'a kiten' }, { ...pick, last: '2026-10-02' }], mistakesFixed: 1 });
  const books = mergeAlbums(mineBook, theirBook);
  if (books.mistakes.length !== 2 || books.mistakesFixed !== 3) problems.push(`al juntar se pierden errores del cuaderno: ${JSON.stringify(books.mistakes)}`);
  const kitten = books.mistakes.find((m) => m.answer === 'a kitten');
  if (!kitten || kitten.last !== '2026-10-07' || kitten.misses !== 2 || kitten.wins.length) problems.push('al juntar, un error no se queda con su intento mas reciente');
  if (canon(mergeAlbums(mineBook, theirBook)) !== canon(mergeAlbums(theirBook, mineBook))) problems.push('juntar los cuadernos de errores depende del orden');
  const fixedTwice = mergeAlbums(cleanAlbum({ mistakes: [{ ...slip, last: '2026-10-05', wins: ['2026-10-05'] }] }), cleanAlbum({ mistakes: [{ ...slip, last: '2026-10-05', wins: ['2026-10-04'] }] }));
  if (fixedTwice.mistakes.length) problems.push('un error acertado en dos dias (uno en cada tablet) sigue en el cuaderno al juntar');
  const junk = cleanAlbum({ mistakes: [{ ...pick, last: '2026-10-02', answer: 'Not an option.' }, { ...slip, last: 'ayer' }, 'x', null], mistakesFixed: -4 });
  if (junk.mistakes.length || junk.mistakesFixed !== 0) problems.push(`errores sin sentido entran en el cuaderno: ${JSON.stringify(junk.mistakes)}`);
  if (!same(mergeAlbums(now, now), now)) problems.push('juntar un album consigo mismo lo cambia');
  if (canon(mergeAlbums(original[`${P}Ana`], incoming)) !== canon(mergeAlbums(incoming, original[`${P}Ana`]))) {
    problems.push('juntar A con B no da lo mismo que juntar B con A');
  }
  if (state.activeProfile() !== fresh.id) problems.push('recuperar una copia cambia quien esta jugando');

  // ---------------------------------------------------------- 3. archivos malos
  const rejects = /** @type {[string, string][]} */ ([
    ['', 'vacio'],
    ['hola', 'que no es JSON'],
    [JSON.stringify({ app: 'other', format: 1, albums: [] }), 'de otra app'],
    [JSON.stringify({ app: 'movers-album', format: 99, albums: [{ name: 'X', data: {} }] }), 'de una version futura'],
    [JSON.stringify({ app: 'movers-album', format: 1, albums: [] }), 'sin albumes'],
    [JSON.stringify({ app: 'movers-album', format: 1, albums: [{ name: '  ', data: {} }] }), 'sin nombres'],
    ['x'.repeat(MAX_BYTES + 1), 'demasiado grande'],
  ]);
  for (const [raw, what] of rejects) {
    let message = '';
    try { parseBackup(raw); } catch (error) { message = error instanceof Error ? error.message : ''; }
    if (!message) problems.push(`se acepta un archivo ${what}`);
    else if (!/[A-Z].*\.$/.test(message)) problems.push(`el mensaje para un archivo ${what} no se entiende: "${message}"`);
  }
  const dirty = cleanAlbum({
    shields: { spellit: 99, respond: -3, ['__proto__']: 5 },
    stickers: { animals: ['cat', 'cat', 7] },
    speaking: { self: [{ when: '2026-10-01', bands: { vocabulary: 9, pronunciation: 1, interaction: 1 } }], teacher: [] },
    mocks: Array.from({ length: 30 }, () => ({ when: '2026-10-01', shields: 99, outOf: 15, papers: [] })),
    streak: 'mucho', lastPlayed: 'ayer', extra: 'basura',
    letters: { J: { r: -3, w: 'x' }, cat: { r: 1, w: 1 }, 11: { r: 1, w: 1 }, ['__proto__']: { r: 1, w: 1 }, E: 'mucho' },
    paperTests: [
      { when: '2026-10-01', name: 'ok', listening: 25, reading: 39, speaking: 5 },
      { when: '2026-10-02', listening: 26, reading: 10 }, { when: 'ayer', listening: 3 },
      { when: '2026-10-03', listening: 2.5, reading: -1, speaking: 6 }, 'basura', null,
    ],
  });
  if (dirty.shields.spellit !== 5 || dirty.shields.respond !== 0) problems.push('un escudo fuera de 0-5 entra tal cual');
  if (Object.prototype.hasOwnProperty.call(dirty.shields, '__proto__')) problems.push('una clave __proto__ entra en el album');
  if (!same(dirty.stickers.animals, ['cat'])) problems.push('cromos repetidos o raros entran en el album');
  if (dirty.speaking.self.length) problems.push('una nota de Speaking imposible entra en el album');
  if (dirty.mocks.length !== 10 || dirty.mocks[0].shields !== 15) problems.push('los simulacros de un archivo tocado no se recortan');
  if (dirty.streak !== 0 || dirty.lastPlayed !== null || 'extra' in dirty) problems.push('datos sin sentido entran en el album');
  if (!same(dirty.letters, { J: { r: 0, w: 0 } })) problems.push(`letras o numeros sin sentido entran en el album: ${JSON.stringify(dirty.letters)}`);
  // Una nota imposible (26 sobre 25) no entra, pero lo demas de ese examen si.
  if (!same(dirty.paperTests, [
    { when: '2026-10-01', name: 'ok', listening: 25, reading: 39, speaking: 5 },
    { when: '2026-10-02', name: '', listening: null, reading: 10, speaking: null },
  ])) problems.push(`examenes en papel sin sentido entran en el album: ${JSON.stringify(dirty.paperTests)}`);

  clearProfiles(P);
  if (before) state.useProfile(before); else state.useProfile('');

  // ---------------------------------------------------------- 3b. claves raras, repetidos y plan
  // Un archivo con claves que se llaman como cosas de Object.prototype no
  // puede romper la restauracion a medias (antes: TypeError y el album activo
  // viejo tapaba el juntado).
  const raro = makeProfile(`${P}Raro`, () => recordShields('spellit', 3));
  const whoBefore = profiles.currentId();
  try {
    const out = restoreBackup({
      app: 'movers-album', format: 1, kind: 'child', exported: '2026-11-05T12:00:00.000Z',
      albums: [{ name: `${P}Raro`, data: /** @type {any} */ ({
        stickers: { toString: ['cat'], animals: ['dog'] },
        shields: { valueOf: 4, respond: 4 },
        vocab: { hasOwnProperty: { r: 1, w: 0, s: 1, d: 1, ok: true } },
      }) }],
    });
    state.useProfile(raro.id);
    const now = /** @type {any} */ (state.get());
    if (out.failed.length) problems.push('restaurar en un aparato con sitio dice que algo no se guardo');
    if (now.shields.respond !== 4 || now.shields.spellit !== 3) problems.push('con claves raras en el archivo, no se junta lo bueno');
    if (Object.hasOwn(now.shields, 'valueOf') || Object.hasOwn(now.stickers, 'toString') || Object.hasOwn(now.vocab ?? {}, 'hasOwnProperty')) {
      problems.push('claves como toString o valueOf entran en el album');
    }
  } catch (error) {
    problems.push(`una copia con claves como toString rompe la restauracion: ${error instanceof Error ? error.message : error}`);
  }
  if (profiles.currentId() !== whoBefore) problems.push('restaurar una copia cambia quien esta jugando');
  // Lo que de verdad se hizo dos veces no se pierde al juntar.
  const mockDone = { when: '2026-10-20', shields: 9, outOf: 15, papers: [] };
  const twice = cleanAlbum({ mocks: [mockDone, mockDone] });
  if (mergeAlbums(twice, twice).mocks.length !== 2 || mergeAlbums(twice, cleanAlbum({ mocks: [mockDone] })).mocks.length !== 2) {
    problems.push('al juntar, dos simulacros iguales hechos de verdad se quedan en uno');
  }
  // El plan del dia viaja con la copia, y lo tachado en los dos lados se suma.
  const steps = [
    { key: 'words', gameId: 'vocab', route: '/play/vocab/animals', title: 'Word gym', reason: 'x', icon: '' },
    { key: 'part', gameId: 'respond', route: '/play/respond/animals', title: 'Part', reason: 'x', icon: '' },
    { key: 'extra', gameId: 'mock', route: '/mock', title: 'Mock test', reason: 'x', icon: '' },
  ];
  const withPlan = (/** @type {string[]} */ done) => cleanAlbum({ plan: { date: localDate(), steps, done } });
  const planJoined = /** @type {any} */ (mergeAlbums(withPlan(['words']), withPlan(['part'])));
  if (!planJoined.plan || planJoined.plan.done.join() !== 'words,part') problems.push('al juntar se pierde el plan del dia o lo tachado');
  if (/** @type {any} */ (cleanAlbum({ plan: { date: 'ayer', steps, done: [] } })).plan) problems.push('un plan sin sentido entra en el album');
  profiles.remove(raro.id);
  if (before) state.useProfile(before); else state.useProfile('');

  // ---------------------------------------------------------- 3c. aparato lleno
  problems.push(...await fullDevice());

  // ---------------------------------------------------------- 4. los botones de verdad
  problems.push(...await buttons());

  // ---------------------------------------------------------- 5. fechas locales
  const tz = process.env.TZ;
  process.env.TZ = 'America/Lima';
  try {
    if (localDate(Date.UTC(2026, 9, 16, 1, 0)) !== '2026-10-15') problems.push('a las 8 de la tarde en Lima la fecha ya es la de manana');
    if (dayBefore('2026-03-01') !== '2026-02-28' || dayBefore('2024-03-01') !== '2024-02-29' || dayBefore('2026-01-01') !== '2025-12-31') {
      problems.push('el dia anterior se calcula mal en los cambios de mes o de ano');
    }
    if (localDayNumber(Date.UTC(2026, 9, 16, 4, 0)) !== localDayNumber(Date.UTC(2026, 9, 15, 6, 0))) {
      problems.push('dos momentos del mismo dia de Lima cuentan como dias distintos');
    }
    const kid = makeProfile(`${P}Racha`, () => {});
    state.update((s) => { s.lastPlayed = dayBefore(localDate()); s.streak = 3; });
    state.touchStreak();
    if (state.get().streak !== 4) problems.push('jugar al dia siguiente no sube la racha');
    state.touchStreak();
    if (state.get().streak !== 4) problems.push('jugar dos veces el mismo dia sube la racha dos veces');
    profiles.remove(kid.id);
  } finally {
    if (tz === undefined) delete process.env.TZ; else process.env.TZ = tz;
    if (before) state.useProfile(before); else state.useProfile('');
  }

  return {
    ok: problems.length === 0,
    detail: 'copia de la clase, juntar, archivos rotos, botones y fechas',
    problems: [...new Set(problems)],
  };
}

/**
 * Aparato lleno: lo que no se pudo guardar se sigue leyendo (si no, al volver a
 * cargar el perfil se perderia lo que el nino acaba de hacer) y se avisa una vez.
 */
async function fullDevice() {
  /** @type {string[]} */
  const problems = [];
  const g = /** @type {any} */ (globalThis);
  const had = Object.getOwnPropertyDescriptor(g, 'window');
  const full = { on: false };
  const map = new Map();
  const localStorage = {
    getItem: (/** @type {string} */ k) => (map.has(k) ? map.get(k) : null),
    setItem: (/** @type {string} */ k, /** @type {string} */ v) => {
      if (full.on) throw new Error('QuotaExceededError');
      map.set(k, String(v));
    },
    removeItem: (/** @type {string} */ k) => { map.delete(k); },
  };
  Object.defineProperty(g, 'window', { value: { localStorage }, configurable: true, writable: true });
  const { on } = await import('../src/core/events.js');
  let warned = 0;
  const off = on('storage:failed', () => { warned += 1; });
  try {
    const storage = await import('../src/core/storage.js?aparato-lleno');
    if (!storage.persistent()) problems.push('la prueba del aparato lleno no consigue un localStorage');
    storage.writeText('movers-test', 'uno');
    full.on = true;
    if (storage.writeText('movers-test', 'dos') !== false) problems.push('con el aparato lleno, guardar dice que se guardo');
    if (storage.readText('movers-test') !== 'dos') problems.push('con el aparato lleno, lo ultimo se pierde al volver a leer');
    if (warned !== 1) problems.push(`con el aparato lleno se avisa ${warned} veces`);
    full.on = false;
    storage.writeText('movers-test', 'tres');
    if (map.get('movers-test') !== 'tres' || storage.readText('movers-test') !== 'tres') problems.push('al liberar sitio no se vuelve a guardar de verdad');
  } finally {
    off();
    if (had) Object.defineProperty(g, 'window', had); else delete g.window;
  }
  return problems;
}

/** El panel del profesor: guardar la copia y recuperarla con los botones. */
async function buttons() {
  /** @type {string[]} */
  const problems = [];
  const browser = createBrowser({ seed: 5 });
  browser.install();
  const { document, window, clock } = browser;
  try {
    const { renderTeacher } = await import('../src/ui/teacher.js');
    const P = 'zy';
    for (const name of ['Dora', 'Eli']) {
      makeProfile(`${P}${name}`, () => { recordShields('spellit', 4); mark('cat', true); });
    }
    const view = document.createElement('main');
    document.body.append(view);
    renderTeacher(view);
    const save = view.querySelectorAll('button').find((b) => /Save a backup of the class/.test(b.textContent));
    save?.click();
    const download = document.downloads.at(-1);
    if (!download || !/^movers-class-.*\.json$/.test(download.name)) problems.push('el boton de copia de la clase no descarga ningun archivo');
    const blob = download ? window.blobs.get(download.href) : null;
    const text = blob ? await blob.text() : '';
    let parsed = null;
    try { parsed = parseBackup(text); } catch { /* abajo */ }
    if (!parsed || !parsed.albums.some((a) => a.name === `${P}Dora`)) problems.push('el archivo descargado no es una copia valida de la clase');

    clearProfiles(P);
    renderTeacher(view);
    const restore = view.querySelectorAll('button').find((b) => /Restore from a backup file/.test(b.textContent));
    restore?.click();
    const input = document.fileRequests.at(-1);
    if (!input) problems.push('el boton de recuperar no abre el selector de archivos');
    else {
      input.fakeFiles = [new File([text], 'movers-class.json', { type: 'application/json' })];
      input.dispatchEvent(new (/** @type {any} */ (globalThis).Event)('change', { bubbles: true }));
      for (let i = 0; i < 6; i += 1) { await settle(2); clock.advance(10); }
      const after = view.textContent;
      if (!after.includes(`${P}Dora`) || !after.includes(`${P}Eli`)) problems.push('despues de recuperar, los alumnos no vuelven a la tabla');
      if (!/Done\..*New albums/.test(after)) problems.push('despues de recuperar no se dice que se ha hecho');
    }
    // Un archivo que no es una copia: mensaje claro y nada cambia.
    view.querySelectorAll('button').find((b) => /Restore from a backup file/.test(b.textContent))?.click();
    const input2 = document.fileRequests.at(-1);
    if (input2) {
      input2.fakeFiles = [new File(['hello'], 'notes.txt', { type: 'text/plain' })];
      input2.dispatchEvent(new (/** @type {any} */ (globalThis).Event)('change', { bubbles: true }));
      for (let i = 0; i < 6; i += 1) { await settle(2); clock.advance(10); }
      if (!/not a backup/.test(view.textContent)) problems.push('un archivo que no es una copia no se explica');
    }
    // Apuntar un examen en papel desde el panel: se elige el alumno, se
    // escriben las notas, se ve en escudos antes de guardar y se guarda en
    // SU album.
    renderTeacher(view);
    const form = view.querySelector('.paper-form');
    const dora = profiles.list().find((x) => x.name === `${P}Dora`);
    if (!form || !dora) problems.push('el panel del profesor no tiene donde apuntar un examen en papel');
    else {
      const [childSelect] = form.querySelectorAll('select');
      childSelect.value = dora.id;
      childSelect.dispatchEvent(new (/** @type {any} */ (globalThis).Event)('change', { bubbles: true }));
      const [listeningBox, readingBox] = form.querySelectorAll('input[type="number"]');
      const saveTest = form.querySelectorAll('button').find((b) => /Save results/.test(b.textContent));
      listeningBox.value = '26';
      listeningBox.dispatchEvent(new (/** @type {any} */ (globalThis).Event)('input', { bubbles: true }));
      if (!saveTest?.disabled) problems.push('el panel deja guardar 26 sobre 25 en Listening');
      listeningBox.value = '22';
      listeningBox.dispatchEvent(new (/** @type {any} */ (globalThis).Event)('input', { bubbles: true }));
      readingBox.value = '31';
      readingBox.dispatchEvent(new (/** @type {any} */ (globalThis).Event)('input', { bubbles: true }));
      if (!/Listening \d shields/.test(form.textContent)) problems.push('el panel no ensena los escudos antes de guardar el examen en papel');
      saveTest?.click();
      state.useProfile(dora.id);
      const saved = paperTests(state.get());
      if (saved.length !== 1 || saved[0].listening !== 22 || saved[0].reading !== 31 || saved[0].when !== localDate()) {
        problems.push(`el examen en papel no se guarda en el album del alumno: ${JSON.stringify(saved)}`);
      }
      state.useProfile('');
      if (!/22\/25/.test(view.textContent)) problems.push('despues de guardar, el examen en papel no sale en la tabla');
    }
    clearProfiles(P);
    for (const e of browser.errors()) problems.push(`error en ${e.where}: ${e.error instanceof Error ? e.error.message : String(e.error)}`);
  } catch (error) {
    problems.push(`la prueba de los botones se rompio: ${error instanceof Error ? error.stack : String(error)}`);
  } finally {
    browser.uninstall();
  }
  return problems;
}
