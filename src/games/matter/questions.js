import { WORDS } from '../../data/wordlist.js';

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

// Partes del cuerpo que "duelen" (My ... hurts). Es una eleccion de sentido:
// el pelo o la barba no duelen. Cada una tiene que tener dibujo en el album,
// porque el dibujo es la unica pista, como en la hoja de Cambridge.
// Fuera back, neck y stomach: sus dibujos del album (una flecha, una jirafa)
// no dicen "esto duele" a un nino de ocho anos.
const HURTS = ['arm', 'ear', 'eye', 'foot', 'hand', 'head', 'leg', 'mouth', 'nose', 'tooth'];

const BODY = new Map(WORDS.body.filter(([, icon, pic]) => icon && pic === 1).map(([word, icon]) => [word, icon]));

export const PARTS = HURTS.filter((w) => BODY.has(w)).map((word) => ({ word, icon: BODY.get(word) }));

export const hurtSentence = (part) => `My ${part} hurts.`;

// Cinco preguntas, banco de ocho partes del cuerpo (tres sobran).
export function buildRound({ size = 5, bankSize = 8 } = {}) {
  const chosen = shuffle(PARTS).slice(0, bankSize);
  const questions = chosen.slice(0, size).map((part) => ({
    part: part.word,
    icon: part.icon,
    answer: part.word,
    say: hurtSentence(part.word),
  }));
  const bank = shuffle(chosen).map((part) => ({ answer: part.word, icon: part.icon }));
  return { questions, bank };
}
