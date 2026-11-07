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
          { p: 'person', x: 46, y: 134, s: 0.9, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'person', x: 84, y: 136, s: 0.8, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 128, y: 132, s: 0.95, o: { who: 'man', shirt: '#2BA84A', tall: true } },
          { p: 'basket', x: 170, y: 138, s: 0.9 },
        ] },
      },
      {
        text: 'They walked up a small mountain. After a long walk, Vicky was tired, so they '
          + 'stopped next to a river and had their picnic there. A goat came and looked at '
          + 'their food. "Don\u2019t feed it!" said their dad.',
        art: { bg: 'field', items: [
          { p: 'mountain', x: 148, y: 96, s: 1.1 },
          { p: 'tree', x: 40, y: 128, s: 0.8 },
          { p: 'person', x: 60, y: 140, s: 0.75, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
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
          { p: 'person', x: 54, y: 142, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
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
          { p: 'person', x: 132, y: 130, s: 0.95, o: { who: 'boy', shirt: '#FFC523' } },
          { p: 'bike', x: 70, y: 136, s: 1.1, o: { colour: '#E33B2E' } },
          { p: 'tree', x: 174, y: 128, s: 0.8 },
        ] },
      },
      {
        text: 'On Sunday morning, Paul rode his bike to the park. His friend Daisy came too. '
          + 'They played football with a white ball. Then they were thirsty, so they bought two '
          + 'milkshakes at the caf\u00e9.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 54, y: 134, s: 0.9, o: { who: 'boy', shirt: '#FFC523' } },
          { p: 'person', x: 96, y: 134, s: 0.9, o: { who: 'girl', shirt: '#8A4FC8', hair: '#F5C542' } },
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
          { p: 'bike', x: 140, y: 140, s: 0.9, o: { colour: '#E33B2E' } },
          { p: 'person', x: 48, y: 134, s: 0.9, o: { who: 'boy', shirt: '#FFC523' } },
          { p: 'person', x: 86, y: 134, s: 0.9, o: { who: 'girl', shirt: '#8A4FC8', hair: '#F5C542' } },
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
          { p: 'person', x: 52, y: 134, s: 0.95, o: { who: 'boy', shirt: '#E33B2E' } },
          { p: 'person', x: 96, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'flower', x: 150, y: 132, s: 1, o: { colour: '#FF6EA6' } },
          { p: 'flower', x: 166, y: 134, s: 0.9, o: { colour: '#FFC523' } },
        ] },
      },
      {
        text: 'It was very windy, so the kite flew up and up. Then the wind took it into a big tree. '
          + 'Jack was sad because he could not climb the tree.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 70, y: 138, s: 0.9, o: { who: 'boy', shirt: '#E33B2E', arm: 'up' } },
          { p: 'string', x: 78.6, y: 85.4, o: { dx: 79.4, dy: -83.4 } },
        ] },
      },
      {
        text: 'A farmer came with his dog. He was tall, so he got the kite for them. '
          + '\u201cThank you!\u201d said Lily. They flew the kite again all afternoon.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 60, y: 138, s: 1, o: { who: 'man', shirt: '#96602F', tall: true } },
          { p: 'dog', x: 108, y: 142, s: 0.8 },
          { p: 'person', x: 156, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Jack got the kite for his', answers: ['birthday'] },
      { text: 'The colours of the kite were', answers: ['red and yellow', 'yellow and red'] },
      { text: 'He went to the park with his sister', answers: ['Lily'] },
      { text: 'The weather was very', answers: ['windy'] },
      { text: 'The kite went into a big', answers: ['tree'] },
      { text: 'Jack could not climb the tree, so he was', answers: ['sad'] },
      { text: 'The person who helped them was a', answers: ['farmer'] },
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
          { p: 'person', x: 60, y: 124, s: 0.95, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'table', x: 130, y: 122, s: 1.1 },
          { p: 'plate', x: 130, y: 96, s: 0.85 },
        ] },
      },
      {
        text: 'First she washed some tomatoes in a big bowl. Then she got the pasta from the '
          + 'cupboard. She had to stand on a chair to get it.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 122, s: 1.2 },
          { p: 'milk', x: 78, y: 94, s: 0.8 },
          { p: 'person', x: 160, y: 124, s: 0.9, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
      {
        text: 'Her dad came home at seven o\u2019clock and they all ate the pasta. \u201cThis is '
          + 'very good,\u201d said her mum. Daisy was happy.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 124, s: 1.3 },
          { p: 'person', x: 40, y: 124, s: 0.9, o: { who: 'man', shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 164, y: 126, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
    ],
    questions: [
      { text: 'Daisy made the dinner because her mum was', answers: ['ill'] },
      { text: 'She wanted to make', answers: ['pasta'] },
      { text: 'She washed some tomatoes in a big', answers: ['bowl'] },
      { text: 'She got the pasta from the', answers: ['cupboard'] },
      { text: 'To get it she had to stand on a', answers: ['chair'] },
      { text: 'Her dad came home at', answers: ['seven', "seven o'clock", '7', "7 o'clock"] },
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
          { p: 'person', x: 120, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 160, y: 134, s: 0.95, o: { who: 'woman', shirt: '#8A4FC8', hair: '#DDDDDD' } },
        ] },
      },
      {
        text: 'Next to the river they saw a small brown dog. It had no family with it and it looked sad. '
          + '“Where is its family?” said Lily. The dog walked behind them to the car park.',
        art: { bg: 'field', items: [
          { p: 'river', x: 150, y: 113, s: 0.9 },
          { p: 'dog', x: 60, y: 142, s: 0.8 },
          { p: 'person', x: 104, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 140, y: 134, s: 0.95, o: { who: 'woman', shirt: '#8A4FC8', hair: '#DDDDDD' } },
        ] },
      },
      {
        text: 'In the car park there was a man with a photo of the dog. “That’s my dog! His name is Sam,” '
          + 'he said. Sam jumped up and down. The man said thank you and Lily smiled.',
        art: { bg: 'field', items: [
          { p: 'car', x: 150, y: 134, s: 0.9 },
          { p: 'person', x: 56, y: 138, s: 1, o: { who: 'man', shirt: '#2BA84A', tall: true } },
          { p: 'dog', x: 96, y: 142, s: 0.8 },
          { p: 'person', x: 124, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
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
          { p: 'person', x: 50, y: 136, s: 0.85, o: { who: 'boy', shirt: '#E33B2E' } },
          { p: 'person', x: 90, y: 136, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0', hair: '#F5C542' } },
          { p: 'person', x: 140, y: 134, s: 1, o: { who: 'woman', shirt: '#2BA84A', tall: true } },
        ] },
      },
      {
        text: 'Inside the circus there was a lot of music. A clown with a red nose rode a very small bike. '
          + 'Then a tall woman stood on a horse and danced. Fred was a little afraid.',
        art: { bg: 'fair', items: [
          { p: 'person', x: 60, y: 136, s: 0.9, o: { who: 'man', nose: '#E5483B', shirt: '#FFC523', hair: '#E33B2E' } },
          { p: 'ball', x: 104, y: 142, s: 0.7, o: { colour: '#1F7BE0' } },
          { p: 'person', x: 156, y: 130, s: 0.9, o: { who: 'woman', shirt: '#FF6EA6', hair: '#F5C542', tall: true } },
        ] },
      },
      {
        text: 'At the end, the clown took the hat from Tom’s head and found a rabbit inside it! '
          + 'Everyone laughed. On the bus home, Fred said, “I want to be a clown.”',
        art: { bg: 'fair', items: [
          { p: 'person', x: 70, y: 136, s: 0.9, o: { who: 'man', nose: '#E5483B', shirt: '#FFC523', hair: '#E33B2E' } },
          { p: 'person', x: 130, y: 136, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0', hair: '#F5C542' } },
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
          { p: 'person', x: 50, y: 124, s: 0.9, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'person', x: 150, y: 124, s: 0.9, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
        ] },
      },
      {
        text: 'In the afternoon the sun came out. The children ran into the garden with the map. '
          + 'They looked behind the trees and under the flowers. Then Sally saw a small box next to the wall.',
        art: { bg: 'garden', items: [
          { p: 'tree', x: 40, y: 128, s: 0.9 },
          { p: 'flower', x: 80, y: 142, s: 0.9 },
          { p: 'flower', x: 96, y: 142, s: 0.8, o: { colour: '#FFC523' } },
          { p: 'person', x: 128, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'box', x: 172, y: 142, s: 0.8 },
        ] },
      },
      {
        text: 'Inside the box there were some old photos and a letter from Grandpa. “This is for you, Jim and Sally,” '
          + 'it said. “Now you can make a new map for your children!” They laughed and ran to find Grandpa.',
        art: { bg: 'garden', items: [
          { p: 'box', x: 100, y: 142, s: 1 },
          { p: 'person', x: 56, y: 136, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'person', x: 146, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
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
          { p: 'person', x: 46, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'person', x: 84, y: 136, s: 0.85, o: { who: 'boy', shirt: '#FFC523' } },
          { p: 'person', x: 150, y: 134, s: 1, o: { who: 'man', shirt: '#2BA84A', tall: true } },
        ] },
      },
      {
        text: 'First the youngest children ran. Then Daisy had to carry a ball on a plate '
          + 'and she could not drop it. She was very slow, but the ball did not fall!',
        art: { bg: 'field', items: [
          { p: 'person', x: 70, y: 136, s: 0.9, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
          { p: 'person', x: 130, y: 138, s: 0.85, o: { who: 'boy', shirt: '#8A4FC8' } },
        ] },
      },
      {
        text: 'The last run was for the parents! Daisy’s dad ran very quickly and he came first. '
          + 'Daisy was so happy that she jumped up and down. “My dad is the best!” she said.',
        art: { bg: 'field', items: [
          { p: 'person', x: 70, y: 134, s: 1, o: { who: 'man', shirt: '#2BA84A', tall: true } },
          { p: 'person', x: 130, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FFC523', hair: '#F5C542' } },
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

// Cuatro historias mas (doce en total): la granja del tio, el cumpleanos de la
// abuela, el lago y un libro de la biblioteca que se pierde. Los dibujos
// cuentan la escena pero no ensenan la palabra que se pide.
READING_STORIES.push(
  {
    id: 'farmday',
    title: 'A morning on the farm',
    sections: [
      {
        text: 'Last Saturday, Zoe and her brother Ben went to their uncle\u2019s farm. Their uncle '
          + 'was a farmer and he had a lot of animals. He gave Zoe a box for the eggs.',
        art: { bg: 'field', items: [
          { p: 'person', x: 58, y: 136, s: 0.85, o: { who: 'girl', shirt: '#FF6EA6', hair: '#F5C542' } },
          { p: 'person', x: 98, y: 137, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
          { p: 'person', x: 148, y: 134, s: 0.95, o: { who: 'man', shirt: '#2BA84A', tall: true } },
          { p: 'tree', x: 170, y: 126, s: 0.6 },
        ] },
      },
      {
        text: 'First they went to see the chickens. Zoe found six eggs in the grass. Then a big '
          + 'brown cow came and looked at Ben. Ben was afraid, but the cow only wanted some grass.',
        art: { bg: 'field', items: [
          { p: 'chicken', x: 34, y: 140, s: 1 },
          { p: 'chicken', x: 62, y: 144, s: 0.85 },
          { p: 'cow', x: 138, y: 128, s: 1.1 },
          { p: 'person', x: 88, y: 140, s: 0.8, o: { who: 'boy', shirt: '#1F7BE0' } },
        ] },
      },
      {
        text: 'At lunch they ate in the kitchen and their aunt made pancakes with the eggs. '
          + '\u201cThese are the best pancakes in the world!\u201d said Ben.',
        art: { bg: 'room', items: [
          { p: 'table', x: 100, y: 122, s: 1.2 },
          { p: 'plate', x: 100, y: 95, s: 0.85 },
          { p: 'person', x: 40, y: 124, s: 0.95, o: { who: 'woman', shirt: '#8A4FC8', tall: true } },
          { p: 'person', x: 162, y: 126, s: 0.85, o: { who: 'boy', shirt: '#1F7BE0' } },
        ] },
      },
    ],
    questions: [
      { text: 'Zoe and Ben went to their uncle\u2019s', answers: ['farm'] },
      { text: 'Their uncle gave Zoe a', answers: ['box'] },
      { text: 'Zoe found six eggs in the', answers: ['grass'] },
      { text: 'The big brown cow looked at', answers: ['Ben'] },
      { text: 'When the cow came, Ben was', answers: ['afraid'] },
      { text: 'Their aunt made pancakes with the', answers: ['eggs'] },
      { text: 'Ben said they were the best pancakes in the', answers: ['world'] },
    ],
  },
  {
    id: 'grandmaparty',
    title: 'A party for Grandma',
    sections: [
      {
        text: 'Last Sunday it was Grandma\u2019s birthday. In the morning, Mary and her mum made a '
          + 'big chocolate cake in the kitchen.',
        art: { bg: 'room', items: [
          { p: 'table', x: 112, y: 122, s: 1.1 },
          { p: 'plate', x: 112, y: 96, s: 0.8 },
          { p: 'person', x: 46, y: 126, s: 0.85, o: { who: 'girl', shirt: '#FFC523', hair: '#6B4423' } },
          { p: 'person', x: 172, y: 124, s: 0.9, o: { who: 'woman', shirt: '#E33B2E', tall: true, hair: '#14204A' } },
        ] },
      },
      {
        text: 'In the afternoon all the family came to Grandma\u2019s flat. Uncle Peter brought his '
          + 'guitar and everyone sang songs. Mary\u2019s little cousin Jack gave Grandma a box with '
          + 'a blue scarf in it.',
        art: { bg: 'room', items: [
          { p: 'person', x: 40, y: 124, s: 0.9, o: { who: 'woman', shirt: '#8A4FC8', tall: true, hair: '#C9C1B2' } },
          { p: 'person', x: 84, y: 126, s: 0.7, o: { who: 'boy', shirt: '#2BA84A' } },
          { p: 'box', x: 112, y: 128, s: 0.8, o: { colour: '#FF6EA6' } },
          { p: 'person', x: 154, y: 124, s: 0.95, o: { who: 'man', shirt: '#1F7BE0', tall: true } },
        ] },
      },
      {
        text: 'Then Mary\u2019s dad took a photo of the family with his new camera. Grandma smiled '
          + 'and said, \u201cThis is my happiest birthday!\u201d',
        art: { bg: 'room', items: [
          { p: 'person', x: 34, y: 126, s: 0.8, o: { who: 'girl', shirt: '#FFC523', hair: '#6B4423' } },
          { p: 'person', x: 72, y: 124, s: 0.9, o: { who: 'woman', shirt: '#8A4FC8', tall: true, hair: '#C9C1B2' } },
          { p: 'person', x: 112, y: 126, s: 0.7, o: { who: 'boy', shirt: '#2BA84A' } },
          { p: 'person', x: 154, y: 124, s: 0.9, o: { who: 'woman', shirt: '#E33B2E', tall: true, hair: '#14204A' } },
        ] },
      },
    ],
    questions: [
      { text: 'In the morning, Mary and her mum made a big', answers: ['chocolate cake', 'cake'] },
      { text: 'They made the cake in the', answers: ['kitchen'] },
      { text: 'The family came to Grandma\u2019s', answers: ['flat'] },
      { text: 'Uncle Peter brought his', answers: ['guitar'] },
      { text: 'Jack is Mary\u2019s little', answers: ['cousin'] },
      { text: 'In the box there was a blue', answers: ['scarf'] },
      { text: 'Mary\u2019s dad took a photo with his new', answers: ['camera'] },
    ],
  },
  {
    id: 'lakeboat',
    title: 'The boat on the lake',
    sections: [
      {
        text: 'On Saturday morning, Peter and his dad went to the lake. They took a small boat '
          + 'and some sandwiches. The water was blue and there were a lot of ducks.',
        art: { bg: 'lake', items: [
          { p: 'tree', x: 30, y: 92, s: 0.6 },
          // Sentados en el barco: se les ve de cintura para arriba.
          { p: 'person', x: 78, y: 128.9, s: 0.55, o: { who: 'boy', shirt: '#FFC523', waist: true } },
          { p: 'person', x: 93, y: 136.9, s: 0.6, o: { who: 'man', shirt: '#1F7BE0', tall: true, waist: true } },
          { p: 'boat', x: 100, y: 124, s: 1.2, o: { colour: '#E33B2E' } },
        ] },
      },
      {
        text: 'On the lake, Peter saw a big fish next to the boat. He wanted to take a photo, '
          + 'but he dropped his camera into the water! Peter was very sad.',
        art: { bg: 'lake', items: [
          { p: 'person', x: 82, y: 128.9, s: 0.55, o: { who: 'boy', shirt: '#FFC523', mood: 'sad', waist: true } },
          { p: 'person', x: 97, y: 136.9, s: 0.6, o: { who: 'man', shirt: '#1F7BE0', tall: true, waist: true } },
          { p: 'boat', x: 104, y: 124, s: 1.2, o: { colour: '#E33B2E' } },
        ] },
      },
      {
        text: 'Then a woman in a green boat came to help. She was a good swimmer and she got the '
          + 'camera from the water. Peter said thank you and gave her a sandwich.',
        art: { bg: 'lake', items: [
          { p: 'person', x: 48, y: 130, s: 0.55, o: { who: 'boy', shirt: '#FFC523', waist: true } },
          { p: 'boat', x: 60, y: 124, s: 1.1, o: { colour: '#E33B2E' } },
          { p: 'person', x: 132, y: 140.8, s: 0.6, o: { who: 'woman', shirt: '#FF6EA6', hair: '#F5C542', tall: true, waist: true } },
          { p: 'boat', x: 146, y: 126, s: 1.1, o: { colour: '#2BA84A' } },
        ] },
      },
    ],
    questions: [
      { text: 'Peter went to the lake with his', answers: ['dad'] },
      { text: 'They took a small boat and some', answers: ['sandwiches'] },
      { text: 'On the lake there were a lot of', answers: ['ducks'] },
      { text: 'Next to the boat, Peter saw a big', answers: ['fish'] },
      { text: 'Peter dropped his', answers: ['camera'] },
      { text: 'The woman in the green boat was a good', answers: ['swimmer'] },
      { text: 'Peter gave the woman a', answers: ['sandwich'] },
    ],
  },
  {
    id: 'librarybook',
    title: 'The lost library book',
    sections: [
      {
        text: 'On Monday, Julia took a book about horses from the school library. She loved it '
          + 'and she read it every night in bed.',
        art: { bg: 'room', items: [
          { p: 'person', x: 64, y: 124, s: 0.95, o: { who: 'girl', shirt: '#2BA84A', hair: '#14204A' } },
          { p: 'table', x: 140, y: 122, s: 1 },
          { p: 'book', x: 140, y: 98, s: 1.1, o: { colour: '#FFC523' } },
        ] },
      },
      {
        text: 'On Friday she had to take the book back, but she couldn\u2019t find it. She looked '
          + 'under her bed and in her school bag. Her brother looked in the kitchen.',
        art: { bg: 'room', items: [
          { p: 'person', x: 70, y: 124, s: 0.95, o: { who: 'girl', shirt: '#2BA84A', hair: '#14204A', mood: 'sad' } },
          { p: 'box', x: 140, y: 132, s: 0.9 },
        ] },
      },
      {
        text: 'Then Julia saw her dog in the garden. He was sleeping on the book! The book was '
          + 'dirty, so Julia cleaned it. Her teacher laughed when Julia told her the story.',
        art: { bg: 'garden', items: [
          { p: 'person', x: 52, y: 134, s: 0.95, o: { who: 'girl', shirt: '#2BA84A', hair: '#14204A' } },
          { p: 'tree', x: 176, y: 128, s: 0.8 },
          // El perro duerme encima del libro.
          { p: 'book', x: 122, y: 141, s: 1.4, o: { colour: '#FFC523' } },
          { p: 'dog', x: 120, y: 127, s: 1, o: { pose: 'sleep' } },
        ] },
      },
    ],
    questions: [
      { text: 'Julia\u2019s book was about', answers: ['horses'] },
      { text: 'Julia got the book from the school', answers: ['library'] },
      { text: 'She read the book every night in', answers: ['bed'] },
      { text: 'Julia had to take the book back on', answers: ['Friday'] },
      { text: 'Her brother looked for the book in the', answers: ['kitchen'] },
      { text: 'The dog was sleeping on the', answers: ['book'] },
      { text: 'When Julia found it, the book was', answers: ['dirty'] },
    ],
  },
);
