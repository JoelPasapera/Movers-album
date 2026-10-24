import { MOVERS_GRAMMAR } from '../src/data/grammar-list.js';
import { contentStrings } from './lib/content.js';

export const name = 'Gramatica oficial de Movers presente en el contenido';

export function run() {
  const all = contentStrings().join(' | ');
  const missing = MOVERS_GRAMMAR.filter((item) => !item.test.test(all));
  return {
    ok: missing.length === 0,
    detail: `${MOVERS_GRAMMAR.length - missing.length} de ${MOVERS_GRAMMAR.length} estructuras`,
    problems: missing.map((item) =>
      `no hay ni una frase con "${item.label}"  \u2014  ejemplo del handbook: ${item.example}`),
    numbers: { estructurasMovers: MOVERS_GRAMMAR.length - missing.length },
  };
}
