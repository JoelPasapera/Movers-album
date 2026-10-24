// Preguntas de la Parte 4 de Speaking. El handbook indica los temas:
// colegio, fines de semana, amigos, aficiones, casa, comida, familia.
// Se esperan respuestas de una a cuatro palabras, en presente y a veces en pasado.

// Conjuntos de palabras que hacen que una respuesta sea relevante.
// Salen del syllabus COMPLETO (Starters + Movers), no solo del album: un nino
// que conteste "dog" o "cat" esta contestando bien aunque esas palabras no
// esten entre los cromos.

export const EXPECT = {
  animal: ['animal', 'bear', 'bee', 'bird', 'cat', 'chicken', 'cow', 'crocodile', 'dog',
    'donkey', 'duck', 'elephant', 'fish', 'frog', 'giraffe', 'goat', 'hippo', 'horse',
    'jellyfish', 'lizard', 'monkey', 'mouse', 'mice', 'pet', 'polar bear', 'sheep',
    'snake', 'spider', 'tiger', 'zebra', 'bat', 'dolphin', 'fly', 'kangaroo', 'kitten',
    'lion', 'panda', 'parrot', 'penguin', 'puppy', 'rabbit', 'shark', 'snail', 'whale'],

  food: ['apple', 'banana', 'bean', 'bread', 'breakfast', 'burger', 'cake', 'candy',
    'carrot', 'cheese', 'chicken', 'chips', 'chocolate', 'coconut', 'coffee', 'dinner',
    'egg', 'fish', 'food', 'fries', 'fruit', 'grape', 'ice', 'juice', 'kiwi', 'lemon',
    'lemonade', 'lime', 'lunch', 'mango', 'meat', 'meatballs', 'milk', 'milkshake',
    'noodles', 'onion', 'orange', 'pancake', 'pasta', 'pea', 'pear', 'picnic', 'pie',
    'pineapple', 'potato', 'rice', 'salad', 'sandwich', 'sauce', 'sausage', 'soup',
    'sweet', 'sweets', 'tea', 'tomato', 'vegetable', 'water', 'watermelon'],

  place: ['beach', 'bookshop', 'building', 'bus station', 'bus stop', 'cafe', 'car park',
    'cinema', 'circus', 'city', 'farm', 'forest', 'funfair', 'garden', 'home', 'hospital',
    'house', 'island', 'lake', 'library', 'market', 'mountain', 'park', 'playground',
    'pool', 'river', 'school', 'sea', 'shop', 'shopping', 'square', 'station', 'store',
    'supermarket', 'swimming', 'town', 'village', 'zoo', 'centre', 'countryside'],

  weather: ['sunny', 'cloudy', 'windy', 'rain', 'raining', 'snow', 'snowing', 'cloud',
    'hot', 'cold', 'wet', 'dry', 'sun', 'ice', 'rainbow', 'wind', 'weather', 'sky'],

  clothes: ['coat', 'scarf', 'sweater', 'helmet', 'swimsuit', 'jacket', 'jeans', 'shirt',
    'shoe', 'shoes', 'shorts', 'skirt', 'sock', 'socks', 'trousers', 'dress', 'hat',
    'boots', 'glasses', 'cap', 'clothes'],

  day: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday',
    'weekend', 'today', 'yesterday', 'day'],

  colour: ['red', 'blue', 'green', 'yellow', 'orange', 'purple', 'pink', 'brown',
    'grey', 'gray', 'black', 'white'],

  hobby: ['football', 'soccer', 'basketball', 'badminton', 'tennis', 'hockey', 'baseball',
    'swimming', 'swim', 'skating', 'skate', 'skateboarding', 'skateboard', 'reading',
    'read', 'painting', 'paint', 'drawing', 'draw', 'dancing', 'dance', 'singing', 'sing',
    'music', 'guitar', 'piano', 'games', 'game', 'computer', 'video', 'bike', 'riding',
    'ride', 'sport', 'sports', 'hobby', 'playing', 'play', 'running', 'run', 'fishing',
    'television', 'tv', 'film', 'movie', 'book', 'books'],

  past: ['went', 'played', 'saw', 'ate', 'watched', 'read', 'was', 'were', 'had',
    'helped', 'rode', 'made', 'bought', 'took', 'ran', 'swam', 'slept',
    'cooked', 'walked', 'danced', 'sang', 'came', 'got', 'gave', 'found', 'wore',
    'drew', 'drank', 'did'],

  people: ['mum', 'dad', 'mother', 'father', 'brother', 'sister', 'friend', 'friends',
    'grandma', 'grandpa', 'grandmother', 'grandfather', 'aunt', 'uncle', 'cousin',
    'parents', 'grandparents', 'family', 'son', 'daughter', 'classmate', 'teacher',
    'boy', 'girl', 'children', 'kid', 'kids'],

  anything: null,
};

export const PERSONAL_QUESTIONS = [
  {
    id: 'name', say: 'Hello! What is your name?', expect: 'anything',
    model: 'My name is Daisy.', hint: 'Say your name.',
  },
  {
    id: 'animal', say: 'What is your favourite animal?', expect: 'animal',
    model: 'My favourite animal is a dolphin.', hint: 'Say the name of an animal.',
  },
  {
    id: 'food', say: 'What do you have for lunch at school?', expect: 'food',
    model: 'I have a sandwich and some salad.', hint: 'Say something you eat.',
  },
  {
    id: 'weekend', say: 'What did you do last weekend?', expect: 'past',
    model: 'I went to the park with my friends.', hint: 'Say what you did: I went, I played, I saw.',
  },
  {
    id: 'hobby', say: 'What do you like doing after school?', expect: 'hobby',
    model: 'I like playing football with my brother.', hint: 'Say a sport or a hobby.',
  },
  {
    id: 'friend', say: 'Who do you play with at school?', expect: 'people',
    model: 'I play with my friends Jack and Lily.', hint: 'Say a person: a friend, your brother.',
  },
  {
    id: 'colour', say: 'What colour is your bedroom?', expect: 'colour',
    model: 'My bedroom is blue and white.', hint: 'Say a colour.',
  },
  {
    id: 'weather', say: 'What is the weather like today?', expect: 'weather',
    model: 'It is sunny and hot today.', hint: 'Say sunny, cloudy, windy or cold.',
  },
  {
    id: 'place', say: 'Where do you go on Saturdays?', expect: 'place',
    model: 'I go to the swimming pool.', hint: 'Say a place in your town.',
  },
  {
    id: 'day', say: 'Which day of the week do you like best?', expect: 'day',
    model: 'I like Saturday best.', hint: 'Say a day of the week.',
  },
];


// Segunda tanda de preguntas.
PERSONAL_QUESTIONS.push(
  { id: 'sport', say: 'What sport do you like?', expect: 'hobby',
    model: 'I like playing basketball.', hint: 'Say a sport.' },
  { id: 'breakfast', say: 'What do you eat for breakfast?', expect: 'food',
    model: 'I eat bread and drink some milk.', hint: 'Say something you eat.' },
  { id: 'pet', say: 'Have you got a pet at home?', expect: 'animal',
    model: 'Yes, I have got a dog.', hint: 'Say an animal, or say no.' },
  { id: 'town', say: 'What is your town like?', expect: 'place',
    model: 'It is small and there is a big park.', hint: 'Say a place in your town.' },
  { id: 'clothes', say: 'What are you wearing today?', expect: 'clothes',
    model: 'I am wearing jeans and a red T-shirt.', hint: 'Say some clothes.' },
  { id: 'lastholiday', say: 'Where did you go on your last holiday?', expect: 'past',
    model: 'I went to the beach with my family.', hint: 'Say what you did: I went.' },
  { id: 'brother', say: 'Have you got a brother or a sister?', expect: 'people',
    model: 'Yes, I have got two sisters.', hint: 'Say a person in your family.' },
  { id: 'afterschool', say: 'What do you do after school on Mondays?', expect: 'hobby',
    model: 'I do my homework and then I play.', hint: 'Say what you do.' },
  { id: 'season', say: 'Do you like the rain or the sun?', expect: 'weather',
    model: 'I like the sun because I can swim.', hint: 'Say sun, rain, snow or wind.' },
  { id: 'birthday', say: 'What did you do on your birthday?', expect: 'past',
    model: 'I had a party with my friends.', hint: 'Say what you did: I had, I went.' },
  { id: 'teacher', say: 'Who is your teacher?', expect: 'people',
    model: 'My teacher is called Mary.', hint: 'Say a person.' },
  { id: 'drink', say: 'What do you drink when you are thirsty?', expect: 'food',
    model: 'I drink water or juice.', hint: 'Say something you drink.' },
  { id: 'bedroom', say: 'What is in your bedroom?', expect: 'anything',
    model: 'There is a bed, a desk and a big poster.', hint: 'Say the things you can see.' },
  { id: 'weekendplan', say: 'Where do you go with your family?', expect: 'place',
    model: 'We go to the park or to my grandma\u2019s house.', hint: 'Say a place.' },
);

// Frases de socorro. El handbook insiste: callarse cuesta puntos de interaccion,
// pedir ayuda no.
export const RESCUE = ['Sorry?', 'Can you say that again, please?', 'I don\u2019t understand.'];
