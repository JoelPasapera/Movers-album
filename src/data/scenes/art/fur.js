// @ts-check
// Lo que comparten los animales: la silueta sin contorno (solo un filo apenas
// mas oscuro que su pelo), patas, ojos de verdad, el pelaje (cientos de pelos
// cortos peinados y un grano encima) y la luz pintada dentro de la silueta, sin
// salirse, como en una pintura.

import { shape, lit, volume, stroke, darker, lighter, round, smooth, tube, edge, seeded } from './style.js';
import { grad, fx, uid } from './defs.js';

/** @typedef {[number, number]} Point */

/** Filo de la silueta: casi invisible; el borde lo hacen la luz y el pelo. */
export const OUT = 0.5;

/** Filo de los detalles de dentro (alas, orejas). */
export const INNER = 0.32;

/** Forma organica cerrada por puntos, con su color, su filo y su volumen. @param {Point[]} pts @param {string} fill @param {string} [kind] @param {number} [w] */
export const organic = (pts, fill, kind = 'vol', w = OUT) => lit(smooth(pts), fill, kind, w);

/**
 * Varias formas del mismo color unidas sin costura (cuerpo, cuello, cabeza y
 * patas): primero todos los filos, luego todos los rellenos. La luz va solo en
 * las `shaded` primeras: en una pata que se mete en el cuerpo, el brillo de
 * arriba saldria como una mancha en el lomo.
 * @param {string[]} paths @param {string} fill @param {number} [shaded] @param {string} [kind]
 */
export function joined(paths, fill, shaded = 2, kind = 'vol') {
  return paths.map((d) => `<path d="${d}" fill="${fill}" stroke="${darker(fill, 0.45)}" stroke-opacity="0.55" stroke-width="${round(OUT * 0.8)}" stroke-linejoin="round"/>`).join('')
    + paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join('')
    + paths.slice(0, shaded).map((d) => volume(d, kind)).join('');
}

/** La almohadilla de una pata (se une a la pata con joined). @param {number} x @param {number} w */
export const paw = (x, w) => `M ${round(x - w)} 0 Q ${round(x - w * 1.05)} -2.3 ${round(x + w * 0.1)} -2.5 Q ${round(x + w * 1.25)} -2.3 ${round(x + w * 1.3)} 0 Z`;

/** Una pata o una cola: tubo que se estrecha. @param {[number, number, number][]} pts @param {string} fill */
export const leg = (pts, fill) => {
  const d = tube(pts);
  return shape(d, fill, OUT) + volume(d, 'side');
};

/**
 * Un ojo de verdad: el borde oscuro del parpado, iris con su color, pupila
 * (redonda o de gato), el brillo de la luz y el parpado de arriba.
 * @param {number} x @param {number} y @param {number} r @param {string} iris @param {{ slit?: boolean, lid?: string }} [o]
 */
export function eye(x, y, r, iris, o = {}) {
  const pupil = o.slit
    ? `<ellipse cx="${x}" cy="${y}" rx="${round(r * 0.22)}" ry="${round(r * 0.78)}" fill="#14141C"/>`
    : `<circle cx="${x}" cy="${y}" r="${round(r * 0.52)}" fill="#14141C"/>`;
  return `<circle cx="${x}" cy="${y}" r="${round(r * 1.12)}" fill="#1C1A22" fill-opacity="0.8"/>`
    + `<circle cx="${x}" cy="${y}" r="${round(r)}" fill="${iris}"/>`
    + `<circle cx="${x}" cy="${y}" r="${round(r)}" fill="${grad('ball')}"/>`
    + pupil
    + `<circle cx="${round(x - r * 0.36)}" cy="${round(y - r * 0.38)}" r="${round(r * 0.22)}" fill="#FFFFFF" fill-opacity="0.95"/>`
    + `<circle cx="${round(x + r * 0.4)}" cy="${round(y + r * 0.35)}" r="${round(r * 0.1)}" fill="#FFFFFF" fill-opacity="0.6"/>`
    + (o.lid ? stroke(`M ${round(x - r * 1.25)} ${round(y - r * 0.2)} Q ${x} ${round(y - r * 1.45)} ${round(x + r * 1.25)} ${round(y - r * 0.35)}`, round(r * 0.32), o.lid) : '');
}

/** Trazos de pelo o de plumas. @param {string} d @param {string} colour @param {number} [w] */
export const fur = (d, colour, w = 0.32) => stroke(d, w, colour);

/**
 * Lo que se pinta dentro de unas formas, recortado a ellas (la luz, la sombra
 * y el pelo no se salen de la silueta).
 * @param {string[]} paths @param {string} body
 */
export function clip(paths, body) {
  const id = uid('a');
  return `<clipPath id="${id}">${paths.map((d) => `<path d="${d}"/>`).join('')}</clipPath><g clip-path="url(#${id})">${body}</g>`;
}

/**
 * Luz o sombra pintada con pincel blando (desenfocada).
 * @param {string} d @param {string} colour @param {number} opacity @param {string} [blur]
 */
export const paint = (d, colour, opacity, blur = 'blur2') => `<path d="${d}" fill="${colour}" fill-opacity="${round(opacity)}" filter="${fx(blur)}" pointer-events="none"/>`;

/**
 * El pelaje (o el plumaje): cientos de pelos cortos en dos tonos, peinados en
 * una direccion (o hacia fuera desde un punto, como en la cara de un gato), y
 * un grano encima, recortados a la forma del animal para que no se salgan.
 * @param {string[]} paths formas que recortan el pelo
 * @param {string} base color del pelaje
 * @param {[number, number, number, number]} box rectangulo [x0, y0, x1, y1] donde caen los pelos
 * @param {number} n cuantos pelos
 * @param {number} seed
 * @param {{ dir?: Point, from?: Point, len?: number, opacity?: number }} [o]
 */
export function pelt(paths, base, box, n, seed, o = {}) {
  const [x0, y0, x1, y1] = box;
  const rnd = seeded(seed);
  const len = o.len ?? 1.4;
  const a = o.opacity ?? 1;
  let dark = '';
  let light = '';
  for (let i = 0; i < n; i += 1) {
    const x = x0 + rnd() * (x1 - x0);
    const y = y0 + rnd() * (y1 - y0);
    const l = len * (0.6 + rnd() * 0.8);
    const bend = (rnd() - 0.5) * 0.35 * l;
    const [ax, ay] = o.from ? [x - o.from[0], y - o.from[1]] : (o.dir ?? [-1, 0.15]);
    const turn = (rnd() - 0.5) * 0.5;
    const m = Math.hypot(ax, ay) || 1;
    const [ux, uy] = [ax / m, ay / m];
    const [dx, dy] = [ux * Math.cos(turn) - uy * Math.sin(turn), ux * Math.sin(turn) + uy * Math.cos(turn)];
    const d = `M ${round(x)} ${round(y)} q ${round(dx * l * 0.5 - dy * bend)} ${round(dy * l * 0.5 + dx * bend)} ${round(dx * l)} ${round(dy * l)} `;
    if (rnd() < 0.55) dark += d; else light += d;
  }
  return clip(paths, `<path d="${dark}" fill="none" stroke="${darker(base, 0.34)}" stroke-opacity="${round(0.36 * a)}" stroke-width="0.15" stroke-linecap="round"/>`
    + `<path d="${light}" fill="none" stroke="${lighter(base, 0.4)}" stroke-opacity="${round(0.34 * a)}" stroke-width="0.13" stroke-linecap="round"/>`
    + `<rect x="${x0}" y="${y0}" width="${round(x1 - x0)}" height="${round(y1 - y0)}" fill="${darker(base, 0.45)}" fill-opacity="${round(0.3 * a)}" filter="${fx('grain')}"/>`);
}

/**
 * Pezuna (hendida, de vaca o de cabra: mate, con la punta hacia delante) o pata
 * con dedos.
 * @param {number} x @param {number} w @param {string} fill @param {boolean} [cloven]
 */
export function foot(x, w, fill, cloven = false) {
  const d = cloven
    ? `M ${round(x - w)} 0 L ${round(x - w * 0.86)} -2.0 Q ${x} -2.55 ${round(x + w * 0.78)} -2.25 L ${round(x + w * 1.35)} 0 Z`
    : `M ${round(x - w)} 0 Q ${round(x - w)} -2.4 ${x} -2.6 Q ${round(x + w * 1.15)} -2.4 ${round(x + w * 1.2)} 0 Z`;
  return shape(d, fill, OUT) + volume(d, cloven ? 'side' : 'ball')
    + (cloven ? stroke(`M ${round(x + w * 0.2)} -1.7 L ${round(x + w * 0.3)} 0`, 0.26, darker(fill, 0.4))
      + `<path d="M ${round(x - w * 0.9)} -0.5 L ${round(x + w * 1.2)} -0.5" stroke="#FFFFFF" stroke-opacity="0.18" stroke-width="0.3"/>`
      : stroke(`M ${round(x - w * 0.2)} -1 l 0 1 M ${round(x + w * 0.45)} -1 l 0 1`, 0.28, edge(fill)));
}
