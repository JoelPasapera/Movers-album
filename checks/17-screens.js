// @ts-check
// Las otras comprobaciones miran los datos y los motores. Esta mira las
// PANTALLAS: monta la app en un navegador de mentira (checks/lib/browser.js)
// y deja que un nino de mentira (checks/lib/bot.js) juegue cada juego de
// principio a fin, en practica y en examen, con voz y sin voz. Despues recorre
// las rutas de la app y hace un simulacro entero tocando botones.
//
// Por que: en octubre de 2026 la pantalla final de Listen and colour rompia
// con un error (usaba una variable que no existia) y ninguna comprobacion lo
// veia, porque ninguna llegaba a jugar la partida entera.

import { createBrowser, settle } from './lib/browser.js';
import {
  playToEnd, STRATEGIES, isVisible, unnamedButtons, genericActions, perform, pick, screenText, BROKEN_TEXT,
} from './lib/bot.js';
import { EXAM } from './04-exam.js';

export const name = 'Todas las pantallas se abren y todos los juegos se juegan enteros';

/**
 * Lo que en el simulacro no puede verse, porque diria si una respuesta esta
 * bien o mal: colores de acierto o fallo, la respuesta buena resaltada, la
 * sacudida, los avisos verdes o rojos y la nota que va sumando.
 */
const REVEALS = [
  'is-ok', 'is-no', 'is-right', 'is-wrong', 'is-fix', 'is-found', 'shake',
  'toast--ok', 'toast--no', 'spell-feedback--ok', 'spell-feedback--no', 'crowd-tag--ok', 'crowd-tag--no', 'marks-chip',
];

/** @param {unknown} error */
const describe = (error) => {
  if (error instanceof Error) {
    const where = (error.stack ?? '').split('\n').find((l) => l.includes('/src/'))?.trim().replace(/^at /, '') ?? '';
    return `${error.message}${where ? ` (${where.replace(/.*\/src\//, 'src/')})` : ''}`;
  }
  return String(error);
};

export async function run() {
  /** @type {string[]} */
  const problems = [];
  let gamesPlayed = 0;
  let screens = 0;

  for (const speech of [false, true]) {
    const browser = createBrowser({ speech, seed: speech ? 7 : 20261016 });
    browser.install();
    const voice = speech ? 'con voz' : 'sin voz';
    try {
      const { GAMES, PRACTICE } = await import('../src/games/registry.js');
      const { BOARDS, BOARD_GAMES } = await import('../src/data/boards.js');
      const all = [...GAMES, ...PRACTICE];

      /**
       * Monta un juego y lo juega entero.
       * @param {any} game @param {Record<string, any>} extra @param {boolean} exam
       */
      /**
       * "Fix my mistakes" se juega con errores de ayer: sin ellos no hay juego,
       * solo el aviso de que no hay nada que arreglar. Diez: una ronda de ocho
       * y, al pulsar otra vez, otra de dos.
       */
      const seedMistakes = async () => {
        const { noteMistake } = await import('../src/engine/mistakes.js');
        const { localDate, dayBefore } = await import('../src/core/time.js');
        const { update } = await import('../src/core/state.js');
        const yesterday = dayBefore(localDate());
        // El nino de mentira ya ha fallado mucho hoy en los otros juegos: el
        // cuaderno lleno de hoy echaria los de ayer (se quedan los mas recientes).
        update((s) => { /** @type {any} */ (s).mistakes = []; });
        for (let i = 0; i < 10; i += 1) {
          noteMistake(i % 2
            ? { game: 'spellit', kind: 'write', prompt: `Clue ${i}: this is a baby cat.`, answer: 'a kitten', given: 'a kiten' }
            : {
              game: 'respond', kind: 'choose', prompt: `Mum ${i}: Where is your bag?`,
              options: ['In my room.', 'Yes, it is.', 'I like it.'], answer: 'In my room.', why: 'She asks where.',
            }, yesterday);
        }
      };

      const playGame = async (game, extra, exam) => {
        const where = `${game.title}${extra.boardId ? ` (tablero ${extra.boardId})` : ''}, ${exam ? 'examen' : 'practica'}, ${voice}`;
        const before = browser.errors().length;
        if (game.id === 'fixit') await seedMistakes();
        const root = browser.document.createElement('div');
        browser.document.body.append(root);
        /** @type {{ score: number, total: number }[]} */
        const results = [];
        let exited = false;
        let instance = null;
        try {
          const mod = await game.load();
          instance = mod.mount(root, {
            topicId: 'animals',
            ...extra,
            ...(exam ? { exam: true, onFinish: (/** @type {any} */ r) => results.push(r) } : {}),
            onExit: () => { exited = true; },
          });
        } catch (error) {
          problems.push(`${where}: no se monta: ${describe(error)}`);
          root.remove();
          return;
        }
        screens += 1;
        const resultShown = () => root.querySelectorAll('.result').some(isVisible);
        if (!exam) {
          // Con el teclado: se contesta con el foco puesto en un boton y, tras
          // repintar, el foco tiene que seguir dentro del juego. Si vuelve al
          // principio de la pagina, quien juega con teclado se pierde.
          const first = root.querySelectorAll('button').find((b) => isVisible(b) && !b.disabled && !b.closest('.game-head'));
          if (first) {
            first.focus();
            first.click();
            browser.clock.advance(4000);
            await settle(3);
            if (!root.contains(browser.document.activeElement)) problems.push(`${where}: tras contestar con el teclado, el foco se sale del juego`);
          }
        }
        // En el simulacro, nada puede decir si una respuesta esta bien hasta el final.
        /** @type {Set<string>} */
        const reveals = new Set();
        const watch = () => {
          for (const cls of REVEALS) if (root.querySelectorAll(`.${cls}`).some(isVisible)) reveals.add(cls);
        };
        const outcome = await playToEnd(root, {
          clock: browser.clock,
          rng: browser.random,
          done: () => (exam ? results.length > 0 : resultShown()) || exited,
          strategy: STRATEGIES[game.id],
          watch: exam ? watch : undefined,
        });
        if (reveals.size) problems.push(`${where}: en el simulacro se ve si una respuesta esta bien o mal (${[...reveals].join(', ')})`);
        if (process.env.DEBUG17) process.stdout.write(`    ${where}: ${outcome.steps} toques\n`);
        if (!outcome.ok) problems.push(`${where}: ${outcome.reason}`);
        const finalText = screenText(root);
        if (BROKEN_TEXT.test(finalText)) problems.push(`${where}: la pantalla final ensena "${BROKEN_TEXT.exec(finalText)?.[0]}"`);
        if (outcome.broken) problems.push(`${where}: ${outcome.broken}`);
        if (exited) problems.push(`${where}: el juego se sale solo`);

        if (exam && outcome.ok) {
          const r = results[0];
          if (results.length !== 1) problems.push(`${where}: entrega el resultado ${results.length} veces`);
          if (!r || !Number.isFinite(r.score) || !Number.isFinite(r.total)) problems.push(`${where}: entrega un resultado sin numeros`);
          else if (r.score < 0 || r.score > r.total || r.total <= 0) problems.push(`${where}: entrega ${r.score} de ${r.total}`);
          const marks = EXAM.find(([tag]) => tag === game.tag)?.[1];
          if (r && marks && r.total !== marks) problems.push(`${where}: vale ${r.total} puntos y en el examen esa parte vale ${marks}`);
          if (resultShown()) problems.push(`${where}: en el simulacro pinta su propia pantalla final`);
        }

        if (!exam && outcome.ok && !exited) {
          const nameless = unnamedButtons(root);
          if (nameless.length) problems.push(`${where}: ${nameless.length} boton(es) sin nombre para el lector de pantalla`);
          // "Otra vez": el boton principal de la pantalla final vuelve a empezar.
          const again = root.querySelectorAll('.result .btn--go').find(isVisible);
          if (!again) problems.push(`${where}: la pantalla final no tiene boton para jugar otra vez`);
          else {
            again.click();
            browser.clock.advance(1500);
            await settle(3);
            if (resultShown()) problems.push(`${where}: "${again.textContent}" no vuelve a empezar`);
            else if (root.textContent.trim().length < 20) problems.push(`${where}: "${again.textContent}" deja la pantalla vacia`);
            // Un par de toques en la partida nueva, por si algo quedo a medias.
            for (let i = 0; i < 3; i += 1) {
              const actions = STRATEGIES[game.id]?.(root, browser.random) ?? genericActions(root, browser.random);
              if (actions.length) perform(pick(browser.random, actions));
              browser.clock.advance(1500);
            }
          }
        }

        try {
          instance?.destroy?.();
        } catch (error) {
          problems.push(`${where}: destroy() rompe: ${describe(error)}`);
        }
        // Lo que quede pendiente tras destroy() no puede romper nada.
        browser.clock.advance(20000);
        await settle(2);
        root.remove();
        for (const e of browser.errors().slice(before)) problems.push(`${where}: error en ${e.where}: ${describe(e.error)}`);
        gamesPlayed += 1;
      };

      for (const game of all) await playGame(game, {}, false);
      for (const game of GAMES) await playGame(game, {}, true);
      for (const board of BOARDS.slice(0, speech ? 2 : BOARDS.length)) {
        for (const { id } of BOARD_GAMES) {
          const game = all.find((g) => g.id === id);
          if (game) await playGame(game, { boardId: board.id, topicId: null }, false);
        }
      }

      if (!speech) {
        const routes = await walkRoutes(browser, BOARDS, all);
        problems.push(...routes.problems);
        screens += routes.screens;
      }
    } catch (error) {
      problems.push(`la comprobacion se rompio (${voice}): ${describe(error)}`);
    } finally {
      browser.uninstall();
    }
  }

  return {
    ok: problems.length === 0,
    detail: `${gamesPlayed} partidas jugadas enteras, ${screens} pantallas abiertas`,
    problems: [...new Set(problems)],
    numbers: { partidasJugadas: gamesPlayed },
  };
}

/**
 * Arranca la app de verdad (main.js) y recorre sus rutas; despues hace un
 * simulacro entero tocando botones y otro en el que se acaba el reloj.
 * @param {ReturnType<typeof createBrowser>} browser @param {any[]} boards @param {any[]} games
 */
async function walkRoutes(browser, boards, games) {
  /** @type {string[]} */
  const problems = [];
  let screens = 0;
  const { document, window, clock } = browser;
  const shell = document.createElement('div');
  shell.id = 'shell';
  const view = document.createElement('main');
  view.id = 'view';
  document.body.append(shell, view);

  const before = browser.errors().length;
  await import('../src/main.js');
  const profiles = await import('../src/core/profiles.js');
  const state = await import('../src/core/state.js');
  const { TOPICS } = await import('../src/data/topics.js');

  /** @param {string} hash */
  const go = async (hash) => {
    // Volver a la misma ruta no dispara hashchange (en un navegador tampoco):
    // se pasa antes por otra para que la pantalla se vuelva a pintar.
    if (window.location.hash === hash) {
      window.location.hash = '#/who';
      clock.advance(50);
      await settle(3);
    }
    window.location.hash = hash;
    clock.advance(50);
    await settle(4);
    clock.advance(50);
    await settle(2);
    screens += 1;
  };
  const text = () => screenText(view);

  await go('#/');
  if (window.location.hash !== '#/who' && !profiles.currentId()) problems.push('sin perfil, la app no pregunta quien juega');
  const profile = profiles.add('Robot');
  state.useProfile(profile.id);

  /** @type {[string, RegExp][]} */
  const expected = [
    ['#/', /Picture boards/],
    ['#/who', /Who is playing/],
    ['#/teacher', /Class progress/],
    ['#/mock', /Mock test/],
    ['#/settings', /Settings.*Voice.*Speed for practice.*Sound.*Speech recognition.*Without internet.*Backups/],
    [`#/report/${profile.id}`, /progress report/i],
    ['#/report/nadie', /No album/],
    ['#/print/4242', /Practice test on paper.*Listening.*Part 5.*Reading and Writing.*Part 6.*Listening script.*Answers/],
    ['#/examiner', /Speaking test.*Start the test/],
    ['#/voice', /Your voice.*Listen and write.*Listen and tick.*Talk about you/],
  ];
  for (const topic of TOPICS) expected.push([`#/topic/${topic.id}`, new RegExp(topic.label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))]);
  for (const board of boards) {
    expected.push([`#/board/${board.id}`, new RegExp(board.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))]);
  }
  for (const game of games) expected.push([`#/play/${game.id}/animals`, /./]);

  for (const [hash, want] of expected) {
    await go(hash);
    const t = text();
    if (!want.test(t)) problems.push(`la ruta ${hash} no ensena lo que deberia (${t.slice(0, 60)}…)`);
    if (BROKEN_TEXT.test(t)) problems.push(`la ruta ${hash} ensena texto roto: ${BROKEN_TEXT.exec(t)?.[0]}`);
    // Al cambiar de pantalla: titulo de la pestana con su nombre y el foco en
    // el contenido (si no, un lector de pantalla no se entera del cambio).
    if (!/\S \u00b7 My Movers album$/.test(document.title)) problems.push(`la ruta ${hash} deja la pestana sin el nombre de la pantalla ("${document.title}")`);
    const game = games.find((g) => hash === `#/play/${g.id}/animals`);
    if (game && !document.title.startsWith(game.title)) problems.push(`el juego ${game.id} no pone su nombre en la pestana ("${document.title}")`);
    const focused = document.activeElement;
    if (!focused || !(focused === view || view.contains(focused))) problems.push(`la ruta ${hash} no lleva el foco al contenido`);
  }
  // El Speaking cara a cara de principio a fin, como lo haria el profesor:
  // empezar, pasar las cuatro partes apuntando como contesta, poner las tres
  // bandas y guardar. La nota tiene que llegar al album del nino elegido.
  await go('#/examiner');
  const tap = async (/** @type {RegExp} */ label) => {
    const b = view.querySelectorAll('button').find((x) => isVisible(x) && !x.disabled && label.test(x.textContent ?? ''));
    b?.click();
    clock.advance(50);
    await settle(2);
    return Boolean(b);
  };
  if (!await tap(/Start the test/)) problems.push('el Speaking cara a cara no tiene boton para empezar');
  for (let i = 0; i < 12 && !/Save the mark/.test(text()); i += 1) {
    await tap(/Alone/);
    if (!await tap(/Part \d|Next pictures|Mark the test/)) break;
  }
  if (!/Save the mark/.test(text())) problems.push('el Speaking cara a cara no llega a la pantalla de la nota');
  else {
    for (const band of view.querySelectorAll('.scale-band').filter((b) => b.textContent === '4')) {
      band.click();
      await settle(1);
    }
    if (!await tap(/Save the mark/)) problems.push('en el Speaking cara a cara no se puede guardar la nota con las tres bandas puestas');
    const mark = /** @type {any} */ (state.get()).speaking?.teacher?.at(-1);
    if (!mark || mark.bands.vocabulary !== 4 || mark.bands.interaction !== 4) problems.push('la nota del Speaking cara a cara no llega al album del nino');
    if (!/4 shields/.test(text())) problems.push('el Speaking cara a cara no dice los escudos al guardar');
  }

  // Sin numero, el examen impreso se inventa uno y lo deja en la direccion
  // (sin dejar /print en el historial: volver atras no daria otro examen).
  await go('#/print');
  await settle(3);
  clock.advance(50);
  await settle(3);
  if (!/^#\/print\/\d+$/.test(window.location.hash)) problems.push(`#/print no se queda con un numero de examen (${window.location.hash})`);
  await go('#/ruta-que-no-existe');
  if (window.location.hash !== '#/') problems.push('una ruta desconocida no vuelve al album');
  await go('#/topic/%E0%A4%A');
  if (!text().length) problems.push('una ruta mal escrita deja la pantalla en blanco');

  // El simulacro entero, tocando botones como lo haria un nino.
  await go('#/mock');
  const startButton = view.querySelectorAll('button').find((b) => /Start the whole test/.test(b.textContent));
  if (!startButton) problems.push('el simulacro no tiene boton para empezar');
  else {
    startButton.click();
    await settle(3);
    let guard = 0;
    while (guard < 40) {
      guard += 1;
      const t = text();
      if (/Statement of Results/.test(t)) break;
      const begin = view.querySelectorAll('button').find((b) => /^(Begin|See my results)$/.test(b.textContent.trim()) && !b.disabled);
      if (begin) { begin.click(); clock.advance(100); await settle(4); continue; }
      // Autoevaluacion de Speaking: una opcion por criterio.
      const scale = view.querySelectorAll('.scale-block');
      if (scale.length && /How did you speak/.test(t)) {
        for (const block of scale) block.querySelector('.chat-option')?.click();
        continue;
      }
      // Una parte del examen: se juega con el nino de mentira.
      const part = view.querySelector('.mock-shell');
      if (!part) { problems.push(`el simulacro se queda en una pantalla inesperada: ${t.slice(0, 80)}`); break; }
      const label = view.querySelector('.mock-bar__part')?.textContent ?? '';
      const paper = view.querySelector('.mock-bar__paper')?.textContent ?? '';
      const outcome = await playToEnd(part, {
        clock, rng: browser.random, stepMs: 1200, maxSteps: 700,
        done: () => !view.querySelector('.mock-shell') || view.querySelector('.mock-bar__part')?.textContent !== label
          || view.querySelector('.mock-bar__paper')?.textContent !== paper,
      });
      if (!outcome.ok) { problems.push(`simulacro, ${paper} ${label}: ${outcome.reason}`); break; }
    }
    const t = text();
    if (!/Statement of Results/.test(t)) problems.push('el simulacro entero no llega al Statement of Results');
    else {
      if (/clock ran out/.test(t)) problems.push('en el simulacro jugado a buen ritmo se acaba el reloj');
      // Las pruebas enteras suman 25 y 39 y se convierten con la tabla de
      // Cambridge: el Statement dice desde cuanto son los 5 escudos.
      if (!/5 shields start at 21 of 25/.test(t) || !/5 shields start at 33 of 39/.test(t)) {
        problems.push('el Statement of Results no dice lo que falta para los 5 escudos con la tabla de Cambridge (o las pruebas no suman 25 y 39)');
      }
      const saved = state.get().mocks ?? [];
      if (saved.length !== 1) problems.push(`el simulacro terminado no se guarda en el perfil (${saved.length})`);
    }
  }

  // Un simulacro de Listening en el que se acaba el reloj.
  await go('#/mock');
  view.querySelectorAll('button').find((b) => /Listening only/.test(b.textContent))?.click();
  await settle(2);
  view.querySelectorAll('button').find((b) => /^Begin$/.test(b.textContent.trim()))?.click();
  await settle(4);
  clock.advance(26 * 60000);
  await settle(4);
  if (!/clock ran out/.test(text())) problems.push('cuando se acaba el reloj del simulacro no se avisa');
  // Lo que no se hizo cuenta cero: la prueba sigue siendo sobre 25.
  if (!/0 of 25 marks/.test(text()) || !/11 more marks for 2 shields, and 21 for 5/.test(text())) {
    problems.push(`con el reloj acabado sin contestar, Listening no sale sobre 25 con lo que falta (${text().slice(0, 160)})`);
  }

  // Salir de un simulacro a medias (tocando "quien juega"): se para entero. Si
  // no, su reloj seguia y al acabarse pintaba sus resultados encima de otra
  // pantalla, y la voz y el modo examen seguian en los juegos de practica.
  const audio = await import('../src/core/audio.js');
  const mocksBefore = (state.get().mocks ?? []).length;
  await go('#/mock');
  view.querySelectorAll('button').find((b) => /Listening only/.test(b.textContent))?.click();
  await settle(2);
  view.querySelectorAll('button').find((b) => /^Begin$/.test(b.textContent.trim()))?.click();
  await settle(4);
  await go('#/who');
  clock.advance(26 * 60000);
  await settle(4);
  if (!/Who is playing/.test(text())) problems.push('un simulacro dejado a medias pinta sus resultados encima de otra pantalla');
  if ((state.get().mocks ?? []).length !== mocksBefore) problems.push('un simulacro dejado a medias se guarda igual');
  if (audio.playsLeft('cualquiera') !== Infinity) problems.push('al dejar el simulacro a medias, los juegos siguen en modo examen');

  // Abrir un juego y volver antes de que cargue: el juego no aparece encima del album.
  // (sin dejar correr las promesas entre medias: el modulo aun no ha llegado)
  window.location.hash = '#/play/respond/animals';
  clock.advance(50);
  window.location.hash = '#/';
  clock.advance(50);
  await settle(6);
  clock.advance(50);
  await settle(4);
  if (window.location.hash !== '#/') problems.push(`volver mientras carga un juego deja la ruta en ${window.location.hash}`);
  else if (view.querySelector('.game-head')) problems.push('un juego que termina de cargar despues de volver se pinta encima del album');

  // El plan del dia se tacha donde toca: terminar el Word gym de otra pagina
  // no tacha las palabras del plan; terminarlo en la pagina del plan, si.
  const { todaysPlan } = await import('../src/engine/plan.js');
  const { emit } = await import('../src/core/events.js');
  const words = todaysPlan()[0];
  const elsewhere = TOPICS.find((t) => `/play/vocab/${t.id}` !== words.route);
  if (words.done) problems.push('las palabras del plan ya estaban tachadas sin jugar el Word gym');
  else if (elsewhere) {
    await go(`#/play/vocab/${elsewhere.id}`);
    emit('practice:done', 'vocab');
    if (todaysPlan()[0].done) problems.push('terminar el Word gym de otra pagina tacha las palabras del plan del dia');
    await go(`#${words.route}`);
    emit('practice:done', 'vocab');
    if (!todaysPlan()[0].done) problems.push('terminar el Word gym de la pagina del plan no tacha las palabras');
  }

  // Ajustes no deja oyentes colgados: al salir, sus oyentes dejan de
  // escuchar, y visitarlos muchas veces no los va sumando.
  const { listenerCount } = await import('../src/core/events.js');
  const heard = ['speech:recognition', 'offline:status', 'offline:install'];
  const count = () => heard.map((n) => listenerCount(n));
  await go('#/settings');
  const onSettings = count();
  await go('#/');
  const afterLeaving = count();
  heard.forEach((n, i) => {
    if (afterLeaving[i] >= onSettings[i]) problems.push(`al salir de Ajustes sigue escuchando "${n}"`);
  });
  for (let i = 0; i < 3; i += 1) { await go('#/settings'); await go('#/'); }
  if (count().join() !== afterLeaving.join()) problems.push(`cada visita a Ajustes deja oyentes colgados (${afterLeaving} -> ${count()})`);

  // Al repintar, el foco del teclado no se pierde: si el boton que lo tenia
  // sigue, vuelve a el; si no, se queda en la zona (y la caja deja de ser
  // enfocable cuando el foco se va).
  const { mount, h } = await import('../src/core/dom.js');
  const zone = document.createElement('div');
  document.body.append(zone);
  const same = h('button', {}, 'Same');
  mount(zone, same, h('button', {}, 'Other'));
  same.focus();
  mount(zone, h('p', {}, 'Repainted'), same);
  if (document.activeElement !== same) problems.push('mount(): el boton con el foco sigue tras repintar pero pierde el foco');
  mount(zone, h('p', {}, 'Gone'));
  if (document.activeElement !== zone) problems.push('mount(): al quitar el boton con el foco, el foco no se queda en su zona');
  const outside = h('button', {}, 'Outside');
  document.body.append(outside);
  outside.focus();
  if (zone.hasAttribute('tabindex')) problems.push('mount(): la zona sigue siendo enfocable cuando el foco ya se fue');
  zone.remove();
  outside.remove();

  // Borrar al nino que esta jugando: nadie juega y la app pregunta quien.
  const ghost = profiles.add('Ghost');
  state.useProfile(ghost.id);
  await go('#/');
  profiles.remove(ghost.id);
  if (state.activeProfile() === ghost.id) state.useProfile(null);
  await go('#/topic/animals');
  if (window.location.hash !== '#/who') problems.push('tras borrar al nino que jugaba, la app no pregunta quien juega');
  if (state.activeProfile() === ghost.id) problems.push('tras borrar al nino que jugaba, su album sigue cargado');
  // Y si "quien juega" y el album cargado no coinciden, se ponen de acuerdo.
  const robot = profiles.list().find((p) => p.name === 'Robot');
  if (robot) {
    profiles.select(robot.id);
    state.useProfile(null);
    await go('#/topic/school');
    if (state.activeProfile() !== robot.id) problems.push('el album cargado no es el de quien juega');
  }

  for (const e of browser.errors().slice(before)) problems.push(`app: error en ${e.where}: ${describe(e.error)}`);
  return { problems, screens };
}
