// @ts-check
import { h, mount as fill } from '../../core/dom.js';
import { speak, speakLines, cue, stop as stopVoice } from '../../core/audio.js';
import { renderPanel } from '../../data/scenes/pieces.js';
import { buildRound, gradeTelling, MAX_PER_PANEL } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { recordShields, practised } from '../../engine/progress.js';
import { shieldRow } from '../../ui/components/rewards.js';
import { voiceInput } from '../../ui/components/voiceInput.js';
import { isQuiet, hideScoreInExam } from '../../ui/components/examQuiet.js';

export const meta = { id: 'story', title: 'Tell the story' };

/**
 * Speaking, parte 2, como en el examen: cuatro dibujos en orden, el
 * examinador dice el titulo y cuenta el primero, y el nino cuenta los otros
 * tres hablando. Los puntos son orientativos (en el examen esta parte se
 * valora con la escala de Speaking); lo que importa es decir algo con sentido
 * de cada dibujo.
 * @param {HTMLElement} root
 * @param {{ exam?: boolean, onExit?: () => void, onFinish?: (r: { score: number, total: number }) => void }} [ctx]
 */
export function mount(root, ctx = {}) {
  // En el simulacro no se dice si una respuesta esta bien (ui/components/examQuiet.js).
  const quiet = isQuiet(ctx);
  let round = buildRound();
  let panelIndex = 1;
  let busy = false;
  let score = 0;
  /** @type {(() => void) | null} */
  let stopIntro = null;
  /** @type {{ panel: any, text: string, marks: number, how: string }[]} */
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  hideScoreInExam(marks, ctx);
  const title = h('span', { class: 'scene-label' });
  const strip = h('div', { class: 'story-strip' });
  const prompt = h('p');
  const feedback = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const playback = h('div', { class: 'talk-playback hidden' });
  const stage = h('div');
  const work = h('div', { class: 'hidden' });
  const ready = h('button', { class: 'btn', onClick: () => startTelling() }, 'I am ready →');

  const voice = voiceInput({
    placeholder: 'or type what you said',
    isBusy: () => busy || panelIndex === 0,
    doneLabel: 'I told it →',
    onAnswer: (text, how) => grade(text, how),
  });

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '← Album'),
    h('h2', {}, 'Tell the story'),
    title,
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  /** @param {string} id */
  const panelById = (id) => round.panels.find((/** @type {any} */ p) => p.id === id);
  const total = () => (round.panels.length - 1) * MAX_PER_PANEL;

  /** @param {string} text @param {string} how */
  function grade(text, how) {
    if (busy || panelIndex === 0) return;
    busy = true;
    const panel = panelById(round.order[panelIndex]);
    // Con grabacion no hay transcripcion: se confia en que ha contado el
    // dibujo, como haria un profesor en clase.
    const result = how === 'recorded'
      ? { marks: MAX_PER_PANEL, kind: 'recorded', note: 'You told this picture out loud. Well done.' }
      : gradeTelling(panel, text);
    score += result.marks;
    answers.push({ panel, text, marks: result.marks, how });
    marks.textContent = `${score} / ${total()} marks`;
    voice.heard.textContent = how === 'recorded' ? '' : text;
    if (quiet) {
      // En el simulacro ni nota ni frase modelo: el nino sigue cuando quiere.
      fill(playback, h('div', { class: 'sayout__actions' }, h('button', {
        class: 'btn btn--go', onClick: next,
      }, panelIndex < round.panels.length - 1 ? 'Next picture \u2192' : 'Finish \u2192')));
      playback.classList.remove('hidden');
      return;
    }
    feedback.textContent = result.note;
    feedback.className = `spell-feedback spell-feedback--${result.marks === MAX_PER_PANEL ? 'ok' : 'no'}`;
    cue(result.marks === MAX_PER_PANEL ? 'correct' : 'wrong');
    fill(playback, [
      h('p', { class: 'talk-model' }, [h('b', {}, 'One way to say it: '), panel.sentence]),
      h('div', { class: 'sayout__actions' }, [
        h('button', { class: 'btn', onClick: () => speak(panel.sentence) }, 'Hear it'),
        h('button', { class: 'btn btn--go', onClick: next }, panelIndex < round.panels.length - 1 ? 'Next picture →' : 'Finish →'),
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
    fill(strip, ...round.order.map((/** @type {string} */ id, /** @type {number} */ i) => h('div', {
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
    voice.reset();
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    playback.classList.add('hidden');
    fill(playback);
    ready.classList.add('hidden');
    work.classList.remove('hidden');
    speak(`What is happening in picture ${panelIndex + 1}?`);
  }

  // El nino dice que esta listo, o el examinador termina de contar el primero.
  function startTelling() {
    if (panelIndex !== 0) return;
    const cancel = stopIntro;
    stopIntro = null;
    cancel?.();
    panelIndex = 1;
    askPanel();
  }

  // El examinador: titulo, "mira los dibujos primero", y cuenta el dibujo 1.
  function intro() {
    panelIndex = 0;
    busy = false;
    title.textContent = round.title;
    marks.textContent = `${score} / ${total()} marks`;
    drawStrip();
    counter.textContent = `picture 1 of ${round.panels.length}`;
    prompt.textContent = `These pictures tell a story. It is called “${round.title}”. Look at the pictures first.`;
    work.classList.add('hidden');
    ready.classList.remove('hidden');
    fill(stage, [
      h('div', { class: 'instruction instruction--clue' }, prompt),
      strip,
      h('div', { class: 'result__actions' }, ready),
      work,
    ]);
    fill(work, [
      h('p', { class: 'bank-hint' }, voice.describe()),
      h('div', { class: 'talk-row' }, [voice.mic, voice.typed, voice.send, voice.toggle]),
      voice.privacy,
      voice.heard,
      voice.status,
      voice.clip,
      feedback,
      playback,
    ]);
    // La pantalla ya esta montada: si no hay voz, se pasa al dibujo 2 enseguida.
    const first = panelById(round.order[0]);
    const cancel = speakLines([
      { who: 'adult', text: `These pictures tell a story. It is called ${round.title}. Look at the pictures first.` },
      { who: 'adult', text: first.sentence },
      { who: 'adult', text: 'Now you tell the story.' },
    ], { onEnd: () => startTelling() });
    if (panelIndex === 0) stopIntro = cancel;
  }

  function finish() {
    stopVoice();
    voice.reset();
    cue('finish');
    if (ctx.onFinish) return ctx.onFinish({ score, total: total() });
    const shields = shieldsFor(score, total());
    recordShields('story', shields);
    practised(meta.id);
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, score === total() ? 'You told the whole story!' : `${score} out of ${total()} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'The examiner is not looking for a perfect story. Say what you can see: who it is, where they are and what they are doing. If you get stuck, say a few words about the next picture.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.marks === MAX_PER_PANEL ? '' : 'bad' }, [
        h('b', {}, `${a.marks}/${MAX_PER_PANEL} `),
        a.panel.sentence,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', {
          class: 'btn btn--go',
          onClick: () => { round = buildRound(); score = 0; answers.length = 0; intro(); },
        }, 'Another story'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  intro();
  return {
    destroy() {
      if (stopIntro) stopIntro();
      stopVoice();
      voice.destroy();
    },
  };
}
