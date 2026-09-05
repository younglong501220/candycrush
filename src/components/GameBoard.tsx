import React, { useRef, useState } from 'react';
import { BoosterType, CandyTile, ComboBanner, FloatingScore, Position } from '../types';
import { BOARD_COLS, BOARD_ROWS } from '../utils/constants';
import { CandyPiece } from './CandyPiece';
import { AnimatePresence, motion } from 'motion/react';

interface GameBoardProps {
  board: (CandyTile | null)[][];
  selectedTile: Position | null;
  hintTiles: { from: Position; to: Position } | null;
  activeBooster: BoosterType | null;
  comboBanner: ComboBanner | null;
  floatingScores: FloatingScore[];
  blastEffects: { id: string; row: number; col: number; direction: 'h' | 'v' | 'both' | 'area' }[];
  onTileClick: (row: number, col: number) => void;
  onTileSwipe: (from: Position, to: Position) => void;
  isProcessing: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  board,
  selectedTile,
  hintTiles,
  activeBooster,
  comboBanner,
  floatingScores,
  blastEffects,
  onTileClick,
  onTileSwipe,
  isProcessing,
}) => {
  const pointerStartRef = useRef<{ x: number; y: number; row: number; col: number } | null>(null);
  const [swipingTile, setSwipingTile] = useState<Position | null>(null);

  const handlePointerDown = (e: React.PointerEvent, row: number, col: number) => {
    if (isProcessing) return;
    pointerStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      row,
      col,
    };
    setSwipingTile({ row, col });
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!pointerStartRef.current || isProcessing) return;

    const dx = e.clientX - pointerStartRef.current.x;
    const dy = e.clientY - pointerStartRef.current.y;
    const threshold = 28; // Pixel swipe threshold

    if (Math.abs(dx) > threshold || Math.abs(dy) > threshold) {
      const from = { row: pointerStartRef.current.row, col: pointerStartRef.current.col };
      let to: Position;

      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        to = {
          row: from.row,
          col: dx > 0 ? Math.min(BOARD_COLS - 1, from.col + 1) : Math.max(0, from.col - 1),
        };
      } else {
        // Vertical swipe
        to = {
          row: dy > 0 ? Math.min(BOARD_ROWS - 1, from.row + 1) : Math.max(0, from.row - 1),
          col: from.col,
        };
      }

      pointerStartRef.current = null;
      setSwipingTile(null);

      if (from.row !== to.row || from.col !== to.col) {
        onTileSwipe(from, to);
      }
    }
  };

  const handlePointerUp = () => {
    pointerStartRef.current = null;
    setSwipingTile(null);
  };

  return (
    <div
      id="game-board-container"
      className="relative flex items-center justify-center select-none"
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {/* Outer Board Frame */}
      <div
        id="board"
        className={`relative grid grid-cols-8 grid-rows-8 gap-1 p-2 sm:p-3 rounded-2xl bg-amber-950/40 backdrop-blur-md shadow-[0_12px_32px_rgba(0,0,0,0.25),inset_0_2px_4px_rgba(255,255,255,0.25)] border-4 border-amber-200/50 w-[min(92vw,440px)] h-[min(92vw,440px)] ${
          activeBooster === 'hammer' ? 'cursor-crosshair ring-4 ring-rose-400' : ''
        }`}
      >
        {/* Background Tile Checkerboard */}
        <div className="absolute inset-2 sm:inset-3 grid grid-cols-8 grid-rows-8 gap-1 pointer-events-none -z-0">
          {Array.from({ length: BOARD_ROWS * BOARD_COLS }).map((_, idx) => {
            const r = Math.floor(idx / BOARD_COLS);
            const c = idx % BOARD_COLS;
            const isDark = (r + c) % 2 === 1;
            return (
              <div
                key={`bg-${r}-${c}`}
                className={`rounded-xl transition-colors ${
                  isDark ? 'bg-amber-900/25' : 'bg-amber-800/15'
                }`}
              />
            );
          })}
        </div>

        {/* Board Tiles */}
        {board.map((row, r) =>
          row.map((tile, c) => {
            const isSelected = selectedTile?.row === r && selectedTile?.col === c;
            const isHint =
              Boolean(hintTiles &&
              ((hintTiles.from.row === r && hintTiles.from.col === c) ||
                (hintTiles.to.row === r && hintTiles.to.col === c)));

            return (
              <div key={`cell-${r}-${c}`} className="relative w-full h-full flex items-center justify-center">
                {tile ? (
                  <CandyPiece
                    tile={tile}
                    isSelected={isSelected}
                    isHint={isHint}
                    onClick={() => onTileClick(r, c)}
                    onPointerDown={(e) => handlePointerDown(e, r, c)}
                  />
                ) : (
                  <div className="w-full h-full" />
                )}
              </div>
            );
          })
        )}

        {/* Active Laser Blast Beams */}
        {blastEffects.map((effect) => {
          if (effect.direction === 'h') {
            return (
              <motion.div
                key={effect.id}
                initial={{ scaleY: 0, opacity: 1 }}
                animate={{ scaleY: [0, 1.5, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.35 }}
                className="absolute left-2 right-2 h-4 bg-gradient-to-r from-transparent via-white to-transparent pointer-events-none z-30 shadow-[0_0_15px_#fff]"
                style={{ top: `calc(${(effect.row / BOARD_ROWS) * 100}% + 2.5%)` }}
              />
            );
          }
          if (effect.direction === 'v') {
            return (
              <motion.div
                key={effect.id}
                initial={{ scaleX: 0, opacity: 1 }}
                animate={{ scaleX: [0, 1.5, 0], opacity: [1, 1, 0] }}
                transition={{ duration: 0.35 }}
                className="absolute top-2 bottom-2 w-4 bg-gradient-to-b from-transparent via-white to-transparent pointer-events-none z-30 shadow-[0_0_15px_#fff]"
                style={{ left: `calc(${(effect.col / BOARD_COLS) * 100}% + 2.5%)` }}
              />
            );
          }
          if (effect.direction === 'area') {
            return (
              <motion.div
                key={effect.id}
                initial={{ scale: 0.2, opacity: 1 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute w-24 h-24 rounded-full border-4 border-amber-300 bg-amber-400/30 pointer-events-none z-30 shadow-[0_0_20px_#f59e0b]"
                style={{
                  top: `calc(${((effect.row + 0.5) / BOARD_ROWS) * 100}% - 48px)`,
                  left: `calc(${((effect.col + 0.5) / BOARD_COLS) * 100}% - 48px)`,
                }}
              />
            );
          }
          return null;
        })}

        {/* Floating Match Scores */}
        <AnimatePresence>
          {floatingScores.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 1, y: 0, scale: 0.8 }}
              animate={{ opacity: 0, y: -28, scale: 1.25 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.65, ease: 'easeOut' }}
              className="absolute pointer-events-none z-40 font-black text-amber-300 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] text-base sm:text-lg select-none"
              style={{
                top: `calc(${((item.row + 0.5) / BOARD_ROWS) * 100}% - 12px)`,
                left: `calc(${((item.col + 0.5) / BOARD_COLS) * 100}% - 16px)`,
              }}
            >
              +{item.score}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Dynamic Combo Banner */}
      <AnimatePresence>
        {comboBanner && (
          <motion.div
            key={comboBanner.id}
            initial={{ scale: 0.4, y: 20, opacity: 0, rotate: -6 }}
            animate={{ scale: 1.15, y: -10, opacity: 1, rotate: 0 }}
            exit={{ scale: 1.3, opacity: 0 }}
            transition={{ duration: 0.5, ease: 'backOut' }}
            className="absolute z-50 pointer-events-none flex flex-col items-center justify-center px-6 py-3 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-2xl border-2 border-white/80"
          >
            <span className="text-2xl sm:text-3xl font-black tracking-wider drop-shadow-md text-yellow-100">
              {comboBanner.text}
            </span>
            {comboBanner.subtext && (
              <span className="text-xs sm:text-sm font-semibold text-white/95 mt-0.5 tracking-wide">
                {comboBanner.subtext} · {comboBanner.comboCount}x 連鎖
              </span>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
