// Definiciones originales, escritas con vocabulario de Starters y Movers.
// `answer` es la cadena exacta que el alumno tiene que escribir, artículo incluido:
// en el examen se pierde el punto por copiar "sandwich" en vez de "a sandwich".

import { WORDS } from './wordlist.js';

export const DEFINITIONS = {
  animals: [
    { id: 'bee', answer: 'a bee', clue: 'This small animal makes a lot of noise and it can fly. Do not catch it!' },
    { id: 'cow', answer: 'a cow', clue: 'This big farm animal gives us milk.' },
    { id: 'crocodile', answer: 'a crocodile', clue: 'This long green animal lives in the river and it has a lot of teeth.' },
    { id: 'giraffe', answer: 'a giraffe', clue: 'This animal has a very long neck and it can eat the leaves at the top of a tree.' },
    { id: 'spider', answer: 'a spider', clue: 'This small animal has eight legs and a lot of people are afraid of it.' },
    { id: 'frog', answer: 'a frog', clue: 'This small green animal jumps and it can swim very well.' },
    { id: 'bird', answer: 'a bird', clue: 'This animal has two legs and it can fly to its home in the tree.' },
    { id: 'sheep', answer: 'a sheep', clue: 'This farm animal is white and people make sweaters with its hair.' },
    { id: 'rabbit', answer: 'a rabbit', clue: 'This small animal has long ears and it can jump very well.' },
    { id: 'shark', answer: 'a shark', clue: 'This big fish lives in the sea and it has a lot of teeth.' },
    { id: 'penguin', answer: 'a penguin', clue: 'This black and white bird can swim, but it can\u2019t fly.' },
    { id: 'kangaroo', answer: 'a kangaroo', clue: 'This animal jumps a lot and carries its baby in front of it.' },
    { id: 'snail', answer: 'a snail', clue: 'This very slow animal carries its house on its back.' },
    { id: 'parrot', answer: 'a parrot', clue: 'This bird has a lot of colours and it can learn to talk.' },
    { id: 'whale', answer: 'a whale', clue: 'This is the biggest animal in the sea.' },
    { id: 'kitten', answer: 'a kitten', clue: 'This is a baby cat.' },
    { id: 'puppy', answer: 'a puppy', clue: 'This is a baby dog.' },
    { id: 'lion', answer: 'a lion', clue: 'This big cat lives in hot countries and has a lot of hair on its head.' },
  ],
  food: [
    { id: 'burger', answer: 'a burger', clue: 'You eat this hot food with bread and meat.' },
    { id: 'chocolate', answer: 'chocolate', clue: 'This sweet food is brown and children love it.' },
    { id: 'juice', answer: 'juice', clue: 'You make this drink from fruit.' },
    { id: 'breakfast', answer: 'breakfast', clue: 'This is the first food of the day.' },
    { id: 'pineapple', answer: 'a pineapple', clue: 'This yellow fruit is big and it has leaves on the top.' },
    { id: 'watermelon', answer: 'a watermelon', clue: 'This fruit is very big and green outside and red inside.' },
    { id: 'coconut', answer: 'a coconut', clue: 'This fruit is brown outside and there is water inside it.' },
    { id: 'rice', answer: 'rice', clue: 'This white food is very small and you can eat it with your dinner.' },
    { id: 'sandwich', answer: 'a sandwich', clue: 'You can eat this. It has bread outside and cheese or meat inside.' },
    { id: 'soup', answer: 'soup', clue: 'You eat this hot food from a bowl when you are cold.' },
    { id: 'pancake', answer: 'a pancake', clue: 'This food is round and thin and you can eat it for breakfast.' },
    { id: 'cheese', answer: 'cheese', clue: 'This food is yellow or white and it comes from milk.' },
    { id: 'bottle', answer: 'a bottle', clue: 'You put water or milk in this and then you can carry it.' },
    { id: 'plate', answer: 'a plate', clue: 'You put your food on this before you eat.' },
    { id: 'bowl', answer: 'a bowl', clue: 'This is round and you eat soup from it.' },
    { id: 'picnic', answer: 'a picnic', clue: 'You eat this outside, in a park or in a field.' },
    { id: 'vegetable', answer: 'a vegetable', clue: 'Carrots and potatoes are this kind of food.' },
    { id: 'milkshake', answer: 'a milkshake', clue: 'This cold drink is made with milk and it is very sweet.' },
  ],
  town: [
    { id: 'library', answer: 'a library', clue: 'You can find books or do your homework in this place.' },
    { id: 'market', answer: 'a market', clue: 'You can buy fruit and vegetables outside in this place.' },
    { id: 'supermarket', answer: 'a supermarket', clue: 'You go to this big shop to buy food for the week.' },
    { id: 'cinema', answer: 'a cinema', clue: 'You go to this place to watch a film.' },
    { id: 'circus', answer: 'a circus', clue: 'You can see clowns and animals in this place.' },
    { id: 'funfair', answer: 'a funfair', clue: 'You can go on rides and play games in this place.' },
    { id: 'hospital', answer: 'a hospital', clue: 'Doctors and nurses work in this place.' },
    { id: 'bus stop', answer: 'a bus stop', clue: 'You stand here and wait for the bus.' },
    { id: 'car park', answer: 'a car park', clue: 'People put their cars in this place.' },
  ],
  world: [
    { id: 'shell', answer: 'a shell', clue: 'You find this on the beach and it was the home of a small sea animal.' },
    { id: 'jungle', answer: 'a jungle', clue: 'This place is hot and there are a lot of trees and animals in it.' },
    { id: 'star', answer: 'a star', clue: 'You can see this in the sky at night. There are a lot of them.' },
    { id: 'sand', answer: 'sand', clue: 'This is on the beach and it is very small and yellow.' },
    { id: 'island', answer: 'an island', clue: 'This place has water all around it.' },
    { id: 'mountain', answer: 'a mountain', clue: 'You climb this. Sometimes there is snow on the top.' },
    { id: 'river', answer: 'a river', clue: 'This water is long and it goes to the sea.' },
    { id: 'lake', answer: 'a lake', clue: 'This water is not the sea. There is grass and trees all around it.' },
    { id: 'forest', answer: 'a forest', clue: 'There are a lot of trees in this place.' },
    { id: 'waterfall', answer: 'a waterfall', clue: 'The water in the river falls down here.' },
    { id: 'moon', answer: 'the moon', clue: 'You can see this in the sky at night.' },
  ],
  health: [
    { id: 'cough', answer: 'a cough', clue: 'You have this when your neck hurts and you make a noise.' },
    { id: 'tired', answer: 'tired', clue: 'You are this when you want to go to bed.' },
    { id: 'temperature', answer: 'a temperature', clue: 'You have this when your body is too hot because you are ill.' },
    { id: 'doctor', answer: 'a doctor', clue: 'This person helps you when you are ill.' },
    { id: 'nurse', answer: 'a nurse', clue: 'This person works with doctors in a hospital.' },
    { id: 'dentist', answer: 'a dentist', clue: 'You go to this person when you have toothache.' },
    { id: 'earache', answer: 'an earache', clue: 'You have this when your ear hurts.' },
    { id: 'headache', answer: 'a headache', clue: 'You have this when your head hurts.' },
  ],
  jobs: [
    { id: 'teacher', answer: 'a teacher', clue: 'This person helps children learn things at school.' },
    { id: 'clown', answer: 'a clown', clue: 'This person has a funny face and works in a circus.' },
    { id: 'pirate', answer: 'a pirate', clue: 'This person looks for treasure and lives on a boat.' },
    { id: 'cook', answer: 'a cook', clue: 'This person makes the food in a caf\u00e9.' },
    { id: 'farmer', answer: 'a farmer', clue: 'This person works with animals in a field.' },
    { id: 'driver', answer: 'a driver', clue: 'This person drives a bus or a lorry.' },
  ],
  clothes: [
    { id: 'boots', answer: 'boots', clue: 'You put these on your feet when it is wet outside.' },
    { id: 'glasses', answer: 'glasses', clue: 'People put these on their face when they can\u2019t see very well.' },
    { id: 'dress', answer: 'a dress', clue: 'Girls sometimes wear this. It is not trousers and it is not a skirt.' },
    { id: 'hat', answer: 'a hat', clue: 'You put this on your head when the sun is very hot.' },
    { id: 'coat', answer: 'a coat', clue: 'You put this on when the weather is cold and wet.' },
    { id: 'scarf', answer: 'a scarf', clue: 'You put this round your neck when it is cold.' },
    { id: 'helmet', answer: 'a helmet', clue: 'You put this on your head before you ride a bike.' },
    { id: 'sweater', answer: 'a sweater', clue: 'You wear this on your body when you are cold.' },
    { id: 'swimsuit', answer: 'a swimsuit', clue: 'You put this on before you swim.' },
  ],
  weather: [
    { id: 'sun', answer: 'the sun', clue: 'This is in the sky in the day and it is very hot.' },
    { id: 'sky', answer: 'the sky', clue: 'You look up in the day and you see this. It is blue.' },
    { id: 'rainbow', answer: 'a rainbow', clue: 'You see this in the sky after the rain. It has a lot of colours.' },
    { id: 'cloud', answer: 'a cloud', clue: 'This is white or grey and you can see it in the sky.' },
    { id: 'snow', answer: 'snow', clue: 'This is white and cold and it falls when the weather is very cold.' },
    { id: 'ice', answer: 'ice', clue: 'This is very cold water. You can put it in your drink.' },
    { id: 'wind', answer: 'wind', clue: 'You can\u2019t see this, but it moves the leaves on the trees.' },
  ],
  transport: [
    { id: 'ship', answer: 'a ship', clue: 'This is bigger than a boat and it takes people to another country.' },
    { id: 'plane', answer: 'a plane', clue: 'You get in this to fly to another country.' },
    { id: 'bus', answer: 'a bus', clue: 'A lot of people go to school or to work in this.' },
    { id: 'tractor', answer: 'a tractor', clue: 'Farmers drive this slowly in their fields.' },
    { id: 'ticket', answer: 'a ticket', clue: 'You buy this before you get on the train.' },
    { id: 'station', answer: 'a station', clue: 'Trains stop in this place.' },
    { id: 'trip', answer: 'a trip', clue: 'You go on this when you travel to a new place for a day.' },
    { id: 'ride', answer: 'a ride', clue: 'You sit on this at a funfair and it goes round and round.' },
  ],
  body: [
    { id: 'beard', answer: 'a beard', clue: 'Some men have this hair on their face.' },
    { id: 'neck', answer: 'a neck', clue: 'This part of you is between your head and your body.' },
    { id: 'shoulder', answer: 'a shoulder', clue: 'Your arm starts here, next to your neck.' },
    { id: 'moustache', answer: 'a moustache', clue: 'Some men have this hair between their nose and their mouth.' },
  ],
  home: [
    { id: 'mirror', answer: 'a mirror', clue: 'You look in this when you want to see your face.' },
    { id: 'blanket', answer: 'a blanket', clue: 'You put this on your bed when the night is cold.' },
    { id: 'shower', answer: 'a shower', clue: 'You get under this to wash your body.' },
    { id: 'lift', answer: 'a lift', clue: 'You go in this to get to the top of a building. You do not walk.' },
    { id: 'roof', answer: 'a roof', clue: 'This is on the top of a house and the rain falls on it.' },
    { id: 'stairs', answer: 'stairs', clue: 'You walk up these to get to the next floor.' },
    { id: 'garden', answer: 'a garden', clue: 'This is next to a house and there are flowers and grass in it.' },
    { id: 'clock', answer: 'a clock', clue: 'This is on the wall and it tells you when to go to school.' },
  ],
  places: [
    { id: 'bookshop', answer: 'a bookshop', clue: 'You go to this shop to buy books.' },
    { id: 'playground', answer: 'a playground', clue: 'Children run and play games in this place at school.' },
    { id: 'village', answer: 'a village', clue: 'This is smaller than a town and there are not many people.' },
  ],
  school: [
    { id: 'eraser', answer: 'an eraser', clue: 'You need this when you write something wrong with a pencil.' },
    { id: 'ruler', answer: 'a ruler', clue: 'You need this to draw a line that is not round.' },
    { id: 'homework', answer: 'homework', clue: 'The teacher gives you this to do at home.' },
    { id: 'poster', answer: 'a poster', clue: 'You put this big picture on the wall of your classroom.' },
  ],
  sports: [
    { id: 'guitar', answer: 'a guitar', clue: 'You play music with this. It has six lines on it.' },
    { id: 'basketball', answer: 'basketball', clue: 'In this sport you throw the ball in a net at the top.' },
    { id: 'badminton', answer: 'badminton', clue: 'In this sport two people hit a very small thing. It is not a ball.' },
    { id: 'holiday', answer: 'a holiday', clue: 'You do not go to school on this day. You can go to the beach.' },
    { id: 'photo', answer: 'a photo', clue: 'You take this with a camera to see it again after.' },
    { id: 'party', answer: 'a party', clue: 'People come to your house on your birthday for this.' },
  ],
  toys: [
    { id: 'kite', answer: 'a kite', clue: 'You take this to the park when it is windy and it flies in the sky.' },
    { id: 'balloon', answer: 'a balloon', clue: 'This is round and children play with it at a party.' },
    { id: 'robot', answer: 'a robot', clue: 'This toy is a machine and it can walk and talk.' },
    { id: 'helicopter', answer: 'a helicopter', clue: 'This flies in the sky but it is not a plane.' },
  ],
};

const ICONS = new Map(
  Object.values(WORDS).flat().map(([word, icon]) => [word, icon]),
);

const decorate = (topicId) => (entry) => ({
  ...entry,
  topicId,
  icon: ICONS.get(entry.id) ?? '\u2753',
});

export function definitionsFor(topicId) {
  return (DEFINITIONS[topicId] ?? []).map(decorate(topicId));
}

export function allDefinitions() {
  return Object.entries(DEFINITIONS)
    .flatMap(([topicId, list]) => list.map(decorate(topicId)));
}

export const hasDefinitions = (topicId) => (DEFINITIONS[topicId] ?? []).length > 0;
