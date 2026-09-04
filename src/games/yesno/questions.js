import { PART6_SCENES } from '../../data/scenes/part6.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

const article = (word) => (/^[aeiou]/.test(word) ? 'an' : 'a');

// "Look and read. Write yes or no." Las frases se generan del modelo de la
// escena, asi que la respuesta correcta se sabe con certeza: no hay que
// escribirla a mano ni puede quedar desfasada si cambia el dibujo.
function statementsFor(scene) {
  const out = [];
  const withColour = scene.entities.filter((e) => e.colours.length);
  const withPlace = scene.entities.filter((e) => e.place && e.place !== 'here');
  const withAction = scene.entities.filter((e) => e.action);
  const allColours = [...new Set(withColour.flatMap((e) => e.colours))];

  for (const entity of withColour) {
    out.push({ text: `The ${entity.noun} is ${entity.colours[0]}.`, answer: true });
    const wrong = allColours.filter((c) => !entity.colours.includes(c));
    if (wrong.length) out.push({ text: `The ${entity.noun} is ${pick(wrong)}.`, answer: false });
  }
  // Un lugar que comparten varios objetos ("in the garden") es cierto para casi
  // todos, asi que nunca puede servir como respuesta falsa.
  const shared = new Map();
  for (const e of withPlace) shared.set(e.place, (shared.get(e.place) ?? 0) + 1);
  const specific = withPlace.filter((e) => shared.get(e.place) < 3);

  for (const entity of withPlace) {
    out.push({ text: `The ${entity.noun} is ${entity.place}.`, answer: true });
    const others = specific.filter((e) => e.place !== entity.place);
    if (others.length) out.push({ text: `The ${entity.noun} is ${pick(others).place}.`, answer: false });
  }
  for (const entity of withAction) {
    out.push({ text: `The ${entity.noun} is ${entity.action}.`, answer: true });
  }
  const nouns = scene.entities.map((e) => e.noun);
  const absent = ['elephant', 'train', 'clown', 'guitar', 'shark', 'mountain', 'pirate']
    .filter((n) => !nouns.includes(n));
  for (const missing of absent.slice(0, 3)) {
    out.push({ text: `There is ${article(missing)} ${missing} in the picture.`, answer: false });
  }
  const present = scene.entities.filter((e) => e.noun !== 'garden' && e.noun !== 'kitchen');
  for (const entity of present.slice(0, 3)) {
    out.push({ text: `There is ${article(entity.noun)} ${entity.noun} in the picture.`, answer: true });
  }
  return out;
}

// Como en el libro: dos ejemplos resueltos y luego las preguntas.
export function buildRound(scene = pick(PART6_SCENES), { size = 6 } = {}) {
  const all = statementsFor(scene);
  const yes = shuffle(all.filter((s) => s.answer));
  const no = shuffle(all.filter((s) => !s.answer));
  const half = Math.ceil((size + 2) / 2);
  const mixed = shuffle([...yes.slice(0, half), ...no.slice(0, half)]);
  return {
    scene,
    examples: mixed.slice(0, 2),
    questions: mixed.slice(2, 2 + size),
  };
}

export const isCorrect = (question, said) => question.answer === said;
