// @ts-check
// Informe de progreso de un alumno, para imprimir y llevar a casa.
//
// Aqui solo se REUNEN los datos que ya guarda el perfil (cromos dominados,
// escudos por parte del examen, escala de Speaking, simulacros, racha) y se
// decide que hay que practicar. Pintarlo es cosa de ui/report.js.
//
// El perfil no guarda nada nuevo salvo los simulacros terminados: hasta ahora
// el Statement of Results desaparecia al cerrar la pantalla.

import * as state from '../core/state.js';
import * as profiles from '../core/profiles.js';
import { GAMES } from '../games/registry.js';
import { TOPICS } from '../data/topics.js';
import { BOARDS } from '../data/boards.js';
import { PAPERS, statement, totalShields } from './mock.js';
import { progress, progressOf } from './vocabulary.js';
import { latestMark } from './speakingScale.js';
import { MAX_SHIELDS } from './scoring.js';

/** Simulacros que se guardan por alumno: los ultimos diez. */
export const MOCKS_KEPT = 10;

/** Escudos a partir de los cuales una parte se considera lista. */
export const READY_AT = 4;

/**
 * @typedef {Object} SavedMock
 * @property {string} when     fecha ISO (dia)
 * @property {number} shields  escudos en total
 * @property {number} outOf    escudos posibles
 * @property {{ id: string, label: string, score: number, total: number, shields: number, ranOut: boolean }[]} papers
 */

/**
 * @typedef {Object} PartLine
 * @property {string} id
 * @property {string} title
 * @property {string} tag
 * @property {number} shields   0 si no se ha jugado
 * @property {boolean} played
 * @property {'ready' | 'nearly' | 'practise' | 'new'} status
 */

/**
 * @typedef {Object} Report
 * @property {{ id: string, name: string } | null} profile
 * @property {string} date
 * @property {{ mastered: number, total: number, percent: number }} words
 * @property {{ id: string, label: string, mastered: number, total: number }[]} pages
 * @property {{ id: string, title: string, mastered: number, total: number }[]} boards
 * @property {{ shields: number, outOf: number }} shields
 * @property {PartLine[]} parts
 * @property {PartLine[]} practise   las partes mas flojas, hasta tres
 * @property {ReturnType<typeof latestMark>} speaking
 * @property {SavedMock[]} mocks
 * @property {number} streak
 * @property {string | null} lastPlayed
 */

const today = () => new Date().toISOString().slice(0, 10);

/** @param {number} shields @param {boolean} played */
export function statusOf(shields, played) {
  if (!played) return 'new';
  if (shields >= READY_AT) return 'ready';
  if (shields === READY_AT - 1) return 'nearly';
  return 'practise';
}

/**
 * Guarda el Statement of Results de un simulacro terminado en el perfil
 * activo. Devuelve lo guardado.
 * @param {ReturnType<import('./mock.js').createRun>} run
 * @returns {SavedMock}
 */
export function saveMock(run) {
  const papers = statement(run).map((p) => ({
    id: p.id, label: p.label, score: p.score, total: p.total, shields: p.shields, ranOut: p.ranOut,
  }));
  const saved = { when: today(), shields: totalShields(run), outOf: run.papers.length * MAX_SHIELDS, papers };
  state.update((s) => {
    const list = Array.isArray(s.mocks) ? s.mocks : [];
    s.mocks = [...list, saved].slice(-MOCKS_KEPT);
  });
  return saved;
}

/** @param {ReturnType<typeof state.get>} data */
export const savedMocks = (data = state.get()) => (Array.isArray(data.mocks) ? data.mocks : []);

/**
 * Reune el informe del perfil activo.
 * @returns {Report}
 */
export function buildReport() {
  const data = state.get();
  const playable = GAMES.filter((g) => g.ready);
  const parts = playable.map((g) => {
    const played = data.shields[g.id] !== undefined;
    const shields = data.shields[g.id] ?? 0;
    return { id: g.id, title: g.title, tag: g.tag, shields, played, status: statusOf(shields, played) };
  });
  // Primero lo que se ha jugado y ha salido flojo (de menos a mas escudos),
  // despues lo que no se ha probado todavia.
  const practise = [...parts]
    .filter((p) => p.status !== 'ready')
    .sort((a, b) => (Number(b.played) - Number(a.played)) || (a.shields - b.shields))
    .slice(0, 3);
  const all = progress();
  return {
    profile: profiles.current() ? { id: profiles.current().id, name: profiles.current().name } : null,
    date: today(),
    words: { ...all, percent: all.total ? Math.round((all.mastered / all.total) * 100) : 0 },
    pages: TOPICS.map((t) => ({ id: t.id, label: t.label, ...progress(t.id) })),
    boards: BOARDS.map((b) => ({ id: b.id, title: b.title, ...progressOf(b.words) })),
    shields: { shields: parts.reduce((a, p) => a + p.shields, 0), outOf: parts.length * MAX_SHIELDS },
    parts,
    practise,
    speaking: latestMark(data),
    mocks: savedMocks(data),
    streak: data.streak ?? 0,
    lastPlayed: data.lastPlayed ?? null,
  };
}

/**
 * Informe de otro perfil: cambia de perfil, lo reune y vuelve al activo.
 * @param {string} profileId
 * @returns {Report | null}
 */
export function reportFor(profileId) {
  if (!profiles.list().some((p) => p.id === profileId)) return null;
  const active = state.activeProfile();
  state.useProfile(profileId);
  const report = buildReport();
  report.profile = { id: profileId, name: profiles.list().find((p) => p.id === profileId)?.name ?? '' };
  state.useProfile(active);
  return report;
}

/** Que puede hacer la familia con cada parte floja: una linea por juego. */
export const HOME_TIPS = {
  matchnames: 'Listen to short talks about who is who. Ask: Which one is Jim? What is he doing?',
  notetaking: 'Play at writing down names, numbers and days while someone speaks slowly.',
  matchpics: 'Match what people say to pictures: What did Daisy do on Sunday?',
  tickbox: 'Listen to a short conversation and say which picture is right.',
  colour: 'Give colouring instructions: Colour the small bird on the tree green.',
  spellit: 'Read a definition and write the word. Spelling must be perfect.',
  respond: 'Answer short questions and comments in English: Would you like some tea?',
  gapstory: 'Read a short story and choose the missing words together.',
  wordchoice: 'Read a short text and choose the right small word: which, than, because.',
  readstory: 'Read a story in the past and answer with one, two or three words.',
  writeit: 'Look at a picture together and ask what colour, where and what they are doing.',
  differences: 'Compare two similar pictures: In this one the hat is red, in that one it is blue.',
  story: 'Tell what happens in four pictures: The boy is riding a bike. Then he falls.',
  oddone: 'Show four things and ask which one is different and why.',
  talkabout: 'Ask about everyday life: What is your favourite animal? What did you do yesterday?',
};

/** Los nombres de las tres pruebas, por si el informe los necesita en orden. */
export const PAPER_LABELS = PAPERS.map((p) => p.label);
