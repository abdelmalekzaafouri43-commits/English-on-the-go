import { getFlashcards, toggleStarFlashcard, saveFlashcard } from '../storage.ts';

export function renderVocabularyView(container) {
  let activeTab = 'cards'; // 'cards' | 'list'
  let activeLevel = 'ALL';
  let searchQuery = '';
  let starredOnly = false;
  let cardIndex = 0;
  let isFlipped = false;

  function speakWord(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  function render() {
    const flashcards = getFlashcards();

    const filtered = flashcards.filter(card => {
      const matchesLevel = activeLevel === 'ALL' || card.level === activeLevel;
      const matchesSearch = card.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            card.definition.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            card.example.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStarred = !starredOnly || card.starred;
      return matchesLevel && matchesSearch && matchesStarred;
    });

    if (cardIndex >= filtered.length) {
      cardIndex = Math.max(0, filtered.length - 1);
    }

    const currentCard = filtered[cardIndex];

    container.innerHTML = `
      <div class="space-y-6">
        <!-- Controls & Filters Bar -->
        <div class="p-4 rounded-2xl bg-slate-900/80 border theme-border flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <!-- View Switcher -->
          <div class="flex items-center gap-1.5 p-1 bg-slate-950/80 rounded-xl border theme-border">
            <button id="lex-btn-cards" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'cards' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }">FLASHCARDS</button>
            <button id="lex-btn-list" class="px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              activeTab === 'list' ? 'bg-sky-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }">WORD LIST (${filtered.length})</button>
          </div>

          <!-- Filters -->
          <div class="flex items-center gap-2 flex-wrap w-full md:w-auto">
            <button id="lex-btn-star" class="px-3 py-1.5 rounded-xl border theme-border text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              starredOnly ? 'bg-amber-500/20 text-amber-400 border-amber-500/40' : 'bg-slate-950/80 text-slate-400 hover:text-white'
            }">
              <span>★ STARRED ONLY</span>
            </button>

            <select id="lex-select-level" class="px-3 py-1.5 rounded-xl bg-slate-950/80 border theme-border text-xs text-slate-200 focus:outline-none focus:border-sky-500 cursor-pointer">
              <option value="ALL" ${activeLevel === 'ALL' ? 'selected' : ''}>ALL LEVELS</option>
              <option value="B1" ${activeLevel === 'B1' ? 'selected' : ''}>B1 INTERMEDIATE</option>
              <option value="B2" ${activeLevel === 'B2' ? 'selected' : ''}>B2 UPPER INTERMEDIATE</option>
              <option value="C1" ${activeLevel === 'C1' ? 'selected' : ''}>C1 ADVANCED</option>
              <option value="C2" ${activeLevel === 'C2' ? 'selected' : ''}>C2 PROFICIENT</option>
            </select>

            <input id="lex-search" type="text" value="${searchQuery}" placeholder="Search vocabulary..." class="px-3 py-1.5 rounded-xl bg-slate-950/80 border theme-border text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
          </div>
        </div>

        ${activeTab === 'cards' ? `
          <!-- Flashcard View -->
          ${filtered.length === 0 ? `
            <div class="p-12 text-center bg-slate-900/60 border theme-border rounded-2xl space-y-3">
              <div class="text-3xl">🔍</div>
              <h3 class="text-sm font-bold text-slate-300">No matching vocabulary found</h3>
              <p class="text-xs text-slate-500">Try adjusting your search filters or clearing the starred filter.</p>
            </div>
          ` : `
            <div class="max-w-xl mx-auto space-y-4">
              <!-- Card Counter & Position -->
              <div class="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>WORD ${cardIndex + 1} OF ${filtered.length}</span>
                <span>CLICK CARD TO FLIP</span>
              </div>

              <!-- Interactive Flip Card Container -->
              <div id="flashcard-element" class="w-full h-80 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border theme-border p-8 flex flex-col justify-between cursor-pointer transition-all duration-300 hover:border-sky-500/50 relative shadow-2xl overflow-hidden group">
                <!-- Top Badge Info -->
                <div class="flex items-center justify-between z-10">
                  <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      ${currentCard.level || 'B2'}
                    </span>
                    <span class="text-[10px] font-mono uppercase text-slate-400">
                      ${currentCard.partOfSpeech || 'noun'}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button id="card-speak-btn" title="Listen Pronunciation" class="p-2 rounded-xl bg-slate-800/80 hover:bg-sky-500 hover:text-slate-950 text-slate-300 transition cursor-pointer">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    </button>
                    <button id="card-star-btn" title="Toggle Star" class="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 ${currentCard.starred ? 'text-amber-400' : 'text-slate-400'} transition cursor-pointer">
                      ★
                    </button>
                  </div>
                </div>

                <!-- Main Word or Definition -->
                <div class="text-center my-auto space-y-3 z-10">
                  ${!isFlipped ? `
                    <h2 class="text-3xl md:text-4xl font-black text-white font-display">${currentCard.word}</h2>
                    <p class="text-sm font-mono text-sky-400">${currentCard.ipa || ''}</p>
                    <p class="text-xs text-slate-400 italic font-mono">[ Click to reveal definition ]</p>
                  ` : `
                    <div class="space-y-3">
                      <p class="text-lg md:text-xl font-bold text-slate-100">${currentCard.definition}</p>
                      <p class="text-xs text-sky-300 italic bg-slate-950/60 p-3 rounded-xl border theme-border">
                        "${currentCard.example}"
                      </p>
                    </div>
                  `}
                </div>

                <!-- Footer Hint -->
                <div class="flex items-center justify-between text-[10px] font-mono text-slate-500 border-t theme-border pt-3 z-10">
                  <span>CATEGORY: ${currentCard.category || 'General'}</span>
                  <span>TAP TO REVERSE</span>
                </div>
              </div>

              <!-- Flashcard Navigation Buttons -->
              <div class="flex items-center justify-between gap-4">
                <button id="card-prev-btn" ${cardIndex === 0 ? 'disabled' : ''} class="flex-1 py-3 rounded-xl bg-slate-900 border theme-border font-bold text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer">
                  ← PREVIOUS
                </button>
                <button id="card-next-btn" ${cardIndex >= filtered.length - 1 ? 'disabled' : ''} class="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-lg shadow-sky-500/20">
                  NEXT WORD →
                </button>
              </div>
            </div>
          `}
        ` : `
          <!-- List View Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filtered.map((item, idx) => `
              <div class="p-4 rounded-xl bg-slate-900/80 border theme-border space-y-3 hover:border-sky-500/40 transition">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
                      ${item.level}
                    </span>
                    <span class="text-xs font-mono text-slate-400 uppercase">${item.partOfSpeech}</span>
                  </div>
                  <div class="flex items-center gap-1">
                    <button data-list-speak="${item.word}" class="list-speak-btn p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-slate-800 transition cursor-pointer">
                      <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                    </button>
                    <button data-list-star="${item.id}" class="list-star-btn p-1.5 rounded-lg ${item.starred ? 'text-amber-400' : 'text-slate-400'} hover:bg-slate-800 transition cursor-pointer">
                      ★
                    </button>
                  </div>
                </div>

                <div>
                  <h4 class="text-lg font-bold text-white font-display">${item.word}</h4>
                  <p class="text-xs font-mono text-sky-400">${item.ipa || ''}</p>
                </div>

                <p class="text-xs text-slate-300 leading-relaxed">${item.definition}</p>

                <p class="text-[11px] text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border theme-border">
                  "${item.example}"
                </p>
              </div>
            `).join('')}
          </div>
        `}
      </div>
    `;

    // Bindings
    container.querySelector('#lex-btn-cards')?.addEventListener('click', () => { activeTab = 'cards'; isFlipped = false; render(); });
    container.querySelector('#lex-btn-list')?.addEventListener('click', () => { activeTab = 'list'; render(); });

    container.querySelector('#lex-btn-star')?.addEventListener('click', () => { starredOnly = !starredOnly; cardIndex = 0; render(); });

    const selectEl = container.querySelector('#lex-select-level');
    if (selectEl) selectEl.addEventListener('change', (e) => { activeLevel = e.target.value; cardIndex = 0; render(); });

    const searchEl = container.querySelector('#lex-search');
    if (searchEl) searchEl.addEventListener('input', (e) => { searchQuery = e.target.value; cardIndex = 0; render(); });

    if (activeTab === 'cards' && currentCard) {
      const cardEl = container.querySelector('#flashcard-element');
      if (cardEl) {
        cardEl.addEventListener('click', (e) => {
          if (e.target.closest('#card-speak-btn') || e.target.closest('#card-star-btn')) return;
          isFlipped = !isFlipped;
          render();
        });
      }

      container.querySelector('#card-speak-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        speakWord(currentCard.word);
      });

      container.querySelector('#card-star-btn')?.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleStarFlashcard(currentCard.id);
        render();
      });

      container.querySelector('#card-prev-btn')?.addEventListener('click', () => {
        if (cardIndex > 0) {
          cardIndex--;
          isFlipped = false;
          render();
        }
      });

      container.querySelector('#card-next-btn')?.addEventListener('click', () => {
        if (cardIndex < filtered.length - 1) {
          cardIndex++;
          isFlipped = false;
          render();
        }
      });
    }

    if (activeTab === 'list') {
      container.querySelectorAll('.list-speak-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const word = btn.getAttribute('data-list-speak');
          if (word) speakWord(word);
        });
      });

      container.querySelectorAll('.list-star-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-list-star');
          if (id) {
            toggleStarFlashcard(id);
            render();
          }
        });
      });
    }
  }

  render();
}
