// Parte 4 de Reading and Writing: 5 puntos.
// Texto informativo con cinco huecos y tres opciones cada uno.
// El foco es GRAMATICAL, y a proposito se usan las estructuras nuevas de Movers:
// comparativos, relativos, "because", posesivos y formas verbales.

export const CLOZE_TEXTS = [
  {
    id: 'penguins',
    title: 'Penguins',
    parts: [
      'Penguins are birds, but they ', ' fly. They live in cold places ',
      ' there is a lot of ice and snow. A penguin is ', ' at swimming than at walking. Penguins must swim every day ', ' they eat fish. Baby penguins are grey, but ',
      ' mothers and fathers are black and white.',
    ],
    gaps: [
      { options: ['don\u2019t', 'can\u2019t', 'aren\u2019t'], answer: 1, why: '"Can\u2019t" is for something you are not able to do.' },
      { options: ['who', 'which', 'where'], answer: 2, why: '"Where" is for places.' },
      { options: ['good', 'better', 'best'], answer: 1, why: 'With "than" you need the comparative: better than.' },
      { options: ['but', 'so', 'because'], answer: 2, why: '"Because" gives the reason.' },
      { options: ['they', 'them', 'their'], answer: 2, why: '"Their" says whose mothers and fathers they are.' },
    ],
  },
  {
    id: 'rain',
    title: 'Rain',
    parts: [
      'Rain comes from the clouds ', ' you can see in the sky. When the sun is hot, water from the sea goes ',
      ' into the sky. Then it gets cold and it ', ' down again. Farmers are happy ',
      ' their plants need water. After the rain, a rainbow is ', ' beautiful thing in the sky.',
    ],
    gaps: [
      { options: ['which', 'who', 'where'], answer: 0, why: '"Which" is for things, "who" is for people.' },
      { options: ['on', 'up', 'under'], answer: 1, why: 'The water goes up, into the sky.' },
      { options: ['fall', 'falls', 'falling'], answer: 1, why: '"It" takes the verb with an s: it falls.' },
      { options: ['but', 'so', 'because'], answer: 2, why: '"Because" tells you why they are happy.' },
      { options: ['more', 'the most', 'most'], answer: 1, why: 'Only one thing is the best of all: the most beautiful.' },
    ],
  },
];

// Tipo de actividad del libro de aula: "Write Why or When".
CLOZE_TEXTS.push({
  id: 'questions',
  title: 'At the doctor\u2019s',
  parts: [
    'The doctor asks Vicky some questions. \u201c',
    ' does your head hurt?\u201d \u201cIt started this morning.\u201d \u201c',
    ' are you here?\u201d \u201cBecause I am ill.\u201d \u201c',
    ' does it hurt?\u201d \u201cHere, next to my ear.\u201d \u201c',
    ' is with you today?\u201d \u201cMy mum.\u201d \u201c',
    ' old are you?\u201d \u201cI\u2019m nine.\u201d',
  ],
  gaps: [
    { options: ['Why', 'When', 'Who'], answer: 1, why: '"When" asks about the time.' },
    { options: ['When', 'Where', 'Why'], answer: 2, why: '"Why" asks for the reason. The answer starts with "because".' },
    { options: ['Where', 'Why', 'When'], answer: 0, why: '"Where" asks about the place.' },
    { options: ['What', 'Who', 'When'], answer: 1, why: '"Who" asks about a person.' },
    { options: ['What', 'Why', 'How'], answer: 2, why: '"How old" asks about age.' },
  ],
});


CLOZE_TEXTS.push(
  {
    id: 'elephants', title: 'Elephants',
    parts: [
      'Elephants are the biggest animals ', ' walk on the ground. They eat leaves and fruit, ',
      ' they must eat all day. A baby elephant is smaller ',
      ' its mother, but it is not small! Elephants drink water with ',
      ' long noses. They ', ' swim, too.',
    ],
    gaps: [
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for animals and things.' },
      { options: ['but', 'so', 'because'], answer: 1, why: '"So" tells you what happens next.' },
      { options: ['then', 'than', 'that'], answer: 1, why: 'After "smaller" you need "than".' },
      { options: ['they', 'them', 'their'], answer: 2, why: '"Their" says whose noses they are.' },
      { options: ['can', 'must', 'are'], answer: 0, why: '"Can" is for something you are able to do.' },
    ],
  },
  {
    id: 'school2', title: 'A school in the mountains',
    parts: [
      'This school is ', ' a small village in the mountains. The children ',
      ' to walk for an afternoon to get there, ', ' there is no bus. Last year the school ',
      ' very cold, so the parents made a new roof. Now it is the ', ' school in the country.',
    ],
    gaps: [
      { options: ['on', 'in', 'at'], answer: 1, why: '"In" is for being inside a place.' },
      { options: ['have', 'has', 'having'], answer: 0, why: '"The children" is plural, so it takes "have to".' },
      { options: ['but', 'because', 'so'], answer: 1, why: '"Because" gives the reason.' },
      { options: ['is', 'was', 'were'], answer: 1, why: '"Last year" is the past, and "the school" is one thing.' },
      { options: ['more', 'best', 'better'], answer: 1, why: 'Only one is the best of all.' },
    ],
  },
  {
    id: 'bikes', title: 'Riding a bike',
    parts: [
      'A lot of children go to school ', ' bike. It is quicker ',
      ' walking and you do not need a bus. You ',
      ' wear a helmet, because your head must be safe. Yesterday my sister ',
      ' her bike to the shop and she got there ', ' quickly than me.',
    ],
    gaps: [
      { options: ['by', 'on', 'with'], answer: 0, why: 'We say "by bike", "by bus", "by car".' },
      { options: ['then', 'than', 'that'], answer: 1, why: 'After "quicker" you need "than".' },
      { options: ['must', 'can', 'are'], answer: 0, why: '"Must" is for something you have to do.' },
      { options: ['ride', 'rode', 'riding'], answer: 1, why: '"Yesterday" is the past: rode.' },
      { options: ['most', 'more', 'the most'], answer: 1, why: 'With "than" you need "more quickly than".' },
    ],
  },
);

// Cuatro textos mas (diez en total), cada uno con una estructura de Movers
// que conviene ver mas veces: relativos, comparativos, verbos con -s,
// "because", posesivos, "must" y "can".
CLOZE_TEXTS.push(
  {
    id: 'kangaroos', title: 'Kangaroos',
    parts: [
      'Kangaroos are animals ', ' live in a hot country. They can’t walk well, ',
      ' they can jump very well. A baby kangaroo is ',
      ' than a mouse, and it sleeps in a bag on its mother’s body. Kangaroos eat grass and leaves, and ',
      ' must drink water every day. At night they ', ' under the trees.',
    ],
    gaps: [
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for animals and things, "who" is for people.' },
      { options: ['so', 'but', 'because'], answer: 1, why: '"But" joins two different ideas: they can’t walk well, but they can jump.' },
      { options: ['small', 'smaller', 'smallest'], answer: 1, why: 'With "than" you need the comparative: smaller than.' },
      { options: ['they', 'them', 'their'], answer: 0, why: '"They" is the one that does the action: they must drink.' },
      { options: ['sleep', 'sleeps', 'sleeping'], answer: 0, why: '"They" takes the verb without an s: they sleep.' },
    ],
  },
  {
    id: 'teeth', title: 'Our teeth',
    parts: [
      'Children have twenty teeth, but a grown-up has ', ' than thirty. You must clean your teeth every morning and every night, ',
      ' sweets and chocolate are bad for them. A dentist is a doctor ',
      ' looks at your teeth. You ', ' go to the dentist every year, not only when a tooth hurts. Milk and cheese are good ',
      ' your teeth.',
    ],
    gaps: [
      { options: ['more', 'most', 'many'], answer: 0, why: 'With "than" you need "more": more than thirty.' },
      { options: ['so', 'because', 'but'], answer: 1, why: '"Because" gives the reason.' },
      { options: ['who', 'which', 'where'], answer: 0, why: '"Who" is for people, and a dentist is a person.' },
      { options: ['must', 'can’t', 'mustn’t'], answer: 0, why: '"Must" is for something you have to do.' },
      { options: ['for', 'to', 'at'], answer: 0, why: 'Something is good FOR your teeth.' },
    ],
  },
  {
    id: 'snow', title: 'Snow',
    parts: [
      'Snow is water ', ' is very cold. It falls from the clouds ',
      ' the weather is cold. Children love snow ',
      ' they can play in it all day. In some countries it ', ' every year, but in hot countries children never see it. The ',
      ' mountains in the world have snow at the top all year.',
    ],
    gaps: [
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for things. Water is a thing.' },
      { options: ['when', 'where', 'who'], answer: 0, why: '"When" is for the time: when the weather is cold.' },
      { options: ['because', 'but', 'so'], answer: 0, why: '"Because" tells you why they love it.' },
      { options: ['snow', 'snows', 'snowing'], answer: 1, why: '"It" takes the verb with an s: it snows.' },
      { options: ['big', 'bigger', 'biggest'], answer: 2, why: 'With "the" and more than two things, you need the superlative: the biggest.' },
    ],
  },
  {
    id: 'whales', title: 'Whales',
    parts: [
      'Whales are the biggest animals in the sea, but they are not fish. A whale ', ' swim under the water all morning, but then it has to come up ',
      ' get more water from the sky. Baby whales drink milk from ',
      ' mothers. Some whales sing, and their friends can listen to ', ' from the next island. People ',
      ' to go to the sea in boats to watch whales.',
    ],
    gaps: [
      { options: ['can', 'must', 'is'], answer: 0, why: '"Can" is for something you are able to do.' },
      { options: ['to', 'for', 'at'], answer: 0, why: '"To" + verb says why: it comes up to get.' },
      { options: ['they', 'them', 'their'], answer: 2, why: '"Their" says whose mothers they are.' },
      { options: ['they', 'them', 'its'], answer: 1, why: 'After "listen to" you need "them".' },
      { options: ['like', 'likes', 'liking'], answer: 0, why: '"People" is plural, so the verb has no s: people like.' },
    ],
  },
);

export const randomCloze = (excludeId = null) => {
  const pool = excludeId ? CLOZE_TEXTS.filter((c) => c.id !== excludeId) : CLOZE_TEXTS;
  const list = pool.length ? pool : CLOZE_TEXTS;
  return list[Math.floor(Math.random() * list.length)];
};
