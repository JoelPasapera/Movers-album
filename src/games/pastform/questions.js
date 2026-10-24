import { PAST_VERBS, wrongPast, isIrregular } from '../../engine/wordforms.js';
import { PAST_SENTENCES, PAST_SUBJECTS, PAST_TIMES } from '../../data/past-forms.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Solo los verbos que tienen frase: sin complemento la frase no tiene sentido.
export const PAST_PAIRS = PAST_VERBS.filter((p) => PAST_SENTENCES[p.base]);

const ruleFor = (pair) => {
  if (isIrregular(pair.base)) return `Irregular: ${pair.base}, ${pair.formed}. You just have to know it.`;
  if (pair.base.endsWith('e')) return 'The verb ends in e, so it only adds -d.';
  if (pair.formed.endsWith('ied')) return 'Change the y to i and add -ed.';
  if (pair.formed.length === pair.base.length + 3) return 'A short verb doubles the last letter before -ed.';
  return 'Most verbs just add -ed.';
};

// La actividad del libro de aula: una frase en pasado y tres formas del
// verbo (catch, caught, catching). Cuando hay una falta creible (catched,
// stoped, tryed) entra como cuarta opcion.
export function buildRound({ size = 8 } = {}) {
  return shuffle(PAST_PAIRS).slice(0, size).map((pair, i) => {
    const time = PAST_TIMES[i % PAST_TIMES.length];
    const subject = PAST_SUBJECTS[(i * 3 + Math.floor(Math.random() * PAST_SUBJECTS.length)) % PAST_SUBJECTS.length];
    const before = `${time} ${subject} `;
    const after = ` ${PAST_SENTENCES[pair.base]}.`;
    const wrong = wrongPast(pair);
    return {
      pair,
      before,
      after,
      answer: pair.formed,
      options: shuffle([pair.formed, pair.base, pair.ing, ...(wrong ? [wrong] : [])]),
      say: `${before}${pair.formed}${after}`,
      rule: ruleFor(pair),
    };
  });
}

export const isCorrect = (question, value) => String(value).toLowerCase().trim() === question.answer;
