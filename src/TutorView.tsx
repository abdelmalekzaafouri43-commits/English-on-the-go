import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { useOffline } from './OfflineContext';
import { useTheme } from './ThemeContext';

interface Message {
  id: string;
  sender: 'tutor' | 'user';
  text: string;
  date: string;
}

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
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg',
      sender: 'tutor',
      text: `### Welcome to your AI English Coach

I am here to help you master English! You can ask me to:

* **Explain grammar rules**
* **Check your spelling and phrasing**
* **Suggest better vocabulary**
* **Practice conversation**

How can I help you today?`,
      date: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([
    'How do I use "whom" vs "who"?',
    'Can we practice a job interview?',
    'What is the difference between past perfect and simple past?',
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
        },
      ]);
      setSuggestions([
        'Explain past perfect continuous',
        'Audit a paragraph',
        'Help me write an email',
      ]);
    }
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      date: new Date().toISOString(),
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
          mode: 'general',
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
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="ai-tutor-view" className="flex-1 flex flex-col h-full overflow-hidden">
      {/* Top Header */}
      <div className="px-4 py-3 border-b theme-border theme-header flex items-center justify-between shrink-0">
        <h2 className="text-sm font-black tracking-wider text-slate-200">AI ENGLISH COACH</h2>
        
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
              placeholder="Ask your AI English Coach anything..."
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
