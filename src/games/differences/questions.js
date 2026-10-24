import { SLOTS } from '../../data/scenes/garden.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Cuatro diferencias, como en el examen. Las otras ranuras quedan iguales.
export function buildRound({ differences = 4 } = {}) {
  const changing = shuffle(SLOTS).slice(0, differences);
  const left = {};
  const right = {};
  const list = [];

  for (const slot of SLOTS) {
    const a = pick(slot.values);
    left[slot.id] = a;
    if (changing.includes(slot)) {
      const b = pick(slot.values.filter((v) => v !== a));
      right[slot.id] = b;
      list.push({
        id: slot.id,
        left: a,
        right: b,
        sentence: slot.sentence(a, b),
        ...examinerLines(slot.sentence(a, b)),
      });
    } else {
      right[slot.id] = a;
    }
  }

  return { left, right, differences: list };
}

export const findDifference = (round, slotId) =>
  round.differences.find((d) => d.id === slotId) ?? null;

// Como en el examen: el examinador describe SU dibujo y pregunta por el del
// nino; el nino dice la diferencia y despues oye una forma de decirla.
// "Here the ball is under the tree, but here it is next to the table."
//   -> examinador: "In my picture the ball is under the tree. And in your picture?"
//   -> modelo:     "In my picture the ball is next to the table."
export function examinerLines(sentence) {
  const text = sentence.replace(/\.$/, '');
  // "Here there are four flowers, but here there are five."
  const count = text.match(/^Here there are (\w+) (\w+), but here there are (\w+)$/);
  if (count) {
    return {
      examiner: `In my picture there are ${count[1]} ${count[2]}. And in your picture?`,
      model: `In my picture there are ${count[3]} ${count[2]}.`,
    };
  }
  const parts = text.split(', but here it is ');
  if (parts.length !== 2 || !parts[0].startsWith('Here ')) return { examiner: sentence, model: sentence };
  const mine = parts[0].slice(5);                 // "the ball is under the tree"
  const subject = mine.split(' is ')[0];          // "the ball" (o "it")
  return {
    examiner: `In my picture ${mine}. And in your picture?`,
    model: `In my picture ${subject} is ${parts[1]}.`,
  };
}
