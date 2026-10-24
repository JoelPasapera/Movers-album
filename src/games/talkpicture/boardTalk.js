// @ts-check
// "Let's talk!" sobre un tablero tematico. La lamina es la cuadricula de
// palabras del tablero (con el dibujo del album) y las cuatro preguntas son
// las del tablero. Aqui solo se preparan las preguntas y se juzga si una
// respuesta tiene que ver con la pregunta; la pantalla la pinta index.js.

import { EXPECT } from '../../data/personal-questions.js';
import { wordById } from '../../engine/vocabulary.js';

/** @typedef {import('../../data/boards.js').Board} Board */
/** @typedef {import('../../data/boards.js').TalkQuestion} TalkQuestion */

/**
 * @typedef {Object} BoardQuestion
 * @property {string} say
 * @property {string[] | null} expect  null admite cualquier respuesta
 * @property {string} model
 * @property {string} hint
 */

/**
 * @typedef {Object} Tile
 * @property {string} word
 * @property {string} icon  vacio si la palabra no tiene dibujo
 */

/** @param {string} text */
export const words = (text) => String(text)
  .toLowerCase()
  .replace(/’/g, "'")
  .match(/[a-z']+/g) ?? [];

/** @param {string} w */
const stem = (w) => w.replace(/(ing|ed|s)$/, '');

/**
 * Resuelve `expect`: un nombre de grupo se busca en EXPECT, una lista se usa
 * tal cual y una lista vacia (o el grupo "anything") admite todo. Las palabras
 * del tablero siempre cuentan: hablar de la lamina es contestar.
 * @param {TalkQuestion} q
 * @param {Board} board
 * @returns {string[] | null}
 */
export function expectedWords(q, board) {
  const base = typeof q.expect === 'string' ? EXPECT[q.expect] : q.expect;
  if (!base || !base.length) return null;
  return [...new Set([...base, ...board.words].map((w) => w.toLowerCase()))];
}

/**
 * @param {Board} board
 * @returns {BoardQuestion[]}
 */
export function boardQuestions(board) {
  return board.talk.map((q) => ({
    say: q.say, expect: expectedWords(q, board), model: q.model, hint: q.hint,
  }));
}

/**
 * Cuadricula de la lamina: cada palabra del tablero con su dibujo del album.
 * @param {Board} board
 * @returns {Tile[]}
 */
export function boardTiles(board) {
  return board.words.map((id) => {
    const entry = wordById(id);
    return { word: entry?.word ?? id, icon: entry?.icon ?? '' };
  });
}

/**
 * ¿La respuesta tiene que ver con la pregunta? Se acepta la palabra tal cual,
 * su raiz (play/playing/played) o una expresion de dos palabras dentro del
 * texto (bus stop). Con `expect` nulo basta con haber dicho algo.
 * @param {string[] | null} expect
 * @param {string} answer
 */
export function isRelevant(expect, answer) {
  const said = words(answer);
  if (!said.length) return false;
  if (!expect) return true;
  const text = ` ${said.join(' ')} `;
  const stems = new Set(said.map(stem));
  return expect.some((w) => (w.includes(' ')
    ? text.includes(` ${w} `)
    : said.includes(w) || stems.has(stem(w))));
}
