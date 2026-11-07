// Historias originales de cuatro viñetas, con vocabulario de Starters y Movers.
// La viñeta 1 la cuenta el examinador, igual que en el examen: aquí viene dada.
// Cada viñeta se dibuja con las piezas de scenes/pieces.js.

export const STORIES = [
  {
    id: 'cake',
    title: 'Fred and the cake',
    panels: [
      {
        id: 'p1', given: true, sentence: 'Fred makes a cake for his mum.',
        art: { bg: 'room', items: [
          { p: 'person', x: 66, y: 120, s: 1, o: { who: 'boy', shirt: '#2BA84A' } },
          { p: 'table', x: 138, y: 120 },
          { p: 'cake', x: 138, y: 96, s: 0.8 },
        ] },
      },
      {
        id: 'p2', sentence: 'He puts the cake on the table.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 122, s: 1.2 },
          { p: 'cake', x: 100, y: 93 },
          { p: 'person', x: 40, y: 120, s: 0.9, o: { who: 'boy', shirt: '#2BA84A' } },
        ] },
      },
      {
        id: 'p3', sentence: 'The dog eats all the cake.',
        art: { bg: 'room', items: [
          { p: 'table', x: 118, y: 122, s: 1.1 },
          { p: 'plate', x: 118, y: 96, s: 0.8 },
          { p: 'dog', x: 62, y: 132, s: 1.1 },
        ] },
      },
      {
        id: 'p4', sentence: 'Fred is very sad.',
        art: { bg: 'room', items: [
          { p: 'person', x: 78, y: 128, s: 1.2, o: { who: 'boy', shirt: '#2BA84A', mood: 'sad' } },
          { p: 'plate', x: 142, y: 122, s: 0.9 },
        ] },
      },
    ],
  },
  {
    id: 'beach',
    title: 'Sally at the beach',
    panels: [
      {
        id: 'p1', given: true, sentence: 'Sally goes to the beach with her mum.',
        art: { bg: 'beach', items: [
          { p: 'person', x: 72, y: 132, s: 0.9, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 122, y: 134, s: 0.95, o: { who: 'woman', shirt: '#8A4FC8', tall: true } },
        ] },
      },
      {
        id: 'p2', sentence: 'She finds a shell in the sand.',
        art: { bg: 'beach', items: [
          { p: 'person', x: 66, y: 130, s: 0.95, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'shell', x: 142, y: 132, s: 1.2 },
        ] },
      },
      {
        id: 'p3', sentence: 'A big wave takes her hat.',
        art: { bg: 'beach', items: [
          { p: 'wave', x: 62, y: 100, s: 1.1 },
          { p: 'hat', x: 138, y: 52, s: 1 },
          { p: 'person', x: 150, y: 134, s: 0.9, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542', mood: 'scared' } },
        ] },
      },
      {
        id: 'p4', sentence: 'Her mum catches the hat.',
        art: { bg: 'beach', items: [
          // Mama coge el sombrero al vuelo, con la mano en alto.
          { p: 'person', x: 92, y: 136, s: 0.95, o: { who: 'woman', shirt: '#8A4FC8', tall: true, arm: 'up', holds: { p: 'hat', s: 0.55 } } },
          { p: 'person', x: 44, y: 132, s: 0.8, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
    ],
  },
  {
    id: 'kitten',
    title: 'The lost kitten',
    panels: [
      {
        id: 'p1', given: true, sentence: 'Vicky sees a small kitten in the garden.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 62, y: 132, s: 0.95, o: { who: 'girl', shirt: '#1F7BE0' } },
          { p: 'kitten', x: 136, y: 134, s: 1 },
        ] },
      },
      {
        id: 'p2', sentence: 'The kitten climbs up the tree.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 128, y: 130, s: 1 },
          { p: 'kitten', x: 128, y: 92, s: 0.8 },
          { p: 'person', x: 48, y: 134, s: 0.9, o: { who: 'girl', shirt: '#1F7BE0', mood: 'scared' } },
        ] },
      },
      {
        id: 'p3', sentence: 'Her dad helps the kitten down.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 148, y: 130, s: 0.9 },
          { p: 'person', x: 92, y: 136, s: 1, o: { who: 'man', shirt: '#96602F', tall: true } },
          { p: 'kitten', x: 46, y: 134, s: 0.85 },
        ] },
      },
      {
        id: 'p4', sentence: 'Vicky gives the kitten some food.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 66, y: 134, s: 0.95, o: { who: 'girl', shirt: '#1F7BE0' } },
          { p: 'kitten', x: 140, y: 134, s: 0.95 },
          { p: 'milk', x: 106, y: 134, s: 0.9 },
        ] },
      },
    ],
  },
  {
    id: 'funfair',
    title: 'A day at the funfair',
    panels: [
      {
        id: 'p1', given: true, sentence: 'Jack and Daisy go to the funfair.',
        art: { bg: 'fair', items: [
          { p: 'wheel', x: 146, y: 118, s: 0.9 },
          { p: 'person', x: 46, y: 134, s: 0.9, o: { who: 'boy', shirt: '#E33B2E' } },
          { p: 'person', x: 84, y: 134, s: 0.9, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
        ] },
      },
      {
        id: 'p2', sentence: 'They buy two tickets.',
        art: { bg: 'fair', items: [
          { p: 'wheel', x: 160, y: 118, s: 0.7 },
          // Jack ensena las dos entradas que acaba de comprar; Daisy, a su lado.
          { p: 'person', x: 46, y: 138, s: 0.85, o: { who: 'boy', shirt: '#E33B2E', arm: 'hold', holds: [{ p: 'ticket', s: 0.2, dx: 1, dy: -0.8 }, { p: 'ticket', s: 0.2 }] } },
          { p: 'person', x: 90, y: 138, s: 0.82, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
        ] },
      },
      {
        id: 'p3', sentence: 'Daisy is frightened on the ride.',
        art: { bg: 'fair', items: [
          { p: 'wheel', x: 100, y: 122, s: 1.05 },
          { p: 'person', x: 100, y: 74, s: 0.55, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542', mood: 'scared' } },
        ] },
      },
      {
        id: 'p4', sentence: 'Then they eat some ice cream.',
        art: { bg: 'fair', items: [
          // Cada uno con su helado en la mano.
          { p: 'person', x: 60, y: 136, s: 0.9, o: { who: 'boy', shirt: '#E33B2E', arm: 'hold', holds: { p: 'icecream', s: 0.3 } } },
          { p: 'person', x: 128, y: 136, s: 0.9, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542', arm: 'hold', holds: { p: 'icecream', s: 0.3 } } },
        ] },
      },
    ],
  },
  {
    id: 'picnic',
    title: 'The picnic in the rain',
    panels: [
      {
        id: 'p1', given: true, sentence: 'The family have a picnic in the field.',
        art: { bg: 'field', items: [
          { p: 'person', x: 54, y: 138, s: 0.9, o: { who: 'woman', shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 96, y: 140, s: 0.8, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'basket', x: 146, y: 140, s: 1 },
        ] },
      },
      {
        id: 'p2', sentence: 'The sky is grey and it rains.',
        art: { bg: 'field', items: [
          { p: 'raincloud', x: 66, y: 40, s: 1 },
          { p: 'raincloud', x: 140, y: 54, s: 0.85 },
          { p: 'basket', x: 108, y: 142, s: 0.9 },
        ] },
      },
      {
        id: 'p3', sentence: 'They run to the car.',
        art: { bg: 'field', items: [
          { p: 'raincloud', x: 48, y: 34, s: 0.8 },
          { p: 'car', x: 146, y: 132, s: 0.95 },
          { p: 'person', x: 48, y: 142, s: 0.85, o: { who: 'woman', shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 84, y: 144, s: 0.75, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
      {
        id: 'p4', sentence: 'They eat the picnic in the car.',
        art: { bg: 'incar', items: [
          { p: 'person', x: 62, y: 128, s: 0.85, o: { who: 'woman', shirt: '#2BA84A' } },
          { p: 'person', x: 132, y: 128, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'basket', x: 98, y: 132, s: 0.85 },
        ] },
      },
    ],
  },
];


STORIES.push(
  {
    id: 'snowman',
    title: 'The man of snow',
    panels: [
      { id: 'p1', given: true, sentence: 'It snowed all night in Peter\u2019s garden.',
        art: { bg: 'snow', items: [
          { p: 'snowcloud', x: 60, y: 40, s: 1 },
          { p: 'tree', x: 156, y: 132, s: 0.9, o: { snow: true } },
        ] } },
      { id: 'p2', sentence: 'Peter made a big man of snow.',
        art: { bg: 'snow', items: [
          { p: 'person', x: 66, y: 136, s: 0.95, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'snowman', x: 128, y: 140, s: 1.05 },
        ] } },
      { id: 'p3', sentence: 'He gave it his old hat.',
        art: { bg: 'snow', items: [
          { p: 'snowman', x: 110, y: 140, s: 1.05 },
          { p: 'hat', x: 110, y: 90.6, s: 0.55 },
          { p: 'person', x: 52, y: 138, s: 0.9, o: { who: 'boy', shirt: '#1F7BE0' } },
        ] } },
      { id: 'p4', sentence: 'Then the sun came out.',
        art: { bg: 'garden', items: [
          { p: 'sun', x: 152, y: 34, s: 1 },
          { p: 'snowman', x: 114, y: 142, s: 1, o: { melted: true } },
          { p: 'hat', x: 112, y: 138.4, s: 0.5 },
          { p: 'person', x: 56, y: 136, s: 0.9, o: { who: 'boy', shirt: '#1F7BE0', mood: 'sad' } },
        ] } },
    ],
  },
  {
    id: 'shop',
    title: 'At the shop',
    panels: [
      { id: 'p1', given: true, sentence: 'Mum gave Lily a bag for the shop.',
        art: { bg: 'room', items: [
          // Mama le da la bolsa: la lleva colgada de la mano.
          { p: 'person', x: 60, y: 124, s: 0.95, o: { who: 'woman', shirt: '#8A4FC8', tall: true, arm: 'hold', holds: { p: 'bag', s: 0.75 } } },
          { p: 'person', x: 128, y: 126, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] } },
      { id: 'p2', sentence: 'Lily bought some bread and a cake.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 62, y: 134, s: 0.9, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'bread', x: 86, y: 122, s: 0.6 },
          { p: 'bag', x: 86, y: 134, s: 0.9 },
          { p: 'cake', x: 136, y: 138, s: 0.85 },
        ] } },
      { id: 'p3', sentence: 'A big dog took the bread.',
        art: { bg: 'garden', items: [
          { p: 'dog', x: 128, y: 140, s: 1.1 },
          { p: 'bread', x: 162, y: 118, s: 0.55 },
          { p: 'bag', x: 78, y: 138, s: 0.85 },
          { p: 'person', x: 54, y: 136, s: 0.9, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542', mood: 'scared' } },
        ] } },
      { id: 'p4', sentence: 'They ate the cake and laughed.',
        art: { bg: 'room', items: [
          { p: 'table', x: 104, y: 124, s: 1.2 },
          { p: 'cake', x: 104, y: 96, s: 0.85 },
          { p: 'person', x: 44, y: 124, s: 0.9, o: { who: 'woman', shirt: '#8A4FC8', tall: true } },
          { p: 'person', x: 164, y: 126, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] } },
    ],
  },
  {
    id: 'birds',
    title: 'The hungry birds',
    panels: [
      { id: 'p1', given: true, sentence: 'Jim saw two birds in the tree.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 140, y: 130, s: 1.1 },
          { p: 'bird', x: 126, y: 82, s: 1 },
          { p: 'bird', x: 152, y: 70, s: 1, o: { colour: '#E33B2E' } },
          { p: 'person', x: 52, y: 134, s: 0.95, o: { who: 'boy', shirt: '#2BA84A' } },
        ] } },
      { id: 'p2', sentence: 'He put some fruit on a plate.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 60, y: 136, s: 0.9, o: { who: 'boy', shirt: '#2BA84A' } },
          { p: 'plate', x: 130, y: 142, s: 1 },
          { p: 'fruit', x: 130, y: 141, s: 0.85 },
          { p: 'tree', x: 176, y: 130, s: 0.7 },
        ] } },
      { id: 'p3', sentence: 'The birds came down and ate it.',
        art: { bg: 'garden', items: [
          { p: 'plate', x: 116, y: 142, s: 1 },
          { p: 'fruit', x: 116, y: 141, s: 0.6 },
          { p: 'bird', x: 104, y: 138, s: 1 },
          { p: 'bird', x: 128, y: 138, s: 1, o: { colour: '#E33B2E' } },
          { p: 'tree', x: 172, y: 130, s: 0.8 },
        ] } },
      { id: 'p4', sentence: 'Jim was very happy.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 90, y: 136, s: 1.1, o: { who: 'boy', shirt: '#2BA84A' } },
          { p: 'bird', x: 140, y: 60, s: 1 },
          { p: 'bird', x: 160, y: 48, s: 1, o: { colour: '#E33B2E' } },
          { p: 'tree', x: 172, y: 130, s: 0.8 },
        ] } },
    ],
  },
);

// Cuatro historias mas (doce): una cometa, los huevos de la abuela, un barco
// de papel y una camara nueva. Cada vineta tiene al menos dos palabras que
// cuentan el dibujo (la comprobacion 6 lo exige).
STORIES.push(
  {
    id: 'kiteflying',
    title: 'Paul\u2019s new kite',
    panels: [
      { id: 'p1', given: true, sentence: 'Paul goes to the park with his new kite.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 60, y: 134, s: 0.95, o: { who: 'boy', shirt: '#F5811F', arm: 'up' } },
          { p: 'string', x: 69.1, y: 78.4, o: { dx: 60.9, dy: -10.4 } },
          { p: 'kite', x: 130, y: 70, s: 1, o: { colour: '#1F7BE0' } },
        ] } },
      { id: 'p2', sentence: 'The wind takes the kite into a tree.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 124, y: 134, s: 1.4 },
          { p: 'kite', x: 140, y: 74, s: 0.8, o: { colour: '#1F7BE0' } },
          { p: 'person', x: 46, y: 134, s: 0.9, o: { who: 'boy', shirt: '#F5811F', mood: 'sad' } },
        ] } },
      { id: 'p3', sentence: 'His sister climbs the tree and gets it.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 124, y: 134, s: 1.4 },
          { p: 'person', x: 112, y: 92, s: 0.6, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'kite', x: 142, y: 74, s: 0.8, o: { colour: '#1F7BE0' } },
          { p: 'person', x: 40, y: 134, s: 0.9, o: { who: 'boy', shirt: '#F5811F' } },
        ] } },
      { id: 'p4', sentence: 'Then Paul and his sister fly the kite.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 46, y: 134, s: 0.9, o: { who: 'boy', shirt: '#F5811F' } },
          { p: 'person', x: 84, y: 135, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542', arm: 'up' } },
          { p: 'string', x: 92.1, y: 85.3, o: { dx: 57.9, dy: -33.3 } },
          { p: 'kite', x: 150, y: 54, s: 1, o: { colour: '#1F7BE0' } },
        ] } },
    ],
  },
  {
    id: 'eggs',
    title: 'Jane on the farm',
    panels: [
      { id: 'p1', given: true, sentence: 'Grandma gives Jane a box for the eggs.',
        art: { bg: 'field', items: [
          { p: 'person', x: 58, y: 134, s: 0.9, o: { who: 'woman', shirt: '#8A4FC8', tall: true, hair: '#C9C1B2' } },
          { p: 'box', x: 102, y: 140, s: 0.8 },
          { p: 'person', x: 146, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FFC523' } },
        ] } },
      { id: 'p2', sentence: 'Jane finds three eggs under a chicken.',
        art: { bg: 'field', items: [
          { p: 'chicken', x: 126, y: 130, s: 1.3 },
          { p: 'egg', x: 104, y: 146, s: 1 },
          { p: 'egg', x: 116, y: 148, s: 1 },
          { p: 'egg', x: 128, y: 146, s: 1 },
          { p: 'person', x: 52, y: 136, s: 0.9, o: { who: 'girl', shirt: '#FFC523' } },
        ] } },
      { id: 'p3', sentence: 'A goat eats Jane\u2019s hat.',
        art: { bg: 'field', items: [
          { p: 'goat', x: 124, y: 140, s: 1.3 },
          { p: 'hat', x: 156, y: 118, s: 0.6 },
          { p: 'person', x: 52, y: 136, s: 0.9, o: { who: 'girl', shirt: '#FFC523', mood: 'scared' } },
        ] } },
      { id: 'p4', sentence: 'Grandma laughs and gives her a new hat.',
        art: { bg: 'field', items: [
          { p: 'person', x: 66, y: 134, s: 0.9, o: { who: 'woman', shirt: '#8A4FC8', tall: true, hair: '#C9C1B2' } },
          { p: 'person', x: 128, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FFC523' } },
          { p: 'hat', x: 128, y: 88.4, s: 0.4 },
        ] } },
    ],
  },
  {
    id: 'paperboat',
    title: 'Jim\u2019s paper boat',
    panels: [
      { id: 'p1', given: true, sentence: 'Jim makes a boat from paper.',
        art: { bg: 'room', items: [
          { p: 'person', x: 52, y: 124, s: 0.95, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'table', x: 124, y: 122, s: 1.1 },
          { p: 'boat', x: 124, y: 96, s: 0.55, o: { colour: '#FFFFFF' } },
        ] } },
      { id: 'p2', sentence: 'He puts the boat in the river.',
        art: { bg: 'riverside', items: [
          { p: 'person', x: 48, y: 144, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'boat', x: 108, y: 120, s: 0.6, o: { colour: '#FFFFFF' } },
        ] } },
      { id: 'p3', sentence: 'A duck sits on the boat.',
        art: { bg: 'riverside', items: [
          { p: 'boat', x: 120, y: 118, s: 0.7, o: { colour: '#FFFFFF' } },
          { p: 'duck', x: 112, y: 112, s: 0.8 },
          { p: 'person', x: 48, y: 144, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
        ] } },
      { id: 'p4', sentence: 'The boat goes down the river with the duck.',
        art: { bg: 'riverside', items: [
          { p: 'boat', x: 168, y: 116, s: 0.6, o: { colour: '#FFFFFF' } },
          { p: 'duck', x: 161, y: 111, s: 0.7 },
          { p: 'person', x: 48, y: 144, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
        ] } },
    ],
  },
  {
    id: 'photos',
    title: 'Lily\u2019s new camera',
    panels: [
      { id: 'p1', given: true, sentence: 'Lily gets a camera for her birthday.',
        art: { bg: 'room', items: [
          { p: 'person', x: 64, y: 124, s: 0.95, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'box', x: 128, y: 132, s: 1.1, o: { colour: '#8A4FC8' } },
          { p: 'camera', x: 128, y: 106, s: 0.9 },
        ] } },
      { id: 'p2', sentence: 'She takes a photo of her kitten.',
        art: { bg: 'room', items: [
          { p: 'person', x: 58, y: 124, s: 0.95, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'camera', x: 66, y: 86, s: 0.6 },
          { p: 'kitten', x: 140, y: 132, s: 1.1 },
        ] } },
      { id: 'p3', sentence: 'The kitten jumps into a box.',
        art: { bg: 'room', items: [
          { p: 'kitten', x: 124, y: 112, s: 1 },
          { p: 'box', x: 124, y: 134, s: 1.2 },
          { p: 'person', x: 52, y: 124, s: 0.95, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] } },
      { id: 'p4', sentence: 'Lily shows the photos to her dad.',
        art: { bg: 'room', items: [
          // Lily le ensena la camara a su padre.
          { p: 'person', x: 64, y: 126, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542', arm: 'hold', holds: { p: 'camera', s: 0.26 } } },
          { p: 'person', x: 132, y: 124, s: 0.95, o: { who: 'man', shirt: '#2BA84A', tall: true } },
        ] } },
    ],
  },
);

export const getStory = (id) => STORIES.find((s) => s.id === id) ?? STORIES[0];
