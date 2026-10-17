import React from 'react';

interface HolographicAvatarProps {
  isListening: boolean;
  isThinking: boolean;
  activeTool?: string;
}

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
  isListening,
  isThinking,
  activeTool,
}) => {
  return (
    <div className="relative flex items-center justify-center my-2 select-none">
      {/* Background ambient glow */}
      <div
        className={`absolute w-48 h-48 rounded-full transition-all duration-700 blur-2xl ${
          isListening
            ? 'bg-cyan-500/35 scale-110'
            : isThinking
            ? 'bg-blue-600/30 scale-105 animate-pulse'
            : 'bg-cyan-500/15 scale-95'
        }`}
      />

      {/* Main Holographic Container */}
      <div className="relative flex items-center gap-3">
        {/* Silhouette Center Dial */}
        <div className="relative w-36 h-36 rounded-full border border-cyan-400/30 bg-[#070e1f]/80 p-2 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.25)]">
          {/* Animated concentric sonic rings */}
          <div
            className={`absolute inset-0 rounded-full border border-cyan-500/20 transition-transform ${
              isListening ? 'animate-ping opacity-75' : 'opacity-20'
            }`}
          />
          <div
            className={`absolute -inset-1.5 rounded-full border border-dashed border-cyan-400/40 transition-all ${
              isThinking ? 'animate-spin' : ''
            }`}
            style={{ animationDuration: '12s' }}
          />

          {/* SVG Silhouette of Kirana Shopkeeper with twirled moustache and sound waves */}
          <svg
            viewBox="0 0 160 160"
            className="w-28 h-28 text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.7)]"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Glow filter */}
            <defs>
              <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="cyanGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#38bdf8" />
                <stop offset="100%" stopColor="#0284c7" />
              </linearGradient>
            </defs>

            {/* Shopkeeper head and hair silhouette */}
            <path
              d="M48 68 C46 50, 56 36, 75 34 C94 32, 106 42, 104 60 C108 64, 108 72, 102 76 C100 84, 90 94, 76 96 C62 98, 52 86, 50 76 C46 72, 46 68, 48 68 Z"
              fill="url(#cyanGrad)"
              opacity="0.85"
            />

            {/* Traditional twirled moustache */}
            <path
              d="M62 76 Q75 79 77 74 Q79 79 92 76 Q85 86 77 82 Q69 86 62 76 Z"
              fill="#e0f2fe"
              filter="url(#neon-glow)"
            />
            {/* Moustache tips curved upwards */}
            <path
              d="M62 76 Q54 75 50 71 Q53 74 62 76 Z"
              fill="#e0f2fe"
            />
            <path
              d="M92 76 Q100 75 104 71 Q101 74 92 76 Z"
              fill="#e0f2fe"
            />

            {/* Apron / Kurta shoulders */}
            <path
              d="M36 138 C38 108, 54 100, 76 100 C98 100, 114 108, 116 138 Z"
              fill="url(#cyanGrad)"
              opacity="0.75"
            />
            {/* Apron straps */}
            <path
              d="M58 102 L54 138 M94 102 L98 138"
              stroke="#082f49"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Voice Soundwaves radiating from mouth */}
            <g
              className={isListening ? 'animate-pulse' : ''}
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeLinecap="round"
              filter="url(#neon-glow)"
            >
              <path d="M110 68 Q115 75 110 82" />
              <path d="M118 64 Q126 75 118 86" />
              <path d="M126 60 Q138 75 126 90" />
            </g>
          </svg>
        </div>

        {/* HUD Nodes on the right - exactly like the uploaded logo! */}
        <div className="hidden sm:flex flex-col gap-1.5 text-[10px] font-mono">
          {[
            { id: 'create_order', label: 'PLACE ORDER', icon: '🛒' },
            { id: 'check_stock', label: 'CHECK STOCK', icon: '📦' },
            { id: 'add_to_customer_ledger', label: 'UPDATE BILL', icon: '₹' },
            { id: 'update_stock', label: 'UPDATE STOCK', icon: '🔄' },
            { id: 'reply', label: 'REPLY IN VERNACULAR', icon: '💬' },
          ].map((node) => {
            const isActive = activeTool === node.id || (node.id === 'reply' && isThinking);
            return (
              <div
                key={node.id}
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded border transition-all ${
                  isActive
                    ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-900/40 border-slate-800 text-slate-400'
                }`}
              >
                <span>{node.icon}</span>
                <span className="font-semibold tracking-wider">{node.label}</span>
                {isActive && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping ml-auto" />}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
