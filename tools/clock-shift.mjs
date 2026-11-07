// @ts-check
// Para probar la bateria en otro dia y a otra hora sin tocar el reloj del
// aparato. Se carga antes que nada y mueve el reloj de node a SHIFT_TO.
//
//   TZ=America/Lima SHIFT_TO=2026-12-31T23:50:00-05:00 node --import ./tools/clock-shift.mjs checks/run.js
//   TZ=Asia/Tokyo   SHIFT_TO=2028-02-29T08:00:00+09:00 node --import ./tools/clock-shift.mjs checks/run.js
//
// Por que existe: en noviembre de 2026 la comprobacion 21 fallo solo porque
// habia pasado el tiempo (su navegador de prueba tenia el reloj en otro dia que
// el plan). Las fechas locales, el fin de ano, los anos bisiestos y las zonas
// horarias lejanas se prueban asi en un minuto.

const target = Date.parse(process.env.SHIFT_TO ?? '');
if (Number.isNaN(target)) {
  process.stderr.write('clock-shift: falta SHIFT_TO (una fecha ISO con su zona, por ejemplo 2026-12-31T23:50:00-05:00)\n');
} else {
  const RealDate = Date;
  const offset = target - RealDate.now();
  class ShiftedDate extends RealDate {
    /** @param {any[]} args */
    constructor(...args) {
      if (args.length === 0) super(RealDate.now() + offset);
      // @ts-ignore: se pasan tal cual al Date de verdad
      else super(...args);
    }

    static now() { return RealDate.now() + offset; }
  }
  globalThis.Date = /** @type {DateConstructor} */ (/** @type {unknown} */ (ShiftedDate));
}
