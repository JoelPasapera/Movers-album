// Parte 3 de Reading and Writing: 6 puntos.
// Cinco huecos en una historia mas la eleccion del mejor titulo.
// Nueve palabras en el banco: cuatro sobran.

export const GAP_STORIES = [
  {
    id: 'rabbit',
    parts: [
      'Vicky has a small ', ' at home. Every morning she gives it some ',
      '. Last Sunday the animal was not in its ',
      '. Vicky looked in the garden and under the ',
      '. Then she opened her school bag \u2014 and it was ', ' inside!',
    ],
    answers: ['rabbit', 'carrots', 'cage', 'tree', 'asleep'],
    bank: ['rabbit', 'carrots', 'cage', 'tree', 'asleep', 'kitten', 'milkshake', 'mountain', 'awake'],
    titles: ['A day at school', 'Where is the rabbit?', 'Vicky\u2019s new bike'],
    title: 1,
  },
  {
    id: 'hat',
    parts: [
      'Last Saturday Fred went to the ', ' with his family. It was very ',
      '. Fred\u2019s ', ' flew into the water and a big ',
      ' took it. His sister was very ', ' and she got it for him.',
    ],
    answers: ['beach', 'windy', 'hat', 'wave', 'brave'],
    bank: ['beach', 'windy', 'hat', 'wave', 'brave', 'sunny', 'mountain', 'scarf', 'afraid'],
    titles: ['Fred goes fishing', 'A new hat for Fred', 'A windy day at the beach'],
    title: 2,
  },
];


GAP_STORIES.push(
  {
    id: 'snow',
    parts: [
      'On Monday there was a lot of ', ' in the garden. Peter put on his ',
      ' and his boots. He made a big man of snow and gave it a ',
      '. Then his ', ' came out and they played all ', '.',
    ],
    answers: ['snow', 'coat', 'hat', 'sister', 'morning'],
    bank: ['snow', 'coat', 'hat', 'sister', 'morning', 'rain', 'swimsuit', 'beach', 'night'],
    titles: ['A day at the beach', 'A cold morning in the garden', 'Peter goes to school'],
    title: 1,
  },
  {
    id: 'library2',
    parts: [
      'Mary went to the ', ' to find a book about ',
      '. The teacher helped her and she found a ', ' one with a lot of pictures. She read it in the ',
      ' with her friend ', '.',
    ],
    answers: ['library', 'animals', 'big', 'playground', 'Jane'],
    bank: ['library', 'animals', 'big', 'playground', 'Jane', 'kitchen', 'boots', 'small', 'hospital'],
    titles: ['Mary finds a book', 'A day at the hospital', 'Jane loses her boots'],
    title: 0,
  },
  {
    id: 'market',
    parts: [
      'Every Saturday, Fred goes to the ', ' with his grandmother. They buy fruit and ',
      '. Last week they got two ', ' and some cheese. Then they had a ',
      ' in the park and watched the ', ' in the sky.',
    ],
    answers: ['market', 'vegetables', 'mangoes', 'picnic', 'birds'],
    bank: ['market', 'vegetables', 'mangoes', 'picnic', 'birds', 'cinema', 'helmets', 'homework', 'lorries'],
    titles: ['Fred does his homework', 'Saturday at the market', 'A day at the cinema'],
    title: 1,
  },
  {
    id: 'lostcat',
    parts: [
      'Sally could not find her ', ' on Friday. She looked under her ',
      ' and behind the door. Her brother looked in the ',
      '. In the end they found it asleep in a ', ' next to the ', '.',
    ],
    answers: ['kitten', 'bed', 'garden', 'box', 'window'],
    bank: ['kitten', 'bed', 'garden', 'box', 'window', 'parrot', 'table', 'street', 'roof'],
    titles: ['Where is the kitten?', 'Sally goes to the garden', 'A new parrot for Sally'],
    title: 0,
  },
);

// Cuatro historias mas (diez en total). Las cuatro palabras que sobran son
// del mismo tipo que las que faltan, pero no encajan en ningun hueco.
GAP_STORIES.push(
  {
    id: 'lakepicnic',
    parts: [
      'Last Sunday, Jane and her family had a ', ' by the lake. Her dad put the food on a big ',
      '. A hungry ', ' came and ate a sandwich! Jane’s brother laughed, but her mum was ',
      '. After lunch they walked around the ', ' and saw some ducks.',
    ],
    answers: ['picnic', 'blanket', 'goat', 'angry', 'lake'],
    bank: ['picnic', 'blanket', 'goat', 'angry', 'lake', 'bowl', 'dentist', 'helmet', 'cloudy'],
    titles: ['A picnic by the lake', 'Jane goes to the dentist', 'A new helmet for Jane'],
    title: 0,
  },
  {
    id: 'zootrip',
    parts: [
      'On Saturday Peter went to the ', ' with his class. First they saw the ',
      ', which were eating leaves from the tall trees. Then a ', ' jumped from a rock into the water. Peter took a lot of ',
      ' with his camera. At the end, he bought a small ', ' for his little sister.',
    ],
    answers: ['zoo', 'giraffes', 'penguin', 'photos', 'toy'],
    bank: ['zoo', 'giraffes', 'penguin', 'photos', 'toy', 'stairs', 'coats', 'carrots', 'soup'],
    titles: ['Peter’s day at the zoo', 'A present for Peter', 'Peter is ill'],
    title: 0,
  },
  {
    id: 'wetmorning',
    parts: [
      'Every morning Julia goes to school by ', '. Yesterday the bus did not come because it was ',
      ' a lot. Julia walked with her ', ' and they both carried a bag. They were slow, but the ',
      ' was not angry. At lunch, Julia’s shoes were ', '!',
    ],
    answers: ['bus', 'raining', 'grandpa', 'teacher', 'wet'],
    bank: ['bus', 'raining', 'grandpa', 'teacher', 'wet', 'plane', 'singing', 'farm', 'hungry'],
    titles: ['A wet morning', 'Julia’s new shoes', 'A trip by plane'],
    title: 0,
  },
  {
    id: 'dinnerhelp',
    parts: [
      'Last night Sam helped his mum in the ', '. First he washed the ',
      ' and put them in a bowl. Then he got some ', ' for everyone. His mum made soup with ',
      ' and onions. After dinner, Sam’s dad washed the ', ' and Sam went to bed.',
    ],
    answers: ['kitchen', 'vegetables', 'bread', 'carrots', 'plates'],
    bank: ['kitchen', 'vegetables', 'bread', 'carrots', 'plates', 'library', 'socks', 'kites', 'cows'],
    titles: ['Sam helps with the dinner', 'A day at the library', 'Sam goes to the farm'],
    title: 0,
  },
);

export const randomGapStory = (excludeId = null) => {
  const pool = excludeId ? GAP_STORIES.filter((s) => s.id !== excludeId) : GAP_STORIES;
  const list = pool.length ? pool : GAP_STORIES;
  return list[Math.floor(Math.random() * list.length)];
};
