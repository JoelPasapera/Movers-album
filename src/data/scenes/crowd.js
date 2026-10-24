// Escena para la Parte 1 de Listening: seis personas haciendo cosas distintas.
// Se genera al azar, y a propósito se repite un color de camiseta y una acción:
// el handbook avisa de que un solo dato nunca basta para identificar a alguien.

import { PIECES } from './pieces.js';

export const NAMES = [
  { name: 'Jim', boy: true }, { name: 'Fred', boy: true }, { name: 'Paul', boy: true },
  { name: 'Jack', boy: true }, { name: 'Peter', boy: true }, { name: 'Charlie', boy: true },
  { name: 'Sally', boy: false }, { name: 'Daisy', boy: false }, { name: 'Vicky', boy: false },
  { name: 'Lily', boy: false }, { name: 'Mary', boy: false }, { name: 'Clare', boy: false },
];

export const SHIRTS = [
  { id: 'red', hex: '#E33B2E' },
  { id: 'blue', hex: '#1F7BE0' },
  { id: 'green', hex: '#2BA84A' },
  { id: 'yellow', hex: '#FFC523' },
  { id: 'purple', hex: '#8A4FC8' },
  { id: 'pink', hex: '#FF6EA6' },
];

export const ACTIONS = [
  { id: 'bike', phrase: 'riding a bike', prop: 'bike', dx: 0, dy: 6, s: 0.95 },
  { id: 'ball', phrase: 'playing with a ball', prop: 'ball', dx: 34, dy: 4, s: 0.95 },
  { id: 'icecream', phrase: 'eating an ice cream', prop: 'icecream', dx: 30, dy: -14, s: 0.9 },
  { id: 'dog', phrase: 'playing with a dog', prop: 'dog', dx: 40, dy: 4, s: 0.8 },
  { id: 'hat', phrase: 'holding a hat', prop: 'hat', dx: 30, dy: -18, s: 0.8 },
  { id: 'flower', phrase: 'looking at the flowers', prop: 'flower', dx: 32, dy: 2, s: 1.1 },
];

const SPOTS = [
  { x: 78, y: 250 }, { x: 190, y: 258 }, { x: 302, y: 250 },
  { x: 414, y: 258 }, { x: 526, y: 250 }, { x: 630, y: 258 },
];

export function renderCrowd(people) {
  const bodies = people.map((person, i) => {
    const spot = SPOTS[i];
    const action = ACTIONS.find((a) => a.id === person.action);
    const prop = PIECES[action.prop](spot.x + action.dx, spot.y + action.dy, action.s,
      { colour: action.id === 'ball' ? '#FFC523' : '#E33B2E' });
    const body = PIECES.person(spot.x, spot.y, 1.15, {
      shirt: SHIRTS.find((s) => s.id === person.shirt).hex,
      hair: person.hair,
    });
    return `<g data-person="${person.slot}" tabindex="0" role="button"
      aria-label="person ${i + 1}">${prop}${body}</g>`;
  }).join('');

  return `
<svg viewBox="0 0 700 300" xmlns="http://www.w3.org/2000/svg" class="crowd"
     role="img" aria-label="Six people in a park doing different things">
  <rect width="700" height="300" fill="#DFF0FF"/>
  <path d="M0 300 L0 232 Q 350 218 700 230 L700 300 Z" fill="#BFE6A8"/>
  ${PIECES.tree(46, 236, 1.1)}
  ${PIECES.tree(668, 240, 0.9)}
  ${bodies}
</svg>`;
}
