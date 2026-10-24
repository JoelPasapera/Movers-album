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
    for (const set of MATCH_SETS) {
      const r = pics(set);
      if (r.questions.length !== 4) problems.add('Listen and match no da 4 preguntas');
      if (r.cards.length !== 7) problems.add('Listen and match no ensena 7 imagenes');
    }
  }

  return {
    ok: problems.size === 0,
    detail: `${ROUNDS} rondas de cada juego`,
    problems: [...problems],
  };
}
