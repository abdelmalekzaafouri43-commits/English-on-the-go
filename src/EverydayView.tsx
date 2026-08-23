import React, { useState, useEffect } from 'react';
import { REAL_SCENARIOS, ScenarioMessage } from './data';
import { updateStreak } from './storage';

type ScenarioTab = 'video' | 'dialogue' | 'vocabulary';

export const EverydayView: React.FC = () => {
  const [selectedId, setSelectedId] = useState<string>(REAL_SCENARIOS[0]?.id || 'coffee_order');
  const [activeTab, setActiveTab] = useState<ScenarioTab>('video');
  const [filterMode, setFilterMode] = useState<'all' | 'Social' | 'Business' | 'Travel'>('all');
  const [activeTurn, setActiveTurn] = useState<number>(0);
  const [chatHistory, setChatHistory] = useState<ScenarioMessage[]>(() => {
    const first = REAL_SCENARIOS[0];
    return first && first.dialogue.length > 0 ? [first.dialogue[0]] : [];
  });
  const [showResultCard, setShowResultCard] = useState<boolean>(false);

  const activeScenario = REAL_SCENARIOS.find((s) => s.id === selectedId) || REAL_SCENARIOS[0];

  const currentTutorMessage = activeScenario?.dialogue[activeTurn];
  const userOptions = currentTutorMessage?.options || [];

  // Keyboard navigation for dialogue choices
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (activeTab !== 'dialogue' || showResultCard || userOptions.length === 0) return;
      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return;

      const key = e.key.toUpperCase();
      let selectedIdx = -1;
      if (key === '1' || key === 'A') selectedIdx = 0;
      else if (key === '2' || key === 'B') selectedIdx = 1;
      else if (key === '3' || key === 'C') selectedIdx = 2;
      else if (key === '4' || key === 'D') selectedIdx = 3;

      if (selectedIdx >= 0 && selectedIdx < userOptions.length) {
        e.preventDefault();
        handleSelectOption(userOptions[selectedIdx]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeTab, showResultCard, userOptions, activeTurn, chatHistory]);

  const startScenario = (id: string, tab: ScenarioTab = 'video') => {
    setSelectedId(id);
    setActiveTab(tab);
    setActiveTurn(0);
    setShowResultCard(false);

    const scenario = REAL_SCENARIOS.find((s) => s.id === id);
    if (scenario && scenario.dialogue.length > 0) {
      setChatHistory([scenario.dialogue[0]]);
    }
  };

  const handleSelectOption = (optionText: string) => {
    if (!activeScenario) return;

    const userMsg: ScenarioMessage = {
      id: 'user_' + Date.now(),
      sender: 'User',
      text: optionText,
    };

    const nextTurnIndex = activeTurn + 2;
    const nextTutorIndex = nextTurnIndex;

    const newHistory = [...chatHistory, userMsg];
    setChatHistory(newHistory);
    setActiveTurn(nextTurnIndex);

    if (nextTutorIndex < activeScenario.dialogue.length) {
      setTimeout(() => {
        const nextTutorMsg = activeScenario.dialogue[nextTutorIndex];
        setChatHistory((prev) => [...prev, nextTutorMsg]);
      }, 600);
    } else {
      setTimeout(() => {
        setShowResultCard(true);
        updateStreak();
      }, 800);
    }
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const filteredScenarios = REAL_SCENARIOS.filter((sc) => {
    if (filterMode === 'all') return true;
    return sc.category === filterMode;
  });

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row gap-4 p-3 md:p-6 overflow-hidden">
      {/* Scenarios Sidebar */}
      <div
        className={`${
          selectedId && activeTab === 'dialogue' ? 'hidden md:flex' : 'flex'
        } w-full md:w-[320px] flex-1 md:flex-none md:h-full flex-col border theme-border theme-panel rounded-2xl overflow-hidden shrink-0 shadow-xl`}
      >
        {/* Category Filters */}
        <div className="p-3.5 border-b theme-border theme-header flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-black uppercase tracking-wider text-sky-400">
              EVERYDAY ENGLISH
            </span>
            <span className="text-[9px] font-mono font-bold text-sky-200 bg-sky-950/70 border border-sky-600/60 px-2 py-0.5 rounded shadow-sm">
              {REAL_SCENARIOS.length} SCENARIOS
            </span>
          </div>

          <div className="grid grid-cols-4 gap-1 bg-slate-950/70 p-1 rounded-xl border theme-border">
            {(
              [
                { id: 'all', label: 'All' },
                { id: 'Social', label: 'Social' },
                { id: 'Business', label: 'Work' },
                { id: 'Travel', label: 'Travel' },
              ] as const
            ).map((f) => {
              const isFilterActive = filterMode === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id)}
                  className={`py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer text-center ${
                    isFilterActive
                      ? 'bg-sky-500 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scenario List */}
        <div className="flex-1 overflow-y-auto p-2.5 flex flex-col gap-2 theme-panel-sub">
          {filteredScenarios.map((sc) => {
            const isActive = selectedId === sc.id;
            return (
              <button
                key={sc.id}
                onClick={() => startScenario(sc.id, activeTab)}
                className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col gap-1.5 ${
                  isActive
                    ? 'bg-sky-950/70 border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.25)] text-white'
                    : 'bg-slate-900/50 border-slate-700/40 text-slate-300 hover:bg-slate-850 hover:border-sky-700/60 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs tracking-tight truncate">
                    {sc.title}
                  </span>
                  <span
                    className={`text-[8px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${
                      isActive
                        ? 'bg-sky-400 text-slate-950 border-sky-300 font-black'
                        : 'bg-slate-950/80 text-slate-400 border-slate-800'
                    }`}
                  >
                    {sc.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-1">
                  {sc.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col border theme-border theme-panel rounded-2xl overflow-hidden shadow-2xl relative">
        {activeScenario ? (
          showResultCard ? (
            /* Results Screen */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto my-auto gap-5">
              <div className="w-16 h-16 rounded-2xl bg-sky-950/80 border-2 border-sky-400 flex items-center justify-center text-sky-300 font-mono text-sm font-black tracking-widest shadow-[0_0_25px_rgba(56,189,248,0.3)]">
                DONE
              </div>
              <div>
                <span className="text-[10px] font-mono font-black uppercase tracking-widest text-sky-400 bg-sky-950/80 border border-sky-600/60 px-2.5 py-1 rounded-md shadow-sm">
                  SCENARIO COMPLETED
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white mt-2">
                  {activeScenario.title}
                </h3>
                <p className="text-xs text-slate-300 mt-1">
                  You navigated the conversation using authentic spoken English expressions.
                </p>
              </div>

              <div className="flex gap-3 w-full">
                <button
                  onClick={() => setActiveTab('video')}
                  className="flex-1 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border theme-border font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                >
                  WATCH VIDEO
                </button>
                <button
                  onClick={() => startScenario(activeScenario.id, 'dialogue')}
                  className="flex-1 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                >
                  PRACTICE AGAIN
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Header Bar with 3 Clean Tabs */}
              <div className="px-5 py-3 border-b theme-border theme-header flex items-center justify-between shrink-0 gap-3">
                <div className="flex items-center gap-2 truncate">
                  <h3 className="text-xs md:text-sm font-bold text-white truncate">
                    {activeScenario.title}
                  </h3>
                  <span className="text-[8px] font-mono uppercase text-sky-300 bg-sky-950/80 border border-sky-600/60 px-1.5 py-0.5 rounded shrink-0">
                    {activeScenario.category}
                  </span>
                </div>

                {/* Tab Controls */}
                <div className="flex items-center gap-1 bg-slate-950/80 p-1 rounded-xl border theme-border shrink-0">
                  <button
                    onClick={() => setActiveTab('video')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'video'
                        ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Video
                  </button>
                  <button
                    onClick={() => setActiveTab('dialogue')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'dialogue'
                        ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Roleplay
                  </button>
                  <button
                    onClick={() => setActiveTab('vocabulary')}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-mono font-black uppercase tracking-wider transition-all cursor-pointer ${
                      activeTab === 'vocabulary'
                        ? 'bg-sky-500 text-slate-950 font-black shadow-sm'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Vocabulary
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {/* VIDEO TAB */}
                {activeTab === 'video' && (
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-5 max-w-3xl mx-auto w-full">
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border theme-border bg-slate-950 shadow-2xl">
                      {activeScenario.videoEmbed ? (
                        <iframe
                          src={activeScenario.videoEmbed}
                          title={activeScenario.videoTitle || activeScenario.title}
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                          allowFullScreen
                          className="w-full h-full border-0"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs font-mono">
                          Video preview unavailable
                        </div>
                      )}
                    </div>

                    {/* Key Phrases */}
                    {activeScenario.keyVideoPhrases && activeScenario.keyVideoPhrases.length > 0 && (
                      <div className="flex flex-col gap-2.5">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                          KEY EXPRESSIONS
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {activeScenario.keyVideoPhrases.map((phrase, idx) => (
                            <div
                              key={idx}
                              className="p-3 rounded-xl bg-slate-950/70 border theme-border flex items-center justify-between gap-2 shadow-sm"
                            >
                              <span className="text-xs font-medium text-slate-200 truncate pr-2">
                                {phrase}
                              </span>
                              <button
                                onClick={() => handleSpeakText(phrase)}
                                className="px-2.5 py-1 bg-sky-950/70 hover:bg-sky-900/90 text-sky-300 border border-sky-600/60 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
                              >
                                LISTEN
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        onClick={() => setActiveTab('dialogue')}
                        className="w-full sm:w-auto px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-lg shadow-sky-500/20"
                      >
                        START ROLEPLAY CHAT
                      </button>
                    </div>
                  </div>
                )}

                {/* DIALOGUE ROLEPLAY TAB */}
                {activeTab === 'dialogue' && (
                  <div className="flex-1 flex flex-col justify-between overflow-hidden">
                    {/* Chat Messages */}
                    <div className="flex-1 p-4 md:p-6 overflow-y-auto flex flex-col gap-3.5 max-w-2xl mx-auto w-full">
                      {chatHistory.map((msg) => {
                        const isTutor = msg.sender === 'Tutor';
                        return (
                          <div
                            key={msg.id}
                            className={`flex gap-2.5 max-w-[85%] ${
                              isTutor ? 'mr-auto' : 'ml-auto flex-row-reverse'
                            }`}
                          >
                            <div
                              className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 text-[8px] font-mono font-bold border ${
                                isTutor
                                  ? 'bg-sky-950 border-sky-600 text-sky-300'
                                  : 'bg-indigo-950 border-indigo-600 text-indigo-300'
                              }`}
                            >
                              {isTutor ? 'AI' : 'YOU'}
                            </div>
                            <div
                              className={`p-3 rounded-xl border text-xs leading-relaxed shadow-sm ${
                                isTutor
                                  ? 'bg-slate-950/85 border-slate-700/50 text-slate-200'
                                  : 'bg-sky-950/70 border-sky-600/60 text-sky-100'
                              }`}
                            >
                              <p>{msg.text}</p>
                              {msg.pronunciation && (
                                <button
                                  className="mt-1.5 text-sky-400 hover:text-sky-300 cursor-pointer font-mono text-[9px] uppercase tracking-wider block"
                                  onClick={() => handleSpeakText(msg.text)}
                                >
                                  LISTEN AUDIO
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Response Choices */}
                    <div className="p-4 border-t theme-border theme-header shrink-0">
                      <div className="max-w-2xl mx-auto flex flex-col gap-2">
                        <span className="text-[9px] font-mono font-bold uppercase text-sky-400 tracking-wider mb-0.5">
                          CHOOSE YOUR SPOKEN RESPONSE:
                        </span>
                        {userOptions.map((opt, oIdx) => (
                          <button
                            key={oIdx}
                            onClick={() => handleSelectOption(opt)}
                            className="w-full p-3 bg-slate-950/80 hover:bg-sky-950/50 text-slate-200 hover:text-white border theme-border hover:border-sky-400 text-left text-xs rounded-xl transition cursor-pointer flex items-center gap-2.5 shadow-sm"
                          >
                            <span className="w-5 h-5 rounded-md bg-sky-950 border border-sky-600 text-[9px] font-mono font-bold text-sky-300 shrink-0 flex items-center justify-center">
                              {oIdx + 1}
                            </span>
                            <span className="truncate pr-1">{opt}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* VOCABULARY TAB */}
                {activeTab === 'vocabulary' && (
                  <div className="flex-1 overflow-y-auto p-4 md:p-6 flex flex-col gap-4 max-w-3xl mx-auto w-full">
                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-sky-400">
                      SCENARIO VOCABULARY
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {activeScenario.usefulVocabulary.map((vocab, vIdx) => (
                        <div
                          key={vIdx}
                          className="p-3.5 bg-slate-950/70 border theme-border rounded-xl flex items-center justify-between gap-3 shadow-md"
                        >
                          <div className="min-w-0 flex-1">
                            <h5 className="text-xs font-bold text-white truncate">
                              {vocab.word}
                            </h5>
                            <p className="text-[11px] text-slate-300 mt-0.5">
                              {vocab.meaning}
                            </p>
                          </div>
                          <button
                            onClick={() => handleSpeakText(vocab.word)}
                            className="px-2.5 py-1 bg-sky-950/70 hover:bg-sky-900/90 text-sky-300 border border-sky-600/60 rounded-lg text-[9px] font-mono font-bold uppercase tracking-wider transition cursor-pointer shrink-0"
                          >
                            LISTEN
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        ) : null}
      </div>
    </div>
  );
};
