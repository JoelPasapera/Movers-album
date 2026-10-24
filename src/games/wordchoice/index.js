import { h, mount as fill } from '../../core/dom.js';
import { cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomCloze } from '../../data/cloze.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'wordchoice', title: 'Choose the right word' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let cloze = randomCloze();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const text = h('p', { class: 'gap-text' });
  const options = h('div', { class: 'chat-options' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Choose the right word'),
    h('span', { class: 'scene-label' }, cloze.title),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  function paintText() {
    fill(text, ...cloze.parts.flatMap((chunk, i) => {
      if (i >= cloze.gaps.length) return [chunk];
      const filled = answers[i];
      const slot = h('span', {
        class: `gap-slot${i === index ? ' is-active' : ''}`,
      }, filled ? filled.word : '\u2026');
      if (filled) slot.classList.add(filled.ok ? 'is-ok' : 'is-no');
      return [chunk, slot];
    }));
  }

  function choose(i) {
    if (locked) return;
    locked = true;
    const gap = cloze.gaps[index];
    const ok = i === gap.answer;
    if (ok) score += 1;
    answers[index] = { word: gap.options[gap.answer], given: gap.options[i], ok };
    marksChip.textContent = `${score} / ${cloze.gaps.length} marks`;
    paintText();
    feedback.textContent = ok ? `Yes. ${gap.why}` : `Not that one. ${gap.why}`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    setTimeout(next, ok ? 1500 : 3000);
  }

  function next() {
    index += 1;
    if (index >= cloze.gaps.length) return finish();
    render();
  }

  function render() {
    locked = false;
    counter.textContent = `${index + 1} of ${cloze.gaps.length}`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    paintText();
    fill(options, ...cloze.gaps[index].options.map((word, i) => h('button', {
      class: 'chat-option',
      onClick: () => choose(i),
    }, [h('span', { class: 'chat-option__letter' }, 'ABC'[i]), word])));
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = cloze.gaps.length;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('wordchoice', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 2));

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        'This part is about grammar, not about the animals or the weather. '
        + 'You never have to think of a word: you only choose from the three.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a, i) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.word} \u2014 ${cloze.gaps[i].why}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New text'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    cloze = randomCloze(cloze.id);
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    answers.length = 0;
    fill(stage,
      h('p', { class: 'bank-hint' },
        'Read the text and choose the right word for each gap. This part is about '
        + 'grammar. Five marks.'),
      text,
      options,
      feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return { destroy() { stopVoice(); } };
}
