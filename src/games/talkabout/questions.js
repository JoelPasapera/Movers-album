import { PERSONAL_QUESTIONS, EXPECT } from '../../data/personal-questions.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const words = (text) => String(text)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .replace(/[^a-z' ]/g, ' ')
  .split(/\s+/)
  .filter(Boolean);

const stem = (w) => w.replace(/(ing|ed|s)$/, '');

// La primera pregunta siempre es el nombre, como hace el examinador.
export function buildRound({ count = 6 } = {}) {
  const first = PERSONAL_QUESTIONS.find((q) => q.id === 'name');
  const rest = shuffle(PERSONAL_QUESTIONS.filter((q) => q.id !== 'name')).slice(0, count - 1);
  return [first, ...rest];
}

// Dos puntos, como los dos criterios que de verdad importan aqui: contestar
// (interaccion) y contestar algo que tenga que ver con la pregunta.
// El reconocimiento de voz falla mucho con acento infantil, asi que nunca se
// baja a cero por una palabra mal transcrita: el alumno puede corregir.
export function checkAnswer(question, transcript) {
  const said = words(transcript);
  if (!said.length) {
    return { marks: 0, kind: 'silent', note: 'You did not say anything. Silence loses marks.' };
  }

  const expected = EXPECT[question.expect];
  if (!expected) {
    return said.length >= 2
      ? { marks: 2, kind: 'good', note: 'Good answer.' }
      : { marks: 1, kind: 'short', note: 'That works, but try two or three words.' };
  }

  const pool = new Set(expected.map(stem));
  const hit = said.some((w) => pool.has(stem(w)) || pool.has(w));

  if (!hit) {
    return {
      marks: 1,
      kind: 'offTopic',
      note: `You answered, so you get one mark. But ${question.hint.toLowerCase()}`,
    };
  }
  if (said.length < 2) {
    return { marks: 1, kind: 'short', note: 'Right idea. Now say it in a whole sentence.' };
  }
  return { marks: 2, kind: 'good', note: 'Two marks. You answered the question well.' };
}

export const MAX_PER_QUESTION = 2;
