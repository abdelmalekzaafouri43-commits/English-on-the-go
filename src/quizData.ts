export interface Question {
  id: string;
  q: string; // sentence with "___" for blank
  options: string[];
  answer: string; // correct answer string
  explanation: string;
}

export interface TenseTopic {
  id: string;
  name: string;
  category: 'Present' | 'Past' | 'Future';
  summary: string;
  formula: string;
  example: string;
  quizzes: {
    easy: Question[];
    medium: Question[];
    hard: Question[];
  };
}

export const QUIZ_TOPICS: TenseTopic[] = [
  {
    id: 'present_simple',
    name: 'Present Simple',
    category: 'Present',
    summary: 'Used for habits, general facts, immutable truths, and regular routines.',
    formula: 'Subject + Verb (s/es for 3rd person singular)',
    example: 'She works as a software designer in London.',
    quizzes: {
      easy: [
        {
          id: 'ps_e1',
          q: 'He ___ to the library every Wednesday afternoon.',
          options: ['go', 'goes', 'going', 'gone'],
          answer: 'goes',
          explanation: 'For singular third-person subjects (He/She/It) in the present simple, we append -s or -es to the base verb.'
        },
        {
          id: 'ps_e2',
          q: 'Water ___ at 100 degrees Celsius.',
          options: ['boil', 'boils', 'boiling', 'is boiling'],
          answer: 'boils',
          explanation: 'Scientific facts and general truths are always stated in the Present Simple tense.'
        },
        {
          id: 'ps_e3',
          q: 'They ___ usually eat dessert after dinner.',
          options: ["don't", "doesn't", "aren't", "not"],
          answer: "don't",
          explanation: 'We use "do not" (don\'t) for plural subjects (They/We/I/You) to formulate negative statements.'
        },
        {
          id: 'ps_e4',
          q: 'The sun ___ in the east.',
          options: ['rise', 'rises', 'rising', 'rose'],
          answer: 'rises',
          explanation: 'General natural truths or permanent facts require the Present Simple form "rises".'
        }
      ],
      medium: [
        {
          id: 'ps_m1',
          q: 'How often ___ your brother wash his car?',
          options: ['do', 'does', 'is', 'has'],
          answer: 'does',
          explanation: 'Questions with third-person singular subjects use the auxiliary verb "does".'
        },
        {
          id: 'ps_m2',
          q: 'The flight to Paris ___ at exactly 9:00 AM tomorrow.',
          options: ['leave', 'leaves', 'leaving', 'will be left'],
          answer: 'leaves',
          explanation: 'Scheduled future events (timetables, programs) are described using the Present Simple.'
        },
        {
          id: 'ps_m3',
          q: 'My father ___ any sugar in his coffee.',
          options: ['do not want', 'does not want', 'is not wanting', 'not wants'],
          answer: 'does not want',
          explanation: 'Stative verbs like "want" are not used in continuous forms; third-person negative uses "does not want".'
        },
        {
          id: 'ps_m4',
          q: 'Plants ___ sunlight to perform photosynthesis.',
          options: ['need', 'needs', 'needing', 'are needing'],
          answer: 'need',
          explanation: 'Plural subject "Plants" takes the base form "need" for regular general statements.'
        }
      ],
      hard: [
        {
          id: 'ps_h1',
          q: 'Seldom ___ she complain about the heavy workload.',
          options: ['does', 'do', 'is', 'has'],
          answer: 'does',
          explanation: 'When negative adverbs (Seldom, Rarely, Never) start a sentence, subject-auxiliary inversion is required.'
        },
        {
          id: 'ps_h2',
          q: 'Under no circumstances ___ the employee leave the premises without signing.',
          options: ['does', 'do', 'has', 'is'],
          answer: 'does',
          explanation: 'Negative inversion: "Under no circumstances does..." follows auxiliary inversion rules.'
        },
        {
          id: 'ps_h3',
          q: 'Here ___ the primary architect of the entire infrastructure.',
          options: ['come', 'comes', 'coming', 'came'],
          answer: 'comes',
          explanation: 'Inverted sentence structure starting with "Here/There" takes a simple singular verb "comes" matching "the primary architect".'
        }
      ]
    }
  },
  {
    id: 'present_continuous',
    name: 'Present Continuous',
    category: 'Present',
    summary: 'Used for actions happening right now, temporary situations, or definite future plans.',
    formula: 'Subject + am/is/are + Verb-ing',
    example: 'I am practicing my English speech right now.',
    quizzes: {
      easy: [
        {
          id: 'pc_e1',
          q: 'Please be quiet! The baby ___ in the nursery.',
          options: ['sleeps', 'is sleeping', 'sleeping', 'slept'],
          answer: 'is sleeping',
          explanation: 'Actions happening at the exact moment of speaking require the Present Continuous ("is sleeping").'
        },
        {
          id: 'pc_e2',
          q: 'We ___ studying grammar together this morning.',
          options: ['am', 'is', 'are', 'be'],
          answer: 'are',
          explanation: 'Plural subject "We" takes the auxiliary verb "are" followed by the -ing present participle.'
        },
        {
          id: 'pc_e3',
          q: '___ you listening to what the tutor is saying?',
          options: ['Are', 'Is', 'Do', 'Have'],
          answer: 'Are',
          explanation: 'Present continuous questions with subject "you" start with the auxiliary "Are".'
        },
        {
          id: 'pc_e4',
          q: 'I ___ reading a fascinating essay at the moment.',
          options: ['am', 'is', 'are', 'be'],
          answer: 'am',
          explanation: '"I" is always followed by "am" in present continuous structures.'
        }
      ],
      medium: [
        {
          id: 'pc_m1',
          q: 'My sister ___ in London for a couple of months before moving to Berlin.',
          options: ['lives', 'is living', 'lived', 'has lived'],
          answer: 'is living',
          explanation: 'Temporary situations or non-permanent living conditions are emphasized with the Present Continuous.'
        },
        {
          id: 'pc_m2',
          q: 'The tech company ___ a massive hiring phase this fiscal quarter.',
          options: ['undergoes', 'is undergoing', 'has undergone', 'undergo'],
          answer: 'is undergoing',
          explanation: 'Ongoing trends or developments current to this period are stated in Present Continuous.'
        },
        {
          id: 'pc_m3',
          q: 'Why ___ you always losing your house keys?',
          options: ['do', 'are', 'have', 'did'],
          answer: 'are',
          explanation: 'When expressing irritation or habits using "always", we use Present Continuous ("are you always losing").'
        },
        {
          id: 'pc_m4',
          q: 'We ___ dinner with the executive team tomorrow night.',
          options: ['have', 'are having', 'had', 'do have'],
          answer: 'are having',
          explanation: 'Definite personal plans or pre-arranged schedules in the near future utilize Present Continuous.'
        }
      ],
      hard: [
        {
          id: 'pc_h1',
          q: 'As we speak, global temperature averages ___ at an alarming rate.',
          options: ['rise', 'rises', 'are rising', 'have risen'],
          answer: 'are rising',
          explanation: 'Gradually changing or evolving situations are exclusively represented in Present Continuous ("are rising").'
        },
        {
          id: 'pc_h2',
          q: 'Although she loves sushi, today she ___ eating simple noodles.',
          options: ['prefers', 'prefer', 'is preferring', 'is preferring to'],
          answer: 'is preferring',
          explanation: 'Generally, stative verbs like "prefer" are in simple tenses, but temporary active preference at this moment can use "is preferring".'
        },
        {
          id: 'pc_h3',
          q: 'The chief operations director ___ currently overseeing the factory expansion.',
          options: ['is', 'are', 'does', 'has'],
          answer: 'is',
          explanation: '"The chief operations director" is singular, so it uses "is" in this passive/active context.'
        }
      ]
    }
  },
  {
    id: 'present_perfect',
    name: 'Present Perfect',
    category: 'Present',
    summary: 'Connects past experiences, finished actions with present results, or states starting in the past continuing now.',
    formula: 'Subject + have/has + Past Participle (V3)',
    example: 'I have visited Rome three times.',
    quizzes: {
      easy: [
        {
          id: 'pp_e1',
          q: 'I ___ already finished reading this novel.',
          options: ['have', 'has', 'had', 'am'],
          answer: 'have',
          explanation: 'First-person singular (I) takes the auxiliary verb "have" in the Present Perfect.'
        },
        {
          id: 'pp_e2',
          q: 'She has ___ in Tokyo for over six years.',
          options: ['live', 'lives', 'lived', 'living'],
          answer: 'lived',
          explanation: 'Present Perfect requires the past participle (V3) form of the main verb ("lived").'
        },
        {
          id: 'pp_e3',
          q: 'They have not ___ their decision yet.',
          options: ['make', 'made', 'making', 'makes'],
          answer: 'made',
          explanation: 'Irregular past participle of "make" is "made" in Present Perfect negative.'
        },
        {
          id: 'pp_e4',
          q: 'We have ___ each other since childhood.',
          options: ['know', 'knew', 'known', 'knowing'],
          answer: 'known',
          explanation: 'The past participle of the stative verb "know" is "known".'
        }
      ],
      medium: [
        {
          id: 'pp_m1',
          q: 'We haven\'t received any updates from the design team ___ last Tuesday.',
          options: ['for', 'since', 'during', 'ago'],
          answer: 'since',
          explanation: '"Since" is used to define a specific starting point in time, whereas "for" defines a duration.'
        },
        {
          id: 'pp_m2',
          q: '___ you ever eaten fresh sushi in Tokyo?',
          options: ['Have', 'Has', 'Did', 'Were'],
          answer: 'Have',
          explanation: 'To query life experiences up to now, use "Have you + V3".'
        },
        {
          id: 'pp_m3',
          q: 'She ___ her keys, so she cannot open the office door.',
          options: ['lost', 'has lost', 'had lost', 'loses'],
          answer: 'has lost',
          explanation: 'Use Present Perfect when a past action has a direct, immediate consequence in the present.'
        },
        {
          id: 'pp_m4',
          q: 'I have worked in this technology sector ___ twelve years.',
          options: ['since', 'for', 'ago', 'during'],
          answer: 'for',
          explanation: '"For" denotes the total duration of the period of time (twelve years).'
        }
      ],
      hard: [
        {
          id: 'pp_h1',
          q: 'This is the most complex grammar challenge I ___ encountered.',
          options: ['have ever', 'ever had', 'did ever', 'was ever'],
          answer: 'have ever',
          explanation: 'Superlative constructions ("the most complex...") are followed by the Present Perfect with "ever".'
        },
        {
          id: 'pp_h2',
          q: 'It is the first time that we ___ this analytical solution.',
          options: ['see', 'saw', 'have seen', 'had seen'],
          answer: 'have seen',
          explanation: 'Sentences beginning with "It is the first/second time..." use the Present Perfect.'
        },
        {
          id: 'pp_h3',
          q: 'No sooner ___ the team arrived than the presentation collapsed.',
          options: ['has', 'have', 'had', 'did'],
          answer: 'had',
          explanation: '"No sooner" requires inversion with Past Perfect, so we use "had" instead of Present Perfect in retrospective narratives.'
        }
      ]
    }
  },
  {
    id: 'past_simple',
    name: 'Past Simple',
    category: 'Past',
    summary: 'Describes finished actions that occurred at a specific point in the past.',
    formula: 'Subject + Past Form of Verb (V2)',
    example: 'We traveled to Spain last summer.',
    quizzes: {
      easy: [
        {
          id: 'pas_e1',
          q: 'They ___ a new house in the suburbs last year.',
          options: ['buy', 'bought', 'buying', 'buys'],
          answer: 'bought',
          explanation: 'The past simple of the irregular verb "buy" is "bought".'
        },
        {
          id: 'pas_e2',
          q: 'Did you ___ the beautiful sunset yesterday?',
          options: ['see', 'saw', 'seen', 'seeing'],
          answer: 'see',
          explanation: 'In past simple questions with "did", the main verb reverts to its base form ("see").'
        },
        {
          id: 'pas_e3',
          q: 'Last night, I ___ to bed at around 11 PM.',
          options: ['go', 'goes', 'went', 'gone'],
          answer: 'went',
          explanation: 'The irregular past simple of "go" is "went".'
        },
        {
          id: 'pas_e4',
          q: 'She ___ French during her primary school years.',
          options: ['study', 'studies', 'studied', 'studying'],
          answer: 'studied',
          explanation: 'Regular verb "study" becomes "studied" in simple past tense.'
        }
      ],
      medium: [
        {
          id: 'pas_m1',
          q: 'While I was cooking dinner, the telephone suddenly ___.',
          options: ['ring', 'rang', 'rung', 'was ringing'],
          answer: 'rang',
          explanation: 'A short, sudden past action interrupting a continuous background action is expressed in the Past Simple.'
        },
        {
          id: 'pas_m2',
          q: 'The local post office ___ closed ten minutes ago.',
          options: ['is', 'was', 'were', 'been'],
          answer: 'was',
          explanation: '"Post office" is singular, and "ago" denotes finished past time, requiring "was".'
        },
        {
          id: 'pas_m3',
          q: 'How long ago ___ they sign the legal contract?',
          options: ['did', 'do', 'have', 'had'],
          answer: 'did',
          explanation: '"How long ago" signals that a past simple question is required, which uses the auxiliary "did".'
        },
        {
          id: 'pas_m4',
          q: 'He ___ English for five years, but now he is focusing on Mandarin.',
          options: ['learned', 'has learned', 'learns', 'is learning'],
          answer: 'learned',
          explanation: 'Since the action is completely finished (he now studies Mandarin), use the Past Simple "learned".'
        }
      ],
      hard: [
        {
          id: 'pas_h1',
          q: 'If I ___ his mobile number, I would have texted him yesterday.',
          options: ['know', 'knew', 'had known', 'have known'],
          answer: 'had known',
          explanation: 'Third conditional sentences require Past Perfect ("had known") in the conditional clause.'
        },
        {
          id: 'pas_h2',
          q: 'It was highly crucial that she ___ on time for the hearing.',
          options: ['arrive', 'arrived', 'arrives', 'had arrived'],
          answer: 'arrive',
          explanation: 'The mandating structure "It was crucial that..." uses subjunctive mood, requiring the base verb form "arrive".'
        },
        {
          id: 'pas_h3',
          q: 'No sooner had they started the drive than it ___ to rain heavily.',
          options: ['begin', 'began', 'begun', 'was beginning'],
          answer: 'began',
          explanation: 'The correlative phrase "No sooner had... than..." links with a Past Simple statement ("began").'
        }
      ]
    }
  },
  {
    id: 'past_continuous',
    name: 'Past Continuous',
    category: 'Past',
    summary: 'Emphasizes actions that were in progress at a specific moment in the past.',
    formula: 'Subject + was/were + Verb-ing',
    example: 'I was sleeping when the alarm went off at dawn.',
    quizzes: {
      easy: [
        {
          id: 'pco_e1',
          q: 'At 8:00 PM yesterday, we ___ watching the soccer match.',
          options: ['was', 'were', 'are', 'been'],
          answer: 'were',
          explanation: 'Plural subject "we" takes the past auxiliary "were" in Past Continuous.'
        },
        {
          id: 'pco_e2',
          q: 'She ___ studying in her bedroom when the power cut happened.',
          options: ['was', 'were', 'is', 'did'],
          answer: 'was',
          explanation: 'Singular third-person "She" takes the auxiliary "was" in Past Continuous.'
        },
        {
          id: 'pco_e3',
          q: 'What ___ you doing when I called you last night?',
          options: ['was', 'were', 'did', 'are'],
          answer: 'were',
          explanation: 'Questions with plural/singular "you" use "were" ("What were you doing...").'
        },
        {
          id: 'pco_e4',
          q: 'It ___ raining cats and dogs when we set foot outside.',
          options: ['was', 'were', 'is', 'did'],
          answer: 'was',
          explanation: '"It" takes "was" to describe background weather conditions in Past Continuous.'
        }
      ],
      medium: [
        {
          id: 'pco_m1',
          q: 'While my colleagues ___ the quarterly report, I prepared the coffee.',
          options: ['discussed', 'were discussing', 'are discussing', 'had discussed'],
          answer: 'were discussing',
          explanation: 'Two actions occurring simultaneously in the past are both stated using the continuous structure.'
        },
        {
          id: 'pco_m2',
          q: 'The noise was unbearable because our neighbors ___ their home.',
          options: ['renovated', 'were renovating', 'are renovating', 'renovate'],
          answer: 'were renovating',
          explanation: 'Background ongoing reason in the past requires Past Continuous ("were renovating").'
        },
        {
          id: 'pco_m3',
          q: 'I ___ to call you, but I completely forgot.',
          options: ['mean', 'was meaning', 'have meant', 'am meaning'],
          answer: 'was meaning',
          explanation: 'Temporary past intention is expressed using Past Continuous "was meaning".'
        },
        {
          id: 'pco_m4',
          q: 'They ___ fast asleep when the security alarm rang.',
          options: ['was not sleeping', 'were not sleeping', 'did not sleep', 'aren\'t sleeping'],
          answer: 'were not sleeping',
          explanation: 'Use plural "were" to describe what they were not doing at that time.'
        }
      ],
      hard: [
        {
          id: 'pco_h1',
          q: 'Throughout the entire meeting, the CFO ___ doodles on his notepad.',
          options: ['drew', 'was drawing', 'had drawn', 'draws'],
          answer: 'was drawing',
          explanation: 'To express irritation or emphasize a continuous action over a duration, use Past Continuous.'
        },
        {
          id: 'pco_h2',
          q: 'Hardly ___ the presentation when the main projector failed.',
          options: ['was they giving', 'were they giving', 'had they given', 'did they give'],
          answer: 'were they giving',
          explanation: 'Inverted continuous structure: "Hardly were they giving..." represents action in progress when interrupted.'
        },
        {
          id: 'pco_h3',
          q: 'The firm ___ losing millions daily during that specific trade blockade.',
          options: ['was', 'were', 'is', 'had'],
          answer: 'was',
          explanation: '"The firm" acts as a collective singular noun here, requiring "was losing".'
        }
      ]
    }
  },
  {
    id: 'past_perfect',
    name: 'Past Perfect',
    category: 'Past',
    summary: 'Clarifies sequence by describing an action completed before another past event.',
    formula: 'Subject + had + Past Participle (V3)',
    example: 'The express train had left before we arrived at the terminal.',
    quizzes: {
      easy: [
        {
          id: 'ppf_e1',
          q: 'By the time she turned on the TV, the game ___ finished.',
          options: ['has', 'had', 'was', 'is'],
          answer: 'had',
          explanation: 'We use the Past Perfect "had" to show one past action finished before another past action.'
        },
        {
          id: 'ppf_e2',
          q: 'They ___ already eaten breakfast when we woke up.',
          options: ['have', 'had', 'was', 'did'],
          answer: 'had',
          explanation: 'Past Perfect structure: "had" + past participle "eaten".'
        },
        {
          id: 'ppf_e3',
          q: 'I realized that I ___ left my passport at home.',
          options: ['have', 'had', 'was', 'am'],
          answer: 'had',
          explanation: 'Leaving the passport occurred before the past realization, requiring Past Perfect.'
        },
        {
          id: 'ppf_e4',
          q: 'We had ___ each other for years before we became partners.',
          options: ['know', 'knew', 'known', 'knowing'],
          answer: 'known',
          explanation: 'Use past participle "known" after "had" in Past Perfect.'
        }
      ],
      medium: [
        {
          id: 'ppf_m1',
          q: 'She did not accept the job because she ___ already decided to move abroad.',
          options: ['has', 'had', 'was', 'is'],
          answer: 'had',
          explanation: 'The decision was made prior to rejecting the job offer.'
        },
        {
          id: 'ppf_m2',
          q: 'Had they ___ the system requirements before installing the database?',
          options: ['check', 'checked', 'checking', 'checks'],
          answer: 'checked',
          explanation: 'In interrogative Past Perfect, use auxiliary "Had" + past participle "checked".'
        },
        {
          id: 'ppf_m3',
          q: 'By 2024, the enterprise ___ expanded into five countries.',
          options: ['has', 'had', 'was', 'is'],
          answer: 'had',
          explanation: 'Actions completed by a specific point in the past are written in the Past Perfect.'
        },
        {
          id: 'ppf_m4',
          q: 'The manager was angry because the report ___ not been delivered.',
          options: ['has', 'had', 'was', 'did'],
          answer: 'had',
          explanation: 'Passive past perfect structure: "had not been delivered".'
        }
      ],
      hard: [
        {
          id: 'ppf_h1',
          q: 'Scarcely ___ the contract been signed when the lawsuit was filed.',
          options: ['has', 'have', 'had', 'was'],
          answer: 'had',
          explanation: 'Negative inversion starting with "Scarcely" requires Past Perfect "had" inversion.'
        },
        {
          id: 'ppf_h2',
          q: 'If we ___ more diligent, we would have avoided the critical bug.',
          options: ['were', 'had been', 'have been', 'would be'],
          answer: 'had been',
          explanation: 'The past counterfactual condition (Third Conditional) takes "had been".'
        },
        {
          id: 'ppf_h3',
          q: 'I wished I ___ the security credentials with the lead tester.',
          options: ['shared', 'had shared', 'have shared', 'share'],
          answer: 'had shared',
          explanation: 'Wishes about past regrets require the Past Perfect tense ("had shared").'
        }
      ]
    }
  },
  {
    id: 'future_simple',
    name: 'Future Simple',
    category: 'Future',
    summary: 'Used for instant promises, future predictions, spontaneous decisions, or formal plans.',
    formula: 'Subject + will + Base Verb',
    example: 'I will help you study this complicated lesson.',
    quizzes: {
      easy: [
        {
          id: 'fs_e1',
          q: 'I think it ___ snow tomorrow in the mountains.',
          options: ['will', 'shall', 'going to', 'is'],
          answer: 'will',
          explanation: 'Predictions about the future based on belief/opinion use "will".'
        },
        {
          id: 'fs_e2',
          q: 'Don\'t worry! I ___ carry those heavy boxes for you.',
          options: ['will', 'am', 'shall', 'did'],
          answer: 'will',
          explanation: 'Spontaneous offers of help or immediate decisions require "will".'
        },
        {
          id: 'fs_e3',
          q: 'They ___ arrive at the terminal at around 6 PM.',
          options: ['will', 'are', 'shall to', 'going'],
          answer: 'will',
          explanation: 'Standard future action is expressed with "will" plus the base verb "arrive".'
        },
        {
          id: 'fs_e4',
          q: '___ you please close the windows?',
          options: ['Will', 'Shall', 'Are', 'Do'],
          answer: 'Will',
          explanation: 'Polite requests or questions inquiring about future willingness start with "Will".'
        }
      ],
      medium: [
        {
          id: 'fs_m1',
          q: 'If it rains this evening, the outdoor match ___ cancelled.',
          options: ['will', 'will be', 'is', 'has'],
          answer: 'will be',
          explanation: 'First Conditional sentences take "will + base verb" (passive form is "will be cancelled").'
        },
        {
          id: 'fs_m2',
          q: 'The executive committee ___ announce the new strategy next week.',
          options: ['will', 'is going', 'shall to', 'does'],
          answer: 'will',
          explanation: 'Official formal future declarations are traditionally expressed using "will".'
        },
        {
          id: 'fs_m3',
          q: 'Perhaps we ___ see you at the software conference.',
          options: ['will', 'going to', 'are', 'do'],
          answer: 'will',
          explanation: 'Future possibility with qualifying adverbs like "Perhaps" or "Probably" takes "will".'
        },
        {
          id: 'fs_m4',
          q: 'I promise I ___ tell anyone your secret account password.',
          options: ['will', 'will not', 'am not', 'don\'t'],
          answer: 'will not',
          explanation: 'Negative future promises are expressed with "will not" (won\'t).'
        }
      ],
      hard: [
        {
          id: 'fs_h1',
          q: 'No sooner ___ the CEO declare the merger than stockholders will react.',
          options: ['will', 'shall', 'does', 'has'],
          answer: 'will',
          explanation: 'For future inverted narrative structures, use the future auxiliary "will".'
        },
        {
          id: 'fs_h2',
          q: 'By the time you wake up tomorrow, I ___ be flying over the Atlantic.',
          options: ['will', 'will have', 'shall', 'am'],
          answer: 'will',
          explanation: 'In time clauses, the main clause uses "will" (often simple or continuous) to denote a future event.'
        },
        {
          id: 'fs_h3',
          q: 'We shall see whether the government ___ fulfill its ambitious fiscal promise.',
          options: ['will', 'shall', 'is to', 'would'],
          answer: 'will',
          explanation: 'Standard indirect questions concerning future actions use "will".'
        }
      ]
    }
  },
  {
    id: 'present_perfect_continuous',
    name: 'Present Perfect Continuous',
    category: 'Present',
    summary: 'Emphasizes the duration or ongoing nature of an action that began in the past and continues to or affects the present.',
    formula: 'Subject + have/has been + Verb-ing',
    example: 'I have been studying English grammar since this morning.',
    quizzes: {
      easy: [
        {
          id: 'ppc_e1',
          q: 'She has ___ writing her first novel for six months.',
          options: ['be', 'been', 'being', 'was'],
          answer: 'been',
          explanation: 'The Present Perfect Continuous tense is formed using "has/have been" plus the present participle.'
        },
        {
          id: 'ppc_e2',
          q: 'We have been ___ for the bus for over half an hour.',
          options: ['wait', 'waited', 'waiting', 'waits'],
          answer: 'waiting',
          explanation: 'The main verb takes the present participle form (Verb-ing) after the auxiliary "have been".'
        }
      ],
      medium: [
        {
          id: 'ppc_m1',
          q: 'How long ___ you been learning how to code software?',
          options: ['have', 'has', 'did', 'do'],
          answer: 'have',
          explanation: 'We use the auxiliary "have" with plural and second-person singular "you" in this tense.'
        },
        {
          id: 'ppc_m2',
          q: 'The tech company ___ experiencing massive layout changes recently.',
          options: ['has been', 'have been', 'is being', 'was been'],
          answer: 'has been',
          explanation: 'Singular third-person subject "The company" takes "has been" for continuous actions starting in the past and continuing now.'
        }
      ],
      hard: [
        {
          id: 'ppc_h1',
          q: 'Lately, the research team ___ tirelessly on the quantum encryption formula.',
          options: ['has been working', 'have been working', 'is working', 'has worked'],
          answer: 'has been working',
          explanation: 'The collective noun phrase "the research team" acts as a singular subject here, requiring "has been working" to emphasize recent ongoing effort.'
        }
      ]
    }
  },
  {
    id: 'future_continuous',
    name: 'Future Continuous',
    category: 'Future',
    summary: 'Used to describe actions that will be in progress at a specific point or duration in the future.',
    formula: 'Subject + will be + Verb-ing',
    example: 'At this time tomorrow, we will be flying to Tokyo.',
    quizzes: {
      easy: [
        {
          id: 'fco_e1',
          q: 'They will ___ sleeping soundly when you arrive late tonight.',
          options: ['be', 'been', 'being', 'have'],
          answer: 'be',
          explanation: 'The Future Continuous is formed with "will be" followed by the present participle (-ing).'
        },
        {
          id: 'fco_e2',
          q: 'This time tomorrow, I will be ___ my final English exam.',
          options: ['take', 'took', 'taken', 'taking'],
          answer: 'taking',
          explanation: 'Requires the -ing participle form "taking" to represent a continuous action in progress in the future.'
        }
      ],
      medium: [
        {
          id: 'fco_m1',
          q: 'I ___ working in the design department during your vacation next month.',
          options: ['will be', 'will been', 'am being', 'would be'],
          answer: 'will be',
          explanation: 'The auxiliary sequence "will be" denotes ongoing activities in future target periods.'
        },
        {
          id: 'fco_m2',
          q: 'Will you ___ using the main workspace during the morning session?',
          options: ['be', 'been', 'have', 'is'],
          answer: 'be',
          explanation: 'Interrogative layout structure: "Will" + Subject + "be" + Verb-ing.'
        }
      ],
      hard: [
        {
          id: 'fco_h1',
          q: 'By the time the new legislation takes effect, we ___ adapting to the revised tax protocols.',
          options: ['will be', 'shall be', 'would be', 'will have been'],
          answer: 'will be',
          explanation: 'To express an ongoing state or activity at a specific point of reference in the future, Future Continuous "will be" is used.'
        }
      ]
    }
  },
  {
    id: 'future_perfect',
    name: 'Future Perfect',
    category: 'Future',
    summary: 'Describes an action that will be completed or finished prior to a specific event or point in the future.',
    formula: 'Subject + will have + Past Participle (V3)',
    example: 'By next year, I will have graduated from the language academy.',
    quizzes: {
      easy: [
        {
          id: 'fpf_e1',
          q: 'By 9:00 PM, she will have ___ all her assignments.',
          options: ['finish', 'finished', 'finishing', 'finishes'],
          answer: 'finished',
          explanation: 'The Future Perfect uses the auxiliary layout "will have" plus the past participle (V3) form "finished".'
        },
        {
          id: 'fpf_e2',
          q: 'They will ___ completed the entire construction work by next Monday.',
          options: ['have', 'has', 'had', 'been'],
          answer: 'have',
          explanation: 'We always use the base form "have" with "will" in Future Perfect structures.'
        }
      ],
      medium: [
        {
          id: 'fpf_m1',
          q: 'By the time they arrive at the cinema, the movie ___ already started.',
          options: ['will have', 'will has', 'would have', 'has'],
          answer: 'will have',
          explanation: 'Use Future Perfect "will have" to state an action completed before a specific future threshold.'
        },
        {
          id: 'fpf_m2',
          q: 'In two months\' time, I will have ___ here for five full years.',
          options: ['work', 'worked', 'working', 'been worked'],
          answer: 'worked',
          explanation: 'Past participle form of the regular verb "work" is "worked" in Future Perfect.'
        }
      ],
      hard: [
        {
          id: 'fpf_h1',
          q: 'Under no circumstances ___ the board have reached a consensus before tomorrow\'s emergency session.',
          options: ['will', 'shall', 'would', 'does'],
          answer: 'will',
          explanation: 'Inverted Future Perfect structure starts with a negative adverbial phrase + auxiliary "will" + subject + have + past participle.'
        }
      ]
    }
  },
  {
    id: 'past_perfect_continuous',
    name: 'Past Perfect Continuous',
    category: 'Past',
    summary: 'Describes an action that was ongoing in the past up until another past event or moment in time.',
    formula: 'Subject + had been + Verb-ing',
    example: 'They had been hiking for three hours before they realized they were lost.',
    quizzes: {
      easy: [
        {
          id: 'ppc_past_e1',
          q: 'He was out of breath because he had ___ running.',
          options: ['be', 'been', 'being', 'was'],
          answer: 'been',
          explanation: 'Past Perfect Continuous requires "had been" + present participle (-ing).'
        },
        {
          id: 'ppc_past_e2',
          q: 'We had been ___ for two hours when the train finally arrived.',
          options: ['wait', 'waited', 'waiting', 'waits'],
          answer: 'waiting',
          explanation: 'The main verb takes the -ing form after "had been" to show ongoing duration in the past.'
        }
      ],
      medium: [
        {
          id: 'ppc_past_m1',
          q: 'How long had she ___ studying before she took the certification exam?',
          options: ['been', 'being', 'be', 'was'],
          answer: 'been',
          explanation: 'The auxiliary "had ... been" is required in question form for Past Perfect Continuous.'
        },
        {
          id: 'ppc_past_m2',
          q: 'The ground was soaked because it ___ raining all night.',
          options: ['had been', 'has been', 'was been', 'is being'],
          answer: 'had been',
          explanation: '"Had been raining" explains the past condition (the ground was wet).'
        }
      ],
      hard: [
        {
          id: 'ppc_past_h1',
          q: 'Had they not ___ working diligently, the project would have collapsed before release.',
          options: ['been', 'being', 'be', 'had'],
          answer: 'been',
          explanation: 'Inverted negative condition in Past Perfect Continuous requires "Had they not been working".'
        }
      ]
    }
  },
  {
    id: 'future_perfect_continuous',
    name: 'Future Perfect Continuous',
    category: 'Future',
    summary: 'Emphasizes the continuous duration of an action up to a specific point or deadline in the future.',
    formula: 'Subject + will have been + Verb-ing',
    example: 'By next November, she will have been teaching at this university for a decade.',
    quizzes: {
      easy: [
        {
          id: 'fpc_e1',
          q: 'By next month, I will have ___ living here for two years.',
          options: ['been', 'being', 'be', 'had'],
          answer: 'been',
          explanation: 'Future Perfect Continuous uses "will have been" + Verb-ing.'
        },
        {
          id: 'fpc_e2',
          q: 'She will have been ___ for six hours by the time her flight lands.',
          options: ['fly', 'flew', 'flying', 'flown'],
          answer: 'flying',
          explanation: 'Takes the present participle -ing form "flying" after "will have been".'
        }
      ],
      medium: [
        {
          id: 'fpc_m1',
          q: 'By 2028, the engineer ___ working on renewable energy solutions for a full decade.',
          options: ['will have been', 'will has been', 'would had been', 'is having been'],
          answer: 'will have been',
          explanation: 'The standard auxiliary string for Future Perfect Continuous is "will have been".'
        },
        {
          id: 'fpc_m2',
          q: 'How long will you have been ___ at the software firm by the end of this quarter?',
          options: ['work', 'working', 'worked', 'been working'],
          answer: 'working',
          explanation: 'Requires base verb + ing ("working") to complete the Future Perfect Continuous form.'
        }
      ],
      hard: [
        {
          id: 'fpc_h1',
          q: 'By the time the symposium commences, our delegates will have been ___ research findings for over two years.',
          options: ['compiling', 'compiled', 'compile', 'having compiled'],
          answer: 'compiling',
          explanation: 'The duration up to a future point ("By the time...") uses "will have been compiling".'
        }
      ]
    }
  }
];

export const getQuickQuiz3Questions = (topic: TenseTopic): Question[] => {
  return getQuickQuizQuestions(topic, 3);
};

export const getQuickQuizQuestions = (
  topic: TenseTopic,
  count: number = 3,
  difficultyFilter?: 'easy' | 'medium' | 'hard' | 'all'
): Question[] => {
  const easy = topic.quizzes.easy || [];
  const medium = topic.quizzes.medium || [];
  const hard = topic.quizzes.hard || [];

  let pool: Question[] = [];

  if (difficultyFilter === 'easy') {
    pool = [...easy];
  } else if (difficultyFilter === 'medium') {
    pool = [...medium];
  } else if (difficultyFilter === 'hard') {
    pool = [...hard];
  } else {
    // Balanced selection
    pool = [...easy, ...medium, ...hard];
  }

  // If pool is empty or too small, combine everything
  if (pool.length === 0) {
    pool = [...easy, ...medium, ...hard];
  }

  // Shuffle pool (Fisher-Yates)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Deduplicate by question id
  const uniqueQuestions: Question[] = [];
  const seenIds = new Set<string>();

  for (const q of shuffled) {
    if (!seenIds.has(q.id)) {
      seenIds.add(q.id);
      uniqueQuestions.push(q);
      if (uniqueQuestions.length === count) break;
    }
  }

  // If still fewer than count, take whatever is available
  return uniqueQuestions.slice(0, count);
};

