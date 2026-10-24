// Numeros en letra. El syllabus exige: 1-20 en Starters, 21-100 y ordinales
// del 1st al 20th en Movers. Se generan, no se escriben a mano.

const ONES = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine',
  'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
const ORDINALS = ['', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
  'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth',
  'seventeenth', 'eighteenth', 'nineteenth', 'twentieth'];

export function toWords(n) {
  if (n < 20) return ONES[n];
  if (n === 100) return 'one hundred';
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  return ones ? `${TENS[tens]}-${ONES[ones]}` : TENS[tens];
}

export const ordinalWord = (n) => ORDINALS[n] ?? '';

export function ordinalDigits(n) {
  const rest = n % 100;
  if (rest >= 11 && rest <= 13) return `${n}th`;
  const last = n % 10;
  return `${n}${last === 1 ? 'st' : last === 2 ? 'nd' : last === 3 ? 'rd' : 'th'}`;
}

export const CARDINAL_RANGE = [21, 100];
export const ORDINAL_RANGE = [1, 20];
