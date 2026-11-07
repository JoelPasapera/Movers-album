// @ts-check
// Un examen de practica para imprimir (ruta /print/:seed). Dos cosas en una
// pagina:
//   - el cuadernillo del nino: Listening (5 partes) y Reading and Writing (6),
//     con sus dibujos, lineas para escribir y cajas para marcar;
//   - las hojas del profesor: el guion de Listening y las respuestas.
// Se imprime una cosa u otra con su boton. En pantalla, ademas, se puede poner
// el audio de Listening parte por parte: cada parte suena dos veces, como en
// el examen.
//
// Que va en el examen lo decide engine/printTest.js con la semilla de la
// direccion: la misma direccion es siempre el mismo examen.

import { h, mount as fill } from '../core/dom.js';
import * as router from '../core/router.js';
import { speakLines, stop as stopVoice } from '../core/audio.js';
import { renderCrowd } from '../data/scenes/crowd.js';
import { renderPanel } from '../data/scenes/pieces.js';
import { renderScene } from '../data/scenes/part6.js';
import {
  buildPrintTest, listeningScript, answerKey, parseSeed, newSeed, RUBRICS,
} from '../engine/printTest.js';
import { partIntro } from '../data/print-rubrics.js';
import { shieldTable } from './components/shieldTable.js';

/** @typedef {import('../engine/printTest.js').PrintTest} PrintTest */
/** @typedef {import('../engine/printTest.js').Line} Line */

/** Pausa entre una pregunta y la siguiente al poner el audio (para escribir). */
const PAUSE_MS = 2500;

/** Lo que esta sonando, para pararlo al salir o al pulsar otra parte. */
let player = { stopped: true, cancel: () => {}, timer: /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined) };

/** Para el audio de Listening (al salir de la pantalla, desde main.js). */
export function leavePrint() {
  player.stopped = true;
  clearTimeout(player.timer);
  player.cancel();
  stopVoice();
}

// ------------------------------------------------------------- piezas comunes

/** @param {string} title @param {string} rubric @param {...any} body */
const part = (title, rubric, ...body) => h('section', { class: 'pt-part' }, [
  h('h3', { class: 'pt-part__title' }, title),
  h('p', { class: 'pt-rubric' }, rubric),
  ...body,
]);

/** Una linea para escribir; con texto, el ejemplo ya escrito. @param {string} [written] */
const writeLine = (written = '') => h('span', { class: `pt-line${written ? ' pt-line--example' : ''}` }, written);

/** Una caja para una letra o una marca; con texto, el ejemplo. @param {string} [mark] */
const box = (mark = '') => h('span', { class: `pt-box${mark ? ' pt-box--example' : ''}` }, mark);

/**
 * Un icono del album. Los simbolos de un solo caracter (sol, nube, copo) se
 * imprimen en blanco y negro si no se pide su version en color (U+FE0F).
 * @param {string} icon
 */
const face = (icon) => h('span', { class: 'pt-card__face' }, /^[\u2000-\u2BFF]$/.test(icon) ? `${icon}\uFE0F` : icon);

/** Un dibujo SVG ya hecho (de data/scenes). @param {string} svg @param {string} [cls] */
const art = (svg, cls = '') => h('div', { class: `pt-art ${cls}`, html: svg });

// ------------------------------------------------------------- Listening

/** @param {PrintTest} test */
function listeningPages(test) {
  const { names, form, pictures, ticks, scene } = test.listening;
  const example = names.example;
  const half = Math.ceil(names.names.length / 2);
  const nameChip = (/** @type {string} */ n) => h('span', { class: `pt-name${n === example.name ? ' pt-name--example' : ''}` }, n);

  return h('div', { class: 'pt-section' }, [
    h('h2', { class: 'pt-section__title' }, 'Listening'),
    part('Part 1', RUBRICS.l1,
      h('div', { class: 'pt-names' }, names.names.slice(0, half).map(nameChip)),
      art(renderCrowd(names.people), 'pt-crowd'),
      h('div', { class: 'pt-names' }, names.names.slice(half).map(nameChip))),
    part('Part 2', RUBRICS.l2,
      h('p', { class: 'pt-form-title' }, form.title),
      h('div', { class: 'pt-form' }, form.rows.map((row, i) => h('div', { class: 'pt-form__row' }, [
        h('span', { class: 'pt-num' }, row.example ? '' : String(i)),
        h('span', {}, row.label),
        writeLine(row.example ? row.answer : ''),
      ])))),
    part('Part 3', RUBRICS.l3,
      h('div', { class: 'pt-match' }, [
        h('div', { class: 'pt-match__left' }, [
          h('p', { class: 'pt-small' }, pictures.leftLabel),
          ...[pictures.example, ...pictures.questions].map((q, i) => h('div', { class: 'pt-match__row' }, [
            h('span', {}, q.left),
            box(i === 0 ? q.letter : ''),
          ])),
        ]),
        h('div', { class: 'pt-cards' }, pictures.cards.map((c) => h('div', { class: 'pt-card' }, [
          h('b', {}, c.letter),
          face(c.icon),
        ]))),
      ])),
    part('Part 4', RUBRICS.l4,
      h('ol', { class: 'pt-ticks' }, ticks.map((q) => h('li', {}, [
        h('p', {}, q.question),
        h('div', { class: 'pt-tick-row' }, q.options.map((o) => h('div', { class: 'pt-card pt-card--tick' }, [
          h('b', {}, o.letter),
          face(o.icon),
          h('span', { class: 'pt-card__word' }, o.word),
          box(),
        ]))),
      ])))),
    part('Part 5', RUBRICS.l5, art(scene.svg, 'pt-colour')),
  ]);
}

// ------------------------------------------------------------- Reading and Writing

/** @param {PrintTest} test */
function readingPages(test) {
  const { spell, dialogue, gapStory, cloze, story, picture } = test.reading;
  let gap = 0;
  const numberedGap = () => { gap += 1; return h('span', { class: 'pt-gap' }, [h('b', {}, `(${gap})`), writeLine()]); };

  const r3Text = h('p', { class: 'pt-text' }, gapStory.parts.flatMap((chunk, i) => [chunk, i < gapStory.answers.length ? numberedGap() : null]));
  gap = 0;
  const r4Text = h('p', { class: 'pt-text' }, cloze.parts.flatMap((chunk, i) => [chunk, i < cloze.gaps.length ? numberedGap() : null]));

  return h('div', { class: 'pt-section' }, [
    h('h2', { class: 'pt-section__title' }, 'Reading and Writing'),
    part('Part 1', RUBRICS.r1,
      h('div', { class: 'pt-cards pt-cards--bank' }, spell.bank.map((b) => h('div', { class: 'pt-card' }, [
        face(b.icon),
        h('span', { class: 'pt-card__word' }, b.answer),
      ]))),
      h('ol', { class: 'pt-list' }, spell.questions.map((q) => h('li', {}, [h('span', {}, q.clue), writeLine()])))),
    part('Part 2', RUBRICS.r2,
      h('p', { class: 'pt-form-title' }, dialogue.title),
      h('ol', { class: 'pt-list pt-dialogue' }, dialogue.turns.map((t) => h('li', {}, [
        h('p', {}, [h('b', {}, `${dialogue.speakers[0]}: `), t.line]),
        h('div', { class: 'pt-options' }, [
          h('div', {}, t.options.map((o, i) => h('p', {}, [h('b', {}, `${'ABC'[i]} `), o]))),
          box(),
        ]),
      ])))),
    part('Part 3', RUBRICS.r3,
      h('div', { class: 'pt-cards pt-cards--bank' }, gapStory.bank.map((b) => h('div', { class: 'pt-card' }, [
        b.icon ? face(b.icon) : null,
        h('span', { class: 'pt-card__word' }, b.word),
      ]))),
      r3Text,
      h('p', { class: 'pt-rubric' }, RUBRICS.r3title),
      h('div', { class: 'pt-titles' }, gapStory.titles.map((t) => h('p', {}, [t, box()])))),
    part('Part 4', RUBRICS.r4,
      h('p', { class: 'pt-form-title' }, cloze.title),
      r4Text,
      h('table', { class: 'pt-choices' }, h('tbody', {}, cloze.gaps.map((g, i) => h('tr', {}, [
        h('th', {}, String(i + 1)),
        ...g.options.map((o, j) => h('td', {}, [h('b', {}, `${'ABC'[j]} `), o])),
      ]))))),
    part('Part 5', RUBRICS.r5,
      h('p', { class: 'pt-form-title' }, story.title),
      ...story.sections.map((s) => h('div', { class: 'pt-story' }, [art(renderPanel(s.art), 'pt-panel'), h('p', {}, s.text)])),
      h('ol', { class: 'pt-list' }, story.questions.map((q) => h('li', {}, [h('span', {}, q.text), writeLine()])))),
    part('Part 6', RUBRICS.r6,
      art(renderScene(picture), 'pt-panel pt-panel--big'),
      // Las preguntas y las frases propias llevan una linea entera: la respuesta es larga.
      h('ol', { class: 'pt-list' }, picture.prompts.map((p) => h('li', {}, [
        h('span', {}, p.text),
        p.kind === 'complete' ? writeLine() : h('span', { class: 'pt-line pt-line--full' }),
      ])))),
  ]);
}

// ------------------------------------------------------------- hojas del profesor

/** @param {PrintTest} test */
function teacherPages(test) {
  const script = listeningScript(test);
  return h('div', { class: 'pt-teacher' }, [
    h('h2', { class: 'pt-section__title' }, `Practice test ${test.seed}: teacher’s pages`),
    h('p', {}, 'Give every child the test. Play the Listening from this page (every part plays two times, like in the real test) '
      + 'or read the script aloud two times. Then mark with the answers and write the marks in Class progress, '
      + 'in “Practice tests on paper”.'),
    h('h3', { class: 'pt-part__title' }, 'Listening script'),
    ...script.map((p) => h('div', { class: 'pt-script' }, [
      h('p', {}, h('b', {}, `Part ${p.part}. ${p.rubric}`)),
      ...p.intro.map((l) => h('p', {}, l.text)),
      ...p.items.map((lines, i) => h('div', { class: 'pt-script__item' }, [
        p.part === 4 ? null : h('span', { class: 'pt-small' }, i === 0 && p.part !== 5 ? 'Example' : ''),
        ...lines.map((l) => h('p', {}, [h('b', {}, l.who === 'child' ? 'Child: ' : 'Adult: '), l.text])),
      ])),
    ])),
    h('h3', { class: 'pt-part__title' }, 'Answers'),
    h('div', { class: 'pt-key' }, answerKey(test).map((k) => h('div', { class: 'pt-key__part' }, [
      h('p', {}, h('b', {}, `${k.title} (${k.marks} marks)`)),
      ...k.answers.map((a) => h('p', {}, a)),
    ]))),
    h('p', { class: 'pt-small' }, 'Listening is out of 25 and Reading and Writing out of 39. Spelling must be right in Listening 2 (names) and '
      + 'Reading and Writing 1, 3 and 5. In Part 6 the two sentences of the child get 2 marks each: 1 for a true sentence about the picture '
      + 'and 1 for good English. Small mistakes in other words can be OK, like in the real test.'),
    h('h3', { class: 'pt-part__title' }, 'From marks to shields'),
    shieldTable(),
  ]);
}

// ------------------------------------------------------------- el audio

/**
 * Pone una parte de Listening: la instruccion, todo, "Now listen again", todo
 * otra vez y "That is the end of this part", con una pausa para escribir
 * despues de cada pregunta.
 * @param {{ part: number, rubric: string, intro: Line[], items: Line[][] }} p
 * @param {(playing: boolean) => void} onState
 */
function playPart(p, onState) {
  leavePrint();
  /** @type {Line[][]} */
  const queue = [
    [{ who: 'adult', text: partIntro(p.part, p.rubric) }],
    ...(p.intro.length ? [p.intro] : []),
    ...p.items,
    [{ who: 'adult', text: RUBRICS.again }],
    ...(p.intro.length ? [p.intro] : []),
    ...p.items,
    [{ who: 'adult', text: RUBRICS.end }],
  ];
  const me = { stopped: false, cancel: () => {}, timer: /** @type {ReturnType<typeof setTimeout> | undefined} */ (undefined) };
  player = me;
  let i = 0;
  onState(true);
  const next = () => {
    if (me.stopped) return;
    if (i >= queue.length) { me.stopped = true; onState(false); return; }
    const lines = queue[i];
    i += 1;
    me.cancel = speakLines(lines, { onEnd: () => { me.timer = setTimeout(next, PAUSE_MS); } });
  };
  next();
}

// ------------------------------------------------------------- la pantalla

/**
 * @param {HTMLElement} container
 * @param {string} [seedParam] el numero de la direccion
 */
export function renderPrintTest(container, seedParam) {
  const seed = parseSeed(seedParam);
  if (!seed) {
    router.replace(`/print/${newSeed()}`);
    return;
  }
  leavePrint();
  const test = buildPrintTest(seed);
  const script = listeningScript(test);

  const status = h('span', { class: 'pt-status', 'aria-live': 'polite' });
  const stopBtn = h('button', { class: 'btn', disabled: true, onClick: () => { leavePrint(); setState(false); } }, '■ Stop');
  /** @param {boolean} playing @param {number} [n] */
  function setState(playing, n) {
    stopBtn.disabled = !playing;
    status.textContent = playing ? `Playing part ${n}…` : '';
  }
  /** @param {'pupil' | 'teacher'} what */
  const print = (what) => {
    document.body.dataset.print = what;
    window.print();
  };

  const booklet = h('div', { class: 'pt-pupil' }, [
    h('header', { class: 'pt-cover' }, [
      h('p', { class: 'pt-small' }, `A1 Movers practice · ${seed}`),
      h('p', {}, ['Name: ', writeLine()]),
    ]),
    listeningPages(test),
    readingPages(test),
  ]);

  fill(container, h('div', { class: 'card print-test' }, [
    h('div', { class: 'game-head pt-tools' }, [
      h('button', { class: 'btn', onClick: () => router.go('/teacher') }, '← Class progress'),
      h('h2', {}, 'Practice test on paper'),
      h('div', { class: 'spacer' }),
      h('button', { class: 'btn', onClick: () => router.go(`/print/${newSeed()}`) }, 'Another test'),
      h('button', { class: 'btn', onClick: () => print('teacher') }, 'Print the teacher’s pages'),
      h('button', { class: 'btn btn--go', onClick: () => print('pupil') }, 'Print the test'),
    ]),
    h('div', { class: 'pt-tools pt-player' }, [
      h('p', { class: 'bank-hint' }, `Test number ${seed}: this page always shows the same test, so you can come back to play the Listening. `
        + 'Every part plays two times, with time to write.'),
      h('div', { class: 'pt-player__buttons' }, [
        ...script.map((p) => h('button', {
          class: 'btn',
          'aria-label': `Play Listening part ${p.part}`,
          onClick: () => playPart(p, (playing) => setState(playing, p.part)),
        }, `▶ Part ${p.part}`)),
        stopBtn,
        status,
      ]),
    ]),
    booklet,
    teacherPages(test),
  ]));

  // El ejemplo de la parte 1: su nombre encima de su persona, como en el
  // examen (hace falta el dibujo ya en la pagina para saber donde esta).
  const svg = container.querySelector('.pt-crowd svg');
  const person = svg?.querySelector(`[data-person="${test.listening.names.example.slot}"]`);
  for (const g of svg?.querySelectorAll('[data-person]') ?? []) { g.removeAttribute('tabindex'); g.removeAttribute('role'); }
  const bbox = /** @type {any} */ (person)?.getBBox?.();
  if (person && bbox) {
    const tag = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    tag.setAttribute('class', 'crowd-tag crowd-tag--example');
    tag.setAttribute('text-anchor', 'middle');
    tag.setAttribute('x', String(bbox.x + bbox.width / 2));
    tag.setAttribute('y', String(bbox.y - 8));
    tag.textContent = test.listening.names.example.name;
    person.append(tag);
  }
}
