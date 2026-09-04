import { h } from '../../core/dom.js';
import { chooser } from '../../ui/components/miniGame.js';
import { buildRound, isCorrect } from './questions.js';

export const meta = { id: 'opposites', title: 'Opposites' };

export const mount = (root, ctx = {}) => chooser(root, ctx, {
  id: 'opposites',
  title: 'Opposites',
  hint: 'Two gaps, one pair of opposites. Which pair fits?',
  tip: 'Opposites help you describe pictures: here it is up, here it is down.',
  build: buildRound,
  renderPrompt: (q) => h('p', { class: 'p6-prompt' }, [
    q.frame[0], h('span', { class: 'gap-slot' }, '\u2026'),
    q.frame[1], h('span', { class: 'gap-slot' }, '\u2026'), q.frame[2],
  ]),
  options: (q) => q.options,
  isRight: isCorrect,
  sayAfter: (q) => q.say,
  again: 'More pairs',
});
