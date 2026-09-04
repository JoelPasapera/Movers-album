import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { heading, line, bullet, note, summary } from './lib/report.js';

const MODULES = [
  './01-structure.js',
  './02-syllabus.js',
  './03-album.js',
  './04-exam.js',
  './05-generators.js',
  './06-checkers.js',
  './07-grammar.js',
  './08-mock.js',
  './09-vocabulary.js',
  './10-classroom.js',
  './11-volume.js',
  './12-scenes.js',
  './13-picturebook.js',
];

const BASELINE = 'checks/baseline.json';
const updating = process.argv.includes('--update-baseline');

console.log('\n\u001b[1m  Mi album Movers \u2014 revision antes de dar por terminado\u001b[0m');

let passed = 0;
let failed = 0;
const numbers = {};

heading('Comprobaciones');

for (const path of MODULES) {
  const mod = await import(path);
  let result;
  try {
    result = mod.run();
  } catch (error) {
    result = { ok: false, problems: [`la comprobacion se rompio: ${error.message}`] };
  }
  line(result.ok, mod.name, result.detail ?? '');
  if (result.ok) passed += 1;
  else {
    failed += 1;
    for (const problem of (result.problems ?? []).slice(0, 12)) bullet(problem);
    if ((result.problems ?? []).length > 12) {
      bullet(`\u2026 y ${result.problems.length - 12} mas`);
    }
  }
  Object.assign(numbers, result.numbers ?? {});
}

// --------- el trinquete: lo que ya se consiguio no puede bajar ---------

heading('Nada ha retrocedido');

const LABELS = {
  paginas: 'paginas del album',
  cromos: 'cromos',
  dibujables: 'cromos con dibujo',
  coberturaWordlist: 'cobertura del wordlist (%)',
  entradasOficiales: 'entradas del wordlist oficial',
  juegos: 'partes del examen cubiertas',
  puntosEscritos: 'puntos escritos del examen cubiertos',
  estructurasMovers: 'estructuras de gramatica de Movers',
  partesEnSimulacro: 'partes encadenadas en el simulacro',
  palabrasEjercitables: 'palabras del wordlist que se pueden practicar',
  tiposDeActividad: 'tipos de actividad del libro de aula',
  piezasDeContenido: 'piezas de contenido',
  escenasDibujadas: 'escenas dibujadas',
  actividadesPictureBook: 'actividades del picture book',
};

if (updating) {
  writeFileSync(BASELINE, `${JSON.stringify(numbers, null, 2)}\n`);
  note('linea base actualizada con los numeros de ahora');
  for (const [key, value] of Object.entries(numbers)) {
    line(true, LABELS[key] ?? key, String(value));
  }
} else if (!existsSync(BASELINE)) {
  note('no hay linea base todavia. Crea una con: npm run check:update');
} else {
  const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
  for (const [key, was] of Object.entries(base)) {
    const now = numbers[key];
    if (now === undefined) {
      failed += 1;
      line(false, LABELS[key] ?? key, 'ya no se mide');
      bullet('alguien ha quitado esta medida. Si fue a proposito, actualiza la linea base.');
      continue;
    }
    const ok = now >= was;
    if (ok) passed += 1;
    else failed += 1;
    line(ok, LABELS[key] ?? key, ok
      ? (now > was ? `${was} \u2192 ${now}  (ha subido)` : `${now}`)
      : `${was} \u2192 ${now}`);
    if (!ok) bullet(`esto ha BAJADO. Algo que ya funcionaba se ha perdido por el camino.`);
  }
}

summary(passed, failed);
process.exit(failed === 0 ? 0 : 1);
