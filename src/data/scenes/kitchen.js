// @ts-check
// Escena de colorear (Listening, parte 5): una cocina. Ocho objetos en tres
// familias (tazas, manzanas, gatos) que solo se distinguen por donde estan.

import { INK } from './art/style.js';
import {
  room, solid, line, window, table, chair, floorShadow, cup, apple, cat,
} from './art/colouring.js';
import { withDefs } from './art/defs.js';

// El armario: a la izquierda abierto, con su balda (ahi esta la taza), a la
// derecha cerrado.
const cupboard = () => solid('M 44 66 Q 44 60 50 60 H 260 Q 266 60 266 66 V 204 Q 266 210 260 210 H 50 Q 44 210 44 204 Z', '#C98A48')
  + solid('M 54 70 H 150 V 200 H 54 Z', '#8E5A2E', 2.6)
  + '<path d="M 54 70 H 150 V 84 H 54 Z" fill="#15183A" fill-opacity="0.2"/>'
  + solid('M 54 128 H 150 V 136 H 54 Z', '#B9793E', 2)
  + solid('M 160 70 H 256 V 200 H 160 Z', '#D49558', 2.6)
  + line('M 170 82 H 246 V 188 H 170 Z', 2, '#9C6535')
  + `<circle cx="170" cy="150" r="6" fill="#FFD23F" stroke="${INK}" stroke-width="2"/>`
  + '<path d="M 236 70 H 256 V 200 H 236 Z" fill="#15183A" fill-opacity="0.1"/>';

const plate = () => `<ellipse cx="322" cy="260" rx="42" ry="12" fill="#FFFFFF" stroke="${INK}" stroke-width="3.3"/>`
  + '<ellipse cx="322" cy="259" rx="27" ry="6.6" fill="#EEF3F9" stroke="#C3CEDE" stroke-width="1.7"/>';

const bowl = () => solid('M 390 244 Q 390 266 424 266 Q 458 266 458 244 Z', '#FFE7B8')
  + line('M 394 252 Q 424 260 454 252', 2, '#E2B979')
  + `<ellipse cx="424" cy="244" rx="34" ry="5" fill="#FFF3D6" stroke="${INK}" stroke-width="2.5"/>`;

const plaque = () => `<rect x="596" y="196" width="144" height="34" rx="6" fill="#FFFFFF" stroke="${INK}" stroke-width="3.3"/>`
  + `<text id="sign-text" x="668" y="222" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="25" fill="${INK}"></text>`;

export const KITCHEN = {
  id: 'kitchen-colour',
  title: 'In the kitchen',
  writeTarget: { id: 'sign-text', word: 'cake', x: 660, y: 128, thing: 'the window', where: 'under it', short: 'under the window' },
  objects: [
    { id: 'cup-table', family: 'cup', phrase: 'the cup on the table' },
    { id: 'cup-cupboard', family: 'cup', phrase: 'the cup in the cupboard' },
    { id: 'cup-floor', family: 'cup', phrase: 'the cup on the floor' },
    { id: 'apple-plate', family: 'apple', phrase: 'the apple on the plate' },
    { id: 'apple-bowl', family: 'apple', phrase: 'the apple in the bowl' },
    { id: 'apple-chair', family: 'apple', phrase: 'the apple under the chair' },
    { id: 'cat-table', family: 'cat', phrase: 'the cat under the table' },
    { id: 'cat-chair', family: 'cat', phrase: 'the cat next to the chair' },
  ],
  svg: withDefs('kitchen-l', (lights) => `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img"
     aria-label="A kitchen with cups, apples, cats, a table, a chair, a cupboard, a plate and a window">
  ${lights}
  ${room('kitchen', 344, '#E2F3EA')}
  ${cupboard()}
  ${window(586, 66, 164, 120, 'kitchen-window')}
  ${plaque()}
  ${table(256, 266, 252, 344)}
  ${plate()}
  ${bowl()}
  ${chair(574, 290, 94, 344, 232)}
  ${floorShadow(372, 352, 34)}

  ${cup('cup-table', 384, 258, 0.92)}
  ${cup('cup-cupboard', 100, 128, 0.8)}
  ${cup('cup-floor', 172, 406, 0.86)}

  ${apple('apple-plate', 322, 246, 0.9)}
  ${apple('apple-bowl', 424, 244, 0.8)}
  ${apple('apple-chair', 621, 327, 0.8)}

  ${cat('cat-table', 372, 336, 0.9, 1)}
  ${cat('cat-chair', 700, 330, 0.8, -1)}
</svg>`),
};
