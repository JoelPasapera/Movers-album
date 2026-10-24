import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { RESCUE } from '../../data/personal-questions.js';
import { buildRound, checkAnswer, MAX_PER_QUESTION } from './questions.js';
import * as speech from '../../core/speech.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'talkabout', title: 'Talk about you' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let questions = buildRound();
  let index = 0;
  let busy = false;
  let listening = false;
  let score = 0;
  let stopListening = null;
  let recorder = null;
  let clipUrl = null;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const questionLine = h('p', { class: 'p6-prompt' });
  const heard = h('p', { class: 'talk-heard' });
  const feedback = h('p', { class: 'spell-feedback' });
  const playback = h('div', { class: 'talk-playback hidden' });
  const stage = h('div');

  const typed = h('input', {
    type: 'text',
    maxlength: '60',
    autocomplete: 'off',
    placeholder: 'or type your answer',
    'aria-label': 'Type your answer',
  });

  const mic = h('button', { class: 'mic', 'aria-label': 'Tap to talk' }, [
    h('span', { class: 'mic__dot' }),
    h('span', { class: 'mic__label' }, 'Tap to talk'),
  ]);

  const askAgain = h('button', {
    class: 'btn',
    onClick: () => !busy && speak(questions[index].say),
  }, 'Ask me again');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Talk about you'),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  const canRecognise = speech.recognitionSupported() && speech.secureEnough();
  const canRecord = speech.recorderSupported() && speech.secureEnough();

  const recogToggle = h('button', {
    class: 'btn btn--ghost',
    'aria-pressed': String(speech.isRecognitionAllowed()),
    onClick: () => {
      const on = speech.allowRecognition(!speech.isRecognitionAllowed());
      recogToggle.setAttribute('aria-pressed', String(on));
      recogToggle.textContent = on ? 'Listening: on' : 'Listening: off';
      privacy.classList.toggle('hidden', !on);
    },
  }, speech.isRecognitionAllowed() ? 'Listening: on' : 'Listening: off');

  const privacy = h('p', {
    class: 'talk-privacy hidden',
  }, 'While this is on, your browser sends the sound of your voice to its speech '
    + 'service to turn it into words. Turn it off to keep everything on this device.');

  function typedSubmit() {
    if (busy) return;
    const value = typed.value.trim();
    if (!value) return;
    grade(value, 'typed');
  }
  typed.addEventListener('keydown', (e) => { if (e.key === 'Enter') typedSubmit(); });

  function setMic(mode) {
    mic.classList.toggle('is-live', mode === 'live');
    mic.querySelector('.mic__label').textContent = {
      idle: canRecognise || canRecord ? 'Tap to talk' : 'No microphone',
      live: 'Listening\u2026 tap to stop',
      busy: 'Wait\u2026',
    }[mode];
  }

  async function startTalking() {
    if (busy) return;
    if (listening) return stopTalking();
    if (!canRecognise && !canRecord) {
      feedback.textContent = 'This device has no microphone here. Type your answer instead.';
      feedback.className = 'spell-feedback spell-feedback--no';
      typed.focus();
      return;
    }
    listening = true;
    setMic('live');
    heard.textContent = '';
    if (clipUrl) { URL.revokeObjectURL(clipUrl); clipUrl = null; }
    playback.classList.add('hidden');

    if (speech.isRecognitionAllowed() && canRecognise) {
      stopListening = speech.listen({
        onResult: ({ text }) => { heard.textContent = text; },
        onEnd: (text) => { listening = false; setMic('idle'); grade(text, 'voice'); },
        onError: () => {
          listening = false;
          setMic('idle');
          feedback.textContent = 'I could not hear you. Try again or type it.';
          feedback.className = 'spell-feedback spell-feedback--no';
        },
      });
      return;
    }

    try {
      recorder = await speech.record();
    } catch {
      listening = false;
      setMic('idle');
      feedback.textContent = 'The microphone is not allowed here. Type your answer instead.';
      feedback.className = 'spell-feedback spell-feedback--no';
    }
  }

  async function stopTalking() {
    if (!listening) return;
    listening = false;
    setMic('idle');
    if (stopListening) { stopListening(); stopListening = null; return; }
    if (!recorder) return;
    const blob = await recorder.stop();
    recorder = null;
    if (blob) {
      clipUrl = URL.createObjectURL(blob);
      fill(playback, [
        h('p', { class: 'talk-playback__hint' }, 'Listen to yourself, then compare:'),
        h('audio', { controls: 'controls', src: clipUrl }),
        h('button', {
          class: 'btn btn--go',
          onClick: () => grade(typed.value.trim() || '\u2026spoken\u2026', 'recorded'),
        }, 'I answered \u2192'),
      ]);
      playback.classList.remove('hidden');
    }
  }

  mic.addEventListener('click', () => (listening ? stopTalking() : startTalking()));

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
    heard.textContent = how === 'recorded' ? '' : text;
    feedback.textContent = result.note;
    feedback.className = `spell-feedback spell-feedback--${result.marks === MAX_PER_QUESTION ? 'ok' : 'no'}`;
    cue(result.marks === MAX_PER_QUESTION ? 'correct' : 'wrong');

    fill(playback, [
      h('p', { class: 'talk-model' }, [h('b', {}, 'A good answer: '), question.model]),
      h('div', { class: 'sayout__actions' }, [
        h('button', { class: 'btn', onClick: () => speak(question.model) }, 'Hear it'),
        h('button', { class: 'btn btn--go', onClick: next }, 'Next question \u2192'),
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
    heard.textContent = '';
    typed.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    playback.classList.add('hidden');
    setMic('idle');
    speak(question.say);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = questions.length * MAX_PER_QUESTION;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('talkabout', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 3));
    const silent = answers.filter((a) => a.marks === 0).length;

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, silent
        ? 'When you say nothing, you lose marks. If you do not understand, say '
          + '"Sorry?" or "I don\u2019t understand". The examiner will help you.'
        : 'You answered every question. That is what the examiner wants to see.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.marks === MAX_PER_QUESTION ? '' : 'bad',
      }, [
        h('b', {}, `${a.marks}/2 `),
        `${a.question.say} \u2014 ${a.question.model}`,
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
    const mode = speech.isRecognitionAllowed() && canRecognise
      ? 'Your answer is turned into words so it can be checked.'
      : canRecord
        ? 'Your voice is recorded on this device only, so you can hear yourself.'
        : 'No microphone here. Type your answers instead.';

    fill(stage,
      h('p', { class: 'bank-hint' },
        'The examiner asks about you. Short answers are fine, but say more than one word. '
        + `Six questions, twelve marks. ${mode}`),
      h('div', { class: 'instruction instruction--clue' }, [questionLine, askAgain]),
      h('div', { class: 'talk-mic' }, [mic, heard]),
      h('div', { class: 'writer' }, [
        typed,
        h('button', { class: 'btn', onClick: typedSubmit }, 'Send'),
        canRecognise ? recogToggle : null,
      ]),
      privacy,
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
      if (stopListening) stopListening();
      if (clipUrl) URL.revokeObjectURL(clipUrl);
    },
  };
}
