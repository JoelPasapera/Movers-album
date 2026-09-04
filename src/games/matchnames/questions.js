import { NAMES, SHIRTS, ACTIONS } from '../../data/scenes/crowd.js';

const HAIR = ['#6B4423', '#F5C542', '#2B2B2B', '#A85B2B'];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// Seis personas. Un color de camiseta se repite y una accion tambien, pero
// nunca en la misma pareja: asi ninguna persona se identifica con un solo dato.
export function buildRound() {
  const chosen = shuffle(NAMES).slice(0, 7);
  const used = chosen.slice(0, 6);
  const extra = chosen[6];

  const shirts = shuffle(SHIRTS).slice(0, 5).map((s) => s.id);
  const actions = shuffle(ACTIONS).slice(0, 5).map((a) => a.id);
  const shirtPlan = shuffle([...shirts, shirts[0]]);
  let actionPlan = shuffle([...actions, actions[0]]);

  let guard = 0;
  const clash = () => {
    const seen = new Set();
    for (let i = 0; i < 6; i += 1) {
      const key = `${shirtPlan[i]}|${actionPlan[i]}`;
      if (seen.has(key)) return true;
      seen.add(key);
    }
    return false;
  };
  while (clash() && guard < 40) {
    actionPlan = shuffle(actionPlan);
    guard += 1;
  }

  const people = used.map((entry, i) => ({
    slot: `p${i}`,
    name: entry.name,
    boy: entry.boy,
    shirt: shirtPlan[i],
    action: actionPlan[i],
    hair: pick(HAIR),
  }));

  const order = shuffle(people);
  const example = order[0];
  const questions = order.slice(1).map((person) => ({
    slot: person.slot,
    name: person.name,
    say: `Can you see the ${person.boy ? 'boy' : 'girl'} with the ${person.shirt} T-shirt? `
      + `${person.boy ? 'He' : 'She'}\u2019s ${ACTIONS.find((a) => a.id === person.action).phrase}. `
      + `That\u2019s ${person.name}.`,
  }));

  return {
    people,
    example,
    questions,
    // Un nombre de mas que no se usa, igual que en el examen.
    names: shuffle([...people.map((p) => p.name), extra.name]),
    extraName: extra.name,
  };
}

export const isMatch = (question, slot) => question.slot === slot;
