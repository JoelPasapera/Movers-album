import { PICTURE_GAPS } from '../../data/picture-gaps.js';
import { WORDS } from '../../data/wordlist.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const ICON = new Map(Object.values(WORDS).flat().map(([w, icon]) => [w.toLowerCase(), icon]));

const card = (target) => ({ id: target, word: target, icon: ICON.get(target.toLowerCase()) ?? '' });

// Como en el libro: unas frases y un banco de dibujos para todas ellas.
// `source` son las frases de un tablero; las de relleno salen del banco
// general. Dos tarjetas nunca comparten dibujo: el nino las distingue por el.
export function buildRound({ size = 6, bank = 8, source = null } = {}) {
  const pool = source ?? PICTURE_GAPS;
  const chosen = shuffle(pool).slice(0, size);
  const icons = new Set(chosen.map((g) => ICON.get(g.target.toLowerCase())));
  const extras = [];
  for (const g of shuffle([...PICTURE_GAPS, ...pool].filter((x) => !chosen.includes(x)))) {
    if (extras.length >= bank - size) break;
    const icon = ICON.get(g.target.toLowerCase());
    if (!icon || icons.has(icon) || extras.some((e) => e.target === g.target) || chosen.some((c) => c.target === g.target)) continue;
    icons.add(icon);
    extras.push(g);
  }
  const cards = shuffle([...chosen, ...extras].map((g) => card(g.target)));
  return {
    cards,
    questions: chosen.map((g) => ({ ...g, answer: g.target })),
  };
}

export const isCorrect = (question, id) => question.target === id;
