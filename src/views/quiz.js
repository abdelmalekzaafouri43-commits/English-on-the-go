import { QUIZ_TOPICS, getQuickQuizQuestions } from '../quizData.ts';
import { saveQuizScore } from '../storage.ts';

export function openQuizModal(topicOverride) {
  const modalContainer = document.getElementById('quiz-modal');
  const modalContent = document.getElementById('quiz-modal-content');
  if (!modalContainer || !modalContent) return;

  let currentTopic = topicOverride || QUIZ_TOPICS[Math.floor(Math.random() * QUIZ_TOPICS.length)];
  let questions = getQuickQuizQuestions(currentTopic, 3, 'all');
  let qIndex = 0;
  let selectedOption = null;
  let isSubmitted = false;
  let score = 0;
  let isFinished = false;
  let isGeneratingAI = false;

  function closeModal() {
    modalContainer.classList.add('hidden');
  }

  async function generateAIQuiz() {
    isGeneratingAI = true;
    renderModal();

    try {
      const res = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: currentTopic.name, count: 3 })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.questions && data.questions.length > 0) {
          questions = data.questions;
          qIndex = 0;
          selectedOption = null;
          isSubmitted = false;
          score = 0;
          isFinished = false;
        }
      } else {
        throw new Error('Offline API');
      }
    } catch (err) {
      // Re-roll random questions dynamically
      questions = getQuickQuizQuestions(currentTopic, 3, 'all');
      qIndex = 0;
      selectedOption = null;
      isSubmitted = false;
      score = 0;
      isFinished = false;
    } finally {
      isGeneratingAI = false;
      renderModal();
    }
  }

  function renderModal() {
    const q = questions[qIndex];

    if (isFinished) {
      // Save score to local storage
      saveQuizScore({
        id: 'quiz_' + Date.now(),
        topicId: currentTopic.id,
        score: score,
        total: questions.length,
        timestamp: new Date().toISOString()
      });

      modalContent.innerHTML = `
        <div class="p-6 md:p-8 space-y-6 text-center">
          <div class="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mx-auto flex items-center justify-center text-3xl font-black">
            ✓
          </div>

          <div class="space-y-2">
            <h3 class="text-2xl font-black text-white font-display">Quiz Completed!</h3>
            <p class="text-sm text-slate-300">
              You scored <span class="text-sky-400 font-bold font-mono text-lg">${score}</span> out of <span class="font-bold font-mono text-lg">${questions.length}</span> on ${currentTopic.name}.
            </p>
          </div>

          <div class="flex items-center gap-3 pt-4">
            <button id="modal-ai-gen-btn" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg shadow-sky-500/20">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>GENERATE ANOTHER AI QUIZ</span>
            </button>
            <button id="modal-close-finished-btn" class="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition cursor-pointer">
              CLOSE
            </button>
          </div>
        </div>
      `;

      modalContent.querySelector('#modal-ai-gen-btn')?.addEventListener('click', generateAIQuiz);
      modalContent.querySelector('#modal-close-finished-btn')?.addEventListener('click', closeModal);
      return;
    }

    modalContent.innerHTML = `
      <div class="p-6 space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between border-b theme-border pb-4">
          <div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
              ${currentTopic.name.toUpperCase()}
            </span>
            <h3 class="text-sm font-bold text-slate-300 mt-1 font-mono">QUESTION ${qIndex + 1} OF ${questions.length}</h3>
          </div>

          <div class="flex items-center gap-2">
            <button id="modal-ai-gen-header" title="Generate New Quiz via AI" class="px-3 py-1.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold hover:bg-indigo-500/30 transition cursor-pointer flex items-center gap-1">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
              <span>NEW AI QUIZ</span>
            </button>
            <button id="modal-close-x" class="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer text-lg">
              ✕
            </button>
          </div>
        </div>

        ${isGeneratingAI ? `
          <div class="py-12 text-center space-y-3">
            <div class="w-10 h-10 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-xs font-mono text-sky-400 font-bold">GENERATING NEW AI QUIZ QUESTIONS...</p>
          </div>
        ` : `
          <!-- Question Body -->
          <div class="space-y-4">
            <h4 class="text-base md:text-lg font-bold text-white font-display leading-relaxed">
              ${q.q}
            </h4>

            <!-- Options Grid -->
            <div class="grid grid-cols-1 gap-2.5">
              ${q.options.map((opt) => {
                let btnStyle = 'bg-slate-950 border-slate-800 hover:border-sky-500/50 text-slate-200';
                if (isSubmitted) {
                  if (opt === q.answer) {
                    btnStyle = 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold';
                  } else if (opt === selectedOption) {
                    btnStyle = 'bg-rose-950/80 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-slate-950/40 border-slate-900 text-slate-600';
                  }
                } else if (opt === selectedOption) {
                  btnStyle = 'bg-sky-500/20 border-sky-500 text-sky-300 font-bold';
                }

                return `
                  <button data-opt="${opt}" ${isSubmitted ? 'disabled' : ''} class="quiz-opt-btn p-3.5 rounded-xl border transition text-left text-xs font-mono cursor-pointer ${btnStyle}">
                    ${opt}
                  </button>
                `;
              }).join('')}
            </div>

            <!-- Explanation Box -->
            ${isSubmitted ? `
              <div class="p-4 rounded-xl bg-slate-950 border theme-border space-y-1 animate-fade-in">
                <span class="text-[10px] font-mono font-bold uppercase text-sky-400">EXPLANATION</span>
                <p class="text-xs text-slate-300 leading-relaxed">${q.explanation}</p>
              </div>
            ` : ''}
          </div>

          <!-- Footer Actions -->
          <div class="flex items-center justify-between border-t theme-border pt-4">
            <button id="modal-close-btn" class="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer">
              CANCEL
            </button>

            ${!isSubmitted ? `
              <button id="modal-submit-btn" ${!selectedOption ? 'disabled' : ''} class="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-sky-500/20">
                CHECK ANSWER
              </button>
            ` : `
              <button id="modal-next-btn" class="px-6 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-sky-500/20">
                ${qIndex < questions.length - 1 ? 'NEXT QUESTION →' : 'SEE FINAL SCORE'}
              </button>
            `}
          </div>
        `}
      </div>
    `;

    // Handlers
    modalContent.querySelector('#modal-close-x')?.addEventListener('click', closeModal);
    modalContent.querySelector('#modal-close-btn')?.addEventListener('click', closeModal);
    modalContent.querySelector('#modal-ai-gen-header')?.addEventListener('click', generateAIQuiz);

    modalContent.querySelectorAll('.quiz-opt-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        if (!isSubmitted) {
          selectedOption = btn.getAttribute('data-opt');
          renderModal();
        }
      });
    });

    modalContent.querySelector('#modal-submit-btn')?.addEventListener('click', () => {
      if (selectedOption && !isSubmitted) {
        isSubmitted = true;
        if (selectedOption === q.answer) score++;
        renderModal();
      }
    });

    modalContent.querySelector('#modal-next-btn')?.addEventListener('click', () => {
      if (qIndex < questions.length - 1) {
        qIndex++;
        selectedOption = null;
        isSubmitted = false;
        renderModal();
      } else {
        isFinished = true;
        renderModal();
      }
    });
  }

  modalContainer.classList.remove('hidden');
  renderModal();
}
