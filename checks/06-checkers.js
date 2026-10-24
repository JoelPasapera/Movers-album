import { checkAnswer as spellCheck } from '../src/games/spellit/questions.js';
import { DEFINITIONS } from '../src/data/definitions.js';
import { checkAnswer as readCheck } from '../src/games/readstory/questions.js';
import { READING_STORIES } from '../src/data/reading-stories.js';
import { checkClosed, checkFree } from '../src/games/writeit/checker.js';
import { PART6_SCENES } from '../src/data/scenes/part6.js';
import { checkRow, marksFor } from '../src/games/notetaking/questions.js';
import { NOTE_FORMS } from '../src/data/notes.js';
import { checkAnswer as talkCheck } from '../src/games/talkabout/questions.js';
import { PERSONAL_QUESTIONS } from '../src/data/personal-questions.js';
import { checkSentence, gradeTelling, keyWords } from '../src/games/story/questions.js';
import { STORIES } from '../src/data/stories.js';
import { buildRound as tick, isCorrect as tickOk } from '../src/games/tickbox/questions.js';
import { DIALOGUES } from '../src/data/dialogues.js';
import { CLOZE_TEXTS } from '../src/data/cloze.js';
import { GAP_STORIES } from '../src/data/gap-stories.js';

export const name = 'Los correctores aceptan lo correcto y rechazan lo falso';

export function run() {
  const problems = [];

  for (const [topic, list] of Object.entries(DEFINITIONS)) {
    for (const d of list) {
      if (spellCheck(d, d.answer).kind !== 'correct') {
        problems.push(`Spell it rechaza su propia respuesta: "${d.answer}" (${topic})`);
      }
      if (spellCheck(d, 'zzqq').kind === 'correct') problems.push('Spell it acepta cualquier cosa');
    }
  }

  for (const s of READING_STORIES) {
    const body = s.sections.map((x) => x.text).join(' ').toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    for (const q of s.questions) {
      if (readCheck(q, q.answers[0]).kind !== 'correct') {
        problems.push(`Read and answer rechaza "${q.answers[0]}"`);
      }
      if (q.answers[0].split(' ').length > 3) {
        problems.push(`Read and answer pide mas de 3 palabras: "${q.answers[0]}"`);
      }
      const first = q.answers[0].toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').replace(/[!.]/g, '').split(' ')[0];
      if (!body.includes(first)) {
        problems.push(`la respuesta "${q.answers[0]}" no aparece en el texto de "${s.title}"`);
      }
    }
  }

  for (const sc of PART6_SCENES) {
    const marks = sc.prompts.reduce((a, p) => a + p.marks, 0);
    if (marks !== 10) problems.push(`la escena "${sc.title}" suma ${marks} puntos y deben ser 10`);
    if (sc.prompts.filter((p) => p.kind === 'free').length !== 2) {
      problems.push(`la escena "${sc.title}" no pide 2 frases libres`);
    }
    for (const p of sc.prompts.filter((x) => x.kind !== 'free')) {
      for (const a of p.answers) {
        if (checkClosed(p, a).marks !== p.marks) problems.push(`Parte 6 rechaza "${a}"`);
      }
    }
    for (const e of sc.entities.filter((x) => x.colours.length)) {
      const truth = checkFree(sc, `The ${e.noun} is ${e.colours[0]}.`);
      if (truth.marks !== 2) problems.push(`Parte 6 no da 2 puntos a "The ${e.noun} is ${e.colours[0]}"`);
      const lie = checkFree(sc, `The ${e.noun} is ${e.colours.includes('pink') ? 'brown' : 'pink'}.`);
      if (lie.marks === 2) problems.push(`Parte 6 da 2 puntos a una mentira sobre "${e.noun}"`);
    }
    if (checkFree(sc, 'I like pizza very much.').marks !== 0) {
      problems.push('Parte 6 acepta una palabra fuera del syllabus');
    }
  }

  for (const f of NOTE_FORMS) {
    for (const row of f.rows.filter((r) => !r.example)) {
      if (marksFor(checkRow(row, row.answer)) !== 1) {
        problems.push(`Listen and write rechaza "${row.answer}"`);
      }
      if (row.spelled && marksFor(checkRow(row, `${row.answer}x`)) === 1) {
        problems.push(`Listen and write perdona una falta en un nombre deletreado (${row.answer})`);
      }
    }
    if (f.rows.filter((r) => r.spelled).length !== 1) {
      problems.push(`el formulario "${f.title}" no tiene un nombre deletreado`);
    }
  }

  for (const q of PERSONAL_QUESTIONS) {
    if (talkCheck(q, q.model).marks !== 2) {
      problems.push(`Talk about you no da 2 puntos a su respuesta modelo: "${q.model}"`);
    }
    if (talkCheck(q, '').marks !== 0) problems.push('Talk about you puntua el silencio');
  }

  for (const s of STORIES) {
    for (const p of s.panels.filter((x) => !x.given)) {
      const target = p.sentence.replace(/\.$/, '').split(' ');
      if (!checkSentence({ target }, target)) problems.push(`Tell the story rechaza "${p.sentence}"`);
      if (checkSentence({ target }, [...target].reverse()) && target.length > 2) {
        problems.push(`Tell the story acepta el orden al reves: "${p.sentence}"`);
      }
    }
  }

  for (const d of DIALOGUES) {
    if (d.turns.length !== 6) problems.push(`el dialogo "${d.title}" no tiene 6 turnos`);
    for (const t of d.turns) {
      if (t.options.length !== 3) problems.push(`un turno de "${d.title}" no tiene 3 opciones`);
      if (t.options[t.answer] === undefined) problems.push(`un turno de "${d.title}" apunta a una opcion que no existe`);
      if (!t.why) problems.push(`un turno de "${d.title}" no explica por que`);
    }
  }

  for (const c of CLOZE_TEXTS) {
    if (c.gaps.length !== 5) problems.push(`el texto "${c.title}" no tiene 5 huecos`);
    if (c.parts.length !== c.gaps.length + 1) problems.push(`el texto "${c.title}" tiene los trozos mal partidos`);
    for (const g of c.gaps) {
      if (g.options[g.answer] === undefined) problems.push(`un hueco de "${c.title}" apunta a una opcion inexistente`);
      if (!g.why) problems.push(`un hueco de "${c.title}" no explica la regla`);
    }
  }

  for (const g of GAP_STORIES) {
    if (g.bank.length !== 9) problems.push(`la historia "${g.id}" no tiene 9 palabras en el banco`);
    if (g.answers.length !== 5) problems.push(`la historia "${g.id}" no tiene 5 huecos`);
    if (g.parts.length !== g.answers.length + 1) problems.push(`la historia "${g.id}" tiene los trozos mal partidos`);
    if (!g.answers.every((a) => g.bank.includes(a))) problems.push(`la historia "${g.id}" pide una palabra que no esta en el banco`);
    if (g.titles[g.title] === undefined) problems.push(`la historia "${g.id}" apunta a un titulo inexistente`);
  }

  // Listening parte 4
  for (const q of tick()) {
    if (!tickOk(q, q.answer)) problems.push(`Listen and tick rechaza la respuesta buena de "${q.id}"`);
    if (tickOk(q, q.options.find((o) => o.word !== q.answer).word)) problems.push(`Listen and tick acepta una respuesta mala en "${q.id}"`);
  }

  // Speaking parte 2: contar el dibujo. Silencio 0, algo 1, frase con sentido 2.
  for (const story of STORIES) {
    for (const panel of story.panels.slice(1)) {
      const key = keyWords(panel);
      if (key.length < 2) problems.push(`la vineta "${panel.sentence}" tiene menos de dos palabras clave`);
      if (gradeTelling(panel, '').marks !== 0) problems.push('contar el dibujo puntua el silencio');
      if (gradeTelling(panel, panel.sentence).marks !== 2) problems.push(`la frase modelo "${panel.sentence}" no vale dos puntos`);
      if (gradeTelling(panel, key[0]).marks !== 1) problems.push(`una sola palabra clave de "${panel.sentence}" no vale un punto`);
      // una frase con sentido pero de OTRA cosa: palabras que no estan en la vineta
      const other = ['zebra', 'helicopter', 'piano', 'penguin', 'kangaroo', 'guitar'].filter((w) => !key.includes(w)).slice(0, 3).join(' ');
      if (gradeTelling(panel, `the ${other} is here`).marks !== 1) problems.push(`"${panel.sentence}": una frase de otra cosa vale mas de un punto`);
    }
  }

  return { ok: problems.length === 0, detail: 'respuestas modelo y respuestas falsas', problems };
}
