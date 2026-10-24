import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { renderPanel } from '../../data/scenes/pieces.js';
import { buildRound, scoreOrder, checkSentence } from './questions.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import * as state from '../../core/state.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';

// Entrenamiento: ordenar las cuatro vinetas y reconstruir cada frase. Era la
// antigua parte 2 de Speaking; la parte real (contar la historia hablando)
// vive en games/story.
export const meta = { id: 'storyorder', title: 'Story order' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let round = buildRound();
  let attempt = [];
  let orderScore = 0;
  let panelIndex = 1;
  let built = [];
  const sentenceResults = [];

  const counter = h('span', { class: 'counter' });
  const toastSlot = h('span');
  const prompt = h('p');
  const strip = h('div', { class: 'story-strip' });
  const workspace = h('div', { class: 'story-work hidden' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'Story order'),
    h('span', { class: 'scene-label' }, round.title),
    h('div', { class: 'spacer' }),
    counter,
    toastSlot,
  ]);

  function toast(kind, message) {
    fill(toastSlot, h('span', {
      class: `toast toast--${kind === 'correct' ? 'ok' : 'no'} pop`,
    }, message));
    setTimeout(() => fill(toastSlot), 1600);
  }

  const panelById = (id) => round.panels.find((p) => p.id === id);

  // --- fase 1: ordenar las vinetas -----------------------------------------

  function renderOrder() {
    counter.textContent = `${attempt.length} of 4`;
    fill(strip, ...round.shuffled.map((panel) => {
      const position = attempt.indexOf(panel.id);
      return h('button', {
        class: `story-panel${position >= 0 ? ' is-placed' : ''}`,
        onClick: () => {
          if (position >= 0) return;
          attempt.push(panel.id);
          renderOrder();
          if (attempt.length === 4) setTimeout(checkOrder, 400);
        },
      }, [
        h('span', { class: 'story-panel__num' }, position >= 0 ? String(position + 1) : '\u2013'),
        h('span', { class: 'story-panel__art', html: renderPanel(panel.art) }),
      ]);
    }));
  }

  function checkOrder() {
    orderScore = scoreOrder(round, attempt);
    const perfect = orderScore === 4;
    cue(perfect ? 'correct' : 'wrong');
    toast(perfect ? 'correct' : 'wrong', perfect ? 'Right order!' : `${orderScore} of 4 in the right place`);
    panelIndex = 1;
    setTimeout(renderStoryLine, perfect ? 900 : 1600);
  }

  // --- fase 2: construir las frases ----------------------------------------

  function renderStoryLine() {
    fill(strip, ...round.order.map((id, i) => {
      const panel = panelById(id);
      const done = i === 0 || i < panelIndex;
      return h('div', {
        class: `story-panel story-panel--fixed${i === panelIndex ? ' is-active' : ''}`,
      }, [
        h('span', { class: 'story-panel__num' }, String(i + 1)),
        h('span', { class: 'story-panel__art', html: renderPanel(panel.art) }),
        done ? h('span', { class: 'story-panel__line' }, panel.sentence) : null,
      ]);
    }));
    if (panelIndex === 1) speak(panelById(round.order[0]).sentence);
    renderBuilder();
  }

  function renderBuilder() {
    if (panelIndex > 3) return finish();
    const panel = panelById(round.order[panelIndex]);
    built = [];
    counter.textContent = `picture ${panelIndex + 1} of 4`;
    prompt.textContent = panelIndex === 1
      ? 'Picture 1 is done for you. Now build picture 2.'
      : `Now build picture ${panelIndex + 1}.`;

    const line = h('p', { class: 'story-line' });
    const tiles = h('div', { class: 'tiles' });
    const check = h('button', { class: 'btn btn--go', disabled: true }, 'Check');
    const undo = h('button', { class: 'btn' }, 'Undo');

    const usedIdx = new Set();
    fill(tiles, ...panel.words.map((word, i) => h('button', {
      class: 'tile',
      onClick: (event) => {
        if (usedIdx.has(i)) return;
        usedIdx.add(i);
        built.push(word);
        event.currentTarget.classList.add('is-used');
        fill(line, `${built.join(' ')}\u2026`);
        if (built.length === panel.target.length) check.removeAttribute('disabled');
      },
    }, word)));

    undo.addEventListener('click', () => {
      if (!built.length) return;
      built.pop();
      const last = [...usedIdx].pop();
      usedIdx.delete(last);
      Array.from(tiles.children)[last]?.classList.remove('is-used');
      fill(line, built.length ? `${built.join(' ')}\u2026` : '\u2026');
      check.setAttribute('disabled', 'true');
    });

    check.addEventListener('click', () => {
      const ok = checkSentence(panel, built);
      sentenceResults.push({ panel, ok });
      cue(ok ? 'correct' : 'wrong');
      toast(ok ? 'correct' : 'wrong', ok ? 'That\u2019s it!' : 'Listen to the right one');
      speak(panel.sentence);
      fill(workspace, h('div', { class: 'sayout' }, [
        ok ? null : h('p', { class: 'sayout__fix' }, 'The sentence was:'),
        h('p', { class: 'sayout__line' }, panel.sentence),
        h('div', { class: 'sayout__actions' }, [
          h('button', { class: 'btn', onClick: () => speak(panel.sentence) }, 'Hear it again'),
          h('button', {
            class: 'btn btn--go',
            onClick: () => { panelIndex += 1; renderStoryLine(); },
          }, 'I said it \u2192'),
        ]),
      ]));
    });

    fill(workspace,
      h('p', { class: 'tiles-label' }, 'Tap the words in the right order'),
      line,
      tiles,
      h('div', { class: 'story-actions' }, [check, undo]));
    workspace.classList.remove('hidden');
    fill(line, '\u2026');
  }

  function finish() {
    stopVoice();
    cue('finish');
    const sentenceScore = sentenceResults.filter((r) => r.ok).length;
    const total = 4 + 3;
    const score = orderScore + sentenceScore;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('storyorder', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 2));

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total}`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        orderScore === 4
          ? 'You put the pictures in the right order. That is half the job in this part of the test.'
          : 'Look at all four pictures before you start. The order tells you the story.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, round.order.map((id, i) => {
        const panel = panelById(id);
        const result = sentenceResults.find((r) => r.panel.id === id);
        return h('div', { class: result && !result.ok ? 'bad' : '' },
          `${i + 1}. ${panel.sentence}`);
      })),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New story'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    round = buildRound();
    attempt = [];
    orderScore = 0;
    panelIndex = 1;
    sentenceResults.length = 0;
    build();
  }

  function build() {
    prompt.textContent = 'These four pictures tell a story, but they are mixed up. Tap them in the right order.';
    workspace.classList.add('hidden');
    fill(stage,
      h('div', { class: 'instruction instruction--clue' }, prompt),
      strip,
      workspace);
    renderOrder();
    speak('These pictures tell a story. Put them in the right order.');
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return {
    destroy() {
      stopVoice();
    },
  };
}
