import { PALETTE } from '../../data/palette.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function buildRound(scene, { colourCount = 4 } = {}) {
  const byFamily = new Map();
  for (const obj of scene.objects) {
    if (!byFamily.has(obj.family)) byFamily.set(obj.family, []);
    byFamily.get(obj.family).push(obj);
  }

  const picks = [];
  for (const family of shuffle([...byFamily.keys()])) {
    if (picks.length >= colourCount) break;
    picks.push(shuffle(byFamily.get(family))[0]);
  }
  const spare = shuffle(scene.objects.filter((o) => !picks.includes(o)));
  while (picks.length < colourCount && spare.length) picks.push(spare.pop());

  const colours = shuffle(PALETTE).slice(0, picks.length);

  const questions = picks.map((obj, i) => ({
    kind: 'colour',
    objectId: obj.id,
    colourId: colours[i].id,
    colourLabel: colours[i].label,
    hex: colours[i].hex,
    say: `Can you see ${obj.phrase}? Colour it ${colours[i].label}.`,
    shortSay: `Colour ${obj.phrase} ${colours[i].label}.`,
  }));

  questions.push({
    kind: 'write',
    word: scene.writeTarget.word,
    say: `Now find the sign. Write the word "${scene.writeTarget.word}" on it.`,
    shortSay: `Write "${scene.writeTarget.word}" on the sign.`,
  });

  return questions;
}

export function checkColour(question, objectId, colourId) {
  if (objectId !== question.objectId) return 'wrong-object';
  if (colourId !== question.colourId) return 'wrong-colour';
  return 'correct';
}

export function checkWord(question, value) {
  return String(value).trim().toLowerCase() === question.word.toLowerCase();
}
