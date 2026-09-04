import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { renderScene } from '../../data/scenes/garden.js';
import { buildRound, findDifference } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';

export const meta = { id: 'differences', title: 'Find the differences' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let round = buildRound();
  let found = new Set();
  let misses = 0;
  let busy = false;

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const prompt = h('p');
  const leftPanel = h('div', { class: 'diff-panel' });
  const rightPanel = h('div', { class: 'diff-panel' });
  const sayBox = h('div', { class: 'sayout hidden' });
  const foundList = h('div', { class: 'diff-found' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Find the differences'),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'correct' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1500);
  }

  function updateCounter() {
    counter.textContent = `${found.size} of ${round.differences.length}`;
  }

  function markFound(slotId) {
    [leftPanel, rightPanel].forEach((panel) => {
      const group = panel.querySelector(`[data-slot="${slotId}"]`);
      if (group) group.classList.add('is-found');
    });
  }

  function onPanelKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    if (!event.target.closest?.('[data-slot]')) return;
    event.preventDefault();
    onPanelClick(event);
  }

  function makeReachable(panel) {
    panel.querySelectorAll('[data-slot]').forEach((group) => {
      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      group.setAttribute('aria-label', `${group.dataset.slot} in this picture`);
    });
  }

  function onPanelClick(event) {
    if (busy) return;
    const group = event.target.closest('[data-slot]');
    if (!group) return;
    const slotId = group.dataset.slot;
    if (found.has(slotId)) return;

    const difference = findDifference(round, slotId);
    if (!difference) {
      misses += 1;
      cue('wrong');
      toast('wrong', 'That one is the same');
      group.classList.add('shake');
      setTimeout(() => group.classList.remove('shake'), 320);
      return;
    }

    found.add(slotId);
    markFound(slotId);
    cue('correct');
    updateCounter();
    showSentence(difference);
  }

  function showSentence(difference) {
    busy = true;
    prompt.textContent = 'Listen, then say it out loud.';
    fill(sayBox, [
      h('p', { class: 'sayout__line' }, difference.sentence),
      h('div', { class: 'sayout__actions' }, [
        h('button', {
          class: 'btn',
          onClick: () => speak(difference.sentence),
        }, 'Hear it again'),
        h('button', {
          class: 'btn btn--go',
          onClick: () => {
            sayBox.classList.add('hidden');
            busy = false;
            fill(foundList, ...[...found].map((id) => {
              const d = round.differences.find((x) => x.id === id);
              return h('div', {}, [h('b', {}, '\u2713 '), d.sentence]);
            }));
            if (found.size >= round.differences.length) finish();
            else prompt.textContent = 'Find another difference.';
          },
        }, 'I said it \u2192'),
      ]),
    ]);
    sayBox.classList.remove('hidden');
    speak(difference.sentence);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.differences.length;
    const penalty = Math.min(total, Math.floor(misses / 3));
    const score = Math.max(0, total - penalty);
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('differences', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.max(1, score - 1));

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, score === total
        ? 'All four, no mistakes!'
        : `${score} out of ${total}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      misses
        ? h('p', { class: 'spell-tip' },
          `You tapped ${misses} thing${misses > 1 ? 's' : ''} that were the same. Look at both pictures before you tap.`)
        : h('p', { class: 'spell-tip' }, 'Not one wrong tap. That is exactly how the test works.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, round.differences.map((d) => h('div', {}, d.sentence))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    round = buildRound();
    found = new Set();
    misses = 0;
    busy = false;
    build();
  }

  function build() {
    prompt.textContent = 'These two pictures look the same, but four things are different. Find them.';
    leftPanel.innerHTML = renderScene(round.left);
    rightPanel.innerHTML = renderScene(round.right);
    leftPanel.removeEventListener('click', onPanelClick);
    rightPanel.removeEventListener('click', onPanelClick);
    leftPanel.addEventListener('click', onPanelClick);
    rightPanel.addEventListener('click', onPanelClick);
    leftPanel.removeEventListener('keydown', onPanelKey);
    rightPanel.removeEventListener('keydown', onPanelKey);
    leftPanel.addEventListener('keydown', onPanelKey);
    rightPanel.addEventListener('keydown', onPanelKey);
    makeReachable(leftPanel);
    makeReachable(rightPanel);
    fill(foundList);
    updateCounter();
    fill(stage,
      h('div', { class: 'instruction instruction--clue' }, prompt),
      h('div', { class: 'diff-pair' }, [leftPanel, rightPanel]),
      sayBox,
      foundList);
    speak('Four things are different. Can you find them?');
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
      leftPanel.removeEventListener('click', onPanelClick);
      rightPanel.removeEventListener('click', onPanelClick);
      leftPanel.removeEventListener('keydown', onPanelKey);
      rightPanel.removeEventListener('keydown', onPanelKey);
    },
  };
}
