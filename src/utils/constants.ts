import { CandyColor, LevelConfig } from '../types';

export const BOARD_ROWS = 8;
export const BOARD_COLS = 8;

export interface CandyVisualInfo {
  color: CandyColor;
  name: string;
  emoji: string;
  bgGradient: string;
  borderColor: string;
  shadowColor: string;
  textColor: string;
  shape: 'circle' | 'square' | 'lozenge' | 'triangle' | 'droplet' | 'hex';
}

export const CANDY_VISUALS: Record<CandyColor, CandyVisualInfo> = {
  red: {
    color: 'red',
    name: '草莓軟糖',
    emoji: '🍓',
    bgGradient: 'from-rose-500 via-red-500 to-rose-600',
    borderColor: 'border-red-300',
    shadowColor: 'rgba(239, 68, 68, 0.4)',
    textColor: 'text-red-100',
    shape: 'circle',
  },
  orange: {
    color: 'orange',
    name: '香橙硬糖',
    emoji: '🍊',
    bgGradient: 'from-amber-400 via-orange-500 to-orange-600',
    borderColor: 'border-orange-300',
    shadowColor: 'rgba(249, 115, 22, 0.4)',
    textColor: 'text-orange-100',
    shape: 'lozenge',
  },
  yellow: {
    color: 'yellow',
    name: '檸檬甘露',
    emoji: '🍋',
    bgGradient: 'from-yellow-300 via-amber-400 to-yellow-500',
    borderColor: 'border-yellow-200',
    shadowColor: 'rgba(234, 179, 8, 0.4)',
    textColor: 'text-amber-900',
    shape: 'droplet',
  },
  green: {
    color: 'green',
    name: '薄荷脆糖',
    emoji: '🍏',
    bgGradient: 'from-emerald-400 via-green-500 to-emerald-600',
    borderColor: 'border-green-300',
    shadowColor: 'rgba(34, 197, 94, 0.4)',
    textColor: 'text-emerald-100',
    shape: 'square',
  },
  blue: {
    color: 'blue',
    name: '藍莓果凍',
    emoji: '🫐',
    bgGradient: 'from-sky-400 via-blue-500 to-blue-600',
    borderColor: 'border-blue-300',
    shadowColor: 'rgba(59, 130, 246, 0.4)',
    textColor: 'text-blue-100',
    shape: 'hex',
  },
  purple: {
    color: 'purple',
    name: '葡萄紫糖',
    emoji: '🍇',
    bgGradient: 'from-fuchsia-500 via-purple-500 to-violet-600',
    borderColor: 'border-purple-300',
    shadowColor: 'rgba(168, 85, 247, 0.4)',
    textColor: 'text-purple-100',
    shape: 'triangle',
  },
};

export const ALL_COLORS: CandyColor[] = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];

export const LEVELS: LevelConfig[] = [
  {
    level: 1,
    title: '第一關：甜蜜啟程',
    targetScore: 1200,
    moves: 20,
    description: '熟悉基礎三消！達成 1,200 分即可過關。',
    colorsCount: 5,
    starScores: [1200, 2400, 3600],
  },
  {
    level: 2,
    title: '第二關：條紋風暴',
    targetScore: 2500,
    moves: 22,
    description: '四顆連線合成條紋糖，消除整行或整列！',
    colorsCount: 5,
    starScores: [2500, 4500, 6500],
  },
  {
    level: 3,
    title: '第三關：彩虹奇境',
    targetScore: 4200,
    moves: 20,
    description: '五連成彩虹炸彈！交換任意糖果消除同色全部糖果。',
    colorsCount: 6,
    starScores: [4200, 7000, 10000],
  },
  {
    level: 4,
    title: '第四關：雙重連鎖',
    targetScore: 6000,
    moves: 22,
    description: '嘗試特殊糖果互換，引發超壯觀的大範圍爆炸！',
    colorsCount: 6,
    starScores: [6000, 10000, 15000],
  },
  {
    level: 5,
    title: '第五關：糖果大師',
    targetScore: 8888,
    moves: 24,
    description: '極致連鎖挑戰！發揮連鎖 Combo 衝向最高榮耀！',
    colorsCount: 6,
    starScores: [8888, 14000, 20000],
  },
];

export const COMBO_PRAISES = [
  { minCombo: 1, text: 'Sweet!', subtext: '甜蜜消除', color: 'from-amber-400 to-pink-500' },
  { minCombo: 2, text: 'Tasty!', subtext: '美味可口', color: 'from-pink-500 to-rose-500' },
  { minCombo: 3, text: 'Delicious!', subtext: '風味絕佳', color: 'from-purple-500 to-indigo-500' },
  { minCombo: 4, text: 'Divine!', subtext: '妙不可言', color: 'from-cyan-400 to-blue-600' },
  { minCombo: 5, text: 'Sugar Crush!', subtext: '糖果粉碎狂歡！', color: 'from-amber-300 via-rose-500 to-purple-600' },
];
