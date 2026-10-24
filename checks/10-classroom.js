import { LY_PAIRS, ING_VERBS, ingOf, wrongForms, pastOf, PAST_VERBS } from '../src/engine/wordforms.js';
import { PAST_PAIRS, buildRound as pasts, isCorrect as pastOk } from '../src/games/pastform/questions.js';
import { COMPOUNDS, buildRound as pairs, isCorrect as pairOk } from '../src/games/wordpairs/questions.js';
import { buildRound as times, isCorrect as timeOk } from '../src/games/timeprep/questions.js';
import { PARTS, buildRound as matter } from '../src/games/matter/questions.js';
import { PLACES, buildRound as where } from '../src/games/whereare/questions.js';
import { checkSpelling } from '../src/ui/components/writer.js';
import { SOURCE_ENTRIES } from '../src/data/wordlist-source.js';
import { buildRound as forms, isCorrect as formOk } from '../src/games/wordform/questions.js';
import { buildRound as yesno, isCorrect as ynOk } from '../src/games/yesno/questions.js';
import { PART6_SCENES } from '../src/data/scenes/part6.js';
import { CLOZE_TEXTS } from '../src/data/cloze.js';
import { inSyllabus } from '../src/data/syllabus.js';
import { GAMES, PRACTICE } from '../src/games/registry.js';
import { CLASSROOM, withGame, withoutGame } from './lib/activities.js';

export const name = 'Las actividades del libro de aula tienen juego';

// Formas que la regla ortografica no acierta sola y hay que vigilar.
const SPELLING = {
  ride: 'riding', run: 'running', swim: 'swimming', hop: 'hopping', skip: 'skipping',
  sit: 'sitting', stop: 'stopping', shop: 'shopping', get: 'getting', put: 'putting',
  hit: 'hitting', drop: 'dropping', write: 'writing', make: 'making', dance: 'dancing',
  be: 'being', see: 'seeing', carry: 'carrying', travel: 'travelling', live: 'living',
  sail: 'sailing', call: 'calling',   // vocal doble o ll: no se dobla (antes daba "sailling")
};

// Pasados que la regla ortografica no acierta sola.
const PAST_SPELLING = {
  stop: 'stopped', try: 'tried', play: 'played', dance: 'danced', travel: 'travelled',
  sail: 'sailed', catch: 'caught', go: 'went', clap: 'clapped', carry: 'carried', hop: 'hopped',
};

export function run() {
  const problems = [];

  // 1. Formacion de palabras: -ly e -ing
  for (const [verb, want] of Object.entries(SPELLING)) {
    if (ingOf(verb) !== want) problems.push(`${verb} da "${ingOf(verb)}" y deberia dar "${want}"`);
  }
  if (LY_PAIRS.length < 5) problems.push(`solo hay ${LY_PAIRS.length} pares de -ly en el wordlist`);
  if (ING_VERBS.length < 80) problems.push(`solo hay ${ING_VERBS.length} verbos para -ing`);
  for (const pair of [...LY_PAIRS, ...ING_VERBS]) {
    if (!inSyllabus(pair.base)) problems.push(`"${pair.base}" no esta en el syllabus`);
    if (/['\s]/.test(pair.base)) problems.push(`"${pair.base}" no es un verbo suelto`);
    if (wrongForms(pair, pair.formed.endsWith('ly') ? 'ly' : 'ing').length !== 3) {
      problems.push(`"${pair.base}" no genera 3 distractores`);
    }
  }
  for (let i = 0; i < 300; i += 1) {
    for (const q of forms()) {
      if (q.options.length !== 4) problems.push('una pregunta de -ly/-ing no da 4 opciones');
      if (new Set(q.options).size !== 4) problems.push('-ly/-ing repite una opcion');
      if (!q.options.includes(q.pair.formed)) problems.push('-ly/-ing esconde la respuesta');
      if (!formOk(q, q.pair.formed)) problems.push('el corrector de -ly/-ing falla');
      if (!q.rule) problems.push('una pregunta de -ly/-ing no explica la regla');
    }
  }

  // 2. Yes or no: ninguna frase falsa puede ser cierta en el modelo de la escena
  for (const scene of PART6_SCENES) {
    const shared = new Map();
    for (const e of scene.entities) if (e.place) shared.set(e.place, (shared.get(e.place) ?? 0) + 1);
    for (let i = 0; i < 200; i += 1) {
      const round = yesno(scene);
      if (round.questions.length !== 6) problems.push('Yes or no no da 6 preguntas');
      if (round.examples.length !== 2) problems.push('Yes or no no da 2 ejemplos');
      const yes = round.questions.filter((q) => q.answer).length;
      if (yes === 0 || yes === round.questions.length) problems.push('Yes or no da todas la misma respuesta');
      for (const q of [...round.questions, ...round.examples]) {
        if (!ynOk(q, q.answer)) problems.push('el corrector de Yes or no falla');
        for (const w of q.text.toLowerCase().match(/[a-z']+/g) ?? []) {
          if (!inSyllabus(w)) problems.push(`Yes or no usa "${w}", que no esta en el syllabus`);
        }
        const m = q.text.match(/^The (\w+) is (.+)\.$/);
        if (!m || q.answer) continue;
        const entity = scene.entities.find((e) => e.noun === m[1]);
        if (!entity) continue;
        const reallyTrue = entity.colours.includes(m[2]) || entity.place === m[2]
          || entity.action === m[2] || (shared.get(m[2]) ?? 0) >= 3;
        if (reallyTrue) problems.push(`Yes or no marca como falsa una frase cierta: "${q.text}"`);
      }
    }
  }

  // 3. Why or When sigue en la parte 4
  const questionWords = CLOZE_TEXTS.find((c) => c.id === 'questions');
  if (!questionWords) problems.push('ha desaparecido el texto de Why / When de la parte 4');
  else {
    const used = questionWords.gaps.map((g) => g.options[g.answer]);
    for (const word of ['When', 'Why', 'Where', 'Who', 'How']) {
      if (!used.includes(word)) problems.push(`el texto de palabras interrogativas ya no usa "${word}"`);
    }
  }

  // 4. Pasado simple: "What did you do yesterday?"
  for (const [verb, want] of Object.entries(PAST_SPELLING)) {
    if (pastOf(verb) !== want) problems.push(`el pasado de ${verb} da "${pastOf(verb)}" y deberia dar "${want}"`);
  }
  for (const p of PAST_VERBS) {
    if (!inSyllabus(p.formed)) problems.push(`el pasado "${p.formed}" no pasa el syllabus`);
    if (p.formed === p.base) problems.push(`"${p.base}" tiene el mismo pasado que presente y no sirve para elegir`);
  }
  if (PAST_PAIRS.length < 60) problems.push(`solo ${PAST_PAIRS.length} verbos tienen frase en pasado`);
  for (let i = 0; i < 200; i += 1) {
    const round = pasts();
    if (round.length !== 8) problems.push('el pasado no da 8 preguntas');
    for (const q of round) {
      if (q.options.length < 3 || q.options.length > 4 || new Set(q.options).size !== q.options.length) {
        problems.push(`el pasado de "${q.pair.base}" no da 3 o 4 opciones distintas`);
      }
      if (!q.options.includes(q.answer)) problems.push(`el pasado de "${q.pair.base}" esconde la respuesta`);
      if (`${q.before}${q.after}`.includes(q.answer)) problems.push(`la frase de "${q.pair.base}" se chiva`);
      if (!pastOk(q, q.answer) || pastOk(q, q.pair.base) || pastOk(q, q.pair.ing)) {
        problems.push(`el corrector del pasado falla con "${q.pair.base}"`);
      }
    }
  }

  // 5. Palabras compuestas: una pareja cada vez y sin ambiguedad
  if (COMPOUNDS.length < 15) problems.push(`solo hay ${COMPOUNDS.length} palabras compuestas`);
  for (let i = 0; i < 200; i += 1) {
    const round = pairs();
    if (round.length !== 6) problems.push('word pairs no da 6 preguntas');
    const firsts = round.map((q) => q.compound.first);
    if (new Set(firsts).size !== firsts.length) problems.push('word pairs repite una primera mitad en la misma ronda');
    for (const q of round) {
      if (q.options.length !== 4 || new Set(q.options).size !== 4) problems.push(`"${q.answer}" no da 4 opciones distintas`);
      if (!q.options.includes(q.compound.second)) problems.push(`"${q.answer}" esconde la respuesta`);
      const alsoValid = q.options.filter((s) => s !== q.compound.second && COMPOUNDS.some((c) => c.first === q.compound.first && c.second === s));
      if (alsoValid.length) problems.push(`"${q.compound.first}" admite dos respuestas: ${q.compound.second} y ${alsoValid.join(', ')}`);
      if (!pairOk(q, q.compound.second) || pairOk(q, q.options.find((s) => s !== q.compound.second))) problems.push(`el corrector de word pairs falla con "${q.answer}"`);
    }
  }

  // 6. Preposiciones de tiempo: la respuesta cuadra con las horas que ve el nino
  const numberOf = (word) => ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'].indexOf(word) + 1;
  for (let i = 0; i < 200; i += 1) {
    const round = times();
    if (round.length !== 8) problems.push('a busy day no da 8 preguntas');
    for (const q of round) {
      if (q.options.length !== 3 || new Set(q.options).size !== 3) problems.push('a busy day no da 3 opciones distintas');
      if (!q.options.includes(q.answer)) problems.push('a busy day esconde la respuesta');
      if (!timeOk(q, q.answer) || timeOk(q, q.options.find((o) => o !== q.answer))) problems.push('el corrector de a busy day falla');
      if (q.answer === 'before' || q.answer === 'after') {
        const m = q.say.match(/^(.+) is at (\w+) o'clock\. (.+) is at (\w+) o'clock\. (.+) is (before|after) (.+)\.$/);
        if (!m) { problems.push(`frase de antes/despues mal formada: ${q.say}`); continue; }
        const hour = { [m[1].toLowerCase()]: numberOf(m[2]), [m[3].toLowerCase()]: numberOf(m[4]) };
        const left = hour[m[5].toLowerCase()];
        const right = hour[m[7].toLowerCase()];
        if ((m[6] === 'after') !== (left > right)) problems.push(`"${q.say}": el numero de la hora lleva al nino a la respuesta contraria`);
      }
    }
  }

  // 7. What's the matter? y Where are they?: escribir la palabra con banco
  const entries = new Set(SOURCE_ENTRIES.map(([w]) => w.toLowerCase()));
  if (PARTS.length < 8) problems.push(`solo ${PARTS.length} partes del cuerpo con dibujo para What's the matter?`);
  for (const part of PARTS) if (!part.icon) problems.push(`"${part.word}" no tiene dibujo y el dibujo es la unica pista`);
  if (PLACES.length < 15) problems.push(`solo ${PLACES.length} lugares en Where are they?`);
  for (const w of PLACES) {
    if (!entries.has(w.place)) problems.push(`el lugar "${w.place}" no es una entrada del wordlist`);
    if (new RegExp(`\\b${w.place}\\b`, 'i').test(w.clue)) problems.push(`la pista de "${w.place}" se chiva`);
  }
  if (new Set(PLACES.map((w) => w.clue)).size !== PLACES.length) problems.push('Where are they? repite una pista');
  for (let i = 0; i < 200; i += 1) {
    for (const [label, round, size] of [['What\'s the matter?', matter(), 5], ['Where are they?', where(), 6]]) {
      if (round.questions.length !== size) problems.push(`${label} no da ${size} preguntas`);
      if (round.bank.length !== 8 || new Set(round.bank.map((b) => b.answer)).size !== 8) problems.push(`${label} no da un banco de 8 distintas`);
      for (const q of round.questions) {
        if (!round.bank.some((b) => b.answer === q.answer)) problems.push(`${label} esconde "${q.answer}" del banco`);
        if (checkSpelling(q.answer, q.answer).kind !== 'correct') problems.push(`el corrector rechaza "${q.answer}"`);
      }
    }
  }
  for (const [typed, want, kind] of [['leg', 'leg', 'correct'], ['the library', 'library', 'correct'], ['Bus stop.', 'bus stop', 'correct'],
    ['libary', 'library', 'spelling'], ['legg', 'leg', 'spelling'], ['arm', 'leg', 'wrong'], ['', 'leg', 'empty'], ['   ', 'leg', 'empty']]) {
    if (checkSpelling(typed, want).kind !== kind) problems.push(`"${typed}" para "${want}" da ${checkSpelling(typed, want).kind} y deberia dar ${kind}`);
  }

  // 8. El inventario del cuadernillo esta completo y cada juego citado existe
  const all = [...GAMES, ...PRACTICE];
  if (CLASSROOM.length !== 18) problems.push(`el inventario del libro de aula tiene ${CLASSROOM.length} actividades y son 18`);
  for (let sheet = 1; sheet <= 6; sheet += 1) {
    for (const letter of ['A', 'B', 'C']) {
      if (CLASSROOM.filter((a) => a.sheet === sheet && a.activity === letter).length !== 1) {
        problems.push(`falta o se repite la actividad ${letter} del worksheet ${sheet} en el inventario`);
      }
    }
  }
  for (const item of CLASSROOM) {
    for (const id of item.games) {
      if (!all.some((g) => g.id === id && g.ready)) {
        problems.push(`el worksheet ${item.sheet} ${item.activity} dice que lo cubre "${id}", que no esta en el album`);
      }
    }
  }
  const covered = withGame(CLASSROOM).length;
  const missing = withoutGame(CLASSROOM).map((a) => `${a.sheet}${a.activity}`).join(' ');

  return {
    ok: problems.length === 0,
    detail: `${covered} de ${CLASSROOM.length} actividades con juego (sin juego: ${missing}); `
      + `${LY_PAIRS.length} pares -ly, ${ING_VERBS.length} verbos -ing, ${PAST_PAIRS.length} verbos en pasado, `
      + `${COMPOUNDS.length} compuestas, ${PART6_SCENES.length} escenas de yes/no`,
    problems: [...new Set(problems)],
    numbers: { tiposDeActividad: covered },
  };
}
