import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Globe, Sparkles } from 'lucide-react';
import { LanguageCode } from '../types';
import { LANGUAGE_CONFIGS } from '../data/seedData';

interface HeaderProps {
  currentLang: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onResetData: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentLang,
  onLanguageChange,
  onResetData,
  isMuted,
  onToggleMute,
}) => {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const langMeta = LANGUAGE_CONFIGS[currentLang];

  const handleConfirmReset = () => {
    onResetData();
    setShowResetConfirm(false);
  };

  return (
    <>
      <header className="sticky top-0 z-30 bg-[#030712]/90 backdrop-blur-md border-b border-cyan-500/20 px-4 py-2.5 flex items-center justify-between">
        {/* Brand Zone */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-[0_0_12px_rgba(6,182,212,0.4)] border border-cyan-300/40">
            <span className="font-extrabold text-sm tracking-tighter text-white">7.3</span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-cyan-300 via-sky-200 to-white bg-clip-text text-transparent">
                VyavasAI
              </span>
              <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-400 bg-cyan-950/60 px-1.5 py-0.2 rounded border border-cyan-500/30">
                Voice OS
              </span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wide">
              मराठी · தமிழ் · हिन्दी · EN
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-full p-0.5 shadow-sm">
            <Globe size={13} className="text-cyan-400 ml-2 mr-1" />
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
              className="bg-transparent text-xs font-semibold text-slate-200 py-1 pr-2.5 focus:outline-none cursor-pointer"
            >
              <option value="mr-IN" className="bg-slate-900 text-white">मराठी</option>
              <option value="ta-IN" className="bg-slate-900 text-white">தமிழ்</option>
              <option value="hi-IN" className="bg-slate-900 text-white">हिन्दी</option>
              <option value="en-US" className="bg-slate-900 text-white">English</option>
            </select>
          </div>

          {/* Voice Audio Mute/Unmute */}
          <button
            onClick={onToggleMute}
            title={isMuted ? 'Unmute Voice' : 'Mute Voice'}
            className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all ${
              isMuted
                ? 'bg-slate-800 text-slate-400 border-slate-700'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40 shadow-[0_0_8px_rgba(6,182,212,0.3)]'
            }`}
          >
            {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Reset Demo Data */}
          <button
            onClick={() => setShowResetConfirm(true)}
            title={langMeta.resetButton}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-900 text-rose-400 border border-rose-500/30 hover:bg-rose-950/40 transition-colors"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </header>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 max-w-xs w-full shadow-2xl">
            <div className="w-10 h-10 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 mb-3 mx-auto">
              <RotateCcw size={20} />
            </div>
            <h3 className="text-sm font-bold text-center text-white mb-2">
              {langMeta.resetButton}
            </h3>
            <p className="text-xs text-slate-300 text-center mb-5">
              {langMeta.resetConfirm}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReset}
                className="flex-1 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white shadow-lg shadow-rose-600/30 hover:bg-rose-500"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
