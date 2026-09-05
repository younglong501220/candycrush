import React from 'react';
import { CandyTile } from '../types';
import { CANDY_VISUALS } from '../utils/constants';
import { Sparkles, Zap } from 'lucide-react';

interface CandyPieceProps {
  tile: CandyTile;
  isSelected?: boolean;
  isHint?: boolean;
  onClick?: () => void;
  onPointerDown?: (e: React.PointerEvent) => void;
}

export const CandyPiece: React.FC<CandyPieceProps> = ({
  tile,
  isSelected,
  isHint,
  onClick,
  onPointerDown,
}) => {
  const visual = CANDY_VISUALS[tile.color];
  const isColorBomb = tile.special === 'color_bomb';

  return (
    <div
      id={`tile-${tile.row}-${tile.col}`}
      onClick={onClick}
      onPointerDown={onPointerDown}
      className={`relative w-full h-full flex items-center justify-center cursor-pointer select-none transition-transform duration-150 touch-none ${
        tile.isMatched ? 'pop-animate' : ''
      } ${isHint ? 'hint-animate' : ''} ${
        isSelected ? 'scale-110 z-20' : 'hover:scale-105 active:scale-95'
      }`}
      style={{ touchAction: 'none' }}
    >
      {/* Selection Glow Ring */}
      {isSelected && (
        <div className="absolute inset-[-4px] rounded-2xl border-3 border-amber-300 shadow-[0_0_15px_rgba(251,191,36,0.8)] animate-pulse z-10 pointer-events-none" />
      )}

      {/* Main Candy Body */}
      {isColorBomb ? (
        // Color Bomb Disco Ball
        <div className="relative w-[86%] h-[86%] rounded-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-amber-950 flex items-center justify-center shadow-lg border-2 border-amber-400/80 disco-ball-glow overflow-hidden">
          {/* Rainbow Sprinkles on the chocolate ball */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span className="absolute text-xs" style={{ top: '15%', left: '20%' }}>🟣</span>
            <span className="absolute text-xs" style={{ top: '18%', right: '22%' }}>🟡</span>
            <span className="absolute text-xs" style={{ bottom: '18%', left: '22%' }}>🔴</span>
            <span className="absolute text-xs" style={{ bottom: '20%', right: '18%' }}>🟢</span>
            <span className="absolute text-xs" style={{ top: '45%', left: '42%' }}>🔵</span>
            <span className="absolute text-xs" style={{ top: '48%', right: '15%' }}>🟠</span>
          </div>

          <Sparkles className="w-5 h-5 text-amber-200 animate-spin z-10" style={{ animationDuration: '6s' }} />

          {/* Specular highlight */}
          <div className="absolute inset-0 rounded-full candy-gloss pointer-events-none" />
        </div>
      ) : (
        // Standard, Striped, or Wrapped Candy
        <div
          className={`relative w-[86%] h-[86%] flex items-center justify-center shadow-md transition-all overflow-hidden border ${
            visual.borderColor
          } bg-gradient-to-br ${visual.bgGradient} ${
            visual.shape === 'circle'
              ? 'rounded-full'
              : visual.shape === 'square'
              ? 'rounded-xl'
              : visual.shape === 'lozenge'
              ? 'rounded-[1.2rem]'
              : visual.shape === 'droplet'
              ? 'rounded-t-full rounded-b-2xl'
              : 'rounded-2xl'
          }`}
          style={{
            boxShadow: `0 4px 8px ${visual.shadowColor}, inset 0 2px 4px rgba(255,255,255,0.6), inset 0 -3px 4px rgba(0,0,0,0.25)`,
          }}
        >
          {/* Specular gloss top layer */}
          <div className="absolute inset-0 candy-gloss pointer-events-none" />

          {/* Special Type Overlays */}
          {tile.special === 'striped_h' && (
            <div className="absolute inset-0 striped-pattern-h pointer-events-none flex items-center justify-center">
              <div className="w-full h-1 bg-white/90 shadow-[0_0_6px_#fff]" />
            </div>
          )}

          {tile.special === 'striped_v' && (
            <div className="absolute inset-0 striped-pattern-v pointer-events-none flex items-center justify-center">
              <div className="w-1 h-full bg-white/90 shadow-[0_0_6px_#fff]" />
            </div>
          )}

          {tile.special === 'wrapped' && (
            <div className="absolute inset-0 border-2 border-white/80 rounded-xl bg-white/20 flex items-center justify-center pointer-events-none shadow-[inset_0_0_8px_rgba(255,255,255,0.8)]">
              <div className="w-full h-full border border-dashed border-white/60 m-0.5 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.5)] fill-white/60 animate-pulse" />
              </div>
            </div>
          )}

          {/* Emoji / Candy Emblem */}
          <span className="text-xl sm:text-2xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)] filter contrast-110 select-none pointer-events-none transform translate-y-[-1px]">
            {visual.emoji}
          </span>
        </div>
      )}
    </div>
  );
};
