import * as storage from './storage.js';
import { emit } from './events.js';

const DEFAULTS = {
  stickers: {},
  shields: {},
  lastPlayed: null,
  streak: 0,
};

let state = storage.load(DEFAULTS);

export function useProfile(id) {
  storage.setNamespace(id);
  state = storage.load(DEFAULTS);
  emit('state:changed', state);
  return state;
}

export function get() {
  return state;
}

export function update(mutator) {
  const next = structuredClone(state);
  mutator(next);
  state = next;
  storage.save(state);
  emit('state:changed', state);
  return state;
}

export function reset() {
  storage.wipe();
  state = structuredClone(DEFAULTS);
  emit('state:changed', state);
}

export function touchStreak() {
  const today = new Date().toISOString().slice(0, 10);
  if (state.lastPlayed === today) return;
  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  update((s) => {
    s.streak = s.lastPlayed === yesterday ? s.streak + 1 : 1;
    s.lastPlayed = today;
  });
}
