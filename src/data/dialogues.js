// Parte 2 de Reading and Writing: 6 puntos.
// Un dialogo escrito; hay que elegir lo que dice el segundo hablante.
// El handbook avisa de dos cosas: hay que leer las tres opciones, y hay que
// saber responder tambien a AFIRMACIONES, no solo a preguntas.

export const DIALOGUES = [
  {
    id: 'weekend',
    title: 'Paul and Daisy talk about the weekend',
    speakers: ['Paul', 'Daisy'],
    turns: [
      {
        line: 'What did you do on Saturday, Daisy?',
        options: ['I go to the zoo.', 'I went to the zoo.', 'I\u2019m going to the zoo.'],
        answer: 1,
        why: 'He asked about Saturday, so the answer must be in the past.',
      },
      {
        line: 'Did you see the lions?',
        options: ['Yes, I do.', 'Yes, I am.', 'Yes, I did.'],
        answer: 2,
        why: 'The question starts with "Did", so the short answer is "Yes, I did".',
      },
      {
        line: 'There was a baby elephant, too.',
        options: ['I know, I saw it!', 'Yes, it does.', 'No, it isn\u2019t.'],
        answer: 0,
        why: 'This is not a question, it is news. Your answer must go with the news.',
      },
      {
        line: 'Would you like to go again next week?',
        options: ['Yes, I was.', 'Yes, please!', 'Yes, I like.'],
        answer: 1,
        why: '"Would you like\u2026?" is an offer. You can say "Yes, please" or "No, thank you".',
      },
      {
        line: 'Let\u2019s ask my mum first.',
        options: ['Good idea.', 'Good, thanks.', 'Yes, she is.'],
        answer: 0,
        why: 'When someone says "Let\u2019s\u2026", you agree with the plan.',
      },
      {
        line: 'See you on Monday, then.',
        options: ['Here you are.', 'Me too.', 'See you!'],
        answer: 2,
        why: 'This is goodbye, so you say goodbye back.',
      },
    ],
  },
  {
    id: 'market',
    title: 'Jack and his mum at the market',
    speakers: ['Mum', 'Jack'],
    turns: [
      {
        line: 'What would you like for lunch, Jack?',
        options: ['A sandwich, please.', 'I\u2019m eating a sandwich.', 'I liked a sandwich.'],
        answer: 0,
        why: '"Would you like\u2026?" is an offer, so you ask for the thing you want.',
      },
      {
        line: 'Can you carry this bag, Jack?',
        options: ['Yes, I can.', 'Yes, you can.', 'Yes, it is.'],
        answer: 0,
        why: 'Mum asks about you, so you answer about you: "I can".',
      },
      {
        line: 'This bread is bigger than that one.',
        options: ['Then let\u2019s buy this one.', 'Yes, it\u2019s very small.', 'No, it\u2019s a bread.'],
        answer: 0,
        why: 'She is comparing two things. The answer has to make sense with "bigger".',
      },
      {
        line: 'How many apples do you want?',
        options: ['I\u2019m four.', 'Yes, four.', 'Four, please.'],
        answer: 2,
        why: '"How many\u2026?" asks for a number, not for yes or no.',
      },
      {
        line: 'I\u2019m very thirsty, Jack. Can I have some water?',
        options: ['Here you are.', 'Here I am.', 'Thank you.'],
        answer: 0,
        why: 'When you give someone something, you say "Here you are".',
      },
      {
        line: 'Thank you for helping me today.',
        options: ['That\u2019s mine.', 'That\u2019s OK.', 'Thanks too.'],
        answer: 1,
        why: 'Someone thanked you. "That\u2019s OK" is what you say back.',
      },
    ],
  },
];

// Tercer dialogo: existe para que aparezcan las estructuras de la Grammar and
// Structures List que no salian en ninguna otra parte de la app.
DIALOGUES.push({
  id: 'afterschool',
  title: 'Vicky and Jim after school',
  speakers: ['Jim', 'Vicky'],
  turns: [
    {
      line: 'What\u2019s the matter, Vicky?',
      options: ['I\u2019ve got a headache.', 'I am a headache.', 'There is a headache.'],
      answer: 0,
      why: 'When someone asks "What\u2019s the matter?" you say what is wrong with you.',
    },
    {
      line: 'Shall I get you some water?',
      options: ['Yes, I shall.', 'Yes, please.', 'Yes, you are.'],
      answer: 1,
      why: '"Shall I\u2026?" is an offer. You answer "Yes, please" or "No, thank you".',
    },
    {
      line: 'I don\u2019t want to play in the park today.',
      options: ['How about going home, then?', 'How about go home?', 'How is home?'],
      answer: 0,
      why: 'After "How about" the verb takes -ing: How about going.',
    },
    {
      line: 'My mum wants me to be home at five o\u2019clock.',
      options: ['Then you are run.', 'Then you must to run.', 'Then you have got to run!'],
      answer: 2,
      why: '"Have got to" means the same as "must": you cannot choose.',
    },
    {
      line: 'Can you give my book to the teacher?',
      options: ['Yes, I can give it to her.', 'Yes, I give her it.', 'Yes, to her I give.'],
      answer: 0,
      why: 'You give something TO someone. With "it", you say "give it to her".',
    },
    {
      line: 'Let\u2019s go for a walk on Saturday.',
      options: ['Good walk.', 'Good idea!', 'Yes, I walk.'],
      answer: 1,
      why: '"Let\u2019s\u2026" is a plan. You say if you like it.',
    },
  ],
});

// Siete dialogos mas, para que un nino no repita el mismo en un trimestre.
// Como pide el handbook, mezclan preguntas con AFIRMACIONES (noticias,
// ofrecimientos, ordenes y despedidas), que tambien hay que saber contestar.
DIALOGUES.push(
  {
    id: 'homework',
    title: 'Charlie and Jane talk about homework',
    speakers: ['Charlie', 'Jane'],
    turns: [
      {
        line: 'Have you got a lot of homework today, Jane?',
        options: ['Yes, I’m a lot.', 'Yes, I have.', 'Yes, it has got.'],
        answer: 1,
        why: 'The question starts with "Have you got…?", so the short answer is "Yes, I have".',
      },
      {
        line: 'Which is more difficult, English or music?',
        options: ['Music is the most.', 'Music is difficulter.', 'Music is more difficult.'],
        answer: 2,
        why: 'Long words make the comparative with "more": more difficult.',
      },
      {
        line: 'I can help you with it.',
        options: ['Thank you, that’s kind.', 'Yes, you are.', 'No, I don’t help.'],
        answer: 0,
        why: 'He is offering to help. You thank him.',
      },
      {
        line: 'Shall we do it at my house?',
        options: ['Yes, it’s a house.', 'OK, after lunch.', 'Yes, we shall.'],
        answer: 1,
        why: '"Shall we…?" is a plan. You say yes or no, and when.',
      },
      {
        line: 'My brother is louder than yours!',
        options: ['No, he hasn’t!', 'No, he doesn’t!', 'No, he isn’t!'],
        answer: 2,
        why: 'He said "is", so your answer uses "is" too: he isn’t.',
      },
      {
        line: 'Bring your books, then.',
        options: ['OK, they’re in my bag.', 'OK, I brought.', 'OK, they’re books.'],
        answer: 0,
        why: 'He is telling you what to do. You say OK and that you have the books.',
      },
    ],
  },
  {
    id: 'beach',
    title: 'Sally and her grandpa go to the beach',
    speakers: ['Grandpa', 'Sally'],
    turns: [
      {
        line: 'What’s the weather like today, Sally?',
        options: ['It likes the sun.', 'It’s hot and sunny.', 'It’s a weather.'],
        answer: 1,
        why: '"What’s the weather like?" asks about the weather, not about what you like.',
      },
      {
        line: 'Let’s go to the beach, then.',
        options: ['No, I’m not.', 'Yes, it is.', 'Great! I love swimming.'],
        answer: 2,
        why: 'When someone says "Let’s…", you say if you like the plan.',
      },
      {
        line: 'Which swimsuit do you want to take?',
        options: ['The blue one.', 'Yes, I do.', 'I take it.'],
        answer: 0,
        why: '"Which…?" asks you to choose one.',
      },
      {
        line: 'I can’t find the towels.',
        options: ['Yes, you can.', 'They’re in the cupboard.', 'It’s a towel.'],
        answer: 1,
        why: 'This is a problem, not a question. You help: say where they are.',
      },
      {
        line: 'You swam very well last year.',
        options: ['Yes, I was.', 'Yes, I swim.', 'Thank you, Grandpa!'],
        answer: 2,
        why: 'Someone says something nice about you. You say thank you.',
      },
      {
        line: 'Don’t go in the water before me.',
        options: ['OK, I can wait for you.', 'OK, you wait.', 'OK, I went.'],
        answer: 0,
        why: 'He asks you to wait, so you say that you can wait.',
      },
    ],
  },
  {
    id: 'party',
    title: 'Peter and Lily talk about a party',
    speakers: ['Peter', 'Lily'],
    turns: [
      {
        line: 'When is your birthday, Lily?',
        options: ['It’s at home.', 'I’m nine.', 'It’s on Friday.'],
        answer: 2,
        why: '"When…?" asks about the day or the time.',
      },
      {
        line: 'Are you having a party?',
        options: ['Yes, I am.', 'Yes, I do.', 'Yes, I have.'],
        answer: 0,
        why: 'The question starts with "Are you…?", so the short answer is "Yes, I am".',
      },
      {
        line: 'How many friends are coming?',
        options: ['They are my friends.', 'Ten or eleven.', 'Yes, a lot.'],
        answer: 1,
        why: '"How many…?" asks for a number.',
      },
      {
        line: 'I can make a chocolate cake for you.',
        options: ['Yes, you are.', 'I made it.', 'That would be great!'],
        answer: 2,
        why: 'He is offering to do something nice. You say yes and thank him.',
      },
      {
        line: 'My mum says I must be home before eight.',
        options: ['That’s OK. The party ends at seven.', 'Yes, she does.', 'No, you aren’t.'],
        answer: 0,
        why: 'This is news about his mum. Your answer must go with the news.',
      },
      {
        line: 'See you on Friday, then!',
        options: ['Yes, I see.', 'See you!', 'Here you are.'],
        answer: 1,
        why: 'This is goodbye, so you say goodbye back.',
      },
    ],
  },
  {
    id: 'shoes',
    title: 'Fred and his aunt buy shoes',
    speakers: ['Aunt Mary', 'Fred'],
    turns: [
      {
        line: 'Do you need new shoes for school, Fred?',
        options: ['Yes, it does.', 'Yes, I’m small.', 'Yes, these are too small.'],
        answer: 2,
        why: '"Do you need…?" The best answer says yes and why.',
      },
      {
        line: 'Which ones do you like, the black ones or the brown ones?',
        options: ['The black ones, please.', 'Black is a colour.', 'Yes, I like.'],
        answer: 0,
        why: 'When someone gives you two things to choose, you say which one.',
      },
      {
        line: 'The brown ones are bigger than the black ones.',
        options: ['Yes, they’re brown.', 'Then I want the brown ones.', 'No, it isn’t.'],
        answer: 1,
        why: 'Your old shoes are too small, so you want the bigger ones.',
      },
      {
        line: 'Would you like an ice cream after this?',
        options: ['Yes, I would like.', 'Yes, I like.', 'Yes, please!'],
        answer: 2,
        why: '"Would you like…?" is an offer. You can say "Yes, please" or "No, thank you".',
      },
      {
        line: 'Oh no, I haven’t got my bag!',
        options: ['Look! It’s in the car.', 'No, you aren’t.', 'It’s a bag.'],
        answer: 0,
        why: 'This is a problem. You help her.',
      },
      {
        line: 'Thank you for coming with me today.',
        options: ['Thanks too.', 'Yes, I came.', 'That’s OK. I liked it.'],
        answer: 2,
        why: 'Someone thanked you. "That’s OK" is what you say back.',
      },
    ],
  },
  {
    id: 'doctor',
    title: 'Zoe goes to the doctor',
    speakers: ['Doctor', 'Zoe'],
    turns: [
      {
        line: 'Hello, Zoe. What’s the matter?',
        options: ['I’m a stomach.', 'My stomach hurts.', 'It’s the matter.'],
        answer: 1,
        why: 'When someone asks "What’s the matter?" you say what is wrong with you.',
      },
      {
        line: 'When did it start?',
        options: ['Yesterday, after dinner.', 'Yes, it did.', 'In my stomach.'],
        answer: 0,
        why: '"When…?" asks about the time.',
      },
      {
        line: 'Did you eat a lot of sweets?',
        options: ['Yes, I am.', 'Yes, I do.', 'Yes, I did.'],
        answer: 2,
        why: 'The question starts with "Did", so the short answer is "Yes, I did".',
      },
      {
        line: 'You must drink water and sleep a lot today.',
        options: ['OK, I can do that.', 'Yes, I must to.', 'No, I’m not water.'],
        answer: 0,
        why: 'The doctor is telling you what to do. You say OK.',
      },
      {
        line: 'You can go to school on Thursday.',
        options: ['Thursday is a day.', 'Great, thank you!', 'Yes, I go.'],
        answer: 1,
        why: 'This is good news, so you are happy and you say thank you.',
      },
      {
        line: 'Say hello to your mum from me.',
        options: ['She’s my mum.', 'Hello, Mum.', 'OK. Goodbye, Doctor!'],
        answer: 2,
        why: 'The doctor is saying goodbye. You say goodbye back.',
      },
    ],
  },
  {
    id: 'rainyday',
    title: 'Mary and Vicky on a wet day',
    speakers: ['Mary', 'Vicky'],
    turns: [
      {
        line: 'Hi, Vicky! Are you coming to the park?',
        options: ['Yes, I come.', 'No, it’s a park.', 'I can’t. It’s raining here.'],
        answer: 2,
        why: 'You say if you can go, and why not.',
      },
      {
        line: 'Oh. What are you doing, then?',
        options: ['I’m watching a film.', 'I watch the film.', 'I watched a film.'],
        answer: 0,
        why: '"What are you doing?" asks about now, so the answer is "I’m …ing".',
      },
      {
        line: 'Is it the one about the dolphins?',
        options: ['Yes, they are.', 'Yes, it is.', 'Yes, it does.'],
        answer: 1,
        why: '"Is it…?" takes "Yes, it is".',
      },
      {
        line: 'I saw it last week. The end is the best part!',
        options: ['Don’t tell me!', 'Yes, you saw.', 'No, it isn’t a part.'],
        answer: 0,
        why: 'This is not a question. She is talking about the film and you answer her.',
      },
      {
        line: 'How about coming to my house on Saturday?',
        options: ['How about me?', 'Yes, I came on Saturday.', 'Good idea!'],
        answer: 2,
        why: '"How about…?" is an idea. You say if you like it.',
      },
      {
        line: 'Bring your new game.',
        options: ['OK, you bring.', 'OK, see you on Saturday!', 'It’s a new game.'],
        answer: 1,
        why: 'She is asking you to do something. You say OK and goodbye.',
      },
    ],
  },
  {
    id: 'picnic',
    title: 'Jack and his grandma talk about a picnic',
    speakers: ['Grandma', 'Jack'],
    turns: [
      {
        line: 'Would you like to go for a picnic today, Jack?',
        options: ['Yes, I went.', 'Yes, that’s a great idea.', 'Yes, I would like.'],
        answer: 1,
        why: '"Would you like…?" You say yes or no, and you can say why.',
      },
      {
        line: 'Where shall we go?',
        options: ['To the lake.', 'Yes, we shall.', 'At six o’clock.'],
        answer: 0,
        why: '"Where…?" asks about the place.',
      },
      {
        line: 'Who can we ask to come?',
        options: ['In the park.', 'Yes, we can.', 'Daisy and her brother.'],
        answer: 2,
        why: '"Who…?" asks about people.',
      },
      {
        line: 'I’m making the sandwiches now.',
        options: ['Yes, you make.', 'Can I help you?', 'I’m a sandwich.'],
        answer: 1,
        why: 'Grandma is telling you what she is doing. You can offer to help.',
      },
      {
        line: 'There’s no bread in the cupboard!',
        options: ['I can go to the shop.', 'Yes, it is.', 'No, there’s bread.'],
        answer: 0,
        why: 'This is a problem. You help.',
      },
      {
        line: 'Take your coat. It’s cold outside.',
        options: ['Yes, it was.', 'No, I’m a coat.', 'OK, Grandma.'],
        answer: 2,
        why: 'She is telling you what to do. You say OK.',
      },
    ],
  },
);

// Seis dialogos mas (otono de 2026): biblioteca, piscina, cocina, granja,
// una mascota nueva y una bici. Mitad preguntas, mitad frases que no son
// preguntas, y la respuesta buena en cualquiera de las tres posiciones.
DIALOGUES.push(
  {
    id: 'library',
    title: 'Clare at the library',
    speakers: ['Mr Green', 'Clare'],
    turns: [
      {
        line: 'Good morning, Clare. What are you looking for today?',
        options: ['Yes, I’m looking.', 'A book about dolphins.', 'It was in the morning.'],
        answer: 1,
        why: '"What…?" asks for a thing. Say which thing you want.',
      },
      {
        line: 'Do you come to the library every week?',
        options: ['Yes, I come.', 'Yes, I am.', 'Yes, I do.'],
        answer: 2,
        why: 'The question starts with "Do", so the short answer is "Yes, I do".',
      },
      {
        line: 'The books about sea animals are next to the window.',
        options: ['Thank you! I can see them now.', 'Yes, the window is big.', 'No, they aren’t animals.'],
        answer: 0,
        why: 'He is helping you find the books, so you say thank you.',
      },
      {
        line: 'Which one would you like, the big one or the small one?',
        options: ['Yes, I would.', 'It’s bigger.', 'The big one, please.'],
        answer: 2,
        why: '"Which one…?" asks you to choose one of the two things.',
      },
      {
        line: 'You can take it home for two weeks.',
        options: ['It’s my home.', 'That’s great!', 'I’m two.'],
        answer: 1,
        why: 'This is good news, not a question. Say that you are happy.',
      },
      {
        line: 'Please bring it back in two weeks.',
        options: ['OK. See you then!', 'Yes, it was Saturday.', 'No, I didn’t bring it.'],
        answer: 0,
        why: 'He asks you to do something. You say OK.',
      },
    ],
  },
  {
    id: 'swimming',
    title: 'Peter’s swimming lesson',
    speakers: ['Teacher', 'Peter'],
    turns: [
      {
        line: 'Hello, Peter. Can you swim?',
        options: ['Yes, I do.', 'Yes, I can. I love it!', 'Yes, I swam.'],
        answer: 1,
        why: '"Can you…?" takes "Yes, I can" or "No, I can’t".',
      },
      {
        line: 'Where is your towel?',
        options: ['It’s in my bag.', 'It’s blue and white.', 'Yes, it is.'],
        answer: 0,
        why: '"Where…?" asks for a place.',
      },
      {
        line: 'You swim more quickly than your friends now!',
        options: ['Yes, they are my friends.', 'No, I don’t swim.', 'Thanks! I love swimming.'],
        answer: 2,
        why: 'She is saying something nice about you. You say thank you.',
      },
      {
        line: 'How often do you come to the swimming pool?',
        options: ['At ten o’clock.', 'Every Saturday.', 'Yes, I often come.'],
        answer: 1,
        why: '"How often…?" asks how many times, like "every Saturday".',
      },
      {
        line: 'Shall I help you in the big pool?',
        options: ['No, thank you. I can do it.', 'No, I shall.', 'Yes, it is big.'],
        answer: 0,
        why: '"Shall I…?" is an offer. Say "Yes, please" or "No, thank you".',
      },
      {
        line: 'Well done, Peter! That was your best swim.',
        options: ['Yes, it was your swim.', 'Thank you! Can I go again?', 'Well, I’m Peter.'],
        answer: 1,
        why: 'She says "Well done!". You say thank you.',
      },
    ],
  },
  {
    id: 'pancakes',
    title: 'Lily and her dad make pancakes',
    speakers: ['Dad', 'Lily'],
    turns: [
      {
        line: 'Shall we make pancakes for breakfast, Lily?',
        options: ['Yes, we made them.', 'No, it’s breakfast.', 'Yes! I love pancakes.'],
        answer: 2,
        why: '"Shall we…?" is a plan. Say yes or no to the plan.',
      },
      {
        line: 'Can you get me the milk, please?',
        options: ['Here you are.', 'Yes, I got.', 'It’s milk.'],
        answer: 0,
        why: 'When someone asks you for a thing, you give it and say "Here you are".',
      },
      {
        line: 'How many eggs do we need?',
        options: ['Yes, we need.', 'Two, I think.', 'They’re white.'],
        answer: 1,
        why: '"How many…?" asks for a number.',
      },
      {
        line: 'This pancake is better than the first one.',
        options: ['Yes, I’m better.', 'No, it’s the first one.', 'Yes, and it’s bigger too!'],
        answer: 2,
        why: 'Dad is talking about two pancakes. Your answer must talk about the pancake.',
      },
      {
        line: 'Oh no! I dropped a plate.',
        options: ['That’s OK, Dad. I can help you.', 'Yes, you dropped it.', 'It’s a plate.'],
        answer: 0,
        why: 'Something bad happened. Say something kind and help.',
      },
      {
        line: 'Go and tell your brother. We’re having breakfast now.',
        options: ['Yes, I told him yesterday.', 'OK, I’m going now.', 'He isn’t hungry.'],
        answer: 1,
        why: 'Dad asks you to do something now, so you say OK.',
      },
    ],
  },
  {
    id: 'farm',
    title: 'Fred’s class at the farm',
    speakers: ['Miss Hill', 'Fred'],
    turns: [
      {
        line: 'Have you got your coat, Fred? It’s cold at the farm.',
        options: ['Yes, it’s a farm.', 'Yes, it’s in my bag.', 'Yes, I’m cold.'],
        answer: 1,
        why: 'She asks about your coat. The answer must talk about the coat.',
      },
      {
        line: 'Look! What are those animals behind the tree?',
        options: ['They’re behind the tree.', 'Yes, they are.', 'They’re goats.'],
        answer: 2,
        why: '"What…?" asks for a name. Say what the animals are.',
      },
      {
        line: 'The farmer wants us to give the chickens some food.',
        options: ['Can I do it first?', 'Yes, he is a farmer.', 'No, I’m not a chicken.'],
        answer: 0,
        why: 'This is not a question. It is a plan, and you want to help.',
      },
      {
        line: 'Whose bag is this on the grass?',
        options: ['It’s on the grass.', 'It’s mine.', 'Yes, it’s a bag.'],
        answer: 1,
        why: '"Whose…?" asks who has got it: mine, yours, his or hers.',
      },
      {
        line: 'We must go back to the bus at three o’clock.',
        options: ['It’s a big bus.', 'No, it was three.', 'OK, I’m coming.'],
        answer: 2,
        why: '"Must" means you have to do it. You say OK.',
      },
      {
        line: 'Did you like the farm, Fred?',
        options: ['Yes, I did. It was great!', 'Yes, I like.', 'Yes, I was.'],
        answer: 0,
        why: 'The question starts with "Did", so the answer is "Yes, I did".',
      },
    ],
  },
  {
    id: 'kitten',
    title: 'Julia’s new kitten',
    speakers: ['Grandpa', 'Julia'],
    turns: [
      {
        line: 'What a beautiful kitten, Julia! What’s it called?',
        options: ['It’s a kitten.', 'It’s called Lucy.', 'Yes, it is.'],
        answer: 1,
        why: '"What’s it called?" asks for a name.',
      },
      {
        line: 'How old is it?',
        options: ['Ten weeks old.', 'It’s very small.', 'Yes, it’s old.'],
        answer: 0,
        why: '"How old…?" asks for a number of weeks or years.',
      },
      {
        line: 'Your kitten is sleeping in my hat!',
        options: ['Yes, it’s your hat.', 'No, it isn’t a hat.', 'Sorry, Grandpa! I can take it out.'],
        answer: 2,
        why: 'Grandpa needs his hat. Say sorry and help.',
      },
      {
        line: 'What does it like eating?',
        options: ['It likes eat fish.', 'Fish and chicken.', 'Yes, it does.'],
        answer: 1,
        why: '"What…?" asks for things. Say which food.',
      },
      {
        line: 'Shall I buy it a ball to play with?',
        options: ['Yes, please! It loves playing.', 'Yes, you shall.', 'No, it’s a cat.'],
        answer: 0,
        why: '"Shall I…?" is an offer. Say "Yes, please" or "No, thank you".',
      },
      {
        line: 'Bring it to my house next Sunday.',
        options: ['I brought it.', 'Yes, it’s your house.', 'OK, Grandpa!'],
        answer: 2,
        why: 'Grandpa asks you to do something. You say OK.',
      },
    ],
  },
  {
    id: 'bike',
    title: 'Daisy’s new bike',
    speakers: ['Paul', 'Daisy'],
    turns: [
      {
        line: 'Is that your new bike, Daisy?',
        options: ['Yes, I am.', 'Yes, it is. Do you like it?', 'Yes, it does.'],
        answer: 1,
        why: '"Is that…?" takes "Yes, it is" or "No, it isn’t".',
      },
      {
        line: 'Who gave it to you?',
        options: ['My uncle did.', 'I gave it to him.', 'It’s for you.'],
        answer: 0,
        why: '"Who…?" asks for a person.',
      },
      {
        line: 'I like the colour. Green is my favourite!',
        options: ['No, it’s green.', 'Yes, it’s my bike.', 'Mine too!'],
        answer: 2,
        why: 'Paul is not asking a question. He tells you what he likes, and you can say you like it too.',
      },
      {
        line: 'Where shall we ride?',
        options: ['On Monday.', 'In the park.', 'Yes, we shall.'],
        answer: 1,
        why: '"Where…?" asks for a place, not a day.',
      },
      {
        line: 'My mum says we must ride slowly near the road.',
        options: ['OK, we can do that.', 'No, the road is near.', 'Yes, she rides slowly.'],
        answer: 0,
        why: '"Must" is a rule. You say OK.',
      },
      {
        line: 'Let’s go to the park at four o’clock.',
        options: ['It’s four o’clock.', 'Yes, I went there.', 'Great! See you there.'],
        answer: 2,
        why: 'Paul makes a plan. You say yes to the plan.',
      },
    ],
  },
);

export const randomDialogue = (excludeId = null) => {
  const pool = excludeId ? DIALOGUES.filter((d) => d.id !== excludeId) : DIALOGUES;
  const list = pool.length ? pool : DIALOGUES;
  return list[Math.floor(Math.random() * list.length)];
};
