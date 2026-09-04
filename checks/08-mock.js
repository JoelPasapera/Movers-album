import { readFileSync, readdirSync } from 'node:fs';
import { PAPERS, createRun, currentGameId, record, advance, statement, timeUp } from '../src/engine/mock.js';
import { GAMES } from '../src/games/registry.js';

export const name = 'El simulacro recorre el examen entero';

export function run() {
  const problems = [];

  // 1. Cada juego del registro tiene que estar en alguna prueba, y al reves.
  const inPapers = PAPERS.flatMap((p) => p.parts);
  for (const game of GAMES) {
    if (!inPapers.includes(game.id)) problems.push(`"${game.title}" no entra en ninguna prueba del simulacro`);
  }
  for (const id of inPapers) {
    if (!GAMES.some((g) => g.id === id)) problems.push(`el simulacro pide "${id}" y ese juego no existe`);
  }
  const dup = inPapers.filter((id, i) => inPapers.indexOf(id) !== i);
  if (dup.length) problems.push(`el simulacro repite: ${[...new Set(dup)].join(', ')}`);

  // 2. Tiempos y numero de partes segun el handbook.
  const OFFICIAL = { listening: [5, 25], reading: [6, 30], speaking: [4, 7] };
  for (const paper of PAPERS) {
    const [parts, minutes] = OFFICIAL[paper.id] ?? [];
    if (paper.parts.length !== parts) problems.push(`${paper.label} tiene ${paper.parts.length} partes y el examen tiene ${parts}`);
    if (paper.minutes !== minutes) problems.push(`${paper.label} dura ${paper.minutes} min y el examen ${minutes}`);
  }

  // 3. Un simulacro completo recorre las 15 partes sin atascarse.
  let mock = createRun();
  const seen = [];
  let guard = 0;
  while (guard += 1, guard < 40) {
    const id = currentGameId(mock);
    if (!id) break;
    seen.push(id);
    record(mock, id, 1, 5);
    if (advance(mock) === 'end') break;
  }
  if (seen.length !== GAMES.length) problems.push(`el simulacro recorre ${seen.length} partes y hay ${GAMES.length}`);
  if (new Set(seen).size !== seen.length) problems.push('el simulacro repite alguna parte');

  // 4. Si se acaba el tiempo, lo que falta cuenta cero.
  const short = createRun(['listening']);
  timeUp(short);
  const paper = statement(short)[0];
  if (!paper.ranOut) problems.push('no se avisa de que se acabo el tiempo');
  if (paper.rows.filter((r) => r.skipped).length !== 5) {
    problems.push('al acabarse el tiempo no se marcan como cero las partes sin hacer');
  }

  // 5. Todos los juegos saben entregar su resultado al simulacro.
  for (const dir of readdirSync('src/games', { withFileTypes: true })) {
    const PRACTICE_ONLY = ['vocab', 'yesno', 'wordform', 'numbers', 'wordsearch', 'opposites',
      'picturegap', 'talkpicture', 'sentence'];
    if (!dir.isDirectory() || PRACTICE_ONLY.includes(dir.name)) continue;
    const src = readFileSync(`src/games/${dir.name}/index.js`, 'utf8');
    if (!src.includes('ctx.onFinish')) {
      problems.push(`"${dir.name}" no entrega su resultado al simulacro (le falta ctx.onFinish)`);
    }
  }

  // 6. En examen solo se puede escuchar dos veces.
  const audio = readFileSync('src/core/audio.js', 'utf8');
  if (!audio.includes('2 - (plays.get(key)')) {
    problems.push('el limite de dos escuchas en modo examen ha desaparecido de audio.js');
  }
  for (const gid of ['colour', 'wordhunt', 'matchnames', 'notetaking', 'matchpics']) {
    const src = readFileSync(`src/games/${gid}/index.js`, 'utf8');
    if (!src.includes('playsLeft')) problems.push(`"${gid}" ya no respeta el limite de escuchas`);
  }

  return {
    ok: problems.length === 0,
    detail: `${PAPERS.length} pruebas, ${inPapers.length} partes encadenadas`,
    problems,
    numbers: { partesEnSimulacro: inPapers.length },
  };
}
