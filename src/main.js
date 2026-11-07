// @ts-check
import { qs } from './core/dom.js';
import * as router from './core/router.js';
import { initVoice } from './core/audio.js';
import { on } from './core/events.js';
import * as profiles from './core/profiles.js';
import * as state from './core/state.js';
import { renderShell } from './ui/shell.js';
import { renderAlbum } from './ui/album.js';
import { renderBoard } from './ui/board.js';
import { renderProfiles } from './ui/profiles.js';
import { renderTeacher } from './ui/teacher.js';
import { renderReport } from './ui/report.js';
import { renderPrintTest, leavePrint } from './ui/printTest.js';
import { renderExaminer, leaveExaminer } from './ui/examiner.js';
import { renderVoice, leaveVoice } from './ui/voice.js';
import * as recordings from './core/recordings.js';
import { renderSettings, leaveSettings } from './ui/settings.js';
import { renderGame, unmountActive } from './ui/gameHost.js';
import { renderMock, unmountMock } from './ui/mock.js';
import { TOPICS } from './data/topics.js';
import { getBoard, BOARD_GAMES } from './data/boards.js';
import { relocateStickers } from './engine/progress.js';
import { startOffline, keepData } from './core/offline.js';
import { markDone } from './engine/plan.js';
import { setPageTitle } from './ui/pageTitle.js';

const shellSlot = qs('#shell');
const viewSlot = qs('#view');

/** Lo que hay en pantalla, para repintarlo cuando cambian los datos. */
/** @type {{ name: string, topicId?: string, boardId?: string }} */
let current = { name: 'album', topicId: TOPICS[0].id };

initVoice();
// Las frases que el profesor grabo con su voz (se leen sin esperar: hasta que
// esten, la voz del navegador).
recordings.load();
startOffline();
if (profiles.list().length) keepData();
state.onLoad(relocateStickers);
state.useProfile(profiles.validCurrentId());
renderShell(shellSlot);

// Terminar un juego tacha su actividad en el plan del dia.
on('practice:done', (gameId) => markDone(gameId, router.current()));

on('state:changed', () => {
  if (current.name === 'album') renderAlbum(viewSlot, current.topicId);
  if (current.name === 'board') renderBoard(viewSlot, current.boardId);
});

/**
 * Las pantallas donde se juega necesitan saber quien juega. "Quien juega"
 * (profiles) y "que album esta cargado" (state) tienen que coincidir siempre:
 * si no, el progreso se guardaria en el album de otro (o en ninguno) y se
 * perderia al recargar. Aqui se ponen de acuerdo antes de pintar.
 */
const needsProfile = () => {
  const id = profiles.validCurrentId();
  if (!id) {
    router.go('/who');
    return true;
  }
  if (state.activeProfile() !== id) state.useProfile(id);
  return false;
};

/**
 * Antes de pintar otra pantalla se para lo que estaba en marcha: el juego (y
 * su voz) y el simulacro con su reloj. `keep` dice que se queda (la pantalla a
 * la que se va se encarga de el).
 * @param {'game' | 'mock' | null} [keep]
 */
const leave = (keep = null) => {
  if (keep !== 'game') unmountActive();
  if (keep !== 'mock') unmountMock();
  leaveSettings();
  leavePrint();
  leaveExaminer();
  leaveVoice();
};

router.register('/', () => {
  leave();
  if (needsProfile()) return;
  current = { name: 'album', topicId: TOPICS[0].id };
  renderAlbum(viewSlot, current.topicId);
});

router.register('/topic/:id', ({ id }) => {
  leave();
  if (needsProfile()) return;
  current = { name: 'album', topicId: id };
  renderAlbum(viewSlot, id);
});

router.register('/play/:gameId/:topicId', ({ gameId, topicId }) => {
  leave('game');
  if (needsProfile()) return;
  current = { name: 'game', topicId };
  renderGame(viewSlot, gameId, topicId);
});

router.register('/board/:id', ({ id }) => {
  leave();
  if (needsProfile()) return;
  current = { name: 'board', boardId: id };
  renderBoard(viewSlot, id);
});

router.register('/board/:id/play/:gameId', ({ id, gameId }) => {
  leave('game');
  if (needsProfile()) return;
  if (!getBoard(id)) return router.go('/');
  if (!BOARD_GAMES.some((g) => g.id === gameId)) return router.go(`/board/${id}`);
  current = { name: 'game', boardId: id };
  renderGame(viewSlot, gameId, null, { boardId: id, back: `/board/${id}` });
});

router.register('/mock', () => {
  leave('mock');
  if (needsProfile()) return;
  current = { name: 'mock' };
  renderMock(viewSlot);
});

router.register('/who', () => {
  leave();
  current = { name: 'who' };
  renderProfiles(viewSlot);
});

router.register('/teacher', () => {
  leave();
  current = { name: 'teacher' };
  renderTeacher(viewSlot);
});

router.register('/settings', () => {
  leave();
  current = { name: 'settings' };
  renderSettings(viewSlot);
});

// La voz del profesor: grabar las frases de los juegos.
router.register('/voice', () => {
  leave();
  current = { name: 'voice' };
  renderVoice(viewSlot);
});

// El Speaking cara a cara: el profesor hace de examinador.
router.register('/examiner', () => {
  leave();
  current = { name: 'examiner' };
  renderExaminer(viewSlot);
});

// Un examen de practica para imprimir; sin numero, uno nuevo.
router.register('/print', () => {
  leave();
  current = { name: 'print' };
  renderPrintTest(viewSlot);
});

router.register('/print/:seed', ({ seed }) => {
  leave();
  current = { name: 'print' };
  renderPrintTest(viewSlot, seed);
});

router.register('/report/:id', ({ id }) => {
  leave();
  current = { name: 'report' };
  renderReport(viewSlot, id);
});

// Cada pantalla nueva empieza arriba, con su nombre en la pestana y el foco
// en el contenido: quien usa teclado o lector de pantalla sabe que cambio.
router.afterEach(() => {
  window.scrollTo(0, 0);
  setPageTitle(viewSlot.querySelector('h2')?.textContent);
  if (!viewSlot.contains(document.activeElement)) viewSlot.focus({ preventScroll: true });
});

router.fallback(() => router.go('/'));
router.start();
