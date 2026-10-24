import { h } from '../../core/dom.js';
import { speller } from '../../ui/components/writer.js';
import { buildRound } from './questions.js';

export const meta = { id: 'whereare', title: 'Where are they?' };

export const mount = (root, ctx = {}) => speller(root, ctx, {
  id: 'whereare',
  title: 'Where are they?',
  hint: 'Listen to what they are doing. Then write where they are. Eight places, six people: two places are not used.',
  tip: 'Reading a book? The library. Waiting for a bus? The bus stop. What people do tells you where they are.',
  build: buildRound,
  renderPrompt: (q) => h('p', {}, [
    h('span', { class: 'gap-quote' }, `\u201c${q.clue}\u201d`), ' ',
    `${q.pronoun} is at the `, h('span', { class: 'gap-slot' }, '\u2026'), '.',
  ]),
  sayPrompt: (q) => q.clue,
  answerOf: (q) => q.answer,
  again: 'More places',
});
