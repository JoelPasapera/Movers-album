// @ts-check
// Escena de colorear (Listening, parte 5): un dormitorio. Ocho objetos en
// tres familias (libros, ositos, calcetines) que solo se distinguen por donde
// estan. El letrero para escribir esta en la caja de juguetes.

import { INK } from './art/style.js';
import {
  room, solid, line, floorShadow, window, chair, bookSide, teddy, sock,
} from './art/colouring.js';
import { withDefs } from './art/defs.js';

const sill = () => solid('M 78 189 Q 78 186 81 186 H 259 Q 262 186 262 189 V 197 Q 262 200 259 200 H 81 Q 78 200 78 197 Z', '#FFFFFF');

const bed = () => floorShadow(624, 368, 140)
  + solid('M 736 196 Q 736 188 744 188 H 754 Q 762 188 762 196 V 362 H 736 Z', '#96602F')
  + '<path d="M 752 190 Q 762 190 762 198 V 362 H 752 Z" fill="#15183A" fill-opacity="0.16"/>'
  + solid('M 508 336 H 520 V 368 H 508 Z', '#7A4E2A', 2.6)
  + solid('M 724 336 H 736 V 368 H 724 Z', '#7A4E2A', 2.6)
  + solid('M 500 276 Q 500 270 506 270 H 744 Q 750 270 750 276 V 304 H 500 Z', '#FFFFFF')
  + solid('M 494 304 Q 494 298 500 298 H 744 Q 752 298 752 304 V 334 Q 752 340 746 340 H 500 Q 494 340 494 334 Z', '#2F80ED')
  + line('M 494 312 Q 620 318 752 310', 2.4, '#1C5FB8')
  + '<path d="M 500 326 H 746 Q 752 326 752 332 V 334 Q 752 340 746 340 H 500 Q 494 340 494 334 Z" fill="#15183A" fill-opacity="0.15"/>'
  + `<ellipse cx="700" cy="262" rx="34" ry="14" fill="#FFFFFF" stroke="${INK}" stroke-width="3.8"/>`
  + line('M 676 262 q 24 6 48 0', 2, '#C9D3E2');

const toyBox = () => floorShadow(480, 452, 80)
  + solid('M 410 384 H 550 V 446 Q 550 452 544 452 H 416 Q 410 452 410 446 Z', '#C98A48')
  + solid('M 404 372 Q 404 366 410 366 H 550 Q 556 366 556 372 V 384 H 404 Z', '#D9A06A')
  + '<path d="M 520 384 H 550 V 446 Q 550 452 544 452 H 520 Z" fill="#15183A" fill-opacity="0.12"/>'
  + `<rect x="430" y="394" width="100" height="30" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3.3"/>`
  + `<text id="sign-text" x="480" y="416" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="21" fill="${INK}"></text>`;

const rug = () => '<ellipse cx="250" cy="430" rx="140" ry="26" fill="#FFD9A8" fill-opacity="0.7"/>'
  + '<ellipse cx="250" cy="430" rx="112" ry="18" fill="none" stroke="#F5B97A" stroke-width="2.5"/>';

export const BEDROOM = {
  id: 'bedroom-colour',
  title: 'In the bedroom',
  writeTarget: { id: 'sign-text', word: 'toys', x: 480, y: 416, thing: 'the toy box', where: 'on it', short: 'on the toy box' },
  objects: [
    { id: 'book-bed', family: 'book', phrase: 'the book on the bed' },
    { id: 'book-chair', family: 'book', phrase: 'the book on the chair' },
    { id: 'book-floor', family: 'book', phrase: 'the book on the floor' },
    { id: 'teddy-window', family: 'teddy', phrase: 'the teddy in the window' },
    { id: 'teddy-bed', family: 'teddy', phrase: 'the teddy on the bed' },
    { id: 'sock-bed', family: 'sock', phrase: 'the sock under the bed' },
    { id: 'sock-box', family: 'sock', phrase: 'the sock on the box' },
    { id: 'sock-chair', family: 'sock', phrase: 'the sock under the chair' },
  ],
  svg: withDefs('bedroom-l', (lights) => `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img" aria-label="A bedroom with books, teddies, socks, a bed, a chair, a toy box and a window">
  ${lights}
  ${room('bedroom', 338, '#FBEBD9')}
  ${rug()}
  ${window(90, 62, 160, 124, 'bedroom-window')}
  ${sill()}
  ${chair(300, 300, 96, 358, 222, '#8E55D0')}
  ${bed()}
  ${toyBox()}

  ${bookSide('book-bed', 580, 262, 0.9, -6)}
  ${bookSide('book-chair', 350, 294, 0.8, 4)}
  ${bookSide('book-floor', 200, 420, 1, 10)}

  ${teddy('teddy-window', 170, 182, 0.95)}
  ${teddy('teddy-bed', 660, 262, 0.9)}

  ${sock('sock-bed', 610, 372, 0.85, -10)}
  ${sock('sock-box', 512, 362, 0.7, 90)}
  ${sock('sock-chair', 344, 372, 0.8, 0)}
</svg>`),
};
