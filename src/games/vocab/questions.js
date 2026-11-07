import { ALL_WORDS, pickBatch } from '../../engine/vocabulary.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const PICTURABLE = ALL_WORDS.filter((w) => w.pic && w.icon);

const norm = (value) => String(value)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z' -]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

// Tres formas de preguntar. Las dos ultimas valen para CUALQUIER palabra del
// wordlist, incluidos adjetivos, verbos y preposiciones, que no se dibujan.
export function taskFor(word) {
  if (word.pic && word.icon && PICTURABLE.length >= 4) return 'picture';
  return norm(word.word).length <= 9 ? 'spell' : 'choose';
}

function pictureQuestion(word) {
  const others = shuffle(PICTURABLE.filter((w) => w.id !== word.id && w.icon !== word.icon))
    .slice(0, 3);
  return {
    kind: 'picture',
    word,
    say: `Where is the ${word.word}?`,
    options: shuffle([word, ...others]),
  };
}

function chooseQuestion(word) {
  const others = shuffle(ALL_WORDS.filter((w) => w.id !== word.id
    && norm(w.word) !== norm(word.word))).slice(0, 3);
  return {
    kind: 'choose',
    word,
    say: word.word,
    options: shuffle([word, ...others]),
  };
}

const spellQuestion = (word) => ({ kind: 'spell', word, say: word.word });

/**
 * La pregunta de una palabra, con el tipo que le toca (dibujo, escribir o
 * elegir). Otra vez la misma palabra da opciones nuevas.
 * @param {any} word
 */
export function questionFor(word) {
  const task = taskFor(word);
  if (task === 'picture') return pictureQuestion(word);
  if (task === 'choose') return chooseQuestion(word);
  return spellQuestion(word);
}

/**
 * Las preguntas de una ronda. Con `maxNew`, no mas palabras nuevas que esas
 * (engine/vocabulary.js, NEW_PER_ROUND).
 * @param {{ size?: number, topicId?: string | null, ids?: Iterable<string> | null, maxNew?: number }} [options]
 */
export function buildRound({ size = 10, topicId = null, ids = null, maxNew = Infinity } = {}) {
  return pickBatch(size, topicId, ids, { maxNew }).map(questionFor);
}

/**
 * Un paso de la ronda: conocer una palabra nueva (meet) o contestar una
 * pregunta (test). `retry` es la segunda oportunidad de una palabra fallada.
 * @typedef {{ type: 'meet', word: any } | { type: 'test', question: any, retry: boolean }} Step
 */

/** Pasos que hay entre conocer una palabra nueva y que se pregunte. */
export const MEET_GAP = 2;

/**
 * El orden de la ronda. Las palabras nuevas van primero y cada una se presenta
 * (meet) antes de preguntarla, con al menos MEET_GAP pasos en medio: asi hay
 * que recordarla, no copiarla de la pantalla de antes. Las conocidas van
 * despues y separan las ultimas nuevas de su pregunta.
 * @param {any[]} questions @param {(id: string) => boolean} isNew
 * @returns {Step[]}
 */
export function sessionSteps(questions, isNew) {
  const ordered = [...questions.filter((q) => isNew(q.word.id)), ...questions.filter((q) => !isNew(q.word.id))];
  /** @type {Step[]} */
  const steps = [];
  /** @type {{ question: any, at: number }[]} */
  const waiting = [];
  const release = () => {
    while (waiting.length && steps.length - waiting[0].at > MEET_GAP) {
      const next = /** @type {{ question: any, at: number }} */ (waiting.shift());
      steps.push({ type: 'test', question: next.question, retry: false });
    }
  };
  for (const question of ordered) {
    if (isNew(question.word.id)) {
      steps.push({ type: 'meet', word: question.word });
      waiting.push({ question, at: steps.length - 1 });
    } else {
      steps.push({ type: 'test', question, retry: false });
    }
    release();
  }
  for (const rest of waiting) steps.push({ type: 'test', question: rest.question, retry: false });
  return steps;
}

/** Pasos que espera una palabra fallada para volver en la misma ronda. */
export const RETRY_GAP = 3;

export function check(question, answer) {
  if (question.kind === 'spell') {
    const typed = norm(answer);
    if (!typed) return { ok: false, kind: 'empty' };
    return { ok: typed === norm(question.word.word), kind: 'spell' };
  }
  return { ok: answer === question.word.id, kind: question.kind };
}

// Cada entrada del wordlist tiene que poder convertirse en pregunta.
export function coverage() {
  const broken = [];
  for (const word of ALL_WORDS) {
    const task = taskFor(word);
    const question = task === 'picture' ? pictureQuestion(word)
      : task === 'choose' ? chooseQuestion(word) : spellQuestion(word);
    if (!question.word || !question.say) broken.push(word.id);
    if (question.options && question.options.length !== 4) broken.push(word.id);
    if (question.options && !question.options.some((o) => o.id === word.id)) broken.push(word.id);
    if (!check(question, task === 'spell' ? word.word : word.id).ok) broken.push(word.id);
  }
  return { total: ALL_WORDS.length, broken: [...new Set(broken)] };
}
