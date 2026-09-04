import { h } from '../../core/dom.js';
import { chooser } from '../../ui/components/miniGame.js';
import { buildRound, isCorrect } from './questions.js';

export const meta = { id: 'numbers', title: 'Which number?' };

export const mount = (root, ctx = {}) => chooser(root, ctx, {
  id: 'numbers',
  title: 'Which number?',
  hint: 'Numbers up to 100 and first to twentieth. Match the number and the word.',
  tip: 'In the Listening test you write numbers with digits. But you have to know the words to hear them.',
  build: buildRound,
  renderPrompt: (q) => h('p', { class: 'p6-prompt number-prompt' }, q.prompt),
  options: (q) => q.options,
  isRight: isCorrect,
  sayAfter: (q) => q.say,
  again: 'More numbers',
});
