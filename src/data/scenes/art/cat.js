// @ts-check
// El gatito naranja atigrado, tumbado y mirando de frente, con la panza en
// y = 0. Sin contorno: el cuerpo lo hacen la luz y el pelo (peinado hacia la
// cola en el lomo y hacia fuera desde la nariz en la cara), las rayas son pelo
// mas oscuro y difuminado, los ojos tienen forma de almendra con la pupila en
// rendija, y la nariz, las almohadillas de los bigotes y las orejas son como
// las de un gato de verdad. Cabe donde cabia el de antes.

import { stroke, ground, darker, lighter, round, smooth, tube, glowSpot } from './style.js';
import { grad, fx } from './defs.js';
import { clip, paint, pelt, joined } from './fur.js';

/** @typedef {[number, number]} Point */

const COAT = '#EE9C48';
const STRIPE = '#B8641F';
const CREAM = '#FBE0BC';
const SHADOW = '#3A1A06';

/** Rayas de pelo oscuro, difuminadas. @param {string} d @param {number} w @param {number} [opacity] */
const stripes = (d, w, opacity = 0.8) => `<path d="${d}" fill="none" stroke="${STRIPE}" stroke-opacity="${opacity}" stroke-width="${w}" stroke-linecap="round" filter="${fx('blur')}"/>`;

/**
 * Un ojo de gato: almendra un poco inclinada, iris que la llena, pupila en
 * rendija, brillo y el borde oscuro del parpado.
 * @param {number} x @param {number} y @param {number} side -1 izquierda, 1 derecha
 */
function catEye(x, y, side) {
  const w = 1.7;
  const h = 1.15;
  const tilt = side * 6;
  const almond = `M ${-w} 0 Q ${round(-w * 0.2)} ${round(-h * 1.25)} ${w} ${round(-h * 0.25)} Q ${round(w * 0.2)} ${round(h * 1.15)} ${-w} 0 Z`;
  return `<g transform="translate(${x} ${y}) rotate(${tilt}) scale(${side < 0 ? 1 : -1} 1)">`
    + `<path d="${almond}" fill="#1C1A16" stroke="#1C1A16" stroke-width="0.34" stroke-linejoin="round"/>`
    + clip([almond], `<circle cx="0.05" cy="-0.1" r="${round(h * 1.05)}" fill="#B8C43A"/>`
      + `<circle cx="0.05" cy="-0.1" r="${round(h * 1.05)}" fill="${grad('ball')}"/>`
      + `<path d="M -1.8 -0.9 Q 0 -1.5 1.8 -0.9 L 1.8 -1.6 L -1.8 -1.6 Z" fill="#1C1A16" fill-opacity="0.35"/>`)
    + `<ellipse cx="0.05" cy="-0.1" rx="0.26" ry="${round(h * 0.86)}" fill="#0E0E12"/>`
    + `<ellipse cx="-0.42" cy="-0.5" rx="0.3" ry="0.22" fill="#FFFFFF" fill-opacity="0.92"/>`
    + '</g>';
}

/** El gatito. */
export function kitten() {
  const body = smooth([[-14.4, -2.4], [-14.6, -8.6], [-12.2, -14.6], [-6.0, -18.0], [2.0, -18.6], [8.6, -17.2], [13.0, -13.4], [14.6, -7.6],
    [14.2, -2.4], [10.6, -0.6], [0, -0.4], [-10, -0.5]]);
  const head = smooth([[4.2, -21.6], [4.9, -25.4], [7.4, -28.0], [11.2, -28.8], [15.0, -28.0], [17.5, -25.4], [18.2, -21.6], [17.4, -18.2],
    [15.0, -15.9], [11.2, -15.1], [7.4, -15.9], [5.0, -18.2]]);
  const ear = (/** @type {number} */ s) => smooth([[11.2 + s * 6.0, -25.6], [11.2 + s * 6.0, -31.2], [11.2 + s * 5.5, -32.9], [11.2 + s * 4.6, -32.2], [11.2 + s * 1.2, -28.4]]);
  const inner = (/** @type {number} */ s) => smooth([[11.2 + s * 5.2, -26.6], [11.2 + s * 5.2, -30.6], [11.2 + s * 4.8, -31.4], [11.2 + s * 2.4, -28.4]]);
  const tail = tube([[-12.6, -4.6, 1.9], [-17.6, -6.0, 1.75], [-20.4, -10.2, 1.6], [-19.6, -15.6, 1.4], [-17.2, -18.4, 1.1]]);
  const paws = [smooth([[1.6, -0.6], [1.9, -3.4], [4.6, -4.1], [7.2, -3.1], [7.3, -0.6]]), smooth([[7.6, -0.6], [7.9, -3.4], [10.6, -4.1], [13.2, -3.1], [13.3, -0.6]])];
  return ground(16, 0, 0.3)
    // La cola que se enrosca hacia arriba, con anillos.
    + joined([tail], COAT, 1, 'side')
    + clip([tail], stripes('M -16.4 -8.8 l 0.6 -2.6 M -19.6 -10.6 l 2.0 -1.4 M -20.6 -14.2 l 2.4 -0.2 M -19.6 -17.6 l 2.0 0.8', 0.9))
    + pelt([tail], COAT, [-22, -20, -11, -2], 60, 44, { dir: [-0.4, -1], len: 0.9 })
    // El cuerpo: luz en el lomo, sombra en la barriga, el muslo redondo y las rayas.
    + joined([body], COAT, 1, 'clothV')
    + clip([body], paint(smooth([[-13.6, -5.0], [-6, -2.0], [6, -2.2], [13.6, -5.6], [13.4, -2.4], [8, -0.6], [-6, -0.6], [-13.4, -2.6]]), SHADOW, 0.35)
      + paint(smooth([[-11, -15.6], [-4, -18.4], [4, -18.8], [9, -17.2], [3, -15.6], [-5, -15.2], [-10, -13.4]]), '#FFF2DC', 0.45)
      + glowSpot(-9.0, -9.4, 4.0, 3.6, 'spec', 0.22)
      + `<path d="M -4.4 -13 Q -3.0 -8 -5.4 -3.4 Q -9 -2.2 -12.8 -3.8" fill="none" stroke="${SHADOW}" stroke-opacity="0.2" stroke-width="1.2" filter="${fx('blur2')}"/>`
      + stripes('M -10.4 -15.4 q 1.6 2.6 0.8 5.6 M -6 -17.6 q 1.4 3 0.6 6.2 M -1.4 -18.4 q 1.2 3 0.4 6.4 M 3.4 -18.2 q 1 3 0.2 6 M -12.8 -11 q 1.4 1.8 1 4 M 7.6 -17.2 q 0.8 2.4 0.2 4.6', 1.1)
      + paint(smooth([[6.4, -16.4], [11.4, -15.0], [14.0, -10.0], [13.6, -5.0], [10, -6.0], [8, -11.6]]), CREAM, 0.55))
    + pelt([body], COAT, [-15, -19, 15, 0], 260, 41, { dir: [-1, 0.35], len: 1.1 })
    // Las patas de delante, recogidas, con los dedos.
    + paws.map((d) => `<path d="${d}" fill="${CREAM}"/>`).join('')
    + clip(paws, paint('M 0 -1.4 L 14 -1.4 L 14 0 L 0 0 Z', SHADOW, 0.25, 'blur') + glowSpot(4.4, -3.4, 2.2, 0.7, 'spec', 0.4) + glowSpot(10.4, -3.4, 2.2, 0.7, 'spec', 0.4))
    + stroke('M 3.8 -0.8 v -1.2 M 5.4 -0.8 v -1.2 M 9.8 -0.8 v -1.2 M 11.4 -0.8 v -1.2', 0.2, darker(CREAM, 0.35))
    // Las orejas: piel naranja por fuera, rosa por dentro, con pelos blancos.
    + [-1, 1].map((s) => joined([ear(s)], COAT, 1) + `<path d="${inner(s)}" fill="#E9A2A8"/>`
      + clip([inner(s)], paint(`M ${round(11.2 + s * 5.6)} -31 L ${round(11.2 + s * 4.4)} -26 L ${round(11.2 + s * 6.2)} -26 Z`, SHADOW, 0.25, 'blur'))
      + stroke(`M ${round(11.2 + s * 3.6)} -27.8 l ${round(s * 1.1)} -2.2 M ${round(11.2 + s * 3.0)} -27.6 l ${round(s * 1.4)} -1.6 M ${round(11.2 + s * 4.2)} -28.0 l ${round(s * 0.6)} -2.4`, 0.14, '#FFF6EE')).join('')
    // La cabeza: luz en la frente, la M de los atigrados y las mejillas.
    + joined([head], COAT, 1, 'face')
    + clip([head], paint(smooth([[6, -18.6], [11.2, -15.6], [16.4, -18.6], [17.6, -16.4], [11.2, -14.2], [4.8, -16.4]]), SHADOW, 0.25, 'blur')
      + glowSpot(11.2, -26.4, 4.4, 1.8, 'spec', 0.32)
      + stripes('M 9.4 -28.0 l 0.6 2.8 M 11.2 -28.6 l 0 3.2 M 13.0 -28.0 l -0.6 2.8 M 4.8 -22.8 l 2.2 0.4 M 5.0 -20.6 l 2.2 0 M 17.6 -22.8 l -2.2 0.4 M 17.4 -20.6 l -2.2 0', 0.7, 0.75)
      + paint(smooth([[8.4, -19.4], [9.8, -21.6], [11.2, -21.0], [12.6, -21.6], [14.0, -19.4], [13.2, -16.4], [11.2, -15.6], [9.2, -16.4]]), CREAM, 0.9, 'blur'))
    + pelt([head], COAT, [4, -29, 19, -15], 140, 42, { from: [11.2, -19.4], len: 0.8 })
    // Ojos, nariz rosa, almohadillas de los bigotes, boca y bigotes.
    + catEye(8.6, -22.6, -1) + catEye(13.8, -22.6, 1)
    + `<path d="M 10.1 -19.9 Q 11.2 -20.4 12.3 -19.9 Q 12.1 -19.1 11.2 -18.5 Q 10.3 -19.1 10.1 -19.9 Z" fill="#DC8A92"/>`
    + glowSpot(11.0, -19.8, 0.7, 0.3, 'spec', 0.6)
    + `<ellipse cx="10.1" cy="-17.7" rx="1.25" ry="0.9" fill="${lighter(CREAM, 0.3)}" fill-opacity="0.7"/><ellipse cx="12.3" cy="-17.7" rx="1.25" ry="0.9" fill="${lighter(CREAM, 0.3)}" fill-opacity="0.7"/>`
    + stroke('M 11.2 -18.5 v 0.6 M 11.2 -17.9 q -0.7 0.8 -1.5 0.3 M 11.2 -17.9 q 0.7 0.8 1.5 0.3', 0.24, '#7A4632')
    + '<g fill="#9A6A40"><circle cx="9.6" cy="-17.9" r="0.14"/><circle cx="9.9" cy="-17.2" r="0.14"/><circle cx="12.8" cy="-17.9" r="0.14"/><circle cx="12.5" cy="-17.2" r="0.14"/></g>'
    + `<path d="M 8.8 -18.0 Q 6 -18.8 3.0 -19.2 M 8.8 -17.4 Q 6 -17.2 3.2 -16.8 M 9.0 -16.9 Q 6.4 -16.0 4.0 -15.0 M 13.6 -18.0 Q 16.4 -18.8 19.4 -19.2 M 13.6 -17.4 Q 16.4 -17.2 19.2 -16.8 M 13.4 -16.9 Q 16.0 -16.0 18.4 -15.0" fill="none" stroke="#FFFFFF" stroke-opacity="0.75" stroke-width="0.14" stroke-linecap="round"/>`;
}
