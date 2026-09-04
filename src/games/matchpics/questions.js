const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

export function buildRound(set) {
  const cards = shuffle([
    ...set.pairs.map((p) => ({ word: p.word, icon: p.icon })),
    ...set.extras,
  ]).map((card, i) => ({ ...card, letter: LETTERS[i] }));

  const letterOf = (word) => cards.find((c) => c.word === word).letter;

  // El primero va resuelto como ejemplo, igual que en el examen.
  const ordered = shuffle(set.pairs);
  return {
    id: set.id,
    intro: set.intro,
    leftLabel: set.leftLabel,
    cards,
    extraSay: set.extraSay,
    example: { ...ordered[0], letter: letterOf(ordered[0].word) },
    questions: ordered.slice(1).map((p) => ({ ...p, letter: letterOf(p.word) })),
  };
}

export const isMatch = (question, letter) => question.letter === letter;
