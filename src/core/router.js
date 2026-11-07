// @ts-check
// Rutas con almohadilla (#/topic/animals). Sin servidor: funciona en GitHub
// Pages y abriendo la carpeta con cualquier servidor estatico.

/** @typedef {Record<string, string>} Params */
/** @typedef {(params: Params) => void} Handler */

/** @type {{ pattern: string, handler: Handler }[]} */
const routes = [];
/** @type {((path: string) => void) | null} */
let notFound = null;
/** @type {Set<(path: string) => void>} */
const after = new Set();

/** @param {string} pattern @param {Handler} handler */
export function register(pattern, handler) {
  routes.push({ pattern, handler });
}

/** @param {(path: string) => void} handler */
export function fallback(handler) {
  notFound = handler;
}

/**
 * Lo que hay que hacer cada vez que se pinta una pantalla nueva (subir al
 * principio, mover el foco, poner el titulo). Devuelve como quitarlo.
 * @param {(path: string) => void} fn
 * @returns {() => void}
 */
export function afterEach(fn) {
  after.add(fn);
  return () => { after.delete(fn); };
}

/** @param {string} path */
export function go(path) {
  if (window.location.hash === `#${path}`) resolve();
  else window.location.hash = path;
}

/**
 * Como go(), pero sin dejar la ruta de ahora en el historial: para una
 * pantalla que manda a otra (si no, el boton de volver la repetiria).
 * @param {string} path
 */
export function replace(path) {
  if (window.location.hash === `#${path}`) resolve();
  else window.location.replace(`#${path}`);
}

/** La ruta actual, sin la almohadilla. */
export function current() {
  const raw = window.location.hash.replace(/^#/, '');
  return raw.length ? raw : '/';
}

function resolve() {
  const path = current();
  const route = routes.find(({ pattern }) => matchPattern(pattern, path));
  if (route) route.handler(/** @type {Params} */ (matchPattern(route.pattern, path)));
  else if (notFound) notFound(path);
  // Si la pantalla mando a otra (por ejemplo, a elegir quien juega), los
  // avisos esperan a esa otra.
  if (current() === path) for (const fn of after) fn(path);
}

/**
 * @param {string} pattern
 * @param {string} path
 * @returns {Params | null}
 */
export function matchPattern(pattern, path) {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  /** @type {Params} */
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) {
      // Un enlace mal copiado (%E0%A4%A) no puede tumbar la app: esa ruta no
      // casa y se va a la de por defecto.
      try {
        params[p[i].slice(1)] = decodeURIComponent(s[i]);
      } catch {
        return null;
      }
    } else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function start() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
