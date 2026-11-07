// @ts-check
// Contenido del dictado de letras y numeros (Listening, parte 2).
//
// En la parte 2 de Listening se deletrea un nombre letra a letra y se dice un
// numero, y los dos tienen que quedar perfectos. Lo que falla ahi no es el
// vocabulario: es el oido. El nombre ingles de muchas letras suena como OTRA
// letra en espanol:
//   - A ("ei") se escribe E; E ("i") se escribe I; I ("ai") se escribe A o Y;
//   - G ("yi") y J ("yei") se cruzan;
//   - B y V suenan igual a un oido hispano;
//   - R, en ingles britanico ("aa"), se escribe A; Y ("wai") se escribe I;
//   - H ("eich"), K ("kei"), Q ("kiu"), U ("yu"), W ("dabliu") y Z ("zed") no
//     se parecen a su nombre en espanol.
// Y en los numeros, thirteen y thirty, fourteen y forty... solo cambia el
// final.
//
// Lo que se deletrea son los nombres del wordlist y las palabras de la pagina
// del album: nada inventado, nada de fuera del syllabus.

import { getTopic } from './topics.js';
import { wordsFor } from './wordlist.js';

/** Las letras que mas se confunden al oido (las de arriba). */
export const TRAP_LETTERS = new Set('AEIGJBVRYHKQUWZ'.split(''));

/**
 * Frases para dictar un numero, con el numero en letra en {n} y los numeros
 * que tienen sentido en cada una (nadie tiene una abuela de 14 anos).
 * @type {{ text: string, min: number, max: number }[]}
 */
export const NUMBER_LINES = [
  { text: 'Open your books at page {n}.', min: 13, max: 100 },
  { text: 'We live at number {n}, Park Street.', min: 13, max: 100 },
  { text: 'Take bus number {n} to the zoo.', min: 13, max: 100 },
  { text: 'The answer is {n}.', min: 13, max: 100 },
  { text: 'There are {n} sheep on the farm.', min: 13, max: 100 },
  { text: 'There are {n} children in the class.', min: 13, max: 35 },
  { text: 'There are {n} ducks on the lake.', min: 13, max: 50 },
  { text: 'There are {n} people at the party.', min: 13, max: 60 },
  { text: 'My grandmother is {n} years old.', min: 55, max: 99 },
  { text: 'My grandfather is {n} years old.', min: 55, max: 99 },
];

/** Una palabra que se puede deletrear: una sola palabra, solo letras, 3 a 7. */
const SPELLABLE = /^[A-Za-z]{3,7}$/;

/** Los nombres del wordlist (Alex, Alice... Zoe). */
export const NAMES = wordsFor('names').map((w) => w.word).filter((w) => SPELLABLE.test(w));

/**
 * Lo que se puede deletrear en una pagina del album: los nombres y las
 * palabras de esa pagina (en la de los nombres, solo nombres).
 * @param {string} [topicId]
 * @returns {{ names: string[], words: string[] }}
 */
export function spellingPool(topicId) {
  const topic = getTopic(topicId);
  const words = topic.id === 'names' ? [] : topic.words
    .map((w) => w.word)
    .filter((w) => SPELLABLE.test(w) && w === w.toLowerCase());
  return { names: NAMES, words: [...new Set(words)] };
}
