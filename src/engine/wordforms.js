// Formacion de palabras: los dos tipos de actividad del libro de aula que
// consisten en anadir -ly a un adjetivo y -ing a un verbo.
//
// No hay lista escrita a mano: los pares salen del wordlist oficial y se
// verifican contra el, asi que si el wordlist cambia, esto cambia con el.

import { SOURCE_ENTRIES } from '../data/wordlist-source.js';

const has = (tag, word) => SOURCE_ENTRIES
  .some(([w, t]) => w.toLowerCase() === word && new RegExp(`\\b${tag}\\b`).test(t));

const ALL = new Set(SOURCE_ENTRIES.map(([w]) => w.toLowerCase()));

// --- adjetivo -> adverbio en -ly -----------------------------------------

const lyOf = (adj) => (adj.endsWith('y') ? `${adj.slice(0, -1)}ily` : `${adj}ly`);

export const LY_PAIRS = SOURCE_ENTRIES
  .filter(([w, t]) => /\badj\b/.test(t) && !w.includes(' '))
  .map(([w]) => w.toLowerCase())
  .map((adj) => ({ base: adj, formed: lyOf(adj) }))
  .filter((p) => ALL.has(p.formed) && has('adv', p.formed));

// --- verbo -> forma en -ing ----------------------------------------------

// Verbos de una silaba que doblan la ultima consonante. Se listan porque la
// regla depende de la pronunciacion y no se puede deducir de la ortografia.
const DOUBLING = new Set([
  'drop', 'get', 'hit', 'hop', 'put', 'run', 'shop', 'sit', 'skip',
  'stop', 'swim', 'begin', 'cut', 'win', 'plan', 'chat', 'clap',
]);

// Modales y entradas que no son verbos de accion aunque compartan marca.
const NO_ING = new Set(['can', 'could', 'must', 'shall', 'will', 'would', 'may',
  'might', 'should', 'movie', 'film', 'video', 'text', 'email', 'colour', 'color',
  'pron', 'let\'s']);

// Formas que no siguen ninguna regla ortografica.
const IRREGULAR_ING = { be: 'being', see: 'seeing', lie: 'lying' };

export function ingOf(verb) {
  const v = verb.toLowerCase();
  if (IRREGULAR_ING[v]) return IRREGULAR_ING[v];
  if (v.endsWith('ie')) return `${v.slice(0, -2)}ying`;      // lie -> lying
  if (v.endsWith('ee')) return `${v}ing`;                     // see -> seeing
  if (v.endsWith('e')) return `${v.slice(0, -1)}ing`;         // ride -> riding
  if (DOUBLING.has(v)) return `${v}${v[v.length - 1]}ing`;    // run -> running
  if (/[aeiou]l$/.test(v)) return `${v}ling`;                 // travel -> travelling (UK)
  return `${v}ing`;
}

export const ING_VERBS = SOURCE_ENTRIES
  .filter(([w, t]) => /\bv\b/.test(t) && !w.includes(' ') && !NO_ING.has(w.toLowerCase()))
  .map(([w]) => w.toLowerCase())
  .filter((v) => !v.includes("'"))
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .map((verb) => ({ base: verb, formed: ingOf(verb) }));

// Distractores creibles: la forma mal construida que un nino escribiria.
// Siempre tres distractores creibles: son las faltas que un nino escribe.
export function wrongForms(pair, kind) {
  const { base, formed } = pair;
  const last = base[base.length - 1];
  const candidates = kind === 'ing'
    ? [`${base}ing`, `${base}${last}ing`, `${base}eing`, `${base.slice(0, -1)}ing`,
      `${base}ying`, `${base}inng`]
    : [`${base}ly`, `${base}ley`, `${base}lly`, `${base}ily`, `${base}y`];
  const out = [];
  for (const candidate of candidates) {
    if (candidate === formed || out.includes(candidate) || candidate === base) continue;
    out.push(candidate);
    if (out.length === 3) break;
  }
  return out;
}
