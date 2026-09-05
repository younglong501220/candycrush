import React from 'react';
import { X, Sparkles, Zap, ArrowRight, HelpCircle } from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-amber-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto bg-gradient-to-b from-amber-50 to-orange-50 rounded-3xl p-5 shadow-2xl border-4 border-amber-200 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-amber-200/80 mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-200/80 text-amber-900">
              <HelpCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-black text-amber-950">玩法與特殊糖果圖解</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-amber-200/60 text-amber-900 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Guide */}
        <div className="flex flex-col gap-3 text-xs sm:text-sm text-amber-950">
          {/* Operation */}
          <div className="bg-white/80 rounded-2xl p-3 border border-amber-200/70 shadow-sm">
            <h4 className="font-black text-amber-900 mb-1 flex items-center gap-1.5">
              <span>🎮 操作方式</span>
            </h4>
            <p className="text-stone-700 leading-relaxed text-xs">
              支援<strong>直接滑動 (Swipe)</strong> 或<strong>先點選糖果，再點選相鄰格子</strong>進行交換。若交換後無法達成消除，糖果會彈回原位。
            </p>
          </div>

          {/* Striped Candy */}
          <div className="bg-white/80 rounded-2xl p-3 border border-amber-200/70 shadow-sm flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center text-xl text-white shadow-sm border border-red-300 striped-pattern-h">
              🍓
            </div>
            <div>
              <h4 className="font-black text-rose-800">條紋糖果（4 顆連線）</h4>
              <p className="text-stone-700 text-xs mt-0.5 leading-relaxed">
                四顆同色連線時生成。觸發消除時，會發射光束<strong>消滅整行或整列</strong>所有糖果！
              </p>
            </div>
          </div>

          {/* Wrapped Candy */}
          <div className="bg-white/80 rounded-2xl p-3 border border-amber-200/70 shadow-sm flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center text-xl text-white shadow-sm border-2 border-white/80">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-black text-purple-800">包裝糖果（L 或 T 型 5 顆）</h4>
              <p className="text-stone-700 text-xs mt-0.5 leading-relaxed">
                十字或轉角連線時生成。消除時引爆<strong>周圍 3x3 九宮格</strong>震撼消除！
              </p>
            </div>
          </div>

          {/* Color Bomb */}
          <div className="bg-white/80 rounded-2xl p-3 border border-amber-200/70 shadow-sm flex items-start gap-3">
            <div className="w-11 h-11 shrink-0 rounded-full bg-neutral-900 border-2 border-amber-400 flex items-center justify-center text-xl shadow-md disco-ball-glow">
              <Sparkles className="w-5 h-5 text-yellow-300" />
            </div>
            <div>
              <h4 className="font-black text-amber-800">彩虹炸彈（直線 5 顆連線）</h4>
              <p className="text-stone-700 text-xs mt-0.5 leading-relaxed">
                五顆同色連線生成！將它與任意相鄰糖果交換，會<strong>消除全場所有該顏色的糖果</strong>！
              </p>
            </div>
          </div>

          {/* Combos */}
          <div className="bg-gradient-to-r from-amber-100 to-pink-100 rounded-2xl p-3 border border-amber-300/80 shadow-sm">
            <h4 className="font-black text-amber-950 mb-1">🌟 特殊糖果互換絕招</h4>
            <ul className="list-disc list-inside text-xs text-amber-900 space-y-1">
              <li><strong>條紋 + 條紋</strong>：同時消滅整列與整行（十字大消除）！</li>
              <li><strong>彩虹炸彈 + 條紋</strong>：場上同色糖果全部變成條紋糖並同時發射！</li>
              <li><strong>彩虹炸彈 + 彩虹炸彈</strong>：全螢幕糖果全部消除！</li>
            </ul>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="mt-4 w-full py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm shadow-md transition-all active:scale-98 cursor-pointer"
        >
          我瞭解了，開始遊玩
        </button>
      </div>
    </div>
  );
};
