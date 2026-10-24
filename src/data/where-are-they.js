// "Where are they?": alguien dice lo que esta haciendo y el nino deduce el
// lugar. Cada lugar es una entrada del wordlist (la comprobacion 2 lo
// verifica en la frase completa). La pista nunca nombra el lugar entero;
// puede dar una mitad ("the bus" para bus stop), como hace la hoja de Cambridge.

export const WHERE_ARE_THEY = [
  { place: 'library', clue: 'I am reading a book. It is very quiet here.' },
  { place: 'bus stop', clue: 'I am waiting for the bus.' },
  { place: 'station', clue: 'I am waiting for the train to the city.' },
  { place: 'sports centre', clue: 'I am playing badminton with my friend.' },
  { place: 'shopping centre', clue: 'I want to buy a new coat and some shoes.' },
  { place: 'supermarket', clue: 'I am buying milk, eggs and bread.' },
  { place: 'market', clue: 'I am buying vegetables and fruit.' },
  { place: 'cinema', clue: 'I am watching a film about pirates.' },
  { place: 'swimming pool', clue: 'I am swimming with my brother.' },
  { place: 'park', clue: 'I am flying my kite and the dog is running.' },
  { place: 'hospital', clue: 'The doctor is looking at my arm.' },
  { place: 'farm', clue: 'I am feeding the sheep and the cows.' },
  { place: 'beach', clue: 'I am playing in the sand by the sea.' },
  { place: 'school', clue: 'The teacher is reading us a story.' },
  { place: 'funfair', clue: 'I am going on the rides and eating candy.' },
  { place: 'zoo', clue: 'I am looking at the monkeys and the lions.' },
  { place: 'bookshop', clue: 'I am choosing a new comic book.' },
  { place: 'car park', clue: 'I am looking for our car.' },
  { place: 'circus', clue: 'I am watching the clowns.' },
  { place: 'playground', clue: 'I am playing with my friends after school.' },
  { place: 'café', clue: 'I am having a drink and a sandwich.' },
  { place: 'kitchen', clue: 'I am cooking pasta for dinner.' },
];

// Frase de respuesta, con el pronombre que toque.
export const whereSentence = (pronoun, place) => `${pronoun} is at the ${place}.`;
