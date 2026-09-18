import React, { useState, useEffect, useRef, useCallback } from 'react';
import { QUIZ_TOPICS, Question, TenseTopic } from './quizData';
import { saveQuizScore, updateStreak } from './storage';
import canvasConfetti from 'canvas-confetti';
import { QuickQuizModal } from './QuickQuizModal';
import {
  playCorrectSound,
  playIncorrectSound,
  playQuizCompletionSound,
  toggleQuizSound,
  isQuizSoundEnabled,
} from './soundFx';
import { Brain, X, Loader2 } from 'lucide-react';

interface GrammarTip {
  title: string;
  description: string;
  example: string;
}

interface GrammarTipsResponse {
  summary: string;
  tips: GrammarTip[];
}

export const TensesView: React.FC = () => {
  const [selectedTenseId, setSelectedTenseId] = useState<string>('present_simple');
  const [categoryFilter, setCategoryFilter] = useState<'All' | 'Present' | 'Past' | 'Future'>('All');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);

  // Improvement Tips State
  const [isTipsLoading, setIsTipsLoading] = useState<boolean>(false);
  const [grammarTips, setGrammarTips] = useState<GrammarTipsResponse | null>(null);
  const [showTipsOverlay, setShowTipsOverlay] = useState<boolean>(false);

  // Quick Quiz Modal State
  const [isQuickQuizOpen, setIsQuickQuizOpen] = useState<boolean>(false);
  const [quickQuizTopic, setQuickQuizTopic] = useState<TenseTopic | null>(null);

  const [soundActive, setSoundActive] = useState<boolean>(isQuizSoundEnabled());

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const activeTopic = QUIZ_TOPICS.find((t) => t.id === selectedTenseId) || QUIZ_TOPICS[0];
  const currentQuestions: Question[] = activeTopic ? activeTopic.quizzes[difficulty] : [];

  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
  }, []);

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleOpenQuickQuiz = (topicToQuiz?: TenseTopic) => {
    clearAutoAdvance();
    const target = topicToQuiz || activeTopic;
    if (target) {
      setQuickQuizTopic(target);
      setIsQuickQuizOpen(true);
    }
  };

  const handleSelectTense = (id: string, autoStartQuiz: boolean = false) => {
    clearAutoAdvance();
    setSelectedTenseId(id);
    setShowResults(false);
    setCurrentIndex(0);
    setAnswers({});
    setIsPlaying(autoStartQuiz);
  };

  const handleCategoryFilterClick = (cat: 'All' | 'Present' | 'Past' | 'Future') => {
    setCategoryFilter(cat);
    if (cat !== 'All') {
      const firstInCat = QUIZ_TOPICS.find((t) => t.category === cat);
      if (firstInCat) {
        setSelectedTenseId(firstInCat.id);
      }
    }
  };

  const fetchImprovementTips = async (currentAnswers: Record<number, string>, qList: Question[]) => {
    const mistakes = qList.map((q, idx) => ({
      question: q.q,
      correctAnswer: q.answer,
      userAnswer: currentAnswers[idx],
      explanation: q.explanation
    })).filter(m => m.userAnswer && m.userAnswer !== m.correctAnswer);

    if (mistakes.length === 0) return;

    setIsTipsLoading(true);
    setGrammarTips(null);
    try {
      const response = await fetch('/api/grammar-tips', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mistakes })
      });
      if (response.ok) {
        const data = await response.json();
        setGrammarTips(data);
      }
    } catch (err) {
      console.error("Failed to fetch grammar tips:", err);
    } finally {
      setIsTipsLoading(false);
    }
  };

  const advanceToNext = useCallback(
    (currentAnswers: Record<number, string>, currentIdx: number, qList: Question[]) => {
      clearAutoAdvance();
      if (currentIdx < qList.length - 1) {
        setCurrentIndex(currentIdx + 1);
      } else {
        let calculatedScore = 0;
        qList.forEach((q, idx) => {
          if (currentAnswers[idx] === q.answer) {
            calculatedScore += 1;
          }
        });
        setScore(calculatedScore);
        setShowResults(true);

        if (calculatedScore === qList.length) {
          canvasConfetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.55 },
          });
        } else {
          // Fetch tips for mistaken answers
          fetchImprovementTips(currentAnswers, qList);
        }
        playQuizCompletionSound();

        if (activeTopic) {
          saveQuizScore({
            tenseId: activeTopic.id,
            tenseName: activeTopic.name,
            difficulty,
            score: calculatedScore,
            total: qList.length,
          });
          updateStreak();
        }
      }
    },
    [clearAutoAdvance, activeTopic, difficulty]
  );

  const handleSelectOption = useCallback(
    (option: string) => {
      if (answers[currentIndex] !== undefined || !currentQuestions[currentIndex]) return;
      const updatedAnswers = { ...answers, [currentIndex]: option };
      setAnswers(updatedAnswers);

      const isCorrect = option === currentQuestions[currentIndex].answer;
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Auto advance smoothly
      const delay = isCorrect ? 1300 : 1800;
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNext(updatedAnswers, currentIndex, currentQuestions);
      }, delay);
    },
    [answers, currentIndex, currentQuestions, advanceToNext]
  );

  const handleImmediateAdvance = useCallback(() => {
    if (answers[currentIndex] === undefined) return;
    advanceToNext(answers, currentIndex, currentQuestions);
  }, [answers, currentIndex, currentQuestions, advanceToNext]);

  const handleResetQuiz = () => {
    clearAutoAdvance();
    setCurrentIndex(0);
    setAnswers({});
    setShowResults(false);
    setIsPlaying(true);
  };

  // Keyboard navigation for full practice quiz
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isPlaying || isQuickQuizOpen) return;

      if (e.key === 'Escape') {
        clearAutoAdvance();
        setIsPlaying(false);
        return;
      }

      if (showResults) {
        if (e.key === 'r' || e.key === 'R') {
          handleResetQuiz();
        }
        return;
      }

      const isAnswered = answers[currentIndex] !== undefined;
      if (isAnswered && (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault();
        handleImmediateAdvance();
        return;
      }

      if (!isAnswered && currentQuestions[currentIndex]) {
        const key = e.key.toUpperCase();
        let selectedIndex = -1;
        if (key === 'A' || key === '1') selectedIndex = 0;
        else if (key === 'B' || key === '2') selectedIndex = 1;
        else if (key === 'C' || key === '3') selectedIndex = 2;
        else if (key === 'D' || key === '4') selectedIndex = 3;

        if (selectedIndex >= 0 && selectedIndex < currentQuestions[currentIndex].options.length) {
          handleSelectOption(currentQuestions[currentIndex].options[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPlaying,
    isQuickQuizOpen,
    showResults,
    answers,
    currentIndex,
    currentQuestions,
    clearAutoAdvance,
    handleImmediateAdvance,
    handleSelectOption,
  ]);

  const filteredTopics = QUIZ_TOPICS.filter((t) => {
    if (categoryFilter === 'All') return true;
    return t.category === categoryFilter;
  });

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row gap-4 p-3 md:p-6 overflow-hidden">
      {/* Quick Quiz Modal */}
      <QuickQuizModal
        isOpen={isQuickQuizOpen}
        topic={quickQuizTopic}
        onClose={() => setIsQuickQuizOpen(false)}
      />

      {/* Tenses Sidebar - Clean Blue Action Buttons */}
      <div
        className={`${
          selectedTenseId && isPlaying ? 'hidden md:flex' : 'flex'
        } w-full md:w-[340px] flex-1 md:flex-none md:h-full flex-col border theme-border theme-panel rounded-2xl overflow-hidden shrink-0 shadow-xl`}
      >
        {/* Category Filter Action Buttons */}
        <div className="p-3.5 border-b theme-border theme-header flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-sky-400">
              VERB TENSES
            </span>
            <div className="flex items-center gap-1.5">
              <button
                id="quick-quiz-header-trigger"
                onClick={() => handleOpenQuickQuiz()}
                className="text-[9px] font-mono font-bold text-sky-200 bg-sky-950/90 hover:bg-sky-900 border border-sky-500/60 hover:border-sky-400 px-2 py-0.5 rounded shadow-sm transition cursor-pointer"
                title="Open 3-Question Quick Quiz for active tense"
              >
                ⚡ QUICK QUIZ
              </button>
              <span className="text-[9px] font-mono font-bold text-slate-300 bg-slate-950 border theme-border px-2 py-0.5 rounded">
                12 FORMULAS
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-950/70 p-1 rounded-xl border theme-border">
            {(['All', 'Present', 'Past', 'Future'] as const).map((cat) => {
              const isActive = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  id={`cat-filter-${cat.toLowerCase()}`}
                  onClick={() => handleCategoryFilterClick(cat)}
                  className={`py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    isActive
                      ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          {categoryFilter !== 'All' && (
            <div className="flex items-center justify-between bg-sky-950/40 border border-sky-800/50 px-2.5 py-1.5 rounded-lg text-[9px] font-mono">
              <span className="text-sky-300 font-bold uppercase">
                {categoryFilter} TENSES CATEGORY
              </span>
              <button
                onClick={() => handleOpenQuickQuiz()}
                className="text-sky-200 hover:text-white font-black underline cursor-pointer"
              >
                [TEST RULE]
              </button>
            </div>
          )}
        </div>

        {/* Tenses Button List */}
        <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 theme-panel-sub">
          {filteredTopics.map((topic) => {
            const isActive = selectedTenseId === topic.id;
            return (
              <div
                key={topic.id}
                id={`tense-item-${topic.id}`}
                className={`w-full p-3 rounded-xl border text-left transition-all flex flex-col gap-2 ${
                  isActive
                    ? 'bg-sky-950/70 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] text-white'
                    : 'bg-slate-900/50 border-slate-700/40 text-slate-300 hover:bg-slate-850 hover:border-sky-700/60 hover:text-white'
                }`}
              >
                <div
                  onClick={() => handleSelectTense(topic.id, false)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className="font-bold text-xs tracking-tight">
                    {topic.name}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenQuickQuiz(topic);
                    }}
                    className={`text-[8px] font-mono font-bold uppercase px-2 py-0.5 rounded border transition hover:scale-105 cursor-pointer ${
                      isActive
                        ? 'bg-sky-400 text-slate-950 border-sky-300 font-black'
                        : 'bg-slate-950/80 text-sky-400 border-sky-900 hover:border-sky-600 hover:bg-sky-950'
                    }`}
                    title={`Take Quick Quiz for ${topic.name}`}
                  >
                    QUIZ
                  </button>
                </div>

                <div
                  onClick={() => handleSelectTense(topic.id, false)}
                  className="flex items-center justify-between gap-2 cursor-pointer"
                >
                  <span className={`text-[10px] font-mono truncate flex-1 ${isActive ? 'text-sky-300 font-bold' : 'text-slate-400'}`}>
                    {topic.formula}
                  </span>
                  <span className="text-[8px] font-mono text-slate-500 uppercase shrink-0">
                    {topic.category}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col border theme-border theme-panel rounded-2xl overflow-hidden shadow-2xl relative">
        {activeTopic ? (
          showResults ? (
            /* Results Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto gap-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-950/80 border-2 border-sky-400 flex items-center justify-center text-sky-300 font-mono text-sm font-black tracking-widest shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                {score === currentQuestions.length ? '100%' : `${Math.round((score / currentQuestions.length) * 100)}%`}
              </div>

              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400 bg-sky-950/80 border border-sky-600/60 px-2.5 py-1 rounded-md shadow-sm">
                  FULL QUIZ COMPLETED
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white mt-2">
                  {activeTopic.name}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  Difficulty: <strong className="text-sky-400 uppercase">{difficulty}</strong>
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border theme-border w-full flex items-center justify-around gap-4 shadow-md">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">
                    ACCURACY
                  </span>
                  <span className="text-2xl font-black text-white">
                    {score} / {currentQuestions.length}
                  </span>
                </div>
                <div className="h-8 w-[1px] bg-slate-700/50" />
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-400 font-mono block">
                    STATUS
                  </span>
                  <span className="text-xs font-black text-sky-400 uppercase tracking-wider block mt-1">
                    {score === currentQuestions.length ? 'MASTERED' : 'GOOD EFFORT'}
                  </span>
                </div>
              </div>

              {score < currentQuestions.length && (
                <button
                  onClick={() => setShowTipsOverlay(true)}
                  disabled={isTipsLoading && !grammarTips}
                  className="w-full py-3 bg-gradient-to-r from-fuchsia-950/60 to-purple-900/60 hover:from-fuchsia-900/80 hover:to-purple-800/80 border border-fuchsia-500/40 text-fuchsia-100 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.2)] flex items-center justify-center gap-2"
                >
                  {isTipsLoading && !grammarTips ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-fuchsia-400" />
                      ANALYZING MISTAKES...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 text-fuchsia-400" />
                      AI IMPROVEMENT TIPS
                    </>
                  )}
                </button>
              )}

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border theme-border font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  REVIEW FORMULA
                </button>
                <button
                  onClick={handleResetQuiz}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                >
                  RETRY QUIZ
                </button>
              </div>
            </div>
          ) : isPlaying ? (
            /* Active Full Quiz Screen */
            <div
              data-quiz-active="true"
              className="flex-1 flex flex-col justify-between overflow-hidden"
            >
              {/* Header */}
              <div className="px-5 py-3 border-b theme-border theme-header flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsPlaying(false)}
                    className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white bg-slate-950/80 border theme-border px-2.5 py-1 rounded-lg cursor-pointer"
                  >
                    EXIT QUIZ
                  </button>
                  <span className="text-xs font-bold text-white hidden sm:inline">
                    {activeTopic.name}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {/* Audio Toggle */}
                  <button
                    onClick={() => {
                      const nextState = toggleQuizSound();
                      setSoundActive(nextState);
                    }}
                    className={`px-2 py-1 rounded border text-[8px] font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
                      soundActive
                        ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                        : 'bg-slate-950 border-slate-800 text-slate-500'
                    }`}
                    title="Toggle Audio Feedback"
                  >
                    SOUND: {soundActive ? 'ON' : 'MUTED'}
                  </button>
                  <span className="text-[10px] font-mono text-sky-400 font-bold">
                    {currentIndex + 1} / {currentQuestions.length}
                  </span>
                </div>
              </div>

              {/* Progress Line */}
              <div className="w-full h-1 bg-slate-950 shrink-0">
                <div
                  className="h-full bg-sky-400 transition-all duration-300"
                  style={{
                    width: `${((currentIndex + 1) / currentQuestions.length) * 100}%`,
                  }}
                />
              </div>

              {/* Question & Choices */}
              <div
                onClick={answers[currentIndex] !== undefined ? handleImmediateAdvance : undefined}
                className="flex-1 p-5 md:p-8 overflow-y-auto flex flex-col justify-center gap-5 max-w-lg mx-auto w-full"
              >
                <div className="text-center">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-sky-400 bg-sky-950/80 border border-sky-700/60 px-2.5 py-0.5 rounded inline-block mb-2 shadow-sm">
                    FILL IN THE BLANK · PRACTICE MODE
                  </span>
                  <h3 className="text-lg md:text-xl font-bold text-white leading-relaxed">
                    {currentQuestions[currentIndex].q}
                  </h3>
                </div>

                <div className="flex flex-col gap-2.5 w-full">
                  {currentQuestions[currentIndex].options.map((opt, oIdx) => {
                    const isAnswered = answers[currentIndex] !== undefined;
                    const isSelected = answers[currentIndex] === opt;
                    const isCorrect = opt === currentQuestions[currentIndex].answer;

                    let btnStyle =
                      'bg-slate-900/60 border-slate-700/40 text-slate-200 hover:bg-sky-950/40 hover:border-sky-500 active:scale-[0.99]';
                    if (isAnswered) {
                      if (isCorrect) {
                        btnStyle =
                          'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)] scale-[1.01]';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950/90 border-rose-500 text-rose-100 font-bold';
                      } else {
                        btnStyle = 'bg-slate-950/60 border-slate-900 text-slate-600 opacity-40';
                      }
                    }

                    const letter = String.fromCharCode(65 + oIdx);

                    return (
                      <button
                        key={oIdx}
                        id={`practice-opt-${currentIndex}-${oIdx}`}
                        disabled={isAnswered}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectOption(opt);
                        }}
                        className={`p-3.5 rounded-xl border text-left font-medium text-xs md:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${btnStyle}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border ${
                              isAnswered && isCorrect
                                ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-black'
                                : isAnswered && isSelected
                                ? 'bg-rose-600 text-white border-rose-500'
                                : 'bg-slate-950 border-slate-700 text-slate-400'
                            }`}
                          >
                            {letter}
                          </span>
                          <span>{opt}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          {!isAnswered && (
                            <span className="text-[9px] font-mono text-slate-500 uppercase">
                              [{letter} / {oIdx + 1}]
                            </span>
                          )}
                          {isAnswered && (
                            <span className="text-[9px] font-mono font-black uppercase tracking-wider shrink-0">
                              {isCorrect ? 'CORRECT' : isSelected ? 'MISSED' : ''}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Instant Feedback & Rule Insight with Auto-Advance Progress */}
                {answers[currentIndex] !== undefined && (
                  <div
                    onClick={handleImmediateAdvance}
                    className="p-4 rounded-xl bg-sky-950/70 border border-sky-500/60 text-xs text-sky-100 leading-relaxed shadow-lg animate-in fade-in duration-200 cursor-pointer relative overflow-hidden"
                  >
                    <div
                      className="absolute bottom-0 left-0 h-1 bg-sky-400"
                      style={{
                        width: '100%',
                        animation: `countdown ${
                          answers[currentIndex] === currentQuestions[currentIndex].answer
                            ? '1.3s'
                            : '1.8s'
                        } linear forwards`,
                      }}
                    />

                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[9px] font-mono font-black uppercase text-sky-400 tracking-wider">
                        {answers[currentIndex] === currentQuestions[currentIndex].answer
                          ? 'EXCELLENT · CORRECT'
                          : 'RULE EXPLANATION'}
                      </span>
                      <span className="text-[9px] font-mono text-sky-300 font-bold">
                        {currentIndex === currentQuestions.length - 1
                          ? 'COMPLETING QUIZ →'
                          : 'NEXT QUESTION IN 1s [TAP TO SKIP] →'}
                      </span>
                    </div>
                    <p className="text-slate-200 text-xs">
                      {currentQuestions[currentIndex].explanation}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Topic Overview */
            <div className="flex-1 p-5 md:p-8 overflow-y-auto flex flex-col justify-between gap-6">
              <div className="flex flex-col gap-6">
                {/* Header */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <button
                      id="tense-category-quiz-pill"
                      onClick={() => handleOpenQuickQuiz()}
                      className="text-[9px] font-mono font-black uppercase px-2.5 py-1 rounded bg-sky-950/80 hover:bg-sky-900 border border-sky-600/60 hover:border-sky-400 text-sky-300 transition cursor-pointer flex items-center gap-1.5 shadow-sm"
                      title="Click to take 3-question quick quiz"
                    >
                      <span>QUICK QUIZ</span>
                      <span className="opacity-60">·</span>
                      <span>{activeTopic.category} TENSE</span>
                    </button>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                    {activeTopic.name}
                  </h3>
                  <p className="text-xs md:text-sm text-slate-300 leading-relaxed">
                    {activeTopic.summary}
                  </p>
                </div>

                {/* 2 Clean Info Cards with vibrant gradient backgrounds */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-sky-950/60 to-slate-900/60 border border-sky-500/40 flex flex-col gap-1.5 shadow-md">
                    <span className="text-[10px] font-mono font-bold uppercase text-sky-400">
                      GRAMMAR FORMULA
                    </span>
                    <p className="text-sm md:text-base font-mono font-bold text-white">
                      {activeTopic.formula}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/60 to-slate-900/60 border border-indigo-500/40 flex flex-col gap-1.5 shadow-md justify-between">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold uppercase text-indigo-400">
                        REAL-WORLD EXAMPLE
                      </span>
                      <button
                        onClick={() => playAudio(activeTopic.example)}
                        className="text-[9px] font-mono font-bold text-sky-400 hover:text-sky-300 cursor-pointer active:scale-95"
                      >
                        [PLAY AUDIO]
                      </button>
                    </div>
                    <p className="text-sm md:text-base font-medium italic text-slate-100">
                      &ldquo;{activeTopic.example}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Difficulty Selector as Clean Action Buttons */}
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                    FULL PRACTICE DIFFICULTY:
                  </span>
                  <div className="grid grid-cols-3 gap-2 max-w-sm">
                    {(
                      [
                        { id: 'easy', label: 'EASY' },
                        { id: 'medium', label: 'MEDIUM' },
                        { id: 'hard', label: 'HARD' },
                      ] as const
                    ).map((d) => (
                      <button
                        key={d.id}
                        onClick={() => setDifficulty(d.id)}
                        className={`py-2 rounded-xl text-xs font-bold uppercase transition cursor-pointer border ${
                          difficulty === d.id
                            ? 'bg-sky-500 text-slate-950 font-black border-sky-400 shadow-md'
                            : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:text-white hover:border-sky-600'
                        }`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Start Actions: Quick Quiz Modal & Full Practice Quiz */}
              <div className="pt-4 border-t theme-border flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-[10px] font-mono text-slate-400 hidden lg:inline">
                  {currentQuestions.length} questions available for deep practice
                </span>
                
                <div className="flex flex-col sm:flex-row gap-2.5 w-full sm:w-auto">
                  {/* Quick Quiz 3-Question Modal Action */}
                  <button
                    id="trigger-quick-quiz-modal"
                    onClick={() => handleOpenQuickQuiz()}
                    className="px-6 py-3 bg-slate-900 hover:bg-sky-950/70 text-sky-300 hover:text-sky-200 border border-sky-500/60 hover:border-sky-400 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md text-center"
                  >
                    QUICK QUIZ (3 QUESTIONS)
                  </button>

                  {/* Full Practice Quiz */}
                  <button
                    id="trigger-full-quiz"
                    onClick={() => setIsPlaying(true)}
                    className="px-6 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-sky-500/20 text-center"
                  >
                    FULL PRACTICE QUIZ
                  </button>
                </div>
              </div>
            </div>
          )
        ) : null}
      </div>

      {showTipsOverlay && grammarTips && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-slate-950 border border-fuchsia-500/40 rounded-2xl shadow-[0_0_40px_rgba(217,70,239,0.15)] overflow-hidden">
            <div className="p-4 border-b border-fuchsia-500/20 bg-fuchsia-950/20 flex items-center justify-between sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-fuchsia-400" />
                <h3 className="font-black text-fuchsia-100 uppercase tracking-wider text-sm">
                  AI Grammar Analysis
                </h3>
              </div>
              <button
                onClick={() => setShowTipsOverlay(false)}
                className="p-1.5 hover:bg-fuchsia-900/50 rounded-lg text-fuchsia-300 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 flex flex-col gap-5 bg-gradient-to-b from-transparent to-slate-950/50">
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700/50">
                <p className="text-sm font-medium text-slate-200 leading-relaxed">
                  {grammarTips.summary}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-fuchsia-400">
                  Targeted Improvements
                </h4>
                {grammarTips.tips.map((tip, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-fuchsia-500/30 bg-fuchsia-950/10 flex flex-col gap-2">
                    <h5 className="font-bold text-fuchsia-200 text-sm">{tip.title}</h5>
                    <p className="text-xs text-slate-300 leading-relaxed">{tip.description}</p>
                    <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-500/20">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                        Correct Example
                      </span>
                      <span className="text-xs font-mono text-emerald-200">{tip.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="p-4 border-t border-slate-800 bg-slate-950 shrink-0">
              <button
                onClick={() => setShowTipsOverlay(false)}
                className="w-full py-2.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-fuchsia-50 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.2)]"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

