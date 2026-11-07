// @ts-check
// Las aves de las escenas: el pato (que nada), la gallina y el pajaro pequeno
// del color que se pida, de lado y mirando a la derecha, con los pies (o el
// agua) en y = 0. Sin contorno: el cuerpo lo hacen la luz y un plumon fino, y
// las alas y las colas estan hechas pluma a pluma, cada fila tapando la base de
// la anterior (primarias largas, secundarias y coberteras cortas), como en un
// ala de verdad. Caben donde cabian las de antes.

import { stroke, ground, darker, lighter, round, smooth, volume, glowSpot, tube } from './style.js';
import { grad } from './defs.js';
import { eye, clip, paint, pelt, joined } from './fur.js';

/** @typedef {[number, number]} Point */

const SHADOW = '#1C1424';

/**
 * Una pluma: la base en (x, y), apuntando a `a` grados (0 = derecha, 90 =
 * abajo), con su largo y su ancho; en sombra donde la tapa la de encima, con
 * la punta al sol y el canon claro.
 * @param {number} x @param {number} y @param {number} l @param {number} w @param {number} a @param {string} fill
 */
function feather(x, y, l, w, a, fill) {
  const d = `M 0 ${round(-w * 0.42)} Q ${round(l * 0.55)} ${round(-w * 0.62)} ${round(l * 0.96)} ${round(-w * 0.18)} Q ${round(l * 1.03)} 0 ${round(l * 0.96)} ${round(w * 0.18)} Q ${round(l * 0.55)} ${round(w * 0.62)} 0 ${round(w * 0.42)} Z`;
  return `<g transform="translate(${round(x)} ${round(y)}) rotate(${round(a)})">`
    + `<path d="${d}" fill="${fill}" stroke="${darker(fill, 0.4)}" stroke-opacity="0.35" stroke-width="0.12"/>`
    + `<path d="${d}" fill="${grad('quill')}"/>`
    + `<path d="M ${round(l * 0.08)} 0 L ${round(l * 0.86)} 0" stroke="${lighter(fill, 0.35)}" stroke-opacity="0.45" stroke-width="${round(Math.max(0.08, w * 0.07))}"/>`
    + '</g>';
}

/**
 * Un ala plegada vista de lado (el ave mira a la derecha): debajo las
 * primarias, largas y en punta hasta el extremo; encima las secundarias, cuyas
 * puntas redondas hacen el borde de abajo; luego las coberteras grandes y, junto
 * al hombro, filas de coberteras pequenas como escamas. Cada fila tapa la base
 * de la anterior. El hombro esta en (x, y), la punta en (x - len, y + drop) y h
 * es el grueso del ala.
 * @param {number} x @param {number} y @param {number} len @param {number} drop @param {number} h @param {string} c
 */
function wing(x, y, len, drop, h, c) {
  const size = Math.hypot(len, drop);
  const [dx, dy] = [-len / size, drop / size];
  const [nx, ny] = [drop / size, len / size];
  const at = (/** @type {number} */ u, /** @type {number} */ v) => /** @type {Point} */ ([round(x - len * u + nx * v * h), round(y + drop * u + ny * v * h)]);
  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
  const outline = smooth([at(-0.03, -0.05), at(0.05, -0.42), at(0.3, -0.52), at(0.68, -0.3), at(1, 0), at(0.74, 0.3), at(0.42, 0.5), at(0.12, 0.48)]);
  /** Una fila de plumas, de atras hacia delante (la de delante tapa a la de atras). */
  const row = (/** @type {number[]} */ us, /** @type {number} */ v, /** @type {number} */ l, /** @type {number} */ w, /** @type {number} */ turn, /** @type {string} */ fill) => us
    .map((u, i) => feather(...at(u, v + i * 0.02), l * (1 - i * 0.03), w, angle + turn + i * 1.2, fill)).join('');
  // Coberteras pequenas junto al hombro: escamas en filas al tresbolillo.
  let small = '';
  for (let r = 0; r < 3; r += 1) {
    for (let k = 0; k < 5; k += 1) {
      const [sx, sy] = at(0.04 + k * 0.055 + (r % 2) * 0.027, -0.34 + r * 0.14);
      small += `M ${round(sx + nx * 0.5 - dx * 0.5)} ${round(sy + ny * 0.5 - dy * 0.5)} q ${round(dx * 0.9 + nx * 0.6)} ${round(dy * 0.9 + ny * 0.6)} ${round(dx * 1.6)} ${round(dy * 1.6)} `;
    }
  }
  return `<path d="${outline}" fill="${darker(c, 0.1)}"/>`
    + row([0.68, 0.62, 0.56, 0.5], 0.12, len * 0.42, h * 0.3, 1, darker(c, 0.26))
    + row([0.44, 0.37, 0.3, 0.23, 0.16], 0.04, len * 0.34, h * 0.52, 8, darker(c, 0.12))
    + row([0.36, 0.3, 0.24, 0.18, 0.12, 0.06], -0.2, len * 0.19, h * 0.44, 7, c)
    + clip([outline], `<path d="${small}" fill="none" stroke="${darker(c, 0.3)}" stroke-opacity="0.4" stroke-width="0.16" stroke-linecap="round"/>`
      + glowSpot(...at(0.14, -0.3), len * 0.16, h * 0.22, 'spec', 0.35, angle + 180));
}

/**
 * Filas de plumas pequenas en el pecho o el costado (escamas suaves).
 * @param {Point[]} rows inicio de cada fila @param {number} n plumas por fila @param {number} step @param {number} r tamano @param {string} c
 */
const scales = (rows, n, step, r, c) => `<path d="${rows.map(([x0, y0], k) => Array.from({ length: n }, (_, i) => {
  const x = x0 + i * step + (k % 2) * step * 0.5;
  return `M ${round(x - r)} ${round(y0)} q ${round(r)} ${round(r * 1.1)} ${round(r * 2)} 0`;
}).join(' ')).join(' ')}" fill="none" stroke="${c}" stroke-opacity="0.35" stroke-width="0.16" stroke-linecap="round"/>`;

/** El pato amarillo que nada. */
export function duck() {
  const plume = '#F7C33A';
  const bill = '#EE8A2E';
  const body = smooth([[-15.8, -15.2], [-12.8, -12.6], [-12.4, -8.2], [-9.2, -2.8], [-2.0, -0.6], [6.5, -0.8], [11.6, -3.4], [13.6, -7.8],
    [12.8, -11.4], [9.0, -13.4], [2.0, -13.6], [-6.0, -13.0], [-11.0, -14.2]]);
  const head = smooth([[5.4, -12.2], [6.4, -15.4], [6.6, -18.8], [8.2, -21.8], [11.0, -22.8], [13.6, -21.8], [14.6, -19.4], [14.0, -17.0],
    [12.6, -15.6], [12.2, -13.4], [12.8, -11.2]]);
  return ground(13, 0, 0.4)
    + joined([body, head], plume, 1, 'clothV')
    + clip([body, head], paint(smooth([[-12.4, -6.4], [-4, -1.8], [6, -2.0], [13.2, -6.6], [11.8, -2.6], [6.4, -0.4], [-2, -0.2], [-9.6, -2.2]]), '#7A4A08', 0.36)
      + paint(smooth([[-12, -14.6], [-2, -14.4], [8, -14.2], [12, -12.6], [6, -11.2], [-4, -11.6], [-11, -12.2]]), '#FFF8DC', 0.5)
      + glowSpot(9.8, -21.0, 2.6, 1.3, 'spec', 0.5, -20) + glowSpot(11.4, -8.6, 2.2, 3.2, 'spec', 0.25)
      + paint(smooth([[6.6, -15.6], [11.6, -15.0], [13.0, -16.6], [12.2, -13.6], [7, -13.0]]), '#7A4A08', 0.2, 'blur'))
    + pelt([body, head], plume, [-16, -23, 16, 0], 220, 51, { dir: [-1, 0.2], len: 0.9 })
    + scales([[7.2, -10.6], [7.6, -8.6], [8.2, -6.6], [8.8, -4.6]], 3, 1.5, 0.55, darker(plume, 0.35))
    // Plumas de la cola, cortas y levantadas.
    + feather(-10.6, -13.0, 4.6, 2.2, 206, darker(plume, 0.1)) + feather(-10.8, -12.6, 4.4, 2.2, 196, darker(plume, 0.04))
    + feather(-10.8, -12.0, 4.0, 2.0, 186, plume)
    // El ala plegada, pluma a pluma.
    + wing(6.4, -10.6, 17.2, 2.6, 6.6, darker(plume, 0.05))
    // Pico plano: arriba, abajo, la una y el orificio de la nariz.
    + `<path d="M 13.6 -20.4 Q 15.6 -19.4 18.4 -19.0 Q 21.0 -18.8 21.8 -18.0 Q 22.0 -17.2 21.0 -17.0 L 16.6 -17.0 Q 14.6 -17.0 13.6 -17.6 Z" fill="${bill}"/>`
    + `<path d="M 14.2 -17.4 L 20.8 -17.2 Q 20.6 -16.4 19.0 -16.3 L 15.2 -16.4 Q 14.4 -16.6 14.2 -17.4 Z" fill="${darker(bill, 0.1)}"/>`
    + glowSpot(17.4, -18.8, 2.6, 0.45, 'spec', 0.5, 8)
    + `<path d="M 20.6 -18.6 Q 22.1 -18.2 21.6 -17.1 Q 21.0 -17.6 20.6 -18.6 Z" fill="${darker(bill, 0.3)}"/>`
    + `<ellipse cx="16.4" cy="-18.7" rx="0.5" ry="0.2" fill="${darker(bill, 0.5)}" transform="rotate(14 16.4 -18.7)"/>`
    + stroke('M 14.0 -17.3 L 21.0 -17.1', 0.18, darker(bill, 0.42))
    + eye(11.2, -19.4, 0.72, '#2A1E16');
}

/** La cresta de la gallina: dentada, con cinco puntas redondeadas. */
const COMB = 'M 6.4 -23.2 Q 5.6 -25.6 7.0 -26.4 Q 7.6 -27.6 8.4 -26.2 Q 8.8 -28.6 9.9 -27.0 Q 10.6 -28.8 11.4 -26.8 '
  + 'Q 12.4 -28.0 12.8 -26.2 Q 14.0 -26.2 13.2 -24.4 Q 13.0 -23.0 11.6 -23.2 Q 9.0 -22.6 6.4 -23.2 Z';

/** La gallina blanca, con su cresta roja. */
export function chicken() {
  const white = '#FBF9F4';
  const leg = '#E8A33A';
  const red = '#D2392C';
  const body = smooth([[-10.6, -12.4], [-8.8, -16.6], [-3.6, -18.2], [3.0, -18.0], [7.0, -18.8], [10.6, -15.6], [12.4, -11.0], [11.0, -6.6],
    [6.4, -3.9], [0, -3.4], [-6.0, -4.6], [-9.6, -7.6]]);
  const head = smooth([[5.6, -16.4], [5.8, -21.0], [8.8, -25.0], [12.2, -24.6], [14.0, -21.2], [13.4, -17.6], [11.2, -15.0]]);
  const legs = [tube([[-2.6, -5.6, 0.75], [-2.8, -2.2, 0.55], [-2.9, -0.7, 0.5]]), tube([[3.2, -5.4, 0.75], [3.4, -2.2, 0.55], [3.5, -0.7, 0.5]])];
  const toes = (/** @type {number} */ x) => `M ${x} -0.6 L ${round(x + 2.4)} -0.1 M ${x} -0.6 L ${round(x + 1.4)} 0 M ${x} -0.6 L ${round(x - 1.8)} -0.1`;
  return ground(12, 0, 0.3)
    // Patas amarillas con escamas y dedos.
    + legs.map((d) => `<path d="${d}" fill="${leg}"/>` + volume(d, 'side')).join('')
    + stroke(`${toes(-2.9)} ${toes(3.5)}`, 0.5, darker(leg, 0.1))
    + stroke('M -3.4 -3.8 l 0.9 0 M -3.4 -2.8 l 0.9 0 M 2.9 -3.8 l 0.9 0 M 2.9 -2.8 l 0.9 0', 0.18, darker(leg, 0.4))
    // Cola de plumas levantadas, en abanico.
    + [-152, -138, -124, -110, -98].map((a, i) => feather(-8.0, -13.0, 9.6 - Math.abs(i - 2) * 0.8, 2.6, a, i % 2 ? '#F1EDE4' : white)).join('')
    + joined([body, head], white, 1, 'clothV')
    + clip([body, head], paint(smooth([[-10.4, -8.4], [-2, -4.6], [6, -5.4], [11.6, -9.6], [10, -5.0], [4.4, -3.4], [-2.4, -3.2], [-8.4, -5.2]]), SHADOW, 0.2)
      + paint(smooth([[-8, -17.6], [0, -18.6], [7, -19.2], [9, -17], [2, -16.2], [-7, -15.6]]), '#FFFFFF', 0.6)
      + glowSpot(9.4, -23.0, 2.4, 1.2, 'spec', 0.6, -20) + glowSpot(10.6, -11.6, 2.0, 3.0, 'spec', 0.3))
    + pelt([body, head], white, [-11, -26, 15, -3], 200, 61, { dir: [-1, 0.5], len: 1.0 })
    + scales([[6.8, -13.4], [7.2, -11.4], [7.6, -9.4], [7.6, -7.4], [6.4, -5.6]], 3, 1.5, 0.55, '#B8AE9C')
    // Plumas del cuello que caen sobre el lomo.
    + scales([[4.6, -16.4], [5.0, -15.0]], 3, 1.3, 0.5, '#C9C0B0')
    + wing(5.4, -13.6, 14.2, 3.4, 6.4, '#F3EFE6')
    // Cresta, barbillas, oreja, pico y ojo.
    + `<path d="${COMB}" fill="${red}"/>` + volume(COMB, 'ball')
    + `<path d="${smooth([[12.2, -17.0], [13.8, -14.2], [13.0, -12.6], [11.6, -13.6], [11.4, -15.8]])}" fill="${red}"/>`
    + volume(smooth([[12.2, -17.0], [13.8, -14.2], [13.0, -12.6], [11.6, -13.6], [11.4, -15.8]]), 'ball')
    + `<ellipse cx="9.0" cy="-18.4" rx="0.8" ry="0.6" fill="${red}" fill-opacity="0.8"/>`
    + `<path d="${smooth([[13.4, -20.6], [16.4, -19.6], [17.8, -18.8], [15.4, -18.4], [13.4, -18.0]])}" fill="#E7B13A"/>`
    + `<path d="${smooth([[13.4, -18.2], [15.4, -18.3], [16.4, -18.1], [14.4, -17.5]])}" fill="#D9A030"/>`
    + glowSpot(15.0, -19.6, 1.6, 0.5, 'spec', 0.5)
    + eye(10.4, -20.6, 0.85, '#E39A2B');
}

/** El pajaro pequeno del color que se pida (pecho mas claro, alas pluma a pluma). @param {{ colour?: string }} [o] */
export function bird(o = {}) {
  const c = o.colour ?? '#1F7BE0';
  const body = smooth([[-7.6, -8.6], [-3.0, -11.4], [2.6, -13.0], [6.0, -15.8], [9.4, -16.6], [12.0, -15.0], [12.8, -12.6], [11.6, -9.6],
    [8.8, -6.0], [4.2, -2.8], [-0.6, -2.2], [-5.0, -3.8], [-8.2, -6.2]]);
  return ground(8, 0, 0.3)
    + stroke('M -1.4 -2.4 L -1.8 0 M -1.8 0 l -1.4 0.1 M -1.8 0 l 1.2 0.1 M 1.6 -2.6 L 2 0 M 2 0 l -1.2 0.1 M 2 0 l 1.4 0.1', 0.4, '#8A5A3A')
    // Cola larga de plumas.
    + feather(-6.4, -7.6, 8.6, 2.2, 194, darker(c, 0.3)) + feather(-6.6, -7.0, 8.2, 2.1, 186, darker(c, 0.22))
    + joined([body], c, 1, 'clothV')
    + clip([body], paint(smooth([[11.6, -10.4], [8.8, -6.4], [4.2, -2.8], [-0.8, -2.2], [-3, -3.4], [1, -5.6], [5.6, -8.6], [9.6, -11.2]]), lighter(c, 0.62), 0.9, 'blur2')
      + paint(smooth([[-6, -9.4], [2, -12.6], [7, -16.2], [11, -16.4], [8, -14.2], [2, -11], [-5, -8]]), '#FFFFFF', 0.35)
      + glowSpot(9.6, -15.4, 2.2, 1.0, 'spec', 0.5, -15)
      + paint(smooth([[-6, -4.6], [0, -2.4], [5, -3.6], [2, -1.6], [-4, -2.6]]), SHADOW, 0.3, 'blur'))
    + pelt([body], c, [-9, -17, 13, -1], 110, 71, { dir: [-1, 0.35], len: 0.75 })
    + wing(6.6, -12.2, 13.0, 4.0, 5.2, darker(c, 0.12))
    // Pico corto y ojo oscuro con su brillo.
    + `<path d="${smooth([[12.0, -14.4], [15.8, -12.9], [12.2, -11.4]])}" fill="#4A3A30"/>`
    + glowSpot(13.4, -13.6, 1.2, 0.4, 'spec', 0.5)
    + stroke('M 12.4 -12.9 L 15.2 -12.9', 0.14, '#1C1414')
    + `<circle cx="9.8" cy="-13.6" r="0.98" fill="${lighter(c, 0.45)}" fill-opacity="0.6"/>`
    + eye(9.8, -13.6, 0.74, '#16161E');
}
