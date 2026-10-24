import { BOARDS, BOARD_GAMES, boardGaps } from '../src/data/boards.js';
import { EXPECT } from '../src/data/personal-questions.js';
import { ALL_WORDS, wordById, pickBatch } from '../src/engine/vocabulary.js';
import { buildRound as gaps } from '../src/games/picturegap/questions.js';
import { buildRound as gym } from '../src/games/vocab/questions.js';
import { boardQuestions, boardTiles, expectedWords, isRelevant } from '../src/games/talkpicture/boardTalk.js';
import { getGame } from '../src/games/registry.js';
import { words } from './lib/content.js';

export const name = 'Los ocho tableros del picture book estan completos y se pueden jugar';

// El picture book tiene ocho laminas tematicas. De cada una se toma el
// INVENTARIO de palabras del wordlist que senala; el texto, las preguntas y
// las frases con hueco son propios. Esta comprobacion vigila que cada tablero
// este entero y que los tres juegos que lo usan funcionen con el.
const BOARDS_IN_BOOK = 8;
const MIN_WORDS = 12;
const TALK_QUESTIONS = 4;
const MIN_GAPS = 5;
const MIN_ICON_WORDS = 6; // para que el Word gym pueda preguntar con dibujos
const PALETTE = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'grey'];

const sentences = (text) => String(text).split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
const lower = (w) => String(w).toLowerCase();

export function run() {
  const problems = [];
  const known = new Set(ALL_WORDS.map((w) => lower(w.id)));

  // 1. Hay ocho tableros, con identidad propia
  if (BOARDS.length !== BOARDS_IN_BOOK) problems.push(`hay ${BOARDS.length} tableros y el picture book tiene ${BOARDS_IN_BOOK} laminas`);
  if (new Set(BOARDS.map((b) => b.id)).size !== BOARDS.length) problems.push('dos tableros comparten id');
  if (new Set(BOARDS.map((b) => b.title)).size !== BOARDS.length) problems.push('dos tableros comparten titulo');

  for (const b of BOARDS) {
    const tag = `tablero "${b.id}"`;
    if (!b.title || !b.intro) problems.push(`${tag}: falta el titulo o el texto`);
    if (!PALETTE.includes(b.colour)) problems.push(`${tag}: el color "${b.colour}" no esta en tokens.css`);

    // 2. Sus palabras son entradas del wordlist, sin repetir y en numero
    if (b.words.length < MIN_WORDS) problems.push(`${tag}: solo tiene ${b.words.length} palabras (minimo ${MIN_WORDS})`);
    const seen = new Set();
    for (const w of b.words) {
      if (!known.has(lower(w))) problems.push(`${tag}: "${w}" no es una entrada del wordlist`);
      if (seen.has(lower(w))) problems.push(`${tag}: "${w}" esta repetida`);
      seen.add(lower(w));
    }
    const withIcon = b.words.filter((w) => wordById(w)?.icon).length;
    if (withIcon < MIN_ICON_WORDS) problems.push(`${tag}: solo ${withIcon} palabras tienen dibujo (minimo ${MIN_ICON_WORDS})`);

    // 3. El texto presenta la lamina en varias frases y usa sus palabras
    const intro = sentences(b.intro);
    if (intro.length < 3) problems.push(`${tag}: el texto tiene ${intro.length} frases y deberian ser al menos 3`);
    const introWords = new Set(words(b.intro));
    const used = b.words.filter((w) => w.split(' ').every((part) => introWords.has(lower(part)))).length;
    if (used < 4) problems.push(`${tag}: el texto solo usa ${used} palabras del tablero`);

    // 4. Cuatro preguntas de Let's talk!, con buena respuesta y pista
    if (b.talk.length !== TALK_QUESTIONS) problems.push(`${tag}: tiene ${b.talk.length} preguntas de Let's talk! y deberian ser ${TALK_QUESTIONS}`);
    for (const q of b.talk) {
      if (!q.say?.endsWith('?')) problems.push(`${tag}: la pregunta "${q.say}" no termina en interrogacion`);
      if (!q.model || !q.hint) problems.push(`${tag}: la pregunta "${q.say}" no tiene buena respuesta o pista`);
      if (typeof q.expect === 'string' && !(q.expect in EXPECT)) problems.push(`${tag}: el grupo "${q.expect}" no existe en EXPECT`);
      if (Array.isArray(q.expect) && q.expect.some((w) => w !== lower(w))) problems.push(`${tag}: las palabras esperadas de "${q.say}" van en minuscula`);
      const expect = expectedWords(q, b);
      if (!isRelevant(expect, q.model)) problems.push(`${tag}: la buena respuesta de "${q.say}" no pasaria su propio filtro`);
      if (isRelevant(expect, '')) problems.push(`${tag}: una respuesta vacia cuenta como relevante en "${q.say}"`);
      if (expect && isRelevant(expect, 'xyzzy qqq')) problems.push(`${tag}: una respuesta sin sentido cuenta como relevante en "${q.say}"`);
    }
    const built = boardQuestions(b);
    if (built.length !== b.talk.length || built.some((q) => !q.say || !q.model)) problems.push(`${tag}: Let's talk! no construye bien sus preguntas`);
    if (boardTiles(b).length !== b.words.length) problems.push(`${tag}: la lamina no muestra todas las palabras`);

    // 5. Frases con hueco: la palabra es del tablero, tiene dibujo y no se regala
    if (b.gaps.length < MIN_GAPS) problems.push(`${tag}: solo tiene ${b.gaps.length} frases con hueco (minimo ${MIN_GAPS})`);
    const targets = new Set();
    const icons = new Set();
    for (const g of b.gaps) {
      if (!b.words.includes(g.target)) problems.push(`${tag}: la frase "${g.text}" pide "${g.target}", que no esta en el tablero`);
      const icon = wordById(g.target)?.icon;
      if (!icon) problems.push(`${tag}: "${g.target}" no tiene dibujo y el banco es de dibujos`);
      if (icon && icons.has(icon)) problems.push(`${tag}: dos frases con hueco comparten el dibujo ${icon}`);
      if (icon) icons.add(icon);
      if (targets.has(g.target)) problems.push(`${tag}: "${g.target}" se pide dos veces`);
      targets.add(g.target);
      if ((g.text.match(/___/g) ?? []).length !== 1) problems.push(`${tag}: "${g.text}" no tiene exactamente un hueco`);
      const parts = lower(g.target).split(' ');
      const textWords = words(g.text);
      if (parts.length === 1 ? textWords.includes(parts[0]) : ` ${textWords.join(' ')} `.includes(` ${parts.join(' ')} `)) {
        problems.push(`${tag}: "${g.text}" regala la respuesta`);
      }
    }
  }

  // 6. Los tres juegos del tablero existen y funcionan solo con el tablero
  for (const { id } of BOARD_GAMES) {
    if (!getGame(id)?.ready) problems.push(`el juego "${id}" de los tableros no existe o no esta listo`);
  }
  for (const b of BOARDS) {
    const wanted = new Set(b.words.map(lower));
    for (let i = 0; i < 25; i += 1) {
      const round = gaps({ source: b.gaps });
      if (round.questions.length !== Math.min(6, b.gaps.length) || round.cards.length !== 8) {
        problems.push(`"${b.id}": What are they doing today? da ${round.questions.length} frases y ${round.cards.length} tarjetas`);
      }
      if (new Set(round.cards.map((c) => c.icon)).size !== round.cards.length) problems.push(`"${b.id}": dos tarjetas del banco comparten dibujo`);
      if (round.cards.some((c) => !c.icon)) problems.push(`"${b.id}": una tarjeta del banco no tiene dibujo`);
      for (const q of round.questions) {
        if (!b.gaps.some((g) => g.text === q.text && g.target === q.target)) problems.push(`"${b.id}": se cuela una frase de otro sitio`);
        if (!round.cards.some((c) => c.id === q.target)) problems.push(`"${b.id}": la respuesta "${q.target}" no esta en el banco`);
      }
      const batch = gym({ size: 10, ids: b.words });
      if (batch.length !== 10) problems.push(`"${b.id}": el Word gym da ${batch.length} preguntas en vez de 10`);
      for (const q of batch) {
        if (!wanted.has(lower(q.word.id))) problems.push(`"${b.id}": el Word gym pregunta "${q.word.id}", que no esta en el tablero`);
      }
    }
    if (pickBatch(50, null, b.words).length !== b.words.length) problems.push(`"${b.id}": pedir mas palabras que las del tablero no devuelve exactamente las del tablero`);
  }

  const boardWords = new Set(BOARDS.flatMap((b) => b.words.map(lower)));
  return {
    ok: problems.length === 0,
    detail: `${BOARDS.length} tableros, ${boardWords.size} palabras distintas, ${boardGaps().length} frases con hueco`,
    problems: [...new Set(problems)],
    numbers: { tableros: BOARDS.length, palabrasDeTablero: boardWords.size },
  };
}
