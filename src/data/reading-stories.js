// Historias para la Parte 5 de Reading and Writing: tres secciones con dibujo,
// siete frases que completar con una, dos o tres palabras.
//
// Todo va en PASADO SIMPLE a propósito. Es la gramática que separa Movers de
// Starters y la que usan los textos de esta parte del examen.
//
// Regla del handbook que se respeta aquí: los dibujos acompañan pero NUNCA dan
// la respuesta. Todas las respuestas están en el texto.

export const READING_STORIES = [
  {
    id: 'mountain',
    title: 'A day in the countryside',
    sections: [
      {
        text: 'Last Saturday, Jim and his sister Vicky went to the countryside with their '
          + 'dad. They took a big bag with sandwiches, apples and lemonade. It was very '
          + 'sunny, so the children wore hats.',
        art: { bg: 'field', items: [
          { p: 'person', x: 46, y: 134, s: 0.9, o: { shirt: '#1F7BE0' } },
          { p: 'person', x: 84, y: 136, s: 0.8, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 128, y: 132, s: 0.95, o: { shirt: '#2BA84A', tall: true } },
          { p: 'basket', x: 170, y: 138, s: 0.9 },
        ] },
      },
      {
        text: 'They walked up a small mountain. After a long walk, Vicky was tired, so they '
          + 'stopped next to a river and had their picnic there. A goat came and looked at '
          + 'their food. "Don\u2019t feed it!" said their dad.',
        art: { bg: 'field', items: [
          { p: 'mountain', x: 148, y: 96, s: 1.1 },
          { p: 'river', x: 56, y: 122, s: 0.9 },
          { p: 'goat', x: 150, y: 140, s: 0.9 },
          { p: 'person', x: 60, y: 140, s: 0.75, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'basket', x: 100, y: 142, s: 0.8 },
        ] },
      },
      {
        text: 'After lunch the sky got cloudy and it started to rain. They ran down to the '
          + 'car. Jim\u2019s shoes were wet, but he wasn\u2019t sad. "That was the best day!" he said.',
        art: { bg: 'field', items: [
          { p: 'raincloud', x: 54, y: 38, s: 1 },
          { p: 'raincloud', x: 132, y: 50, s: 0.85 },
          { p: 'car', x: 150, y: 134, s: 0.9 },
          { p: 'person', x: 54, y: 142, s: 0.85, o: { shirt: '#1F7BE0' } },
        ] },
      },
    ],
    questions: [
      { text: 'Jim and Vicky went to the countryside with their', answers: ['dad'] },
      { text: 'In the bag there were sandwiches, apples and', answers: ['lemonade'] },
      { text: 'The children wore hats because it was very', answers: ['sunny'] },
      { text: 'They stopped walking because Vicky was', answers: ['tired'] },
      { text: 'They had their picnic next to a', answers: ['river'] },
      { text: 'The animal that looked at their food was a', answers: ['goat'] },
      { text: 'Jim said that it was the', answers: ['best day', 'best day!', 'best'] },
    ],
  },
  {
    id: 'bike',
    title: 'Paul\u2019s new bike',
    sections: [
      {
        text: 'Last week it was Paul\u2019s birthday. His grandparents gave him a new bike. '
          + 'The bike was red and it was bigger than his old one. Paul was very happy.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 132, y: 130, s: 0.95, o: { shirt: '#FFC523' } },
          { p: 'bike', x: 70, y: 136, s: 1.1, o: { colour: '#E33B2E' } },
          { p: 'tree', x: 174, y: 128, s: 0.8 },
        ] },
      },
      {
        text: 'On Sunday morning, Paul rode his bike to the park. His friend Daisy came too. '
          + 'They played football with a white ball. Then they were thirsty, so they bought two '
          + 'milkshakes at the caf\u00e9.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 54, y: 134, s: 0.9, o: { shirt: '#FFC523' } },
          { p: 'person', x: 96, y: 134, s: 0.9, o: { shirt: '#8A4FC8', hair: '#F5C542' } },
          { p: 'ball', x: 76, y: 142, s: 0.9, o: { colour: '#FFFFFF' } },
          { p: 'table', x: 160, y: 138, s: 0.8 },
          { p: 'milk', x: 154, y: 116, s: 0.7 },
          { p: 'milk', x: 168, y: 116, s: 0.7 },
        ] },
      },
      {
        text: 'When they came out of the caf\u00e9, Paul couldn\u2019t find his bike. Daisy found it '
          + 'behind a tree. "You must be careful!" she said. Paul laughed and said thank you.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 140, y: 128, s: 1 },
          { p: 'bike', x: 140, y: 140, s: 0.9, o: { colour: '#E33B2E' } },
          { p: 'person', x: 48, y: 134, s: 0.9, o: { shirt: '#FFC523' } },
          { p: 'person', x: 86, y: 134, s: 0.9, o: { shirt: '#8A4FC8', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Paul got the new bike from his', answers: ['grandparents'] },
      { text: 'The new bike was red and it was', answers: ['bigger'] },
      { text: 'Paul rode to the park on', answers: ['sunday', 'sunday morning'] },
      { text: 'After football the two children were', answers: ['thirsty'] },
      { text: 'They bought their milkshakes at the', answers: ['cafe', 'caf\u00e9'] },
      { text: 'Daisy found the bike behind a', answers: ['tree'] },
      { text: 'Daisy told Paul that he must be', answers: ['careful'] },
    ],
  },
];


READING_STORIES.push(
  {
    id: 'kite',
    title: 'The kite in the tree',
    sections: [
      {
        text: 'Last Sunday, Jack got a new kite for his birthday. It was red and yellow and '
          + 'it was bigger than his old one. He ran to the park with his sister Lily.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 52, y: 134, s: 0.95, o: { shirt: '#E33B2E' } },
          { p: 'person', x: 96, y: 136, s: 0.85, o: { shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'tree', x: 164, y: 128, s: 0.9 },
        ] },
      },
      {
        text: 'It was very windy, so the kite flew up and up. Then the wind took it into a big tree. '
          + 'Jack was sad because he could not climb the tree.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 120, y: 132, s: 1.15 },
          { p: 'person', x: 46, y: 138, s: 0.9, o: { shirt: '#E33B2E', mood: 'sad' } },
        ] },
      },
      {
        text: 'A farmer came with his dog. He was tall, so he got the kite for them. '
          + '\u201cThank you!\u201d said Lily. They flew the kite again all afternoon.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 60, y: 138, s: 1, o: { shirt: '#96602F', tall: true } },
          { p: 'dog', x: 108, y: 142, s: 0.8 },
          { p: 'person', x: 156, y: 136, s: 0.85, o: { shirt: '#FFC523', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Jack got the kite for his', answers: ['birthday'] },
      { text: 'The colours of the kite were', answers: ['red and yellow'] },
      { text: 'He went to the park with his sister', answers: ['Lily'] },
      { text: 'The weather was very', answers: ['windy'] },
      { text: 'The kite went into a big', answers: ['tree'] },
      { text: 'The person who helped them was a', answers: ['farmer'] },
      { text: 'Jack could not climb the tree, so he was', answers: ['sad'] },
    ],
  },
  {
    id: 'kitchen',
    title: 'Daisy makes dinner',
    sections: [
      {
        text: 'On Saturday, Daisy\u2019s mum was ill, so Daisy made the dinner. She wanted to '
          + 'make pasta because it was her mum\u2019s favourite food.',
        art: { bg: 'room', items: [
          { p: 'person', x: 60, y: 124, s: 0.95, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'table', x: 130, y: 122, s: 1.1 },
          { p: 'plate', x: 130, y: 96, s: 0.85 },
        ] },
      },
      {
        text: 'First she put some water in a big bowl. Then she got some cheese from the '
          + 'cupboard. She had to stand on a chair to get it.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 122, s: 1.2 },
          { p: 'milk', x: 78, y: 94, s: 0.8 },
          { p: 'person', x: 160, y: 124, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
      {
        text: 'Her dad came home at seven o\u2019clock and they all ate the pasta. \u201cThis is '
          + 'very good,\u201d said her mum. Daisy was happy.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 124, s: 1.3 },
          { p: 'person', x: 40, y: 124, s: 0.9, o: { shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 164, y: 126, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Daisy made the dinner because her mum was', answers: ['ill'] },
      { text: 'She wanted to make', answers: ['pasta'] },
      { text: 'She put some water in a big', answers: ['bowl'] },
      { text: 'She got the cheese from the', answers: ['cupboard'] },
      { text: 'To get it she had to stand on a', answers: ['chair'] },
      { text: 'Her dad came home at', answers: ['seven', "seven o'clock"] },
      { text: 'At the end of the story Daisy was', answers: ['happy'] },
    ],
  },
);

// Cuatro historias mas (ocho en total). Mismas reglas: pasado simple,
// tres vinetas que acompanan sin dar la respuesta, siete frases de una,
// dos o tres palabras que estan en el texto.
READING_STORIES.push(
  {
    id: 'lostdog',
    title: 'The dog by the river',
    sections: [
      {
        text: 'Last Friday afternoon, Lily and her grandma went for a walk by the river. '
          + 'Grandma took her new camera and Lily took a bag with some bread for the ducks.',
        art: { bg: 'field', items: [
          { p: 'river', x: 60, y: 124, s: 1 },
          { p: 'duck', x: 48, y: 118, s: 0.8 },
          { p: 'person', x: 120, y: 136, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 160, y: 134, s: 0.95, o: { shirt: '#8A4FC8', hair: '#DDDDDD' } },
          { p: 'camera', x: 176, y: 108, s: 0.7 },
        ] },
      },
      {
        text: 'Next to the river they saw a small brown dog. It had no family with it and it looked sad. '
          + '“Where is its family?” said Lily. The dog walked behind them to the car park.',
        art: { bg: 'field', items: [
          { p: 'river', x: 150, y: 122, s: 0.9 },
          { p: 'dog', x: 60, y: 142, s: 0.8 },
          { p: 'person', x: 104, y: 136, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 140, y: 134, s: 0.95, o: { shirt: '#8A4FC8', hair: '#DDDDDD' } },
        ] },
      },
      {
        text: 'In the car park there was a man with a photo of the dog. “That’s my dog! His name is Sam,” '
          + 'he said. Sam jumped up and down. The man said thank you and Lily smiled.',
        art: { bg: 'field', items: [
          { p: 'car', x: 150, y: 134, s: 0.9 },
          { p: 'person', x: 56, y: 138, s: 1, o: { shirt: '#2BA84A', tall: true } },
          { p: 'dog', x: 96, y: 142, s: 0.8 },
          { p: 'person', x: 124, y: 136, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Lily went for a walk with her', answers: ['grandma'] },
      { text: 'Grandma took her new', answers: ['camera'] },
      { text: 'Lily took some bread for the', answers: ['ducks'] },
      { text: 'The dog they saw was small and', answers: ['brown'] },
      { text: 'The dog walked behind them to the', answers: ['car park'] },
      { text: 'The man in the car park had a', answers: ['photo'] },
      { text: 'The name of the dog was', answers: ['Sam'] },
    ],
  },
  {
    id: 'circus',
    title: 'A trip to the circus',
    sections: [
      {
        text: 'On Saturday, Fred’s class went to the circus by bus. Fred sat next to his best friend Tom. '
          + 'The teacher gave every child a ticket.',
        art: { bg: 'fair', items: [
          { p: 'person', x: 50, y: 136, s: 0.85, o: { shirt: '#E33B2E' } },
          { p: 'person', x: 90, y: 136, s: 0.85, o: { shirt: '#1F7BE0', hair: '#F5C542' } },
          { p: 'person', x: 140, y: 134, s: 1, o: { shirt: '#2BA84A', tall: true } },
          { p: 'ticket', x: 176, y: 120, s: 0.9 },
        ] },
      },
      {
        text: 'Inside the circus there was a lot of music. A clown with a red nose rode a very small bike. '
          + 'Then a tall woman stood on a horse and danced. Fred was a little afraid.',
        art: { bg: 'fair', items: [
          { p: 'person', x: 60, y: 136, s: 0.9, o: { shirt: '#FFC523', hair: '#E33B2E' } },
          { p: 'bike', x: 100, y: 142, s: 0.6, o: { colour: '#1F7BE0' } },
          { p: 'person', x: 156, y: 130, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542', tall: true } },
        ] },
      },
      {
        text: 'At the end, the clown took the hat from Tom’s head and found a rabbit inside it! '
          + 'Everyone laughed. On the bus home, Fred said, “I want to be a clown.”',
        art: { bg: 'fair', items: [
          { p: 'person', x: 70, y: 136, s: 0.9, o: { shirt: '#FFC523', hair: '#E33B2E' } },
          { p: 'hat', x: 104, y: 100, s: 1 },
          { p: 'person', x: 130, y: 136, s: 0.85, o: { shirt: '#1F7BE0', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Fred’s class went to the circus by', answers: ['bus'] },
      { text: 'Fred sat next to his best friend', answers: ['Tom'] },
      { text: 'The teacher gave every child a', answers: ['ticket'] },
      { text: 'The clown rode a very small', answers: ['bike'] },
      { text: 'The tall woman danced on a', answers: ['horse'] },
      { text: 'The clown found a rabbit inside Tom’s', answers: ['hat'] },
      { text: 'Fred said he wanted to be a', answers: ['clown'] },
    ],
  },
  {
    id: 'treasure',
    title: 'The box in the garden',
    sections: [
      {
        text: 'Last Sunday it rained all morning, so Jim and his cousin Sally played inside. '
          + 'They found an old map in Grandpa’s cupboard. There was a big red circle on it.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 122, s: 1.1 },
          { p: 'person', x: 50, y: 124, s: 0.9, o: { shirt: '#1F7BE0' } },
          { p: 'person', x: 150, y: 124, s: 0.9, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
      {
        text: 'In the afternoon the sun came out. The children ran into the garden with the map. '
          + 'They looked behind the trees and under the flowers. Then Sally saw a small box next to the wall.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 40, y: 128, s: 0.9 },
          { p: 'flower', x: 80, y: 142, s: 0.9 },
          { p: 'flower', x: 96, y: 142, s: 0.8, o: { colour: '#FFC523' } },
          { p: 'person', x: 128, y: 136, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'box', x: 172, y: 142, s: 0.8 },
        ] },
      },
      {
        text: 'Inside the box there were some old photos and a letter from Grandpa. “This is for you, Jim and Sally,” '
          + 'it said. “Now you can make a new map for your children!” They laughed and ran to find Grandpa.',
        art: { bg: 'garden', items: [
          { p: 'box', x: 100, y: 142, s: 1 },
          { p: 'person', x: 56, y: 136, s: 0.85, o: { shirt: '#1F7BE0' } },
          { p: 'person', x: 146, y: 136, s: 0.85, o: { shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'On Sunday morning, Jim and Sally played', answers: ['inside'] },
      { text: 'They found an old map in Grandpa’s', answers: ['cupboard'] },
      { text: 'On the map there was a big red', answers: ['circle'] },
      { text: 'In the afternoon the children ran into the', answers: ['garden'] },
      { text: 'Sally saw a small box next to the', answers: ['wall'] },
      { text: 'Inside the box there were some old photos and a', answers: ['letter'] },
      { text: 'The letter was from', answers: ['Grandpa'] },
    ],
  },
  {
    id: 'sportsday',
    title: 'Sports day',
    sections: [
      {
        text: 'Last Thursday was sports day at Daisy’s school. The children wore their sports clothes '
          + 'and the parents sat on the grass. Daisy’s dad brought his camera.',
        art: { bg: 'field', items: [
          { p: 'person', x: 46, y: 136, s: 0.85, o: { shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'person', x: 84, y: 136, s: 0.85, o: { shirt: '#FFC523' } },
          { p: 'person', x: 150, y: 134, s: 1, o: { shirt: '#2BA84A', tall: true } },
          { p: 'camera', x: 176, y: 108, s: 0.7 },
        ] },
      },
      {
        text: 'First the youngest children ran. Then Daisy had to carry a ball on a plate '
          + 'and she could not drop it. She was very slow, but the ball did not fall!',
        art: { bg: 'field', items: [
          { p: 'person', x: 90, y: 136, s: 0.9, o: { shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'plate', x: 112, y: 104, s: 0.8 },
          { p: 'ball', x: 112, y: 104, s: 0.5, o: { colour: '#E33B2E' } },
        ] },
      },
      {
        text: 'The last run was for the parents! Daisy’s dad ran very quickly and he came first. '
          + 'Daisy was so happy that she jumped up and down. “My dad is the best!” she said.',
        art: { bg: 'field', items: [
          { p: 'person', x: 70, y: 134, s: 1, o: { shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 130, y: 136, s: 0.85, o: { shirt: '#FFC523', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Sports day was last', answers: ['Thursday'] },
      { text: 'The parents sat on the', answers: ['grass'] },
      { text: 'Daisy’s dad brought his', answers: ['camera'] },
      { text: 'Daisy had to carry a ball on a', answers: ['plate'] },
      { text: 'Daisy was slow, but she did not drop the', answers: ['ball'] },
      { text: 'The last run was for the', answers: ['parents'] },
      { text: 'Daisy’s dad came', answers: ['first'] },
    ],
  },
);

export const randomStory = (excludeId = null) => {
  const pool = excludeId
    ? READING_STORIES.filter((s) => s.id !== excludeId)
    : READING_STORIES;
  const list = pool.length ? pool : READING_STORIES;
  return list[Math.floor(Math.random() * list.length)];
};
