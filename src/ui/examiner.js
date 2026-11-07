// @ts-check
// Speaking cara a cara (ruta /examiner): el profesor hace de examinador con un
// nino delante, como en el examen. La tablet entre los dos: los dibujos grandes
// son para el nino; la caja gris, para el profesor (que decir y como suena una
// buena respuesta, con dos botones para apuntar como contesto). Al final se
// pone la nota con la escala del handbook y se guarda en el album del nino.
//
// Que toca en cada parte lo decide engine/examiner.js.

import { h, mount as fill } from '../core/dom.js';
import * as router from '../core/router.js';
import * as profiles from '../core/profiles.js';
import * as state from '../core/state.js';
import { renderScene as renderGarden } from '../data/scenes/garden.js';
import { renderPanel } from '../data/scenes/pieces.js';
import { buildSpeakingTest, examinerScript, EXAMINER } from '../engine/examiner.js';
import { recordTeacherMark, scaleShields, shortBands } from '../engine/speakingScale.js';
import { scalePicker } from './components/scalePicker.js';

/** @typedef {import('../engine/examiner.js').SpeakingTest} SpeakingTest */
/** @typedef {'alone' | 'help'} How */

/** Poco que juzgar: con menos respuestas solas, la pronunciacion tiene tope (handbook). */
const FEW_ANSWERS = 5;

/** @type {ReturnType<typeof setInterval> | undefined} */
let ticking;

/** Para el reloj de la prueba (al salir de la pantalla, desde main.js). */
export function leaveExaminer() {
  clearInterval(ticking);
  ticking = undefined;
}

/** mm:ss @param {number} ms */
const clockText = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** @param {HTMLElement} container */
export function renderExaminer(container) {
  leaveExaminer();
  const list = profiles.list();
  if (!list.length) {
    fill(container, h('div', { class: 'card' }, [
      h('h2', {}, 'No albums yet'),
      h('p', {}, 'Add the children first. Then you can do the speaking test with each of them.'),
      h('div', { class: 'result__actions' }, h('button', { class: 'btn btn--go', onClick: () => router.go('/who') }, 'Add a child')),
    ]));
    return;
  }

  let test = buildSpeakingTest();
  let script = examinerScript(test);
  let childId = list.some((p) => p.id === state.activeProfile()) ? /** @type {string} */ (state.activeProfile()) : list[0].id;
  /** Pantalla: 0 empezar, 1 saludo, 2-5 las partes, 6 la nota. */
  let step = 0;
  /** En la parte 3, que conjunto de dibujos se ve (0 es el ejemplo). */
  let setIndex = 0;
  let startedAt = 0;
  /** Como contesto cada pregunta: "parte-numero" -> alone | help. @type {Map<string, How>} */
  const answers = new Map();

  const nameOf = () => list.find((p) => p.id === childId)?.name ?? '';
  const timer = h('span', { class: 'counter ex-timer', 'aria-label': 'Time' });
  const title = h('h2', {}, 'Speaking test');
  const stage = h('div');

  const head = h('div', { class: 'game-head' }, [
    h('button', { class: 'btn', onClick: () => router.go('/teacher') }, '← Class progress'),
    title,
    h('div', { class: 'spacer' }),
    timer,
  ]);

  function startClock() {
    startedAt = Date.now();
    leaveExaminer();
    timer.textContent = '0:00';
    ticking = setInterval(() => { timer.textContent = clockText(Date.now() - startedAt); }, 1000);
  }

  /** Lo que dice el examinador. @param {string} text */
  const say = (text) => h('p', { class: 'ex-say' }, text);

  /**
   * Una pregunta del guion con sus dos botones: contesto solo o necesito ayuda.
   * @param {string} key @param {{ say: string, listen?: string }} line @param {number} n
   */
  function item(key, line, n) {
    const mark = (/** @type {How} */ how) => {
      if (answers.get(key) === how) answers.delete(key); else answers.set(key, how);
      paint();
    };
    const now = answers.get(key);
    return h('li', { class: 'ex-item' }, [
      h('div', {}, [
        line.say ? say(line.say) : null,
        line.listen ? h('p', { class: 'ex-listen' }, [h('b', {}, 'Listen for: '), line.listen]) : null,
      ]),
      h('div', { class: 'ex-marks' }, [
        h('button', {
          class: 'btn btn--ghost ex-mark', 'aria-pressed': String(now === 'alone'), 'aria-label': `Question ${n}: answered alone`,
          onClick: () => mark('alone'),
        }, '✓ Alone'),
        h('button', {
          class: 'btn btn--ghost ex-mark', 'aria-pressed': String(now === 'help'), 'aria-label': `Question ${n}: needed help`,
          onClick: () => mark('help'),
        }, 'Needed help'),
      ]),
    ]);
  }

  /** La caja gris: lo que es solo para el profesor. @param {...any} body */
  const card = (...body) => h('div', { class: 'ex-card' }, [h('p', { class: 'ex-card__label' }, 'For the teacher'), ...body]);

  /**
   * Los dibujos del nino y la caja del profesor: uno al lado del otro en una
   * pantalla ancha (asi se ven los dos sin bajar), uno encima del otro en un
   * movil.
   * @param {HTMLElement | null} picture @param {HTMLElement} teacherCard
   */
  const layout = (picture, teacherCard) => h('div', { class: 'ex-layout' }, [picture, teacherCard]);

  /** Los botones de abajo. @param {string} nextLabel */
  const nav = (nextLabel) => h('div', { class: 'result__actions' }, [
    h('button', { class: 'btn', onClick: back }, '← Back'),
    h('button', { class: 'btn btn--go', onClick: forward }, nextLabel),
  ]);

  function back() {
    if (step === 4 && setIndex > 0) setIndex -= 1;
    else step = Math.max(1, step - 1);
    paint();
  }

  function forward() {
    if (step === 4 && setIndex < test.sets.length - 1) setIndex += 1;
    else step += 1;
    paint();
  }

  // ---------------------------------------------------------- pantallas

  function startScreen() {
    const who = h('select', { class: 'teacher-select', 'aria-label': 'Child' }, list.map((p) => h('option', { value: p.id }, p.name)));
    who.value = childId;
    who.addEventListener('change', () => { childId = who.value; });
    return h('div', { class: 'ex-start' }, [
      h('p', {}, 'Do the speaking part of the test face to face, like the examiner. Sit next to the child with the tablet between you.'),
      h('ul', { class: 'ex-tips' }, [
        h('li', {}, 'The big pictures are for the child. The grey box is for you: what to say, and what a good answer sounds like.'),
        h('li', {}, 'It takes 5 to 7 minutes. Smile and be friendly. If the child says nothing, say it again or point to the picture.'),
        h('li', {}, 'Tap “✓ Alone” or “Needed help” after each answer. It helps you to mark at the end.'),
        h('li', {}, 'At the end you mark with the Cambridge scale, and the mark goes to the child’s album and report.'),
      ]),
      h('label', { class: 'scale-who' }, ['Child: ', who]),
      h('div', { class: 'result__actions' }, h('button', {
        class: 'btn btn--go',
        onClick: () => { step = 1; setIndex = 0; answers.clear(); startClock(); paint(); },
      }, 'Start the test')),
    ]);
  }

  function helloScreen() {
    return [
      layout(
        h('div', { class: 'ex-child ex-child--hello' }, h('span', { 'aria-hidden': 'true' }, '\u{1F44B}')),
        card(say(EXAMINER.hello), say(EXAMINER.age), h('p', { class: 'ex-listen' }, 'This is not marked. It helps the child to feel happy.')),
      ),
      nav('Part 1 →'),
    ];
  }

  /** @param {number} part 1-4 */
  function partScreen(part) {
    const s = script[part - 1];
    const lines = s.lines.map((line, i) => item(`${part}-${i}`, line, i + 1));
    let picture = null;
    let teacher = null;
    if (part === 1) {
      picture = h('div', { class: 'ex-child', html: renderGarden(/** @type {Record<string, string>} */ (test.differences.right)) });
      teacher = h('details', { class: 'ex-mine' }, [
        h('summary', {}, 'My picture (only for you)'),
        h('div', { html: renderGarden(/** @type {Record<string, string>} */ (test.differences.left)) }),
      ]);
    }
    if (part === 2) {
      picture = h('div', { class: 'ex-child ex-panels' }, test.story.panels.map((p, i) => h('div', { class: 'ex-panel' }, [
        h('b', {}, String(i + 1)),
        h('div', { html: renderPanel(p.art) }),
      ])));
    }
    if (part === 3) {
      const set = test.sets[setIndex];
      picture = h('div', { class: 'ex-child ex-icons' }, set.items.map((it) => h('span', { class: 'ex-icon' }, it.icon)));
      const body = setIndex === 0
        ? [...s.intro.map((l) => say(l.say)), h('p', { class: 'ex-listen' }, 'This one is the example: you say it.')]
        : [h('ol', { class: 'ex-items', start: String(setIndex) }, lines[setIndex - 1])];
      return [
        h('p', { class: 'ex-part' }, `Part 3 of 4 · ${s.title} · pictures ${setIndex + 1} of ${test.sets.length}`),
        layout(picture, card(...body)),
        nav(setIndex < test.sets.length - 1 ? 'Next pictures →' : 'Part 4 →'),
      ];
    }
    if (part === 4) picture = h('div', { class: 'ex-child ex-child--hello' }, h('span', { 'aria-hidden': 'true' }, '\u{1F4AC}'));
    return [
      h('p', { class: 'ex-part' }, `Part ${part} of 4 · ${s.title}`),
      layout(picture, card(
        ...s.intro.map((l) => say(l.say)),
        part === 2 ? h('p', { class: 'ex-listen' }, 'The child tells pictures 2, 3 and 4. A good story sounds like this:') : null,
        h('ol', { class: 'ex-items' }, lines),
        teacher,
        part === 4 ? say(EXAMINER.bye) : null,
      )),
      nav(part === 4 ? 'Mark the test →' : `Part ${part + 1} →`),
    ];
  }

  function markScreen() {
    const alone = [...answers.values()].filter((v) => v === 'alone').length;
    const help = [...answers.values()].filter((v) => v === 'help').length;
    const total = script.reduce((a, s) => a + s.lines.length, 0);
    const note = h('input', {
      class: 'teacher-note', type: 'text', maxlength: '200', value: 'Speaking test, face to face', 'aria-label': 'Note',
    });
    const save = h('button', { class: 'btn btn--go', disabled: true }, 'Save the mark');
    const picker = scalePicker({ onChange: (complete) => { save.disabled = !complete; } });
    const result = h('div', { 'aria-live': 'polite' });
    save.addEventListener('click', () => {
      const bands = picker.bands();
      const active = state.activeProfile();
      state.useProfile(childId);
      recordTeacherMark(bands, note.value);
      state.useProfile(active);
      leaveExaminer();
      fill(result, h('div', { class: 'result' }, [
        h('h2', {}, `${nameOf()}: ${scaleShields(bands)} shields`),
        h('p', {}, `Saved: ${shortBands(bands)}. You can see it in Class progress and in the report.`),
        h('div', { class: 'result__actions' }, [
          h('button', { class: 'btn btn--go', onClick: () => { test = buildSpeakingTest(); script = examinerScript(test); step = 0; paint(); } }, 'Another child'),
          h('button', { class: 'btn', onClick: () => router.go('/teacher') }, 'Back to Class progress'),
        ]),
      ]));
      save.disabled = true;
    });
    return [
      h('p', { class: 'ex-part' }, `Mark ${nameOf()} · ${timer.textContent || '0:00'}`),
      h('p', {}, `Answered alone: ${alone} of ${total} · needed help: ${help}.`),
      alone < FEW_ANSWERS
        ? h('p', { class: 'spell-tip' }, 'The child said very little. With so little language, pronunciation gets 3 at most.')
        : null,
      picker.element,
      note,
      h('div', { class: 'result__actions' }, [h('button', { class: 'btn', onClick: back }, '← Back'), save]),
      result,
    ];
  }

  function paint() {
    title.textContent = step === 0 ? 'Speaking test' : `Speaking test · ${nameOf()}`;
    if (step === 0) fill(stage, startScreen());
    else if (step === 1) fill(stage, ...helloScreen());
    else if (step <= 5) fill(stage, ...partScreen(step - 1));
    else fill(stage, ...markScreen());
  }

  fill(container, h('div', { class: 'card examiner' }, [head, stage]));
  paint();
}
