// @ts-check
// El Speaking cara a cara, como en el examen: el profesor hace de examinador
// con un nino delante y una tablet entre los dos. Aqui se decide que se le
// ensena al nino en cada parte y que dice el examinador (con lo que suena a
// una buena respuesta, para escucharla). La pantalla esta en ui/examiner.js y
// la nota se pone con la escala del handbook (engine/speakingScale.js).
//
// Sale de los mismos generadores y datos que los cuatro juegos de Speaking, asi
// que todo es original y del syllabus. Las frases del examinador son propias.

import { buildRound as differencesRound } from '../games/differences/questions.js';
import { buildRound as storyRound } from '../games/story/questions.js';
import { buildRound as oddRound } from '../games/oddone/questions.js';
import { buildRound as talkRound } from '../games/talkabout/questions.js';

/**
 * Una linea del guion: lo que dice el examinador y, si hace falta, lo que
 * suena a una buena respuesta.
 * @typedef {{ say: string, listen?: string }} ScriptLine
 */

/** Lo que dice el examinador en cada momento. Palabras de Starters y Movers. */
export const EXAMINER = {
  hello: 'Hello! What is your name?',
  age: 'How old are you?',
  p1: 'Here is your picture. My picture is a little different. Listen.',
  p1now: 'Now you tell me. What is different in your picture?',
  p2: (/** @type {string} */ title) => `These pictures tell a story. It is called “${title}”. Look at the pictures first.`,
  p2now: 'Now you tell the story.',
  p3: 'Look at these four pictures. One is different. Listen.',
  p3now: 'Which one is different? Why?',
  p4: 'Now let’s talk about you.',
  bye: 'Thank you. Goodbye!',
};

/** Una prueba de Speaking entera: lo que toca en cada parte. */
export function buildSpeakingTest() {
  return {
    // Cinco diferencias: la primera la dice el examinador como ejemplo.
    differences: differencesRound({ differences: 5 }),
    story: storyRound(),
    // Solo dibujos, como en el examen: los conjuntos que se entienden sin palabras.
    sets: oddRound({ sets: 4, pictures: true }),
    // El nombre ya se pregunta al empezar; en la parte 4, cinco preguntas mas.
    questions: talkRound({ count: 6 }).filter((q) => q.id !== 'name').slice(0, 5),
  };
}

/** @typedef {ReturnType<typeof buildSpeakingTest>} SpeakingTest */

/**
 * "The rabbit, the lion and the panda" @param {string[]} names
 */
const listed = (names) => `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;

/**
 * La frase entera de un conjunto de la parte 3: cual es distinto y por que.
 * "The sandwich is different. The rabbit, the lion and the panda are animals, but the sandwich is food."
 * @param {SpeakingTest['sets'][number]} set
 */
export function oddAnswer(set) {
  const odd = set.items.find((i) => i.id === set.oddId);
  const others = set.items.filter((i) => i.id !== set.oddId).map((i) => `the ${i.word}`);
  const name = odd ? `the ${odd.word}` : 'this one';
  const cap = (/** @type {string} */ s) => s.charAt(0).toUpperCase() + s.slice(1);
  return `${cap(name)} is different. ${cap(listed(others))} are ${set.groupLabel}, but ${name} is ${set.oddLabel}.`;
}

/**
 * El guion de las cuatro partes.
 * @param {SpeakingTest} test
 * @returns {{ part: number, title: string, intro: ScriptLine[], lines: ScriptLine[] }[]}
 */
export function examinerScript(test) {
  const [example, ...asks] = test.differences.differences;
  const yours = (/** @type {string} */ model) => model.replace(/^In my picture /, 'In your picture ');
  const { story } = test;
  const first = story.panels.find((p) => p.given) ?? story.panels[0];
  const [exampleSet, ...sets] = test.sets;
  return [
    {
      part: 1,
      title: 'Find the differences',
      intro: [
        { say: EXAMINER.p1 },
        { say: `${example.examiner.replace(/ And in your picture\?$/, '')} ${yours(example.model)}` },
        { say: EXAMINER.p1now },
      ],
      lines: asks.map((d) => ({ say: d.examiner, listen: d.model })),
    },
    {
      part: 2,
      title: 'Tell the story',
      intro: [
        { say: EXAMINER.p2(story.title) },
        { say: `${first.sentence} ${EXAMINER.p2now}` },
      ],
      lines: story.panels.filter((p) => p !== first).map((p) => ({ say: '', listen: p.sentence })),
    },
    {
      part: 3,
      title: 'The odd one out',
      intro: [
        { say: EXAMINER.p3 },
        { say: oddAnswer(exampleSet) },
      ],
      lines: sets.map((set) => ({ say: EXAMINER.p3now, listen: oddAnswer(set) })),
    },
    {
      part: 4,
      title: 'Talk about you',
      intro: [{ say: EXAMINER.p4 }],
      lines: test.questions.map((q) => ({ say: q.say, listen: q.model })),
    },
  ];
}

