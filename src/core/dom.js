// @ts-check
// Ayudantes minimos para construir el DOM sin plantillas ni frameworks.

/**
 * Lo que se puede poner dentro de un elemento: nodos, texto, numeros, o nada
 * (null, undefined, true y false se ignoran). Las listas pueden ir anidadas.
 * @typedef {Node | string | number | boolean | null | undefined | ReadonlyArray<any>} Children
 */

/**
 * Atributos de `h()`. `class`, `html`, `text` y `dataset` son especiales; las
 * claves que empiezan por `on` con una funcion se convierten en listeners; el
 * resto va a setAttribute. null, undefined y false no se ponen.
 * @typedef {Record<string, any>} Attrs
 */

/**
 * Aplana una lista de hijos (con listas anidadas) y quita los vacios.
 * @param {Children} children
 * @returns {(Node | string)[]}
 */
function flatChildren(children) {
  const list = Array.isArray(children) ? children.flat(Infinity) : [children];
  /** @type {(Node | string)[]} */
  const out = [];
  for (const child of list) {
    if (child === null || child === undefined || child === false || child === true) continue;
    out.push(child instanceof Node ? child : String(child));
  }
  return out;
}

/**
 * Crea un elemento. El tipo que devuelve sigue a la etiqueta: h('input')
 * es un HTMLInputElement, h('button') un HTMLButtonElement.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Attrs} [attrs]
 * @param {Children} [children]
 * @returns {HTMLElementTagNameMap[K]}
 */
export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs ?? {})) {
    if (value === null || value === undefined || value === false) continue;
    if (key === 'class') el.className = value;
    else if (key === 'html') el.innerHTML = value;
    else if (key === 'text') el.textContent = value;
    else if (key.startsWith('on') && typeof value === 'function') {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (key === 'dataset') {
      Object.assign(el.dataset, value);
    } else {
      el.setAttribute(key, value);
    }
  }
  // Las listas anidadas se aplanan, igual que en mount(): sin eso, una lista
  // dentro de otra acababa en pantalla como "[object HTMLDivElement],...".
  for (const child of flatChildren(children)) {
    el.append(child instanceof Node ? child : document.createTextNode(child));
  }
  return el;
}

/**
 * Vacia un elemento.
 * @template {Node} T
 * @param {T} el
 * @returns {T}
 */
export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

/**
 * Sustituye el contenido de `parent`. Acepta nodos sueltos o listas de nodos:
 * fill(box, [a, b]) y fill(box, a, b) son lo mismo. Sin el aplanado, append()
 * convertia la lista en el texto "[object HTMLParagraphElement],..." y doce
 * pantallas (el titulo de la parte 3 de Reading, las respuestas modelo de
 * Speaking...) mostraban eso en vez de sus botones.
 * @template {Element} T
 * @param {T} parent
 * @param {...Children} nodes
 * @returns {T}
 */
export function mount(parent, ...nodes) {
  const active = document.activeElement;
  const hadFocus = Boolean(active) && active !== parent && parent.contains(active);
  clear(parent).append(...flatChildren(nodes));
  if (hadFocus) keepFocusIn(parent, /** @type {HTMLElement} */ (active));
  return parent;
}

/**
 * Si al repintar se quito el elemento que tenia el foco (el boton que se
 * acaba de pulsar con el teclado), el foco no vuelve al principio de la
 * pagina: si el mismo elemento sigue en el repintado, vuelve a el; si no, se
 * queda en la misma zona.
 * @param {Element} parent
 * @param {HTMLElement} previous el que tenia el foco antes de repintar
 */
function keepFocusIn(parent, previous) {
  if (!parent.isConnected || parent.contains(document.activeElement)) return;
  if (previous.isConnected && parent.contains(previous)) {
    previous.focus({ preventScroll: true });
    if (document.activeElement === previous) return;
  }
  const el = /** @type {HTMLElement} */ (parent);
  if (!el.hasAttribute('tabindex')) {
    el.setAttribute('tabindex', '-1');
    // Solo hacia falta para darle el foco ahora: cuando el foco se va, se
    // quita (si no, la caja se quedaba enfocable para siempre).
    el.addEventListener('blur', () => el.removeAttribute('tabindex'), { once: true });
  }
  el.focus({ preventScroll: true });
}

/**
 * @template {Element} [T=HTMLElement]
 * @param {string} sel
 * @param {ParentNode} [root]
 * @returns {T | null}
 */
export const qs = (sel, root = document) => /** @type {T | null} */ (root.querySelector(sel));

/**
 * @template {Element} [T=HTMLElement]
 * @param {string} sel
 * @param {ParentNode} [root]
 * @returns {T[]}
 */
export const qsa = (sel, root = document) => /** @type {T[]} */ (Array.from(root.querySelectorAll(sel)));
