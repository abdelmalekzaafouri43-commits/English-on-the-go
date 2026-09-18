import { initTheme } from './theme.js';
import { renderStatsView } from './views/stats.js';
import { renderTensesView } from './views/tenses.js';
import { renderVocabularyView } from './views/vocabulary.js';
import { renderScenariosView } from './views/scenarios.js';
import { renderCameraView } from './views/camera.js';
import { renderTutorView } from './views/tutor.js';
import { openQuizModal } from './views/quiz.js';

let activeTab = 'dashboard';
let cleanupCurrentView = null;

const TAB_TITLES = {
  dashboard: 'DASHBOARD & OVERVIEW',
  vision: 'VISION LENS OBJECT SCANNER',
  grammar: 'GRAMMAR & 12 TENSES',
  scenarios: 'EVERYDAY CONVERSATIONS & SCENARIOS',
  tutor: 'AI TUTOR & LANGUAGE COACH',
  lexicon: 'INTERACTIVE LEXICON & FLASHCARDS'
};

function navigateTo(tabId) {
  if (!TAB_TITLES[tabId]) return;

  activeTab = tabId;

  // Cleanup active view side effects if any (e.g. camera stream)
  if (cleanupCurrentView) {
    cleanupCurrentView();
    cleanupCurrentView = null;
  }

  // Update Navigation UI Active Highlight
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    const t = btn.getAttribute('data-tab');
    if (t === tabId) {
      btn.className = 'nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer bg-sky-500 text-slate-950 font-black shadow-lg shadow-sky-500/20';
    } else {
      btn.className = 'nav-btn w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-slate-400 hover:text-white hover:bg-slate-900/60';
    }
  });

  // Update Top Bar View Title
  const titleEl = document.getElementById('view-title');
  if (titleEl) {
    titleEl.textContent = TAB_TITLES[tabId];
  }

  // Render View Content into #view-content
  const contentEl = document.getElementById('view-content');
  if (contentEl) {
    contentEl.scrollTop = 0;
    if (tabId === 'dashboard') {
      renderStatsView(contentEl, navigateTo);
    } else if (tabId === 'grammar') {
      renderTensesView(contentEl, openQuizModal);
    } else if (tabId === 'lexicon') {
      renderVocabularyView(contentEl);
    } else if (tabId === 'scenarios') {
      renderScenariosView(contentEl);
    } else if (tabId === 'vision') {
      cleanupCurrentView = renderCameraView(contentEl);
    } else if (tabId === 'tutor') {
      renderTutorView(contentEl);
    }
  }
}

function initApp() {
  // Initialize theme
  initTheme();

  // Navigation tab click listeners
  const navBtns = document.querySelectorAll('.nav-btn');
  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      if (tab) navigateTo(tab);
    });
  });

  // Quick Quiz Button listener
  const quizBtn = document.getElementById('open-quick-quiz-btn');
  if (quizBtn) {
    quizBtn.addEventListener('click', () => {
      openQuizModal();
    });
  }

  // Keyboard Shortcuts (1-6)
  window.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const keyMap = {
      '1': 'dashboard',
      '2': 'vision',
      '3': 'grammar',
      '4': 'scenarios',
      '5': 'tutor',
      '6': 'lexicon'
    };
    if (keyMap[e.key]) {
      navigateTo(keyMap[e.key]);
    }
  });

  // Default initial navigation
  navigateTo('dashboard');
}

// Boot application when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}
