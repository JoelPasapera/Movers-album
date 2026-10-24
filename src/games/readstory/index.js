import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomStory } from '../../data/reading-stories.js';
import { renderPanel } from '../../data/scenes/pieces.js';
import { buildRound, checkAnswer, feedbackFor } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'readstory', title: 'Read and answer' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let source = randomStory();
  let round = buildRound(source);
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const toastSlot = h('span');
  const storyBox = h('div', { class: 'read-story' });
  const promptLine = h('p', { class: 'p6-prompt' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const input = h('input', {
    type: 'text',
    maxlength: '40',
    autocomplete: 'off',
    autocapitalize: 'off',
    spellcheck: 'false',
    placeholder: 'one, two or three words',
    'aria-label': 'Complete the sentence',
  });

  const submitBtn = h('button', { class: 'btn btn--go', onClick: () => submit() }, 'Check');
  const hearBtn = h('button', {
    class: 'btn',
    onClick: () => !locked && speak(round.questions[index].text),
  }, 'Read it to me');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Read and answer'),
    h('span', { class: 'scene-label' }, round.title),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
    toastSlot,
  ]);

  input.addEventListener('keydown', (event) => { if (event.key === 'Enter') submit(); });
  input.addEventListener('input', () => {
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
  });

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'ok' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1500);
  }

  function submit() {
    if (locked) return;
    const question = round.questions[index];
    const result = checkAnswer(question, input.value);

    if (result.kind === 'empty' || result.kind === 'tooLong') {
      feedback.textContent = result.kind === 'empty'
        ? 'Write the missing words.'
        : 'Use one, two or three words only.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }

    locked = true;
    const ok = result.kind === 'correct';
    if (ok) score += 1;
    answers.push({ question, value: input.value.trim(), ok, kind: result.kind });
    marksChip.textContent = `${score} / ${round.questions.length} marks`;

    feedback.textContent = feedbackFor(result, question);
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'ok' : 'no', ok ? 'Yes!' : 'Read it again');
    if (!ok) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 320);
    }
    setTimeout(next, ok ? 1200 : 2600);
  }

  function next() {
    index += 1;
    if (index >= round.questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    counter.textContent = `${index + 1} of ${round.questions.length}`;
    marksChip.textContent = `${score} / ${round.questions.length} marks`;
    promptLine.textContent = `${round.questions[index].text} \u2026`;
    input.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    setTimeout(() => input.focus(), 80);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = round.questions.length;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('readstory', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 2));
    const spellingSlips = answers.filter((a) => a.kind === 'spelling').length;

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, spellingSlips
        ? `${spellingSlips} answer${spellingSlips > 1 ? 's were' : ' was'} the right word with the wrong spelling. `
          + 'Copy the word exactly as it is written in the story.'
        : 'Every answer is somewhere in the story. The pictures never give it to you.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.question.text} ${a.question.answers[0]}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New story'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    source = randomStory(source.id);
    round = buildRound(source);
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    fill(storyBox, ...round.sections.map((section, i) => h('div', { class: 'read-section' }, [
      h('div', { class: 'read-section__art', html: renderPanel(section.art) }),
      h('p', { class: 'read-section__text' }, [
        h('b', {}, `${i + 1}. `),
        section.text,
      ]),
    ])));

    fill(stage,
      h('p', { class: 'bank-hint' },
        'Read the story, then finish the sentences. Every answer is in the text, '
        + 'never in the pictures. Seven marks.'),
      storyBox,
      h('div', { class: 'instruction instruction--clue' }, promptLine),
      h('div', { class: 'writer' }, [input, submitBtn, hearBtn]),
      feedback);
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
