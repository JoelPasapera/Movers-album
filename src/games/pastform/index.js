import { h } from '../../core/dom.js';
import { chooser } from '../../ui/components/miniGame.js';
import { buildRound, isCorrect } from './questions.js';

export const meta = { id: 'pastform', title: 'What did you do yesterday?' };

export const mount = (root, ctx = {}) => chooser(root, ctx, {
  id: 'pastform',
  title: 'What did you do yesterday?',
  hint: 'Yesterday, last week, last night: the verb goes in the past. Choose the right form.',
  tip: 'Most verbs add -ed in the past. The others (went, ate, saw) you just have to know: read stories and they stick.',
  build: buildRound,
  renderPrompt: (q) => h('p', { class: 'p6-prompt' }, [
    q.before, h('span', { class: 'gap-slot' }, '\u2026'), q.after,
  ]),
  options: (q) => q.options,
  isRight: isCorrect,
  sayAfter: (q) => q.say,
  explain: (q) => q.rule,
  again: 'More verbs',
});
