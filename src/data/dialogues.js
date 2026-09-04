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
        why: 'This is not a question, it is news. You answer news, you do not say yes or no.',
      },
      {
        line: 'Would you like to go again next week?',
        options: ['Yes, I was.', 'Yes, please!', 'Yes, I like.'],
        answer: 1,
        why: '"Would you like\u2026?" always takes "Yes, please" or "No, thank you".',
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
        line: 'Can I have a milkshake too?',
        options: ['Yes, I can.', 'Yes, you can.', 'Yes, it is.'],
        answer: 1,
        why: 'Jack asked about himself, so his mum answers about him: "you can".',
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
        line: 'I\u2019m very thirsty, Mum.',
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
      why: 'You give something TO someone. The thing comes first, then "to" and the person.',
    },
    {
      line: 'Let\u2019s go for a walk on Saturday.',
      options: ['Good walk.', 'Good idea!', 'Yes, I walk.'],
      answer: 1,
      why: '"Let\u2019s\u2026" is a plan. You say if you like it.',
    },
  ],
});

export const randomDialogue = (excludeId = null) => {
  const pool = excludeId ? DIALOGUES.filter((d) => d.id !== excludeId) : DIALOGUES;
  const list = pool.length ? pool : DIALOGUES;
  return list[Math.floor(Math.random() * list.length)];
};
