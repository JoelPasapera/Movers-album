// @ts-check
// Tableros tematicos: uno por escena del A1 Movers Wordlist Picture Book.
//
// Del libro se toma el INVENTARIO: que escenas hay y que palabras del wordlist
// senala cada una. Los dibujos, el texto que presenta cada tablero, las
// preguntas de "Let's talk!" y las frases con hueco son propios. Todo el
// ingles pasa la comprobacion 2 (vocabulario de Starters y Movers).
//
// Un tablero alimenta cuatro cosas: la pagina del tablero (las palabras, con
// dibujo del album), Let's talk!, las frases con hueco y el Word gym con solo
// esas palabras.

/**
 * @typedef {Object} TalkQuestion
 * @property {string} say        la pregunta, tal como se lee en voz alta
 * @property {string[] | string} expect  palabras que hacen relevante la respuesta,
 *   o el nombre de un grupo de EXPECT (data/personal-questions.js). Las palabras
 *   del tablero cuentan siempre. Una lista vacia admite cualquier respuesta.
 * @property {string} model      una buena respuesta, que el nino oye despues
 * @property {string} hint       que se espera, por si contesta otra cosa
 */

/**
 * @typedef {Object} Gap
 * @property {string} target  palabra del tablero con dibujo en el album
 * @property {string} text    frase con ___ en el sitio de la palabra
 */

/**
 * @typedef {Object} Board
 * @property {string} id
 * @property {string} title
 * @property {string} colour   nombre de un color de tokens.css
 * @property {string[]} words  entradas del wordlist senaladas en la escena
 * @property {string} intro    texto propio que presenta el tablero
 * @property {TalkQuestion[]} talk
 * @property {Gap[]} gaps
 */

/** @type {Board[]} */
export const BOARDS = [
  {
    id: 'toyshop',
    title: 'The toy shop',
    colour: 'orange',
    words: ['roof', 'bat', 'rabbit', 'kangaroo', 'farmer', 'farm', 'panda', 'shark', 'lion', 'dolphin',
      'parrot', 'cage', 'comic book', 'comic', 'pirate', 'tall', 'clown', 'whale', 'pet', 'puppy',
      'roller skates', 'kitten'],
    intro: 'This is the toy shop in the village. The children want to buy their favourite toys. '
      + 'There are fat teddy bears, funny comic books and a parrot in a cage. '
      + 'Look at the tall clown, the pirate and the farmer on his farm. Which toy do you like best?',
    talk: [
      { say: 'Which toy in the shop do you like best? Why?', expect: ['because', 'toy'],
        model: 'I like the kangaroo best because it can jump.', hint: 'Say a toy and why you like it.' },
      { say: 'Have you got a pet? What is it?', expect: 'animal',
        model: 'Yes, I have got a kitten. It is grey.', hint: 'Say an animal, or say no.' },
      { say: 'What do you play with your friends?', expect: 'hobby',
        model: 'We play with a ball in the park.', hint: 'Say a game or a toy.' },
      { say: 'Which animal is bigger, a whale or a shark?', expect: ['whale', 'shark', 'bigger', 'big'],
        model: 'The whale is bigger than the shark.', hint: 'Say whale or shark.' },
    ],
    gaps: [
      { target: 'kangaroo', text: 'Jack wants the toy that can jump. He buys the ___.' },
      { target: 'parrot', text: 'The bird in the cage can talk. It is a ___.' },
      { target: 'pirate', text: 'This toy has a boat and looks for treasure. It is a ___.' },
      { target: 'clown', text: 'Daisy laughs at the toy with the funny red nose. It is a ___.' },
      { target: 'panda', text: 'Vicky likes the black and white animal that eats leaves. It is a ___.' },
      { target: 'comic', text: 'Fred reads a funny ___ about a dolphin.' },
    ],
  },
  {
    id: 'party',
    title: 'The party',
    colour: 'pink',
    words: ['message', 'son', 'grandson', 'parent', 'glass', 'bottle', 'fly', 'soup', 'bowl', 'blonde',
      'cup', 'hair', 'grandparent', 'cheese', 'cry', 'daughter', 'granddaughter', 'quiet', 'plate',
      'grown-up', 'hide'],
    intro: 'It is a birthday party. The band is playing and everyone is dancing. '
      + 'There is a lot of food and drink: cheese on a plate, soup in a bowl and a bottle of lemonade. '
      + 'Look, there is a fly in the soup! The girl with the blonde hair is crying because her glass fell on the floor. '
      + 'Her grandparents are hiding under the table.',
    talk: [
      { say: 'What do you like to eat at a party?', expect: 'food',
        model: 'I like cake and sandwiches.', hint: 'Say some food.' },
      { say: 'Who comes to your birthday party?', expect: 'people',
        model: 'My cousins and my grandparents come.', hint: 'Say some people.' },
      { say: 'What do you drink when you are thirsty?', expect: 'food',
        model: 'I drink water or juice.', hint: 'Say a drink.' },
      { say: 'Why do you think the girl is crying?', expect: ['because', 'glass', 'sad', 'fell', 'hurt', 'broke', 'floor'],
        model: 'Because her glass fell on the floor.', hint: 'Start with because.' },
    ],
    gaps: [
      { target: 'cheese', text: 'Jim puts some yellow ___ on his bread.' },
      { target: 'soup', text: 'Grandma eats hot ___ from a bowl.' },
      { target: 'bottle', text: 'Peter drinks lemonade from a big ___.' },
      { target: 'cup', text: 'Dad drinks his coffee from a ___.' },
      { target: 'plate', text: 'Mum puts the cake on a ___.' },
      { target: 'bowl', text: 'Sally eats her rice from a ___.' },
    ],
  },
  {
    id: 'doctor',
    title: 'At the doctor’s',
    colour: 'red',
    words: ['tooth', 'stomach', 'teeth', 'curly', 'earache', 'moustache', 'headache', 'cough', 'fat', 'cup',
      'tea', 'hurt', 'better', 'shoulder', 'neck', 'back', 'cold', 'nurse', 'doctor', 'thin', 'plant'],
    intro: 'The doctor is busy today. A boy has got a cough and a cold. A girl has got a headache and her stomach hurts. '
      + 'A man with a moustache has got toothache, and a woman has hurt her shoulder. '
      + 'The nurse is drinking a cup of tea. Who must the doctor see first?',
    talk: [
      { say: 'What do you do when you are ill?', expect: ['bed', 'doctor', 'sleep', 'hospital', 'nurse', 'home', 'water', 'soup'],
        model: 'I go to bed and my mum calls the doctor.', hint: 'Say what you do.' },
      { say: 'How often do you go to the dentist?', expect: ['never', 'sometimes', 'often', 'always', 'every', 'year', 'week', 'twice', 'once'],
        model: 'I go to the dentist every year.', hint: 'Say never, sometimes or every year.' },
      { say: 'What’s the matter with the boy?', expect: ['cough', 'cold', 'ill', 'sick', 'headache', 'hurts', 'hurt', 'stomach', 'temperature'],
        model: 'He has got a cough and a cold.', hint: 'Say what is wrong with him.' },
      { say: 'Do you think it is difficult to be a doctor? Why?', expect: ['yes', 'no', 'because', 'difficult', 'easy'],
        model: 'Yes, because the doctor must help a lot of people.', hint: 'Say yes or no, and why.' },
    ],
    gaps: [
      { target: 'cough', text: 'Fred makes a loud noise. He has got a bad ___.' },
      { target: 'headache', text: 'Lily’s head hurts. She has got a ___.' },
      { target: 'nurse', text: 'This person helps the doctor at the hospital. She is a ___.' },
      { target: 'cold', text: 'Zoe is ill. Her nose is red and she has got a ___.' },
      { target: 'tooth', text: 'Peter has got toothache. The dentist looks at his ___.' },
      { target: 'tea', text: 'The nurse is thirsty. She drinks a cup of ___.' },
    ],
  },
  {
    id: 'hotel',
    title: 'Uncle Charlie’s holiday house',
    colour: 'blue',
    words: ['pool', 'first', 'floor', 'awake', 'dry', 'map', 'world', 'upstairs', 'towel', 'elevator', 'lift',
      'call', 'shower', 'blanket', 'downstairs', 'road', 'wash', 'seat'],
    intro: 'This is the big house where Uncle Charlie works. People from many countries come here on holiday. '
      + 'There is a swimming pool in the basement and a map of the world on the wall. '
      + 'You can go upstairs in the lift. In every room there is a shower, a towel and a big blanket.',
    talk: [
      { say: 'What does Uncle Charlie look like?', expect: ['tall', 'short', 'fat', 'thin', 'hair', 'beard', 'moustache', 'old', 'young', 'glasses', 'curly', 'blonde', 'big', 'happy'],
        model: 'He is tall and he has got a beard.', hint: 'Say how he looks: tall, short, his hair.' },
      { say: 'Where do you sleep when you go on holiday?', expect: 'place',
        model: 'I sleep in my grandma’s house.', hint: 'Say a place.' },
      { say: 'Do you like going upstairs in a lift or on the stairs? Why?', expect: ['lift', 'stairs', 'elevator', 'because'],
        model: 'I like the lift because it is quick.', hint: 'Say lift or stairs, and why.' },
      { say: 'Which country would you like to go to? Why?', expect: [],
        model: 'I would like to go to a country with a beach, because I love swimming.', hint: 'Say a country, or a place you like.' },
    ],
    gaps: [
      { target: 'lift', text: 'Grandpa is tired. He goes upstairs in the ___.' },
      { target: 'towel', text: 'After her shower, Zoe dries her hair with a ___.' },
      { target: 'blanket', text: 'It is cold at night, so Jim sleeps under a big ___.' },
      { target: 'map', text: 'Uncle Charlie shows the children all the countries on his ___.' },
      { target: 'shower', text: 'Mary is dirty after the beach. She has a ___.' },
      { target: 'road', text: 'The bus stops on the ___ in front of the house.' },
    ],
  },
  {
    id: 'countryside',
    title: 'A trip to the countryside',
    colour: 'green',
    words: ['leaf', 'leaves', 'vegetable', 'rainbow', 'river', 'top', 'snow', 'salad', 'treasure', 'plant',
      'mountain', 'grass', 'sandwich', 'bus stop', 'cloud', 'field', 'town', 'rock', 'jungle', 'city',
      'ticket', 'waterfall', 'driver', 'ground', 'bus station', 'forest', 'lake', 'skate', 'island', 'tractor'],
    intro: 'Vicky and Peter go out of the city on a trip. First they take the bus from the bus station. '
      + 'In the countryside there are fields, a river and a waterfall. '
      + 'Then they climb to the top of a mountain where there is snow. '
      + 'After that, they walk into the jungle to look for treasure. What are they going to find?',
    talk: [
      { say: 'Where did you go on your last trip?', expect: 'past',
        model: 'I went to the mountains with my family.', hint: 'Say what you did: I went.' },
      { say: 'Which do you like best: the city, the countryside or the jungle? Why?', expect: ['city', 'countryside', 'jungle', 'because'],
        model: 'I like the countryside because it is quiet.', hint: 'Say one of the three, and why.' },
      { say: 'What can you see at the top of a mountain?', expect: ['snow', 'cloud', 'clouds', 'sky', 'trees', 'tree', 'rock', 'rocks', 'field', 'fields', 'river', 'town', 'lake', 'rainbow', 'bird', 'birds', 'sun'],
        model: 'You can see snow and clouds.', hint: 'Say some things you can see.' },
      { say: 'What do you think is in the treasure box?', expect: [],
        model: 'I think there are a lot of sweets in the box.', hint: 'Say what you think.' },
    ],
    gaps: [
      { target: 'ticket', text: 'Peter buys a ___ at the bus station.' },
      { target: 'waterfall', text: 'The water falls down from the top of the rock. It is a ___.' },
      { target: 'mountain', text: 'They climb to the top of a tall ___.' },
      { target: 'jungle', text: 'There are lots of trees and parrots in the hot ___.' },
      { target: 'rainbow', text: 'After the rain, they see a ___ in the sky.' },
      { target: 'salad', text: 'For lunch Vicky eats a ___ with tomatoes.' },
    ],
  },
  {
    id: 'weather',
    title: 'The weather',
    colour: 'yellow',
    words: ['cloudy', 'rain', 'snow', 'wind', 'windy', 'sunny', 'cloud', 'weather', 'sky', 'ice',
      'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'weekend'],
    intro: 'It is the weekend and Jim has no homework. He wakes up and looks at the weather for the week. '
      + 'Today it is windy and there is a lot of rain. On Sunday it is very cold and there is snow. '
      + 'On Monday it is sunny, and on Tuesday there are clouds. Jim has got clothes for every kind of weather.',
    talk: [
      { say: 'What is the weather like today?', expect: 'weather',
        model: 'It is sunny and hot.', hint: 'Say sunny, cloudy, windy or cold.' },
      { say: 'What was the weather like yesterday?', expect: 'weather',
        model: 'Yesterday it was cloudy and it rained.', hint: 'Say how it was yesterday.' },
      { say: 'What do you wear when it rains?', expect: 'clothes',
        model: 'I wear my coat and my boots.', hint: 'Say some clothes.' },
      { say: 'What kind of weather do you like best? Why?', expect: 'weather',
        model: 'I like snow best because I can play outside.', hint: 'Say a kind of weather, and why.' },
    ],
    gaps: [
      { target: 'rain', text: 'Jim needs his coat today because there is a lot of ___.' },
      { target: 'snow', text: 'It is very cold and white. The children play in the ___.' },
      { target: 'wind', text: 'Lily’s kite flies well because there is a lot of ___.' },
      { target: 'sunny', text: 'There are no clouds today and it is hot. It is ___.' },
      { target: 'cloud', text: 'There is a big grey ___ in the sky.' },
      { target: 'ice', text: 'The water in the lake is very cold. Now it is ___.' },
    ],
  },
  {
    id: 'town',
    title: 'Our town',
    colour: 'purple',
    words: ['circle', 'square', 'carry', 'station', 'market', 'café', 'slow', 'centre', 'drop',
      'sports centre', 'place', 'city centre', 'straight', 'supermarket', 'library', 'shopping centre'],
    intro: 'The children go to the town centre. There is a market in the square where you can buy vegetables and fruit. '
      + 'Opposite the market there is a library. The sports centre is next to the station, '
      + 'and the shopping centre is at the end of the street. Go straight on to find the café.',
    talk: [
      { say: 'Where can you eat lunch in the town centre?', expect: 'place',
        model: 'You can eat in the café next to the market.', hint: 'Say a place.' },
      { say: 'Where do you go after school?', expect: 'place',
        model: 'I go to the sports centre.', hint: 'Say a place.' },
      { say: 'Which do you like best, a shopping centre or a sports centre? Why?', expect: ['shopping', 'sports', 'centre', 'because'],
        model: 'I like the sports centre because I can swim there.', hint: 'Say one of the two, and why.' },
      { say: 'How do you get to the library from your house?', expect: ['walk', 'bus', 'car', 'bike', 'straight', 'right', 'next', 'near', 'opposite', 'train', 'behind', 'street', 'road'],
        model: 'I walk straight on, and the library is next to the station.', hint: 'Say how you go: walk, by bus, straight on.' },
    ],
    gaps: [
      { target: 'library', text: 'Daisy wants a book about whales. She goes to the ___.' },
      { target: 'station', text: 'Dad takes the train to work from the ___.' },
      { target: 'supermarket', text: 'Mum buys bread, milk and eggs at the ___.' },
      { target: 'square', text: 'The market is in the town ___.' },
      { target: 'market', text: 'Grandma buys her vegetables at the ___ in the square.' },
      { target: 'centre', text: 'All the shops are in the town ___.' },
    ],
  },
  {
    id: 'holidays',
    title: 'Dreaming of holidays',
    colour: 'brown',
    words: ['hop', 'sail', 'text', 'moon', 'fishing', 'DVD', 'email', 'video', 'laugh', 'website',
      'dress up', 'skip', 'kick', 'bat'],
    intro: 'The holidays start on Friday. Jane is dreaming of all the things she wants to do. '
      + 'She wants to sail on the sea, go fishing with her dad and watch a DVD about dolphins. '
      + 'She wants to send an email to her cousin and laugh with her friends. At night she wants to look at the moon.',
    talk: [
      { say: 'When do you go on holiday?', expect: 'day',
        model: 'I go on holiday at the weekend with my family.', hint: 'Say when.' },
      { say: 'What was your best holiday? What did you do?', expect: 'past',
        model: 'I went to the beach and I swam in the sea.', hint: 'Say what you did: I went, I saw.' },
      { say: 'What do you like doing on holiday?', expect: 'hobby',
        model: 'I like fishing with my grandpa.', hint: 'Say a hobby.' },
      { say: 'Who do you send emails or messages to?', expect: 'people',
        model: 'I send messages to my cousin.', hint: 'Say a person.' },
    ],
    gaps: [
      { target: 'moon', text: 'At night Jane looks at the stars and the ___.' },
      { target: 'DVD', text: 'Fred watches a ___ about pirates on the computer.' },
      { target: 'email', text: 'Jane sends an ___ to her cousin in the city.' },
      { target: 'video', text: 'Jim makes a funny ___ with his camera.' },
      { target: 'laugh', text: 'The clown is very funny. All the children ___.' },
      { target: 'website', text: 'Vicky reads about dolphins on a ___ about the sea.' },
    ],
  },
];

/**
 * Juegos que admiten jugarse con las palabras de un tablero (reciben
 * `ctx.boardId`). El texto es el que ve el nino en la pagina del tablero.
 * @type {{ id: string, blurb: string }[]}
 */
export const BOARD_GAMES = [
  { id: 'talkpicture', blurb: 'Four questions about this board. Say your answer, then write it.' },
  { id: 'picturegap', blurb: 'Six sentences about this board with a word missing.' },
  { id: 'vocab', blurb: 'Only the words on this board. Listen, tap, write.' },
];

/** @param {string} id */
export const getBoard = (id) => BOARDS.find((b) => b.id === id) ?? null;

/** Todas las frases con hueco de todos los tableros. */
export const boardGaps = () => BOARDS.flatMap((b) => b.gaps);
