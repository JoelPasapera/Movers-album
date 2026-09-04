const CARRIERS = [
  (w) => `Where is the ${w}?`,
  (w) => `Find the ${w}.`,
  (w) => `Point to the ${w}.`,
  (w) => `Can you see the ${w}?`,
  (w) => `Look at the ${w}.`,
  (w) => `Show me the ${w}.`,
];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

function dedupe(list) {
  const seen = new Set();
  return list.filter((w) => {
    if (seen.has(w.id)) return false;
    seen.add(w.id);
    return true;
  });
}

export function buildRound(topicWords, globalPool, {
  questions = 8, options = 4, minQuestions = 6,
} = {}) {
  const own = dedupe(topicWords.filter((w) => w.pic));
  // Las paginas de gramatica (verbos, adjetivos, palabras pequenas) no tienen
  // dibujos. Ahi se juega con vocabulario de todo el album en vez de bloquear
  // el juego: el nino sigue ganando cromos de esa pagina.
  const pool = dedupe(globalPool);
  const local = own.length ? own : pool.slice(0, 12);
  if (!local.length) return [];

  const outside = dedupe(pool.filter((w) => !local.some((l) => l.id === w.id)));

  // Los temas cortos se completan con palabras de otros temas para que la
  // partida no se quede en dos preguntas.
  const targets = shuffle(local).slice(0, Math.min(questions, local.length));
  const topUp = shuffle(outside);
  while (targets.length < Math.min(minQuestions, local.length + outside.length)) {
    targets.push(topUp.pop());
  }

  return targets.map((target, i) => {
    const nearby = shuffle(local.filter((w) => w.id !== target.id));
    const far = shuffle(outside.filter((w) => w.id !== target.id));
    const distractors = dedupe([...nearby, ...far]).slice(0, options - 1);
    const carrier = CARRIERS[(i + Math.floor(Math.random() * CARRIERS.length)) % CARRIERS.length];
    return {
      target,
      say: carrier(target.word),
      options: shuffle([target, ...distractors]),
    };
  });
}

export const isCorrect = (question, wordId) => question.target.id === wordId;
