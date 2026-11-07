// @ts-check
// "Let's talk!" sobre una escena de la Parte 6: cuatro preguntas (color,
// sitio, que hace, si te gusta) con su respuesta modelo. Aqui solo se preparan;
// la pantalla la pinta index.js. Se generan del modelo de la escena, asi que la
// respuesta se puede comprobar.

import {
  isPerson, theNoun, beOf, colourSubject, colourBe, doingOf, capital,
} from '../../data/scenes/part6.js';

/** @template T @param {T[]} arr @returns {T} */
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

/**
 * Las preguntas y las respuestas modelo suenan a ingles de verdad: de una
 * persona se pregunta el color de su camiseta, lo que hay varias veces va en
 * plural y lo que hace lleva su complemento ("flying a kite").
 * @param {any} scene
 * @returns {{ say: string, expect: string[], model: string }[]}
 */
export function questionsFor(scene) {
  /** @type {any[]} */
  const entities = scene.entities;
  const coloured = entities.filter((e) => e.colours.length);
  const placed = entities.filter((e) => e.place && e.place !== 'here');
  const acting = entities.filter((e) => e.action);
  const out = [];
  const c1 = pick(coloured);
  out.push({
    say: `What colour ${colourBe(c1)} ${colourSubject(c1)}?`,
    expect: c1.colours,
    model: `${capital(colourSubject(c1))} ${colourBe(c1)} ${c1.colours.join(' and ')}.`,
  });
  const p1 = pick(placed);
  out.push({
    say: `Where ${beOf(p1)} ${theNoun(p1)}?`,
    expect: p1.place.split(' '),
    model: `${capital(theNoun(p1))} ${beOf(p1)} ${p1.place}.`,
  });
  if (acting.length) {
    const a1 = pick(acting);
    out.push({
      say: `What ${beOf(a1)} ${theNoun(a1)} doing?`,
      expect: [a1.action],
      model: `${capital(theNoun(a1))} ${beOf(a1)} ${doingOf(a1)}.`,
    });
  }
  // "Do you like the boy? ... because it is green" no se puede decir de una
  // persona: se pregunta por las cosas y los animales.
  const things = coloured.filter((e) => !isPerson(e));
  const c2 = pick(things.filter((e) => e !== c1)) ?? things[0] ?? c1;
  out.push({
    say: `Do you like ${theNoun(c2)}? Why?`,
    expect: ['yes', 'no', 'because'],
    model: `Yes, I like ${theNoun(c2)} because ${c2.plural ? 'they are' : 'it is'} ${c2.colours.join(' and ')}.`,
  });
  return out.slice(0, 4);
}
