// Parte 4 de Reading and Writing: 5 puntos.
// Texto informativo con cinco huecos y tres opciones cada uno.
// El foco es GRAMATICAL, y a proposito se usan las estructuras nuevas de Movers:
// comparativos, relativos, "because", posesivos y formas verbales.

export const CLOZE_TEXTS = [
  {
    id: 'penguins',
    title: 'Penguins',
    parts: [
      'Penguins are birds, but they ', ' fly. Many penguins live in cold places ',
      ' there is a lot of ice and snow. A penguin is ', ' at swimming than at walking. Penguins must swim every day ', ' they eat fish. Baby penguins are grey, but ',
      ' mothers and fathers are black and white.',
    ],
    gaps: [
      { options: ['doesn\u2019t', 'can\u2019t', 'aren\u2019t'], answer: 1, why: 'With "they" you can\u2019t say "doesn\u2019t". "Can\u2019t" is for something you are not able to do.' },
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
    ' did your head start to hurt?\u201d \u201cThis morning.\u201d \u201c',
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
      'Elephants are the biggest animals ', ' walk on the ground. They eat leaves and fruit. They are very big, ',
      ' they must eat all day. A baby elephant is smaller ',
      ' its mother, but it is not small! Elephants drink water with ',
      ' long noses. They ', ' swim, too.',
    ],
    gaps: [
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for animals and things.' },
      { options: ['but', 'so', 'because'], answer: 1, why: '"So" gives the result: they are very big, so they must eat a lot.' },
      { options: ['then', 'than', 'that'], answer: 1, why: 'After "smaller" you need "than".' },
      { options: ['they', 'them', 'their'], answer: 2, why: '"Their" says whose noses they are.' },
      { options: ['can', 'must', 'are'], answer: 0, why: '"Can" is for something you are able to do.' },
    ],
  },
  {
    id: 'school2', title: 'A school in the mountains',
    parts: [
      'This school is ', ' a small village in the mountains. The children ',
      ' to walk up a mountain to get there, ', ' there is no bus. Last year the school ',
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
      ' don’t need a lot of water. When it is hot, they ', ' under the trees.',
    ],
    gaps: [
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for animals and things, "who" is for people.' },
      { options: ['so', 'but', 'because'], answer: 1, why: '"But" joins two different ideas: they can’t walk well, but they can jump.' },
      { options: ['small', 'smaller', 'smallest'], answer: 1, why: 'With "than" you need the comparative: smaller than.' },
      { options: ['they', 'them', 'their'], answer: 0, why: '"They" is the one that does the action: they don’t need.' },
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
      'Snow is ice ', ' comes from the clouds. It falls ',
      ' the weather is very cold. Children love snow ',
      ' they can play in it all day. In some countries it ', ' every year, but in hot countries children never see it. The ',
      ' mountains in the world have snow at the top all year.',
    ],
    gaps: [
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for things. Ice is a thing.' },
      { options: ['when', 'what', 'who'], answer: 0, why: '"When" is for the time: when the weather is very cold.' },
      { options: ['because', 'but', 'so'], answer: 0, why: '"Because" tells you why they love it.' },
      { options: ['snow', 'snows', 'snowing'], answer: 1, why: '"It" takes the verb with an s: it snows.' },
      { options: ['big', 'bigger', 'biggest'], answer: 2, why: 'With "the" and more than two things, you need the superlative: the biggest.' },
    ],
  },
  {
    id: 'whales', title: 'Whales',
    parts: [
      'Whales are the biggest animals in the sea, but they are not fish. A whale ', ' swim under the water, but then it has to come up ',
      ' put its head out of the water. Baby whales drink milk from ',
      ' mothers. Some whales sing, and their friends can listen to ', ' from the next island. People ',
      ' to go to the sea in boats to watch whales.',
    ],
    gaps: [
      { options: ['can', 'must', 'is'], answer: 0, why: '"Can" is for something you are able to do.' },
      { options: ['to', 'for', 'at'], answer: 0, why: '"To" + verb says why: it comes up to put its head out.' },
      { options: ['they', 'them', 'their'], answer: 2, why: '"Their" says whose mothers they are.' },
      { options: ['they', 'them', 'its'], answer: 1, why: 'After "listen to" you need "them".' },
      { options: ['like', 'likes', 'liking'], answer: 0, why: '"People" is plural, so the verb has no s: people like.' },
    ],
  },
);

// Seis textos mas: delfines, murcielagos, ranas, un hospital, un loro y los
// trenes. Cada hueco prueba una cosa de la gramatica de Movers (relativos,
// comparativos, adverbios, posesivos, -ing, "because", tiempos).
CLOZE_TEXTS.push(
  {
    id: 'dolphins', title: 'Dolphins',
    parts: [
      'Dolphins live in the sea, but they are not fish. They are clever animals ', ' can learn games. Dolphins swim ',
      ' than people, and they ', ' jump out of the water. A baby dolphin swims next to ',
      ' mother all day. People love ', ' dolphins from their boats.',
    ],
    gaps: [
      { options: ['who', 'where', 'which'], answer: 2, why: '"Which" is for animals and things, "who" is for people.' },
      { options: ['quickly', 'more quickly', 'most quickly'], answer: 1, why: 'With "than" you need "more quickly".' },
      { options: ['can', 'are', 'has'], answer: 0, why: '"Can" says what an animal is able to do.' },
      { options: ['it', 'it\u2019s', 'its'], answer: 2, why: '"Its" says whose mother: the baby\u2019s mother. "It\u2019s" means "it is".' },
      { options: ['watch', 'watching', 'watches'], answer: 1, why: 'After "love" you can use the -ing form: love watching.' },
    ],
  },
  {
    id: 'bats', title: 'Bats',
    parts: [
      'Bats can fly, but they are not birds. They sleep in the day and they wake up ', ' night. Then they fly out ',
      ' find food. Some bats eat fruit and some eat flies. Baby bats drink milk from ', ' mothers. Farmers like bats ',
      ' they eat a lot of flies. Bats sleep in trees or in old houses ', ' people do not live.',
    ],
    gaps: [
      { options: ['in', 'at', 'on'], answer: 1, why: 'We say "at night", but "in the day".' },
      { options: ['to', 'for', 'at'], answer: 0, why: '"To" + verb says why they go out: to find food.' },
      { options: ['they', 'them', 'their'], answer: 2, why: '"Their" says whose mothers they are.' },
      { options: ['but', 'because', 'so'], answer: 1, why: '"Because" gives the reason why farmers like bats.' },
      { options: ['where', 'who', 'which'], answer: 0, why: '"Where" is for places.' },
    ],
  },
  {
    id: 'frogs', title: 'Frogs',
    parts: [
      'Baby frogs are very small and they live in the water. A baby frog ', ' a long tail, but no legs. Then it ',
      ' legs and it loses its tail. Frogs can jump very ', '. They eat small flies ',
      ' they catch near the water. Frogs ', ' wet places.',
    ],
    gaps: [
      { options: ['have', 'has', 'having'], answer: 1, why: '"A baby frog" is one, so the verb has an s: has.' },
      { options: ['grow', 'growing', 'grows'], answer: 2, why: '"It" takes the verb with an s: it grows.' },
      { options: ['well', 'good', 'better'], answer: 0, why: 'After a verb like "jump" you need "well", not "good".' },
      { options: ['who', 'which', 'where'], answer: 1, why: '"Which" is for animals and things: the flies which they catch.' },
      { options: ['likes', 'liking', 'like'], answer: 2, why: '"Frogs" is more than one, so the verb has no s: frogs like.' },
    ],
  },
  {
    id: 'hospital', title: 'In the hospital',
    parts: [
      'A hospital is a place ', ' doctors and nurses help people ', ' are ill. In a hospital you ',
      ' be quiet. Last week my grandma ', ' to hospital because she hurt her leg. Now she can walk ',
      ' than last week, and she wants to come home.',
    ],
    gaps: [
      { options: ['who', 'where', 'which'], answer: 1, why: '"Where" is for places: a place where\u2026' },
      { options: ['who', 'which', 'where'], answer: 0, why: '"Who" is for people: people who are ill.' },
      { options: ['mustn\u2019t', 'are', 'must'], answer: 2, why: '"Must" is for a rule: you must be quiet.' },
      { options: ['go', 'went', 'goes'], answer: 1, why: '"Last week" is in the past, so you need "went".' },
      { options: ['good', 'best', 'better'], answer: 2, why: 'With "than" you need "better".' },
    ],
  },
  {
    id: 'parrot', title: 'My aunt\u2019s parrot',
    parts: [
      'Parrots are birds from hot countries. They can ', ' words, and some parrots can sing songs. A parrot can live ',
      ' than a dog or a cat. My aunt has a green parrot. ', ' name is Fred. Fred always says \u201cHello!\u201d ',
      ' my aunt comes into the kitchen. It likes ', ' apples and bananas.',
    ],
    gaps: [
      { options: ['says', 'say', 'saying'], answer: 1, why: 'After "can" the verb has no s and no -ing: can say.' },
      { options: ['longer', 'long', 'longest'], answer: 0, why: 'With "than" you need "longer".' },
      { options: ['It', 'It\u2019s', 'Its'], answer: 2, why: '"Its" says whose name it is. "It\u2019s" means "it is".' },
      { options: ['where', 'when', 'who'], answer: 1, why: '"When" says at what moment he says it.' },
      { options: ['eat', 'eats', 'eating'], answer: 2, why: 'After "likes" you can use the -ing form: likes eating.' },
    ],
  },
  {
    id: 'trains', title: 'Trains',
    parts: [
      'Trains are ', ' than buses, and they can carry a lot of people. In big cities, some trains go ',
      ' the ground. The first trains were very slow, ', ' now some trains go very quickly. On a train you can read, sleep or look ',
      ' the fields and the farms. My brother ', ' trains. He wants to be a train driver.',
    ],
    gaps: [
      { options: ['big', 'bigger', 'biggest'], answer: 1, why: 'With "than" you need "bigger".' },
      { options: ['under', 'on', 'in'], answer: 0, why: 'The ground is on top of these trains: they go under it.' },
      { options: ['because', 'so', 'but'], answer: 2, why: '"But" joins two different ideas: slow then, quick now.' },
      { options: ['to', 'at', 'for'], answer: 1, why: 'We say "look at" something.' },
      { options: ['loves', 'love', 'loving'], answer: 0, why: '"My brother" is one person, so the verb has an s: he loves.' },
    ],
  },
);

export const randomCloze = (excludeId = null) => {
  const pool = excludeId ? CLOZE_TEXTS.filter((c) => c.id !== excludeId) : CLOZE_TEXTS;
  const list = pool.length ? pool : CLOZE_TEXTS;
  return list[Math.floor(Math.random() * list.length)];
};
