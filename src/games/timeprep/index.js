import { h } from '../../core/dom.js';
import { chooser } from '../../ui/components/miniGame.js';
import { buildRound, isCorrect } from './questions.js';

export const meta = { id: 'timeprep', title: 'A busy day' };

export const mount = (root, ctx = {}) => chooser(root, ctx, {
  id: 'timeprep',
  title: 'A busy day',
  hint: 'At, in, on, before or after? Choose the word that fits the time.',
  tip: 'At seven o\'clock, at night, at the weekend. In the morning. On Monday. Before and after tell you the order.',
  build: buildRound,
  renderPrompt: (q) => h('p', { class: 'p6-prompt' }, [
    q.before, h('span', { class: 'gap-slot' }, '\u2026'), q.after,
  ]),
  options: (q) => q.options,
  isRight: isCorrect,
  sayAfter: (q) => q.say,
  explain: (q) => q.rule,
  again: 'More sentences',
});
