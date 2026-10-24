import { h, mount as fill, qsa } from '../../core/dom.js';
import { cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomGapStory } from '../../data/gap-stories.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'gapstory', title: 'Fill the story' };

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let story = randomGapStory();
  let bank = shuffle(story.bank);
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const text = h('p', { class: 'gap-text' });
  const bankRow = h('div', { class: 'tiles' });
  const titleBox = h('div', { class: 'hidden' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const total = () => story.answers.length + 1;

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Fill the story'),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  function paintText() {
    fill(text, ...story.parts.flatMap((chunk, i) => {
      const gap = i < story.answers.length
        ? h('span', {
          class: `gap-slot${i === index ? ' is-active' : ''}`,
          dataset: { gap: String(i) },
        }, answers[i] ? answers[i].chosen : '\u2026')
        : null;
      if (gap && answers[i]) gap.classList.add(answers[i].ok ? 'is-ok' : 'is-no');
      return [chunk, gap].filter(Boolean);
    }));
  }

  function choose(word) {
    if (locked) return;
    locked = true;
    const want = story.answers[index];
    const ok = word === want;
    if (ok) score += 1;
    answers[index] = { chosen: ok ? word : want, given: word, ok };
    marksChip.textContent = `${score} / ${total()} marks`;
    paintText();
    qsa('.tile', bankRow).forEach((tile) => {
      if (tile.dataset.word === want) tile.classList.add('is-used');
    });
    feedback.textContent = ok ? 'Yes, that fits.' : `It was "${want}". Read the whole sentence again.`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    setTimeout(next, ok ? 900 : 2000);
  }

  function next() {
    index += 1;
    if (index >= story.answers.length) return askTitle();
    locked = false;
    counter.textContent = `${index + 1} of ${total()}`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    paintText();
  }

  function askTitle() {
    locked = false;
    counter.textContent = `${total()} of ${total()}`;
    paintText();
    bankRow.classList.add('hidden');
    fill(titleBox, [
      h('p', { class: 'tiles-label' }, 'Now choose the best name for this story:'),
      h('div', { class: 'chat-options' }, story.titles.map((title, i) => h('button', {
        class: 'chat-option',
        onClick: () => {
          if (locked) return;
          locked = true;
          const ok = i === story.title;
          if (ok) score += 1;
          answers.push({ chosen: title, ok, isTitle: true });
          marksChip.textContent = `${score} / ${total()} marks`;
          cue(ok ? 'correct' : 'wrong');
          feedback.textContent = ok
            ? 'Yes. The name has to fit the whole story, not just one line.'
            : `It was "${story.titles[story.title]}". The name has to fit the whole story.`;
          feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
          setTimeout(finish, ok ? 1400 : 2600);
        },
      }, [h('span', { class: 'chat-option__letter' }, 'ABC'[i]), title]))),
    ]);
    titleBox.classList.remove('hidden');
  }

  function finish() {
    stopVoice();
    cue('finish');
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total() });
    const shields = shieldsFor(score, total());
    recordShields('gapstory', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 2));
    const spare = story.bank.filter((w) => !story.answers.includes(w));

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total()} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        `Four words were never used: ${spare.join(', ')}. There are always more words `
        + 'than gaps, so read the whole sentence before you choose.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New story'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    story = randomGapStory(story.id);
    bank = shuffle(story.bank);
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    answers.length = 0;
    bankRow.classList.remove('hidden');
    titleBox.classList.add('hidden');
    counter.textContent = `1 of ${total()}`;
    marksChip.textContent = `0 / ${total()} marks`;
    fill(bankRow, ...bank.map((word) => h('button', {
      class: 'tile',
      dataset: { word },
      onClick: () => choose(word),
    }, word)));
    paintText();
    fill(stage,
      h('p', { class: 'bank-hint' },
        'Nine words, five gaps. Four words are never used. Then choose the best name '
        + 'for the story. Six marks.'),
      text,
      bankRow,
      titleBox,
      feedback);
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return { destroy() { stopVoice(); } };
}
