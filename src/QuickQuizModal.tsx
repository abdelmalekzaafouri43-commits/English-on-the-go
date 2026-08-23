import React, { useState, useEffect, useRef, useCallback } from 'react';
import { TenseTopic, Question, getQuickQuizQuestions } from './quizData';
import { saveQuizScore, updateStreak } from './storage';
import canvasConfetti from 'canvas-confetti';
import {
  playCorrectSound,
  playIncorrectSound,
  playQuizCompletionSound,
  toggleQuizSound,
  isQuizSoundEnabled,
} from './soundFx';

interface QuickQuizModalProps {
  isOpen: boolean;
  topic: TenseTopic | null;
  onClose: () => void;
  onSelectTopic?: (topicId: string) => void;
}

export const QuickQuizModal: React.FC<QuickQuizModalProps> = ({
  isOpen,
  topic,
  onClose,
}) => {
  const [questionCount, setQuestionCount] = useState<3 | 5>(3);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResults, setShowResults] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [soundActive, setSoundActive] = useState<boolean>(isQuizSoundEnabled());
  const [isAutoAdvancing, setIsAutoAdvancing] = useState<boolean>(false);

  const autoAdvanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timers on unmount or question change
  const clearAutoAdvance = useCallback(() => {
    if (autoAdvanceTimerRef.current) {
      clearTimeout(autoAdvanceTimerRef.current);
      autoAdvanceTimerRef.current = null;
    }
    setIsAutoAdvancing(false);
  }, []);

  // Initialize questions
  const loadQuestions = useCallback(
    (count: 3 | 5 = questionCount, currentTopic: TenseTopic | null = topic) => {
      clearAutoAdvance();
      if (currentTopic) {
        const qList = getQuickQuizQuestions(currentTopic, count);
        setQuestions(qList);
        setCurrentIndex(0);
        setAnswers({});
        setShowResults(false);
        setScore(0);
      }
    },
    [topic, questionCount, clearAutoAdvance]
  );

  useEffect(() => {
    if (isOpen && topic) {
      loadQuestions(questionCount, topic);
    } else {
      clearAutoAdvance();
    }
    return () => clearAutoAdvance();
  }, [isOpen, topic, loadQuestions, clearAutoAdvance]);

  const currentQuestion = questions[currentIndex];
  const isAnswered = answers[currentIndex] !== undefined;

  // Process transitioning to next question or results
  const advanceToNext = useCallback(
    (currentAnswers: Record<number, string>, currentIdx: number, qList: Question[]) => {
      clearAutoAdvance();
      if (currentIdx < qList.length - 1) {
        setCurrentIndex(currentIdx + 1);
      } else {
        // Calculate final score
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
          playQuizCompletionSound();
        } else {
          playQuizCompletionSound();
        }

        if (topic) {
          saveQuizScore({
            tenseId: topic.id,
            tenseName: `${topic.name} (Quick Quiz)`,
            difficulty: 'medium',
            score: calculatedScore,
            total: qList.length,
          });
          updateStreak();
        }
      }
    },
    [clearAutoAdvance, topic]
  );

  const handleSelectOption = useCallback(
    (option: string) => {
      if (isAnswered || !currentQuestion) return;

      const updatedAnswers = { ...answers, [currentIndex]: option };
      setAnswers(updatedAnswers);
      setIsAutoAdvancing(true);

      const isCorrect = option === currentQuestion.answer;
      if (isCorrect) {
        playCorrectSound();
      } else {
        playIncorrectSound();
      }

      // Auto-advance without needing a manual next button!
      const delay = isCorrect ? 1300 : 1800; // slightly longer if wrong to read rule explanation
      autoAdvanceTimerRef.current = setTimeout(() => {
        advanceToNext(updatedAnswers, currentIndex, questions);
      }, delay);
    },
    [isAnswered, currentQuestion, answers, currentIndex, questions, advanceToNext]
  );

  // Manual skip of auto-advance countdown if user clicks or taps
  const handleImmediateAdvance = useCallback(() => {
    if (!isAnswered) return;
    advanceToNext(answers, currentIndex, questions);
  }, [isAnswered, advanceToNext, answers, currentIndex, questions]);

  // Keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        clearAutoAdvance();
        onClose();
        return;
      }

      if (showResults) {
        if (e.key === 'r' || e.key === 'R') {
          loadQuestions(questionCount, topic);
        }
        return;
      }

      // If answered and user hits Space or Enter, advance immediately
      if (isAnswered && (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowRight')) {
        e.preventDefault();
        handleImmediateAdvance();
        return;
      }

      // If not answered yet, allow 1-4 or A-D keys to select option
      if (!isAnswered && currentQuestion) {
        const key = e.key.toUpperCase();
        let selectedIndex = -1;
        if (key === 'A' || key === '1') selectedIndex = 0;
        else if (key === 'B' || key === '2') selectedIndex = 1;
        else if (key === 'C' || key === '3') selectedIndex = 2;
        else if (key === 'D' || key === '4') selectedIndex = 3;

        if (selectedIndex >= 0 && selectedIndex < currentQuestion.options.length) {
          handleSelectOption(currentQuestion.options[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    showResults,
    isAnswered,
    currentQuestion,
    questionCount,
    topic,
    clearAutoAdvance,
    onClose,
    loadQuestions,
    handleImmediateAdvance,
    handleSelectOption,
  ]);

  if (!isOpen || !topic || questions.length === 0) return null;

  const xpEarned = score * 10 + (score === questions.length ? 15 : 0);

  return (
    <div
      id="quick-quiz-modal-backdrop"
      data-quiz-active="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          clearAutoAdvance();
          onClose();
        }
      }}
      className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="quick-quiz-dialog"
        className="w-full max-w-xl bg-slate-900 border theme-border rounded-2xl shadow-2xl overflow-hidden flex flex-col my-auto"
      >
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b theme-border theme-header flex items-center justify-between gap-3 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded bg-sky-950/80 border border-sky-600/60 text-sky-300 tracking-wider">
                QUICK QUIZ · {questionCount}-QUESTION SPRINT
              </span>
              <span className="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-950 border theme-border text-slate-400">
                {topic.category}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
              {topic.name}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {/* Audio Toggle */}
            <button
              id="quick-quiz-sound-toggle"
              onClick={() => {
                const nextState = toggleQuizSound();
                setSoundActive(nextState);
              }}
              className={`px-2.5 py-1 rounded-lg border text-[9px] font-mono font-bold uppercase tracking-wider transition cursor-pointer ${
                soundActive
                  ? 'bg-sky-950/80 border-sky-600 text-sky-300'
                  : 'bg-slate-950 border-slate-800 text-slate-500'
              }`}
              title="Toggle Audio Feedback"
            >
              SOUND: {soundActive ? 'ON' : 'MUTED'}
            </button>

            {/* Close Button */}
            <button
              id="quick-quiz-close-btn"
              onClick={() => {
                clearAutoAdvance();
                onClose();
              }}
              className="px-3 py-1.5 rounded-lg bg-slate-950 border theme-border text-slate-400 hover:text-white hover:border-slate-600 text-[10px] font-mono font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
            >
              CLOSE [ESC]
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {!showResults ? (
          <div
            className="flex-1 flex flex-col p-4 sm:p-6 gap-4 sm:gap-5"
            onClick={isAnswered ? handleImmediateAdvance : undefined}
          >
            {/* Top Toolbar: Question length selector & Live Progress */}
            <div className="flex items-center justify-between gap-3 text-[10px] font-mono font-bold">
              {/* Question Count Tabs */}
              <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border theme-border">
                <button
                  disabled={isAnswered}
                  onClick={() => {
                    setQuestionCount(3);
                    loadQuestions(3, topic);
                  }}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                    questionCount === 3
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  3 QUESTIONS
                </button>
                <button
                  disabled={isAnswered}
                  onClick={() => {
                    setQuestionCount(5);
                    loadQuestions(5, topic);
                  }}
                  className={`px-2.5 py-1 rounded text-[9px] font-mono font-bold transition cursor-pointer ${
                    questionCount === 5
                      ? 'bg-sky-500 text-slate-950 font-black'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  5 QUESTIONS
                </button>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sky-400 uppercase tracking-wider">
                  QUESTION {currentIndex + 1} OF {questions.length}
                </span>
                <span className="text-slate-500">·</span>
                <span className="text-slate-300">
                  {Math.round(((currentIndex + (isAnswered ? 1 : 0)) / questions.length) * 100)}%
                </span>
              </div>
            </div>

            {/* Segmented Progress Bar */}
            <div
              className="grid gap-1.5 w-full"
              style={{ gridTemplateColumns: `repeat(${questions.length}, minmax(0, 1fr))` }}
            >
              {questions.map((_, qIdx) => {
                const isCurrent = qIdx === currentIndex;
                const isPast = qIdx < currentIndex;
                const isDoneAndCorrect =
                  (isPast || (isCurrent && isAnswered)) &&
                  answers[qIdx] === questions[qIdx].answer;
                const isDoneAndWrong =
                  (isPast || (isCurrent && isAnswered)) &&
                  answers[qIdx] !== questions[qIdx].answer;

                return (
                  <div
                    key={qIdx}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      isDoneAndCorrect
                        ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]'
                        : isDoneAndWrong
                        ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                        : isCurrent
                        ? 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.5)] animate-pulse'
                        : 'bg-slate-800'
                    }`}
                  />
                );
              })}
            </div>

            {/* Grammar Formula Micro-Tip */}
            <div className="p-2.5 rounded-xl bg-slate-950/80 border theme-border flex items-center justify-between gap-2">
              <span className="text-[9px] font-mono font-bold uppercase text-slate-400">
                RULE FORMULA:
              </span>
              <span className="text-[10px] font-mono font-bold text-sky-300 text-right truncate">
                {topic.formula}
              </span>
            </div>

            {/* Question Challenge Box */}
            <div className="bg-slate-950/90 border theme-border rounded-xl p-4 sm:p-5 flex flex-col gap-2.5 text-center shadow-inner">
              <span className="text-[9px] font-mono font-bold uppercase tracking-widest text-sky-400">
                CHOOSE THE CORRECT OPTION
              </span>
              <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.q}
              </h3>
            </div>

            {/* 4 Multiple Choice Options (Instant Click / Keypress) */}
            <div className="flex flex-col gap-2 w-full">
              {currentQuestion.options.map((opt, oIdx) => {
                const isSelected = answers[currentIndex] === opt;
                const isCorrect = opt === currentQuestion.answer;

                let optionStyle =
                  'bg-slate-950/60 border-slate-800 text-slate-200 hover:bg-sky-950/50 hover:border-sky-500 active:scale-[0.99]';
                if (isAnswered) {
                  if (isCorrect) {
                    optionStyle =
                      'bg-emerald-950/90 border-emerald-400 text-emerald-100 font-bold shadow-[0_0_15px_rgba(16,185,129,0.35)] scale-[1.01]';
                  } else if (isSelected) {
                    optionStyle =
                      'bg-rose-950/90 border-rose-500 text-rose-100 font-bold';
                  } else {
                    optionStyle =
                      'bg-slate-950/40 border-slate-900 text-slate-600 opacity-40';
                  }
                }

                const letter = String.fromCharCode(65 + oIdx);

                return (
                  <button
                    key={oIdx}
                    id={`quiz-opt-${currentIndex}-${oIdx}`}
                    disabled={isAnswered}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSelectOption(opt);
                    }}
                    className={`p-3.5 rounded-xl border text-left font-medium text-xs sm:text-sm flex items-center justify-between gap-3 transition-all cursor-pointer ${optionStyle}`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center shrink-0 border ${
                          isAnswered && isCorrect
                            ? 'bg-emerald-400 text-slate-950 border-emerald-300 font-black'
                            : isAnswered && isSelected
                            ? 'bg-rose-600 text-white border-rose-500'
                            : 'bg-slate-900 border-slate-700 text-slate-400'
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

            {/* Seamless Auto-Advance Feedback Banner with Auto-Progress Line */}
            {isAnswered && (
              <div
                onClick={handleImmediateAdvance}
                className="p-3.5 rounded-xl bg-sky-950/70 border border-sky-500/60 text-xs text-sky-100 leading-relaxed shadow-lg animate-in fade-in duration-200 cursor-pointer relative overflow-hidden"
              >
                {/* Auto-advance animated countdown progress indicator */}
                <div
                  className="absolute bottom-0 left-0 h-1 bg-sky-400"
                  style={{
                    width: '100%',
                    animation: `countdown ${
                      answers[currentIndex] === currentQuestion.answer ? '1.3s' : '1.8s'
                    } linear forwards`,
                  }}
                />

                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[9px] font-mono font-black uppercase text-sky-400 tracking-wider">
                    {answers[currentIndex] === currentQuestion.answer
                      ? 'EXCELLENT · RULE VERIFIED'
                      : 'GRAMMAR RULE NOTE'}
                  </span>
                  <span className="text-[9px] font-mono text-sky-300 font-bold">
                    {currentIndex === questions.length - 1
                      ? 'COMPLETING SPRINT →'
                      : 'NEXT QUESTION IN 1s [TAP TO SKIP] →'}
                  </span>
                </div>
                <p className="text-slate-200 text-xs">{currentQuestion.explanation}</p>
              </div>
            )}
          </div>
        ) : (
          /* Results Screen */
          <div className="flex-1 flex flex-col p-5 sm:p-7 gap-5 overflow-y-auto max-h-[75vh]">
            {/* Top Score Banner */}
            <div className="flex flex-col items-center justify-center text-center gap-3 py-2">
              <div
                className={`w-20 h-20 rounded-2xl border-2 flex flex-col items-center justify-center font-mono shadow-2xl ${
                  score === questions.length
                    ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_30px_rgba(52,211,153,0.35)]'
                    : score >= questions.length * 0.6
                    ? 'bg-sky-950/80 border-sky-400 text-sky-300 shadow-[0_0_30px_rgba(56,189,248,0.3)]'
                    : 'bg-rose-950/80 border-rose-500 text-rose-300'
                }`}
              >
                <span className="text-2xl font-black">
                  {score}/{questions.length}
                </span>
                <span className="text-[9px] font-bold">
                  {Math.round((score / questions.length) * 100)}%
                </span>
              </div>

              <div>
                <span
                  className={`text-[10px] font-mono font-black uppercase tracking-widest px-2.5 py-0.5 rounded border shadow-sm ${
                    score === questions.length
                      ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300'
                      : score >= questions.length * 0.6
                      ? 'bg-sky-950/80 border-sky-500 text-sky-300'
                      : 'bg-rose-950/80 border-rose-600 text-rose-300'
                  }`}
                >
                  {score === questions.length
                    ? 'PERFECT MASTERY'
                    : score >= questions.length * 0.6
                    ? 'STRONG PROFICIENCY'
                    : 'PRACTICE RECOMMENDED'}
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1.5">
                  {topic.name}
                </h3>
                <p className="text-xs text-slate-300 mt-0.5">
                  Earned <strong className="text-sky-400 font-mono">+{xpEarned} XP</strong> · Logged to Mastery Stats
                </p>
              </div>
            </div>

            {/* Grammar Rule Summary Card */}
            <div className="p-4 rounded-xl bg-slate-950/90 border theme-border flex flex-col gap-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-black uppercase text-sky-400">
                  GRAMMAR FORMULA RECAP
                </span>
                <span className="text-[9px] font-mono text-slate-400 uppercase">
                  {topic.category}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-white">{topic.formula}</p>
              <p className="text-xs italic text-slate-300">&ldquo;{topic.example}&rdquo;</p>
            </div>

            {/* Detailed Question Review Breakdown */}
            <div className="flex flex-col gap-2.5">
              <span className="text-[10px] font-mono font-black uppercase text-slate-400">
                CHALLENGE REVIEW ({questions.length} QUESTIONS):
              </span>
              {questions.map((q, idx) => {
                const userAns = answers[idx];
                const isCorrect = userAns === q.answer;

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-xl border flex flex-col gap-1.5 ${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-600/40 text-slate-200'
                        : 'bg-rose-950/40 border-rose-600/40 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                        QUESTION {idx + 1}
                      </span>
                      <span
                        className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded border ${
                          isCorrect
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-600'
                            : 'bg-rose-950 text-rose-300 border-rose-600'
                        }`}
                      >
                        {isCorrect ? 'CORRECT' : 'MISSED'}
                      </span>
                    </div>
                    <p className="text-xs font-bold text-white">{q.q}</p>
                    <div className="flex items-center gap-2 text-[11px]">
                      <span className="text-slate-400 font-mono">YOUR CHOICE:</span>
                      <span
                        className={`font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400 line-through'}`}
                      >
                        {userAns || 'No Answer'}
                      </span>
                      {!isCorrect && (
                        <>
                          <span className="text-slate-500 font-mono">→</span>
                          <span className="text-emerald-400 font-bold font-mono">
                            {q.answer}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-300 mt-1 leading-normal border-t border-slate-800/80 pt-1.5">
                      {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                id="quick-quiz-retake-btn"
                onClick={() => loadQuestions(questionCount, topic)}
                className="flex-1 py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md text-center"
              >
                RETAKE FRESH QUESTIONS [R]
              </button>
              <button
                id="quick-quiz-finish-btn"
                onClick={() => {
                  clearAutoAdvance();
                  onClose();
                }}
                className="flex-1 py-3 bg-slate-950 hover:bg-slate-800 text-slate-200 border theme-border font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer text-center"
              >
                DONE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
