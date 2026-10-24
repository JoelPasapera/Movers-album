import { h } from '../../core/dom.js';
import { chooser } from '../../ui/components/miniGame.js';
import { buildRound, isCorrect } from './questions.js';

export const meta = { id: 'wordpairs', title: 'Word pairs' };

export const mount = (root, ctx = {}) => chooser(root, ctx, {
  id: 'wordpairs',
  title: 'Word pairs',
  hint: 'Two words make a new word. Which word goes with the first one?',
  tip: 'Two small words make a new one: swimming and pool make swimming pool. Look for them in the album.',
  build: buildRound,
  renderPrompt: (q) => h('p', { class: 'p6-prompt' }, [
    q.icon ? `${q.icon} ` : null,
    h('b', {}, q.compound.first), ' + ', h('span', { class: 'gap-slot' }, '\u2026'),
  ]),
  options: (q) => q.options,
  isRight: isCorrect,
  sayAfter: (q) => q.say,
  again: 'More pairs',
});
