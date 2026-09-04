import { allDefinitions } from '../src/data/definitions.js';
import { SETS } from '../src/data/oddoneout.js';
import { STORIES } from '../src/data/stories.js';
import { READING_STORIES } from '../src/data/reading-stories.js';
import { DIALOGUES } from '../src/data/dialogues.js';
import { GAP_STORIES } from '../src/data/gap-stories.js';
import { CLOZE_TEXTS } from '../src/data/cloze.js';
import { NOTE_FORMS } from '../src/data/notes.js';
import { MATCH_SETS } from '../src/data/matching.js';
import { PERSONAL_QUESTIONS } from '../src/data/personal-questions.js';
import { PART6_SCENES } from '../src/data/scenes/part6.js';
import { SCENES } from '../src/data/scenes/index.js';
import { PICTURE_GAPS } from '../src/data/picture-gaps.js';
import { SENTENCE_WORDS } from '../src/data/sentence-words.js';

export const name = 'Hay contenido para un curso, no para dos semanas';

// Minimos para que un nino no repita lo mismo antes de un trimestre.
const MINIMUM = [
  ['definiciones (Reading 1)', () => allDefinitions().length, 100],
  ['dialogos (Reading 2)', () => DIALOGUES.length, 3],
  ['historias con huecos (Reading 3)', () => GAP_STORIES.length, 5],
  ['textos de gramatica (Reading 4)', () => CLOZE_TEXTS.length, 5],
  ['historias de lectura (Reading 5)', () => READING_STORIES.length, 4],
  ['escenas de la Parte 6', () => PART6_SCENES.length, 4],
  ['formularios (Listening 2)', () => NOTE_FORMS.length, 6],
  ['emparejamientos (Listening 3)', () => MATCH_SETS.length, 6],
  ['escenas de colorear (Listening 5)', () => SCENES.length, 4],
  ['historias de Speaking 2', () => STORIES.length, 7],
  ['conjuntos de intruso (Speaking 3)', () => SETS.length, 28],
  ['preguntas personales (Speaking 4)', () => PERSONAL_QUESTIONS.length, 20],
  ['frases con banco de dibujos', () => PICTURE_GAPS.length, 25],
  ['palabras para escribir una frase', () => SENTENCE_WORDS.length, 20],
];

export function run() {
  const problems = [];
  let total = 0;
  for (const [label, count, floor] of MINIMUM) {
    const n = count();
    total += n;
    if (n < floor) problems.push(`solo hay ${n} ${label}, y el minimo son ${floor}`);
  }
  return {
    ok: problems.length === 0,
    detail: `${total} piezas de contenido en total`,
    problems,
    numbers: { piezasDeContenido: total },
  };
}
