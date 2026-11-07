// @ts-check
// Piezas sueltas que se combinan para dibujar cada vineta (Parte 6, Yes or
// no, Let's talk!, las historias de Reading 5 y de Speaking 2, Match the
// names). Cada pieza se dibuja alrededor del origen, con los pies en y = 0, y
// se coloca con translate(x, y) scale(s).
//
// Los dibujos estan en art/: el estilo comun (style.js), las personas
// (people.js), los animales (animals.js), las cosas (things.js) y los fondos
// (backgrounds.js). Aqui solo se juntan y se pinta la vineta entera.

import { place, round } from './art/style.js';
import { withDefs, fx, uid } from './art/defs.js';
import { person, rightHand } from './art/people.js';
import { ANIMALS } from './art/animals.js';
import { THINGS, riverWater } from './art/things.js';
import { BACKGROUNDS, WATER } from './art/backgrounds.js';
import { camera } from './art/camera.js';

export { BACKGROUNDS };

/**
 * @typedef {Record<string, any>} PieceOptions
 * @typedef {(x: number, y: number, s?: number, o?: PieceOptions) => string} Piece
 */

/** @param {(o: PieceOptions) => string} draw @returns {Piece} */
const piece = (draw) => (x, y, s = 1, o = {}) => place(x, y, s, draw(o));

/**
 * Por donde se coge cada cosa que una persona puede llevar en la mano (en las
 * unidades de la pieza): el cucurucho, el borde del ala, el lado de la camara,
 * el asa de la bolsa, la punta de la entrada.
 * @type {Record<string, [number, number]>}
 */
export const GRIPS = { icecream: [0, -6], hat: [-18.5, 0], camera: [-10, -4], bag: [0, -21], ticket: [-15, -12] };

/**
 * Una persona con lo que lleva en la mano (opcion holds: { p, s, dx, dy, o } o
 * una lista): la cosa se dibuja en su mano derecha, por donde se coge, y los
 * dedos por encima. Asi, si cambia el dibujo de la persona, lo que sujeta
 * sigue en su mano.
 * @param {PieceOptions} o
 */
function personHolding(o) {
  const held = [].concat(o.holds ?? []);
  if (!held.length) return person(o);
  const hand = rightHand(o);
  const inHand = held.map((/** @type {PieceOptions} */ h) => {
    const [gx, gy] = GRIPS[h.p] ?? [0, 0];
    const s = h.s ?? 0.5;
    return place(round(hand.x - gx * s + (h.dx ?? 0)), round(hand.y - gy * s + (h.dy ?? 0)), s, THINGS[h.p](h.o ?? {}));
  }).join('');
  return person({ ...o, inHand });
}

/** @type {Record<string, Piece>} */
export const PIECES = {
  person: piece(personHolding),
  ...Object.fromEntries(Object.entries(ANIMALS).map(([name, draw]) => [name, piece(draw)])),
  ...Object.fromEntries(Object.entries(THINGS).map(([name, draw]) => [name, piece(draw)])),
};

/** Para que los degradados de dos vinetas en la misma pantalla no se pisen. */
let panels = 0;

/** Lo que flota en el agua y se refleja en ella. */
const FLOATING = new Set(['boat', 'duck']);

/**
 * El reflejo en el agua de lo que flota (barcos y patos en el lago o el rio):
 * la pieza boca abajo desde su linea de flotacion, borrosa, tenue y solo
 * dentro del agua, como en una foto. No se toca y no cuenta como otra cosa.
 * @param {{ bg: string, items: { p: string, x: number, y: number, s?: number, o?: PieceOptions }[] }} art
 */
function reflections(art) {
  const water = WATER[art.bg];
  return water ? mirrored(art.items, `<path d="${water}"/>`) : '';
}

/**
 * Lo que flota, boca abajo desde su linea de flotacion, dentro de un agua.
 * @param {{ p: string, x: number, y: number, s?: number, o?: PieceOptions }[]} items
 * @param {string} water la forma del agua (para recortar)
 */
function mirrored(items, water) {
  const floating = items.filter((i) => FLOATING.has(i.p));
  if (!floating.length) return '';
  const id = uid('wr');
  return `<clipPath id="${id}">${water}</clipPath>`
    + `<g clip-path="url(#${id})" pointer-events="none"><g opacity="0.3" filter="${fx('blur')}">`
    + floating.map(({ p, x, y, s = 1, o = {} }) => `<g transform="translate(0 ${round(2 * y)}) scale(1 -1)">${PIECES[p](x, y, s, o)}</g>`).join('')
    + '</g></g>';
}

/**
 * Una pieza de la vineta. Un rio (o un estanque) dibujado como pieza lleva
 * encima el reflejo de lo que flota en el.
 * @param {{ p: string, x: number, y: number, s?: number, o?: PieceOptions }} item
 * @param {{ p: string, x: number, y: number, s?: number, o?: PieceOptions }[]} items
 */
function drawItem({ p, x, y, s = 1, o = {} }, items) {
  if (!PIECES[p]) return '';
  const body = PIECES[p](x, y, s, o);
  if (p !== 'river') return body;
  return body + mirrored(items, `<path d="${riverWater(o)}" transform="translate(${x} ${y}) scale(${s})"/>`);
}

/**
 * Una vineta entera: fondo y piezas, en un lienzo de 200 x 150.
 * @param {{ bg: string, items: { p: string, x: number, y: number, s?: number, o?: PieceOptions }[] }} art
 */
export function renderPanel(art) {
  panels += 1;
  const id = `v${panels}`;
  return withDefs(id, (lights) => {
    const bg = (BACKGROUNDS[art.bg] ?? BACKGROUNDS.garden)(id);
    const items = art.items.map((item) => drawItem(item, art.items)).join('');
    return `<svg viewBox="0 0 200 150" xmlns="http://www.w3.org/2000/svg" class="panel-art" aria-hidden="true">${lights}${bg}${reflections(art)}${items}${camera({ w: 200, h: 150 })}</svg>`;
  });
}
