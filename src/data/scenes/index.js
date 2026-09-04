import { PARK } from './park.js';
import { BEACH } from './beach.js';
import { CLASSROOM } from './classroom.js';
import { KITCHEN } from './kitchen.js';

export const SCENES = [PARK, BEACH, CLASSROOM, KITCHEN];

export const getScene = (id) => SCENES.find((s) => s.id === id) ?? SCENES[0];

export function randomScene(excludeId = null) {
  const pool = SCENES.length > 1 && excludeId
    ? SCENES.filter((s) => s.id !== excludeId)
    : SCENES;
  return pool[Math.floor(Math.random() * pool.length)];
}
