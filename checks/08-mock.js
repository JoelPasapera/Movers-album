import { readFileSync, readdirSync } from 'node:fs';
import { PAPERS, createRun, currentGameId, record, advance, statement, timeUp } from '../src/engine/mock.js';
import { GAMES, PRACTICE } from '../src/games/registry.js';
import { shieldsFor, paperShields, MAX_SHIELDS } from '../src/engine/scoring.js';
import { SHIELD_TABLE } from '../src/data/shield-table.js';
import { setExamMode, cueAllowed } from '../src/core/audio.js';

// Lo que Cambridge escribe con palabras en su guia de simulacros (y la tabla
// que circula citandola): la nota de cada prueba entera y sus escudos.
const CAMBRIDGE = {
  listening: [[25, 5], [22, 5], [21, 5], [20, 4], [18, 4], [17, 3], [14, 3], [13, 2], [11, 2], [10, 1], [0, 1]],
  reading: [[39, 5], [33, 5], [32, 4], [29, 4], [28, 3], [24, 3], [23, 2], [20, 2], [18, 2], [17, 1], [0, 1]],
};

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

  // 4b. Si se acaba el tiempo con dos partes hechas, la prueba cuenta sobre
  // sus 25 notas, no sobre las 10 que se llegaron a ver.
  const half = createRun(['listening']);
  record(half, currentGameId(half), 5, 5);
  advance(half);
  record(half, currentGameId(half), 5, 5);
  advance(half);
  timeUp(half);
  const halfPaper = statement(half)[0];
  if (halfPaper.total !== 25 || halfPaper.shields !== paperShields('listening', 10, 25)) {
    problems.push(`con el tiempo acabado y 10 de 10 en dos partes salen ${halfPaper.shields} escudos sobre ${halfPaper.total}: tiene que contar sobre 25`);
  }

  // 4c. Las pruebas enteras se convierten con la tabla de Cambridge.
  for (const [paperId, rows] of Object.entries(CAMBRIDGE)) {
    const outOf = /** @type {any} */ (SHIELD_TABLE)[paperId].outOf;
    if (outOf !== PAPERS.find((p) => p.id === paperId)?.marks) problems.push(`la tabla de ${paperId} no es sobre las notas del examen`);
    for (const [marks, want] of rows) {
      const got = paperShields(paperId, marks, outOf);
      if (got !== want) problems.push(`${marks}/${outOf} en ${paperId} da ${got} escudos y en la tabla de Cambridge son ${want}`);
    }
  }
  // Un simulacro entero que acierta las notas justas de cada corte las convierte igual.
  const full = createRun(['listening']);
  for (const marks of [5, 5, 5, 5, 1]) {
    record(full, currentGameId(full), marks, 5);
    advance(full);
  }
  if (statement(full)[0].shields !== 5) problems.push('21 de 25 en un simulacro entero no da 5 escudos');

  // 4d. Una parte o un juego, en proporcion: nunca baja al acertar mas, todo
  // bien son 5 y nada bien es 1, como en el examen.
  for (const total of [4, 5, 6, 7, 8, 10, 12, 25, 39]) {
    let before = 0;
    for (let correct = 0; correct <= total; correct += 1) {
      const n = shieldsFor(correct, total);
      if (n < before) problems.push(`con ${correct}/${total} bajan los escudos`);
      before = n;
    }
    if (shieldsFor(total, total) !== MAX_SHIELDS) problems.push(`todo bien sobre ${total} no da 5 escudos`);
    if (shieldsFor(0, total) !== 1) problems.push(`nada bien sobre ${total} no da 1 escudo`);
  }

  // 5. Todos los juegos saben entregar su resultado al simulacro.
  // Los entrenamientos (PRACTICE en el registro) no entran en el simulacro.
  const practiceOnly = new Set(PRACTICE.map((g) => g.id));
  for (const dir of readdirSync('src/games', { withFileTypes: true })) {
    if (!dir.isDirectory() || practiceOnly.has(dir.name)) continue;
    const src = readFileSync(`src/games/${dir.name}/index.js`, 'utf8');
    if (!src.includes('ctx.onFinish')) {
      problems.push(`"${dir.name}" no entrega su resultado al simulacro (le falta ctx.onFinish)`);
    }
  }

  // 5b. En el simulacro no suenan el acierto ni el fallo (si el final).
  setExamMode(true);
  if (cueAllowed('correct') || cueAllowed('wrong') || !cueAllowed('finish')) problems.push('en el simulacro suenan los avisos de acierto o fallo');
  setExamMode(false);
  if (!cueAllowed('correct') || !cueAllowed('wrong')) problems.push('al practicar ya no suenan los avisos de acierto y fallo');

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
    detail: `${PAPERS.length} pruebas, ${inPapers.length} partes encadenadas, escudos con la tabla de Cambridge`,
    problems,
    numbers: { partesEnSimulacro: inPapers.length },
  };
}
