import React, { useState, useEffect, useCallback } from 'react';
import { THEMES, ThemeType, useTheme } from './ThemeContext';
import { useOffline } from './OfflineContext';
import { StatsView } from './StatsView';
import { CameraView } from './CameraView';
import { TensesView } from './TensesView';
import { EverydayView } from './EverydayView';
import { TutorView } from './TutorView';
import { VocabularyView } from './VocabularyView';

type TabId = 'dashboard' | 'vision' | 'grammar' | 'scenarios' | 'tutor' | 'lexicon';

interface TabItem {
  id: TabId;
  label: string;
  keyNumber: string;
}

const TABS: TabItem[] = [
  { id: 'dashboard', label: 'DASHBOARD', keyNumber: '1' },
  { id: 'vision', label: 'VISION LENS', keyNumber: '2' },
  { id: 'grammar', label: 'GRAMMAR & TENSES', keyNumber: '3' },
  { id: 'scenarios', label: 'SCENARIOS', keyNumber: '4' },
  { id: 'tutor', label: 'AI TUTOR', keyNumber: '5' },
  { id: 'lexicon', label: 'LEXICON', keyNumber: '6' },
];

const App: React.FC = () => {
  const { theme, setTheme, currentThemeConfig } = useTheme();
  const { isOnline } = useOffline();
  const [activeView, setActiveView] = useState<TabId>('dashboard');

  const changeTab = useCallback((newTabId: TabId) => {
    setActiveView(newTabId);
  }, []);

  const navigateTab = useCallback(
    (dir: 'next' | 'prev') => {
      const currentIndex = TABS.findIndex((t) => t.id === activeView);
      if (dir === 'next') {
        const nextIndex = (currentIndex + 1) % TABS.length;
        changeTab(TABS[nextIndex].id);
      } else {
        const prevIndex = (currentIndex - 1 + TABS.length) % TABS.length;
        changeTab(TABS[prevIndex].id);
      }
    },
    [activeView, changeTab]
  );

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      if (e.key === 'ArrowRight') {
        navigateTab('next');
        return;
      } else if (e.key === 'ArrowLeft') {
        navigateTab('prev');
        return;
      }

      if (['1', '2', '3', '4', '5', '6'].includes(e.key) && !e.altKey && !e.ctrlKey && !e.metaKey) {
        const tabIndex = parseInt(e.key, 10) - 1;
        if (tabIndex >= 0 && tabIndex < TABS.length) {
          changeTab(TABS[tabIndex].id);
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
      className="relative w-full h-[100dvh] min-h-[100dvh] flex flex-col overflow-hidden font-sans select-none text-slate-100"
    >
      {/* Background Transition Layers for all themes */}
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

      {/* Top Header Panel - Branding & Palette Switcher */}
      <header className="pt-[env(safe-area-inset-top)] min-h-[52px] border-b theme-border theme-header px-3 sm:px-6 flex flex-wrap items-center justify-between shrink-0 select-none gap-2 w-full overflow-hidden z-20">
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 my-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] sm:text-xs font-black tracking-widest uppercase text-slate-100 font-mono whitespace-nowrap">
              ENGLISH <span className={currentThemeConfig.accentClass}>LENS</span>
            </span>
          </div>
          <span className="h-3 sm:h-3.5 w-[1px] bg-slate-700/50"></span>
          <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-sky-300 bg-sky-950/50 border border-sky-700/60 px-2 py-0.5 rounded-md font-mono whitespace-nowrap">
            Mr.Zaafouri Abdelmalek
          </span>
          <button
            onClick={() => changeTab('vision')}
            className="ml-1 px-2.5 py-1 bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm active:scale-95 cursor-pointer"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping"></span>
            <span>AR CAMERA</span>
          </button>
        </div>

        {/* Color Palette Switcher */}
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
                  title={`Switch to ${t.name}`}
                  className={`px-2 py-1 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 active:scale-95 flex items-center gap-1.5 ${
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

      {/* Main Content Canvas */}
      <main className="flex-1 w-full overflow-hidden flex flex-col relative">
        <div key={activeView} className="flex-1 w-full h-full flex flex-col overflow-hidden animate-fadeIn">
          {renderActiveView()}
        </div>
      </main>

      {/* Full-Screen Bottom Navigation Bar */}
      <footer className="shrink-0 border-t theme-border theme-nav px-2 sm:px-3 pt-2 pb-4 md:pb-2.5 select-none z-20">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center justify-start md:justify-center gap-1.5 sm:gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0 flex-1">
            {TABS.map((tab) => {
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => changeTab(tab.id)}
                  style={{ boxShadow: isActive ? '0 0 14px var(--color-accent-glow)' : 'none' }}
                  className={`relative min-h-[42px] px-3 sm:px-3.5 py-2 rounded-xl text-[10px] sm:text-[11px] font-black uppercase tracking-wider transition-all duration-150 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 touch-manipulation active:scale-95 ${
                    isActive
                      ? `text-white bg-slate-950 theme-animated-border-fast scale-[1.02]`
                      : 'bg-slate-950/50 hover:bg-slate-950/80 text-slate-300 hover:text-white theme-animated-border'
                  }`}
                  title={`Switch to ${tab.label}`}
                >
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border transition-colors duration-200 ${
                      isActive
                        ? 'bg-sky-500 text-slate-950 border-sky-400 font-black'
                        : 'bg-slate-900 border-slate-700 text-slate-300'
                    }`}
                  >
                    {tab.keyNumber}
                  </span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[9px] font-mono text-slate-400 shrink-0">
            <span className="bg-slate-950/70 border theme-border px-2 py-1 rounded-lg">
              ← / → NAVIGATE
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
