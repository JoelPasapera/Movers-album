// Inventario de los TIPOS de actividad de los dos libros de Cambridge que
// se usan como guia, y que juego de la app implementa cada uno.
//
// Es un inventario de mecanicas, no de contenido: aqui no hay ni una frase
// ni un dibujo de los libros. Cada tipo se implementa con un generador
// propio que trabaja sobre el wordlist (ver REVIEW.md, "Sobre el material
// de Cambridge").
//
// Las comprobaciones 10 y 13 leen este archivo para dos cosas:
//   - comprobar que cada juego citado existe y esta dado de alta;
//   - contar cuantas actividades tienen juego. Ese numero entra en el
//     trinquete, asi que no puede bajar. Antes se contaba PRACTICE.length + 1,
//     que media cuantos entrenamientos habia, no cuantas actividades de los
//     libros estaban cubiertas.
//
// `games: []` significa "no hay juego para este tipo todavia". Cuando se
// implemente uno, se anade aqui su id y el numero sube solo.

// A1 Movers Classroom Activities (476679): seis worksheets, tres actividades
// cada una. Se referencian por worksheet y letra, que es como las cita el
// propio cuadernillo.
export const CLASSROOM = [
  { sheet: 1, activity: 'A', what: 'Leer una definicion y escribir la palabra, eligiendola de un banco con dibujos',
    games: ['spellit'] },
  { sheet: 1, activity: 'B', what: 'Completar un texto que describe a una persona con adjetivos de un banco ilustrado',
    games: ['gapstory'], note: 'misma mecanica que el texto con huecos; la parte de dibujar queda fuera de la app' },
  { sheet: 1, activity: 'C', what: 'Decir que parte del cuerpo duele a partir de un dibujo (What\u2019s the matter? My ... hurts)',
    games: ['matter'] },
  { sheet: 2, activity: 'A', what: 'Mirar la escena y decidir si cada frase es verdadera (yes) o falsa (no)',
    games: ['yesno'] },
  { sheet: 2, activity: 'B', what: 'Completar frases sueltas con palabras de un banco',
    games: ['picturegap'], note: 'en la app el banco lleva dibujos' },
  { sheet: 2, activity: 'C', what: 'Elegir la palabra interrogativa que encaja en cada pregunta (Why o When)',
    games: ['wordchoice'], note: 'es el texto "questions" de la parte 4' },
  { sheet: 3, activity: 'A', what: 'Leer un dialogo y elegir la mejor respuesta entre tres',
    games: ['respond'] },
  { sheet: 3, activity: 'B', what: 'Deducir en que lugar esta alguien por el dibujo y lo que dice (He\u2019s at the ...)',
    games: ['whereare'] },
  { sheet: 3, activity: 'C', what: 'Elegir la forma de pasado correcta de un verbo entre tres formas',
    games: ['pastform'] },
  { sheet: 4, activity: 'A', what: 'Completar una historia con palabras de un banco ilustrado y elegir su titulo',
    games: ['gapstory'] },
  { sheet: 4, activity: 'B', what: 'Unir dos palabras que forman una palabra compuesta (swimming + pool)',
    games: ['wordpairs'], note: 'una pareja cada vez: la primera mitad y cuatro segundas mitades' },
  { sheet: 4, activity: 'C', what: 'Formar el adverbio en -ly de un adjetivo dentro de una frase',
    games: ['wordform'] },
  { sheet: 5, activity: 'A', what: 'Leer una historia con dibujos y completar frases sobre ella con una, dos o tres palabras',
    games: ['readstory'] },
  { sheet: 5, activity: 'B', what: 'Completar una frase con la palabra que corresponde al dibujo, de un banco',
    games: ['picturegap'] },
  { sheet: 5, activity: 'C', what: 'Completar frases con la preposicion de tiempo que falta (at, after, before, in)',
    games: ['timeprep'] },
  { sheet: 6, activity: 'A', what: 'Completar un texto con palabras de un banco',
    games: ['gapstory'] },
  { sheet: 6, activity: 'B', what: 'Formar el gerundio en -ing de un verbo dentro de una frase',
    games: ['wordform'] },
  { sheet: 6, activity: 'C', what: 'Hablar sobre dibujos y preguntas personales',
    games: ['talkpicture', 'talkabout'] },
];

// A1 Movers Wordlist Picture Book (758131). La ultima pagina, la de colorear
// a los personajes, no es un ejercicio y no se cuenta.
export const PICTURE_BOOK = [
  { page: 4, title: 'What are the Movers doing today?', what: 'Completar frases con la palabra que corresponde a un dibujo del banco',
    games: ['picturegap'] },
  { page: 5, title: 'Who\u2019s who?', what: 'Ordenar con ordinales (first, second... thirteenth)',
    games: ['numbers'], note: 'en la app los ordinales se practican con cifras, no con nombres' },
  { page: 6, title: 'Let\u2019s talk!', what: 'Responder de viva voz a cuatro preguntas sobre una escena',
    games: ['talkpicture'] },
  { page: 22, title: 'Can you find the words?', what: 'Sopa de letras con palabras del wordlist',
    games: ['wordsearch'] },
  { page: 23, title: 'Which number?', what: 'Unir numeros y ordinales con su nombre escrito, completando letras',
    games: ['numbers'] },
  { page: 24, title: 'Monkey goes swimming!', what: 'Completar frases con parejas de contrarios',
    games: ['opposites'] },
  { page: 31, title: 'Remember', what: 'Escribir una frase propia con una palabra dada',
    games: ['sentence'] },
];

export const withGame = (list) => list.filter((a) => a.games.length > 0);
export const withoutGame = (list) => list.filter((a) => a.games.length === 0);
