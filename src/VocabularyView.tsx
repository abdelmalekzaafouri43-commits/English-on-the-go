import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Flashcard,
  getFlashcards,
  saveFlashcards,
  updateFlashcard,
  addFlashcard,
  deleteFlashcard,
  resetToDefaultLexis,
  updateStreak,
} from './storage';
import { useTheme } from './ThemeContext';

type ViewMode = 'study' | 'library';

const CATEGORIES = [
  'All',
  'Academic',
  'Business',
  'Travel',
  'Conversational',
  'Idioms',
  'Starred',
] as const;

export const VocabularyView: React.FC = () => {
  const { currentThemeConfig } = useTheme();
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('study');
  const [activeCardIndex, setActiveCardIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  // Simple Add/Edit Modal
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [wordInput, setWordInput] = useState<string>('');
  const [posInput, setPosInput] = useState<string>('noun');
  const [ipaInput, setIpaInput] = useState<string>('');
  const [categoryInput, setCategoryInput] = useState<string>('Academic');
  const [levelInput, setLevelInput] = useState<string>('C1');
  const [defInput, setDefInput] = useState<string>('');
  const [exampleInput, setExampleInput] = useState<string>('');
  const [synonymsInput, setSynonymsInput] = useState<string>('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  useEffect(() => {
    const loaded = getFlashcards();
    setCards(loaded);
  }, []);

  // Filtered Cards
  const filteredCards = useMemo(() => {
    return cards.filter((c) => {
      const lowerSearch = searchTerm.toLowerCase().trim();
      const matchesSearch =
        !lowerSearch ||
        c.word.toLowerCase().includes(lowerSearch) ||
        c.definition.toLowerCase().includes(lowerSearch) ||
        (c.synonyms && c.synonyms.some((s) => s.toLowerCase().includes(lowerSearch)));

      const matchesCategory =
        selectedCategory === 'All' ||
        (selectedCategory === 'Starred' && c.starred) ||
        c.category?.toLowerCase() === selectedCategory.toLowerCase();

      return matchesSearch && matchesCategory;
    });
  }, [cards, searchTerm, selectedCategory]);

  // Keep active index in bounds
  useEffect(() => {
    if (activeCardIndex >= filteredCards.length && filteredCards.length > 0) {
      setActiveCardIndex(0);
    }
    setIsFlipped(false);
  }, [filteredCards.length, activeCardIndex]);

  // Pronunciation via Web Speech API
  const speakWord = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Star / Favorite toggle
  const handleToggleStar = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const target = cards.find((c) => c.id === cardId);
    if (!target) return;
    const updated = { ...target, starred: !target.starred };
    updateFlashcard(updated);
    setCards((prev) => prev.map((c) => (c.id === cardId ? updated : c)));
    showToast(updated.starred ? 'Added to Starred Words' : 'Removed from Starred');
  };

  // Delete card
  const handleDeleteCard = (cardId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    deleteFlashcard(cardId);
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    showToast('Word deleted');
  };

  // Next / Prev card navigation
  const handleNextCard = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handlePrevCard = () => {
    if (filteredCards.length === 0) return;
    setIsFlipped(false);
    setActiveCardIndex((prev) => (prev - 1 + filteredCards.length) % filteredCards.length);
  };

  const handleShuffleCards = () => {
    if (filteredCards.length <= 1) return;
    const nextIdx = Math.floor(Math.random() * filteredCards.length);
    setIsFlipped(false);
    setActiveCardIndex(nextIdx);
    showToast('Shuffled to random card');
  };

  // Keyboard navigation for Study Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'study' || modalOpen) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === 'ArrowRight' || e.key === 'j' || e.key === 'J') {
        handleNextCard();
      } else if (e.key === 'ArrowLeft' || e.key === 'k' || e.key === 'K') {
        handlePrevCard();
      } else if (e.key === 's' || e.key === 'S') {
        handleShuffleCards();
      } else if (e.key === 'p' || e.key === 'P') {
        const currentCard = filteredCards[activeCardIndex];
        if (currentCard) speakWord(currentCard.word);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, modalOpen, filteredCards, activeCardIndex, speakWord]);

  // Open Create/Edit modal
  const handleOpenAddModal = () => {
    setEditingCardId(null);
    setWordInput('');
    setPosInput('noun');
    setIpaInput('');
    setCategoryInput('Academic');
    setLevelInput('C1');
    setDefInput('');
    setExampleInput('');
    setSynonymsInput('');
    setModalOpen(true);
  };

  const handleOpenEditModal = (card: Flashcard, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingCardId(card.id);
    setWordInput(card.word);
    setPosInput(card.partOfSpeech || 'noun');
    setIpaInput(card.ipa || '');
    setCategoryInput(card.category || 'Academic');
    setLevelInput(card.level || 'C1');
    setDefInput(card.definition || '');
    setExampleInput(card.example || '');
    setSynonymsInput((card.synonyms || []).join(', '));
    setModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!wordInput.trim() || !defInput.trim()) {
      showToast('Word and Definition are required');
      return;
    }

    const synList = synonymsInput
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (editingCardId) {
      const existing = cards.find((c) => c.id === editingCardId);
      if (existing) {
        const updated: Flashcard = {
          ...existing,
          word: wordInput.trim(),
          partOfSpeech: posInput,
          ipa: ipaInput.trim() || undefined,
          category: categoryInput,
          level: levelInput,
          definition: defInput.trim(),
          example: exampleInput.trim() || 'No example sentence provided.',
          synonyms: synList.length > 0 ? synList : undefined,
        };
        updateFlashcard(updated);
        setCards((prev) => prev.map((c) => (c.id === editingCardId ? updated : c)));
        showToast('Word updated successfully');
      }
    } else {
      const newCard: Flashcard = {
        id: 'user_' + Date.now(),
        word: wordInput.trim(),
        partOfSpeech: posInput,
        ipa: ipaInput.trim() || undefined,
        category: categoryInput,
        level: levelInput,
        definition: defInput.trim(),
        example: exampleInput.trim() || 'No example sentence provided.',
        synonyms: synList.length > 0 ? synList : undefined,
        starred: false,
        dateAdded: new Date().toISOString(),
      };
      addFlashcard(newCard);
      setCards((prev) => [newCard, ...prev]);
      showToast('New word added to vault');
      updateStreak();
    }

    setModalOpen(false);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all vocabulary to original master lexicon?')) {
      const resetList = resetToDefaultLexis();
      setCards(resetList);
      setActiveCardIndex(0);
      showToast('Reset to default vocabulary pack');
    }
  };

  const currentCard = filteredCards[activeCardIndex];
  const starredCount = cards.filter((c) => c.starred).length;

  return (
    <div id="vocabulary-vault-view" className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border theme-border px-4 py-2 rounded-xl text-xs font-bold text-white shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          {toastMessage}
        </div>
      )}

      {/* Main Top Header */}
      <div className="px-4 py-3 border-b theme-border theme-header flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm md:text-base font-black text-white uppercase tracking-wider">
              Vocabulary Vault
            </h2>
            <p className="text-[10px] text-slate-400 font-mono">
              {cards.length} TOTAL WORDS · {starredCount} STARRED
            </p>
          </div>
        </div>

        {/* View Mode Switch & Actions */}
        <div className="flex items-center gap-2">
          <div className="bg-slate-950 p-0.5 rounded-xl border theme-border flex items-center">
            <button
              id="vocab-mode-study-btn"
              onClick={() => setViewMode('study')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                viewMode === 'study'
                  ? `${currentThemeConfig.activeBtnClass} shadow-md`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              FLASHCARDS
            </button>
            <button
              id="vocab-mode-library-btn"
              onClick={() => setViewMode('library')}
              className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition cursor-pointer ${
                viewMode === 'library'
                  ? `${currentThemeConfig.activeBtnClass} shadow-md`
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WORD LIBRARY
            </button>
          </div>

          <button
            id="vocab-add-word-btn"
            onClick={handleOpenAddModal}
            className="px-3.5 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
          >
            + ADD WORD
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'study' ? (
        /* ================= FLASHCARD STUDY MODE ================= */
        <div className="flex-1 flex flex-col items-center justify-between p-4 md:p-6 overflow-y-auto max-w-2xl mx-auto w-full">
          {/* Progress and Category Bar */}
          <div className="w-full flex items-center justify-between text-xs font-mono text-slate-400 shrink-0 mb-3">
            <span className="bg-slate-950/80 px-2.5 py-1 rounded-lg border theme-border text-[11px] font-bold text-sky-300">
              CARD {filteredCards.length > 0 ? activeCardIndex + 1 : 0} OF {filteredCards.length}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 uppercase hidden sm:inline">
                PRESS [SPACE] TO FLIP · [←/→] TO NAVIGATE
              </span>
            </div>
          </div>

          {/* Flashcard Component */}
          {filteredCards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/40 rounded-2xl border theme-border w-full">
              <h3 className="text-base font-bold text-white mb-2">No Words Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mb-4">
                No flashcards match your current filter. Try resetting filters or adding new words.
              </p>
              <button
                onClick={handleResetDefaults}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                RESTORE DEFAULT PACK
              </button>
            </div>
          ) : (
            <div
              id="study-flashcard-interactive"
              onClick={() => setIsFlipped((prev) => !prev)}
              className={`w-full min-h-[300px] md:min-h-[340px] flex-1 rounded-2xl border transition-all duration-300 cursor-pointer p-6 md:p-8 flex flex-col justify-between relative shadow-2xl select-none ${
                isFlipped
                  ? 'bg-slate-900/95 border-sky-500/80 shadow-[0_0_30px_rgba(56,189,248,0.15)] theme-animated-border-fast'
                  : 'theme-panel hover:border-slate-500 theme-animated-border'
              }`}
            >
              {/* Card Top Badges */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-black uppercase px-2.5 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/60">
                    {currentCard?.partOfSpeech || 'word'}
                  </span>
                  {currentCard?.level && (
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-950 text-slate-300 border theme-border">
                      {currentCard.level}
                    </span>
                  )}
                  {currentCard?.category && (
                    <span className="text-[10px] font-mono text-slate-400 uppercase">
                      {currentCard.category}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => currentCard && handleToggleStar(currentCard.id, e)}
                    className={`text-xs px-2.5 py-1 rounded-lg border font-mono font-bold transition cursor-pointer ${
                      currentCard?.starred
                        ? 'bg-amber-950/80 border-amber-500 text-amber-300 shadow-sm'
                        : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {currentCard?.starred ? '★ STARRED' : '☆ STAR'}
                  </button>
                </div>
              </div>

              {/* Card Center Content */}
              {!isFlipped ? (
                /* FRONT OF CARD */
                <div className="my-auto text-center py-4">
                  <h3 className="text-3xl md:text-4xl font-black text-white tracking-wide mb-2">
                    {currentCard?.word}
                  </h3>
                  {currentCard?.ipa && (
                    <p className="text-sm font-mono text-sky-400 mb-4 font-medium">
                      /{currentCard.ipa}/
                    </p>
                  )}
                  <p className="text-sm md:text-base text-slate-200 leading-relaxed max-w-md mx-auto">
                    {currentCard?.definition}
                  </p>
                </div>
              ) : (
                /* BACK OF CARD */
                <div className="my-auto text-left py-2 space-y-4 animate-in fade-in duration-200">
                  <div>
                    <span className="text-[9px] font-mono font-black uppercase tracking-widest text-sky-400 block mb-1">
                      REAL-WORLD USAGE EXAMPLE
                    </span>
                    <p className="text-sm md:text-base text-slate-100 font-medium italic leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border theme-border">
                      "{currentCard?.example}"
                    </p>
                  </div>

                  {currentCard?.synonyms && currentCard.synonyms.length > 0 && (
                    <div>
                      <span className="text-[9px] font-mono font-black uppercase tracking-widest text-emerald-400 block mb-1.5">
                        POWER SYNONYMS
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {currentCard.synonyms.map((syn, idx) => (
                          <span
                            key={idx}
                            className="text-xs font-medium px-2.5 py-0.5 rounded-lg bg-emerald-950/60 border border-emerald-700/60 text-emerald-200"
                          >
                            {syn}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Card Bottom Hint */}
              <div className="flex items-center justify-between pt-3 border-t theme-border text-[10px] font-mono text-slate-400">
                <span>{isFlipped ? 'BACK SIDE (DETAILS)' : 'FRONT SIDE (WORD & MEANING)'}</span>
                <span className="text-sky-300 font-bold">
                  {isFlipped ? 'CLICK TO SEE FRONT' : 'CLICK TO REVEAL EXAMPLE →'}
                </span>
              </div>
            </div>
          )}

          {/* Flashcard Bottom Controls */}
          {filteredCards.length > 0 && (
            <div className="w-full flex items-center justify-between gap-2 mt-4 pt-2 shrink-0">
              <button
                id="vocab-prev-btn"
                onClick={handlePrevCard}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border theme-border text-slate-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                ← PREV
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="vocab-speak-btn"
                  onClick={() => currentCard && speakWord(currentCard.word)}
                  className="px-3.5 py-2 rounded-xl bg-sky-950 hover:bg-sky-900 border border-sky-700 text-sky-200 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
                  title="Pronounce word"
                >
                  PRONOUNCE
                </button>
                <button
                  id="vocab-shuffle-btn"
                  onClick={handleShuffleCards}
                  className="px-3 py-2 rounded-xl bg-slate-950 hover:bg-slate-900 border theme-border text-slate-400 hover:text-white font-mono text-xs transition cursor-pointer"
                  title="Shuffle to random word"
                >
                  SHUFFLE
                </button>
              </div>

              <button
                id="vocab-next-btn"
                onClick={handleNextCard}
                className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md"
              >
                NEXT →
              </button>
            </div>
          )}
        </div>
      ) : (
        /* ================= WORD LIBRARY MODE ================= */
        <div className="flex-1 flex flex-col p-4 md:p-6 overflow-y-auto max-w-5xl mx-auto w-full">
          {/* Search Bar & Category Filter Chips */}
          <div className="space-y-3 mb-5 shrink-0">
            <div className="relative">
              <input
                id="vocab-search-input"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search vocabulary, definitions, or synonyms..."
                className="w-full bg-slate-950/80 border theme-border rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white font-mono text-xs"
                >
                  CLEAR
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                      isSelected
                        ? `${currentThemeConfig.activeBtnClass} shadow-md`
                        : 'bg-slate-950/80 hover:bg-slate-900 border theme-border text-slate-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards Grid */}
          {filteredCards.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-slate-950/40 rounded-2xl border theme-border">
              <p className="text-sm font-bold text-white mb-2">No matching words found</p>
              <p className="text-xs text-slate-400 mb-4">Try clearing your search or category filter.</p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="px-4 py-2 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pb-6">
              {filteredCards.map((card) => (
                <div
                  key={card.id}
                  id={`vocab-card-${card.id}`}
                  className="p-4 rounded-xl theme-panel border hover:border-slate-500 transition-all flex flex-col justify-between gap-3 shadow-md"
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-base font-black text-white">{card.word}</span>
                        {card.ipa && (
                          <span className="text-xs font-mono text-sky-400 font-medium">
                            /{card.ipa}/
                          </span>
                        )}
                        <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-sky-950 text-sky-300 border border-sky-700/60">
                          {card.partOfSpeech}
                        </span>
                        {card.level && (
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400 border theme-border">
                            {card.level}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => speakWord(card.word)}
                          className="px-2 py-1 rounded bg-slate-950 hover:bg-sky-950 border theme-border hover:border-sky-600 text-slate-300 hover:text-sky-200 text-[10px] font-mono font-bold uppercase cursor-pointer"
                          title="Pronounce"
                        >
                          AUDIO
                        </button>
                        <button
                          onClick={(e) => handleToggleStar(card.id, e)}
                          className={`px-2 py-1 rounded border text-[10px] font-mono font-bold uppercase cursor-pointer transition ${
                            card.starred
                              ? 'bg-amber-950/90 border-amber-500 text-amber-300'
                              : 'bg-slate-950 border-slate-700 text-slate-400 hover:text-white'
                          }`}
                        >
                          {card.starred ? '★' : '☆'}
                        </button>
                      </div>
                    </div>

                    {/* Definition */}
                    <p className="text-xs text-slate-200 font-medium leading-relaxed mb-2">
                      {card.definition}
                    </p>

                    {/* Example */}
                    {card.example && (
                      <p className="text-[11px] text-slate-300 italic bg-slate-950/60 p-2 rounded-lg border theme-border mb-2 leading-relaxed">
                        "{card.example}"
                      </p>
                    )}

                    {/* Synonyms */}
                    {card.synonyms && card.synonyms.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
                          SYNONYMS:
                        </span>
                        {card.synonyms.map((s, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Card footer actions */}
                  <div className="flex items-center justify-between pt-2 border-t theme-border text-[10px] font-mono text-slate-400">
                    <span>{card.category || 'General'}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => handleOpenEditModal(card, e)}
                        className="text-sky-400 hover:text-sky-300 uppercase cursor-pointer"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={(e) => handleDeleteCard(card.id, e)}
                        className="text-rose-400 hover:text-rose-300 uppercase cursor-pointer"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Simple Add/Edit Modal */}
      {modalOpen && (
        <div
          id="vocab-modal-backdrop"
          onClick={() => setModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-slate-900 border theme-border-strong rounded-2xl p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between border-b theme-border pb-3">
              <h3 className="text-sm font-black text-white uppercase tracking-wider">
                {editingCardId ? 'Edit Vocabulary Word' : 'Add New Word to Vault'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-xs font-mono text-slate-400 hover:text-white uppercase"
              >
                CLOSE
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Word *
                  </label>
                  <input
                    type="text"
                    required
                    value={wordInput}
                    onChange={(e) => setWordInput(e.target.value)}
                    placeholder="e.g. Eloquent"
                    className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Part of Speech
                  </label>
                  <select
                    value={posInput}
                    onChange={(e) => setPosInput(e.target.value)}
                    className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="noun">Noun</option>
                    <option value="verb">Verb</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                    <option value="idiom">Idiom</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    IPA Pronunciation
                  </label>
                  <input
                    type="text"
                    value={ipaInput}
                    onChange={(e) => setIpaInput(e.target.value)}
                    placeholder="ˈɛləkwənt"
                    className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Category
                  </label>
                  <select
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="Academic">Academic</option>
                    <option value="Business">Business</option>
                    <option value="Travel">Travel</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Idioms">Idioms</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                    Level
                  </label>
                  <select
                    value={levelInput}
                    onChange={(e) => setLevelInput(e.target.value)}
                    className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="B1">B1</option>
                    <option value="B2">B2</option>
                    <option value="C1">C1</option>
                    <option value="C2">C2</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Definition *
                </label>
                <textarea
                  required
                  rows={2}
                  value={defInput}
                  onChange={(e) => setDefInput(e.target.value)}
                  placeholder="Clear, precise explanation of the word's meaning..."
                  className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Example Sentence
                </label>
                <textarea
                  rows={2}
                  value={exampleInput}
                  onChange={(e) => setExampleInput(e.target.value)}
                  placeholder="Natural example sentence demonstrating real-world context..."
                  className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                  Synonyms (Comma-separated)
                </label>
                <input
                  type="text"
                  value={synonymsInput}
                  onChange={(e) => setSynonymsInput(e.target.value)}
                  placeholder="e.g. Articulate, Fluent, Expressive"
                  className="w-full bg-slate-950 border theme-border rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t theme-border mt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 font-bold text-xs uppercase cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider cursor-pointer shadow-md"
                >
                  SAVE WORD
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
