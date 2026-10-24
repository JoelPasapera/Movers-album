import { STORIES } from '../../data/stories.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function scramble(sentence) {
  const words = sentence.replace(/\.$/, '').split(' ');
  if (words.length < 3) return words;
  let mixed = shuffle(words);
  let guard = 0;
  while (mixed.join(' ') === words.join(' ') && guard < 20) {
    mixed = shuffle(words);
    guard += 1;
  }
  return mixed;
}

export function buildRound(storyId = null) {
  const story = storyId
    ? STORIES.find((s) => s.id === storyId) ?? STORIES[0]
    : STORIES[Math.floor(Math.random() * STORIES.length)];

  return {
    id: story.id,
    title: story.title,
    order: story.panels.map((p) => p.id),
    shuffled: shuffle(story.panels),
    panels: story.panels.map((panel) => ({
      ...panel,
      words: panel.given ? [] : scramble(panel.sentence),
      target: panel.sentence.replace(/\.$/, '').split(' '),
    })),
  };
}

export function scoreOrder(round, attempt) {
  return attempt.reduce((total, id, i) => total + (round.order[i] === id ? 1 : 0), 0);
}

export const checkSentence = (panel, built) =>
  built.join(' ').toLowerCase() === panel.target.join(' ').toLowerCase();

// --- contar la historia hablando (la parte 2 real) --------------------------

// Palabras que no dicen nada del dibujo: articulos, verbos vacios y adjetivos
// de relleno. "A big red bus" no cuenta la historia de un muneco de nieve.
const STOP = new Set(['a', 'an', 'the', 'is', 'are', 'was', 'were', 'he', 'she', 'it', 'they', 'his', 'her', 'their', 'its',
  'and', 'to', 'of', 'in', 'on', 'at', 'for', 'with', 'all', 'very', 'now', 'then', 'there', 'here', 'this', 'that', 'not', 'no',
  'big', 'small', 'little', 'good', 'bad', 'new', 'old', 'nice', 'some', 'one', 'two', 'three', 'lot', 'lots',
  'has', 'have', 'got', 'get', 'gets', 'go', 'goes', 'went', 'put', 'puts', 'made', 'make', 'makes', 'look', 'looks', 'see', 'sees', 'can']);

const words = (text) => String(text ?? '').toLowerCase().match(/[a-z][a-z'-]*/g) ?? [];
const stem = (w) => w.replace(/(ing|ed|es|s)$/, '');

// Las palabras que cuentan de la frase modelo: sin articulos ni verbos vacios.
export const keyWords = (panel) => words(panel.sentence).filter((w) => !STOP.has(w));

export const MAX_PER_PANEL = 2;

// El examinador no busca la frase exacta: busca que el nino diga algo con
// sentido sobre el dibujo. Dos puntos si dice tres palabras o mas y alguna es
// del dibujo; uno si dice algo corto o de otra cosa; cero si calla.
export function gradeTelling(panel, transcript) {
  const said = words(transcript);
  if (!said.length) return { marks: 0, kind: 'silent', note: 'Say something about the picture. Even a few words count.' };
  const key = new Set(keyWords(panel).map(stem));
  const hit = said.some((w) => key.has(stem(w)));
  if (hit && said.length >= 3) return { marks: 2, kind: 'good', note: 'Good. That tells the story.' };
  if (hit) return { marks: 1, kind: 'short', note: 'Right idea. Now say it in a whole sentence.' };
  return { marks: 1, kind: 'offTopic', note: 'You said something, so you get one mark. Look at what the person is doing.' };
}
