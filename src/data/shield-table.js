// @ts-check
// De notas a escudos en A1 Movers: la tabla orientativa de Cambridge para los
// examenes de practica ("Mock test toolkit for young learners", apartado
// "Marking the papers"). Cambridge avisa de que es solo una guia aproximada: en
// el examen de verdad los cortes se fijan para cada examen.
//
// Cambridge publica la tabla como imagen. Estos numeros son los de la
// transcripcion que circula citandola, y cumplen todos los ejemplos que
// Cambridge escribe con palabras en esa misma pagina:
//   - "22/25 for Listening = 5 shields"  -> aqui, 5 escudos desde 21;
//   - "20 for Reading and Writing = 2 shields" -> aqui, 2 escudos de 18 a 23.
// (Sus ejemplos de Starters y Flyers, 9 en Listening = 1 escudo, tambien
// cumplen la tabla de esas pruebas en la misma transcripcion.) La otra tabla
// que circula da 3 escudos por 20 en Reading and Writing, contra el ejemplo de
// Cambridge: por eso no es esta.
//
// Speaking no tiene tabla de notas: lo puntua el examinador con la escala del
// handbook (engine/speakingScale.js).

/**
 * cuts: la nota minima para 2, 3, 4 y 5 escudos (por debajo del primero, 1).
 * @typedef {{ outOf: number, cuts: [number, number, number, number] }} PaperCuts
 */

/** @type {{ listening: PaperCuts, reading: PaperCuts }} */
export const SHIELD_TABLE = {
  listening: { outOf: 25, cuts: [11, 14, 18, 21] },
  reading: { outOf: 39, cuts: [18, 24, 29, 33] },
};

/**
 * Para una parte o un juego, que tienen menos preguntas: los mismos cortes en
 * proporcion. En las dos pruebas caen casi en el mismo sitio (5 escudos desde
 * el 84 %, 4 desde el 73 %, 3 desde el 59 % y 2 desde el 45 %), asi que se usa
 * la media de las dos.
 * @type {number[]}
 */
export const PART_CUTS = [0, 1, 2, 3].map((i) => (
  SHIELD_TABLE.listening.cuts[i] / SHIELD_TABLE.listening.outOf
  + SHIELD_TABLE.reading.cuts[i] / SHIELD_TABLE.reading.outOf
) / 2);
