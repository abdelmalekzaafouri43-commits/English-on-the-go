export interface ScenarioMessage {
  id: string;
  sender: 'Tutor' | 'User';
  text: string;
  pronunciation?: string;
  translation?: string;
  options?: string[]; // Multiple choice response options for interactive builders
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  category: 'Business' | 'Travel' | 'Social';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  usefulVocabulary: { word: string; meaning: string }[];
  dialogue: ScenarioMessage[];
  videoEmbed?: string;
  videoTitle?: string;
  nativeSpeaker?: string;
  videoSummary?: string;
  keyVideoPhrases?: string[];
}

export const REAL_SCENARIOS: Scenario[] = [
  {
    id: 'sc_coffee',
    title: 'Ordering Coffee',
    description: 'Learn how to order your favorite coffee and make special customization requests at a busy cafe.',
    category: 'Social',
    difficulty: 'Beginner',
    videoEmbed: 'https://www.youtube.com/embed/5U_7Kj09Cig',
    videoTitle: 'Ordering at a Cafe: Real Native Speaker Dialogue',
    nativeSpeaker: 'American English (Natural Conversational Pace)',
    videoSummary: 'Listen to a natural dialogue between a customer and a barista covering cup sizes, milk alternatives, flavored syrups, and payment courtesies.',
    keyVideoPhrases: [
      'Could I please get a medium latte with oat milk?',
      'Is there an extra charge for flavored syrup?',
      'To-go, please. Could you leave some room for cream?',
      'Keep the change, have a wonderful day!'
    ],
    usefulVocabulary: [
      { word: 'Skim milk', meaning: 'Milk from which the cream has been removed.' },
      { word: 'To-go', meaning: 'For takeout rather than eating in the establishment.' },
      { word: 'Double shot', meaning: 'Two servings of espresso in one cup.' },
      { word: 'Room for cream', meaning: 'Leaving space at the top of the cup to pour in milk or cream.' }
    ],
    dialogue: [
      {
        id: 'msg_1',
        sender: 'Tutor',
        text: 'Hello there! What can I get started for you today?',
        pronunciation: 'həˈloʊ ðɛr! wʌt kæn aɪ gɛt ˈstɑrtəd fɔr ju təˈdeɪ?',
        options: [
          'Hi! I would like a medium latte with skim milk, please.',
          'Give me coffee now.',
          'I want some tea.'
        ]
      },
      {
        id: 'msg_2',
        sender: 'User',
        text: 'Hi! I would like a medium latte with skim milk, please.',
      },
      {
        id: 'msg_3',
        sender: 'Tutor',
        text: 'Sure thing! Any syrup or extra espresso shots in that latte?',
        pronunciation: 'ʃʊr θɪŋ! ˈɛni ˈsɪrəp ɔr ˈɛkstrə ɛˈsprɛsoʊ ʃɑts ɪn ðæt ˈlɑteɪ?',
        options: [
          'Just a single shot, and no syrup, thank you.',
          'Yes, put everything inside.',
          'No, thank you.'
        ]
      },
      {
        id: 'msg_4',
        sender: 'User',
        text: 'Just a single shot, and no syrup, thank you.'
      },
      {
        id: 'msg_5',
        sender: 'Tutor',
        text: 'Perfect. Will that be for here or to-go?',
        pronunciation: 'ˈpɜrfɪkt. wɪl ðæt bi fɔr hɪr ɔr tə-goʊ?',
        options: [
          'To-go, please. How much is it?',
          'I stay here.',
          'To-go.'
        ]
      },
      {
        id: 'msg_6',
        sender: 'User',
        text: 'To-go, please. How much is it?'
      },
      {
        id: 'msg_7',
        sender: 'Tutor',
        text: 'That comes to $4.50. You can swipe or tap your card whenever you are ready!',
        pronunciation: 'ðæt kʌmz tu $4.50. ju kæn swaɪp ɔr tæp jɔr kɑrd wɛnˈɛvər ju ɑr ˈrɛdi!'
      }
    ]
  },
  {
    id: 'sc_interview',
    title: 'A Job Interview',
    description: 'Practice discussing your technical qualifications, previous projects, and salary expectations with a recruiter.',
    category: 'Business',
    difficulty: 'Intermediate',
    videoEmbed: 'https://www.youtube.com/embed/1mHjMNZZvFo',
    videoTitle: 'Job Interview Mastery: Native Fluency & Professional Phrasing',
    nativeSpeaker: 'Professional North American Accent',
    videoSummary: 'Watch native speakers model high-impact responses to behavioral interview questions, leadership scenarios, and team conflict resolution.',
    keyVideoPhrases: [
      'In my previous role, I took the initiative to...',
      'I pride myself on cross-functional collaboration.',
      'One major obstacle we overcame was...',
      'Could you elaborate on the team structure and growth opportunities?'
    ],
    usefulVocabulary: [
      { word: 'Collaborative', meaning: 'Produced or conducted by two or more parties working together.' },
      { word: 'Deadline-driven', meaning: 'Motivated by completing work within a specific schedule.' },
      { word: 'Track record', meaning: 'The past achievements or performance of a person or organization.' },
      { word: 'Spearhead', meaning: 'To lead or initiate a campaign, project, or movement.' }
    ],
    dialogue: [
      {
        id: 'inv_1',
        sender: 'Tutor',
        text: 'Welcome! To start, could you please tell me about a challenging project you handled in your previous role?',
        pronunciation: 'ˈwɛlkəm! tu stɑrt, kʊd ju pliːz tɛl miː əˈbaʊt ə ˈʧælɪnʤɪŋ ˈprɒʤɛkt ju ˈhændld ɪn jɔː ˈpriːviəs rəʊl?',
        options: [
          'In my last job, I led the migration of our main dashboard database which reduced latency by 40%.',
          'I did many normal projects.',
          'I worked in a team.'
        ]
      },
      {
        id: 'inv_2',
        sender: 'User',
        text: 'In my last job, I led the migration of our main dashboard database which reduced latency by 40%.'
      },
      {
        id: 'inv_3',
        sender: 'Tutor',
        text: 'Impressive track record! How did you manage conflicting priorities within your engineering team during that time?',
        pronunciation: 'ɪmˈprɛsɪv træk ˈrɛkɔːd! haʊ dɪd ju ˈmænɪʤ kənˈflɪktɪŋ praɪˈɒrɪtiz wɪˈðɪn jɔː ˌɛnʤɪˈnɪərɪŋ tiːm ˈdjʊərɪŋ ðæt taɪm?',
        options: [
          'I prioritized tasks based on customer impact, established open communication lines, and held daily alignments.',
          'I just did what the manager told me to do.',
          'I ignored the conflicts.'
        ]
      },
      {
        id: 'inv_4',
        sender: 'User',
        text: 'I prioritized tasks based on customer impact, established open communication lines, and held daily alignments.'
      },
      {
        id: 'inv_5',
        sender: 'Tutor',
        text: 'Excellent structured approach. That is exactly what we look for. Do you have any questions for me about the team structure?',
        pronunciation: 'ˈɛksələnt ˈstrʌkʧəd əˈprəʊʧ. ðæt ɪz ɪgˈzæktli wɒt wiː lʊk fɔː. duː ju hæv ˈɛni ˈkwɛsʧənz fɔː miː əˈbaʊt ðə tiːm ˈstrʌkʧə?'
      }
    ]
  },
  {
    id: 'sc_bank',
    title: 'At the Bank',
    description: 'Practice opening a bank account, setting up a savings plan, and inquiring about transaction limits.',
    category: 'Business',
    difficulty: 'Intermediate',
    videoEmbed: 'https://www.youtube.com/embed/pPndT7Y7LMo',
    videoTitle: 'Daily Banking in English: Transactions & Financial Inquiries',
    nativeSpeaker: 'British English (RP / Standard Oxford Accent)',
    videoSummary: 'Explore essential banking dialogues covering debit vs credit cards, wire transfers, monthly maintenance fees, and online verification.',
    keyVideoPhrases: [
      'I would like to open a checking account with direct deposit.',
      'What are the monthly maintenance fee requirements?',
      'How long does an international wire transfer take to clear?',
      'Could you help me set up two-factor authentication for mobile banking?'
    ],
    usefulVocabulary: [
      { word: 'Checking account', meaning: 'An active daily transactional account for debit withdrawals and cards.' },
      { word: 'Interest rate', meaning: 'The proportion of a loan or savings balance charged or earned over time.' },
      { word: 'Routing number', meaning: 'A nine-digit code identifying a specific financial institution in banking transfers.' },
      { word: 'Direct deposit', meaning: 'Electronic transfer of a payment directly into a recipient account.' }
    ],
    dialogue: [
      {
        id: 'bk_1',
        sender: 'Tutor',
        text: 'Welcome to ZLabs Trust Bank. How can I assist you with your accounts today?',
        pronunciation: 'ˈwɛlkəm tu z-læbz trʌst bæŋk. haʊ kæn aɪ əˈsɪst ju wɪð jɔr əˈkaʊnts təˈdeɪ?',
        options: [
          'Hello! I would like to open a checking account and set up a direct deposit.',
          'I want some cash.',
          'Where is the money?'
        ]
      },
      {
        id: 'bk_2',
        sender: 'User',
        text: 'Hello! I would like to open a checking account and set up a direct deposit.'
      },
      {
        id: 'bk_3',
        sender: 'Tutor',
        text: 'Wonderful! I can certainly help with that. Will this be an individual account or a joint account with someone else?',
        pronunciation: 'ˈwʌndərfʊl! aɪ kæn ˈsɜrtənli hɛlp wɪð ðæt. wɪl ðɪs bi ən ˌɪndɪˈvɪʤuəl əˈkaʊnt ɔr ə ʤɔɪnt əˈkaʊnt wɪð ˈsʌmwʌn ɛls?',
        options: [
          'Just an individual account for me, please.',
          'I want it joint with my business associate.',
          'I don\'t know.'
        ]
      },
      {
        id: 'bk_4',
        sender: 'User',
        text: 'Just an individual account for me, please.'
      },
      {
        id: 'bk_5',
        sender: 'Tutor',
        text: 'Got it. I will just need your government ID and a proof of address to finalize the setup. Do you have those on you?',
        pronunciation: 'gɑt ɪt. aɪ wɪl ʤʌst niːd jɔː ˈgʌvnmənt aɪ-diː ænd ə pruːf ɒv əˈdrɛs tuː ˈfaɪnəlaɪz ðə ˈsɛtʌp. duː juː hæv ðəʊz ɒn juː?'
      }
    ]
  },
  {
    id: 'sc_airport',
    title: 'At the Airport',
    description: 'Navigate checking your bags, selecting a window seat, and passing security screening check points.',
    category: 'Travel',
    difficulty: 'Beginner',
    videoEmbed: 'https://www.youtube.com/embed/K8_YvBvE50g',
    videoTitle: 'Airport & Travel English: Check-In, Customs & Flight Announcements',
    nativeSpeaker: 'British English (Clear International Pronunciation)',
    videoSummary: 'Follow realistic interactions at ticket counters, baggage drop zones, security scanners, and airline boarding gates.',
    keyVideoPhrases: [
      'Is there an aisle or window seat available near the front?',
      'I have one checked bag and one carry-on backpack.',
      'What time does boarding commence for group 3?',
      'Has there been any gate change announced for flight 412?'
    ],
    usefulVocabulary: [
      { word: 'Boarding pass', meaning: 'The official document giving authorization to board a commercial aircraft.' },
      { word: 'Carry-on', meaning: 'Small luggage or bags that passengers are allowed to keep in the cabin.' },
      { word: 'Gate change', meaning: 'A revision in the specific location where passengers board their flight.' },
      { word: 'Layover', meaning: 'A period of waiting between connecting flights.' }
    ],
    dialogue: [
      {
        id: 'ap_1',
        sender: 'Tutor',
        text: 'Good morning! Please show me your passport and booking confirmation.',
        pronunciation: 'gʊd ˈmɔrnɪŋ! pliːz ʃəʊ miː jɔː ˈpɑːspɔːt ænd ˈbʊkɪŋ ˌkɒnfəˈmeɪʃən.',
        options: [
          'Here is my passport. I would also like to request a window seat if possible.',
          'Take this paper.',
          'Where is the gate?'
        ]
      },
      {
        id: 'ap_2',
        sender: 'User',
        text: 'Here is my passport. I would also like to request a window seat if possible.'
      },
      {
        id: 'ap_3',
        sender: 'Tutor',
        text: 'You are in luck! There is a window seat available in row 15. Are you checking any bags today?',
        pronunciation: 'ju ɑr ɪn lʌk! ðɛr ɪz ə ˈwɪndoʊ siːt əˈveɪləbəl ɪn roʊ fɪfˈtiːn. ɑr ju ˈʧɛkɪŋ ˈɛni bægz təˈdeɪ?',
        options: [
          'Yes, just this one suitcase, and I have one carry-on bag.',
          'No bags, just my backpack.',
          'Yes, many bags.'
        ]
      },
      {
        id: 'ap_4',
        sender: 'User',
        text: 'Yes, just this one suitcase, and I have one carry-on bag.'
      },
      {
        id: 'ap_5',
        sender: 'Tutor',
        text: 'Perfect. Place it on the scale. Here is your boarding pass. Your gate is B22, boarding starts at 2:30 PM.',
        pronunciation: 'ˈpɜːfɪkt. pleɪs ɪt ɒn ðə skeɪl. hɪər ɪz jɔː ˈbɔːdɪŋ pɑːs. jɔː geɪt ɪz biː-twɛnti-tuː, ˈbɔːdɪŋ stɑːts æt tuː-θɜːti piː-ɛm.'
      }
    ]
  },
  {
    id: 'sc_clothes_shop',
    title: 'At the Clothes Shop',
    description: 'Learn to ask for different sizes, inquire about active sales, and find the fitting rooms.',
    category: 'Social',
    difficulty: 'Beginner',
    videoEmbed: 'https://www.youtube.com/embed/S2C1e_F3r18',
    videoTitle: 'Shopping for Clothes: Native Phrases for Sizing & Sales',
    nativeSpeaker: 'Canadian English (Standard Natural Delivery)',
    videoSummary: 'Learn authentic expressions for finding sizes, inquiring about price discounts, trying on apparel in fitting rooms, and processing returns.',
    keyVideoPhrases: [
      'Do you have this jacket in a size medium or large?',
      'Where are the fitting rooms situated in the store?',
      'Does this qualify for the seasonal promotional discount?',
      'Can I return this within thirty days if the fit is not right?'
    ],
    usefulVocabulary: [
      { word: 'Fitting room', meaning: 'The private cubicle where clients try on garments before buying.' },
      { word: 'Clearance rack', meaning: 'A physical clothing display stand featuring highly discounted end-of-season items.' },
      { word: 'Alteration', meaning: 'Tailoring modifications made to adjust the length or fit of a garment.' },
      { word: 'Store credit', meaning: 'A credit note issued by a store allowing purchases equal to the returned item.' }
    ],
    dialogue: [
      {
        id: 'cs_1',
        sender: 'Tutor',
        text: 'Hi there! Are you looking for anything specific, or just browsing around?',
        pronunciation: 'haɪ ðɛr! ɑr ju ˈlʊkɪŋ fɔr ˈɛniθɪŋ spəˈsɪfɪk, ɔr ʤʌst ˈbraʊzɪŋ əˈraʊnd?',
        options: [
          'Hello! I really like this jacket. Do you have it in a size medium?',
          'I want a shirt.',
          'Where are the cheap items?'
        ]
      },
      {
        id: 'cs_2',
        sender: 'User',
        text: 'Hello! I really like this jacket. Do you have it in a size medium?'
      },
      {
        id: 'cs_3',
        sender: 'Tutor',
        text: 'Let me check... Yes, we have one medium left in stock! Would you like to try it on?',
        pronunciation: 'lɛt mi ʧɛk... jɛs, wi hæv wʌn ˈmiːdiəm lɛft ɪn stɒk! wʊd ju laɪk tu traɪ ɪt ɒn?',
        options: [
          'Yes, please! Where are the fitting rooms located?',
          'No, I will just buy it directly.',
          'Where is the register?'
        ]
      },
      {
        id: 'cs_4',
        sender: 'User',
        text: 'Yes, please! Where are the fitting rooms located?'
      },
      {
        id: 'cs_5',
        sender: 'Tutor',
        text: 'They are right in the back, next to the clearance rack. Let me know if you need anything else!',
        pronunciation: 'ðeɪ ɑː raɪt ɪn ðə bæk, nɛkst tuː ðə ˈklɪərəns ræk. lɛt miː nəʊ ɪf juː niːd ˈɛniθɪŋ ɛls!'
      }
    ]
  },
  {
    id: 'sc_doctor',
    title: "At the Doctor's Office",
    description: 'Learn how to outline medical symptoms, discuss prescriptions, and understand physical checkup results.',
    category: 'Social',
    difficulty: 'Intermediate',
    videoEmbed: 'https://www.youtube.com/embed/jZ_vJ3NqBaw',
    videoTitle: 'Medical English: Describing Symptoms & Doctor Consultations',
    nativeSpeaker: 'American English (Medical Communication Specialist)',
    videoSummary: 'Understand natural ways to describe bodily discomfort, frequency of pains, prescription dosages, and allergy precautions with medical professionals.',
    keyVideoPhrases: [
      'I have had a lingering sore throat and mild fever since Tuesday.',
      'Are there any common side effects associated with this medication?',
      'Should I take this antibiotic with food or on an empty stomach?',
      'How soon should I schedule a follow-up appointment if symptoms persist?'
    ],
    usefulVocabulary: [
      { word: 'Symptom', meaning: 'A physical or mental feature indicating a condition of disease or illness.' },
      { word: 'Prescription', meaning: 'An official medical instruction written by a doctor authorizing medicine.' },
      { word: 'Diagnosis', meaning: 'The official identification of the nature of an illness by examination.' },
      { word: 'Dosage', meaning: 'The exact amount of a medicine or drug that should be taken.' }
    ],
    dialogue: [
      {
        id: 'dr_1',
        sender: 'Tutor',
        text: 'Good afternoon. Please sit down. What seems to be the problem today?',
        pronunciation: 'gʊd ˌæftərˈnuːn. pliːz sɪt daʊn. wʌt siːmz tuː biː ðə ˈprɒbləm təˈdeɪ?',
        options: [
          'I have been having a severe dry cough and a sore throat for three days.',
          'My stomach hurts.',
          'Give me some pills.'
        ]
      },
      {
        id: 'dr_2',
        sender: 'User',
        text: 'I have been having a severe dry cough and a sore throat for three days.'
      },
      {
        id: 'dr_3',
        sender: 'Tutor',
        text: 'I see. Have you also run a fever, or experienced any body aches or fatigue recently?',
        pronunciation: 'aɪ siː. hæv juː ˈɔːlsəʊ rʌn ə ˈfiːvə, ɔːr ɪksˈpɪərɪənst ˈɛni ˈbɒdi eɪks ɔː fəˈtiːg ˈriːsntli?',
        options: [
          'Yes, a mild fever started yesterday, and I feel quite exhausted.',
          'No, nothing else.',
          'I have an active headache too.'
        ]
      },
      {
        id: 'dr_4',
        sender: 'User',
        text: 'Yes, a mild fever started yesterday, and I feel quite exhausted.'
      },
      {
        id: 'dr_5',
        sender: 'Tutor',
        text: 'Understood. I will listen to your lungs first. Let\'s write you a prescription for some cough syrup. Rest up!',
        pronunciation: 'ˌʌndəˈstʊd. aɪ wɪl ˈlɪsn tuː jɔː lʌŋz fɜːst. lɛts raɪt juː ə prɪsˈkrɪpʃən fɔː sʌm kɒf ˈsɪrəp. rɛst ʌp!'
      }
    ]
  }
];
