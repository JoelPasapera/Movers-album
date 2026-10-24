import { h, mount as fill, qsa } from '../../core/dom.js';
import { speakLines, cue, stop as stopVoice, playsLeft, countPlay } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { renderCrowd } from '../../data/scenes/crowd.js';
import { buildRound, isMatch } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'matchnames', title: 'Match the names' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let round = buildRound();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const prompt = h('p', { class: 'p6-prompt masked' });
  const nameRow = h('div', { class: 'name-row' });
  const sceneWrap = h('div', { class: 'crowd-wrap' });
  const stage = h('div');

  let masked = true;
  const maskToggle = h('button', {
    class: 'btn btn--ghost',
    onClick: () => {
      masked = !masked;
      prompt.classList.toggle('masked', masked);
      maskToggle.textContent = masked ? 'Show the words' : 'Hide the words';
    },
  }, 'Show the words');
  if (ctx.exam) maskToggle.classList.add('hidden');

  const sayAgain = h('button', {
    class: 'btn',
    onClick: () => {
      if (locked || playsLeft('q') <= 0) return;
      countPlay('q');
      countPlay('q');
      speakLines(round.questions[index].lines);
      refreshPlays();
      refreshPlays();
    },
  }, 'Say it again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Match the names'),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  function refreshPlays() {
    const left = playsLeft('q');
    if (left === Infinity) return;
    sayAgain.textContent = left > 0 ? `Say it again (${left})` : 'No more plays';
    sayAgain.disabled = left <= 0;
  }

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'ok' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1600);
  }

  function label(slot, name, tone) {
    const group = sceneWrap.querySelector(`[data-person="${slot}"]`);
    if (!group) return;
    group.classList.add('is-named', `is-${tone}`);
    const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tag.setAttribute('class', `crowd-tag crowd-tag--${tone}`);
    tag.setAttribute('text-anchor', 'middle');
    tag.setAttribute('x', group.dataset.tagX ?? '0');
    tag.setAttribute('y', '0');
    group.append(tag);
    tag.textContent = name;
    const box = group.getBBox?.();
    if (box) {
      tag.setAttribute('x', String(box.x + box.width / 2));
      tag.setAttribute('y', String(box.y - 8));
    }
  }

  function answer(slot) {
    if (locked) return;
    const question = round.questions[index];
    locked = true;
    const ok = isMatch(question, slot);
    if (ok) score += 1;
    answers.push({ question, ok });
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'ok' : 'no', ok ? 'Yes!' : `That was not ${question.name}`);
    label(question.slot, question.name, ok ? 'ok' : 'no');
    if (!ok) {
      sceneWrap.classList.add('shake');
      setTimeout(() => sceneWrap.classList.remove('shake'), 320);
    }
    markNameUsed(question.name);
    setTimeout(next, ok ? 900 : 1700);
  }

  function markNameUsed(name) {
    qsa('.name-chip', nameRow).forEach((chip) => {
      if (chip.dataset.name === name) chip.classList.add('is-used');
    });
  }

  function next() {
    index += 1;
    if (index >= round.questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const question = round.questions[index];
    counter.textContent = `${index + 1} of ${round.questions.length}`;
    prompt.textContent = question.say;
    prompt.classList.toggle('masked', masked);
    speakLines(question.lines);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.questions.length;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('matchnames', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, score);

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        `One name was never used: ${round.extraName}. In the real test there is always `
        + 'one name too many, so never try to use them all.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        a.question.say,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    round = buildRound();
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function onSceneClick(event) {
    const group = event.target.closest('[data-person]');
    if (group) answer(group.dataset.person);
  }

  function onSceneKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const group = event.target.closest?.('[data-person]');
    if (!group) return;
    event.preventDefault();
    answer(group.dataset.person);
  }

  function build() {
    sceneWrap.innerHTML = renderCrowd(round.people);
    sceneWrap.removeEventListener('click', onSceneClick);
    sceneWrap.addEventListener('click', onSceneClick);
    sceneWrap.removeEventListener('keydown', onSceneKey);
    sceneWrap.addEventListener('keydown', onSceneKey);

    fill(nameRow, ...round.names.map((name) => h('span', {
      class: `name-chip${name === round.example.name ? ' is-used' : ''}`,
      dataset: { name },
    }, name)));

    fill(stage,
      h('p', { class: 'bank-hint' },
        'Seven names, six people. One name is not used. Listen, then tap the right person.'),
      nameRow,
      sceneWrap,
      h('div', { class: 'instruction instruction--clue' }, [prompt, sayAgain, maskToggle]));

    label(round.example.slot, round.example.name, 'example');
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
      sceneWrap.removeEventListener('click', onSceneClick);
      sceneWrap.removeEventListener('keydown', onSceneKey);
    },
  };
}
