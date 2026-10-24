import { h, mount as fill, qs, qsa } from '../../core/dom.js';
import { speak, cue, stop as stopVoice, playsLeft, countPlay } from '../../core/audio.js';
import { PALETTE } from '../../data/palette.js';
import { randomScene } from '../../data/scenes/index.js';
import { buildRound, checkColour, checkWord } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';

export const meta = { id: 'colour', title: 'Listen and colour' };

export function mount(root, ctx = {}) {
  let scene = randomScene();
  let questions = buildRound(scene);
  let index = 0;
  let selectedColour = null;
  let masked = true;
  const answers = [];

  const instructionText = h('p', { class: 'masked' });
  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const sceneWrap = h('div', { class: 'scene-wrap', html: scene.svg });
  const paletteRow = h('div', { class: 'palette' });
  const writerRow = h('div', { class: 'writer hidden' });
  const stage = h('div');

  const sceneLabel = h('span', { class: 'scene-label' });

  const sayAgain = h('button', {
    class: 'btn',
    onClick: () => speak(questions[index].say),
  }, 'Say it again');

  const maskToggle = h('button', {
    class: 'btn btn--ghost',
    onClick: () => {
      masked = !masked;
      instructionText.classList.toggle('masked', masked);
      maskToggle.textContent = masked ? 'Show the words' : 'Hide the words';
    },
  }, 'Show the words');
  if (ctx.exam) maskToggle.classList.add('hidden');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Listen and colour'),
    sceneLabel,
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  const instruction = h('div', { class: 'instruction' }, [
    instructionText, sayAgain, maskToggle,
  ]);

  function refreshPlays() {
    const left = playsLeft('q');
    if (left === Infinity) return;
    sayAgain.textContent = left > 0 ? `Say it again (${left})` : 'No more plays';
    sayAgain.disabled = left <= 0;
  }

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'correct' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1600);
  }

  function paint(objectId, hex) {
    const group = qs(`[data-obj="${objectId}"]`, sceneWrap);
    if (!group) return;
    qsa('.fillable', group).forEach((node) => node.setAttribute('fill', hex));
    group.classList.add('pop');
  }

  function buildPalette() {
    // El nombre va escrito debajo: sin el, un nino daltonico no puede jugar.
    fill(paletteRow, ...PALETTE.map((colour) => h('button', {
      class: 'swatch-btn',
      'aria-pressed': String(selectedColour === colour.id),
      'aria-label': colour.label,
      onClick: () => {
        selectedColour = colour.id;
        buildPalette();
      },
    }, [
      h('span', { class: 'swatch', style: `background:${colour.hex}` }),
      h('span', { class: 'swatch-btn__name' }, colour.label),
    ])), h('span', { class: 'palette__hint' }, 'Pick a colour, then tap the picture.'));
  }

  function buildWriter() {
    const input = h('input', {
      type: 'text',
      maxlength: '14',
      autocomplete: 'off',
      spellcheck: 'false',
      placeholder: 'type the word',
      'aria-label': 'Write the word on the sign',
    });
    const submit = () => {
      const value = input.value.trim();
      if (!value) {
        toast('wrong', 'Type the word first');
        input.focus();
        return;
      }
      answerWrite(value);
    };
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
    fill(writerRow, input, h('button', { class: 'btn btn--go', onClick: submit }, 'Check'));
    setTimeout(() => input.focus(), 60);
  }

  function answerColour(objectId) {
    const question = questions[index];
    if (!selectedColour) {
      toast('wrong', 'Pick a colour first');
      paletteRow.classList.add('shake');
      setTimeout(() => paletteRow.classList.remove('shake'), 320);
      return;
    }
    const outcome = checkColour(question, objectId, selectedColour);
    const ok = outcome === 'correct';
    answers.push({ question, ok, outcome });

    if (ok) {
      paint(objectId, question.hex);
      cue('correct');
      toast('correct', 'Yes!');
    } else {
      cue('wrong');
      sceneWrap.classList.add('shake');
      setTimeout(() => sceneWrap.classList.remove('shake'), 320);
      toast('wrong', outcome === 'wrong-object' ? 'That was another one' : 'Wrong colour');
      paint(question.objectId, question.hex);
      const group = qs(`[data-obj="${question.objectId}"]`, sceneWrap);
      group?.classList.add('is-target');
      setTimeout(() => group?.classList.remove('is-target'), 1400);
    }
    selectedColour = null;
    buildPalette();
    setTimeout(next, ok ? 850 : 1600);
  }

  function answerWrite(value) {
    const question = questions[index];
    const ok = checkWord(question, value);
    answers.push({ question, ok, outcome: ok ? 'correct' : 'wrong-spelling' });
    const target = qs('#sign-text', sceneWrap);
    if (target) target.textContent = ok ? value : question.word;
    cue(ok ? 'correct' : 'wrong');
    toast(ok ? 'correct' : 'wrong', ok ? 'Perfect spelling!' : `It was "${question.word}"`);
    setTimeout(next, ok ? 900 : 1700);
  }

  function next() {
    index += 1;
    if (index >= questions.length) return finish();
    render();
  }

  function render() {
    const question = questions[index];
    counter.textContent = `${index + 1} of ${questions.length}`;
    instructionText.textContent = question.say;
    instructionText.classList.toggle('masked', masked);
    const writing = question.kind === 'write';
    paletteRow.classList.toggle('hidden', writing);
    writerRow.classList.toggle('hidden', !writing);
    sceneWrap.classList.toggle('scene--locked', writing);
    if (writing) buildWriter();
    countPlay('q');
    speak(question.say);
    refreshPlays();
  }

  function finish() {
    stopVoice();
    cue('finish');
    const correct = answers.filter((a) => a.ok).length;
    if (ctx.onFinish) return ctx.onFinish({ score: correct, total: questions.length });
    const shields = shieldsFor(correct, questions.length);
    recordShields('colour', shields);
    state.touchStreak();
    const unlocked = unlockNext(ctx.topicId ?? 'animals', correct);

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, correct === questions.length ? 'All correct!' : `${correct} out of ${questions.length}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      stickerBlock(topic, unlocked, correct),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        a.question.shortSay,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'Play again'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    scene = randomScene(scene.id);
    questions = buildRound(scene);
    index = 0;
    selectedColour = null;
    answers.length = 0;
    build();
  }

  function onSceneClick(event) {
    if (questions[index]?.kind !== 'colour') return;
    const group = event.target.closest('.paintable');
    if (!group) return;
    answerColour(group.dataset.obj);
  }

  function onSceneKey(event) {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const group = event.target.closest?.('.paintable');
    if (!group) return;
    event.preventDefault();
    onSceneClick(event);
  }

  // Los <g> del SVG no son focusables por defecto.
  function makeReachable() {
    qsa('.paintable', sceneWrap).forEach((group) => {
      const object = scene.objects.find((o) => o.id === group.dataset.obj);
      group.setAttribute('tabindex', '0');
      group.setAttribute('role', 'button');
      group.setAttribute('aria-label', object ? object.phrase : 'object');
    });
  }

  function build() {
    sceneLabel.textContent = scene.title;
    fill(sceneWrap);
    sceneWrap.innerHTML = scene.svg;
    sceneWrap.removeEventListener('click', onSceneClick);
    sceneWrap.addEventListener('click', onSceneClick);
    sceneWrap.removeEventListener('keydown', onSceneKey);
    sceneWrap.addEventListener('keydown', onSceneKey);
    makeReachable();
    buildPalette();
    fill(stage, instruction, sceneWrap, paletteRow, writerRow);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
      sceneWrap.removeEventListener('click', onSceneClick);
      sceneWrap.removeEventListener('keydown', onSceneKey);
    },
  };
}
