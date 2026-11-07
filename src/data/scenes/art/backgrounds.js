// @ts-check
// Los fondos de las vinetas (200 x 150): cielo, hierba, playa, lago,
// habitacion... pintados como un paisaje de verdad: el cielo mas palido y
// brumoso en el horizonte, las colinas lejanas azuladas y desenfocadas por la
// distancia, la hierba con su textura (vetas de ruido), manchas de luz y
// briznas que crecen hacia delante, el agua con el cielo reflejado y ondas que
// se apretan a lo lejos, la arena con grano y la orilla mojada, la pared con
// la luz de la ventana y el suelo de tablas con vetas y brillo. El suelo de
// cada uno esta a la misma altura que en el dibujo anterior, porque las escenas
// colocan sus piezas sobre el.
//
// Cada fondo es una funcion que recibe un prefijo unico para sus degradados
// (en una pantalla puede haber varias vinetas a la vez: Tell the story tiene
// cuatro) y se pinta dentro de withDefs, que trae los filtros (fx).
//
// A proposito no hay nubes, ni sol, ni arboles, ni flores de adorno: las
// preguntas hablan de lo que hay en el dibujo ("the cloud is grey", "it is
// sunny", "how many flowers") y un adorno cambiaria la respuesta.

import { INK, FINE, stroke, seeded } from './style.js';
import { fx, uid } from './defs.js';

/** @param {number} n */
const f = (n) => Math.round(n * 100) / 100;

/**
 * Un degradado vertical con varias paradas [posicion, color, opacidad?].
 * @param {string} id @param {[number, string, number?][]} stops
 */
const gradient = (id, stops) => `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a === undefined ? '' : ` stop-opacity="${a}"`}/>`).join('')}</linearGradient>`;

/** Una mancha de luz o de sombra pintada con pincel blando. @param {string} d @param {string} colour @param {number} opacity @param {string} [blur] */
const soft = (d, colour, opacity, blur = 'blur2') => `<path d="${d}" fill="${colour}" fill-opacity="${opacity}" filter="${fx(blur)}"/>`;

/** Una elipse blanda. @param {number} cx @param {number} cy @param {number} rx @param {number} ry @param {string} colour @param {number} opacity */
const blot = (cx, cy, rx, ry, colour, opacity) => `<ellipse cx="${f(cx)}" cy="${f(cy)}" rx="${f(rx)}" ry="${f(ry)}" fill="${colour}" fill-opacity="${opacity}" filter="${fx('blur2')}"/>`;

/**
 * Textura de ruido dentro de una forma: el filtro solo deja ver el ruido donde
 * esta la forma.
 * @param {string} d @param {string} colour @param {number} opacity @param {string} kind grain, grain2 o grassy
 */
const texture = (d, colour, opacity, kind) => `<path d="${d}" fill="${colour}" fill-opacity="${opacity}" filter="${fx(kind)}"/>`;

/**
 * Cielo de dia: azul hondo arriba, palido en el horizonte, con la bruma de la
 * distancia justo encima de la tierra.
 * @param {string} id @param {number} [horizon]
 */
const sky = (id, horizon = 100) => `<defs>${gradient(`${id}-bg-sky`, [[0, '#5EA4E0'], [f((horizon / 150) * 0.55), '#A2D0F4'], [f((horizon / 150) * 0.92), '#DAEEFB'], [1, '#F2FAFF']])}`
  + `<radialGradient id="${id}-bg-sunside" cx="0.08" cy="0" r="0.95"><stop offset="0" stop-color="#FFFFFF" stop-opacity="0.38"/><stop offset="0.45" stop-color="#FFFFFF" stop-opacity="0.1"/><stop offset="1" stop-color="#FFFFFF" stop-opacity="0"/></radialGradient></defs>`
  + `<rect width="200" height="150" fill="url(#${id}-bg-sky)"/>`
  // El lado del sol (arriba a la izquierda, de donde viene la luz) brilla mas.
  + `<rect width="200" height="${f(horizon)}" fill="url(#${id}-bg-sunside)"/>`
  + `<rect x="-10" y="${f(horizon - 16)}" width="220" height="18" fill="#FFFFFF" fill-opacity="0.38" filter="${fx('haze')}"/>`;

/**
 * Colinas lejanas: azuladas, palidas y desenfocadas por la distancia, con sus
 * campos de distintos verdes, la luz arriba y la bruma abajo.
 * @param {string} d @param {string} colour
 */
function hills(d, colour) {
  // Campos de distintos verdes, como en un paisaje de verdad, dentro de la colina.
  const ys = [...d.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)].map((m) => Number(m[2]));
  const [top, bottom] = [Math.min(...ys), Math.max(...ys)];
  const rnd = seeded(Math.round(top * 7 + bottom));
  let fields = '';
  for (let i = 0; i < 7; i += 1) {
    const tones = ['#CFE3A8', '#8DB78C', '#B9D6A2', '#A7C98F'];
    fields += `<ellipse cx="${f(rnd() * 200)}" cy="${f(top + 3 + rnd() * (bottom - top - 4))}" rx="${f(16 + rnd() * 26)}" ry="${f(1.6 + rnd() * 2.2)}" fill="${tones[i % tones.length]}" fill-opacity="0.4"/>`;
  }
  const id = uid('hl');
  return `<path d="${d}" fill="${colour}" filter="${fx('blur')}"/>`
    + `<clipPath id="${id}"><path d="${d}"/></clipPath><g clip-path="url(#${id})" filter="${fx('blur')}">${fields}</g>`
    + `<path d="${d}" fill="#E8F3FF" fill-opacity="0.3"/>`
    + texture(d, '#4E7F58', 0.12, 'grain2');
}

/**
 * Hierba: degradado (mas clara y azulada a lo lejos, mas honda delante),
 * textura de vetas, manchas de luz y de sombra que dan ondulacion, el borde
 * lejano brumoso y briznas que crecen hacia delante en tres tonos.
 * @param {string} id @param {string} d @param {number} top altura del borde
 * @param {number} [seed]
 */
function grass(id, d, top, seed = 1) {
  const rnd = seeded(seed * 97 + Math.round(top));
  let dark = '';
  let mid = '';
  let light = '';
  for (let i = 0; i < 230; i += 1) {
    const x = rnd() * 200;
    const t = rnd();
    const y = top + 4 + t * t * (150 - top - 3);
    const h = 0.8 + t * t * 4.2;
    const lean = (rnd() - 0.5) * (0.6 + t * 1.4);
    const blade = `M ${f(x)} ${f(y)} q ${f(lean * 0.4)} ${f(-h * 0.6)} ${f(lean)} ${f(-h)} `;
    const k = rnd();
    if (k < 0.42) dark += blade; else if (k < 0.8) mid += blade; else light += blade;
  }
  let patches = '';
  for (let i = 0; i < 9; i += 1) {
    const x = rnd() * 200;
    const y = top + 6 + rnd() * (150 - top - 8);
    const near = (y - top) / (150 - top);
    patches += blot(x, y, 14 + rnd() * 22, 1.6 + near * 4, rnd() < 0.5 ? '#3F7E2E' : '#D8F2B4', 0.22);
  }
  const edge = d.replace(/L200 150 Z$/, '').replace(/^M0 150 L/, 'M');
  return `<defs>${gradient(`${id}-bg-grass`, [[0, '#B9DE98'], [0.3, '#9CCD74'], [0.7, '#7DB95A'], [1, '#5A9A40']])}</defs>`
    + `<path d="${d}" fill="url(#${id}-bg-grass)"/>`
    + texture(d, '#2F6A22', 0.4, 'grassy')
    + texture(d, '#E6F7C8', 0.18, 'grain2')
    + patches
    + `<path d="${edge}" fill="none" stroke="#E2F2CF" stroke-width="2.4" stroke-opacity="0.5" filter="${fx('blur')}"/>`
    + stroke(dark, 0.32, '#4D8C36') + stroke(mid, 0.28, '#6FAA50') + stroke(light, 0.26, '#D2EEAE')
    + nearBlades(seed);
}

/**
 * Las briznas mas cercanas a la camara, abajo del todo: grandes y
 * desenfocadas, como en una foto con la profundidad de campo corta. Van
 * detras de las piezas (son parte del fondo), asi que no tapan nada.
 * @param {number} seed
 */
function nearBlades(seed) {
  const rnd = seeded(seed * 53 + 7);
  let dark = '';
  let mid = '';
  for (let i = 0; i < 26; i += 1) {
    const x = rnd() * 204 - 2;
    const h = 5 + rnd() * 8;
    const lean = (rnd() - 0.5) * 5;
    const w = 0.9 + rnd() * 0.9;
    const blade = `M ${f(x - w)} 151 Q ${f(x + lean * 0.4)} ${f(151 - h * 0.6)} ${f(x + lean)} ${f(151 - h)} Q ${f(x + lean * 0.4 + w * 0.3)} ${f(151 - h * 0.55)} ${f(x + w)} 151 Z `;
    if (rnd() < 0.6) dark += blade; else mid += blade;
  }
  return `<g filter="${fx('blur')}"><path d="${dark}" fill="#3E7A2C" fill-opacity="0.75"/><path d="${mid}" fill="#7DB65A" fill-opacity="0.7"/></g>`;
}

/**
 * Agua: el cielo reflejado (claro a lo lejos, hondo delante), la orilla de
 * enfrente reflejada boca abajo, bandas de reflejo, ondas finas que se
 * aprietan con la distancia y destellos.
 * @param {string} id @param {number} y @param {number} h
 * @param {string} [mirror] lo que se refleja (la orilla de enfrente), dibujado al derecho
 */
function water(id, y, h, mirror = '') {
  const rnd = seeded(Math.round(y * 13 + h));
  let lights = '';
  let darks = '';
  let glints = '';
  for (let i = 0; i < 70; i += 1) {
    const t = rnd();
    const yy = y + 1 + t * t * (h - 2);
    const w = 2 + t * 10 + rnd() * 4;
    const x = rnd() * (200 - w);
    const line = `M ${f(x)} ${f(yy)} q ${f(w / 2)} ${f(-0.25 - t * 0.5)} ${f(w)} 0 `;
    if (rnd() < 0.55) lights += line; else darks += `M ${f(x)} ${f(yy + 0.5 + t * 0.6)} h ${f(w * 0.8)} `;
    if (i % 9 === 0) glints += `M ${f(x + w * 0.3)} ${f(yy - 0.2)} h ${f(0.6 + t * 1.4)} `;
  }
  return `<defs>${gradient(`${id}-bg-water`, [[0, '#A6DCF4'], [0.25, '#6EBDE6'], [0.7, '#3E93CC'], [1, '#2876AE']])}</defs>`
    + `<rect y="${y}" width="200" height="${h}" fill="url(#${id}-bg-water)"/>`
    + (mirror ? reflected(mirror, y, h) : '')
    + `<rect x="-10" y="${y}" width="220" height="${f(Math.min(8, h / 4))}" fill="#FFFFFF" fill-opacity="0.32" filter="${fx('blur2')}"/>`
    + blot(60, y + h * 0.45, 50, 2.4, '#FFFFFF', 0.12) + blot(150, y + h * 0.7, 40, 3, '#FFFFFF', 0.1)
    + `<path d="${darks}" fill="none" stroke="#1C5684" stroke-opacity="0.28" stroke-width="0.35" stroke-linecap="round"/>`
    + `<path d="${lights}" fill="none" stroke="#F4FBFF" stroke-opacity="0.55" stroke-width="0.32" stroke-linecap="round"/>`
    + `<path d="${glints}" fill="none" stroke="#FFFFFF" stroke-width="0.6" stroke-linecap="round"/>`;
}

/**
 * Lo que hay en la orilla de enfrente, reflejado en el agua: boca abajo desde
 * la linea del agua, borroso, mas oscuro y solo dentro del agua.
 * @param {string} mirror @param {number} y la linea del agua @param {number} h
 */
function reflected(mirror, y, h) {
  const id = uid('wb');
  return `<clipPath id="${id}"><rect y="${y}" width="200" height="${h}"/></clipPath>`
    + `<g clip-path="url(#${id})"><g transform="translate(0 ${f(2 * y + 1.2)}) scale(1 -1)" opacity="0.55" filter="${fx('blur2')}">${mirror}</g>`
    + `<rect y="${y}" width="200" height="${f(h * 0.45)}" fill="#1E5A86" fill-opacity="0.12"/></g>`;
}

/**
 * Donde se ve el agua en cada fondo que la tiene (lo que flota se refleja
 * solo ahi).
 * @type {Record<string, string>}
 */
export const WATER = {
  lake: 'M0 88 H200 V136 Q 100 130 0 138 Z',
  riverside: 'M0 88 H200 V136 Q 100 130 0 138 Z',
};

/** Arena con grano, ondas suaves que deja el viento y la luz. @param {string} id @param {string} d @param {number} top */
function sand(id, d, top) {
  const rnd = seeded(41);
  let grains = '';
  for (let i = 0; i < 70; i += 1) {
    const x = rnd() * 200;
    const y = top + 3 + rnd() * (150 - top - 3);
    grains += `<circle cx="${f(x)}" cy="${f(y)}" r="${f(0.18 + rnd() * 0.3)}" fill="${rnd() < 0.6 ? '#B98E4A' : '#FFF6DE'}" fill-opacity="0.7"/>`;
  }
  let ripples = '';
  for (let i = 0; i < 9; i += 1) {
    const x = rnd() * 170;
    const y = top + 10 + rnd() * (150 - top - 14);
    ripples += `M ${f(x)} ${f(y)} q 8 -1.4 16 0 q 8 1.4 16 0 `;
  }
  return `<defs>${gradient(`${id}-bg-sand`, [[0, '#F3DDA6'], [0.5, '#EED196'], [1, '#E2BE7C']])}</defs>`
    + `<path d="${d}" fill="url(#${id}-bg-sand)"/>`
    + texture(d, '#8A6428', 0.4, 'grain')
    + texture(d, '#FFF8E4', 0.35, 'grain2')
    + `<path d="${ripples}" fill="none" stroke="#C49A55" stroke-opacity="0.5" stroke-width="0.8" filter="${fx('blur')}"/>`
    + `<path d="${ripples}" fill="none" stroke="#FFF4D8" stroke-opacity="0.5" stroke-width="0.4" transform="translate(0 -0.7)"/>`
    + blot(150, 128, 40, 8, '#FFFFFF', 0.14)
    + grains;
}

/** @type {Record<string, (id: string) => string>} */
export const BACKGROUNDS = {
  room: (id) => {
    const rnd = seeded(5);
    let boards = '';
    let grain = '';
    let planks = '';
    for (const [y0, y1] of [[120, 129], [129, 139], [139, 150]]) {
      boards += `M 0 ${y1} H 200 `;
      let x = -rnd() * 40;
      while (x < 200) {
        const w = 44 + rnd() * 30;
        planks += `<rect x="${f(x)}" y="${y0}" width="${f(w)}" height="${y1 - y0}" fill="${rnd() < 0.5 ? '#7A4A22' : '#F2C48C'}" fill-opacity="${f(0.06 + rnd() * 0.1)}"/>`;
        for (let k = 0; k < 3; k += 1) {
          const gy = y0 + (y1 - y0) * (0.25 + k * 0.25) + (rnd() - 0.5);
          grain += `M ${f(x + 3 + rnd() * 6)} ${f(gy)} q ${f(w * 0.25)} ${f(-0.6 + rnd() * 1.2)} ${f(w * 0.5)} ${f(rnd() - 0.5)} t ${f(w * 0.35)} ${f(rnd() - 0.5)} `;
        }
        x += w;
        if (x < 200) boards += `M ${f(x)} ${y0} V ${y1} `;
      }
    }
    let paper = '';
    for (let x = 8; x < 200; x += 16) paper += `M ${x} 0 V 113 `;
    return `<defs>${gradient(`${id}-bg-wall`, [[0, '#FBEBCB'], [1, '#F1D9AC']])}${gradient(`${id}-bg-pane`, [[0, '#7EC0EE'], [0.7, '#CDE9FB'], [1, '#EEF8FF']])}${gradient(`${id}-bg-floor`, [[0, '#B98048'], [1, '#93602E']])}`
      + `<radialGradient id="${id}-bg-glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#FFF8E8" stop-opacity="0.55"/><stop offset="0.6" stop-color="#FFF8E8" stop-opacity="0.2"/><stop offset="1" stop-color="#FFF8E8" stop-opacity="0"/></radialGradient></defs>`
      + `<rect width="200" height="150" fill="url(#${id}-bg-wall)"/>`
      + `<path d="${paper}" stroke="#E9CB98" stroke-width="3" stroke-opacity="0.35"/>`
      + texture('M 0 0 H 200 V 120 H 0 Z', '#A07A40', 0.18, 'grain')
      // La luz de la ventana en la pared y las esquinas en penumbra.
      + `<ellipse cx="146" cy="46" rx="84" ry="62" fill="url(#${id}-bg-glow)"/>`
      + `<rect x="-10" y="-10" width="40" height="140" fill="#6A4A20" fill-opacity="0.1" filter="${fx('haze')}"/>`
      // Ventana: marco, cristal con el cielo, reflejos, sombra y alfeizar.
      + soft('M 113 14 H 183 V 69 H 113 Z', '#3A2A10', 0.18)
      + `<rect x="112" y="12" width="68" height="54" rx="2" fill="#FFFFFF" stroke="#B7A27E" stroke-width="${FINE}"/>`
      + `<rect x="118" y="18" width="56" height="42" fill="url(#${id}-bg-pane)" stroke="#9C8A6A" stroke-width="${FINE}"/>`
      + '<path d="M 124 54 L 140 22 L 146 22 L 130 54 Z M 152 54 L 160 38 L 163 38 L 155 54 Z" fill="#FFFFFF" fill-opacity="0.45"/>'
      + `<path d="M 146 18 V 60 M 118 39 H 174" stroke="#FFFFFF" stroke-width="2.4"/><path d="M 146 18 V 60 M 118 39 H 174" stroke="#9C8A6A" stroke-width="0.35" fill="none"/>`
      + '<path d="M 118 18 L 174 18 L 172 20 L 120 20 Z" fill="#0E1230" fill-opacity="0.12"/>'
      + `<rect x="108" y="64" width="76" height="5" rx="1.5" fill="#FFFFFF" stroke="#B7A27E" stroke-width="${FINE}"/>`
      + soft('M 110 69 H 182 V 73 H 110 Z', '#3A2A10', 0.16, 'blur')
      // Zocalo y suelo de tablas con vetas, la sombra junto a la pared y la luz de la ventana.
      + `<rect y="112.6" width="200" height="7.4" fill="#FFFDF6" stroke="#C9B48E" stroke-width="${FINE}"/>`
      + '<rect y="112.6" width="200" height="1.2" fill="#FFFFFF" fill-opacity="0.7"/>'
      + `<rect y="120" width="200" height="30" fill="url(#${id}-bg-floor)"/>`
      + planks
      + texture('M 0 120 H 200 V 150 H 0 Z', '#4A2A10', 0.3, 'grain')
      + `<path d="${grain}" fill="none" stroke="#6E431C" stroke-opacity="0.35" stroke-width="0.22"/>`
      + `<path d="${boards}" stroke="#5E3A18" stroke-opacity="0.75" stroke-width="0.5"/>`
      + soft('M 112 121 L 182 121 L 196 150 L 120 150 Z', '#FFF0CC', 0.24)
      + soft('M 0 120 H 200 V 124 H 0 Z', '#2A1606', 0.3, 'blur')
      + `<line x1="0" y1="120" x2="200" y2="120" stroke="${INK}" stroke-width="0.4" stroke-opacity="0.45"/>`;
  },

  garden: (id) => sky(id, 96)
    + hills('M0 110 L0 96 Q 50 86 100 92 Q 150 98 200 90 L200 110 Z', '#A6CFA0')
    + grass(id, 'M0 150 L0 104 Q 100 94 200 102 L200 150 Z', 98, 1),

  beach: (id) => {
    const foam = 'M0 99.4 Q 25 96.6 50 98.6 Q 75 100.4 100 97.6 Q 125 95.6 150 98.4 Q 175 100.6 200 98.2';
    return sky(id, 62)
      + water(id, 62, 42)
      + `<rect x="-10" y="60.6" width="220" height="2.4" fill="#FFFFFF" fill-opacity="0.5" filter="${fx('blur')}"/>`
      + '<path d="M0 104 L0 99 Q 100 89 200 98 L200 104 Z" fill="#C9A564"/>'
      + sand(id, 'M0 150 L0 100 Q 100 92 200 100 L200 150 Z', 96)
      // Arena mojada (mas oscura y brillante) y la espuma de la ola.
      + soft('M0 100 Q 100 92 200 100 L200 105 Q 100 97 0 105 Z', '#8E6A30', 0.35, 'blur')
      + soft('M0 101 Q 100 93 200 101 L200 102.4 Q 100 94.4 0 102.4 Z', '#FFFFFF', 0.3, 'blur')
      + `<path d="${foam}" fill="none" stroke="#FFFFFF" stroke-width="2.4" stroke-opacity="0.55" stroke-linecap="round" filter="${fx('blur')}"/>`
      + `<path d="${foam}" fill="none" stroke="#FFFFFF" stroke-width="0.9" stroke-opacity="0.9" stroke-linecap="round"/>`
      + `<path d="${foam}" fill="none" stroke="#FFFFFF" stroke-width="0.5" stroke-opacity="0.8" stroke-dasharray="0.6 1.8" transform="translate(0 1.4)"/>`;
  },

  fair: (id) => {
    const colours = ['#E5483B', '#FFC93C', '#2F80ED', '#3DAA5C', '#F5862B', '#8E55D0'];
    let flags = '';
    for (let i = 0; i < 13; i += 1) {
      const x = 4 + i * 15.6;
      const y = 12 + Math.sin((i / 12) * Math.PI) * 9;
      const c = colours[i % colours.length];
      flags += `<path d="M ${f(x)} ${f(y)} l 7 0.4 l -3.2 7.4 Z" fill="${c}" stroke="#0E1230" stroke-opacity="0.25" stroke-width="0.25" stroke-linejoin="round"/>`
        + `<path d="M ${f(x)} ${f(y)} l 3.4 0.2 l -1.6 7.2 Z" fill="#FFFFFF" fill-opacity="0.22"/>`
        + `<path d="M ${f(x + 3.6)} ${f(y + 0.3)} l 3.4 0.1 l -3.2 7.3 Z" fill="#0E1230" fill-opacity="0.12"/>`;
    }
    return sky(id, 102)
      + hills('M0 112 L0 102 Q 60 92 120 100 Q 160 104 200 96 L200 112 Z', '#AED3A0')
      + '<path d="M 0 12 Q 100 30 200 12" fill="none" stroke="#4B4F66" stroke-width="0.45"/>'
      + flags
      + grass(id, 'M0 150 L0 108 Q 100 100 200 106 L200 150 Z', 102, 2);
  },

  field: (id) => sky(id, 94)
    + hills('M0 104 L0 94 Q 60 84 120 92 Q 160 96 200 88 L200 104 Z', '#B2D6A2')
    + '<path d="M0 150 L0 100 Q 100 90 200 98 L200 150 Z" fill="#C3E3A0"/>'
    + texture('M0 150 L0 100 Q 100 90 200 98 L200 150 Z', '#5E9A40', 0.25, 'grassy')
    + `<path d="M 0 108 Q 100 99 200 106 M 0 114 Q 100 106 200 112" fill="none" stroke="#9CCB78" stroke-width="1.4" stroke-opacity="0.6" filter="${fx('blur')}"/>`
    + `<path d="M0 100 Q 100 90 200 98" fill="none" stroke="#E6F4D4" stroke-width="2" stroke-opacity="0.5" filter="${fx('blur')}"/>`
    + grass(id, 'M0 150 L0 124 Q 100 116 200 122 L200 150 Z', 118, 3),

  lake: (id) => sky(id, 76)
    + hills('M0 82 L0 72 Q 50 62 110 70 Q 160 74 200 66 L200 82 Z', '#B2D3B0')
    + '<path d="M0 78 Q 100 66 200 76 L200 90 L0 90 Z" fill="#94C980"/>'
    + texture('M0 78 Q 100 66 200 76 L200 90 L0 90 Z', '#3F7A2C', 0.3, 'grassy')
    + water(id, 88, 62, '<path d="M0 82 L0 72 Q 50 62 110 70 Q 160 74 200 66 L200 82 Z" fill="#9CC09A"/><path d="M0 78 Q 100 66 200 76 L200 90 L0 90 Z" fill="#6E9E58"/>')
    + soft('M0 88 Q 100 86.6 200 88 L200 92 Q 100 90.4 0 92 Z', '#2E5A22', 0.3, 'blur')
    + grass(id, 'M0 150 L0 138 Q 100 130 200 136 L200 150 Z', 132, 4),

  riverside: (id) => sky(id, 76)
    + hills('M0 82 L0 72 Q 60 64 120 70 Q 170 74 200 68 L200 82 Z', '#B2D3B0')
    + '<path d="M0 78 Q 100 66 200 76 L200 90 L0 90 Z" fill="#94C980"/>'
    + texture('M0 78 Q 100 66 200 76 L200 90 L0 90 Z', '#3F7A2C', 0.3, 'grassy')
    + water(id, 88, 62, '<path d="M0 82 L0 72 Q 60 64 120 70 Q 170 74 200 68 L200 82 Z" fill="#9CC09A"/><path d="M0 78 Q 100 66 200 76 L200 90 L0 90 Z" fill="#6E9E58"/>')
    + soft('M0 88 Q 100 86.6 200 88 L200 92 Q 100 90.4 0 92 Z', '#2E5A22', 0.3, 'blur')
    // La corriente del rio: remolinos de luz que van hacia la derecha.
    + `<path d="M 18 104 q 10 -3 20 0 M 118 100 q 10 -3 20 0 M 66 124 q 10 -3 20 0 M 158 122 q 10 -3 20 0" fill="none" stroke="#FFFFFF" stroke-width="1.6" stroke-linecap="round" stroke-opacity="0.45" filter="${fx('blur')}"/>`
    + '<path d="M 18 104 q 10 -3 20 0 M 118 100 q 10 -3 20 0 M 66 124 q 10 -3 20 0 M 158 122 q 10 -3 20 0" fill="none" stroke="#FFFFFF" stroke-width="0.6" stroke-linecap="round" stroke-opacity="0.8"/>'
    + grass(id, 'M0 150 L0 138 Q 100 130 200 136 L200 150 Z', 132, 5),

  snow: (id) => {
    const rnd = seeded(17);
    let sparkle = '';
    for (let i = 0; i < 34; i += 1) sparkle += `<circle cx="${f(rnd() * 200)}" cy="${f(102 + rnd() * 46)}" r="${f(0.2 + rnd() * 0.35)}"/>`;
    const field = 'M0 150 L0 100 Q 100 90 200 98 L200 150 Z';
    return `<defs>${gradient(`${id}-bg-sky`, [[0, '#9DB8D8'], [0.6, '#D0DFEF'], [1, '#EEF4FA']])}${gradient(`${id}-bg-snow`, [[0, '#FFFFFF'], [0.6, '#EEF4FB'], [1, '#D2E0F0']])}</defs>`
      + `<rect width="200" height="150" fill="url(#${id}-bg-sky)"/>`
      + `<rect x="-10" y="80" width="220" height="18" fill="#FFFFFF" fill-opacity="0.45" filter="${fx('haze')}"/>`
      + `<path d="M0 110 L0 96 Q 50 86 100 92 Q 150 98 200 90 L200 110 Z" fill="#DCE6F2" filter="${fx('blur')}"/>`
      + '<path d="M0 110 L0 98 Q 50 90 100 95 Q 150 100 200 93 L200 110 Z" fill="#BFD0E6" fill-opacity="0.5"/>'
      + `<path d="${field}" fill="url(#${id}-bg-snow)"/>`
      + texture(field, '#8FA8C8', 0.18, 'grain')
      + `<path d="M0 100 Q 100 90 200 98" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-opacity="0.7" filter="${fx('blur')}"/>`
      // Ondulaciones de la nieve: la sombra azul de cada loma y su cresta al sol.
      + blot(34, 129, 20, 3, '#9DB4D4', 0.55) + blot(118, 139, 24, 3.2, '#9DB4D4', 0.5) + blot(178, 121, 14, 2.4, '#9DB4D4', 0.5) + blot(80, 112, 12, 2, '#9DB4D4', 0.45)
      + blot(36, 126.4, 14, 1.4, '#FFFFFF', 0.9) + blot(120, 136.4, 17, 1.5, '#FFFFFF', 0.9) + blot(176, 119.2, 10, 1.1, '#FFFFFF', 0.8)
      + `<g fill="#FFFFFF">${sparkle}</g>`;
  },

  incar: (id) => `<defs>${gradient(`${id}-bg-in`, [[0, '#E3E6EE'], [1, '#BEC5D3']])}${gradient(`${id}-bg-out`, [[0, '#7FB8E2'], [0.6, '#BFDDF2'], [1, '#D9ECF8']])}</defs>`
    + `<rect width="200" height="150" fill="url(#${id}-bg-in)"/>`
    + texture('M 0 0 H 200 V 112 H 0 Z', '#5A6070', 0.12, 'grain')
    + `<rect x="24" y="16" width="152" height="66" rx="8" fill="url(#${id}-bg-out)"/>`
    + `<path d="M 26 66 Q 70 52 112 60 Q 150 66 174 56 L 174 74 Q 174 80 168 80 L 32 80 Q 26 80 26 74 Z" fill="#94C47C" filter="${fx('blur')}"/>`
    + '<path d="M 26 70 Q 70 60 112 66 Q 150 70 174 62 L 174 74 Q 174 80 168 80 L 32 80 Q 26 80 26 74 Z" fill="#7FB264"/>'
    // La lluvia en el cristal: regueros finos y gotas con su brillo.
    + '<path d="M 52 24 L 44 74 M 98 24 L 90 74 M 144 24 L 136 74 M 74 28 L 70 50 M 120 30 L 116 52 M 164 28 L 160 48 M 36 30 L 33 48 M 108 44 L 105 62" stroke="#5F9CCB" stroke-opacity="0.75" stroke-width="1" stroke-linecap="round"/>'
    + '<path d="M 52 24 L 44 74 M 98 24 L 90 74 M 144 24 L 136 74 M 74 28 L 70 50 M 120 30 L 116 52 M 164 28 L 160 48 M 36 30 L 33 48 M 108 44 L 105 62" stroke="#FFFFFF" stroke-opacity="0.6" stroke-width="0.3" stroke-linecap="round" transform="translate(-0.4 0)"/>'
    + '<g fill="#FFFFFF" fill-opacity="0.75"><circle cx="60" cy="40" r="1.1"/><circle cx="84" cy="58" r="0.9"/><circle cx="132" cy="36" r="1"/><circle cx="154" cy="62" r="0.9"/><circle cx="40" cy="62" r="0.8"/></g>'
    + '<g fill="#3E6E96" fill-opacity="0.35"><circle cx="60.3" cy="40.5" r="0.7"/><circle cx="84.3" cy="58.4" r="0.55"/><circle cx="132.3" cy="36.4" r="0.6"/><circle cx="154.3" cy="62.4" r="0.55"/><circle cx="40.3" cy="62.4" r="0.5"/></g>'
    + soft('M 30 20 L 70 20 L 40 78 L 28 78 Z', '#FFFFFF', 0.2, 'blur')
    + `<rect x="24" y="16" width="152" height="66" rx="8" fill="none" stroke="#5C6478" stroke-width="0.8"/>`
    + `<rect x="18" y="10" width="164" height="78" rx="12" fill="none" stroke="#959EB3" stroke-width="4"/>`
    + `<rect x="18" y="10" width="164" height="78" rx="12" fill="none" stroke="#FFFFFF" stroke-width="0.6" stroke-opacity="0.6" transform="translate(-1 -1)"/>`
    + soft('M 16 88 H 184 V 92 H 16 Z', '#2A3040', 0.2, 'blur')
    + `<rect y="112" width="200" height="38" fill="#6E778D"/>`
    + texture('M 0 112 H 200 V 150 H 0 Z', '#2A3040', 0.3, 'grain')
    + '<path d="M 0 124 H 200 M 0 137 H 200" stroke="#59617A" stroke-width="0.8"/>'
    + soft('M 0 112 H 200 V 117 H 0 Z', '#0E1230', 0.25, 'blur')
    + `<line x1="0" y1="112" x2="200" y2="112" stroke="${INK}" stroke-width="0.4" stroke-opacity="0.5"/>`,
};
