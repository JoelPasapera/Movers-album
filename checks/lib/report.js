const GREEN = '\u001b[32m';
const RED = '\u001b[31m';
const YELLOW = '\u001b[33m';
const DIM = '\u001b[2m';
const BOLD = '\u001b[1m';
const OFF = '\u001b[0m';

export function heading(text) {
  console.log(`\n${BOLD}${text}${OFF}`);
  console.log(DIM + '\u2500'.repeat(64) + OFF);
}

export function line(ok, name, detail = '') {
  const mark = ok ? `${GREEN}\u2713${OFF}` : `${RED}\u2717${OFF}`;
  console.log(`  ${mark} ${name}${detail ? `${DIM}  ${detail}${OFF}` : ''}`);
}

export function bullet(text) {
  console.log(`      ${RED}\u2192${OFF} ${text}`);
}

export function note(text) {
  console.log(`      ${YELLOW}!${OFF} ${DIM}${text}${OFF}`);
}

export function summary(passed, failed) {
  console.log('');
  console.log(DIM + '\u2500'.repeat(64) + OFF);
  if (failed === 0) {
    console.log(`${GREEN}${BOLD}  TODO EN VERDE${OFF}  ${passed} comprobaciones pasadas.`);
    console.log(`${DIM}  Se puede seguir construyendo encima sin miedo.${OFF}\n`);
  } else {
    console.log(`${RED}${BOLD}  ${failed} FALLO${failed > 1 ? 'S' : ''}${OFF}  de ${passed + failed} comprobaciones.`);
    console.log(`${DIM}  Arregla lo rojo antes de dar el trabajo por terminado.${OFF}\n`);
  }
}
