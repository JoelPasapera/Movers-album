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
    intro: 'Daisy\u2019s mum is telling a friend about Daisy\u2019s birthday party.',
    rows: [
      { label: 'Party is on:', answer: 'Friday', say: 'The party is on Friday.', example: true },
      { label: 'Daisy is:', answer: '10', say: 'Daisy is ten years old.', kind: 'number' },
      { label: 'Party is at the:', answer: 'funfair', say: 'The party is at the funfair.', kind: 'word' },
      {
        label: 'Her cousin\u2019s name:', answer: 'Zoe', kind: 'name', spelled: true,
        say: 'Her cousin is called Zoe. That\u2019s Z-O-E.',
      },
      { label: 'Food:', answer: 'pancakes', say: 'The children want to eat pancakes.', kind: 'word' },
      { label: 'Number of friends:', answer: '15', say: 'Fifteen friends are coming.', kind: 'number' },
    ],
  },
  {
    id: 'farm',
    title: 'A day at the farm',
    intro: 'Fred\u2019s teacher is telling his dad about the school trip.',
    rows: [
      { label: 'Trip to the:', answer: 'farm', say: 'The trip was to the farm.', example: true },
      { label: 'Went there by:', answer: 'bus', say: 'They went there by bus.', kind: 'word' },
      { label: 'The bus came at:', answer: '8', say: 'The bus came at eight o\u2019clock.', kind: 'number' },
      {
        label: 'Farmer\u2019s name:', answer: 'Peter', kind: 'name', spelled: true,
        say: 'The farmer was called Peter. That\u2019s P-E-T-E-R.',
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
    intro: 'Sally\u2019s teacher is telling her mum about the class picnic.',
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
    intro: 'Vicky\u2019s mum is telling the teacher about their new house.',
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
    intro: 'Fred\u2019s teacher is telling his mum about sports day.',
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
    intro: 'Daisy\u2019s teacher is telling her dad about the school trip to the zoo.',
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

// Cuatro formularios mas (doce). Como en la grabacion real, a veces se dice
// primero lo que NO es ("Not on Tuesday. It\u2019s on Thursday."): hay que
// escuchar hasta el final de la frase.
NOTE_FORMS.push(
  {
    id: 'grandpa',
    title: 'A present for Grandpa',
    intro: 'Jack is telling his mum about a present for his grandpa.',
    rows: [
      { label: 'Present for:', answer: 'Grandpa', say: 'The present is for Grandpa.', example: true },
      { label: 'Present:', answer: 'scarf', say: 'Not a hat. We want to buy him a scarf.', kind: 'word' },
      { label: 'Colour:', answer: 'brown', say: 'Grandpa likes brown, so we can get a brown one.', kind: 'word' },
      { label: 'Grandpa\u2019s dog is called:', answer: 'Sam', kind: 'name', spelled: true,
        say: 'Grandpa\u2019s dog is called Sam. That\u2019s S-A-M.' },
      { label: 'Grandpa is:', answer: '70', say: 'Grandpa is seventy years old.', kind: 'number' },
      { label: 'Party day:', answer: 'Sunday', say: 'His party isn\u2019t on Saturday. It\u2019s on Sunday.', kind: 'word' },
    ],
  },
  {
    id: 'guitar',
    title: 'Guitar lessons',
    intro: 'Julia is telling her dad about her new guitar lessons.',
    rows: [
      { label: 'Lesson:', answer: 'guitar', say: 'My new lesson is the guitar.', example: true },
      { label: 'Day:', answer: 'Thursday', say: 'The lesson isn\u2019t on Tuesday. It\u2019s on Thursday.', kind: 'word' },
      { label: 'Starts at:', answer: '5', say: 'It starts at five o\u2019clock, after school.', kind: 'number' },
      { label: 'Teacher\u2019s name:', answer: 'Grace', kind: 'name', spelled: true,
        say: 'The teacher is called Grace. That\u2019s G-R-A-C-E.' },
      { label: 'Bring a:', answer: 'pencil', say: 'I must bring a pencil, not a pen.', kind: 'word' },
      { label: 'Children in the class:', answer: '6', say: 'There are only six children in the class.', kind: 'number' },
    ],
  },
  {
    id: 'beachday',
    title: 'A day at the beach',
    intro: 'Paul is telling his grandma about his day at the beach.',
    rows: [
      { label: 'Trip to the:', answer: 'beach', say: 'We went to the beach.', example: true },
      { label: 'Went with his:', answer: 'uncle', say: 'I didn\u2019t go with my dad. I went with my uncle.', kind: 'word' },
      { label: 'Got there by:', answer: 'car', say: 'We went there by car.', kind: 'word' },
      { label: 'Name of the boat:', answer: 'Mary', kind: 'name', spelled: true,
        say: 'We went on my uncle\u2019s boat. It\u2019s called Mary. That\u2019s M-A-R-Y.' },
      { label: 'Shells he found:', answer: '17', say: 'I found seventeen shells.', kind: 'number' },
      { label: 'Came home at:', answer: '6', say: 'We came home at six o\u2019clock.', kind: 'number' },
    ],
  },
  {
    id: 'rabbit',
    title: 'Lily\u2019s new pet',
    intro: 'Lily is telling her teacher about her new pet.',
    rows: [
      { label: 'Pet:', answer: 'rabbit', say: 'My new pet is a rabbit.', example: true },
      { label: 'Rabbit\u2019s name:', answer: 'Lucy', kind: 'name', spelled: true,
        say: 'Her name is Lucy. That\u2019s L-U-C-Y.' },
      { label: 'Colour:', answer: 'grey', say: 'She isn\u2019t white. She\u2019s grey.', kind: 'word' },
      { label: 'Age in weeks:', answer: '9', say: 'She is nine weeks old.', kind: 'number' },
      { label: 'Favourite food:', answer: 'carrots', say: 'She likes apples, but her favourite food is carrots.', kind: 'word' },
      { label: 'Sleeps in the:', answer: 'garden', say: 'She sleeps in the garden.', kind: 'word' },
    ],
  },
);

export const randomForm = (excludeId = null) => {
  const pool = excludeId ? NOTE_FORMS.filter((f) => f.id !== excludeId) : NOTE_FORMS;
  const list = pool.length ? pool : NOTE_FORMS;
  return list[Math.floor(Math.random() * list.length)];
};
