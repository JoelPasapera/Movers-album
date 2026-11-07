// @ts-check
// La web tiene que funcionar en un aula sin internet. Esta comprobacion:
//   1. mira que la lista de archivos que se guardan en el aparato
//      (precache-list.js) esta al dia y que cada archivo existe;
//   2. ejecuta el service worker de verdad (sw.js) en un entorno de mentira:
//      lo instala, le corta internet, le pide la web, le instala una version
//      nueva y mira que la vieja se borra;
//   3. revisa el manifest y los iconos que hacen falta para instalarla.

import {
  readFileSync, existsSync, mkdtempSync, mkdirSync, writeFileSync, copyFileSync, rmSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname, delimiter } from 'node:path';
import { spawnSync } from 'node:child_process';
import { runInNewContext } from 'node:vm';
import { render, OUTPUT } from '../tools/build-precache.mjs';

export const name = 'La web se instala y funciona sin internet';

/** Lee el tamano de un PNG de su cabecera. @param {string} path */
function pngSize(path) {
  const b = readFileSync(path);
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

const ORIGIN = 'https://joelpasapera.github.io';
const BASE = `${ORIGIN}/Movers-album/`;

/**
 * Un service worker dentro de node: `self`, caches y fetch de mentira. La red
 * lee los archivos del disco (o falla, si se le "corta internet").
 * @param {Map<string, Map<string, string>>} storage  caches compartidas entre versiones
 * @param {{ online: boolean, overrides?: Record<string, string>, redirectIndex?: boolean }} net
 */
function bootWorker(storage, net) {
  /** @type {Record<string, Function[]>} */
  const listeners = {};
  let skipped = false;
  let claimed = false;
  /** @param {string} url */
  const pathOf = (url) => {
    const rel = new URL(url).pathname.replace('/Movers-album/', '');
    return rel === '' ? 'index.html' : rel;
  };
  const response = (/** @type {string} */ body, status = 200, redirected = false) => ({
    ok: status === 200, status, body, redirected, statusText: '', headers: {}, clone() { return response(body, status, redirected); },
  });
  /** Lo que se pide a la red: para comprobar que la instalacion no usa la cache HTTP. */
  const requested = /** @type {{ url: string, cache: string }[]} */ ([]);
  const fetchFake = async (/** @type {any} */ req) => {
    const url = typeof req === 'string' ? req : req.url;
    requested.push({ url, cache: typeof req === 'string' ? 'default' : req.cache });
    if (!net.online) throw new TypeError('Failed to fetch (sin internet)');
    const path = pathOf(url);
    if (net.overrides && path in net.overrides) return response(net.overrides[path]);
    if (!existsSync(path)) return response('not found', 404);
    // Como npx serve: index.html llega redirigido.
    return response(readFileSync(path, 'utf8'), 200, Boolean(net.redirectIndex) && path === 'index.html');
  };
  class Request {
    /** @param {string} url @param {{ cache?: string, mode?: string }} [init] */
    constructor(url, init = {}) { this.url = String(url); this.cache = init.cache ?? 'default'; this.mode = init.mode ?? 'cors'; this.method = 'GET'; }
  }
  class Response {
    /** @param {any} body @param {{ status?: number, statusText?: string, headers?: any }} [init] */
    constructor(body, init = {}) {
      this.body = body; this.status = init.status ?? 200; this.ok = this.status === 200;
      this.statusText = init.statusText ?? ''; this.headers = init.headers ?? {}; this.redirected = false;
    }
  }
  const keyOf = (/** @type {any} */ req, ignoreSearch = false) => {
    const url = new URL(typeof req === 'string' ? req : req.url);
    if (ignoreSearch) url.search = '';
    return url.href;
  };
  const cacheApi = (/** @type {Map<string, string>} */ map) => ({
    async addAll(/** @type {string[]} */ urls) {
      const got = [];
      for (const u of urls) {
        const r = await fetchFake(u);
        if (!r.ok) throw new TypeError(`addAll: ${u} da ${r.status}`);
        got.push([keyOf(u), r.body]);
      }
      for (const [k, v] of got) map.set(k, v);
    },
    async match(/** @type {any} */ req, /** @type {any} */ opts = {}) {
      const body = map.get(keyOf(req, opts.ignoreSearch));
      if (body === undefined) return undefined;
      return response(body, 200, Boolean(net.redirectIndex) && keyOf(req).endsWith('/index.html'));
    },
    async keys() { return [...map.keys()].map((url) => ({ url })); },
    async put(/** @type {any} */ req, /** @type {any} */ res) { map.set(keyOf(req), res.body); },
  });
  const caches = {
    async open(/** @type {string} */ name) {
      if (!storage.has(name)) storage.set(name, new Map());
      return cacheApi(/** @type {Map<string, string>} */ (storage.get(name)));
    },
    async keys() { return [...storage.keys()]; },
    async delete(/** @type {string} */ name) { return storage.delete(name); },
    async has(/** @type {string} */ name) { return storage.has(name); },
  };
  const self = {
    location: new URL('sw.js', BASE),
    addEventListener: (/** @type {string} */ type, /** @type {Function} */ fn) => { (listeners[type] ??= []).push(fn); },
    skipWaiting: () => { skipped = true; },
    clients: { claim: async () => { claimed = true; } },
    PRECACHE: /** @type {string[]} */ ([]),
    PRECACHE_VERSION: '',
  };
  const context = {
    self, caches, fetch: fetchFake, URL, Promise, console, Request, Response,
    importScripts: (/** @type {string} */ file) => {
      const code = net.overrides?.[file] ?? readFileSync(file, 'utf8');
      runInNewContext(code, context, { filename: file });
    },
  };
  runInNewContext(readFileSync('sw.js', 'utf8'), context, { filename: 'sw.js' });

  /** @param {string} type @param {Record<string, any>} [extra] */
  const dispatch = async (type, extra = {}) => {
    /** @type {Promise<any>[]} */
    const waits = [];
    /** @type {Promise<any> | null} */
    let responded = null;
    const event = {
      ...extra,
      waitUntil: (/** @type {Promise<any>} */ p) => { waits.push(p); },
      respondWith: (/** @type {Promise<any>} */ p) => { responded = Promise.resolve(p); },
    };
    for (const fn of listeners[type] ?? []) fn(event);
    await Promise.all(waits);
    return responded ? await responded : undefined;
  };
  const get = (/** @type {string} */ path, mode = 'cors') => dispatch('fetch', {
    request: { url: new URL(path, BASE).href, method: 'GET', mode },
  });
  return { self, dispatch, get, listeners, requested, flags: () => ({ skipped, claimed }) };
}

/**
 * `build-precache.mjs --check` y el gancho opcional tools/hooks/pre-commit, de
 * verdad, en una web de juguete: con la lista al dia dejan pasar; con un
 * archivo cambiado, --check falla sin tocar nada y el gancho para el commit y
 * deja la lista regenerada.
 * @returns {string[]}
 */
function hookWorks() {
  /** @type {string[]} */
  const problems = [];
  const dir = mkdtempSync(join(tmpdir(), 'movers-precache-'));
  try {
    for (const sub of ['tools/hooks', 'src', 'icons']) mkdirSync(join(dir, sub), { recursive: true });
    copyFileSync('tools/build-precache.mjs', join(dir, 'tools/build-precache.mjs'));
    copyFileSync('tools/hooks/pre-commit', join(dir, 'tools/hooks/pre-commit'));
    writeFileSync(join(dir, 'index.html'), '<!doctype html><title>toy</title>');
    writeFileSync(join(dir, 'manifest.webmanifest'), '{}');
    writeFileSync(join(dir, 'src/app.js'), 'export const a = 1;\n');
    writeFileSync(join(dir, 'icons/icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg"/>');
    const node = (/** @type {string[]} */ ...args) => spawnSync(process.execPath, ['tools/build-precache.mjs', ...args], { cwd: dir, encoding: 'utf8' });
    const hook = () => spawnSync('sh', ['tools/hooks/pre-commit'], { cwd: dir, encoding: 'utf8', env: { ...process.env, PATH: `${dirname(process.execPath)}${delimiter}${process.env.PATH ?? ''}` } });
    const list = () => readFileSync(join(dir, OUTPUT), 'utf8');

    node('--quiet');
    if (node('--check').status !== 0) problems.push('build-precache --check falla con la lista al dia');
    writeFileSync(join(dir, 'src/app.js'), 'export const a = 2;\n');
    const stale = list();
    if (node('--check').status === 0) problems.push('build-precache --check deja pasar una lista desfasada');
    if (list() !== stale) problems.push('build-precache --check toca la lista (solo tenia que mirar)');

    const first = hook();
    if (first.error) return problems; // sin `sh` en este aparato: el gancho no se puede probar aqui
    if (first.status === 0) problems.push('el gancho pre-commit deja hacer commit con la lista desfasada');
    if (list() === stale) problems.push('el gancho pre-commit no regenera la lista desfasada');
    if (hook().status !== 0) problems.push('el gancho pre-commit no deja hacer commit con la lista ya al dia');
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  return problems;
}

export async function run() {
  /** @type {string[]} */
  const problems = [];
  problems.push(...hookWorks());

  // 1. La lista esta al dia y cada archivo existe
  const expected = render();
  const current = existsSync(OUTPUT) ? readFileSync(OUTPUT, 'utf8') : '';
  if (current !== expected.text) {
    problems.push(`${OUTPUT} esta desfasado: se cambio un archivo y la web sin internet no se enteraria. `
      + 'Ejecuta npm run check (lo regenera) o node tools/build-precache.mjs');
  }
  for (const file of expected.files) if (!existsSync(file)) problems.push(`la lista guarda "${file}" y no existe`);
  for (const must of ['index.html', 'src/main.js', 'src/styles/base.css', 'src/fonts/baloo-2-latin-800-normal.woff2', 'icons/icon-192.png']) {
    if (!expected.files.includes(must)) problems.push(`la lista no guarda "${must}"`);
  }
  for (const banned of expected.files.filter((f) => /^(checks|tools)\//.test(f) || /\.md$/.test(f))) {
    problems.push(`la lista guarda "${banned}", que la web no necesita`);
  }
  // Cada modulo que importa la app tiene que estar en la lista: si no, sin
  // internet ese juego no abriria.
  const listed = new Set(expected.files);
  for (const file of expected.files.filter((f) => f.endsWith('.js'))) {
    const src = readFileSync(file, 'utf8');
    for (const m of src.matchAll(/(?:from\s+|import\()\s*'(\.[^']+)'/g)) {
      const target = new URL(m[1], `file:///${file}`).pathname.slice(1);
      if (!listed.has(target)) problems.push(`${file} importa ${target} y no se guarda para usarse sin internet`);
    }
  }

  // 2. El service worker de verdad, en un entorno de mentira
  /** @type {Map<string, Map<string, string>>} */
  const storage = new Map();
  const net = { online: true };
  const v1 = bootWorker(storage, net);
  const version = v1.self.PRECACHE_VERSION;
  if (version !== expected.version) problems.push('el service worker no lee la version de precache-list.js');
  for (const type of ['install', 'activate', 'fetch', 'message']) {
    if (!v1.listeners[type]?.length) problems.push(`el service worker no atiende "${type}"`);
  }
  await v1.dispatch('install');
  // Cada archivo se pide a la red de verdad, no a la cache HTTP del navegador.
  const lazy = v1.requested.filter((r) => r.cache !== 'reload');
  if (lazy.length) problems.push(`al instalarse, ${lazy.length} archivos pueden salir de la cache del navegador (version mezclada)`);
  const saved = storage.get(`movers-album-${version}`);
  if (!saved || saved.size !== expected.files.length + 1) {
    problems.push(`al instalarse guarda ${saved?.size ?? 0} archivos y deberia guardar ${expected.files.length + 1}`);
  }
  await v1.dispatch('activate');
  if (!v1.flags().claimed) problems.push('al activarse no toma el control de la pagina abierta');
  // Con internet, abrir la web tambien sale de lo guardado (rapido, y siempre
  // la misma version que el resto de archivos).
  const online = await v1.get('./album/', 'navigate').catch(() => null);
  if (!online?.body?.includes('src/main.js')) problems.push('con internet, abrir la web no sale de lo guardado');

  net.online = false;
  const page = await v1.get('./', 'navigate');
  if (!page || !String(page.body).includes('<script type="module" src="src/main.js">')) problems.push('sin internet, abrir la web no devuelve index.html');
  const deep = await v1.get('./index.html?utm=x#/topic/animals', 'navigate');
  if (!deep?.body?.includes('src/main.js')) problems.push('sin internet, un enlace con parametros no abre la web');
  const odd = await v1.get('./album/', 'navigate').catch(() => null);
  if (!odd?.body?.includes('src/main.js')) problems.push('sin internet, un enlace a otra ruta de la web no abre la web');
  for (const file of ['src/main.js', 'src/games/colour/index.js', 'src/styles/game.css', 'src/fonts/atkinson-hyperlegible-latin-400-normal.woff2']) {
    const res = await v1.get(`./${file}`);
    if (!res?.ok) problems.push(`sin internet, ${file} no se puede cargar`);
  }
  let threw = false;
  try { await v1.get('./no-existe.js'); } catch { threw = true; }
  if (!threw) problems.push('sin internet, un archivo que no esta guardado no da error');
  net.online = true;

  // Una version nueva: se instala aparte, espera, y al activarse borra la vieja.
  const list2 = readFileSync(OUTPUT, 'utf8').replace(/PRECACHE_VERSION = '[^']+'/, "PRECACHE_VERSION = 'nueva000000'");
  const v2 = bootWorker(storage, { online: true, overrides: { [OUTPUT]: list2 } });
  await v2.dispatch('install');
  if (!storage.has('movers-album-nueva000000')) problems.push('una version nueva no se guarda aparte');
  if (!storage.has(`movers-album-${version}`)) problems.push('al instalar la version nueva se borra la vieja antes de tiempo');
  if (v2.flags().skipped) problems.push('la version nueva entra sola sin que nadie pulse Reload');
  await v2.dispatch('message', { data: { type: 'skip-waiting' } });
  if (!v2.flags().skipped) problems.push('el boton Reload no activa la version nueva');
  await v2.dispatch('activate');
  if (storage.has(`movers-album-${version}`)) problems.push('al activar la version nueva no se borra la vieja');

  // Un servidor que redirige index.html (npx serve): la pagina se sirve limpia.
  const redirStore = new Map();
  const v4 = bootWorker(redirStore, { online: true, redirectIndex: true });
  await v4.dispatch('install');
  const home = await v4.get('./', 'navigate').catch(() => null);
  if (!home || home.redirected) problems.push('con un servidor que redirige index.html, la web no abre (respuesta redirigida)');

  // Si falta un archivo, no se instala a medias.
  const broken = new Map();
  const bad = readFileSync(OUTPUT, 'utf8').replace(/PRECACHE_VERSION = '[^']+'/, "PRECACHE_VERSION = 'rota0000000'")
    .replace('"./index.html",', '"./index.html",\n  "./falta.js",');
  const v3 = bootWorker(broken, { online: true, overrides: { [OUTPUT]: bad } });
  let failed = false;
  try { await v3.dispatch('install'); } catch { failed = true; }
  if (!failed) problems.push('si falta un archivo, el service worker se instala a medias');

  // 3. Manifest, iconos y enlaces en index.html
  /** @type {any} */
  let manifest = null;
  try {
    manifest = JSON.parse(readFileSync('manifest.webmanifest', 'utf8'));
  } catch {
    problems.push('manifest.webmanifest no existe o no es JSON valido');
  }
  if (manifest) {
    for (const key of ['name', 'short_name', 'start_url', 'display', 'icons', 'background_color', 'theme_color']) {
      if (!manifest[key]) problems.push(`al manifest le falta "${key}"`);
    }
    if (/^(https?:)?\/\//.test(manifest.start_url ?? '') || String(manifest.start_url).startsWith('/')) {
      problems.push('el start_url del manifest es absoluto: en GitHub Pages abriria otra web');
    }
    for (const size of [192, 512]) {
      const icon = manifest.icons?.find((/** @type {any} */ i) => i.sizes === `${size}x${size}` && i.type === 'image/png');
      if (!icon) { problems.push(`falta el icono de ${size}x${size}`); continue; }
      const dims = existsSync(icon.src) ? pngSize(icon.src) : null;
      if (!dims || dims.width !== size || dims.height !== size) problems.push(`el icono ${icon.src} no mide ${size}x${size}`);
    }
    if (!manifest.icons?.some((/** @type {any} */ i) => i.purpose === 'maskable')) problems.push('no hay icono "maskable" para Android');
  }
  const html = readFileSync('index.html', 'utf8');
  for (const [what, re] of /** @type {[string, RegExp][]} */ ([
    ['el manifest', /<link rel="manifest" href="manifest\.webmanifest">/],
    ['el color de la barra', /<meta name="theme-color"/],
    ['el icono de iPad', /<link rel="apple-touch-icon" href="icons\//],
  ])) if (!re.test(html)) problems.push(`index.html no enlaza ${what}`);
  const offline = readFileSync('src/core/offline.js', 'utf8');
  if (!offline.includes("register('./sw.js'")) problems.push('la app no registra el service worker con ruta relativa');
  if (!/updateViaCache:\s*'none'/.test(offline)) problems.push("el service worker se registra sin updateViaCache: 'none' y no veria las versiones nuevas");
  if (!/localhost/.test(offline)) problems.push('el service worker se registraria en localhost y taparia los cambios del codigo');

  return {
    ok: problems.length === 0,
    detail: `${expected.files.length} archivos guardados, version ${expected.version}`,
    problems: [...new Set(problems)],
  };
}
