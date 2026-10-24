import { readFileSync } from 'node:fs';
import { TOPICS } from '../src/data/topics.js';
import { WORDS, allPicturable } from '../src/data/wordlist.js';
import { SOURCE_ENTRIES, THEMATIC } from '../src/data/wordlist-source.js';
import { relocateStickers } from '../src/engine/progress.js';

export const name = 'Album completo y coherente';

const strip = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

export function run() {
  const problems = [];
  // Cada entrada del PDF oficial tiene que tener su propio cromo, con ese
  // nombre exacto. No vale que este "dentro" de otra entrada mas larga.
  const stickers = new Set();
  for (const list of Object.values(WORDS)) {
    for (const [word] of list) stickers.add(strip(word.trim().toLowerCase()));
  }
  const official = SOURCE_ENTRIES.map(([word]) => strip(word.toLowerCase()));
  const missing = official.filter((w) => !stickers.has(w));
  const coverage = Math.round((100 * (official.length - missing.length)) / official.length);
  if (missing.length) {
    problems.push(`${missing.length} entradas del wordlist oficial no tienen cromo: ${missing.slice(0, 15).join(', ')}`);
  }
  const invented = [...stickers].filter((w) => !official.includes(w));
  if (invented.length) {
    problems.push(`${invented.length} cromos que no estan en el wordlist oficial: ${invented.slice(0, 15).join(', ')}`);
  }

  const byIcon = new Map();
  for (const [topic, list] of Object.entries(WORDS)) {
    for (const [word, icon, pic] of list) {
      if (pic !== 1 || !icon) continue;
      if (!byIcon.has(icon)) byIcon.set(icon, new Set());
      byIcon.get(icon).add(`${word} (${topic})`);
    }
  }
  for (const [icon, group] of byIcon) {
    if (group.size > 1) problems.push(`el icono ${icon} lo comparten: ${[...group].join(', ')}`);
  }

  for (const topic of TOPICS) {
    if (!topic.words.length) problems.push(`la pagina "${topic.label}" esta vacia`);
    const ids = topic.words.map((w) => w.id.toLowerCase());
    const dup = ids.filter((id, i) => ids.indexOf(id) !== i);
    if (dup.length) problems.push(`la pagina "${topic.label}" repite: ${[...new Set(dup)].join(', ')}`);
  }

  // Cada cromo que Cambridge clasifica por tema esta en una de las paginas
  // que Cambridge le da. Las paginas del album son las de la tabla tematica
  // del wordlist, no un criterio propio.
  const pageOf = new Map();
  for (const topic of TOPICS) for (const w of topic.words) pageOf.set(w.id.toLowerCase(), topic.id);
  let aligned = 0;
  for (const [word, pages] of THEMATIC) {
    const page = pageOf.get(word.toLowerCase());
    if (!page) continue;   // ya se avisa arriba como entrada sin cromo
    if (pages.includes(page)) aligned += 1;
    else problems.push(`"${word}" esta en la pagina "${page}" y Cambridge lo lista en: ${pages.join(', ')}`);
  }
  if (THEMATIC.length < 550) problems.push(`la tabla tematica solo trae ${THEMATIC.length} palabras: el generador se ha roto`);

  // Los cromos que un nino ya tenia siguen a su palabra cuando cambia de
  // pagina, y los de palabras que ya no existen se retiran.
  const old = { stickers: { doing: ['jump', 'add'], things: ['bus stop'], me: ['her poss'], sports: ['ball', 'jump'] }, shields: {} };
  const fixed = relocateStickers(old);
  const at = (id) => Object.entries(fixed.stickers).find(([, ids]) => ids.includes(id))?.[0];
  if (at('jump') !== 'sports' || at('add') !== 'doing' || at('bus stop') !== 'transport') {
    problems.push('un cromo ganado no sigue a su palabra cuando cambia de pagina');
  }
  if (at('her poss') || fixed.stickers.things) problems.push('los cromos de palabras que ya no existen no se retiran');
  if (fixed.stickers.sports.filter((id) => id === 'jump').length !== 1) problems.push('un cromo recolocado se duplica');
  if (relocateStickers(fixed) !== fixed) problems.push('recolocar los cromos no es idempotente: reescribiria el perfil cada vez');
  if (old.shields !== fixed.shields) problems.push('recolocar los cromos toca otras partes del perfil');

  const css = readFileSync('src/styles/album.css', 'utf8');
  if (!css.includes('cromo--text')) {
    problems.push('falta el estilo de los cromos sin dibujo (cromo--text)');
  }

  return {
    ok: problems.length === 0,
    detail: `${TOPICS.length} paginas, ${TOPICS.reduce((a, t) => a + t.words.length, 0)} cromos, `
      + `${allPicturable().length} con dibujo, cobertura ${coverage}%, `
      + `${aligned} en la pagina que dicta Cambridge`,
    problems,
    numbers: {
      paginas: TOPICS.length,
      cromos: TOPICS.reduce((a, t) => a + t.words.length, 0),
      dibujables: allPicturable().length,
      coberturaWordlist: coverage,
      entradasOficiales: official.length,
      cromosEnSuTema: aligned,
    },
  };
}
