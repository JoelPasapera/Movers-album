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
import { PAST_SENTENCES } from '../src/data/past-forms.js';
import { COMPOUNDS } from '../src/games/wordpairs/questions.js';
import { TIME_SLOTS, HOUR_ACTIVITIES, EVENTS } from '../src/data/time-prepositions.js';
import { WHERE_ARE_THEY } from '../src/data/where-are-they.js';
import { TICKBOX } from '../src/data/tickbox.js';
import { BOARDS, boardGaps } from '../src/data/boards.js';

export const name = 'Hay contenido para un curso, no para dos semanas';

// Minimos para que un nino no repita lo mismo antes de un trimestre.
const MINIMUM = [
  ['definiciones (Reading 1)', () => allDefinitions().length, 100],
  ['dialogos (Reading 2)', () => DIALOGUES.length, 10],
  ['historias con huecos (Reading 3)', () => GAP_STORIES.length, 10],
  ['textos de gramatica (Reading 4)', () => CLOZE_TEXTS.length, 10],
  ['historias de lectura (Reading 5)', () => READING_STORIES.length, 8],
  ['escenas de la Parte 6', () => PART6_SCENES.length, 4],
  ['formularios (Listening 2)', () => NOTE_FORMS.length, 6],
  ['emparejamientos (Listening 3)', () => MATCH_SETS.length, 6],
  ['escenas de colorear (Listening 5)', () => SCENES.length, 4],
  ['historias de Speaking 2', () => STORIES.length, 7],
  ['conjuntos de intruso (Speaking 3)', () => SETS.length, 28],
  ['preguntas personales (Speaking 4)', () => PERSONAL_QUESTIONS.length, 20],
  ['frases con banco de dibujos', () => PICTURE_GAPS.length, 25],
  ['palabras para escribir una frase', () => SENTENCE_WORDS.length, 20],
  ['verbos con frase en pasado', () => Object.keys(PAST_SENTENCES).length, 60],
  ['palabras compuestas del wordlist', () => COMPOUNDS.length, 15],
  ['momentos y actividades de preposiciones de tiempo', () => TIME_SLOTS.length + HOUR_ACTIVITIES.length + EVENTS.length, 25],
  ['lugares de Where are they?', () => WHERE_ARE_THEY.length, 15],
  ['dialogos de Listening parte 4', () => TICKBOX.length, 12],
  ['tableros del picture book', () => BOARDS.length, 8],
  ['preguntas de Let\'s talk! de los tableros', () => BOARDS.flatMap((b) => b.talk).length, 32],
  ['frases con hueco de los tableros', () => boardGaps().length, 40],
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
