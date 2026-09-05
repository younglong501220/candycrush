import React, { useEffect } from 'react';
import { GameStatus, LevelConfig } from '../types';
import { Award, ChevronRight, Play, RotateCcw, Star, Trophy, XCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LevelModalProps {
  status: GameStatus;
  score: number;
  levelConfig: LevelConfig;
  unusedMoves: number;
  bonusScore: number;
  hasNextLevel: boolean;
  onNextLevel: () => void;
  onRestartLevel: () => void;
}

export const LevelModal: React.FC<LevelModalProps> = ({
  status,
  score,
  levelConfig,
  unusedMoves,
  bonusScore,
  hasNextLevel,
  onNextLevel,
  onRestartLevel,
}) => {
  const [s1, s2, s3] = levelConfig.starScores;
  const starsEarned = score >= s3 ? 3 : score >= s2 ? 2 : score >= s1 ? 1 : 0;
  const isWon = status === 'won';
  const isLost = status === 'lost';

  useEffect(() => {
    if (isWon) {
      // Trigger festive confetti
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb923c', '#facc15', '#4ade80', '#38bdf8', '#c084fc'],
      });
    }
  }, [isWon]);

  if (!isWon && !isLost) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-6 shadow-2xl border-4 border-amber-200 text-center flex flex-col items-center">
        {isWon ? (
          <>
            {/* Victory Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 flex items-center justify-center shadow-lg border-2 border-white -mt-10 mb-2">
              <Trophy className="w-9 h-9 text-amber-900" />
            </div>

            <h2 className="text-2xl font-black text-amber-950 mt-1">關卡過關！</h2>
            <p className="text-xs text-amber-700 font-semibold mb-4">{levelConfig.title}</p>

            {/* Stars Rating */}
            <div className="flex items-center justify-center gap-2 mb-5">
              {[1, 2, 3].map((starIdx) => {
                const filled = starIdx <= starsEarned;
                return (
                  <div
                    key={starIdx}
                    className={`transition-all duration-300 transform ${
                      filled ? 'scale-110 text-amber-400 drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]' : 'text-stone-300 opacity-40'
                    }`}
                  >
                    <Star className={`w-10 h-10 ${filled ? 'fill-amber-400' : 'fill-stone-300'}`} />
                  </div>
                );
              })}
            </div>

            {/* Score Breakdown Box */}
            <div className="w-full bg-white/80 rounded-2xl p-3.5 mb-5 border border-amber-200/70 shadow-sm flex flex-col gap-1.5 text-xs text-amber-900">
              <div className="flex justify-between font-semibold">
                <span>最終得分</span>
                <span className="font-bold font-mono text-sm text-amber-950">{score.toLocaleString()} 分</span>
              </div>
              {unusedMoves > 0 && (
                <div className="flex justify-between text-amber-700">
                  <span>剩餘步數獎勵 ({unusedMoves} 步)</span>
                  <span className="font-semibold text-emerald-600">+{bonusScore.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t border-amber-200/50 my-0.5" />
              <div className="flex justify-between text-stone-600">
                <span>過關目標</span>
                <span>{levelConfig.targetScore.toLocaleString()} 分</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="w-full flex flex-col gap-2.5">
              {hasNextLevel ? (
                <button
                  id="next-level-btn"
                  onClick={onNextLevel}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
                >
                  進入下一關
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="py-2 px-3 rounded-xl bg-amber-100 text-amber-900 font-bold text-xs mb-1">
                  🎉 恭喜通關全部關卡！您是真正的糖果大師！
                </div>
              )}

              <button
                id="replay-level-btn"
                onClick={onRestartLevel}
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-amber-50 text-amber-900 font-bold text-sm border border-amber-300 shadow-sm flex items-center justify-center gap-1.5 transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                再玩一次本關
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Defeat Badge */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-400 flex items-center justify-center shadow-lg border-2 border-white -mt-10 mb-2">
              <XCircle className="w-9 h-9 text-white" />
            </div>

            <h2 className="text-2xl font-black text-amber-950 mt-1">步數已用盡！</h2>
            <p className="text-xs text-amber-700 font-semibold mb-4">差一點就達標了，別氣餒！</p>

            {/* Score Box */}
            <div className="w-full bg-white/80 rounded-2xl p-4 mb-5 border border-amber-200/70 shadow-sm flex flex-col gap-2 text-xs text-amber-900">
              <div className="flex justify-between items-baseline">
                <span>當前得分</span>
                <span className="font-bold font-mono text-base text-rose-600">{score.toLocaleString()} 分</span>
              </div>
              <div className="flex justify-between items-baseline text-stone-600">
                <span>目標分數</span>
                <span className="font-mono text-sm">{levelConfig.targetScore.toLocaleString()} 分</span>
              </div>
              <div className="w-full bg-amber-100 h-2 rounded-full overflow-hidden mt-1">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${Math.min(100, Math.round((score / levelConfig.targetScore) * 100))}%` }}
                />
              </div>
            </div>

            <button
              id="retry-level-btn"
              onClick={onRestartLevel}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-black text-base shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 transition-all hover:scale-102 active:scale-98 cursor-pointer"
            >
              <RotateCcw className="w-5 h-5" />
              重新挑戰
            </button>
          </>
        )}
      </div>
    </div>
  );
};
