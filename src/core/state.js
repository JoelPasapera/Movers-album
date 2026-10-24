import * as storage from './storage.js';
import { emit } from './events.js';

const DEFAULTS = {
  stickers: {},
  shields: {},
  lastPlayed: null,
  streak: 0,
  speaking: { self: [], teacher: [] },
};

let state = storage.load(DEFAULTS);
let activeId = null;

// Reparaciones de datos guardados. Se aplican al cargar cada perfil: reciben
// el estado y devuelven el mismo objeto si no hay nada que arreglar, u otro
// nuevo si lo hay (y entonces se guarda). core/ no sabe que hay un album:
// quien conoce las paginas registra aqui su arreglo (ver engine/progress.js).
const repairs = [];

export function onLoad(repair) {
  repairs.push(repair);
}

export function useProfile(id) {
  activeId = id || null;
  storage.setNamespace(id);
  let loaded = storage.load(DEFAULTS);
  for (const repair of repairs) {
    const fixed = repair(loaded);
    if (fixed !== loaded) {
      loaded = fixed;
      storage.save(loaded);
    }
  }
  state = loaded;
  emit('state:changed', state);
  return state;
}

export function get() {
  return state;
}

// Perfil cuyo estado esta cargado ahora mismo. Quien cambie de perfil para
// leer otro (el panel del profesor, el informe) lo usa para volver al suyo.
export const activeProfile = () => activeId;

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
