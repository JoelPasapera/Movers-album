// Puntuacion de Speaking con la escala del handbook (data/speaking-scale.js):
// tres criterios de 0 a 5, sumados y convertidos a escudos como cualquier
// otra prueba. Guarda la autoevaluacion del nino y la nota del profesor.

import { SPEAKING_SCALE, BAND_MAX, PRONUNCIATION_CAP } from '../data/speaking-scale.js';
import { shieldsFor } from './scoring.js';
import * as state from '../core/state.js';

const HISTORY = 20;

export const CRITERIA = SPEAKING_SCALE.map((c) => c.id);

export const isBand = (n) => Number.isInteger(n) && n >= 0 && n <= BAND_MAX;

export const validBands = (bands) => Boolean(bands) && CRITERIA.every((id) => isBand(bands[id]));

export const scaleTotal = (bands) => CRITERIA.reduce((sum, id) => sum + bands[id], 0);

export const scaleShields = (bands) => shieldsFor(scaleTotal(bands), CRITERIA.length * BAND_MAX);

// Con muy poca lengua no se puede juzgar la pronunciacion: tope de 3.
export function capPronunciation(bands, evidence) {
  if (evidence >= PRONUNCIATION_CAP.minEvidence) return bands;
  return { ...bands, pronunciation: Math.min(bands.pronunciation, PRONUNCIATION_CAP.max) };
}

const today = () => new Date().toISOString().slice(0, 10);

function push(kind, entry) {
  state.update((s) => {
    s.speaking ??= { self: [], teacher: [] };
    s.speaking[kind] = [...(s.speaking[kind] ?? []), entry].slice(-HISTORY);
  });
}

export function recordSelfCheck(bands, source = 'mock') {
  if (!validBands(bands)) return;
  push('self', { when: today(), source, bands });
}

export function recordTeacherMark(bands, note = '') {
  if (!validBands(bands)) return;
  push('teacher', { when: today(), bands, note: String(note).slice(0, 200) });
}

// La nota del profesor manda sobre la autoevaluacion del nino.
export function latestMark(data = state.get()) {
  const teacher = data.speaking?.teacher?.at(-1);
  if (teacher) return { ...teacher, by: 'teacher', shields: scaleShields(teacher.bands) };
  const self = data.speaking?.self?.at(-1);
  return self ? { ...self, by: 'self', shields: scaleShields(self.bands) } : null;
}

export const shortBands = (bands) => CRITERIA
  .map((id) => `${SPEAKING_SCALE.find((c) => c.id === id).label[0]}${bands[id]}`)
  .join(' ');
