// Escenas para la Parte 6 de Reading and Writing.
// Cada escena lleva un modelo de lo que hay dentro (`entities`), y con eso el
// corrector sabe si una frase escrita por el alumno es verdad o no.

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
        { p: 'dog', x: 44, y: 132, s: 0.9 },
        { p: 'table', x: 168, y: 138, s: 0.8 },
        { p: 'kitten', x: 168, y: 118, s: 0.7 },
        { p: 'bike', x: 96, y: 138, s: 1, o: { colour: '#E33B2E' } },
        { p: 'person', x: 96, y: 132, s: 0.95, o: { shirt: '#2BA84A' } },
        { p: 'ball', x: 132, y: 142, s: 1, o: { colour: '#FFC523' } },
        { p: 'person', x: 132, y: 130, s: 0.9, o: { shirt: '#8A4FC8', hair: '#F5C542' } },
      ],
    },
    entities: [
      { noun: 'dog', colours: ['brown'], action: 'sitting', place: 'under the tree' },
      { noun: 'cat', colours: ['yellow'], action: 'sitting', place: 'on the table' },
      { noun: 'kitten', colours: ['yellow'], action: 'sitting', place: 'on the table' },
      { noun: 'boy', colours: ['green'], action: 'riding', place: 'next to the bike' },
      { noun: 'girl', colours: ['purple'], action: 'playing', place: 'next to the flowers' },
      { noun: 'bike', colours: ['red'], place: 'in the garden' },
      { noun: 'ball', colours: ['yellow'], place: 'on the grass' },
      { noun: 'tree', colours: ['green'], place: 'in the garden' },
      { noun: 'flower', colours: ['pink'], place: 'in the garden' },
      { noun: 'table', colours: ['brown'], place: 'in the garden' },
      { noun: 'grass', colours: ['green'], place: 'in the garden' },
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
        { p: 'person', x: 42, y: 122, s: 0.95, o: { shirt: '#1F7BE0' } },
        { p: 'person', x: 166, y: 124, s: 0.9, o: { shirt: '#E33B2E', hair: '#F5C542' } },
        { p: 'dog', x: 132, y: 140, s: 0.8 },
        { p: 'ball', x: 26, y: 144, s: 0.8, o: { colour: '#2BA84A' } },
      ],
    },
    entities: [
      { noun: 'cake', colours: ['pink'], place: 'on the table' },
      { noun: 'table', colours: ['brown'], place: 'in the kitchen' },
      { noun: 'plate', colours: ['white'], place: 'on the table' },
      { noun: 'milk', colours: ['white'], place: 'on the table' },
      { noun: 'glass', colours: ['white'], place: 'on the table' },
      { noun: 'boy', colours: ['blue'], action: 'standing', place: 'next to the table' },
      { noun: 'girl', colours: ['red'], action: 'standing', place: 'next to the table' },
      { noun: 'dog', colours: ['brown'], action: 'sitting', place: 'under the table' },
      { noun: 'ball', colours: ['green'], place: 'on the floor' },
      { noun: 'window', colours: ['blue'], place: 'in the kitchen' },
      { noun: 'kitchen', colours: [], place: 'here' },
      { noun: 'floor', colours: ['brown'], place: 'in the kitchen' },
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
        { p: 'person', x: 56, y: 134, s: 0.95, o: { shirt: '#E33B2E' } },
        { p: 'person', x: 96, y: 136, s: 0.9, o: { shirt: '#FFC523', hair: '#F5C542' } },
        { p: 'icecream', x: 74, y: 118, s: 0.9 },
        { p: 'dog', x: 122, y: 144, s: 0.75 },
        { p: 'ball', x: 34, y: 144, s: 0.85, o: { colour: '#1F7BE0' } },
      ],
    },
    entities: [
      { noun: 'boy', colours: ['red'], action: 'standing', place: 'next to the tree' },
      { noun: 'girl', colours: ['yellow'], action: 'standing', place: 'next to the boy' },
      { noun: 'dog', colours: ['brown'], action: 'running', place: 'under the ride' },
      { noun: 'ball', colours: ['blue'], place: 'on the grass' },
      { noun: 'tree', colours: ['green'], place: 'at the funfair' },
      { noun: 'grass', colours: ['green'], place: 'at the funfair' },
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
        { p: 'person', x: 96, y: 132, s: 0.95, o: { shirt: '#8A4FC8', hair: '#F5C542' } },
        { p: 'shell', x: 148, y: 136, s: 1.1 },
        { p: 'basket', x: 40, y: 140, s: 0.9 },
        { p: 'hat', x: 176, y: 120, s: 0.9 },
        { p: 'ball', x: 122, y: 142, s: 0.9, o: { colour: '#E33B2E' } },
        { p: 'dog', x: 178, y: 144, s: 0.7 },
      ],
    },
    entities: [
      { noun: 'girl', colours: ['purple'], action: 'standing', place: 'on the sand' },
      { noun: 'shell', colours: ['pink'], place: 'next to the girl' },
      { noun: 'ball', colours: ['red'], place: 'on the sand' },
      { noun: 'hat', colours: ['yellow'], place: 'next to the dog' },
      { noun: 'dog', colours: ['brown'], action: 'sitting', place: 'next to the hat' },
      { noun: 'sea', colours: ['blue'], place: 'behind the girl' },
      { noun: 'wave', colours: ['blue'], place: 'in the sea' },
      { noun: 'sand', colours: ['yellow'], place: 'on the beach' },
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

export function renderScene(scene) {
  return renderPanel(scene.art);
}

export function lexiconOf(scene) {
  const words = new Set();
  for (const entity of scene.entities) {
    words.add(entity.noun);
    entity.colours.forEach((c) => words.add(c));
    if (entity.action) words.add(entity.action);
    if (entity.place) entity.place.split(' ').forEach((w) => words.add(w));
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
