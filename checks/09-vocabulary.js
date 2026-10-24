import { coverage, buildRound, taskFor, check } from '../src/games/vocab/questions.js';
import { ALL_WORDS } from '../src/engine/vocabulary.js';
import { SOURCE_ENTRIES } from '../src/data/wordlist-source.js';
import { PRACTICE } from '../src/games/registry.js';

export const name = 'Todo el wordlist se puede practicar';

const strip = (t) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export function run() {
  const problems = [];

  // 1. Cada entrada del PDF tiene que llegar al motor de vocabulario.
  const known = new Set(ALL_WORDS.map((w) => strip(w.word)));
  const missing = SOURCE_ENTRIES.map(([w]) => strip(w)).filter((w) => !known.has(w));
  if (missing.length) {
    problems.push(`${missing.length} entradas del wordlist no llegan a los ejercicios: ${missing.slice(0, 10).join(', ')}`);
  }

  // 2. Y cada una tiene que poder convertirse en pregunta valida.
  const cov = coverage();
  if (cov.broken.length) {
    problems.push(`${cov.broken.length} palabras no producen una pregunta valida: ${cov.broken.slice(0, 10).join(', ')}`);
  }

  // 3. Los tres tipos de ejercicio siguen existiendo.
  const tally = {};
  for (const word of ALL_WORDS) {
    const task = taskFor(word);
    tally[task] = (tally[task] ?? 0) + 1;
  }
  for (const kind of ['picture', 'spell', 'choose']) {
    if (!tally[kind]) problems.push(`ya no hay ninguna palabra con ejercicio de tipo "${kind}"`);
  }

  // 4. Las rondas salen bien formadas.
  for (let i = 0; i < 200; i += 1) {
    const round = buildRound({ size: 10 });
    if (round.length !== 10) problems.push(`una ronda del gimnasio da ${round.length} preguntas`);
    for (const q of round) {
      if (!q.word || !q.say) problems.push('una pregunta del gimnasio sale vacia');
      if (q.options) {
        if (q.options.length !== 4) problems.push('una pregunta del gimnasio no da 4 opciones');
        if (new Set(q.options.map((o) => o.id)).size !== 4) problems.push('el gimnasio repite una opcion');
        if (q.kind === 'picture' && new Set(q.options.map((o) => o.icon)).size !== 4) {
          problems.push('el gimnasio ensena dos dibujos iguales');
        }
        if (!q.options.some((o) => o.id === q.word.id)) problems.push('el gimnasio esconde la respuesta');
      }
      const right = q.kind === 'spell' ? q.word.word : q.word.id;
      if (!check(q, right).ok) problems.push(`el corrector del gimnasio rechaza "${q.word.word}"`);
    }
  }

  // 5. El gimnasio sigue dado de alta.
  if (!PRACTICE.some((g) => g.id === 'vocab' && g.ready)) {
    problems.push('el gimnasio de vocabulario ya no aparece en el album');
  }

  return {
    ok: problems.length === 0,
    detail: `${cov.total} palabras ejercitables (${tally.picture} con dibujo, `
      + `${tally.spell} de escribir, ${tally.choose} de elegir)`,
    problems: [...new Set(problems)],
    numbers: { palabrasEjercitables: cov.total - cov.broken.length },
  };
}
