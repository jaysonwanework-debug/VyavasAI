import React, { useRef, useEffect, useState } from 'react';
import { User, Bot, Volume2, Sparkles, Send, Mic, Trash2, CheckCircle2 } from 'lucide-react';
import { ChatMessage, LanguageCode } from '../types';

interface ChatFeedProps {
  messages: ChatMessage[];
  currentTranscript: string;
  isListening: boolean;
  isThinking: boolean;
  onReplay: (text: string) => void;
  currentLang: LanguageCode;
  onSendMessage?: (text: string) => void;
  onClearChat?: () => void;
  onToggleMic?: () => void;
}

export const ChatFeed: React.FC<ChatFeedProps> = ({
  messages,
  currentTranscript,
  isListening,
  isThinking,
  onReplay,
  onSendMessage,
  onClearChat,
  onToggleMic,
}) => {
  const [inputText, setInputText] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, currentTranscript, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isThinking || !onSendMessage) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  return (
    <div className="w-full my-3 bg-slate-900/80 border border-slate-800 rounded-2xl p-3 shadow-lg flex flex-col">
      {/* Chat Header */}
      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-cyan-950 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Bot size={14} />
          </div>
          <div>
            <span className="text-xs font-bold text-white tracking-wide">
              Dukaan Saathi Multi-Turn Chat
            </span>
            <span className="text-[10px] text-slate-400 ml-2 font-mono">
              ({messages.length} संदेश)
            </span>
          </div>
        </div>

        {onClearChat && messages.length > 1 && (
          <button
            onClick={onClearChat}
            title="Clear Chat"
            className="text-[10px] text-slate-400 hover:text-rose-400 font-mono flex items-center gap-1 transition-colors"
          >
            <Trash2 size={11} />
            <span>Clear</span>
          </button>
        )}
      </div>

      {/* Scrollable Message Thread */}
      <div
        ref={scrollRef}
        className="max-h-72 overflow-y-auto space-y-3 pr-1 py-1 scroll-smooth"
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            } animate-fadeIn`}
          >
            <div
              className={`max-w-[85%] rounded-2xl p-3 shadow-md ${
                msg.role === 'user'
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none shadow-cyan-950/30'
                  : 'bg-slate-950 border border-slate-800 text-slate-100 rounded-tl-none shadow-black/40'
              }`}
            >
              {/* Header info */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider">
                  {msg.role === 'user' ? (
                    <>
                      <User size={11} className="text-cyan-200" />
                      <span className="text-cyan-100 font-bold">दुकानदार</span>
                    </>
                  ) : (
                    <>
                      <Bot size={11} className="text-cyan-400" />
                      <span className="text-cyan-300 font-bold">Dukaan Saathi</span>
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-500 font-mono">
                  {msg.timestamp}
                </span>
              </div>

              {/* Message text */}
              <p className="text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-wrap">
                {msg.text}
              </p>

              {/* Tool Execution Tags if available */}
              {msg.agentSteps && msg.agentSteps.length > 0 && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex flex-wrap gap-1">
                  {msg.agentSteps.map((st, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
                    >
                      <CheckCircle2 size={9} className="text-emerald-400" />
                      {st.toolName}
                    </span>
                  ))}
                </div>
              )}

              {/* Replay Voice button */}
              {msg.role === 'agent' && (
                <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex justify-end">
                  <button
                    onClick={() => onReplay(msg.text)}
                    className="flex items-center gap-1 text-[10px] font-mono text-cyan-400 hover:text-cyan-300 py-0.5 px-2 rounded-lg bg-cyan-950/40 border border-cyan-500/30 transition-colors"
                  >
                    <Volume2 size={11} />
                    <span>पुन्हा ऐका (Replay)</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Interim Transcript Bubble while listening */}
        {isListening && currentTranscript && (
          <div className="flex justify-end animate-fadeIn">
            <div className="max-w-[85%] bg-cyan-950/80 border border-cyan-400/50 rounded-2xl rounded-tr-none p-3 shadow-md">
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-cyan-300 uppercase tracking-wider mb-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                <span>Live Voice Input</span>
              </div>
              <p className="text-xs sm:text-sm font-medium text-cyan-100 italic">
                "{currentTranscript}"
              </p>
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex justify-start animate-fadeIn">
            <div className="bg-slate-950 border border-slate-800 rounded-2xl rounded-tl-none p-3 text-xs text-cyan-300 italic flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Dukaan Saathi is planning and executing tools...</span>
            </div>
          </div>
        )}
      </div>

      {/* Inline Quick Chat Bar */}
      {onSendMessage && (
        <form onSubmit={handleSubmit} className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center gap-2">
          {onToggleMic && (
            <button
              type="button"
              onClick={onToggleMic}
              disabled={isThinking}
              className={`w-8 h-8 rounded-xl flex items-center justify-center border transition-all ${
                isListening
                  ? 'bg-rose-500 text-white border-rose-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-cyan-400 border-slate-700'
              }`}
              title={isListening ? 'Stop Mic' : 'Start Mic'}
            >
              <Mic size={15} />
            </button>
          )}

          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="येथे संदेश लिहा किंवा माईक दाबा..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
          />

          <button
            type="submit"
            disabled={!inputText.trim() || isThinking}
            className="w-8 h-8 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white flex items-center justify-center transition-colors shadow-sm"
          >
            <Send size={13} />
          </button>
        </form>
      )}
    </div>
  );
};
