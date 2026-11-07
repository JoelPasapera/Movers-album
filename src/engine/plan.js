// @ts-check
// Today's plan: tres actividades para hoy, elegidas con lo que se sabe del
// nino:
//   1. palabras: el Word gym de la pagina con mas palabras que fallo (o que
//      le toca repasar, o nuevas);
//   2. la parte del examen que peor lleva (o una que aun no ha probado);
//   3. algo distinto cada dia: un tablero del picture book, o el simulacro si
//      ya ha probado casi todas las partes y hace dos semanas que no lo hace,
//      o "Fix my mistakes" si tiene errores de otros dias esperando (lo que
//      mas rinde: repasar lo fallado, en dias distintos), o (un dia de cada
//      tres) el dictado de letras y numeros si confunde alguno al oirlo
//      (Listening 2 pide escribir nombres deletreados y numeros).
//
// El plan se decide una vez al dia y se guarda: no cambia al recargar ni al
// mejorar durante el dia. Cada actividad se tacha sola al terminar su juego
// (engine/progress.js avisa con 'practice:done').

import * as state from '../core/state.js';
import { localDate, localDayNumber } from '../core/time.js';
import { TOPICS } from '../data/topics.js';
import { BOARDS } from '../data/boards.js';
import { GAMES } from '../games/registry.js';
import { reviewSummary, progress } from './vocabulary.js';
import { weakSpots } from './letters.js';
import { dueMistakes } from './mistakes.js';
import { READY_AT } from './report.js';

/**
 * @typedef {'words' | 'part' | 'extra'} PlanKey
 * @typedef {{ key: PlanKey, gameId: string, route: string, title: string, reason: string, icon: string }} PlanStep
 * @typedef {PlanStep & { done: boolean }} PlanItem
 * @typedef {{ date: string, steps: PlanStep[], done: string[] }} StoredPlan
 */

/** Partes probadas para que el plan proponga ya el simulacro. */
export const MOCK_AFTER_PARTS = 10;
/** Dias sin simulacro para volver a proponerlo. */
export const MOCK_EVERY_DAYS = 14;

/** Cada cuantos dias se propone el dictado a quien confunde letras o numeros. */
export const LETTERS_EVERY_DAYS = 3;
/** Errores de otros dias esperando para que el plan proponga arreglarlos. */
export const FIX_AFTER = 3;

/** "J, E and 14" @param {string[]} list */
const listOf = (list) => (list.length > 1 ? `${list.slice(0, -1).join(', ')} and ${list[list.length - 1]}` : list.join(''));

/** Un numero estable por nino (para que dos ninos no tengan el mismo tablero). @param {string} s */
const hash = (s) => [...s].reduce((h, c) => (Math.imul(h, 31) + c.charCodeAt(0)) >>> 0, 7);

/** @param {any} data @returns {PlanStep} */
function wordsStep(data) {
  const pages = TOPICS.map((t, i) => ({ topic: t, i, ...reviewSummary(t.id), known: progress(t.id).mastered }));
  const pick = [...pages].sort((a, b) => (b.failing - a.failing) || (b.due - a.due) || (a.i - b.i))[0];
  /** @type {typeof pick | undefined} */
  let chosen = pick.failing || pick.due ? pick : undefined;
  if (!chosen) chosen = pages.find((p) => p.fresh > 0) ?? pages[(localDayNumber() + hash(String(data.lastPlayed))) % pages.length];
  const reason = chosen.failing
    ? `${chosen.failing} word${chosen.failing === 1 ? '' : 's'} to fix`
    : chosen.due
      ? `${chosen.due} word${chosen.due === 1 ? '' : 's'} to review`
      : chosen.fresh
        ? `New words: ${chosen.known} of ${chosen.total} known`
        : 'A quick review';
  return {
    key: 'words', gameId: 'vocab', route: `/play/vocab/${chosen.topic.id}`,
    title: `Word gym: ${chosen.topic.label}`, reason, icon: '\u{1F4DA}',
  };
}

/** @param {any} data @param {number} seed @returns {PlanStep} */
function partStep(data, seed) {
  const shields = data.shields ?? {};
  const parts = GAMES.filter((g) => g.ready).map((g, i) => ({ g, i, played: shields[g.id] !== undefined, n: shields[g.id] ?? 0 }));
  const weak = parts.filter((p) => p.played && p.n < READY_AT).sort((a, b) => (a.n - b.n) || (a.i - b.i));
  const fresh = parts.filter((p) => !p.played);
  const choice = weak[0] ?? fresh[0] ?? parts[seed % parts.length];
  const reason = !choice.played
    ? 'You have not tried this part yet'
    : choice.n < READY_AT
      ? `${choice.n} of 5 shields: get it to ${READY_AT}`
      : 'Keep it ready';
  return {
    key: 'part', gameId: choice.g.id, route: `/play/${choice.g.id}/${TOPICS[0].id}`,
    title: choice.g.title, reason: `${choice.g.tag}. ${reason}`, icon: '\u{1F3AF}',
  };
}

/** @param {any} data @param {number} seed @param {string} today @returns {PlanStep} */
function extraStep(data, seed, today) {
  const shields = data.shields ?? {};
  const tried = GAMES.filter((g) => shields[g.id] !== undefined).length;
  const mocks = Array.isArray(data.mocks) ? data.mocks : [];
  const last = mocks.length ? String(mocks[mocks.length - 1].when) : '';
  const daysSince = last ? localDayNumber(Date.parse(`${today}T12:00:00`)) - localDayNumber(Date.parse(`${last}T12:00:00`)) : Infinity;
  if (tried >= MOCK_AFTER_PARTS && daysSince >= MOCK_EVERY_DAYS) {
    return {
      key: 'extra', gameId: 'mock', route: '/mock', title: 'Mock test',
      reason: last ? `Your last one was ${daysSince} days ago` : 'You are ready for your first one', icon: '\u{1F3C1}',
    };
  }
  const waiting = dueMistakes(data, today).length;
  if (waiting >= FIX_AFTER) {
    return {
      key: 'extra', gameId: 'fixit', route: `/play/fixit/${TOPICS[0].id}`, title: 'Fix my mistakes',
      reason: `${waiting} mistakes from other days are waiting`, icon: '\u{1F527}',
    };
  }
  const weak = weakSpots(data.letters ?? {}, 3);
  const mixed = [...weak.letters, ...weak.numbers.map(String)].slice(0, 3);
  if (mixed.length && seed % LETTERS_EVERY_DAYS === 0) {
    return {
      key: 'extra', gameId: 'letters', route: `/play/letters/${TOPICS[0].id}`, title: 'Letters and numbers',
      reason: `Listen again for ${listOf(mixed)}`, icon: '\u{1F524}',
    };
  }
  const board = BOARDS[seed % BOARDS.length];
  const talk = (seed >> 3) % 2 === 0;
  const gameId = talk ? 'talkpicture' : 'picturegap';
  return {
    key: 'extra', gameId, route: `/board/${board.id}/play/${gameId}`,
    title: `${talk ? 'Let’s talk' : 'Picture gaps'}: ${board.title}`,
    reason: talk ? 'Four questions about a picture board' : 'Six sentences with a word missing', icon: '\u{1F9E9}',
  };
}

/**
 * El plan de hoy, decidido con los datos que se le pasan.
 * @param {any} data @param {string} today @param {string} who
 * @returns {PlanStep[]}
 */
export function decidePlan(data, today, who) {
  const seed = (localDayNumber(Date.parse(`${today}T12:00:00`)) + hash(who)) >>> 0;
  return [wordsStep(data), partStep(data, seed), extraStep(data, seed, today)];
}

/**
 * El plan de hoy del alumno que esta jugando. Si aun no hay plan de hoy, se
 * decide y se guarda.
 * @returns {PlanItem[]}
 */
export function todaysPlan() {
  const today = localDate();
  const data = state.get();
  /** @type {StoredPlan | undefined} */
  let plan = data.plan;
  if (!plan || plan.date !== today || !Array.isArray(plan.steps) || plan.steps.length !== 3) {
    plan = { date: today, steps: decidePlan(data, today, state.activeProfile() ?? ''), done: [] };
    const fresh = plan;
    state.update((s) => { s.plan = fresh; }, { quiet: true });
  }
  const done = new Set(plan.done ?? []);
  return plan.steps.map((step) => ({ ...step, done: done.has(step.key) }));
}

/** Juegos que practican lo mismo desde cualquier pagina: el dictado y el cuaderno de errores. */
const ANY_PAGE = new Set(['letters', 'fixit']);

/** Dos rutas son el mismo sitio aunque una lleve barra al final. @param {string} a @param {string} b */
const samePlace = (a, b) => a.split('/').filter(Boolean).join('/') === b.split('/').filter(Boolean).join('/');

/**
 * Tacha del plan de hoy lo que se haga con ese juego. Si se sabe donde se jugo
 * (la ruta), las palabras y los tableros solo se tachan en SU pagina o SU
 * tablero: el Word gym de otra pagina no cuenta. Una parte del examen es la
 * misma desde cualquier pagina, y el dictado de letras y numeros tambien.
 * @param {string} gameId
 * @param {string} [route]
 * @returns {boolean} si se tacho algo
 */
export function markDone(gameId, route) {
  /** @type {StoredPlan | undefined} */
  const plan = state.get().plan;
  if (!plan || plan.date !== localDate()) return false;
  const here = (/** @type {PlanStep} */ s) => !route || s.key === 'part' || ANY_PAGE.has(s.gameId) || samePlace(s.route, route);
  const keys = plan.steps.filter((s) => s.gameId === gameId && here(s) && !plan.done.includes(s.key)).map((s) => s.key);
  if (!keys.length) return false;
  state.update((s) => { s.plan = { ...plan, done: [...plan.done, ...keys] }; });
  return true;
}
