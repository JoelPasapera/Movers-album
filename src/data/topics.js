import { wordsFor } from './wordlist.js';

const DEFS = [
  { id: 'animals', label: 'Animals', colour: 'green', tint: '#CDEBD3' },
  { id: 'body', label: 'The body and the face', colour: 'pink', tint: '#FBD9E6' },
  { id: 'clothes', label: 'Clothes', colour: 'purple', tint: '#E7DCF7' },
  { id: 'colours', label: 'Colours', colour: 'red', tint: '#FBD7D4' },
  { id: 'family', label: 'Family and friends', colour: 'orange', tint: '#FFE0C7' },
  { id: 'food', label: 'Food and drink', colour: 'yellow', tint: '#FFE9A8' },
  { id: 'health', label: 'Health', colour: 'red', tint: '#FBD7D4' },
  { id: 'home', label: 'The home', colour: 'brown', tint: '#EADBCB' },
  { id: 'names', label: 'Names', colour: 'grey', tint: '#E2E5EC' },
  { id: 'places', label: 'Places and directions', colour: 'purple', tint: '#E7DCF7' },
  { id: 'school', label: 'School', colour: 'blue', tint: '#D7E6FB' },
  { id: 'sports', label: 'Sports and leisure', colour: 'green', tint: '#CDEBD3' },
  { id: 'time', label: 'Days and time', colour: 'blue', tint: '#D7E6FB' },
  { id: 'toys', label: 'Toys', colour: 'orange', tint: '#FFE0C7' },
  { id: 'transport', label: 'Transport', colour: 'brown', tint: '#EADBCB' },
  { id: 'weather', label: 'Weather', colour: 'blue', tint: '#D7E6FB' },
  { id: 'work', label: 'Jobs and work', colour: 'grey', tint: '#E2E5EC' },
  { id: 'world', label: 'The world around us', colour: 'green', tint: '#CDEBD3' },
  { id: 'describing', label: 'Describing words', colour: 'pink', tint: '#FBD9E6' },
  { id: 'doing', label: 'Doing words', colour: 'orange', tint: '#FFE0C7' },
  { id: 'small', label: 'Small words', colour: 'grey', tint: '#E2E5EC' },
  { id: 'hello', label: 'Saying hello and thank you', colour: 'yellow', tint: '#FFE9A8' },
  { id: 'me', label: 'Me and you', colour: 'purple', tint: '#E7DCF7' },
  { id: 'howwhen', label: 'How and when', colour: 'grey', tint: '#E2E5EC' },
  { id: 'things', label: 'More things', colour: 'brown', tint: '#EADBCB' },
];

export const TOPICS = DEFS.map((def) => ({ ...def, words: wordsFor(def.id) }));

export const getTopic = (id) => TOPICS.find((t) => t.id === id) ?? TOPICS[0];
