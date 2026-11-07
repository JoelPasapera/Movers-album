// @ts-check
// Fechas en la hora del aparato, no en la de Greenwich. Con toISOString(),
// en Lima (UTC-5) jugar a las 8 de la tarde contaba como el dia siguiente: la
// racha se rompia sin motivo y el informe salia con fecha de manana.

/** @param {number} n */
const two = (n) => String(n).padStart(2, '0');

/**
 * El dia de hoy (u otro momento) como AAAA-MM-DD, en hora local.
 * @param {number} [ms] milisegundos desde 1970; por defecto, ahora
 */
export function localDate(ms = Date.now()) {
  const d = new Date(ms);
  return `${d.getFullYear()}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** El dia anterior a `date` (AAAA-MM-DD), en hora local. @param {string} date */
export function dayBefore(date) {
  const [y, m, d] = date.split('-').map(Number);
  return localDate(new Date(y, m - 1, d - 1, 12).getTime());
}

/**
 * Numero de dia local (dias desde 1970 contando medianoches locales), para
 * medir distancias en dias sin que el cambio de hora estorbe.
 * @param {number} [ms]
 */
export function localDayNumber(ms = Date.now()) {
  const d = new Date(ms);
  return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
}
