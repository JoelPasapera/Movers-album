import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomScene, renderScene } from '../../data/scenes/part6.js';
import { checkClosed, checkFree } from './checker.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'writeit', title: 'Write about the picture' };

const TOTAL_MARKS = 10;

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let scene = randomScene();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];
  const freeSentences = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const toastSlot = h('span');
  const picture = h('div', { class: 'p6-picture' });
  const promptLine = h('p', { class: 'p6-prompt' });
  const markLabel = h('span', { class: 'p6-marks' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const input = h('input', {
    type: 'text',
    maxlength: '80',
    autocomplete: 'off',
    autocapitalize: 'sentences',
    spellcheck: 'false',
    'aria-label': 'Write your answer',
  });

  const submitBtn = h('button', { class: 'btn btn--go', onClick: () => submit() }, 'Check');
  const hearBtn = h('button', {
    class: 'btn',
    onClick: () => !locked && speak(scene.prompts[index].text),
  }, 'Read it to me');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Write about the picture'),
    h('span', { class: 'scene-label' }, scene.title),
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
    setTimeout(() => fill(toastSlot), 1600);
  }

  function submit() {
    if (locked) return;
    const prompt = scene.prompts[index];
    const value = input.value.trim();
    if (!value) {
      feedback.textContent = 'Write something first.';
      feedback.className = 'spell-feedback spell-feedback--no';
      input.focus();
      return;
    }

    const result = prompt.kind === 'free'
      ? checkFree(scene, value, freeSentences)
      : checkClosed(prompt, value);

    if (prompt.kind === 'free' && result.marks > 0) freeSentences.push(value);

    locked = true;
    score += result.marks;
    answers.push({ prompt, value, marks: result.marks });
    marksChip.textContent = `${score} / ${TOTAL_MARKS} marks`;

    const full = result.marks === prompt.marks;
    feedback.textContent = result.note
      ?? (full ? 'Yes, that is right.' : `Not this time. ${prompt.answers ? `It was "${prompt.answers[0]}".` : ''}`);
    feedback.className = `spell-feedback spell-feedback--${full ? 'ok' : 'no'}`;
    cue(full ? 'correct' : 'wrong');
    toast(full ? 'ok' : 'no', `${result.marks} of ${prompt.marks}`);
    if (!full) {
      input.classList.add('shake');
      setTimeout(() => input.classList.remove('shake'), 320);
    }
    setTimeout(next, full ? 1500 : 3000);
  }

  function next() {
    index += 1;
    if (index >= scene.prompts.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const prompt = scene.prompts[index];
    counter.textContent = `${index + 1} of ${scene.prompts.length}`;
    marksChip.textContent = `${score} / ${TOTAL_MARKS} marks`;
    markLabel.textContent = prompt.marks === 2 ? '2 marks' : '1 mark';
    promptLine.textContent = prompt.kind === 'complete'
      ? `${prompt.text} \u2026`
      : prompt.text;
    input.value = '';
    input.placeholder = prompt.kind === 'complete' ? 'finish the sentence' : 'write here';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    speak(prompt.text);
    setTimeout(() => input.focus(), 80);
  }

  function finish() {
    stopVoice();
    cue('finish');
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: TOTAL_MARKS });
    const shields = shieldsFor(score, TOTAL_MARKS);
    recordShields('writeit', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 2));
    const freeMarks = answers.filter((a) => a.prompt.kind === 'free')
      .reduce((total, a) => total + a.marks, 0);

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${TOTAL_MARKS} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, freeMarks < 4
        ? 'The last two sentences are worth 4 of the 10 marks. Write about something you can really see.'
        : 'Your own two sentences were the strongest part. That is where the marks are.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.marks === a.prompt.marks ? '' : 'bad',
      }, [
        h('b', {}, `${a.marks}/${a.prompt.marks} `),
        `${a.prompt.text} \u2014 you wrote "${a.value}"`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New picture'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    scene = randomScene(scene.id);
    index = 0;
    score = 0;
    answers.length = 0;
    freeSentences.length = 0;
    build();
  }

  function build() {
    picture.innerHTML = renderScene(scene);
    fill(stage,
      h('p', { class: 'bank-hint' },
        'Six questions, ten marks. The last two are worth two marks each.'),
      picture,
      h('div', { class: 'instruction instruction--clue' }, [promptLine, markLabel]),
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
