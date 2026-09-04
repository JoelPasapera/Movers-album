const clean = (value) => String(value)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .replace(/[.,!?]/g, '')
  .replace(/\s+/g, ' ')
  .trim();

const stripArticle = (value) => value.replace(/^(a|an|the)\s+/, '');

function distance(a, b) {
  let prev = Array.from({ length: b.length + 1 }, (unused, i) => i);
  for (let i = 1; i <= a.length; i += 1) {
    const curr = [i];
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
    }
    prev = curr;
  }
  return prev[b.length];
}

// En esta parte del examen la respuesta son una, dos o tres palabras,
// y la ortografia tiene que ser correcta.
export function checkAnswer(question, value) {
  const typed = clean(value);
  if (!typed) return { kind: 'empty' };
  if (typed.split(' ').length > 3) return { kind: 'tooLong' };

  const targets = question.answers.map(clean);
  if (targets.includes(typed)) return { kind: 'correct' };
  if (targets.map(stripArticle).includes(stripArticle(typed))) return { kind: 'correct' };

  const near = targets.find((target) => distance(stripArticle(typed), stripArticle(target)) <= 2);
  if (near) return { kind: 'spelling', want: question.answers[0] };

  return { kind: 'wrong', want: question.answers[0] };
}

export function feedbackFor(result, question) {
  switch (result.kind) {
    case 'correct':
      return 'Yes, that is it.';
    case 'tooLong':
      return 'Use one, two or three words only.';
    case 'spelling':
      return `Right word, wrong spelling. It was "${question.answers[0]}".`;
    default:
      return `It was "${question.answers[0]}". Look at the story again.`;
  }
}

export function buildRound(story) {
  return {
    id: story.id,
    title: story.title,
    sections: story.sections,
    questions: story.questions.map((q) => ({ ...q })),
  };
}
