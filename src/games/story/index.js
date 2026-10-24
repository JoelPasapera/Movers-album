import { h, mount as fill } from '../../core/dom.js';
import { speak, speakLines, cue, stop as stopVoice } from '../../core/audio.js';
import * as speech from '../../core/speech.js';
import { renderPanel } from '../../data/scenes/pieces.js';
import { buildRound, gradeTelling, MAX_PER_PANEL } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow } from '../../ui/components/rewards.js';

export const meta = { id: 'story', title: 'Tell the story' };

// Speaking, parte 2, como en el examen: cuatro dibujos en orden, el examinador
// dice el titulo y cuenta el primero, y el nino cuenta los otros tres hablando.
// Los puntos son orientativos (en el examen esta parte se valora con la escala
// de Speaking); lo que importa es decir algo con sentido de cada dibujo.
export function mount(root, ctx = {}) {
  let round = buildRound();
  let panelIndex = 1;
  let busy = false;
  let listening = false;
  let stopListening = null;
  let recorder = null;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const strip = h('div', { class: 'story-strip' });
  const prompt = h('p');
  const heard = h('p', { class: 'talk-heard' });
  const feedback = h('p', { class: 'spell-feedback' });
  const playback = h('div', { class: 'talk-playback hidden' });
  const stage = h('div');
  const work = h('div', { class: 'hidden' });

  const typed = h('input', { type: 'text', maxlength: '120', autocomplete: 'off', placeholder: 'or type what you said' });
  const mic = h('button', { class: 'mic', 'aria-label': 'Tap to talk' }, [h('span', { class: 'mic__dot' }), h('span', { class: 'mic__label' }, 'Tap to talk')]);
  const canRecognise = speech.recognitionSupported() && speech.secureEnough();
  const canRecord = speech.recorderSupported() && speech.secureEnough();

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Tell the story'),
    h('span', { class: 'scene-label' }, round.title),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  const panelById = (id) => round.panels.find((p) => p.id === id);

  function setMic(mode) {
    mic.classList.toggle('is-live', mode === 'live');
    mic.querySelector('.mic__label').textContent = {
      idle: canRecognise || canRecord ? 'Tap to talk' : 'No microphone',
      live: 'Tap when you finish',
    }[mode];
  }

  async function startTalking() {
    if (busy || listening) return;
    if (!canRecognise && !canRecord) {
      feedback.textContent = 'This device has no microphone here. Say it out loud anyway, then type a few words of what you said.';
      typed.focus();
      return;
    }
    listening = true;
    setMic('live');
    if (speech.isRecognitionAllowed() && canRecognise) {
      stopListening = speech.listen({
        onEnd: (text) => { listening = false; setMic('idle'); grade(text, 'voice'); },
        onError: () => { listening = false; setMic('idle'); feedback.textContent = 'I could not hear that. Try again or type it.'; },
      });
      return;
    }
    try {
      recorder = await speech.record();
    } catch {
      listening = false;
      setMic('idle');
      feedback.textContent = 'The microphone is not allowed here. Type what you said instead.';
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
      fill(playback, [
        h('p', { class: 'talk-playback__hint' }, 'Listen to yourself, then compare:'),
        h('audio', { controls: 'controls', src: URL.createObjectURL(blob) }),
        h('button', { class: 'btn btn--go', onClick: () => grade(typed.value.trim() || '\u2026spoken\u2026', 'recorded') }, 'I told it \u2192'),
      ]);
      playback.classList.remove('hidden');
    }
  }

  mic.addEventListener('click', () => (listening ? stopTalking() : startTalking()));
  typed.addEventListener('keydown', (e) => { if (e.key === 'Enter' && typed.value.trim()) grade(typed.value.trim(), 'typed'); });

  function grade(text, how) {
    if (busy) return;
    busy = true;
    const panel = panelById(round.order[panelIndex]);
    // Con grabacion no hay transcripcion: se confia en que ha contado el
    // dibujo, como haria un profesor en clase.
    const result = how === 'recorded'
      ? { marks: MAX_PER_PANEL, kind: 'recorded', note: 'You told this picture out loud. Well done.' }
      : gradeTelling(panel, text);
    score += result.marks;
    answers.push({ panel, text, marks: result.marks, how });
    marks.textContent = `${score} / ${(round.panels.length - 1) * MAX_PER_PANEL} marks`;
    heard.textContent = how === 'recorded' ? '' : text;
    feedback.textContent = result.note;
    feedback.className = `spell-feedback spell-feedback--${result.marks === MAX_PER_PANEL ? 'ok' : 'no'}`;
    cue(result.marks === MAX_PER_PANEL ? 'correct' : 'wrong');
    fill(playback, [
      h('p', { class: 'talk-model' }, [h('b', {}, 'One way to say it: '), panel.sentence]),
      h('div', { class: 'sayout__actions' }, [
        h('button', { class: 'btn', onClick: () => speak(panel.sentence) }, 'Hear it'),
        h('button', { class: 'btn btn--go', onClick: next }, panelIndex < round.panels.length - 1 ? 'Next picture \u2192' : 'Finish \u2192'),
      ]),
    ]);
    playback.classList.remove('hidden');
    speak(panel.sentence);
  }

  function next() {
    panelIndex += 1;
    busy = false;
    if (panelIndex >= round.panels.length) return finish();
    askPanel();
  }

  function drawStrip() {
    fill(strip, ...round.order.map((id, i) => h('div', {
      class: `story-panel${i === panelIndex ? ' is-current' : ''}`,
      dataset: { id },
    }, [
      h('span', { class: 'story-panel__num' }, String(i + 1)),
      h('div', { class: 'story-panel__art', html: renderPanel(panelById(id).art) }),
    ])));
  }

  function askPanel() {
    busy = false;
    drawStrip();
    counter.textContent = `picture ${panelIndex + 1} of ${round.panels.length}`;
    prompt.textContent = `Now you tell the story. What is happening in picture ${panelIndex + 1}?`;
    heard.textContent = '';
    typed.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    playback.classList.add('hidden');
    fill(playback);
    work.classList.remove('hidden');
    speak(`What is happening in picture ${panelIndex + 1}?`);
  }

  // El examinador: titulo, "mira los dibujos primero", y cuenta el dibujo 1.
  function intro() {
    panelIndex = 0;
    drawStrip();
    counter.textContent = `picture 1 of ${round.panels.length}`;
    prompt.textContent = `These pictures tell a story. It is called \u201c${round.title}\u201d. Look at the pictures first.`;
    work.classList.add('hidden');
    const first = panelById(round.order[0]);
    speakLines([
      { who: 'adult', text: `These pictures tell a story. It is called ${round.title}. Look at the pictures first.` },
      { who: 'adult', text: first.sentence },
      { who: 'adult', text: 'Now you tell the story.' },
    ], { onEnd: () => { if (panelIndex === 0) { panelIndex = 1; askPanel(); } } });
    fill(stage, [
      h('div', { class: 'instruction instruction--clue' }, prompt),
      strip,
      h('div', { class: 'result__actions' }, h('button', {
        class: 'btn', onClick: () => { stopVoice(); if (panelIndex === 0) { panelIndex = 1; askPanel(); } },
      }, 'I am ready \u2192')),
      work,
    ]);
    fill(work, [
      h('div', { class: 'talk-row' }, [mic, typed]),
      heard,
      feedback,
      playback,
    ]);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = (round.panels.length - 1) * MAX_PER_PANEL;
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    const shields = shieldsFor(score, total);
    recordShields('story', shields);
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, score === total ? 'You told the whole story!' : `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'The examiner is not looking for a perfect story. Say what you can see: who it is, where they are and what they are doing. If you get stuck, say a few words about the next picture.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.marks === MAX_PER_PANEL ? '' : 'bad' }, [
        h('b', {}, `${a.marks}/${MAX_PER_PANEL} `),
        a.panel.sentence,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { round = buildRound(); score = 0; answers.length = 0; intro(); } }, 'Another story'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  intro();
  return {
    destroy() {
      if (stopListening) stopListening();
      stopVoice();
    },
  };
}
