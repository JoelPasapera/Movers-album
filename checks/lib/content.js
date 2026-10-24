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

export function contentStrings() {
  return [
    ...Object.values(DEFINITIONS).flat().flatMap((d) => [d.clue, d.answer]),
    ...SETS.flatMap((s) => [s.groupLabel, s.oddLabel]),
    ...STORIES.flatMap((s) => s.panels.map((p) => p.sentence)),
    ...READING_STORIES.flatMap((s) => [
      ...s.sections.map((x) => x.text),
      ...s.questions.flatMap((q) => [q.text, ...q.answers]),
    ]),
    ...DIALOGUES.flatMap((d) => d.turns.flatMap((t) => [t.line, ...t.options])),
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
