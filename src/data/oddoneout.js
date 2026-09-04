// Conjuntos originales para la parte 3 de Speaking.
// Cada set: tres palabras que comparten categoría y una que no encaja.
// Las etiquetas son las que el alumno tiene que decir en voz alta:
// "These are all animals, but this is food."

import { WORDS } from './wordlist.js';

export const SETS = [
  {
    id: 'animals-food',
    groupLabel: 'animals', oddLabel: 'food',
    group: ['rabbit', 'lion', 'panda'], odd: 'sandwich',
  },
  {
    id: 'sea-bird',
    groupLabel: 'animals in the sea', oddLabel: 'a bird',
    group: ['shark', 'whale', 'dolphin'], odd: 'parrot',
  },
  {
    id: 'food-drink',
    groupLabel: 'food', oddLabel: 'a drink',
    group: ['sandwich', 'pancake', 'cheese'], odd: 'milkshake',
  },
  {
    id: 'drinks-food',
    groupLabel: 'drinks', oddLabel: 'food',
    group: ['coffee', 'tea', 'milkshake'], odd: 'salad',
  },
  {
    id: 'clothes-animal',
    groupLabel: 'clothes', oddLabel: 'an animal',
    group: ['coat', 'scarf', 'sweater'], odd: 'kitten',
  },
  {
    id: 'town-weather',
    groupLabel: 'places in a town', oddLabel: 'weather',
    group: ['library', 'cinema', 'market'], odd: 'rainbow',
  },
  {
    id: 'jobs-place',
    groupLabel: 'people and their work', oddLabel: 'a place',
    group: ['clown', 'cook', 'pirate'], odd: 'hospital',
  },
  {
    id: 'weather-food',
    groupLabel: 'weather', oddLabel: 'food',
    group: ['cloud', 'rain', 'snow'], odd: 'soup',
  },
  {
    id: 'sky-ground',
    groupLabel: 'things in the sky', oddLabel: 'a thing on the ground',
    group: ['cloud', 'rainbow', 'moon'], odd: 'rock',
  },
  {
    id: 'water-trees',
    groupLabel: 'places with water', oddLabel: 'a place with trees',
    group: ['river', 'lake', 'waterfall'], odd: 'forest',
  },
  {
    id: 'table-travel',
    groupLabel: 'things for food and drink', oddLabel: 'a thing for the train',
    group: ['plate', 'bowl', 'bottle'], odd: 'ticket',
  },
  {
    id: 'travel-clothes',
    groupLabel: 'things about trains and buses', oddLabel: 'clothes',
    group: ['bus stop', 'station', 'ticket'], odd: 'helmet',
  },
  {
    id: 'ill-farm',
    groupLabel: 'people who help you when you are ill', oddLabel: 'a person who works on a farm',
    group: ['doctor', 'nurse', 'dentist'], odd: 'farmer',
  },
  {
    id: 'ill-fun',
    groupLabel: 'things about being ill', oddLabel: 'a fun place',
    group: ['hospital', 'doctor', 'headache'], odd: 'funfair',
  },
  {
    id: 'fly-slow',
    groupLabel: 'animals that can fly', oddLabel: 'an animal that is very slow',
    group: ['parrot', 'bat', 'fly'], odd: 'snail',
  },
  {
    id: 'small-big',
    groupLabel: 'small animals', oddLabel: 'a very big animal',
    group: ['snail', 'fly', 'kitten'], odd: 'whale',
  },
];


// Segunda tanda de conjuntos.
SETS.push(
  { id: 'fruit-vegetable', groupLabel: 'fruit', oddLabel: 'a vegetable',
    group: ['apple', 'banana', 'grape'], odd: 'carrot' },
  { id: 'body-clothes', groupLabel: 'parts of your body', oddLabel: 'clothes',
    group: ['arm', 'neck', 'shoulder'], odd: 'scarf' },
  { id: 'farm-sea', groupLabel: 'animals on a farm', oddLabel: 'an animal in the sea',
    group: ['cow', 'goat', 'sheep'], odd: 'dolphin' },
  { id: 'school-kitchen', groupLabel: 'things you write with', oddLabel: 'a thing in the kitchen',
    group: ['pencil', 'ruler', 'eraser'], odd: 'plate' },
  { id: 'wear-eat', groupLabel: 'things you wear', oddLabel: 'a thing you eat',
    group: ['coat', 'helmet', 'sweater'], odd: 'pancake' },
  { id: 'sport-music', groupLabel: 'sports', oddLabel: 'a thing that makes music',
    group: ['tennis', 'hockey', 'badminton'], odd: 'guitar' },
  { id: 'sky-ground2', groupLabel: 'things that can fly', oddLabel: 'a thing on the road',
    group: ['bird', 'plane', 'kite'], odd: 'bus' },
  { id: 'drink-food2', groupLabel: 'things you drink', oddLabel: 'a thing you eat',
    group: ['juice', 'lemonade', 'water'], odd: 'sausage' },
  { id: 'family-friend', groupLabel: 'people in your family', oddLabel: 'a person at school',
    group: ['aunt', 'uncle', 'cousin'], odd: 'teacher' },
  { id: 'wet-dry', groupLabel: 'things with water', oddLabel: 'a very dry place',
    group: ['river', 'lake', 'sea'], odd: 'field' },
  { id: 'toys-food', groupLabel: 'toys', oddLabel: 'food',
    group: ['doll', 'robot', 'balloon'], odd: 'burger' },
  { id: 'hot-cold', groupLabel: 'things you do when it is cold', oddLabel: 'a thing you do when it is hot',
    group: ['put on a coat', 'wear a scarf', 'close the window'], odd: 'go swimming' },
  { id: 'time-place', groupLabel: 'days of the week', oddLabel: 'a place in a town',
    group: ['Monday', 'Friday', 'Sunday'], odd: 'library' },
  { id: 'big-small', groupLabel: 'very big animals', oddLabel: 'a very small animal',
    group: ['elephant', 'whale', 'hippo'], odd: 'bee' },
  { id: 'ill-well', groupLabel: 'things you have when you are ill', oddLabel: 'a person who helps you',
    group: ['cough', 'headache', 'toothache'], odd: 'nurse' },
  { id: 'water-sky', groupLabel: 'things in the sky at night', oddLabel: 'a thing in the sea',
    group: ['moon', 'star', 'cloud'], odd: 'shark' },
);

const ICONS = new Map(
  Object.values(WORDS).flat().map(([word, icon]) => [word, icon]),
);

const iconFor = (word) => ICONS.get(word) ?? '\u2753';

export function buildSet(set) {
  return {
    id: set.id,
    groupLabel: set.groupLabel,
    oddLabel: set.oddLabel,
    oddId: set.odd,
    sentence: `These are all ${set.groupLabel}, but this is ${set.oddLabel}.`,
    items: [
      ...set.group.map((word) => ({ id: word, word, icon: iconFor(word), odd: false })),
      { id: set.odd, word: set.odd, icon: iconFor(set.odd), odd: true },
    ],
  };
}

export const allSets = () => SETS.map(buildSet);

export const groupLabels = () => SETS.map((s) => s.groupLabel);
export const oddLabels = () => SETS.map((s) => s.oddLabel);
