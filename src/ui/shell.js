// @ts-check
// La barra de arriba: quien juega, sonido, ajustes, escudos y racha. Debajo,
// los avisos que tienen que verse en todas las pantallas: que el aparato no
// tiene voz inglesa, y que el reconocimiento de voz esta encendido.

import { h, mount as fill } from '../core/dom.js';
import { on } from '../core/events.js';
import * as state from '../core/state.js';
import * as profiles from '../core/profiles.js';
import * as speech from '../core/speech.js';
import { totalShields } from '../engine/progress.js';
import { isMuted, setMuted, englishVoiceAvailable } from '../core/audio.js';
import * as router from '../core/router.js';
import { offlineStatus, applyUpdate } from '../core/offline.js';

/** @param {HTMLElement} container */
export function renderShell(container) {
  const shields = h('div', { class: 'shields', role: 'img' });
  const streak = h('div', { class: 'streak' });
  const who = h('button', { class: 'who-chip', onClick: () => router.go('/who') });
  const voiceNotice = h('p', { class: 'voice-notice hidden', role: 'status' });
  const listeningNotice = h('div', { class: 'voice-notice voice-notice--listening hidden', role: 'status' }, [
    h('span', {}, 'Listening is on: your voice goes to the browser’s speech service to be turned into words.'),
    h('button', { class: 'btn btn--ghost', onClick: () => speech.allowRecognition(false) }, 'Turn it off'),
  ]);

  const fullNotice = h('p', { class: 'voice-notice hidden', role: 'alert' },
    'This device is full, so progress is not being saved. Make a backup in Settings and free some space.');

  const updateNotice = h('div', { class: 'voice-notice voice-notice--update hidden', role: 'status' }, [
    h('span', {}, 'A new version of the album is ready.'),
    h('button', { class: 'btn btn--ghost', onClick: () => applyUpdate() }, 'Reload'),
  ]);
  const paintUpdate = () => updateNotice.classList.toggle('hidden', offlineStatus().state !== 'update');

  // El nombre del boton es lo que se lee ("Sound on" / "Sound off"); en un
  // movil solo se ve el dibujo, pero el nombre sigue ahi para quien no ve.
  const muteIcon = h('span', { class: 'mute__icon', 'aria-hidden': 'true' });
  const muteLabel = h('span', { class: 'mute__label' });
  const mute = h('button', {
    class: 'btn btn--ghost mute',
    onClick: () => paintMute(setMuted(!isMuted())),
  }, [muteIcon, muteLabel]);
  /** @param {boolean} muted */
  function paintMute(muted) {
    mute.classList.toggle('mute--off', muted);
    muteIcon.textContent = muted ? '\u{1F507}' : '\u{1F50A}';
    muteLabel.textContent = muted ? 'Sound off' : 'Sound on';
  }

  const settings = h('button', {
    class: 'btn btn--ghost settings-chip',
    'aria-label': 'Settings: voice, speed and backups',
    title: 'Settings',
    onClick: () => router.go('/settings'),
  }, '⚙️');

  function paint() {
    const total = totalShields();
    shields.setAttribute('aria-label', `${total} of 5 shields`);
    fill(shields, ...Array.from({ length: 5 }, (unused, i) => h('div', {
      class: `shield${i < total ? '' : ' shield--off'}`,
    })));
    const days = state.get().streak;
    streak.textContent = days > 0
      ? `${days} day${days > 1 ? 's' : ''} in a row`
      : 'Start today';
    who.textContent = profiles.current()?.name ?? 'Who is playing?';
  }

  // Chrome carga las voces un momento despues de abrir la pagina: se espera
  // a que lleguen (o dos segundos) antes de decir que no hay ninguna inglesa.
  let voicesKnown = false;
  function checkVoice() {
    if (!('speechSynthesis' in window)) {
      voiceNotice.textContent = 'This browser cannot speak, so you will not hear the words. Try Chrome, Edge or Safari.';
      voiceNotice.classList.remove('hidden');
      return;
    }
    if (englishVoiceAvailable() || !voicesKnown) {
      voiceNotice.classList.add('hidden');
      return;
    }
    voiceNotice.textContent = 'This device has no English voice, so the words may sound wrong. '
      + 'Add an English voice in your system settings, then choose it in Settings.';
    voiceNotice.classList.remove('hidden');
  }

  function paintListening() {
    listeningNotice.classList.toggle('hidden', !speech.isRecognitionAllowed());
  }

  const bar = h('div', { class: 'topbar' }, [
    h('button', {
      class: 'brand',
      onClick: () => router.go('/'),
      html: 'My <em>Movers</em> album',
    }),
    who,
    h('div', { class: 'topbar__spacer' }),
    settings,
    mute,
    shields,
    streak,
  ]);

  fill(container, bar, fullNotice, updateNotice, voiceNotice, listeningNotice);
  paint();
  paintMute(isMuted());
  paintListening();
  checkVoice();
  if ('speechSynthesis' in window) {
    window.speechSynthesis.addEventListener?.('voiceschanged', () => { voicesKnown = true; checkVoice(); });
    setTimeout(() => { voicesKnown = true; checkVoice(); }, 2000);
  }
  on('state:changed', paint);
  on('speech:recognition', paintListening);
  on('offline:status', paintUpdate);
  on('storage:failed', () => fullNotice.classList.remove('hidden'));
  paintUpdate();
  on('settings:changed', (/** @type {{ muted: boolean }} */ s) => paintMute(s.muted));
}
