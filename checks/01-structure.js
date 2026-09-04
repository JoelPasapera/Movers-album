import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';

const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const full = join(dir, name);
  return statSync(full).isDirectory() ? walk(full) : [full];
});

export const name = 'Estructura del codigo';

export function run() {
  const files = walk('src').filter((f) => f.endsWith('.js'));
  const problems = [];

  for (const file of files) {
    const src = readFileSync(file, 'utf8');
    const body = src.replace(/^import .*?;$/gms, '');

    for (const m of src.matchAll(/from\s+'([^']+)'/g)) {
      const spec = m[1];
      if (!spec.startsWith('.')) continue;
      try {
        statSync(resolve(dirname(file), spec));
      } catch {
        problems.push(`${file}: importa "${spec}" y ese archivo no existe`);
      }
    }

    for (const m of src.matchAll(/import\s*\{([^}]+)\}\s*from/g)) {
      for (const raw of m[1].split(',')) {
        const named = raw.trim().split(' as ').pop().trim();
        if (!named) continue;
        if (!new RegExp(`\\b${named.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(body)) {
          problems.push(`${file}: importa "${named}" y no lo usa`);
        }
      }
    }

    if (src.includes('console.log')) problems.push(`${file}: tiene un console.log olvidado`);
    if (/localStorage\./.test(src) && !file.includes('core/')) {
      problems.push(`${file}: toca localStorage fuera de core/`);
    }
  }

  const html = readFileSync('index.html', 'utf8');
  if (/https?:\/\//.test(html)) {
    problems.push('index.html hace una peticion externa: la web deja de funcionar sin internet');
  }

  return {
    ok: problems.length === 0,
    detail: `${files.length} archivos`,
    problems,
  };
}
