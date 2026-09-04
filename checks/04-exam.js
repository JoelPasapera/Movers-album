import { GAMES } from '../src/games/registry.js';

export const name = 'Fidelidad al examen real';

// Las 15 partes del examen y lo que vale cada una, segun el handbook oficial.
const EXAM = [
  ['Listening \u00b7 part 1', 5], ['Listening \u00b7 part 2', 5], ['Listening \u00b7 part 3', 5],
  ['Listening \u00b7 part 4', 5], ['Listening \u00b7 part 5', 5],
  ['Reading \u00b7 part 1', 5], ['Reading \u00b7 part 2', 6], ['Reading \u00b7 part 3', 6],
  ['Reading \u00b7 part 4', 5], ['Reading \u00b7 part 5', 7], ['Reading \u00b7 part 6', 10],
  ['Speaking \u00b7 part 1', 0], ['Speaking \u00b7 part 2', 0],
  ['Speaking \u00b7 part 3', 0], ['Speaking \u00b7 part 4', 0],
];

export function run() {
  const problems = [];
  const tags = GAMES.map((g) => g.tag);

  for (const [tag] of EXAM) {
    if (!tags.includes(tag)) problems.push(`no hay ningun juego para ${tag}`);
  }
  for (const tag of tags) {
    if (!EXAM.some(([t]) => t === tag)) problems.push(`"${tag}" no es una parte del examen`);
  }
  const dupTags = tags.filter((t, i) => tags.indexOf(t) !== i);
  if (dupTags.length) problems.push(`dos juegos para la misma parte: ${[...new Set(dupTags)].join(', ')}`);

  const ids = GAMES.map((g) => g.id);
  const dupIds = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupIds.length) problems.push(`ids repetidos en el registro: ${[...new Set(dupIds)].join(', ')}`);

  for (const game of GAMES) {
    if (!game.ready) problems.push(`"${game.title}" sigue marcado como no terminado`);
    if (game.ready && typeof game.load !== 'function') problems.push(`"${game.title}" no sabe cargarse`);
    if (!game.blurb || !game.title) problems.push(`"${game.id}" no tiene titulo o descripcion`);
  }

  // El album tiene que ir en el orden del examen.
  const order = GAMES.map((g) => EXAM.findIndex(([t]) => t === g.tag));
  for (let i = 1; i < order.length; i += 1) {
    if (order[i] < order[i - 1]) {
      problems.push('los juegos no salen en el orden del examen en el album');
      break;
    }
  }

  const marks = EXAM.reduce((a, [, m]) => a + m, 0);
  return {
    ok: problems.length === 0,
    detail: `${GAMES.length}/15 partes, ${marks} puntos escritos cubiertos`,
    problems,
    numbers: { juegos: GAMES.length, puntosEscritos: marks },
  };
}
