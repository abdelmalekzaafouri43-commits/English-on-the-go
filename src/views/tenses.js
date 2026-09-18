import { QUIZ_TOPICS } from '../quizData.ts';

export function renderTensesView(container, openQuizModal) {
  let activeFilter = 'All';
  let searchQuery = '';

  function render() {
    const filteredTopics = QUIZ_TOPICS.filter(topic => {
      const matchesCategory = activeFilter === 'All' || topic.category === activeFilter;
      const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            topic.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            topic.formula.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Header & Controls -->
        <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-900/80 p-4 rounded-2xl border theme-border">
          <!-- Filter Tabs -->
          <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            ${['All', 'Present', 'Past', 'Future'].map(cat => `
              <button data-cat="${cat}" class="filter-btn px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                activeFilter === cat 
                  ? 'bg-sky-500 text-slate-950 font-black shadow-md shadow-sky-500/20' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }">
                ${cat}
              </button>
            `).join('')}
          </div>

          <!-- Search Input -->
          <div class="relative w-full md:w-64">
            <input id="tense-search-input" type="text" value="${searchQuery}" placeholder="Search tenses or rules..." class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950/80 border theme-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
            <svg class="w-4 h-4 text-slate-500 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </div>
        </div>

        <!-- Tense Topics Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${filteredTopics.map(topic => `
            <div class="p-5 rounded-2xl bg-slate-900/80 border theme-border hover:border-sky-500/40 transition space-y-4 flex flex-col justify-between">
              <div class="space-y-3">
                <div class="flex items-center justify-between">
                  <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    topic.category === 'Present' ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30' :
                    topic.category === 'Past' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  }">
                    ${topic.category.toUpperCase()}
                  </span>
                  <button data-topic-id="${topic.id}" class="topic-quiz-btn px-3 py-1 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-bold border border-sky-500/30 transition cursor-pointer flex items-center gap-1">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                    <span>PRACTICE</span>
                  </button>
                </div>

                <div>
                  <h3 class="text-base font-bold text-white font-display">${topic.name}</h3>
                  <p class="text-xs text-slate-300 mt-1 leading-relaxed">${topic.summary}</p>
                </div>

                <div class="p-3 rounded-xl bg-slate-950/80 border theme-border font-mono text-xs text-sky-300">
                  <span class="text-[10px] uppercase text-slate-500 block mb-1">FORMULA</span>
                  ${topic.formula}
                </div>

                <div class="p-3 rounded-xl bg-slate-950/40 border theme-border text-xs text-slate-300">
                  <span class="text-[10px] uppercase text-slate-500 font-mono block mb-1">EXAMPLE</span>
                  "${topic.example}"
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;

    // Bind Category Filter Buttons
    container.querySelectorAll('.filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        activeFilter = btn.getAttribute('data-cat');
        render();
      });
    });

    // Bind Search Input
    const searchEl = container.querySelector('#tense-search-input');
    if (searchEl) {
      searchEl.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        render();
      });
    }

    // Bind Practice Buttons
    container.querySelectorAll('.topic-quiz-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const topicId = btn.getAttribute('data-topic-id');
        const topic = QUIZ_TOPICS.find(t => t.id === topicId);
        if (topic && openQuizModal) {
          openQuizModal(topic);
        }
      });
    });
  }

  render();
}
