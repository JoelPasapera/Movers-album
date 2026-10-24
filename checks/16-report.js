import * as state from '../src/core/state.js';
import * as profiles from '../src/core/profiles.js';
import { GAMES } from '../src/games/registry.js';
import { PAPERS, createRun, currentGameId, record, advance } from '../src/engine/mock.js';
import { recordShields } from '../src/engine/progress.js';
import { mark } from '../src/engine/vocabulary.js';
import { recordTeacherMark } from '../src/engine/speakingScale.js';
import {
  buildReport, reportFor, saveMock, savedMocks, statusOf, HOME_TIPS, MOCKS_KEPT, READY_AT,
} from '../src/engine/report.js';

export const name = 'El informe para las familias dice la verdad del perfil';

// El informe reune lo que ya guarda el perfil. Si una parte del examen, un
// simulacro o la nota de Speaking no llegan al informe, la familia no lo ve.
export function run() {
  const problems = [];
  const playable = GAMES.filter((g) => g.ready);

  // 1. Las etiquetas de cada parte: de "no probado" a "listo"
  if (statusOf(0, false) !== 'new') problems.push('una parte sin jugar no se marca como nueva');
  if (statusOf(5, true) !== 'ready' || statusOf(READY_AT, true) !== 'ready') problems.push(`${READY_AT} escudos no cuentan como listo`);
  if (statusOf(READY_AT - 1, true) !== 'nearly') problems.push(`${READY_AT - 1} escudos no cuentan como "casi"`);
  if (statusOf(1, true) !== 'practise' || statusOf(0, true) !== 'practise') problems.push('pocos escudos no piden practica');

  // 2. Cada parte del examen tiene su consejo para casa. Es texto para la
  // familia, no para el nino, asi que no se le exige el vocabulario del syllabus.
  for (const g of playable) {
    if (!HOME_TIPS[g.id] || HOME_TIPS[g.id].length < 30) problems.push(`la parte "${g.title}" no tiene consejo para casa`);
  }
  for (const id of Object.keys(HOME_TIPS)) {
    if (!playable.some((g) => g.id === id)) problems.push(`hay un consejo para "${id}", que no es una parte del examen`);
  }

  // 3. Un perfil nuevo: todo a cero, nada inventado
  state.useProfile('__check16__');
  state.reset();
  const empty = buildReport();
  if (empty.parts.length !== playable.length) problems.push(`el informe describe ${empty.parts.length} partes y hay ${playable.length}`);
  if (empty.parts.some((p) => p.status !== 'new' || p.played)) problems.push('un perfil nuevo ya tiene partes jugadas en el informe');
  if (empty.words.mastered !== 0 || empty.words.percent !== 0) problems.push('un perfil nuevo ya sabe palabras en el informe');
  if (empty.mocks.length || empty.speaking || empty.streak) problems.push('un perfil nuevo ya tiene simulacros, nota de Speaking o racha');
  if (empty.practise.length !== 3) problems.push('el informe no propone tres cosas que practicar');
  if (empty.pages.reduce((a, p) => a + p.total, 0) !== empty.words.total) problems.push('las paginas del informe no suman el album entero');

  // 4. Lo que se juega llega al informe, y lo flojo va primero
  recordShields('spellit', 5);
  recordShields('respond', 2);
  recordShields('colour', 3);
  mark('cat', true); mark('cat', true);
  recordTeacherMark({ vocabulary: 4, pronunciation: 3, interaction: 5 }, 'tell the story');
  const r = buildReport();
  const part = (id) => r.parts.find((p) => p.id === id);
  if (part('spellit')?.status !== 'ready' || part('spellit')?.shields !== 5) problems.push('cinco escudos no aparecen como listo');
  if (part('respond')?.status !== 'practise') problems.push('dos escudos no piden practica');
  if (part('colour')?.status !== 'nearly') problems.push('tres escudos no aparecen como "casi"');
  if (r.practise.some((p) => p.id === 'spellit')) problems.push('una parte lista se propone para practicar');
  if (r.practise[0]?.id !== 'respond') problems.push('lo mas flojo que se ha jugado no va primero en lo que practicar');
  if (r.words.mastered !== 1) problems.push('una palabra dominada no cuenta en el informe');
  if (r.pages.find((p) => p.id === 'animals')?.mastered !== 1) problems.push('la palabra dominada no cuenta en su pagina');
  if (r.speaking?.by !== 'teacher' || r.speaking?.bands.interaction !== 5 || r.speaking?.note !== 'tell the story') problems.push('la nota de Speaking del profesor no llega al informe');
  if (r.shields.shields !== 10 || r.shields.outOf !== playable.length * 5) problems.push('los escudos no se suman bien');

  // 5. Los simulacros terminados se guardan, con sus tres pruebas, y solo los ultimos
  const mock = createRun();
  for (let i = 0; i < 100; i += 1) {
    record(mock, currentGameId(mock), 4, 5);
    if (advance(mock) === 'end') break;
  }
  const saved = saveMock(mock);
  if (saved.papers.length !== PAPERS.length || saved.outOf !== PAPERS.length * 5) problems.push('el simulacro guardado no tiene las tres pruebas');
  if (saved.papers.some((p) => p.total === 0 || p.score !== p.total * 4 / 5)) problems.push('el simulacro guardado pierde los puntos');
  if (savedMocks().length !== 1 || buildReport().mocks.length !== 1) problems.push('el simulacro no se guarda en el perfil');
  for (let i = 0; i < MOCKS_KEPT + 3; i += 1) saveMock(mock);
  if (savedMocks().length !== MOCKS_KEPT) problems.push(`se guardan ${savedMocks().length} simulacros y el tope es ${MOCKS_KEPT}`);

  // 6. El informe de otro perfil no cambia el perfil activo
  profiles.add('__check16a__');
  const a = profiles.list().find((p) => p.name === '__check16a__');
  profiles.add('__check16b__');
  const b = profiles.list().find((p) => p.name === '__check16b__');
  state.useProfile(b.id);
  recordShields('story', 4);
  state.useProfile(a.id);
  const other = reportFor(b.id);
  if (other?.profile?.name !== '__check16b__' || other?.parts.find((p) => p.id === 'story')?.shields !== 4) problems.push('el informe de otro alumno no es el suyo');
  if (buildReport().parts.find((p) => p.id === 'story')?.played) problems.push('pedir el informe de otro alumno cambia el perfil activo');
  if (reportFor('nobody') !== null) problems.push('se inventa un informe para un perfil que no existe');
  profiles.remove(a.id);
  profiles.remove(b.id);
  state.useProfile('__check16__');
  state.reset();
  state.useProfile('');

  return {
    ok: problems.length === 0,
    detail: `${playable.length} partes, escala de Speaking y ${MOCKS_KEPT} simulacros por alumno`,
    problems: [...new Set(problems)],
    numbers: { partesEnInforme: playable.length },
  };
}
