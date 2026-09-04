const ARTICLES = ['a', 'an', 'the', 'some'];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const normalise = (value) => String(value)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .replace(/\s+/g, ' ')
  .trim();

function split(text) {
  const parts = normalise(text).split(' ');
  if (parts.length > 1 && ARTICLES.includes(parts[0])) {
    return { article: parts[0], noun: parts.slice(1).join(' ') };
  }
  return { article: '', noun: parts.join(' ') };
}

function distance(a, b) {
  const rows = a.length + 1;
  const cols = b.length + 1;
  let prev = Array.from({ length: cols }, (unused, i) => i);
  for (let i = 1; i < rows; i += 1) {
    const curr = [i];
    for (let j = 1; j < cols; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[cols - 1];
}

// Un banco de 8 palabras sirve para las 5 definiciones, igual que en el examen:
// tres opciones sobran y el alumno tiene que descartarlas.
export function buildRound(topicDefs, allDefs, { questions = 5, bankSize = 8 } = {}) {
  const local = shuffle(topicDefs);
  if (!local.length) return null;

  const bank = local.slice(0, bankSize);
  if (bank.length < bankSize) {
    const extra = shuffle(allDefs.filter((d) => !bank.some((b) => b.id === d.id)));
    while (bank.length < bankSize && extra.length) bank.push(extra.pop());
  }

  const picked = shuffle(bank).slice(0, Math.min(questions, bank.length));
  return {
    bank: shuffle(bank),
    questions: picked.map((entry) => ({ ...entry })),
  };
}

export function checkAnswer(question, value) {
  const typed = normalise(value);
  const answer = normalise(question.answer);
  if (!typed) return { kind: 'empty' };
  if (typed === answer) return { kind: 'correct' };

  const got = split(typed);
  const want = split(answer);

  if (got.noun === want.noun) {
    return { kind: got.article ? 'wrong-article' : 'missing-article', want, got };
  }
  if (distance(got.noun, want.noun) <= 2) {
    return { kind: 'spelling', want, got };
  }
  return { kind: 'wrong-word', want, got };
}

export function feedbackFor(result, question) {
  switch (result.kind) {
    case 'correct':
      return 'Perfect!';
    case 'missing-article':
      return `So close. You need the "${result.want.article}": ${question.answer}`;
    case 'wrong-article':
      if (!result.want.article) {
        return `No "${result.got.article}" here. Just write: ${question.answer}`;
      }
      return `Almost. It\u2019s "${result.want.article}", not "${result.got.article}": ${question.answer}`;
    case 'spelling':
      return `Right word, wrong spelling: ${question.answer}`;
    default:
      return `That was another one. It was ${question.answer}`;
  }
}
