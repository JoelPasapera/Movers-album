// @ts-check
// En el simulacro no se dice si una respuesta esta bien hasta el final, como
// en el examen de verdad.
//
// Cada parte del examen, cuando juega dentro del simulacro (ctx.exam), apunta
// la respuesta y sigue. Lo unico que ve el nino es lo que el escribio o eligio,
// marcado igual este bien o mal (la clase PICKED). Nada de sonido de acierto o
// fallo, ni avisos de "Yes!", ni colores verde o rojo, ni la nota que va
// sumando, ni la respuesta buena escrita o dicha en voz alta. Al terminar, el
// Statement of Results lo dice todo y los fallos vuelven otro dia en "Fix my
// mistakes".
//
// Aqui solo lo que comparten las quince partes; lo que ensena cada una al
// practicar sigue en su juego.

/**
 * La partida es del simulacro?
 * @param {{ exam?: boolean } | undefined} ctx
 */
export const isQuiet = (ctx) => Boolean(ctx?.exam);

/** Pausa tras contestar en el simulacro: lo justo para ver que se apunto. */
export const QUIET_PAUSE_MS = 600;

/** La marca neutra de "esto es lo que elegiste": la misma este bien o mal. */
export const PICKED = 'is-picked';

/**
 * En el simulacro, la nota que va sumando no se ensena (diria que va bien o
 * mal). Al practicar si.
 * @param {HTMLElement} chip @param {{ exam?: boolean } | undefined} ctx
 */
export function hideScoreInExam(chip, ctx) {
  if (isQuiet(ctx)) chip.classList.add('hidden');
}
