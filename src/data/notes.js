// Formularios para la Parte 2 de Listening: cinco huecos y un ejemplo.
//
// Dos reglas del handbook que cambian la correccion:
// - Los nombres se deletrean letra a letra en la grabacion, y entonces la
//   ortografia tiene que ser perfecta (`spelled: true`).
// - En las demas palabras se admite algun fallo de ortografia.
// - Los numeros se escriben en cifras y llegan hasta 100.

export const NOTE_FORMS = [
  {
    id: 'swimming',
    title: 'Swimming lessons',
    intro: 'Vicky is telling her friend about her swimming lessons.',
    rows: [
      { label: 'Swimming is at:', answer: 'the sports centre', say: 'Swimming is at the sports centre.', example: true },
      { label: 'Day:', answer: 'Saturday', say: 'It is on Saturday.', kind: 'word' },
      { label: 'Starts at:', answer: '9', say: 'It starts at nine o\u2019clock.', kind: 'number' },
      {
        label: 'Teacher\u2019s name:', answer: 'Clare', kind: 'name', spelled: true,
        say: 'The teacher is called Clare. That\u2019s C-L-A-R-E.',
      },
      { label: 'Bring a:', answer: 'towel', say: 'You must bring a towel.', kind: 'word' },
      { label: 'Number of children:', answer: '24', say: 'There are twenty-four children.', kind: 'number' },
    ],
  },
  {
    id: 'party',
    title: 'Daisy\u2019s party',
    intro: 'Daisy is telling her friend about her birthday party.',
    rows: [
      { label: 'Party is on:', answer: 'Friday', say: 'The party is on Friday.', example: true },
      { label: 'Daisy is:', answer: '10', say: 'Daisy is ten years old.', kind: 'number' },
      { label: 'Party is at the:', answer: 'funfair', say: 'The party is at the funfair.', kind: 'word' },
      {
        label: 'Her cousin\u2019s name:', answer: 'Zoe', kind: 'name', spelled: true,
        say: 'Her cousin is called Zoe. That\u2019s Z-O-E.',
      },
      { label: 'Food:', answer: 'pancakes', say: 'They are going to eat pancakes.', kind: 'word' },
      { label: 'Number of friends:', answer: '15', say: 'Fifteen friends are coming.', kind: 'number' },
    ],
  },
  {
    id: 'farm',
    title: 'A day at the farm',
    intro: 'Fred is telling his teacher about the school trip.',
    rows: [
      { label: 'Trip to the:', answer: 'farm', say: 'The trip is to the farm.', example: true },
      { label: 'Go there by:', answer: 'bus', say: 'They go there by bus.', kind: 'word' },
      { label: 'Go to school at:', answer: '8', say: 'They go to school at eight o\u2019clock.', kind: 'number' },
      {
        label: 'Farmer\u2019s name:', answer: 'Peter', kind: 'name', spelled: true,
        say: 'The farmer is called Peter. That\u2019s P-E-T-E-R.',
      },
      { label: 'Favourite animal:', answer: 'goat', say: 'Fred\u2019s favourite animal was the goat.', kind: 'word' },
      { label: 'Number of children:', answer: '32', say: 'Thirty-two children went on the trip.', kind: 'number' },
    ],
  },
];


NOTE_FORMS.push(
  {
    id: 'library', title: 'The school library',
    intro: 'Jack is telling his friend about the school library.',
    rows: [
      { label: 'Library is on the:', answer: 'first floor', say: 'The library is on the first floor.', example: true },
      { label: 'Open on:', answer: 'Wednesday', say: 'It is open on Wednesday.', kind: 'word' },
      { label: 'Books you can take:', answer: '3', say: 'You can take three books.', kind: 'number' },
      { label: 'Teacher\u2019s name:', answer: 'Daisy', kind: 'name', spelled: true,
        say: 'The teacher is called Daisy. That\u2019s D-A-I-S-Y.' },
      { label: 'Best book is about:', answer: 'dolphins', say: 'The best book is about dolphins.', kind: 'word' },
      { label: 'Books in the library:', answer: '85', say: 'There are eighty-five books.', kind: 'number' },
    ],
  },
  {
    id: 'picnic', title: 'A picnic in the park',
    intro: 'Sally is telling her dad about the class picnic.',
    rows: [
      { label: 'Picnic is in the:', answer: 'park', say: 'The picnic is in the park.', example: true },
      { label: 'Day:', answer: 'Thursday', say: 'It is on Thursday.', kind: 'word' },
      { label: 'Start at:', answer: '11', say: 'It starts at eleven o\u2019clock.', kind: 'number' },
      { label: 'Sally brings:', answer: 'pancakes', say: 'Sally brings pancakes.', kind: 'word' },
      { label: 'Friend\u2019s name:', answer: 'Lily', kind: 'name', spelled: true,
        say: 'Her friend is called Lily. That\u2019s L-I-L-Y.' },
      { label: 'Children coming:', answer: '19', say: 'Nineteen children are coming.', kind: 'number' },
    ],
  },
  {
    id: 'newhouse', title: 'Vicky\u2019s new house',
    intro: 'Vicky is telling her teacher about her new house.',
    rows: [
      { label: 'House is in a:', answer: 'village', say: 'The house is in a village.', example: true },
      { label: 'Street name:', answer: 'Green', kind: 'name', spelled: true,
        say: 'The street is called Green. That\u2019s G-R-E-E-N.' },
      { label: 'Rooms in the house:', answer: '7', say: 'There are seven rooms.', kind: 'number' },
      { label: 'In the garden there is a:', answer: 'tree', say: 'In the garden there is a big tree.', kind: 'word' },
      { label: 'Her bedroom is:', answer: 'upstairs', say: 'Her bedroom is upstairs.', kind: 'word' },
      { label: 'Bus to school:', answer: '46', say: 'She takes bus forty-six to school.', kind: 'number' },
    ],
  },
  {
    id: 'sportsday', title: 'Sports day',
    intro: 'Fred is telling his mum about sports day at school.',
    rows: [
      { label: 'Sports day is on:', answer: 'Saturday', say: 'Sports day is on Saturday.', example: true },
      { label: 'Fred does:', answer: 'badminton', say: 'Fred does badminton.', kind: 'word' },
      { label: 'Starts at:', answer: '10', say: 'It starts at ten o\u2019clock.', kind: 'number' },
      { label: 'He must bring:', answer: 'shorts', say: 'He must bring his shorts.', kind: 'word' },
      { label: 'Teacher\u2019s name:', answer: 'Paul', kind: 'name', spelled: true,
        say: 'The teacher is called Paul. That\u2019s P-A-U-L.' },
      { label: 'Children in his class:', answer: '28', say: 'There are twenty-eight children in his class.', kind: 'number' },
    ],
  },
  {
    id: 'zoo', title: 'A day at the zoo',
    intro: 'Daisy is telling her brother about the school trip to the zoo.',
    rows: [
      { label: 'Trip to the:', answer: 'zoo', say: 'The trip is to the zoo.', example: true },
      { label: 'Go there by:', answer: 'train', say: 'They go there by train.', kind: 'word' },
      { label: 'Day:', answer: 'Tuesday', say: 'The trip is on Tuesday.', kind: 'word' },
      { label: 'Favourite animal:', answer: 'penguin', say: 'Her favourite animal is the penguin.', kind: 'word' },
      { label: 'Friend\u2019s name:', answer: 'Jane', kind: 'name', spelled: true,
        say: 'Her friend is called Jane. That\u2019s J-A-N-E.' },
      { label: 'Come home at:', answer: '4', say: 'They come home at four o\u2019clock.', kind: 'number' },
    ],
  },
);

export const randomForm = (excludeId = null) => {
  const pool = excludeId ? NOTE_FORMS.filter((f) => f.id !== excludeId) : NOTE_FORMS;
  const list = pool.length ? pool : NOTE_FORMS;
  return list[Math.floor(Math.random() * list.length)];
};
