import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line } from 'recharts';
import { getFlashcards, getQuizScores, getStreakStats, StreakStats, QuizScore, Flashcard } from './storage';
import { useTheme } from './ThemeContext';
import { playQuizCompletionSound } from './soundFx';
import { CheckCircle2, Sparkles, BookOpen } from 'lucide-react';

interface StatsViewProps {
  onNavigate?: (view: any) => void;
}

interface DailyMission {
  title: string;
  description: string;
  type: string;
}

const MISSIONS: DailyMission[] = [
  { title: "Vocabulary Builder", description: "Use the Magic Camera to discover and save 3 new objects.", type: "vocab" },
  { title: "Grammar Master", description: "Take a grammar quiz and score at least 80%.", type: "grammar" },
  { title: "Pronunciation Drill", description: "Use the Pronunciation Coach in the Tools tab.", type: "tools" },
  { title: "Flashcard Review", description: "Review your saved flashcards in the Vocabulary tab.", type: "vocab" },
  { title: "Tone Transformer", description: "Rewrite a sentence into 'Executive' tone using AI Tools.", type: "tools" }
];

const WORDS_OF_DAY = [
  { word: "Serendipity", definition: "The occurrence and development of events by chance in a happy or beneficial way.", example: "Meeting my future business partner on that delayed train was pure serendipity." },
  { word: "Ephemeral", definition: "Lasting for a very short time.", example: "Fashions are ephemeral, but true style is timeless." },
  { word: "Ubiquitous", definition: "Present, appearing, or found everywhere.", example: "Smartphones have become ubiquitous in modern society." },
  { word: "Mellifluous", definition: "Sweet or musical; pleasant to hear.", example: "Her mellifluous voice was perfect for reading audiobooks." },
  { word: "Luminous", definition: "Full of or shedding light; bright or shining, especially in the dark.", example: "The luminous dial on his watch helped him tell time in the cave." }
];

export const StatsView: React.FC<StatsViewProps> = ({ onNavigate }) => {
  const { currentThemeConfig } = useTheme();
  const [streak, setStreak] = useState<StreakStats | null>(null);
  const [scores, setScores] = useState<QuizScore[]>([]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [dailyMission, setDailyMission] = useState<DailyMission | null>(null);
  const [missionCompleted, setMissionCompleted] = useState<boolean>(false);
  const [wordOfDay, setWordOfDay] = useState<{word: string; definition: string; example: string} | null>(null);

  useEffect(() => {
    setStreak(getStreakStats());
    setScores(getQuizScores());
    setCards(getFlashcards());

    const today = new Date().toISOString().split('T')[0];
    let storedMission = localStorage.getItem('dailyMission');
    let storedDate = localStorage.getItem('dailyMissionDate');
    let storedCompleted = localStorage.getItem('dailyMissionCompleted');

    if (storedDate !== today || !storedMission) {
      const randomMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];
      storedMission = JSON.stringify(randomMission);
      localStorage.setItem('dailyMission', storedMission);
      localStorage.setItem('dailyMissionDate', today);
      localStorage.setItem('dailyMissionCompleted', 'false');
      storedCompleted = 'false';
    }
    
    // Set Word of the day based on day of year to keep it consistent for all users that day
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    setWordOfDay(WORDS_OF_DAY[dayOfYear % WORDS_OF_DAY.length]);
    
    try {
      setDailyMission(JSON.parse(storedMission));
      setMissionCompleted(storedCompleted === 'true');
    } catch(e) {
      setDailyMission(MISSIONS[0]);
    }
  }, []);

  const handleCompleteMission = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    if (missionCompleted) return;
    
    setMissionCompleted(true);
    localStorage.setItem('dailyMissionCompleted', 'true');
    playQuizCompletionSound();
  };

  // Format vocabulary additions over time
  const getVocabChartData = () => {
    const dates: Record<string, number> = {};
    cards.forEach(c => {
      const dateStr = new Date(c.dateAdded).toISOString().split('T')[0];
      dates[dateStr] = (dates[dateStr] || 0) + 1;
    });

    const datesSorted = Object.keys(dates).sort();
    let accumulated = 0;
    return datesSorted.map(d => {
      accumulated += dates[d];
      return {
        date: d.slice(5), // MM-DD
        total: accumulated
      };
    });
  };

  // Format quiz performance chart data
  const getQuizChartData = () => {
    const data: Record<string, { totalScore: number; count: number }> = {};
    scores.forEach(s => {
      const key = s.tenseName;
      if (!data[key]) {
        data[key] = { totalScore: 0, count: 0 };
      }
      const scorePercentage = (s.score / s.total) * 100;
      data[key].totalScore += scorePercentage;
      data[key].count += 1;
    });

    return Object.keys(data).map(key => ({
      name: key,
      score: Math.round(data[key].totalScore / data[key].count)
    }));
  };

  const vocabData = getVocabChartData();
  const quizData = getQuizChartData();

  return (
    <div className="flex-1 w-full p-4 md:p-6 pb-24 md:pb-8 overflow-y-auto flex flex-col gap-6">
      {/* Interactive AR Vision Lens Launch Hero */}
      <div 
        onClick={() => onNavigate && onNavigate('vision')}
        className="p-4 sm:p-5 bg-gradient-to-r from-sky-950/80 via-indigo-950/60 to-slate-950/90 border-2 border-sky-500/50 hover:border-sky-400 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-sky-950/30 cursor-pointer group transition-all transform active:scale-[0.99]"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center text-sky-300 group-hover:scale-110 group-hover:bg-sky-500/30 transition-all shrink-0">
            <Sparkles className="w-6 h-6 text-sky-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-mono font-black uppercase tracking-widest text-sky-400 bg-sky-950 px-2 py-0.5 rounded border border-sky-600/40">
                NEW FEATURE
              </span>
              <span className="text-[10px] font-bold text-sky-300 uppercase tracking-wider">
                Augmented Reality
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white group-hover:text-sky-200 transition-colors mt-0.5">
              Launch AR Spatial Vision Lens
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Point your camera at real objects for instant floating 3D labels & voice pronunciations
            </p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onNavigate) onNavigate('vision');
          }}
          className="w-full sm:w-auto px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-sky-500/25 transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer"
        >
          <span>OPEN AR CAMERA</span>
          <span className="font-mono text-sm">→</span>
        </button>
      </div>

      {/* Top Level Metric Badges with Vibrant Color Schemes */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Streak card - Amber / Gold colorway */}
        <div className="p-5 bg-gradient-to-br from-amber-950/60 to-amber-900/20 border border-amber-500/40 rounded-2xl flex flex-col justify-between shadow-lg shadow-amber-950/20 relative overflow-hidden">
          <div className="absolute right-3 top-3 text-[10px] font-black font-mono tracking-widest text-amber-400/40">STREAK</div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">Active Streak</span>
            <span className="text-2xl font-black text-amber-200 block mt-1">
              {streak?.currentStreak || 0} {streak?.currentStreak === 1 ? 'Day' : 'Days'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-amber-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            Daily practice maintained
          </div>
        </div>

        {/* Total Cards Card - Emerald / Mint colorway */}
        <div className="p-5 bg-gradient-to-br from-emerald-950/60 to-emerald-900/20 border border-emerald-500/40 rounded-2xl flex flex-col justify-between shadow-lg shadow-emerald-950/20 relative overflow-hidden">
          <div className="absolute right-3 top-3 text-[10px] font-black font-mono tracking-widest text-emerald-400/40">LEXICON</div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">Vocab Cards</span>
            <span className="text-2xl font-black text-emerald-200 block mt-1">{cards.length} Total</span>
          </div>
          <div className="mt-3 text-[10px] text-emerald-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Active offline flashcard deck
          </div>
        </div>

        {/* Quizzes Taken Card - Indigo / Violet colorway */}
        <div className="p-5 bg-gradient-to-br from-indigo-950/60 to-indigo-900/20 border border-indigo-500/40 rounded-2xl flex flex-col justify-between shadow-lg shadow-indigo-950/20 relative overflow-hidden">
          <div className="absolute right-3 top-3 text-[10px] font-black font-mono tracking-widest text-indigo-400/40">GRAMMAR</div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-indigo-400 tracking-wider">Quizzes Practice</span>
            <span className="text-2xl font-black text-indigo-200 block mt-1">{scores.length} Quizzes</span>
          </div>
          <div className="mt-3 text-[10px] text-indigo-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
            Grammar accuracy logged
          </div>
        </div>

        {/* Fluency level gauge card - Cyan / Sky colorway */}
        <div className="p-5 bg-gradient-to-br from-sky-950/60 to-sky-900/20 border border-sky-500/40 rounded-2xl flex flex-col justify-between shadow-lg shadow-sky-950/20 relative overflow-hidden">
          <div className="absolute right-3 top-3 text-[10px] font-black font-mono tracking-widest text-sky-400/40">FLUENCY</div>
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">Estimated Level</span>
            <span className="text-xl font-black text-sky-200 block mt-1 uppercase tracking-wide">
              {scores.length >= 10 ? 'C1 Advanced' : scores.length >= 4 ? 'B2 Upper-Int' : 'B1 Intermediate'}
            </span>
          </div>
          <div className="mt-3 text-[10px] text-sky-300 font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
            Active CEFR benchmarks
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Daily Mission Card */}
        {dailyMission && (
          <div 
            onClick={() => {
              if (onNavigate && !missionCompleted) {
                 if (dailyMission.type === 'vocab') onNavigate('vision');
                 if (dailyMission.type === 'grammar') onNavigate('grammar');
                 if (dailyMission.type === 'tools') onNavigate('tools');
              }
            }}
            className={`p-5 rounded-2xl flex flex-col justify-between gap-4 shadow-lg transition-all ${
              missionCompleted 
                ? 'bg-gradient-to-r from-emerald-950/40 to-teal-900/10 border border-emerald-500/30 cursor-default'
                : 'bg-gradient-to-r from-fuchsia-950/60 to-purple-900/20 border border-fuchsia-500/40 cursor-pointer group hover:bg-fuchsia-950/40 shadow-fuchsia-950/20'
            }`}
          >
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className={`w-3.5 h-3.5 ${missionCompleted ? 'text-emerald-400' : 'text-fuchsia-400'}`} />
                <span className={`text-[10px] font-black uppercase tracking-wider ${missionCompleted ? 'text-emerald-400' : 'text-fuchsia-400'}`}>Daily Mission</span>
                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest border ${
                  missionCompleted 
                    ? 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                    : 'bg-fuchsia-500/20 text-fuchsia-200 border-fuchsia-500/30'
                }`}>
                  {missionCompleted ? 'COMPLETED' : 'ACTIVE'}
                </span>
              </div>
              <h4 className={`text-sm font-black transition-colors ${missionCompleted ? 'text-emerald-100' : 'text-slate-100 group-hover:text-white'}`}>
                {dailyMission.title}
              </h4>
              <p className={`text-xs mt-1 ${missionCompleted ? 'text-emerald-200/60' : 'text-slate-400'}`}>
                {dailyMission.description}
              </p>
            </div>
            
            <div className="flex items-center justify-between mt-1">
              <span className={`text-[10px] font-mono font-bold ${missionCompleted ? 'text-emerald-400/50' : 'text-fuchsia-400/50'}`}>
                +50 XP BONUS
              </span>
              {missionCompleted ? (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
                  <CheckCircle2 className="w-4 h-4" />
                  Done
                </div>
              ) : (
                <div className="flex gap-2">
                  <button 
                    onClick={handleCompleteMission}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex-shrink-0 z-10 border border-slate-600"
                  >
                    Mark Done
                  </button>
                  <button className="px-4 py-1.5 bg-fuchsia-600 hover:bg-fuchsia-500 text-fuchsia-50 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-[0_0_15px_rgba(217,70,239,0.2)] transition-all flex-shrink-0 z-10">
                    Start
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Word of the Day Card */}
        {wordOfDay && (
          <div className="p-5 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between gap-3 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <BookOpen className="w-24 h-24" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                <span className="text-[10px] font-black uppercase text-sky-400 tracking-wider">Word of the Day</span>
              </div>
              <h4 className="text-xl font-black text-white font-serif tracking-wide mt-1">
                {wordOfDay.word}
              </h4>
              <p className="text-xs text-slate-300 mt-1 italic border-l-2 border-sky-500/30 pl-2">
                {wordOfDay.definition}
              </p>
            </div>
            <div className="bg-slate-950/50 p-2.5 rounded-lg border border-slate-800/50 mt-1">
              <p className="text-[11px] text-slate-400 leading-relaxed">
                "{wordOfDay.example}"
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Pro Tools Quick Launchpad Grid */}
      <div className="p-5 theme-panel border theme-border rounded-2xl flex flex-col gap-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-[9px] px-2.5 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono font-black rounded">
              FEATURED PRO SUITE
            </span>
            <h4 className="font-black text-sm text-slate-100 uppercase tracking-wide">
              Advanced Linguistic Workbench
            </h4>
          </div>
          {onNavigate && (
            <button
              onClick={() => onNavigate('tools')}
              className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-[10px] font-mono font-black uppercase tracking-wider cursor-pointer active:scale-95 transition-all"
            >
              OPEN PRO WORKBENCH →
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Tool 1 */}
          <div
            onClick={() => onNavigate?.('tools')}
            className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-sky-500/60 rounded-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-black text-sky-400">PHONETICS</span>
                <span className="text-[8px] font-mono text-slate-400 group-hover:text-sky-300 uppercase">MIC READY</span>
              </div>
              <h5 className="font-black text-xs text-slate-100 group-hover:text-sky-200">Pronunciation & Accent Coach</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Audio pitch comparison, syllable stress breakdown & Oxford IPA standard checks.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-sky-400 mt-3 block">
              [START PHONETIC DRILL]
            </span>
          </div>

          {/* Tool 2 */}
          <div
            onClick={() => onNavigate?.('tools')}
            className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-violet-500/60 rounded-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-black text-violet-400">STYLE REGISTERS</span>
                <span className="text-[8px] font-mono text-slate-400 group-hover:text-violet-300 uppercase">6 MODES</span>
              </div>
              <h5 className="font-black text-xs text-slate-100 group-hover:text-violet-200">Tone & Formality Transformer</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Convert sentences into Executive, Academic C2, Diplomatic, or Concise styles with diff explanations.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-violet-400 mt-3 block">
              [REWRITE REGISTER]
            </span>
          </div>

          {/* Tool 3 */}
          <div
            onClick={() => onNavigate?.('tools')}
            className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-emerald-500/60 rounded-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-black text-emerald-400">OFFICIAL RUBRIC</span>
                <span className="text-[8px] font-mono text-slate-400 group-hover:text-emerald-300 uppercase">BAND 5-9</span>
              </div>
              <h5 className="font-black text-xs text-slate-100 group-hover:text-emerald-200">IELTS & CEFR Band Scorer</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Examiner-level assessment across Coherence, Lexical Resource, and Grammatical Range.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-emerald-400 mt-3 block">
              [CALCULATE SCORE]
            </span>
          </div>

          {/* Tool 4 */}
          <div
            onClick={() => onNavigate?.('tools')}
            className="p-4 bg-slate-950/70 hover:bg-slate-950 border border-slate-800 hover:border-amber-500/60 rounded-xl transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[9px] font-mono font-black text-amber-400">CORPUS NATIVE</span>
                <span className="text-[8px] font-mono text-slate-400 group-hover:text-amber-300 uppercase">PAIRINGS</span>
              </div>
              <h5 className="font-black text-xs text-slate-100 group-hover:text-amber-200">Collocation & Phrasals</h5>
              <p className="text-[10px] text-slate-400 mt-1 leading-normal">
                Native verb-noun partnerships, separable phrasal verb matrices & non-native error traps.
              </p>
            </div>
            <span className="text-[9px] font-mono font-bold text-amber-400 mt-3 block">
              [EXPLORE PARTNERSHIPS]
            </span>
          </div>
        </div>
      </div>

      {/* Charts Grid with high contrast theme-panels and custom vibrant colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vocabulary lines over time */}
        <div className="p-5 theme-panel border theme-border rounded-2xl flex flex-col gap-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-100">Vocabulary Acquisition Curve</h4>
              <span className="text-[9px] px-2.5 py-0.5 bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 rounded-md font-mono font-black shadow-sm">
                EMERALD METRIC
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Tracking cumulative cards added to your vocabulary deck over time.</p>
          </div>
          <div className="h-[200px] w-full">
            {vocabData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={vocabData} margin={{ left: -25, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '10px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#38bdf8', fontSize: '12px' }}
                  />
                  <Line type="monotone" dataKey="total" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#34d399' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                No vocabulary records logged yet. Use the camera or create a card to start!
              </div>
            )}
          </div>
        </div>

        {/* Grammar performance bar chart */}
        <div className="p-5 theme-panel border theme-border rounded-2xl flex flex-col gap-4 shadow-xl">
          <div>
            <div className="flex items-center justify-between">
              <h4 className="font-black text-sm text-slate-100">Grammar Quiz Score Breakdown</h4>
              <span className="text-[9px] px-2.5 py-0.5 bg-indigo-950/70 border border-indigo-500/50 text-indigo-300 rounded-md font-mono font-black shadow-sm">
                INDIGO METRIC
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Average accuracy percentage attained per grammar tense module.</p>
          </div>
          <div className="h-[200px] w-full">
            {quizData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={quizData} margin={{ left: -25, top: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.15)" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                  <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(129, 140, 248, 0.3)', borderRadius: '10px' }}
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontWeight: 'bold' }}
                    itemStyle={{ color: '#818cf8', fontSize: '12px' }}
                  />
                  <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} barSize={35} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full w-full flex flex-col items-center justify-center text-slate-400 text-xs gap-1.5 py-8">
                <span className="text-xs font-black text-slate-300 font-mono">NO SCORES DETECTED</span>
                <span className="text-[10px] text-slate-400 max-w-[200px] text-center leading-normal">Complete a Verbs & Tenses quiz to log your first grammar analytics score.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
