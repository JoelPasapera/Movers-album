// @ts-check
// Un examen de practica para imprimir: las cinco partes de Listening y las seis
// de Reading and Writing, como el examen de verdad (que es en papel), mas el
// guion de Listening y las respuestas para el profesor.
//
// Todo sale de los mismos generadores y datos que los juegos, asi que todo es
// original y del syllabus. Lo que se imprime lo decide un numero (la semilla):
// el mismo numero da siempre el mismo examen. Asi el profesor puede imprimirlo
// hoy y poner el audio de Listening manana, o reimprimir una hoja.
//
// Aqui solo se decide QUE va en el examen. Pintarlo es cosa de
// ui/printTest.js.

import { buildRound as matchNames, dialogueFor } from '../games/matchnames/questions.js';
import { ACTIONS } from '../data/scenes/crowd.js';
import { buildRound as noteForm } from '../games/notetaking/questions.js';
import { NOTE_FORMS } from '../data/notes.js';
import { buildRound as matchPictures } from '../games/matchpics/questions.js';
import { MATCH_SETS } from '../data/matching.js';
import { buildRound as tickBoxes, iconFor } from '../games/tickbox/questions.js';
import { buildRound as colourRound } from '../games/colour/questions.js';
import { SCENES } from '../data/scenes/index.js';
import { buildRound as spellRound } from '../games/spellit/questions.js';
import { DEFINITIONS, definitionsFor, allDefinitions } from '../data/definitions.js';
import { DIALOGUES } from '../data/dialogues.js';
import { GAP_STORIES } from '../data/gap-stories.js';
import { CLOZE_TEXTS } from '../data/cloze.js';
import { READING_STORIES } from '../data/reading-stories.js';
import { PART6_SCENES } from '../data/scenes/part6.js';
import { RUBRICS } from '../data/print-rubrics.js';

/** @typedef {{ who: 'adult' | 'child', text: string }} Line */

/** Las semillas validas: un numero de 1 a 999999 (cabe en la direccion). */
export const MAX_SEED = 999999;

/** @param {unknown} v @returns {number | null} */
export function parseSeed(v) {
  const n = Number(v);
  return Number.isInteger(n) && n >= 1 && n <= MAX_SEED ? n : null;
}

/** Una semilla nueva al azar. */
export const newSeed = () => 1 + Math.floor(Math.random() * MAX_SEED);

/** Numeros al azar que salen siempre igual con la misma semilla (mulberry32). @param {number} seed */
function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Los generadores de los juegos usan Math.random. Mientras se arma el examen
 * se cambia por uno con semilla, y se devuelve el de siempre al acabar (pase
 * lo que pase). Es sincrono: nada mas puede usar Math.random mientras tanto.
 * @template T @param {number} seed @param {() => T} build @returns {T}
 */
function withSeed(seed, build) {
  const original = Math.random;
  Math.random = seededRandom(seed);
  try {
    return build();
  } finally {
    Math.random = original;
  }
}

/** @template T @param {T[]} list @returns {T} */
const pick = (list) => list[Math.floor(Math.random() * list.length)];

/** @template T @param {T[]} list @returns {T[]} */
function shuffle(list) {
  const copy = [...list];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export { RUBRICS };

/**
 * El examen entero para una semilla.
 * @param {number} seed
 */
export function buildPrintTest(seed) {
  return withSeed(seed, () => {
    // ---------------------------------------------------------- Listening
    const names = matchNames();
    const form = noteForm(pick(NOTE_FORMS));
    const pictures = matchPictures(pick(MATCH_SETS));
    const ticks = tickBoxes();
    const scene = pick(SCENES);
    const colours = colourRound(scene);

    // ---------------------------------------------------------- Reading and Writing
    const topics = Object.keys(DEFINITIONS).filter((id) => definitionsFor(id).length >= 5);
    const spell = spellRound(definitionsFor(pick(topics)), allDefinitions());
    const dialogue = pick(DIALOGUES);
    const gapStory = pick(GAP_STORIES);
    const bank = shuffle(gapStory.bank);
    const cloze = pick(CLOZE_TEXTS);
    const story = pick(READING_STORIES);
    const picture = pick(PART6_SCENES);

    return {
      seed,
      listening: {
        names, form, pictures, ticks, scene, colours,
      },
      reading: {
        spell,
        dialogue,
        gapStory: { ...gapStory, bank: bank.map((word) => ({ word, icon: iconFor(word) })) },
        cloze,
        story,
        picture,
      },
    };
  });
}

/** @typedef {ReturnType<typeof buildPrintTest>} PrintTest */

/**
 * El guion de cada parte de Listening, como lo dice la voz (o el profesor):
 * la instruccion, el ejemplo y las preguntas. En el examen cada parte suena
 * dos veces; eso lo hace quien lo pone (ui/printTest.js).
 * @param {PrintTest} test
 * @returns {{ part: number, rubric: string, intro: Line[], items: Line[][] }[]}
 */
export function listeningScript(test) {
  const { names, form, pictures, ticks, colours } = test.listening;
  const adult = (/** @type {string} */ text) => /** @type {Line} */ ({ who: 'adult', text });
  return [
    {
      part: 1,
      rubric: RUBRICS.l1,
      intro: [],
      items: [dialogueFor(names.example, names.people), ...names.questions.map((q) => q.lines)],
    },
    {
      part: 2,
      rubric: RUBRICS.l2,
      intro: [adult(form.intro)],
      items: form.rows.map((row) => [adult(row.say)]),
    },
    {
      part: 3,
      rubric: RUBRICS.l3,
      intro: [adult(pictures.intro)],
      items: [
        [adult(pictures.example.say)],
        ...pictures.questions.map((q) => [adult(q.say)]),
        [adult(pictures.extraSay)],
      ],
    },
    {
      part: 4,
      rubric: RUBRICS.l4,
      intro: [],
      items: ticks.map((q, i) => [adult(`${i + 1}. ${q.question}`), ...q.lines]),
    },
    {
      part: 5,
      rubric: RUBRICS.l5,
      intro: [],
      items: colours.map((q) => [adult(q.say)]),
    },
  ];
}

/**
 * Las respuestas de todo el examen, parte por parte, para el profesor.
 * @param {PrintTest} test
 * @returns {{ id: string, title: string, marks: number, answers: string[] }[]}
 */
export function answerKey(test) {
  const { names, form, pictures, ticks, colours } = test.listening;
  const { spell, dialogue, gapStory, cloze, story, picture } = test.reading;
  const letters = 'ABC';
  return [
    { id: 'l1', title: 'Listening 1', marks: 5, answers: names.questions.map((q, i) => `${i + 1}. ${q.name}: the ${describe(names.people.find((p) => p.slot === q.slot))}`) },
    { id: 'l2', title: 'Listening 2', marks: 5, answers: form.questions.map((r, i) => `${i + 1}. ${r.answer}${r.spelled ? ' (spelling must be right)' : ''}`) },
    { id: 'l3', title: 'Listening 3', marks: 5, answers: pictures.questions.map((q, i) => `${i + 1}. ${q.left}: ${q.letter} (${q.word})`) },
    { id: 'l4', title: 'Listening 4', marks: 5, answers: ticks.map((q, i) => `${i + 1}. ${/** @type {any} */ (q.options.find((o) => o.word === q.answer))?.letter} (${q.answer})`) },
    {
      id: 'l5', title: 'Listening 5', marks: 5,
      answers: colours.map((q, i) => `${i + 1}. ${q.shortSay}`),
    },
    { id: 'r1', title: 'Reading and Writing 1', marks: 5, answers: spell.questions.map((q, i) => `${i + 1}. ${q.answer}`) },
    { id: 'r2', title: 'Reading and Writing 2', marks: 6, answers: dialogue.turns.map((t, i) => `${i + 1}. ${letters[t.answer]}`) },
    {
      id: 'r3', title: 'Reading and Writing 3', marks: 6,
      answers: [...gapStory.answers.map((a, i) => `${i + 1}. ${a}`), `6. ${gapStory.titles[gapStory.title]}`],
    },
    { id: 'r4', title: 'Reading and Writing 4', marks: 5, answers: cloze.gaps.map((g, i) => `${i + 1}. ${g.options[g.answer]}`) },
    { id: 'r5', title: 'Reading and Writing 5', marks: 7, answers: story.questions.map((q, i) => `${i + 1}. ${q.answers.slice(0, 2).join(' / ')}`) },
    {
      id: 'r6', title: 'Reading and Writing 6', marks: 10,
      answers: picture.prompts.map((p, i) => `${i + 1}. ${p.kind === 'free' ? 'any true sentence about the picture (2 marks: 1 for meaning, 1 for good English)' : (p.answers ?? []).slice(0, 2).join(' / ')}`),
    },
  ];
}

/** "girl in the red T-shirt who is riding a bike" @param {any} person */
function describe(person) {
  const action = ACTIONS.find((a) => a.id === person.action)?.phrase ?? person.action;
  return `${person.boy ? 'boy' : 'girl'} in the ${person.shirt} T-shirt who is ${action}`;
}
