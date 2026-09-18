import { getFlashcards, getQuizScores, getStreakStats } from '../storage.ts';

export function renderStatsView(container, navigateTo) {
  const flashcards = getFlashcards();
  const quizScores = getQuizScores();
  const streak = getStreakStats();

  const totalWords = flashcards.length;
  const starredCount = flashcards.filter(c => c.starred).length;
  const quizzesCount = quizScores.length;

  let totalScore = 0;
  let totalPossible = 0;
  quizScores.forEach(s => {
    totalScore += s.score || 0;
    totalPossible += s.total || 0;
  });
  const accuracyPct = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 100;

  container.innerHTML = `
    <div class="space-y-6">
      <!-- Welcome Hero Banner -->
      <div class="p-6 md:p-8 rounded-2xl bg-gradient-to-r from-slate-900/90 via-slate-900/80 to-slate-950/90 border theme-border theme-animated-border relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl z-10">
          <div class="flex items-center gap-2">
            <span class="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 uppercase tracking-wider">
              SAPPHIRE DASHBOARD
            </span>
            <span class="text-xs text-slate-400 font-mono">STREAK: ${streak.currentStreak || 1} DAYS</span>
          </div>
          <h1 class="text-2xl md:text-3xl font-black tracking-tight text-white font-display">
            Welcome back to <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Sapphire</span>
          </h1>
          <p class="text-xs md:text-sm text-slate-300 leading-relaxed">
            Your personalized AI English learning dashboard. Practice grammar tenses, expand your lexicon, scan objects with Vision Lens, and chat with your AI Coach.
          </p>
        </div>

        <div class="flex items-center gap-4 z-10 shrink-0">
          <button id="dash-btn-tutor" class="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-sky-500/20 flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            TALK TO AI COACH
          </button>
        </div>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="p-4 rounded-xl bg-slate-900/80 border theme-border flex flex-col justify-between">
          <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LEXICON WORDS</div>
          <div class="text-2xl md:text-3xl font-black text-sky-400 mt-2">${totalWords}</div>
          <div class="text-[10px] text-slate-400 mt-1">${starredCount} starred</div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/80 border theme-border flex flex-col justify-between">
          <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">QUIZ ACCURACY</div>
          <div class="text-2xl md:text-3xl font-black text-emerald-400 mt-2">${accuracyPct}%</div>
          <div class="text-[10px] text-slate-400 mt-1">${quizzesCount} quizzes taken</div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/80 border theme-border flex flex-col justify-between">
          <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">CURRENT STREAK</div>
          <div class="text-2xl md:text-3xl font-black text-amber-400 mt-2">${streak.currentStreak || 1} DAYS</div>
          <div class="text-[10px] text-slate-400 mt-1">Best: ${streak.longestStreak || 1} days</div>
        </div>

        <div class="p-4 rounded-xl bg-slate-900/80 border theme-border flex flex-col justify-between">
          <div class="text-[10px] font-mono text-slate-400 uppercase tracking-wider">LEARNING LEVEL</div>
          <div class="text-2xl md:text-3xl font-black text-indigo-400 mt-2">B2 / C1</div>
          <div class="text-[10px] text-slate-400 mt-1">Advanced Mastery</div>
        </div>
      </div>

      <!-- Quick Navigation Modules -->
      <div>
        <h3 class="text-xs font-black font-mono tracking-wider text-slate-400 uppercase mb-3">LEARNING MODULES</h3>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button id="dash-card-grammar" class="p-5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border theme-border text-left transition cursor-pointer group space-y-2">
            <div class="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400 font-bold group-hover:scale-105 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <h4 class="text-sm font-bold text-white group-hover:text-sky-400">Grammar & Tenses</h4>
            <p class="text-xs text-slate-400">Master 12 English tenses with formulas, rules, and interactive practice.</p>
          </button>

          <button id="dash-card-vision" class="p-5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border theme-border text-left transition cursor-pointer group space-y-2">
            <div class="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold group-hover:scale-105 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><circle cx="12" cy="13" r="3"/></svg>
            </div>
            <h4 class="text-sm font-bold text-white group-hover:text-indigo-400">Vision Lens</h4>
            <p class="text-xs text-slate-400">Point camera at real objects to scan, identify, and learn vocabulary instantly.</p>
          </button>

          <button id="dash-card-lexicon" class="p-5 rounded-xl bg-slate-900/80 hover:bg-slate-900 border theme-border text-left transition cursor-pointer group space-y-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold group-hover:scale-105 transition">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            </div>
            <h4 class="text-sm font-bold text-white group-hover:text-emerald-400">Interactive Lexicon</h4>
            <p class="text-xs text-slate-400">Study flashcards with audio pronunciation, example sentences, and level tags.</p>
          </button>
        </div>
      </div>
    </div>
  `;

  document.getElementById('dash-btn-tutor')?.addEventListener('click', () => navigateTo('tutor'));
  document.getElementById('dash-card-grammar')?.addEventListener('click', () => navigateTo('grammar'));
  document.getElementById('dash-card-vision')?.addEventListener('click', () => navigateTo('vision'));
  document.getElementById('dash-card-lexicon')?.addEventListener('click', () => navigateTo('lexicon'));
}
