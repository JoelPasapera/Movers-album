// @ts-check
// Find the differences (Speaking, parte 1): una sola escena que se dibuja dos
// veces con valores distintos. Cada ranura (slot) tiene sus variantes y la
// frase modelo que el alumno tiene que decir: "Here the ball is red, but here
// it is blue." Se dibuja con las mismas piezas que el resto de la app.

import { PIECES } from './pieces.js';
import { withDefs, fx } from './art/defs.js';
import { seeded } from './art/style.js';
import { camera } from './art/camera.js';

export const SLOTS = [
  {
    id: 'sky',
    values: ['sunny', 'cloudy'],
    sentence: (a, b) => `Here it is ${a}, but here it is ${b}.`,
  },
  {
    id: 'ball',
    values: ['red', 'blue', 'green', 'yellow'],
    sentence: (a, b) => `Here the ball is ${a}, but here it is ${b}.`,
  },
  {
    id: 'kite',
    values: ['purple', 'orange', 'pink', 'red'],
    sentence: (a, b) => `Here the kite is ${a}, but here it is ${b}.`,
  },
  {
    id: 'flowers',
    values: ['three', 'four', 'five'],
    sentence: (a, b) => `Here there are ${a} flowers, but here there are ${b}.`,
  },
  {
    id: 'cat',
    values: ['on the box', 'next to the box'],
    sentence: (a, b) => `Here the cat is ${a}, but here it is ${b}.`,
  },
  {
    id: 'bird',
    values: ['in the tree', 'in the sky'],
    sentence: (a, b) => `Here the bird is ${a}, but here it is ${b}.`,
  },
];

const HEX = {
  red: '#E33B2E', blue: '#1F7BE0', green: '#2BA84A', yellow: '#FFC523',
  purple: '#8A4FC8', orange: '#F5811F', pink: '#FF6EA6',
};

const COUNT = { three: 3, four: 4, five: 5 };

/** Las dos mitades se dibujan a la vez: cada una con sus propios degradados. */
let drawn = 0;

/** Briznas de hierba (siempre las mismas). @param {number} seed */
function blades(seed) {
  const rnd = seeded(seed);
  let dark = '';
  let light = '';
  for (let i = 0; i < 150; i += 1) {
    const x = rnd() * 360;
    const t = rnd();
    const y = 212 + t * 86;
    const h = 2 + t * 4;
    const lean = (rnd() - 0.5) * 2.2;
    const blade = `M ${x.toFixed(1)} ${y.toFixed(1)} q ${(lean * 0.4).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${lean.toFixed(1)} ${(-h).toFixed(1)} `;
    if (rnd() < 0.55) dark += blade; else light += blade;
  }
  return `<path d="${dark}" fill="none" stroke="#5E9E45" stroke-width="0.7" stroke-linecap="round"/>`
    + `<path d="${light}" fill="none" stroke="#C9EBA8" stroke-width="0.6" stroke-linecap="round"/>`;
}

/** @param {Record<string, string>} config */
export function renderScene(config) {
  drawn += 1;
  const id = `diff${drawn}`;
  return withDefs(id, (lights) => {
    const flowers = Array.from({ length: COUNT[config.flowers] }, (unused, i) => PIECES.flower(30 + i * 52, 298, 1.3)).join('');
    const sky = config.sky === 'sunny' ? PIECES.sun(296, 52, 1.6) : PIECES.cloud(296, 78, 1.9);
    const cat = config.cat === 'on the box' ? PIECES.kitten(252, 220, 1.6) : PIECES.kitten(186, 268, 1.6);
    const bird = config.bird === 'in the tree' ? PIECES.bird(86, 96, 1.45) : PIECES.bird(206, 62, 1.45);

    return `
<svg viewBox="0 0 360 300" xmlns="http://www.w3.org/2000/svg" class="diff-scene" role="img" aria-label="A garden with a tree, a box, a cat, a bird, a ball, a kite and some flowers">
  ${lights}
  <defs>
    <linearGradient id="${id}-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7FC0F0"/><stop offset="0.6" stop-color="#BFE2FA"/><stop offset="1" stop-color="#EEF8FF"/></linearGradient>
    <linearGradient id="${id}-grass" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#B5E08F"/><stop offset="0.45" stop-color="#94CC6E"/><stop offset="1" stop-color="#6DAF4F"/></linearGradient>
  </defs>
  <rect x="0" y="0" width="360" height="300" fill="url(#${id}-sky)"/>
  <rect x="-10" y="168" width="380" height="36" fill="#FFFFFF" fill-opacity="0.4" filter="${fx('haze')}"/>
  <path d="M0 220 L0 200 Q 120 182 240 194 Q 300 200 360 190 L360 220 Z" fill="#A6CFA0" filter="${fx('blur')}"/>
  <path d="M0 220 L0 200 Q 120 182 240 194 Q 300 200 360 190 L360 220 Z" fill="#E8F3FF" fill-opacity="0.3"/>
  <path d="M0 300 L0 208 Q 180 190 360 206 L360 300 Z" fill="url(#${id}-grass)"/>
  <path d="M0 300 L0 208 Q 180 190 360 206 L360 300 Z" fill="#2F6A22" fill-opacity="0.38" filter="${fx('grassy')}"/>
  <path d="M0 300 L0 208 Q 180 190 360 206 L360 300 Z" fill="#E6F7C8" fill-opacity="0.16" filter="${fx('grain2')}"/>
  <g filter="${fx('blur2')}"><ellipse cx="120" cy="240" rx="60" ry="6" fill="#3F7E2E" fill-opacity="0.18"/><ellipse cx="290" cy="232" rx="50" ry="5" fill="#E2F6C4" fill-opacity="0.25"/><ellipse cx="200" cy="284" rx="70" ry="8" fill="#3F7E2E" fill-opacity="0.15"/></g>
  <path d="M0 208 Q 180 190 360 206" fill="none" stroke="#E2F2CF" stroke-width="3" stroke-opacity="0.55" filter="${fx('blur')}"/>
  ${blades(31)}
  ${PIECES.tree(62, 212, 2)}
  ${PIECES.box(261, 264, 1.85)}
  <g data-slot="sky">${sky}</g>
  <g data-slot="kite">${PIECES.kite(150, 112.7, 1.37, { colour: HEX[config.kite] })}</g>
  <g data-slot="ball">${PIECES.ball(104, 269, 1.9, { colour: HEX[config.ball] })}</g>
  <g data-slot="flowers">${flowers}</g>
  <g data-slot="cat">${cat}</g>
  <g data-slot="bird">${bird}</g>
  ${camera({ w: 360, h: 300, large: true })}
</svg>`;
  });
}
