// @ts-check
// Un nino de mentira que juega. No sabe ingles: toca botones, rellena huecos
// y pulsa Enter, al azar pero con semilla (el mismo fallo sale siempre igual).
// Sirve para lo que no ve ninguna otra comprobacion: que cada pantalla se
// pueda jugar de principio a fin sin romperse, en cualquier orden de toques.
//
// Algunos juegos no se terminan tocando al azar (en la sopa de letras hay que
// encontrar las palabras); para esos hay una estrategia propia.

import { FakeElement, FakeEvent } from './dom.js';
import { settle } from './browser.js';

/** @typedef {{ kind: 'click', el: FakeElement } | { kind: 'type', el: FakeElement, text: string }} Action */

// Botones que no hacen avanzar el juego: repetir audio, mostrar texto, el
// microfono, las frases de socorro. Se dejan para no perder pasos.
const IDLE = /^(←|say it again|show the words|hide the words|hear it|ask me again|read it to me|listen again|play it again|tap to talk|tap when you finish|no microphone|listening: (on|off)|sorry\?|can you say that again|i don.t understand|undo|no more plays|\u{1F50A})/iu;
const LEAVE = /back to|album|\bboard\b|delete|print|quit|stop the test/i;

const GUESSES = ['cat', 'red', 'dog', 'the park', 'Saturday', 'five', 'yes', 'a ball', 'blue',
  'She is happy', 'He is reading a book', 'The dog is under the tree', 'library', 'happily'];

/** @param {FakeElement} el */
export function isVisible(el) {
  /** @type {any} */
  let n = el;
  while (n instanceof FakeElement) {
    if (n.classList.contains('hidden') || n.hasAttribute('hidden')) return false;
    if (n.style.display === 'none' || n.style.visibility === 'hidden') return false;
    n = n.parentNode;
  }
  return true;
}

/** @param {FakeElement} el */
const label = (el) => (el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();

/** @param {() => number} rng @param {any[]} list */
export const pick = (rng, list) => list[Math.floor(rng() * list.length)];

/**
 * Lo que un nino podria tocar ahora mismo.
 * @param {FakeElement} root @param {() => number} rng
 * @returns {Action[]}
 */
export function genericActions(root, rng) {
  /** @type {Action[]} */
  const typing = [];
  /** @type {Action[]} */
  const retyping = [];
  const bank = root.querySelectorAll('.tile, .bank-card__word, .gym-card__word, .chat-option')
    .filter(isVisible).map(label).filter((t) => t && t.length < 30);
  for (const el of root.querySelectorAll('input, textarea')) {
    const type = (el.getAttribute('type') ?? 'text').toLowerCase();
    if (!['text', 'search', 'number', 'tel'].includes(type)) continue;
    if (el.disabled || el.hasAttribute('readonly') || !isVisible(el)) continue;
    const text = bank.length && rng() < 0.6 ? pick(rng, bank).replace(/^[A-D](?=[A-Za-z])/, '') : pick(rng, GUESSES);
    // Un hueco vacio se rellena primero; uno ya escrito se puede corregir
    // (si la app lo rechazo, un nino borraria y escribiria otra cosa).
    (el.value.trim() ? retyping : typing).push({ kind: 'type', el, text });
  }
  if (typing.length) return [typing[0]];

  /** @type {Action[]} */
  const clicks = [...retyping];
  for (const el of root.querySelectorAll('button, a[href], [role="button"]')) {
    if (el.disabled || !isVisible(el)) continue;
    if (el.closest('.game-head')) continue;
    const text = label(el);
    if (IDLE.test(text) || LEAVE.test(text)) continue;
    clicks.push({ kind: 'click', el });
  }
  // Lo que se toca dentro de los dibujos (objetos para colorear, personas,
  // diferencias): la app escucha en el contenedor y busca con closest().
  for (const el of root.querySelectorAll('.paintable, [data-slot], [data-person]')) {
    if (isVisible(el)) clicks.push({ kind: 'click', el });
  }
  return clicks;
}

/**
 * Hace una accion como la haria un nino: escribir dispara `input` y luego
 * Enter; tocar dispara `click` con burbujeo.
 * @param {Action} action
 */
export function perform(action) {
  if (action.kind === 'type') {
    action.el.focus();
    action.el.value = action.text;
    action.el.dispatchEvent(new FakeEvent('input', { bubbles: true }));
    action.el.dispatchEvent(new FakeEvent('keydown', { bubbles: true, key: 'Enter' }));
    action.el.dispatchEvent(new FakeEvent('keyup', { bubbles: true, key: 'Enter' }));
    return;
  }
  action.el.click();
}

// ------------------------------------------------------------- estrategias

/**
 * Sopa de letras: busca cada palabra de la lista en la cuadricula (en las
 * ocho direcciones) y toca su primera y su ultima letra.
 * @param {FakeElement} root
 * @returns {Action[] | null}
 */
function wordsearch(root) {
  const cells = root.querySelectorAll('.ws-cell');
  if (!cells.length) return null;
  const grid = new Map(cells.map((c) => [`${c.dataset.r},${c.dataset.c}`, c]));
  const letter = (r, c) => (grid.get(`${r},${c}`)?.textContent ?? '').toLowerCase();
  const first = root.querySelector('.ws-cell.is-first');
  const pending = root.querySelectorAll('.ws-word').filter((w) => !w.classList.contains('is-found'));
  if (!pending.length) return null;
  const target = pending[0].textContent.toLowerCase().replace(/[^a-z]/g, '');
  const size = Math.round(Math.sqrt(cells.length));
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      for (const [dr, dc] of [[0, 1], [1, 0], [1, 1], [-1, 1], [0, -1], [-1, 0], [-1, -1], [1, -1]]) {
        let ok = true;
        for (let k = 0; k < target.length && ok; k += 1) ok = letter(r + dr * k, c + dc * k) === target[k];
        if (!ok) continue;
        const start = grid.get(`${r},${c}`);
        const end = grid.get(`${r + dr * (target.length - 1)},${c + dc * (target.length - 1)}`);
        if (!start || !end) continue;
        if (first && first !== start) return [{ kind: 'click', el: first }];
        return [{ kind: 'click', el: first ? end : start }];
      }
    }
  }
  return null;
}

/** @type {Record<string, (root: FakeElement, rng: () => number) => Action[] | null>} */
export const STRATEGIES = { wordsearch };

// ------------------------------------------------------------- partida

export const BROKEN_TEXT = /\[object [A-Za-z]+\]|\bundefined\b|\bNaN\b/;

/**
 * El texto de la pantalla con un espacio entre elementos, como se ve: con
 * textContent, "time." y "undefined" en dos parrafos salen pegados y el
 * "undefined" no se reconoce como palabra.
 * @param {FakeElement} root
 */
export function screenText(root) {
  /** @type {string[]} */
  const parts = [];
  const visit = (/** @type {any} */ node) => {
    for (const child of node.childNodes) {
      if (child instanceof FakeElement) {
        if (child.localName === 'style' || child.localName === 'script') continue;
        parts.push(' ');
        visit(child);
        parts.push(' ');
      } else if (child.nodeType === 3) parts.push(child.data);
    }
  };
  visit(root);
  return parts.join('').replace(/\s+/g, ' ').trim();
}

/**
 * Juega hasta que `done()` diga que se acabo.
 * @param {FakeElement} root
 * @param {{
 *   clock: import('./browser.js').FakeClock, rng: () => number, done: () => boolean,
 *   strategy?: (root: FakeElement, rng: () => number) => Action[] | null,
 *   maxSteps?: number, stepMs?: number, watch?: () => void,
 * }} options
 *   watch: se llama justo despues de cada toque (antes de que pase el tiempo) y
 *   otra vez despues, para mirar la pantalla en los dos momentos
 * @returns {Promise<{ ok: boolean, steps: number, reason?: string, broken?: string }>}
 */
export async function playToEnd(root, {
  clock, rng, done, strategy, maxSteps = 900, stepMs = 2000, watch,
}) {
  let steps = 0;
  /** @type {string | undefined} */
  let broken;
  let idle = 0;
  while (!done()) {
    if (steps >= maxSteps) return { ok: false, steps, reason: `no se termina en ${maxSteps} toques`, broken };
    steps += 1;
    const own = strategy?.(root, rng);
    const actions = own ?? genericActions(root, rng);
    if (actions.length) {
      perform(pick(rng, actions));
      watch?.();
      idle = 0;
    } else {
      idle += 1;
      if (idle > 60) return { ok: false, steps, reason: 'se queda sin nada que tocar', broken };
    }
    clock.advance(stepMs);
    await settle(2);
    watch?.();
    const text = screenText(root);
    const bad = BROKEN_TEXT.exec(text);
    if (bad && !broken) broken = `"${bad[0]}" en pantalla: …${text.slice(Math.max(0, bad.index - 40), bad.index + 40)}…`;
  }
  return { ok: true, steps, broken };
}

/**
 * Botones sin nombre (sin texto, sin aria-label y sin title): un lector de
 * pantalla los lee como "boton" y nada mas.
 * @param {FakeElement} root
 */
export function unnamedButtons(root) {
  return root.querySelectorAll('button').filter((b) => isVisible(b)
    && !label(b) && !b.getAttribute('title'));
}
