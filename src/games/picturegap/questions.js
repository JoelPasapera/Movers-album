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

const card = (target) => ({ id: target, word: target, icon: ICON.get(target) ?? '' });

// Como en el libro: unas frases y un banco de dibujos para todas ellas.
export function buildRound({ size = 6, bank = 8 } = {}) {
  const chosen = shuffle(PICTURE_GAPS).slice(0, size);
  const extras = shuffle(PICTURE_GAPS.filter((g) => !chosen.includes(g))).slice(0, bank - size);
  const cards = shuffle([...chosen, ...extras].map((g) => card(g.target)));
  return {
    cards,
    questions: chosen.map((g) => ({ ...g, answer: g.target })),
  };
}

export const isCorrect = (question, id) => question.target === id;
