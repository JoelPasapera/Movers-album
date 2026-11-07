// @ts-check
// La lista de paginas del album (o de tableros): un boton por pagina, con la
// actual marcada. En un ordenador es una columna; en un movil, una fila que
// se desliza con el dedo, y al pintarse la pagina actual queda en el centro
// para que el nino vea donde esta.

import { h } from '../../core/dom.js';
import * as router from '../../core/router.js';

/**
 * @typedef {{ id: string, label: string, colour: string, count: string, route: string }} TabItem
 */

/**
 * @param {{ label: string, items: TabItem[], activeId: string }} options
 * @returns {HTMLElement}
 */
export function tabNav({ label, items, activeId }) {
  return h('nav', { class: 'tabs', 'aria-label': label }, items.map((item) => h('button', {
    class: 'tab',
    'aria-current': item.id === activeId ? 'page' : null,
    onClick: () => router.go(item.route),
  }, [
    h('span', { class: 'dot', style: `background:var(--${item.colour})` }),
    item.label,
    h('small', {}, item.count),
  ])));
}

/**
 * Desliza la fila para que la pagina actual quede a la vista. Solo hace algo
 * cuando la lista no cabe (en un movil). Se llama con la lista ya en pantalla.
 * @param {HTMLElement} nav
 */
export function centreCurrent(nav) {
  const current = nav.querySelector('[aria-current="page"]');
  if (!current || !(nav.scrollWidth > nav.clientWidth)) return;
  const box = nav.getBoundingClientRect();
  const tab = current.getBoundingClientRect();
  nav.scrollLeft += (tab.left + tab.width / 2) - (box.left + box.width / 2);
}
