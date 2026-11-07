import {
  PART6_SCENES, placesOf, mentionsItself, theNoun, beOf, colourSubject, colourBe, doingOf, capital,
} from '../../data/scenes/part6.js';

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
// escribirla a mano ni puede quedar desfasada si cambia el dibujo. Cada frase
// lleva `about` (de quien habla, de que y con que), y asi la comprobacion 10
// mira que cada "no" sea falso de verdad.
//
// Suenan a ingles de verdad: de una persona se dice el color de su camiseta
// ("The boy's T-shirt is green"), lo que hay varias veces va en plural ("The
// ducks are swimming") y lo que hace lleva su complemento ("flying a kite").
function statementsFor(scene) {
  const out = [];
  const withColour = scene.entities.filter((e) => e.colours.length);
  const withPlace = scene.entities.filter((e) => e.place && e.place !== 'here');
  const withAction = scene.entities.filter((e) => e.action);
  const allColours = [...new Set(withColour.flatMap((e) => e.colours))];
  /** @param {any} e @param {'colour' | 'place' | 'action' | 'exists'} kind @param {string} value */
  const about = (e, kind, value) => ({ noun: e.noun ?? e, kind, value });

  for (const entity of withColour) {
    const subject = capital(colourSubject(entity));
    // Varios de colores distintos (un libro azul y otro rojo): "The books are
    // blue" seria mentira; se dice de uno.
    const truth = entity.plural && entity.colours.length > 1
      ? `One ${entity.noun} is ${entity.colours[0]}.`
      : `${subject} ${colourBe(entity)} ${entity.colours[0]}.`;
    out.push({ text: truth, answer: true, about: about(entity, 'colour', entity.colours[0]) });
    const wrong = allColours.filter((c) => !entity.colours.includes(c));
    if (wrong.length) {
      const colour = pick(wrong);
      out.push({ text: `${subject} ${colourBe(entity)} ${colour}.`, answer: false, about: about(entity, 'colour', colour) });
    }
  }
  // Un lugar que comparten varios objetos ("in the garden") es cierto para casi
  // todos, asi que nunca puede servir como respuesta falsa. Tampoco uno que sea
  // verdad para ese objeto por otro camino (placesOf), ni uno que lo nombre a el
  // mismo ("the table is on the table"), ni nada sobre el suelo, la arena o el
  // cielo (`ground`: estan en todas partes).
  const shared = new Map();
  for (const e of withPlace) shared.set(e.place, (shared.get(e.place) ?? 0) + 1);
  const specific = [...new Set(withPlace.filter((e) => shared.get(e.place) < 3).map((e) => e.place))];

  for (const entity of withPlace) {
    const subject = `${capital(theNoun(entity))} ${beOf(entity)}`;
    out.push({ text: `${subject} ${entity.place}.`, answer: true, about: about(entity, 'place', entity.place) });
    if (entity.ground) continue;
    const truths = placesOf(scene, entity);
    const others = specific.filter((place) => !truths.has(place) && !mentionsItself(entity, place));
    if (others.length) {
      const place = pick(others);
      out.push({ text: `${subject} ${place}.`, answer: false, about: about(entity, 'place', place) });
    }
  }
  for (const entity of withAction) {
    out.push({
      text: `${capital(theNoun(entity))} ${beOf(entity)} ${doingOf(entity)}.`, answer: true, about: about(entity, 'action', doingOf(entity)),
    });
  }
  const nouns = scene.entities.map((e) => e.noun);
  const absent = ['elephant', 'train', 'clown', 'guitar', 'shark', 'mountain', 'pirate']
    .filter((n) => !nouns.includes(n));
  for (const missing of absent.slice(0, 3)) {
    out.push({ text: `There is ${article(missing)} ${missing} in the picture.`, answer: false, about: about(missing, 'exists', missing) });
  }
  const present = scene.entities.filter((e) => e.place !== 'here');
  for (const entity of present.slice(0, 3)) {
    const text = entity.plural
      ? `There are ${entity.plural} in the picture.`
      : `There is ${article(entity.noun)} ${entity.noun} in the picture.`;
    out.push({ text, answer: true, about: about(entity, 'exists', entity.noun) });
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
