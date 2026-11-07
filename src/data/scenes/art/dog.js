// @ts-check
// El perro marron de las escenas (como un labrador), de lado y mirando a la
// derecha, con los pies en y = 0: de pie, sentado, corriendo o dormido, para que
// el dibujo diga lo mismo que la frase ("The dog is sitting under the table").
// Dibujado por anatomia: pecho hondo, vientre recogido, muslo, corvejon y
// metatarso en las patas de atras, antebrazo y carpo en las de delante, cabeza
// con su stop y su hocico. La luz pinta el lomo, la paletilla y el muslo, la
// sombra el vientre, y el pelo corto va peinado hacia la cola. Cabe donde cabia
// el perro de antes, para que las escenas sigan diciendo la verdad.

import { stroke, ground, darker, round, smooth, tube, glowSpot } from './style.js';
import { fx } from './defs.js';
import { joined, paw, eye, fur, clip, paint, pelt } from './fur.js';

/** @typedef {[number, number]} Point */
/** @typedef {'stand' | 'sit' | 'run' | 'sleep'} Pose */

const COAT = '#B8793F';
const LIGHT = '#DDAA72';
const FAR = darker(COAT, 0.22);
const NOSE = '#2A2226';
const SHADOW = '#2A1408';
const SUN = '#FFF1D8';

/** La cabeza de pie (las demas posturas la mueven). Empieza dentro del cuello. */
const HEAD = [
  [13.6, -33.2], [16.4, -36.2], [19.6, -37.2], [22.6, -36.5], [24.4, -35.0], [27.4, -34.4], [30.4, -33.8], [32.0, -32.6],
  [32.4, -30.9], [31.8, -29.6], [31.2, -28.4], [29.6, -27.3], [27.0, -27.0], [24.6, -27.2], [22.0, -27.6], [19.6, -28.0], [17.6, -26.6], [15.0, -28.6],
];

/** La oreja caida, de pie (corriendo vuela hacia atras). */
const EAR = [[16.8, -35.8], [18.8, -36.6], [20.8, -35.8], [21.6, -33.4], [21.2, -30.2], [19.8, -27.8], [18.4, -28.4], [17.4, -30.8], [16.6, -33.4]];
const EAR_FLYING = [[16.8, -35.8], [18.8, -36.6], [20.6, -35.6], [19.4, -33.6], [16.6, -31.6], [13.8, -30.8], [13.6, -32.4], [15.0, -34.6]];

/** Mueve unos puntos. @param {number[][]} pts @param {number} dx @param {number} dy @returns {Point[]} */
const at = (pts, dx, dy) => pts.map(([x, y]) => /** @type {Point} */ ([round(x + dx), round(y + dy)]));

/** Sombra blanda a lo largo de un trazo (el borde de un musculo). @param {string} d @param {number} w @param {number} opacity */
const soft = (d, w, opacity) => `<path d="${d}" fill="none" stroke="${SHADOW}" stroke-opacity="${opacity}" stroke-width="${w}" stroke-linecap="round" filter="${fx('blur2')}" pointer-events="none"/>`;

/** Pata de delante recta: antebrazo, carpo y metacarpo; x es el antebrazo. @param {number} x */
const foreleg = (x) => smooth([
  [x - 2.6, -19.0], [x + 2.4, -18.6], [x + 2.2, -13.6], [x + 1.6, -9.0], [x + 1.3, -4.8], [x + 1.8, -2.4], [x + 2.6, -1.0],
  [x - 0.6, -0.8], [x - 0.8, -2.8], [x - 1.2, -4.8], [x - 1.4, -9.0], [x - 2.2, -13.0], [x - 3.0, -16.0],
]);

/** Pata de atras de pie: muslo, babilla, pierna, corvejon y metatarso; x es el metatarso. @param {number} x */
const hindleg = (x) => smooth([
  [x + 4.6, -21.0], [x + 5.4, -15.8], [x + 4.2, -12.6], [x + 1.8, -8.8], [x + 0.8, -5.4], [x + 1.2, -2.6], [x + 2.0, -1.0],
  [x - 1.2, -0.8], [x - 1.4, -3.0], [x - 2.2, -6.0], [x - 2.4, -9.0], [x - 3.2, -13.0], [x - 4.4, -17.4], [x - 3.8, -21.0], [x + 0.6, -22.0],
]);

/** Una pata que no toca el suelo (corriendo). @param {number} x @param {number} y @param {number} a */
const flyingPaw = (x, y, a) => `M ${round(x - 1.75)} ${y} a 2.05 1.3 ${a} 1 0 3.5 0 a 2.05 1.3 ${a} 1 0 -3.5 0 Z`;

/** Una pata de delante tumbada en el suelo. @param {number} x */
const restingPaw = (x) => `M ${round(x - 2.6)} -1.25 a 2.6 1.25 0 1 0 5.2 0 a 2.6 1.25 0 1 0 -5.2 0 Z`;

/**
 * Cada postura: donde va la cabeza, la silueta del cuerpo (con el cuello), las
 * patas de este lado (que se unen al cuerpo) y las del otro lado (detras, en
 * sombra), la cola, y donde caen la luz y la sombra.
 * @typedef {{
 *   head: Point, torso: number[][], near: string[], far: string[], tail: [number, number, number][],
 *   back: number[][], belly: number[][], shoulder: [number, number, number], thigh: [number, number, number, number, number],
 *   muscles: string, ground: [number, number], box: [number, number, number, number], dir: Point,
 *   legBox: [number, number, number, number], legDir: Point, toes: number[],
 * }} Shape
 */

/** @type {Record<Pose, () => Shape>} */
const POSES = {
  stand: () => ({
    head: [0, 0],
    torso: [[-16.4, -25.2], [-12.4, -26.8], [-6.0, -26.2], [0.6, -26.4], [6.4, -27.5], [10.0, -30.0], [13.6, -33.8], [17.2, -30.6],
      [18.4, -26.4], [17.2, -23.4], [16.0, -20.6], [15.0, -17.0], [12.4, -13.9], [8.0, -12.7], [2.0, -12.9], [-3.4, -13.8],
      [-7.6, -15.3], [-10.2, -15.8], [-14.2, -15.6], [-17.6, -17.2], [-18.4, -21.0]],
    near: [foreleg(9.8), hindleg(-13.8), paw(10.7, 2.05), paw(-14.0, 2.0)],
    far: [foreleg(6.0), paw(6.8, 1.9), hindleg(-10.6), paw(-10.8, 1.9)],
    tail: [[-16.2, -24.9, 2.0], [-19.2, -26.8, 1.6], [-20.9, -29.6, 1.1], [-21.5, -32.4, 0.45]],
    back: [[-17, -25.8], [-6, -27.0], [6, -28.0], [11, -31], [8, -25.6], [-6, -24.4], [-16, -23.6]],
    belly: [[15.4, -17.4], [12.4, -13.0], [2, -12.0], [-7, -14.6], [-11, -14.4], [-10, -17.6], [-6, -17.8], [2, -15.6], [10.6, -16.4]],
    shoulder: [11.2, -21.6, -25],
    thigh: [-13.6, -20.6, 3.8, 4.6, 10],
    muscles: soft('M 6.8 -25.4 Q 5.4 -20 7.2 -14.6', 1.6, 0.16) + soft('M -8.0 -23.4 Q -7.0 -19 -8.8 -15.8', 1.6, 0.18)
      + soft('M -15.6 -14.4 Q -15.8 -10.6 -16.6 -7.6', 0.9, 0.16) + soft('M 7.8 -13.4 Q 8.4 -9 8.6 -5', 0.8, 0.14)
      + glowSpot(11.2, -9, 1.0, 3.6, 'spec', 0.22) + glowSpot(-9.4, -10.2, 1.0, 3.0, 'spec', 0.2, 30)
      + paint(smooth([[16.6, -21.6], [17.6, -19.6], [15.6, -15.4], [12.6, -13.4], [13.8, -17.6]]), LIGHT, 0.5, 'blur'),
    ground: [21, 2.5],
    box: [-19, -38, 33, -12],
    dir: [-1, 0.15],
    legBox: [-19, -15.4, 15, 0],
    legDir: [0.05, 1],
    toes: [10.4, 11.8, -14.4, -13.0],
  }),
  sit: () => ({
    head: [-1.6, -3.4],
    torso: [[-10.4, -18.2], [-5.0, -24.0], [0.4, -27.8], [4.8, -30.6], [8.4, -33.2], [12.0, -36.6], [15.6, -33.8], [16.8, -29.6],
      [16.0, -26.4], [15.4, -23.4], [14.6, -19.6], [12.0, -16.4], [8.2, -15.2], [4.0, -12.8], [1.0, -9.0], [-1.2, -4.6],
      [-4.6, -1.4], [-9.6, -0.8], [-13.0, -2.4], [-14.0, -7.0], [-13.2, -13.2]],
    near: [tube([[-9.4, -1.6, 1.5], [-3.6, -1.4, 1.35], [1.4, -1.3, 1.3]]), paw(2.6, 2.0),
      smooth([[-12.2, -14.4], [-8.0, -16.8], [-3.2, -15.0], [0.6, -10.6], [1.6, -6.0], [-0.4, -3.0], [-5.2, -2.2], [-10.4, -3.2], [-13.2, -7.4]]),
      foreleg(10.2), paw(11.1, 2.05)],
    far: [foreleg(6.6), paw(7.4, 1.9)],
    tail: [[-12.2, -3.0, 1.9], [-16.8, -1.9, 1.5], [-20.6, -1.4, 1.05], [-23.0, -1.2, 0.45]],
    back: [[-11, -18.6], [-5, -24.6], [1, -28.6], [5.4, -31.4], [9, -34], [7, -29.4], [1, -25.6], [-4, -21.6], [-9.6, -16.4]],
    belly: [[14.6, -19], [12, -15.6], [8, -14.4], [3.4, -11.6], [0.4, -6], [-2, -3], [1, -3.4], [3.6, -8.8], [6.8, -12.8], [11, -15.4]],
    shoulder: [10.6, -24.0, -15],
    thigh: [-6.0, -12.0, 4.4, 3.4, -20],
    muscles: soft('M 1.2 -11.6 Q 2.2 -6 -0.4 -3.0 Q -4 -1.8 -8.6 -2.6', 1.4, 0.32) + soft('M -12.6 -13.6 Q -8.2 -17.8 -3.0 -15.6 Q 0.4 -13.8 1.4 -10.6', 1.2, 0.26)
      + glowSpot(-6.6, -14.0, 4.6, 1.3, 'spec', 0.3, 8)
      + soft('M 6.4 -27 Q 5.2 -21.6 7.0 -16.4', 1.6, 0.16) + soft('M 8.2 -14.6 Q 8.8 -9 9.0 -5', 0.8, 0.14)
      + glowSpot(11.6, -9, 1.0, 3.6, 'spec', 0.22)
      + paint(smooth([[15.8, -24.6], [16.6, -22.6], [14.8, -18.4], [12.0, -16.2], [13.2, -20.6]]), LIGHT, 0.5, 'blur'),
    ground: [18, -2],
    box: [-15, -41, 32, 0],
    dir: [-0.6, 0.8],
    legBox: [-14, -18, 15, 0],
    legDir: [-0.2, 1],
    toes: [10.8, 12.2, 2.4, 3.8],
  }),
  run: () => ({
    head: [1.4, 2.2],
    torso: [[-16.6, -24.0], [-12.4, -26.0], [-6.0, -25.8], [0.6, -25.4], [6.8, -26.4], [11.0, -28.6], [15.0, -31.4], [18.2, -28.2],
      [19.2, -24.6], [18.0, -21.8], [16.6, -19.2], [15.0, -16.2], [12.0, -13.6], [7.6, -12.8], [1.6, -13.4], [-3.4, -14.4],
      [-7.4, -16.0], [-10.4, -16.6], [-14.4, -16.6], [-18.0, -18.0], [-18.8, -21.4]],
    near: [tube([[9.2, -17, 2.6], [12.4, -11.6, 1.9], [16.2, -7.0, 1.5], [19.4, -4.6, 1.4]]), flyingPaw(20.8, -3.6, 30),
      tube([[-12.6, -19.6, 3.8], [-14.8, -13.4, 2.4], [-18.4, -8.8, 1.5], [-21.4, -6.0, 1.4]]), flyingPaw(-22.6, -5.2, -25)],
    far: [tube([[6.2, -14.6, 2.2], [10.2, -9.0, 1.7], [14.2, -5.2, 1.4], [16.8, -3.4, 1.3]]), flyingPaw(18.0, -2.8, 30),
      tube([[-9.6, -16.4, 2.8], [-12.2, -10.6, 1.9], [-15.8, -6.6, 1.4], [-18.4, -4.4, 1.3]]), flyingPaw(-19.4, -3.8, -20)],
    tail: [[-16.4, -23.6, 1.9], [-19.8, -24.6, 1.5], [-22.6, -26.0, 1.0], [-24.4, -27.2, 0.45]],
    back: [[-17, -24.8], [-6, -26.6], [6.6, -27.4], [12, -30], [9, -25], [-6, -23.8], [-16, -22.8]],
    belly: [[16, -17], [12.2, -12.6], [1.6, -12.4], [-7.4, -15.2], [-12, -15.4], [-11, -18.2], [-6, -18], [2, -15.8], [11, -16]],
    shoulder: [11.0, -21.0, -35],
    thigh: [-13.6, -19.6, 3.8, 4.6, 25],
    muscles: soft('M 7.0 -24.6 Q 5.8 -19.6 8.0 -15', 1.6, 0.16) + soft('M -8.6 -23.0 Q -8.0 -19 -10.4 -16', 1.6, 0.18)
      + paint(smooth([[17.4, -20.4], [18.2, -18.6], [16.2, -14.6], [13.2, -12.8], [14.6, -16.8]]), LIGHT, 0.5, 'blur'),
    ground: [19, 0],
    box: [-20, -36, 34, -12],
    dir: [-1, 0.1],
    legBox: [-24, -16, 22, -2],
    legDir: [0.3, 1],
    toes: [],
  }),
  sleep: () => ({
    head: [-2, 23.4],
    torso: [[-16.4, -10.6], [-12.0, -14.2], [-4.6, -15.8], [2.4, -16.2], [8.0, -16.8], [11.0, -15.6], [13.6, -12.8], [15.0, -7.0],
      [14.0, -2.6], [11.0, -0.9], [6.0, -0.8], [-4.0, -0.9], [-10.6, -1.0], [-15.4, -2.2], [-17.8, -5.6]],
    near: [tube([[-8.0, -3.0, 1.6], [-3.4, -1.6, 1.4], [0.6, -1.3, 1.3]]), paw(1.8, 1.9),
      smooth([[-15.6, -11.0], [-11.2, -13.4], [-6.4, -12.0], [-4.8, -7.0], [-7.2, -2.6], [-12.8, -2.0], [-16.2, -5.0]]),
      tube([[8.6, -4.6, 2.4], [14.6, -2.4, 1.8], [20.0, -1.6, 1.5]]), restingPaw(22.2)],
    far: [tube([[6.4, -4.0, 2.0], [12.0, -2.2, 1.6], [16.4, -1.6, 1.4]]), restingPaw(18.2)],
    tail: [[-16.4, -6.0, 1.8], [-20.0, -3.4, 1.4], [-22.6, -1.8, 0.95], [-23.6, -1.2, 0.45]],
    back: [[-16, -11.6], [-10, -14.8], [0, -16.6], [8, -17.4], [12, -16.6], [8, -14.8], [0, -14.4], [-10, -12.6], [-15, -9.6]],
    belly: [[14, -3], [8, -0.6], [-4, -0.4], [-15, -1.6], [-16, -3.6], [-4, -2.8], [8, -2.6]],
    shoulder: [9.0, -10.0, -10],
    thigh: [-10.4, -9.0, 4.0, 3.2, -10],
    muscles: soft('M -4.6 -10.6 Q -4.2 -6 -6.8 -2.8 Q -10 -1.8 -13.6 -2.2', 1.2, 0.2) + soft('M 6.0 -14.6 Q 5.0 -9 6.6 -4.4', 1.6, 0.14),
    ground: [23, 2],
    box: [-18, -17, 31, 0],
    dir: [-1, 0.1],
    legBox: [-17, -14, 26, 0],
    legDir: [-1, 0.2],
    toes: [1.6, 3.0],
  }),
};

/**
 * La cara: luz del craneo y de la mejilla, sombra bajo la mandibula, la oreja,
 * el ojo (o el ojo cerrado), la trufa, la boca y la lengua si corre.
 * @param {number} hx @param {number} hy @param {Pose} pose
 */
function face(hx, hy, pose) {
  const head = smooth(at(HEAD, hx, hy));
  const ear = smooth(at(pose === 'run' ? EAR_FLYING : EAR, hx, hy));
  const X = (/** @type {number} */ x) => round(x + hx);
  const Y = (/** @type {number} */ y) => round(y + hy);
  const light = clip([head], glowSpot(X(19.8), Y(-35.6), 3.6, 1.6, 'spec', 0.32)
    + glowSpot(X(22.4), Y(-31.2), 3.0, 2.2, 'spec', 0.16)
    + glowSpot(X(28.4), Y(-33.4), 2.6, 0.7, 'spec', 0.3)
    + paint(`M ${X(16)} ${Y(-28.4)} Q ${X(22)} ${Y(-29.4)} ${X(30.6)} ${Y(-29.0)} L ${X(30)} ${Y(-26.6)} L ${X(16)} ${Y(-26)} Z`, SHADOW, 0.3, 'blur')
    + soft(`M ${X(24.2)} ${Y(-35.2)} Q ${X(24.8)} ${Y(-33.6)} ${X(26.2)} ${Y(-33)}`, 0.6, 0.2));
  const flap = paint(pose === 'run'
    ? `M ${X(19)} ${Y(-33.6)} Q ${X(16)} ${Y(-31)} ${X(13.4)} ${Y(-30.2)} L ${X(13)} ${Y(-28.6)} Q ${X(17)} ${Y(-29.4)} ${X(19.6)} ${Y(-32)} Z`
    : `M ${X(21.2)} ${Y(-33.6)} Q ${X(22.4)} ${Y(-30.4)} ${X(20.4)} ${Y(-27.4)} L ${X(22.4)} ${Y(-27.2)} Q ${X(23.4)} ${Y(-30.6)} ${X(22.2)} ${Y(-33.8)} Z`, SHADOW, 0.42, 'blur')
    + `<path d="${ear}" fill="${darker(COAT, 0.12)}" stroke="${darker(COAT, 0.45)}" stroke-opacity="0.35" stroke-width="0.3"/>`
    + clip([ear], paint(`M ${X(20.8)} ${Y(-34)} Q ${X(21.8)} ${Y(-30)} ${X(19.6)} ${Y(-27.4)} L ${X(23)} ${Y(-27)} L ${X(23)} ${Y(-35)} Z`, SHADOW, 0.3, 'blur')
      + glowSpot(X(18.6), Y(-34.4), 1.6, 1.4, 'spec', 0.3)
      + paint(`M ${X(16.6)} ${Y(-35.4)} Q ${X(18.8)} ${Y(-36.8)} ${X(21)} ${Y(-35.4)} L ${X(21)} ${Y(-34.6)} Q ${X(18.8)} ${Y(-35.6)} ${X(16.6)} ${Y(-34.6)} Z`, SHADOW, 0.25, 'blur'));
  const look = pose === 'sleep'
    ? stroke(`M ${X(22.4)} ${Y(-32.6)} q 1.1 0.8 2.2 0`, 0.42, darker(COAT, 0.6))
    : eye(X(23.5), Y(-32.8), 0.9, '#4A2A12', { lid: darker(COAT, 0.45) });
  const nose = `<path d="${smooth(at([[30.5, -33.4], [32.2, -32.8], [32.8, -31.2], [32.1, -29.9], [30.8, -30.2], [30.2, -31.8]], hx, hy))}" fill="${NOSE}"/>`
    + glowSpot(X(31.2), Y(-32.4), 1.0, 0.45, 'spec', 0.55)
    + `<ellipse cx="${X(32.1)}" cy="${Y(-30.8)}" rx="0.42" ry="0.28" fill="#08080C"/>`;
  const mouth = pose === 'run'
    ? `<path d="${smooth(at([[28.2, -29.0], [30.0, -28.8], [29.4, -26.4], [28.2, -25.6], [27.2, -26.8]], hx, hy))}" fill="#D9707C"/>`
      + stroke(`M ${X(31)} ${Y(-29.4)} Q ${X(28.6)} ${Y(-27.6)} ${X(25)} ${Y(-28.4)}`, 0.4, darker(COAT, 0.6))
    : stroke(`M ${X(31.2)} ${Y(-29.2)} Q ${X(29.6)} ${Y(-28.3)} ${X(27.0)} ${Y(-28.5)} Q ${X(25.4)} ${Y(-28.6)} ${X(24.7)} ${Y(-28.9)}`, 0.34, darker(COAT, 0.58))
      + paint(`M ${X(31)} ${Y(-28.6)} Q ${X(28.6)} ${Y(-27.6)} ${X(24.8)} ${Y(-28.2)} L ${X(25)} ${Y(-27)} L ${X(31)} ${Y(-27)} Z`, SHADOW, 0.22, 'blur');
  const whiskers = `<g fill="${darker(COAT, 0.5)}" fill-opacity="0.8"><circle cx="${X(28.2)}" cy="${Y(-30.4)}" r="0.16"/><circle cx="${X(29.2)}" cy="${Y(-30.8)}" r="0.16"/><circle cx="${X(28.6)}" cy="${Y(-29.6)}" r="0.16"/></g>`;
  return { head, light, ear: flap, details: look + nose + mouth + whiskers };
}

/**
 * El perro en una postura.
 * @param {{ pose?: Pose }} [o]
 */
export function dog(o = {}) {
  const pose = o.pose ?? 'stand';
  const p = POSES[pose]();
  const f = face(p.head[0], p.head[1], pose);
  const torso = smooth(/** @type {Point[]} */ (p.torso));
  const near = [torso, ...p.near];
  const [tx, ty, trx, try_, trot] = p.thigh;
  return ground(p.ground[0], p.ground[1], 0.4)
    + joined(p.far, FAR, 0) + clip(p.far, paint('M -30 -40 L 40 -40 L 40 2 L -30 2 Z', SHADOW, 0.28, 'blur'))
    + joined([tube(p.tail)], COAT, 1, 'side')
    + joined([torso, f.head, ...p.near], COAT, 2, 'clothV')
    + clip(near, paint(smooth(/** @type {Point[]} */ (p.belly)), SHADOW, 0.52)
      + paint(smooth(/** @type {Point[]} */ (p.back)), SUN, 0.44)
      + glowSpot(p.shoulder[0], p.shoulder[1], 3.2, 5.0, 'spec', 0.26, p.shoulder[2])
      + glowSpot(tx, ty, trx, try_, 'spec', 0.3, trot)
      + p.muscles)
    + f.light
    + pelt([torso, f.head], COAT, p.box, 520, 31, { len: 1.0, dir: p.dir })
    + pelt(p.near, COAT, p.legBox, 120, 32, { dir: p.legDir, len: 0.9 })
    + (p.toes.length ? `<g opacity="0.55">${fur(p.toes.map((x) => `M ${x} -0.1 v -0.9`).join(' '), darker(COAT, 0.5), 0.22)}</g>` : '')
    + f.ear + f.details;
}
