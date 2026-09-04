import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice, playsLeft, countPlay } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { allPicturable } from '../../data/wordlist.js';
import { buildRound, isCorrect } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';

export const meta = { id: 'wordhunt', title: 'Word hunt' };

const TIME_PER_QUESTION = 9000;

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  const pool = allPicturable();
  let questions = buildRound(topic.words, pool);
  let index = 0;
  let combo = 0;
  let bestCombo = 0;
  let locked = false;
  let timerId = null;
  let deadline = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const comboChip = h('span', { class: 'combo hidden' });
  const toastSlot = h('span');
  const instructionText = h('p', { class: 'masked' });
  const timerBar = h('i');
  const cardGrid = h('div', { class: 'hunt-grid' });
  const stage = h('div');

  const sayAgain = h('button', {
    class: 'btn',
    onClick: () => {
      if (locked || playsLeft('q') <= 0) return;
      countPlay('q');
      speak(questions[index].say);
      refreshPlays();
    },
  }, 'Say it again');

  let masked = true;
  const maskToggle = h('button', {
    class: 'btn btn--ghost',
    onClick: () => {
      masked = !masked;
      instructionText.classList.toggle('masked', masked);
      maskToggle.textContent = masked ? 'Show the words' : 'Hide the words';
    },
  }, 'Show the words');
  if (ctx.exam) maskToggle.classList.add('hidden');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Word hunt'),
    h('span', { class: 'scene-label' }, topic.label),
    h('div', { class: 'spacer' }),
    comboChip,
    counter,
    toastSlot,
  ]);

  const instruction = h('div', { class: 'instruction' }, [
    instructionText, sayAgain, maskToggle,
  ]);

  const timer = h('div', { class: 'timer' }, timerBar);

  function refreshPlays() {
    const left = playsLeft('q');
    if (left === Infinity) return;
    sayAgain.textContent = left > 0 ? `Say it again (${left})` : 'No more plays';
    sayAgain.disabled = left <= 0;
  }

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'correct' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1500);
  }

  function stopTimer() {
    if (timerId) cancelAnimationFrame(timerId);
    timerId = null;
  }

  function runTimer() {
    stopTimer();
    deadline = performance.now() + TIME_PER_QUESTION;
    const tick = (now) => {
      const left = Math.max(0, deadline - now);
      const pct = (left / TIME_PER_QUESTION) * 100;
      timerBar.style.width = `${pct}%`;
      timerBar.style.background = pct < 30 ? 'var(--red)' : 'var(--green)';
      if (left <= 0) {
        answer(null);
        return;
      }
      timerId = requestAnimationFrame(tick);
    };
    timerId = requestAnimationFrame(tick);
  }

  function answer(wordId) {
    if (locked) return;
    locked = true;
    stopTimer();
    const question = questions[index];
    const ok = wordId !== null && isCorrect(question, wordId);
    answers.push({ question, ok, timedOut: wordId === null });

    if (ok) {
      combo += 1;
      bestCombo = Math.max(bestCombo, combo);
      cue('correct');
      toast('correct', combo >= 3 ? `${combo} in a row!` : 'Yes!');
    } else {
      combo = 0;
      cue('wrong');
      toast('wrong', wordId === null ? 'Too slow' : `It was the ${question.target.word}`);
    }
    updateCombo();

    Array.from(cardGrid.children).forEach((card) => {
      const id = card.dataset.word;
      card.classList.add('is-done');
      if (id === question.target.id) card.classList.add('is-right');
      else if (id === wordId) card.classList.add('is-wrong');
    });

    setTimeout(next, ok ? 800 : 1500);
  }

  function updateCombo() {
    comboChip.classList.toggle('hidden', combo < 2);
    comboChip.textContent = `\u{1F525} ${combo}`;
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const question = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    instructionText.textContent = question.say;
    instructionText.classList.toggle('masked', masked);

    fill(cardGrid, ...question.options.map((word, i) => h('button', {
      class: 'hunt-card',
      dataset: { word: word.id },
      'aria-label': `option ${i + 1} of ${question.options.length}`,
      onClick: () => answer(word.id),
    }, [
      h('span', { class: 'hunt-card__face' }, word.icon),
      h('span', { class: 'hunt-card__word' }, word.word),
    ])));

    // El reloj no empieza hasta que la voz termina la instruccion.
    // Con un tope de seguridad por si el navegador bloquea el audio.
    let started = false;
    const startClock = () => {
      if (started) return;
      started = true;
      runTimer();
    };
    timerBar.style.width = '100%';
    timerBar.style.background = 'var(--grey)';
    speak(question.say, { onEnd: startClock });
    setTimeout(startClock, 4000);
  }

  function finish() {
    stopTimer();
    stopVoice();
    cue('finish');
    const correct = answers.filter((a) => a.ok).length;
    if (ctx.onFinish) return ctx.onFinish({ score: correct, total: questions.length });
    const shields = shieldsFor(correct, questions.length);
    recordShields('wordhunt', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, correct);

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, correct === questions.length ? 'All correct!' : `${correct} out of ${questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      bestCombo >= 3 ? h('p', {}, `Best streak: ${bestCombo} in a row`) : null,
      stickerBlock(topic, unlocked, correct),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.question.target.icon} ${a.question.target.word}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    questions = buildRound(topic.words, pool);
    index = 0;
    combo = 0;
    bestCombo = 0;
    answers.length = 0;
    build();
  }

  function build() {
    if (!questions.length) {
      fill(root, h('div', { class: 'card' }, [
        h('h2', {}, 'Not enough pictures in this topic'),
        h('p', {}, 'Pick a topic with more picture words, like Animals or Food.'),
        h('div', { style: 'margin-top:14px' },
          h('button', { class: 'btn btn--go', onClick: () => ctx.onExit?.() }, 'Back to album')),
      ]));
      return;
    }
    updateCombo();
    fill(stage, instruction, timer, cardGrid);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopTimer();
      stopVoice();
    },
  };
}
