import { qs } from './core/dom.js';
import * as router from './core/router.js';
import { initVoice } from './core/audio.js';
import { on } from './core/events.js';
import * as profiles from './core/profiles.js';
import * as state from './core/state.js';
import { renderShell } from './ui/shell.js';
import { renderAlbum } from './ui/album.js';
import { renderProfiles } from './ui/profiles.js';
import { renderTeacher } from './ui/teacher.js';
import { renderGame, unmountActive } from './ui/gameHost.js';
import { renderMock, unmountMock } from './ui/mock.js';
import { TOPICS } from './data/topics.js';

const shellSlot = qs('#shell');
const viewSlot = qs('#view');

let current = { name: 'album', topicId: TOPICS[0].id };

initVoice();
state.useProfile(profiles.currentId());
renderShell(shellSlot);

on('state:changed', () => {
  if (current.name === 'album') renderAlbum(viewSlot, current.topicId);
});

const needsProfile = () => {
  if (profiles.currentId()) return false;
  router.go('/who');
  return true;
};

router.register('/', () => {
  unmountActive();
  unmountMock();
  if (needsProfile()) return;
  current = { name: 'album', topicId: TOPICS[0].id };
  renderAlbum(viewSlot, current.topicId);
});

router.register('/topic/:id', ({ id }) => {
  unmountActive();
  unmountMock();
  if (needsProfile()) return;
  current = { name: 'album', topicId: id };
  renderAlbum(viewSlot, id);
});

router.register('/play/:gameId/:topicId', ({ gameId, topicId }) => {
  if (needsProfile()) return;
  current = { name: 'game', topicId };
  renderGame(viewSlot, gameId, topicId);
});

router.register('/mock', () => {
  unmountActive();
  if (needsProfile()) return;
  current = { name: 'mock' };
  renderMock(viewSlot);
});

router.register('/who', () => {
  unmountActive();
  current = { name: 'who' };
  renderProfiles(viewSlot);
});

router.register('/teacher', () => {
  unmountActive();
  current = { name: 'teacher' };
  renderTeacher(viewSlot);
});

router.fallback(() => router.go('/'));
router.start();
