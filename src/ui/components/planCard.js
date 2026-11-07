// @ts-check
// La tarjeta "Today's plan" de la portada del album: tres actividades para
// hoy, que se tachan solas al terminarlas (engine/plan.js decide cuales).

import { h } from '../../core/dom.js';
import { todaysPlan } from '../../engine/plan.js';
import * as router from '../../core/router.js';

export function planCard() {
  const items = todaysPlan();
  const done = items.filter((i) => i.done).length;
  const all = done === items.length;
  return h('section', { class: `plan${all ? ' plan--done' : ''}`, 'aria-labelledby': 'plan-title' }, [
    h('div', { class: 'plan__head' }, [
      h('h3', { id: 'plan-title' }, 'Today’s plan'),
      h('span', { class: 'plan__count' }, all ? 'All done!' : `${done} of ${items.length} done`),
    ]),
    h('div', { class: 'plan__steps' }, items.map((item, i) => h('button', {
      class: `plan-step${item.done ? ' is-done' : ''}`,
      type: 'button',
      'aria-label': `${i + 1}. ${item.title}. ${item.reason}.${item.done ? ' Done.' : ''}`,
      onClick: () => router.go(item.route),
    }, [
      h('span', { class: 'plan-step__icon', 'aria-hidden': 'true' }, item.done ? '✅' : item.icon),
      h('span', { class: 'plan-step__text' }, [h('b', {}, item.title), h('small', {}, item.reason)]),
    ]))),
    all ? h('p', { class: 'plan__done' }, 'Plan done for today. Come back tomorrow for a new one!') : null,
  ]);
}
