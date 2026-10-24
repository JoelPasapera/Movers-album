import { WHERE_ARE_THEY, whereSentence } from '../../data/where-are-they.js';
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

export const PLACES = WHERE_ARE_THEY;

// Seis pistas, banco de ocho lugares (dos sobran), como en las hojas de
// Cambridge. El pronombre se alterna para que "He" y "She" salgan los dos.
export function buildRound({ size = 6, bankSize = 8 } = {}) {
  const chosen = shuffle(PLACES).slice(0, bankSize);
  const questions = chosen.slice(0, size).map((entry, i) => {
    const pronoun = i % 2 ? 'She' : 'He';
    return {
      place: entry.place,
      clue: entry.clue,
      pronoun,
      icon: ICONS.get(entry.place) ?? '',
      answer: entry.place,
      say: whereSentence(pronoun, entry.place),
    };
  });
  const bank = shuffle(chosen).map((entry) => ({ answer: entry.place, icon: ICONS.get(entry.place) ?? '' }));
  return { questions, bank };
}
