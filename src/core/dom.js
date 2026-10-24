export function h(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
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
  const list = Array.isArray(children) ? children : [children];
  for (const child of list) {
    if (child === null || child === undefined || child === false) continue;
    el.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return el;
}

export function clear(el) {
  while (el.firstChild) el.removeChild(el.firstChild);
  return el;
}

// Acepta nodos sueltos o listas de nodos: fill(box, [a, b]) y fill(box, a, b)
// son lo mismo. Sin el flat(), append() convertia la lista en el texto
// "[object HTMLParagraphElement],..." y doce pantallas (el titulo de la parte
// 3 de Reading, las respuestas modelo de Speaking...) mostraban eso en vez de
// sus botones.
export function mount(parent, ...nodes) {
  clear(parent).append(...nodes.flat(Infinity).filter((n) => n !== null && n !== undefined && n !== false));
  return parent;
}

export const qs = (sel, root = document) => root.querySelector(sel);
export const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));
