import { readFileSync } from 'node:fs';
import { TOPICS } from '../src/data/topics.js';
import { WORDS, allPicturable } from '../src/data/wordlist.js';
import { SOURCE_ENTRIES } from '../src/data/wordlist-source.js';

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

  const css = readFileSync('src/styles/album.css', 'utf8');
  if (!css.includes('cromo--text')) {
    problems.push('falta el estilo de los cromos sin dibujo (cromo--text)');
  }

  return {
    ok: problems.length === 0,
    detail: `${TOPICS.length} paginas, ${TOPICS.reduce((a, t) => a + t.words.length, 0)} cromos, `
      + `${allPicturable().length} con dibujo, cobertura ${coverage}%`,
    problems,
    numbers: {
      paginas: TOPICS.length,
      cromos: TOPICS.reduce((a, t) => a + t.words.length, 0),
      dibujables: allPicturable().length,
      coberturaWordlist: coverage,
      entradasOficiales: official.length,
    },
  };
}
