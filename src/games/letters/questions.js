// @ts-check
// Dictado de letras y numeros: que se dicta, como se corrige y que se le dice
// al nino. La pantalla esta en index.js; lo que se guarda de cada nino, en
// engine/letters.js; las frases y lo que se deletrea, en data/letters.js.
//
// La correccion compara letra a letra (como una distancia de edicion) para
// decir QUE letra se confundio: "It is J, not G." Eso es lo que entrena el
// oido; un "mal" a secas no.

import { toWords } from '../../engine/numbers.js';
import { twinOf, missRate, NUMBER_KEYS } from '../../engine/letters.js';
import { TRAP_LETTERS, NUMBER_LINES } from '../../data/letters.js';

/** El orden de una partida: seis deletreos y cuatro numeros, mezclados. */
export const ROUND = /** @type {const} */ ([
  'spell', 'number', 'spell', 'spell', 'number', 'spell', 'number', 'spell', 'spell', 'number',
]);

/**
 * @typedef {{ kind: 'spell', answer: string, say: string, letters: string[], name: boolean }} SpellItem
 * @typedef {{ kind: 'number', answer: string, n: number, say: string, twin: number | null }} NumberItem
 * @typedef {SpellItem | NumberItem} Item
 * @typedef {{ op: 'same' | 'swap' | 'missing' | 'extra', want?: string, got?: string, at: number }} LetterOp
 * @typedef {{
 *   kind: 'empty' | 'correct' | 'letter' | 'missing' | 'extra' | 'wrong' | 'twin' | 'writtenNumber',
 *   want?: string | number, got?: string | number | null, at?: number, double?: boolean,
 *   heard?: boolean[],
 * }} Result
 * @typedef {{ history: Record<string, { r: number, w: number }>, focus: Set<string>, used: Set<string>, rng: () => number }} Picker
 */

/** J-I-L-L: como se deletrea en la grabacion. @param {string} word */
export const spelled = (word) => word.toUpperCase().split('').join('-');

/** @param {string} word @param {boolean} name @returns {SpellItem} */
export function spellItem(word, name) {
  return { kind: 'spell', answer: word, say: `${spelled(word)}.`, letters: word.toUpperCase().split(''), name };
}

/**
 * @param {number} n @param {{ text: string }} line
 * @returns {NumberItem}
 */
export function numberItem(n, line) {
  return { kind: 'number', answer: String(n), n, say: line.text.replace('{n}', toWords(n)), twin: twinOf(n) };
}

// ------------------------------------------------------------------ elegir

/**
 * Uno de la lista, con mas probabilidad cuanto mas pesa.
 * @template T @param {T[]} list @param {(x: T) => number} weight @param {() => number} rng
 * @returns {T}
 */
function pickWeighted(list, weight, rng) {
  const weights = list.map(weight);
  const total = weights.reduce((a, b) => a + b, 0);
  let at = rng() * total;
  for (let i = 0; i < list.length; i += 1) {
    at -= weights[i];
    if (at < 0) return list[i];
  }
  return list[list.length - 1];
}

/**
 * Lo que pesa una palabra al elegir el siguiente deletreo: mas cuanto mas
 * letras traicioneras tiene, cuanto mas falla el nino esas letras y si acaba
 * de confundir alguna en esta partida.
 * @param {string} word @param {Picker['history']} history @param {Set<string>} focus
 */
export function spellWeight(word, history, focus) {
  let weight = 1;
  for (const letter of new Set(word.toUpperCase())) {
    if (TRAP_LETTERS.has(letter)) weight += 0.6;
    weight += 6 * missRate(letter, history);
    if (focus.has(letter)) weight += 4;
  }
  return weight;
}

/**
 * El siguiente deletreo: la mitad de las veces un nombre (como en el examen) y
 * la otra mitad una palabra de la pagina. Nunca repite en la misma partida.
 * @param {{ names: string[], words: string[] }} pool @param {Picker} picker
 * @returns {SpellItem}
 */
export function nextSpelling(pool, { history, focus, used, rng }) {
  const fresh = (/** @type {string[]} */ list) => list.filter((w) => !used.has(w));
  const names = fresh(pool.names);
  const words = fresh(pool.words);
  const useName = !words.length || (names.length > 0 && rng() < 0.5);
  const from = useName ? names : words;
  const list = from.length ? from : [...pool.names, ...pool.words];
  const word = pickWeighted(list, (w) => spellWeight(w, history, focus), rng);
  used.add(word);
  return spellItem(word, pool.names.includes(word));
}

/** Los numeros de pareja (13-19 y 30-90), como numeros. */
const PAIRED = NUMBER_KEYS.map(Number);
/** Los demas, del 21 al 100 sin las decenas (esas ya estan en las parejas). */
const OTHERS = Array.from({ length: 80 }, (unused, i) => i + 21).filter((n) => n % 10 !== 0 || n === 100);

/**
 * El siguiente numero. Los de pareja (fourteen o forty) salen en la primera y
 * la tercera pregunta de numeros, y en todas si el nino acaba de confundir uno;
 * los demas, del 21 al 100.
 * @param {number} order cuantos numeros van ya en esta partida
 * @param {Picker} picker
 * @returns {NumberItem}
 */
export function nextNumber(order, { history, focus, used, rng }) {
  const confused = PAIRED.some((n) => focus.has(String(n)));
  const paired = order % 2 === 0 || confused;
  const pool = (paired ? PAIRED : OTHERS).filter((n) => !used.has(String(n)));
  const list = pool.length ? pool : (paired ? PAIRED : OTHERS);
  const n = paired
    ? pickWeighted(list, (x) => 1 + 6 * missRate(String(x), history) + (focus.has(String(x)) ? 4 : 0), rng)
    : list[Math.floor(rng() * list.length)];
  used.add(String(n));
  const lines = NUMBER_LINES.filter((l) => n >= l.min && n <= l.max);
  return numberItem(n, lines[Math.floor(rng() * lines.length)]);
}

// ------------------------------------------------------------------ corregir

/** Solo las letras, en mayuscula: "j-i-l-l", "Jill " y "J I L L" son lo mismo. @param {unknown} v */
const lettersOnly = (v) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '')
  .toUpperCase().replace(/[^A-Z]/g, '');

/**
 * Lo dictado contra lo escrito, letra a letra: que letra se cambio por otra,
 * cual falta y cual sobra (distancia de edicion con su camino).
 * @param {string} want @param {string} got (los dos en mayusculas)
 * @returns {{ distance: number, ops: LetterOp[] }}
 */
export function compareLetters(want, got) {
  const a = want.split('');
  const b = got.split('');
  /** @type {number[][]} */
  const d = Array.from({ length: a.length + 1 }, (unused, i) => Array.from({ length: b.length + 1 }, (u, j) => (i === 0 ? j : j === 0 ? i : 0)));
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
  }
  /** @type {LetterOp[]} */
  const ops = [];
  let i = a.length;
  let j = b.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && d[i][j] === d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)) {
      ops.push({ op: a[i - 1] === b[j - 1] ? 'same' : 'swap', want: a[i - 1], got: b[j - 1], at: i - 1 });
      i -= 1; j -= 1;
    } else if (i > 0 && d[i][j] === d[i - 1][j] + 1) {
      ops.push({ op: 'missing', want: a[i - 1], at: i - 1 });
      i -= 1;
    } else {
      ops.push({ op: 'extra', got: b[j - 1], at: i });
      j -= 1;
    }
  }
  return { distance: d[a.length][b.length], ops: ops.reverse() };
}

/** Los numeros en letra, para quien escribe "fourteen" en vez de 14. */
const WORD_NUMBERS = new Map(Array.from({ length: 100 }, (unused, i) => [toWords(i + 1).replace(/[\s-]+/g, ' '), i + 1]));

/** @param {string} raw @returns {number | null} */
function fromWords(raw) {
  const said = raw.replace(/[\s-]+/g, ' ').replace(/^a hundred$/, 'one hundred').trim();
  return WORD_NUMBERS.get(said) ?? null;
}

/** @param {NumberItem} item @param {unknown} value @returns {Result} */
function checkNumber(item, value) {
  const raw = String(value ?? '').trim().toLowerCase();
  if (!raw) return { kind: 'empty' };
  const digits = raw.replace(/[^0-9]/g, '');
  const got = digits ? Number(digits) : fromWords(raw);
  if (got === item.n) return { kind: digits ? 'correct' : 'writtenNumber' };
  if (got !== null && got === item.twin) return { kind: 'twin', want: item.n, got };
  return { kind: 'wrong', want: item.n, got };
}

/**
 * Corrige una respuesta.
 *   - correct / writtenNumber (el numero en letra: vale, pero mejor en cifras)
 *   - letter: una letra por otra (want, got); missing: falta una (double si es
 *     una de dos iguales seguidas); extra: sobra una
 *   - twin: fourteen por forty (o al reves)
 *   - wrong: no se parece a lo dictado
 * `heard` dice, letra a letra de lo dictado, si se oyo bien (solo cuando lo
 * escrito se parece a lo dictado: si no, no dice nada del oido).
 * @param {Item} item @param {unknown} value
 * @returns {Result}
 */
export function checkAnswer(item, value) {
  if (item.kind === 'number') return checkNumber(item, value);
  const typed = lettersOnly(value);
  if (!typed) return { kind: 'empty' };
  const want = item.answer.toUpperCase();
  if (typed === want) return { kind: 'correct', heard: item.letters.map(() => true) };
  const { distance, ops } = compareLetters(want, typed);
  if (distance > Math.max(1, Math.floor(want.length / 2))) return { kind: 'wrong' };
  const heard = item.letters.map(() => false);
  for (const o of ops) if (o.op === 'same') heard[o.at] = true;
  const first = /** @type {LetterOp} */ (ops.find((o) => o.op !== 'same'));
  if (first.op === 'swap') return { kind: 'letter', want: first.want, got: first.got, at: first.at, heard };
  if (first.op === 'missing') {
    const double = want[first.at - 1] === first.want || want[first.at + 1] === first.want;
    return { kind: 'missing', want: first.want, at: first.at, double, heard };
  }
  return { kind: 'extra', got: first.got, at: first.at, heard };
}

/** @param {Result} result */
export const isRight = (result) => result.kind === 'correct' || result.kind === 'writtenNumber';

/**
 * Lo que hay que apuntar en el cuaderno del oido (engine/letters.js): cada
 * letra dictada, bien o mal; de los numeros, solo los de pareja.
 * @param {Item} item @param {Result} result
 * @returns {{ keys: string[], oks: boolean[] }}
 */
export function heardKeys(item, result) {
  if (result.kind === 'empty') return { keys: [], oks: [] };
  if (item.kind === 'number') {
    return item.twin === null ? { keys: [], oks: [] } : { keys: [item.answer], oks: [isRight(result)] };
  }
  if (!result.heard) return { keys: [], oks: [] };
  return { keys: item.letters, oks: result.heard };
}

/**
 * Lo que se dice al nino. Solo palabras de Starters y Movers.
 * @param {Result} result @param {Item} item
 */
export function feedbackFor(result, item) {
  const n = item.kind === 'number' ? item.n : 0;
  switch (result.kind) {
    case 'correct':
      return item.kind === 'number' ? `Yes! ${n}, ${toWords(n)}.` : `Yes! ${item.answer}.`;
    case 'writtenNumber':
      return `Yes! But write the number like this: ${n}.`;
    case 'letter':
      return `It is ${result.want}, not ${result.got}.`;
    case 'missing':
      return result.double ? `There is a double ${result.want}.` : `A letter is missing: ${result.want}.`;
    case 'extra':
      return `One letter too many: ${result.got}.`;
    case 'twin':
      return `It is ${result.want}, ${toWords(Number(result.want))}. Not ${result.got}, ${toWords(Number(result.got))}.`;
    default:
      return item.kind === 'number' ? `It is ${n}, ${toWords(n)}.` : `Listen again: ${spelled(item.answer)}.`;
  }
}

/** La instruccion de cada pregunta. @param {Item} item */
export const promptFor = (item) => (item.kind === 'number'
  ? 'Listen and write the number.'
  : `Listen to the letters and write the ${item.name ? 'name' : 'word'}.`);

/** Lo que se dice si se pulsa Check sin escribir nada. @param {Item} item */
export const emptyHint = (item) => (item.kind === 'number' ? 'Write the number.' : 'Write the letters.');

/** Lo que se dice al acertar: la palabra entera, o el numero. @param {Item} item */
export const sayAfter = (item) => (item.kind === 'number' ? `${toWords(item.n)}.` : `${item.answer}.`);

/**
 * Las dos cosas que se confundieron, para oirlas una detras de otra (J y G,
 * fourteen y forty). Vacio si el fallo no es de confundir una con otra.
 * @param {Result} result @param {Item} item
 * @returns {{ show: string[], say: string[] }}
 */
export function contrastFor(result, item) {
  if (result.kind === 'letter') return { show: [String(result.want), String(result.got)], say: [`${result.want}.`, `${result.got}.`] };
  if (result.kind === 'twin' && item.kind === 'number') {
    const pair = [Number(result.want), Number(result.got)];
    return { show: pair.map(String), say: pair.map((x) => `${toWords(x)}.`) };
  }
  return { show: [], say: [] };
}
