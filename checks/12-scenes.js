import { SCENES } from '../src/data/scenes/index.js';
import { PART6_SCENES, lexiconOf, renderScene } from '../src/data/scenes/part6.js';
import { PIECES, BACKGROUNDS } from '../src/data/scenes/pieces.js';
import { inSyllabus } from '../src/data/syllabus.js';
import { buildRound as colourRound } from '../src/games/colour/questions.js';

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
    if (scene.svg.includes('undefined') || scene.svg.includes('NaN')) {
      problems.push(`"${scene.title}" genera un dibujo roto`);
    }
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

  // Escenas de la Parte 6, que alimentan tambien Yes or no
  for (const scene of PART6_SCENES) {
    if (scene.prompts.reduce((a, p) => a + p.marks, 0) !== 10) {
      problems.push(`"${scene.title}" no suma 10 puntos`);
    }
    if (!BACKGROUNDS[scene.art.bg]) problems.push(`"${scene.title}" usa un fondo que no existe`);
    for (const item of scene.art.items) {
      if (!PIECES[item.p]) problems.push(`"${scene.title}" usa la pieza "${item.p}", que no existe`);
      if (item.x < 0 || item.x > 200 || item.y < 0 || item.y > 155) {
        problems.push(`"${scene.title}" coloca "${item.p}" fuera del lienzo`);
      }
    }
    const svg = renderScene(scene);
    if (svg.includes('undefined') || svg.includes('NaN')) problems.push(`"${scene.title}" genera un dibujo roto`);
    for (const word of lexiconOf(scene)) {
      if (!inSyllabus(word)) problems.push(`"${scene.title}" describe con "${word}", que no esta en el syllabus`);
    }
    if (scene.entities.filter((e) => e.colours.length).length < 4) {
      problems.push(`"${scene.title}" tiene menos de 4 objetos con color, y Yes or no se queda corto`);
    }
  }

  return {
    ok: problems.length === 0,
    detail: `${SCENES.length} de colorear, ${PART6_SCENES.length} de la parte 6`,
    problems: [...new Set(problems)],
    numbers: { escenasDibujadas: SCENES.length + PART6_SCENES.length },
  };
}
