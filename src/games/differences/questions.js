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
      });
    } else {
      right[slot.id] = a;
    }
  }

  return { left, right, differences: list };
}

export const findDifference = (round, slotId) =>
  round.differences.find((d) => d.id === slotId) ?? null;
