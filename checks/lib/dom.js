// @ts-check
// Un navegador de mentira, sin dependencias, para montar las pantallas de la
// app dentro de node. No pinta nada: construye el arbol, guarda atributos,
// estilos y clases, reparte eventos con burbujeo, entiende los selectores que
// usa la app y sabe leer el SVG de las escenas. Es lo que permite a la
// comprobacion 17 jugar cada juego entero sin abrir Chrome.
//
// Los errores que lanzan los manejadores de eventos no se propagan (como en un
// navegador de verdad): se guardan en `errors` para que la comprobacion los
// cuente.

/** @typedef {{ where: string, error: unknown }} DomError */

const VOID = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr']);
const RAW_TEXT = new Set(['script', 'style']);
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

const decode = (text) => text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (all, code) => {
  if (code[0] === '#') {
    const n = code[1].toLowerCase() === 'x' ? parseInt(code.slice(2), 16) : parseInt(code.slice(1), 10);
    return Number.isFinite(n) ? String.fromCodePoint(n) : all;
  }
  return ENTITIES[code.toLowerCase()] ?? all;
});

const escapeText = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const escapeAttr = (t) => escapeText(t).replace(/"/g, '&quot;');

const kebab = (prop) => prop.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const camel = (name) => name.replace(/-([a-z])/g, (all, c) => c.toUpperCase());

// ------------------------------------------------------------- selectores

/**
 * @typedef {{ name: string, op: string, value: string }} AttrTest
 * @typedef {{ tag: string, id: string, classes: string[], attrs: AttrTest[], nots: Compound[][], pseudo: string[] }} Compound
 * @typedef {{ compound: Compound, combinator: string }} Step
 */

const selectorCache = new Map();

/** @param {string} source @returns {Step[][]} */
function parseSelector(source) {
  if (selectorCache.has(source)) return selectorCache.get(source);
  let i = 0;
  const s = source.trim();
  /** @type {Step[][]} */
  const groups = [];
  /** @type {Step[]} */
  let current = [];
  let combinator = ' ';

  const ident = () => {
    const m = /^[a-zA-Z0-9_\- -￿\\]+/.exec(s.slice(i));
    if (!m) throw new Error(`selector no valido: ${source}`);
    i += m[0].length;
    return m[0].replace(/\\/g, '');
  };

  /** @returns {Compound} */
  const compound = () => {
    /** @type {Compound} */
    const c = { tag: '', id: '', classes: [], attrs: [], nots: [], pseudo: [] };
    if (s[i] === '*') i += 1;
    else if (/[a-zA-Z]/.test(s[i] ?? '')) c.tag = ident().toLowerCase();
    while (i < s.length) {
      const ch = s[i];
      if (ch === '#') { i += 1; c.id = ident(); } else if (ch === '.') { i += 1; c.classes.push(ident()); } else if (ch === '[') {
        const end = s.indexOf(']', i);
        const body = s.slice(i + 1, end);
        i = end + 1;
        const m = /^\s*([^\s~|^$*!=]+)\s*(?:([~|^$*]?=)\s*(?:"([^"]*)"|'([^']*)'|([^\s\]]*)))?\s*$/.exec(body);
        if (!m) throw new Error(`atributo no valido en el selector: ${source}`);
        c.attrs.push({ name: m[1].toLowerCase(), op: m[2] ?? '', value: m[3] ?? m[4] ?? m[5] ?? '' });
      } else if (ch === ':') {
        i += 1;
        const name = ident();
        if (name === 'not') {
          const close = s.indexOf(')', i);
          const inner = s.slice(i + 1, close);
          i = close + 1;
          c.nots.push(parseSelector(inner).map((group) => group[group.length - 1].compound));
        } else c.pseudo.push(name);
      } else break;
    }
    return c;
  };

  while (i < s.length) {
    const ch = s[i];
    if (ch === ',') {
      groups.push(current);
      current = [];
      combinator = ' ';
      i += 1;
      while (s[i] === ' ') i += 1;
    } else if (ch === ' ' || ch === '>' || ch === '+' || ch === '~') {
      let comb = ' ';
      while (i < s.length && /[\s>+~]/.test(s[i])) {
        if (s[i] !== ' ') comb = s[i];
        i += 1;
      }
      combinator = comb;
    } else {
      current.push({ compound: compound(), combinator: current.length ? combinator : '' });
      combinator = ' ';
    }
  }
  groups.push(current);
  selectorCache.set(source, groups);
  return groups;
}

/** @param {FakeElement} el @param {Compound} c */
function matchCompound(el, c) {
  if (c.tag && el.localName !== c.tag) return false;
  if (c.id && el.getAttribute('id') !== c.id) return false;
  if (c.classes.length) {
    const list = el.classList.toArray();
    for (const cls of c.classes) if (!list.includes(cls)) return false;
  }
  for (const a of c.attrs) {
    const v = el.getAttribute(a.name);
    if (v === null) return false;
    if (a.op === '=' && v !== a.value) return false;
    if (a.op === '^=' && !v.startsWith(a.value)) return false;
    if (a.op === '$=' && !v.endsWith(a.value)) return false;
    if (a.op === '*=' && !v.includes(a.value)) return false;
    if (a.op === '~=' && !v.split(/\s+/).includes(a.value)) return false;
    if (a.op === '|=' && v !== a.value && !v.startsWith(`${a.value}-`)) return false;
  }
  for (const group of c.nots) if (group.some((inner) => matchCompound(el, inner))) return false;
  for (const p of c.pseudo) {
    if (p === 'disabled' && !el.hasAttribute('disabled')) return false;
    if (p === 'checked' && !el.checked) return false;
    if (p === 'first-child' && el.parentNode?.children[0] !== el) return false;
    if (p === 'last-child') {
      const kids = el.parentNode?.children ?? [];
      if (kids[kids.length - 1] !== el) return false;
    }
  }
  return true;
}

/** @param {FakeElement} el @param {Step[]} steps @param {number} k */
function matchSteps(el, steps, k) {
  if (!matchCompound(el, steps[k].compound)) return false;
  if (k === 0) return true;
  const comb = steps[k].combinator;
  if (comb === '>') {
    const parent = el.parentNode;
    return parent instanceof FakeElement && matchSteps(parent, steps, k - 1);
  }
  if (comb === '+' || comb === '~') {
    let prev = el.previousElementSibling;
    while (prev) {
      if (matchSteps(prev, steps, k - 1)) return true;
      if (comb === '+') return false;
      prev = prev.previousElementSibling;
    }
    return false;
  }
  let up = el.parentNode;
  while (up instanceof FakeElement) {
    if (matchSteps(up, steps, k - 1)) return true;
    up = up.parentNode;
  }
  return false;
}

/** @param {FakeElement} el @param {string} selector */
const matches = (el, selector) => parseSelector(selector).some((steps) => steps.length && matchSteps(el, steps, steps.length - 1));

// ------------------------------------------------------------- eventos

export class FakeEvent {
  /** @param {string} type @param {Record<string, any>} [init] */
  constructor(type, init = {}) {
    this.type = type;
    this.bubbles = Boolean(init.bubbles);
    this.cancelable = init.cancelable !== false;
    this.defaultPrevented = false;
    /** @type {any} */ this.target = null;
    /** @type {any} */ this.currentTarget = null;
    this.key = init.key ?? '';
    this.code = init.code ?? '';
    this.shiftKey = Boolean(init.shiftKey);
    this.detail = init.detail ?? null;
    this.isTrusted = true;
    this.timeStamp = Date.now();
    this.stopped = false;
    this.stoppedNow = false;
  }

  preventDefault() { if (this.cancelable) this.defaultPrevented = true; }
  stopPropagation() { this.stopped = true; }
  stopImmediatePropagation() { this.stopped = true; this.stoppedNow = true; }
}

export class Target {
  constructor() {
    /** @type {Map<string, { fn: Function, once: boolean }[]>} */
    this.listeners = new Map();
    /** @type {DomError[] | null} */
    this.errorSink = null;
  }

  /** @param {string} type @param {any} fn @param {any} [options] */
  addEventListener(type, fn, options) {
    if (!fn) return;
    const list = this.listeners.get(type) ?? [];
    if (list.some((l) => l.fn === fn)) return;
    list.push({ fn, once: Boolean(options && typeof options === 'object' && options.once) });
    this.listeners.set(type, list);
  }

  /** @param {string} type @param {any} fn */
  removeEventListener(type, fn) {
    const list = this.listeners.get(type);
    if (list) this.listeners.set(type, list.filter((l) => l.fn !== fn));
  }

  /** @param {FakeEvent} event @param {DomError[]} sink */
  fire(event, sink) {
    const list = [...(this.listeners.get(event.type) ?? [])];
    event.currentTarget = this;
    for (const l of list) {
      if (l.once) this.removeEventListener(event.type, l.fn);
      try {
        if (typeof l.fn === 'function') l.fn.call(this, event);
        else l.fn.handleEvent(event);
      } catch (error) {
        sink.push({ where: `evento "${event.type}"`, error });
      }
      if (event.stoppedNow) break;
    }
    const prop = /** @type {any} */ (this)[`on${event.type}`];
    if (typeof prop === 'function') {
      try { prop.call(this, event); } catch (error) { sink.push({ where: `on${event.type}`, error }); }
    }
  }
}

// ------------------------------------------------------------- nodos

export class FakeNode extends Target {
  constructor() {
    super();
    /** @type {FakeNode[]} */
    this.childNodes = [];
    /** @type {any} */
    this.parentNode = null;
    /** @type {any} */
    this.ownerDocument = null;
  }

  get firstChild() { return this.childNodes[0] ?? null; }
  get lastChild() { return this.childNodes[this.childNodes.length - 1] ?? null; }
  get parentElement() { return this.parentNode instanceof FakeElement ? this.parentNode : null; }
  get nextSibling() {
    const list = this.parentNode?.childNodes ?? [];
    return list[list.indexOf(this) + 1] ?? null;
  }
  get previousSibling() {
    const list = this.parentNode?.childNodes ?? [];
    const i = list.indexOf(this);
    return i > 0 ? list[i - 1] : null;
  }
  get isConnected() {
    /** @type {any} */
    let n = this;
    while (n) {
      if (n instanceof FakeDocument) return true;
      n = n.parentNode;
    }
    return false;
  }
  get textContent() { return this.childNodes.map((n) => n.textContent).join(''); }
  set textContent(value) {
    for (const n of this.childNodes) { this.forgetFocus(n); n.parentNode = null; }
    this.childNodes = [];
    if (value !== null && value !== undefined && value !== '') this.appendChild(this.doc().createTextNode(String(value)));
  }

  /** @returns {FakeDocument} */
  doc() { return this.ownerDocument ?? /** @type {any} */ (this); }

  /**
   * Como en un navegador: si sale de la pagina el elemento con el foco (o algo
   * que lo contiene), el foco pasa al body y ya no vuelve, aunque el elemento
   * se vuelva a poner en la pagina.
   * @param {any} node
   */
  forgetFocus(node) {
    const doc = this.doc();
    if (!(doc instanceof FakeDocument)) return;
    for (let n = doc.focused; n; n = n.parentNode) {
      if (n === node) {
        doc.focused = doc.body;
        return;
      }
    }
  }

  /** @param {any} node */
  normalizeChild(node) {
    if (node instanceof FakeNode) return node;
    return this.doc().createTextNode(String(node));
  }

  /** @param {any} node */
  appendChild(node) {
    if (node instanceof FakeFragment) {
      for (const child of [...node.childNodes]) this.appendChild(child);
      return node;
    }
    if (node.parentNode) node.parentNode.removeChild(node);
    node.parentNode = this;
    this.childNodes.push(node);
    return node;
  }

  /** @param {any} node @param {any} ref */
  insertBefore(node, ref) {
    if (!ref) return this.appendChild(node);
    if (node instanceof FakeFragment) {
      for (const child of [...node.childNodes]) this.insertBefore(child, ref);
      return node;
    }
    if (node.parentNode) node.parentNode.removeChild(node);
    const i = this.childNodes.indexOf(ref);
    if (i < 0) throw new Error('insertBefore: la referencia no es hija de este nodo');
    node.parentNode = this;
    this.childNodes.splice(i, 0, node);
    return node;
  }

  /** @param {any} node */
  removeChild(node) {
    const i = this.childNodes.indexOf(node);
    if (i < 0) throw new Error('removeChild: el nodo no es hijo de este');
    this.childNodes.splice(i, 1);
    this.forgetFocus(node);
    node.parentNode = null;
    return node;
  }

  /** @param {any} next @param {any} old */
  replaceChild(next, old) {
    this.insertBefore(next, old);
    return this.removeChild(old);
  }

  /** @param {...any} nodes */
  append(...nodes) { for (const n of nodes) this.appendChild(this.normalizeChild(n)); }

  /** @param {...any} nodes */
  prepend(...nodes) {
    const first = this.firstChild;
    for (const n of nodes) this.insertBefore(this.normalizeChild(n), first);
  }

  /** @param {...any} nodes */
  replaceChildren(...nodes) {
    for (const n of this.childNodes) { this.forgetFocus(n); n.parentNode = null; }
    this.childNodes = [];
    this.append(...nodes);
  }

  remove() { if (this.parentNode) this.parentNode.removeChild(this); }

  /** @param {...any} nodes */
  replaceWith(...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    for (const n of nodes) parent.insertBefore(parent.normalizeChild(n), this);
    parent.removeChild(this);
  }

  /** @param {...any} nodes */
  before(...nodes) {
    const parent = this.parentNode;
    if (parent) for (const n of nodes) parent.insertBefore(parent.normalizeChild(n), this);
  }

  /** @param {...any} nodes */
  after(...nodes) {
    const parent = this.parentNode;
    if (!parent) return;
    const ref = this.nextSibling;
    for (const n of nodes) parent.insertBefore(parent.normalizeChild(n), ref);
  }

  /** @param {any} node */
  contains(node) {
    let n = node;
    while (n) {
      if (n === this) return true;
      n = n.parentNode;
    }
    return false;
  }

  hasChildNodes() { return this.childNodes.length > 0; }

  /** @param {FakeEvent} event */
  dispatchEvent(event) {
    const doc = this.doc();
    const sink = doc.errors;
    event.target = this;
    /** @type {any[]} */
    const path = [];
    /** @type {any} */
    let n = this;
    while (n) { path.push(n); n = n.parentNode; }
    if (path[path.length - 1] instanceof FakeDocument && doc.defaultView) path.push(doc.defaultView);
    for (const node of path) {
      if (node !== this && !event.bubbles) break;
      node.fire(event, sink);
      if (event.stopped) break;
    }
    event.currentTarget = null;
    return !event.defaultPrevented;
  }

  /** @param {(el: FakeElement) => void} visit */
  walk(visit) {
    for (const child of this.childNodes) {
      if (child instanceof FakeElement) {
        visit(child);
        child.walk(visit);
      }
    }
  }

  /** @param {string} selector @returns {any} */
  querySelector(selector) {
    /** @type {any} */
    let found = null;
    const groups = parseSelector(selector);
    const visit = (/** @type {FakeNode} */ node) => {
      for (const child of node.childNodes) {
        if (found) return;
        if (!(child instanceof FakeElement)) continue;
        if (groups.some((steps) => steps.length && matchSteps(child, steps, steps.length - 1))) { found = child; return; }
        visit(child);
      }
    };
    visit(this);
    return found;
  }

  /** @param {string} selector @returns {any[]} */
  querySelectorAll(selector) {
    /** @type {FakeElement[]} */
    const out = [];
    const groups = parseSelector(selector);
    this.walk((el) => {
      if (groups.some((steps) => steps.length && matchSteps(el, steps, steps.length - 1))) out.push(el);
    });
    return out;
  }

  /** @param {boolean} [deep] @returns {any} */
  cloneNode(deep = false) {
    throw new Error(`cloneNode no implementado para ${this.constructor.name} (${deep})`);
  }
}

export class FakeText extends FakeNode {
  /** @param {string} data */
  constructor(data) {
    super();
    this.data = String(data);
    this.nodeType = 3;
    this.nodeName = '#text';
  }
  get textContent() { return this.data; }
  set textContent(value) { this.data = String(value); }
  get nodeValue() { return this.data; }
  set nodeValue(value) { this.data = String(value); }
  cloneNode() { return this.doc().createTextNode(this.data); }
}

export class FakeComment extends FakeNode {
  /** @param {string} data */
  constructor(data) {
    super();
    this.data = String(data);
    this.nodeType = 8;
    this.nodeName = '#comment';
  }
  get textContent() { return ''; }
  set textContent(value) { this.data = String(value); }
  cloneNode() { return this.doc().createComment(this.data); }
}

export class FakeFragment extends FakeNode {
  constructor() {
    super();
    this.nodeType = 11;
    this.nodeName = '#document-fragment';
  }
}

class ClassList {
  /** @param {FakeElement} el */
  constructor(el) { this.el = el; }
  toArray() { return (this.el.getAttribute('class') ?? '').split(/\s+/).filter(Boolean); }
  /** @param {string[]} list */
  write(list) { this.el.setAttribute('class', list.join(' ')); }
  get length() { return this.toArray().length; }
  get value() { return this.el.getAttribute('class') ?? ''; }
  /** @param {...string} names */
  add(...names) {
    const list = this.toArray();
    for (const n of names) if (n && !list.includes(n)) list.push(n);
    this.write(list);
  }
  /** @param {...string} names */
  remove(...names) { this.write(this.toArray().filter((c) => !names.includes(c))); }
  /** @param {string} name */
  contains(name) { return this.toArray().includes(name); }
  /** @param {string} name @param {boolean} [force] */
  toggle(name, force) {
    const has = this.contains(name);
    const want = force === undefined ? !has : Boolean(force);
    if (want && !has) this.add(name);
    if (!want && has) this.remove(name);
    return want;
  }
  /** @param {string} a @param {string} b */
  replace(a, b) {
    if (!this.contains(a)) return false;
    this.write(this.toArray().map((c) => (c === a ? b : c)));
    return true;
  }
  /** @param {number} i */
  item(i) { return this.toArray()[i] ?? null; }
  [Symbol.iterator]() { return this.toArray()[Symbol.iterator](); }
  forEach(/** @type {(c: string, i: number) => void} */ fn) { this.toArray().forEach(fn); }
}

/** @param {FakeElement} el */
function styleFor(el) {
  /** @type {Map<string, string>} */
  const props = new Map();
  const parse = (/** @type {string} */ css) => {
    props.clear();
    for (const part of String(css).split(';')) {
      const at = part.indexOf(':');
      if (at < 0) continue;
      const key = part.slice(0, at).trim().toLowerCase();
      if (key) props.set(key, part.slice(at + 1).trim());
    }
  };
  const text = () => [...props].map(([k, v]) => `${k}: ${v}`).join('; ');
  const target = {
    setProperty: (/** @type {string} */ k, /** @type {string} */ v) => { props.set(k, String(v)); el.attrs.set('style', text()); },
    getPropertyValue: (/** @type {string} */ k) => props.get(k) ?? '',
    removeProperty: (/** @type {string} */ k) => { props.delete(k); el.attrs.set('style', text()); },
  };
  const proxy = new Proxy(target, {
    get(t, key) {
      if (key in t) return /** @type {any} */ (t)[key];
      if (key === 'cssText') return text();
      if (typeof key !== 'string') return undefined;
      return props.get(kebab(key)) ?? '';
    },
    set(t, key, value) {
      if (key === 'cssText') { parse(value); el.attrs.set('style', text()); return true; }
      if (typeof key !== 'string') return false;
      if (value === null || value === '') props.delete(kebab(key));
      else props.set(kebab(key), String(value));
      el.attrs.set('style', text());
      return true;
    },
  });
  return { proxy, parse };
}

export class FakeElement extends FakeNode {
  /** @param {string} tag @param {string} [ns] */
  constructor(tag, ns = '') {
    super();
    this.nodeType = 1;
    this.namespaceURI = ns;
    this.localName = ns.includes('svg') ? tag : tag.toLowerCase();
    this.tagName = ns.includes('svg') ? tag : tag.toUpperCase();
    this.nodeName = this.tagName;
    /** @type {Map<string, string>} */
    this.attrs = new Map();
    this.classList = new ClassList(this);
    const style = styleFor(this);
    this.styleProxy = style.proxy;
    this.parseStyle = style.parse;
    /** @type {string | null} */
    this.liveValue = null;
    this.liveChecked = null;
    this.dataset = new Proxy({}, {
      get: (t, key) => (typeof key === 'string' ? this.getAttribute(`data-${kebab(key)}`) ?? undefined : undefined),
      set: (t, key, value) => { if (typeof key === 'string') this.setAttribute(`data-${kebab(key)}`, String(value)); return true; },
      deleteProperty: (t, key) => { if (typeof key === 'string') this.removeAttribute(`data-${kebab(key)}`); return true; },
      has: (t, key) => typeof key === 'string' && this.hasAttribute(`data-${kebab(key)}`),
      ownKeys: () => [...this.attrs.keys()].filter((k) => k.startsWith('data-')).map((k) => camel(k.slice(5))),
      getOwnPropertyDescriptor: (t, key) => (typeof key === 'string' && this.hasAttribute(`data-${kebab(key)}`)
        ? { enumerable: true, configurable: true, value: this.getAttribute(`data-${kebab(key)}`) } : undefined),
    });
  }

  // --- atributos
  /** @param {string} name */
  getAttribute(name) {
    const key = String(name).toLowerCase();
    return this.attrs.has(key) ? /** @type {string} */ (this.attrs.get(key)) : null;
  }
  /** @param {string} name @param {any} value */
  setAttribute(name, value) {
    const key = String(name).toLowerCase();
    const v = String(value);
    this.attrs.set(key, v);
    if (key === 'style') this.parseStyle(v);
  }
  /** @param {string} name */
  hasAttribute(name) { return this.attrs.has(String(name).toLowerCase()); }
  /** @param {string} name */
  removeAttribute(name) {
    const key = String(name).toLowerCase();
    this.attrs.delete(key);
    if (key === 'style') this.parseStyle('');
  }
  /** @param {string} name @param {boolean} [force] */
  toggleAttribute(name, force) {
    const has = this.hasAttribute(name);
    const want = force === undefined ? !has : Boolean(force);
    if (want) this.setAttribute(name, ''); else this.removeAttribute(name);
    return want;
  }
  getAttributeNames() { return [...this.attrs.keys()]; }
  get attributes() { return [...this.attrs].map(([name, value]) => ({ name, value })); }
  /** @param {string} ns @param {string} name @param {any} value */
  setAttributeNS(ns, name, value) { this.setAttribute(name, value); }

  get id() { return this.getAttribute('id') ?? ''; }
  set id(v) { this.setAttribute('id', v); }
  get className() { return this.getAttribute('class') ?? ''; }
  set className(v) { this.setAttribute('class', v); }
  get style() { return this.styleProxy; }
  set style(v) { this.setAttribute('style', v); }
  get title() { return this.getAttribute('title') ?? ''; }
  set title(v) { this.setAttribute('title', v); }
  get hidden() { return this.hasAttribute('hidden'); }
  set hidden(v) { this.toggleAttribute('hidden', Boolean(v)); }
  get disabled() { return this.hasAttribute('disabled'); }
  set disabled(v) { this.toggleAttribute('disabled', Boolean(v)); }
  get type() { return this.getAttribute('type') ?? (this.localName === 'button' ? 'submit' : 'text'); }
  set type(v) { this.setAttribute('type', v); }
  get name() { return this.getAttribute('name') ?? ''; }
  set name(v) { this.setAttribute('name', v); }
  get placeholder() { return this.getAttribute('placeholder') ?? ''; }
  set placeholder(v) { this.setAttribute('placeholder', v); }
  get href() { return this.getAttribute('href') ?? ''; }
  set href(v) { this.setAttribute('href', v); }
  get src() { return this.getAttribute('src') ?? ''; }
  set src(v) { this.setAttribute('src', v); }
  get download() { return this.getAttribute('download') ?? ''; }
  set download(v) { this.setAttribute('download', v); }
  get tabIndex() { return Number(this.getAttribute('tabindex') ?? -1); }
  set tabIndex(v) { this.setAttribute('tabindex', v); }
  get maxLength() { return Number(this.getAttribute('maxlength') ?? -1); }
  set maxLength(v) { this.setAttribute('maxlength', v); }

  get value() {
    if (this.localName === 'select') {
      const options = this.querySelectorAll('option');
      const chosen = options.find((o) => o.selected) ?? options[0];
      return chosen ? chosen.value : '';
    }
    if (this.localName === 'option') return this.getAttribute('value') ?? this.textContent;
    if (this.localName === 'textarea') return this.liveValue ?? this.textContent;
    return this.liveValue ?? this.getAttribute('value') ?? '';
  }
  set value(v) {
    if (this.localName === 'select') {
      for (const o of this.querySelectorAll('option')) o.selected = o.value === String(v);
      return;
    }
    this.liveValue = String(v ?? '');
  }
  get selected() { return this.liveChecked ?? this.hasAttribute('selected'); }
  set selected(v) { this.liveChecked = Boolean(v); }
  get checked() { return this.liveChecked ?? this.hasAttribute('checked'); }
  set checked(v) { this.liveChecked = Boolean(v); }
  get files() { return /** @type {any} */ (this).fakeFiles ?? []; }

  // --- arbol
  get children() { return /** @type {FakeElement[]} */ (this.childNodes.filter((n) => n instanceof FakeElement)); }
  get childElementCount() { return this.children.length; }
  get firstElementChild() { return this.children[0] ?? null; }
  get lastElementChild() { const c = this.children; return c[c.length - 1] ?? null; }
  get nextElementSibling() {
    const list = this.parentNode?.children ?? [];
    return list[list.indexOf(this) + 1] ?? null;
  }
  get previousElementSibling() {
    const list = this.parentNode?.children ?? [];
    const i = list.indexOf(this);
    return i > 0 ? list[i - 1] : null;
  }

  get innerText() { return this.textContent; }
  set innerText(v) { this.textContent = v; }

  get innerHTML() { return this.childNodes.map((n) => serialize(n)).join(''); }
  set innerHTML(markup) {
    for (const n of this.childNodes) { this.forgetFocus(n); n.parentNode = null; }
    this.childNodes = [];
    for (const node of parseMarkup(String(markup), this.doc(), this.namespaceURI)) this.appendChild(node);
  }
  get outerHTML() { return serialize(this); }

  /** @param {string} where @param {string} markup */
  insertAdjacentHTML(where, markup) {
    const nodes = parseMarkup(String(markup), this.doc(), this.namespaceURI);
    if (where === 'beforeend') for (const n of nodes) this.appendChild(n);
    else if (where === 'afterbegin') { const first = this.firstChild; for (const n of nodes) this.insertBefore(n, first); } else if (where === 'beforebegin') this.before(...nodes);
    else if (where === 'afterend') this.after(...nodes);
  }

  /** @param {string} selector */
  matches(selector) { return matches(this, selector); }
  /** @param {string} selector */
  closest(selector) {
    /** @type {any} */
    let n = this;
    while (n instanceof FakeElement) {
      if (matches(n, selector)) return n;
      n = n.parentNode;
    }
    return null;
  }

  /** @param {string} cls */
  getElementsByClassName(cls) { return this.querySelectorAll(`.${cls}`); }
  /** @param {string} tag */
  getElementsByTagName(tag) { return this.querySelectorAll(tag); }

  // --- comportamiento
  click() {
    if (this.disabled && ['button', 'input', 'select', 'textarea'].includes(this.localName)) return;
    const allowed = this.dispatchEvent(new FakeEvent('click', { bubbles: true }));
    // Un enlace con `download` es una descarga: se apunta para que la prueba
    // pueda leer el archivo que el usuario se habria llevado.
    if (allowed && this.localName === 'a' && this.hasAttribute('download')) {
      this.doc().downloads.push({ name: this.getAttribute('download') ?? '', href: this.getAttribute('href') ?? '' });
    }
    // Un <input type=file> abre el selector de archivos: la prueba lo simula.
    if (allowed && this.localName === 'input' && this.type === 'file') this.doc().fileRequests.push(this);
  }
  focus() {
    const doc = this.doc();
    // Un elemento que ya no esta en la pagina no puede tener el foco.
    if (!this.isConnected) return;
    if (doc.activeElement === this) return;
    // Como en un navegador: el que tenia el foco se entera de que lo pierde.
    const previous = doc.activeElement;
    doc.activeElement = this;
    if (previous && previous !== doc.body) previous.dispatchEvent(new FakeEvent('blur'));
    this.dispatchEvent(new FakeEvent('focus'));
  }
  blur() {
    const doc = this.doc();
    if (doc.activeElement === this) doc.activeElement = doc.body;
    this.dispatchEvent(new FakeEvent('blur'));
  }
  select() {}
  scrollIntoView() {}
  scrollTo() {}
  getBBox() { return { x: 0, y: 0, width: 20, height: 20 }; }
  getBoundingClientRect() { return { x: 0, y: 0, top: 0, left: 0, right: 100, bottom: 30, width: 100, height: 30 }; }
  getClientRects() { return [this.getBoundingClientRect()]; }
  animate() {
    const done = Promise.resolve();
    return { finished: done, cancel() {}, finish() {}, onfinish: null, play() {}, pause() {} };
  }
  play() { return Promise.resolve(); }
  pause() {}
  /** @param {boolean} [deep] */
  cloneNode(deep = false) {
    const copy = new FakeElement(this.localName, this.namespaceURI);
    copy.ownerDocument = this.ownerDocument;
    for (const [k, v] of this.attrs) copy.setAttribute(k, v);
    if (deep) for (const child of this.childNodes) copy.appendChild(child.cloneNode(true));
    return copy;
  }
}

/** @param {FakeNode} node @returns {string} */
function serialize(node) {
  if (node instanceof FakeText) return escapeText(node.data);
  if (node instanceof FakeComment) return `<!--${node.data}-->`;
  if (!(node instanceof FakeElement)) return node.childNodes.map(serialize).join('');
  const attrs = [...node.attrs].map(([k, v]) => ` ${k}="${escapeAttr(v)}"`).join('');
  if (VOID.has(node.localName)) return `<${node.localName}${attrs}>`;
  return `<${node.localName}${attrs}>${node.childNodes.map(serialize).join('')}</${node.localName}>`;
}

// ------------------------------------------------------------- lector de HTML/SVG

/**
 * Lee marcado HTML o SVG bien formado (el de las escenas y el de la app).
 * @param {string} markup @param {FakeDocument} doc @param {string} ns
 * @returns {FakeNode[]}
 */
export function parseMarkup(markup, doc, ns = '') {
  const root = new FakeFragment();
  root.ownerDocument = doc;
  /** @type {FakeNode[]} */
  const stack = [root];
  /** @type {string[]} */
  const nsStack = [ns];
  let i = 0;
  const top = () => stack[stack.length - 1];
  while (i < markup.length) {
    const lt = markup.indexOf('<', i);
    if (lt < 0) {
      const text = markup.slice(i);
      if (text) top().appendChild(doc.createTextNode(decode(text)));
      break;
    }
    if (lt > i) top().appendChild(doc.createTextNode(decode(markup.slice(i, lt))));
    if (markup.startsWith('<!--', lt)) {
      const end = markup.indexOf('-->', lt + 4);
      const stop = end < 0 ? markup.length : end;
      top().appendChild(doc.createComment(markup.slice(lt + 4, stop)));
      i = end < 0 ? markup.length : end + 3;
      continue;
    }
    if (markup.startsWith('<!', lt) || markup.startsWith('<?', lt)) {
      const end = markup.indexOf('>', lt);
      i = end < 0 ? markup.length : end + 1;
      continue;
    }
    if (markup.startsWith('</', lt)) {
      const end = markup.indexOf('>', lt);
      const name = markup.slice(lt + 2, end).trim().toLowerCase();
      for (let k = stack.length - 1; k > 0; k -= 1) {
        const el = /** @type {FakeElement} */ (stack[k]);
        if (el.localName.toLowerCase() === name) {
          stack.length = k;
          nsStack.length = k;
          break;
        }
      }
      i = end + 1;
      continue;
    }
    // etiqueta de apertura
    let j = lt + 1;
    const nameMatch = /^[a-zA-Z][a-zA-Z0-9:_-]*/.exec(markup.slice(j));
    if (!nameMatch) {
      top().appendChild(doc.createTextNode('<'));
      i = lt + 1;
      continue;
    }
    const tag = nameMatch[0];
    j += tag.length;
    const parentNs = nsStack[nsStack.length - 1];
    const elNs = tag.toLowerCase() === 'svg' ? 'http://www.w3.org/2000/svg' : parentNs;
    const el = elNs.includes('svg') ? doc.createElementNS(elNs, tag) : doc.createElement(tag);
    // atributos
    let selfClose = false;
    while (j < markup.length) {
      while (/\s/.test(markup[j])) j += 1;
      if (markup[j] === '>') { j += 1; break; }
      if (markup.startsWith('/>', j)) { selfClose = true; j += 2; break; }
      const attr = /^([^\s=/>]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+)))?/.exec(markup.slice(j));
      if (!attr) { j += 1; continue; }
      el.setAttribute(attr[1], decode(attr[2] ?? attr[3] ?? attr[4] ?? ''));
      j += attr[0].length;
    }
    top().appendChild(el);
    i = j;
    const lower = tag.toLowerCase();
    if (selfClose || (!elNs.includes('svg') && VOID.has(lower))) continue;
    if (RAW_TEXT.has(lower)) {
      const close = markup.toLowerCase().indexOf(`</${lower}`, i);
      const stop = close < 0 ? markup.length : close;
      el.appendChild(doc.createTextNode(markup.slice(i, stop)));
      const end = markup.indexOf('>', stop);
      i = end < 0 ? markup.length : end + 1;
      continue;
    }
    stack.push(el);
    nsStack.push(elNs);
  }
  const nodes = [...root.childNodes];
  for (const n of nodes) n.parentNode = null;
  return nodes;
}

// ------------------------------------------------------------- documento

export class FakeDocument extends FakeNode {
  constructor() {
    super();
    this.nodeType = 9;
    this.nodeName = '#document';
    /** @type {DomError[]} */
    this.errors = [];
    /** @type {{ name: string, href: string }[]} */
    this.downloads = [];
    /** @type {any[]} */
    this.fileRequests = [];
    /** @type {any} */
    this.defaultView = null;
    this.ownerDocument = null;
    this.title = '';
    this.hidden = false;
    this.visibilityState = 'visible';
    this.readyState = 'complete';
    this.documentElement = this.createElement('html');
    this.appendChild(this.documentElement);
    this.head = this.createElement('head');
    this.body = this.createElement('body');
    this.documentElement.append(this.head, this.body);
    /** @type {any} */
    this.focused = this.body;
  }

  // Como en un navegador: si el elemento con el foco sale de la pagina, el
  // foco vuelve al body (y un lector de pantalla se pierde).
  get activeElement() { return this.focused?.isConnected ? this.focused : this.body; }
  set activeElement(el) { this.focused = el; }

  /** @param {string} tag */
  createElement(tag) {
    const el = new FakeElement(tag);
    el.ownerDocument = this;
    return el;
  }
  /** @param {string} ns @param {string} tag */
  createElementNS(ns, tag) {
    const el = new FakeElement(tag, ns ?? '');
    el.ownerDocument = this;
    return el;
  }
  /** @param {string} data */
  createTextNode(data) {
    const t = new FakeText(data);
    t.ownerDocument = this;
    return t;
  }
  /** @param {string} data */
  createComment(data) {
    const c = new FakeComment(data);
    c.ownerDocument = this;
    return c;
  }
  createDocumentFragment() {
    const f = new FakeFragment();
    f.ownerDocument = this;
    return f;
  }
  /** @param {string} id */
  getElementById(id) { return this.querySelector(`#${id}`); }
  /** @param {string} type @param {any} [init] */
  createEvent(type, init) { return new FakeEvent(type, init); }
  hasFocus() { return true; }
}

// ------------------------------------------------------------- almacenamiento

export class FakeStorage {
  constructor() { /** @type {Map<string, string>} */ this.map = new Map(); }
  get length() { return this.map.size; }
  /** @param {number} i */
  key(i) { return [...this.map.keys()][i] ?? null; }
  /** @param {string} k */
  getItem(k) { return this.map.has(String(k)) ? /** @type {string} */ (this.map.get(String(k))) : null; }
  /** @param {string} k @param {any} v */
  setItem(k, v) { this.map.set(String(k), String(v)); }
  /** @param {string} k */
  removeItem(k) { this.map.delete(String(k)); }
  clear() { this.map.clear(); }
}

/** Errores de manejadores que no cuelgan de ningun documento (FileReader). */
export const strayErrors = /** @type {DomError[]} */ ([]);

/**
 * Lector de archivos minimo (solo texto), para probar la importacion de copias.
 */
export class FakeFileReader extends Target {
  constructor() {
    super();
    /** @type {any} */ this.result = null;
    /** @type {any} */ this.error = null;
    this.readyState = 0;
  }
  /** @param {Blob} blob */
  readAsText(blob) {
    blob.text().then((text) => {
      this.result = text;
      this.readyState = 2;
      this.fire(new FakeEvent('load'), strayErrors);
      this.fire(new FakeEvent('loadend'), strayErrors);
    }, (error) => {
      this.error = error;
      this.fire(new FakeEvent('error'), strayErrors);
    });
  }
}
