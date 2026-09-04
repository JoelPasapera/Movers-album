import { SENTENCE_WORDS } from '../../data/sentence-words.js';
import { inSyllabus } from '../../data/syllabus.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const words = (text) => String(text)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .match(/[a-z][a-z'-]*/g) ?? [];

export const buildRound = ({ size = 6 } = {}) => shuffle(SENTENCE_WORDS).slice(0, size);

// Dos puntos: uno por usar la palabra en una frase de verdad, otro por que
// toda la frase sea vocabulario de Movers. Igual que en la Parte 6, la
// gramatica no resta: el handbook lo dice.
export function check(item, text) {
  const ws = words(text);
  if (!ws.length) return { marks: 0, kind: 'empty', note: 'Write a sentence.' };
  if (!ws.includes(item.word.toLowerCase())) {
    return { marks: 0, kind: 'missing', note: `Your sentence needs the word "${item.word}".` };
  }
  if (ws.length < 3) return { marks: 0, kind: 'short', note: 'That is not a sentence yet. Say who and what.' };
  if (ws.length < 4) return { marks: 1, kind: 'short', note: 'Good, but make it a longer sentence.' };
  // "I am happy because" no esta terminada: la palabra pide algo detras.
  const NEEDS_MORE = new Set(['because', 'than', 'before', 'after', 'when', 'who', 'which',
    'where', 'by', 'at', 'any', 'more', 'another', 'every', 'both']);
  if (NEEDS_MORE.has(item.word) && ws[ws.length - 1] === item.word) {
    return { marks: 1, kind: 'unfinished', note: `Finish the sentence. What comes after "${item.word}"?` };
  }
  if (words(item.model).join(' ') === ws.join(' ')) {
    return { marks: 1, kind: 'copied', note: 'That is the example. Write your own.' };
  }
  const outside = ws.filter((w) => !inSyllabus(w));
  if (outside.length) {
    return { marks: 1, kind: 'outside', note: `"${outside[0]}" is not a Movers word. One mark.` };
  }
  return { marks: 2, kind: 'good', note: 'Two marks. That is a real sentence with the word.' };
}
