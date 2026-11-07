// @ts-check
// "Your voice" (ruta /voice): el profesor graba con su voz las frases fijas que
// dicen los juegos. Cada frase grabada suena con su voz en vez de la del
// navegador, en todos los juegos que la dicen. Se graba frase a frase, cuando
// haya tiempo: lo que no esta grabado sigue con la voz del navegador.
//
// Las grabaciones viven en este aparato (core/recordings.js). Para usarlas en
// otras tablets, se guardan en un archivo y se abre ese archivo en cada una.

import { h, mount as fill } from '../core/dom.js';
import * as router from '../core/router.js';
import { on } from '../core/events.js';
import * as speech from '../core/speech.js';
import { speak, stop as stopVoice } from '../core/audio.js';
import * as recordings from '../core/recordings.js';
import { localDate } from '../core/time.js';
import { VOICE_GROUPS, VOICE_LINE_COUNT } from '../data/voice-lines.js';
import { downloadText, readFile } from './backup.js';

/** Lo que esta grabando ahora (para pararlo al salir). @type {{ cancel: () => void } | null} */
let recording = null;
/** @type {(() => void) | null} */
let unsubscribe = null;

/** Al salir de la pantalla: se apaga el microfono y se deja de escuchar avisos. */
export function leaveVoice() {
  recording?.cancel();
  recording = null;
  unsubscribe?.();
  unsubscribe = null;
}

/** @param {HTMLElement} container */
export function renderVoice(container) {
  leaveVoice();
  const canRecord = speech.recorderSupported() && speech.secureEnough();
  const total = h('span', { class: 'counter' });
  const message = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const groupsBox = h('div', { class: 'voice-groups' });
  /** Que grupos estan abiertos (se conservan al repintar). */
  const open = new Set(/** @type {string[]} */ ([]));
  /** La frase que se esta grabando. @type {string | null} */
  let busy = null;

  /** @param {string} text @param {boolean} ok */
  const say = (text, ok) => {
    message.textContent = text;
    message.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
  };

  const fileInput = h('input', { type: 'file', accept: '.json,application/json', class: 'hidden', 'aria-label': 'Recordings file' });
  fileInput.addEventListener('change', async () => {
    const file = fileInput.files?.[0];
    fileInput.value = '';
    if (!file) return;
    if (file.size > recordings.PACK_MAX_BYTES) { say('This file is too big to be a recordings file.', false); return; }
    try {
      const { added, replaced } = await recordings.importPack(await readFile(file));
      say(`Done: ${added} new recording${added === 1 ? '' : 's'}${replaced ? `, ${replaced} changed` : ''}.`, true);
    } catch (error) {
      say(error instanceof Error ? error.message : 'This file is not a recordings file.', false);
    }
  });

  async function saveFile() {
    if (!recordings.count()) { say('There are no recordings to save yet.', false); return; }
    say('Saving…', true);
    try {
      const pack = await recordings.exportPack();
      downloadText(`movers-voice-${localDate()}.json`, JSON.stringify(pack));
      say(`Saved ${pack.lines.length} recording${pack.lines.length === 1 ? '' : 's'}. Open this file on the other tablets, on this page.`, true);
    } catch {
      say('The recordings could not be saved. Try again.', false);
    }
  }

  /**
   * Graba una frase: el primer toque empieza, el segundo para y guarda.
   * @param {string} text
   */
  async function toggleRecord(text) {
    if (busy && busy !== text) return;
    if (recording && busy === text) {
      const current = /** @type {any} */ (recording);
      recording = null;
      const blob = await current.stop();
      busy = null;
      if (!blob || !blob.size) { say('Nothing was recorded. Try again, a little louder.', false); paint(); return; }
      try {
        await recordings.save(text, blob);
        say('Saved. Listen to it with ▶.', true);
      } catch (error) {
        say(error instanceof Error ? error.message : 'This recording cannot be saved.', false);
      }
      paint();
      return;
    }
    stopVoice();
    try {
      busy = text;
      paint();
      recording = await speech.record();
      say('Recording… Say the sentence, then tap ■ Stop.', true);
    } catch {
      busy = null;
      recording = null;
      say('The microphone did not start. Check that this page can use it, then try again.', false);
    }
    paint();
  }

  /** @param {import('../data/voice-lines.js').VoiceLine} line */
  function row(line) {
    const has = recordings.has(line.text);
    const live = busy === line.text;
    return h('li', { class: `voice-line${has ? ' is-done' : ''}${live ? ' is-live' : ''}` }, [
      h('div', { class: 'voice-line__text' }, [
        line.who ? h('b', {}, line.who === 'child' ? 'Child: ' : 'Adult: ') : null,
        line.text,
        line.note ? h('small', {}, ` (${line.note})`) : null,
      ]),
      h('div', { class: 'voice-line__buttons' }, [
        h('button', {
          class: 'btn btn--ghost', 'aria-label': `Listen: ${line.text}`, disabled: Boolean(busy),
          onClick: () => speak(line.text),
        }, '▶'),
        canRecord ? h('button', {
          class: `btn${live ? ' btn--rec' : ''}`, 'aria-label': `${live ? 'Stop recording' : 'Record'}: ${line.text}`,
          disabled: Boolean(busy) && !live,
          onClick: () => toggleRecord(line.text),
        }, live ? '■ Stop' : (has ? '● Again' : '● Record')) : null,
        has ? h('button', {
          class: 'btn btn--ghost', 'aria-label': `Delete the recording: ${line.text}`, disabled: Boolean(busy),
          onClick: async () => { await recordings.remove(line.text); say('Deleted. The computer voice says it again.', true); paint(); },
        }, 'Delete') : null,
      ]),
    ]);
  }

  function paint() {
    total.textContent = `${recordings.count()} of ${VOICE_LINE_COUNT}`;
    fill(groupsBox, VOICE_GROUPS.map((group) => {
      const done = group.lines.filter((l) => recordings.has(l.text)).length;
      const details = h('details', { class: 'voice-group', open: open.has(group.id) || null }, [
        h('summary', {}, [h('b', {}, group.title), h('span', { class: 'voice-group__count' }, ` ${done} of ${group.lines.length}`)]),
        h('p', { class: 'bank-hint' }, group.about),
        h('ol', { class: 'voice-lines' }, group.lines.map(row)),
      ]);
      details.addEventListener('toggle', () => { if (details.open) open.add(group.id); else open.delete(group.id); });
      return details;
    }));
  }

  unsubscribe = on('recordings:changed', () => { if (!busy) paint(); });

  fill(container, h('div', { class: 'card voice' }, [
    h('div', { class: 'game-head' }, [
      h('button', { class: 'btn', onClick: () => router.go('/teacher') }, '← Class progress'),
      h('h2', {}, 'Your voice'),
      h('div', { class: 'spacer' }),
      total,
    ]),
    h('p', {}, 'Record the sentences of the games with your own voice. Every sentence you record is said with your voice '
      + 'instead of the computer voice, in every game that says it. The children hear a real teacher, like in the test. '
      + 'Record a few each day: the rest stays with the computer voice.'),
    canRecord ? null : h('p', { class: 'spell-tip' }, 'This device cannot record on this page (it needs a microphone, and the page must open with https). '
      + 'You can still open a recordings file made on another device.'),
    h('p', { class: 'bank-hint' }, 'Some sentences are new every time (the people in the park, the colours, the numbers of the dictation): '
      + 'those stay with the computer voice. The recordings stay on this device. To use them on other tablets, save them to a file '
      + 'and open the file there, on this page.'),
    h('div', { class: 'result__actions voice-actions' }, [
      h('button', { class: 'btn', onClick: () => saveFile() }, 'Save my recordings to a file'),
      h('button', { class: 'btn', onClick: () => fileInput.click() }, 'Open a recordings file'),
      fileInput,
    ]),
    message,
    groupsBox,
  ]));
  paint();
}
