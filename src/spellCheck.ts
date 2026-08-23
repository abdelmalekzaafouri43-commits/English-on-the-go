// Comprehensive dictionary of common English misspellings, typos, and transposed words
export const COMMON_MISSPELLINGS: Record<string, string> = {
  // Transposed & silent letter typos
  'recieve': 'receive',
  'recieved': 'received',
  'recieving': 'receiving',
  'beleive': 'believe',
  'belive': 'believe',
  'beleiving': 'believing',
  'freind': 'friend',
  'freinds': 'friends',
  'peice': 'piece',
  'peices': 'pieces',
  'wierd': 'weird',
  'neice': 'niece',
  'seize': 'seize',
  'sieze': 'seize',
  'yeild': 'yield',
  'foriegn': 'foreign',
  
  // Double letter confusions
  'seperate': 'separate',
  'seperated': 'separated',
  'seperately': 'separately',
  'definately': 'definitely',
  'definate': 'definite',
  'definitly': 'definitely',
  'accomodate': 'accommodate',
  'acommodate': 'accommodate',
  'accomodation': 'accommodation',
  'embarass': 'embarrass',
  'embarassed': 'embarrassed',
  'embarassing': 'embarrassing',
  'occured': 'occurred',
  'occurance': 'occurrence',
  'occurances': 'occurrences',
  'neccessary': 'necessary',
  'necesary': 'necessary',
  'unneccessary': 'unnecessary',
  'dissapoint': 'disappoint',
  'dissappointed': 'disappointed',
  'dissappointing': 'disappointing',
  'mispell': 'misspell',
  'mispelled': 'misspelled',
  'mispelling': 'misspelling',
  'untill': 'until',
  'tommorrow': 'tomorrow',
  'tomorow': 'tomorrow',
  'succesful': 'successful',
  'succes': 'success',
  'succesfully': 'successfully',
  'consistant': 'consistent',
  'consistancy': 'consistency',
  'maintainance': 'maintenance',
  'begining': 'beginning',
  'appologize': 'apologize',
  'interupt': 'interrupt',
  'paralel': 'parallel',
  'parrallel': 'parallel',
  'posession': 'possession',
  'prefered': 'preferred',
  'milennium': 'millennium',
  'millenium': 'millennium',
  'reccomend': 'recommend',
  'recomended': 'recommended',
  'reccomended': 'recommended',
  'reccomendation': 'recommendation',

  // Common fast typing slip-ups
  'teh': 'the',
  'becuase': 'because',
  'beacuse': 'because',
  'wich': 'which',
  'thier': 'their',
  'waht': 'what',
  'taht': 'that',
  'woudl': 'would',
  'couldnt': "couldn't",
  'didnt': "didn't",
  'dont': "don't",
  'doesnt': "doesn't",
  'isnt': "isn't",
  'arent': "aren't",
  'wasnt': "wasn't",
  'werent': "weren't",
  'wont': "won't",
  'cant': "can't",
  'havent': "haven't",
  'hasnt': "hasn't",
  'alot': 'a lot',
  
  // Suffix, vowels & grammar spelling
  'truely': 'truly',
  'writting': 'writing',
  'beutiful': 'beautiful',
  'goverment': 'government',
  'enviroment': 'environment',
  'calender': 'calendar',
  'grammer': 'grammar',
  'pronounciation': 'pronunciation',
  'acheive': 'achieve',
  'acheived': 'achieved',
  'acheivement': 'achievement',
  'existance': 'existence',
  'priviledge': 'privilege',
  'privilege': 'privilege',
  'rythm': 'rhythm',
  'rhytm': 'rhythm',
  'independant': 'independent',
  'knowlege': 'knowledge',
  'occassion': 'occasion',
  'ocassion': 'occasion',
  'occassionally': 'occasionally',
  'adress': 'address',
  'arguement': 'argument',
  'basicly': 'basically',
  'collegue': 'colleague',
  'collegues': 'colleagues',
  'disapear': 'disappear',
  'guarentee': 'guarantee',
  'garantee': 'guarantee',
  'heigt': 'height',
  'immediatly': 'immediately',
  'judgement': 'judgment',
  'liesure': 'leisure',
  'noticable': 'noticeable',
  'persue': 'pursue',
  'publically': 'publicly',
  'relevent': 'relevant',
  'religous': 'religious',
  'resistence': 'resistance',
  'sensable': 'sensible',
  'tendancy': 'tendency',
  'threshhold': 'threshold',
  'unforseen': 'unforeseen',
  'visable': 'visible',
};

export interface MisspelledMatch {
  word: string;
  correction: string;
  index: number;
}

/**
 * Match casing of the original word (e.g. Recieve -> Receive, RECIEVE -> RECEIVE)
 */
export function matchCasing(original: string, target: string): string {
  if (!original || !target) return target;
  if (original === original.toUpperCase()) return target.toUpperCase();
  if (original[0] === original[0].toUpperCase()) {
    return target.charAt(0).toUpperCase() + target.slice(1);
  }
  return target.toLowerCase();
}

/**
 * Detect all misspelled words in a given text
 */
export function detectMisspellings(text: string): MisspelledMatch[] {
  if (!text || text.trim().length === 0) return [];

  const matches: MisspelledMatch[] = [];
  // Regex to extract words (alphanumeric + apostrophes)
  const wordRegex = /\b[A-Za-z']+\b/g;
  let match: RegExpExecArray | null;

  while ((match = wordRegex.exec(text)) !== null) {
    const rawWord = match[0];
    const cleanKey = rawWord.toLowerCase().replace(/'/g, '');

    // Check with and without apostrophe
    let correction = COMMON_MISSPELLINGS[rawWord.toLowerCase()] || COMMON_MISSPELLINGS[cleanKey];

    if (correction) {
      const casedCorrection = matchCasing(rawWord, correction);
      matches.push({
        word: rawWord,
        correction: casedCorrection,
        index: match.index,
      });
    }
  }

  return matches;
}

/**
 * Replace a single misspelled word in text
 */
export function fixSingleMisspelling(
  text: string,
  targetWord: string,
  correction: string
): string {
  const regex = new RegExp(`\\b${escapeRegExp(targetWord)}\\b`, 'g');
  return text.replace(regex, correction);
}

/**
 * Replace all detected misspellings in the entire text
 */
export function fixAllMisspellings(text: string): { fixedText: string; count: number } {
  const matches = detectMisspellings(text);
  if (matches.length === 0) return { fixedText: text, count: 0 };

  let currentText = text;
  // Deduplicate words
  const uniqueWords = Array.from(new Set(matches.map((m) => m.word)));

  for (const word of uniqueWords) {
    const match = matches.find((m) => m.word === word);
    if (match) {
      const regex = new RegExp(`\\b${escapeRegExp(word)}\\b`, 'g');
      currentText = currentText.replace(regex, match.correction);
    }
  }

  return { fixedText: currentText, count: matches.length };
}

function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
