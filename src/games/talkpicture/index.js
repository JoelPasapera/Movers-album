import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { PART6_SCENES, renderScene } from '../../data/scenes/part6.js';
import { questionsFor } from './sceneTalk.js';
import { getBoard } from '../../data/boards.js';
import { boardQuestions, boardTiles, isRelevant } from './boardTalk.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { shieldRow } from '../../ui/components/rewards.js';
import { practised } from '../../engine/progress.js';

export const meta = { id: 'talkpicture', title: 'Let\u2019s talk!' };

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const words = (t) => String(t).toLowerCase().replace(/\u2019/g, "'").match(/[a-z']+/g) ?? [];

// La lamina de un tablero: sus palabras con el dibujo del album.
function tileGrid(board) {
  return h('div', { class: 'board-picture' }, boardTiles(board).map((tile) => h('div', {
    class: `board-tile${tile.icon ? '' : ' board-tile--text'}`,
  }, [
    tile.icon ? h('span', { class: 'board-tile__face' }, tile.icon) : null,
    h('b', {}, tile.word),
  ])));
}

export function mount(root, ctx = {}) {
  // Desde un tablero, la lamina y las preguntas son las del tablero.
  const boardData = ctx.boardId ? getBoard(ctx.boardId) : null;
  let scene = boardData ? null : pick(PART6_SCENES);
  let questions = boardData ? boardQuestions(boardData) : questionsFor(scene);
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marks = h('span', { class: 'marks-chip' });
  const picture = h('div', { class: 'p6-picture' });
  const question = h('p', { class: 'p6-prompt' });
  const feedback = h('p', { class: 'spell-feedback', 'aria-live': 'polite' });
  const model = h('p', { class: 'talk-model hidden' });
  const stage = h('div');
  const input = h('input', {
    type: 'text', maxlength: '60', autocomplete: 'off', spellcheck: 'false',
    placeholder: 'say it, then write it', 'aria-label': 'Your answer',
  });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, boardData ? '\u2190 Board' : '\u2190 Album'),
    h('h2', {}, 'Let\u2019s talk!'),
    h('span', { class: 'scene-label' }, boardData ? boardData.title : scene.title),
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
    const hit = isRelevant(q.expect, input.value);
    const m = hit ? (said.length >= 3 ? 2 : 1) : 1;
    score += m;
    answers.push({ q, m });
    marks.textContent = `${score} / ${questions.length * 2}`;
    feedback.textContent = m === 2 ? 'Good answer.' : hit ? 'Right idea. Say it in a whole sentence.' : `You answered, so one mark. ${q.hint ?? 'Look at the picture again.'}`;
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
    practised(meta.id);
    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' }, 'Talking about a picture is most of the Speaking test. Colour, place, what people are doing.'),
      h('div', { class: 'review' }, answers.map((a) => h('div', { class: a.m === 2 ? '' : 'bad' }, [
        h('b', {}, `${a.m}/2 `), `${a.q.say} \u2014 ${a.q.model}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, boardData ? 'Talk again' : 'Another picture'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, boardData ? 'Back to the board' : 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    if (boardData) {
      questions = boardQuestions(boardData);
    } else {
      scene = pick(PART6_SCENES.filter((s) => s !== scene)) ?? scene;
      questions = questionsFor(scene);
    }
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    if (boardData) fill(picture, tileGrid(boardData));
    else picture.innerHTML = renderScene(scene);
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
