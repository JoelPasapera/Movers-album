// @ts-check
import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { RESCUE } from '../../data/personal-questions.js';
import { buildRound, checkAnswer, MAX_PER_QUESTION } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields, practised } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import { voiceInput } from '../../ui/components/voiceInput.js';
import { isQuiet, hideScoreInExam } from '../../ui/components/examQuiet.js';

export const meta = { id: 'talkabout', title: 'Talk about you' };

/**
 * Speaking, parte 4: el examinador pregunta cosas del nino.
 * @param {HTMLElement} root
 * @param {{ topicId?: string, exam?: boolean, onExit?: () => void, onFinish?: (r: { score: number, total: number }) => void }} [ctx]
 */
export function mount(root, ctx = {}) {
  // En el simulacro no se dice si una respuesta esta bien (ui/components/examQuiet.js).
  const quiet = isQuiet(ctx);
  const topic = getTopic(ctx.topicId);
  let questions = buildRound();
  let index = 0;
  let busy = false;
  let score = 0;
  /** @type {{ question: any, text: string, marks: number, how: string }[]} */
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  hideScoreInExam(marksChip, ctx);
  const questionLine = h('p', { class: 'p6-prompt' });
  const feedback = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const playback = h('div', { class: 'talk-playback hidden' });
  const stage = h('div');

  const voice = voiceInput({
    placeholder: 'or type your answer',
    isBusy: () => busy,
    onAnswer: (text, how) => grade(text, how),
  });

  const askAgain = h('button', {
    class: 'btn',
    onClick: () => !busy && speak(questions[index].say),
  }, 'Ask me again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '← Album'),
    h('h2', {}, 'Talk about you'),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  /** @param {string} text @param {string} how */
  function grade(text, how) {
    if (busy) return;
    busy = true;
    const question = questions[index];
    // Con grabacion no hay transcripcion: se confia en que ha contestado,
    // que es lo mismo que hace un profesor en clase.
    const result = how === 'recorded'
      ? { marks: MAX_PER_QUESTION, kind: 'recorded', note: 'You answered out loud. Well done.' }
      : checkAnswer(question, text);
    score += result.marks;
    answers.push({ question, text, marks: result.marks, how });
    marksChip.textContent = `${score} / ${questions.length * MAX_PER_QUESTION} marks`;
    voice.heard.textContent = how === 'recorded' ? '' : text;
    if (quiet) {
      // En el simulacro ni nota ni respuesta modelo: la pregunta siguiente.
      fill(playback, h('div', { class: 'sayout__actions' }, h('button', {
        class: 'btn btn--go', onClick: next,
      }, 'Next question \u2192')));
      playback.classList.remove('hidden');
      return;
    }
    feedback.textContent = result.note;
    feedback.className = `spell-feedback spell-feedback--${result.marks === MAX_PER_QUESTION ? 'ok' : 'no'}`;
    cue(result.marks === MAX_PER_QUESTION ? 'correct' : 'wrong');

    fill(playback, [
      h('p', { class: 'talk-model' }, [h('b', {}, 'A good answer: '), question.model]),
      h('div', { class: 'sayout__actions' }, [
        h('button', { class: 'btn', onClick: () => speak(question.model) }, 'Hear it'),
        h('button', { class: 'btn btn--go', onClick: next }, 'Next question →'),
      ]),
    ]);
    playback.classList.remove('hidden');
    speak(question.model);
  }

  function next() {
    index += 1;
    busy = false;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    busy = false;
    const question = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    marksChip.textContent = `${score} / ${questions.length * MAX_PER_QUESTION} marks`;
    questionLine.textContent = question.say;
    voice.reset();
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    playback.classList.add('hidden');
    speak(question.say);
  }

  function finish() {
    stopVoice();
    voice.reset();
    cue('finish');
    const total = questions.length * MAX_PER_QUESTION;
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    const shields = shieldsFor(score, total);
    recordShields('talkabout', shields);
    practised(meta.id);
    const unlocked = unlockNext(topic.id, Math.round(score / 3));
    const silent = answers.filter((a) => a.marks === 0).length;

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, silent
        ? 'When you say nothing, you lose marks. If you do not understand, say '
          + '"Sorry?" or "I don’t understand". The examiner will help you.'
        : 'You answered every question. That is what the examiner wants to see.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.marks === MAX_PER_QUESTION ? '' : 'bad',
      }, [
        h('b', {}, `${a.marks}/2 `),
        `${a.question.say} — ${a.question.model}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    questions = buildRound();
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    fill(stage,
      h('p', { class: 'bank-hint' },
        'The examiner asks about you. Short answers are fine, but say more than one word. '
        + `Six questions, twelve marks. ${voice.describe()}`),
      h('div', { class: 'instruction instruction--clue' }, [questionLine, askAgain]),
      h('div', { class: 'talk-mic' }, [voice.mic, voice.heard]),
      h('div', { class: 'writer' }, [voice.typed, voice.send, voice.toggle]),
      voice.privacy,
      voice.status,
      voice.clip,
      feedback,
      playback,
      h('div', { class: 'rescue' }, [
        h('p', { class: 'tiles-label' }, 'If you do not understand, say:'),
        h('div', { class: 'tiles' }, RESCUE.map((phrase) => h('button', {
          class: 'tile',
          onClick: () => speak(phrase),
        }, phrase))),
      ]));
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
      voice.destroy();
    },
  };
}
