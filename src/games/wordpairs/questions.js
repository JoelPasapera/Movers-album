import { SOURCE_ENTRIES } from '../../data/wordlist-source.js';
import { WORDS } from '../../data/wordlist.js';
import { inSyllabus } from '../../data/syllabus.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Las palabras compuestas salen del wordlist: nombres de dos palabras cuyas
// dos mitades son palabras del syllabus (swimming pool, comic book...).
// Nada escrito a mano: si el wordlist cambia, esto cambia con el.
export const COMPOUNDS = SOURCE_ENTRIES
  .filter(([w, t]) => /\bn\b/.test(t) && w.split(' ').length === 2 && !/^(a|how) /.test(w))
  .map(([w]) => ({ whole: w, first: w.split(' ')[0], second: w.split(' ')[1] }))
  .filter((c) => inSyllabus(c.first) && inSyllabus(c.second));

const ICONS = new Map();
for (const items of Object.values(WORDS)) for (const [word, icon] of items) if (icon) ICONS.set(word, icon);

const makes = (first, second) => COMPOUNDS.some((c) => c.first === first && c.second === second);

// Una pareja cada vez: la primera mitad, y cuatro segundas mitades. Solo una
// forma una palabra del wordlist con esa primera mitad ("ice" no puede tener
// "cream" y "skates" en la misma pregunta).
export function buildRound({ size = 6 } = {}) {
  const chosen = [];
  for (const c of shuffle(COMPOUNDS)) {
    if (chosen.length >= size) break;
    if (chosen.some((x) => x.first === c.first || x.second === c.second)) continue;
    chosen.push(c);
  }
  return chosen.map((c) => {
    const others = shuffle(COMPOUNDS.map((x) => x.second))
      .filter((s, i, arr) => s !== c.second && arr.indexOf(s) === i && !makes(c.first, s))
      .slice(0, 3);
    return {
      compound: c,
      icon: ICONS.get(c.whole) ?? '',
      answer: c.whole,
      options: shuffle([c.second, ...others]),
      say: c.whole,
    };
  });
}

export const isCorrect = (question, value) => value === question.compound.second;
