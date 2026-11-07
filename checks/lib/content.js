// Reune TODO el texto en ingles que ve un alumno, venga del juego que venga.
// Si se anade un juego nuevo con contenido, hay que anadirlo aqui.

import { DEFINITIONS } from '../../src/data/definitions.js';
import { SETS } from '../../src/data/oddoneout.js';
import { STORIES } from '../../src/data/stories.js';
import { READING_STORIES } from '../../src/data/reading-stories.js';
import { DIALOGUES } from '../../src/data/dialogues.js';
import { CLOZE_TEXTS } from '../../src/data/cloze.js';
import { GAP_STORIES } from '../../src/data/gap-stories.js';
import { PERSONAL_QUESTIONS } from '../../src/data/personal-questions.js';
import { NOTE_FORMS } from '../../src/data/notes.js';
import { MATCH_SETS } from '../../src/data/matching.js';
import { PART6_SCENES } from '../../src/data/scenes/part6.js';
import { SCENES } from '../../src/data/scenes/index.js';
import { SLOTS } from '../../src/data/scenes/garden.js';
import { PICTURE_GAPS } from '../../src/data/picture-gaps.js';
import { SENTENCE_WORDS } from '../../src/data/sentence-words.js';
import { FRAMES, OPPOSITES } from '../../src/data/opposites.js';
import { PAST_SENTENCES, PAST_SUBJECTS, PAST_TIMES } from '../../src/data/past-forms.js';
import { PAST_VERBS } from '../../src/engine/wordforms.js';
import { allSentences as timeSentences } from '../../src/data/time-prepositions.js';
import { WHERE_ARE_THEY, whereSentence } from '../../src/data/where-are-they.js';
import { TICKBOX } from '../../src/data/tickbox.js';
import { PARTS, hurtSentence } from '../../src/games/matter/questions.js';
import { BOARDS } from '../../src/data/boards.js';
import { NUMBER_LINES, NAMES } from '../../src/data/letters.js';
import { buildPrintTest, listeningScript, RUBRICS } from '../../src/engine/printTest.js';
import { buildRound as colourRound } from '../../src/games/colour/questions.js';
import { EXAMINER, examinerScript, buildSpeakingTest, oddAnswer } from '../../src/engine/examiner.js';
import { allSets } from '../../src/data/oddoneout.js';
import { examinerLines } from '../../src/games/differences/questions.js';
import {
  spellItem, numberItem, feedbackFor as letterFeedback, promptFor as letterPrompt, emptyHint as letterHint,
} from '../../src/games/letters/questions.js';

/**
 * Todo lo que dice el dictado de letras y numeros: las frases con un numero
 * (con el mas pequeno y el mas grande de cada una), las instrucciones y cada
 * respuesta posible. En las respuestas las letras son A e I, que ademas son
 * palabras del syllabus: lo que se revisa es lo que va alrededor de la letra.
 */
/**
 * Lo que dice y ensena el examen para imprimir: sus instrucciones y el guion de
 * Listening de varios examenes (que es tambien lo que dicen Match the names,
 * Listen and write, Listen and match, Listen and tick y Listen and colour,
 * incluida la frase de donde se escribe la palabra en cada escena de colorear).
 */
function printTexts() {
  const scripts = [1, 2, 3, 4, 5, 6, 7, 8].flatMap((seed) => listeningScript(buildPrintTest(seed)));
  return [
    ...Object.values(RUBRICS),
    ...scripts.flatMap((p) => [...p.intro, ...p.items.flat()].map((l) => l.text)),
    ...SCENES.flatMap((scene) => colourRound(scene, { colourCount: scene.objects.length }).flatMap((q) => [q.say, q.shortSay])),
  ];
}

/**
 * Lo que dice el examinador en el Speaking cara a cara: sus frases fijas, el
 * titulo de cada historia, la respuesta modelo de cada conjunto de la parte 3,
 * la linea y la respuesta de cada diferencia posible del jardin, y el guion de
 * varias pruebas enteras.
 */
function examinerTexts() {
  const scripts = Array.from({ length: 12 }, () => examinerScript(buildSpeakingTest())).flat();
  return [
    ...Object.values(EXAMINER).filter((v) => typeof v === 'string'),
    ...STORIES.map((s) => EXAMINER.p2(s.title)),
    EXAMINER.p2now,
    ...allSets().map(oddAnswer),
    ...SLOTS.flatMap((slot) => slot.values.flatMap((a) => slot.values.filter((b) => b !== a).flatMap((b) => {
      const lines = examinerLines(slot.sentence(a, b));
      return [lines.examiner, lines.model];
    }))),
    ...scripts.flatMap((part) => [...part.intro, ...part.lines].flatMap((l) => [l.say, l.listen ?? ''])),
  ];
}

function letterTexts() {
  const name = spellItem(NAMES[0], true);
  const word = spellItem('cat', false);
  const num = numberItem(14, NUMBER_LINES[0]);
  /** @type {any[]} */
  const results = [
    { kind: 'correct' }, { kind: 'writtenNumber' }, { kind: 'letter', want: 'A', got: 'I' },
    { kind: 'missing', want: 'A', double: true }, { kind: 'missing', want: 'A', double: false },
    { kind: 'extra', got: 'I' }, { kind: 'twin', want: 14, got: 40 }, { kind: 'wrong' },
  ];
  return [
    ...NUMBER_LINES.flatMap((l) => [numberItem(l.min, l).say, numberItem(l.max, l).say]),
    ...[name, word, num].flatMap((item) => [letterPrompt(item), letterHint(item), ...results.map((r) => letterFeedback(r, item))]),
  ];
}

export function contentStrings() {
  return [
    ...Object.values(DEFINITIONS).flat().flatMap((d) => [d.clue, d.answer]),
    ...SETS.flatMap((s) => [s.groupLabel, s.oddLabel]),
    ...STORIES.flatMap((s) => s.panels.map((p) => p.sentence)),
    ...READING_STORIES.flatMap((s) => [
      ...s.sections.map((x) => x.text),
      ...s.questions.flatMap((q) => [q.text, ...q.answers]),
    ]),
    // Los titulos tambien se ven (en los juegos y en el examen para imprimir).
    ...DIALOGUES.flatMap((d) => [d.title, ...d.turns.flatMap((t) => [t.line, ...t.options])]),
    ...CLOZE_TEXTS.map((c) => c.title),
    ...READING_STORIES.map((s) => s.title),
    ...NOTE_FORMS.flatMap((f) => [f.title, f.intro]),
    ...STORIES.map((s) => s.title),
    ...PART6_SCENES.map((s) => s.title),
    ...CLOZE_TEXTS.flatMap((c) => [...c.parts, ...c.gaps.flatMap((g) => g.options)]),
    ...GAP_STORIES.flatMap((g) => [...g.parts, ...g.titles, ...g.bank]),
    ...PERSONAL_QUESTIONS.flatMap((q) => [q.say, q.model, q.hint]),
    ...NOTE_FORMS.flatMap((f) => f.rows.flatMap((r) => [r.label, r.say, String(r.answer)])),
    ...MATCH_SETS.flatMap((s) => [
      s.intro, s.leftLabel, s.extraSay,
      ...s.pairs.flatMap((p) => [p.left, p.word, p.say]),
      ...s.extras.map((e) => e.word),
    ]),
    ...PART6_SCENES.flatMap((s) => s.prompts.flatMap((p) => [p.text, ...(p.answers ?? [])])),
    ...Object.values(SCENES).flatMap((s) => s.objects.map((o) => o.phrase)),
    ...SLOTS.flatMap((s) => s.values.map((v) => s.sentence(v, s.values[0]))),
    ...PICTURE_GAPS.map((g) => g.text.replace('___', g.target)),
    ...SENTENCE_WORDS.flatMap((s) => [s.word, s.model]),
    ...OPPOSITES.flatMap((pair) => {
      const frame = FRAMES[pair.join('-')];
      return frame ? [`${frame[0]}${pair[0]}${frame[1]}${pair[1]}${frame[2]}`] : [];
    }),
    ...Object.entries(PAST_SENTENCES).map(([verb, rest]) => {
      const past = PAST_VERBS.find((p) => p.base === verb)?.formed ?? verb;
      return `${PAST_TIMES[0]} ${PAST_SUBJECTS[0]} ${past} ${rest}.`;
    }),
    ...PAST_SUBJECTS, ...PAST_TIMES,
    ...timeSentences(),
    ...WHERE_ARE_THEY.flatMap((w) => [w.clue, whereSentence('He', w.place), whereSentence('She', w.place)]),
    ...PARTS.map((p) => hurtSentence(p.word)),
    ...TICKBOX.flatMap((t) => [t.question, ...t.options, ...t.lines.map((l) => l.text)]),
    ...letterTexts(),
    ...printTexts(),
    ...examinerTexts(),
    ...BOARDS.flatMap((b) => [
      b.title, b.intro, ...b.words,
      ...b.talk.flatMap((q) => [q.say, q.model, q.hint]),
      ...b.gaps.map((g) => g.text.replace('___', g.target)),
    ]),
  ].filter(Boolean).map(String);
}

const strip = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export const words = (text) => strip(String(text).toLowerCase())
  .replace(/\u2019/g, "'")
  // Los nombres deletreados en voz alta (C-L-A-R-E) no son vocabulario.
  .replace(/\b(?:[a-z]-){2,}[a-z]\b/g, ' ')
  .match(/[a-z][a-z'-]*/g) ?? [];
