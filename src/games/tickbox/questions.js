import { TICKBOX } from '../../data/tickbox.js';
import { WORDS } from '../../data/wordlist.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const ICONS = new Map();
for (const items of Object.values(WORDS)) for (const [word, icon] of items) if (icon) ICONS.set(word, icon);

export const iconFor = (word) => ICONS.get(word) ?? '';

// Cinco dialogos distintos por ronda; las tres opciones se barajan para que
// la respuesta no este siempre en el mismo sitio.
export function buildRound({ size = 5 } = {}) {
  return shuffle(TICKBOX).slice(0, size).map((item) => ({
    id: item.id,
    question: item.question,
    answer: item.answer,
    lines: item.lines,
    options: shuffle(item.options).map((word, i) => ({ letter: 'ABC'[i], word, icon: iconFor(word) })),
  }));
}

export const isCorrect = (question, word) => word === question.answer;
