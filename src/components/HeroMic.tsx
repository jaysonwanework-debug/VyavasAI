import React, { useState } from 'react';
import { Mic, MicOff, Send, Sparkles, Keyboard, Volume2, Radio, Zap } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';
import { HolographicAvatar } from './HolographicAvatar';

interface HeroMicProps {
  currentLang: LanguageCode;
  isListening: boolean;
  isThinking: boolean;
  isSpeaking: boolean;
  isLiveMode: boolean;
  onToggleLiveMode: () => void;
  onStartListening: () => void;
  onStopListening: () => void;
  onCommandSubmit: (text: string) => void;
  activeTool?: string;
  onReplaySpeech?: () => void;
  audioVolume?: number;
  modelChoice: string;
  onModelChange: (model: string) => void;
}

export const HeroMic: React.FC<HeroMicProps> = ({
  currentLang,
  isListening,
  isThinking,
  isSpeaking,
  isLiveMode,
  onToggleLiveMode,
  onStartListening,
  onStopListening,
  onCommandSubmit,
  activeTool,
  audioVolume = 0,
  modelChoice,
  onModelChange,
}) => {
  const [showTypeInput, setShowTypeInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  const handleMicClick = () => {
    if (isListening) {
      onStopListening();
    } else {
      onStartListening();
    }
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInput.trim() || isThinking) return;
    onCommandSubmit(textInput.trim());
    setTextInput('');
    setShowTypeInput(false);
  };

  const handleChipClick = (sampleText: string) => {
    if (isThinking) return;
    onCommandSubmit(sampleText);
  };

  return (
    <div className="flex flex-col items-center w-full px-4 pt-1 pb-3">
      {/* Live Mode & Model Bar */}
      <div className="w-full flex items-center justify-between mb-2">
        {/* Live Conversation Mode Toggle */}
        <button
          onClick={onToggleLiveMode}
          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold transition-all ${
            isLiveMode
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.5)]'
              : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:border-slate-700'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isLiveMode ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'
            }`}
          />
          <Radio size={12} className={isLiveMode ? 'text-cyan-300 animate-pulse' : 'text-slate-500'} />
          <span>{isLiveMode ? 'LIVE VOICE: ON' : 'LIVE VOICE: OFF'}</span>
        </button>

        {/* Model Selector */}
        <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-800 rounded-lg px-2 py-0.5">
          <Zap size={11} className="text-amber-400" />
          <select
            value={modelChoice}
            onChange={(e) => onModelChange(e.target.value)}
            className="bg-transparent text-[11px] font-mono text-slate-300 focus:outline-none cursor-pointer"
          >
            <option value="gemini-3.8-flash" className="bg-slate-900 text-white">
              Gemini 3.8 Flash (Saathi)
            </option>
            <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-white">
              Gemini 3.1 Flash Lite (Fast)
            </option>
            <option value="gemini-3.8-live" className="bg-slate-900 text-white">
              Gemini 3.8 Live API
            </option>
          </select>
        </div>
      </div>

      {/* Holographic Avatar with glowing Kirana store silhouette */}
      <HolographicAvatar
        isListening={isListening}
        isThinking={isThinking}
        activeTool={activeTool}
      />

      {/* Hero Mic Section */}
      <div className="relative my-2 flex flex-col items-center">
        {/* Animated concentric pulse rings when listening */}
        {isListening && (
          <>
            <div
              className="absolute rounded-full bg-cyan-400/30 animate-ping pointer-events-none"
              style={{
                inset: `-${10 + (audioVolume * 0.3)}px`,
                animationDuration: '1.5s',
              }}
            />
            <div
              className="absolute rounded-full border border-cyan-400/50 pointer-events-none animate-pulse"
              style={{
                inset: `-${20 + (audioVolume * 0.4)}px`,
              }}
            />
          </>
        )}

        {/* The Huge Hero Microphone Button */}
        <button
          type="button"
          onClick={handleMicClick}
          disabled={isThinking}
          aria-label={isListening ? 'Stop listening' : 'Start voice command'}
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
            isListening
              ? 'bg-gradient-to-b from-rose-500 to-red-600 text-white ring-4 ring-rose-400/50 shadow-[0_0_40px_rgba(244,63,94,0.7)]'
              : isThinking
              ? 'bg-gradient-to-b from-blue-700 to-indigo-800 text-cyan-200 ring-4 ring-cyan-500/40 shadow-[0_0_35px_rgba(6,182,212,0.5)] animate-pulse'
              : 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white ring-4 ring-cyan-400/30 shadow-[0_0_30px_rgba(6,182,212,0.5)] hover:scale-105'
          }`}
          style={{
            transform: isListening ? `scale(${1 + audioVolume * 0.0015})` : undefined,
          }}
        >
          {isListening ? (
            <MicOff className="w-10 h-10 sm:w-12 sm:h-12 animate-bounce" />
          ) : (
            <Mic className="w-10 h-10 sm:w-12 sm:h-12 drop-shadow-md" />
          )}

          <span className="text-[10px] font-bold tracking-wider uppercase mt-1">
            {isListening ? 'LISTENING' : isThinking ? 'THINKING' : 'TAP TO TALK'}
          </span>
        </button>

        {/* Live Audio Visualizer Bars when listening */}
        {isListening && (
          <div className="flex items-center gap-1 mt-3 h-6">
            {[40, 75, 100, 60, 90, 50, 80, 45, 95, 70].map((baseH, i) => {
              const dynamicHeight = Math.max(15, Math.min(100, (baseH * (audioVolume || 50)) / 60));
              return (
                <span
                  key={i}
                  className="w-1.5 bg-gradient-to-t from-cyan-500 to-sky-300 rounded-full transition-all duration-100 shadow-[0_0_6px_rgba(6,182,212,0.6)]"
                  style={{
                    height: `${dynamicHeight}%`,
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Status Caption */}
        <p className="mt-2.5 text-sm font-semibold tracking-wide text-center">
          {isListening ? (
            <span className="text-cyan-300 animate-pulse">{langMeta.listening}</span>
          ) : isThinking ? (
            <span className="text-sky-300 animate-pulse">{langMeta.thinking}</span>
          ) : isSpeaking ? (
            <span className="text-emerald-300 flex items-center justify-center gap-1.5">
              <Volume2 size={16} className="animate-spin" /> {langMeta.speaking}
            </span>
          ) : (
            <span className="text-slate-300">{langMeta.tapToSpeak}</span>
          )}
        </p>
      </div>

      {/* Sample Command Chips for Judges / Instant Testing */}
      <div className="w-full mt-1 mb-2">
        <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
          <Sparkles size={11} className="text-cyan-400" />
          <span>{langMeta.tryText}:</span>
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {langMeta.sampleChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleChipClick(chip.text)}
              disabled={isThinking}
              className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-full bg-slate-900/90 text-slate-200 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-950/40 hover:text-cyan-200 transition-all shadow-sm active:scale-95 text-left"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      {/* Text Input Fallback Toggle & Modal/Drawer */}
      <div className="w-full flex justify-end">
        <button
          onClick={() => setShowTypeInput(!showTypeInput)}
          className="text-[11px] text-slate-400 hover:text-cyan-300 flex items-center gap-1 py-1 transition-colors"
        >
          <Keyboard size={12} />
          <span>{showTypeInput ? 'Hide Keyboard' : langMeta.typeFallback}</span>
        </button>
      </div>

      {showTypeInput && (
        <form onSubmit={handleTypeSubmit} className="w-full mt-2 relative">
          <div className="flex items-center gap-2 bg-slate-900 border border-cyan-500/40 rounded-xl p-1.5 shadow-lg">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder={langMeta.typePlaceholder}
              className="flex-1 bg-transparent text-sm text-white px-3 py-1.5 focus:outline-none"
              autoFocus
            />
            <button
              type="submit"
              disabled={!textInput.trim() || isThinking}
              className="px-3 py-1.5 rounded-lg bg-cyan-600 text-white font-medium text-xs hover:bg-cyan-500 transition-colors disabled:opacity-50 flex items-center gap-1"
            >
              <span>{langMeta.send}</span>
              <Send size={12} />
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
