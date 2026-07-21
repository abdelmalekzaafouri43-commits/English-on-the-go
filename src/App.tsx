import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Check, X, Award, Sparkles, Send, RefreshCw, Play, 
  HelpCircle, Trophy, BookOpen, Gamepad2, Wifi, WifiOff, CornerDownLeft, Undo, CheckSquare, Eye
} from 'lucide-react';
import { 
  QUIZ_SECTIONS, DEFAULT_QUIZZES, DEFAULT_CROSSWORDS, 
  Quiz, Question, Crossword, CrosswordClue 
} from './quizData';
import ConfettiEffect from './components/ConfettiEffect';

export default function App() {
  // --- Persistent User State ---
  const [score, setScore] = useState<number>(() => {
    const saved = localStorage.getItem('english_on_the_go_score');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [completedQuizzes, setCompletedQuizzes] = useState<Record<string, number[]>>(() => {
    // Schema: { sectionId: [completedQuizIndices] }
    const saved = localStorage.getItem('english_on_the_go_progress');
    return saved ? JSON.parse(saved) : {
      present: [],
      past: [],
      future: [],
      antonyms: [],
      synonyms: [],
      games: []
    };
  });

  // --- Network State ---
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [isApiRateLimited, setIsApiRateLimited] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);

  // --- Beautiful Custom Dialog/Alert State ---
  const [appAlert, setAppAlert] = useState<{
    show: boolean;
    title: string;
    message: string;
    type: 'success' | 'info';
  } | null>(null);

  // --- Layout State ---
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [selectedQuizIndex, setSelectedQuizIndex] = useState<number | null>(null);

  // --- Quiz Play State ---
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizTitle, setQuizTitle] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [quizCorrectAnswersCount, setQuizCorrectAnswersCount] = useState(0);
  const [isQuizFinished, setIsQuizFinished] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [isAIGeneratedQuiz, setIsAIGeneratedQuiz] = useState(false);

  // --- Crossword Play State ---
  const [crosswordData, setCrosswordData] = useState<Crossword | null>(null);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ r: number, c: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [crosswordChecked, setCrosswordChecked] = useState(false);
  const [isCrosswordLoading, setIsCrosswordLoading] = useState(false);
  const [isAIGeneratedCrossword, setIsAIGeneratedCrossword] = useState(false);
  const [activeClueText, setActiveClueText] = useState<string>('Select a cell to see clue');
  const [triggerConfetti, setTriggerConfetti] = useState(false);

  // --- AI Tutor Chat State ---
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'model', text: string, time: string }>>([
    { 
      role: 'model', 
      text: "Hello! I am your AI English Tutor from Mr.Zaafouri Labs. Need help with the Present Perfect tense, synonyms, or a crossword clue today? Ask me anything!", 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- Check Server Status ---
  const checkStatus = async () => {
    try {
      const res = await fetch('/api/status');
      const data = await res.json();
      setIsServerOnline(data.status === 'online');
      setIsApiRateLimited(!!data.apiRateLimited);
    } catch (e) {
      setIsServerOnline(false);
      setIsApiRateLimited(false);
    } finally {
      setIsCheckingStatus(false);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 15000); // check status every 15s
    return () => clearInterval(interval);
  }, []);

  // Save progress to local storage
  useEffect(() => {
    localStorage.setItem('english_on_the_go_score', score.toString());
  }, [score]);

  useEffect(() => {
    localStorage.setItem('english_on_the_go_progress', JSON.stringify(completedQuizzes));
  }, [completedQuizzes]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isChatLoading]);

  // --- Course Progress Calculations ---
  // Total of 36 quizzes (6 per section * 6 sections)
  const totalQuizzesCount = 36;
  const completedCount = Object.keys(completedQuizzes).reduce((acc, key) => {
    return acc + (completedQuizzes[key]?.length || 0);
  }, 0);
  const progressPercentage = Math.round((completedCount / totalQuizzesCount) * 100);

  // Calculate mastery per section
  const getSectionMastery = (sectionId: string) => {
    const completed = completedQuizzes[sectionId]?.length || 0;
    return Math.round((completed / 6) * 100);
  };

  // --- Chat Submission ---
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userText = chatInput;
    setChatInput('');
    
    const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessages = [...chatMessages, { role: 'user' as const, text: userText, time: timeString }];
    setChatMessages(newMessages);
    setIsChatLoading(true);

    // Context definition
    let activeSectionName = '';
    if (selectedSection) {
      const sec = QUIZ_SECTIONS.find(s => s.id === selectedSection);
      if (sec) activeSectionName = sec.title;
    }
    const currentQuizContext = selectedSection && selectedQuizIndex !== null ? {
      section: activeSectionName,
      quizNum: selectedQuizIndex,
      title: selectedSection === 'games' 
        ? (crosswordData?.title || `Level ${selectedQuizIndex + 1}`)
        : (quizTitle || `Quiz ${selectedQuizIndex + 1}`)
    } : null;

    try {
      const response = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages,
          currentQuizContext
        })
      });

      const data = await response.json();
      if (response.ok && data.text) {
        setChatMessages(prev => [...prev, {
          role: 'model',
          text: data.text,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'Server error');
      }
    } catch (error: any) {
      // Offline fallback tutor answers
      setTimeout(() => {
        let offlineAnswer = "I'm currently operating in offline backup mode. ";
        if (userText.toLowerCase().includes('present')) {
          offlineAnswer += "In the Simple Present, we use verb+s for he/she/it. Example: 'He walks to Mr. Zaafouri Labs.'";
        } else if (userText.toLowerCase().includes('past')) {
          offlineAnswer += "In the Simple Past, we add '-ed' to regular verbs. Example: 'I studied English yesterday.' Irregular verbs change form: 'go' becomes 'went'.";
        } else if (userText.toLowerCase().includes('future')) {
          offlineAnswer += "We express the future using 'will' for spontaneous decisions ('I will help you') and 'going to' for plans ('I am going to study English').";
        } else if (userText.toLowerCase().includes('antonym')) {
          offlineAnswer += "Antonyms are opposites! For example, the antonym of 'generous' is 'stingy', and 'brave' is 'cowardly'.";
        } else if (userText.toLowerCase().includes('synonym')) {
          offlineAnswer += "Synonyms are words with the same meaning! For example, a synonym of 'gaze' is 'stare', and 'diligent' is 'hardworking'.";
        } else {
          offlineAnswer += "That is an excellent English question! Please toggle the AI online server to get a real-time, personalized explanation from me.";
        }

        setChatMessages(prev => [...prev, {
          role: 'model',
          text: offlineAnswer,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      }, 800);
    } finally {
      setIsChatLoading(false);
    }
  };

  // --- Quiz Action: Load a Quiz ---
  const handleStartQuiz = async (sectionId: string, quizIdx: number, forceAI: boolean = false) => {
    setSelectedSection(sectionId);
    setSelectedQuizIndex(quizIdx);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setQuizCorrectAnswersCount(0);
    setIsQuizFinished(false);

    if (forceAI && isServerOnline) {
      setIsQuizLoading(true);
      setIsAIGeneratedQuiz(true);
      try {
        const sec = QUIZ_SECTIONS.find(s => s.id === sectionId);
        const res = await fetch('/api/generate-quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sectionId,
            sectionName: sec?.title || sectionId,
            quizIndex: quizIdx
          })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.questions && data.questions.length > 0) {
            setQuizQuestions(data.questions);
            setQuizTitle(data.title || `AI Quiz: Level ${quizIdx + 1}`);
            setIsQuizLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to fetch AI quiz, falling back to offline', e);
      }
    }

    // Default Offline Quiz Fallback
    setIsAIGeneratedQuiz(false);
    setIsQuizLoading(false);
    const quizzes = DEFAULT_QUIZZES[sectionId];
    if (quizzes && quizzes[quizIdx]) {
      setQuizQuestions(quizzes[quizIdx].questions);
      setQuizTitle(quizzes[quizIdx].title);
    } else {
      // In case we don't have static level data, fallback
      const fallbackQuiz = DEFAULT_QUIZZES[sectionId]?.[0] || DEFAULT_QUIZZES['present'][0];
      setQuizQuestions(fallbackQuiz.questions);
      setQuizTitle(`${QUIZ_SECTIONS.find(s => s.id === sectionId)?.title} - Quiz ${quizIdx + 1}`);
    }
  };

  // --- Quiz Action: Answer Question ---
  const handleAnswerQuestion = (optionIdx: number) => {
    if (isAnswered) return;
    setSelectedOption(optionIdx);
    setIsAnswered(true);

    const isCorrect = optionIdx === quizQuestions[currentQuestionIndex].answerIndex;
    if (isCorrect) {
      setQuizCorrectAnswersCount(prev => prev + 1);
      setScore(prev => prev + 100);
    } else {
      setScore(prev => Math.max(0, prev - 20)); // tiny deduction to make it interesting
    }
  };

  // --- Quiz Action: Next Question ---
  const handleNextQuestion = () => {
    setSelectedOption(null);
    setIsAnswered(false);
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsQuizFinished(true);
      setTriggerConfetti(true);
      // Mark quiz as completed
      if (selectedSection) {
        setCompletedQuizzes(prev => {
          const completedList = prev[selectedSection] || [];
          if (!completedList.includes(selectedQuizIndex!)) {
            const updated = {
              ...prev,
              [selectedSection]: [...completedList, selectedQuizIndex!]
            };
            return updated;
          }
          return prev;
        });
      }
    }
  };

  // --- Crossword Action: Load Crossword ---
  const handleStartCrossword = async (levelIdx: number, forceAI: boolean = false) => {
    setSelectedSection('games');
    setSelectedQuizIndex(levelIdx);
    setCrosswordChecked(false);
    setSelectedCell(null);
    setActiveClueText('Select a cell to see clue');

    let selectedPuzzle: Crossword;

    if (forceAI && isServerOnline) {
      setIsCrosswordLoading(true);
      setIsAIGeneratedCrossword(true);
      try {
        const res = await fetch('/api/generate-crossword', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ levelIndex: levelIdx })
        });
        if (res.ok) {
          const data = await res.json();
          if (data.clues && data.clues.length > 0) {
            selectedPuzzle = data;
            setCrosswordData(selectedPuzzle);
            initializeCrosswordGrid(selectedPuzzle);
            setIsCrosswordLoading(false);
            return;
          }
        }
      } catch (e) {
        console.error('Failed to generate AI crossword, using offline default', e);
      }
    }

    // Default puzzle
    setIsAIGeneratedCrossword(false);
    setIsCrosswordLoading(false);
    selectedPuzzle = DEFAULT_CROSSWORDS[levelIdx] || DEFAULT_CROSSWORDS[0];
    setCrosswordData(selectedPuzzle);
    initializeCrosswordGrid(selectedPuzzle);
  };

  const initializeCrosswordGrid = (puzzle: Crossword) => {
    const size = puzzle.size;
    const grid: string[][] = Array(size).fill(null).map(() => Array(size).fill(''));
    setUserGrid(grid);
  };

  // Compute cell configuration from current crossword clues
  const getCellConfig = (r: number, c: number) => {
    if (!crosswordData) return { blocked: true, number: null, solution: '' };

    let blocked = true;
    let number: number | null = null;
    let solution = '';

    for (const clue of crosswordData.clues) {
      const L = clue.answer.length;
      const startR = clue.row;
      const startC = clue.col;

      for (let i = 0; i < L; i++) {
        const cellR = clue.direction === 'across' ? startR : startR + i;
        const cellC = clue.direction === 'across' ? startC + i : startC;

        if (cellR === r && cellC === c) {
          blocked = false;
          solution = clue.answer[i].toUpperCase();
          if (i === 0) {
            number = clue.number;
          }
        }
      }
    }

    return { blocked, number, solution };
  };

  // Tap a cell in crossword
  const handleCellClick = (r: number, c: number) => {
    const config = getCellConfig(r, c);
    if (config.blocked) return;

    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
      // Toggle direction if clicking same cell
      setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
    } else {
      setSelectedCell({ r, c });
    }
  };

  // Find active clue text based on selected cell and direction
  useEffect(() => {
    if (!selectedCell || !crosswordData) {
      setActiveClueText('Select a cell to see clue');
      return;
    }

    const { r, c } = selectedCell;
    const clue = crosswordData.clues.find(cl => {
      // Check if the cell is covered by this clue
      const L = cl.answer.length;
      for (let i = 0; i < L; i++) {
        const cellR = cl.direction === 'across' ? cl.row : cl.row + i;
        const cellC = cl.direction === 'across' ? cl.col + i : cl.col;
        if (cellR === r && cellC === c && cl.direction === selectedDirection) {
          return true;
        }
      }
      return false;
    });

    // If no clue matches the selected direction, try the other direction
    if (!clue) {
      const altDirection = selectedDirection === 'across' ? 'down' : 'across';
      const altClue = crosswordData.clues.find(cl => {
        const L = cl.answer.length;
        for (let i = 0; i < L; i++) {
          const cellR = cl.direction === 'across' ? cl.row : cl.row + i;
          const cellC = cl.direction === 'across' ? cl.col + i : cl.col;
          if (cellR === r && cellC === c && cl.direction === altDirection) {
            return true;
          }
        }
        return false;
      });

      if (altClue) {
        setSelectedDirection(altDirection);
        setActiveClueText(`[${altDirection.toUpperCase()}] ${altClue.number}. ${altClue.clue}`);
      } else {
        setActiveClueText('No clue for this cell');
      }
    } else {
      setActiveClueText(`[${selectedDirection.toUpperCase()}] ${clue.number}. ${clue.clue}`);
    }
  }, [selectedCell, selectedDirection, crosswordData]);

  // Input a letter in crossword
  const handleKeyPress = (letter: string) => {
    if (!selectedCell || !crosswordData) return;
    const { r, c } = selectedCell;

    const nextGrid = [...userGrid.map(row => [...row])];
    
    if (letter === 'BACKSPACE') {
      nextGrid[r][c] = '';
      setUserGrid(nextGrid);
      // Auto move back if possible
      moveSelection(-1);
    } else {
      nextGrid[r][c] = letter.toUpperCase();
      setUserGrid(nextGrid);
      // Auto advance to next cell
      moveSelection(1);
    }
  };

  // Move crossword focus cursor
  const moveSelection = (step: number) => {
    if (!selectedCell || !crosswordData) return;
    const { r, c } = selectedCell;
    const size = crosswordData.size;

    let nextR = r;
    let nextC = c;

    if (selectedDirection === 'across') {
      nextC += step;
    } else {
      nextR += step;
    }

    // Check bounds and if the next cell is active
    if (nextR >= 0 && nextR < size && nextC >= 0 && nextC < size) {
      const nextConfig = getCellConfig(nextR, nextC);
      if (!nextConfig.blocked) {
        setSelectedCell({ r: nextR, c: nextC });
      }
    }
  };

  // Physical keyboard support for crossword
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedSection !== 'games' || selectedQuizIndex === null) return;
      if (!selectedCell) return;

      // Ignore when typing inside chat box
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'BACKSPACE') {
        handleKeyPress('BACKSPACE');
      } else if (key.length === 1 && key >= 'A' && key <= 'Z') {
        handleKeyPress(key);
      } else if (key === 'ARROWLEFT') {
        setSelectedDirection('across');
        moveSelection(-1);
      } else if (key === 'ARROWRIGHT') {
        setSelectedDirection('across');
        moveSelection(1);
      } else if (key === 'ARROWUP') {
        setSelectedDirection('down');
        moveSelection(-1);
      } else if (key === 'ARROWDOWN') {
        setSelectedDirection('down');
        moveSelection(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedCell, selectedDirection, selectedSection, selectedQuizIndex, userGrid]);

  // Check crossword solutions
  const checkCrossword = () => {
    if (!crosswordData) return;
    setCrosswordChecked(true);

    let allCorrect = true;
    let countCorrect = 0;
    let countTotalCells = 0;

    const size = crosswordData.size;
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const config = getCellConfig(r, c);
        if (!config.blocked) {
          countTotalCells++;
          const userVal = userGrid[r]?.[c]?.toUpperCase() || '';
          if (userVal === config.solution) {
            countCorrect++;
          } else {
            allCorrect = false;
          }
        }
      }
    }

    if (allCorrect) {
      setScore(prev => prev + 500); // 500 pts bonus for complete crossword!
      // Add to completed quizzes
      setCompletedQuizzes(prev => {
        const completedList = prev.games || [];
        if (!completedList.includes(selectedQuizIndex!)) {
          const updated = {
            ...prev,
            games: [...completedList, selectedQuizIndex!]
          };
          return updated;
        }
        return prev;
      });
      setTriggerConfetti(true);
      setAppAlert({
        show: true,
        title: "Puzzle Solved!",
        message: `🎉 Congratulations! You solved the "${crosswordData.title}" crossword puzzle! You've earned a +500 Score bonus!`,
        type: 'success'
      });
    } else {
      const percent = Math.round((countCorrect / countTotalCells) * 100);
      setAppAlert({
        show: true,
        title: "Keep Going!",
        message: `You got ${countCorrect} out of ${countTotalCells} cells correct (${percent}%). Incorrect cells are highlighted in red and correct cells in green!`,
        type: 'info'
      });
    }
  };

  // Reveal crossword answers
  const revealCrossword = () => {
    if (!crosswordData) return;
    const size = crosswordData.size;
    const solvedGrid = Array(size).fill(null).map(() => Array(size).fill(''));

    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const config = getCellConfig(r, c);
        if (!config.blocked) {
          solvedGrid[r][c] = config.solution;
        }
      }
    }
    setUserGrid(solvedGrid);
    setCrosswordChecked(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F1F5F9] p-4 md:p-6 text-slate-800">
      
      {/* HEADER BAR */}
      <header className="w-full max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <span className="text-3xl">✈️</span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-blue-600 tracking-tight">
              ENGLISH ON THE GO
            </h1>
          </div>
          <span className="text-xs font-semibold tracking-wider text-slate-500 block sm:pl-9 uppercase">
            Mr. Zaafouri Labs
          </span>
        </div>

        {/* Status and Score Panel */}
        <div className="flex items-center gap-4">
          {/* Server Status Pill */}
          <div className="bg-white border border-slate-200 rounded-full px-3.5 py-1.5 flex items-center gap-2 text-[11px] font-bold shadow-xs">
            {isCheckingStatus ? (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
              </span>
            ) : isApiRateLimited ? (
              <>
                <Wifi size={14} className="text-amber-500 animate-bounce" />
                <span className="text-amber-600">AI LIMIT EXCEEDED</span>
              </>
            ) : isServerOnline ? (
              <>
                <Wifi size={14} className="text-blue-600 animate-pulse" />
                <span className="text-blue-600">AI SERVER ONLINE</span>
              </>
            ) : (
              <>
                <WifiOff size={14} className="text-slate-500" />
                <span className="text-slate-500">OFFLINE SIMULATION</span>
              </>
            )}
          </div>

          {/* Dynamic Scoreboard */}
          <div className="bg-white px-5 py-2 rounded-2xl font-black text-blue-600 shadow-md border border-blue-100 flex items-center gap-2 text-sm md:text-base">
            <span>🏆</span> SCORE: {score.toLocaleString()}
          </div>
        </div>
      </header>

      {/* MAIN TWO-COLUMN CONTAINER */}
      <div className="w-full max-w-7xl mx-auto flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch mb-6">
        
        {/* LEFT COLUMN: ACTIVE INTERACTIVE QUIZ / DASHBOARD STAGE */}
        <main className="lg:col-span-8 flex flex-col justify-between">
          
          {/* STAGE CONTAINER WITH NEUROMORPHIC BASE */}
          <div className="neuro-flat p-6 flex-1 flex flex-col justify-between min-h-[500px]">
            
            {/* 1. SECTIONS DASHBOARD VIEW */}
            {selectedSection === null && (
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h2 className="text-xl font-bold mb-1 text-slate-700 flex items-center gap-2">
                    🎓 Learning Categories
                  </h2>
                  <p className="text-xs text-slate-500 mb-6">
                    Select a section to start master quizzes or crossword challenges.
                  </p>
                </div>

                {/* 3x2 Grid of Sections */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1 items-center">
                  {QUIZ_SECTIONS.map((sec) => {
                    const mastery = getSectionMastery(sec.id);
                    return (
                      <div 
                        key={sec.id}
                        id={`category-${sec.id}`}
                        onClick={() => setSelectedSection(sec.id)}
                        className="neuro-flat neuro-flat-hover p-5 flex flex-col items-center justify-center text-center cursor-pointer border border-transparent transition-all duration-300 group min-h-[140px]"
                      >
                        <span className="text-4xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
                          {sec.icon}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">
                          {sec.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 mt-1">
                          {sec.id === 'games' ? '6 Levels' : '6 Quizzes'}
                        </p>
                        
                        {/* Progress Indicator for Card */}
                        <div className="w-full bg-slate-200 h-1.5 rounded-full mt-4 overflow-hidden shadow-inner">
                          <div 
                            className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                            style={{ width: `${mastery}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-blue-600 font-extrabold mt-1.5">
                          {mastery}% Completed
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 bg-blue-50/60 border border-blue-100 p-4 rounded-xl text-xs text-center font-semibold text-blue-700 flex items-center justify-center gap-2">
                  <span>💡</span> Ask the AI Tutor on the right about any grammar topic to get live tips!
                </div>
              </div>
            )}

            {/* 2. QUIZ SELECTOR VIEW */}
            {selectedSection !== null && selectedQuizIndex === null && (
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-6">
                  <button 
                    onClick={() => setSelectedSection(null)}
                    className="neuro-button px-4 py-2 text-xs font-bold text-slate-600 flex items-center gap-2"
                  >
                    <ArrowLeft size={14} /> Back to Home
                  </button>
                  <div className="text-right">
                    <span className="text-xs uppercase font-extrabold text-slate-400">Section</span>
                    <h2 className="text-lg font-black text-blue-600">
                      {QUIZ_SECTIONS.find(s => s.id === selectedSection)?.title}
                    </h2>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 flex-1 items-center">
                  {Array.from({ length: 6 }).map((_, idx) => {
                    const isCompleted = completedQuizzes[selectedSection]?.includes(idx);
                    return (
                      <div 
                        key={idx}
                        id={`quiz-card-${idx}`}
                        className={`neuro-flat p-5 flex flex-col justify-between h-[160px] relative overflow-hidden border ${
                          isCompleted ? 'border-green-100 bg-emerald-50/10' : 'border-transparent'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                              {selectedSection === 'games' ? `LEVEL ${idx + 1}` : `QUIZ ${idx + 1}`}
                            </span>
                            {isCompleted && (
                              <span className="text-xs font-black text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-md shadow-sm">
                                <Check size={12} strokeWidth={3} /> DONE
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-sm text-slate-700 line-clamp-2 mt-1">
                            {selectedSection === 'games' 
                              ? DEFAULT_CROSSWORDS[idx]?.title || `Crossword Puzzle #${idx + 1}`
                              : DEFAULT_QUIZZES[selectedSection]?.[idx]?.title || `Quiz Category #${idx + 1}`
                            }
                          </h4>
                        </div>

                        {/* Button Block */}
                        <div className="flex gap-2 mt-3">
                          <button 
                            onClick={() => {
                              if (selectedSection === 'games') {
                                handleStartCrossword(idx, false);
                              } else {
                                handleStartQuiz(selectedSection, idx, false);
                              }
                            }}
                            className="flex-1 neuro-button py-2 px-3 text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-white flex items-center justify-center gap-1.5"
                          >
                            <Play size={12} fill="currentColor" /> Play
                          </button>

                          {isServerOnline && (
                            <button 
                              onClick={() => {
                                if (selectedSection === 'games') {
                                  handleStartCrossword(idx, true);
                                } else {
                                  handleStartQuiz(selectedSection, idx, true);
                                }
                              }}
                              className="bg-blue-50 border border-blue-100 text-blue-600 px-3 py-2 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors duration-200 flex items-center gap-1 rounded-lg"
                              title="Generate a brand new dynamic AI challenge online!"
                            >
                              <Sparkles size={12} className="animate-pulse" /> AI
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3 items-center justify-between bg-blue-50/60 border border-blue-100/80 p-4 rounded-xl text-xs font-semibold">
                  <div className="text-slate-600">
                    💡 <span className="text-blue-600">Online Mode enabled:</span> Play the default static quiz, or click the <span className="text-blue-600">AI</span> button to generate a brand new real-time challenge!
                  </div>
                  {isServerOnline && (
                    <span className="text-[10px] text-blue-600 font-extrabold uppercase bg-blue-100/60 px-2 py-1 rounded">
                      Generative AI available
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 3. ACTIVE GRAMMAR QUIZ INTERFACE */}
            {selectedSection !== null && selectedSection !== 'games' && selectedQuizIndex !== null && (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Quiz Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-4 mb-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedQuizIndex(null)}
                      className="neuro-button p-2 text-slate-600 hover:text-blue-600"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-wide text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                          Level {selectedQuizIndex + 1}
                        </span>
                        {isAIGeneratedQuiz && (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Sparkles size={10} /> AI GENERATED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-800 line-clamp-1 mt-0.5">
                        {quizTitle}
                      </h3>
                    </div>
                  </div>

                  {isServerOnline && !isQuizFinished && (
                    <button 
                      onClick={() => handleStartQuiz(selectedSection, selectedQuizIndex, true)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-98 flex items-center gap-1.5"
                    >
                      <RefreshCw size={12} className={isQuizLoading ? 'animate-spin' : ''} />
                      Generate New Questions
                    </button>
                  )}
                </div>

                {isQuizLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm font-bold text-blue-600 animate-pulse-soft">
                      Designing a personalized AI English quiz for you...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Mr. Zaafouri Labs Server generating...</p>
                  </div>
                ) : isQuizFinished ? (
                  /* Quiz Finish Summary Screen */
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center shadow-md border border-amber-200 mb-4">
                      <Trophy size={42} className="text-amber-500 animate-bounce" />
                    </div>
                    <h4 className="text-2xl font-black text-slate-800">Quiz Completed!</h4>
                    <p className="text-sm text-slate-500 mt-1">Excellent effort at English on the go!</p>

                    <div className="grid grid-cols-2 gap-4 mt-6 w-full max-w-sm">
                      <div className="neuro-flat p-4">
                        <span className="text-xs text-slate-400 font-bold uppercase block">Correct Answers</span>
                        <span className="text-2xl font-black text-emerald-600">
                          {quizCorrectAnswersCount} / {quizQuestions.length}
                        </span>
                      </div>
                      <div className="neuro-flat p-4">
                        <span className="text-xs text-slate-400 font-bold uppercase block">Score Bonus</span>
                        <span className="text-2xl font-black text-blue-600">
                          +{quizCorrectAnswersCount * 100}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 mt-8 w-full max-w-sm">
                      <button 
                        onClick={() => handleStartQuiz(selectedSection, selectedQuizIndex, isAIGeneratedQuiz)}
                        className="flex-1 neuro-button py-3 text-sm font-bold text-slate-700"
                      >
                        Retake Quiz
                      </button>
                      <button 
                        onClick={() => setSelectedQuizIndex(null)}
                        className="flex-1 bg-blue-600 text-white font-extrabold rounded-xl py-3 text-sm shadow-md hover:bg-blue-700 transition-colors"
                      >
                        Choose Level
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Active Quiz Questions Step */
                  <div className="flex-1 flex flex-col justify-between gap-6">
                    <div>
                      {/* Quest step indicator and mini-bar */}
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-xs font-bold text-slate-400">
                          Question {currentQuestionIndex + 1} of {quizQuestions.length}
                        </span>
                        <span className="text-xs font-bold text-blue-600">
                          {Math.round(((currentQuestionIndex) / quizQuestions.length) * 100)}% Done
                        </span>
                      </div>
                      
                      <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden shadow-inner mb-6">
                        <div 
                          className="bg-gradient-to-r from-blue-400 to-blue-600 h-full rounded-full transition-all duration-300" 
                          style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                        />
                      </div>

                      {/* Question Text Box */}
                      <div className="neuro-inset p-5 mb-6 text-center">
                        <p className="text-base md:text-lg font-extrabold text-slate-800 leading-relaxed">
                          {quizQuestions[currentQuestionIndex]?.question}
                        </p>
                      </div>

                      {/* Options List */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {quizQuestions[currentQuestionIndex]?.options.map((opt, oIdx) => {
                          const isSelected = selectedOption === oIdx;
                          const isCorrect = oIdx === quizQuestions[currentQuestionIndex].answerIndex;
                          
                          let btnClass = "neuro-button text-left font-bold text-sm text-slate-700 py-3.5 px-4 flex justify-between items-center ";
                          
                          if (isAnswered) {
                            if (isCorrect) {
                              btnClass += "bg-emerald-50 text-emerald-700 border border-emerald-300 shadow-none";
                            } else if (isSelected) {
                              btnClass += "bg-rose-50 text-rose-700 border border-rose-300 shadow-none";
                            } else {
                              btnClass += "opacity-60 pointer-events-none";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              disabled={isAnswered}
                              onClick={() => handleAnswerQuestion(oIdx)}
                              className={btnClass}
                            >
                              <span>{opt}</span>
                              {isAnswered && isCorrect && <Check size={16} strokeWidth={3} className="text-emerald-600" />}
                              {isAnswered && isSelected && !isCorrect && <X size={16} strokeWidth={3} className="text-rose-600" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanations block */}
                    {isAnswered && (
                      <div className="glass p-4 mt-2 transition-all duration-300">
                        <div className="flex items-center gap-2 text-xs font-bold mb-1">
                          {selectedOption === quizQuestions[currentQuestionIndex].answerIndex ? (
                            <span className="text-emerald-600">🎉 CORRECT ANSWER</span>
                          ) : (
                            <span className="text-rose-600">❌ INCORRECT ANSWER</span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {quizQuestions[currentQuestionIndex]?.explanation}
                        </p>

                        <div className="flex justify-end mt-4">
                          <button
                            onClick={handleNextQuestion}
                            className="bg-blue-600 text-white font-extrabold text-xs px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors"
                          >
                            {currentQuestionIndex < quizQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. ACTIVE CROSSWORD PUZZLE INTERFACE */}
            {selectedSection === 'games' && selectedQuizIndex !== null && (
              <div className="flex-1 flex flex-col justify-between">
                
                {/* Crossword Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200/60 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setSelectedQuizIndex(null)}
                      className="neuro-button p-2 text-slate-600 hover:text-blue-600"
                    >
                      <ArrowLeft size={16} />
                    </button>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-black tracking-wide text-blue-600 uppercase bg-blue-50 px-2 py-0.5 rounded">
                          Level {selectedQuizIndex + 1}
                        </span>
                        {isAIGeneratedCrossword && (
                          <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded flex items-center gap-1">
                            <Sparkles size={10} /> AI GENERATED
                          </span>
                        )}
                      </div>
                      <h3 className="text-base font-black text-slate-800 line-clamp-1 mt-0.5">
                        {crosswordData?.title || 'Crossword'}
                      </h3>
                    </div>
                  </div>

                  {isServerOnline && (
                    <button 
                      onClick={() => handleStartCrossword(selectedQuizIndex, true)}
                      className="bg-white border border-slate-200 hover:bg-slate-50 text-blue-600 rounded-lg px-3.5 py-1.5 text-xs font-bold transition-all shadow-sm active:scale-98 flex items-center gap-1.5"
                    >
                      <RefreshCw size={12} className={isCrosswordLoading ? 'animate-spin' : ''} />
                      Generate New Crossword
                    </button>
                  )}
                </div>

                {isCrosswordLoading ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                    <p className="text-sm font-bold text-blue-600 animate-pulse-soft">
                      Designing an intersecting crossword puzzle in real-time...
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Mr. Zaafouri Labs server creating layout...</p>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col lg:grid lg:grid-cols-12 gap-6">
                    
                    {/* Crossword Interactive Board (Left in Sub-grid) */}
                    <div className="lg:col-span-7 flex flex-col items-center justify-center">
                      <div 
                        className="bg-slate-300 p-2 rounded-2xl shadow-inner inline-block"
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${crosswordData?.size || 8}, minmax(0, 1fr))`,
                          gap: '2px',
                          maxWidth: '100%'
                        }}
                      >
                        {Array.from({ length: crosswordData?.size || 8 }).map((_, rIdx) => {
                          return Array.from({ length: crosswordData?.size || 8 }).map((_, cIdx) => {
                            const config = getCellConfig(rIdx, cIdx);
                            const userVal = userGrid[rIdx]?.[cIdx] || '';
                            const isSelected = selectedCell?.r === rIdx && selectedCell?.c === cIdx;
                            
                            if (config.blocked) {
                              return (
                                <div 
                                  key={`${rIdx}-${cIdx}`} 
                                  className="aspect-square w-8 sm:w-10 md:w-11 bg-slate-800 rounded-md shadow-inner"
                                />
                              );
                            }

                            // Calculate correctness colors when checked
                            let cellBg = "bg-white";
                            let textColor = "text-slate-800";
                            
                            if (isSelected) {
                              cellBg = "bg-blue-100";
                            } else if (crosswordChecked && userVal) {
                              if (userVal === config.solution) {
                                cellBg = "bg-emerald-100";
                                textColor = "text-emerald-800";
                              } else {
                                cellBg = "bg-rose-100";
                                textColor = "text-rose-800";
                              }
                            }

                            return (
                              <div
                                key={`${rIdx}-${cIdx}`}
                                onClick={() => handleCellClick(rIdx, cIdx)}
                                className={`aspect-square w-8 sm:w-10 md:w-11 ${cellBg} relative rounded-md border border-slate-300 flex items-center justify-center cursor-pointer select-none font-bold text-sm sm:text-base md:text-lg transition-all duration-150 shadow-sm ${
                                  isSelected ? 'ring-2 ring-blue-500 scale-102 z-10' : ''
                                }`}
                              >
                                {/* Cell label corner number */}
                                {config.number && (
                                  <span className="absolute top-0.5 left-0.5 text-[8px] sm:text-[10px] leading-none text-slate-400">
                                    {config.number}
                                  </span>
                                )}
                                <span className={textColor}>{userVal}</span>
                              </div>
                            );
                          });
                        })}
                      </div>

                      {/* On-Screen Keypad for Mobile Crosswords */}
                      <div className="w-full max-w-sm mt-4">
                        <div className="grid grid-cols-10 gap-1 mb-1">
                          {['Q','W','E','R','T','Y','U','I','O','P'].map(k => (
                            <button 
                              key={k} 
                              onClick={() => handleKeyPress(k)}
                              className="bg-white hover:bg-slate-100 active:bg-blue-500 active:text-white rounded py-1.5 font-bold text-xs shadow-sm border border-slate-200"
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-10 gap-1 mb-1 px-2">
                          {['A','S','D','F','G','H','J','K','L'].map(k => (
                            <button 
                              key={k} 
                              onClick={() => handleKeyPress(k)}
                              className="bg-white hover:bg-slate-100 active:bg-blue-500 active:text-white rounded py-1.5 font-bold text-xs shadow-sm border border-slate-200 col-span-1"
                            >
                              {k}
                            </button>
                          ))}
                        </div>
                        <div className="grid grid-cols-10 gap-1">
                          <button 
                            onClick={() => handleKeyPress('BACKSPACE')}
                            className="bg-slate-200 hover:bg-slate-300 rounded py-1.5 font-bold text-xs shadow-sm border border-slate-300 col-span-2 text-slate-700"
                          >
                            ⌫
                          </button>
                          {['Z','X','C','V','B','N','M'].map(k => (
                            <button 
                              key={k} 
                              onClick={() => handleKeyPress(k)}
                              className="bg-white hover:bg-slate-100 active:bg-blue-500 active:text-white rounded py-1.5 col-span-1 font-bold text-xs shadow-sm border border-slate-200"
                            >
                              {k}
                            </button>
                          ))}
                          <button 
                            onClick={() => {
                              // Deselect
                              setSelectedCell(null);
                            }}
                            className="bg-blue-100 text-blue-700 hover:bg-blue-200 rounded py-1.5 font-extrabold text-xs shadow-sm border border-blue-200 col-span-2"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Clues Pane (Right in Sub-grid) */}
                    <div className="lg:col-span-5 flex flex-col justify-between">
                      <div>
                        {/* Selected Clue Display Banner */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mb-4 text-xs font-bold text-blue-700 flex items-start gap-2 min-h-[50px]">
                          <span>📌</span>
                          <span>{activeClueText}</span>
                        </div>

                        {/* List of All Clues */}
                        <div className="max-h-[220px] overflow-y-auto space-y-3 pr-2 border-r border-slate-200/50">
                          <div>
                            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Across Clues</span>
                            <div className="space-y-1">
                              {crosswordData?.clues.filter(c => c.direction === 'across').map(c => (
                                <div 
                                  key={c.number} 
                                  onClick={() => {
                                    setSelectedDirection('across');
                                    setSelectedCell({ r: c.row, c: c.col });
                                  }}
                                  className={`text-xs p-1.5 rounded cursor-pointer transition-colors ${
                                    selectedDirection === 'across' && selectedCell?.r === c.row && selectedCell?.c === c.col
                                      ? 'bg-blue-50 text-blue-600 font-bold'
                                      : 'hover:bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <span className="font-extrabold">{c.number}.</span> {c.clue}
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="pt-2">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase mb-1">Down Clues</span>
                            <div className="space-y-1">
                              {crosswordData?.clues.filter(c => c.direction === 'down').map(c => (
                                <div 
                                  key={c.number} 
                                  onClick={() => {
                                    setSelectedDirection('down');
                                    setSelectedCell({ r: c.row, c: c.col });
                                  }}
                                  className={`text-xs p-1.5 rounded cursor-pointer transition-colors ${
                                    selectedDirection === 'down' && selectedCell?.r === c.row && selectedCell?.c === c.col
                                      ? 'bg-blue-50 text-blue-600 font-bold'
                                      : 'hover:bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  <span className="font-extrabold">{c.number}.</span> {c.clue}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Control Panel buttons */}
                      <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-200">
                        <button 
                          onClick={checkCrossword}
                          className="bg-blue-600 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-sm hover:bg-blue-700 transition-colors"
                        >
                          <CheckSquare size={14} /> Check Puzzle
                        </button>
                        <button 
                          onClick={revealCrossword}
                          className="neuro-button text-slate-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-1"
                        >
                          <Eye size={14} /> Reveal Clues
                        </button>
                        <button 
                          onClick={() => {
                            if (crosswordData) initializeCrosswordGrid(crosswordData);
                            setCrosswordChecked(false);
                          }}
                          className="neuro-button text-slate-500 font-bold py-2 col-span-2 text-xs flex items-center justify-center gap-1"
                        >
                          <Undo size={14} /> Clear Answers
                        </button>
                      </div>

                    </div>

                  </div>
                )}
              </div>
            )}

          </div>
        </main>

        {/* RIGHT COLUMN: FIGMA BLUE-AND-WHITE AI TUTOR CHAT COMPANION */}
        <aside className="lg:col-span-4 bg-white border border-slate-200/80 flex flex-col overflow-hidden shadow-sm rounded-2xl h-[550px] lg:h-[680px]">
          
          {/* Tutor Chat Header */}
          <div className="p-4 border-b border-slate-100 pb-3 flex justify-between items-center bg-slate-50/40">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <h3 className="font-extrabold text-sm text-blue-700 tracking-tight">AI Tutor Companion</h3>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 font-medium leading-none">
                {selectedSection ? (
                  <>
                    Focusing on:{' '}
                    <span className="text-blue-600 font-extrabold">
                      {QUIZ_SECTIONS.find(s => s.id === selectedSection)?.title}
                    </span>
                  </>
                ) : (
                  'Grammar & Vocabulary Specialist'
                )}
              </p>
            </div>
            
            {/* Labs stamp badge */}
            <span className="text-[8px] font-black tracking-widest text-slate-400 uppercase border border-slate-200 rounded px-1.5 py-0.5">
              LABS
            </span>
          </div>

          {/* Conversation Messenger View */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4 text-xs bg-slate-50/20">
            {chatMessages.map((msg, idx) => {
              const isTutor = msg.role === 'model';
              return (
                <div 
                  key={idx}
                  className={`flex flex-col max-w-[85%] ${
                    isTutor ? 'self-start' : 'self-end ml-auto'
                  }`}
                >
                  <div 
                    className={`p-3 rounded-2xl shadow-sm leading-relaxed ${
                      isTutor 
                        ? 'bg-blue-600 text-white rounded-tl-sm' 
                        : 'bg-white text-slate-800 rounded-tr-sm border border-slate-100'
                    }`}
                  >
                    {/* Preserve line breaks and output clean texts */}
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  </div>
                  <span className={`text-[9px] text-slate-400 mt-1 font-semibold ${
                    isTutor ? 'text-left' : 'text-right'
                  }`}>
                    {isTutor ? 'Tutor' : 'You'} • {msg.time}
                  </span>
                </div>
              );
            })}

            {/* AI thinking state loader */}
            {isChatLoading && (
              <div className="flex flex-col max-w-[85%] self-start">
                <div className="bg-blue-600/10 text-blue-700 p-3.5 rounded-2xl rounded-tl-sm flex items-center gap-2 font-bold text-xs">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span>Tutor is formulating explanation...</span>
                </div>
              </div>
            )}
            
            <div ref={chatEndRef} />
          </div>

          {/* Chat Messenger Input Bar */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2 items-center">
            <input 
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a grammar question or clue..."
              className="flex-1 bg-white border border-slate-200 h-10 px-4 text-xs font-medium text-slate-700 placeholder-slate-400 outline-none focus:border-blue-500 rounded-xl transition-all"
            />
            <button
              type="submit"
              disabled={isChatLoading || !chatInput.trim()}
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center transition-all shadow-sm active:scale-95 disabled:opacity-40 shrink-0"
            >
              <Send size={14} />
            </button>
          </form>

        </aside>

      </div>

      {/* COMPACT FOOTER COURSE PROGRESS MONITOR */}
      <footer className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border border-slate-200/80 rounded-2xl mt-auto shadow-sm">
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div>
            <span className="text-[10px] font-black text-slate-400 block uppercase tracking-wider">Course Mastery</span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-blue-600">{progressPercentage}%</span>
              <span className="text-xs text-slate-500 font-semibold">({completedCount} of 36 Levels)</span>
            </div>
          </div>

          {/* Long horizontal progress meter bar */}
          <div className="w-48 sm:w-64 md:w-80 bg-slate-200 h-3 rounded-full overflow-hidden shadow-inner">
            <div 
              className="bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 h-full rounded-full transition-all duration-700" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Brand sign-off label */}
        <div className="text-center md:text-right">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest block">
            English on the go
          </span>
          <span className="text-[9px] text-slate-400 font-medium">
            © 2026 Mr. Zaafouri Labs. All rights reserved.
          </span>
        </div>
      </footer>

      {triggerConfetti && (
        <ConfettiEffect onComplete={() => setTriggerConfetti(false)} />
      )}

      {appAlert && appAlert.show && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-center flex flex-col items-center animate-fade-in">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${
              appAlert.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
            }`}>
              {appAlert.type === 'success' ? <Award size={28} /> : <HelpCircle size={28} />}
            </div>
            <h3 className="text-lg font-black text-slate-800 mb-2">{appAlert.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">{appAlert.message}</p>
            <button
              onClick={() => setAppAlert(null)}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl text-xs transition-colors shadow-md animate-pulse-soft"
            >
              Great, got it!
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
