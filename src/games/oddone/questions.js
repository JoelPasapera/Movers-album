import { allSets, groupLabels, oddLabels } from '../../data/oddoneout.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function optionsFor(correct, pool, count = 3) {
  const others = shuffle([...new Set(pool)].filter((label) => label !== correct));
  return shuffle([correct, ...others.slice(0, count - 1)]);
}

// Cuatro conjuntos por partida, igual que en el examen.
export function buildRound({ sets = 4 } = {}) {
  const groups = groupLabels();
  const odds = oddLabels();
  return shuffle(allSets()).slice(0, sets).map((set) => ({
    ...set,
    items: shuffle(set.items),
    groupOptions: optionsFor(set.groupLabel, groups),
    oddOptions: optionsFor(set.oddLabel, odds),
  }));
}

export const isOddOne = (question, itemId) => question.oddId === itemId;

export function checkReason(question, groupChoice, oddChoice) {
  return groupChoice === question.groupLabel && oddChoice === question.oddLabel;
}
