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

export const randomStory = (excludeId = null) => {
  const pool = excludeId
    ? READING_STORIES.filter((s) => s.id !== excludeId)
    : READING_STORIES;
  const list = pool.length ? pool : READING_STORIES;
  return list[Math.floor(Math.random() * list.length)];
};
