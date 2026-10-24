// Formacion de palabras: los tipos de actividad del libro de aula que
// consisten en anadir -ly a un adjetivo, -ing a un verbo, y poner un verbo
// en pasado simple.
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
  if (/[^aeiou][aeiou]l$/.test(v)) return `${v}ling`;         // travel -> travelling (UK), pero sail -> sailing
  return `${v}ing`;
}

export const ING_VERBS = SOURCE_ENTRIES
  .filter(([w, t]) => /\bv\b/.test(t) && !w.includes(' ') && !NO_ING.has(w.toLowerCase()))
  .map(([w]) => w.toLowerCase())
  .filter((v) => !v.includes("'"))
  .filter((v, i, arr) => arr.indexOf(v) === i)
  .map((verb) => ({ base: verb, formed: ingOf(verb) }));

// --- verbo -> pasado simple ---------------------------------------------

// Pasados irregulares de los verbos de Starters y Movers. Es gramatica, no
// wordlist: no se deduce de la ortografia, asi que va escrito.
const IRREGULAR_PAST = {
  bring: 'brought', build: 'built', buy: 'bought', catch: 'caught', choose: 'chose',
  come: 'came', do: 'did', draw: 'drew', drink: 'drank', drive: 'drove', eat: 'ate',
  fall: 'fell', feed: 'fed', find: 'found', fly: 'flew', get: 'got', give: 'gave',
  go: 'went', grow: 'grew', have: 'had', hide: 'hid', hit: 'hit', hold: 'held',
  hurt: 'hurt', know: 'knew', lose: 'lost', make: 'made', mean: 'meant', put: 'put',
  read: 'read', ride: 'rode', run: 'ran', say: 'said', see: 'saw', send: 'sent',
  sing: 'sang', sit: 'sat', sleep: 'slept', stand: 'stood', swim: 'swam', take: 'took',
  teach: 'taught', tell: 'told', think: 'thought', throw: 'threw',
  understand: 'understood', wake: 'woke', wear: 'wore', write: 'wrote',
};

export function pastOf(verb) {
  const v = verb.toLowerCase();
  if (IRREGULAR_PAST[v]) return IRREGULAR_PAST[v];
  if (v.endsWith('e')) return `${v}d`;                        // dance -> danced
  if (/[^aeiou]y$/.test(v)) return `${v.slice(0, -1)}ied`;    // try -> tried, pero play -> played
  if (DOUBLING.has(v)) return `${v}${v[v.length - 1]}ed`;     // stop -> stopped
  if (/[^aeiou][aeiou]l$/.test(v)) return `${v}led`;          // travel -> travelled (UK)
  return `${v}ed`;                                            // walk -> walked
}

// "be" tiene dos pasados (was, were) y los verbos cuyo pasado se escribe igual
// que el presente (hit, put, read, hurt) no sirven para elegir entre formas.
export const PAST_VERBS = ING_VERBS
  .filter((p) => p.base !== 'be')
  .map((p) => ({ base: p.base, ing: p.formed, formed: pastOf(p.base) }))
  .filter((p) => p.formed !== p.base);

export const isIrregular = (verb) => Boolean(IRREGULAR_PAST[verb.toLowerCase()]);

// La falta tipica de un nino: regularizar (catched, goed) o no aplicar la
// regla de ortografia (stoped, tryed). Vacio si no hay falta creible.
export function wrongPast(pair) {
  const naive = `${pair.base}ed`;
  // "traveled" es la grafia americana, y Cambridge la acepta: no es falta.
  if (naive === pair.formed || pair.base.endsWith('e') || pair.formed.endsWith('lled')) return '';
  return naive;
}

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
