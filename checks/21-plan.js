// @ts-check
// Today's plan: tres actividades que dependen de lo que el nino necesita.
// Aqui se comprueba que el plan elige con sentido (palabras falladas, la
// parte mas floja, el simulacro cuando toca), que no cambia durante el dia,
// que se tacha al jugar y que se renueva al dia siguiente.

import * as state from '../src/core/state.js';
import * as profiles from '../src/core/profiles.js';
import { on } from '../src/core/events.js';
import { mark } from '../src/engine/vocabulary.js';
import { recordShields, practised } from '../src/engine/progress.js';
import { todaysPlan, markDone, decidePlan, MOCK_AFTER_PARTS, MOCK_EVERY_DAYS, FIX_AFTER } from '../src/engine/plan.js';
import { localDate, dayBefore } from '../src/core/time.js';
import { GAMES, PRACTICE, getGame } from '../src/games/registry.js';
import { BOARDS, BOARD_GAMES } from '../src/data/boards.js';
import { TOPICS } from '../src/data/topics.js';
import { createBrowser } from './lib/browser.js';

export const name = 'El plan del dia elige con sentido y se tacha al jugar';

/** ¿La ruta lleva a algo que existe? @param {string} route */
function routeOk(route) {
  let m = /^\/play\/([^/]+)\/([^/]+)$/.exec(route);
  if (m) return Boolean(getGame(m[1])?.ready) && TOPICS.some((t) => t.id === m?.[2]);
  m = /^\/board\/([^/]+)\/play\/([^/]+)$/.exec(route);
  if (m) return BOARDS.some((b) => b.id === m?.[1]) && BOARD_GAMES.some((g) => g.id === m?.[2]);
  return route === '/mock';
}

export async function run() {
  /** @type {string[]} */
  const problems = [];
  const before = state.activeProfile();
  const kid = /** @type {{ id: string, name: string }} */ (profiles.add('zzPlan', { select: false }));
  state.useProfile(kid.id);
  state.reset();
  const today = localDate();
  const forceNewDay = () => state.update((s) => { if (s.plan) s.plan.date = dayBefore(today); });

  try {
    // 1. Un alumno nuevo
    const first = todaysPlan();
    if (first.length !== 3 || first.map((s) => s.key).join() !== 'words,part,extra') problems.push(`el plan no tiene sus tres pasos: ${first.map((s) => s.key)}`);
    for (const s of first) {
      if (!routeOk(s.route)) problems.push(`el paso "${s.title}" lleva a una ruta que no existe: ${s.route}`);
      if (!s.title || !s.reason || !s.icon) problems.push(`al paso ${s.key} le falta titulo, motivo o dibujo`);
      if (s.done) problems.push('un plan recien hecho ya tiene algo tachado');
    }
    if (first[0].route !== `/play/vocab/${TOPICS[0].id}`) problems.push(`sin nada jugado, las palabras no empiezan por la primera pagina (${first[0].route})`);
    if (first[1].gameId !== GAMES[0].id) problems.push(`sin nada jugado, la parte propuesta no es la primera del examen (${first[1].gameId})`);
    if (first[2].gameId === 'mock') problems.push('a un alumno nuevo se le propone el simulacro');

    // 2. No cambia durante el dia, aunque cambie el progreso
    recordShields('respond', 1);
    const again = todaysPlan();
    if (JSON.stringify(again) !== JSON.stringify(first)) problems.push('el plan cambia durante el mismo dia');

    // 3. Al dia siguiente: palabras falladas y la parte mas floja
    const page = TOPICS[3];
    mark(page.words[0].id, false);
    mark(page.words[1].id, false);
    recordShields('spellit', 5);
    recordShields('colour', 3);
    forceNewDay();
    const next = todaysPlan();
    if (next[0].route !== `/play/vocab/${page.id}` || !/2 words to fix/.test(next[0].reason)) {
      problems.push(`con palabras falladas en "${page.label}", el plan propone ${next[0].route} (${next[0].reason})`);
    }
    if (next[1].gameId !== 'respond' || !/1 of 5 shields/.test(next[1].reason)) problems.push(`la parte mas floja no es la propuesta (${next[1].gameId}: ${next[1].reason})`);
    if (next.some((s) => s.done)) problems.push('al dia siguiente el plan nuevo viene tachado');

    // 4. Se tacha al jugar, con el aviso de verdad
    let heard = '';
    const off = on('practice:done', (/** @type {string} */ id) => { heard = id; markDone(id); });
    practised('vocab');
    off();
    if (heard !== 'vocab') problems.push('terminar un juego no avisa al plan');
    const ticked = todaysPlan();
    if (!ticked[0].done || ticked[1].done) problems.push('terminar el Word gym no tacha (solo) las palabras');
    if (markDone('vocab')) problems.push('tachar dos veces lo mismo cambia algo');
    // Solo cuenta en su sitio: el Word gym de otra pagina no tacha las palabras.
    forceNewDay();
    const fresh = todaysPlan();
    const otherPage = TOPICS.find((t) => `/play/vocab/${t.id}` !== fresh[0].route);
    if (otherPage && markDone('vocab', `/play/vocab/${otherPage.id}`)) problems.push('el Word gym de otra pagina tacha las palabras del plan');
    if (!markDone('vocab', fresh[0].route)) problems.push('el Word gym de la pagina del plan no tacha las palabras');
    if (fresh[1].gameId !== 'vocab' && !markDone(fresh[1].gameId, `/play/${fresh[1].gameId}/${TOPICS[5].id}`)) {
      problems.push('una parte del examen jugada desde otra pagina no se tacha');
    }
    if (markDone('no-such-game')) problems.push('un juego que no esta en el plan tacha algo');
    markDone(ticked[1].gameId);
    markDone(ticked[2].gameId);
    if (!todaysPlan().every((s) => s.done)) problems.push('al hacer las tres cosas el plan no queda completo');

    // 5. El simulacro, cuando toca
    const data = structuredClone(state.get());
    for (const g of GAMES.slice(0, MOCK_AFTER_PARTS)) data.shields[g.id] = 3;
    data.mocks = [];
    if (decidePlan(data, today, kid.id)[2].gameId !== 'mock') problems.push(`con ${MOCK_AFTER_PARTS} partes probadas y ningun simulacro, no se propone el simulacro`);
    let recent = today;
    for (let i = 0; i < 3; i += 1) recent = dayBefore(recent);
    data.mocks = [{ when: recent, shields: 9, outOf: 15, papers: [] }];
    if (decidePlan(data, today, kid.id)[2].gameId === 'mock') problems.push('se propone el simulacro aunque se hizo hace tres dias');
    let old = today;
    for (let i = 0; i < MOCK_EVERY_DAYS + 1; i += 1) old = dayBefore(old);
    data.mocks = [{ when: old, shields: 9, outOf: 15, papers: [] }];
    if (decidePlan(data, today, kid.id)[2].gameId !== 'mock') problems.push(`no se vuelve a proponer el simulacro tras ${MOCK_EVERY_DAYS} dias`);

    // 6. Con todo listo, la parte propuesta sigue siendo del examen y valida
    for (const g of GAMES) data.shields[g.id] = 5;
    const ready = decidePlan(data, today, kid.id);
    if (!GAMES.some((g) => g.id === ready[1].gameId) || PRACTICE.some((g) => g.id === ready[1].gameId)) problems.push('con todo listo, la parte propuesta no es del examen');
    // Cada dia, tableros distintos a lo largo de una semana
    let day = today;
    const boards = new Set();
    for (let i = 0; i < 7; i += 1) { boards.add(decidePlan(state.defaults(), day, kid.id)[2].route); day = dayBefore(day); }
    if (boards.size < 3) problems.push(`en una semana el plan solo propone ${boards.size} actividades distintas de tablero`);

    // 6b. Quien confunde letras o numeros al oirlos tiene el dictado algunos
    // dias (no todos: los tableros siguen saliendo), con lo que confunde en el
    // motivo; quien no confunde nada, nunca. Y se tacha desde cualquier pagina.
    const mixed = structuredClone(state.defaults());
    mixed.letters = { J: { r: 1, w: 4 }, G: { r: 0, w: 3 }, 14: { r: 1, w: 3 } };
    const extras = [];
    let when = today;
    for (let i = 0; i < 9; i += 1) {
      extras.push(decidePlan(mixed, when, kid.id)[2]);
      if (decidePlan(state.defaults(), when, kid.id)[2].gameId === 'letters') problems.push('se propone el dictado de letras a quien no confunde nada');
      when = dayBefore(when);
    }
    const letterDays = extras.filter((s) => s.gameId === 'letters');
    if (!letterDays.length) problems.push('a quien confunde letras y numeros al oirlos nunca se le propone el dictado');
    if (letterDays.length === extras.length) problems.push('el dictado de letras ocupa todos los dias y ya no salen los tableros');
    for (const s of letterDays) {
      if (!routeOk(s.route)) problems.push(`el dictado del plan lleva a una ruta que no existe: ${s.route}`);
      if (!/J/.test(s.reason) || !/14/.test(s.reason)) problems.push(`el motivo del dictado no dice lo que confunde: ${s.reason}`);
    }
    if (letterDays[0]) {
      const kept = structuredClone(state.get().plan);
      const steps = [...todaysPlan().map(({ done, ...step }) => step).slice(0, 2), letterDays[0]];
      state.update((s) => { s.plan = { date: today, steps, done: [] }; });
      const elsewhere = TOPICS.find((t) => `/play/letters/${t.id}` !== letterDays[0].route);
      if (elsewhere && !markDone('letters', `/play/letters/${elsewhere.id}`)) problems.push('el dictado de letras jugado desde otra pagina no se tacha del plan');
      state.update((s) => { s.plan = kept; });
    }

    // 6c. Con errores de otros dias esperando, el plan propone arreglarlos (y
    // se tacha desde cualquier pagina); con pocos, no.
    const yesterday = dayBefore(today);
    const withMistakes = (/** @type {number} */ n) => {
      const d = structuredClone(state.defaults());
      /** @type {any} */ (d).mistakes = Array.from({ length: n }, (unused, i) => ({
        key: `k${i}`, game: 'spellit', kind: 'write', prompt: `Clue ${i}.`, answer: 'a cat', first: yesterday, last: yesterday, misses: 1, wins: [],
      }));
      return d;
    };
    const fixDay = decidePlan(withMistakes(FIX_AFTER), today, kid.id)[2];
    if (fixDay.gameId !== 'fixit' || !routeOk(fixDay.route) || !/3 mistakes/.test(fixDay.reason)) problems.push(`con ${FIX_AFTER} errores esperando, el plan no propone arreglarlos (${fixDay.gameId}: ${fixDay.reason})`);
    if (decidePlan(withMistakes(FIX_AFTER - 1), today, kid.id)[2].gameId === 'fixit') problems.push('con muy pocos errores esperando, el plan ya no deja sitio a lo demas');
    {
      const kept = structuredClone(state.get().plan);
      const steps = [...todaysPlan().map(({ done, ...step }) => step).slice(0, 2), fixDay];
      state.update((s) => { s.plan = { date: today, steps, done: [] }; });
      if (!markDone('fixit', `/play/fixit/${TOPICS[4].id}`)) problems.push('"Fix my mistakes" jugado desde otra pagina no se tacha del plan');
      state.update((s) => { s.plan = kept; });
    }

    // 7. La tarjeta del album: tres botones que llevan a su sitio
    // El navegador de prueba tiene su propio reloj: tiene que ser el mismo dia
    // que el del plan (si no, la tarjeta pinta el plan de otro dia).
    const browser = createBrowser({ seed: 9, start: Date.now() });
    browser.install();
    try {
      const { planCard } = await import('../src/ui/components/planCard.js');
      const card = planCard();
      browser.document.body.append(card);
      const buttons = card.querySelectorAll('button');
      if (buttons.length !== 3) problems.push(`la tarjeta del plan tiene ${buttons.length} botones`);
      if (!/All done!/.test(card.textContent)) problems.push('la tarjeta no dice que el plan esta hecho');
      buttons[0]?.click();
      if (browser.window.location.hash !== `#${todaysPlan()[0].route}`) problems.push('el primer paso del plan no lleva a su juego');
      for (const e of browser.errors()) problems.push(`error en ${e.where}: ${e.error instanceof Error ? e.error.message : String(e.error)}`);
    } finally {
      browser.uninstall();
    }
  } catch (error) {
    problems.push(`la comprobacion se rompio: ${error instanceof Error ? error.stack : String(error)}`);
  } finally {
    profiles.remove(kid.id);
    if (before) state.useProfile(before); else state.useProfile('');
  }

  return {
    ok: problems.length === 0,
    detail: 'palabras falladas, parte mas floja, simulacro y tableros; tachar y renovar',
    problems: [...new Set(problems)],
  };
}
