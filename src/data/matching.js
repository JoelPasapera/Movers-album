// Conjuntos para la Parte 3 de Listening: emparejar personas o dias con
// imagenes marcadas con letras. Siempre sobran dos imagenes, y en el examen
// esas dos tambien se mencionan en el dialogo, asi que no vale con cazar
// la primera palabra que suene.

export const MATCH_SETS = [
  {
    id: 'hobbies',
    intro: 'Vicky\u2019s mum is telling her about the family and what they like doing.',
    leftLabel: 'Her family',
    pairs: [
      { left: 'her son', word: 'fishing', icon: '\u{1F41F}', say: 'My son loves fishing. He goes to the river every Saturday.' },
      { left: 'her uncle', word: 'painting', icon: '\u{1F3A8}', say: 'My uncle wanted to go fishing too, but he likes painting.' },
      { left: 'her cousin', word: 'skating', icon: '\u26F8', say: 'My cousin is very good at skating. She never falls.' },
      { left: 'her brother', word: 'swimming', icon: '\u{1F3CA}', say: 'My brother goes swimming at the sports centre.' },
      { left: 'her daughter', word: 'reading', icon: '\u{1F4D6}', say: 'And my daughter? She reads all day. Reading is her hobby.' },
    ],
    extras: [
      { word: 'dancing', icon: '\u{1F483}' },
      { word: 'cooking', icon: '\u{1F373}' },
    ],
    extraSay: 'My grandmother liked dancing and cooking, but she does not do that now.',
  },
  {
    id: 'presents',
    intro: 'Jack is telling his teacher what his friends got for their birthdays.',
    leftLabel: 'His friends',
    pairs: [
      { left: 'Daisy', word: 'a kite', icon: '\u{1FA81}', say: 'Daisy got a kite. She flies it in the park.' },
      { left: 'Fred', word: 'a guitar', icon: '\u{1F3B8}', say: 'Fred wanted a kite too, but he got a guitar.' },
      { left: 'Vicky', word: 'a camera', icon: '\u{1F4F7}', say: 'Vicky got a camera and now she takes photos of everything.' },
      { left: 'Peter', word: 'a helmet', icon: '\u26D1', say: 'Peter got a helmet for his new bike.' },
      { left: 'Lily', word: 'a parrot', icon: '\u{1F99C}', say: 'And Lily got a parrot! It can say her name.' },
    ],
    extras: [
      { word: 'a robot', icon: '\u{1F916}' },
      { word: 'a watch', icon: '\u231A' },
    ],
    extraSay: 'The shop had a robot and a watch too, but they were too big.',
  },
  {
    id: 'places',
    intro: 'Daisy is telling her mum where the family went last week.',
    leftLabel: 'The days',
    pairs: [
      { left: 'Monday', word: 'the library', icon: '\u{1F4DA}', say: 'On Monday we went to the library.' },
      { left: 'Tuesday', word: 'the market', icon: '\u{1F3EA}', say: 'On Tuesday dad took me to the market.' },
      { left: 'Thursday', word: 'the cinema', icon: '\u{1F3AC}', say: 'We wanted the market again on Thursday, but we went to the cinema.' },
      { left: 'Saturday', word: 'the funfair', icon: '\u{1F3A1}', say: 'On Saturday we went to the funfair. It was the best day.' },
      { left: 'Sunday', word: 'the farm', icon: '\u{1F69C}', say: 'And on Sunday we went to the farm and fed the goats.' },
    ],
    extras: [
      { word: 'the hospital', icon: '\u{1F3E5}' },
      { word: 'the circus', icon: '\u{1F3AA}' },
    ],
    extraSay: 'We did not go to the hospital or the circus this week.',
  },
];


MATCH_SETS.push(
  {
    id: 'clothes', intro: 'Jim is telling his mum what his friends are wearing today.',
    leftLabel: 'His friends',
    pairs: [
      { left: 'Daisy', word: 'a scarf', icon: '\u{1F9E3}', say: 'Daisy is wearing a scarf because it is cold.' },
      { left: 'Fred', word: 'a helmet', icon: '\u26D1', say: 'Fred wanted a scarf too, but he is wearing a helmet.' },
      { left: 'Vicky', word: 'boots', icon: '\u{1F97E}', say: 'Vicky is wearing boots because the grass is wet.' },
      { left: 'Peter', word: 'glasses', icon: '\u{1F453}', say: 'Peter is wearing his new glasses.' },
      { left: 'Lily', word: 'a coat', icon: '\u{1F9E5}', say: 'And Lily is wearing a very big coat.' },
    ],
    extras: [{ word: 'a hat', icon: '\u{1F3A9}' }, { word: 'a swimsuit', icon: '\u{1FA71}' }],
    extraSay: 'There is a hat and a swimsuit at home, but not today.',
  },
  {
    id: 'food', intro: 'Sally is telling her dad what her family had for lunch.',
    leftLabel: 'Her family',
    pairs: [
      { left: 'her mum', word: 'soup', icon: '\u{1F372}', say: 'My mum had soup because she was cold.' },
      { left: 'her dad', word: 'a sandwich', icon: '\u{1F96A}', say: 'My dad wanted soup, but he had a sandwich.' },
      { left: 'her brother', word: 'pasta', icon: '\u{1F35D}', say: 'My brother had pasta. He always has pasta.' },
      { left: 'her aunt', word: 'salad', icon: '\u{1F957}', say: 'My aunt had a big salad.' },
      { left: 'her cousin', word: 'a pancake', icon: '\u{1F95E}', say: 'And my cousin had a pancake.' },
    ],
    extras: [{ word: 'noodles', icon: '\u{1F35C}' }, { word: 'cheese', icon: '\u{1F9C0}' }],
    extraSay: 'There were noodles and cheese too, but we did not eat them.',
  },
  {
    id: 'animals', intro: 'Fred is telling his teacher what his family saw at the zoo.',
    leftLabel: 'His family',
    pairs: [
      { left: 'his sister', word: 'a panda', icon: '\u{1F43C}', say: 'My sister liked the panda best.' },
      { left: 'his mum', word: 'a parrot', icon: '\u{1F99C}', say: 'My mum wanted to see a panda, but she liked the parrot.' },
      { left: 'his dad', word: 'a lion', icon: '\u{1F981}', say: 'My dad took a photo of the lion.' },
      { left: 'his uncle', word: 'a kangaroo', icon: '\u{1F998}', say: 'My uncle laughed at the kangaroo.' },
      { left: 'his grandma', word: 'a penguin', icon: '\u{1F427}', say: 'And my grandma watched the penguins swim.' },
    ],
    extras: [{ word: 'a crocodile', icon: '\u{1F40A}' }, { word: 'a tiger', icon: '\u{1F42F}' }],
    extraSay: 'The crocodile and the tiger were asleep, so we did not see them.',
  },
  {
    id: 'jobs', intro: 'Vicky is telling her friend what the people in her street do.',
    leftLabel: 'The people',
    pairs: [
      { left: 'the woman', word: 'a nurse', icon: '\u{1F9D1}', say: 'The woman next to my house is a nurse.' },
      { left: 'her uncle', word: 'a farmer', icon: '\u{1F468}', say: 'My uncle wanted to be a nurse, but he is a farmer.' },
      { left: 'her aunt', word: 'a cook', icon: '\u{1F373}', say: 'My aunt is a cook in a caf\u00e9.' },
      { left: 'her cousin', word: 'a driver', icon: '\u{1F69A}', say: 'My cousin is a bus driver.' },
      { left: 'her dad', word: 'a doctor', icon: '\u{1FA7A}', say: 'And my dad is a doctor at the hospital.' },
    ],
    extras: [{ word: 'a clown', icon: '\u{1F921}' }, { word: 'a pop star', icon: '\u{1F3A4}' }],
    extraSay: 'There is no clown and no pop star in my street.',
  },
  {
    id: 'weather', intro: 'Jack is telling his class what the weather was like on his holiday.',
    leftLabel: 'The days',
    pairs: [
      { left: 'Monday', word: 'rain', icon: '\u{1F327}', say: 'On Monday there was a lot of rain.' },
      { left: 'Tuesday', word: 'wind', icon: '\u{1F4A8}', say: 'We wanted more rain on Tuesday, but there was only wind.' },
      { left: 'Wednesday', word: 'sun', icon: '\u2600', say: 'On Wednesday there was sun all day.' },
      { left: 'Friday', word: 'snow', icon: '\u2744', say: 'On Friday there was snow on the mountain.' },
      { left: 'Sunday', word: 'a rainbow', icon: '\u{1F308}', say: 'And on Sunday we saw a big rainbow.' },
    ],
    extras: [{ word: 'ice', icon: '\u{1F9CA}' }, { word: 'a cloud', icon: '\u2601' }],
    extraSay: 'There was no ice, and not one cloud on Saturday.',
  },
);

export const randomSet = (excludeId = null) => {
  const pool = excludeId ? MATCH_SETS.filter((s) => s.id !== excludeId) : MATCH_SETS;
  const list = pool.length ? pool : MATCH_SETS;
  return list[Math.floor(Math.random() * list.length)];
};
