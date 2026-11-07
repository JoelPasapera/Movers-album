// @ts-check
// El estilo de todos los dibujos de la app, en un solo sitio: la misma luz
// (de arriba a la izquierda), sin raya negra de comic (cada forma lleva solo un
// filo muy fino de su mismo color, mas oscuro y medio transparente) y las
// mismas sombras y brillos difuminados. Si cada pieza decidiera lo suyo, una
// escena con doce piezas pareceria un collage; asi parece una pintura.
//
// Todo devuelve trozos de SVG como texto. El volumen sale de los degradados de
// defs.js (grad), que son capas semitransparentes encima del color: funcionan
// con cualquier color, tambien cuando el nino pinta un objeto al colorear.

import { grad, fx } from './defs.js';

/** Tinta de los detalles oscuros (pupilas, costuras): azul muy oscuro. */
export const INK = '#2A2D4A';
/** Grosor del filo de las siluetas (en las unidades de cada pieza): casi invisible, como el borde de una forma pintada. */
export const LINE = 0.55;
/** Grosor de los detalles de dentro (costuras, vetas, bigotes). */
export const FINE = 0.42;

/**
 * Numeros que parecen al azar pero salen siempre iguales (para repartir
 * hojas, granos de arena o motas sin que el dibujo cambie de una vez a otra).
 * @param {number} seed
 */
export function seeded(seed) {
  let x = seed >>> 0 || 1;
  return () => {
    x = (Math.imul(x, 1664525) + 1013904223) >>> 0;
    return x / 4294967296;
  };
}

/** Tonos de piel, de los de verdad. Cada personaje tiene siempre el mismo (ver skinFor). */
export const SKINS = ['#F1D0B6', '#E0B28C', '#BF895F', '#8A5838'];

/** Ropa que no compite con el color de la camiseta (lo que se pregunta). */
export const CLOTH = {
  denim: '#4A5D86',
  skirt: '#4A5378',
  trousers: '#4B4F63',
  shoes: '#3A3D52',
  sole: '#F1EFEA',
};

/** Atributos de un trazo de tinta. @param {number} [w] */
export const ink = (w = LINE) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/**
 * El contorno de una forma: su mismo color, mucho mas oscuro y un poco
 * azulado. Queda mas fino y mas natural que una raya negra.
 * @param {string} fill
 */
export function edge(fill) {
  if (!/^#[0-9a-f]{6}$/i.test(fill)) return INK;
  return mix(darker(fill, 0.5), INK, 0.2);
}

/** Una forma con relleno y un filo suave de su color. @param {string} d @param {string} fill @param {number} [w] */
export const shape = (d, fill, w = LINE) => `<path d="${d}" fill="${fill}" stroke="${edge(fill)}" stroke-opacity="0.38" stroke-width="${round(w * 0.7)}" stroke-linejoin="round" stroke-linecap="round"/>`;

/** El volumen de una forma: luz arriba, sombra abajo. @param {string} d @param {string} [kind] */
export const volume = (d, kind = 'vol') => `<path d="${d}" fill="${grad(kind)}" pointer-events="none"/>`;

/** Forma con su color, su contorno y su volumen. @param {string} d @param {string} fill @param {string} [kind] @param {number} [w] */
export const lit = (d, fill, kind = 'vol', w = LINE) => shape(d, fill, w) + volume(d, kind);

/** Una linea de detalle sin relleno. @param {string} d @param {number} [w] @param {string} [colour] */
export const stroke = (d, w = FINE, colour = INK) => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Sombra propia (el lado al que no llega la luz), difuminada. @param {string} d @param {number} [opacity] */
export const shade = (d, opacity = 0.16) => `<path d="${d}" fill="#1C1424" fill-opacity="${opacity}" filter="${fx('blur')}" pointer-events="none"/>`;

/** Brillo (donde da la luz), difuminado como un reflejo de verdad. @param {string} d @param {number} [opacity] */
export const shine = (d, opacity = 0.45) => `<path d="${d}" fill="#FFFFFF" fill-opacity="${round(opacity * 0.85)}" filter="${fx('blur')}" pointer-events="none"/>`;

/** Una mancha suave (brillo, sombra de contacto, rubor) con un degradado radial. @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {string} kind @param {number} [opacity] @param {number} [rot] */
export const glowSpot = (cx, cy, rx, ry, kind, opacity = 1, rot = 0) => `<ellipse cx="${round(cx)}" cy="${round(cy)}" rx="${round(rx)}" ry="${round(ry)}"${rot ? ` transform="rotate(${round(rot)} ${round(cx)} ${round(cy)})"` : ''} fill="${grad(kind)}"${opacity < 1 ? ` fill-opacity="${round(opacity)}"` : ''} pointer-events="none"/>`;

/** Un pliegue o una arruga: una sombra difuminada y, al lado, un poco de luz. @param {string} d @param {number} [w] @param {number} [opacity] */
export const crease = (d, w = 0.5, opacity = 0.3) => `<path d="${d}" fill="none" stroke="#1C1424" stroke-opacity="${opacity}" stroke-width="${w}" stroke-linecap="round" filter="${fx('blur')}" pointer-events="none"/>`
  + `<path d="${d}" fill="none" stroke="#FFFFFF" stroke-opacity="${round(opacity * 0.5)}" stroke-width="${round(w * 0.35)}" stroke-linecap="round" transform="translate(${round(-w * 0.45)} ${round(-w * 0.3)})" pointer-events="none"/>`;

/** Sombra suave en el suelo, bajo lo que esta de pie. @param {number} rx @param {number} [cx] @param {number} [cy] */
export const ground = (rx, cx = 0, cy = 0) => `<ellipse cx="${round(cx + rx * 0.62)}" cy="${round(cy - rx * 0.05)}" rx="${round(rx * 1.05)}" ry="${round(rx * 0.17)}" fill="${grad('cast')}"/>`
  + `<ellipse cx="${cx}" cy="${cy}" rx="${round(rx * 0.9)}" ry="${round(rx * 0.2)}" fill="${grad('soft')}"/>`
  + `<ellipse cx="${cx}" cy="${cy}" rx="${round(rx * 0.55)}" ry="${round(rx * 0.1)}" fill="${grad('soft')}"/>`;

/**
 * Un brazo, una pierna o un tubo: un trazo grueso de color con su contorno y
 * su volumen de cilindro.
 * @param {string} d @param {string} colour @param {number} width @param {number} [line] grosor del contorno
 */
export const limb = (d, colour, width, line = LINE) => `<path d="${d}" fill="none" stroke="${edge(colour)}" stroke-opacity="0.6" stroke-width="${round(width + line * 1.1)}" stroke-linecap="round" stroke-linejoin="round"/>`
  + `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
  + `<path d="${d}" fill="none" stroke="${grad('side')}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;

/**
 * Un camino suave que pasa por todos los puntos (curva de Catmull-Rom): para
 * formas organicas (piernas, hojas, lomos) sin esquinas.
 * @param {[number, number][]} pts @param {boolean} [closed]
 */
export function smooth(pts, closed = true) {
  const n = pts.length;
  const at = (/** @type {number} */ i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
  let d = `M ${round(pts[0][0])} ${round(pts[0][1])}`;
  const last = closed ? n : n - 1;
  for (let i = 0; i < last; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    d += ` C ${round(p1[0] + (p2[0] - p0[0]) / 6)} ${round(p1[1] + (p2[1] - p0[1]) / 6)}`
      + ` ${round(p2[0] - (p3[0] - p1[0]) / 6)} ${round(p2[1] - (p3[1] - p1[1]) / 6)} ${round(p2[0])} ${round(p2[1])}`;
  }
  return closed ? `${d} Z` : d;
}

/**
 * El contorno de un tubo que se estrecha (un brazo: hombro, codo, muneca),
 * como camino cerrado: cada punto es [x, y, medio ancho].
 * @param {[number, number, number][]} pts
 */
export function tube(pts) {
  /** @type {[number, number][]} */
  const left = [];
  /** @type {[number, number][]} */
  const right = [];
  pts.forEach(([x, y, w], i) => {
    const a = pts[Math.max(0, i - 1)];
    const b = pts[Math.min(pts.length - 1, i + 1)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    left.push([x + nx * w, y + ny * w]);
    right.push([x - nx * w, y - ny * w]);
  });
  return smooth([...left, ...right.reverse()]);
}

/**
 * Varias formas que se tocan con un solo contorno por fuera (la copa de un
 * arbol hecha de matas, una nube): primero los contornos, luego los rellenos
 * encima, que tapan las lineas de dentro, y la luz de cada mata.
 * @param {string[]} paths @param {string} fill @param {boolean} [lumpy] cada mata con su propio brillo
 */
export const blob = (paths, fill, lumpy = true) => paths.map((d) => `<path d="${d}" fill="${fill}" stroke="${edge(fill)}" stroke-opacity="0.5" stroke-width="${round(LINE * 1.6)}" stroke-linejoin="round"/>`).join('')
  + paths.map((d) => `<path d="${d}" fill="${fill}"/>`).join('')
  + (lumpy ? paths.map((d) => `<path d="${d}" fill="${grad('ball')}" fill-opacity="0.75"/>`).join('') : '');

/** Un circulo como camino (para blob). @param {number} cx @param {number} cy @param {number} r */
export const circle = (cx, cy, r) => `M ${round(cx - r)} ${round(cy)} a ${round(r)} ${round(r)} 0 1 0 ${round(r * 2)} 0 a ${round(r)} ${round(r)} 0 1 0 ${round(-r * 2)} 0 Z`;

/** Coloca una pieza: los pies en (x, y) y su tamano. @param {number} x @param {number} y @param {number} s @param {string} body */
export const place = (x, y, s, body) => `<g transform="translate(${x} ${y}) scale(${s})">${body}</g>`;

/** Redondea para que el SVG no lleve 17 decimales. @param {number} n */
export function round(n) {
  return Math.round(n * 100) / 100;
}

/** Los tres canales de un color. @param {string} hex @returns {[number, number, number]} */
export function rgb(hex) {
  const h = hex.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h;
  return [parseInt(full.slice(0, 2), 16), parseInt(full.slice(2, 4), 16), parseInt(full.slice(4, 6), 16)];
}

/** Un tono mas oscuro (k entre 0 y 1). @param {string} hex @param {number} k */
export function darker(hex, k = 0.25) {
  const [r, g, b] = rgb(hex).map((c) => Math.round(c * (1 - k)));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** Mezcla dos colores (t = 0 da el primero, 1 el segundo). @param {string} a @param {string} b @param {number} t */
export function mix(a, b, t) {
  const ca = rgb(a);
  const cb = rgb(b);
  return `#${ca.map((c, i) => Math.round(c + (cb[i] - c) * t).toString(16).padStart(2, '0')).join('')}`;
}

/** Un tono mas claro (k entre 0 y 1). @param {string} hex @param {number} k */
export function lighter(hex, k = 0.3) {
  const [r, g, b] = rgb(hex).map((c) => Math.round(c + (255 - c) * k));
  return `#${[r, g, b].map((c) => c.toString(16).padStart(2, '0')).join('')}`;
}

/** ¿Es un gris (pelo cano)? @param {string} hex */
export function isGrey(hex) {
  const [r, g, b] = rgb(hex);
  return Math.max(r, g, b) - Math.min(r, g, b) < 26 && (r + g + b) / 3 > 150;
}

/** Un numero estable a partir de un texto (para elegir sin azar). @param {string} text */
export function hash(text) {
  let h = 7;
  for (const ch of text) h = (Math.imul(h, 31) + ch.charCodeAt(0)) >>> 0;
  return h;
}
