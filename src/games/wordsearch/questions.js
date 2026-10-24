import { TOPICS } from '../../data/topics.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const LETTERS = 'ABCDEFGHIJKLMNOPRSTUVWY';
const DIRS = [[0, 1], [1, 0], [1, 1]];

// "Can you find the words?" del picture book. Se genera una cuadricula por
// pagina del album con palabras de esa pagina.
export function buildGrid(topicId, { size = 10, count = 6 } = {}) {
  const topic = TOPICS.find((t) => t.id === topicId) ?? TOPICS[0];
  const usable = (list) => list.map((w) => w.word.toUpperCase()).filter((w) => /^[A-Z]{3,9}$/.test(w));
  let pool = shuffle(usable(topic.words));
  // Una pagina con pocas palabras cortas se completa con el resto del album.
  if (pool.length < count) {
    pool = [...pool, ...shuffle(usable(TOPICS.flatMap((t) => t.words))).filter((w) => !pool.includes(w))];
  }
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const placed = [];

  for (const word of pool) {
    if (placed.length >= count) break;
    let done = false;
    for (let attempt = 0; attempt < 60 && !done; attempt += 1) {
      const [dr, dc] = DIRS[Math.floor(Math.random() * DIRS.length)];
      const r0 = Math.floor(Math.random() * (size - dr * (word.length - 1)));
      const c0 = Math.floor(Math.random() * (size - dc * (word.length - 1)));
      let ok = true;
      for (let i = 0; i < word.length && ok; i += 1) {
        const cell = grid[r0 + dr * i][c0 + dc * i];
        if (cell && cell !== word[i]) ok = false;
      }
      if (!ok) continue;
      for (let i = 0; i < word.length; i += 1) grid[r0 + dr * i][c0 + dc * i] = word[i];
      placed.push({ word, r0, c0, dr, dc, r1: r0 + dr * (word.length - 1), c1: c0 + dc * (word.length - 1) });
      done = true;
    }
  }
  for (const row of grid) {
    for (let c = 0; c < size; c += 1) {
      if (!row[c]) row[c] = LETTERS[Math.floor(Math.random() * LETTERS.length)];
    }
  }
  return { topic, grid, words: placed };
}

// El nino toca la primera letra y la ultima. Vale en los dos sentidos.
export function matchSelection(round, a, b) {
  return round.words.find((w) => (
    (w.r0 === a.r && w.c0 === a.c && w.r1 === b.r && w.c1 === b.c)
    || (w.r0 === b.r && w.c0 === b.c && w.r1 === a.r && w.c1 === a.c)
  )) ?? null;
}

export function cellsOf(word) {
  const out = [];
  for (let i = 0; i < word.word.length; i += 1) {
    out.push({ r: word.r0 + word.dr * i, c: word.c0 + word.dc * i });
  }
  return out;
}
