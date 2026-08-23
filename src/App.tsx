import React, { useState, useEffect, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CameraView } from './CameraView';
import { VocabularyView } from './VocabularyView';
import { TensesView } from './TensesView';
import { TutorView } from './TutorView';
import { EverydayView } from './EverydayView';
import { StatsView } from './StatsView';
import { useOffline } from './OfflineContext';
import { updateStreak } from './storage';
import { useTheme, THEMES, ThemeType } from './ThemeContext';

type ViewType = 'dashboard' | 'vision' | 'grammar' | 'scenarios' | 'tutor' | 'lexicon';

interface TabItem {
  id: ViewType;
  label: string;
  keyNumber: string;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'Dashboard', keyNumber: '1' },
  { id: 'vision', label: 'Magic Camera', keyNumber: '2' },
  { id: 'grammar', label: 'Verbs & Tenses', keyNumber: '3' },
  { id: 'scenarios', label: 'Everyday English', keyNumber: '4' },
  { id: 'tutor', label: 'AI Tutor', keyNumber: '5' },
  { id: 'lexicon', label: 'Vocabulary', keyNumber: '6' },
];

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 32 : direction < 0 ? -32 : 0,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -32 : direction < 0 ? 32 : 0,
    opacity: 0,
  }),
};

const App: React.FC = () => {
  const { isOnline } = useOffline();
  const { theme, setTheme, currentThemeConfig } = useTheme();
  const [[activeView, direction], setViewAndDirection] = useState<[ViewType, number]>([
    'dashboard',
    0,
  ]);

  useEffect(() => {
    // Record current active session streak status
    updateStreak();
  }, []);

  const changeTab = useCallback((newTab: ViewType) => {
    setViewAndDirection(([currentTab]) => {
      if (newTab === currentTab) return [currentTab, 0];
      const prevIdx = TABS.findIndex((t) => t.id === currentTab);
      const newIdx = TABS.findIndex((t) => t.id === newTab);
      const dir = newIdx > prevIdx ? 1 : -1;
      return [newTab, dir];
    });
  }, []);

  const navigateTab = useCallback((navDir: 'next' | 'prev') => {
    setViewAndDirection(([current]) => {
      const currentIndex = TABS.findIndex((t) => t.id === current);
      if (currentIndex === -1) return ['dashboard', 0];
      if (navDir === 'next') {
        const nextIndex = (currentIndex + 1) % TABS.length;
        return [TABS[nextIndex].id, 1];
      } else {
        const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        return [TABS[prevIndex].id, -1];
      }
    });
  }, []);

  // Keyboard navigation for top-level navigation menu
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input, textarea, select or contentEditable
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Check for arrow keys navigation across main menu
      if (e.key === 'ArrowRight') {
        navigateTab('next');
        return;
      } else if (e.key === 'ArrowLeft') {
        navigateTab('prev');
        return;
      }

      // Direct tab jump with number keys 1-7 (when not in a quiz modal)
      if (['1', '2', '3', '4', '5', '6', '7'].includes(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const hasActiveQuiz = document.querySelector('[data-quiz-active="true"]');
        if (!hasActiveQuiz) {
          const tabIndex = parseInt(e.key, 10) - 1;
          if (tabIndex >= 0 && tabIndex < TABS.length) {
            changeTab(TABS[tabIndex].id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [navigateTab, changeTab]);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <StatsView onNavigate={changeTab} />;
      case 'vision':
        return <CameraView />;
      case 'grammar':
        return <TensesView />;
      case 'scenarios':
        return <EverydayView />;
      case 'tutor':
        return <TutorView />;
      case 'lexicon':
        return <VocabularyView />;
      default:
        return <StatsView onNavigate={changeTab} />;
    }
  };

  return (
    <div
      id="app-container"
      className="relative w-full h-[100dvh] flex flex-col overflow-hidden font-sans select-none text-slate-100"
    >
      {/* Smooth Background Transition Layers for all themes */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden" aria-hidden="true">
        {THEMES.map((t) => (
          <div
            key={t.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out theme-bg-${t.id} ${
              theme === t.id ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      {/* Dynamic Offline banner if connectivity drops */}
      {!isOnline && (
        <div className="bg-rose-950/90 border-b border-rose-800/50 text-rose-200 text-xs py-2 px-4 flex items-center justify-center gap-2 animate-pulse shrink-0">
          <span className="font-semibold uppercase tracking-wider text-[10px]">OFFLINE MODE</span>
          <span className="text-[10px] text-slate-300">Local state cached. Restoring server-side AI features when online.</span>
        </div>
      )}

      {/* Top Header Panel - Branding & Theme Color Switcher */}
      <header className="pt-[env(safe-area-inset-top)] min-h-[52px] border-b theme-border theme-header px-2 sm:px-6 flex flex-wrap items-center justify-between shrink-0 select-none gap-2 w-full overflow-hidden">
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 my-1">
          <div className="flex items-center gap-1.5">
            <img 
              src="/src/assets/images/zlabs_logo_1787322064386.jpg" 
              alt="ZLabs Logo" 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-md shadow-lg border border-slate-700/50"
              referrerPolicy="no-referrer"
            />
            <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase text-slate-100 font-mono whitespace-nowrap">
              ENGLISH <span className={currentThemeConfig.accentClass}>LENS</span>
            </span>
          </div>
          <span className="h-3 sm:h-3.5 w-[1px] bg-slate-700/50"></span>
          <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-wider text-sky-300 bg-sky-950/50 border border-sky-700/60 px-1.5 sm:px-2.5 py-0.5 rounded-md font-mono shadow-[0_0_12px_rgba(56,189,248,0.1)] whitespace-nowrap">
            Mr.Zaafouri Abdelmalek
          </span>
        </div>

        {/* Color Palette Switcher - Pure Text Badges without any icons */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-none py-1 my-1">
          <span className="text-[8px] font-mono font-bold uppercase tracking-wider text-slate-400 hidden md:inline">
            PALETTE:
          </span>
          <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border theme-border">
            {THEMES.map((t) => {
              const isSelected = theme === t.id;
              return (
                <button
                  key={t.id}
                  id={`theme-btn-${t.id}`}
                  onClick={() => setTheme(t.id as ThemeType)}
                  title={isSelected ? `Current Active Theme: ${t.name}` : `Switch to ${t.name}`}
                  className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5 ${
                    isSelected
                      ? `${t.activeBtnClass} shadow-md scale-100 ring-1 ring-white/30`
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  <span 
                    className="w-2.5 h-2.5 rounded-full shadow-[inset_0_0_2px_rgba(0,0,0,0.5)] border border-black/20 shrink-0" 
                    style={{ backgroundColor: t.previewColor }}
                  />
                  <span>{t.badgeLabel}</span>
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content Canvas with Horizontal Slide Transition */}
      <main className="flex-1 w-full overflow-hidden flex flex-col relative">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={activeView}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              duration: 0.22,
              ease: [0.25, 1, 0.5, 1],
            }}
            className="flex-1 w-full h-full flex flex-col overflow-hidden"
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Premium Bottom Navigation Bar (100% icon-free text buttons) */}
      <footer className="shrink-0 border-t theme-border theme-nav px-4 pt-2.5 pb-5 md:pb-2.5 select-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center justify-start md:justify-center gap-1.5 overflow-x-auto scrollbar-none pb-1 md:pb-0 flex-1">
            {TABS.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <motion.button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => changeTab(tab.id)}
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  style={{ boxShadow: isActive ? '0 0 15px var(--color-accent-glow)' : 'none' }}
                  className={`relative px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors duration-200 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 z-10 ${
                    isActive
                      ? `text-white bg-slate-950 theme-animated-border-fast`
                      : 'bg-slate-950/40 hover:bg-slate-950/80 text-slate-400 hover:text-white theme-animated-border'
                  }`}
                  title={`Switch to ${tab.label} (Press ${tab.keyNumber} or use ← / →)`}
                >
                  <span
                    className={`relative z-10 text-[8px] font-mono font-bold px-1 rounded border transition-colors duration-200 ${
                      isActive
                        ? 'bg-slate-800/80 border-slate-700 text-white'
                        : 'bg-slate-950/60 border-slate-700/60 text-slate-400'
                    }`}
                  >
                    {tab.keyNumber}
                  </span>
                  <span className="relative z-10">{tab.label}</span>
                </motion.button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[9px] font-mono text-slate-400 shrink-0">
            <span className="bg-slate-950/70 border theme-border px-2 py-1 rounded-lg">
              ← / → NAVIGATE TABS
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
