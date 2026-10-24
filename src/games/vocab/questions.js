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

export function buildRound({ size = 10, topicId = null, ids = null } = {}) {
  return pickBatch(size, topicId, ids).map((word) => {
    const task = taskFor(word);
    if (task === 'picture') return pictureQuestion(word);
    if (task === 'choose') return chooseQuestion(word);
    return spellQuestion(word);
  });
}

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
