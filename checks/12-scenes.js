import { SCENES } from '../src/data/scenes/index.js';
import { PART6_SCENES, lexiconOf, renderScene } from '../src/data/scenes/part6.js';
import { PIECES, BACKGROUNDS, renderPanel } from '../src/data/scenes/pieces.js';
import { READING_STORIES } from '../src/data/reading-stories.js';
import { STORIES } from '../src/data/stories.js';
import { inSyllabus } from '../src/data/syllabus.js';
import { buildRound as colourRound } from '../src/games/colour/questions.js';
import { renderCrowd, ACTIONS, SHIRTS } from '../src/data/scenes/crowd.js';
import { renderScene as renderGarden, SLOTS } from '../src/data/scenes/garden.js';
import { rightHand } from '../src/data/scenes/art/people.js';
import { FakeDocument, FakeElement, parseMarkup } from './lib/dom.js';

/** Lo que puede ser una persona dibujada. */
const WHO = ['boy', 'girl', 'man', 'woman'];

/**
 * Cada persona dibujada dice quien es (nino, nina, hombre o mujer): si no, se
 * dibujaba igual a todos y "the girl with the yellow T-shirt" no se veia.
 * @param {{ p: string, o?: Record<string, any> }[]} items @param {string} where
 * @returns {string[]}
 */
function peopleProblems(items, where) {
  return items.filter((item) => (item.p === 'person' && !WHO.includes(item.o?.who))
    || (item.o?.rider && !WHO.includes(item.o.rider.who)))
    .map((item) => `${where}: una persona sin decir si es nino, nina, hombre o mujer (who)`);
}

/**
 * La luz de los dibujos son degradados con id: cada url(#...) tiene que
 * apuntar a uno que este en el mismo SVG. Si no, el navegador pinta esa forma
 * de negro o no la pinta (una pieza dibujada fuera de withDefs, dos vinetas
 * que se pisan el id).
 * @param {string} svg @param {string} where @returns {string[]}
 */
function brokenLights(svg, where) {
  const ids = new Set([...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]));
  const missing = [...new Set([...svg.matchAll(/url\(#([^)]+)\)/g)].map((m) => m[1]))].filter((id) => !ids.has(id));
  return missing.length ? [`${where}: usa degradados que no estan en su dibujo (${missing.slice(0, 3).join(', ')})`] : [];
}

/**
 * La cuerda de una cometa sale de la mano de alguien que la sujeta en alto:
 * si la persona se mueve o cambia de postura, la cuerda quedaria flotando.
 * @param {{ p: string, x: number, y: number, s?: number, o?: Record<string, any> }[]} items @param {string} where
 * @returns {string[]}
 */
function looseStrings(items, where) {
  const hands = items.filter((i) => i.p === 'person' && i.o?.arm === 'up').map((i) => {
    const hand = rightHand(i.o);
    return [i.x + hand.x * (i.s ?? 1), i.y + hand.y * (i.s ?? 1)];
  });
  return items.filter((i) => i.p === 'string' && !hands.some(([x, y]) => Math.hypot(x - i.x, y - i.y) < 1.5))
    .map(() => `${where}: la cuerda de la cometa no sale de la mano de nadie (una persona con arm: 'up')`);
}

export const name = 'Las escenas dibujadas cumplen sus reglas';

const words = (text) => String(text).toLowerCase().match(/[a-z']+/g) ?? [];

export function run() {
  const problems = [];

  // Escenas de colorear (Listening 5)
  for (const scene of SCENES) {
    const inSvg = [...scene.svg.matchAll(/data-obj="([^"]+)"/g)].map((m) => m[1]).sort();
    const declared = scene.objects.map((o) => o.id).sort();
    if (JSON.stringify(inSvg) !== JSON.stringify(declared)) {
      problems.push(`"${scene.title}": los objetos del dibujo no coinciden con la lista`);
    }
    if (!scene.svg.includes('id="sign-text"')) {
      problems.push(`"${scene.title}" no tiene cartel para la pregunta de escribir`);
    }
    // El SVG leido como lo lee el navegador: cada objeto es un grupo que se
    // puede tocar y tiene algo que pintar, y el cartel existe una sola vez.
    const doc = new FakeDocument();
    const svg = parseMarkup(scene.svg.trim(), doc).find((n) => n instanceof FakeElement);
    if (!svg) problems.push(`"${scene.title}": el dibujo no se puede leer`);
    else {
      for (const o of scene.objects) {
        const groups = svg.querySelectorAll(`[data-obj="${o.id}"]`);
        if (groups.length !== 1) problems.push(`"${scene.title}": "${o.id}" aparece ${groups.length} veces en el dibujo`);
        else if (!groups[0].classList.contains('paintable')) problems.push(`"${scene.title}": "${o.id}" no se puede tocar (le falta la clase paintable)`);
        else if (!groups[0].querySelectorAll('.fillable').length) problems.push(`"${scene.title}": "${o.id}" no tiene nada que pintar`);
        else if (groups[0].querySelectorAll('.fillable').some((f) => !/^#fff(fff)?$/i.test(f.getAttribute('fill') ?? ''))) {
          problems.push(`"${scene.title}": "${o.id}" ya viene pintado (lo que se pinta empieza en blanco)`);
        }
      }
      if (svg.querySelectorAll('#sign-text').length !== 1) problems.push(`"${scene.title}": el cartel no aparece exactamente una vez`);
      if (!svg.getAttribute('aria-label')) problems.push(`"${scene.title}": el dibujo no se describe para el lector de pantalla`);
    }
    if (scene.svg.includes('undefined') || scene.svg.includes('NaN')) {
      problems.push(`"${scene.title}" genera un dibujo roto`);
    }
    problems.push(...brokenLights(scene.svg, `"${scene.title}"`));
    const families = [...new Set(scene.objects.map((o) => o.family))];
    if (families.length < 3) problems.push(`"${scene.title}" tiene menos de 3 familias de objetos`);
    for (const family of families) {
      if (scene.objects.filter((o) => o.family === family).length < 2) {
        problems.push(`"${scene.title}": la familia "${family}" tiene un solo objeto, `
          + 'y entonces se identifica sin escuchar la posicion');
      }
    }
    for (const word of words(`${scene.objects.map((o) => o.phrase).join(' ')} ${scene.writeTarget.word}`)) {
      if (!inSyllabus(word)) problems.push(`"${scene.title}" pide colorear usando "${word}", que no esta en el syllabus`);
    }
    for (let i = 0; i < 200; i += 1) {
      if (colourRound(scene).length !== 5) problems.push(`"${scene.title}" no da 5 preguntas`);
    }
  }

  // Cada pieza se dibuja entera, con y sin color, y las personas en todas sus
  // variantes (nino, nina, hombre, mujer, mayores, cada animo).
  for (const [piece, draw] of Object.entries(PIECES)) {
    for (const o of [{}, { colour: '#E33B2E', dx: 30, dy: -40, width: 70, snow: true, melted: true }]) {
      const svg = draw(10, 20, 1.3, o);
      if (!svg.trim() || /undefined|NaN|\$\{/.test(svg)) problems.push(`la pieza "${piece}" se dibuja rota (${JSON.stringify(o)})`);
    }
  }
  for (const who of WHO) {
    for (const mood of ['happy', 'sad', 'scared']) {
      for (const hair of [undefined, '#F5C542', '#C9C1B2']) {
        const svg = PIECES.person(50, 140, 1, { who, mood, hair, shirt: '#2BA84A', nose: mood === 'happy' ? '#E5483B' : undefined });
        if (/undefined|NaN/.test(svg)) problems.push(`una persona (${who}, ${mood}) se dibuja rota`);
      }
    }
  }

  // Escenas de la Parte 6, que alimentan tambien Yes or no
  for (const scene of PART6_SCENES) {
    if (scene.prompts.reduce((a, p) => a + p.marks, 0) !== 10) {
      problems.push(`"${scene.title}" no suma 10 puntos`);
    }
    if (!BACKGROUNDS[scene.art.bg]) problems.push(`"${scene.title}" usa un fondo que no existe`);
    problems.push(...peopleProblems(scene.art.items, `"${scene.title}"`));
    for (const item of scene.art.items) {
      if (!PIECES[item.p]) problems.push(`"${scene.title}" usa la pieza "${item.p}", que no existe`);
      if (item.x < 0 || item.x > 200 || item.y < 0 || item.y > 155) {
        problems.push(`"${scene.title}" coloca "${item.p}" fuera del lienzo`);
      }
    }
    const svg = renderScene(scene);
    if (svg.includes('undefined') || svg.includes('NaN')) problems.push(`"${scene.title}" genera un dibujo roto`);
    problems.push(...brokenLights(svg, `"${scene.title}"`), ...looseStrings(scene.art.items, `"${scene.title}"`));
    for (const word of lexiconOf(scene)) {
      if (!inSyllabus(word)) problems.push(`"${scene.title}" describe con "${word}", que no esta en el syllabus`);
    }
    if (scene.entities.filter((e) => e.colours.length).length < 4) {
      problems.push(`"${scene.title}" tiene menos de 4 objetos con color, y Yes or no se queda corto`);
    }
    // Para que las frases que se generan suenen a ingles de verdad: lo que se
    // dibuja mas de una vez va en plural ("The ducks are swimming"), y lo que
    // sin complemento cambia de sentido lo lleva ("The girl is flying" seria
    // que vuela ella: "flying a kite").
    const drawn = new Map();
    for (const item of scene.art.items) drawn.set(item.p, (drawn.get(item.p) ?? 0) + 1);
    for (const e of scene.entities) {
      if ((drawn.get(e.noun) ?? 0) > 1 && !e.plural) {
        problems.push(`"${scene.title}": hay ${drawn.get(e.noun)} "${e.noun}" dibujados y la escena no dice su plural`);
      }
      if (e.plural && !inSyllabus(e.plural)) problems.push(`"${scene.title}": el plural "${e.plural}" no esta en el syllabus`);
      if (['flying', 'riding'].includes(e.action) && !e.doing) {
        problems.push(`"${scene.title}": "${e.noun} is ${e.action}" necesita su complemento (doing: "${e.action} a ...")`);
      }
      if (e.doing && !e.doing.startsWith(`${e.action} `)) problems.push(`"${scene.title}": "${e.doing}" no empieza por "${e.action}"`);
      // El perro se dibuja haciendo lo que dicen las frases ("The dog is
      // sitting under the table"): sentado, corriendo o de pie.
      if (e.noun === 'dog') {
        const pose = { sitting: 'sit', running: 'run' }[e.action] ?? 'stand';
        for (const item of scene.art.items.filter((i) => i.p === 'dog')) {
          if ((item.o?.pose ?? 'stand') !== pose) problems.push(`"${scene.title}": el perro esta "${e.action}" y no se dibuja asi (pose: '${pose}')`);
        }
      }
    }
  }

  // Vinetas de las historias de Reading 5: piezas que existen, dentro del lienzo
  // y un dibujo que se genera entero.
  for (const story of READING_STORIES) {
    story.sections.forEach((section, i) => {
      const where = `"${story.title}", vineta ${i + 1}`;
      if (!section.art) { problems.push(`${where} no tiene dibujo`); return; }
      if (!BACKGROUNDS[section.art.bg]) problems.push(`${where} usa un fondo que no existe`);
      if (!section.art.items?.length) problems.push(`${where} esta vacia`);
      problems.push(...peopleProblems(section.art.items ?? [], where));
      for (const item of section.art.items ?? []) {
        if (!PIECES[item.p]) problems.push(`${where} usa la pieza "${item.p}", que no existe`);
        if (item.x < 0 || item.x > 200 || item.y < 0 || item.y > 155) problems.push(`${where} coloca "${item.p}" fuera del lienzo`);
      }
      const svg = renderPanel(section.art);
      if (svg.includes('undefined') || svg.includes('NaN')) problems.push(`${where} genera un dibujo roto`);
      problems.push(...brokenLights(svg, where), ...looseStrings(section.art.items ?? [], where));
    });
  }

  // Vinetas de las historias de Speaking 2: cuatro, la primera la cuenta el
  // examinador, y el mismo cuidado con el dibujo.
  for (const story of STORIES) {
    if (story.panels.length !== 4) problems.push(`"${story.title}" (Speaking 2) no tiene cuatro vinetas`);
    if (!story.panels[0]?.given || story.panels.slice(1).some((p) => p.given)) {
      problems.push(`en "${story.title}" (Speaking 2) solo la primera vineta la cuenta el examinador`);
    }
    story.panels.forEach((panel, i) => {
      const where = `"${story.title}" (Speaking 2), vineta ${i + 1}`;
      if (!panel.art) { problems.push(`${where} no tiene dibujo`); return; }
      if (!BACKGROUNDS[panel.art.bg]) problems.push(`${where} usa un fondo que no existe`);
      if (!panel.art.items?.length) problems.push(`${where} esta vacia`);
      problems.push(...peopleProblems(panel.art.items ?? [], where));
      for (const item of panel.art.items ?? []) {
        if (!PIECES[item.p]) problems.push(`${where} usa la pieza "${item.p}", que no existe`);
        if (item.x < 0 || item.x > 200 || item.y < 0 || item.y > 155) problems.push(`${where} coloca "${item.p}" fuera del lienzo`);
      }
      const svg = renderPanel(panel.art);
      if (svg.includes('undefined') || svg.includes('NaN')) problems.push(`${where} genera un dibujo roto`);
      problems.push(...brokenLights(svg, where), ...looseStrings(panel.art.items ?? [], where));
    });
  }

  // Match the names: seis personas haciendo cada cosa (en bici, con helado...)
  // y Find the differences con sus dos versiones.
  const crowd = renderCrowd(ACTIONS.map((a, i) => ({ slot: `s${i}`, boy: i % 2 === 0, shirt: SHIRTS[i].id, action: a.id })));
  if (/undefined|NaN/.test(crowd)) problems.push('Match the names genera un dibujo roto');
  problems.push(...brokenLights(crowd, 'Match the names'));
  for (const pick of [0, 1]) {
    const garden = renderGarden(Object.fromEntries(SLOTS.map((slot) => [slot.id, slot.values[pick]])));
    if (/undefined|NaN/.test(garden)) problems.push('Find the differences genera un dibujo roto');
    problems.push(...brokenLights(garden, 'Find the differences'));
  }

  return {
    ok: problems.length === 0,
    detail: `${SCENES.length} de colorear, ${PART6_SCENES.length} de la parte 6, ${READING_STORIES.length} historias de lectura y ${STORIES.length} de Speaking con vinetas`,
    problems: [...new Set(problems)],
    numbers: { escenasDibujadas: SCENES.length + PART6_SCENES.length },
  };
}
