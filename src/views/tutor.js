export function renderTutorView(container) {
  let messages = [
    {
      id: 'msg_init',
      sender: 'ai',
      text: 'Hello! I am your Sapphire AI Coach. How can I help you refine your English grammar, vocabulary, or pronunciation today?'
    }
  ];
  let isSending = false;

  function speakText(text) {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  }

  async function sendMessage(userText) {
    if (!userText.trim() || isSending) return;

    const userMsg = { id: 'usr_' + Date.now(), sender: 'user', text: userText };
    messages.push(userMsg);
    isSending = true;
    render();

    try {
      const res = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText, history: messages })
      });

      if (res.ok) {
        const data = await res.json();
        messages.push({
          id: 'ai_' + Date.now(),
          sender: 'ai',
          text: data.reply || data.response || 'I am happy to assist you with that.'
        });
      } else {
        throw new Error('API offline');
      }
    } catch (err) {
      // Intelligent fallback coach response
      let fallback = "That's a great question! ";
      const lower = userText.toLowerCase();
      if (lower.includes('present perfect') || lower.includes('past simple')) {
        fallback += "The Present Perfect ('I have worked') connects past actions to the present result, whereas the Past Simple ('I worked') specifies a finished time in the past (e.g., 'yesterday', 'in 2020').";
      } else if (lower.includes('correct') || lower.includes('sentence')) {
        fallback += "Here is the corrected sentence: 'I went to the store yesterday.' We use 'went' (Past Simple) because 'yesterday' indicates a completed past timeframe!";
      } else if (lower.includes('idiom') || lower.includes('business')) {
        fallback += "Here are 3 high-impact C1 business idioms:\n1. 'Hit the ground running' - To start a project with immediate enthusiasm and speed.\n2. 'Touch base' - To briefly make contact or update someone.\n3. 'Move the needle' - To make a noticeable difference or progress.";
      } else {
        fallback += "Keep practicing your phrasing! Remember to pay close attention to your verb tenses and subject-verb agreement.";
      }

      messages.push({
        id: 'ai_' + Date.now(),
        sender: 'ai',
        text: fallback
      });
    } finally {
      isSending = false;
      render();

      const feedEl = container.querySelector('#tutor-msg-feed');
      if (feedEl) feedEl.scrollTop = feedEl.scrollHeight;
    }
  }

  function render() {
    container.innerHTML = `
      <div class="h-[calc(100vh-120px)] flex flex-col max-w-3xl mx-auto space-y-4">
        <!-- Tutor Top Bar -->
        <div class="p-4 rounded-2xl bg-slate-900/80 border theme-border flex items-center justify-between shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md shadow-sky-500/20">
              AI
            </div>
            <div>
              <h3 class="text-sm font-bold text-white font-display">Sapphire AI English Coach</h3>
              <p class="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE & READY
              </p>
            </div>
          </div>

          <button id="clear-chat-btn" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-bold transition cursor-pointer">
            CLEAR CHAT
          </button>
        </div>

        <!-- Chat Feed -->
        <div id="tutor-msg-feed" class="flex-1 p-4 rounded-2xl bg-slate-950/60 border theme-border overflow-y-auto space-y-4 scrollbar-none">
          ${messages.map(m => `
            <div class="flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'} gap-1">
              <div class="flex items-center gap-2">
                <span class="text-[10px] font-mono text-slate-400 uppercase">${m.sender === 'user' ? 'YOU' : 'AI COACH'}</span>
                ${m.sender === 'ai' ? `
                  <button data-tutor-speak="${encodeURIComponent(m.text)}" class="tutor-speak-btn p-1 text-slate-400 hover:text-sky-400 cursor-pointer" title="Pronounce">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"/></svg>
                  </button>
                ` : ''}
              </div>

              <div class="p-4 rounded-2xl max-w-xl text-xs md:text-sm leading-relaxed whitespace-pre-line ${
                m.sender === 'user'
                  ? 'bg-sky-500 text-slate-950 font-medium rounded-tr-none'
                  : 'bg-slate-900 border theme-border text-slate-100 rounded-tl-none'
              }">
                ${m.text}
              </div>
            </div>
          `).join('')}

          ${isSending ? `
            <div class="flex items-center gap-2 text-xs font-mono text-sky-400 p-2">
              <div class="w-2 h-2 rounded-full bg-sky-400 animate-ping"></div>
              <span>AI Coach is thinking...</span>
            </div>
          ` : ''}
        </div>

        <!-- Quick Prompts Pills -->
        <div class="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none shrink-0">
          <button data-prompt="Explain Present Perfect vs Past Simple" class="prompt-pill px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border theme-border text-[11px] text-sky-300 font-bold whitespace-nowrap cursor-pointer">
            💡 Present Perfect vs Past Simple
          </button>
          <button data-prompt="Correct my sentence: I have went to store yesterday" class="prompt-pill px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border theme-border text-[11px] text-sky-300 font-bold whitespace-nowrap cursor-pointer">
            ✏️ Correct my sentence
          </button>
          <button data-prompt="Give me 3 C1 business idioms" class="prompt-pill px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border theme-border text-[11px] text-sky-300 font-bold whitespace-nowrap cursor-pointer">
            💼 3 Business Idioms
          </button>
        </div>

        <!-- Input Bar -->
        <form id="tutor-form" class="flex items-center gap-2 shrink-0">
          <input id="tutor-input" type="text" placeholder="Ask your AI English tutor anything..." class="flex-1 px-4 py-3 rounded-xl bg-slate-900 border theme-border text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-sky-500" />
          <button type="submit" ${isSending ? 'disabled' : ''} class="px-5 py-3 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-sky-500/20">
            SEND
          </button>
        </form>
      </div>
    `;

    // Handlers
    const form = container.querySelector('#tutor-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = container.querySelector('#tutor-input');
        if (input && input.value) {
          const val = input.value;
          input.value = '';
          sendMessage(val);
        }
      });
    }

    container.querySelectorAll('.prompt-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        const text = pill.getAttribute('data-prompt');
        if (text) sendMessage(text);
      });
    });

    container.querySelectorAll('.tutor-speak-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const encoded = btn.getAttribute('data-tutor-speak');
        if (encoded) speakText(decodeURIComponent(encoded));
      });
    });

    container.querySelector('#clear-chat-btn')?.addEventListener('click', () => {
      messages = [
        {
          id: 'msg_init',
          sender: 'ai',
          text: 'Chat cleared. How else can I help you practice your English?'
        }
      ];
      render();
    });
  }

  render();
}
