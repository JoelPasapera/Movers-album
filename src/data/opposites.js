// "Monkey goes swimming!" del picture book: pares de contrarios.
// Todos del wordlist; el generador comprueba que las dos palabras esten.

export const OPPOSITES = [
  ['above', 'below'], ['up', 'down'], ['before', 'after'], ['inside', 'outside'],
  ['upstairs', 'downstairs'], ['awake', 'asleep'], ['quick', 'slow'], ['loud', 'quiet'],
  ['hot', 'cold'], ['wet', 'dry'], ['big', 'small'], ['old', 'new'], ['happy', 'sad'],
  ['open', 'closed'], ['clean', 'dirty'], ['first', 'last'], ['get dressed', 'get undressed'],
  ['on', 'off'], ['fat', 'thin'], ['strong', 'weak'], ['in front of', 'behind'],
  ['tall', 'short'], ['long', 'short'], ['easy', 'difficult'], ['always', 'never'],
  ['round', 'square'], ['good', 'bad'], ['young', 'old'],
];

// Una frase por pareja, con dos huecos: primero uno, luego el otro.
export const FRAMES = {
  'above-below': ['The bird is ', ' the tree, then it is ', ' the tree.'],
  'up-down': ['Monkey climbs ', ', then he climbs ', '.'],
  'before-after': ['Monkey eats ', ' his swim and sleeps ', ' it.'],
  'inside-outside': ['Monkey is ', ' the pool, then he is ', '.'],
  'upstairs-downstairs': ['My bedroom is ', ' and the kitchen is ', '.'],
  'awake-asleep': ['The baby is ', ' now, but at night she is ', '.'],
  'quick-slow': ['The rabbit is ', ' and the snail is ', '.'],
  'loud-quiet': ['The band is ', ' and the library is ', '.'],
  'hot-cold': ['The tea is ', ' and the ice cream is ', '.'],
  'wet-dry': ['After the rain the grass is ', ', and after the sun it is ', '.'],
  'big-small': ['The elephant is ', ' and the mouse is ', '.'],
  'old-new': ['My grandpa\u2019s car is ', ' and my dad\u2019s car is ', '.'],
  'happy-sad': ['Jim is ', ' when he plays, and ', ' when it rains.'],
  'open-closed': ['The shop is ', ' in the day and ', ' at night.'],
  'clean-dirty': ['My shoes are ', ' in the morning and ', ' after football.'],
  'first-last': ['Monday is the ', ' day of the week and Sunday is the ', '.'],
  'get dressed-get undressed': ['In the morning I ', ' and at night I ', '.'],
  'on-off': ['Put your coat ', ' when it is cold, and take it ', ' when it is hot.'],
  'fat-thin': ['The hippo is ', ' and the giraffe is ', '.'],
  'strong-weak': ['The lion is ', ' but the kitten is ', '.'],
  'in front of-behind': ['The teacher is ', ' the class and the board is ', ' her.'],
  'tall-short': ['My dad is ', ' and my baby brother is ', '.'],
  'long-short': ['A giraffe has a ', ' neck and a hippo has a ', ' one.'],
  'easy-difficult': ['Counting to ten is ', ', but counting to a hundred is ', '.'],
  'always-never': ['I ', ' clean my teeth, and I ', ' eat sweets in bed.'],
  'round-square': ['A ball is ', ' and a box is ', '.'],
  'good-bad': ['Fruit is ', ' for you and a lot of sweets are ', '.'],
  'young-old': ['My sister is ', ' and my grandmother is ', '.'],
};
