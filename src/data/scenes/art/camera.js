// @ts-check
// El acabado de camara de una escena: lo que hace que un dibujo se lea como
// una foto. Va encima de todo, no se toca (los toques llegan a lo de debajo) y
// es igual en las dos fotos de Find the differences, asi que no crea
// diferencias.
//
//   - la luz calida del sol, un velo naranja casi invisible;
//   - el viñeteado de la lente: las esquinas un poco mas oscuras;
//   - el grano del sensor: ruido gris muy fino y muy tenue.
//
// Se pinta dentro de withDefs, como cualquier dibujo (usa grad y fx).

import { grad, fx } from './defs.js';

/**
 * El acabado de camara de un lienzo.
 * @param {{ x?: number, y?: number, w: number, h: number, large?: boolean }} o
 *   el rectangulo que se ve (el viewBox) y si la escena es grande (mas de 300
 *   de ancho: el grano se hace con filmL para que tenga el mismo tamano en
 *   pantalla)
 */
export function camera(o) {
  const x = o.x ?? 0;
  const y = o.y ?? 0;
  const box = `x="${x}" y="${y}" width="${o.w}" height="${o.h}"`;
  return '<g class="camera" pointer-events="none" aria-hidden="true">'
    + `<rect ${box} fill="#FFA048" fill-opacity="0.035"/>`
    + `<rect ${box} fill="${grad('vignette')}"/>`
    + `<rect ${box} fill="#808080" filter="${fx(o.large ? 'filmL' : 'film')}"/>`
    + '</g>';
}
