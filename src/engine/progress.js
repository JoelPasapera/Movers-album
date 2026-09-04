import * as state from '../core/state.js';
import { getTopic } from '../data/topics.js';
import { MAX_SHIELDS } from './scoring.js';
import { GAMES } from '../games/registry.js';

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
