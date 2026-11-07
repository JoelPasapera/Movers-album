// @ts-check
import { h, mount as fill } from '../core/dom.js';
import { setExamMode, stop as stopVoice, cue } from '../core/audio.js';
import { getTopic } from '../data/topics.js';
import * as router from '../core/router.js';
import * as state from '../core/state.js';
import { recordShields, practised } from '../engine/progress.js';
import { saveMock } from '../engine/report.js';
import { shieldRow } from './components/rewards.js';
import { shieldsFor, marksToGo, MAX_SHIELDS } from '../engine/scoring.js';
import {
  PAPERS, createRun, currentPaper, currentGameId, gameFor,
  record, advance, timeUp, statement, totalShields, recordScale,
} from '../engine/mock.js';
import { SPEAKING_SCALE } from '../data/speaking-scale.js';
import { recordSelfCheck } from '../engine/speakingScale.js';

let run = null;
let active = null;
let ticker = null;
let deadline = 0;

const clockText = (ms) => {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
};

/** Cambia cada vez que se deja el simulacro: una parte que termina de cargar
 * despues no se monta (seguiria sonando sin verse). */
let generation = 0;

export function unmountMock() {
  generation += 1;
  if (active?.destroy) active.destroy();
  active = null;
  if (ticker) clearInterval(ticker);
  ticker = null;
  setExamMode(false);
  stopVoice();
}

export function renderMock(container) {
  unmountMock();
  run = null;
  intro(container);
}

// ---------- pantalla de inicio ----------

function intro(container) {
  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'mock-intro' }, [
      h('h2', {}, 'Mock test'),
      h('p', { class: 'mock-intro__lead' },
        'This is the whole test, in the same order and with the same clock as the real day.'),
      h('div', { class: 'mock-papers' }, PAPERS.map((paper) => h('div', {
        class: 'mock-paper-card',
      }, [
        h('b', {}, paper.label),
        h('span', {}, paper.timed ? `${paper.minutes} minutes` : 'about 7 minutes'),
        h('span', {}, `${paper.parts.length} parts`),
        h('span', {}, paper.marks
          ? `5 shields from ${marksToGo(/** @type {'listening' | 'reading'} */ (paper.id), 0).fiveAt} of ${paper.marks} marks`
          : '5 shields: the examiner\u2019s scale'),
        h('small', {}, paper.tip),
      ]))),
      h('ul', { class: 'mock-rules' }, [
        h('li', {}, 'You hear every recording twice. There is no third time.'),
        h('li', {}, 'The words on the screen stay hidden.'),
        h('li', {}, 'Nobody tells you if an answer is right until the end, like in the real test.'),
        h('li', {}, 'When the clock runs out, that paper stops. Questions you did not answer get no marks.'),
      ]),
      h('div', { class: 'result__actions' }, [
        h('button', {
          class: 'btn btn--go',
          onClick: () => start(container, PAPERS.map((p) => p.id)),
        }, 'Start the whole test'),
        h('button', {
          class: 'btn',
          onClick: () => start(container, ['listening']),
        }, 'Listening only'),
        h('button', {
          class: 'btn',
          onClick: () => start(container, ['reading']),
        }, 'Reading only'),
        h('button', { class: 'btn btn--ghost', onClick: () => router.go('/') }, 'Back to album'),
      ]),
    ]),
  ]));
}

// ---------- ejecucion ----------

function start(container, paperIds) {
  run = createRun(paperIds);
  setExamMode(true);
  state.touchStreak();
  paperIntro(container);
}

function paperIntro(container) {
  const paper = currentPaper(run);
  if (!paper) return finish(container);
  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'mock-intro' }, [
      h('p', { class: 'mock-step' }, `Paper ${run.paper + 1} of ${run.papers.length}`),
      h('h2', {}, paper.label),
      h('p', { class: 'mock-intro__lead' }, paper.timed
        ? `${paper.parts.length} parts, ${paper.minutes} minutes for all of them.`
        : `${paper.parts.length} parts. Take your time, but keep talking.`),
      h('p', { class: 'spell-tip' }, paper.tip),
      paper.id === 'listening'
        ? h('p', {}, 'Get your coloured pencils ready. You need them in the last part.')
        : null,
      h('div', { class: 'result__actions' },
        h('button', { class: 'btn btn--go', onClick: () => beginPaper(container) }, 'Begin')),
    ]),
  ]));
}

function beginPaper(container) {
  const paper = currentPaper(run);
  run.part = 0;
  if (paper.timed) {
    deadline = Date.now() + paper.minutes * 60000;
    if (ticker) clearInterval(ticker);
    ticker = setInterval(() => tick(container), 500);
  }
  mountPart(container);
}

function tick(container) {
  const left = deadline - Date.now();
  const bar = /** @type {HTMLElement | null} */ (document.querySelector('.mock-clock__fill'));
  const label = document.querySelector('.mock-clock__time');
  const paper = currentPaper(run);
  if (label) label.textContent = clockText(left);
  if (bar && paper) {
    const pct = Math.max(0, (left / (paper.minutes * 60000)) * 100);
    bar.style.width = `${pct}%`;
    bar.style.background = pct < 15 ? 'var(--red)' : pct < 35 ? 'var(--orange)' : 'var(--green)';
  }
  if (left <= 0) {
    clearInterval(ticker);
    ticker = null;
    cue('wrong');
    timeUp(run);
    if (active?.destroy) active.destroy();
    active = null;
    nextPaper(container);
  }
}

function chrome(container, paper) {
  const slot = h('div');
  const clock = paper.timed
    ? h('div', { class: 'mock-clock' }, [
      h('span', { class: 'mock-clock__time' }, `${paper.minutes}:00`),
      h('div', { class: 'mock-clock__bar' }, h('i', { class: 'mock-clock__fill' })),
    ])
    : h('div', { class: 'mock-clock mock-clock--free' }, h('span', {}, 'No clock \u2014 speak calmly'));

  fill(container, h('div', { class: 'mock-shell' }, [
    h('div', { class: 'mock-bar' }, [
      h('span', { class: 'mock-bar__paper' }, paper.label),
      h('span', { class: 'mock-bar__part' }, `part ${run.part + 1} of ${paper.parts.length}`),
      h('div', { class: 'topbar__spacer' }),
      clock,
    ]),
    slot,
  ]));
  return slot;
}

async function mountPart(container) {
  const paper = currentPaper(run);
  const gameId = currentGameId(run);
  const game = gameFor(gameId);
  const slot = chrome(container, paper);

  if (!game?.load) return onPartDone(container, gameId, 0, 0);

  fill(slot, h('div', { class: 'card' }, h('p', {}, 'Loading\u2026')));
  const mine = generation;
  try {
    const module = await game.load();
    if (mine !== generation) return;
    active = module.mount(slot, {
      topicId: getTopic().id,
      exam: true,
      onExit: () => quit(container),
      onFinish: ({ score, total }) => onPartDone(container, gameId, score, total),
    });
  } catch (error) {
    console.error('[mock] part failed', gameId, error);
    onPartDone(container, gameId, 0, 0);
  }
}

function onPartDone(container, gameId, score, total) {
  if (active?.destroy) active.destroy();
  active = null;
  record(run, gameId, score, total);
  const wasSpeaking = currentPaper(run)?.id === 'speaking';
  const step = advance(run);
  const go = () => (step === 'paper' ? nextPaper(container) : finish(container));
  if (step === 'part') return mountPart(container);
  if (wasSpeaking) return selfCheck(container, go);
  return go();
}

// Tras la ultima parte de Speaking, el nino se puntua con los tres criterios
// del examinador. Es lo que decide los escudos de esa prueba, como en el
// examen real, donde no hay aciertos: hay una escala.
function selfCheck(container, next) {
  if (ticker) clearInterval(ticker);
  ticker = null;
  const bands = {};
  const done = h('button', { class: 'btn btn--go', disabled: true }, 'See my results');
  const blocks = SPEAKING_SCALE.map((criterion) => {
    const buttons = criterion.child.map(([band, text]) => h('button', {
      class: 'chat-option',
      'aria-pressed': 'false',
      onClick: (e) => {
        bands[criterion.id] = band;
        for (const b of e.currentTarget.parentNode.children) b.setAttribute('aria-pressed', 'false');
        e.currentTarget.setAttribute('aria-pressed', 'true');
        done.disabled = SPEAKING_SCALE.some((c) => bands[c.id] === undefined);
      },
    }, text));
    return h('div', { class: 'scale-block' }, [
      h('h3', {}, criterion.ask),
      h('div', { class: 'chat-options' }, buttons),
    ]);
  });
  done.addEventListener('click', () => {
    recordScale(run, bands);
    recordSelfCheck(bands, 'mock');
    next();
  });
  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'mock-intro' }, [
      h('p', { class: 'mock-step' }, 'Speaking'),
      h('h2', {}, 'How did you speak?'),
      h('p', { class: 'mock-intro__lead' },
        'The examiner marks three things. Be honest: this is how you get better.'),
      ...blocks,
      h('div', { class: 'result__actions' }, done),
    ]),
  ]));
}

function nextPaper(container) {
  if (ticker) clearInterval(ticker);
  ticker = null;
  if (run.paper >= run.papers.length) return finish(container);
  paperIntro(container);
}

function quit(container) {
  unmountMock();
  renderMock(container);
}

// ---------- Statement of Results ----------

/** "1 more mark", "4 more marks" @param {number} n */
const moreMarks = (n) => `${n} more mark${n === 1 ? '' : 's'}`;

/**
 * Lo que le falta a una prueba entera, con la tabla de Cambridge: las notas
 * para el escudo siguiente y para los 5. Solo si la prueba se puntua con notas
 * y la nota es sobre el total del examen (25 o 39).
 * @param {{ id: string, score: number, total: number, marks: number, scale?: unknown }} paper
 */
function goalLine(paper) {
  if (paper.scale || !paper.marks || paper.total !== paper.marks) return null;
  const go = marksToGo(/** @type {'listening' | 'reading'} */ (paper.id), paper.score);
  const fiveFrom = `5 shields start at ${go.fiveAt} of ${paper.marks}`;
  let text = `${fiveFrom}. Well done!`;
  if (go.nextAt !== null && go.nextAt === go.fiveAt) {
    text = `${moreMarks(go.fiveAt - paper.score)} for 5 shields (${fiveFrom}).`;
  } else if (go.nextAt !== null) {
    text = `${moreMarks(go.nextAt - paper.score)} for ${go.shields + 1} shields, `
      + `and ${go.fiveAt - paper.score} for ${MAX_SHIELDS} (${fiveFrom}).`;
  }
  return h('p', { class: 'statement__goal' }, text);
}

function finish(container) {
  if (ticker) clearInterval(ticker);
  ticker = null;
  setExamMode(false);
  stopVoice();
  cue('finish');

  const papers = statement(run);
  for (const paper of papers) {
    for (const row of paper.rows) {
      // La misma regla que al jugar esa parte suelta (engine/scoring.js).
      if (row.total > 0) recordShields(row.gameId, shieldsFor(row.score, row.total));
    }
  }
  // El Statement of Results se guarda en el perfil: el informe para las
  // familias lo ensena, y el nino ve si mejora de un simulacro al siguiente.
  saveMock(run);
  practised('mock');
  const minutes = Math.round((Date.now() - run.startedAt) / 60000);
  const shields = totalShields(run);

  fill(container, h('div', { class: 'card' }, [
    h('div', { class: 'statement' }, [
      h('p', { class: 'mock-step' }, 'Statement of Results'),
      h('h2', {}, 'Mock test'),
      h('p', { class: 'statement__total' },
        `${shields} shield${shields === 1 ? '' : 's'} out of ${papers.length * 5}`),
      ...papers.map((paper) => h('div', { class: 'statement__paper' }, [
        h('div', { class: 'statement__head' }, [
          h('b', {}, paper.label),
          h('span', {}, paper.scale
            ? `your own check: ${SPEAKING_SCALE.map((c) => `${c.label} ${paper.scale[c.id]}`).join(' \u00b7 ')}`
            : paper.total ? `${paper.score} of ${paper.total} marks` : 'not marked here'),
          shieldRow(paper.shields),
        ]),
        paper.scale
          ? h('p', { class: 'statement__note' },
            `You answered ${paper.score} of ${paper.total} marks. In the real test the examiner uses this scale, not the marks.`)
          : null,
        goalLine(paper),
        paper.ranOut
          ? h('p', { class: 'statement__warn' },
            'The clock ran out before you finished this paper. In the real test those '
            + 'questions would be zero, so work a little faster.')
          : null,
        h('div', { class: 'statement__rows' }, paper.rows.map((row) => h('div', {
          class: `statement__row${row.skipped ? ' is-skipped' : ''}`,
        }, [
          h('span', { class: 'statement__tag' }, row.tag),
          h('span', {}, row.title),
          h('b', {}, row.skipped ? 'not done' : `${row.score}/${row.total}`),
        ]))),
      ])),
      h('p', { class: 'spell-tip' }, minutes
        ? `You took about ${minutes} minute${minutes === 1 ? '' : 's'}.`
        : 'Well done for finishing the whole thing.'),
      h('div', { class: 'result__actions' }, [
        h('button', { class: 'btn btn--go', onClick: () => renderMock(container) }, 'Another mock test'),
        h('button', { class: 'btn', onClick: () => router.go('/') }, 'Back to album'),
      ]),
    ]),
  ]));
}
