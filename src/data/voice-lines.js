// @ts-check
// Las frases que el profesor puede grabar con su voz (ui/voice.js), por
// grupos. Son las frases fijas que dicen los juegos: las de Listening, las
// preguntas de Speaking y sus respuestas modelo, las pistas de Spell it y los
// nombres deletreados. Lo que se inventa cada vez (las personas del parque,
// los colores de Listen and colour, los numeros del dictado) no se puede
// grabar entero y sigue con la voz del navegador.
//
// Cada frase es exactamente la que dice el juego: si se cambia aqui, la
// grabacion ya no se usaria (la clave es la frase).

import { NOTE_FORMS } from './notes.js';
import { MATCH_SETS } from './matching.js';
import { TICKBOX } from './tickbox.js';
import { PERSONAL_QUESTIONS, RESCUE } from './personal-questions.js';
import { allDefinitions } from './definitions.js';
import { NAMES } from './letters.js';
import { RUBRICS, partIntro } from './print-rubrics.js';

/**
 * @typedef {{ text: string, who?: 'adult' | 'child', note?: string }} VoiceLine
 * @typedef {{ id: string, title: string, about: string, lines: VoiceLine[] }} VoiceGroup
 */

/** Sin repetir la misma frase dentro de un grupo. @param {VoiceLine[]} lines */
const unique = (lines) => {
  const seen = new Set();
  return lines.filter((l) => (seen.has(l.text) ? false : (seen.add(l.text), true)));
};

/** @type {VoiceGroup[]} */
export const VOICE_GROUPS = [
  {
    id: 'notes',
    title: 'Listen and write (Listening 2)',
    about: 'Short sentences with a day, a time, a name spelled letter by letter or a number.',
    lines: unique(NOTE_FORMS.flatMap((f) => f.rows.map((r) => ({ text: r.say })))),
  },
  {
    id: 'match',
    title: 'Listen and match (Listening 3)',
    about: 'What each person did, liked or got.',
    lines: unique(MATCH_SETS.flatMap((m) => [...m.pairs.map((p) => ({ text: p.say })), { text: m.extraSay }])),
  },
  {
    id: 'tick',
    title: 'Listen and tick (Listening 4)',
    about: 'Conversations between an adult and a child. You can ask a child to record the child’s lines.',
    lines: unique(TICKBOX.flatMap((t) => t.lines.map((l) => ({ text: l.text, who: /** @type {'adult' | 'child'} */ (l.who) })))),
  },
  {
    id: 'talk',
    title: 'Talk about you (Speaking 4)',
    about: 'The questions, the model answers and the three phrases to ask for help.',
    lines: unique([
      ...PERSONAL_QUESTIONS.flatMap((q) => [{ text: q.say }, { text: q.model, note: 'model answer' }]),
      ...RESCUE.map((text) => ({ text, note: 'to ask for help' })),
    ]),
  },
  {
    id: 'names',
    title: 'Names, letter by letter (Letters and numbers)',
    about: 'Say the letters clearly, with a short stop after each one.',
    lines: NAMES.map((name) => ({ text: `${name.toUpperCase().split('').join('-')}.`, note: name })),
  },
  {
    id: 'letters',
    title: 'The alphabet (Letters and numbers)',
    about: 'One letter each time, as you say it when you spell.',
    lines: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((letter) => ({ text: `${letter}.` })),
  },
  {
    id: 'print',
    title: 'Practice test on paper (the Listening instructions)',
    about: 'What the page of the practice test says before every part, and at the end of it.',
    lines: [
      ...[RUBRICS.l1, RUBRICS.l2, RUBRICS.l3, RUBRICS.l4, RUBRICS.l5].map((rubric, i) => ({ text: partIntro(i + 1, rubric) })),
      { text: RUBRICS.again },
      { text: RUBRICS.end },
    ],
  },
  {
    id: 'clues',
    title: 'Spell it clues (Reading and Writing 1)',
    about: 'The clue the app reads when a child taps “Read it to me”.',
    lines: unique(allDefinitions().map((d) => ({ text: d.clue }))),
  },
];

/** Cuantas frases se pueden grabar en total. */
export const VOICE_LINE_COUNT = VOICE_GROUPS.reduce((a, g) => a + g.lines.length, 0);
