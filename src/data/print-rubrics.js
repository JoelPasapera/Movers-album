// @ts-check
// Las instrucciones del examen para imprimir (engine/printTest.js), con
// palabras propias de Starters y Movers: lo que dice la voz (o el profesor)
// antes de cada parte, y lo que se lee en el cuadernillo. Aqui y no en el
// motor porque son contenido: tambien se pueden grabar con la voz del
// profesor (data/voice-lines.js).

/** Lo que se dice antes de cada parte, y lo que se lee en el cuadernillo. */
export const RUBRICS = {
  l1: 'Look at the picture and listen. Draw lines from the names to the people. The first one is done for you.',
  l2: 'Listen and write a word or a number on every line. The first one is done for you.',
  l3: 'Listen. Which picture is it? Write a letter in every box. The first one is done for you.',
  l4: 'Listen and put a tick in the right box.',
  l5: 'Look at the picture and listen. Colour some things in the picture and write a word.',
  r1: 'Read. Find the right word in the box and write it on the line. You do not need all the words.',
  r2: 'Read the questions and answers. Choose the best answer and write its letter in the box.',
  r3: 'Read the story. Choose a word from the box and write it on the line.',
  r3title: 'Now choose the best name for the story. Put a tick in one box.',
  r4: 'Read the text. Which word is right? Write it on the line.',
  r5: 'Look at the pictures and read the story. Write some words to complete every sentence. You can write 1, 2 or 3 words.',
  r6: 'Look at the picture. Complete the sentences, answer the questions and write two sentences about the picture.',
  again: 'Now listen again.',
  end: 'That is the end of this part.',
};

/** Lo que dice la voz al empezar una parte: "Part 2. Listen and write..." @param {number} part @param {string} rubric */
export const partIntro = (part, rubric) => `Part ${part}. ${rubric}`;
