import { OPPOSITES, FRAMES } from '../../data/opposites.js';
import { inSyllabus } from '../../data/syllabus.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const valid = (pair) => pair.every((w) => w.split(' ').every((p) => inSyllabus(p)))
  && FRAMES[pair.join('-')];

export const PAIRS = OPPOSITES.filter(valid);

export function buildRound({ size = 6 } = {}) {
  const chosen = shuffle(PAIRS).slice(0, size);
  return chosen.map((pair) => {
    const frame = FRAMES[pair.join('-')];
    const others = shuffle(PAIRS.filter((p) => p !== pair)).slice(0, 3);
    return {
      pair,
      frame,
      say: `${frame[0]}${pair[0]}${frame[1]}${pair[1]}${frame[2]}`,
      options: shuffle([pair, ...others]).map((p) => p.join(' / ')),
      answer: pair.join(' / '),
    };
  });
}

export const isCorrect = (question, value) => value === question.answer;
