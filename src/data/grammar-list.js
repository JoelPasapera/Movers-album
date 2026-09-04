// Grammar and Structures List de A1 Movers, transcrita del handbook oficial
// (paginas 52-53). Es lo que Movers anade sobre Pre A1 Starters.
//
// Cada entrada trae un patron para comprobar si esa estructura aparece de
// verdad en el contenido de la app. Si no aparece, la comprobacion 7 falla:
// un examen que se estudia sin ver la estructura no se aprueba por suerte.

export const MOVERS_GRAMMAR = [
  {
    id: 'indirect-objects', label: 'Indirect objects',
    example: 'Give it to the teacher!',
    test: /\b(give|gave|gives|send|sent|show|showed|tell|told|bring|brought)\b[^.!?]{0,24}\bto (the|her|his|my|your|their|him|me)\b/i,
  },
  {
    id: 'comparative-adj', label: 'Comparative and superlative adjectives',
    example: 'Your house is bigger than mine.',
    test: /\b(\w+er than|bigger|smaller|taller|better|worse|the (biggest|best|most|smallest)|biggest|best)\b/i,
  },
  {
    id: 'past-simple', label: 'Past simple, regular and irregular',
    example: 'We went to the park yesterday.',
    test: /\b(went|took|wore|walked|stopped|came|said|got|ran|gave|rode|bought|found|saw|flew|opened|played|cooked|laughed|had|was|were)\b/i,
  },
  {
    id: 'verb-infinitive', label: 'Verb + infinitive',
    example: 'I want to go home.',
    test: /\b(want|wanted|wants|like|likes|liked|started|start|would like|need|needs)\s+to\s+\w+/i,
  },
  {
    id: 'verb-ing', label: 'Verb + ing',
    example: 'I went riding on Saturday.',
    test: /\b(went|go|goes|like|likes|liked|love|loves|enjoy|enjoys)\s+\w+ing\b/i,
  },
  {
    id: 'infinitive-purpose', label: 'Infinitive of purpose',
    example: 'She went to town to buy a toothbrush.',
    test: /\b(went|go|goes|came|come)\b[^.!?]{0,30}\bto (buy|see|find|get|make|watch|eat|help|play)\b/i,
  },
  {
    id: 'want-someone-to', label: 'Want / ask someone to do something',
    example: 'He wants the teacher to tell a story.',
    test: /\b(want|wants|wanted|ask|asks|asked|tell|tells|told)\s+((the|his|her|my|your|their)\s+)?(\w+)\s+to\s+\w+/i,
  },
  {
    id: 'must', label: 'Must for obligation',
    example: 'He must do his homework.',
    test: /\bmust(n[\u2019']t)?\b/i,
  },
  {
    id: 'have-got-to', label: 'Have (got) to / had to',
    example: 'I\u2019ve got to go.',
    test: /\b(have|has|had)\s+(got\s+)?to\s+\w+/i,
  },
  {
    id: 'shall', label: 'Shall for offers',
    example: 'Shall I help you wash the car, Mum?',
    test: /\bshall\b/i,
  },
  {
    id: 'could', label: 'Could, past form of can',
    example: 'I could see some birds in the tree.',
    test: /\bcould(n[\u2019']t)?\b/i,
  },
  {
    id: 'adverbs', label: 'Adverbs',
    example: 'She never eats meat. He sang loudly.',
    test: /\b(never|always|sometimes|often|loudly|quietly|slowly|quickly|badly|carefully|a lot)\b/i,
  },
  {
    id: 'comparative-adv', label: 'Comparative and superlative adverbs',
    example: 'My brother reads more quickly than my sister.',
    test: /\b(more \w+ly|better than|best|worse than|faster than)\b/i,
  },
  {
    id: 'conjunctions', label: 'Conjunctions',
    example: 'I went home because I was tired.',
    test: /\bbecause\b/i,
  },
  {
    id: 'prepositions-time', label: 'Prepositions of time',
    example: 'She plays with her friends after school.',
    test: /\b(after (school|lunch|dinner|the)|before (school|lunch|dinner|the|you|he|she|they|it)|on (Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)s?|in the (morning|afternoon|evening)|at night)\b/i,
  },
  {
    id: 'question-words', label: 'Question words',
    example: 'Why is he talking to her? When does school start?',
    test: /\b(why|when|where|who|which|whose|how (much|many|often|old))\b[^.?!]{0,20}\?/i,
  },
  {
    id: 'relative-clauses', label: 'Relative clauses',
    example: 'Vicky is the girl who is riding a bike.',
    test: /\b(who|which|where)\s+(is|are|was|were|can|has|have|lives|works|helps|goes|you can)\b/i,
  },
  {
    id: 'weather-like', label: 'What is / was the weather like?',
    example: 'What was the weather like last weekend?',
    test: /what (is|was|\u2019s|'s) the weather like/i,
  },
  {
    id: 'whats-the-matter', label: 'What\u2019s the matter?',
    example: 'What\u2019s the matter, Daisy?',
    test: /what(\u2019s|'s| is) the matter/i,
  },
  {
    id: 'how-about', label: 'How / What about + noun or -ing',
    example: 'How about going to the cinema?',
    test: /\b(how|what) about\s+\w+/i,
  },
  {
    id: 'when-clauses', label: 'When clauses',
    example: 'When he got home, he had his dinner.',
    test: /\bwhen\s+(he|she|they|it|you|we|i|the|my|her|his)\s+\w+/i,
  },
  {
    id: 'go-for-a', label: 'Go for a + noun',
    example: 'Yesterday we went for a drive.',
    test: /\b(go|goes|went|going)\s+for\s+an?\s+\w+/i,
  },
  {
    id: 'be-called', label: 'Be called + noun',
    example: 'A baby cat is called a kitten.',
    test: /\b(is|are|was|were)\s+called\b/i,
  },
  {
    id: 'be-good-at', label: 'Be good at + noun',
    example: 'She\u2019s very good at basketball.',
    test: /\bgood at\b/i,
  },
  {
    id: 'i-think', label: 'I think / I know',
    example: 'I think he\u2019s very nice.',
    test: /\bi (think|know)\b/i,
  },
];
