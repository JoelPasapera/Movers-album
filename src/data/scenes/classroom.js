// @ts-check
// Escena de colorear (Listening, parte 5): una clase. Ocho objetos en tres
// familias (libros, mochilas, lapices) que solo se distinguen por donde estan.
// La palabra para escribir va en la pizarra.

import { INK } from './art/style.js';
import {
  room, solid, line, window, table, chair, box, bookTop, bag, pencil,
} from './art/colouring.js';
import { withDefs } from './art/defs.js';

const board = () => `<rect x="528" y="62" width="232" height="166" rx="10" fill="#B9C2D4" stroke="${INK}" stroke-width="3.8"/>`
  + `<rect x="536" y="70" width="216" height="150" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="2.2"/>`
  + '<path d="M 548 82 L 600 82 L 556 132 Z" fill="#E9F2FB"/>'
  + solid('M 560 228 H 728 V 238 H 560 Z', '#B9C2D4', 2.6)
  + solid('M 590 226 h 26 v 6 h -26 Z', '#E5483B', 1.6)
  + solid('M 624 226 h 26 v 6 h -26 Z', '#2F80ED', 1.6)
  + `<text id="sign-text" x="644" y="158" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="46" fill="${INK}"></text>`;

const door = () => solid('M 30 352 V 92 Q 30 86 36 86 H 152 Q 158 86 158 92 V 352 Z', '#C98A48')
  + line('M 48 104 H 140 V 200 H 48 Z M 48 222 H 140 V 330 H 48 Z', 2.6, '#9C6535')
  + '<path d="M 128 86 H 152 Q 158 86 158 92 V 352 H 128 Z" fill="#15183A" fill-opacity="0.12"/>'
  + `<circle cx="140" cy="214" r="7" fill="#FFD23F" stroke="${INK}" stroke-width="2.2"/>`;

export const CLASSROOM = {
  id: 'classroom',
  title: 'In the classroom',
  writeTarget: { id: 'sign-text', word: 'school', x: 620, y: 150, thing: 'the board', where: 'on it', short: 'on the board' },
  objects: [
    { id: 'book-desk', family: 'book', phrase: 'the book on the desk' },
    { id: 'book-chair', family: 'book', phrase: 'the book under the chair' },
    { id: 'book-box', family: 'book', phrase: 'the book in the box' },
    { id: 'bag-desk', family: 'bag', phrase: 'the bag next to the desk' },
    { id: 'bag-door', family: 'bag', phrase: 'the bag next to the door' },
    { id: 'bag-window', family: 'bag', phrase: 'the bag under the window' },
    { id: 'pencil-desk', family: 'pencil', phrase: 'the pencil on the desk' },
    { id: 'pencil-floor', family: 'pencil', phrase: 'the pencil on the floor' },
  ],
  svg: withDefs('classroom-l', (lights) => `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img"
     aria-label="A classroom with books, bags, pencils, a desk, a chair, a box, a door and a window">
  ${lights}
  ${room('classroom', 352)}
  ${board()}
  ${door()}
  ${window(286, 96, 150, 118, 'classroom-window')}
  ${table(252, 272, 220, 352)}
  ${chair(560, 286, 86, 352, 230)}
  ${box(672, 286, 104, 66)}

  ${bookTop('book-desk', 320, 258, 1, -4)}
  ${bookTop('book-chair', 602, 336, 0.8, 6)}
  ${bookTop('book-box', 724, 300, 0.72, -8)}

  ${bag('bag-desk', 214, 348, 1)}
  ${bag('bag-door', 96, 344, 0.86)}
  ${bag('bag-window', 366, 348, 0.78)}

  ${pencil('pencil-desk', 408, 262, 1, -3)}
  ${pencil('pencil-floor', 486, 410, 0.9, 14)}
</svg>`),
};
