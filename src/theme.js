// Theme Switcher Controller
export const THEMES = [
  { id: 'sapphire', name: 'Sapphire Navy', badge: 'SAPPHIRE', color: '#38bdf8' },
  { id: 'sapphire-ice', name: 'Ice White', badge: 'ICE WHITE', color: '#ffffff' },
  { id: 'ocean', name: 'Cobalt Blue', badge: 'COBALT', color: '#3b82f6' },
  { id: 'emerald', name: 'Emerald Forest', badge: 'EMERALD', color: '#10b981' },
  { id: 'violet', name: 'Royal Violet', badge: 'VIOLET', color: '#a855f7' },
  { id: 'crimson', name: 'Sunset Crimson', badge: 'CRIMSON', color: '#f43f5e' },
  { id: 'midnight', name: 'Midnight OLED', badge: 'NIGHT', color: '#000000' }
];

const STORAGE_KEY = 'zlabs_english_active_theme';

export function getActiveTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && THEMES.some(t => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    // default fallback
  }
  return 'sapphire';
}

export function setActiveTheme(themeId) {
  try {
    localStorage.setItem(STORAGE_KEY, themeId);
  } catch (e) {
    // ignore
  }
  document.documentElement.setAttribute('data-theme', themeId);
  
  const themeNameEl = document.getElementById('current-theme-name');
  if (themeNameEl) {
    const found = THEMES.find(t => t.id === themeId);
    if (found) themeNameEl.textContent = found.badge;
  }
}

export function initTheme() {
  const active = getActiveTheme();
  setActiveTheme(active);

  const themeBtns = document.querySelectorAll('.theme-picker-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const themeId = btn.getAttribute('data-theme-id');
      if (themeId) {
        setActiveTheme(themeId);
      }
    });
  });
}
