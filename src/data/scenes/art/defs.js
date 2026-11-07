// @ts-check
// La luz de todos los dibujos: degradados semitransparentes que dan volumen a
// cualquier forma, sea del color que sea (la luz llega de arriba a la
// izquierda), y unos pocos filtros: desenfoque para que sombras, brillos y
// pliegues sean suaves como en una pintura, bruma para lo lejano y grano para
// la textura de la hierba, la arena o la madera. Cada SVG los declara una vez
// con su propio prefijo, porque en una pantalla puede haber varias vinetas y
// dos ids iguales se pisarian.
//
// Uso: quien pinta un SVG lo hace dentro de withDefs(prefijo, (d) => ...), y
// mete d (el <defs>) dentro del <svg>; las piezas piden grad('vol'),
// fx('blur')... sin saber en que SVG estan, y uid() para los recortes
// (clipPath) que necesiten. Fuera de withDefs, grad() apunta a un prefijo que
// no existe y la comprobacion 12 lo encuentra.

/** El prefijo del SVG que se esta pintando ahora. */
let current = 'sin-svg';
/** Cuantos ids propios (recortes) lleva ya el SVG actual. */
let counter = 0;

/**
 * Dibuja un SVG entero con sus propios degradados: mientras dura draw, las
 * piezas usan los de este prefijo. draw recibe el <defs> que debe meter.
 * @param {string} prefix @param {(defsMarkup: string) => string} draw
 */
export function withDefs(prefix, draw) {
  const before = current;
  const beforeCount = counter;
  current = prefix;
  counter = 0;
  try {
    return draw(defs(prefix));
  } finally {
    current = before;
    counter = beforeCount;
  }
}

/** Un degradado comun del SVG actual, para fill="..." o stroke="...". @param {string} name */
export const grad = (name) => `url(#${current}-${name})`;

/** Un filtro comun del SVG actual (blur, blur2, haze, grain, grain2, grassy, leafy; y blurL, grainL, grassyL para las escenas grandes), para filter="...". @param {string} name */
export const fx = (name) => `url(#${current}-${name})`;

/** Un id nuevo y unico dentro del SVG actual (para un clipPath). @param {string} [name] */
export function uid(name = 'k') {
  counter += 1;
  return `${current}-${name}${counter}`;
}

/** Los nombres que hay (la comprobacion 12 mira que cada url(#...) exista). */
export const NAMES = ['vol', 'side', 'ball', 'soft', 'glow', 'blush', 'top', 'glass', 'deep', 'skin', 'face', 'cloth', 'clothV',
  'spec', 'warm', 'quill', 'vignette', 'cast', 'blur', 'blur2', 'haze', 'grain', 'grain2', 'grassy', 'leafy', 'blurL', 'grainL', 'grassyL',
  'film', 'filmL', 'fabric', 'fabric2'];

/**
 * Un degradado con paradas [posicion, color, opacidad].
 * @param {string} tag @param {string} id @param {string} attrs @param {[number, string, number][]} stops
 */
const gradient = (tag, id, attrs, stops) => `<${tag} id="${id}" ${attrs}>${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}" stop-opacity="${a}"/>`).join('')}</${tag}>`;

/**
 * Los degradados y filtros de un SVG.
 * @param {string} prefix
 */
export function defs(prefix) {
  const id = (/** @type {string} */ name) => `${prefix}-${name}`;
  // Sombra casi neutra (un poco calida) y sombra de piel (calida, rojiza): con
  // azul marino la piel se veia gris y sucia.
  const dark = '#1C1424';
  const flesh = '#5C2414';
  const light = '#FFF4EA';
  // Region de los desenfoques en unidades del dibujo y muy amplia: medida sobre
  // la caja de la forma, un trazo fino (un pliegue, el borde de un musculo)
  // cortaba su propia sombra en una franja de bordes rectos.
  const region = 'filterUnits="userSpaceOnUse" x="-2000" y="-2000" width="4000" height="4000"';
  return '<defs>'
    // Volumen general: brillo arriba a la izquierda, sombra abajo a la derecha.
    + gradient('linearGradient', id('vol'), 'x1="0" y1="0" x2="0.7" y2="1"', [[0, '#fff', 0.36], [0.4, '#fff', 0], [0.6, dark, 0], [1, dark, 0.3]])
    // Cilindros (troncos, patas): claro a la izquierda, sombra y algo de luz rebotada a la derecha.
    + gradient('linearGradient', id('side'), 'x1="0" y1="0" x2="1" y2="0"', [[0, '#fff', 0.26], [0.36, '#fff', 0], [0.58, dark, 0], [0.86, dark, 0.32], [1, dark, 0.2]])
    // Esferas (pelotas, frutas, ojos): brillo redondo y borde en sombra.
    + gradient('radialGradient', id('ball'), 'cx="0.36" cy="0.3" r="0.8"', [[0, '#fff', 0.55], [0.3, '#fff', 0], [0.66, dark, 0], [1, dark, 0.36]])
    // Sombra en el suelo: oscura en el centro y que se pierde en el borde.
    + gradient('radialGradient', id('soft'), '', [[0, dark, 0.34], [0.55, dark, 0.15], [1, dark, 0]])
    // Resplandor (llama, sol).
    + gradient('radialGradient', id('glow'), '', [[0, '#FFF6C2', 0.95], [1, '#FFD54A', 0]])
    // Mejillas sonrosadas.
    + gradient('radialGradient', id('blush'), '', [[0, '#F0606A', 0.38], [1, '#F0606A', 0]])
    // Brillo de arriba (tejados, mesas, agua).
    + gradient('linearGradient', id('top'), 'x1="0" y1="0" x2="0" y2="1"', [[0, '#fff', 0.45], [1, '#fff', 0]])
    // Cristal: reflejo en diagonal.
    + gradient('linearGradient', id('glass'), 'x1="0" y1="0" x2="1" y2="1"', [[0, '#fff', 0.72], [0.45, '#fff', 0.08], [0.7, '#fff', 0.28], [1, '#fff', 0.05]])
    // Profundidad: lo de abajo mas oscuro (interiores, agua honda).
    + gradient('linearGradient', id('deep'), 'x1="0" y1="0" x2="0" y2="1"', [[0, dark, 0], [1, dark, 0.28]])
    // Piel de brazos, piernas y cuello: luz calida a la izquierda, sombra rojiza a la derecha.
    + gradient('linearGradient', id('skin'), 'x1="0" y1="0" x2="1" y2="0"', [[0, light, 0.3], [0.3, light, 0], [0.55, flesh, 0], [0.84, flesh, 0.34], [1, flesh, 0.22]])
    // Cara: luz arriba a la izquierda, sombra calida hacia la mandibula y la derecha.
    + gradient('radialGradient', id('face'), 'cx="0.38" cy="0.34" r="0.78"', [[0, light, 0.26], [0.42, light, 0], [0.7, flesh, 0.06], [1, flesh, 0.34]])
    // Tela: como la piel pero con sombra neutra.
    + gradient('linearGradient', id('cloth'), 'x1="0" y1="0" x2="1" y2="0"', [[0, '#fff', 0.2], [0.34, '#fff', 0], [0.58, dark, 0], [0.88, dark, 0.3], [1, dark, 0.2]])
    + gradient('linearGradient', id('clothV'), 'x1="0" y1="0" x2="0" y2="1"', [[0, '#fff', 0.14], [0.35, '#fff', 0], [1, dark, 0.24]])
    // Brillo especular (pelo, nariz, labios, ojos, zapatos).
    + gradient('radialGradient', id('spec'), '', [[0, '#fff', 0.85], [1, '#fff', 0]])
    // Sombra de contacto en la piel (bajo la barbilla, entre los brazos).
    + gradient('radialGradient', id('warm'), '', [[0, flesh, 0.45], [1, flesh, 0]])
    // Viñeteado de la lente: las esquinas de la foto, un poco mas oscuras.
    + gradient('radialGradient', id('vignette'), 'cx="0.5" cy="0.46" r="0.74"', [[0, '#000', 0], [0.6, '#000', 0], [0.86, '#1A1208', 0.14], [1, '#1A1208', 0.3]])
    // Sombra proyectada en el suelo: mas oscura junto a los pies y que se
    // aclara y se difumina al alejarse (va de izquierda a derecha).
    + gradient('radialGradient', id('cast'), 'cx="0.32" cy="0.5" r="0.68" fx="0.2" fy="0.5"', [[0, dark, 0.3], [0.45, dark, 0.15], [1, dark, 0]])
    // Pluma: en sombra donde la tapa la de encima y con la punta al sol.
    + gradient('linearGradient', id('quill'), 'x1="0" y1="0" x2="1" y2="0"', [[0, dark, 0.34], [0.45, dark, 0.04], [0.8, '#fff', 0.06], [1, '#fff', 0.24]])
    // Desenfoques: pliegues y brillos (blur), sombras suaves (blur2), lo lejano (haze).
    + `<filter id="${id('blur')}" ${region}><feGaussianBlur stdDeviation="0.45"/></filter>`
    + `<filter id="${id('blur2')}" ${region}><feGaussianBlur stdDeviation="1.3"/></filter>`
    + `<filter id="${id('haze')}" ${region}><feGaussianBlur stdDeviation="2"/></filter>`
    // Grano (arena, madera, piel de los muros) y hierba (vetas verticales):
    // ruido que solo se ve donde esta la forma a la que se aplica.
    + `<filter id="${id('grain')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.2" numOctaves="2" seed="7" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.58" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    + `<filter id="${id('grassy')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.6 0.32" numOctaves="2" seed="3" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.7 0 0 0 -0.62" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    // Otro grano, con otro dibujo (para poner luz y sombra sin que coincidan).
    + `<filter id="${id('grain2')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="1.0" numOctaves="2" seed="19" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.6 0 0 0 -0.62" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    // Los mismos, a la escala de las escenas de colorear (800 de ancho): un
    // desenfoque mayor y un grano mas grueso, que a esa escala se ve igual.
    + `<filter id="${id('blurL')}" ${region}><feGaussianBlur stdDeviation="3.2"/></filter>`
    + `<filter id="${id('grainL')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.32" numOctaves="2" seed="7" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.5 0 0 0 -0.58" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    + `<filter id="${id('grassyL')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.42 0.085" numOctaves="2" seed="3" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1.7 0 0 0 -0.62" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    // El grano del sensor de una camara: ruido gris muy fino y muy tenue encima
    // de toda la foto (filmL, a la escala de las escenas grandes).
    + `<filter id="${id('film')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="2.4" numOctaves="1" seed="11" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 0.075"/></filter>'
    + `<filter id="${id('filmL')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="1" seed="11" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 0.075"/></filter>'
    // Tela: un tejido fino (punto de camiseta, sarga del vaquero) que solo se ve
    // donde esta la prenda.
    + `<filter id="${id('fabric')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="6.5 4.5" numOctaves="1" seed="5" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2 0 0 0 -0.9" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    + `<filter id="${id('fabric2')}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="6.5 4.5" numOctaves="1" seed="8" result="n"/>`
    + '<feColorMatrix in="n" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2 0 0 0 -0.9" result="a"/>'
    + '<feComposite in="SourceGraphic" in2="a" operator="in"/></filter>'
    // Hojas: el borde de las masas de la copa se rompe en matas irregulares.
    + `<filter id="${id('leafy')}" x="-8%" y="-8%" width="116%" height="116%" color-interpolation-filters="sRGB"><feTurbulence type="fractalNoise" baseFrequency="0.5" numOctaves="2" seed="4" result="n"/>`
    + '<feDisplacementMap in="SourceGraphic" in2="n" scale="4.2" xChannelSelector="R" yChannelSelector="G"/></filter>'
    + '</defs>';
}
