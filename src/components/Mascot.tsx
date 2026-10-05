import React from 'react';
import { useApp } from '../context/AppContext';
import { translations } from '../utils/i18n';
import { playClickSound } from '../utils/audio';

interface MascotProps {
  mood?: 'idle' | 'happy' | 'thinking' | 'celebrate';
  customMessage?: string;
  className?: string;
  compact?: boolean;
}

export const Mascot: React.FC<MascotProps> = ({
  mood = 'idle',
  customMessage,
  className = '',
  compact = false,
}) => {
  const { language } = useApp();
  const t = translations[language];

  const defaultMsg = mood === 'happy' || mood === 'celebrate'
    ? t.mascotCorrect
    : mood === 'thinking'
    ? t.mascotHint
    : t.mascotWelcome;

  const message = customMessage || defaultMsg;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Animated SVG Parabolik character */}
      <div 
        onClick={() => playClickSound()}
        className={`relative flex-shrink-0 cursor-pointer transform hover:scale-105 active:scale-95 transition-transform duration-200 ${
          compact ? 'w-12 h-12' : 'w-16 h-16 sm:w-20 sm:h-20'
        }`}
        title="Parabolik"
      >
        <svg viewBox="0 0 100 100" className="w-full h-full filter drop-shadow-md">
          <defs>
            <linearGradient id="parabolaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
            <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Parabola antenna arcs */}
          <path
            d="M 50 20 Q 30 5 20 18"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="20" cy="18" r="4" fill="#fbbf24" className="animate-ping" style={{ animationDuration: '3s' }} />
          <circle cx="20" cy="18" r="4" fill="#fbbf24" />

          <path
            d="M 50 20 Q 70 5 80 18"
            fill="none"
            stroke="#ec4899"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          <circle cx="80" cy="18" r="4" fill="#34d399" />

          {/* Main Parabolic Head/Body */}
          <path
            d="M 22 82 C 22 36, 78 36, 78 82 C 78 92, 22 92, 22 82 Z"
            fill="url(#parabolaGrad)"
          />
          <path
            d="M 25 80 C 25 40, 75 40, 75 80"
            fill="url(#bodyGlow)"
          />

          {/* Golden Math Symbol on Chest */}
          <text
            x="50"
            y="85"
            textAnchor="middle"
            fill="#ffffff"
            fontSize="11"
            fontWeight="bold"
            fontFamily="monospace"
          >
            x²
          </text>

          {/* Eyes based on mood */}
          {mood === 'happy' || mood === 'celebrate' ? (
            // Joyful smiling eyes (arcs ^ ^)
            <g stroke="#ffffff" strokeWidth="3" strokeLinecap="round" fill="none">
              <path d="M 37 54 Q 42 47 47 54" />
              <path d="M 53 54 Q 58 47 63 54" />
            </g>
          ) : mood === 'thinking' ? (
            // Curious / thinking eyes
            <g fill="#ffffff">
              <circle cx="42" cy="52" r="5" />
              <circle cx="58" cy="50" r="6" />
              <circle cx="43" cy="51" r="2.2" fill="#0f172a" />
              <circle cx="60" cy="49" r="2.5" fill="#0f172a" />
            </g>
          ) : (
            // Big lively eyes with highlights
            <g fill="#ffffff">
              <circle cx="42" cy="52" r="5.5" />
              <circle cx="58" cy="52" r="5.5" />
              <circle cx="43" cy="52" r="2.8" fill="#0f172a" />
              <circle cx="59" cy="52" r="2.8" fill="#0f172a" />
              <circle cx="44.5" cy="50.5" r="1.2" fill="#ffffff" />
              <circle cx="60.5" cy="50.5" r="1.2" fill="#ffffff" />
            </g>
          )}

          {/* Cheerful blush cheeks */}
          <circle cx="33" cy="62" r="3.5" fill="#f43f5e" opacity="0.6" />
          <circle cx="67" cy="62" r="3.5" fill="#f43f5e" opacity="0.6" />

          {/* Mouth */}
          {mood === 'happy' || mood === 'celebrate' ? (
            <path
              d="M 43 62 Q 50 72 57 62 Z"
              fill="#ffffff"
            />
          ) : mood === 'thinking' ? (
            <ellipse cx="50" cy="64" rx="2.5" ry="3" fill="#ffffff" />
          ) : (
            <path
              d="M 44 63 Q 50 69 56 63"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          )}
        </svg>
      </div>

      {/* Speech bubble */}
      {!compact && (
        <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/80 rounded-2xl px-3.5 py-2 text-xs sm:text-sm text-slate-700 dark:text-slate-200 shadow-sm max-w-sm sm:max-w-md">
          {/* Arrow pointing to mascot */}
          <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-6 border-t-transparent border-r-8 border-r-white dark:border-r-slate-800 border-b-6 border-b-transparent" />
          <div className="flex items-center gap-1.5 font-bold text-sky-600 dark:text-sky-400 mb-0.5 text-[11px] sm:text-xs">
            <span>⚡ {t.mascotName}</span>
          </div>
          <p className="leading-snug">{message}</p>
        </div>
      )}
    </div>
  );
};
