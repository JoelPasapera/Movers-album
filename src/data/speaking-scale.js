// Escala de evaluacion de Speaking de A1 Movers (handbook, p. 86). Tres
// criterios, cada uno con una escala de 0 a 5. El handbook describe las
// bandas 5, 3 y 1; la 4 y la 2 son "rasgos de las dos bandas vecinas a
// partes iguales", y la 0 no llega a la 1.
//
// Los textos son propios: dicen lo mismo que el handbook con palabras del
// profesor (bands) y del nino (child). La estructura (criterios, aspectos,
// bandas y la regla de la pronunciacion) es la del examen.

export const BAND_MAX = 5;

export const SPEAKING_SCALE = [
  {
    id: 'vocabulary',
    label: 'Vocabulary and grammar',
    aspects: ['Range', 'Control', 'Extent', 'Cohesion'],
    bands: {
      5: 'Has the words for every task. Uses simple structures, with mistakes that rarely hide the meaning. '
        + 'Answers with words, phrases or longer sentences, and joins ideas with simple linkers (and, but, then, when).',
      3: 'Has the words for most tasks. Produces some simple structures, with basic mistakes that sometimes hide '
        + 'the meaning. Mostly answers with words or phrases, sometimes something longer; joins ideas with a linker or two (and).',
      1: 'Has the words to attempt some tasks. Tries a few simple sentences, but basic mistakes often hide the meaning. '
        + 'Mostly answers with single words, sometimes a phrase; joins words with and.',
    },
    ask: 'Your words and sentences',
    child: [
      [5, 'I had the words I needed. I said longer sentences and joined ideas with and, but, then or when.'],
      [3, 'I said words and short sentences. I made some mistakes.'],
      [1, 'I said a few words. It was hard to make sentences.'],
    ],
  },
  {
    id: 'pronunciation',
    label: 'Pronunciation',
    aspects: ['Individual sounds', 'Stress', 'Intonation'],
    bands: {
      5: 'Mostly easy to understand. Limited control of word stress and intonation.',
      3: 'Mostly easy to understand, though some sounds are unclear. Limited control of word stress.',
      1: 'Sometimes hard to understand.',
    },
    ask: 'How clearly you spoke',
    child: [
      [5, 'People could understand almost everything I said.'],
      [3, 'People could understand me, but some sounds were not clear.'],
      [1, 'It was often hard to understand me.'],
    ],
  },
  {
    id: 'interaction',
    label: 'Interaction',
    aspects: ['Reception/Responding', 'Support required', 'Fluency/Promptness'],
    bands: {
      5: 'Responds appropriately to instructions, questions and pictures and needs very little support; can ask for help. '
        + 'Nearly always responds promptly, with some hesitation or pausing mid-sentence.',
      3: 'Responds appropriately to instructions, questions and pictures with some support; can ask for help. '
        + 'Often responds promptly, with hesitation and pausing mid-sentence.',
      1: 'Responds appropriately to some instructions, questions and pictures but needs frequent support; may try to ask for help. '
        + 'Hesitates and pauses; answers may come late or in fits and starts.',
    },
    ask: 'How you answered',
    child: [
      [5, 'I answered almost straight away and needed very little help.'],
      [3, 'I answered, but I needed some help and stopped to think.'],
      [1, 'I needed a lot of help and often did not answer.'],
    ],
  },
];

export const BAND_NOTES = {
  4: 'Some features of band 3 and some of band 5, in roughly equal measure.',
  2: 'Some features of band 1 and some of band 3, in roughly equal measure.',
  0: 'Does not reach band 1.',
};

// Regla del handbook: si el candidato produce muy poca lengua (un par de
// palabras), la pronunciacion no puede pasar de 3, sea cual sea su calidad.
// En la app la "evidencia" es la parte de los puntos de Speaking conseguidos:
// con menos de un cuarto, se considera que hubo muy poca lengua.
export const PRONUNCIATION_CAP = { max: 3, minEvidence: 0.25 };

// Lo que escucha el examinador, dicho al nino antes de empezar.
export const LISTENS_FOR = 'The examiner listens for three things: your words and sentences, how clearly you speak, '
  + 'and how you answer. Say more than one word, keep going, and ask if you do not understand.';
