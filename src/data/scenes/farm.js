// @ts-check
// Escena de colorear (Listening, parte 5): una granja. Ocho objetos en tres
// familias (vacas, patos, ovejas) que solo se distinguen por donde estan,
// asi que hay que escuchar la posicion, como en el examen.

import { INK } from './art/style.js';
import {
  sky, grass, tree, stoneWall, house, line, cow, duck, sheep,
} from './art/colouring.js';
import { withDefs } from './art/defs.js';

const lake = () => '<defs><linearGradient id="farm-lake" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7CCBEF"/><stop offset="1" stop-color="#4AA7DA"/></linearGradient></defs>'
  + `<ellipse cx="420" cy="428" rx="140" ry="38" fill="#9FD388" stroke="${INK}" stroke-width="2.5"/>`
  + `<ellipse cx="420" cy="424" rx="132" ry="34" fill="url(#farm-lake)" stroke="${INK}" stroke-width="3.8"/>`
  + line('M 330 418 q 12 -6 24 0 M 470 432 q 12 -6 24 0 M 390 440 q 10 -5 20 0', 3, '#E3F5FF');

export const FARM = {
  id: 'farm-colour',
  title: 'On the farm',
  writeTarget: { id: 'sign-text', word: 'farm', x: 675, y: 236, thing: 'the house', where: 'above the door', short: 'above the door of the house' },
  objects: [
    { id: 'cow-tree', family: 'cow', phrase: 'the cow under the tree' },
    { id: 'cow-house', family: 'cow', phrase: 'the cow next to the house' },
    { id: 'duck-lake', family: 'duck', phrase: 'the duck on the lake' },
    { id: 'duck-wall', family: 'duck', phrase: 'the duck on the wall' },
    { id: 'duck-roof', family: 'duck', phrase: 'the duck on the roof' },
    { id: 'sheep-wall', family: 'sheep', phrase: 'the sheep behind the wall' },
    { id: 'sheep-lake', family: 'sheep', phrase: 'the sheep next to the lake' },
    { id: 'sheep-house', family: 'sheep', phrase: 'the sheep in front of the house' },
  ],
  svg: withDefs('farm-l', (lights) => `
<svg viewBox="0 0 800 470" xmlns="http://www.w3.org/2000/svg" class="scene" role="img" aria-label="A farm with cows, ducks, sheep, a tree, a wall, a lake and a house">
  ${lights}
  ${sky('farm')}
  <path d="M0 320 L0 286 Q 180 258 380 280 Q 600 304 800 268 L800 320 Z" fill="#D2EBC0"/>
  ${grass('farm-grass', 'M0 470 L0 300 Q 220 278 420 296 Q 620 312 800 290 L800 470 Z', [[40, 350], [260, 360], [560, 352], [770, 340], [600, 450], [100, 450]])}
  ${grass('farm-near', 'M0 470 L0 392 Q 260 376 470 398 Q 640 416 800 402 L800 470 Z', [], ['#A6DA8A', '#8CC870'])}
  ${tree(133, 324, 2.97)}
  ${lake()}
  ${house({ x: 590, y: 200, w: 170, h: 130, peak: 126, roof: '#E3625A', door: [652, 262, 46, 68], doorColour: '#96602F', sign: [612, 214, 126, 30], textX: 675, textY: 236, id: 'farm-house' })}

  ${sheep('sheep-wall', 384, 284, 0.85)}
  ${stoneWall(250, 296, 196, 38)}

  ${cow('cow-tree', 150, 352, 1)}
  ${cow('cow-house', 512, 360, 0.85)}

  ${duck('duck-lake', 430, 414, 1)}
  ${duck('duck-wall', 292, 280, 0.9, -1)}
  ${duck('duck-roof', 706, 150, 0.85)}

  ${sheep('sheep-lake', 232, 404, 0.9)}
  ${sheep('sheep-house', 690, 392, 0.85)}
</svg>`),
};
