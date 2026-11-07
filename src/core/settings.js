// @ts-check
// Ajustes de ESTE aparato, no del alumno: que voz inglesa usar, a que
// velocidad hablar en la practica y si el sonido esta apagado. Dependen de la
// tablet (que voces tiene, si esta en un aula ruidosa), asi que se guardan
// aparte de los perfiles y valen para todos los ninos que la usen.

import { emit } from './events.js';
import { readText, writeText } from './storage.js';

const KEY = 'movers-settings-v1';

/**
 * @typedef {'slow' | 'normal'} Speed
 * @typedef {{ voiceURI: string, speed: Speed, muted: boolean }} Settings
 */

/** @type {Settings} */
const DEFAULTS = { voiceURI: '', speed: 'normal', muted: false };

/** @returns {string | null} */
const readRaw = () => readText(KEY);

/** @param {string} raw */
const writeRaw = (raw) => writeText(KEY, raw);

/**
 * Lo guardado, con cada campo comprobado: un valor raro (de otra version, o
 * escrito a mano) vuelve al de por defecto en vez de romper la voz.
 * @returns {Settings}
 */
export function getSettings() {
  /** @type {any} */
  let saved = {};
  try {
    saved = JSON.parse(readRaw() ?? '{}') ?? {};
  } catch {
    saved = {};
  }
  return {
    voiceURI: typeof saved.voiceURI === 'string' ? saved.voiceURI.slice(0, 200) : DEFAULTS.voiceURI,
    speed: saved.speed === 'slow' ? 'slow' : 'normal',
    muted: saved.muted === true,
  };
}

/**
 * @template {keyof Settings} K
 * @param {K} key
 * @param {Settings[K]} value
 * @returns {Settings}
 */
export function setSetting(key, value) {
  const next = { ...getSettings(), [key]: value };
  writeRaw(JSON.stringify(next));
  const checked = getSettings();
  emit('settings:changed', checked);
  return checked;
}
