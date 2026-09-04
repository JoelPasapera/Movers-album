import { toWords, ordinalWord, ordinalDigits } from '../../engine/numbers.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const rand = (lo, hi) => lo + Math.floor(Math.random() * (hi - lo + 1));

// Distractores que se parecen de verdad: mismas decenas o misma unidad.
function nearby(n, lo, hi) {
  const pool = new Set();
  const tens = Math.floor(n / 10) * 10;
  for (const c of [n - 1, n + 1, n - 10, n + 10, tens + (n % 10 + 5) % 10, n + 2, n - 2,
    (n % 10) * 10 + Math.floor(n / 10)]) {
    if (c >= lo && c <= hi && c !== n) pool.add(c);
  }
  while (pool.size < 3) {
    const c = rand(lo, hi);
    if (c !== n) pool.add(c);
  }
  return shuffle([...pool]).slice(0, 3);
}

// "Which number?" del picture book: unir cifra y letra, cardinales y ordinales.
export function buildRound({ size = 8 } = {}) {
  const out = [];
  for (let i = 0; i < size; i += 1) {
    const ordinal = i % 2 === 1;
    const n = ordinal ? rand(1, 20) : rand(21, 100);
    const options = [n, ...nearby(n, ordinal ? 1 : 21, ordinal ? 20 : 100)];
    const show = i % 4 < 2;   // mitad: ves la cifra y eliges la palabra; mitad: al reves
    const asDigits = (x) => (ordinal ? ordinalDigits(x) : String(x));
    const asWords = (x) => (ordinal ? ordinalWord(x) : toWords(x));
    out.push({
      kind: ordinal ? 'ordinal' : 'cardinal',
      n,
      prompt: show ? asDigits(n) : asWords(n),
      say: asWords(n),
      answer: show ? asWords(n) : asDigits(n),
      options: shuffle(options.map((x) => (show ? asWords(x) : asDigits(x)))),
    });
  }
  return out;
}

export const isCorrect = (question, value) => value === question.answer;
