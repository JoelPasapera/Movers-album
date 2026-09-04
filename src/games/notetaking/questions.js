const clean = (value) => String(value)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .replace(/[.,!?]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

function distance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (unused, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    prev = curr;
  }
  return prev[b.length];
}

const WRITTEN = {
  one: '1', two: '2', three: '3', four: '4', five: '5', six: '6', seven: '7',
  eight: '8', nine: '9', ten: '10', eleven: '11', twelve: '12', thirteen: '13',
  fourteen: '14', fifteen: '15', sixteen: '16', seventeen: '17', eighteen: '18',
  nineteen: '19', twenty: '20',
};

export function checkRow(row, value) {
  const typed = clean(value);
  if (!typed) return { kind: 'empty' };
  const target = clean(row.answer);

  if (row.kind === 'number') {
    const digits = typed.replace(/[^0-9]/g, '');
    if (digits === target) return { kind: 'correct' };
    // El handbook recomienda escribir los numeros en cifras.
    if (WRITTEN[typed] === target) return { kind: 'writtenNumber' };
    return { kind: 'wrong' };
  }

  if (typed === target) return { kind: 'correct' };
  if (typed.replace(/^the\s+/, '') === target.replace(/^the\s+/, '')) return { kind: 'correct' };

  // Si el nombre se deletrea en la grabacion, la ortografia debe ser exacta.
  if (row.spelled) return { kind: 'spelledWrong' };

  if (distance(typed, target) <= 1) return { kind: 'closeEnough' };
  return { kind: 'wrong' };
}

export function feedbackFor(result, row) {
  switch (result.kind) {
    case 'correct':
      return 'Yes, that is it.';
    case 'closeEnough':
      return `That counts. The word is "${row.answer}".`;
    case 'writtenNumber':
      return `That counts, but write numbers with digits next time: ${row.answer}. `
        + 'Digits cannot be misspelled.';
    case 'spelledWrong':
      return `They spelled it for you: ${row.answer.toUpperCase().split('').join('-')}. `
        + 'Spelled names must be perfect.';
    default:
      return `It was "${row.answer}".`;
  }
}

// El handbook admite el numero escrito en letra; solo recomienda cifras
// para no perder el punto por una falta de ortografia.
export const marksFor = (result) => (
  result.kind === 'correct'
  || result.kind === 'closeEnough'
  || result.kind === 'writtenNumber' ? 1 : 0);

export function buildRound(form) {
  return {
    id: form.id,
    title: form.title,
    intro: form.intro,
    rows: form.rows,
    questions: form.rows.filter((r) => !r.example),
  };
}
