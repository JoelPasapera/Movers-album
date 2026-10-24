import * as state from '../core/state.js';
import { TOPICS, getTopic } from '../data/topics.js';
import { MAX_SHIELDS } from './scoring.js';
import { GAMES } from '../games/registry.js';

// Los cromos ganados se guardan por pagina. Cuando el album cambia una palabra
// de pagina (la tabla tematica de Cambridge movio 107 en septiembre de 2026),
// el cromo que un nino ya tenia le sigue a la pagina nueva; los cromos de
// palabras que ya no existen se retiran. Devuelve el mismo objeto si no hay
// nada que tocar, para que no se reescriba el perfil sin motivo.
export function relocateStickers(data) {
  const home = new Map();
  for (const topic of TOPICS) for (const word of topic.words) home.set(word.id, topic.id);
  const next = {};
  let changed = false;
  for (const [topicId, ids] of Object.entries(data.stickers ?? {})) {
    for (const id of ids) {
      const where = home.get(id);
      if (!where || where !== topicId || next[where]?.includes(id)) changed = true;
      if (!where || next[where]?.includes(id)) continue;
      (next[where] ??= []).push(id);
    }
  }
  return changed ? { ...data, stickers: next } : data;
}

export function unlockedIds(topicId) {
  return state.get().stickers[topicId] ?? [];
}

export function isUnlocked(topicId, wordId) {
  return unlockedIds(topicId).includes(wordId);
}

export function topicProgress(topicId) {
  const topic = getTopic(topicId);
  return { have: unlockedIds(topicId).length, total: topic.words.length };
}

export function unlockNext(topicId, count) {
  const topic = getTopic(topicId);
  const have = new Set(unlockedIds(topicId));
  const fresh = [];
  for (const word of topic.words) {
    if (fresh.length >= count) break;
    if (!have.has(word.id)) fresh.push(word);
  }
  if (!fresh.length) return [];
  state.update((s) => {
    s.stickers[topicId] = [...(s.stickers[topicId] ?? []), ...fresh.map((w) => w.id)];
  });
  return fresh;
}

export function recordShields(gameId, shields) {
  state.update((s) => {
    s.shields[gameId] = Math.max(s.shields[gameId] ?? 0, shields);
  });
}

export function bestShields(gameId) {
  return state.get().shields[gameId] ?? 0;
}

// Promedia sobre TODOS los juegos, no solo los jugados: si solo has jugado uno
// perfecto, no puedes tener el album al maximo.
export function totalShields() {
  const stored = state.get().shields;
  const playable = GAMES.filter((g) => g.ready);
  if (!playable.length) return 0;
  const sum = playable.reduce((total, game) => total + (stored[game.id] ?? 0), 0);
  return Math.min(MAX_SHIELDS, Math.round(sum / playable.length));
}
