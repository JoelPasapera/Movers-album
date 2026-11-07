// Escenas para la Parte 6 de Reading and Writing.
// Cada escena lleva un modelo de lo que hay dentro (`entities`), y con eso el
// corrector sabe si una frase escrita por el alumno es verdad o no.
//
// Yes or no saca de aqui sus frases falsas cogiendo el sitio de OTRO objeto
// ("The dog is on the table"). Para que nunca marque como falsa una frase que
// el dibujo hace verdad, cada objeto lleva en `also` los demas sitios donde
// tambien esta (la nina junto a la bici, la ventana junto a la mesa), y los
// suelos y el cielo llevan `ground: true` (estan en todas partes). "Junto a"
// vale en los dos sentidos y lo que esta dentro de algo hereda su sitio
// (placesOf). Al dibujar una escena: mirar el dibujo y apuntarlo todo.
//
// Las frases que se generan (Yes or no, Let's talk!) tienen que sonar a ingles
// de verdad, asi que cada objeto dice tambien:
//   - `plural`: si se dibujo mas de uno ("The ducks are swimming", no "The
//     duck is"). La 12 lo exige si la pieza sale repetida en el dibujo.
//   - `doing`: lo que hace con su complemento, cuando sin el cambia el
//     sentido ("flying a kite": "The girl is flying" seria que vuela ella).
// El color de una persona es el de su camiseta: "The boy's T-shirt is green",
// nunca "The boy is green" (isPerson, colourSubject).

import { renderPanel } from './pieces.js';

export const PART6_SCENES = [
  {
    id: 'garden',
    title: 'In the garden',
    art: {
      bg: 'garden',
      items: [
        { p: 'tree', x: 40, y: 116, s: 1.05 },
        { p: 'flower', x: 122, y: 128, s: 1, o: { colour: '#FF6EA6' } },
        { p: 'flower', x: 136, y: 130, s: 0.9, o: { colour: '#FF6EA6' } },
        { p: 'flower', x: 150, y: 128, s: 1, o: { colour: '#FF6EA6' } },
        { p: 'flower', x: 176, y: 132, s: 0.9, o: { colour: '#FF6EA6' } },
        { p: 'dog', x: 44, y: 132, s: 0.9, o: { pose: 'sit' } },
        { p: 'table', x: 168, y: 138, s: 0.8 },
        { p: 'kitten', x: 168, y: 118, s: 0.7 },
        // El nino va montado: sentado en el sillin, pies en los pedales.
        { p: 'bike', x: 96, y: 138, s: 1, o: { colour: '#E33B2E', rider: { who: 'boy', shirt: '#2BA84A' } } },
        { p: 'person', x: 132, y: 130, s: 0.9, o: { who: 'girl', shirt: '#8A4FC8', hair: '#F5C542' } },
        { p: 'ball', x: 140, y: 146, s: 0.72, o: { colour: '#FFC523' } },
      ],
    },
    entities: [
      { noun: 'dog', colours: ['brown'], action: 'sitting', place: 'under the tree', also: ['next to the bike'] },
      { noun: 'cat', colours: ['yellow'], action: 'sitting', place: 'on the table', also: ['next to the flowers', 'next to the girl'] },
      { noun: 'kitten', colours: ['yellow'], action: 'sitting', place: 'on the table', also: ['next to the flowers', 'next to the girl'] },
      { noun: 'boy', colours: ['green'], action: 'riding', doing: 'riding a bike', place: 'on the bike', also: ['next to the girl'] },
      { noun: 'girl', colours: ['purple'], action: 'playing', doing: 'playing with a ball', place: 'next to the flowers', also: ['next to the bike'] },
      { noun: 'bike', colours: ['red'], place: 'in the garden', also: ['next to the flowers', 'under the tree'] },
      { noun: 'ball', colours: ['yellow'], place: 'next to the girl', also: ['next to the bike', 'next to the flowers'] },
      { noun: 'tree', colours: ['green'], place: 'in the garden', also: ['next to the bike'] },
      { noun: 'flower', plural: 'flowers', colours: ['pink'], place: 'in the garden', also: ['next to the bike', 'on the table'] },
      { noun: 'table', colours: ['brown'], place: 'in the garden', also: ['next to the flowers', 'next to the girl'] },
      { noun: 'grass', colours: ['green'], place: 'in the garden', ground: true },
      { noun: 'garden', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The dog is', answers: ['brown', 'a brown dog'] },
      { kind: 'complete', marks: 1, text: 'The boy is riding a', answers: ['bike', 'red bike'] },
      {
        kind: 'question', marks: 2, text: 'What is the girl doing?',
        answers: ['playing with a ball', 'playing with the ball', 'playing with a yellow ball',
          'she is playing with a ball', 'playing ball', 'she is playing'],
      },
      {
        kind: 'question', marks: 2, text: 'Where is the cat?',
        answers: ['on the table', 'it is on the table', 'the cat is on the table', 'on a table'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
  {
    id: 'kitchen',
    title: 'In the kitchen',
    art: {
      bg: 'room',
      items: [
        { p: 'table', x: 104, y: 122, s: 1.3 },
        { p: 'cake', x: 92, y: 88, s: 0.85 },
        { p: 'plate', x: 132, y: 92, s: 0.8 },
        { p: 'milk', x: 62, y: 92, s: 0.8 },
        { p: 'person', x: 42, y: 122, s: 0.95, o: { who: 'boy', shirt: '#1F7BE0' } },
        { p: 'person', x: 166, y: 124, s: 0.9, o: { who: 'girl', shirt: '#E33B2E', hair: '#F5C542' } },
        { p: 'dog', x: 106, y: 125, s: 0.54, o: { pose: 'sit' } },
        { p: 'ball', x: 26, y: 144, s: 0.8, o: { colour: '#2BA84A' } },
      ],
    },
    entities: [
      { noun: 'cake', colours: ['pink'], place: 'on the table' },
      { noun: 'table', colours: ['brown'], place: 'in the kitchen' },
      { noun: 'plate', colours: ['white'], place: 'on the table' },
      { noun: 'milk', colours: ['white'], place: 'on the table', also: ['next to the boy'] },
      { noun: 'glass', colours: ['white'], place: 'on the table', also: ['next to the boy'] },
      { noun: 'boy', colours: ['blue'], action: 'standing', place: 'next to the table' },
      { noun: 'girl', colours: ['red'], action: 'standing', place: 'next to the table' },
      { noun: 'dog', colours: ['brown'], action: 'sitting', place: 'under the table', also: ['next to the table'] },
      { noun: 'ball', colours: ['green'], place: 'next to the boy' },
      { noun: 'window', colours: ['blue'], place: 'in the kitchen', also: ['next to the table'] },
      { noun: 'kitchen', colours: [], place: 'here' },
      { noun: 'floor', colours: ['brown'], place: 'in the kitchen', ground: true },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The cake is on the', answers: ['table', 'brown table'] },
      { kind: 'complete', marks: 1, text: 'The dog is under the', answers: ['table', 'brown table'] },
      {
        kind: 'question', marks: 2, text: 'What colour is the ball?',
        answers: ['green', 'it is green', "it's green", 'the ball is green'],
      },
      {
        kind: 'question', marks: 2, text: 'What is the girl wearing?',
        answers: ['a red T-shirt', 'a red shirt', 'red', 'she is wearing red',
          'a red t-shirt', 'she is wearing a red T-shirt'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
];


PART6_SCENES.push(
  {
    id: 'funfair',
    title: 'At the funfair',
    art: {
      bg: 'fair',
      items: [
        { p: 'wheel', x: 150, y: 116, s: 0.95 },
        { p: 'tree', x: 20, y: 122, s: 0.8 },
        // El nino lleva un helado en la mano.
        { p: 'person', x: 56, y: 134, s: 0.95, o: { who: 'boy', shirt: '#E33B2E', arm: 'hold', holds: { p: 'icecream', s: 0.3 } } },
        { p: 'person', x: 96, y: 136, s: 0.9, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
        { p: 'dog', x: 122, y: 144, s: 0.75, o: { pose: 'run' } },
        { p: 'ball', x: 34, y: 144, s: 0.85, o: { colour: '#1F7BE0' } },
      ],
    },
    entities: [
      { noun: 'boy', colours: ['red'], action: 'standing', place: 'next to the tree' },
      { noun: 'girl', colours: ['yellow'], action: 'standing', place: 'next to the boy' },
      { noun: 'dog', colours: ['brown'], action: 'running', place: 'under the ride' },
      { noun: 'ball', colours: ['blue'], place: 'next to the boy', also: ['next to the tree'] },
      { noun: 'tree', colours: ['green'], place: 'at the funfair' },
      { noun: 'grass', colours: ['green'], place: 'at the funfair', ground: true },
      { noun: 'ride', colours: [], place: 'at the funfair' },
      { noun: 'funfair', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The ball is', answers: ['blue', 'a blue ball'] },
      { kind: 'complete', marks: 1, text: 'The boy is wearing a', answers: ['red T-shirt', 'red shirt', 'red t-shirt'] },
      {
        kind: 'question', marks: 2, text: 'What colour is the girl\u2019s T-shirt?',
        answers: ['yellow', 'it is yellow', "it\u2019s yellow", 'her T-shirt is yellow'],
      },
      {
        kind: 'question', marks: 2, text: 'Where is the dog?',
        answers: ['under the ride', 'it is under the ride', 'the dog is under the ride'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
  {
    id: 'seaside',
    title: 'At the beach',
    art: {
      bg: 'beach',
      items: [
        { p: 'wave', x: 44, y: 96, s: 0.9 },
        { p: 'person', x: 84, y: 132, s: 0.95, o: { who: 'girl', shirt: '#8A4FC8', hair: '#F5C542' } },
        { p: 'shell', x: 128, y: 142, s: 1 },
        { p: 'basket', x: 40, y: 140, s: 0.9 },
        // El sombrero en la arena, junto al perro (encima de su cabeza parecia
        // que el perro lo llevaba puesto, y "next to the dog" no se veia).
        { p: 'hat', x: 154, y: 139, s: 0.75 },
        { p: 'ball', x: 106, y: 142, s: 0.9, o: { colour: '#E33B2E' } },
        { p: 'dog', x: 180, y: 146, s: 0.6, o: { pose: 'sit' } },
      ],
    },
    entities: [
      { noun: 'girl', colours: ['purple'], action: 'standing', place: 'next to the ball' },
      { noun: 'shell', colours: ['pink'], place: 'next to the ball', also: ['next to the hat', 'next to the dog'] },
      { noun: 'ball', colours: ['red'], place: 'next to the girl' },
      { noun: 'hat', colours: ['yellow'], place: 'next to the dog' },
      { noun: 'dog', colours: ['brown'], action: 'sitting', place: 'next to the hat' },
      { noun: 'sea', colours: ['blue'], place: 'behind the girl', ground: true },
      { noun: 'wave', colours: ['blue'], place: 'in the sea' },
      { noun: 'sand', colours: ['yellow'], place: 'on the beach', ground: true },
      { noun: 'beach', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The shell is', answers: ['pink', 'a pink shell'] },
      { kind: 'complete', marks: 1, text: 'The dog is sitting next to the', answers: ['hat', 'yellow hat'] },
      {
        kind: 'question', marks: 2, text: 'What colour is the ball?',
        answers: ['red', 'it is red', "it\u2019s red", 'the ball is red'],
      },
      {
        kind: 'question', marks: 2, text: 'Where is the girl?',
        answers: ['on the sand', 'she is on the sand', 'the girl is on the sand', 'on the beach'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
);


// Cuatro escenas mas (ocho en total). Los colores, los sitios y lo que hace
// cada uno en `entities` son los del dibujo: el corrector y Yes or no se fian
// de ellos, asi que si se cambia el dibujo hay que cambiar esto.
PART6_SCENES.push(
  {
    id: 'park',
    title: 'In the park',
    art: {
      bg: 'garden',
      items: [
        { p: 'tree', x: 30, y: 118, s: 1 },
        { p: 'kite', x: 92, y: 52, s: 0.9, o: { colour: '#E33B2E' } },
        // La cuerda va de la mano en alto de la nina a la cometa.
        { p: 'person', x: 70, y: 134, s: 0.9, o: { who: 'girl', shirt: '#F5811F', hair: '#F5C542', arm: 'up' } },
        { p: 'string', x: 78.6, y: 81.4, s: 1, o: { dx: 13.4, dy: -29.4 } },
        { p: 'dog', x: 106, y: 142, s: 0.75, o: { pose: 'run' } },
        { p: 'bike', x: 150, y: 134, s: 1, o: { colour: '#2BA84A', rider: { who: 'boy', shirt: '#1F7BE0' } } },
        { p: 'river', x: 160, y: 140, s: 0.6 },
        { p: 'duck', x: 178, y: 140, s: 0.7 },
        { p: 'duck', x: 150, y: 142, s: 0.6 },
        { p: 'ball', x: 36, y: 144, s: 0.8, o: { colour: '#FFC523' } },
      ],
    },
    entities: [
      { noun: 'girl', colours: ['orange'], action: 'flying', doing: 'flying a kite', place: 'next to the tree', also: ['under the tree'] },
      { noun: 'kite', colours: ['red'], place: 'in the sky', also: ['next to the girl', 'next to the tree'] },
      { noun: 'boy', colours: ['blue'], action: 'riding', doing: 'riding a bike', place: 'next to the river' },
      { noun: 'bike', colours: ['green'], place: 'next to the river' },
      { noun: 'dog', colours: ['brown'], action: 'running', place: 'next to the girl', also: ['next to the river'] },
      { noun: 'duck', plural: 'ducks', colours: ['yellow'], action: 'swimming', place: 'in the river' },
      { noun: 'ball', colours: ['yellow'], place: 'under the tree', also: ['next to the girl', 'next to the tree'] },
      { noun: 'tree', colours: ['green'], place: 'in the park' },
      { noun: 'river', colours: ['blue'], place: 'in the park' },
      { noun: 'grass', colours: ['green'], place: 'in the park', ground: true },
      { noun: 'park', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The kite is', answers: ['red', 'a red kite', 'in the sky'] },
      { kind: 'complete', marks: 1, text: 'The ducks are swimming in the', answers: ['river', 'water', 'blue river'] },
      {
        kind: 'question', marks: 2, text: 'What is the girl doing?',
        answers: ['flying a kite', 'she is flying a kite', 'flying a red kite', 'she is flying a red kite',
          'flying her kite', 'she is flying her kite', 'she’s flying a kite'],
      },
      {
        kind: 'question', marks: 2, text: 'What colour is the bike?',
        answers: ['green', 'it is green', 'it’s green', 'the bike is green'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
  {
    id: 'farm',
    title: 'On the farm',
    art: {
      bg: 'field',
      items: [
        { p: 'tree', x: 28, y: 120, s: 0.95 },
        { p: 'goat', x: 36, y: 136, s: 0.8 },
        { p: 'cow', x: 98, y: 134, s: 1 },
        { p: 'person', x: 154, y: 132, s: 0.95, o: { who: 'man', shirt: '#96602F', tall: true } },
        { p: 'chicken', x: 66, y: 146, s: 0.8 },
        { p: 'chicken', x: 84, y: 148, s: 0.75 },
        { p: 'box', x: 182, y: 146, s: 0.8 },
      ],
    },
    entities: [
      { noun: 'farmer', colours: ['brown'], action: 'standing', place: 'next to the cow' },
      { noun: 'man', colours: ['brown'], action: 'standing', place: 'next to the cow', also: ['next to the farmer'] },
      { noun: 'cow', colours: ['black', 'white'], place: 'next to the farmer' },
      { noun: 'goat', colours: ['white'], place: 'under the tree' },
      { noun: 'chicken', plural: 'chickens', colours: ['white'], place: 'next to the cow', also: ['under the tree'] },
      { noun: 'box', colours: ['brown'], place: 'next to the farmer' },
      { noun: 'tree', colours: ['green'], place: 'on the farm' },
      { noun: 'grass', colours: ['green'], place: 'on the farm', ground: true },
      { noun: 'farm', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The goat is under the', answers: ['tree', 'green tree'] },
      { kind: 'complete', marks: 1, text: 'The cow is black and', answers: ['white'] },
      {
        kind: 'question', marks: 2, text: 'How many chickens are there?',
        answers: ['two', '2', 'there are two', 'there are 2', 'two chickens', 'there are two chickens'],
      },
      {
        kind: 'question', marks: 2, text: 'Where is the farmer?',
        answers: ['next to the cow', 'he is next to the cow', 'the farmer is next to the cow', 'he’s next to the cow',
          'on the farm', 'he is on the farm'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
  {
    id: 'classroom',
    title: 'In the classroom',
    art: {
      bg: 'room',
      items: [
        { p: 'table', x: 96, y: 124, s: 1.3 },
        { p: 'book', x: 82, y: 93, s: 0.9, o: { colour: '#1F7BE0' } },
        { p: 'book', x: 112, y: 93, s: 0.9, o: { colour: '#E33B2E' } },
        { p: 'person', x: 168, y: 126, s: 0.95, o: { who: 'woman', shirt: '#2BA84A', tall: true } },
        { p: 'person', x: 40, y: 126, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        { p: 'ball', x: 104, y: 140, s: 0.7, o: { colour: '#F5811F' } },
        { p: 'box', x: 138, y: 142, s: 0.75 },
      ],
    },
    entities: [
      { noun: 'teacher', colours: ['green'], action: 'standing', place: 'next to the window', also: ['next to the table'] },
      { noun: 'girl', colours: ['pink'], action: 'standing', place: 'next to the table' },
      { noun: 'book', plural: 'books', colours: ['blue', 'red'], place: 'on the table' },
      { noun: 'table', colours: ['brown'], place: 'in the classroom', also: ['next to the window'] },
      { noun: 'ball', colours: ['orange'], place: 'under the table' },
      { noun: 'box', colours: ['brown'], place: 'next to the table', also: ['next to the ball', 'under the table'] },
      { noun: 'window', colours: ['blue'], place: 'in the classroom' },
      { noun: 'floor', colours: ['brown'], place: 'in the classroom', ground: true },
      { noun: 'classroom', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The books are on the', answers: ['table', 'brown table'] },
      { kind: 'complete', marks: 1, text: 'The ball is under the', answers: ['table', 'brown table'] },
      {
        kind: 'question', marks: 2, text: 'How many books are there?',
        answers: ['two', '2', 'there are two', 'there are 2', 'two books', 'there are two books'],
      },
      {
        kind: 'question', marks: 2, text: 'What colour is the teacher’s T-shirt?',
        answers: ['green', 'it is green', 'it’s green', 'the T-shirt is green', 'the t-shirt is green'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
  {
    id: 'river',
    title: 'Next to the river',
    art: {
      bg: 'field',
      items: [
        { p: 'mountain', x: 156, y: 92, s: 1.1 },
        { p: 'raincloud', x: 56, y: 32, s: 1 },
        { p: 'river', x: 100, y: 102, s: 1.7, o: { width: 70 } },
        { p: 'boat', x: 76, y: 114, s: 0.75, o: { colour: '#E33B2E' } },
        { p: 'duck', x: 130, y: 116, s: 0.65 },
        { p: 'duck', x: 150, y: 118, s: 0.55 },
        { p: 'car', x: 46, y: 146, s: 0.8 },
        { p: 'person', x: 104, y: 148, s: 0.75, o: { who: 'boy', shirt: '#FFC523' } },
      ],
    },
    entities: [
      { noun: 'boy', colours: ['yellow'], action: 'standing', place: 'next to the car' },
      { noun: 'boat', colours: ['red'], place: 'on the river', also: ['in the river', 'next to the boy', 'next to the car'] },
      { noun: 'duck', plural: 'ducks', colours: ['yellow'], action: 'swimming', place: 'in the river', also: ['on the river', 'next to the boy'] },
      { noun: 'car', colours: ['blue'], place: 'next to the boy' },
      { noun: 'river', colours: ['blue'], place: 'in the countryside', also: ['next to the boy', 'next to the car'] },
      { noun: 'mountain', colours: ['grey', 'white'], place: 'behind the river' },
      { noun: 'cloud', colours: ['grey'], place: 'in the sky', ground: true },
      { noun: 'grass', colours: ['green'], place: 'in the countryside', ground: true },
      { noun: 'countryside', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The boat is', answers: ['red', 'a red boat', 'on the river'] },
      { kind: 'complete', marks: 1, text: 'The car is', answers: ['blue', 'a blue car', 'next to the boy'] },
      {
        kind: 'question', marks: 2, text: 'Where are the ducks?',
        answers: ['in the river', 'on the river', 'they are in the river', 'they are on the river',
          'in the water', 'on the water', 'they are in the water'],
      },
      {
        kind: 'question', marks: 2, text: 'What is the weather like?',
        answers: ['it is raining', 'raining', 'it’s raining', 'it is cloudy', 'cloudy', 'it’s cloudy',
          'it is cloudy and raining'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
);


// Dos escenas mas (diez): el lago y la fiesta. Los sitios falsos que usa Yes or
// no salen de los sitios de otros objetos, asi que ninguno puede ser verdad a la
// vez para otro (nada de "on the floor", donde esta casi todo).
PART6_SCENES.push(
  {
    id: 'lake',
    title: 'At the lake',
    art: {
      bg: 'lake',
      items: [
        { p: 'tree', x: 34, y: 92, s: 0.7 },
        // Sentado en el barco: se le ve de cintura para arriba.
        { p: 'person', x: 98, y: 131, s: 0.55, o: { who: 'man', shirt: '#1F7BE0', tall: true, waist: true } },
        { p: 'boat', x: 112, y: 119, s: 1.1, o: { colour: '#E33B2E' } },
        { p: 'duck', x: 160, y: 116, s: 0.7 },
        { p: 'duck', x: 180, y: 121, s: 0.6 },
        { p: 'person', x: 52, y: 146, s: 0.8, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542', arm: 'up' } },
        { p: 'string', x: 59.6, y: 99.2, o: { dx: 11.4, dy: -50.2 } },
        { p: 'kite', x: 71, y: 49, s: 0.75, o: { colour: '#1F7BE0' } },
        { p: 'dog', x: 92, y: 149, s: 0.6 },
      ],
    },
    entities: [
      { noun: 'man', colours: ['blue'], action: 'sitting', place: 'in the boat' },
      { noun: 'boat', colours: ['red', 'white'], place: 'on the lake' },
      { noun: 'duck', plural: 'ducks', colours: ['yellow'], action: 'swimming', place: 'on the lake' },
      { noun: 'girl', colours: ['pink'], action: 'standing', place: 'next to the lake' },
      { noun: 'kite', colours: ['blue'], place: 'in the sky', also: ['next to the girl', 'next to the lake', 'behind the lake'] },
      { noun: 'dog', colours: ['brown'], action: 'standing', place: 'next to the girl', also: ['next to the lake'] },
      { noun: 'tree', colours: ['green', 'brown'], place: 'behind the lake', also: ['next to the lake', 'next to the girl'] },
      { noun: 'lake', colours: ['blue'], place: 'in the countryside' },
      { noun: 'countryside', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The boat is', answers: ['red', 'a red boat', 'on the lake', 'red and white'] },
      { kind: 'complete', marks: 1, text: 'The girl has got a', answers: ['kite', 'blue kite', 'dog', 'brown dog'] },
      {
        kind: 'question', marks: 2, text: 'Where are the ducks?',
        answers: ['on the lake', 'in the lake', 'they are on the lake', 'they are in the lake', 'in the water',
          'on the water', 'they are in the water', 'they are on the water', 'next to the boat'],
      },
      {
        kind: 'question', marks: 2, text: 'What is the man doing?',
        answers: ['sitting in the boat', 'he is sitting in the boat', 'sitting', 'he is sitting', 'sitting in a boat',
          'he is in the boat', 'in the boat'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
  {
    id: 'party',
    title: 'The birthday party',
    art: {
      bg: 'room',
      items: [
        { p: 'table', x: 100, y: 124, s: 1.3 },
        { p: 'cake', x: 100, y: 92, s: 0.85 },
        { p: 'kitten', x: 98, y: 124, s: 0.62 },
        { p: 'person', x: 24, y: 126, s: 0.8, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
        // La camara, en la mano del nino.
        { p: 'person', x: 48, y: 126, s: 0.8, o: { who: 'boy', shirt: '#E33B2E', hair: '#2B2B2B', arm: 'hold', holds: { p: 'camera', s: 0.24 } } },
        { p: 'person', x: 156, y: 124, s: 0.9, o: { who: 'woman', shirt: '#2BA84A', tall: true, hair: '#A85B2B' } },
        { p: 'box', x: 182, y: 142, s: 0.6, o: { colour: '#FF6EA6' } },
        { p: 'box', x: 182, y: 129, s: 0.45, o: { colour: '#8A4FC8' } },
      ],
    },
    entities: [
      { noun: 'cake', colours: ['pink', 'brown'], place: 'on the table' },
      { noun: 'table', colours: ['brown'], place: 'in the room', also: ['next to the woman'] },
      { noun: 'cat', colours: ['yellow'], action: 'sitting', place: 'under the table' },
      { noun: 'kitten', colours: ['yellow'], action: 'sitting', place: 'under the table' },
      { noun: 'girl', colours: ['yellow'], action: 'standing', place: 'next to the boy' },
      { noun: 'boy', colours: ['red'], action: 'standing', place: 'next to the table' },
      { noun: 'camera', colours: ['black'], place: 'next to the boy', also: ['next to the table'] },
      { noun: 'woman', colours: ['green'], action: 'standing', place: 'next to the presents' },
      { noun: 'present', plural: 'presents', colours: ['pink', 'purple'], place: 'next to the woman' },
      { noun: 'window', colours: ['blue'], place: 'in the room', also: ['next to the table', 'next to the woman'] },
      { noun: 'room', colours: [], place: 'here' },
    ],
    prompts: [
      { kind: 'complete', marks: 1, text: 'The cake is on the', answers: ['table', 'brown table'] },
      { kind: 'complete', marks: 1, text: 'The boy has got a', answers: ['camera', 'black camera'] },
      {
        kind: 'question', marks: 2, text: 'Where is the cat?',
        answers: ['under the table', 'it is under the table', 'it\u2019s under the table', 'the cat is under the table',
          'the kitten is under the table'],
      },
      {
        kind: 'question', marks: 2, text: 'How many presents are there?',
        answers: ['two', '2', 'there are two', 'there are 2', 'two presents', 'there are two presents'],
      },
      { kind: 'free', marks: 2, text: 'Now write a sentence about the picture.' },
      { kind: 'free', marks: 2, text: 'Now write a different sentence about the picture.' },
    ],
  },
);

export function renderScene(scene) {
  return renderPanel(scene.art);
}

/** El nombre del sitio de la escena (garden, kitchen...): la entidad con place 'here'. */
export const containerOf = (scene) => scene.entities.find((e) => e.place === 'here')?.noun ?? '';

/**
 * Todos los sitios donde es VERDAD que esta un objeto: el suyo, los que se
 * anaden a mano en `also` (lo que el dibujo deja ver ademas: la nina esta
 * junto a la bici), los que se heredan por estar dentro o encima de otro (el
 * hombre esta en la barca, y la barca en el lago: el hombre esta en el lago) y
 * el sitio de toda la escena (todo esta "in the garden").
 * @param {any} scene @param {any} entity
 * @returns {Set<string>}
 */
export function placesOf(scene, entity) {
  const out = new Set();
  const here = containerOf(scene);
  if (here) ['in', 'on', 'at'].forEach((prep) => out.add(`${prep} the ${here}`));
  const visit = (e, depth) => {
    if (!e || depth > 3) return;
    for (const place of [e.place, ...(e.also ?? [])]) {
      if (!place || place === 'here' || out.has(place)) continue;
      out.add(place);
      const inside = /^(?:in|on) the (\w+)$/.exec(place);
      if (inside) visit(scene.entities.find((x) => x.noun === inside[1]), depth + 1);
    }
  };
  visit(entity, 0);
  // "Junto a" va en los dos sentidos: si la nina esta junto al perro, el perro
  // esta junto a la nina.
  for (const other of scene.entities) {
    if (other === entity) continue;
    for (const place of [other.place, ...(other.also ?? [])]) {
      if (place === `next to the ${entity.noun}` || place === `next to the ${entity.noun}s`) out.add(`next to the ${other.noun}`);
    }
  }
  return out;
}

/** Si un sitio nombra al propio objeto ("the table is on the table"). */
export const mentionsItself = (entity, place) => {
  const words = String(place).split(' ');
  return words.includes(entity.noun) || words.includes(`${entity.noun}s`) || words.includes(`${entity.noun}es`);
};

/** Las personas de las escenas: su color es el de la camiseta. */
const PEOPLE = new Set(['boy', 'girl', 'man', 'woman', 'teacher', 'farmer']);

/** @param {{ noun: string }} entity */
export const isPerson = (entity) => PEOPLE.has(entity.noun);

/** "the dog", o "the ducks" si se dibujo mas de uno. @param {{ noun: string, plural?: string }} entity */
export const theNoun = (entity) => `the ${entity.plural ?? entity.noun}`;

/** is / are, segun haya uno o varios. @param {{ plural?: string }} entity */
export const beOf = (entity) => (entity.plural ? 'are' : 'is');

/**
 * De que se dice el color: de una persona, su camiseta ("the boy's T-shirt");
 * de lo demas, la cosa misma.
 * @param {{ noun: string, plural?: string }} entity
 */
export const colourSubject = (entity) => (isPerson(entity) ? `the ${entity.noun}\u2019s T-shirt` : theNoun(entity));

/** is / are para la frase del color (la camiseta es una). @param {{ noun: string, plural?: string }} entity */
export const colourBe = (entity) => (isPerson(entity) ? 'is' : beOf(entity));

/** Lo que hace, con su complemento si lo necesita ("flying a kite"). @param {{ action?: string, doing?: string }} entity */
export const doingOf = (entity) => entity.doing ?? entity.action ?? '';

/** Primera letra en mayuscula, para empezar una frase. @param {string} text */
export const capital = (text) => text.charAt(0).toUpperCase() + text.slice(1);

export function lexiconOf(scene) {
  const words = new Set();
  for (const entity of scene.entities) {
    words.add(entity.noun);
    if (entity.plural) words.add(entity.plural);
    entity.colours.forEach((c) => words.add(c));
    if (entity.action) words.add(entity.action);
    if (entity.doing) entity.doing.split(' ').forEach((w) => words.add(w));
    if (entity.place) entity.place.split(' ').forEach((w) => words.add(w));
    if (isPerson(entity)) words.add('t-shirt');
  }
  return words;
}

export const randomScene = (excludeId = null) => {
  const pool = excludeId
    ? PART6_SCENES.filter((s) => s.id !== excludeId)
    : PART6_SCENES;
  const list = pool.length ? pool : PART6_SCENES;
  return list[Math.floor(Math.random() * list.length)];
};
