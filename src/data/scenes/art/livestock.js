// @ts-check
// El ganado de la granja: la vaca (blanca con manchas negras) y la cabra
// (blanca, con barba y cuernos), de lado, mirando a la derecha y con las
// pezunas en y = 0. Dibujadas por anatomia: la cruz, el lomo, la punta de la
// cadera y el nacimiento de la cola; el vientre hondo; la rodilla, la cana y el
// menudillo en las patas de delante y la babilla y el corvejon en las de atras;
// la cabeza larga con su morro. La luz pinta el lomo y la cadera, la sombra el
// vientre, y el pelo (corto en la vaca, largo y caido en la cabra) se ve de
// cerca. Caben donde cabian las de antes, para que las escenas sigan diciendo
// la verdad ("The goat is under the tree").

import { stroke, ground, darker, round, smooth, volume, glowSpot, seeded } from './style.js';
import { grad, fx } from './defs.js';
import { eye, fur, clip, paint, pelt, foot, organic, INNER } from './fur.js';

/** @typedef {[number, number]} Point */

const SHADOW = '#1C1424';

/** Sombra blanda a lo largo de un trazo (el borde de un musculo). @param {string} d @param {number} w @param {number} opacity */
const soft = (d, w, opacity) => `<path d="${d}" fill="none" stroke="${SHADOW}" stroke-opacity="${opacity}" stroke-width="${w}" stroke-linecap="round" filter="${fx('blur2')}" pointer-events="none"/>`;

/**
 * Formas del mismo color unidas sin costura, sin la luz (que se pone despues,
 * encima de las manchas).
 * @param {string[]} paths @param {string} fill
 */
const body = (paths, fill) => paths.map((d) => `<path d="${d}" fill="${fill}" stroke="${darker(fill, 0.45)}" stroke-opacity="0.5" stroke-width="0.4" stroke-linejoin="round"/>`).join('')
  + paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join('');

/**
 * Pata de delante: antebrazo con su codo, rodilla (carpo), cana, menudillo y
 * cuartilla hasta la pezuna; x es la cana y w su grosor.
 * @param {number} x @param {number} w @param {number} top
 */
const foreleg = (x, w, top) => smooth([
  [x + 2.0 * w, top], [x + 2.1 * w, -15.0], [x + 1.3 * w, -11.4], [x + 1.45 * w, -10.0], [x + 1.05 * w, -8.6], [x + 1.0 * w, -5.0],
  [x + 1.25 * w, -3.4], [x + 1.5 * w, -2.0], [x - 1.0 * w, -2.0], [x - 1.35 * w, -3.6], [x - 1.2 * w, -4.6], [x - 1.0 * w, -6.2],
  [x - 1.2 * w, -9.2], [x - 1.7 * w, -13.0], [x - 2.4 * w, -16.0], [x - 2.2 * w, top],
]);

/**
 * Pata de atras: muslo, babilla, pierna, corvejon, cana y menudillo; x es la
 * cana y w su grosor.
 * @param {number} x @param {number} w @param {number} top
 */
const hindleg = (x, w, top) => smooth([
  [x + 3.6 * w, top], [x + 4.1 * w, -18.0], [x + 2.6 * w, -14.4], [x + 1.25 * w, -10.4], [x + 1.0 * w, -6.0], [x + 1.25 * w, -3.4],
  [x + 1.5 * w, -2.0], [x - 1.0 * w, -2.0], [x - 1.35 * w, -3.6], [x - 1.1 * w, -6.0], [x - 1.9 * w, -9.6], [x - 2.1 * w, -11.0],
  [x - 2.4 * w, -13.8], [x - 3.6 * w, -18.4], [x - 3.9 * w, top],
]);

/**
 * Una mancha irregular (como las de una vaca frisona).
 * @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {number} seed
 */
function patch(cx, cy, rx, ry, seed) {
  const rnd = seeded(seed);
  /** @type {Point[]} */
  const pts = [];
  for (let i = 0; i < 11; i += 1) {
    const a = (i / 11) * Math.PI * 2 + rnd() * 0.25;
    const k = 0.7 + rnd() * 0.5;
    pts.push([round(cx + Math.cos(a) * rx * k), round(cy + Math.sin(a) * ry * k)]);
  }
  return smooth(pts);
}

/** La vaca blanca con manchas negras, con la cabeza de perfil. */
export function cow() {
  const hide = '#FBFAF6';
  const spot = '#24252F';
  const muzzle = '#E2A9AF';
  const far = '#E6E1D6';
  const hoof = '#3A3436';
  const torso = smooth([
    [-24.4, -37.6], [-21.4, -36.6], [-17.0, -37.0], [-14.0, -37.9], [-10.0, -36.8], [-2.0, -36.2], [6.0, -36.4], [12.0, -37.4],
    [16.6, -38.8], [21.6, -40.8], [24.4, -36.4], [23.4, -31.0], [22.0, -28.2], [21.6, -25.4], [20.4, -22.4], [19.0, -19.2],
    [16.4, -17.4], [12.0, -16.4], [6.0, -14.8], [0.0, -13.8], [-6.0, -14.0], [-10.6, -15.4], [-13.8, -17.6], [-16.4, -19.0],
    [-21.4, -19.6], [-25.2, -22.6], [-26.4, -28.4], [-26.0, -34.2],
  ]);
  const head = smooth([
    [21.0, -40.0], [24.0, -42.6], [27.4, -42.2], [30.4, -40.0], [33.6, -36.4], [36.8, -32.6], [39.6, -29.6], [41.0, -27.6],
    [40.6, -25.4], [38.2, -24.4], [34.6, -25.0], [30.6, -26.6], [27.0, -28.6], [23.6, -30.2],
  ]);
  const fore = foreleg(15.2, 1.15, -21);
  const hind = hindleg(-20.4, 1.15, -25);
  const farFore = foreleg(11.6, 1.08, -19);
  const farHind = hindleg(-16.8, 1.08, -23);
  const all = [torso, head, fore, hind];
  const spots = [patch(-19.6, -31.6, 6.6, 5.6, 3), patch(2.4, -31.4, 7.4, 6.4, 5), patch(-23.0, -21.6, 3.6, 4.6, 7),
    patch(17.0, -32.6, 4.8, 4.6, 9), patch(28.8, -38.4, 3.4, 3.0, 11), patch(6.4, -17.4, 3.2, 2.0, 13), patch(15.4, -12.0, 1.8, 2.6, 17)];
  const udder = smooth([[-15.8, -18.0], [-8.6, -16.6], [-7.8, -13.0], [-9.8, -10.6], [-13.4, -10.6], [-15.8, -13.0]]);
  return ground(28, 0, 0.4)
    // Patas del otro lado, en sombra.
    + body([farFore, farHind], far)
    + clip([farFore, farHind], paint('M -30 -30 L 30 -30 L 30 2 L -30 2 Z', SHADOW, 0.14, 'blur')
      + soft(`M ${round(-16.8 + 1.3)} -10 L ${round(-16.8 + 1.1)} -2`, 1.4, 0.18) + soft('M 12.8 -10 L 12.8 -2', 1.4, 0.18))
    + foot(round(11.6 + 0.3), 1.4, hoof, true) + foot(round(-16.8 + 0.3), 1.4, hoof, true)
    // La ubre, entre las patas de atras, con sus pezones.
    + `<path d="${udder}" fill="${muzzle}"/>` + volume(udder, 'ball')
    + stroke('M -13.6 -11.0 v 1.8 M -11.4 -10.6 v 2.0 M -9.2 -11.0 v 1.8', 0.75, darker(muzzle, 0.12))
    + body(all, hide)
    + clip(all, spots.map((d) => `<path d="${d}" fill="${spot}"/>`).join(''))
    + all.slice(0, 2).map((d) => volume(d, 'clothV')).join('')
    + clip(all, paint(smooth([[19.4, -20], [16.4, -16.6], [6, -13.6], [-6, -13.0], [-13.8, -16.4], [-16.4, -18.2], [-15, -21.6], [-6, -19.4], [6, -19.0], [16, -22.0]]), SHADOW, 0.28)
      + paint(smooth([[-24, -38.2], [-14, -38.8], [-2, -37.2], [12, -38.2], [17, -40.2], [13, -35.0], [-2, -34.4], [-14, -35.4], [-23, -35.6]]), '#FFFFFF', 0.5)
      + glowSpot(-14.0, -36.4, 3.0, 1.6, 'spec', 0.5) + glowSpot(14.6, -28.4, 3.0, 5.0, 'spec', 0.24, -10)
      + soft('M -12.6 -35.6 Q -11.6 -28 -15.6 -20.4', 1.6, 0.14) + soft('M 11.6 -34.8 Q 10.2 -27 11.8 -20', 1.6, 0.13)
      + soft('M -23.6 -35.4 Q -25 -30 -24.2 -24', 1.2, 0.12) + soft('M -10 -24 Q -2 -22.4 8 -23.4', 2.2, 0.06)
      + glowSpot(16.6, -11, 0.8, 3.2, 'spec', 0.32) + glowSpot(-18.6, -12.6, 0.8, 2.6, 'spec', 0.3, 20))
    + pelt(all, hide, [-27, -43, 42, -2], 420, 81, { len: 1.0, opacity: 0.75 })
    + clip(all, pelt(spots, spot, [-27, -42, 34, -8], 260, 82, { len: 1.0 }))
    // Pezunas de este lado.
    + foot(round(15.2 + 0.3), 1.5, hoof, true) + foot(round(-20.4 + 0.3), 1.5, hoof, true)
    // Cola fina con su borla de pelo, colgando junto a la nalga.
    + stroke('M -24.4 -37.0 Q -27.6 -33.6 -27.2 -25 Q -26.9 -19 -27.4 -14.6', 0.95, darker(hide, 0.32))
    + stroke('M -24.4 -37.0 Q -27.6 -33.6 -27.2 -25 Q -26.9 -19 -27.4 -14.6', 0.55, hide)
    + organic([[-27.4, -15.6], [-26.2, -12.6], [-26.6, -8.8], [-27.8, -7.2], [-29.2, -9.4], [-28.8, -12.8]], spot, 'vol', INNER)
    + fur('M -27.6 -12 l -0.4 3.8 M -27 -12.4 l 0.2 3.6 M -28.2 -11.6 l -0.9 3.2 M -27.3 -10 l -0.3 2.6', '#5A5B68', 0.2)
    // Oreja horizontal y cuernos cortos.
    + organic([[24.6, -41.0], [21.0, -42.8], [18.4, -41.8], [20.6, -39.8], [24.2, -39.4]], hide, 'vol', INNER)
    + `<path d="${smooth([[23.6, -40.8], [21.0, -41.8], [19.8, -41.4], [21.4, -40.4]])}" fill="#EBB4BC"/>`
    + organic([[25.2, -42.2], [24.6, -45.4], [25.6, -46.8], [26.8, -43.2]], '#EADBB8', 'side', INNER)
    // La cara: luz en la frente, sombra en la quijada, morro humedo, ollar,
    // boca y el ojo grande.
    + clip([head], paint('M 24 -31 Q 31 -26.4 37 -25.6 L 37 -24 L 24 -24 Z', SHADOW, 0.25, 'blur') + glowSpot(29.4, -40.4, 2.6, 1.0, 'spec', 0.5, 30)
      + soft('M 27.2 -33.6 Q 30 -30.4 34.4 -28.8', 1.4, 0.1))
    + organic([[37.2, -31.6], [39.8, -30.4], [41.3, -28.0], [40.8, -25.3], [38.2, -24.5], [36.6, -26.4], [36.2, -29.2]], muzzle, 'ball', INNER)
    + `<g fill="${darker(muzzle, 0.3)}" fill-opacity="0.5"><circle cx="38" cy="-27.6" r="0.18"/><circle cx="38.8" cy="-26.6" r="0.18"/><circle cx="37.6" cy="-26.2" r="0.16"/><circle cx="39.4" cy="-27.4" r="0.16"/></g>`
    + glowSpot(39.4, -29.8, 1.3, 0.6, 'spec', 0.55, 30)
    + `<ellipse cx="39.9" cy="-28.6" rx="0.85" ry="0.48" fill="#5E2E38" transform="rotate(-35 39.9 -28.6)"/>`
    + stroke('M 40.4 -25.6 L 37.6 -25.4', 0.3, darker(muzzle, 0.45))
    + eye(30.4, -36.6, 1.1, '#3B2416', { lid: '#3A3440' })
    + fur('M 32.6 -33.4 q 1.2 1 1 2.4 M 29.2 -32.6 q 1 1 0.8 2.4', '#BDB6A8', 0.24);
}

/** La cabra blanca con cuernos y barba. */
export function goat() {
  const hide = '#F3EEE3';
  const far = '#E2DCCF';
  const horn = '#9C8E7A';
  const hoof = '#5E554A';
  const torso = smooth([
    [-20.6, -27.0], [-17.4, -28.6], [-14.0, -28.8], [-8.0, -27.6], [0.0, -27.2], [7.0, -28.0], [10.6, -30.6], [13.4, -34.4],
    [16.6, -31.4], [17.2, -27.0], [15.6, -23.4], [14.2, -19.4], [11.6, -15.6], [5.0, -13.8], [-2.0, -13.2], [-8.6, -13.8],
    [-12.6, -15.6], [-15.4, -17.2], [-19.4, -17.6], [-21.8, -20.4], [-22.0, -24.4],
  ]);
  const head = smooth([
    [12.8, -33.6], [14.6, -36.6], [17.4, -37.6], [19.6, -36.0], [21.6, -32.8], [23.8, -29.2], [24.8, -27.2], [24.2, -25.4],
    [22.4, -24.6], [20.2, -25.4], [17.6, -27.0], [15.6, -28.6],
  ]);
  const fore = foreleg(11.4, 0.82, -18);
  const hind = hindleg(-17.4, 0.82, -21);
  const farFore = foreleg(8.4, 0.78, -16);
  const farHind = hindleg(-14.4, 0.78, -19);
  const all = [torso, head, fore, hind];
  return ground(21, 0, 0.4)
    + body([farFore, farHind], far)
    + clip([farFore, farHind], paint('M -25 -25 L 25 -25 L 25 2 L -25 2 Z', SHADOW, 0.14, 'blur'))
    + foot(round(8.4 + 0.2), 1.1, hoof, true) + foot(round(-14.4 + 0.2), 1.1, hoof, true)
    // Cola corta, levantada.
    + organic([[-20.2, -26.6], [-22.8, -30.8], [-21.6, -31.8], [-19.2, -28.4]], hide, 'vol', INNER)
    + body(all, hide)
    + all.slice(0, 2).map((d) => volume(d, 'clothV')).join('')
    + clip(all, paint(smooth([[14.2, -19.2], [11.6, -14.8], [-2, -12.6], [-12.6, -14.6], [-15.4, -16.6], [-14.6, -20.0], [-8, -17.6], [4, -17.6], [12, -20.0]]), SHADOW, 0.28)
      + paint(smooth([[-20, -27.8], [-14, -29.6], [-8, -28.8], [7, -28.8], [12, -31.8], [9, -25.6], [-8, -25.2], [-19, -25.4]]), '#FFFFFF', 0.5)
      + glowSpot(-14.0, -27.6, 3.0, 1.4, 'spec', 0.42) + glowSpot(10.6, -22.6, 2.4, 4.0, 'spec', 0.24, -10)
      + soft('M -11.4 -27.0 Q -10.6 -21 -13.4 -16.0', 1.4, 0.12) + soft('M 7.8 -26.2 Q 6.8 -20 8.4 -15.4', 1.4, 0.12)
      + soft('M -14.6 -16.4 Q -15.6 -12.6 -18.0 -10.4', 0.8, 0.16)
      + glowSpot(12.4, -10.6, 0.6, 2.6, 'spec', 0.3) + glowSpot(-15.4, -12.4, 0.6, 2.2, 'spec', 0.28, 20))
    // Pelo largo que cae.
    + pelt([torso, head], hide, [-22, -38, 25, -12], 320, 91, { dir: [-0.35, 1], len: 1.9, opacity: 0.9 })
    + pelt([fore, hind], hide, [-22, -16, 15, -2], 60, 92, { dir: [0, 1], len: 1.0, opacity: 0.8 })
    + foot(round(11.4 + 0.2), 1.15, hoof, true) + foot(round(-17.4 + 0.2), 1.15, hoof, true)
    // Cuernos curvos hacia atras, con anillos.
    + organic([[15.0, -36.6], [13.0, -40.6], [10.8, -43.4], [11.4, -44.2], [14.4, -41.6], [16.6, -37.4]], horn, 'side', INNER)
    + organic([[16.4, -37.2], [15.0, -41.0], [13.4, -44.0], [14.2, -44.6], [16.8, -41.6], [18.0, -37.4]], darker(horn, 0.06), 'side', INNER)
    + stroke('M 12.6 -40.4 l 1.6 0.6 M 11.8 -42 l 1.4 0.8 M 15.2 -40.8 l 1.4 0.4 M 14.4 -42.6 l 1.4 0.6', 0.24, darker(horn, 0.32))
    // Oreja caida.
    + organic([[15.6, -34.0], [11.8, -33.6], [9.0, -31.6], [9.8, -30.6], [13.4, -31.2], [15.8, -32.2]], hide, 'vol', INNER)
    + `<path d="${smooth([[14.6, -33.2], [11.8, -32.8], [10.2, -31.6], [12.6, -31.6]])}" fill="#EBC9C4"/>`
    // Barba.
    + organic([[20.6, -25.2], [22.4, -24.8], [21.8, -21.0], [20.8, -18.6], [20.0, -21.6]], '#E4DCCB', 'vol', INNER)
    + fur('M 21.0 -23.6 l -0.2 3.2 M 21.6 -23.6 l 0 3.6 M 20.6 -22.4 l -0.2 2', '#C4BAA6', 0.2)
    // Hocico, ollar, boca y ojo (pupila horizontal, como las cabras).
    + clip([head], paint('M 15 -28.4 Q 20 -26 24 -25.8 L 24 -24 L 15 -24 Z', SHADOW, 0.22, 'blur') + glowSpot(17.6, -36.4, 2.4, 0.9, 'spec', 0.45, 15))
    + `<ellipse cx="23.8" cy="-27.8" rx="0.6" ry="0.4" fill="#6A5E52" transform="rotate(-30 23.8 -27.8)"/>`
    + stroke('M 24.4 -25.6 L 22.0 -25.4', 0.28, '#8A7E6E')
    + `<circle cx="18.7" cy="-32.6" r="1.25" fill="#2A2420" fill-opacity="0.8"/>`
    + `<circle cx="18.7" cy="-32.6" r="1.1" fill="#C9A23A"/>`
    + `<circle cx="18.7" cy="-32.6" r="1.1" fill="${grad('ball')}"/>`
    + `<rect x="17.8" y="-32.92" width="1.8" height="0.64" rx="0.3" fill="#14141C"/>`
    + `<circle cx="18.3" cy="-33.1" r="0.28" fill="#FFFFFF"/>`
    + stroke('M 17.2 -33.8 Q 18.7 -34.8 20.2 -33.8', 0.28, '#6A5E52');
}
