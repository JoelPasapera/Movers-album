// @ts-check
// Ajustes de este aparato: la voz inglesa, la velocidad de practica, el
// sonido, el reconocimiento de voz, el uso sin internet y las copias de
// seguridad. Cada seccion es una funcion pequena: anadir otra no toca las demas.

import { h, mount as fill } from '../core/dom.js';
import {
  englishVoices, currentVoiceURI, setVoice, sample, setSpeed, isMuted, setMuted, RATES,
} from '../core/audio.js';
import { getSettings } from '../core/settings.js';
import * as speech from '../core/speech.js';
import { offlineStatus, canInstall, install, applyUpdate } from '../core/offline.js';
import { on } from '../core/events.js';
import * as router from '../core/router.js';
import { backupPanel } from './backup.js';
import * as recordings from '../core/recordings.js';

/** Los avisos que escucha la pantalla de Ajustes mientras se ve. @type {(() => void)[]} */
const subscriptions = [];

/**
 * Escucha un aviso mientras `box` siga en pantalla. Al salir de Ajustes (o al
 * volver a pintarlos) se deja de escuchar: si no, cada visita dejaba un oyente
 * colgado, con su caja ya quitada, hasta que llegara un aviso que quiza nunca
 * llega.
 * @param {HTMLElement} box @param {string} event @param {() => void} paint
 */
function whileShown(box, event, paint) {
  const off = on(event, () => (box.isConnected ? paint() : off()));
  subscriptions.push(off);
}

/** Deja de escuchar lo que escuchaba la pantalla de Ajustes. */
export function leaveSettings() {
  for (const off of subscriptions.splice(0)) off();
}

/**
 * Botones que se comportan como un grupo de opciones (uno pulsado).
 * @param {string} label
 * @param {{ value: string, text: string }[]} options
 * @param {string} chosen
 * @param {(value: string) => void} onPick
 */
function choice(label, options, chosen, onPick) {
  const buttons = options.map((o) => h('button', {
    class: 'btn btn--ghost choice',
    type: 'button',
    'aria-pressed': String(o.value === chosen),
    onClick: () => {
      for (const b of buttons) b.setAttribute('aria-pressed', 'false');
      buttons[options.indexOf(o)].setAttribute('aria-pressed', 'true');
      onPick(o.value);
    },
  }, o.text));
  return h('div', { class: 'choices', role: 'group', 'aria-label': label }, buttons);
}

/** La voz del profesor: cuantas frases tiene grabadas y donde se graban. */
function teacherVoice() {
  const n = recordings.count();
  return h('p', { class: 'settings-voice' }, [
    n ? `Your own voice: ${n} sentence${n === 1 ? '' : 's'} recorded on this device. ` : 'You can also record the sentences with your own voice. ',
    h('button', { class: 'btn', onClick: () => router.go('/voice') }, 'Your voice'),
  ]);
}

function voiceSection() {
  const box = h('section', { class: 'settings-block' });
  const paint = () => {
    const voices = englishVoices();
    const current = currentVoiceURI();
    if (!('speechSynthesis' in window)) {
      fill(box, [
        h('h3', {}, 'Voice'),
        h('p', {}, 'This browser cannot speak. The listening games need a voice: use Chrome, Edge or Safari.'),
        teacherVoice(),
      ]);
      return;
    }
    const select = /** @type {HTMLSelectElement} */ (h('select', { class: 'teacher-select', 'aria-label': 'English voice' },
      voices.map((v) => h('option', { value: v.uri, ...(v.uri === current ? { selected: 'selected' } : {}) },
        `${v.name} (${v.lang})${v.local ? '' : ' · needs internet'}`))));
    select.addEventListener('change', () => { setVoice(select.value); sample(); });
    fill(box, [
      h('h3', {}, 'Voice'),
      voices.length
        ? h('p', {}, 'The voice that reads the words and the listening tests. A British voice is closest to the real test.')
        : h('p', { class: 'settings-warn' }, 'This device has no English voice yet. Add one in the system settings '
          + '(Android: Settings › Language › Text-to-speech; iPad: Settings › Accessibility › Spoken content; '
          + 'Windows: Settings › Time and language › Speech), then come back here.'),
      voices.length ? h('div', { class: 'writer' }, [select, h('button', { class: 'btn btn--go', onClick: () => sample() }, 'Test the voice')]) : null,
      teacherVoice(),
    ]);
  };
  paint();
  // Las voces llegan un momento despues; si ya se salio de Ajustes, se olvida.
  const onVoices = () => {
    if (!box.isConnected) {
      window.speechSynthesis?.removeEventListener?.('voiceschanged', onVoices);
      return;
    }
    paint();
  };
  window.speechSynthesis?.addEventListener?.('voiceschanged', onVoices);
  return box;
}

function speedSection() {
  return h('section', { class: 'settings-block' }, [
    h('h3', {}, 'Speed for practice'),
    h('p', {}, `Slow helps at the start. The mock test always uses the speed of the real test (${RATES.normal}).`),
    choice('Speed', [{ value: 'normal', text: 'Normal' }, { value: 'slow', text: 'Slow' }],
      getSettings().speed, (value) => { setSpeed(value === 'slow' ? 'slow' : 'normal'); sample(); }),
  ]);
}

function soundSection() {
  return h('section', { class: 'settings-block' }, [
    h('h3', {}, 'Sound'),
    h('p', {}, 'Turns off the voice and the beeps on this device. The listening games need the sound on.'),
    choice('Sound', [{ value: 'on', text: 'Sound on' }, { value: 'off', text: 'Sound off' }],
      isMuted() ? 'off' : 'on', (value) => setMuted(value === 'off')),
  ]);
}

function listeningSection() {
  const box = h('section', { class: 'settings-block' });
  const paint = () => {
    const supported = speech.recognitionSupported();
    const allowed = speech.isRecognitionAllowed();
    fill(box, [
      h('h3', {}, 'Speech recognition'),
      h('p', {}, 'In the speaking games the app can turn the child’s voice into words to check the answer. '
        + 'To do that, Chrome and Edge send the sound to their speech service on the internet. '
        + 'It is off unless you turn it on, it switches off again when the page is closed, '
        + 'and while it is on a notice stays at the top of every screen.'),
      supported
        ? choice('Speech recognition', [{ value: 'off', text: 'Off (recommended)' }, { value: 'on', text: 'On for now' }],
          allowed ? 'on' : 'off', (value) => speech.allowRecognition(value === 'on'))
        : h('p', { class: 'settings-note' }, 'This browser has no speech recognition. Children record themselves or type instead.'),
    ]);
  };
  paint();
  return { box, paint };
}

const OFFLINE_TEXT = {
  unsupported: 'This browser cannot keep the album for use without internet. It works while there is internet.',
  local: 'Opened from this computer (localhost): working without internet is switched off here, so changes to the code show up straight away.',
  installing: 'Saving the album on this device\u2026 Keep this page open for a moment.',
  ready: 'Ready: the album works on this device without internet.',
  update: 'A new version of the album is ready. Reload to use it.',
  error: 'The album could not be saved for use without internet. It still works with internet.',
};

function offlineSection() {
  const box = h('section', { class: 'settings-block' });
  const paint = () => {
    const s = offlineStatus();
    const details = s.state === 'ready' && s.version
      ? ` Version ${s.version}${s.total ? `, ${s.saved ?? 0} of ${s.total} files saved` : ''}.` : '';
    fill(box, [
      h('h3', {}, 'Without internet'),
      h('p', {}, OFFLINE_TEXT[s.state] + details),
      s.state === 'update' ? h('button', { class: 'btn btn--go', onClick: () => applyUpdate() }, 'Reload now') : null,
      canInstall()
        ? h('button', { class: 'btn btn--go', onClick: () => install() }, 'Install the album on this device')
        : h('p', { class: 'settings-note' }, 'To put the album on the home screen: on iPad or iPhone, open it in Safari and tap Share \u203a Add to Home Screen. '
          + 'On Android, open the browser menu and tap Install app. On an iPad this also stops Safari from deleting the albums after a week without use.'),
    ]);
  };
  paint();
  whileShown(box, 'offline:status', paint);
  whileShown(box, 'offline:install', paint);
  return box;
}

/** @param {HTMLElement} container */
export function renderSettings(container) {
  leaveSettings();
  const listening = listeningSection();
  fill(container, h('div', { class: 'card settings' }, [
    h('div', { class: 'game-head' }, [
      h('button', { class: 'btn', onClick: () => router.go('/') }, '← Album'),
      h('h2', {}, 'Settings'),
    ]),
    h('p', { class: 'bank-hint' }, 'These settings are for this device only. They are the same for every child who plays here.'),
    voiceSection(),
    speedSection(),
    soundSection(),
    listening.box,
    offlineSection(),
    backupPanel(),
  ]));
  // Si se cambia desde otra pantalla (el aviso de la barra), se repinta.
  whileShown(listening.box, 'speech:recognition', listening.paint);
}
