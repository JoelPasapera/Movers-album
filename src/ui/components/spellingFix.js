// @ts-check
// Corregir un fallo de ortografia como se hace en clase: mira, tapa, escribe,
// comprueba.
//
//   1. Mira: lo que escribio el nino encima de la palabra bien escrita, con las
//      letras que fallaron en color y una pista ("This word has a double
//      letter: pp"). Suena la palabra.
//   2. Tapa: cuando dice que esta listo, la palabra se tapa.
//   3. Escribe: la escribe otra vez, de memoria.
//   4. Comprueba: bien, "Now you know it"; mal, se le ensena otra vez.
//
// Es corregir con el error delante y producir la forma buena enseguida: lo que
// mas ayuda a no repetirlo. Solo en practica: en el simulacro no se corrige
// nada hasta el final, como en el examen.

import { h, mount as fill } from '../../core/dom.js';
import { speak } from '../../core/audio.js';
import { compareSpelling, normaliseSpelling, spellingHint } from '../../engine/spelling.js';

/** @typedef {import('../../engine/spelling.js').Slot} Slot */

/** El hueco de una letra que falta o el espacio entre palabras, para que se vea. @param {string} letter */
const shown = (letter) => (letter === ' ' ? ' ' : letter);

/**
 * Es casi la palabra (unas pocas letras)? Si escribio otra palabra, comparar
 * letra a letra solo es ruido: se ensena la palabra buena y nada mas.
 * @param {Slot[]} slots
 */
function isNear(slots) {
  const changes = slots.filter((slot) => slot.kind !== 'same').length;
  const length = slots.filter((slot) => slot.kind !== 'extra').length;
  return changes <= Math.max(2, Math.floor(length / 3));
}

/**
 * Las dos filas de la comparacion, columna a columna: arriba lo escrito, abajo
 * la palabra. `covered` tapa la fila de abajo (paso 2). Si escribio otra
 * palabra, solo la fila de la palabra buena.
 * @param {Slot[]} slots @param {boolean} covered
 */
function diffGrid(slots, covered) {
  if (!isNear(slots)) {
    const letters = slots.filter((slot) => slot.kind !== 'extra');
    return h('div', {
      class: 'spellfix__grid',
      style: `grid-template-columns:auto repeat(${letters.length}, minmax(0.8em, 1.4em))`,
    }, [
      h('span', { class: 'spellfix__label' }, 'The word'),
      ...letters.map((slot) => h('span', {
        class: `spellfix__cell${covered ? ' spellfix__cell--covered' : ''}`,
      }, covered ? '\u00a0' : shown(slot.answer))),
    ]);
  }
  const typedRow = slots.map((slot) => h('span', {
    class: `spellfix__cell spellfix__cell--${slot.kind}`,
  }, slot.kind === 'missing' ? '_' : shown(slot.typed)));
  const answerRow = slots.map((slot) => {
    if (slot.kind === 'extra') return h('span', { class: 'spellfix__cell spellfix__cell--blank' }, ' ');
    const marked = slot.kind === 'same' ? '' : ' spellfix__cell--fix';
    return h('span', { class: `spellfix__cell${covered ? ' spellfix__cell--covered' : marked}` }, covered ? ' ' : shown(slot.answer));
  });
  return h('div', {
    class: 'spellfix__grid',
    style: `grid-template-columns:auto repeat(${slots.length}, minmax(0.8em, 1.4em))`,
  }, [
    h('span', { class: 'spellfix__label' }, 'You wrote'),
    ...typedRow,
    h('span', { class: 'spellfix__label' }, 'The word'),
    ...answerRow,
  ]);
}

/**
 * La caja de correccion. Llama a `onDone(true)` si al final la escribe bien y a
 * `onDone(false)` si no; quien la usa sigue con su juego entonces.
 * @param {{
 *   typed: string,
 *   answer: string,
 *   say?: string,
 *   onDone: (ok: boolean) => void,
 * }} options
 *   typed: lo que escribio el nino; answer: la palabra (o palabras) bien
 *   escrita; say: lo que se dice en voz alta (por defecto, la palabra)
 * @returns {HTMLElement}
 */
export function spellingFix({ typed, answer, say, onDone }) {
  const slots = compareSpelling(typed, answer);
  const spoken = say ?? answer;
  let finished = false;

  const grid = h('div');
  const message = h('p', { class: 'spellfix__hint', 'aria-live': 'polite' }, spellingHint(typed, answer));
  const actions = h('div', { class: 'spellfix__actions' });
  const box = h('div', {
    class: 'spellfix',
    role: 'group',
    'aria-label': `Fix the spelling. You wrote ${normaliseSpelling(typed)}. The word is ${normaliseSpelling(answer)}.`,
  }, [
    h('p', { class: 'spellfix__title' }, 'Let’s fix it'),
    grid,
    message,
    actions,
  ]);

  const input = h('input', {
    type: 'text',
    maxlength: '40',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'write it again',
    'aria-label': 'Write the word again without looking',
  });

  /** @param {boolean} ok */
  const end = (ok) => {
    if (finished) return;
    finished = true;
    setTimeout(() => onDone(ok), ok ? 900 : 1900);
  };

  function check() {
    if (finished) return;
    const got = normaliseSpelling(input.value);
    if (!got) {
      message.textContent = 'Write the word first.';
      input.focus();
      return;
    }
    input.disabled = true;
    if (got === normaliseSpelling(answer)) {
      message.textContent = 'Well done! Now you know it.';
      message.className = 'spellfix__hint spellfix__hint--ok';
      end(true);
      return;
    }
    fill(grid, diffGrid(compareSpelling(input.value, answer), false));
    message.textContent = `Look again: ${answer}. It will come back soon.`;
    message.className = 'spellfix__hint spellfix__hint--no';
    speak(spoken);
    end(false);
  }

  function cover() {
    fill(grid, diffGrid(slots, true));
    message.textContent = 'Now write it without looking.';
    input.value = '';
    fill(actions,
      input,
      h('button', { class: 'btn btn--go', type: 'button', onClick: check }, 'Check'),
      h('button', { class: 'btn', type: 'button', onClick: () => speak(spoken) }, 'Hear it'));
    input.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault();
        check();
      }
    });
    setTimeout(() => input.focus(), 60);
  }

  const ready = h('button', { class: 'btn btn--go', type: 'button', onClick: cover }, 'I’m ready to write it');
  fill(grid, diffGrid(slots, false));
  fill(actions, ready);
  speak(spoken);
  setTimeout(() => ready.focus(), 60);
  return box;
}
