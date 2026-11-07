// @ts-check
// El cuaderno de errores (engine/mistakes.js) y "Fix my mistakes".
//
// Aqui se comprueba que lo que se falla vuelve OTRO dia (no el mismo), que un
// error se arregla acertandolo en dos dias distintos y vuelve a empezar si se
// falla, que los juegos que tienen preguntas que se entienden solas apuntan sus
// fallos, y que el juego nuevo se juega de verdad: escribiendo y eligiendo.

import { readFileSync } from 'node:fs';
import * as state from '../src/core/state.js';
import * as profiles from '../src/core/profiles.js';
import { localDate, dayBefore } from '../src/core/time.js';
import {
  noteMistake, dueMistakes, mistakesOf, fixAttempt, fixedCount, isRightAnswer, gapSentence, cleanMistake,
  classMistakes, MISTAKES_KEPT,
} from '../src/engine/mistakes.js';
import { createBrowser, settle } from './lib/browser.js';
import { FakeEvent } from './lib/dom.js';
import { isVisible } from './lib/bot.js';

export const name = 'Los errores vuelven otro dia y se arreglan';

/** Los juegos que apuntan sus fallos, y donde esta el codigo que lo hace. */
const HOOKED = {
  spellit: 'src/games/spellit/index.js',
  respond: 'src/games/respond/index.js',
  wordchoice: 'src/games/wordchoice/index.js',
  wordform: 'src/games/wordform/index.js',
  notetaking: 'src/games/notetaking/index.js',
  // Los de los componentes compartidos (elegir y escribir).
  pastform: 'src/ui/components/miniGame.js',
  timeprep: 'src/ui/components/miniGame.js',
  opposites: 'src/ui/components/miniGame.js',
  wordpairs: 'src/ui/components/miniGame.js',
  numbers: 'src/ui/components/miniGame.js',
  matter: 'src/ui/components/writer.js',
  whereare: 'src/ui/components/writer.js',
};

export async function run() {
  /** @type {string[]} */
  const problems = [];

  // 1. Cada juego de la lista apunta sus fallos.
  for (const [game, file] of Object.entries(HOOKED)) {
    if (!readFileSync(file, 'utf8').includes('noteMistake(')) problems.push(`"${game}" ya no apunta sus fallos en el cuaderno (${file})`);
  }

  // 2. La frase de un hueco se saca entera y sola.
  const cases = [
    ['Vicky has a small ', ' at home. It has got long ears.', 'Vicky has a small … at home.'],
    ['. Last Sunday the animal was not in its ', '. Vicky looked in the garden', 'Last Sunday the animal was not in its ….'],
    ['I went to the park. Then I ', ' my friend', 'Then I … my friend'],
  ];
  for (const [before, after, want] of cases) {
    if (gapSentence(before, after) !== want) problems.push(`la frase del hueco sale "${gapSentence(before, after)}" y deberia ser "${want}"`);
  }

  const before = state.activeProfile();
  const kid = profiles.add('zzErrores', { select: false });
  try {
    if (!kid) throw new Error('no se pudo crear el alumno de prueba');
    state.useProfile(kid.id);
    state.reset();
    const d1 = '2026-11-01';
    const d2 = '2026-11-02';
    const d3 = '2026-11-03';
    const d4 = '2026-11-04';

    // 3. Lo que se falla hoy vuelve manana, no hoy.
    const write = { game: 'spellit', kind: /** @type {const} */ ('write'), prompt: 'This is a baby cat.', answer: 'a kitten', given: 'a kiten' };
    const choose = {
      game: 'respond', kind: /** @type {const} */ ('choose'), prompt: 'Mum: Where is your bag?',
      options: ['In my room.', 'Yes, it is.', 'I like it.'], answer: 'In my room.', why: 'She asks where.', given: 'I like it.',
    };
    noteMistake(write, d1);
    noteMistake(choose, d1);
    if (dueMistakes(state.get(), d1).length !== 0) problems.push('un error de hoy toca repasarlo hoy: tiene que volver otro dia');
    if (dueMistakes(state.get(), d2).length !== 2) problems.push('los errores de ayer no vuelven hoy');
    noteMistake(write, d1);
    if (mistakesOf().length !== 2 || mistakesOf().find((m) => m.answer === 'a kitten')?.misses !== 2) problems.push('fallar dos veces la misma pregunta no suma en el mismo error');

    // 4. Se arregla acertando en dos dias distintos; el mismo dia dos veces no cuenta.
    const key = /** @type {string} */ (mistakesOf().find((m) => m.answer === 'a kitten')?.key);
    if (fixAttempt(key, true, 'a kitten', d2) !== 'better') problems.push('el primer acierto no cuenta como un paso');
    if (dueMistakes(state.get(), d2).some((m) => m.key === key)) problems.push('un error acertado hoy vuelve a salir hoy');
    fixAttempt(key, true, 'a kitten', d2);
    if (mistakesOf().find((m) => m.key === key)?.wins.length !== 1) problems.push('dos aciertos el mismo dia cuentan como dos dias');
    if (fixAttempt(key, true, 'a kitten', d3) !== 'fixed' || mistakesOf().some((m) => m.key === key) || fixedCount() !== 1) {
      problems.push('acertar en dos dias distintos no arregla el error');
    }

    // 5. Si se vuelve a fallar, la cuenta empieza otra vez.
    const other = /** @type {string} */ (mistakesOf()[0]?.key);
    fixAttempt(other, true, 'In my room.', d2);
    fixAttempt(other, false, 'Yes, it is.', d3);
    const reset = mistakesOf().find((m) => m.key === other);
    if (!reset || reset.wins.length || reset.misses !== 2 || reset.given !== 'Yes, it is.') problems.push('un fallo en el repaso no reinicia la cuenta del error');
    if (!dueMistakes(state.get(), d4).some((m) => m.key === other)) problems.push('un error fallado en el repaso no vuelve al dia siguiente');

    // 6. Al escribir vale la respuesta buena (y las que el juego acepta), sin mayusculas ni punto.
    const book = /** @type {any} */ (cleanMistake({ ...write, accept: ['kitten'], first: d1, last: d1 }));
    if (!isRightAnswer(book, 'A Kitten.') || !isRightAnswer(book, 'kitten') || isRightAnswer(book, 'a kiten')) problems.push('el corrector del cuaderno no acepta lo que debe');
    if (noteMistake({ ...choose, answer: 'Not there.' }, d1) !== null) problems.push('se apunta un error de elegir cuya respuesta no esta entre las opciones');

    // 7. No crece sin fin: se quedan los mas recientes.
    state.reset();
    for (let i = 0; i < MISTAKES_KEPT + 15; i += 1) noteMistake({ ...write, prompt: `Clue number ${i}.` }, i < 15 ? d1 : d2);
    if (mistakesOf().length !== MISTAKES_KEPT || mistakesOf().some((m) => m.last === d1)) problems.push('el cuaderno crece sin tope o no tira los mas viejos');

    // 8. Para el profesor: lo que mas ninos fallan sale primero.
    const top = classMistakes([
      { name: 'Ana', data: { mistakes: [{ ...choose, key: 'k1', first: d1, last: d1, misses: 1, wins: [] }] } },
      { name: 'Leo', data: { mistakes: [{ ...choose, key: 'k1', first: d1, last: d1, misses: 1, wins: [] }, { ...write, key: 'k2', first: d1, last: d1, misses: 4, wins: [] }] } },
    ]);
    if (top[0]?.mistake.key !== 'k1' || top[0]?.names.join() !== 'Ana,Leo' || top.length !== 2) problems.push('la lista de la clase no pone primero lo que fallan mas ninos');
  } catch (error) {
    problems.push(`la prueba del cuaderno se rompio: ${error instanceof Error ? error.stack : String(error)}`);
  } finally {
    if (kid) profiles.remove(kid.id);
    state.useProfile(before);
  }

  // 9. "Fix my mistakes" se juega de verdad: con la respuesta buena, escrita y elegida.
  const browser = createBrowser({ seed: 22 });
  browser.install();
  const player = profiles.add('zzArreglar', { select: false });
  try {
    if (!player) throw new Error('no se pudo crear el alumno de prueba');
    state.useProfile(player.id);
    state.reset();
    const today = localDate();
    const yesterday = dayBefore(today);
    noteMistake({ game: 'spellit', kind: 'write', prompt: 'This is a baby dog.', answer: 'a puppy', given: 'a pupy' }, yesterday);
    noteMistake({
      game: 'respond', kind: 'choose', prompt: 'Dad: Can you help me?', options: ['Yes, of course.', 'It is blue.', 'At home.'], answer: 'Yes, of course.',
    }, yesterday);
    const { mount } = await import('../src/games/fixit/index.js');
    const root = browser.document.createElement('div');
    browser.document.body.append(root);
    const game = mount(root, { topicId: 'animals', onExit: () => {} });
    for (let step = 0; step < 6 && !root.querySelectorAll('.result').some(isVisible); step += 1) {
      const input = root.querySelector('input');
      const prompt = root.querySelector('.fixit-prompt')?.textContent ?? '';
      if (input && isVisible(input)) {
        input.value = prompt.includes('dog') ? 'a puppy' : 'x';
        input.dispatchEvent(new FakeEvent('input', { bubbles: true }));
        input.dispatchEvent(new FakeEvent('keydown', { bubbles: true, key: 'Enter' }));
      } else {
        root.querySelectorAll('.chat-option').find((b) => b.dataset.value === 'Yes, of course.')?.click();
      }
      browser.clock.advance(4000);
      await settle(3);
    }
    const text = root.textContent ?? '';
    if (!/2 out of 2/.test(text)) problems.push(`"Fix my mistakes" no da por buenas las respuestas buenas: ${text.slice(0, 120)}`);
    if (mistakesOf().some((m) => m.wins.join() !== today)) problems.push('"Fix my mistakes" no apunta el acierto de hoy');
    game.destroy();
    // Al otro dia, otro acierto y quedan arreglados.
    state.update((s) => {
      /** @type {any} */ (s).mistakes = mistakesOf().map((m) => ({ ...m, last: yesterday, wins: [yesterday] }));
    });
    const again = mount(root, { topicId: 'animals', onExit: () => {} });
    for (let step = 0; step < 6 && !root.querySelectorAll('.result').some(isVisible); step += 1) {
      const input = root.querySelector('input');
      if (input && isVisible(input)) {
        input.value = 'a puppy';
        input.dispatchEvent(new FakeEvent('keydown', { bubbles: true, key: 'Enter' }));
      } else {
        root.querySelectorAll('.chat-option').find((b) => b.dataset.value === 'Yes, of course.')?.click();
      }
      browser.clock.advance(4000);
      await settle(3);
    }
    if (mistakesOf().length || fixedCount() !== 2) problems.push('acertar el segundo dia en "Fix my mistakes" no arregla los errores');
    again.destroy();
    // Sin errores que toquen, una pantalla que lo explica (no un juego vacio).
    const empty = mount(root, { topicId: 'animals', onExit: () => {} });
    if (!/No mistakes to fix/.test(root.textContent ?? '')) problems.push('sin errores, "Fix my mistakes" no dice que no hay nada que arreglar');
    empty.destroy();
    for (const e of browser.errors()) problems.push(`error en ${e.where}: ${e.error instanceof Error ? e.error.message : String(e.error)}`);
  } catch (error) {
    problems.push(`la prueba de "Fix my mistakes" se rompio: ${error instanceof Error ? error.stack : String(error)}`);
  } finally {
    if (player) profiles.remove(player.id);
    browser.uninstall();
    state.useProfile(before);
  }

  return {
    ok: problems.length === 0,
    detail: `${Object.keys(HOOKED).length} juegos apuntan sus fallos; vuelven otro dia y se arreglan en dos`,
    problems,
    numbers: { juegosQueApuntanFallos: Object.keys(HOOKED).length },
  };
}
