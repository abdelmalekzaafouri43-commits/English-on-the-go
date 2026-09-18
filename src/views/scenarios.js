import { REAL_SCENARIOS as SCENARIOS } from '../data.ts';

export function renderScenariosView(container) {
  let activeScenarioId = SCENARIOS[0].id;
  let conversationHistory = [];
  let currentStep = 0;

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  function render() {
    const scenario = SCENARIOS.find(s => s.id === activeScenarioId) || SCENARIOS[0];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Scenario Selector Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          ${SCENARIOS.map(sc => `
            <button data-sc-id="${sc.id}" class="sc-select-btn p-3.5 rounded-xl border transition text-left cursor-pointer flex flex-col justify-between ${
              sc.id === activeScenarioId 
                ? 'bg-sky-500/15 border-sky-500/60 shadow-lg shadow-sky-500/10' 
                : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
            }">
              <div>
                <span class="text-[9px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-sky-400">
                  ${sc.category}
                </span>
                <h4 class="text-xs font-bold text-white mt-2 font-display">${sc.title}</h4>
              </div>
              <p class="text-[10px] text-slate-400 mt-1 line-clamp-1">${sc.description}</p>
            </button>
          `).join('')}
        </div>

        <!-- Selected Scenario Roleplay Box -->
        <div class="p-6 rounded-2xl bg-slate-900/80 border theme-border space-y-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b theme-border pb-4">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                  ${scenario.category.toUpperCase()}
                </span>
                <span class="text-xs text-slate-400 font-mono">LEVEL: ${scenario.difficulty}</span>
              </div>
              <h2 class="text-xl font-bold text-white font-display mt-1">${scenario.title}</h2>
              <p class="text-xs text-slate-300 mt-0.5">${scenario.description}</p>
            </div>

            <button id="reset-sc-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-bold transition cursor-pointer">
              RESET CONVERSATION
            </button>
          </div>

          <!-- Dialogue Messages Feed -->
          <div class="space-y-4 max-h-96 overflow-y-auto p-2 scrollbar-none">
            ${scenario.dialogue.map((item, idx) => `
              <div class="flex flex-col ${item.sender === 'User' ? 'items-end' : 'items-start'} gap-1">
                <div class="flex items-center gap-2">
                  <span class="text-[10px] font-mono uppercase text-slate-400">${item.sender}</span>
                  ${item.sender === 'Tutor' ? `
                    <button data-sc-speak="${item.text}" class="sc-speak-btn p-1 text-slate-400 hover:text-sky-400 cursor-pointer" title="Listen">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    </button>
                  ` : ''}
                </div>
                <div class="p-3.5 rounded-2xl max-w-lg text-xs leading-relaxed ${
                  item.sender === 'User' 
                    ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none' 
                    : 'bg-slate-950 border theme-border text-slate-200 rounded-tl-none'
                }">
                  ${item.text}
                  ${item.pronunciation ? `
                    <div class="text-[10px] font-mono text-sky-400/80 mt-1.5 pt-1.5 border-t border-slate-800">
                      IPA: ${item.pronunciation}
                    </div>
                  ` : ''}
                </div>
              </div>
            `).join('')}
          </div>

          <!-- Useful Vocabulary Box for Scenario -->
          <div class="pt-4 border-t theme-border">
            <h4 class="text-xs font-mono uppercase font-bold text-slate-400 mb-3">KEY SCENARIO VOCABULARY</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              ${(scenario.usefulVocabulary || []).map(v => `
                <div class="p-3 rounded-xl bg-slate-950/80 border theme-border text-xs space-y-1">
                  <div class="font-bold text-sky-300 font-display">${v.word}</div>
                  <div class="text-slate-400 text-[11px]">${v.meaning}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bindings
    container.querySelectorAll('.sc-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeScenarioId = btn.getAttribute('data-sc-id');
        render();
      });
    });

    container.querySelectorAll('.sc-speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = btn.getAttribute('data-sc-speak');
        if (text) speakText(text);
      });
    });

    container.querySelector('#reset-sc-btn')?.addEventListener('click', () => {
      render();
    });
  }

  render();
}
