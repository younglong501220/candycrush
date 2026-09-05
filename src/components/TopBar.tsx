import React from 'react';
import { LevelConfig } from '../types';
import { HelpCircle, RotateCcw, Star, Volume2, VolumeX } from 'lucide-react';

interface TopBarProps {
  score: number;
  moves: number;
  levelConfig: LevelConfig;
  isMuted: boolean;
  onToggleMute: () => void;
  onRestart: () => void;
  onOpenHelp: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  score,
  moves,
  levelConfig,
  isMuted,
  onToggleMute,
  onRestart,
  onOpenHelp,
}) => {
  const [s1, s2, s3] = levelConfig.starScores;
  const maxStarScore = s3;
  const progressPercent = Math.min(100, Math.round((score / maxStarScore) * 100));

  const hasStar1 = score >= s1;
  const hasStar2 = score >= s2;
  const hasStar3 = score >= s3;

  return (
    <header className="w-full max-w-md mx-auto mb-3 flex flex-col gap-2.5">
      {/* Top Controls Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-pink-500 to-rose-500 text-white font-black px-3 py-1 rounded-xl text-xs sm:text-sm shadow-sm tracking-wide border border-white/40">
            第 {levelConfig.level} 關
          </div>
          <span className="text-xs sm:text-sm font-bold text-amber-950/80 truncate max-w-[140px] sm:max-w-[200px]">
            {levelConfig.title.split('：')[1] || levelConfig.title}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            id="sound-toggle-btn"
            onClick={onToggleMute}
            aria-label="切換音效"
            className="p-2 rounded-xl bg-white/70 hover:bg-white text-amber-900 shadow-sm border border-amber-200/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-emerald-600" />}
          </button>

          <button
            id="help-btn"
            onClick={onOpenHelp}
            aria-label="規則說明"
            className="p-2 rounded-xl bg-white/70 hover:bg-white text-amber-900 shadow-sm border border-amber-200/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4 text-amber-700" />
          </button>

          <button
            id="restart-btn"
            onClick={onRestart}
            aria-label="重新開始"
            className="p-2 rounded-xl bg-white/70 hover:bg-white text-amber-900 shadow-sm border border-amber-200/60 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-amber-700" />
          </button>
        </div>
      </div>

      {/* Main Score & Moves Stats Card */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-3 shadow-md border border-white/60 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          {/* Score info */}
          <div className="flex flex-col">
            <span className="text-[11px] font-semibold text-amber-800/70 tracking-wider">
              目標分數: {levelConfig.targetScore.toLocaleString()}
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl sm:text-3xl font-black text-amber-950 font-mono tracking-tight">
                {score.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-amber-600">分</span>
            </div>
          </div>

          {/* Moves Left Badge */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-semibold text-amber-800/70">剩餘步數</span>
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl shadow-inner border transition-all ${
                moves <= 5
                  ? 'bg-rose-500 text-white border-rose-600 animate-bounce'
                  : 'bg-gradient-to-b from-amber-100 to-amber-200 text-amber-950 border-amber-300'
              }`}
            >
              {moves}
            </div>
          </div>
        </div>

        {/* 3-Star Progress Bar */}
        <div className="relative pt-2 pb-1">
          {/* Track */}
          <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden shadow-inner border border-amber-200/60 relative">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-yellow-400 to-pink-500 transition-all duration-300 rounded-full shadow-sm"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Star Node Markers */}
          <div className="absolute top-0 inset-x-0 flex justify-between pointer-events-none px-2">
            {/* Star 1 */}
            <div
              className={`flex flex-col items-center transition-transform ${
                hasStar1 ? 'scale-110' : 'opacity-40 grayscale'
              }`}
              style={{ position: 'absolute', left: `${(s1 / maxStarScore) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center shadow-md">
                <Star className="w-3.5 h-3.5 text-amber-900 fill-amber-300" />
              </div>
            </div>

            {/* Star 2 */}
            <div
              className={`flex flex-col items-center transition-transform ${
                hasStar2 ? 'scale-110' : 'opacity-40 grayscale'
              }`}
              style={{ position: 'absolute', left: `${(s2 / maxStarScore) * 100}%`, transform: 'translateX(-50%)' }}
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center shadow-md">
                <Star className="w-3.5 h-3.5 text-amber-900 fill-amber-300" />
              </div>
            </div>

            {/* Star 3 */}
            <div
              className={`flex flex-col items-center transition-transform ${
                hasStar3 ? 'scale-110' : 'opacity-40 grayscale'
              }`}
              style={{ position: 'absolute', left: '95%', transform: 'translateX(-50%)' }}
            >
              <div className="w-5 h-5 rounded-full bg-amber-400 border border-white flex items-center justify-center shadow-md">
                <Star className="w-3.5 h-3.5 text-amber-900 fill-amber-300" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
