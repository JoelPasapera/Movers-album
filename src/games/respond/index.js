import { h, mount as fill } from '../../core/dom.js';
import { speak, cue, stop as stopVoice } from '../../core/audio.js';
import { getTopic } from '../../data/topics.js';
import { randomDialogue } from '../../data/dialogues.js';
import { shieldsFor, verdict } from '../../engine/scoring.js';
import { unlockNext, recordShields } from '../../engine/progress.js';
import { shieldRow, stickerBlock } from '../../ui/components/rewards.js';
import * as state from '../../core/state.js';

export const meta = { id: 'respond', title: 'What do you say?' };

export function mount(root, ctx = {}) {
  const topic = getTopic(ctx.topicId);
  let dialogue = randomDialogue();
  let index = 0;
  let locked = false;
  let score = 0;
  const answers = [];

  const counter = h('span', { class: 'counter' });
  const marksChip = h('span', { class: 'marks-chip' });
  const thread = h('div', { class: 'chat' });
  const options = h('div', { class: 'chat-options' });
  const feedback = h('p', { class: 'spell-feedback' });
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, '\u2190 Album'),
    h('h2', {}, 'What do you say?'),
    h('span', { class: 'scene-label' }, dialogue.title),
    h('div', { class: 'spacer' }),
    marksChip,
    counter,
  ]);

  function addBubble(who, text, tone = '') {
    thread.append(h('div', { class: `chat-row chat-row--${who}` }, [
      h('span', { class: 'chat-who' }, who === 'a' ? dialogue.speakers[0] : dialogue.speakers[1]),
      h('span', { class: `chat-bubble ${tone}` }, text),
    ]));
    thread.scrollTop = thread.scrollHeight;
  }

  function choose(i) {
    if (locked) return;
    locked = true;
    const turn = dialogue.turns[index];
    const ok = i === turn.answer;
    if (ok) score += 1;
    answers.push({ turn, ok, chosen: i });
    marksChip.textContent = `${score} / ${dialogue.turns.length} marks`;

    addBubble('b', turn.options[i], ok ? 'is-ok' : 'is-no');
    if (!ok) addBubble('b', turn.options[turn.answer], 'is-fix');

    feedback.textContent = ok ? `Yes. ${turn.why}` : `Not this one. ${turn.why}`;
    feedback.className = `spell-feedback spell-feedback--${ok ? 'ok' : 'no'}`;
    cue(ok ? 'correct' : 'wrong');
    speak(turn.options[turn.answer]);
    setTimeout(next, ok ? 1600 : 3200);
  }

  function next() {
    index += 1;
    if (index >= dialogue.turns.length) return finish();
    render();
  }

  function render() {
    locked = false;
    const turn = dialogue.turns[index];
    counter.textContent = `${index + 1} of ${dialogue.turns.length}`;
    marksChip.textContent = `${score} / ${dialogue.turns.length} marks`;
    feedback.textContent = '';
    feedback.className = 'spell-feedback';
    addBubble('a', turn.line);
    speak(turn.line);
    fill(options, ...turn.options.map((text, i) => h('button', {
      class: 'chat-option',
      onClick: () => choose(i),
    }, [h('span', { class: 'chat-option__letter' }, 'ABC'[i]), text])));
  }

  function finish() {
    stopVoice();
    cue('finish');
    const total = dialogue.turns.length;
    if (ctx.onFinish) return ctx.onFinish({ score: score, total: total });
    const shields = shieldsFor(score, total);
    recordShields('respond', shields);
    state.touchStreak();
    const unlocked = unlockNext(topic.id, Math.round(score / 2));

    fill(stage, h('div', { class: 'result' }, [
      h('h2', {}, `${score} out of ${total} marks`),
      shieldRow(shields),
      h('p', {}, verdict(shields)),
      h('p', { class: 'spell-tip' },
        'Read all three before you choose. And remember: not every line is a question. '
        + 'Sometimes the other person is just telling you something.'),
      stickerBlock(topic, unlocked, score),
      h('div', { class: 'review' }, answers.map((a) => h('div', {
        class: a.ok ? '' : 'bad',
      }, [
        h('b', {}, a.ok ? '\u2713 ' : '\u2717 '),
        `${a.turn.line} \u2014 ${a.turn.options[a.turn.answer]}`,
      ]))),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: restart }, 'New chat'),
        h('button', { class: 'btn', onClick: () => ctx.onExit?.() }, 'Back to album'),
      ]),
    ]));
  }

  function restart() {
    dialogue = randomDialogue(dialogue.id);
    index = 0;
    score = 0;
    answers.length = 0;
    build();
  }

  function build() {
    fill(thread);
    fill(stage,
      h('p', { class: 'bank-hint' },
        'Read what the first person says, then choose the best answer. Six marks.'),
      thread,
      options,
      feedback);
    render();
  }

  fill(root, h('div', { class: 'card' }, [head, stage]));
  build();

  return { destroy() { stopVoice(); } };
}
