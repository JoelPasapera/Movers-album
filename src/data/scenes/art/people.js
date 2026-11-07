// @ts-check
// Las personas de todas las escenas, pintadas como una ilustracion realista:
// proporciones de verdad (un nino de nueve anos mide unas seis cabezas y un
// adulto unas siete y media), cuerpo con hombros, cintura, codos y rodillas en
// vez de tubos y rectangulos, sin raya negra de comic (los bordes los hacen la
// luz y la sombra), piel con sombra calida, ropa con pliegues difuminados, pelo
// hecho de mechones y una cara con parpados, iris, nariz dibujada solo con
// sombra y labios. La camiseta es del color que diga la escena: es lo que se
// pregunta ("The boy's T-shirt is green").
//
// Opciones (todas opcionales):
//   who   'boy' | 'girl' | 'man' | 'woman'  (si falta: adulto si tall, si no nino)
//   shirt color de la camiseta        hair  color del pelo (gris: persona mayor)
//   tall  adulto (compatibilidad)     mood  'happy' | 'sad' | 'scared'
//   skin  tono de piel (si falta, uno fijo para ese personaje)
//   nose  color de una nariz de payaso (el payaso del circo)
//   arm   'up' (brazo derecho en alto: sujeta una cometa, coge un sombrero) |
//         'hold' (la mano a la altura del pecho: sujeta un helado, una camara)
//   waist solo de cintura para arriba (sentado dentro de un barco)
// Lo que se sujeta lo pone pieces.js en la mano (opcion holds de la persona);
// quien va en bici lo dibuja la bici (rider). Los pies quedan en y = 0; un nino
// mide unas 61 unidades y un adulto unas 79, como los dibujos anteriores: las
// escenas no se descolocan.

import {
  SKINS, CLOTH, darker, lighter, mix, isGrey, hash, round, smooth, tube, seeded, glowSpot, crease, rgb,
} from './style.js';
import { grad, fx, uid } from './defs.js';

/**
 * @typedef {'boy' | 'girl' | 'man' | 'woman'} Who
 * @typedef {[number, number]} Point
 * @typedef {{ who?: Who, shirt?: string, hair?: string, tall?: boolean, mood?: string, skin?: string, nose?: string,
 *   arm?: 'up' | 'hold', reach?: [Point, Point], waist?: boolean, inHand?: string }} PersonOptions
 * @typedef {{ adult: boolean, cy: number, rx: number, ry: number, jaw: number, neck: [number, number, number],
 *   torso: Point[], sleeve: number, shoulder: Point, elbow: Point, wrist: Point, arm: number[], hand: number,
 *   hip: Point, knee: Point, ankle: Point, leg: number[], shoe: number, up: [Point, Point], hold: [Point, Point] }} Rig
 */

/** Un nino o una nina de nueve anos. @type {Rig} */
const CHILD = {
  adult: false, cy: -54.15, rx: 4.4, ry: 5.35, jaw: 0.92,
  neck: [-50.8, -45.6, 1.62],
  torso: [[0, -45.2], [1.8, -46.35], [3.9, -46.0], [6.0, -45.25], [6.55, -43.7], [5.75, -41.3], [5.45, -38.3], [5.25, -35.3],
    [5.5, -31.9], [5.95, -29.2], [3.6, -28.45], [0, -28.15]],
  sleeve: 4.4,
  shoulder: [5.7, -44.3], elbow: [7.25, -37.2], wrist: [7.8, -30.0],
  arm: [1.3, 1.16, 0.95, 1.0, 0.74],
  hand: 3.3,
  hip: [2.65, -29.4], knee: [2.75, -15.8], ankle: [2.6, -3.5],
  leg: [2.55, 2.32, 1.72, 1.98, 1.08],
  shoe: 1.95,
  up: [[8.7, -50.6], [9.4, -57.0]],
  hold: [[7.25, -37.2], [8.7, -41.6]],
};

/** Un hombre. @type {Rig} */
const MAN = {
  adult: true, cy: -71.95, rx: 4.5, ry: 5.55, jaw: 0.97,
  neck: [-68.2, -63.0, 1.95],
  torso: [[0, -62.7], [2.2, -64.05], [5.3, -63.45], [8.5, -62.55], [9.3, -60.4], [8.25, -57.3], [7.7, -53.3], [7.25, -48.9],
    [7.45, -44.3], [7.85, -40.3], [4.6, -39.45], [0, -39.05]],
  sleeve: 5.6,
  shoulder: [8.2, -61.2], elbow: [10.1, -51.6], wrist: [10.8, -41.6],
  arm: [1.78, 1.58, 1.26, 1.36, 0.96],
  hand: 4.0,
  hip: [3.7, -39.6], knee: [3.75, -20.6], ankle: [3.55, -3.9],
  leg: [3.45, 3.1, 2.25, 2.55, 1.32],
  shoe: 2.35,
  up: [[11.4, -69.6], [12.1, -78.0]],
  hold: [[10.1, -51.6], [11.9, -57.4]],
};

/** Una mujer. @type {Rig} */
const WOMAN = {
  adult: true, cy: -72.15, rx: 4.3, ry: 5.45, jaw: 0.88,
  neck: [-68.4, -63.3, 1.66],
  torso: [[0, -63.0], [2.0, -64.2], [4.8, -63.7], [7.55, -62.8], [8.15, -60.9], [7.45, -57.8], [7.45, -55.0], [6.35, -50.6],
    [6.7, -46.0], [7.4, -41.6], [4.4, -40.75], [0, -40.45]],
  sleeve: 5.0,
  shoulder: [7.3, -61.6], elbow: [8.95, -51.8], wrist: [9.6, -41.9],
  arm: [1.48, 1.32, 1.06, 1.16, 0.82],
  hand: 3.7,
  hip: [3.45, -40.2], knee: [3.4, -20.8], ankle: [3.2, -3.9],
  leg: [3.5, 3.1, 2.05, 2.35, 1.18],
  shoe: 2.1,
  up: [[10.2, -69.8], [10.9, -78.0]],
  hold: [[8.95, -51.8], [10.6, -57.6]],
};

/** Colores de ojos. Mas marrones que azules o verdes, como en una clase. */
const IRIS = ['#5B3A22', '#3E2A1C', '#6B4A2A', '#3F6E9E', '#557A44'];

/** @param {PersonOptions} o @returns {Who} */
function whoOf(o) {
  if (o.who) return o.who;
  return o.tall ? 'man' : 'boy';
}

/** @param {PersonOptions} o @returns {Rig} */
function rigOf(o) {
  const who = whoOf(o);
  return who === 'woman' ? WOMAN : who === 'man' ? MAN : CHILD;
}

/** Un tono de piel fijo para cada personaje (el mismo en todas sus vinetas). @param {PersonOptions} o @param {Who} who */
function skinFor(o, who) {
  if (o.skin) return o.skin;
  return SKINS[hash(`${who}|${o.shirt ?? ''}|${o.hair ?? ''}`) % SKINS.length];
}

/**
 * El color que pide la escena llevado a un color de pelo de verdad: el
 * amarillo se vuelve rubio dorado, el rojo pelirrojo cobrizo, el azul muy
 * oscuro casi negro. Ninguna pregunta habla del color del pelo.
 * @param {string} c
 */
function hairTone(c) {
  if (isGrey(c)) return mix(c, '#D9D3CA', 0.35);
  const [r, g, b] = rgb(c);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lum = (r * 0.3 + g * 0.59 + b * 0.11) / 255;
  if (lum < 0.2) return mix(c, '#221B19', 0.6);
  if (b >= r && b >= g) return mix(c, '#2A2220', 0.7);
  if (max - min > 90 && r > 200 && g > 150) return mix(c, '#CFA458', 0.5);
  if (max - min > 90 && r > 180) return mix(c, '#A4482A', 0.5);
  return mix(c, '#5A3A26', 0.2);
}

/** @param {Point} a @param {Point} b @param {number} t @returns {Point} */
const lerp = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

/** Direccion unitaria de a hacia b. @param {Point} a @param {Point} b @returns {Point} */
function towards(a, b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  return [dx / len, dy / len];
}

/** @param {Point} p @returns {Point} */
const mirrorX = (p) => [-p[0], p[1]];

/** Una forma con su color y solo un filo muy fino, del mismo color. @param {string} d @param {string} colour @param {number} [rim] */
const part = (d, colour, rim = 0.18) => `<path d="${d}" fill="${colour}" stroke="${darker(colour, 0.32)}" stroke-opacity="0.5" stroke-width="${round(rim)}" stroke-linejoin="round"/>`;

/** La luz encima de una forma. @param {string} d @param {string} kind @param {number} [opacity] */
const over = (d, kind, opacity = 1) => `<path d="${d}" fill="${grad(kind)}"${opacity < 1 ? ` fill-opacity="${round(opacity)}"` : ''}/>`;

/** Una linea. @param {string} d @param {number} w @param {string} colour @param {number} [opacity] */
const line = (d, w, colour, opacity = 1) => (d ? `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${round(w)}" stroke-linecap="round" stroke-linejoin="round"${opacity < 1 ? ` stroke-opacity="${round(opacity)}"` : ''}/>` : '');

/** Una forma difuminada (sombra o luz suave). @param {string} d @param {string} colour @param {number} opacity @param {string} [filter] */
const haze = (d, colour, opacity, filter = 'blur') => `<path d="${d}" fill="${colour}" fill-opacity="${round(opacity)}" filter="${fx(filter)}"/>`;

/**
 * La textura de una prenda: el tejido fino (punto, sarga) en sombra y unas
 * irregularidades de luz, solo dentro de la prenda.
 * @param {string} d @param {number} [a] cuanto se nota
 */
const fabric = (d, a = 1) => `<path d="${d}" fill="#1C1424" fill-opacity="${round(0.16 * a)}" filter="${fx('fabric')}" pointer-events="none"/>`
  + `<path d="${d}" fill="#FFFFFF" fill-opacity="${round(0.16 * a)}" filter="${fx('fabric2')}" pointer-events="none"/>`;

/**
 * Una forma simetrica a partir de su mitad derecha (del centro de arriba al
 * centro de abajo).
 * @param {Point[]} right
 */
function mirrored(right) {
  const left = right.slice(1, -1).reverse().map(mirrorX);
  return smooth([...right, ...left]);
}

/** Lo de dentro solo se ve dentro de la forma d (pelo, iris). @param {string} d @param {string} body */
function clipped(d, body) {
  const id = uid('c');
  return `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})">${body}</g>`;
}

/** Sombra calida de la piel (mas roja que gris). @param {string} skin */
const skinShadow = (skin) => mix(darker(skin, 0.28), '#7A2E1E', 0.25);

// ------------------------------------------------------------------- pelo

/**
 * Mechones: lineas finas que van de `from(t)` a `to(t)` curvandose hacia
 * fuera, en tres tonos (sombra, medio, brillo).
 * @param {number} n @param {(t: number) => Point} from @param {(t: number) => Point} to @param {Point} centre
 * @param {string} hair @param {number} seed @param {number} [w]
 */
function strands(n, from, to, centre, hair, seed, w = 0.2) {
  const rnd = seeded(seed);
  let dark = '';
  let mid = '';
  let lit = '';
  for (let i = 0; i < n; i += 1) {
    const t = Math.min(1, Math.max(0, (i + rnd()) / n));
    const a = from(t);
    const b = to(t);
    const m = lerp(a, b, 0.5);
    const [ox, oy] = towards(centre, m);
    const bulge = 0.5 + rnd() * 0.9;
    const d = `M ${round(a[0])} ${round(a[1])} Q ${round(m[0] + ox * bulge)} ${round(m[1] + oy * bulge)} ${round(b[0])} ${round(b[1])} `;
    const r = rnd();
    if (r < 0.48) dark += d; else if (r < 0.78) mid += d; else lit += d;
  }
  return line(dark, w * 1.1, darker(hair, 0.38), 0.75) + line(mid, w, mix(hair, darker(hair, 0.15), 0.5), 0.7)
    + line(lit, w * 0.85, lighter(hair, 0.42), 0.7);
}

/** Recorre una linea quebrada: t de 0 a 1. @param {Point[]} pts @returns {(t: number) => Point} */
function along(pts) {
  return (t) => {
    const x = t * (pts.length - 1);
    const i = Math.min(pts.length - 2, Math.floor(x));
    return lerp(pts[i], pts[i + 1], x - i);
  };
}

/**
 * Una masa de pelo: su color, el volumen, los mechones recortados dentro y un
 * brillo difuminado.
 * @param {Point[]} outline @param {string} hair @param {string} body mechones y detalles (se recortan) @param {Point} shineAt
 * @param {number} k escala
 */
function hairMass(outline, hair, body, shineAt, k) {
  const d = smooth(outline);
  return part(d, hair, 0.16)
    + over(d, 'ball', 0.55)
    + clipped(d, body
      + glowSpot(shineAt[0], shineAt[1], 2.1 * k, 0.75 * k, 'spec', 0.38, -18)
      + haze(d, '#1C1424', 0.12, 'blur'));
}

/** El pelo de detras de la cabeza (melena, coletas, mono). @param {Who} who @param {Rig} rig @param {string} hair @param {boolean} old @param {string} tie */
function backHair(who, rig, hair, old, tie) {
  const { cy, rx, ry } = rig;
  const k = ry / 5.35;
  if (who === 'girl') {
    let out = '';
    for (const side of [-1, 1]) {
      const x0 = side * (rx + 0.25);
      const y0 = cy - ry * 0.18;
      const pts = /** @type {Point[]} */ ([[x0 - side * 0.5, y0 - 0.4], [x0 + side * 1.2, y0 - 0.7], [x0 + side * 2.3, y0 + 1.4],
        [x0 + side * 2.5, y0 + 4.4], [x0 + side * 1.7, y0 + 7.4], [x0 + side * 0.6, y0 + 8.2], [x0 + side * 0.2, y0 + 6.0],
        [x0 + side * 0.15, y0 + 2.6]]);
      const flow = strands(14, along([[x0, y0], [x0 + side * 0.6, y0 + 0.2]]), along([[x0 + side * 2.2, y0 + 5], [x0 + side * 0.6, y0 + 8]]),
        [x0 - side * 3, y0 + 3], hair, 11 + side, 0.17);
      out += hairMass(pts, hair, flow, [x0 + side * 1.1, y0 + 1.6], k * 0.6)
        + `<ellipse cx="${round(x0 + side * 0.3)}" cy="${round(y0 - 0.1)}" rx="0.62" ry="0.85" fill="${tie}"/>`
        + glowSpot(x0 + side * 0.15, y0 - 0.35, 0.35, 0.3, 'spec', 0.5);
    }
    return out;
  }
  if (who === 'woman' && !old) {
    const pts = /** @type {Point[]} */ ([[-rx * 0.85, cy - ry * 0.9], [-rx * 1.18, cy - ry * 0.35], [-rx * 1.32, cy + ry * 0.6],
      [-rx * 1.36, cy + ry * 1.55], [-rx * 1.0, cy + ry * 2.05], [0, cy + ry * 2.1], [rx * 1.0, cy + ry * 2.05], [rx * 1.36, cy + ry * 1.55],
      [rx * 1.32, cy + ry * 0.6], [rx * 1.18, cy - ry * 0.35], [rx * 0.85, cy - ry * 0.9], [0, cy - ry * 1.08]]);
    const flow = strands(30, along([[-rx * 1.1, cy - ry * 0.4], [rx * 1.1, cy - ry * 0.4]]),
      along([[-rx * 1.2, cy + ry * 1.9], [rx * 1.2, cy + ry * 1.9]]), [0, cy], hair, 21, 0.2 * k);
    return hairMass(pts, hair, flow + haze(`M ${round(-rx * 0.9)} ${round(cy + ry * 0.6)} L ${round(rx * 0.9)} ${round(cy + ry * 0.6)} L ${round(rx * 0.7)} ${round(cy + ry * 2)} L ${round(-rx * 0.7)} ${round(cy + ry * 2)} Z`, '#1C1424', 0.3, 'blur2'),
      [-rx * 0.9, cy + ry * 0.4], k);
  }
  if (who === 'woman' && old) {
    // Mono de abuela.
    const by = cy - ry - 1.1 * k;
    const pts = /** @type {Point[]} */ ([[-2.1 * k, by + 1.2], [-2.0 * k, by - 0.6], [0, by - 1.7 * k], [2.0 * k, by - 0.6], [2.1 * k, by + 1.2], [0, by + 1.6]]);
    let curls = '';
    for (let i = 0; i < 7; i += 1) curls += `M ${round((-1.6 + i * 0.5) * k)} ${round(by - 0.6 + (i % 2) * 0.6)} q ${round(0.4 * k)} ${round(-0.5 * k)} ${round(0.8 * k)} 0 `;
    return hairMass(pts, hair, line(curls, 0.16 * k, darker(hair, 0.3), 0.7), [-0.6 * k, by - 0.8], k * 0.6);
  }
  return '';
}

/** El pelo de delante (casquete, flequillo, mechones). @param {Who} who @param {Rig} rig @param {string} hair @param {boolean} old */
function frontHair(who, rig, hair, old) {
  const { cy, rx, ry } = rig;
  const k = ry / 5.35;
  const P = (/** @type {number} */ x, /** @type {number} */ y) => /** @type {Point} */ ([rx * x, cy + ry * y]);
  if (old && who === 'man') {
    // Calvo arriba, con pelo cano a los lados y bigote.
    let out = '';
    for (const side of [-1, 1]) {
      const pts = /** @type {Point[]} */ ([P(side * 0.9, -0.6), P(side * 1.04, -0.38), P(side * 1.05, -0.02), P(side * 0.97, 0.16),
        P(side * 0.9, -0.05), P(side * 0.9, -0.34)]);
      const tone = darker(hair, 0.12);
      const flow = strands(9, along([P(side * 0.93, -0.58), P(side * 1.02, -0.3)]), along([P(side * 1.0, -0.05), P(side * 0.95, 0.12)]), [0, cy], tone, 31 + side, 0.13);
      out += hairMass(pts, tone, flow, P(side * 1.2, -0.3), k * 0.2);
    }
    const my = cy + ry * 0.47;
    const tache = `M ${round(-1.25 * k)} ${round(my + 0.2 * k)} Q ${round(-0.6 * k)} ${round(my - 0.55 * k)} 0 ${round(my - 0.3 * k)} Q ${round(0.6 * k)} ${round(my - 0.55 * k)} ${round(1.25 * k)} ${round(my + 0.2 * k)} Q ${round(0.6 * k)} ${round(my + 0.05 * k)} 0 ${round(my + 0.15 * k)} Q ${round(-0.6 * k)} ${round(my + 0.05 * k)} ${round(-1.25 * k)} ${round(my + 0.2 * k)} Z`;
    out += part(tache, darker(hair, 0.22), 0.1) + over(tache, 'ball', 0.3)
      + line(`M ${round(-0.8 * k)} ${round(my - 0.15 * k)} l 0.1 0.45 M ${round(-0.3 * k)} ${round(my - 0.25 * k)} l 0.05 0.45 M ${round(0.3 * k)} ${round(my - 0.25 * k)} l -0.05 0.45 M ${round(0.8 * k)} ${round(my - 0.15 * k)} l -0.1 0.45`, 0.1, darker(hair, 0.3), 0.6);
    return out;
  }
  const top = cy - ry - 0.85 * k;
  /** @type {Point[]} */
  let outline;
  /** @type {Point[]} */
  let edge;
  /** @type {Point} */
  let crown;
  if (who === 'boy') {
    outline = [P(0.98, -0.02), P(1.08, -0.45), P(0.86, -0.86), [rx * 0.42, top + 0.12], [-rx * 0.1, top], [-rx * 0.6, top + 0.3], P(-1.0, -0.78),
      P(-1.1, -0.36), P(-0.98, 0.0), P(-0.9, -0.32), P(-0.7, -0.47), P(-0.42, -0.42), P(-0.12, -0.52), P(0.18, -0.46), P(0.48, -0.56),
      P(0.78, -0.44), P(0.92, -0.3)];
    edge = [P(-0.98, 0.0), P(-0.9, -0.32), P(-0.7, -0.47), P(-0.42, -0.42), P(-0.12, -0.52), P(0.18, -0.46), P(0.48, -0.56), P(0.78, -0.44), P(0.98, -0.02)];
    crown = [rx * 0.15, top + 0.6];
  } else if (who === 'man' || (who === 'woman' && old)) {
    outline = who === 'man'
      ? [P(1.0, -0.05), P(1.06, -0.5), P(0.82, -0.88), [rx * 0.3, top + 0.1], [-rx * 0.3, top], P(-0.82, -0.85), P(-1.06, -0.45), P(-1.0, -0.05),
        P(-0.92, -0.36), P(-0.6, -0.62), P(-0.1, -0.7), P(0.5, -0.64), P(0.88, -0.38)]
      : [P(1.06, 0.05), P(1.2, -0.35), P(1.02, -0.78), [rx * 0.5, top - 0.2], [-rx * 0.1, top - 0.45], [-rx * 0.7, top - 0.1], P(-1.05, -0.8),
        P(-1.2, -0.35), P(-1.06, 0.05), P(-0.9, -0.3), P(-0.5, -0.6), P(0, -0.56), P(0.5, -0.62), P(0.9, -0.3)];
    edge = who === 'man'
      ? [P(-1.0, -0.05), P(-0.92, -0.36), P(-0.6, -0.62), P(-0.1, -0.7), P(0.5, -0.64), P(0.88, -0.38), P(1.0, -0.05)]
      : [P(-1.06, 0.05), P(-0.9, -0.3), P(-0.5, -0.6), P(0, -0.56), P(0.5, -0.62), P(0.9, -0.3), P(1.06, 0.05)];
    crown = who === 'man' ? [-rx * 0.35, top + 0.25] : [0, top];
  } else {
    // Nina y mujer: raya a un lado, flequillo que barre y pelo a los lados de la cara.
    const down = who === 'woman' ? 0.95 : 0.12;
    outline = [P(1.04, down), P(1.12, -0.4), P(0.9, -0.84), [rx * 0.45, top + 0.1], [-rx * 0.15, top], [-rx * 0.65, top + 0.3], P(-1.02, -0.76),
      P(-1.12, -0.32), P(-1.04, down), P(-0.9, down - 0.3), P(-0.92, -0.18), P(-0.72, -0.5), P(-0.32, -0.62), P(0.1, -0.5), P(0.5, -0.42),
      P(0.82, -0.3), P(0.94, -0.1), P(0.92, down - 0.3)];
    edge = [P(-1.04, down), P(-0.92, -0.18), P(-0.72, -0.5), P(-0.32, -0.62), P(0.1, -0.5), P(0.5, -0.42), P(0.82, -0.3), P(0.94, -0.1), P(1.04, down)];
    crown = [-rx * 0.25, top + 0.15];
  }
  const flow = strands(old ? 26 : 64, along([[crown[0] - 1.6 * k, crown[1] + 0.5 * k], [crown[0], crown[1]], [crown[0] + 1.6 * k, crown[1] + 0.5 * k]]),
    along(edge), [0, cy], hair, 7 + Math.round(rx * 10), 0.14 * k)
    // El brillo del pelo: una banda en arco sobre la coronilla, como en una foto.
    + `<path d="M ${round(-rx * 0.85)} ${round(top + 2.2 * k)} Q ${round(-rx * 0.2)} ${round(top + 0.3 * k)} ${round(rx * 0.55)} ${round(top + 1.4 * k)}" fill="none" stroke="${lighter(hair, 0.55)}" stroke-opacity="0.35" stroke-width="${round(0.55 * k)}" filter="${fx('blur')}"/>`
    + (old ? line(Array.from({ length: 12 }, (u, i) => `M ${round(-rx + (i % 6) * rx * 0.38)} ${round(top + 0.8 + Math.floor(i / 6) * 1.1)} q 0.35 -0.45 0.7 0`).join(' '), 0.15 * k, darker(hair, 0.28), 0.7) : '');
  // Pelos sueltos que se salen del contorno, a contraluz.
  const rndFly = seeded(Math.round(rx * 31));
  let fly = '';
  for (let i = 0; i < 7; i += 1) {
    const t = 0.15 + rndFly() * 0.7;
    const [fx0, fy0] = along(outline.slice(1, 6))(t);
    fly += `M ${round(fx0)} ${round(fy0 + 0.35)} q ${round((rndFly() - 0.5) * 0.7)} ${round(-0.3 - rndFly() * 0.3)} ${round((rndFly() - 0.5) * 1.0)} ${round(-0.35 - rndFly() * 0.35)} `;
  }
  return hairMass(outline, hair, flow, [-rx * 0.35, top + 1.3 * k], k)
    + (old && who === 'man' ? '' : line(fly, 0.05 * k, hair, 0.45))
    // La sombra del pelo en la frente.
    + haze(`M ${round(edge[1][0])} ${round(edge[1][1] + 0.2)} ${edge.slice(2, -1).map(([x, y]) => `L ${round(x)} ${round(y + 0.55 * k)}`).join(' ')} L ${round(edge[edge.length - 2][0])} ${round(edge[edge.length - 2][1] + 0.2)} Z`, '#3A1A12', 0.16, 'blur');
}

// -------------------------------------------------------------------- cara

/**
 * La cara: ojos con parpados, iris y brillo; cejas que se afinan; nariz hecha
 * de sombras; labios; mejillas.
 * @param {Rig} rig @param {string} skin @param {string} hair @param {string} mood @param {boolean} old @param {boolean} female
 * @param {string} iris @param {string} [nose]
 */
function face(rig, skin, hair, mood, old, female, iris, nose) {
  const { cy, rx, ry } = rig;
  const k = ry / 5.35;
  const ey = cy - 0.05 * ry;
  const ex = 1.52 * k;
  const ew = 0.78 * k;
  const scared = mood === 'scared';
  const sad = mood === 'sad';
  const eh = 0.36 * k * (scared ? 1.28 : sad ? 0.82 : 1);
  const lash = '#2A1E1C';
  const shadow = skinShadow(skin);
  const lip = mix(skin, '#B04456', 0.45);
  const brow = mix(darker(hair, 0.25), '#2A1C14', isGrey(hair) ? 0.15 : 0.35);
  let out = '';
  for (const side of [-1, 1]) {
    const x = side * ex;
    const inner = /** @type {Point} */ ([x - side * ew, ey + 0.05 * k]);
    const outer = /** @type {Point} */ ([x + side * ew, ey - 0.08 * k]);
    const upper = /** @type {Point} */ ([x + side * 0.05 * k, ey - eh * 1.95]);
    const lower = /** @type {Point} */ ([x + side * 0.08 * k, ey + eh * 1.55]);
    const P = (/** @type {Point} */ p) => `${round(p[0])} ${round(p[1])}`;
    const white = `M ${P(inner)} Q ${P(upper)} ${P(outer)} Q ${P(lower)} ${P(inner)} Z`;
    // Cuenca del ojo y parpado.
    out += glowSpot(x, ey - 0.25 * k, 1.3 * k, 0.9 * k, 'warm', 0.32)
      + line(`M ${round(x - side * ew * 0.8)} ${round(ey - eh * 1.35)} Q ${round(x)} ${round(ey - eh * 2.75)} ${round(x + side * ew * 0.95)} ${round(ey - eh * 1.05)}`, 0.14 * k, shadow, 0.55)
      + `<path d="${white}" fill="#F2ECE8"/>`
      + clipped(white, `<circle cx="${round(x + side * 0.04 * k)}" cy="${round(ey + 0.03 * k)}" r="${round(0.36 * k)}" fill="${iris}"/>`
        + `<circle cx="${round(x + side * 0.04 * k)}" cy="${round(ey + 0.03 * k)}" r="${round(0.36 * k)}" fill="${grad('ball')}"/>`
        + `<circle cx="${round(x + side * 0.04 * k)}" cy="${round(ey + 0.03 * k)}" r="${round(0.33 * k)}" fill="none" stroke="${darker(iris, 0.45)}" stroke-opacity="0.7" stroke-width="${round(0.07 * k)}"/>`
        + `<circle cx="${round(x + side * 0.04 * k)}" cy="${round(ey + 0.03 * k)}" r="${round(0.17 * k)}" fill="#120F14"/>`
        + `<path d="M ${P(inner)} Q ${P(upper)} ${P(outer)}" fill="none" stroke="#3A2420" stroke-opacity="0.35" stroke-width="${round(0.35 * k)}" filter="${fx('blur')}"/>`)
      + `<circle cx="${round(x - 0.12 * k)}" cy="${round(ey - 0.13 * k)}" r="${round(0.1 * k)}" fill="#FFFFFF" fill-opacity="0.95"/>`
      // Pestanas de arriba, linea de abajo.
      + line(`M ${P(inner)} Q ${P(upper)} ${P(outer)}`, 0.3 * k, lash, 0.9)
      + line(`M ${round(inner[0] + side * 0.2 * k)} ${round(inner[1] + 0.1 * k)} Q ${P(lower)} ${P(outer)}`, 0.1 * k, shadow, 0.45);
    if (female) out += line(`M ${P(outer)} l ${round(side * 0.32 * k)} ${round(-0.22 * k)} M ${round(outer[0] - side * 0.25 * k)} ${round(outer[1] - 0.25 * k)} l ${round(side * 0.24 * k)} ${round(-0.26 * k)}`, 0.12 * k, lash, 0.85);
    // Ceja: gruesa por dentro y fina por fuera.
    const by = ey - (scared ? 1.7 : 1.35) * k;
    const lift = sad ? -0.45 * k : scared ? -0.2 * k : 0;
    const b0 = /** @type {Point} */ ([x - side * 0.62 * k, by + 0.2 * k + lift]);
    const b1 = /** @type {Point} */ ([x + side * 0.25 * k, by - (scared ? 0.42 : 0.25) * k]);
    const b2 = /** @type {Point} */ ([x + side * 1.05 * k, by + 0.18 * k]);
    let hairs = '';
    for (let i = 0; i < 7; i += 1) {
      const t = i / 6;
      const bx = b0[0] + (b2[0] - b0[0]) * t;
      const byy = b0[1] + (b2[1] - b0[1]) * t + Math.sin(t * Math.PI) * (b1[1] - (b0[1] + b2[1]) / 2) * 0.9;
      hairs += `M ${round(bx)} ${round(byy + 0.22 * k)} l ${round(side * 0.32 * k)} ${round(-0.22 * k)} `;
    }
    out += `<path d="M ${P(b0)} Q ${P(b1)} ${P(b2)} Q ${round(b1[0])} ${round(b1[1] + 0.28 * k)} ${round(b0[0])} ${round(b0[1] + 0.3 * k)} Z" fill="${brow}" fill-opacity="0.8"/>`
      + line(hairs, 0.07 * k, darker(brow, 0.2), 0.7)
      + glowSpot(side * 2.35 * k, cy + 1.35 * k, 1.25 * k, 0.8 * k, 'blush', rig.adult ? 0.45 : 0.75);
  }
  // Nariz: solo sombra (puente, aletas, orificios) y un brillo en la punta.
  const nt = cy + 1.8 * k;
  out += nose
    ? `<circle cx="0" cy="${round(nt - 0.1 * k)}" r="${round(0.95 * k)}" fill="${nose}"/><circle cx="0" cy="${round(nt - 0.1 * k)}" r="${round(0.95 * k)}" fill="${grad('ball')}"/>`
    : `<path d="M ${round(0.45 * k)} ${round(ey - 0.4 * k)} Q ${round(0.9 * k)} ${round(cy + 0.6 * k)} ${round(0.78 * k)} ${round(nt + 0.1 * k)}" fill="none" stroke="${shadow}" stroke-opacity="0.32" stroke-width="${round(0.5 * k)}" filter="${fx('blur')}"/>`
      + glowSpot(-0.12 * k, nt - 0.25 * k, 0.42 * k, 0.32 * k, 'spec', 0.42)
      + line(`M ${round(0.86 * k)} ${round(nt - 0.15 * k)} Q ${round(0.98 * k)} ${round(nt + 0.4 * k)} ${round(0.55 * k)} ${round(nt + 0.55 * k)} M ${round(-0.86 * k)} ${round(nt - 0.15 * k)} Q ${round(-0.98 * k)} ${round(nt + 0.4 * k)} ${round(-0.55 * k)} ${round(nt + 0.55 * k)}`, 0.12 * k, shadow, 0.45)
      + `<ellipse cx="${round(-0.46 * k)}" cy="${round(nt + 0.4 * k)}" rx="${round(0.24 * k)}" ry="${round(0.13 * k)}" transform="rotate(18 ${round(-0.46 * k)} ${round(nt + 0.4 * k)})" fill="${mix(skin, '#3A1A12', 0.55)}" fill-opacity="0.8"/>`
      + `<ellipse cx="${round(0.46 * k)}" cy="${round(nt + 0.4 * k)}" rx="${round(0.24 * k)}" ry="${round(0.13 * k)}" transform="rotate(-18 ${round(0.46 * k)} ${round(nt + 0.4 * k)})" fill="${mix(skin, '#3A1A12', 0.55)}" fill-opacity="0.8"/>`
      + glowSpot(0.1 * k, nt + 0.85 * k, 0.75 * k, 0.26 * k, 'warm', 0.3);
  // Boca.
  const my = cy + 3.15 * k;
  const mw = 1.02 * k;
  if (scared) {
    out += `<ellipse cx="0" cy="${round(my + 0.3 * k)}" rx="${round(0.62 * k)}" ry="${round(0.8 * k)}" fill="#4A1E24" stroke="${lip}" stroke-width="${round(0.26 * k)}"/>`
      + `<path d="M ${round(-0.5 * k)} ${round(my - 0.25 * k)} Q 0 ${round(my - 0.45 * k)} ${round(0.5 * k)} ${round(my - 0.25 * k)} L ${round(0.42 * k)} ${round(my - 0.02 * k)} Q 0 ${round(my - 0.12 * k)} ${round(-0.42 * k)} ${round(my - 0.02 * k)} Z" fill="#F1ECE6"/>`
      + `<path d="M ${round(rx * 0.92)} ${round(cy - ry * 0.55)} q ${round(0.45 * k)} ${round(0.7 * k)} 0 ${round(1.0 * k)} q ${round(-0.45 * k)} ${round(-0.3 * k)} 0 ${round(-1.0 * k)} Z" fill="#CFEAF8" fill-opacity="0.85"/>`
      + glowSpot(rx * 0.9, cy - ry * 0.4, 0.15 * k, 0.15 * k, 'spec', 0.9);
  } else if (sad) {
    out += line(`M ${round(-mw * 0.85)} ${round(my + 0.35 * k)} Q 0 ${round(my - 0.3 * k)} ${round(mw * 0.85)} ${round(my + 0.35 * k)}`, 0.2 * k, mix(lip, '#3A1A1E', 0.5), 0.9)
      + `<path d="M ${round(-mw * 0.6)} ${round(my + 0.32 * k)} Q 0 ${round(my + 0.05 * k)} ${round(mw * 0.6)} ${round(my + 0.32 * k)} Q 0 ${round(my + 0.85 * k)} ${round(-mw * 0.6)} ${round(my + 0.32 * k)} Z" fill="${lip}" fill-opacity="0.85"/>`;
    for (const side of [-1, 1]) {
      const tx = side * (ex + 0.15 * k);
      const ty = ey + eh * 1.9;
      out += `<path d="M ${round(tx)} ${round(ty)} q ${round(0.32 * k)} ${round(0.6 * k)} 0 ${round(0.95 * k)} q ${round(-0.32 * k)} ${round(-0.35 * k)} 0 ${round(-0.95 * k)} Z" fill="#CFEAF8" fill-opacity="0.8"/>`
        + glowSpot(tx - 0.05 * k, ty + 0.5 * k, 0.1 * k, 0.12 * k, 'spec', 0.9);
    }
  } else {
    const upper = `M ${round(-mw)} ${round(my)} Q ${round(-0.4 * k)} ${round(my - 0.38 * k)} 0 ${round(my - 0.22 * k)} Q ${round(0.4 * k)} ${round(my - 0.38 * k)} ${round(mw)} ${round(my)} Q 0 ${round(my + 0.42 * k)} ${round(-mw)} ${round(my)} Z`;
    const lower = `M ${round(-mw * 0.85)} ${round(my + 0.12 * k)} Q 0 ${round(my + 0.5 * k)} ${round(mw * 0.85)} ${round(my + 0.12 * k)} Q 0 ${round(my + 1.05 * k)} ${round(-mw * 0.85)} ${round(my + 0.12 * k)} Z`;
    out += `<path d="${upper}" fill="${darker(lip, 0.12)}"/>` + `<path d="${lower}" fill="${lip}"/>`
      + line(`M ${round(-mw)} ${round(my)} Q 0 ${round(my + 0.42 * k)} ${round(mw)} ${round(my)}`, 0.13 * k, mix(lip, '#3A1A1E', 0.6), 0.85)
      + glowSpot(0.1 * k, my + 0.48 * k, 0.4 * k, 0.16 * k, 'spec', 0.45)
      + line(`M ${round(-mw - 0.12 * k)} ${round(my - 0.1 * k)} q ${round(0.08 * k)} ${round(0.12 * k)} ${round(0.16 * k)} ${round(0.18 * k)} M ${round(mw + 0.12 * k)} ${round(my - 0.1 * k)} q ${round(-0.08 * k)} ${round(0.12 * k)} ${round(-0.16 * k)} ${round(0.18 * k)}`, 0.1 * k, shadow, 0.6);
  }
  // Sombra bajo el labio y luz en la barbilla.
  out += glowSpot(0, my + 1.35 * k, 0.75 * k, 0.24 * k, 'warm', 0.32)
    + glowSpot(-0.2 * k, cy + ry * 0.82, 0.8 * k, 0.4 * k, 'spec', 0.16)
    // Modelado de la cara como en una foto: la frente y los pomulos al sol, las
    // sienes y la mejilla de la sombra mas hondas, el surco del labio.
    + glowSpot(-0.7 * k, cy - 2.7 * k, 1.9 * k, 0.75 * k, 'spec', 0.22)
    + glowSpot(-2.3 * k, cy + 0.35 * k, 1.05 * k, 0.55 * k, 'spec', 0.2, -20)
    + glowSpot(2.3 * k, cy + 0.35 * k, 0.9 * k, 0.5 * k, 'spec', 0.08, 20)
    + glowSpot(-(rx - 0.5 * k), cy - 1.0 * k, 0.65 * k, 1.5 * k, 'warm', 0.16)
    + glowSpot(rx - 0.5 * k, cy - 0.8 * k, 0.75 * k, 1.8 * k, 'warm', 0.3)
    + glowSpot(rx * 0.62, cy + 2.0 * k, 1.0 * k, 1.6 * k, 'warm', 0.2, -15)
    + glowSpot(0, cy + 2.55 * k, 0.24 * k, 0.32 * k, 'warm', 0.3);
  for (const side of [-1, 1]) {
    out += glowSpot(side * ex, ey + 0.75 * k, 0.85 * k, 0.28 * k, 'warm', 0.16);
    if (old) out += line(`M ${round(side * 0.95 * k)} ${round(cy + 2.1 * k)} Q ${round(side * 1.5 * k)} ${round(cy + 2.8 * k)} ${round(side * 1.25 * k)} ${round(my + 0.2 * k)}`, 0.18 * k, shadow, 0.3);
  }
  if (old) {
    for (const side of [-1, 1]) {
      const x = side * ex;
      out += `<ellipse cx="${round(x)}" cy="${round(ey + 0.05 * k)}" rx="${round(1.18 * k)}" ry="${round(0.9 * k)}" fill="#FFFFFF" fill-opacity="0.12" stroke="#5A4E48" stroke-width="${round(0.16 * k)}"/>`
        + line(`M ${round(x - 0.7 * k)} ${round(ey - 0.45 * k)} l ${round(0.5 * k)} ${round(-0.2 * k)}`, 0.12 * k, '#FFFFFF', 0.7)
        + line(`M ${round(x + side * 1.18 * k)} ${round(ey - 0.1 * k)} L ${round(side * (rx - 0.15))} ${round(ey - 0.4 * k)}`, 0.14 * k, '#5A4E48')
        + line(`M ${round(x + side * 1.35 * k)} ${round(ey + 0.45 * k)} l ${round(side * 0.45 * k)} ${round(0.25 * k)} M ${round(side * 1.25 * k)} ${round(my - 1.3 * k)} q ${round(side * 0.45 * k)} ${round(0.8 * k)} ${round(side * 0.15 * k)} ${round(1.5 * k)}`, 0.11 * k, shadow, 0.55);
    }
    out += line(`M ${round(-0.34 * k)} ${round(ey - 0.25 * k)} Q 0 ${round(ey - 0.5 * k)} ${round(0.34 * k)} ${round(ey - 0.25 * k)}`, 0.14 * k, '#5A4E48')
      + line(`M ${round(-1.1 * k)} ${round(cy - ry * 0.62)} q ${round(1.1 * k)} ${round(-0.25 * k)} ${round(2.2 * k)} 0`, 0.1 * k, shadow, 0.5);
  }
  return out;
}

/** El contorno de la cabeza (craneo, sienes, pomulos, mandibula y barbilla). @param {Rig} rig */
function headPath(rig) {
  const { cy, rx, ry, jaw } = rig;
  return mirrored([[0, cy - ry], [rx * 0.6, cy - ry * 0.94], [rx * 0.93, cy - ry * 0.62], [rx, cy - ry * 0.18], [rx * 0.98, cy + ry * 0.18],
    [rx * 0.9 * jaw, cy + ry * 0.48], [rx * 0.7 * jaw, cy + ry * 0.78], [rx * 0.36, cy + ry * 0.96], [0, cy + ry]]);
}

/** Una oreja. @param {Rig} rig @param {number} side @param {string} skin */
function ear(rig, side, skin) {
  const { cy, rx, ry } = rig;
  const k = ry / 5.35;
  const ey = cy - 0.05 * ry;
  const pts = /** @type {Point[]} */ ([[rx - 0.25, ey - 0.55 * k], [rx + 0.5 * k, ey - 0.85 * k], [rx + 0.92 * k, ey + 0.1 * k], [rx + 0.72 * k, ey + 1.35 * k],
    [rx + 0.18 * k, ey + 2.1 * k], [rx - 0.3, ey + 1.9 * k]]).map(([x, y]) => /** @type {Point} */ ([side * x, y]));
  const d = smooth(pts);
  return part(d, skin) + over(d, 'skin', 0.8)
    + line(`M ${round(side * (rx + 0.5 * k))} ${round(ey - 0.35 * k)} Q ${round(side * (rx + 0.7 * k))} ${round(ey + 0.7 * k)} ${round(side * (rx + 0.25 * k))} ${round(ey + 1.4 * k)}`, 0.14 * k, skinShadow(skin), 0.6);
}

// -------------------------------------------------------- brazos y manos

/** Un brazo (hombro, codo, muneca) con su piel y la luz de un cilindro. @param {Rig} rig @param {Point} s @param {Point} e @param {Point} w @param {string} skin */
function arm(rig, s, e, w, skin) {
  const [a0, a1, a2, a3, a4] = rig.arm;
  const m1 = lerp(s, e, 0.5);
  const m2 = lerp(e, w, 0.42);
  const d = tube([[s[0], s[1], a0], [m1[0], m1[1], a1], [e[0], e[1], a2], [m2[0], m2[1], a3], [w[0], w[1], a4]]);
  return part(d, skin) + over(d, 'skin')
    + glowSpot(e[0] + 0.15, e[1], a2 * 0.8, a2 * 0.5, 'warm', 0.25);
}

/**
 * Una mano que cuelga del antebrazo: palma, cuatro dedos apenas separados y el
 * pulgar hacia dentro.
 * @param {Point} w @param {Point} e @param {number} len @param {string} skin @param {number} side 1 a la derecha, -1 a la izquierda
 */
function hand(w, e, len, skin, side) {
  const [ux, uy] = towards(e, w);
  const [px, py] = [-uy * side, ux * side];
  const L = len;
  const at = (/** @type {number} */ a, /** @type {number} */ b) => /** @type {Point} */ ([w[0] + ux * a * L + px * b * L, w[1] + uy * a * L + py * b * L]);
  const palm = smooth([at(-0.05, 0.22), at(0.25, 0.3), at(0.58, 0.28), at(0.86, 0.2), at(1.0, 0.04), at(0.95, -0.14), at(0.62, -0.25),
    at(0.3, -0.26), at(-0.05, -0.2)]);
  const thumb = smooth([at(0.18, 0.24), at(0.38, 0.4), at(0.6, 0.38), at(0.62, 0.26), at(0.4, 0.2)]);
  const fingers = [-0.12, 0.0, 0.12].map((b) => `M ${at(0.62, b).map(round).join(' ')} L ${at(0.93, b * 0.8).map(round).join(' ')}`).join(' ');
  return part(thumb, skin) + over(thumb, 'skin', 0.7)
    + part(palm, skin) + over(palm, 'skin')
    + line(fingers, 0.07 * L, skinShadow(skin), 0.5)
    + line(`M ${at(0.5, 0.2).map(round).join(' ')} Q ${at(0.4, 0.05).map(round).join(' ')} ${at(0.3, -0.12).map(round).join(' ')}`, 0.06 * L, skinShadow(skin), 0.35);
}

/** Donde quedan el codo y la muneca derechos segun la postura. @param {Rig} rig @param {PersonOptions} o @returns {[Point, Point]} */
const rightArm = (rig, o) => o.reach ?? (o.arm === 'up' ? rig.up : o.arm === 'hold' ? rig.hold : [rig.elbow, rig.wrist]);

/**
 * La manga corta de la camiseta, que sigue al brazo: sale de la costura del
 * hombro, redondea el hombro y acaba con su dobladillo de lado a lado del brazo.
 * @param {Rig} rig @param {Point} s @param {Point} e @param {string} shirt @param {number} side
 */
function sleeve(rig, s, e, shirt, side) {
  const [ux, uy] = towards(s, e);
  let [px, py] = [uy, -ux];
  if (px * side < 0) [px, py] = [-px, -py];
  const w0 = rig.arm[0];
  const w1 = rig.arm[1];
  const L = rig.sleeve;
  const at = (/** @type {number} */ a, /** @type {number} */ b) => /** @type {Point} */ ([s[0] + ux * a + px * b, s[1] + uy * a + py * b]);
  const d = smooth([at(-0.7, 0.0), at(0.1, w0 + 0.05), at(L * 0.55, w1 + 0.3), at(L, w1 + 0.24), at(L + 0.1, 0), at(L, -w1 - 0.22),
    at(L * 0.62, -w1 - 0.75), at(1.0, -w0 - 1.0)]);
  const hemA = at(L - 0.25, w1 + 0.28);
  const hemB = at(L - 0.2, -w1 - 0.2);
  return part(d, shirt) + over(d, 'cloth') + fabric(d)
    + crease(`M ${at(0.8, w0 * 0.2).map(round).join(' ')} Q ${at(2.0, w0 * 0.5).map(round).join(' ')} ${at(L - 0.6, w1 * 0.7).map(round).join(' ')}`, 0.32, 0.2)
    + line(`M ${hemA.map(round).join(' ')} L ${hemB.map(round).join(' ')}`, 0.18, darker(shirt, 0.28), 0.6)
    + glowSpot(...at(L + 0.4, 0), w1 * 0.95, 0.45, 'warm', 0.2);
}

// ------------------------------------------------------- piernas y ropa

/** Una pierna de pie: muslo, rodilla, gemelo y tobillo. @param {Rig} rig @param {number} side @param {string} skin */
function leg(rig, side, skin) {
  const [w0, w1, w2, w3, w4] = rig.leg;
  const h = /** @type {Point} */ ([side * rig.hip[0], rig.hip[1]]);
  const kn = /** @type {Point} */ ([side * rig.knee[0], rig.knee[1]]);
  const an = /** @type {Point} */ ([side * rig.ankle[0], rig.ankle[1]]);
  const mid = lerp(h, kn, 0.5);
  const calf = lerp(kn, an, 0.32);
  const d = tube([[h[0], h[1], w0], [mid[0], mid[1], w1], [kn[0], kn[1], w2], [calf[0] + side * 0.12, calf[1], w3], [an[0], an[1], w4]]);
  return part(d, skin) + over(d, 'skin')
    + glowSpot(kn[0] - 0.2, kn[1] - 0.4, w2 * 0.55, w2 * 0.45, 'spec', 0.22)
    + glowSpot(kn[0] + 0.2, kn[1] + 1.0, w2 * 0.7, 0.45, 'warm', 0.28);
}

/** Zapato visto de frente, con su suela. @param {number} x @param {number} w @param {Who} who */
function shoe(x, w, who) {
  const colour = who === 'girl' ? '#6E2A32' : who === 'woman' ? '#5A3A4A' : who === 'man' ? '#3B2820' : '#3A3F55';
  const low = who === 'girl' || who === 'woman';
  const top = low ? -2.3 : -3.0;
  const d = smooth([[x - w, -0.15], [x - w * 1.08, -1.3], [x - w * 0.85, top + 0.5], [x - w * 0.3, top], [x + w * 0.35, top + 0.05],
    [x + w * 0.88, top + 0.55], [x + w * 1.08, -1.3], [x + w, -0.15]]);
  let out = part(d, colour, 0.15) + over(d, 'ball', 0.8);
  if (who === 'boy') {
    out += `<path d="M ${round(x - w * 1.02)} -0.95 Q ${x} -0.75 ${round(x + w * 1.02)} -0.95 L ${round(x + w)} -0.05 Q ${x} 0.12 ${round(x - w)} -0.05 Z" fill="${CLOTH.sole}"/>`
      + line(`M ${round(x - w * 0.35)} -2.45 l ${round(w * 0.7)} 0.18 M ${round(x - w * 0.35)} -1.95 l ${round(w * 0.7)} 0.18 M ${round(x - w * 0.3)} -1.5 l ${round(w * 0.6)} 0.15`, 0.16, '#E8EAF0', 0.9);
  } else {
    out += `<path d="M ${round(x - w)} -0.45 Q ${x} -0.3 ${round(x + w)} -0.45 L ${round(x + w)} -0.05 Q ${x} 0.08 ${round(x - w)} -0.05 Z" fill="${darker(colour, 0.35)}"/>`;
  }
  if (who === 'girl') out += line(`M ${round(x - w * 0.95)} -2.0 Q ${x} -2.35 ${round(x + w * 0.95)} -2.0`, 0.32, darker(colour, 0.25));
  return out + glowSpot(x - w * 0.35, top + 0.85, w * 0.45, 0.35, 'spec', who === 'man' || who === 'girl' ? 0.55 : 0.3);
}

/** Calcetin blanco de nino, con su elastico. @param {number} x @param {number} w */
function sock(x, w) {
  const d = `M ${round(x - w * 1.12)} -6.6 Q ${x} -6.85 ${round(x + w * 1.12)} -6.6 L ${round(x + w * 1.15)} -2.4 L ${round(x - w * 1.15)} -2.4 Z`;
  return part(d, '#F6F5F2', 0.14) + over(d, 'cloth', 0.8)
    + line(`M ${round(x - w)} -6.0 h ${round(w * 2)} M ${round(x - w)} -5.45 h ${round(w * 2)}`, 0.1, '#C9CDD6', 0.8);
}

/** Lo que va de cintura para abajo, de pie. @param {Rig} rig @param {Who} who @param {string} skin */
function lowerBody(rig, who, skin) {
  const adult = rig.adult;
  // Su sombra: oscura bajo los pies y proyectada hacia la derecha, como la de
  // una foto con el sol arriba a la izquierda.
  let out = glowSpot(adult ? 7.5 : 6, 0, adult ? 13 : 10.5, adult ? 1.9 : 1.6, 'cast')
    + glowSpot(0, 0.25, adult ? 9.5 : 7.8, adult ? 2.0 : 1.7, 'soft')
    + glowSpot(0, 0.1, adult ? 6 : 5, adult ? 1.0 : 0.85, 'soft');
  const legs = who === 'man' ? '' : leg(rig, -1, skin) + leg(rig, 1, skin);
  out += legs;
  if (who === 'boy' || who === 'girl') out += sock(-rig.ankle[0], rig.leg[4]) + sock(rig.ankle[0], rig.leg[4]);
  if (who === 'boy') {
    const d = mirrored([[0, -30.8], [5.45, -30.8], [5.95, -27.4], [6.05, -24.4], [5.85, -21.15], [3.1, -20.8], [0.45, -21.15], [0, -24.1]]);
    out += part(d, CLOTH.denim, 0.18) + over(d, 'cloth') + over(d, 'clothV', 0.8) + fabric(d, 1.3)
      + clipped(d, haze('M -7 -31.6 L 7 -31.6 L 7 -30.0 L -7 -30.0 Z', '#1C1424', 0.22))
      + haze('M -0.9 -24.6 L 0.9 -24.6 L 0.7 -21.4 L -0.7 -21.4 Z', '#1C1424', 0.35)
      + line('M 0 -30.4 V -24.4 M -5.5 -29.6 Q -4.4 -27.4 -3.0 -27.8 M 5.5 -29.6 Q 4.4 -27.4 3.0 -27.8', 0.14, darker(CLOTH.denim, 0.35), 0.8)
      + `<path d="M -5.95 -22.3 Q -3.3 -21.9 -0.5 -22.2 M 5.95 -22.3 Q 3.3 -21.9 0.5 -22.2 M -5.95 -27.6 L -6.05 -22 M 5.95 -27.6 L 6.05 -22" fill="none" stroke="#C9B37A" stroke-width="0.1" stroke-dasharray="0.35 0.25" stroke-opacity="0.8"/>`
      + crease('M -4.6 -24.8 q 1 1.4 2.4 1.6 M 4.6 -24.8 q -1 1.4 -2.4 1.6', 0.35, 0.25);
  } else if (who === 'girl') {
    const d = mirrored([[0, -31.0], [5.1, -31.0], [5.9, -27.6], [6.95, -22.8], [7.75, -18.7], [4.0, -18.2], [0, -17.95]]);
    let pleats = '';
    let shades = '';
    for (let i = -3; i <= 3; i += 1) {
      pleats += `M ${round(i * 1.55)} -30.6 L ${round(i * 2.25)} -18.3 `;
      if (i % 2 === 0) shades += `M ${round(i * 1.55)} -30.6 L ${round(i * 1.55 + 1.55)} -30.6 L ${round(i * 2.25 + 2.25)} -18.3 L ${round(i * 2.25)} -18.3 Z `;
    }
    out += part(d, CLOTH.skirt, 0.18) + over(d, 'cloth') + over(d, 'clothV', 0.8) + fabric(d)
      + clipped(d, haze(shades, '#1C1424', 0.16) + line(pleats, 0.14, darker(CLOTH.skirt, 0.35), 0.7)
        + haze('M -8 -31.8 L 8 -31.8 L 8 -30.2 L -8 -30.2 Z', '#1C1424', 0.2));
  } else if (who === 'woman') {
    const d = mirrored([[0, -41.9], [6.5, -41.9], [7.4, -36.8], [8.7, -28.4], [9.9, -19.6], [5.0, -18.9], [0, -18.7]]);
    out += part(d, CLOTH.skirt, 0.18) + over(d, 'cloth') + over(d, 'clothV', 0.8) + fabric(d)
      + clipped(d, haze('M -10 -42.6 L 10 -42.6 L 10 -41.0 L -10 -41.0 Z', '#1C1424', 0.2))
      + crease('M -3.2 -38 Q -4 -30 -5.4 -19.4 M 2.4 -37 Q 3.6 -29 4.4 -19.2 M 6.2 -33 Q 7.4 -27 8.4 -20', 0.5, 0.22)
      + line('M -9.6 -20.4 Q 0 -19.4 9.6 -20.4', 0.1, lighter(CLOTH.skirt, 0.3), 0.6);
  } else {
    // Hombre: pantalon largo con cinturon, raya y bolsillos.
    const pelvis = mirrored([[0, -41.1], [7.75, -41.1], [8.05, -37.6], [7.4, -34.0], [0, -33.4]]);
    /** @type {string[]} */
    const legsD = [-1, 1].map((side) => {
      const h = /** @type {Point} */ ([side * rig.hip[0], rig.hip[1]]);
      const kn = /** @type {Point} */ ([side * rig.knee[0], rig.knee[1]]);
      const an = /** @type {Point} */ ([side * rig.ankle[0], rig.ankle[1] + 0.6]);
      const mid = lerp(h, kn, 0.5);
      const calf = lerp(kn, an, 0.4);
      return tube([[h[0] + side * 0.2, h[1], 4.0], [mid[0], mid[1], 3.6], [kn[0], kn[1], 2.95], [calf[0], calf[1], 2.8], [an[0], an[1], 2.3]]);
    });
    const cloth = CLOTH.trousers;
    out += [pelvis, ...legsD].map((d) => `<path d="${d}" fill="${cloth}" stroke="${darker(cloth, 0.3)}" stroke-opacity="0.5" stroke-width="0.35"/>`).join('')
      + [pelvis, ...legsD].map((d) => `<path d="${d}" fill="${cloth}"/>`).join('')
      + legsD.map((d) => over(d, 'cloth') + fabric(d)).join('')
      + line('M -3.6 -36 L -3.5 -4.4 M 3.8 -36 L 3.6 -4.4', 0.14, lighter(cloth, 0.22), 0.7)
      + crease('M -6 -22 q 2 0.8 4.2 0 M 2 -22 q 2 0.8 4.2 0 M -5.8 -6.4 q 2 -0.6 4 0 M 1.8 -6.4 q 2 -0.6 4 0', 0.4, 0.22)
      + `<path d="M -7.9 -41.4 H 7.9 V -39.8 H -7.9 Z" fill="#3A2E28"/>`
      + `<rect x="-1.1" y="-41.35" width="2.2" height="1.5" rx="0.3" fill="none" stroke="#CDB57A" stroke-width="0.3"/>`
      + line('M 0 -39.6 V -35', 0.14, darker(cloth, 0.35), 0.8);
  }
  for (const side of [-1, 1]) out += shoe(side * rig.ankle[0], rig.shoe, who);
  return out;
}

/** La camiseta (sin mangas: van con cada brazo). @param {Rig} rig @param {string} shirt */
function torso(rig, shirt) {
  const t = rig.torso;
  const d = mirrored(t);
  const [, neckL] = t;
  const armpit = t[5];
  const waist = t[7];
  const hem = t[t.length - 1];
  const ink = darker(shirt, 0.3);
  return part(d, shirt, 0.18) + over(d, 'cloth') + over(d, 'clothV')
    + fabric(d)
    // La sombra de los brazos en los costados y la del cuello en el pecho.
    + clipped(d, line(`M ${round(-armpit[0] + 0.5)} ${round(armpit[1] + 0.4)} L ${round(-waist[0] + 0.4)} ${round(hem[1])}`, 0.9, '#1C1424', 0.1)
      + line(`M ${round(armpit[0] - 0.5)} ${round(armpit[1] + 0.4)} L ${round(waist[0] - 0.4)} ${round(hem[1])}`, 1.1, '#1C1424', 0.16)
      + glowSpot(0.3, neckL[1] + 1.1, neckL[0] * 1.3, 1.1, 'warm', 0.25))
    // Pliegues que bajan de las axilas a la cintura y arrugas sobre el pantalon.
    + crease(`M ${round(armpit[0] - 0.4)} ${round(armpit[1] + 0.6)} Q ${round(waist[0] * 0.6)} ${round(waist[1] - 0.4)} ${round(waist[0] * 0.25)} ${round(waist[1] + 1.2)}`, 0.55, 0.26)
    + crease(`M ${round(-armpit[0] + 0.4)} ${round(armpit[1] + 0.6)} Q ${round(-waist[0] * 0.6)} ${round(waist[1] - 0.2)} ${round(-waist[0] * 0.3)} ${round(waist[1] + 1.6)}`, 0.5, 0.22)
    + crease(`M ${round(-waist[0] * 0.8)} ${round(hem[1] - 1.6)} q ${round(waist[0] * 0.5)} -0.5 ${round(waist[0])} 0 M ${round(waist[0] * 0.2)} ${round(hem[1] - 1.2)} q ${round(waist[0] * 0.5)} -0.5 ${round(waist[0] * 0.8)} 0`, 0.4, 0.2)
    // Cuello redondo con su ribete, y la costura del bajo.
    + line(`M ${round(-neckL[0] - 0.15)} ${round(neckL[1] + 0.05)} Q 0 ${round(t[0][1] + 1.15)} ${round(neckL[0] + 0.15)} ${round(neckL[1] + 0.05)}`, 0.55, darker(shirt, 0.12))
    + line(`M ${round(-neckL[0])} ${round(neckL[1] + 0.45)} Q 0 ${round(t[0][1] + 1.6)} ${round(neckL[0])} ${round(neckL[1] + 0.45)}`, 0.1, ink, 0.6)
    + `<path d="M ${round(-t[t.length - 3][0] + 0.2)} ${round(t[t.length - 3][1] - 0.6)} Q 0 ${round(hem[1] - 0.6)} ${round(t[t.length - 3][0] - 0.2)} ${round(t[t.length - 3][1] - 0.6)}" fill="none" stroke="${ink}" stroke-width="0.1" stroke-dasharray="0.4 0.3" stroke-opacity="0.6"/>`;
}

/** El cuello, con la sombra de la barbilla. @param {Rig} rig @param {string} skin */
function neck(rig, skin) {
  const [top, bottom, w] = rig.neck;
  const d = `M ${-w} ${top} V ${round(bottom + 0.4)} Q 0 ${round(bottom + 1.2)} ${w} ${round(bottom + 0.4)} V ${top} Z`;
  return part(d, darker(skin, 0.05)) + over(d, 'skin')
    + glowSpot(0.3, rig.cy + rig.ry - 0.2, w * 1.35, 1.25, 'warm', 0.6);
}

// --------------------------------------------------------------- montaje

/**
 * Las partes de una persona.
 * @param {PersonOptions} o
 */
function parts(o) {
  const who = whoOf(o);
  const rig = rigOf(o);
  const skin = skinFor(o, who);
  const shirt = o.shirt ?? '#E33B2E';
  const given = o.hair ?? (who === 'girl' || who === 'woman' ? '#6B4423' : '#4A2F1C');
  const old = rig.adult && isGrey(given);
  const hair = hairTone(given);
  const mood = o.mood ?? 'happy';
  const iris = IRIS[hash(`${who}${shirt}`) % IRIS.length];
  const [elbow, wrist] = rightArm(rig, o);
  const head = headPath(rig);
  const left = /** @type {[Point, Point, Point]} */ ([mirrorX(rig.shoulder), mirrorX(rig.elbow), mirrorX(rig.wrist)]);
  // En bici, el otro brazo va al manillar por detras del cuerpo: no se ve.
  const leftArm = o.reach ? '' : arm(rig, ...left, skin) + hand(left[2], left[1], rig.hand, skin, -1) + sleeve(rig, left[0], left[1], shirt, -1);
  const upper = neck(rig, skin)
    + torso(rig, shirt)
    + leftArm
    + arm(rig, rig.shoulder, elbow, wrist, skin)
    + sleeve(rig, rig.shoulder, elbow, shirt, 1)
    + ear(rig, -1, skin) + ear(rig, 1, skin)
    + part(head, skin, 0.2) + over(head, 'face')
    + face(rig, skin, hair, mood, old, who === 'girl' || who === 'woman', iris, o.nose)
    + frontHair(who, rig, hair, old);
  return {
    who, rig, skin,
    back: backHair(who, rig, hair, old, darker(shirt, 0.1)),
    lower: () => lowerBody(rig, who, skin),
    upper,
    rightHand: hand(wrist, elbow, rig.hand, skin, 1),
  };
}

/**
 * Una persona entera, con los pies en (0, 0).
 * @param {PersonOptions} [o]
 */
export function person(o = {}) {
  const p = parts(o);
  // waist: sentado dentro de algo (un barco): solo de cintura para arriba.
  // Lo que lleva en la mano va antes que la mano: los dedos lo rodean.
  return p.back + (o.waist ? '' : p.lower()) + p.upper + (o.inHand ?? '') + p.rightHand;
}

/** Donde queda el centro de la mano derecha (para lo que sujeta y la cuerda de la cometa). @param {PersonOptions} [o] */
export function rightHand(o = {}) {
  const rig = rigOf(o);
  const [elbow, wrist] = rightArm(rig, o);
  const [ux, uy] = towards(elbow, wrist);
  return { x: round(wrist[0] + ux * rig.hand * 0.45), y: round(wrist[1] + uy * rig.hand * 0.45) };
}

// ------------------------------------------------------------------ en bici

/**
 * Donde cae la rodilla (o el codo) entre dos puntos, con los huesos de su
 * largo: la articulacion se dobla hacia `bend` (1 adelante, -1 atras).
 * @param {Point} a @param {Point} b @param {number} l1 @param {number} l2 @param {number} bend
 * @returns {Point}
 */
function joint(a, b, l1, l2, bend) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const dist = Math.hypot(dx, dy) || 1;
  const d = Math.min(dist, l1 + l2 - 0.01);
  const ux = dx / dist;
  const uy = dy / dist;
  const t = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - t * t));
  return [a[0] + ux * t + uy * h * bend, a[1] + uy * t - ux * h * bend];
}

/** La bici, en sus unidades (ver things.js): sillin, puno del manillar y la parte de arriba de cada pedal. */
const BIKE = {
  seat: /** @type {Point} */ ([-7.4, -25.6]),
  grip: /** @type {Point} */ ([10, -27.4]),
  pedals: /** @type {Point[]} */ ([[-1.6, -14.2], [-6.4, -6.8]]),
};

/** Lo que se inclina hacia el manillar quien va en bici (grados). */
const LEAN = 12;

/** Zapatilla vista de lado, con el tobillo en (x, y) y la punta hacia delante. @param {number} x @param {number} y @param {string} colour */
function sideShoe(x, y, colour) {
  const d = smooth([[x - 1.6, y + 0.1], [x - 1.9, y + 1.6], [x - 1.2, y + 2.9], [x + 2.6, y + 2.9], [x + 4.1, y + 2.5], [x + 3.8, y + 1.4],
    [x + 2.2, y + 0.4], [x + 0.9, y - 0.5]]);
  return part(d, colour, 0.15) + over(d, 'ball', 0.8)
    + `<path d="M ${round(x - 1.95)} ${round(y + 2.15)} L ${round(x + 4.1)} ${round(y + 2.15)} L ${round(x + 3.8)} ${round(y + 2.95)} L ${round(x - 1.2)} ${round(y + 2.95)} Z" fill="${CLOTH.sole}"/>`;
}

/**
 * Una pierna sentada (cadera, rodilla, tobillo), con lo que cubra la ropa.
 * @param {Point} hip @param {Point} knee @param {Point} ankle @param {Rig} rig @param {string} skin @param {Who} who @param {boolean} far
 */
function seatedLeg(hip, knee, ankle, rig, skin, who, far) {
  const tone = far ? darker(skin, 0.12) : skin;
  const [w0, , w2, , w4] = rig.leg;
  const d = tube([[hip[0], hip[1], w0], [knee[0], knee[1], w2], [ankle[0], ankle[1], w4]]);
  let out = part(d, tone) + over(d, 'skin');
  const mid = /** @type {Point} */ ([hip[0] + (knee[0] - hip[0]) * 0.55, hip[1] + (knee[1] - hip[1]) * 0.55]);
  if (who === 'boy') {
    const cloth = far ? darker(CLOTH.denim, 0.12) : CLOTH.denim;
    const shorts = tube([[hip[0], hip[1], w0 + 0.7], [mid[0], mid[1], w0 + 0.5]]);
    out += part(shorts, cloth) + over(shorts, 'cloth');
  } else if (who === 'girl' || who === 'woman') {
    const cloth = far ? darker(CLOTH.skirt, 0.12) : CLOTH.skirt;
    const skirt = tube([[hip[0] - 1, hip[1] - 0.6, w0 + 1.6], [mid[0], mid[1] + 0.6, w0 + 2.2]]);
    out += part(skirt, cloth) + over(skirt, 'cloth');
  } else {
    const trousers = tube([[hip[0], hip[1], w0 + 1.2], [knee[0], knee[1], w2 + 1.2], [ankle[0], ankle[1], w4 + 1]]);
    out += part(trousers, far ? darker(CLOTH.trousers, 0.12) : CLOTH.trousers) + over(trousers, 'cloth');
  }
  if (who === 'boy' || who === 'girl') out += part(`M ${round(ankle[0] - 1.4)} ${round(ankle[1] - 1.8)} h 2.8 v 2.4 h -2.8 Z`, far ? '#E6E8EC' : '#F6F5F2', 0.12);
  const shoeColour = who === 'girl' ? '#6E2A32' : who === 'woman' ? '#5A3A4A' : who === 'man' ? '#3B2820' : '#3A3F55';
  return out + sideShoe(ankle[0], ankle[1], far ? darker(shoeColour, 0.15) : shoeColour);
}

/**
 * Alguien montado en bici, en las unidades de la bici (la bici dibujada en el
 * mismo sitio y al mismo tamano): sentado en el sillin, los pies en los
 * pedales y las manos en el manillar. Devuelve lo que va detras del cuadro
 * (la pierna de alla) y lo que va delante (todo lo demas).
 * @param {PersonOptions} [o]
 */
export function rider(o = {}) {
  const rig = rigOf(o);
  const k = rig.adult ? 0.72 : 0.92;
  const seat = /** @type {Point} */ ([0, rig.hip[1] + 1.6]);
  const toPerson = (/** @type {Point} */ b) => /** @type {Point} */ ([(b[0] - BIKE.seat[0]) / k + seat[0], (b[1] - BIKE.seat[1]) / k + seat[1]]);
  // El manillar visto desde el cuerpo inclinado.
  const g = toPerson(BIKE.grip);
  const rad = (-LEAN * Math.PI) / 180;
  const gx = seat[0] + (g[0] - seat[0]) * Math.cos(rad) - (g[1] - seat[1]) * Math.sin(rad);
  const gy = seat[1] + (g[0] - seat[0]) * Math.sin(rad) + (g[1] - seat[1]) * Math.cos(rad);
  const [ux, uy] = towards(rig.shoulder, [gx, gy]);
  const wrist = /** @type {Point} */ ([gx - ux * rig.hand * 0.45, gy - uy * rig.hand * 0.45]);
  const upperLen = Math.hypot(rig.elbow[0] - rig.shoulder[0], rig.elbow[1] - rig.shoulder[1]);
  const foreLen = Math.hypot(rig.wrist[0] - rig.elbow[0], rig.wrist[1] - rig.elbow[1]);
  const elbow = joint(rig.shoulder, wrist, upperLen, foreLen, -1);
  const p = parts({ ...o, reach: [elbow, wrist] });
  // Piernas: de la cadera al pedal, con la rodilla hacia delante.
  const thigh = Math.hypot(rig.knee[0] - rig.hip[0], rig.knee[1] - rig.hip[1]);
  const shin = Math.abs(rig.ankle[1] - rig.knee[1]);
  const legTo = (/** @type {Point} */ hip, /** @type {Point} */ pedal, /** @type {boolean} */ far) => {
    const top = toPerson(pedal);
    const ankle = /** @type {Point} */ ([top[0] - 1.2, top[1] - 2.9]);
    return seatedLeg(hip, joint(hip, ankle, thigh, shin, 1), ankle, rig, p.skin, p.who, far);
  };
  const hipY = rig.hip[1];
  const near = legTo([rig.hip[0] * 0.65, hipY], BIKE.pedals[0], false);
  const farLeg = legTo([-rig.hip[0] * 0.55, hipY], BIKE.pedals[1], true);
  const seatCloth = p.who === 'boy' ? CLOTH.denim : p.who === 'man' ? CLOTH.trousers : CLOTH.skirt;
  const w = rig.torso[rig.torso.length - 3][0];
  const bottom = `M ${round(-w)} ${round(hipY - 1.2)} L ${round(w)} ${round(hipY - 1.2)} Q ${round(w + 0.7)} ${round(seat[1] + 0.4)} ${round(w * 0.7)} ${round(seat[1] + 0.8)} L ${round(-w * 0.7)} ${round(seat[1] + 0.8)} Q ${round(-w - 0.7)} ${round(seat[1] + 0.4)} ${round(-w)} ${round(hipY - 1.2)} Z`;
  // La otra mano, en el otro puno, un poco por detras.
  const otherHand = `<ellipse cx="${round(gx - 1)}" cy="${round(gy + 0.5)}" rx="${round(rig.hand * 0.3)}" ry="${round(rig.hand * 0.38)}" fill="${darker(p.skin, 0.12)}"/>`;
  const place = (/** @type {string} */ body) => `<g transform="translate(${BIKE.seat[0]} ${BIKE.seat[1]}) scale(${k}) translate(${-seat[0]} ${-seat[1]})">${body}</g>`;
  return {
    back: place(farLeg),
    front: place(near + part(bottom, seatCloth) + over(bottom, 'cloth')
      + `<g transform="rotate(${LEAN} ${seat[0]} ${seat[1]})">${otherHand}${p.back}${p.upper}${p.rightHand}</g>`),
  };
}
