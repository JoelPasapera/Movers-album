// Simulacro completo. Encadena las 15 partes en el orden y con los tiempos
// del examen real, y al final entrega un Statement of Results.
//
// Tiempos oficiales del handbook:
//   Listening            unos 25 minutos, 5 partes, 25 preguntas
//   Reading and Writing  30 minutos exactos, 6 partes, 35 preguntas, 39 puntos
//   Speaking             5 a 7 minutos, 4 partes, cara a cara

import { GAMES } from '../games/registry.js';
import { shieldsFor } from './scoring.js';
import { scaleShields, validBands, capPronunciation } from './speakingScale.js';
import { LISTENS_FOR } from '../data/speaking-scale.js';

export const PAPERS = [
  {
    id: 'listening',
    label: 'Listening',
    minutes: 25,
    marks: 25,
    timed: true,
    parts: ['matchnames', 'notetaking', 'matchpics', 'tickbox', 'colour'],
    tip: 'You hear everything twice. Not three times.',
  },
  {
    id: 'reading',
    label: 'Reading and Writing',
    minutes: 30,
    marks: 39,
    timed: true,
    parts: ['spellit', 'respond', 'gapstory', 'wordchoice', 'readstory', 'writeit'],
    tip: 'Spelling has to be perfect. Write only what you need.',
  },
  {
    id: 'speaking',
    label: 'Speaking',
    minutes: 7,
    marks: 0,
    timed: false,
    parts: ['differences', 'story', 'oddone', 'talkabout'],
    tip: LISTENS_FOR,
  },
];

export const gameFor = (id) => GAMES.find((g) => g.id === id);

export function createRun(paperIds = PAPERS.map((p) => p.id)) {
  const papers = PAPERS.filter((p) => paperIds.includes(p.id));
  return {
    papers,
    paper: 0,
    part: 0,
    results: {},
    startedAt: Date.now(),
    ranOut: {},
    scale: null,    // autoevaluacion de Speaking con la escala del handbook
  };
}

export const currentPaper = (run) => run.papers[run.paper] ?? null;

export const currentGameId = (run) => currentPaper(run)?.parts[run.part] ?? null;

export function record(run, gameId, score, total) {
  const paper = currentPaper(run);
  if (!paper) return run;
  if (!run.results[paper.id]) run.results[paper.id] = [];
  run.results[paper.id].push({ gameId, score, total });
  return run;
}

// Avanza a la siguiente parte, o a la siguiente prueba. Devuelve 'part',
// 'paper' o 'end'.
export function advance(run) {
  const paper = currentPaper(run);
  if (!paper) return 'end';
  if (run.part + 1 < paper.parts.length) {
    run.part += 1;
    return 'part';
  }
  run.part = 0;
  run.paper += 1;
  return run.paper < run.papers.length ? 'paper' : 'end';
}

// Cuando se acaba el tiempo, las partes que no se llegaron a hacer cuentan cero.
export function timeUp(run) {
  const paper = currentPaper(run);
  if (!paper) return;
  run.ranOut[paper.id] = true;
  for (let i = run.part; i < paper.parts.length; i += 1) {
    const id = paper.parts[i];
    if ((run.results[paper.id] ?? []).some((r) => r.gameId === id)) continue;
    if (!run.results[paper.id]) run.results[paper.id] = [];
    run.results[paper.id].push({ gameId: id, score: 0, total: 0, skipped: true });
  }
  run.part = 0;
  run.paper += 1;
}

// En el examen real los escudos de Speaking no salen de aciertos: salen de la
// escala del examinador. Aqui, si hay autoevaluacion con la escala, manda;
// los aciertos se siguen ensenando como informacion.
export function recordScale(run, bands) {
  const { score, total } = marksOf(run, 'speaking');
  run.scale = validBands(bands) ? capPronunciation(bands, total ? score / total : 0) : null;
  return run.scale;
}

function marksOf(run, paperId) {
  const rows = run.results[paperId] ?? [];
  const score = rows.reduce((a, r) => a + r.score, 0);
  const total = rows.reduce((a, r) => a + r.total, 0);
  return { score, total };
}

export function paperScore(run, paperId) {
  const { score, total } = marksOf(run, paperId);
  if (paperId === 'speaking' && run.scale) {
    return { score, total, shields: scaleShields(run.scale), scale: run.scale };
  }
  return { score, total, shields: shieldsFor(score, total || 1) };
}

export function statement(run) {
  return run.papers.map((paper) => ({
    ...paper,
    ...paperScore(run, paper.id),
    ranOut: Boolean(run.ranOut[paper.id]),
    rows: (run.results[paper.id] ?? []).map((row) => ({
      ...row,
      title: gameFor(row.gameId)?.title ?? row.gameId,
      tag: gameFor(row.gameId)?.tag ?? '',
    })),
  }));
}

export const totalShields = (run) =>
  statement(run).reduce((a, p) => a + p.shields, 0);
