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
  const questions = order.slice(1).map((person) => {
    const lines = dialogueFor(person, people);
    return {
      slot: person.slot,
      name: person.name,
      lines,
      say: lines.map((l) => l.text).join(' '),
    };
  });

  return {
    people,
    example,
    questions,
    // Un nombre de mas que no se usa, igual que en el examen.
    names: shuffle([...people.map((p) => p.name), extra.name]),
    extraName: extra.name,
  };
}

// Como en el examen: el adulto pregunta, el nino contesta con un dato, el
// adulto se confunde con OTRA persona del dibujo que comparte ese dato, y el
// nino rectifica con el segundo dato. Hay que escuchar hasta el final.
export function dialogueFor(person, people) {
  const he = person.boy ? 'he' : 'she';
  const kid = person.boy ? 'boy' : 'girl';
  const action = ACTIONS.find((a) => a.id === person.action).phrase;
  const sameShirt = people.find((o) => o !== person && o.shirt === person.shirt);
  const sameAction = people.find((o) => o !== person && o.action === person.action);
  const lines = [{ who: 'adult', text: `Which one is ${person.name}?` }];
  if (sameShirt) {
    lines.push({ who: 'child', text: `${person.name}\u2019s the ${kid} with the ${person.shirt} T-shirt.` });
    lines.push({ who: 'adult', text: `The one who\u2019s ${ACTIONS.find((a) => a.id === sameShirt.action).phrase}?` });
    lines.push({ who: 'child', text: `No, ${he}\u2019s the one who\u2019s ${action}. That\u2019s ${person.name}.` });
  } else if (sameAction) {
    lines.push({ who: 'child', text: `${person.name}\u2019s ${action}.` });
    lines.push({ who: 'adult', text: `The ${kid} with the ${sameAction.shirt} T-shirt?` });
    lines.push({ who: 'child', text: `No, ${he}\u2019s wearing a ${person.shirt} T-shirt. That\u2019s ${person.name}.` });
  } else {
    lines.push({ who: 'child', text: `${person.name}\u2019s the ${kid} with the ${person.shirt} T-shirt. ${person.boy ? 'He' : 'She'}\u2019s ${action}.` });
    lines.push({ who: 'adult', text: `Oh yes, I can see ${person.name}.` });
  }
  return lines;
}

export const isMatch = (question, slot) => question.slot === slot;
