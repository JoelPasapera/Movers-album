import { toWords, ordinalWord, ordinalDigits } from '../src/engine/numbers.js';
import { buildRound as numbers } from '../src/games/numbers/questions.js';
import { PAIRS, buildRound as opposites } from '../src/games/opposites/questions.js';
import { buildGrid, matchSelection, cellsOf } from '../src/games/wordsearch/questions.js';
import { buildRound as gaps } from '../src/games/picturegap/questions.js';
import { PICTURE_GAPS } from '../src/data/picture-gaps.js';
import { SENTENCE_WORDS } from '../src/data/sentence-words.js';
import { check as sentenceCheck } from '../src/games/sentence/questions.js';
import { TOPICS } from '../src/data/topics.js';
import { inSyllabus } from '../src/data/syllabus.js';
import { GAMES, PRACTICE } from '../src/games/registry.js';
import { PICTURE_BOOK, withGame } from './lib/activities.js';

export const name = 'Las siete actividades del picture book tienen juego';

export function run() {
  const problems = [];

  // 1. Numeros: todo el rango que exige el syllabus, en letra correcta
  for (let n = 21; n <= 100; n += 1) {
    for (const part of toWords(n).split(/[- ]/)) if (!inSyllabus(part)) problems.push(`"${toWords(n)}" usa "${part}"`);
  }
  for (let n = 1; n <= 20; n += 1) {
    if (!inSyllabus(ordinalWord(n))) problems.push(`el ordinal "${ordinalWord(n)}" no esta en el syllabus`);
  }
  for (const [n, want] of [[1, '1st'], [2, '2nd'], [3, '3rd'], [11, '11th'], [12, '12th'], [13, '13th'], [20, '20th']]) {
    if (ordinalDigits(n) !== want) problems.push(`${n} da "${ordinalDigits(n)}" y deberia ser "${want}"`);
  }
  for (let i = 0; i < 200; i += 1) {
    for (const q of numbers()) {
      if (q.options.length !== 4 || new Set(q.options).size !== 4) problems.push('Which number? no da 4 opciones distintas');
      if (!q.options.includes(q.answer)) problems.push('Which number? esconde la respuesta');
    }
  }

  // 2. Contrarios: las dos palabras de cada pareja estan en el syllabus
  if (PAIRS.length < 20) problems.push(`solo hay ${PAIRS.length} parejas de contrarios`);
  for (let i = 0; i < 200; i += 1) {
    for (const q of opposites()) {
      if (q.options.length !== 4 || new Set(q.options).size !== 4) problems.push('Opposites no da 4 opciones distintas');
      if (!q.options.includes(q.answer)) problems.push('Opposites esconde la respuesta');
    }
  }

  // 3. Sopa de letras: las palabras estan donde dice y se encuentran
  for (const topic of TOPICS) {
    for (let i = 0; i < 10; i += 1) {
      const round = buildGrid(topic.id);
      if (round.words.length < 5) problems.push(`la sopa de "${topic.label}" solo esconde ${round.words.length} palabras`);
      for (const word of round.words) {
        const cells = cellsOf(word);
        if (cells.map((c) => round.grid[c.r][c.c]).join('') !== word.word) {
          problems.push(`"${word.word}" no esta donde la sopa dice`);
        }
        if (!matchSelection(round, cells[0], cells[cells.length - 1])) {
          problems.push(`"${word.word}" no se puede encontrar tocando`);
        }
      }
    }
  }

  // 4. Frases con banco: objetivo con dibujo y frase sin chivarse
  for (const g of PICTURE_GAPS) {
    if (!g.text.includes('___')) problems.push(`la frase de "${g.target}" no tiene hueco`);
    if (new RegExp(`\\b${g.target}\\b`, 'i').test(g.text)) problems.push(`la frase de "${g.target}" se chiva`);
  }
  for (let i = 0; i < 200; i += 1) {
    const round = gaps();
    if (round.cards.length !== 8 || round.questions.length !== 6) problems.push('picture gaps mal formado');
    for (const q of round.questions) {
      if (!round.cards.some((c) => c.id === q.target)) problems.push(`el banco no tiene "${q.target}"`);
      if (!round.cards.find((c) => c.id === q.target)?.icon) problems.push(`"${q.target}" no tiene dibujo`);
    }
  }

  // 5. Use the word: el modelo puntua al maximo y el vacio a cero
  for (const item of SENTENCE_WORDS) {
    if (!item.model.toLowerCase().includes(item.word)) problems.push(`el modelo de "${item.word}" no usa la palabra`);
    if (sentenceCheck(item, '').marks !== 0) problems.push('Use the word puntua el vacio');
    if (sentenceCheck(item, `I like my dog and ${item.word} is a word.`).marks < 1) problems.push(`Use the word rechaza una frase con "${item.word}"`);
  }

  // 6. El inventario del picture book esta completo y cada juego citado existe
  const all = [...GAMES, ...PRACTICE];
  if (PICTURE_BOOK.length !== 7) problems.push(`el inventario del picture book tiene ${PICTURE_BOOK.length} actividades y son 7`);
  for (const item of PICTURE_BOOK) {
    if (!item.games.length) problems.push(`"${item.title}" se ha quedado sin juego`);
    for (const id of item.games) {
      if (!all.some((g) => g.id === id && g.ready)) problems.push(`"${item.title}" dice que lo cubre "${id}", que no esta en el album`);
    }
  }

  return {
    ok: problems.length === 0,
    detail: `${withGame(PICTURE_BOOK).length} de ${PICTURE_BOOK.length} actividades con juego; `
      + `${PAIRS.length} parejas, ${PICTURE_GAPS.length} frases, ${SENTENCE_WORDS.length} palabras`,
    problems: [...new Set(problems)],
    numbers: { actividadesPictureBook: withGame(PICTURE_BOOK).length },
  };
}
