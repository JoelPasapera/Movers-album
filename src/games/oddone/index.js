import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { buildRound, isOddOne, checkReason } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';

export const meta = { id: 'oddone', title: 'The odd one out' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let questions = buildRound();
  let index = 0;
  let step = 'pick';
  let groupChoice = null;
  let oddChoice = null;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const prompt = h('p');
  const cardGrid = h('div', { class: 'odd-grid' });
  const reasonBox = h('div', { class: 'reason hidden' });
  const sayBox = h('div', { class: 'sayout hidden' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'The odd one out'),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'correct' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1600);
  }

  function markCards(question, chosenId) {
    Array.from(cardGrid.children).forEach((card) => {
      card.classList.add('is-done');
      if (card.dataset.item === question.oddId) card.classList.add('is-right');
      else if (card.dataset.item === chosenId) card.classList.add('is-wrong');
    });
  }

  function pickOdd(itemId) {
    if (step !== 'pick') return;
    const question = questions[index];
    const ok = isOddOne(question, itemId);
    answers.push({ question, part: 'pick', ok });
    markCards(question, itemId);
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'correct' : 'wrong', ok ? 'Yes, that one!' : 'It was this one');
    step = 'reason';
    setTimeout(buildReason, ok ? 700 : 1300);
  }

  function buildReason() {
    groupChoice = null;
    oddChoice = null;
    prompt.textContent = 'Now say why. Finish the sentence.';
    speak('Now say why.');

    const gap1 = h('span', { class: 'gap' }, '\u2026');
    const gap2 = h('span', { class: 'gap' }, '\u2026');

    const check = h('button', { class: 'btn btn--go', disabled: true }, 'Say it');

    function refresh() {
      gap1.textContent = groupChoice ?? '\u2026';
      gap2.textContent = oddChoice ?? '\u2026';
      gap1.classList.toggle('gap--full', Boolean(groupChoice));
      gap2.classList.toggle('gap--full', Boolean(oddChoice));
      if (groupChoice && oddChoice) check.removeAttribute('disabled');
      else check.setAttribute('disabled', 'true');
    }

    const row = (options, kind) => h('div', { class: 'tiles' }, options.map((label) => h('button', {
      class: 'tile',
      onClick: (event) => {
        Array.from(event.currentTarget.parentElement.children)
          .forEach((t) => t.classList.remove('is-on'));
        event.currentTarget.classList.add('is-on');
        if (kind === 'group') groupChoice = label;
        else oddChoice = label;
        refresh();
      },
    }, label)));

    check.addEventListener('click', () => submitReason());

    fill(reasonBox, [
      h('p', { class: 'sentence' }, [
        'These are all ', gap1, ', but this is ', gap2, '.',
      ]),
      h('p', { class: 'tiles-label' }, 'These are all\u2026'),
      row(questions[index].groupOptions, 'group'),
      h('p', { class: 'tiles-label' }, 'but this is\u2026'),
      row(questions[index].oddOptions, 'odd'),
      h('div', { style: 'margin-top:14px' }, check),
    ]);
    reasonBox.classList.remove('hidden');
  }

  function submitReason() {
    if (step !== 'reason') return;
    const question = questions[index];
    const ok = checkReason(question, groupChoice, oddChoice);
    answers.push({ question, part: 'reason', ok });
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'correct' : 'wrong', ok ? 'Good reason!' : 'Not quite');
    step = 'say';
    reasonBox.classList.add('hidden');
    buildSay(ok);
  }

  function buildSay(reasonWasRight) {
    const question = questions[index];
    prompt.textContent = 'Listen, then say it out loud.';
    fill(sayBox, [
      reasonWasRight ? null : h('p', { class: 'sayout__fix' }, 'The full answer is:'),
      h('p', { class: 'sayout__line' }, question.sentence),
      h('div', { class: 'sayout__actions' }, [
        h('button', {
          class: 'btn',
          onClick: () => speak(question.sentence),
        }, 'Hear it again'),
        h('button', {
          class: 'btn btn--go',
          onClick: () => { sayBox.classList.add('hidden'); next(); },
        }, 'I said it \u2192'),
      ]),
    ]);
    sayBox.classList.remove('hidden');
    speak(question.sentence);
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    step = 'pick';
    const question = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    prompt.textContent = 'Which one is different?';
    reasonBox.classList.add('hidden');
    sayBox.classList.add('hidden');

    fill(cardGrid, ...question.items.map((item) => h('button', {
      class: 'odd-card',
      dataset: { item: item.id },
      'aria-label': item.word,
      onClick: () => pickOdd(item.id),
    }, [
      h('span', { class: 'odd-card__face' }, item.icon),
      h('span', { class: 'odd-card__word' }, item.word),
    ])));

    speak('Which one is different?');
  }

  function finish() {
    stopVoice();
    cue('finish');
    const correct = answers.filter((a) => a.ok).length;
    const total = answers.length;
    if (ctx.onFinish) return ctx.onFinish({ score: correct, total: total });
    const shields = shieldsFor(correct, total);
    recordShields('oddone', shields);
    state.touchStreak();
    const reasonMisses = answers.filter((a) => a.part === 'reason' && !a.ok).length;
    const unlocked = unlockNext(topic.id, Math.round(correct / 2));

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, correct === total ? 'All correct!' : `${correct} out of ${total}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      reasonMisses
        ? h('p', { class: 'spell-tip' },
          'Finding the different picture is only half the answer. The examiner wants the reason too.')
        : null,
      stickerBlock(topic, unlocked, correct),
      h('div', { class: 'review' }, questions.map((q) => h('div', {
        class: answers.filter((a) => a.question.id === q.id).every((a) => a.ok) ? '' : 'bad',
      }, q.sentence))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    questions = buildRound();
    index = 0;
    answers.length = 0;
    build();
  }

  function build() {
    fill(stage,
      h('div', { class: 'instruction instruction--clue' }, prompt),
      cardGrid,
      reasonBox,
      sayBox);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
    },
  };
}
