// @ts-check
// Recorrido visual en un Chromium de verdad. Es OPCIONAL: no forma parte de
// `npm run check` (que no necesita instalar nada) y sirve para lo que la
// bateria no puede medir sin un navegador real: que nada se salga por los
// lados en un movil, que no haya errores en la consola y como se ve cada
// pantalla. Asi se encontraron en octubre de 2026 la barra de arriba que no
// cabia en un movil, la lista de paginas que solo ensenaba una pagina y la
// sopa de letras que se salia de la pantalla.
//
// Necesita Playwright y un Chromium. Uso:
//   npm start                      (en otra terminal, o cualquier servidor estatico)
//   node tools/sweep-screens.mjs [--url http://localhost:3000/index.html] [--out capturas] [390 1100]
//
// Variables opcionales: PLAYWRIGHT (ruta al paquete playwright si no esta en
// node_modules) y CHROMIUM (ruta al ejecutable de Chromium).

import { createRequire } from 'node:module';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { GAMES, PRACTICE } from '../src/games/registry.js';
import { BOARDS, BOARD_GAMES } from '../src/data/boards.js';
import { TOPICS } from '../src/data/topics.js';

const args = process.argv.slice(2);
/** @param {string} name @param {string} fallback */
const option = (name, fallback) => {
  const i = args.indexOf(name);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const base = option('--url', 'http://localhost:3000/index.html');
const out = option('--out', 'capturas');
const widths = args.filter((a, i) => /^\d+$/.test(a) && !['--url', '--out'].includes(args[i - 1])).map(Number);
const WIDTHS = widths.length ? widths : [390, 1100];

const require = createRequire(import.meta.url);
/** @type {any} */
let playwright;
try {
  playwright = require(process.env.PLAYWRIGHT ?? 'playwright');
} catch {
  process.stderr.write('No encuentro Playwright. Instalalo (npm i -D playwright) o di donde esta con PLAYWRIGHT=/ruta.\n');
  process.exit(2);
}

const topic = TOPICS[0].id;
const board = BOARDS[0].id;
const ROUTES = [
  '#/who', '#/', `#/topic/${TOPICS[5].id}`, `#/board/${board}`, '#/mock', '#/teacher', '#/settings', '#/print/4242', '#/examiner', '#/voice',
  ...[...GAMES, ...PRACTICE].filter((g) => g.ready).map((g) => `#/play/${g.id}/${topic}`),
  ...BOARD_GAMES.map((g) => `#/board/${board}/play/${g.id}`),
];

mkdirSync(out, { recursive: true });
const browser = await playwright.chromium.launch({
  args: ['--no-sandbox'],
  ...(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {}),
});
let trouble = 0;
for (const width of WIDTHS) {
  const page = await browser.newPage({ viewport: { width, height: width < 600 ? 844 : 900 } });
  /** @type {string[]} */
  const errors = [];
  page.on('pageerror', (/** @type {Error} */ e) => errors.push(String(e)));
  page.on('console', (/** @type {any} */ m) => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto(base);
  await page.waitForTimeout(300);
  // Un album de prueba para poder entrar en todas las pantallas.
  await page.fill('input', 'Sweep');
  await page.keyboard.press('Enter');
  await page.waitForTimeout(400);
  // El informe de ese album (necesita su id).
  const id = await page.evaluate(async () => (await import('./src/core/profiles.js')).currentId());
  for (const route of [...ROUTES, `#/report/${id}`]) {
    await page.goto(`${base}${route}`);
    await page.waitForTimeout(700);
    const wide = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    const name = `${width}-${route.replace(/[#/]+/g, '_').replace(/^_|_$/g, '') || 'album'}.png`;
    await page.screenshot({ path: join(out, name) });
    if (wide > 1) {
      trouble += 1;
      process.stdout.write(`${width}px ${route}: la pagina se sale ${wide}px por la derecha\n`);
    }
    // Un texto de ayuda que no cabe en su casilla se lee cortado ("write it her").
    const cut = await page.evaluate(() => {
      const pen = /** @type {CanvasRenderingContext2D} */ (document.createElement('canvas').getContext('2d'));
      return [...document.querySelectorAll('input[placeholder], textarea[placeholder]')]
        .filter((el) => /** @type {HTMLElement} */ (el).offsetParent)
        .map((el) => {
          const input = /** @type {HTMLInputElement} */ (el);
          const css = getComputedStyle(input);
          pen.font = `${css.fontStyle} ${css.fontWeight} ${css.fontSize} ${css.fontFamily}`;
          const room = input.clientWidth - parseFloat(css.paddingLeft) - parseFloat(css.paddingRight);
          return pen.measureText(input.placeholder).width > room + 1 ? input.placeholder : '';
        })
        .filter(Boolean);
    });
    for (const text of cut) {
      trouble += 1;
      process.stdout.write(`${width}px ${route}: el texto de ayuda "${text}" no cabe en su casilla\n`);
    }
  }
  if (errors.length) {
    trouble += errors.length;
    process.stdout.write(`${width}px: errores en la consola:\n  ${errors.join('\n  ')}\n`);
  }
  await page.close();
}
await browser.close();
process.stdout.write(trouble
  ? `\n${trouble} problema(s). Capturas en ${out}/\n`
  : `\nNada se sale y no hay errores (${ROUTES.length + 1} pantallas a ${WIDTHS.join(' y ')}px). Capturas en ${out}/\n`);
process.exit(trouble ? 1 : 0);
