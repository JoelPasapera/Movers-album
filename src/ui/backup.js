// @ts-check
// Botones de copia de seguridad: guardar en un archivo y recuperar de uno.
// Se usan en el panel del profesor, en Ajustes y en el informe de un alumno.

import { h } from '../core/dom.js';
import { makeBackup, fileName, parseBackup, restoreBackup, MAX_BYTES } from '../engine/backup.js';
import * as profiles from '../core/profiles.js';
import * as storage from '../core/storage.js';

/**
 * Descarga un archivo de texto, sin servidor: un enlace con `download`.
 * @param {string} name @param {string} text
 */
export function downloadText(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = h('a', { href: url, download: name, class: 'hidden' });
  document.body.append(link);
  link.click();
  link.remove();
  // Se libera despues: algunos navegadores leen el enlace un momento mas tarde.
  setTimeout(() => URL.revokeObjectURL(url), 30000);
}

/** @param {string[]} [ids] */
export function saveBackup(ids) {
  const backup = makeBackup(ids);
  downloadText(fileName(backup), JSON.stringify(backup));
  return backup;
}

/** Lee un archivo elegido por el usuario como texto. @param {File} file @returns {Promise<string>} */
export function readFile(file) {
  if (typeof file.text === 'function') return file.text();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('load', () => resolve(String(reader.result ?? '')));
    reader.addEventListener('error', () => reject(reader.error));
    reader.readAsText(file);
  });
}

/** @param {string[]} names */
const listOf = (names) => (names.length > 2 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names.join(' and '));

/**
 * Los dos botones (guardar la clase, recuperar de un archivo) y un mensaje.
 * `onRestored` recibe el mensaje, por si la pantalla se repinta entera: asi
 * puede volver a ensenarlo (`notice`).
 * @param {{ onRestored?: (message: string) => void, title?: string, notice?: string }} [options]
 */
export function backupPanel({ onRestored, title = 'Backups', notice = '' } = {}) {
  const message = h('p', { class: `spell-feedback${notice ? ' spell-feedback--ok' : ''}`, 'aria-live': 'polite' }, notice);
  const input = h('input', { type: 'file', accept: '.json,application/json', class: 'hidden', 'aria-label': 'Backup file' });

  /** @param {string} text @param {boolean} ok */
  const say = (text, ok) => {
    message.textContent = text;
    message.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
  };

  input.addEventListener('change', async () => {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (file.size > MAX_BYTES) {
      say('This file is too big to be a backup of the album.', false);
      return;
    }
    try {
      const backup = parseBackup(await readFile(file));
      const { added, merged, failed } = restoreBackup(backup);
      if (failed.length) {
        say(`This device is full, so ${listOf(failed)} could not be saved. Free some space and try again.`, false);
        return;
      }
      const parts = [];
      if (added.length) parts.push(`New album${added.length > 1 ? 's' : ''}: ${listOf(added)}.`);
      if (merged.length) parts.push(`Joined with the album already here: ${listOf(merged)}.`);
      const done = `Done. ${parts.join(' ')} Nothing was lost.`;
      say(done, true);
      onRestored?.(done);
    } catch (error) {
      say(error instanceof Error ? error.message : 'This file could not be read.', false);
    }
  });

  const count = profiles.list().length;
  const box = h('section', { class: 'settings-block backup' }, [
    h('h3', {}, title),
    h('p', {}, 'Everything is saved in this browser only. A backup is a file with every album in it. '
      + 'Keep it somewhere safe (a USB stick, your email) and use it to bring the albums back after clearing the browser, '
      + 'or to move the class to another device. Restoring never deletes progress: an album with the same name is joined, not replaced.'),
    storage.persistent() ? null : h('p', { class: 'settings-warn' }, 'This browser is not keeping the albums after it is closed. Make a backup before you close it.'),
    h('div', { class: 'result__actions' }, [
      h('button', {
        class: 'btn btn--go', type: 'button', disabled: count === 0,
        onClick: () => { const b = saveBackup(); say(`Saved a backup with ${b.albums.length} album${b.albums.length === 1 ? '' : 's'}.`, true); },
      }, 'Save a backup of the class'),
      h('button', { class: 'btn', type: 'button', onClick: () => input.click() }, 'Restore from a backup file'),
    ]),
    input,
    message,
  ]);
  return box;
}
