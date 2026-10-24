// Listening, parte 4: cinco dialogos entre un adulto y un nino, cada uno con
// una pregunta y tres dibujos. En el dialogo se nombran los tres, se descartan
// dos y se elige uno; hay que escuchar hasta el final. Dialogos propios con
// vocabulario de Starters y Movers; los dibujos son los iconos del album.

export const TICKBOX = [
  {
    id: 'zoo', question: 'Which animal did Jim see at the zoo?', options: ['elephant', 'dolphin', 'parrot'], answer: 'dolphin',
    lines: [
      { who: 'adult', text: 'Did you see the elephant at the zoo, Jim?' },
      { who: 'child', text: 'No, the elephant was asleep. But I saw a dolphin!' },
      { who: 'adult', text: 'A dolphin? Not the parrot?' },
      { who: 'child', text: 'The parrot was in its cage. The dolphin jumped out of the water. It was great!' },
    ],
  },
  {
    id: 'lunch-vicky', question: 'What is Vicky going to eat?', options: ['pancake', 'sandwich', 'salad'], answer: 'salad',
    lines: [
      { who: 'adult', text: 'Do you want a pancake, Vicky?' },
      { who: 'child', text: 'No, thank you. I had a pancake at breakfast.' },
      { who: 'adult', text: 'A sandwich, then?' },
      { who: 'child', text: 'No. I want a salad, please. Vegetables are good for me.' },
    ],
  },
  {
    id: 'saturday', question: 'Where did Lily go on Saturday?', options: ['farm', 'funfair', 'beach'], answer: 'farm',
    lines: [
      { who: 'adult', text: 'Did you go to the funfair on Saturday, Lily?' },
      { who: 'child', text: 'No. It rained, so we did not go to the funfair or the beach.' },
      { who: 'adult', text: 'So what did you do?' },
      { who: 'child', text: 'We went to my uncle\u2019s farm. I fed the sheep!' },
    ],
  },
  {
    id: 'school-bike', question: 'How is Paul going to school today?', options: ['bus', 'bike', 'car'], answer: 'bike',
    lines: [
      { who: 'adult', text: 'Is Dad taking you to school in the car, Paul?' },
      { who: 'child', text: 'No, Dad needs the car today.' },
      { who: 'adult', text: 'Then take the bus.' },
      { who: 'child', text: 'I want to go by bike. It is sunny!' },
      { who: 'adult', text: 'OK, but wear your helmet.' },
    ],
  },
  {
    id: 'sport', question: 'What is Daisy\u2019s favourite sport?', options: ['tennis', 'badminton', 'hockey'], answer: 'badminton',
    lines: [
      { who: 'adult', text: 'Do you like tennis, Daisy?' },
      { who: 'child', text: 'It is OK, but I like badminton more.' },
      { who: 'adult', text: 'More than hockey?' },
      { who: 'child', text: 'Yes! Badminton is my favourite. I play every Tuesday.' },
    ],
  },
  {
    id: 'present', question: 'What did Jack get for his birthday?', options: ['kite', 'skateboard', 'guitar'], answer: 'guitar',
    lines: [
      { who: 'adult', text: 'Did you get a kite for your birthday, Jack?' },
      { who: 'child', text: 'No. Grandma gave me a guitar!' },
      { who: 'adult', text: 'A guitar! Not the skateboard you wanted?' },
      { who: 'child', text: 'No, but I love the guitar. I am learning a song.' },
    ],
  },
  {
    id: 'farm-talk', question: 'Who did Sally talk to at the farm?', options: ['farmer', 'driver', 'cook'], answer: 'driver',
    lines: [
      { who: 'adult', text: 'Did you talk to the farmer, Sally?' },
      { who: 'child', text: 'No, the farmer was busy with the cows.' },
      { who: 'adult', text: 'The cook, then?' },
      { who: 'child', text: 'No. I talked to the tractor driver. He showed me the tractor!' },
    ],
  },
  {
    id: 'weather', question: 'What is the weather like today?', options: ['sunny', 'cloudy', 'rain'], answer: 'cloudy',
    lines: [
      { who: 'adult', text: 'Is it sunny today?' },
      { who: 'child', text: 'No, it is not sunny. It is cloudy.' },
      { who: 'adult', text: 'Is it going to rain?' },
      { who: 'child', text: 'No rain today, Mum. Only clouds.' },
    ],
  },
  {
    id: 'drawing', question: 'Which animal is Peter drawing?', options: ['monkey', 'lion', 'kangaroo'], answer: 'kangaroo',
    lines: [
      { who: 'adult', text: 'Are you drawing a monkey, Peter?' },
      { who: 'child', text: 'No, this is not a monkey. Look at its long tail.' },
      { who: 'adult', text: 'A lion?' },
      { who: 'child', text: 'It is a kangaroo! It can jump a lot.' },
    ],
  },
  {
    id: 'clothes', question: 'What is Mary going to wear?', options: ['coat', 'scarf', 'sweater'], answer: 'sweater',
    lines: [
      { who: 'adult', text: 'It is cold. Put on your coat, Mary.' },
      { who: 'child', text: 'I do not want my coat. Can I wear my new sweater?' },
      { who: 'adult', text: 'Your sweater and a scarf?' },
      { who: 'child', text: 'Only the sweater, please. It is not that cold.' },
    ],
  },
  {
    id: 'cat', question: 'Where is the cat?', options: ['box', 'bed', 'sofa'], answer: 'box',
    lines: [
      { who: 'adult', text: 'Is the cat on the sofa, Jane?' },
      { who: 'child', text: 'No, it is not on the sofa. And it is not on my bed.' },
      { who: 'adult', text: 'So where is it?' },
      { who: 'child', text: 'Look! It is sleeping in the box!' },
    ],
  },
  {
    id: 'lunch-fred', question: 'What did Fred have for lunch?', options: ['soup', 'noodles', 'pasta'], answer: 'noodles',
    lines: [
      { who: 'adult', text: 'Did you have pasta at school, Fred?' },
      { who: 'child', text: 'No, there was no pasta today.' },
      { who: 'adult', text: 'Soup?' },
      { who: 'child', text: 'No. I had noodles. They were very hot!' },
    ],
  },
  {
    id: 'island', question: 'How did Charlie\u2019s family go to the island?', options: ['boat', 'plane', 'helicopter'], answer: 'boat',
    lines: [
      { who: 'adult', text: 'Did you fly to the island in a plane, Charlie?' },
      { who: 'child', text: 'No, there is no plane to the island.' },
      { who: 'adult', text: 'A helicopter, then?' },
      { who: 'child', text: 'No! We went in a small boat. The sea was very quiet.' },
    ],
  },
  {
    id: 'shop', question: 'What does Julia want to buy?', options: ['comic', 'CD', 'DVD'], answer: 'comic',
    lines: [
      { who: 'adult', text: 'Do you want to buy this CD, Julia?' },
      { who: 'child', text: 'No, I have got that CD.' },
      { who: 'adult', text: 'The DVD about dolphins?' },
      { who: 'child', text: 'No. I want the new comic. Look, there is a pirate on it!' },
    ],
  },
  {
    id: 'children', question: 'Where are the children playing?', options: ['park', 'beach', 'playground'], answer: 'playground',
    lines: [
      { who: 'adult', text: 'Are the children in the park?' },
      { who: 'child', text: 'No, Miss. They are not in the park.' },
      { who: 'adult', text: 'At the beach?' },
      { who: 'child', text: 'No, they are in the playground, next to the school.' },
    ],
  },
  {
    id: 'watching', question: 'What is Jim watching?', options: ['film', 'television', 'video'], answer: 'video',
    lines: [
      { who: 'adult', text: 'Are you watching a film, Jim?' },
      { who: 'child', text: 'No, there is no good film on television.' },
      { who: 'adult', text: 'So what is it?' },
      { who: 'child', text: 'I am watching a video about whales on the computer.' },
    ],
  },
];
