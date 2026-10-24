import { TIME_SLOTS, HOUR_ACTIVITIES, TIME_SUBJECTS, EVENTS, hourWords, slotSentence, orderSentence } from '../../data/time-prepositions.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const RULES = {
  at: 'At: hours, night and the weekend.',
  in: 'In: the morning, the afternoon, the evening.',
  on: 'On: days and dates.',
  before: 'Before: the one that comes first.',
  after: 'After: the one that comes later.',
};

const split = (text) => text.split('___');

function slotQuestion() {
  const slot = pick(TIME_SLOTS);
  const [subject, person] = pick(TIME_SUBJECTS.filter(([s]) => !slot.subjects || slot.subjects.includes(s)));
  const text = slotSentence(subject, person, pick(slot.activities), slot.when);
  return { text, answer: slot.prep, options: shuffle(['at', 'in', 'on']) };
}

function hourQuestion() {
  const [subject, person] = pick(TIME_SUBJECTS);
  const { activity, hours } = pick(HOUR_ACTIVITIES);
  const text = slotSentence(subject, person, activity, hourWords(pick(hours)));
  return { text, answer: 'at', options: shuffle(['at', 'in', 'on']) };
}

// Dos cosas a horas distintas de verdad: la que va antes es la de la hora
// mas temprana, no la que se nombra primero. Y como el nino solo ve "seis" y
// "ocho", sin manana ni tarde, se descartan las parejas en que el numero
// engana (la cena a las seis va DESPUES del desayuno a las ocho).
const clock = (position) => (position > 12 ? position - 12 : position);

function orderQuestion() {
  let a; let b; let ha; let hb;
  do {
    [a, b] = shuffle(EVENTS).slice(0, 2);
    ha = pick(a.hours);
    hb = pick(b.hours);
  } while (clock(ha) === clock(hb) || (ha < hb) !== (clock(ha) < clock(hb)));
  const [earlier, later, h1, h2] = ha < hb ? [a, b, ha, hb] : [b, a, hb, ha];
  const ask = pick(['before', 'after']);
  const text = orderSentence(earlier.name, later.name, hourWords(h1), hourWords(h2), ask, Math.random() < 0.5);
  return { text, answer: ask, options: shuffle(['before', 'after', 'at']) };
}

// Ocho frases: momentos del dia, horas en punto y dos de antes/despues.
export function buildRound({ size = 8 } = {}) {
  const makers = [slotQuestion, slotQuestion, hourQuestion, hourQuestion, slotQuestion, hourQuestion, orderQuestion, orderQuestion];
  return shuffle(makers.slice(0, size).map((make) => {
    const q = make();
    const [before, after] = split(q.text);
    return { ...q, before, after, say: q.text.replace('___', q.answer), rule: RULES[q.answer] };
  }));
}

export const isCorrect = (question, value) => value === question.answer;
