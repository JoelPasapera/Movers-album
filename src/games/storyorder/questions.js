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
