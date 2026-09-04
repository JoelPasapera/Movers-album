import { LY_PAIRS, ING_VERBS, ingOf, wrongForms } from '../src/engine/wordforms.js';
import { buildRound as forms, isCorrect as formOk } from '../src/games/wordform/questions.js';
import { buildRound as yesno, isCorrect as ynOk } from '../src/games/yesno/questions.js';
import { PART6_SCENES } from '../src/data/scenes/part6.js';
import { CLOZE_TEXTS } from '../src/data/cloze.js';
import { inSyllabus } from '../src/data/syllabus.js';
import { PRACTICE } from '../src/games/registry.js';

export const name = 'Los tipos de actividad del libro de aula';

// Formas que la regla ortografica no acierta sola y hay que vigilar.
const SPELLING = {
  ride: 'riding', run: 'running', swim: 'swimming', hop: 'hopping', skip: 'skipping',
  sit: 'sitting', stop: 'stopping', shop: 'shopping', get: 'getting', put: 'putting',
  hit: 'hitting', drop: 'dropping', write: 'writing', make: 'making', dance: 'dancing',
  be: 'being', see: 'seeing', carry: 'carrying', travel: 'travelling', live: 'living',
};

export function run() {
  const problems = [];

  // 1. Formacion de palabras: -ly e -ing
  for (const [verb, want] of Object.entries(SPELLING)) {
    if (ingOf(verb) !== want) problems.push(`${verb} da "${ingOf(verb)}" y deberia dar "${want}"`);
  }
  if (LY_PAIRS.length < 5) problems.push(`solo hay ${LY_PAIRS.length} pares de -ly en el wordlist`);
  if (ING_VERBS.length < 80) problems.push(`solo hay ${ING_VERBS.length} verbos para -ing`);
  for (const pair of [...LY_PAIRS, ...ING_VERBS]) {
    if (!inSyllabus(pair.base)) problems.push(`"${pair.base}" no esta en el syllabus`);
    if (/['\s]/.test(pair.base)) problems.push(`"${pair.base}" no es un verbo suelto`);
    if (wrongForms(pair, pair.formed.endsWith('ly') ? 'ly' : 'ing').length !== 3) {
      problems.push(`"${pair.base}" no genera 3 distractores`);
    }
  }
  for (let i = 0; i < 300; i += 1) {
    for (const q of forms()) {
      if (q.options.length !== 4) problems.push('una pregunta de -ly/-ing no da 4 opciones');
      if (new Set(q.options).size !== 4) problems.push('-ly/-ing repite una opcion');
      if (!q.options.includes(q.pair.formed)) problems.push('-ly/-ing esconde la respuesta');
      if (!formOk(q, q.pair.formed)) problems.push('el corrector de -ly/-ing falla');
      if (!q.rule) problems.push('una pregunta de -ly/-ing no explica la regla');
    }
  }

  // 2. Yes or no: ninguna frase falsa puede ser cierta en el modelo de la escena
  for (const scene of PART6_SCENES) {
    const shared = new Map();
    for (const e of scene.entities) if (e.place) shared.set(e.place, (shared.get(e.place) ?? 0) + 1);
    for (let i = 0; i < 200; i += 1) {
      const round = yesno(scene);
      if (round.questions.length !== 6) problems.push('Yes or no no da 6 preguntas');
      if (round.examples.length !== 2) problems.push('Yes or no no da 2 ejemplos');
      const yes = round.questions.filter((q) => q.answer).length;
      if (yes === 0 || yes === round.questions.length) problems.push('Yes or no da todas la misma respuesta');
      for (const q of [...round.questions, ...round.examples]) {
        if (!ynOk(q, q.answer)) problems.push('el corrector de Yes or no falla');
        for (const w of q.text.toLowerCase().match(/[a-z']+/g) ?? []) {
          if (!inSyllabus(w)) problems.push(`Yes or no usa "${w}", que no esta en el syllabus`);
        }
        const m = q.text.match(/^The (\w+) is (.+)\.$/);
        if (!m || q.answer) continue;
        const entity = scene.entities.find((e) => e.noun === m[1]);
        if (!entity) continue;
        const reallyTrue = entity.colours.includes(m[2]) || entity.place === m[2]
          || entity.action === m[2] || (shared.get(m[2]) ?? 0) >= 3;
        if (reallyTrue) problems.push(`Yes or no marca como falsa una frase cierta: "${q.text}"`);
      }
    }
  }

  // 3. Why or When sigue en la parte 4
  const questionWords = CLOZE_TEXTS.find((c) => c.id === 'questions');
  if (!questionWords) problems.push('ha desaparecido el texto de Why / When de la parte 4');
  else {
    const used = questionWords.gaps.map((g) => g.options[g.answer]);
    for (const word of ['When', 'Why', 'Where', 'Who', 'How']) {
      if (!used.includes(word)) problems.push(`el texto de palabras interrogativas ya no usa "${word}"`);
    }
  }

  // 4. Los tres entrenamientos siguen de alta
  for (const id of ['vocab', 'yesno', 'wordform']) {
    if (!PRACTICE.some((g) => g.id === id && g.ready)) {
      problems.push(`el entrenamiento "${id}" ya no aparece en el album`);
    }
  }

  return {
    ok: problems.length === 0,
    detail: `${LY_PAIRS.length} pares -ly, ${ING_VERBS.length} verbos -ing, `
      + `${PART6_SCENES.length} escenas de yes/no`,
    problems: [...new Set(problems)],
    numbers: { tiposDeActividad: PRACTICE.length + 1 },
  };
}
