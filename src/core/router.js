const routes = [];
let notFound = null;

export function register(pattern, handler) {
  routes.push({ pattern, handler });
}

export function fallback(handler) {
  notFound = handler;
}

export function go(path) {
  if (window.location.hash === `#${path}`) resolve();
  else window.location.hash = path;
}

function parse() {
  const raw = window.location.hash.replace(/^#/, '');
  return raw.length ? raw : '/';
}

function resolve() {
  const path = parse();
  for (const { pattern, handler } of routes) {
    const match = matchPattern(pattern, path);
    if (match) return handler(match);
  }
  if (notFound) notFound(path);
}

function matchPattern(pattern, path) {
  const p = pattern.split('/').filter(Boolean);
  const s = path.split('/').filter(Boolean);
  if (p.length !== s.length) return null;
  const params = {};
  for (let i = 0; i < p.length; i += 1) {
    if (p[i].startsWith(':')) params[p[i].slice(1)] = decodeURIComponent(s[i]);
    else if (p[i] !== s[i]) return null;
  }
  return params;
}

export function start() {
  window.addEventListener('hashchange', resolve);
  resolve();
}
