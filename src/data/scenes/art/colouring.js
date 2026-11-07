// @ts-check
// Lo comun a las seis escenas de colorear (Listening, parte 5), que miden
// 800 x 470: el mismo estilo que las vinetas (style.js), con el contorno a la
// escala de la escena.
//
// Lo que el nino pinta va en un grupo `paintable` con sus formas `fillable` en
// blanco; la luz (los degradados de defs.js), las sombras y los brillos van
// encima, semitransparentes, y siguen funcionando con el color que elija: un
// objeto pintado de rojo se ve redondo y con brillo, no plano. Cada objeto
// mantiene la posicion y el tamano de su dibujo anterior: las frases ("the
// ball under the table") dependen de donde esta.
//
// Cada escena se dibuja dentro de withDefs (defs.js), que pone sus degradados.

import { INK, shade, shine, darker, lighter, place, seeded } from './style.js';
import { grad, fx } from './defs.js';
import { THINGS } from './things.js';

/** Contorno de las escenas de colorear: claro para el nino, sin ser grueso de comic. */
export const W = 3.8;
/** Detalles. */
export const F = 2.2;

/** @param {number} [w] */
const ink = (w = W) => `stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

/** La luz encima de una forma (no se toca: los toques van al objeto). @param {string} d @param {string} [kind] */
const light = (d, kind = 'vol') => `<path d="${d}" fill="${grad(kind)}" pointer-events="none"/>`;

/** Una forma con color fijo y su volumen. @param {string} d @param {string} fill @param {number} [w] */
export const solid = (d, fill, w = W) => `<path d="${d}" fill="${fill}" ${ink(w)}/>${fill === 'none' ? '' : light(d)}`;

/** Lo que el nino pinta: empieza en blanco, con la luz encima. @param {string} d @param {number} [w] */
export const paint = (d, w = W) => `<path class="fillable" d="${d}" fill="#FFFFFF" ${ink(w)}/>${light(d)}`;

/** Una linea de detalle. @param {string} d @param {number} [w] @param {string} [colour] */
export const line = (d, w = F, colour = INK) => `<path d="${d}" fill="none" stroke="${colour}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

/** Sombra en el suelo. @param {number} cx @param {number} cy @param {number} rx */
export const floorShadow = (cx, cy, rx) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${Math.round(rx * 0.18 * 10) / 10}" fill="#15183A" fill-opacity="0.12"/>`;

/** Un objeto que se puede pintar. @param {string} id @param {string} body @param {string} [transform] */
export const paintable = (id, body, transform = '') => `<g class="paintable" data-obj="${id}"${transform ? ` transform="${transform}"` : ''}>${body}</g>`;

/** @param {number} n */
const r1 = (n) => Math.round(n * 10) / 10;

/** Un circulo como camino. @param {number} cx @param {number} cy @param {number} r */
const ring = (cx, cy, r) => `M ${r1(cx - r)} ${r1(cy)} a ${r1(r)} ${r1(r)} 0 1 0 ${r1(r * 2)} 0 a ${r1(r)} ${r1(r)} 0 1 0 ${r1(-r * 2)} 0 Z`;

/** Varias formas pintables con un solo contorno por fuera (lana de oveja). @param {string[]} paths */
const paintBlob = (paths) => paths.map((d) => `<path d="${d}" fill="none" ${ink(W * 2)}/>`).join('')
  + paths.map((d) => `<path class="fillable" d="${d}" fill="#FFFFFF"/>`).join('')
  + paths.map((d) => `<path d="${d}" fill="${grad('ball')}" fill-opacity="0.45" pointer-events="none"/>`).join('');

/** Un degradado vertical (con un color intermedio si se da). @param {string} id @param {string} top @param {string} bottom @param {string} [middle] */
const gradient = (id, top, bottom, middle) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/>${middle ? `<stop offset="0.6" stop-color="${middle}"/>` : ''}<stop offset="1" stop-color="${bottom}"/></linearGradient>`;

/** La y mas baja del borde de arriba de una franja (para repartir dentro briznas o granos). @param {string} d @param {number} bottom */
function lowestEdge(d, bottom) {
  const ys = [...d.matchAll(/(-?\d+(?:\.\d+)?)[ ,](-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[2])).filter((y) => y < bottom);
  return Math.max(...ys);
}

// ------------------------------------------------------------------ fondos

/** Cielo de dia en toda la escena. @param {string} id */
export const sky = (id) => `<defs>${gradient(`${id}-sky`, '#7FC0F0', '#EEF8FF', '#BFE2FA')}</defs><rect width="800" height="470" fill="url(#${id}-sky)"/>`;

/**
 * Hierba: una franja con su degradado, su borde y unas matas.
 * @param {string} id @param {string} d @param {[number, number][]} tufts
 * @param {[string, string]} [colours]
 */
export function grass(id, d, tufts, colours = ['#B5E08F', '#7DBB5C']) {
  const marks = tufts.map(([x, y]) => `M ${x} ${y} l -5 -10 M ${x} ${y} l 0 -12 M ${x} ${y} l 5 -10`).join(' ');
  // Briznas repartidas por toda la franja (siempre las mismas).
  const top = lowestEdge(d, 470) + 8;
  const rnd = seeded(id.length * 31 + Math.round(top));
  let dark = '';
  let lit = '';
  for (let i = 0; i < 160; i += 1) {
    const x = rnd() * 800;
    const t = rnd();
    const y = top + t * (470 - top);
    const h = 4 + t * 7;
    const lean = (rnd() - 0.5) * 4;
    const blade = `M ${r1(x)} ${r1(y)} q ${r1(lean * 0.4)} ${r1(-h * 0.6)} ${r1(lean)} ${r1(-h)} `;
    if (rnd() < 0.55) dark += blade; else lit += blade;
  }
  let patches = '';
  for (let i = 0; i < 8; i += 1) {
    patches += `<ellipse cx="${r1(rnd() * 800)}" cy="${r1(top + rnd() * (470 - top))}" rx="${r1(50 + rnd() * 70)}" ry="${r1(8 + rnd() * 10)}" fill="${rnd() < 0.5 ? '#3F7E2E' : '#E2F6C4'}" fill-opacity="0.2" filter="${fx('blurL')}"/>`;
  }
  const edge = d.replace(/ L800 470 L0 470 Z$|L800 470 Z$/, '').replace(/^M0 470 L/, 'M');
  return `<defs>${gradient(id, colours[0], colours[1])}</defs><path d="${d}" fill="url(#${id})"/>`
    // Textura de hierba (vetas) y manchas de luz y de sombra.
    + `<path d="${d}" fill="#2F6A22" fill-opacity="0.32" filter="${fx('grassyL')}"/>`
    + `<path d="${d}" fill="#EAF8D2" fill-opacity="0.14" filter="${fx('grainL')}"/>`
    + patches
    + `<path d="${edge}" fill="none" stroke="#E4F4D0" stroke-width="7" stroke-opacity="0.55" filter="${fx('blurL')}"/>`
    + `<path d="${edge}" fill="none" stroke="#7DB862" stroke-width="1.6" stroke-opacity="0.7"/>`
    + line(dark, 1.3, '#5E9E45') + line(lit, 1.1, '#C9EBA8')
    + line(marks, 2, '#6AA851');
}

/** Pared de una habitacion y suelo de madera. @param {string} id @param {number} floorY @param {string} [wall] */
export function room(id, floorY, wall = '#FFF4DC') {
  let stripes = '';
  for (let x = 40; x < 800; x += 80) stripes += `M ${x} 0 V ${floorY - 14} `;
  let planks = '';
  const rows = [floorY + 34, floorY + 72, floorY + 112];
  for (const y of rows) if (y < 470) planks += `M 0 ${y} H 800 `;
  [[90, 0], [280, 0], [520, 0], [700, 0], [170, 1], [410, 1], [640, 1], [60, 2], [330, 2], [590, 2]].forEach(([x, row]) => {
    const top = row === 0 ? floorY : rows[row - 1];
    const bottom = rows[row] ?? 470;
    if (top < 470) planks += `M ${x} ${top} V ${Math.min(bottom, 470)} `;
  });
  const rnd = seeded(floorY);
  let grain = '';
  for (let i = 0; i < 46; i += 1) {
    const x = rnd() * 760;
    const y = floorY + 6 + rnd() * (470 - floorY - 10);
    const w = 30 + rnd() * 50;
    grain += `M ${r1(x)} ${r1(y)} q ${r1(w / 2)} ${r1((rnd() - 0.5) * 4)} ${r1(w)} 0 `;
  }
  let dots = '';
  for (let y = 30; y < floorY - 30; y += 46) for (let x = (y / 46) % 2 ? 40 : 80; x < 800; x += 80) dots += `<circle cx="${x}" cy="${y}" r="2.2"/>`;
  return `<defs>${gradient(`${id}-wall`, lighter(wall, 0.3), wall)}${gradient(`${id}-floor`, '#D3A266', '#AD7740')}</defs>`
    + `<rect width="800" height="470" fill="url(#${id}-wall)"/>`
    + line(stripes, 18, darker(wall, 0.035))
    + `<g fill="${darker(wall, 0.08)}" fill-opacity="0.7">${dots}</g>`
    // El yeso de la pared y las esquinas en penumbra.
    + `<rect width="800" height="${floorY}" fill="#8A6A3A" fill-opacity="0.12" filter="${fx('grainL')}"/>`
    + `<rect x="-40" y="-20" width="120" height="${floorY + 20}" fill="#6A4A20" fill-opacity="0.08" filter="${fx('blurL')}"/>`
    + `<rect x="720" y="-20" width="120" height="${floorY + 20}" fill="#6A4A20" fill-opacity="0.08" filter="${fx('blurL')}"/>`
    + `<rect y="${floorY - 14}" width="800" height="14" fill="#FFFDF6" ${ink(2.6)}/>`
    + `<rect y="${floorY}" width="800" height="${470 - floorY}" fill="url(#${id}-floor)"/>`
    // Madera: grano, vetas, tablas, y la sombra junto al zocalo.
    + `<rect y="${floorY}" width="800" height="${470 - floorY}" fill="#4A2A10" fill-opacity="0.28" filter="${fx('grainL')}"/>`
    + line(planks, 2.2, '#8A5A2C')
    + line(grain, 1.1, '#B98450')
    + `<rect y="${floorY}" width="800" height="14" fill="#2A1606" fill-opacity="0.22" filter="${fx('blurL')}"/>`
    + `<path d="M 0 ${floorY} H 800" ${ink(W)}/>`;
}

// ---------------------------------------------------------------- decorado

/** Ventana con marco blanco, cruz y brillo. @param {number} x @param {number} y @param {number} w @param {number} h @param {string} id */
export function window(x, y, w, h, id) {
  return `<defs>${gradient(`${id}-glass`, '#A2D4F6', '#E2F2FF')}</defs>`
    + `<rect x="${x - 8}" y="${y - 8}" width="${w + 16}" height="${h + 16}" rx="5" fill="#FFFFFF" ${ink()}/>`
    + `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="url(#${id}-glass)" ${ink(F)}/>`
    + `<path d="M ${x + w * 0.12} ${y + h * 0.88} L ${x + w * 0.38} ${y + h * 0.12} L ${x + w * 0.48} ${y + h * 0.12} L ${x + w * 0.22} ${y + h * 0.88} Z" fill="#FFFFFF" fill-opacity="0.5"/>`
    + `<path d="M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}" stroke="#FFFFFF" stroke-width="9"/>`
    + `<path d="M ${x + w / 2} ${y} V ${y + h} M ${x} ${y + h / 2} H ${x + w}" fill="none" ${ink(F)}/>`;
}

/**
 * Una casa o tienda con tejado, puerta, ventana y cartel (donde el nino
 * escribe la palabra).
 * @param {{ x: number, y: number, w: number, h: number, peak: number, roof: string, door: [number, number, number, number],
 *   doorColour: string, glass?: [number, number, number, number], sign: [number, number, number, number], textX: number,
 *   textY: number, id: string }} o
 */
export function house(o) {
  const [dx, dy, dw, dh] = o.door;
  const [sx, sy, sw, sh] = o.sign;
  const eave = 16;
  let out = floorShadow(o.x + o.w / 2, o.y + o.h, o.w * 0.62)
    + solid(`M ${o.x} ${o.y} H ${o.x + o.w} V ${o.y + o.h} H ${o.x} Z`, '#FFF1D2')
    + shade(`M ${o.x + o.w * 0.72} ${o.y} H ${o.x + o.w} V ${o.y + o.h} H ${o.x + o.w * 0.72} Z`, 0.08)
    + line(Array.from({ length: Math.floor(o.h / 14) }, (u, i) => `M ${o.x + 2} ${o.y + 14 + i * 14} H ${o.x + o.w - 2}`).join(' '), 1.2, '#E6D2A8')
    + solid(`M ${o.x - eave} ${o.y} L ${o.x + o.w / 2} ${o.peak} L ${o.x + o.w + eave} ${o.y} Z`, o.roof)
    + line(`M ${o.x + 10} ${o.y - 14} L ${o.x + o.w - 10} ${o.y - 14} M ${o.x + 36} ${o.y - 34} L ${o.x + o.w - 36} ${o.y - 34} M ${o.x + 60} ${o.y - 52} L ${o.x + o.w - 60} ${o.y - 52}`, F, darker(o.roof, 0.25))
    + line(Array.from({ length: 12 }, (u, i) => `M ${r1(o.x - 4 + i * (o.w + 8) / 12)} ${o.y - 2} l 0 -11`).join(' '), 1.2, darker(o.roof, 0.2))
    + shade(`M ${o.x + o.w / 2} ${o.peak} L ${o.x + o.w + eave} ${o.y} L ${o.x + o.w / 2 + 8} ${o.y} Z`, 0.14)
    + solid(`M ${dx} ${dy + dh} V ${dy + 8} Q ${dx} ${dy} ${dx + 8} ${dy} H ${dx + dw - 8} Q ${dx + dw} ${dy} ${dx + dw} ${dy + 8} V ${dy + dh} Z`, o.doorColour)
    + line(`M ${dx + 8} ${dy + 14} H ${dx + dw - 8} V ${dy + dh / 2 - 4} H ${dx + 8} Z`, F, darker(o.doorColour, 0.3))
    + `<circle cx="${dx + dw - 9}" cy="${dy + dh * 0.56}" r="4" fill="#FFD23F" ${ink(F * 0.8)}/>`;
  if (o.glass) {
    const [gx, gy, gw, gh] = o.glass;
    out += window(gx + 6, gy + 6, gw - 12, gh - 12, `${o.id}-w`);
  }
  out += `<rect x="${sx}" y="${sy}" width="${sw}" height="${sh}" rx="7" fill="#FFFFFF" ${ink()}/>`
    + `<text id="sign-text" x="${o.textX}" y="${o.textY}" text-anchor="middle" font-family="'Baloo 2', sans-serif" font-weight="800" font-size="21" fill="${INK}"></text>`;
  return out;
}

/** Muro de ladrillos. @param {number} x @param {number} y @param {number} w @param {number} h @param {string} [colour] */
export function brickWall(x, y, w, h, colour = '#D98B6E') {
  const rows = 3;
  const rh = h / rows;
  let joints = '';
  for (let r = 1; r < rows; r += 1) joints += `M ${x} ${r1(y + r * rh)} H ${x + w} `;
  for (let r = 0; r < rows; r += 1) {
    const offset = r % 2 ? 22 : 44;
    for (let bx = x + offset; bx < x + w - 6; bx += 48) joints += `M ${r1(bx)} ${r1(y + r * rh)} V ${r1(y + (r + 1) * rh)} `;
  }
  // Cada ladrillo un poco distinto, como los de verdad.
  const rnd = seeded(Math.round(x + y));
  let tints = '';
  for (let r = 0; r < rows; r += 1) {
    const offset = r % 2 ? 22 : 44;
    for (let bx = x + offset - 48; bx < x + w; bx += 48) {
      const a = Math.max(x + 2, bx + 2);
      const b = Math.min(x + w - 2, bx + 46);
      if (b - a < 4) continue;
      tints += `<rect x="${r1(a)}" y="${r1(y + r * rh + 2)}" width="${r1(b - a)}" height="${r1(rh - 4)}" fill="${rnd() < 0.5 ? darker(colour, 0.1) : lighter(colour, 0.1)}" fill-opacity="0.6"/>`;
    }
  }
  return floorShadow(x + w / 2, y + h, w * 0.55)
    + solid(`M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`, colour)
    + tints
    + line(joints, F, darker(colour, 0.32))
    + shine(`M ${x + 4} ${y + 4} H ${x + w - 4} V ${y + 9} H ${x + 4} Z`, 0.3)
    + shade(`M ${x + 4} ${y + h - 8} H ${x + w - 4} V ${y + h - 3} H ${x + 4} Z`, 0.14);
}

/** Muro de piedra gris (la granja). @param {number} x @param {number} y @param {number} w @param {number} h */
export const stoneWall = (x, y, w, h) => brickWall(x, y, w, h, '#C3BCAE');

/** Arbol grande: el mismo de las vinetas (corteza, ramas, copa con hojas), a la escala de la escena. @param {number} cx @param {number} groundY @param {number} k escala */
export function tree(cx, groundY, k) {
  return place(cx, groundY, k, THINGS.tree());
}

/** Mesa de madera vista de frente. @param {number} x @param {number} top @param {number} w @param {number} bottom */
export function table(x, top, w, bottom) {
  const wood = '#C88A4C';
  const dark = '#9C6535';
  return floorShadow(x + w / 2, bottom, w * 0.5)
    + solid(`M ${x + 10} ${top + 14} H ${x + 22} L ${x + 20} ${bottom} H ${x + 12} Z`, dark)
    + solid(`M ${x + w - 22} ${top + 14} H ${x + w - 10} L ${x + w - 12} ${bottom} H ${x + w - 20} Z`, dark)
    + solid(`M ${x + 6} ${top + 14} H ${x + w - 6} V ${top + 22} H ${x + 6} Z`, dark, F)
    + solid(`M ${x} ${top + 4} Q ${x} ${top} ${x + 4} ${top} H ${x + w - 4} Q ${x + w} ${top} ${x + w} ${top + 4} V ${top + 11} Q ${x + w} ${top + 15} ${x + w - 4} ${top + 15} H ${x + 4} Q ${x} ${top + 15} ${x} ${top + 11} Z`, wood)
    + shine(`M ${x + 6} ${top + 3} H ${x + w - 30} V ${top + 6} H ${x + 6} Z`, 0.4)
    + line(`M ${x + 30} ${top + 9} q 30 -3 60 0 M ${x + w * 0.55} ${top + 7} q 20 2 40 0 M ${x + 14} ${top + 11} q 14 -1 28 0`, 1.2, dark)
    + line(`M ${x + 15} ${top + 26} V ${bottom - 8} M ${x + w - 16} ${top + 26} V ${bottom - 8}`, 1, darker(dark, 0.2));
}

/** Silla de lado (respaldo a la izquierda). @param {number} x @param {number} seatY @param {number} w @param {number} floorY @param {number} backTop @param {string} [colour] */
export function chair(x, seatY, w, floorY, backTop, colour = '#C88A4C') {
  const dark = darker(colour, 0.22);
  return floorShadow(x + w / 2, floorY, w * 0.6)
    + solid(`M ${x + 6} ${backTop} H ${x + 18} V ${seatY} H ${x + 6} Z`, colour)
    + solid(`M ${x + 6} ${seatY + 14} H ${x + 16} V ${floorY} H ${x + 6} Z`, dark)
    + solid(`M ${x + w - 18} ${seatY + 14} H ${x + w - 8} V ${floorY} H ${x + w - 18} Z`, dark)
    + solid(`M ${x} ${seatY + 3} Q ${x} ${seatY} ${x + 3} ${seatY} H ${x + w - 3} Q ${x + w} ${seatY} ${x + w} ${seatY + 3} V ${seatY + 11} Q ${x + w} ${seatY + 14} ${x + w - 3} ${seatY + 14} H ${x + 3} Q ${x} ${seatY + 14} ${x} ${seatY + 11} Z`, colour)
    + shine(`M ${x + 6} ${seatY + 3} H ${x + w - 20} V ${seatY + 6} H ${x + 6} Z`, 0.35)
    + shine(`M ${x + 8} ${backTop + 4} H ${x + 11} V ${seatY - 4} H ${x + 8} Z`, 0.3);
}

/** Caja de carton abierta. @param {number} x @param {number} y @param {number} w @param {number} h */
export function box(x, y, w, h) {
  const card = '#D2A06A';
  return floorShadow(x + w / 2, y + h, w * 0.6)
    + solid(`M ${x} ${y} H ${x + w} V ${y + h} H ${x} Z`, card)
    + solid(`M ${x} ${y} L ${x - 14} ${y - 16} L ${x + 14} ${y - 16} L ${x + 22} ${y} Z`, lighter(card, 0.12), F + 0.6)
    + solid(`M ${x + w} ${y} L ${x + w + 14} ${y - 16} L ${x + w - 14} ${y - 16} L ${x + w - 22} ${y} Z`, lighter(card, 0.12), F + 0.6)
    + shade(`M ${x + w * 0.66} ${y} H ${x + w} V ${y + h} H ${x + w * 0.66} Z`, 0.12)
    + solid(`M ${x + w / 2 - 12} ${y} H ${x + w / 2 + 12} V ${y + 20} H ${x + w / 2 - 12} Z`, '#E8C08C', F);
}

// ------------------------------------------------------- objetos para pintar

/** Cometa con cola de lazos. @param {string} id @param {number} cx @param {number} cy @param {number} s @param {number} [rot] */
export function kite(id, cx, cy, s, rot = 0) {
  const bow = (/** @type {number} */ x, /** @type {number} */ y) => solid(`M ${r1(x)} ${r1(y)} l -9 -5 l 0 10 Z M ${r1(x)} ${r1(y)} l 9 -5 l 0 10 Z`, '#FFFFFF', F);
  return paintable(id,
    line(`M ${cx} ${r1(cy + s)} Q ${r1(cx - s * 0.3)} ${r1(cy + s * 1.35)} ${cx} ${r1(cy + s * 1.7)} Q ${r1(cx + s * 0.3)} ${r1(cy + s * 2.05)} ${cx} ${r1(cy + s * 2.4)}`, F)
    + bow(cx - s * 0.1, cy + s * 1.38) + bow(cx + s * 0.1, cy + s * 2.04)
    + paint(`M ${cx} ${r1(cy - s)} L ${r1(cx + s * 0.72)} ${cy} L ${cx} ${r1(cy + s)} L ${r1(cx - s * 0.72)} ${cy} Z`)
    + shade(`M ${cx} ${r1(cy - s)} L ${r1(cx + s * 0.72)} ${cy} L ${cx} ${cy} Z`, 0.14)
    + shade(`M ${r1(cx - s * 0.72)} ${cy} L ${cx} ${cy} L ${cx} ${r1(cy + s)} Z`, 0.07)
    + `<path d="M ${cx} ${r1(cy - s * 0.86)} L ${r1(cx + s * 0.6)} ${cy} L ${cx} ${r1(cy + s * 0.86)} L ${r1(cx - s * 0.6)} ${cy} Z" fill="none" stroke="${INK}" stroke-opacity="0.35" stroke-width="1.2" stroke-dasharray="4 3"/>`
    + line(`M ${cx} ${r1(cy - s)} L ${cx} ${r1(cy + s)} M ${r1(cx - s * 0.72)} ${cy} L ${r1(cx + s * 0.72)} ${cy}`, F)
    + shine(`M ${r1(cx - 4)} ${r1(cy - s * 0.72)} L ${r1(cx - s * 0.5)} ${r1(cy - 4)} L ${r1(cx - s * 0.32)} ${r1(cy - 4)} Z`, 0.45),
  `rotate(${rot} ${cx} ${cy})`);
}

/** Pelota. @param {string} id @param {number} cx @param {number} cy @param {number} r */
export function ball(id, cx, cy, r) {
  return floorShadow(cx, r1(cy + r), r1(r * 0.95))
    + paintable(id,
      paint(ring(cx, cy, r))
      + line(`M ${r1(cx - r * 0.96)} ${r1(cy - r * 0.24)} Q ${cx} ${r1(cy + r * 0.45)} ${r1(cx + r * 0.96)} ${r1(cy - r * 0.24)} M ${r1(cx - r * 0.4)} ${r1(cy - r * 0.92)} Q ${r1(cx + r * 0.25)} ${cy} ${r1(cx - r * 0.33)} ${r1(cy + r * 0.95)}`, F)
      + shade(`M ${r1(cx + r * 0.33)} ${r1(cy - r * 0.94)} A ${r} ${r} 0 0 1 ${r1(cx + r * 0.33)} ${r1(cy + r * 0.94)} Q ${r1(cx + r * 0.85)} ${cy} ${r1(cx + r * 0.33)} ${r1(cy - r * 0.94)} Z`, 0.15)
      + shine(`M ${r1(cx - r * 0.66)} ${r1(cy - r * 0.42)} Q ${r1(cx - r * 0.55)} ${r1(cy - r * 0.8)} ${r1(cx - r * 0.2)} ${r1(cy - r * 0.86)} Q ${r1(cx - r * 0.42)} ${r1(cy - r * 0.62)} ${r1(cx - r * 0.5)} ${r1(cy - r * 0.38)} Z`, 0.6));
}

/** Pajaro (flip -1 mira a la izquierda). @param {string} id @param {number} x @param {number} y @param {number} [flip] */
export function bird(id, x, y, flip = 1) {
  return paintable(id,
    paint('M -17 -3 L -36 -14 L -31 4 Z')
    + paint('M -19 0 Q -19 -13 0 -13 Q 19 -13 19 0 Q 19 13 0 13 Q -19 13 -19 0 Z')
    + paint('M -9 -3 Q 3 -10 9 -1 Q 1 5 -9 2 Z', F)
    + shade('M -9 -3 Q 3 -10 9 -1 Q 1 5 -9 2 Z', 0.12)
    + line('M -6 -1 q 4 -2 8 0 M -4 1.6 q 4 -1.6 8 0 M -24 -5 l 8 3 M -25 0 l 8 0.6', 1, '#00000040')
    + shade('M -17 6 Q 0 13 17 5 Q 14 12 0 13 Q -14 12 -17 6 Z', 0.14)
    + paint(ring(15, -11, 10))
    + solid('M 24 -13 L 37 -9 L 24 -5 Z', '#F5A623', F)
    + `<circle cx="17" cy="-13" r="2.6" fill="${INK}"/><circle cx="16.2" cy="-14" r="0.9" fill="#FFFFFF"/>`
    + shine('M 8 -16 Q 11 -21 16 -21 Q 12 -18 11 -14 Z', 0.5),
  `translate(${x} ${y}) scale(${flip} 1)`);
}

/** Barco de vela (vela y casco se pintan). @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [tilt] */
export function boat(id, x, y, s, tilt = 0) {
  return paintable(id,
    solid(`M ${r1(x - 1.5)} ${y} V ${r1(y - s * 2.2)} H ${r1(x + 1.5)} V ${y} Z`, '#8D5B33', F)
    + paint(`M ${r1(x + 0.16 * s)} ${r1(y - s * 2.1)} Q ${r1(x + 1.2 * s)} ${r1(y - s * 1.1)} ${r1(x + 1.7 * s)} ${r1(y - 0.2 * s)} L ${r1(x + 0.16 * s)} ${r1(y - 0.2 * s)} Z`)
    + line(`M ${r1(x + 0.16 * s)} ${r1(y - s * 1.4)} Q ${r1(x + 0.6 * s)} ${r1(y - s * 1.2)} ${r1(x + 1 * s)} ${r1(y - s * 0.9)} M ${r1(x + 0.16 * s)} ${r1(y - s * 0.75)} Q ${r1(x + 0.75 * s)} ${r1(y - s * 0.65)} ${r1(x + 1.35 * s)} ${r1(y - s * 0.45)}`, 1.6, '#AEB8C8')
    + paint(`M ${r1(x - 2 * s)} ${y} L ${r1(x + 2 * s)} ${y} Q ${r1(x + 1.85 * s)} ${r1(y + 0.42 * s)} ${r1(x + 1.4 * s)} ${r1(y + 0.62 * s)} L ${r1(x - 1.4 * s)} ${r1(y + 0.62 * s)} Q ${r1(x - 1.85 * s)} ${r1(y + 0.42 * s)} ${r1(x - 2 * s)} ${y} Z`)
    + `<path d="M ${r1(x - 1.88 * s)} ${r1(y + 0.16 * s)} H ${r1(x + 1.88 * s)}" stroke="#FFFFFF" stroke-opacity="0.55" stroke-width="${r1(s * 0.14)}"/>`
    + `<path d="M ${r1(x - 1.7 * s)} ${r1(y + 0.34 * s)} Q ${x} ${r1(y + 0.4 * s)} ${r1(x + 1.7 * s)} ${r1(y + 0.34 * s)} M ${r1(x - 1.5 * s)} ${r1(y + 0.5 * s)} Q ${x} ${r1(y + 0.56 * s)} ${r1(x + 1.5 * s)} ${r1(y + 0.5 * s)}" fill="none" stroke="#00000030" stroke-width="1"/>`
    + shade(`M ${r1(x - 1.7 * s)} ${r1(y + 0.36 * s)} H ${r1(x + 1.7 * s)} Q ${r1(x + 1.6 * s)} ${r1(y + 0.55 * s)} ${r1(x + 1.4 * s)} ${r1(y + 0.62 * s)} L ${r1(x - 1.4 * s)} ${r1(y + 0.62 * s)} Q ${r1(x - 1.6 * s)} ${r1(y + 0.55 * s)} ${r1(x - 1.7 * s)} ${r1(y + 0.36 * s)} Z`, 0.16),
  `rotate(${tilt} ${x} ${y})`);
}

/** Concha. @param {string} id @param {number} cx @param {number} cy @param {number} r */
export function shell(id, cx, cy, r) {
  const k = r / 13;
  const p = (/** @type {number} */ x, /** @type {number} */ y) => `${r1(cx + x * k)} ${r1(cy + y * k)}`;
  return paintable(id,
    solid(`M ${p(-2.8, 0)} L ${p(-2, 2)} L ${p(2, 2)} L ${p(2.8, 0)} Z`, '#F1D2DE', F)
    + paint(`M ${p(-12.6, -0.6)} Q ${p(-13.6, -9.6)} ${p(-6.4, -12.4)} Q ${p(0, -14.8)} ${p(6.4, -12.4)} Q ${p(13.6, -9.6)} ${p(12.6, -0.6)} Q ${p(0, 1.2)} ${p(-12.6, -0.6)} Z`)
    + line(`M ${p(0, 0)} L ${p(0, -13.2)} M ${p(0, 0)} L ${p(-5.8, -12.2)} M ${p(0, 0)} L ${p(5.8, -12.2)} M ${p(0, 0)} L ${p(-10.4, -8.6)} M ${p(0, 0)} L ${p(10.4, -8.6)}`, F * 0.8)
    + shade(`M ${p(6.4, -12.4)} Q ${p(13.6, -9.6)} ${p(12.6, -0.6)} Q ${p(9, 0)} ${p(5.6, 0.2)} Q ${p(9.2, -6)} ${p(6.4, -12.4)} Z`, 0.13)
    + shine(`M ${p(-9.6, -8.4)} Q ${p(-7, -11.4)} ${p(-3, -12.4)} Q ${p(-6, -9.4)} ${p(-7.6, -6)} Z`, 0.5));
}

/** Pez (flip -1 mira a la izquierda). @param {string} id @param {number} x @param {number} y @param {number} [flip] */
export function fish(id, x, y, flip = 1) {
  return paintable(id,
    paint('M -20 0 L -40 -15 Q -36 0 -40 15 Z')
    + paint('M -6 -13 Q 2 -24 12 -14 Z', F)
    + paint('M -24 0 Q -16 -16 2 -15 Q 20 -14 27 0 Q 20 14 2 15 Q -16 16 -24 0 Z')
    + line('M 12 -10 Q 7 0 12 10', F * 0.9)
    + line('M -12 -4 q 3 3 0 6 M -4 -6 q 3 3 0 6 M 4 -4 q 3 3 0 6 M -8 4 q 3 3 0 6 M 0 2 q 3 3 0 6 M -8 -10 q 3 3 0 6 M 0 -12 q 3 3 0 6', 1.2, '#6C748999')
    + line('M -38 -10 L -26 -1 M -38 10 L -26 1 M -38 0 L -26 0', 1, '#00000030')
    + shade('M -22 4 Q -6 13 26 2 Q 20 14 2 15 Q -16 16 -22 4 Z', 0.15)
    + `<circle cx="17" cy="-4" r="3.6" fill="#FFFFFF" ${ink(1.6)}/><circle cx="18" cy="-4" r="1.8" fill="${INK}"/>`
    + shine('M -12 -9 Q 0 -14 10 -12 Q 0 -10 -10 -6 Z', 0.45),
  `translate(${x} ${y}) scale(${flip} 1)`);
}

/** Vaca: el cuerpo y la cabeza se pintan; las manchas siguen negras. @param {string} id @param {number} x @param {number} y @param {number} s */
export function cow(id, x, y, s) {
  return floorShadow(x, r1(y + 40 * s), r1(52 * s))
    + paintable(id,
      solid('M -30 14 h 10 v 25 h -10 Z', '#E3DED4', F)
      + solid('M 18 14 h 10 v 25 h -10 Z', '#E3DED4', F)
      + line('M -46 -8 Q -58 4 -54 22', F + 1)
      + solid('M -59 20 q 4 -6 9 0 q -1 7 -4.5 8 q -3.5 -1 -4.5 -8 Z', '#34364F', F)
      + paint('M -48 0 Q -48 -27 -22 -27 L 22 -27 Q 48 -27 48 0 Q 48 27 22 27 L -22 27 Q -48 27 -48 0 Z')
      + solid('M -24 -20 Q -10 -27 -4 -14 Q -8 -2 -20 -4 Q -30 -8 -24 -20 Z', '#34364F', 0)
      + solid('M 10 -2 Q 22 -8 28 2 Q 26 14 14 14 Q 6 10 10 -2 Z', '#34364F', 0)
      + solid('M -6 26 Q -5 34 1 34 Q 7 34 8 26 Z', '#F7A8B8', F)
      + shade('M -46 10 Q 0 26 46 10 Q 42 27 22 27 L -22 27 Q -42 27 -46 10 Z', 0.12)
      + solid('M -38 18 h 11 v 22 h -11 Z', '#FFFFFF', F)
      + solid('M 28 18 h 11 v 22 h -11 Z', '#FFFFFF', F)
      + solid('M -38.4 36 h 11.8 v 5 h -11.8 Z', '#34364F', F)
      + solid('M 27.6 36 h 11.8 v 5 h -11.8 Z', '#34364F', F)
      + solid('M 36 -46 Q 28 -54 30 -60 Q 37 -54 41 -49 Z', '#F2E3BC', F)
      + solid('M 62 -46 Q 70 -54 68 -60 Q 61 -54 57 -49 Z', '#F2E3BC', F)
      + paint('M 35 -38 Q 24 -42 22 -34 Q 29 -30 35 -32 Z', F)
      + paint('M 63 -38 Q 74 -42 76 -34 Q 69 -30 63 -32 Z', F)
      + paint('M 34 -36 Q 34 -48 49 -48 Q 64 -48 64 -36 L 64 -20 Q 64 -8 49 -8 Q 34 -8 34 -20 Z')
      + solid('M 50 -48 Q 62 -47 62 -36 Q 56 -37 53 -42 Z', '#34364F', 0)
      + `<ellipse cx="49" cy="-15" rx="13" ry="8.6" fill="#F7B6C2" ${ink(F)}/>`
      + `<ellipse cx="44.6" cy="-15" rx="1.8" ry="2.6" fill="${INK}"/><ellipse cx="53.4" cy="-15" rx="1.8" ry="2.6" fill="${INK}"/>`
      + `<circle cx="43" cy="-32" r="2.8" fill="${INK}"/><circle cx="55" cy="-32" r="2.8" fill="${INK}"/>`
      + '<circle cx="42.2" cy="-33" r="0.9" fill="#FFFFFF"/><circle cx="54.2" cy="-33" r="0.9" fill="#FFFFFF"/>',
    `translate(${x} ${y}) scale(${s})`);
}

/** Pato. @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [flip] */
export function duck(id, x, y, s, flip = 1) {
  return paintable(id,
    paint('M -22 -4 L -33 -13 L -21 -11 Z', F)
    + paint('M -25 0 Q -25 -15 -8 -15 L 8 -15 Q 25 -15 25 0 Q 25 15 6 15 L -6 15 Q -25 15 -25 0 Z')
    + shade('M -24 5 Q 0 14 24 4 Q 22 15 6 15 L -6 15 Q -22 15 -24 5 Z', 0.14)
    + paint('M -12 -4 Q 2 -11 12 -2 Q 2 5 -12 2 Z', F)
    + shade('M -12 -4 Q 2 -11 12 -2 Q 2 5 -12 2 Z', 0.1)
    + line('M -8 -1 q 5 -2.4 10 0 M -6 1.8 q 5 -2 10 0', 1, '#00000035')
    + paint(ring(20, -17, 12))
    + solid('M 30 -20 Q 44 -21 46 -16 Q 43 -11 30 -12 Z', '#F2862B', F)
    + `<circle cx="22" cy="-20" r="2.6" fill="${INK}"/><circle cx="21.2" cy="-21" r="0.9" fill="#FFFFFF"/>`
    + shine('M 12 -24 Q 16 -29 22 -28.6 Q 17 -26.6 15 -23 Z', 0.5),
  `translate(${x} ${y}) scale(${flip * s} ${s})`);
}

/** Oveja: la lana se pinta; la cara y las patas son oscuras. @param {string} id @param {number} x @param {number} y @param {number} s */
export function sheep(id, x, y, s) {
  return floorShadow(x, r1(y + 36 * s), r1(40 * s))
    + paintable(id,
      solid('M -21 12 h 7 v 24 h -7 Z', '#3E3B4A', F)
      + solid('M 13 12 h 7 v 24 h -7 Z', '#3E3B4A', F)
      + paintBlob([ring(-22, 0, 18), ring(0, -10, 20), ring(20, 0, 18), ring(-8, 10, 14), ring(10, 10, 14)])
      + shade('M -36 10 Q -10 26 34 10 Q 30 24 10 24 Q -8 26 -22 18 Q -34 16 -36 10 Z', 0.1)
      + shine('M -18 -18 Q -8 -28 6 -26 Q -6 -22 -12 -14 Z', 0.55)
    + line('M -28 -2 q 3 -4 6 0 M -16 -12 q 3 -4 6 0 M 2 -18 q 3 -4 6 0 M 16 -6 q 3 -4 6 0 M -4 2 q 3 -4 6 0 M 10 10 q 3 -4 6 0 M -18 10 q 3 -4 6 0 M 24 4 q 3 -4 6 0', 1.2, '#00000030')
      + solid('M 32 -14 Q 32 -24 40 -24 Q 50 -24 50 -12 Q 50 2 40 4 Q 30 2 32 -14 Z', '#3E3B4A')
      + solid('M 32 -18 Q 24 -22 22 -16 Q 26 -12 32 -14 Z', '#3E3B4A', F)
      + `<circle cx="43" cy="-13" r="2.6" fill="#FFFFFF"/><circle cx="43.6" cy="-13" r="1.3" fill="${INK}"/>`
      + paintBlob([ring(38, -24, 6), ring(44, -26, 5)]),
    `translate(${x} ${y}) scale(${s})`);
}

/** Libro visto desde arriba (la clase). @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [tilt] */
export function bookTop(id, x, y, s, tilt = 0) {
  const X = (/** @type {number} */ v) => r1(x + v * s);
  const Y = (/** @type {number} */ v) => r1(y + v * s);
  return paintable(id,
    solid(`M ${X(-28)} ${Y(-20)} H ${X(32)} V ${Y(24)} H ${X(-28)} Z`, '#FFF6E2', F)
    + line(`M ${X(30)} ${Y(-17)} V ${Y(21)} M ${X(27)} ${Y(-19)} V ${Y(23)}`, 1.4, '#D9CDB0')
    + paint(`M ${X(-30)} ${Y(-22)} Q ${X(-30)} ${Y(-24)} ${X(-28)} ${Y(-24)} L ${X(26)} ${Y(-24)} Q ${X(28)} ${Y(-24)} ${X(28)} ${Y(-22)} L ${X(28)} ${Y(20)} Q ${X(28)} ${Y(22)} ${X(26)} ${Y(22)} L ${X(-28)} ${Y(22)} Q ${X(-30)} ${Y(22)} ${X(-30)} ${Y(20)} Z`)
    + shade(`M ${X(-30)} ${Y(-22)} L ${X(-22)} ${Y(-24)} L ${X(-22)} ${Y(22)} L ${X(-30)} ${Y(20)} Z`, 0.16)
    + `<rect x="${X(-14)}" y="${Y(-14)}" width="${r1(32 * s)}" height="${r1(14 * s)}" rx="${r1(2 * s)}" fill="#FFFFFF" fill-opacity="0.75" ${ink(F * 0.8)}/>`
    + line(`M ${X(-10)} ${Y(-9)} H ${X(13)} M ${X(-10)} ${Y(-4)} H ${X(6)}`, 1.6, '#8E96AA'),
  `rotate(${tilt} ${x} ${y})`);
}

/** Libro tumbado, visto de lado (el dormitorio). @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [rot] */
export function bookSide(id, x, y, s, rot = 0) {
  return paintable(id,
    paint('M -30 -11 Q -30 -14 -27 -14 L 27 -14 Q 30 -14 30 -11 L 30 5 Q 30 8 27 8 L -27 8 Q -30 8 -30 5 Z')
    + solid('M -24 0 H 29 V 5.6 H -24 Z', '#FFF6E2', F * 0.8)
    + line('M -20 2.8 H 26', 1.2, '#D9CDB0')
    + shade('M -30 -11 Q -30 -14 -27 -14 L -22 -14 L -22 8 L -27 8 Q -30 8 -30 5 Z', 0.18)
    + `<path d="M -12 -7 H 18" stroke="#FFFFFF" stroke-opacity="0.8" stroke-width="3" stroke-linecap="round"/>`,
  `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
}

/** Mochila del colegio. @param {string} id @param {number} x @param {number} y @param {number} s */
export function bag(id, x, y, s) {
  const X = (/** @type {number} */ v) => r1(x + v * s);
  const Y = (/** @type {number} */ v) => r1(y + v * s);
  return floorShadow(x, Y(12), r1(30 * s))
    + paintable(id,
      `<path d="M ${X(-14)} ${Y(-34)} Q ${X(-14)} ${Y(-52)} ${x} ${Y(-52)} Q ${X(14)} ${Y(-52)} ${X(14)} ${Y(-34)}" fill="none" stroke="${INK}" stroke-width="${r1(7 * s)}" stroke-linecap="round"/>`
      + `<path d="M ${X(-14)} ${Y(-34)} Q ${X(-14)} ${Y(-52)} ${x} ${Y(-52)} Q ${X(14)} ${Y(-52)} ${X(14)} ${Y(-34)}" fill="none" stroke="#5C6380" stroke-width="${r1(3.4 * s)}" stroke-linecap="round"/>`
      + paint(`M ${X(-30)} ${Y(-24)} Q ${X(-30)} ${Y(-36)} ${X(-18)} ${Y(-36)} L ${X(18)} ${Y(-36)} Q ${X(30)} ${Y(-36)} ${X(30)} ${Y(-24)} L ${X(30)} ${Y(6)} Q ${X(30)} ${Y(12)} ${X(24)} ${Y(12)} L ${X(-24)} ${Y(12)} Q ${X(-30)} ${Y(12)} ${X(-30)} ${Y(6)} Z`)
      + paint(`M ${X(-28)} ${Y(-26)} Q ${X(-28)} ${Y(-34)} ${X(-18)} ${Y(-34)} L ${X(18)} ${Y(-34)} Q ${X(28)} ${Y(-34)} ${X(28)} ${Y(-26)} L ${X(28)} ${Y(-14)} Q ${x} ${Y(-6)} ${X(-28)} ${Y(-14)} Z`, F)
      + paint(`M ${X(-14)} ${Y(-2)} H ${X(14)} V ${Y(8)} H ${X(-14)} Z`, F)
      + `<rect x="${X(-4)}" y="${Y(-15)}" width="${r1(8 * s)}" height="${r1(7 * s)}" rx="${r1(1.5 * s)}" fill="#C9CFDA" ${ink(F * 0.8)}/>`
      + shade(`M ${X(16)} ${Y(-36)} L ${X(18)} ${Y(-36)} Q ${X(30)} ${Y(-36)} ${X(30)} ${Y(-24)} L ${X(30)} ${Y(6)} Q ${X(30)} ${Y(12)} ${X(24)} ${Y(12)} L ${X(16)} ${Y(12)} Z`, 0.14)
      + shine(`M ${X(-24)} ${Y(-28)} Q ${X(-22)} ${Y(-33)} ${X(-14)} ${Y(-33)} Q ${X(-20)} ${Y(-30)} ${X(-21)} ${Y(-24)} Z`, 0.5));
}

/** Lapiz. @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [tilt] */
export function pencil(id, x, y, s, tilt = 0) {
  const X = (/** @type {number} */ v) => r1(x + v * s);
  const Y = (/** @type {number} */ v) => r1(y + v * s);
  return paintable(id,
    solid(`M ${X(-42)} ${Y(-6)} Q ${X(-46)} ${Y(-6)} ${X(-46)} ${Y(-2)} V ${Y(2)} Q ${X(-46)} ${Y(6)} ${X(-42)} ${Y(6)} H ${X(-38)} V ${Y(-6)} Z`, '#FF9EB5', F)
    + solid(`M ${X(-38)} ${Y(-7)} H ${X(-32)} V ${Y(7)} H ${X(-38)} Z`, '#C9CFDA', F)
    + paint(`M ${X(-32)} ${Y(-7)} H ${X(22)} V ${Y(7)} H ${X(-32)} Z`)
    + line(`M ${X(-30)} ${Y(-2.3)} H ${X(20)} M ${X(-30)} ${Y(2.3)} H ${X(20)}`, 1.3, '#00000033')
    + solid(`M ${X(22)} ${Y(-7)} L ${X(36)} ${y} L ${X(22)} ${Y(7)} Z`, '#F1C98E', F)
    + solid(`M ${X(31.5)} ${Y(-2.2)} L ${X(36)} ${y} L ${X(31.5)} ${Y(2.2)} Z`, '#3E3B4A', 0)
    + shade(`M ${X(-32)} ${Y(2.6)} H ${X(22)} V ${Y(7)} H ${X(-32)} Z`, 0.15),
  `rotate(${tilt} ${x} ${y})`);
}

/** Taza. @param {string} id @param {number} x @param {number} y @param {number} s */
export function cup(id, x, y, s) {
  const X = (/** @type {number} */ v) => r1(x + v * s);
  const Y = (/** @type {number} */ v) => r1(y + v * s);
  return floorShadow(x, y, r1(19 * s))
    + paintable(id,
      paint(`M ${X(16)} ${Y(-25)} A ${r1(10 * s)} ${r1(10 * s)} 0 0 1 ${X(16)} ${Y(-5)} L ${X(16)} ${Y(-10)} A ${r1(5.6 * s)} ${r1(5.6 * s)} 0 0 0 ${X(16)} ${Y(-20)} Z`, F + 0.6)
      + paint(`M ${X(-20)} ${Y(-30)} H ${X(20)} L ${X(15)} ${Y(-2)} Q ${X(14)} ${y} ${X(11)} ${y} H ${X(-11)} Q ${X(-14)} ${y} ${X(-15)} ${Y(-2)} Z`)
      + `<ellipse cx="${x}" cy="${Y(-30)}" rx="${r1(20 * s)}" ry="${r1(5 * s)}" fill="#F3EEE6" ${ink(F)}/>`
      + `<ellipse cx="${x}" cy="${Y(-29.4)}" rx="${r1(15 * s)}" ry="${r1(3.2 * s)}" fill="#A86A3E"/>`
      + shade(`M ${X(7)} ${Y(-28)} H ${X(19.6)} L ${X(15)} ${Y(-2)} Q ${X(14)} ${y} ${X(11)} ${y} H ${X(6)} Z`, 0.14)
      + shine(`M ${X(-15)} ${Y(-24)} H ${X(-11)} L ${X(-12)} ${Y(-8)} H ${X(-14)} Z`, 0.55));
}

/** Manzana. @param {string} id @param {number} x @param {number} y @param {number} s */
export function apple(id, x, y, s) {
  const X = (/** @type {number} */ v) => r1(x + v * s);
  const Y = (/** @type {number} */ v) => r1(y + v * s);
  return paintable(id,
    line(`M ${x} ${Y(-18)} Q ${X(1)} ${Y(-26)} ${X(4)} ${Y(-31)}`, r1(3.6 * s), '#6A4122')
    + paint(`M ${x} ${Y(-17)} Q ${X(-8)} ${Y(-24)} ${X(-16)} ${Y(-18)} Q ${X(-24)} ${Y(-10)} ${X(-20)} ${Y(6)} Q ${X(-14)} ${Y(22)} ${X(-4)} ${Y(20)} Q ${x} ${Y(18)} ${X(4)} ${Y(20)} Q ${X(14)} ${Y(22)} ${X(20)} ${Y(6)} Q ${X(24)} ${Y(-10)} ${X(16)} ${Y(-18)} Q ${X(8)} ${Y(-24)} ${x} ${Y(-17)} Z`)
    + solid(`M ${X(2)} ${Y(-26)} Q ${X(13)} ${Y(-34)} ${X(19)} ${Y(-26)} Q ${X(10)} ${Y(-21)} ${X(2)} ${Y(-26)} Z`, '#4FAE5C', F)
    + shade(`M ${X(10)} ${Y(-19)} Q ${X(24)} ${Y(-12)} ${X(20)} ${Y(6)} Q ${X(14)} ${Y(22)} ${X(4)} ${Y(20)} Q ${X(16)} ${Y(4)} ${X(10)} ${Y(-19)} Z`, 0.14)
    + shine(`M ${X(-14)} ${Y(-8)} Q ${X(-13)} ${Y(-16)} ${X(-6)} ${Y(-17)} Q ${X(-11)} ${Y(-12)} ${X(-11)} ${Y(-5)} Z`, 0.55));
}

/** Gato tumbado (flip -1 mira a la izquierda). @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [flip] */
export function cat(id, x, y, s, flip = 1) {
  return paintable(id,
    paint('M -28 -2 Q -48 -6 -42 -30 Q -38 -34 -35 -30 Q -40 -12 -24 -8 Z', F)
    + paint('M -30 0 Q -30 -19 -8 -19 L 10 -19 Q 30 -19 30 0 Q 30 19 8 19 L -8 19 Q -30 19 -30 0 Z')
    + shade('M -29 6 Q 0 20 29 5 Q 26 19 8 19 L -8 19 Q -26 19 -29 6 Z', 0.13)
    + line('M -14 -18 q 3 6 0 11 M -4 -19 q 3 6 0 11 M 6 -18 q 3 6 0 11', F, '#00000044')
    + paint('M 12 -31 L 15 -46 L 25 -33 Z', F)
    + paint('M 31 -33 L 39 -46 L 41 -30 Z', F)
    + solid('M 15.2 -33 L 16.4 -41 L 21.6 -34 Z', '#FFB3C4', 0)
    + solid('M 33 -33 L 37.6 -40.6 L 38.6 -32 Z', '#FFB3C4', 0)
    + paint(ring(24, -20, 16))
    + `<ellipse cx="24.6" cy="-13" rx="7" ry="4.6" fill="#FFFFFF" fill-opacity="0.7"/>`
    + `<ellipse cx="18.6" cy="-21.6" rx="2.4" ry="3.2" fill="${INK}"/><ellipse cx="29.6" cy="-21.6" rx="2.4" ry="3.2" fill="${INK}"/>`
    + '<circle cx="17.8" cy="-22.8" r="0.9" fill="#FFFFFF"/><circle cx="28.8" cy="-22.8" r="0.9" fill="#FFFFFF"/>'
    + solid('M 22.4 -16.4 h 4.4 l -2.2 2.4 Z', '#F27C95', 1.4)
    + line('M 24.6 -14 q -1.2 2.4 -3.6 1.6 M 24.6 -14 q 1.2 2.4 3.6 1.6', 1.6)
    + line('M 16 -13.6 l -10 -1.6 M 16 -11.4 l -9.4 1.6 M 33 -13.6 l 10 -1.6 M 33 -11.4 l 9.4 1.6', 1.2),
  `translate(${x} ${y}) scale(${flip * s} ${s})`);
}

/** Osito de peluche. @param {string} id @param {number} x @param {number} y @param {number} s */
export function teddy(id, x, y, s) {
  return paintable(id,
    paint(ring(-14, -44, 8), F + 0.6) + paint(ring(14, -44, 8), F + 0.6)
    + solid('M -14 -48 a 4 4 0 1 0 0.1 0 Z', '#F6E2C4', 0) + solid('M 14 -48 a 4 4 0 1 0 0.1 0 Z', '#F6E2C4', 0)
    + paint('M -26 -8 Q -34 -4 -30 6 Q -26 10 -20 4 Z', F)
    + paint('M 26 -8 Q 34 -4 30 6 Q 26 10 20 4 Z', F)
    + paint('M -14 14 Q -24 16 -22 24 Q -16 28 -8 22 Z', F)
    + paint('M 14 14 Q 24 16 22 24 Q 16 28 8 22 Z', F)
    + paint('M -20 0 Q -20 -22 0 -22 Q 20 -22 20 0 Q 20 22 0 22 Q -20 22 -20 0 Z')
    + `<ellipse cx="0" cy="4" rx="10" ry="11" fill="#FFFFFF" fill-opacity="0.55"/>`
    + paint(ring(0, -32, 17))
    + `<ellipse cx="0" cy="-26" rx="7.6" ry="5.4" fill="#F6E2C4" ${ink(F * 0.8)}/>`
    + `<ellipse cx="0" cy="-28" rx="2.8" ry="2" fill="${INK}"/>`
    + line('M 0 -26 v 2.6 M -2.6 -22.4 q 2.6 2 5.2 0', 1.4)
    + `<circle cx="-6.4" cy="-36" r="2.4" fill="${INK}"/><circle cx="6.4" cy="-36" r="2.4" fill="${INK}"/>`
    + '<circle cx="-7.1" cy="-36.8" r="0.8" fill="#FFFFFF"/><circle cx="5.7" cy="-36.8" r="0.8" fill="#FFFFFF"/>'
    + shade('M 8 -46 A 17 17 0 0 1 8 -18 Q 18 -32 8 -46 Z', 0.12),
  `translate(${x} ${y}) scale(${s})`);
}

/** Calcetin. @param {string} id @param {number} x @param {number} y @param {number} s @param {number} [rot] */
export function sock(id, x, y, s, rot = 0) {
  return paintable(id,
    paint('M -10 -34 h 20 v 26 q 0 10 10 10 h 12 q 8 0 8 8 q 0 8 -8 8 h -26 q -16 0 -16 -16 Z')
    + line('M -10 -27 H 10 M -6 -34 V -27 M -1 -34 V -27 M 4 -34 V -27', 2, INK)
    + shade('M 22 -2 q 8 0 8 8 q 0 8 -8 8 h -6 q 6 -8 0 -16 Z', 0.16)
    + shade('M -10 -4 q 0 16 16 16 h 2 q -12 -6 -12 -16 Z', 0.12)
    + shine('M -6 -20 h 3 v 14 h -3 Z', 0.45),
  `translate(${x} ${y}) rotate(${rot}) scale(${s})`);
}
