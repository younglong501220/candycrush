import React from 'react';
import { BoosterType } from '../types';
import { ArrowLeftRight, Hammer, Sparkles, X } from 'lucide-react';

interface BoosterBarProps {
  activeBooster: BoosterType | null;
  boosterCounts: Record<BoosterType, number>;
  onSelectBooster: (type: BoosterType | null) => void;
  isProcessing: boolean;
}

export const BoosterBar: React.FC<BoosterBarProps> = ({
  activeBooster,
  boosterCounts,
  onSelectBooster,
  isProcessing,
}) => {
  const boosters: { type: BoosterType; name: string; icon: React.ReactNode; desc: string }[] = [
    {
      type: 'hammer',
      name: '棒棒糖槌',
      desc: '消除任意一顆糖果',
      icon: <Hammer className="w-5 h-5 text-rose-500" />,
    },
    {
      type: 'color_bomb',
      name: '彩虹生成',
      desc: '將指定糖果變成彩虹球',
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
    },
    {
      type: 'free_swap',
      name: '自由交換',
      desc: '無條件交換兩顆相鄰糖果',
      icon: <ArrowLeftRight className="w-5 h-5 text-indigo-500" />,
    },
  ];

  return (
    <div className="w-full max-w-md mx-auto mt-3 px-1">
      {/* Active Booster Prompt Banner */}
      {activeBooster && (
        <div className="mb-2 p-2 rounded-xl bg-amber-500 text-white flex items-center justify-between text-xs sm:text-sm font-bold shadow-md animate-pulse">
          <span>
            {activeBooster === 'hammer' && '請點選要消除的糖果 🔨'}
            {activeBooster === 'color_bomb' && '請點選要轉化為彩虹炸彈的糖果 ✨'}
            {activeBooster === 'free_swap' && '請先後點擊要交換的兩顆相鄰糖果 🔄'}
          </span>
          <button
            onClick={() => onSelectBooster(null)}
            className="p-1 rounded-lg bg-black/20 hover:bg-black/30 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Boosters Row */}
      <div className="flex items-center justify-around gap-2 bg-white/75 backdrop-blur-md p-2 rounded-2xl border border-white/60 shadow-md">
        {boosters.map((b) => {
          const isActive = activeBooster === b.type;
          const count = boosterCounts[b.type];
          const isDisabled = count <= 0 || isProcessing;

          return (
            <button
              key={b.type}
              id={`booster-${b.type}`}
              onClick={() => onSelectBooster(isActive ? null : b.type)}
              disabled={isDisabled}
              className={`relative flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? 'bg-amber-100 border-2 border-amber-400 shadow-sm scale-105'
                  : 'hover:bg-white/90 active:scale-95'
              } ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {/* Badge count */}
              <span className="absolute -top-1.5 -right-1 bg-rose-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                {count}
              </span>

              <div className="p-1.5 rounded-lg bg-amber-50/80 mb-1">{b.icon}</div>
              <span className="text-[11px] font-bold text-amber-950 tracking-tight">{b.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
