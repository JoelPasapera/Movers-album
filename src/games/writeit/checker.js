import { inSyllabus } from '../../data/syllabus.js';
import { lexiconOf } from '../../data/scenes/part6.js';

const FUNCTION_WORDS = new Set([
  'a', 'an', 'the', 'this', 'that', 'these', 'those', 'some', 'any', 'and', 'but', 'or',
  'is', 'are', 'was', 'were', 'am', 'be', 'there', 'here', 'it', 'they', 'he', 'she',
  'his', 'her', 'their', 'its', 'my', 'your', 'our', 'i', 'you', 'we', 'them', 'him',
  'in', 'on', 'at', 'of', 'to', 'from', 'with', 'under', 'behind', 'next', 'near',
  'front', 'between', 'not', 'very', 'too', 'so', 'has', 'have', 'got', 'can', 'one',
  'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'lot', 'lots',
]);

const COLOURS = new Set([
  'red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink',
  'brown', 'grey', 'gray', 'black', 'white',
]);

const clean = (text) => String(text)
  .toLowerCase()
  .replace(/\u2019/g, "'")
  .replace(/[^a-z'\- ]/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const tokens = (text) => clean(text).split(' ').filter(Boolean);

const singular = (word) => {
  if (word.endsWith('ies') && word.length > 4) return `${word.slice(0, -3)}y`;
  if (word.endsWith('es') && word.length > 3) return word.slice(0, -2);
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) return word.slice(0, -1);
  return word;
};

// Respuestas cerradas: preguntas 1 a 4. Se ignoran articulos y mayusculas,
// porque en el examen lo que se mide es que la respuesta sea fiel al dibujo.
export function checkClosed(prompt, value) {
  const typed = clean(value).replace(/^(a|an|the)\s+/, '');
  if (!typed) return { marks: 0, kind: 'empty' };
  const ok = prompt.answers.some((answer) => {
    const target = clean(answer).replace(/^(a|an|the)\s+/, '');
    return typed === target;
  });
  return ok ? { marks: prompt.marks, kind: 'correct' } : { marks: 0, kind: 'wrong' };
}

function findEntity(scene, word) {
  const base = singular(word);
  return scene.entities.find((e) => e.noun === base || e.noun === word) ?? null;
}

// Frases libres: preguntas 5 y 6. Dos puntos, uno por cada criterio del examen:
// que se entienda, y que sea verdad en el dibujo. La gramatica NO resta,
// tal y como dice el handbook.
export function checkFree(scene, value, previous = []) {
  const words = tokens(value);
  if (words.length < 3) {
    return { marks: 0, kind: 'tooShort', note: 'Write a whole sentence, not just one word.' };
  }

  const outside = words.filter((w) => !inSyllabus(w));
  if (outside.length) {
    return {
      marks: 0,
      kind: 'unknownWord',
      note: `"${outside[0]}" is not a Movers word. Try another one.`,
    };
  }

  const content = words.filter((w) => !FUNCTION_WORDS.has(w) && !COLOURS.has(w));
  const lexicon = lexiconOf(scene);
  const known = content.filter((w) => lexicon.has(singular(w)) || lexicon.has(w));

  if (!known.length) {
    return {
      marks: 1,
      kind: 'notInPicture',
      note: 'I understand it, but that is not in the picture. One mark.',
    };
  }

  // Cada color escrito se comprueba contra el objeto que le sigue.
  for (let i = 0; i < words.length; i += 1) {
    if (!COLOURS.has(words[i])) continue;
    const after = words.slice(i + 1, i + 4).find((w) => findEntity(scene, w));
    const before = words.slice(Math.max(0, i - 3), i).reverse().find((w) => findEntity(scene, w));
    const entity = findEntity(scene, after ?? before ?? '');
    if (!entity || !entity.colours.length) continue;
    const said = words[i] === 'gray' ? 'grey' : words[i];
    if (!entity.colours.includes(said)) {
      return {
        marks: 1,
        kind: 'wrongColour',
        note: `The ${entity.noun} is not ${said}. One mark: it makes sense, but it is not true.`,
      };
    }
  }

  const repeated = previous.some((old) => {
    const a = new Set(tokens(old).filter((w) => !FUNCTION_WORDS.has(w) && !COLOURS.has(w)));
    const b = new Set(content);
    if (!a.size || !b.size) return false;
    const shared = [...b].filter((w) => a.has(w)).length;
    return shared / Math.max(a.size, b.size) >= 0.7;
  });
  if (repeated) {
    return {
      marks: 1,
      kind: 'repeated',
      note: 'That is almost the same as your other sentence. One mark instead of two.',
    };
  }

  return { marks: 2, kind: 'correct', note: 'Two marks. It makes sense and it is true.' };
}
