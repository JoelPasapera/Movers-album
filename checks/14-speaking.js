import { SPEAKING_SCALE, BAND_MAX, BAND_NOTES, PRONUNCIATION_CAP, LISTENS_FOR } from '../src/data/speaking-scale.js';
import {
  CRITERIA, validBands, scaleShields, capPronunciation, recordSelfCheck, recordTeacherMark, latestMark, shortBands,
} from '../src/engine/speakingScale.js';
import { createRun, record, recordScale, statement, PAPERS } from '../src/engine/mock.js';
import * as state from '../src/core/state.js';

export const name = 'La escala de Speaking sigue el handbook';

// Lo que dice el handbook (p. 86) de la escala de A1 Movers: tres criterios,
// estos aspectos, bandas de 0 a 5 con la 5, la 3 y la 1 descritas.
const HANDBOOK = [
  ['Vocabulary and grammar', ['Range', 'Control', 'Extent', 'Cohesion']],
  ['Pronunciation', ['Individual sounds', 'Stress', 'Intonation']],
  ['Interaction', ['Reception/Responding', 'Support required', 'Fluency/Promptness']],
];

export function run() {
  const problems = [];

  // 1. La escala es la del handbook: criterios, aspectos y bandas
  if (BAND_MAX !== 5) problems.push(`la banda maxima es ${BAND_MAX} y el handbook llega a 5`);
  if (SPEAKING_SCALE.length !== 3) problems.push(`hay ${SPEAKING_SCALE.length} criterios y el handbook tiene 3`);
  HANDBOOK.forEach(([label, aspects], i) => {
    const c = SPEAKING_SCALE[i];
    if (!c || c.label !== label) problems.push(`el criterio ${i + 1} deberia ser "${label}"`);
    if (c && c.aspects.join('|') !== aspects.join('|')) problems.push(`los aspectos de "${label}" no son los del handbook`);
  });
  for (const c of SPEAKING_SCALE) {
    for (const band of [5, 3, 1]) {
      if (!c.bands[band] || c.bands[band].length < 20) problems.push(`"${c.label}" no describe la banda ${band}`);
    }
    for (const band of [4, 2, 0]) {
      if (c.bands[band]) problems.push(`"${c.label}" describe la banda ${band}: el handbook la define entre las vecinas`);
      if (!BAND_NOTES[band]) problems.push(`falta la nota de la banda ${band}`);
    }
    const childBands = c.child.map(([b]) => b).join(',');
    if (childBands !== '5,3,1') problems.push(`las opciones del nino en "${c.label}" van a ${childBands} y deberian ir a 5,3,1`);
    for (const [, text] of c.child) {
      if (!text || text.length > 120) problems.push(`una opcion del nino en "${c.label}" es muy larga o esta vacia`);
    }
    if (!c.ask) problems.push(`"${c.label}" no tiene pregunta para el nino`);
  }
  if (!LISTENS_FOR.includes('three things')) problems.push('la explicacion para el nino no dice que el examinador mira tres cosas');

  // 2. De bandas a escudos, como cualquier otra prueba
  const same = (n) => Object.fromEntries(CRITERIA.map((id) => [id, n]));
  const want = { 5: 5, 4: 4, 3: 3, 2: 2, 1: 1, 0: 1 };
  for (const [band, shields] of Object.entries(want)) {
    if (scaleShields(same(Number(band))) !== shields) problems.push(`banda ${band} en todo da ${scaleShields(same(Number(band)))} escudos, no ${shields}`);
  }
  for (const bad of [same(6), same(-1), same(2.5), { vocabulary: 5, pronunciation: 5 }, null]) {
    if (validBands(bad)) problems.push(`se admite una banda invalida: ${JSON.stringify(bad)}`);
  }
  if (!validBands({ vocabulary: 5, pronunciation: 3, interaction: 1 })) problems.push('se rechaza una banda valida');
  if (shortBands({ vocabulary: 5, pronunciation: 3, interaction: 1 }) !== 'V5 P3 I1') problems.push('el resumen corto de bandas esta mal');

  // 3. Regla del handbook: con muy poca lengua, la pronunciacion no pasa de 3
  const capped = capPronunciation(same(5), PRONUNCIATION_CAP.minEvidence / 2);
  if (capped.pronunciation !== PRONUNCIATION_CAP.max || capped.vocabulary !== 5) problems.push('el tope de pronunciacion no se aplica bien');
  if (capPronunciation(same(5), PRONUNCIATION_CAP.minEvidence).pronunciation !== 5) problems.push('el tope de pronunciacion se aplica con evidencia suficiente');
  if (capPronunciation(same(2), 0).pronunciation !== 2) problems.push('el tope de pronunciacion sube una banda baja');

  // 4. Se guarda por alumno; la nota del profesor manda sobre la autoevaluacion
  state.useProfile('__check14__');
  state.reset();
  if (latestMark() !== null) problems.push('un perfil nuevo ya tiene nota de Speaking');
  recordSelfCheck({ vocabulary: 5, pronunciation: 3, interaction: 3 });
  if (latestMark()?.by !== 'self' || latestMark()?.shields !== scaleShields({ vocabulary: 5, pronunciation: 3, interaction: 3 })) {
    problems.push('la autoevaluacion del nino no se guarda o no se convierte en escudos');
  }
  recordTeacherMark({ vocabulary: 4, pronunciation: 4, interaction: 5 }, 'story part');
  const mark = latestMark();
  if (mark?.by !== 'teacher' || mark?.bands.interaction !== 5 || mark?.note !== 'story part') {
    problems.push('la nota del profesor no manda sobre la autoevaluacion');
  }
  recordTeacherMark({ vocabulary: 9, pronunciation: 4, interaction: 5 });
  if (latestMark().bands.vocabulary !== 4) problems.push('se guarda una nota del profesor con una banda invalida');
  for (let i = 0; i < 30; i += 1) recordSelfCheck({ vocabulary: 1, pronunciation: 1, interaction: 1 }, 'game');
  if (state.get().speaking.self.length > 20) problems.push('el historial de autoevaluaciones crece sin limite');
  state.reset();
  state.useProfile('');

  // 5. En el simulacro, con autoevaluacion los escudos de Speaking salen de la escala
  const speaking = PAPERS.find((p) => p.id === 'speaking');
  const runWith = (marks, bands) => {
    const r = createRun(['speaking']);
    for (const gameId of speaking.parts) record(r, gameId, marks, 10);
    if (bands) recordScale(r, bands);
    return statement(r)[0];
  };
  const plain = runWith(6, null);
  if (plain.scale || plain.shields !== 3) problems.push('sin autoevaluacion, Speaking no se puntua por aciertos');
  const scaled = runWith(6, { vocabulary: 5, pronunciation: 5, interaction: 5 });
  if (!scaled.scale || scaled.shields !== 5 || scaled.score !== 24) problems.push('con autoevaluacion, Speaking no se puntua con la escala (y los aciertos se pierden)');
  const quiet = runWith(1, { vocabulary: 5, pronunciation: 5, interaction: 5 });
  if (quiet.scale?.pronunciation !== 3) problems.push('con casi nada dicho, la pronunciacion deberia quedarse en 3 como mucho');
  if (runWith(6, { vocabulary: 7 }).scale) problems.push('el simulacro acepta una autoevaluacion invalida');

  return {
    ok: problems.length === 0,
    detail: `${SPEAKING_SCALE.length} criterios de 0 a ${BAND_MAX}, tope de pronunciacion en ${PRONUNCIATION_CAP.max}`,
    problems: [...new Set(problems)],
    numbers: { criteriosDeSpeaking: SPEAKING_SCALE.length },
  };
}
