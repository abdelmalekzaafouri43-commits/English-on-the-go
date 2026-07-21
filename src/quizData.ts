export interface Question {
  question: string;
  options: string[];
  answerIndex: number;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: Question[];
}

export interface CrosswordClue {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  row: number; // 0-indexed
  col: number; // 0-indexed
}

export interface Crossword {
  title: string;
  size: number; // e.g., 8 for 8x8
  clues: CrosswordClue[];
}

export const QUIZ_SECTIONS = [
  { id: 'present', title: 'Simple Present', icon: '⏰', count: '6 Quizzes' },
  { id: 'past', title: 'Simple Past', icon: '📜', count: '6 Quizzes' },
  { id: 'future', title: 'Future', icon: '🚀', count: '6 Quizzes' },
  { id: 'antonyms', title: 'Antonyms', icon: '↔️', count: '6 Quizzes' },
  { id: 'synonyms', title: 'Synonyms', icon: '🤝', count: '6 Quizzes' },
  { id: 'games', title: 'Games', icon: '🧩', count: '6 Crosswords' },
];

export const DEFAULT_QUIZZES: Record<string, Quiz[]> = {
  present: [
    {
      title: "Daily Routines",
      questions: [
        {
          question: "Sarah always _______ her teeth before going to bed.",
          options: ["brush", "brushes", "brushing", "brushed"],
          answerIndex: 1,
          explanation: "For third-person singular (Sarah), we add '-es' to verbs ending in 'sh'."
        },
        {
          question: "They _______ to the gym on weekends.",
          options: ["goes", "go", "going", "gone"],
          answerIndex: 1,
          explanation: "For plural pronouns (They), we use the base form of the verb 'go'."
        },
        {
          question: "My father _______ at 6:00 AM every morning.",
          options: ["wake up", "wakes up", "waking up", "waked up"],
          answerIndex: 1,
          explanation: "My father is singular (he), so we use 'wakes up'."
        },
        {
          question: "The school bus _______ at our street at 7:30 AM.",
          options: ["arrive", "arriving", "arrives", "arrived"],
          answerIndex: 2,
          explanation: "The school bus is third-person singular, so the verb is 'arrives'."
        },
        {
          question: "Do you _______ breakfast every day?",
          options: ["eats", "eat", "eating", "ate"],
          answerIndex: 1,
          explanation: "In questions with 'Do', the main verb remains in its base form."
        }
      ]
    },
    {
      title: "Subject-Verb Agreement",
      questions: [
        {
          question: "Neither of the students _______ a laptop today.",
          options: ["have", "has", "having", "haves"],
          answerIndex: 1,
          explanation: "'Neither of the students' is grammatically singular, so it takes 'has'."
        },
        {
          question: "English on the go _______ our favorite application.",
          options: ["are", "is", "am", "be"],
          answerIndex: 1,
          explanation: "'English on the go' is a singular application name, so we use 'is'."
        },
        {
          question: "The cat and the dog _______ always playing together.",
          options: ["is", "are", "be", "am"],
          answerIndex: 1,
          explanation: "A plural subject connected by 'and' takes the plural verb 'are'."
        },
        {
          question: "Every boy and girl _______ given a textbook.",
          options: ["is", "are", "be", "were"],
          answerIndex: 0,
          explanation: "Subjects preceded by 'every' are grammatically singular and take 'is'."
        },
        {
          question: "The jury _______ deciding the verdict now.",
          options: ["is", "are", "be", "were"],
          answerIndex: 0,
          explanation: "Collective nouns (jury) acting as a single unit take a singular verb."
        }
      ]
    },
    {
      title: "Negative Sentences",
      questions: [
        {
          question: "He _______ like coffee, he prefers tea.",
          options: ["don't", "not", "doesn't", "isn't"],
          answerIndex: 2,
          explanation: "We use 'doesn't' (does not) for third-person singular negative statements."
        },
        {
          question: "We _______ need any extra help right now.",
          options: ["doesn't", "don't", "not", "no"],
          answerIndex: 1,
          explanation: "We use 'don't' (do not) for first-person plural."
        },
        {
          question: "She _______ speak Spanish fluently.",
          options: ["doesn't", "don't", "isn't", "no"],
          answerIndex: 0,
          explanation: "'She' is third-person singular, requiring 'doesn't'."
        },
        {
          question: "They _______ have a car, so they take the subway.",
          options: ["doesn't", "don't", "aren't", "not"],
          answerIndex: 1,
          explanation: "'They' takes the plural auxiliary negative 'don't'."
        },
        {
          question: "My brother _______ play video games on weekdays.",
          options: ["don't", "doesn't", "not", "isn't"],
          answerIndex: 1,
          explanation: "'My brother' is singular (he), so we use 'doesn't'."
        }
      ]
    },
    {
      title: "Question Form",
      questions: [
        {
          question: "_______ she play the piano?",
          options: ["Do", "Does", "Is", "Are"],
          answerIndex: 1,
          explanation: "We use 'Does' for singular third-person questions."
        },
        {
          question: "_______ you live in Tunis?",
          options: ["Do", "Does", "Is", "Are"],
          answerIndex: 0,
          explanation: "We use 'Do' for second-person singular/plural questions."
        },
        {
          question: "What time _______ the train leave?",
          options: ["do", "does", "is", "has"],
          answerIndex: 1,
          explanation: "'The train' is singular (it), so we ask 'does the train leave'."
        },
        {
          question: "Where _______ your grandparents live?",
          options: ["do", "does", "are", "is"],
          answerIndex: 0,
          explanation: "'Grandparents' is plural, requiring the auxiliary 'do'."
        },
        {
          question: "_______ your sister work at the lab?",
          options: ["Do", "Does", "Is", "Has"],
          answerIndex: 1,
          explanation: "'Your sister' is singular, so 'Does' is correct."
        }
      ]
    },
    {
      title: "Frequency Adverbs",
      questions: [
        {
          question: "He _______ arrives late; he is always on time.",
          options: ["never", "always", "usually", "frequently"],
          answerIndex: 0,
          explanation: "If he is always on time, he 'never' arrives late."
        },
        {
          question: "We _______ watch movies on Fridays, but sometimes we stay in.",
          options: ["rarely", "never", "usually", "seldom"],
          answerIndex: 2,
          explanation: "'Usually' implies a standard routine that matches the sentence context."
        },
        {
          question: "She is _______ cheerful in the morning; she loves early hours.",
          options: ["seldom", "always", "never", "rarely"],
          answerIndex: 1,
          explanation: "Since she loves early hours, she is 'always' cheerful."
        },
        {
          question: "My parents _______ travel because they dislike airplanes.",
          options: ["often", "rarely", "always", "usually"],
          answerIndex: 1,
          explanation: "If they dislike airplanes, they 'rarely' travel."
        },
        {
          question: "I _______ drink milk, I have it every single day.",
          options: ["never", "sometimes", "always", "rarely"],
          answerIndex: 2,
          explanation: "Drinking it 'every single day' corresponds to 'always'."
        }
      ]
    },
    {
      title: "General Truths",
      questions: [
        {
          question: "Water _______ at 100 degrees Celsius.",
          options: ["boil", "boils", "boiling", "boiled"],
          answerIndex: 1,
          explanation: "Scientific facts and general truths are written in the simple present tense singular (boils)."
        },
        {
          question: "The Earth _______ around the Sun.",
          options: ["revolve", "revolves", "revolving", "revolved"],
          answerIndex: 1,
          explanation: "The Earth is singular, and it's a general truth, so 'revolves'."
        },
        {
          question: "Wood _______ on water.",
          options: ["float", "floats", "floating", "floated"],
          answerIndex: 1,
          explanation: "A general physical truth requires the singular form 'floats'."
        },
        {
          question: "The sun _______ in the East.",
          options: ["rise", "rises", "rising", "rose"],
          answerIndex: 1,
          explanation: "A natural scientific truth requires the simple present 'rises'."
        },
        {
          question: "Plants _______ carbon dioxide to make food.",
          options: ["need", "needs", "needing", "needed"],
          answerIndex: 0,
          explanation: "'Plants' is plural, so we use the base verb 'need'."
        }
      ]
    }
  ],
  past: [
    {
      title: "Regular Verbs",
      questions: [
        {
          question: "Yesterday, we _______ soccer in the park.",
          options: ["play", "played", "playing", "plays"],
          answerIndex: 1,
          explanation: "For regular past tense, we add '-ed' to the verb (played)."
        },
        {
          question: "She _______ her homework an hour ago.",
          options: ["finish", "finishing", "finished", "finishes"],
          answerIndex: 2,
          explanation: "'Finished' is the simple past form of the regular verb 'finish'."
        },
        {
          question: "They _______ Tunisia last summer.",
          options: ["visit", "visited", "visiting", "visits"],
          answerIndex: 1,
          explanation: "Past event 'last summer' uses the regular past form 'visited'."
        },
        {
          question: "He _______ the door for the elderly lady.",
          options: ["open", "opened", "opening", "opens"],
          answerIndex: 1,
          explanation: "The action is completed in the past, so we use 'opened'."
        },
        {
          question: "We _______ a beautiful song in music class yesterday.",
          options: ["listen", "listened", "listening", "listens"],
          answerIndex: 1,
          explanation: "Past time indicator 'yesterday' requires 'listened'."
        }
      ]
    },
    {
      title: "Irregular Verbs",
      questions: [
        {
          question: "He _______ to Paris last weekend.",
          options: ["go", "goed", "went", "gone"],
          answerIndex: 2,
          explanation: "The simple past of the irregular verb 'go' is 'went'."
        },
        {
          question: "I _______ a delicious cake yesterday.",
          options: ["eat", "ated", "eating", "ate"],
          answerIndex: 3,
          explanation: "The simple past of 'eat' is 'ate'."
        },
        {
          question: "She _______ a beautiful letter to her cousin.",
          options: ["write", "wrote", "written", "writed"],
          answerIndex: 1,
          explanation: "The irregular past tense of 'write' is 'wrote'."
        },
        {
          question: "They _______ the match with a dramatic late goal.",
          options: ["win", "winned", "won", "winning"],
          answerIndex: 2,
          explanation: "The past of 'win' is 'won'."
        },
        {
          question: "My father _______ me a valuable present for graduation.",
          options: ["give", "gived", "gave", "given"],
          answerIndex: 2,
          explanation: "The irregular simple past of 'give' is 'gave'."
        }
      ]
    },
    {
      title: "Negatives & Questions",
      questions: [
        {
          question: "I _______ see him at the party last night.",
          options: ["didn't", "don't", "wasn't", "no"],
          answerIndex: 0,
          explanation: "We use 'didn't' (did not) with the base verb to make negatives in the past."
        },
        {
          question: "_______ you complete your assignment yesterday?",
          options: ["Do", "Did", "Was", "Were"],
          answerIndex: 1,
          explanation: "We use 'Did' to form questions in the simple past."
        },
        {
          question: "They _______ go to the beach because of the rain.",
          options: ["didn't", "not", "don't", "wasn't"],
          answerIndex: 0,
          explanation: "Negative past statements require the auxiliary 'didn't'."
        },
        {
          question: "What _______ she say during the meeting?",
          options: ["do", "does", "did", "was"],
          answerIndex: 2,
          explanation: "We use 'did' as the helper verb for simple past questions."
        },
        {
          question: "He _______ buy the book because it was too expensive.",
          options: ["didn't", "don't", "wasn't", "no"],
          answerIndex: 0,
          explanation: "'didn't' is the past negative auxiliary."
        }
      ]
    },
    {
      title: "Used to",
      questions: [
        {
          question: "I _______ play video games, but now I prefer reading.",
          options: ["use to", "used to", "used", "was used"],
          answerIndex: 1,
          explanation: "We use 'used to' to express past habits that no longer happen."
        },
        {
          question: "Did you _______ live in London when you were young?",
          options: ["used to", "use to", "using to", "uses to"],
          answerIndex: 1,
          explanation: "In questions with 'Did', 'used to' becomes 'use to' because of the auxiliary verb."
        },
        {
          question: "She _______ like broccoli, but now she loves it.",
          options: ["didn't use to", "didn't used to", "not used to", "used not to"],
          answerIndex: 0,
          explanation: "The correct negative form is 'didn't use to' (no 'd' on 'use')."
        },
        {
          question: "We _______ go camping every single summer.",
          options: ["used to", "use to", "was used to", "were used to"],
          answerIndex: 0,
          explanation: "Affirmative past habit is written as 'used to'."
        },
        {
          question: "They _______ be close friends, but they grew apart.",
          options: ["used to", "use to", "didn't use to", "were used to"],
          answerIndex: 0,
          explanation: "Past state 'used to be close friends'."
        }
      ]
    },
    {
      title: "Past Continuous vs Simple Past",
      questions: [
        {
          question: "I _______ when the telephone rang.",
          options: ["cooked", "was cooking", "were cooking", "cooking"],
          answerIndex: 1,
          explanation: "We use the past continuous (was cooking) for an ongoing action interrupted by a sudden past action (rang)."
        },
        {
          question: "While she _______, her brother was playing video games.",
          options: ["studies", "studied", "was studying", "were studying"],
          answerIndex: 2,
          explanation: "We use past continuous (was studying) to show a parallel past action."
        },
        {
          question: "They _______ TV when the lights went out.",
          options: ["watched", "were watching", "was watching", "watching"],
          answerIndex: 1,
          explanation: "Plural past continuous: 'They were watching'."
        },
        {
          question: "He _______ down the street when he met his old friend.",
          options: ["walked", "was walking", "were walking", "is walking"],
          answerIndex: 1,
          explanation: "The ongoing past action 'was walking' was interrupted by 'met'."
        },
        {
          question: "When I arrived at the office, they _______ a meeting.",
          options: ["had", "was having", "were having", "have"],
          answerIndex: 2,
          explanation: "They were in the middle of a meeting ('were having') when I arrived."
        }
      ]
    },
    {
      title: "Time Expressions",
      questions: [
        {
          question: "They started this project three days _______.",
          options: ["ago", "before", "last", "yesterday"],
          answerIndex: 0,
          explanation: "We use 'ago' after a duration of time (three days ago) to refer to the past."
        },
        {
          question: "We had a big test _______ Friday.",
          options: ["ago", "last", "yesterday", "in"],
          answerIndex: 1,
          explanation: "We use 'last' before days of the week (last Friday)."
        },
        {
          question: "I spoke with my English tutor _______ morning.",
          options: ["this", "last", "ago", "yesterday"],
          answerIndex: 0,
          explanation: "'This morning' can refer to a completed past action earlier in the same day."
        },
        {
          question: "She graduated from university _______ 2024.",
          options: ["on", "at", "in", "ago"],
          answerIndex: 2,
          explanation: "We use the preposition 'in' with years (in 2024)."
        },
        {
          question: "He visited Tunisia _______ month.",
          options: ["last", "yesterday", "ago", "in"],
          answerIndex: 0,
          explanation: "'Last month' is correct for a past completed action."
        }
      ]
    }
  ],
  future: [
    {
      title: "Will vs Going to",
      questions: [
        {
          question: "Look at those dark clouds! It _______ rain.",
          options: ["will", "is going to", "rains", "is raining"],
          answerIndex: 1,
          explanation: "We use 'is going to' for predictions based on present, clear physical evidence."
        },
        {
          question: "Wait, I _______ help you with those heavy bags.",
          options: ["will", "am going to", "going to", "shall to"],
          answerIndex: 0,
          explanation: "We use 'will' for spontaneous decisions, offers, or promises made at the moment of speaking."
        },
        {
          question: "I _______ study medicine at university next year; I've already enrolled.",
          options: ["will", "am going to", "shall", "studying"],
          answerIndex: 1,
          explanation: "Since the decision was made before and actions are taken (enrolled), we use 'am going to'."
        },
        {
          question: "Maybe we _______ visit Spain next summer.",
          options: ["will", "are going to", "shall to", "go to"],
          answerIndex: 0,
          explanation: "We use 'will' with 'maybe' or when expressing a non-definite possibility."
        },
        {
          question: "I promise I _______ call you as soon as I arrive.",
          options: ["will", "am going to", "calls", "going to"],
          answerIndex: 0,
          explanation: "We use 'will' for making promises."
        }
      ]
    },
    {
      title: "Future Plans",
      questions: [
        {
          question: "We _______ the museum tomorrow morning. The tickets are bought.",
          options: ["visit", "are visiting", "will visit", "visited"],
          answerIndex: 1,
          explanation: "The present continuous (are visiting) is often used for confirmed personal future arrangements."
        },
        {
          question: "She _______ her driving test next week.",
          options: ["takes", "is taking", "took", "will take"],
          answerIndex: 1,
          explanation: "Planned appointment or schedule next week uses the arrangement form 'is taking' or 'is going to take'."
        },
        {
          question: "They _______ married in October.",
          options: ["get", "are getting", "will get", "got"],
          answerIndex: 1,
          explanation: "Personal arrangements like getting married are commonly expressed with present continuous 'are getting'."
        },
        {
          question: "What time _______ you meeting him tonight?",
          options: ["will", "are", "do", "going to"],
          answerIndex: 1,
          explanation: "'Are you meeting' is the correct present continuous question form for future arrangements."
        },
        {
          question: "I _______ to Tunis on Friday evening.",
          options: ["fly", "am flying", "flew", "flies"],
          answerIndex: 1,
          explanation: "A concrete planned arrangement uses 'am flying'."
        }
      ]
    },
    {
      title: "Promises & Offers",
      questions: [
        {
          question: "Don't worry, I _______ tell anyone your secret.",
          options: ["will", "won't", "am not going to", "don't"],
          answerIndex: 1,
          explanation: "We use 'won't' (will not) for negative promises."
        },
        {
          question: "The phone is ringing. I _______ answer it!",
          options: ["will", "am going to", "answering", "shall to"],
          answerIndex: 0,
          explanation: "A spontaneous offer/decision at the moment of speaking requires 'will'."
        },
        {
          question: "_______ I carry that suitcase for you?",
          options: ["Will", "Shall", "Do", "Would"],
          answerIndex: 1,
          explanation: "We use 'Shall' in questions with 'I' or 'We' to make polite offers or suggestions."
        },
        {
          question: "We _______ always support you, no matter what.",
          options: ["will", "are going to", "going to", "shall to"],
          answerIndex: 0,
          explanation: "A profound promise or determination uses 'will'."
        },
        {
          question: "I _______ pay you back the money tomorrow.",
          options: ["will", "am going to", "won't", "pay"],
          answerIndex: 0,
          explanation: "A promise of repayment uses 'will'."
        }
      ]
    },
    {
      title: "Future Continuous",
      questions: [
        {
          question: "This time tomorrow, I _______ on a beach in Tunisia.",
          options: ["will lie", "will be lying", "am lying", "lie"],
          answerIndex: 1,
          explanation: "We use the future continuous (will be lying) to talk about an action in progress at a specific future time."
        },
        {
          question: "Don't call her at 8 PM. She _______ dinner with her family.",
          options: ["will have", "will be having", "has", "having"],
          answerIndex: 1,
          explanation: "An ongoing future action at that specific hour is expressed with 'will be having'."
        },
        {
          question: "At midnight, they _______ sleeping soundly.",
          options: ["will be", "will", "are", "shall"],
          answerIndex: 0,
          explanation: "Full verb phrase is 'will be sleeping'."
        },
        {
          question: "_______ you be using your car tomorrow morning?",
          options: ["Will", "Are", "Do", "Shall"],
          answerIndex: 0,
          explanation: "'Will you be using' is future continuous question form, used to ask politely about plans."
        },
        {
          question: "In ten years, many people _______ driving electric vehicles.",
          options: ["will be", "are", "will", "going to"],
          answerIndex: 0,
          explanation: "Future continuous 'will be driving' represents an ongoing state in the future."
        }
      ]
    },
    {
      title: "Future Perfect",
      questions: [
        {
          question: "By next month, she _______ her research project.",
          options: ["will finish", "will have finished", "finishes", "will be finishing"],
          answerIndex: 1,
          explanation: "We use the future perfect (will have finished) for actions that will be completed before a certain point in the future."
        },
        {
          question: "I _______ my degree by the end of this year.",
          options: ["will complete", "will have completed", "completed", "am completing"],
          answerIndex: 1,
          explanation: "Action completed 'by' a future point uses 'will have completed'."
        },
        {
          question: "They _______ in Tunisia for ten years by next August.",
          options: ["will live", "will have lived", "have lived", "will be living"],
          answerIndex: 1,
          explanation: "Duration of a state leading up to a future point uses 'will have lived'."
        },
        {
          question: "By the time you arrive, we _______ cooking dinner.",
          options: ["will finish", "will have finished", "finished", "finish"],
          answerIndex: 1,
          explanation: "Completed future event before another future event (your arrival) uses 'will have finished'."
        },
        {
          question: "Will you _______ written the article by tomorrow morning?",
          options: ["has", "have", "had", "be"],
          answerIndex: 1,
          explanation: "Future perfect auxiliary is always 'will have' (never has/had) followed by past participle."
        }
      ]
    },
    {
      title: "Expressing Future with Present",
      questions: [
        {
          question: "The flight _______ at 9:00 PM tonight.",
          options: ["leaves", "will have left", "left", "leaving"],
          answerIndex: 0,
          explanation: "We use the simple present (leaves) for scheduled public events (timetables, flights, movies)."
        },
        {
          question: "As soon as he _______, we will begin the meeting.",
          options: ["will arrive", "arrives", "arrived", "arriving"],
          answerIndex: 1,
          explanation: "In time clauses (after as soon as, when, before), we use simple present 'arrives' instead of will."
        },
        {
          question: "If it _______ tomorrow, we won't go on a picnic.",
          options: ["will rain", "rains", "rained", "is raining"],
          answerIndex: 1,
          explanation: "In first conditional 'if' clauses, we use the simple present tense to refer to the future."
        },
        {
          question: "The school term _______ on September 15th.",
          options: ["starts", "is starting", "will have started", "started"],
          answerIndex: 0,
          explanation: "Timetabled school calendars use simple present 'starts'."
        },
        {
          question: "I will call you when I _______ to the hotel.",
          options: ["will get", "get", "got", "am getting"],
          answerIndex: 1,
          explanation: "In a time clause starting with 'when', use simple present 'get'."
        }
      ]
    }
  ],
  antonyms: [
    {
      title: "Basic Adjectives",
      questions: [
        {
          question: "What is the antonym of 'wet'?",
          options: ["damp", "dry", "humid", "watery"],
          answerIndex: 1,
          explanation: "The direct opposite of wet is dry."
        },
        {
          question: "What is the antonym of 'sharp'?",
          options: ["pointy", "blunt", "clever", "acute"],
          answerIndex: 1,
          explanation: "A knife that is not sharp is described as blunt."
        },
        {
          question: "What is the antonym of 'rough'?",
          options: ["smooth", "coarse", "bumpy", "hard"],
          answerIndex: 0,
          explanation: "'Smooth' is the antonym of 'rough'."
        },
        {
          question: "What is the antonym of 'cheap'?",
          options: ["inexpensive", "affordable", "expensive", "costly"],
          answerIndex: 2,
          explanation: "'Expensive' is the direct antonym of 'cheap'."
        },
        {
          question: "What is the antonym of 'deep'?",
          options: ["shallow", "hollow", "flat", "narrow"],
          answerIndex: 0,
          explanation: "'Shallow' is the antonym of 'deep'."
        }
      ]
    },
    {
      title: "Emotions & Feelings",
      questions: [
        {
          question: "What is the antonym of 'cheerful'?",
          options: ["gloomy", "happy", "excited", "friendly"],
          answerIndex: 0,
          explanation: "Gloomy means dark, sad, or depressed, which is the antonym of cheerful."
        },
        {
          question: "What is the antonym of 'brave'?",
          options: ["bold", "fearless", "cowardly", "strong"],
          answerIndex: 2,
          explanation: "Cowardly is the opposite of brave."
        },
        {
          question: "What is the antonym of 'anxious'?",
          options: ["nervous", "calm", "excited", "worried"],
          answerIndex: 1,
          explanation: "Calm is the opposite of anxious."
        },
        {
          question: "What is the antonym of 'humble'?",
          options: ["modest", "polite", "proud", "shy"],
          answerIndex: 2,
          explanation: "Proud or arrogant is the antonym of humble."
        },
        {
          question: "What is the antonym of 'hostile'?",
          options: ["aggressive", "friendly", "mean", "distant"],
          answerIndex: 1,
          explanation: "Friendly is the antonym of hostile (which means unfriendly or opposing)."
        }
      ]
    },
    {
      title: "Verbs",
      questions: [
        {
          question: "What is the antonym of 'accept'?",
          options: ["receive", "reject", "agree", "take"],
          answerIndex: 1,
          explanation: "To reject is to refuse to accept something."
        },
        {
          question: "What is the antonym of 'create'?",
          options: ["destroy", "build", "design", "make"],
          answerIndex: 0,
          explanation: "Destroy is the antonym of create."
        },
        {
          question: "What is the antonym of 'remember'?",
          options: ["recall", "forget", "remind", "memorize"],
          answerIndex: 1,
          explanation: "Forget is the direct opposite of remember."
        },
        {
          question: "What is the antonym of 'succeed'?",
          options: ["fail", "win", "achieve", "advance"],
          answerIndex: 0,
          explanation: "'Fail' is the opposite of 'succeed'."
        },
        {
          question: "What is the antonym of 'scatter'?",
          options: ["gather", "disperse", "spread", "throw"],
          answerIndex: 0,
          explanation: "Gather (bring together) is the antonym of scatter (throw around)."
        }
      ]
    },
    {
      title: "Advanced Descriptors",
      questions: [
        {
          question: "What is the antonym of 'generous'?",
          options: ["charitable", "stingy", "kind", "wealthy"],
          answerIndex: 1,
          explanation: "Stingy means unwilling to spend or give money, the antonym of generous."
        },
        {
          question: "What is the antonym of 'cautious'?",
          options: ["careful", "reckless", "prudent", "safe"],
          answerIndex: 1,
          explanation: "Reckless means acting without caution or care for consequences."
        },
        {
          question: "What is the antonym of 'temporary'?",
          options: ["brief", "permanent", "momentary", "instant"],
          answerIndex: 1,
          explanation: "Permanent means lasting forever, the antonym of temporary."
        },
        {
          question: "What is the antonym of 'amateur'?",
          options: ["beginner", "novice", "professional", "unskilled"],
          answerIndex: 2,
          explanation: "'Professional' is the antonym of 'amateur'."
        },
        {
          question: "What is the antonym of 'optimistic'?",
          options: ["hopeful", "positive", "pessimistic", "cheerful"],
          answerIndex: 2,
          explanation: "'Pessimistic' is the antonym of 'optimistic'."
        }
      ]
    },
    {
      title: "Abstract Concepts",
      questions: [
        {
          question: "What is the antonym of 'chaos'?",
          options: ["order", "confusion", "disorder", "mess"],
          answerIndex: 0,
          explanation: "Order is the state of peace and structural clarity, the opposite of chaos."
        },
        {
          question: "What is the antonym of 'freedom'?",
          options: ["liberty", "slavery", "independence", "rights"],
          answerIndex: 1,
          explanation: "Slavery or captivity is the antonym of freedom."
        },
        {
          question: "What is the antonym of 'abundance'?",
          options: ["scarcity", "plenty", "wealth", "surplus"],
          answerIndex: 0,
          explanation: "Scarcity means a very small or insufficient supply, the antonym of abundance."
        },
        {
          question: "What is the antonym of 'harmony'?",
          options: ["discord", "peace", "agreement", "unity"],
          answerIndex: 0,
          explanation: "Discord (disagreement or lack of harmony) is the opposite of harmony."
        },
        {
          question: "What is the antonym of 'victory'?",
          options: ["triumph", "defeat", "success", "achievement"],
          answerIndex: 1,
          explanation: "Defeat is the antonym of victory."
        }
      ]
    },
    {
      title: "Academic Vocab",
      questions: [
        {
          question: "What is the antonym of 'vague'?",
          options: ["unclear", "precise", "fuzzy", "abstract"],
          answerIndex: 1,
          explanation: "Precise or clear is the antonym of vague."
        },
        {
          question: "What is the antonym of 'rigid'?",
          options: ["stiff", "flexible", "firm", "hard"],
          answerIndex: 1,
          explanation: "Flexible is the antonym of rigid."
        },
        {
          question: "What is the antonym of 'voluntary'?",
          options: ["optional", "compulsory", "willing", "free"],
          answerIndex: 1,
          explanation: "Compulsory (mandatory) is the antonym of voluntary."
        },
        {
          question: "What is the antonym of 'diligent'?",
          options: ["lazy", "hardworking", "active", "studious"],
          answerIndex: 0,
          explanation: "Lazy is the antonym of diligent (hardworking)."
        },
        {
          question: "What is the antonym of 'expand'?",
          options: ["grow", "shrink", "stretch", "multiply"],
          answerIndex: 1,
          explanation: "Shrink or contract is the antonym of expand."
        }
      ]
    }
  ],
  synonyms: [
    {
      title: "Standard Adjectives",
      questions: [
        {
          question: "What is a synonym of 'smart'?",
          options: ["dull", "intelligent", "slow", "lazy"],
          answerIndex: 1,
          explanation: "Intelligent is a synonym of smart."
        },
        {
          question: "What is a synonym of 'vast'?",
          options: ["tiny", "narrow", "huge", "small"],
          answerIndex: 2,
          explanation: "Vast and huge both mean extremely large."
        },
        {
          question: "What is a synonym of 'glad'?",
          options: ["sad", "happy", "angry", "scared"],
          answerIndex: 1,
          explanation: "Glad and happy both mean feeling pleasure or joy."
        },
        {
          question: "What is a synonym of 'brief'?",
          options: ["long", "extended", "short", "detailed"],
          answerIndex: 2,
          explanation: "Brief and short have the same meaning."
        },
        {
          question: "What is a synonym of 'difficult'?",
          options: ["easy", "hard", "simple", "painless"],
          answerIndex: 1,
          explanation: "Hard is a direct synonym of difficult."
        }
      ]
    },
    {
      title: "Active Verbs",
      questions: [
        {
          question: "What is a synonym of 'sprint'?",
          options: ["walk", "run", "crawl", "hop"],
          answerIndex: 1,
          explanation: "To sprint is to run very fast over a short distance."
        },
        {
          question: "What is a synonym of 'gaze'?",
          options: ["stare", "blink", "close", "shut"],
          answerIndex: 0,
          explanation: "To gaze is to look steadily or stare at something."
        },
        {
          question: "What is a synonym of 'construct'?",
          options: ["destroy", "build", "break", "ruin"],
          answerIndex: 1,
          explanation: "To construct is to build or put together."
        },
        {
          question: "What is a synonym of 'ponder'?",
          options: ["forget", "think", "ignore", "neglect"],
          answerIndex: 1,
          explanation: "To ponder is to think about something carefully."
        },
        {
          question: "What is a synonym of 'assist'?",
          options: ["hinder", "help", "block", "stop"],
          answerIndex: 1,
          explanation: "To assist is to help someone."
        }
      ]
    },
    {
      title: "Nouns",
      questions: [
        {
          question: "What is a synonym of 'dwelling'?",
          options: ["car", "house", "road", "shop"],
          answerIndex: 1,
          explanation: "A dwelling is a house, apartment, or other place of residence."
        },
        {
          question: "What is a synonym of 'path'?",
          options: ["lake", "route", "mountain", "cloud"],
          answerIndex: 1,
          explanation: "A path is a route or way."
        },
        {
          question: "What is a synonym of 'infant'?",
          options: ["adult", "baby", "teenager", "elder"],
          answerIndex: 1,
          explanation: "An infant is a very young child or baby."
        },
        {
          question: "What is a synonym of 'scent'?",
          options: ["smell", "color", "sound", "taste"],
          answerIndex: 0,
          explanation: "Scent is a distinctive smell, especially a pleasant one."
        },
        {
          question: "What is a synonym of 'foe'?",
          options: ["friend", "partner", "enemy", "ally"],
          answerIndex: 2,
          explanation: "A foe is an enemy."
        }
      ]
    },
    {
      title: "Advanced Synonyms",
      questions: [
        {
          question: "What is a synonym of 'diligent'?",
          options: ["careless", "lazy", "hardworking", "indifferent"],
          answerIndex: 2,
          explanation: "Diligent means showing care and conscientiousness, i.e., hardworking."
        },
        {
          question: "What is a synonym of 'abundant'?",
          options: ["scarce", "limited", "plentiful", "empty"],
          answerIndex: 2,
          explanation: "Abundant and plentiful mean existing in large quantities."
        },
        {
          question: "What is a synonym of 'genuine'?",
          options: ["fake", "authentic", "artificial", "false"],
          answerIndex: 1,
          explanation: "Genuine and authentic mean real and true."
        },
        {
          question: "What is a synonym of 'courageous'?",
          options: ["fearful", "cowardly", "brave", "weak"],
          answerIndex: 2,
          explanation: "Courageous and brave mean showing courage."
        },
        {
          question: "What is a synonym of 'vivid'?",
          options: ["dull", "bright", "pale", "dark"],
          answerIndex: 1,
          explanation: "Vivid means producing powerful, bright, or clear feelings/images."
        }
      ]
    },
    {
      title: "Literary Words",
      questions: [
        {
          question: "What is a synonym of 'concise'?",
          options: ["lengthy", "wordy", "brief", "unclear"],
          answerIndex: 2,
          explanation: "Concise means giving a lot of information clearly and in a few words (brief)."
        },
        {
          question: "What is a synonym of 'benevolent'?",
          options: ["cruel", "kind", "stingy", "selfish"],
          answerIndex: 1,
          explanation: "Benevolent means well-meaning and kindly."
        },
        {
          question: "What is a synonym of 'weary'?",
          options: ["energetic", "tired", "happy", "bored"],
          answerIndex: 1,
          explanation: "Weary means feeling or showing extreme tiredness."
        },
        {
          question: "What is a synonym of 'hostility'?",
          options: ["friendship", "kindness", "anger", "peace"],
          answerIndex: 2,
          explanation: "Hostility involves unfriendly behavior or anger."
        },
        {
          question: "What is a synonym of 'solitude'?",
          options: ["crowd", "isolation", "gathering", "noise"],
          answerIndex: 1,
          explanation: "Solitude is the state of being alone (isolation)."
        }
      ]
    },
    {
      title: "Daily Expressions",
      questions: [
        {
          question: "What is a synonym of 'complete'?",
          options: ["start", "finish", "fail", "neglect"],
          answerIndex: 1,
          explanation: "To complete is to finish or bring to an end."
        },
        {
          question: "What is a synonym of 'quick'?",
          options: ["slow", "rapid", "steady", "gradual"],
          answerIndex: 1,
          explanation: "Rapid is a synonym of quick."
        },
        {
          question: "What is a synonym of 'correct'?",
          options: ["wrong", "right", "incorrect", "false"],
          answerIndex: 1,
          explanation: "Right is a synonym of correct."
        },
        {
          question: "What is a synonym of 'gather'?",
          options: ["scatter", "disperse", "collect", "throw"],
          answerIndex: 2,
          explanation: "Collect and gather both mean to bring together."
        },
        {
          question: "What is a synonym of 'purchase'?",
          options: ["sell", "give", "buy", "borrow"],
          answerIndex: 2,
          explanation: "To purchase is to buy."
        }
      ]
    }
  ]
};

export const DEFAULT_CROSSWORDS: Crossword[] = [
  {
    title: "Grammar & General #1",
    size: 7,
    clues: [
      { number: 1, direction: 'across', clue: "Opposite of 'off'. (2 letters)", answer: "ON", row: 0, col: 1 },
      { number: 2, direction: 'across', clue: "To consume food. (3 letters)", answer: "EAT", row: 2, col: 1 },
      { number: 3, direction: 'across', clue: "Third-person singular for 'to be'. (2 letters)", answer: "IS", row: 4, col: 2 },
      { number: 4, direction: 'across', clue: "We breathe this. (3 letters)", answer: "AIR", row: 6, col: 2 },
      { number: 5, direction: 'down', clue: "Preposition of time/place: '___ 5 o'clock'. (2 letters)", answer: "AT", row: 2, col: 2 },
      { number: 6, direction: 'down', clue: "To perform or execute an action. (2 letters)", answer: "DO", row: 0, col: 4 },
      { number: 7, direction: 'down', clue: "Opposite of 'yes'. (2 letters)", answer: "NO", row: 0, col: 2 }
    ]
  },
  {
    title: "Simple Present Clues #2",
    size: 8,
    clues: [
      { number: 1, direction: 'across', clue: "He _______ the soccer ball every day. (5 letters)", answer: "PLAYS", row: 1, col: 1 },
      { number: 2, direction: 'across', clue: "Plural pronoun 'we/they' helper verb. (3 letters)", answer: "ARE", row: 3, col: 3 },
      { number: 3, direction: 'across', clue: "I _______ to bed at 10 PM. (2 letters)", answer: "GO", row: 5, col: 4 },
      { number: 4, direction: 'down', clue: "She _______ her homework at night. (4 letters)", answer: "DOES", row: 1, col: 5 },
      { number: 5, direction: 'down', clue: "He is _______ honest person. (2 letters)", answer: "AN", row: 1, col: 3 },
      { number: 6, direction: 'down', clue: "To take a seat. (3 letters)", answer: "SIT", row: 1, col: 1 }
    ]
  },
  {
    title: "Past & Memories #3",
    size: 8,
    clues: [
      { number: 1, direction: 'across', clue: "Yesterday I _______ a book. (4 letters)", answer: "READ", row: 2, col: 1 },
      { number: 2, direction: 'across', clue: "Past of 'run'. (3 letters)", answer: "RAN", row: 4, col: 3 },
      { number: 3, direction: 'across', clue: "Past of 'is/am'. (3 letters)", answer: "WAS", row: 6, col: 2 },
      { number: 4, direction: 'down', clue: "Irregular past of 'write'. (5 letters)", answer: "WROTE", row: 1, col: 4 },
      { number: 5, direction: 'down', clue: "Opposite of 'new'. (3 letters)", answer: "OLD", row: 2, col: 2 },
      { number: 6, direction: 'down', clue: "Opposite of 'wet'. (3 letters)", answer: "DRY", row: 4, col: 5 }
    ]
  },
  {
    title: "Future & Space #4",
    size: 8,
    clues: [
      { number: 1, direction: 'across', clue: "We _______ travel to Mars. (4 letters)", answer: "WILL", row: 1, col: 2 },
      { number: 2, direction: 'across', clue: "A planned future travel helper: 'by _______'. (3 letters)", answer: "AIR", row: 3, col: 2 },
      { number: 3, direction: 'across', clue: "Opposite of 'stop'. (2 letters)", answer: "GO", row: 5, col: 4 },
      { number: 4, direction: 'down', clue: "To get or receive: '___ a job'. (3 letters)", answer: "GET", row: 3, col: 4 },
      { number: 5, direction: 'down', clue: "Our star in the future sky. (3 letters)", answer: "SUN", row: 1, col: 5 },
      { number: 6, direction: 'down', clue: "Opposite of 'high'. (3 letters)", answer: "LOW", row: 1, col: 2 }
    ]
  },
  {
    title: "Opposites & Syns #5",
    size: 8,
    clues: [
      { number: 1, direction: 'across', clue: "Antonym of 'cold'. (3 letters)", answer: "HOT", row: 2, col: 2 },
      { number: 2, direction: 'across', clue: "Synonym of 'intelligent'. (5 letters)", answer: "SMART", row: 4, col: 1 },
      { number: 3, direction: 'across', clue: "Opposite of 'under'. (4 letters)", answer: "OVER", row: 6, col: 3 },
      { number: 4, direction: 'down', clue: "Antonym of 'sad'. (5 letters)", answer: "HAPPY", row: 1, col: 3 },
      { number: 5, direction: 'down', clue: "Opposite of 'bottom'. (3 letters)", answer: "TOP", row: 2, col: 4 },
      { number: 6, direction: 'down', clue: "Opposite of 'out'. (2 letters)", answer: "IN", row: 4, col: 1 }
    ]
  },
  {
    title: "Advanced Words #6",
    size: 8,
    clues: [
      { number: 1, direction: 'across', clue: "To study or gain knowledge. (5 letters)", answer: "LEARN", row: 1, col: 1 },
      { number: 2, direction: 'across', clue: "Scientific workplace: 'Mr. Zaafouri _______'. (4 letters)", answer: "LABS", row: 4, col: 3 },
      { number: 3, direction: 'across', clue: "Opposite of 'even'. (3 letters)", answer: "ODD", row: 6, col: 2 },
      { number: 4, direction: 'down', clue: "A difficult test or task. (4 letters)", answer: "EXAM", row: 1, col: 2 },
      { number: 5, direction: 'down', clue: "To guide or rule. (4 letters)", answer: "LEAD", row: 1, col: 1 },
      { number: 6, direction: 'down', clue: "Synonym of 'unhappy'. (3 letters)", answer: "SAD", row: 4, col: 6 }
    ]
  }
];
