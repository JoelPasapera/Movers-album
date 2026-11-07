// @ts-check
// Letters and numbers: dictado de letras y numeros para la parte 2 de
// Listening. Se oye un nombre (o una palabra de la pagina) deletreado letra a
// letra, o una frase con un numero, y se escribe. Si se confunde una letra con
// otra (J y G) o un numero con su pareja (fourteen y forty), se dice cual y se
// oyen las dos seguidas; lo que cada nino confunde se apunta y vuelve mas.
//
// La logica esta en questions.js; lo que se guarda, en engine/letters.js.

import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice, currentRate, RATES } from '../../core/audio.js';
import { spellingPool } from '../../data/letters.js';
import { heardAll, heardBook, weakSpots, twinOf } from '../../engine/letters.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { practised } from '../../engine/progress.js';
import { shieldRow } from '../../ui/components/rewards.js';
import {
  ROUND, nextSpelling, nextNumber, checkAnswer, feedbackFor, isRight, heardKeys, contrastFor, sayAfter,
  promptFor, emptyHint,
} from './questions.js';

/** @typedef {import('./questions.js').Item} Item */
/** @typedef {import('./questions.js').Result} Result */

export const meta = { id: 'letters', title: 'Letters and numbers' };

/** Despacio: un poco mas lento que la velocidad lenta de Ajustes. */
const SLOW = RATES.slow - 0.1;

/**
 * Dice varias cosas una detras de otra (J... G...).
 * @param {string[]} list @param {number} [rate]
 */
function sayInTurn(list, rate) {
  /** @param {number} i */
  const say = (i) => { if (i < list.length) speak(list[i], { rate, onEnd: () => say(i + 1) }); };
  say(0);
}

/**
 * @param {HTMLElement} root
 * @param {{ topicId?: string, onExit?: () => void, onFinish?: (r: { score: number, total: number }) => void }} [ctx]
 */
export function mount(root, ctx = {}) {
  const pool = spellingPool(ctx.topicId);
  /** @type {Item[]} */
  let items = [];
  /** @type {{ item: Item, value: string, result: Result }[]} */
  let answers = [];
  /** Lo que se acaba de confundir en esta partida: vuelve enseguida. */
  let focus = new Set();
  let used = new Set();
  let index = 0;
  let locked = false;
  let gone = false;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer;

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const toastSlot = h('span');
  const prompt = h('p');
  const feedback = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const reveal = h('div', { class: 'letter-reveal' });
  const stage = h('div');

  const input = h('input', {
    type: 'text',
    maxlength: '24',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    'aria-label': 'Write what you listen to',
  });
  const submitBtn = h('button', { class: 'btn btn--go', onClick: () => submit() }, 'Check');
  const nextBtn = h('button', { class: 'btn btn--go hidden', onClick: () => next() }, 'Next');
  // Se puede volver a oir tambien despues de contestar, con la respuesta a la vista.
  const sayAgain = h('button', { class: 'btn', onClick: () => speak(current().say) }, 'Say it again');
  const slowly = h('button', {
    class: 'btn',
    'aria-label': 'Say it again slowly',
    onClick: () => speak(current().say, { rate: Math.min(currentRate(), SLOW) }),
  }, '\u{1F422} Slowly');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '← Album'),
    h('h2', {}, meta.title),
    h('div', { class: 'spacer' }),
    marks,
    counter,
    toastSlot,
  ]);

  input.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    // Sin esto, el Enter que corrige pulsaria tambien "Next" (que recibe el
    // foco al fallar) y la correccion no se llegaria a ver.
    event.preventDefault?.();
    if (locked && !nextBtn.classList.contains('hidden')) next();
    else submit();
  });
  input.addEventListener('input', () => {
    if (locked) return;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
  });

  /** La pregunta de ahora; se elige al llegar, con lo que se ha fallado hasta aqui. */
  function current() {
    if (!items[index]) {
      const picker = { history: heardBook(), focus, used, rng: Math.random };
      const numbersSoFar = items.filter((x) => x.kind === 'number').length;
      items[index] = ROUND[index] === 'number' ? nextNumber(numbersSoFar, picker) : nextSpelling(pool, picker);
    }
    return items[index];
  }

  /** @param {boolean} ok @param {string} message */
  function toast(ok, message) {
    fill(toastSlot, h('span', { class: `toast toast--${ok ? 'ok' : 'no'} pop` }, message));
    setTimeout(() => !gone && fill(toastSlot), 1500);
  }

  /** La respuesta buena, letra a letra, con la que fallo en rojo. @param {Item} item @param {Result} result */
  function showAnswer(item, result) {
    if (item.kind === 'number') {
      fill(reveal, h('div', { class: 'letter-strip' }, h('span', { class: isRight(result) ? 'is-ok' : 'is-no' }, item.answer)));
      return;
    }
    // Verde lo que se oyo bien, rojo lo que no; si lo escrito no se parece a
    // lo dictado, sin colores (no se sabe que letra fallo).
    const heard = result.heard;
    fill(reveal, h('div', { class: 'letter-strip', 'aria-label': item.answer }, item.letters.map((letter, i) => h('span', {
      class: heard ? (heard[i] ? 'is-ok' : 'is-no') : '',
    }, letter))));
  }

  /** Las dos que se confundieron, para oirlas otra vez. @param {{ show: string[], say: string[] }} pair */
  function contrastButton(pair) {
    return h('button', {
      class: 'btn letter-chip',
      'aria-label': `Listen: ${pair.show.join(' and ')}`,
      onClick: () => sayInTurn(pair.say, Math.min(currentRate(), RATES.slow)),
    }, `\u{1F50A} ${pair.show.join(' · ')}`);
  }

  function submit() {
    if (locked) return;
    const item = current();
    const result = checkAnswer(item, input.value);
    if (result.kind === 'empty') {
      feedback.textContent = emptyHint(item);
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }
    locked = true;
    const ok = isRight(result);
    answers.push({ item, value: input.value.trim(), result });
    const { keys, oks } = heardKeys(item, result);
    heardAll(keys, oks);
    marks.textContent = `${answers.filter((a) => isRight(a.result)).length} / ${ROUND.length}`;

    feedback.textContent = feedbackFor(result, item);
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    showAnswer(item, result);
    cue(ok ? 'correct' : 'wrong');
    toast(ok, ok ? 'Yes!' : 'Listen');

    if (ok) {
      speak(sayAfter(item));
      timer = setTimeout(next, 1600);
      return;
    }
    const pair = contrastFor(result, item);
    if (pair.say.length) {
      for (const k of pair.show) focus.add(k);
      reveal.append(contrastButton(pair));
      sayInTurn(pair.say, Math.min(currentRate(), RATES.slow));
    } else {
      speak(item.say, { rate: Math.min(currentRate(), RATES.slow) });
    }
    input.classList.add('shake');
    setTimeout(() => input.classList.remove('shake'), 320);
    nextBtn.classList.remove('hidden');
    nextBtn.focus();
  }

  function next() {
    clearTimeout(timer);
    if (gone) return;
    index += 1;
    if (index >= ROUND.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const item = current();
    counter.textContent = `${index + 1} of ${ROUND.length}`;
    marks.textContent = `${answers.filter((a) => isRight(a.result)).length} / ${ROUND.length}`;
    prompt.textContent = promptFor(item);
    input.value = '';
    input.placeholder = item.kind === 'number' ? 'write the number' : 'write the letters';
    input.setAttribute('inputmode', item.kind === 'number' ? 'numeric' : 'text');
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    fill(reveal);
    nextBtn.classList.add('hidden');
    speak(item.say);
    setTimeout(() => !gone && input.focus(), 80);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const score = answers.filter((a) => isRight(a.result)).length;
    const total = ROUND.length;
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    practised(meta.id);
    const shields = shieldsFor(score, total);
    const pairs = answers.map((a) => contrastFor(a.result, a.item)).filter((p) => p.say.length);
    const seen = new Set();
    const chips = pairs.filter((p) => {
      const k = [...p.show].sort().join('|');
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    const missedLetters = answers.some((a) => a.item.kind === 'spell' && !isRight(a.result));
    const missedTwins = answers.some((a) => a.result.kind === 'twin');
    const weak = weakSpots();
    const tricky = [...weak.letters, ...weak.numbers.map((n) => `${n} or ${twinOf(n)}`)];

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, score === total ? 'All correct!' : `${score} out of ${total}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      chips.length ? h('div', { class: 'spell-tip' }, [
        h('p', {}, 'Listen to these again:'),
        h('div', { class: 'letter-chips' }, chips.map(contrastButton)),
      ]) : null,
      missedLetters ? h('p', { class: 'spell-tip' }, 'In the Listening test they spell names letter by letter. Every letter must be right.') : null,
      missedTwins ? h('p', { class: 'spell-tip' }, 'Thirteen or thirty? Listen to the end of the number.') : null,
      tricky.length ? h('p', { class: 'spell-tip' }, `You often mix up: ${tricky.join(', ')}. They come back more.`) : null,
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: isRight(a.result) ? '' : 'bad' }, [
        h('b', {}, isRight(a.result) ? '✓ ' : '✗ '),
        a.item.answer,
        isRight(a.result) || !a.value ? '' : ` (you wrote ${a.value})`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'More letters'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    items = [];
    answers = [];
    focus = new Set();
    used = new Set();
    index = 0;
    build();
  }

  function build() {
    fill(stage,
      h('p', { class: 'bank-hint' }, 'In the test, names are spelled letter by letter and numbers go up to 100. Write them perfectly.'),
      h('div', { class: 'instruction instruction--clue' }, prompt),
      h('div', { class: 'writer' }, [input, submitBtn, sayAgain, slowly]),
      feedback,
      reveal,
      h('div', { class: 'result__actions' }, nextBtn));
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      gone = true;
      clearTimeout(timer);
      stopVoice();
    },
  };
}
