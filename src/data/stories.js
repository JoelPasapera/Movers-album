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
          { p: 'person', x: 66, y: 120, s: 1, o: { shirt: '#2BA84A' } },
          { p: 'table', x: 138, y: 120 },
          { p: 'cake', x: 138, y: 96, s: 0.8 },
        ] },
      },
      {
        id: 'p2', sentence: 'He puts the cake on the table.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 122, s: 1.2 },
          { p: 'cake', x: 100, y: 93 },
          { p: 'person', x: 40, y: 120, s: 0.9, o: { shirt: '#2BA84A' } },
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
          { p: 'person', x: 78, y: 128, s: 1.2, o: { shirt: '#2BA84A', mood: 'sad' } },
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
          { p: 'person', x: 72, y: 132, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 122, y: 134, s: 0.95, o: { shirt: '#8A4FC8', tall: true } },
        ] },
      },
      {
        id: 'p2', sentence: 'She finds a shell in the sand.',
        art: { bg: 'beach', items: [
          { p: 'person', x: 66, y: 130, s: 0.95, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'shell', x: 142, y: 132, s: 1.2 },
        ] },
      },
      {
        id: 'p3', sentence: 'A big wave takes her hat.',
        art: { bg: 'beach', items: [
          { p: 'wave', x: 62, y: 100, s: 1.1 },
          { p: 'hat', x: 138, y: 52, s: 1 },
          { p: 'person', x: 150, y: 134, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542', mood: 'scared' } },
        ] },
      },
      {
        id: 'p4', sentence: 'Her mum catches the hat.',
        art: { bg: 'beach', items: [
          { p: 'person', x: 92, y: 136, s: 0.95, o: { shirt: '#8A4FC8', tall: true } },
          { p: 'hat', x: 132, y: 86, s: 0.9 },
          { p: 'person', x: 44, y: 132, s: 0.8, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
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
          { p: 'person', x: 62, y: 132, s: 0.95, o: { shirt: '#1F7BE0' } },
          { p: 'kitten', x: 136, y: 134, s: 1 },
        ] },
      },
      {
        id: 'p2', sentence: 'The kitten climbs up the tree.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 128, y: 130, s: 1 },
          { p: 'kitten', x: 128, y: 92, s: 0.8 },
          { p: 'person', x: 48, y: 134, s: 0.9, o: { shirt: '#1F7BE0', mood: 'scared' } },
        ] },
      },
      {
        id: 'p3', sentence: 'Her dad helps the kitten down.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 148, y: 130, s: 0.9 },
          { p: 'person', x: 92, y: 136, s: 1, o: { shirt: '#96602F', tall: true } },
          { p: 'kitten', x: 46, y: 134, s: 0.85 },
        ] },
      },
      {
        id: 'p4', sentence: 'Vicky gives the kitten some milk.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 66, y: 134, s: 0.95, o: { shirt: '#1F7BE0' } },
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
          { p: 'person', x: 46, y: 134, s: 0.9, o: { shirt: '#E33B2E' } },
          { p: 'person', x: 84, y: 134, s: 0.9, o: { shirt: '#FFC523', hair: '#F5C542' } },
        ] },
      },
      {
        id: 'p2', sentence: 'They buy two tickets.',
        art: { bg: 'fair', items: [
          { p: 'wheel', x: 160, y: 118, s: 0.7 },
          { p: 'ticket', x: 62, y: 92, s: 1 },
          { p: 'ticket', x: 104, y: 96, s: 1 },
          { p: 'person', x: 46, y: 138, s: 0.85, o: { shirt: '#E33B2E' } },
        ] },
      },
      {
        id: 'p3', sentence: 'Daisy is frightened on the ride.',
        art: { bg: 'fair', items: [
          { p: 'wheel', x: 100, y: 122, s: 1.05 },
          { p: 'person', x: 100, y: 74, s: 0.55, o: { shirt: '#FFC523', hair: '#F5C542', mood: 'scared' } },
        ] },
      },
      {
        id: 'p4', sentence: 'Then they eat some ice cream.',
        art: { bg: 'fair', items: [
          { p: 'person', x: 60, y: 136, s: 0.9, o: { shirt: '#E33B2E' } },
          { p: 'person', x: 128, y: 136, s: 0.9, o: { shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'icecream', x: 94, y: 118, s: 1 },
        ] },
      },
    ],
  },
  {
    id: 'picnic',
    title: 'The rainy picnic',
    panels: [
      {
        id: 'p1', given: true, sentence: 'The family have a picnic in the field.',
        art: { bg: 'field', items: [
          { p: 'person', x: 54, y: 138, s: 0.9, o: { shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 96, y: 140, s: 0.8, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
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
          { p: 'person', x: 48, y: 142, s: 0.85, o: { shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 84, y: 144, s: 0.75, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
      {
        id: 'p4', sentence: 'They eat the picnic in the car.',
        art: { bg: 'incar', items: [
          { p: 'person', x: 62, y: 128, s: 0.85, o: { shirt: '#2BA84A' } },
          { p: 'person', x: 132, y: 128, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
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
        art: { bg: 'field', items: [
          { p: 'raincloud', x: 60, y: 40, s: 1 },
          { p: 'tree', x: 156, y: 132, s: 0.9 },
        ] } },
      { id: 'p2', sentence: 'Peter made a big man of snow.',
        art: { bg: 'field', items: [
          { p: 'person', x: 66, y: 136, s: 0.95, o: { shirt: '#1F7BE0' } },
          { p: 'ball', x: 128, y: 140, s: 1.3, o: { colour: '#FFFFFF' } },
        ] } },
      { id: 'p3', sentence: 'He gave it his old hat.',
        art: { bg: 'field', items: [
          { p: 'ball', x: 110, y: 140, s: 1.3, o: { colour: '#FFFFFF' } },
          { p: 'hat', x: 110, y: 104, s: 0.9 },
          { p: 'person', x: 52, y: 138, s: 0.9, o: { shirt: '#1F7BE0' } },
        ] } },
      { id: 'p4', sentence: 'Then the sun came out.',
        art: { bg: 'garden', items: [
          { p: 'hat', x: 112, y: 142, s: 0.9 },
          { p: 'person', x: 56, y: 136, s: 0.9, o: { shirt: '#1F7BE0', mood: 'sad' } },
        ] } },
    ],
  },
  {
    id: 'shop',
    title: 'At the shop',
    panels: [
      { id: 'p1', given: true, sentence: 'Mum gave Lily a bag for the shop.',
        art: { bg: 'room', items: [
          { p: 'person', x: 60, y: 124, s: 0.95, o: { shirt: '#8A4FC8', tall: true } },
          { p: 'person', x: 128, y: 126, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] } },
      { id: 'p2', sentence: 'Lily bought some bread and a cake.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 62, y: 134, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'basket', x: 132, y: 138, s: 1 },
          { p: 'cake', x: 168, y: 138, s: 0.8 },
        ] } },
      { id: 'p3', sentence: 'A big dog took the bread.',
        art: { bg: 'garden', items: [
          { p: 'dog', x: 128, y: 140, s: 1.1 },
          { p: 'person', x: 54, y: 136, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542', mood: 'scared' } },
        ] } },
      { id: 'p4', sentence: 'They ate the cake and laughed.',
        art: { bg: 'room', items: [
          { p: 'table', x: 104, y: 124, s: 1.2 },
          { p: 'cake', x: 104, y: 96, s: 0.85 },
          { p: 'person', x: 44, y: 124, s: 0.9, o: { shirt: '#8A4FC8', tall: true } },
          { p: 'person', x: 164, y: 126, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] } },
    ],
  },
  {
    id: 'birds',
    title: 'The hungry birds',
    panels: [
      { id: 'p1', given: true, sentence: 'Jim saw two birds in the tree.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 140, y: 130, s: 1 },
          { p: 'person', x: 52, y: 134, s: 0.95, o: { shirt: '#2BA84A' } },
        ] } },
      { id: 'p2', sentence: 'He put some bread on the grass.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 60, y: 136, s: 0.9, o: { shirt: '#2BA84A' } },
          { p: 'plate', x: 130, y: 142, s: 1 },
        ] } },
      { id: 'p3', sentence: 'The birds came down and ate it.',
        art: { bg: 'garden', items: [
          { p: 'plate', x: 116, y: 142, s: 1 },
          { p: 'tree', x: 170, y: 130, s: 0.8 },
        ] } },
      { id: 'p4', sentence: 'Jim was very happy.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 100, y: 136, s: 1.1, o: { shirt: '#2BA84A' } },
          { p: 'tree', x: 168, y: 130, s: 0.8 },
        ] } },
    ],
  },
);

export const getStory = (id) => STORIES.find((s) => s.id === id) ?? STORIES[0];
