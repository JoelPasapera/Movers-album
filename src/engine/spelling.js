// @ts-check
// Comparar letra a letra lo que el nino escribio con la palabra bien escrita.
//
// En el examen la ortografia tiene que ser perfecta, y "mal" no ensena nada:
// lo que ensena es ver QUE letra fallo (la que falta, la que sobra, la que
// esta cambiada, la doble) y escribir la palabra otra vez justo despues. Esto
// es solo la logica; lo que se ve esta en ui/components/spellingFix.js.

/**
 * Una columna de la comparacion: la letra escrita y la de la palabra.
 *   same:    las dos iguales
 *   wrong:   escribio otra letra en ese sitio
 *   missing: falta esa letra de la palabra (typed es '')
 *   extra:   escribio una letra que sobra (answer es '')
 * @typedef {'same' | 'wrong' | 'missing' | 'extra'} SlotKind
 * @typedef {{ typed: string, answer: string, kind: SlotKind }} Slot
 */

/**
 * Como se compara: minusculas, el apostrofo curvo como el recto y los
 * espacios de mas fuera. Las mayusculas no cuentan (en la app nunca cuentan).
 * @param {string} text
 */
export function normaliseSpelling(text) {
  return String(text ?? '')
    .toLowerCase()
    .replace(/’/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * La tabla de la distancia de edicion (cuantas letras hay que cambiar, poner o
 * quitar para pasar de una palabra a otra) entre dos textos.
 * @param {string} a @param {string} b
 * @returns {number[][]}
 */
function editTable(a, b) {
  /** @type {number[][]} */
  const rows = [];
  for (let i = 0; i <= a.length; i += 1) {
    rows.push(new Array(b.length + 1).fill(0));
    rows[i][0] = i;
  }
  for (let j = 0; j <= b.length; j += 1) rows[0][j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    for (let j = 1; j <= b.length; j += 1) {
      const change = a[i - 1] === b[j - 1] ? 0 : 1;
      rows[i][j] = Math.min(
        rows[i - 1][j] + 1,
        rows[i][j - 1] + 1,
        rows[i - 1][j - 1] + change,
      );
    }
  }
  return rows;
}

/**
 * Pone lo escrito debajo de la palabra, columna a columna, con el menor numero
 * de cambios. "libray" frente a "library" da l-i-b-r-a, una r que falta, y.
 * @param {string} typed lo que escribio el nino
 * @param {string} answer la palabra bien escrita
 * @returns {Slot[]}
 */
export function compareSpelling(typed, answer) {
  const a = normaliseSpelling(typed);
  const b = normaliseSpelling(answer);
  const rows = editTable(a, b);
  /** @type {Slot[]} */
  const slots = [];
  let i = a.length;
  let j = b.length;
  // Se recorre la tabla hacia atras. Se prefiere la diagonal (misma letra o
  // letra cambiada) para que las columnas queden como las veria una persona.
  while (i > 0 || j > 0) {
    const here = rows[i][j];
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1] && here === rows[i - 1][j - 1]) {
      slots.push({ typed: a[i - 1], answer: b[j - 1], kind: 'same' });
      i -= 1;
      j -= 1;
    } else if (i > 0 && j > 0 && here === rows[i - 1][j - 1] + 1) {
      slots.push({ typed: a[i - 1], answer: b[j - 1], kind: 'wrong' });
      i -= 1;
      j -= 1;
    } else if (i > 0 && here === rows[i - 1][j] + 1) {
      slots.push({ typed: a[i - 1], answer: '', kind: 'extra' });
      i -= 1;
    } else {
      slots.push({ typed: '', answer: b[j - 1], kind: 'missing' });
      j -= 1;
    }
  }
  return slots.reverse();
}

/** "1 letter", "2 letters" @param {number} n */
const letters = (n) => `${n} letter${n === 1 ? '' : 's'}`;

/**
 * Dos letras seguidas al reves ("freind" por "friend")?
 * @param {string} a @param {string} b
 */
function swapped(a, b) {
  if (a.length !== b.length || a === b) return false;
  const diff = [];
  for (let k = 0; k < a.length; k += 1) if (a[k] !== b[k]) diff.push(k);
  return diff.length === 2 && diff[1] === diff[0] + 1 && a[diff[0]] === b[diff[1]] && a[diff[1]] === b[diff[0]];
}

/**
 * La letra doble de la palabra que el nino escribio sencilla ("hapy" por
 * "happy"), o null.
 * @param {string} a @param {string} b
 * @returns {string | null}
 */
function missedDouble(a, b) {
  for (let k = 0; k + 1 < b.length; k += 1) {
    if (b[k] !== b[k + 1] || !/[a-z]/.test(b[k])) continue;
    if (b.slice(0, k) + b.slice(k + 1) === a) return b[k] + b[k];
  }
  return null;
}

/**
 * Una pista corta, en ingles sencillo, de que tipo de fallo fue. Cadena vacia
 * si esta bien escrita.
 * @param {string} typed @param {string} answer
 */
export function spellingHint(typed, answer) {
  const a = normaliseSpelling(typed);
  const b = normaliseSpelling(answer);
  if (a === b) return '';
  if (!a) return 'Write the word.';
  if (swapped(a, b)) return 'Two letters are the wrong way round.';
  const double = missedDouble(a, b);
  if (double) return `This word has a double letter: ${double}.`;
  // Una doble que la palabra no tiene ("tabble"); si la tiene ("happpy"), es
  // una letra de mas sin mas.
  const extraDouble = missedDouble(b, a);
  if (extraDouble && !b.includes(extraDouble)) return `This word has only one ${extraDouble[0]}.`;
  const slots = compareSpelling(a, b);
  const missing = slots.filter((s) => s.kind === 'missing').length;
  const extra = slots.filter((s) => s.kind === 'extra').length;
  const wrong = slots.filter((s) => s.kind === 'wrong').length;
  const changes = missing + extra + wrong;
  if (changes >= 3 && changes >= b.length / 2) return 'That is a different word. Look at it carefully.';
  if (missing && !extra && !wrong) return `${letters(missing)} ${missing === 1 ? 'is' : 'are'} missing.`;
  if (extra && !missing && !wrong) return `There ${extra === 1 ? 'is 1 letter' : `are ${extra} letters`} too many.`;
  if (wrong === 1 && !missing && !extra) return '1 letter is wrong.';
  return 'Some letters are wrong. Look at the coloured letters.';
}
