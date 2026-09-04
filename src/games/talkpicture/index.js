import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { PART6_SCENES, renderScene } from '../../data/scenes/part6.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'talkpicture', title: 'Let\u2019s talk!' };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// "Let's talk!" del picture book: cuatro preguntas sobre una lamina.
// Se generan del modelo de la escena, asi que la respuesta se puede comprobar.
function questionsFor(scene) {
  const coloured = scene.entities.filter((e) => e.colours.length);
  const placed = scene.entities.filter((e) => e.place && e.place !== 'here');
  const acting = scene.entities.filter((e) => e.action);
  const out = [];
  const c1 = pick(coloured);
  out.push({ say: `What colour is the ${c1.noun}?`, expect: c1.colours, model: `The ${c1.noun} is ${c1.colours[0]}.` });
  const p1 = pick(placed);
  out.push({ say: `Where is the ${p1.noun}?`, expect: p1.place.split(' '), model: `The ${p1.noun} is ${p1.place}.` });
  if (acting.length) {
    const a1 = pick(acting);
    out.push({ say: `What is the ${a1.noun} doing?`, expect: [a1.action], model: `The ${a1.noun} is ${a1.action}.` });
  }
  const c2 = pick(coloured.filter((e) => e !== c1)) ?? c1;
  out.push({ say: `Do you like the ${c2.noun}? Why?`, expect: ['yes', 'no', 'because'], model: `Yes, I like the ${c2.noun} because it is ${c2.colours[0]}.` });
  return out.slice(0, 4);
}

const words = (t) => String(t).toLowerCase().replace(/\u2019/g, "'").match(/[a-z']+/g) ?? [];

export function mount(root, ctx = {}) {
  let scene = pick(PART6_SCENES);
  let questions = questionsFor(scene);
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const picture = h('div', { class: 'p6-picture' });
  const question = h('p', { class: 'p6-prompt' });
  const feedback = h('p', { class: 'spell-feedback' });
  const model = h('p', { class: 'talk-model hidden' });
  const stage = h('div');
  const input = h('input', {
    type: 'text', maxlength: '60', autocomplete: 'off', spellcheck: 'false',
    placeholder: 'say it, then write it here', 'aria-label': 'Your answer',
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Let\u2019s talk!'),
    h('span', { class: 'scene-label' }, scene.title),
    h('div', { class: 'spacer' }),
    marks,
    counter,
  ]);

  function submit() {
    if (locked) return;
    const q = questions[index];
    const said = words(input.value);
    if (!said.length) {
      feedback.textContent = 'Say your answer out loud, then write it.';
      feedback.className = 'spell-feedback spell-feedback--no';
      return;
    }
    locked = true;
    const hit = q.expect.some((w) => said.includes(w.toLowerCase()));
    const m = hit ? (said.length >= 3 ? 2 : 1) : 1;
    score += m;
    answers.push({ q, m });
    marks.textContent = `${score} / ${questions.length * 2}`;
    feedback.textContent = m === 2 ? 'Good answer.' : hit ? 'Right idea. Say it in a whole sentence.' : 'You answered, so one mark. Look at the picture again.';
    feedback.className = `spell-feedback spell-feedback--${m === 2 ? 'ok' : 'no'}`;
    cue(m === 2 ? 'correct' : 'wrong');
    fill(model, [h('b', {}, 'A good answer: '), q.model]);
    model.classList.remove('hidden');
    speak(q.model);
    setTimeout(next, m === 2 ? 2000 : 3200);
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const q = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    marks.textContent = `${score} / ${questions.length * 2}`;
    question.textContent = q.say;
    input.value = '';
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    model.classList.add('hidden');
    speak(q.say);
    setTimeout(() => input.focus(), 80);
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = questions.length * 2;
    const shields = shieldsFor(score, total);
    if (ctx.onFinish) return ctx.onFinish({ score, total });
    state.touchStreak();
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'Talking about a picture is most of the Speaking test. Colour, place, what people are doing.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.m === 2 ? '' : 'bad' }, [
        h('b', {}, `${a.m}/2 `), `${a.q.say} \u2014 ${a.q.model}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => { scene = pick(PART6_SCENES.filter((s) => s !== scene)) ?? scene; questions = questionsFor(scene); index = 0; score = 0; answers.length = 0; build(); } }, 'Another picture'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function build() {
    picture.innerHTML = renderScene(scene);
    fill(stage,
      h('p', { class: 'bank-hint' }, 'Look at the picture and talk. Say your answer out loud first, then write it. Four questions.'),
      picture,
      h('div', { class: 'instruction instruction--clue' }, [question,
        h('button', { class: 'btn', onClick: () => !locked && speak(questions[index].say) }, 'Ask me again')]),
      h('div', { class: 'writer' }, [input, h('button', { class: 'btn btn--go', onClick: submit }, 'Check')]),
      feedback, model);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();
  return { destroy() { stopVoice(); } };
}
