import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useOffline } from './OfflineContext';
import { useTheme } from './ThemeContext';

type CoachMode = 'general' | 'grammar_audit' | 'email' | 'social' | 'essay' | 'vocab';

interface Message {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  date: string;
  mode?: CoachMode;
}

const COACH_MODES: { id: CoachMode; label: string; placeholder: string }[] = [
  {
    id: 'general',
    label: 'Conversation',
    placeholder: 'Ask any English question, grammar rule, or conversation practice...',
  },
  {
    id: 'grammar_audit',
    label: 'Grammar Clinic',
    placeholder: 'Paste any text or sentence to audit grammar, spelling, and phrasing...',
  },
  {
    id: 'email',
    label: 'Email & Writing',
    placeholder: 'Ask to write, polish, or rewrite an email or message...',
  },
  {
    id: 'social',
    label: 'Social Media',
    placeholder: 'Draft an engaging Facebook post, LinkedIn hook, or tweet...',
  },
  {
    id: 'essay',
    label: 'Blog & Article',
    placeholder: 'Structure a blog post, essay, or long-form article...',
  },
  {
    id: 'vocab',
    label: 'Vocab Booster',
    placeholder: 'Enter any word to discover C1/C2 advanced alternatives & examples...',
  },
];

const QUICK_STARTERS: { title: string; mode: CoachMode; prompt: string }[] = [
  {
    title: 'Formal Resignation Email',
    mode: 'email',
    prompt: 'Draft a polite, professional 2-week resignation email thanking management for opportunities and offering a smooth handover.',
  },
  {
    title: 'High-Converting Facebook Post',
    mode: 'social',
    prompt: 'Write an engaging Facebook post about learning a new language. Start with a hook, share a short story, and end with a question for the audience.',
  },
  {
    title: 'Structured Blog Post Outline',
    mode: 'essay',
    prompt: 'Write a comprehensive outline for a blog article titled "The Secret to Daily Productivity." Include a catchy introduction, 3 main sections, and a strong conclusion.',
  },
  {
    title: 'Audit Past vs Present Perfect',
    mode: 'grammar_audit',
    prompt: 'Explain the difference between "I lived in London for 2 years" and "I have lived in London for 2 years" with clear examples.',
  },
];

// Clean Markdown Renderer
const TutorMarkdown: React.FC<{ content: string }> = ({ content }) => {
  return (
    <div className="prose prose-invert prose-sm max-w-none break-words text-slate-200 text-xs md:text-sm leading-relaxed">
      <ReactMarkdown
        components={{
          h1: ({ children }) => (
            <h1 className="text-sm md:text-base font-black text-white bg-slate-950/80 border-l-4 border-l-sky-400 px-3 py-1 rounded-r-lg my-2.5">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xs md:text-sm font-extrabold text-sky-200 border-l-2 border-l-sky-400 pl-2.5 my-2 uppercase tracking-wider">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-xs font-bold text-amber-300 my-1.5 uppercase tracking-wider">
              {children}
            </h3>
          ),
          p: ({ children }) => <p className="mb-2 leading-relaxed text-slate-200">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-4 mb-2 space-y-1 text-slate-300">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 mb-2 space-y-1 text-slate-300">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          strong: ({ children }) => (
            <strong className="font-bold text-sky-200 bg-sky-950/60 px-1 py-0.5 rounded">
              {children}
            </strong>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-sky-400 pl-3 py-1.5 my-2 bg-sky-950/30 text-sky-100 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ children }) => (
            <code className="bg-slate-950 border border-slate-800 text-sky-300 px-1.5 py-0.5 rounded font-mono text-[11px]">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export const TutorView: React.FC = () => {
  const { isOnline } = useOffline();
  const { currentThemeConfig } = useTheme();
  const [activeMode, setActiveMode] = useState<CoachMode>('general');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      sender: 'tutor',
      text: `### Welcome to your Personal AI English Coach

I am ready to help you achieve full English mastery. You can switch modes above or ask anything:

* **Grammar Clinic**: Audit sentences and understand confusing rules.
* **Email & Writing**: Generate high-impact emails, cover letters, and reports.
* **Social Media**: Draft engaging Facebook posts, LinkedIn updates, or tweets.
* **Blog & Article**: Structure long-form essays, blogs, or academic content.
* **Vocab Booster**: Discover advanced synonyms and natural native idioms.
* **Conversation**: Practice real dialogues with instant feedback.

Select a quick starter below or type your question to begin!`,
      date: new Date().toISOString(),
      mode: 'general',
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How do I use "whom" vs "who"?',
    'Audit this sentence for mistakes',
    'Write a follow-up business email',
  ]);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSpeakText = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, '').trim();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'en-US';
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleClearChat = () => {
    if (window.confirm('Clear conversation history?')) {
      setMessages([
        {
          id: 'welcome_reset_' + Date.now(),
          sender: 'tutor',
          text: 'Conversation reset. What would you like to explore next?',
          date: new Date().toISOString(),
          mode: activeMode,
        },
      ]);
      setSuggestions([
        'Explain past perfect continuous',
        'Audit a paragraph',
        'Help me write an email',
      ]);
    }
  };

  const handleSendMessage = async (textToSend: string, modeOverride?: CoachMode) => {
    if (!textToSend.trim() || isLoading) return;

    const targetMode = modeOverride || activeMode;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      date: new Date().toISOString(),
      mode: targetMode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
    }
    setIsLoading(true);

    try {
      const historyPayload = messages.slice(-6).map((m) => ({
        role: m.sender === 'user' ? 'user' : 'model',
        text: m.text,
      }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend.trim(),
          history: historyPayload,
          mode: targetMode,
          tone: 'professional',
        }),
      });

      if (!response.ok) {
        throw new Error('Server error');
      }

      const data = await response.json();

      const tutorMsg: Message = {
        id: 'tutor_' + Date.now(),
        sender: 'tutor',
        text: data.response || 'I had trouble processing that request. Please try again.',
        date: new Date().toISOString(),
        mode: targetMode,
      };

      setMessages((prev) => [...prev, tutorMsg]);
      if (data.suggestions && Array.isArray(data.suggestions)) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      // Local fallback
      const fallbackMsg: Message = {
        id: 'fallback_' + Date.now(),
        sender: 'tutor',
        text: `### Grammar & Language Insight

Here is a quick breakdown regarding your query:

> **Key Rule:** In English communication, clarity and subject-verb consistency always come first. 

* **Active Voice:** Keep the subject performing the action (*"The team completed the report"* vs *"The report was completed by the team"*).
* **Preposition Precision:** Match prepositions directly to the preceding verb or adjective.

*(Note: Operating in local offline mode. Reconnect for full live AI streaming!)*`,
        date: new Date().toISOString(),
        mode: targetMode,
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const currentPlaceholder =
    COACH_MODES.find((m) => m.id === activeMode)?.placeholder || 'Type your message...';

  return (
    <div id="ai-tutor-view" className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header with Coach Mode Pills & Actions */}
      <div className="px-4 py-2.5 border-b theme-border theme-header flex flex-wrap items-center justify-between gap-2 shrink-0">
        {/* Mode Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
          {COACH_MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                id={`tutor-mode-${mode.id}`}
                onClick={() => setActiveMode(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? `${currentThemeConfig.activeBtnClass} shadow-md`
                    : 'bg-slate-950/80 hover:bg-slate-900 border theme-border text-slate-400 hover:text-white'
                }`}
              >
                {mode.label}
              </button>
            );
          })}
        </div>

        {/* Clear Chat Action */}
        <button
          onClick={handleClearChat}
          className="px-2.5 py-1 text-[10px] font-mono text-slate-400 hover:text-rose-300 border theme-border rounded-lg bg-slate-950 hover:bg-rose-950/40 transition cursor-pointer"
        >
          CLEAR CHAT
        </button>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto space-y-4 max-w-4xl mx-auto w-full">
        {messages.map((msg) => {
          const isTutor = msg.sender === 'tutor';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isTutor ? 'items-start' : 'items-end'} gap-1`}
            >
              <div className="flex items-center gap-2 px-1">
                <span className="text-[10px] font-mono font-bold uppercase text-slate-400">
                  {isTutor ? 'AI ENGLISH COACH' : 'YOU'}
                </span>
                <span className="text-[9px] font-mono text-slate-500">
                  {new Date(msg.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div
                className={`p-4 rounded-2xl max-w-[92%] md:max-w-[85%] shadow-md border leading-relaxed ${
                  isTutor
                    ? 'theme-panel border-slate-700/60 text-slate-100 rounded-tl-sm'
                    : 'bg-sky-600 text-white border-sky-500 rounded-tr-sm font-medium text-xs md:text-sm'
                }`}
              >
                {isTutor ? (
                  <div>
                    <TutorMarkdown content={msg.text} />

                    {/* Action Bar for Tutor Responses */}
                    <div className="flex items-center justify-end gap-2 mt-3 pt-2 border-t theme-border">
                      <button
                        onClick={() => handleSpeakText(msg.text)}
                        className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-900 border theme-border text-slate-300 hover:text-white text-[10px] font-mono uppercase cursor-pointer"
                      >
                        SPEAK AUDIO
                      </button>
                      <button
                        onClick={() => handleCopyText(msg.text, msg.id)}
                        className="px-2 py-1 rounded bg-slate-950 hover:bg-slate-900 border theme-border text-slate-300 hover:text-white text-[10px] font-mono uppercase cursor-pointer"
                      >
                        {copiedId === msg.id ? 'COPIED!' : 'COPY'}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex flex-col items-start gap-1">
            <span className="text-[10px] font-mono font-bold uppercase text-sky-400 px-1">
              AI ENGLISH COACH THINKING...
            </span>
            <div className="p-3.5 rounded-2xl theme-panel border-slate-700/60 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
                style={{ animationDelay: '0.15s' }}
              />
              <div
                className="w-2 h-2 rounded-full bg-sky-400 animate-bounce"
                style={{ animationDelay: '0.3s' }}
              />
            </div>
          </div>
        )}

        {/* Quick Starters (shown when only 1 message exists) */}
        {messages.length === 1 && (
          <div className="pt-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 block mb-2">
              POPULAR QUICK TOPICS
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_STARTERS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setActiveMode(item.mode);
                    handleSendMessage(item.prompt, item.mode);
                  }}
                  className="p-3 rounded-xl bg-slate-950/80 hover:bg-slate-900 border theme-border theme-animated-border text-left transition cursor-pointer flex flex-col justify-between gap-1 group"
                >
                  <span className="text-xs font-bold text-white group-hover:text-sky-300">
                    {item.title}
                  </span>
                  <span className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {item.prompt}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested Follow-up Chips */}
      {suggestions.length > 0 && !isLoading && (
        <div className="px-4 py-2 border-t theme-border bg-slate-950/60 shrink-0">
          <div className="max-w-4xl mx-auto flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            <span className="text-[9px] font-mono text-slate-500 uppercase font-bold shrink-0">
              SUGGESTED:
            </span>
            {suggestions.map((sug, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(sug)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border theme-border text-slate-300 hover:text-white text-[11px] whitespace-nowrap transition cursor-pointer"
              >
                {sug}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form Bar */}
      <div className="p-3 md:p-4 border-t theme-border theme-header shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(input);
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(input);
                }
              }}
              placeholder={currentPlaceholder}
              className="w-full bg-slate-950/90 border theme-border rounded-xl px-4 py-2.5 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-sky-500 resize-none max-h-32 leading-relaxed"
            />
          </div>

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-md shrink-0 h-10 flex items-center justify-center"
          >
            SEND
          </button>
        </form>
      </div>
    </div>
  );
};
