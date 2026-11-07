import { TOPICS } from '../src/data/topics.js';
import { allPicturable } from '../src/data/wordlist.js';
import { buildRound as hunt } from '../src/games/wordhunt/questions.js';
import { buildRound as tick, iconFor } from '../src/games/tickbox/questions.js';
import { TICKBOX } from '../src/data/tickbox.js';
import { buildRound as colour } from '../src/games/colour/questions.js';
import { randomScene } from '../src/data/scenes/index.js';
import { buildRound as spell } from '../src/games/spellit/questions.js';
import { definitionsFor, allDefinitions, DEFINITIONS } from '../src/data/definitions.js';
import { buildRound as odd } from '../src/games/oddone/questions.js';
import { buildRound as diff } from '../src/games/differences/questions.js';
import { buildRound as story } from '../src/games/story/questions.js';
import { buildRound as names } from '../src/games/matchnames/questions.js';
import { buildRound as pics } from '../src/games/matchpics/questions.js';
import { MATCH_SETS } from '../src/data/matching.js';
import { buildRound as talk } from '../src/games/talkabout/questions.js';
import { ROUND as DICTATION, nextSpelling, nextNumber, spelled } from '../src/games/letters/questions.js';
import { spellingPool, NUMBER_LINES } from '../src/data/letters.js';
import { twinOf } from '../src/engine/letters.js';
import { toWords } from '../src/engine/numbers.js';
import { inSyllabus } from '../src/data/syllabus.js';
import { allSets, drawable } from '../src/data/oddoneout.js';
import { buildPrintTest, answerKey, listeningScript, parseSeed } from '../src/engine/printTest.js';

export const name = 'Los generadores nunca crean partidas rotas';

const ROUNDS = 300;

export function run() {
  const problems = new Set();
  const pool = allPicturable();
  const defs = allDefinitions();

  for (const topic of TOPICS) {

  // Speaking parte 1: el examinador describe SU dibujo y no chiva el del nino
  for (let i = 0; i < 100; i += 1) {
    for (const d of diff().differences) {
      if (!d.examiner.startsWith('In my picture ') || !d.examiner.endsWith('And in your picture?')) problems.add(`la linea del examinador esta mal formada: ${d.examiner}`);
      if (!d.model.startsWith('In my picture ')) problems.add(`el modelo esta mal formado: ${d.model}`);
      const yours = d.model.replace(/^In my picture .* (is|are) /, '').replace(/\.$/, '');
      if (d.examiner.includes(yours)) problems.add(`el examinador chiva la diferencia: ${d.examiner}`);
    }
  }

  // Listening parte 4: cada dialogo nombra los tres dibujos y la pregunta no
  // se chiva. Es lo que hace que haya que escuchar hasta el final.
  for (const item of TICKBOX) {
    if (item.options.length !== 3 || new Set(item.options).size !== 3) problems.add(`"${item.id}" no tiene 3 dibujos distintos`);
    if (!item.options.includes(item.answer)) problems.add(`"${item.id}" esconde la respuesta`);
    const said = item.lines.map((l) => l.text.toLowerCase()).join(' ');
    for (const word of item.options) {
      if (!said.includes(word.toLowerCase())) problems.add(`el dialogo "${item.id}" no nombra "${word}"`);
      if (!iconFor(word)) problems.add(`"${word}" no tiene dibujo en el album`);
    }
    if (item.question.toLowerCase().includes(item.answer.toLowerCase())) problems.add(`la pregunta de "${item.id}" se chiva`);
    if (!item.lines.some((l) => l.who === 'adult') || !item.lines.some((l) => l.who === 'child')) problems.add(`"${item.id}" no es un dialogo adulto-nino`);
  }
  for (let i = 0; i < 200; i += 1) {
    const round = tick();
    if (round.length !== 5) problems.add('Listen and tick no da 5 preguntas');
    if (new Set(round.map((q) => q.id)).size !== 5) problems.add('Listen and tick repite un dialogo');
    for (const q of round) {
      if (q.options.map((o) => o.letter).join('') !== 'ABC') problems.add('Listen and tick no marca A, B, C');
      if (!q.options.some((o) => o.word === q.answer)) problems.add('Listen and tick esconde la respuesta');
    }
  }
    for (let i = 0; i < 30; i += 1) {
      const round = hunt(topic.words, pool);
      if (round.length < 5) problems.add(`Word hunt da solo ${round.length} preguntas en "${topic.label}"`);
      for (const q of round) {
        const ids = q.options.map((o) => o.id);
        const icons = q.options.map((o) => o.icon);
        if (q.options.length !== 4) problems.add('Word hunt no ensena 4 dibujos');
        if (new Set(ids).size !== 4) problems.add('Word hunt repite una opcion');
        if (new Set(icons).size !== 4) problems.add('Word hunt ensena dos dibujos iguales');
        if (!ids.includes(q.target.id)) problems.add('Word hunt esconde la respuesta correcta');
      }
    }
    if (DEFINITIONS[topic.id]) {
      for (let i = 0; i < 30; i += 1) {
        const round = spell(definitionsFor(topic.id), defs);
        if (!round || round.bank.length !== 8 || round.questions.length !== 5) {
          problems.add(`Spell it mal formado en "${topic.label}"`);
        }
      }
    }
  }

  for (let i = 0; i < ROUNDS; i += 1) {
    if (colour(randomScene()).length !== 5) problems.add('Listen and colour no da 5 preguntas');
    const o = odd();
    if (o.length !== 4) problems.add('The odd one out no da 4 conjuntos');
    for (const q of o) {
      if (new Set(q.groupOptions).size !== 3 || new Set(q.oddOptions).size !== 3) {
        problems.add('The odd one out repite una ficha de razon');
      }
    }
    const d = diff();
    if (d.differences.length !== 4) problems.add('Find the differences no da 4 diferencias');
    for (const one of d.differences) {
      if (one.left === one.right) problems.add('Find the differences crea una diferencia falsa');
    }
    const s = story();
    if (s.panels.length !== 4) problems.add('Tell the story no da 4 vinetas');
    const n = names();
    if (n.questions.length !== 5) problems.add('Match the names no da 5 preguntas');
    if (n.names.length !== 7) problems.add('Match the names no ensena 7 nombres');
    if (n.people.some((p) => p.name === n.extraName)) problems.add('Match the names usa el nombre que deberia sobrar');
    const pairs = n.people.map((p) => `${p.shirt}|${p.action}`);
    if (new Set(pairs).size !== 6) problems.add('Match the names crea dos personas identicas');
    if (talk().length !== 6) problems.add('Talk about you no da 6 preguntas');
    // Handbook, Listening parte 3: un ejemplo y 5 preguntas, ocho dibujos (A-H),
    // dos de ellos sobran. Antes la app daba 4 preguntas y 7 dibujos.
    for (const set of MATCH_SETS) {
      const r = pics(set);
      if (r.questions.length !== 5) problems.add(`Listen and match "${set.id}" no da 5 preguntas`);
      if (r.cards.length !== 8) problems.add(`Listen and match "${set.id}" no ensena 8 imagenes`);
      if (new Set(r.cards.map((c) => c.icon)).size !== r.cards.length) problems.add(`Listen and match "${set.id}" repite un dibujo`);
      if (new Set(r.cards.map((c) => c.letter)).size !== 8) problems.add(`Listen and match "${set.id}" repite una letra`);
      if (set.extras.length !== 2) problems.add(`Listen and match "${set.id}" no tiene exactamente dos dibujos de sobra`);
    }
  }

  dictation(problems);
  printedTests(problems);
  oddPictures(problems);

  return {
    ok: problems.size === 0,
    detail: `${ROUNDS} rondas de cada juego`,
    problems: [...problems],
  };
}

/**
 * Dictado de letras y numeros (Listening 2): lo que se deletrea esta en el
 * syllabus y se deletrea entero, letra a letra; cada numero cabe en su frase
 * (nadie tiene una abuela de 14 anos); en cada partida salen parejas como 14 y
 * 40; y lo que el nino falla sale mas, en la partida y en las siguientes.
 * @param {Set<string>} problems
 */
function dictation(problems) {
  const rng = Math.random;
  for (const topic of TOPICS) {
    const pool = spellingPool(topic.id);
    if (pool.names.length < 30) problems.add('el dictado tiene pocos nombres para deletrear');
    for (const w of [...pool.names, ...pool.words]) {
      if (!inSyllabus(w.toLowerCase())) problems.add(`el dictado deletrea "${w}", que no esta en el syllabus`);
    }
  }
  for (const line of NUMBER_LINES) {
    if (line.text.split('{n}').length !== 2) problems.add(`la frase "${line.text}" no tiene un hueco para el numero`);
    if (line.min < 13 || line.max > 100 || line.min > line.max) problems.add(`la frase "${line.text}" pide numeros fuera de 13-100`);
  }
  for (let i = 0; i < ROUNDS; i += 1) {
    const pool = spellingPool(TOPICS[i % TOPICS.length].id);
    const picker = { history: {}, focus: new Set(), used: new Set(), rng };
    /** @type {any[]} */
    const items = [];
    let numbers = 0;
    for (const kind of DICTATION) {
      if (kind === 'number') { items.push(nextNumber(numbers, picker)); numbers += 1; } else items.push(nextSpelling(pool, picker));
    }
    if (items.filter((x) => x.kind === 'spell').length !== 6 || numbers !== 4) problems.add('el dictado no da 6 deletreos y 4 numeros');
    if (new Set(items.map((x) => x.answer)).size !== items.length) problems.add('el dictado repite en la misma partida');
    if (items.filter((x) => x.kind === 'number' && x.twin !== null).length < 2) problems.add('el dictado no trae dos parejas como 14 y 40');
    for (const x of items) {
      if (x.kind === 'spell') {
        if (x.say !== `${spelled(x.answer)}.` || x.letters.join('') !== x.answer.toUpperCase()) problems.add(`"${x.answer}" no se deletrea letra a letra: ${x.say}`);
        continue;
      }
      const line = NUMBER_LINES.find((l) => l.text.replace('{n}', toWords(x.n)) === x.say);
      if (!line) problems.add(`el ${x.n} no se dice en su frase: ${x.say}`);
      else if (x.n < line.min || x.n > line.max) problems.add(`"${x.say}" no tiene sentido`);
      if (x.answer !== String(x.n) || x.twin !== twinOf(x.n)) problems.add(`el ${x.n} no tiene bien su respuesta o su pareja`);
    }
  }
  // Una letra que el nino falla mucho (la J) sale mas que si no la fallara.
  const names = spellingPool('names');
  let withJ = 0;
  let withoutHistory = 0;
  for (let i = 0; i < 400; i += 1) {
    if (nextSpelling(names, { history: { J: { r: 0, w: 8 } }, focus: new Set(), used: new Set(), rng }).letters.includes('J')) withJ += 1;
    if (nextSpelling(names, { history: {}, focus: new Set(), used: new Set(), rng }).letters.includes('J')) withoutHistory += 1;
  }
  if (withJ < withoutHistory * 1.5) problems.add(`el dictado no trae mas la letra que el nino falla (${withJ} contra ${withoutHistory})`);
  // Y una pareja que se acaba de confundir (14 por 40) vuelve en la partida.
  let back = 0;
  for (let i = 0; i < 200; i += 1) {
    const x = nextNumber(1, { history: {}, focus: new Set(['14', '40']), used: new Set(), rng });
    if (x.n === 14 || x.n === 40) back += 1;
  }
  if (back < 60) problems.add(`una pareja confundida no vuelve en el dictado (${back} de 200)`);
}

/**
 * El intruso: en un conjunto nunca dos cosas con el mismo dibujo (se vio el
 * brazo y el hombro con el mismo, y el rio y el lago); y hay conjuntos de
 * sobra que se entienden solo con dibujos para el Speaking cara a cara.
 * @param {Set<string>} problems
 */
function oddPictures(problems) {
  for (const set of allSets()) {
    const icons = set.items.map((i) => i.icon).filter((icon) => icon && icon !== '\u2753');
    if (new Set(icons).size !== icons.length) problems.add(`en el intruso "${set.id}" dos cosas tienen el mismo dibujo`);
  }
  if (allSets().filter(drawable).length < 12) problems.add('hay pocos conjuntos del intruso que se entiendan solo con dibujos');
  for (let i = 0; i < 100; i += 1) {
    if (!odd({ sets: 4, pictures: true }).every(drawable)) problems.add('el intruso con dibujos trae un conjunto sin dibujos');
  }
}

/**
 * El examen para imprimir: con el mismo numero sale siempre el mismo examen
 * (el profesor lo imprime hoy y pone el audio manana), Math.random vuelve a
 * ser el de siempre al acabar, cada parte tiene lo que tiene en el examen de
 * verdad (25 puntos de Listening y 39 de Reading and Writing) y las
 * respuestas casan con las preguntas.
 * @param {Set<string>} problems
 */
function printedTests(problems) {
  const random = Math.random;
  for (const bad of [0, -1, 1.5, 'abc', 1e7, '', null]) if (parseSeed(bad) !== null) problems.add(`el examen impreso acepta el numero ${String(bad)}`);
  if (parseSeed('42') !== 42) problems.add('el examen impreso no acepta el numero 42 de la direccion');
  for (let seed = 1; seed <= 120; seed += 1) {
    const test = buildPrintTest(seed);
    if (Math.random !== random) { problems.add('el examen impreso deja Math.random cambiado'); break; }
    if (JSON.stringify(test) !== JSON.stringify(buildPrintTest(seed))) problems.add(`el examen impreso ${seed} no sale igual dos veces`);
    const { names, form, pictures, ticks, colours } = test.listening;
    const { spell, dialogue, gapStory, cloze, story, picture } = test.reading;
    const counts = [
      ['Listening 1', names.questions.length, 5], ['Listening 2', form.questions.length, 5], ['Listening 3', pictures.questions.length, 5],
      ['Listening 4', ticks.length, 5], ['Listening 5', colours.length, 5], ['Reading 1', spell.questions.length, 5],
      ['Reading 1 (caja)', spell.bank.length, 8], ['Reading 2', dialogue.turns.length, 6], ['Reading 3', gapStory.answers.length, 5],
      ['Reading 4', cloze.gaps.length, 5], ['Reading 5', story.questions.length, 7], ['Reading 6', picture.prompts.length, 6],
    ];
    for (const [what, got, want] of counts) if (got !== want) problems.add(`el examen impreso trae ${got} preguntas en ${what} y son ${want}`);
    const key = answerKey(test);
    const marks = (/** @type {string} */ prefix) => key.filter((k) => k.id.startsWith(prefix)).reduce((a, k) => a + k.marks, 0);
    if (marks('l') !== 25 || marks('r') !== 39) problems.add(`el examen impreso vale ${marks('l')} y ${marks('r')} puntos, no 25 y 39`);
    for (const k of key) if (k.answers.some((a) => !a || /undefined|null|NaN/.test(a))) problems.add(`las respuestas de ${k.title} tienen un hueco`);
    const letters = pictures.cards.map((c) => c.letter);
    if (![pictures.example, ...pictures.questions].every((q) => letters.includes(q.letter))) problems.add('en Listening 3 impreso una respuesta no tiene dibujo');
    if (new Set([pictures.example, ...pictures.questions].map((q) => q.letter)).size !== 6) problems.add('en Listening 3 impreso dos personas van al mismo dibujo');
    if (!ticks.every((q) => q.options.some((o) => o.word === q.answer))) problems.add('en Listening 4 impreso falta la respuesta entre los dibujos');
    if (!gapStory.answers.every((a) => gapStory.bank.some((b) => b.word === a))) problems.add('en Reading 3 impreso una respuesta no esta en la caja');
    if (names.names.length !== 7 || !names.names.includes(names.example.name)) problems.add('en Listening 1 impreso no hay siete nombres con el del ejemplo');
    const script = listeningScript(test);
    if (script.length !== 5 || script.some((p) => !p.items.length || p.items.some((lines) => !lines.length))) problems.add('el guion de Listening impreso tiene una parte vacia');
  }
}
