// Preposiciones de tiempo, como en la hoja "A busy day!" del libro de aula:
// at seven o'clock, at night, at the weekend, in the morning, on Monday, y
// before/after entre dos horas. Todo vocabulario de Starters y Movers.

import { toWords } from '../engine/numbers.js';

// Momentos del dia con su preposicion y las actividades que tienen sentido
// a esa hora. Las actividades van en [forma base, tercera persona].
export const TIME_SLOTS = [
  { when: 'night', prep: 'at', activities: [['go to bed', 'goes to bed'], ['sleep', 'sleeps'], ['read a story', 'reads a story']] },
  { when: 'the weekend', prep: 'at', activities: [['play football', 'plays football'], ['go swimming', 'goes swimming'], ['go to the park', 'goes to the park']] },
  { when: 'the morning', prep: 'in', activities: [['get up', 'gets up'], ['have breakfast', 'has breakfast'], ['go to school', 'goes to school']] },
  { when: 'the afternoon', prep: 'in', activities: [['play football', 'plays football'], ['have a music lesson', 'has a music lesson'], ['go to the park', 'goes to the park']] },
  { when: 'the evening', prep: 'in', activities: [['have dinner', 'has dinner'], ['watch TV', 'watches TV'], ['go to bed', 'goes to bed']] },
  ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => ({
    when: day, prep: 'on', activities: [['have a music lesson', 'has a music lesson'], ['play football', 'plays football'], ['go swimming', 'goes swimming']],
  })),
  { when: 'my birthday', prep: 'on', subjects: ['I', 'we'], activities: [['have a party', 'has a party'], ['get a present', 'gets a present']] },
];

// Las horas se manejan como posicion en el dia (7 = siete de la manana,
// 13 = una de la tarde) para poder decir cual va antes; se escriben en punto.
export const hourWords = (position) => `${toWords(position > 12 ? position - 12 : position)} o'clock`;

// Actividades con las horas a las que tienen sentido: nadie desayuna a las dos.
export const HOUR_ACTIVITIES = [
  { activity: ['get up', 'gets up'], hours: [6, 7, 8] },
  { activity: ['have breakfast', 'has breakfast'], hours: [7, 8, 9] },
  { activity: ['go to school', 'goes to school'], hours: [8, 9] },
  { activity: ['have lunch', 'has lunch'], hours: [12, 13] },
  { activity: ['go home', 'goes home'], hours: [15, 16, 17] },
  { activity: ['have dinner', 'has dinner'], hours: [18, 19, 20] },
  { activity: ['go to bed', 'goes to bed'], hours: [20, 21, 22] },
];

export const TIME_SUBJECTS = [['I', 0], ['we', 0], ['they', 0], ['Jim', 1], ['Lily', 1], ['Fred', 1], ['Zoe', 1], ['my brother', 1]];

// Dos horas y una pregunta de antes/despues: "Breakfast is at seven o'clock.
// School is at nine o'clock. School is ___ breakfast." Cada cosa tiene sus
// horas posibles, para que el antes y el despues coincidan con la vida real.
export const EVENTS = [
  { name: 'breakfast', hours: [7, 8, 9] },
  { name: 'school', hours: [8, 9] },
  { name: 'lunch', hours: [12, 13] },
  { name: 'the music lesson', hours: [15, 16, 17] },
  { name: 'the football game', hours: [16, 17, 18] },
  { name: 'the party', hours: [16, 17, 18] },
  { name: 'dinner', hours: [18, 19, 20] },
  { name: 'the film', hours: [19, 20] },
];

const cap = (s) => s[0].toUpperCase() + s.slice(1);

export function slotSentence(subject, person, activity, when) {
  return `${cap(subject)} ${activity[person]} ___ ${when}.`;
}

// `earlier` y `later` ya vienen ordenados por su hora.
export function orderSentence(earlier, later, hourEarlier, hourLater, ask, mentionLaterFirst = false) {
  const intro = mentionLaterFirst
    ? `${cap(later)} is at ${hourLater}. ${cap(earlier)} is at ${hourEarlier}.`
    : `${cap(earlier)} is at ${hourEarlier}. ${cap(later)} is at ${hourLater}.`;
  return ask === 'after' ? `${intro} ${cap(later)} is ___ ${earlier}.` : `${intro} ${cap(earlier)} is ___ ${later}.`;
}

// Todas las frases posibles, para la comprobacion de vocabulario.
export function allSentences() {
  const out = [];
  for (const slot of TIME_SLOTS) {
    for (const activity of slot.activities) {
      for (const [subject, person] of TIME_SUBJECTS) {
        if (slot.subjects && !slot.subjects.includes(subject)) continue;
        out.push(slotSentence(subject, person, activity, slot.when).replace('___', slot.prep));
      }
    }
  }
  for (const { activity, hours } of HOUR_ACTIVITIES) {
    for (const [subject, person] of TIME_SUBJECTS) {
      for (const hour of hours) out.push(slotSentence(subject, person, activity, hourWords(hour)).replace('___', 'at'));
    }
  }
  for (const a of EVENTS) {
    for (const b of EVENTS) {
      if (a === b) continue;
      const [e, l] = [a, b].sort((x, y) => x.hours[0] - y.hours[0]);
      const h1 = hourWords(e.hours[0]);
      const h2 = hourWords(l.hours[l.hours.length - 1]);
      out.push(orderSentence(e.name, l.name, h1, h2, 'after').replace('___', 'after'));
      out.push(orderSentence(e.name, l.name, h1, h2, 'before', true).replace('___', 'before'));
    }
  }
  return out;
}
