// Lista de palabras de Pre A1 Starters y A1 Movers, EXTRAIDA del PDF oficial
// de Cambridge con pdftotext. No transcrita a mano. Se usa para corregir la escritura libre de la Parte 6: si el
// alumno escribe una palabra que no esta en el syllabus, se le avisa.

export const STARTERS_WORDS = [
  'a', 'about', 'add', 'afternoon', 'again', 'alex', 'alice', 'alien',
  'alphabet', 'an', 'and', 'angry', 'animal', 'ann', 'anna', 'answer',
  'apartment', 'apple', 'arm', 'armchair', 'ask', 'at', 'baby', 'badminton',
  'bag', 'ball', 'balloon', 'banana', 'baseball', 'basketball', 'bat', 'bath',
  'bathroom', 'be', 'beach', 'bean', 'bear', 'beautiful', 'bed', 'bedroom',
  'bee', 'behind', 'ben', 'between', 'big', 'bike', 'bill', 'bird',
  'birthday', 'black', 'blue', 'board', 'boat', 'body', 'book', 'bookcase',
  'bookshop', 'boots', 'bounce', 'box', 'boy', 'bread', 'breakfast', 'brother',
  'brown', 'burger', 'bus', 'but', 'bye', 'cake', 'camera', 'can',
  'candy', 'cap', 'car', 'carrot', 'cat', 'catch', 'chair', 'chicken',
  'child', 'children', 'chips', 'chocolate', 'choose', 'clap', 'class', 'classmate',
  'classroom', 'clean', 'clock', 'close', 'closed', 'clothes', 'coconut', 'color',
  'colour', 'come', 'complete', 'computer', 'cool', 'correct', 'count', 'cousin',
  'cow', 'crayon', 'cream', 'crocodile', 'cross', 'cupboard', 'dad', 'dan',
  'day', 'dear', 'desk', 'dining', 'dinner', 'dirty', 'do', 'dog',
  'doll', 'don\'t', 'done', 'donkey', 'door', 'double', 'draw', 'drawing',
  'dress', 'drink', 'drive', 'duck', 'ear', 'eat', 'egg', 'elephant',
  'end', 'english', 'enjoy', 'eraser', 'eva', 'evening', 'example', 'eye',
  'face', 'family', 'fantastic', 'father', 'favorite', 'favourite', 'feet', 'find',
  'fish', 'fishing', 'flat', 'floor', 'flower', 'fly', 'food', 'foot',
  'football', 'for', 'friend', 'fries', 'frog', 'from', 'front', 'fruit',
  'fun', 'funny', 'game', 'garden', 'get', 'giraffe', 'girl', 'give',
  'glasses', 'go', 'goat', 'good', 'goodbye', 'got', 'grace', 'grandfather',
  'grandma', 'grandmother', 'grandpa', 'grape', 'gray', 'great', 'green', 'grey',
  'guitar', 'hair', 'hall', 'hand', 'handbag', 'happy', 'hat', 'have',
  'he', 'head', 'helicopter', 'hello', 'her', 'here', 'hers', 'hi',
  'him', 'hippo', 'his', 'hit', 'hobby', 'hockey', 'hold', 'home',
  'hooray', 'horse', 'house', 'how', 'hugo', 'i', 'ice', 'in',
  'it', 'its', 'jacket', 'jeans', 'jellyfish', 'jill', 'juice', 'jump',
  'keyboard', 'kick', 'kid', 'kim', 'kitchen', 'kite', 'kiwi', 'know',
  'lamp', 'learn', 'leg', 'lemon', 'lemonade', 'lesson', 'let\'s', 'letter',
  'like', 'lime', 'line', 'listen', 'live', 'living', 'lizard', 'long',
  'look', 'lorry', 'lot', 'lots', 'love', 'lucy', 'lunch', 'make',
  'man', 'mango', 'many', 'mark', 'mat', 'matt', 'may', 'me',
  'meat', 'meatballs', 'men', 'mice', 'milk', 'mine', 'mirror', 'miss',
  'monkey', 'monster', 'morning', 'mother', 'motorbike', 'mouse', 'mouth', 'mr',
  'mrs', 'mum', 'music', 'my', 'name', 'new', 'next', 'nice',
  'nick', 'night', 'no', 'nose', 'not', 'now', 'number', 'of',
  'oh', 'ok', 'old', 'on', 'one', 'onion', 'open', 'or',
  'orange', 'our', 'ours', 'page', 'paint', 'painting', 'paper', 'pardon',
  'park', 'part', 'pat', 'pea', 'pear', 'pen', 'pencil', 'people',
  'person', 'pet', 'phone', 'photo', 'piano', 'pick', 'picture', 'pie',
  'pineapple', 'pink', 'plane', 'play', 'playground', 'please', 'point', 'polar',
  'poster', 'potato', 'purple', 'put', 'question', 'racket', 'radio', 'read',
  'really', 'red', 'rice', 'ride', 'right', 'robot', 'room', 'rubber',
  'rug', 'ruler', 'run', 'sad', 'sam', 'sand', 'sausage', 'say',
  'scary', 'school', 'sea', 'see', 'sentence', 'she', 'sheep', 'shell',
  'ship', 'shirt', 'shoe', 'shop', 'short', 'shorts', 'show', 'silly',
  'sing', 'sister', 'sit', 'skateboard', 'skateboarding', 'skirt', 'sleep', 'small',
  'smile', 'snake', 'so', 'soccer', 'sock', 'sofa', 'some', 'song',
  'sorry', 'spell', 'spider', 'sport', 'stand', 'start', 'stop', 'store',
  'story', 'street', 'sue', 'sun', 'sweet', 'sweets', 'swim', 't-shirt',
  'table', 'tablet', 'tail', 'take', 'talk', 'teacher', 'teddy', 'television',
  'tell', 'tennis', 'thank', 'thanks', 'that', 'the', 'their', 'theirs',
  'them', 'then', 'there', 'these', 'they', 'thing', 'this', 'those',
  'throw', 'tick', 'tiger', 'to', 'today', 'tom', 'tomato', 'too',
  'toy', 'train', 'tree', 'trousers', 'truck', 'try', 'tv', 'ugly',
  'under', 'understand', 'up', 'us', 'very', 'walk', 'wall', 'want',
  'watch', 'water', 'watermelon', 'wave', 'we', 'wear', 'well', 'what',
  'where', 'which', 'white', 'who', 'whose', 'window', 'with', 'woman',
  'women', 'word', 'worry', 'would', 'wow', 'write', 'year', 'yellow',
  'yes', 'you', 'young', 'your', 'yours', 'zebra', 'zoo',
];

export const MOVERS_WORDS = [
  'above', 'address', 'afraid', 'after', 'age', 'all', 'along', 'always',
  'another', 'any', 'app', 'around', 'asleep', 'aunt', 'awake', 'back',
  'bad', 'badly', 'balcony', 'band', 'basement', 'be', 'beard', 'because',
  'before', 'below', 'best', 'better', 'blanket', 'blond', 'blonde', 'book',
  'boring', 'both', 'bottle', 'bottom', 'bowl', 'brave', 'break', 'brilliant',
  'bring', 'build', 'building', 'bus', 'busy', 'buy', 'by', 'caf\u00E9',
  'cage', 'call', 'called', 'car', 'careful', 'carefully', 'carry', 'cd',
  'center', 'centre', 'change', 'charlie', 'cheese', 'cinema', 'circle', 'circus',
  'city', 'clare', 'clever', 'climb', 'cloud', 'cloudy', 'clown', 'coat',
  'coffee', 'cold', 'come', 'comic', 'cook', 'cough', 'could', 'country',
  'countryside', 'cry', 'cup', 'curly', 'daisy', 'dance', 'dangerous', 'daughter',
  'dentist', 'difference', 'different', 'difficult', 'doctor', 'dolphin', 'down', 'downstairs',
  'dream', 'dress', 'dressed', 'driver', 'drop', 'dry', 'dvd', 'e-book',
  'earache', 'easy', 'elevator', 'email', 'every', 'everyone', 'everything', 'exciting',
  'excuse', 'fair', 'fall', 'famous', 'farm', 'farmer', 'fat', 'feed',
  'field', 'film', 'fine', 'first', 'fix', 'for', 'forest', 'fred',
  'friday', 'frightened', 'funfair', 'get', 'glass', 'go', 'goal', 'got',
  'granddaughter', 'grandparent', 'grandson', 'grass', 'ground', 'grow', 'grown-up', 'have',
  'headache', 'helmet', 'help', 'hide', 'holiday', 'homework', 'hop', 'hospital',
  'hot', 'how', 'huge', 'hundred', 'hungry', 'hurt', 'ice', 'idea',
  'ill', 'inside', 'internet', 'into', 'invite', 'island', 'jack', 'jane',
  'jim', 'julia', 'jungle', 'kangaroo', 'kind', 'kitten', 'lake', 'laptop',
  'last', 'laugh', 'leaf', 'leaves', 'library', 'lift', 'lily', 'lion',
  'little', 'look', 'lose', 'loud', 'loudly', 'machine', 'map', 'market',
  'mary', 'matter', 'me', 'mean', 'message', 'milkshake', 'mistake', 'model',
  'monday', 'moon', 'more', 'most', 'mountain', 'moustache', 'move', 'movie',
  'much', 'must', 'naughty', 'near', 'neck', 'need', 'net', 'never',
  'noise', 'noodles', 'nothing', 'nurse', 'o\'clock', 'of', 'off', 'often',
  'on', 'only', 'opposite', 'out', 'outside', 'pair', 'pancake', 'panda',
  'parent', 'park', 'parrot', 'party', 'pasta', 'paul', 'penguin', 'peter',
  'picnic', 'pirate', 'place', 'plant', 'plate', 'player', 'pool', 'pop',
  'practice', 'practise', 'present', 'pretty', 'puppy', 'put', 'quick', 'quickly',
  'quiet', 'quietly', 'rabbit', 'rain', 'rainbow', 'right', 'river', 'road',
  'rock', 'roller', 'roof', 'round', 'safe', 'sail', 'salad', 'sally',
  'sandwich', 'saturday', 'sauce', 'scarf', 'score', 'seat', 'second', 'send',
  'shall', 'shape', 'shark', 'shopping', 'shoulder', 'shout', 'shower', 'sick',
  'skate', 'skates', 'skating', 'skip', 'sky', 'slow', 'slowly', 'snail',
  'snow', 'someone', 'something', 'sometimes', 'son', 'soup', 'sports', 'square',
  'stair', 'stairs', 'star', 'station', 'stomach', 'stomach-ache', 'stop', 'straight',
  'strong', 'sunday', 'sunny', 'supermarket', 'surprised', 'sweater', 'swimming', 'swimsuit',
  'take', 'tall', 'tea', 'teach', 'teeth', 'temperature', 'terrible', 'text',
  'than', 'thin', 'think', 'third', 'thirsty', 'thursday', 'ticket', 'tired',
  'to', 'tooth', 'toothache', 'toothbrush', 'toothpaste', 'top', 'towel', 'town',
  'tractor', 'travel', 'treasure', 'trip', 'tuesday', 'uncle', 'undressed', 'up',
  'upstairs', 'vegetable', 'vicky', 'video', 'village', 'wait', 'wake', 'wash',
  'waterfall', 'weak', 'weather', 'website', 'wednesday', 'week', 'weekend', 'wet',
  'whale', 'when', 'why', 'wind', 'windy', 'work', 'world', 'worse',
  'worst', 'would', 'wrong', 'yesterday', 'zoe',
];

// El wordlist no lista los numeros uno a uno, pero el syllabus los exige:
// 1-20 en Starters, 21-100 y ordinales 1st-20th en Movers.
export const NUMBER_WORDS = [
  'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen',
  'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
  'eighty', 'ninety', 'hundred',
  'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth',
  'ninth', 'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth',
  'sixteenth', 'seventeenth', 'eighteenth', 'nineteenth', 'twentieth',
];

export const SYLLABUS = new Set([...STARTERS_WORDS, ...MOVERS_WORDS, ...NUMBER_WORDS]);

// El wordlist trae "café" con tilde; los ninos la escriben sin ella.
const ACCENTLESS = new Set([...SYLLABUS].map((w) => w.normalize('NFD').replace(/[\u0300-\u036f]/g, '')));

// Formas que el examen admite y que no aparecen como entrada en la lista:
// plurales, terceras personas, gerundios y pasados regulares.
const SUFFIXES = [['ies', 'y'], ['es', ''], ['s', ''], ['ing', ''], ['ed', ''],
  ['est', ''], ['er', '']];

// El wordlist recoge el infinitivo ("be", "go", "take"), no sus formas.
// El examen si las usa, asi que hay que reconocerlas.
const IRREGULAR = {
  is: 'be', am: 'be', are: 'be', was: 'be', were: 'be', been: 'be', being: 'be',
  has: 'have', had: 'have', having: 'have',
  does: 'do', did: 'do', done: 'do', doing: 'do',
  goes: 'go', went: 'go', gone: 'go', going: 'go',
  got: 'get', getting: 'get', gets: 'get',
  made: 'make', making: 'make',
  took: 'take', taken: 'take', taking: 'take',
  gave: 'give', given: 'give', giving: 'give',
  saw: 'see', seen: 'see', seeing: 'see',
  ate: 'eat', eaten: 'eat',
  came: 'come', coming: 'come',
  ran: 'run', running: 'run',
  sat: 'sit', sitting: 'sit',
  stood: 'stand', standing: 'stand',
  swam: 'swim', swimming: 'swim',
  sang: 'sing', sung: 'sing',
  drew: 'draw', drawn: 'draw',
  drove: 'drive', driven: 'drive', driving: 'drive',
  flew: 'fly', flown: 'fly', flying: 'fly',
  found: 'find', finding: 'find',
  held: 'hold', holding: 'hold', hitting: 'hit',
  knew: 'know', known: 'know',
  rode: 'ride', ridden: 'ride', riding: 'ride',
  said: 'say', saying: 'say',
  told: 'tell', telling: 'tell',
  threw: 'throw', thrown: 'throw',
  wrote: 'write', written: 'write', writing: 'write',
  putting: 'put', caught: 'catch', catching: 'catch',
  chose: 'choose', chosen: 'choose', choosing: 'choose',
  slept: 'sleep', sleeping: 'sleep',
  taught: 'teach', teaching: 'teach',
  thought: 'think', thinking: 'think',
  bought: 'buy', buying: 'buy',
  brought: 'bring', bringing: 'bring',
  built: 'build', building: 'build',
  fell: 'fall', fallen: 'fall', falling: 'fall',
  fed: 'feed', feeding: 'feed',
  hid: 'hide', hidden: 'hide', hiding: 'hide',
  hurting: 'hurt', lost: 'lose', losing: 'lose',
  meant: 'mean', meaning: 'mean',
  sent: 'send', sending: 'send',
  woke: 'wake', woken: 'wake', waking: 'wake',
  wore: 'wear', worn: 'wear', wearing: 'wear',
  cutting: 'cut', shutting: 'shut', winning: 'win',
  drank: 'drink', drunk: 'drink', drinking: 'drink', swum: 'swim',
  grew: 'grow', grown: 'grow', growing: 'grow',
  understood: 'understand', understanding: 'understand',
};

export function inSyllabus(raw) {
  const word = String(raw)
    .toLowerCase()
    .replace(/\u2019/g, "'")
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z'-]/g, '');
  if (!word) return false;
  if (SYLLABUS.has(word)) return true;
  const plain = word.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (plain !== word && SYLLABUS.has(plain)) return true;
  if (ACCENTLESS.has(word)) return true;
  if (IRREGULAR[word] && SYLLABUS.has(IRREGULAR[word])) return true;
  // Compuestos con guion: twenty-four, ice-cream, T-shirt.
  if (word.includes('-') && word.split('-').every((part) => part && inSyllabus(part))) return true;
  // Contracciones: el syllabus las admite explicitamente ("including contractions").
  const CONTRACTED = { "isn't": 'be', "aren't": 'be', "wasn't": 'be', "weren't": 'be',
    "don't": 'do', "doesn't": 'do', "didn't": 'do', "can't": 'can', "couldn't": 'could',
    "mustn't": 'must', "haven't": 'have', "hasn't": 'have', "hadn't": 'have',
    "won't": 'would', "wouldn't": 'would', "it's": 'it', "that's": 'that',
    "he's": 'he', "she's": 'she', "there's": 'there', "i'm": 'i', "they're": 'they',
    "you're": 'you', "we're": 'we', "i've": 'i', "let's": "let's" };
  if (CONTRACTED[word] && SYLLABUS.has(CONTRACTED[word])) return true;
  const short = word.replace(/'(s|re|ve|ll|m|d|t)$/, '');
  if (short !== word && SYLLABUS.has(short)) return true;
  for (const [suffix, replacement] of SUFFIXES) {
    if (!word.endsWith(suffix) || word.length <= suffix.length + 1) continue;
    const stem = word.slice(0, -suffix.length) + replacement;
    if (SYLLABUS.has(stem) || SYLLABUS.has(`${stem}e`)) return true;
    if (stem.length > 2 && stem[stem.length - 1] === stem[stem.length - 2]
      && SYLLABUS.has(stem.slice(0, -1))) return true;
    // happier -> happy, funnier -> funny
    if (stem.endsWith('i') && SYLLABUS.has(`${stem.slice(0, -1)}y`)) return true;
  }
  return false;
}
