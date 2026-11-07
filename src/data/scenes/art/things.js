// @ts-check
// Las cosas de las escenas: muebles, juguetes, comida, transportes y paisaje,
// dibujadas con detalle de verdad: vetas en la madera, mimbre en la cesta,
// radios y cubiertas en la bici, reflejos en el cristal, hojas en el arbol.
// Cada una con la base en y = 0 y del mismo tamano que su dibujo anterior (lo
// que esta "on the table" sigue encima de la mesa).

import {
  INK, LINE, FINE, shape, lit, volume, stroke, shade, shine, ground, circle, darker, lighter, round, seeded, edge, smooth, glowSpot,
} from './style.js';
import { grad, fx, uid } from './defs.js';
import { rider } from './people.js';

const WOOD = '#C08347';
const WOOD_DARK = '#8E5A2E';

/** Los colores de las cabinas de la noria. */
const CABINS = ['#E5483B', '#2F80ED', '#FFC93C', '#3DAA5C', '#F5862B', '#8E55D0'];

/** @param {number} n @param {number} [f] */
const fixed = (n, f = 2) => Number(n.toFixed(f));

/** Vetas de madera en un rectangulo (lineas onduladas a lo largo). @param {number} x0 @param {number} y0 @param {number} x1 @param {number} y1 @param {number} n @param {number} seed */
function grain(x0, y0, x1, y1, n, seed) {
  const rnd = seeded(seed);
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const y = y0 + ((i + 0.5) / n) * (y1 - y0) + (rnd() - 0.5) * 0.6;
    const a = x0 + rnd() * (x1 - x0) * 0.3;
    const b = x1 - rnd() * (x1 - x0) * 0.3;
    const mid = (a + b) / 2;
    d += `M ${fixed(a)} ${fixed(y)} Q ${fixed(mid)} ${fixed(y + (rnd() - 0.5) * 1.2)} ${fixed(b)} ${fixed(y)} `;
  }
  return d;
}

/** Vetas verticales (patas, tablas de la valla). @param {number} x0 @param {number} y0 @param {number} x1 @param {number} y1 @param {number} n @param {number} seed */
function grainV(x0, y0, x1, y1, n, seed) {
  const rnd = seeded(seed);
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const x = x0 + ((i + 0.5) / n) * (x1 - x0);
    const a = y0 + rnd() * (y1 - y0) * 0.25;
    const b = y1 - rnd() * (y1 - y0) * 0.25;
    d += `M ${fixed(x)} ${fixed(a)} Q ${fixed(x + (rnd() - 0.5) * 0.8)} ${fixed((a + b) / 2)} ${fixed(x)} ${fixed(b)} `;
  }
  return d;
}

/**
 * Una nube de verdad (un cumulo): muchas matas redondas que se funden, cada una
 * con su lado al sol arriba a la izquierda y su sombra abajo a la derecha, la
 * base plana y mas oscura, y los bordes blandos.
 * @param {string} fill el color al sol @param {string} base el color de la sombra
 */
function puffy(fill, base) {
  const billows = [[-15, -6.6, 8.6], [-6, -11.4, 9.6], [3, -14.6, 10.6], [12.4, -9.4, 8.6], [19, -4.6, 5.4], [-21, -3.4, 4.6],
    [-9.4, -4.4, 7.4], [6.4, -4.2, 7.4], [-1, -20.2, 5.6], [9, -20.0, 4.6]];
  // La franja de la base va en el mismo sentido que los circulos: si fuera al
  // reves, donde se cruzan quedarian agujeros.
  const mass = billows.map(([x, y, r]) => circle(x, y, r)).join(' ') + ' M -24 -4 Q -25.4 0.4 -21 0.8 L 20 0.8 Q 23.6 0.6 22.8 -4 Z';
  const id = uid('c');
  const flat = uid('c');
  // La base es plana: lo que de las matas baja de ella no se ve.
  return `<clipPath id="${flat}"><path d="M -30 -40 H 30 V -0.4 Q 0 1.4 -30 -0.4 Z"/></clipPath><g clip-path="url(#${flat})">`
    + `<path d="${mass}" fill="${base}" stroke="${darker(base, 0.2)}" stroke-opacity="0.25" stroke-width="0.4"/>`
    + `<clipPath id="${id}"><path d="${mass}"/></clipPath><g clip-path="url(#${id})">`
    // Cada mata, al sol por arriba a la izquierda: un brillo blando sin borde.
    + billows.map(([x, y, r]) => `<circle cx="${round(x - r * 0.22)}" cy="${round(y - r * 0.26)}" r="${round(r * 1.02)}" fill="${fill}" fill-opacity="0.9" filter="${fx('blur2')}"/>`).join('')
    + billows.map(([x, y, r]) => `<circle cx="${round(x - r * 0.3)}" cy="${round(y - r * 0.4)}" r="${round(r * 0.75)}" fill="${grad('spec')}" fill-opacity="0.7"/>`).join('')
    // La base plana, en sombra.
    + `<path d="M -26 -4.2 Q -10 -7.4 0 -5.0 Q 12 -7.6 24 -4.0 L 24 2 L -26 2 Z" fill="${base}" fill-opacity="0.85" filter="${fx('blur2')}"/>`
    + '</g></g>';
}

/**
 * La lluvia que cae de una nube: cortinas de hilos inclinados, unos claros y
 * otros mas oscuros, y alguna gota que brilla.
 * @param {number} seed
 */
function rain(seed) {
  const rnd = seeded(seed);
  let dark = '';
  let light = '';
  for (let i = 0; i < 34; i += 1) {
    const x = -18 + rnd() * 34;
    const y = 1 + rnd() * 9;
    const l = 5 + rnd() * 8;
    const line = `M ${fixed(x)} ${fixed(y)} l ${fixed(-l * 0.22)} ${fixed(l)} `;
    if (rnd() < 0.55) dark += line; else light += line;
  }
  return `<path d="${dark}" stroke="#4D7BAA" stroke-opacity="0.85" stroke-width="0.7" stroke-linecap="round"/>`
    + `<path d="${light}" stroke="#9DC2E6" stroke-opacity="0.9" stroke-width="0.55" stroke-linecap="round"/>`
    + `<g fill="#DCEEFF" stroke="#4D7BAA" stroke-opacity="0.75" stroke-width="0.25"><ellipse cx="-12.4" cy="14.4" rx="0.7" ry="1.1"/><ellipse cx="1.6" cy="18" rx="0.7" ry="1.1"/><ellipse cx="11.4" cy="14.8" rx="0.7" ry="1.1"/><ellipse cx="-5" cy="20.6" rx="0.6" ry="0.95"/><ellipse cx="7" cy="21.4" rx="0.6" ry="0.95"/></g>`;
}

/**
 * La nieve que cae: copos blandos de distintos tamanos, blancos con un borde
 * azulado para que se vean contra el cielo.
 * @param {number} seed
 */
function snowfall(seed) {
  const rnd = seeded(seed);
  let flakes = '';
  let shadows = '';
  for (let i = 0; i < 22; i += 1) {
    const x = -18 + rnd() * 36;
    const y = 4 + rnd() * 22;
    const r = 0.6 + rnd() * 0.9;
    flakes += `<circle cx="${fixed(x)}" cy="${fixed(y)}" r="${fixed(r)}"/>`;
    shadows += `<circle cx="${fixed(x + 0.25)}" cy="${fixed(y + 0.3)}" r="${fixed(r + 0.25)}"/>`;
  }
  return `<g fill="#7F95B5" fill-opacity="0.55" filter="${fx('blur')}">${shadows}</g><g fill="#FFFFFF">${flakes}</g>`;
}

/**
 * La forma del agua de un rio (la pieza river), en sus unidades: lo que flota
 * en el se refleja solo ahi.
 * @param {{ width?: number }} [o]
 */
export function riverWater(o = {}) {
  const w = o.width ?? 52;
  const h = fixed(w / 2);
  return `M ${-w} -3 Q ${-h} -10 0 -4 Q ${h} 2 ${w} -4 Q ${w + 7} 4 ${w} 12 Q ${h} 18 0 12 Q ${-h} 6 ${-w} 12 Q ${-w - 7} 4 ${-w} -3 Z`;
}

export const THINGS = {
  /** Tarta de cumpleanos: bizcocho marron en dos pisos, crema, glaseado rosa que gotea y una vela encendida. */
  cake: () => {
    const sponge = '#C98A4E';
    const icing = '#FF7FAE';
    const side = 'M -16.4 -14.4 L -16.4 -2 Q 0 2.4 16.4 -2 L 16.4 -14.4 Q 0 -10.6 -16.4 -14.4 Z';
    let crumbs = '';
    const rnd = seeded(11);
    for (let i = 0; i < 26; i += 1) {
      const x = -15 + rnd() * 30;
      const y = -12 + rnd() * 9;
      if (y > -9.4 && y < -6.8) continue;
      crumbs += `<circle cx="${fixed(x)}" cy="${fixed(y)}" r="${fixed(0.25 + rnd() * 0.25)}" fill="${darker(sponge, 0.25)}" fill-opacity="0.7"/>`;
    }
    let sprinkles = '';
    const sp = seeded(5);
    const tints = ['#FFFFFF', '#FFD84A', '#7BD3F7', '#9BE58A', '#C9A3FF'];
    for (let i = 0; i < 16; i += 1) {
      const a = sp() * Math.PI * 2;
      const r = Math.sqrt(sp());
      const x = Math.cos(a) * r * 13;
      const y = -16.4 + Math.sin(a) * r * 2.6;
      if (Math.abs(x) < 2.6 && y < -15.6) continue;
      sprinkles += `<rect x="${fixed(x - 0.8)}" y="${fixed(y - 0.28)}" width="1.6" height="0.56" rx="0.28" fill="${tints[i % tints.length]}" transform="rotate(${fixed(sp() * 180)} ${fixed(x)} ${fixed(y)})"/>`;
    }
    const drips = 'M -16.6 -16.4 Q -16.8 -12.4 -15.6 -11.6 Q -14.4 -11.2 -14.4 -12.8 Q -14.2 -14.2 -12.6 -13.6 Q -11.4 -9.8 -9.8 -10.4 Q -8.6 -11 -8.8 -13 Q -6.6 -12.6 -5.2 -12.8 Q -4.6 -10.6 -3.2 -10.8 Q -2 -11.2 -2.2 -12.4 Q 1 -12 3.6 -12.4 Q 4 -8.6 5.8 -9 Q 7.2 -9.6 7 -12.6 Q 9.4 -13 11.4 -13.4 Q 12 -11.6 13.2 -11.8 Q 14.4 -12.2 14.4 -14 Q 15.8 -14.4 16.6 -15.2 Q 16.8 -16.6 16.6 -16.4 Q 0 -20.2 -16.6 -16.4 Z';
    return ground(19, 0, 0.4)
      + `<ellipse cx="0" cy="-0.6" rx="18.6" ry="2.3" fill="#FFFFFF" stroke="${edge('#E8ECF2')}" stroke-width="${FINE}"/>`
      + `<ellipse cx="0" cy="-0.6" rx="18.6" ry="2.3" fill="${grad('deep')}"/>`
      + shape(side, sponge) + volume(side, 'side') + crumbs
      + shape('M -16.4 -9.2 Q 0 -5.6 16.4 -9.2 L 16.4 -7 Q 0 -3.2 -16.4 -7 Z', '#FFF3DF', FINE)
      + stroke('M -15 -8.4 q 1 0.6 2 0 M -8 -7.2 q 1 0.6 2 0 M 1 -6.6 q 1 0.6 2 0 M 9 -7.2 q 1 0.6 2 0', 0.3, '#E6CFA8')
      + `<ellipse cx="0" cy="-16.4" rx="16.6" ry="3.6" fill="${icing}" stroke="${edge(icing)}" stroke-width="${LINE}"/>`
      + shape(drips, icing) + volume(drips, 'side')
      + `<ellipse cx="0" cy="-16.6" rx="16.2" ry="3.3" fill="${lighter(icing, 0.12)}"/>`
      + shine('M -12.6 -17.8 Q -4 -19.6 6 -19 Q -3 -18 -11.4 -16.6 Z', 0.5)
      + shine('M -14.6 -14.2 q 0.4 1.4 0 2.4 l -0.5 -0.2 q 0.3 -1 0 -2 Z M 4.4 -11.6 q 0.4 1.4 0 2.4 l -0.5 -0.2 q 0.3 -1 0 -2 Z', 0.55)
      + sprinkles
      // Vela con rayas, mecha y llama que brilla.
      + shape('M -1.4 -16.6 V -29.4 Q 0 -30 1.4 -29.4 V -16.6 Z', '#FFFFFF', FINE) + volume('M -1.4 -16.6 V -29.4 Q 0 -30 1.4 -29.4 V -16.6 Z', 'side')
      + stroke('M -1.3 -19.6 l 2.6 -1.6 M -1.3 -23 l 2.6 -1.6 M -1.3 -26.4 l 2.6 -1.6', 0.7, '#FF6B81')
      + stroke('M 0 -29.6 v -1.6', 0.35, '#3A3036')
      + `<circle cx="0" cy="-34" r="6" fill="${grad('glow')}"/>`
      + shape('M 0 -37.8 Q 3 -34 2.1 -31.8 Q 0 -30 -2.1 -31.8 Q -3 -34 0 -37.8 Z', '#FFA531', 0.3)
      + '<path d="M 0 -35.6 Q 1.4 -33.4 0.9 -32.3 Q 0 -31.6 -0.9 -32.3 Q -1.4 -33.4 0 -35.6 Z" fill="#FFF1A8"/>';
  },

  /** Mesa de madera con vetas, tablero grueso y patas torneadas. */
  table: () => {
    const legs = [[-25.2, -22.4], [22.4, 25.2]].map(([a, b]) => {
      const d = `M ${a} -17 L ${b} -17 L ${fixed(b - 0.3)} -0.4 Q ${fixed((a + b) / 2)} 0.3 ${fixed(a + 0.3)} -0.4 Z`;
      return shape(d, WOOD_DARK) + volume(d, 'side') + stroke(grainV(a + 0.4, -16.6, b - 0.4, -1, 2, Math.round(a * 7)), 0.25, darker(WOOD_DARK, 0.3));
    }).join('');
    const top = 'M -31 -22.4 Q -31 -24 -29.4 -24 L 29.4 -24 Q 31 -24 31 -22.4 L 31 -19.8 Q 31 -18.2 29.4 -18.2 L -29.4 -18.2 Q -31 -18.2 -31 -19.8 Z';
    return ground(28, 0, 0.4)
      + legs
      + shape('M -27 -18.4 L 27 -18.4 L 27 -15.2 L -27 -15.2 Z', darker(WOOD, 0.18), FINE)
      + shade('M -27 -18.4 L 27 -18.4 L 27 -17 L -27 -17 Z', 0.25)
      + shape(top, WOOD) + volume(top, 'top')
      + stroke(grain(-30, -23.4, 30, -18.8, 4, 3), 0.28, darker(WOOD, 0.28))
      + stroke('M -12 -21.6 q 1.6 -0.8 3.2 0 q -1.6 0.8 -3.2 0 Z M 14 -20.4 q 1.2 -0.6 2.4 0 q -1.2 0.6 -2.4 0 Z', 0.25, darker(WOOD, 0.35))
      + stroke('M -30.6 -20.2 L 30.6 -20.2', 0.3, lighter(WOOD, 0.25))
      + shine('M -29 -23.4 L 24 -23.4 L 23 -22.7 L -28.6 -22.7 Z', 0.35);
  },

  /**
   * Arbol: tronco con corteza y raices, ramas que entran en la copa y una copa
   * de cientos de hojas, mas claras donde da el sol (arriba a la izquierda) y
   * mas oscuras por dentro y por debajo (con nieve encima si snow).
   * @param {{ snow?: boolean }} [o]
   */
  tree: (o = {}) => {
    const bark = '#6E4A30';
    const tones = o.snow ? ['#1E3F2A', '#284F33', '#36613E', '#4C7A50', '#6C9670'] : ['#1F4A24', '#2A6230', '#3A7D38', '#55994A', '#82BC62'];
    /** @type {[number, number, number][]} */
    const masses = [[0, -50, 22], [-19, -41, 13], [19, -41, 13], [-11, -62, 11.5], [11, -61, 11.5], [-23, -52, 9.5], [23, -51, 9.5],
      [0, -68, 8.5], [-6, -40, 12], [8, -40, 12]];
    const trunk = smooth([[-5.2, -38], [-4.6, -24], [-4.9, -10], [-6.2, -4], [-9.8, -0.9], [-11, 0.2], [0, 0.6], [11, 0.2], [9.8, -0.9],
      [6.4, -4], [5.1, -10], [4.8, -24], [5.4, -38]]);
    const rnd = seeded(7);
    let barkDark = '';
    let barkLight = '';
    for (let i = 0; i < 16; i += 1) {
      const x = -5 + i * 0.66 + (rnd() - 0.5) * 0.3;
      const d = `M ${fixed(x, 1)} -38 q ${fixed(0.6 - rnd(), 1)} 6 ${fixed(rnd() - 0.5, 1)} 12 q ${fixed(rnd() - 0.5, 1)} 6 ${fixed(0.3 - rnd() * 0.6, 1)} 12 q ${fixed(rnd() - 0.5, 1)} 5 ${fixed(-0.2 + rnd() * 0.4, 1)} 12 `;
      if (i % 3 === 1) barkLight += d; else barkDark += d;
    }
    const clip = uid('tr');
    // Las hojas: cada una en una masa, con su tono segun la luz.
    const leaves = ['', '', '', '', ''];
    const total = masses.reduce((a, m) => a + m[2] * m[2], 0);
    for (let i = 0; i < 320; i += 1) {
      let pick = rnd() * total;
      let m = masses[0];
      for (const mm of masses) {
        pick -= mm[2] * mm[2];
        if (pick <= 0) { m = mm; break; }
      }
      const a = rnd() * Math.PI * 2;
      const rr = m[2] * Math.sqrt(0.12 + 0.88 * rnd());
      const x = m[0] + Math.cos(a) * rr;
      const y = m[1] + Math.sin(a) * rr;
      const local = (-Math.cos(a) * 0.55 - Math.sin(a) * 0.83) * (rr / m[2]);
      const global = ((-50 - y) / 26) * 0.6 + (-x / 34) * 0.25;
      const t = 0.5 + local * 0.45 + global * 0.35 + (rnd() - 0.5) * 0.35;
      const tone = Math.max(0, Math.min(4, Math.round(t * 4)));
      const len = 1.5 + rnd() * 1.1;
      const wid = len * 0.42;
      const ang = rnd() * Math.PI * 2;
      const ex = x + Math.cos(ang) * len;
      const ey = y + Math.sin(ang) * len;
      const mx = (x + ex) / 2;
      const my = (y + ey) / 2;
      const px = -Math.sin(ang) * wid;
      const py = Math.cos(ang) * wid;
      leaves[tone] += `M ${fixed(x, 1)} ${fixed(y, 1)} Q ${fixed(mx + px, 1)} ${fixed(my + py, 1)} ${fixed(ex, 1)} ${fixed(ey, 1)} Q ${fixed(mx - px, 1)} ${fixed(my - py, 1)} ${fixed(x, 1)} ${fixed(y, 1)} Z `;
    }
    let out = ground(28, 0, 0.4)
      + `<clipPath id="${clip}"><path d="${trunk}"/></clipPath>`
      + `<path d="${trunk}" fill="${bark}"/>` + `<path d="${trunk}" fill="${grad('side')}"/>`
      + `<g clip-path="url(#${clip})">${stroke(barkDark, 0.5, darker(bark, 0.4))}${stroke(barkLight, 0.35, lighter(bark, 0.25))}`
      + `<path d="M -11 0.6 L 11 0.6 L 11 -5 Q 0 -1 -11 -5 Z" fill="#1C1424" fill-opacity="0.22" filter="${fx('blur')}"/></g>`
      // La copa: primero la sombra de dentro, luego las ramas, luego matas de
      // hojas cada vez mas claras, todo con el borde roto en matas (leafy) y
      // con grano de hojas por encima.
      + `<g filter="${fx('leafy')}">`
      + masses.map(([x, y, r]) => `<path d="${circle(x, y + 1.2, r * 0.98)}" fill="${tones[0]}"/>`).join('')
      + masses.map(([x, y, r]) => `<path d="${circle(x - r * 0.12, y - r * 0.12, r * 0.86)}" fill="${tones[1]}"/>`).join('')
      + masses.map(([x, y, r]) => `<path d="${circle(x - r * 0.3, y - r * 0.32, r * 0.5)}" fill="${tones[2]}" fill-opacity="0.85"/>`
        + `<path d="${circle(x - r * 0.42, y - r * 0.45, r * 0.28)}" fill="${tones[3]}" fill-opacity="0.75"/>`).join('')
      + leaves.map((d, i) => (d ? `<path d="${d}" fill="${tones[i]}"/>` : '')).join('')
      + `<path d="${masses.map(([x, y, r]) => circle(x, y, r * 0.95)).join(' ')}" fill="#0E2410" fill-opacity="0.55" filter="${fx('grain')}"/>`
      + `<path d="${masses.map(([x, y, r]) => circle(x - r * 0.3, y - r * 0.32, r * 0.55)).join(' ')}" fill="${tones[4]}" fill-opacity="0.6" filter="${fx('grain2')}"/>`
      + '</g>'
      + `<path d="M -30 -40 Q -16 -27 0 -28 Q 16 -27 30 -40 Q 22 -30 0 -27 Q -22 -30 -30 -40 Z" fill="#14301A" fill-opacity="0.3" filter="${fx('blur2')}"/>`
      + `<ellipse cx="-10" cy="-60" rx="16" ry="10" fill="${grad('spec')}" fill-opacity="0.18"/>`;
    if (o.snow) {
      const cap = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ w) => {
        const d = `M ${fixed(x - w)} ${fixed(y + 1.6)} Q ${fixed(x - w * 0.8)} ${fixed(y - 1.8)} ${fixed(x)} ${fixed(y - 2.4)} Q ${fixed(x + w * 0.8)} ${fixed(y - 1.8)} ${fixed(x + w)} ${fixed(y + 1.6)} Q ${fixed(x + w * 0.5)} ${fixed(y + 0.4)} ${fixed(x + w * 0.2)} ${fixed(y + 1.4)} Q ${fixed(x - w * 0.2)} ${fixed(y + 0.2)} ${fixed(x - w * 0.5)} ${fixed(y + 1.2)} Q ${fixed(x - w * 0.8)} ${fixed(y + 0.6)} ${fixed(x - w)} ${fixed(y + 1.6)} Z`;
        return `<path d="${d}" fill="#FFFFFF"/>` + `<path d="${d}" fill="${grad('deep')}"/>`;
      };
      out += cap(0, -74, 7) + cap(-11, -71, 8) + cap(11, -70, 8) + cap(-23, -60, 6.5) + cap(23, -59, 6.5) + cap(-30, -48, 4) + cap(30, -47, 4)
        + cap(0, -70, 12);
    }
    return out;
  },

  /** Concha rosa (una vieira) con sus costillas y la bisagra. */
  shell: () => {
    const c = '#FFA6C9';
    const body = 'M -12.6 -0.6 Q -13.6 -9.6 -6.4 -12.4 Q 0 -14.8 6.4 -12.4 Q 13.6 -9.6 12.6 -0.6 Q 0 1.2 -12.6 -0.6 Z';
    let ribs = '';
    for (let i = -4; i <= 4; i += 1) {
      const a = (i / 9) * Math.PI - Math.PI / 2;
      ribs += `M 0 0.4 L ${fixed(Math.cos(a) * 13.6)} ${fixed(Math.sin(a) * 13.4)} `;
    }
    return ground(12, 0, 0.6)
      + shape('M -4.4 0.4 L -3 -2.2 L 3 -2.2 L 4.4 0.4 L 2.8 1.8 L -2.8 1.8 Z', darker(c, 0.08), FINE)
      + shape(body, c) + volume(body, 'ball')
      + stroke(ribs, 0.9, '#E57DA6') + stroke(ribs, 0.3, '#FFD3E4')
      + stroke('M -11.6 -3.6 Q 0 -1.6 11.6 -3.6 M -11.4 -7.4 Q 0 -5.4 11.4 -7.4 M -8.6 -10.6 Q 0 -9 8.6 -10.6', 0.25, '#D9638F')
      + shine('M -9.6 -8.4 Q -7 -11.4 -3 -12.4 Q -6 -9.4 -7.6 -6 Z', 0.5);
  },

  /**
   * Ola grande que rompe: el agua translucida (turquesa donde la atraviesa la
   * luz, honda abajo), el hueco en sombra bajo el labio, la cresta de espuma
   * blanca y blanda, y la espuma que resbala por la cara.
   */
  wave: () => {
    const body = 'M -34 0 Q -22 -14 -10 -22 Q -4 -27 -1 -31 Q 6 -31.4 10.4 -26.8 Q 13 -23.6 11.6 -20 Q 9.6 -22.2 7.2 -21.6 '
      + 'Q 4.2 -20.4 4.0 -14 Q 4.4 -6 11 0 Z';
    const id = uid('w');
    const rnd = seeded(9);
    let foam = '';
    let spray = '';
    for (let i = 0; i < 22; i += 1) {
      const t = rnd();
      const x = -1 + t * 12.4;
      const y = -31 + t * 10.6 + (rnd() - 0.6) * 2.4;
      foam += `<circle cx="${fixed(x)}" cy="${fixed(y)}" r="${fixed(0.6 + rnd() * 1.2)}"/>`;
    }
    for (let i = 0; i < 18; i += 1) spray += `<circle cx="${fixed(-3 + rnd() * 18)}" cy="${fixed(-37 + rnd() * 9)}" r="${fixed(0.18 + rnd() * 0.4)}"/>`;
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6ECFE0"/><stop offset="0.45" stop-color="#2E95C8"/><stop offset="1" stop-color="#1A5C90"/></linearGradient></defs>`
      + `<path d="${body}" fill="url(#${id})" stroke="#1F5F8E" stroke-opacity="0.3" stroke-width="0.35"/>`
      // El hueco bajo el labio, en sombra, y el agua translucida junto a la
      // cresta, sin salirse del agua.
      + `<clipPath id="${id}c"><path d="${body}"/></clipPath><g clip-path="url(#${id}c)">`
      + `<path d="M 9.6 -22 Q 4.2 -21 4.0 -14 Q 4.4 -7 8.6 -2 L 14 -2 L 14 -22 Z" fill="#0E3A62" fill-opacity="0.5" filter="${fx('blur2')}"/>`
      + `<path d="M -14 -20 Q -6 -27 -1 -31 Q 4 -27 3.6 -18 Q -5 -16.6 -14 -20 Z" fill="#9AE8EC" fill-opacity="0.5" filter="${fx('blur2')}"/>`
      + '</g>'
      // Espuma que resbala por la espalda de la ola.
      + `<path d="M -31 -3 Q -24 -11 -14 -17 M -27 -1.6 Q -20 -8 -11 -12.6 M -21 -0.8 Q -15 -5 -8 -7.6" fill="none" stroke="#FFFFFF" stroke-opacity="0.5" stroke-width="0.4" stroke-linecap="round"/>`
      + `<path d="M -31 -3 Q -24 -11 -14 -17 M -27 -1.6 Q -20 -8 -11 -12.6" fill="none" stroke="#FFFFFF" stroke-opacity="0.25" stroke-width="1.4" stroke-linecap="round" filter="${fx('blur')}"/>`
      // La cresta de espuma a lo largo del labio que se enrosca, y la rociada.
      + `<path d="M -3 -30 Q 4 -32.6 9.6 -28 Q 13 -24.6 11.6 -20 Q 9 -23.4 6.6 -24.6 Q 2 -27 -3 -30 Z" fill="#FFFFFF" filter="${fx('blur')}"/>`
      + `<g fill="#FFFFFF" fill-opacity="0.95" filter="${fx('blur')}">${foam}</g>`
      + `<g fill="#FFFFFF" fill-opacity="0.85">${spray}</g>`
      + `<path d="M -34 0 Q -12 -3.4 11 0 Z" fill="#FFFFFF" fill-opacity="0.55" filter="${fx('blur')}"/>`;
  },

  /** Sombrero de paja amarillo, con el trenzado y una cinta. */
  hat: () => {
    const straw = '#F3C84A';
    const brim = '<ellipse cx="0" cy="0" rx="20" ry="5.6"';
    let weave = '';
    for (let i = 0; i < 18; i += 1) {
      const a = (i / 18) * Math.PI * 2;
      weave += `M ${fixed(Math.cos(a) * 12.6)} ${fixed(Math.sin(a) * 3.5)} L ${fixed(Math.cos(a) * 19.2)} ${fixed(Math.sin(a) * 5.3)} `;
    }
    const crown = 'M -11.6 -0.8 Q -11.8 -13 0 -13 Q 11.8 -13 11.6 -0.8 Q 0 1.6 -11.6 -0.8 Z';
    return ground(20, 0, 3.4)
      + `${brim} fill="${straw}" stroke="${edge(straw)}" stroke-width="${LINE}"/>`
      + `${brim} fill="${grad('vol')}"/>`
      + `<ellipse cx="0" cy="0" rx="16" ry="4.4" fill="none" stroke="#D9A630" stroke-width="0.3"/><ellipse cx="0" cy="0" rx="18.4" ry="5.1" fill="none" stroke="#D9A630" stroke-width="0.25"/>`
      + stroke(weave, 0.25, '#C9952A')
      + shape(crown, straw) + volume(crown, 'ball')
      + stroke('M -7 -10.2 q 7 -2 14 0 M -9.4 -7 q 9.4 -2 18.8 0 M -10.6 -4 q 10.6 -1.6 21.2 0', 0.3, '#C9952A')
      + stroke('M -4 -12.4 l -0.6 2 M 0 -12.8 l 0 2 M 4 -12.4 l 0.6 2 M -8 -9.6 l -0.6 2 M -3 -9.8 l -0.2 2 M 2 -9.8 l 0.2 2 M 7 -9.6 l 0.6 2', 0.22, '#D9A630')
      + shape('M -11.7 -4.4 Q 0 -2.2 11.7 -4.4 L 11.6 -1.2 Q 0 1.2 -11.6 -1.2 Z', '#E39B2B', FINE) + volume('M -11.7 -4.4 Q 0 -2.2 11.7 -4.4 L 11.6 -1.2 Q 0 1.2 -11.6 -1.2 Z', 'side')
      + shine('M -8.6 -9 Q -6 -12.2 -1 -12.4 Q -5.4 -10.4 -6.8 -7.6 Z', 0.4);
  },

  /** Entrada de feria. */
  ticket: () => {
    const paper = '#FFE7A8';
    const body = 'M -18 -21 Q -18 -24 -15 -24 L 15 -24 Q 18 -24 18 -21 L 18 -15 Q 15 -15 15 -12 Q 15 -9 18 -9 L 18 -3 Q 18 0 15 0 L -15 0 Q -18 0 -18 -3 L -18 -9 Q -15 -9 -15 -12 Q -15 -15 -18 -15 Z';
    return ground(18, 0, 0.6)
      + shape(body, paper) + volume(body, 'vol')
      + `<path d="M -15.6 -21.6 H 15.6 V -2.4 H -15.6 Z" fill="none" stroke="#E0A458" stroke-width="0.35" stroke-dasharray="1 0.7"/>`
      + lit('M -10.6 -16 L -9 -12.8 L -5.6 -12.4 L -8.2 -10.2 L -7.4 -6.8 L -10.6 -8.6 L -13.8 -6.8 L -13 -10.2 L -15.6 -12.4 L -12.2 -12.8 Z', '#FF7F6E', 'ball', FINE)
      + `<line x1="-3" y1="-22" x2="-3" y2="-2" stroke="${INK}" stroke-width="${FINE}" stroke-dasharray="1.4 1.2"/>`
      + stroke('M 2 -17 h 11 M 2 -12 h 11 M 2 -7 h 7', 0.9, '#5A4A3A');
  },

  /** La noria de la feria: aro de celosia, radios, cabinas y patas con tirantes. */
  wheel: () => {
    let cabins = '';
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2;
      const x = fixed(Math.cos(a) * 30);
      const y = fixed(-38 + Math.sin(a) * 30);
      const c = CABINS[i];
      const body = `M ${fixed(x - 5)} ${fixed(y + 3.6)} Q ${fixed(x - 5)} ${fixed(y + 2.4)} ${fixed(x - 3.6)} ${fixed(y + 2.4)} L ${fixed(x + 3.6)} ${fixed(y + 2.4)} Q ${fixed(x + 5)} ${fixed(y + 2.4)} ${fixed(x + 5)} ${fixed(y + 3.6)} L ${fixed(x + 4)} ${fixed(y + 8.4)} L ${fixed(x - 4)} ${fixed(y + 8.4)} Z`;
      cabins += stroke(`M ${x} ${y} L ${x} ${fixed(y + 2.6)}`, 0.6, '#5C6478')
        + shape(body, c, FINE) + volume(body, 'side')
        + `<path d="M ${fixed(x - 3.6)} ${fixed(y + 3.4)} L ${fixed(x + 3.6)} ${fixed(y + 3.4)} L ${fixed(x + 3.3)} ${fixed(y + 5.6)} L ${fixed(x - 3.3)} ${fixed(y + 5.6)} Z" fill="#CFEAFB" stroke="${edge(c)}" stroke-width="0.25"/>`
        + shine(`M ${fixed(x - 3.2)} ${fixed(y + 3.6)} L ${fixed(x - 1.4)} ${fixed(y + 3.6)} L ${fixed(x - 2)} ${fixed(y + 5.4)} L ${fixed(x - 3)} ${fixed(y + 5.4)} Z`, 0.6);
    }
    let spokes = '';
    let lattice = '';
    let bulbs = '';
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2;
      spokes += `M 0 -38 L ${fixed(Math.cos(a) * 29)} ${fixed(-38 + Math.sin(a) * 29)} `;
    }
    for (let i = 0; i < 36; i += 1) {
      const a = (i / 36) * Math.PI * 2;
      const b = ((i + 1) / 36) * Math.PI * 2;
      const r1 = i % 2 ? 26.6 : 30;
      const r2 = i % 2 ? 30 : 26.6;
      lattice += `M ${fixed(Math.cos(a) * r1)} ${fixed(-38 + Math.sin(a) * r1)} L ${fixed(Math.cos(b) * r2)} ${fixed(-38 + Math.sin(b) * r2)} `;
      if (i % 3 === 0) bulbs += `<circle cx="${fixed(Math.cos(a) * 30.4)}" cy="${fixed(-38 + Math.sin(a) * 30.4)}" r="0.55" fill="#FFF3B0"/>`;
    }
    return ground(26, 0, 0.6)
      + tubeLine('M -16 0 L 0 -38 L 16 0', '#7E889E', 2.4)
      + stroke('M -11.8 -10 L 11.8 -10 M -8 -19 L 8 -19 M -11.8 -10 L 8 -19 M 11.8 -10 L -8 -19', 0.6, '#7E889E')
      + `<circle cx="0" cy="-38" r="30" fill="none" stroke="#5C6478" stroke-width="1.6"/><circle cx="0" cy="-38" r="26.6" fill="none" stroke="#5C6478" stroke-width="1.2"/>`
      + stroke(lattice, 0.5, '#8E98AE')
      + `<circle cx="0" cy="-38" r="30" fill="none" stroke="#DCE2EE" stroke-width="0.5"/>`
      + stroke(spokes, 0.55, '#7C869C')
      + bulbs
      + `<circle cx="0" cy="-38" r="4" fill="#E5483B" stroke="${edge('#E5483B')}" stroke-width="${FINE}"/><circle cx="0" cy="-38" r="4" fill="${grad('ball')}"/>`
      + cabins
      + shape('M -19 0 L 19 0 L 17 -3 L -17 -3 Z', '#8A93A8', FINE) + volume('M -19 0 L 19 0 L 17 -3 L -17 -3 Z', 'top');
  },

  /** Helado de dos bolas (fresa y vainilla) en un cucurucho de barquillo. */
  icecream: () => {
    const cone = 'M -8.2 -16 L 0 0.4 L 8.2 -16 Z';
    // El dibujo de barquillo: rayas paralelas a los dos lados del cucurucho,
    // que empiezan en el borde de arriba y acaban en el otro lado.
    let hatch = '';
    for (let t = -6.2; t < 8.2; t += 2.7) {
      const s = (8.2 - t) / 16.4;
      hatch += `M ${fixed(t)} -16 L ${fixed(t + 8.2 * s)} ${fixed(-16 + 16.4 * s)} M ${fixed(-t)} -16 L ${fixed(-t - 8.2 * s)} ${fixed(-16 + 16.4 * s)} `;
    }
    const pink = 'M -9.4 -18 Q -10.6 -30 0 -30.4 Q 10.6 -30 9.4 -18 Q 7 -14.6 4.6 -17.4 Q 2.4 -15 0 -17.4 Q -2.6 -15 -4.8 -17.4 Q -7 -14.8 -9.4 -18 Z';
    const cream = 'M -7.4 -31 Q -8.6 -40.6 0 -40.8 Q 8.6 -40.6 7.4 -31 Q 5.4 -28.4 3.6 -30.4 Q 1.6 -27.6 -0.4 -30.4 Q -2.4 -28.2 -4 -30.2 Q -6 -28.4 -7.4 -31 Z';
    return shape(cone, '#E2A15A') + volume(cone, 'side')
      + stroke(hatch, 0.45, '#B9773A')
      + stroke('M -8.2 -16 L 0 0.4 L 8.2 -16', LINE, edge('#E2A15A'))
      + shape('M -8.8 -16.4 L 8.8 -16.4 L 8.2 -14.6 L -8.2 -14.6 Z', '#D48E46', FINE)
      + shape(pink, '#FF9EC4') + volume(pink, 'ball')
      + stroke('M -6 -24 q 1 -0.6 2 0 M 2 -26 q 1 -0.6 2 0 M -2 -21 q 1 -0.6 2 0 M 5 -21.6 q 1 -0.6 2 0', 0.3, '#E66F9F')
      + shape(cream, '#FFF4DC') + volume(cream, 'ball')
      + stroke('M -4 -36 q 1 -0.6 2 0 M 2 -35 q 1 -0.6 2 0 M -1 -33 q 1 -0.6 2 0', 0.28, '#E8D2A6')
      + shine('M -5 -36.8 Q -3.6 -39.6 0 -40 Q -2.4 -38.2 -3 -35.8 Z', 0.75)
      + shine('M -7 -24 Q -6 -27.4 -2.6 -28.4 Q -4.6 -26 -5 -23.4 Z', 0.45);
  },

  /** Nube de lluvia: gris oscura por abajo, con la lluvia que cae en hilos. */
  raincloud: () => rain(23) + puffy('#B4BFD0', '#7F8BA2'),

  /** Coche (azul si no se dice otro color): carroceria con brillo, cristales, puertas, luces y ruedas con llanta. @param {{ colour?: string }} [o] */
  car: (o = {}) => {
    const c = o.colour ?? '#2F7FE0';
    const body = 'M -36.6 0 Q -38.4 -1 -38.2 -4.6 L -37.8 -11.4 Q -37.4 -14.6 -33.6 -15.2 L -24 -16 L -17.4 -24.6 Q -15.4 -27 -11.4 -27 L 10.6 -27 Q 14.6 -27 16.6 -24.8 L 24.6 -16 L 33 -14.8 Q 37.8 -14 38.2 -9 L 38.4 -2.6 Q 38.2 0 35.8 0 L 30.6 0 A 8.6 8.6 0 0 0 13.4 0 L -13.4 0 A 8.6 8.6 0 0 0 -30.6 0 Z';
    const wheel = (/** @type {number} */ x) => {
      let spokes = '';
      for (let i = 0; i < 5; i += 1) {
        const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
        spokes += `M ${fixed(x + Math.cos(a) * 1.4)} ${fixed(1 + Math.sin(a) * 1.4)} L ${fixed(x + Math.cos(a) * 3.9)} ${fixed(1 + Math.sin(a) * 3.9)} `;
      }
      return `<circle cx="${x}" cy="1" r="7.2" fill="#24252E" stroke="#111218" stroke-width="${FINE}"/>`
        + `<circle cx="${x}" cy="1" r="7.2" fill="${grad('ball')}" fill-opacity="0.5"/>`
        + `<circle cx="${x}" cy="1" r="5.9" fill="none" stroke="#3A3C48" stroke-width="0.5"/>`
        + `<circle cx="${x}" cy="1" r="4.6" fill="#C9CFDA" stroke="#7E8698" stroke-width="0.4"/>`
        + `<circle cx="${x}" cy="1" r="4.6" fill="${grad('ball')}"/>`
        + stroke(spokes, 1, '#9AA2B4') + stroke(spokes, 0.4, '#E4E8F0')
        + `<circle cx="${x}" cy="1" r="1.3" fill="#8E96A8" stroke="#5C6478" stroke-width="0.3"/>`;
    };
    const glassRear = 'M -1.6 -24.8 L -10.6 -24.8 Q -12.8 -24.8 -14.2 -23 L -19.8 -16 L -1.6 -16 Z';
    const glassFront = 'M 1.6 -24.8 L 10.4 -24.8 Q 12.6 -24.8 14 -23 L 20.2 -16 L 1.6 -16 Z';
    return ground(38, 0, 8)
      + `<path d="M -30.6 0 A 8.6 8.6 0 0 1 -13.4 0 Z M 13.4 0 A 8.6 8.6 0 0 1 30.6 0 Z" fill="#1A1B22"/>`
      + shape(body, c) + volume(body, 'vol')
      + shade('M -38 -5 Q 0 -2.4 38.3 -5 L 38.3 -2.6 Q 38.2 0 35.8 0 L 30.6 0 A 8.6 8.6 0 0 0 13.4 0 L -13.4 0 A 8.6 8.6 0 0 0 -30.6 0 L -36.6 0 Q -38.4 -1 -38.2 -4.6 Z', 0.22)
      // Linea de luz a lo largo del costado.
      + stroke('M -36 -12.6 Q 0 -13.8 36 -12', 0.6, lighter(c, 0.45))
      + shape(glassRear, '#9FD3F2', FINE) + `<path d="${glassRear}" fill="${grad('glass')}"/>`
      + shape(glassFront, '#9FD3F2', FINE) + `<path d="${glassFront}" fill="${grad('glass')}"/>`
      + shape('M -1.6 -24.8 L 1.6 -24.8 L 1.6 -16 L -1.6 -16 Z', darker(c, 0.35), 0.3)
      // Puertas, manillas, retrovisor.
      + stroke('M 0 -15.6 L 0 -2 Q 0 -1 -1 -1 M -20.4 -15.6 Q -21.6 -9 -20 -2.6 M 21 -15.6 Q 22.6 -9 21.2 -2.6', 0.45, darker(c, 0.4))
      + shape('M -5.6 -12.2 h 3.4 v 1 h -3.4 Z M 15.2 -12.2 h 3.4 v 1 h -3.4 Z', '#D9DEE8', 0.25)
      + lit('M 19.6 -17.6 L 23.4 -18 Q 24.4 -17.4 23.6 -16.2 L 20.2 -16 Z', darker(c, 0.1), 'ball', 0.3)
      // Faros, piloto, parachoques.
      + lit('M 34.4 -12.8 Q 37.8 -12.2 37.9 -8.8 L 34.6 -9.2 Q 33.6 -11 34.4 -12.8 Z', '#FFF4C2', 'ball', 0.4)
      + lit('M -37.8 -12 L -35.2 -12.2 L -35 -8.2 L -38 -8 Z', '#E5483B', 'ball', 0.4)
      + shape('M 31.6 -3.6 L 38.4 -3.6 L 38.2 -1.4 Q 38 0 35.8 0 L 31 0 Z', '#3A3C48', 0.3)
      + shape('M -38.2 -3.6 L -31.8 -3.6 L -31.2 0 L -36.6 0 Q -38.4 -1 -38.2 -3.6 Z', '#3A3C48', 0.3)
      + shine('M -30 -13.2 L 28 -13.6 L 27 -12.6 L -30 -12.2 Z', 0.3)
      + shine('M -9 -26 L 9 -26 L 8.4 -25.4 L -8.6 -25.4 Z', 0.5)
      + wheel(-22) + wheel(22);
  },

  /** Cesta de picnic de mimbre con un mantel rosa de cuadros. */
  basket: () => {
    const wicker = '#C68A48';
    const body = 'M -20 -18.6 L 20 -18.6 L 16 0 L -16 0 Z';
    let weave = '';
    for (let row = 0; row < 4; row += 1) {
      const y0 = -18.2 + row * 4.5;
      const shift = row % 2 ? 2 : 0;
      for (let x = -19 + shift; x < 19; x += 4) weave += `M ${fixed(x * (1 - row * 0.05))} ${fixed(y0 + 0.4)} q 1 2 0 4 `;
    }
    return ground(19, 0, 0.4)
      + tubeLine('M -11.4 -20 Q 0 -33.6 11.4 -20', '#A86E36', 2.2)
      + stroke('M -9.6 -24.6 l 1.6 1 M -6 -27.6 l 1.4 1.2 M -2 -29.2 l 1 1.4 M 2.6 -29 l 0.6 1.6 M 6.6 -27 l 0.4 1.6 M 9.6 -23.8 l 0 1.6', 0.35, '#7E4E22')
      + shape(body, wicker) + volume(body, 'side')
      + stroke('M -19.4 -14.2 L 19.4 -14.2 M -18.4 -9.6 L 18.4 -9.6 M -17.4 -5 L 17.4 -5', 0.8, darker(wicker, 0.28))
      + stroke(weave, 0.45, darker(wicker, 0.3))
      + stroke('M -19.4 -14.2 L 19.4 -14.2 M -18.4 -9.6 L 18.4 -9.6 M -17.4 -5 L 17.4 -5', 0.3, lighter(wicker, 0.3))
      // Mantel de cuadros que asoma.
      + shape('M -14 -18.4 Q -9 -25 -4 -21.6 Q 0 -24.6 4 -21.4 L 6 -18.4 Z', '#FF7FAE', FINE)
      + stroke('M -11 -19 l 2 -4 M -7 -19 l 1.4 -3 M -3 -19 l 1 -2.6 M 1 -19 l 0.8 -2.2 M -12 -20.4 h 16', 0.5, '#FFFFFF')
      + shape('M -21 -22 h 42 v 4 h -42 Z', '#A86E36', FINE) + volume('M -21 -22 h 42 v 4 h -42 Z', 'top')
      + stroke('M -20 -20 q 1.4 -1 2.8 0 q 1.4 1 2.8 0 q 1.4 -1 2.8 0 q 1.4 1 2.8 0 q 1.4 -1 2.8 0 q 1.4 1 2.8 0 q 1.4 -1 2.8 0 q 1.4 1 2.8 0 q 1.4 -1 2.8 0 q 1.4 1 2.8 0 q 1.4 -1 2.8 0 q 1.4 1 2.8 0 q 1.4 -1 2.8 0 q 1.4 1 2.8 0', 0.3, '#7E4E22');
  },

  /** Vaso de leche, con el cristal y sus reflejos. */
  milk: () => ground(9, 0, 0.3)
    + shape('M -9 -22 L 9 -22 L 6.6 0 L -6.6 0 Z', '#EAF4FB', FINE)
    + shape('M -8.2 -15 L 8.2 -15 L 6.7 -1.4 L -6.7 -1.4 Z', '#FFFFFF', 0)
    + `<path d="M -8.2 -15 L 8.2 -15 L 6.7 -1.4 L -6.7 -1.4 Z" fill="${grad('side')}" fill-opacity="0.35"/>`
    + `<ellipse cx="0" cy="-15" rx="8.2" ry="1.4" fill="#FBFCFE" stroke="#C9D6E6" stroke-width="0.35"/>`
    + shape('M -6.8 -1.6 L 6.8 -1.6 L 6.6 0 L -6.6 0 Z', '#DCEBF6', 0.3)
    + `<ellipse cx="0" cy="-22" rx="9" ry="1.3" fill="none" stroke="#B9CCE0" stroke-width="0.4"/>`
    + `<path d="M -9 -22 L 9 -22 L 6.6 0 L -6.6 0 Z" fill="${grad('glass')}" fill-opacity="0.6"/>`
    + shine('M -6.8 -20.4 L -4.8 -20.4 L -5.6 -2.6 L -7 -2.6 Z', 0.85)
    + shine('M 5.6 -20 L 6.6 -20 L 5.4 -4 L 4.8 -4 Z', 0.5),

  /**
   * Bici: cubiertas, llantas, radios, cuadro del color que se pida, sillin,
   * manillar, platos y cadena. Con `rider`, alguien montado: sentado en el
   * sillin, con los pies en los pedales y las manos en el manillar.
   * @param {{ colour?: string, rider?: import('./people.js').PersonOptions }} [o]
   */
  bike: (o = {}) => {
    const c = o.colour ?? '#4A5272';
    const seated = o.rider ? rider(o.rider) : { back: '', front: '' };
    const wheel = (/** @type {number} */ x) => {
      let spokes = '';
      for (let i = 0; i < 16; i += 1) {
        const a = (i / 16) * Math.PI * 2;
        const b = a + 0.5;
        spokes += `M ${fixed(x + Math.cos(a) * 1.3)} ${fixed(-10 + Math.sin(a) * 1.3)} L ${fixed(x + Math.cos(b) * 8)} ${fixed(-10 + Math.sin(b) * 8)} `;
      }
      let tread = '';
      for (let i = 0; i < 28; i += 1) {
        const a = (i / 28) * Math.PI * 2;
        tread += `M ${fixed(x + Math.cos(a) * 8.9)} ${fixed(-10 + Math.sin(a) * 8.9)} L ${fixed(x + Math.cos(a) * 9.9)} ${fixed(-10 + Math.sin(a) * 9.9)} `;
      }
      return `<circle cx="${x}" cy="-10" r="9.4" fill="none" stroke="#25262E" stroke-width="2.2"/>`
        + stroke(tread, 0.3, '#4A4C58')
        + `<circle cx="${x}" cy="-10" r="8.2" fill="none" stroke="#B9C1CE" stroke-width="0.9"/>`
        + `<circle cx="${x}" cy="-10" r="8.2" fill="none" stroke="#FFFFFF" stroke-width="0.25" stroke-dasharray="3 9"/>`
        + stroke(spokes, 0.2, '#9AA3B4')
        + `<circle cx="${x}" cy="-10" r="1.5" fill="#C9CFDA" stroke="#6E7688" stroke-width="0.35"/>`;
    };
    return ground(26, 0, 0.4)
      + wheel(-16) + wheel(16)
      + seated.back
      // Cadena y plato.
      + `<path d="M -16 -11.4 L -4 -12.6 M -16 -8.6 L -4 -7.4" stroke="#5C6070" stroke-width="0.5" stroke-dasharray="0.5 0.35"/>`
      + `<circle cx="-4" cy="-10" r="2.8" fill="#D6DBE4" stroke="#6E7688" stroke-width="0.4"/><circle cx="-4" cy="-10" r="2.8" fill="${grad('ball')}"/>`
      // Cuadro.
      + tubeLine('M -16 -10 L -4 -10 L 4 -22.4 L 16 -10', c, 1.9)
      + tubeLine('M -16 -10 L -7.2 -22.6 L 4 -22.4', c, 1.9)
      + tubeLine('M -4 -10 L -7.6 -23.4', c, 1.9)
      + stroke('M -15 -10.6 L -4.6 -10.6 M -6.6 -21.6 L 3.4 -21.4', 0.35, lighter(c, 0.45))
      // Sillin de cuero, manillar con punos, pedal.
      + lit('M -11.8 -24.8 Q -7.4 -26.8 -3.6 -24.8 L -4.4 -23 L -10.8 -23 Z', '#3A2E2A', 'ball', FINE)
      + stroke('M 4 -22.4 L 5.6 -27 L 9.4 -27.4', 1.1, '#5C6478') + stroke('M 4 -22.4 L 5.6 -27 L 9.4 -27.4', 0.4, '#C9CFDA')
      + lit('M 8.6 -28.2 L 11.4 -28.4 L 11.4 -26.6 L 8.6 -26.4 Z', '#30324A', 'ball', 0.3)
      + stroke('M -6.4 -6.4 L -1.6 -13.6', 0.9, '#5C6478')
      + shape('M -8.2 -6.8 h 3.6 v 1.2 h -3.6 Z M -3.4 -14.2 h 3.6 v 1.2 h -3.6 Z', '#30324A', 0.25)
      + seated.front;
  },

  /** Pelota de goma de un solo color (la que se pregunta), con costuras y brillo. @param {{ colour?: string }} [o] */
  ball: (o = {}) => {
    const c = o.colour ?? '#FFC523';
    // Goma de verdad: sin contorno, la sombra propia en el lado de abajo a la
    // derecha, la luz que rebota del suelo, las costuras hundidas, el grano de
    // la goma y un brillo blando (no un punto blanco).
    const id = uid('b');
    return ground(10, 0, 0.3)
      + `<radialGradient id="${id}" cx="0.36" cy="0.3" r="0.78"><stop offset="0" stop-color="${lighter(c, 0.3)}"/><stop offset="0.45" stop-color="${c}"/><stop offset="0.85" stop-color="${darker(c, 0.32)}"/><stop offset="1" stop-color="${darker(c, 0.22)}"/></radialGradient>`
      + `<circle cx="0" cy="-11" r="11" fill="url(#${id})" stroke="${darker(c, 0.4)}" stroke-opacity="0.35" stroke-width="0.3"/>`
      + `<circle cx="0" cy="-11" r="11" fill="#1C1424" fill-opacity="0.1" filter="${fx('grain')}"/>`
      + `<path d="M -10.6 -13.6 Q 0 -6.4 10.6 -13.6 M -4.4 -21 Q 2.6 -11 -3.6 -0.6" fill="none" stroke="${darker(c, 0.45)}" stroke-opacity="0.55" stroke-width="0.8" filter="${fx('blur')}"/>`
      + stroke('M -10.6 -13.6 Q 0 -6.4 10.6 -13.6 M -4.4 -21 Q 2.6 -11 -3.6 -0.6', 0.3, darker(c, 0.4))
      + stroke('M -10.4 -13.1 Q 0 -5.9 10.4 -13.1', 0.2, lighter(c, 0.4))
      + `<path d="M -8 -3.2 Q 0 1.2 8 -3.2 Q 0 -0.8 -8 -3.2 Z" fill="${lighter(c, 0.2)}" fill-opacity="0.35" filter="${fx('blur')}"/>`
      + glowSpot(-4.2, -16.6, 3.6, 2.4, 'spec', 0.6, -35)
      + glowSpot(-4.0, -17.2, 1.2, 0.8, 'spec', 0.8, -35);
  },

  /** Valla de madera (no esta en el syllabus de Movers: solo de decorado). */
  fence: () => {
    let posts = '';
    for (const x of [-26, 0, 26]) {
      const d = `M ${x - 3} 0 L ${x - 3} -24 L ${x} -27 L ${x + 3} -24 L ${x + 3} 0 Z`;
      posts += shape(d, '#D9B07A', FINE) + volume(d, 'side') + stroke(grainV(x - 2.4, -23, x + 2.4, -1, 2, x + 40), 0.25, '#B08550')
        + `<circle cx="${x}" cy="-18" r="0.45" fill="#6E5A4A"/><circle cx="${x}" cy="-8" r="0.45" fill="#6E5A4A"/>`;
    }
    const rail = (/** @type {number} */ y) => {
      const d = `M -34 ${y} h 68 v 4 h -68 Z`;
      return shape(d, '#C79A63', FINE) + volume(d, 'top') + stroke(grain(-33, y + 0.6, 33, y + 3.4, 2, y + 50), 0.25, '#A27A48');
    };
    return ground(32, 0, 0.4) + rail(-20) + rail(-10) + posts;
  },

  /**
   * Flor del color que se pida, como una cosmos de jardin: seis petalos
   * alargados con su punta dentada, mas claros en la punta, con nervios; el
   * centro con sus estambres; tallo y dos hojas con nervio.
   * @param {{ colour?: string }} [o]
   */
  flower: (o = {}) => {
    const c = o.colour ?? '#FF6EA6';
    const cx = 0;
    const cy = -21;
    let petals = '';
    let veins = '';
    for (let i = 0; i < 6; i += 1) {
      const a = (i / 6) * Math.PI * 2 - Math.PI / 2 + 0.2;
      const u = [Math.cos(a), Math.sin(a)];
      const p = [-u[1], u[0]];
      const at = (/** @type {number} */ r, /** @type {number} */ w) => `${fixed(cx + u[0] * r + p[0] * w)} ${fixed(cy + u[1] * r + p[1] * w)}`;
      const d = `M ${at(1.2, -0.7)} Q ${at(4.2, -3.1)} ${at(8.2, -2.0)} L ${at(8.9, -1.0)} L ${at(8.3, 0)} L ${at(8.9, 1.0)} L ${at(8.2, 2.0)} Q ${at(4.2, 3.1)} ${at(1.2, 0.7)} Z`;
      petals += `<path d="${d}" fill="${c}" stroke="${darker(c, 0.3)}" stroke-opacity="0.4" stroke-width="0.25"/>`
        + `<path d="M ${at(1.2, -0.7)} Q ${at(4.2, -3.1)} ${at(8.2, -2.0)} L ${at(8.9, 1.0)} L ${at(8.2, 2.0)} Q ${at(4.2, 3.1)} ${at(1.2, 0.7)} Z" fill="${lighter(c, 0.35)}" fill-opacity="0.35"/>`
        + `<path d="M ${at(1.2, -0.6)} L ${at(3.4, -1.3)} L ${at(3.4, 1.3)} L ${at(1.2, 0.6)} Z" fill="${darker(c, 0.25)}" fill-opacity="0.45" filter="${fx('blur')}"/>`;
      veins += `M ${at(1.6, 0)} L ${at(7.8, 0)} M ${at(2.2, -0.3)} Q ${at(5, -1.2)} ${at(7.6, -1.5)} M ${at(2.2, 0.3)} Q ${at(5, 1.2)} ${at(7.6, 1.5)} `;
    }
    const leaf = (/** @type {number} */ side, /** @type {number} */ y) => {
      const d = `M 0.2 ${y} Q ${side * 3.4} ${y - 3.6} ${side * 8.4} ${y - 2.4} Q ${side * 4.4} ${y + 0.4} 0.2 ${y} Z`;
      return `<path d="${d}" fill="#4E9A48" stroke="#2F6A30" stroke-opacity="0.45" stroke-width="0.25"/>` + `<path d="${d}" fill="${grad('vol')}"/>`
        + stroke(`M 0.4 ${y - 0.2} Q ${side * 4} ${y - 2} ${side * 7.8} ${y - 2.3}`, 0.22, '#2F6A30');
    };
    let stamens = '';
    const rnd = seeded(3);
    for (let i = 0; i < 16; i += 1) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 1.9;
      stamens += `<circle cx="${fixed(cx + Math.cos(a) * r)}" cy="${fixed(cy + Math.sin(a) * r)}" r="${fixed(0.22 + rnd() * 0.18)}" fill="${rnd() < 0.5 ? '#F2B21C' : '#C77A10'}"/>`;
    }
    return ground(6, 0, 0.3)
      + `<path d="M 0 0 Q 1.1 -8 0 -15.6" fill="none" stroke="#3B7A3A" stroke-width="1.1" stroke-linecap="round"/>`
      + `<path d="M -0.2 0 Q 0.9 -8 -0.2 -15.6" fill="none" stroke="#7DBB68" stroke-width="0.3" stroke-linecap="round" stroke-opacity="0.7"/>`
      + leaf(-1, -5.6) + leaf(1, -9.8)
      + petals
      + stroke(veins, 0.16, darker(c, 0.25))
      + `<circle cx="${cx}" cy="${cy}" r="2.4" fill="#B8781A"/>` + `<circle cx="${cx}" cy="${cy}" r="2.4" fill="${grad('ball')}"/>`
      + stamens
      + `<ellipse cx="${cx - 0.6}" cy="${cy - 0.7}" rx="1" ry="0.6" fill="${grad('spec')}" fill-opacity="0.5"/>`;
  },

  /**
   * Montana de roca con dos picos: la cresta quebrada, la cara al sol y la cara
   * en sombra de cada pico, la textura de la roca, la nieve de las cumbres que
   * baja por las canales (azulada en la sombra) y la bruma al pie.
   */
  mountain: () => {
    const body = 'M -46 0 L -40 -8 L -35 -12 L -31 -19 L -27 -24 L -24 -31 L -20 -38 L -17.4 -45 L -15 -50 L -12.6 -46 L -9.6 -41.6 '
      + 'L -6.4 -38.6 L -3 -33 L 0 -30.4 L 3 -27 L 6 -30 L 9.6 -33.6 L 13 -38.4 L 16.6 -41 L 20 -44 L 23 -39.6 L 26.4 -34.6 L 29.4 -27.4 '
      + 'L 33.6 -21 L 37.4 -14 L 41.6 -7.6 L 46 0 Z';
    const shadowA = 'M -15 -50 L -12.6 -46 L -9.6 -41.6 L -6.4 -38.6 L -3 -33 L 0 -30.4 L 3 -27 L 5 -14 L 7 0 L -6 0 L -8 -14 L -10.6 -28 L -13 -40 Z';
    const shadowB = 'M 20 -44 L 23 -39.6 L 26.4 -34.6 L 29.4 -27.4 L 33.6 -21 L 37.4 -14 L 41.6 -7.6 L 46 0 L 28 0 L 25.6 -14 L 23.4 -28 L 21.4 -38 Z';
    const snowA = 'M -15 -50 L -17.4 -45 L -20 -38 L -21.6 -34.6 L -19.4 -35.6 L -18.4 -32 L -16.2 -35.4 L -14.4 -30.6 L -12.4 -35 L -10 -32.4 L -9.2 -36 L -6.4 -38.6 L -9.6 -41.6 L -12.6 -46 Z';
    const snowB = 'M 20 -44 L 16.6 -41 L 13 -38.4 L 12 -36.6 L 14.4 -36.8 L 15.6 -33.6 L 17.8 -36.4 L 19.6 -32.4 L 21.6 -35.8 L 23.8 -33.4 L 24.4 -36.6 L 26.4 -34.6 L 23 -39.6 Z';
    const id = uid('m');
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8E98AC"/><stop offset="0.7" stop-color="#A3ADBE"/><stop offset="1" stop-color="#C2CAD6"/></linearGradient></defs>`
      + `<path d="${body}" fill="url(#${id})" stroke="#6A7488" stroke-opacity="0.35" stroke-width="0.35" stroke-linejoin="round"/>`
      + `<path d="${body}" fill="#3A4256" fill-opacity="0.35" filter="${fx('grain')}"/>`
      + `<path d="${body}" fill="#FFFFFF" fill-opacity="0.2" filter="${fx('grain2')}"/>`
      + `<path d="${shadowA}" fill="#2E3548" fill-opacity="0.3" filter="${fx('blur')}"/>`
      + `<path d="${shadowB}" fill="#2E3548" fill-opacity="0.34" filter="${fx('blur')}"/>`
      + `<path d="M -30 -16 L -24 -22 L -20 -18 M -22 -8 L -16 -14 L -13 -10 M 10 -16 L 14 -22 L 18 -18 M 30 -10 L 34 -14 M -38 -4 L -34 -8" fill="none" stroke="#5A6378" stroke-opacity="0.5" stroke-width="0.4" stroke-linejoin="round"/>`
      + `<path d="M -29.6 -16.6 L -24 -21.4 M -21.6 -7.6 L -16 -13.4 M 10.4 -15.6 L 14 -21.4" fill="none" stroke="#E6EBF2" stroke-opacity="0.45" stroke-width="0.3"/>`
      + `<path d="${snowA}" fill="#FFFFFF"/><path d="${snowB}" fill="#FFFFFF"/>`
      + `<path d="M -15 -50 L -12.6 -46 L -9.6 -41.6 L -6.4 -38.6 L -9.2 -36 L -10 -32.4 L -12.4 -35 L -13.6 -42 Z" fill="#B9C8DE" fill-opacity="0.8"/>`
      + `<path d="M 20 -44 L 23 -39.6 L 26.4 -34.6 L 24.4 -36.6 L 23.8 -33.4 L 21.6 -35.8 L 21 -40 Z" fill="#B9C8DE" fill-opacity="0.8"/>`
      + `<path d="M -40 -2 L 40 -2 L 46 0 L -46 0 Z" fill="#EEF4FA" fill-opacity="0.8" filter="${fx('blur2')}"/>`
      + `<rect x="-46" y="-12" width="92" height="12" fill="#EEF4FA" fill-opacity="0.35" filter="${fx('haze')}"/>`;
  },

  /**
   * Rio: una franja de agua con sus orillas, de puntas redondeadas: el cielo
   * reflejado, ondas finas, destellos y la orilla de hierba humeda. `width` es
   * la mitad del largo (52 si no se dice): para que cruce todo el dibujo, que
   * se salga por los lados.
   * @param {{ width?: number }} [o]
   */
  river: (o = {}) => {
    const w = o.width ?? 52;
    const h = fixed(w / 2);
    const water = riverWater(o);
    const id = uid('r');
    const rnd = seeded(31);
    let ripples = '';
    for (let i = 0; i < 26; i += 1) {
      const x = -w + 4 + rnd() * (2 * w - 12);
      const y = -3 + rnd() * 13 + (x / w) * 2;
      const l = 2 + rnd() * 6;
      ripples += `M ${fixed(x)} ${fixed(y)} q ${fixed(l / 2)} -0.5 ${fixed(l)} 0 `;
    }
    return `<defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9AD6F2"/><stop offset="0.5" stop-color="#4FA6DA"/><stop offset="1" stop-color="#2C7DB6"/></linearGradient></defs>`
      + `<path d="${water}" fill="url(#${id})" stroke="#2C6F9E" stroke-opacity="0.3" stroke-width="0.4"/>`
      + `<path d="M ${-w} 1 Q ${-h} -5 0 1 Q ${h} 7 ${w} 0 L ${w} 4 Q ${h} 11 0 5 Q ${-h} -1 ${-w} 5 Z" fill="#FFFFFF" fill-opacity="0.22" filter="${fx('blur2')}"/>`
      + `<path d="${ripples}" fill="none" stroke="#F2FAFF" stroke-opacity="0.6" stroke-width="0.32" stroke-linecap="round"/>`
      + `<path d="M ${-w} -2.4 Q ${-h} -9.4 0 -3.4 Q ${h} 2.6 ${w} -3.4" fill="none" stroke="#5E8F44" stroke-opacity="0.7" stroke-width="1.6" filter="${fx('blur')}"/>`
      + `<path d="M ${-w} 11.4 Q ${-h} 5.4 0 11.4 Q ${h} 17.4 ${w} 11.4" fill="none" stroke="#3E6E2E" stroke-opacity="0.4" stroke-width="1.2" filter="${fx('blur')}"/>`
      + shine(`M ${fixed(-w * 0.4)} 0.6 q 6 -2 12 0 q -6 0.8 -12 0 Z M ${fixed(w * 0.4)} 3.6 q 5 -1.6 10 0 q -5 0.8 -10 0 Z`, 0.6);
  },

  /** Caja: de carton con cinta, o de regalo si tiene color (con lazo). @param {{ colour?: string }} [o] */
  box: (o = {}) => {
    const present = Boolean(o.colour);
    const c = o.colour ?? '#C68A48';
    const front = 'M -16 -18 L 16 -18 L 16 -1.2 Q 16 0 14.8 0 L -14.8 0 Q -16 0 -16 -1.2 Z';
    const lid = 'M -18 -22.6 Q -18 -24 -16.6 -24 L 16.6 -24 Q 18 -24 18 -22.6 L 18 -18.4 Q 18 -17 16.6 -17 L -16.6 -17 Q -18 -17 -18 -18.4 Z';
    let out = ground(18, 0, 0.4)
      + shape(front, c) + volume(front, 'side')
      + shape(lid, lighter(c, 0.12)) + volume(lid, 'top')
      + shade('M -18 -17.4 L 18 -17.4 L 16 -15.6 L -16 -15.6 Z', 0.2);
    if (present) {
      out += lit('M -2.6 -17 h 5.2 v 17 h -5.2 Z', '#FFC93C', 'side', FINE)
        + lit('M -2.6 -24 h 5.2 v 7 h -5.2 Z', '#FFC93C', 'side', FINE)
        + lit('M 0 -24 Q -8.6 -31 -9 -25.6 Q -7.4 -22.8 0 -24 Z', '#FFC93C', 'ball', FINE)
        + lit('M 0 -24 Q 8.6 -31 9 -25.6 Q 7.4 -22.8 0 -24 Z', '#FFC93C', 'ball', FINE)
        + stroke('M -1.6 -24.6 Q -5 -27.6 -7.4 -26 M 1.6 -24.6 Q 5 -27.6 7.4 -26', 0.3, '#D99A1E')
        + `<circle cx="0" cy="-24.4" r="1.9" fill="#F2AE1E" stroke="${edge('#F2AE1E')}" stroke-width="${FINE}"/>`
        + stroke('M -12 -12 l 1.6 1.6 M 8 -6 l 1.6 1.6 M -9 -4 l 1.6 1.6 M 11 -13 l 1.6 1.6', 0.5, lighter(c, 0.35));
    } else {
      out += lit('M -3.4 -24 h 6.8 v 7 h -6.8 Z', '#E8C48E', 'side', 0.3)
        + lit('M -3.4 -17 h 6.8 v 5 h -6.8 Z', '#E8C48E', 'side', 0.3)
        + stroke('M -16 -9 L -11 -9 M 11 -9 L 16 -9', FINE, darker(c, 0.3))
        + stroke('M -14 -14 l 2 0 M -14 -12.6 l 3 0 M 10 -4 l 3 0', 0.3, darker(c, 0.25))
        + `<path d="M 6 -6 l 4 0 l -2 -2.6 Z" fill="none" stroke="${darker(c, 0.35)}" stroke-width="0.35"/>`;
    }
    return out;
  },

  /** Camara de fotos con su objetivo de cristal. */
  camera: () => {
    const body = 'M -14 -16 Q -14 -18 -12 -18 L -6.4 -18 L -4.4 -21.4 L 4.4 -21.4 L 6.4 -18 L 12 -18 Q 14 -18 14 -16 L 14 -2 Q 14 0 12 0 L -12 0 Q -14 0 -14 -2 Z';
    let texture = '';
    for (let y = -12; y < -1; y += 1.2) texture += `M -13.4 ${fixed(y)} h 26.8 `;
    return ground(14, 0, 0.3)
      + shape(body, '#3E4258') + volume(body)
      + stroke(texture, 0.2, '#2E3144')
      + shape('M -14 -13 h 28 v 1.4 h -28 Z', '#5C6178', 0)
      + `<circle cx="0" cy="-9" r="7.2" fill="#B9C0CE" stroke="#30324A" stroke-width="${FINE}"/>`
      + `<circle cx="0" cy="-9" r="6" fill="#2A2D3E"/>`
      + `<circle cx="0" cy="-9" r="4.4" fill="#3F78B8"/><circle cx="0" cy="-9" r="4.4" fill="${grad('ball')}"/>`
      + `<circle cx="0" cy="-9" r="2.2" fill="#14162A"/>`
      + `<circle cx="0" cy="-9" r="5.2" fill="none" stroke="#4A4E66" stroke-width="0.3"/>`
      + shine('M -2.8 -11.8 Q -1 -13.2 1.2 -12.6 Q -0.6 -11.6 -1.6 -9.8 Z', 0.8)
      + '<circle cx="2.2" cy="-7" r="0.6" fill="#FFFFFF" fill-opacity="0.6"/>'
      + lit('M 7.4 -16.4 h 4.6 v 3 h -4.6 Z', '#E9EDF5', 'glass', FINE)
      + lit('M -11.6 -20.2 h 3.8 v 2.2 h -3.8 Z', '#9AA2B4', 'top', FINE)
      + shine('M -12.6 -17 L 6 -17 L 5.4 -16.2 L -12.4 -16.2 Z', 0.25);
  },

  /** Cometa de tela con sus varillas y una cola de lazos. @param {{ colour?: string }} [o] */
  kite: (o = {}) => {
    const c = o.colour ?? '#E33B2E';
    const bow = (/** @type {number} */ x, /** @type {number} */ y) => {
      const d = `M ${x} ${y} Q ${fixed(x - 2)} ${fixed(y - 2.6)} ${fixed(x - 3.6)} ${fixed(y - 1.8)} Q ${fixed(x - 3.8)} ${y} ${fixed(x - 3.6)} ${fixed(y + 1.8)} Q ${fixed(x - 2)} ${fixed(y + 2.6)} ${x} ${y} Q ${fixed(x + 2)} ${fixed(y - 2.6)} ${fixed(x + 3.6)} ${fixed(y - 1.8)} Q ${fixed(x + 3.8)} ${y} ${fixed(x + 3.6)} ${fixed(y + 1.8)} Q ${fixed(x + 2)} ${fixed(y + 2.6)} ${x} ${y} Z`;
      return lit(d, lighter(c, 0.25), 'ball', FINE) + `<circle cx="${x}" cy="${y}" r="0.7" fill="${darker(c, 0.1)}"/>`;
    };
    const sail = 'M 0 -40 L 14 -22 L 0 -2 L -14 -22 Z';
    // Tela tensa sobre las varillas: cada pano con su luz (la cometa esta un
    // poco combada), el tejido, el dobladillo cosido y el sol que la atraviesa.
    const panels = [['M 0 -40 L -14 -22 L 0 -22 Z', lighter(c, 0.1)], ['M 0 -40 L 14 -22 L 0 -22 Z', darker(c, 0.08)],
      ['M -14 -22 L 0 -2 L 0 -22 Z', c], ['M 14 -22 L 0 -2 L 0 -22 Z', darker(c, 0.16)]];
    return stroke('M 0 -2 Q -6 4 0 9 Q 6 14 0 20 Q -4 24 0 26', 0.45, '#4A4E66')
      + bow(-2.6, 5) + bow(2.4, 13.4) + bow(-1.4, 21.6)
      + shape(sail, c)
      + panels.map(([d, tone]) => `<path d="${d}" fill="${tone}"/>`).join('')
      + volume(sail, 'vol')
      + `<path d="${sail}" fill="#1C1424" fill-opacity="0.14" filter="${fx('fabric')}"/>`
      + `<path d="${sail}" fill="#FFFFFF" fill-opacity="0.14" filter="${fx('fabric2')}"/>`
      + `<path d="M -4 -33 Q -8 -27 -10 -23 L -4 -23 Z" fill="#FFFFFF" fill-opacity="0.3" filter="${fx('blur2')}"/>`
      + `<path d="M 0 -38.6 L 12.9 -22 L 0 -3.4 L -12.9 -22 Z" fill="none" stroke="${darker(c, 0.25)}" stroke-opacity="0.5" stroke-width="0.9"/>`
      + `<path d="M 0 -38.6 L 12.9 -22 L 0 -3.4 L -12.9 -22 Z" fill="none" stroke="${lighter(c, 0.3)}" stroke-opacity="0.55" stroke-width="0.18" stroke-dasharray="0.6 0.5"/>`
      + stroke('M 0 -40 L 0 -2 M -14 -22 L 14 -22', 0.8, '#7D5A38') + stroke('M -0.2 -40 L -0.2 -2 M -14 -22.2 L 14 -22.2', 0.25, '#E2C495');
  },

  /** Cuerda de la cometa: de (0, 0) a (dx, dy). @param {{ dx?: number, dy?: number }} [o] */
  string: (o = {}) => `<path d="M 0 0 Q ${fixed((o.dx ?? 20) * 0.55)} ${fixed((o.dy ?? 20) * 0.38)} ${o.dx ?? 20} ${o.dy ?? 20}" fill="none" stroke="#5B5F78" stroke-width="0.7" stroke-linecap="round"/>`,

  /** Libro cerrado, tumbado: tapa, lomo con nervios y el canto de las hojas. @param {{ colour?: string }} [o] */
  book: (o = {}) => {
    const c = o.colour ?? '#1F7BE0';
    const cover = 'M -14 -9 Q -14 -10.4 -12.6 -10.4 L 13 -10.4 Q 14.4 -10.4 14.4 -9 L 14.4 -1.4 Q 14.4 0 13 0 L -12.6 0 Q -14 0 -14 -1.4 Z';
    return ground(14, 0, 0.4)
      + shape(cover, c) + volume(cover, 'top')
      + shape('M -11.4 -3.8 L 14 -3.8 L 14 -0.9 L -11.4 -0.9 Z', '#FFF8E6', 0.3)
      + stroke('M -11 -3.2 L 13.8 -3.2 M -11 -2.4 L 13.8 -2.4 M -11 -1.6 L 13.8 -1.6', 0.15, '#D9CDB0')
      + shape('M -14 -10.4 L -10.6 -10.4 L -10.6 0 L -14 0 Z', darker(c, 0.22), FINE)
      + stroke('M -14 -7.6 L -10.6 -7.6 M -14 -2.8 L -10.6 -2.8', 0.4, lighter(c, 0.35))
      + lit('M -5 -8.6 L 10 -8.6 L 10 -5.4 L -5 -5.4 Z', lighter(c, 0.75), 'top', 0.25)
      + stroke('M -3.4 -7.4 L 8 -7.4 M -3.4 -6.4 L 5 -6.4', 0.3, darker(c, 0.2))
      + shine('M -9.6 -9.8 L 12 -9.8 L 11.6 -9.2 L -9.6 -9.2 Z', 0.3);
  },

  /** Barco de vela: casco de tablas, mastil de madera, vela con costuras y banderin. @param {{ colour?: string }} [o] */
  boat: (o = {}) => {
    const c = o.colour ?? '#E33B2E';
    const hull = 'M -26 -10.6 L 26 -10.6 Q 23 -2 15 0 L -15 0 Q -23 -2 -26 -10.6 Z';
    const sail = 'M 2.4 -38.4 Q 14.6 -27 22.2 -13.6 L 2.4 -13.6 Z';
    // Vela de lona con sus costuras, la luz que la atraviesa junto a la
    // baluma, los pliegues que salen del puno y la sombra del mastil.
    return tubeLine('M 0 -10.6 L 0 -40', '#8D5B33', 1.3)
      + shape(sail, '#F7F5EE') + volume(sail, 'vol')
      + `<path d="${sail}" fill="#1C1424" fill-opacity="0.12" filter="${fx('fabric')}"/>`
      + `<path d="M 12 -27 Q 18 -20 21 -14.6 L 15 -14.6 Q 13 -21 12 -27 Z" fill="#FFFFFF" fill-opacity="0.5" filter="${fx('blur2')}"/>`
      + `<path d="M 2.4 -38 L 5.6 -36 L 5.6 -14 L 2.4 -14 Z" fill="#1C1424" fill-opacity="0.16" filter="${fx('blur')}"/>`
      + `<path d="M 21 -14.2 Q 12 -22 4 -30 M 21 -14.2 Q 12 -18 4 -21" fill="none" stroke="#1C1424" stroke-opacity="0.12" stroke-width="0.8" filter="${fx('blur')}"/>`
      + stroke('M 2.4 -30 Q 9 -28.6 12.8 -27.6 M 2.4 -21.6 Q 10 -21 17.8 -20.4 M 2.4 -34.4 Q 6 -33.4 8.6 -32.6', 0.2, '#B9C0CC')
      + lit('M -0.4 -40.4 L 6.6 -38.2 L -0.4 -36 Z', c, 'vol', FINE)
      // Casco pintado sobre tablas: luz arriba, la linea de flotacion en sombra.
      + shape(hull, c) + volume(hull, 'vol')
      + stroke('M -25.6 -9.2 Q 0 -8.6 25.6 -9.2 M -22.6 -4.4 Q 0 -3.6 22.6 -4.4 M -19 -1.6 Q 0 -1 19 -1.6', 0.22, darker(c, 0.32))
      + stroke('M -24.6 -7.6 L 24.6 -7.6', 1.4, '#FFFFFF') + stroke('M -24.6 -7.0 L 24.6 -7.0', 0.25, '#1C1424')
      + `<path d="${hull}" fill="#1C1424" fill-opacity="0.12" filter="${fx('grain')}"/>`
      + shade('M -23.4 -4 L 23.4 -4 Q 21 -1 15 0 L -15 0 Q -21 -1 -23.4 -4 Z', 0.24)
      + glowSpot(-8, -9.2, 14, 0.9, 'spec', 0.45)
      + shape('M -26.6 -11.6 L 26.6 -11.6 L 26 -10.2 L -26 -10.2 Z', '#8D5B33', 0.3)
      + stroke('M -26 -11 L 26 -11', 0.18, '#C9935A')
      + shine('M -22 -10 L 20 -10 L 19.4 -9 L -21.4 -9 Z', 0.3);
  },

  /** Huevo, con su brillo y alguna mota. */
  egg: () => ground(5.4, 0, 0.3)
    + lit('M 0 -14 Q 5.6 -14 5.6 -5.6 Q 5.6 0 0 0 Q -5.6 0 -5.6 -5.6 Q -5.6 -14 0 -14 Z', '#FFF2DE', 'ball', FINE)
    + '<g fill="#D9B98C" fill-opacity="0.6"><circle cx="1.6" cy="-9" r="0.3"/><circle cx="3.2" cy="-5" r="0.25"/><circle cx="-1.4" cy="-3.4" r="0.25"/><circle cx="2.4" cy="-2.4" r="0.3"/></g>'
    + shine('M -3.4 -9.6 Q -2.6 -12.4 -0.6 -12.6 Q -2 -10.6 -2.2 -8.6 Z', 0.8),

  /** Bolsa de la compra de tela, con asas y pliegues. @param {{ colour?: string }} [o] */
  bag: (o = {}) => {
    const c = o.colour ?? '#4FA3E0';
    const body = 'M -8 -14.4 L 8 -14.4 L 9 0 L -9 0 Z';
    return ground(9, 0, 0.3)
      + tubeLine('M -4.4 -13.6 Q -4.6 -21 0 -21 Q 4.6 -21 4.4 -13.6', '#30324A', 0.8)
      + shape(body, c) + volume(body, 'side')
      + shape('M -8 -14.4 L 8 -14.4 L 8.12 -12.4 L -8.12 -12.4 Z', lighter(c, 0.25), FINE)
      + stroke('M -5 -11 q -0.6 4 0.4 9 M 5.4 -11 q 0.8 4 -0.2 9', 0.3, darker(c, 0.25))
      + `<circle cx="-0.4" cy="-6.6" r="2.6" fill="#FFFFFF" fill-opacity="0.8"/>`
      + stroke('M -1.6 -6.6 l 1 1 l 1.8 -2', 0.5, c);
  },

  /** Barra de pan con sus cortes y la corteza tostada. */
  bread: () => {
    const crust = 'M -10 0 Q -11.4 -8.4 -4.6 -9.4 Q 0 -10 4.6 -9.4 Q 11.4 -8.4 10 0 Z';
    return ground(10, 0, 0.3)
      + shape(crust, '#C8843E') + volume(crust, 'ball')
      + lit('M -6.6 -7.8 q 2.2 1.4 1.4 4.4 q -1.6 -1.2 -1.4 -4.4 Z M -1.4 -8.6 q 2.2 1.4 1.4 4.6 q -1.6 -1.2 -1.4 -4.6 Z M 3.8 -8 q 2.2 1.4 1.4 4.4 q -1.6 -1.2 -1.4 -4.4 Z', '#F2C988', 'vol', 0.3)
      + '<g fill="#FFFFFF" fill-opacity="0.55"><circle cx="-7" cy="-6.4" r="0.3"/><circle cx="-3" cy="-8.4" r="0.25"/><circle cx="2" cy="-8.8" r="0.3"/><circle cx="7" cy="-6.8" r="0.25"/></g>'
      + shine('M -8 -6 Q -6 -8.6 -2 -9 Q -5.4 -7.4 -6.6 -5 Z', 0.35);
  },

  /** Fruta: una manzana, una naranja y un platano. */
  fruit: () => {
    let pores = '';
    const rnd = seeded(13);
    for (let i = 0; i < 12; i += 1) {
      const a = rnd() * Math.PI * 2;
      const r = Math.sqrt(rnd()) * 4;
      pores += `<circle cx="${fixed(5 + Math.cos(a) * r)}" cy="${fixed(-5.2 + Math.sin(a) * r)}" r="0.22" fill="#C9661A" fill-opacity="0.7"/>`;
    }
    return ground(11, 0, 0.3)
      + lit('M -4.6 -10.2 Q -1 -11.4 0 -7.6 Q 0.8 -2.4 -2.4 -0.6 Q -4.6 0.4 -6.8 -0.6 Q -10 -2.4 -9.4 -7.6 Q -8.4 -11.4 -4.6 -10.2 Z', '#D9362C', 'ball', LINE)
      + stroke('M -4.6 -10 q 0.4 -1.8 1.2 -2.6', 0.6, '#6A4122')
      + lit('M -3.6 -11.4 q 2.6 -1.6 3.8 0.2 q -2.2 1.2 -3.8 -0.2 Z', '#4FA65A', 'vol', FINE) + stroke('M -3.4 -11.4 l 3.4 0.1', 0.2, '#2F7A3A')
      + stroke('M -8 -6 q 0.6 2.6 2.4 3.6', 0.3, '#F0A08A')
      + `<circle cx="5" cy="-5.2" r="4.8" fill="#F5922B" stroke="${edge('#F5922B')}" stroke-width="${LINE}"/><circle cx="5" cy="-5.2" r="4.8" fill="${grad('ball')}"/>`
      + pores + '<circle cx="5.4" cy="-9.4" r="0.5" fill="#6E8A2A"/>'
      + lit('M -9.4 -1.6 Q 0 3.2 9.4 -2.8 Q 8.6 0.6 0 1.6 Q -8 1.4 -9.4 -1.6 Z', '#FFD84A', 'vol', FINE)
      + stroke('M -8.4 -0.8 Q 0 2.6 8.6 -2', 0.3, '#D9A92A')
      + stroke('M -9.4 -1.6 l -1 -0.8 M 9.4 -2.8 l 0.8 -0.9', 0.8, '#5A3A1E')
      + shine('M -7.6 -7 Q -6.8 -9 -5 -9.4 Q -6.4 -8 -6.6 -6.4 Z', 0.55);
  },

  /** Hombre de nieve (o lo que queda cuando sale el sol). @param {{ melted?: boolean }} [o] */
  snowman: (o = {}) => {
    const coal = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ r) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#2E3047"/><circle cx="${fixed(x - r * 0.3)}" cy="${fixed(y - r * 0.3)}" r="${fixed(r * 0.3)}" fill="#FFFFFF" fill-opacity="0.5"/>`;
    // Bolas de nieve de verdad: grumosas, con la sombra azul del cielo en el
    // lado de la sombra, el grano de la nieve y su brillo, sin contorno.
    const snow = (/** @type {number} */ cy, /** @type {number} */ r) => {
      const rnd = seeded(Math.round(r * 13));
      /** @type {[number, number][]} */
      const pts = [];
      for (let i = 0; i < 14; i += 1) {
        const a = (i / 14) * Math.PI * 2;
        const k = 1 + (rnd() - 0.5) * 0.06;
        pts.push([fixed(Math.cos(a) * r * k), fixed(cy + Math.sin(a) * r * k)]);
      }
      const d = smooth(pts);
      return `<path d="${d}" fill="#FBFCFF" stroke="#AFC2DA" stroke-opacity="0.55" stroke-width="0.35"/>`
        + `<path d="${d}" fill="${grad('ball')}" fill-opacity="0.7"/>`
        + `<path d="M ${fixed(r * 0.1)} ${fixed(cy - r * 0.95)} A ${r} ${r} 0 0 1 ${fixed(r * 0.1)} ${fixed(cy + r * 0.95)} Q ${fixed(r * 0.95)} ${cy} ${fixed(r * 0.1)} ${fixed(cy - r * 0.95)} Z" fill="#9FB8DA" fill-opacity="0.4" filter="${fx('blur')}"/>`
        + `<path d="${d}" fill="#7F96B8" fill-opacity="0.22" filter="${fx('grain')}"/>`
        + `<path d="${d}" fill="#FFFFFF" fill-opacity="0.5" filter="${fx('grain2')}"/>`
        + `<ellipse cx="0" cy="${fixed(cy + r * 0.92)}" rx="${fixed(r * 0.7)}" ry="${fixed(r * 0.14)}" fill="#6F86A8" fill-opacity="0.25" filter="${fx('blur')}"/>`;
    };
    const carrot = 'M 0 -43 L 6.8 -41.8 L 0 -40.6 Z';
    if (o.melted) {
      return `<ellipse cx="0" cy="-0.6" rx="19" ry="3.8" fill="#CFE6F7" stroke="${edge('#CFE6F7')}" stroke-width="${FINE}"/>`
        + `<ellipse cx="0" cy="-0.6" rx="19" ry="3.8" fill="${grad('glass')}"/>`
        + lit('M -12 -1 Q -13.4 -8.6 -6.4 -9.8 Q -2.4 -14 3 -11.2 Q 11.4 -11.2 12.2 -1 Z', '#FFFFFF', 'ball', LINE)
        + shade('M 3 -11.2 Q 11.4 -11.2 12.2 -1 L 4 -1 Q 6.6 -6 3 -11.2 Z', 0.1)
        + lit('M -3 -6.4 L 5 -5.2 L -3 -4 Z', '#F28C28', 'side', FINE)
        + coal(-7, -4, 1) + coal(8.4, -3.6, 1)
        + stroke('M 12 -2.4 L 19 -6 M 16.6 -4.8 L 18 -8', 1.1, '#7A4E2A');
    }
    return ground(13, 0, 0.4)
      + stroke('M -7.6 -28 L -18.4 -34 M -15 -32.2 L -17.4 -36.4 M -12 -30.6 L -13 -33.4 M 7.6 -28 L 18.4 -34 M 15 -32.2 L 17 -36.6 M 12 -30.6 L 13.4 -33.2', 1.2, '#6E4424')
      + snow(-12.2, 12.2) + snow(-29.6, 8.8) + snow(-43.2, 6.8)
      + coal(-2.3, -44.6, 0.95) + coal(2.3, -44.6, 0.95)
      + lit(carrot, '#F28C28', 'side', FINE) + stroke('M 2 -42.4 l 0 1 M 4 -42 l 0 0.8', 0.25, '#C2611A')
      + coal(-2.6, -39.6, 0.5) + coal(-0.9, -38.8, 0.5) + coal(0.9, -38.8, 0.5) + coal(2.6, -39.6, 0.5)
      + coal(0, -32.4, 1) + coal(0, -27.4, 1) + coal(0, -15, 1) + coal(0, -9.4, 1)
      + '<g fill="#FFFFFF"><circle cx="-6" cy="-18" r="0.4"/><circle cx="-4" cy="-33" r="0.35"/><circle cx="5" cy="-6" r="0.35"/></g>';
  },

  /**
   * Sol (colocado por su centro): un disco que deslumbra, blanco en el centro y
   * amarillo en el borde, con un halo grande y rayos de luz blandos.
   */
  sun: () => {
    let rays = '';
    for (let i = 0; i < 12; i += 1) {
      const a = (i / 12) * Math.PI * 2 + 0.13;
      const b = 0.07;
      const r1 = i % 2 ? 20.4 : 23.6;
      rays += `M ${fixed(Math.cos(a - b) * 11.6)} ${fixed(Math.sin(a - b) * 11.6)} L ${fixed(Math.cos(a) * r1)} ${fixed(Math.sin(a) * r1)} L ${fixed(Math.cos(a + b) * 11.6)} ${fixed(Math.sin(a + b) * 11.6)} Z `;
    }
    return `<circle cx="0" cy="0" r="22" fill="${grad('glow')}"/>`
      + `<path d="${rays}" fill="#FFD95A" fill-opacity="0.75" filter="${fx('blur')}"/>`
      + `<circle cx="0" cy="0" r="12.6" fill="#FFE47A" fill-opacity="0.6" filter="${fx('blur2')}"/>`
      + `<circle cx="0" cy="0" r="10.8" fill="#FFD23F"/>`
      + `<circle cx="0" cy="0" r="9.4" fill="#FFF0A6" filter="${fx('blur')}"/>`
      + `<circle cx="-1" cy="-1" r="6" fill="#FFFBE6" fill-opacity="0.85" filter="${fx('blur2')}"/>`;
  },

  /** Nube blanca (cielo nublado, sin lluvia). */
  cloud: () => puffy('#FFFFFF', '#D6DFEC'),

  /** Nube de nieve: como la de lluvia, pero caen copos blandos. */
  snowcloud: () => snowfall(29) + puffy('#D2DAE6', '#A3AFC4'),

  /** Plato de loza, con el ala y el fondo. */
  plate: () => ground(19, 0, 1.6)
    + `<ellipse cx="0" cy="0" rx="20" ry="6.6" fill="#FFFFFF" stroke="${edge('#DCE3EE')}" stroke-width="${LINE}"/>`
    + `<ellipse cx="0" cy="0" rx="20" ry="6.6" fill="${grad('vol')}" fill-opacity="0.6"/>`
    + `<ellipse cx="0" cy="-0.6" rx="12.6" ry="3.8" fill="#F1F5FA" stroke="#C3CEDE" stroke-width="${FINE}"/>`
    + `<ellipse cx="0" cy="-0.6" rx="12.6" ry="3.8" fill="${grad('deep')}"/>`
    + `<ellipse cx="0" cy="0" rx="17.6" ry="5.6" fill="none" stroke="#9FB7D6" stroke-width="0.3"/>`
    + shine('M -16 -2.4 Q -10 -5.6 -2 -5.6 Q -9 -4.6 -14.6 -1.4 Z', 0.9),
};

/** Un tubo de un solo color con contorno y luz de cilindro (asas, cuadros de bici, tallos). @param {string} d @param {string} colour @param {number} width */
function tubeLine(d, colour, width) {
  return `<path d="${d}" fill="none" stroke="${edge(colour)}" stroke-width="${round(width + LINE * 1.2)}" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`
    + `<path d="${d}" fill="none" stroke="${lighter(colour, 0.35)}" stroke-width="${round(width * 0.3)}" stroke-linecap="round" stroke-linejoin="round" stroke-opacity="0.6" transform="translate(${round(-width * 0.18)} ${round(-width * 0.18)})"/>`;
}


