// Escena para la Parte 1 de Listening: seis personas haciendo cosas distintas.
// Se genera al azar, y a propósito se repite un color de camiseta y una acción:
// el handbook avisa de que un solo dato nunca basta para identificar a alguien.

import { PIECES } from './pieces.js';
import { withDefs, fx } from './art/defs.js';
import { seeded } from './art/style.js';
import { camera } from './art/camera.js';

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
  { id: 'bike', phrase: 'riding a bike', prop: 'bike' },
  { id: 'ball', phrase: 'playing with a ball', prop: 'ball', dx: 34, dy: 4, s: 0.95 },
  // Lo que se sujeta (held: su tamano) lo lleva la persona en la mano.
  { id: 'icecream', phrase: 'eating an ice cream', prop: 'icecream', arm: 'hold', held: 0.32 },
  { id: 'dog', phrase: 'playing with a dog', prop: 'dog', dx: 40, dy: 4, s: 0.8 },
  { id: 'hat', phrase: 'holding a hat', prop: 'hat', arm: 'hold', held: 0.5 },
  { id: 'flower', phrase: 'looking at the flowers', prop: 'flower', dx: 32, dy: 2, s: 1.1 },
];

const SPOTS = [
  { x: 78, y: 250 }, { x: 190, y: 258 }, { x: 302, y: 250 },
  { x: 414, y: 258 }, { x: 526, y: 250 }, { x: 630, y: 258 },
];

/** Tamano de las personas de la escena. */
const SIZE = 1.15;

/**
 * Lo que hace una persona, dibujado con ella: en bici va montada; lo que
 * sujeta, en su mano; lo demas, a su lado.
 * @param {{ x: number, y: number }} spot @param {typeof ACTIONS[number]} action @param {Record<string, string>} who
 */
function personDoing(spot, action, who) {
  if (action.id === 'bike') return PIECES.bike(spot.x, spot.y, SIZE * 1.08, { colour: '#E33B2E', rider: who });
  if (action.held) return PIECES.person(spot.x, spot.y, SIZE, { ...who, arm: action.arm, holds: { p: action.prop, s: action.held } });
  return PIECES[action.prop](spot.x + action.dx, spot.y + action.dy, action.s, { colour: action.id === 'ball' ? '#FFC523' : '#E33B2E' })
    + PIECES.person(spot.x, spot.y, SIZE, who);
}

export function renderCrowd(people) {
  return withDefs('crowd', (lights) => {
    const bodies = people.map((person, i) => {
      const action = ACTIONS.find((a) => a.id === person.action);
      const who = {
        who: person.boy === false ? 'girl' : 'boy',
        shirt: SHIRTS.find((s) => s.id === person.shirt).hex,
        hair: person.hair,
      };
      return `<g data-person="${person.slot}" tabindex="0" role="button"
      aria-label="person ${i + 1}">${personDoing(SPOTS[i], action, who)}</g>`;
    }).join('');

    return `
<svg viewBox="0 96 700 204" xmlns="http://www.w3.org/2000/svg" class="crowd"
     role="img" aria-label="Six people in a park doing different things">
  ${lights}
  <defs>
    <linearGradient id="crowd-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC0F0"/><stop offset="0.6" stop-color="#BFE2FA"/><stop offset="1" stop-color="#EEF8FF"/></linearGradient>
    <linearGradient id="crowd-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5E08F"/><stop offset="0.45" stop-color="#94CC6E"/><stop offset="1" stop-color="#6DAF4F"/></linearGradient>
  </defs>
  <rect width="700" height="300" fill="url(#crowd-sky)"/>
  <rect x="-10" y="184" width="720" height="40" fill="#FFFFFF" fill-opacity="0.4" filter="${fx('haze')}"/>
  <path d="M0 246 L0 222 Q 200 196 400 214 Q 560 228 700 206 L700 246 Z" fill="#A6CFA0" filter="${fx('blur')}"/>
  <path d="M0 246 L0 222 Q 200 196 400 214 Q 560 228 700 206 L700 246 Z" fill="#E8F3FF" fill-opacity="0.3"/>
  <path d="M0 300 L0 232 Q 350 218 700 230 L700 300 Z" fill="url(#crowd-grass)"/>
  <path d="M0 300 L0 232 Q 350 218 700 230 L700 300 Z" fill="#2F6A22" fill-opacity="0.38" filter="${fx('grassy')}"/>
  <path d="M0 300 L0 232 Q 350 218 700 230 L700 300 Z" fill="#E6F7C8" fill-opacity="0.16" filter="${fx('grain2')}"/>
  <g filter="${fx('blur2')}"><ellipse cx="180" cy="262" rx="70" ry="6" fill="#3F7E2E" fill-opacity="0.18"/><ellipse cx="520" cy="250" rx="80" ry="5" fill="#E2F6C4" fill-opacity="0.25"/><ellipse cx="610" cy="284" rx="60" ry="7" fill="#3F7E2E" fill-opacity="0.16"/></g>
  <path d="M0 232 Q 350 218 700 230" fill="none" stroke="#E2F2CF" stroke-width="3" stroke-opacity="0.55" filter="${fx('blur')}"/>
  ${grassBlades()}
  <path d="M 120 300 Q 300 262 420 300 Z" fill="#DCC08A" fill-opacity="0.8"/>
  <path d="M 120 300 Q 300 262 420 300 Z" fill="#7A5A2A" fill-opacity="0.35" filter="${fx('grain')}"/>
  <path d="M 120 300 Q 300 262 420 300" fill="none" stroke="#6E9A4A" stroke-width="2" stroke-opacity="0.35" filter="${fx('blur')}"/>
  ${PIECES.tree(46, 236, 1.1)}
  ${PIECES.tree(668, 240, 0.9)}
  ${bodies}
  ${camera({ y: 96, w: 700, h: 204, large: true })}
</svg>`;
  });
}

/** Briznas de hierba repartidas por el prado (siempre las mismas). */
function grassBlades() {
  const rnd = seeded(23);
  let dark = '';
  let light = '';
  for (let i = 0; i < 260; i += 1) {
    const x = rnd() * 700;
    const t = rnd();
    const y = 236 + t * 62;
    const h = 2.4 + t * 4;
    const lean = (rnd() - 0.5) * 2.4;
    const blade = `M ${x.toFixed(1)} ${y.toFixed(1)} q ${(lean * 0.4).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)} `;
    if (rnd() < 0.55) dark += blade; else light += blade;
  }
  return `<path d="${dark}" fill="none" stroke="#5E9E45" stroke-width="0.7" stroke-linecap="round"/>`
    + `<path d="${light}" fill="none" stroke="#C9EBA8" stroke-width="0.6" stroke-linecap="round"/>`;
}
