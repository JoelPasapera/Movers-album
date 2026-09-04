import { inSyllabus } from '../src/data/syllabus.js';
import { contentStrings, words } from './lib/content.js';

export const name = 'Vocabulario dentro del syllabus';

// Palabras de fuera del ingles que aparecen a proposito (nombres propios de
// personaje ya estan en el wordlist, asi que esta lista deberia quedarse vacia).
const ALLOWED = new Set([]);

export function run() {
  const problems = [];
  const seen = new Set();
  for (const text of contentStrings()) {
    for (const word of words(text)) {
      if (inSyllabus(word) || ALLOWED.has(word) || seen.has(word)) continue;
      seen.add(word);
      problems.push(`"${word}" no esta en Starters ni en Movers  \u2014  aparece en: ${text.slice(0, 60)}`);
    }
  }
  return {
    ok: problems.length === 0,
    detail: `${contentStrings().length} textos revisados`,
    problems,
  };
}
