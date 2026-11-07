// @ts-check
// Genera precache-list.js: la lista de archivos que el service worker guarda
// para que la web funcione sin internet, y una version que cambia en cuanto
// cambia cualquiera de ellos. Sin esa version, una tablet que ya tenia la web
// guardada se quedaria para siempre con la copia vieja.
//
// `npm run check` lo ejecuta antes de la bateria, asi que la lista nunca va
// desfasada. Se puede lanzar a mano:  node tools/build-precache.mjs
// Con --check solo mira: sale con error si la lista va desfasada, sin tocarla
// (lo usa el gancho opcional tools/hooks/pre-commit).

import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const OUTPUT = 'precache-list.js';

/** Lo que la web necesita para funcionar; nada de checks, tools ni docs. */
const ROOT_FILES = ['index.html', 'manifest.webmanifest'];
const DIRS = ['src', 'icons'];
const KEEP = /\.(js|css|woff2|svg|png|webmanifest|html)$/;

/** @param {string} dir @returns {string[]} */
const walk = (dir) => readdirSync(dir).sort().flatMap((name) => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});

/**
 * Los archivos a guardar, relativos a la raiz y en orden estable.
 * @param {string} [root]
 * @returns {string[]}
 */
export function collect(root = ROOT) {
  const files = [...ROOT_FILES.map((f) => join(root, f))];
  for (const dir of DIRS) files.push(...walk(join(root, dir)).filter((f) => KEEP.test(f)));
  return files.map((f) => relative(root, f).split(sep).join('/'));
}

/**
 * Huella del contenido: cambia si cambia un byte de cualquier archivo.
 * @param {string[]} files @param {string} [root]
 */
export function versionOf(files, root = ROOT) {
  const hash = createHash('sha256');
  for (const file of files) {
    hash.update(file);
    hash.update('\0');
    hash.update(readFileSync(join(root, file)));
    hash.update('\0');
  }
  return hash.digest('hex').slice(0, 12);
}

/** @param {string} [root] */
export function render(root = ROOT) {
  const files = collect(root);
  const version = versionOf(files, root);
  const list = ['./', ...files.map((f) => `./${f}`)];
  return {
    version,
    files,
    text: '// Generado por tools/build-precache.mjs (lo lanza npm run check). NO editar a mano.\n'
      + '// Lo que el service worker guarda para que la web funcione sin internet.\n'
      + `self.PRECACHE_VERSION = '${version}';\n`
      + `self.PRECACHE = ${JSON.stringify(list, null, 2)};\n`,
  };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { version, files, text } = render();
  let before = '';
  try { before = readFileSync(join(ROOT, OUTPUT), 'utf8'); } catch { /* primera vez */ }
  if (process.argv.includes('--check')) {
    if (before !== text) {
      console.error(`${OUTPUT} va desfasada (la version nueva seria ${version}). Ejecuta: npm run precache`);
      process.exit(1);
    }
  } else if (before !== text) writeFileSync(join(ROOT, OUTPUT), text);
  if (!process.argv.includes('--quiet')) {
    console.log(`${OUTPUT}: ${files.length} archivos, version ${version}${before === text ? ' (sin cambios)' : ''}`);
  }
}
