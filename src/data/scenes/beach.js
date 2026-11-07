// @ts-check
// Escena de colorear (Listening, parte 5): la playa. Ocho objetos en tres
// familias (barcos, conchas, peces) que solo se distinguen por donde estan.

import { INK, seeded } from './art/style.js';
import {
  sky, solid, line, floorShadow, house, boat, shell, fish,
} from './art/colouring.js';
import { withDefs, fx } from './art/defs.js';
import { PIECES } from './pieces.js';

const island = () => solid('M 92 194 Q 164 152 236 194 Z', '#7ED07A')
  + solid('M 84 196 Q 164 176 244 196 Q 164 204 84 196 Z', '#F2D79B', 2.6)
  + solid('M 158 192 Q 156 160 168 138 L 176 140 Q 166 162 168 192 Z', '#96602F', 2.6)
  + solid('M 172 140 Q 140 118 108 136 Q 138 128 170 146 Z', '#3FA85F', 3)
  + solid('M 172 140 Q 206 116 236 136 Q 204 128 174 146 Z', '#3FA85F', 3)
  + solid('M 172 138 Q 160 112 138 108 Q 156 122 168 142 Z', '#4FBF6E', 3)
  + solid('M 172 138 Q 190 110 214 110 Q 194 124 176 142 Z', '#4FBF6E', 3)
  + `<circle cx="166" cy="146" r="5" fill="#8D5B33" stroke="${INK}" stroke-width="1.7"/><circle cx="176" cy="148" r="5" fill="#8D5B33" stroke="${INK}" stroke-width="1.7"/>`;

const rock = () => floorShadow(312, 418, 56)
  + solid('M 262 418 Q 270 382 300 384 Q 314 364 340 372 Q 360 382 362 418 Z', '#A3ABBA')
  + '<path d="M 330 374 Q 352 384 360 418 L 336 418 Q 342 396 330 374 Z" fill="#15183A" fill-opacity="0.14"/>'
  + line('M 290 400 l 12 -6 M 318 392 l 8 -4', 2.4, '#7C8597');

const towel = () => `<g transform="rotate(-5 470 412)">${floorShadow(470, 440, 70)}`
  + solid('M 404 392 Q 404 386 410 386 H 530 Q 536 386 536 392 V 432 Q 536 438 530 438 H 410 Q 404 438 404 432 Z', '#FFFFFF')
  + '<path d="M 406 398 H 534 V 410 H 406 Z M 406 418 H 534 V 430 H 406 Z" fill="#FF7FAE"/>'
  + line('M 404 392 Q 404 386 410 386 H 530 Q 536 386 536 392 V 432 Q 536 438 530 438 H 410 Q 404 438 404 432 Z', 4.6)
  + line('M 396 392 h 8 M 396 400 h 8 M 396 408 h 8 M 396 416 h 8 M 396 424 h 8 M 396 432 h 8', 2)
  + '</g>';

/** Ondas y brillos del mar (siempre los mismos). */
function seaTexture() {
  const rnd = seeded(77);
  let waves = '';
  let glints = '';
  for (let i = 0; i < 34; i += 1) {
    const x = rnd() * 780;
    const t = rnd();
    const y = 198 + t * 130;
    const w = 10 + t * 22;
    waves += `M ${x.toFixed(1)} ${y.toFixed(1)} q ${(w / 4).toFixed(1)} ${(-1.6 - t * 2).toFixed(1)} ${(w / 2).toFixed(1)} 0 q ${(w / 4).toFixed(1)} ${(1.6 + t * 2).toFixed(1)} ${(w / 2).toFixed(1)} 0 `;
    if (i % 3 === 0) glints += `M ${(x + 4).toFixed(1)} ${(y + 4).toFixed(1)} h ${(w * 0.6).toFixed(1)} `;
  }
  return line(waves, 1.4, '#BFE6FA') + line(glints, 1.6, '#FFFFFF')
    + `<rect y="190" width="800" height="150" fill="#0E4A7A" fill-opacity="0.18" filter="${fx('grainL')}"/>`;
}

/** Granos de arena y la marca de las olas (siempre los mismos). */
function sandTexture() {
  const rnd = seeded(91);
  let grains = '';
  for (let i = 0; i < 150; i += 1) {
    const x = rnd() * 800;
    const y = 352 + rnd() * 116;
    grains += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(0.7 + rnd() * 1).toFixed(1)}" fill="${rnd() < 0.6 ? '#D2AA62' : '#FFF4D6'}"/>`;
  }
  return `<path d="M0 330 Q 190 306 380 328 Q 590 352 800 322 L800 470 L0 470 Z" fill="#8A6428" fill-opacity="0.32" filter="${fx('grainL')}"/>`
    + grains + line('M 20 380 q 30 -4 60 0 q 30 4 60 0 M 300 372 q 30 -4 60 0 q 30 4 60 0 M 520 430 q 30 -4 60 0 q 30 4 60 0', 1.4, '#DDB86E');
}

export const BEACH = {
  id: 'beach',
  title: 'At the beach',
  writeTarget: { id: 'sign-text', word: 'drinks', x: 700, y: 300, thing: 'the little house', where: 'above the door', short: 'above the door of the little house' },
  objects: [
    { id: 'boat-sea', family: 'boat', phrase: 'the boat in the sea' },
    { id: 'boat-island', family: 'boat', phrase: 'the boat next to the island' },
    { id: 'boat-sand', family: 'boat', phrase: 'the boat on the sand' },
    { id: 'shell-rock', family: 'shell', phrase: 'the shell next to the rock' },
    { id: 'shell-towel', family: 'shell', phrase: 'the shell on the towel' },
    { id: 'shell-water', family: 'shell', phrase: 'the shell in the water' },
    { id: 'fish-island', family: 'fish', phrase: 'the fish in front of the island' },
    { id: 'fish-boat', family: 'fish', phrase: 'the fish under the boat' },
  ],
  svg: withDefs('beach-l', (lights) => `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img" aria-label="A beach with boats, shells, fish, an island, a rock, a towel and a drinks hut">
  ${lights}
  ${sky('beach')}
  ${PIECES.sun(712, 66, 2.6)}
  <defs><linearGradient id="beach-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5BB6E6"/><stop offset="1" stop-color="#3C9AD2"/></linearGradient>
  <linearGradient id="beach-sand" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8E4B0"/><stop offset="1" stop-color="#EFD08E"/></linearGradient></defs>
  <rect x="0" y="190" width="800" height="150" fill="url(#beach-sea)"/>
  <rect x="0" y="190" width="800" height="14" fill="#FFFFFF" fill-opacity="0.22"/>
  ${seaTexture()}
  <line x1="0" y1="190" x2="800" y2="190" stroke="#3483B8" stroke-width="2.5"/>
  ${line('M40 232 q 22 -14 44 0 t 44 0 M560 250 q 22 -14 44 0 t 44 0 M300 312 q 22 -14 44 0 t 44 0 M640 300 q 14 -9 28 0', 4, '#E3F5FF')}
  <path d="M0 336 Q 190 312 380 334 Q 590 358 800 328 L800 342 Q 590 372 380 348 Q 190 326 0 350 Z" fill="#E2C17E"/>
  <path d="M0 330 Q 190 306 380 328 Q 590 352 800 322 L800 470 L0 470 Z" fill="url(#beach-sand)"/>
  <path d="M0 330 Q 190 306 380 328 Q 590 352 800 322" fill="none" stroke="#FFFFFF" stroke-width="4.1" stroke-opacity="0.8"/>
  <path d="M0 400 Q 240 384 460 406 Q 640 424 800 402 L800 470 L0 470 Z" fill="#ECCB85"/>
  <g fill="#D7B36D"><circle cx="60" cy="372" r="2.4"/><circle cx="210" cy="356" r="2.4"/><circle cx="600" cy="392" r="2.4"/><circle cx="760" cy="440" r="2.4"/><circle cx="560" cy="452" r="2.4"/><circle cx="260" cy="452" r="2.4"/></g>
  ${sandTexture()}

  ${island()}
  ${rock()}
  ${towel()}
  ${house({ x: 626, y: 300, w: 150, h: 104, peak: 242, roof: '#3FA85F', door: [650, 334, 42, 70], doorColour: '#8A4FC8', glass: [710, 332, 50, 42], sign: [640, 286, 122, 30], textX: 701, textY: 308, id: 'beach-hut' })}

  ${boat('boat-sea', 470, 258, 26, -4)}
  ${boat('boat-island', 232, 214, 17, 3)}
  ${boat('boat-sand', 122, 412, 24, -6)}

  ${shell('shell-rock', 344, 434, 20)}
  ${shell('shell-towel', 470, 396, 16)}
  ${shell('shell-water', 574, 316, 18)}

  ${fish('fish-island', 300, 272, 1)}
  ${fish('fish-boat', 486, 306, -1)}
</svg>`),
};
