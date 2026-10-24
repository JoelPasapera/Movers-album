import { LY_PAIRS, ING_VERBS, wrongForms } from '../../engine/wordforms.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Frases que funcionan con cualquier adjetivo de la lista.
const LY_FRAMES = [
  (a) => [`My brother is very ${a}. He does his homework `, '.'],
  (a) => [`She is a ${a} girl. She writes `, '.'],
  (a) => [`They are ${a}. They walk `, ' to school.'],
];

const ING_FRAMES = [
  (v) => ['Look! The children are ', ' in the garden.'],
  (v) => ['My brother likes ', ' at the weekend.'],
  (v) => ['She is ', ' with her friends now.'],
];

// Los dos tipos de formacion de palabras del libro de aula: -ly e -ing.
export function buildRound({ size = 8 } = {}) {
  const ly = shuffle(LY_PAIRS).slice(0, Math.min(3, LY_PAIRS.length)).map((pair, i) => {
    const [before, after] = LY_FRAMES[i % LY_FRAMES.length](pair.base);
    return {
      kind: 'ly', pair, before, after,
      options: shuffle([pair.formed, ...wrongForms(pair, 'ly')]).slice(0, 4),
      rule: 'Most adverbs are the adjective plus -ly.',
    };
  });
  const ing = shuffle(ING_VERBS).slice(0, size - ly.length).map((pair, i) => {
    const [before, after] = ING_FRAMES[i % ING_FRAMES.length](pair.base);
    return {
      kind: 'ing', pair, before, after,
      options: shuffle([pair.formed, ...wrongForms(pair, 'ing')]).slice(0, 4),
      rule: pair.base.endsWith('e')
        ? 'When the verb ends in e, take the e away and add -ing.'
        : pair.formed.length === pair.base.length + 4
          ? 'Short verbs double the last letter before -ing.'
          : 'Most verbs just add -ing.',
    };
  });
  return shuffle([...ly, ...ing]);
}

export const isCorrect = (question, value) =>
  String(value).toLowerCase().trim() === question.pair.formed;
