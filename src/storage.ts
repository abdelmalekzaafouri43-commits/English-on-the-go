import { ALL_INITIAL_WORDS, LexisItem } from './vocabularyData';

export interface Flashcard {
  id: string;
  word: string;
  definition: string;
  partOfSpeech: 'noun' | 'verb' | 'adjective' | 'adverb' | 'idiom' | string;
  example: string;
  ipa?: string;
  synonyms?: string[];
  category?: 'Academic' | 'Business' | 'Travel' | 'Conversational' | 'Descriptive' | 'Idioms' | 'Custom' | string;
  tags?: string[];
  level?: 'B1' | 'B2' | 'C1' | 'C2' | string;
  starred: boolean;
  dateAdded: string;
}

export interface QuizScore {
  id: string;
  tenseId: string;
  tenseName: string;
  difficulty: 'easy' | 'medium' | 'hard';
  score: number;
  total: number;
  date: string;
}

export interface StreakStats {
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD
  activeDates: string[]; // list of YYYY-MM-DD
}

const STORAGE_KEYS = {
  FLASHCARDS: 'zlabs_english_flashcards_v3',
  QUIZ_SCORES: 'zlabs_english_quiz_scores',
  STREAK: 'zlabs_english_streak',
};

export const getFlashcards = (): Flashcard[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FLASHCARDS);
  if (!data) {
    // Check if legacy storage exists to preserve user's custom additions
    const legacyData = localStorage.getItem('zlabs_english_flashcards_v2');
    if (legacyData) {
      try {
        const parsedLegacy = JSON.parse(legacyData);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const migrated: Flashcard[] = parsedLegacy.map((c: any) => ({
            ...c,
            tags: c.tags && c.tags.length > 0 ? c.tags : (c.category ? [c.category] : ['General']),
          }));
          localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(migrated));
          return migrated;
        }
      } catch (e) {
        // proceed to default initialization
      }
    }

    // Transform ALL_INITIAL_WORDS into Flashcard format
    const initial: Flashcard[] = ALL_INITIAL_WORDS.map((item) => ({
      id: item.id,
      word: item.word,
      definition: item.definition,
      partOfSpeech: item.partOfSpeech,
      example: item.example,
      ipa: item.ipa,
      synonyms: item.synonyms,
      category: item.category,
      tags: item.tags || (item.category ? [item.category] : ['General']),
      level: item.level,
      starred: item.starred || false,
      dateAdded: item.dateAdded || new Date().toISOString(),
    }));
    localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(data);
    if (Array.isArray(parsed)) {
      // Normalize missing tags
      return parsed.map((c) => ({
        ...c,
        tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : (c.category ? [c.category] : ['General']),
      }));
    }
    return [];
  } catch (e) {
    return [];
  }
};

export const saveFlashcards = (cards: Flashcard[]) => {
  const normalized = cards.map((c) => ({
    ...c,
    tags: Array.isArray(c.tags) && c.tags.length > 0 ? c.tags : (c.category ? [c.category] : ['General']),
  }));
  localStorage.setItem(STORAGE_KEYS.FLASHCARDS, JSON.stringify(normalized));
};

export const updateFlashcard = (updatedCard: Flashcard): Flashcard[] => {
  const cards = getFlashcards();
  const index = cards.findIndex((c) => c.id === updatedCard.id);
  const cardWithTags = {
    ...updatedCard,
    tags: Array.isArray(updatedCard.tags) && updatedCard.tags.length > 0 ? updatedCard.tags : (updatedCard.category ? [updatedCard.category] : ['General']),
  };
  let newCards: Flashcard[];
  if (index >= 0) {
    newCards = [...cards];
    newCards[index] = cardWithTags;
  } else {
    newCards = [cardWithTags, ...cards];
  }
  saveFlashcards(newCards);
  return newCards;
};

export const addFlashcard = (newCard: Flashcard): Flashcard[] => {
  const cards = getFlashcards();
  const cardWithTags = {
    ...newCard,
    tags: Array.isArray(newCard.tags) && newCard.tags.length > 0 ? newCard.tags : (newCard.category ? [newCard.category] : ['General']),
  };
  const updated = [cardWithTags, ...cards];
  saveFlashcards(updated);
  return updated;
};

export const deleteFlashcard = (id: string): Flashcard[] => {
  const cards = getFlashcards();
  const updated = cards.filter((c) => c.id !== id);
  saveFlashcards(updated);
  return updated;
};

export const resetToDefaultLexis = (): Flashcard[] => {
  const initial: Flashcard[] = ALL_INITIAL_WORDS.map((item) => ({
    id: item.id,
    word: item.word,
    definition: item.definition,
    partOfSpeech: item.partOfSpeech,
    example: item.example,
    ipa: item.ipa,
    synonyms: item.synonyms,
    category: item.category,
    tags: item.tags || (item.category ? [item.category] : ['General']),
    level: item.level,
    starred: item.starred || false,
    dateAdded: new Date().toISOString(),
  }));
  saveFlashcards(initial);
  return initial;
};

export const getQuizScores = (): QuizScore[] => {
  const data = localStorage.getItem(STORAGE_KEYS.QUIZ_SCORES);
  return data ? JSON.parse(data) : [];
};

export const saveQuizScore = (score: Omit<QuizScore, 'id' | 'date'>) => {
  const scores = getQuizScores();
  const newScore: QuizScore = {
    ...score,
    id: 'score_' + Date.now(),
    date: new Date().toISOString(),
  };
  scores.push(newScore);
  localStorage.setItem(STORAGE_KEYS.QUIZ_SCORES, JSON.stringify(scores));
  return newScore;
};

export const getStreakStats = (): StreakStats => {
  const data = localStorage.getItem(STORAGE_KEYS.STREAK);
  const todayStr = new Date().toISOString().split('T')[0];

  const defaultStats: StreakStats = {
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: '',
    activeDates: [],
  };

  const stats: StreakStats = data ? JSON.parse(data) : defaultStats;
  return stats;
};

export const updateStreak = (): StreakStats => {
  const stats = getStreakStats();
  const todayStr = new Date().toISOString().split('T')[0];

  if (stats.lastActiveDate === todayStr) {
    return stats; // Already logged active status today
  }

  const activeDates = [...stats.activeDates];
  if (!activeDates.includes(todayStr)) {
    activeDates.push(todayStr);
  }

  let currentStreak = stats.currentStreak;
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (stats.lastActiveDate === yesterdayStr) {
    currentStreak += 1;
  } else if (stats.lastActiveDate === '') {
    currentStreak = 1;
  } else {
    // Gap detected, reset current streak to 1
    currentStreak = 1;
  }

  const longestStreak = Math.max(currentStreak, stats.longestStreak);

  const updated: StreakStats = {
    currentStreak,
    longestStreak,
    lastActiveDate: todayStr,
    activeDates,
  };

  localStorage.setItem(STORAGE_KEYS.STREAK, JSON.stringify(updated));
  return updated;
};
