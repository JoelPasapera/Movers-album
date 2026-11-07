// @ts-check
// Escena de colorear (Listening, parte 5): un parque. Ocho objetos en tres
// familias (cometas, pelotas, pajaros) que solo se distinguen por donde estan.

import {
  sky, grass, tree, table, brickWall, house, kite, ball, bird,
} from './art/colouring.js';
import { withDefs } from './art/defs.js';

export const PARK = {
  id: 'park',
  title: 'In the park',
  writeTarget: { id: 'sign-text', word: 'shop', x: 672, y: 232, thing: 'the shop', where: 'above the door', short: 'above the door of the shop' },
  objects: [
    { id: 'kite-tree', family: 'kite', phrase: 'the kite in the tree' },
    { id: 'kite-sky', family: 'kite', phrase: 'the kite in the sky' },
    { id: 'kite-grass', family: 'kite', phrase: 'the kite on the grass' },
    { id: 'ball-tree', family: 'ball', phrase: 'the ball next to the tree' },
    { id: 'ball-table', family: 'ball', phrase: 'the ball under the table' },
    { id: 'ball-shop', family: 'ball', phrase: 'the ball in front of the shop' },
    { id: 'bird-roof', family: 'bird', phrase: 'the bird on the roof' },
    { id: 'bird-wall', family: 'bird', phrase: 'the bird on the wall' },
  ],
  svg: withDefs('park-l', (lights) => `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img" aria-label="A park with kites, balls, birds, a tree, a table, a wall and a shop">
  ${lights}
  ${sky('park')}
  <path d="M0 330 L0 300 Q 160 270 330 292 Q 520 316 800 282 L800 330 Z" fill="#D2EBC0"/>
  ${grass('park-grass', 'M0 470 L0 318 Q 200 296 400 312 Q 620 328 800 306 L800 470 Z', [[60, 360], [300, 352], [520, 372], [760, 352], [430, 440], [120, 430], [700, 440]])}
  ${grass('park-near', 'M0 470 L0 402 Q 260 386 470 410 Q 640 430 800 414 L800 470 Z', [], ['#A6DA8A', '#8CC870'])}
  ${tree(143, 330, 2.8)}
  ${table(278, 300, 126, 348)}
  ${brickWall(428, 258, 140, 60)}
  ${house({ x: 596, y: 196, w: 156, h: 126, peak: 132, roof: '#E3625A', door: [622, 252, 46, 70], doorColour: '#8A4FC8', glass: [688, 250, 48, 44], sign: [612, 214, 124, 30], textX: 674, textY: 236, id: 'park-shop' })}

  ${kite('kite-sky', 430, 84, 40, 12)}
  ${kite('kite-tree', 150, 186, 34, -8)}
  ${kite('kite-grass', 236, 392, 32, 66)}

  ${ball('ball-tree', 214, 344, 22)}
  ${ball('ball-table', 336, 336, 18)}
  ${ball('ball-shop', 606, 394, 24)}

  ${bird('bird-roof', 700, 154, 1)}
  ${bird('bird-wall', 512, 236, -1)}
</svg>`),
};
