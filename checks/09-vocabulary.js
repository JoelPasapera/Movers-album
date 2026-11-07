import { coverage, buildRound, taskFor, check } from '../src/games/vocab/questions.js';
import { ALL_WORDS, mark, statusOf, pickBatch, NEW_PER_ROUND } from '../src/engine/vocabulary.js';
import * as state from '../src/core/state.js';
import * as profiles from '../src/core/profiles.js';
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

  // 6. El repaso espaciado sube un escalon por dia: acertar tres veces la
  // misma palabra en una tarde no la manda a repasar dentro de una semana.
  // Y una ronda no mete mas palabras nuevas de la cuenta.
  const before = state.activeProfile();
  const kid = profiles.add('zzRepaso', { select: false });
  try {
    if (!kid) throw new Error('no se pudo crear el alumno de prueba');
    state.useProfile(kid.id);
    state.reset();
    const word = ALL_WORDS[0].id;
    mark(word, true);
    mark(word, true);
    mark(word, true);
    if (statusOf(word).step !== 1) problems.push(`tres aciertos el mismo dia suben el repaso ${statusOf(word).step} escalones, no 1`);
    // El dia siguiente (se finge moviendo atras lo guardado), el primer acierto sube otro.
    state.update((s) => { s.vocab[word].u -= 1; s.vocab[word].d -= 1; });
    mark(word, true);
    if (statusOf(word).step !== 2) problems.push('el acierto de otro dia no sube el repaso');
    mark(word, false);
    if (statusOf(word).step !== 0) problems.push('un fallo no reinicia el repaso');
    state.reset();
    const fresh = pickBatch(10, null, null, { maxNew: NEW_PER_ROUND });
    if (fresh.length !== NEW_PER_ROUND) problems.push(`a un alumno nuevo la ronda le da ${fresh.length} palabras nuevas y el tope es ${NEW_PER_ROUND}`);
    for (const w of ALL_WORDS.slice(0, 4)) mark(w.id, false);
    const mixed = pickBatch(10, null, null, { maxNew: NEW_PER_ROUND });
    if (mixed.length !== 4 + NEW_PER_ROUND || mixed.filter((w) => statusOf(w.id).last === null).length !== NEW_PER_ROUND) {
      problems.push('con palabras falladas, la ronda no las junta con las nuevas que caben');
    }
  } catch (error) {
    problems.push(`la prueba del repaso se rompio: ${error instanceof Error ? error.message : String(error)}`);
  } finally {
    if (kid) profiles.remove(kid.id);
    state.useProfile(before);
  }

  return {
    ok: problems.length === 0,
    detail: `${cov.total} palabras ejercitables (${tally.picture} con dibujo, `
      + `${tally.spell} de escribir, ${tally.choose} de elegir)`,
    problems: [...new Set(problems)],
    numbers: { palabrasEjercitables: cov.total - cov.broken.length },
  };
}
