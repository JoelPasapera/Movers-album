import { h } from '../../core/dom.js';
import { speller } from '../../ui/components/writer.js';
import { buildRound } from './questions.js';

export const meta = { id: 'matter', title: 'What\u2019s the matter?' };

export const mount = (root, ctx = {}) => speller(root, ctx, {
  id: 'matter',
  title: 'What\u2019s the matter?',
  hint: 'The nurse asks what is wrong. Look at the picture and write the part of the body that hurts.',
  tip: 'What\u2019s the matter? My leg hurts. I\u2019ve got a headache. Say it in a whole sentence and the nurse can help.',
  build: buildRound,
  renderPrompt: (q) => h('p', {}, [
    h('span', { class: 'gap-quote' }, '\u201cWhat\u2019s the matter?\u201d'), ' ',
    h('span', { class: 'matter-face' }, q.icon), ' My ', h('span', { class: 'gap-slot' }, '\u2026'), ' hurts.',
  ]),
  sayPrompt: () => 'What\u2019s the matter?',
  answerOf: (q) => q.answer,
  again: 'More',
});
